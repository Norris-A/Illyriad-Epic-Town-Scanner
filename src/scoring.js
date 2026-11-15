// The scoring engine: the tax ceilings, the food plan and the military plan.
// Shared by the Web Worker and the tests, so it uses no DOM or globals.

import {
  PRODUCTION_BASE,
  FARM_YIELD_L20,
  GOLD_PER_TAX_POP,
  CLAIM_RP_PER_LEVEL_DISTANCE,
  CLAIM_GOLD_PER_RP,
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

/** Points added to a resource's production percentage by its booster building. */
function boosterBonus(s, resource) {
  return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;
}

/**
 * Points the prestige boost adds to a production. Food's are counted in
 * computeBOther, so food call sites must not ask for them here.
 */
export function prestigeBonus(s, resource) {
  return s.prestige?.[resource] ? PRESTIGE_PRODUCTION_BONUS : 0;
}

function resourceBonus(s, resource) {
  return boosterBonus(s, resource) + prestigeBonus(s, resource);
}

/**
 * The surplus per hour the user has kept back from sovereignty, for any of
 * MINIMUM_KEYS. Missing or negative is no minimum.
 */
function resourceMinimum(s, resource) {
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
function basicProduction({ plots, yield: y, bonus, tax }) {
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
 * Upkeep for raising a claim from `held` to `level`, in research and gold.
 * Zero when the claim already stands at `level`, since kept claims are charged
 * separately.
 */
export function claimUpkeep(d, level, chancery = 1, held) {
  const from = held ?? 0;
  const rp = level > from ? claimRp(d, level, chancery) - claimRp(d, from, chancery) : 0;
  return { rp, gold: rp * CLAIM_GOLD_PER_RP };
}

const sumRp = (claims) => claims.reduce((sum, c) => sum + c.rp, 0);

// --- Structure upkeep ------------------------------------------------------

/**
 * The structure a placed building names. Unknown or missing names resolve to
 * the default, a Production Structure, so they are still charged upkeep.
 */
export function sovStructure(entry) {
  return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];
}

function isProductionStructure(entry) {
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
  const none = { ceiling: Infinity, binding: null, impossible: false };
  const upkeep = milsovUpkeep(milsovAssignments ?? []);
  const fixed = (res) => resourceMinimum(settings, res) + buildingUpkeep(settings, res);
  if (upkeep <= 0 && !BASIC_RESOURCES.some((res) => fixed(res) > 0)) return none;
  let worst = Infinity;
  let binding = null;
  for (const res of BASIC_RESOURCES) {
    // production(T) - upkeep - buildings >= minimum
    //   =>  T <= 125 + bonus - 100*(upkeep + buildings + minimum)/(plots*Y)
    const need = upkeep + fixed(res);
    const perPoint = plots[res] * BASIC_YIELD_L20;
    // No plots is a constraint only if something is owed.
    const ceiling = perPoint > 0
      ? PRODUCTION_BASE + resourceBonus(settings, res) - (100 * need) / perPoint
      : (need > 0 ? -Infinity : Infinity);
    if (ceiling < worst) {
      worst = ceiling;
      binding = res;
    }
  }
  return { ceiling: worst, binding, impossible: worst === -Infinity };
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
  const consumption = computeConsumption(s);

  const base = {
    food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),
    rp: researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, 'research'), tax }),
    gold: GOLD_PER_TAX_POP * tax * consumption,
  };
  const out = {
    tax,
    food: base.food - consumption,
    rp: base.rp - (uRp ?? 0) - (s.keptClaimRp ?? 0),
    gold: base.gold - (uGold ?? 0),
    upkeep,
    buildingUpkeep: {},
  };
  for (const res of BASIC_RESOURCES) {
    base[res] = basicProduction({
      plots: s.plots[res], yield: BASIC_YIELD_L20, bonus: resourceBonus(s, res), tax,
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

/** The plan's gold bill: its research plus the kept claims' (keptClaimRp), in gold. */
function claimGold(uRp, s) {
  return (uRp + (s?.keptClaimRp ?? 0)) * CLAIM_GOLD_PER_RP;
}

export function goldNet({ tax, consumption, uGold }) {
  return GOLD_PER_TAX_POP * tax * consumption - uGold;
}

// --- The food plan ---------------------------------------------------------

/**
 * 0/1 knapsack over food candidates: weight round(cost_RP), value food. Returns
 * the best S_food at every spend from 0 to budget, and the set chosen at each.
 * `maxItems` adds a count limit, used only when the building cap binds. An item
 * with `slot: false` raises a claim already standing, so it is not counted.
 */
export function knapsack(candidates, budget, maxItems = Infinity) {
  const needCountDim = candidates.filter((c) => c.slot !== false).length > maxItems;
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
    const used = candidates[i].slot === false ? 0 : 1;
    for (let c = maxItems; c >= used; c--) {
      for (let cap = budget; cap >= w; cap--) {
        const prev = dp[c - used][cap - w];
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
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (choice[i][count * width + cap] === 1) {
        chosen.push(i);
        cap -= candidates[i].weight;
        if (candidates[i].slot !== false) count--;
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
 *             buildings, the minimum and `upkeepUsed`, what kept structures
 *             already cost
 *  - `slots`  the building cap, less the buildings already placed
 *
 * A research-bound site has rp = 0; a resource with no plots gives upkeep = 0.
 */
export function milsovHeadroom({
  tax, settings, uRp = 0, buildingsUsed = 0, upkeepUsed = 0,
}) {
  const s = settings;
  const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);
  // An infinite tax would otherwise read as an infinite budget.
  if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };

  let upkeep = Infinity;
  for (const res of BASIC_RESOURCES) {
    const produced = basicProduction({
      plots: s.plots[res], yield: BASIC_YIELD_L20, bonus: resourceBonus(s, res), tax,
    });
    upkeep = Math.min(
      upkeep, produced - resourceMinimum(s, res) - buildingUpkeep(s, res) - upkeepUsed,
    );
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
 * `tiles` are free land tiles by ascending distance. They are grouped by the
 * points per level their terrain adds to the structure. Within a group every
 * tile is worth the same, and a claim's research cost is distance times a rate
 * that rises with level, so the cheapest arrangement puts the highest levels
 * nearest. A group's plan is then five layer counts m[1] >= ... >= m[5], m[j]
 * being how many of its tiles reach level j, and every cost is a sum of
 * per-layer terms:
 *
 *     bonus  = (5 + terrain) x SUM m[j]
 *     rp     = 10 x SUM RATE[j] x D_j(m[j])
 *     upkeep = SUM STEP[j] x m[j]
 *
 * where D_j(m) is the summed distance of the group's first m tiles not already
 * at level j, and RATE is the claim cost per level step: chancery for the first,
 * then 1. Research favours few near buildings; the rising upkeep steps favour
 * many low ones; a terrain bonus can make a further tile worth its research.
 * The search walks the groups' layers, richest group first, with a bound, and
 * breaks equal bonuses on lower research.
 *
 * `kept` are buildings of this structure the town keeps. Each goes first in its
 * group and is never planned below its `buildingLevel`, even past the budgets,
 * since it stands either way.
 *
 * Levels a tile already holds cost no research, which the order within a group
 * ignores, so a tile whose claim would have been cheaper to build on can be
 * missed. That only ever understates the plan.
 *
 * @param {number} [chancery] the paying city's chanceryFactor.
 * @param {string} [structure] the structure being placed; see descriptorBonus.
 * @returns {{placed: object[], levels: number[], bonus: number, rp: number,
 *   upkeep: number, buildings: number}} `levels[i]` is the level of `placed[i]`
 */
export function planMilsov({
  tiles, headroom, chancery = 1, structure, kept = [],
}) {
  const slots = Math.max(Math.floor(headroom.slots), kept.length);
  // RATE[j], indexed from 0 for level 1.
  const RATE = [chancery, 1, 1, 1, 1];
  const worth = (t) => MILSOV_BONUS_PER_LEVEL + descriptorBonus(t, structure);

  const groups = [];
  const add = (t, minLevel) => {
    let g = groups.find((x) => x.worth === worth(t));
    if (!g) {
      // floor[j]: how many of the group's tiles must reach level j+1.
      g = { worth: worth(t), tiles: [], floor: new Array(MILSOV_MAX_LEVEL).fill(0) };
      groups.push(g);
    }
    g.tiles.push(t);
    for (let j = 0; j < minLevel; j++) g.floor[j] += 1;
  };
  [...kept]
    .sort((a, b) => b.buildingLevel - a.buildingLevel || a.d - b.d)
    .forEach((t) => add(t, t.buildingLevel));
  tiles.forEach((t) => add(t, 0));
  groups.sort((a, b) => b.worth - a.worth);
  for (const g of groups) {
    // D[j][m]: summed distance of the group's first m tiles not already at level j+1.
    g.D = [];
    for (let j = 0; j < MILSOV_MAX_LEVEL; j++) {
      const pre = [0];
      g.tiles.forEach((t, i) => pre.push(pre[i] + ((t.held ?? 0) > j ? 0 : t.d)));
      g.D.push(pre);
    }
    g.rpOf = (j, m) => CLAIM_RP_PER_LEVEL_DISTANCE * RATE[j] * g.D[j][m];
  }

  const finish = (counts) => {
    const placed = [];
    const levels = [];
    let bonus = 0;
    let rp = 0;
    let upkeep = 0;
    groups.forEach((g, c) => {
      g.tiles.forEach((t, i) => {
        const level = counts[c].filter((m) => m > i).length;
        if (level === 0) return;
        placed.push(t);
        levels.push(level);
        bonus += level * g.worth;
      });
      counts[c].forEach((m, j) => {
        rp += g.rpOf(j, m);
        upkeep += MILSOV_UPKEEP_STEP[j] * m;
      });
    });
    return { placed, levels, bonus, rp, upkeep, buildings: placed.length };
  };

  // Skip the search when every tile fits and both budgets cover all of them at
  // the top level.
  const all = groups.reduce((sum, g) => sum + g.tiles.length, 0);
  const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);
  const topRp = groups.reduce((sum, g) =>
    sum + g.D.reduce((s, _, j) => s + g.rpOf(j, g.tiles.length), 0), 0);
  if (all <= slots && topRp <= headroom.rp + EPS && layerTotal * all <= headroom.upkeep + EPS) {
    return finish(groups.map((g) => new Array(MILSOV_MAX_LEVEL).fill(g.tiles.length)));
  }

  // The most bonus the groups from `c` on could add with `free` slots beyond
  // their kept buildings': every slot filled at the top level, richest group
  // first.
  const restBound = (c, free) => {
    let bound = 0;
    let left = free;
    for (let i = c; i < groups.length; i++) {
      const n = Math.min(groups[i].floor[0] + left, groups[i].tiles.length);
      bound += MILSOV_MAX_LEVEL * n * groups[i].worth;
      left -= n - groups[i].floor[0];
    }
    return bound;
  };

  // Every group's level steps, best bonus per cost first, where a step costs
  // the least it can: its upkeep, or its research on the group's nearest tile,
  // nothing on a tile already holding that level.
  const byValue = (steps) => steps
    .map((s) => ({ ...s, ratio: s.cost > 0 ? groups[s.c].worth / s.cost : Infinity }))
    .sort((a, b) => b.ratio - a.ratio || a.c - b.c);
  const upkeepSteps = [];
  const rpSteps = [];
  groups.forEach((g, c) => {
    for (let k = 0; k < MILSOV_MAX_LEVEL; k++) {
      upkeepSteps.push({ c, k, cost: MILSOV_UPKEEP_STEP[k], cap: Infinity });
      const bare = g.tiles.filter((t) => (t.held ?? 0) <= k);
      rpSteps.push({ c, k, cost: 0, cap: g.tiles.length - bare.length });
      if (bare.length) {
        const nearest = Math.min(...bare.map((t) => t.d));
        rpSteps.push({ c, k, cost: CLAIM_RP_PER_LEVEL_DISTANCE * RATE[k] * nearest, cap: Infinity });
      }
    }
    // floorFrom[j]: the bonus of the kept buildings' floors from level j+1 up.
    g.floorFrom = [0];
    for (let k = MILSOV_MAX_LEVEL - 1; k >= 0; k--) {
      g.floorFrom.unshift(g.floorFrom[0] + g.floor[k] * g.worth);
    }
  });
  const upkeepOrder = byValue(upkeepSteps);
  const rpOrder = byValue(rpSteps);

  // The most bonus `budget` could still buy after group `c` has `v` tiles at
  // level j+1, ignoring the other budget and the order levels are bought in:
  // the steps left are bought in `order`, the last one in part. Kept
  // buildings' floors are added on top, as they stand either way.
  const budgetBound = (order, c, j, v, free, budget) => {
    let bound = groups[c].floorFrom[j + 1];
    for (let i = c + 1; i < groups.length; i++) bound += groups[i].floorFrom[0];
    let left = Math.max(0, budget);
    for (const s of order) {
      let n = 0;
      if (s.c === c) n = s.k > j ? v : 0;
      else if (s.c > c) n = Math.min(groups[s.c].floor[0] + free, groups[s.c].tiles.length);
      n = Math.min(n, s.cap);
      if (n <= 0) continue;
      const perLevel = groups[s.c].worth;
      if (s.cost === 0) {
        bound += n * perLevel;
        continue;
      }
      const take = Math.min(n, left / s.cost);
      bound += take * perLevel;
      left -= take * s.cost;
      if (left <= 0) break;
    }
    return bound;
  };

  const m = groups.map(() => new Array(MILSOV_MAX_LEVEL).fill(0));
  let best = null;

  // `rp`, `upkeep` and `used` start with every kept building's floor paid, so
  // no group spends what a later group's kept buildings need; each layer then
  // adds only what it takes above its floor.
  const search = (c, j, bonus, rp, upkeep, used) => {
    if (c === groups.length) {
      if (!best || bonus > best.bonus + EPS || (bonus > best.bonus - EPS && rp < best.rp - EPS)) {
        best = { counts: m.map((x) => [...x]), bonus, rp };
      }
      return;
    }
    if (j === MILSOV_MAX_LEVEL) {
      search(c + 1, 0, bonus, rp, upkeep, used);
      return;
    }
    const g = groups[c];
    const floor = g.floor[j];
    const rpAbove = (v) => g.rpOf(j, v) - g.rpOf(j, floor);
    const upkeepAbove = (v) => MILSOV_UPKEEP_STEP[j] * (v - floor);
    const cap = j === 0 ? Math.min(g.tiles.length, floor + slots - used) : m[c][j - 1];
    let vMax = floor;
    while (vMax < cap
        && rp + rpAbove(vMax + 1) <= headroom.rp + EPS
        && upkeep + upkeepAbove(vMax + 1) <= headroom.upkeep + EPS) vMax++;

    for (let v = vMax; v >= floor; v--) {
      // No later layer of this group may exceed this one, and later groups are
      // worth no more per level, so this bounds what is left; it only falls with
      // v. Branches that can only tie survive, for the research tie-break.
      const free = slots - used - (j === 0 ? v - floor : 0);
      if (best) {
        const bound = bonus + (MILSOV_MAX_LEVEL - j) * v * g.worth + restBound(c + 1, free);
        if (bound < best.bonus - EPS) break;
        if (bound < best.bonus + EPS && rp >= best.rp - EPS) break;
        // Not monotone in v: a smaller layer frees budget for others.
        const byBudget = bonus + v * g.worth + Math.min(
          budgetBound(upkeepOrder, c, j, v, free, headroom.upkeep - upkeep - upkeepAbove(v)),
          budgetBound(rpOrder, c, j, v, free, headroom.rp - rp - rpAbove(v)),
        );
        if (byBudget < best.bonus - EPS) continue;
        if (byBudget < best.bonus + EPS && rp >= best.rp - EPS) continue;
      }
      m[c][j] = v;
      search(c, j + 1, bonus + v * g.worth, rp + rpAbove(v),
        upkeep + upkeepAbove(v), used + (j === 0 ? v - floor : 0));
    }
    m[c][j] = 0;
  };
  let floorRp = 0;
  let floorUpkeep = 0;
  for (const g of groups) {
    g.floor.forEach((n, j) => {
      floorRp += g.rpOf(j, n);
      floorUpkeep += MILSOV_UPKEEP_STEP[j] * n;
    });
  }
  search(0, 0, 0, floorRp, floorUpkeep, kept.length);

  return finish(best.counts);
}

/**
 * Place a chosen plan on its tiles. Each claim is at its building's level,
 * since a claim above its building buys nothing.
 */
function milsovClaims({ placed, levels, structure, chancery }) {
  return levels.map((level, i) => {
    const held = placed[i].held ?? 0;
    return {
      ...placed[i],
      structure,
      // A standing claim keeps its level.
      sovLevel: Math.max(level, held),
      buildingLevel: level,
      ...claimUpkeep(placed[i].d, level, chancery, held),
    };
  });
}

/** Why no military sovereignty was placed, as a key into MILSOV_BLOCKED_TEXT. */
function milsovBlockedBy({ hosts, free, headroom, chancery }) {
  if (free.length === 0) return 'tiles';
  if (hosts.length === 0) return 'water';
  if (headroom.slots < 1) return 'slots';
  if (headroom.upkeep + EPS < MILSOV_UPKEEP_BY_LEVEL[1]) return 'upkeep';
  const nearest = hosts.reduce((d, t) => Math.min(d, (t.held ?? 0) > 0 ? 0 : t.d), Infinity);
  const cheapest = claimUpkeep(nearest, 1, chancery).rp;
  if (headroom.rp + EPS < cheapest) return 'rp';
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
  const structure = s.milsovStructure || null;

  // Equal distances put the lower food rating first, for military hosts.
  const tiles = neighbours
    .map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) }))
    .sort((a, b) => a.d - b.d || a.food - b.food);

  // A building the town keeps stands at every tax, in its slot. A kept food
  // claim may still be raised to Sov V.
  const isKept = (t) => t.held > 0 && !!t.heldStructure;
  const isFood = (t) => SOV_STRUCTURE_BY_KEY[t.heldStructure].boosts === 'food';
  const keptStructures = tiles.filter((t) => isKept(t) && !isFood(t)).map((t) => ({
    ...t,
    structure: t.heldStructure,
    sovLevel: t.held,
    buildingLevel: t.heldBuilding,
    rp: 0,
    gold: 0,
  }));
  const byDistance = tiles.filter((t) => !isKept(t) || isFood(t));
  const keptFood = byDistance.filter(isKept).map((t) => ({ ...t, level: t.held, rp: 0, gold: 0 }));
  // Kept buildings of the planned structure are planned on and may be raised;
  // the rest stand as they are.
  const keptHosts = keptStructures.filter((k) => k.structure === structure);
  // The building's level sets a food claim's bonus; the claim's level sets its cost.
  const foodAtLevel = (t) => (t.food * t.heldBuilding) / FOOD_CLAIM_LEVEL;

  // A tile already holding part of a level 5 claim is charged only the rest.
  const foodClaim = (t) => {
    const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery, t.held);
    // Rounded up, so a set of claims never costs more than the spend it fits.
    return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.ceil(Math.max(0, up.rp - EPS)) };
  };
  const foodCandidates = [
    ...byDistance.filter((t) => t.food > 0 && !isKept(t)).map(foodClaim),
    // Raising a kept claim adds the rest of its food, in the slot it already has.
    ...keptFood.filter((t) => foodAtLevel(t) < t.food).map((t) => ({
      ...foodClaim(t), food: t.food - foodAtLevel(t), slot: false, raises: true,
    })),
  ];
  // The most research the city can produce, at 0% tax; a smaller budget would
  // truncate the knapsack.
  const rpBonus = prestigeBonus(s, 'research');
  const budget = Math.max(0, Math.round(researchAt({ research: computeResearch(s), rpBonus, tax: 0 })));
  const dp = knapsack(
    foodCandidates, budget, Math.max(0, maxBuildings - keptFood.length - keptStructures.length),
  );
  const keptFoodTotal = keptFood.reduce((sum, t) => sum + foodAtLevel(t), 0);
  for (let spend = 0; spend <= budget; spend++) dp.best[spend] += keptFoodTotal;

  return {
    settings: s,
    chancery,
    structure,
    k: computeK(s.plots.food),
    bOther: computeBOther(s),
    consumption: computeConsumption(s),
    research: computeResearch(s),
    rpBonus,
    minFood: resourceMinimum(s, 'food'),
    minRp: resourceMinimum(s, 'research'),
    byDistance,
    keptFood,
    keptStructures,
    keptHosts,
    keptFixed: keptStructures.filter((k) => !keptHosts.includes(k)),
    foodCandidates,
    budget,
    dp,
  };
}

