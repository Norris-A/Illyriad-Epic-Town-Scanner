// Side panel UI. v1 is panel-only; the map overlay is v2 and
// deliberately deferred (it couples to the game DOM and will break).
//
// Coordinates are DISPLAYED as "x|y" to match in-game convention, even though
// payload keys are "y|x". Convert at the boundary, never in the middle.
//
// Everything above createPanel is DOM-free on purpose: the settings spec, the
// validators and the CSV writer are all importable (and tested) under Node.
// createPanel is the only function in this file that touches `document`.

import {
  CITY_PROFILES,
  DEFAULT_SETTINGS,
  FLOUR_MILL_L20,
  NATURES_BOUNTY_BY_RETREATS,
  FAMINE_MANAGEMENT,
  SOIL_ENRICHMENT,
  MILSOV_STRUCTURES,
  SOV_LEVEL_ROMAN,
  BASIC_RESOURCES,
  RESOURCE_BOOSTERS,
  RESOURCE_BOOSTER_BONUS,
  PLOT_KEYS,
  PLOT_TOTAL,
} from './constants.js';
import {
  computeBOther,
  computeK,
  computeBasicYield,
  sovStructure,
  structureUpkeep,
  prepareSite,
  planSiteAt,
} from './scoring.js';
import {
  DEFAULT_FOCUS,
  FOCUS_DEFAULT_TAX,
  FOCUS_TAX_FLOOR,
  parseFocus,
  focusSite,
} from './focus.js';

const CSS = `
/* The panel is injected into the host page, so its elements are also matched by
   the game's own stylesheet. A colour inherited from the panel root loses to any
   rule the host sets on h2, table or td, which is what turned the heading and the
   results table dark red. Every element gets its own colour and font here, and
   this block is first so the specific rules below still win. */
.sov-panel,.sov-panel *{color:#e6e6e6;background:transparent;text-shadow:none;
  text-transform:none;letter-spacing:normal;font:12px/1.4 system-ui,sans-serif}
.sov-panel{position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow:auto;
  z-index:99999;background:#1b1b1b;border-left:1px solid #444;
  box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-panel h2{margin:0;padding:8px 10px;font-size:13px;font-weight:600;color:#fff;
  background:#2a2a2a;cursor:pointer}
.sov-body{padding:8px 10px}
.sov-panel table{width:100%;border-collapse:collapse}
.sov-panel th,.sov-panel td{padding:2px 4px;border-bottom:1px solid #333;text-align:right}
.sov-panel th{font-weight:600;color:#b9c4b9}
.sov-panel th:first-child,.sov-panel td:first-child{text-align:left}
.sov-panel button{background:#3a5;color:#fff;border:0;padding:5px 10px;cursor:pointer}
.sov-panel button.sec{background:#444}
.sov-panel button[disabled]{background:#333;color:#888;cursor:not-allowed}
.sov-row{cursor:pointer}
.sov-detail{background:#222;font-size:11px}
.sov-flag{color:#e94}
.sov-collapsed .sov-body{display:none}
.sov-selected>td{background:#243}
.sov-form fieldset{border:1px solid #333;margin:0 0 8px;padding:4px 8px 6px}
.sov-form legend{color:#9c9;padding:0 4px}
.sov-form input,.sov-form select{background:#111;color:#ddd;border:1px solid #444;
  padding:1px 3px;font:inherit}
.sov-f{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:3px 0}
.sov-f>span{flex:1}
.sov-f input[type=number]{width:76px;text-align:right}
.sov-f select{max-width:170px}
.sov-gated{opacity:.4}
.sov-plot-fields{display:flex;gap:4px;margin:2px 0}
.sov-plot-fields label{flex:1;text-align:center;font-size:10px;color:#b5b5b5}
.sov-plot-fields input{width:100%;text-align:center}
.sov-plot-sum{display:flex;justify-content:space-between;align-items:center;gap:6px}
.sov-bad{color:#e66;font-weight:bold}
.sov-ok{color:#6c6}
.sov-derived{margin:2px 0 0;padding-left:16px;font-size:11px}
.sov-derived .sov-off{color:#888}
.sov-derived .sov-on{color:#6c6}
.sov-hint{color:#a9a9a9;font-size:11px;margin:2px 0}
.sov-build{color:#888;font-size:10px;font-weight:normal}
.sov-tax{margin:6px 0;padding-top:4px;border-top:1px solid #333}
.sov-tax input[type=range]{width:190px}
.sov-tax output{color:#6bf;font-variant-numeric:tabular-nums}
.sov-balance{margin:4px 0}
.sov-balance td:nth-child(2){font-variant-numeric:tabular-nums}
.sov-tabs{display:flex;gap:2px;margin:0 0 8px;border-bottom:1px solid #444}
.sov-tabs button{background:#2a2a2a;color:#b5b5b5;padding:5px 9px;border-bottom:2px solid transparent}
.sov-tabs button.on{background:#333;color:#fff;border-bottom-color:#3a5}
.sov-xy{display:flex;gap:4px}
.sov-xy input{width:60px;text-align:right}
.sov-focus-out h3{margin:8px 0 2px;font-size:12px;font-weight:600;color:#fff}
.sov-note{color:#a9a9a9;font-size:11px;margin:2px 0}
.sov-warn{color:#e66;font-weight:bold;font-size:11px;margin:2px 0}
`;

// --- Settings model ---------------------------------------------------------

// Both live in constants.js so focus.js can read an allocation without importing
// the UI module; re-exported here because this is where the form and its tests
// have always reached for them.
export { PLOT_KEYS, PLOT_TOTAL };

/**
 * Read one number out of a form field. Blank (or unparseable) falls back rather
 * than clamping, so an empty box means "the default", not "the minimum".
 */
export function clampNumber(raw, { min = -Infinity, max = Infinity, integer = false, fallback = 0 } = {}) {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim());
  if (String(raw ?? '').trim() === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, integer ? Math.round(n) : n));
}

/**
 * Validate a settle plot allocation. Each entry is clamped to an integer 0..25;
 * the total is reported rather than corrected, since rebalancing it would mean
 * choosing which of the other four plots to take from.
 *
 * @param {object} raw the five plot values, as typed
 * @returns {{plots: object, total: number, ok: boolean, message: string}}
 *   message reads like "2 short" or "5 over", and is empty when ok
 */
