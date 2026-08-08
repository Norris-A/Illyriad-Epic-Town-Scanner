// Settings form. panel.js only touches the DOM inside createPanel, so the field
// spec and the validators are testable here without a browser — the same
// property that makes toCsv testable in csv.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  SETTINGS_FIELDS,
  PLOT_KEYS,
  PLOT_TOTAL,
  clampNumber,
  validatePlots,
  parseMilsovStructure,
  milsovPlanText,
  MILSOV_BLOCKED_TEXT,
  parseRpCalibration,
  parseResourceBoosters,
  parseResourceCalibration,
  parseResourceMinimums,
  parsePrestige,
  surplusRows,
  settingsFormHtml,
} from '../src/panel.js';
import {
  DEFAULT_SETTINGS,
  BASIC_RESOURCES,
  BASIC_YIELD_L20,
  FARM_YIELD_L20,
  PRESTIGE_KEYS,
  PRESTIGE_PRODUCTION_BONUS,
  SOV_STRUCTURES,
  MILSOV_STRUCTURES,
  MILSOV_UPKEEP_BY_LEVEL,
  MILSOV_UPKEEP_STEP,
  SOV_STRUCTURE_BY_KEY,
  DEFAULT_SOV_STRUCTURE,
} from '../src/constants.js';
import { computeK, computeRRef, milsovUpkeep, computeBasicYield } from '../src/scoring.js';

const close = (a, b, eps = 0.05) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

// --- the spec is driven by DEFAULT_SETTINGS, not a second copy of the table ---

test('every setting has exactly one control, and every control a setting', () => {
  const declared = SETTINGS_FIELDS.map((f) => f.key);
  assert.equal(new Set(declared).size, declared.length, 'a key is declared twice');
  assert.deepEqual(
    [...declared].sort(),
    Object.keys(DEFAULT_SETTINGS).sort(),
    'SETTINGS_FIELDS and DEFAULT_SETTINGS have drifted apart',
  );
});

test('the defaults render into the form without throwing', () => {
  const html = settingsFormHtml(DEFAULT_SETTINGS);
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    assert.ok(html.includes(`data-key="${key}"`), `${key} has no control in the markup`);
  }
  assert.ok(html.includes('Prefill from Selected Tile'), 'the prefill button is missing');
  assert.ok(!/undefined|\[object Object\]/.test(html), 'a field rendered a stray value');
});

test('the markup carries every hook createPanel reads back out of it', () => {
  // createPanel is the only DOM code here and cannot run under Node, so what is
  // checkable is its contract with the markup: a typo'd selector on either side
  // shows up as a missing hook rather than as a null dereference in the game.
  const html = settingsFormHtml({ ...DEFAULT_SETTINGS, milsovStructure: 'targetRange' });
  const hooks = [
    'class="sov-form"',
    'class="sov-plot-total"', 'sov-prefill sec', 'sov-prefill-src',
    'class="sov-reset sec"', 'class="sov-derived"', 'sov-derived-food', 'sov-store-note',
    'data-cal="observedRpPerHour"', 'data-cal="atTax"', 'data-cal="prestige"',
    'data-res-cal="observed"', 'data-res-cal="atTax"', 'data-res-cal="plots"',
    'data-res-cal="booster"', 'data-res-cal="prestige"', 'sov-yield-read',
    ...BASIC_RESOURCES.map((r) => `data-booster="${r}"`),
    ...BASIC_RESOURCES.map((r) => `data-minimum="${r}"`),
    ...PRESTIGE_KEYS.map((k) => `data-prestige="${k}"`),
    'select data-key="milsovStructure"',
    ...PLOT_KEYS.map((p) => `data-plot="${p}"`),
  ];
  for (const hook of hooks) assert.ok(html.includes(hook), `markup is missing ${hook}`);

  // readSettings/writeSettings qualify by tag name, so the tag has to match the
  // declared type: a checkbox read as `input[data-key]`, a select as `select[…]`.
  for (const f of SETTINGS_FIELDS) {
    if (f.type === 'checkbox') {
      assert.ok(html.includes(`<input type="checkbox" data-key="${f.key}"`), `${f.key} is not a checkbox input`);
    } else if (f.type === 'select') {
      assert.ok(html.includes(`<select data-key="${f.key}"`), `${f.key} is not a select`);
    } else if (!['plots', 'milsov', 'calibration', 'boosters', 'prestige', 'minimums',
      'resourceCalibration'].includes(f.type)) {
      assert.ok(html.includes(`<input type="number" data-key="${f.key}"`), `${f.key} is not a number input`);
    }
  }
});

