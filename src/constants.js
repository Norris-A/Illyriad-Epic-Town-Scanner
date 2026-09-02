// Game constants, each carrying how well it is known: [V] verified in game, [F]
// stated by a reliable source, [D] derived from one, [?] assumed. The markers
// are here deliberately — when output looks wrong, the [F] and [?] values are
// what to re-check first.

// [F] The world's extent, inclusive. Tiles beyond it are not unloaded map data —
// they do not exist, so a claim ring overlapping an edge is genuinely smaller
// rather than unreadable.
export const WORLD_MIN_X = -1000;
export const WORLD_MAX_X = 1000;
export const WORLD_MIN_Y = -3300;
export const WORLD_MAX_Y = 1000;

export const PRODUCTION_BASE = 125;        // [V] production% = 125 - tax
export const FARM_YIELD_L20 = 2014;        // [V] food/hr per farm plot at L20
export const GOLD_PER_TAX_POP = 0.04;      // [F] Gold_income = 0.04 * T * Pop

export const CLAIM_RP_PER_LEVEL_DISTANCE = 10;    // [V] RP/hr = 10 * L * d
export const CLAIM_GOLD_PER_LEVEL_DISTANCE = 100; // [V] gold is exactly 10x RP

// [V] The game quantises the claim distance to two decimals before multiplying,
// so a diagonal is charged at 1.41 rather than 1.414214 and a (2,1) tile at 2.24.
// Rounding is half-up, and it lands on the distance rather than on the finished
// cost: a (2,1) claim at level 2 costs 448 gold, where rounding the product would
// give 447. Level then multiplies exactly, with no further rounding — a level 5
// diagonal costs five times the level 1 figure.
export const CLAIM_DISTANCE_DECIMALS = 2;

// [F] -40% at Chancery level 20.
// [?] Whether the discount lands before or after the distance quantisation above
// is unmeasured, as is whether it reaches claims above level 1 — sources describe
// it through a level 1 example. Applied here to the finished cost.
export const CHANCERY_FACTOR = 0.6;

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
//
// A tile whose terrain descriptor names the structure being placed raises this
// rate for that tile: a Training Ground on a Wooded Glade (+2% Spear Units per
// level of Training Ground) runs at 7 points a level, not 5. The descriptor is
// per BUILDING level, the same footing as this table, so the two simply add.
// See descriptorBonus in scoring.js — the reported bonus accounts for it; tile
// SELECTION still runs nearest-first.
export const MILSOV_BONUS_BY_LEVEL = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 };
export const MILSOV_BONUS_PER_LEVEL = 5; // [F] the linear coefficient itself

// [F] Every sovereignty structure, and the three fields the rest of the tool
// reads off them. `type` is the whole of the arithmetic: a 'production'
// structure pays MILSOV_UPKEEP_BY_LEVEL every hour, a 'resource' one pays
// nothing beyond its claim's RP and gold. `boosts` is what a resource structure
// raises. `military` marks the five the picker offers, which is a smaller set
// than the Production Structures — see MILSOV_STRUCTURES. The table is
// complete; what the form offers is a filter over it rather than a second list
// to keep in step.
export const SOV_STRUCTURES = [
  { key: 'trainingGround', name: 'Training Ground', type: 'production', military: true },
  { key: 'targetRange', name: 'Target Range', type: 'production', military: true },
  { key: 'militaryAcademy', name: 'Military Academy', type: 'production', military: true },
  { key: 'joustingYard', name: 'Jousting Yard', type: 'production', military: true },
  { key: 'assemblyYard', name: 'Assembly Yard', type: 'production', military: true },
  // The crafting half of the Production Structures. Same hourly ladder as the
  // military five — the class is about upkeep, not about what is made — and the
  // terrain descriptors name these, so they have to be here or a descriptor
  // reads as a bonus riding on something the tool does not know about.
  { key: 'cattleRancher', name: 'Cattle Rancher', type: 'production' },
  { key: 'bladesmith', name: 'Bladesmith', type: 'production' },
  { key: 'renderer', name: 'Renderer', type: 'production' },
  { key: 'farrier', name: 'Farrier', type: 'production' },
  { key: 'bowyer', name: 'Bowyer', type: 'production' },
  { key: 'poleturner', name: 'Poleturner', type: 'production' },
  { key: 'bridlemaker', name: 'Bridlemaker', type: 'production' },
  { key: 'plateForger', name: 'Plate Forger', type: 'production' },
  { key: 'armourer', name: 'Armourer', type: 'production' },
  { key: 'engineeringYard', name: 'Engineering Yard', type: 'production' },
  { key: 'papermill', name: 'Papermill', type: 'production' },
  { key: 'brewersYard', name: "Brewer's Yard", type: 'production' },
  { key: 'finishingSchool', name: 'Finishing School', type: 'production' },
  { key: 'loggingCamp', name: 'Logging Camp', type: 'resource', boosts: 'wood' },
  { key: 'earthworks', name: 'Earthworks', type: 'resource', boosts: 'clay' },
  { key: 'mineshaft', name: 'Mineshaft', type: 'resource', boosts: 'iron' },
  { key: 'gravelPit', name: 'Gravel Pit', type: 'resource', boosts: 'stone' },
  { key: 'farmstead', name: 'Farmstead', type: 'resource', boosts: 'food' },
  { key: 'fishery', name: 'Fishery', type: 'resource', boosts: 'food' },
];

