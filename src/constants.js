// Game constants, each carrying how well it is known: [V] verified in game, [F]
// stated by a reliable source, [D] derived from one, [?] assumed. The markers
// are here deliberately — when output looks wrong, the [F] and [?] values are
// what to re-check first.

export const PRODUCTION_BASE = 125;        // [V] production% = 125 - tax
export const FARM_YIELD_L20 = 2014;        // [V] food/hr per farm plot at L20
export const GOLD_PER_TAX_POP = 0.04;      // [F] Gold_income = 0.04 * T * Pop

export const CLAIM_RP_PER_LEVEL_DISTANCE = 10;    // [F] RP/hr = 10 * L * d
export const CLAIM_GOLD_PER_LEVEL_DISTANCE = 100; // [F] gold is exactly 10x RP
export const CHANCERY_FACTOR = 0.6;               // [F] -40% at level 20

// [F] Food sovereignty requires a level 5 claim carrying a level 5 building.
export const FOOD_CLAIM_LEVEL = 5;

// [F] Military sov structure upkeep, per hour, of EACH of wood/clay/iron/stone.
// Keyed by BUILDING level, not by the claim's sovereignty level — see below.
export const MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };

// What raising one building from level j-1 to level j adds to that hourly bill:
// [150, 150, 300, 600, 1200], indexed from 0 for level 1. The table above is
// convex, so these increments grow — which is the whole reason spreading a given
// bonus over more buildings is cheaper to run than concentrating it, and the
// term the planner balances against distance. Derived rather than written out,
// so the two can never drift apart.
export const MILSOV_UPKEEP_STEP = [1, 2, 3, 4, 5].map(
  (level) => MILSOV_UPKEEP_BY_LEVEL[level] - (MILSOV_UPKEEP_BY_LEVEL[level - 1] ?? 0),
);

export const MILSOV_MAX_LEVEL = 5;

// [D] Military sov production bonus, % per claimed tile, before the tile's
// innate descriptor modifier. Derived from the [F] "+5% unit production per
// building level", and cross-checked against a [F] worked example: 8x Sov III +
// 12x Sov II = 8*15 + 12*10 = +240%, the figure quoted there. Linear in level,
// which is what lets the planner treat bonus as five independent layers.
//
// A claimed tile carries two levels, set independently in game: the claim's
// SOVEREIGNTY level, which fixes its RP and gold upkeep and rises with distance,
// and the BUILDING level of the structure on it, which fixes this bonus and the
// flat upkeep above. This table and MILSOV_UPKEEP_BY_LEVEL are both keyed by
// building level; CLAIM_RP_PER_LEVEL_DISTANCE is keyed by sovereignty level. The
// planner sets the two equal, since a claim above its building buys nothing.
// Descriptor modifiers are not applied.
export const MILSOV_BONUS_BY_LEVEL = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 };
export const MILSOV_BONUS_PER_LEVEL = 5; // [F] the linear coefficient itself

// [F] Every sovereignty structure, and the two fields the rest of the tool
// reads off them. `type` is the whole of the arithmetic: a 'production'
// structure pays MILSOV_UPKEEP_BY_LEVEL every hour, a 'resource' one pays
// nothing beyond its claim's RP and gold. `boosts` is what a resource structure
// raises. The table is complete; what the form offers is a filter over it (see
// MILSOV_STRUCTURES) rather than a second list to keep in step.
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

// What the form offers for military sovereignty. Production Structures only.
//
// The engine chooses how many buildings to place and at what levels, by
// maximising production bonus against the hourly upkeep they cost.
//
// A Resource Structure pays its claim's RP and gold like every other claim — it
// is not a free tile — but it pays no hourly wood/clay/iron/stone bill. With no
// hourly bill, the search has nothing to stop it claiming every spare tile at
// level 5, while the thing that would justify doing so, the host tile's resource
// rating, is not scored at all. So resource sovereignty is costed correctly
// wherever it appears and never placed automatically. The Farmstead and Fishery
// are out for a second reason: the food plan is what places those.
export const MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.type === 'production');

