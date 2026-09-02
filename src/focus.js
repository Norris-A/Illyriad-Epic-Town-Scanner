// One named tile through the same engine the scan runs.
//
// Nothing here computes: it resolves the three things a plan needs that a single
// tile does not carry — an allocation, a radius, a neighbourhood — and hands them
// to prepareSite. isCandidateSite is deliberately not called; a tile the scan
// would exclude is one this is expected to answer for.
//
// DOM-free like the rest of the engine, so it is testable under Node.

import { PLOT_KEYS, PLOT_TOTAL } from './constants.js';
import {
  indexPayload, tileKey, parseRs, collectNeighbourhood, isSettleable,
} from './payload.js';
import { prepareSite, planSiteAt, scoreSiteFrom, claimUpkeep, distance } from './scoring.js';

/** Where the slider starts. Not a game constant — nothing derives from it. */
export const FOCUS_DEFAULT_TAX = 60;

/** The lowest tax the input accepts, matching the T_min field's range. */
export const FOCUS_TAX_FLOOR = -100;

export const DEFAULT_FOCUS = {
  x: null,
  y: null,
  radius: null,          // null follows R_claim from the city configuration
  tax: FOCUS_DEFAULT_TAX,
  // On, because the tile as you intend to terraform it is the usual question
  // here; its ratings today describe ground nobody is going to leave alone.
  useConfiguredPlots: true,
  // Off by default, because it only means anything on a tile that is already
  // yours, and the common case here is unsettled ground.
  preserveSovereignty: false,
};

function toInt(raw, { min = -Infinity, max = Infinity, fallback = null } = {}) {
  const n = Number(String(raw ?? '').trim());
  if (String(raw ?? '').trim() === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/**
 * Read the four inputs. Only the coordinates can fail; the rest fall back rather
 * than erroring, and a blank radius resolves later rather than clamping to 1.
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
      // Blank tracks the configuration; a number overrides it for this run only.
      radius: toInt(raw?.radius, { min: 1, max: 6, fallback: null }),
      // Whole points only, since the game accepts no other rate — a fractional
      // request would answer a question the user cannot act on.
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
 * `rs` as a plot allocation, or null when it is not one. Water and other
 * unsettleable terrain carry ratings that do not total PLOT_TOTAL, and computeK
 * would take those food plots at face value.
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

/**
 * Which allocation to plan on, with a line saying which — it feeds computeK, so
 * every figure downstream depends on which of the three branches ran.
 */
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
 * The `s` block's level field reads "<level>|?". Null where it does not parse:
 * charging a claim the wrong level is worse than not charging it.
 */
export function claimLevel(claim) {
  const n = Number(String(claim?.s ?? '').split('|')[0]);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * Your own claims inside the radius, which the city pays for whatever the plan
 * does next.
 *
 * Level and distance are the whole of a claim's bill, and both are in the
 * payload, so what a kept claim COSTS is always knowable. What it PRODUCES is
 * not: the block's building field is usually "Unknown", so a kept Farmstead's
 * food cannot be credited. The caller says so rather than guessing.
 *
 * @returns {{claims: object[], rp: number, unknownLevel: number}} `rp` is the
 *   hourly research the kept claims already spend
 */
export function keptClaims({ payload, centre, radius, idx, chancery }) {
  const claims = [];
  let rp = 0;
  let unknownLevel = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const key = tileKey(centre.y + dy, centre.x + dx);
      const claim = idx.claims.get(key);
      if (!claim || claim.rd !== 'Yours') continue;
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
  return { claims, rp, unknownLevel };
}

/** Reported, never branched on — the caller only renders these. */
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
 *   - `no-payload`   the game has not been observed sending map data yet
 *   - `centre-missing` the named tile is outside what it did send
 *   - `incomplete`   part of the claim radius is outside what it did send
 *
 * `incomplete` carries a count where the scan's equivalent carries nothing: the
 * user can pan and retry, so the number is worth returning.
 *
 * On success `ctx` is the prepared site, kept so the caller can re-plan at any
 * tax without rebuilding the knapsack.
 */
export function focusSite({ payload, focus, settings }) {
  if (!payload || !payload.data) {
    return {
      ok: false,
      reason: 'no-payload',
      message: 'No map payload observed yet. Pan or zoom the map, then try again.',
    };
  }

  const radius = focusRadius(focus, settings);
  const key = tileKey(focus.y, focus.x);
  const centre = payload.data[key];
  if (!centre) {
    return {
      ok: false,
      reason: 'centre-missing',
      message: `${focus.x}|${focus.y} is not in the last map payload. `
        + 'Pan the map over that tile, then try again.',
    };
  }

  const idx = indexPayload(payload);
  const rs = parseRs(centre);
  const { plots, source: plotSource, note: plotNote } = resolvePlots(focus, settings, rs);
  let effective = { ...settings, plots, rClaim: radius };

  // Charged as a research minimum, which is what it is — research the plan may
  // not spend — so ceiling, knapsack budget and balance all read it off the one
  // field instead of three that could disagree. `keptClaimRp` is the gold half.
  //
  // Keeping a claim and treating it as free ground are opposite instructions, so
  // preserving overrides ownClaimsAvailable rather than combining with it.
  const kept = focus.preserveSovereignty
    ? keptClaims({ payload, centre: focus, radius, idx, chancery: !!settings.chancery })
    : { claims: [], rp: 0, unknownLevel: 0 };
  if (focus.preserveSovereignty) {
    effective = {
      ...effective,
      ownClaimsAvailable: false,
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
        + `${focus.x}|${focus.y} are outside the last map payload. Pan the map so the whole `
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

  // Clamped, not rejected: planSiteAt returns null above the ceiling, so an
  // out-of-range request would otherwise lose the plan that answers it.
  const ceiling = base.tMax;
  const floor = Math.min(settings.tMin ?? 0, ceiling);
  const requested = focus.tax;
  const tax = Math.min(ceiling, Math.max(floor, requested));
  const plan = planSiteAt(ctx, tax) ?? base;

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
    // Both kept so the caller can re-plan this site without a tile, which needs
    // the settings this plan was made with — the pane overrides two of them.
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
    // Set when the clamp above moved the tax; `plan` is then at `ceiling`.
    aboveCeiling: requested > ceiling + 1e-9,
    ceiling,
    floor,
  };
}
