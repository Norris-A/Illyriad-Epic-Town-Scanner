// Userscript entry point: wires map capture, the panel, the scan worker and the
// map overlay together. __WORKER_SOURCE__ is the bundled worker code, inlined as
// a string by build.mjs.

import { probeInPageData, getLatestPayload, whenViewLoaded } from './capture.js';
import { createPanel, csvFile, csvFilename } from './panel.js';
import { createOverlay } from './overlay.js';
import { createSettingsStore, decodeSettings, STORAGE_KEY } from './settings-store.js';
import { DEFAULT_SETTINGS } from './constants.js';

/* global __WORKER_SOURCE__ */
const workerUrl = URL.createObjectURL(
  new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }),
);

// What the last scan ran with; the form holds the live values.
let settings = { ...DEFAULT_SETTINGS };
let lastResults = [];

const store = createSettingsStore();
const restored = store.load();

// Saves are debounced: every keystroke reports a change.
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

// Flush a pending save before the page goes away. `pagehide` and a hidden
// `visibilitychange` fire however a page ends; `unload` does not, and listening
// for it disables the back/forward cache.
window.addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSave();
});

// Follow settings saved by another game tab, unless an edit here is still
// waiting to be saved: that one is newer and wins.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY || e.newValue === null || unsaved) return;
  const { settings: s } = decodeSettings(e.newValue);
  if (!s) return;
  panel.setSettings(s, { save: false });
  overlay.setEnabled(s.mapOverlay);
  panel.setStoreNote('Settings were changed in another tab; this panel now matches them.');
});

const viewOf = (p) => p && { x: p.x, y: p.y, zoom: p.zoom };

const overlay = createOverlay({
  getView: () => viewOf(getLatestPayload()),
  onPickSite: (x, y) => panel.selectSite(x, y),
  onPickCentre: (x, y) => panel.planAt(x, y),
  onPicking: (armed) => panel.setPicking(armed),
  onNote: (pane, text, tooltip) => panel.setMapNote(pane, text, tooltip),
  whenViewLoaded,
});

const panel = createPanel({
  initialSettings: restored.settings ?? DEFAULT_SETTINGS,
  onSettingsChange: (s) => {
    overlay.setEnabled(s.mapOverlay);
    saveSoon(s);
  },
  onScan: runScan,
  onSelect: (result) => overlay.outline(result),
  onPaneShown: (pane) => overlay.setPane(pane),
  onFocusPlan: (plan, geom) => overlay.showPlan(plan, geom),
  onPickOnMap: () => overlay.togglePick(),
  getPayload: getLatestPayload,
  whenViewLoaded,
  onExport: () => {
    if (!lastResults.length) return;
    const blob = new Blob([csvFile(lastResults)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename();
    // Attached, and revoked a tick later: some browsers ignore a click on a
    // detached anchor, and revoking at once can cancel the download.
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 0);
  },
});

overlay.setEnabled(panel.getSettings().settings.mapOverlay);
if (restored.note) panel.setStoreNote(restored.note);

function runScan() {
  const read = panel.getSettings();
  if (read.errors.length) {
    panel.setStatus(read.errors.join(' '));
    return;
  }
  settings = read.settings;

  const payload = getLatestPayload();
  if (!payload) {
    panel.setStatus('No map data on screen yet. Pan or zoom the map, then Scan.');
    return;
  }

  const view = viewOf(payload);
  // The markers belong to the table this Scan is about to replace.
  overlay.clearTop();
  panel.setStatus('Scanning…');
  const worker = new Worker(workerUrl);

  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'progress') {
      panel.setStatus(`Scanning… ${msg.done}/${msg.total}`);
      return;
    }
    lastResults = msg.results;
    panel.renderResults(msg.results, { ...view, scanned: msg.scanned });
    overlay.showTop(msg.results);
    panel.renderIncomplete(msg.incomplete);
    panel.setStatus('');
    worker.terminate();
  };

  worker.postMessage({ payload, settings });
}

// For console debugging. Writes go through the form, which is what a scan reads.
window.__sovScanner = {
  get settings() { return panel.getSettings().settings; },
  // What a Scan would read now, cut to the screen. The uncut global is window.mapData.
  get payload() { return getLatestPayload(); },
  set settings(v) { panel.setSettings({ ...DEFAULT_SETTINGS, ...v }); },
  probeInPageData,
};
