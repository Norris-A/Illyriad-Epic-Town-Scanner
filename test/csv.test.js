// CSV export. panel.js only touches the DOM inside createPanel, so the
// exporter is importable here without a browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  toCsv, csvFile, csvFilename, csvField, CSV_BOM, resFlag, milsovPlanText,
} from '../src/panel.js';

const COLUMNS = 21;

// The no-military shape: T_res is Infinity and carries no flag, which is what
// scoreSite returns for the common case. The tax is the whole number the plan is
// made at; the ceiling it was floored from travels beside it.
const row = (over = {}) => ({
  x: 360, y: -3178, tMax: 56, tMaxExact: 56.6, binding: 'food', sFood: 100,
  uRp: 1000, uGold: 10000, goldNet: 62901,
  milsov: [], milsovBonus: 0, milsovUpkeep: 0, milsovRp: 0, milsovGold: 0, milsovPrice: 0,
  milsovMinTax: null, milsovMinBonusAt: null,
  resCeiling: Infinity, resIndicative: false, resBinding: null, resImpossible: false,
  ...over,
});

/** The rows of an export, BOM and line terminators stripped. */
const lines = (csv) => csv.replace(CSV_BOM, '').split('\r\n');

/** A plan with military sovereignty on it, as scoreSite returns one. */
const withMil = (over = {}) => row({
  milsov: [
    { buildingLevel: 3, sovLevel: 3 },
    { buildingLevel: 1, sovLevel: 1 },
    { buildingLevel: 1, sovLevel: 1 },
  ],
  milsovBonus: 25, milsovUpkeep: 900, milsovRp: 120.4, milsovGold: 1204, milsovPrice: 5,
  ...over,
});

const cells = (line) => line.match(/(^|,)("([^"]|"")*"|[^,]*)/g);

