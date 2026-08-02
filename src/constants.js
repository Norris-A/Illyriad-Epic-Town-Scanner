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
// Keyed by BUILDING level, not by the claim's sovereignty level — see below.
export const MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };

// [D] Military sov production bonus, % per claimed tile, before the tile's
// innate descriptor modifier. Derived from the [F] "+5% unit production per
// building level" (mechanics §5.3) and cross-checked against the [F] worked
// example in the same section: 8x Sov III + 12x Sov II = 8*15 + 12*10 = +240%,
// the figure quoted there. Linear in level, as PRD §3.6 assumes.
//
// A claimed tile carries two levels, set independently in game: the claim's
// SOVEREIGNTY level, which fixes its RP and gold upkeep and rises with distance,
// and the BUILDING level of the structure on it, which fixes this bonus and the
// flat upkeep above. This table and MILSOV_UPKEEP_BY_LEVEL are both keyed by
// building level; CLAIM_RP_PER_LEVEL_DISTANCE is keyed by sovereignty level. A
// quota entry carries both, one per building. Descriptor modifiers are not
// applied.
export const MILSOV_BONUS_BY_LEVEL = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 };
export const MILSOV_BONUS_PER_LEVEL = 5; // [F] the linear coefficient itself

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
  // The 22,400 baseline the model is calibrated against needs 18.89 points on
  // top of the Flour Mill, which is Nature's Bounty at two retreats to within
  // 0.7%. Defaulting the spell on rather than burying the same 20 points in
  // otherFoodBonus keeps B_other at 60 while making the assumption one the user
  // can see and untick — and stops it being counted twice.
  naturesBounty: true,
  geomancerRetreats: 2,
  cityCount: 1,
  isCapital: false,
  otherFoodBonus: 0,       // genuinely other: everything known has its own field
  libraryLevel: 20,
  allembine: true,
  overflowingInsight: false,
  rpCalibration: null,     // { observedRpPerHour, atTax } back-solves R_ref
  chancery: false,
  rClaim: 2,
  maxBuildings: 20,
  dOther: 10,
  dOwn: 3,
  // One entry per building, e.g. a Sov V claim carrying a level 5 structure:
  // [{ sovLevel: 5, buildingLevel: 5 }]. buildingLevel never exceeds sovLevel.
  milsovQuota: [],
  milsovAdvisory: true,
  ownClaimsAvailable: false,
  allianceClaimsAvailable: false,
};
