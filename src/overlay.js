// Markers on the game's World Map: the last Scan's top ten, numbered on their
// tiles, and an outline on the tile of the row selected in the panel. A click on
// a listed site's tile selects its row.
//
// The map is a stack of canvases the client paints; there is no element per tile.
// The markers go on a canvas of our own, laid over the tile grid and never taking
// a pointer event, so the game handles every gesture exactly as it would without
// it. Anything on screen describes one view only, so the first move of the map
// removes it. Nothing is drawn, and no listener exists, except in answer to a
// Scan or a selection. The markers show only while Site Search is open in the
// panel; hidden, they are kept, and so is the listener that drops them when the
// map moves, so they come back only on the view they belong to.
//
// Everything above createOverlay is DOM-free and tested under Node.

import { isWorldMapHash } from './panel.js';

// The client's map host, and the canvases measured as the tile grid. First match
// with a size wins, so a layer hidden by one of the game's own map options is
// passed over.
const MAP_HOST_ID = 'mapDiv';
const MAP_LAYER_IDS = ['mapTerrain', 'mapGrid', 'mapSov', 'mapCities'];

const MAP_HASH_VIEW = /^#\/World\/Map\/(-?\d+)\/(-?\d+)\/(\d+)/;

const fail = (reason) => ({ ok: false, reason });

/**
 * Where the view's tile grid sits on screen, from measurements the caller took.
 * The grid is a square of `2 × zoom + 1` tiles a side, centred on the view.
 *
 * @param {object} o
 * @param {{x: number, y: number, zoom: number}} o.view the view the markers are for
 * @param {string} o.hash the page's location hash
 * @param {{left, top, right, bottom}} [o.hostRect] the map host's padding box, in
 *   client pixels — what an absolutely placed child is positioned against
 * @param {{left, top, right, bottom, width, height}} [o.layerRect] the grid layer
 * @returns {{ok: true, left, top, size, offsetX, offsetY, centreX, centreY, zoom, span, pitch}
 *         | {ok: false, reason: string}}
 */
export function mapGeometry({ view, hash, hostRect, layerRect }) {
  if (!isWorldMapHash(hash)) return fail('not-on-map');
  const { x, y, zoom } = view ?? {};
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(zoom) || zoom < 1) {
    return fail('no-view');
  }
  // A bare #/World/Map is a map not moved since arrival, which the view still
  // describes; every move writes the new view into the hash.
  const named = MAP_HASH_VIEW.exec(hash);
  if (named && (Number(named[1]) !== x || Number(named[2]) !== y || Number(named[3]) !== zoom)) {
    return fail('view-moved');
  }
  if (!hostRect) return fail('no-host');
  if (!layerRect) return fail('no-layer');
  const { width, height } = layerRect;
  if (width < 100) return fail('too-small');
  if (Math.abs(width - height) > Math.max(1, 0.005 * width)) return fail('not-square');
  if (layerRect.left < hostRect.left - 1 || layerRect.top < hostRect.top - 1
    || layerRect.right > hostRect.right + 1 || layerRect.bottom > hostRect.bottom + 1) {
    return fail('outside-host');
  }
  const span = 2 * zoom + 1;
  return {
    ok: true,
    left: layerRect.left,
    top: layerRect.top,
    size: width,
    offsetX: layerRect.left - hostRect.left,
    offsetY: layerRect.top - hostRect.top,
    centreX: x,
    centreY: y,
    zoom,
    span,
    pitch: width / span,
  };
}

/** The tile under a client point, or null off the grid. */
export function tileAt(geom, clientX, clientY) {
  const col = Math.floor((clientX - geom.left) / geom.pitch);
  const row = Math.floor((clientY - geom.top) / geom.pitch);
  if (col < 0 || row < 0 || col >= geom.span || row >= geom.span) return null;
  return { x: geom.centreX - geom.zoom + col, y: geom.centreY + geom.zoom - row };
}

/** A tile's square in the overlay canvas's own CSS pixels, or null out of view. */
export function tileBox(geom, x, y) {
  const col = x - geom.centreX + geom.zoom;
  const row = geom.centreY + geom.zoom - y;
  if (col < 0 || row < 0 || col >= geom.span || row >= geom.span) return null;
  return { left: col * geom.pitch, top: row * geom.pitch, size: geom.pitch };
}

