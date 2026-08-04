// The PRD §6 worked example is the oracle for this engine. If these fail, the
// model has drifted from the document — fix one or the other deliberately.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeK, computeBOther, computeConsumption, computeRRef,
  tFood, tRp, tMax, goldNet, claimUpkeep, distance, knapsack, recoverSet, scoreSite,
  milsovAdvice, tRes, surplusAt, computeBasicYield,
} from '../src/scoring.js';
import { DEFAULT_SETTINGS, BASIC_YIELD_L20, BASIC_RESOURCES } from '../src/constants.js';

const close = (a, b, eps = 0.05) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

/**
 * `count` buildings, each one a Sov `level` claim carrying a level `level`
 * structure — the ordinary case, where the two levels match. The quota is one
 * entry per building, so this is what a run of identical rows produces.
 */
const sov = (level, count = 1) =>
  Array.from({ length: count }, () => ({ sovLevel: level, buildingLevel: level }));

// Defaults of the worked example: 7-food site, standard city, Flour Mill on,
// Nature's Bounty at 2 retreats, no other bonus, Library 20 with Allembine, no
// Insight, no Chancery.
const worked = { ...DEFAULT_SETTINGS };

test('K = 7 x 2014 / 100 = 140.98 (mechanics §4.1)', () => {
  close(computeK(7), 140.98);
  close(computeK(5), 100.70);
});

test("B_other = Flour Mill 40 + Nature's Bounty 20 = 60", () => {
  close(computeBOther(worked), 60);
});

