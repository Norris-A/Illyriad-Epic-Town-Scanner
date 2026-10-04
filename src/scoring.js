// The scoring engine: the tax ceilings, the food plan and the military plan.
// Shared by the Web Worker and the tests, so it uses no DOM or globals.

import {
  PRODUCTION_BASE,
  FARM_YIELD_L20,
  GOLD_PER_TAX_POP,
  CLAIM_RP_PER_LEVEL_DISTANCE,
  CLAIM_GOLD_PER_LEVEL_DISTANCE,
  CHANCERY_DISCOUNT_L20,
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
  ALLEMBINE_RP,
  OVERFLOWING_INSIGHT_RP,
  LIBRARY_BASE_RP_L20,
  CLAIM_DISTANCE_DECIMALS,
  BASIC_RESOURCES,
  RESOURCE_BOOSTER_BONUS,
  PRESTIGE_PRODUCTION_BONUS,
  BASIC_YIELD_L20,
  UPKEEP_BUILDINGS,
} from './constants.js';

// Slack for float comparisons on costs and ceilings.
const EPS = 1e-9;

/** The highest whole-number tax at or below a ceiling; the game takes no other. */
export function settableTax(t) {
  return Number.isFinite(t) ? Math.floor(t) : t;
}

// --- Derived city figures ---------------------------------------------------

/** K = F_city * Y_farm / 100: food per percentage point of production. */
export function computeK(foodPlots) {
  return (foodPlots * FARM_YIELD_L20) / 100;
}

/**
 * B_other: every additive food bonus, in points, prestige included. Food
 * prestige is counted only here.
 */
export function computeBOther(s) {
  let b = prestigeBonus(s, 'food');
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
 * The city's research split into `base`, the library output that scales with
 * (125 - T), and `flat`, the bonuses added after it. A calibration reading
 * replaces the base: the flat bonuses come off it, and the reading's own tax and
 * prestige are divided out.
 */
export function computeResearch(s) {
  const flat = (s.allembine ? ALLEMBINE_RP : 0)
    + (s.overflowingInsight ? OVERFLOWING_INSIGHT_RP : 0);
  const cal = s.rpCalibration;
  if (cal && cal.observedRpPerHour > 0) {
    const m = PRODUCTION_BASE - cal.atTax + (cal.prestige ? PRESTIGE_PRODUCTION_BONUS : 0);
    return { base: Math.max(0, ((cal.observedRpPerHour - flat) * 100) / m), flat };
  }
  return { base: LIBRARY_BASE_RP_L20, flat };
}

// --- Basic resource production ---------------------------------------------

/**
 * Y: per-plot yield at level 20 for the basic resources. `measured: false`
 * would make the resource ceiling indicative only; every yield is measured.
 */
export function computeBasicYield() {
  return { yield: BASIC_YIELD_L20, measured: true };
}

/** Points added to a resource's production percentage by its booster building. */
export function boosterBonus(s, resource) {
  return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;
}

/**
 * Points the prestige boost adds to a production. Food's are counted in
 * computeBOther, so food call sites must not ask for them here.
 */
export function prestigeBonus(s, resource) {
  return s.prestige?.[resource] ? PRESTIGE_PRODUCTION_BONUS : 0;
}

export function resourceBonus(s, resource) {
  return boosterBonus(s, resource) + prestigeBonus(s, resource);
}

/**
 * The surplus per hour the user has kept back from sovereignty, for any of
 * MINIMUM_KEYS. Missing or negative is no minimum.
 */
export function resourceMinimum(s, resource) {
  const v = s.resourceMinimums?.[resource];
  return Number.isFinite(v) && v > 0 ? v : 0;
}

/**
 * What the city's buildings consume of one basic resource per hour. Unlike a
 * minimum, it is spent, so it also comes off the balance.
 */
export function buildingUpkeep(s, resource) {
  let sum = 0;
  for (const b of UPKEEP_BUILDINGS) {
    sum += (s.upkeepBuildings?.[b.key] ?? 0) * (b.consumes[resource] ?? 0);
  }
  return sum;
}

/** Research produced per hour at a tax; prestige adds points to the production percentage. */
export function researchAt({ research, rpBonus = 0, tax }) {
  return (research.base * (PRODUCTION_BASE - tax + rpBonus)) / 100 + research.flat;
}

/** Hourly output of one basic resource at a given tax. */
export function basicProduction({ plots, yield: y, bonus, tax }) {
  return (plots * y * (PRODUCTION_BASE - tax + bonus)) / 100;
}

// --- Claim costs -----------------------------------------------------------

/** Claim distance as the game charges it, rounded to CLAIM_DISTANCE_DECIMALS. */
export function distance(dx, dy) {
  const q = 10 ** CLAIM_DISTANCE_DECIMALS;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * q) / q;
}

