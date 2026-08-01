// The PRD §6 worked example is the oracle for this engine. If these fail, the
// model has drifted from the document — fix one or the other deliberately.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeK, computeBOther, computeConsumption, computeRRef,
  tFood, tRp, tMax, goldNet, claimUpkeep, distance, knapsack, recoverSet, scoreSite,
} from '../src/scoring.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';

const close = (a, b, eps = 0.05) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// Defaults of the worked example: 7-food site, standard city, Flour Mill on,
// other +20, no spell, Library 20 with Allembine, no Insight, no Chancery.
const worked = { ...DEFAULT_SETTINGS };

test('K = 7 x 2014 / 100 = 140.98 (mechanics §4.1)', () => {
  close(computeK(7), 140.98);
  close(computeK(5), 100.70);
});

test('B_other = Flour Mill 40 + other 20 = 60', () => {
  close(computeBOther(worked), 60);
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
    settings: { ...worked, tMin: 0, milsovQuota: [{ level: 3, count: 1 }] },
  });
  assert.equal(plan.milsov.length, 1);
  assert.equal(plan.milsov[0].dx, 1, 'milsov should take the nearest tile');
  assert.ok(plan.quotaMet);
  assert.ok(plan.resIndicative, 'T_res must be flagged indicative — open item 12');
});

test('an unmeetable milsov quota is reported, not silently dropped', () => {
  const plan = scoreSite({
    neighbours: [{ dx: 1, dy: 0, food: 7 }],
    settings: { ...worked, tMin: 0, milsovQuota: [{ level: 3, count: 4 }] },
  });
  assert.equal(plan.quotaMet, false);
});
