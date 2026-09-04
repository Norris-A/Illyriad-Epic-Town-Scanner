// Userscript entry point. Wires capture -> panel -> worker.
// __WORKER_SOURCE__ is replaced at build time by build.mjs with the bundled
// worker code as a string literal.

import { probeInPageData, getLatestPayload } from './capture.js';
import { createPanel, csvFile, csvFilename } from './panel.js';
import { createSettingsStore, decodeSettings, STORAGE_KEY } from './settings-store.js';
import { DEFAULT_SETTINGS } from './constants.js';

/* global __WORKER_SOURCE__ */
const workerUrl = URL.createObjectURL(
  new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }),
);

// The settings form owns the live values; this is only what the last scan ran
// with.
let settings = { ...DEFAULT_SETTINGS };
let lastResults = [];

// The City Configuration persists in this browser's local storage. The panel's
// own position and collapsed state are kept under their own keys by panel.js, so
// resetting the configuration never moves the panel.
const store = createSettingsStore();
const restored = store.load();

const hits = probeInPageData();
if (hits.length) {
  console.info('[sov-scanner] reading in-page map data live from:', hits.map((h) => h.source).join(', '));
}

// Every keystroke fires a change; one write per burst of typing is enough.
let saveTimer = null;
let unsaved = null;

function flushSave() {
  if (!unsaved) return;
  clearTimeout(saveTimer);
  saveTimer = null;
  const s = unsaved;
  unsaved = null;
  panel.setStoreNote(store.save(s));
}

function saveSoon(s) {
  unsaved = s;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 250);
}

// The debounce is a window in which the tab can be closed, navigated or frozen
// with the last edit still only in the form. `pagehide` and the hidden half of
// `visibilitychange` are the two that fire in every case that ends a page —
// `unload` does not, and listening for it forfeits the back/forward cache.
window.addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSave();
});

// Another tab of the game is the same settings edited twice. `storage` fires
// only in the tabs that did not write, so the later save is the newer intent
// and this one follows it — unless there is an edit here still waiting to be
// written, which is newer still and wins by being saved next.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || e.newValue === null || unsaved) return;
  const { settings: s } = decodeSettings(e.newValue);
  if (!s) return;
  panel.setSettings(s, { save: false });
  panel.setStoreNote('Settings were changed in another tab; this panel now matches them.');
});

const panel = createPanel({
  initialSettings: restored.settings ?? DEFAULT_SETTINGS,
  onSettingsChange: saveSoon,
  onScan: runScan,
  // Read on each Optimise press, against the same payload the last Scan ran on.
  getPayload: getLatestPayload,
  onExport: () => {
    if (!lastResults.length) return;
    const blob = new Blob([csvFile(lastResults)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename();
    // In the document and revoked a tick later: a detached anchor is not
    // clickable in every browser, and revoking in the same turn as the click can
    // cancel the download before it has read the blob.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 0);
  },
});

// A clean restore, and a first run, say nothing.
if (restored.note) panel.setStoreNote(restored.note);

function runScan() {
  // Read the form at the moment of the press, so the last edit always reaches
  // the worker and nothing at all happens between presses.
  const read = panel.getSettings();
  if (read.errors.length) {
    panel.setStatus(read.errors.join(' '));
    return;
  }
  settings = read.settings;

  const payload = getLatestPayload();
  if (!payload) {
    panel.setStatus('No map payload observed yet. Pan or zoom the map, then Scan.');
    return;
  }

  panel.setStatus('Scanning…');
  const worker = new Worker(workerUrl);

  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'progress') {
      panel.setStatus(`Scanning… ${msg.done}/${msg.total}`);
      return;
    }
    lastResults = msg.results;
    // The facts, not the sentence — the panel does the wording.
    panel.renderResults(msg.results, {
      x: payload.x, y: payload.y, zoom: payload.zoom, scanned: msg.scanned,
    });
    panel.renderIncomplete(msg.incomplete);
    panel.setStatus('');
    worker.terminate();
  };

  worker.postMessage({ payload, settings });
}

// Exposed for console tinkering during development only — the settings form is
// the supported route. Writes go through the form so the two cannot disagree:
// runScan reads the form, not this variable.
window.__sovScanner = {
  get settings() { return panel.getSettings().settings; },
  // The last payload, for looking at when the tool reads something out of it
  // wrongly — the block formats are only partly documented.
  get payload() { return getLatestPayload(); },
  set settings(v) { panel.setSettings({ ...DEFAULT_SETTINGS, ...v }); },
  probeInPageData,
};
