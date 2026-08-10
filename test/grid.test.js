// The claim grid. planGridHtml is a string function like toCsv is, so the whole
// layout — which tile lands in which cell, and which way up — is testable here
// without a browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { planGridHtml, cellKey } from '../src/panel.js';

/** The grid's rows, each as the list of cell class attributes across it. */
function rows(html) {
  const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
  return body.split('<tr>').slice(1).map((row) =>
    [...row.matchAll(/<td class="([^"]*)"/g)].map((m) => m[1]));
}

/** The header labels across the top, and the row label down the left of each row. */
function xLabels(html) {
  const head = html.slice(html.indexOf('<thead>'), html.indexOf('</thead>'));
  return [...head.matchAll(/<th>([^<]*)<\/th>/g)].map((m) => m[1]).slice(1);
}

function yLabels(html) {
  const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
  return [...body.matchAll(/<tr><th>([^<]*)<\/th>/g)].map((m) => m[1]);
}

const EMPTY = { tiles: [], free: [], milsov: [] };

test('draws the whole square, town in the middle', () => {
  const html = planGridHtml(EMPTY, { radius: 2, x: 100, y: 200 });
  const grid = rows(html);
  assert.equal(grid.length, 5);
  for (const row of grid) assert.equal(row.length, 5);
  assert.match(grid[2][2], /sov-cell-town/);
  assert.match(html, /TOWN/);
});

test('y runs up the grid and x runs left to right', () => {
  const html = planGridHtml(EMPTY, { radius: 2, x: 100, y: 200 });
  assert.deepEqual(xLabels(html), ['98', '99', '100', '101', '102']);
  assert.deepEqual(yLabels(html), ['202', '201', '200', '199', '198']);
});

test('a food claim lands on its own tile, north of the town', () => {
  const html = planGridHtml({
    ...EMPTY,
    tiles: [{ dx: 0, dy: 1, food: 7, d: 1, rp: 50, level: 5 }],
  }, { radius: 1, x: 100, y: 200 });
  const grid = rows(html);
  // +1 in y is the row ABOVE the town, which is the top row at radius 1.
  assert.match(grid[0][1], /sov-cell-food/);
  assert.match(grid[1][1], /sov-cell-town/);
  assert.match(html, /<span class="sov-lv">V<\/span>/);
  assert.match(html, /title="100\|201 — Sov V food claim, food 7, distance 1.00, 50 RP"/);
});

test('a military claim overwrites the free tile it sits on', () => {
  const tile = { dx: -1, dy: -1, food: 3, d: Math.SQRT2 };
  const html = planGridHtml({
    tiles: [],
    free: [tile],
    milsov: [{
      ...tile, sovLevel: 5, buildingLevel: 5, structure: 'joustingYard', rp: 141, gold: 1410,
    }],
  }, { radius: 1, x: 100, y: 200 });
  const grid = rows(html);
  assert.match(grid[2][0], /sov-cell-mil/);
  assert.equal(/sov-cell-free/.test(html), false);
  assert.match(html, /L5/);
  assert.match(html, /Sov V claim carrying a level 5 Jousting Yard/);
  assert.match(html, /\/hr upkeep/);
});

test('claimable but unclaimed reads as free, and water says so', () => {
  const html = planGridHtml({
    ...EMPTY,
    free: [
      { dx: 1, dy: 0, food: 4, d: 1 },
      { dx: -1, dy: 0, food: 0, d: 1, water: true },
    ],
  }, { radius: 1, x: 100, y: 200 });
  const grid = rows(html);
  assert.match(grid[1][2], /sov-cell-free/);
  assert.match(grid[1][0], /sov-cell-water/);
  assert.match(html, /title="99\|200 — unclaimed water, food 0, distance 1.00"/);
});

test('a tile in no list at all is blank, not claimable', () => {
  const html = planGridHtml(EMPTY, { radius: 1, x: 100, y: 200 });
  const grid = rows(html);
  assert.match(grid[0][0], /sov-cell-none/);
  assert.match(html, /title="99\|201 — not claimable"/);
});

test('without coordinates the labels fall back to offsets', () => {
  const html = planGridHtml(EMPTY, { radius: 1 });
  assert.deepEqual(xLabels(html), ['-1', '+0', '+1']);
  assert.deepEqual(yLabels(html), ['+1', '+0', '-1']);
  assert.match(html, /title="\+1,\+1 — not claimable"/);
});

test('a crossed-out tile is crossed out even if the plan still claims it', () => {
  // The plan should never still hold a crossed tile — the caller re-plans without
  // it. Drawing the claim anyway is the failure this ordering exists to prevent.
  const html = planGridHtml({
    ...EMPTY,
    tiles: [{ dx: 1, dy: 0, food: 10, d: 1, rp: 50, level: 5 }],
  }, { radius: 1, x: 100, y: 200, excluded: new Set([cellKey(1, 0)]) });
  const grid = rows(html);
  assert.match(grid[1][2], /sov-cell-out/);
  assert.equal(/sov-cell-food/.test(html), false);
  assert.match(html, /title="101\|200 — crossed out"/);
});

test('pickable cells carry their offsets, the rest do not', () => {
  const html = planGridHtml({
    ...EMPTY,
    free: [{ dx: 1, dy: 0, food: 4, d: 1 }],
  }, { radius: 1, x: 100, y: 200, excluded: new Set([cellKey(0, 1)]), pickable: true });
  // The claimable tile and the crossed one both take a click; the town and the
  // tiles the game never offered do not.
  assert.match(html, /class="sov-cell sov-cell-free sov-pick" data-dx="1" data-dy="0"/);
  assert.match(html, /class="sov-cell sov-cell-out sov-pick" data-dx="0" data-dy="1"/);
  assert.equal((html.match(/sov-pick/g) ?? []).length, 2);
  assert.match(html, /Click a tile to cross it out/);
});

test('a grid nothing can be clicked on says nothing about clicking', () => {
  const html = planGridHtml({
    ...EMPTY,
    free: [{ dx: 1, dy: 0, food: 4, d: 1 }],
  }, { radius: 1, x: 100, y: 200 });
  assert.equal(/sov-pick|data-dx/.test(html), false);
  assert.equal(/Click a tile/.test(html), false);
});

test('without a radius the grid is sized to reach the furthest claim', () => {
  const html = planGridHtml({
    ...EMPTY,
    tiles: [{ dx: 2, dy: -1, food: 7, d: 2.24, rp: 112, level: 5 }],
  }, { x: 100, y: 200 });
  const grid = rows(html);
  assert.equal(grid.length, 5);
  assert.match(grid[3][4], /sov-cell-food/);
});