export const SOV_STRUCTURE_BY_KEY = Object.fromEntries(SOV_STRUCTURES.map((s) => [s.key, s]));

// What the form offers for military sovereignty: the five military structures.
//
// Not every Production Structure. The thirteen crafting ones are in the table
// above because the terrain descriptors name them and the engine has to know
// what they cost — but offering eighteen entries made the picker a catalogue,
// and the question it asks is which unit the city is being built to make.
//
// The engine chooses how many buildings to place and at what levels, by
// maximising production bonus against the hourly upkeep they cost.
//
// A Resource Structure pays its claim's RP and gold like every other claim — it
// is not a free tile — but it pays no hourly wood/clay/iron/stone bill. It is
// costed correctly wherever it appears and never placed automatically: the host
// tile's resource rating, which is what would make one worth claiming, is not
// scored, so the planner has no basis to tell a good tile from a bad one. The
// Farmstead and Fishery are out for a second reason: the food plan is what
// places those.
export const MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.military);

// A plan that names no structure, or names one this table does not know, is
// charged as a Production Structure: that is the charged case, so the fallback
// errs toward billing rather than toward a free claim.
export const DEFAULT_SOV_STRUCTURE = 'trainingGround';

// Sovereignty levels are written in Roman numerals wherever a level is shown.
export const SOV_LEVEL_ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// [V] What each terrain type `i` grants a claim built on it, from the account
// owner's own reading of the tiles. A `bonus` is scored, but only on a tile
// hosting the very structure its `building` names — see descriptorBonus. On
// every other tile it is a column and a flag.
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
// Two terrains can grant the same building the same bonus. That was assumed
// impossible and is not — see sharedRungs.
//
// `disputed` marks a row read once and not yet confirmed. Nothing carries it:
// every row here has been read off a tile, and the twenty-two the in-game
// harvest covered all matched what was already written down.
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
  19: { name: 'Loch', water: true },
  20: { name: 'Volcanic Peak', impassable: true },
  21: { name: 'Fiery Mountain', impassable: true },
  22: { name: 'Canyon', impassable: true },
  23: { name: 'Swampland', impassable: true },
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
  40: { name: 'Standing Stones' },
  42: { name: 'Abandoned Mineshaft' },
  43: { name: 'Ruined Tower' },
  44: { name: 'Ancient Forest' },
  45: { name: 'Dolmen' },
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
  // Rivers. Food is read from `rs` like any other tile; there is no descriptor
  // bonus on top of it, so a river is worth exactly its food rating.
  59: { name: 'Fresh Water', water: true },
  // An NPC settlement and the ring of eight it occupies. Neither is claimable —
  // the centre carries no `sov` and the ring is `imp` — so these are here to
  // keep a settlement in view from reporting nine unidentified IDs per scan.
  //
  // The ring's `rs` is the one place a land tile does NOT sum to 25: it keeps
  // its terrain ratings with food forced to 0, summing to 20. Nothing reads it,
  // but do not take it as a counterexample to the 25-plot rule.
  66: { name: 'Faction Hub', settlement: true },
  67: { name: 'Forbidden', impassable: true },
  80: { name: 'Drumlin' },

  // The glacial terrains, read off tiles in a b:2 region. Their plots total 0
  // to 15 where most land totals 25, so they are poor ground whatever they
  // grant — which is what the scanner reads, the bonus being a column.
  68: { name: 'Barren Wastes', bonus: 3, product: 'Spears', building: 'Poleturner' },
  69: { name: 'Glacier' },
  70: { name: 'Frozen Ground' },
  // The one military rung above +2 anywhere in the table. Eight other military
  // readings — Training Ground, Target Range, Military Academy and Jousting
  // Yard, +1 and +2 each — all stop at +2, while crafting rungs reach +3
  // freely. Read by eye before the in-game harvester existed, and the game
  // prints "Siege Block production" for the Engineering Yard against "Siege
  // unit production" for the Assembly Yard, which is an easy conflation.
  // Marked until a Nunatak is hovered and it is read again.
  71: {
    name: 'Nunatak', bonus: 3, product: 'Siege Units', building: 'Assembly Yard',
    disputed: 'only military rung above +2; re-read against Siege Block',
  },
  72: {
    name: 'Scoured Bedrock', bonus: 2, product: 'Infantry Units', building: 'Military Academy',
  },
  73: { name: 'Icefield' },
  74: { name: 'Glacial Crevasse' },
  75: { name: 'Ice cave' },
  77: {
    name: 'Rogen Moraine', bonus: 1, product: 'Ranged Units', building: 'Target Range',
  },
  78: { name: 'Moraine', bonus: 2, product: 'Chainmail', building: 'Armourer' },
  79: { name: 'Kame' },
  81: {
    name: 'Roche Moutonnee', bonus: 1, product: 'Chainmail', building: 'Armourer',
  },
  82: { name: 'Ice Holes' },
  // Shares its name with i:30, which grants Finishing School +1%. Same name,
  // different terrain, different answer — the id identifies a terrain and the
  // name does not.
  83: { name: 'Scrubland' },
  84: { name: 'Permafrost' },
  85: { name: 'Icy Moss' },
  86: { name: 'Frosty Heath' },
  87: {
    name: 'Lichen', bonus: 1, product: 'Livestock', building: 'Cattle Rancher',
  },

  // The wetland terrains, read off a b:16 region. Their plots total 10 to 17,
  // so they are poor ground too.
  //
  // Marsh grants Poleturner +3%, which i:55 Wooded Land also holds. That was
  // taken as evidence for a per-family ladder; it is simply a shared rung, of
  // which there are several — see sharedRungs.
  //
  // i:89 is the only Swamp in the table. The two tiles this project called
  // Swamps for months are i:22 Canyon and i:23 Swampland — both impassable,
  // both named from sprite context rather than from the game, and both wrong
  // until the client's own table settled it.
  89: { name: 'Swamp', bonus: 2, product: 'Bows', building: 'Bowyer' },
  90: { name: 'Marsh', bonus: 3, product: 'Spears', building: 'Poleturner' },
  91: { name: 'Bog' },
  92: { name: 'Mire' },

  // The rainforests, all read in the Jungle biome. Their plots total 22 or 23,
  // which is the counterexample to "land always sums to 25".
  //
  // Thick Rainforest grants Poleturner +3%, a rung three other terrains also
  // hold. Rainforest Hilltop grants Papermill +3%, which i:6 Rich Clay Seam
  // holds — and both were read in the SAME biome, which is what finally
  // disproved the one-terrain-per-rung rule rather than rescoping it again.
  41: { name: 'Barrow' },
  95: { name: 'Playa' },
  101: { name: 'Cactus', bonus: 3, product: 'Horses', building: 'Farrier' },
  103: { name: 'Tropical Foliage', bonus: 1, product: 'Bows', building: 'Bowyer' },
  104: { name: 'Light Tropical Cover' },
  105: { name: 'Palm Trees', bonus: 1, product: 'Spears', building: 'Poleturner' },
  106: { name: 'Dense Foliage', bonus: 1, product: 'Books', building: 'Papermill' },
  107: { name: 'Dense Tropical Forest', bonus: 2, product: 'Bows', building: 'Bowyer' },
  108: { name: 'Tropical Hilltop' },
  109: { name: 'Monsoon Jungle', bonus: 2, product: 'Spear Units', building: 'Training Ground' },
  110: { name: 'Jungle' },
  111: { name: 'Damp Jungle' },
  112: { name: 'Dense Jungle', bonus: 2, product: 'Spears', building: 'Poleturner' },
  113: { name: 'Dense Monsoon Jungle', bonus: 2, product: 'Books', building: 'Papermill' },
  114: { name: 'Monsoon Hilltop' },
  115: { name: 'Light Rainforest' },
  // Holds Bowyer +3% alongside i:52 Thick Forest — the second rung read twice
  // in the Jungle biome, after Papermill +3% on i:6 and i:120.
  116: { name: 'Rainforest Canopy', bonus: 3, product: 'Bows', building: 'Bowyer' },
  117: { name: 'Rainforest' },
  118: { name: 'Dense Rainforest' },
  119: { name: 'Thick Rainforest', bonus: 3, product: 'Spears', building: 'Poleturner' },
  // Holds Papermill +3% alongside i:6 Rich Clay Seam, in the same biome. This
  // is the row that ended the one-terrain-per-rung rule.
  120: { name: 'Rainforest Hilltop', bonus: 3, product: 'Books', building: 'Papermill' },
  121: { name: 'Succulents' },
  122: { name: 'Dry tundra' },
  124: { name: 'Faerie Ring' },
  127: { name: 'Stone Circle' },
  128: { name: 'Mountain Cave' },
  129: { name: 'Pyramids' },
  130: { name: 'Sphinx' },
  139: { name: 'Blessed Oak' },
  142: { name: 'Mausoleum' },
  143: { name: 'Dark Forest' },
  144: { name: 'Ancient Lair' },
  146: { name: 'Deserted Wayhouse' },
  147: { name: 'Rockhewn Monastery' },
  150: { name: 'Hidden Temple' },
  151: { name: 'Place of High Sacrifice' },
  152: { name: 'Crooked House' },
  153: { name: 'Deserted Monastery' },
  156: { name: 'Abandoned Campsite' },
  205: { name: 'Glassy Mountain' },
  209: { name: 'Ancient Graveyard' },
  211: { name: 'Dormant Portal' },
  213: { name: 'Fortified Hostel' },
  214: { name: 'Lawstones' },
  215: { name: 'Sacrificial Altar' },
  217: { name: 'Weeping Willow' },
  222: { name: 'Head Statue' },
  223: { name: 'Jungle Standing Stones' },
  224: { name: 'Shattered Head' },

  // The fifty-eight the world data file said were still unread, worked through
  // in one pass. Five of them grant something; the rest are answers of the
  // other kind. With these in, every terrain the world actually contains has a
  // row here — the forty-one still absent are named by the client and appear
  // nowhere in the world, so there is no tile to go and read.

  // Three of the five reproduce a same-named terrain exactly: i:63 matches
  // i:57 Light Woods, i:64 matches i:49 Rocky Outcrop, i:65 matches i:9 Clay
  // Seam, rung for rung. That is NOT the name determining the answer — i:30 and
  // i:83 are both Scrubland and disagree, and so do i:88 and i:195, both
  // Petrified Forest. Three names matched and two did not.
  3: { name: 'Plains' },
  63: { name: 'Light Woods', bonus: 1, product: 'Spears', building: 'Poleturner' },
  64: { name: 'Rocky Outcrop', bonus: 3, product: 'Horses', building: 'Farrier' },
  65: { name: 'Clay Seam', bonus: 3, product: 'Leather Armour', building: 'Renderer' },
  76: { name: 'Tarn' },
  88: { name: 'Petrified Forest' },

  // The desert. Two of the eight grant anything: the Oasis, and the Mesa, whose
  // Plate Forger +3% i:46 Abundant Quarry also holds. The gravel and stone
  // flats — Yardang, Hamada, Reg, Wadi — grant nothing despite rating as high
  // as 10 plots between them, so a plot total does not predict a bonus.
  93: { name: 'Sand Dune' },
  94: { name: 'Oasis', bonus: 3, product: 'Livestock', building: 'Cattle Rancher' },
  96: { name: 'Yardang' },
  97: { name: 'Mesa', bonus: 3, product: 'Platesteel', building: 'Plate Forger' },
  98: { name: 'Rocky Mountain' },
  99: { name: 'Hamada (Stone Plateau)' },
  100: { name: 'Reg (Gravel Plain)' },
  102: { name: 'Wadi' },

  // Open water and the shoreline. The four water rows rate zero on all five and
  // are flagged like i:18, i:19 and i:59; the four shore rows rate food alone,
  // 5 to 10 of it, and are worth exactly that food and no bonus — the same
  // answer a river gets.
  60: { name: 'Tidal Water', water: true },
  61: { name: 'Shallow Salt Water', water: true },
  62: { name: 'Ocean', water: true },
  172: { name: 'Bankside' },
  173: { name: 'Beach' },
  174: { name: 'Shallow Coastline' },
  175: { name: 'Coast' },
  198: { name: 'Dead Water', water: true },

  // The volcanic terrains. All nine rate zero on all five plots, which reads
  // like the impassable rows and is not: their combat class is Obsidian
  // Mountains, and only i:20-23 are class Impassable anywhere in the client's
  // table. So this is walkable ground that grows nothing — not a wall.
  //
  // isWaterTile tests wood+clay+iron+stone === 0, which these satisfy, so the
  // payload calls them water. They are not flagged `water` here, because they
  // are not — and nothing reads this flag, so the two do not have to agree.
  199: { name: 'Obsidian Mountain' },
  200: { name: 'Glassy Crag' },
  201: { name: 'Volcanic Mountain' },
  202: { name: 'Lava Peak' },
  203: { name: 'Active Peak' },
  204: { name: 'Emerging Mountaintop' },
  206: { name: 'Lava Pool' },
  207: { name: 'Magma Rift' },

  // The dead forests, all three rating 7|3|3|2|3 — one plot signature across
  // three names, and none of them grants anything. i:195 shares its name with
  // i:88, which rates 0|3|5|4|3: a third same-name pair, after the Scrublands
  // and the Swamps.
  194: { name: 'Scorched Forest' },
  195: { name: 'Petrified Forest' },
  196: { name: 'Deadvlei Forest' },

  // Landmarks and sites, twenty-five of them, and not one grants anything —
  // which is what every landmark already in the table says too, from Standing
  // Stones to Mausoleum. Their plots vary tile to tile where most terrain's are
  // fixed, so a landmark is worth its own ratings and nothing more. The four
  // Altars answer the same: fixed single tiles, one per element, granting
  // nothing.
  123: { name: 'Geyser' },
  131: { name: 'Obelisk' },
  135: { name: 'Heroic Human Statue' },
  145: { name: 'Abandoned Lodge' },
  148: { name: 'House of the Spirits' },
  149: { name: 'Forgotten Temple' },
  155: { name: 'Gypsy Campsite' },
  157: { name: 'Fortune Teller' },
  158: { name: 'Fortress of Shadows' },
  161: { name: 'Temple of Reason' },
  162: { name: 'Steamtastic Brewery' },
  163: { name: 'Brewery Outbuildings' },
  164: { name: 'Cylindroconical Vessels' },
  167: { name: 'Altar of Water' },
  168: { name: 'Altar of Fire' },
  169: { name: 'Altar of Air' },
  170: { name: 'Altar of Earth' },
  197: { name: 'Parched Bones' },
  208: { name: 'Abandoned Lair' },
  210: { name: 'Broken Tower' },
  212: { name: 'Fallen Dwarfhold' },
  216: { name: 'Tiki Pole' },
  218: { name: 'Crumbling Lighthouse' },
  219: { name: "Fisherman's Hut" },
  221: { name: 'Ferry Post' },
};