export function validatePlots(raw) {
  const plots = {};
  let total = 0;
  for (const key of PLOT_KEYS) {
    plots[key] = clampNumber(raw?.[key], { min: 0, max: PLOT_TOTAL, integer: true, fallback: 0 });
    total += plots[key];
  }
  const diff = total - PLOT_TOTAL;
  return {
    plots,
    total,
    ok: diff === 0,
    message: diff === 0 ? '' : diff > 0 ? `${diff} over` : `${-diff} short`,
  };
}

/**
 * Read the military structure choice. Blank is "none", which is a food-only
 * scan; anything the structure table does not know is refused rather than
 * silently charged as the default, since the only way to type one here is for
 * the picker and the table to have drifted apart.
 */
export function parseMilsovStructure(raw) {
  const key = String(raw ?? '').trim();
  return MILSOV_STRUCTURES.some((s) => s.key === key) ? key : null;
}

/**
 * The plan's military sovereignty, in one line — the count, the level split and
 * what it costs per hour. Levels descend, since that is the order the plan puts
 * them on the tiles.
 */
export function milsovPlanText(plan) {
  if (!plan?.milsov?.length) return '';
  const counts = new Map();
  for (const m of plan.milsov) counts.set(m.buildingLevel, (counts.get(m.buildingLevel) ?? 0) + 1);
  const split = [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, count]) => `${count}x Sov ${SOV_LEVEL_ROMAN[level - 1]}`)
    .join(' + ');
  return `${split} — +${plan.milsovBonus}% production, ${
    (plan.milsovUpkeep ?? 0).toLocaleString('en-GB')}/hr of each of wood, clay, iron and stone.`;
}

/** Why a site got no military sovereignty, in the user's terms. */
export const MILSOV_BLOCKED_TEXT = {
  tiles: 'every claimable tile went to the food plan',
  slots: 'the food plan used every building slot',
  upkeep: 'the city produces too little wood, clay, iron or stone to run one',
  rp: 'the food plan spent the research this site produces',
};

/**
 * The per-hour balance of a plan, as rows of `{label, base, value, note}`.
 * `base` is the row's production before the plan spends it.
 *
 * Everything is stated at the plan's own tax, so the ceiling that binds reads 0
 * — that is the arithmetic checking itself in front of the user, not a rounding
 * artefact. Zero is therefore the figure to read, not a deficit: while every
 * ceiling is applied nothing can go negative, since a lower tax only produces
 * more. The deficit note is kept for a ceiling that was reported but not
 * applied, which is the only way a plan can be shown outspending the city.
 */
export function surplusRows(surplus, binding) {
  if (!surplus) return [];
  const rows = [
    { key: 'food', label: 'Food' },
    { key: 'rp', label: 'Research' },
    ...BASIC_RESOURCES.map((res) => ({
      key: res,
      label: `${res[0].toUpperCase()}${res.slice(1)}`,
      basic: true,
    })),
  ];
  return rows.map((r) => {
    const value = surplus[r.key] ?? 0;
    const base = surplus.base?.[r.key];
    const notes = [];
    // The ceiling that set the tax is at 0 by construction; say which it was so
    // a row of zero does not read as a failure to compute.
    if (binding === r.key || (binding === 'res' && r.basic && Math.abs(value) < 0.5)) {
      notes.push('binds');
    }
    if (value < 0) notes.push('deficit');
    if (r.basic && surplus.indicative) notes.push('indicative');
    return { ...r, value, base, note: notes.join(', ') };
  });
}

/**
 * How a site's resource ceiling should read on its row, in the case where the
 * engine reported it without applying it.
 *
 * A ceiling left out of the ranking is the right call for ranking and the wrong
 * one for silence: a site whose military sovereignty is unaffordable would
 * otherwise sit in the table looking clean. So the row says so, and says that it
 * did not affect the ranking. An applied ceiling needs none of this — it is in
 * the tax the row shows, and the Limiter column already names it.
 *
 * Returns null when there is nothing to report — an applied ceiling, no
 * structure asked for, or one above the tax the site reaches, where the upkeep
 * is covered.
 *
 * @returns {{text: string, title: string} | null}
 */
export function resFlag(r) {
  if (!r?.resIndicative) return null;
  const caveat = 'Indicative only — per-plot yields for wood, clay, iron and '
    + 'stone are unmeasured, so this figure does not affect the ranking.';
  if (r.resImpossible) {
    return {
      text: `no ${r.resBinding}`,
      title: `The settle allocation has no ${r.resBinding} plots, so the milsov `
        + `upkeep cannot be paid at any tax rate. ${caveat}`,
    };
  }
  if (!(r.resCeiling < r.tMax - 1e-9)) return null;
  return {
    text: `res ${r.resCeiling.toFixed(1)}%`,
    title: `Milsov upkeep exhausts ${r.resBinding} above ${r.resCeiling.toFixed(1)}% tax, `
      + `below this site's ${r.tMax.toFixed(1)}%. ${caveat}`,
  };
}

/**
 * Read the RP calibration override. A blank or zero reading means "not
 * calibrated" and returns null, leaving computeRRef on its library estimate.
 * The tax is clamped to 0..100 because R_ref divides by (125 - atTax).
 */
export function parseRpCalibration(observed, atTax) {
  const rp = clampNumber(observed, { min: 0, fallback: 0 });
  if (rp <= 0) return null;
  return { observedRpPerHour: rp, atTax: clampNumber(atTax, { min: 0, max: 100, fallback: 0 }) };
}

/**
 * Read the basic-resource yield calibration. One reading is enough for all four,
 * since they share a per-plot yield — so it asks for the reading's own plot
 * count and booster state rather than borrowing the settle allocation, which
 * describes the site being planned and not the city the reading came from.
 *
 * A reading without plots cannot be divided and is treated as absent, which
 * falls back to the default yield rather than to nothing.
 */
export function parseResourceCalibration({ observed, atTax, plots, booster }) {
  const perHour = clampNumber(observed, { min: 0, fallback: 0 });
  const p = clampNumber(plots, { min: 0, max: PLOT_TOTAL, integer: true, fallback: 0 });
  if (perHour <= 0 || p <= 0) return null;
  return {
    observedPerHour: perHour,
    atTax: clampNumber(atTax, { min: 0, max: 100, fallback: 0 }),
    plots: p,
    booster: !!booster,
  };
}

/** Read the four booster tick-boxes, defaulting each to off. */
export function parseResourceBoosters(raw) {
  const out = {};
  for (const res of BASIC_RESOURCES) out[res] = !!raw?.[res];
  return out;
}

/**
 * One control per setting, declared once. The keys here and the keys of
 * DEFAULT_SETTINGS must match exactly, which a test asserts, so constants.js
 * stays the single list of settings.
 *
 * `enabledWhen` disables a control whose precondition is off, rather than
 * leaving it editable but ignored.
 */
