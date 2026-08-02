// Side panel UI — PRD §5. v1 is panel-only; the map overlay is v2 and
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
  SOV_QUOTA_STRUCTURES,
  SOV_LEVEL_ROMAN,
} from './constants.js';
import {
  computeBOther,
  computeK,
  sovStructure,
  isProductionStructure,
  structureUpkeep,
  milsovUpkeep,
} from './scoring.js';

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
.sov-advice{color:#6bf}
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
/* Three controls plus a button do not fit one 420px line, so the row wraps and
   the structure name — the longest of them — takes what is left, dropping to a
   line of its own rather than being squeezed to nothing. */
.sov-milsov-row{display:flex;gap:4px;margin:2px 0;align-items:center;flex-wrap:wrap}
.sov-milsov-row select{min-width:0}
.sov-milsov-row select[data-milsov=structure]{flex:1 1 150px}
.sov-milsov-row span{color:#a9a9a9;font-size:11px;white-space:nowrap}
.sov-milsov-row button{padding:2px 8px}
.sov-milsov-total{color:#b9c4b9}
`;

// --- Settings model ---------------------------------------------------------

/** Plot order matches the payload's `rs` string: "wood|clay|iron|stone|food". */
export const PLOT_KEYS = ['wood', 'clay', 'iron', 'stone', 'food'];

/** Every land tile has 25 plots, so an allocation has to spend exactly 25. */
export const PLOT_TOTAL = 25;

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
 * Turn the quota rows into the `[{structure, sovLevel, buildingLevel}]` the
 * engine expects — **one entry per building**, since one row is one building.
 *
 * The building level is clamped to its claim's sovereignty level, which is the
 * game's own rule, and defaults to it when blank. The structure goes through
 * sovStructure, so a blank or unknown one lands on the same default the engine
 * would have charged it as. Rows are returned highest first, the order the
 * engine assigns in, so the form lists them the way they will be applied.
 */
export function normaliseMilsovQuota(rows) {
  const out = [];
  for (const row of rows ?? []) {
    const sovLevel = clampNumber(row?.sovLevel, { min: 1, max: 5, integer: true, fallback: 0 });
    if (sovLevel < 1) continue;
    const asked = clampNumber(row?.buildingLevel, { min: 1, max: 5, integer: true, fallback: sovLevel });
    out.push({
      structure: sovStructure(row).key,
      sovLevel,
      buildingLevel: Math.min(asked, sovLevel),
    });
  }
  return out.sort((a, b) => b.sovLevel - a.sovLevel || b.buildingLevel - a.buildingLevel);
}

/** How the quota's rows split between the charged kind and the free kind. */
export function milsovStructureCounts(quota) {
  const production = (quota ?? []).filter(isProductionStructure).length;
  return { production, resource: (quota ?? []).length - production };
}

/**
 * What the quota costs per hour, for the read-out under the rows. A quota with
 * no Production Structure in it costs nothing per hour and has to say so —
 * quoting a figure of 0/hr of four resources reads like an error, and quoting
 * one that is not charged is worse.
 */
export function milsovTotalText(quota) {
  const { resource } = milsovStructureCounts(quota);
  const upkeep = milsovUpkeep(quota);
  const free = resource === 0 ? ''
    : resource === 1 ? " 1 Resource Structure costs only its claim's RP and gold."
    : ` ${resource} Resource Structures cost only their claims' RP and gold.`;
  if (upkeep === 0) return `no hourly resource cost.${free}`;
  return `${upkeep.toLocaleString('en-GB')}/hr of each of wood, clay, iron and stone.${free}`;
}

/**
 * How a site's resource ceiling should read on its row.
 *
 * The engine reports this ceiling without applying it, because the yield behind
 * it is borrowed rather than measured. That is the right call for ranking and
 * the wrong one for silence: a site whose military sovereignty is unaffordable
 * would otherwise sit in the table looking clean. So the row says so, and says
 * that it did not affect the ranking.
 *
 * Returns null when there is nothing to report — no milsov quota, or a ceiling
 * above the tax the site actually reaches, where the upkeep is already covered.
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

  { key: 'chancery', group: 'Sovereignty', label: 'Chancery of Estates (x0.6 upkeep)', type: 'checkbox' },
  { key: 'rClaim', group: 'Sovereignty', label: 'Claim radius R_claim', type: 'number', min: 1, max: 6, integer: true, fallback: 2 },
  { key: 'maxBuildings', group: 'Sovereignty', label: 'Max buildings', type: 'number', min: 0, max: 200, integer: true, fallback: 20 },
  { key: 'milsovQuota', group: 'Sovereignty', label: 'Milsov quota', type: 'milsov' },
  { key: 'milsovAdvisory', group: 'Sovereignty', label: 'Milsov level advisory', type: 'checkbox' },

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

/**
 * The structure picker, grouped by whether the choice costs anything hourly —
 * which is the only thing about it the score depends on, so it is what the
 * groups are labelled with. A resource structure also says what it raises,
 * since its name alone does not.
 */
function structureOptionsHtml(selected) {
  const group = (label, type) =>
    `<optgroup label="${escapeHtml(label)}">${SOV_QUOTA_STRUCTURES
      .filter((s) => s.type === type)
      .map((s) => `<option value="${s.key}"${s.key === selected ? ' selected' : ''}>${
        escapeHtml(s.boosts ? `${s.name} (${s.boosts})` : s.name)}</option>`)
      .join('')}</optgroup>`;
  return group('Production Structures — 150–2,400/hr each W/C/I/S', 'production')
    + group('Resource Structures — no hourly resource cost', 'resource');
}

/**
 * One row is ONE building, and it carries the two levels the game sets
 * separately: the claim's sovereignty level, which fixes its RP and gold and
 * scales with distance, and the level of the structure standing on it, which
 * fixes the production bonus and, for a Production Structure, the flat
 * wood/clay/iron/stone upkeep.
 *
 * The third control decides whether that flat upkeep is charged at all. It is
 * picked by name rather than by class because the name is what the user
 * recognises; the class behind it is what the score reads.
 *
 * Building levels above the claim are rendered disabled rather than omitted —
 * the ceiling is part of what the control has to teach. No box is a count; that
 * ambiguity is what the labels exist to kill.
 */
function milsovRowHtml(row) {
  const sovLevel = row?.sovLevel ?? 5;
  const buildingLevel = Math.min(row?.buildingLevel ?? sovLevel, sovLevel);
  const structure = sovStructure(row).key;
  const sov = [5, 4, 3, 2, 1].map((l) =>
    `<option value="${l}"${l === sovLevel ? ' selected' : ''}>Sov ${SOV_LEVEL_ROMAN[l - 1]}</option>`).join('');
  const building = [5, 4, 3, 2, 1].map((l) =>
    `<option value="${l}"${l === buildingLevel ? ' selected' : ''}${
      l > sovLevel ? ' disabled' : ''}>level ${l}</option>`).join('');
  return `<div class="sov-milsov-row">
      <select data-milsov="sovLevel" title="Sovereignty level of the claim — sets its RP and gold upkeep, which also scales with distance">${sov}</select>
      <span>carrying a</span>
      <select data-milsov="buildingLevel" title="Level of the structure on that tile — sets the production bonus and, on a Production Structure, the hourly wood/clay/iron/stone upkeep. Cannot exceed the claim's sovereignty level">${building}</select>
      <select data-milsov="structure" title="Which structure stands on the tile. Production Structures cost 150–2,400/hr of each of wood, clay, iron and stone by building level; Resource Structures cost nothing beyond the claim's RP and gold">${structureOptionsHtml(structure)}</select>
      <button type="button" class="sov-milsov-del sec" title="Remove this building">&times;</button>
    </div>`;
}

function milsovFieldHtml(f, quota) {
  return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} — <strong>one row is one building</strong>,
        reserved on the nearest tiles before food claims are chosen. Add a row per
        building you intend to place. Food sovereignty is not entered here — the
        Farmstead and Fishery claims are chosen by the food plan itself.</p>
      <div class="sov-milsov-rows">${(quota ?? []).map(milsovRowHtml).join('')}</div>
      <p class="sov-hint sov-milsov-empty">No military sovereignty requested.</p>
      <p class="sov-hint sov-milsov-total"></p>
      <button type="button" class="sov-milsov-add sec">+ Add building</button>
    </div>`;
}

function fieldHtml(f, settings) {
  const v = settings[f.key];
  switch (f.type) {
    case 'checkbox': return checkboxFieldHtml(f, v);
    case 'select': return selectFieldHtml(f, v);
    case 'plots': return plotsFieldHtml(f, v);
    case 'calibration': return calibrationFieldHtml(f, v);
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
      <p class="sov-hint">Settings live in memory for this session only,
        and are applied on the next Scan.</p>
    </form>`;
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

export function createPanel({ onScan, onExport }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sov-panel';
  root.innerHTML = `
    <h2>Sovereignty Scanner</h2>
    <div class="sov-body">
      <p><button class="sov-scan">Scan</button>
         <button class="sov-settings sec">Settings</button>
         <button class="sov-export sec">Export CSV</button></p>
      <div class="sov-settings-form" hidden>${settingsFormHtml(DEFAULT_SETTINGS)}</div>
      <div class="sov-status"></div>
      <div class="sov-results"></div>
      <div class="sov-incomplete"></div>
    </div>`;
  document.body.appendChild(root);

  const $ = (sel) => root.querySelector(sel);
  const form = $('.sov-form');
  const scanBtn = $('.sov-scan');
  let rendered = [];       // the results currently in the table
  let selected = null;     // the row Prefill copies `rs` from

  root.querySelector('h2').addEventListener('click', () => root.classList.toggle('sov-collapsed'));
  scanBtn.addEventListener('click', onScan);
  $('.sov-export').addEventListener('click', onExport);
  $('.sov-settings').addEventListener('click', () => {
    const f = $('.sov-settings-form');
    f.hidden = !f.hidden;
  });

  // --- reading the form ---

  function plotInputs() {
    const raw = {};
    for (const p of PLOT_KEYS) raw[p] = form.querySelector(`[data-plot="${p}"]`).value;
    return raw;
  }

  function milsovRow(row) {
    return {
      structure: row.querySelector('[data-milsov="structure"]').value,
      sovLevel: row.querySelector('[data-milsov="sovLevel"]').value,
      buildingLevel: row.querySelector('[data-milsov="buildingLevel"]').value,
    };
  }

  function milsovRows() {
    return [...form.querySelectorAll('.sov-milsov-row')].map(milsovRow);
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
          out.milsovQuota = normaliseMilsovQuota(milsovRows());
          break;
        case 'calibration':
          out.rpCalibration = parseRpCalibration(
            form.querySelector('[data-cal="observedRpPerHour"]').value,
            form.querySelector('[data-cal="atTax"]').value,
          );
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
          form.querySelector('.sov-milsov-rows').innerHTML = (v ?? []).map(milsovRowHtml).join('');
          break;
        case 'calibration':
          form.querySelector('[data-cal="observedRpPerHour"]').value = v?.observedRpPerHour ?? '';
          form.querySelector('[data-cal="atTax"]').value = v?.atTax ?? 0;
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

  function refresh() {
    const { settings: s } = readSettings();

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

    // What the quota actually asks for, in the units the ceiling is charged in.
    // The row controls say what each building is; this says what they add up to.
    const quota = normaliseMilsovQuota(milsovRows());
    form.querySelector('.sov-milsov-empty').hidden = quota.length > 0;
    form.querySelector('.sov-milsov-total').textContent = quota.length
      ? `${quota.length} building${quota.length === 1 ? '' : 's'} — ${milsovTotalText(quota)}`
      : '';

    // An allocation that is not 25 plots is not a tile the game can produce,
    // so there is nothing to score it against — block the scan outright.
    scanBtn.disabled = !plots.ok;
    scanBtn.title = plots.ok ? '' : 'Settle plot allocation must sum to 25';
  }

  // Everything is bound here rather than with inline handlers, which the host
  // page's CSP may block. Nothing submits — the form has nowhere to submit to.
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', refresh);
  form.addEventListener('change', (e) => {
    // Clamp on blur/commit rather than on every keystroke — clamping mid-typing
    // turns "12" into "1" before the second digit lands.
    const el = e.target;
    if (el.dataset.plot) {
      el.value = validatePlots(plotInputs()).plots[el.dataset.plot];
    } else if (el.dataset.milsov) {
      // Lowering the claim has to drag the building down with it, and re-render
      // which building levels are still reachable. The whole row is read back,
      // so re-rendering it does not reset the structure to the default.
      const rowEl = el.closest('.sov-milsov-row');
      const [row] = normaliseMilsovQuota([milsovRow(rowEl)]);
      rowEl.outerHTML = milsovRowHtml(row);
    }
    refresh();
  });

  form.addEventListener('click', (e) => {
    if (e.target.closest('.sov-milsov-del')) {
      e.target.closest('.sov-milsov-row').remove();
      refresh();
    } else if (e.target.closest('.sov-milsov-add')) {
      form.querySelector('.sov-milsov-rows')
        .insertAdjacentHTML('beforeend', milsovRowHtml({ sovLevel: 5, buildingLevel: 5 }));
      refresh();
    } else if (e.target.closest('.sov-reset')) {
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

  refresh();

  return {
    root,
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
          <td>${flagsHtml(r)}</td>
        </tr>`).join('');
      el.innerHTML = `
        <p>${summary}</p>
        <table>
          <thead><tr><th>Site</th><th>T_max</th><th>Binds</th><th>Food</th>
            <th>RP</th><th>Net gold</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => {
          // Selecting and expanding are one gesture; Prefill needs a selection
          // the user can see they made.
          select(Number(row.dataset.n));
          toggleDetail(row, results[Number(row.dataset.n)]);
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
  if (!r.quotaMet) flags.push({ cls: 'sov-flag', text: 'maybe', title: 'The milsov quota does not fit on this site' });
  const res = resFlag(r);
  if (res) flags.push({ cls: 'sov-flag', ...res });
  if (r.milsovNote) flags.push({ cls: 'sov-advice', text: 'advice', title: 'Milsov level advisory' });
  return flags
    .map((f) => `<span class="${f.cls}" title="${escapeHtml(f.title)}">${escapeHtml(f.text)}</span>`)
    .join(' ');
}

function toggleDetail(row, result) {
  const next = row.nextElementSibling;
  if (next && next.classList.contains('sov-detail')) {
    next.remove();
    return;
  }
  const tr = document.createElement('tr');
  tr.className = 'sov-detail';
  const tiles = result.tiles.map((t) => {
    const dxy = `${t.dx >= 0 ? '+' : ''}${t.dx},${t.dy >= 0 ? '+' : ''}${t.dy}`;
    return `<li>${dxy} — food ${t.food}, d ${t.d.toFixed(2)}, ${t.rp.toFixed(0)} RP, Sov ${t.level}</li>`;
  }).join('');
  // One line per building, naming both levels and the structure — reading this
  // back is how a quota that does not say what the user meant gets caught. A
  // free structure says so in the same place the charged one states its bill.
  const mil = result.milsov.map((m) => {
    const upkeep = structureUpkeep(m);
    const cost = upkeep
      ? `${upkeep.toLocaleString('en-GB')}/hr each W/C/I/S`
      : 'no hourly resource cost';
    return `<li>milsov Sov ${m.sovLevel} claim at d ${m.d.toFixed(2)} carrying a level ${
      m.buildingLevel} ${escapeHtml(sovStructure(m).name)} — ${m.rp.toFixed(0)} RP, ${
      cost}, food ${m.food}</li>`;
  }).join('');
  // Milsov normally sits on the nearest tiles, so a plan that reaches past them
  // has to say why rather than looking like a mistake.
  const traded = result.milsovTraded
    ? '<p class="sov-hint">Milsov is hosted further out to leave a better food tile'
      + ' to the claim plan — scored both ways, this one wins.</p>'
    : '';
  // PRD §3.6 — advisory only. The plan above is exactly what the user asked
  // for; this is a note, never an applied change. Say so plainly.
  const advice = result.milsovNote
    ? `<p class="sov-advice">Advisory: ${escapeHtml(result.milsovNote)} Your requested levels are what is planned above.</p>`
    : '';
  // The resource ceiling is stated here whether or not it bites, since the
  // figure itself is the thing the user has to judge. The row flag above only
  // appears when it would have cost them tax.
  const ceiling = result.resImpossible
    ? `is impossible — the settle allocation has no ${result.resBinding} plots`
    : `is ${result.resCeiling?.toFixed(1)}% on ${result.resBinding}`;
  const res = result.resIndicative
    ? `<p class="sov-flag">Resource ceiling ${ceiling}. Indicative only — per-plot`
      + ' yields unmeasured (mechanics open item 12), so it is reported here and'
      + ' left out of T_max and the ranking.</p>'
    : '';
  tr.innerHTML = `<td colspan="7"><ul>${tiles}${mil}</ul>${traded}${advice}${res}</td>`;
  row.after(tr);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// RFC 4180 quoting. Every column goes through this rather than only the free
// text one — the milsov advisory (PRD §3.6) is the first field that can carry a
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
  // The free-text advisory stays last, so a column added later does not land
  // after the one field that can carry a comma.
  const head = ['x', 'y', 'T_max', 'binding', 'S_food', 'U_RP', 'U_gold', 'Gold_net',
    'quota_met', 'milsov_traded', 'T_res', 'res_binding', 'res_status', 'milsov_advisory'];
  const lines = results.map((r) =>
    [r.x, r.y, r.tMax.toFixed(2), r.binding, r.sFood.toFixed(0),
     r.uRp.toFixed(0), r.uGold.toFixed(0), r.goldNet.toFixed(0), r.quotaMet,
     !!r.milsovTraded,
     ...resColumns(r),
     r.milsovNote ?? ''].map(csvField).join(','));
  return [head.join(','), ...lines].join('\n');
}