// --- the settle plot allocation ---

test('the default allocation is 5/5/5/3/7 and sums to 25', () => {
  const r = validatePlots(DEFAULT_SETTINGS.plots);
  assert.equal(r.total, PLOT_TOTAL);
  assert.ok(r.ok);
  assert.equal(r.message, '');
  assert.deepEqual(r.plots, { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 });
});

test('any split validates — 3-stone and 3-iron builds are legitimate', () => {
  for (const plots of [
    { wood: 5, clay: 5, iron: 3, stone: 5, food: 7 },
    { wood: 3, clay: 3, iron: 3, stone: 3, food: 13 },
    { wood: 0, clay: 0, iron: 0, stone: 0, food: 25 },
    { wood: 25, clay: 0, iron: 0, stone: 0, food: 0 },
  ]) {
    assert.ok(validatePlots(plots).ok, `${Object.values(plots).join('|')} should validate`);
  }
});

test('a total that is not 25 is rejected, and says by how much', () => {
  const short = validatePlots({ wood: 5, clay: 5, iron: 5, stone: 3, food: 5 });
  assert.equal(short.ok, false);
  assert.equal(short.total, 23);
  assert.equal(short.message, '2 short');

  const over = validatePlots({ wood: 6, clay: 6, iron: 6, stone: 6, food: 6 });
  assert.equal(over.ok, false);
  assert.equal(over.total, 30);
  assert.equal(over.message, '5 over');
});

test('individual entries are clamped to 0..25 integers', () => {
  const r = validatePlots({ wood: -4, clay: 40, iron: 'abc', stone: 2.6, food: '' });
  assert.deepEqual(r.plots, { wood: 0, clay: 25, iron: 0, stone: 3, food: 0 });
  assert.equal(r.total, 28);
  assert.equal(r.ok, false);
});

test('a missing field is 0, not NaN — the total stays a number', () => {
  const r = validatePlots({});
  assert.equal(r.total, 0);
  assert.equal(r.message, '25 short');
  assert.ok(PLOT_KEYS.every((p) => r.plots[p] === 0));
});

test('food plots drive K, which is why the allocation is not cosmetic', () => {
  // Two food plots either way is 40 points of K, and K scales every food figure.
  close(computeK(validatePlots(DEFAULT_SETTINGS.plots).plots.food), 140.98);
  close(computeK(validatePlots({ ...DEFAULT_SETTINGS.plots, food: 5, stone: 5 }).plots.food), 100.70);
});

test('a prefilled water tile is flagged rather than silently scored', () => {
  // Water tiles carry food only, so prefilling from one cannot reach 25. The
  // form has to reject that, not scale it to fit.
  const r = validatePlots({ wood: 0, clay: 0, iron: 0, stone: 0, food: 9 });
  assert.equal(r.ok, false);
  assert.equal(r.message, '16 short');
});

// --- the military structure choice ------------------------------------------

test('the structure is the only thing the user still sets', () => {
  // Count, levels and squares are the engine's answer, so there is one control
  // and it names a building — never a number.
  for (const s of MILSOV_STRUCTURES) {
    assert.equal(parseMilsovStructure(s.key), s.key);
  }
  assert.equal(parseMilsovStructure(''), null, 'blank is a food-only scan');
  assert.equal(parseMilsovStructure(undefined), null);
  assert.equal(parseMilsovStructure(null), null);
});

test('a structure the picker does not offer is refused, not quietly charged', () => {
  // The only way to type one of these is for the picker and the table to have
  // drifted apart, and the engine would then place buildings the user cannot
  // have chosen. Nothing is safer than none.
  for (const key of ['nonsense', 'TRAININGGROUND', 'farmstead', 'fishery', 'mineshaft']) {
    assert.equal(parseMilsovStructure(key), null, `${key} should not be selectable`);
  }
});

