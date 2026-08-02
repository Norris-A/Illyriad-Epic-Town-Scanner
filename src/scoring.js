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
  MILSOV_BONUS_PER_LEVEL,
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
 * this returns a flagged, indicative figure — do not present it as reliable,
 * and see scoreSite for why an indicative ceiling never enters T_max.
 *
 * `impossible` marks a resource the settle tile has no plots of: it produces
 * nothing at any tax rate, so the ceiling is genuinely -Infinity rather than
 * merely low. It is reported as a flag because a caller filtering on the number
 * alone would drop the site without ever being able to say why.
 *
 * All four resources are checked even once one has come back impossible, so
 * `binding` always names the worst of them rather than the first bad one.
 */
export function tRes({ milsovAssignments, plots }) {
  const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
  if (!milsovAssignments || milsovAssignments.length === 0) return none;
  // Upkeep is the structure's, so it keys off the building level. The claim's
  // sovereignty level is paid in RP and gold and does not appear here.
  const upkeep = milsovAssignments.reduce(
    (sum, a) => sum + (MILSOV_UPKEEP_BY_LEVEL[a.buildingLevel] ?? 0),
    0,
  );
  // Structures that cost nothing per hour impose no ceiling — including the
  // degenerate case of a level with no entry in the upkeep table.
  if (upkeep <= 0) return none;
  // TODO(mechanics open item 12): replace PLACEHOLDER_YIELD with measured
  // per-plot yield at L20 once available. Until then this is indicative only.
  const PLACEHOLDER_YIELD = 2014;
  let worst = Infinity;
  let binding = null;
  for (const res of ['wood', 'clay', 'iron', 'stone']) {
    const production = plots[res] * PLACEHOLDER_YIELD;
    // production * (125 - T)/100 >= upkeep  =>  T <= 125 - 100*upkeep/production
    const ceiling = production > 0 ? PRODUCTION_BASE - (100 * upkeep) / production : -Infinity;
    if (ceiling < worst) {
      worst = ceiling;
      binding = res;
    }
  }
  return { ceiling: worst, indicative: true, binding, impossible: worst === -Infinity };
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

  if (!needCountDim) {
    // Bitset of chosen items per (item, spend) so the winning set is recoverable.
    const bytesPerItem = width;
    const took = new Uint8Array(candidates.length * bytesPerItem);
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
  // best[cap] is the max over counts; bestCount records which count reached it,
  // ties going to the smaller count.
  const bestCount = new Int32Array(width);
  for (let cap = 0; cap <= budget; cap++) {
    let m = 0;
    let mc = 0;
    for (let c = 0; c <= maxItems; c++) {
      if (dp[c][cap] > m) {
        m = dp[c][cap];
        mc = c;
      }
    }
    best[cap] = m;
    bestCount[cap] = mc;
  }
  return { best, took: null, dp, choice, bestCount, width, maxItems, countLimited: true };
}

/**
 * Recover the item indices chosen at a given spend level.
 *
 * Both DPs mark item i whenever it improves a cell, so a cell may carry marks
 * from several items; the highest-indexed mark set the cell's final value.
 * Scanning items downwards and continuing below each hit is therefore exact —
 * when item i was processed its predecessor cell held the optimum over 0..i-1.
 */
export function recoverSet(candidates, dpResult, spend) {
  const chosen = [];
  let cap = spend;

  if (dpResult.countLimited) {
    const { choice, bestCount, width } = dpResult;
    let count = bestCount[cap];
    for (let i = candidates.length - 1; i >= 0 && count > 0; i--) {
      if (choice[i][count * width + cap] === 1) {
        chosen.push(i);
        cap -= candidates[i].weight;
        count--;
      }
    }
    return chosen.reverse();
  }

  for (let i = candidates.length - 1; i >= 0; i--) {
    if (dpResult.took[i * dpResult.bytesPerItem + cap] === 1) {
      chosen.push(i);
      cap -= candidates[i].weight;
    }
  }
  return chosen.reverse();
}

// --- Milsov level advisory (PRD §3.6) --------------------------------------

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

/** "1x Sov V + 2x Sov III", levels descending. Alternatives keep both levels
 * equal, so one number describes them. */
function describeLevels(levels) {
  const counts = new Map();
  for (const l of levels) counts.set(l, (counts.get(l) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, count]) => `${count}x Sov ${ROMAN[level - 1]}`)
    .join(' + ');
}