export const SETTINGS_FIELDS = [
  { key: 'tMin', group: 'Ranking', label: 'Minimum tax T_min (%)', type: 'number', min: -100, max: 100 },

  { key: 'plots', group: 'Settle tile', label: 'Settle plot allocation', type: 'plots' },

  {
    key: 'cityProfile',
    group: 'City food',
    label: 'City profile',
    type: 'select',
    options: [
      ...Object.entries(CITY_PROFILES).map(([value, c]) => ({
        value,
        label: `${value[0].toUpperCase()}${value.slice(1)} (C = ${c.toLocaleString('en-GB')})`,
      })),
      { value: 'custom', label: 'Custom total' },
    ],
  },
  {
    key: 'cityConsumptionOverride',
    group: 'City food',
    label: 'Custom consumption C',
    type: 'number',
    min: 1,
    max: 1e6,
    integer: true,
    fallback: CITY_PROFILES.standard,
    enabledWhen: (s) => s.cityProfile === 'custom',
  },
  { key: 'flourMill', group: 'City food', label: `Flour Mill L20 (+${FLOUR_MILL_L20})`, type: 'checkbox' },
  { key: 'naturesBounty', group: 'City food', label: "Nature's Bounty", type: 'checkbox' },
  {
    key: 'geomancerRetreats',
    group: 'City food',
    label: 'Geomancer retreats',
    type: 'select',
    parse: 'number',
    options: NATURES_BOUNTY_BY_RETREATS.map((bonus, n) => ({ value: n, label: `${n} (+${bonus})` })),
    enabledWhen: (s) => !!s.naturesBounty,
  },
  { key: 'cityCount', group: 'City food', label: 'City count', type: 'number', min: 1, max: 999, integer: true, fallback: 1 },
  { key: 'isCapital', group: 'City food', label: 'This city is the capital', type: 'checkbox' },
  { key: 'otherFoodBonus', group: 'City food', label: 'Other food bonus (+)', type: 'number', min: -500, max: 500 },

  { key: 'libraryLevel', group: 'Research', label: 'Library level', type: 'number', min: 0, max: 20, integer: true, fallback: 20 },
  { key: 'allembine', group: 'Research', label: 'Allembine Research', type: 'checkbox' },
  { key: 'overflowingInsight', group: 'Research', label: 'Overflowing Insight (x1.5)', type: 'checkbox' },
  { key: 'rpCalibration', group: 'Research', label: 'RP calibration override', type: 'calibration' },

  {
    key: 'resourceBoosters',
    group: 'Basic resources',
    label: 'Booster buildings at L20',
    type: 'boosters',
  },
  {
    key: 'resourceCalibration',
    group: 'Basic resources',
    label: 'Per-plot yield calibration',
    type: 'resourceCalibration',
  },

  { key: 'chancery', group: 'Sovereignty', label: 'Chancery of Estates (x0.6 upkeep)', type: 'checkbox' },
  { key: 'rClaim', group: 'Sovereignty', label: 'Claim radius R_claim', type: 'number', min: 1, max: 6, integer: true, fallback: 2 },
  { key: 'maxBuildings', group: 'Sovereignty', label: 'Max buildings', type: 'number', min: 0, max: 200, integer: true, fallback: 20 },
  { key: 'milsovStructure', group: 'Sovereignty', label: 'Military structure', type: 'milsov' },
  {
    key: 'milsovMinBonus',
    group: 'Sovereignty',
    label: 'Minimum military bonus (%)',
    type: 'number',
    min: 0,
    max: 1000,
    integer: true,
    fallback: 0,
    enabledWhen: (s) => !!s.milsovStructure,
  },

  { key: 'dOther', group: 'Neighbours', label: 'Min distance, other players', type: 'number', min: 0, max: 100 },
  { key: 'dOwn', group: 'Neighbours', label: 'Min distance, own cities', type: 'number', min: 0, max: 100 },
  { key: 'ownClaimsAvailable', group: 'Neighbours', label: 'Treat own claims as available', type: 'checkbox' },
  { key: 'allianceClaimsAvailable', group: 'Neighbours', label: 'Treat alliance claims as available', type: 'checkbox' },
];

// --- Form markup (strings only — no DOM until createPanel) ------------------

function attr(name, v) {
  return v === undefined || v === null ? '' : ` ${name}="${escapeHtml(v)}"`;
}

function numberFieldHtml(f, value) {
  return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <input type="number" data-key="${f.key}"${attr('min', f.min)}${attr('max', f.max)}
      step="${f.integer ? 1 : 'any'}"${attr('value', value)}></label>`;
}

function selectFieldHtml(f, value) {
  const opts = f.options.map((o) =>
    `<option value="${escapeHtml(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
  return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <select data-key="${f.key}">${opts}</select></label>`;
}

function checkboxFieldHtml(f, value) {
  return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <input type="checkbox" data-key="${f.key}"${value ? ' checked' : ''}></label>`;
}

function plotsFieldHtml(f, plots) {
  const fields = PLOT_KEYS.map((p) =>
    `<label>${p}<input type="number" data-plot="${p}" min="0" max="${PLOT_TOTAL}" step="1"
      value="${plots?.[p] ?? 0}"></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — wood/clay/iron/stone/food, must sum to ${PLOT_TOTAL}.
        Terraforming applies to the settle tile only.</p>
      <div class="sov-plot-fields">${fields}</div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from selected tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
}

function calibrationFieldHtml(f, cal) {
  return `<div class="sov-f-block" data-key="${f.key}">
      <div class="sov-f"><span>${escapeHtml(f.label)} — observed RP/hr</span>
        <input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr('value', cal?.observedRpPerHour)}></div>
      <div class="sov-f"><span>…at tax (%)</span>
        <input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}"></div>
    </div>`;
}

/** One tick-box per booster, named after the building the user would recognise. */
function boostersFieldHtml(f, boosters) {
  const boxes = BASIC_RESOURCES.map((res) =>
    `<label class="sov-f" data-booster-row="${res}"><span>${RESOURCE_BOOSTERS[res]} — ${res}
      (+${RESOURCE_BOOSTER_BONUS})</span>
      <input type="checkbox" data-booster="${res}"${boosters?.[res] ? ' checked' : ''}></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — each adds ${RESOURCE_BOOSTER_BONUS} points to that
        resource's production, the same way the Flour Mill adds to food, and so is
        worth ${RESOURCE_BOOSTER_BONUS} points of tax headroom against its ceiling.</p>
      ${boxes}
    </div>`;
}

/**
 * The yield reading. Everything the back-solve needs travels with the reading
 * itself, so a figure copied off a city that is not the one being planned still
 * divides out correctly.
 */
function resourceCalibrationFieldHtml(f, cal) {
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — optional. The default yield is measured, so
        this is only for a city that reads differently; one reading from any city
        fixes all four resources. Read an hourly rate off the city, then say what
        produced it.</p>
      <div class="sov-f"><span>Observed /hr of one resource</span>
        <input type="number" data-res-cal="observed" min="0" step="any"
          placeholder="blank = off"${attr('value', cal?.observedPerHour)}></div>
      <div class="sov-f"><span>…at tax (%)</span>
        <input type="number" data-res-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}"></div>
      <div class="sov-f"><span>…from this many plots</span>
        <input type="number" data-res-cal="plots" min="0" max="${PLOT_TOTAL}" step="1"
          value="${cal?.plots ?? 0}"></div>
      <div class="sov-f"><span>…with that booster at L20</span>
        <input type="checkbox" data-res-cal="booster"${cal?.booster ? ' checked' : ''}></div>
      <p class="sov-hint sov-yield-read"></p>
    </div>`;
}

