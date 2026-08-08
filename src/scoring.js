// Pure scoring engine — the ceilings, the food plan, the military plan.
// No DOM, no network, no globals.
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
  MILSOV_UPKEEP_STEP,
  MILSOV_MAX_LEVEL,
  MILSOV_BONUS_PER_LEVEL,
  SOV_STRUCTURE_BY_KEY,
  DEFAULT_SOV_STRUCTURE,
  DEFAULT_CITY_CONSUMPTION,
  FLOUR_MILL_L20,
  NATURES_BOUNTY_BY_RETREATS,
  FAMINE_MANAGEMENT,
  SOIL_ENRICHMENT,
  ALLEMBINE_RP_PER_LIBRARY_LEVEL,
  OVERFLOWING_INSIGHT_FACTOR,
  LIBRARY_BASE_RP_L20,
  BASIC_RESOURCES,
  RESOURCE_BOOSTER_BONUS,
  BASIC_YIELD_L20,
} from './constants.js';

// Float slack for comparisons on costs and ceilings, which are exact arithmetic
// on measured constants — anything this close together is equal.
const EPS = 1e-9;

/**
 * The highest tax the game will accept at or below a ceiling — the rate is whole
 * numbers only. What the floor discards is not rounding error but headroom:
 * research produced and upkeep affordable that a plan pinned to the fraction
 * never spends.
 */
export function settableTax(t) {
  return Number.isFinite(t) ? Math.floor(t) : t;
}

// --- Derived city figures ---------------------------------------------------

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

/** C — city population, which equals total food consumption. */
export function computeConsumption(s) {
  return Number.isFinite(s.cityConsumption) ? s.cityConsumption : DEFAULT_CITY_CONSUMPTION;
}

/**
 * R_ref — research points per hour at 0 tax before the (125-T) multiplier.
 * Calibration beats the table: R_ref = observed * 100/(125-T).
 */
export function computeRRef(s) {
  const cal = s.rpCalibration;
  if (cal && cal.observedRpPerHour > 0) {
    return (cal.observedRpPerHour * 100) / (PRODUCTION_BASE - cal.atTax);
  }
  let base = LIBRARY_BASE_RP_L20;
  // [?] Whether Allembine scales with (125-T) is unconfirmed. Folding it into
  // R_ref, as here, is the assumption that it does.
  if (s.allembine) base += ALLEMBINE_RP_PER_LIBRARY_LEVEL * (s.libraryLevel ?? 20);
  return s.overflowingInsight ? base * OVERFLOWING_INSIGHT_FACTOR : base;
}

// --- Basic resource production ---------------------------------------------

/**
 * Y — per-plot yield at level 20, shared by all four basic resources.
 *
 * A reading overrides the default, as it does for R_ref, dividing out both the
 * tax multiplier and the booster that was running when it was taken. It is for
 * a city the default does not describe.
 *
 * Both paths set `measured`, which is what lets tRes bind. The flag is carried
 * so that a yield the engine cannot stand behind has somewhere to say so; the
 * annotate-but-do-not-rank path it drives is subtle enough to keep wired.
 */
export function computeBasicYield(s) {
  const cal = s.resourceCalibration;
  if (cal && cal.observedPerHour > 0 && cal.plots > 0) {
    const m = PRODUCTION_BASE - cal.atTax + (cal.booster ? RESOURCE_BOOSTER_BONUS : 0);
    if (m > 0) {
      return { yield: (cal.observedPerHour * 100) / (cal.plots * m), measured: true };
    }
  }
  return { yield: BASIC_YIELD_L20, measured: true };
}

/** Points added to a resource's production percentage by its booster building. */
export function boosterBonus(s, resource) {
  return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;
}

/**
 * How much of one resource the plan may not spend, per hour — the surplus the
 * user has fenced off from sovereignty upkeep. A missing or negative figure is
 * no floor rather than a licence to run the resource negative.
 */