/**
 * The factor a city's Chanceries put on a claim's first level: 0.6 for one,
 * each further one adding half the discount before. 1 without a Chancery.
 */
export function chanceryFactor(s) {
  const n = s.upkeepBuildings?.chanceryOfEstates ?? 0;
  return 1 - 2 * CHANCERY_DISCOUNT_L20 * (1 - 0.5 ** n);
}

/** Hourly research for a claim at `level`; the Chancery discounts its first level. */
function claimRp(d, level, chancery) {
  if (level <= 0) return 0;
  return CLAIM_RP_PER_LEVEL_DISTANCE * d * (level - 1 + chancery);
}

/**
 * Upkeep for raising a claim from `held` to `level`; gold is 10x RP. Zero when
 * the claim already stands at `level`, since kept claims are charged
 * separately.
 */
export function claimUpkeep(d, level, chancery = 1, held) {
  const from = held ?? 0;
  const rp = level > from ? claimRp(d, level, chancery) - claimRp(d, from, chancery) : 0;
  return { rp, gold: (rp * CLAIM_GOLD_PER_LEVEL_DISTANCE) / CLAIM_RP_PER_LEVEL_DISTANCE };
}

// --- Structure upkeep ------------------------------------------------------

/**
 * The structure a placed building names. Unknown or missing names resolve to
 * the default, a Production Structure, so they are still charged upkeep.
 */
export function sovStructure(entry) {
  return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];
}

export function isProductionStructure(entry) {
  return sovStructure(entry).type === 'production';
}

/**
 * Hourly cost of one building, in each of wood, clay, iron and stone, by its
 * building level. Resource Structures cost nothing here.
 */
export function structureUpkeep(entry) {
  return isProductionStructure(entry) ? (MILSOV_UPKEEP_BY_LEVEL[entry?.buildingLevel] ?? 0) : 0;
}

export function milsovUpkeep(entries) {
  return (entries ?? []).reduce((sum, e) => sum + structureUpkeep(e), 0);
}

// --- The three ceilings ----------------------------------------------------

/** T_food = 125 + B_other + S_food - (C + M_food)/K. */
export function tFood({ bOther, sFood, consumption, k, minimum = 0 }) {
  return PRODUCTION_BASE + bOther + sFood - (consumption + minimum) / k;
}

/**
 * T_rp = 125 + prestige - 100 * (U_RP + M_rp - flat) / base. With claims cheaper
 * than the flat research it runs past 125, meaning no research ceiling.
 */
export function tRp({ uRp, research, rpBonus = 0, minimum = 0 }) {
  return PRODUCTION_BASE + rpBonus
    - (100 * (uRp + minimum - research.flat)) / research.base;
}

/**
 * T_res: the ceiling set by what the basic resources must pay for — military
 * structure upkeep, the city's buildings, and any minimum surplus — checked for
 * each resource, with the worst one binding. Infinity when nothing is owed.
 *
 * `impossible` marks a resource owed by a settle tile with no plots of it: no
 * tax pays that, so the ceiling is -Infinity.
 */
export function tRes({ milsovAssignments, plots, settings = {} }) {
  const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
  const upkeep = milsovUpkeep(milsovAssignments ?? []);
  const fixed = (res) => resourceMinimum(settings, res) + buildingUpkeep(settings, res);
  if (upkeep <= 0 && !BASIC_RESOURCES.some((res) => fixed(res) > 0)) return none;
  const { yield: y, measured } = computeBasicYield(settings);
  let worst = Infinity;
  let binding = null;
  for (const res of BASIC_RESOURCES) {
    // production(T) - upkeep - buildings >= minimum
    //   =>  T <= 125 + bonus - 100*(upkeep + buildings + minimum)/(plots*Y)
    const need = upkeep + fixed(res);
    const perPoint = plots[res] * y;
    // No plots is a constraint only if something is owed.
    const ceiling = perPoint > 0
      ? PRODUCTION_BASE + resourceBonus(settings, res) - (100 * need) / perPoint
      : (need > 0 ? -Infinity : Infinity);
    if (ceiling < worst) {
      worst = ceiling;
      binding = res;
    }
  }
  return { ceiling: worst, indicative: !measured, binding, impossible: worst === -Infinity };
}

