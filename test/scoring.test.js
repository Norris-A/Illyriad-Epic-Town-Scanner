// The worked example below is the oracle for this engine: a 7-food site with a
// standard city, reaching 56.6% tax on 100 food for 1,000 RP. If these fail, the
// model has drifted — fix the model or the expectation deliberately, not both.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeK, computeBOther, computeConsumption, computeRRef,
  tFood, tRp, tMax, goldNet, claimUpkeep, distance, knapsack, recoverSet, scoreSite,
  milsovHeadroom, planMilsov, tRes, surplusAt, computeBasicYield,
  prepareSite, planSiteAt, settableTax,
} from '../src/scoring.js';
import {
  DEFAULT_SETTINGS, BASIC_YIELD_L20, BASIC_RESOURCES,
  MILSOV_UPKEEP_BY_LEVEL, MILSOV_BONUS_PER_LEVEL, CHANCERY_FACTOR,
  PRESTIGE_PRODUCTION_BONUS, PRESTIGE_KEYS, RESOURCE_BOOSTER_BONUS,
  CLAIM_RP_PER_LEVEL_DISTANCE, descriptorFor,
} from '../src/constants.js';

const close = (a, b, eps = 0.05) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// The worked example's settings: 7-food site, a city eating 32,200/hr, Flour
// Mill on, Nature's Bounty at 2 retreats, no other bonus, Library 20 with
// Allembine, no Insight, no Chancery, no military sovereignty.
//
// The consumption is stated here rather than taken from DEFAULT_SETTINGS: it is
// part of the oracle, so changing the default must not move every expectation
// below with it.
const worked = { ...DEFAULT_SETTINGS, cityConsumption: 32200 };

/** The same settings with a military structure asked for. */
const withMil = (extra = {}) => ({ ...worked, milsovStructure: 'trainingGround', ...extra });

test('K = 7 x 2014 / 100 = 140.98', () => {
  close(computeK(7), 140.98);
  close(computeK(5), 100.70);
});

test("B_other = Flour Mill 40 + Nature's Bounty 20 = 60", () => {
  close(computeBOther(worked), 60);
});

test('the 20 points the baseline needs are the spell, and are counted once', () => {
  // They used to sit in a free "other" field as an unattributed residual while
  // the spell defaulted off, so a city that actually had the spell was scored
  // with both — 80 points where the baseline calls for 60. Every food bonus now
  // has a named field, and B_other is the only place any of them are totalled.
  close(computeBOther(worked), 60, 1e-9);
  close(computeBOther({ ...worked, naturesBounty: false }), 40, 1e-9);

  // Each retreat count is worth its own table entry, spell on or off.
  for (const [retreats, bonus] of [[0, 8], [1, 16], [2, 20], [3, 22], [4, 23]]) {
    close(computeBOther({ ...worked, geomancerRetreats: retreats }), 40 + bonus, 1e-9);
  }
});

test('the baseline the 20 points were inferred from still reproduces', () => {
  // 22,400 food/hr at 25% tax is the figure the whole model is calibrated on.
  const food = computeK(7) * (100 + computeBOther(worked));
  close(food, 22400, 160);
});

test('C / K = 32,200 / 140.98 = 228.4', () => {
  close(computeConsumption(worked) / computeK(7), 228.4, 0.1);
});

test('R_ref = 1,600 at Library 20 with Allembine', () => {
  close(computeRRef(worked), 1600);
});

test('R_ref calibration back-solves from an observed reading', () => {
  // 800 RP/hr observed at 25% tax -> 800 * 100/100 = 800
  close(computeRRef({ ...worked, rpCalibration: { observedRpPerHour: 800, atTax: 25 } }), 800);
});

test('S_food 100 at 1,000 RP is food-bound at 56.6%', () => {
  const k = computeK(7);
  const bOther = computeBOther(worked);
  const consumption = computeConsumption(worked);
  const rRef = computeRRef(worked);

  const food = tFood({ bOther, sFood: 100, consumption, k });
  const rp = tRp({ uRp: 1000, rRef });
  close(food, 56.6, 0.05);
  close(rp, 62.5);

  const t = tMax({ food, rp, res: Infinity });
  close(t.value, 56.6, 0.05);
  assert.equal(t.binding, 'food');

  close(goldNet({ tax: t.value, consumption, uGold: 10000 }), 62901, 5);
});

test('claim upkeep matches the reference table', () => {
  close(claimUpkeep(distance(1, 0), 5, false).rp, 50.0);
  close(claimUpkeep(distance(1, 1), 5, false).rp, 70.7);
  close(claimUpkeep(distance(2, 0), 5, false).rp, 100.0);
  close(claimUpkeep(distance(2, 1), 5, false).rp, 111.8);
  close(claimUpkeep(distance(2, 2), 5, false).rp, 141.4);
  // gold is exactly 10x RP
  close(claimUpkeep(distance(1, 0), 5, false).gold, 500.0);
  // Chancery of Estates: -40%
  close(claimUpkeep(1, 1, true).rp, 6);
  close(claimUpkeep(1, 1, true).gold, 60);
});

test('the full inner ring of 8 at L5 costs 482.8 RP/hr', () => {
  let total = 0;
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
    total += claimUpkeep(distance(dx, dy), 5, false).rp;
  }
  close(total, 482.8, 0.1);
});

test('knapsack maximises food per RP and the set is recoverable', () => {
  const candidates = [
    { weight: 50, food: 7 },
    { weight: 71, food: 9 },
    { weight: 100, food: 3 },
  ];
  const dp = knapsack(candidates, 121);
  close(dp.best[121], 16);            // both cheap tiles fit
  close(dp.best[50], 7);
  const chosen = recoverSet(candidates, dp, 121);
  assert.deepEqual(chosen, [0, 1]);
});

// --- Count-limited (building cap) knapsack ---------------------------------

const sumBy = (items, field) => items.reduce((n, x) => n + x[field], 0);

// Food is not ordered by weight, so the cap has to choose rather than take the
// cheapest run.
const capCandidates = [
  { weight: 50, food: 4 }, { weight: 55, food: 9 }, { weight: 60, food: 2 },
  { weight: 65, food: 8 }, { weight: 70, food: 5 }, { weight: 71, food: 11 },
  { weight: 80, food: 3 }, { weight: 90, food: 7 }, { weight: 100, food: 6 },
  { weight: 110, food: 10 },
];

test('the count-limited set is recoverable and matches best[spend]', () => {
  const maxItems = 4;
  const budget = 400;
  const dp = knapsack(capCandidates, budget, maxItems);
  assert.equal(dp.countLimited, true, 'the cap must actually bind');

  const chosen = recoverSet(capCandidates, dp, budget);
  const tiles = chosen.map((i) => capCandidates[i]);
  assert.equal(tiles.length, maxItems, 'the cap binds, so exactly maxItems tiles');
  close(sumBy(tiles, 'food'), dp.best[budget], 1e-9);
  assert.deepEqual([...chosen].sort((a, b) => a - b), chosen, 'indices ascending');
  assert.equal(new Set(chosen).size, chosen.length, 'no item claimed twice');
});

test('recovered weights never exceed the spend they were recovered at', () => {
  const dp = knapsack(capCandidates, 400, 4);
  for (let spend = 0; spend <= 400; spend++) {
    const tiles = recoverSet(capCandidates, dp, spend).map((i) => capCandidates[i]);
    assert.ok(sumBy(tiles, 'weight') <= spend, `spend ${spend} overspent`);
    assert.ok(tiles.length <= 4, `spend ${spend} broke the building cap`);
    close(sumBy(tiles, 'food'), dp.best[spend], 1e-9);
  }
});

