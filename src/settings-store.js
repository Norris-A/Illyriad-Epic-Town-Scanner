// Saves and restores the City Configuration. Loading always yields a complete
// settings object: stored values go back through the form's own validators, so
// one written by an older build cannot leave the tool unable to scan.

import { DEFAULT_SETTINGS } from './constants.js';
import {
  SETTINGS_FIELDS,
  clampNumber,
  validatePlots,
  parseMilsovStructure,
  parseRpCalibration,
  parseResourceBoosters,
  parseUpkeepBuildings,
  parseResourceMinimums,
  parsePrestige,
} from './panel.js';

export const STORAGE_KEY = 'illyriad-sov-scanner.settings';

/**
 * Bumped only when a stored key is renamed or split. Added and removed keys need
 * no bump: sanitizeSettings keeps, drops and defaults field by field.
 */
export const STORAGE_VERSION = 2;

/**
 * Version -> the settings one version newer, so a renamed key keeps its value.
 * The result is sanitized afterwards, so a step need not validate.
 */
export const MIGRATIONS = {
  // Version 1 had the Chancery as a tick-box; it is now a building count.
  1: ({ chancery, ...rest }) => ({
    ...rest,
    upkeepBuildings: { ...rest.upkeepBuildings, chanceryOfEstates: chancery ? 1 : 0 },
  }),
};

/** Walk a stored settings object from the version it was written at to ours. */
function migrate(body, from) {
  let out = body;
  for (let v = from; v < STORAGE_VERSION; v++) {
    const step = MIGRATIONS[v];
    // No path further: sanitizeSettings salvages what it can.
    if (!step) break;
    out = step(out);
  }
  return out;
}

/**
 * Coerce anything into a complete settings object, each field read by the
 * form's own parser. Unknown keys are dropped and missing ones defaulted.
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
        // An unknown value would leave the <select> showing a different option
        // from the one the scan uses.
        const known = f.options.some((o) => String(o.value) === String(v));
        out[f.key] = known ? (f.parse === 'number' ? Number(v) : String(v)) : fallback;
        break;
      }
      case 'plots': {
        // An allocation that does not sum to 25 would open with Scan disabled.
        const r = validatePlots(v);
        out.plots = r.ok ? r.plots : { ...fallback };
        break;
      }
      case 'milsov':
        out.milsovStructure = parseMilsovStructure(v);
        break;
      case 'calibration':
        out.rpCalibration = parseRpCalibration(v?.observedRpPerHour, v?.atTax, v?.prestige);
        break;
      case 'boosters':
        out.resourceBoosters = parseResourceBoosters(v);
        break;
      case 'upkeepBuildings':
        out.upkeepBuildings = parseUpkeepBuildings(v);
        break;
      case 'prestige':
        out.prestige = parsePrestige(v);
        break;
      case 'minimums':
        out.resourceMinimums = parseResourceMinimums(v);
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
  if (added.length) {
    parts.push(added.length > 1
      ? `${added.length} new settings are at their defaults`
      : '1 new setting is at its default');
  }
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
  const unreadable = () => ({
    settings: sanitizeSettings({}),
    note: 'Saved settings were unreadable — defaults restored.',
  });
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return unreadable();
  }
  // A bare settings object, as hand-edited in devtools, loads too.
  const body = parsed?.settings ?? parsed;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return unreadable();

  // An unversioned blob is hand-written, so it is read as current.
  const version = Number.isInteger(parsed?.version) ? parsed.version : STORAGE_VERSION;
  if (version > STORAGE_VERSION) {
    return {
      settings: sanitizeSettings(body),
      note: 'Settings were saved by a newer build — what it knows and this one does not is at its default here.',
    };
  }
  let migrated;
  try {
    migrated = migrate(body, version);
  } catch {
    // The unmigrated settings still sanitize field by field.
    migrated = body;
  }
  return { settings: sanitizeSettings(migrated), note: driftNote(migrated) };
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
 * localStorage if it can be written to, else null. Some privacy settings make
 * the property itself throw, so it is probed.
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
      } catch { /* ignore */ }
    },
  };
}