/**
 * What the city has left per hour at a tax once the plan is paid for: food,
 * research, gold and the basic resources. At T_max the binding ceiling reads 0.
 *
 * Gold is a floor, not a ceiling: income rises with tax while the claims' bill
 * is fixed, so a plan can only fail it by taxing too little. It is reported,
 * never solved for.
 *
 * Figures are the whole surplus, minimums included. `base` holds the same
 * figures before the plan, and `buildingUpkeep` the city's buildings' share of
 * what is spent.
 */
export function surplusAt({ tax, settings, sFood, uRp, uGold, milsovAssignments }) {
  const s = settings;
  const k = computeK(s.plots.food);
  const upkeep = milsovUpkeep(milsovAssignments ?? []);
  const { yield: y, measured } = computeBasicYield(s);
  const consumption = computeConsumption(s);

  const base = {
    food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),
    rp: researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, 'research'), tax }),
    gold: GOLD_PER_TAX_POP * tax * consumption,
  };
  const out = {
    tax,
    food: base.food - consumption,
    rp: base.rp - (uRp ?? 0),
    gold: base.gold - (uGold ?? 0),
    upkeep,
    buildingUpkeep: {},
    indicative: !measured,
  };
  for (const res of BASIC_RESOURCES) {
    base[res] = basicProduction({
      plots: s.plots[res], yield: y, bonus: resourceBonus(s, res), tax,
    });
    out.buildingUpkeep[res] = buildingUpkeep(s, res);
    out[res] = base[res] - upkeep - out.buildingUpkeep[res];
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

/** The plan's gold bill: 10x its research, plus the kept claims' (keptClaimRp). */
export function claimGold(uRp, s) {
  return (uRp + (s?.keptClaimRp ?? 0)) * 10;
}

export function goldNet({ tax, consumption, uGold }) {
  return GOLD_PER_TAX_POP * tax * consumption - uGold;
}

// --- The food plan ---------------------------------------------------------

/**
 * 0/1 knapsack over food candidates: weight round(cost_RP), value food. Returns
 * the best S_food at every spend from 0 to budget, and the set chosen at each.
 * `maxItems` adds a count limit, used only when the building cap binds.
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

  // Count-limited variant, O(items * budget * maxItems).
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
 * Recover the items chosen at a spend level. A cell can carry marks from
 * several items, the highest-indexed of which set its value, so scanning items
 * downwards is exact.
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
 * What a military plan may spend at `tax` without lowering it — what the food
 * plan left over:
 *
 *  - `rp`     research produced at `tax`, less the food claims and the minimum
 *  - `upkeep` production of the scarcest basic resource, less the city's
 *             buildings and the minimum
 *  - `slots`  the building cap, less the food claims
 *
 * A research-bound site has rp = 0; a resource with no plots gives upkeep = 0.
 */
export function milsovHeadroom({ tax, settings, uRp = 0, buildingsUsed = 0 }) {
  const s = settings;
  const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);
  // An infinite tax would otherwise read as an infinite budget.
  if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };

  const { yield: y } = computeBasicYield(s);
  let upkeep = Infinity;
  for (const res of BASIC_RESOURCES) {
    const produced = basicProduction({
      plots: s.plots[res], yield: y, bonus: resourceBonus(s, res), tax,
    });
    upkeep = Math.min(upkeep, produced - resourceMinimum(s, res) - buildingUpkeep(s, res));
  }
  return {
    rp: Math.max(0, researchAt({
      research: computeResearch(s), rpBonus: prestigeBonus(s, 'research'), tax,
    }) - uRp - resourceMinimum(s, 'research')),
    upkeep: Math.max(0, upkeep),
    slots,
  };
}

/**
 * Points per building level a tile's terrain adds to the structure placed on
 * it, when its descriptor names that structure. An unread descriptor adds none.
 */
function descriptorBonus(tile, structure) {
  const d = tile?.descriptor;
  return d && structure && d.sovKey === structure ? (d.bonus ?? 0) : 0;
}

