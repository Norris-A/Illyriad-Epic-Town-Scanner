// A result row's flag and the plan's military and upkeep notes. panel.js only
// touches the DOM inside createPanel, so these are testable here without a
// browser.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { resFlag, milsovPlanHtml, upkeepLimitHtml } from '../src/panel.js';

// The no-military shape: T_res is Infinity and carries no flag, which is what
// scoreSite returns for the common case. The tax is the whole number the plan is
// made at; the ceiling it was floored from travels beside it.
const row = (over = {}) => ({
  x: 360, y: -3178, tMax: 56, tMaxExact: 56.6, binding: 'food', sFood: 100,
  uRp: 1000, uGold: 10000, goldNet: 62901,
  milsov: [], milsovBonus: 0, milsovUpkeep: 0, milsovRp: 0, milsovGold: 0, milsovPrice: 0,
  milsovMinTax: null, milsovMinBonusAt: null,
  resCeiling: Infinity, resIndicative: false, resBinding: null, resImpossible: false,
  ...over,
});

/** A plan with military sovereignty on it, as scoreSite returns one. */
const withMil = (over = {}) => row({
  milsov: [
    { buildingLevel: 3, sovLevel: 3 },
    { buildingLevel: 1, sovLevel: 1 },
    { buildingLevel: 1, sovLevel: 1 },
  ],
  milsovBonus: 25, milsovUpkeep: 900, milsovRp: 120.4, milsovGold: 1204, milsovPrice: 5,
  ...over,
});

// The bonus is what the tax bought; the composition and the bill are how it was
// reached.
test('the panel leads with the bonus and demotes the upkeep', () => {
  const html = milsovPlanHtml(withMil());
  assert.match(html, /<b class="sov-mil-bonus">\+25%<\/b>/);
  // The bonus comes before the level split, which comes before the bill.
  assert.ok(html.indexOf('+25%') < html.indexOf('1× Sov III'), 'the split outranks the bonus');
  assert.ok(html.indexOf('1× Sov III') < html.indexOf('upkeep 900'), 'the bill outranks the split');
  // Everything after the headline is hint weight.
  assert.match(html, /<span class="sov-hint">1× Sov III \+ 2× Sov I, upkeep 900\/hr/);
  assert.equal(milsovPlanHtml(row()), '', 'nothing placed, nothing to say');
  assert.equal(milsovPlanHtml(null), '');
});

// A ceiling the site can never reach is not information. The plan below is
// capped at 78%, so a stone limit of 161.1% tells the reader nothing they can
// act on — and reading it as a warning is worse than not seeing it.
test('the upkeep limit is stated only when the site could hit it', () => {
  const at = (over) => upkeepLimitHtml(row({ tMax: 78, resBinding: 'stone', ...over }));
  assert.equal(at({ resCeiling: 161.1 }), '', 'a limit above the ceiling must be silent');
  assert.equal(at({ resCeiling: 78 }), '', 'a limit at the ceiling binds nothing further');
  assert.equal(at({ resCeiling: Infinity }), '', 'nothing to pay, nothing to say');
  assert.match(at({ resCeiling: 60 }), /Upkeep limit: 60\.0% tax/);
  assert.match(at({ resCeiling: 60 }), /stone production no longer covers it/);
});

// The one case with no number: no plots of the binding resource means the
// upkeep is unpayable at any tax, which is a warning rather than a limit.
test('an unpayable upkeep is flagged, not silenced', () => {
  const html = upkeepLimitHtml(row({ resImpossible: true, resBinding: 'stone', tMax: 78 }));
  assert.match(html, /class="sov-flag"/, 'this one is a warning, not a hint');
  assert.match(html, /no stone plots/);
  assert.match(html, /cannot be paid at any tax/);
});

// --- the row flag -----------------------------------------------------------

test('a ceiling above the tax the site reaches says nothing', () => {
  assert.equal(resFlag(row()), null, 'no structure asked for, no flag');
  assert.equal(
    resFlag(row({ resCeiling: 90, resIndicative: true, resBinding: 'stone' })),
    null,
    'the upkeep is already covered at 56.6% tax',
  );
});

test('a binding indicative ceiling flags the row it did not rank', () => {
  const flag = resFlag(row({ resCeiling: 5.83416, resIndicative: true, resBinding: 'stone' }));
  assert.equal(flag.text, 'stone 5.8%');
  assert.match(flag.title, /stone/);
  assert.match(flag.title, /does not affect the ranking/);
});

test('an impossible ceiling names the missing resource rather than showing -Infinity', () => {
  const flag = resFlag(row({
    resCeiling: -Infinity, resIndicative: true, resBinding: 'stone', resImpossible: true,
  }));
  assert.equal(flag.text, 'no stone plots');
  assert.ok(!flag.title.includes('Infinity'));
  assert.match(flag.title, /any tax rate/);
});