// [V] The client's own terrain table, read out of `window.terrain` on the map
// page by the account owner. Index is `i`; each row is [name, combat class].
//
// Independently confirmed against the server's `datafile_terrain.xml`, which
// lists the same 228 ids with the same names and no disagreement anywhere. The
// XML has no i:4, which the client calls 'Town' — so Town is something the
// client draws, not terrain the world is made of.
// Index 0 is unused and holds an explicit null, so that every other index is
// the terrain ID itself rather than one off it.
//
// This is the game's data rather than ours, so it settles every NAME — nine
// rows here corrected hand-read ones, including four that had been guessed from
// sprite context. What it does NOT carry is the production bonus, which appears
// only in the tile's in-game descriptor. Names come from here; bonuses come from
// TERRAIN_DESCRIPTORS, which is still filled in by hand a tile at a time.
//
// The combat class is not used by the scanner. It is kept because it is the
// only record of it anywhere, and because it independently confirms the
// impassable rows: i:20-23 are the four the payload flags `imp`.
//
// Two names carry trailing spaces in the client ('Wadi ', 'Tropical Hilltop ')
// and are trimmed here.
export const TERRAIN_NAMES = [
  null,                                             // 0 - unused; the client's array starts at 1
  ['Plains', 'Plains'],                             // 1
  ['Plains', 'Plains'],                             // 2
  ['Plains', 'Plains'],                             // 3
  ['Town', 'Buildings'],                            // 4
  ['Plains', 'Plains'],                             // 5
  ['Rich Clay Seam', 'Large Hill'],                 // 6
  ['Abundant Clay', 'Large Hill'],                  // 7
  ['Exposed Clay', 'Small Hill'],                   // 8
  ['Clay Seam', 'Small Hill'],                      // 9
  ['Turned Clay', 'Large Hill'],                    // 10
  ['Heavy Clay Seam', 'Small Hill'],                // 11
  ['Abundant Crops', 'Plains'],                     // 12
  ['Bountiful Land', 'Plains'],                     // 13
  ['Fertile Pasture', 'Plains'],                    // 14
  ['Fertile Orchard', 'Plains'],                    // 15
  ['Alluvial Plain', 'Plains'],                     // 16
  ['Fertile Ground', 'Plains'],                     // 17
  ['Lake', 'Small Hill'],                           // 18
  ['Loch', 'Small Hill'],                           // 19
  ['Volcanic Peak', 'Impassable'],                  // 20
  ['Fiery Mountain', 'Impassable'],                 // 21
  ['Canyon', 'Impassable'],                         // 22
  ['Swampland', 'Impassable'],                      // 23
  ['Craggy Peaks', 'Large Mountain'],               // 24
  ['Bleak Mountains', 'Large Mountain'],            // 25
  ['Lonely Peaks', 'Large Mountain'],               // 26
  ['Sharp Crags', 'Small Mountain'],                // 27
  ['Treacherous Mountains', 'Small Mountain'],      // 28
  ['Mountains', 'Small Mountain'],                  // 29
  ['Scrubland', 'Plains'],                          // 30
  ['Clearing', 'Plains'],                           // 31
  ['Tundra', 'Plains'],                             // 32
  ['Open Plains', 'Plains'],                        // 33
  ['Moor', 'Plains'],                               // 34
  ['Plains', 'Plains'],                             // 35
  ['Plains', 'Plains'],                             // 36
  ['Plains', 'Plains'],                             // 37
  ['Plains', 'Plains'],                             // 38
  ['Plains', 'Plains'],                             // 39
  ['Standing Stones', 'Plains'],                    // 40
  ['Barrow', 'Small Hill'],                         // 41
  ['Abandoned Mineshaft', 'Large Mountain'],        // 42
  ['Ruined Tower', 'Buildings'],                    // 43
  ['Ancient Forest', 'Large Forest'],               // 44
  ['Dolmen', 'Plains'],                             // 45
  ['Abundant Quarry', 'Small Mountain'],            // 46
  ['Rich Quarry', 'Small Mountain'],                // 47
  ['Wooded Quarry', 'Large Hill'],                  // 48
  ['Rocky Outcrop', 'Large Hill'],                  // 49
  ['Landslip', 'Small Hill'],                       // 50
  ['Stony Ground', 'Large Hill'],                   // 51
  ['Thick Forest', 'Large Forest'],                 // 52
  ['Dense Forest', 'Large Forest'],                 // 53
  ['Forested Hilltop', 'Large Forest'],             // 54
  ['Wooded Land', 'Small Forest'],                  // 55
  ['Wooded Glade', 'Small Forest'],                 // 56
  ['Light Woods', 'Small Forest'],                  // 57
  ['Plains', 'Plains'],                             // 58
  ['Fresh Water', 'Fresh Water'],                   // 59
  ['Tidal Water', 'Tidal Water'],                   // 60
  ['Shallow Salt Water', 'Shallow Salt Water'],     // 61
  ['Ocean', 'Ocean'],                               // 62
  ['Light Woods', 'Small Forest'],                  // 63
  ['Rocky Outcrop', 'Large Hill'],                  // 64
  ['Clay Seam', 'Small Hill'],                      // 65
  ['Faction Hub', 'Buildings'],                     // 66
  ['Forbidden', 'Buildings'],                       // 67
  ['Barren Wastes', 'Plains'],                      // 68
  ['Glacier', 'Small Hill'],                        // 69
  ['Frozen Ground', 'Plains'],                      // 70
  ['Nunatak', 'Small Mountain'],                    // 71
  ['Scoured Bedrock', 'Large Hill'],                // 72
  ['Icefield', 'Plains'],                           // 73
  ['Glacial Crevasse', 'Large Hill'],               // 74
  ['Ice cave', 'Small Mountain'],                   // 75
  ['Tarn', 'Small Hill'],                           // 76
  ['Rogen Moraine', 'Large Hill'],                  // 77
  ['Moraine', 'Small Mountain'],                    // 78
  ['Kame', 'Small Hill'],                           // 79
  ['Drumlin', 'Large Hill'],                        // 80
  ['Roche Moutonnee', 'Small Mountain'],            // 81
  ['Ice Holes', 'Plains'],                          // 82
  ['Scrubland', 'Plains'],                          // 83
  ['Permafrost', 'Plains'],                         // 84
  ['Icy Moss', 'Plains'],                           // 85
  ['Frosty Heath', 'Plains'],                       // 86
  ['Lichen', 'Plains'],                             // 87
  ['Petrified Forest', 'Small Forest'],             // 88
  ['Swamp', 'Small Hill'],                          // 89
  ['Marsh', 'Large Hill'],                          // 90
  ['Bog', 'Small Mountain'],                        // 91
  ['Mire', 'Large Mountain'],                       // 92
  ['Sand Dune', 'Large Hill'],                      // 93
  ['Oasis', 'Small Forest'],                        // 94
  ['Playa', 'Plains'],                              // 95
  ['Yardang', 'Small Hill'],                        // 96
  ['Mesa', 'Large Mountain'],                       // 97
  ['Rocky Mountain', 'Small Mountain'],             // 98
  ['Hamada (Stone Plateau)', 'Large Hill'],         // 99
  ['Reg (Gravel Plain)', 'Plains'],                 // 100
  ['Cactus', 'Plains'],                             // 101
  ['Wadi', 'Plains'],                               // 102
  ['Tropical Foliage', 'Small Forest'],             // 103
  ['Light Tropical Cover', 'Small Forest'],         // 104
  ['Palm Trees', 'Small Forest'],                   // 105
  ['Dense Foliage', 'Large Forest'],                // 106
  ['Dense Tropical Forest', 'Large Forest'],        // 107
  ['Tropical Hilltop', 'Large Forest'],             // 108
  ['Monsoon Jungle', 'Small Forest'],               // 109
  ['Jungle', 'Small Forest'],                       // 110
  ['Damp Jungle', 'Small Forest'],                  // 111
  ['Dense Jungle', 'Large Forest'],                 // 112
  ['Dense Monsoon Jungle', 'Large Forest'],         // 113
  ['Monsoon Hilltop', 'Large Forest'],              // 114
  ['Light Rainforest', 'Small Forest'],             // 115
  ['Rainforest Canopy', 'Small Forest'],            // 116
  ['Rainforest', 'Small Forest'],                   // 117
  ['Dense Rainforest', 'Large Forest'],             // 118
  ['Thick Rainforest', 'Large Forest'],             // 119
  ['Rainforest Hilltop', 'Large Forest'],           // 120
  ['Succulents', 'Plains'],                         // 121
  ['Dry tundra', 'Plains'],                         // 122
  ['Geyser', 'Plains'],                             // 123
  ['Faerie Ring', 'Plains'],                        // 124
  ['Cairn', 'Small Mountain'],                      // 125
  ['Lighthouse', 'Buildings'],                      // 126
  ['Stone Circle', 'Plains'],                       // 127
  ['Mountain Cave', 'Large Mountain'],              // 128
  ['Pyramids', 'Buildings'],                        // 129
  ['Sphinx', 'Plains'],                             // 130
  ['Obelisk', 'Plains'],                            // 131
  ['Clock Tower', 'Buildings'],                     // 132
  ['Column', 'Plains'],                             // 133
  ['Dragon Monument', 'Plains'],                    // 134
  ['Heroic Human Statue', 'Plains'],                // 135
  ['Elf Monument', 'Plains'],                       // 136
  ['Dwarf Monument', 'Plains'],                     // 137
  ['Orc Monument', 'Plains'],                       // 138
  ['Blessed Oak', 'Large Forest'],                  // 139
  ['Ornamental Gardens', 'Plains'],                 // 140
  ['Ornamental Gardens', 'Plains'],                 // 141
  ['Mausoleum', 'Buildings'],                       // 142
  ['Dark Forest', 'Large Forest'],                  // 143
  ['Ancient Lair', 'Small Mountain'],               // 144
  ['Abandoned Lodge', 'Buildings'],                 // 145
  ['Deserted Wayhouse', 'Buildings'],               // 146
  ['Rockhewn Monastery', 'Buildings'],              // 147
  ['House of the Spirits', 'Buildings'],            // 148
  ['Forgotten Temple', 'Buildings'],                // 149
  ['Hidden Temple', 'Buildings'],                   // 150
  ['Place of High Sacrifice', 'Buildings'],         // 151
  ['Crooked House', 'Buildings'],                   // 152
  ['Deserted Monastery', 'Buildings'],              // 153
  ['Dark Temple', 'Buildings'],                     // 154
  ['Gypsy Campsite', 'Plains'],                     // 155
  ['Abandoned Campsite', 'Plains'],                 // 156
  ['Fortune Teller', 'Plains'],                     // 157
  ['Fortress of Shadows', 'Buildings'],             // 158
  ['Ancient Claws', 'Buildings'],                   // 159
  ['Gathering Place', 'Plains'],                    // 160
  ['Temple of Reason', 'Buildings'],                // 161
  ['Steamtastic Brewery', 'Buildings'],             // 162
  ['Brewery Outbuildings', 'Buildings'],            // 163
  ['Cylindroconical Vessels', 'Buildings'],         // 164
  ['Mystic Tomb', 'Buildings'],                     // 165
  ['Corrupted Land', 'Large Forest'],               // 166
  ['Altar of Water', 'Large Forest'],               // 167
  ['Altar of Fire', 'Plains'],                      // 168
  ['Altar of Air', 'Large Hill'],                   // 169
  ['Altar of Earth', 'Large Mountain'],             // 170
  ['Activated Standing Stones', 'Plains'],          // 171
  ['Bankside', 'Plains'],                           // 172
  ['Beach', 'Plains'],                              // 173
  ['Shallow Coastline', 'Plains'],                  // 174
  ['Coast', 'Plains'],                              // 175
  ['Coniferous Thick Forest', 'Large Forest'],      // 176
  ['Coniferous Dense Forest', 'Large Forest'],      // 177
  ['Coniferous Forested Hilltop', 'Large Forest'],  // 178
  ['Coniferous Wooded Land', 'Small Forest'],       // 179
  ['Coniferous Wooded Glade', 'Small Forest'],      // 180
  ['Coniferous Light Woods', 'Small Forest'],       // 181
  ['Snowy Thick Forest', 'Large Forest'],           // 182
  ['Snowy Dense Forest', 'Large Forest'],           // 183
  ['Snowy Forested Hilltop', 'Large Forest'],       // 184
  ['Snowy Wooded Land', 'Small Forest'],            // 185
  ['Snowy Wooded Glade', 'Small Forest'],           // 186
  ['Snowy Light Woods', 'Small Forest'],            // 187
  ['Temperate Thick Forest', 'Large Forest'],       // 188
  ['Temperate Dense Forest', 'Large Forest'],       // 189
  ['Temperate Forested Hilltop', 'Large Forest'],   // 190
  ['Temperate Wooded Land', 'Small Forest'],        // 191
  ['Temperate Wooded Glade', 'Small Forest'],       // 192
  ['Temperate Light Woods', 'Small Forest'],        // 193
  ['Scorched Forest', 'Large Forest'],              // 194
  ['Petrified Forest', 'Large Forest'],             // 195
  ['Deadvlei Forest', 'Large Forest'],              // 196
  ['Parched Bones', 'Plains'],                      // 197
  ['Dead Water', 'Ocean'],                          // 198
  ['Obsidian Mountain', 'Obsidian Mountains'],      // 199
  ['Glassy Crag', 'Obsidian Mountains'],            // 200
  ['Volcanic Mountain', 'Obsidian Mountains'],      // 201
  ['Lava Peak', 'Obsidian Mountains'],              // 202
  ['Active Peak', 'Obsidian Mountains'],            // 203
  ['Emerging Mountaintop', 'Obsidian Mountains'],   // 204
  ['Glassy Mountain', 'Obsidian Mountains'],        // 205
  ['Lava Pool', 'Obsidian Mountains'],              // 206
  ['Magma Rift', 'Obsidian Mountains'],             // 207
  ['Abandoned Lair', 'Buildings'],                  // 208
  ['Ancient Graveyard', 'Buildings'],               // 209
  ['Broken Tower', 'Buildings'],                    // 210
  ['Dormant Portal', 'Buildings'],                  // 211
  ['Fallen Dwarfhold', 'Buildings'],                // 212
  ['Fortified Hostel', 'Buildings'],                // 213
  ['Lawstones', 'Buildings'],                       // 214
  ['Sacrificial Altar', 'Buildings'],               // 215
  ['Tiki Pole', 'Small Forest'],                    // 216
  ['Weeping Willow', 'Small Forest'],               // 217
  ['Crumbling Lighthouse', 'Buildings'],            // 218
  ["Fisherman's Hut", 'Buildings'],                 // 219
  ['Seahenge', 'Buildings'],                        // 220
  ['Ferry Post', 'Buildings'],                      // 221
  ['Head Statue', 'Buildings'],                     // 222
  ['Jungle Standing Stones', 'Buildings'],          // 223
  ['Shattered Head', 'Buildings'],                  // 224
  ['Shipwreck', 'Buildings'],                       // 225
  ['Shipwreck', 'Buildings'],                       // 226
  ['Shipwreck', 'Buildings'],                       // 227
  ['Shipwreck', 'Buildings'],                       // 228
  ['Shipwreck', 'Buildings'],                       // 229
];

