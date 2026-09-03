// The scan's two gatekeepers: which tiles can carry a claim, and which tiles can
// carry a city. Both turn on relation, which is the part easy to state backwards
// — sovereignty is never shared, but settling distance is a courtesy that
// friendly towns are owed less of.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  tileKey, indexPayload, isClaimable, isCandidateSite, extractTowns,
} from '../src/payload.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';

/** Plain claimable, settleable ground, as the live payload sends it. */
const LAND = { sov: 1, hos: 1, b: 5, l: 2, rs: '5|5|5|5|5', i: 1 };

const claimAt = (key, rd) => indexPayload({ data: {}, t: {}, s: { [key]: { rd, s: '3|?' } } });

const EMPTY = indexPayload({ data: {}, t: {}, s: {} });

/** One town of the given relation, at absolute x|y, as extractTowns reports it. */
const townsAt = (rd, x, y) => extractTowns({
  t: { [tileKey(y, x)]: { t: { TownName: 'Rivermeet', X: String(x), Y: String(y) }, rd } },
});

// --- claimability -----------------------------------------------------------

test('nobody else’s claim is claimable, and no setting makes it one', () => {
  const key = tileKey(101, 102);
  // Every relation the blocks are known to write, plus a stranger, who carries
  // none at all. The one option there is runs on, so nothing here is failing for
  // want of being asked.
  for (const rd of ['Alliance', 'Confed ', 'Enemy', undefined]) {
    const settings = { ...DEFAULT_SETTINGS, ownClaimsAvailable: true };
    assert.equal(isClaimable(LAND, key, claimAt(key, rd), settings), false, `rd ${String(rd)}`);
  }
});

test('your own claim is offered back only when you ask for it', () => {
  const key = tileKey(101, 102);
  const idx = claimAt(key, 'Yours');
  const on = { ...DEFAULT_SETTINGS, ownClaimsAvailable: true };
  const off = { ...DEFAULT_SETTINGS, ownClaimsAvailable: false };
  assert.equal(isClaimable(LAND, key, idx, off), false);
  assert.equal(isClaimable(LAND, key, idx, on), true);
});

test('an unclaimed tile is claimable, and eligibility is still required', () => {
  const key = tileKey(101, 102);
  assert.equal(isClaimable(LAND, key, EMPTY, DEFAULT_SETTINGS), true);
  assert.equal(isClaimable({ ...LAND, sov: undefined }, key, EMPTY, DEFAULT_SETTINGS), false);
  assert.equal(isClaimable({ ...LAND, imp: 1 }, key, EMPTY, DEFAULT_SETTINGS), false);
  assert.equal(isClaimable({ ...LAND, brg: 1 }, key, EMPTY, DEFAULT_SETTINGS), false);
});

// --- settling distance ------------------------------------------------------

const SITE = tileKey(100, 100);

test('an alliance town is held at its own distance, not a stranger’s', () => {
  const settings = { ...DEFAULT_SETTINGS, dOther: 10, dAlliance: 3 };
  // Five squares east: inside the convention, outside what an ally asks.
  assert.deepEqual(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt('Alliance', 105, 100)),
    { ok: true },
  );
  assert.equal(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt(undefined, 105, 100)).reason,
    'too-close-other',
  );
});

test('the alliance distance is its own knob, not your own cities’', () => {
  const settings = { ...DEFAULT_SETTINGS, dOwn: 3, dAlliance: 6 };
  assert.equal(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt('Alliance', 105, 100)).reason,
    'too-close-alliance',
  );
});

test('a confederate is a stranger for settling distance', () => {
  // The block writes the relation with a trailing space, which must not be
  // tidied into alliance treatment.
  const settings = { ...DEFAULT_SETTINGS, dOther: 10, dAlliance: 3 };
  assert.equal(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt('Confed ', 105, 100)).reason,
    'too-close-other',
  );
});

test('your own cities keep their own, closer, distance', () => {
  const settings = { ...DEFAULT_SETTINGS, dOwn: 3, dOther: 10 };
  assert.deepEqual(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt('Yours', 104, 100)),
    { ok: true },
  );
  assert.equal(
    isCandidateSite(LAND, SITE, EMPTY, settings, townsAt('Yours', 102, 100)).reason,
    'too-close-own',
  );
});

test('a claimed or occupied tile is no site, whoever holds it', () => {
  assert.equal(
    isCandidateSite(LAND, SITE, claimAt(SITE, 'Yours'), DEFAULT_SETTINGS, []).reason,
    'already-claimed',
  );
  const idx = indexPayload({ data: {}, s: {}, t: { [SITE]: { rd: 'Alliance' } } });
  assert.equal(isCandidateSite(LAND, SITE, idx, DEFAULT_SETTINGS, []).reason, 'town-tile');
});
