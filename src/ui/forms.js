// The panel's forms as markup: City Configuration, the gear menu, Site Search's
// filters, the optimiser's form, the folded sections' summaries and the
// changelog. No DOM.

import {
  BASIC_RESOURCES,
  FAMINE_MANAGEMENT,
  FLOUR_MILL_L20,
  MILSOV_STRUCTURES,
  MINIMUM_KEYS,
  PLOT_KEYS,
  PLOT_TOTAL,
  PRESTIGE_PRODUCTION_BONUS,
  PRODUCTION_LABEL,
  RESOURCE_BOOSTER_BONUS,
  RESOURCE_BOOSTERS,
  SETTLE_TERRAINS,
  SOIL_ENRICHMENT,
  UPKEEP_BUILDINGS,
} from '../constants.js';
import { GLYPHS } from '../app-icons.js';
import { ICONS, PRODUCTION_ICONS, UPKEEP_GROUP_ICONS } from '../game-icons.js';
import { computeBOther, computeResearch, prestigeBonus, researchAt } from '../scoring.js';
import { DEFAULT_FOCUS, FOCUS_DEFAULT_TAX, FOCUS_TAX_FLOOR } from '../focus.js';
import { SETTINGS_FIELDS, validatePlots } from '../settings.js';
import { attr, count, escapeHtml, productionLabel } from './format.js';

/**
 * One control and its label, as a row. The label is a separate element sized
 * to its text, so a click in the gap before the control does nothing.
 *
 * @param {object} o
 * @param {string} o.id unique in the document, and prefixed to avoid the game's
 * @param {string} o.label label HTML, already escaped by the caller
 * @param {string} o.control the input or select, carrying that same id
 * @param {string} [o.row] attributes for the row itself
 */
function fieldRowHtml({ id, label, control, row = '' }) {
  return `<div class="sov-f"${row}><label for="${id}">${label}</label>
    ${control}</div>`;
}

function checkboxRowHtml({ id, label, checked, hooks = '', row = '' }) {
  return fieldRowHtml({
    id,
    label,
    row,
    control: `<input type="checkbox"${hooks} id="${id}"${checked ? ' checked' : ''}>`,
  });
}

function numberFieldHtml(f, value) {
  const id = `sov-in-${f.key}`;
  return fieldRowHtml({
    id,
    label: escapeHtml(f.label),
    row: ` data-key="${f.key}"${attr('title', f.hint)}`,
    control: `<input type="number" data-key="${f.key}"${attr('min', f.min)}${attr('max', f.max)}
      step="${f.integer ? 1 : 'any'}"${attr('value', value)} id="${id}">`,
  });
}

