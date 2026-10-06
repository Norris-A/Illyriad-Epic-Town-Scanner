// The side panel: the three tabs, the gear menu and the CSV writer. It never
// touches the game's map; main.js relays between it and overlay.js.
//
// Coordinates are shown as "x|y", as in game, though payload keys are "y|x".
//
// Everything above createPanel is DOM-free and tested under Node.

import {
  DEFAULT_CITY_CONSUMPTION,
  DEFAULT_SETTINGS,
  FLOUR_MILL_L20,
  NATURES_BOUNTY_BY_RETREATS,
  FAMINE_MANAGEMENT,
  SOIL_ENRICHMENT,
  MILSOV_STRUCTURES,
  SOV_LEVEL_ROMAN,
  BASIC_RESOURCES,
  RESOURCE_BOOSTERS,
  RESOURCE_BOOSTER_BONUS,
  PRESTIGE_KEYS,
  PRESTIGE_PRODUCTION_BONUS,
  MINIMUM_KEYS,
  PLOT_KEYS,
  PLOT_TOTAL,
  PRODUCTION_LABEL,
  UPKEEP_BUILDINGS,
  descriptorFor,
} from './constants.js';
import { APP_ICON_SVG, GLYPHS } from './app-icons.js';
import {
  ICONS, PRODUCTION_ICONS, STRUCTURE_ICONS, UPKEEP_GROUP_ICONS,
} from './game-icons.js';
import { extractTowns, tileKey } from './payload.js';
import {
  computeBOther,
  computeResearch,
  prestigeBonus,
  researchAt,
  sovStructure,
  structureUpkeep,
  prepareSite,
  planSiteAt,
  scoreSiteFrom,
} from './scoring.js';
import {
  DEFAULT_FOCUS,
  FOCUS_DEFAULT_TAX,
  FOCUS_TAX_FLOOR,
  parseFocus,
  focusRadius,
  focusSite,
} from './focus.js';