/** The food claims chosen at a spend, and the research they cost. */
function foodClaims(ctx, spend) {
  const chosen = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);
  const raised = new Map(chosen.filter((c) => c.raises).map((c) => [c.idx, c]));
  const tiles = [
    // A raising candidate carries only the food it adds; the claim gives it all.
    ...ctx.keptFood.map((t) => (raised.has(t.idx) ? { ...raised.get(t.idx), food: t.food } : t)),
    ...chosen.filter((c) => !c.raises),
  ];
  return { spend, tiles, rp: sumRp(tiles) };
}

/**
 * The cheapest spend whose food holds `tax`, or null if none does. Below the
 * site's maximum a cheaper food plan suffices, which frees research for
 * military sovereignty. Whether the research affords it is the caller's check.
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
  return lo;
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
  const cheapest = foodSpendFor(ctx, tax);
  let food = cheapest === null ? null : foodClaims(ctx, cheapest);
  const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
  const holds = !!food && produced - food.rp - ctx.minRp >= -EPS;
  if (!holds) {
    if (!bestEffort) return null;
    food = foodClaims(ctx, bestFoodSpend(ctx, tax));
  }
  const { spend, tiles, rp: foodRp } = food;
  const claimed = new Set(tiles.map((t) => t.idx));
  const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
  // Water takes no structure.
  const hosts = free.filter((t) => !t.water);
  const fixedUpkeep = milsovUpkeep(ctx.keptFixed);
  const headroom = milsovHeadroom({
    tax,
    settings: s,
    uRp: foodRp,
    buildingsUsed: tiles.length + ctx.keptFixed.length,
    upkeepUsed: fixedUpkeep,
  });
  const military = planMilsov({
    tiles: ctx.structure ? hosts : [],
    headroom,
    chancery: ctx.chancery,
    structure: ctx.structure,
    kept: ctx.keptHosts,
  });
  const placed = milsovClaims({
    placed: military.placed, levels: military.levels, structure: ctx.structure, chancery: ctx.chancery,
  });
  const milsov = [...ctx.keptFixed, ...placed];

  const sFood = ctx.dp.best[spend];
  const milsovRp = sumRp(milsov);
  const uRp = foodRp + milsovRp;
  const uGold = claimGold(uRp, s);
  const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });
  const ceiling = tMax({
    food: tFood({
      bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k, minimum: ctx.minFood,
    }),
    rp: tRp({ uRp, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
    res: resCeiling.ceiling,
  });

  return {
    tax,
    // False when the plan is at a tax the site cannot hold.
    holds,
    tMax: ceiling.value,
    binding: ceiling.binding,
    sFood,
    spend,
    uRp,
    uGold,
    goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
    surplus: surplusAt({ tax, settings: s, sFood, uRp, uGold, milsovAssignments: milsov }),
    tiles,
    free,
    headroom,
    milsov,
    milsovBonus: military.bonus,
    milsovUpkeep: military.upkeep + fixedUpkeep,
    milsovRp,
    milsovGold: milsov.reduce((sum, a) => sum + a.gold, 0),
    milsovBlocked: ctx.structure && placed.length === 0
      ? milsovBlockedBy({ hosts, free, headroom, chancery: ctx.chancery })
      : null,
    resCeiling: resCeiling.ceiling,
    resBinding: resCeiling.binding,
    resImpossible: resCeiling.impossible,
  };
}

/**
 * The highest whole-number tax down to `floor` that reaches `required`
 * military bonus, by bisection: the bonus only rises as the tax falls. Returns
 * `{ bonus, tax }`, or null when even the floor falls short.
 */
