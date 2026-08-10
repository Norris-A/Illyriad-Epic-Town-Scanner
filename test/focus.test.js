// The Optimal Sovereignty calculator. The maths is scoring.js's and is tested
// there; what is tested here is everything the optimiser decides on the way in —
// which allocation, which radius, which tile — and its refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_FOCUS,
  FOCUS_DEFAULT_TAX,
  parseFocus,
  focusRadius,
  resolvePlots,
  focusSite,
} from '../src/focus.js';
import { DEFAULT_SETTINGS, PLOT_TOTAL } from '../src/constants.js';
import { tileKey } from '../src/payload.js';
import { scoreSite } from '../src/scoring.js';
import { focusFormHtml } from '../src/panel.js';

const settings = { ...DEFAULT_SETTINGS, tMin: -1000 };

/**
 * A payload covering radius `r` around 100|100, every tile claimable and rated
 * `rs`. The centre gets its own so the two allocations can be told apart.
 *
 * Tiles carry what the live game sends — `sov` and `hos` on plain land, and no
 * `set` field, which the game stopped sending. Keeping `set` here reported every
 * tile settleable whatever the code did with the fields it really receives.
 */
function payloadAround({ r = 3, rs = '5|5|5|5|5', centreRs = '4|4|4|4|9' } = {}) {
  const data = {};
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const centre = dx === 0 && dy === 0;
      data[tileKey(100 + dy, 100 + dx)] = {
        sov: 1,
        hos: 1,
        b: 5,
        l: 2,
        rs: centre ? centreRs : rs,
      };
    }
  }
  return { data, s: {}, t: {} };
}

const run = (over = {}, s = settings, payload = payloadAround()) =>
  focusSite({ payload, focus: { ...DEFAULT_FOCUS, x: 100, y: 100, ...over }, settings: s });

// --- the form's contract with createPanel ---

test('the markup carries every hook the optimiser reads back out of it', () => {
  // Same reason as the settings form's version: createPanel cannot run under
  // Node, so a typo'd selector on either side has to show up here rather than as
  // a null dereference in the game.
  const html = focusFormHtml(DEFAULT_FOCUS, settings);
  const hooks = [
    'class="sov-focus-form"', 'class="sov-focus-run"', 'sov-focus-use sec',
    'class="sov-focus-status"', 'class="sov-focus-out"',
    'data-focus="x"', 'data-focus="y"', 'data-focus="radius"', 'data-focus="tax"',
    'type="checkbox" data-focus="useConfiguredPlots"',
  ];
  for (const hook of hooks) assert.ok(html.includes(hook), `markup is missing ${hook}`);
  assert.ok(!/undefined|null|\[object Object\]/.test(html), 'a field rendered a stray value');
});

test('the radius placeholder quotes the configured R_claim', () => {
  assert.match(focusFormHtml(DEFAULT_FOCUS, { ...settings, rClaim: 5 }), /placeholder="5"/);
});

// --- reading the four inputs ---

test('the tax starts at 60% and the radius follows the configuration', () => {
  assert.equal(DEFAULT_FOCUS.tax, FOCUS_DEFAULT_TAX);
  assert.equal(FOCUS_DEFAULT_TAX, 60);

  const { focus, errors } = parseFocus({ x: '12', y: '-7' });
  assert.deepEqual(errors, []);
  assert.equal(focus.x, 12);
  assert.equal(focus.y, -7);
  assert.equal(focus.tax, 60);
  // Blank is "follow R_claim", which is not the same as 0 and not resolved here.
  assert.equal(focus.radius, null);
  assert.equal(focusRadius(focus, { rClaim: 4 }), 4);
});

test('a radius typed in overrides the configuration for that run only', () => {
  const { focus } = parseFocus({ x: 1, y: 1, radius: '5' });
  assert.equal(focus.radius, 5);
  assert.equal(focusRadius(focus, { rClaim: 2 }), 5);
  // The claim radius the engine supports is 1..6, as in the settings field.
  assert.equal(parseFocus({ x: 1, y: 1, radius: '99' }).focus.radius, 6);
  assert.equal(parseFocus({ x: 1, y: 1, radius: '0' }).focus.radius, 1);
});