export function resourceMinimum(s, resource) {
  const v = s.resourceMinimums?.[resource];
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/**
 * Hourly output of one basic resource at a given tax. Same additive shape as
 * food: the booster is points on the production percentage, not a multiplier,
 * so it is worth its face value in tax headroom.
 */
export function basicProduction({ plots, yield: y, bonus, tax }) {
  return (plots * y * (PRODUCTION_BASE - tax + bonus)) / 100;
}

// --- Claim costs -----------------------------------------------------------

export function distance(dx, dy) {
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Upkeep for one claim. Gold is exactly 10x RP.
 * [?] Where the game rounds is unconfirmed. Exact float is kept here and
 * rounded only at the knapsack weight, which is the one place it has to be an
 * integer.
 */
export function claimUpkeep(d, level, chancery) {
  const f = chancery ? CHANCERY_FACTOR : 1;
  return {
    rp: CLAIM_RP_PER_LEVEL_DISTANCE * level * d * f,
    gold: CLAIM_GOLD_PER_LEVEL_DISTANCE * level * d * f,
  };
}

// --- Structure upkeep ------------------------------------------------------

/**
 * The structure record a placed building names. One naming none, or naming one
 * the table does not know, resolves to the default — which is a Production
 * Structure, so a blank or a typo errs toward billing rather than toward a free
 * claim. Every reader goes through here, so that fallback is decided once.
 */
export function sovStructure(entry) {
  return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];
}

/** Whether a building's structure is charged hourly upkeep at all. */
export function isProductionStructure(entry) {
  return sovStructure(entry).type === 'production';
}

/**
 * Hourly cost of one building, of EACH of wood, clay, iron and stone.
 * It keys off the BUILDING level; the claim's sovereignty level is paid in RP
 * and gold instead. A Resource Structure is charged nothing HERE at any level —
 * it still pays its claim's RP and gold, which is simply not this function's
 * half of the bill.
 */
export function structureUpkeep(entry) {
  return isProductionStructure(entry) ? (MILSOV_UPKEEP_BY_LEVEL[entry?.buildingLevel] ?? 0) : 0;
}

/** The same, summed over a whole plan. */
export function milsovUpkeep(entries) {
  return (entries ?? []).reduce((sum, e) => sum + structureUpkeep(e), 0);
}

// --- The three ceilings ----------------------------------------------------

/** T_food = 125 + B_other + S_food - C/K */
export function tFood({ bOther, sFood, consumption, k }) {
  return PRODUCTION_BASE + bOther + sFood - consumption / k;
}

/** T_rp = 125 - 100 * U_RP / R_ref */
export function tRp({ uRp, rRef }) {
  return PRODUCTION_BASE - (100 * uRp) / rRef;
}

/**
 * T_res — per-resource ceiling from military sovereignty structure upkeep and
 * from the surplus the user asked to keep on top of it.
 *
 * Returns Infinity (non-binding, unflagged) whenever there is nothing to pay
 * for: no minimum set, and nothing placed that is charged hourly upkeep — no
 * military sovereignty at all, or Resource Structures, which pay only their
 * claims. A minimum alone is a ceiling on the same terms as an hourly bill,
 * being production the tax may not take, so it binds with nothing built.
 *
 * `indicative` says the ceiling rests on a yield the engine cannot stand behind,
 * in which case scoreSite reports it without letting it into T_max. A measured
 * yield does not set it — see computeBasicYield for why the flag is carried.
 *
 * `impossible` marks a resource the settle tile has no plots of while something
 * is owed in it — a bill or a minimum, since no plots cannot leave 1,000/hr
 * standing either. It produces nothing at any tax, so the ceiling is genuinely
 * -Infinity rather than merely low, and it is reported as a flag because a
 * caller filtering on the number alone would drop the site unable to say why.
 *
 * All four resources are checked even once one has come back impossible, so
 * `binding` always names the worst of them rather than the first bad one.
 */
export function tRes({ milsovAssignments, plots, settings = {} }) {
  const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
  const upkeep = milsovUpkeep(milsovAssignments ?? []);
  // A zero bill covers nothing placed, Resource Structures, and the degenerate
  // case of a level with no entry in the upkeep table.
  const fenced = BASIC_RESOURCES.some((res) => resourceMinimum(settings, res) > 0);
  if (upkeep <= 0 && !fenced) return none;
  const { yield: y, measured } = computeBasicYield(settings);
  let worst = Infinity;
  let binding = null;
  for (const res of BASIC_RESOURCES) {
    // production(T) - upkeep >= minimum
    //   =>  T <= 125 + bonus - 100*(upkeep + minimum)/(plots*Y)
    const need = upkeep + resourceMinimum(settings, res);
    const perPoint = plots[res] * y;
    // No plots owing nothing is not a constraint; no plots owing something is
    // one no tax rate satisfies.
    const ceiling = perPoint > 0
      ? PRODUCTION_BASE + boosterBonus(settings, res) - (100 * need) / perPoint
      : (need > 0 ? -Infinity : Infinity);
    if (ceiling < worst) {
      worst = ceiling;
      binding = res;
    }
  }
  return { ceiling: worst, indicative: !measured, binding, impossible: worst === -Infinity };
}

/**
 * What the city has left over per hour at a given tax, once the plan is paid
 * for: the two ceilings' own quantities, gold, and the four basic resources.
 *
 * Gold is not a ceiling but a FLOOR, which is why no T_gold sits beside the
 * other three: income is 0.04 x T x C and RISES with tax, against a bill fixed
 * at 10x the claims' research. So the constraint is 0.04 x T x C >= 10 x U_RP,
 * satisfied from above — roughly T >= U_RP/123 at C = 30,800 — and a plan fails
 * it only by taxing too LITTLE. Reported, never solved for.
 *
 * These are the same equations as the ceilings, read as a balance instead of
 * solved for T — so at T_max the binding one comes out at 0, which is what
 * makes the row self-checking. Nothing here goes negative while every ceiling
 * is applied: T_max is their minimum, so a lower tax only produces more. A
 * figure at zero is the one that named the tax.
 *
 * `indicative` is copied from the yield and covers the four basic figures only;
 * food and research do not depend on it.
 *
 * A basic resource reads as the whole surplus, not the part above any minimum
 * set: the minimum constrains the plan, and netting it off here would hide the
 * production it exists to protect.
 *
 * `base` holds the same seven quantities before the plan is paid for, so each
 * figure can be shown as base minus what the plan takes.
 */
export function surplusAt({ tax, settings, sFood, uRp, uGold, milsovAssignments }) {
  const s = settings;
  const k = computeK(s.plots.food);
  const upkeep = milsovUpkeep(milsovAssignments ?? []);
  const { yield: y, measured } = computeBasicYield(s);
  const consumption = computeConsumption(s);

  const base = {
    food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),
    rp: (computeRRef(s) * (PRODUCTION_BASE - tax)) / 100,
    gold: GOLD_PER_TAX_POP * tax * consumption,
  };
  const out = {
    tax,
    food: base.food - consumption,
    rp: base.rp - (uRp ?? 0),
    gold: base.gold - (uGold ?? 0),
    upkeep,
    indicative: !measured,
  };
  for (const res of BASIC_RESOURCES) {
    base[res] = basicProduction({
      plots: s.plots[res], yield: y, bonus: boosterBonus(s, res), tax,
    });
    out[res] = base[res] - upkeep;
  }
  out.base = base;
  return out;
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

// --- The food plan ---------------------------------------------------------

/**
 * 0/1 knapsack over food candidates. Weight = round(cost_RP), value = food.
 * Returns, for every RP spend from 0..budget, the best achievable S_food, plus
 * the chosen set at each spend level.
 *
 * `maxItems` adds a count dimension. It only binds when there are more
 * candidates than the building cap allows, which at R_claim=2
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

// --- Military sovereignty: spending what the food plan left -----------------

/**
 * The three budgets a military plan may spend at `tax` without costing the site
 * a single point of it.
 *
 * Food is planned first and sets the tax. Military sovereignty gives the city
 * nothing back — it charges research, gold and four basic resources per hour —
 * so every building can only ever push a ceiling down. What it may have is
 * whatever the food plan did not need:
 *
 *  - `rp`   research produced at `tax` less what the food claims already cost,
 *           which is the slack in T_rp. It exists because S_food is a step and
 *           T_rp is a line: the walk stops at the last food tile worth buying,
 *           and the change left over is too little for another one.
 *  - `upkeep` hourly production of the SCARCEST basic resource at `tax`, less
 *           any surplus of it the user asked to keep, which is the slack in
 *           T_res. Charged of each of the four, so the worst one is the budget.
 *  - `slots` the building cap, less what the food plan is already using.
 *
 * A research-bound site returns rp = 0, correctly: T_rp is what set the tax
 * there, so there is no free research to spend. An allocation with no plots of
 * some basic resource returns upkeep = 0, also correctly — no tax rate pays a
 * bill in a resource the city does not produce. Neither is an error, and both
 * are reported rather than inferred, so a site with no military can say why.
 */
export function milsovHeadroom({ tax, settings, uRp = 0, buildingsUsed = 0 }) {
  const s = settings;
  const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);
  // A site with no finite tax has no balance to spend from; -Infinity would
  // otherwise read as an infinite budget.
  if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };

  const { yield: y } = computeBasicYield(s);
  let upkeep = Infinity;
  for (const res of BASIC_RESOURCES) {
    const produced = basicProduction({
      plots: s.plots[res], yield: y, bonus: boosterBonus(s, res), tax,
    });
    upkeep = Math.min(upkeep, produced - resourceMinimum(s, res));
  }
  return {
    rp: Math.max(0, (computeRRef(s) * (PRODUCTION_BASE - tax)) / 100 - uRp),
    // A minimum bigger than the production it protects leaves nothing to spend
    // rather than a negative budget.
    upkeep: Math.max(0, upkeep),
    slots,
  };
}

