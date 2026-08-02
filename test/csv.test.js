// CSV export (PRD §5). panel.js only touches the DOM inside createPanel, so the
// exporter is importable here without a browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toCsv, csvField, resFlag } from '../src/panel.js';

const COLUMNS = 14;

// The no-milsov shape: T_res is Infinity and carries no flag, which is what
// scoreSite returns for the common case.
const row = (over = {}) => ({
  x: 360, y: -3178, tMax: 56.6, binding: 'food', sFood: 100,
  uRp: 1000, uGold: 10000, goldNet: 62901, quotaMet: true, milsovNote: null,
  resCeiling: Infinity, resIndicative: false, resBinding: null, resImpossible: false,
  milsovTraded: false,
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

test('a row without an advisory keeps its columns unquoted and trailing-empty', () => {
  const [head, line] = toCsv([row()]).split('\n');
  assert.equal(head.split(',').length, COLUMNS);
  assert.equal(head.split(',').at(-1), 'milsov_advisory');
  assert.equal(line, '360,-3178,56.60,food,100,1000,10000,62901,true,false,,,,');
});

test('the advisory note survives export with its comma intact', () => {
  // The real §3.6 wording — the upkeep clause is what puts a comma in it.
  const note = '2x Sov III would cost less research than your 3x Sov II and give '
    + 'the same total bonus, at higher structure upkeep.';
  const line = toCsv([row({ milsovNote: note })]).split('\n')[1];
  assert.ok(line.endsWith(`,"${note}"`), 'the note must be quoted, not split');
  // Column count is what a naive join would have broken.
  assert.equal(cells(line).length, COLUMNS);
});

test('a traded milsov hosting is auditable from the export', () => {
  const col = (r) => {
    const csv = toCsv([r]).split('\n');
    return csv[1].split(',')[csv[0].split(',').indexOf('milsov_traded')];
  };
  assert.equal(col(row({ milsovTraded: true })), 'true');
  assert.equal(col(row()), 'false');
  // A result from before the field existed must not export as blank.
  assert.equal(col(row({ milsovTraded: undefined })), 'false');
});

// --- the resource ceiling travels with the row ------------------------------

const resCells = (r) => {
  const head = toCsv([r]).split('\n')[0].split(',');
  const line = toCsv([r]).split('\n')[1].split(',');
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
  assert.equal(cells(toCsv([r]).split('\n')[1]).length, COLUMNS);
});

test('no milsov quota exports three blanks, not a ceiling of Infinity', () => {
  assert.deepEqual(resCells(row()), { T_res: '', res_binding: '', res_status: '' });
});

// --- the row flag -----------------------------------------------------------

test('a ceiling above the tax the site reaches says nothing', () => {
  assert.equal(resFlag(row()), null, 'no quota, no flag');
  assert.equal(
    resFlag(row({ resCeiling: 90, resIndicative: true, resBinding: 'stone' })),
    null,
    'the upkeep is already covered at 56.6% tax',
  );
});

test('a binding indicative ceiling flags the row it did not rank', () => {
  const flag = resFlag(row({ resCeiling: 5.83416, resIndicative: true, resBinding: 'stone' }));
  assert.equal(flag.text, 'res 5.8%');
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
