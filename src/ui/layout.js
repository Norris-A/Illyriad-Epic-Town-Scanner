// Where the panel sits and how it is arranged in this browser: its dragged
// position, whether it is folded, and which sections are open. Kept apart from
// the settings, so Reset to Defaults leaves them alone.

const PANEL_POSITION_KEY = 'illyriad-sov-scanner.panel-position';
const PANEL_COLLAPSED_KEY = 'illyriad-sov-scanner.panel-collapsed';
const OPEN_SECTIONS_KEY = 'illyriad-sov-scanner.open-sections';

/** Keep the panel's top-left corner reachable after a drag or viewport resize. */
export function clampPanelPosition(x, y, panelWidth, panelHeight, viewportWidth, viewportHeight) {
  const maxX = Math.max(0, viewportWidth - panelWidth);
  const maxY = Math.max(0, viewportHeight - panelHeight);
  return {
    x: Math.min(maxX, Math.max(0, Number.isFinite(x) ? x : 0)),
    y: Math.min(maxY, Math.max(0, Number.isFinite(y) ? y : 0)),
  };
}

function loadPanelPosition() {
  try {
    const raw = globalThis.localStorage?.getItem(PANEL_POSITION_KEY);
    if (!raw) return null;
    const position = JSON.parse(raw);
    return Number.isFinite(position?.x) && Number.isFinite(position?.y) ? position : null;
  } catch {
    return null;
  }
}

function savePanelPosition(position) {
  try {
    globalThis.localStorage?.setItem(PANEL_POSITION_KEY, JSON.stringify(position));
  } catch {
    // Storage can be unavailable; ignore.
  }
}

export function loadOpenSections() {
  try {
    const names = JSON.parse(globalThis.localStorage?.getItem(OPEN_SECTIONS_KEY) ?? '[]');
    return Array.isArray(names) ? names : [];
  } catch {
    return [];
  }
}

export function saveOpenSections(names) {
  try {
    globalThis.localStorage?.setItem(OPEN_SECTIONS_KEY, JSON.stringify(names));
  } catch {
    // Storage can be unavailable; ignore.
  }
}

export function loadPanelCollapsed() {
  try {
    return globalThis.localStorage?.getItem(PANEL_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function savePanelCollapsed(collapsed) {
  try {
    globalThis.localStorage?.setItem(PANEL_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    // Storage can be unavailable; ignore.
  }
}

/**
 * Let `header` drag the panel `root`, and keep it where it was last dropped.
 *
 * Every placement clamps from where the panel was last dropped, not from where
 * it sits now: the expanded panel is wider than the icon, and keeping its
 * clamped spot would walk the icon in from the edge it was left at.
 *
 * @returns {{placeAtAnchor: () => void, takeDrag: () => boolean}} `takeDrag`
 *   is true once after a press on the header that moved the panel, so the
 *   click that ends it can be ignored
 */
export function installDrag(root, header) {
  let anchor = loadPanelPosition();
  let dragged = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  function positionPanel(x, y) {
    const viewportHeight = window.innerHeight;
    if (root.classList.contains('sov-collapsed')) {
      // Let the stylesheet's max-height:none apply.
      root.style.maxHeight = '';
    } else {
      // Cap the height to the room below the panel's top, so a long tab scrolls
      // inside it and the position clamp below works anywhere down the page.
      const minVisible = header.offsetHeight || 34;
      const top = Math.min(
        Math.max(0, Number.isFinite(y) ? y : 0), Math.max(0, viewportHeight - minVisible),
      );
      root.style.maxHeight = `${viewportHeight - top}px`;
    }
    const position = clampPanelPosition(
      x, y, root.offsetWidth, root.offsetHeight, window.innerWidth, viewportHeight,
    );
    root.style.left = `${position.x}px`;
    root.style.top = `${position.y}px`;
    root.style.right = 'auto';
  }

  function placeAtAnchor() {
    if (anchor) positionPanel(anchor.x, anchor.y);
  }

  header.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.sov-about,.sov-gear,.sov-changelog') || e.button !== 0) return;
    const rect = root.getBoundingClientRect();
    dragPointerId = e.pointerId;
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    dragged = false;
    header.setPointerCapture?.(e.pointerId);
  });

  header.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dragPointerId) return;
    const rect = root.getBoundingClientRect();
    if (!dragged && Math.hypot(e.clientX - (rect.left + dragOffsetX),
      e.clientY - (rect.top + dragOffsetY)) < 3) return;
    dragged = true;
    root.classList.add('sov-dragging');
    e.preventDefault();
    positionPanel(e.clientX - dragOffsetX, e.clientY - dragOffsetY);
  });

  function finishDrag(e) {
    if (e.pointerId !== dragPointerId) return;
    if (dragged) {
      const rect = root.getBoundingClientRect();
      anchor = { x: rect.left, y: rect.top };
      savePanelPosition(anchor);
    }
    root.classList.remove('sov-dragging');
    dragPointerId = null;
  }

  header.addEventListener('pointerup', finishDrag);
  header.addEventListener('pointercancel', finishDrag);
  window.addEventListener('resize', placeAtAnchor);

  return {
    placeAtAnchor,
    takeDrag() {
      const was = dragged;
      dragged = false;
      return was;
    },
  };
}
