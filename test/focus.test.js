// The Optimal Sovereignty calculator. The maths is scoring.js's and is tested
// there; what is tested here is everything the optimiser decides on the way in —
// which allocation, which radius, which tile — and its refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_FOCUS,
  FOCUS_DEFAULT_TAX,
  FOCUS_TAX_FLOOR,
  parseFocus,
  focusRadius,
  resolvePlots,
  focusSite,
  claimLevel,
  keptClaims,
} from '../src/focus.js';
import { DEFAULT_SETTINGS, PLOT_TOTAL } from '../src/constants.js';
import {
  tileKey, indexPayload, townString, townRecord, neighbourhood, inWorld, isWaterTile,
} from '../src/payload.js';
import { scoreSite, claimUpkeep, distance } from '../src/scoring.js';
import { focusFormHtml, ownTowns } from '../src/panel.js';

const settings = { ...DEFAULT_SETTINGS, tMin: -1000 };

const close = (a, b, eps = 0.05) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

/**
 * A payload covering radius `r` around `cx`|`cy`, every tile claimable and rated
 * `rs`. The centre gets its own so the two allocations can be told apart.
 *
 * Tiles carry what the live game sends — `sov` and `hos` on plain land, and no
 * `set` field, which the game stopped sending. Keeping `set` here reported every
 * tile settleable whatever the code did with the fields it really receives.
 */
function payloadAround({
  r = 3, rs = '5|5|5|5|5', centreRs = '4|4|4|4|9', cx = 100, cy = 100,
} = {}) {
  const data = {};
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      // Off-world tiles are left out, because the game has none to send.
      if (!inWorld(cx + dx, cy + dy)) continue;
      const centre = dx === 0 && dy === 0;
      data[tileKey(cy + dy, cx + dx)] = {
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
    'class="sov-focus-form"', 'class="sov-focus-run"', 'class="sov-town-pick"',
    'class="sov-focus-status"', 'class="sov-focus-out"',
    'data-focus="x"', 'data-focus="y"', 'data-focus="radius"', 'data-focus="tax"',
    'type="checkbox" data-focus="useConfiguredPlots"',
    'type="checkbox" data-focus="preserveSovereignty"',
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

test('by default the centre tile is planned on the configured allocation', () => {
  const r = run();
  assert.equal(r.ok, true);
  assert.equal(r.plotSource, 'config');
  assert.deepEqual(r.plots, settings.plots);
});

test("turning it off plans the same tile on its own ratings", () => {
  const own = run({ useConfiguredPlots: false });
  assert.equal(own.plotSource, 'tile');
  assert.deepEqual(own.plots, { wood: 4, clay: 4, iron: 4, stone: 4, food: 9 });
  assert.notDeepEqual(own.plots, settings.plots);

  // 9 food plots against the configured 7 is a materially better tile, so the
  // two must not agree — otherwise the setting is not being applied.
  assert.ok(run().base.tMax < own.base.tMax, 'the allocation must change the ceiling');
});

test('ratings that are not a 25-plot allocation fall back rather than mislead', () => {
  // Water and other unsettleable terrain carry ratings that do not add to 25;
  // planning a city on those would report a tax no city could run.
  const water = payloadAround({ centreRs: '0|0|0|0|0' });
  const r = run({ useConfiguredPlots: false }, settings, water);
  assert.equal(r.plotSource, 'fallback');
  assert.deepEqual(r.plots, settings.plots);
  assert.match(r.plotNote, new RegExp(String(PLOT_TOTAL)));
});

// --- sovereignty the city already holds -------------------------------------

/** The same payload, with `n` of the nearest ring already claimed by you. */
function withOwnClaims(n = 3, level = 3) {
  const payload = payloadAround();
  const ring = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]].slice(0, n);
  payload.s = {};
  for (const [dx, dy] of ring) {
    payload.s[tileKey(100 + dy, 100 + dx)] = { rd: 'Yours', s: `${level}|?`, b: 'Unknown' };
  }
  return payload;
}

test("a claim's level comes out of the s block, and a bad one is refused", () => {
  assert.equal(claimLevel({ s: '3|?' }), 3);
  assert.equal(claimLevel({ s: '5' }), 5);
  // Charging a claim the wrong level is worse than not charging it at all.
  for (const bad of [{ s: '?|?' }, { s: '' }, { s: '0|?' }, { s: '9|?' }, {}, null]) {
    assert.equal(claimLevel(bad), null, JSON.stringify(bad));
  }
});

