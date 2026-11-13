// The side panel's controller: it builds the panel in a shadow root, wires the
// three tabs, the gear menu and the changelog to their renderers, and reports
// to main.js. It never touches the game's map; main.js relays between it and
// overlay.js.
//
// Coordinates are shown as "x|y", as in game, though payload keys are "y|x".

import {
  BASIC_RESOURCES,
  DEFAULT_SETTINGS,
  MINIMUM_KEYS,
  PLOT_KEYS,
  PLOT_TOTAL,
  PRESTIGE_KEYS,
} from '../constants.js';
import { APP_ICON_SVG, GLYPHS } from '../app-icons.js';
import { CHANGELOG } from '../changelog.js';
import { computeBOther } from '../scoring.js';
import { DEFAULT_FOCUS } from '../focus.js';
import {
  SETTINGS_FIELDS,
  clampNumber,
  validatePlots,
  parseMilsovStructure,
  parseRpCalibration,
  parseResourceBoosters,
  parseUpkeepBuildings,
  parseResourceMinimums,
  parsePrestige,
  parseTerrains,
  scanSettingsDiffer,
} from '../settings.js';
import { isWorldMapHash } from '../map-view.js';
import { CSS } from './css.js';
import {
  installDrag, loadOpenSections, saveOpenSections, loadPanelCollapsed, savePanelCollapsed,
} from './layout.js';
import { innerTarget, installTooltips } from './tooltips.js';
import {
  capitalDerivedHtml,
  changelogHtml,
  focusFormHtml,
  plotBarHtml,
  researchInUse,
  scanFormHtml,
  sectionSummaryHtml,
  settingsFormHtml,
  settingsMenuHtml,
} from './forms.js';
import { resultsHtml, scanSummaryText } from './results.js';
import { toggleDetail } from './plan-block.js';
import { createFocusPane } from './focus-pane.js';

/* global __BUILD_VERSION__ */

const ABOUT_TIP = 'Unofficial fan tool. Illyriad, its game data and the game’s icon art are '
  + 'the intellectual property of Illyriad Games Limited — click for the licence and full '
  + 'copyright notice.';

/**
 * @param {object} o
 * @param {object} [o.initialSettings] already sanitized; defaults on first run
 * @param {(s: object) => void} [o.onSettingsChange] every committed edit, with
 *   the settings as read from the form, invalid ones included
 * @param {() => object|null} [o.getPayload] the map payload on screen, read
 *   afresh for each Optimise and town picker rebuild
 * @param {(view: object, onLoaded: () => void) => (() => void)|null}
 *   [o.whenViewLoaded] call `onLoaded` once the client has loaded `view`;
 *   returns what stops the wait, or null where it cannot wait
 * @param {(result: object) => void} [o.onSelect] a result row was selected
 * @param {(pane: string|null) => void} [o.onPaneShown] the pane on screen
 *   changed, null when folded; called once at the start
 * @param {(plan: object|null, geom: object) => void} [o.onFocusPlan] the
 *   optimiser's claim grid was drawn; null when there is none
 * @param {() => void} [o.onPickOnMap] Pick on map was pressed
 */