test('the default is no military sovereignty, which keeps T_res non-binding', () => {
  assert.equal(DEFAULT_SETTINGS.milsovStructure, null);
  assert.equal(parseMilsovStructure(DEFAULT_SETTINGS.milsovStructure), null);
  assert.equal(DEFAULT_SETTINGS.milsovMinBonus, 0, 'and no site is filtered on military');
});

test('the minimum bonus is disabled until a structure is named', () => {
  // It filters on how much military a site fits, so with none asked for there
  // is nothing for it to read — leave it visibly off rather than silently
  // ignored.
  const field = SETTINGS_FIELDS.find((f) => f.key === 'milsovMinBonus');
  assert.ok(field.enabledWhen, 'the field must be gated');
  assert.equal(field.enabledWhen({ milsovStructure: null }), false);
  assert.equal(field.enabledWhen({ milsovStructure: 'trainingGround' }), true);
});

test('upkeep is charged on the building, never on the claim', () => {
  // A Sov V claim carrying a level 1 building costs 150/hr, not 2,400 — the
  // sovereignty level is paid in RP and gold instead.
  assert.equal(milsovUpkeep([{ sovLevel: 5, buildingLevel: 1 }]), 150);
  assert.equal(milsovUpkeep([{ sovLevel: 1, buildingLevel: 1 }]), 150);
  assert.equal(milsovUpkeep([]), 0);
});

// --- the per-hour balance ---------------------------------------------------

test('the balance carries gold, and every row states what the plan spent', () => {
  const surplus = {
    food: 1000, rp: 200, gold: 5000, wood: 300, clay: 300, iron: 300, stone: 300,
    upkeep: 900, indicative: false,
    base: { food: 33200, rp: 1200, gold: 15000, wood: 1200, clay: 1200, iron: 1200, stone: 1200 },
  };
  const rows = surplusRows(surplus, null);
  assert.deepEqual(rows.map((r) => r.key),
    ['food', 'rp', 'gold', ...BASIC_RESOURCES], 'gold is a per-hour figure like the rest');
  for (const r of rows) assert.equal(r.spent, r.base - r.value, `${r.key} does not add up`);
  // A basic resource spends the sovereignty upkeep; gold spends the claim price.
  assert.equal(rows.find((r) => r.key === 'stone').spent, 900);
  assert.equal(rows.find((r) => r.key === 'gold').spent, 10000);
});

test('a row with no production figure reports no spend rather than NaN', () => {
  const rows = surplusRows({ food: 10, rp: 0, gold: 0 }, null);
  for (const r of rows) assert.equal(r.spent, undefined);
});

// --- the structure table ----------------------------------------------------

test('the upkeep steps are the table read as increments, and are convex', () => {
  // The planner spends against the steps, not the totals. They have to add back
  // up to the table, and they have to RISE — that convexity is the whole reason
  // several low-level buildings can be cheaper to run than one high one.
  let running = 0;
  for (let level = 1; level <= 5; level++) {
    running += MILSOV_UPKEEP_STEP[level - 1];
    assert.equal(running, MILSOV_UPKEEP_BY_LEVEL[level], `level ${level} does not add up`);
  }
  for (let i = 1; i < MILSOV_UPKEEP_STEP.length; i++) {
    assert.ok(MILSOV_UPKEEP_STEP[i] >= MILSOV_UPKEEP_STEP[i - 1], 'the steps must not fall');
  }
  assert.ok(MILSOV_UPKEEP_STEP.at(-1) > MILSOV_UPKEEP_STEP[0], 'and must actually rise');
});