/**
 * Choose how many military buildings to place, at what levels and on which
 * tiles, for the most production bonus the budgets buy.
 *
 * `tiles` are free land tiles by ascending distance. A claim's research cost
 * is distance times a rate that rises with level, so the cheapest arrangement
 * puts the highest levels nearest: levels never rise with distance. The plan is
 * then five layer counts m[1] >= ... >= m[5], m[j] being how many tiles reach
 * level j, and every cost is a sum of per-layer terms:
 *
 *     bonus  = 5 x SUM m[j]
 *     rp     = 10 x SUM RATE[j] x D_j(m[j])
 *     upkeep = SUM STEP[j] x m[j]
 *
 * where D_j(m) is the summed distance of the m nearest tiles not already at
 * level j, and RATE is the claim cost per level step: chancery for the first,
 * then 1. Research favours few near buildings; the rising upkeep steps favour
 * many low ones. The search walks layers cheapest-first with a bound, and breaks
 * equal bonuses on lower research.
 *
 * Tiles are taken nearest-first, so a slightly further tile whose terrain names
 * the structure, or that already holds a claim, can be missed. That only ever
 * understates the plan.
 *
 * @param {number} [chancery] the paying city's chanceryFactor.
 * @param {string} [structure] the structure being placed; see descriptorBonus.
 */
export function planMilsov({ tiles, headroom, chancery = 1, structure }) {
  const EPS = 1e-9;
  const n = Math.min(tiles.length, Math.floor(headroom.slots));
  // RATE[j], indexed from 0 for level 1.
  const RATE = [chancery, 1, 1, 1, 1];

  // D[j][m]: summed distance of the m nearest tiles not already at level j+1.
  const D = [];
  for (let j = 0; j < MILSOV_MAX_LEVEL; j++) {
    const pre = [0];
    for (let i = 0; i < n; i++) pre.push(pre[i] + ((tiles[i].held ?? 0) > j ? 0 : tiles[i].d));
    D.push(pre);
  }
  const rpOf = (j, m) => CLAIM_RP_PER_LEVEL_DISTANCE * RATE[j] * D[j][m];

  const empty = { counts: [0, 0, 0, 0, 0], levels: [], bonus: 0, rp: 0, upkeep: 0, buildings: 0 };
  if (n === 0) return empty;

  const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);
  const finish = (counts) => {
    const levels = [];
    let bonus = 0;
    for (let i = 0; i < n; i++) {
      const level = counts.filter((m) => m > i).length;
      if (level > 0) levels.push(level);
      bonus += level * (MILSOV_BONUS_PER_LEVEL + descriptorBonus(tiles[i], structure));
    }
    const units = counts.reduce((a, b) => a + b, 0);
    return {
      counts,
      levels,
      bonus,
      rp: counts.reduce((sum, m, j) => sum + rpOf(j, m), 0),
      upkeep: counts.reduce((sum, m, j) => sum + MILSOV_UPKEEP_STEP[j] * m, 0),
      buildings: levels.length,
    };
  };

  // Skip the search when both budgets cover every tile at the top level.
  const topRp = D.reduce((sum, _, j) => sum + rpOf(j, n), 0);
  if (topRp <= headroom.rp + EPS && layerTotal * n <= headroom.upkeep + EPS) {
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
    let vMax = 0;
    while (vMax < cap
        && rp + rpOf(j, vMax + 1) <= headroom.rp + EPS
        && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS) vMax++;

    for (let v = vMax; v >= 0; v--) {
      // No later layer may exceed this one, so (layers left) x v bounds what is
      // left. Branches that can only tie survive, for the research tie-break.
      if (best) {
        const bound = units + (MILSOV_MAX_LEVEL - j) * v;
        if (bound < best.units) break;
        if (bound === best.units && rp >= best.rp - EPS) break;
      }
      m[j] = v;
      search(j + 1, units + v, rp + rpOf(j, v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);
    }
    m[j] = 0;
  };
  search(0, 0, 0, 0, n);

  return best ? finish(best.counts) : empty;
}

/**
 * Place a chosen staircase on the tiles. Each claim is at its building's level,
 * since a claim above its building buys nothing.
 */
function milsovClaims({ tiles, levels, structure, chancery }) {
  return levels.map((level, i) => {
    const held = tiles[i].held ?? 0;
    return {
      ...tiles[i],
      structure,
      // A standing claim keeps its level.
      sovLevel: Math.max(level, held),
      buildingLevel: level,
      ...claimUpkeep(tiles[i].d, level, chancery, held),
    };
  });
}