test('the 20 points the baseline needs are the spell, and are counted once', () => {
  // They used to sit in otherFoodBonus as an unattributed residual while the
  // spell defaulted off, so a city that actually had the spell was scored with
  // both — 80 points where the baseline calls for 60.
  close(computeBOther({ ...worked, otherFoodBonus: 0 }), 60, 1e-9);
  close(computeBOther({ ...worked, naturesBounty: false }), 40, 1e-9);
  assert.equal(DEFAULT_SETTINGS.otherFoodBonus, 0, 'the residual must not be carried twice');

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

test('R_ref calibration back-solves from an observed reading (mechanics §6)', () => {
  // 800 RP/hr observed at 25% tax -> 800 * 100/100 = 800
  close(computeRRef({ ...worked, rpCalibration: { observedRpPerHour: 800, atTax: 25 } }), 800);
});

test('PRD §6: S_food 100 at 1,000 RP is food-bound at 56.6%', () => {
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

test('claim upkeep matches the mechanics §5.2 reference table', () => {
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

test('scoreSite still reports its tile plan when the building cap binds', () => {
  // 24 claimable neighbours against a cap of 20.
  const neighbours = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      neighbours.push({ dx, dy, food: 2 + ((dx * 5 + dy + 12) % 7) });
    }
  }
  assert.equal(neighbours.length, 24);
  const plan = scoreSite({ neighbours, settings: { ...worked, tMin: 0, maxBuildings: 20 } });
  assert.ok(plan.tiles.length > 0, 'the plan must not come back empty');
  assert.ok(plan.tiles.length <= 20, 'the building cap must hold');
  close(sumBy(plan.tiles, 'food'), plan.sFood, 1e-9);
  assert.ok(sumBy(plan.tiles, 'weight') <= plan.uRp + 1e-9, 'plan must fit its own RP spend');
});

test('the optimum is where ceilings cross, not maximum food (PRD §3.4)', () => {
  // A ring of eight 7-food tiles plus one absurdly expensive 16-food water tile.
  const neighbours = [
    ...[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].map(([dx,dy]) => ({ dx, dy, food: 7 })),
    { dx: 2, dy: 2, food: 16 },
  ];
  const plan = scoreSite({ neighbours, settings: { ...worked, tMin: 0 } });
  assert.ok(plan, 'a plan should be found');
  assert.ok(plan.tMax > 0);
  assert.ok(['food', 'rp', 'cap'].includes(plan.binding));
  // Every claimed tile is level 5 — food bonus requires it (mechanics §5.3).
  for (const t of plan.tiles) assert.equal(t.level, 5);
});

test('milsov reserves the cheapest tiles by distance, not the best food', () => {
  const neighbours = [
    { dx: 1, dy: 0, food: 2 },   // nearest, worst food
    { dx: 2, dy: 2, food: 16 },  // furthest, best food
  ];
  const plan = scoreSite({
    neighbours,
    settings: { ...worked, tMin: 0, milsovQuota: sov(3) },
  });
  assert.equal(plan.milsov.length, 1);
  assert.equal(plan.milsov[0].dx, 1, 'milsov should take the nearest tile');
  assert.ok(plan.quotaMet);
  assert.equal(plan.resIndicative, false, 'the yield behind T_res is measured');
});

test('among equidistant tiles the reservation takes the one worth least in food', () => {
  // Four tiles at d = 1. Distance alone cannot choose between them, and milsov
  // gets nothing from food, so taking the 0-food tile costs the knapsack nothing.
  const neighbours = [
    { dx: 1, dy: 0, food: 7 },
    { dx: 0, dy: 1, food: 0 },
    { dx: -1, dy: 0, food: 7 },
    { dx: 0, dy: -1, food: 7 },
    { dx: 2, dy: 0, food: 9 },
  ];
  const settings = { ...worked, tMin: 0, milsovQuota: sov(3) };
  const plan = scoreSite({ neighbours, settings });
  assert.equal(plan.milsov.length, 1);
  close(plan.milsov[0].d, 1);
  assert.equal(plan.milsov[0].food, 0, 'the 0-food tile is the free one to burn');

  // The reservation must not cost food the site could have kept: with a 0-food
  // host available at the same distance, S_food is untouched by the quota.
  const noMilsov = scoreSite({ neighbours, settings: { ...settings, milsovQuota: [] } });
  close(plan.sFood, noMilsov.sFood, 1e-9);
});

test('a high-food tile is never taken over an equidistant lower-food one', () => {
  // The scan order the payload loops produce is dx then dy, so a plain distance
  // sort leaves the first-scanned tile in front regardless of its food. Sweep
  // every rotation of the ring: the reserved tile is the ring minimum every time.
  const ring = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  for (let start = 0; start < ring.length; start++) {
    const neighbours = ring.map(([dx, dy], i) => ({
      dx, dy, food: [9, 3, 7, 5][(i + start) % 4],
    }));
    const plan = scoreSite({
      neighbours,
      settings: { ...worked, tMin: 0, milsovQuota: sov(5) },
    });
    assert.equal(plan.milsov[0].food, 3, `rotation ${start} burned a better tile`);
  }
});

// --- The distance-for-food trade -------------------------------------------

// Zeroing the food on the tiles the by-distance rule reserves pins both
// hostings to that same set, so what comes back is the by-distance plan and
// nothing else about the site has moved: a reserved tile never reaches the food
// knapsack, so its food rating was already worth nothing to the plan.
function byDistancePlan(neighbours, settings) {
  const quota = (settings.milsovQuota ?? []).length;
  const hosts = new Set(
    neighbours
      .map((n, i) => ({ i, d: distance(n.dx, n.dy), food: n.food }))
      .sort((a, b) => a.d - b.d || a.food - b.food)
      .slice(0, quota)
      .map((t) => t.i),
  );
  return scoreSite({
    neighbours: neighbours.map((n, i) => (hosts.has(i) ? { ...n, food: 0 } : n)),
    settings,
  });
}

test('the trade takes a further, poorer host when that buys more tax', () => {
  // Eight inner tiles at food 7, sixteen outer at food 5. Hosting Sov V on an
  // outer tile costs 50 more RP and hands the knapsack back a 7-food tile it can
  // claim for the 50 RP the 5-food tile it loses would have cost 100.
  const ring = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (dx === 0 && dy === 0) continue;
      ring.push({ dx, dy, food: Math.abs(dx) <= 1 && Math.abs(dy) <= 1 ? 7 : 5 });
    }
  }
  const settings = { ...worked, tMin: 0, milsovQuota: sov(5) };
  const plan = scoreSite({ neighbours: ring, settings });

  assert.equal(plan.milsovTraded, true, 'the trade should win here');
  assert.equal(plan.milsov[0].food, 5, 'the host is an outer tile');
  close(plan.milsov[0].d, 2);
  assert.ok(plan.tMax > byDistancePlan(ring, settings).tMax, 'the trade must buy tax, not just move a tile');
});

test('the same site trades or declines depending on the research budget', () => {
  // Eight 9-food tiles around the city and one worthless corner tile. The corner
  // costs the knapsack nothing to give away, so on the tile alone it is the
  // obvious host — but reaching it costs 141 RP against the 50 of a tile in the
  // ring, and when research is tight those 91 RP are worth more claims than the
  // 9-food tile they free. Which way it goes is the knapsack's answer, not the
  // tile's, which is why both are scored rather than one being reasoned about.
  const neighbours = [
    ...[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].map(([dx, dy]) => ({ dx, dy, food: 9 })),
    { dx: 2, dy: 2, food: 0 },
  ];
  const at = (observedRpPerHour) => scoreSite({
    neighbours,
    settings: {
      ...worked, tMin: 0,
      rpCalibration: { observedRpPerHour, atTax: 25 },
      milsovQuota: sov(5),
    },
  });

  const tight = at(400);
  assert.equal(tight.milsovTraded, false, 'at R_ref 400 the corner is not affordable');
  close(tight.milsov[0].d, 1);
  assert.equal(tight.milsov[0].food, 9);

  const loose = at(1600);
  assert.equal(loose.milsovTraded, true, 'at R_ref 1600 the corner is free real estate');
  close(loose.milsov[0].d, 2.828);
  assert.equal(loose.milsov[0].food, 0);
  assert.ok(loose.tiles.length === 8, 'the whole ring stays claimable');
});

test('the trade never returns a worse plan than reserving by distance alone', () => {
  // Both hostings are scored in full and the by-distance one wins every tie, so
  // this holds by construction — which is the whole reason the trade is safe to
  // make unconditional. Swept over random sites because the interaction it turns
  // on is the knapsack's, not the tile's.
  let seed = 20260802;
  const rnd = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed % n;
  };
  const quotas = [
    sov(5),
    sov(3, 2),
    [...sov(5), ...sov(2, 3)],
    sov(1, 6),
  ];
  let traded = 0;
  for (let trial = 0; trial < 60; trial++) {
    const neighbours = [];
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (rnd(10) < 2) continue;              // some tiles are not claimable
        neighbours.push({ dx, dy, food: rnd(17) });   // 0 (unusable) to 16 (water)
      }
    }
    const settings = { ...worked, tMin: 0, milsovQuota: quotas[trial % quotas.length] };
    const plan = scoreSite({ neighbours, settings });
    const pinned = byDistancePlan(neighbours, settings);
    if (!plan || !pinned) continue;

    const why = `trial ${trial}: ${plan.tMax} vs ${pinned.tMax} by distance`;
    assert.ok(plan.tMax >= pinned.tMax - 1e-9, why);
    if (Math.abs(plan.tMax - pinned.tMax) <= 1e-9) {
      assert.ok(plan.uRp <= pinned.uRp + 1e-9, `${why}: same tax, more research`);
    }
    if (plan.milsovTraded) {
      traded++;
      // A traded plan must be strictly better on the plan tie-break,
      // never merely different.
      assert.ok(
        plan.tMax > pinned.tMax + 1e-9 || plan.uRp < pinned.uRp - 1e-9
          || plan.goldNet > pinned.goldNet,
        `${why}: traded without winning`,
      );
    }
    // Whatever the hosting, a tile is never both a milsov host and a food claim.
    const hosts = new Set(plan.milsov.map((m) => `${m.dx},${m.dy}`));
    for (const t of plan.tiles) assert.ok(!hosts.has(`${t.dx},${t.dy}`), `${why}: tile claimed twice`);
  }
  assert.ok(traded > 0, 'the sweep never exercised the trade');
});

