// The City Configuration's settings: one entry per setting in SETTINGS_FIELDS,
// and the validators that read each one, whether typed into the panel or
// loaded from storage. No DOM.

import {
  ALLEMBINE_RP,
  BASIC_RESOURCES,
  DEFAULT_CITY_CONSUMPTION,
  FLOUR_MILL_L20,
  MILSOV_STRUCTURES,
  MINIMUM_KEYS,
  NATURES_BOUNTY_BY_RETREATS,
  OVERFLOWING_INSIGHT_RP,
  PLOT_KEYS,
  PLOT_TOTAL,
  PRESTIGE_KEYS,
  SETTLE_TERRAINS,
  UPKEEP_BUILDINGS,
} from './constants.js';

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

/** The ticked terrains in SETTLE_TERRAINS order; anything else is dropped. */
export function parseTerrains(raw) {
  const ticked = Array.isArray(raw) ? raw : [];
  return SETTLE_TERRAINS.filter((t) => ticked.includes(t));
}

/**
 * One control per setting. The keys must match DEFAULT_SETTINGS', which a test
 * checks.
 *
 * `enabledWhen` disables a control whose precondition is off. `menu: true` puts
 * a setting in the gear menu instead of the City Configuration form.
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
    label: `Allembine Research (+${ALLEMBINE_RP}/hr)`,
    type: 'checkbox',
  },
  {
    key: 'overflowingInsight',
    group: 'Research',
    label: `Overflowing Insight (+${OVERFLOWING_INSIGHT_RP}/hr)`,
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
    key: 'siteTerrains',
    group: 'Site Filters',
    subsection: 'Terrain',
    label: 'Site Tile',
    type: 'terrains',
    hint: 'List only sites on the ticked terrain. With none ticked, every terrain is listed.',
  },
  {
    key: 'surroundTerrains',
    group: 'Site Filters',
    label: 'Surrounding Tiles',
    type: 'terrains',
    hint: 'List only sites with enough of the 8 tiles around them on the ticked terrain. '
      + 'River banks count as Plains. With none ticked, every site is listed.',
  },
  {
    key: 'surroundMin',
    group: 'Site Filters',
    label: 'Minimum on Ticked Terrain (of 8)',
    type: 'number',
    min: 0,
    max: 8,
    integer: true,
    fallback: 8,
    hint: 'How many of the 8 tiles around a site must be on the terrain ticked above. '
      + 'Tiles past the edge of the world count as none.',
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

/** Whether two sets of settings differ in anything a scan reads; the gear menu's do not count. */
export function scanSettingsDiffer(a, b) {
  return SETTINGS_FIELDS.some((f) => !f.menu && JSON.stringify(a[f.key]) !== JSON.stringify(b[f.key]));
}
