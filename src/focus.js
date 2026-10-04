// The Optimal Sovereignty planner: one named tile through the scan's engine.
// It resolves the allocation, radius and neighbourhood, then hands them to
// prepareSite. isCandidateSite is not called: a tile the scan would exclude can
// still be planned here.

import { PLOT_KEYS, PLOT_TOTAL } from './constants.js';
import {
  indexPayload, tileKey, parseRs, collectNeighbourhood, isSettleable, claimLevel,
  townIdentity, isTownsClaim,
} from './payload.js';
import {
  prepareSite, planSiteAt, scoreSiteFrom, claimUpkeep, chanceryFactor, distance,
} from './scoring.js';

export const FOCUS_DEFAULT_TAX = 60;

export const FOCUS_TAX_FLOOR = 0;

export const DEFAULT_FOCUS = {
  x: null,
  y: null,
  radius: null,          // null follows R_claim from the city configuration
  tax: FOCUS_DEFAULT_TAX,
  useConfiguredPlots: true,
  preserveSovereignty: false,
};

function toInt(raw, { min = -Infinity, max = Infinity, fallback = null } = {}) {
  const n = Number(String(raw ?? '').trim());
  if (String(raw ?? '').trim() === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Read the form's inputs. Only the coordinates can fail; a blank radius stays
 * null and follows R_claim.
 *
 * @param {object} raw as typed
 * @returns {{focus: object, errors: string[]}}
 */
export function parseFocus(raw) {
  const errors = [];
  const x = toInt(raw?.x);
  const y = toInt(raw?.y);
  if (x === null || y === null) errors.push('Enter the tile coordinates as x and y.');
  return {
    focus: {
      x,
      y,
      radius: toInt(raw?.radius, { min: 1, max: 6, fallback: null }),
      // Whole points only: the game accepts no other rate.
      tax: toInt(raw?.tax, { min: FOCUS_TAX_FLOOR, max: 100, fallback: FOCUS_DEFAULT_TAX }),
      useConfiguredPlots: !!raw?.useConfiguredPlots,
      preserveSovereignty: !!raw?.preserveSovereignty,
    },
    errors,
  };
}

/** Resolve a blank radius against R_claim. */
export function focusRadius(focus, settings) {
  return focus?.radius ?? Math.round(settings?.rClaim ?? 2);
}

/**
 * `rs` as a plot allocation, or null when it does not total PLOT_TOTAL, as on
 * water and other unsettleable terrain.
 */
function plotsFromRs(rs) {
  if (!rs) return null;
  const plots = {};
  let total = 0;
  for (const key of PLOT_KEYS) {
    const v = rs[key];
    if (!Number.isFinite(v) || v < 0) return null;
    plots[key] = Math.round(v);
    total += plots[key];
  }
  return total === PLOT_TOTAL ? plots : null;
}

/** Which allocation to plan on, with a note for the user saying which. */
export function resolvePlots(focus, settings, rs) {
  const configured = settings.plots;
  if (focus.useConfiguredPlots) {
    return {
      plots: configured,
      source: 'config',
      note: 'Planned on the plot allocation from City Configuration, not this tile’s own ratings.',
    };
  }
  const own = plotsFromRs(rs);
  if (own) {
    return {
      plots: own,
      source: 'tile',
      note: `Planned on this tile’s own ratings — ${PLOT_KEYS.map((p) => own[p]).join('|')}.`,
    };
  }
  return {
    plots: configured,
    source: 'fallback',
    note: rs
      ? `This tile’s ratings do not total ${PLOT_TOTAL} plots, so the City Configuration `
        + 'allocation was used instead.'
      : 'The payload carries no resource ratings for this tile, so the City Configuration '
        + 'allocation was used instead.',
  };
}

/**
 * The claims `town` already holds inside the radius, and their hourly cost. A
 * plan that builds on one is charged only the levels it adds. `otherTown`
 * counts claims held by another town of yours, which this one cannot use.
 *
 * @returns {{claims: object[], rp: number, unknownLevel: number,
 *   otherTown: number}} `rp` is the hourly research the kept claims already spend
 */
export function keptClaims({ payload, centre, radius, idx, chancery, town }) {
  const claims = [];
  let rp = 0;
  let unknownLevel = 0;
  let otherTown = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const key = tileKey(centre.y + dy, centre.x + dx);
      const claim = idx.claims.get(key);
      if (!claim || claim.rd !== 'Yours') continue;
      if (!isTownsClaim(claim, town)) {
        otherTown += 1;
        continue;
      }
      const level = claimLevel(claim);
      if (level === null) {
        unknownLevel += 1;
        continue;
      }
      const d = distance(dx, dy);
      const up = claimUpkeep(d, level, chancery);
      claims.push({ dx, dy, d, level, key, rp: up.rp, gold: up.gold });
      rp += up.rp;
    }
  }
  return { claims, rp, unknownLevel, otherTown };
}

function centreFacts(tile, key, idx) {
  const claim = idx.claims.get(key);
  return {
    settleable: isSettleable(tile),
    claimedBy: claim ? (claim.rd ?? 'someone') : null,
    isTown: idx.towns.has(key),
  };
}