function selectFieldHtml(f, value) {
  const id = `sov-in-${f.key}`;
  const opts = f.options.map((o) =>
    `<option value="${escapeHtml(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
  return fieldRowHtml({
    id,
    label: escapeHtml(f.label),
    row: ` data-key="${f.key}"`,
    control: `<select data-key="${f.key}" id="${id}">${opts}</select>`,
  });
}

function checkboxFieldHtml(f, value) {
  return checkboxRowHtml({
    id: `sov-cb-${f.key}`,
    label: escapeHtml(f.label),
    checked: value,
    hooks: ` data-key="${f.key}"`,
    row: ` data-key="${f.key}"${attr('title', f.hint)}`,
  });
}

const PLOTS_TITLE = `How the settle tile's ${PLOT_TOTAL} plots are split. `
  + 'Terraforming applies to the settle tile only.';

function plotInputsHtml(hook, idPrefix, plots) {
  const fields = PLOT_KEYS.map((p) => {
    const id = `${idPrefix}-${p}`;
    return `<div class="sov-plot"><label for="${id}">${productionLabel(p)}</label>
      <input type="number" ${hook}="${p}" min="0" max="${PLOT_TOTAL}"
        step="1" value="${plots?.[p] ?? 0}" id="${id}"></div>`;
  }).join('');
  return `<div class="sov-plot-fields">${fields}</div>`;
}

/** The allocation as one coloured cell per plot; cells past the 25th are red. */
export function plotBarHtml(plots) {
  const cells = PLOT_KEYS.flatMap((p) => Array(plots?.[p] ?? 0).fill(p))
    .map((p, i) => `<i class="sov-p-${i < PLOT_TOTAL ? p : 'over'}"></i>`);
  while (cells.length < PLOT_TOTAL) cells.push('<i></i>');
  return cells.join('');
}

function plotsFieldHtml(f, plots) {
  return `<div class="sov-f-block" data-key="${f.key}" title="${PLOTS_TITLE}">
      ${plotInputsHtml('data-plot', 'sov-in-plot', plots)}
      <div class="sov-plotbar"></div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from Selected Tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
}

function calibrationFieldHtml(f, cal) {
  return `<fieldset class="sov-f-block sov-override" data-key="${f.key}"
      title="Your city's research per hour as the game shows it, and the tax it was read at. Replaces the Library's own output. Leave the two tick-boxes above as your city has them: their bonuses are taken out of the reading.">
      <legend>Override — ${escapeHtml(f.label)}</legend>
      ${fieldRowHtml({
    id: 'sov-in-cal-observedRpPerHour',
    label: 'Observed research per hour',
    control: `<input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr('value', cal?.observedRpPerHour)} id="sov-in-cal-observedRpPerHour">`,
  })}
      ${fieldRowHtml({
    id: 'sov-in-cal-atTax',
    label: '…at this tax rate (%)',
    control: `<input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}" id="sov-in-cal-atTax">`,
  })}
      ${checkboxRowHtml({
    id: 'sov-cb-cal-prestige',
    label: '…with the Prestige boost running',
    checked: cal?.prestige,
    hooks: ' data-cal="prestige"',
  })}
      <p class="sov-hint sov-rp-read"></p>
    </fieldset>`;
}

/**
 * One count per upkeep building, grouped as the game groups them. What each
 * consumes shows as resource icons, with the amounts on hover.
 */
function upkeepBuildingsFieldHtml(f, buildings) {
  const rows = UPKEEP_BUILDINGS.map((b, i) => {
    const id = `sov-in-upkeep-${b.key}`;
    const uses = Object.entries(b.consumes);
    const usesTitle = `Consumes ${uses.map(([res, n]) =>
      `${count(n)} ${PRODUCTION_LABEL[res].toLowerCase()}`).join(', ')} an hour`;
    const icons = uses.map(([res]) => `<img src="${PRODUCTION_ICONS[res]}" alt="">`).join('');
    const heading = b.group !== UPKEEP_BUILDINGS[i - 1]?.group
      ? `<p class="sov-heading"><img src="${UPKEEP_GROUP_ICONS[b.group]}" alt="">${
        escapeHtml(b.group)}</p>`
      : '';
    return heading + fieldRowHtml({
      id,
      label: escapeHtml(b.name),
      row: ` data-upkeep-row="${b.key}"${attr('title', b.hint)}`,
      control: `<span class="sov-uses" title="${usesTitle}">${icons}</span>
        <input type="number" data-upkeep="${b.key}" min="0" step="1"
        value="${buildings?.[b.key] ?? 0}" id="${id}">`,
    });
  }).join('');
  return `<div class="sov-f-block" data-key="${f.key}"
      title="Each copy consumes the same every hour as the first. That comes off production before sovereignty is paid for, so the plan never spends what these buildings need.">
      ${rows}
    </div>`;
}

/**
 * Boosters, prestige and minimum surplus as one table: a row per production, a
 * column per setting. Each control carries its own aria-label, since no single
 * <label> can name both its row and column.
 */
function productionMatrixHtml(settings) {
  const { resourceBoosters: boosters, prestige, resourceMinimums: minimums } = settings;
  const rows = MINIMUM_KEYS.map((key) => {
    const name = PRODUCTION_LABEL[key];
    const boosterBox = (hook, building, bonus, on) => `<input type="checkbox" ${hook}${
      on ? ' checked' : ''} aria-label="${building}" title="${building} (+${bonus}% ${name})">`;
    let booster = '<span class="sov-none">—</span>';
    if (BASIC_RESOURCES.includes(key)) {
      booster = boosterBox(`data-booster="${key}"`, RESOURCE_BOOSTERS[key], RESOURCE_BOOSTER_BONUS,
        boosters?.[key]);
    } else if (key === 'food') {
      booster = boosterBox('data-key="flourMill"', 'Flour Mill', FLOUR_MILL_L20, settings.flourMill);
    }
    return `<tr><td>${productionLabel(key)}</td><td>${booster}</td>
      <td><input type="checkbox" data-prestige="${key}"${prestige?.[key] ? ' checked' : ''}
        aria-label="Prestige on ${name}"></td>
      <td><input type="number" data-minimum="${key}" min="0" step="1"
        value="${minimums?.[key] ?? 0}" aria-label="Keep at least this much ${name} per hour"></td></tr>`;
  }).join('');
  return `<table class="sov-matrix"><thead><tr><th></th>
      <th data-key="resourceBoosters" title="A booster building at level 20 — the Flour Mill, for food — adds ${RESOURCE_BOOSTER_BONUS}% to its production: ${RESOURCE_BOOSTER_BONUS} points of tax headroom against its ceiling.">Booster +${RESOURCE_BOOSTER_BONUS}%</th>
      <th data-key="prestige" title="The prestige boost adds ${PRESTIGE_PRODUCTION_BONUS}% to each production it runs on: ${PRESTIGE_PRODUCTION_BONUS} points of tax headroom. Tick only what it is running on.">Prestige +${PRESTIGE_PRODUCTION_BONUS}%</th>
      <th data-key="resourceMinimums" title="How much of each must still be free once the plan is paid for: resources after upkeep, food after the town eats, research after the claims. Zero spends it all, leaving nothing to build, grow or trade with.">Keep per hour</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
}

/**
 * Which military structure to place. Only the five military Production
 * Structures are offered; the engine decides how many, at what levels and where.
 */
function milsovFieldHtml(f, structure) {
  const opts = MILSOV_STRUCTURES.map((s) =>
    `<option value="${s.key}"${s.key === structure ? ' selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      ${fieldRowHtml({
    id: `sov-in-${f.key}`,
    label: escapeHtml(f.label),
    control: `<select data-key="${f.key}" id="sov-in-${f.key}"
          title="Which structure to place on the tiles the food plan leaves free. It only uses what food leaves over, so it never costs the site tax.">
          <option value=""${structure ? '' : ' selected'}>None — food only</option>${opts}</select>`,
  })}
    </div>`;
}

/** One switch per settleable terrain, each carrying `hook` with its name. */
function terrainsFieldHtml(f, terrains, hook, idPrefix) {
  const rows = SETTLE_TERRAINS.map((t) => checkboxRowHtml({
    id: `${idPrefix}-${f.key}-${t.replaceAll(' ', '-')}`,
    label: escapeHtml(t),
    checked: terrains?.includes(t),
    hooks: ` ${hook}="${t}"`,
  })).join('');
  return `<div class="sov-f-block" data-key="${f.key}"${attr('title', f.hint)}>
      <p class="sov-subheading">${escapeHtml(f.label)}</p>
      <div class="sov-terrains">${rows}</div>
    </div>`;
}

/** The subsection heading drawn above a field, or nothing if it starts none. */
function subsectionHtml(f) {
  return f.subsection ? `<p class="sov-heading">${escapeHtml(f.subsection)}</p>` : '';
}

/**
 * Another tab's copy of a City Configuration number or checkbox. It has no
 * value of its own: the panel keeps it in step with the original.
 */
function mirrorFieldHtml(f, tab) {
  const id = `${f.type === 'checkbox' ? 'sov-cb' : 'sov-in'}-${tab}-${f.key}`;
  const control = f.type === 'checkbox'
    ? `<input type="checkbox" data-mirror-key="${f.key}" id="${id}">`
    : `<input type="number" data-mirror-key="${f.key}"${attr('min', f.min)}${attr('max', f.max)}
      step="${f.integer ? 1 : 'any'}" id="${id}">`;
  return fieldRowHtml({ id, label: escapeHtml(f.label), control, row: attr('title', f.hint) });
}

function fieldHtml(f, settings) {
  const v = settings[f.key];
  switch (f.type) {
    case 'checkbox': return checkboxFieldHtml(f, v);
    case 'select': return selectFieldHtml(f, v);
    case 'plots': return plotsFieldHtml(f, v);
    case 'calibration': return calibrationFieldHtml(f, v);
    case 'upkeepBuildings': return upkeepBuildingsFieldHtml(f, v);
    case 'milsov': return milsovFieldHtml(f, v);
    case 'terrains': return terrainsFieldHtml(f, v, 'data-terrain', 'sov-cb-terrain');
    default: return numberFieldHtml(f, v ?? f.fallback);
  }
}

const SECTION_ICONS = {
  'Settle Tile': [ICONS.caravan],
  'City Food': [ICONS.food],
  Research: [ICONS.research],
  Production: BASIC_RESOURCES.map((res) => ICONS[res]),
  'City Buildings': [ICONS.troops, ICONS.mana],
  Sovereignty: [ICONS.sovereignty],
  'Site Filters': [ICONS.diplomacy],
};

/** A section that folds to a header; the panel fills its `sum` summary from the settings. */
function sectionHtml({ name, icons, sum, body }) {
  return `<details class="sov-sec" data-sec="${escapeHtml(name)}"><summary>
      <span class="sov-sec-ico">${icons.map((src) => `<img src="${src}" alt="">`).join('')}</span>
      <span class="sov-sec-name">${escapeHtml(name)}</span>
      <span class="sov-sum" data-sum="${escapeHtml(sum)}"></span>
      <span class="sov-chev">${GLYPHS.chevron}</span>
    </summary><div class="sov-sec-body">${body}</div></details>`;
}

/** The research claims are bought out of: the output at 0% tax. */
export function researchInUse(s) {
  return researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, 'research'), tax: 0 });
}