test('every structure in the table is one kind or the other, and named', () => {
  for (const s of SOV_STRUCTURES) {
    assert.ok(['production', 'resource'].includes(s.type), `${s.key} has no upkeep class`);
    assert.ok(s.name && s.key, 'a structure needs both a key and a name');
    // Only resource structures raise a resource, and each raises a real one.
    if (s.type === 'production') assert.equal(s.boosts, undefined, `${s.key} should boost nothing`);
    else assert.ok(PLOT_KEYS.includes(s.boosts), `${s.key} boosts ${s.boosts}`);
  }
  assert.equal(new Set(SOV_STRUCTURES.map((s) => s.key)).size, SOV_STRUCTURES.length, 'duplicate key');
  assert.ok(SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE], 'the default must be in the table');
  assert.equal(SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE].type, 'production',
    'the fallback has to be the charged kind');

  // The picker is the table filtered to the charged kind, derived rather than
  // retyped — a Resource Structure has no hourly bill, so nothing would stop the
  // planner claiming every spare tile with one for a bonus that is not scored.
  assert.deepEqual(
    MILSOV_STRUCTURES.map((s) => s.key),
    SOV_STRUCTURES.filter((s) => s.type === 'production').map((s) => s.key),
  );
  assert.ok(MILSOV_STRUCTURES.every((s) => milsovUpkeep([{ structure: s.key, buildingLevel: 5 }]) === 2400),
    'every offered structure must actually be charged');
  assert.deepEqual(
    SOV_STRUCTURES.filter((s) => s.boosts === 'food').map((s) => s.name),
    ['Farmstead', 'Fishery'],
  );
});

test('a Resource Structure still pays its claim but no hourly bill', () => {
  // Out of the picker, not out of the engine: the table is what the cost model
  // reads, and it must not grow a special case just because nothing selects it.
  for (const key of ['gravelPit', 'loggingCamp', 'mineshaft', 'earthworks', 'farmstead', 'fishery']) {
    assert.equal(milsovUpkeep([{ structure: key, buildingLevel: 5 }]), 0, key);
  }
  assert.equal(milsovUpkeep(Array(4).fill({ structure: 'targetRange', buildingLevel: 5 })), 9600);
});

test('the picker offers the military structures and a way to ask for none', () => {
  const html = settingsFormHtml({ ...DEFAULT_SETTINGS, milsovStructure: 'joustingYard' });
  assert.ok(html.includes('<option value="joustingYard" selected>'), 'the choice is not selected');
  assert.ok(/<option value=""[^>]*>None/.test(html), 'there must be a way to ask for none');
  for (const s of MILSOV_STRUCTURES) {
    assert.ok(html.includes(`value="${s.key}"`), `${s.key} is missing from the picker`);
  }
  // Resource sovereignty is not placed automatically, so it is not offered.
  assert.ok(!/<option value="(farmstead|fishery|mineshaft|loggingCamp|earthworks|gravelPit)"/i.test(html),
    'a Resource Structure must not be pickable');
  // Nothing in the form asks for a count or a level any more.
  assert.ok(!/data-milsov=/.test(html), 'no control should ask for a count or a level');

  const blank = settingsFormHtml(DEFAULT_SETTINGS);
  assert.ok(/<option value="" selected>None/.test(blank), 'the default should select None');
});

test('the plan read-out describes what was placed, and blocking says why not', () => {
  assert.equal(
    milsovPlanText({
      milsov: [{ buildingLevel: 2 }, { buildingLevel: 2 }, { buildingLevel: 1 }],
      milsovBonus: 25,
      milsovUpkeep: 750,
    }),
    '2x Sov II + 1x Sov I — +25% military unit production, upkeep 750/hr of wood, clay, iron and stone.',
  );
  assert.equal(milsovPlanText({ milsov: [] }), '');
  assert.equal(milsovPlanText(null), '');

  // Every reason the engine can return has wording waiting for it.
  for (const reason of ['tiles', 'slots', 'upkeep', 'rp']) {
    assert.ok(MILSOV_BLOCKED_TEXT[reason], `no wording for "${reason}"`);
  }
});

// --- basic resource boosters and the yield calibration ---

test('the four boosters read back as booleans, defaulting to off', () => {
  assert.deepEqual(parseResourceBoosters({}), { wood: false, clay: false, iron: false, stone: false });
  assert.deepEqual(parseResourceBoosters({ stone: true, iron: 'yes' }),
    { wood: false, clay: false, iron: true, stone: true });
  assert.deepEqual(parseResourceBoosters(undefined), parseResourceBoosters({}));
  assert.deepEqual(DEFAULT_SETTINGS.resourceBoosters, parseResourceBoosters({}),
    'the default city has none of them');
});

