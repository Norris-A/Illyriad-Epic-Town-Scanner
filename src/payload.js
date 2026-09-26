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

/**
 * The payload cut down to the tiles on screen: `zoom` tiles either side of its
 * centre. Null when the envelope does not say where the screen is.
 *
 * Only `data` is cut. The `t` and `s` blocks only ever rule sites and claims
 * out, so reading past the edge can only make a result more cautious — and a
 * town just off screen must still hold the sites on screen at their distance.
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

/**
 * The `s` block's level field reads "<sov level>|<building level>". Null where
 * the sov level does not parse: charging a claim the wrong level is worse than
 * not charging it.
 */
export function claimLevel(claim) {
  const n = Number(String(claim?.s ?? '').split('|')[0]);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * The strings a town answers to, for matching the `s` block's `t` field against
 * it. The live payload carries the town's name there; the id is accepted too,
 * so a claim naming its town by id is not handed to nobody.
 */
export function townIdentity(town) {
  const text = (v) => String(v ?? '').trim();
  const rec = townRecord(town);
  const parts = rec ? null : townString(town).split('|');
  return (rec ? [rec.TownName, rec.TownId] : [parts[0], parts[1]]).map(text).filter(Boolean);
}

/**
 * Whether a claim is held by the town named in `town`.
 *
 * Sovereignty belongs to a town rather than to a player, so a second city of
 * yours standing nearby holds its own: `rd` says the claim is yours, and says
 * nothing about which of your towns pays for it. A claim naming no town is not
 * attributed to one, since guessing would hand this town its neighbour's
 * sovereignty for free.
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
    // sov:1 means eligible, not available — cross-check `s`. Sovereignty is never
    // shared, so an alliance member's claim is as unavailable as a stranger's,
    // and so is another of your own towns'. What is left is a claim you would
    // relinquish and place again, and one the planning town holds itself —
    // either way, ground the plan may use, which is what this answers.
    return claim.rd === 'Yours'
      && (!!settings.ownClaimsAvailable || isTownsClaim(claim, settings?.homeTown));
  }
  return true;
}

/**
 * The sovereignty level already standing on a tile, which the plan builds on
 * top of instead of paying for again.
 *
 * Zero for anything the planning town does not itself hold and keep — another
 * town's claim it may take is taken as bare ground, and so is one whose level
 * does not parse, which overstates the bill rather than reading a level nobody
 * can see.
 */
export function heldLevel(key, idx, settings) {
  const claim = idx.claims.get(key);
  if (!isTownsClaim(claim, settings?.preserveTown)) return 0;
  return claimLevel(claim) ?? 0;
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
    } else if (t.ally) {
      if (d < settings.dAlliance) return { ok: false, reason: 'too-close-alliance' };
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
      // A confederate reads "Confed " — trailing space and all — and is not one
      // of these: they are held at the distance a stranger is.
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
      const held = heldLevel(nKey, idx, settings);
      const claim = idx.claims.get(nKey);
      neighbours.push({
        dx,
        dy,
        food: foodOf(tile),
        key: nKey,
        i: tile.i,
        water: isWaterTile(tile),
        // What the tile already carries, so every cost downstream is the
        // UPGRADE rather than the whole claim.
        held,
        // The level of a claim of yours standing here that this plan does not
        // keep: priced as bare ground, but not ground nobody holds. 0 where the
        // level does not read, null for a tile carrying no such claim.
        relaid: held === 0 && claim?.rd === 'Yours' ? (claimLevel(claim) ?? 0) : null,
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
