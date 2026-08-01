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
  parseRpCalibration,
  settingsFormHtml,
} from '../src/panel.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';
import { computeK, computeRRef } from '../src/scoring.js';

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
  const html = settingsFormHtml({ ...DEFAULT_SETTINGS, milsovQuota: [{ level: 3, count: 2 }] });
  const hooks = [
    'class="sov-form"',
    'class="sov-plot-total"', 'sov-prefill sec', 'sov-prefill-src',
    'sov-milsov-rows', 'sov-milsov-empty', 'sov-milsov-add', 'sov-milsov-del', 'sov-milsov-row',
    'class="sov-reset sec"', 'class="sov-derived"', 'sov-derived-food',
    'data-cal="observedRpPerHour"', 'data-cal="atTax"',
    'data-milsov="level"', 'data-milsov="count"',
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
    } else if (!['plots', 'milsov', 'calibration'].includes(f.type)) {
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

test('quota rows become level/count pairs, merged and level-descending', () => {
  assert.deepEqual(
    normaliseMilsovQuota([{ level: 3, count: 1 }, { level: 5, count: 1 }, { level: 3, count: 1 }]),
    [{ level: 5, count: 1 }, { level: 3, count: 2 }],
  );
});

test('empty rows are dropped and levels clamped to 1..5', () => {
  assert.deepEqual(normaliseMilsovQuota([]), []);
  assert.deepEqual(normaliseMilsovQuota(undefined), []);
  assert.deepEqual(normaliseMilsovQuota([{ level: 5, count: 0 }, { level: '', count: 2 }]), []);
  assert.deepEqual(normaliseMilsovQuota([{ level: 9, count: '2' }]), [{ level: 5, count: 2 }]);
});

test('the default quota is empty, which is what keeps T_res non-binding', () => {
  assert.deepEqual(normaliseMilsovQuota(DEFAULT_SETTINGS.milsovQuota), []);
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