/**
 * Choose how many military buildings to place, at what levels, on which tiles —
 * the most total production bonus those budgets will buy.
 *
 * `tiles` are the free tiles in ASCENDING distance; the plan takes a prefix of
 * them. Two facts about the game's costs make this exact and cheap rather than a
 * search over 6^24 assignments.
 *
 * **Level cancels out of the research cost.** A claim costs 10 x level x
 * distance and the bonus is 5 x level, so research per point of bonus is 2 x
 * distance x chancery whatever level it is bought at. Cost is therefore a
 * question of WHICH TILES, not which levels — and by the rearrangement
 * inequality the cheapest arrangement always puts the highest levels nearest.
 * So the plan is a staircase: levels never rise with distance.
 *
 * **That staircase decomposes into five independent layers.** Let `m[j]` be how
 * many tiles carry level j or better, and let D(m) be the summed distance of the
 * m nearest tiles. Then, writing STEP[j] for what raising one building to level
 * j adds to its hourly bill:
 *
 *     bonus  = 5 x SUM m[j]
 *     rp     = 10 x chancery x SUM D(m[j])
 *     upkeep = SUM STEP[j] x m[j]
 *
 * All three are sums of per-layer terms, so the whole problem is five numbers,
 * m[1] >= m[2] >= ... >= m[5]. That ordering does not even need enforcing: every
 * layer costs the same research for the same m, while STEP rises with j, so an
 * out-of-order pair is always strictly improvable by swapping it.
 *
 * **The two budgets pull opposite ways**, which is the whole content of the
 * answer. Research wants concentration, because reaching a further tile costs
 * more for the same bonus. Upkeep wants spreading, because STEP is convex —
 * 150, 150, 300, 600, 1,200 — so the same bonus split over more buildings runs
 * cheaper. Which wins is a property of the site, not a rule of thumb, and it is
 * why several low-level structures often beat one Sov V and sometimes do not.
 *
 * The search walks layers cheapest-first, taking the largest feasible count at
 * each, so its first descent is already a strong answer and the bound prunes the
 * rest hard. A site whose budgets cover every tile at level 5 skips it entirely.
 *
 * **Equal bonuses are broken on research.** Bonus is quantised in fives, so
 * several staircases routinely reach the same total by different routes — one
 * tile at level 2, or two at level 1 — and they are not equally good: gold tracks
 * research at exactly 10:1, so the cheaper one in RP is strictly better in gold
 * as well, and leaves more research for everything else. Hence the bound keeps
 * branches that can only TIE, and a tie is taken on lower RP. Cutting ties
 * instead handed the answer to whichever staircase the descent found first.
 */