test('with the cap slack, the 1-D and 2-D paths agree on the same input', () => {
  const budget = 400;
  // maxItems >= candidates.length keeps the 1-D path; one below forces 2-D but
  // cannot bind harder than the optimum at this budget.
  const fast = knapsack(capCandidates, budget, capCandidates.length);
  const slow = knapsack(capCandidates, budget, capCandidates.length - 1);
  assert.equal(fast.countLimited, false);
  assert.equal(slow.countLimited, true);
  for (let spend = 0; spend <= budget; spend++) close(fast.best[spend], slow.best[spend], 1e-9);

  const a = recoverSet(capCandidates, fast, budget).map((i) => capCandidates[i]);
  const b = recoverSet(capCandidates, slow, budget).map((i) => capCandidates[i]);
  close(sumBy(a, 'food'), sumBy(b, 'food'), 1e-9);
  assert.ok(sumBy(a, 'weight') <= budget && sumBy(b, 'weight') <= budget);
});

/** The full R=2 neighbourhood, food from a callback. */
const ring = (food) => {
  const out = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      out.push({ dx, dy, food: food(dx, dy) });
    }
  }
  return out;
};

// A ring of eight 7-food tiles: comfortably scoreable, so anything that removes
// it from the results came from the resource ceiling and nothing else.
const ring8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
  .map(([dx, dy]) => ({ dx, dy, food: 7 }));

// Eight inner tiles the food plan wants and sixteen outer ones it will not
// touch — the ordinary shape of a site with military sovereignty to spare.
const spare = ring((dx, dy) => (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 ? 9 : 0));

test('scoreSite still reports its tile plan when the building cap binds', () => {
  // 24 claimable neighbours against a cap of 20.
  const neighbours = ring((dx, dy) => 2 + ((dx * 5 + dy + 12) % 7));
  assert.equal(neighbours.length, 24);
  const plan = scoreSite({ neighbours, settings: { ...worked, tMin: 0, maxBuildings: 20 } });
  assert.ok(plan.tiles.length > 0, 'the plan must not come back empty');
  assert.ok(plan.tiles.length <= 20, 'the building cap must hold');
  close(sumBy(plan.tiles, 'food'), plan.sFood, 1e-9);
  assert.ok(sumBy(plan.tiles, 'weight') <= plan.uRp + 1e-9, 'plan must fit its own RP spend');
});

test('the optimum is where ceilings cross, not maximum food', () => {
  // A ring of eight 7-food tiles plus one absurdly expensive 16-food water tile.
  const neighbours = [...ring8, { dx: 2, dy: 2, food: 16 }];
  const plan = scoreSite({ neighbours, settings: { ...worked, tMin: 0 } });
  assert.ok(plan, 'a plan should be found');
  assert.ok(plan.tMax > 0);
  assert.ok(['food', 'rp', 'cap'].includes(plan.binding));
  // Every claimed tile is level 5 — the food bonus requires it.
  for (const t of plan.tiles) assert.equal(t.level, 5);
});

// --- Food first, military out of the change --------------------------------

test('asking for military sovereignty never costs the site a point of tax', () => {
  // The rule the whole ordering exists to enforce, swept over random sites
  // because the interaction it turns on is the knapsack's, not the tile's.
  let seed = 20260805;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  let placed = 0;
  for (let trial = 0; trial < 80; trial++) {
    const neighbours = ring(() => rnd(17)).filter(() => rnd(10) >= 2);
    const settings = {
      ...worked, tMin: -1000,
      rpCalibration: { observedRpPerHour: 200 + rnd(6000), atTax: 25 },
    };
    const food = scoreSite({ neighbours, settings });
    const mil = scoreSite({ neighbours, settings: { ...settings, milsovStructure: 'trainingGround' } });
    if (!food || !mil) continue;
    const why = `trial ${trial}: ${food.tMax} -> ${mil.tMax}`;

    close(mil.tMax, food.tMax, 1e-9);
    // Not merely the same tax — the same food plan, untouched.
    close(mil.sFood, food.sFood, 1e-9);
    assert.equal(mil.tiles.length, food.tiles.length, why);

    // A tile is never both a food claim and a military host.
    const hosts = new Set(mil.milsov.map((m) => `${m.dx},${m.dy}`));
    for (const t of mil.tiles) assert.ok(!hosts.has(`${t.dx},${t.dy}`), `${why}: tile claimed twice`);
    assert.equal(hosts.size, mil.milsov.length, `${why}: a tile hosted twice`);
    if (mil.milsov.length) placed++;
  }
  assert.ok(placed > 0, 'the sweep never actually placed a building');
});

test('the buildings land on the tiles the food plan did not want', () => {
  // Eight 9-food tiles the food plan takes, and two worthless outer ones it
  // will not. Military sovereignty gets the leftovers, nearest of them first.
  const neighbours = [...ring8.map((t) => ({ ...t, food: 9 })),
    { dx: 2, dy: 0, food: 0 }, { dx: 2, dy: 2, food: 0 }];
  const plan = scoreSite({ neighbours, settings: withMil({ tMin: -1000 }) });

  assert.ok(plan.milsov.length > 0, 'something should fit');
  for (const m of plan.milsov) assert.equal(m.food, 0, 'a food tile was burned');
  // Nearest free tile first: d = 2 before d = 2.83.
  close(plan.milsov[0].d, 2, 1e-9);
});

test('the building always matches its claim, and levels fall with distance', () => {
  // A claim above its building buys nothing — bonus and hourly upkeep both
  // follow the building — so the engine never plans one. And research is level
  // times distance, so the highest levels belong nearest.
  const plan = scoreSite({
    neighbours: ring(() => 0),          // no food at all: every tile is free
    settings: withMil({ tMin: -1000 }),
  });
  assert.ok(plan.milsov.length > 1);
  let previous = Infinity;
  for (const m of plan.milsov) {
    assert.equal(m.buildingLevel, m.sovLevel, 'a claim above its building is dominated');
    assert.ok(m.buildingLevel <= previous, 'levels must not rise with distance');
    previous = m.buildingLevel;
  }
  for (let i = 1; i < plan.milsov.length; i++) {
    assert.ok(plan.milsov[i].d >= plan.milsov[i - 1].d - 1e-9, 'hosts must be nearest-first');
  }
});

test('several low-level buildings beat one high one when upkeep is what binds', () => {
  // Three tiles at the same distance, so research cannot tell the splits apart:
  // 3x Sov I and 1x Sov III both cost 30 RP and both give +15%. The hourly bill
  // does tell them apart — 450 against 600 — so the spread plan is the answer.
  const tiles = [{ d: 1 }, { d: 1 }, { d: 1 }];
  const spread = planMilsov({ tiles, headroom: { rp: 1000, upkeep: 450, slots: 3 }, chancery: false });
  assert.equal(spread.bonus, 15);
  assert.deepEqual(spread.levels, [1, 1, 1]);
  assert.equal(spread.upkeep, 450);

  // Take the tiles away and the same bonus has to be concentrated, at the
  // higher bill — which is why this is a property of the site, not a rule.
  const squeezed = planMilsov({ tiles, headroom: { rp: 1000, upkeep: 600, slots: 1 }, chancery: false });
  assert.equal(squeezed.bonus, 15);
  assert.deepEqual(squeezed.levels, [3]);
  assert.equal(squeezed.upkeep, 600);
});