/** Why no military sovereignty was placed, as a key into MILSOV_BLOCKED_TEXT. */
function milsovBlockedBy({ hosts, free, headroom, chancery }) {
  if (free.length === 0) return 'tiles';
  if (hosts.length === 0) return 'water';
  if (headroom.slots < 1) return 'slots';
  if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return 'upkeep';
  const nearest = hosts.reduce((d, t) => Math.min(d, (t.held ?? 0) > 0 ? 0 : t.d), Infinity);
  const cheapest = claimUpkeep(nearest, 1, chancery).rp;
  if (headroom.rp + 1e-9 < cheapest) return 'rp';
  return null;
}

/**
 * Everything about a site that does not depend on the tax, including the
 * knapsack, the expensive part. Callers asking about many taxes, like the tax
 * slider, prepare once and plan per tax.
 */
export function prepareSite({ neighbours, settings }) {
  const s = settings;
  const chancery = chanceryFactor(s);
  const maxBuildings = s.maxBuildings ?? 20;

  // Equal distances put the lower food rating first, for military hosts.
  const byDistance = neighbours
    .map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) }))
    .sort((a, b) => a.d - b.d || a.food - b.food);

  // A tile already holding part of a level 5 claim is charged only the rest.
  const foodCandidates = byDistance
    .filter((t) => t.food > 0)
    .map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery, t.held);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });
  // The most research the city can produce, at 0% tax; a smaller budget would
  // truncate the knapsack.
  const rpBonus = prestigeBonus(s, 'research');
  const budget = Math.max(0, Math.round(researchAt({ research: computeResearch(s), rpBonus, tax: 0 })));
  return {
    settings: s,
    chancery,
    structure: s.milsovStructure || null,
    k: computeK(s.plots.food),
    bOther: computeBOther(s),
    consumption: computeConsumption(s),
    research: computeResearch(s),
    rpBonus,
    minFood: resourceMinimum(s, 'food'),
    minRp: resourceMinimum(s, 'research'),
    byDistance,
    foodCandidates,
    budget,
    dp: knapsack(foodCandidates, budget, maxBuildings),
  };
}


/**
 * The cheapest food spend that still holds `tax`, or null if none does. Below
 * the site's maximum a cheaper food plan suffices, which frees research for
 * military sovereignty.
 */
function foodSpendFor(ctx, tax) {
  const needed = tax - PRODUCTION_BASE - ctx.bOther + (ctx.consumption + ctx.minFood) / ctx.k;
  if (!(ctx.dp.best[ctx.budget] >= needed - EPS)) return null;
  let lo = 0;
  let hi = ctx.budget;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ctx.dp.best[mid] >= needed - EPS) hi = mid;
    else lo = mid + 1;
  }
  const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
  return produced - lo - ctx.minRp < -EPS ? null : lo;
}

/** The most food reachable at a tax no plan holds, for the deficit it shows. */
function bestFoodSpend(ctx, tax) {
  const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
  const affordable = Math.max(0, Math.min(ctx.budget, Math.floor(produced - ctx.minRp)));
  const target = ctx.dp.best[affordable];
  let lo = 0;
  let hi = affordable;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ctx.dp.best[mid] >= target - EPS) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

/**
 * The whole plan at one tax: the cheapest food that holds it, then the most
 * military the leftovers buy. Null for a tax the site cannot hold, unless
 * `bestEffort` asks for the plan at that tax anyway, deficit and all.
 */
