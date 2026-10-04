// Game constants, each marked with how well it is known: [V] verified in game,
// [F] from a reliable source, [D] derived from one, [?] assumed. When output
// looks wrong, re-check the [F] and [?] values first.

// [F] The world's extent, inclusive. A claim ring past an edge is smaller, not
// missing data.
export const WORLD_MIN_X = -1000;
export const WORLD_MAX_X = 1000;
export const WORLD_MIN_Y = -3300;
export const WORLD_MAX_Y = 1000;

export const PRODUCTION_BASE = 125;        // [V] production% = 125 - tax
export const FARM_YIELD_L20 = 2014;        // [V] food/hr per farm plot at L20
export const GOLD_PER_TAX_POP = 0.04;      // [F] Gold_income = 0.04 * T * Pop

export const CLAIM_RP_PER_LEVEL_DISTANCE = 10;    // [V] RP/hr = 10 * L * d
export const CLAIM_GOLD_PER_LEVEL_DISTANCE = 100; // [V] gold is exactly 10x RP

// [V] The game rounds the claim distance half-up to two decimals before
// multiplying: a diagonal costs as 1.41, and a (2,1) claim at level 2 costs 448
// gold, not the 447 that rounding the product would give.
export const CLAIM_DISTANCE_DECIMALS = 2;

// [F] A level 20 Chancery of Estates takes 40% off a claim's first level, and
// each further Chancery half as much again: 40%, 60%, 70%. The first level keeps
// its discount on a claim held higher, and the levels above it pay in full (GM
// Stormcrow's release notes, 7 October 2011). [?] Applied to the finished cost;
// whether the game applies it before the distance rounding is unmeasured.
export const CHANCERY_DISCOUNT_L20 = 0.4;

// [F] Food sovereignty requires a level 5 claim carrying a level 5 building.
export const FOOD_CLAIM_LEVEL = 5;

// [F] Military structure upkeep per hour, of each of wood, clay, iron and
// stone, by building level.
export const MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };

// What each level adds to that bill, indexed from 0 for level 1. The steps
// grow, which is why spreading a bonus over more buildings costs less to run.
export const MILSOV_UPKEEP_STEP = [1, 2, 3, 4, 5].map(
  (level) => MILSOV_UPKEEP_BY_LEVEL[level] - (MILSOV_UPKEEP_BY_LEVEL[level - 1] ?? 0),
);

export const MILSOV_MAX_LEVEL = 5;

// [D] Military unit production bonus per building level, from [F] "+5% per
// level" and a worked example: 8x Sov III + 12x Sov II = +240%.
//
// A claim has a sovereignty level, which sets its RP and gold cost, and the
// structure on it has a building level, which sets this bonus and its upkeep.
// The planner keeps the two equal. A tile whose terrain descriptor names the
// structure adds its own bonus per building level (see descriptorBonus).
export const MILSOV_BONUS_PER_LEVEL = 5;

// [F] Every sovereignty structure. A 'production' structure pays
// MILSOV_UPKEEP_BY_LEVEL every hour; a 'resource' one pays only its claim's RP
// and gold. `boosts` is what a resource structure raises; `military` marks
// the five the form offers.
export const SOV_STRUCTURES = [
  { key: 'trainingGround', name: 'Training Ground', type: 'production', military: true },
  { key: 'targetRange', name: 'Target Range', type: 'production', military: true },
  { key: 'militaryAcademy', name: 'Military Academy', type: 'production', military: true },
  { key: 'joustingYard', name: 'Jousting Yard', type: 'production', military: true },
  { key: 'assemblyYard', name: 'Assembly Yard', type: 'production', military: true },
  // Crafting structures: not offered, but terrain descriptors name them.
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

// The structures the form offers for military sovereignty. Resource Structures
// are never placed automatically: what makes one worth claiming is the tile's
// resource rating, which is not scored.
export const MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.military);

// An unknown or missing structure is charged as this one, so it is never free.
export const DEFAULT_SOV_STRUCTURE = 'trainingGround';

export const SOV_LEVEL_ROMAN = ['I', 'II', 'III', 'IV', 'V'];