test('research pulls the other way: a nearer tile is worth more than a spread', () => {
  // One tile at d = 1 and one at d = 10. Spreading costs 110 RP for +10%;
  // stacking the near tile costs 20 for the same, and research is what is short.
  const tiles = [{ d: 1 }, { d: 10 }];
  const plan = planMilsov({ tiles, headroom: { rp: 100, upkeep: 1e9, slots: 2 }, chancery: false });
  assert.deepEqual(plan.levels, [5], 'the far tile is not worth reaching');
  assert.equal(plan.bonus, 25);
});

test('the plan never outspends any of its three budgets', () => {
  let seed = 777;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  for (let trial = 0; trial < 500; trial++) {
    const n = 1 + rnd(8);
    const tiles = Array.from({ length: n }, () => ({ d: 1 + rnd(2000) / 1000 }))
      .sort((a, b) => a.d - b.d);
    const headroom = { rp: rnd(500), upkeep: rnd(6000), slots: rnd(n + 2) };
    const chancery = trial % 3 === 0;
    const plan = planMilsov({ tiles, headroom, chancery });

    assert.ok(plan.rp <= headroom.rp + 1e-9, `trial ${trial}: overspent research`);
    assert.ok(plan.upkeep <= headroom.upkeep + 1e-9, `trial ${trial}: overspent upkeep`);
    assert.ok(plan.buildings <= headroom.slots, `trial ${trial}: broke the building cap`);
    assert.ok(plan.buildings <= n, `trial ${trial}: placed more buildings than tiles`);
    // The three figures are consistent with the levels they came back with.
    const f = chancery ? CHANCERY_FACTOR : 1;
    close(plan.bonus, MILSOV_BONUS_PER_LEVEL * plan.levels.reduce((a, b) => a + b, 0), 1e-9);
    close(plan.upkeep, plan.levels.reduce((a, l) => a + MILSOV_UPKEEP_BY_LEVEL[l], 0), 1e-9);
    close(plan.rp, plan.levels.reduce((a, l, i) => a + 10 * l * tiles[i].d * f, 0), 1e-6);
  }
});

test('the plan is the best one those budgets can buy, not merely a good one', () => {
  // Brute force over every level assignment, which is only tractable for a
  // handful of tiles — but it is the definition the layer decomposition claims
  // to compute exactly, so it is worth checking against directly.
  const brute = (tiles, headroom, chancery) => {
    const f = chancery ? CHANCERY_FACTOR : 1;
    const n = Math.min(tiles.length, Math.floor(headroom.slots));
    let best = 0;
    const rec = (i, rp, up, bonus) => {
      if (rp > headroom.rp + 1e-9 || up > headroom.upkeep + 1e-9) return;
      if (i === n) {
        if (bonus > best) best = bonus;
        return;
      }
      for (let level = 0; level <= 5; level++) {
        rec(i + 1, rp + 10 * level * tiles[i].d * f,
          up + (level ? MILSOV_UPKEEP_BY_LEVEL[level] : 0),
          bonus + MILSOV_BONUS_PER_LEVEL * level);
      }
    };
    rec(0, 0, 0, 0);
    return best;
  };

  let seed = 4242;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  let nonTrivial = 0;
  for (let trial = 0; trial < 600; trial++) {
    const n = 1 + rnd(7);
    const tiles = Array.from({ length: n }, () => ({ d: 1 + rnd(2000) / 1000 }))
      .sort((a, b) => a.d - b.d);
    const headroom = { rp: rnd(400), upkeep: rnd(6000), slots: rnd(n + 2) };
    const chancery = trial % 3 === 0;
    const want = brute(tiles, headroom, chancery);
    close(planMilsov({ tiles, headroom, chancery }).bonus, want, 1e-9);
    if (want > 0) nonTrivial++;
  }
  assert.ok(nonTrivial > 100, 'the sweep never exercised a real plan');
});

test('no structure asked for means no buildings and no bill', () => {
  const plan = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: 0 } });
  assert.deepEqual(plan.milsov, []);
  assert.equal(plan.milsovBonus, 0);
  assert.equal(plan.milsovUpkeep, 0);
  assert.equal(plan.milsovBlocked, null, 'nothing was asked for, so nothing is blocked');
  assert.equal(plan.milsovPrice, 0);
  assert.equal(plan.resCeiling, Infinity, 'nothing is charged hourly');
});

test('a minimum bonus is judged over the whole acceptable tax range', () => {
  // The site's own answer: the tax it reaches, and the military that is free
  // there. Everything below is about a minimum ABOVE that free figure.
  const plan = scoreSite({ neighbours: spare, settings: withMil({ tMin: -1000 }) });
  assert.ok(plan.milsovBonus > 0, 'precondition: this site fits something for free');
  assert.equal(plan.milsovShortfall, false, 'no minimum, nothing to fall short of');
  assert.equal(plan.milsovMinTax, null, 'nothing to report when none was asked for');

  const more = plan.milsovBonus + 5;

  // With tax to spare, wanting more than is free is not a shortfall — it is a
  // price. The site survives, and says what tax still delivers it.
  const roomy = scoreSite({
    neighbours: spare,
    settings: withMil({ tMin: plan.tMax - 30, milsovMinBonus: more }),
  });
  assert.equal(roomy.milsovShortfall, false, 'thirty points of tax were never considered');
  assert.ok(roomy.milsovMinTax < plan.tMax, 'meeting it must cost some tax');
  assert.ok(roomy.milsovMinTax >= plan.tMax - 30 - 1e-6, 'but never more than was offered');
  assert.ok(roomy.milsovMinBonusAt >= more);

  // The plan itself is untouched: still the site's own ceiling and the military
  // that is free there. The minimum reports, it does not re-plan.
  close(roomy.tMax, plan.tMax, 1e-9);
  assert.equal(roomy.milsovBonus, plan.milsovBonus);
  assert.equal(roomy.tiles.length, plan.tiles.length);

  // With no tax to spare, the same request really is a shortfall.
  const tight = scoreSite({
    neighbours: spare,
    settings: withMil({ tMin: plan.tMax, milsovMinBonus: more }),
  });
  assert.equal(tight.milsovShortfall, true);
  assert.equal(tight.milsovMinTax, null);

  // And a figure no tax reaches is a shortfall however much tax is offered.
  const absurd = scoreSite({
    neighbours: spare,
    settings: withMil({ tMin: -1000, milsovMinBonus: 100000 }),
  });
  assert.equal(absurd.milsovShortfall, true);
});

test('a site that reaches the minimum for free is never charged tax for it', () => {
  const plan = scoreSite({ neighbours: spare, settings: withMil({ tMin: -1000 }) });
  const met = scoreSite({
    neighbours: spare,
    settings: withMil({ tMin: 0, milsovMinBonus: plan.milsovBonus }),
  });
  assert.equal(met.milsovShortfall, false);
  assert.equal(met.milsovMinTax, null, 'already met at the ceiling — no tax to report');
  close(met.tMax, plan.tMax, 1e-9);
});

test('a minimum with no structure asked for falls short rather than passing', () => {
  // Wanting military and not naming one is a contradiction; the honest reading
  // is that no site meets it, not that every site does.
  const plan = scoreSite({
    neighbours: spare,
    settings: { ...worked, tMin: -1000, milsovMinBonus: 50 },
  });
  assert.equal(plan.milsovBonus, 0);
  assert.equal(plan.milsovShortfall, true);
});

// --- The headroom, and why a site sometimes has none ------------------------