test('no milsov quota means no trade and no second knapsack', () => {
  const plan = scoreSite({ neighbours: advisorySite, settings: { ...worked, tMin: 0 } });
  assert.equal(plan.milsovTraded, false);
  assert.deepEqual(plan.milsov, []);
});

test('an unmeetable milsov quota is reported, not silently dropped', () => {
  const plan = scoreSite({
    neighbours: [{ dx: 1, dy: 0, food: 7 }],
    settings: { ...worked, tMin: 0, milsovQuota: sov(3, 4) },
  });
  assert.equal(plan.quotaMet, false);
  assert.equal(plan.milsovNote, null, 'a "maybe" site gets the quota flag, not a level tweak');
});

// --- The indicative resource ceiling ---------------------------------------

// A ring of eight 7-food tiles: comfortably scoreable, so anything that removes
// it from the results came from the resource ceiling and nothing else.
const ring8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
  .map(([dx, dy]) => ({ dx, dy, food: 7 }));

test('a resource with no plots is flagged impossible, not returned as a number', () => {
  const milsovAssignments = [{ sovLevel: 5, buildingLevel: 5 }];
  const r = tRes({ milsovAssignments, plots: { wood: 5, clay: 5, iron: 5, stone: 0, food: 10 } });
  assert.equal(r.impossible, true);
  assert.equal(r.indicative, false);
  assert.equal(r.binding, 'stone', 'the worst resource is named, not the first checked');
  assert.equal(r.ceiling, -Infinity, 'no production pays no upkeep at any tax');
});