// A plan that names no structure, or names one this table does not know, is
// charged as a Production Structure: that is the charged case, so the fallback
// errs toward billing rather than toward a free claim.
export const DEFAULT_SOV_STRUCTURE = 'trainingGround';

// Sovereignty levels are written in Roman numerals wherever a level is shown.
export const SOV_LEVEL_ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// [V] What each terrain type `i` grants a claim built on it, from the account
// owner's own reading of the tiles. Nothing here is scored: the bonus applies to
// a unit or item the tool does not model, so this is a column and a flag.
//
// `building` is what the bonus scales with, per level of it. Every one of them
// is a Production Structure, crafting and military alike, so a descriptor names
// a claim that could be placed on that very tile — it reads as advice about
// what the tile is FOR, not as a caveat (see descriptorFor).
//
// An entry with no `building` is a terrain that grants nothing. That is a
// finding, not a gap: it has to read differently from an `i` nobody has
// identified, which is why they are listed rather than omitted.
//
// `family` separates the glacial terrain from the temperate. It exists because
// the two run the ladder independently and so share rungs — see
// descriptorCollisions. A row without one is temperate.
//
// `disputed` marks a row that breaks the one-bonus-per-(building, level) rule
// below, and shows it marked rather than silently trusted or silently dropped.
// Nothing carries it today: the four rows that did were all inherited, all
// wrong, and all corrected against the tiles. The field stays for the next row
// that is written down before it is checked.
export const TERRAIN_DESCRIPTORS = {
  1: { name: 'Plains' },
  2: { name: 'Plains' },
  5: { name: 'Plains' },
  6: { name: 'Rich Clay Seam', bonus: 3, product: 'Books', building: 'Papermill' },
  7: { name: 'Abundant Clay', bonus: 2, product: 'Books', building: 'Papermill' },
  8: { name: 'Exposed Clay', bonus: 1, product: 'Leather Armour', building: 'Renderer' },
  9: { name: 'Clay Seam', bonus: 3, product: 'Leather Armour', building: 'Renderer' },
  10: { name: 'Turned Clay', bonus: 2, product: 'Saddles', building: 'Bridlemaker' },
  11: { name: 'Heavy Clay Seam', bonus: 1, product: 'Saddles', building: 'Bridlemaker' },
  12: { name: 'Abundant Crops', bonus: 3, product: 'Beer', building: "Brewer's Yard" },
  13: { name: 'Bountiful Land', bonus: 3, product: 'Livestock', building: 'Cattle Rancher' },
  14: { name: 'Fertile Pasture', bonus: 2, product: 'Cavalry Units', building: 'Jousting Yard' },
  15: { name: 'Fertile Orchard' },
  16: { name: 'Alluvial Plain', bonus: 1, product: 'Livestock', building: 'Cattle Rancher' },
  17: { name: 'Fertile Ground', bonus: 1, product: 'Horses', building: 'Farrier' },
  18: { name: 'Lake', water: true },
  19: { name: 'Lake', water: true },
  20: { name: 'Mountains', impassable: true },
  21: { name: 'Mountains', impassable: true },
  22: { name: 'Swamp', impassable: true },
  23: { name: 'Swamp', impassable: true },
  24: { name: 'Craggy Peaks', bonus: 3, product: 'Chainmail', building: 'Armourer' },
  25: {
    name: 'Bleak Mountains', bonus: 2, product: 'Diplomatic Units', building: 'Finishing School',
  },
  26: { name: 'Lonely Peaks', bonus: 1, product: 'Platesteel', building: 'Plate Forger' },
  27: { name: 'Sharp Crags', bonus: 3, product: 'Swords', building: 'Bladesmith' },
  28: { name: 'Treacherous Mountains', bonus: 2, product: 'Beer', building: "Brewer's Yard" },
  29: { name: 'Mountains', bonus: 1, product: 'Swords', building: 'Bladesmith' },
  30: {
    name: 'Scrubland', bonus: 1, product: 'Diplomatic Units', building: 'Finishing School',
  },
  31: { name: 'Clearing', bonus: 1, product: 'Ranged Units', building: 'Target Range' },
  32: { name: 'Tundra', bonus: 1, product: 'Spear Units', building: 'Training Ground' },
  33: { name: 'Open Plains', bonus: 1, product: 'Cavalry Units', building: 'Jousting Yard' },
  34: { name: 'Moor', bonus: 1, product: 'Infantry Units', building: 'Military Academy' },
  35: { name: 'Plains' },
  36: { name: 'Plains' },
  37: { name: 'Plains' },
  38: { name: 'Plains' },
  39: { name: 'Plains' },
  46: { name: 'Abundant Quarry', bonus: 3, product: 'Platesteel', building: 'Plate Forger' },
  47: { name: 'Rich Quarry', bonus: 2, product: 'Infantry Units', building: 'Military Academy' },
  48: { name: 'Wooded Quarry', bonus: 1, product: 'Siege Blocks', building: 'Engineering Yard' },
  49: { name: 'Rocky Outcrop', bonus: 3, product: 'Horses', building: 'Farrier' },
  50: { name: 'Landslip', bonus: 2, product: 'Siege Units', building: 'Assembly Yard' },
  51: { name: 'Stony Ground', bonus: 1, product: 'Chainmail', building: 'Armourer' },
  52: { name: 'Thick Forest', bonus: 3, product: 'Bows', building: 'Bowyer' },
  53: { name: 'Dense Forest', bonus: 2, product: 'Ranged Units', building: 'Target Range' },
  54: { name: 'Forested Hilltop', bonus: 1, product: 'Bows', building: 'Bowyer' },
  55: { name: 'Wooded Land', bonus: 3, product: 'Spears', building: 'Poleturner' },
  56: { name: 'Wooded Glade', bonus: 2, product: 'Spear Units', building: 'Training Ground' },
  57: { name: 'Light Woods', bonus: 1, product: 'Spears', building: 'Poleturner' },
  58: { name: 'Plains' },
  // An NPC settlement and the ring of eight it occupies. Neither is claimable —
  // the centre carries no `sov` and the ring is `imp` — so these are here to
  // keep a settlement in view from reporting nine unidentified IDs per scan.
  //
  // The ring's `rs` is the one place a land tile does NOT sum to 25: it keeps
  // its terrain ratings with food forced to 0, summing to 20. Nothing reads it,
  // but do not take it as a counterexample to the 25-plot rule.
  // Rivers. Food is read from `rs` like any other tile; there is no descriptor
  // bonus on top of it, so a river is worth exactly its food rating.
  59: { name: 'Fresh Water', water: true },
  66: { name: 'NPC settlement', settlement: true },
  67: { name: 'NPC settlement grounds', impassable: true },
  80: { name: 'Drumlin' },

  // The glacial set. Read off tiles in a b:2 region whose land does NOT sum to
  // 25 — every one of these totals 0 to 15, against the 25 every temperate tile
  // spends. That sum is the test for which family a tile belongs to.
  //
  // Five of these repeat a (building, bonus) rung a temperate terrain already
  // holds, which is why descriptorCollisions is scoped by family rather than
  // run over the whole table. Two of them, Nunatak and Moraine, fill rungs that
  // were vacant outright.
  68: { name: 'Barren Wastes', bonus: 3, product: 'Spears', building: 'Poleturner', family: 'glacial' },
  69: { name: 'Glacier', family: 'glacial' },
  70: { name: 'Frozen Ground', family: 'glacial' },
  71: { name: 'Nunatak', bonus: 3, product: 'Siege Units', building: 'Assembly Yard', family: 'glacial' },
  72: {
    name: 'Scoured Bedrock', bonus: 2, product: 'Infantry Units', building: 'Military Academy',
    family: 'glacial',
  },
  74: { name: 'Glacial Crevasse', family: 'glacial' },
  77: {
    name: 'Rogen Moraine', bonus: 1, product: 'Ranged Units', building: 'Target Range',
    family: 'glacial',
  },
  78: { name: 'Moraine', bonus: 2, product: 'Chainmail', building: 'Armourer', family: 'glacial' },
  79: { name: 'Kame', family: 'glacial' },
  81: {
    name: 'Roche Moutonnee', bonus: 1, product: 'Chainmail', building: 'Armourer',
    family: 'glacial',
  },
  // Shares its name with i:30, which is temperate and grants a Finishing School
  // bonus. Same name, different family, different answer — recorded as read.
  83: { name: 'Scrubland', family: 'glacial' },
  84: { name: 'Permafrost', family: 'glacial' },
  85: { name: 'Icy Moss', family: 'glacial' },
  86: { name: 'Frosty Heath', family: 'glacial' },
  87: {
    name: 'Lichen', bonus: 1, product: 'Livestock', building: 'Cattle Rancher', family: 'glacial',
  },
};

