// The Optimal Sovereignty tab's controller: its form, the town picker, the
// refusal for a tile off screen, and the plan it draws.

import { focusRadius, focusSite, ownTowns, parseFocus } from '../focus.js';
import { centredView, mapHash } from '../map-view.js';
import { escapeHtml } from './format.js';
import { focusRadiusTitle } from './forms.js';
import { focusResultHtml } from './plan.js';
import { mountPlanBlock } from './plan-block.js';

/**
 * @param {object} o
 * @param {Element} o.pane the tab's section, already holding focusFormHtml
 * @param {() => {settings: object, errors: string[]}} o.readSettings
 * @param {() => object|null} [o.getPayload]
 * @param {Function} [o.whenViewLoaded]
 * @param {Function} [o.onFocusPlan]
 * @param {() => void} [o.onPickOnMap]
 */
export function createFocusPane({
  pane, readSettings, getPayload, whenViewLoaded, onFocusPlan, onPickOnMap,
}) {
  const focusForm = pane.querySelector('.sov-focus-form');
  const status = pane.querySelector('.sov-focus-status');
  const townPick = focusForm.querySelector('.sov-town-pick');
  let refusedView = null;  // the view centring an off-screen refusal's tile
  let stopWaiting = null;  // ends a wait for that view to load

  function syncFocusRadiusHint() {
    const { settings: s } = readSettings();
    const rClaim = Math.round(s.rClaim ?? 2);
    focusForm.querySelector('[data-focus="radius"]').placeholder = String(rClaim);
    focusForm.querySelector('[data-radius-row]').title = focusRadiusTitle(rClaim);
    syncTownPicker();
  }

  /**
   * Rebuild the list of your towns on screen. Called as the picker is opened,
   * since the map may have moved.
   */
  function syncTownPicker() {
    const was = townPick.value;
    const payload = getPayload?.();
    const towns = payload ? ownTowns(payload) : [];
    townPick.innerHTML = towns.length
      ? `<option value="">—</option>${towns.map((t) =>
        `<option value="${t.x}|${t.y}">${escapeHtml(t.label)}</option>`).join('')}`
      : `<option value="">${payload ? 'none on screen' : 'no map data yet'}</option>`;
    if (was && towns.some((t) => `${t.x}|${t.y}` === was)) townPick.value = was;
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

  /**
   * After a refusal for a tile off screen, any move of the map retires it. A move
   * to the view its "Centre the map" link names plans the tile again once the
   * view has loaded.
   */
  function onRefusedMove() {
    const { x, y } = refusedView;
    stopWaiting?.();
    stopWaiting = location.hash === mapHash(refusedView)
      ? whenViewLoaded?.(refusedView, () => planAt(x, y))
      : null;
    if (!stopWaiting) window.removeEventListener('hashchange', onRefusedMove);
    status.textContent = stopWaiting
      ? `Centring the map on ${x}|${y}; it is optimised once the map has loaded.`
      : `The map has moved. Optimise again to check ${x}|${y} on this view.`;
  }

  function runFocus() {
    const out = pane.querySelector('.sov-focus-out');
    window.removeEventListener('hashchange', onRefusedMove);
    stopWaiting?.();
    stopWaiting = null;
    const fail = (message) => {
      status.textContent = message;
      out.innerHTML = '';
      onFocusPlan?.(null);
    };
    const read = readSettings();
    if (read.errors.length) {
      fail(read.errors.join(' '));
      return;
    }
    const { focus, errors } = parseFocus(readFocus());
    if (errors.length) {
      fail(errors.join(' '));
      return;
    }

    const payload = getPayload?.();
    const result = focusSite({ payload, focus, settings: read.settings });
    if (!result.ok) {
      fail(result.message);
      if (result.reason === 'centre-missing' || result.reason === 'incomplete') {
        const radius = focusRadius(focus, read.settings);
        refusedView = centredView(focus.x, focus.y, payload.zoom, radius);
        window.addEventListener('hashchange', onRefusedMove);
        // Relative, so it stays on whichever of the game's hosts this is.
        status.insertAdjacentHTML('beforeend', `<p class="sov-map-only"><a class="sov-map-centre"
          href="${mapHash(refusedView)}">Centre the map on ${focus.x}|${focus.y}</a></p>`);
      }
      return;
    }
    status.textContent = '';
    out.innerHTML = focusResultHtml(result);
    mountPlanBlock(out.querySelector('.sov-plan-block'), {
      neighbours: result.neighbours,
      // The settings the plan was made with, which can differ from the form's.
      settings: result.settings,
      ctx: result.ctx,
      base: result.base,
      floor: result.floor,
      geom: { radius: result.radius, x: result.x, y: result.y, kept: result.kept?.claims },
      tax: result.plan.tax,
      onPlan: onFocusPlan,
    });
  }

  function planAt(x, y) {
    focusForm.querySelector('[data-focus="x"]').value = x;
    focusForm.querySelector('[data-focus="y"]').value = y;
    // Clear the town picker: this tile came from elsewhere.
    townPick.value = '';
    runFocus();
  }

  // Rebuild the town list as the picker is reached for: pointerdown fires before
  // its popup opens, focus before keyboard selection.
  townPick.addEventListener('pointerdown', syncTownPicker);
  townPick.addEventListener('focus', syncTownPicker);

  focusForm.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.focus === 'x' || el.dataset.focus === 'y') {
      // Typed coordinates no longer match the town in the picker.
      townPick.value = '';
      return;
    }
    if (!el.closest('.sov-town-pick') || !el.value) return;
    const [x, y] = el.value.split('|');
    focusForm.querySelector('[data-focus="x"]').value = x;
    focusForm.querySelector('[data-focus="y"]').value = y;
  });

  focusForm.addEventListener('submit', (e) => e.preventDefault());
  focusForm.addEventListener('click', (e) => {
    if (e.target.closest('.sov-focus-run')) runFocus();
    else if (e.target.closest('.sov-map-pick')) onPickOnMap?.();
  });

  return {
    syncFocusRadiusHint,
    planAt,
    /** While a pick is armed, Pick on map becomes its cancel button. */
    setPicking(armed) {
      const button = focusForm.querySelector('.sov-map-pick');
      button.classList.toggle('sov-picking', armed);
      button.textContent = armed ? 'Click a tile · Cancel' : 'Pick on map';
    },
  };
}