// [V] What each terrain type `i` grants a claim on it, read off tiles in game
// and, for thirty-nine rows, from the client's Sovereignty Bonuses table, which
// wins where they disagree.
//
// `bonus` is `product` per level of `building`, and is scored only on a tile
// hosting that structure (see descriptorBonus). A row with no `building` is a
// terrain known to grant nothing, as distinct from an unidentified `i`. Two
// terrains can grant the same bonus (see sharedRungs). `disputed` marks a row
// not yet confirmed.
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
  15: { name: 'Fertile Orchard', bonus: 1, product: 'Beer', building: "Brewer's Yard" },
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
  48: { name: 'Wooded Quarry', bonus: 1, product: 'Siege Units', building: 'Assembly Yard' },
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
  59: { name: 'Fresh Water', water: true },
  66: { name: 'Faction Hub', settlement: true },
  67: { name: 'Forbidden', impassable: true },
  80: { name: 'Drumlin' },

  68: { name: 'Barren Wastes', bonus: 3, product: 'Spear Units', building: 'Training Ground' },
  69: { name: 'Glacier' },
  70: { name: 'Frozen Ground' },
  71: { name: 'Nunatak', bonus: 3, product: 'Siege Units', building: 'Assembly Yard' },
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
  83: { name: 'Scrubland' },
  84: { name: 'Permafrost' },
  85: { name: 'Icy Moss' },
  86: { name: 'Frosty Heath' },
  87: {
    name: 'Lichen', bonus: 1, product: 'Livestock', building: 'Cattle Rancher',
  },

  89: { name: 'Swamp', bonus: 2, product: 'Bows', building: 'Bowyer' },
  90: { name: 'Marsh', bonus: 3, product: 'Spears', building: 'Poleturner' },
  91: { name: 'Bog' },
  92: { name: 'Mire' },

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
  116: { name: 'Rainforest Canopy', bonus: 3, product: 'Bows', building: 'Bowyer' },
  117: { name: 'Rainforest' },
  118: { name: 'Dense Rainforest' },
  119: { name: 'Thick Rainforest', bonus: 3, product: 'Spears', building: 'Poleturner' },
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

  // Every terrain the world contains has a row. The ids still missing are named
  // by the client but appear nowhere in the world.

  3: { name: 'Plains' },
  63: { name: 'Light Woods', bonus: 1, product: 'Spears', building: 'Poleturner' },
  64: { name: 'Rocky Outcrop', bonus: 3, product: 'Horses', building: 'Farrier' },
  65: { name: 'Clay Seam', bonus: 3, product: 'Leather Armour', building: 'Renderer' },
  76: { name: 'Tarn' },
  88: { name: 'Petrified Forest' },

  93: { name: 'Sand Dune' },
  94: { name: 'Oasis', bonus: 3, product: 'Livestock', building: 'Cattle Rancher' },
  96: { name: 'Yardang' },
  97: { name: 'Mesa', bonus: 3, product: 'Platesteel', building: 'Plate Forger' },
  98: { name: 'Rocky Mountain' },
  99: { name: 'Hamada (Stone Plateau)' },
  100: { name: 'Reg (Gravel Plain)' },
  102: { name: 'Wadi' },

  60: { name: 'Tidal Water', water: true },
  61: { name: 'Shallow Salt Water', water: true },
  62: { name: 'Ocean', water: true },
  172: { name: 'Bankside' },
  173: { name: 'Beach' },
  174: { name: 'Shallow Coastline' },
  175: { name: 'Coast' },
  198: { name: 'Dead Water', water: true },

  // Volcanic terrains: zero on every plot, but passable, unlike i:20-23.
  199: { name: 'Obsidian Mountain' },
  200: { name: 'Glassy Crag' },
  201: { name: 'Volcanic Mountain' },
  202: { name: 'Lava Peak' },
  203: { name: 'Active Peak' },
  204: { name: 'Emerging Mountaintop' },
  206: { name: 'Lava Pool' },
  207: { name: 'Magma Rift' },

  194: { name: 'Scorched Forest' },
  195: { name: 'Petrified Forest' },
  196: { name: 'Deadvlei Forest' },

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

