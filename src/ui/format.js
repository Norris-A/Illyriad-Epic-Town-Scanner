// Small pieces of markup and text that more than one of the panel's renderers
// draw. No DOM.

import { PRODUCTION_LABEL } from '../constants.js';
import { ICONS, PRODUCTION_ICONS } from '../game-icons.js';

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function attr(name, v) {
  return v === undefined || v === null ? '' : ` ${name}="${escapeHtml(v)}"`;
}

export const count = (v) => Number(v ?? 0).toLocaleString('en-GB');

/** A production's name with its icon; alt is empty since the name is beside it. */
export function productionLabel(key) {
  const icon = PRODUCTION_ICONS[key];
  return `${icon ? `<img class="sov-ico" src="${icon}" alt="">` : ''}${PRODUCTION_LABEL[key] ?? key}`;
}

/** Display names for the engine's binding codes. */
const BINDING_LABEL = {
  cap: 'Tax cap',
  food: 'Food',
  rp: 'Research',
  res: 'Resources',
};

export function bindingLabel(binding) {
  return BINDING_LABEL[binding] ?? binding;
}

/**
 * The ceiling that set a row's tax, as the icon of what ran out. The tax cap has
 * no icon, so it is a word.
 */
export function limitHtml(r) {
  const label = bindingLabel(r.binding);
  const icon = r.binding === 'res'
    ? PRODUCTION_ICONS[r.resBinding] ?? ICONS.stone
    : { food: ICONS.food, rp: ICONS.research }[r.binding];
  const title = `Limited by ${(r.binding === 'res' && PRODUCTION_LABEL[r.resBinding]
    ? PRODUCTION_LABEL[r.resBinding] : label).toLowerCase()}`;
  return icon
    ? `<img src="${icon}" alt="${escapeHtml(label)}" title="${escapeHtml(title)}">`
    : `<span class="sov-cap" title="${escapeHtml(title)}">${escapeHtml(label.toLowerCase())}</span>`;
}

export const MILSOV_BLOCKED_TEXT = {
  tiles: 'every claimable tile went to the food plan',
  water: 'every tile the food plan left over is water, which takes no Production Structure',
  slots: 'the food plan used every building slot',
  upkeep: 'the city produces too little wood, clay, iron or stone to run one',
  rp: 'the food plan spent the research this site produces',
};