/** The game's `x|y` tile readout as a tile, or null when it does not read as one. */
export function parseCoords(text) {
  const m = /^\s*(-?\d+)\s*\|\s*(-?\d+)\s*$/.exec(String(text ?? ''));
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
}

// --- On the page --------------------------------------------------------------

const CANVAS_ID = 'sov-map-overlay';
// The game's coordinate ruler, the topmost layer. The markers go just below it.
const RULER_ID = 'mapCoords';
// The game's readout of the tile under the pointer.
const READOUT_ID = 'coords';

const TOP_COUNT = 10;
// A release further than this from its press is a drag, which moves the map.
const CLICK_SLOP = 4;

// Refusals that mean the map shows some other view, as against a layout this
// version does not know.
const ELSEWHERE = new Set(['not-on-map', 'view-moved']);

const MOVED_TEXT = 'The map has moved; Scan again to number this view.';
const OFF_TEXT = 'The map markers are off: the game’s map is not laid out the way this '
  + 'version expects. The results below are unaffected.';

/** The map host's padding box, which absolute positioning inside it is measured from. */
function paddingBox(el) {
  const b = el.getBoundingClientRect();
  const left = b.left + el.clientLeft;
  const top = b.top + el.clientTop;
  return { left, top, right: left + el.clientWidth, bottom: top + el.clientHeight };
}

/** Measured afresh at each use: the page may have scrolled, or the map been rebuilt. */
function measureMap(view) {
  const host = document.getElementById(MAP_HOST_ID);
  const layer = host && MAP_LAYER_IDS.map((id) => document.getElementById(id))
    .find((el) => el?.parentElement === host && el.getBoundingClientRect().width > 0);
  return mapGeometry({
    view,
    hash: location.hash,
    hostRect: host ? paddingBox(host) : null,
    layerRect: layer?.getBoundingClientRect(),
  });
}

/**
 * Our canvas fitted over the grid, cleared, with a context drawing in CSS pixels.
 * It goes immediately below the ruler: no layer in the stack sets a z-index, so
 * they paint in document order, and one of ours would lift it above the ruler too.
 */
function canvasOver(geom) {
  let canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    const host = document.getElementById(MAP_HOST_ID);
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    const ruler = document.getElementById(RULER_ID);
    if (ruler?.parentElement === host) ruler.before(canvas);
    else host.append(canvas);
  }
  canvas.style.cssText = `position:absolute;left:${geom.offsetX}px;top:${geom.offsetY}px;`
    + `width:${geom.size}px;height:${geom.size}px;pointer-events:none`;
  // Sized to the screen's pixel ratio, as the client sizes its own layers.
  const ratio = window.devicePixelRatio || 1;
  const backing = Math.floor(geom.size * ratio);
  canvas.width = backing;
  canvas.height = backing;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function paintOutline(ctx, box) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#6bf';
  ctx.strokeRect(box.left + 1, box.top + 1, box.size - 2, box.size - 2);
}

