// Passive observation of map payloads the game has ALREADY requested.
// This module is a reader, never a requester. It must contain no
// fetch/XHR/WebSocket construction of its own — only wrappers that observe.
//
// Before relying on the interceptor, probeInPageData() checks whether the client
// already exposes parsed map data somewhere reachable. If it does, prefer that:
// strictly less invasive than patching network primitives.

let latestPayload = null;

export function getLatestPayload() {
  return latestPayload;
}

/** Cleared on Scan, replaced on every new map response. Never persisted. */
export function clearPayload() {
  latestPayload = null;
}

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

function accept(obj) {
  if (looksLikeMapPayload(obj)) {
    latestPayload = obj;
    return true;
  }
  return false;
}

/**
 * Walks a shortlist of plausible in-page globals and the
 * mapSVG element for already-parsed map data.
 *
 * The candidate names are guesses — run this in the console on a live map and
 * report what it finds before writing any more of the interceptor.
 */
export function probeInPageData() {
  const hits = [];
  const names = ['mapData', 'MapData', 'gameMap', 'Map', 'worldMap', 'lastMapResponse', 'tiles'];
  for (const n of names) {
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
  if (hits.length) accept(hits[0].value);
  return hits;
}

/** Fallback: observe responses to requests the game made on the user's behalf. */
export function installInterceptor() {
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__sovUrl = url;
    return origOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', () => {
      try {
        const text = this.responseType === '' || this.responseType === 'text'
          ? this.responseText
          : null;
        if (text && text.includes('"zoom"')) accept(JSON.parse(text));
        else if (this.responseType === 'json') accept(this.response);
      } catch (_) { /* not our payload */ }
    });
    return origSend.apply(this, args);
  };

  const origFetch = window.fetch;
  if (typeof origFetch === 'function') {
    window.fetch = function (...args) {
      // Pass through untouched; only the response is observed, and via a clone
      // so the game's own consumer is unaffected.
      return origFetch.apply(this, args).then((res) => {
        try {
          const ct = res.headers.get('content-type') ?? '';
          if (ct.includes('json')) {
            res.clone().json().then(accept).catch(() => {});
          }
        } catch (_) { /* ignore */ }
        return res;
      });
    };
  }
}
