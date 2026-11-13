// The panel's stylesheet. It is added to the panel's shadow root, so its rules
// reach only the panel, its popovers and its tooltip.

export const CSS = `
/* Form controls take the browser's own font and colour rather than inheriting,
   so every element gets them here, first, and nested elements need explicit
   rules: they never inherit size, weight or colour. */
.sov-panel,.sov-panel *{color:#e6e6e6;background:transparent;font:12px/1.4 system-ui,sans-serif}
.sov-panel,.sov-menu,.sov-tip{--bg:#1b1b1b;--card:#222;--card-hi:#292929;--line:#333;--line2:#444;
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
.sov-panel h2 .sov-h2-inner{display:flex;align-items:center;gap:8px}
.sov-panel h2 .sov-title{min-width:0;font-size:13px;font-weight:600;color:#fff}
.sov-panel h2 .sov-h2-actions{margin-left:auto;flex:none;display:flex;align-items:center;gap:12px}
.sov-panel.sov-dragging{cursor:grabbing}
.sov-panel.sov-dragging h2{cursor:grabbing}
.sov-panel h2 .sov-about{color:#8a8a8a;text-decoration:none;font-size:18px;line-height:1}
.sov-panel h2 .sov-about:hover{color:#fff}
/* Not <button>s, which the panel draws as filled buttons. */
.sov-panel h2 .sov-gear,.sov-panel h2 .sov-changelog{color:#8a8a8a;font-size:18px;line-height:1;cursor:pointer}
.sov-panel h2 .sov-gear:hover,.sov-panel h2 .sov-changelog:hover{color:#fff}
.sov-panel h2 .sov-gear:focus-visible,.sov-panel h2 .sov-changelog:focus-visible{outline:1px solid var(--blue)}
.sov-panel h2 .sov-changelog .sov-glyph{display:block;width:16px;height:16px}
.sov-panel h2 .sov-build{color:#777;font-size:10px;font-weight:normal}
/* No pointer events, so the icon never takes the header's drag. */
.sov-panel h2 .sov-app-icon{flex:none;width:18px;height:18px;pointer-events:none}
/* The header's popovers live outside the panel, so the panel's overflow cannot
   clip them, and need their own reset. */
.sov-menu,.sov-menu *{color:#e6e6e6;background:transparent;font:12px/1.4 system-ui,sans-serif}
.sov-menu{position:fixed;z-index:100000;width:260px;box-sizing:border-box;
  background:var(--bg);border:1px solid var(--line2);border-radius:8px;padding:8px 10px;
  box-shadow:0 4px 12px rgba(0,0,0,.5)}
.sov-menu h3{margin:0 0 6px;font-size:13px;font-weight:600;color:#fff}
.sov-menu[hidden]{display:none}
.sov-menu.sov-changelog-menu{width:320px}
/* Replaces the browser's own tooltip for every title in the panel and its
   popovers. Outside the panel for the same reason as the popovers. */
.sov-tip{position:fixed;z-index:100001;max-width:280px;box-sizing:border-box;padding:6px 8px;
  background:#262626;border:1px solid var(--line2);border-radius:6px;
  box-shadow:0 4px 12px rgba(0,0,0,.5);pointer-events:none;white-space:pre-line;
  color:#e6e6e6;font:12px/1.45 system-ui,sans-serif}
.sov-tip[hidden]{display:none}
/* A tooltip of several lines leads with what the thing is. */
.sov-tip.sov-tip-multi::first-line{font-weight:600;color:#fff}
.sov-changelog-body{max-height:60vh;overflow:auto}
.sov-menu h4{margin:8px 0 2px;font-weight:600;color:#fff}
.sov-menu .sov-changelog-date{margin-left:6px;color:var(--muted)}
.sov-menu ul{margin:0;padding:0 0 0 16px;list-style:disc}
.sov-menu li{margin:2px 0}
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
  outline:1px solid var(--blue);outline-offset:1px}
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

.sov-heading{display:flex;align-items:center;gap:6px;margin:10px 0 2px;padding-bottom:3px;
  border-bottom:1px solid var(--line);color:var(--accent-text);font-weight:600}
.sov-heading:first-child{margin-top:0}
.sov-panel .sov-heading img{width:18px;height:18px;image-rendering:pixelated}
.sov-subheading{margin:10px 0 3px;color:var(--muted);font-size:10px;font-weight:600;
  text-transform:uppercase;letter-spacing:.06em}
.sov-f>.sov-uses{flex:none;display:inline-flex;gap:3px;margin-left:auto;cursor:help}
.sov-panel .sov-uses img{width:12px;height:12px;image-rendering:pixelated}
.sov-panel [data-upkeep-row] input[type=number]{width:52px}
.sov-panel .sov-has>label{color:#fff;font-weight:600}
.sov-terrains{display:grid;grid-template-columns:1fr 1fr;column-gap:16px}
/* Plains alone, then each Small beside its Large. */
.sov-terrains>:nth-child(2){grid-column:1}

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
.sov-panel .sov-xy button{padding:3px 8px;white-space:nowrap}
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