test('one requested building is one structure, at one structure of upkeep', () => {
  // 5x Sov V on 3 stone plots is 12,000/hr and a ceiling of -32.6%. ONE Sov V is
  // 2,400/hr and +93.5%, which never binds. The quota is a list of buildings, so
  // one entry can only ever mean one.
  const settings = { ...worked, tMin: -1000, milsovQuota: sov(5) };
  const plan = scoreSite({ neighbours: ring8, settings });
  assert.equal(plan.milsov.length, 1, 'one entry, one building');
  close(plan.resCeiling, 93.48, 0.01);
  assert.equal(plan.resIndicative, false);

  // And the value that made this visible: five buildings really is five.
  const five = scoreSite({ neighbours: ring8, settings: { ...settings, milsovQuota: sov(5, 5) } });
  assert.equal(five.milsov.length, 5);
  close(five.resCeiling, -32.60, 0.01);
  assert.equal(five.binding, 'res', 'a negative measured ceiling is what binds here');
});

test('the claim is charged on its sovereignty level, the structure on its own', () => {
  // A Sov V claim carrying a level 1 building: 50 RP at d = 1 for the claim,
  // but only 150/hr of each basic resource for the structure. Reading either
  // level for both costs is the error the schema exists to prevent.
  const plan = scoreSite({
    neighbours: ring8,
    settings: { ...worked, tMin: 0, milsovQuota: [{ sovLevel: 5, buildingLevel: 1 }] },
  });
  assert.equal(plan.milsov.length, 1);
  assert.equal(plan.milsov[0].sovLevel, 5);
  assert.equal(plan.milsov[0].buildingLevel, 1);
  close(plan.milsov[0].rp, 50, 1e-9);          // 10 x 5 x d, d = 1
  close(plan.milsov[0].gold, 500, 1e-9);
  // 150/hr against 3 stone plots, not the 2,400 the claim's level would imply.
  close(plan.resCeiling, 125 - (100 * 150) / (3 * BASIC_YIELD_L20), 0.01);
});

test('with no milsov quota the ceiling is absent rather than indicative', () => {
  const r = tRes({ milsovAssignments: [], plots: { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 } });
  assert.deepEqual(r, { ceiling: Infinity, indicative: false, binding: null, impossible: false });
});

test('a zero-plot allocation cannot pay milsov upkeep, and now says so in T_max', () => {
  // 0/0/0/0/25 is a legitimate allocation and scores 100% with no milsov. One
  // Sov V on it is 2,400/hr of four resources the city does not produce at all,
  // so no tax rate pays for it: -Infinity is the true answer, and now that the
  // yield behind it is measured the ceiling is allowed to say so.
  //
  // What this must NOT do is disappear without a reason. The plan still carries
  // the impossible flag and names the resource, so the caller can explain the
  // exclusion rather than dropping the site blindly — which is what made the
  // same behaviour unacceptable while the yield was borrowed.
  const plots = { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 };
  const settings = { ...worked, tMin: 0, plots, milsovQuota: sov(5) };
  const plan = scoreSite({ neighbours: ring8, settings });

  assert.equal(plan.tMax, -Infinity);
  assert.equal(plan.binding, 'res', 'a measured ceiling binds like any other');
  assert.equal(plan.resImpossible, true);
  assert.equal(plan.resCeiling, -Infinity);
  assert.equal(plan.resIndicative, false);
  assert.ok(plan.quotaMet, 'the quota fits the tiles — it is the upkeep that cannot be paid');
  assert.ok(plan.resBinding, 'the row can still name which resource killed it');

  // Drop the quota and the same site is perfectly good, which is what makes the
  // exclusion attributable to the quota rather than to the site.
  const noQuota = scoreSite({ neighbours: ring8, settings: { ...settings, milsovQuota: [] } });
  assert.ok(noQuota.tMax >= 50, `the site itself is fine: ${noQuota.tMax}`);
});

