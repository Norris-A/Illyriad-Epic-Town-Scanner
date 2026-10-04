// Web Worker that runs a scan. build.mjs inlines it as a string, started from a
// Blob URL.

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
        // milsovShortfall: no tax down to tMin reaches the minimum military bonus.
        if (plan && !plan.milsovShortfall && plan.tMax >= settings.tMin) {
          // `rs` feeds the panel's Prefill button; `neighbours` lets it re-plan
          // at another tax without a new scan.
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
