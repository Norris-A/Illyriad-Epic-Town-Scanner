// Web Worker entry. Bundled to a string by build.mjs and instantiated from a
// Blob URL — there is no file to load from, and fetching one would be a request.

import { scoreSite } from './scoring.js';
import {
  indexPayload,
  extractTowns,
  isCandidateSite,
  neighbourhood,
  parseKey,
  parseRs,
} from './payload.js';

self.onmessage = (e) => {
  const { payload, settings } = e.data;
  const idx = indexPayload(payload);
  const towns = extractTowns(payload);

  const keys = Object.keys(payload.data ?? {});
  const results = [];
  const incomplete = [];

  let done = 0;
  for (const key of keys) {
    const tile = payload.data[key];
    if (isCandidateSite(tile, key, idx, settings, towns).ok) {
      const neighbours = neighbourhood(payload, key, settings.rClaim, idx, settings);
      if (neighbours === null) {
        incomplete.push({ key, ...parseKey(key) });
      } else {
        const plan = scoreSite({ neighbours, settings });
        // A milsovShortfall site is dropped even though its tax is fine: it just
        // does not host enough military to be worth the trip.
        if (plan && !plan.milsovShortfall && plan.tMax >= settings.tMin) {
          // `rs` travels with the result so the panel's Prefill button can load
          // the site's actual allocation into the settle-plot fields, and
          // `neighbours` so the panel can re-plan the site at any tax the user
          // drags to without asking the worker to run again.
          results.push({ key, ...parseKey(key), rs: parseRs(tile), neighbours, ...plan });
        }
      }
    }

    if (++done % 100 === 0) {
      self.postMessage({ type: 'progress', done, total: keys.length });
    }
  }

  results.sort((a, b) => b.tMax - a.tMax || b.goldNet - a.goldNet);

  self.postMessage({
    type: 'done',
    results,
    incomplete,
    scanned: keys.length,
  });
};