// The IDs in the 40–45 and 100+ ranges are node classes rather than fixed
// terrain: i:40 appears as an abandoned mill, a quarry and a lumberyard within
// one payload, and i:43 and i:45 vary the same way. Their `rs` is the only
// reliable thing about them, so they are named as a class and carry no bonus.
// Listing them keeps them out of the unidentified log, where they would suggest
// a row is missing that cannot be written.
export const NODE_CLASS_TERRAIN = new Set([
  40, 41, 42, 43, 44, 45,
  88,
  123, 124, 127, 128, 139, 143, 144, 145, 146, 148, 152, 153, 156, 209, 211, 213, 214, 217,
]);

const SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));

/**
 * What terrain `i` grants, or null if nothing has identified it.
 *
 * `sovKey` is the structure the bonus scales with, and `conditional` says there
 * is no such structure in the table. Nothing is conditional today — every
 * building the descriptors name is a Production Structure — but the table is
 * read off the game, so a row naming something unknown has to be visible rather
 * than resolve to a silent null.
 */
export function descriptorFor(i) {
  const entry = TERRAIN_DESCRIPTORS[i];
  if (entry) {
    const sov = entry.building ? SOV_STRUCTURE_BY_NAME.get(entry.building) : undefined;
    return { ...entry, i, sovKey: sov?.key ?? null, conditional: !!entry.building && !sov };
  }
  if (NODE_CLASS_TERRAIN.has(i)) {
    return { i, name: 'Resource node', nodeClass: true, conditional: false, sovKey: null };
  }
  return null;
}