export function planSiteAt(ctx, tax, { bestEffort = false } = {}) {
  const s = ctx.settings;
  if (!Number.isFinite(tax)) return null;
  const held = foodSpendFor(ctx, tax);
  const spend = held ?? (bestEffort ? bestFoodSpend(ctx, tax) : null);
  if (spend === null) return null;

  const tiles = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);
  const claimed = new Set(tiles.map((t) => t.idx));
  const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
  // Water takes no structure. planMilsov and milsovClaims must get this same
  // list in this order: levels are mapped onto tiles by position.
  const hosts = free.filter((t) => !t.water);
  const headroom = milsovHeadroom({
    tax, settings: s, uRp: spend, buildingsUsed: tiles.length,
  });
  const military = planMilsov({
    tiles: ctx.structure ? hosts : [], headroom, chancery: ctx.chancery, structure: ctx.structure,
  });
  const milsov = milsovClaims({
    tiles: hosts, levels: military.levels, structure: ctx.structure, chancery: ctx.chancery,
  });

  const sFood = ctx.dp.best[spend];
  const milsovRp = milsov.reduce((sum, a) => sum + a.rp, 0);
  const uRp = spend + milsovRp;
  const uGold = claimGold(uRp, s);
  const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });
  const ceiling = tMax({
    food: tFood({
      bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k, minimum: ctx.minFood,
    }),
    rp: tRp({ uRp, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
    res: resCeiling.indicative ? Infinity : resCeiling.ceiling,
  });

  return {
    tax,
    // False when the plan is at a tax the site cannot hold.
    holds: held !== null,
    tMax: ceiling.value,
    binding: ceiling.binding,
    sFood,
    spend,
    uRp,
    uGold,
    goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
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
      ? milsovBlockedBy({ hosts, free, headroom, chancery: ctx.chancery })
      : null,
    resCeiling: resCeiling.ceiling,
    resIndicative: resCeiling.indicative,
    resBinding: resCeiling.binding,
    resImpossible: resCeiling.impossible,
  };
}

/**
 * The highest whole-number tax down to `floor` that reaches `required`
 * military bonus, by bisection: the bonus only rises as the tax falls. Returns
 * `{ bonus, tax }`, or null when even the floor falls short.
 */
export function milsovAtFloor(ctx, { required, floor, ceiling }) {
  const at = (tax) => {
    const p = planSiteAt(ctx, tax);
    return p && p.milsovBonus >= required ? p : null;
  };
  let lo = Math.ceil(floor);
  let best = at(lo);
  if (!best) return null;
  // `lo` meets the requirement, `hi` does not.
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
 * The site's own ceiling: the best tax any food plan reaches, and the cheapest
 * plan reaching it.
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
      food: tFood({
        bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k, minimum: ctx.minFood,
      }),
      rp: tRp({ uRp: spend, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
      res,
    });
    // A negative T_max is a real answer; the caller filters on tMin.
    const net = goldNet({
      tax: t.value, consumption: ctx.consumption, uGold: claimGold(spend, ctx.settings),
    });
    if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {
      winner = { tMax: t.value, binding: t.binding, sFood, spend };
    }
  }
  return winner;
}

/**
 * Score one site from its claimable `neighbours`. Food is planned first and
 * sets the tax; military sovereignty is fitted into what it leaves, never
 * costing tax. T_max may be negative. Null only when there is nothing to
 * evaluate.
 */
export function scoreSite({ neighbours, settings }) {
  return scoreSiteFrom(prepareSite({ neighbours, settings }));
}

/** scoreSite on an already prepared context. */
export function scoreSiteFrom(ctx) {
  const s = ctx.settings;
  const winner = siteCeiling(ctx);
  if (!winner) return null;

  // Plan at the settable (whole-number) rate. Rounding down frees headroom, so
  // this is never worse than the plan at the exact ceiling.
  const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);
  const cheaper = ctx.structure ? planSiteAt(ctx, plan.tax - 1) : null;

  // A minimum military bonus is met if any tax down to tMin reaches it.
  const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : (s.milsovMinBonus ?? 0);
  const floor = Math.min(s.tMin ?? 0, plan.tax);
  const reach = required > 0 && plan.milsovBonus < required && Number.isFinite(plan.tax)
    ? milsovAtFloor(ctx, { required, floor, ceiling: plan.tax })
    : null;

  return {
    ...plan,
    // Ranked at the whole-number rate; `tMaxExact` is the unrounded ceiling.
    tMax: plan.tax,
    tMaxExact: winner.tMax,
    // Named from the exact ceiling.
    binding: winner.binding,
    milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,
    // The highest tax reaching the minimum bonus, when it is not met for free.
    milsovMinTax: reach ? reach.tax : null,
    milsovMinBonusAt: reach ? reach.bonus : null,
    // Not reachable at any tax the user accepts.
    milsovShortfall: required > 0 && plan.milsovBonus < required && !reach,
  };
}

/** A site with no food plots reaches no finite tax; describe its cheapest plan. */
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
    uGold: claimGold(winner.spend, ctx.settings),
    goldNet: goldNet({
      tax: winner.tMax, consumption: ctx.consumption, uGold: claimGold(winner.spend, ctx.settings),
    }),
    surplus: null,
    tiles,
    free,
    headroom,
    milsov: [],
    milsovBonus: 0,
    milsovUpkeep: 0,
    milsovRp: 0,
    milsovGold: 0,
    milsovBlocked: ctx.structure
      ? milsovBlockedBy({
        hosts: free.filter((t) => !t.water), free, headroom, chancery: ctx.chancery,
      })
      : null,
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
