// CSV export (PRD §5). panel.js only touches the DOM inside createPanel, so the
// exporter is importable here without a browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toCsv, csvField } from '../src/panel.js';

const row = (over = {}) => ({
  x: 360, y: -3178, tMax: 56.6, binding: 'food', sFood: 100,
  uRp: 1000, uGold: 10000, goldNet: 62901, quotaMet: true, milsovNote: null,
  ...over,
});

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
  assert.equal(head.split(',').length, 10);
  assert.equal(head.split(',').at(-1), 'milsov_advisory');
  assert.equal(line, '360,-3178,56.60,food,100,1000,10000,62901,true,');
});

test('the advisory note survives export with its comma intact', () => {
  // The real §3.6 wording — the upkeep clause is what puts a comma in it.
  const note = '2x Sov III would cost less research than your 3x Sov II and give '
    + 'the same total bonus, at higher structure upkeep.';
  const line = toCsv([row({ milsovNote: note })]).split('\n')[1];
  assert.ok(line.endsWith(`,"${note}"`), 'the note must be quoted, not split');
  // Column count is what a naive join would have broken.
  assert.equal(line.match(/(^|,)("([^"]|"")*"|[^,]*)/g).length, 10);
});