/** A section's one-line summary for its folded header, as markup. */
export function sectionSummaryHtml(name, s) {
  const plural = (n, one) => `${n} ${one}${n === 1 ? '' : 's'}`;
  switch (name) {
    case 'Settle Tile': {
      const r = validatePlots(s.plots);
      return PLOT_KEYS.map((p) => `<img src="${PRODUCTION_ICONS[p]}" alt="">${r.plots[p]}`).join('')
        + (r.ok ? '' : ` <b class="sov-bad">${r.message}</b>`);
    }
    case 'City Food': {
      const b = computeBOther(s);
      return `${b >= 0 ? '+' : ''}${b}% · eats ${count(s.cityConsumption)}/hr`;
    }
    case 'Research':
      return `${count(Math.round(researchInUse(s)))}/hr${s.rpCalibration ? ' · measured' : ''}`;
    case 'Production': {
      const on = (o) => Object.values(o ?? {}).filter(Boolean).length;
      const [prestige, minimums] = [s.prestige, s.resourceMinimums].map(on);
      const boosters = on(s.resourceBoosters) + (s.flourMill ? 1 : 0);
      return [
        boosters && plural(boosters, 'booster'),
        prestige && `prestige ×${prestige}`,
        minimums && plural(minimums, 'minimum'),
      ].filter(Boolean).join(' · ') || 'none set';
    }
    case 'City Buildings': {
      const n = Object.values(s.upkeepBuildings ?? {}).reduce((a, v) => a + v, 0);
      return n ? plural(n, 'building') : 'none';
    }
    case 'Sovereignty': {
      const structure = MILSOV_STRUCTURES.find((m) => m.key === s.milsovStructure);
      return `radius ${s.rClaim} · ${escapeHtml(structure?.name ?? 'food only')}`;
    }
    case 'Site Filters': {
      const terrains = (list) => (list.length > 1 ? `${list.length} terrains` : list[0]);
      const around = s.surroundTerrains ?? [];
      return [
        `tax ≥ ${s.tMin}%`,
        `apart ${s.dOther}/${s.dOwn}/${s.dAlliance}`,
        terrains(s.siteTerrains ?? []),
        around.length && s.surroundMin > 0 && `${s.surroundMin}/8 around ${terrains(around)}`,
      ].filter(Boolean).join(' · ');
    }
    default:
      return '';
  }
}