/**
 * Plan one named tile.
 *
 * Returns `{ ok: false, reason, message }` when there is nothing to plan, where
 * `reason` is one of:
 *   - `no-payload`     there is no map data on screen to read
 *   - `centre-missing` the named tile is off screen
 *   - `incomplete`     part of the claim radius is off screen; carries a count
 *   - `unplannable`    the engine found no plan
 *
 * On success `ctx` is the prepared site, so the caller can re-plan at any tax
 * without rebuilding the knapsack.
 */
export function focusSite({ payload, focus, settings }) {
  if (!payload || !payload.data) {
    return {
      ok: false,
      reason: 'no-payload',
      message: 'No map data on screen yet. Pan or zoom the map, then try again.',
    };
  }

  const radius = focusRadius(focus, settings);
  const key = tileKey(focus.y, focus.x);
  const centre = payload.data[key];
  if (!centre) {
    return {
      ok: false,
      reason: 'centre-missing',
      message: `${focus.x}|${focus.y} is off screen. `
        + 'Pan the map over that tile, then try again.',
    };
  }

  const idx = indexPayload(payload);
  const rs = parseRs(centre);
  const { plots, source: plotSource, note: plotNote } = resolvePlots(focus, settings, rs);
  let effective = { ...settings, plots, rClaim: radius };

  // Sovereignty belongs to a town: only a town of yours on the centre has claims
  // to preserve, and only its own.
  const centreTown = idx.towns.get(key);
  const homeTown = centreTown?.rd === 'Yours' ? townIdentity(centreTown) : [];
  const preserveTown = focus.preserveSovereignty ? homeTown : [];

  // The town's own claims are usable ground either way; not keeping them means
  // laying them out again at full price.
  if (homeTown.length) effective = { ...effective, homeTown };

  // Kept claims are charged as a research minimum, so the ceiling, knapsack and
  // balance all read them from one field. `keptClaimRp` carries the gold side.
  const kept = preserveTown.length
    ? keptClaims({
      payload, centre: focus, radius, idx, chancery: chanceryFactor(settings), town: preserveTown,
    })
    : { claims: [], rp: 0, unknownLevel: 0, otherTown: 0 };
  // Counted for the note only; their cost is not charged.
  const released = homeTown.length && !preserveTown.length
    ? keptClaims({
      payload, centre: focus, radius, idx, chancery: chanceryFactor(settings), town: homeTown,
    })
    : null;
  if (preserveTown.length) {
    effective = {
      ...effective,
      preserveTown,
      keptClaimRp: kept.rp,
      resourceMinimums: {
        ...effective.resourceMinimums,
        research: (effective.resourceMinimums?.research ?? 0) + kept.rp,
      },
    };
  }

  const { neighbours, missing, ring } = collectNeighbourhood(payload, key, radius, idx, effective);
  if (missing.length) {
    return {
      ok: false,
      reason: 'incomplete',
      message: `${missing.length} of the ${ring} tiles within radius ${radius} of `
        + `${focus.x}|${focus.y} are off screen. Zoom out or pan so the whole `
        + 'area is on screen, then try again.',
      missing: missing.length,
      ring,
    };
  }

  const ctx = prepareSite({ neighbours, settings: effective });
  const base = scoreSiteFrom(ctx);
  if (!base) {
    return {
      ok: false,
      reason: 'unplannable',
      message: `Nothing could be planned at ${focus.x}|${focus.y}.`,
    };
  }

  // Clamped rather than rejected, since planSiteAt returns null above the
  // ceiling. A ceiling below 0% is planned at 0%, the lowest rate the game takes.
  const ceiling = base.tMax;
  const floor = Math.max(0, Math.min(settings.tMin ?? 0, ceiling));
  const requested = focus.tax;
  const tax = Math.max(0, Math.min(ceiling, Math.max(floor, requested)));
  const plan = planSiteAt(ctx, tax, { bestEffort: true }) ?? base;

  return {
    ok: true,
    x: focus.x,
    y: focus.y,
    key,
    radius,
    radiusFromConfig: focus.radius == null,
    rs,
    plots,
    plotSource,
    plotNote,
    centre: centreFacts(centre, key, idx),
    // Null where the centre is not a town of yours.
    preserving: !!focus.preserveSovereignty,
    preserveTown: preserveTown[0] ?? null,
    homeTown: homeTown[0] ?? null,
    // The town's own claims laid out afresh because preserving was off.
    released: released ? released.claims.length + released.unknownLevel : 0,
    // The settings this plan was made with, which differ from the form's.
    neighbours,
    settings: effective,
    kept,
    claimable: neighbours.length,
    ring,
    ctx,
    base,
    plan,
    tax,
    requestedTax: requested,
    aboveCeiling: requested > ceiling + 1e-9,
    // No tax runs this site; the plan is at 0% with a deficit.
    holdsNoTax: ceiling < 0,
    ceiling,
    floor,
  };
}