test('only your own claims inside the radius are kept, and only readable ones', () => {
  const payload = withOwnClaims(3);
  // An alliance claim and one with an unreadable level, both of which must not
  // be billed to you.
  payload.s[tileKey(102, 100)] = { rd: 'Alliance', s: '5|?' };
  payload.s[tileKey(100, 102)] = { rd: 'Yours', s: '?|?' };
  const kept = keptClaims({
    payload, centre: { x: 100, y: 100 }, radius: 2, idx: indexPayload(payload), chancery: false,
  });
  assert.equal(kept.claims.length, 3, 'the alliance claim is not yours to keep');
  assert.equal(kept.unknownLevel, 1);
  // Level and distance are the whole of the bill, and both are known.
  const expected = [[1, 0], [0, 1], [-1, 0]]
    .reduce((sum, [dx, dy]) => sum + claimUpkeep(distance(dx, dy), 3, false).rp, 0);
  close(kept.rp, expected, 1e-9);
});

test('preserving charges the research and gold the kept claims already cost', () => {
  const payload = withOwnClaims(3);
  const free = run({ preserveSovereignty: false }, settings, payload);
  const held = run({ preserveSovereignty: true }, settings, payload);

  assert.ok(held.kept.claims.length === 3 && held.kept.rp > 0, 'precondition: something is kept');
  // Research already spent is research the plan may not spend, so the ceiling
  // has to come down — and by no more than the claims actually cost.
  assert.ok(held.base.tMax < free.base.tMax, 'kept claims must cost the site tax');

  // The gold bill is exact: the plan's own claims at 10:1, plus the kept ones.
  // goldNet moves by more than that, because a plan with less research to spend
  // also claims differently and holds a different tax — so the bill is what is
  // pinned here, and the direction is all that is asserted of the net.
  close(held.base.uGold, (held.base.uRp + held.kept.rp) * 10, 1e-6);
  close(free.base.uGold, free.base.uRp * 10, 1e-6);
  assert.ok(held.base.goldNet < free.base.goldNet, 'and must cost it gold');
});

// Keeping a claim and treating it as free ground are opposite instructions.
test('preserving overrides "treat your own claims as available"', () => {
  const payload = withOwnClaims(3);
  const s = { ...settings, ownClaimsAvailable: true };
  const held = run({ preserveSovereignty: true }, s, payload);
  assert.equal(held.settings.ownClaimsAvailable, false);
  // The kept tiles are not offered to the planner as ground it can take.
  for (const k of held.kept.claims) {
    assert.ok(
      !held.neighbours.some((n) => n.dx === k.dx && n.dy === k.dy),
      `${k.dx},${k.dy} is both kept and claimable`,
    );
  }
});

test('nothing is kept when the setting is off, whatever the map holds', () => {
  const r = run({ preserveSovereignty: false }, settings, withOwnClaims(3));
  assert.deepEqual(r.kept, { claims: [], rp: 0, unknownLevel: 0 });
});

// --- picking one of your own towns ------------------------------------------

// A town is only offered where the payload carries its tile as well as its `t`
// entry, so a fixture has to supply both.
const tiles = (...at) => Object.fromEntries(at.map(([y, x]) => [tileKey(y, x), { sov: 1 }]));

test('the picker lists your own towns, named, and no one else’s', () => {
  const payload = {
    data: tiles([-3178, 360], [-3000, 100], [-3100, 200], [-3200, 400]),
    s: {},
    t: {
      [tileKey(-3178, 360)]: { s: 'Rivermeet|1|360|-3178|900|7', rd: 'Yours' },
      [tileKey(-3000, 100)]: { s: 'Ashford|2|100|-3000|400|7', rd: 'Yours' },
      [tileKey(-3100, 200)]: { s: 'Fort Grey|3|200|-3100|500|9', rd: 'Alliance' },
      [tileKey(-3200, 400)]: { s: 'Redhold|4|400|-3200|100|11' },
    },
  };
  assert.deepEqual(ownTowns(payload), [
    { x: 100, y: -3000, label: 'Ashford (100|-3000)' },
    { x: 360, y: -3178, label: 'Rivermeet (360|-3178)' },
  ], 'sorted by name, and only the ones that are yours');
});

