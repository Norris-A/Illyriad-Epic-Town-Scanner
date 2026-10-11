// The page scripts/mockups.mjs photographs: the real panel over an invented map.
// Each entry in window.mockups sets the panel up for one picture and resolves to
// the rectangle to capture. __WORKER_SOURCE__ is the scan worker, as in main.js.

import { createPanel } from '../src/panel.js';
import { tileKey } from '../src/payload.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';

/* global __WORKER_SOURCE__ */

const CX = 318;
const CY = -142;
const ZOOM = 10;

// Seeded, so every run draws the same map.
let seed = 7;
function rand() {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (a) => a[Math.floor(rand() * a.length)];

// Terrain indices from TERRAIN_NAMES, and plot ratings as "wood|clay|iron|stone|food".
const KIND = {
  plains: { i: [1, 2, 3, 5, 30, 31, 33], rs: ['5|5|5|3|7', '5|5|5|3|7', '5|5|4|3|8'] },
  fertile: { i: [12, 13, 14, 15, 16, 17], rs: ['4|4|4|3|10', '4|4|3|3|11'] },
  sforest: { i: [55, 56, 57], rs: ['7|4|4|3|7'] },
  lforest: { i: [44, 52, 53], rs: ['9|4|4|3|5'] },
  shill: { i: [8, 9, 11], rs: ['4|7|4|3|7'] },
  lhill: { i: [6, 7, 49, 51], rs: ['4|9|4|3|5'] },
  smount: { i: [27, 28, 29, 46, 47], rs: ['4|4|7|4|6'] },
  lmount: { i: [24, 25, 26], rs: ['3|4|8|6|4'] },
};

// Terrain comes in clumps, as on the real map.
const BLOBS = [
  { x: CX - 6, y: CY + 3, r: 4.5, kinds: ['lforest', 'sforest', 'sforest'] },
  { x: CX + 7, y: CY - 3, r: 4, kinds: ['shill', 'lhill', 'shill'] },
  { x: CX + 4, y: CY + 7, r: 3, kinds: ['smount', 'lmount', 'smount'] },
  { x: CX - 2, y: CY - 7, r: 2.2, kinds: ['water'] },
  { x: CX + 1, y: CY + 1, r: 3, kinds: ['fertile', 'plains'] },
];

function land(kind) {
  const k = KIND[kind];
  return { sov: 1, hos: 1, b: 5, i: pick(k.i), rs: pick(k.rs) };
}

function tileAt(x, y) {
  for (const b of BLOBS) {
    const d = Math.hypot(x - b.x, y - b.y);
    if (d <= b.r && rand() < 0.85 - (d / b.r) * 0.3) {
      const kind = pick(b.kinds);
      return kind === 'water' ? { i: 59, b: 20, hos: 1, rs: '0|0|0|0|0' } : land(kind);
    }
  }
  const r = rand();
  if (r < 0.02) return { i: 22, b: 5, imp: 1, rs: '0|0|0|0|0' };
  return land(r < 0.18 ? 'fertile' : r < 0.3 ? 'sforest' : r < 0.38 ? 'shill' : 'plains');
}

const data = {};
for (let y = CY - ZOOM; y <= CY + ZOOM; y++) {
  for (let x = CX - ZOOM; x <= CX + ZOOM; x++) data[tileKey(y, x)] = tileAt(x, y);
}

const towns = {};
const claims = {};
/** `claimed` holds [dx, dy, level] for each claim the town holds around it. */
function town(name, player, x, y, rd, claimed = []) {
  const key = tileKey(y, x);
  towns[key] = { t: { TownName: name, Player: player, X: String(x), Y: String(y) }, rd };
  if (data[key]) data[key] = { i: 4, b: 5, rs: '5|5|5|3|7' };
  for (const [dx, dy, level] of claimed) {
    claims[tileKey(y + dy, x + dx)] = { rd, s: `${level}|?`, t: name, pn: player };
  }
}

town('Highmoor', 'Firebolty', CX - 5, CY - 4, 'Yours',
  [[1, 0, 3], [-1, 0, 3], [0, 1, 2], [1, 1, 2], [0, -1, 3], [-1, -1, 1]]);
town('Ravensgate', 'Firebolty', CX + 8, CY + 3, 'Yours', [[0, 1, 2], [1, 0, 2], [-1, 0, 1]]);
town('Emberhold', 'Kestrel', CX + 2, CY + 9, 'Alliance', [[1, 0, 2], [0, -1, 1]]);
// Just off screen, so they rule out sites without filling the picture.
town('Thornwick', 'Aldric', CX - 14, CY + 12, undefined);
town('Saltmarsh', 'Brannoc', CX + 15, CY - 11, undefined);

const payload = { x: CX, y: CY, zoom: ZOOM, data, s: claims, t: towns };
const settings = { ...DEFAULT_SETTINGS, milsovStructure: 'trainingGround' };

const panel = createPanel({
  initialSettings: settings,
  getPayload: () => payload,
});
const shadow = document.querySelector('sov-scanner').shadowRoot;
const $ = (s) => shadow.querySelector(s);

function scan() {
  const worker = new Worker(URL.createObjectURL(
    new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }),
  ));
  return new Promise((resolve) => {
    worker.onmessage = ({ data: msg }) => {
      if (msg.type !== 'done') return;
      worker.terminate();
      panel.renderResults(msg.results, { x: CX, y: CY, zoom: ZOOM, scanned: msg.scanned });
      panel.renderIncomplete(msg.incomplete);
      resolve(msg.results);
    };
    worker.postMessage({ payload, settings });
  });
}

/** The panel from its top down to `el`'s bottom edge. */
function clipTo(el, pad = 8) {
  const p = $('.sov-panel').getBoundingClientRect();
  const bottom = el ? el.getBoundingClientRect().bottom + pad : p.bottom;
  return { x: p.x, y: p.y, width: p.width, height: bottom - p.y };
}

window.mockups = {
  async 'site-search'() {
    await scan();
    return clipTo(shadow.querySelectorAll('.sov-results .sov-row')[9]);
  },
  async 'site-plan'() {
    const [best] = await scan();
    panel.selectSite(best.x, best.y);
    return clipTo($('.sov-detail'), 0);
  },
  async 'optimal-sovereignty'() {
    $('.sov-tabs [data-tab="focus"]').click();
    const picker = $('.sov-town-pick');
    // The picker fills itself as it is reached for.
    picker.dispatchEvent(new Event('focus'));
    picker.value = [...picker.options].find((o) => o.textContent.startsWith('Highmoor')).value;
    picker.dispatchEvent(new Event('change', { bubbles: true }));
    const preserve = $('[data-focus="preserveSovereignty"]');
    if (!preserve.checked) preserve.click();
    $('.sov-focus-run').click();
    return clipTo($('.sov-focus-out'));
  },
  async 'city-configuration'() {
    $('.sov-tabs [data-tab="config"]').click();
    return clipTo(null);
  },
};