/**
 * The requested plan. A building below its claim's sovereignty level is named
 * outright — it is unusual enough to be worth reading back, since it costs
 * claim upkeep that buys no bonus.
 */
function describePlan(entries) {
  const counts = new Map();
  const rank = new Map();
  for (const e of entries) {
    const label = e.buildingLevel === e.sovLevel
      ? `Sov ${ROMAN[e.sovLevel - 1]}`
      : `Sov ${ROMAN[e.sovLevel - 1]} at building level ${e.buildingLevel}`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
    rank.set(label, e.sovLevel * 10 + e.buildingLevel);
  }
  return [...counts.entries()]
    .sort((a, b) => rank.get(b[0]) - rank.get(a[0]))
    .map(([label, count]) => `${count}x ${label}`)
    .join(' + ');
}

/**
 * Look for a level/count split that beats the requested one at the ACTUAL
 * distances of the tiles that would be used (PRD §3.6).
 *
 * Alternatives always put the building at its claim's sovereignty level. A
 * lower building is dominated — the bonus and the resource upkeep follow the
 * building, so the surplus sovereignty levels buy nothing and the same building
 * on a cheaper claim beats it outright. So the search runs over one level per
 * tile, and `levels` below means both. The REQUESTED plan may of course split
 * them, which is why its cost and bonus are read from the assignment.
 *
 * Both cost and bonus are linear in level, so for any plan placed on the `n`
 * nearest tiles the bonus per RP collapses to `1 / (2 * mean_distance * f)` —
 * level cancels out entirely. That has two consequences worth stating:
 *
 *  - A plan spread over MORE tiles can never win. Taking more of a
 *    cheapest-first prefix can only raise the mean distance, so bonus-per-RP
 *    can only fall. The PRD's illustrative "3x Sov II beats 1x Sov V" is in
 *    fact unreachable under the linear model — which is the distance erosion
 *    §3.6 warns about, taken to its conclusion.
 *  - A win therefore always uses FEWER (or equally many) tiles at higher
 *    levels, which RETURNS tiles to the food knapsack. The food plan can only
 *    improve, so comparing milsov in isolation is conservative: this can never
 *    recommend a split that quietly costs the site food. See scoreSite.
 *
 * The loop is left general rather than hard-coded to `n <= requested.length`,
 * so the arithmetic — not an assumption — decides.
 *
 * `tiles` must be the order the plan reserved from, cheapest-first within it,
 * so that the first `n` are the tiles a quota of `n` would actually land on.
 * Ascending distance is the usual such order and the one both conclusions above
 * rest on. Pass any other order — the food-preserving hosting scoreSite trades
 * into, say — only with `maxBuildings` capped at the requested tile count: that
 * keeps a win a subset of the hosts already in use, which is what makes it
 * harmless to the food plan, and costs only the chance of spotting a win the
 * ascending case would have found.
 *
 * Returns null (stay silent) unless the alternative is no worse on research,
 * no worse on total bonus, and strictly better on at least one of the two —
 * the only two criteria §3.6 names.
 *
 * Structure upkeep is reported, not filtered on. It doubles per level while
 * bonus is linear, so a concentrating win almost always raises W/C/I/S upkeep;
 * gating on that would suppress the feature entirely, and would do so on the
 * strength of the placeholder yield behind T_res (mechanics open item 12). The
 * note says so instead, and lets the user weigh it.
 */
