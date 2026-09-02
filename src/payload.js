// Reading the map payload.
// Rule zero: never classify on the `t` sprite name. Flags and
// `rs` only. Read food from rs[4]; `i` is for the descriptor lookup only.

import {
  descriptorFor, WORLD_MIN_X, WORLD_MAX_X, WORLD_MIN_Y, WORLD_MAX_Y,
} from './constants.js';

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

/** Water is a biome group of its own; every other value of `b` is land. */
const WATER_BIOME = 20;

/**
 * Water, from the biome rather than the sprite or the ratings. Rating four zeros
 * in the basic resources does not mean water: barren land — Barren Wastes,
 * Marsh, Fen — rates the same way and takes buildings that water cannot. The
 * zeros are kept only for the tile carrying no biome at all.
 */
export function isWaterTile(tile) {
  if (Number.isFinite(tile?.b)) return tile.b === WATER_BIOME;
  const rs = parseRs(tile);
  return !!rs && rs.wood + rs.clay + rs.iron + rs.stone === 0;
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
 * The town record on the entry: an object carrying TownName beside a numeric X
 * and Y. Located by those keys rather than by where it sits, since the property
 * holding it is not documented.
 */
export function townRecord(town) {
  if (!town || typeof town !== 'object') return null;
  const isRecord = (o) => !!o && typeof o === 'object'
    && typeof o.TownName === 'string'
    && o.X !== '' && Number.isFinite(Number(o.X))
    && o.Y !== '' && Number.isFinite(Number(o.Y));
  if (isRecord(town)) return town;
  for (const v of Object.values(town)) if (isRecord(v)) return v;
  return null;
}

/**
 * The pipe string "name|townID|x|y|population|playerID|...", the older shape of
 * a town entry, for entries carrying no record.
 *
 * Found by its shape — four or more parts with numbers in the x and y slots,
 * which nothing else on an entry has — because the property holding it is not
 * documented. Reading the wrong field here is silent rather than loud: position
 * falls back to the tile key, which is right, so a miss costs only the name.
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
 * Town names and positions from the `t` block. Both shapes of entry are read:
 * the record, and the pipe string where an entry carries no record. Both state
 * position as x then y, the inverse of the key. The name is blank where neither
 * shape is present, which the caller shows as the coordinates instead.
 */
export function extractTowns(payload) {
  const out = [];
  for (const [key, town] of Object.entries(payload.t ?? {})) {
    const rec = townRecord(town);
    const parts = rec ? null : townString(town).split('|');
    const x = Number(rec ? rec.X : parts[2]);
    const y = Number(rec ? rec.Y : parts[3]);
    const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
    out.push({
      ...pos,
      name: (rec ? rec.TownName : parts[0]) ?? '',
      own: town && town.rd === 'Yours',
      rd: town && town.rd,
      key,
    });
  }
  return out;
}

/** Whether a tile exists at all, as opposed to lying past an edge of the map. */
export function inWorld(x, y) {
  return x >= WORLD_MIN_X && x <= WORLD_MAX_X && y >= WORLD_MIN_Y && y <= WORLD_MAX_Y;
}

/**
 * The R_claim neighbourhood, separating tiles the payload did not carry from
 * tiles it carried and that are not claimable. Both are dropped from
 * `neighbours`; only the first is a reason not to score.
 *
 * Tiles off the edge of the world are neither: they are absent from every
 * payload there will ever be, so counting them as missing would make sites near
 * an edge permanently unscorable. `ring` is the count of tiles that do exist,
 * which is what `neighbours` is out of.
 *
 * @returns {{neighbours: object[], missing: string[], ring: number}} missing
 *   holds the keys the payload had no tile for, in scan order.
 */
export function collectNeighbourhood(payload, key, rClaim, idx, settings) {
  const { x, y } = parseKey(key);
  const neighbours = [];
  const missing = [];
  let ring = 0;
  for (let dy = -rClaim; dy <= rClaim; dy++) {
    for (let dx = -rClaim; dx <= rClaim; dx++) {
      if (dx === 0 && dy === 0) continue;
      if (!inWorld(x + dx, y + dy)) continue;
      ring += 1;
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
  return { neighbours, missing, ring };
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