// [V] The client's terrain table (`window.terrain`), matching the server's
// datafile_terrain.xml. Index is `i`, with 0 unused; each row is [name, combat
// class]. Names come from here and bonuses from TERRAIN_DESCRIPTORS. The combat
// class is unused. Trailing spaces in two client names are trimmed.
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

// [V] The six terrains the server's data file marks `npcterrain: Yes`. Their
// ratings vary tile to tile, so only a tile's own `rs` can be trusted. This is
// unrelated to a tile's `npc:1` flag, which marks an NPC lair on any terrain.
export const NODE_CLASS_TERRAIN = new Set([40, 41, 42, 43, 44, 45]);

const SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));

/**
 * What terrain `i` is and what it grants, or null for an `i` the client's table
 * does not have. The name comes from TERRAIN_NAMES and the bonus from
 * TERRAIN_DESCRIPTORS; `bonusUnread` marks a named terrain with no descriptor
 * row. `sovKey` is the structure the bonus scales with, and `conditional` is
 * set when SOV_STRUCTURES has no such structure.
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
 * Which (building, bonus) pairs more than one terrain grants. Shared pairs are
 * legitimate, but worth checking when a row is added, since a transcription
 * error looks the same.
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

// The four basic resources. Food is handled separately everywhere.
export const BASIC_RESOURCES = ['wood', 'clay', 'iron', 'stone'];

// [V] Each level 20 booster adds 40 points to its production percentage, as the
// Flour Mill does for food.
export const RESOURCE_BOOSTERS = {
  wood: 'Carpentry',
  clay: 'Kiln',
  iron: 'Foundry',
  stone: 'Stonemason',
};
export const RESOURCE_BOOSTER_BONUS = 40;

// [F] City buildings that consume basic resources every hour, and how much at
// level 20 (Illypedia). Every copy consumes the same, so the bill is count x
// rate. Their food use is already in the city's consumption figure. `group` is
// the form's heading; `hint` anything else the building does.
export const UPKEEP_BUILDINGS = [
  { key: 'spearmensBillets', group: 'Military', name: "Spearmens' Billets", consumes: { clay: 2700, iron: 1100 } },
  { key: 'archersField', group: 'Military', name: "Archers' Field", consumes: { wood: 2700, iron: 1100 } },
  { key: 'infantryQuarters', group: 'Military', name: 'Infantry Quarters', consumes: { iron: 1100, stone: 2700 } },
  { key: 'cavalryParadeGround', group: 'Military', name: 'Cavalry Parade Ground', consumes: { wood: 1100, clay: 2700 } },
  { key: 'arcticWarfareCollege', group: 'Military', name: 'Arctic Warfare College', consumes: { iron: 1000, stone: 2300 } },
  { key: 'desertWarfareCollege', group: 'Military', name: 'Desert Warfare College', consumes: { clay: 2300, stone: 1000 } },
  { key: 'jungleWarfareCollege', group: 'Military', name: 'Jungle Warfare College', consumes: { wood: 2300, clay: 1000 } },
  { key: 'scoutsLookout', group: 'Diplomacy', name: "Scouts' Lookout", consumes: { wood: 700, clay: 1500 } },
  { key: 'spiesHideout', group: 'Diplomacy', name: "Spies' Hideout", consumes: { wood: 700, clay: 1100, stone: 1100 } },
  { key: 'thievesDen', group: 'Diplomacy', name: "Thieves' Den", consumes: { wood: 1700, clay: 1100, iron: 1700 } },
  { key: 'saboteursSanctuary', group: 'Diplomacy', name: "Saboteurs' Sanctuary", consumes: { wood: 2700, clay: 1500 } },
  { key: 'assassinsAbode', group: 'Diplomacy', name: "Assassins' Abode", consumes: { iron: 3100, stone: 1900 } },
  { key: 'foreignOffice', group: 'Diplomacy', name: 'Foreign Office', consumes: { clay: 400, iron: 800, stone: 1600 } },
  { key: 'runemastersGrounding', group: 'Magic', name: "Runemasters' Grounding", consumes: { clay: 900, stone: 1700 } },
  // Separate from geomancerRetreats: Nature's Bounty can be cast from another city.
  { key: 'geomancersRetreat', group: 'Magic', name: "Geomancers' Retreat", consumes: { wood: 700, clay: 2300, stone: 1500 } },
  {
    key: 'chanceryOfEstates',
    group: 'Sovereignty',
    name: 'Chancery of Estates',
    consumes: { wood: 800, clay: 3200, stone: 1600 },
    hint: `Also takes ${CHANCERY_DISCOUNT_L20 * 100}% off the first level of every claim, `
      + 'and each further one half as much again.',
  },
  { key: 'tradeOffice', group: 'Trade', name: 'Trade Office', consumes: { wood: 2800, clay: 690, stone: 1580 } },
];

// [V] Per-plot yield at level 20, the same for all four basic resources.
export const BASIC_YIELD_L20 = 2538;

// [V] The prestige boost, in points added to the production percentage.
export const PRESTIGE_PRODUCTION_BONUS = 20;

// Food's prestige points are counted in computeBOther, with the other food bonuses.
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

export const MINIMUM_KEYS = [...BASIC_RESOURCES, 'food', 'research'];

// [V] A starting figure for food consumed per hour; the user enters their own.
export const DEFAULT_CITY_CONSUMPTION = 30800;

// [F] Additive food bonuses, in points on the production percentage.
export const FLOUR_MILL_L20 = 40;
export const NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];
export const FAMINE_MANAGEMENT = 10;  // capital, >=10 cities
export const SOIL_ENRICHMENT = 15;    // capital, >=30 cities

// [V] Library RP/hr at level 20 without Allembine, read at 25% tax, where
// production is 100%. It scales with (125 - T). Only level 20 is modelled.
export const LIBRARY_BASE_RP_L20 = 1013;
export const LIBRARY_LEVEL = 20;

// [V] Flat research bonuses, unaffected by tax: Allembine is +5 RP/hr per
// library level, and Overflowing Insight half the library's base output.
export const ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;
export const ALLEMBINE_RP = ALLEMBINE_RP_PER_LIBRARY_LEVEL * LIBRARY_LEVEL;
export const OVERFLOWING_INSIGHT_FRACTION = 0.5;
export const OVERFLOWING_INSIGHT_RP = LIBRARY_BASE_RP_L20 * OVERFLOWING_INSIGHT_FRACTION;

/** Plot order matches the payload's `rs` string: "wood|clay|iron|stone|food". */
export const PLOT_KEYS = ['wood', 'clay', 'iron', 'stone', 'food'];