test('a low measured ceiling ranks the site rather than annotating it', () => {
  // 5/5/5/1/9: one stone plot against 2,400/hr caps the site at 30.4% however
  // much food it has. While the yield was borrowed this was reported and
  // ignored; measured, it is the answer.
  const settings = {
    ...worked, tMin: 0,
    plots: { wood: 5, clay: 5, iron: 5, stone: 1, food: 9 },
    milsovQuota: sov(5),
  };
  const plan = scoreSite({ neighbours: ring8, settings });
  close(plan.resCeiling, 30.44, 0.01);
  assert.equal(plan.resBinding, 'stone');
  assert.equal(plan.binding, 'res');
  close(plan.tMax, plan.resCeiling, 1e-9);
  // A second stone plot doubles what the city can pay and lifts the ceiling.
  const twoStone = scoreSite({
    neighbours: ring8,
    settings: { ...settings, plots: { wood: 5, clay: 5, iron: 4, stone: 2, food: 9 } },
  });
  assert.ok(twoStone.tMax > plan.tMax, 'more stone must buy more tax');
});

// --- Resource Structures pay only their claim -------------------------------

/** `count` Resource Structure buildings at Sov `level`, e.g. a Mineshaft claim. */
const res = (level, count = 1) =>
  Array.from({ length: count }, () => ({
    structure: 'mineshaft', sovLevel: level, buildingLevel: level,
  }));

test('a Resource Structure claim costs RP and gold but nothing per hour', () => {
  // Same tile, same claim, same reservation as the military case — only the
  // hourly wood/clay/iron/stone bill goes away.
  const settings = { ...worked, tMin: 0, milsovQuota: res(5) };
  const plan = scoreSite({ neighbours: ring8, settings });

  assert.equal(plan.milsov.length, 1, 'the claim still occupies a tile');
  assert.ok(plan.quotaMet);
  close(plan.milsov[0].rp, 50, 1e-9);    // 10 x 5 x d, d = 1 — the claim is charged
  close(plan.milsov[0].gold, 500, 1e-9);
  close(plan.milsovGold, 500, 1e-9);

  // Nothing is charged per hour, so there is no ceiling at all — not merely a
  // high one, which is what tells a reader the claim is free rather than cheap.
  assert.equal(plan.resCeiling, Infinity);
  assert.equal(plan.resImpossible, false);
  assert.notEqual(plan.binding, 'res');

  // The military quota on the identical site is what it costs.
  const military = scoreSite({ neighbours: ring8, settings: { ...settings, milsovQuota: sov(5) } });
  close(military.resCeiling, 93.48, 0.01);
  // Both plans pay the same research, so they differ only in the hourly bill.
  close(plan.uRp, military.uRp, 1e-9);
});

test('a zero-plot site survives a Resource Structure quota outright', () => {
  // The impossible-ceiling path is about upkeep that cannot be paid. With
  // nothing charged there is no ceiling to be impossible about, at any
  // allocation — the site scores exactly as it would with no quota's structures.
  const plots = { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 };
  const plan = scoreSite({
    neighbours: ring8,
    settings: { ...worked, tMin: 0, plots, milsovQuota: res(5) },
  });
  assert.equal(plan.resImpossible, false);
  assert.equal(plan.resBinding, null);
  assert.ok(Number.isFinite(plan.tMax));
});

test('a mixed quota is charged for its Production Structures alone', () => {
  const mixed = [...sov(5), ...res(5, 3)];
  const plan = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: 0, milsovQuota: mixed } });
  assert.equal(plan.milsov.length, 4, 'all four claims are reserved');

  // One Sov V military structure — 2,400/hr, not the 9,600 four would cost.
  close(plan.resCeiling, 125 - (100 * 2400) / (3 * BASIC_YIELD_L20), 0.01);
  close(plan.resCeiling, scoreSite({
    neighbours: ring8, settings: { ...worked, tMin: 0, milsovQuota: sov(5) },
  }).resCeiling, 1e-9);

  // Each structure is charged on its own kind: tRes reads the assignment.
  assert.equal(tRes({ milsovAssignments: mixed, plots: worked.plots }).ceiling, plan.resCeiling);
  assert.deepEqual(
    tRes({ milsovAssignments: res(5, 6), plots: worked.plots }),
    { ceiling: Infinity, indicative: false, binding: null, impossible: false },
  );
});