const CSS = `
/* The game's own stylesheet also matches the panel's elements, and beats any
   colour or font they would inherit. So every element gets its own here, first,
   and nested elements need explicit rules: they never inherit size, weight or
   colour. */
.sov-panel,.sov-panel *{color:#e6e6e6;background:transparent;text-shadow:none;
  text-transform:none;letter-spacing:normal;font:12px/1.4 system-ui,sans-serif}
.sov-panel,.sov-menu{--bg:#1b1b1b;--card:#222;--card-hi:#292929;--line:#333;--line2:#444;
  --muted:#9a9a9a;--accent:#3a5;--accent-text:#7fdca0;--blue:#6bf;--amber:#eb8;--red:#e66}
.sov-panel strong,.sov-panel b{font-weight:700}
/* Lets a glyph's currentColor follow its button instead of the reset. */
.sov-panel .sov-glyph,.sov-panel .sov-glyph *{color:inherit}
.sov-glyph{flex:none;width:14px;height:14px}
/* Only the body scrolls; the header and tabs stay put. */
.sov-panel{position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow:hidden;
  display:flex;flex-direction:column;z-index:99999;background:var(--bg);
  border-left:1px solid var(--line2);box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-panel h2{flex:none;margin:0;padding:8px 10px;font-size:13px;font-weight:600;
  color:#fff;background:#262626;cursor:move;user-select:none}
/* Laid out on an inner element: the game's stylesheet forces the h2's display. */
.sov-panel h2 .sov-h2-inner{display:flex;align-items:center;gap:8px}
.sov-panel h2 .sov-title{min-width:0;font-size:13px;font-weight:600;color:#fff}
.sov-panel h2 .sov-h2-actions{margin-left:auto;flex:none;display:flex;align-items:center;gap:12px}
.sov-panel.sov-dragging{cursor:grabbing}
.sov-panel.sov-dragging h2{cursor:grabbing}
.sov-panel h2 .sov-about{color:#8a8a8a;text-decoration:none;font-size:18px;line-height:1}
.sov-panel h2 .sov-about:hover{color:#fff}
/* Not a <button>: the game's button rules would give it padding and width. */
.sov-panel h2 .sov-gear{color:#8a8a8a;font-size:18px;line-height:1;cursor:pointer}
.sov-panel h2 .sov-gear:hover{color:#fff}
.sov-panel h2 .sov-gear:focus-visible{outline:1px solid var(--blue)}
.sov-panel h2 .sov-build{color:#777;font-size:10px;font-weight:normal}
/* No pointer events, so the icon never takes the header's drag. */
.sov-panel h2 .sov-app-icon{flex:none;width:18px;height:18px;pointer-events:none}
/* The gear menu lives outside the panel, so the panel's overflow cannot clip
   it, and needs its own reset. */
.sov-menu,.sov-menu *{color:#e6e6e6;background:transparent;text-shadow:none;
  text-transform:none;letter-spacing:normal;font:12px/1.4 system-ui,sans-serif}
.sov-menu{position:fixed;z-index:100000;width:260px;box-sizing:border-box;
  background:var(--bg);border:1px solid var(--line2);border-radius:8px;padding:8px 10px;
  box-shadow:0 4px 12px rgba(0,0,0,.5)}
.sov-menu h3{margin:0 0 6px;font-size:13px;font-weight:600;color:#fff}
.sov-menu[hidden]{display:none}
.sov-collapsed{width:auto;max-height:none;overflow:visible;border-left:0;
  background:transparent;box-shadow:none}
.sov-collapsed .sov-body,.sov-collapsed .sov-tabs{display:none}
/* The icon is its own tile, so the header shrinks to it; the radius matches the
   tile's so the shadow follows its corners. */
.sov-collapsed h2{padding:0;background:transparent;border-radius:13px;
  box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-collapsed h2 .sov-title,.sov-collapsed h2 .sov-h2-actions{display:none}
.sov-collapsed h2 .sov-app-icon{width:56px;height:56px;margin:0;vertical-align:middle}
/* A glint sweeps the crown once per hover. The sweep starts from the glint's
   resting translate in APP_ICON_SVG, and its px are the icon's own units. */
@keyframes sov-glint{from{transform:translateX(-46px)}to{transform:translateX(46px)}}
@media (prefers-reduced-motion:no-preference){
  .sov-collapsed h2:hover .sov-app-icon-glint{animation:sov-glint .85s ease-in-out}}

.sov-tabs{flex:none;display:flex;margin:0;padding:0 6px;background:#262626;
  border-bottom:1px solid var(--line2)}
.sov-panel .sov-tabs button{flex:1 1 auto;display:flex;align-items:center;justify-content:center;
  gap:5px;background:transparent;color:#9a9a9a;padding:7px 6px 6px;border-radius:0;
  border-bottom:2px solid transparent;white-space:nowrap}
.sov-panel .sov-tabs button:hover{color:#fff}
.sov-panel .sov-tabs button.on{color:#fff;border-bottom-color:var(--accent)}
/* min-height:0 lets the body shrink, rather than push the header off screen. */
.sov-body{flex:1 1 auto;min-height:0;overflow:auto;padding:10px}

.sov-panel button{display:inline-flex;align-items:center;gap:5px;background:var(--accent);
  color:#fff;border:0;border-radius:4px;padding:5px 11px;cursor:pointer;font-weight:600}
.sov-panel button:hover{filter:brightness(1.12)}
.sov-panel button.sec{background:#3a3a3a;font-weight:normal}
.sov-panel button[disabled]{background:#2e2e2e;color:#777;cursor:not-allowed;filter:none}
.sov-panel button.sov-picking{background:#a33}
.sov-run{margin:8px 0 4px}
.sov-panel .sov-run button{width:100%;justify-content:center;padding:7px 11px}
.sov-toolbar{display:flex;align-items:center;gap:6px;margin:0 0 8px}
.sov-toolbar .sov-export{margin-left:auto}

.sov-panel input[type=number],.sov-panel select,.sov-menu select{background:#121212;color:#ddd;
  border:1px solid var(--line2);border-radius:4px;padding:2px 5px;font:inherit;box-sizing:border-box}
.sov-panel input[type=number]:focus,.sov-panel select:focus{outline:none;border-color:var(--accent)}
.sov-panel input[type=number]::placeholder{color:#666}
.sov-panel input[type=range]{accent-color:var(--accent)}
/* Tick-boxes drawn as switches, with gradients: not every browser paints
   pseudo-elements on an input. */
.sov-panel input[type=checkbox],.sov-menu input[type=checkbox]{-webkit-appearance:none;
  appearance:none;flex:none;box-sizing:border-box;width:28px;height:16px;margin:0;
  border:1px solid var(--line2);border-radius:8px;cursor:pointer;
  background:radial-gradient(circle at 7px 50%,#9a9a9a 4.5px,transparent 5px) #2b2b2b;
  transition:background-color .12s}
.sov-panel input[type=checkbox]:checked,.sov-menu input[type=checkbox]:checked{
  border-color:var(--accent);
  background:radial-gradient(circle at 19px 50%,#fff 4.5px,transparent 5px) var(--accent)}
.sov-panel input[type=checkbox]:focus-visible,.sov-menu input[type=checkbox]:focus-visible{
  outline:1px solid var(--blue)}
.sov-panel input:disabled,.sov-panel select:disabled{cursor:not-allowed}

.sov-f{display:flex;align-items:center;justify-content:space-between;gap:8px;
  min-height:24px;margin:1px 0}
.sov-f>span{flex:1}
/* The label is only as wide as its text, so a click in the gap toggles nothing. */
.sov-f>label{cursor:pointer;min-width:0;color:#d4d4d4}
.sov-f input[type=number]{width:70px;text-align:right}
.sov-f select{max-width:180px}
.sov-gated{opacity:.4}

.sov-sec{margin:0 0 6px;background:var(--card);border:1px solid var(--line);border-radius:6px}
.sov-sec>summary{display:flex;align-items:center;gap:8px;padding:6px 9px;cursor:pointer;
  list-style:none;user-select:none;border-radius:6px}
.sov-sec>summary::-webkit-details-marker{display:none}
.sov-sec>summary:hover{background:var(--card-hi)}
.sov-sec[open]>summary{border-bottom:1px solid var(--line);border-radius:6px 6px 0 0}
/* A fixed width, so section names line up whatever the icons. */
.sov-sec-ico{flex:none;width:40px;display:flex;align-items:center;justify-content:center}
.sov-panel .sov-sec-ico img{width:22px;height:22px;margin:0;image-rendering:pixelated}
.sov-panel .sov-sec-ico img:not(:only-child){width:16px;height:16px}
.sov-panel .sov-sec-ico img+img{margin-left:-8px}
.sov-panel .sov-sec-name{flex:none;font-weight:600;color:#fff}
.sov-sum{margin-left:auto;min-width:0;display:flex;align-items:center;justify-content:flex-end;
  gap:3px;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden}
.sov-panel .sov-sum *{font-size:11px;color:inherit}
.sov-panel .sov-sum img{width:12px;height:12px;margin:0 0 0 4px;image-rendering:pixelated}
.sov-panel .sov-sum .sov-bad{color:var(--red);font-weight:700}
.sov-chev{flex:none;display:flex;color:#777;transition:transform .12s}
.sov-sec[open]>summary .sov-chev{transform:rotate(90deg)}
.sov-sec-body{padding:6px 9px 8px}
.sov-card{margin:0 0 6px;padding:6px 9px;background:var(--card);border:1px solid var(--line);
  border-radius:6px}

.sov-panel img.sov-ico{width:12px;height:12px;vertical-align:-2px;margin-right:4px;
  image-rendering:pixelated}
.sov-plot-fields{display:flex;gap:4px;margin:2px 0}
.sov-plot{flex:1;text-align:center}
.sov-plot-fields label{display:block;font-size:10px;color:#b5b5b5;cursor:pointer}
.sov-plot-fields label .sov-ico{display:block;width:18px;height:18px;margin:0 auto 1px}
.sov-panel .sov-plot-fields input{width:100%;text-align:center}
.sov-plotbar{display:flex;gap:1px;height:7px;margin:5px 0 3px}
.sov-plotbar>i{flex:1;border-radius:1px;background:#2e2e2e}
.sov-plotbar>i.sov-p-wood{background:#9b7440}
.sov-plotbar>i.sov-p-clay{background:#c2633b}
.sov-plotbar>i.sov-p-iron{background:#5f9a86}
.sov-plotbar>i.sov-p-stone{background:#a0a0a0}
.sov-plotbar>i.sov-p-food{background:#d9b23f}
.sov-plotbar>i.sov-p-over{background:var(--red)}
.sov-plot-sum{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 6px}
.sov-plot-sum .sov-plot-total{font-size:11px}
.sov-panel .sov-plot-sum button{padding:3px 8px;font-size:11px;white-space:nowrap}
.sov-bad{color:var(--red);font-weight:bold}
.sov-ok{color:#6c6}

.sov-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:10px;
  background:#2a2a2a;border:1px solid var(--line2);font-size:11px;white-space:nowrap}
.sov-panel .sov-chip img{width:12px;height:12px;margin:0;image-rendering:pixelated}
.sov-panel .sov-chip b{font-size:11px}
.sov-chip.sov-on{color:var(--accent-text);border-color:#2f5a3a;background:#1d2a20}
.sov-chip.sov-off{color:#7d7d7d}
.sov-derived{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 0}
.sov-derived-food{margin:6px 0 0;color:var(--accent-text);font-size:11px}

.sov-panel table.sov-matrix{width:100%;border-collapse:collapse}
.sov-panel .sov-matrix th{padding:2px 4px 4px;border-bottom:1px solid var(--line2);
  font-size:10px;font-weight:600;color:var(--muted);text-align:center;cursor:help}
.sov-panel .sov-matrix td{padding:3px 4px;border-bottom:1px solid #2a2a2a;text-align:center}
.sov-panel .sov-matrix th:first-child,.sov-panel .sov-matrix td:first-child{text-align:left}
.sov-panel .sov-matrix tr:last-child td{border-bottom:0}
.sov-panel .sov-matrix input[type=number]{width:72px;text-align:right}
.sov-matrix .sov-none{color:#555}

.sov-upkeep-group{display:flex;align-items:center;gap:6px;margin:10px 0 2px;padding-bottom:3px;
  border-bottom:1px solid var(--line);color:var(--accent-text);font-weight:600}
.sov-upkeep-group:first-child{margin-top:0}
.sov-panel .sov-upkeep-group img{width:18px;height:18px;image-rendering:pixelated}
.sov-f>.sov-uses{flex:none;display:inline-flex;gap:3px;margin-left:auto;cursor:help}
.sov-panel .sov-uses img{width:12px;height:12px;image-rendering:pixelated}
.sov-panel [data-upkeep-row] input[type=number]{width:52px}
.sov-panel .sov-has>label{color:#fff;font-weight:600}

/* Framed in red even when empty, as a warning that a reading here overrides
   the settings above. */
.sov-panel fieldset.sov-override{border:1px solid #6a2a2a;border-radius:6px;background:#211a1a;
  margin:6px 0 2px;padding:2px 8px 6px}
.sov-panel fieldset.sov-override.sov-override-on{border-color:#e55;background:#2a1b1b}
.sov-panel .sov-override>legend{padding:0 4px;color:#e88;font-weight:600;font-size:11px}
.sov-panel .sov-override.sov-override-on>legend{color:#f99}

.sov-form-foot{display:flex;align-items:center;gap:8px;margin:10px 0 0}

.sov-hint{color:var(--muted);font-size:11px;margin:2px 0}
.sov-note{color:#b5b5b5;font-size:11px;margin:2px 0}
.sov-warn{color:var(--red);font-weight:bold;font-size:11px;margin:2px 0}
.sov-flag{color:#e94}
.sov-legend{color:var(--muted);font-size:10px;margin:2px 0}
.sov-meta{display:flex;align-items:center;gap:6px;margin:0 0 4px;color:#b5b5b5;font-size:11px}
.sov-meta .sov-glyph{color:var(--muted)}

.sov-panel table{width:100%;border-collapse:collapse}
.sov-panel th,.sov-panel td{padding:3px 4px;border-bottom:1px solid #2a2a2a;text-align:right}
.sov-panel th{font-size:11px;font-weight:600;color:var(--muted);border-bottom-color:var(--line2)}
.sov-panel th:first-child,.sov-panel td:first-child{text-align:left}
.sov-panel .sov-results td{font-variant-numeric:tabular-nums}
.sov-panel .sov-results th img{width:14px;height:14px;vertical-align:-3px;image-rendering:pixelated}
.sov-panel .sov-results td.sov-at{text-align:left;white-space:nowrap}
.sov-row{cursor:pointer}
.sov-row:hover>td{background:#252525}
.sov-selected>td,.sov-selected:hover>td{background:#1f3326}
.sov-panel td.sov-tax-cell,.sov-panel td.sov-mil-cell{white-space:nowrap}
.sov-panel .sov-tax-cell b{font-size:12px;color:#fff}
.sov-panel th{white-space:nowrap}
.sov-panel .sov-mil-v{font-size:12px;color:var(--amber)}
.sov-panel .sov-pill img{width:11px;height:11px;margin-right:3px;vertical-align:-2px;image-rendering:pixelated}
.sov-panel .sov-tax-cell img{width:12px;height:12px;margin-left:4px;vertical-align:-2px;
  image-rendering:pixelated}
.sov-panel .sov-cap{margin-left:4px;font-size:9px;color:var(--muted)}
/* Styled like the numbered markers on the World Map. */
.sov-rank{display:inline-block;box-sizing:border-box;min-width:18px;height:18px;margin-right:6px;
  border-radius:9px;text-align:center;font-size:10px;line-height:16px;font-weight:700;color:#777}
.sov-rank.sov-rank-top{border:2px solid var(--accent);background:#141414;color:#fff;line-height:14px}
.sov-pill{display:inline-block;margin:1px 0 1px 2px;padding:0 6px;border-radius:8px;font-size:10px;
  line-height:15px;white-space:nowrap;background:#333;color:#ccc;cursor:help}
.sov-pill.sov-pill-warn{background:#3a2e1a;color:var(--amber)}
.sov-pill.sov-pill-bad{background:#3a1d1d;color:#f99}
.sov-panel tr.sov-detail>td{background:#1f1f1f;padding:8px;border-bottom:2px solid var(--line2);
  text-align:left}
.sov-detail-actions{margin:0 0 6px}
.sov-panel .sov-detail-actions button{padding:4px 9px}

.sov-xy{display:flex;align-items:center;gap:4px}
.sov-panel .sov-xy input{width:58px;text-align:right}
/* Sized explicitly, overriding the game's own button height and width. */
.sov-panel .sov-xy button{width:auto;min-width:0;height:auto;min-height:0;margin:0;
  padding:3px 8px;line-height:1.4;white-space:nowrap}
.sov-xy .sov-or{color:#777;font-size:11px}
.sov-no-map .sov-map-only{display:none}
.sov-panel a.sov-map-centre{color:var(--blue);text-decoration:underline}

.sov-result-h{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:10px 0 4px;
  padding-top:10px;border-top:1px solid var(--line)}
.sov-panel .sov-xy-big{margin-right:4px;font-size:16px;font-weight:700;color:#fff}

.sov-tax{display:flex;align-items:center;gap:8px;margin:2px 0 6px;padding:6px 8px;
  background:#262626;border-radius:6px}
.sov-panel .sov-tax-label{font-weight:600}
.sov-panel .sov-tax input[type=range]{flex:1;min-width:0;margin:0}
.sov-panel .sov-tax output{min-width:36px;text-align:right;font-size:15px;font-weight:700;
  color:var(--blue);font-variant-numeric:tabular-nums}
.sov-panel table.sov-balance{margin:4px 0}
.sov-panel .sov-balance th,.sov-panel .sov-balance td{padding:3px 3px}
.sov-panel .sov-balance td{font-variant-numeric:tabular-nums}
.sov-panel .sov-balance td.sov-use{width:46%;text-align:left}
.sov-panel .sov-balance .sov-use-txt{display:block;font-size:9px;color:#777;line-height:1.2}
.sov-bar{position:relative;height:6px;margin-top:2px;border-radius:3px;background:#2e2e2e;overflow:hidden}
.sov-bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#4a8a5c}
.sov-bar.sov-bar-full>i{background:#c9923e}
.sov-bar.sov-bar-over>i{background:var(--red)}
.sov-mil{margin:6px 0;padding:5px 8px;background:#221d15;border-left:3px solid #a83;border-radius:0 4px 4px 0}
.sov-panel .sov-mil .sov-mil-bonus{font-size:17px;font-weight:700;color:var(--amber);
  font-variant-numeric:tabular-nums}
.sov-panel .sov-mil .sov-mil-what{color:var(--amber)}
.sov-mil .sov-hint{display:block;margin:1px 0 0}
.sov-desc{display:block;font-size:9px;line-height:1.15;opacity:.85;word-break:break-word}

/* The claim grid. Selectors are qualified to outrank the panel's own table and
   td rules. */
.sov-grid-wrap{overflow-x:auto;margin:6px 0}
.sov-panel table.sov-grid{width:auto;border-collapse:separate;border-spacing:2px}
.sov-panel .sov-grid th{padding:0 2px;border:0;text-align:center;font-size:10px;font-weight:400;
  color:#777;font-variant-numeric:tabular-nums}
.sov-panel .sov-grid td{width:46px;height:38px;padding:1px;border:1px solid #303030;
  border-radius:3px;text-align:center;vertical-align:middle;background:#1e1e1e}
.sov-grid img{width:12px;height:12px;vertical-align:-2px;image-rendering:pixelated}
.sov-lv{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;color:#8a8a8a}
.sov-cv{display:block;font-size:11px;font-variant-numeric:tabular-nums}
.sov-panel .sov-grid .sov-cell-town{background:#243;border-color:var(--blue)}
.sov-grid .sov-cell-town .sov-lv{color:var(--blue)}
.sov-panel .sov-grid .sov-cell-food{background:#1d2a1d;border-color:#3a5}
.sov-grid .sov-cell-food .sov-lv{color:var(--accent-text)}
.sov-panel .sov-grid .sov-cell-mil{background:#2a241a;border-color:#a83}
.sov-grid .sov-cell-mil .sov-lv{color:var(--amber)}
.sov-grid .sov-cell-free .sov-cv{color:#7d7d7d}
.sov-panel .sov-grid .sov-cell-water{background:#16202a;border-color:#2a3a4a}
.sov-panel .sov-grid .sov-cell-kept{background:#1b2430;border-color:#4a6a8a}
.sov-grid .sov-cell-kept .sov-lv{color:#8ab}
.sov-grid .sov-cell-kept .sov-cv{color:#7d8fa0}
.sov-panel .sov-grid .sov-cell-out{background:#2b1a1a;border-color:#8a3a3a}
.sov-grid .sov-cell-out .sov-x{color:#e55}
.sov-panel .sov-grid .sov-cell-none{background:#161616;border-color:#252525}
.sov-grid .sov-cell-none .sov-x{color:#3f3f3f}
.sov-x{display:block;font-size:13px;line-height:1.3}
.sov-grid .sov-pick{cursor:pointer}
.sov-grid .sov-pick:hover{outline:1px solid var(--blue)}
.sov-keys{display:flex;flex-wrap:wrap;gap:3px 10px;margin:2px 0}
.sov-keys>span{display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#b5b5b5}
.sov-sw{display:inline-block;box-sizing:border-box;width:11px;height:11px;border:1px solid;
  border-radius:2px;font-size:9px;line-height:9px;text-align:center}
.sov-sw.sov-sw-food{background:#1d2a1d;border-color:#3a5}
.sov-sw.sov-sw-mil{background:#2a241a;border-color:#a83}
.sov-sw.sov-sw-kept{background:#1b2430;border-color:#4a6a8a}
.sov-sw.sov-sw-free{background:#1e1e1e;border-color:#3a3a3a}
.sov-sw.sov-sw-out{background:#2b1a1a;border-color:#8a3a3a;color:#e55}
/* Any display rule above beats the browser's own [hidden], so this one comes last. */
.sov-panel [hidden]{display:none}
`;