// [V] The six terrains the server's own data file marks `npcterrain: Yes`, and
// there are exactly six. Their `rs` does not follow from their `i`: i:40
// appears as an abandoned mill, a quarry and a lumberyard within one payload,
// and i:43 and i:45 vary the same way, so only the tile's own `rs` is worth
// reading.
//
// These are NOT unnamed. The client calls i:40 Standing Stones and i:123 a
// Geyser, and both are in TERRAIN_NAMES like every other row. What this set
// records is that the name does not predict the ratings.
//
// This list was nineteen entries longer, holding every `i` ever seen on a tile
// flagged `npc:1` — 88, 123, 124, 139, 143 and the rest. The data file calls
// all nineteen ordinary terrain. A tile's `npc:1` and its terrain's npcterrain
// class are separate facts: a Dark Forest tile can carry an NPC lair without
// Dark Forest being NPC terrain, exactly as an i:40 tile can carry an
// "Abandoned Goldmine" landmark in the `n` block without that being its type.
// Terrain type, tile flag and landmark are three independent things, and this
// set is only the first.
export const NODE_CLASS_TERRAIN = new Set([40, 41, 42, 43, 44, 45]);

const SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));

/**
 * What terrain `i` is and what it grants, or null for an `i` off the end of the
 * client's own table.
 *
 * Two sources, and which one answers what matters. The NAME always comes from
 * TERRAIN_NAMES, the game's data, so it is right for all 229 IDs whether or not
 * anyone has ever stood on one. The BONUS comes from TERRAIN_DESCRIPTORS, which
 * is read off tiles by hand and covers every terrain the world contains.
 *
 * That splits "unknown" into two answers that were one before the client table
 * was found, and they are not the same job:
 *
 * - `bonusUnread` — the terrain is named and nobody has read its descriptor.
 *   Every one left is absent from the world, so there is no tile to read.
 * - a null return — `i` is past the end of the client table, so the client
 *   itself does not know it. That is a new terrain, not an unread one.
 *
 * `sovKey` is the structure the bonus scales with, and `conditional` says there
 * is no such structure in the table. Nothing is conditional today — every
 * building the descriptors name is a Production Structure — but the table is
 * read off the game, so a row naming something unknown has to be visible rather
 * than resolve to a silent null.
 */