/**
 * Which military structure to place — the only thing about military sovereignty
 * the user still sets. How many, at what levels and on which squares is the
 * engine's answer, since it depends on what the food plan left behind and that
 * differs at every site.
 *
 * Only Production Structures are offered. A Resource Structure has no hourly
 * upkeep, so nothing would stop the search claiming every spare tile with one,
 * while the host tile's resource rating that would justify it is not scored.
 */
function milsovFieldHtml(f, structure) {
  const opts = MILSOV_STRUCTURES.map((s) =>
    `<option value="${s.key}"${s.key === structure ? ' selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <label class="sov-f"><span>${escapeHtml(f.label)}</span>
        <select data-key="${f.key}" title="Which structure to place on the tiles the food plan leaves free">
          <option value=""${structure ? '' : ' selected'}>None — food only</option>${opts}</select></label>
      <p class="sov-hint">Food is planned first and sets the tax. Military sovereignty is
        then fitted into what that plan leaves over — the research it did not spend, the
        tiles it did not claim, and what the city can still afford to run — so it never
        costs the site a point of tax. Each result says how much it fitted and what one
        more point of tax would buy. The minimum below drops sites that fit less than
        you want; it does not make them fit more.</p>
    </div>`;
}

function fieldHtml(f, settings) {
  const v = settings[f.key];
  switch (f.type) {
    case 'checkbox': return checkboxFieldHtml(f, v);
    case 'select': return selectFieldHtml(f, v);
    case 'plots': return plotsFieldHtml(f, v);
    case 'calibration': return calibrationFieldHtml(f, v);
    case 'boosters': return boostersFieldHtml(f, v);
    case 'resourceCalibration': return resourceCalibrationFieldHtml(f, v);
    case 'milsov': return milsovFieldHtml(f, v);
    default: return numberFieldHtml(f, v ?? f.fallback);
  }
}

/** The whole form, grouped in declaration order. */
export function settingsFormHtml(settings) {
  const groups = [];
  for (const f of SETTINGS_FIELDS) {
    if (!groups.length || groups.at(-1).name !== f.group) groups.push({ name: f.group, fields: [] });
    groups.at(-1).fields.push(f);
  }
  const body = groups.map((g) => {
    const extra = g.fields.some((f) => f.key === 'isCapital') ? '<ul class="sov-derived"></ul>' : '';
    return `<fieldset><legend>${escapeHtml(g.name)}</legend>
      ${g.fields.map((f) => fieldHtml(f, settings)).join('')}${extra}</fieldset>`;
  }).join('');
  return `<form class="sov-form">
      ${body}
      <p class="sov-hint sov-derived-food"></p>
      <p><button type="button" class="sov-reset sec">Reset to defaults</button></p>
      <p class="sov-hint">This configuration is saved in this browser as you edit it and
        restored next time. It is applied to the map on the next Scan, and to a single
        tile on the next Optimise.</p>
      <p class="sov-hint sov-store-note"></p>
    </form>`;
}

/**
 * The optimiser's own form — the four values focusSite takes beyond the saved
 * configuration. Anything added here has to be added to readFocus and parseFocus
 * too; there is no field spec driving this one.
 */
export function focusFormHtml(focus, settings) {
  const f = { ...DEFAULT_FOCUS, ...focus };
  const rClaim = Math.round(settings?.rClaim ?? 2);
  return `<form class="sov-focus-form">
      <fieldset><legend>Tile</legend>
        <label class="sov-f"><span>Coordinates — x | y</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x"${attr('value', f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y"${attr('value', f.y)}>
          </span></label>
        <label class="sov-f"><span>Sovereignty radius</span>
          <input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr('value', f.radius)}></label>
        <p class="sov-hint">How far out sovereignty may be placed. Blank follows the claim
          radius in City Configuration, currently ${rClaim}.</p>
      </fieldset>
      <fieldset><legend>Plan</legend>
        <label class="sov-f"><span>Starting tax (%)</span>
          <input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="0.5"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}"></label>
        <label class="sov-f"><span>Use City Configuration plots</span>
          <input type="checkbox" data-focus="useConfiguredPlots"${f.useConfiguredPlots ? ' checked' : ''}></label>
        <p class="sov-hint">Off plans on the centre tile's own resource ratings, as the map
          reports them. On plans on the ${PLOT_TOTAL}-plot allocation in City Configuration —
          the tile as you intend to terraform it.</p>
      </fieldset>
      <p><button type="button" class="sov-focus-run">Optimise</button>
         <button type="button" class="sov-focus-use sec">Use selected result</button></p>
      <p class="sov-hint">Everything else — research, city food, chancery, the building cap
        and which military structure to place — comes from City Configuration. Any tile can
        be examined here, including one already settled, claimed, or too near a town.</p>
    </form>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
}

/** The two capital bonuses are derived, not stored — show why each is off. */
function capitalDerivedHtml(s) {
  return [
    ['Famine Management', FAMINE_MANAGEMENT, 10],
    ['Soil Enrichment', SOIL_ENRICHMENT, 30],
  ].map(([name, bonus, need]) => {
    const active = s.isCapital && (s.cityCount ?? 1) >= need;
    const why = !s.isCapital ? 'capital only' : `needs ${need} cities`;
    return `<li class="${active ? 'sov-on' : 'sov-off'}">${name} +${bonus} — ${
      active ? 'active' : `inactive (${why})`}</li>`;
  }).join('');
}

// --- Panel ------------------------------------------------------------------

/**
 * @param {object} o
 * @param {object} [o.initialSettings] what to open the form with, already
 *   sanitized by the caller. Defaults on first run.
 * @param {(s: object) => void} [o.onSettingsChange] fired on every committed
 *   edit with the settings as read back out of the form, including edits that
 *   fail validation — a half-finished allocation should come back as the user
 *   left it rather than be discarded.
 * @param {() => object|null} [o.getPayload] the last observed map payload, read
 *   on each Optimise press. The optimiser plans on the main thread: it is one
 *   site, and the tax slider already runs the same planner there.
 */
export function createPanel({ onScan, onExport, initialSettings, onSettingsChange, getPayload }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sov-panel';
  const opening = initialSettings ?? DEFAULT_SETTINGS;
  root.innerHTML = `
    <h2>Sovereignty Scanner <span class="sov-build"></span></h2>
    <div class="sov-body">
      <nav class="sov-tabs">
        <button type="button" data-tab="scan" class="on">Scan</button>
        <button type="button" data-tab="focus">Optimal Sovereignty</button>
        <button type="button" data-tab="config">City Configuration</button>
      </nav>
      <section data-pane="scan">
        <p><button class="sov-scan">Scan</button>
           <button class="sov-export sec">Export CSV</button></p>
        <div class="sov-status"></div>
        <div class="sov-results"></div>
        <div class="sov-incomplete"></div>
      </section>
      <section data-pane="focus" hidden>${focusFormHtml(DEFAULT_FOCUS, opening)}</section>
      <section data-pane="config" hidden>${settingsFormHtml(opening)}</section>
    </div>`;
  // Which build is actually running. Tampermonkey keeps its own copy of an
  // installed script, so a rebuilt file is not a reinstalled one — without this
  // there is no way to tell from inside the game which code is live, and an old
  // build looks exactly like a change that did not work.
  root.querySelector('.sov-build').textContent =
    typeof __BUILD_VERSION__ === 'undefined' ? 'dev' : __BUILD_VERSION__;
  document.body.appendChild(root);

  const $ = (sel) => root.querySelector(sel);
  const form = $('.sov-form');
  const scanBtn = $('.sov-scan');
  let rendered = [];       // the results currently in the table
  let selected = null;     // the row Prefill copies `rs` from

  root.querySelector('h2').addEventListener('click', () => root.classList.toggle('sov-collapsed'));
  scanBtn.addEventListener('click', onScan);
  $('.sov-export').addEventListener('click', onExport);

  // One pane at a time. The radius placeholder was baked in at build time from
  // the settings as they were then, so entering the optimiser re-reads them.
  root.querySelectorAll('.sov-tabs button').forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.dataset.tab;
      root.querySelectorAll('.sov-tabs button').forEach((t) => t.classList.toggle('on', t === tab));
      root.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== name; });
      if (name === 'focus') syncFocusRadiusHint();
    });
  });

  // --- reading the form ---

  function plotInputs() {
    const raw = {};
    for (const p of PLOT_KEYS) raw[p] = form.querySelector(`[data-plot="${p}"]`).value;
    return raw;
  }

  function readSettings() {
    const errors = [];
    const out = {};
    for (const f of SETTINGS_FIELDS) {
      switch (f.type) {
        case 'checkbox':
          out[f.key] = form.querySelector(`input[data-key="${f.key}"]`).checked;
          break;
        case 'select': {
          const v = form.querySelector(`select[data-key="${f.key}"]`).value;
          out[f.key] = f.parse === 'number' ? Number(v) : v;
          break;
        }
        case 'plots': {
          const r = validatePlots(plotInputs());
          out.plots = r.plots;
          if (!r.ok) errors.push(`Settle plots total ${r.total}, must be ${PLOT_TOTAL} (${r.message}).`);
          break;
        }
        case 'milsov':
          out.milsovStructure = parseMilsovStructure(
            form.querySelector(`select[data-key="${f.key}"]`).value,
          );
          break;
        case 'calibration':
          out.rpCalibration = parseRpCalibration(
            form.querySelector('[data-cal="observedRpPerHour"]').value,
            form.querySelector('[data-cal="atTax"]').value,
          );
          break;
        case 'boosters': {
          const raw = {};
          for (const res of BASIC_RESOURCES) {
            raw[res] = form.querySelector(`[data-booster="${res}"]`).checked;
          }
          out.resourceBoosters = parseResourceBoosters(raw);
          break;
        }
        case 'resourceCalibration':
          out.resourceCalibration = parseResourceCalibration({
            observed: form.querySelector('[data-res-cal="observed"]').value,
            atTax: form.querySelector('[data-res-cal="atTax"]').value,
            plots: form.querySelector('[data-res-cal="plots"]').value,
            booster: form.querySelector('[data-res-cal="booster"]').checked,
          });
          break;
        default:
          out[f.key] = clampNumber(form.querySelector(`input[data-key="${f.key}"]`).value, f);
      }
    }
    // A custom total only applies on the custom profile; leaving it set would
    // silently override Standard/Beer, since computeConsumption prefers it.
    if (out.cityProfile !== 'custom') out.cityConsumptionOverride = null;
    return { settings: out, errors };
  }

  // --- writing the form ---

  function writeSettings(s) {
    for (const f of SETTINGS_FIELDS) {
      const v = s[f.key];
      switch (f.type) {
        case 'checkbox':
          form.querySelector(`input[data-key="${f.key}"]`).checked = !!v;
          break;
        case 'select':
          form.querySelector(`select[data-key="${f.key}"]`).value = String(v);
          break;
        case 'plots':
          writePlots(v);
          break;
        case 'milsov':
          form.querySelector(`select[data-key="${f.key}"]`).value = v ?? '';
          break;
        case 'calibration':
          form.querySelector('[data-cal="observedRpPerHour"]').value = v?.observedRpPerHour ?? '';
          form.querySelector('[data-cal="atTax"]').value = v?.atTax ?? 0;
          break;
        case 'boosters':
          for (const res of BASIC_RESOURCES) {
            form.querySelector(`[data-booster="${res}"]`).checked = !!v?.[res];
          }
          break;
        case 'resourceCalibration':
          form.querySelector('[data-res-cal="observed"]').value = v?.observedPerHour ?? '';
          form.querySelector('[data-res-cal="atTax"]').value = v?.atTax ?? 0;
          form.querySelector('[data-res-cal="plots"]').value = v?.plots ?? 0;
          form.querySelector('[data-res-cal="booster"]').checked = !!v?.booster;
          break;
        default:
          form.querySelector(`input[data-key="${f.key}"]`).value = v ?? f.fallback ?? '';
      }
    }
    refresh();
  }

  function writePlots(plots) {
    for (const p of PLOT_KEYS) form.querySelector(`[data-plot="${p}"]`).value = plots?.[p] ?? 0;
  }

  // --- live dependencies, running total, derived read-outs ---

  // `save` is off for the refresh that lays the form out at startup — nothing
  // has been edited yet.
  function refresh({ save = true } = {}) {
    const { settings: s } = readSettings();
    if (save) onSettingsChange?.(s);

    for (const f of SETTINGS_FIELDS) {
      if (!f.enabledWhen) continue;
      const on = f.enabledWhen(s);
      const wrap = form.querySelector(`[data-key="${f.key}"]`);
      wrap.classList.toggle('sov-gated', !on);
      wrap.querySelectorAll('input,select').forEach((el) => { el.disabled = !on; });
    }

    // The running total and the K it produces, so the cost of an edit to the
    // food plots is visible while making it.
    const plots = validatePlots(plotInputs());
    const total = form.querySelector('.sov-plot-total');
    total.className = `sov-plot-total ${plots.ok ? 'sov-ok' : 'sov-bad'}`;
    total.textContent = `Total ${plots.total} / ${PLOT_TOTAL}${
      plots.ok ? '' : ` — ${plots.message}`} · K = ${computeK(plots.plots.food).toFixed(2)}`;

    form.querySelector('.sov-derived').innerHTML = capitalDerivedHtml(s);
    form.querySelector('.sov-derived-food').textContent =
      `B_other = ${computeBOther(s)} food points.`;

    // The back-solved yield, shown as it is entered — a reading that produces an
    // implausible figure is far easier to spot here than in a results row.
    const { yield: y } = computeBasicYield(s);
    form.querySelector('.sov-yield-read').textContent = s.resourceCalibration
      ? `Y = ${y.toFixed(0)}/hr per plot at L20, from your reading.`
      : `Y = ${y.toFixed(0)}/hr per plot at L20, the measured default. `
        + 'Fill this in only for a city that reads differently.';

    // An allocation that is not 25 plots is not a tile the game can produce,
    // so there is nothing to score it against — block the scan outright.
    scanBtn.disabled = !plots.ok;
    scanBtn.title = plots.ok ? '' : 'Settle plot allocation must sum to 25';
  }

  // Everything is bound here rather than with inline handlers, which the host
  // page's CSP may block. Nothing submits — the form has nowhere to submit to.
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', () => refresh());
  form.addEventListener('change', (e) => {
    // Clamp on blur/commit rather than on every keystroke — clamping mid-typing
    // turns "12" into "1" before the second digit lands.
    const el = e.target;
    if (el.dataset.plot) {
      el.value = validatePlots(plotInputs()).plots[el.dataset.plot];
    }
    refresh();
  });

  form.addEventListener('click', (e) => {
    if (e.target.closest('.sov-reset')) {
      writeSettings(DEFAULT_SETTINGS);
    } else if (e.target.closest('.sov-prefill')) {
      prefill();
    }
  });

  /**
   * Copy the selected result's actual `rs` into the five plot fields, as a
   * starting point to edit from. Nothing is committed until the next Scan.
   */
  function prefill() {
    const src = $('.sov-prefill-src');
    if (!selected || !selected.rs) {
      src.textContent = 'Click a result row first — Prefill copies that tile’s rs.';
      return;
    }
    writePlots(selected.rs);
    refresh();
    src.textContent = `Prefilled from ${selected.x}|${selected.y} (rs ${
      PLOT_KEYS.map((p) => selected.rs[p]).join('|')}).`;
  }

  function select(n) {
    selected = rendered[n] ?? null;
    root.querySelectorAll('.sov-row').forEach((r) => {
      r.classList.toggle('sov-selected', Number(r.dataset.n) === n);
    });
    if (selected) {
      $('.sov-prefill-src').textContent = selected.rs
        ? `Selected ${selected.x}|${selected.y} — rs ${PLOT_KEYS.map((p) => selected.rs[p]).join('|')}.`
        : `Selected ${selected.x}|${selected.y} — no rs in the payload for this tile.`;
    }
  }

  // --- Optimal Sovereignty ---

  const focusForm = $('.sov-focus-form');

  function syncFocusRadiusHint() {
    const { settings: s } = readSettings();
    focusForm.querySelector('[data-focus="radius"]').placeholder = String(Math.round(s.rClaim ?? 2));
  }

  function readFocus() {
    const raw = {};
    for (const key of ['x', 'y', 'radius', 'tax']) {
      raw[key] = focusForm.querySelector(`[data-focus="${key}"]`).value;
    }
    raw.useConfiguredPlots = focusForm.querySelector('[data-focus="useConfiguredPlots"]').checked;
    return raw;
  }

  function runFocus() {
    const status = $('.sov-focus-status');
    const out = $('.sov-focus-out');
    // Read at the moment of the press, as runScan does, so an edit left in the
    // config pane reaches this plan without needing to be committed first.
    const read = readSettings();
    if (read.errors.length) {
      status.textContent = read.errors.join(' ');
      out.innerHTML = '';
      return;
    }
    const { focus, errors } = parseFocus(readFocus());
    if (errors.length) {
      status.textContent = errors.join(' ');
      out.innerHTML = '';
      return;
    }

    const result = focusSite({ payload: getPayload?.(), focus, settings: read.settings });
    if (!result.ok) {
      status.textContent = result.message;
      out.innerHTML = '';
      return;
    }
    status.textContent = '';
    out.innerHTML = focusResultHtml(result);
    bindPlanBlock(out, result.ctx, result.base);
  }

  focusForm.addEventListener('submit', (e) => e.preventDefault());
  focusForm.addEventListener('click', (e) => {
    if (e.target.closest('.sov-focus-run')) {
      runFocus();
    } else if (e.target.closest('.sov-focus-use')) {
      // `selected` is the row Prefill copies rs from, set by select().
      const status = $('.sov-focus-status');
      if (!selected) {
        status.textContent = 'Select a result row on the Scan tab first.';
        return;
      }
      focusForm.querySelector('[data-focus="x"]').value = selected.x;
      focusForm.querySelector('[data-focus="y"]').value = selected.y;
      status.textContent = '';
      runFocus();
    }
  });

  refresh({ save: false });
  syncFocusRadiusHint();

  return {
    root,
    /** How the last load or save went, in the user's terms; '' clears it. */
    setStoreNote(text) {
      $('.sov-store-note').textContent = text ?? '';
    },
    /** Returns `{ settings, errors }`; a scan is refused while errors is non-empty. */
    getSettings: readSettings,
    setSettings: writeSettings,
    setStatus(html) {
      root.querySelector('.sov-status').innerHTML = html;
    },
    renderResults(results, summary) {
      const el = root.querySelector('.sov-results');
      rendered = results;
      selected = null;
      $('.sov-prefill-src').textContent = '';   // the old selection is gone
      if (!results.length) {
        el.innerHTML = '<p>No sites met the minimum tax.</p>';
        return;
      }
      const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td>${r.x}|${r.y}</td>
          <td>${r.tMax.toFixed(1)}%</td>
          <td>${r.binding}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td>${r.milsovBonus ? `+${r.milsovBonus}%` : ''}</td>
          <td>${flagsHtml(r)}</td>
        </tr>`).join('');
      el.innerHTML = `
        <p>${summary}</p>
        <table>
          <thead><tr><th>Site</th>
            <th title="The highest tax this site can hold on food alone">Tax Max</th>
            <th title="Which ceiling stops the tax going higher">Limiter</th><th>Food</th>
            <th>RP</th><th>Net gold</th><th title="Free military production bonus — costs this site no tax">Mil</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => {
          // Selecting and expanding are one gesture; Prefill needs a selection
          // the user can see they made.
          select(Number(row.dataset.n));
          toggleDetail(row, results[Number(row.dataset.n)], readSettings().settings);
        });
      });
    },
    renderIncomplete(list) {
      const el = root.querySelector('.sov-incomplete');
      el.innerHTML = list.length
        ? `<p>${list.length} site(s) excluded: neighbourhood extends beyond the payload.</p>`
        : '';
    },
  };
}

/** The last column: whatever the row has to warn about, space-separated. */
function flagsHtml(r) {
  const flags = [];
  const res = resFlag(r);
  if (res) flags.push({ cls: 'sov-flag', ...res });
  if (r.milsovBlocked) {
    flags.push({
      cls: 'sov-flag',
      text: 'no mil',
      title: `No military sovereignty fits here for free — ${
        MILSOV_BLOCKED_TEXT[r.milsovBlocked] ?? 'nothing was left over'}.`,
    });
  }
  // The minimum is not met for free, but is met somewhere the user said they
  // would accept. Saying where is the whole point — dropping the site was what
  // made this invisible.
  if (r.milsovMinTax != null) {
    flags.push({
      cls: 'sov-advice',
      text: `min @ ${r.milsovMinTax.toFixed(0)}%`,
      title: `This site reaches your minimum military bonus (+${r.milsovMinBonusAt}%) `
        + `at ${r.milsovMinTax.toFixed(1)}% tax, against the ${r.tMax.toFixed(1)}% it holds `
        + `on food alone. Open the row and drag the tax slider to see the trade.`,
    });
  }
  return flags
    .map((f) => `<span class="${f.cls}" title="${escapeHtml(f.title)}">${escapeHtml(f.text)}</span>`)
    .join(' ');
}

/**
 * The tax control and the plan under it, shared by the results detail row and
 * the optimiser.
 *
 * `plan` is what to show now; `base` is the plan at the site's own ceiling, which
 * detailBodyHtml diffs against. The detail row opens with the two the same; the
 * optimiser opens at whatever tax was asked for, so they differ from the start.
 */
function planBlockHtml({ ctx, base, plan, floor }) {
  const slider = ctx && Number.isFinite(base.tMax) && base.tMax - floor > 0.5
    ? `<div class="sov-tax">
        <div class="sov-f"><span>Tax <output class="sov-tax-at">${plan.tax.toFixed(1)}%</output>
          <span class="sov-hint">— drag to trade tax for sovereignty</span></span>
          <input type="range" class="sov-tax-range" min="${floor}" max="${base.tMax}"
            step="0.5" value="${plan.tax}"></div>
      </div>`
    : '';
  return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base)}</div>`;
}