test('the food structures cost what every other Resource Structure costs', () => {
  // The picker does not offer Farmstead or Fishery — the food plan places those
  // — but the engine knows them, and knowing them must not mean a special case:
  // a resource structure is a resource structure whatever it raises.
  const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
  for (const structure of ['farmstead', 'fishery', 'loggingCamp']) {
    const milsovAssignments = [{ structure, sovLevel: 5, buildingLevel: 5 }];
    assert.deepEqual(tRes({ milsovAssignments, plots: worked.plots }), none, structure);
  }
});

test('the advisory never claims upkeep a Resource Structure does not pay', () => {
  // The same 3x Sov II -> 2x Sov III win as above. On military structures the
  // note warns that concentrating doubles the hourly bill; on Resource
  // Structures there is no bill, so there is nothing to warn about.
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovQuota: res(2, 3) },
  });
  assert.ok(plan.milsovNote, 'the research saving is the same either way');
  assert.deepEqual(plan.milsovAdvice.levels, [3, 3]);
  assert.equal(plan.milsovAdvice.upkeep, 0);
  assert.equal(plan.milsovAdvice.requestedUpkeep, 0);
  assert.ok(!/structure upkeep/.test(plan.milsovNote), plan.milsovNote);
  assert.match(plan.milsovNote, /3x Sov II \(Resource Structure\)/);
});

test('a mixed advisory prices only the structures that are charged', () => {
  // 2x military + 1x resource requested at Sov II: 2 x 300 = 600/hr. The 2x Sov
  // III alternative can carry at most those same two charged structures, so its
  // worst case is 2 x 600 = 1,200 — dearer, and said so. Pricing all three
  // tiles as charged, or none, would misreport it in one direction or the other.
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovQuota: [...sov(2, 2), ...res(2)] },
  });
  assert.ok(plan.milsovNote, 'the note should still fire');
  assert.equal(plan.milsovAdvice.requestedUpkeep, 600);
  assert.equal(plan.milsovAdvice.upkeep, 1200);
  assert.match(plan.milsovNote, /higher structure upkeep/);
});

test('the ceiling binds T_max again once it stops being indicative', () => {
  // The engine still applies a measured ceiling — only the placeholder is held
  // back. tMax is where that decision lands, so it is tested directly.
  const t = tMax({ food: 60, rp: 70, res: 20 });
  close(t.value, 20);
  assert.equal(t.binding, 'res');
});

// --- Boosters, calibrated yields and the surplus read-out -------------------

test('a booster is worth exactly its face value in tax headroom', () => {
  // The bonus is points on the production percentage, like the Flour Mill, so a
  // Stonemason moves a stone-bound ceiling up by 40 and nothing else changes.
  const settings = { ...worked, tMin: 0, milsovQuota: sov(5) };
  const bare = scoreSite({ neighbours: ring8, settings });
  const boosted = scoreSite({
    neighbours: ring8,
    settings: { ...settings, resourceBoosters: { wood: false, clay: false, iron: false, stone: true } },
  });
  assert.equal(bare.resBinding, 'stone', '3 stone plots against 5 of everything else');

  // Boosting only the binding resource lifts it past the other three, so the
  // ceiling stops being stone's and becomes theirs — it does not rise by 40.
  assert.notEqual(boosted.resBinding, 'stone');
  close(boosted.resCeiling, 125 - (100 * 2400) / (5 * BASIC_YIELD_L20), 0.01);

  // With every booster on, all four move together and stone binds again.
  const all = scoreSite({
    neighbours: ring8,
    settings: { ...settings, resourceBoosters: { wood: true, clay: true, iron: true, stone: true } },
  });
  close(all.resCeiling, bare.resCeiling + 40, 1e-9);
  assert.equal(all.resBinding, 'stone');
});