export function descriptorFor(i) {
  const named = TERRAIN_NAMES[i];
  const entry = TERRAIN_DESCRIPTORS[i];
  if (!named && !entry) return null;
  const base = {
    i,
    name: named?.[0] ?? entry.name,
    combat: named?.[1],
    nodeClass: NODE_CLASS_TERRAIN.has(i) || undefined,
  };
  if (!entry) return { ...base, bonusUnread: true, conditional: false, sovKey: null };
  const sov = entry.building ? SOV_STRUCTURE_BY_NAME.get(entry.building) : undefined;
  return {
    ...entry,
    ...base,
    sovKey: sov?.key ?? null,
    conditional: !!entry.building && !sov,
  };
}

/**
 * Which (building, bonus) rungs more than one terrain grants.
 *
 * This was an invariant — one terrain per rung — and it was wrong. It survived
 * three rounds of contrary evidence because each round was explained away:
 * first three "mis-transcribed" rows that were re-read and changed to fit, then
 * a glacial set that repeated five rungs, which produced a `family` field to
 * scope the rule by, then a wetland and a tropical set that repeated one each.
 *
 * What ended it: i:120 Rainforest Hilltop grants Papermill +3% Books, and so
 * does i:6 Rich Clay Seam — both read in the same Jungle biome, so no scoping
 * saves it. The same harvest showed Wooded Quarry, Clay Seam and a dozen other
 * "temperate" terrains sitting in that Jungle biome with unchanged bonuses,
 * which is the deeper point: **biome belongs to the region, not to the terrain
 * type**, and `family` was describing where a tile happened to be read rather
 * than anything about the terrain. The field is gone.
 *
 * So a rung is simply not unique, and this reports rather than fails. It stays
 * because a duplicate is still worth seeing when a row is added — it is how a
 * genuine transcription error would look, and now that the rule is gone, the
 * only way to notice one is to read the list.
 *
 * @returns {string[]} one line per shared rung, empty when every rung is held
 *   by a single terrain.
 */