export function planMilsov({ tiles, headroom, chancery }) {
  const EPS = 1e-9;
  const f = chancery ? CHANCERY_FACTOR : 1;
  const n = Math.min(tiles.length, Math.floor(headroom.slots));

  // D[m] — summed distance of the m nearest free tiles.
  const D = [0];
  for (let i = 0; i < n; i++) D.push(D[i] + tiles[i].d);
  const rpOf = (m) => CLAIM_RP_PER_LEVEL_DISTANCE * f * D[m];

  const empty = { counts: [0, 0, 0, 0, 0], levels: [], bonus: 0, rp: 0, upkeep: 0, buildings: 0 };
  if (n === 0) return empty;

  const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);
  const finish = (counts) => {
    // Tile i carries a level for every layer that reaches past it.
    const levels = [];
    for (let i = 0; i < n; i++) {
      const level = counts.filter((m) => m > i).length;
      if (level > 0) levels.push(level);
    }
    const units = counts.reduce((a, b) => a + b, 0);
    return {
      counts,
      levels,
      bonus: MILSOV_BONUS_PER_LEVEL * units,
      rp: counts.reduce((sum, m) => sum + rpOf(m), 0),
      upkeep: counts.reduce((sum, m, j) => sum + MILSOV_UPKEEP_STEP[j] * m, 0),
      buildings: levels.length,
    };
  };

  // Every free tile at the top level. Where both budgets cover it there is
  // nothing to choose and no reason to search for it.
  if (rpOf(n) * MILSOV_MAX_LEVEL <= headroom.rp + EPS
      && layerTotal * n <= headroom.upkeep + EPS) {
    return finish(new Array(MILSOV_MAX_LEVEL).fill(n));
  }

  const m = new Array(MILSOV_MAX_LEVEL).fill(0);
  let best = null;

  const search = (j, units, rp, upkeep, cap) => {
    if (j === MILSOV_MAX_LEVEL) {
      if (!best || units > best.units || (units === best.units && rp < best.rp - EPS)) {
        best = { counts: [...m], units, rp };
      }
      return;
    }
    // The largest count this layer can still afford. Both costs rise with the
    // count, so the feasible counts are the run 0..vMax.
    let vMax = 0;
    while (vMax < cap
        && rp + rpOf(vMax + 1) <= headroom.rp + EPS
        && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS) vMax++;

    for (let v = vMax; v >= 0; v--) {
      // No later layer may exceed this one, so (layers left) x v bounds
      // everything below — and it only falls as v does, so both cuts end the
      // loop rather than skipping a branch. A branch that can only TIE survives
      // the first, because the RP tie-break is decided at the leaf; it dies on
      // the second once its RP already matches the incumbent's, since research
      // only grows with depth.
      if (best) {
        const bound = units + (MILSOV_MAX_LEVEL - j) * v;
        if (bound < best.units) break;
        if (bound === best.units && rp >= best.rp - EPS) break;
      }
      m[j] = v;
      search(j + 1, units + v, rp + rpOf(v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);
    }
    m[j] = 0;
  };
  search(0, 0, 0, 0, n);

  return best ? finish(best.counts) : empty;
}

