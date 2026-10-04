// Reads the map data the game has already loaded; never makes a request.
//
// The client keeps it in window.mapData and merges every pan and zoom into it:
// `data` holds every tile loaded since the World Map was entered, while x, y and
// zoom describe the view on screen now. Reads are cut down to that view.

import { onScreen } from './payload.js';

// window.mapData is the one the client uses; the rest are guesses in case an
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

/** The client's map data, or null if no known global holds any. */
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
 * The client's map data cut to the tiles on screen. Null when there is none, or
 * when it does not say where the screen is.
 */
export function getLatestPayload() {
  return onScreen(readInPageData());
}

/**
 * Call `onLoaded` once the client's map data shows `view`, checked after each
 * of the client's requests completes (jQuery's `ajaxComplete`). Returns a
 * function that stops waiting, or null when the page has no jQuery.
 */
export function whenViewLoaded(view, onLoaded) {
  const $ = window.jQuery;
  if (typeof $ !== 'function') return null;
  const stop = () => $(document).off('ajaxComplete', onLoad);
  function onLoad() {
    const p = readInPageData();
    if (p?.x !== view.x || p.y !== view.y || p.zoom !== view.zoom) return;
    stop();
    onLoaded();
  }
  $(document).on('ajaxComplete', onLoad);
  return stop;
}

/** Which globals hold map data, for window.__sovScanner.probeInPageData(). */
export function probeInPageData() {
  const hits = [];
  for (const n of IN_PAGE_NAMES) {
    try {
      if (looksLikeMapPayload(window[n])) hits.push({ source: `window.${n}`, value: window[n] });
    } catch (_) { /* cross-origin or getter throw — ignore */ }
  }
  return hits;
}
