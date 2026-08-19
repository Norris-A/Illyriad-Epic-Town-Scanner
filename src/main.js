// Userscript entry point. Wires capture -> panel -> worker.
// __WORKER_SOURCE__ is replaced at build time by build.mjs with the bundled
// worker code as a string literal.

import { probeInPageData, installInterceptor, getLatestPayload } from './capture.js';
import { createPanel, csvFile, csvFilename } from './panel.js';
import { createSettingsStore } from './settings-store.js';
import { DEFAULT_SETTINGS } from './constants.js';

/* global __WORKER_SOURCE__ */
const workerUrl = URL.createObjectURL(
  new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }),
);

// The settings form owns the live values; this is only what the last scan ran
// with.
let settings = { ...DEFAULT_SETTINGS };
let lastResults = [];

// Settings persist in this browser's local storage. Nothing else is stored.
const store = createSettingsStore();
const restored = store.load();

const hits = probeInPageData();
if (hits.length) {
  console.info('[sov-scanner] in-page map data found at:', hits.map((h) => h.source).join(', '));
} else {
  installInterceptor();
}

// Every keystroke fires a change; one write per burst of typing is enough.
let saveTimer = null;
function saveSoon(s) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => panel.setStoreNote(store.save(s)), 250);
}

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
  set settings(v) { panel.setSettings({ ...DEFAULT_SETTINGS, ...v }); },
  probeInPageData,
};