export function milsovAdvice({ requested, tiles, chancery, maxBuildings = Infinity }) {
  if (!requested || requested.length === 0) return null;

  // Bonus and structure upkeep come from the building; the research cost is
  // already on the assignment, charged at the claim's sovereignty level.
  const f = chancery ? CHANCERY_FACTOR : 1;
  const reqBonus = requested.reduce((n, a) => n + MILSOV_BONUS_PER_LEVEL * a.buildingLevel, 0);
  const reqRp = requested.reduce((n, a) => n + a.rp, 0);
  const reqUpkeep = requested.reduce(
    (n, a) => n + (MILSOV_UPKEEP_BY_LEVEL[a.buildingLevel] ?? 0),
    0,
  );

  const ds = tiles.map((t) => t.d);
  const maxN = Math.min(ds.length, maxBuildings);
  const EPS = 1e-9;
  let best = null;

  for (let n = 1; n <= maxN; n++) {
    // Start every tile at Sov I, then bump levels one at a time. Bumping the
    // nearest tile that is not yet at V is always the cheapest way to buy the
    // next 5% of bonus, so this walks the exact cost-minimising frontier for
    // each tile count.
    const levels = new Array(n).fill(1);
    let weighted = 0;                       // sum of level * distance
    for (let i = 0; i < n; i++) weighted += ds[i];
    let bonus = MILSOV_BONUS_PER_LEVEL * n;
    let upkeep = MILSOV_UPKEEP_BY_LEVEL[1] * n;

    for (;;) {
      const rp = CLAIM_RP_PER_LEVEL_DISTANCE * weighted * f;
      if (
        rp <= reqRp + EPS &&
        bonus >= reqBonus - EPS &&
        (rp < reqRp - EPS || bonus > reqBonus + EPS) &&
        (!best ||
          bonus > best.bonus + EPS ||
          (bonus >= best.bonus - EPS &&
            (rp < best.rp - EPS || (rp <= best.rp + EPS && upkeep < best.upkeep))))
      ) {
        best = { levels: [...levels], rp, bonus, upkeep, tileCount: n };
      }
      if (bonus >= MILSOV_BONUS_PER_LEVEL * 5 * n) break;   // every tile at V
      // Bump the nearest unsaturated tile — the cost of a bump is its distance
      // alone, so that is always the cheapest next 5%. Ties in distance go to
      // the lower-level tile: same research, but structure upkeep doubles per
      // level, so 2x Sov III beats 1x Sov V + 1x Sov I on W/C/I/S for free.
      let j = -1;
      for (let i = 0; i < n; i++) {
        if (levels[i] === 5) continue;
        if (j === -1 || ds[i] < ds[j] - EPS || (ds[i] <= ds[j] + EPS && levels[i] < levels[j])) j = i;
      }
      upkeep += MILSOV_UPKEEP_BY_LEVEL[levels[j] + 1] - MILSOV_UPKEEP_BY_LEVEL[levels[j]];
      levels[j] += 1;
      weighted += ds[j];
      bonus += MILSOV_BONUS_PER_LEVEL;
    }
  }

  if (!best) return null;

  const cheaper = best.rp < reqRp - EPS;
  const stronger = best.bonus > reqBonus + EPS;
  const research = cheaper
    ? `would cost less research than your ${describePlan(requested)}`
    : `would cost the same research as your ${describePlan(requested)}`;
  const gain = stronger ? 'give more total bonus' : 'give the same total bonus';
  // Fewer, higher-level structures cost more of each basic resource per hour.
  const dearer = best.upkeep > reqUpkeep ? ', at higher structure upkeep' : '';

  return {
    text: `${describeLevels(best.levels)} ${research} and ${gain}${dearer}.`,
    levels: best.levels,
    rp: best.rp,
    bonus: best.bonus,
    upkeep: best.upkeep,
    requestedRp: reqRp,
    requestedBonus: reqBonus,
    requestedUpkeep: reqUpkeep,
    tileCount: best.tileCount,
    requestedTileCount: requested.length,
  };
}

/**
 * Score one candidate site. `neighbours` are the claimable tiles already
 * filtered per PRD §3.3, each { dx, dy, food, key, i }.
 *
 * Returns the winning plan. T_max may be negative — that is a real answer, not
 * an error. Ranking and the tMin filter are the caller's job (PRD §3.7).
 * Returns null only when there is nothing to evaluate at all.
 *
 * With a milsov quota set, two hostings for it are scored and the better plan
 * returned — `milsovTraded` says which. See the trade below.
 */
