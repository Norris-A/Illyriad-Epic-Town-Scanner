// Reading the map view the game has ALREADY loaded.
// This module reads, it never requests: no fetch, XHR or WebSocket of any kind.
//
// The client parks its map view in a page global (window.mapData) and merges each
// pan and zoom into it: its `data` holds every tile loaded since the World Map was
// last entered, while its envelope — x, y and zoom — describes the view on screen
// now. A read cuts `data` down to that view, so nothing panned past long ago is
// ranked. Reading the global is a plain memory read of data already delivered to
// the page — no network, no side effects.

import { onScreen } from './payload.js';

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
 * no known global holds any.
 */
function readInPageData() {
  if (typeof window !== 'undefined') {
    for (const n of IN_PAGE_NAMES) {
      try {
        if (looksLikeMapPayload(window[n])) return window[n];
      } catch (_) { /* cross-origin or getter throw — ignore */ }
    }
  }
  return null;
}

/**
 * The payload every Scan and Optimise press reads: the client's map data, read
 * fresh and cut to the tiles on screen. Null when there is no map data, or when
 * it does not say where the screen is.
 */
export function getLatestPayload() {
  return onScreen(readInPageData());
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
  return hits;
}