export function createPanel({
  onScan, initialSettings, onSettingsChange, getPayload, whenViewLoaded, onSelect,
  onPaneShown, onFocusPlan, onPickOnMap,
}) {
  // Everything the panel draws lives in a shadow root, where no rule from the
  // page can match it. `all` stops the host passing the page's inherited font
  // and colour in, and !important keeps it ahead of any page rule on the host.
  const host = document.createElement('sov-scanner');
  host.style.setProperty('all', 'initial', 'important');
  const shadow = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);
  const style = document.createElement('style');
  style.textContent = CSS;
  shadow.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sov-panel';
  const opening = initialSettings ?? DEFAULT_SETTINGS;
  root.innerHTML = `
    <h2 title="Sovereignty Site Scanner — drag to move, click to collapse"><span
        class="sov-h2-inner">${APP_ICON_SVG}<span
        class="sov-title">Sovereignty Site Scanner <span class="sov-build"></span></span><span
      class="sov-h2-actions"><span class="sov-changelog" role="button" tabindex="0"
      title="Changelog" aria-label="Changelog" aria-expanded="false">${GLYPHS.changelog}</span><span
      class="sov-gear" role="button" tabindex="0"
      title="Settings" aria-label="Settings" aria-expanded="false">⚙</span><a class="sov-about"
      href="https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/blob/main/LICENSE"
      target="_blank" rel="noopener" title="${ABOUT_TIP}">ⓘ</a></span></span></h2>
    <nav class="sov-tabs">
      <button type="button" data-tab="scan" class="on">${GLYPHS.search}Site Search</button>
      <button type="button" data-tab="focus">${GLYPHS.target}Optimal Sovereignty</button>
      <button type="button" data-tab="config">${GLYPHS.city}City Configuration</button>
    </nav>
    <div class="sov-body">
      <section data-pane="scan">
        ${scanFormHtml()}
        <div class="sov-toolbar"><button class="sov-scan"
            title="Rank every tile on screen you could settle">${GLYPHS.search}Scan</button></div>
        <div class="sov-status"></div>
        <div class="sov-results"></div>
        <div class="sov-diagnostics"></div>
      </section>
      <section data-pane="focus" hidden>${focusFormHtml(DEFAULT_FOCUS, opening)}</section>
      <section data-pane="config" hidden>${settingsFormHtml(opening)}</section>
    </div>`;
  // Shows which build is running, since Tampermonkey keeps its own copy.
  root.querySelector('.sov-build').textContent =
    typeof __BUILD_VERSION__ === 'undefined' ? 'dev' : __BUILD_VERSION__;
  shadow.appendChild(root);

  const openSections = new Set(loadOpenSections());
  for (const sec of root.querySelectorAll('.sov-sec')) sec.open = openSections.has(sec.dataset.sec);
  // `toggle` does not bubble, so it is caught on the way down.
  root.addEventListener('toggle', (e) => {
    if (!e.target.classList?.contains('sov-sec')) return;
    if (e.target.open) openSections.add(e.target.dataset.sec);
    else openSections.delete(e.target.dataset.sec);
    saveOpenSections([...openSections]);
  }, true);

  // The title bar is both the collapse control and the drag handle.
  const header = root.querySelector('h2');
  const { placeAtAnchor, takeDrag } = installDrag(root, header);

  // --- collapse / auto-minimise ---

  // The saved collapse state, used on the map.
  let manualCollapsed = loadPanelCollapsed();
  // Set when the user opens the panel while it is auto-folded off the map;
  // cleared on the next route change.
  let offMapExpandOverride = false;
  // Undefined until the first report, so the opening state is reported too.
  let paneShown;

  const autoMinimizeOn = () => !!readSettings().settings.autoMinimizeOffMap;
  const currentlyOnMap = () => isWorldMapHash(globalThis.location?.hash);

  function shouldCollapse() {
    if (autoMinimizeOn() && !currentlyOnMap()) return !offMapExpandOverride;
    return manualCollapsed;
  }

  function applyCollapsed() {
    const collapsed = shouldCollapse();
    root.classList.toggle('sov-collapsed', collapsed);
    // The header's buttons are hidden when collapsed, so their popovers close.
    if (collapsed) closePopovers();
    placeAtAnchor();
    reportPane();
  }

  function reportPane() {
    const shown = root.classList.contains('sov-collapsed')
      ? null : root.querySelector('[data-pane]:not([hidden])').dataset.pane;
    if (shown === paneShown) return;
    paneShown = shown;
    onPaneShown?.(shown);
  }

  function toggleCollapsed() {
    const next = !root.classList.contains('sov-collapsed');
    if (autoMinimizeOn() && !currentlyOnMap()) {
      offMapExpandOverride = !next;
    } else {
      manualCollapsed = next;
      savePanelCollapsed(next);
    }
    applyCollapsed();
  }

  window.addEventListener('hashchange', () => {
    offMapExpandOverride = false;
    applyCollapsed();
  });

  const $ = (sel) => root.querySelector(sel);
  const form = $('.sov-form');
  const scanBtn = $('.sov-scan');

  // The header's popovers sit beside the panel, not in it, so the panel's
  // overflow cannot clip them. The gear menu's fields are read and written like
  // the form's; containerFor picks which of the two holds a field.
  function addPopover(className, html) {
    const el = document.createElement('div');
    el.className = className;
    el.hidden = true;
    el.innerHTML = html;
    shadow.appendChild(el);
    return el;
  }
  const gear = $('.sov-gear');
  const menu = addPopover('sov-menu', settingsMenuHtml(opening));
  const changelog = addPopover('sov-menu sov-changelog-menu', changelogHtml(CHANGELOG));
  const popovers = [[gear, menu], [$('.sov-changelog'), changelog]];
  installTooltips(shadow);
  const containerFor = (f) => (f.menu ? menu : form);
  let rendered = [];       // the results currently in the table
  let scanSettings = null; // the settings they were scanned with
  let selected = null;     // the row Prefill copies `rs` from
  let incomplete = [];     // sites the last scan could not see all of

  // The ⓘ is the fansite kit's required copyright link; following it must not
  // also collapse the panel.
  header.addEventListener('click', (e) => {
    if (e.target.closest('.sov-about') || takeDrag()) return;
    toggleCollapsed();
  });
  scanBtn.addEventListener('click', onScan);

  // Opening the optimiser re-reads the radius placeholder from the settings.
  function showTab(name) {
    root.querySelectorAll('.sov-tabs button').forEach((t) => {
      t.classList.toggle('on', t.dataset.tab === name);
    });
    root.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== name; });
    if (name === 'focus') focusPane.syncFocusRadiusHint();
    reportPane();
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
          out[f.key] = containerFor(f).querySelector(`input[data-key="${f.key}"]`).checked;
          break;
        case 'select': {
          const v = containerFor(f).querySelector(`select[data-key="${f.key}"]`).value;
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
        case 'upkeepBuildings': {
          const raw = {};
          for (const el of form.querySelectorAll('[data-upkeep]')) {
            raw[el.dataset.upkeep] = el.value;
          }
          out.upkeepBuildings = parseUpkeepBuildings(raw);
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
        case 'terrains':
          out[f.key] = parseTerrains([...terrainInputs(f.key)]
            .filter((el) => el.checked).map((el) => el.dataset.terrain));
          break;
        default:
          out[f.key] = clampNumber(containerFor(f).querySelector(`input[data-key="${f.key}"]`).value, f);
      }
    }
    return { settings: out, errors };
  }

  // --- writing the form ---

  // `save` is off for settings loaded from storage, or two tabs would echo
  // each other's saves forever.
  function writeSettings(s, { save = true } = {}) {
    for (const f of SETTINGS_FIELDS) {
      const v = s[f.key];
      switch (f.type) {
        case 'checkbox':
          containerFor(f).querySelector(`input[data-key="${f.key}"]`).checked = !!v;
          break;
        case 'select':
          containerFor(f).querySelector(`select[data-key="${f.key}"]`).value = String(v);
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
        case 'upkeepBuildings':
          for (const el of form.querySelectorAll('[data-upkeep]')) {
            el.value = v?.[el.dataset.upkeep] ?? 0;
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
        case 'terrains':
          for (const el of terrainInputs(f.key)) {
            el.checked = !!v?.includes(el.dataset.terrain);
          }
          break;
        default:
          containerFor(f).querySelector(`input[data-key="${f.key}"]`).value = v ?? f.fallback ?? '';
      }
    }
    refresh({ save });
    applyCollapsed();
  }

  function terrainInputs(key) {
    return form.querySelectorAll(`.sov-f-block[data-key="${key}"] [data-terrain]`);
  }

  function writePlots(plots) {
    for (const p of PLOT_KEYS) form.querySelector(`[data-plot="${p}"]`).value = plots?.[p] ?? 0;
  }

  // --- live dependencies and read-outs ---

  // `save` is off for the first layout, when nothing has been edited.
  function refresh({ save = true } = {}) {
    const { settings: s } = readSettings();
    if (save) onSettingsChange?.(s);

    // Disable controls whose precondition is off. Disabled inputs still read
    // back, so nothing is lost.
    for (const f of SETTINGS_FIELDS) {
      if (!f.enabledWhen) continue;
      const on = f.enabledWhen(s);
      const wrap = form.querySelector(`[data-key="${f.key}"]`);
      wrap.classList.toggle('sov-gated', !on);
      wrap.querySelectorAll('input,select').forEach((el) => { el.disabled = !on; });
    }

    form.querySelector('.sov-override[data-key="rpCalibration"]')
      .classList.toggle('sov-override-on', !!s.rpCalibration);

    const plots = validatePlots(plotInputs());
    for (const total of root.querySelectorAll('.sov-plot-total')) {
      total.className = `sov-plot-total ${plots.ok ? 'sov-ok' : 'sov-bad'}`;
      total.textContent = `${plots.total} / ${PLOT_TOTAL} plots${plots.ok ? '' : ` — ${plots.message}`}`;
    }
    for (const bar of root.querySelectorAll('.sov-plotbar')) bar.innerHTML = plotBarHtml(plots.plots);
    for (const sum of root.querySelectorAll('.sov-sum')) {
      sum.innerHTML = sectionSummaryHtml(sum.dataset.sum, s);
    }
    for (const el of form.querySelectorAll('[data-upkeep]')) {
      el.closest('.sov-f').classList.toggle('sov-has', Number(el.value) > 0);
    }

    form.querySelector('.sov-derived').innerHTML = capitalDerivedHtml(s);
    const bOther = computeBOther(s);
    form.querySelector('.sov-derived-food').textContent =
      `Food production bonuses total ${bOther >= 0 ? '+' : ''}${bOther}%.`;

    // Shown as the override is typed, so an implausible reading is easy to spot.
    const rp = Math.round(researchInUse(s)).toLocaleString('en-GB');
    form.querySelector('.sov-rp-read').textContent = s.rpCalibration
      ? `In use: ${rp} research per hour at 0% tax, from your reading.`
      : `In use: ${rp} research per hour at 0% tax, from the settings above.`;

    scanBtn.disabled = !plots.ok;
    scanBtn.title = plots.ok ? '' : `Settle plot allocation must sum to ${PLOT_TOTAL}`;

    root.classList.toggle('sov-no-map', !s.mapOverlay);
    markStale(s);
    for (const el of root.querySelectorAll('[data-mirror-key], [data-mirror-plot], [data-mirror-terrain]')) {
      const own = mirrored(el);
      if (el.type === 'checkbox') el.checked = own.checked;
      // Compare as typed, so a value part-way through being typed is left alone.
      else if (el.value !== own.value) el.value = own.value;
    }
  }

  /** Show the results' notice when the form no longer holds what they were scanned with. */
  function markStale(s) {
    const stale = $('.sov-stale');
    if (stale) stale.hidden = !scanSettingsDiffer(scanSettings, s);
  }

  /** The City Configuration control that a mirrored control on another tab stands for. */
  function mirrored(el) {
    const { mirrorKey, mirrorPlot, mirrorTerrain } = el.dataset;
    if (mirrorKey) return form.querySelector(`input[data-key="${mirrorKey}"]`);
    if (mirrorPlot) return form.querySelector(`input[data-plot="${mirrorPlot}"]`);
    if (!mirrorTerrain) return null;
    const { key } = el.closest('.sov-f-block').dataset;
    return [...terrainInputs(key)].find((own) => own.dataset.terrain === mirrorTerrain);
  }

  // A mirrored control hands each edit to City Configuration's own, whose
  // refresh brings it back in line.
  for (const type of ['input', 'change']) {
    root.addEventListener(type, (e) => {
      const own = mirrored(e.target);
      if (!own) return;
      if (own.type === 'checkbox') own.checked = e.target.checked;
      else own.value = e.target.value;
      own.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

  // Handlers are bound here, not inline, since the game's CSP may block inline
  // ones. The form never submits.
  form.addEventListener('submit', (e) => e.preventDefault());
  $('.sov-scan-form').addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', () => refresh());
  form.addEventListener('change', (e) => {
    // Clamp on commit, not per keystroke, which would turn "12" into "1" mid-typing.
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

  // --- the header's popovers: the gear's settings and the changelog ---

  // Turning auto-minimise on while off the map must not fold the panel mid-edit,
  // so the current state is kept until the next route change.
  menu.addEventListener('change', () => {
    const wasCollapsed = root.classList.contains('sov-collapsed');
    refresh();
    if (!currentlyOnMap()) offMapExpandOverride = !wasCollapsed;
    applyCollapsed();
  });

  function setPopoverOpen(button, popover, open) {
    if (open) {
      // Placed each time, since the panel can have been dragged.
      const b = button.getBoundingClientRect();
      const p = root.getBoundingClientRect();
      popover.hidden = false;
      popover.style.top = `${b.bottom + 4}px`;
      popover.style.left = `${Math.max(4, p.right - popover.offsetWidth)}px`;
    } else {
      popover.hidden = true;
    }
    button.setAttribute('aria-expanded', String(open));
  }

  function closePopovers() {
    for (const [button, popover] of popovers) setPopoverOpen(button, popover, false);
  }

  for (const [button, popover] of popovers) {
    const toggle = (e) => {
      e.stopPropagation();   // the header click below would toggle the collapse
      const open = popover.hidden;
      closePopovers();
      setPopoverOpen(button, popover, open);
    };
    button.addEventListener('click', toggle);
    // A span with role=button is not activated by the keyboard on its own.
    button.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggle(e);
    });
  }

  document.addEventListener('pointerdown', (e) => {
    if (innerTarget(e).closest('.sov-menu,.sov-gear,.sov-changelog')) return;
    closePopovers();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopovers();
  });

  /** Copy the selected result's own plots into the allocation fields. */
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
      onSelect?.(selected);
    }
  }

  /** Say how many sites were skipped because their claim radius runs off screen. */
  function drawIncomplete() {
    $('.sov-diagnostics').innerHTML = incomplete.length
      ? `<p class="sov-hint">${incomplete.length} ${
        incomplete.length === 1 ? 'site was' : 'sites were'} skipped because their claim radius
        runs off screen. Zoom out or pan so the whole area is on screen, then scan again.</p>`
      : '';
  }

  // --- Optimal Sovereignty ---

  const focusPane = createFocusPane({
    pane: $('[data-pane="focus"]'), readSettings, getPayload, whenViewLoaded, onFocusPlan, onPickOnMap,
  });

  /** Open a scanned site in the optimiser and plan it there. */
  function optimiseSite(result) {
    showTab('focus');
    focusPane.planAt(result.x, result.y);
    $('.sov-focus-status').scrollIntoView({ block: 'start' });
  }

  refresh({ save: false });
  focusPane.syncFocusRadiusHint();
  applyCollapsed();

  return {
    root,
    /** How the last load or save went; '' clears it. */
    setStoreNote(text) {
      $('.sov-store-note').textContent = text ?? '';
    },
    /** Returns `{ settings, errors }`; a scan is refused while there are errors. */
    getSettings: readSettings,
    setSettings: writeSettings,
    setStatus(html) {
      root.querySelector('.sov-status').innerHTML = html;
    },
    /** Set a pane's line saying what the map shows; '' clears it. */
    setMapNote(pane, text, tooltip) {
      const note = $(`[data-pane="${pane}"] .sov-map-note`);
      if (!note) return;
      note.textContent = text;
      note.title = tooltip ?? '';
    },
    /**
     * @param {object[]} results ranked sites
     * @param {object} scan `{x, y, zoom, scanned, settings}`
     */
    renderResults(results, scan) {
      const el = root.querySelector('.sov-results');
      rendered = results;
      scanSettings = scan.settings;
      selected = null;
      const summary = { ...scan, candidates: results.length };
      $('.sov-prefill-src').textContent = '';   // the old selection is gone
      el.innerHTML = resultsHtml(results, scanSummaryText(summary));
      markStale(readSettings().settings);

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => {
          select(Number(row.dataset.n));
          toggleDetail(row, results[Number(row.dataset.n)], scanSettings, optimiseSite);
        });
      });
    },
    /**
     * Select the listed site at x|y and open its plan, as a row click does. False
     * when no row lists that tile.
     */
    selectSite(x, y) {
      const n = rendered.findIndex((r) => r.x === x && r.y === y);
      const row = n < 0 ? null : root.querySelector(`.sov-results .sov-row[data-n="${n}"]`);
      if (!row) return false;
      select(n);
      if (!row.nextElementSibling?.classList.contains('sov-detail')) {
        toggleDetail(row, rendered[n], scanSettings, optimiseSite);
      }
      row.scrollIntoView({ block: 'nearest' });
      return true;
    },
    planAt: focusPane.planAt,
    setPicking: focusPane.setPicking,
    renderIncomplete(list) {
      incomplete = list;
      drawIncomplete();
    },
  };
}
