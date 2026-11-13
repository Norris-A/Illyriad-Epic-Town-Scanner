// A plan's read-out as markup: the tax slider, the balance table, the military
// and upkeep notes, and the optimiser's headline for its tile. No DOM.

import {
  BASIC_RESOURCES, CLAIM_GOLD_PER_RP, PRODUCTION_LABEL, SOV_LEVEL_ROMAN,
} from '../constants.js';
import {
  bindingLabel, count, escapeHtml, limitHtml, MILSOV_BLOCKED_TEXT, productionLabel,
} from './format.js';
import { planGridHtml } from './grid.js';

/** What was placed, as "2× Sov II + 1× Sov I", highest level first. */
function milsovSplitText(plan) {
  const counts = new Map();
  for (const m of plan.milsov) counts.set(m.buildingLevel, (counts.get(m.buildingLevel) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, n]) => `${n}× Sov ${SOV_LEVEL_ROMAN[level - 1]}`)
    .join(' + ');
}

/**
 * The tax above which sovereignty upkeep is unaffordable, when it is below the
 * site's ceiling, or a warning when no tax can pay it.
 *
 * @returns {string} markup, or '' when there is nothing to warn about
 */
export function upkeepLimitHtml(plan) {
  if (plan?.resImpossible) {
    return `<p class="sov-flag">The settle allocation has no ${plan.resBinding} plots, so this
        upkeep cannot be paid at any tax.</p>`;
  }
  if (!Number.isFinite(plan?.resCeiling) || !(plan.resCeiling < plan.tMax)) return '';
  return `<p class="sov-hint">Upkeep limit: ${plan.resCeiling.toFixed(1)}% tax — above that, ${
    plan.resBinding} production no longer covers it.</p>`;
}

/** The plan's military sovereignty for the panel, the bonus first. */
export function milsovPlanHtml(plan) {
  if (!plan?.milsov?.length) return '';
  return `<p class="sov-mil"><b class="sov-mil-bonus">+${plan.milsovBonus}%</b>
    <span class="sov-mil-what">military unit production</span>
    <span class="sov-hint">${escapeHtml(milsovSplitText(plan))}, upkeep ${
  count(plan.milsovUpkeep)}/hr of wood, clay, iron and stone.</span></p>`;
}

/**
 * A plan's per-hour balance as rows of `{label, base, spent, value, note}`,
 * where base - spent = value. `note` names the binding ceiling's row ('binds')
 * and a deficit; `resBinding` is the basic resource a 'res' ceiling binds on.
 */
export function surplusRows(surplus, binding, resBinding) {
  if (!surplus) return [];
  // `key` indexes the surplus; `icon` names the production (research is `rp` there).
  const rows = [
    { key: 'food', icon: 'food', label: PRODUCTION_LABEL.food },
    { key: 'rp', icon: 'research', label: PRODUCTION_LABEL.research },
    { key: 'gold', icon: 'gold', label: PRODUCTION_LABEL.gold },
    ...BASIC_RESOURCES.map((res) => ({
      key: res,
      icon: res,
      label: PRODUCTION_LABEL[res],
      basic: true,
    })),
  ];
  return rows.map((r) => {
    const value = surplus[r.key] ?? 0;
    const base = surplus.base?.[r.key];
    const notes = [];
    if (binding === r.key || (binding === 'res' && r.key === resBinding)) notes.push('binds');
    if (value < 0) notes.push('deficit');
    return {
      ...r,
      value,
      base,
      spent: Number.isFinite(base) ? base - value : undefined,
      note: notes.join(', '),
    };
  });
}

/**
 * The tax slider and the plan under it, shared by a result row and the
 * optimiser. `base` is the plan at the site's ceiling, which `plan` is compared
 * against; `geom` is the grid's square and centre.
 */
