// Persisting the settings form between sessions. Everything but the storage
// adapter is DOM-free, so the load path is testable under Node.
//
// Loading always yields a complete settings object: a stored value is a
// suggestion, re-read through the same validators the form uses, so a blob
// written by an older build cannot leave the tool unable to scan.

import { DEFAULT_SETTINGS } from './constants.js';
import {
  SETTINGS_FIELDS,
  clampNumber,
  validatePlots,
  parseMilsovStructure,
  parseRpCalibration,
  parseResourceBoosters,
  parseResourceCalibration,
} from './panel.js';

/** One key per origin. The suffix is the envelope's shape, not the tool's. */
export const STORAGE_KEY = 'illyriad-sov-scanner.settings';

/** Bumped only if the envelope around `settings` changes. */
export const STORAGE_VERSION = 1;

/**
 * Coerce anything at all into a complete settings object, reading each field by
 * its declared type through the same parser the form uses. The output is built
 * from SETTINGS_FIELDS rather than copied from the input, so unknown keys never
 * reach it and missing ones take their defaults.
 *
 * @param {*} raw anything, including null or a blob from an older build
 * @returns {object} a full settings object
 */
export function sanitizeSettings(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  for (const f of SETTINGS_FIELDS) {
    const v = src[f.key];
    const fallback = DEFAULT_SETTINGS[f.key];
    switch (f.type) {
      case 'checkbox':
        out[f.key] = v === undefined ? !!fallback : !!v;
        break;
      case 'select': {
        // An unselectable value would leave the <select> showing its first
        // option, so the form would disagree with what the scan runs.
        const known = f.options.some((o) => String(o.value) === String(v));
        out[f.key] = known ? (f.parse === 'number' ? Number(v) : String(v)) : fallback;
        break;
      }
      case 'plots': {
        // An allocation that no longer sums to 25 would open the form with Scan
        // disabled and no edit of the user's to undo.
        const r = validatePlots(v);
        out.plots = r.ok ? r.plots : { ...fallback };
        break;
      }
      case 'milsov':
        out.milsovStructure = parseMilsovStructure(v);
        break;
      case 'calibration':
        out.rpCalibration = parseRpCalibration(v?.observedRpPerHour, v?.atTax);
        break;
      case 'boosters':
        out.resourceBoosters = parseResourceBoosters(v);
        break;
      case 'resourceCalibration':
        out.resourceCalibration = parseResourceCalibration({
          observed: v?.observedPerHour,
          atTax: v?.atTax,
          plots: v?.plots,
          booster: v?.booster,
        });
        break;
      default:
        out[f.key] = clampNumber(v, { ...f, fallback: f.fallback ?? fallback ?? 0 });
    }
  }
  return out;
}

/** What to tell the user about a stored blob written by a different build. */
function driftNote(stored) {
  const declared = SETTINGS_FIELDS.map((f) => f.key);
  const storedKeys = Object.keys(stored);
  const added = declared.filter((k) => !storedKeys.includes(k));
  const gone = storedKeys.filter((k) => !declared.includes(k));
  if (!added.length && !gone.length) return '';
  const parts = [];
  if (added.length) parts.push(`${added.length} new setting${added.length > 1 ? 's are' : ' is'} at its default`);
  if (gone.length) parts.push(`${gone.length} no longer exist${gone.length > 1 ? '' : 's'}`);
  return `Settings restored from an older build — ${parts.join(', ')}.`;
}

export function encodeSettings(settings) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    settings: sanitizeSettings(settings),
  });
}

/**
 * Read a stored string back.
 *
 * @param {string|null} text
 * @returns {{settings: object|null, note: string}} settings is null only when
 *   nothing was stored — the caller's "first run". `note` is what to show the
 *   user, and is empty when the load was clean.
 */
export function decodeSettings(text) {
  if (text === null || text === undefined || text === '') return { settings: null, note: '' };
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { settings: sanitizeSettings({}), note: 'Saved settings were unreadable — defaults restored.' };
  }
  // A bare settings object is accepted alongside the envelope, so a blob
  // hand-edited in devtools still loads.
  const body = parsed?.settings ?? parsed;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { settings: sanitizeSettings({}), note: 'Saved settings were unreadable — defaults restored.' };
  }
  return { settings: sanitizeSettings(body), note: driftNote(body) };
}

/** A storage that keeps nothing, for when the real one is unavailable. */
export function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

/**
 * localStorage if the page has one we can actually write to, else null. Some
 * privacy settings make the property itself throw, so it is probed rather than
 * assumed.
 */
export function defaultStorage() {
  try {
    const ls = globalThis.localStorage;
    const probe = `${STORAGE_KEY}.probe`;
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return null;
  }
}

/**
 * The store main.js talks to.
 *
 * @param {object|null} [storage] anything with getItem/setItem/removeItem
 * @returns {{available: boolean, load: function, save: function, clear: function}}
 *   `load` never throws and never returns a partial object; `save` returns a
 *   note when it could not write, and '' when it did.
 */
export function createSettingsStore(storage = defaultStorage()) {
  const unavailable = !storage;
  const store = storage ?? memoryStorage();
  return {
    available: !unavailable,
    load() {
      if (unavailable) {
        return {
          settings: sanitizeSettings({}),
          note: 'This browser is not allowing local storage, so settings last for this session only.',
        };
      }
      try {
        return decodeSettings(store.getItem(STORAGE_KEY));
      } catch {
        return { settings: sanitizeSettings({}), note: 'Saved settings could not be read — defaults restored.' };
      }
    },
    save(settings) {
      if (unavailable) return '';   // already said so once, on load
      try {
        store.setItem(STORAGE_KEY, encodeSettings(settings));
        return '';
      } catch {
        return 'Settings could not be saved — this browser refused the write.';
      }
    },
    clear() {
      try {
        store.removeItem(STORAGE_KEY);
      } catch { /* nothing stored is the state we wanted anyway */ }
    },
  };
}
