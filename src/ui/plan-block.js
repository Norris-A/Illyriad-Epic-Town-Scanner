// A live plan block: the plan's read-out under a tax slider, re-planned as the
// slider moves or a grid tile is crossed out. Shared by a result row's detail
// and the optimiser.

import { GLYPHS } from '../app-icons.js';
import { prepareSite, planSiteAt, scoreSiteFrom } from '../scoring.js';
import { cellKey } from '../map-view.js';
import { detailBodyHtml, planBlockHtml } from './plan.js';
import { planGridHtml } from './grid.js';

/**
 * Make a rendered plan block's slider live. `onPlan(tax, plan)` hears each
 * re-plan; `plan` is null where that tax holds none.
 */
function bindPlanBlock(scope, ctx, base, geom, onPlan) {
  const range = scope.querySelector('.sov-tax-range');
  if (!range) return;
  const at = scope.querySelector('.sov-tax-at');
  const body = scope.querySelector('.sov-body-at');
  range.addEventListener('input', () => {
    const tax = Number(range.value);
    at.textContent = `${tax.toFixed(0)}%`;
    const plan = planSiteAt(ctx, tax);
    body.innerHTML = plan
      ? detailBodyHtml(plan, base, geom)
      : '<p class="sov-flag">This site cannot hold that tax.</p>';
    onPlan(tax, plan);
  });
}

/**
 * Render the plan block into `scope` and keep it live: the slider re-plans at a
 * new tax, and clicking a grid cell crosses that tile out and re-plans without
 * it. Closing the block clears the cross-outs.
 *
 * @param {Element} scope the element to own the block
 * @param {object} state `{neighbours, settings, ctx, base, floor, geom, tax,
 *   onPlan}`. `ctx` and `base` are used while nothing is crossed out. Without
 *   `neighbours` the block cannot re-plan, so it takes no clicks. `onPlan(plan,
 *   geom)` hears each grid drawn, with a null plan when a tax holds none
 */
export function mountPlanBlock(scope, state) {
  const excluded = new Set();
  let tax = state.tax;

  const draw = () => {
    // Only re-prepare (the expensive part) when tiles are crossed out.
    let ctx = state.ctx;
    let base = state.base;
    if (excluded.size) {
      const usable = state.neighbours.filter((n) => !excluded.has(cellKey(n.dx, n.dy)));
      ctx = usable.length ? prepareSite({ neighbours: usable, settings: state.settings }) : null;
      base = ctx ? scoreSiteFrom(ctx) : null;
    }
    const geom = { ...state.geom, excluded, pickable: !!state.neighbours };

    if (!base) {
      const none = { tiles: [], free: [], milsov: [] };
      scope.innerHTML = `<p class="sov-flag">No plan holds with those tiles crossed out.</p>${
        planGridHtml(none, geom)}`;
      state.onPlan?.(none, geom);
      return;
    }
    // Fewer tiles may not hold the tax dragged to; 0 is the lowest tax.
    tax = Math.max(0, Math.min(base.tMax, Math.max(Math.ceil(state.floor), tax)));
    const plan = (ctx ? planSiteAt(ctx, tax, { bestEffort: true }) : null) ?? base;
    scope.innerHTML = planBlockHtml({ ctx, base, plan, floor: state.floor, geom });
    bindPlanBlock(scope, ctx, base, geom, (t, p) => {
      tax = t;
      state.onPlan?.(p, geom);
    });
    state.onPlan?.(plan, geom);
  };

  // Delegated, since every redraw replaces the grid.
  scope.addEventListener('click', (e) => {
    const cell = e.target.closest('.sov-pick');
    if (!cell || !scope.contains(cell)) return;
    const key = cellKey(Number(cell.dataset.dx), Number(cell.dataset.dy));
    if (!excluded.delete(key)) excluded.add(key);
    draw();
  });
  draw();
}

export function toggleDetail(row, result, settings, onOptimise) {
  const next = row.nextElementSibling;
  if (next && next.classList.contains('sov-detail')) {
    next.remove();
    return;
  }
  const tr = document.createElement('tr');
  tr.className = 'sov-detail';

  // Prepared once and reused for every tax the slider visits; preparing per
  // drag is far too slow.
  const ctx = result.neighbours ? prepareSite({ neighbours: result.neighbours, settings }) : null;

  const cell = document.createElement('td');
  cell.colSpan = 6;
  // Outside the plan block, which replaces its own contents on every redraw.
  const actions = document.createElement('p');
  actions.className = 'sov-detail-actions';
  actions.innerHTML = `<button type="button" class="sov-optimise sec">${GLYPHS.target}Optimise ${
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
    floor: Math.max(0, Math.min(settings.tMin ?? 0, result.tMax)),
    geom: { radius: Math.round(settings.rClaim ?? 2), x: result.x, y: result.y },
    tax: result.tax,
  });
}