/**
 * Turn a chosen staircase into claims on the actual tiles. The building always
 * matches its claim's sovereignty level: bonus and hourly upkeep both follow the
 * BUILDING, so a claim above its building buys nothing and the same building on
 * a cheaper claim beats it outright.
 */
function milsovClaims({ tiles, levels, structure, chancery }) {
  return levels.map((level, i) => ({
    ...tiles[i],
    structure,
    sovLevel: level,
    buildingLevel: level,
    ...claimUpkeep(tiles[i].d, level, chancery),
  }));
}

/**
 * Why a site got no military sovereignty, in the user's terms. Returned only
 * when nothing was placed — when something was, the plan speaks for itself.
 */
function milsovBlockedBy({ free, headroom, chancery }) {
  if (free.length === 0) return 'tiles';
  if (headroom.slots < 1) return 'slots';
  if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return 'upkeep';
  const cheapest = CLAIM_RP_PER_LEVEL_DISTANCE * (chancery ? CHANCERY_FACTOR : 1) * free[0].d;
  if (headroom.rp + 1e-9 < cheapest) return 'rp';
  return null;
}

/**
 * Score one candidate site. `neighbours` are the claimable tiles already
 * filtered for claimability, each { dx, dy, food, key, i }.
 *
 * Food is planned first and alone. It is what a city is settled for,
 * it is what pays for a tax rate, and it is the only claim that gives the city
 * anything back — so it gets the whole neighbourhood, the whole research budget
 * and the whole building cap, and the tax it reaches is this site's answer.
 *
 * Military sovereignty is then fitted into what that plan left over, and only
 * into what it left over: the engine chooses the count, the levels and the
 * tiles, and the user chooses only which structure to put there. A plan that
 * would cost a point of tax is not a plan this returns.
 *
 * Returns the winning plan. T_max may be negative — that is a real answer, not
 * an error. Ranking and the tMin filter are the caller's job.
 * Returns null only when there is nothing to evaluate at all.
 */
