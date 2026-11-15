// The claim grid: a plan drawn as the square of tiles around its town. No DOM.

import { descriptorFor } from '../constants.js';
import { ICONS, STRUCTURE_ICONS } from '../game-icons.js';
import { sovStructure, structureUpkeep } from '../scoring.js';
import { cellKey, roman } from '../map-view.js';
import { count, escapeHtml } from './format.js';

const FOOD_ICON = `<img src="${ICONS.food}" alt="food">`;
const CROSS = '<span class="sov-x">✕</span>';

/**
 * One grid cell. `body` and `badge` are markup; `pick` makes the cell
 * clickable, carrying the offsets the click handler reads.
 */
function gridCell({ cls, title, level, body, badge, dx, dy, pick }) {
  return `<td class="sov-cell ${cls}${pick ? ' sov-pick' : ''}"${
    pick ? ` data-dx="${dx}" data-dy="${dy}"` : ''} title="${escapeHtml(title)}">${
    level ? `<span class="sov-lv">${level}</span>` : ''}${
    body ? `<span class="sov-cv">${body}</span>` : ''}${badge ?? ''}</td>`;
}

/**
 * A tile's terrain, as the end of its hover text: its bonus, "no sovereignty
 * bonus", "bonus not read yet", or "unidentified".
 */
export function descriptorText(tile) {
  // A tile without `i` gets nothing; an unknown `i` is flagged.
  if (typeof tile?.i !== 'number' && !tile?.descriptor) return '';
  const d = tile?.descriptor ?? descriptorFor(tile.i);
  if (!d) return `Terrain ${tile.i} — unidentified`;
  const varies = d.nodeClass ? ' (rating varies; not a fixed terrain)' : '';
  if (d.bonusUnread) return `${d.name}${varies} — bonus not read yet`;
  if (d.nodeClass) return `${d.name}${varies}`;
  if (!d.building) return `${d.name} — no sovereignty bonus`;
  return `${d.name}: +${d.bonus}% ${d.product} per level of ${d.building}`;
}

/**
 * A tile's terrain bonus as shown on the grid, e.g. "+3% Bows". The product is
 * written out because the icons cannot tell the products apart. Empty when the
 * terrain grants nothing or is unidentified.
 */
export function descriptorBadge(tile) {
  const d = tile?.descriptor ?? (typeof tile?.i === 'number' ? descriptorFor(tile.i) : null);
  if (!d?.building) return '';
  return `<span class="sov-desc" title="${escapeHtml(
    `+${d.bonus}% ${d.product} per level of ${d.building}`)}">+${d.bonus}% ${
    escapeHtml(d.product)}</span>`;
}

/** A claim's hourly research, counting only the levels it adds to a kept claim. */
function claimCostText(t) {
  const held = t.held ?? 0;
  const rp = t.rp.toFixed(0);
  if (held > 0 && t.rp > 0) return `+${rp} RP/hr, raised from Sov ${roman(held)}`;
  if (held > 0) return 'Already held at this level, no extra RP';
  return `${rp} RP/hr`;
}

/** A grid tooltip: the tile and what it is, then one fact per line. */
function tip(head, ...lines) {
  return [head, ...lines].filter(Boolean).join('\n');
}

/**
 * The plan as a map around the town, highest y in the top row as on the game
 * map. Tiles the plan cannot have, whether ruled out by the game or crossed out
 * by the user, are drawn crossed.
 *
 * @param {object} plan the plan to draw, as planSiteAt returns it
 * @param {{radius: number, x: number, y: number, excluded: Set<string>,
 *   pickable: boolean}} geom the square to draw, its centre, the tiles crossed
 *   out, and whether cells take clicks. Without coordinates, labels are offsets
 * @returns {string} the grid, with its legend under it
 */