// The `t` block is keyed off claiming towns rather than the viewport, so the
// same town can arrive under more than one key.
test('a town listed twice is offered once', () => {
  const town = { s: 'Rivermeet|1|360|-3178|900|7', rd: 'Yours' };
  const payload = {
    data: tiles([-3178, 360]), s: {}, t: { 'a|b': town, [tileKey(-3178, 360)]: town },
  };
  assert.equal(ownTowns(payload).length, 1);
});

test('a town whose string is not the pipe format is offered by position', () => {
  const payload = {
    data: tiles([-3178, 360]), s: {}, t: { [tileKey(-3178, 360)]: { s: '', rd: 'Yours' } },
  };
  assert.deepEqual(ownTowns(payload), [{ x: 360, y: -3178, label: '360|-3178' }]);
});

// The `t` block reaches past the tiles the payload carries, so a town can be
// named by it long after its ground has been panned away. Offering one leads
// straight to the optimiser refusing the centre it was just handed.
test('a town the payload has no tile for is not offered', () => {
  const t = { [tileKey(-3178, 360)]: { s: 'Rivermeet|1|360|-3178|900|7', rd: 'Yours' } };
  assert.deepEqual(ownTowns({ data: {}, s: {}, t }), []);
  assert.equal(ownTowns({ data: tiles([-3178, 360]), s: {}, t }).length, 1);
});

test('no payload and no towns are both an empty list, not a throw', () => {
  assert.deepEqual(ownTowns({ data: {}, s: {}, t: {} }), []);
  assert.deepEqual(ownTowns({}), []);
});

// Which property carries the string is undocumented, so it is found by shape.
// A miss is silent — position still resolves off the tile key — and shows only
// as a town listed under bare coordinates.
test('the town name is found whatever property carries the pipe string', () => {
  const pipe = 'Rivermeet|1|360|-3178|900|7|human|?|75|?|Norris|ILL|?|N-human-|?';
  for (const field of ['s', 'n', 'v', 'ts', 'whatever']) {
    const payload = {
      data: tiles([-3178, 360]), s: {}, t: { [tileKey(-3178, 360)]: { [field]: pipe, rd: 'Yours' } },
    };
    assert.deepEqual(ownTowns(payload), [
      { x: 360, y: -3178, label: 'Rivermeet (360|-3178)' },
    ], `the string was not found under ${field}`);
  }
  // A bare string, and an entry with nothing shaped like one, still work.
  assert.equal(townString(pipe), pipe);
  assert.equal(townString({ rd: 'Yours', s: '3|?', b: 'Unknown' }), '', 'a claim level is not a town');
  assert.equal(townString({}), '');
});

