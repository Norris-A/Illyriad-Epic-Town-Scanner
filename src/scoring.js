// Pure scoring engine — PRD §3.4-§3.6. No DOM, no network, no globals.
// This file is imported by both the Web Worker and the Node test suite; keep it
// free of anything that only exists in one of those environments.

import {
  PRODUCTION_BASE,
  FARM_YIELD_L20,
  GOLD_PER_TAX_POP,
  CLAIM_RP_PER_LEVEL_DISTANCE,
  CLAIM_GOLD_PER_LEVEL_DISTANCE,
  CHANCERY_FACTOR,
  FOOD_CLAIM_LEVEL,
  MILSOV_UPKEEP_BY_LEVEL,
  CITY_PROFILES,
  FLOUR_MILL_L20,
  NATURES_BOUNTY_BY_RETREATS,
  FAMINE_MANAGEMENT,
  SOIL_ENRICHMENT,
  ALLEMBINE_RP_PER_LIBRARY_LEVEL,
  OVERFLOWING_INSIGHT_FACTOR,
  LIBRARY_BASE_RP_L20,
} from './constants.js';

// --- Derived city figures (mechanics §4.1, §4.2, §6) ------------------------

/** K = F_city * Y_farm / 100 — food per percentage point. 7 food -> 140.98. */
export function computeK(foodPlots) {
  return (foodPlots * FARM_YIELD_L20) / 100;
}

/** B_other — additive non-tax, non-sovereignty food bonus points. */
export function computeBOther(s) {
  let b = s.otherFoodBonus ?? 0;
  if (s.flourMill) b += FLOUR_MILL_L20;
  if (s.naturesBounty) {
    const retreats = Math.min(s.geomancerRetreats ?? 0, 4);
    b += NATURES_BOUNTY_BY_RETREATS[retreats];
  }
  if (s.isCapital) {
    if ((s.cityCount ?? 1) >= 10) b += FAMINE_MANAGEMENT;
    if ((s.cityCount ?? 1) >= 30) b += SOIL_ENRICHMENT;
  }
  return b;
}

/** C — city population, which equals total food consumption (mechanics §5.1). */
export function computeConsumption(s) {
  return s.cityConsumptionOverride ?? CITY_PROFILES[s.cityProfile] ?? CITY_PROFILES.standard;
}

/**
 * R_ref — research points per hour at 0 tax before the (125-T) multiplier.
 * Calibration beats the table: mechanics §6 gives R_ref = observed * 100/(125-T).
 */
export function computeRRef(s) {
  const cal = s.rpCalibration;
  if (cal && cal.observedRpPerHour > 0) {
    return (cal.observedRpPerHour * 100) / (PRODUCTION_BASE - cal.atTax);
  }
  let base = LIBRARY_BASE_RP_L20;
  // [?] mechanics open item 3: whether Allembine scales with (125-T). Treated
  // here as part of R_ref, i.e. it does scale.
  if (s.allembine) base += ALLEMBINE_RP_PER_LIBRARY_LEVEL * (s.libraryLevel ?? 20);
  return s.overflowingInsight ? base * OVERFLOWING_INSIGHT_FACTOR : base;
}

// --- Claim costs (mechanics §5.2) ------------------------------------------