/** The City Configuration form; menu settings are not in it. */
export function settingsFormHtml(settings) {
  const groups = [];
  for (const f of SETTINGS_FIELDS) {
    if (f.menu) continue;
    if (!groups.length || groups.at(-1).name !== f.group) groups.push({ name: f.group, fields: [] });
    groups.at(-1).fields.push(f);
  }
  const body = groups.map((g) => {
    const fields = g.name === 'Production'
      ? productionMatrixHtml(settings)
      : g.fields.map((f) => subsectionHtml(f) + fieldHtml(f, settings)).join('');
    const extra = g.fields.some((f) => f.key === 'isCapital')
      ? '<div class="sov-derived"></div><p class="sov-derived-food"></p>'
      : '';
    return sectionHtml({
      name: g.name, icons: SECTION_ICONS[g.name] ?? [], sum: g.name, body: fields + extra,
    });
  }).join('');
  // autocomplete="off" stops the browser restoring values on reload, which would
  // be read back and saved as the user's.
  return `<form class="sov-form" autocomplete="off">
      ${body}
      <div class="sov-form-foot"><button type="button" class="sov-reset sec">Reset to Defaults</button>
        <span class="sov-hint">Saved in this browser as you edit.</span></div>
      <p class="sov-hint sov-store-note"></p>
    </form>`;
}