/**
 * Everything about a site that does not depend on the tax: the tiles in cost
 * order, the food candidates, and the knapsack over them.
 *
 * Split out from planning because the knapsack is by far the most expensive
 * thing here — some thousands of spend levels against two dozen tiles, and the
 * building cap puts it on the count-limited path — while a plan at one tax is a
 * bisection and a small search. Anything asking the same site about many taxes,
 * which is what the panel's tax slider does on every drag, prepares once and
 * plans per tax. Preparing per tax instead is a fifty-fold difference and was
 * enough to make the slider feel broken.
 */
export function prepareSite({ neighbours, settings }) {
  const s = settings;
  const chancery = !!s.chancery;
  const maxBuildings = s.maxBuildings ?? 20;

  // Equal distances break toward the lower food rating, which only matters once
  // military sovereignty is choosing hosts: among tiles that cost the same it
  // should take the one the food plan would miss least, not whichever the dy/dx
  // scan order happened to produce.
  const byDistance = neighbours
    .map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) }))
    .sort((a, b) => a.d - b.d || a.food - b.food);

  const foodCandidates = byDistance
    .filter((t) => t.food > 0)
    .map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });
  const budget = Math.max(0, Math.round(computeRRef(s) * 1.25));
  return {
    settings: s,
    chancery,
    structure: s.milsovStructure || null,
    k: computeK(s.plots.food),
    bOther: computeBOther(s),
    consumption: computeConsumption(s),
    rRef: computeRRef(s),
    byDistance,
    foodCandidates,
    budget,
    dp: knapsack(foodCandidates, budget, maxBuildings),
  };
}


/**
 * The cheapest food spend that still holds `tax`, or null where no food plan
 * does. dp.best is non-decreasing in spend, so this is a bisection.
 *
 * Below the site's own maximum a CHEAPER food plan will do — food only has to
 * be good enough to hold the tax, not to maximise it — and the research it no
 * longer spends is most of what pays for military sovereignty.
 */
function foodSpendFor(ctx, tax) {
  const needed = tax - PRODUCTION_BASE - ctx.bOther + ctx.consumption / ctx.k;
  if (!(ctx.dp.best[ctx.budget] >= needed - EPS)) return null;
  let lo = 0;
  let hi = ctx.budget;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ctx.dp.best[mid] >= needed - EPS) hi = mid;
    else lo = mid + 1;
  }
  // The food claims alone must not outspend the research produced at this tax.
  return (ctx.rRef * (PRODUCTION_BASE - tax)) / 100 - lo < -EPS ? null : lo;
}

/**
 * The whole plan at one tax: the cheapest food that holds it, then the most
 * military sovereignty the leftovers buy.
 *
 * This is what makes the tax an input rather than only an output. At the site's
 * own maximum it returns the free plan; run it lower and the food claims get
 * cheaper, which is where the extra military comes from. Returns null for a tax
 * the site cannot hold at all.
 */