test('coordinates are the only input that can fail', () => {
  assert.equal(parseFocus({ y: 5 }).errors.length, 1);
  assert.equal(parseFocus({ x: '', y: '' }).errors.length, 1);
  assert.deepEqual(parseFocus({ x: 0, y: 0 }).errors, [], '0|0 is a real tile');
});

// --- which allocation the centre tile is planned on ---

test("by default the centre tile is planned on its own ratings, not the config's", () => {
  const r = run();
  assert.equal(r.ok, true);
  assert.equal(r.plotSource, 'tile');
  assert.deepEqual(r.plots, { wood: 4, clay: 4, iron: 4, stone: 4, food: 9 });
  assert.notDeepEqual(r.plots, settings.plots);
});

test('the override plans the same tile on the City Configuration allocation', () => {
  const r = run({ useConfiguredPlots: true });
  assert.equal(r.plotSource, 'config');
  assert.deepEqual(r.plots, settings.plots);

  // 9 food plots against the configured 7 is a materially better tile, so the
  // override has to move the answer — otherwise it is not being applied.
  assert.ok(r.base.tMax < run().base.tMax, 'the allocation must change the ceiling');
});

test('ratings that are not a 25-plot allocation fall back rather than mislead', () => {
  // Water and other unsettleable terrain carry ratings that do not add to 25;
  // planning a city on those would report a tax no city could run.
  const water = payloadAround({ centreRs: '0|0|0|0|0' });
  const r = run({}, settings, water);
  assert.equal(r.plotSource, 'fallback');
  assert.deepEqual(r.plots, settings.plots);
  assert.match(r.plotNote, new RegExp(String(PLOT_TOTAL)));
});

// --- the refusals ---

test('a tile outside the last payload is named, not silently skipped', () => {
  const r = focusSite({
    payload: payloadAround(),
    focus: { ...DEFAULT_FOCUS, x: 500, y: 500 },
    settings,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'centre-missing');
  assert.match(r.message, /500\|500/);
});

test('a radius reaching past the payload refuses, and says by how much', () => {
  // The scan's rule — never score on partial data — with the count the user
  // needs in order to know how far to pan.
  const r = run({ radius: 4 }, settings, payloadAround({ r: 3 }));
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'incomplete');
  assert.equal(r.ring, 80);
  assert.equal(r.missing, 80 - 48);
  assert.match(r.message, /radius 4/);
});

test('no payload at all is a distinct answer from a missing tile', () => {
  const r = focusSite({ payload: null, focus: { ...DEFAULT_FOCUS, x: 1, y: 1 }, settings });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'no-payload');
});

// --- the answer itself ---

test('the optimiser is the scan engine, not a second model of it', () => {
  const r = run({ useConfiguredPlots: true });
  const direct = scoreSite({
    neighbours: r.ctx.byDistance.map(({ dx, dy, food, key, i }) => ({ dx, dy, food, key, i })),
    settings: { ...settings, plots: settings.plots, rClaim: r.radius },
  });
  assert.equal(r.base.tMax, direct.tMax);
  assert.equal(r.base.sFood, direct.sFood);
});

test('a tax the tile cannot hold is reported, not refused', () => {
  // "Can this tile hold 60%?" is the question being asked. "No, it holds 44.2%"
  // is the answer to it; an error is not.
  const poor = payloadAround({ rs: '5|5|5|5|0', centreRs: '5|5|5|5|5' });
  const r = run({ tax: 100 }, settings, poor);
  assert.equal(r.ok, true);
  assert.equal(r.aboveCeiling, true);
  assert.equal(r.requestedTax, 100);
  assert.equal(r.tax, r.ceiling);
  assert.equal(r.plan.tax, r.base.tMax);
});

test('a tax the tile can hold is planned at that tax, below its ceiling', () => {
  const r = run({ tax: 20 });
  assert.equal(r.aboveCeiling, false);
  assert.equal(r.tax, 20);
  assert.equal(r.plan.tax, 20);
  assert.ok(r.plan.tax < r.base.tMax, 'the fixture must have headroom for this to mean anything');
});