/** The gear menu: the `menu: true` settings, which belong to the panel rather than the city. */
export function settingsMenuHtml(settings) {
  const fields = SETTINGS_FIELDS.filter((f) => f.menu);
  const rows = fields.map((f) =>
    fieldHtml(f, settings)).join('');
  return `<h3>Settings</h3><form class="sov-menu-form" autocomplete="off">${rows}</form>`;
}

/** The changelog popover: each version's changes, newest first. */
export function changelogHtml(entries) {
  const versions = entries.map((v) => {
    const date = v.date ? `<span class="sov-changelog-date">${escapeHtml(v.date)}</span>` : '';
    const changes = v.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
    return `<h4>${escapeHtml(v.version)}${date}</h4><ul>${changes}</ul>`;
  }).join('');
  return `<h3>Changelog</h3><div class="sov-changelog-body">${versions}</div>`;
}

export function focusRadiusTitle(rClaim) {
  return `How far out sovereignty may be placed. Blank follows City Configuration, currently ${rClaim}.`;
}

/**
 * The optimiser's form. Its own inputs are read by readFocus and parseFocus;
 * the City Configuration section's controls mirror that tab's and are read there.
 */
export function focusFormHtml(focus, settings) {
  const f = { ...DEFAULT_FOCUS, ...focus };
  const rClaim = Math.round(settings?.rClaim ?? 2);
  return `<form class="sov-focus-form" autocomplete="off">
      <div class="sov-card">
        ${fieldRowHtml({
    id: 'sov-in-town-pick',
    label: 'One of Your Towns',
    control: '<select class="sov-town-pick" id="sov-in-town-pick"><option value="">—</option></select>',
    row: ' title="Fills the coordinates from a town of yours on the map."',
  })}
        <div class="sov-f"><span>Coordinates</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x" aria-label="x"${attr('value', f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y" aria-label="y"${attr('value', f.y)}>
            <span class="sov-or sov-map-only">or</span>
            <button type="button" class="sov-map-pick sov-map-only sec"
              title="Then click a tile on the World Map to fill these in and optimise it.">Pick on map</button>
          </span></div>
        ${fieldRowHtml({
    id: 'sov-in-focus-radius',
    label: 'Sovereignty Radius',
    control: `<input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr('value', f.radius)} id="sov-in-focus-radius">`,
    row: ` data-radius-row title="${focusRadiusTitle(rClaim)}"`,
  })}
        ${fieldRowHtml({
    id: 'sov-in-focus-tax',
    label: 'Starting Tax (%)',
    control: `<input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="1"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}" id="sov-in-focus-tax">`,
  })}
        ${checkboxRowHtml({
    id: 'sov-cb-focus-preserveSovereignty',
    label: 'Preserve Existing Sovereignty',
    checked: f.preserveSovereignty,
    hooks: ' data-focus="preserveSovereignty"',
    row: ' title="On: the town on this tile keeps the claims it holds, and the plan pays only to raise them. Off: they are laid out afresh at full price."',
  })}
      </div>
      ${sectionHtml({
    name: 'City Configuration',
    icons: SECTION_ICONS['Settle Tile'],
    sum: 'Settle Tile',
    body: `${checkboxRowHtml({
      id: 'sov-cb-focus-useConfiguredPlots',
      label: 'Use the Plot Allocation from City Configuration',
      checked: f.useConfiguredPlots,
      hooks: ' data-focus="useConfiguredPlots"',
      row: ` title="On: plan on the allocation below, the tile as you will terraform it. Off: plan on the tile's ratings as they are today."`,
    })}
        <div class="sov-f-block" title="${PLOTS_TITLE}">
          ${plotInputsHtml('data-mirror-plot', 'sov-in-focus-plot', settings?.plots)}
          <div class="sov-plotbar"></div>
          <div class="sov-plot-sum"><span class="sov-plot-total"></span></div>
        </div>
        ${mirrorFieldHtml(SETTINGS_FIELDS.find((s) => s.key === 'ownClaimsAvailable'), 'focus')}
        <p class="sov-hint">These are City Configuration's own, as is everything else the plan uses.</p>`,
  })}
      <div class="sov-run"><button type="button" class="sov-focus-run">${GLYPHS.target}Optimise</button></div>
    </form>
    <p class="sov-legend sov-map-note"></p>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
}