export function planBlockHtml({ ctx, base, plan, floor, geom }) {
  // Whole points only, as the game accepts.
  const lowest = Math.max(0, Math.ceil(floor));
  const slider = ctx && Number.isFinite(base.tMax) && base.tMax - lowest >= 1
    ? `<div class="sov-tax" title="Drag to trade tax for sovereignty">
        <span class="sov-tax-label">Tax</span>
        <input type="range" class="sov-tax-range" min="${lowest}" max="${base.tMax}"
          step="1" value="${plan.tax}" aria-label="Tax">
        <output class="sov-tax-at">${plan.tax.toFixed(0)}%</output>
      </div>`
    : '';
  return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base, geom)}</div>`;
}

/**
 * What the plan did with the town's existing claims: what keeping them costs,
 * or how many were laid out afresh. Kept claims' buildings are costed as new.
 */
function keptNote(r) {
  if (!r?.preserving) {
    if (!r?.released) return '';
    const one = r.released === 1;
    return `Preserve Existing Sovereignty is off, so the ${r.released} claim${one ? '' : 's'} `
      + `${escapeHtml(r.homeTown)} already holds inside the radius ${one ? 'is' : 'are'} `
      + 'planned as empty ground and priced in full, as though given up and laid out again. '
      + 'Turn it on to plan around them instead.';
  }
  // Sovereignty belongs to a town: a tile with no town has none to keep.
  if (!r.preserveTown) {
    return 'Preserve Existing Sovereignty is on, but this tile carries no town — '
      + 'sovereignty belongs to a town, so there is none here to keep and the plan is drawn '
      + 'on empty ground.';
  }
  const kept = r.kept;
  const parts = [];
  if (kept.claims.length) {
    parts.push(`Keeping ${kept.claims.length} claim${kept.claims.length === 1 ? '' : 's'} `
      + `${escapeHtml(r.preserveTown)} already holds, costing `
      + `${count(Math.round(kept.rp))} research and `
      + `${count(Math.round(kept.rp * CLAIM_GOLD_PER_RP))} gold an hour, which is taken off `
      + 'the top. The plan is free to build on those squares and pays only for the levels it '
      + 'raises them by. Their buildings are costed as if new.');
  }
  if (kept.unknownLevel) {
    parts.push(`${kept.unknownLevel} more carry a level that could not be read, `
      + 'and are planned as bare ground.');
  }
  if (kept.otherTown) {
    const one = kept.otherTown === 1;
    parts.push(`${kept.otherTown} claim${one ? '' : 's'} of yours inside the radius `
      + `belong${one ? 's' : ''} to another of your towns, and ${one ? 'is' : 'are'} held `
      + "against this one on the same terms as a stranger's.");
  }
  return parts.join(' ');
}

/** Who holds sovereignty on a tile, from its claim's `rd` ("Confed " has a trailing space). */
export function claimHolderText(rd) {
  const holder = {
    Yours: 'One of your towns',
    Alliance: 'An alliance member',
    Confed: 'A confederate',
  }[String(rd ?? '').trim()] ?? 'Another player';
  return `${holder} holds sovereignty on this tile.`;
}

/** One focusSite result: its headline chips, warnings and notes, then the plan. */
export function focusResultHtml(r) {
  const notes = [r.plotNote, keptNote(r)].filter(Boolean);
  // Warnings only; the plan is still shown. A town's own tile is planned on
  // purpose, so it is not warned about.
  const warnings = [];
  if (!r.centre.isTown) {
    if (!r.centre.settleable) {
      warnings.push('This tile cannot be settled, so the plan below is for analysis only.');
    }
    if (r.centre.claimedBy) warnings.push(claimHolderText(r.centre.claimedBy));
  }

  const ceiling = r.holdsNoTax
    ? `<p class="sov-warn">This tile holds no tax — its ceiling is ${
      r.ceiling.toFixed(0)}%, limited by ${
      escapeHtml(bindingLabel(r.base.binding).toLowerCase())}.</p>`
    : '';
  const chips = [
    r.holdsNoTax ? '' : `<span class="sov-chip" title="Highest tax this tile holds on food alone">max <b>${
      r.base.tMax.toFixed(0)}%</b>${limitHtml(r.base)}</span>`,
    `<span class="sov-chip" title="${r.radiusFromConfig ? 'From City Configuration' : 'As set above'}">radius ${
      r.radius}</span>`,
    `<span class="sov-chip" title="How many of the ${r.ring} surrounding tiles are claimable">${
      r.claimable}/${r.ring} claimable</span>`,
  ].join('');
  const asked = r.holdsNoTax
    ? ''
    : r.aboveCeiling
      ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(0)}% — the plan below `
        + `is at its ceiling of ${r.ceiling.toFixed(0)}%.</p>`
      : '';

  // The caller mounts the plan block into the empty div.
  return `<div class="sov-result-h"><span class="sov-xy-big">${r.x}|${r.y}</span>${chips}</div>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join('')}
    ${ceiling}${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join('')}
    ${asked}
    <div class="sov-plan-block"></div>`;
}