/** Make a rendered plan block live. Does nothing when there is no slider. */
function bindPlanBlock(scope, ctx, base) {
  const range = scope.querySelector('.sov-tax-range');
  if (!range) return;
  const at = scope.querySelector('.sov-tax-at');
  const body = scope.querySelector('.sov-body-at');
  range.addEventListener('input', () => {
    const tax = Number(range.value);
    at.textContent = `${tax.toFixed(1)}%`;
    const plan = planSiteAt(ctx, tax);
    body.innerHTML = plan
      ? detailBodyHtml(plan, base)
      : '<p class="sov-flag">This site cannot hold that tax.</p>';
  });
}

function toggleDetail(row, result, settings) {
  const next = row.nextElementSibling;
  if (next && next.classList.contains('sov-detail')) {
    next.remove();
    return;
  }
  const tr = document.createElement('tr');
  tr.className = 'sov-detail';

  // The food knapsack is built ONCE here and reused for every tax the slider
  // visits. Rebuilding it per drag event is what made this crawl: at a real
  // R_ref the DP is some 3,000 spend levels against 24 tiles, and the building
  // cap puts it on the count-limited path, which is another factor of twenty.
  const ctx = result.neighbours ? prepareSite({ neighbours: result.neighbours, settings }) : null;
  const floor = Math.min(settings.tMin ?? 0, result.tMax);

  tr.innerHTML = `<td colspan="8">${
    planBlockHtml({ ctx, base: result, plan: result, floor })}</td>`;
  row.after(tr);
  bindPlanBlock(tr, ctx, result);
}