test('the requested tax is clamped up to the floor T_min sets', () => {
  const r = run({ tax: -500 }, { ...settings, tMin: 30 });
  assert.equal(r.floor, 30);
  assert.equal(r.tax, 30);
});

test('plain land off the live map is settleable', () => {
  // The whole fixture is this shape, so this pins what the rest of the file is
  // planning on. Reading `set` raw calls a perfectly good tile unsettleable.
  const r = run();
  assert.equal(r.ok, true);
  assert.equal(r.centre.settleable, true);
});

test('the candidacy filters do not apply — an owned, settled tile still plans', () => {
  const payload = payloadAround();
  // A town tile as the live payload sends one: `hos`, and no `sov`.
  delete payload.data[tileKey(100, 100)].sov;
  payload.s = { [tileKey(100, 100)]: { rd: 'Yours' } };
  payload.t = { [tileKey(100, 100)]: 'Town|1|100|100|500|9' };

  const r = run({}, settings, payload);
  assert.equal(r.ok, true, 'the scan would have excluded this tile; the optimiser must not');
  assert.equal(r.centre.settleable, false);
  assert.equal(r.centre.isTown, true);
  assert.equal(r.centre.claimedBy, 'Yours');
});

test('a payload that still carries set is answered by it, either way', () => {
  // Older payloads state it outright, and that outranks the terrain the rest of
  // these tests infer from, including where the two disagree.
  const yes = payloadAround();
  delete yes.data[tileKey(100, 100)].sov;
  yes.data[tileKey(100, 100)].set = 1;
  assert.equal(run({}, settings, yes).centre.settleable, true);

  const no = payloadAround();
  no.data[tileKey(100, 100)].set = 0;
  assert.equal(run({}, settings, no).centre.settleable, false);
});

test('the neighbourhood still respects claimability', () => {
  const payload = payloadAround();
  // Four tiles taken by someone else are four tiles the plan cannot use.
  for (const k of [tileKey(100, 101), tileKey(100, 99), tileKey(101, 100), tileKey(99, 100)]) {
    payload.s[k] = { rd: 'Enemy' };
  }
  const r = run({ radius: 1 }, settings, payload);
  assert.equal(r.ring, 8);
  assert.equal(r.claimable, 4);
});

test('claimable water is planned for food but never for a structure', () => {
  // Tiles as the game sends them, not as the engine's other tests fake them:
  // a ring of claimable water rated on food alone, one land corner, and one
  // `brg` tile carrying no `sov`. The water outrates the land on food, so a
  // pass that took the flag for "worthless" would still satisfy the milsov
  // assertion below while quietly throwing the food plan away.
  const payload = { data: {}, s: {}, t: {} };
  const land = (rs) => ({ sov: 1, hos: 1, b: 4, l: 1, rs });
  const water = { sov: 1, b: 20, l: 0, rs: '0|0|0|0|10' };
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      payload.data[tileKey(100 + dy, 100 + dx)] = { ...water };
    }
  }
  payload.data[tileKey(100, 100)] = land('4|4|4|4|9');
  payload.data[tileKey(98, 98)] = land('5|5|5|5|5');
  payload.data[tileKey(102, 102)] = { b: 20, l: 0, brg: 1, rs: '0|0|0|0|0' };

  const r = focusSite({
    payload,
    focus: { ...DEFAULT_FOCUS, x: 100, y: 100, radius: 2, tax: 0 },
    settings: { ...DEFAULT_SETTINGS, tMin: -1000, milsovStructure: 'joustingYard' },
  });

  assert.equal(r.ok, true);
  assert.equal(r.claimable, 23, 'only the dead water tile is unclaimable');
  assert.ok(r.base.tiles.some((t) => t.water), 'water is the best food here and was skipped');
  for (const m of [...r.base.milsov, ...r.plan.milsov]) {
    assert.equal(m.water, false, `a Jousting Yard was placed on water at ${m.key}`);
  }
});
