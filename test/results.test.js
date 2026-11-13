// The results pane: the scan summary and the table of sites.

import test from 'node:test';
import assert from 'node:assert/strict';

import { resultsHtml, scanSummaryText } from '../src/ui/results.js';
import { bindingLabel } from '../src/ui/format.js';

// A region with no candidate site is where the summary matters most: it is
// unsettled ground, so it is the least explored.
test('the summary survives a scan that found no site', () => {
  const html = resultsHtml([], 'Centre -877|-2848, zoom 2, 25 tiles, 0 candidates.');
  assert.match(html, /Centre -877\|-2848/);
  assert.match(html, /No available sites met the minimum tax/);
});

test('the summary is shown above the table when there are results', () => {
  const html = resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'food', sFood: 10, uRp: 3, goldNet: 400,
  }], 'Centre 1|2.');
  assert.match(html, /Centre 1\|2\./);
  assert.ok(html.indexOf('Centre 1|2.') < html.indexOf('<table>'));
  assert.doesNotMatch(html, /No available sites met/);
});

test('the Food column is the food left over each hour', () => {
  const html = resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'food', sFood: 10, uRp: 3, goldNet: 400, surplus: { food: 1234.4 },
  }], 'Centre 1|2.');
  assert.ok(html.includes('<td>1,234</td>'));
});

// The map markers report on this line, so it starts empty. A scan that lists no
// site has no table and no markers, so it has no line either.
test('a table gets an empty map line between the summary and the rows', () => {
  const html = resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'food', sFood: 10, uRp: 3, goldNet: 400,
  }], 'Centre 1|2.');
  const line = html.indexOf('<p class="sov-legend sov-map-note"></p>');
  assert.ok(line > html.indexOf('Centre 1|2.') && line < html.indexOf('<table>'));
  assert.doesNotMatch(resultsHtml([], 'Centre 1|2.'), /sov-map-note/);
});

// Where the scan looked and what it found. Why the other tiles were dropped is
// deliberately not here: it is a question about the tool, not about the map.
test('the scan summary states the area covered and the count found', () => {
  assert.equal(
    scanSummaryText({ x: -877, y: -2848, zoom: 2, scanned: 25, candidates: 1 }),
    'Centred on -877|-2848, 5×5 tiles. Checked 25 tiles and found 1 candidate.',
  );
  assert.match(
    scanSummaryText({ x: 0, y: 0, zoom: 20, scanned: 1681, candidates: 0 }),
    /41×41 tiles\. Checked 1,681 tiles and found 0 candidates\./,
  );
});

test('the Max Tax cell names the ceiling rather than its code', () => {
  assert.equal(bindingLabel('rp'), 'Research');
  assert.equal(bindingLabel('res'), 'Resources');
  assert.equal(bindingLabel('cap'), 'Tax cap');
  // Unknown codes pass through: showing one raw beats showing nothing.
  assert.equal(bindingLabel('mystery'), 'mystery');

  const row = (over) => resultsHtml([{
    x: 1, y: 2, tMax: 62, binding: 'rp', sFood: 10, uRp: 3, goldNet: 400, ...over,
  }], 'Centre 1|2.');
  assert.match(row(), /alt="Research" title="Limited by research"/);
  // A resource ceiling names the resource that ran out, not the class of them.
  assert.match(row({ binding: 'res', resBinding: 'stone' }), /alt="Resources" title="Limited by stone"/);
  // The tax cap has no art, so it says so in a word.
  assert.match(row({ binding: 'cap' }), /title="Limited by tax cap">tax cap</);
});
