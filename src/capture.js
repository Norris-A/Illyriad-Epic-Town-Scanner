// Reading the map view the game has ALREADY loaded.
// This module reads, it never requests: no fetch, XHR or WebSocket of any kind.
//
// The client parks its map view in a page global (window.mapData) and merges each
// pan and zoom into it: what it holds is the union of every view loaded since the
// World Map was last entered, not the one on screen. Its `data` keys therefore
// outrun the viewport, and the tiles behind them age — bounded by leaving the map,
// which starts the accumulation over. Reading that global is a plain memory read of
// data already delivered to the page — no network, no side effects.

// The globals the client is known or plausible to keep its parsed map view in.
// window.mapData is the one this client uses; the rest are guesses in case a client
// update renames it.
const IN_PAGE_NAMES = ['mapData', 'MapData', 'gameMap', 'Map', 'worldMap', 'lastMapResponse', 'tiles'];

function looksLikeMapPayload(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.zoom === 'number' &&
    obj.data &&
    typeof obj.data === 'object' &&
    Object.keys(obj.data).some((k) => k.includes('|'))
  );
}

/**
 * The client's own parsed map data, read from the page fresh each call, or null if
 * no known global (nor the mapSVG element) holds any.
 */
function readInPageData() {
  if (typeof window !== 'undefined') {
    for (const n of IN_PAGE_NAMES) {
      try {
        if (looksLikeMapPayload(window[n])) return window[n];
      } catch (_) { /* cross-origin or getter throw — ignore */ }
    }
  }
  const svg = typeof document !== 'undefined' ? document.getElementById('mapSVG') : null;
  if (svg) {
    for (const prop of Object.keys(svg)) {
      try {
        if (looksLikeMapPayload(svg[prop])) return svg[prop];
      } catch (_) { /* ignore */ }
    }
  }
  return null;
}

/** The payload every Scan and Optimise press reads: every view of the current map visit. */
export function getLatestPayload() {
  return readInPageData();
}

/**
 * Which reachable globals currently hold a map payload. Backs the console probe
 * window.__sovScanner.probeInPageData(), for checking where the client keeps its
 * map data.
 */
export function probeInPageData() {
  const hits = [];
  for (const n of IN_PAGE_NAMES) {
    try {
      if (looksLikeMapPayload(window[n])) hits.push({ source: `window.${n}`, value: window[n] });
    } catch (_) { /* cross-origin or getter throw — ignore */ }
  }
  const svg = document.getElementById('mapSVG');
  if (svg) {
    for (const prop of Object.keys(svg)) {
      try {
        if (looksLikeMapPayload(svg[prop])) hits.push({ source: `mapSVG.${prop}`, value: svg[prop] });
      } catch (_) { /* ignore */ }
    }
  }
  return hits;
}