export const PLOT_TOTAL = 25;

export const DEFAULT_SETTINGS = {
  tMin: 50,
  plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 }, // must sum to 25
  cityConsumption: DEFAULT_CITY_CONSUMPTION,
  flourMill: true,
  // Nature's Bounty at two retreats matches the 22,400 food baseline the model
  // is calibrated against.
  naturesBounty: true,
  geomancerRetreats: 2,
  cityCount: 1,
  isCapital: false,
  allembine: true,
  overflowingInsight: false,
  // { observedRpPerHour, atTax, prestige } back-solves the library base.
  // `prestige` is whether the boost was running when the reading was taken.
  rpCalibration: null,
  resourceBoosters: { wood: false, clay: false, iron: false, stone: false },
  upkeepBuildings: Object.fromEntries(UPKEEP_BUILDINGS.map((b) => [b.key, 0])),
  // Surplus per hour the plan must leave free. Food is counted after what the
  // city eats, research after what the claims cost.
  resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 0, food: 0, research: 0 },
  prestige: {
    wood: false, clay: false, iron: false, stone: false, food: false, research: false,
  },
  rClaim: 2,
  maxBuildings: 20,
  dOther: 10,
  dOwn: 3,
  // Confederates are not allies here, and use dOther.
  dAlliance: 3,
  // Key into SOV_STRUCTURES; null plans food only.
  milsovStructure: null,
  // Sites below this military bonus are not listed; it never changes a plan.
  milsovMinBonus: 0,
  ownClaimsAvailable: false,
  autoMinimizeOffMap: true,
  mapOverlay: true,
};