export function scoreSite({ neighbours, settings }) {
  const s = settings;
  const k = computeK(s.plots.food);
  const bOther = computeBOther(s);
  const consumption = computeConsumption(s);
  const rRef = computeRRef(s);
  const chancery = !!s.chancery;

  // Step 2 (PRD §3.5): reserve milsov on the cheapest tiles by distance.
  //
  // Equal distances break toward the lower food rating. Military sovereignty is
  // paid for by distance alone and gains nothing from a tile's food, so among
  // tiles that cost the same the one the food knapsack would miss least is free
  // to take — whereas the scan order the dy/dx loops happen to produce would
  // burn a 7-food tile while an equidistant 0-food one sat unused.
  const byDistance = neighbours
    .map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) }))
    .sort((a, b) => a.d - b.d || a.food - b.food);

  // One entry per building, dearest claim first.
  const quota = [...(s.milsovQuota ?? [])]
    .sort((a, b) => b.sovLevel - a.sovLevel || b.buildingLevel - a.buildingLevel);
  const quotaRequested = quota.length;
  const maxBuildings = s.maxBuildings ?? 20;

  /**
   * Take the first `quotaRequested` tiles of `order` and put the highest
   * sovereignty level on the nearest of them. A short list is a quota that
   * cannot be met, which the caller flags as a "maybe" site.
   *
   * Which tiles are taken is the order's business; how the buildings land on
   * them is not. PRD §3.5 step 2 says only "cheapest available tiles by
   * distance", and pairing the dearest claim with the nearest tile is the
   * cost-minimising reading of it — claim upkeep is level times distance, so
   * the two largest factors belong apart. It leaves the requested buildings
   * untouched and stops the §3.6 advisory firing on a mere re-ordering.
   */
  function reserve(order) {
    return order
      .slice(0, quotaRequested)
      .sort((a, b) => a.d - b.d)
      .map((tile, i) => ({
        ...tile,
        sovLevel: quota[i].sovLevel,
        buildingLevel: quota[i].buildingLevel,
        ...claimUpkeep(tile.d, quota[i].sovLevel, chancery),
      }));
  }

  /** Steps 1, 3 and 4 for one reservation: knapsack the rest, walk the frontier. */
  function evaluate(milsovAssignments) {
    const reserved = new Set(milsovAssignments.map((a) => a.idx));
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
    const buildingsLeft = Math.max(0, maxBuildings - milsovAssignments.length);
    const dp = knapsack(foodCandidates, budget, buildingsLeft);

    const resCeiling = tRes({ milsovAssignments, plots: s.plots });
    // An indicative ceiling annotates the plan; it does not constrain it. The
    // figure rests on a yield borrowed from the farm, so letting it into T_max
    // would let a placeholder decide which sites survive the caller's tMin
    // filter — and a resource with no plots would delete every site outright, at
    // any tMin, with nothing on the result to say so. It travels on the result
    // instead, for the caller to show, and binds only once the yield behind it
    // is measured and tRes stops calling it indicative.
    const resApplied = resCeiling.indicative ? Infinity : resCeiling.ceiling;

    // Step 4: walk the DP frontier.
    let winner = null;
    for (let spend = 0; spend <= budget; spend++) {
      const sFood = dp.best[spend];
      const uRp = spend + milsovRp;
      const t = tMax({
        food: tFood({ bOther, sFood, consumption, k }),
        rp: tRp({ uRp, rRef }),
        res: resApplied,
      });
      // A negative T_max is a real answer — the site cannot feed a city at any
      // tax. Report it and let the caller filter on tMin (PRD §3.7); swallowing
      // it here would also hide "maybe" sites that miss a milsov quota.
      // Gold upkeep tracks RP exactly 10:1 (mechanics §5.2).
      const uGold = uRp * 10;
      const net = goldNet({ tax: t.value, consumption, uGold });
      if (!winner || betterPlan({ tMax: t.value, uRp, goldNet: net }, winner)) {
        winner = { tMax: t.value, binding: t.binding, sFood, uRp, uGold, goldNet: net, spend };
      }
    }

    if (!winner) return null;

    const chosenIdx = recoverSet(foodCandidates, dp, winner.spend);
    return {
      ...winner,
      tiles: chosenIdx ? chosenIdx.map((i) => foodCandidates[i]) : [],
      milsov: milsovAssignments,
      quotaMet: milsovAssignments.length === quotaRequested,
      milsovGold,
      resCeiling: resCeiling.ceiling,
      resIndicative: resCeiling.indicative,
      resBinding: resCeiling.binding,
      resImpossible: resCeiling.impossible,
    };
  }

  // The distance-for-food trade. Hosting milsov further out to keep a strong
  // food tile costs research on both counts — the claim itself is dearer and the
  // knapsack budget shrinks — so whether it wins cannot be reasoned about from
  // the tile alone; it depends on what the knapsack would have done with the
  // tile. Both hostings are therefore scored in full and the better plan kept,
  // which is what makes this safe: the trade can never return a worse plan than
  // the by-distance rule, since that rule's plan is one of the two candidates
  // and wins every tie.
  //
  // This reaches past reserving by distance alone. It costs a
  // second knapsack per site, and only when a milsov quota is set and the two
  // hostings actually differ — a site whose tiles all carry the same food, and
  // every site in a food-only scan, is untouched and pays nothing.
  const primary = reserve(byDistance);
  let plan = evaluate(primary);
  let order = byDistance;          // the hosting the winning plan reserved from
  let milsovTraded = false;
  if (plan && quotaRequested > 0) {
    // The tiles the food plan wants least, nearest first among equals.
    const byFood = [...byDistance].sort((a, b) => a.food - b.food || a.d - b.d);
    const alternative = reserve(byFood);
    if (!sameTiles(primary, alternative)) {
      const traded = evaluate(alternative);
      if (traded && betterPlan(traded, plan)) {
        plan = traded;
        order = byFood;
        milsovTraded = true;
      }
    }
  }
  if (!plan) return null;

  // PRD §3.6 — advisory only. The plan above is what the user asked for and is
  // returned unchanged; this note is never acted on. Costs nothing when no
  // milsov was requested, which is the common case across ~1,225 sites.
  // Skipped when the quota could not be fitted at all: "2 milsov fits here, but
  // only at 50% tax" (§3.7) is the honest message there, not a level tweak.
  //
  // It reasons over the hosting the plan actually used, so a traded plan is not
  // told it could save research by moving back onto the tiles the trade paid to
  // leave — that is a re-ordering, not a level split. Ascending distance is what
  // lets the advisory work out for itself that a win never takes more tiles, and
  // a traded order is not sorted that way, so there the tile count is capped
  // explicitly. A win is then a subset of the hosts already in use, which returns
  // tiles to the food knapsack and can only leave the site better off.
  const advice =
    plan.milsov.length > 0 && plan.quotaMet && (s.milsovAdvisory ?? true)
      ? milsovAdvice({
          requested: plan.milsov,
          tiles: order,
          chancery,
          maxBuildings: milsovTraded ? Math.min(maxBuildings, plan.milsov.length) : maxBuildings,
        })
      : null;

  return {
    ...plan,
    milsovAdvice: advice,
    milsovNote: advice ? advice.text : null,
    milsovTraded,
  };
}

/** Plan ordering: higher T_max, then lower U_RP, then higher Gold_net. */
function betterPlan(a, b) {
  const EPS = 1e-9;
  if (a.tMax > b.tMax + EPS) return true;
  if (a.tMax < b.tMax - EPS) return false;
  if (a.uRp < b.uRp - EPS) return true;
  if (a.uRp > b.uRp + EPS) return false;
  return a.goldNet > b.goldNet;
}

/** Whether two reservations landed on the same tiles, levels aside. */
function sameTiles(a, b) {
  if (a.length !== b.length) return false;
  const seen = new Set(a.map((t) => t.idx));
  return b.every((t) => seen.has(t.idx));
}