export function distance(dx, dy) {
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Upkeep for one claim. Gold is exactly 10x RP.
 * [?] mechanics open item 7: the game's rounding point is unconfirmed; exact
 * float is used here and rounded only at the knapsack weight (PRD open item 4).
 */
export function claimUpkeep(d, level, chancery) {
  const f = chancery ? CHANCERY_FACTOR : 1;
  return {
    rp: CLAIM_RP_PER_LEVEL_DISTANCE * level * d * f,
    gold: CLAIM_GOLD_PER_LEVEL_DISTANCE * level * d * f,
  };
}

// --- The three ceilings (PRD §3.4) -----------------------------------------

/** T_food = 125 + B_other + S_food - C/K */
export function tFood({ bOther, sFood, consumption, k }) {
  return PRODUCTION_BASE + bOther + sFood - consumption / k;
}

/** T_rp = 125 - 100 * U_RP / R_ref */
export function tRp({ uRp, rRef }) {
  return PRODUCTION_BASE - (100 * uRp) / rRef;
}

/**
 * T_res — per-resource ceiling from military sovereignty structure upkeep.
 *
 * BLOCKED: mechanics open item 12 — per-plot yields and booster percentages for
 * wood/clay/iron/stone are not recorded, so basic resource production cannot be
 * computed. Returns Infinity (non-binding) when no milsov is requested, which
 * is the only case PRD §7 item 6 says is unaffected. When milsov IS requested
 * this returns a flagged, indicative figure — do not present it as reliable.
 */
export function tRes({ milsovAssignments, plots }) {
  if (!milsovAssignments || milsovAssignments.length === 0) {
    return { ceiling: Infinity, indicative: false, binding: null };
  }
  const upkeep = milsovAssignments.reduce(
    (sum, a) => sum + (MILSOV_UPKEEP_BY_LEVEL[a.level] ?? 0),
    0,
  );
  // TODO(mechanics open item 12): replace PLACEHOLDER_YIELD with measured
  // per-plot yield at L20 once available. Until then this is indicative only.
  const PLACEHOLDER_YIELD = 2014;
  let worst = Infinity;
  let binding = null;
  for (const res of ['wood', 'clay', 'iron', 'stone']) {
    const production = plots[res] * PLACEHOLDER_YIELD;
    if (production <= 0) return { ceiling: -Infinity, indicative: true, binding: res };
    // production * (125 - T)/100 >= upkeep  =>  T <= 125 - 100*upkeep/production
    const ceiling = PRODUCTION_BASE - (100 * upkeep) / production;
    if (ceiling < worst) {
      worst = ceiling;
      binding = res;
    }
  }
  return { ceiling: worst, indicative: true, binding };
}

/** T_max = min(100, T_food, T_rp, T_res), with the binding ceiling named. */
export function tMax({ food, rp, res }) {
  const candidates = [
    { name: 'cap', value: 100 },
    { name: 'food', value: food },
    { name: 'rp', value: rp },
    { name: 'res', value: res },
  ];
  let best = candidates[0];
  for (const c of candidates) if (c.value < best.value) best = c;
  return { value: best.value, binding: best.name };
}

export function goldNet({ tax, consumption, uGold }) {
  return GOLD_PER_TAX_POP * tax * consumption - uGold;
}

// --- The optimisation (PRD §3.5) -------------------------------------------

/**
 * 0/1 knapsack over food candidates. Weight = round(cost_RP), value = food.
 * Returns, for every RP spend from 0..budget, the best achievable S_food, plus
 * the chosen set at each spend level.
 *
 * `maxItems` adds a count dimension. It only binds when there are more
 * candidates than buildings allowed (PRD §3.5 building cap), which at R_claim=2
 * (24 candidates, cap 20) is rare — so the cheap 1-D DP runs unless needed.
 */
export function knapsack(candidates, budget, maxItems = Infinity) {
  const needCountDim = candidates.length > maxItems;
  const width = budget + 1;
  const best = new Float64Array(width);
  // Bitset of chosen items per (item, spend) so the winning set is recoverable.
  const bytesPerItem = width;
  const took = new Uint8Array(candidates.length * bytesPerItem);

  if (!needCountDim) {
    for (let i = 0; i < candidates.length; i++) {
      const w = candidates[i].weight;
      const v = candidates[i].food;
      if (w > budget) continue;
      for (let cap = budget; cap >= w; cap--) {
        const alt = best[cap - w] + v;
        if (alt > best[cap]) {
          best[cap] = alt;
          took[i * bytesPerItem + cap] = 1;
        }
      }
    }
    return { best, took, bytesPerItem, countLimited: false };
  }

  // Count-limited variant: exact, but O(items * budget * maxItems). Only
  // reached when the building cap actually binds.
  const dp = [];
  for (let c = 0; c <= maxItems; c++) dp.push(new Float64Array(width).fill(-Infinity));
  dp[0].fill(0);
  const choice = [];
  for (let i = 0; i < candidates.length; i++) {
    choice.push(new Uint8Array((maxItems + 1) * width));
  }
  for (let i = 0; i < candidates.length; i++) {
    const w = candidates[i].weight;
    const v = candidates[i].food;
    for (let c = maxItems; c >= 1; c--) {
      for (let cap = budget; cap >= w; cap--) {
        const prev = dp[c - 1][cap - w];
        if (prev === -Infinity) continue;
        const alt = prev + v;
        if (alt > dp[c][cap]) {
          dp[c][cap] = alt;
          choice[i][c * width + cap] = 1;
        }
      }
    }
  }
  for (let cap = 0; cap <= budget; cap++) {
    let m = 0;
    for (let c = 0; c <= maxItems; c++) if (dp[c][cap] > m) m = dp[c][cap];
    best[cap] = m;
  }
  return { best, took: null, dp, choice, width, maxItems, countLimited: true };
}

/** Recover the item indices chosen at a given spend level (1-D DP only). */
export function recoverSet(candidates, dpResult, spend) {
  if (dpResult.countLimited) return null; // TODO: recovery for the 2-D variant
  const chosen = [];
  let cap = spend;
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (dpResult.took[i * dpResult.bytesPerItem + cap] === 1) {
      chosen.push(i);
      cap -= candidates[i].weight;
    }
  }
  return chosen.reverse();
}

