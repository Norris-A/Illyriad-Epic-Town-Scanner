// Reading the map payload. Tiles are classified by their flags and `rs`, never
// by the `t` sprite name; `i` is used only to look up the terrain descriptor.

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

/**
 * The payload cut to the tiles on screen: `zoom` tiles either side of its
 * centre. Null when it does not say where the screen is. Only `data` is cut:
 * towns and claims just off screen still rule out sites on it.
 */
export function onScreen(payload) {
  const { x, y, zoom } = payload ?? {};
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(zoom)) return null;
  const data = {};
  for (const [key, tile] of Object.entries(payload.data ?? {})) {
    const t = parseKey(key);
    if (Math.abs(t.x - x) <= zoom && Math.abs(t.y - y) <= zoom) data[key] = tile;
  }
  return { ...payload, data };
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
 * Water, from the biome. Zero basic resources does not mean water — Barren
 * Wastes, Marsh and Fen rate the same — so that test is only a fallback for a
 * tile with no biome.
 */
export function isWaterTile(tile) {
  if (Number.isFinite(tile?.b)) return tile.b === WATER_BIOME;
  const rs = parseRs(tile);
  return !!rs && rs.wood + rs.clay + rs.iron + rs.stone === 0;
}

/**
 * Index the claim and town blocks by "y|x". They can reference tiles outside
 * `data`, so presence in one block says nothing about another.
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

/** A claim's sovereignty level, from "<sov level>|<building level>"; null if unreadable. */
export function claimLevel(claim) {
  const n = Number(String(claim?.s ?? '').split('|')[0]);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * The name and id a town answers to, for matching a claim's `t` field, which
 * usually holds the name.
 */
export function townIdentity(town) {
  const text = (v) => String(v ?? '').trim();
  const rec = townRecord(town);
  const parts = rec ? null : townString(town).split('|');
  return (rec ? [rec.TownName, rec.TownId] : [parts[0], parts[1]]).map(text).filter(Boolean);
}

/**
 * Whether a claim is held by `town`. Sovereignty belongs to a town, not a
 * player: `rd` only says the claim is yours, not which of your towns holds it.
 * A claim naming no town is attributed to none.
 */
export function isTownsClaim(claim, town) {
  if (!claim || claim.rd !== 'Yours' || !town?.length) return false;
  const names = claim.t && typeof claim.t === 'object'
    ? townIdentity(claim.t)
    : [String(claim.t ?? '').trim()].filter(Boolean);
  return names.some((n) => town.includes(n));
}

export function isClaimable(tile, key, idx, settings) {
  if (!tile || tile.sov !== 1) return false;
  if (tile.imp || tile.brg) return false;

  const claim = idx.claims.get(key);
  if (claim) {
    // sov:1 means eligible, not free. Sovereignty is never shared, so only your
    // own claims can be used: the planning town's, or any of yours when
    // ownClaimsAvailable says you would give them up.
    return claim.rd === 'Yours'
      && (!!settings.ownClaimsAvailable || isTownsClaim(claim, settings?.homeTown));
  }
  return true;
}

/**
 * The sovereignty level the planning town already holds and keeps on a tile,
 * which the plan builds on instead of paying for again. Zero otherwise,
 * including when the level does not read.
 */
export function heldLevel(key, idx, settings) {
  const claim = idx.claims.get(key);
  if (!isTownsClaim(claim, settings?.preserveTown)) return 0;
  return claimLevel(claim) ?? 0;
}

/**
 * Can a city sit on this tile? `set` decides where present; the live payload
 * omits it, so otherwise the tile must not be impassable, a bridge, an NPC lair
 * or water. `hos` is also set on water and lairs, so it cannot decide alone.
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
    } else if (t.ally) {
      if (d < settings.dAlliance) return { ok: false, reason: 'too-close-alliance' };
    } else if (d < settings.dOther) {
      return { ok: false, reason: 'too-close-other' };
    }
  }
  return { ok: true };
}

/**
 * The town record on an entry: an object with TownName and a numeric X and Y,
 * found by those keys since the property holding it is undocumented.
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
 * a town entry, found by its shape: four or more parts with numbers in the x and
 * y slots.
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
 * Town names and positions from the `t` block, from either the record or the
 * pipe string. Position falls back to the key, and the name to blank.
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
      // Confederates ("Confed ") are kept at a stranger's distance.
      ally: town && town.rd === 'Alliance',
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
 * The R_claim neighbourhood. Unclaimable tiles are dropped; tiles the payload
 * lacks are listed in `missing`, which makes the site unscorable. Tiles past
 * the world's edge are neither, and are not counted in `ring`.
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
      const held = heldLevel(nKey, idx, settings);
      const claim = idx.claims.get(nKey);
      neighbours.push({
        dx,
        dy,
        food: foodOf(tile),
        key: nKey,
        i: tile.i,
        water: isWaterTile(tile),
        // Costs downstream are for the levels above this.
        held,
        // Level of a claim of yours here that the plan does not keep and prices
        // as bare ground: 0 if unreadable, null if there is no such claim.
        relaid: held === 0 && claim?.rd === 'Yours' ? (claimLevel(claim) ?? 0) : null,
        descriptor: descriptorFor(tile.i),
      });
    }
  }
  return { neighbours, missing, ring };
}

/** The site's claimable neighbours, or null if any tile in the radius is off screen. */
export function neighbourhood(payload, key, rClaim, idx, settings) {
  const { neighbours, missing } = collectNeighbourhood(payload, key, rClaim, idx, settings);
  return missing.length ? null : neighbours;
}
