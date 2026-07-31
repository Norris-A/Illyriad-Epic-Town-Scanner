// Game constants. Every value here traces to illyriad-game-mechanics.md §9.
// Confidence markers are carried through deliberately — [F] and [?] values are
// the ones to re-check when output looks wrong.

export const PRODUCTION_BASE = 125;        // [V] production% = 125 - tax
export const FARM_YIELD_L20 = 2014;        // [F] food/hr per farm plot at L20
export const GOLD_PER_TAX_POP = 0.04;      // [F] Gold_income = 0.04 * T * Pop

export const CLAIM_RP_PER_LEVEL_DISTANCE = 10;    // [F] RP/hr = 10 * L * d
export const CLAIM_GOLD_PER_LEVEL_DISTANCE = 100; // [F] gold is exactly 10x RP
export const CHANCERY_FACTOR = 0.6;               // [F] -40% at level 20

// [F] Food sovereignty requires level 5 claim + level 5 building (mechanics §5.3).
export const FOOD_CLAIM_LEVEL = 5;

// [F] Military sov structure upkeep, per hour, of EACH of wood/clay/iron/stone.
export const MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };

export const CITY_PROFILES = {
  standard: 32200, // [V]
  beer: 30800,     // [V]
};

// [F] mechanics §4.2
export const FLOUR_MILL_L20 = 40;
export const NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];
export const FAMINE_MANAGEMENT = 10;  // capital, >=10 cities
export const SOIL_ENRICHMENT = 15;    // capital, >=30 cities

export const ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5; // [F]
export const OVERFLOWING_INSIGHT_FACTOR = 1.5;   // [?] mechanics open item 4

// [?] mechanics open item 2 — Library base RP/hr at L20 is NOT recorded.
// This placeholder reproduces the PRD §6 worked example (R_ref = 1600 with
// Allembine at Library 20 and no Insight). The calibration override in §4 is
// the reliable path; treat this as a default to be replaced, not a fact.
export const LIBRARY_BASE_RP_L20 = 1500;

export const DEFAULT_SETTINGS = {
  tMin: 50,
  plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 }, // must sum to 25
  cityProfile: 'standard',
  cityConsumptionOverride: null,
  flourMill: true,
  naturesBounty: false,
  geomancerRetreats: 0,
  cityCount: 1,
  isCapital: false,
  otherFoodBonus: 20,      // PRD open item 1 — the unattributed residual
  libraryLevel: 20,
  allembine: true,
  overflowingInsight: false,
  rpCalibration: null,     // { observedRpPerHour, atTax } back-solves R_ref
  chancery: false,
  rClaim: 2,
  maxBuildings: 20,
  dOther: 10,
  dOwn: 3,
  milsovQuota: [],         // e.g. [{ level: 5, count: 1 }, { level: 3, count: 2 }]
  milsovAdvisory: true,
  ownClaimsAvailable: false,
  allianceClaimsAvailable: false,
};
