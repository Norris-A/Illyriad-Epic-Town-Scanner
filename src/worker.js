// Web Worker entry. Bundled to a string by build.mjs and instantiated from a
// Blob URL — there is no file to load from (PRD §1.2 forbids network requests).

import { scoreSite } from './scoring.js';
import {
  indexPayload,
  extractTowns,
  isCandidateSite,
  neighbourhood,
  parseKey,
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
        if (plan && plan.tMax >= settings.tMin) {
          results.push({ key, ...parseKey(key), ...plan });
        } else if (plan) {
          excluded['below-tmin'] = (excluded['below-tmin'] ?? 0) + 1;
        }
      }
    }

    if (++done % 100 === 0) {
      self.postMessage({ type: 'progress', done, total: keys.length });
    }
  }

  // PRD §3.7 — T_max descending, secondary on Gold_net.
  results.sort((a, b) => b.tMax - a.tMax || b.goldNet - a.goldNet);

  self.postMessage({
    type: 'done',
    results,
    incomplete,
    excluded,
    scanned: keys.length,
  });
};