/**
 * Every (building, bonus) pair is one terrain per FAMILY and one only.
 *
 * Each building runs a 1/2/3% ladder, so two terrains on one rung means a row
 * was mis-transcribed — which is what three inherited rows turned out to be,
 * and why this is checked rather than trusted. But the ladder runs once per
 * family: five glacial terrains repeat a rung a temperate terrain holds, and
 * the two are told apart by whether `rs` sums to 25. Scoping by family is what
 * keeps the check meaningful instead of permanently red.
 *
 * Known conflicts carry `disputed` and are skipped; anything added later that
 * collides fails here instead of quietly shadowing the row it duplicates.
 *
 * @returns {string[]} the collisions found, empty when the table is sound.
 */
export function descriptorCollisions(table = TERRAIN_DESCRIPTORS) {
  const seen = new Map();
  const clashes = [];
  for (const [i, entry] of Object.entries(table)) {
    if (!entry.building || entry.disputed) continue;
    // Scoped by family: a glacial terrain repeating a temperate terrain's rung
    // is the observed pattern, not a mistake. Within one family it still is.
    const rung = `${entry.family ?? 'temperate'}|${entry.building} +${entry.bonus}%`;
    if (seen.has(rung)) clashes.push(`i:${seen.get(rung)} and i:${i} both grant ${rung}`);
    else seen.set(rung, i);
  }
  return clashes;
}

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

// [V] The prestige production boost, in additive points on the production
// percentage: the Famine Management description has prestige cumulative with
// spells and sovereignty, which is what makes it points and not a multiplier.
// The figure is the account owner's, correcting the +25 first assumed here.
// Half a booster building, and worth its face value in tax headroom.
export const PRESTIGE_PRODUCTION_BONUS = 20;

// What it can be switched on for — every production the tool models. Food's
// points are added inside computeBOther rather than here, so B_other stays the
// one total of the city's food bonuses and nothing can count them twice.
export const PRESTIGE_KEYS = [...BASIC_RESOURCES, 'food', 'research'];