test('a research-bound site has no free research, and says so', () => {
  // Sixteen-food water everywhere: the food plan can raise T_food further than
  // the library can pay for, so T_rp is what sets the tax and there is nothing
  // left over by construction.
  const settings = withMil({ tMin: -1000 });
  const plan = scoreSite({ neighbours: ring(() => 16), settings });
  assert.equal(plan.binding, 'rp');
  assert.equal(plan.milsov.length, 0);
  assert.equal(plan.milsovBlocked, 'rp');
  // At the exact ceiling the research is spent to the last point.
  close(milsovHeadroom({
    tax: plan.tMaxExact, settings, uRp: plan.spend, buildingsUsed: plan.tiles.length,
  }).rp, 0, 1e-6);

  // At the whole-number tax the plan is actually made at there is a little,
  // because a point of tax is a point of production — but never more than that
  // one point's worth, and here not enough to reach the cheapest free tile.
  const free = milsovHeadroom({
    tax: plan.tMax, settings, uRp: plan.spend, buildingsUsed: plan.tiles.length,
  }).rp;
  assert.ok(free > 0, 'flooring the ceiling has to leave something');
  assert.ok(free <= computeRRef(settings) / 100 + 1e-6, 'but no more than one point produces');
});

test('a city with no plots of a resource cannot run a structure at all', () => {
  // 0/0/0/0/25 is a legitimate allocation and scores well with no military. One
  // Training Ground on it would cost 150/hr of four resources the city does not
  // produce at any tax, so the answer is none — attributably, not silently.
  const plots = { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 };
  const plan = scoreSite({ neighbours: ring8, settings: withMil({ tMin: 0, plots }) });

  assert.equal(plan.milsov.length, 0);
  assert.equal(plan.milsovBlocked, 'upkeep');
  assert.ok(Number.isFinite(plan.tMax), 'the site itself is still perfectly good');
  assert.equal(plan.resImpossible, false, 'nothing was placed, so nothing is impossible');

  // The same site without the structure asked for is identical — which is what
  // makes the absence attributable to the city, not to the site.
  const none = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: 0, plots } });
  close(plan.tMax, none.tMax, 1e-9);
});

test('a scarce resource buys fewer buildings, not a lower tax', () => {
  // Same food plots, so the same tax; only the split of the other twenty moves.
  // One stone plot against four of everything else is what the hourly bill is
  // paid from, so it is what limits the plan — and the tax is untouched by it.
  const at = (plots) => scoreSite({
    neighbours: spare,
    settings: withMil({
      tMin: -1000, plots, rpCalibration: { observedRpPerHour: 8000, atTax: 25 },
    }),
  });
  const lean = at({ wood: 5, clay: 5, iron: 5, stone: 1, food: 9 });
  const rich = at({ wood: 4, clay: 4, iron: 4, stone: 4, food: 9 });

  close(lean.tMax, rich.tMax, 1e-9);
  assert.ok(lean.milsovUpkeep < rich.milsovUpkeep, 'one stone plot must buy less');
  assert.ok(lean.tMax <= lean.resCeiling + 1e-9, 'the tax never exceeds the resource ceiling');
  assert.ok(rich.tMax <= rich.resCeiling + 1e-9);
});

test('the building cap is spent on food first, and blocks military when full', () => {
  const settings = withMil({ tMin: -1000, maxBuildings: 8 });
  const plan = scoreSite({ neighbours: ring(() => 9), settings });
  assert.equal(plan.tiles.length, 8, 'food takes the whole cap');
  assert.equal(plan.milsov.length, 0);
  assert.equal(plan.milsovBlocked, 'slots');
});

test('a site with no spare tile says so rather than blaming a budget', () => {
  const plan = scoreSite({
    neighbours: [{ dx: 1, dy: 0, food: 7 }],
    settings: withMil({ tMin: -1000 }),
  });
  assert.equal(plan.tiles.length, 1);
  assert.equal(plan.milsov.length, 0);
  assert.equal(plan.milsovBlocked, 'tiles');
});

test('a Production Structure is never planned on water', () => {
  // Eight 9-food water tiles the food plan takes, then two it will not: a
  // nearer water one and a further land one. Only the land one can host, so the
  // plan must pass over the tile it would otherwise reach for first.
  const neighbours = [
    ...ring8.map((t) => ({ ...t, food: 9, water: true })),
    { dx: 2, dy: 0, food: 0, water: true },
    { dx: 2, dy: 2, food: 0, water: false },
  ];
  const plan = scoreSite({ neighbours, settings: withMil({ tMin: -1000 }) });

  assert.ok(plan.milsov.length > 0, 'the land tile should still host something');
  for (const m of plan.milsov) assert.equal(m.water, false, 'a structure was put on water');
  // The nearer free tile is water, so the plan takes the further land one.
  close(plan.milsov[0].d, Math.SQRT2 * 2, 1e-9);
});

test('a site whose spare tiles are all water says which of the two it is', () => {
  const plan = scoreSite({
    // The food plan takes the land tile and leaves the unrated water one, so a
    // spare tile does exist — 'tiles' would send the user looking for a
    // neighbourhood problem they do not have.
    neighbours: [{ dx: 1, dy: 0, food: 7 }, { dx: 2, dy: 0, food: 0, water: true }],
    settings: withMil({ tMin: -1000 }),
  });
  assert.equal(plan.milsov.length, 0);
  assert.equal(plan.milsovBlocked, 'water', 'tiles were left over — they were just wet');
});

test('milsovHeadroom prices the scarcest resource, not the average', () => {
  const settings = { ...worked, plots: { wood: 5, clay: 5, iron: 5, stone: 1, food: 9 } };
  const { yield: y } = computeBasicYield(settings);
  const h = milsovHeadroom({ tax: 50, settings, uRp: 0, buildingsUsed: 0 });
  close(h.upkeep, (1 * y * (125 - 50)) / 100, 1e-6);
  close(h.rp, (computeRRef(settings) * (125 - 50)) / 100, 1e-6);
  assert.equal(h.slots, settings.maxBuildings);

  // A booster is worth its face value here exactly as it is against T_res.
  const boosted = milsovHeadroom({
    tax: 50,
    settings: { ...settings, resourceBoosters: { wood: false, clay: false, iron: false, stone: true } },
    uRp: 0,
    buildingsUsed: 0,
  });
  assert.ok(boosted.upkeep > h.upkeep, 'a Stonemason must buy more military');
});

test('a site with no finite tax has no budget to spend', () => {
  // 0 food plots divides by a K of zero. -Infinity must not read as unlimited.
  const h = milsovHeadroom({
    tax: -Infinity,
    settings: { ...worked, plots: { wood: 5, clay: 5, iron: 5, stone: 5, food: 5 } },
    uRp: 0,
    buildingsUsed: 0,
  });
  assert.equal(h.rp, 0);
  assert.equal(h.upkeep, 0);
});

// --- The price of going further --------------------------------------------

test('the quoted price is what a point of tax actually buys', () => {
  // Priced by re-solving one point down, so it accounts for tiles and slots
  // running out — not by a formula that assumes they never do.
  const neighbours = ring((dx, dy) => (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 ? 9 : 0));
  const settings = withMil({ tMin: -1000 });
  const plan = scoreSite({ neighbours, settings });

  const cheaper = planMilsov({
    tiles: neighbours
      .map((n) => ({ ...n, d: distance(n.dx, n.dy) }))
      .filter((t) => !plan.tiles.some((c) => c.dx === t.dx && c.dy === t.dy))
      .sort((a, b) => a.d - b.d || a.food - b.food),
    headroom: milsovHeadroom({
      tax: plan.tMax - 1, settings, uRp: plan.spend, buildingsUsed: plan.tiles.length,
    }),
    chancery: false,
  });
  assert.equal(plan.milsovPrice, cheaper.bonus - plan.milsovBonus);
  assert.ok(plan.milsovPrice >= 0, 'a lower tax can never buy less');
});