export const PANEL_POSITION_KEY = 'illyriad-sov-scanner.panel-position';
export const PANEL_COLLAPSED_KEY = 'illyriad-sov-scanner.panel-collapsed';

export const WORLD_MAP_HASH = '#/World/Map';

/** Whether a location hash is the World Map, including deep links to a tile. */
export function isWorldMapHash(hash) {
  return String(hash ?? '').startsWith(WORLD_MAP_HASH);
}

/** The view centred on x|y, zoomed out at least far enough to show `radius`. */
export function centredView(x, y, zoom, radius) {
  return { x, y, zoom: Math.max(zoom, radius) };
}

/** The World Map route to `view`, as the game writes it. */
export function mapHash(view) {
  return `${WORLD_MAP_HASH}/${view.x}/${view.y}/${view.zoom}`;
}

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

const OPEN_SECTIONS_KEY = 'illyriad-sov-scanner.open-sections';

function loadOpenSections() {
  try {
    const names = JSON.parse(globalThis.localStorage?.getItem(OPEN_SECTIONS_KEY) ?? '[]');
    return Array.isArray(names) ? names : [];
  } catch {
    return [];
  }
}

function saveOpenSections(names) {
  try {
    globalThis.localStorage?.setItem(OPEN_SECTIONS_KEY, JSON.stringify(names));
  } catch {
    // Storage can be unavailable; ignore.
  }
}