/**
 * Score one candidate site. `neighbours` are the claimable tiles already
 * filtered per PRD §3.3, each { dx, dy, food, key, i }.
 *
 * Returns the winning plan. T_max may be negative — that is a real answer, not
 * an error. Ranking and the tMin filter are the caller's job (PRD §3.7).
 * Returns null only when there is nothing to evaluate at all.
 */
export function scoreSite({ neighbours, settings }) {
  const s = settings;
  const k = computeK(s.plots.food);
  const bOther = computeBOther(s);
  const consumption = computeConsumption(s);
  const rRef = computeRRef(s);
  const chancery = !!s.chancery;

  // Step 2 (PRD §3.5): reserve milsov on the cheapest tiles by distance.
  const byDistance = neighbours
    .map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) }))
    .sort((a, b) => a.d - b.d);

  const milsovAssignments = [];
  const reserved = new Set();
  for (const quota of s.milsovQuota ?? []) {
    for (let c = 0; c < quota.count; c++) {
      const tile = byDistance.find((t) => !reserved.has(t.idx));
      if (!tile) break; // quota cannot be met — caller flags as a "maybe" site
      reserved.add(tile.idx);
      const up = claimUpkeep(tile.d, quota.level, chancery);
      milsovAssignments.push({ ...tile, level: quota.level, ...up });
    }
  }
  const quotaRequested = (s.milsovQuota ?? []).reduce((n, q) => n + q.count, 0);
  const quotaMet = milsovAssignments.length === quotaRequested;

  const milsovRp = milsovAssignments.reduce((sum, a) => sum + a.rp, 0);
  const milsovGold = milsovAssignments.reduce((sum, a) => sum + a.gold, 0);

  // Step 1 + 3: build the food candidate list and run the knapsack.
  const foodCandidates = byDistance
    .filter((t) => !reserved.has(t.idx) && t.food > 0)
    .map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });

  const budget = Math.max(0, Math.round(rRef * 1.25 - milsovRp));
  const buildingsLeft = Math.max(0, (s.maxBuildings ?? 20) - milsovAssignments.length);
  const dp = knapsack(foodCandidates, budget, buildingsLeft);

  const resCeiling = tRes({ milsovAssignments, plots: s.plots });

  // Step 4: walk the DP frontier.
  let winner = null;
  for (let spend = 0; spend <= budget; spend++) {
    const sFood = dp.best[spend];
    const uRp = spend + milsovRp;
    const t = tMax({
      food: tFood({ bOther, sFood, consumption, k }),
      rp: tRp({ uRp, rRef }),
      res: resCeiling.ceiling,
    });
    // A negative T_max is a real answer — the site cannot feed a city at any
    // tax. Report it and let the caller filter on tMin (PRD §3.7); swallowing
    // it here would also hide "maybe" sites that miss a milsov quota.
    // Gold upkeep tracks RP exactly 10:1 (mechanics §5.2).
    const uGold = uRp * 10;
    const net = goldNet({ tax: t.value, consumption, uGold });
    if (
      !winner ||
      t.value > winner.tMax + 1e-9 ||
      (Math.abs(t.value - winner.tMax) <= 1e-9 &&
        (uRp < winner.uRp - 1e-9 ||
          (Math.abs(uRp - winner.uRp) <= 1e-9 && net > winner.goldNet)))
    ) {
      winner = { tMax: t.value, binding: t.binding, sFood, uRp, uGold, goldNet: net, spend };
    }
  }

  if (!winner) return null;

  const chosenIdx = recoverSet(foodCandidates, dp, winner.spend);
  const tiles = chosenIdx ? chosenIdx.map((i) => foodCandidates[i]) : [];

  return {
    ...winner,
    tiles,
    milsov: milsovAssignments,
    quotaMet,
    milsovGold,
    resIndicative: resCeiling.indicative,
    resBinding: resCeiling.binding,
  };
}
