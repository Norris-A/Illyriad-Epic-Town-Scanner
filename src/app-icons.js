// The tool's own drawings: the app mark and the panel's line glyphs, as inline SVG.

// The crown in white, for a mask. The same-colour stroke rounds the point tips.
const CROWN_MASK = '<path d="M19.5 39.5 L18 24.5 L26 30.5 L32 20.5 L38 30.5 L46 24.5 '
  + 'L44.5 39.5 Z" fill="#fff" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/>'
  + '<rect x="19.5" y="43" width="25" height="4.5" rx="2.25" fill="#fff"/>';

// The app's gold crown on a frosted disc, on a tile; also used as the Tampermonkey
// @icon. The crown is a mask: the banded gold and the glint are painted through
// it. The glint rests off the crown, so the icon is still wherever no stylesheet
// animates it. The ids are prefixed because the SVG is inlined into the game's
// page, where ids share one namespace.
export const APP_ICON_SVG = '<svg class="sov-app-icon" viewBox="0 0 64 64" '
  + 'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sovereignty Scanner">'
  + '<defs><linearGradient id="sov-app-icon-fill" x1="0" y1="0" x2="0" y2="1">'
  + '<stop offset="0" stop-color="#3fbf6a"/><stop offset="1" stop-color="#11806a"/>'
  + '</linearGradient>'
  + '<linearGradient id="sov-app-icon-gold" gradientUnits="userSpaceOnUse" '
  + 'x1="18" y1="19" x2="46" y2="48">'
  + '<stop offset="0" stop-color="#fff4c2"/><stop offset=".3" stop-color="#f4c94a"/>'
  + '<stop offset=".52" stop-color="#c98a14"/><stop offset=".7" stop-color="#f7d873"/>'
  + '<stop offset="1" stop-color="#b5770f"/></linearGradient>'
  + `<mask id="sov-app-icon-crown">${CROWN_MASK}</mask></defs>`
  + '<rect width="64" height="64" rx="15" fill="url(#sov-app-icon-fill)"/>'
  + '<circle cx="32" cy="32" r="26.5" fill="#fff" fill-opacity=".24" '
  + 'stroke="#000" stroke-opacity=".22" stroke-width="3"/>'
  + '<g mask="url(#sov-app-icon-crown)">'
  + '<rect x="10" y="15" width="44" height="38" fill="url(#sov-app-icon-gold)"/>'
  + '<g transform="rotate(25 32 34)"><g class="sov-app-icon-glint" transform="translate(-46 0)">'
  + '<rect x="24" width="6" height="70" fill="#fff" fill-opacity=".6"/>'
  + '<rect x="33" width="2.5" height="70" fill="#fff" fill-opacity=".45"/>'
  + '</g></g></g></svg>';

// Line glyphs for the panel's own controls, drawn in the surrounding text colour.
const glyph = (body) => '<svg class="sov-glyph" viewBox="0 0 16 16" aria-hidden="true" '
  + 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
  + `stroke-linejoin="round">${body}</svg>`;

export const GLYPHS = {
  search: glyph('<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>'),
  target: glyph('<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="1.8"/>'
    + '<path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15"/>'),
  city: glyph('<path d="M2 14V7.5l2-1.5 2 1.5V14M6 14V4l2-2 2 2v10M10 14V7.5l2-1.5 2 1.5V14M1 14h14"/>'),
  download: glyph('<path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11"/>'),
  chevron: glyph('<path d="M6 4l4 4-4 4"/>'),
};