test('a site with nothing left to claim prices at nothing', () => {
  // Every tile already spoken for, so no tax rate buys another building.
  const plan = scoreSite({
    neighbours: [{ dx: 1, dy: 0, food: 7 }],
    settings: withMil({ tMin: -1000 }),
  });
  assert.equal(plan.milsovPrice, 0);
});

// --- The resource ceiling ---------------------------------------------------

test('a resource with no plots is flagged impossible, not returned as a number', () => {
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  const r = tRes({ milsovAssignments, plots: { wood: 5, clay: 5, iron: 5, stone: 0, food: 10 } });
  assert.equal(r.impossible, true);
  assert.equal(r.indicative, false);
  assert.equal(r.binding, 'stone', 'the worst resource is named, not the first checked');
  assert.equal(r.ceiling, -Infinity, 'no production pays no upkeep at any tax');
});

test('with nothing placed the ceiling is absent rather than indicative', () => {
  const r = tRes({ milsovAssignments: [], plots: { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 } });
  assert.deepEqual(r, { ceiling: Infinity, indicative: false, binding: null, impossible: false });
});

test('the claim is charged on its sovereignty level, the structure on its own', () => {
  // A Sov V claim carrying a level 1 building: 50 RP at d = 1 for the claim, but
  // only 150/hr of each basic resource for the structure. The engine no longer
  // plans that split, but tRes must still read the levels apart — that is the
  // schema the whole cost model rests on.
  close(tRes({
    milsovAssignments: [{ sovLevel: 5, buildingLevel: 1 }],
    plots: worked.plots,
  }).ceiling, 125 - (100 * 150) / (3 * BASIC_YIELD_L20), 0.01);
});

test('a Resource Structure pays its claim but no hourly bill', () => {
  // The picker does not offer them any more — nothing would stop the search
  // claiming every spare tile with one — but the engine still knows them, and
  // knowing them must not mean a special case.
  const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
  for (const structure of ['farmstead', 'fishery', 'loggingCamp', 'mineshaft']) {
    const milsovAssignments = [{ structure, sovLevel: 5, buildingLevel: 5 }];
    assert.deepEqual(tRes({ milsovAssignments, plots: worked.plots }), none, structure);
  }
});

test('a mixed set is charged for its Production Structures alone', () => {
  const mixed = [
    { structure: 'trainingGround', sovLevel: 5, buildingLevel: 5 },
    ...Array.from({ length: 3 }, () => ({ structure: 'mineshaft', sovLevel: 5, buildingLevel: 5 })),
  ];
  // One Sov V military structure — 2,400/hr, not the 9,600 four would cost.
  close(tRes({ milsovAssignments: mixed, plots: worked.plots }).ceiling,
    125 - (100 * 2400) / (3 * BASIC_YIELD_L20), 0.01);
});

test('the ceiling binds T_max like any other', () => {
  const t = tMax({ food: 60, rp: 70, res: 20 });
  close(t.value, 20);
  assert.equal(t.binding, 'res');
});

// --- Boosters, calibrated yields and the surplus read-out -------------------

test('a booster is worth exactly its face value in tax headroom', () => {
  // The bonus is points on the production percentage, like the Flour Mill, so it
  // is worth a straight 40 points against that resource's ceiling.
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  const bare = tRes({ milsovAssignments, plots: worked.plots, settings: worked });
  assert.equal(bare.binding, 'stone', '3 stone plots against 5 of everything else');

  const all = tRes({
    milsovAssignments,
    plots: worked.plots,
    settings: { ...worked, resourceBoosters: { wood: true, clay: true, iron: true, stone: true } },
  });
  close(all.ceiling, bare.ceiling + 40, 1e-9);
  assert.equal(all.binding, 'stone');

  // Boosting only the binding resource lifts it past the other three, so the
  // ceiling stops being stone's and becomes theirs — it does not rise by 40.
  const stoneOnly = tRes({
    milsovAssignments,
    plots: worked.plots,
    settings: { ...worked, resourceBoosters: { wood: false, clay: false, iron: false, stone: true } },
  });
  assert.notEqual(stoneOnly.binding, 'stone');
  close(stoneOnly.ceiling, 125 - (100 * 2400) / (5 * BASIC_YIELD_L20), 0.01);
});

test('a calibration reading overrides the default yield for that city', () => {
  const settings = {
    ...worked,
    resourceCalibration: { observedPerHour: 15000, atTax: 25, plots: 5, booster: false },
  };
  const { yield: y } = computeBasicYield(settings);
  close(y, 3000, 1e-9);
  // A richer yield pays a bigger bill, so it buys more military at the same tax.
  const lean = milsovHeadroom({ tax: 50, settings: worked, uRp: 0, buildingsUsed: 0 });
  const rich = milsovHeadroom({ tax: 50, settings, uRp: 0, buildingsUsed: 0 });
  assert.ok(rich.upkeep > lean.upkeep);
});

test('the binding ceiling has exactly zero left over at the exact ceiling', () => {
  // The surplus figures are the ceiling equations read as a balance, so this is
  // the two derivations checking each other. It has to be asked at T_max itself:
  // the plan is made at the whole-number tax below it, where the binding
  // quantity is short of zero by exactly the fraction that was rounded away.
  for (const structure of [null, 'trainingGround']) {
    for (const neighbours of [ring8, ring(() => 9), ring(() => 16)]) {
      const settings = { ...worked, tMin: -1000, milsovStructure: structure };
      const ctx = prepareSite({ neighbours, settings });
      const plan = scoreSite({ neighbours, settings });
      const exact = planSiteAt(ctx, plan.tMaxExact);
      close(exact.surplus.tax, plan.tMaxExact, 1e-9);
      if (plan.binding === 'food') close(exact.surplus.food, 0, 1e-6);
      if (plan.binding === 'rp') close(exact.surplus.rp, 0, 1e-6);

      // And nothing is ever overspent at either tax.
      for (const s of [exact.surplus, plan.surplus]) {
        assert.ok(s.food >= -1e-6, `food deficit: ${s.food}`);
        assert.ok(s.rp >= -1e-6, `research deficit: ${s.rp}`);
        for (const r of BASIC_RESOURCES) assert.ok(s[r] >= -1e-6, `${r} deficit: ${s[r]}`);
      }
      close(plan.surplus.tax, plan.tMax, 1e-9);
    }
  }
});

test('the surplus states the military bill against every basic resource', () => {
  const settings = withMil({ tMin: -1000 });
  const plan = scoreSite({ neighbours: spare, settings });
  const { yield: y } = computeBasicYield(settings);
  assert.ok(plan.milsov.length > 0, 'precondition: something was placed');
  assert.equal(plan.surplus.upkeep, plan.milsovUpkeep);
  for (const r of BASIC_RESOURCES) {
    const expected = (worked.plots[r] * y * (125 - plan.tMax)) / 100 - plan.milsovUpkeep;
    close(plan.surplus[r], expected, 1e-6);
  }
  assert.equal(plan.surplus.indicative, false, 'the yield behind them is measured');
});

test('surplusAt is callable on its own, at any tax the user asks about', () => {
  // The engine reports at the plan's tax; the function itself is not tied to it.
  const at = (tax) => surplusAt({ tax, settings: worked, sFood: 0, uRp: 0, milsovAssignments: [] });
  assert.ok(at(0).food > at(50).food, 'less tax must leave more food');
  close(at(25).rp, 1600, 1e-6);              // R_ref x (125-25)/100
  close(at(0).rp - at(100).rp, 1600, 1e-6);  // 100 points of production
  // Food at 25% tax: K x (100 + 60) - 32,200.
  close(at(25).food, computeK(7) * 160 - 32200, 1e-6);
});