test('a reading without plots cannot be divided, so it is treated as absent', () => {
  assert.equal(parseResourceCalibration({ observed: '', atTax: '', plots: '', booster: false }), null);
  assert.equal(parseResourceCalibration({ observed: '5000', plots: '0' }), null);
  assert.equal(parseResourceCalibration({ observed: '0', plots: '5' }), null);
  // An absent reading falls back to the measured default, not to nothing.
  const fallback = computeBasicYield({ resourceCalibration: null });
  assert.equal(fallback.measured, true);
  close(fallback.yield, BASIC_YIELD_L20, 1e-9);
});

test('a reading back-solves the per-plot yield, dividing out tax and booster', () => {
  // 5 plots at 25% tax with no booster: M = 100, so 15,000/hr is 3,000 a plot.
  const plain = parseResourceCalibration({ observed: '15000', atTax: '25', plots: '5' });
  assert.deepEqual(plain,
    { observedPerHour: 15000, atTax: 25, plots: 5, booster: false, prestige: false });
  const yPlain = computeBasicYield({ resourceCalibration: plain });
  close(yPlain.yield, 3000);
  assert.equal(yPlain.measured, true);

  // The same output with the booster running means a LOWER underlying yield:
  // M = 140, so the booster was doing 40 of the 140 points of the work.
  const boosted = parseResourceCalibration({ observed: '15000', atTax: '25', plots: '5', booster: true });
  close(computeBasicYield({ resourceCalibration: boosted }).yield, (15000 * 100) / (5 * 140));
});

test('the default yield is the measured 2,538, not the farm figure', () => {
  const { yield: y, measured } = computeBasicYield(DEFAULT_SETTINGS);
  assert.equal(measured, true);
  close(y, 2538, 1e-9);
  assert.notEqual(BASIC_YIELD_L20, FARM_YIELD_L20,
    'borrowing the farm yield is the mistake this constant exists to end');

  // 25% tax with no booster is M = 100, so a reading taken there IS the yield —
  // which is why a figure quoted as "per hour per plot" needs no adjustment.
  const atQuarter = computeBasicYield({
    resourceCalibration: { observedPerHour: 2538 * 5, atTax: 25, plots: 5, booster: false },
  });
  close(atQuarter.yield, BASIC_YIELD_L20, 1e-9);
});

// --- RP calibration override ---

test('a blank calibration is null, so R_ref falls back to the library table', () => {
  assert.equal(parseRpCalibration('', ''), null);
  assert.equal(parseRpCalibration('0', '25'), null);
  assert.equal(parseRpCalibration('nonsense', '25'), null);
  close(computeRRef({ ...DEFAULT_SETTINGS, rpCalibration: parseRpCalibration('', '') }), 1600);
});

test('a calibration reading back-solves R_ref', () => {
  const cal = parseRpCalibration('800', '25');
  assert.deepEqual(cal, { observedRpPerHour: 800, atTax: 25, prestige: false });
  close(computeRRef({ ...DEFAULT_SETTINGS, rpCalibration: cal }), 800);
});

test('the calibration tax is clamped, since R_ref divides by (125 - tax)', () => {
  assert.equal(parseRpCalibration('800', '900').atTax, 100);
  assert.equal(parseRpCalibration('800', '-5').atTax, 0);
  assert.ok(Number.isFinite(computeRRef({
    ...DEFAULT_SETTINGS, rpCalibration: parseRpCalibration('800', '900'),
  })));
});

// --- the shared number reader ---

test('a blank field means the default, not the minimum', () => {
  assert.equal(clampNumber('', { min: 1, max: 20, fallback: 20 }), 20);
  assert.equal(clampNumber(null, { fallback: 2 }), 2);
  assert.equal(clampNumber('12', { min: 0, max: 100 }), 12);
  assert.equal(clampNumber('101', { min: 0, max: 100 }), 100);
  assert.equal(clampNumber('2.6', { integer: true }), 3);
  assert.equal(clampNumber('2.6', { integer: false }), 2.6);
});
