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
  normaliseMilsovQuota,
  milsovStructureCounts,
  milsovTotalText,
  parseRpCalibration,
  parseResourceBoosters,
  parseResourceCalibration,
  surplusRows,
  settingsFormHtml,
} from '../src/panel.js';
import {
  DEFAULT_SETTINGS,
  BASIC_RESOURCES,
  BASIC_YIELD_L20,
  FARM_YIELD_L20,
  SOV_STRUCTURES,
  SOV_QUOTA_STRUCTURES,
  SOV_STRUCTURE_BY_KEY,
  DEFAULT_SOV_STRUCTURE,
} from '../src/constants.js';
import { computeK, computeRRef, milsovUpkeep, computeBasicYield } from '../src/scoring.js';

/** The structure a row that names none falls back to — the charged kind. */
const prod = DEFAULT_SOV_STRUCTURE;

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
  assert.ok(html.includes('Prefill from selected tile'), 'the prefill button is missing');
  assert.ok(!/undefined|\[object Object\]/.test(html), 'a field rendered a stray value');
});

test('the markup carries every hook createPanel reads back out of it', () => {
  // createPanel is the only DOM code here and cannot run under Node, so what is
  // checkable is its contract with the markup: a typo'd selector on either side
  // shows up as a missing hook rather than as a null dereference in the game.
  const html = settingsFormHtml({ ...DEFAULT_SETTINGS, milsovQuota: [{ sovLevel: 3, buildingLevel: 2 }] });
  const hooks = [
    'class="sov-form"',
    'class="sov-plot-total"', 'sov-prefill sec', 'sov-prefill-src',
    'sov-milsov-rows', 'sov-milsov-empty', 'sov-milsov-add', 'sov-milsov-del', 'sov-milsov-row',
    'class="sov-reset sec"', 'class="sov-derived"', 'sov-derived-food',
    'data-cal="observedRpPerHour"', 'data-cal="atTax"',
    'data-res-cal="observed"', 'data-res-cal="atTax"', 'data-res-cal="plots"',
    'data-res-cal="booster"', 'sov-yield-read',
    ...BASIC_RESOURCES.map((r) => `data-booster="${r}"`),
    'data-milsov="sovLevel"', 'data-milsov="buildingLevel"', 'data-milsov="structure"',
    'sov-milsov-total',
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
    } else if (!['plots', 'milsov', 'calibration', 'boosters', 'resourceCalibration'].includes(f.type)) {
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

// --- milsov quota rows ---

test('one row is one building, and rows come back level-descending', () => {
  // The row carries two levels, not a level and a count. A quota of three rows
  // is three buildings — never one building at "level 3".
  assert.deepEqual(
    normaliseMilsovQuota([
      { sovLevel: 3, buildingLevel: 3 },
      { sovLevel: 5, buildingLevel: 5 },
      { sovLevel: 3, buildingLevel: 2 },
    ]),
    [
      { structure: prod, sovLevel: 5, buildingLevel: 5 },
      { structure: prod, sovLevel: 3, buildingLevel: 3 },
      { structure: prod, sovLevel: 3, buildingLevel: 2 },
    ],
  );
});

test('a single Sov V row is ONE building, whatever its building level', () => {
  // The regression this whole schema exists for: the second control used to be
  // a count, so "Sov V, level 5" scored as five structures — 12,000/hr of each
  // basic resource instead of 2,400, which is the difference between a +85%
  // resource ceiling and a −73.6% one.
  for (const buildingLevel of [1, 2, 3, 4, 5]) {
    const quota = normaliseMilsovQuota([{ sovLevel: 5, buildingLevel }]);
    assert.equal(quota.length, 1, `building level ${buildingLevel} is still one building`);
    assert.equal(quota[0].buildingLevel, buildingLevel);
  }
  assert.equal(milsovUpkeep(normaliseMilsovQuota([{ sovLevel: 5, buildingLevel: 5 }])), 2400);
  assert.equal(milsovUpkeep(normaliseMilsovQuota(Array(5).fill({ sovLevel: 5, buildingLevel: 5 }))), 12000);
});

test('a building may not out-level its claim, and defaults to matching it', () => {
  assert.deepEqual(normaliseMilsovQuota([{ sovLevel: 2, buildingLevel: 5 }]),
    [{ structure: prod, sovLevel: 2, buildingLevel: 2 }]);
  assert.deepEqual(normaliseMilsovQuota([{ sovLevel: 3, buildingLevel: '' }]),
    [{ structure: prod, sovLevel: 3, buildingLevel: 3 }]);
});

test('empty rows are dropped and levels clamped to 1..5', () => {
  assert.deepEqual(normaliseMilsovQuota([]), []);
  assert.deepEqual(normaliseMilsovQuota(undefined), []);
  assert.deepEqual(normaliseMilsovQuota([{ sovLevel: '', buildingLevel: 2 }]), []);
  assert.deepEqual(normaliseMilsovQuota([{ sovLevel: 9, buildingLevel: '9' }]),
    [{ structure: prod, sovLevel: 5, buildingLevel: 5 }]);
});

test('upkeep is charged on the building, never on the claim', () => {
  // A Sov V claim carrying a level 1 building costs 150/hr, not 2,400 — the
  // sovereignty level is paid in RP and gold instead.
  assert.equal(milsovUpkeep([{ sovLevel: 5, buildingLevel: 1 }]), 150);
  assert.equal(milsovUpkeep([{ sovLevel: 1, buildingLevel: 1 }]), 150);
  assert.equal(milsovUpkeep([]), 0);
});

// --- structure type ---------------------------------------------------------

test('a row keeps the structure it names, and an unknown one is charged', () => {
  // Every structure in the table survives the round trip, including the two the
  // picker does not offer — the engine costs them like any other.
  for (const s of SOV_STRUCTURES) {
    assert.deepEqual(
      normaliseMilsovQuota([{ structure: s.key, sovLevel: 5, buildingLevel: 5 }]),
      [{ structure: s.key, sovLevel: 5, buildingLevel: 5 }],
    );
  }
  // A value the table does not know must not buy a free claim by accident.
  for (const structure of [undefined, '', 'nonsense', 'RESOURCE']) {
    assert.deepEqual(
      normaliseMilsovQuota([{ structure, sovLevel: 5, buildingLevel: 5 }]),
      [{ structure: prod, sovLevel: 5, buildingLevel: 5 }],
      `${structure} should fall back to a Production Structure`,
    );
    assert.equal(milsovUpkeep(normaliseMilsovQuota([{ structure, sovLevel: 5, buildingLevel: 5 }])), 2400);
  }
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

  // The picker is the table minus the food two, derived rather than retyped.
  assert.deepEqual(
    SOV_QUOTA_STRUCTURES.map((s) => s.key),
    SOV_STRUCTURES.filter((s) => s.boosts !== 'food').map((s) => s.key),
  );
  assert.deepEqual(
    SOV_STRUCTURES.filter((s) => s.boosts === 'food').map((s) => s.name),
    ['Farmstead', 'Fishery'],
  );
});

test('a Resource Structure adds nothing to the hourly quota upkeep', () => {
  const resource = normaliseMilsovQuota(
    Array(4).fill({ structure: 'gravelPit', sovLevel: 5, buildingLevel: 5 }),
  );
  assert.equal(resource.length, 4, 'the rows are still four buildings');
  assert.equal(milsovUpkeep(resource), 0);
  assert.deepEqual(milsovStructureCounts(resource), { production: 0, resource: 4 });

  // The same four rows as military structures are the 2,400/hr each case.
  const production = normaliseMilsovQuota(
    Array(4).fill({ structure: 'targetRange', sovLevel: 5, buildingLevel: 5 }),
  );
  assert.equal(milsovUpkeep(production), 9600);
});

test('a mixed quota is billed for its Production Structures only', () => {
  const quota = normaliseMilsovQuota([
    { structure: 'trainingGround', sovLevel: 3, buildingLevel: 3 },  // 600
    { structure: 'loggingCamp', sovLevel: 5, buildingLevel: 5 },     // free
    { structure: 'assemblyYard', sovLevel: 2, buildingLevel: 2 },    // 300
    { structure: 'earthworks', sovLevel: 4, buildingLevel: 4 },      // free
  ]);
  assert.equal(quota.length, 4);
  assert.equal(milsovUpkeep(quota), 900);
  assert.deepEqual(milsovStructureCounts(quota), { production: 2, resource: 2 });
});

test('the read-out never quotes upkeep a Resource Structure does not pay', () => {
  const resource = normaliseMilsovQuota([{ structure: 'mineshaft', sovLevel: 5, buildingLevel: 5 }]);
  const text = milsovTotalText(resource);
  assert.match(text, /no hourly resource cost/);
  assert.ok(!/\/hr of each/.test(text), `the free case must quote no figure: ${text}`);
  assert.match(text, /1 Resource Structure costs only its claim/);

  const mixed = normaliseMilsovQuota([
    { structure: 'trainingGround', sovLevel: 5, buildingLevel: 5 },
    { structure: 'mineshaft', sovLevel: 5, buildingLevel: 5 },
    { structure: 'gravelPit', sovLevel: 3, buildingLevel: 3 },
  ]);
  assert.match(milsovTotalText(mixed), /^2,400\/hr of each of wood, clay, iron and stone\./);
  assert.match(milsovTotalText(mixed), /2 Resource Structures cost only their claims/);

  const production = normaliseMilsovQuota([{ structure: 'joustingYard', sovLevel: 4, buildingLevel: 4 }]);
  assert.equal(milsovTotalText(production), '1,200/hr of each of wood, clay, iron and stone.');
});

test('the structure picker offers both classes and no food structure', () => {
  const html = settingsFormHtml({
    ...DEFAULT_SETTINGS,
    milsovQuota: [{ structure: 'mineshaft', sovLevel: 5, buildingLevel: 5 }],
  });
  assert.ok(html.includes('data-milsov="structure"'), 'the row has no structure control');
  assert.ok(html.includes('<option value="mineshaft" selected>'), 'the chosen structure is not selected');
  for (const s of SOV_QUOTA_STRUCTURES) {
    assert.ok(html.includes(`value="${s.key}"`), `${s.key} is missing from the picker`);
  }
  assert.ok(html.includes('Mineshaft (iron)'), 'a resource structure should say what it raises');
  // Farmstead and Fishery are the food claim plan, not a quota row: offering
  // them here would let one tile be reserved and then claimed for its food.
  assert.ok(!/<option value="(farmstead|fishery)"/i.test(html),
    'food sovereignty must not be pickable as a milsov row');
});

test('the default quota is empty, which is what keeps T_res non-binding', () => {
  assert.deepEqual(normaliseMilsovQuota(DEFAULT_SETTINGS.milsovQuota), []);
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
  assert.deepEqual(plain, { observedPerHour: 15000, atTax: 25, plots: 5, booster: false });
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
  assert.deepEqual(cal, { observedRpPerHour: 800, atTax: 25 });
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