// What a minimum surplus can be asked for — the four basic resources plus food
// and research, which are produced differently but take a floor the same way.
export const MINIMUM_KEYS = [...BASIC_RESOURCES, 'food', 'research'];

// [V] Food consumed per hour, which the user reads off their own town. Only a
// starting figure — every city differs, so the number itself is the input.
export const DEFAULT_CITY_CONSUMPTION = 30800;

// [F] Additive food bonuses, in points on the production percentage.
export const FLOUR_MILL_L20 = 40;
export const NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];
export const FAMINE_MANAGEMENT = 10;  // capital, >=10 cities
export const SOIL_ENRICHMENT = 15;    // capital, >=30 cities

export const ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5; // [F]
export const OVERFLOWING_INSIGHT_FACTOR = 1.5;   // [?] unconfirmed

// [?] Library base RP/hr at L20 is NOT recorded anywhere. This placeholder is
// chosen to make R_ref come out at 1,600 with Allembine at Library 20 and no
// Insight, which is the figure the rest of the model was worked against. The
// rpCalibration override is the reliable path; treat this as a default to be
// replaced, not a fact.
export const LIBRARY_BASE_RP_L20 = 1500;

/** Plot order matches the payload's `rs` string: "wood|clay|iron|stone|food". */
export const PLOT_KEYS = ['wood', 'clay', 'iron', 'stone', 'food'];

/** Every land tile has 25 plots, so an allocation has to spend exactly 25. */
export const PLOT_TOTAL = 25;

export const DEFAULT_SETTINGS = {
  tMin: 50,
  plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 }, // must sum to 25
  cityConsumption: DEFAULT_CITY_CONSUMPTION,
  flourMill: true,
  // The 22,400 baseline the model is calibrated against needs 18.89 points on
  // top of the Flour Mill, which is Nature's Bounty at two retreats to within
  // 0.7%. Defaulting the spell on rather than carrying the same 20 points as a
  // nameless constant keeps B_other at 60 while making the assumption one the
  // user can see and untick — and stops it being counted twice.
  naturesBounty: true,
  geomancerRetreats: 2,
  cityCount: 1,
  isCapital: false,
  libraryLevel: 20,
  allembine: true,
  overflowingInsight: false,
  // { observedRpPerHour, atTax, prestige } back-solves R_ref. The prestige flag
  // describes the reading rather than the city: what is divided out has to be the
  // multiplier that was running when the figure was read.
  rpCalibration: null,
  // Which of the four booster buildings the city has at level 20. Each is worth
  // RESOURCE_BOOSTER_BONUS points against that resource's ceiling.
  resourceBoosters: { wood: false, clay: false, iron: false, stone: false },
  // { observedPerHour, atTax, plots, booster, prestige } back-solves the
  // per-plot yield, the way rpCalibration back-solves R_ref. Null uses
  // BASIC_YIELD_L20.
  resourceCalibration: null,
  // Surplus per hour the plan may not touch, per resource. A city sitting exactly
  // on T_res puts its whole scarcest resource into upkeep and can never build or
  // trade in it again — this is where the user says how much to hold back. Zero
  // is the ceiling as it was. Food is counted above what the city eats and
  // research above what the claims cost.
  resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 0, food: 0, research: 0 },
  // Which productions the boost is running on, PRESTIGE_PRODUCTION_BONUS points
  // each.
  prestige: {
    wood: false, clay: false, iron: false, stone: false, food: false, research: false,
  },
  chancery: false,
  rClaim: 2,
  maxBuildings: 20,
  dOther: 10,
  dOwn: 3,
  // Which military structure to place, by key into SOV_STRUCTURES. How many, at
  // what levels and on which tiles is the engine's answer, not a setting: food
  // is planned first and military sovereignty takes only the headroom the food
  // plan leaves behind. Null asks for none, which is a food-only scan.
  milsovStructure: null,
  // Least production bonus worth listing a site for, in percent. Zero lists
  // every site whatever it fits. This filters; it never changes a plan — the
  // amount of military a site hosts is what its food plan leaves free.
  milsovMinBonus: 0,
  ownClaimsAvailable: false,
  allianceClaimsAvailable: false,
};
