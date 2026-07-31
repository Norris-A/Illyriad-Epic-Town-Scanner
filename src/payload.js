// Reading the map payload — PRD §2, mechanics §1.
// Rule zero: never classify on the `t` sprite name (mechanics §1.3). Flags and
// `rs` only. Read food from rs[4]; `i` is for the descriptor lookup only.

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

/**
 * Index the auxiliary blocks into lookups keyed by "y|x".
 * mechanics §1.5: block coverage is NOT aligned with `data` — the `s` block can
 * reference tiles outside the returned grid. Never infer presence across blocks.
 */
export function indexPayload(payload) {
  const claims = new Map();  // "y|x" -> claim record from `s`
  const towns = new Map();   // "y|x" -> town record from `t`
  const unknownTerrain = new Set();

  for (const [key, claim] of Object.entries(payload.s ?? {})) {
    claims.set(key, claim);
  }

  for (const [key, town] of Object.entries(payload.t ?? {})) {
    towns.set(key, town);
  }

  return { claims, towns, unknownTerrain };
}

/** PRD §3.3 — is this neighbour available to claim? */
export function isClaimable(tile, key, idx, settings) {
  if (!tile || tile.sov !== 1) return false;
  if (tile.imp || tile.brg) return false;

  const claim = idx.claims.get(key);
  if (claim) {
    // sov:1 means eligible, not available (mechanics §1.5) — cross-check `s`.
    const rd = claim.rd;
    if (rd === 'Yours' && settings.ownClaimsAvailable) return true;
    if (rd === 'Alliance' && settings.allianceClaimsAvailable) return true;
    return false;
  }
  return true;
}

/** PRD §3.2 — does this tile qualify as a candidate settle site? */
export function isCandidateSite(tile, key, idx, settings, towns) {
  if (!tile || tile.set !== 1) return { ok: false, reason: 'not-settleable' };
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
 * Town positions from the `t` block. The pipe string is
 * "name|townID|x|y|population|playerID|..." — x|y, note the inversion vs keys.
 * Several positions remain unidentified (mechanics §1.5); only read what's known.
 */
export function extractTowns(payload) {
  const out = [];
  for (const [key, town] of Object.entries(payload.t ?? {})) {
    const str = typeof town === 'string' ? town : town.s ?? town.n ?? '';
    const parts = String(str).split('|');
    const x = Number(parts[2]);
    const y = Number(parts[3]);
    const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
    out.push({ ...pos, own: town && town.rd === 'Yours', rd: town && town.rd, key });
  }
  return out;
}

/**
 * Collect the R_claim neighbourhood of a site.
 * Returns null if ANY tile in the ring is missing — PRD §3.1 forbids scoring on
 * partial data, and such sites are reported separately as Incomplete.
 */
export function neighbourhood(payload, key, rClaim, idx, settings) {
  const { x, y } = parseKey(key);
  const out = [];
  for (let dy = -rClaim; dy <= rClaim; dy++) {
    for (let dx = -rClaim; dx <= rClaim; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nKey = tileKey(y + dy, x + dx);
      const tile = payload.data[nKey];
      if (!tile) return null; // incomplete neighbourhood
      if (!isClaimable(tile, nKey, idx, settings)) continue;
      out.push({ dx, dy, food: foodOf(tile), key: nKey, i: tile.i });
    }
  }
  return out;
}