test('gold is on the balance, and agrees with the goldNet the row shows', () => {
  const plan = scoreSite({ neighbours: ring(() => 9), settings: withMil({ tMin: -1000 }) });
  close(plan.surplus.gold, plan.goldNet, 1e-6);
  close(plan.surplus.base.gold - plan.surplus.gold, plan.uGold, 1e-6);
});

// --- Whole-number tax -------------------------------------------------------

test('the reported tax is one the game will accept, and the ceiling is kept', () => {
  for (const neighbours of [ring8, ring(() => 9), ring(() => 16), spare]) {
    const plan = scoreSite({ neighbours, settings: withMil({ tMin: -1000 }) });
    assert.equal(plan.tMax, Math.floor(plan.tMax), 'the tax must be a whole number');
    assert.equal(plan.tax, plan.tMax, 'the plan is made at the tax that is reported');
    // The exact ceiling survives for display, and is what was rounded down.
    assert.ok(plan.tMaxExact >= plan.tMax - 1e-9);
    assert.ok(plan.tMaxExact < plan.tMax + 1, 'more than a point away is not a floor');
    assert.equal(settableTax(plan.tMaxExact), plan.tMax);
  }
});

test('the integer plan spends the rounding, and never buys less military', () => {
  // The fraction between floor(T_max) and T_max is research produced and upkeep
  // affordable. A plan pinned to the exact ceiling cannot spend it; the plan at
  // the settable rate can, so it is never worse and is usually better.
  const settings = withMil({ tMin: -1000 });
  let better = 0;
  for (const neighbours of [spare, ring8, ring(() => 9), ring((dx) => (dx > 0 ? 7 : 0))]) {
    const ctx = prepareSite({ neighbours, settings });
    const plan = scoreSite({ neighbours, settings });
    const atExact = planSiteAt(ctx, plan.tMaxExact);
    assert.ok(plan.milsovBonus >= atExact.milsovBonus,
      `the integer plan bought less: ${plan.milsovBonus} < ${atExact.milsovBonus}`);
    if (plan.milsovBonus > atExact.milsovBonus) better++;
  }
  assert.ok(better > 0, 'the fixtures never actually exercised the extra headroom');
});

test('the minimum-bonus search reports a tax the user could set', () => {
  const plan = scoreSite({ neighbours: spare, settings: withMil({ tMin: -1000 }) });
  const roomy = scoreSite({
    neighbours: spare,
    settings: withMil({ tMin: plan.tMax - 30, milsovMinBonus: plan.milsovBonus + 5 }),
  });
  assert.equal(roomy.milsovMinTax, Math.floor(roomy.milsovMinTax));
  // And it is the HIGHEST such tax: one point up no longer delivers it.
  const ctx = prepareSite({ neighbours: spare, settings: withMil({ tMin: plan.tMax - 30 }) });
  const above = planSiteAt(ctx, roomy.milsovMinTax + 1);
  assert.ok(above.milsovBonus < roomy.milsovMinBonusAt, 'a higher tax must fall short');
});

// --- Minimum resource surplus -----------------------------------------------

test('a minimum surplus lowers T_res by exactly what it costs in points', () => {
  // The floor is production the tax may not take, so it enters the ceiling on
  // the same footing as the hourly bill: 100 x minimum / (plots x Y) points.
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  const bare = tRes({ milsovAssignments, plots: worked.plots, settings: worked });
  assert.equal(bare.binding, 'stone');

  const minimum = 1000;
  const floored = tRes({
    milsovAssignments,
    plots: worked.plots,
    settings: { ...worked, resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: minimum } },
  });
  close(floored.ceiling, bare.ceiling - (100 * minimum) / (3 * BASIC_YIELD_L20), 1e-9);
  assert.equal(floored.binding, 'stone');
});

test('a floor binds with nothing built, since it is production either way', () => {
  // No military sovereignty means no hourly bill, but "keep 1,000 wood an hour"
  // is still a statement about how much tax the city can carry.
  const plots = worked.plots;
  const settings = {
    ...worked, tMin: -1000,
    resourceMinimums: { wood: 20000, clay: 0, iron: 0, stone: 0 },
  };
  const bare = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: -1000 } });
  const held = scoreSite({ neighbours: ring8, settings });
  assert.ok(held.tMax < bare.tMax, 'a floor the city cannot meet at that tax must lower it');
  assert.equal(held.binding, 'res');
  // 5 wood plots: the ceiling is where production of wood equals the floor.
  close(held.tMaxExact, 125 - (100 * 20000) / (plots.wood * BASIC_YIELD_L20), 1e-9);
  // And the surplus reads the whole production, not what is left above the floor.
  assert.ok(held.surplus.wood >= 20000 - 1e-6, 'the floor must actually be held');
});

test('a floor on a resource the city has no plots of is impossible, not merely low', () => {
  const r = tRes({
    milsovAssignments: [],
    plots: { wood: 5, clay: 5, iron: 5, stone: 0, food: 10 },
    settings: { resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 500 } },
  });
  assert.equal(r.impossible, true);
  assert.equal(r.binding, 'stone');
  assert.equal(r.ceiling, -Infinity);

  // Zero plots and nothing asked of them is not a constraint at all.
  const none = tRes({
    milsovAssignments: [],
    plots: { wood: 5, clay: 5, iron: 5, stone: 0, food: 10 },
    settings: { resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 0 } },
  });
  assert.equal(none.ceiling, Infinity);
  assert.equal(none.impossible, false);
});

test('a floor takes military sovereignty out of the budget, not out of the tax', () => {
  const at = (minimums) => scoreSite({
    neighbours: spare,
    settings: withMil({
      tMin: -1000, resourceMinimums: minimums,
      rpCalibration: { observedRpPerHour: 8000, atTax: 25 },
    }),
  });
  const free = at({ wood: 0, clay: 0, iron: 0, stone: 0 });
  const held = at({ wood: 0, clay: 0, iron: 0, stone: 4000 });
  assert.ok(free.milsovUpkeep > 0, 'precondition: something was affordable');
  assert.ok(held.milsovUpkeep < free.milsovUpkeep, 'the fenced-off stone must buy less');
  assert.ok(held.surplus.stone >= 4000 - 1e-6, 'and the floor is what it is fenced for');

  // milsovHeadroom is where that comes from: the budget is production less floor.
  const settings = { ...worked, resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 4000 } };
  const { yield: y } = computeBasicYield(settings);
  const h = milsovHeadroom({ tax: 50, settings, uRp: 0, buildingsUsed: 0 });
  close(h.upkeep, (worked.plots.stone * y * (125 - 50)) / 100 - 4000, 1e-6);

  // A floor above the whole production leaves nothing rather than a negative.
  const starved = milsovHeadroom({
    tax: 50,
    settings: { ...worked, resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 1e6 } },
    uRp: 0,
    buildingsUsed: 0,
  });
  assert.equal(starved.upkeep, 0);
});