test('fields are quoted only when they need it (RFC 4180)', () => {
  assert.equal(csvField('food'), 'food');
  assert.equal(csvField(56.6), '56.6');
  assert.equal(csvField(null), '');
  assert.equal(csvField('a, b'), '"a, b"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField('two\nlines'), '"two\nlines"');
});

test('a food-only row keeps its columns unquoted and trailing-empty', () => {
  const [head, line] = lines(toCsv([row()]));
  assert.equal(head.split(',').length, COLUMNS);
  assert.equal(head.split(',').at(-1), 'milsov_plan');
  assert.equal(line, '360,-3178,56,56.60,food,100,1000,10000,62901,0,0,0,0,0,0,,,,,,');
});

test('the military plan survives export with its commas intact', () => {
  const line = lines(toCsv([withMil()]))[1];
  const plan = milsovPlanText(withMil());
  assert.ok(plan.includes(','), 'precondition: the plan text carries a comma');
  assert.ok(line.endsWith(`,"${plan}"`), 'the plan must be quoted, not split');
  // Column count is what a naive join would have broken.
  assert.equal(cells(line).length, COLUMNS);
});

test('what the engine chose is auditable from the export', () => {
  const [head, line] = lines(toCsv([withMil({ milsovMinTax: 42, milsovMinBonusAt: 30 })]));
  const col = (name) => line.split(',')[head.split(',').indexOf(name)];
  assert.equal(col('T_max'), '56', 'the rate to type into the game');
  assert.equal(col('T_max_exact'), '56.60', 'and the ceiling it was floored from');
  assert.equal(col('milsov_buildings'), '3');
  assert.equal(col('milsov_bonus'), '25');
  assert.equal(col('milsov_upkeep'), '900');
  assert.equal(col('milsov_RP'), '120');
  assert.equal(col('milsov_gold'), '1204');
  assert.equal(col('milsov_price'), '5');
  assert.equal(col('milsov_min_tax'), '42');
  assert.equal(col('milsov_min_bonus'), '30');
});

test('a result from before these fields existed still exports as zero or blank', () => {
  const csv = lines(toCsv([{ ...row(), tMaxExact: undefined, milsov: undefined,
    milsovBonus: undefined, milsovUpkeep: undefined, milsovRp: undefined,
    milsovGold: undefined, milsovPrice: undefined, milsovMinTax: undefined,
    milsovMinBonusAt: undefined }]));
  assert.equal(csv[1], '360,-3178,56,,food,100,1000,10000,62901,0,0,0,0,0,0,,,,,,');
});

// --- the file a spreadsheet actually opens -----------------------------------

test('the file leads with a BOM and separates records with CRLF', () => {
  // Without the BOM, Excel reads the em dash in the plan column as mojibake;
  // without CRLF it reads the whole export as one row.
  const file = csvFile([withMil(), row()]);
  assert.ok(file.startsWith(CSV_BOM), 'no BOM — Excel will not read this as UTF-8');
  assert.ok(file.includes('—'), 'precondition: the export carries a non-ASCII character');
  assert.equal(file.slice(CSV_BOM.length), toCsv([withMil(), row()]));
  assert.equal(file.split('\r\n').length, 3, 'header and two rows');
  assert.ok(!/[^\r]\n/.test(file), 'a bare LF is not a record separator');
});

test('the filename sorts chronologically and does not collide', () => {
  assert.equal(csvFilename(new Date(2026, 7, 8, 20, 43)), 'sov-sites-20260808-2043.csv');
  assert.equal(csvFilename(new Date(2026, 0, 1, 9, 5)), 'sov-sites-20260101-0905.csv');
});

test('the plan text reads as a level split, not as a tile list', () => {
  assert.equal(
    milsovPlanText(withMil()),
    '1x Sov III + 2x Sov I — +25% military unit production, upkeep 900/hr of wood, clay, iron and stone.',
  );
  assert.equal(milsovPlanText(row()), '', 'nothing placed, nothing to say');
});

// --- the resource ceiling travels with the row ------------------------------

const resCells = (r) => {
  const head = lines(toCsv([r]))[0].split(',');
  const line = lines(toCsv([r]))[1].split(',');
  return Object.fromEntries(['T_res', 'res_binding', 'res_status'].map(
    (k) => [k, line[head.indexOf(k)]]));
};

test('an indicative ceiling exports its figure, its resource and its status', () => {
  assert.deepEqual(
    resCells(row({ resCeiling: 5.83416, resIndicative: true, resBinding: 'stone' })),
    { T_res: '5.83', res_binding: 'stone', res_status: 'indicative' },
  );
});

test('a zero-plot resource exports as impossible, not as a numeric sentinel', () => {
  // -Infinity in a numeric column is what a spreadsheet cannot do anything with,
  // and it is the value that used to delete the site outright.
  const r = row({
    resCeiling: -Infinity, resIndicative: true, resBinding: 'stone', resImpossible: true,
  });
  assert.deepEqual(resCells(r), { T_res: '', res_binding: 'stone', res_status: 'impossible' });
  assert.ok(!toCsv([r]).includes('Infinity'));
  assert.equal(cells(lines(toCsv([r]))[1]).length, COLUMNS);
});

test('no military sovereignty exports three blanks, not a ceiling of Infinity', () => {
  assert.deepEqual(resCells(row()), { T_res: '', res_binding: '', res_status: '' });
});

// --- the row flag -----------------------------------------------------------

test('a ceiling above the tax the site reaches says nothing', () => {
  assert.equal(resFlag(row()), null, 'no structure asked for, no flag');
  assert.equal(
    resFlag(row({ resCeiling: 90, resIndicative: true, resBinding: 'stone' })),
    null,
    'the upkeep is already covered at 56.6% tax',
  );
});

test('a binding indicative ceiling flags the row it did not rank', () => {
  const flag = resFlag(row({ resCeiling: 5.83416, resIndicative: true, resBinding: 'stone' }));
  assert.equal(flag.text, 'stone 5.8%');
  assert.match(flag.title, /stone/);
  assert.match(flag.title, /does not affect the ranking/);
});

test('an impossible ceiling names the missing resource rather than showing -Infinity', () => {
  const flag = resFlag(row({
    resCeiling: -Infinity, resIndicative: true, resBinding: 'stone', resImpossible: true,
  }));
  assert.equal(flag.text, 'no stone');
  assert.ok(!flag.title.includes('Infinity'));
  assert.match(flag.title, /any tax rate/);
});
