// Reading the map payload.
// Rule zero: never classify on the `t` sprite name. Flags and
// `rs` only. Read food from rs[4]; `i` is for the descriptor lookup only.

import { descriptorFor } from './constants.js';

/** Tile keys are "y|x" — y first. Town strings in `t` are "x|y". Don't mix them up. */
export function tileKey(y, x) {
  return `${y}|${x}`;
}

export function parseKey(key) {
  const [y, x] = key.split('|').map(Number);
  return { x, y };
}

/** rs is "wood|clay|iron|stone|food". Food is index 4. */
export function parseRs(tile) {
  if (!tile || typeof tile.rs !== 'string') return null;
  const parts = tile.rs.split('|').map(Number);
  if (parts.length !== 5 || parts.some(Number.isNaN)) return null;
  return { wood: parts[0], clay: parts[1], iron: parts[2], stone: parts[3], food: parts[4] };
}

export function foodOf(tile) {
  const rs = parseRs(tile);
  return rs ? rs.food : 0;
}

/** `b` is 20 on water, 4 or 5 on land. */
const WATER_BIOME = 20;

/**
 * Water, from the ratings rather than the sprite: land rates all five
 * resources, water rates food alone, so four zeros is the test. `b` answers
 * the tile whose `rs` is missing or unparseable, rather than calling it land.
 */
export function isWaterTile(tile) {
  const rs = parseRs(tile);
  if (!rs) return tile?.b === WATER_BIOME;
  return rs.wood + rs.clay + rs.iron + rs.stone === 0;
}

/**
 * Index the auxiliary blocks into lookups keyed by "y|x".
 * Block coverage is NOT aligned with `data` — the `s` block can
 * reference tiles outside the returned grid. Never infer presence across blocks.
 */
export function indexPayload(payload) {
  const claims = new Map();  // "y|x" -> claim record from `s`
  const towns = new Map();   // "y|x" -> town record from `t`

  for (const [key, claim] of Object.entries(payload.s ?? {})) {
    claims.set(key, claim);
  }

  for (const [key, town] of Object.entries(payload.t ?? {})) {
    towns.set(key, town);
  }

  return { claims, towns };
}

export function isClaimable(tile, key, idx, settings) {
  if (!tile || tile.sov !== 1) return false;
  if (tile.imp || tile.brg) return false;

  const claim = idx.claims.get(key);
  if (claim) {
    // sov:1 means eligible, not available — cross-check `s`.
    const rd = claim.rd;
    if (rd === 'Yours' && settings.ownClaimsAvailable) return true;
    if (rd === 'Alliance' && settings.allianceClaimsAvailable) return true;
    return false;
  }
  return true;
}

/**
 * Can a city sit on this tile?
 *
 * `set:1` answers it outright, on the payloads that carry the field — the live
 * one no longer does. Without it the answer is what a settleable tile is not:
 * impassable, a bridge, an NPC lair, or water. `hos` is the positive marker,
 * but it rides on water and lairs too, so it cannot decide this alone.
 */
export function isSettleable(tile) {
  if (!tile) return false;
  if (tile.set !== undefined) return tile.set === 1;
  if (tile.imp || tile.brg || tile.npc) return false;
  if (isWaterTile(tile)) return false;
  return tile.sov === 1 && tile.hos === 1;
}

export function isCandidateSite(tile, key, idx, settings, towns) {
  if (!isSettleable(tile)) return { ok: false, reason: 'not-settleable' };
  if (idx.claims.has(key)) return { ok: false, reason: 'already-claimed' };
  if (idx.towns.has(key)) return { ok: false, reason: 'town-tile' };

  const { x, y } = parseKey(key);
  for (const t of towns) {
    const d = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
    if (t.own) {
      if (d < settings.dOwn) return { ok: false, reason: 'too-close-own' };
    } else if (d < settings.dOther) {
      return { ok: false, reason: 'too-close-other' };
    }
  }
  return { ok: true };
}

/**
 * The town's pipe string, "name|townID|x|y|population|playerID|...", found by
 * its shape rather than by a field name.
 *
 * The entry is an object carrying the string alongside `r`, `rd` and friends,
 * and which property holds it is not documented. Guessing at names failed
 * silently: the position falls back to the tile key, which is right, so a wrong
 * guess cost only the name and looked like everything working. Matching on
 * "four or more parts with numbers in the x and y slots" is self-checking, and
 * no other field on the entry is shaped like that.
 */
export function townString(town) {
  if (typeof town === 'string') return town;
  if (!town || typeof town !== 'object') return '';
  for (const v of Object.values(town)) {
    if (typeof v !== 'string' || !v.includes('|')) continue;
    const parts = v.split('|');
    if (parts.length >= 4 && Number.isFinite(Number(parts[2])) && parts[2] !== ''
      && Number.isFinite(Number(parts[3])) && parts[3] !== '') {
      return v;
    }
  }
  return '';
}

/**
 * Town positions from the `t` block. The pipe string is x|y — note the
 * inversion vs keys. Several positions remain unidentified; only read what's
 * known.
 */
export function extractTowns(payload) {
  const out = [];
  for (const [key, town] of Object.entries(payload.t ?? {})) {
    const parts = townString(town).split('|');
    const x = Number(parts[2]);
    const y = Number(parts[3]);
    const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
    out.push({
      ...pos,
      // parts[0] is the town's name. Blank where the string is not the pipe
      // format, which the caller shows as the coordinates instead.
      name: parts[0] ?? '',
      own: town && town.rd === 'Yours',
      rd: town && town.rd,
      key,
    });
  }
  return out;
}

/**
 * The R_claim neighbourhood, separating tiles the payload did not carry from
 * tiles it carried and that are not claimable. Both are dropped from
 * `neighbours`; only the first is a reason not to score.
 *
 * @returns {{neighbours: object[], missing: string[]}} missing holds the keys
 *   the payload had no tile for, in scan order.
 */
export function collectNeighbourhood(payload, key, rClaim, idx, settings) {
  const { x, y } = parseKey(key);
  const neighbours = [];
  const missing = [];
  for (let dy = -rClaim; dy <= rClaim; dy++) {
    for (let dx = -rClaim; dx <= rClaim; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nKey = tileKey(y + dy, x + dx);
      const tile = payload.data[nKey];
      if (!tile) {
        missing.push(nKey);
        continue;
      }
      if (!isClaimable(tile, nKey, idx, settings)) continue;
      neighbours.push({
        dx,
        dy,
        food: foodOf(tile),
        key: nKey,
        i: tile.i,
        water: isWaterTile(tile),
        // Carried on the tile so the panel never repeats the lookup, and so a
        // plan travelling from the worker arrives with its descriptors already
        // on it. Null where nothing identifies the terrain.
        descriptor: descriptorFor(tile.i),
      });
    }
  }
  return { neighbours, missing };
}

/**
 * Collect the R_claim neighbourhood of a site.
 * Returns null if ANY tile in the ring is missing — never score on
 * partial data; such sites are reported separately as Incomplete.
 */
export function neighbourhood(payload, key, rClaim, idx, settings) {
  const { neighbours, missing } = collectNeighbourhood(payload, key, rClaim, idx, settings);
  return missing.length ? null : neighbours;
}
