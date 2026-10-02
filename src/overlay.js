// What the panel's open pane has to show on the game's World Map. Site Search
// marks the last Scan's top ten, numbered on their tiles, and the selected row's
// tile with an outline; a click on a listed site's tile selects its row. Optimal
// Sovereignty draws the plan below its form, for looking at only: a click on it
// is the game's alone. A pick armed from that pane makes the next click name a
// tile to plan.
//
// The map is a stack of canvases the client paints; there is no element per tile.
// The marks go on a canvas of our own, laid over the tile grid and never taking
// a pointer event, so the game handles every gesture exactly as it would without
// it. Anything on screen describes one view only, so the first move of the map
// removes it. Nothing is drawn, and no listener exists, except in answer to a
// gesture in the panel. Only the open pane's marks are drawn; the other pane's
// are kept, and so is the listener that drops them when the map moves, so they
// come back only on the view they belong to.
//
// Everything above createOverlay is DOM-free and tested under Node.

import { isWorldMapHash, cellKey, roman } from './panel.js';

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

/**
 * The square reaching `radius` tiles out from x|y, in the overlay canvas's own
 * CSS pixels, whether or not it is in view.
 */
export function squareBox(geom, x, y, radius) {
  return {
    left: (x - radius - geom.centreX + geom.zoom) * geom.pitch,
    top: (geom.centreY + geom.zoom - y - radius) * geom.pitch,
    size: (2 * radius + 1) * geom.pitch,
  };
}

/** A tile's square in the overlay canvas's own CSS pixels, or null out of view. */
export function tileBox(geom, x, y) {
  const col = x - geom.centreX + geom.zoom;
  const row = geom.centreY + geom.zoom - y;
  if (col < 0 || row < 0 || col >= geom.span || row >= geom.span) return null;
  return squareBox(geom, x, y, 0);
}

/**
 * The tiles to mark for a plan, decided as the claim grid decides its cells: a
 * crossed-out tile is crossed whatever the plan says, and a kept claim the plan
 * was never offered is marked from the site's own record. Claimable tiles the
 * plan leaves empty, and the centre, are not marks.
 *
 * @param {object} plan the plan the grid is drawn from
 * @param {{x, y, radius, kept, excluded}} geom the grid's own
 * @returns {{x, y, kind: 'food'|'mil'|'kept'|'out', level?: number}[]}
 */