export function sharedRungs(table = TERRAIN_DESCRIPTORS) {
  const seen = new Map();
  for (const [i, entry] of Object.entries(table)) {
    if (!entry.building) continue;
    const rung = `${entry.building} +${entry.bonus}%`;
    if (!seen.has(rung)) seen.set(rung, []);
    seen.get(rung).push(i);
  }
  return [...seen]
    .filter(([, ids]) => ids.length > 1)
    .map(([rung, ids]) => `${rung}: i:${ids.join(', i:')}`);
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

export const PRODUCTION_LABEL = {
  wood: 'Wood',
  clay: 'Clay',
  iron: 'Iron',
  stone: 'Stone',
  food: 'Food',
  research: 'Research',
  gold: 'Gold',
};

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

// [V] Library RP/hr at level 20 with no Allembine, read in game at 25% tax. At
// 25% production is 100%, so the reading is the base directly with no multiplier
// to divide out; readings at 50% and 100% tax confirm it scales with (125 - T).
// Only level 20 is modelled — no reading exists for any other level and no curve
// is assumed, so LIBRARY_LEVEL is fixed rather than configurable.
export const LIBRARY_BASE_RP_L20 = 1013;
export const LIBRARY_LEVEL = 20;

// [V] Both research bonuses are flat additions AFTER the tax multiplier, not
// terms inside it: each contributes the same RP/hr at 25%, 50% and 100% tax.
//
// Allembine is +5 RP/hr per library level, so +100 at level 20. Overflowing
// Insight contributes half the library's base output, which is 506.5 — it is not
// the x1.5 multiplier it resembles at 25% tax, where the multiplier is 1 and the
// two models coincide.
export const ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;
export const ALLEMBINE_RP = ALLEMBINE_RP_PER_LIBRARY_LEVEL * LIBRARY_LEVEL;
export const OVERFLOWING_INSIGHT_FRACTION = 0.5;
export const OVERFLOWING_INSIGHT_RP = LIBRARY_BASE_RP_L20 * OVERFLOWING_INSIGHT_FRACTION;

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
  allembine: true,
  overflowingInsight: false,
  // { observedRpPerHour, atTax, prestige } back-solves the library base. The
  // prestige flag describes the reading rather than the city: what is divided out
  // has to be the multiplier that was running when the figure was read. The flat
  // bonuses come off before the division, or a bonus that does not scale is
  // fitted as one that does.
  rpCalibration: null,
  // Which of the four booster buildings the city has at level 20. Each is worth
  // RESOURCE_BOOSTER_BONUS points against that resource's ceiling.
  resourceBoosters: { wood: false, clay: false, iron: false, stone: false },
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
  // Fold the panel to its icon off the World Map: the scanner reads
  // window.mapData, which exists only there.
  autoMinimizeOffMap: true,
};