test('a food floor is consumption the city does not have', () => {
  const k = computeK(worked.plots.food);
  const bOther = computeBOther(worked);
  const consumption = computeConsumption(worked);
  const minimum = 5000;
  close(
    tFood({ bOther, sFood: 100, consumption, k, minimum }),
    tFood({ bOther, sFood: 100, consumption: consumption + minimum, k }),
    1e-9,
  );

  const noFloor = { ...worked, tMin: -1000 };
  const bare = scoreSite({ neighbours: ring8, settings: noFloor });
  const held = scoreSite({
    neighbours: ring8,
    settings: { ...noFloor, resourceMinimums: { ...noFloor.resourceMinimums, food: minimum } },
  });
  assert.ok(held.tMax < bare.tMax, 'food kept back is tax the site can no longer carry');
  // Worth exactly its own share of K, the same as any other food the plan owes,
  // once both sites are compared at the same S_food.
  close(held.tMaxExact, bare.tMaxExact - minimum / k, 1e-9);
  assert.ok(held.surplus.food >= minimum - 1e-6, 'and the floor is actually held');
});

test('a research floor is charged like a claim, and buys no military', () => {
  const rRef = computeRRef(worked);
  const minimum = 300;
  close(tRp({ uRp: 1000, rRef, minimum }), tRp({ uRp: 1300, rRef }), 1e-9);

  // The headroom is the same subtraction: research the plan may not spend.
  const settings = {
    ...worked,
    resourceMinimums: { ...worked.resourceMinimums, research: minimum },
  };
  const free = milsovHeadroom({ tax: 50, settings: worked, uRp: 200, buildingsUsed: 0 });
  const held = milsovHeadroom({ tax: 50, settings, uRp: 200, buildingsUsed: 0 });
  close(held.rp, free.rp - minimum, 1e-9);

  const at = (min) => scoreSite({
    neighbours: spare,
    settings: withMil({
      tMin: -1000,
      resourceMinimums: { ...worked.resourceMinimums, research: min },
    }),
  });
  const bare = at(0);
  const fenced = at(400);
  assert.ok(bare.milsovBonus > 0, 'precondition: something was affordable');
  assert.ok(fenced.milsovRp <= bare.milsovRp, 'the fenced-off research must buy less');
  assert.ok(fenced.surplus.rp >= 400 - 1e-6, 'and the floor survives the whole plan');
});

// --- Prestige ---------------------------------------------------------------

const prestigeOn = (...keys) => Object.fromEntries(
  PRESTIGE_KEYS.map((k) => [k, keys.includes(k)]),
);

test('prestige on food joins B_other, and is totalled exactly once', () => {
  // Food is the one production whose bonuses are summed somewhere else, so the
  // boost goes into that sum rather than being applied at the food call sites —
  // which is the only arrangement that cannot count it twice.
  close(computeBOther({ ...worked, prestige: prestigeOn('food') }),
    computeBOther(worked) + PRESTIGE_PRODUCTION_BONUS, 1e-9);

  // Worth its face value in tax headroom against T_food, like every other point
  // in B_other, and reaching food production through exactly one path.
  const settings = { ...worked, tMin: -1000, prestige: prestigeOn('food') };
  const bare = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: -1000 } });
  const fed = scoreSite({ neighbours: ring8, settings });
  assert.equal(bare.binding, 'food', 'precondition: food is what binds');
  close(fed.tMaxExact, bare.tMaxExact + PRESTIGE_PRODUCTION_BONUS, 1e-9);
  close(surplusAt({ tax: 25, settings, sFood: 0, uRp: 0, milsovAssignments: [] }).food,
    computeK(7) * (100 + computeBOther(settings)) - 32200, 1e-6);

  // And the four resources are untouched by it — one key, one production.
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  close(tRes({ milsovAssignments, plots: worked.plots, settings }).ceiling,
    tRes({ milsovAssignments, plots: worked.plots, settings: worked }).ceiling, 1e-9);
});

test('prestige is worth exactly its points of tax headroom on a resource', () => {
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  const bare = tRes({ milsovAssignments, plots: worked.plots, settings: worked });
  const all = tRes({
    milsovAssignments,
    plots: worked.plots,
    settings: { ...worked, prestige: prestigeOn('wood', 'clay', 'iron', 'stone') },
  });
  close(all.ceiling, bare.ceiling + PRESTIGE_PRODUCTION_BONUS, 1e-9);
  assert.equal(all.binding, 'stone');

  // It stacks with the booster rather than replacing it — both are points.
  const both = tRes({
    milsovAssignments,
    plots: worked.plots,
    settings: {
      ...worked,
      prestige: prestigeOn('wood', 'clay', 'iron', 'stone'),
      resourceBoosters: { wood: true, clay: true, iron: true, stone: true },
    },
  });
  close(both.ceiling, bare.ceiling + PRESTIGE_PRODUCTION_BONUS + RESOURCE_BOOSTER_BONUS, 1e-9);
});

test('prestige on research is points on the multiplier, not a bigger library', () => {
  const settings = { ...worked, prestige: prestigeOn('research') };
  // R_ref is the library's own figure and does not move; what moves is the
  // percentage it is produced at, so the gap is a flat R_ref x 25/100.
  close(computeRRef(settings), computeRRef(worked), 1e-9);
  const gap = (computeRRef(worked) * PRESTIGE_PRODUCTION_BONUS) / 100;
  for (const tax of [0, 25, 60, 100]) {
    close(surplusAt({ tax, settings, sFood: 0, uRp: 0, milsovAssignments: [] }).rp,
      surplusAt({ tax, settings: worked, sFood: 0, uRp: 0, milsovAssignments: [] }).rp + gap, 1e-6);
  }
  // Which is worth its face value in headroom against T_rp, like everything else.
  close(tRp({ uRp: 1000, rRef: 1600, rpBonus: PRESTIGE_PRODUCTION_BONUS }),
    tRp({ uRp: 1000, rRef: 1600 }) + PRESTIGE_PRODUCTION_BONUS, 1e-9);
});

test('prestige raises the tax a research-bound site holds', () => {
  // Sixteen-food water against a hungry city: T_rp is what binds, so the extra
  // research turns into tax. It buys LESS than its full points at the site
  // level, and has to: the ceiling is where T_food and T_rp cross, so lifting
  // one line slides the crossing point along the other. The face value is
  // headroom against T_rp at a fixed food plan, which the test above states.
  const neighbours = ring(() => 16);
  const settings = { ...worked, cityConsumption: 45000, tMin: -1000 };
  const bare = scoreSite({ neighbours, settings });
  const boosted = scoreSite({
    neighbours, settings: { ...settings, prestige: prestigeOn('research') },
  });
  assert.equal(bare.binding, 'rp');
  assert.equal(boosted.binding, 'rp');
  assert.ok(boosted.tMaxExact > bare.tMaxExact, 'more research must be more tax');
  assert.ok(boosted.tMaxExact - bare.tMaxExact <= PRESTIGE_PRODUCTION_BONUS + 1e-9,
    'and never more than the points it adds');
});

test('a reading taken with prestige running round-trips to the same yield', () => {
  // The divisor has to carry the bonus. Left out, its points are fitted into the
  // per-plot yield as a multiplier and every other tax comes out wrong.
  const plots = 5;
  const atTax = 25;
  const observed = (plots * BASIC_YIELD_L20 * (125 - atTax + PRESTIGE_PRODUCTION_BONUS)) / 100;
  close(computeBasicYield({
    resourceCalibration: { observedPerHour: observed, atTax, plots, booster: false, prestige: true },
  }).yield, BASIC_YIELD_L20, 1e-9);
  // Declared wrongly, the same reading inflates the yield by the ratio of the
  // two multipliers — which is the mis-extrapolation this flag exists to stop.
  close(computeBasicYield({
    resourceCalibration: { observedPerHour: observed, atTax, plots, booster: false, prestige: false },
  }).yield, (BASIC_YIELD_L20 * (100 + PRESTIGE_PRODUCTION_BONUS)) / 100, 1e-9);

  // Same for R_ref: what a boosted city produces at 25% tax is a smaller library
  // than the same figure produced without it.
  const rRef = 1280;
  const rpObserved = (rRef * (125 - atTax + PRESTIGE_PRODUCTION_BONUS)) / 100;
  close(computeRRef({ rpCalibration: { observedRpPerHour: rpObserved, atTax, prestige: true } }),
    rRef, 1e-9);
});

