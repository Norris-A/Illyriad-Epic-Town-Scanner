// The payload reader. getLatestPayload reads the client's global live on each call
// and cuts it to the view on screen; these tests stub the page globals capture.js
// reads.

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getLatestPayload, probeInPageData } from '../src/capture.js';

/** A minimal object that passes looksLikeMapPayload, centred on the given tile. */
function payload(x, y) {
  return { x, y, zoom: 9, data: { [`${y}|${x}`]: { rs: '5|5|5|5|5' } } };
}

afterEach(() => {
  delete globalThis.window;
});

test('reads the client global as the current payload', () => {
  globalThis.window = { mapData: payload(361, -3168) };
  assert.equal(getLatestPayload().x, 361);
});

test('reads the global afresh on every call', () => {
  globalThis.window = { mapData: payload(361, -3168) };
  assert.equal(getLatestPayload().x, 361);
  globalThis.window.mapData = payload(368, -3166);
  assert.equal(getLatestPayload().x, 368);
});

test('reads only the tiles on screen, though the global holds every view', () => {
  // The client merges each pan into the one global: the tile from the earlier
  // view is still in `data`, 20 tiles west of the centre now on screen.
  const map = payload(361, -3168);
  map.data['-3168|341'] = { rs: '5|5|5|5|5' };
  globalThis.window = { mapData: map };
  assert.deepEqual(Object.keys(getLatestPayload().data), ['-3168|361']);
  assert.equal(Object.keys(map.data).length, 2);
});

test('a global that does not say where the screen is gives no payload', () => {
  const map = payload(361, -3168);
  delete map.x;
  globalThis.window = { mapData: map };
  assert.equal(getLatestPayload(), null);
});

test('ignores a global that is not a map payload', () => {
  globalThis.window = { mapData: { not: 'a map' } };
  assert.equal(getLatestPayload(), null);
});

test('with no global there is no payload', () => {
  globalThis.window = {};
  assert.equal(getLatestPayload(), null);
});

test('probe reports the source without freezing what a later read sees', () => {
  globalThis.window = { mapData: payload(361, -3168) };
  const hits = probeInPageData();
  assert.deepEqual(hits.map((h) => h.source), ['window.mapData']);
  // Probing has no side effect, so a later pan is still what a read returns.
  globalThis.window.mapData = payload(368, -3166);
  assert.equal(getLatestPayload().x, 368);
});