// The shape the live client sends: a record nested on the entry, not a string.
test('a town record is read for its name and position, whatever carries it', () => {
  const rec = {
    TownName: 'Eruyt', TownId: 602050, X: '360', Y: '-3178', Population: '6720', Cap: 1,
  };
  const payload = {
    data: tiles([-3178, 360]), s: {}, t: { [tileKey(-3178, 360)]: { t: rec, rd: 'Yours', v: 9 } },
  };
  assert.deepEqual(ownTowns(payload), [{ x: 360, y: -3178, label: 'Eruyt (360|-3178)' }]);

  assert.equal(townRecord({ t: rec }), rec, 'a nested record was not found');
  assert.equal(townRecord(rec), rec, 'a bare record was not found');
  assert.equal(townRecord({ rd: 'Yours', v: 9 }), null);
  assert.equal(townRecord({ t: { TownName: 'Eruyt', X: '', Y: '' } }), null,
    'a record without a position is not a position');
  assert.equal(townString(null), '');
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

test('a site no settable tax holds is planned at 0%, not at a negative rate', () => {
  // The game's tax field runs 0 to 100, so a ceiling below 0 is not a rate to
  // plan at. The answer is still the arithmetic — at 0%, where production is at
  // its maximum — with the food it is short by on the balance.
  const barren = payloadAround({ rs: '5|5|5|5|2', centreRs: '5|5|5|5|5' });
  const r = run({ tax: 60 }, settings, barren);
  assert.equal(r.ok, true);
  assert.equal(r.holdsNoTax, true);
  assert.ok(r.ceiling < 0, 'the fixture must hold no tax for this to mean anything');
  assert.equal(r.plan.tax, 0);
  assert.equal(r.plan.holds, false);
  assert.ok(r.plan.surplus.food < 0, 'the shortfall is what the reader is here for');
  // The plan is still the best one there is at that tax, not an empty one.
  assert.ok(r.plan.sFood > 0);
});

test('a site that does hold its tax says so, and is short of nothing', () => {
  const r = run({ tax: 20 });
  assert.equal(r.holdsNoTax, false);
  assert.equal(r.plan.holds, true);
  assert.ok(r.plan.surplus.food >= 0);
});

test('the tax input floors at 0, which is the lowest rate the game takes', () => {
  assert.equal(FOCUS_TAX_FLOOR, 0);
  assert.equal(parseFocus({ x: 1, y: 1, tax: '-40' }).focus.tax, 0);
});

// --- the edge of the world ---

test('the world ends where the map does, on all four sides', () => {
  assert.equal(inWorld(0, 0), true);
  assert.equal(inWorld(-1000, -3300), true);
  assert.equal(inWorld(1000, 1000), true);
  assert.equal(inWorld(-1001, 0), false);
  assert.equal(inWorld(1001, 0), false);
  assert.equal(inWorld(0, -3301), false);
  assert.equal(inWorld(0, 1001), false);
});

test('a site on the map edge is scored against the tiles that exist', () => {
  // 928|-3300 sits on the southern edge: three of the seven rows a radius 3
  // ring wants are off the world, so the ring is 27 tiles rather than 48. No
  // amount of panning would ever deliver them, so refusing would refuse forever.
  const payload = payloadAround({ r: 3, cx: 928, cy: -3300 });
  const r = focusSite({
    payload,
    focus: { ...DEFAULT_FOCUS, x: 928, y: -3300, radius: 3 },
    settings,
  });
  assert.equal(r.ok, true);
  assert.equal(r.ring, 27);
  assert.equal(r.claimable, 27);
});

test('on the edge, a tile that could have loaded still refuses', () => {
  const payload = payloadAround({ r: 3, cx: 928, cy: -3300 });
  delete payload.data[tileKey(-3299, 927)];
  const r = focusSite({
    payload,
    focus: { ...DEFAULT_FOCUS, x: 928, y: -3300, radius: 3 },
    settings,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'incomplete');
  assert.equal(r.missing, 1);
  assert.equal(r.ring, 27);
});

test('the scan reaches the same sites the optimiser does', () => {
  // neighbourhood is what the worker calls, and it is null-or-nothing: an edge
  // site returning null is a site the scan lists as Incomplete and never scores.
  const payload = payloadAround({ r: 3, cx: 928, cy: -3300 });
  const ring = neighbourhood(payload, tileKey(-3300, 928), 3, indexPayload(payload), settings);
  assert.equal(ring.length, 27);
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
  // "Can this tile hold 100%?" is the question being asked. "No, it holds 11%"
  // is the answer to it; an error is not.
  const poor = payloadAround({ rs: '5|5|5|5|3', centreRs: '5|5|5|5|5' });
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

test('barren land is land, whatever its resource ratings say', () => {
  // Barren Wastes rate 0|0|0|0|0 and are ordinary Plains to the game: they take
  // a Production Structure, which water does not. Reading the zeros as water
  // struck them off every military plan and told the user the leftovers were sea.
  const payload = payloadAround();
  payload.data[tileKey(101, 101)] = { sov: 1, hos: 1, b: 1, l: 2, rs: '0|0|0|0|0' };
  const r = run({ radius: 3 }, settings, payload);
  assert.equal(r.neighbours.find((t) => t.key === tileKey(101, 101)).water, false);

  assert.equal(isWaterTile({ b: 20, rs: '0|0|0|0|10' }), true);
  // No biome at all is the only case the ratings still answer.
  assert.equal(isWaterTile({ rs: '0|0|0|0|0' }), true);
  assert.equal(isWaterTile({ rs: '5|5|5|5|5' }), false);
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