test('a calibration reading overrides the default yield for that city', () => {
  // A site rich enough in food and research that the resource ceiling is the
  // lowest of the three — otherwise "it binds" would prove nothing.
  const rich = ring8.map((t) => ({ ...t, food: 16 }));
  const settings = {
    ...worked, tMin: -1000, milsovQuota: sov(5, 4),
    rpCalibration: { observedRpPerHour: 8000, atTax: 25 },
    resourceCalibration: { observedPerHour: 15000, atTax: 25, plots: 5, booster: false },
  };
  const plan = scoreSite({ neighbours: rich, settings });
  // 4x Sov V is 9,600/hr against 3 stone plots at the reading's 3,000 a plot.
  close(plan.resCeiling, 125 - (100 * 9600) / (3 * 3000), 0.01);
  assert.equal(plan.binding, 'res', 'a measured ceiling binds T_max');
  close(plan.tMax, plan.resCeiling, 1e-9);

  // Without the reading the same site uses the default yield, which is lower,
  // so the ceiling is lower — and both are applied, neither is annotation.
  const dflt = scoreSite({ neighbours: rich, settings: { ...settings, resourceCalibration: null } });
  close(dflt.resCeiling, 125 - (100 * 9600) / (3 * BASIC_YIELD_L20), 0.01);
  assert.equal(dflt.binding, 'res');
  assert.ok(dflt.tMax < plan.tMax, 'the lower yield must give the lower ceiling');
});

test('the binding ceiling has exactly zero left over at T_max', () => {
  // The surplus figures are the ceiling equations read as a balance, so this is
  // the two derivations checking each other.
  for (const quota of [[], sov(3, 2), [...sov(5), ...res(5, 2)]]) {
    const plan = scoreSite({ neighbours: ring8, settings: { ...worked, tMin: 0, milsovQuota: quota } });
    const s = plan.surplus;
    close(s.tax, plan.tMax, 1e-9);
    if (plan.binding === 'food') close(s.food, 0, 1e-6);
    if (plan.binding === 'rp') close(s.rp, 0, 1e-6);
    assert.ok(s.food >= -1e-6, `food deficit at T_max: ${s.food}`);
    assert.ok(s.rp >= -1e-6, `research deficit at T_max: ${s.rp}`);
  }
});

test('the surplus states the milsov bill against every basic resource', () => {
  // 4x Sov V is 9,600/hr of EACH of the four, so each is its own production
  // less the same figure — and on 3 stone plots that is a deficit, which is the
  // whole point of showing it.
  const settings = { ...worked, tMin: -1000, milsovQuota: sov(5, 4) };
  const plan = scoreSite({ neighbours: ring8, settings });
  const { yield: y } = computeBasicYield(settings);
  assert.equal(plan.surplus.upkeep, 9600);
  for (const r of ['wood', 'clay', 'iron', 'stone']) {
    const expected = (worked.plots[r] * y * (125 - plan.tMax)) / 100 - 9600;
    close(plan.surplus[r], expected, 1e-6);
  }
  assert.equal(plan.surplus.indicative, false, 'the yield behind them is measured');

  // Stone is the tightest of the four, on three plots against five — which is
  // what makes it the resource T_res names. It is still positive here because
  // food binds at a lower tax than the stone ceiling, and a lower tax produces
  // more of everything: no basic resource can run a deficit once the ceiling
  // that binds is a measured one.
  assert.equal(plan.resBinding, 'stone');
  for (const r of BASIC_RESOURCES) {
    assert.ok(plan.surplus[r] >= -1e-6, `${r} must not be in deficit: ${plan.surplus[r]}`);
    if (r !== 'stone') assert.ok(plan.surplus[r] > plan.surplus.stone, `${r} beats stone`);
  }
  assert.ok(plan.tMax <= plan.resCeiling + 1e-9, 'the tax never exceeds the resource ceiling');
});

test('a Resource Structure quota leaves the basic resources untouched', () => {
  // Nothing is charged per hour, so the surplus is pure production — the same
  // figure a site with no quota at all would report at the same tax.
  const settings = { ...worked, tMin: 0, milsovQuota: res(5, 3) };
  const plan = scoreSite({ neighbours: ring8, settings });
  assert.equal(plan.surplus.upkeep, 0);
  const { yield: y } = computeBasicYield(settings);
  close(plan.surplus.stone, (worked.plots.stone * y * (125 - plan.tMax)) / 100, 1e-6);
  assert.ok(plan.surplus.stone > 0);
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

// --- Milsov level advisory (PRD §3.6) --------------------------------------

// Two orthogonal neighbours at d = 1 and a diagonal at d = 1.414. Requesting
// 3x Sov II reaches the diagonal; 2x Sov III does not, and buys the same +30%.
//   requested 3x Sov II : 10 * 2 * (1 + 1 + 1.4142) = 68.28 RP, bonus 30
//   alternative 2x Sov III : 10 * 3 * (1 + 1)       = 60.00 RP, bonus 30
const advisorySite = [
  { dx: 1, dy: 0, food: 3 },
  { dx: 0, dy: 1, food: 3 },
  { dx: 1, dy: 1, food: 3 },
  { dx: 2, dy: 0, food: 7 },
  { dx: 2, dy: 2, food: 9 },
];

test('the advisory fires when a concentrated split genuinely wins', () => {
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovQuota: sov(2, 3) },
  });
  assert.ok(plan.milsovNote, 'the note should fire');
  assert.deepEqual(plan.milsovAdvice.levels, [3, 3]);
  close(plan.milsovAdvice.rp, 60);
  close(plan.milsovAdvice.requestedRp, 68.284);
  assert.equal(plan.milsovAdvice.bonus, 30);
  assert.equal(plan.milsovAdvice.requestedBonus, 30);
  assert.match(plan.milsovNote, /^2x Sov III would cost less research than your 3x Sov II/);
  // Upkeep doubles per level, so concentrating costs more W/C/I/S. Say so.
  assert.match(plan.milsovNote, /higher structure upkeep/);
});