/**
 * One focusSite result. The notes come first because the allocation and the
 * radius are inputs a reader would otherwise assume, and both move every figure
 * below them.
 */
function focusResultHtml(r) {
  const notes = [
    r.plotNote,
    `Radius ${r.radius}${r.radiusFromConfig ? ', from City Configuration' : ''}. `
      + `${r.claimable} of the ${r.ring} surrounding tiles are claimable.`,
  ];
  // Loud, but still not enforced — the plan below is rendered either way.
  const warnings = [];
  if (!r.centre.settleable) {
    warnings.push('This tile cannot be settled and its claims cannot be placed — '
      + 'the plan below is for analysis only.');
  }
  if (r.centre.isTown) warnings.push('This tile already carries a town.');
  if (r.centre.claimedBy) warnings.push(`This tile is already claimed (${r.centre.claimedBy}).`);

  const ceiling = `<p class="sov-note">Highest tax this tile holds on food alone: <strong>${
    r.base.tMax.toFixed(1)}%</strong>, limited by ${escapeHtml(r.base.binding)}.</p>`;
  const asked = r.aboveCeiling
    ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(1)}% — the plan below `
      + `is at its ceiling of ${r.ceiling.toFixed(1)}%.</p>`
    : '';

  return `<h3>${r.x}|${r.y}</h3>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join('')}
    ${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join('')}
    ${ceiling}${asked}
    ${planBlockHtml({ ctx: r.ctx, base: r.base, plan: r.plan, floor: r.floor })}`;
}

/**
 * Everything about one plan, at the tax it is run at. Rendered from the plan
 * alone so the slider can replace it wholesale — the tile list, the buildings
 * and the balance all move together, which is the point of dragging it.
 *
 * `base` is the plan at the site's own maximum, so a lower tax can say what it
 * bought and what it cost rather than leaving two screens of numbers to diff.
 */
function detailBodyHtml(plan, base) {
  const dxy = (t) => `${t.dx >= 0 ? '+' : ''}${t.dx},${t.dy >= 0 ? '+' : ''}${t.dy}`;
  const tiles = plan.tiles.map((t) =>
    `<li>${dxy(t)} — food ${t.food}, d ${t.d.toFixed(2)}, ${t.rp.toFixed(0)} RP, Sov ${t.level}</li>`).join('');
  // One line per building the engine placed, on the square it chose.
  const mil = plan.milsov.map((m) =>
    `<li class="sov-advice">${dxy(m)} — Sov ${m.sovLevel} claim carrying a level ${m.buildingLevel} ${
      escapeHtml(sovStructure(m).name)}, d ${m.d.toFixed(2)}, ${m.rp.toFixed(0)} RP, ${
      structureUpkeep(m).toLocaleString('en-GB')}/hr each W/C/I/S</li>`).join('');

  // A ceiling only BINDS at the tax it was solved for. Below that everything has
  // slack, so marking a row "binds" there would be a lie.
  const atCeiling = Math.abs(plan.tax - plan.tMax) < 0.05;
  const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null);
  const balance = rows.length
    ? `<table class="sov-balance"><thead><tr><th>Per hour at ${
      plan.tax.toFixed(1)}% tax</th><th>Produced</th><th>Left over</th><th></th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${r.label}</td><td class="sov-hint">${
        Number.isFinite(r.base) ? Math.round(r.base).toLocaleString('en-GB') : ''}</td><td class="${
        r.value < 0 ? 'sov-bad' : 'sov-ok'}">${
        Math.round(r.value).toLocaleString('en-GB')}</td><td class="sov-hint">${r.note}</td></tr>`).join('')
    }</tbody></table>${plan.surplus.upkeep
      ? `<p class="sov-hint">Wood, clay, iron and stone are already net of the ${
        plan.surplus.upkeep.toLocaleString('en-GB')}/hr these buildings cost.</p>`
      : ''}`
    : '';

  // What this tax bought, against the plan at the top of the slider. The food
  // claim count is in there because dropping one is usually where the research
  // for the buildings came from.
  const claimDelta = plan.tiles.length - base.tiles.length;
  const trade = plan.tax < base.tMax - 0.05
    ? `<p class="sov-hint">At ${plan.tax.toFixed(1)}% rather than ${base.tMax.toFixed(1)}%: ${
      plan.milsovBonus > base.milsovBonus
        ? `<strong>+${plan.milsovBonus - base.milsovBonus}% more production</strong>`
        : 'no more production'}, ${plan.tiles.length} food claims (${
      claimDelta >= 0 ? '+' : ''}${claimDelta}), ${
      Math.round(plan.goldNet - base.goldNet).toLocaleString('en-GB')} gold.</p>`
    : '';

  const milPlan = plan.milsov.length
    ? `<p class="sov-hint">Military sovereignty: ${escapeHtml(milsovPlanText(plan))}</p>`
    : plan.milsovBlocked
      ? `<p class="sov-flag">No military sovereignty fits at this tax — ${
        escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? 'nothing was left over')}.</p>`
      : '';

  // The resource ceiling is stated whether or not it bites, since the figure
  // itself is what the user judges the plan by.
  const ceiling = plan.resImpossible
    ? `is impossible — the settle allocation has no ${plan.resBinding} plots`
    : `is ${plan.resCeiling?.toFixed(1)}% on ${plan.resBinding}`;
  const res = !Number.isFinite(plan.resCeiling) && !plan.resImpossible
    ? ''
    : `<p class="sov-hint">Resource ceiling ${ceiling}.</p>`;

  return `<ul>${tiles}${mil}</ul>${balance}${trade}${milPlan}${res}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// RFC 4180 quoting. Every column goes through this rather than only the free
// text one — the military plan is the first field that can carry a
// comma, and picking which columns are "safe" is how that regresses later.
export function csvField(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * `T_res` stays a number or blank, so a spreadsheet can total the column: the
 * two cases that have no number — no milsov requested, and no plots of the
 * binding resource — are told apart by `res_status` rather than by a sentinel
 * in the numeric column. Blank status means the ceiling was applied for real.
 */
function resColumns(r) {
  if (!r.resIndicative) {
    const known = Number.isFinite(r.resCeiling);
    return [known ? r.resCeiling.toFixed(2) : '', known ? r.resBinding : '', ''];
  }
  return r.resImpossible
    ? ['', r.resBinding, 'impossible']
    : [r.resCeiling.toFixed(2), r.resBinding, 'indicative'];
}

export function toCsv(results) {
  // The one free-text field stays last, so a column added later does not land
  // after the only one that can carry a comma.
  const head = ['x', 'y', 'T_max', 'binding', 'S_food', 'U_RP', 'U_gold', 'Gold_net',
    'milsov_buildings', 'milsov_bonus', 'milsov_upkeep', 'milsov_RP', 'milsov_price',
    'T_res', 'res_binding', 'res_status', 'milsov_plan'];
  const lines = results.map((r) =>
    [r.x, r.y, r.tMax.toFixed(2), r.binding, r.sFood.toFixed(0),
     r.uRp.toFixed(0), r.uGold.toFixed(0), r.goldNet.toFixed(0),
     r.milsov?.length ?? 0, r.milsovBonus ?? 0, r.milsovUpkeep ?? 0,
     (r.milsovRp ?? 0).toFixed(0), r.milsovPrice ?? 0,
     ...resColumns(r),
     milsovPlanText(r)].map(csvField).join(','));
  return [head.join(','), ...lines].join('\n');
}