const NOTE_PILLS = {
  binds: ['limit', 'sov-pill-warn', 'The ceiling that sets the tax: this production runs out first'],
  deficit: ['deficit', 'sov-pill-bad', 'The plan spends more than the city makes'],
};

function notePills(note) {
  return note.split(', ').filter((n) => NOTE_PILLS[n]).map((n) => {
    const [text, cls, title] = NOTE_PILLS[n];
    return ` <span class="sov-pill ${cls}" title="${title}">${text}</span>`;
  }).join('');
}

/** Spent as a share of produced, as a bar with both figures; amber near the whole. */
function useCellHtml(r) {
  if (!Number.isFinite(r.base)) return '<td class="sov-use"></td>';
  const share = r.base > 0 ? Math.min(1, Math.max(0, r.spent / r.base)) : 0;
  const cls = r.value < 0 ? ' sov-bar-over' : share >= 0.95 ? ' sov-bar-full' : '';
  return `<td class="sov-use"><div class="sov-bar${cls}"><i style="width:${(share * 100).toFixed(1)}%"></i></div>
    <span class="sov-use-txt">${count(Math.round(r.spent))} of ${count(Math.round(r.base))}</span></td>`;
}

/**
 * Everything about one plan at its tax, rendered from the plan alone so the
 * slider can replace it whole. `base` is the plan at the site's ceiling, to
 * say what the lower tax bought and cost.
 */
export function detailBodyHtml(plan, base, geom) {
  // Below the site's highest tax nothing has run out yet.
  const atCeiling = plan.tax >= base.tMax;
  const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null, plan.resBinding);
  const num = (v) => (Number.isFinite(v) ? count(Math.round(v)) : '');
  const balance = rows.length
    ? `<table class="sov-balance"><thead><tr><th>At ${plan.tax.toFixed(0)}% Tax</th>
        <th class="sov-use" title="What the plan and your buildings spend, against what the city produces">Spent of produced</th>
        <th>Net</th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${productionLabel(r.icon)}${notePills(r.note)}</td>${useCellHtml(r)}
        <td class="${r.value < 0 ? 'sov-bad' : 'sov-ok'}">${num(r.value)}</td></tr>`).join('')}</tbody></table>`
    : '';
  // The Spent figures include the city's buildings, so their share is named.
  const buildings = BASIC_RESOURCES.filter((res) => plan.surplus?.buildingUpkeep?.[res] > 0)
    .map((res) => `${num(plan.surplus.buildingUpkeep[res])} ${PRODUCTION_LABEL[res].toLowerCase()}`);
  const buildingNote = buildings.length
    ? `<p class="sov-hint">Spent includes ${buildings.join(', ')} per hour for your city's buildings.</p>`
    : '';

  const milPlan = plan.milsov.length
    ? milsovPlanHtml(plan)
    : plan.milsovBlocked
      ? `<p class="sov-flag">No military sovereignty fits at this tax — ${
        escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? 'nothing was left over')}.</p>`
      : '';

  const res = upkeepLimitHtml(plan);

  // What this tax cost against the plan at the ceiling.
  const claimDelta = plan.tiles.length - base.tiles.length;
  const goldDelta = Math.round(plan.goldNet - base.goldNet);
  const delta = (v) => `${v >= 0 ? '+' : ''}${count(v)}`;
  const trade = plan.tax < base.tMax - 0.05
    ? `<p class="sov-hint">Against the ${base.tMax.toFixed(1)}% ceiling, which fits ${
      base.milsovBonus ? `+${base.milsovBonus}%` : 'no military bonus'}: ${
      delta(claimDelta)} food claims, ${delta(goldDelta)} gold/hr.</p>`
    : '';

  const short = plan.holds === false
    ? `<p class="sov-flag">Plan shown at ${plan.tax.toFixed(0)}% tax.</p>`
    : '';

  // Balance first, right under the slider; the tall grid last.
  return `${short}${balance}${buildingNote}${milPlan}${res}${trade}${planGridHtml(plan, geom)}`;
}