export function planSiteAt(ctx, tax) {
  const s = ctx.settings;
  const spend = Number.isFinite(tax) ? foodSpendFor(ctx, tax) : null;
  if (spend === null) return null;

  const tiles = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);
  const claimed = new Set(tiles.map((t) => t.idx));
  const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
  const headroom = milsovHeadroom({
    tax, settings: s, uRp: spend, buildingsUsed: tiles.length,
  });
  const military = planMilsov({
    tiles: ctx.structure ? free : [], headroom, chancery: ctx.chancery,
  });
  const milsov = milsovClaims({
    tiles: free, levels: military.levels, structure: ctx.structure, chancery: ctx.chancery,
  });

  const sFood = ctx.dp.best[spend];
  const milsovRp = milsov.reduce((sum, a) => sum + a.rp, 0);
  const uRp = spend + milsovRp;
  const uGold = uRp * 10;      // gold tracks RP exactly 10:1
  const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });
  // An indicative ceiling annotates the plan; it does not constrain it. Nothing
  // marks one today — the yields are measured — but the path stays wired for a
  // figure that is ever computed before it is trusted.
  const ceiling = tMax({
    food: tFood({ bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k }),
    rp: tRp({ uRp, rRef: ctx.rRef }),
    res: resCeiling.indicative ? Infinity : resCeiling.ceiling,
  });

  return {
    tax,
    tMax: ceiling.value,
    binding: ceiling.binding,
    sFood,
    spend,
    uRp,
    uGold,
    goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
    // What running this plan leaves per hour, at the tax it is run at, so the
    // ceiling that binds reads 0 and the rest read as headroom.
    surplus: Number.isFinite(tax)
      ? surplusAt({ tax, settings: s, sFood, uRp, uGold, milsovAssignments: milsov })
      : null,
    tiles,
    free,
    headroom,
    milsov,
    milsovBonus: military.bonus,
    milsovUpkeep: military.upkeep,
    milsovRp,
    milsovGold: milsov.reduce((sum, a) => sum + a.gold, 0),
    milsovBlocked: ctx.structure && milsov.length === 0
      ? milsovBlockedBy({ free, headroom, chancery: ctx.chancery })
      : null,
    resCeiling: resCeiling.ceiling,
    resIndicative: resCeiling.indicative,
    resBinding: resCeiling.binding,
    resImpossible: resCeiling.impossible,
  };
}

/**
 * The most military sovereignty reachable at or above `floor`, and the highest
 * tax that still delivers `required`.
 *
 * Achievable bonus only rises as the tax falls — more research produced, less of
 * it needed for food, more spare tiles and slots, more resources to run the
 * upkeep, all pulling the same way — so the answer is a bisection, and the most
 * that will ever fit above the floor is whatever fits AT the floor.
 *
 * The game takes whole-number taxes only, so the bisection is over integers —
 * exact, where refining a fractional bracket could only approximate. `floor`
 * rounds UP: below it is a tax the user said they would not accept.
 *
 * Returns `{ bonus, tax }` for the best tax meeting the requirement, or null
 * when even the floor cannot.
 */