// --- Equal bonuses are broken on research -----------------------------------

test('among equally good staircases the cheapest in research wins', () => {
  // Two tiles, one near and one far, and an upkeep budget of exactly 300 —
  // a real boundary, since the bonus is quantised in fives. +10% is reachable
  // twice over: one building at level 2 on the near tile (300/hr, 20 RP) or one
  // level 1 on each (300/hr, 60 RP). The first descent finds the spread, and
  // pruning on "cannot beat" instead of "cannot tie" used to keep it.
  const tiles = [{ d: 1 }, { d: 5 }];
  const plan = planMilsov({ tiles, headroom: { rp: 1000, upkeep: 300, slots: 2 }, chancery: false });
  assert.equal(plan.bonus, 10);
  assert.deepEqual(plan.levels, [2], 'the RP-cheaper staircase is the concentrated one');
  close(plan.rp, CLAIM_RP_PER_LEVEL_DISTANCE * 2 * 1, 1e-9);
  close(plan.upkeep, 300, 1e-9);

  // Give the far tile the same distance and the two are genuinely equal in RP,
  // so either answer is correct — but the bonus and the bill must not change.
  const level = planMilsov({
    tiles: [{ d: 1 }, { d: 1 }], headroom: { rp: 1000, upkeep: 300, slots: 2 }, chancery: false,
  });
  assert.equal(level.bonus, 10);
  close(level.rp, 20, 1e-9);
});

test('the fast path is untouched: budgets that cover everything skip the search', () => {
  const tiles = [{ d: 1 }, { d: 1.414 }, { d: 2 }];
  const plan = planMilsov({
    tiles, headroom: { rp: 1e9, upkeep: 1e9, slots: 3 }, chancery: false,
  });
  assert.deepEqual(plan.levels, [5, 5, 5]);
  assert.equal(plan.bonus, 75);
  close(plan.upkeep, 3 * MILSOV_UPKEEP_BY_LEVEL[5], 1e-9);
});

test('the tie-break never costs bonus, and only ever lowers the research', () => {
  // The sweep the exhaustive check already runs, asked the second question too:
  // no plan may be beaten on RP by another plan of the same bonus.
  const cheapestAt = (tiles, headroom, chancery, bonus) => {
    const f = chancery ? CHANCERY_FACTOR : 1;
    const n = Math.min(tiles.length, Math.floor(headroom.slots));
    let best = Infinity;
    const rec = (i, rp, up, b) => {
      if (rp > headroom.rp + 1e-9 || up > headroom.upkeep + 1e-9) return;
      if (i === n) {
        if (b === bonus && rp < best) best = rp;
        return;
      }
      for (let level = 0; level <= 5; level++) {
        rec(i + 1, rp + 10 * level * tiles[i].d * f,
          up + (level ? MILSOV_UPKEEP_BY_LEVEL[level] : 0),
          b + MILSOV_BONUS_PER_LEVEL * level);
      }
    };
    rec(0, 0, 0, 0);
    return best;
  };

  let seed = 99991;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  let checked = 0;
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rnd(5);
    const tiles = Array.from({ length: n }, () => ({ d: 1 + rnd(2000) / 1000 }))
      .sort((a, b) => a.d - b.d);
    const headroom = { rp: rnd(400), upkeep: rnd(4000), slots: rnd(n + 2) };
    const chancery = trial % 3 === 0;
    const plan = planMilsov({ tiles, headroom, chancery });
    if (plan.bonus === 0) continue;
    close(plan.rp, cheapestAt(tiles, headroom, chancery, plan.bonus), 1e-9);
    checked++;
  }
  assert.ok(checked > 50, 'the sweep never exercised a real plan');
});

test('gold upkeep still tracks research at exactly 10:1 with military in the plan', () => {
  const plan = scoreSite({ neighbours: ring(() => 9), settings: withMil({ tMin: -1000 }) });
  close(plan.uGold, plan.uRp * 10, 1e-6);
  close(plan.uRp, plan.spend + plan.milsovRp, 1e-9);
  close(plan.milsovGold, plan.milsovRp * 10, 1e-6);
});

// --- descriptor bonuses on military sovereignty ------------------------------

// A tile whose terrain names the structure being built raises that structure's
// rate per level: a Training Ground on Wooded Glade runs at 7 points a level,
// not 5. Nothing read this before — the engine charged every tile 5 flat — so a
// site with matching terrain was ranked as if its terrain said nothing.
test('a matching descriptor raises the tile rate, a non-matching one does not', () => {
  const headroom = { slots: 1, rp: 1e9, upkeep: 1e9 };
  const tile = (descriptor) => [{ d: 1, idx: 0, descriptor }];
  const wooded = descriptorFor(56);   // Wooded Glade, Training Ground +2%
  const forest = descriptorFor(52);   // Thick Forest, Bowyer +3% — not military

  const plain = planMilsov({ tiles: tile(null), headroom, structure: 'trainingGround' });
  assert.equal(plain.bonus, 25);      // 5 levels x 5 points

  const matched = planMilsov({ tiles: tile(wooded), headroom, structure: 'trainingGround' });
  assert.equal(matched.bonus, 35);    // 5 levels x (5 + 2)

  // Same tile, different structure: the Wooded Glade does nothing for cavalry.
  const mismatched = planMilsov({ tiles: tile(wooded), headroom, structure: 'joustingYard' });
  assert.equal(mismatched.bonus, 25);

  // A crafting descriptor never matches a military structure.
  const crafting = planMilsov({ tiles: tile(forest), headroom, structure: 'trainingGround' });
  assert.equal(crafting.bonus, 25);
});

// The gaps in the descriptor table are scored as nothing, so an unread terrain
// costs a plan points it might really have — never the reverse.
test('an unread descriptor is worth zero, not a guess', () => {
  const headroom = { slots: 1, rp: 1e9, upkeep: 1e9 };
  const cairn = descriptorFor(125);   // named by the client, bonus never read
  assert.equal(cairn.bonusUnread, true);
  const plan = planMilsov({
    tiles: [{ d: 1, idx: 0, descriptor: cairn }], headroom, structure: 'trainingGround',
  });
  assert.equal(plan.bonus, 25);
});

// Levels are per tile, so the bonus has to be summed per tile rather than taken
// off the total. Two tiles at level 2, one matching: 2x(5+2) + 2x5 = 24.
test('the bonus is summed per tile, not applied to the total', () => {
  const wooded = descriptorFor(56);
  const plan = planMilsov({
    tiles: [{ d: 1, idx: 0, descriptor: wooded }, { d: 1, idx: 1, descriptor: null }],
    headroom: { slots: 2, rp: 40, upkeep: 900 },
    structure: 'trainingGround',
  });
  const matched = plan.levels[0] * 7;
  const rest = plan.levels.slice(1).reduce((a, l) => a + l * 5, 0);
  assert.equal(plan.bonus, matched + rest);
});

// No structure named is a food-only scan: nothing is placed, so nothing scales.
test('with no structure chosen no descriptor applies', () => {
  const plan = planMilsov({
    tiles: [{ d: 1, idx: 0, descriptor: descriptorFor(56) }],
    headroom: { slots: 1, rp: 1e9, upkeep: 1e9 },
  });
  assert.equal(plan.bonus, 25);
});
