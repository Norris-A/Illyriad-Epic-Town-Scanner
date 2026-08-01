// Side panel UI — PRD §5. v1 is panel-only; the map overlay is v2 and
// deliberately deferred (it couples to the game DOM and will break).
//
// Coordinates are DISPLAYED as "x|y" to match in-game convention, even though
// payload keys are "y|x". Convert at the boundary, never in the middle.

const CSS = `
.sov-panel{position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow:auto;
  z-index:99999;background:#1b1b1b;color:#ddd;font:12px/1.4 system-ui,sans-serif;
  border-left:1px solid #444;box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-panel h2{margin:0;padding:8px 10px;font-size:13px;background:#2a2a2a;cursor:pointer}
.sov-body{padding:8px 10px}
.sov-panel table{width:100%;border-collapse:collapse}
.sov-panel th,.sov-panel td{padding:2px 4px;border-bottom:1px solid #333;text-align:right}
.sov-panel th:first-child,.sov-panel td:first-child{text-align:left}
.sov-panel button{background:#3a5;color:#fff;border:0;padding:5px 10px;cursor:pointer}
.sov-panel button.sec{background:#444}
.sov-row{cursor:pointer}
.sov-detail{background:#222;font-size:11px}
.sov-flag{color:#e94}
.sov-advice{color:#6bf}
.sov-collapsed .sov-body{display:none}
`;

export function createPanel({ onScan, onExport }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sov-panel';
  root.innerHTML = `
    <h2>Sovereignty Scanner</h2>
    <div class="sov-body">
      <p><button class="sov-scan">Scan</button>
         <button class="sov-settings sec">Settings</button>
         <button class="sov-export sec">Export CSV</button></p>
      <div class="sov-settings-form" hidden></div>
      <div class="sov-status"></div>
      <div class="sov-results"></div>
      <div class="sov-incomplete"></div>
    </div>`;
  document.body.appendChild(root);

  root.querySelector('h2').addEventListener('click', () => root.classList.toggle('sov-collapsed'));
  root.querySelector('.sov-scan').addEventListener('click', onScan);
  root.querySelector('.sov-export').addEventListener('click', onExport);
  root.querySelector('.sov-settings').addEventListener('click', () => {
    const f = root.querySelector('.sov-settings-form');
    f.hidden = !f.hidden;
  });

  return {
    root,
    setStatus(html) {
      root.querySelector('.sov-status').innerHTML = html;
    },
    renderResults(results, summary) {
      const el = root.querySelector('.sov-results');
      if (!results.length) {
        el.innerHTML = '<p>No sites met the minimum tax.</p>';
        return;
      }
      const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td>${r.x}|${r.y}</td>
          <td>${r.tMax.toFixed(1)}%</td>
          <td>${r.binding}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td>${r.quotaMet ? '' : '<span class="sov-flag">maybe</span>'}${
            r.milsovNote ? '<span class="sov-advice" title="Milsov level advisory">advice</span>' : ''
          }</td>
        </tr>`).join('');
      el.innerHTML = `
        <p>${summary}</p>
        <table>
          <thead><tr><th>Site</th><th>T_max</th><th>Binds</th><th>Food</th>
            <th>RP</th><th>Net gold</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;

      el.querySelectorAll('.sov-row').forEach((row) => {
        row.addEventListener('click', () => toggleDetail(row, results[Number(row.dataset.n)]));
      });
    },
    renderIncomplete(list) {
      const el = root.querySelector('.sov-incomplete');
      el.innerHTML = list.length
        ? `<p>${list.length} site(s) excluded: neighbourhood extends beyond the payload.</p>`
        : '';
    },
  };
}

function toggleDetail(row, result) {
  const next = row.nextElementSibling;
  if (next && next.classList.contains('sov-detail')) {
    next.remove();
    return;
  }
  const tr = document.createElement('tr');
  tr.className = 'sov-detail';
  const tiles = result.tiles.map((t) => {
    const dxy = `${t.dx >= 0 ? '+' : ''}${t.dx},${t.dy >= 0 ? '+' : ''}${t.dy}`;
    return `<li>${dxy} — food ${t.food}, d ${t.d.toFixed(2)}, ${t.rp.toFixed(0)} RP, Sov ${t.level}</li>`;
  }).join('');
  const mil = result.milsov.map((m) =>
    `<li>milsov Sov ${m.level} at d ${m.d.toFixed(2)} — ${m.rp.toFixed(0)} RP</li>`).join('');
  // PRD §3.6 — advisory only. The plan above is exactly what the user asked
  // for; this is a note, never an applied change. Say so plainly.
  const advice = result.milsovNote
    ? `<p class="sov-advice">Advisory: ${escapeHtml(result.milsovNote)} Your requested levels are what is planned above.</p>`
    : '';
  tr.innerHTML = `<td colspan="7"><ul>${tiles}${mil}</ul>${advice}${
    result.resIndicative
      ? '<p class="sov-flag">Resource ceiling is indicative only — per-plot yields unmeasured (mechanics open item 12).</p>'
      : ''
  }</td>`;
  row.after(tr);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// RFC 4180 quoting. Every column goes through this rather than only the free
// text one — the milsov advisory (PRD §3.6) is the first field that can carry a
// comma, and picking which columns are "safe" is how that regresses later.
export function csvField(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(results) {
  const head = ['x', 'y', 'T_max', 'binding', 'S_food', 'U_RP', 'U_gold', 'Gold_net',
    'quota_met', 'milsov_advisory'];
  const lines = results.map((r) =>
    [r.x, r.y, r.tMax.toFixed(2), r.binding, r.sFood.toFixed(0),
     r.uRp.toFixed(0), r.uGold.toFixed(0), r.goldNet.toFixed(0), r.quotaMet,
     r.milsovNote ?? ''].map(csvField).join(','));
  return [head.join(','), ...lines].join('\n');
}
