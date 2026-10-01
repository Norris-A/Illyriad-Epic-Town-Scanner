// The map markers' geometry. mapGeometry, tileAt and tileBox are pure, so where
// every tile lands on screen — and which way up — is testable here without the
// game's map.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mapGeometry, tileAt, tileBox, parseCoords } from '../src/overlay.js';

const rect = (left, top, width, height) =>
  ({ left, top, width, height, right: left + width, bottom: top + height });

// The live layout: a 515 × 511 host with the 500-pixel grid at (15, 11) inside it.
const HOST = rect(100, 50, 515, 511);
const LAYER = rect(115, 61, 500, 500);
const VIEW = { x: 360, y: -3170, zoom: 9 };

const measured = (over = {}) =>
  mapGeometry({ view: VIEW, hash: '#/World/Map', hostRect: HOST, layerRect: LAYER, ...over });

// --- mapGeometry ---------------------------------------------------------------

test('the grid is placed from the measured layer and sized from the zoom', () => {
  assert.deepEqual(measured(), {
    ok: true,
    left: 115,
    top: 61,
    size: 500,
    offsetX: 15,
    offsetY: 11,
    centreX: 360,
    centreY: -3170,
    zoom: 9,
    span: 19,
    pitch: 500 / 19,
  });
});

test('off the World Map there is no grid', () => {
  assert.deepEqual(measured({ hash: '#/Town/1/Overview' }), { ok: false, reason: 'not-on-map' });
  assert.deepEqual(measured({ hash: '' }), { ok: false, reason: 'not-on-map' });
});

test('a view that does not say where the screen is gives no grid', () => {
  for (const view of [null, { x: 360, y: -3170 }, { x: 360.5, y: -3170, zoom: 9 },
    { x: 360, y: '-3170', zoom: 9 }, { x: 360, y: -3170, zoom: 0 }]) {
    assert.deepEqual(measured({ view }), { ok: false, reason: 'no-view' }, JSON.stringify(view));
  }
});

test('a hash naming another view refuses; a bare one or the same one passes', () => {
  for (const hash of ['#/World/Map/361/-3170/9', '#/World/Map/360/-3171/9',
    '#/World/Map/360/-3170/10']) {
    assert.deepEqual(measured({ hash }), { ok: false, reason: 'view-moved' }, hash);
  }
  assert.equal(measured({ hash: '#/World/Map' }).ok, true);
  assert.equal(measured({ hash: '#/World/Map/360/-3170/9' }).ok, true);
});

test('a missing host or layer refuses', () => {
  assert.deepEqual(measured({ hostRect: null }), { ok: false, reason: 'no-host' });
  assert.deepEqual(measured({ layerRect: undefined }), { ok: false, reason: 'no-layer' });
});

test('a layer under 100 pixels wide refuses', () => {
  assert.deepEqual(measured({ layerRect: rect(115, 61, 99, 99) }),
    { ok: false, reason: 'too-small' });
  assert.equal(measured({ layerRect: rect(115, 61, 100, 100) }).ok, true);
});

test('a layer that is not square refuses, sub-pixel rounding aside', () => {
  // The tolerance is half a percent of the width, 2.5 pixels at 500.
  assert.deepEqual(measured({ layerRect: rect(115, 61, 500, 497) }),
    { ok: false, reason: 'not-square' });
  assert.equal(measured({ layerRect: rect(115, 61, 500, 497.6) }).ok, true);
  // The tolerance never drops below a pixel, however small the layer.
  assert.equal(measured({ layerRect: rect(115, 61, 120, 119) }).ok, true);
  assert.deepEqual(measured({ layerRect: rect(115, 61, 120, 118.9) }),
    { ok: false, reason: 'not-square' });
});

test('a layer outside its host refuses, a pixel of rounding aside', () => {
  for (const layer of [rect(98.9, 61, 500, 500), rect(115, 48.9, 500, 500),
    rect(116.1, 61, 500, 500), rect(115, 62.1, 500, 500)]) {
    assert.deepEqual(measured({ layerRect: layer }), { ok: false, reason: 'outside-host' },
      JSON.stringify(layer));
  }
  assert.equal(measured({ layerRect: rect(99, 49, 500, 500) }).ok, true);
  assert.equal(measured({ layerRect: rect(116, 62, 500, 500) }).ok, true);
});

// --- tileAt and tileBox --------------------------------------------------------

for (const zoom of [1, 9, 19]) {
  const geom = measured({ view: { ...VIEW, zoom } });
  const { left, top, size, pitch } = geom;
  const west = VIEW.x - zoom;
  const east = VIEW.x + zoom;
  const north = VIEW.y + zoom;
  const south = VIEW.y - zoom;

  test(`zoom ${zoom}: the centre tile is in the middle of the grid`, () => {
    assert.deepEqual(tileAt(geom, left + size / 2, top + size / 2), { x: VIEW.x, y: VIEW.y });
    assert.deepEqual(tileBox(geom, VIEW.x, VIEW.y), { left: zoom * pitch, top: zoom * pitch, size: pitch });
  });

  // The round trip below cannot catch this: a grid mirrored in both tileAt and
  // tileBox still maps each box back to its own tile.
  test(`zoom ${zoom}: x runs left to right and y runs up the grid`, () => {
    assert.deepEqual(tileAt(geom, left, top), { x: west, y: north });
    assert.deepEqual(tileAt(geom, left + size - 0.01, top), { x: east, y: north });
    assert.deepEqual(tileAt(geom, left, top + size - 0.01), { x: west, y: south });
    assert.deepEqual(tileAt(geom, left + size - 0.01, top + size - 0.01), { x: east, y: south });
    assert.deepEqual(tileBox(geom, west, north), { left: 0, top: 0, size: pitch });
    assert.deepEqual(tileBox(geom, east, south),
      { left: 2 * zoom * pitch, top: 2 * zoom * pitch, size: pitch });
  });

  test(`zoom ${zoom}: nothing past any of the four edges is on the grid`, () => {
    assert.equal(tileAt(geom, left - 0.01, top + size / 2), null);
    assert.equal(tileAt(geom, left + size, top + size / 2), null);
    assert.equal(tileAt(geom, left + size / 2, top - 0.01), null);
    assert.equal(tileAt(geom, left + size / 2, top + size), null);
    assert.equal(tileBox(geom, west - 1, VIEW.y), null);
    assert.equal(tileBox(geom, east + 1, VIEW.y), null);
    assert.equal(tileBox(geom, VIEW.x, north + 1), null);
    assert.equal(tileBox(geom, VIEW.x, south - 1), null);
  });

  test(`zoom ${zoom}: every tile's box maps back to that tile`, () => {
    for (let x = west; x <= east; x++) {
      for (let y = south; y <= north; y++) {
        const box = tileBox(geom, x, y);
        const at = (dx, dy) => tileAt(geom, left + box.left + dx, top + box.top + dy);
        assert.deepEqual(at(box.size / 2, box.size / 2), { x, y });
        assert.deepEqual(at(0.01, 0.01), { x, y });
        assert.deepEqual(at(box.size - 0.01, box.size - 0.01), { x, y });
      }
    }
  });
}

// --- the game's readout --------------------------------------------------------

test('the tile readout parses as x|y, and anything else as nothing', () => {
  assert.deepEqual(parseCoords('360|-3170'), { x: 360, y: -3170 });
  assert.deepEqual(parseCoords(' -12 | 7 '), { x: -12, y: 7 });
  for (const text of ['', null, undefined, '360', '360|', 'x|y', '360|-3170|9', '3.5|2']) {
    assert.equal(parseCoords(text), null, String(text));
  }
});