/** Site Search's form: City Configuration's Site Filters, mirrored. */
export function scanFormHtml() {
  const body = SETTINGS_FIELDS.filter((f) => f.group === 'Site Filters')
    .map((f) => subsectionHtml(f) + (f.type === 'terrains'
      ? terrainsFieldHtml(f, [], 'data-mirror-terrain', 'sov-cb-scan-terrain')
      : mirrorFieldHtml(f, 'scan'))).join('');
  return `<form class="sov-scan-form" autocomplete="off">${sectionHtml({
    name: 'Site Filters',
    icons: SECTION_ICONS['Site Filters'],
    sum: 'Site Filters',
    body: `${body}<p class="sov-hint">These are City Configuration's own; change them in either place.</p>`,
  })}</form>`;
}

/** The two capital bonuses, which follow from other settings, as on/off chips. */
export function capitalDerivedHtml(s) {
  return [
    ['Famine Management', FAMINE_MANAGEMENT, 10],
    ['Soil Enrichment', SOIL_ENRICHMENT, 30],
  ].map(([name, bonus, need]) => {
    const active = s.isCapital && (s.cityCount ?? 1) >= need;
    const why = !s.isCapital ? 'capital only' : `needs ${need} cities`;
    return `<span class="sov-chip ${active ? 'sov-on' : 'sov-off'}" title="${
      active ? 'Active' : `Inactive: ${why}`}">${name} +${bonus}%</span>`;
  }).join('');
}