test('the plan still uses the requested levels unchanged when the note fires', () => {
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovQuota: sov(2, 3) },
  });
  assert.ok(plan.milsovNote, 'precondition: the note fires');
  assert.equal(plan.milsov.length, 3, 'three tiles, exactly as requested');
  for (const m of plan.milsov) assert.equal(m.sovLevel, 2, 'Sov II, exactly as requested');
  close(plan.milsov.reduce((n, m) => n + m.rp, 0), 68.284);
});

test('the advisory stays silent when the distance multiplier kills the saving', () => {
  // The PRD's own illustration, at real distances: only one tile sits at d = 1,
  // so spreading 1x Sov V over more squares reaches d = 1.414 and beyond and
  // costs more research for the same or less bonus.
  const neighbours = [
    { dx: 1, dy: 0, food: 3 },
    { dx: 1, dy: 1, food: 3 },
    { dx: 2, dy: 0, food: 7 },
    { dx: 2, dy: 2, food: 9 },
  ];
  const plan = scoreSite({
    neighbours,
    settings: { ...worked, tMin: 0, milsovQuota: sov(5) },
  });
  assert.equal(plan.milsovNote, null, '3x Sov II does not actually beat 1x Sov V here');
});

test('the advisory never suggests spending more research or taking more tiles', () => {
  // Bonus per RP collapses to 1/(2 * mean distance), so a plan on more of the
  // cheapest-first prefix can never win. That is what makes it safe to compare
  // milsov in isolation: a win returns tiles to the food knapsack.
  const ds = [1, 1, 1.4142135, 2, 2.2360679, 2.8284271];
  const tiles = ds.map((d) => ({ d }));
  for (let level = 1; level <= 5; level++) {
    for (let count = 1; count <= ds.length; count++) {
      const requested = tiles.slice(0, count).map((t) => ({
        ...t, sovLevel: level, buildingLevel: level, rp: claimUpkeep(t.d, level, false).rp,
      }));
      const advice = milsovAdvice({ requested, tiles, chancery: false });
      if (!advice) continue;
      assert.ok(advice.rp <= advice.requestedRp + 1e-9, `${count}x L${level}: spends more RP`);
      assert.ok(advice.bonus >= advice.requestedBonus - 1e-9, `${count}x L${level}: weaker`);
      assert.ok(advice.tileCount <= count, `${count}x L${level}: took more tiles`);
    }
  }
});

test('the advisory costs nothing and says nothing without a milsov quota', () => {
  const plan = scoreSite({ neighbours: advisorySite, settings: { ...worked, tMin: 0 } });
  assert.equal(plan.milsovNote, null);
  assert.equal(plan.milsovAdvice, null);
  assert.equal(milsovAdvice({ requested: [], tiles: [], chancery: false }), null);
});

test('the advisory toggle switches it off (PRD §4)', () => {
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovAdvisory: false, milsovQuota: sov(2, 3) },
  });
  assert.equal(plan.milsovNote, null);
});

test('a mixed quota puts the highest level on the nearest tile', () => {
  const plan = scoreSite({
    neighbours: advisorySite,
    settings: { ...worked, tMin: 0, milsovQuota: [...sov(1), ...sov(5)] },
  });
  const byD = [...plan.milsov].sort((a, b) => a.d - b.d);
  assert.equal(byD[0].sovLevel, 5, 'Sov V belongs on the d=1 tile, not the Sov I');
  assert.equal(byD[1].sovLevel, 1);
});
