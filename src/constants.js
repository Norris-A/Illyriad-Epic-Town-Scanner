// Game constants. Every value here traces to illyriad-game-mechanics.md §9.
// Confidence markers are carried through deliberately — [F] and [?] values are
// the ones to re-check when output looks wrong.

export const PRODUCTION_BASE = 125;        // [V] production% = 125 - tax
export const FARM_YIELD_L20 = 2014;        // [V] food/hr per farm plot at L20
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

// [F] Every sovereignty structure, and the two fields the rest of the tool
// reads off them. `type` is the whole of the arithmetic: a 'production'
// structure pays MILSOV_UPKEEP_BY_LEVEL every hour, a 'resource' one pays
// nothing beyond its claim's RP and gold. `boosts` is what a resource structure
// raises, and is what keeps the food two out of the quota picker (see
// SOV_QUOTA_STRUCTURES) without a second list to keep in step.
export const SOV_STRUCTURES = [
  { key: 'trainingGround', name: 'Training Ground', type: 'production' },
  { key: 'targetRange', name: 'Target Range', type: 'production' },
  { key: 'militaryAcademy', name: 'Military Academy', type: 'production' },
  { key: 'joustingYard', name: 'Jousting Yard', type: 'production' },
  { key: 'assemblyYard', name: 'Assembly Yard', type: 'production' },
  { key: 'crafting', name: 'Crafting structure', type: 'production' },
  { key: 'loggingCamp', name: 'Logging Camp', type: 'resource', boosts: 'wood' },
  { key: 'earthworks', name: 'Earthworks', type: 'resource', boosts: 'clay' },
  { key: 'mineshaft', name: 'Mineshaft', type: 'resource', boosts: 'iron' },
  { key: 'gravelPit', name: 'Gravel Pit', type: 'resource', boosts: 'stone' },
  { key: 'farmstead', name: 'Farmstead', type: 'resource', boosts: 'food' },
  { key: 'fishery', name: 'Fishery', type: 'resource', boosts: 'food' },
];

export const SOV_STRUCTURE_BY_KEY = Object.fromEntries(SOV_STRUCTURES.map((s) => [s.key, s]));

// What the quota form offers. Farmstead and Fishery are costed correctly by the
// engine like any other resource structure, but they are not offered as a quota
// row: the food claim plan already places them, and a row would reserve a tile
// the knapsack then cannot claim for its food.
export const SOV_QUOTA_STRUCTURES = SOV_STRUCTURES.filter((s) => s.boosts !== 'food');

// A row that names no structure, or names one this table does not know, is a
// Production Structure: that is what every quota meant before the field existed,
// and it is the charged case, so the fallback errs toward billing rather than
// toward a free claim.
export const DEFAULT_SOV_STRUCTURE = 'trainingGround';

// Sovereignty levels are written in Roman numerals wherever a level is shown.
export const SOV_LEVEL_ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// The four basic resources, in the order the panel shows them. Food is scored
// on its own everywhere and is deliberately not in this list.
export const BASIC_RESOURCES = ['wood', 'clay', 'iron', 'stone'];

// [V] The level 20 booster building for each, worth the same +40 points the
// Flour Mill gives food — additive on the production percentage, not a
// multiplier, so it reads as 40 points of tax headroom.
export const RESOURCE_BOOSTERS = {
  wood: 'Carpentry',
  clay: 'Kiln',
  iron: 'Foundry',
  stone: 'Stonemason',
};
export const RESOURCE_BOOSTER_BONUS = 40;

// [V] Per-plot yield at L20, the same for all four basic resources. Multiplied
// by the plot count and the production percentage to give hourly output.
export const BASIC_YIELD_L20 = 2538;

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
  // Which of the four booster buildings the city has at level 20. Each is worth
  // RESOURCE_BOOSTER_BONUS points against that resource's ceiling.
  resourceBoosters: { wood: false, clay: false, iron: false, stone: false },
  // { observedPerHour, atTax, plots, booster } back-solves the per-plot yield,
  // the way rpCalibration back-solves R_ref. Null uses BASIC_YIELD_L20.
  resourceCalibration: null,
  chancery: false,
  rClaim: 2,
  maxBuildings: 20,
  dOther: 10,
  dOwn: 3,
  // One entry per building, e.g. a Sov V claim carrying a level 5 Training
  // Ground: [{ structure: 'trainingGround', sovLevel: 5, buildingLevel: 5 }].
  // buildingLevel never exceeds sovLevel; `structure` keys into SOV_STRUCTURES
  // and decides whether the building is charged hourly upkeep at all.
  milsovQuota: [],
  milsovAdvisory: true,
  ownClaimsAvailable: false,
  allianceClaimsAvailable: false,
};
