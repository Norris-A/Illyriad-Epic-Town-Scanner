// The panel's own tooltip, shown for every `title` in the panel and its
// popovers in place of the browser's.

/**
 * Where a tooltip of `size` sits for an element at `rect`: centred below it,
 * or above when it would run off the bottom, and kept `gap` inside the view.
 */
export function tipPosition(rect, size, view, gap = 6) {
  const centred = rect.left + rect.width / 2 - size.width / 2;
  const left = Math.max(gap, Math.min(centred, view.width - size.width - gap));
  const below = rect.bottom + gap;
  const top = below + size.height + gap <= view.height
    ? below
    : Math.max(gap, rect.top - gap - size.height);
  return { left, top };
}

// Long enough that sweeping the pointer across the panel does not flash them.
const TIP_DELAY_MS = 250;

/**
 * The element an event happened on. A listener outside the shadow root is given
 * the root's host as `target` instead.
 */
export const innerTarget = (e) => e.composedPath()[0];

/**
 * Shows every `title` in the panel and its popovers as a styled tooltip. A
 * title moves to `data-sov-tip` when first hovered, since the browser shows its
 * own tooltip for any element still carrying one, and to `aria-description`,
 * which is what a title gave assistive technology.
 */
export function installTooltips(shadow) {
  const box = document.createElement('div');
  box.className = 'sov-tip';
  box.setAttribute('role', 'tooltip');
  box.hidden = true;
  shadow.appendChild(box);
  let shownFor = null;
  let timer = 0;

  const hide = () => {
    clearTimeout(timer);
    shownFor = null;
    box.hidden = true;
  };
  const show = (el) => {
    shownFor = el;
    box.textContent = el.dataset.sovTip;
    box.classList.toggle('sov-tip-multi', box.textContent.includes('\n'));
    box.hidden = false;
    const { left, top } = tipPosition(
      el.getBoundingClientRect(),
      { width: box.offsetWidth, height: box.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
  };

  // Every element entered fires this, so moving off a tooltip's element onto
  // anything without one hides it, even when the element was re-rendered away.
  document.addEventListener('pointerover', (e) => {
    const el = innerTarget(e).closest?.('.sov-panel [title], .sov-menu [title], [data-sov-tip]');
    if (!el) {
      hide();
      return;
    }
    if (el === shownFor) return;
    if (el.hasAttribute('title')) {
      el.dataset.sovTip = el.title;
      el.setAttribute('aria-description', el.title);
      el.removeAttribute('title');
    }
    clearTimeout(timer);
    // Once one is showing, moving from one element to the next switches straight over.
    if (shownFor) show(el);
    else timer = setTimeout(() => show(el), TIP_DELAY_MS);
  });
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) hide();
  });
  for (const type of ['pointerdown', 'keydown', 'wheel']) {
    document.addEventListener(type, hide, true);
  }
  // A scroll does not leave the shadow root, so the page never hears the panel's.
  for (const target of [document, shadow]) target.addEventListener('scroll', hide, true);
}