export function planMarks(plan, geom) {
  // In the grid's order, which matters: military claims sit on free tiles, so a
  // square can be in both lists.
  const claims = new Map();
  const claim = (t, kind, level) => claims.set(cellKey(t.dx, t.dy), kind && { kind, level });
  for (const t of plan.free ?? []) claim(t, t.held > 0 ? 'kept' : null, t.held);
  for (const t of plan.tiles ?? []) claim(t, 'food', t.level);
  for (const m of plan.milsov ?? []) claim(m, 'mil', m.sovLevel);
  const kept = new Map();
  for (const k of geom.kept ?? []) kept.set(cellKey(k.dx, k.dy), { kind: 'kept', level: k.level });

  const marks = [];
  for (let dy = -geom.radius; dy <= geom.radius; dy++) {
    for (let dx = -geom.radius; dx <= geom.radius; dx++) {
      const key = cellKey(dx, dy);
      const mark = geom.excluded?.has(key) ? { kind: 'out' }
        : claims.has(key) ? claims.get(key) : kept.get(key);
      if (mark) marks.push({ x: geom.x + dx, y: geom.y + dy, ...mark });
    }
  }
  return marks;
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
// Below this tile pitch a level numeral does not fit its tile, so the shading
// alone shows the plan.
const NUMERAL_PITCH = 20;
// The claim grid's own colours: a cell's border for the shading, its level's
// for the numeral.
const CLAIM_COLOURS = {
  food: { shade: '#3a5', text: '#8d8' },
  mil: { shade: '#a83', text: '#eb8' },
  kept: { shade: '#4a6a8a', text: '#8ab' },
};
const CAPTURE_PASSIVE = { capture: true, passive: true };

// Refusals that mean the map shows some other view, as against a layout this
// version does not know.
const ELSEWHERE = new Set(['not-on-map', 'view-moved']);

const MOVED_TEXT = 'The map has moved; Scan again to number this view.';
const PLAN_TEXT = 'On the map: the plan is drawn inside its radius.';
const PLAN_MOVED_TEXT = 'The map has moved; Optimise again to draw the plan on this view.';
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

function paintClaim(ctx, box, colours, numeral) {
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = colours.shade;
  ctx.fillRect(box.left, box.top, box.size, box.size);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = colours.shade;
  ctx.strokeRect(box.left + 0.5, box.top + 0.5, box.size - 1, box.size - 1);
  if (!numeral) return;
  const cx = box.left + box.size / 2;
  const cy = box.top + box.size / 2;
  ctx.font = '700 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // A dark rim keeps the numeral legible over any terrain.
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(27,27,27,.85)';
  ctx.strokeText(numeral, cx, cy);
  ctx.fillStyle = colours.text;
  ctx.fillText(numeral, cx, cy);
}

function paintCross(ctx, box) {
  const near = box.size / 4;
  const far = box.size - near;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e55';
  ctx.beginPath();
  ctx.moveTo(box.left + near, box.top + near);
  ctx.lineTo(box.left + far, box.top + far);
  ctx.moveTo(box.left + far, box.top + near);
  ctx.lineTo(box.left + near, box.top + far);
  ctx.stroke();
}

/** The radius as a dashed square, then the claims, then the centre on top. */
function paintPlan(ctx, geom, plan, claims, centre) {
  const square = squareBox(geom, plan.x, plan.y, plan.radius);
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#6bf';
  ctx.strokeRect(square.left + 0.5, square.top + 0.5, square.size - 1, square.size - 1);
  ctx.setLineDash([]);
  const numbered = geom.pitch >= NUMERAL_PITCH;
  for (const { mark, box } of claims) {
    if (mark.kind === 'out') paintCross(ctx, box);
    else paintClaim(ctx, box, CLAIM_COLOURS[mark.kind], numbered && roman(mark.level));
  }
  if (centre) paintOutline(ctx, centre);
}

/**
 * @param {object} o
 * @param {() => ({x, y, zoom}|null)} o.getView the view on screen now
 * @param {(x: number, y: number) => void} o.onPickSite a click on the map landed
 *   on tile x|y while Site Search is open
 * @param {(x: number, y: number) => void} o.onPickCentre the armed pick landed on
 *   tile x|y
 * @param {(armed: boolean) => void} o.onPicking a pick was armed or disarmed
 * @param {(pane: string, text: string, tooltip?: string) => void} o.onNote what
 *   a pane's map line should say; '' clears it
 */
export function createOverlay({ getView, onPickSite, onPickCentre, onPicking, onNote }) {
  let top = [];          // the last Scan's first ten, until the map moves
  let selected = null;   // the result selected in the panel, until the map moves
  let moved = false;     // the top ten were dropped because the map moved
  let marked = false;    // Site Search has a marker in view
  let plan = null;       // the optimiser's plan, {x, y, radius, marks}, while in view
  let picking = false;   // the next click on the map names a tile to plan
  let pane = 'scan';     // the pane open in the panel; null while it is folded
  let press = null;      // a primary press on the map, until its release

  function unpaint() {
    document.getElementById(CANVAS_ID)?.remove();
  }

  /**
   * Listen for the map moving while anything is kept or a pick is armed, and for
   * clicks on it while Site Search's markers are drawn or a pick is armed.
   */
  function listen() {
    const set = (target, type, fn, on, options) => {
      if (on) target.addEventListener(type, fn, options);
      else target.removeEventListener(type, fn, options);
    };
    const clicks = (pane === 'scan' && marked) || picking;
    set(window, 'hashchange', onMove, marked || !!plan || picking);
    set(document, 'pointerdown', onPress, clicks, CAPTURE_PASSIVE);
    set(document, 'pointerup', onRelease, clicks, CAPTURE_PASSIVE);
    if (!clicks) press = null;
  }

  function dropTop(afterMove) {
    top = [];
    selected = null;
    moved = afterMove;
    marked = false;
  }

  function setPicking(next) {
    if (next === picking) return;
    picking = next;
    listen();
    onPicking(next);
  }

  /** Drop everything on the map and everything it is drawn from. */
  function forget() {
    dropTop(false);
    plan = null;
    unpaint();
    setPicking(false);
    listen();
  }

  function refuse(reason) {
    forget();
    onNote('scan', OFF_TEXT, reason);
    onNote('focus', OFF_TEXT, reason);
  }

  function noteTop(numbered, outlined) {
    if (selected && !outlined) {
      onNote('scan', `${selected.x}|${selected.y} is not in the map’s current view.`);
    } else if (numbered) {
      onNote('scan', `On the map: the top ten are numbered — ${numbered} ${
        numbered === 1 ? 'is' : 'are'} in view. Click a numbered tile to open its row.`);
    } else {
      onNote('scan', moved ? MOVED_TEXT : '');
    }
  }

  /**
   * Redraw the canvas whole with the open pane's marks, placed on `view`. The
   * other pane's are measured the same way, which decides what is kept, and are
   * not painted.
   */
  function draw(view = getView()) {
    const geom = measureMap(view);
    if (!geom.ok && !ELSEWHERE.has(geom.reason)) {
      refuse(geom.reason);
      return;
    }
    const boxOf = (t) => (geom.ok ? tileBox(geom, t.x, t.y) : null);

    const discs = top.map((r, i) => ({ r, rank: i + 1, box: boxOf(r) })).filter((d) => d.box);
    const outline = selected && boxOf(selected);
    // With none of the top ten in view, this is not the view they were ranked on.
    if (!discs.length) {
      if (top.length) moved = true;
      top = [];
    }
    marked = !!(discs.length || outline);

    const claims = (plan?.marks ?? []).map((mark) => ({ mark, box: boxOf(mark) }))
      .filter((c) => c.box);
    const centre = plan && boxOf(plan);
    if (plan && !centre && !claims.length) {
      onNote('focus', `${plan.x}|${plan.y} is not in the map’s current view.`);
      plan = null;
    } else if (plan) {
      onNote('focus', PLAN_TEXT);
    }

    if (pane === 'scan' ? marked : pane === 'focus' && plan) {
      const ctx = canvasOver(geom);
      if (pane === 'focus') {
        paintPlan(ctx, geom, plan, claims, centre);
      } else {
        if (outline) paintOutline(ctx, outline);
        // Worst first, so where two overlap the better one is on top.
        for (const d of [...discs].reverse()) {
          paintDisc(ctx, d.box, d.rank, d.r.x === selected?.x && d.r.y === selected?.y);
        }
      }
    } else {
      unpaint();
    }
    listen();
    noteTop(discs.length, !!outline);
  }

  function onMove() {
    if (marked) {
      dropTop(true);
      onNote('scan', MOVED_TEXT);
    }
    if (plan) {
      plan = null;
      onNote('focus', PLAN_MOVED_TEXT);
    }
    unpaint();
    setPicking(false);
    listen();
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
    if (picking) {
      setPicking(false);
      onPickCentre(tile.x, tile.y);
    } else {
      onPickSite(tile.x, tile.y);
    }
  }

  /** Drop Site Search's markers and empty its map line. */
  function clearTop() {
    dropTop(false);
    if (pane === 'scan') unpaint();
    listen();
    onNote('scan', '');
  }

  return {
    /**
     * Number the first ten results on the map, if `view` — the view the Scan
     * read — is still the one on screen.
     */
    showTop(results, view) {
      if (!results.length) {
        clearTop();
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
      draw();
    },
    /**
     * Draw the optimiser's plan from what its claim grid is drawn from, or take
     * it off the map when `next` is null.
     */
    showPlan(next, geom) {
      if (next) {
        plan = { x: geom.x, y: geom.y, radius: geom.radius, marks: planMarks(next, geom) };
        draw();
        return;
      }
      plan = null;
      if (pane === 'focus') unpaint();
      listen();
      onNote('focus', '');
    },
    /** Make the next click on the map name a tile to plan, or stop it doing so. */
    togglePick() {
      setPicking(!picking);
    },
    /**
     * Show the marks of the pane open on screen, `next`, or of none while it is
     * null. Any change of pane disarms a pick.
     */
    setPane(next) {
      pane = next;
      setPicking(false);
      if (top.length || selected || plan) draw();
    },
    clearTop,
    /** Take everything off the map and empty both map lines. */
    clear() {
      forget();
      onNote('scan', '');
      onNote('focus', '');
    },
  };
}
