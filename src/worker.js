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
  const excluded = {};

  let done = 0;
  for (const key of keys) {
    const tile = payload.data[key];
    const candidate = isCandidateSite(tile, key, idx, settings, towns);
    if (!candidate.ok) {
      excluded[candidate.reason] = (excluded[candidate.reason] ?? 0) + 1;
    } else {
      const neighbours = neighbourhood(payload, key, settings.rClaim, idx, settings);
      if (neighbours === null) {
        incomplete.push({ key, ...parseKey(key) });
        excluded.incomplete = (excluded.incomplete ?? 0) + 1;
      } else {
        const plan = scoreSite({ neighbours, settings });
        if (plan && plan.milsovShortfall) {
          // Counted apart from below-tmin: the site is fine and its tax is fine,
          // it just does not host enough military to be worth the trip.
          excluded['below-milsov'] = (excluded['below-milsov'] ?? 0) + 1;
        } else if (plan && plan.tMax >= settings.tMin) {
          // `rs` travels with the result so the panel's Prefill button can load
          // the site's actual allocation into the settle-plot fields, and
          // `neighbours` so the panel can re-plan the site at any tax the user
          // drags to without asking the worker to run again.
          results.push({ key, ...parseKey(key), rs: parseRs(tile), neighbours, ...plan });
        } else if (plan) {
          excluded['below-tmin'] = (excluded['below-tmin'] ?? 0) + 1;
        }
      }
    }

    if (++done % 100 === 0) {
      self.postMessage({ type: 'progress', done, total: keys.length });
    }
  }

  // T_max descending, secondary on Gold_net.
  results.sort((a, b) => b.tMax - a.tMax || b.goldNet - a.goldNet);

  self.postMessage({
    type: 'done',
    results,
    incomplete,
    excluded,
    scanned: keys.length,
  });
};
