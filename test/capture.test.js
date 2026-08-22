// The payload reader. getLatestPayload reads the client's global live on each call
// so a Scan sees the current view; these tests stub the page globals capture.js
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
  delete globalThis.document;
});

test('reads the client global as the current payload', () => {
  globalThis.window = { mapData: payload(361, -3168) };
  assert.equal(getLatestPayload().x, 361);
});

test('tracks the global when the client replaces it on a pan', () => {
  globalThis.window = { mapData: payload(361, -3168) };
  assert.equal(getLatestPayload().x, 361);
  // The client swaps in a new view on a pan; the reader must return the new one.
  globalThis.window.mapData = payload(368, -3166);
  assert.equal(getLatestPayload().x, 368);
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
  globalThis.document = { getElementById: () => null };
  const hits = probeInPageData();
  assert.deepEqual(hits.map((h) => h.source), ['window.mapData']);
  // Probing has no side effect, so a later pan is still what a read returns.
  globalThis.window.mapData = payload(368, -3166);
  assert.equal(getLatestPayload().x, 368);
});