// At the deepest zoom a tile is under 13 pixels. The disc's floor keeps its number
// readable there, at the cost of overlapping the neighbouring tiles slightly.
function paintDisc(ctx, box, rank, picked) {
  const d = Math.max(box.size - 2, 14);
  const cx = box.left + box.size / 2;
  const cy = box.top + box.size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, d / 2, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(27,27,27,.85)';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = picked ? '#6bf' : '#3a5';
  ctx.stroke();
  ctx.fillStyle = '#e6e6e6';
  ctx.font = `700 ${d >= 18 ? 11 : 10}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(rank), cx, cy);
}

/**
 * @param {object} o
 * @param {() => ({x, y, zoom}|null)} o.getView the view on screen now
 * @param {(x: number, y: number) => void} o.onPickSite a click on the map landed
 *   on tile x|y
 * @param {(text: string, tooltip?: string) => void} o.onNote what the panel's map
 *   line should say; '' clears it
 */
export function createOverlay({ getView, onPickSite, onNote }) {
  let top = [];          // the last Scan's first ten, until the map moves
  let selected = null;   // the result selected in the panel, until the map moves
  let moved = false;     // the top ten were dropped because the map moved
  let shown = true;      // Site Search is open in the panel
  let press = null;      // a primary press on the map, until its release

  /** Take the canvas off the map, and stop listening for clicks on it. */
  function hide() {
    document.getElementById(CANVAS_ID)?.remove();
    document.removeEventListener('pointerdown', onPress, true);
    document.removeEventListener('pointerup', onRelease, true);
    press = null;
  }

  function remove() {
    hide();
    window.removeEventListener('hashchange', onMove);
  }

  /** Drop the markers and everything they are drawn from. */
  function forget(afterMove) {
    top = [];
    selected = null;
    moved = afterMove;
    remove();
  }

  function refuse(reason) {
    forget(false);
    onNote(OFF_TEXT, reason);
  }

  function note(numbered, outlined) {
    if (selected && !outlined) {
      onNote(`${selected.x}|${selected.y} is not in the map’s current view.`);
    } else if (numbered) {
      onNote(`On the map: the top ten are numbered — ${numbered} ${
        numbered === 1 ? 'is' : 'are'} in view. Click a numbered tile to open its row.`);
    } else {
      onNote(moved ? MOVED_TEXT : '');
    }
  }

  /**
   * Redraw the canvas whole from `top` and `selected`, placed on `view`. While
   * hidden, the same measuring decides what is kept, and nothing is painted.
   */
  function draw(view) {
    const geom = measureMap(view);
    if (!geom.ok && !ELSEWHERE.has(geom.reason)) {
      refuse(geom.reason);
      return;
    }
    const boxOf = (r) => (geom.ok ? tileBox(geom, r.x, r.y) : null);
    const discs = top.map((r, i) => ({ r, rank: i + 1, box: boxOf(r) })).filter((d) => d.box);
    const outline = selected && boxOf(selected);
    // With none of the top ten in view, this is not the view they were ranked on.
    if (!discs.length) {
      if (top.length) moved = true;
      top = [];
    }

    if (!discs.length && !outline) {
      remove();
    } else if (!shown) {
      hide();
      window.addEventListener('hashchange', onMove);
    } else {
      const ctx = canvasOver(geom);
      if (outline) paintOutline(ctx, outline);
      // Worst first, so where two overlap the better one is on top.
      for (const d of [...discs].reverse()) {
        paintDisc(ctx, d.box, d.rank, d.r.x === selected?.x && d.r.y === selected?.y);
      }
      window.addEventListener('hashchange', onMove);
      document.addEventListener('pointerdown', onPress, { capture: true, passive: true });
      document.addEventListener('pointerup', onRelease, { capture: true, passive: true });
    }
    note(discs.length, !!outline);
  }

  function onMove() {
    forget(true);
    onNote(MOVED_TEXT);
  }

  function onPress(e) {
    const onMap = e.isPrimary && e.button === 0
      && e.target instanceof Element && e.target.closest(`#${MAP_HOST_ID}`);
    press = onMap ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
  }

  function onRelease(e) {
    if (!press || e.pointerId !== press.id) return;
    const far = Math.hypot(e.clientX - press.x, e.clientY - press.y) > CLICK_SLOP;
    press = null;
    if (far) return;
    const geom = measureMap(getView());
    if (!geom.ok) {
      if (!ELSEWHERE.has(geom.reason)) refuse(geom.reason);
      return;
    }
    const tile = tileAt(geom, e.clientX, e.clientY);
    if (!tile) return;
    // The readout names the tile the client itself places under the pointer, so
    // it checks the pitch this click was mapped with.
    const readout = parseCoords(document.getElementById(READOUT_ID)?.textContent);
    if (readout && (readout.x !== tile.x || readout.y !== tile.y)) {
      refuse('coords-mismatch');
      return;
    }
    onPickSite(tile.x, tile.y);
  }

  /** Drop the markers and empty the panel's map line. */
  function clear() {
    forget(false);
    onNote('');
  }

  return {
    /**
     * Number the first ten results on the map, if `view` — the view the Scan
     * read — is still the one on screen.
     */
    showTop(results, view) {
      if (!results.length) {
        clear();
        return;
      }
      top = results.slice(0, TOP_COUNT);
      selected = null;
      moved = false;
      draw(view);
    },
    /** Outline a result's tile, or say that it is not in view. */
    outline(result) {
      selected = result;
      draw(getView());
    },
    /** Show the markers while Site Search is open in the panel, and hide them otherwise. */
    setShown(next) {
      shown = next;
      if (!shown) hide();
      else if (top.length || selected) draw(getView());
    },
    clear,
  };
}
