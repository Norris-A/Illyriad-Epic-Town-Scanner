// Userscript entry point. Wires capture -> panel -> worker.
// __WORKER_SOURCE__ is replaced at build time by build.mjs with the bundled
// worker code as a string literal.

import { probeInPageData, installInterceptor, getLatestPayload, clearPayload } from './capture.js';
import { createPanel, toCsv } from './panel.js';
import { DEFAULT_SETTINGS } from './constants.js';

/* global __WORKER_SOURCE__ */
const workerUrl = URL.createObjectURL(
  new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }),
);

// The settings form owns the live values; this is only what the last scan ran
// with. In memory for the session, never written to disk.
let settings = { ...DEFAULT_SETTINGS };
let lastResults = [];

const hits = probeInPageData();
if (hits.length) {
  console.info('[sov-scanner] in-page map data found at:', hits.map((h) => h.source).join(', '));
} else {
  installInterceptor();
}

const panel = createPanel({
  onScan: runScan,
  onExport: () => {
    if (!lastResults.length) return;
    const blob = new Blob([toCsv(lastResults)], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sov-sites.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  },
});

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
    const excluded = Object.entries(msg.excluded)
      .map(([k, v]) => `${k} ${v}`).join(', ');
    panel.renderResults(
      msg.results,
      `Centre ${payload.x}|${payload.y}, zoom ${payload.zoom}, ` +
      `${2 * payload.zoom + 1}×${2 * payload.zoom + 1}, ${msg.scanned} tiles, ` +
      `${msg.results.length} candidates. Excluded: ${excluded || 'none'}.`,
    );
    panel.renderIncomplete(msg.incomplete);
    panel.setStatus('');
    worker.terminate();
    // PRD §1.2: nothing is retained across views.
    clearPayload();
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
