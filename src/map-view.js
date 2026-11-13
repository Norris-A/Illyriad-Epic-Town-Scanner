// Names the panel and the World Map overlay share: the game's World Map routes,
// a claim's cell within a plan, and a sovereignty level's numeral. No DOM.

import { SOV_LEVEL_ROMAN } from './constants.js';

const WORLD_MAP_HASH = '#/World/Map';

/** Whether a location hash is the World Map, including deep links to a tile. */
export function isWorldMapHash(hash) {
  return String(hash ?? '').startsWith(WORLD_MAP_HASH);
}

/** The view centred on x|y, zoomed out at least far enough to show `radius`. */
export function centredView(x, y, zoom, radius) {
  return { x, y, zoom: Math.max(zoom, radius) };
}

/** The World Map route to `view`, as the game writes it. */
export function mapHash(view) {
  return `${WORLD_MAP_HASH}/${view.x}/${view.y}/${view.zoom}`;
}

/** A sovereignty level as its numeral, or as the number itself if it is not 1-5. */
export function roman(level) {
  return SOV_LEVEL_ROMAN[level - 1] ?? String(level);
}

export function cellKey(dx, dy) {
  return `${dx},${dy}`;
}
