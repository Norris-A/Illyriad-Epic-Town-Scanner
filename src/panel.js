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
  DEFAULT_CITY_CONSUMPTION,
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
  PRESTIGE_KEYS,
  PRESTIGE_PRODUCTION_BONUS,
  MINIMUM_KEYS,
  PLOT_KEYS,
  PLOT_TOTAL,
  PRODUCTION_LABEL,
  descriptorFor,
} from './constants.js';
import { ICONS, PRODUCTION_ICONS, STRUCTURE_ICONS, DEFAULT_STRUCTURE_ICON } from './icons.js';
import { extractTowns } from './payload.js';
import {
  computeBOther,
  computeK,
  computeRRef,
  prestigeBonus,
  researchAt,
  computeBasicYield,
  sovStructure,
  structureUpkeep,
  prepareSite,
  planSiteAt,
  scoreSiteFrom,
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
.sov-detail-actions{margin:2px 0 6px}
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
.sov-desc{display:block;font-size:9px;line-height:1.15;opacity:.85;word-break:break-word}
.sov-balance{margin:4px 0}
.sov-balance td:nth-child(n+2){font-variant-numeric:tabular-nums}
.sov-balance th,.sov-balance td{padding:2px 3px}
/* Sized to the line rather than to the art, so a row's height stays its text's. */
.sov-panel img.sov-ico{width:12px;height:12px;vertical-align:-2px;margin-right:4px;
  image-rendering:pixelated}
.sov-plot-fields label .sov-ico{display:block;margin:0 auto 1px}
.sov-tabs{display:flex;gap:2px;margin:0 0 8px;border-bottom:1px solid #444}
.sov-tabs button{background:#2a2a2a;color:#b5b5b5;padding:5px 9px;border-bottom:2px solid transparent}
.sov-tabs button.on{background:#333;color:#fff;border-bottom-color:#3a5}
.sov-xy{display:flex;gap:4px}
.sov-xy input{width:60px;text-align:right}
.sov-focus-out h3{margin:8px 0 2px;font-size:12px;font-weight:600;color:#fff}
.sov-note{color:#a9a9a9;font-size:11px;margin:2px 0}
.sov-warn{color:#e66;font-weight:bold;font-size:11px;margin:2px 0}
/* The claim grid. Cell colours are qualified with .sov-grid and the table width
   with .sov-panel, because the panel's own table and td rules carry an element in
   the selector and a bare class loses to them. */
.sov-grid-wrap{overflow-x:auto;margin:6px 0}
.sov-panel table.sov-grid{width:auto;border-collapse:separate;border-spacing:2px}
.sov-grid th{padding:0 2px;border:0;text-align:center;font-size:10px;font-weight:400;
  color:#8a8a8a;font-variant-numeric:tabular-nums}
.sov-grid td{width:46px;height:38px;padding:1px;border:1px solid #303030;text-align:center;
  vertical-align:middle;background:#1e1e1e}
.sov-grid img{width:12px;height:12px;vertical-align:-2px;image-rendering:pixelated}
.sov-lv{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;color:#8a8a8a}
.sov-cv{display:block;font-size:11px;font-variant-numeric:tabular-nums}
.sov-grid .sov-cell-town{background:#243;border-color:#6bf}
.sov-grid .sov-cell-town .sov-lv{color:#6bf}
.sov-grid .sov-cell-food{background:#1d2a1d;border-color:#3a5}
.sov-grid .sov-cell-food .sov-lv{color:#8d8}
.sov-grid .sov-cell-mil{background:#2a241a;border-color:#a83}
.sov-grid .sov-cell-mil .sov-lv{color:#eb8}
.sov-grid .sov-cell-free .sov-cv{color:#7d7d7d}
.sov-grid .sov-cell-water{background:#16202a;border-color:#2a3a4a}
/* Kept claims: neither a tile the plan chose nor one it could not have, so a
   third colour rather than either of theirs. */
.sov-grid .sov-cell-kept{background:#1b2430;border-color:#4a6a8a}
.sov-grid .sov-cell-kept .sov-lv{color:#8ab}
.sov-grid .sov-cell-kept .sov-cv{color:#7d8fa0}
.sov-legend .sov-key-kept{color:#8ab}
/* A tile the user crossed out and one the game never offered are both tiles the
   plan cannot have, so they differ in weight, not in kind. */
.sov-grid .sov-cell-out{background:#2b1a1a;border-color:#8a3a3a}
.sov-grid .sov-cell-out .sov-x{color:#e55}
.sov-grid .sov-cell-none{background:#161616;border-color:#252525}
.sov-grid .sov-cell-none .sov-x{color:#3f3f3f}
.sov-x{display:block;font-size:13px;line-height:1.3}
.sov-grid .sov-pick{cursor:pointer}
.sov-grid .sov-pick:hover{outline:1px solid #6bf}
.sov-legend{color:#a9a9a9;font-size:10px;margin:2px 0 0}
.sov-legend b{font-weight:600;font-size:10px}
.sov-legend .sov-key-food{color:#8d8}
.sov-legend .sov-key-mil{color:#eb8}
.sov-legend .sov-key-free{color:#7d7d7d}
.sov-legend .sov-key-out{color:#e55}
/* The bonus is the return on the tax, so it is sized to be read at a glance, in
   the amber the grid gives military claims. */
.sov-mil{margin:6px 0;padding:4px 6px;background:#221d15;border-left:2px solid #a83}
.sov-mil .sov-mil-bonus{font-size:17px;font-weight:700;color:#eb8;
  font-variant-numeric:tabular-nums}
.sov-mil .sov-mil-what{color:#eb8}
.sov-mil .sov-hint{display:block;margin:1px 0 0}
/* Drawn even while empty: the red frame is the warning that anything typed here
   beats the settings above. The filled state deepens it rather than adding it. */
.sov-form fieldset.sov-override{border-color:#a33;background:#231a1a;margin:6px 0 8px}
.sov-form fieldset.sov-override.sov-override-on{border-color:#e55;background:#2a1b1b}
.sov-form .sov-override>legend{color:#e88;font-weight:600}
.sov-form .sov-override.sov-override-on>legend{color:#f99}
/* The host page's own [hidden] handling cannot be relied on: an author rule like
   .sov-f{display:flex} beats the user-agent one whatever its specificity, so
   anything this panel hides needs a rule of its own, last so it wins on order. */
.sov-panel [hidden]{display:none}
`;

// --- Settings model ---------------------------------------------------------

// Both live in constants.js so focus.js can read an allocation without importing
// the UI module; re-exported here because this is where the form and its tests
// have always reached for them.
export { PLOT_KEYS, PLOT_TOTAL };

/** Alt is empty because the icon is decoration over a name already beside it. */
export function productionLabel(key) {
  const icon = PRODUCTION_ICONS[key];
  return `${icon ? `<img class="sov-ico" src="${icon}" alt="">` : ''}${PRODUCTION_LABEL[key] ?? key}`;
}

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
 * What was placed, as "2× Sov II + 1× Sov I". Levels descend, since that is the
 * order the plan puts them on the tiles.
 */
function milsovSplitText(plan) {
  const counts = new Map();
  for (const m of plan.milsov) counts.set(m.buildingLevel, (counts.get(m.buildingLevel) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, n]) => `${n}× Sov ${SOV_LEVEL_ROMAN[level - 1]}`)
    .join(' + ');
}

/**
 * The plan's military sovereignty, in one line — the level split, the bonus and
 * what it costs per hour. This is the CSV's phrasing, so it stays one flat
 * string; the panel has milsovPlanHtml, which ranks the same facts.
 */
export function milsovPlanText(plan) {
  if (!plan?.milsov?.length) return '';
  return `${milsovSplitText(plan)} — +${plan.milsovBonus}% military unit production, upkeep ${
    (plan.milsovUpkeep ?? 0).toLocaleString('en-GB')}/hr of wood, clay, iron and stone.`;
}

/**
 * The tax at which sovereignty upkeep stops being affordable, stated only when
 * the site could actually reach it — a plan capped at 78% learns nothing from
 * "161.1%". Silent above the ceiling; loud when no tax can pay it at all.
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

/**
 * The same plan for the screen. The bonus leads, since it is what the tax bought;
 * the composition and the bill follow in hint weight.
 */
export function milsovPlanHtml(plan) {
  if (!plan?.milsov?.length) return '';
  return `<p class="sov-mil"><b class="sov-mil-bonus">+${plan.milsovBonus}%</b>
    <span class="sov-mil-what">military unit production</span>
    <span class="sov-hint">${escapeHtml(milsovSplitText(plan))}, upkeep ${
  (plan.milsovUpkeep ?? 0).toLocaleString('en-GB')}/hr of wood, clay, iron and stone.</span></p>`;
}

/** Why a site got no military sovereignty, in the user's terms. */
export const MILSOV_BLOCKED_TEXT = {
  tiles: 'every claimable tile went to the food plan',
  water: 'every tile the food plan left over is water, which takes no Production Structure',
  slots: 'the food plan used every building slot',
  upkeep: 'the city produces too little wood, clay, iron or stone to run one',
  rp: 'the food plan spent the research this site produces',
};

/**
 * The per-hour balance of a plan, as rows of `{label, base, spent, value, note}`.
 * `base` is the row's production before the plan spends it and `spent` what the
 * plan takes out of it, so the three figures read across as base - spent = value.
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
  // `key` indexes the surplus; `icon` names the production, which differs for
  // research — the surplus calls it rp and everything user-facing calls it that.
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
    // The ceiling that set the tax is at 0 by construction; say which it was so
    // a row of zero does not read as a failure to compute.
    if (binding === r.key || (binding === 'res' && r.basic && Math.abs(value) < 0.5)) {
      notes.push('binds');
    }
    if (value < 0) notes.push('deficit');
    if (r.basic && surplus.indicative) notes.push('indicative');
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
      text: `no ${r.resBinding} plots`,
      title: `The settle allocation has no ${r.resBinding} plots, so the sovereignty `
        + `upkeep cannot be paid at any tax rate. ${caveat}`,
    };
  }
  if (!(r.resCeiling < r.tMax - 1e-9)) return null;
  return {
    text: `${r.resBinding} ${r.resCeiling.toFixed(1)}%`,
    title: `Sovereignty upkeep exhausts ${r.resBinding} above ${r.resCeiling.toFixed(1)}% tax, `
      + `below this site's ceiling of ${r.tMax.toFixed(1)}%. ${caveat}`,
  };
}

/**
 * Read the RP calibration override. A blank or zero reading means "not
 * calibrated" and returns null, leaving computeRRef on its library estimate.
 * The tax is clamped to 0..100 because R_ref divides by (125 - atTax).
 *
 * `prestige` describes the READING, not the city: the back-solve divides out
 * whatever multiplier produced the figure, so a boost that was running when it
 * was taken has to be declared here or it is fitted into R_ref instead.
 */
export function parseRpCalibration(observed, atTax, prestige) {
  const rp = clampNumber(observed, { min: 0, fallback: 0 });
  if (rp <= 0) return null;
  return {
    observedRpPerHour: rp,
    atTax: clampNumber(atTax, { min: 0, max: 100, fallback: 0 }),
    prestige: !!prestige,
  };
}

/** Read the four booster tick-boxes, defaulting each to off. */
export function parseResourceBoosters(raw) {
  const out = {};
  for (const res of BASIC_RESOURCES) out[res] = !!raw?.[res];
  return out;
}

/**
 * Read the minimum-surplus fields — one per production, food and research
 * included. Zero is off, and negative is refused rather than read as permission
 * to run a resource into deficit.
 */
export function parseResourceMinimums(raw) {
  const out = {};
  for (const key of MINIMUM_KEYS) {
    out[key] = clampNumber(raw?.[key], { min: 0, max: 1e7, integer: true, fallback: 0 });
  }
  return out;
}

/**
 * Read the prestige tick-boxes — one per production, food included. Food is
 * the only one no call site reads directly: computeBOther totals it.
 */
export function parsePrestige(raw) {
  const out = {};
  for (const key of PRESTIGE_KEYS) out[key] = !!raw?.[key];
  return out;
}

/**
 * One control per setting, declared once. The keys here and the keys of
 * DEFAULT_SETTINGS must match exactly, which a test asserts, so constants.js
 * stays the single list of settings.
 *
 * `enabledWhen` disables a control whose precondition is off, rather than
 * leaving it editable but ignored. `overriddenWhen` greys one out for the other
 * reason: it is still meaningful, but an override below it is answering the same
 * question and winning.
 *
 * `menu: true` moves a control out of the City Configuration form and into the
 * panel's own settings menu. `advanced: true` hides one until Advanced Mode is
 * on. Both are still ordinary settings — they save and restore like the rest.
 */
export const SETTINGS_FIELDS = [
  { key: 'tMin', group: 'Ranking', label: 'Minimum Tax (%)', type: 'number', min: -100, max: 100 },

  { key: 'plots', group: 'Settle Tile', label: 'Settle Plot Allocation', type: 'plots' },

  {
    key: 'cityConsumption',
    group: 'City Food',
    label: 'Food Consumed per Hour',
    type: 'number',
    min: 1,
    max: 1e6,
    integer: true,
    fallback: DEFAULT_CITY_CONSUMPTION,
  },
  {
    key: 'flourMill',
    group: 'City Food',
    label: `Flour Mill at Level 20 (+${FLOUR_MILL_L20}%)`,
    type: 'checkbox',
  },
  { key: 'naturesBounty', group: 'City Food', label: "Nature's Bounty", type: 'checkbox' },
  {
    key: 'geomancerRetreats',
    group: 'City Food',
    label: 'Geomancer Retreats',
    type: 'select',
    parse: 'number',
    options: NATURES_BOUNTY_BY_RETREATS.map((bonus, n) => ({ value: n, label: `${n} (+${bonus}%)` })),
    enabledWhen: (s) => !!s.naturesBounty,
  },
  { key: 'cityCount', group: 'City Food', label: 'Number of Cities', type: 'number', min: 1, max: 999, integer: true, fallback: 1 },
  { key: 'isCapital', group: 'City Food', label: 'This City is the Capital', type: 'checkbox' },

  {
    key: 'libraryLevel',
    group: 'Research',
    label: 'Library Level',
    type: 'number',
    min: 0,
    max: 20,
    integer: true,
    fallback: 20,
    overriddenWhen: (s) => !!s.rpCalibration,
  },
  {
    key: 'allembine',
    group: 'Research',
    label: 'Allembine Research',
    type: 'checkbox',
    overriddenWhen: (s) => !!s.rpCalibration,
  },
  {
    key: 'overflowingInsight',
    group: 'Research',
    label: 'Overflowing Insight (×1.5)',
    type: 'checkbox',
    overriddenWhen: (s) => !!s.rpCalibration,
  },
  {
    key: 'rpCalibration',
    group: 'Research',
    label: 'Measured Research Output',
    type: 'calibration',
  },

  {
    key: 'resourceBoosters',
    group: 'Basic Resources',
    label: 'Booster Buildings at Level 20',
    type: 'boosters',
  },

  // Its own group because it spans everything the city produces — the four basic
  // resources, food and research — so it belongs under none of theirs.
  {
    key: 'prestige',
    group: 'Prestige',
    label: 'Prestige Production Boost',
    type: 'prestige',
  },

  // Its own group: a floor can be asked for on any of the six productions, so
  // it belongs under no single one.
  {
    key: 'resourceMinimums',
    group: 'Minimum Surplus',
    label: 'Minimum Surplus per Hour',
    type: 'minimums',
  },

  { key: 'chancery', group: 'Sovereignty', label: 'Chancery of Estates (×0.6 upkeep)', type: 'checkbox' },
  { key: 'rClaim', group: 'Sovereignty', label: 'Claim Radius', type: 'number', min: 1, max: 6, integer: true, fallback: 2 },
  { key: 'maxBuildings', group: 'Sovereignty', label: 'Maximum Buildings', type: 'number', min: 0, max: 200, integer: true, fallback: 20 },
  { key: 'milsovStructure', group: 'Sovereignty', label: 'Military Structure', type: 'milsov' },
  {
    key: 'milsovMinBonus',
    group: 'Sovereignty',
    label: 'Minimum Military Bonus (%)',
    type: 'number',
    min: 0,
    max: 1000,
    integer: true,
    fallback: 0,
    enabledWhen: (s) => !!s.milsovStructure,
  },

  { key: 'dOther', group: 'Neighbours', label: 'Minimum Distance to Other Players', type: 'number', min: 0, max: 100 },
  { key: 'dOwn', group: 'Neighbours', label: 'Minimum Distance to Your Cities', type: 'number', min: 0, max: 100 },
  { key: 'ownClaimsAvailable', group: 'Neighbours', label: 'Treat Your Own Claims as Available', type: 'checkbox' },
  { key: 'allianceClaimsAvailable', group: 'Neighbours', label: 'Treat Alliance Claims as Available', type: 'checkbox' },
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
    `<label>${productionLabel(p)}<input type="number" data-plot="${p}" min="0" max="${PLOT_TOTAL}"
      step="1" value="${plots?.[p] ?? 0}"></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — how the settle tile's ${PLOT_TOTAL} plots are
        split. The five must total ${PLOT_TOTAL}. Terraforming applies to the settle tile only.</p>
      <div class="sov-plot-fields">${fields}</div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from Selected Tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
}

function calibrationFieldHtml(f, cal) {
  return `<fieldset class="sov-f-block sov-override" data-key="${f.key}">
      <legend>Override — ${escapeHtml(f.label)}</legend>
      <p class="sov-hint">Read your city's actual research output off the game and enter it
        here. While a figure is set it replaces the Library Level, Allembine Research and
        Overflowing Insight settings above, which grey out to show they no longer apply.</p>
      <div class="sov-f"><span>Observed research per hour</span>
        <input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr('value', cal?.observedRpPerHour)}></div>
      <div class="sov-f"><span>…at this tax rate (%)</span>
        <input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}"></div>
      <div class="sov-f"><span>…with the Prestige boost running</span>
        <input type="checkbox" data-cal="prestige"${cal?.prestige ? ' checked' : ''}></div>
      <p class="sov-hint sov-rp-read"></p>
    </fieldset>`;
}

/** One tick-box per booster, named after the building the user would recognise. */
function boostersFieldHtml(f, boosters) {
  const boxes = BASIC_RESOURCES.map((res) =>
    `<label class="sov-f" data-booster-row="${res}"><span>${RESOURCE_BOOSTERS[res]} —
      ${productionLabel(res)} (+${RESOURCE_BOOSTER_BONUS}%)</span>
      <input type="checkbox" data-booster="${res}"${boosters?.[res] ? ' checked' : ''}></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — each adds ${RESOURCE_BOOSTER_BONUS}% to that
        resource's production percentage, the same way the Flour Mill adds to food. It is added
        to that percentage rather than multiplied into it, so it is worth a straight
        ${RESOURCE_BOOSTER_BONUS} points of tax headroom against the resource's ceiling.</p>
      ${boxes}
    </div>`;
}

/**
 * The prestige toggles — one per production, food and research included, since
 * all of them are the same additive points on the same production percentage.
 * The food box feeds B_other, so the City Food total above accounts for it.
 */
function prestigeFieldHtml(f, prestige) {
  const boxes = PRESTIGE_KEYS.map((key) =>
    `<label class="sov-f" data-prestige-row="${key}"><span>${productionLabel(key)}
      (+${PRESTIGE_PRODUCTION_BONUS}%)</span>
      <input type="checkbox" data-prestige="${key}"${prestige?.[key] ? ' checked' : ''}></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">+${PRESTIGE_PRODUCTION_BONUS}% on the production percentage,
        cumulative with spells and sovereignty. Added rather than multiplied, so each is worth
        ${PRESTIGE_PRODUCTION_BONUS} points of tax headroom — half a booster building. Tick
        only what the boost is actually running on: these move every ceiling they touch.</p>
      ${boxes}
    </div>`;
}

/**
 * The minimum surplus per production — the difference between a city that can
 * pay its sovereignty and one that can also build. At T_res the whole of the
 * scarcest resource goes to upkeep: affordable, and useless.
 */
function minimumsFieldHtml(f, minimums) {
  const boxes = MINIMUM_KEYS.map((key) =>
    `<label class="sov-f" data-minimum-row="${key}"><span>${productionLabel(key)} — keep at least</span>
      <input type="number" data-minimum="${key}" min="0" step="1"
        value="${minimums?.[key] ?? 0}"></label>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — how much of each must still be free once
        the plan is paid for: the four resources after sovereignty upkeep, food after the
        town has eaten, research after the claims. Zero spends the lot, which is what a
        city sitting exactly on a ceiling does — it can run what it has placed and never
        build, grow or trade on top of it. Each figure lowers the ceiling it belongs to by
        its own worth in production points.</p>
      ${boxes}
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
    case 'prestige': return prestigeFieldHtml(f, v);
    case 'minimums': return minimumsFieldHtml(f, v);
    case 'milsov': return milsovFieldHtml(f, v);
    default: return numberFieldHtml(f, v ?? f.fallback);
  }
}

/** The whole form, grouped in declaration order. Menu settings are not in it. */
export function settingsFormHtml(settings) {
  const groups = [];
  for (const f of SETTINGS_FIELDS) {
    if (f.menu) continue;
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
      <p><button type="button" class="sov-reset sec">Reset to Defaults</button></p>
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
        <label class="sov-f"><span>One of Your Towns</span>
          <select class="sov-town-pick"><option value="">—</option></select></label>
        <p class="sov-hint sov-town-note">Fills the coordinates below from a town of yours on
          the map. For a town you have already built out, tick Preserve Existing Sovereignty
          so the plan accounts for the claims it is already paying for.</p>
        <label class="sov-f"><span>Coordinates — x | y</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x"${attr('value', f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y"${attr('value', f.y)}>
          </span></label>
        <label class="sov-f"><span>Sovereignty Radius</span>
          <input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr('value', f.radius)}></label>
        <p class="sov-hint">How far out sovereignty may be placed. Blank follows the claim
          radius in City Configuration, currently ${rClaim}.</p>
      </fieldset>
      <fieldset><legend>Plan</legend>
        <label class="sov-f"><span>Starting Tax (%)</span>
          <input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="1"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}"></label>
        <label class="sov-f"><span>Use the Plot Allocation from City Configuration</span>
          <input type="checkbox" data-focus="useConfiguredPlots"${f.useConfiguredPlots ? ' checked' : ''}></label>
        <p class="sov-hint">On, the plan uses the ${PLOT_TOTAL}-plot allocation from City
          Configuration — the tile as you intend to terraform it. Off, it uses the tile's own
          resource ratings, as the map reports them today.</p>
        <label class="sov-f"><span>Preserve Existing Sovereignty</span>
          <input type="checkbox" data-focus="preserveSovereignty"${f.preserveSovereignty ? ' checked' : ''}></label>
        <p class="sov-hint">For a tile you have already settled. On, claims you already hold
          inside the radius are kept as they are: they are drawn on the grid and the research
          and gold they already cost are taken off the top, so the plan is what you can still
          add. Off, the plan is drawn as though the ground were empty.</p>
      </fieldset>
      <p><button type="button" class="sov-focus-run">Optimise</button></p>
      <p class="sov-hint">Everything else — research, city food, chancery, the building cap
        and which military structure to place — comes from City Configuration. Any tile can
        be examined here, including one already settled, claimed, or too near a town.</p>
    </form>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
}

/**
 * Your own towns in a payload, named and sorted, for the optimiser's picker.
 * Deduplicated on position: the `t` block is keyed off claiming towns rather
 * than the viewport, so one town can appear under more than one key.
 */
export function ownTowns(payload) {
  const seen = new Map();
  for (const t of extractTowns(payload)) {
    if (!t.own || !Number.isFinite(t.x) || !Number.isFinite(t.y)) continue;
    const at = `${t.x}|${t.y}`;
    if (!seen.has(at)) seen.set(at, { x: t.x, y: t.y, label: t.name ? `${t.name} (${at})` : at });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** The two capital bonuses are derived, not stored — show why each is off. */
function capitalDerivedHtml(s) {
  return [
    ['Famine Management', FAMINE_MANAGEMENT, 10],
    ['Soil Enrichment', SOIL_ENRICHMENT, 30],
  ].map(([name, bonus, need]) => {
    const active = s.isCapital && (s.cityCount ?? 1) >= need;
    const why = !s.isCapital ? 'capital only' : `needs ${need} cities`;
    return `<li class="${active ? 'sov-on' : 'sov-off'}">${name} +${bonus}% — ${
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
        <button type="button" data-tab="scan" class="on">Site Search</button>
        <button type="button" data-tab="focus">Optimal Sovereignty</button>
        <button type="button" data-tab="config">City Configuration</button>
      </nav>
      <section data-pane="scan">
        <p><button class="sov-scan">Scan</button>
           <button class="sov-export sec">Export CSV</button></p>
        <div class="sov-status"></div>
        <div class="sov-results"></div>
        <div class="sov-diagnostics"></div>
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
  let incomplete = [];     // sites the last scan could not see all of

  root.querySelector('h2').addEventListener('click', () => root.classList.toggle('sov-collapsed'));
  scanBtn.addEventListener('click', onScan);
  $('.sov-export').addEventListener('click', onExport);

  // One pane at a time. The radius placeholder was baked in at build time from
  // the settings as they were then, so entering the optimiser re-reads them.
  function showTab(name) {
    root.querySelectorAll('.sov-tabs button').forEach((t) => {
      t.classList.toggle('on', t.dataset.tab === name);
    });
    root.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== name; });
    if (name === 'focus') syncFocusRadiusHint();
  }
  root.querySelectorAll('.sov-tabs button').forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
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
            form.querySelector('[data-cal="prestige"]').checked,
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
        case 'prestige': {
          const raw = {};
          for (const key of PRESTIGE_KEYS) {
            raw[key] = form.querySelector(`[data-prestige="${key}"]`).checked;
          }
          out.prestige = parsePrestige(raw);
          break;
        }
        case 'minimums': {
          const raw = {};
          for (const key of MINIMUM_KEYS) {
            raw[key] = form.querySelector(`[data-minimum="${key}"]`).value;
          }
          out.resourceMinimums = parseResourceMinimums(raw);
          break;
        }
        default:
          out[f.key] = clampNumber(form.querySelector(`input[data-key="${f.key}"]`).value, f);
      }
    }
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
          form.querySelector('[data-cal="prestige"]').checked = !!v?.prestige;
          break;
        case 'boosters':
          for (const res of BASIC_RESOURCES) {
            form.querySelector(`[data-booster="${res}"]`).checked = !!v?.[res];
          }
          break;
        case 'prestige':
          for (const key of PRESTIGE_KEYS) {
            form.querySelector(`[data-prestige="${key}"]`).checked = !!v?.[key];
          }
          break;
        case 'minimums':
          for (const key of MINIMUM_KEYS) {
            form.querySelector(`[data-minimum="${key}"]`).value = v?.[key] ?? 0;
          }
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

    // A control is live only while its precondition holds and nothing below it
    // is overriding it. Disabled inputs still read back, so greying one out
    // costs the user nothing if they clear the override again.
    for (const f of SETTINGS_FIELDS) {
      if (!f.enabledWhen && !f.overriddenWhen) continue;
      const on = (f.enabledWhen?.(s) ?? true) && !f.overriddenWhen?.(s);
      const wrap = form.querySelector(`[data-key="${f.key}"]`);
      wrap.classList.toggle('sov-gated', !on);
      wrap.querySelectorAll('input,select').forEach((el) => { el.disabled = !on; });
    }

    // The override frame lights up while it holds a figure, so "this is winning"
    // and "this is available" never look the same.
    form.querySelector('.sov-override[data-key="rpCalibration"]')
      .classList.toggle('sov-override-on', !!s.rpCalibration);

    // The running total and the K it produces, so the cost of an edit to the
    // food plots is visible while making it.
    const plots = validatePlots(plotInputs());
    const total = form.querySelector('.sov-plot-total');
    total.className = `sov-plot-total ${plots.ok ? 'sov-ok' : 'sov-bad'}`;
    total.textContent = `Total ${plots.total} / ${PLOT_TOTAL}${
      plots.ok ? '' : ` — ${plots.message}`} · ${
      computeK(plots.plots.food).toFixed(2)} food/hr per production point`;

    form.querySelector('.sov-derived').innerHTML = capitalDerivedHtml(s);
    const bOther = computeBOther(s);
    form.querySelector('.sov-derived-food').textContent =
      `City food bonuses total ${bOther >= 0 ? '+' : ''}${bOther}% on food production.`;

    // The research the plan will actually spend against, shown as the override is
    // typed — a reading that produces an implausible figure is far easier to spot
    // here than in a results row.. Stated at 0% tax because that is the figure every
    // claim is bought out of, whatever tax the site ends up holding.
    const rp = Math.round(researchAt({
      rRef: computeRRef(s), rpBonus: prestigeBonus(s, 'research'), tax: 0,
    })).toLocaleString('en-GB');
    form.querySelector('.sov-rp-read').textContent = s.rpCalibration
      ? `In use: ${rp} research per hour at 0% tax, from your reading.`
      : `In use: ${rp} research per hour at 0% tax, from the settings above.`;

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
      src.textContent = 'Click a result row first — Prefill copies that tile’s resource ratings.';
      return;
    }
    writePlots(selected.rs);
    refresh();
    src.textContent = `Prefilled from ${selected.x}|${selected.y} — ratings ${
      PLOT_KEYS.map((p) => selected.rs[p]).join('|')}.`;
  }

  function select(n) {
    selected = rendered[n] ?? null;
    root.querySelectorAll('.sov-row').forEach((r) => {
      r.classList.toggle('sov-selected', Number(r.dataset.n) === n);
    });
    if (selected) {
      $('.sov-prefill-src').textContent = selected.rs
        ? `Selected ${selected.x}|${selected.y} — ratings ${
          PLOT_KEYS.map((p) => selected.rs[p]).join('|')}.`
        : `Selected ${selected.x}|${selected.y} — no resource ratings in the payload for this tile.`;
    }
  }

  // --- what the scan could not see ---

  /**
   * Sites the payload did not reach all the way around. This is the one thing a
   * scan withholds that the user can act on: the answer is to pan and run it
   * again. Why the other tiles were dropped is the tool's business, not theirs.
   */
  function drawIncomplete() {
    $('.sov-diagnostics').innerHTML = incomplete.length
      ? `<p class="sov-hint">${incomplete.length} ${
        incomplete.length === 1 ? 'site was' : 'sites were'} skipped because the map data does
        not reach all the way around them. Zoom out or pan so the whole area is on screen,
        then scan again.</p>`
      : '';
  }

  // --- Optimal Sovereignty ---

  const focusForm = $('.sov-focus-form');

  function syncFocusRadiusHint() {
    const { settings: s } = readSettings();
    focusForm.querySelector('[data-focus="radius"]').placeholder = String(Math.round(s.rClaim ?? 2));
    syncTownPicker();
  }

  /**
   * The towns of yours the last payload happens to cover. Rebuilt on entering
   * the pane rather than held, because panning the map changes the answer and
   * a stale list would offer a town whose tile is no longer loaded.
   */
  function syncTownPicker() {
    const sel = focusForm.querySelector('.sov-town-pick');
    const payload = getPayload?.();
    const towns = payload ? ownTowns(payload) : [];
    sel.disabled = !towns.length;
    sel.innerHTML = towns.length
      ? `<option value="">—</option>${towns.map((t) =>
        `<option value="${t.x}|${t.y}">${escapeHtml(t.label)}</option>`).join('')}`
      : `<option value="">${payload ? 'none on the map right now' : 'no map data yet'}</option>`;
  }

  function readFocus() {
    const raw = {};
    for (const key of ['x', 'y', 'radius', 'tax']) {
      raw[key] = focusForm.querySelector(`[data-focus="${key}"]`).value;
    }
    for (const key of ['useConfiguredPlots', 'preserveSovereignty']) {
      raw[key] = focusForm.querySelector(`[data-focus="${key}"]`).checked;
    }
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
    mountPlanBlock(out.querySelector('.sov-plan-block'), {
      neighbours: result.neighbours,
      // What the plan on screen was made with, which is not what the form holds.
      settings: result.settings,
      ctx: result.ctx,
      base: result.base,
      floor: result.floor,
      geom: { radius: result.radius, x: result.x, y: result.y, kept: result.kept?.claims },
      tax: result.plan.tax,
    });
  }

  /**
   * Take a scanned site over to the optimiser and plan it there. The scan ranks
   * on food at each site's own ceiling; this is where the tax comes down and the
   * trade against military sovereignty becomes visible, so it is the same
   * question continued rather than a new one.
   */
  function optimiseSite(result) {
    focusForm.querySelector('[data-focus="x"]').value = result.x;
    focusForm.querySelector('[data-focus="y"]').value = result.y;
    showTab('focus');
    runFocus();
    // The answer is below the form, and the form is what the tab lands on. The
    // status is the higher of the two, so this lands on a refusal as well as a plan.
    $('.sov-focus-status').scrollIntoView({ block: 'start' });
  }

  focusForm.addEventListener('change', (e) => {
    const sel = e.target.closest('.sov-town-pick');
    if (!sel || !sel.value) return;
    const [x, y] = sel.value.split('|');
    focusForm.querySelector('[data-focus="x"]').value = x;
    focusForm.querySelector('[data-focus="y"]').value = y;
  });

  focusForm.addEventListener('submit', (e) => e.preventDefault());
  focusForm.addEventListener('click', (e) => {
    if (e.target.closest('.sov-focus-run')) runFocus();
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
    /**
     * @param {object[]} results ranked sites
     * @param {object} scan `{x, y, zoom, scanned}` — the facts of the run. The
     *   wording is the panel's, not the caller's.
     */
    renderResults(results, scan) {
      const el = root.querySelector('.sov-results');
      rendered = results;
      selected = null;
      const summary = { ...scan, candidates: results.length };
      $('.sov-prefill-src').textContent = '';   // the old selection is gone
      el.innerHTML = resultsHtml(results, scanSummaryText(summary));

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => {
          // Selecting and expanding are one gesture; Prefill needs a selection
          // the user can see they made.
          select(Number(row.dataset.n));
          toggleDetail(row, results[Number(row.dataset.n)], readSettings().settings, optimiseSite);
        });
      });
    },
    renderIncomplete(list) {
      incomplete = list;
      drawIncomplete();
    },
  };
}

/**
 * The ceiling that set a site's tax, named for the reader. The engine's codes
 * stay as they are — the CSV exports them, and a spreadsheet filters on a stable
 * token rather than on prose.
 */
const BINDING_LABEL = {
  cap: 'Tax cap',
  food: 'Food',
  rp: 'Research',
  res: 'Resources',
};

export function bindingLabel(binding) {
  return BINDING_LABEL[binding] ?? binding;
}

const count = (v) => Number(v ?? 0).toLocaleString('en-GB');

/**
 * What the scan looked at and what it found. Said whether or not it found a site:
 * a region with no candidate is where the area covered matters most.
 */
export function scanSummaryText(scan) {
  const side = 2 * scan.zoom + 1;
  return `Centred on ${scan.x}|${scan.y}, ${side}×${side} tiles. Checked ${
    count(scan.scanned)} tiles and found ${count(scan.candidates)} candidate${
    scan.candidates === 1 ? '' : 's'}.`;
}


/** The last column: whatever the row has to warn about, space-separated. */
function flagsHtml(r) {
  const flags = [];
  const res = resFlag(r);
  if (res) flags.push({ cls: 'sov-flag', ...res });
  if (r.milsovBlocked) {
    flags.push({
      cls: 'sov-flag',
      text: 'no military',
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
      text: `minimum at ${r.milsovMinTax.toFixed(0)}%`,
      title: `This site reaches your minimum military bonus (+${r.milsovMinBonusAt}%) `
        + `at ${r.milsovMinTax.toFixed(0)}% tax, against the ${r.tMax.toFixed(0)}% it holds `
        + `on food alone. Open the row and drag the tax slider to see the trade.`,
    });
  }
  // Descriptor bonuses riding on a building the structure table does not carry.
  // Nothing does today — every building the descriptors name is a Production
  // Structure — so this is dormant rather than dead: the table is read off the
  // game, and a row naming something unknown must not pass silently.
  const conditional = conditionalDescriptors(r);
  if (conditional.size) {
    flags.push({
      cls: 'sov-advice',
      text: 'conditional bonus',
      title: `${[...conditional].map(([b, n]) => `${n}× ${b}`).join(', ')} — these tiles carry a `
        + `terrain bonus that only pays if the city has that building. Not scored either way.`,
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
 *
 * `geom` is the square the claim grid draws and the centre it draws it around.
 */
function planBlockHtml({ ctx, base, plan, floor, geom }) {
  // Whole points only, because that is all the game accepts — a half-point drag
  // would report a plan at a tax the user cannot set.
  const lowest = Math.ceil(floor);
  const slider = ctx && Number.isFinite(base.tMax) && base.tMax - lowest >= 1
    ? `<div class="sov-tax">
        <div class="sov-f"><span>Tax <output class="sov-tax-at">${plan.tax.toFixed(0)}%</output>
          <span class="sov-hint">— drag to trade tax for sovereignty</span></span>
          <input type="range" class="sov-tax-range" min="${lowest}" max="${base.tMax}"
            step="1" value="${plan.tax}"></div>
      </div>`
    : '';
  return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base, geom)}</div>`;
}

/**
 * Make a rendered plan block live. Does nothing when there is no slider.
 * `onTax` records the rate the user dragged to, so redrawing the block after a
 * tile is crossed out can come back to it.
 */
function bindPlanBlock(scope, ctx, base, geom, onTax) {
  const range = scope.querySelector('.sov-tax-range');
  if (!range) return;
  const at = scope.querySelector('.sov-tax-at');
  const body = scope.querySelector('.sov-body-at');
  range.addEventListener('input', () => {
    const tax = Number(range.value);
    at.textContent = `${tax.toFixed(0)}%`;
    onTax?.(tax);
    const plan = planSiteAt(ctx, tax);
    body.innerHTML = plan
      ? detailBodyHtml(plan, base, geom)
      : '<p class="sov-flag">This site cannot hold that tax.</p>';
  });
}

/**
 * Render the plan block into `scope` and keep it live: the slider re-plans at a
 * new tax, and clicking a grid cell crosses that tile out and re-plans without
 * it. Exclusions live here and nowhere else, so closing the block clears them.
 *
 * @param {Element} scope the element to own the block
 * @param {object} state `{neighbours, settings, ctx, base, floor, geom, tax}`.
 *   `ctx` and `base` are the caller's own, used while nothing is crossed out;
 *   `neighbours` is the site's claimable tiles unfiltered, and without them the
 *   block cannot re-plan, so it renders once and takes no clicks
 */
function mountPlanBlock(scope, state) {
  const excluded = new Set();
  let tax = state.tax;

  const draw = () => {
    // Rebuilding the knapsack with nothing crossed out would only reproduce the
    // ctx the caller handed over, and it is the expensive part of the plan.
    let ctx = state.ctx;
    let base = state.base;
    if (excluded.size) {
      const usable = state.neighbours.filter((n) => !excluded.has(cellKey(n.dx, n.dy)));
      ctx = usable.length ? prepareSite({ neighbours: usable, settings: state.settings }) : null;
      base = ctx ? scoreSiteFrom(ctx) : null;
    }
    const geom = { ...state.geom, excluded, pickable: !!state.neighbours };

    if (!base) {
      scope.innerHTML = `<p class="sov-flag">No plan holds with those tiles crossed out.</p>${
        planGridHtml({ tiles: [], free: [], milsov: [] }, geom)}`;
      return;
    }
    // A smaller neighbourhood may not hold the tax the user dragged to.
    tax = Math.min(base.tMax, Math.max(Math.ceil(state.floor), tax));
    const plan = (ctx ? planSiteAt(ctx, tax) : null) ?? base;
    scope.innerHTML = planBlockHtml({ ctx, base, plan, floor: state.floor, geom });
    bindPlanBlock(scope, ctx, base, geom, (t) => { tax = t; });
  };

  // Delegated once, since every redraw replaces the grid inside `scope`.
  scope.addEventListener('click', (e) => {
    const cell = e.target.closest('.sov-pick');
    if (!cell || !scope.contains(cell)) return;
    const key = cellKey(Number(cell.dataset.dx), Number(cell.dataset.dy));
    if (!excluded.delete(key)) excluded.add(key);
    draw();
  });
  draw();
}

function toggleDetail(row, result, settings, onOptimise) {
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

  const cell = document.createElement('td');
  cell.colSpan = 8;
  // The button sits outside the plan block, which rewrites its own innerHTML on
  // every redraw — inside it, the first tax drag would take the button with it.
  const actions = document.createElement('p');
  actions.className = 'sov-detail-actions';
  actions.innerHTML = `<button type="button" class="sov-optimise sec">Optimise ${
    result.x}|${result.y} →</button>`;
  actions.querySelector('.sov-optimise').addEventListener('click', () => onOptimise?.(result));
  const block = document.createElement('div');
  cell.append(actions, block);
  tr.append(cell);
  row.after(tr);
  mountPlanBlock(block, {
    neighbours: result.neighbours ?? null,
    settings,
    ctx,
    base: result,
    floor: Math.min(settings.tMin ?? 0, result.tMax),
    geom: { radius: Math.round(settings.rClaim ?? 2), x: result.x, y: result.y },
    tax: result.tax,
  });
}

/**
 * What preserving cost, and what it could not account for. Uncredited production
 * understates a settled city rather than overstating it, so the plan errs toward
 * caution — but the reader still has to be told which way it leans.
 */
function keptNote(kept) {
  if (!kept?.claims?.length && !kept?.unknownLevel) return '';
  const parts = [];
  if (kept.claims.length) {
    parts.push(`Keeping ${kept.claims.length} claim${kept.claims.length === 1 ? '' : 's'} you `
      + `already hold, costing ${Math.round(kept.rp).toLocaleString('en-GB')} research and `
      + `${Math.round(kept.rp * 10).toLocaleString('en-GB')} gold an hour. The plan below is `
      + 'what fits on top of that. Any food or military bonus those claims already produce is '
      + 'not counted — the map does not say what is built on them.');
  }
  if (kept.unknownLevel) {
    parts.push(`${kept.unknownLevel} more could not be read and are ignored.`);
  }
  return parts.join(' ');
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
    keptNote(r.kept),
  ].filter(Boolean);
  // Loud, but still not enforced — the plan below is rendered either way.
  const warnings = [];
  if (!r.centre.settleable) {
    warnings.push('This tile cannot be settled and its claims cannot be placed — '
      + 'the plan below is for analysis only.');
  }
  if (r.centre.isTown) warnings.push('This tile already carries a town.');
  if (r.centre.claimedBy) warnings.push(`This tile is already claimed (${r.centre.claimedBy}).`);

  // The settable rate first, since it is the one the user types into the game;
  // the exact ceiling behind it says how much of the next point is already paid.
  const exact = Number.isFinite(r.base.tMaxExact)
    ? ` The arithmetic reaches ${r.base.tMaxExact.toFixed(2)}%, but tax is whole numbers only.`
    : '';
  const ceiling = `<p class="sov-note">Highest tax this tile holds on food alone: <strong>${
    r.base.tMax.toFixed(0)}%</strong>, limited by ${escapeHtml(bindingLabel(r.base.binding).toLowerCase())}.${exact}</p>`;
  const asked = r.aboveCeiling
    ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(0)}% — the plan below `
      + `is at its ceiling of ${r.ceiling.toFixed(0)}%.</p>`
    : '';

  // The plan block owns state, so the caller mounts it into the empty div rather
  // than it being rendered into this string.
  return `<h3>${r.x}|${r.y}</h3>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join('')}
    ${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join('')}
    ${ceiling}${asked}
    <div class="sov-plan-block"></div>`;
}

/** A sovereignty level as its numeral, or as the number itself if it is not 1-5. */
function roman(level) {
  return SOV_LEVEL_ROMAN[level - 1] ?? String(level);
}

const FOOD_ICON = `<img src="${ICONS.food}" alt="food">`;
const CROSS = '<span class="sov-x">✕</span>';

/** How a grid cell and an exclusion name the same tile. */
export function cellKey(dx, dy) {
  return `${dx},${dy}`;
}

/**
 * One cell's markup. `body` is icon HTML or already-escaped text; `badge` is the
 * terrain descriptor line, already markup. `pick` makes the cell clickable and
 * carries the offsets the click handler reads back.
 */
function gridCell({ cls, title, level, body, badge, dx, dy, pick }) {
  return `<td class="sov-cell ${cls}${pick ? ' sov-pick' : ''}"${
    pick ? ` data-dx="${dx}" data-dy="${dy}"` : ''} title="${escapeHtml(title)}">${
    level ? `<span class="sov-lv">${level}</span>` : ''}${
    body ? `<span class="sov-cv">${body}</span>` : ''}${badge ?? ''}</td>`;
}

/**
 * The plan as a map: the town in the middle, every claim on the tile it sits on,
 * x across the top and y down the left, highest y in the top row so the grid sits
 * the way the game map does.
 *
 * Only claimable tiles reach the panel, so water, foreign claims and unsettleable
 * terrain are crossed out too — a tile the plan cannot have looks the same
 * whether the game ruled it out or the user did.
 *
 * A tile in `excluded` is drawn crossed whatever the plan says, so a stale plan
 * cannot show a claim on a square the user has ruled out.
 *
 * @param {object} plan the plan to draw, as planSiteAt returns it
 * @param {{radius: number, x: number, y: number, excluded: Set<string>,
 *   pickable: boolean}} geom the square to draw, the centre's own coordinates,
 *   the tiles crossed out by the user, and whether cells respond to a click.
 *   Non-finite coordinates fall back to offset labels
 * @returns {string} the grid, with its legend under it
 */
/**
 * A tile's terrain descriptor, as the tail of its hover text.
 *
 * Three outcomes, and they have to read differently. A descriptor that grants
 * something names it. A terrain known to grant nothing says so — that is an
 * answer, not a blank. An `i` nothing identifies says THAT, so the user can
 * tell "this tile is plain" from "the tool does not know this tile".
 *
 * A bonus is marked only when it rides on a building the structure table has no
 * entry for, which nothing does today — see descriptorFor.
 */
export function descriptorText(tile) {
  // No `i` is not an unidentified `i`: there is nothing to say, so say nothing.
  // Only a value the table has no row for is worth flagging.
  if (typeof tile?.i !== 'number' && !tile?.descriptor) return '';
  const d = tile?.descriptor ?? descriptorFor(tile.i);
  if (!d) return `, terrain ${tile.i} — unidentified`;
  const varies = d.nodeClass ? ' (rating varies; not a fixed terrain)' : '';
  // Named by the client but never read on a tile. Distinct from "grants
  // nothing", which is an answer, and from an unidentified `i`, which the game
  // itself does not know either.
  if (d.bonusUnread) return `, ${d.name}${varies} — bonus not read yet`;
  if (d.nodeClass) return `, ${d.name}${varies}`;
  if (!d.building) return `, ${d.name} — no sovereignty bonus`;
  const conditional = d.conditional ? `, needs a ${d.building}` : '';
  const disputed = d.disputed ? ' [unconfirmed]' : '';
  return `, ${d.name}: +${d.bonus}% ${d.product} per level of ${d.building}${conditional}${disputed}`;
}

/**
 * The results pane, summary and all.
 *
 * Separate from `renderResults` because that one needs a document and this is
 * where the mistakes are: the summary was once built inside the table branch,
 * so a scan that found no site printed "No sites met the minimum tax." and
 * threw away everything the scan had learned — the tile count and the exclusion
 * breakdown. A region with no candidate is exactly where those are worth the
 * most. The summary belongs to the scan, not to the table.
 */
export function resultsHtml(results, summary) {
  const head = `<p>${summary}</p>`;
  if (!results?.length) return `${head}<p>No sites met the minimum tax.</p>`;
  const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td>${r.x}|${r.y}</td>
          <td${Number.isFinite(r.tMaxExact)
    ? ` title="The arithmetic reaches ${r.tMaxExact.toFixed(2)}%, but tax is whole numbers only, so the plan is made at this rate."`
    : ''}>${Number.isFinite(r.tMax) ? r.tMax.toFixed(0) : r.tMax}%</td>
          <td>${bindingLabel(r.binding)}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td>${r.milsovBonus ? `+${r.milsovBonus}%` : ''}</td>
          <td>${flagsHtml(r)}</td>
        </tr>`).join('');
  return `
        ${head}
        <table>
          <thead><tr><th>Site</th>
            <th title="The highest whole-number tax this site can hold on food alone — the game takes no other kind">Max Tax</th>
            <th title="Which ceiling stops the tax going any higher">Limited By</th><th>Food</th>
            <th title="Research per hour the claims cost">Research</th><th>Net Gold</th>
            <th title="Free military unit production bonus — costs this site no tax">Military</th>
            <th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
}

/** Which claimed tiles name a building the structure table does not carry. */
function conditionalDescriptors(plan) {
  const out = new Map();
  for (const t of [...(plan?.tiles ?? []), ...(plan?.milsov ?? [])]) {
    const d = t.descriptor ?? descriptorFor(t.i);
    if (d?.conditional) out.set(d.building, (out.get(d.building) ?? 0) + 1);
  }
  return out;
}

/**
 * The descriptor bonus as it appears ON the tile: "+3% Bows". Read at a glance
 * across the whole grid, which is the point — hovering shows one tile at a time,
 * and the interesting question is which tile in the ring is worth which
 * structure.
 *
 * The PRODUCT is written out rather than drawn, because the products are what
 * distinguish the rungs and the icon set cannot. Bowyer makes Bows and Target
 * Range makes Ranged Units; Farrier and Jousting Yard both mean horses;
 * Engineering Yard and Assembly Yard both mean siege. One icon each would make
 * six of the eighteen unreadable, and there is no art at all for saddles,
 * livestock, beer, chainmail, leather armour, spears, books or diplomats.
 *
 * Empty for terrain that grants nothing and for terrain nothing has identified;
 * both of those are answered in the hover text, where there is room to say
 * which of the two it is.
 */
export function descriptorBadge(tile) {
  const d = tile?.descriptor ?? (typeof tile?.i === 'number' ? descriptorFor(tile.i) : null);
  if (!d?.building) return '';
  return `<span class="sov-desc" title="${escapeHtml(
    `+${d.bonus}% ${d.product} per level of ${d.building}`)}">+${d.bonus}% ${
    escapeHtml(d.product)}</span>`;
}

export function planGridHtml(plan, geom) {
  const r = Math.max(1, Math.round(geom?.radius ?? 0) || spanOf(plan));
  const cx = geom?.x;
  const cy = geom?.y;
  const excluded = geom?.excluded ?? new Set();
  const kept = new Map((geom?.kept ?? []).map((k) => [cellKey(k.dx, k.dy), k]));
  const pickable = !!geom?.pickable;
  const absolute = Number.isFinite(cx) && Number.isFinite(cy);
  // Real coordinates where they are known, since those are what the user types
  // into the game.
  const xLabel = (dx) => (absolute ? String(cx + dx) : signed(dx));
  const yLabel = (dy) => (absolute ? String(cy + dy) : signed(dy));
  const name = (dx, dy) => (absolute ? `${cx + dx}|${cy + dy}` : `${signed(dx)},${signed(dy)}`);

  const specs = new Map();

  // `free` goes down first because the other two overwrite it: military claims
  // are placed on free tiles, so those squares appear in both lists.
  for (const t of plan.free ?? []) {
    specs.set(cellKey(t.dx, t.dy), {
      cls: t.water ? 'sov-cell-free sov-cell-water' : 'sov-cell-free',
      badge: descriptorBadge(t),
      title: `${name(t.dx, t.dy)} — unclaimed${t.water ? ' water' : ''}, food ${t.food}, `
        + `distance ${t.d.toFixed(2)}${descriptorText(t)}`,
      body: `${FOOD_ICON} ${t.food}`,
    });
  }
  for (const t of plan.tiles ?? []) {
    specs.set(cellKey(t.dx, t.dy), {
      cls: 'sov-cell-food',
      badge: descriptorBadge(t),
      title: `${name(t.dx, t.dy)} — Sov ${roman(t.level)} food claim, food ${t.food}, `
        + `distance ${t.d.toFixed(2)}, ${t.rp.toFixed(0)} RP${descriptorText(t)}`,
      level: roman(t.level),
      body: `${FOOD_ICON} ${t.food}`,
    });
  }
  for (const m of plan.milsov ?? []) {
    const structure = sovStructure(m);
    const icon = STRUCTURE_ICONS[structure.key];
    specs.set(cellKey(m.dx, m.dy), {
      cls: 'sov-cell-mil',
      badge: descriptorBadge(m),
      title: `${name(m.dx, m.dy)} — Sov ${roman(m.sovLevel)} claim carrying a level `
        + `${m.buildingLevel} ${structure.name}, distance ${m.d.toFixed(2)}, `
        + `${m.rp.toFixed(0)} RP, ${structureUpkeep(m).toLocaleString('en-GB')}/hr upkeep`
        + descriptorText(m),
      level: roman(m.sovLevel),
      body: `${icon ? `<img src="${icon}" alt="${escapeHtml(structure.name)}">` : ''} L${
        m.buildingLevel}`,
    });
  }

  const cell = (dx, dy) => {
    if (dx === 0 && dy === 0) {
      return gridCell({ cls: 'sov-cell-town', title: `${name(0, 0)} — the town`, level: 'TOWN' });
    }
    if (excluded.has(cellKey(dx, dy))) {
      return gridCell({
        cls: 'sov-cell-out',
        title: `${name(dx, dy)} — crossed out${pickable ? ', click to put it back' : ''}`,
        body: CROSS,
        dx,
        dy,
        pick: pickable,
      });
    }
    const spec = specs.get(cellKey(dx, dy));
    if (!spec) {
      // A kept claim is not in the plan — it was never claimable — so it is
      // drawn from the site's own record rather than from `plan`.
      const k = kept.get(cellKey(dx, dy));
      if (k) {
        return gridCell({
          cls: 'sov-cell-kept',
          title: `${name(dx, dy)} — Sov ${roman(k.level)} claim you already hold, distance ${
            k.d.toFixed(2)}, ${k.rp.toFixed(0)} RP. Kept as it is.`,
          level: roman(k.level),
          body: 'kept',
        });
      }
      return gridCell({ cls: 'sov-cell-none', title: `${name(dx, dy)} — not claimable`, body: CROSS });
    }
    return gridCell({ ...spec, dx, dy, pick: pickable });
  };

  const head = `<tr><th></th>${
    range(r).map((dx) => `<th>${xLabel(dx)}</th>`).join('')}</tr>`;
  // Descending, so the highest y is the top row.
  const body = range(r).slice().reverse().map((dy) =>
    `<tr><th>${yLabel(dy)}</th>${range(r).map((dx) => cell(dx, dy)).join('')}</tr>`).join('');

  return `<div class="sov-grid-wrap"><table class="sov-grid">
      <thead>${head}</thead><tbody>${body}</tbody></table></div>
    <p class="sov-legend"><b class="sov-key-food">I–V</b> food claim,
      <b class="sov-key-mil">I–V</b> military claim with its building level,
      <b class="sov-key-free">grey</b> claimable but unclaimed,
      <b class="sov-key-out">✕</b> not available${
  kept.size ? ', <b class="sov-key-kept">I–V</b> already yours and kept' : ''}.${
  pickable ? ' Click a tile to cross it out and re-plan without it.' : ''}
      A tile's third line is its terrain bonus, if it has one.
      Hover for distance, research cost, upkeep and the full descriptor.</p>`;
}

/** -r..r, for both axes. */
function range(r) {
  return Array.from({ length: 2 * r + 1 }, (_, i) => i - r);
}

function signed(v) {
  return `${v >= 0 ? '+' : ''}${v}`;
}

/**
 * How far out the plan itself reaches, for a caller with no radius to hand. An
 * outer ring that is entirely unclaimable is invisible from the plan, so this can
 * draw a smaller square than the site was scored over.
 */
function spanOf(plan) {
  let span = 1;
  for (const t of [...(plan.free ?? []), ...(plan.tiles ?? []), ...(plan.milsov ?? [])]) {
    span = Math.max(span, Math.abs(t.dx), Math.abs(t.dy));
  }
  return span;
}

/**
 * Everything about one plan, at the tax it is run at. Rendered from the plan
 * alone so the slider can replace it wholesale — the balance, the buildings and
 * the claim grid all move together, which is the point of dragging it.
 *
 * `base` is the plan at the site's own maximum, so a lower tax can say what it
 * bought and what it cost rather than leaving two screens of numbers to diff.
 */
function detailBodyHtml(plan, base, geom) {
  // A ceiling only BINDS at the tax it was solved for. Below that everything has
  // slack, so marking a row "binds" there would be a lie.
  const atCeiling = Math.abs(plan.tax - plan.tMax) < 0.05;
  const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null);
  const num = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-GB') : '');
  const balance = rows.length
    ? `<table class="sov-balance"><thead><tr><th>At ${plan.tax.toFixed(0)}% Tax</th>
        <th>Produced</th><th>Spent</th><th>Net</th><th></th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${productionLabel(r.icon)}</td><td class="sov-hint">${num(r.base)}</td>
        <td class="sov-hint">${num(r.spent)}</td><td class="${
        r.value < 0 ? 'sov-bad' : 'sov-ok'}">${num(r.value)}</td>
        <td class="sov-hint">${r.note}</td></tr>`).join('')}</tbody></table>`
    : '';

  const milPlan = plan.milsov.length
    ? milsovPlanHtml(plan)
    : plan.milsovBlocked
      ? `<p class="sov-flag">No military sovereignty fits at this tax — ${
        escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? 'nothing was left over')}.</p>`
      : '';

  const res = upkeepLimitHtml(plan);

  // What this tax cost, against the plan at the top of the slider. What it bought
  // is the military line above, so only the price is stated here. The food claim
  // count is in it because dropping one is usually where the research for the
  // buildings came from.
  const claimDelta = plan.tiles.length - base.tiles.length;
  const goldDelta = Math.round(plan.goldNet - base.goldNet);
  const signed = (v) => `${v >= 0 ? '+' : ''}${v.toLocaleString('en-GB')}`;
  const trade = plan.tax < base.tMax - 0.05
    ? `<p class="sov-hint">Against the ${base.tMax.toFixed(1)}% ceiling, which fits ${
      base.milsovBonus ? `+${base.milsovBonus}%` : 'no military bonus'}: ${
      signed(claimDelta)} food claims, ${signed(goldDelta)} gold/hr.</p>`
    : '';

  // The balance goes first, directly under the slider, so dragging moves numbers
  // the eye is already on. The grid is the tallest block, so it goes last rather
  // than pushing the table off the screen.
  return `${balance}${milPlan}${res}${trade}${planGridHtml(plan, geom)}`;
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

// RFC 4180 says CRLF between records, and every spreadsheet reads it. LF alone
// is what a bare join produces and what Excel on Windows renders as one line.
const CSV_EOL = '\r\n';

// A UTF-8 byte-order mark. Excel reads a BOM-less file as the system codepage,
// which turns the em dash in the military plan into mojibake — the one column
// that is prose is the one that breaks, and it breaks silently.
export const CSV_BOM = '﻿';

/**
 * `T_res` stays a number or blank, so a spreadsheet can total the column: the
 * two cases that have no number — no milsov requested, and no plots of the
 * binding resource — are told apart by `res_status` rather than by a sentinel
 * in the numeric column. Blank status means the ceiling was applied for real.
 */
function resColumns(r) {
  if (!r.resIndicative) {
    return [num(r.resCeiling, 2), Number.isFinite(r.resCeiling) ? r.resBinding : '', ''];
  }
  return r.resImpossible
    ? ['', r.resBinding, 'impossible']
    : [num(r.resCeiling, 2), r.resBinding, 'indicative'];
}

/**
 * A number, or blank where there is nothing to state. Blank rather than a
 * sentinel so a column stays summable: -Infinity and null both poison a SUM,
 * and "not applicable" is not a quantity.
 */
function num(v, dp = 0) {
  return Number.isFinite(v) ? v.toFixed(dp) : '';
}

export function toCsv(results) {
  // `T_max` is the whole-number rate the plan is made at — the one to type into
  // the game — and `T_max_exact` the ceiling it was floored from, so a row can be
  // audited without re-deriving it. The one free-text field stays last, so a
  // column added later does not land after the only one that can carry a comma.
  const head = ['x', 'y', 'T_max', 'T_max_exact', 'binding', 'S_food', 'U_RP', 'U_gold',
    'Gold_net', 'milsov_buildings', 'milsov_bonus', 'milsov_upkeep', 'milsov_RP',
    'milsov_gold', 'milsov_price', 'milsov_min_tax', 'milsov_min_bonus',
    'T_res', 'res_binding', 'res_status', 'milsov_plan'];
  const lines = results.map((r) =>
    [r.x, r.y, num(r.tMax), num(r.tMaxExact, 2), r.binding, num(r.sFood),
     num(r.uRp), num(r.uGold), num(r.goldNet),
     r.milsov?.length ?? 0, r.milsovBonus ?? 0, r.milsovUpkeep ?? 0,
     num(r.milsovRp ?? 0), num(r.milsovGold ?? 0), r.milsovPrice ?? 0,
     // Where a minimum bonus is met, if it was not met for free. Blank covers
     // both "nothing was asked for" and "nothing in range reaches it" — the
     // milsovShortfall rows never reach the export, having been filtered out.
     num(r.milsovMinTax), num(r.milsovMinBonusAt),
     ...resColumns(r),
     milsovPlanText(r)].map(csvField).join(','));
  return [head.join(','), ...lines].join(CSV_EOL);
}

/** toCsv as the bytes to hand a download: BOM first, so Excel reads UTF-8. */
export function csvFile(results) {
  return CSV_BOM + toCsv(results);
}

/** `sov-sites-20260808-2043.csv` — sortable, and two exports never collide. */
export function csvFilename(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `sov-sites-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`
    + `-${p(now.getHours())}${p(now.getMinutes())}.csv`;
}