export function milsovAtFloor(ctx, { required, floor, ceiling }) {
  const at = (tax) => {
    const p = planSiteAt(ctx, tax);
    return p && p.milsovBonus >= required ? p : null;
  };
  let lo = Math.ceil(floor);
  let best = at(lo);
  if (!best) return null;
  // `lo` is the highest tax known to meet the requirement, `hi` the lowest known
  // not to — which the caller's ceiling already is, or it would not have asked.
  let hi = Math.floor(ceiling);
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    const p = at(mid);
    if (p) {
      best = p;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { bonus: best.milsovBonus, tax: best.tax };
}

/**
 * Walk the DP frontier for the site's own ceiling — the best tax any food plan
 * reaches, and the cheapest plan reaching it. No military building is placed
 * here, so nothing is charged hourly — but a minimum surplus is a ceiling all
 * the same, and it is fixed by the city rather than the food spend, so it is
 * solved once outside the walk.
 *
 * Split out for callers that already hold a context, since rebuilding one is the
 * whole cost of preparing a site.
 *
 * @returns {{tMax: number, binding: string, sFood: number, spend: number}|null}
 *   null only when there is no spend level to evaluate at all.
 */
export function siteCeiling(ctx) {
  const floors = tRes({ milsovAssignments: [], plots: ctx.settings.plots, settings: ctx.settings });
  const res = floors.indicative ? Infinity : floors.ceiling;
  let winner = null;
  for (let spend = 0; spend <= ctx.budget; spend++) {
    const sFood = ctx.dp.best[spend];
    const t = tMax({
      food: tFood({ bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k }),
      rp: tRp({ uRp: spend, rRef: ctx.rRef }),
      res,
    });
    // A negative T_max is a real answer — the site cannot feed a city at any
    // tax. Report it and let the caller filter on tMin.
    const net = goldNet({ tax: t.value, consumption: ctx.consumption, uGold: spend * 10 });
    if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {
      winner = { tMax: t.value, binding: t.binding, sFood, spend };
    }
  }
  return winner;
}

export function scoreSite({ neighbours, settings }) {
  return scoreSiteFrom(prepareSite({ neighbours, settings }));
}

/** scoreSite for a caller that prepared the context and wants to keep it. */
export function scoreSiteFrom(ctx) {
  const s = ctx.settings;
  const winner = siteCeiling(ctx);
  if (!winner) return null;

  // The plan at the settable rate, not at the ceiling itself, and the military
  // it fits there — which costs no tax, the food plan holding that rate
  // outright. Rounding down frees the fraction the exact ceiling could never
  // spend, so this plan is never worse than the one at the ceiling and is often
  // strictly better.
  const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);
  const cheaper = ctx.structure ? planSiteAt(ctx, plan.tax - 1) : null;

  // Whether a minimum bonus is met is a question about the whole tax RANGE the
  // user will accept, not about the ceiling alone. A site reaching +10% for free
  // at 80% tax, whose owner would settle for 50%, has forty points of tax to
  // spend before the answer is no — and asking only at the ceiling threw those
  // sites away with nothing on the row to say why.
  const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : (s.milsovMinBonus ?? 0);
  const floor = Math.min(s.tMin ?? 0, plan.tax);
  const reach = required > 0 && plan.milsovBonus < required && Number.isFinite(plan.tax)
    ? milsovAtFloor(ctx, { required, floor, ceiling: plan.tax })
    : null;

  return {
    ...plan,
    // What the site is reported and ranked at: the highest whole number its food
    // plan holds. `tMaxExact` is what the arithmetic solved for, kept because it
    // is the true ceiling — and because it is not a rate anyone can set.
    tMax: plan.tax,
    tMaxExact: winner.tMax,
    // Which ceiling stopped the tax going higher is a question about the exact
    // one; the plan's own ceiling has the rounding slack in it.
    binding: winner.binding,
    milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,
    // Where the minimum is met, if it is not met for free: the highest tax that
    // still delivers it. Null means the free plan already covers it, or nothing
    // in the acceptable range does.
    milsovMinTax: reach ? reach.tax : null,
    milsovMinBonusAt: reach ? reach.bonus : null,
    // Only a genuine shortfall now: not reachable anywhere the user would accept.
    milsovShortfall: required > 0 && plan.milsovBonus < required && !reach,
  };
}

/**
 * A site with no food plots reaches no finite tax, so there is no spend to solve
 * for. The frontier already settled on the cheapest of the equally hopeless
 * plans; describe that one rather than returning nothing.
 */
function fallbackPlan(ctx, winner) {
  const tiles = recoverSet(ctx.foodCandidates, ctx.dp, winner.spend)
    .map((i) => ctx.foodCandidates[i]);
  const claimed = new Set(tiles.map((t) => t.idx));
  const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
  const headroom = milsovHeadroom({
    tax: winner.tMax, settings: ctx.settings, uRp: winner.spend, buildingsUsed: tiles.length,
  });
  return {
    tax: winner.tMax,
    tMax: winner.tMax,
    binding: 'food',
    sFood: winner.sFood,
    spend: winner.spend,
    uRp: winner.spend,
    uGold: winner.spend * 10,
    goldNet: goldNet({ tax: winner.tMax, consumption: ctx.consumption, uGold: winner.spend * 10 }),
    surplus: null,
    tiles,
    free,
    headroom,
    milsov: [],
    milsovBonus: 0,
    milsovUpkeep: 0,
    milsovRp: 0,
    milsovGold: 0,
    milsovBlocked: ctx.structure ? milsovBlockedBy({ free, headroom, chancery: ctx.chancery }) : null,
    resCeiling: Infinity,
    resIndicative: false,
    resBinding: null,
    resImpossible: false,
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