function loadPanelCollapsed() {
  try {
    return globalThis.localStorage?.getItem(PANEL_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function savePanelCollapsed(collapsed) {
  try {
    globalThis.localStorage?.setItem(PANEL_COLLAPSED_KEY, collapsed ? '1' : '0');
  } catch {
    // Storage can be unavailable; ignore.
  }
}

// --- Settings model ---------------------------------------------------------

// Defined in constants.js; re-exported for the form and its tests.
export { PLOT_KEYS, PLOT_TOTAL };

/** A production's name with its icon; alt is empty since the name is beside it. */
export function productionLabel(key) {
  const icon = PRODUCTION_ICONS[key];
  return `${icon ? `<img class="sov-ico" src="${icon}" alt="">` : ''}${PRODUCTION_LABEL[key] ?? key}`;
}

/** Read one number out of a form field. Blank or unparseable gives `fallback`. */
export function clampNumber(raw, { min = -Infinity, max = Infinity, integer = false, fallback = 0 } = {}) {
  const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').trim());
  if (String(raw ?? '').trim() === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, integer ? Math.round(n) : n));
}

/**
 * Validate a settle plot allocation: each entry clamped to an integer 0..25,
 * and the total reported rather than corrected.
 *
 * @param {object} raw the five plot values, as typed
 * @returns {{plots: object, total: number, ok: boolean, message: string}}
 *   message reads like "2 short" or "5 over", and is empty when ok
 */
export function validatePlots(raw) {
  const plots = {};
  let total = 0;
  for (const key of PLOT_KEYS) {
    plots[key] = clampNumber(raw?.[key], { min: 0, max: PLOT_TOTAL, integer: true, fallback: 0 });
    total += plots[key];
  }
  const diff = total - PLOT_TOTAL;
  return {
    plots,
    total,
    ok: diff === 0,
    message: diff === 0 ? '' : diff > 0 ? `${diff} over` : `${-diff} short`,
  };
}

/** Read the military structure choice: null for none or for an unknown key. */
export function parseMilsovStructure(raw) {
  const key = String(raw ?? '').trim();
  return MILSOV_STRUCTURES.some((s) => s.key === key) ? key : null;
}

/** What was placed, as "2× Sov II + 1× Sov I", highest level first. */
function milsovSplitText(plan) {
  const counts = new Map();
  for (const m of plan.milsov) counts.set(m.buildingLevel, (counts.get(m.buildingLevel) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([level, n]) => `${n}× Sov ${SOV_LEVEL_ROMAN[level - 1]}`)
    .join(' + ');
}

/** The plan's military sovereignty in one line, for the CSV. */
export function milsovPlanText(plan) {
  if (!plan?.milsov?.length) return '';
  return `${milsovSplitText(plan)} — +${plan.milsovBonus}% military unit production, upkeep ${
    (plan.milsovUpkeep ?? 0).toLocaleString('en-GB')}/hr of wood, clay, iron and stone.`;
}

/**
 * The tax above which sovereignty upkeep is unaffordable, when it is below the
 * site's ceiling, or a warning when no tax can pay it.
 *
 * @returns {string} markup, or '' when there is nothing to warn about
 */
export function upkeepLimitHtml(plan) {
  if (plan?.resImpossible) {
    return `<p class="sov-flag">The settle allocation has no ${plan.resBinding} plots, so this
        upkeep cannot be paid at any tax.</p>`;
  }
  if (!Number.isFinite(plan?.resCeiling) || !(plan.resCeiling < plan.tMax)) return '';
  return `<p class="sov-hint">Upkeep limit: ${plan.resCeiling.toFixed(1)}% tax — above that, ${
    plan.resBinding} production no longer covers it.</p>`;
}

/** The plan's military sovereignty for the panel, the bonus first. */
export function milsovPlanHtml(plan) {
  if (!plan?.milsov?.length) return '';
  return `<p class="sov-mil"><b class="sov-mil-bonus">+${plan.milsovBonus}%</b>
    <span class="sov-mil-what">military unit production</span>
    <span class="sov-hint">${escapeHtml(milsovSplitText(plan))}, upkeep ${
  (plan.milsovUpkeep ?? 0).toLocaleString('en-GB')}/hr of wood, clay, iron and stone.</span></p>`;
}

export const MILSOV_BLOCKED_TEXT = {
  tiles: 'every claimable tile went to the food plan',
  water: 'every tile the food plan left over is water, which takes no Production Structure',
  slots: 'the food plan used every building slot',
  upkeep: 'the city produces too little wood, clay, iron or stone to run one',
  rp: 'the food plan spent the research this site produces',
};

/**
 * A plan's per-hour balance as rows of `{label, base, spent, value, note}`,
 * where base - spent = value. At the plan's own tax the binding ceiling reads 0;
 * `note` names it ('binds'), a deficit, or an indicative figure.
 */
export function surplusRows(surplus, binding) {
  if (!surplus) return [];
  // `key` indexes the surplus; `icon` names the production (research is `rp` there).
  const rows = [
    { key: 'food', icon: 'food', label: PRODUCTION_LABEL.food },
    { key: 'rp', icon: 'research', label: PRODUCTION_LABEL.research },
    { key: 'gold', icon: 'gold', label: PRODUCTION_LABEL.gold },
    ...BASIC_RESOURCES.map((res) => ({
      key: res,
      icon: res,
      label: PRODUCTION_LABEL[res],
      basic: true,
    })),
  ];
  return rows.map((r) => {
    const value = surplus[r.key] ?? 0;
    const base = surplus.base?.[r.key];
    const notes = [];
    if (binding === r.key || (binding === 'res' && r.basic && Math.abs(value) < 0.5)) {
      notes.push('binds');
    }
    if (value < 0) notes.push('deficit');
    if (r.basic && surplus.indicative) notes.push('indicative');
    return {
      ...r,
      value,
      base,
      spent: Number.isFinite(base) ? base - value : undefined,
      note: notes.join(', '),
    };
  });
}

/**
 * A row's note for a resource ceiling the engine reported without applying,
 * since it does not affect the ranking. Null when there is none, or when the
 * upkeep is covered at the site's tax.
 *
 * @returns {{text: string, title: string} | null}
 */
export function resFlag(r) {
  if (!r?.resIndicative) return null;
  const caveat = 'Indicative only — per-plot yields for wood, clay, iron and '
    + 'stone are unmeasured, so this figure does not affect the ranking.';
  if (r.resImpossible) {
    return {
      text: `no ${r.resBinding} plots`,
      title: `The settle allocation has no ${r.resBinding} plots, so the sovereignty `
        + `upkeep cannot be paid at any tax rate. ${caveat}`,
    };
  }
  if (!(r.resCeiling < r.tMax - 1e-9)) return null;
  return {
    text: `${r.resBinding} ${r.resCeiling.toFixed(1)}%`,
    title: `Sovereignty upkeep exhausts ${r.resBinding} above ${r.resCeiling.toFixed(1)}% tax, `
      + `below this site's ceiling of ${r.tMax.toFixed(1)}%. ${caveat}`,
  };
}

/**
 * Read the research reading override; null when blank or zero. `prestige` is
 * whether the boost was running when the reading was taken, so it can be
 * divided out. Allembine and Overflowing Insight still apply alongside it.
 */
export function parseRpCalibration(observed, atTax, prestige) {
  const rp = clampNumber(observed, { min: 0, fallback: 0 });
  if (rp <= 0) return null;
  return {
    observedRpPerHour: rp,
    atTax: clampNumber(atTax, { min: 0, max: 100, fallback: 0 }),
    prestige: !!prestige,
  };
}

export function parseResourceBoosters(raw) {
  const out = {};
  for (const res of BASIC_RESOURCES) out[res] = !!raw?.[res];
  return out;
}

export function parseUpkeepBuildings(raw) {
  const out = {};
  for (const b of UPKEEP_BUILDINGS) {
    out[b.key] = clampNumber(raw?.[b.key], { min: 0, max: 99, integer: true, fallback: 0 });
  }
  return out;
}

/** Read the minimum-surplus fields. Negative counts as zero. */
export function parseResourceMinimums(raw) {
  const out = {};
  for (const key of MINIMUM_KEYS) {
    out[key] = clampNumber(raw?.[key], { min: 0, max: 1e7, integer: true, fallback: 0 });
  }
  return out;
}

export function parsePrestige(raw) {
  const out = {};
  for (const key of PRESTIGE_KEYS) out[key] = !!raw?.[key];
  return out;
}

/**
 * One control per setting. The keys must match DEFAULT_SETTINGS', which a test
 * checks.
 *
 * `enabledWhen` disables a control whose precondition is off; `overriddenWhen`
 * greys out one that an override below is replacing. `menu: true` puts a
 * setting in the gear menu instead of the City Configuration form.
 */
export const SETTINGS_FIELDS = [
  { key: 'plots', group: 'Settle Tile', label: 'Settle Plot Allocation', type: 'plots' },

  {
    key: 'cityConsumption',
    group: 'City Food',
    label: 'Food Consumed per Hour',
    type: 'number',
    min: 1,
    max: 1e6,
    integer: true,
    fallback: DEFAULT_CITY_CONSUMPTION,
  },
  { key: 'naturesBounty', group: 'City Food', label: "Nature's Bounty", type: 'checkbox' },
  {
    key: 'geomancerRetreats',
    group: 'City Food',
    label: 'Geomancer Retreats',
    type: 'select',
    parse: 'number',
    options: NATURES_BOUNTY_BY_RETREATS.map((bonus, n) => ({ value: n, label: `${n} (+${bonus}%)` })),
    enabledWhen: (s) => !!s.naturesBounty,
  },
  { key: 'cityCount', group: 'City Food', label: 'Number of Cities', type: 'number', min: 1, max: 999, integer: true, fallback: 1 },
  { key: 'isCapital', group: 'City Food', label: 'This City is the Capital', type: 'checkbox' },

  // Both are flat additions the research reading contains, so it does not
  // override them.
  {
    key: 'allembine',
    group: 'Research',
    label: 'Allembine Research (+100/hr)',
    type: 'checkbox',
  },
  {
    key: 'overflowingInsight',
    group: 'Research',
    label: 'Overflowing Insight (+506.5/hr)',
    type: 'checkbox',
  },
  {
    key: 'rpCalibration',
    group: 'Research',
    label: 'Measured Research Output',
    type: 'calibration',
  },

  // Drawn as one table, a row per production. The Flour Mill is food's booster.
  {
    key: 'resourceBoosters',
    group: 'Production',
    label: 'Booster Buildings at Level 20',
    type: 'boosters',
  },
  {
    key: 'flourMill',
    group: 'Production',
    label: `Flour Mill at Level 20 (+${FLOUR_MILL_L20}%)`,
    type: 'checkbox',
  },
  {
    key: 'prestige',
    group: 'Production',
    label: 'Prestige Production Boost',
    type: 'prestige',
  },
  {
    key: 'resourceMinimums',
    group: 'Production',
    label: 'Minimum Surplus per Hour',
    type: 'minimums',
  },

  {
    key: 'upkeepBuildings',
    group: 'City Buildings',
    label: 'How many of each at level 20',
    type: 'upkeepBuildings',
  },

  { key: 'rClaim', group: 'Sovereignty', label: 'Claim Radius', type: 'number', min: 1, max: 6, integer: true, fallback: 2 },
  { key: 'maxBuildings', group: 'Sovereignty', label: 'Maximum Buildings', type: 'number', min: 0, max: 200, integer: true, fallback: 20 },
  { key: 'milsovStructure', group: 'Sovereignty', label: 'Military Structure', type: 'milsov' },
  {
    key: 'milsovMinBonus',
    group: 'Sovereignty',
    label: 'Minimum Military Bonus (%)',
    type: 'number',
    min: 0,
    max: 1000,
    integer: true,
    fallback: 0,
    enabledWhen: (s) => !!s.milsovStructure,
  },

  { key: 'tMin', group: 'Site Filters', label: 'Minimum Tax (%)', type: 'number', min: 0, max: 100 },
  { key: 'dOther', group: 'Site Filters', label: 'Minimum Distance to Other Players', type: 'number', min: 0, max: 100 },
  { key: 'dOwn', group: 'Site Filters', label: 'Minimum Distance to Your Cities', type: 'number', min: 0, max: 100 },
  { key: 'dAlliance', group: 'Site Filters', label: 'Minimum Distance to Alliance Towns', type: 'number', min: 0, max: 100 },
  {
    key: 'ownClaimsAvailable',
    group: 'Site Filters',
    label: 'Treat Your Own Claims as Available',
    type: 'checkbox',
    hint: 'On: tiles you already claim count as free ground, as if you gave them up. '
      + 'Off: they are off limits, except to the town that holds them.',
  },

  {
    key: 'autoMinimizeOffMap',
    group: 'Display',
    label: 'Minimise when off the World Map',
    type: 'checkbox',
    menu: true,
    hint: 'Folds the panel to its icon on any page but the World Map, the only one with map data.',
  },
  {
    key: 'mapOverlay',
    group: 'Display',
    label: 'Mark sites on the World Map',
    type: 'checkbox',
    menu: true,
    hint: 'After a Scan, numbers the top ten on the map and outlines the selected row’s tile; '
      + 'after Optimise, draws the plan. It draws on the game’s own map, so it depends on '
      + 'that map’s layout.',
  },
];

// --- Form markup (strings only — no DOM until createPanel) ------------------

function attr(name, v) {
  return v === undefined || v === null ? '' : ` ${name}="${escapeHtml(v)}"`;
}

/**
 * One control and its label, as a row. The label is a separate element sized
 * to its text, so a click in the gap before the control does nothing.
 *
 * @param {object} o
 * @param {string} o.id unique in the document, and prefixed to avoid the game's
 * @param {string} o.label label HTML, already escaped by the caller
 * @param {string} o.control the input or select, carrying that same id
 * @param {string} [o.row] attributes for the row itself
 */
function fieldRowHtml({ id, label, control, row = '' }) {
  return `<div class="sov-f"${row}><label for="${id}">${label}</label>
    ${control}</div>`;
}

function checkboxRowHtml({ id, label, checked, hooks = '', row = '' }) {
  return fieldRowHtml({
    id,
    label,
    row,
    control: `<input type="checkbox"${hooks} id="${id}"${checked ? ' checked' : ''}>`,
  });
}

/** Looked up on use, since Node has no DOM. */
const nativeChecked = () => Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked');

function setChecked(el, value) {
  nativeChecked().set.call(el, !!value);
}

/**
 * Make the checkboxes under `container` ignore scripted ticks. The game's own
 * "Check All" sets every checkbox on the page, and the next edit would save
 * those ticks as settings. A user's click does not go through the setter.
 */
function guardCheckboxes(container) {
  for (const el of container.querySelectorAll('input[type="checkbox"]')) {
    // Writing the property first stops the `checked` attribute from applying.
    setChecked(el, nativeChecked().get.call(el));
    Object.defineProperty(el, 'checked', {
      configurable: true,
      get() {
        return nativeChecked().get.call(this);
      },
      set() {},
    });
  }
}

function numberFieldHtml(f, value) {
  const id = `sov-in-${f.key}`;
  return fieldRowHtml({
    id,
    label: escapeHtml(f.label),
    row: ` data-key="${f.key}"`,
    control: `<input type="number" data-key="${f.key}"${attr('min', f.min)}${attr('max', f.max)}
      step="${f.integer ? 1 : 'any'}"${attr('value', value)} id="${id}">`,
  });
}

function selectFieldHtml(f, value) {
  const id = `sov-in-${f.key}`;
  const opts = f.options.map((o) =>
    `<option value="${escapeHtml(o.value)}"${String(o.value) === String(value) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`).join('');
  return fieldRowHtml({
    id,
    label: escapeHtml(f.label),
    row: ` data-key="${f.key}"`,
    control: `<select data-key="${f.key}" id="${id}">${opts}</select>`,
  });
}

function checkboxFieldHtml(f, value) {
  return checkboxRowHtml({
    id: `sov-cb-${f.key}`,
    label: escapeHtml(f.label),
    checked: value,
    hooks: ` data-key="${f.key}"`,
    row: ` data-key="${f.key}"${attr('title', f.hint)}`,
  });
}

const PLOTS_TITLE = `How the settle tile's ${PLOT_TOTAL} plots are split. `
  + 'Terraforming applies to the settle tile only.';

function plotInputsHtml(hook, idPrefix, plots) {
  const fields = PLOT_KEYS.map((p) => {
    const id = `${idPrefix}-${p}`;
    return `<div class="sov-plot"><label for="${id}">${productionLabel(p)}</label>
      <input type="number" ${hook}="${p}" min="0" max="${PLOT_TOTAL}"
        step="1" value="${plots?.[p] ?? 0}" id="${id}"></div>`;
  }).join('');
  return `<div class="sov-plot-fields">${fields}</div>`;
}

/** The allocation as one coloured cell per plot; cells past the 25th are red. */
export function plotBarHtml(plots) {
  const cells = PLOT_KEYS.flatMap((p) => Array(plots?.[p] ?? 0).fill(p))
    .map((p, i) => `<i class="sov-p-${i < PLOT_TOTAL ? p : 'over'}"></i>`);
  while (cells.length < PLOT_TOTAL) cells.push('<i></i>');
  return cells.join('');
}

function plotsFieldHtml(f, plots) {
  return `<div class="sov-f-block" data-key="${f.key}" title="${PLOTS_TITLE}">
      ${plotInputsHtml('data-plot', 'sov-in-plot', plots)}
      <div class="sov-plotbar"></div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from Selected Tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
}

function calibrationFieldHtml(f, cal) {
  return `<fieldset class="sov-f-block sov-override" data-key="${f.key}"
      title="Your city's research per hour as the game shows it, and the tax it was read at. Replaces the Library's own output. Leave the two tick-boxes above as your city has them: their bonuses are taken out of the reading.">
      <legend>Override — ${escapeHtml(f.label)}</legend>
      ${fieldRowHtml({
    id: 'sov-in-cal-observedRpPerHour',
    label: 'Observed research per hour',
    control: `<input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr('value', cal?.observedRpPerHour)} id="sov-in-cal-observedRpPerHour">`,
  })}
      ${fieldRowHtml({
    id: 'sov-in-cal-atTax',
    label: '…at this tax rate (%)',
    control: `<input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}" id="sov-in-cal-atTax">`,
  })}
      ${checkboxRowHtml({
    id: 'sov-cb-cal-prestige',
    label: '…with the Prestige boost running',
    checked: cal?.prestige,
    hooks: ' data-cal="prestige"',
  })}
      <p class="sov-hint sov-rp-read"></p>
    </fieldset>`;
}

/**
 * One count per upkeep building, grouped as the game groups them. What each
 * consumes shows as resource icons, with the amounts on hover.
 */
function upkeepBuildingsFieldHtml(f, buildings) {
  const rows = UPKEEP_BUILDINGS.map((b, i) => {
    const id = `sov-in-upkeep-${b.key}`;
    const uses = Object.entries(b.consumes);
    const usesTitle = `Consumes ${uses.map(([res, n]) =>
      `${count(n)} ${PRODUCTION_LABEL[res].toLowerCase()}`).join(', ')} an hour`;
    const icons = uses.map(([res]) => `<img src="${PRODUCTION_ICONS[res]}" alt="">`).join('');
    const heading = b.group !== UPKEEP_BUILDINGS[i - 1]?.group
      ? `<p class="sov-upkeep-group"><img src="${UPKEEP_GROUP_ICONS[b.group]}" alt="">${
        escapeHtml(b.group)}</p>`
      : '';
    return heading + fieldRowHtml({
      id,
      label: escapeHtml(b.name),
      row: ` data-upkeep-row="${b.key}"${attr('title', b.hint)}`,
      control: `<span class="sov-uses" title="${usesTitle}">${icons}</span>
        <input type="number" data-upkeep="${b.key}" min="0" step="1"
        value="${buildings?.[b.key] ?? 0}" id="${id}">`,
    });
  }).join('');
  return `<div class="sov-f-block" data-key="${f.key}"
      title="Each copy consumes the same every hour as the first. That comes off production before sovereignty is paid for, so the plan never spends what these buildings need.">
      ${rows}
    </div>`;
}

/**
 * Boosters, prestige and minimum surplus as one table: a row per production, a
 * column per setting. Each control carries its own aria-label, since no single
 * <label> can name both its row and column.
 */
function productionMatrixHtml(settings) {
  const { resourceBoosters: boosters, prestige, resourceMinimums: minimums } = settings;
  const rows = MINIMUM_KEYS.map((key) => {
    const name = PRODUCTION_LABEL[key];
    const boosterBox = (hook, building, bonus, on) => `<input type="checkbox" ${hook}${
      on ? ' checked' : ''} aria-label="${building}" title="${building} (+${bonus}% ${name})">`;
    let booster = '<span class="sov-none">—</span>';
    if (BASIC_RESOURCES.includes(key)) {
      booster = boosterBox(`data-booster="${key}"`, RESOURCE_BOOSTERS[key], RESOURCE_BOOSTER_BONUS,
        boosters?.[key]);
    } else if (key === 'food') {
      booster = boosterBox('data-key="flourMill"', 'Flour Mill', FLOUR_MILL_L20, settings.flourMill);
    }
    return `<tr><td>${productionLabel(key)}</td><td>${booster}</td>
      <td><input type="checkbox" data-prestige="${key}"${prestige?.[key] ? ' checked' : ''}
        aria-label="Prestige on ${name}"></td>
      <td><input type="number" data-minimum="${key}" min="0" step="1"
        value="${minimums?.[key] ?? 0}" aria-label="Keep at least this much ${name} per hour"></td></tr>`;
  }).join('');
  return `<table class="sov-matrix"><thead><tr><th></th>
      <th data-key="resourceBoosters" title="A booster building at level 20 — the Flour Mill, for food — adds ${RESOURCE_BOOSTER_BONUS}% to its production: ${RESOURCE_BOOSTER_BONUS} points of tax headroom against its ceiling.">Booster +${RESOURCE_BOOSTER_BONUS}%</th>
      <th data-key="prestige" title="The prestige boost adds ${PRESTIGE_PRODUCTION_BONUS}% to each production it runs on: ${PRESTIGE_PRODUCTION_BONUS} points of tax headroom. Tick only what it is running on.">Prestige +${PRESTIGE_PRODUCTION_BONUS}%</th>
      <th data-key="resourceMinimums" title="How much of each must still be free once the plan is paid for: resources after upkeep, food after the town eats, research after the claims. Zero spends it all, leaving nothing to build, grow or trade with.">Keep per hour</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
}

/**
 * Which military structure to place. Only the five military Production
 * Structures are offered; the engine decides how many, at what levels and where.
 */
function milsovFieldHtml(f, structure) {
  const opts = MILSOV_STRUCTURES.map((s) =>
    `<option value="${s.key}"${s.key === structure ? ' selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  return `<div class="sov-f-block" data-key="${f.key}">
      ${fieldRowHtml({
    id: `sov-in-${f.key}`,
    label: escapeHtml(f.label),
    control: `<select data-key="${f.key}" id="sov-in-${f.key}"
          title="Which structure to place on the tiles the food plan leaves free. It only uses what food leaves over, so it never costs the site tax.">
          <option value=""${structure ? '' : ' selected'}>None — food only</option>${opts}</select>`,
  })}
    </div>`;
}

function fieldHtml(f, settings) {
  const v = settings[f.key];
  switch (f.type) {
    case 'checkbox': return checkboxFieldHtml(f, v);
    case 'select': return selectFieldHtml(f, v);
    case 'plots': return plotsFieldHtml(f, v);
    case 'calibration': return calibrationFieldHtml(f, v);
    case 'upkeepBuildings': return upkeepBuildingsFieldHtml(f, v);
    case 'milsov': return milsovFieldHtml(f, v);
    default: return numberFieldHtml(f, v ?? f.fallback);
  }
}

const SECTION_ICONS = {
  'Settle Tile': [ICONS.caravan],
  'City Food': [ICONS.food],
  Research: [ICONS.research],
  Production: BASIC_RESOURCES.map((res) => ICONS[res]),
  'City Buildings': [ICONS.troops, ICONS.mana],
  Sovereignty: [ICONS.sovereignty],
  'Site Filters': [ICONS.diplomacy],
};

/** A section that folds to a header; the panel fills its `sum` summary from the settings. */
function sectionHtml({ name, icons, sum, body }) {
  return `<details class="sov-sec" data-sec="${escapeHtml(name)}"><summary>
      <span class="sov-sec-ico">${icons.map((src) => `<img src="${src}" alt="">`).join('')}</span>
      <span class="sov-sec-name">${escapeHtml(name)}</span>
      <span class="sov-sum" data-sum="${escapeHtml(sum)}"></span>
      <span class="sov-chev">${GLYPHS.chevron}</span>
    </summary><div class="sov-sec-body">${body}</div></details>`;
}

/** The research claims are bought out of: the output at 0% tax. */
function researchInUse(s) {
  return researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, 'research'), tax: 0 });
}

/** A section's one-line summary for its folded header, as markup. */
export function sectionSummaryHtml(name, s) {
  const plural = (n, one) => `${n} ${one}${n === 1 ? '' : 's'}`;
  switch (name) {
    case 'Settle Tile': {
      const r = validatePlots(s.plots);
      return PLOT_KEYS.map((p) => `<img src="${PRODUCTION_ICONS[p]}" alt="">${r.plots[p]}`).join('')
        + (r.ok ? '' : ` <b class="sov-bad">${r.message}</b>`);
    }
    case 'City Food': {
      const b = computeBOther(s);
      return `${b >= 0 ? '+' : ''}${b}% · eats ${count(s.cityConsumption)}/hr`;
    }
    case 'Research':
      return `${count(Math.round(researchInUse(s)))}/hr${s.rpCalibration ? ' · measured' : ''}`;
    case 'Production': {
      const on = (o) => Object.values(o ?? {}).filter(Boolean).length;
      const [prestige, minimums] = [s.prestige, s.resourceMinimums].map(on);
      const boosters = on(s.resourceBoosters) + (s.flourMill ? 1 : 0);
      return [
        boosters && plural(boosters, 'booster'),
        prestige && `prestige ×${prestige}`,
        minimums && plural(minimums, 'minimum'),
      ].filter(Boolean).join(' · ') || 'none set';
    }
    case 'City Buildings': {
      const n = Object.values(s.upkeepBuildings ?? {}).reduce((a, v) => a + v, 0);
      return n ? plural(n, 'building') : 'none';
    }
    case 'Sovereignty': {
      const structure = MILSOV_STRUCTURES.find((m) => m.key === s.milsovStructure);
      return `radius ${s.rClaim} · ${escapeHtml(structure?.name ?? 'food only')}`;
    }
    case 'Site Filters':
      return `tax ≥ ${s.tMin}% · apart ${s.dOther}/${s.dOwn}/${s.dAlliance}`;
    default:
      return '';
  }
}

/** The City Configuration form; menu settings are not in it. */
export function settingsFormHtml(settings) {
  const groups = [];
  for (const f of SETTINGS_FIELDS) {
    if (f.menu) continue;
    if (!groups.length || groups.at(-1).name !== f.group) groups.push({ name: f.group, fields: [] });
    groups.at(-1).fields.push(f);
  }
  const body = groups.map((g) => {
    const fields = g.name === 'Production'
      ? productionMatrixHtml(settings)
      : g.fields.map((f) => fieldHtml(f, settings)).join('');
    const extra = g.fields.some((f) => f.key === 'isCapital')
      ? '<div class="sov-derived"></div><p class="sov-derived-food"></p>'
      : '';
    return sectionHtml({
      name: g.name, icons: SECTION_ICONS[g.name] ?? [], sum: g.name, body: fields + extra,
    });
  }).join('');
  // autocomplete="off" stops the browser restoring values on reload, which would
  // be read back and saved as the user's.
  return `<form class="sov-form" autocomplete="off">
      ${body}
      <div class="sov-form-foot"><button type="button" class="sov-reset sec">Reset to Defaults</button>
        <span class="sov-hint">Saved in this browser as you edit.</span></div>
      <p class="sov-hint sov-store-note"></p>
    </form>`;
}

/** The gear menu: the `menu: true` settings, which belong to the panel rather than the city. */
export function settingsMenuHtml(settings) {
  const fields = SETTINGS_FIELDS.filter((f) => f.menu);
  const rows = fields.map((f) =>
    fieldHtml(f, settings)).join('');
  return `<h3>Settings</h3><form class="sov-menu-form" autocomplete="off">${rows}</form>`;
}

function focusRadiusTitle(rClaim) {
  return `How far out sovereignty may be placed. Blank follows City Configuration, currently ${rClaim}.`;
}

/**
 * The optimiser's form. Its own inputs are read by readFocus and parseFocus;
 * the City Configuration section's controls mirror that tab's and are read there.
 */
export function focusFormHtml(focus, settings) {
  const f = { ...DEFAULT_FOCUS, ...focus };
  const rClaim = Math.round(settings?.rClaim ?? 2);
  return `<form class="sov-focus-form" autocomplete="off">
      <div class="sov-card">
        ${fieldRowHtml({
    id: 'sov-in-town-pick',
    label: 'One of Your Towns',
    control: '<select class="sov-town-pick" id="sov-in-town-pick"><option value="">—</option></select>',
    row: ' title="Fills the coordinates from a town of yours on the map."',
  })}
        <div class="sov-f"><span>Coordinates</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x" aria-label="x"${attr('value', f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y" aria-label="y"${attr('value', f.y)}>
            <span class="sov-or sov-map-only">or</span>
            <button type="button" class="sov-map-pick sov-map-only sec"
              title="Then click a tile on the World Map to fill these in and optimise it.">Pick on map</button>
          </span></div>
        ${fieldRowHtml({
    id: 'sov-in-focus-radius',
    label: 'Sovereignty Radius',
    control: `<input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr('value', f.radius)} id="sov-in-focus-radius">`,
    row: ` data-radius-row title="${focusRadiusTitle(rClaim)}"`,
  })}
        ${fieldRowHtml({
    id: 'sov-in-focus-tax',
    label: 'Starting Tax (%)',
    control: `<input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="1"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}" id="sov-in-focus-tax">`,
  })}
        ${checkboxRowHtml({
    id: 'sov-cb-focus-preserveSovereignty',
    label: 'Preserve Existing Sovereignty',
    checked: f.preserveSovereignty,
    hooks: ' data-focus="preserveSovereignty"',
    row: ' title="On: a town of yours keeps the claims it holds, and the plan pays only to raise them. Off: they are laid out afresh at full price."',
  })}
      </div>
      ${sectionHtml({
    name: 'City Configuration',
    icons: SECTION_ICONS['Settle Tile'],
    sum: 'Settle Tile',
    body: `${checkboxRowHtml({
      id: 'sov-cb-focus-useConfiguredPlots',
      label: 'Use the Plot Allocation from City Configuration',
      checked: f.useConfiguredPlots,
      hooks: ' data-focus="useConfiguredPlots"',
      row: ` title="On: plan on the allocation below, the tile as you will terraform it. Off: plan on the tile's ratings as they are today."`,
    })}
        <div class="sov-f-block" title="${PLOTS_TITLE}">
          ${plotInputsHtml('data-mirror-plot', 'sov-in-focus-plot', settings?.plots)}
          <div class="sov-plotbar"></div>
          <div class="sov-plot-sum"><span class="sov-plot-total"></span></div>
        </div>
        ${checkboxRowHtml({
      id: 'sov-cb-focus-ownClaimsAvailable',
      label: 'Treat Your Own Claims as Available',
      hooks: ' data-mirror-key="ownClaimsAvailable"',
      row: attr('title', SETTINGS_FIELDS.find((s) => s.key === 'ownClaimsAvailable').hint),
    })}
        <p class="sov-hint">These are City Configuration's own, as is everything else the plan uses.</p>`,
  })}
      <div class="sov-run"><button type="button" class="sov-focus-run">${GLYPHS.target}Optimise</button></div>
    </form>
    <p class="sov-legend sov-map-note"></p>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
}

/**
 * Your own towns on screen, deduplicated and sorted, for the optimiser's picker.
 * Only towns whose tile the payload carries are offered, since the optimiser
 * needs it.
 */
export function ownTowns(payload) {
  const seen = new Map();
  for (const t of extractTowns(payload)) {
    if (!t.own || !Number.isFinite(t.x) || !Number.isFinite(t.y)) continue;
    if (!payload.data?.[tileKey(t.y, t.x)]) continue;
    const at = `${t.x}|${t.y}`;
    if (!seen.has(at)) seen.set(at, { x: t.x, y: t.y, label: t.name ? `${t.name} (${at})` : at });
  }
  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** The two capital bonuses, which follow from other settings, as on/off chips. */
function capitalDerivedHtml(s) {
  return [
    ['Famine Management', FAMINE_MANAGEMENT, 10],
    ['Soil Enrichment', SOIL_ENRICHMENT, 30],
  ].map(([name, bonus, need]) => {
    const active = s.isCapital && (s.cityCount ?? 1) >= need;
    const why = !s.isCapital ? 'capital only' : `needs ${need} cities`;
    return `<span class="sov-chip ${active ? 'sov-on' : 'sov-off'}" title="${
      active ? 'Active' : `Inactive: ${why}`}">${name} +${bonus}%</span>`;
  }).join('');
}

// --- Panel ------------------------------------------------------------------

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
  onScan, onExport, initialSettings, onSettingsChange, getPayload, whenViewLoaded, onSelect,
  onPaneShown, onFocusPlan, onPickOnMap,
}) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sov-panel';
  const opening = initialSettings ?? DEFAULT_SETTINGS;
  root.innerHTML = `
    <h2 title="Sovereignty Scanner — drag to move, click to collapse"><span
        class="sov-h2-inner">${APP_ICON_SVG}<span
        class="sov-title">Sovereignty Scanner <span class="sov-build"></span></span><span
      class="sov-h2-actions"><span class="sov-gear" role="button" tabindex="0"
      title="Settings" aria-label="Settings" aria-expanded="false">⚙</span><a class="sov-about"
      href="https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/blob/main/LICENSE"
      target="_blank" rel="noopener" title="Unofficial fan tool. Illyriad, its game data and
the game's icon art are the intellectual property of Illyriad Games Limited — click for the
licence and full copyright notice.">ⓘ</a></span></span></h2>
    <nav class="sov-tabs">
      <button type="button" data-tab="scan" class="on">${GLYPHS.search}Site Search</button>
      <button type="button" data-tab="focus">${GLYPHS.target}Optimal Sovereignty</button>
      <button type="button" data-tab="config">${GLYPHS.city}City Configuration</button>
    </nav>
    <div class="sov-body">
      <section data-pane="scan">
        <div class="sov-toolbar"><button class="sov-scan"
            title="Rank every tile on screen you could settle">${GLYPHS.search}Scan</button>
          <button class="sov-export sec"
            title="Every site the last scan found, as a spreadsheet">${GLYPHS.download}Export CSV</button></div>
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
  document.body.appendChild(root);

  // Which sections are open is the viewer's own arrangement, not part of the
  // City Configuration, so it has a key of its own that Reset to Defaults
  // leaves alone.
  const openSections = new Set(loadOpenSections());
  for (const sec of root.querySelectorAll('.sov-sec')) sec.open = openSections.has(sec.dataset.sec);
  // `toggle` does not bubble, so it is caught on the way down.
  root.addEventListener('toggle', (e) => {
    if (!e.target.classList?.contains('sov-sec')) return;
    if (e.target.open) openSections.add(e.target.dataset.sec);
    else openSections.delete(e.target.dataset.sec);
    saveOpenSections([...openSections]);
  }, true);

  // The title bar is both the collapse control and the drag handle. Position
  // is stored apart from the settings, so Reset to Defaults never moves it.
  // Every placement clamps from where the panel was last dropped, not from
  // where it sits now: the expanded panel is wider than the icon, and keeping
  // its clamped spot would walk the icon in from the edge it was left at.
  let anchor = loadPanelPosition();
  let dragged = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  const header = root.querySelector('h2');

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
    if (e.target.closest('.sov-about') || e.target.closest('.sov-gear') || e.button !== 0) return;
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
    // The gear is hidden when collapsed, so its menu closes.
    if (collapsed) setMenuOpen?.(false);
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

  // The gear menu is appended to the body so the panel's overflow cannot clip
  // it. Its fields are read and written like the form's; containerFor picks
  // which of the two holds a field.
  const gear = $('.sov-gear');
  const menu = document.createElement('div');
  menu.className = 'sov-menu';
  menu.hidden = true;
  menu.innerHTML = settingsMenuHtml(opening);
  document.body.appendChild(menu);
  guardCheckboxes(root);
  guardCheckboxes(menu);
  const containerFor = (f) => (f.menu ? menu : form);
  let rendered = [];       // the results currently in the table
  let selected = null;     // the row Prefill copies `rs` from
  let incomplete = [];     // sites the last scan could not see all of

  // The ⓘ is the fansite kit's required copyright link; following it must not
  // also collapse the panel.
  header.addEventListener('click', (e) => {
    if (e.target.closest('.sov-about')) return;
    if (dragged) {
      dragged = false;
      return;
    }
    toggleCollapsed();
  });
  scanBtn.addEventListener('click', onScan);
  $('.sov-export').addEventListener('click', onExport);

  // Opening the optimiser re-reads the radius placeholder from the settings.
  function showTab(name) {
    root.querySelectorAll('.sov-tabs button').forEach((t) => {
      t.classList.toggle('on', t.dataset.tab === name);
    });
    root.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== name; });
    if (name === 'focus') syncFocusRadiusHint();
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
          setChecked(containerFor(f).querySelector(`input[data-key="${f.key}"]`), v);
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
          setChecked(form.querySelector('[data-cal="prestige"]'), v?.prestige);
          break;
        case 'boosters':
          for (const res of BASIC_RESOURCES) {
            setChecked(form.querySelector(`[data-booster="${res}"]`), v?.[res]);
          }
          break;
        case 'upkeepBuildings':
          for (const el of form.querySelectorAll('[data-upkeep]')) {
            el.value = v?.[el.dataset.upkeep] ?? 0;
          }
          break;
        case 'prestige':
          for (const key of PRESTIGE_KEYS) {
            setChecked(form.querySelector(`[data-prestige="${key}"]`), v?.[key]);
          }
          break;
        case 'minimums':
          for (const key of MINIMUM_KEYS) {
            form.querySelector(`[data-minimum="${key}"]`).value = v?.[key] ?? 0;
          }
          break;
        default:
          containerFor(f).querySelector(`input[data-key="${f.key}"]`).value = v ?? f.fallback ?? '';
      }
    }
    refresh({ save });
    applyCollapsed();
  }

  function writePlots(plots) {
    for (const p of PLOT_KEYS) form.querySelector(`[data-plot="${p}"]`).value = plots?.[p] ?? 0;
  }

  // --- live dependencies and read-outs ---

  // `save` is off for the first layout, when nothing has been edited.
  function refresh({ save = true } = {}) {
    const { settings: s } = readSettings();
    if (save) onSettingsChange?.(s);

  // Disable controls whose precondition is off or that an override replaces.
  // Disabled inputs still read back, so nothing is lost.
    for (const f of SETTINGS_FIELDS) {
      if (!f.enabledWhen && !f.overriddenWhen) continue;
      const on = (f.enabledWhen?.(s) ?? true) && !f.overriddenWhen?.(s);
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
    scanBtn.title = plots.ok ? '' : 'Settle plot allocation must sum to 25';

    root.classList.toggle('sov-no-map', !s.mapOverlay);
    for (const el of root.querySelectorAll('[data-mirror-key], [data-mirror-plot]')) {
      const own = mirrored(el);
      if (el.type === 'checkbox') setChecked(el, own.checked);
      // Compare as typed, so a value part-way through being typed is left alone.
      else if (el.value !== own.value) el.value = own.value;
    }
  }

  /** The City Configuration control that a mirrored optimiser control stands for. */
  function mirrored(el) {
    const { mirrorKey, mirrorPlot } = el.dataset;
    if (mirrorKey) return form.querySelector(`input[data-key="${mirrorKey}"]`);
    return mirrorPlot ? form.querySelector(`input[data-plot="${mirrorPlot}"]`) : null;
  }

  // Handlers are bound here, not inline, since the game's CSP may block inline
  // ones. The form never submits.
  form.addEventListener('submit', (e) => e.preventDefault());
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

  // --- settings menu (the gear) ---

  // Turning auto-minimise on while off the map must not fold the panel mid-edit,
  // so the current state is kept until the next route change.
  menu.addEventListener('change', () => {
    const wasCollapsed = root.classList.contains('sov-collapsed');
    refresh();
    if (!currentlyOnMap()) offMapExpandOverride = !wasCollapsed;
    applyCollapsed();
  });

  function setMenuOpen(open) {
    if (open) {
      // Placed each time, since the panel can have been dragged.
      const g = gear.getBoundingClientRect();
      const p = root.getBoundingClientRect();
      menu.hidden = false;
      menu.style.top = `${g.bottom + 4}px`;
      menu.style.left = `${Math.max(4, p.right - menu.offsetWidth)}px`;
    } else {
      menu.hidden = true;
    }
    gear.setAttribute('aria-expanded', String(open));
  }

  gear.addEventListener('click', (e) => {
    e.stopPropagation();   // the header click below would toggle the collapse
    setMenuOpen(menu.hidden);
  });
  // A span with role=button is not activated by the keyboard on its own.
  gear.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(menu.hidden);
  });

  document.addEventListener('pointerdown', (e) => {
    if (menu.hidden || e.target.closest('.sov-menu') || e.target.closest('.sov-gear')) return;
    setMenuOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) setMenuOpen(false);
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

  const focusForm = $('.sov-focus-form');
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
    const sel = focusForm.querySelector('.sov-town-pick');
    const was = sel.value;
    const payload = getPayload?.();
    const towns = payload ? ownTowns(payload) : [];
    sel.innerHTML = towns.length
      ? `<option value="">—</option>${towns.map((t) =>
        `<option value="${t.x}|${t.y}">${escapeHtml(t.label)}</option>`).join('')}`
      : `<option value="">${payload ? 'none on screen' : 'no map data yet'}</option>`;
    if (was && towns.some((t) => `${t.x}|${t.y}` === was)) sel.value = was;
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
    $('.sov-focus-status').textContent = stopWaiting
      ? `Centring the map on ${x}|${y}; it is optimised once the map has loaded.`
      : `The map has moved. Optimise again to check ${x}|${y} on this view.`;
  }

  function runFocus() {
    const status = $('.sov-focus-status');
    const out = $('.sov-focus-out');
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

  /** Open a scanned site in the optimiser and plan it there. */
  function optimiseSite(result) {
    showTab('focus');
    planAt(result.x, result.y);
    $('.sov-focus-status').scrollIntoView({ block: 'start' });
  }

  const townPick = focusForm.querySelector('.sov-town-pick');
  // Rebuild the town list as the picker is reached for: pointerdown fires before
  // its popup opens, focus before keyboard selection.
  townPick.addEventListener('pointerdown', syncTownPicker);
  townPick.addEventListener('focus', syncTownPicker);

  // A mirrored control hands each edit to City Configuration's own, whose
  // refresh brings it back in line.
  for (const type of ['input', 'change']) {
    focusForm.addEventListener(type, (e) => {
      const own = mirrored(e.target);
      if (!own) return;
      if (own.type === 'checkbox') setChecked(own, e.target.checked);
      else own.value = e.target.value;
      own.dispatchEvent(new Event(type, { bubbles: true }));
    });
  }

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

  refresh({ save: false });
  syncFocusRadiusHint();
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
     * @param {object} scan `{x, y, zoom, scanned}`
     */
    renderResults(results, scan) {
      const el = root.querySelector('.sov-results');
      rendered = results;
      selected = null;
      const summary = { ...scan, candidates: results.length };
      $('.sov-prefill-src').textContent = '';   // the old selection is gone
      el.innerHTML = resultsHtml(results, scanSummaryText(summary));

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => {
          select(Number(row.dataset.n));
          toggleDetail(row, results[Number(row.dataset.n)], readSettings().settings, optimiseSite);
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
        toggleDetail(row, rendered[n], readSettings().settings, optimiseSite);
      }
      row.scrollIntoView({ block: 'nearest' });
      return true;
    },
    planAt,
    /** While a pick is armed, Pick on map becomes its cancel button. */
    setPicking(armed) {
      const button = focusForm.querySelector('.sov-map-pick');
      button.classList.toggle('sov-picking', armed);
      button.textContent = armed ? 'Click a tile · Cancel' : 'Pick on map';
    },
    renderIncomplete(list) {
      incomplete = list;
      drawIncomplete();
    },
  };
}

/** Display names for the engine's binding codes, which the CSV keeps as they are. */
const BINDING_LABEL = {
  cap: 'Tax cap',
  food: 'Food',
  rp: 'Research',
  res: 'Resources',
};

export function bindingLabel(binding) {
  return BINDING_LABEL[binding] ?? binding;
}

const count = (v) => Number(v ?? 0).toLocaleString('en-GB');

/** What the scan covered and how many sites it found. */
export function scanSummaryText(scan) {
  const side = 2 * scan.zoom + 1;
  return `Centred on ${scan.x}|${scan.y}, ${side}×${side} tiles. Checked ${
    count(scan.scanned)} tiles and found ${count(scan.candidates)} candidate${
    scan.candidates === 1 ? '' : 's'}.`;
}


/** The Military column: the free bonus, then warning pills, each led by an icon. */
function militaryCellHtml(r) {
  const troops = `<img src="${ICONS.troops}" alt="">`;
  const flags = [];
  const res = resFlag(r);
  if (res) {
    const icon = PRODUCTION_ICONS[r.resBinding] ? `<img src="${PRODUCTION_ICONS[r.resBinding]}" alt="">` : '';
    flags.push({
      cls: 'sov-pill-bad',
      html: `${icon}${r.resImpossible ? 'no plots' : `${r.resCeiling.toFixed(1)}%`}`,
      title: res.title,
    });
  }
  if (r.milsovBlocked) {
    flags.push({
      cls: 'sov-pill-bad',
      html: `${troops}none`,
      title: `No military sovereignty fits here for free — ${
        MILSOV_BLOCKED_TEXT[r.milsovBlocked] ?? 'nothing was left over'}.`,
    });
  }
  // The minimum bonus is not met for free, but is at a lower tax.
  if (r.milsovMinTax != null) {
    flags.push({
      cls: 'sov-pill-warn',
      html: `${troops}min at ${r.milsovMinTax.toFixed(0)}%`,
      title: `This site reaches your minimum military bonus (+${r.milsovMinBonusAt}%) `
        + `at ${r.milsovMinTax.toFixed(0)}% tax, against the ${r.tMax.toFixed(0)}% it holds `
        + `on food alone. Open the row and drag the tax slider to see the trade.`,
    });
  }
  // Terrain bonuses tied to a building SOV_STRUCTURES does not know. None are
  // today, but the descriptor table comes from the game.
  const conditional = conditionalDescriptors(r);
  if (conditional.size) {
    flags.push({
      cls: 'sov-pill-warn',
      html: 'conditional',
      title: `${[...conditional].map(([b, n]) => `${n}× ${b}`).join(', ')} — these tiles carry a `
        + `terrain bonus that only pays if the city has that building. Not scored either way.`,
    });
  }
  return `${r.milsovBonus ? `<b class="sov-mil-v">+${r.milsovBonus}%</b>` : ''}${flags
    .map((f) => `<span class="sov-pill ${f.cls}" title="${escapeHtml(f.title)}">${f.html}</span>`)
    .join('')}`;
}

/**
 * The tax slider and the plan under it, shared by a result row and the
 * optimiser. `base` is the plan at the site's ceiling, which `plan` is compared
 * against; `geom` is the grid's square and centre.
 */
function planBlockHtml({ ctx, base, plan, floor, geom }) {
  // Whole points only, as the game accepts.
  const lowest = Math.max(0, Math.ceil(floor));
  const slider = ctx && Number.isFinite(base.tMax) && base.tMax - lowest >= 1
    ? `<div class="sov-tax" title="Drag to trade tax for sovereignty">
        <span class="sov-tax-label">Tax</span>
        <input type="range" class="sov-tax-range" min="${lowest}" max="${base.tMax}"
          step="1" value="${plan.tax}" aria-label="Tax">
        <output class="sov-tax-at">${plan.tax.toFixed(0)}%</output>
      </div>`
    : '';
  return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base, geom)}</div>`;
}

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
function mountPlanBlock(scope, state) {
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

function toggleDetail(row, result, settings, onOptimise) {
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

/**
 * What the plan did with the town's existing claims: what keeping them costs,
 * or how many were laid out afresh. Kept claims' buildings are costed as new.
 */
function keptNote(r) {
  if (!r?.preserving) {
    if (!r?.released) return '';
    const one = r.released === 1;
    return `Preserve Existing Sovereignty is off, so the ${r.released} claim${one ? '' : 's'} `
      + `${escapeHtml(r.homeTown)} already holds inside the radius ${one ? 'is' : 'are'} `
      + 'planned as empty ground and priced in full, as though given up and laid out again. '
      + 'Turn it on to plan around them instead.';
  }
  // Sovereignty belongs to a town: a tile with no town of yours has none to keep.
  if (!r.preserveTown) {
    return 'Preserve Existing Sovereignty is on, but this tile carries no town of yours — '
      + 'sovereignty belongs to a town, so there is none here to keep and the plan is drawn '
      + 'on empty ground.';
  }
  const kept = r.kept;
  const parts = [];
  if (kept.claims.length) {
    parts.push(`Keeping ${kept.claims.length} claim${kept.claims.length === 1 ? '' : 's'} `
      + `${escapeHtml(r.preserveTown)} already holds, costing `
      + `${Math.round(kept.rp).toLocaleString('en-GB')} research and `
      + `${Math.round(kept.rp * 10).toLocaleString('en-GB')} gold an hour, which is taken off `
      + 'the top. The plan is free to build on those squares and pays only for the levels it '
      + 'raises them by. Their buildings are costed as if new.');
  }
  if (kept.unknownLevel) {
    parts.push(`${kept.unknownLevel} more carry a level that could not be read, `
      + 'and are planned as bare ground.');
  }
  if (kept.otherTown) {
    const one = kept.otherTown === 1;
    parts.push(`${kept.otherTown} claim${one ? '' : 's'} of yours inside the radius `
      + `belong${one ? 's' : ''} to another of your towns, and ${one ? 'is' : 'are'} held `
      + "against this one on the same terms as a stranger's.");
  }
  return parts.join(' ');
}

/** Who holds sovereignty on a tile, from its claim's `rd` ("Confed " has a trailing space). */
export function claimHolderText(rd) {
  const holder = {
    Yours: 'One of your towns',
    Alliance: 'An alliance member',
    Confed: 'A confederate',
  }[String(rd ?? '').trim()] ?? 'Another player';
  return `${holder} holds sovereignty on this tile.`;
}

/** One focusSite result: its headline chips, warnings and notes, then the plan. */
function focusResultHtml(r) {
  const notes = [r.plotNote, keptNote(r)].filter(Boolean);
  // Warnings only; the plan is still shown. A town's own tile is planned on
  // purpose, so it is not warned about.
  const warnings = [];
  if (!r.centre.isTown) {
    if (!r.centre.settleable) {
      warnings.push('This tile cannot be settled, so the plan below is for analysis only.');
    }
    if (r.centre.claimedBy) warnings.push(claimHolderText(r.centre.claimedBy));
  }

  const ceiling = r.holdsNoTax
    ? `<p class="sov-warn">This tile holds no tax — its ceiling is ${
      r.ceiling.toFixed(0)}%, limited by ${
      escapeHtml(bindingLabel(r.base.binding).toLowerCase())}.</p>`
    : '';
  const chips = [
    r.holdsNoTax ? '' : `<span class="sov-chip" title="Highest tax this tile holds on food alone">max <b>${
      r.base.tMax.toFixed(0)}%</b>${limitHtml(r.base)}</span>`,
    `<span class="sov-chip" title="${r.radiusFromConfig ? 'From City Configuration' : 'As set above'}">radius ${
      r.radius}</span>`,
    `<span class="sov-chip" title="How many of the ${r.ring} surrounding tiles are claimable">${
      r.claimable}/${r.ring} claimable</span>`,
  ].join('');
  const asked = r.holdsNoTax
    ? ''
    : r.aboveCeiling
      ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(0)}% — the plan below `
        + `is at its ceiling of ${r.ceiling.toFixed(0)}%.</p>`
      : '';

  // The caller mounts the plan block into the empty div.
  return `<div class="sov-result-h"><span class="sov-xy-big">${r.x}|${r.y}</span>${chips}</div>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join('')}
    ${ceiling}${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join('')}
    ${asked}
    <div class="sov-plan-block"></div>`;
}

/** A sovereignty level as its numeral, or as the number itself if it is not 1-5. */
export function roman(level) {
  return SOV_LEVEL_ROMAN[level - 1] ?? String(level);
}

const FOOD_ICON = `<img src="${ICONS.food}" alt="food">`;
const CROSS = '<span class="sov-x">✕</span>';

export function cellKey(dx, dy) {
  return `${dx},${dy}`;
}

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
  if (!d) return `, terrain ${tile.i} — unidentified`;
  const varies = d.nodeClass ? ' (rating varies; not a fixed terrain)' : '';
  if (d.bonusUnread) return `, ${d.name}${varies} — bonus not read yet`;
  if (d.nodeClass) return `, ${d.name}${varies}`;
  if (!d.building) return `, ${d.name} — no sovereignty bonus`;
  const conditional = d.conditional ? `, needs a ${d.building}` : '';
  const disputed = d.disputed ? ' [unconfirmed]' : '';
  return `, ${d.name}: +${d.bonus}% ${d.product} per level of ${d.building}${conditional}${disputed}`;
}

/**
 * The ceiling that set a row's tax, as the icon of what ran out. The tax cap has
 * no icon, so it is a word.
 */
function limitHtml(r) {
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

/** A column heading drawn as an icon, named in its alt and hover text. */
function iconHeading(icon, name, title) {
  return `<th title="${escapeHtml(title)}"><img src="${icon}" alt="${escapeHtml(name)}"></th>`;
}

/**
 * The results pane: the scan summary, shown even when nothing was found, an
 * empty line for the map markers' note, and the table. The first ten rows are
 * numbered as on the map.
 */
export function resultsHtml(results, summary) {
  const head = `<p class="sov-meta">${GLYPHS.target}${summary}</p>`;
  if (!results?.length) return `${head}<p class="sov-note">No available sites met the minimum tax.</p>`;
  const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td class="sov-at"><span class="sov-rank${n < 10 ? ' sov-rank-top' : ''}">${n + 1}</span>${
  r.x}|${r.y}</td>
          <td class="sov-tax-cell"${Number.isFinite(r.tMaxExact)
    ? ` title="The arithmetic reaches ${r.tMaxExact.toFixed(2)}%, but tax is whole numbers only, so the plan is made at this rate."`
    : ''}><b>${Number.isFinite(r.tMax) ? r.tMax.toFixed(0) : r.tMax}%</b>${limitHtml(r)}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td class="sov-mil-cell">${militaryCellHtml(r)}</td>
        </tr>`).join('');
  return `
        ${head}
        <p class="sov-legend sov-map-note"></p>
        <table>
          <thead><tr><th>Site</th>
            <th title="The highest whole-number tax this site can hold on food alone — the game takes no other kind — and the icon of what stops it going higher">Max Tax</th>
            ${iconHeading(ICONS.food, 'Food', 'Food per hour the city nets at that tax')}
            ${iconHeading(ICONS.research, 'Research', 'Research per hour the claims cost')}
            ${iconHeading(ICONS.gold, 'Net Gold', 'Gold per hour after claim upkeep')}
            ${iconHeading(ICONS.troops, 'Military', 'Free military unit production bonus — costs this site no tax — and anything to know about it')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
}

/** Which planned tiles' terrain bonuses name a building SOV_STRUCTURES lacks. */
function conditionalDescriptors(plan) {
  const out = new Map();
  for (const t of [...(plan?.tiles ?? []), ...(plan?.milsov ?? [])]) {
    const d = t.descriptor ?? descriptorFor(t.i);
    if (d?.conditional) out.set(d.building, (out.get(d.building) ?? 0) + 1);
  }
  return out;
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

/** "your Sov III claim", or "your claim" when its level does not read. */
function relaidText(t) {
  return t.relaid > 0 ? `your Sov ${roman(t.relaid)} claim` : 'your claim';
}

/** A claim's research cost, as an upgrade of a kept claim or a replacement of one of yours. */
function claimCostText(t) {
  const held = t.held ?? 0;
  if (held > 0) return `${t.rp.toFixed(0)} RP on top of the Sov ${roman(held)} claim already there`;
  if (t.relaid != null) return `${t.rp.toFixed(0)} RP, replacing ${relaidText(t)}`;
  return `${t.rp.toFixed(0)} RP`;
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

  // `free` goes first: military claims sit on free tiles and overwrite them.
  for (const t of plan.free ?? []) {
    // A free tile with a kept claim is one you keep paying for and build nothing on.
    const held = t.held ?? 0;
    if (held > 0) anyKept = true;
    specs.set(cellKey(t.dx, t.dy), held > 0 ? {
      cls: 'sov-cell-kept',
      badge: descriptorBadge(t),
      title: `${name(t.dx, t.dy)} — Sov ${roman(held)} claim you already hold, food ${
        t.food}, distance ${t.d.toFixed(2)}. Kept as it is${descriptorText(t)}`,
      level: roman(held),
      body: 'kept',
    } : {
      cls: t.water ? 'sov-cell-free sov-cell-water' : 'sov-cell-free',
      badge: descriptorBadge(t),
      title: `${name(t.dx, t.dy)} — ${t.relaid != null
        ? `${relaidText(t)}${t.water ? ' on water' : ''}, given up in this plan`
        : `unclaimed${t.water ? ' water' : ''}`}, food ${t.food}, `
        + `distance ${t.d.toFixed(2)}${descriptorText(t)}`,
      body: `${FOOD_ICON} ${t.food}`,
    });
  }
  for (const t of plan.tiles ?? []) {
    specs.set(cellKey(t.dx, t.dy), {
      cls: 'sov-cell-food',
      badge: descriptorBadge(t),
      title: `${name(t.dx, t.dy)} — Sov ${roman(t.level)} food claim, food ${t.food}, `
        + `distance ${t.d.toFixed(2)}, ${claimCostText(t)}${descriptorText(t)}`,
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
      title: `${name(m.dx, m.dy)} — Sov ${roman(m.sovLevel)} claim carrying a level `
        + `${m.buildingLevel} ${structure.name}, distance ${m.d.toFixed(2)}, `
        + `${claimCostText(m)}, ${structureUpkeep(m).toLocaleString('en-GB')}/hr upkeep`
        + descriptorText(m),
      level: roman(m.sovLevel),
      body: `${icon ? `<img src="${icon}" alt="${escapeHtml(structure.name)}">` : ''} L${
        m.buildingLevel}`,
    });
  }

  const cell = (dx, dy) => {
    if (dx === 0 && dy === 0) {
      return gridCell({ cls: 'sov-cell-town', title: `${name(0, 0)} — the town`, level: 'TOWN' });
    }
    if (excluded.has(cellKey(dx, dy))) {
      return gridCell({
        cls: 'sov-cell-out',
        title: `${name(dx, dy)} — crossed out${pickable ? ', click to put it back' : ''}`,
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
          title: `${name(dx, dy)} — Sov ${roman(k.level)} claim you already hold, distance ${
            k.d.toFixed(2)}, ${k.rp.toFixed(0)} RP. Kept as it is.`,
          level: roman(k.level),
          body: 'kept',
        });
      }
      return gridCell({ cls: 'sov-cell-none', title: `${name(dx, dy)} — not claimable`, body: CROSS });
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
  anyKept ? '<span><i class="sov-sw sov-sw-kept"></i>Yours, kept</span>' : ''}
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

const NOTE_PILLS = {
  binds: ['limit', 'sov-pill-warn', 'The ceiling that sets the tax: this production runs out first'],
  deficit: ['deficit', 'sov-pill-bad', 'The plan spends more than the city makes'],
  indicative: ['estimate', '', 'Per-plot yields for wood, clay, iron and stone are unmeasured'],
};

function notePills(note) {
  return note.split(', ').filter((n) => NOTE_PILLS[n]).map((n) => {
    const [text, cls, title] = NOTE_PILLS[n];
    return ` <span class="sov-pill ${cls}" title="${title}">${text}</span>`;
  }).join('');
}

/** Spent as a share of produced, as a bar with both figures; amber near the whole. */
function useCellHtml(r) {
  if (!Number.isFinite(r.base)) return '<td class="sov-use"></td>';
  const share = r.base > 0 ? Math.min(1, Math.max(0, r.spent / r.base)) : 0;
  const cls = r.value < 0 ? ' sov-bar-over' : share >= 0.95 ? ' sov-bar-full' : '';
  return `<td class="sov-use"><div class="sov-bar${cls}"><i style="width:${(share * 100).toFixed(1)}%"></i></div>
    <span class="sov-use-txt">${count(Math.round(r.spent))} of ${count(Math.round(r.base))}</span></td>`;
}

/**
 * Everything about one plan at its tax, rendered from the plan alone so the
 * slider can replace it whole. `base` is the plan at the site's ceiling, to
 * say what the lower tax bought and cost.
 */
function detailBodyHtml(plan, base, geom) {
  // A ceiling only binds at the tax it was solved for.
  const atCeiling = Math.abs(plan.tax - plan.tMax) < 0.05;
  const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null);
  const num = (v) => (Number.isFinite(v) ? Math.round(v).toLocaleString('en-GB') : '');
  const balance = rows.length
    ? `<table class="sov-balance"><thead><tr><th>At ${plan.tax.toFixed(0)}% Tax</th>
        <th class="sov-use" title="What the plan and your buildings spend, against what the city produces">Spent of produced</th>
        <th>Net</th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${productionLabel(r.icon)}${notePills(r.note)}</td>${useCellHtml(r)}
        <td class="${r.value < 0 ? 'sov-bad' : 'sov-ok'}">${num(r.value)}</td></tr>`).join('')}</tbody></table>`
    : '';
  // The Spent figures include the city's buildings, so their share is named.
  const buildings = BASIC_RESOURCES.filter((res) => plan.surplus?.buildingUpkeep?.[res] > 0)
    .map((res) => `${num(plan.surplus.buildingUpkeep[res])} ${PRODUCTION_LABEL[res].toLowerCase()}`);
  const buildingNote = buildings.length
    ? `<p class="sov-hint">Spent includes ${buildings.join(', ')} per hour for your city's buildings.</p>`
    : '';

  const milPlan = plan.milsov.length
    ? milsovPlanHtml(plan)
    : plan.milsovBlocked
      ? `<p class="sov-flag">No military sovereignty fits at this tax — ${
        escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? 'nothing was left over')}.</p>`
      : '';

  const res = upkeepLimitHtml(plan);

  // What this tax cost against the plan at the ceiling.
  const claimDelta = plan.tiles.length - base.tiles.length;
  const goldDelta = Math.round(plan.goldNet - base.goldNet);
  const signed = (v) => `${v >= 0 ? '+' : ''}${v.toLocaleString('en-GB')}`;
  const trade = plan.tax < base.tMax - 0.05
    ? `<p class="sov-hint">Against the ${base.tMax.toFixed(1)}% ceiling, which fits ${
      base.milsovBonus ? `+${base.milsovBonus}%` : 'no military bonus'}: ${
      signed(claimDelta)} food claims, ${signed(goldDelta)} gold/hr.</p>`
    : '';

  const short = plan.holds === false
    ? `<p class="sov-flag">Plan shown at ${plan.tax.toFixed(0)}% tax.</p>`
    : '';

  // Balance first, right under the slider; the tall grid last.
  return `${short}${balance}${buildingNote}${milPlan}${res}${trade}${planGridHtml(plan, geom)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// RFC 4180 quoting, applied to every column.
export function csvField(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// CRLF between records; Excel on Windows shows LF-only files as one line.
const CSV_EOL = '\r\n';

// A UTF-8 byte-order mark, without which Excel misreads the em dash.
export const CSV_BOM = '﻿';

/**
 * `T_res` stays a number or blank so the column can be totalled; `res_status`
 * says why it is blank. Blank status means the ceiling was applied.
 */
function resColumns(r) {
  if (!r.resIndicative) {
    return [num(r.resCeiling, 2), Number.isFinite(r.resCeiling) ? r.resBinding : '', ''];
  }
  return r.resImpossible
    ? ['', r.resBinding, 'impossible']
    : [num(r.resCeiling, 2), r.resBinding, 'indicative'];
}

/** A number, or blank (never a sentinel, so columns stay summable). */
function num(v, dp = 0) {
  return Number.isFinite(v) ? v.toFixed(dp) : '';
}

export function toCsv(results) {
  // `T_max` is the settable whole-number rate, `T_max_exact` the unrounded
  // ceiling. The free-text field stays last.
  const head = ['x', 'y', 'T_max', 'T_max_exact', 'binding', 'S_food', 'U_RP', 'U_gold',
    'Gold_net', 'milsov_buildings', 'milsov_bonus', 'milsov_upkeep', 'milsov_RP',
    'milsov_gold', 'milsov_price', 'milsov_min_tax', 'milsov_min_bonus',
    'T_res', 'res_binding', 'res_status', 'milsov_plan'];
  const lines = results.map((r) =>
    [r.x, r.y, num(r.tMax), num(r.tMaxExact, 2), r.binding, num(r.sFood),
     num(r.uRp), num(r.uGold), num(r.goldNet),
     r.milsov?.length ?? 0, r.milsovBonus ?? 0, r.milsovUpkeep ?? 0,
     num(r.milsovRp ?? 0), num(r.milsovGold ?? 0), r.milsovPrice ?? 0,
     // Blank when nothing was asked for or nothing reaches it.
     num(r.milsovMinTax), num(r.milsovMinBonusAt),
     ...resColumns(r),
     milsovPlanText(r)].map(csvField).join(','));
  return [head.join(','), ...lines].join(CSV_EOL);
}

/** toCsv with a BOM, so Excel reads UTF-8. */
export function csvFile(results) {
  return CSV_BOM + toCsv(results);
}

/** e.g. `sov-sites-20260808-2043.csv`. */
export function csvFilename(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `sov-sites-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`
    + `-${p(now.getHours())}${p(now.getMinutes())}.csv`;
}