export function planGridHtml(plan, geom) {
  const r = Math.max(1, Math.round(geom?.radius ?? 0) || spanOf(plan));
  const cx = geom?.x;
  const cy = geom?.y;
  const excluded = geom?.excluded ?? new Set();
  const kept = new Map((geom?.kept ?? []).map((k) => [cellKey(k.dx, k.dy), k]));
  const pickable = !!geom?.pickable;
  const absolute = Number.isFinite(cx) && Number.isFinite(cy);
  // Real coordinates where known, since those are what the game shows.
  const xLabel = (dx) => (absolute ? String(cx + dx) : signed(dx));
  const yLabel = (dy) => (absolute ? String(cy + dy) : signed(dy));
  const name = (dx, dy) => (absolute ? `${cx + dx}|${cy + dy}` : `${signed(dx)},${signed(dy)}`);

  const specs = new Map();
  // Whether any square is drawn as kept, for the legend.
  let anyKept = false;

  const place = (t) => `${t.water ? 'Water · food' : 'Food'} ${t.food} · distance ${t.d.toFixed(2)}`;

  // `free` goes first: military claims sit on free tiles and overwrite them.
  for (const t of plan.free ?? []) {
    // A free tile with a kept claim is one the town keeps paying for and builds nothing on.
    const held = t.held ?? 0;
    if (held > 0) anyKept = true;
    specs.set(cellKey(t.dx, t.dy), held > 0 ? {
      cls: 'sov-cell-kept',
      badge: descriptorBadge(t),
      title: tip(`${name(t.dx, t.dy)} — Sov ${roman(held)} claim, kept as it is`, place(t),
        descriptorText(t)),
      level: roman(held),
      body: 'kept',
    } : {
      cls: t.water ? 'sov-cell-free sov-cell-water' : 'sov-cell-free',
      badge: descriptorBadge(t),
      title: tip(`${name(t.dx, t.dy)} — ${t.relaid ? 'Claimed, not used in this plan' : 'Unclaimed'}`,
        place(t), descriptorText(t)),
      body: `${FOOD_ICON} ${t.food}`,
    });
  }
  for (const t of plan.tiles ?? []) {
    specs.set(cellKey(t.dx, t.dy), {
      cls: 'sov-cell-food',
      badge: descriptorBadge(t),
      title: tip(`${name(t.dx, t.dy)} — Sov ${roman(t.level)} food claim`, place(t),
        claimCostText(t), descriptorText(t)),
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
      title: tip(`${name(m.dx, m.dy)} — Sov ${roman(m.sovLevel)} ${
        structure.military ? 'military' : structure.name} claim`,
        `Level ${m.buildingLevel} ${structure.name} · ${
          count(structureUpkeep(m))}/hr upkeep`,
        `Distance ${m.d.toFixed(2)} · ${claimCostText(m)}`, descriptorText(m)),
      level: roman(m.sovLevel),
      body: `${icon ? `<img src="${icon}" alt="${escapeHtml(structure.name)}">` : ''} L${
        m.buildingLevel}`,
    });
  }

  const cell = (dx, dy) => {
    if (dx === 0 && dy === 0) {
      return gridCell({ cls: 'sov-cell-town', title: `${name(0, 0)} — The town`, level: 'TOWN' });
    }
    if (excluded.has(cellKey(dx, dy))) {
      return gridCell({
        cls: 'sov-cell-out',
        title: tip(`${name(dx, dy)} — Crossed out`, pickable && 'Click to put it back'),
        body: CROSS,
        dx,
        dy,
        pick: pickable,
      });
    }
    const spec = specs.get(cellKey(dx, dy));
    if (!spec) {
      // A kept claim on a tile the planner was not offered is drawn from the record.
      const k = kept.get(cellKey(dx, dy));
      if (k) {
        anyKept = true;
        return gridCell({
          cls: 'sov-cell-kept',
          title: tip(`${name(dx, dy)} — Sov ${roman(k.level)} claim, kept as it is`,
            `Distance ${k.d.toFixed(2)} · ${k.rp.toFixed(0)} RP/hr`),
          level: roman(k.level),
          body: 'kept',
        });
      }
      return gridCell({ cls: 'sov-cell-none', title: `${name(dx, dy)} — Not claimable`, body: CROSS });
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
    <div class="sov-keys">
      <span><i class="sov-sw sov-sw-food"></i>Food claim</span>
      <span><i class="sov-sw sov-sw-mil"></i>Military claim</span>${
  anyKept ? '<span><i class="sov-sw sov-sw-kept"></i>Kept claim</span>' : ''}
      <span><i class="sov-sw sov-sw-free"></i>Unclaimed</span>
      <span><i class="sov-sw sov-sw-out">✕</i>Unavailable</span>
    </div>
    <p class="sov-legend">I–V is the claim level, L the building's, and the last line the
      terrain bonus.${pickable ? ' Click a tile to cross it out and re-plan without it.' : ''}
      Hover a tile for the rest.</p>`;
}

function range(r) {
  return Array.from({ length: 2 * r + 1 }, (_, i) => i - r);
}

function signed(v) {
  return `${v >= 0 ? '+' : ''}${v}`;
}

/** How far out the plan reaches, for a caller with no radius. */
function spanOf(plan) {
  let span = 1;
  for (const t of [...(plan.free ?? []), ...(plan.tiles ?? []), ...(plan.milsov ?? [])]) {
    span = Math.max(span, Math.abs(t.dx), Math.abs(t.dy));
  }
  return span;
}
