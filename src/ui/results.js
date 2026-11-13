// Site Search's results table as markup. No DOM.

import { GLYPHS } from '../app-icons.js';
import { ICONS } from '../game-icons.js';
import { count, escapeHtml, limitHtml, MILSOV_BLOCKED_TEXT } from './format.js';

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
  return `${r.milsovBonus ? `<b class="sov-mil-v">+${r.milsovBonus}%</b>` : ''}${flags
    .map((f) => `<span class="sov-pill ${f.cls}" title="${escapeHtml(f.title)}">${f.html}</span>`)
    .join('')}`;
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
  const head = `<p class="sov-meta">${GLYPHS.target}${summary}</p>
    <p class="sov-warn sov-stale" hidden>Settings have changed — scan again to update these results.</p>`;
  if (!results?.length) return `${head}<p class="sov-note">No available sites met the minimum tax.</p>`;
  const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td class="sov-at"><span class="sov-rank${n < 10 ? ' sov-rank-top' : ''}">${n + 1}</span>${
  r.x}|${r.y}</td>
          <td class="sov-tax-cell"${Number.isFinite(r.tMaxExact)
    ? ` title="The arithmetic reaches ${r.tMaxExact.toFixed(2)}%, but tax is whole numbers only, so the plan is made at this rate."`
    : ''}><b>${Number.isFinite(r.tMax) ? r.tMax.toFixed(0) : r.tMax}%</b>${limitHtml(r)}</td>
          <td>${r.surplus ? count(Math.round(r.surplus.food)) : ''}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${count(Math.round(r.goldNet))}</td>
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