function milsovAtFloor(ctx, { required, floor, ceiling }) {
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
 * @returns {{tMax: number, binding: string, sFood: number, spend: number}}
 */
function siteCeiling(ctx) {
  const res = tRes({
    milsovAssignments: ctx.keptStructures, plots: ctx.settings.plots, settings: ctx.settings,
  }).ceiling;
  const ceilingAt = (sFood, uRp) => tMax({
    food: tFood({
      bOther: ctx.bOther, sFood, consumption: ctx.consumption, k: ctx.k, minimum: ctx.minFood,
    }),
    rp: tRp({ uRp, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
    res,
  });
  let winner = null;
  for (let spend = 0; spend <= ctx.budget; spend++) {
    const sFood = ctx.dp.best[spend];
    const t = ceilingAt(sFood, spend);
    // A negative T_max is a real answer; the caller filters on tMin.
    const net = goldNet({
      tax: t.value, consumption: ctx.consumption, uGold: claimGold(spend, ctx.settings),
    });
    if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {
      winner = { tMax: t.value, binding: t.binding, sFood, spend };
    }
  }
  // The walk prices each spend at its whole-number weight; the winner's ceiling
  // is then taken from what its claims cost.
  const exact = ceilingAt(winner.sFood, foodClaims(ctx, winner.spend).rp);
  return { ...winner, tMax: exact.value, binding: exact.binding };
}

/**
 * Score one site from its claimable `neighbours`. Food is planned first and
 * sets the tax; military sovereignty is fitted into what it leaves, never
 * costing tax. T_max may be negative.
 */
export function scoreSite({ neighbours, settings }) {
  return scoreSiteFrom(prepareSite({ neighbours, settings }));
}

/** scoreSite on an already prepared context. */
export function scoreSiteFrom(ctx) {
  const s = ctx.settings;
  const winner = siteCeiling(ctx);

  // Plan at the settable (whole-number) rate. Rounding down frees headroom, so
  // this is never worse than the plan at the exact ceiling.
  const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);

  // A minimum military bonus is met if any tax down to tMin reaches it.
  // The form disables the minimum while no structure is chosen, so it asks nothing.
  const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : 0;
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
    // The highest tax reaching the minimum bonus, when it is not met for free.
    milsovMinTax: reach ? reach.tax : null,
    milsovMinBonusAt: reach ? reach.bonus : null,
    // Not reachable at any tax the user accepts.
    milsovShortfall: required > 0 && plan.milsovBonus < required && !reach,
  };
}

/**
 * The cheapest plan of a site that reaches no finite tax: one with no food
 * plots, or one owing a basic resource it has no plots of.
 */
function fallbackPlan(ctx, winner) {
  const { tiles } = foodClaims(ctx, winner.spend);
  const claimed = new Set(tiles.map((t) => t.idx));
  const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
  const keptUpkeep = milsovUpkeep(ctx.keptStructures);
  const headroom = milsovHeadroom({
    tax: winner.tMax,
    settings: ctx.settings,
    uRp: winner.spend,
    buildingsUsed: tiles.length + ctx.keptStructures.length,
    upkeepUsed: keptUpkeep,
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
    milsov: ctx.keptStructures,
    milsovBonus: ctx.keptHosts.reduce((sum, k) =>
      sum + k.buildingLevel * (MILSOV_BONUS_PER_LEVEL + descriptorBonus(k, ctx.structure)), 0),
    milsovUpkeep: keptUpkeep,
    milsovRp: 0,
    milsovGold: 0,
    milsovBlocked: ctx.structure
      ? milsovBlockedBy({
        hosts: free.filter((t) => !t.water), free, headroom, chancery: ctx.chancery,
      })
      : null,
    resCeiling: Infinity,
    resBinding: null,
    resImpossible: false,
  };
}

/** Plan ordering: higher T_max, then lower U_RP, then higher Gold_net. */
function betterPlan(a, b) {
  if (a.tMax > b.tMax + EPS) return true;
  if (a.tMax < b.tMax - EPS) return false;
  if (a.uRp < b.uRp - EPS) return true;
  if (a.uRp > b.uRp + EPS) return false;
  return a.goldNet > b.goldNet;
}
