// ==UserScript==
// @name         Illyriad Sovereignty Site Scanner
// @namespace    https://github.com/Norris-A
// @version      2.0.0
// @description  Ranks visible world-map tiles by the maximum sustainable tax rate.
// @author       Norris A. (Firebolty)
// @icon         data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ic292LWFwcC1pY29uIiB2aWV3Qm94PSIwIDAgNjQgNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJTb3ZlcmVpZ250eSBTaXRlIFNjYW5uZXIiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0ic292LWFwcC1pY29uLWZpbGwiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMzZmJmNmEiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxMTgwNmEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ic292LWFwcC1pY29uLWdvbGQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMTgiIHkxPSIxOSIgeDI9IjQ2IiB5Mj0iNDgiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmZjRjMiIvPjxzdG9wIG9mZnNldD0iLjMiIHN0b3AtY29sb3I9IiNmNGM5NGEiLz48c3RvcCBvZmZzZXQ9Ii41MiIgc3RvcC1jb2xvcj0iI2M5OGExNCIvPjxzdG9wIG9mZnNldD0iLjciIHN0b3AtY29sb3I9IiNmN2Q4NzMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNiNTc3MGYiLz48L2xpbmVhckdyYWRpZW50PjxtYXNrIGlkPSJzb3YtYXBwLWljb24tY3Jvd24iPjxwYXRoIGQ9Ik0xOS41IDM5LjUgTDE4IDI0LjUgTDI2IDMwLjUgTDMyIDIwLjUgTDM4IDMwLjUgTDQ2IDI0LjUgTDQ0LjUgMzkuNSBaIiBmaWxsPSIjZmZmIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMy41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHJlY3QgeD0iMTkuNSIgeT0iNDMiIHdpZHRoPSIyNSIgaGVpZ2h0PSI0LjUiIHJ4PSIyLjI1IiBmaWxsPSIjZmZmIi8+PC9tYXNrPjwvZGVmcz48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNSIgZmlsbD0idXJsKCNzb3YtYXBwLWljb24tZmlsbCkiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyNi41IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4yNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjIyIiBzdHJva2Utd2lkdGg9IjMiLz48ZyBtYXNrPSJ1cmwoI3Nvdi1hcHAtaWNvbi1jcm93bikiPjxyZWN0IHg9IjEwIiB5PSIxNSIgd2lkdGg9IjQ0IiBoZWlnaHQ9IjM4IiBmaWxsPSJ1cmwoI3Nvdi1hcHAtaWNvbi1nb2xkKSIvPjxnIHRyYW5zZm9ybT0icm90YXRlKDI1IDMyIDM0KSI+PGcgY2xhc3M9InNvdi1hcHAtaWNvbi1nbGludCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTQ2IDApIj48cmVjdCB4PSIyNCIgd2lkdGg9IjYiIGhlaWdodD0iNzAiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjYiLz48cmVjdCB4PSIzMyIgd2lkdGg9IjIuNSIgaGVpZ2h0PSI3MCIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuNDUiLz48L2c+PC9nPjwvZz48L3N2Zz4=
// @downloadURL  https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js
// @updateURL    https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js
// @supportURL   https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/issues
// @match        https://elgea.illyriad.co.uk/*
// @match        https://illyriad.co.uk/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

(() => {
  // src/constants.js
  var WORLD_MIN_X = -1e3;
  var WORLD_MAX_X = 1e3;
  var WORLD_MIN_Y = -3300;
  var WORLD_MAX_Y = 1e3;
  var PRODUCTION_BASE = 125;
  var FARM_YIELD_L20 = 2014;
  var GOLD_PER_TAX_POP = 0.04;
  var CLAIM_RP_PER_LEVEL_DISTANCE = 10;
  var CLAIM_GOLD_PER_LEVEL_DISTANCE = 100;
  var CLAIM_DISTANCE_DECIMALS = 2;
  var CHANCERY_DISCOUNT_L20 = 0.4;
  var FOOD_CLAIM_LEVEL = 5;
  var MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };
  var MILSOV_UPKEEP_STEP = [1, 2, 3, 4, 5].map(
    (level) => MILSOV_UPKEEP_BY_LEVEL[level] - (MILSOV_UPKEEP_BY_LEVEL[level - 1] ?? 0)
  );
  var MILSOV_MAX_LEVEL = 5;
  var MILSOV_BONUS_PER_LEVEL = 5;
  var SOV_STRUCTURES = [
    { key: "trainingGround", name: "Training Ground", type: "production", military: true },
    { key: "targetRange", name: "Target Range", type: "production", military: true },
    { key: "militaryAcademy", name: "Military Academy", type: "production", military: true },
    { key: "joustingYard", name: "Jousting Yard", type: "production", military: true },
    { key: "assemblyYard", name: "Assembly Yard", type: "production", military: true },
    // Crafting structures: not offered, but terrain descriptors name them.
    { key: "cattleRancher", name: "Cattle Rancher", type: "production" },
    { key: "bladesmith", name: "Bladesmith", type: "production" },
    { key: "renderer", name: "Renderer", type: "production" },
    { key: "farrier", name: "Farrier", type: "production" },
    { key: "bowyer", name: "Bowyer", type: "production" },
    { key: "poleturner", name: "Poleturner", type: "production" },
    { key: "bridlemaker", name: "Bridlemaker", type: "production" },
    { key: "plateForger", name: "Plate Forger", type: "production" },
    { key: "armourer", name: "Armourer", type: "production" },
    { key: "engineeringYard", name: "Engineering Yard", type: "production" },
    { key: "papermill", name: "Papermill", type: "production" },
    { key: "brewersYard", name: "Brewer's Yard", type: "production" },
    { key: "finishingSchool", name: "Finishing School", type: "production" },
    { key: "loggingCamp", name: "Logging Camp", type: "resource", boosts: "wood" },
    { key: "earthworks", name: "Earthworks", type: "resource", boosts: "clay" },
    { key: "mineshaft", name: "Mineshaft", type: "resource", boosts: "iron" },
    { key: "gravelPit", name: "Gravel Pit", type: "resource", boosts: "stone" },
    { key: "farmstead", name: "Farmstead", type: "resource", boosts: "food" },
    { key: "fishery", name: "Fishery", type: "resource", boosts: "food" }
  ];
  var SOV_STRUCTURE_BY_KEY = Object.fromEntries(SOV_STRUCTURES.map((s) => [s.key, s]));
  var MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.military);
  var DEFAULT_SOV_STRUCTURE = "trainingGround";
  var SOV_LEVEL_ROMAN = ["I", "II", "III", "IV", "V"];
  var TERRAIN_DESCRIPTORS = {
    1: { name: "Plains" },
    2: { name: "Plains" },
    5: { name: "Plains" },
    6: { name: "Rich Clay Seam", bonus: 3, product: "Books", building: "Papermill" },
    7: { name: "Abundant Clay", bonus: 2, product: "Books", building: "Papermill" },
    8: { name: "Exposed Clay", bonus: 1, product: "Leather Armour", building: "Renderer" },
    9: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },
    10: { name: "Turned Clay", bonus: 2, product: "Saddles", building: "Bridlemaker" },
    11: { name: "Heavy Clay Seam", bonus: 1, product: "Saddles", building: "Bridlemaker" },
    12: { name: "Abundant Crops", bonus: 3, product: "Beer", building: "Brewer's Yard" },
    13: { name: "Bountiful Land", bonus: 3, product: "Livestock", building: "Cattle Rancher" },
    14: { name: "Fertile Pasture", bonus: 2, product: "Cavalry Units", building: "Jousting Yard" },
    15: { name: "Fertile Orchard", bonus: 1, product: "Beer", building: "Brewer's Yard" },
    16: { name: "Alluvial Plain", bonus: 1, product: "Livestock", building: "Cattle Rancher" },
    17: { name: "Fertile Ground", bonus: 1, product: "Horses", building: "Farrier" },
    18: { name: "Lake", water: true },
    19: { name: "Loch", water: true },
    20: { name: "Volcanic Peak", impassable: true },
    21: { name: "Fiery Mountain", impassable: true },
    22: { name: "Canyon", impassable: true },
    23: { name: "Swampland", impassable: true },
    24: { name: "Craggy Peaks", bonus: 3, product: "Chainmail", building: "Armourer" },
    25: {
      name: "Bleak Mountains",
      bonus: 2,
      product: "Diplomatic Units",
      building: "Finishing School"
    },
    26: { name: "Lonely Peaks", bonus: 1, product: "Platesteel", building: "Plate Forger" },
    27: { name: "Sharp Crags", bonus: 3, product: "Swords", building: "Bladesmith" },
    28: { name: "Treacherous Mountains", bonus: 2, product: "Beer", building: "Brewer's Yard" },
    29: { name: "Mountains", bonus: 1, product: "Swords", building: "Bladesmith" },
    30: {
      name: "Scrubland",
      bonus: 1,
      product: "Diplomatic Units",
      building: "Finishing School"
    },
    31: { name: "Clearing", bonus: 1, product: "Ranged Units", building: "Target Range" },
    32: { name: "Tundra", bonus: 1, product: "Spear Units", building: "Training Ground" },
    33: { name: "Open Plains", bonus: 1, product: "Cavalry Units", building: "Jousting Yard" },
    34: { name: "Moor", bonus: 1, product: "Infantry Units", building: "Military Academy" },
    35: { name: "Plains" },
    36: { name: "Plains" },
    37: { name: "Plains" },
    38: { name: "Plains" },
    39: { name: "Plains" },
    40: { name: "Standing Stones" },
    42: { name: "Abandoned Mineshaft" },
    43: { name: "Ruined Tower" },
    44: { name: "Ancient Forest" },
    45: { name: "Dolmen" },
    46: { name: "Abundant Quarry", bonus: 3, product: "Platesteel", building: "Plate Forger" },
    47: { name: "Rich Quarry", bonus: 2, product: "Infantry Units", building: "Military Academy" },
    48: { name: "Wooded Quarry", bonus: 1, product: "Siege Units", building: "Assembly Yard" },
    49: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },
    50: { name: "Landslip", bonus: 2, product: "Siege Units", building: "Assembly Yard" },
    51: { name: "Stony Ground", bonus: 1, product: "Chainmail", building: "Armourer" },
    52: { name: "Thick Forest", bonus: 3, product: "Bows", building: "Bowyer" },
    53: { name: "Dense Forest", bonus: 2, product: "Ranged Units", building: "Target Range" },
    54: { name: "Forested Hilltop", bonus: 1, product: "Bows", building: "Bowyer" },
    55: { name: "Wooded Land", bonus: 3, product: "Spears", building: "Poleturner" },
    56: { name: "Wooded Glade", bonus: 2, product: "Spear Units", building: "Training Ground" },
    57: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },
    58: { name: "Plains" },
    59: { name: "Fresh Water", water: true },
    66: { name: "Faction Hub", settlement: true },
    67: { name: "Forbidden", impassable: true },
    80: { name: "Drumlin" },
    68: { name: "Barren Wastes", bonus: 3, product: "Spear Units", building: "Training Ground" },
    69: { name: "Glacier" },
    70: { name: "Frozen Ground" },
    71: { name: "Nunatak", bonus: 3, product: "Siege Units", building: "Assembly Yard" },
    72: {
      name: "Scoured Bedrock",
      bonus: 2,
      product: "Infantry Units",
      building: "Military Academy"
    },
    73: { name: "Icefield" },
    74: { name: "Glacial Crevasse" },
    75: { name: "Ice cave" },
    77: {
      name: "Rogen Moraine",
      bonus: 1,
      product: "Ranged Units",
      building: "Target Range"
    },
    78: { name: "Moraine", bonus: 2, product: "Chainmail", building: "Armourer" },
    79: { name: "Kame" },
    81: {
      name: "Roche Moutonnee",
      bonus: 1,
      product: "Chainmail",
      building: "Armourer"
    },
    82: { name: "Ice Holes" },
    83: { name: "Scrubland" },
    84: { name: "Permafrost" },
    85: { name: "Icy Moss" },
    86: { name: "Frosty Heath" },
    87: {
      name: "Lichen",
      bonus: 1,
      product: "Livestock",
      building: "Cattle Rancher"
    },
    89: { name: "Swamp", bonus: 2, product: "Bows", building: "Bowyer" },
    90: { name: "Marsh", bonus: 3, product: "Spears", building: "Poleturner" },
    91: { name: "Bog" },
    92: { name: "Mire" },
    41: { name: "Barrow" },
    95: { name: "Playa" },
    101: { name: "Cactus", bonus: 3, product: "Horses", building: "Farrier" },
    103: { name: "Tropical Foliage", bonus: 1, product: "Bows", building: "Bowyer" },
    104: { name: "Light Tropical Cover" },
    105: { name: "Palm Trees", bonus: 1, product: "Spears", building: "Poleturner" },
    106: { name: "Dense Foliage", bonus: 1, product: "Books", building: "Papermill" },
    107: { name: "Dense Tropical Forest", bonus: 2, product: "Bows", building: "Bowyer" },
    108: { name: "Tropical Hilltop" },
    109: { name: "Monsoon Jungle", bonus: 2, product: "Spear Units", building: "Training Ground" },
    110: { name: "Jungle" },
    111: { name: "Damp Jungle" },
    112: { name: "Dense Jungle", bonus: 2, product: "Spears", building: "Poleturner" },
    113: { name: "Dense Monsoon Jungle", bonus: 2, product: "Books", building: "Papermill" },
    114: { name: "Monsoon Hilltop" },
    115: { name: "Light Rainforest" },
    116: { name: "Rainforest Canopy", bonus: 3, product: "Bows", building: "Bowyer" },
    117: { name: "Rainforest" },
    118: { name: "Dense Rainforest" },
    119: { name: "Thick Rainforest", bonus: 3, product: "Spears", building: "Poleturner" },
    120: { name: "Rainforest Hilltop", bonus: 3, product: "Books", building: "Papermill" },
    121: { name: "Succulents" },
    122: { name: "Dry tundra" },
    124: { name: "Faerie Ring" },
    127: { name: "Stone Circle" },
    128: { name: "Mountain Cave" },
    129: { name: "Pyramids" },
    130: { name: "Sphinx" },
    139: { name: "Blessed Oak" },
    142: { name: "Mausoleum" },
    143: { name: "Dark Forest" },
    144: { name: "Ancient Lair" },
    146: { name: "Deserted Wayhouse" },
    147: { name: "Rockhewn Monastery" },
    150: { name: "Hidden Temple" },
    151: { name: "Place of High Sacrifice" },
    152: { name: "Crooked House" },
    153: { name: "Deserted Monastery" },
    156: { name: "Abandoned Campsite" },
    205: { name: "Glassy Mountain" },
    209: { name: "Ancient Graveyard" },
    211: { name: "Dormant Portal" },
    213: { name: "Fortified Hostel" },
    214: { name: "Lawstones" },
    215: { name: "Sacrificial Altar" },
    217: { name: "Weeping Willow" },
    222: { name: "Head Statue" },
    223: { name: "Jungle Standing Stones" },
    224: { name: "Shattered Head" },
    // Every terrain the world contains has a row. The ids still missing are named
    // by the client but appear nowhere in the world.
    3: { name: "Plains" },
    63: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },
    64: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },
    65: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },
    76: { name: "Tarn" },
    88: { name: "Petrified Forest" },
    93: { name: "Sand Dune" },
    94: { name: "Oasis", bonus: 3, product: "Livestock", building: "Cattle Rancher" },
    96: { name: "Yardang" },
    97: { name: "Mesa", bonus: 3, product: "Platesteel", building: "Plate Forger" },
    98: { name: "Rocky Mountain" },
    99: { name: "Hamada (Stone Plateau)" },
    100: { name: "Reg (Gravel Plain)" },
    102: { name: "Wadi" },
    60: { name: "Tidal Water", water: true },
    61: { name: "Shallow Salt Water", water: true },
    62: { name: "Ocean", water: true },
    172: { name: "Bankside" },
    173: { name: "Beach" },
    174: { name: "Shallow Coastline" },
    175: { name: "Coast" },
    198: { name: "Dead Water", water: true },
    // Volcanic terrains: zero on every plot, but passable, unlike i:20-23.
    199: { name: "Obsidian Mountain" },
    200: { name: "Glassy Crag" },
    201: { name: "Volcanic Mountain" },
    202: { name: "Lava Peak" },
    203: { name: "Active Peak" },
    204: { name: "Emerging Mountaintop" },
    206: { name: "Lava Pool" },
    207: { name: "Magma Rift" },
    194: { name: "Scorched Forest" },
    195: { name: "Petrified Forest" },
    196: { name: "Deadvlei Forest" },
    123: { name: "Geyser" },
    131: { name: "Obelisk" },
    135: { name: "Heroic Human Statue" },
    145: { name: "Abandoned Lodge" },
    148: { name: "House of the Spirits" },
    149: { name: "Forgotten Temple" },
    155: { name: "Gypsy Campsite" },
    157: { name: "Fortune Teller" },
    158: { name: "Fortress of Shadows" },
    161: { name: "Temple of Reason" },
    162: { name: "Steamtastic Brewery" },
    163: { name: "Brewery Outbuildings" },
    164: { name: "Cylindroconical Vessels" },
    167: { name: "Altar of Water" },
    168: { name: "Altar of Fire" },
    169: { name: "Altar of Air" },
    170: { name: "Altar of Earth" },
    197: { name: "Parched Bones" },
    208: { name: "Abandoned Lair" },
    210: { name: "Broken Tower" },
    212: { name: "Fallen Dwarfhold" },
    216: { name: "Tiki Pole" },
    218: { name: "Crumbling Lighthouse" },
    219: { name: "Fisherman's Hut" },
    221: { name: "Ferry Post" }
  };
  var TERRAIN_NAMES = [
    null,
    // 0 - unused; the client's array starts at 1
    ["Plains", "Plains"],
    // 1
    ["Plains", "Plains"],
    // 2
    ["Plains", "Plains"],
    // 3
    ["Town", "Buildings"],
    // 4
    ["Plains", "Plains"],
    // 5
    ["Rich Clay Seam", "Large Hill"],
    // 6
    ["Abundant Clay", "Large Hill"],
    // 7
    ["Exposed Clay", "Small Hill"],
    // 8
    ["Clay Seam", "Small Hill"],
    // 9
    ["Turned Clay", "Large Hill"],
    // 10
    ["Heavy Clay Seam", "Small Hill"],
    // 11
    ["Abundant Crops", "Plains"],
    // 12
    ["Bountiful Land", "Plains"],
    // 13
    ["Fertile Pasture", "Plains"],
    // 14
    ["Fertile Orchard", "Plains"],
    // 15
    ["Alluvial Plain", "Plains"],
    // 16
    ["Fertile Ground", "Plains"],
    // 17
    ["Lake", "Small Hill"],
    // 18
    ["Loch", "Small Hill"],
    // 19
    ["Volcanic Peak", "Impassable"],
    // 20
    ["Fiery Mountain", "Impassable"],
    // 21
    ["Canyon", "Impassable"],
    // 22
    ["Swampland", "Impassable"],
    // 23
    ["Craggy Peaks", "Large Mountain"],
    // 24
    ["Bleak Mountains", "Large Mountain"],
    // 25
    ["Lonely Peaks", "Large Mountain"],
    // 26
    ["Sharp Crags", "Small Mountain"],
    // 27
    ["Treacherous Mountains", "Small Mountain"],
    // 28
    ["Mountains", "Small Mountain"],
    // 29
    ["Scrubland", "Plains"],
    // 30
    ["Clearing", "Plains"],
    // 31
    ["Tundra", "Plains"],
    // 32
    ["Open Plains", "Plains"],
    // 33
    ["Moor", "Plains"],
    // 34
    ["Plains", "Plains"],
    // 35
    ["Plains", "Plains"],
    // 36
    ["Plains", "Plains"],
    // 37
    ["Plains", "Plains"],
    // 38
    ["Plains", "Plains"],
    // 39
    ["Standing Stones", "Plains"],
    // 40
    ["Barrow", "Small Hill"],
    // 41
    ["Abandoned Mineshaft", "Large Mountain"],
    // 42
    ["Ruined Tower", "Buildings"],
    // 43
    ["Ancient Forest", "Large Forest"],
    // 44
    ["Dolmen", "Plains"],
    // 45
    ["Abundant Quarry", "Small Mountain"],
    // 46
    ["Rich Quarry", "Small Mountain"],
    // 47
    ["Wooded Quarry", "Large Hill"],
    // 48
    ["Rocky Outcrop", "Large Hill"],
    // 49
    ["Landslip", "Small Hill"],
    // 50
    ["Stony Ground", "Large Hill"],
    // 51
    ["Thick Forest", "Large Forest"],
    // 52
    ["Dense Forest", "Large Forest"],
    // 53
    ["Forested Hilltop", "Large Forest"],
    // 54
    ["Wooded Land", "Small Forest"],
    // 55
    ["Wooded Glade", "Small Forest"],
    // 56
    ["Light Woods", "Small Forest"],
    // 57
    ["Plains", "Plains"],
    // 58
    ["Fresh Water", "Fresh Water"],
    // 59
    ["Tidal Water", "Tidal Water"],
    // 60
    ["Shallow Salt Water", "Shallow Salt Water"],
    // 61
    ["Ocean", "Ocean"],
    // 62
    ["Light Woods", "Small Forest"],
    // 63
    ["Rocky Outcrop", "Large Hill"],
    // 64
    ["Clay Seam", "Small Hill"],
    // 65
    ["Faction Hub", "Buildings"],
    // 66
    ["Forbidden", "Buildings"],
    // 67
    ["Barren Wastes", "Plains"],
    // 68
    ["Glacier", "Small Hill"],
    // 69
    ["Frozen Ground", "Plains"],
    // 70
    ["Nunatak", "Small Mountain"],
    // 71
    ["Scoured Bedrock", "Large Hill"],
    // 72
    ["Icefield", "Plains"],
    // 73
    ["Glacial Crevasse", "Large Hill"],
    // 74
    ["Ice cave", "Small Mountain"],
    // 75
    ["Tarn", "Small Hill"],
    // 76
    ["Rogen Moraine", "Large Hill"],
    // 77
    ["Moraine", "Small Mountain"],
    // 78
    ["Kame", "Small Hill"],
    // 79
    ["Drumlin", "Large Hill"],
    // 80
    ["Roche Moutonnee", "Small Mountain"],
    // 81
    ["Ice Holes", "Plains"],
    // 82
    ["Scrubland", "Plains"],
    // 83
    ["Permafrost", "Plains"],
    // 84
    ["Icy Moss", "Plains"],
    // 85
    ["Frosty Heath", "Plains"],
    // 86
    ["Lichen", "Plains"],
    // 87
    ["Petrified Forest", "Small Forest"],
    // 88
    ["Swamp", "Small Hill"],
    // 89
    ["Marsh", "Large Hill"],
    // 90
    ["Bog", "Small Mountain"],
    // 91
    ["Mire", "Large Mountain"],
    // 92
    ["Sand Dune", "Large Hill"],
    // 93
    ["Oasis", "Small Forest"],
    // 94
    ["Playa", "Plains"],
    // 95
    ["Yardang", "Small Hill"],
    // 96
    ["Mesa", "Large Mountain"],
    // 97
    ["Rocky Mountain", "Small Mountain"],
    // 98
    ["Hamada (Stone Plateau)", "Large Hill"],
    // 99
    ["Reg (Gravel Plain)", "Plains"],
    // 100
    ["Cactus", "Plains"],
    // 101
    ["Wadi", "Plains"],
    // 102
    ["Tropical Foliage", "Small Forest"],
    // 103
    ["Light Tropical Cover", "Small Forest"],
    // 104
    ["Palm Trees", "Small Forest"],
    // 105
    ["Dense Foliage", "Large Forest"],
    // 106
    ["Dense Tropical Forest", "Large Forest"],
    // 107
    ["Tropical Hilltop", "Large Forest"],
    // 108
    ["Monsoon Jungle", "Small Forest"],
    // 109
    ["Jungle", "Small Forest"],
    // 110
    ["Damp Jungle", "Small Forest"],
    // 111
    ["Dense Jungle", "Large Forest"],
    // 112
    ["Dense Monsoon Jungle", "Large Forest"],
    // 113
    ["Monsoon Hilltop", "Large Forest"],
    // 114
    ["Light Rainforest", "Small Forest"],
    // 115
    ["Rainforest Canopy", "Small Forest"],
    // 116
    ["Rainforest", "Small Forest"],
    // 117
    ["Dense Rainforest", "Large Forest"],
    // 118
    ["Thick Rainforest", "Large Forest"],
    // 119
    ["Rainforest Hilltop", "Large Forest"],
    // 120
    ["Succulents", "Plains"],
    // 121
    ["Dry tundra", "Plains"],
    // 122
    ["Geyser", "Plains"],
    // 123
    ["Faerie Ring", "Plains"],
    // 124
    ["Cairn", "Small Mountain"],
    // 125
    ["Lighthouse", "Buildings"],
    // 126
    ["Stone Circle", "Plains"],
    // 127
    ["Mountain Cave", "Large Mountain"],
    // 128
    ["Pyramids", "Buildings"],
    // 129
    ["Sphinx", "Plains"],
    // 130
    ["Obelisk", "Plains"],
    // 131
    ["Clock Tower", "Buildings"],
    // 132
    ["Column", "Plains"],
    // 133
    ["Dragon Monument", "Plains"],
    // 134
    ["Heroic Human Statue", "Plains"],
    // 135
    ["Elf Monument", "Plains"],
    // 136
    ["Dwarf Monument", "Plains"],
    // 137
    ["Orc Monument", "Plains"],
    // 138
    ["Blessed Oak", "Large Forest"],
    // 139
    ["Ornamental Gardens", "Plains"],
    // 140
    ["Ornamental Gardens", "Plains"],
    // 141
    ["Mausoleum", "Buildings"],
    // 142
    ["Dark Forest", "Large Forest"],
    // 143
    ["Ancient Lair", "Small Mountain"],
    // 144
    ["Abandoned Lodge", "Buildings"],
    // 145
    ["Deserted Wayhouse", "Buildings"],
    // 146
    ["Rockhewn Monastery", "Buildings"],
    // 147
    ["House of the Spirits", "Buildings"],
    // 148
    ["Forgotten Temple", "Buildings"],
    // 149
    ["Hidden Temple", "Buildings"],
    // 150
    ["Place of High Sacrifice", "Buildings"],
    // 151
    ["Crooked House", "Buildings"],
    // 152
    ["Deserted Monastery", "Buildings"],
    // 153
    ["Dark Temple", "Buildings"],
    // 154
    ["Gypsy Campsite", "Plains"],
    // 155
    ["Abandoned Campsite", "Plains"],
    // 156
    ["Fortune Teller", "Plains"],
    // 157
    ["Fortress of Shadows", "Buildings"],
    // 158
    ["Ancient Claws", "Buildings"],
    // 159
    ["Gathering Place", "Plains"],
    // 160
    ["Temple of Reason", "Buildings"],
    // 161
    ["Steamtastic Brewery", "Buildings"],
    // 162
    ["Brewery Outbuildings", "Buildings"],
    // 163
    ["Cylindroconical Vessels", "Buildings"],
    // 164
    ["Mystic Tomb", "Buildings"],
    // 165
    ["Corrupted Land", "Large Forest"],
    // 166
    ["Altar of Water", "Large Forest"],
    // 167
    ["Altar of Fire", "Plains"],
    // 168
    ["Altar of Air", "Large Hill"],
    // 169
    ["Altar of Earth", "Large Mountain"],
    // 170
    ["Activated Standing Stones", "Plains"],
    // 171
    ["Bankside", "Plains"],
    // 172
    ["Beach", "Plains"],
    // 173
    ["Shallow Coastline", "Plains"],
    // 174
    ["Coast", "Plains"],
    // 175
    ["Coniferous Thick Forest", "Large Forest"],
    // 176
    ["Coniferous Dense Forest", "Large Forest"],
    // 177
    ["Coniferous Forested Hilltop", "Large Forest"],
    // 178
    ["Coniferous Wooded Land", "Small Forest"],
    // 179
    ["Coniferous Wooded Glade", "Small Forest"],
    // 180
    ["Coniferous Light Woods", "Small Forest"],
    // 181
    ["Snowy Thick Forest", "Large Forest"],
    // 182
    ["Snowy Dense Forest", "Large Forest"],
    // 183
    ["Snowy Forested Hilltop", "Large Forest"],
    // 184
    ["Snowy Wooded Land", "Small Forest"],
    // 185
    ["Snowy Wooded Glade", "Small Forest"],
    // 186
    ["Snowy Light Woods", "Small Forest"],
    // 187
    ["Temperate Thick Forest", "Large Forest"],
    // 188
    ["Temperate Dense Forest", "Large Forest"],
    // 189
    ["Temperate Forested Hilltop", "Large Forest"],
    // 190
    ["Temperate Wooded Land", "Small Forest"],
    // 191
    ["Temperate Wooded Glade", "Small Forest"],
    // 192
    ["Temperate Light Woods", "Small Forest"],
    // 193
    ["Scorched Forest", "Large Forest"],
    // 194
    ["Petrified Forest", "Large Forest"],
    // 195
    ["Deadvlei Forest", "Large Forest"],
    // 196
    ["Parched Bones", "Plains"],
    // 197
    ["Dead Water", "Ocean"],
    // 198
    ["Obsidian Mountain", "Obsidian Mountains"],
    // 199
    ["Glassy Crag", "Obsidian Mountains"],
    // 200
    ["Volcanic Mountain", "Obsidian Mountains"],
    // 201
    ["Lava Peak", "Obsidian Mountains"],
    // 202
    ["Active Peak", "Obsidian Mountains"],
    // 203
    ["Emerging Mountaintop", "Obsidian Mountains"],
    // 204
    ["Glassy Mountain", "Obsidian Mountains"],
    // 205
    ["Lava Pool", "Obsidian Mountains"],
    // 206
    ["Magma Rift", "Obsidian Mountains"],
    // 207
    ["Abandoned Lair", "Buildings"],
    // 208
    ["Ancient Graveyard", "Buildings"],
    // 209
    ["Broken Tower", "Buildings"],
    // 210
    ["Dormant Portal", "Buildings"],
    // 211
    ["Fallen Dwarfhold", "Buildings"],
    // 212
    ["Fortified Hostel", "Buildings"],
    // 213
    ["Lawstones", "Buildings"],
    // 214
    ["Sacrificial Altar", "Buildings"],
    // 215
    ["Tiki Pole", "Small Forest"],
    // 216
    ["Weeping Willow", "Small Forest"],
    // 217
    ["Crumbling Lighthouse", "Buildings"],
    // 218
    ["Fisherman's Hut", "Buildings"],
    // 219
    ["Seahenge", "Buildings"],
    // 220
    ["Ferry Post", "Buildings"],
    // 221
    ["Head Statue", "Buildings"],
    // 222
    ["Jungle Standing Stones", "Buildings"],
    // 223
    ["Shattered Head", "Buildings"],
    // 224
    ["Shipwreck", "Buildings"],
    // 225
    ["Shipwreck", "Buildings"],
    // 226
    ["Shipwreck", "Buildings"],
    // 227
    ["Shipwreck", "Buildings"],
    // 228
    ["Shipwreck", "Buildings"]
    // 229
  ];
  var SETTLE_TERRAINS = [
    "Plains",
    "Small Forest",
    "Large Forest",
    "Small Hill",
    "Large Hill",
    "Small Mountain",
    "Large Mountain"
  ];
  var NODE_CLASS_TERRAIN = /* @__PURE__ */ new Set([40, 41, 42, 43, 44, 45]);
  var SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));
  function descriptorFor(i) {
    const named = TERRAIN_NAMES[i];
    const entry = TERRAIN_DESCRIPTORS[i];
    if (!named && !entry) return null;
    const base = {
      i,
      name: named?.[0] ?? entry.name,
      terrainClass: named?.[1],
      nodeClass: NODE_CLASS_TERRAIN.has(i) || void 0
    };
    if (!entry) return { ...base, bonusUnread: true, conditional: false, sovKey: null };
    const sov = entry.building ? SOV_STRUCTURE_BY_NAME.get(entry.building) : void 0;
    return {
      ...entry,
      ...base,
      sovKey: sov?.key ?? null,
      conditional: !!entry.building && !sov
    };
  }
  var BASIC_RESOURCES = ["wood", "clay", "iron", "stone"];
  var RESOURCE_BOOSTERS = {
    wood: "Carpentry",
    clay: "Kiln",
    iron: "Foundry",
    stone: "Stonemason"
  };
  var RESOURCE_BOOSTER_BONUS = 40;
  var UPKEEP_BUILDINGS = [
    { key: "spearmensBillets", group: "Military", name: "Spearmens' Billets", consumes: { clay: 2700, iron: 1100 } },
    { key: "archersField", group: "Military", name: "Archers' Field", consumes: { wood: 2700, iron: 1100 } },
    { key: "infantryQuarters", group: "Military", name: "Infantry Quarters", consumes: { iron: 1100, stone: 2700 } },
    { key: "cavalryParadeGround", group: "Military", name: "Cavalry Parade Ground", consumes: { wood: 1100, clay: 2700 } },
    { key: "arcticWarfareCollege", group: "Military", name: "Arctic Warfare College", consumes: { iron: 1e3, stone: 2300 } },
    { key: "desertWarfareCollege", group: "Military", name: "Desert Warfare College", consumes: { clay: 2300, stone: 1e3 } },
    { key: "jungleWarfareCollege", group: "Military", name: "Jungle Warfare College", consumes: { wood: 2300, clay: 1e3 } },
    { key: "scoutsLookout", group: "Diplomacy", name: "Scouts' Lookout", consumes: { wood: 700, clay: 1500 } },
    { key: "spiesHideout", group: "Diplomacy", name: "Spies' Hideout", consumes: { wood: 700, clay: 1100, stone: 1100 } },
    { key: "thievesDen", group: "Diplomacy", name: "Thieves' Den", consumes: { wood: 1700, clay: 1100, iron: 1700 } },
    { key: "saboteursSanctuary", group: "Diplomacy", name: "Saboteurs' Sanctuary", consumes: { wood: 2700, clay: 1500 } },
    { key: "assassinsAbode", group: "Diplomacy", name: "Assassins' Abode", consumes: { iron: 3100, stone: 1900 } },
    { key: "foreignOffice", group: "Diplomacy", name: "Foreign Office", consumes: { clay: 400, iron: 800, stone: 1600 } },
    { key: "runemastersGrounding", group: "Magic", name: "Runemasters' Grounding", consumes: { clay: 900, stone: 1700 } },
    // Separate from geomancerRetreats: Nature's Bounty can be cast from another city.
    { key: "geomancersRetreat", group: "Magic", name: "Geomancers' Retreat", consumes: { wood: 700, clay: 2300, stone: 1500 } },
    {
      key: "chanceryOfEstates",
      group: "Sovereignty",
      name: "Chancery of Estates",
      consumes: { wood: 800, clay: 3200, stone: 1600 },
      hint: `Also takes ${CHANCERY_DISCOUNT_L20 * 100}% off the first level of every claim, and each further one half as much again.`
    },
    { key: "tradeOffice", group: "Trade", name: "Trade Office", consumes: { wood: 2800, clay: 690, stone: 1580 } }
  ];
  var BASIC_YIELD_L20 = 2538;
  var PRESTIGE_PRODUCTION_BONUS = 20;
  var PRESTIGE_KEYS = [...BASIC_RESOURCES, "food", "research"];
  var PRODUCTION_LABEL = {
    wood: "Wood",
    clay: "Clay",
    iron: "Iron",
    stone: "Stone",
    food: "Food",
    research: "Research",
    gold: "Gold"
  };
  var MINIMUM_KEYS = [...BASIC_RESOURCES, "food", "research"];
  var DEFAULT_CITY_CONSUMPTION = 30800;
  var FLOUR_MILL_L20 = 40;
  var NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];
  var FAMINE_MANAGEMENT = 10;
  var SOIL_ENRICHMENT = 15;
  var LIBRARY_BASE_RP_L20 = 1013;
  var LIBRARY_LEVEL = 20;
  var ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;
  var ALLEMBINE_RP = ALLEMBINE_RP_PER_LIBRARY_LEVEL * LIBRARY_LEVEL;
  var OVERFLOWING_INSIGHT_FRACTION = 0.5;
  var OVERFLOWING_INSIGHT_RP = LIBRARY_BASE_RP_L20 * OVERFLOWING_INSIGHT_FRACTION;
  var PLOT_KEYS = ["wood", "clay", "iron", "stone", "food"];
  var PLOT_TOTAL = 25;
  var DEFAULT_SETTINGS = {
    tMin: 50,
    plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 },
    // must sum to 25
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
      wood: false,
      clay: false,
      iron: false,
      stone: false,
      food: false,
      research: false
    },
    rClaim: 2,
    maxBuildings: 20,
    dOther: 10,
    dOwn: 3,
    // Confederates are not allies here, and use dOther.
    dAlliance: 3,
    // SETTLE_TERRAINS a site must stand on; empty allows any.
    siteTerrains: [],
    // Key into SOV_STRUCTURES; null plans food only.
    milsovStructure: null,
    // Sites below this military bonus are not listed; it never changes a plan.
    milsovMinBonus: 0,
    ownClaimsAvailable: false,
    autoMinimizeOffMap: true,
    mapOverlay: true
  };

  // src/payload.js
  function tileKey(y, x) {
    return `${y}|${x}`;
  }
  function parseKey(key) {
    const [y, x] = key.split("|").map(Number);
    return { x, y };
  }
  function onScreen(payload) {
    const { x, y, zoom } = payload ?? {};
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(zoom)) return null;
    const data = {};
    for (const [key, tile] of Object.entries(payload.data ?? {})) {
      const t = parseKey(key);
      if (Math.abs(t.x - x) <= zoom && Math.abs(t.y - y) <= zoom) data[key] = tile;
    }
    return { ...payload, data };
  }
  function parseRs(tile) {
    if (!tile || typeof tile.rs !== "string") return null;
    const parts = tile.rs.split("|").map(Number);
    if (parts.length !== 5 || parts.some(Number.isNaN)) return null;
    return { wood: parts[0], clay: parts[1], iron: parts[2], stone: parts[3], food: parts[4] };
  }
  function foodOf(tile) {
    const rs = parseRs(tile);
    return rs ? rs.food : 0;
  }
  var WATER_BIOME = 20;
  function isWaterTile(tile) {
    if (Number.isFinite(tile?.b)) return tile.b === WATER_BIOME;
    const rs = parseRs(tile);
    return !!rs && rs.wood + rs.clay + rs.iron + rs.stone === 0;
  }
  function indexPayload(payload) {
    const claims = /* @__PURE__ */ new Map();
    const towns = /* @__PURE__ */ new Map();
    for (const [key, claim] of Object.entries(payload.s ?? {})) {
      claims.set(key, claim);
    }
    for (const [key, town] of Object.entries(payload.t ?? {})) {
      towns.set(key, town);
    }
    return { claims, towns };
  }
  function claimLevel(claim) {
    const n = Number(String(claim?.s ?? "").split("|")[0]);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  }
  function townIdentity(town) {
    const text = (v) => String(v ?? "").trim();
    const rec = townRecord(town);
    const parts = rec ? null : townString(town).split("|");
    return (rec ? [rec.TownName, rec.TownId] : [parts[0], parts[1]]).map(text).filter(Boolean);
  }
  function townPlayer(town) {
    const rec = townRecord(town);
    return String((rec ? rec.Player : townString(town).split("|")[10]) ?? "").trim();
  }
  function isTownsClaim(claim, town) {
    if (!claim || !town) return false;
    const player = townPlayer(town);
    if (!player || String(claim.pn ?? "").trim() !== player) return false;
    const own = townIdentity(town);
    const names = claim.t && typeof claim.t === "object" ? townIdentity(claim.t) : [String(claim.t ?? "").trim()].filter(Boolean);
    return names.some((n) => own.includes(n));
  }
  function isClaimable(tile, key, idx, settings2) {
    if (!tile || tile.sov !== 1) return false;
    if (tile.imp || tile.brg) return false;
    const claim = idx.claims.get(key);
    if (claim) {
      return isTownsClaim(claim, settings2?.homeTown) || claim.rd === "Yours" && !!settings2.ownClaimsAvailable;
    }
    return true;
  }
  function heldLevel(key, idx, settings2) {
    const claim = idx.claims.get(key);
    if (!isTownsClaim(claim, settings2?.preserveTown)) return 0;
    return claimLevel(claim) ?? 0;
  }
  function isSettleable(tile) {
    if (!tile) return false;
    if (tile.set !== void 0) return tile.set === 1;
    if (tile.imp || tile.brg || tile.npc) return false;
    if (isWaterTile(tile)) return false;
    return tile.sov === 1 && tile.hos === 1;
  }
  function townRecord(town) {
    if (!town || typeof town !== "object") return null;
    const isRecord = (o) => !!o && typeof o === "object" && typeof o.TownName === "string" && o.X !== "" && Number.isFinite(Number(o.X)) && o.Y !== "" && Number.isFinite(Number(o.Y));
    if (isRecord(town)) return town;
    for (const v of Object.values(town)) if (isRecord(v)) return v;
    return null;
  }
  function townString(town) {
    if (typeof town === "string") return town;
    if (!town || typeof town !== "object") return "";
    for (const v of Object.values(town)) {
      if (typeof v !== "string" || !v.includes("|")) continue;
      const parts = v.split("|");
      if (parts.length >= 4 && Number.isFinite(Number(parts[2])) && parts[2] !== "" && Number.isFinite(Number(parts[3])) && parts[3] !== "") {
        return v;
      }
    }
    return "";
  }
  function extractTowns(payload) {
    const out = [];
    for (const [key, town] of Object.entries(payload.t ?? {})) {
      const rec = townRecord(town);
      const parts = rec ? null : townString(town).split("|");
      const x = Number(rec ? rec.X : parts[2]);
      const y = Number(rec ? rec.Y : parts[3]);
      const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
      out.push({
        ...pos,
        name: (rec ? rec.TownName : parts[0]) ?? "",
        own: town && town.rd === "Yours",
        // Confederates ("Confed ") are kept at a stranger's distance.
        ally: town && town.rd === "Alliance",
        rd: town && town.rd,
        key
      });
    }
    return out;
  }
  function inWorld(x, y) {
    return x >= WORLD_MIN_X && x <= WORLD_MAX_X && y >= WORLD_MIN_Y && y <= WORLD_MAX_Y;
  }
  function collectNeighbourhood(payload, key, rClaim, idx, settings2) {
    const { x, y } = parseKey(key);
    const neighbours = [];
    const missing = [];
    let ring = 0;
    for (let dy = -rClaim; dy <= rClaim; dy++) {
      for (let dx = -rClaim; dx <= rClaim; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (!inWorld(x + dx, y + dy)) continue;
        ring += 1;
        const nKey = tileKey(y + dy, x + dx);
        const tile = payload.data[nKey];
        if (!tile) {
          missing.push(nKey);
          continue;
        }
        if (!isClaimable(tile, nKey, idx, settings2)) continue;
        const held = heldLevel(nKey, idx, settings2);
        const claim = idx.claims.get(nKey);
        neighbours.push({
          dx,
          dy,
          food: foodOf(tile),
          key: nKey,
          i: tile.i,
          water: isWaterTile(tile),
          // Costs downstream are for the levels above this.
          held,
          // A claim stands here that the plan does not keep and prices as bare
          // ground.
          relaid: held === 0 && !!claim,
          descriptor: descriptorFor(tile.i)
        });
      }
    }
    return { neighbours, missing, ring };
  }

  // src/capture.js
  var IN_PAGE_NAMES = ["mapData", "MapData", "gameMap", "Map", "worldMap", "lastMapResponse", "tiles"];
  function looksLikeMapPayload(obj) {
    return obj && typeof obj === "object" && typeof obj.zoom === "number" && obj.data && typeof obj.data === "object" && Object.keys(obj.data).some((k) => k.includes("|"));
  }
  function readInPageData() {
    if (typeof window !== "undefined") {
      for (const n of IN_PAGE_NAMES) {
        try {
          if (looksLikeMapPayload(window[n])) return window[n];
        } catch (_) {
        }
      }
    }
    return null;
  }
  function getLatestPayload() {
    return onScreen(readInPageData());
  }
  function whenViewLoaded(view, onLoaded) {
    const $ = window.jQuery;
    if (typeof $ !== "function") return null;
    const stop = () => $(document).off("ajaxComplete", onLoad);
    function onLoad() {
      const p = readInPageData();
      if (p?.x !== view.x || p.y !== view.y || p.zoom !== view.zoom) return;
      stop();
      onLoaded();
    }
    $(document).on("ajaxComplete", onLoad);
    return stop;
  }
  function probeInPageData() {
    const hits = [];
    for (const n of IN_PAGE_NAMES) {
      try {
        if (looksLikeMapPayload(window[n])) hits.push({ source: `window.${n}`, value: window[n] });
      } catch (_) {
      }
    }
    return hits;
  }

  // src/app-icons.js
  var CROWN_MASK = '<path d="M19.5 39.5 L18 24.5 L26 30.5 L32 20.5 L38 30.5 L46 24.5 L44.5 39.5 Z" fill="#fff" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/><rect x="19.5" y="43" width="25" height="4.5" rx="2.25" fill="#fff"/>';
  var APP_ICON_SVG = `<svg class="sov-app-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sovereignty Site Scanner"><defs><linearGradient id="sov-app-icon-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fbf6a"/><stop offset="1" stop-color="#11806a"/></linearGradient><linearGradient id="sov-app-icon-gold" gradientUnits="userSpaceOnUse" x1="18" y1="19" x2="46" y2="48"><stop offset="0" stop-color="#fff4c2"/><stop offset=".3" stop-color="#f4c94a"/><stop offset=".52" stop-color="#c98a14"/><stop offset=".7" stop-color="#f7d873"/><stop offset="1" stop-color="#b5770f"/></linearGradient><mask id="sov-app-icon-crown">${CROWN_MASK}</mask></defs><rect width="64" height="64" rx="15" fill="url(#sov-app-icon-fill)"/><circle cx="32" cy="32" r="26.5" fill="#fff" fill-opacity=".24" stroke="#000" stroke-opacity=".22" stroke-width="3"/><g mask="url(#sov-app-icon-crown)"><rect x="10" y="15" width="44" height="38" fill="url(#sov-app-icon-gold)"/><g transform="rotate(25 32 34)"><g class="sov-app-icon-glint" transform="translate(-46 0)"><rect x="24" width="6" height="70" fill="#fff" fill-opacity=".6"/><rect x="33" width="2.5" height="70" fill="#fff" fill-opacity=".45"/></g></g></g></svg>`;
  var glyph = (body) => `<svg class="sov-glyph" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  var GLYPHS = {
    search: glyph('<circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 14 14"/>'),
    target: glyph('<circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="1.8"/><path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15"/>'),
    city: glyph('<path d="M2 14V7.5l2-1.5 2 1.5V14M6 14V4l2-2 2 2v10M10 14V7.5l2-1.5 2 1.5V14M1 14h14"/>'),
    chevron: glyph('<path d="M6 4l4 4-4 4"/>'),
    changelog: glyph('<path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M6 8h4M6 11h4"/>')
  };

  // src/changelog.js
  var CHANGELOG = [
    {
      version: "2.0.0",
      date: "2026-10-12",
      changes: [
        "Site Search numbers its top ten right on the World Map. Click a row to find its tile, or click a number to jump to its row.",
        "Only want to settle in the hills? Pick the terrain a site must stand on under Site Filters, now on the Site Search tab as well as in City Configuration.",
        "Optimal Sovereignty draws its whole plan on the World Map: the radius, your food and military claims, the claims you\u2019re keeping and anything you\u2019ve crossed out. Drag the tax slider and watch it redraw.",
        "Prefer a clean map? Untick Mark sites on the World Map under \u2699 and the panel keeps its pens to itself.",
        "New Pick on map button: press it, click a tile, done. No more squinting at coordinates.",
        "Plan hanging off the edge of the screen? Click Centre the map and it hops over and plans again once the map has loaded.",
        "New City Buildings section in City Configuration. Tell it how many of your level 20 military, diplomacy and magic buildings eat basic resources, and their upkeep gets paid before any sovereignty.",
        "The Chancery of Estates discount only applies to the first level of each claim, just like in game. Build more than one and their discounts stack.",
        "City Configuration sections fold down to a one-line summary, so you can see your whole city at a glance.",
        "A shiny new crown icon, bigger when the panel is folded. Hover over it for a little sparkle.",
        "The folded panel stays where you left it after a reload, instead of creeping in from the edge.",
        "Optimal Sovereignty on another player\u2019s city now counts the sovereignty that city already holds, so you can plan a friend\u2019s town too.",
        "The game\u2019s own styles can no longer creep into the panel.",
        "Tooltips match the panel and appear sooner, and a plan tile\u2019s tooltip lists what the tile is, then its food, distance and cost, each on a line of its own.",
        "The guide on GitHub now has pictures of every tab, so you can see what each one shows before you try it."
      ]
    },
    {
      version: "1.2.1",
      date: "2026-09-27",
      changes: [
        "Scan and Optimise only look at the tiles on your screen, not everywhere you\u2019ve panned past since opening the map."
      ]
    },
    {
      version: "1.2.0",
      date: "2026-09-23",
      changes: [
        "Fixed Preserve Existing Sovereignty: it keeps only the planned town\u2019s own claims, and raising one of them costs just the extra levels.",
        "Turn Preserve Existing Sovereignty off on one of your towns to plan it from scratch. Handy for tearing up an old layout.",
        "The game\u2019s Check All button no longer sneaks in and ticks the scanner\u2019s settings.",
        "Long explanations moved into tooltips, and Optimal Sovereignty nags less about tiles."
      ]
    },
    {
      version: "1.1.2",
      date: "2026-09-04",
      changes: [
        "Sites at the very edge of the world get scored too.",
        "Barren land like Marsh and Fen is no longer mistaken for water.",
        "Tax can\u2019t drop below 0%. A site that can\u2019t support any tax is shown at 0% with its shortfall, so you can see how far off it is.",
        "Alliance members\u2019 claims are no longer shown as up for grabs.",
        "Fixed checkbox settings switching themselves on when nobody asked."
      ]
    },
    {
      version: "1.1.1",
      date: "2026-08-31",
      changes: [
        "Research estimates are closer to what the game shows: Allembine and Overflowing Insight add their research after tax.",
        "Claim costs round distances the same way the game does, so the numbers match down to the gold piece."
      ]
    },
    {
      version: "1.1.0",
      date: "2026-08-30",
      changes: [
        "The panel tucks itself away when you leave the World Map. Not a fan? Untick Minimise when off the World Map under \u2699.",
        "Optimal Sovereignty\u2019s town list shows your towns by name and keeps up as you move the map.",
        "The Sovereignty Radius hint follows the Claim Radius you set.",
        "A new icon."
      ]
    },
    {
      version: "1.0.1",
      date: "2026-08-24",
      changes: [
        "Drag the panel anywhere by its title bar. It remembers where you left it.",
        "The scanner only reads the map the game has already loaded, and never touches your connection to the game.",
        "Fixed the starting research figure for a city.",
        "Added the licence and copyright notice, behind the \u24D8."
      ]
    },
    {
      version: "1.0.0",
      date: "2026-08-22",
      changes: [
        "First release! Site Search, Optimal Sovereignty and City Configuration."
      ]
    }
  ];

  // src/game-icons.js
  var PNG = "data:image/png;base64,";
  var ICONS = {
    wood: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACFElEQVR4Xu3TT0hUURTH8TfmWFSDzNDMq5waQbAWak3qSBKljWHUGIhaKIabEGZsIaYmObgZBAuNXBQEE4YWsxIiNy+wFhpofzBX7Wwl4qqIgXZ6PL+L5zJPKypctvhyuYv7OecxahDRjvYftLeydIc2+3fwcW8BIY8ry+Bo824bgDt6+uTh78HB7tq2tkge3eu7tA5IwNWVpV0A5f5H4NlTbgeA8uLD1N5yRjBdKJh/bSuYmkj+GrzfFbbqqvIVlLvPUOfHyRuEjePRkB5wsepYsuh4IAiwp6djO/jgVk0jR9cjgTQe41G0uUQDfp+TKoOmDNAbd7SUWqUh/7nFD3dzuWzOwSlwilOAz51NFSdMAizAlXAhMD0AQ/tiYQ3jR/r0fugVY1kCfmu6cKhbfc5pr+0xwJH+OkAyQOMVJ33AVPOzifTsm4HvDOcA1MjNqwFAGjQ9Tsrz5tgG4Gy9fIRqK730bDz2lbf6khqPyaarAJeBul3ORUCSPK6vPqhBv7kXn6w/9fNCr2puJqG3BZgAKPncu0cFOF9+gNobjuoB1WUehXv2O+jlZJdGeENsh4YBDmSC8reIU5IBkvWik2am4wp79zaxjpM/PcWnARDFuEcZ4E8H+M09VFTgsm322uqPMzYKjDcU0B4DBgO4JzMGrMm2z8eiPwAyEAEkyX8KHv9VAHgrJ07e0rCmbuOOFLijbQAdponiH+6yGAAAAABJRU5ErkJggg==",
    clay: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEaklEQVR4XqzOz0tUURjH4e977jn3znWcMWfUQAWNARMlSt2ILYLoxzYiCCKCMNy4adnCCFr0B0QEEUGt2rRw3yIocNOi0tBIUcqZ0XGU7ozO3HvuPfec7qZoEHe98Nk+75eMMfifRw+vTB0JaBXhwdysDeBMUiFpy2gNYuw9AI2wgQ8fF1Hf/Alu2wAAfhR2/95MDsB8UiZpNAkJJrSOsbmyVA0Df39oYlJOTpx+/vVg/dnY5esOgMahhQlExpgnAKaJ6M9TS6kIpdVvCBoHyOa60N0/YCzOSZtYq4Yn1f6WlTo+fPHQwgTjcaxn/ECSY9Ga1DjplUvwyt9RKW7h3LWb2KvuIPB9Ygm3vbG6u770OR9KaTmphSl6fPt8C/hlsThS6GSfMizW3BAX2uJgwJv1ALfGOqDCCHsqgi8VuvLt6OuwDTFQT1c7vHpQ4U9fLreAl852vnAQ2m1GGMUMWQBM0k7NQ6ki0J3iUEzDERZK2zWMFE6YlE3IpW14Nb+T7RqJf2sGUWGh2EDKVeSmAEqSrkE+I1CVMboHssi0CdiCkHE5bNth+Q4XBoQ4NoK/ezXdsnDu0WtnvMeFjiyUQwt96RiCBGSowAlQkYawCGEINMMYwuYAMfKaGsJxKjwOVAvoS12dX65mZyd60dseQ8UGv6SC50coNyW0YCAiMEbgSWlhUNwJsVauo8eNR+lU/+BfbHFzAzfGh9+u/KhcUDqCLdIIlQYgQQRkUhwGBJcDg7ksyvUmlDEY6j2Gu3euwqr/rqpsWqKKwgD8nHOPd+bO1x1ThwzRKClrY7mIqBZGrdq0MWgT0Y9oGbXsH7TxDwTupCCQNmVIhIqFpBGTluPHfOrcuXPvzL3nNAVC7Z7Vw8v78PL+mFcXxlwAXr5fZfbZXbHn69mbZ9O3T7s2m5U2SekQRg4fdg+xlUU+ncK2bcYKkjtXCvTnHIbPTHCy4PLtZ3BDLS1WefJ0KgN4gDyTjx+7tiLvKK6NZFBWjnw+ZrHkMT7s8nB6hO1Si063Q63iMXwig+2XqG7scFStJ2VP5gBve9PVjGFl+8BzkkpiEFj2ELE5pNZsI4QgZSs2NivU6k0qdZ/gTyhLIIUBIXtRbEcCs8AU0C8EE2M5tduJDJawaTuK5Xo/oUr1ZGmchM3cWotsPk0cazDQiWN6SBSD3wqQwC3AAgDU6GC6gxH4fozbw6vnJc1YEGv+rmHm+iBuNkkqoYi0IZuykRL2qh0SmSwKSP97yk5CNapeyD5tvqyGZnzAFjuHAX5Yp9XK0yhXWdcGYzRCQKx1jw3FA48jv6sVII5lQLTw1X8xOWjuh5EWGaHFfj0CbbCkZO5TkalTGUZdmz5LAbC25bGwVmSr3CKK9DsJXAaeAzuAmnkw+SpKJleaXVM2QphAyHC7GTU6MWWDKC6XvKOlX61miAq+Ryp+/blMI+hGUvJoaMCZ/u8F9Er3HTMggRgwgC6+WTXzm3UA7l0cIIg0G6HKXTpXUB/XdwMgAPRv7WwOEcvP1YYAAAAASUVORK5CYII=",
    iron: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACUUlEQVR4Xq2SO2iTYRSG/2CLODgUHEQcpFpJrEmUguBlclAESRVbc782TWL+JmlKpEWUWqt0cBFxKcUhCCooiJcOVYJFqItLoYKIoOCNFlEQdc3rOQcPfJpY8DI8JN/7c57z53tjAfivSHDm0K6m1GamWcCfq4lVfyFU0V3H3IPb7bP37zyszdz79GHxHZiAbx9IDOMsPJmbZSRToYrWEdeIz0SdwOtXL8xBUyRyXXDrxlVcODssQpUNEN8eP6rh2dN5LL1/oyJ9I/NswqKfhReTe61y5dh4PuGvRw4fQKznILxbOpCZGkMq4EOoez+CxFbnRoSr4ypWVMbPPorQ6VhrdVaLsNNB2H1BFPrDcLs2gbNyJoISZfl4L/bs2PY7Iee8sEWEa6w2EVbycQwXUrCTfn74QxhGxU7ATgXQ5XGJsExnhYQq41KWRLhQrYjQQH9e08xEZVqMCOcnB1lo0TYW/SlajCBC9/oNIjTv5+XzBdno9boULkRzs3GzFIjw6G6vNX0pChXq3Sh6n8FkD2fLldImwstj3SBUqFLBFKbPH0fOjjUIjVLeypsZwmaosIHw5KmGUliospHlCnDTH93jccpdetxOzU2ZYE2N+hYJ2TiYj0sZN69f4UEWmWU0FKTlaCmECL+o8HQlh2JfEEPZCIrZqJYBuz+EXMIvwzu73JIVMhEtRWXwdm4W4VcVcgkTJ4rIxHrluwrPjQzgZCmN0aEsD0lWykVRSodUyDljsbCDmODgH7FECECggOWtBiuJFmIF4dABkyPb21t/zb4DoYVnQN+VdjQAAAAASUVORK5CYII=",
    stone: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAB00lEQVR4Xq3Sv0tyURjA8es17F6jXjLrRapbYkoO9lPIBLHBoMbeKRcHx6ApLOMdgmjRG84OLa+T/0JIS0iLLa6RtPQPtPVOT89z4DmcvBcxavhyOFzOh/PjagDwow0EVlcSerfb7WGg9C3Qh90zpjQ82L8YQVG5fCwrFovj2HCg3zTADa3X63B5ec5g6SvgGwG1Wo0ihEGJNhoNgtUcIGMjWIeP2AdyBFJDgR7sTgUpAo1Rn2gns00YN9QOn/t3GIsuQbPZlBUKBdB1XdZut0cwBiWmt1qtVxzVVxWg329CtVqVYCQSYZwj1MQ+gV7svxtoGqMESnQ3l4NKpcJXosIOEHCXDpDmjNEYi0YJZEzitm0vOEBGGaRFvybG1R3SvTGiJv5ZFTQYpA+BQAAsy4Lw4gLMhaYhPB8SY3zJgjG/6ZoE/139mcX2GFR389jpyIJTkzznCOI5nUhgF9gDBgyelk4oRikx1zSNjkYLZSsJed8SfMLADeRHoAjM5w8FeG3bfG8E0sgJ8C8GHINqjP6eCTI0EDzDbgeBfGS6L/oeX45BKrUlHyObzYpxcy0hQO4IO8V6hLiV2QjvI0jIO/aCO9JuLg6MbHrdSCaT3vSq5fkA0AumcNkRmm0AAAAASUVORK5CYII=",
    gold: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAE8klEQVR4XmXTaVBTVxyH4VMcREggGJYYSMISSEISwipVjIoJiwuoiKAomCqLYsARQS1DBKs2ihWndSuLVQvOyNTWKp3pVJ22Y9UK1qptFW0RtK2tioCAgiDe++tJBlMcP7wz98OZZ/5nuQQA+blhDWmuLyAPLheRjmvF5IeafDLYXkJePFhHmIclpPMXfzBPtYuZnll5bNey5ejK0uLxu0K2azGxdPH9ENK8W2O13gAfXSkiP9UX2b0cFDkP9U2pYHr1TX+efBtAnzX6bY3p0/2Bp7PLO1uUcrrWjvYm+G9TEem9W0LOVS+zP1blkT30zJ9hnsvA9i9Az9W5eAVTwIozg/4YeCzp7GwJinkDbKrLJ51XSwhQRn48lUTSdZ7nL+4XouVSMtgXHwLD+wHWAMv2wUjB9IZj+H4w7nw2AT2/FmS+Bt5q3EhavzZZxh77pCOyEkzxEWOa4O6ZUm+sinXB54eN+K7RhE8PrMSJg554ck2N7nPhGPwiGm17ZGg/EV/wGrivYBKpLdbarVsoTLvQ6Nf/961I3L6eA3OWEClhjjAmeSErQQBve4LZCh5ubqfIARW6j2nQVObReKXCT31zr+p/cLXOhRTE0hL4FbuW8LAj1wf7KlKwZUMctApXLIsXoyhdgTDROGRqXXG/KhA3KqRoOxzaYLllOh3n1cVYwaQwZzI33JlsSnE/+pFBgHemcJAY6Y6lCXJo5TxMU3ARp3FDmHgcpit5KM9Qo8EswGB3zj12uLTt2cOQgxRzsIE6JcdaZaZn4Y4lHi1pUc6YF8Vn06YK2KkyDib6OtG4mKVxwfelUlyqDUBvjxOAQrAvq9F+embvg4upk21gfDCXxKm5hE4XWZnhaUxQc8+unClkTJlyVq/iIcqPgxkKF1x4T4rbR/wxPMADw+bgxe+VGDg5ETcrpej5bXWcDTy4eR4py5pkAa2ZFnhItqZ5VuTFufeFi+0RIXFEQqgbkqMFiPRxgEbsgBy9G86b5eg9HobW6kC0NoRmUtDOClZvSiI1ZXNt4F9ny98K9bYfo1c53dIGONLtOkIr4yE6wAXTAjlIjnRF4Rx37MwOQG1uEAZa3cEMaaopyLeBNBvYXL9y7Ip4X3mwcMyNMyZfJIVyERPkjNkRbpgT4ozcWA+sXxQIc3YQru0OB9vtheF+VR0FuTbQVvl8snNVJJkfwfvWMJWHunwv5OldYYgTY9W8AISLHCBzt0dhvAs66tRorwpBf6v6+sPmwMW2M6SQHc2HZvi4NHHryb2G7HSdtOXKdl9kTxuP6TIn5Cb5ITdRihCvsVCJONi4UAJzjhJ7VgTgzqEoC2Y3GvSmHaexNBzZtgAZOgkOLBdgR7oAC6MnoCBVjsQoT8xUc+jUEuxdE4z1qUG4fMib/sv6PIo5jAaTaRipq96cejp5srBjcwofuTo+EiP41kuJkDjAEOOBL8vU2LxcgWP5GuAfEX3gwYcpJhsNGmmDtCHaI/qMvtleMOP82lmez6f4O2KpXsIuihGxxng3tjZPwl7+IAi7Vyjw1ScKsIz4zGC3eBfF+KNBf1ot7b4FrDJZt31vm1HfNknKtZ7fGrrlCPE4zAkfj5pCFUwZShwtDzw13C+ynJ8zjYwGLbnSfEdwDW3toS3zq3YVxpr3bEiYXrhIoZzo46iMC+ErizODlatTVcqaLMX4EcjWfzSxPIPprI33AAAAAElFTkSuQmCC",
    food: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAErUlEQVR4XlSMXUhTYRyHf7Wx2bRNWw7ywjboC+kmwehm1IJRQnfixbrIC8EwRmAoQRe7XSM9EIJiOecUUbQiQQQHogh+QfuwJa6Bis2jbmvLw+ZZbDu8nfe9iO2Fh9+fB94HhBCGg3ODxO0GGT11A+4PjfJN9ud6lulSJ29MJkpvRthu3Z541pGZa1PJVMqgLMg+xjprk5tvqugdm7IS5oI28sVxRym7XGTsoUgdJey2LNHlZ9uEnzPPPzn7nMrzKHmjIwIHlSLhXwqtUzExGWE+cfgbt4w1BQAV/lD8QnLrG/NanfoBxL+ou3dRe1KQvGYjf640WLX9fVfzqnUcfDR6Ox0pQqerYEHD3ZtsSTKOp68t6ONOsOgJoN58DchJ+OzyJZKn1QupTF2xNJi9fMPcfdV0Hf4QjyHXV6iUBC+avdibD8M9EmDR9y9n8db7BEHfFuYH/ei1TwN/hPaWznd5CSClQexMcmdqTaW+xqDf2ft1+t8f7KYhihI8XBDHggK9Ng/z6vwZ1E2t948ffVyg4rBQi7Jgg60LG4tr6bUfQksWmtTyKs/8/lGObfSoCGujFpeMV5gXTY+bGxSBFbvFV+gfHqaKBf/VSX4hTa5xHP++893cnM39ac5CDQzH2rQ61CFbnrSGbWXuUAZlRp0DWhBE0IVddKCCgpSoi8O5iILWRWSlRVkklhyPJZpaVuryVOpmUrZ8nZvbXO7P2/MMV+2iD3z4vVcffs/7PAkUmIzITgm+LtRJ9co0cQSE3hef4HSHQOnrGoYmMwPWqu22MmuAMx1eL0T63zhkfZkQTGAsIEZj17RLKGItvqgI58+YaS3273ZVrA4V/bZ0XLs28gcCU93wSObwtoYHkEGjDH2DlNq9WsRJnQ2C4pr0M6PTTJTz+HG/qwpwTAGKFEAYQBzO4W9RLZLshyDLAYBhMY/Tuwg/YhCO4uS/HF+aI0Hjha0oLbgUm5/+n5l+N+SUYx5T9dpNiGS0OyMbU5cw977f8uKl+gQpZ8uzhHSWH7hHY7F5s75D9OxNaIepOo95rz0qbr3YCSRNZC8R1x8BwHw7cvu5CiQC3L7RsgyAXSji+cHxWYYe293dxitytQEIolmtthH3ULpFVrlqwiPXaPg3vi0KAX7Cx9H+FTTm9flR11DJXK4zghKVswySxVIv5w+SG4bO1ewdGnOfAsB0251h9tKJ3xcCmCQuIOqIe4g7B3s+anz+AIo3GOBqt+O/ERWKYEc4hQVSlJDlKAM0MqffBUXSkBsEjWx2H3PxuJUFkERsIpZgnqeNLdhWtgzcDIM45iI50tfrwb3qgWr5r6A8eGzILpBf5QD8Q7xKYzLitXhssPkJ6GZ5BjVUailuN/Xi9HEjrjW8RX9fGPmwk+8P2H2wA6xT0LHZjDFgJQOP5M/4ww4SHfgBGlOq1ai/bv8WKylTYmDYjThq3TqE2ZBx4uEATtyysLWtq5LcY52gR84E8BdxA1FLRH7aFI3FNj1WY8ad+89RsSMXdwdSQbHm+WIbS3W/gPJFXcyyfJAHEKUbSonNRBvxJNHV71HCYCnEmvJNaGh9/cg/JwojEVs8RmCSP7dFaIyIr/smFw1aipoHAAAAAElFTkSuQmCC",
    research: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAErUlEQVR4XpXTe0xTZxjH8d+hpy20ZSAXnYBcJSiKMOs2p5s4jEMUjWEbbmoVFXU3pmFzU7yMhbGFocKEwZBRdV5AcUEEtIIXFPCC3AIRBRXQFiZ0RS6WUlrOs40UwkhYss/fb7553jx5MFp43gJZiSqfoi+G09HCFDqXG+eOcdSXn5dgjIRA23+/L1Vmyh70VVBeayp9JV/BVV84HIpx1N04ufLW1WOym6V5oS2N111hwgJAVqxMrJ03ISS/6Upix/X9eHd2JFipNZNVU5BacilJSH39eq1ONyCxkNQQAzIX8F6/1tybSi+HTHBieDhyvns9gBYMS45a5nymNol2Fa8gAFiU5E7d+lbK/eNX+rn8a668q4CuNZ7gotJXcQCwO+0wl/egm1TKOmqoK6BLhSrN/t/yZcr6azIzALCfYIf7LRWwkLjgH1cimphHzxqRWZwOxoGYfGU6Yu8kMjOXzGB2pMaR7yvBjJ+dFt2sEaylHWqetNpYingJYDAE2T9udE6/tJGiSz8nmBSWHSWM8cnRA3Tw7B0623iWqnoqKa9GTi2qHnp7j4JT1l2UAcDQhBwRNgfKmZdcjRim6iZEHfpsJLo3JZPshD6YJL0PZ2c3HLsTDw/7efgio75zr79mfXfvi7KRpYCALxWL6OmTZvyUnEDSoCXos3WE2HshCpZGUv2jdmjQhxkeTXCw90JuXSYWTw9Dsrwd7/u1fhyweM0ZACgvTBMPBfkiAem1gK9xO6ZsdMepphPoa2qDWv8AA4NP4TTZF0GiMLww56O+9S48bfxQlUNo87qHN3ymVsDktXe2aoe+zDNjzFyMm0g8ywnyezvhbe6IcLc1kFrOxrxJweD1WKNInYnmF7XgGabBUD0bD7vayEek4Hp6+udglKFgi47mCn2DcfX5/r9jUnzqsRne1l6Y7GAJt4meENvoYSHm4V57FVw1/jhzu6gzaiHWB0mCwlLUSd/Vl2SJMSw3aSu7LyGmI/5xLS26/CpdVhdTN3WSov8IfasOpxh1GGX3ptKpdjkFXPajHVlaijocKYNJZcXxtZVX5c4wYVmBQCASetloButgLZyIQdaAWNUWmAmMYBgOLMNCxVVjplUwWIjhPb0DiuoBPUz4/fwc4oNGgnYOzlaCLgumXaOGuu05SvkVKGq+CcNgPwwDHCbbWmNATxjwmgJtFwfx1F60POvAsFlvfqDFKKzRYFAbe5s0AVZL7cueJOLk71lQdqlhsDAAfKDhcRegAiZtr8LMt5aB67IHT8gJMQ6z+SFRRjfesy1Vtc+xenk4HP0BO1crML6AvYctJnraQzxXAPNZEgROC+tMPFGybrVOqD+ZHjEFJrcVKSKMdiNrNxNxMLoxXdHMxTRk0KZby8nzFwuaf8qT5hQ5kX+ZD2Uoq7kNx2vXjZxhRKBLWsJHrgXZca6l5w85YqwrmTslIft2yHadPvdnWqWSO3Q/h8toPs1933CcDjxs1Ejj82W2gWvd8X/t+WazeMM2mcuqhOSVH2YXh86JjZO5rV4eCpOAUF92zZYFYownfrEdGyEVMfgPeUd2sRgjJ20be/fCAVHk1vdEcXHxIp1OJ/ohJtr1L6hfG9aIaew8AAAAAElFTkSuQmCC",
    swords: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADH0lEQVR4Xq3RX2yTVRzG8e9pu/eta9nYSuuKrJEBYcP5h2iC1H+4mRFDvCEGRaOJjj8JJqKGmImJw0RFM80g0WDUYFSUiBdCBl6AimhwIbqJEJW4NXF09s+6ytrVtX3fnve4LbvoBd174yd5bp885/yEUor/k4synzzlptyp31Xs4Q3VwfCGGgp5i68+SO/QPY4DlHm0J1e5MGMKyk1MSX/vpzkaW6qIRrMcOSf3S4uDQLGz3bJfGApIyk3mVeMK2bb97Weu2RO+1fu4tI4MAEWAktO+kM5XA5RrvTGRsJbk2vVYiiuZ0A5gLXOCqW6uxkGZcf6eSwK0NKXRhcHU5eQaZSnMkrxtvX99E3OGLl2cyfyFfYdf4cQXB/j+0GLGDYWllOefZEaLp5KoWaycLuX4wPUs77qZVd1N8xeO/JVgZCRO/6DB8Z4iCmEaUilMAyHEdPAgBLFBP0bKnMn8f1ju3KDPmS6UDGnBuII7qnQTaQxhw8FVPPiQu2nSyBd3764aPNNfnf/5Qh2PvPyrO9Rx/ny85kxh/2sXG06e2Gd/Zc1dQ3v4oyYgsm2nj51Pxxo+PybUOy/q7HrLFJP/Srp2BfSWVXq8YKqw4mg/7Ku88LODb7g7t4xGentSNPidy5UiM+Fd88eTewyuu73zN8BIjhmPvffuONu2j57dunX0HrsnF3w1ohfpbd+4KRoRgoUZTW/Q6oO03NL6PqB/+PHEoeE/iysWuMWbehUDtkdJZ9Vz6WyaOVhKaIua7yPcujr7JbNITljDpuT5Ckep7Ka7mwGmBwbw1no3mxIOH7tAoFYA2B/lha4bACgUHaxcGqjb/PpUTAiHdsU0yU5kOk6eGlBgipd6jlJX34jtwjjPzkZc283GvSqay03diWWOhXw6CxZpfb9cirQBamloCd/+9PVM5l9omGMAOJV0KUWtq9onlSw6h6NDGGpKX9287DQg+n74zuHWNMt24dpgPW0hPznP4hIgmSUceQku01JnExEAHrhrnQVgW9jasYVl9z7BpnX3A7C3wyOkcDpN5cKUllvmS/yYukzf6W+o5D/rnFzC6H0WsgAAAABJRU5ErkJggg==",
    bows: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACcElEQVR4Xp2UXUgUYRSGZ3LT2igohMyNNFApMTf6MUNQC3+y3bAyAiNIKDBykTarzVmXblLJIAzS3dZwkaAuJBYJKm+iG7EQusir8CooqIsuiigptq/3xDnL9PEV1MVzcc6cec4358yMdSt2oGG201KDwcoszetyc5glwAaWoJQSKKb7bXeOEumUs/cRSae7C14jniOpDvIloAYUIiaZCZuEDiidCpcOkjQRbT6NuBFsAbeBApk/NKkTuZyYhD0gcaOryEPC8bP+5dIR+ZVgKceS6wBvgN7AIqRg8sVQCc1LHdm0bBXPwwhEXjAA0mAUTUj2ShqSsB3MXTxcnktCsO0vshUgBZyR3v0NXE8n++IWtoH3V05We1nYBCxBNgmKeDyTnFeJviCd9Lo8sgh3A7oYJSHj0YQ7wVfwWGo4vwFSmZ8SYQF4Cn6EmsrCLExiQT7I8mPHdhRCJI+ktEb54LsuJIr5lJ/kBBCSWOgXmSb0AMr/LsRmLd6cA/rj0WBqordORdr8iy5pBNgGaeZaaM8aXUhb1AsXuXsW1HkNws9xJ1BmEopoGLwUCeIPdy7VdNMIQIVB+DYRDdYahRBdBnEWebjBDGZ7FbmPYJ9JiOsHWWi7Z3gcTBs2OQXeUb7Fl3fXMJpWMCbvomy5dmyg/TmKSWZrwpsgk53j5tX3h87Un0Lu6KgTKOYnG6c6klJQDuZJll545jecIA9sHz7X+LCnteKbiAX88mbvRapmktGWCRGGQIxEmsz0zm29cKgy3FG9Pnmiyveks943z8uCeO2CCGUp/wTusUHOr2+8L/CApG7hf4P/KDk2jpzf1UXSn7PdTrLoj8i+AAAAAElFTkSuQmCC",
    troops: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAB3RJTUUH2wIFDhY3V4jYzAAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAAOdSURBVHjarZRNaFxVFMfPfffjzZuZ9+bbzGOGNBiTtkRQTI0fVcSNqIsEERdSqRuDVYJLwZ0gCFLRRTalSIvahRUVwaoLS6MoBJM2rYba2DQmOk1mrJmZN+/7zfu4vgiVUNNx07M6XO7/x//cc84FuMWB/nOAMeJhyLfyscfG3/3pt9UHRQ3cbF7kaoXiar6y0WpqJ2e+Pf3Z1h1CKQp8n98UeD0OvTw13erYU7flGaDIh6YWQceyoWv5PIhclyXhlG46B2dnZtztOrwT7PlDLz09PDj89v57R+CR/f0goCaolQEgTAEecuT5DvWjYCQjy/zypaWZ7VrhRtjExHg5Q9lhtVzWhob6WwnR97teHZISsYuFfChKJC6L88ALIQyiA3ePjio9gYqS7av295cLhYJVrgx0maTqg4MPO3t2jzWQkOCO7QClFFKxO0LY7X1q5antenIj0A/AzOSKDcP2SFvT3UZ9o9QNqaWZXWqYJlFKMgjxszpOAExkkEWI9QSO3TMwfOeeXXIyUWr195VJp26RUOyiakXVwpGus3DRFhfWm8JWW0XMQJKI3BOYTNiPO9pC8exCM1wsV/B6fYlJoi801oTyUDURjd8vRbXlSFgzEOREERjBYk9gLpeXv/ryY2Co2reyOgunjp+BJ57bB19fO5q+Iw8wsnsvYLwXlHQJUqk0MBzxnsBWJ79019gUFAtKE1kXIrd9pjT5wgFtRX8lWfv1HLuy3IBGG4FcxCAyBkwIoScwRAK2PRc2dSebNDdDGo8+D6jxl5Gilq8ypqRA0GsgCMI/3WZY6O0w8IIwRBhQ6OJIc7AVAJiuTXHsJIhC8HkEOIYB35rGCALOac85jIBfy1UKnXSWWEJg84x8Hzi6K7AI2YSKUVKSoKBkIRc7zcQ5QVTuCfQh2BcPt7OrXN1wu1ZgdhzQNy9lU6IWEUl04+2AePXA9GxwLBdEkJ554/V3Ht2x5Nm5k89quvFiCht2e+WceHZ5neLSQ/ra2qJSwlcKnq3A7406r/2xjlQ1C6HMwegGGa1juDs6dAxvDvv+hwRr+Pz8d7lfzrePgW+p3Eh831icJ8isERRsIhVdBdm6DObVRVhd+uHVI0dPzF5n7Ph9TU8fHhV0e+LH+Z/f+uDzT61vPnnvgQunj51IqkNpzwto5MGfGSl9UUwV3j/42ptfbNfe9D/8t4REHkduK/zo+JEKZ7Sax91qaJC5Jycna/+nvSXxN0d7l8xJ6no6AAAAAElFTkSuQmCC",
    horses: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADeklEQVR4Xs3UWWhcZRjH4f+cOdvsS2Yms57Z4jTJnJROtpqENkmb2QxtCtFQ0YymUDGU0tRoA0rFqsVas4hWS4uiNiK1aBG1xSpSW1HUC0WkV4IXXtQmRajLhYLk9ftOmGEMiDe9cODHO3zwPec9czEgopvazQenK9H6cGAihr07Q+hrk/DAeBSTt4fwxL4mjA25sDCTxcxEFKcXNmJ0wCUUO1Xz+G0NpqP7U0JzAEJl2Cv+G1jboFL21YNsgTBen+2Szx0fQLlbFe8tenHqKR1bNyjy3WWPisN7U7UOTSZr0NLZEi2fL9L1jwr086d5Gu61JRafzNmvnS7T8vvs/EKRzsy10/K5ItIBIBbE6icUWM3vBTIa8MrTHdbLU5305cIW+u5Yga4xuIpe/7BAV98o0dU3i7T0Dpvv5enw/nXkDsh2FiSrCGSbJKN1SRHvPncXiZJAlya7DPCDo30G+PHJTXTpRD9dnB8wzq+8OkRXXhuiC8/0cIzGtscuO7ySjQW0ZSSj1rSEYl+UgzwDPPt4N710fztNdQeNObtzvQFePDJAP54p0A8ny9QYsZCzQaKoZuk1wEREhhZW0JmVYLeZDUzXHHxLjtTAhwsJmi5odGxMN9Av2LbfL+apJ+cjBpHTJ39lgGlNRiauYIo93eFeBTm8ISVzqNZm3UWjHT4aTIOmNwfp+I5W+uaxrXRfPkWOBg5KKy0ZxQ2TAGgRFTa7aEDVycsxdNt6F/U3WcnjECjMNjlSidNnz/aMP9gVprnSLTQzmCR/QCG7R/zVH1Im8MliL14+NCIbCMNgwi+JiFLZc2diX5smUi4uUTwg/GWzYMVqQWnp7ZL201tFE990qj1IL4600o5cIwfJ5ZFuYOGRVnP1tZwOobohnn+03duTUimuSQ/ZrVjxOEAMNDNQYgnBqJLp1ZVvOVzKWeb57+jySb/B5ZRWOHZ+d46yMTsB8DEUe+7wbOSgnhSzelx4gWF04uA2IwaaWLhVVwc5uKtgmXMH5K/dfvlzzI5k+twuieZHkxT2qfxCrZaYuYY0N+IPdvmUgda1qU39s3rG0BDYZuKB7Y2/7857aEuXOlwPRjSZ6gGXDTfWgjababa7RREZCB4HcU/JSbuG3PWX0d+h+tdcrn/lJpZJT4smABKH1oJmVpgfrI1tyed/1tksoyMj4f//j/032kXCk2YKR0MAAAAASUVORK5CYII=",
    siege: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEh0lEQVR4Xq2Ue2yTZRjFz3frfStt13ZrM1rohlvLOsWBOhFkjAXkrlyVQESJI2AM4Q8zAhjAKKLLJPGCIBBiBk7FAGoiQQlzZoDbYBuwOBe2Qdvd3KV0vXzfvstr0wCJMZkx8fz55M3vOee8yUMRQvB/isW/qPat4gdvniaEvDOQ5tPfU7QuqxAIGXv7DoPFNwW7z/VkWG0AgHEdshTFfX9g45aoylJlbqkDFAJJryWhbB8l0zQmRgNgg72E0uAMMTOb29ML/6QxjpxG7ReqtraqET6B/vwigEGUjSVEV3uj7IwNKp7F5UJaoV8hApYzoq73hfU7L9LjRQ3cSyweMoowcSKiCiDOXmIgRooDIKlDnUr/L4cSmfM20s6XNoMxqyiaYWelIpvTNCmITABWEZni6T7XupUL6mSZcjz2VBlAs7jT9TvCw/2YohnBaEc9QChQLHC+k5IG5Qns82vXYaLbM8YCqWpAAKhoSp3tdCyblJ15sL8naM/IcoHh1GBZDj7/E5DEMRyorEJ7ywASkoKhe3HsP/Ae657kBkURdHW08imgLAhgWZozm81LtVrVTp2att+t/xlBDQtndg56RiKQwoOYs3AV3nh9K/bu5/FbfR0kSUJjQyOqq6uxaOF83uNx21IdvvnqbMx90pORLGFrOBKfGm69CjkaR1buNARCnQi11qKzrgbVBytSThYtKANN0yCE4MTxE7haf5V0B7pm7Nq+TUgBy2bma4djynZFlovnZCSgoxR4y5YhLduNcN9dDLdcRqxvGEM3ruDyhdPIMJuQk+OBLMsAAI5jFYlix/Yl60htObZn+RZ/rkN4ZnI62TbdSCo3LyCff7CNfLJjDakosSVnyXlROqmY6yQ1n+0j1Yc/JJVvVxDvZAdxWgxk0/rVypW6H1KslMMbHQNeRSEqi9UKS04eTLk+hEO30Xf9V/ARHiCA1mJC4cpNGBoJIxjsRrpBg2TnKCoqwo5du8Sm1puTAaSA0Gs4Sc0xSsdAFEbfDCSCbRj9owlClAcAmFwOeJdsgCyKOHnqW3AqNvUhOp0e71cdxJ3u23w4EuYeAu0WwymOpb9MCJJyvfY8gtcaEBkYhRAXkGa3IW/+BkxIT8ets8ehYwC1SoWar88mgVpcqbvAgwi2mUXT2h8CdTpmw9qFvtUuxwTSPSyDogAKgMmZmYxZjthwHy4deheJ0TgWrViFeDyOPE9WIt9laIgMddheXPOygPtij+1d9hyA13QaDo977fFLTT2x2jGdLc9qgrdkNfp6Amg7dxJajkNGySpIihzQ63U7rEamuiDXSuwFpThVU/q381UOgNA0RXLdFp7npZbmjhH/tV7RfPP4V5xeq0L+JD94rTnGcqpWSZQ/am67eToWjRJ/rhWzSlfggR5EbgUQAUCzDG151JtZunKex17sz+JEIYYEzw9muh/h9Vr1xSOHj71y9NOPa3768TthvAN7BMCzADwANBRF3TXo1U3Tp9pvOa2aQJwXu+SRdrWBJiH/lMyu5lvdGE/U0T1LAYC5D//H5o27z+C/6C8ohPDeWkjBBAAAAABJRU5ErkJggg==",
    plate: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAB+UlEQVR4XpXTv2tTURjG8ZMOXSyIuCimLa0/EAoOlkYRwYg6iOLQyxVRUeQOgpOxChpTIw7VqHRyilIJDUjiFjA45Q9QyC5xioOZdbqoHJ/z0AfO5V6tDl/eM5x8eO9NYqy1qVZvnx5funJ0zJ3f1M5zNlfC3OtHizl3bj+7MFaOjvGsVAo7cWivjeOYNZtNNjU1maherzPcUdmgu3zq8Q0bRZEdDAbCMvPBlVuLhUwQEIG7a6tEh8Mh0dFoJIhnYV4/X9w7e01gYjuhr961ieIyAUBKIPFKpWLz+bwy3mYEmXCgrLCwIJQTuTtEwzC0nU6H59bzy/cFCmK1Wi0FVqsPCCk9BbZyIOfNqyctQW0mVJVKJR9kQRAkQGH9fp8JZD42iUsTE1uICcRMgMYYOz9/0AeND7Lq9eNC7VLAKZCY3l2v1yPaaDSUEagMEPcvIKTK5bJttVqZYLFYVCYTVHcuzfF9AuTsdrsCGUD25P26D9L4JxAf3BSEsTnIL2fndoFC9ch/B19Wz+XQLEqAM9O7tOV/g2fQL/TUQV4CiSFiiBhQ44PCtm1gMRqiTwfm9vigthPCgJo/gVvRWw/9jj7s3zdjd89OEwHmfo/cWBgSlgJd42gH+og+ox8b+JcjhwvEfBAZJCgTdLjgi+gh+oa+omUHeQlL9Rtnl6VdvZBRqgAAAABJRU5ErkJggg==",
    diplomacy: PNG + "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAKPWlDQ1BpY2MAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4BUaaISkgChhBgSQOyIqMCIoiKCFRkUccDREZCxIoqFQbH3AXkIKOPgKDZU3g/eGn2z5r03b/avvfY5Z53vnH0+AEZgsESahaoBZEoV8ogAHzw2Lh4ndwMKVCCBA4BAmC0LifSPAgDg+/Hw7IgAH/gCBODNbUAAAG7YBIbhOPx/UBfK5AoAJAwApovE2UIApBAAMnIVMgUAMgoA7KR0mQIAJQAAWx4bFw+AagEAO2WSTwMAdtIk9wIAtihTKgJAowBAJsoUiQDQDgBYl6MUiwCwYAAoypGIcwGwmwBgkqHMlABg7wCAnSkWZAMQGABgohALUwEI9gDAkEdF8AAIMwEojJSveNJXXCHOUwAA8LJki+WSlFQFbiG0xB1cXbl4oDg3Q6xQ2IQJhOkCuQjnZWXKBNLFAJMzAwCARnZEgA/O9+M5O7g6O9s42jp8taj/GvyLiI2L/5c/r8IBAQCE0/VF+7O8rBoA7hgAtvGLlrQdoGUNgNb9L5rJHgDVQoDmq1/Nw+H78fBUhULmZmeXm5trKxELbYWpX/X5nwl/AV/1s+X78fDf14P7ipMFygwFHhHggwuzMrKUcjxbJhCKcZs/HvHfLvzzd0yLECeL5WKpUIxHS8S5EmkKzsuSiiQKSZYUl0j/k4l/s+wPmLxrAGDVfgb2QltQu8oG7JcuILDogCXsAgDkd9+CqdEQBgAxBoOTdw8AMPmb/x1oGQCg2ZIUHACAFxGFC5XynMkYAQCACDRQBTZogz4YgwXYgCO4gDt4gR/MhlCIgjhYAEJIhUyQQy4shVVQBCWwEbZCFeyGWqiHRjgCLXACzsIFuALX4BY8gF4YgOcwCm9gHEEQMsJEWIg2YoCYItaII8JFZiF+SDASgcQhiUgKIkWUyFJkNVKClCNVyF6kHvkeOY6cRS4hPcg9pA8ZRn5DPqAYykDZqB5qhtqhXNQbDUKj0PloCroIzUcL0Q1oJVqDHkKb0bPoFfQW2os+R8cwwOgYBzPEbDAuxsNCsXgsGZNjy7FirAKrwRqxNqwTu4H1YiPYewKJwCLgBBuCOyGQMJcgJCwiLCeUEqoIBwjNhA7CDUIfYZTwmcgk6hKtiW5EPjGWmELMJRYRK4h1xGPE88RbxAHiGxKJxCGZk1xIgaQ4UhppCamUtJPURDpD6iH1k8bIZLI22ZrsQQ4lC8gKchF5O/kQ+TT5OnmA/I5CpxhQHCn+lHiKlFJAqaAcpJyiXKcMUsapalRTqhs1lCqiLqaWUWupbdSr1AHqOE2dZk7zoEXR0miraJW0Rtp52kPaKzqdbkR3pYfTJfSV9Er6YfpFeh/9PUODYcXgMRIYSsYGxn7GGcY9xismk2nG9GLGMxXMDcx65jnmY+Y7FZaKrQpfRaSyQqVapVnlusoLVaqqqaq36gLVfNUK1aOqV1VH1KhqZmo8NYHacrVqteNqd9TG1FnqDuqh6pnqpeoH1S+pD2mQNcw0/DREGoUa+zTOafSzMJYxi8cSslazalnnWQNsEtuczWensUvY37G72aOaGpozNKM18zSrNU9q9nIwjhmHz8nglHGOcG5zPkzRm+I9RTxl/ZTGKdenvNWaquWlJdYq1mrSuqX1QRvX9tNO196k3aL9SIegY6UTrpOrs0vnvM7IVPZU96nCqcVTj0y9r4vqWulG6C7R3afbpTump68XoCfT2653Tm9En6PvpZ+mv0X/lP6wActgloHEYIvBaYNnuCbujWfglXgHPmqoaxhoqDTca9htOG5kbjTXqMCoyeiRMc2Ya5xsvMW43XjUxMAkxGSpSYPJfVOqKdc01XSbaafpWzNzsxiztWYtZkPmWuZ883zzBvOHFkwLT4tFFjUWNy1JllzLdMudltesUCsnq1Sraqur1qi1s7XEeqd1zzTiNNdp0mk10+7YMGy8bXJsGmz6bDm2wbYFti22L+xM7OLtNtl12n22d7LPsK+1f+Cg4TDbocChzeE3RytHoWO1483pzOn+01dMb53+cob1DPGMXTPuOrGcQpzWOrU7fXJ2cZY7NzoPu5i4JLrscLnDZXPDuKXci65EVx/XFa4nXN+7Obsp3I64/epu457uftB9aKb5TPHM2pn9HkYeAo+9Hr2z8FmJs/bM6vU09BR41ng+8TL2EnnVeQ16W3qneR/yfuFj7yP3OebzlufGW8Y744v5BvgW+3b7afjN9avye+xv5J/i3+A/GuAUsCTgTCAxMChwU+Advh5fyK/nj852mb1sdkcQIygyqCroSbBVsDy4LQQNmR2yOeThHNM50jktoRDKD90c+ijMPGxR2I/hpPCw8OrwpxEOEUsjOiNZkQsjD0a+ifKJKot6MNdirnJue7RqdEJ0ffTbGN+Y8pjeWLvYZbFX4nTiJHGt8eT46Pi6+LF5fvO2zhtIcEooSrg933x+3vxLC3QWZCw4uVB1oWDh0URiYkziwcSPglBBjWAsiZ+0I2lUyBNuEz4XeYm2iIbFHuJy8WCyR3J58lCKR8rmlOFUz9SK1BEJT1IleZkWmLY77W16aPr+9ImMmIymTEpmYuZxqYY0XdqRpZ+Vl9Ujs5YVyXoXuS3aumhUHiSvy0ay52e3KtgKmaJLaaFco+zLmZVTnfMuNzr3aJ56njSva7HV4vWLB/P9879dQlgiXNK+1HDpqqV9y7yX7V2OLE9a3r7CeEXhioGVASsPrKKtSl/1U4F9QXnB69Uxq9sK9QpXFvavCVjTUKRSJC+6s9Z97e51hHWSdd3rp6/fvv5zsaj4col9SUXJx1Jh6eVvHL6p/GZiQ/KG7jLnsl0bSRulG29v8tx0oFy9PL+8f3PI5uYt+JbiLa+3Ltx6qWJGxe5ttG3Kbb2VwZWt2022b9z+sSq16la1T3XTDt0d63e83SnaeX2X167G3Xq7S3Z/2CPZc3dvwN7mGrOain2kfTn7ntZG13Z+y/22vk6nrqTu037p/t4DEQc66l3q6w/qHixrQBuUDcOHEg5d+873u9ZGm8a9TZymksNwWHn42feJ398+EnSk/Sj3aOMPpj/sOMY6VtyMNC9uHm1JbeltjWvtOT77eHube9uxH21/3H/C8ET1Sc2TZadopwpPTZzOPz12RnZm5GzK2f72he0PzsWeu9kR3tF9Puj8xQv+F851eneevuhx8cQlt0vHL3Mvt1xxvtLc5dR17Cenn451O3c3X3W52nrN9Vpbz8yeU9c9r5+94Xvjwk3+zSu35tzquT339t07CXd674ruDt3LuPfyfs798QcrHxIfFj9Se1TxWPdxzc+WPzf1Ovee7PPt63oS+eRBv7D/+T+y//FxoPAp82nFoMFg/ZDj0Ilh/+Frz+Y9G3guez4+UvSL+i87Xli8+OFXr1+7RmNHB17KX078VvpK+9X+1zNet4+FjT1+k/lm/G3xO+13B95z33d+iPkwOJ77kfyx8pPlp7bPQZ8fTmROTPwTA5jz/CVjM6IAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAAZiS0dEAAAAAAAA+UO7fwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAl2cEFnAAAAGAAAABgAeEylpgAABR9JREFUSMetlVlsVGUUx393mc7WZWZaSmemC91o2QRCkTWSkrAogomg4BL1jWDQkKAJMcEXE42AaGI0RDRiIlEgCDHYqCGCKITdYoHWli7TWlo7bWemM70znZl7Px96ayqIuHCS8/bl/M75n+VTgI12u/09JGm+YRhOIAJEuUemAKtra2uf2LTlpTmpTM+qSCz+UCIWmYgwWu4VaNW6dWtjYS0h6jpj4plDF4Tv8S1CyfLUARP+R1xprAJteFhbtmTxYp+/qJiQmk2opIbB7o6yRFtDPXD1b4KoQBbgBaqAecBKSbU8KSmW1Rh6j5qRkdEdCASOHjp0cM722TWUZSqUu+3ES0uUs+AZF8wOTALKgDJFVUutzqxJtmxXoc2Vl2/15LstHq9DyvWq5BURar5C39E9VjWZTAKcPnHiu/CzLU2ucn8VU+OColmVNDjsi4a1+CfArGy3Z1vFlOlz/WUV7syC4gz7xEJseT5U9wSE08WI6mAYC1FdIpSGSNt1MPTfFDO73mg0VuNxu6pnzphOOAmlFRX0dQUqblxvcJZXVW99Y9fuRRu3bsssXbJacd23kNyKaWR5i7Fme5Ay7KSRGdEFWtpgoK2RvuMHEiM9HXvHAOlUKtXb1dX1cLHf63BN9NKruEgqGZa2C6fuf3PHzvzaNWul84MG/QkdqyywSAJJCASCtCFI6BDRErQeP0zLnu2B4ebLu4HPxgASoGqattRps/pHsr1cs3jp10bYMG+KvHb9BunH3hF0Q+CxKVhkCYssIYC4LojpEB5OcPnjHUbzp7vrkgM9m4CDQEKVZRnDMB4srax6a3JlRUVn3yDenAJKsxTKaqpZ6p9NpwZOi4TbqqKlDSRZQhICkNAFDPZ0c2H/+0brsf1H0lr0eaDvjzEzDMOW6c7d9PTLr1avWbEMf44Dt9OOVZUBGEoaONJpJtgUtLSBU5UJJw2SQkYzBC2Xz1C365X+YMvVj4xUchfQf+scFxd57NWWeJAzzZ0smjUDqw4ZCsgS5GTIGEKlNZpCkSQkGVRFprHxFy6d/JYzh/Z1BFsbtwJHAeOvlmWhz22/6cvNvjahpLxp4+vviu9vaiIQTQktZQghhDCEEJ2xlPhpMCXq2sNi8+4PhX/ytIAky+8ANXdbaSuwwFyiKa4C/8Utew+LowFNnAsmRcyERIc1sfODfWL5Y08lHVk5XwJz/sP1kABqPYWTrix9brP+2oE68U1HRPRG4yKZSokN69cL4G3zPPwjU8aHN709PhT+qvPn85XZxKriqoW23iBDrhL0eIzG+otyLBo9DfT+G4ACZAIuIBvQhEDNK/CvWDy1RMnyVdJ+s4+Z06bgm5jnv9HUNH8oEqkHum/V4FYfv2gORq+iFygA4pJhLHhx8wu57dcbOPX1MZY/up78Ah+FRYUF7TeaHwgNDPQAA6ZkmYCT0aNoB2yAMgYQ5oh5gFzzoRxPJHxD0djUY0e+iKcUqzx35SNyfzBIbn4+c+YvzG28Uj8/NNAfAHQTYAUsgGzGTI/vgc3MxGZKJum63n61oaE72N9/UotFvb6pM/NCoTC/trcS7L1JLBLOCbS2dAGXAI3RHzACDAExYEQaJ5HNlMkJ5JgwO6PLKAM1vvKqjf7Kan/TuR+CqUTiejI5Um/o+ufANSAJpM1q/tSU24bVLNNhQvLNxiuM7spcoAk4CzSaGYs7Tv5dpkwytc0ZV2WmCdOAkAmI3wlyN8D4d8KUa0y2lOm3yTLefgcK4SfxEzr3pQAAAABJRU5ErkJggg==",
    mana: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAFUElEQVR4XkzNW2wUVQDG8f85O7MzO9tpu+220m4LtLSNtrUoWlqwEG8UQzBBk0pNTITyookRSXzRBENMVBJj9AWCeIHwwoMJRAElaoSiQashWsVbmmDA3uhly/ay7c7MOce+mPBLvrcv3yeeeP5jbmdbmos/V0iDqdOacm3IABIoAHlgxshorKR09ub9Ky00kQEAOHV4N5LbjEzF/f5fyrpCZXaGShyI4ENpiRPER4/hDX4QxqaOKqGOYOTB2WxZ33e/F7WPTiWqQfA/CwAMQ8PJqtFpdyuIjUrSFrl/rbVdz9VxB7PQwOKC55swjlq6sUYj1ieLMo8S2WeHRhL9+QLfN2SWrgNGGmD5xVkeazfLxYKVbwzt821FbpubiHURy9+Bo+qJBesIco2gq2no7GA+n88sqPknjTA7R6bcjpFJtwxACiP5Z9xdbTCd2vObXX/0vs7HtyVKyzcjljKEuVLmpvspLk/yyHONPPDsZm4OxkFOkmz9okKJVBeIjusTzupsLkD+Pewmwkh2KSd4UMQut/s1Lf7KddtBe0xeG2Dx1jyF2WEKuQHqWkuIDVfiV9aysWcLc791o/DLQuLrg1DWfnLkTVdmZ+PlRkR1Ot2/KtOc9bwVjRQWoXv/DD2Ha3jsnVoEmtmJq9h33qCpd4zuFyvI1LXhie3ErRJhZPquuBWtBR6SQSSSkcg3iZn6ionBFsa+ucKXb53i5K6jCF3H8W13o4Cn3tjLgZoVTEyXcfrtCS6dnKc4rREqCwSpEJ0Bui1jRErYVoucX2MvzI+jon8JC3n0ck6//D4XXoVrF/fiV6V45WyBc6/9iuU340jF5PgPOFaAlagVSqj6fGClLaBSuqJGGBdhJ/H8JvIzVwm0ZCk7x7eX97GqNkXfpzlO7H0PY0AyQKDvRef/oGCV4MZXgGtV5YNYvQQioU2kwjFcfw3JdDtuTQ+O7bDr3A78tEdhKeLMgSOUllo4lQFqbozcyAWMVlheGmO5mMjEU16Qk8CMWmTa6BhecTm267FlTxV7PtuB51lU3XMQpTR/fv0CVy7to/ejHtxUI37NZuySDeBkEc55UNgxaY5LMENCWz/qBDS0FrHp6RiOf4tjvZ9zqOMMJZVFaK2obHqd5q2HsKI4D7/UxzPvbmLj7mqc4g5kYkPBGPUT8JU0wkxJ818V9c7aVBwAUPz8H7nNbW4bYm/6LrY+QRF0aRVRBAdRcBB0EZ10UJz8BE5ufgAHER0cfKA4OBQLleIg4rNPNU1LEo1papumNE1yH//rIgXPB/iNR08pp2Rm5lYYfwCPboyR6NYMnL7OtdGL5JoS4VjUCw2e3LxLeu9vpt9OEh/8wMhlRaWUqSpaPgFL2mBQ6AWxnq6btnICVcPdf4ZDZ1tpT+aZn9jgtnFRrX1EfpbNUpp757+DVMSS+7B7ysbR7QURyQyQlW6ygRDRZxWknnu1BvVGEbff4839HM9uveLplTmcGsjkCZS0sVp6SQ920da7DSOnjLfyczltyy+XRhbn22y/ro/saTKbV4u5JfuO9Lx2T2RP5qdXHamrCGsQYWd5PbqOMB5O5ymEjhGqauT7udBqCSpxUu+P7/o1cXBgdRNAbnqC3X31sCvVLErkQ9WsP9YyO6mdCrF4EeEEFL7OoOMGHBfpdGBkSehIfHTjzsvDO5ZfDA/9eRfXYQZg69haIReKdkdh2Rr2AzUUYS5EIuwPhd8Z0kgolapFYVB0YmQSMZM/trP8I6aDb61WMDayvRIC0X8ggBQIY5Q9W7BEec1KYVQ30AN0AFWgePVohgN9a11KRuPAxj9oq7+f2zKNI9gJJQAAAABJRU5ErkJggg==",
    caravan: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEk0lEQVR4XpWUW0xUVxSG/3OZO3O9cK/CSEaNiG1TqQmJTYqkoU0DidGkiW3S1PSBtsa2D6ahpqTVl770ARFbtBYr0EJjA0QIBjRBtGUirVC0dUAdRxRERpnLmZkzZ86s7jE+UR7sl/zJPntnrfxrZa2DEydOTA4MDPSPjIz0lKxdk1hXWpphd39Go9HDPM/j/8J/2dS0+cOGhpra2totodAjoSAvl/vswIF1fr+/gOM4rILApGFa9REGvT6wacMGqtlRTfX19fT+3vdoW+VW6uzsvAjG00BN1vHo6GjX8ePHJ1uPHvW3t7f7zp492z82NtaRfcNTMDw8/IvRaAw3NjbSz93dtH//fqqpfpVaWlpmJyYmvu/q6rr47bFjN1qOHLldmJ8bffmFzbS98nnaWu4lT3EeOaw5ck9Pz3lVVZvA4GZnZ5urq6t3tra2FoDjcPnSJSwtLuDKxB9KPB5PrPeWWUxGI8LhMLQCBy6jQknJgKo8OS8shTA1e/fO9PV/+jwezz5OkqRDp0+f3iWnUl6Xy4WpySkgLcNmsyE3z41oJIL78/ex+GAR8VgUlE6B1DRi7D6tpJ7o79v3qe1Ux2BVVdVfvNls/txut9/zjfsQvBMESEUsGkWEBSiKggg7SzEJajoNvVYLu9UMs8kAjufAykRESsCgE7n6uroKp9P5mlj/5htIJpMmnVaEmpQQuHULWp0OJR4PIuEIWMMhCAKcdht4Upn5BCTmTk2rICKEIhJicRlFTktxWEoW82d6+3nmRC+FH2Nywofp69dYqbmwswRarQasj9CKPIx67RP30VgMgXvziDDXGTUDKSGnHkXjM3E5lc4QKSKAjNfrvfbpJxfWuBx2W5gFPAqF8GBhAaAMFDkJWVKQwxKGw8u4cTOAiWk/nst1wG3NQTKlPP59fPwyq2QSDBGMysrK2d6+vqHFxcW8PXv22Ofu3t1izTHCZNAhzhwl4hLmEwnMzS9AllOQUwol5RQHykAU+BzWkgyblF1YCRF9MTQ09OumjeuVve+8RR/tfZu2b3uJ8lyOpNlkvCHw/LWN69aQ1WxS9FqNVF5SQIVOC3V3d5932YxYlWAw+I3L6bhZV1tDO1/fQS+Wb6CTJ09eAeARBL6ztLiADHrdb729vYMOszHuLXJRc3PzLQAGMHiswO12x746dFhdYOUF5+6BRwZsp6m/v7/Z7bDX8TyH9lM/JioqKvyptLqcVjPQaDRJNmYHAYj/Sci24iCbp7ml0BLikgRSVUixmD0QCGy0sZ2JxRMZNrvRUChk4QAtz3H4oKEhPDMzkw9gLVbD5/P94LTmSJ5CN20qLSKDTnOd9elCtjS24/5z586dyX6b9FrFZTFR9m5qauo7AEUiVmF5edmiEwUdiMAcQRSEXOZqZvfu3fsApJmiV69efbfjp24ZjPLy8pmysrKPAahYgcjkbmtrmyxwWijfYSFPvpNsJkOkr69vAEAVUwmTcUX/V0XHVMb0SjaYlXdTIwiJskIXWYz6xODgYC8AKxOHZ0T/NGE1U022j+wnOq4RBV9HR8elhw8ffo1n4F/j3EdTZcPT+wAAAABJRU5ErkJggg==",
    sovereignty: PNG + "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAxtSURBVFhHdVd5cNT3df/urqRdrbSH9j61uvfSarU69hCIRQdICJDELSFAAp0gQTAgMDZ2TGviguu4jhUmQO0BYuw1xgeRDVkMcdxprTiO7bHjxqlT07rJTGq7/jnOYOorfPrZVaYzmWn/ePP97fd438977/Pe+664777Y9XR6jZTeaZLSXUJKb86T0r0cj1ZI6XTXvJwMS+lNnNullNL7CqQro0K6ulMuXZttk9JX1ko/fahEujrO9QnKQY2UnpRL6TF+D1K+H6SOVVL6uVYpfbmD3z1S+nRMSq8T0h0N4rp4+R+6bwB3AZdDwC4BPKThT44v14ATlB3AJyuB73LuKa69YARSAv90QOBSuh2vvNaLb+bCwN9z/RzlmgP4oRx4lN8zlMxZTFMGKVOU/cCr0ewdz/bKboj0pQ4pu2FuITDJAw9qgcMcn/Jw8yhwcwvw4SrOc+68Djef1uGd2VU4c7cZI+O1OHqsHomFdhzo4PqzvPha8fzlJyknZMCn66lnAvivdRy3A7fGge/rgW8LpIb1kkinFhHAPuD9FcBeHnqYAB7MoxVm4E8jwGf9FCo5wbV0EWbv1+DKT36AI/cuxehIGFNTDQjX50KvFvjsCZ57tRR4jHtPU1L5wDfDwJdDgJQBQI/+52rgHq7NKJGaNBHA4wsIYCcvGaDlRPxwAfCIjlYUAl9vpQt54GbfvNI5A/52rwXtHRbceacBixfrMDamwdZhAbkQ+OCcGvglAZzn3scpV0y8dJK6ef6zDfzeA7xSDxzKgDMjta2AAM5nPEBLb40RFS/9uxy63wqcygW+IKiPlwNf8fAzClpnxC9SLsh42fQBGaanBe64QyAYFvDaBL7+OV37zyXAj3jB05SfE0wm7h/3UBdDmeHTk+TQMa4970Zqg4wALrZJ+HrTvHuedAIPZJBTyWl64+ZaHl5CN3JMq4Cf8fAHbty+VsBqFVizRqC8XEBXIPDTh3nuOsP2Kxf38nuW8h6JnY1/x/z4B4bhOOdP01OXnEitEQSQXibh84x7COBnZD7J9oeLDvzxB9x4Yxkvb+MaSfgqM+B1A7nCC94SOLY/gNq6BVjS0YbXLtDSd7n/fTvwG3rvVX6/RvmiCbdu9UN6N4b//oKE/vfGeQAvUMcFHVL9GQDXuiXczDB1B954oRFra/OxIOpHXbAMnUu9mJ7yYHY2gg+vKqmALv7KjU9eFLhtRwjbv+VEWZUOe4bond9T8TfMgN/q8OunBE4eFBjsd6FpQRVqQ1VILg5hZ3cOPs+Qc84LnJUjddBKAC/1SLg1iH97vR0VwRKE4iuRbK7Dpl4vNqyux6JkEyor6hGt82NrvwV7duYjUCyw9/ZWXJwZQ7hMA0FObOgkqMl8rOy0IxCsQ6RhEZavaMbQ5jgGtySwbMUqlAWWYPViZsocU/zpPKQeiRPA7JJsFhzYZIa5OI6h5kJ8eImWvsFMeK8Yv3ozhPSsHxMTYSSautHS1oEFSSMa4jL8TdshRIpKodYLyHJkcBVHsWpVN87N+HH5XCHeeidOj2UK2lK8fMGJXcPr4K9P4h8PsF68W4nUM8skceX+MgIYw/1Hh7Fx8w68zhT56iULjh8JIl6tRLFNhaawHkGHHttGxpCM6bB6VTlGRuNYWuNDsrES6/sTqI/kYWykCz09LWhmVgQMRlh1WkyOOHH1KjPpN2q8+UQHmpeN4dhKhuHrZUg9t5IAJnIZgnV46Phe3PudQ/jgjAqPTCpRWlEDi6wCBmFDmQjAK6oxOjyK1uZ2LO+qxt1352LJMhXCEYGNAw7UhSsxsGUjEtXN3F+DsGhAkTDBpPWhvTWMt8/l4icPKOENL8XMKFOaRqceayGAPiHhoxZM3NaKvoENeOMJF25jPE35boTlYXiLvIjkRdBAhQFVEPX1Ddi8oAPf3i8jP+yoqcvFtmQUscoIrAYbAgQbEzHU5NegWBSj3tAIhSjEd8YUuDZj4f5OnDliI4DdSB2rIAcmlRJ+UYGd+yJoWrwep+9xY3hJIdw6H5q9zXAZXAjKgoiKKJVXw+cpwUjvCrTUadkD3PD5NYg7y7C8Mw6b3IZ6UY9G0Qif3EeyBpAMJqHMteLwsAwzh1vg9SXw49kEAWxB6kEfATxaJ+GyDt/9ay9Mzgh29YfwzH11uOfI97B1ZCtWdq9EiSjJWuWndcFyHzYO2hGutSMSqUJFRTnKq7RY3l0Nm9KOWhFBUAQx1jGGi5cuYssQdSxvx6OHlJgYn4BeX4j/+B3rzhcdSJ1tJoBnWyVcs+HN0+UQqkISrBczd7bhrV++jZ27duHgHQfhEq4sgErhhb/Shx1TVjQ26rFu3SDWr98EjycPq9aQMyobakQYIRFCX6IPc6/NYcfkbhx/8ACmRwNoiHahrJL15EtWxD8uYRZ0EcD3/BJ+HcWfLpoRT3qwdsM4DvcJ7B7vx8TUFAKlgazCGhLLJCwI+4PYNmxFV1cR5ubeQGtrO+x2luV1YZjzrajm3kwYArIANq7fiK6eTTi614WT9ydRUr4Yd/0Vy/Nni9lp+5A6FSWA3WoJn7JZPKvBM2dr0djUisGlLhiFhtZtgKtg3novrdcKPWr8fvT1G7FlixXnzp1nTzDA5xPo7g3BXGCBT/izADzCg9ZYK9xuP5K1Anfe3olIuAyfftIN/EuEHBhFalpLAAPMgo/5arnsxu9f8mHZ8gpYzGUIlYUwvXea+V2fZXO5KIdOFKGuJoieXjOcTgUGBrYgGm2AwyHDiu4QrFor91WgTtTBprZh67atiDfGYdbb4Cnx4549Dnz50SLgdy3kwBqkhjK9YC0BvM4e/dtWPLrLgaGx5mxpjTe10NKtaF/aiVhDgh4xZQHEG2vofivJp8YkQ9TV1QmTSWBlTw1cRif54kZIGcLEjh1YvWYdGqMJcoT8ok5lngzP38uWn2n/7wSRovHilSmm4UV2uVsDuGukjDW+jkoFamoEilnzi4pkKNSoswqEUEClUmHT5l6cOnUK+w8eREd3NzzFLhQZVMhVKLknB7lyJXT6Au4VKGCr1mqpyyOyv2dP+AiAj5QfF+JH9zokcXjEIk0tEojGjDCbBfbv11EUGB0VmOQbsY+E7O0V6GRxamgQtEaB4ydP46PPb2J23z7saWjAwMR2lFZ5YTDwcVKd0SUQoyxcSE/GBUpLBbkgoM7PzFnR3mZDU5UM0UajJLR5NsnK/HYwxt0rmnD2h4tw6VIAZ86YcOKEAnv2CGzfLnD+ySmMbw9gYrQXz28awpHpaXx+4AAekMsxvnoNji5YCH+khPyoRiIhQ3OzyEo8rmLKOpBM+tHdk0CtrwY5Qod8YeXLKl8SMUtciugiMOWYoczJh0KhgcvlQXt7PcbHE9i7L4qhoVK8//6/4q2338Pjp8/isaFBPHfhAl5YvRo9Hg9u6+/Ht2Ix9K7vY2ZcwKFDB3m+DJvZiru74yRqECUeO3S6AuiUGmaTjqKFSqgkEbfGpaR5McpUxbAVFEKrEcjnC3c+5nJoNHpYrBa+fDqYluuzxWnm5ElcfvFF7J6YQEsyiRW9vVjU3o66ughi8RjqGxtgshigVOXP65HR/eRBAUVJHmgKqZcANEIjiUZjo9SmX4La/GpEvTqEw/JszByWHBQpMkj1KGAzmQf0lyLPzYNMrvg/1/KEEnpmjZWuduc44dezdJcWocarQqVdAzO7bJEokkTCkpB67D1IKlsQFwnE1CF2vyAirOle4YNTOOFmamXKsY2HssjVcqjpJTtfwvoiekwpI0gN1+3sG6Wo4rlM4wqyegZYGX389rI/2KmjkOd1TGlLVhf/mHgNPimkD8Gd64AzxwaDnC5XGOFW2KEnH/RyLYpk+gxa1gIjrTKh1Kpm9ZPBH+Dr2CLjnxJVthOW5rjhUdrgUhvg0Gj4IFHCZJAzRflyNtL1mfHPYuDvQrWcWWAQkom1vIjPbL2FwlTMjDpKZs7INbNDwOLkZS6GhrXByu9ihqmUT3IX89vJOQdHK0cT14z0jIF6ivhU0xfmQKfKgzY3H7qcAmgVhRwLYSA/ClQKSeQrlDd0Mi0t0/P1Y6RrrHRVpqIV0/V/FpkbbrkTxQoHinMouXY4cs0w5mqz3x6FEyUyD19CZSzFlZQqflcyHOU872GKOxlzS1Z/5p5MBmR4lSNybwi1UF9nmWUtsEoO4ZAYb4n9XyoVpZSy/0dKuc8j2bmfMf/feQLISuY8OcN1e1avWZglhk8yCIOUIR4BZEUlVNf/B2/zxvqH1RleAAAAAElFTkSuQmCC"
  };
  var PRODUCTION_ICONS = {
    wood: ICONS.wood,
    clay: ICONS.clay,
    iron: ICONS.iron,
    stone: ICONS.stone,
    food: ICONS.food,
    research: ICONS.research,
    gold: ICONS.gold
  };
  var UPKEEP_GROUP_ICONS = {
    Military: ICONS.troops,
    Diplomacy: ICONS.diplomacy,
    Magic: ICONS.mana,
    Sovereignty: ICONS.sovereignty,
    Trade: ICONS.caravan
  };
  var STRUCTURE_ICONS = {
    trainingGround: ICONS.troops,
    targetRange: ICONS.troops,
    militaryAcademy: ICONS.troops,
    joustingYard: ICONS.troops,
    assemblyYard: ICONS.troops
  };

  // src/scoring.js
  var EPS = 1e-9;
  function settableTax(t) {
    return Number.isFinite(t) ? Math.floor(t) : t;
  }
  function computeK(foodPlots) {
    return foodPlots * FARM_YIELD_L20 / 100;
  }
  function computeBOther(s) {
    let b = prestigeBonus(s, "food");
    if (s.flourMill) b += FLOUR_MILL_L20;
    if (s.naturesBounty) {
      const retreats = Math.min(s.geomancerRetreats ?? 0, 4);
      b += NATURES_BOUNTY_BY_RETREATS[retreats];
    }
    if (s.isCapital) {
      if ((s.cityCount ?? 1) >= 10) b += FAMINE_MANAGEMENT;
      if ((s.cityCount ?? 1) >= 30) b += SOIL_ENRICHMENT;
    }
    return b;
  }
  function computeConsumption(s) {
    return Number.isFinite(s.cityConsumption) ? s.cityConsumption : DEFAULT_CITY_CONSUMPTION;
  }
  function computeResearch(s) {
    const flat = (s.allembine ? ALLEMBINE_RP : 0) + (s.overflowingInsight ? OVERFLOWING_INSIGHT_RP : 0);
    const cal = s.rpCalibration;
    if (cal && cal.observedRpPerHour > 0) {
      const m = PRODUCTION_BASE - cal.atTax + (cal.prestige ? PRESTIGE_PRODUCTION_BONUS : 0);
      return { base: Math.max(0, (cal.observedRpPerHour - flat) * 100 / m), flat };
    }
    return { base: LIBRARY_BASE_RP_L20, flat };
  }
  function computeBasicYield() {
    return { yield: BASIC_YIELD_L20, measured: true };
  }
  function boosterBonus(s, resource) {
    return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;
  }
  function prestigeBonus(s, resource) {
    return s.prestige?.[resource] ? PRESTIGE_PRODUCTION_BONUS : 0;
  }
  function resourceBonus(s, resource) {
    return boosterBonus(s, resource) + prestigeBonus(s, resource);
  }
  function resourceMinimum(s, resource) {
    const v = s.resourceMinimums?.[resource];
    return Number.isFinite(v) && v > 0 ? v : 0;
  }
  function buildingUpkeep(s, resource) {
    let sum = 0;
    for (const b of UPKEEP_BUILDINGS) {
      sum += (s.upkeepBuildings?.[b.key] ?? 0) * (b.consumes[resource] ?? 0);
    }
    return sum;
  }
  function researchAt({ research, rpBonus = 0, tax }) {
    return research.base * (PRODUCTION_BASE - tax + rpBonus) / 100 + research.flat;
  }
  function basicProduction({ plots, yield: y, bonus, tax }) {
    return plots * y * (PRODUCTION_BASE - tax + bonus) / 100;
  }
  function distance(dx, dy) {
    const q = 10 ** CLAIM_DISTANCE_DECIMALS;
    return Math.round(Math.sqrt(dx * dx + dy * dy) * q) / q;
  }
  function chanceryFactor(s) {
    const n = s.upkeepBuildings?.chanceryOfEstates ?? 0;
    return 1 - 2 * CHANCERY_DISCOUNT_L20 * (1 - 0.5 ** n);
  }
  function claimRp(d, level, chancery) {
    if (level <= 0) return 0;
    return CLAIM_RP_PER_LEVEL_DISTANCE * d * (level - 1 + chancery);
  }
  function claimUpkeep(d, level, chancery = 1, held) {
    const from = held ?? 0;
    const rp = level > from ? claimRp(d, level, chancery) - claimRp(d, from, chancery) : 0;
    return { rp, gold: rp * CLAIM_GOLD_PER_LEVEL_DISTANCE / CLAIM_RP_PER_LEVEL_DISTANCE };
  }
  function sovStructure(entry) {
    return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];
  }
  function isProductionStructure(entry) {
    return sovStructure(entry).type === "production";
  }
  function structureUpkeep(entry) {
    return isProductionStructure(entry) ? MILSOV_UPKEEP_BY_LEVEL[entry?.buildingLevel] ?? 0 : 0;
  }
  function milsovUpkeep(entries) {
    return (entries ?? []).reduce((sum, e) => sum + structureUpkeep(e), 0);
  }
  function tFood({ bOther, sFood, consumption, k, minimum = 0 }) {
    return PRODUCTION_BASE + bOther + sFood - (consumption + minimum) / k;
  }
  function tRp({ uRp, research, rpBonus = 0, minimum = 0 }) {
    return PRODUCTION_BASE + rpBonus - 100 * (uRp + minimum - research.flat) / research.base;
  }
  function tRes({ milsovAssignments, plots, settings: settings2 = {} }) {
    const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
    const upkeep = milsovUpkeep(milsovAssignments ?? []);
    const fixed = (res) => resourceMinimum(settings2, res) + buildingUpkeep(settings2, res);
    if (upkeep <= 0 && !BASIC_RESOURCES.some((res) => fixed(res) > 0)) return none;
    const { yield: y, measured } = computeBasicYield(settings2);
    let worst = Infinity;
    let binding = null;
    for (const res of BASIC_RESOURCES) {
      const need = upkeep + fixed(res);
      const perPoint = plots[res] * y;
      const ceiling = perPoint > 0 ? PRODUCTION_BASE + resourceBonus(settings2, res) - 100 * need / perPoint : need > 0 ? -Infinity : Infinity;
      if (ceiling < worst) {
        worst = ceiling;
        binding = res;
      }
    }
    return { ceiling: worst, indicative: !measured, binding, impossible: worst === -Infinity };
  }
  function surplusAt({ tax, settings: settings2, sFood, uRp, uGold, milsovAssignments }) {
    const s = settings2;
    const k = computeK(s.plots.food);
    const upkeep = milsovUpkeep(milsovAssignments ?? []);
    const { yield: y, measured } = computeBasicYield(s);
    const consumption = computeConsumption(s);
    const base = {
      food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),
      rp: researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, "research"), tax }),
      gold: GOLD_PER_TAX_POP * tax * consumption
    };
    const out = {
      tax,
      food: base.food - consumption,
      rp: base.rp - (uRp ?? 0),
      gold: base.gold - (uGold ?? 0),
      upkeep,
      buildingUpkeep: {},
      indicative: !measured
    };
    for (const res of BASIC_RESOURCES) {
      base[res] = basicProduction({
        plots: s.plots[res],
        yield: y,
        bonus: resourceBonus(s, res),
        tax
      });
      out.buildingUpkeep[res] = buildingUpkeep(s, res);
      out[res] = base[res] - upkeep - out.buildingUpkeep[res];
    }
    out.base = base;
    return out;
  }
  function tMax({ food, rp, res }) {
    const candidates = [
      { name: "cap", value: 100 },
      { name: "food", value: food },
      { name: "rp", value: rp },
      { name: "res", value: res }
    ];
    let best = candidates[0];
    for (const c of candidates) if (c.value < best.value) best = c;
    return { value: best.value, binding: best.name };
  }
  function claimGold(uRp, s) {
    return (uRp + (s?.keptClaimRp ?? 0)) * 10;
  }
  function goldNet({ tax, consumption, uGold }) {
    return GOLD_PER_TAX_POP * tax * consumption - uGold;
  }
  function knapsack(candidates, budget, maxItems = Infinity) {
    const needCountDim = candidates.length > maxItems;
    const width = budget + 1;
    const best = new Float64Array(width);
    if (!needCountDim) {
      const bytesPerItem = width;
      const took = new Uint8Array(candidates.length * bytesPerItem);
      for (let i = 0; i < candidates.length; i++) {
        const w = candidates[i].weight;
        const v = candidates[i].food;
        if (w > budget) continue;
        for (let cap = budget; cap >= w; cap--) {
          const alt = best[cap - w] + v;
          if (alt > best[cap]) {
            best[cap] = alt;
            took[i * bytesPerItem + cap] = 1;
          }
        }
      }
      return { best, took, bytesPerItem, countLimited: false };
    }
    const dp = [];
    for (let c = 0; c <= maxItems; c++) dp.push(new Float64Array(width).fill(-Infinity));
    dp[0].fill(0);
    const choice = [];
    for (let i = 0; i < candidates.length; i++) {
      choice.push(new Uint8Array((maxItems + 1) * width));
    }
    for (let i = 0; i < candidates.length; i++) {
      const w = candidates[i].weight;
      const v = candidates[i].food;
      for (let c = maxItems; c >= 1; c--) {
        for (let cap = budget; cap >= w; cap--) {
          const prev = dp[c - 1][cap - w];
          if (prev === -Infinity) continue;
          const alt = prev + v;
          if (alt > dp[c][cap]) {
            dp[c][cap] = alt;
            choice[i][c * width + cap] = 1;
          }
        }
      }
    }
    const bestCount = new Int32Array(width);
    for (let cap = 0; cap <= budget; cap++) {
      let m = 0;
      let mc = 0;
      for (let c = 0; c <= maxItems; c++) {
        if (dp[c][cap] > m) {
          m = dp[c][cap];
          mc = c;
        }
      }
      best[cap] = m;
      bestCount[cap] = mc;
    }
    return { best, took: null, dp, choice, bestCount, width, maxItems, countLimited: true };
  }
  function recoverSet(candidates, dpResult, spend) {
    const chosen = [];
    let cap = spend;
    if (dpResult.countLimited) {
      const { choice, bestCount, width } = dpResult;
      let count2 = bestCount[cap];
      for (let i = candidates.length - 1; i >= 0 && count2 > 0; i--) {
        if (choice[i][count2 * width + cap] === 1) {
          chosen.push(i);
          cap -= candidates[i].weight;
          count2--;
        }
      }
      return chosen.reverse();
    }
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (dpResult.took[i * dpResult.bytesPerItem + cap] === 1) {
        chosen.push(i);
        cap -= candidates[i].weight;
      }
    }
    return chosen.reverse();
  }
  function milsovHeadroom({ tax, settings: settings2, uRp = 0, buildingsUsed = 0 }) {
    const s = settings2;
    const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);
    if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };
    const { yield: y } = computeBasicYield(s);
    let upkeep = Infinity;
    for (const res of BASIC_RESOURCES) {
      const produced = basicProduction({
        plots: s.plots[res],
        yield: y,
        bonus: resourceBonus(s, res),
        tax
      });
      upkeep = Math.min(upkeep, produced - resourceMinimum(s, res) - buildingUpkeep(s, res));
    }
    return {
      rp: Math.max(0, researchAt({
        research: computeResearch(s),
        rpBonus: prestigeBonus(s, "research"),
        tax
      }) - uRp - resourceMinimum(s, "research")),
      upkeep: Math.max(0, upkeep),
      slots
    };
  }
  function descriptorBonus(tile, structure) {
    const d = tile?.descriptor;
    return d && structure && d.sovKey === structure ? d.bonus ?? 0 : 0;
  }
  function planMilsov({ tiles, headroom, chancery = 1, structure }) {
    const EPS2 = 1e-9;
    const n = Math.min(tiles.length, Math.floor(headroom.slots));
    const RATE = [chancery, 1, 1, 1, 1];
    const D = [];
    for (let j = 0; j < MILSOV_MAX_LEVEL; j++) {
      const pre = [0];
      for (let i = 0; i < n; i++) pre.push(pre[i] + ((tiles[i].held ?? 0) > j ? 0 : tiles[i].d));
      D.push(pre);
    }
    const rpOf = (j, m2) => CLAIM_RP_PER_LEVEL_DISTANCE * RATE[j] * D[j][m2];
    const empty = { counts: [0, 0, 0, 0, 0], levels: [], bonus: 0, rp: 0, upkeep: 0, buildings: 0 };
    if (n === 0) return empty;
    const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);
    const finish = (counts) => {
      const levels = [];
      let bonus = 0;
      for (let i = 0; i < n; i++) {
        const level = counts.filter((m2) => m2 > i).length;
        if (level > 0) levels.push(level);
        bonus += level * (MILSOV_BONUS_PER_LEVEL + descriptorBonus(tiles[i], structure));
      }
      const units = counts.reduce((a, b) => a + b, 0);
      return {
        counts,
        levels,
        bonus,
        rp: counts.reduce((sum, m2, j) => sum + rpOf(j, m2), 0),
        upkeep: counts.reduce((sum, m2, j) => sum + MILSOV_UPKEEP_STEP[j] * m2, 0),
        buildings: levels.length
      };
    };
    const topRp = D.reduce((sum, _, j) => sum + rpOf(j, n), 0);
    if (topRp <= headroom.rp + EPS2 && layerTotal * n <= headroom.upkeep + EPS2) {
      return finish(new Array(MILSOV_MAX_LEVEL).fill(n));
    }
    const m = new Array(MILSOV_MAX_LEVEL).fill(0);
    let best = null;
    const search = (j, units, rp, upkeep, cap) => {
      if (j === MILSOV_MAX_LEVEL) {
        if (!best || units > best.units || units === best.units && rp < best.rp - EPS2) {
          best = { counts: [...m], units, rp };
        }
        return;
      }
      let vMax = 0;
      while (vMax < cap && rp + rpOf(j, vMax + 1) <= headroom.rp + EPS2 && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS2) vMax++;
      for (let v = vMax; v >= 0; v--) {
        if (best) {
          const bound = units + (MILSOV_MAX_LEVEL - j) * v;
          if (bound < best.units) break;
          if (bound === best.units && rp >= best.rp - EPS2) break;
        }
        m[j] = v;
        search(j + 1, units + v, rp + rpOf(j, v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);
      }
      m[j] = 0;
    };
    search(0, 0, 0, 0, n);
    return best ? finish(best.counts) : empty;
  }
  function milsovClaims({ tiles, levels, structure, chancery }) {
    return levels.map((level, i) => {
      const held = tiles[i].held ?? 0;
      return {
        ...tiles[i],
        structure,
        // A standing claim keeps its level.
        sovLevel: Math.max(level, held),
        buildingLevel: level,
        ...claimUpkeep(tiles[i].d, level, chancery, held)
      };
    });
  }
  function milsovBlockedBy({ hosts, free, headroom, chancery }) {
    if (free.length === 0) return "tiles";
    if (hosts.length === 0) return "water";
    if (headroom.slots < 1) return "slots";
    if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return "upkeep";
    const nearest = hosts.reduce((d, t) => Math.min(d, (t.held ?? 0) > 0 ? 0 : t.d), Infinity);
    const cheapest = claimUpkeep(nearest, 1, chancery).rp;
    if (headroom.rp + 1e-9 < cheapest) return "rp";
    return null;
  }
  function prepareSite({ neighbours, settings: settings2 }) {
    const s = settings2;
    const chancery = chanceryFactor(s);
    const maxBuildings = s.maxBuildings ?? 20;
    const byDistance = neighbours.map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) })).sort((a, b) => a.d - b.d || a.food - b.food);
    const foodCandidates = byDistance.filter((t) => t.food > 0).map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery, t.held);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });
    const rpBonus = prestigeBonus(s, "research");
    const budget = Math.max(0, Math.round(researchAt({ research: computeResearch(s), rpBonus, tax: 0 })));
    return {
      settings: s,
      chancery,
      structure: s.milsovStructure || null,
      k: computeK(s.plots.food),
      bOther: computeBOther(s),
      consumption: computeConsumption(s),
      research: computeResearch(s),
      rpBonus,
      minFood: resourceMinimum(s, "food"),
      minRp: resourceMinimum(s, "research"),
      byDistance,
      foodCandidates,
      budget,
      dp: knapsack(foodCandidates, budget, maxBuildings)
    };
  }
  function foodSpendFor(ctx, tax) {
    const needed = tax - PRODUCTION_BASE - ctx.bOther + (ctx.consumption + ctx.minFood) / ctx.k;
    if (!(ctx.dp.best[ctx.budget] >= needed - EPS)) return null;
    let lo = 0;
    let hi = ctx.budget;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (ctx.dp.best[mid] >= needed - EPS) hi = mid;
      else lo = mid + 1;
    }
    const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
    return produced - lo - ctx.minRp < -EPS ? null : lo;
  }
  function bestFoodSpend(ctx, tax) {
    const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
    const affordable = Math.max(0, Math.min(ctx.budget, Math.floor(produced - ctx.minRp)));
    const target = ctx.dp.best[affordable];
    let lo = 0;
    let hi = affordable;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (ctx.dp.best[mid] >= target - EPS) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }
  function planSiteAt(ctx, tax, { bestEffort = false } = {}) {
    const s = ctx.settings;
    if (!Number.isFinite(tax)) return null;
    const held = foodSpendFor(ctx, tax);
    const spend = held ?? (bestEffort ? bestFoodSpend(ctx, tax) : null);
    if (spend === null) return null;
    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);
    const claimed = new Set(tiles.map((t) => t.idx));
    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
    const hosts = free.filter((t) => !t.water);
    const headroom = milsovHeadroom({
      tax,
      settings: s,
      uRp: spend,
      buildingsUsed: tiles.length
    });
    const military = planMilsov({
      tiles: ctx.structure ? hosts : [],
      headroom,
      chancery: ctx.chancery,
      structure: ctx.structure
    });
    const milsov = milsovClaims({
      tiles: hosts,
      levels: military.levels,
      structure: ctx.structure,
      chancery: ctx.chancery
    });
    const sFood = ctx.dp.best[spend];
    const milsovRp = milsov.reduce((sum, a) => sum + a.rp, 0);
    const uRp = spend + milsovRp;
    const uGold = claimGold(uRp, s);
    const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });
    const ceiling = tMax({
      food: tFood({
        bOther: ctx.bOther,
        sFood,
        consumption: ctx.consumption,
        k: ctx.k,
        minimum: ctx.minFood
      }),
      rp: tRp({ uRp, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
      res: resCeiling.indicative ? Infinity : resCeiling.ceiling
    });
    return {
      tax,
      // False when the plan is at a tax the site cannot hold.
      holds: held !== null,
      tMax: ceiling.value,
      binding: ceiling.binding,
      sFood,
      spend,
      uRp,
      uGold,
      goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
      surplus: Number.isFinite(tax) ? surplusAt({ tax, settings: s, sFood, uRp, uGold, milsovAssignments: milsov }) : null,
      tiles,
      free,
      headroom,
      milsov,
      milsovBonus: military.bonus,
      milsovUpkeep: military.upkeep,
      milsovRp,
      milsovGold: milsov.reduce((sum, a) => sum + a.gold, 0),
      milsovBlocked: ctx.structure && milsov.length === 0 ? milsovBlockedBy({ hosts, free, headroom, chancery: ctx.chancery }) : null,
      resCeiling: resCeiling.ceiling,
      resIndicative: resCeiling.indicative,
      resBinding: resCeiling.binding,
      resImpossible: resCeiling.impossible
    };
  }
  function milsovAtFloor(ctx, { required, floor, ceiling }) {
    const at = (tax) => {
      const p = planSiteAt(ctx, tax);
      return p && p.milsovBonus >= required ? p : null;
    };
    let lo = Math.ceil(floor);
    let best = at(lo);
    if (!best) return null;
    let hi = Math.floor(ceiling);
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const p = at(mid);
      if (p) {
        best = p;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return { bonus: best.milsovBonus, tax: best.tax };
  }
  function siteCeiling(ctx) {
    const floors = tRes({ milsovAssignments: [], plots: ctx.settings.plots, settings: ctx.settings });
    const res = floors.indicative ? Infinity : floors.ceiling;
    let winner = null;
    for (let spend = 0; spend <= ctx.budget; spend++) {
      const sFood = ctx.dp.best[spend];
      const t = tMax({
        food: tFood({
          bOther: ctx.bOther,
          sFood,
          consumption: ctx.consumption,
          k: ctx.k,
          minimum: ctx.minFood
        }),
        rp: tRp({ uRp: spend, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
        res
      });
      const net = goldNet({
        tax: t.value,
        consumption: ctx.consumption,
        uGold: claimGold(spend, ctx.settings)
      });
      if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {
        winner = { tMax: t.value, binding: t.binding, sFood, spend };
      }
    }
    return winner;
  }
  function scoreSiteFrom(ctx) {
    const s = ctx.settings;
    const winner = siteCeiling(ctx);
    if (!winner) return null;
    const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);
    const cheaper = ctx.structure ? planSiteAt(ctx, plan.tax - 1) : null;
    const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : s.milsovMinBonus ?? 0;
    const floor = Math.min(s.tMin ?? 0, plan.tax);
    const reach = required > 0 && plan.milsovBonus < required && Number.isFinite(plan.tax) ? milsovAtFloor(ctx, { required, floor, ceiling: plan.tax }) : null;
    return {
      ...plan,
      // Ranked at the whole-number rate; `tMaxExact` is the unrounded ceiling.
      tMax: plan.tax,
      tMaxExact: winner.tMax,
      // Named from the exact ceiling.
      binding: winner.binding,
      milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,
      // The highest tax reaching the minimum bonus, when it is not met for free.
      milsovMinTax: reach ? reach.tax : null,
      milsovMinBonusAt: reach ? reach.bonus : null,
      // Not reachable at any tax the user accepts.
      milsovShortfall: required > 0 && plan.milsovBonus < required && !reach
    };
  }
  function fallbackPlan(ctx, winner) {
    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, winner.spend).map((i) => ctx.foodCandidates[i]);
    const claimed = new Set(tiles.map((t) => t.idx));
    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
    const headroom = milsovHeadroom({
      tax: winner.tMax,
      settings: ctx.settings,
      uRp: winner.spend,
      buildingsUsed: tiles.length
    });
    return {
      tax: winner.tMax,
      tMax: winner.tMax,
      binding: "food",
      sFood: winner.sFood,
      spend: winner.spend,
      uRp: winner.spend,
      uGold: claimGold(winner.spend, ctx.settings),
      goldNet: goldNet({
        tax: winner.tMax,
        consumption: ctx.consumption,
        uGold: claimGold(winner.spend, ctx.settings)
      }),
      surplus: null,
      tiles,
      free,
      headroom,
      milsov: [],
      milsovBonus: 0,
      milsovUpkeep: 0,
      milsovRp: 0,
      milsovGold: 0,
      milsovBlocked: ctx.structure ? milsovBlockedBy({
        hosts: free.filter((t) => !t.water),
        free,
        headroom,
        chancery: ctx.chancery
      }) : null,
      resCeiling: Infinity,
      resIndicative: false,
      resBinding: null,
      resImpossible: false
    };
  }
  function betterPlan(a, b) {
    const EPS2 = 1e-9;
    if (a.tMax > b.tMax + EPS2) return true;
    if (a.tMax < b.tMax - EPS2) return false;
    if (a.uRp < b.uRp - EPS2) return true;
    if (a.uRp > b.uRp + EPS2) return false;
    return a.goldNet > b.goldNet;
  }

  // src/focus.js
  var FOCUS_DEFAULT_TAX = 60;
  var FOCUS_TAX_FLOOR = 0;
  var DEFAULT_FOCUS = {
    x: null,
    y: null,
    radius: null,
    // null follows R_claim from the city configuration
    tax: FOCUS_DEFAULT_TAX,
    useConfiguredPlots: true,
    preserveSovereignty: false
  };
  function toInt(raw, { min = -Infinity, max = Infinity, fallback = null } = {}) {
    const n = Number(String(raw ?? "").trim());
    if (String(raw ?? "").trim() === "" || !Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, Math.round(n)));
  }
  function parseFocus(raw) {
    const errors = [];
    const x = toInt(raw?.x);
    const y = toInt(raw?.y);
    if (x === null || y === null) errors.push("Enter the tile coordinates as x and y.");
    return {
      focus: {
        x,
        y,
        radius: toInt(raw?.radius, { min: 1, max: 6, fallback: null }),
        // Whole points only: the game accepts no other rate.
        tax: toInt(raw?.tax, { min: FOCUS_TAX_FLOOR, max: 100, fallback: FOCUS_DEFAULT_TAX }),
        useConfiguredPlots: !!raw?.useConfiguredPlots,
        preserveSovereignty: !!raw?.preserveSovereignty
      },
      errors
    };
  }
  function focusRadius(focus, settings2) {
    return focus?.radius ?? Math.round(settings2?.rClaim ?? 2);
  }
  function plotsFromRs(rs) {
    if (!rs) return null;
    const plots = {};
    let total = 0;
    for (const key of PLOT_KEYS) {
      const v = rs[key];
      if (!Number.isFinite(v) || v < 0) return null;
      plots[key] = Math.round(v);
      total += plots[key];
    }
    return total === PLOT_TOTAL ? plots : null;
  }
  function resolvePlots(focus, settings2, rs) {
    const configured = settings2.plots;
    if (focus.useConfiguredPlots) {
      return {
        plots: configured,
        source: "config",
        note: "Planned on the plot allocation from City Configuration, not this tile\u2019s own ratings."
      };
    }
    const own = plotsFromRs(rs);
    if (own) {
      return {
        plots: own,
        source: "tile",
        note: `Planned on this tile\u2019s own ratings \u2014 ${PLOT_KEYS.map((p) => own[p]).join("|")}.`
      };
    }
    return {
      plots: configured,
      source: "fallback",
      note: rs ? `This tile\u2019s ratings do not total ${PLOT_TOTAL} plots, so the City Configuration allocation was used instead.` : "The payload carries no resource ratings for this tile, so the City Configuration allocation was used instead."
    };
  }
  function keptClaims({ payload, centre, radius, idx, chancery, town }) {
    const claims = [];
    let rp = 0;
    let unknownLevel = 0;
    let otherTown = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const key = tileKey(centre.y + dy, centre.x + dx);
        const claim = idx.claims.get(key);
        if (!claim) continue;
        if (!isTownsClaim(claim, town)) {
          if (claim.rd === "Yours") otherTown += 1;
          continue;
        }
        const level = claimLevel(claim);
        if (level === null) {
          unknownLevel += 1;
          continue;
        }
        const d = distance(dx, dy);
        const up = claimUpkeep(d, level, chancery);
        claims.push({ dx, dy, d, level, key, rp: up.rp, gold: up.gold });
        rp += up.rp;
      }
    }
    return { claims, rp, unknownLevel, otherTown };
  }
  function centreFacts(tile, key, idx) {
    const claim = idx.claims.get(key);
    return {
      settleable: isSettleable(tile),
      claimedBy: claim ? claim.rd ?? "someone" : null,
      isTown: idx.towns.has(key)
    };
  }
  function focusSite({ payload, focus, settings: settings2 }) {
    if (!payload || !payload.data) {
      return {
        ok: false,
        reason: "no-payload",
        message: "No map data on screen yet. Pan or zoom the map, then try again."
      };
    }
    const radius = focusRadius(focus, settings2);
    const key = tileKey(focus.y, focus.x);
    const centre = payload.data[key];
    if (!centre) {
      return {
        ok: false,
        reason: "centre-missing",
        message: `${focus.x}|${focus.y} is off screen. Pan the map over that tile, then try again.`
      };
    }
    const idx = indexPayload(payload);
    const rs = parseRs(centre);
    const { plots, source: plotSource, note: plotNote } = resolvePlots(focus, settings2, rs);
    let effective = { ...settings2, plots, rClaim: radius };
    const centreTown = idx.towns.get(key);
    const homeName = centreTown ? townIdentity(centreTown)[0] : void 0;
    const homeTown = homeName ? centreTown : null;
    const preserveTown = focus.preserveSovereignty ? homeTown : null;
    if (homeTown) effective = { ...effective, homeTown };
    const kept = preserveTown ? keptClaims({
      payload,
      centre: focus,
      radius,
      idx,
      chancery: chanceryFactor(settings2),
      town: preserveTown
    }) : { claims: [], rp: 0, unknownLevel: 0, otherTown: 0 };
    const released = homeTown && !preserveTown ? keptClaims({
      payload,
      centre: focus,
      radius,
      idx,
      chancery: chanceryFactor(settings2),
      town: homeTown
    }) : null;
    if (preserveTown) {
      effective = {
        ...effective,
        preserveTown,
        keptClaimRp: kept.rp,
        resourceMinimums: {
          ...effective.resourceMinimums,
          research: (effective.resourceMinimums?.research ?? 0) + kept.rp
        }
      };
    }
    const { neighbours, missing, ring } = collectNeighbourhood(payload, key, radius, idx, effective);
    if (missing.length) {
      return {
        ok: false,
        reason: "incomplete",
        message: `${missing.length} of the ${ring} tiles within radius ${radius} of ${focus.x}|${focus.y} are off screen. Zoom out or pan so the whole area is on screen, then try again.`,
        missing: missing.length,
        ring
      };
    }
    const ctx = prepareSite({ neighbours, settings: effective });
    const base = scoreSiteFrom(ctx);
    if (!base) {
      return {
        ok: false,
        reason: "unplannable",
        message: `Nothing could be planned at ${focus.x}|${focus.y}.`
      };
    }
    const ceiling = base.tMax;
    const floor = Math.max(0, Math.min(settings2.tMin ?? 0, ceiling));
    const requested = focus.tax;
    const tax = Math.max(0, Math.min(ceiling, Math.max(floor, requested)));
    const plan = planSiteAt(ctx, tax, { bestEffort: true }) ?? base;
    return {
      ok: true,
      x: focus.x,
      y: focus.y,
      key,
      radius,
      radiusFromConfig: focus.radius == null,
      rs,
      plots,
      plotSource,
      plotNote,
      centre: centreFacts(centre, key, idx),
      preserving: !!focus.preserveSovereignty,
      // The centre town's name, null where there is none. preserveTown is also
      // null when not preserving.
      preserveTown: preserveTown ? homeName : null,
      homeTown: homeTown ? homeName : null,
      // The town's own claims laid out afresh because preserving was off.
      released: released ? released.claims.length + released.unknownLevel : 0,
      // The settings this plan was made with, which differ from the form's.
      neighbours,
      settings: effective,
      kept,
      claimable: neighbours.length,
      ring,
      ctx,
      base,
      plan,
      tax,
      requestedTax: requested,
      aboveCeiling: requested > ceiling + 1e-9,
      // No tax runs this site; the plan is at 0% with a deficit.
      holdsNoTax: ceiling < 0,
      ceiling,
      floor
    };
  }

  // src/panel.js
  var CSS = `
/* Form controls take the browser's own font and colour rather than inheriting,
   so every element gets them here, first, and nested elements need explicit
   rules: they never inherit size, weight or colour. */
.sov-panel,.sov-panel *{color:#e6e6e6;background:transparent;font:12px/1.4 system-ui,sans-serif}
.sov-panel,.sov-menu,.sov-tip{--bg:#1b1b1b;--card:#222;--card-hi:#292929;--line:#333;--line2:#444;
  --muted:#9a9a9a;--accent:#3a5;--accent-text:#7fdca0;--blue:#6bf;--amber:#eb8;--red:#e66}
.sov-panel strong,.sov-panel b{font-weight:700}
/* Lets a glyph's currentColor follow its button instead of the reset. */
.sov-panel .sov-glyph,.sov-panel .sov-glyph *{color:inherit}
.sov-glyph{flex:none;width:14px;height:14px}
/* Only the body scrolls; the header and tabs stay put. */
.sov-panel{position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow:hidden;
  display:flex;flex-direction:column;z-index:99999;background:var(--bg);
  border-left:1px solid var(--line2);box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-panel h2{flex:none;margin:0;padding:8px 10px;font-size:13px;font-weight:600;
  color:#fff;background:#262626;cursor:move;user-select:none}
.sov-panel h2 .sov-h2-inner{display:flex;align-items:center;gap:8px}
.sov-panel h2 .sov-title{min-width:0;font-size:13px;font-weight:600;color:#fff}
.sov-panel h2 .sov-h2-actions{margin-left:auto;flex:none;display:flex;align-items:center;gap:12px}
.sov-panel.sov-dragging{cursor:grabbing}
.sov-panel.sov-dragging h2{cursor:grabbing}
.sov-panel h2 .sov-about{color:#8a8a8a;text-decoration:none;font-size:18px;line-height:1}
.sov-panel h2 .sov-about:hover{color:#fff}
/* Not <button>s, which the panel draws as filled buttons. */
.sov-panel h2 .sov-gear,.sov-panel h2 .sov-changelog{color:#8a8a8a;font-size:18px;line-height:1;cursor:pointer}
.sov-panel h2 .sov-gear:hover,.sov-panel h2 .sov-changelog:hover{color:#fff}
.sov-panel h2 .sov-gear:focus-visible,.sov-panel h2 .sov-changelog:focus-visible{outline:1px solid var(--blue)}
.sov-panel h2 .sov-changelog .sov-glyph{display:block;width:16px;height:16px}
.sov-panel h2 .sov-build{color:#777;font-size:10px;font-weight:normal}
/* No pointer events, so the icon never takes the header's drag. */
.sov-panel h2 .sov-app-icon{flex:none;width:18px;height:18px;pointer-events:none}
/* The header's popovers live outside the panel, so the panel's overflow cannot
   clip them, and need their own reset. */
.sov-menu,.sov-menu *{color:#e6e6e6;background:transparent;font:12px/1.4 system-ui,sans-serif}
.sov-menu{position:fixed;z-index:100000;width:260px;box-sizing:border-box;
  background:var(--bg);border:1px solid var(--line2);border-radius:8px;padding:8px 10px;
  box-shadow:0 4px 12px rgba(0,0,0,.5)}
.sov-menu h3{margin:0 0 6px;font-size:13px;font-weight:600;color:#fff}
.sov-menu[hidden]{display:none}
.sov-menu.sov-changelog-menu{width:320px}
/* Replaces the browser's own tooltip for every title in the panel and its
   popovers. Outside the panel for the same reason as the popovers. */
.sov-tip{position:fixed;z-index:100001;max-width:280px;box-sizing:border-box;padding:6px 8px;
  background:#262626;border:1px solid var(--line2);border-radius:6px;
  box-shadow:0 4px 12px rgba(0,0,0,.5);pointer-events:none;white-space:pre-line;
  color:#e6e6e6;font:12px/1.45 system-ui,sans-serif}
.sov-tip[hidden]{display:none}
/* A tooltip of several lines leads with what the thing is. */
.sov-tip.sov-tip-multi::first-line{font-weight:600;color:#fff}
.sov-changelog-body{max-height:60vh;overflow:auto}
.sov-menu h4{margin:8px 0 2px;font-weight:600;color:#fff}
.sov-menu .sov-changelog-date{margin-left:6px;color:var(--muted)}
.sov-menu ul{margin:0;padding:0 0 0 16px;list-style:disc}
.sov-menu li{margin:2px 0}
.sov-collapsed{width:auto;max-height:none;overflow:visible;border-left:0;
  background:transparent;box-shadow:none}
.sov-collapsed .sov-body,.sov-collapsed .sov-tabs{display:none}
/* The icon is its own tile, so the header shrinks to it; the radius matches the
   tile's so the shadow follows its corners. */
.sov-collapsed h2{padding:0;background:transparent;border-radius:13px;
  box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-collapsed h2 .sov-title,.sov-collapsed h2 .sov-h2-actions{display:none}
.sov-collapsed h2 .sov-app-icon{width:56px;height:56px;margin:0;vertical-align:middle}
/* A glint sweeps the crown once per hover. The sweep starts from the glint's
   resting translate in APP_ICON_SVG, and its px are the icon's own units. */
@keyframes sov-glint{from{transform:translateX(-46px)}to{transform:translateX(46px)}}
@media (prefers-reduced-motion:no-preference){
  .sov-collapsed h2:hover .sov-app-icon-glint{animation:sov-glint .85s ease-in-out}}

.sov-tabs{flex:none;display:flex;margin:0;padding:0 6px;background:#262626;
  border-bottom:1px solid var(--line2)}
.sov-panel .sov-tabs button{flex:1 1 auto;display:flex;align-items:center;justify-content:center;
  gap:5px;background:transparent;color:#9a9a9a;padding:7px 6px 6px;border-radius:0;
  border-bottom:2px solid transparent;white-space:nowrap}
.sov-panel .sov-tabs button:hover{color:#fff}
.sov-panel .sov-tabs button.on{color:#fff;border-bottom-color:var(--accent)}
/* min-height:0 lets the body shrink, rather than push the header off screen. */
.sov-body{flex:1 1 auto;min-height:0;overflow:auto;padding:10px}

.sov-panel button{display:inline-flex;align-items:center;gap:5px;background:var(--accent);
  color:#fff;border:0;border-radius:4px;padding:5px 11px;cursor:pointer;font-weight:600}
.sov-panel button:hover{filter:brightness(1.12)}
.sov-panel button.sec{background:#3a3a3a;font-weight:normal}
.sov-panel button[disabled]{background:#2e2e2e;color:#777;cursor:not-allowed;filter:none}
.sov-panel button.sov-picking{background:#a33}
.sov-run{margin:8px 0 4px}
.sov-panel .sov-run button{width:100%;justify-content:center;padding:7px 11px}
.sov-toolbar{display:flex;align-items:center;gap:6px;margin:0 0 8px}

.sov-panel input[type=number],.sov-panel select,.sov-menu select{background:#121212;color:#ddd;
  border:1px solid var(--line2);border-radius:4px;padding:2px 5px;font:inherit;box-sizing:border-box}
.sov-panel input[type=number]:focus,.sov-panel select:focus{outline:none;border-color:var(--accent)}
.sov-panel input[type=number]::placeholder{color:#666}
.sov-panel input[type=range]{accent-color:var(--accent)}
/* Tick-boxes drawn as switches, with gradients: not every browser paints
   pseudo-elements on an input. */
.sov-panel input[type=checkbox],.sov-menu input[type=checkbox]{-webkit-appearance:none;
  appearance:none;flex:none;box-sizing:border-box;width:28px;height:16px;margin:0;
  border:1px solid var(--line2);border-radius:8px;cursor:pointer;
  background:radial-gradient(circle at 7px 50%,#9a9a9a 4.5px,transparent 5px) #2b2b2b;
  transition:background-color .12s}
.sov-panel input[type=checkbox]:checked,.sov-menu input[type=checkbox]:checked{
  border-color:var(--accent);
  background:radial-gradient(circle at 19px 50%,#fff 4.5px,transparent 5px) var(--accent)}
.sov-panel input[type=checkbox]:focus-visible,.sov-menu input[type=checkbox]:focus-visible{
  outline:1px solid var(--blue);outline-offset:1px}
.sov-panel input:disabled,.sov-panel select:disabled{cursor:not-allowed}

.sov-f{display:flex;align-items:center;justify-content:space-between;gap:8px;
  min-height:24px;margin:1px 0}
.sov-f>span{flex:1}
/* The label is only as wide as its text, so a click in the gap toggles nothing. */
.sov-f>label{cursor:pointer;min-width:0;color:#d4d4d4}
.sov-f input[type=number]{width:70px;text-align:right}
.sov-f select{max-width:180px}
.sov-gated{opacity:.4}

.sov-sec{margin:0 0 6px;background:var(--card);border:1px solid var(--line);border-radius:6px}
.sov-sec>summary{display:flex;align-items:center;gap:8px;padding:6px 9px;cursor:pointer;
  list-style:none;user-select:none;border-radius:6px}
.sov-sec>summary::-webkit-details-marker{display:none}
.sov-sec>summary:hover{background:var(--card-hi)}
.sov-sec[open]>summary{border-bottom:1px solid var(--line);border-radius:6px 6px 0 0}
/* A fixed width, so section names line up whatever the icons. */
.sov-sec-ico{flex:none;width:40px;display:flex;align-items:center;justify-content:center}
.sov-panel .sov-sec-ico img{width:22px;height:22px;margin:0;image-rendering:pixelated}
.sov-panel .sov-sec-ico img:not(:only-child){width:16px;height:16px}
.sov-panel .sov-sec-ico img+img{margin-left:-8px}
.sov-panel .sov-sec-name{flex:none;font-weight:600;color:#fff}
.sov-sum{margin-left:auto;min-width:0;display:flex;align-items:center;justify-content:flex-end;
  gap:3px;color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden}
.sov-panel .sov-sum *{font-size:11px;color:inherit}
.sov-panel .sov-sum img{width:12px;height:12px;margin:0 0 0 4px;image-rendering:pixelated}
.sov-panel .sov-sum .sov-bad{color:var(--red);font-weight:700}
.sov-chev{flex:none;display:flex;color:#777;transition:transform .12s}
.sov-sec[open]>summary .sov-chev{transform:rotate(90deg)}
.sov-sec-body{padding:6px 9px 8px}
.sov-card{margin:0 0 6px;padding:6px 9px;background:var(--card);border:1px solid var(--line);
  border-radius:6px}

.sov-panel img.sov-ico{width:12px;height:12px;vertical-align:-2px;margin-right:4px;
  image-rendering:pixelated}
.sov-plot-fields{display:flex;gap:4px;margin:2px 0}
.sov-plot{flex:1;text-align:center}
.sov-plot-fields label{display:block;font-size:10px;color:#b5b5b5;cursor:pointer}
.sov-plot-fields label .sov-ico{display:block;width:18px;height:18px;margin:0 auto 1px}
.sov-panel .sov-plot-fields input{width:100%;text-align:center}
.sov-plotbar{display:flex;gap:1px;height:7px;margin:5px 0 3px}
.sov-plotbar>i{flex:1;border-radius:1px;background:#2e2e2e}
.sov-plotbar>i.sov-p-wood{background:#9b7440}
.sov-plotbar>i.sov-p-clay{background:#c2633b}
.sov-plotbar>i.sov-p-iron{background:#5f9a86}
.sov-plotbar>i.sov-p-stone{background:#a0a0a0}
.sov-plotbar>i.sov-p-food{background:#d9b23f}
.sov-plotbar>i.sov-p-over{background:var(--red)}
.sov-plot-sum{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:4px 6px}
.sov-plot-sum .sov-plot-total{font-size:11px}
.sov-panel .sov-plot-sum button{padding:3px 8px;font-size:11px;white-space:nowrap}
.sov-bad{color:var(--red);font-weight:bold}
.sov-ok{color:#6c6}

.sov-chip{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border-radius:10px;
  background:#2a2a2a;border:1px solid var(--line2);font-size:11px;white-space:nowrap}
.sov-panel .sov-chip img{width:12px;height:12px;margin:0;image-rendering:pixelated}
.sov-panel .sov-chip b{font-size:11px}
.sov-chip.sov-on{color:var(--accent-text);border-color:#2f5a3a;background:#1d2a20}
.sov-chip.sov-off{color:#7d7d7d}
.sov-derived{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 0}
.sov-derived-food{margin:6px 0 0;color:var(--accent-text);font-size:11px}

.sov-panel table.sov-matrix{width:100%;border-collapse:collapse}
.sov-panel .sov-matrix th{padding:2px 4px 4px;border-bottom:1px solid var(--line2);
  font-size:10px;font-weight:600;color:var(--muted);text-align:center;cursor:help}
.sov-panel .sov-matrix td{padding:3px 4px;border-bottom:1px solid #2a2a2a;text-align:center}
.sov-panel .sov-matrix th:first-child,.sov-panel .sov-matrix td:first-child{text-align:left}
.sov-panel .sov-matrix tr:last-child td{border-bottom:0}
.sov-panel .sov-matrix input[type=number]{width:72px;text-align:right}
.sov-matrix .sov-none{color:#555}

.sov-upkeep-group{display:flex;align-items:center;gap:6px;margin:10px 0 2px;padding-bottom:3px;
  border-bottom:1px solid var(--line);color:var(--accent-text);font-weight:600}
.sov-upkeep-group:first-child{margin-top:0}
.sov-panel .sov-upkeep-group img{width:18px;height:18px;image-rendering:pixelated}
.sov-f>.sov-uses{flex:none;display:inline-flex;gap:3px;margin-left:auto;cursor:help}
.sov-panel .sov-uses img{width:12px;height:12px;image-rendering:pixelated}
.sov-panel [data-upkeep-row] input[type=number]{width:52px}
.sov-panel .sov-has>label{color:#fff;font-weight:600}
.sov-f-head{margin:8px 0 2px;color:#d4d4d4}
.sov-terrains{display:grid;grid-template-columns:1fr 1fr;column-gap:16px}
/* Plains alone, then each Small beside its Large. */
.sov-terrains>:nth-child(2){grid-column:1}

/* Framed in red even when empty, as a warning that a reading here overrides
   the settings above. */
.sov-panel fieldset.sov-override{border:1px solid #6a2a2a;border-radius:6px;background:#211a1a;
  margin:6px 0 2px;padding:2px 8px 6px}
.sov-panel fieldset.sov-override.sov-override-on{border-color:#e55;background:#2a1b1b}
.sov-panel .sov-override>legend{padding:0 4px;color:#e88;font-weight:600;font-size:11px}
.sov-panel .sov-override.sov-override-on>legend{color:#f99}

.sov-form-foot{display:flex;align-items:center;gap:8px;margin:10px 0 0}

.sov-hint{color:var(--muted);font-size:11px;margin:2px 0}
.sov-note{color:#b5b5b5;font-size:11px;margin:2px 0}
.sov-warn{color:var(--red);font-weight:bold;font-size:11px;margin:2px 0}
.sov-flag{color:#e94}
.sov-legend{color:var(--muted);font-size:10px;margin:2px 0}
.sov-meta{display:flex;align-items:center;gap:6px;margin:0 0 4px;color:#b5b5b5;font-size:11px}
.sov-meta .sov-glyph{color:var(--muted)}

.sov-panel table{width:100%;border-collapse:collapse}
.sov-panel th,.sov-panel td{padding:3px 4px;border-bottom:1px solid #2a2a2a;text-align:right}
.sov-panel th{font-size:11px;font-weight:600;color:var(--muted);border-bottom-color:var(--line2)}
.sov-panel th:first-child,.sov-panel td:first-child{text-align:left}
.sov-panel .sov-results td{font-variant-numeric:tabular-nums}
.sov-panel .sov-results th img{width:14px;height:14px;vertical-align:-3px;image-rendering:pixelated}
.sov-panel .sov-results td.sov-at{text-align:left;white-space:nowrap}
.sov-row{cursor:pointer}
.sov-row:hover>td{background:#252525}
.sov-selected>td,.sov-selected:hover>td{background:#1f3326}
.sov-panel td.sov-tax-cell,.sov-panel td.sov-mil-cell{white-space:nowrap}
.sov-panel .sov-tax-cell b{font-size:12px;color:#fff}
.sov-panel th{white-space:nowrap}
.sov-panel .sov-mil-v{font-size:12px;color:var(--amber)}
.sov-panel .sov-pill img{width:11px;height:11px;margin-right:3px;vertical-align:-2px;image-rendering:pixelated}
.sov-panel .sov-tax-cell img{width:12px;height:12px;margin-left:4px;vertical-align:-2px;
  image-rendering:pixelated}
.sov-panel .sov-cap{margin-left:4px;font-size:9px;color:var(--muted)}
/* Styled like the numbered markers on the World Map. */
.sov-rank{display:inline-block;box-sizing:border-box;min-width:18px;height:18px;margin-right:6px;
  border-radius:9px;text-align:center;font-size:10px;line-height:16px;font-weight:700;color:#777}
.sov-rank.sov-rank-top{border:2px solid var(--accent);background:#141414;color:#fff;line-height:14px}
.sov-pill{display:inline-block;margin:1px 0 1px 2px;padding:0 6px;border-radius:8px;font-size:10px;
  line-height:15px;white-space:nowrap;background:#333;color:#ccc;cursor:help}
.sov-pill.sov-pill-warn{background:#3a2e1a;color:var(--amber)}
.sov-pill.sov-pill-bad{background:#3a1d1d;color:#f99}
.sov-panel tr.sov-detail>td{background:#1f1f1f;padding:8px;border-bottom:2px solid var(--line2);
  text-align:left}
.sov-detail-actions{margin:0 0 6px}
.sov-panel .sov-detail-actions button{padding:4px 9px}

.sov-xy{display:flex;align-items:center;gap:4px}
.sov-panel .sov-xy input{width:58px;text-align:right}
.sov-panel .sov-xy button{padding:3px 8px;white-space:nowrap}
.sov-xy .sov-or{color:#777;font-size:11px}
.sov-no-map .sov-map-only{display:none}
.sov-panel a.sov-map-centre{color:var(--blue);text-decoration:underline}

.sov-result-h{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin:10px 0 4px;
  padding-top:10px;border-top:1px solid var(--line)}
.sov-panel .sov-xy-big{margin-right:4px;font-size:16px;font-weight:700;color:#fff}

.sov-tax{display:flex;align-items:center;gap:8px;margin:2px 0 6px;padding:6px 8px;
  background:#262626;border-radius:6px}
.sov-panel .sov-tax-label{font-weight:600}
.sov-panel .sov-tax input[type=range]{flex:1;min-width:0;margin:0}
.sov-panel .sov-tax output{min-width:36px;text-align:right;font-size:15px;font-weight:700;
  color:var(--blue);font-variant-numeric:tabular-nums}
.sov-panel table.sov-balance{margin:4px 0}
.sov-panel .sov-balance th,.sov-panel .sov-balance td{padding:3px 3px}
.sov-panel .sov-balance td{font-variant-numeric:tabular-nums}
.sov-panel .sov-balance td.sov-use{width:46%;text-align:left}
.sov-panel .sov-balance .sov-use-txt{display:block;font-size:9px;color:#777;line-height:1.2}
.sov-bar{position:relative;height:6px;margin-top:2px;border-radius:3px;background:#2e2e2e;overflow:hidden}
.sov-bar>i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:#4a8a5c}
.sov-bar.sov-bar-full>i{background:#c9923e}
.sov-bar.sov-bar-over>i{background:var(--red)}
.sov-mil{margin:6px 0;padding:5px 8px;background:#221d15;border-left:3px solid #a83;border-radius:0 4px 4px 0}
.sov-panel .sov-mil .sov-mil-bonus{font-size:17px;font-weight:700;color:var(--amber);
  font-variant-numeric:tabular-nums}
.sov-panel .sov-mil .sov-mil-what{color:var(--amber)}
.sov-mil .sov-hint{display:block;margin:1px 0 0}
.sov-desc{display:block;font-size:9px;line-height:1.15;opacity:.85;word-break:break-word}

/* The claim grid. Selectors are qualified to outrank the panel's own table and
   td rules. */
.sov-grid-wrap{overflow-x:auto;margin:6px 0}
.sov-panel table.sov-grid{width:auto;border-collapse:separate;border-spacing:2px}
.sov-panel .sov-grid th{padding:0 2px;border:0;text-align:center;font-size:10px;font-weight:400;
  color:#777;font-variant-numeric:tabular-nums}
.sov-panel .sov-grid td{width:46px;height:38px;padding:1px;border:1px solid #303030;
  border-radius:3px;text-align:center;vertical-align:middle;background:#1e1e1e}
.sov-grid img{width:12px;height:12px;vertical-align:-2px;image-rendering:pixelated}
.sov-lv{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;color:#8a8a8a}
.sov-cv{display:block;font-size:11px;font-variant-numeric:tabular-nums}
.sov-panel .sov-grid .sov-cell-town{background:#243;border-color:var(--blue)}
.sov-grid .sov-cell-town .sov-lv{color:var(--blue)}
.sov-panel .sov-grid .sov-cell-food{background:#1d2a1d;border-color:#3a5}
.sov-grid .sov-cell-food .sov-lv{color:var(--accent-text)}
.sov-panel .sov-grid .sov-cell-mil{background:#2a241a;border-color:#a83}
.sov-grid .sov-cell-mil .sov-lv{color:var(--amber)}
.sov-grid .sov-cell-free .sov-cv{color:#7d7d7d}
.sov-panel .sov-grid .sov-cell-water{background:#16202a;border-color:#2a3a4a}
.sov-panel .sov-grid .sov-cell-kept{background:#1b2430;border-color:#4a6a8a}
.sov-grid .sov-cell-kept .sov-lv{color:#8ab}
.sov-grid .sov-cell-kept .sov-cv{color:#7d8fa0}
.sov-panel .sov-grid .sov-cell-out{background:#2b1a1a;border-color:#8a3a3a}
.sov-grid .sov-cell-out .sov-x{color:#e55}
.sov-panel .sov-grid .sov-cell-none{background:#161616;border-color:#252525}
.sov-grid .sov-cell-none .sov-x{color:#3f3f3f}
.sov-x{display:block;font-size:13px;line-height:1.3}
.sov-grid .sov-pick{cursor:pointer}
.sov-grid .sov-pick:hover{outline:1px solid var(--blue)}
.sov-keys{display:flex;flex-wrap:wrap;gap:3px 10px;margin:2px 0}
.sov-keys>span{display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#b5b5b5}
.sov-sw{display:inline-block;box-sizing:border-box;width:11px;height:11px;border:1px solid;
  border-radius:2px;font-size:9px;line-height:9px;text-align:center}
.sov-sw.sov-sw-food{background:#1d2a1d;border-color:#3a5}
.sov-sw.sov-sw-mil{background:#2a241a;border-color:#a83}
.sov-sw.sov-sw-kept{background:#1b2430;border-color:#4a6a8a}
.sov-sw.sov-sw-free{background:#1e1e1e;border-color:#3a3a3a}
.sov-sw.sov-sw-out{background:#2b1a1a;border-color:#8a3a3a;color:#e55}
/* Any display rule above beats the browser's own [hidden], so this one comes last. */
.sov-panel [hidden]{display:none}
`;
  var PANEL_POSITION_KEY = "illyriad-sov-scanner.panel-position";
  var PANEL_COLLAPSED_KEY = "illyriad-sov-scanner.panel-collapsed";
  var WORLD_MAP_HASH = "#/World/Map";
  function isWorldMapHash(hash) {
    return String(hash ?? "").startsWith(WORLD_MAP_HASH);
  }
  function centredView(x, y, zoom, radius) {
    return { x, y, zoom: Math.max(zoom, radius) };
  }
  function mapHash(view) {
    return `${WORLD_MAP_HASH}/${view.x}/${view.y}/${view.zoom}`;
  }
  function clampPanelPosition(x, y, panelWidth, panelHeight, viewportWidth, viewportHeight) {
    const maxX = Math.max(0, viewportWidth - panelWidth);
    const maxY = Math.max(0, viewportHeight - panelHeight);
    return {
      x: Math.min(maxX, Math.max(0, Number.isFinite(x) ? x : 0)),
      y: Math.min(maxY, Math.max(0, Number.isFinite(y) ? y : 0))
    };
  }
  function loadPanelPosition() {
    try {
      const raw = globalThis.localStorage?.getItem(PANEL_POSITION_KEY);
      if (!raw) return null;
      const position = JSON.parse(raw);
      return Number.isFinite(position?.x) && Number.isFinite(position?.y) ? position : null;
    } catch {
      return null;
    }
  }
  function savePanelPosition(position) {
    try {
      globalThis.localStorage?.setItem(PANEL_POSITION_KEY, JSON.stringify(position));
    } catch {
    }
  }
  var OPEN_SECTIONS_KEY = "illyriad-sov-scanner.open-sections";
  function loadOpenSections() {
    try {
      const names = JSON.parse(globalThis.localStorage?.getItem(OPEN_SECTIONS_KEY) ?? "[]");
      return Array.isArray(names) ? names : [];
    } catch {
      return [];
    }
  }
  function saveOpenSections(names) {
    try {
      globalThis.localStorage?.setItem(OPEN_SECTIONS_KEY, JSON.stringify(names));
    } catch {
    }
  }
  function loadPanelCollapsed() {
    try {
      return globalThis.localStorage?.getItem(PANEL_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  }
  function savePanelCollapsed(collapsed) {
    try {
      globalThis.localStorage?.setItem(PANEL_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
    }
  }
  function productionLabel(key) {
    const icon = PRODUCTION_ICONS[key];
    return `${icon ? `<img class="sov-ico" src="${icon}" alt="">` : ""}${PRODUCTION_LABEL[key] ?? key}`;
  }
  function clampNumber(raw, { min = -Infinity, max = Infinity, integer = false, fallback = 0 } = {}) {
    const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
    if (String(raw ?? "").trim() === "" || !Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, integer ? Math.round(n) : n));
  }
  function validatePlots(raw) {
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
      message: diff === 0 ? "" : diff > 0 ? `${diff} over` : `${-diff} short`
    };
  }
  function parseMilsovStructure(raw) {
    const key = String(raw ?? "").trim();
    return MILSOV_STRUCTURES.some((s) => s.key === key) ? key : null;
  }
  function milsovSplitText(plan) {
    const counts = /* @__PURE__ */ new Map();
    for (const m of plan.milsov) counts.set(m.buildingLevel, (counts.get(m.buildingLevel) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[0] - a[0]).map(([level, n]) => `${n}\xD7 Sov ${SOV_LEVEL_ROMAN[level - 1]}`).join(" + ");
  }
  function upkeepLimitHtml(plan) {
    if (plan?.resImpossible) {
      return `<p class="sov-flag">The settle allocation has no ${plan.resBinding} plots, so this
        upkeep cannot be paid at any tax.</p>`;
    }
    if (!Number.isFinite(plan?.resCeiling) || !(plan.resCeiling < plan.tMax)) return "";
    return `<p class="sov-hint">Upkeep limit: ${plan.resCeiling.toFixed(1)}% tax \u2014 above that, ${plan.resBinding} production no longer covers it.</p>`;
  }
  function milsovPlanHtml(plan) {
    if (!plan?.milsov?.length) return "";
    return `<p class="sov-mil"><b class="sov-mil-bonus">+${plan.milsovBonus}%</b>
    <span class="sov-mil-what">military unit production</span>
    <span class="sov-hint">${escapeHtml(milsovSplitText(plan))}, upkeep ${(plan.milsovUpkeep ?? 0).toLocaleString("en-GB")}/hr of wood, clay, iron and stone.</span></p>`;
  }
  var MILSOV_BLOCKED_TEXT = {
    tiles: "every claimable tile went to the food plan",
    water: "every tile the food plan left over is water, which takes no Production Structure",
    slots: "the food plan used every building slot",
    upkeep: "the city produces too little wood, clay, iron or stone to run one",
    rp: "the food plan spent the research this site produces"
  };
  function surplusRows(surplus, binding) {
    if (!surplus) return [];
    const rows = [
      { key: "food", icon: "food", label: PRODUCTION_LABEL.food },
      { key: "rp", icon: "research", label: PRODUCTION_LABEL.research },
      { key: "gold", icon: "gold", label: PRODUCTION_LABEL.gold },
      ...BASIC_RESOURCES.map((res) => ({
        key: res,
        icon: res,
        label: PRODUCTION_LABEL[res],
        basic: true
      }))
    ];
    return rows.map((r) => {
      const value = surplus[r.key] ?? 0;
      const base = surplus.base?.[r.key];
      const notes = [];
      if (binding === r.key || binding === "res" && r.basic && Math.abs(value) < 0.5) {
        notes.push("binds");
      }
      if (value < 0) notes.push("deficit");
      if (r.basic && surplus.indicative) notes.push("indicative");
      return {
        ...r,
        value,
        base,
        spent: Number.isFinite(base) ? base - value : void 0,
        note: notes.join(", ")
      };
    });
  }
  function resFlag(r) {
    if (!r?.resIndicative) return null;
    const caveat = "Indicative only \u2014 per-plot yields for wood, clay, iron and stone are unmeasured, so this figure does not affect the ranking.";
    if (r.resImpossible) {
      return {
        text: `no ${r.resBinding} plots`,
        title: `The settle allocation has no ${r.resBinding} plots, so the sovereignty upkeep cannot be paid at any tax rate. ${caveat}`
      };
    }
    if (!(r.resCeiling < r.tMax - 1e-9)) return null;
    return {
      text: `${r.resBinding} ${r.resCeiling.toFixed(1)}%`,
      title: `Sovereignty upkeep exhausts ${r.resBinding} above ${r.resCeiling.toFixed(1)}% tax, below this site's ceiling of ${r.tMax.toFixed(1)}%. ${caveat}`
    };
  }
  function parseRpCalibration(observed, atTax, prestige) {
    const rp = clampNumber(observed, { min: 0, fallback: 0 });
    if (rp <= 0) return null;
    return {
      observedRpPerHour: rp,
      atTax: clampNumber(atTax, { min: 0, max: 100, fallback: 0 }),
      prestige: !!prestige
    };
  }
  function parseResourceBoosters(raw) {
    const out = {};
    for (const res of BASIC_RESOURCES) out[res] = !!raw?.[res];
    return out;
  }
  function parseUpkeepBuildings(raw) {
    const out = {};
    for (const b of UPKEEP_BUILDINGS) {
      out[b.key] = clampNumber(raw?.[b.key], { min: 0, max: 99, integer: true, fallback: 0 });
    }
    return out;
  }
  function parseResourceMinimums(raw) {
    const out = {};
    for (const key of MINIMUM_KEYS) {
      out[key] = clampNumber(raw?.[key], { min: 0, max: 1e7, integer: true, fallback: 0 });
    }
    return out;
  }
  function parsePrestige(raw) {
    const out = {};
    for (const key of PRESTIGE_KEYS) out[key] = !!raw?.[key];
    return out;
  }
  function parseSiteTerrains(raw) {
    const ticked = Array.isArray(raw) ? raw : [];
    return SETTLE_TERRAINS.filter((t) => ticked.includes(t));
  }
  var SETTINGS_FIELDS = [
    { key: "plots", group: "Settle Tile", label: "Settle Plot Allocation", type: "plots" },
    {
      key: "cityConsumption",
      group: "City Food",
      label: "Food Consumed per Hour",
      type: "number",
      min: 1,
      max: 1e6,
      integer: true,
      fallback: DEFAULT_CITY_CONSUMPTION
    },
    { key: "naturesBounty", group: "City Food", label: "Nature's Bounty", type: "checkbox" },
    {
      key: "geomancerRetreats",
      group: "City Food",
      label: "Geomancer Retreats",
      type: "select",
      parse: "number",
      options: NATURES_BOUNTY_BY_RETREATS.map((bonus, n) => ({ value: n, label: `${n} (+${bonus}%)` })),
      enabledWhen: (s) => !!s.naturesBounty
    },
    { key: "cityCount", group: "City Food", label: "Number of Cities", type: "number", min: 1, max: 999, integer: true, fallback: 1 },
    { key: "isCapital", group: "City Food", label: "This City is the Capital", type: "checkbox" },
    // Both are flat additions the research reading contains, so it does not
    // override them.
    {
      key: "allembine",
      group: "Research",
      label: "Allembine Research (+100/hr)",
      type: "checkbox"
    },
    {
      key: "overflowingInsight",
      group: "Research",
      label: "Overflowing Insight (+506.5/hr)",
      type: "checkbox"
    },
    {
      key: "rpCalibration",
      group: "Research",
      label: "Measured Research Output",
      type: "calibration"
    },
    // Drawn as one table, a row per production. The Flour Mill is food's booster.
    {
      key: "resourceBoosters",
      group: "Production",
      label: "Booster Buildings at Level 20",
      type: "boosters"
    },
    {
      key: "flourMill",
      group: "Production",
      label: `Flour Mill at Level 20 (+${FLOUR_MILL_L20}%)`,
      type: "checkbox"
    },
    {
      key: "prestige",
      group: "Production",
      label: "Prestige Production Boost",
      type: "prestige"
    },
    {
      key: "resourceMinimums",
      group: "Production",
      label: "Minimum Surplus per Hour",
      type: "minimums"
    },
    {
      key: "upkeepBuildings",
      group: "City Buildings",
      label: "How many of each at level 20",
      type: "upkeepBuildings"
    },
    { key: "rClaim", group: "Sovereignty", label: "Claim Radius", type: "number", min: 1, max: 6, integer: true, fallback: 2 },
    { key: "maxBuildings", group: "Sovereignty", label: "Maximum Buildings", type: "number", min: 0, max: 200, integer: true, fallback: 20 },
    { key: "milsovStructure", group: "Sovereignty", label: "Military Structure", type: "milsov" },
    {
      key: "milsovMinBonus",
      group: "Sovereignty",
      label: "Minimum Military Bonus (%)",
      type: "number",
      min: 0,
      max: 1e3,
      integer: true,
      fallback: 0,
      enabledWhen: (s) => !!s.milsovStructure
    },
    { key: "tMin", group: "Site Filters", label: "Minimum Tax (%)", type: "number", min: 0, max: 100 },
    { key: "dOther", group: "Site Filters", label: "Minimum Distance to Other Players", type: "number", min: 0, max: 100 },
    { key: "dOwn", group: "Site Filters", label: "Minimum Distance to Your Cities", type: "number", min: 0, max: 100 },
    { key: "dAlliance", group: "Site Filters", label: "Minimum Distance to Alliance Towns", type: "number", min: 0, max: 100 },
    {
      key: "ownClaimsAvailable",
      group: "Site Filters",
      label: "Treat Your Own Claims as Available",
      type: "checkbox",
      hint: "On: tiles you already claim count as free ground, as if you gave them up. Off: they are off limits, except to the town that holds them."
    },
    {
      key: "siteTerrains",
      group: "Site Filters",
      label: "Terrain",
      type: "terrains",
      hint: "List only sites on the ticked terrain. With none ticked, every terrain is listed."
    },
    {
      key: "autoMinimizeOffMap",
      group: "Display",
      label: "Minimise when off the World Map",
      type: "checkbox",
      menu: true,
      hint: "Folds the panel to its icon on any page but the World Map, the only one with map data."
    },
    {
      key: "mapOverlay",
      group: "Display",
      label: "Mark sites on the World Map",
      type: "checkbox",
      menu: true,
      hint: "After a Scan, numbers the top ten on the map and outlines the selected row\u2019s tile; after Optimise, draws the plan. It draws on the game\u2019s own map, so it depends on that map\u2019s layout."
    }
  ];
  function attr(name, v) {
    return v === void 0 || v === null ? "" : ` ${name}="${escapeHtml(v)}"`;
  }
  function fieldRowHtml({ id, label, control, row = "" }) {
    return `<div class="sov-f"${row}><label for="${id}">${label}</label>
    ${control}</div>`;
  }
  function checkboxRowHtml({ id, label, checked, hooks = "", row = "" }) {
    return fieldRowHtml({
      id,
      label,
      row,
      control: `<input type="checkbox"${hooks} id="${id}"${checked ? " checked" : ""}>`
    });
  }
  function numberFieldHtml(f, value) {
    const id = `sov-in-${f.key}`;
    return fieldRowHtml({
      id,
      label: escapeHtml(f.label),
      row: ` data-key="${f.key}"`,
      control: `<input type="number" data-key="${f.key}"${attr("min", f.min)}${attr("max", f.max)}
      step="${f.integer ? 1 : "any"}"${attr("value", value)} id="${id}">`
    });
  }
  function selectFieldHtml(f, value) {
    const id = `sov-in-${f.key}`;
    const opts = f.options.map((o) => `<option value="${escapeHtml(o.value)}"${String(o.value) === String(value) ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("");
    return fieldRowHtml({
      id,
      label: escapeHtml(f.label),
      row: ` data-key="${f.key}"`,
      control: `<select data-key="${f.key}" id="${id}">${opts}</select>`
    });
  }
  function checkboxFieldHtml(f, value) {
    return checkboxRowHtml({
      id: `sov-cb-${f.key}`,
      label: escapeHtml(f.label),
      checked: value,
      hooks: ` data-key="${f.key}"`,
      row: ` data-key="${f.key}"${attr("title", f.hint)}`
    });
  }
  var PLOTS_TITLE = `How the settle tile's ${PLOT_TOTAL} plots are split. Terraforming applies to the settle tile only.`;
  function plotInputsHtml(hook, idPrefix, plots) {
    const fields = PLOT_KEYS.map((p) => {
      const id = `${idPrefix}-${p}`;
      return `<div class="sov-plot"><label for="${id}">${productionLabel(p)}</label>
      <input type="number" ${hook}="${p}" min="0" max="${PLOT_TOTAL}"
        step="1" value="${plots?.[p] ?? 0}" id="${id}"></div>`;
    }).join("");
    return `<div class="sov-plot-fields">${fields}</div>`;
  }
  function plotBarHtml(plots) {
    const cells = PLOT_KEYS.flatMap((p) => Array(plots?.[p] ?? 0).fill(p)).map((p, i) => `<i class="sov-p-${i < PLOT_TOTAL ? p : "over"}"></i>`);
    while (cells.length < PLOT_TOTAL) cells.push("<i></i>");
    return cells.join("");
  }
  function plotsFieldHtml(f, plots) {
    return `<div class="sov-f-block" data-key="${f.key}" title="${PLOTS_TITLE}">
      ${plotInputsHtml("data-plot", "sov-in-plot", plots)}
      <div class="sov-plotbar"></div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from Selected Tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
  }
  function calibrationFieldHtml(f, cal) {
    return `<fieldset class="sov-f-block sov-override" data-key="${f.key}"
      title="Your city's research per hour as the game shows it, and the tax it was read at. Replaces the Library's own output. Leave the two tick-boxes above as your city has them: their bonuses are taken out of the reading.">
      <legend>Override \u2014 ${escapeHtml(f.label)}</legend>
      ${fieldRowHtml({
      id: "sov-in-cal-observedRpPerHour",
      label: "Observed research per hour",
      control: `<input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr("value", cal?.observedRpPerHour)} id="sov-in-cal-observedRpPerHour">`
    })}
      ${fieldRowHtml({
      id: "sov-in-cal-atTax",
      label: "\u2026at this tax rate (%)",
      control: `<input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}" id="sov-in-cal-atTax">`
    })}
      ${checkboxRowHtml({
      id: "sov-cb-cal-prestige",
      label: "\u2026with the Prestige boost running",
      checked: cal?.prestige,
      hooks: ' data-cal="prestige"'
    })}
      <p class="sov-hint sov-rp-read"></p>
    </fieldset>`;
  }
  function upkeepBuildingsFieldHtml(f, buildings) {
    const rows = UPKEEP_BUILDINGS.map((b, i) => {
      const id = `sov-in-upkeep-${b.key}`;
      const uses = Object.entries(b.consumes);
      const usesTitle = `Consumes ${uses.map(([res, n]) => `${count(n)} ${PRODUCTION_LABEL[res].toLowerCase()}`).join(", ")} an hour`;
      const icons = uses.map(([res]) => `<img src="${PRODUCTION_ICONS[res]}" alt="">`).join("");
      const heading = b.group !== UPKEEP_BUILDINGS[i - 1]?.group ? `<p class="sov-upkeep-group"><img src="${UPKEEP_GROUP_ICONS[b.group]}" alt="">${escapeHtml(b.group)}</p>` : "";
      return heading + fieldRowHtml({
        id,
        label: escapeHtml(b.name),
        row: ` data-upkeep-row="${b.key}"${attr("title", b.hint)}`,
        control: `<span class="sov-uses" title="${usesTitle}">${icons}</span>
        <input type="number" data-upkeep="${b.key}" min="0" step="1"
        value="${buildings?.[b.key] ?? 0}" id="${id}">`
      });
    }).join("");
    return `<div class="sov-f-block" data-key="${f.key}"
      title="Each copy consumes the same every hour as the first. That comes off production before sovereignty is paid for, so the plan never spends what these buildings need.">
      ${rows}
    </div>`;
  }
  function productionMatrixHtml(settings2) {
    const { resourceBoosters: boosters, prestige, resourceMinimums: minimums } = settings2;
    const rows = MINIMUM_KEYS.map((key) => {
      const name = PRODUCTION_LABEL[key];
      const boosterBox = (hook, building, bonus, on) => `<input type="checkbox" ${hook}${on ? " checked" : ""} aria-label="${building}" title="${building} (+${bonus}% ${name})">`;
      let booster = '<span class="sov-none">\u2014</span>';
      if (BASIC_RESOURCES.includes(key)) {
        booster = boosterBox(
          `data-booster="${key}"`,
          RESOURCE_BOOSTERS[key],
          RESOURCE_BOOSTER_BONUS,
          boosters?.[key]
        );
      } else if (key === "food") {
        booster = boosterBox('data-key="flourMill"', "Flour Mill", FLOUR_MILL_L20, settings2.flourMill);
      }
      return `<tr><td>${productionLabel(key)}</td><td>${booster}</td>
      <td><input type="checkbox" data-prestige="${key}"${prestige?.[key] ? " checked" : ""}
        aria-label="Prestige on ${name}"></td>
      <td><input type="number" data-minimum="${key}" min="0" step="1"
        value="${minimums?.[key] ?? 0}" aria-label="Keep at least this much ${name} per hour"></td></tr>`;
    }).join("");
    return `<table class="sov-matrix"><thead><tr><th></th>
      <th data-key="resourceBoosters" title="A booster building at level 20 \u2014 the Flour Mill, for food \u2014 adds ${RESOURCE_BOOSTER_BONUS}% to its production: ${RESOURCE_BOOSTER_BONUS} points of tax headroom against its ceiling.">Booster +${RESOURCE_BOOSTER_BONUS}%</th>
      <th data-key="prestige" title="The prestige boost adds ${PRESTIGE_PRODUCTION_BONUS}% to each production it runs on: ${PRESTIGE_PRODUCTION_BONUS} points of tax headroom. Tick only what it is running on.">Prestige +${PRESTIGE_PRODUCTION_BONUS}%</th>
      <th data-key="resourceMinimums" title="How much of each must still be free once the plan is paid for: resources after upkeep, food after the town eats, research after the claims. Zero spends it all, leaving nothing to build, grow or trade with.">Keep per hour</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
  }
  function milsovFieldHtml(f, structure) {
    const opts = MILSOV_STRUCTURES.map((s) => `<option value="${s.key}"${s.key === structure ? " selected" : ""}>${escapeHtml(s.name)}</option>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      ${fieldRowHtml({
      id: `sov-in-${f.key}`,
      label: escapeHtml(f.label),
      control: `<select data-key="${f.key}" id="sov-in-${f.key}"
          title="Which structure to place on the tiles the food plan leaves free. It only uses what food leaves over, so it never costs the site tax.">
          <option value=""${structure ? "" : " selected"}>None \u2014 food only</option>${opts}</select>`
    })}
    </div>`;
  }
  function terrainsFieldHtml(f, terrains, hook, idPrefix) {
    const rows = SETTLE_TERRAINS.map((t) => checkboxRowHtml({
      id: `${idPrefix}-${t.replaceAll(" ", "-")}`,
      label: escapeHtml(t),
      checked: terrains?.includes(t),
      hooks: ` ${hook}="${t}"`
    })).join("");
    return `<div class="sov-f-block" data-key="${f.key}"${attr("title", f.hint)}>
      <p class="sov-f-head">${escapeHtml(f.label)}</p>
      <div class="sov-terrains">${rows}</div>
    </div>`;
  }
  function mirrorFieldHtml(f, tab) {
    const id = `${f.type === "checkbox" ? "sov-cb" : "sov-in"}-${tab}-${f.key}`;
    const control = f.type === "checkbox" ? `<input type="checkbox" data-mirror-key="${f.key}" id="${id}">` : `<input type="number" data-mirror-key="${f.key}"${attr("min", f.min)}${attr("max", f.max)}
      step="${f.integer ? 1 : "any"}" id="${id}">`;
    return fieldRowHtml({ id, label: escapeHtml(f.label), control, row: attr("title", f.hint) });
  }
  function fieldHtml(f, settings2) {
    const v = settings2[f.key];
    switch (f.type) {
      case "checkbox":
        return checkboxFieldHtml(f, v);
      case "select":
        return selectFieldHtml(f, v);
      case "plots":
        return plotsFieldHtml(f, v);
      case "calibration":
        return calibrationFieldHtml(f, v);
      case "upkeepBuildings":
        return upkeepBuildingsFieldHtml(f, v);
      case "milsov":
        return milsovFieldHtml(f, v);
      case "terrains":
        return terrainsFieldHtml(f, v, "data-terrain", "sov-cb-terrain");
      default:
        return numberFieldHtml(f, v ?? f.fallback);
    }
  }
  var SECTION_ICONS = {
    "Settle Tile": [ICONS.caravan],
    "City Food": [ICONS.food],
    Research: [ICONS.research],
    Production: BASIC_RESOURCES.map((res) => ICONS[res]),
    "City Buildings": [ICONS.troops, ICONS.mana],
    Sovereignty: [ICONS.sovereignty],
    "Site Filters": [ICONS.diplomacy]
  };
  function sectionHtml({ name, icons, sum, body }) {
    return `<details class="sov-sec" data-sec="${escapeHtml(name)}"><summary>
      <span class="sov-sec-ico">${icons.map((src) => `<img src="${src}" alt="">`).join("")}</span>
      <span class="sov-sec-name">${escapeHtml(name)}</span>
      <span class="sov-sum" data-sum="${escapeHtml(sum)}"></span>
      <span class="sov-chev">${GLYPHS.chevron}</span>
    </summary><div class="sov-sec-body">${body}</div></details>`;
  }
  function researchInUse(s) {
    return researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, "research"), tax: 0 });
  }
  function sectionSummaryHtml(name, s) {
    const plural = (n, one) => `${n} ${one}${n === 1 ? "" : "s"}`;
    switch (name) {
      case "Settle Tile": {
        const r = validatePlots(s.plots);
        return PLOT_KEYS.map((p) => `<img src="${PRODUCTION_ICONS[p]}" alt="">${r.plots[p]}`).join("") + (r.ok ? "" : ` <b class="sov-bad">${r.message}</b>`);
      }
      case "City Food": {
        const b = computeBOther(s);
        return `${b >= 0 ? "+" : ""}${b}% \xB7 eats ${count(s.cityConsumption)}/hr`;
      }
      case "Research":
        return `${count(Math.round(researchInUse(s)))}/hr${s.rpCalibration ? " \xB7 measured" : ""}`;
      case "Production": {
        const on = (o) => Object.values(o ?? {}).filter(Boolean).length;
        const [prestige, minimums] = [s.prestige, s.resourceMinimums].map(on);
        const boosters = on(s.resourceBoosters) + (s.flourMill ? 1 : 0);
        return [
          boosters && plural(boosters, "booster"),
          prestige && `prestige \xD7${prestige}`,
          minimums && plural(minimums, "minimum")
        ].filter(Boolean).join(" \xB7 ") || "none set";
      }
      case "City Buildings": {
        const n = Object.values(s.upkeepBuildings ?? {}).reduce((a, v) => a + v, 0);
        return n ? plural(n, "building") : "none";
      }
      case "Sovereignty": {
        const structure = MILSOV_STRUCTURES.find((m) => m.key === s.milsovStructure);
        return `radius ${s.rClaim} \xB7 ${escapeHtml(structure?.name ?? "food only")}`;
      }
      case "Site Filters": {
        const terrains = s.siteTerrains ?? [];
        return [
          `tax \u2265 ${s.tMin}%`,
          `apart ${s.dOther}/${s.dOwn}/${s.dAlliance}`,
          terrains.length > 1 ? `${terrains.length} terrains` : terrains[0]
        ].filter(Boolean).join(" \xB7 ");
      }
      default:
        return "";
    }
  }
  function settingsFormHtml(settings2) {
    const groups = [];
    for (const f of SETTINGS_FIELDS) {
      if (f.menu) continue;
      if (!groups.length || groups.at(-1).name !== f.group) groups.push({ name: f.group, fields: [] });
      groups.at(-1).fields.push(f);
    }
    const body = groups.map((g) => {
      const fields = g.name === "Production" ? productionMatrixHtml(settings2) : g.fields.map((f) => fieldHtml(f, settings2)).join("");
      const extra = g.fields.some((f) => f.key === "isCapital") ? '<div class="sov-derived"></div><p class="sov-derived-food"></p>' : "";
      return sectionHtml({
        name: g.name,
        icons: SECTION_ICONS[g.name] ?? [],
        sum: g.name,
        body: fields + extra
      });
    }).join("");
    return `<form class="sov-form" autocomplete="off">
      ${body}
      <div class="sov-form-foot"><button type="button" class="sov-reset sec">Reset to Defaults</button>
        <span class="sov-hint">Saved in this browser as you edit.</span></div>
      <p class="sov-hint sov-store-note"></p>
    </form>`;
  }
  function settingsMenuHtml(settings2) {
    const fields = SETTINGS_FIELDS.filter((f) => f.menu);
    const rows = fields.map((f) => fieldHtml(f, settings2)).join("");
    return `<h3>Settings</h3><form class="sov-menu-form" autocomplete="off">${rows}</form>`;
  }
  function changelogHtml(entries) {
    const versions = entries.map((v) => {
      const date = v.date ? `<span class="sov-changelog-date">${escapeHtml(v.date)}</span>` : "";
      const changes = v.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
      return `<h4>${escapeHtml(v.version)}${date}</h4><ul>${changes}</ul>`;
    }).join("");
    return `<h3>Changelog</h3><div class="sov-changelog-body">${versions}</div>`;
  }
  function focusRadiusTitle(rClaim) {
    return `How far out sovereignty may be placed. Blank follows City Configuration, currently ${rClaim}.`;
  }
  function focusFormHtml(focus, settings2) {
    const f = { ...DEFAULT_FOCUS, ...focus };
    const rClaim = Math.round(settings2?.rClaim ?? 2);
    return `<form class="sov-focus-form" autocomplete="off">
      <div class="sov-card">
        ${fieldRowHtml({
      id: "sov-in-town-pick",
      label: "One of Your Towns",
      control: '<select class="sov-town-pick" id="sov-in-town-pick"><option value="">\u2014</option></select>',
      row: ' title="Fills the coordinates from a town of yours on the map."'
    })}
        <div class="sov-f"><span>Coordinates</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x" aria-label="x"${attr("value", f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y" aria-label="y"${attr("value", f.y)}>
            <span class="sov-or sov-map-only">or</span>
            <button type="button" class="sov-map-pick sov-map-only sec"
              title="Then click a tile on the World Map to fill these in and optimise it.">Pick on map</button>
          </span></div>
        ${fieldRowHtml({
      id: "sov-in-focus-radius",
      label: "Sovereignty Radius",
      control: `<input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr("value", f.radius)} id="sov-in-focus-radius">`,
      row: ` data-radius-row title="${focusRadiusTitle(rClaim)}"`
    })}
        ${fieldRowHtml({
      id: "sov-in-focus-tax",
      label: "Starting Tax (%)",
      control: `<input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="1"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}" id="sov-in-focus-tax">`
    })}
        ${checkboxRowHtml({
      id: "sov-cb-focus-preserveSovereignty",
      label: "Preserve Existing Sovereignty",
      checked: f.preserveSovereignty,
      hooks: ' data-focus="preserveSovereignty"',
      row: ' title="On: the town on this tile keeps the claims it holds, and the plan pays only to raise them. Off: they are laid out afresh at full price."'
    })}
      </div>
      ${sectionHtml({
      name: "City Configuration",
      icons: SECTION_ICONS["Settle Tile"],
      sum: "Settle Tile",
      body: `${checkboxRowHtml({
        id: "sov-cb-focus-useConfiguredPlots",
        label: "Use the Plot Allocation from City Configuration",
        checked: f.useConfiguredPlots,
        hooks: ' data-focus="useConfiguredPlots"',
        row: ` title="On: plan on the allocation below, the tile as you will terraform it. Off: plan on the tile's ratings as they are today."`
      })}
        <div class="sov-f-block" title="${PLOTS_TITLE}">
          ${plotInputsHtml("data-mirror-plot", "sov-in-focus-plot", settings2?.plots)}
          <div class="sov-plotbar"></div>
          <div class="sov-plot-sum"><span class="sov-plot-total"></span></div>
        </div>
        ${mirrorFieldHtml(SETTINGS_FIELDS.find((s) => s.key === "ownClaimsAvailable"), "focus")}
        <p class="sov-hint">These are City Configuration's own, as is everything else the plan uses.</p>`
    })}
      <div class="sov-run"><button type="button" class="sov-focus-run">${GLYPHS.target}Optimise</button></div>
    </form>
    <p class="sov-legend sov-map-note"></p>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
  }
  function scanFormHtml() {
    const body = SETTINGS_FIELDS.filter((f) => f.group === "Site Filters").map((f) => f.type === "terrains" ? terrainsFieldHtml(f, [], "data-mirror-terrain", "sov-cb-scan-terrain") : mirrorFieldHtml(f, "scan")).join("");
    return `<form class="sov-scan-form" autocomplete="off">${sectionHtml({
      name: "Site Filters",
      icons: SECTION_ICONS["Site Filters"],
      sum: "Site Filters",
      body: `${body}<p class="sov-hint">These are City Configuration's own; change them in either place.</p>`
    })}</form>`;
  }
  function ownTowns(payload) {
    const seen = /* @__PURE__ */ new Map();
    for (const t of extractTowns(payload)) {
      if (!t.own || !Number.isFinite(t.x) || !Number.isFinite(t.y)) continue;
      if (!payload.data?.[tileKey(t.y, t.x)]) continue;
      const at = `${t.x}|${t.y}`;
      if (!seen.has(at)) seen.set(at, { x: t.x, y: t.y, label: t.name ? `${t.name} (${at})` : at });
    }
    return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
  }
  function capitalDerivedHtml(s) {
    return [
      ["Famine Management", FAMINE_MANAGEMENT, 10],
      ["Soil Enrichment", SOIL_ENRICHMENT, 30]
    ].map(([name, bonus, need]) => {
      const active = s.isCapital && (s.cityCount ?? 1) >= need;
      const why = !s.isCapital ? "capital only" : `needs ${need} cities`;
      return `<span class="sov-chip ${active ? "sov-on" : "sov-off"}" title="${active ? "Active" : `Inactive: ${why}`}">${name} +${bonus}%</span>`;
    }).join("");
  }
  var ABOUT_TIP = "Unofficial fan tool. Illyriad, its game data and the game\u2019s icon art are the intellectual property of Illyriad Games Limited \u2014 click for the licence and full copyright notice.";
  function tipPosition(rect, size, view, gap = 6) {
    const centred = rect.left + rect.width / 2 - size.width / 2;
    const left = Math.max(gap, Math.min(centred, view.width - size.width - gap));
    const below = rect.bottom + gap;
    const top = below + size.height + gap <= view.height ? below : Math.max(gap, rect.top - gap - size.height);
    return { left, top };
  }
  function createPanel({
    onScan,
    initialSettings,
    onSettingsChange,
    getPayload,
    whenViewLoaded: whenViewLoaded2,
    onSelect,
    onPaneShown,
    onFocusPlan,
    onPickOnMap
  }) {
    const host = document.createElement("sov-scanner");
    host.style.setProperty("all", "initial", "important");
    const shadow = host.attachShadow({ mode: "open" });
    document.body.appendChild(host);
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);
    const root = document.createElement("div");
    root.className = "sov-panel";
    const opening = initialSettings ?? DEFAULT_SETTINGS;
    root.innerHTML = `
    <h2 title="Sovereignty Site Scanner \u2014 drag to move, click to collapse"><span
        class="sov-h2-inner">${APP_ICON_SVG}<span
        class="sov-title">Sovereignty Site Scanner <span class="sov-build"></span></span><span
      class="sov-h2-actions"><span class="sov-changelog" role="button" tabindex="0"
      title="Changelog" aria-label="Changelog" aria-expanded="false">${GLYPHS.changelog}</span><span
      class="sov-gear" role="button" tabindex="0"
      title="Settings" aria-label="Settings" aria-expanded="false">\u2699</span><a class="sov-about"
      href="https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/blob/main/LICENSE"
      target="_blank" rel="noopener" title="${ABOUT_TIP}">\u24D8</a></span></span></h2>
    <nav class="sov-tabs">
      <button type="button" data-tab="scan" class="on">${GLYPHS.search}Site Search</button>
      <button type="button" data-tab="focus">${GLYPHS.target}Optimal Sovereignty</button>
      <button type="button" data-tab="config">${GLYPHS.city}City Configuration</button>
    </nav>
    <div class="sov-body">
      <section data-pane="scan">
        ${scanFormHtml()}
        <div class="sov-toolbar"><button class="sov-scan"
            title="Rank every tile on screen you could settle">${GLYPHS.search}Scan</button></div>
        <div class="sov-status"></div>
        <div class="sov-results"></div>
        <div class="sov-diagnostics"></div>
      </section>
      <section data-pane="focus" hidden>${focusFormHtml(DEFAULT_FOCUS, opening)}</section>
      <section data-pane="config" hidden>${settingsFormHtml(opening)}</section>
    </div>`;
    root.querySelector(".sov-build").textContent = false ? "dev" : "2.0.0";
    shadow.appendChild(root);
    const openSections = new Set(loadOpenSections());
    for (const sec of root.querySelectorAll(".sov-sec")) sec.open = openSections.has(sec.dataset.sec);
    root.addEventListener("toggle", (e) => {
      if (!e.target.classList?.contains("sov-sec")) return;
      if (e.target.open) openSections.add(e.target.dataset.sec);
      else openSections.delete(e.target.dataset.sec);
      saveOpenSections([...openSections]);
    }, true);
    let anchor = loadPanelPosition();
    let dragged = false;
    let dragPointerId = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    const header = root.querySelector("h2");
    function positionPanel(x, y) {
      const viewportHeight = window.innerHeight;
      if (root.classList.contains("sov-collapsed")) {
        root.style.maxHeight = "";
      } else {
        const minVisible = header.offsetHeight || 34;
        const top = Math.min(
          Math.max(0, Number.isFinite(y) ? y : 0),
          Math.max(0, viewportHeight - minVisible)
        );
        root.style.maxHeight = `${viewportHeight - top}px`;
      }
      const position = clampPanelPosition(
        x,
        y,
        root.offsetWidth,
        root.offsetHeight,
        window.innerWidth,
        viewportHeight
      );
      root.style.left = `${position.x}px`;
      root.style.top = `${position.y}px`;
      root.style.right = "auto";
    }
    function placeAtAnchor() {
      if (anchor) positionPanel(anchor.x, anchor.y);
    }
    header.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".sov-about,.sov-gear,.sov-changelog") || e.button !== 0) return;
      const rect = root.getBoundingClientRect();
      dragPointerId = e.pointerId;
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      dragged = false;
      header.setPointerCapture?.(e.pointerId);
    });
    header.addEventListener("pointermove", (e) => {
      if (e.pointerId !== dragPointerId) return;
      const rect = root.getBoundingClientRect();
      if (!dragged && Math.hypot(
        e.clientX - (rect.left + dragOffsetX),
        e.clientY - (rect.top + dragOffsetY)
      ) < 3) return;
      dragged = true;
      root.classList.add("sov-dragging");
      e.preventDefault();
      positionPanel(e.clientX - dragOffsetX, e.clientY - dragOffsetY);
    });
    function finishDrag(e) {
      if (e.pointerId !== dragPointerId) return;
      if (dragged) {
        const rect = root.getBoundingClientRect();
        anchor = { x: rect.left, y: rect.top };
        savePanelPosition(anchor);
      }
      root.classList.remove("sov-dragging");
      dragPointerId = null;
    }
    header.addEventListener("pointerup", finishDrag);
    header.addEventListener("pointercancel", finishDrag);
    window.addEventListener("resize", placeAtAnchor);
    let manualCollapsed = loadPanelCollapsed();
    let offMapExpandOverride = false;
    let paneShown;
    const autoMinimizeOn = () => !!readSettings().settings.autoMinimizeOffMap;
    const currentlyOnMap = () => isWorldMapHash(globalThis.location?.hash);
    function shouldCollapse() {
      if (autoMinimizeOn() && !currentlyOnMap()) return !offMapExpandOverride;
      return manualCollapsed;
    }
    function applyCollapsed() {
      const collapsed = shouldCollapse();
      root.classList.toggle("sov-collapsed", collapsed);
      if (collapsed) closePopovers?.();
      placeAtAnchor();
      reportPane();
    }
    function reportPane() {
      const shown = root.classList.contains("sov-collapsed") ? null : root.querySelector("[data-pane]:not([hidden])").dataset.pane;
      if (shown === paneShown) return;
      paneShown = shown;
      onPaneShown?.(shown);
    }
    function toggleCollapsed() {
      const next = !root.classList.contains("sov-collapsed");
      if (autoMinimizeOn() && !currentlyOnMap()) {
        offMapExpandOverride = !next;
      } else {
        manualCollapsed = next;
        savePanelCollapsed(next);
      }
      applyCollapsed();
    }
    window.addEventListener("hashchange", () => {
      offMapExpandOverride = false;
      applyCollapsed();
    });
    const $ = (sel) => root.querySelector(sel);
    const form = $(".sov-form");
    const scanBtn = $(".sov-scan");
    function addPopover(className, html) {
      const el = document.createElement("div");
      el.className = className;
      el.hidden = true;
      el.innerHTML = html;
      shadow.appendChild(el);
      return el;
    }
    const gear = $(".sov-gear");
    const menu = addPopover("sov-menu", settingsMenuHtml(opening));
    const changelog = addPopover("sov-menu sov-changelog-menu", changelogHtml(CHANGELOG));
    const popovers = [[gear, menu], [$(".sov-changelog"), changelog]];
    installTooltips(shadow);
    const containerFor = (f) => f.menu ? menu : form;
    let rendered = [];
    let selected = null;
    let incomplete = [];
    header.addEventListener("click", (e) => {
      if (e.target.closest(".sov-about")) return;
      if (dragged) {
        dragged = false;
        return;
      }
      toggleCollapsed();
    });
    scanBtn.addEventListener("click", onScan);
    function showTab(name) {
      root.querySelectorAll(".sov-tabs button").forEach((t) => {
        t.classList.toggle("on", t.dataset.tab === name);
      });
      root.querySelectorAll("[data-pane]").forEach((p) => {
        p.hidden = p.dataset.pane !== name;
      });
      if (name === "focus") syncFocusRadiusHint();
      reportPane();
    }
    root.querySelectorAll(".sov-tabs button").forEach((tab) => {
      tab.addEventListener("click", () => showTab(tab.dataset.tab));
    });
    function plotInputs() {
      const raw = {};
      for (const p of PLOT_KEYS) raw[p] = form.querySelector(`[data-plot="${p}"]`).value;
      return raw;
    }
    function readSettings() {
      const errors = [];
      const out = {};
      for (const f of SETTINGS_FIELDS) {
        switch (f.type) {
          case "checkbox":
            out[f.key] = containerFor(f).querySelector(`input[data-key="${f.key}"]`).checked;
            break;
          case "select": {
            const v = containerFor(f).querySelector(`select[data-key="${f.key}"]`).value;
            out[f.key] = f.parse === "number" ? Number(v) : v;
            break;
          }
          case "plots": {
            const r = validatePlots(plotInputs());
            out.plots = r.plots;
            if (!r.ok) errors.push(`Settle plots total ${r.total}, must be ${PLOT_TOTAL} (${r.message}).`);
            break;
          }
          case "milsov":
            out.milsovStructure = parseMilsovStructure(
              form.querySelector(`select[data-key="${f.key}"]`).value
            );
            break;
          case "calibration":
            out.rpCalibration = parseRpCalibration(
              form.querySelector('[data-cal="observedRpPerHour"]').value,
              form.querySelector('[data-cal="atTax"]').value,
              form.querySelector('[data-cal="prestige"]').checked
            );
            break;
          case "boosters": {
            const raw = {};
            for (const res of BASIC_RESOURCES) {
              raw[res] = form.querySelector(`[data-booster="${res}"]`).checked;
            }
            out.resourceBoosters = parseResourceBoosters(raw);
            break;
          }
          case "upkeepBuildings": {
            const raw = {};
            for (const el of form.querySelectorAll("[data-upkeep]")) {
              raw[el.dataset.upkeep] = el.value;
            }
            out.upkeepBuildings = parseUpkeepBuildings(raw);
            break;
          }
          case "prestige": {
            const raw = {};
            for (const key of PRESTIGE_KEYS) {
              raw[key] = form.querySelector(`[data-prestige="${key}"]`).checked;
            }
            out.prestige = parsePrestige(raw);
            break;
          }
          case "minimums": {
            const raw = {};
            for (const key of MINIMUM_KEYS) {
              raw[key] = form.querySelector(`[data-minimum="${key}"]`).value;
            }
            out.resourceMinimums = parseResourceMinimums(raw);
            break;
          }
          case "terrains":
            out.siteTerrains = parseSiteTerrains([...form.querySelectorAll("[data-terrain]")].filter((el) => el.checked).map((el) => el.dataset.terrain));
            break;
          default:
            out[f.key] = clampNumber(containerFor(f).querySelector(`input[data-key="${f.key}"]`).value, f);
        }
      }
      return { settings: out, errors };
    }
    function writeSettings(s, { save = true } = {}) {
      for (const f of SETTINGS_FIELDS) {
        const v = s[f.key];
        switch (f.type) {
          case "checkbox":
            containerFor(f).querySelector(`input[data-key="${f.key}"]`).checked = !!v;
            break;
          case "select":
            containerFor(f).querySelector(`select[data-key="${f.key}"]`).value = String(v);
            break;
          case "plots":
            writePlots(v);
            break;
          case "milsov":
            form.querySelector(`select[data-key="${f.key}"]`).value = v ?? "";
            break;
          case "calibration":
            form.querySelector('[data-cal="observedRpPerHour"]').value = v?.observedRpPerHour ?? "";
            form.querySelector('[data-cal="atTax"]').value = v?.atTax ?? 0;
            form.querySelector('[data-cal="prestige"]').checked = !!v?.prestige;
            break;
          case "boosters":
            for (const res of BASIC_RESOURCES) {
              form.querySelector(`[data-booster="${res}"]`).checked = !!v?.[res];
            }
            break;
          case "upkeepBuildings":
            for (const el of form.querySelectorAll("[data-upkeep]")) {
              el.value = v?.[el.dataset.upkeep] ?? 0;
            }
            break;
          case "prestige":
            for (const key of PRESTIGE_KEYS) {
              form.querySelector(`[data-prestige="${key}"]`).checked = !!v?.[key];
            }
            break;
          case "minimums":
            for (const key of MINIMUM_KEYS) {
              form.querySelector(`[data-minimum="${key}"]`).value = v?.[key] ?? 0;
            }
            break;
          case "terrains":
            for (const el of form.querySelectorAll("[data-terrain]")) {
              el.checked = !!v?.includes(el.dataset.terrain);
            }
            break;
          default:
            containerFor(f).querySelector(`input[data-key="${f.key}"]`).value = v ?? f.fallback ?? "";
        }
      }
      refresh({ save });
      applyCollapsed();
    }
    function writePlots(plots) {
      for (const p of PLOT_KEYS) form.querySelector(`[data-plot="${p}"]`).value = plots?.[p] ?? 0;
    }
    function refresh({ save = true } = {}) {
      const { settings: s } = readSettings();
      if (save) onSettingsChange?.(s);
      for (const f of SETTINGS_FIELDS) {
        if (!f.enabledWhen && !f.overriddenWhen) continue;
        const on = (f.enabledWhen?.(s) ?? true) && !f.overriddenWhen?.(s);
        const wrap = form.querySelector(`[data-key="${f.key}"]`);
        wrap.classList.toggle("sov-gated", !on);
        wrap.querySelectorAll("input,select").forEach((el) => {
          el.disabled = !on;
        });
      }
      form.querySelector('.sov-override[data-key="rpCalibration"]').classList.toggle("sov-override-on", !!s.rpCalibration);
      const plots = validatePlots(plotInputs());
      for (const total of root.querySelectorAll(".sov-plot-total")) {
        total.className = `sov-plot-total ${plots.ok ? "sov-ok" : "sov-bad"}`;
        total.textContent = `${plots.total} / ${PLOT_TOTAL} plots${plots.ok ? "" : ` \u2014 ${plots.message}`}`;
      }
      for (const bar of root.querySelectorAll(".sov-plotbar")) bar.innerHTML = plotBarHtml(plots.plots);
      for (const sum of root.querySelectorAll(".sov-sum")) {
        sum.innerHTML = sectionSummaryHtml(sum.dataset.sum, s);
      }
      for (const el of form.querySelectorAll("[data-upkeep]")) {
        el.closest(".sov-f").classList.toggle("sov-has", Number(el.value) > 0);
      }
      form.querySelector(".sov-derived").innerHTML = capitalDerivedHtml(s);
      const bOther = computeBOther(s);
      form.querySelector(".sov-derived-food").textContent = `Food production bonuses total ${bOther >= 0 ? "+" : ""}${bOther}%.`;
      const rp = Math.round(researchInUse(s)).toLocaleString("en-GB");
      form.querySelector(".sov-rp-read").textContent = s.rpCalibration ? `In use: ${rp} research per hour at 0% tax, from your reading.` : `In use: ${rp} research per hour at 0% tax, from the settings above.`;
      scanBtn.disabled = !plots.ok;
      scanBtn.title = plots.ok ? "" : "Settle plot allocation must sum to 25";
      root.classList.toggle("sov-no-map", !s.mapOverlay);
      for (const el of root.querySelectorAll("[data-mirror-key], [data-mirror-plot], [data-mirror-terrain]")) {
        const own = mirrored(el);
        if (el.type === "checkbox") el.checked = own.checked;
        else if (el.value !== own.value) el.value = own.value;
      }
    }
    function mirrored(el) {
      const { mirrorKey, mirrorPlot, mirrorTerrain } = el.dataset;
      if (mirrorKey) return form.querySelector(`input[data-key="${mirrorKey}"]`);
      if (mirrorPlot) return form.querySelector(`input[data-plot="${mirrorPlot}"]`);
      return mirrorTerrain ? form.querySelector(`input[data-terrain="${mirrorTerrain}"]`) : null;
    }
    for (const type of ["input", "change"]) {
      root.addEventListener(type, (e) => {
        const own = mirrored(e.target);
        if (!own) return;
        if (own.type === "checkbox") own.checked = e.target.checked;
        else own.value = e.target.value;
        own.dispatchEvent(new Event(type, { bubbles: true }));
      });
    }
    form.addEventListener("submit", (e) => e.preventDefault());
    $(".sov-scan-form").addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("input", () => refresh());
    form.addEventListener("change", (e) => {
      const el = e.target;
      if (el.dataset.plot) {
        el.value = validatePlots(plotInputs()).plots[el.dataset.plot];
      }
      refresh();
    });
    form.addEventListener("click", (e) => {
      if (e.target.closest(".sov-reset")) {
        writeSettings(DEFAULT_SETTINGS);
      } else if (e.target.closest(".sov-prefill")) {
        prefill();
      }
    });
    menu.addEventListener("change", () => {
      const wasCollapsed = root.classList.contains("sov-collapsed");
      refresh();
      if (!currentlyOnMap()) offMapExpandOverride = !wasCollapsed;
      applyCollapsed();
    });
    function setPopoverOpen(button, popover, open) {
      if (open) {
        const b = button.getBoundingClientRect();
        const p = root.getBoundingClientRect();
        popover.hidden = false;
        popover.style.top = `${b.bottom + 4}px`;
        popover.style.left = `${Math.max(4, p.right - popover.offsetWidth)}px`;
      } else {
        popover.hidden = true;
      }
      button.setAttribute("aria-expanded", String(open));
    }
    function closePopovers() {
      for (const [button, popover] of popovers) setPopoverOpen(button, popover, false);
    }
    for (const [button, popover] of popovers) {
      const toggle = (e) => {
        e.stopPropagation();
        const open = popover.hidden;
        closePopovers();
        setPopoverOpen(button, popover, open);
      };
      button.addEventListener("click", toggle);
      button.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        toggle(e);
      });
    }
    document.addEventListener("pointerdown", (e) => {
      if (innerTarget(e).closest(".sov-menu,.sov-gear,.sov-changelog")) return;
      closePopovers();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopovers();
    });
    function prefill() {
      const src = $(".sov-prefill-src");
      if (!selected || !selected.rs) {
        src.textContent = "Click a result row first \u2014 Prefill copies that tile\u2019s resource ratings.";
        return;
      }
      writePlots(selected.rs);
      refresh();
      src.textContent = `Prefilled from ${selected.x}|${selected.y} \u2014 ratings ${PLOT_KEYS.map((p) => selected.rs[p]).join("|")}.`;
    }
    function select(n) {
      selected = rendered[n] ?? null;
      root.querySelectorAll(".sov-row").forEach((r) => {
        r.classList.toggle("sov-selected", Number(r.dataset.n) === n);
      });
      if (selected) {
        $(".sov-prefill-src").textContent = selected.rs ? `Selected ${selected.x}|${selected.y} \u2014 ratings ${PLOT_KEYS.map((p) => selected.rs[p]).join("|")}.` : `Selected ${selected.x}|${selected.y} \u2014 no resource ratings in the payload for this tile.`;
        onSelect?.(selected);
      }
    }
    function drawIncomplete() {
      $(".sov-diagnostics").innerHTML = incomplete.length ? `<p class="sov-hint">${incomplete.length} ${incomplete.length === 1 ? "site was" : "sites were"} skipped because their claim radius
        runs off screen. Zoom out or pan so the whole area is on screen, then scan again.</p>` : "";
    }
    const focusForm = $(".sov-focus-form");
    let refusedView = null;
    let stopWaiting = null;
    function syncFocusRadiusHint() {
      const { settings: s } = readSettings();
      const rClaim = Math.round(s.rClaim ?? 2);
      focusForm.querySelector('[data-focus="radius"]').placeholder = String(rClaim);
      focusForm.querySelector("[data-radius-row]").title = focusRadiusTitle(rClaim);
      syncTownPicker();
    }
    function syncTownPicker() {
      const sel = focusForm.querySelector(".sov-town-pick");
      const was = sel.value;
      const payload = getPayload?.();
      const towns = payload ? ownTowns(payload) : [];
      sel.innerHTML = towns.length ? `<option value="">\u2014</option>${towns.map((t) => `<option value="${t.x}|${t.y}">${escapeHtml(t.label)}</option>`).join("")}` : `<option value="">${payload ? "none on screen" : "no map data yet"}</option>`;
      if (was && towns.some((t) => `${t.x}|${t.y}` === was)) sel.value = was;
    }
    function readFocus() {
      const raw = {};
      for (const key of ["x", "y", "radius", "tax"]) {
        raw[key] = focusForm.querySelector(`[data-focus="${key}"]`).value;
      }
      for (const key of ["useConfiguredPlots", "preserveSovereignty"]) {
        raw[key] = focusForm.querySelector(`[data-focus="${key}"]`).checked;
      }
      return raw;
    }
    function onRefusedMove() {
      const { x, y } = refusedView;
      stopWaiting?.();
      stopWaiting = location.hash === mapHash(refusedView) ? whenViewLoaded2?.(refusedView, () => planAt(x, y)) : null;
      if (!stopWaiting) window.removeEventListener("hashchange", onRefusedMove);
      $(".sov-focus-status").textContent = stopWaiting ? `Centring the map on ${x}|${y}; it is optimised once the map has loaded.` : `The map has moved. Optimise again to check ${x}|${y} on this view.`;
    }
    function runFocus() {
      const status = $(".sov-focus-status");
      const out = $(".sov-focus-out");
      window.removeEventListener("hashchange", onRefusedMove);
      stopWaiting?.();
      stopWaiting = null;
      const fail2 = (message) => {
        status.textContent = message;
        out.innerHTML = "";
        onFocusPlan?.(null);
      };
      const read = readSettings();
      if (read.errors.length) {
        fail2(read.errors.join(" "));
        return;
      }
      const { focus, errors } = parseFocus(readFocus());
      if (errors.length) {
        fail2(errors.join(" "));
        return;
      }
      const payload = getPayload?.();
      const result = focusSite({ payload, focus, settings: read.settings });
      if (!result.ok) {
        fail2(result.message);
        if (result.reason === "centre-missing" || result.reason === "incomplete") {
          const radius = focusRadius(focus, read.settings);
          refusedView = centredView(focus.x, focus.y, payload.zoom, radius);
          window.addEventListener("hashchange", onRefusedMove);
          status.insertAdjacentHTML("beforeend", `<p class="sov-map-only"><a class="sov-map-centre"
          href="${mapHash(refusedView)}">Centre the map on ${focus.x}|${focus.y}</a></p>`);
        }
        return;
      }
      status.textContent = "";
      out.innerHTML = focusResultHtml(result);
      mountPlanBlock(out.querySelector(".sov-plan-block"), {
        neighbours: result.neighbours,
        // The settings the plan was made with, which can differ from the form's.
        settings: result.settings,
        ctx: result.ctx,
        base: result.base,
        floor: result.floor,
        geom: { radius: result.radius, x: result.x, y: result.y, kept: result.kept?.claims },
        tax: result.plan.tax,
        onPlan: onFocusPlan
      });
    }
    function planAt(x, y) {
      focusForm.querySelector('[data-focus="x"]').value = x;
      focusForm.querySelector('[data-focus="y"]').value = y;
      townPick.value = "";
      runFocus();
    }
    function optimiseSite(result) {
      showTab("focus");
      planAt(result.x, result.y);
      $(".sov-focus-status").scrollIntoView({ block: "start" });
    }
    const townPick = focusForm.querySelector(".sov-town-pick");
    townPick.addEventListener("pointerdown", syncTownPicker);
    townPick.addEventListener("focus", syncTownPicker);
    focusForm.addEventListener("change", (e) => {
      const el = e.target;
      if (el.dataset.focus === "x" || el.dataset.focus === "y") {
        townPick.value = "";
        return;
      }
      if (!el.closest(".sov-town-pick") || !el.value) return;
      const [x, y] = el.value.split("|");
      focusForm.querySelector('[data-focus="x"]').value = x;
      focusForm.querySelector('[data-focus="y"]').value = y;
    });
    focusForm.addEventListener("submit", (e) => e.preventDefault());
    focusForm.addEventListener("click", (e) => {
      if (e.target.closest(".sov-focus-run")) runFocus();
      else if (e.target.closest(".sov-map-pick")) onPickOnMap?.();
    });
    refresh({ save: false });
    syncFocusRadiusHint();
    applyCollapsed();
    return {
      root,
      /** How the last load or save went; '' clears it. */
      setStoreNote(text) {
        $(".sov-store-note").textContent = text ?? "";
      },
      /** Returns `{ settings, errors }`; a scan is refused while there are errors. */
      getSettings: readSettings,
      setSettings: writeSettings,
      setStatus(html) {
        root.querySelector(".sov-status").innerHTML = html;
      },
      /** Set a pane's line saying what the map shows; '' clears it. */
      setMapNote(pane, text, tooltip) {
        const note = $(`[data-pane="${pane}"] .sov-map-note`);
        if (!note) return;
        note.textContent = text;
        note.title = tooltip ?? "";
      },
      /**
       * @param {object[]} results ranked sites
       * @param {object} scan `{x, y, zoom, scanned}`
       */
      renderResults(results, scan) {
        const el = root.querySelector(".sov-results");
        rendered = results;
        selected = null;
        const summary = { ...scan, candidates: results.length };
        $(".sov-prefill-src").textContent = "";
        el.innerHTML = resultsHtml(results, scanSummaryText(summary));
        el.querySelectorAll(".sov-row").forEach((row) => {
          row.addEventListener("click", () => {
            select(Number(row.dataset.n));
            toggleDetail(row, results[Number(row.dataset.n)], readSettings().settings, optimiseSite);
          });
        });
      },
      /**
       * Select the listed site at x|y and open its plan, as a row click does. False
       * when no row lists that tile.
       */
      selectSite(x, y) {
        const n = rendered.findIndex((r) => r.x === x && r.y === y);
        const row = n < 0 ? null : root.querySelector(`.sov-results .sov-row[data-n="${n}"]`);
        if (!row) return false;
        select(n);
        if (!row.nextElementSibling?.classList.contains("sov-detail")) {
          toggleDetail(row, rendered[n], readSettings().settings, optimiseSite);
        }
        row.scrollIntoView({ block: "nearest" });
        return true;
      },
      planAt,
      /** While a pick is armed, Pick on map becomes its cancel button. */
      setPicking(armed) {
        const button = focusForm.querySelector(".sov-map-pick");
        button.classList.toggle("sov-picking", armed);
        button.textContent = armed ? "Click a tile \xB7 Cancel" : "Pick on map";
      },
      renderIncomplete(list) {
        incomplete = list;
        drawIncomplete();
      }
    };
  }
  var TIP_DELAY_MS = 250;
  var innerTarget = (e) => e.composedPath()[0];
  function installTooltips(shadow) {
    const box = document.createElement("div");
    box.className = "sov-tip";
    box.setAttribute("role", "tooltip");
    box.hidden = true;
    shadow.appendChild(box);
    let shownFor = null;
    let timer = 0;
    const hide = () => {
      clearTimeout(timer);
      shownFor = null;
      box.hidden = true;
    };
    const show = (el) => {
      shownFor = el;
      box.textContent = el.dataset.sovTip;
      box.classList.toggle("sov-tip-multi", box.textContent.includes("\n"));
      box.hidden = false;
      const { left, top } = tipPosition(
        el.getBoundingClientRect(),
        { width: box.offsetWidth, height: box.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight }
      );
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
    };
    document.addEventListener("pointerover", (e) => {
      const el = innerTarget(e).closest?.(".sov-panel [title], .sov-menu [title], [data-sov-tip]");
      if (!el) {
        hide();
        return;
      }
      if (el === shownFor) return;
      if (el.hasAttribute("title")) {
        el.dataset.sovTip = el.title;
        el.setAttribute("aria-description", el.title);
        el.removeAttribute("title");
      }
      clearTimeout(timer);
      if (shownFor) show(el);
      else timer = setTimeout(() => show(el), TIP_DELAY_MS);
    });
    document.addEventListener("pointerout", (e) => {
      if (!e.relatedTarget) hide();
    });
    for (const type of ["pointerdown", "keydown", "wheel"]) {
      document.addEventListener(type, hide, true);
    }
    for (const target of [document, shadow]) target.addEventListener("scroll", hide, true);
  }
  var BINDING_LABEL = {
    cap: "Tax cap",
    food: "Food",
    rp: "Research",
    res: "Resources"
  };
  function bindingLabel(binding) {
    return BINDING_LABEL[binding] ?? binding;
  }
  var count = (v) => Number(v ?? 0).toLocaleString("en-GB");
  function scanSummaryText(scan) {
    const side = 2 * scan.zoom + 1;
    return `Centred on ${scan.x}|${scan.y}, ${side}\xD7${side} tiles. Checked ${count(scan.scanned)} tiles and found ${count(scan.candidates)} candidate${scan.candidates === 1 ? "" : "s"}.`;
  }
  function militaryCellHtml(r) {
    const troops = `<img src="${ICONS.troops}" alt="">`;
    const flags = [];
    const res = resFlag(r);
    if (res) {
      const icon = PRODUCTION_ICONS[r.resBinding] ? `<img src="${PRODUCTION_ICONS[r.resBinding]}" alt="">` : "";
      flags.push({
        cls: "sov-pill-bad",
        html: `${icon}${r.resImpossible ? "no plots" : `${r.resCeiling.toFixed(1)}%`}`,
        title: res.title
      });
    }
    if (r.milsovBlocked) {
      flags.push({
        cls: "sov-pill-bad",
        html: `${troops}none`,
        title: `No military sovereignty fits here for free \u2014 ${MILSOV_BLOCKED_TEXT[r.milsovBlocked] ?? "nothing was left over"}.`
      });
    }
    if (r.milsovMinTax != null) {
      flags.push({
        cls: "sov-pill-warn",
        html: `${troops}min at ${r.milsovMinTax.toFixed(0)}%`,
        title: `This site reaches your minimum military bonus (+${r.milsovMinBonusAt}%) at ${r.milsovMinTax.toFixed(0)}% tax, against the ${r.tMax.toFixed(0)}% it holds on food alone. Open the row and drag the tax slider to see the trade.`
      });
    }
    const conditional = conditionalDescriptors(r);
    if (conditional.size) {
      flags.push({
        cls: "sov-pill-warn",
        html: "conditional",
        title: `${[...conditional].map(([b, n]) => `${n}\xD7 ${b}`).join(", ")} \u2014 these tiles carry a terrain bonus that only pays if the city has that building. Not scored either way.`
      });
    }
    return `${r.milsovBonus ? `<b class="sov-mil-v">+${r.milsovBonus}%</b>` : ""}${flags.map((f) => `<span class="sov-pill ${f.cls}" title="${escapeHtml(f.title)}">${f.html}</span>`).join("")}`;
  }
  function planBlockHtml({ ctx, base, plan, floor, geom }) {
    const lowest = Math.max(0, Math.ceil(floor));
    const slider = ctx && Number.isFinite(base.tMax) && base.tMax - lowest >= 1 ? `<div class="sov-tax" title="Drag to trade tax for sovereignty">
        <span class="sov-tax-label">Tax</span>
        <input type="range" class="sov-tax-range" min="${lowest}" max="${base.tMax}"
          step="1" value="${plan.tax}" aria-label="Tax">
        <output class="sov-tax-at">${plan.tax.toFixed(0)}%</output>
      </div>` : "";
    return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base, geom)}</div>`;
  }
  function bindPlanBlock(scope, ctx, base, geom, onPlan) {
    const range2 = scope.querySelector(".sov-tax-range");
    if (!range2) return;
    const at = scope.querySelector(".sov-tax-at");
    const body = scope.querySelector(".sov-body-at");
    range2.addEventListener("input", () => {
      const tax = Number(range2.value);
      at.textContent = `${tax.toFixed(0)}%`;
      const plan = planSiteAt(ctx, tax);
      body.innerHTML = plan ? detailBodyHtml(plan, base, geom) : '<p class="sov-flag">This site cannot hold that tax.</p>';
      onPlan(tax, plan);
    });
  }
  function mountPlanBlock(scope, state) {
    const excluded = /* @__PURE__ */ new Set();
    let tax = state.tax;
    const draw = () => {
      let ctx = state.ctx;
      let base = state.base;
      if (excluded.size) {
        const usable = state.neighbours.filter((n) => !excluded.has(cellKey(n.dx, n.dy)));
        ctx = usable.length ? prepareSite({ neighbours: usable, settings: state.settings }) : null;
        base = ctx ? scoreSiteFrom(ctx) : null;
      }
      const geom = { ...state.geom, excluded, pickable: !!state.neighbours };
      if (!base) {
        const none = { tiles: [], free: [], milsov: [] };
        scope.innerHTML = `<p class="sov-flag">No plan holds with those tiles crossed out.</p>${planGridHtml(none, geom)}`;
        state.onPlan?.(none, geom);
        return;
      }
      tax = Math.max(0, Math.min(base.tMax, Math.max(Math.ceil(state.floor), tax)));
      const plan = (ctx ? planSiteAt(ctx, tax, { bestEffort: true }) : null) ?? base;
      scope.innerHTML = planBlockHtml({ ctx, base, plan, floor: state.floor, geom });
      bindPlanBlock(scope, ctx, base, geom, (t, p) => {
        tax = t;
        state.onPlan?.(p, geom);
      });
      state.onPlan?.(plan, geom);
    };
    scope.addEventListener("click", (e) => {
      const cell = e.target.closest(".sov-pick");
      if (!cell || !scope.contains(cell)) return;
      const key = cellKey(Number(cell.dataset.dx), Number(cell.dataset.dy));
      if (!excluded.delete(key)) excluded.add(key);
      draw();
    });
    draw();
  }
  function toggleDetail(row, result, settings2, onOptimise) {
    const next = row.nextElementSibling;
    if (next && next.classList.contains("sov-detail")) {
      next.remove();
      return;
    }
    const tr = document.createElement("tr");
    tr.className = "sov-detail";
    const ctx = result.neighbours ? prepareSite({ neighbours: result.neighbours, settings: settings2 }) : null;
    const cell = document.createElement("td");
    cell.colSpan = 6;
    const actions = document.createElement("p");
    actions.className = "sov-detail-actions";
    actions.innerHTML = `<button type="button" class="sov-optimise sec">${GLYPHS.target}Optimise ${result.x}|${result.y} \u2192</button>`;
    actions.querySelector(".sov-optimise").addEventListener("click", () => onOptimise?.(result));
    const block = document.createElement("div");
    cell.append(actions, block);
    tr.append(cell);
    row.after(tr);
    mountPlanBlock(block, {
      neighbours: result.neighbours ?? null,
      settings: settings2,
      ctx,
      base: result,
      floor: Math.max(0, Math.min(settings2.tMin ?? 0, result.tMax)),
      geom: { radius: Math.round(settings2.rClaim ?? 2), x: result.x, y: result.y },
      tax: result.tax
    });
  }
  function keptNote(r) {
    if (!r?.preserving) {
      if (!r?.released) return "";
      const one = r.released === 1;
      return `Preserve Existing Sovereignty is off, so the ${r.released} claim${one ? "" : "s"} ${escapeHtml(r.homeTown)} already holds inside the radius ${one ? "is" : "are"} planned as empty ground and priced in full, as though given up and laid out again. Turn it on to plan around them instead.`;
    }
    if (!r.preserveTown) {
      return "Preserve Existing Sovereignty is on, but this tile carries no town \u2014 sovereignty belongs to a town, so there is none here to keep and the plan is drawn on empty ground.";
    }
    const kept = r.kept;
    const parts = [];
    if (kept.claims.length) {
      parts.push(`Keeping ${kept.claims.length} claim${kept.claims.length === 1 ? "" : "s"} ${escapeHtml(r.preserveTown)} already holds, costing ${Math.round(kept.rp).toLocaleString("en-GB")} research and ${Math.round(kept.rp * 10).toLocaleString("en-GB")} gold an hour, which is taken off the top. The plan is free to build on those squares and pays only for the levels it raises them by. Their buildings are costed as if new.`);
    }
    if (kept.unknownLevel) {
      parts.push(`${kept.unknownLevel} more carry a level that could not be read, and are planned as bare ground.`);
    }
    if (kept.otherTown) {
      const one = kept.otherTown === 1;
      parts.push(`${kept.otherTown} claim${one ? "" : "s"} of yours inside the radius belong${one ? "s" : ""} to another of your towns, and ${one ? "is" : "are"} held against this one on the same terms as a stranger's.`);
    }
    return parts.join(" ");
  }
  function claimHolderText(rd) {
    const holder = {
      Yours: "One of your towns",
      Alliance: "An alliance member",
      Confed: "A confederate"
    }[String(rd ?? "").trim()] ?? "Another player";
    return `${holder} holds sovereignty on this tile.`;
  }
  function focusResultHtml(r) {
    const notes = [r.plotNote, keptNote(r)].filter(Boolean);
    const warnings = [];
    if (!r.centre.isTown) {
      if (!r.centre.settleable) {
        warnings.push("This tile cannot be settled, so the plan below is for analysis only.");
      }
      if (r.centre.claimedBy) warnings.push(claimHolderText(r.centre.claimedBy));
    }
    const ceiling = r.holdsNoTax ? `<p class="sov-warn">This tile holds no tax \u2014 its ceiling is ${r.ceiling.toFixed(0)}%, limited by ${escapeHtml(bindingLabel(r.base.binding).toLowerCase())}.</p>` : "";
    const chips = [
      r.holdsNoTax ? "" : `<span class="sov-chip" title="Highest tax this tile holds on food alone">max <b>${r.base.tMax.toFixed(0)}%</b>${limitHtml(r.base)}</span>`,
      `<span class="sov-chip" title="${r.radiusFromConfig ? "From City Configuration" : "As set above"}">radius ${r.radius}</span>`,
      `<span class="sov-chip" title="How many of the ${r.ring} surrounding tiles are claimable">${r.claimable}/${r.ring} claimable</span>`
    ].join("");
    const asked = r.holdsNoTax ? "" : r.aboveCeiling ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(0)}% \u2014 the plan below is at its ceiling of ${r.ceiling.toFixed(0)}%.</p>` : "";
    return `<div class="sov-result-h"><span class="sov-xy-big">${r.x}|${r.y}</span>${chips}</div>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join("")}
    ${ceiling}${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join("")}
    ${asked}
    <div class="sov-plan-block"></div>`;
  }
  function roman(level) {
    return SOV_LEVEL_ROMAN[level - 1] ?? String(level);
  }
  var FOOD_ICON = `<img src="${ICONS.food}" alt="food">`;
  var CROSS = '<span class="sov-x">\u2715</span>';
  function cellKey(dx, dy) {
    return `${dx},${dy}`;
  }
  function gridCell({ cls, title, level, body, badge, dx, dy, pick }) {
    return `<td class="sov-cell ${cls}${pick ? " sov-pick" : ""}"${pick ? ` data-dx="${dx}" data-dy="${dy}"` : ""} title="${escapeHtml(title)}">${level ? `<span class="sov-lv">${level}</span>` : ""}${body ? `<span class="sov-cv">${body}</span>` : ""}${badge ?? ""}</td>`;
  }
  function descriptorText(tile) {
    if (typeof tile?.i !== "number" && !tile?.descriptor) return "";
    const d = tile?.descriptor ?? descriptorFor(tile.i);
    if (!d) return `Terrain ${tile.i} \u2014 unidentified`;
    const varies = d.nodeClass ? " (rating varies; not a fixed terrain)" : "";
    if (d.bonusUnread) return `${d.name}${varies} \u2014 bonus not read yet`;
    if (d.nodeClass) return `${d.name}${varies}`;
    if (!d.building) return `${d.name} \u2014 no sovereignty bonus`;
    const conditional = d.conditional ? `, needs a ${d.building}` : "";
    const disputed = d.disputed ? " [unconfirmed]" : "";
    return `${d.name}: +${d.bonus}% ${d.product} per level of ${d.building}${conditional}${disputed}`;
  }
  function limitHtml(r) {
    const label = bindingLabel(r.binding);
    const icon = r.binding === "res" ? PRODUCTION_ICONS[r.resBinding] ?? ICONS.stone : { food: ICONS.food, rp: ICONS.research }[r.binding];
    const title = `Limited by ${(r.binding === "res" && PRODUCTION_LABEL[r.resBinding] ? PRODUCTION_LABEL[r.resBinding] : label).toLowerCase()}`;
    return icon ? `<img src="${icon}" alt="${escapeHtml(label)}" title="${escapeHtml(title)}">` : `<span class="sov-cap" title="${escapeHtml(title)}">${escapeHtml(label.toLowerCase())}</span>`;
  }
  function iconHeading(icon, name, title) {
    return `<th title="${escapeHtml(title)}"><img src="${icon}" alt="${escapeHtml(name)}"></th>`;
  }
  function resultsHtml(results, summary) {
    const head = `<p class="sov-meta">${GLYPHS.target}${summary}</p>`;
    if (!results?.length) return `${head}<p class="sov-note">No available sites met the minimum tax.</p>`;
    const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td class="sov-at"><span class="sov-rank${n < 10 ? " sov-rank-top" : ""}">${n + 1}</span>${r.x}|${r.y}</td>
          <td class="sov-tax-cell"${Number.isFinite(r.tMaxExact) ? ` title="The arithmetic reaches ${r.tMaxExact.toFixed(2)}%, but tax is whole numbers only, so the plan is made at this rate."` : ""}><b>${Number.isFinite(r.tMax) ? r.tMax.toFixed(0) : r.tMax}%</b>${limitHtml(r)}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td class="sov-mil-cell">${militaryCellHtml(r)}</td>
        </tr>`).join("");
    return `
        ${head}
        <p class="sov-legend sov-map-note"></p>
        <table>
          <thead><tr><th>Site</th>
            <th title="The highest whole-number tax this site can hold on food alone \u2014 the game takes no other kind \u2014 and the icon of what stops it going higher">Max Tax</th>
            ${iconHeading(ICONS.food, "Food", "Food per hour the city nets at that tax")}
            ${iconHeading(ICONS.research, "Research", "Research per hour the claims cost")}
            ${iconHeading(ICONS.gold, "Net Gold", "Gold per hour after claim upkeep")}
            ${iconHeading(ICONS.troops, "Military", "Free military unit production bonus \u2014 costs this site no tax \u2014 and anything to know about it")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
  }
  function conditionalDescriptors(plan) {
    const out = /* @__PURE__ */ new Map();
    for (const t of [...plan?.tiles ?? [], ...plan?.milsov ?? []]) {
      const d = t.descriptor ?? descriptorFor(t.i);
      if (d?.conditional) out.set(d.building, (out.get(d.building) ?? 0) + 1);
    }
    return out;
  }
  function descriptorBadge(tile) {
    const d = tile?.descriptor ?? (typeof tile?.i === "number" ? descriptorFor(tile.i) : null);
    if (!d?.building) return "";
    return `<span class="sov-desc" title="${escapeHtml(
      `+${d.bonus}% ${d.product} per level of ${d.building}`
    )}">+${d.bonus}% ${escapeHtml(d.product)}</span>`;
  }
  function claimCostText(t) {
    const held = t.held ?? 0;
    const rp = t.rp.toFixed(0);
    if (held > 0 && t.rp > 0) return `+${rp} RP/hr, raised from Sov ${roman(held)}`;
    if (held > 0) return "Already held at this level, no extra RP";
    return `${rp} RP/hr`;
  }
  function tip(head, ...lines) {
    return [head, ...lines].filter(Boolean).join("\n");
  }
  function planGridHtml(plan, geom) {
    const r = Math.max(1, Math.round(geom?.radius ?? 0) || spanOf(plan));
    const cx = geom?.x;
    const cy = geom?.y;
    const excluded = geom?.excluded ?? /* @__PURE__ */ new Set();
    const kept = new Map((geom?.kept ?? []).map((k) => [cellKey(k.dx, k.dy), k]));
    const pickable = !!geom?.pickable;
    const absolute = Number.isFinite(cx) && Number.isFinite(cy);
    const xLabel = (dx) => absolute ? String(cx + dx) : signed(dx);
    const yLabel = (dy) => absolute ? String(cy + dy) : signed(dy);
    const name = (dx, dy) => absolute ? `${cx + dx}|${cy + dy}` : `${signed(dx)},${signed(dy)}`;
    const specs = /* @__PURE__ */ new Map();
    let anyKept = false;
    const place = (t) => `${t.water ? "Water \xB7 food" : "Food"} ${t.food} \xB7 distance ${t.d.toFixed(2)}`;
    for (const t of plan.free ?? []) {
      const held = t.held ?? 0;
      if (held > 0) anyKept = true;
      specs.set(cellKey(t.dx, t.dy), held > 0 ? {
        cls: "sov-cell-kept",
        badge: descriptorBadge(t),
        title: tip(
          `${name(t.dx, t.dy)} \u2014 Sov ${roman(held)} claim, kept as it is`,
          place(t),
          descriptorText(t)
        ),
        level: roman(held),
        body: "kept"
      } : {
        cls: t.water ? "sov-cell-free sov-cell-water" : "sov-cell-free",
        badge: descriptorBadge(t),
        title: tip(
          `${name(t.dx, t.dy)} \u2014 ${t.relaid ? "Claimed, not used in this plan" : "Unclaimed"}`,
          place(t),
          descriptorText(t)
        ),
        body: `${FOOD_ICON} ${t.food}`
      });
    }
    for (const t of plan.tiles ?? []) {
      specs.set(cellKey(t.dx, t.dy), {
        cls: "sov-cell-food",
        badge: descriptorBadge(t),
        title: tip(
          `${name(t.dx, t.dy)} \u2014 Sov ${roman(t.level)} food claim`,
          place(t),
          claimCostText(t),
          descriptorText(t)
        ),
        level: roman(t.level),
        body: `${FOOD_ICON} ${t.food}`
      });
    }
    for (const m of plan.milsov ?? []) {
      const structure = sovStructure(m);
      const icon = STRUCTURE_ICONS[structure.key];
      specs.set(cellKey(m.dx, m.dy), {
        cls: "sov-cell-mil",
        badge: descriptorBadge(m),
        title: tip(
          `${name(m.dx, m.dy)} \u2014 Sov ${roman(m.sovLevel)} military claim`,
          `Level ${m.buildingLevel} ${structure.name} \xB7 ${structureUpkeep(m).toLocaleString("en-GB")}/hr upkeep`,
          `Distance ${m.d.toFixed(2)} \xB7 ${claimCostText(m)}`,
          descriptorText(m)
        ),
        level: roman(m.sovLevel),
        body: `${icon ? `<img src="${icon}" alt="${escapeHtml(structure.name)}">` : ""} L${m.buildingLevel}`
      });
    }
    const cell = (dx, dy) => {
      if (dx === 0 && dy === 0) {
        return gridCell({ cls: "sov-cell-town", title: `${name(0, 0)} \u2014 The town`, level: "TOWN" });
      }
      if (excluded.has(cellKey(dx, dy))) {
        return gridCell({
          cls: "sov-cell-out",
          title: tip(`${name(dx, dy)} \u2014 Crossed out`, pickable && "Click to put it back"),
          body: CROSS,
          dx,
          dy,
          pick: pickable
        });
      }
      const spec = specs.get(cellKey(dx, dy));
      if (!spec) {
        const k = kept.get(cellKey(dx, dy));
        if (k) {
          anyKept = true;
          return gridCell({
            cls: "sov-cell-kept",
            title: tip(
              `${name(dx, dy)} \u2014 Sov ${roman(k.level)} claim, kept as it is`,
              `Distance ${k.d.toFixed(2)} \xB7 ${k.rp.toFixed(0)} RP/hr`
            ),
            level: roman(k.level),
            body: "kept"
          });
        }
        return gridCell({ cls: "sov-cell-none", title: `${name(dx, dy)} \u2014 Not claimable`, body: CROSS });
      }
      return gridCell({ ...spec, dx, dy, pick: pickable });
    };
    const head = `<tr><th></th>${range(r).map((dx) => `<th>${xLabel(dx)}</th>`).join("")}</tr>`;
    const body = range(r).slice().reverse().map((dy) => `<tr><th>${yLabel(dy)}</th>${range(r).map((dx) => cell(dx, dy)).join("")}</tr>`).join("");
    return `<div class="sov-grid-wrap"><table class="sov-grid">
      <thead>${head}</thead><tbody>${body}</tbody></table></div>
    <div class="sov-keys">
      <span><i class="sov-sw sov-sw-food"></i>Food claim</span>
      <span><i class="sov-sw sov-sw-mil"></i>Military claim</span>${anyKept ? '<span><i class="sov-sw sov-sw-kept"></i>Kept claim</span>' : ""}
      <span><i class="sov-sw sov-sw-free"></i>Unclaimed</span>
      <span><i class="sov-sw sov-sw-out">\u2715</i>Unavailable</span>
    </div>
    <p class="sov-legend">I\u2013V is the claim level, L the building's, and the last line the
      terrain bonus.${pickable ? " Click a tile to cross it out and re-plan without it." : ""}
      Hover a tile for the rest.</p>`;
  }
  function range(r) {
    return Array.from({ length: 2 * r + 1 }, (_, i) => i - r);
  }
  function signed(v) {
    return `${v >= 0 ? "+" : ""}${v}`;
  }
  function spanOf(plan) {
    let span = 1;
    for (const t of [...plan.free ?? [], ...plan.tiles ?? [], ...plan.milsov ?? []]) {
      span = Math.max(span, Math.abs(t.dx), Math.abs(t.dy));
    }
    return span;
  }
  var NOTE_PILLS = {
    binds: ["limit", "sov-pill-warn", "The ceiling that sets the tax: this production runs out first"],
    deficit: ["deficit", "sov-pill-bad", "The plan spends more than the city makes"],
    indicative: ["estimate", "", "Per-plot yields for wood, clay, iron and stone are unmeasured"]
  };
  function notePills(note) {
    return note.split(", ").filter((n) => NOTE_PILLS[n]).map((n) => {
      const [text, cls, title] = NOTE_PILLS[n];
      return ` <span class="sov-pill ${cls}" title="${title}">${text}</span>`;
    }).join("");
  }
  function useCellHtml(r) {
    if (!Number.isFinite(r.base)) return '<td class="sov-use"></td>';
    const share = r.base > 0 ? Math.min(1, Math.max(0, r.spent / r.base)) : 0;
    const cls = r.value < 0 ? " sov-bar-over" : share >= 0.95 ? " sov-bar-full" : "";
    return `<td class="sov-use"><div class="sov-bar${cls}"><i style="width:${(share * 100).toFixed(1)}%"></i></div>
    <span class="sov-use-txt">${count(Math.round(r.spent))} of ${count(Math.round(r.base))}</span></td>`;
  }
  function detailBodyHtml(plan, base, geom) {
    const atCeiling = Math.abs(plan.tax - plan.tMax) < 0.05;
    const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null);
    const num = (v) => Number.isFinite(v) ? Math.round(v).toLocaleString("en-GB") : "";
    const balance = rows.length ? `<table class="sov-balance"><thead><tr><th>At ${plan.tax.toFixed(0)}% Tax</th>
        <th class="sov-use" title="What the plan and your buildings spend, against what the city produces">Spent of produced</th>
        <th>Net</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${productionLabel(r.icon)}${notePills(r.note)}</td>${useCellHtml(r)}
        <td class="${r.value < 0 ? "sov-bad" : "sov-ok"}">${num(r.value)}</td></tr>`).join("")}</tbody></table>` : "";
    const buildings = BASIC_RESOURCES.filter((res2) => plan.surplus?.buildingUpkeep?.[res2] > 0).map((res2) => `${num(plan.surplus.buildingUpkeep[res2])} ${PRODUCTION_LABEL[res2].toLowerCase()}`);
    const buildingNote = buildings.length ? `<p class="sov-hint">Spent includes ${buildings.join(", ")} per hour for your city's buildings.</p>` : "";
    const milPlan = plan.milsov.length ? milsovPlanHtml(plan) : plan.milsovBlocked ? `<p class="sov-flag">No military sovereignty fits at this tax \u2014 ${escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? "nothing was left over")}.</p>` : "";
    const res = upkeepLimitHtml(plan);
    const claimDelta = plan.tiles.length - base.tiles.length;
    const goldDelta = Math.round(plan.goldNet - base.goldNet);
    const signed2 = (v) => `${v >= 0 ? "+" : ""}${v.toLocaleString("en-GB")}`;
    const trade = plan.tax < base.tMax - 0.05 ? `<p class="sov-hint">Against the ${base.tMax.toFixed(1)}% ceiling, which fits ${base.milsovBonus ? `+${base.milsovBonus}%` : "no military bonus"}: ${signed2(claimDelta)} food claims, ${signed2(goldDelta)} gold/hr.</p>` : "";
    const short = plan.holds === false ? `<p class="sov-flag">Plan shown at ${plan.tax.toFixed(0)}% tax.</p>` : "";
    return `${short}${balance}${buildingNote}${milPlan}${res}${trade}${planGridHtml(plan, geom)}`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  // src/overlay.js
  var MAP_HOST_ID = "mapDiv";
  var MAP_LAYER_IDS = ["mapTerrain", "mapGrid", "mapSov", "mapCities"];
  var MAP_HASH_VIEW = /^#\/World\/Map\/(-?\d+)\/(-?\d+)\/(\d+)/;
  var fail = (reason) => ({ ok: false, reason });
  function hashView(hash) {
    const m = MAP_HASH_VIEW.exec(hash);
    return m && { x: Number(m[1]), y: Number(m[2]), zoom: Number(m[3]) };
  }
  function mapGeometry({ view, hash, hostRect, layerRect }) {
    if (!isWorldMapHash(hash)) return fail("not-on-map");
    const { x, y, zoom } = view ?? {};
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(zoom) || zoom < 1) {
      return fail("no-view");
    }
    const named = hashView(hash);
    if (named && (named.x !== x || named.y !== y || named.zoom !== zoom)) {
      return fail("view-moved");
    }
    if (!hostRect) return fail("no-host");
    if (!layerRect) return fail("no-layer");
    const { width, height } = layerRect;
    if (width < 100) return fail("too-small");
    if (Math.abs(width - height) > Math.max(1, 5e-3 * width)) return fail("not-square");
    if (layerRect.left < hostRect.left - 1 || layerRect.top < hostRect.top - 1 || layerRect.right > hostRect.right + 1 || layerRect.bottom > hostRect.bottom + 1) {
      return fail("outside-host");
    }
    const span = 2 * zoom + 1;
    return {
      ok: true,
      left: layerRect.left,
      top: layerRect.top,
      size: width,
      offsetX: layerRect.left - hostRect.left,
      offsetY: layerRect.top - hostRect.top,
      centreX: x,
      centreY: y,
      zoom,
      span,
      pitch: width / span
    };
  }
  function tileAt(geom, clientX, clientY) {
    const col = Math.floor((clientX - geom.left) / geom.pitch);
    const row = Math.floor((clientY - geom.top) / geom.pitch);
    if (col < 0 || row < 0 || col >= geom.span || row >= geom.span) return null;
    return { x: geom.centreX - geom.zoom + col, y: geom.centreY + geom.zoom - row };
  }
  function squareBox(geom, x, y, radius) {
    return {
      left: (x - radius - geom.centreX + geom.zoom) * geom.pitch,
      top: (geom.centreY + geom.zoom - y - radius) * geom.pitch,
      size: (2 * radius + 1) * geom.pitch
    };
  }
  function tileBox(geom, x, y) {
    const col = x - geom.centreX + geom.zoom;
    const row = geom.centreY + geom.zoom - y;
    if (col < 0 || row < 0 || col >= geom.span || row >= geom.span) return null;
    return squareBox(geom, x, y, 0);
  }
  function planMarks(plan, geom) {
    const claims = /* @__PURE__ */ new Map();
    const claim = (t, kind, level) => claims.set(cellKey(t.dx, t.dy), kind && { kind, level });
    for (const t of plan.free ?? []) claim(t, t.held > 0 ? "kept" : null, t.held);
    for (const t of plan.tiles ?? []) claim(t, "food", t.level);
    for (const m of plan.milsov ?? []) claim(m, "mil", m.sovLevel);
    const kept = /* @__PURE__ */ new Map();
    for (const k of geom.kept ?? []) kept.set(cellKey(k.dx, k.dy), { kind: "kept", level: k.level });
    const marks = [];
    for (let dy = -geom.radius; dy <= geom.radius; dy++) {
      for (let dx = -geom.radius; dx <= geom.radius; dx++) {
        const key = cellKey(dx, dy);
        const mark = geom.excluded?.has(key) ? { kind: "out" } : claims.has(key) ? claims.get(key) : kept.get(key);
        if (mark) marks.push({ x: geom.x + dx, y: geom.y + dy, ...mark });
      }
    }
    return marks;
  }
  function parseCoords(text) {
    const m = /^\s*(-?\d+)\s*\|\s*(-?\d+)\s*$/.exec(String(text ?? ""));
    return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
  }
  var CANVAS_ID = "sov-map-overlay";
  var RULER_ID = "mapCoords";
  var READOUT_ID = "coords";
  var TOP_COUNT = 10;
  var CLICK_SLOP = 4;
  var NUMERAL_PITCH = 20;
  var CLAIM_COLOURS = {
    food: { shade: "#3a5", text: "#7fdca0" },
    mil: { shade: "#a83", text: "#eb8" },
    kept: { shade: "#4a6a8a", text: "#8ab" }
  };
  var CAPTURE_PASSIVE = { capture: true, passive: true };
  var ELSEWHERE = /* @__PURE__ */ new Set(["not-on-map", "view-moved"]);
  var MOVED_TEXT = "The map has moved; Scan again to number this view.";
  var NONE_TEXT = "None of the top ten is in the map\u2019s current view.";
  var PLAN_TEXT = "On the map: the plan is drawn inside its radius.";
  var PLAN_MOVED_TEXT = "The map has moved; Optimise again to draw the plan on this view.";
  var OFF_TEXT = "The map markers are off: the game\u2019s map is not laid out the way this version expects. The results below are unaffected.";
  function paddingBox(el) {
    const b = el.getBoundingClientRect();
    const left = b.left + el.clientLeft;
    const top = b.top + el.clientTop;
    return { left, top, right: left + el.clientWidth, bottom: top + el.clientHeight };
  }
  function measureMap(view) {
    const host = document.getElementById(MAP_HOST_ID);
    const layer = host && MAP_LAYER_IDS.map((id) => document.getElementById(id)).find((el) => el?.parentElement === host && el.getBoundingClientRect().width > 0);
    return mapGeometry({
      view,
      hash: location.hash,
      hostRect: host ? paddingBox(host) : null,
      layerRect: layer?.getBoundingClientRect()
    });
  }
  function canvasOver(geom) {
    let canvas = document.getElementById(CANVAS_ID);
    if (!canvas) {
      const host = document.getElementById(MAP_HOST_ID);
      canvas = document.createElement("canvas");
      canvas.id = CANVAS_ID;
      const ruler = document.getElementById(RULER_ID);
      if (ruler?.parentElement === host) ruler.before(canvas);
      else host.append(canvas);
    }
    canvas.style.cssText = `position:absolute;left:${geom.offsetX}px;top:${geom.offsetY}px;width:${geom.size}px;height:${geom.size}px;pointer-events:none`;
    const ratio = window.devicePixelRatio || 1;
    const backing = Math.floor(geom.size * ratio);
    canvas.width = backing;
    canvas.height = backing;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return ctx;
  }
  function paintOutline(ctx, box) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#6bf";
    ctx.strokeRect(box.left + 1, box.top + 1, box.size - 2, box.size - 2);
  }
  function paintDisc(ctx, box, rank, picked) {
    const d = Math.max(box.size - 2, 14);
    const cx = box.left + box.size / 2;
    const cy = box.top + box.size / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(27,27,27,.85)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = picked ? "#6bf" : "#3a5";
    ctx.stroke();
    ctx.fillStyle = "#e6e6e6";
    ctx.font = `700 ${d >= 18 ? 11 : 10}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(rank), cx, cy);
  }
  function paintClaim(ctx, box, colours, numeral) {
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = colours.shade;
    ctx.fillRect(box.left, box.top, box.size, box.size);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = colours.shade;
    ctx.strokeRect(box.left + 0.5, box.top + 0.5, box.size - 1, box.size - 1);
    if (!numeral) return;
    const cx = box.left + box.size / 2;
    const cy = box.top + box.size / 2;
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(27,27,27,.85)";
    ctx.strokeText(numeral, cx, cy);
    ctx.fillStyle = colours.text;
    ctx.fillText(numeral, cx, cy);
  }
  function paintCross(ctx, box) {
    const near = box.size / 4;
    const far = box.size - near;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#e55";
    ctx.beginPath();
    ctx.moveTo(box.left + near, box.top + near);
    ctx.lineTo(box.left + far, box.top + far);
    ctx.moveTo(box.left + far, box.top + near);
    ctx.lineTo(box.left + near, box.top + far);
    ctx.stroke();
  }
  function paintPlan(ctx, geom, plan, claims, centre) {
    const square = squareBox(geom, plan.x, plan.y, plan.radius);
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#6bf";
    ctx.strokeRect(square.left + 0.5, square.top + 0.5, square.size - 1, square.size - 1);
    ctx.setLineDash([]);
    const numbered = geom.pitch >= NUMERAL_PITCH;
    for (const { mark, box } of claims) {
      if (mark.kind === "out") paintCross(ctx, box);
      else paintClaim(ctx, box, CLAIM_COLOURS[mark.kind], numbered && roman(mark.level));
    }
    if (centre) paintOutline(ctx, centre);
  }
  function createOverlay({
    getView,
    onPickSite,
    onPickCentre,
    onPicking,
    onNote,
    whenViewLoaded: whenViewLoaded2
  }) {
    let top = [];
    let selected = null;
    let moved = false;
    let marked = false;
    let plan = null;
    let picking = false;
    let pane = "scan";
    let press = null;
    let stopWaiting = null;
    let enabled = true;
    function note(...args) {
      if (enabled) onNote(...args);
    }
    function unpaint() {
      document.getElementById(CANVAS_ID)?.remove();
    }
    function stopWait() {
      stopWaiting?.();
      stopWaiting = null;
    }
    function listen() {
      const set = (target, type, fn, on, options) => {
        if (on) target.addEventListener(type, fn, options);
        else target.removeEventListener(type, fn, options);
      };
      const clicks = pane === "scan" && marked || picking;
      set(window, "hashchange", onMove, top.length || selected || plan || picking);
      set(document, "pointerdown", onPress, clicks, CAPTURE_PASSIVE);
      set(document, "pointerup", onRelease, clicks, CAPTURE_PASSIVE);
      if (!clicks) press = null;
    }
    function dropTop() {
      top = [];
      selected = null;
      moved = false;
      marked = false;
    }
    function setPicking(next) {
      if (next === picking) return;
      picking = next;
      listen();
      onPicking(next);
    }
    function forget() {
      dropTop();
      plan = null;
      stopWait();
      unpaint();
      setPicking(false);
      listen();
    }
    function leave() {
      const hadTop = top.length || selected;
      const hadPlan = plan;
      forget();
      if (hadTop) {
        moved = true;
        note("scan", MOVED_TEXT);
      }
      if (hadPlan) note("focus", PLAN_MOVED_TEXT);
    }
    function refuse(reason) {
      forget();
      note("scan", OFF_TEXT, reason);
      note("focus", OFF_TEXT, reason);
    }
    function noteTop(numbered, outlined) {
      if (selected && !outlined) {
        note("scan", `${selected.x}|${selected.y} is not in the map\u2019s current view.`);
      } else if (numbered) {
        note("scan", `On the map: the top ten are numbered \u2014 ${numbered} ${numbered === 1 ? "is" : "are"} in view. Click a numbered tile to open its row.`);
      } else {
        note("scan", top.length ? NONE_TEXT : moved ? MOVED_TEXT : "");
      }
    }
    function draw() {
      stopWait();
      if (!enabled) {
        unpaint();
        marked = false;
        listen();
        return;
      }
      const geom = measureMap(getView());
      if (geom.reason === "view-moved") {
        unpaint();
        marked = false;
        stopWaiting = whenViewLoaded2(hashView(location.hash), draw);
        if (stopWaiting) listen();
        else leave();
        return;
      }
      if (!geom.ok && !ELSEWHERE.has(geom.reason)) {
        refuse(geom.reason);
        return;
      }
      const boxOf = (t) => geom.ok ? tileBox(geom, t.x, t.y) : null;
      const discs = top.map((r, i) => ({ r, rank: i + 1, box: boxOf(r) })).filter((d) => d.box);
      const outline = selected && boxOf(selected);
      marked = !!(discs.length || outline);
      const claims = (plan?.marks ?? []).map((mark) => ({ mark, box: boxOf(mark) })).filter((c) => c.box);
      const centre = plan && boxOf(plan);
      const planned = !!(centre || claims.length);
      if (plan) {
        note("focus", planned ? PLAN_TEXT : `${plan.x}|${plan.y} is not in the map\u2019s current view.`);
      }
      if (pane === "scan" ? marked : pane === "focus" && planned) {
        const ctx = canvasOver(geom);
        if (pane === "focus") {
          paintPlan(ctx, geom, plan, claims, centre);
        } else {
          if (outline) paintOutline(ctx, outline);
          for (const d of [...discs].reverse()) {
            paintDisc(ctx, d.box, d.rank, d.r.x === selected?.x && d.r.y === selected?.y);
          }
        }
      } else {
        unpaint();
      }
      listen();
      noteTop(discs.length, !!outline);
    }
    function onMove() {
      setPicking(false);
      if (isWorldMapHash(location.hash)) draw();
      else leave();
    }
    function onPress(e) {
      const onMap = e.isPrimary && e.button === 0 && e.target instanceof Element && e.target.closest(`#${MAP_HOST_ID}`);
      press = onMap ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
    }
    function onRelease(e) {
      if (!press || e.pointerId !== press.id) return;
      const far = Math.hypot(e.clientX - press.x, e.clientY - press.y) > CLICK_SLOP;
      press = null;
      if (far) return;
      const geom = measureMap(getView());
      if (!geom.ok) {
        if (!ELSEWHERE.has(geom.reason)) refuse(geom.reason);
        return;
      }
      const tile = tileAt(geom, e.clientX, e.clientY);
      if (!tile) return;
      const readout = parseCoords(document.getElementById(READOUT_ID)?.textContent);
      if (readout && (readout.x !== tile.x || readout.y !== tile.y)) {
        refuse("coords-mismatch");
        return;
      }
      if (picking) {
        setPicking(false);
        onPickCentre(tile.x, tile.y);
      } else {
        onPickSite(tile.x, tile.y);
      }
    }
    function clearTop() {
      dropTop();
      if (pane === "scan") unpaint();
      listen();
      note("scan", "");
    }
    return {
      /** Number the first ten results. */
      showTop(results) {
        if (!results.length) {
          clearTop();
          return;
        }
        top = results.slice(0, TOP_COUNT);
        selected = null;
        moved = false;
        draw();
      },
      outline(result) {
        selected = result;
        draw();
      },
      /** Draw the optimiser's plan, or remove it when `next` is null. */
      showPlan(next, geom) {
        if (next) {
          plan = { x: geom.x, y: geom.y, radius: geom.radius, marks: planMarks(next, geom) };
          draw();
          return;
        }
        plan = null;
        if (pane === "focus") unpaint();
        listen();
        note("focus", "");
      },
      togglePick() {
        setPicking(!picking);
      },
      /** Show the open pane's marks; null shows none. Disarms a pick. */
      setPane(next) {
        pane = next;
        setPicking(false);
        if (top.length || selected || plan) draw();
      },
      clearTop,
      /** Follow the setting. Off hides the marks and disarms a pick; on shows them again. */
      setEnabled(on) {
        if (on === enabled) return;
        if (!on) {
          onNote("scan", "");
          onNote("focus", "");
          setPicking(false);
        }
        enabled = on;
        if (!on || top.length || selected || plan) draw();
      }
    };
  }

  // src/settings-store.js
  var STORAGE_KEY = "illyriad-sov-scanner.settings";
  var STORAGE_VERSION = 2;
  var MIGRATIONS = {
    // Version 1 had the Chancery as a tick-box; it is now a building count.
    1: ({ chancery, ...rest }) => ({
      ...rest,
      upkeepBuildings: { ...rest.upkeepBuildings, chanceryOfEstates: chancery ? 1 : 0 }
    })
  };
  function migrate(body, from) {
    let out = body;
    for (let v = from; v < STORAGE_VERSION; v++) {
      const step = MIGRATIONS[v];
      if (!step) break;
      out = step(out);
    }
    return out;
  }
  function sanitizeSettings(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    const out = {};
    for (const f of SETTINGS_FIELDS) {
      const v = src[f.key];
      const fallback = DEFAULT_SETTINGS[f.key];
      switch (f.type) {
        case "checkbox":
          out[f.key] = v === void 0 ? !!fallback : !!v;
          break;
        case "select": {
          const known = f.options.some((o) => String(o.value) === String(v));
          out[f.key] = known ? f.parse === "number" ? Number(v) : String(v) : fallback;
          break;
        }
        case "plots": {
          const r = validatePlots(v);
          out.plots = r.ok ? r.plots : { ...fallback };
          break;
        }
        case "milsov":
          out.milsovStructure = parseMilsovStructure(v);
          break;
        case "calibration":
          out.rpCalibration = parseRpCalibration(v?.observedRpPerHour, v?.atTax, v?.prestige);
          break;
        case "boosters":
          out.resourceBoosters = parseResourceBoosters(v);
          break;
        case "upkeepBuildings":
          out.upkeepBuildings = parseUpkeepBuildings(v);
          break;
        case "prestige":
          out.prestige = parsePrestige(v);
          break;
        case "minimums":
          out.resourceMinimums = parseResourceMinimums(v);
          break;
        case "terrains":
          out.siteTerrains = parseSiteTerrains(v);
          break;
        default:
          out[f.key] = clampNumber(v, { ...f, fallback: f.fallback ?? fallback ?? 0 });
      }
    }
    return out;
  }
  function driftNote(stored) {
    const declared = SETTINGS_FIELDS.map((f) => f.key);
    const storedKeys = Object.keys(stored);
    const added = declared.filter((k) => !storedKeys.includes(k));
    const gone = storedKeys.filter((k) => !declared.includes(k));
    if (!added.length && !gone.length) return "";
    const parts = [];
    if (added.length) {
      parts.push(added.length > 1 ? `${added.length} new settings are at their defaults` : "1 new setting is at its default");
    }
    if (gone.length) parts.push(`${gone.length} no longer exist${gone.length > 1 ? "" : "s"}`);
    return `Settings restored from an older build \u2014 ${parts.join(", ")}.`;
  }
  function encodeSettings(settings2) {
    return JSON.stringify({
      version: STORAGE_VERSION,
      savedAt: (/* @__PURE__ */ new Date()).toISOString(),
      settings: sanitizeSettings(settings2)
    });
  }
  function decodeSettings(text) {
    if (text === null || text === void 0 || text === "") return { settings: null, note: "" };
    const unreadable = () => ({
      settings: sanitizeSettings({}),
      note: "Saved settings were unreadable \u2014 defaults restored."
    });
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return unreadable();
    }
    const body = parsed?.settings ?? parsed;
    if (!body || typeof body !== "object" || Array.isArray(body)) return unreadable();
    const version = Number.isInteger(parsed?.version) ? parsed.version : STORAGE_VERSION;
    if (version > STORAGE_VERSION) {
      return {
        settings: sanitizeSettings(body),
        note: "Settings were saved by a newer build \u2014 what it knows and this one does not is at its default here."
      };
    }
    let migrated;
    try {
      migrated = migrate(body, version);
    } catch {
      migrated = body;
    }
    return { settings: sanitizeSettings(migrated), note: driftNote(migrated) };
  }
  function memoryStorage() {
    const map = /* @__PURE__ */ new Map();
    return {
      getItem: (k) => map.has(k) ? map.get(k) : null,
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k)
    };
  }
  function defaultStorage() {
    try {
      const ls = globalThis.localStorage;
      const probe = `${STORAGE_KEY}.probe`;
      ls.setItem(probe, "1");
      ls.removeItem(probe);
      return ls;
    } catch {
      return null;
    }
  }
  function createSettingsStore(storage = defaultStorage()) {
    const unavailable = !storage;
    const store2 = storage ?? memoryStorage();
    return {
      available: !unavailable,
      load() {
        if (unavailable) {
          return {
            settings: sanitizeSettings({}),
            note: "This browser is not allowing local storage, so settings last for this session only."
          };
        }
        try {
          return decodeSettings(store2.getItem(STORAGE_KEY));
        } catch {
          return { settings: sanitizeSettings({}), note: "Saved settings could not be read \u2014 defaults restored." };
        }
      },
      save(settings2) {
        if (unavailable) return "";
        try {
          store2.setItem(STORAGE_KEY, encodeSettings(settings2));
          return "";
        } catch {
          return "Settings could not be saved \u2014 this browser refused the write.";
        }
      },
      clear() {
        try {
          store2.removeItem(STORAGE_KEY);
        } catch {
        }
      }
    };
  }

  // src/main.js
  var workerUrl = URL.createObjectURL(
    new Blob([`(() => {
  // src/constants.js
  var WORLD_MIN_X = -1e3;
  var WORLD_MAX_X = 1e3;
  var WORLD_MIN_Y = -3300;
  var WORLD_MAX_Y = 1e3;
  var PRODUCTION_BASE = 125;
  var FARM_YIELD_L20 = 2014;
  var GOLD_PER_TAX_POP = 0.04;
  var CLAIM_RP_PER_LEVEL_DISTANCE = 10;
  var CLAIM_GOLD_PER_LEVEL_DISTANCE = 100;
  var CLAIM_DISTANCE_DECIMALS = 2;
  var CHANCERY_DISCOUNT_L20 = 0.4;
  var FOOD_CLAIM_LEVEL = 5;
  var MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };
  var MILSOV_UPKEEP_STEP = [1, 2, 3, 4, 5].map(
    (level) => MILSOV_UPKEEP_BY_LEVEL[level] - (MILSOV_UPKEEP_BY_LEVEL[level - 1] ?? 0)
  );
  var MILSOV_MAX_LEVEL = 5;
  var MILSOV_BONUS_PER_LEVEL = 5;
  var SOV_STRUCTURES = [
    { key: "trainingGround", name: "Training Ground", type: "production", military: true },
    { key: "targetRange", name: "Target Range", type: "production", military: true },
    { key: "militaryAcademy", name: "Military Academy", type: "production", military: true },
    { key: "joustingYard", name: "Jousting Yard", type: "production", military: true },
    { key: "assemblyYard", name: "Assembly Yard", type: "production", military: true },
    // Crafting structures: not offered, but terrain descriptors name them.
    { key: "cattleRancher", name: "Cattle Rancher", type: "production" },
    { key: "bladesmith", name: "Bladesmith", type: "production" },
    { key: "renderer", name: "Renderer", type: "production" },
    { key: "farrier", name: "Farrier", type: "production" },
    { key: "bowyer", name: "Bowyer", type: "production" },
    { key: "poleturner", name: "Poleturner", type: "production" },
    { key: "bridlemaker", name: "Bridlemaker", type: "production" },
    { key: "plateForger", name: "Plate Forger", type: "production" },
    { key: "armourer", name: "Armourer", type: "production" },
    { key: "engineeringYard", name: "Engineering Yard", type: "production" },
    { key: "papermill", name: "Papermill", type: "production" },
    { key: "brewersYard", name: "Brewer's Yard", type: "production" },
    { key: "finishingSchool", name: "Finishing School", type: "production" },
    { key: "loggingCamp", name: "Logging Camp", type: "resource", boosts: "wood" },
    { key: "earthworks", name: "Earthworks", type: "resource", boosts: "clay" },
    { key: "mineshaft", name: "Mineshaft", type: "resource", boosts: "iron" },
    { key: "gravelPit", name: "Gravel Pit", type: "resource", boosts: "stone" },
    { key: "farmstead", name: "Farmstead", type: "resource", boosts: "food" },
    { key: "fishery", name: "Fishery", type: "resource", boosts: "food" }
  ];
  var SOV_STRUCTURE_BY_KEY = Object.fromEntries(SOV_STRUCTURES.map((s) => [s.key, s]));
  var MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.military);
  var DEFAULT_SOV_STRUCTURE = "trainingGround";
  var TERRAIN_DESCRIPTORS = {
    1: { name: "Plains" },
    2: { name: "Plains" },
    5: { name: "Plains" },
    6: { name: "Rich Clay Seam", bonus: 3, product: "Books", building: "Papermill" },
    7: { name: "Abundant Clay", bonus: 2, product: "Books", building: "Papermill" },
    8: { name: "Exposed Clay", bonus: 1, product: "Leather Armour", building: "Renderer" },
    9: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },
    10: { name: "Turned Clay", bonus: 2, product: "Saddles", building: "Bridlemaker" },
    11: { name: "Heavy Clay Seam", bonus: 1, product: "Saddles", building: "Bridlemaker" },
    12: { name: "Abundant Crops", bonus: 3, product: "Beer", building: "Brewer's Yard" },
    13: { name: "Bountiful Land", bonus: 3, product: "Livestock", building: "Cattle Rancher" },
    14: { name: "Fertile Pasture", bonus: 2, product: "Cavalry Units", building: "Jousting Yard" },
    15: { name: "Fertile Orchard", bonus: 1, product: "Beer", building: "Brewer's Yard" },
    16: { name: "Alluvial Plain", bonus: 1, product: "Livestock", building: "Cattle Rancher" },
    17: { name: "Fertile Ground", bonus: 1, product: "Horses", building: "Farrier" },
    18: { name: "Lake", water: true },
    19: { name: "Loch", water: true },
    20: { name: "Volcanic Peak", impassable: true },
    21: { name: "Fiery Mountain", impassable: true },
    22: { name: "Canyon", impassable: true },
    23: { name: "Swampland", impassable: true },
    24: { name: "Craggy Peaks", bonus: 3, product: "Chainmail", building: "Armourer" },
    25: {
      name: "Bleak Mountains",
      bonus: 2,
      product: "Diplomatic Units",
      building: "Finishing School"
    },
    26: { name: "Lonely Peaks", bonus: 1, product: "Platesteel", building: "Plate Forger" },
    27: { name: "Sharp Crags", bonus: 3, product: "Swords", building: "Bladesmith" },
    28: { name: "Treacherous Mountains", bonus: 2, product: "Beer", building: "Brewer's Yard" },
    29: { name: "Mountains", bonus: 1, product: "Swords", building: "Bladesmith" },
    30: {
      name: "Scrubland",
      bonus: 1,
      product: "Diplomatic Units",
      building: "Finishing School"
    },
    31: { name: "Clearing", bonus: 1, product: "Ranged Units", building: "Target Range" },
    32: { name: "Tundra", bonus: 1, product: "Spear Units", building: "Training Ground" },
    33: { name: "Open Plains", bonus: 1, product: "Cavalry Units", building: "Jousting Yard" },
    34: { name: "Moor", bonus: 1, product: "Infantry Units", building: "Military Academy" },
    35: { name: "Plains" },
    36: { name: "Plains" },
    37: { name: "Plains" },
    38: { name: "Plains" },
    39: { name: "Plains" },
    40: { name: "Standing Stones" },
    42: { name: "Abandoned Mineshaft" },
    43: { name: "Ruined Tower" },
    44: { name: "Ancient Forest" },
    45: { name: "Dolmen" },
    46: { name: "Abundant Quarry", bonus: 3, product: "Platesteel", building: "Plate Forger" },
    47: { name: "Rich Quarry", bonus: 2, product: "Infantry Units", building: "Military Academy" },
    48: { name: "Wooded Quarry", bonus: 1, product: "Siege Units", building: "Assembly Yard" },
    49: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },
    50: { name: "Landslip", bonus: 2, product: "Siege Units", building: "Assembly Yard" },
    51: { name: "Stony Ground", bonus: 1, product: "Chainmail", building: "Armourer" },
    52: { name: "Thick Forest", bonus: 3, product: "Bows", building: "Bowyer" },
    53: { name: "Dense Forest", bonus: 2, product: "Ranged Units", building: "Target Range" },
    54: { name: "Forested Hilltop", bonus: 1, product: "Bows", building: "Bowyer" },
    55: { name: "Wooded Land", bonus: 3, product: "Spears", building: "Poleturner" },
    56: { name: "Wooded Glade", bonus: 2, product: "Spear Units", building: "Training Ground" },
    57: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },
    58: { name: "Plains" },
    59: { name: "Fresh Water", water: true },
    66: { name: "Faction Hub", settlement: true },
    67: { name: "Forbidden", impassable: true },
    80: { name: "Drumlin" },
    68: { name: "Barren Wastes", bonus: 3, product: "Spear Units", building: "Training Ground" },
    69: { name: "Glacier" },
    70: { name: "Frozen Ground" },
    71: { name: "Nunatak", bonus: 3, product: "Siege Units", building: "Assembly Yard" },
    72: {
      name: "Scoured Bedrock",
      bonus: 2,
      product: "Infantry Units",
      building: "Military Academy"
    },
    73: { name: "Icefield" },
    74: { name: "Glacial Crevasse" },
    75: { name: "Ice cave" },
    77: {
      name: "Rogen Moraine",
      bonus: 1,
      product: "Ranged Units",
      building: "Target Range"
    },
    78: { name: "Moraine", bonus: 2, product: "Chainmail", building: "Armourer" },
    79: { name: "Kame" },
    81: {
      name: "Roche Moutonnee",
      bonus: 1,
      product: "Chainmail",
      building: "Armourer"
    },
    82: { name: "Ice Holes" },
    83: { name: "Scrubland" },
    84: { name: "Permafrost" },
    85: { name: "Icy Moss" },
    86: { name: "Frosty Heath" },
    87: {
      name: "Lichen",
      bonus: 1,
      product: "Livestock",
      building: "Cattle Rancher"
    },
    89: { name: "Swamp", bonus: 2, product: "Bows", building: "Bowyer" },
    90: { name: "Marsh", bonus: 3, product: "Spears", building: "Poleturner" },
    91: { name: "Bog" },
    92: { name: "Mire" },
    41: { name: "Barrow" },
    95: { name: "Playa" },
    101: { name: "Cactus", bonus: 3, product: "Horses", building: "Farrier" },
    103: { name: "Tropical Foliage", bonus: 1, product: "Bows", building: "Bowyer" },
    104: { name: "Light Tropical Cover" },
    105: { name: "Palm Trees", bonus: 1, product: "Spears", building: "Poleturner" },
    106: { name: "Dense Foliage", bonus: 1, product: "Books", building: "Papermill" },
    107: { name: "Dense Tropical Forest", bonus: 2, product: "Bows", building: "Bowyer" },
    108: { name: "Tropical Hilltop" },
    109: { name: "Monsoon Jungle", bonus: 2, product: "Spear Units", building: "Training Ground" },
    110: { name: "Jungle" },
    111: { name: "Damp Jungle" },
    112: { name: "Dense Jungle", bonus: 2, product: "Spears", building: "Poleturner" },
    113: { name: "Dense Monsoon Jungle", bonus: 2, product: "Books", building: "Papermill" },
    114: { name: "Monsoon Hilltop" },
    115: { name: "Light Rainforest" },
    116: { name: "Rainforest Canopy", bonus: 3, product: "Bows", building: "Bowyer" },
    117: { name: "Rainforest" },
    118: { name: "Dense Rainforest" },
    119: { name: "Thick Rainforest", bonus: 3, product: "Spears", building: "Poleturner" },
    120: { name: "Rainforest Hilltop", bonus: 3, product: "Books", building: "Papermill" },
    121: { name: "Succulents" },
    122: { name: "Dry tundra" },
    124: { name: "Faerie Ring" },
    127: { name: "Stone Circle" },
    128: { name: "Mountain Cave" },
    129: { name: "Pyramids" },
    130: { name: "Sphinx" },
    139: { name: "Blessed Oak" },
    142: { name: "Mausoleum" },
    143: { name: "Dark Forest" },
    144: { name: "Ancient Lair" },
    146: { name: "Deserted Wayhouse" },
    147: { name: "Rockhewn Monastery" },
    150: { name: "Hidden Temple" },
    151: { name: "Place of High Sacrifice" },
    152: { name: "Crooked House" },
    153: { name: "Deserted Monastery" },
    156: { name: "Abandoned Campsite" },
    205: { name: "Glassy Mountain" },
    209: { name: "Ancient Graveyard" },
    211: { name: "Dormant Portal" },
    213: { name: "Fortified Hostel" },
    214: { name: "Lawstones" },
    215: { name: "Sacrificial Altar" },
    217: { name: "Weeping Willow" },
    222: { name: "Head Statue" },
    223: { name: "Jungle Standing Stones" },
    224: { name: "Shattered Head" },
    // Every terrain the world contains has a row. The ids still missing are named
    // by the client but appear nowhere in the world.
    3: { name: "Plains" },
    63: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },
    64: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },
    65: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },
    76: { name: "Tarn" },
    88: { name: "Petrified Forest" },
    93: { name: "Sand Dune" },
    94: { name: "Oasis", bonus: 3, product: "Livestock", building: "Cattle Rancher" },
    96: { name: "Yardang" },
    97: { name: "Mesa", bonus: 3, product: "Platesteel", building: "Plate Forger" },
    98: { name: "Rocky Mountain" },
    99: { name: "Hamada (Stone Plateau)" },
    100: { name: "Reg (Gravel Plain)" },
    102: { name: "Wadi" },
    60: { name: "Tidal Water", water: true },
    61: { name: "Shallow Salt Water", water: true },
    62: { name: "Ocean", water: true },
    172: { name: "Bankside" },
    173: { name: "Beach" },
    174: { name: "Shallow Coastline" },
    175: { name: "Coast" },
    198: { name: "Dead Water", water: true },
    // Volcanic terrains: zero on every plot, but passable, unlike i:20-23.
    199: { name: "Obsidian Mountain" },
    200: { name: "Glassy Crag" },
    201: { name: "Volcanic Mountain" },
    202: { name: "Lava Peak" },
    203: { name: "Active Peak" },
    204: { name: "Emerging Mountaintop" },
    206: { name: "Lava Pool" },
    207: { name: "Magma Rift" },
    194: { name: "Scorched Forest" },
    195: { name: "Petrified Forest" },
    196: { name: "Deadvlei Forest" },
    123: { name: "Geyser" },
    131: { name: "Obelisk" },
    135: { name: "Heroic Human Statue" },
    145: { name: "Abandoned Lodge" },
    148: { name: "House of the Spirits" },
    149: { name: "Forgotten Temple" },
    155: { name: "Gypsy Campsite" },
    157: { name: "Fortune Teller" },
    158: { name: "Fortress of Shadows" },
    161: { name: "Temple of Reason" },
    162: { name: "Steamtastic Brewery" },
    163: { name: "Brewery Outbuildings" },
    164: { name: "Cylindroconical Vessels" },
    167: { name: "Altar of Water" },
    168: { name: "Altar of Fire" },
    169: { name: "Altar of Air" },
    170: { name: "Altar of Earth" },
    197: { name: "Parched Bones" },
    208: { name: "Abandoned Lair" },
    210: { name: "Broken Tower" },
    212: { name: "Fallen Dwarfhold" },
    216: { name: "Tiki Pole" },
    218: { name: "Crumbling Lighthouse" },
    219: { name: "Fisherman's Hut" },
    221: { name: "Ferry Post" }
  };
  var TERRAIN_NAMES = [
    null,
    // 0 - unused; the client's array starts at 1
    ["Plains", "Plains"],
    // 1
    ["Plains", "Plains"],
    // 2
    ["Plains", "Plains"],
    // 3
    ["Town", "Buildings"],
    // 4
    ["Plains", "Plains"],
    // 5
    ["Rich Clay Seam", "Large Hill"],
    // 6
    ["Abundant Clay", "Large Hill"],
    // 7
    ["Exposed Clay", "Small Hill"],
    // 8
    ["Clay Seam", "Small Hill"],
    // 9
    ["Turned Clay", "Large Hill"],
    // 10
    ["Heavy Clay Seam", "Small Hill"],
    // 11
    ["Abundant Crops", "Plains"],
    // 12
    ["Bountiful Land", "Plains"],
    // 13
    ["Fertile Pasture", "Plains"],
    // 14
    ["Fertile Orchard", "Plains"],
    // 15
    ["Alluvial Plain", "Plains"],
    // 16
    ["Fertile Ground", "Plains"],
    // 17
    ["Lake", "Small Hill"],
    // 18
    ["Loch", "Small Hill"],
    // 19
    ["Volcanic Peak", "Impassable"],
    // 20
    ["Fiery Mountain", "Impassable"],
    // 21
    ["Canyon", "Impassable"],
    // 22
    ["Swampland", "Impassable"],
    // 23
    ["Craggy Peaks", "Large Mountain"],
    // 24
    ["Bleak Mountains", "Large Mountain"],
    // 25
    ["Lonely Peaks", "Large Mountain"],
    // 26
    ["Sharp Crags", "Small Mountain"],
    // 27
    ["Treacherous Mountains", "Small Mountain"],
    // 28
    ["Mountains", "Small Mountain"],
    // 29
    ["Scrubland", "Plains"],
    // 30
    ["Clearing", "Plains"],
    // 31
    ["Tundra", "Plains"],
    // 32
    ["Open Plains", "Plains"],
    // 33
    ["Moor", "Plains"],
    // 34
    ["Plains", "Plains"],
    // 35
    ["Plains", "Plains"],
    // 36
    ["Plains", "Plains"],
    // 37
    ["Plains", "Plains"],
    // 38
    ["Plains", "Plains"],
    // 39
    ["Standing Stones", "Plains"],
    // 40
    ["Barrow", "Small Hill"],
    // 41
    ["Abandoned Mineshaft", "Large Mountain"],
    // 42
    ["Ruined Tower", "Buildings"],
    // 43
    ["Ancient Forest", "Large Forest"],
    // 44
    ["Dolmen", "Plains"],
    // 45
    ["Abundant Quarry", "Small Mountain"],
    // 46
    ["Rich Quarry", "Small Mountain"],
    // 47
    ["Wooded Quarry", "Large Hill"],
    // 48
    ["Rocky Outcrop", "Large Hill"],
    // 49
    ["Landslip", "Small Hill"],
    // 50
    ["Stony Ground", "Large Hill"],
    // 51
    ["Thick Forest", "Large Forest"],
    // 52
    ["Dense Forest", "Large Forest"],
    // 53
    ["Forested Hilltop", "Large Forest"],
    // 54
    ["Wooded Land", "Small Forest"],
    // 55
    ["Wooded Glade", "Small Forest"],
    // 56
    ["Light Woods", "Small Forest"],
    // 57
    ["Plains", "Plains"],
    // 58
    ["Fresh Water", "Fresh Water"],
    // 59
    ["Tidal Water", "Tidal Water"],
    // 60
    ["Shallow Salt Water", "Shallow Salt Water"],
    // 61
    ["Ocean", "Ocean"],
    // 62
    ["Light Woods", "Small Forest"],
    // 63
    ["Rocky Outcrop", "Large Hill"],
    // 64
    ["Clay Seam", "Small Hill"],
    // 65
    ["Faction Hub", "Buildings"],
    // 66
    ["Forbidden", "Buildings"],
    // 67
    ["Barren Wastes", "Plains"],
    // 68
    ["Glacier", "Small Hill"],
    // 69
    ["Frozen Ground", "Plains"],
    // 70
    ["Nunatak", "Small Mountain"],
    // 71
    ["Scoured Bedrock", "Large Hill"],
    // 72
    ["Icefield", "Plains"],
    // 73
    ["Glacial Crevasse", "Large Hill"],
    // 74
    ["Ice cave", "Small Mountain"],
    // 75
    ["Tarn", "Small Hill"],
    // 76
    ["Rogen Moraine", "Large Hill"],
    // 77
    ["Moraine", "Small Mountain"],
    // 78
    ["Kame", "Small Hill"],
    // 79
    ["Drumlin", "Large Hill"],
    // 80
    ["Roche Moutonnee", "Small Mountain"],
    // 81
    ["Ice Holes", "Plains"],
    // 82
    ["Scrubland", "Plains"],
    // 83
    ["Permafrost", "Plains"],
    // 84
    ["Icy Moss", "Plains"],
    // 85
    ["Frosty Heath", "Plains"],
    // 86
    ["Lichen", "Plains"],
    // 87
    ["Petrified Forest", "Small Forest"],
    // 88
    ["Swamp", "Small Hill"],
    // 89
    ["Marsh", "Large Hill"],
    // 90
    ["Bog", "Small Mountain"],
    // 91
    ["Mire", "Large Mountain"],
    // 92
    ["Sand Dune", "Large Hill"],
    // 93
    ["Oasis", "Small Forest"],
    // 94
    ["Playa", "Plains"],
    // 95
    ["Yardang", "Small Hill"],
    // 96
    ["Mesa", "Large Mountain"],
    // 97
    ["Rocky Mountain", "Small Mountain"],
    // 98
    ["Hamada (Stone Plateau)", "Large Hill"],
    // 99
    ["Reg (Gravel Plain)", "Plains"],
    // 100
    ["Cactus", "Plains"],
    // 101
    ["Wadi", "Plains"],
    // 102
    ["Tropical Foliage", "Small Forest"],
    // 103
    ["Light Tropical Cover", "Small Forest"],
    // 104
    ["Palm Trees", "Small Forest"],
    // 105
    ["Dense Foliage", "Large Forest"],
    // 106
    ["Dense Tropical Forest", "Large Forest"],
    // 107
    ["Tropical Hilltop", "Large Forest"],
    // 108
    ["Monsoon Jungle", "Small Forest"],
    // 109
    ["Jungle", "Small Forest"],
    // 110
    ["Damp Jungle", "Small Forest"],
    // 111
    ["Dense Jungle", "Large Forest"],
    // 112
    ["Dense Monsoon Jungle", "Large Forest"],
    // 113
    ["Monsoon Hilltop", "Large Forest"],
    // 114
    ["Light Rainforest", "Small Forest"],
    // 115
    ["Rainforest Canopy", "Small Forest"],
    // 116
    ["Rainforest", "Small Forest"],
    // 117
    ["Dense Rainforest", "Large Forest"],
    // 118
    ["Thick Rainforest", "Large Forest"],
    // 119
    ["Rainforest Hilltop", "Large Forest"],
    // 120
    ["Succulents", "Plains"],
    // 121
    ["Dry tundra", "Plains"],
    // 122
    ["Geyser", "Plains"],
    // 123
    ["Faerie Ring", "Plains"],
    // 124
    ["Cairn", "Small Mountain"],
    // 125
    ["Lighthouse", "Buildings"],
    // 126
    ["Stone Circle", "Plains"],
    // 127
    ["Mountain Cave", "Large Mountain"],
    // 128
    ["Pyramids", "Buildings"],
    // 129
    ["Sphinx", "Plains"],
    // 130
    ["Obelisk", "Plains"],
    // 131
    ["Clock Tower", "Buildings"],
    // 132
    ["Column", "Plains"],
    // 133
    ["Dragon Monument", "Plains"],
    // 134
    ["Heroic Human Statue", "Plains"],
    // 135
    ["Elf Monument", "Plains"],
    // 136
    ["Dwarf Monument", "Plains"],
    // 137
    ["Orc Monument", "Plains"],
    // 138
    ["Blessed Oak", "Large Forest"],
    // 139
    ["Ornamental Gardens", "Plains"],
    // 140
    ["Ornamental Gardens", "Plains"],
    // 141
    ["Mausoleum", "Buildings"],
    // 142
    ["Dark Forest", "Large Forest"],
    // 143
    ["Ancient Lair", "Small Mountain"],
    // 144
    ["Abandoned Lodge", "Buildings"],
    // 145
    ["Deserted Wayhouse", "Buildings"],
    // 146
    ["Rockhewn Monastery", "Buildings"],
    // 147
    ["House of the Spirits", "Buildings"],
    // 148
    ["Forgotten Temple", "Buildings"],
    // 149
    ["Hidden Temple", "Buildings"],
    // 150
    ["Place of High Sacrifice", "Buildings"],
    // 151
    ["Crooked House", "Buildings"],
    // 152
    ["Deserted Monastery", "Buildings"],
    // 153
    ["Dark Temple", "Buildings"],
    // 154
    ["Gypsy Campsite", "Plains"],
    // 155
    ["Abandoned Campsite", "Plains"],
    // 156
    ["Fortune Teller", "Plains"],
    // 157
    ["Fortress of Shadows", "Buildings"],
    // 158
    ["Ancient Claws", "Buildings"],
    // 159
    ["Gathering Place", "Plains"],
    // 160
    ["Temple of Reason", "Buildings"],
    // 161
    ["Steamtastic Brewery", "Buildings"],
    // 162
    ["Brewery Outbuildings", "Buildings"],
    // 163
    ["Cylindroconical Vessels", "Buildings"],
    // 164
    ["Mystic Tomb", "Buildings"],
    // 165
    ["Corrupted Land", "Large Forest"],
    // 166
    ["Altar of Water", "Large Forest"],
    // 167
    ["Altar of Fire", "Plains"],
    // 168
    ["Altar of Air", "Large Hill"],
    // 169
    ["Altar of Earth", "Large Mountain"],
    // 170
    ["Activated Standing Stones", "Plains"],
    // 171
    ["Bankside", "Plains"],
    // 172
    ["Beach", "Plains"],
    // 173
    ["Shallow Coastline", "Plains"],
    // 174
    ["Coast", "Plains"],
    // 175
    ["Coniferous Thick Forest", "Large Forest"],
    // 176
    ["Coniferous Dense Forest", "Large Forest"],
    // 177
    ["Coniferous Forested Hilltop", "Large Forest"],
    // 178
    ["Coniferous Wooded Land", "Small Forest"],
    // 179
    ["Coniferous Wooded Glade", "Small Forest"],
    // 180
    ["Coniferous Light Woods", "Small Forest"],
    // 181
    ["Snowy Thick Forest", "Large Forest"],
    // 182
    ["Snowy Dense Forest", "Large Forest"],
    // 183
    ["Snowy Forested Hilltop", "Large Forest"],
    // 184
    ["Snowy Wooded Land", "Small Forest"],
    // 185
    ["Snowy Wooded Glade", "Small Forest"],
    // 186
    ["Snowy Light Woods", "Small Forest"],
    // 187
    ["Temperate Thick Forest", "Large Forest"],
    // 188
    ["Temperate Dense Forest", "Large Forest"],
    // 189
    ["Temperate Forested Hilltop", "Large Forest"],
    // 190
    ["Temperate Wooded Land", "Small Forest"],
    // 191
    ["Temperate Wooded Glade", "Small Forest"],
    // 192
    ["Temperate Light Woods", "Small Forest"],
    // 193
    ["Scorched Forest", "Large Forest"],
    // 194
    ["Petrified Forest", "Large Forest"],
    // 195
    ["Deadvlei Forest", "Large Forest"],
    // 196
    ["Parched Bones", "Plains"],
    // 197
    ["Dead Water", "Ocean"],
    // 198
    ["Obsidian Mountain", "Obsidian Mountains"],
    // 199
    ["Glassy Crag", "Obsidian Mountains"],
    // 200
    ["Volcanic Mountain", "Obsidian Mountains"],
    // 201
    ["Lava Peak", "Obsidian Mountains"],
    // 202
    ["Active Peak", "Obsidian Mountains"],
    // 203
    ["Emerging Mountaintop", "Obsidian Mountains"],
    // 204
    ["Glassy Mountain", "Obsidian Mountains"],
    // 205
    ["Lava Pool", "Obsidian Mountains"],
    // 206
    ["Magma Rift", "Obsidian Mountains"],
    // 207
    ["Abandoned Lair", "Buildings"],
    // 208
    ["Ancient Graveyard", "Buildings"],
    // 209
    ["Broken Tower", "Buildings"],
    // 210
    ["Dormant Portal", "Buildings"],
    // 211
    ["Fallen Dwarfhold", "Buildings"],
    // 212
    ["Fortified Hostel", "Buildings"],
    // 213
    ["Lawstones", "Buildings"],
    // 214
    ["Sacrificial Altar", "Buildings"],
    // 215
    ["Tiki Pole", "Small Forest"],
    // 216
    ["Weeping Willow", "Small Forest"],
    // 217
    ["Crumbling Lighthouse", "Buildings"],
    // 218
    ["Fisherman's Hut", "Buildings"],
    // 219
    ["Seahenge", "Buildings"],
    // 220
    ["Ferry Post", "Buildings"],
    // 221
    ["Head Statue", "Buildings"],
    // 222
    ["Jungle Standing Stones", "Buildings"],
    // 223
    ["Shattered Head", "Buildings"],
    // 224
    ["Shipwreck", "Buildings"],
    // 225
    ["Shipwreck", "Buildings"],
    // 226
    ["Shipwreck", "Buildings"],
    // 227
    ["Shipwreck", "Buildings"],
    // 228
    ["Shipwreck", "Buildings"]
    // 229
  ];
  var NODE_CLASS_TERRAIN = /* @__PURE__ */ new Set([40, 41, 42, 43, 44, 45]);
  var SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));
  function descriptorFor(i) {
    const named = TERRAIN_NAMES[i];
    const entry = TERRAIN_DESCRIPTORS[i];
    if (!named && !entry) return null;
    const base = {
      i,
      name: named?.[0] ?? entry.name,
      terrainClass: named?.[1],
      nodeClass: NODE_CLASS_TERRAIN.has(i) || void 0
    };
    if (!entry) return { ...base, bonusUnread: true, conditional: false, sovKey: null };
    const sov = entry.building ? SOV_STRUCTURE_BY_NAME.get(entry.building) : void 0;
    return {
      ...entry,
      ...base,
      sovKey: sov?.key ?? null,
      conditional: !!entry.building && !sov
    };
  }
  var BASIC_RESOURCES = ["wood", "clay", "iron", "stone"];
  var RESOURCE_BOOSTER_BONUS = 40;
  var UPKEEP_BUILDINGS = [
    { key: "spearmensBillets", group: "Military", name: "Spearmens' Billets", consumes: { clay: 2700, iron: 1100 } },
    { key: "archersField", group: "Military", name: "Archers' Field", consumes: { wood: 2700, iron: 1100 } },
    { key: "infantryQuarters", group: "Military", name: "Infantry Quarters", consumes: { iron: 1100, stone: 2700 } },
    { key: "cavalryParadeGround", group: "Military", name: "Cavalry Parade Ground", consumes: { wood: 1100, clay: 2700 } },
    { key: "arcticWarfareCollege", group: "Military", name: "Arctic Warfare College", consumes: { iron: 1e3, stone: 2300 } },
    { key: "desertWarfareCollege", group: "Military", name: "Desert Warfare College", consumes: { clay: 2300, stone: 1e3 } },
    { key: "jungleWarfareCollege", group: "Military", name: "Jungle Warfare College", consumes: { wood: 2300, clay: 1e3 } },
    { key: "scoutsLookout", group: "Diplomacy", name: "Scouts' Lookout", consumes: { wood: 700, clay: 1500 } },
    { key: "spiesHideout", group: "Diplomacy", name: "Spies' Hideout", consumes: { wood: 700, clay: 1100, stone: 1100 } },
    { key: "thievesDen", group: "Diplomacy", name: "Thieves' Den", consumes: { wood: 1700, clay: 1100, iron: 1700 } },
    { key: "saboteursSanctuary", group: "Diplomacy", name: "Saboteurs' Sanctuary", consumes: { wood: 2700, clay: 1500 } },
    { key: "assassinsAbode", group: "Diplomacy", name: "Assassins' Abode", consumes: { iron: 3100, stone: 1900 } },
    { key: "foreignOffice", group: "Diplomacy", name: "Foreign Office", consumes: { clay: 400, iron: 800, stone: 1600 } },
    { key: "runemastersGrounding", group: "Magic", name: "Runemasters' Grounding", consumes: { clay: 900, stone: 1700 } },
    // Separate from geomancerRetreats: Nature's Bounty can be cast from another city.
    { key: "geomancersRetreat", group: "Magic", name: "Geomancers' Retreat", consumes: { wood: 700, clay: 2300, stone: 1500 } },
    {
      key: "chanceryOfEstates",
      group: "Sovereignty",
      name: "Chancery of Estates",
      consumes: { wood: 800, clay: 3200, stone: 1600 },
      hint: \`Also takes \${CHANCERY_DISCOUNT_L20 * 100}% off the first level of every claim, and each further one half as much again.\`
    },
    { key: "tradeOffice", group: "Trade", name: "Trade Office", consumes: { wood: 2800, clay: 690, stone: 1580 } }
  ];
  var BASIC_YIELD_L20 = 2538;
  var PRESTIGE_PRODUCTION_BONUS = 20;
  var PRESTIGE_KEYS = [...BASIC_RESOURCES, "food", "research"];
  var MINIMUM_KEYS = [...BASIC_RESOURCES, "food", "research"];
  var DEFAULT_CITY_CONSUMPTION = 30800;
  var FLOUR_MILL_L20 = 40;
  var NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];
  var FAMINE_MANAGEMENT = 10;
  var SOIL_ENRICHMENT = 15;
  var LIBRARY_BASE_RP_L20 = 1013;
  var LIBRARY_LEVEL = 20;
  var ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;
  var ALLEMBINE_RP = ALLEMBINE_RP_PER_LIBRARY_LEVEL * LIBRARY_LEVEL;
  var OVERFLOWING_INSIGHT_FRACTION = 0.5;
  var OVERFLOWING_INSIGHT_RP = LIBRARY_BASE_RP_L20 * OVERFLOWING_INSIGHT_FRACTION;
  var DEFAULT_SETTINGS = {
    tMin: 50,
    plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 },
    // must sum to 25
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
    // \`prestige\` is whether the boost was running when the reading was taken.
    rpCalibration: null,
    resourceBoosters: { wood: false, clay: false, iron: false, stone: false },
    upkeepBuildings: Object.fromEntries(UPKEEP_BUILDINGS.map((b) => [b.key, 0])),
    // Surplus per hour the plan must leave free. Food is counted after what the
    // city eats, research after what the claims cost.
    resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 0, food: 0, research: 0 },
    prestige: {
      wood: false,
      clay: false,
      iron: false,
      stone: false,
      food: false,
      research: false
    },
    rClaim: 2,
    maxBuildings: 20,
    dOther: 10,
    dOwn: 3,
    // Confederates are not allies here, and use dOther.
    dAlliance: 3,
    // SETTLE_TERRAINS a site must stand on; empty allows any.
    siteTerrains: [],
    // Key into SOV_STRUCTURES; null plans food only.
    milsovStructure: null,
    // Sites below this military bonus are not listed; it never changes a plan.
    milsovMinBonus: 0,
    ownClaimsAvailable: false,
    autoMinimizeOffMap: true,
    mapOverlay: true
  };

  // src/scoring.js
  var EPS = 1e-9;
  function settableTax(t) {
    return Number.isFinite(t) ? Math.floor(t) : t;
  }
  function computeK(foodPlots) {
    return foodPlots * FARM_YIELD_L20 / 100;
  }
  function computeBOther(s) {
    let b = prestigeBonus(s, "food");
    if (s.flourMill) b += FLOUR_MILL_L20;
    if (s.naturesBounty) {
      const retreats = Math.min(s.geomancerRetreats ?? 0, 4);
      b += NATURES_BOUNTY_BY_RETREATS[retreats];
    }
    if (s.isCapital) {
      if ((s.cityCount ?? 1) >= 10) b += FAMINE_MANAGEMENT;
      if ((s.cityCount ?? 1) >= 30) b += SOIL_ENRICHMENT;
    }
    return b;
  }
  function computeConsumption(s) {
    return Number.isFinite(s.cityConsumption) ? s.cityConsumption : DEFAULT_CITY_CONSUMPTION;
  }
  function computeResearch(s) {
    const flat = (s.allembine ? ALLEMBINE_RP : 0) + (s.overflowingInsight ? OVERFLOWING_INSIGHT_RP : 0);
    const cal = s.rpCalibration;
    if (cal && cal.observedRpPerHour > 0) {
      const m = PRODUCTION_BASE - cal.atTax + (cal.prestige ? PRESTIGE_PRODUCTION_BONUS : 0);
      return { base: Math.max(0, (cal.observedRpPerHour - flat) * 100 / m), flat };
    }
    return { base: LIBRARY_BASE_RP_L20, flat };
  }
  function computeBasicYield() {
    return { yield: BASIC_YIELD_L20, measured: true };
  }
  function boosterBonus(s, resource) {
    return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;
  }
  function prestigeBonus(s, resource) {
    return s.prestige?.[resource] ? PRESTIGE_PRODUCTION_BONUS : 0;
  }
  function resourceBonus(s, resource) {
    return boosterBonus(s, resource) + prestigeBonus(s, resource);
  }
  function resourceMinimum(s, resource) {
    const v = s.resourceMinimums?.[resource];
    return Number.isFinite(v) && v > 0 ? v : 0;
  }
  function buildingUpkeep(s, resource) {
    let sum = 0;
    for (const b of UPKEEP_BUILDINGS) {
      sum += (s.upkeepBuildings?.[b.key] ?? 0) * (b.consumes[resource] ?? 0);
    }
    return sum;
  }
  function researchAt({ research, rpBonus = 0, tax }) {
    return research.base * (PRODUCTION_BASE - tax + rpBonus) / 100 + research.flat;
  }
  function basicProduction({ plots, yield: y, bonus, tax }) {
    return plots * y * (PRODUCTION_BASE - tax + bonus) / 100;
  }
  function distance(dx, dy) {
    const q = 10 ** CLAIM_DISTANCE_DECIMALS;
    return Math.round(Math.sqrt(dx * dx + dy * dy) * q) / q;
  }
  function chanceryFactor(s) {
    const n = s.upkeepBuildings?.chanceryOfEstates ?? 0;
    return 1 - 2 * CHANCERY_DISCOUNT_L20 * (1 - 0.5 ** n);
  }
  function claimRp(d, level, chancery) {
    if (level <= 0) return 0;
    return CLAIM_RP_PER_LEVEL_DISTANCE * d * (level - 1 + chancery);
  }
  function claimUpkeep(d, level, chancery = 1, held) {
    const from = held ?? 0;
    const rp = level > from ? claimRp(d, level, chancery) - claimRp(d, from, chancery) : 0;
    return { rp, gold: rp * CLAIM_GOLD_PER_LEVEL_DISTANCE / CLAIM_RP_PER_LEVEL_DISTANCE };
  }
  function sovStructure(entry) {
    return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];
  }
  function isProductionStructure(entry) {
    return sovStructure(entry).type === "production";
  }
  function structureUpkeep(entry) {
    return isProductionStructure(entry) ? MILSOV_UPKEEP_BY_LEVEL[entry?.buildingLevel] ?? 0 : 0;
  }
  function milsovUpkeep(entries) {
    return (entries ?? []).reduce((sum, e) => sum + structureUpkeep(e), 0);
  }
  function tFood({ bOther, sFood, consumption, k, minimum = 0 }) {
    return PRODUCTION_BASE + bOther + sFood - (consumption + minimum) / k;
  }
  function tRp({ uRp, research, rpBonus = 0, minimum = 0 }) {
    return PRODUCTION_BASE + rpBonus - 100 * (uRp + minimum - research.flat) / research.base;
  }
  function tRes({ milsovAssignments, plots, settings = {} }) {
    const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
    const upkeep = milsovUpkeep(milsovAssignments ?? []);
    const fixed = (res) => resourceMinimum(settings, res) + buildingUpkeep(settings, res);
    if (upkeep <= 0 && !BASIC_RESOURCES.some((res) => fixed(res) > 0)) return none;
    const { yield: y, measured } = computeBasicYield(settings);
    let worst = Infinity;
    let binding = null;
    for (const res of BASIC_RESOURCES) {
      const need = upkeep + fixed(res);
      const perPoint = plots[res] * y;
      const ceiling = perPoint > 0 ? PRODUCTION_BASE + resourceBonus(settings, res) - 100 * need / perPoint : need > 0 ? -Infinity : Infinity;
      if (ceiling < worst) {
        worst = ceiling;
        binding = res;
      }
    }
    return { ceiling: worst, indicative: !measured, binding, impossible: worst === -Infinity };
  }
  function surplusAt({ tax, settings, sFood, uRp, uGold, milsovAssignments }) {
    const s = settings;
    const k = computeK(s.plots.food);
    const upkeep = milsovUpkeep(milsovAssignments ?? []);
    const { yield: y, measured } = computeBasicYield(s);
    const consumption = computeConsumption(s);
    const base = {
      food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),
      rp: researchAt({ research: computeResearch(s), rpBonus: prestigeBonus(s, "research"), tax }),
      gold: GOLD_PER_TAX_POP * tax * consumption
    };
    const out = {
      tax,
      food: base.food - consumption,
      rp: base.rp - (uRp ?? 0),
      gold: base.gold - (uGold ?? 0),
      upkeep,
      buildingUpkeep: {},
      indicative: !measured
    };
    for (const res of BASIC_RESOURCES) {
      base[res] = basicProduction({
        plots: s.plots[res],
        yield: y,
        bonus: resourceBonus(s, res),
        tax
      });
      out.buildingUpkeep[res] = buildingUpkeep(s, res);
      out[res] = base[res] - upkeep - out.buildingUpkeep[res];
    }
    out.base = base;
    return out;
  }
  function tMax({ food, rp, res }) {
    const candidates = [
      { name: "cap", value: 100 },
      { name: "food", value: food },
      { name: "rp", value: rp },
      { name: "res", value: res }
    ];
    let best = candidates[0];
    for (const c of candidates) if (c.value < best.value) best = c;
    return { value: best.value, binding: best.name };
  }
  function claimGold(uRp, s) {
    return (uRp + (s?.keptClaimRp ?? 0)) * 10;
  }
  function goldNet({ tax, consumption, uGold }) {
    return GOLD_PER_TAX_POP * tax * consumption - uGold;
  }
  function knapsack(candidates, budget, maxItems = Infinity) {
    const needCountDim = candidates.length > maxItems;
    const width = budget + 1;
    const best = new Float64Array(width);
    if (!needCountDim) {
      const bytesPerItem = width;
      const took = new Uint8Array(candidates.length * bytesPerItem);
      for (let i = 0; i < candidates.length; i++) {
        const w = candidates[i].weight;
        const v = candidates[i].food;
        if (w > budget) continue;
        for (let cap = budget; cap >= w; cap--) {
          const alt = best[cap - w] + v;
          if (alt > best[cap]) {
            best[cap] = alt;
            took[i * bytesPerItem + cap] = 1;
          }
        }
      }
      return { best, took, bytesPerItem, countLimited: false };
    }
    const dp = [];
    for (let c = 0; c <= maxItems; c++) dp.push(new Float64Array(width).fill(-Infinity));
    dp[0].fill(0);
    const choice = [];
    for (let i = 0; i < candidates.length; i++) {
      choice.push(new Uint8Array((maxItems + 1) * width));
    }
    for (let i = 0; i < candidates.length; i++) {
      const w = candidates[i].weight;
      const v = candidates[i].food;
      for (let c = maxItems; c >= 1; c--) {
        for (let cap = budget; cap >= w; cap--) {
          const prev = dp[c - 1][cap - w];
          if (prev === -Infinity) continue;
          const alt = prev + v;
          if (alt > dp[c][cap]) {
            dp[c][cap] = alt;
            choice[i][c * width + cap] = 1;
          }
        }
      }
    }
    const bestCount = new Int32Array(width);
    for (let cap = 0; cap <= budget; cap++) {
      let m = 0;
      let mc = 0;
      for (let c = 0; c <= maxItems; c++) {
        if (dp[c][cap] > m) {
          m = dp[c][cap];
          mc = c;
        }
      }
      best[cap] = m;
      bestCount[cap] = mc;
    }
    return { best, took: null, dp, choice, bestCount, width, maxItems, countLimited: true };
  }
  function recoverSet(candidates, dpResult, spend) {
    const chosen = [];
    let cap = spend;
    if (dpResult.countLimited) {
      const { choice, bestCount, width } = dpResult;
      let count = bestCount[cap];
      for (let i = candidates.length - 1; i >= 0 && count > 0; i--) {
        if (choice[i][count * width + cap] === 1) {
          chosen.push(i);
          cap -= candidates[i].weight;
          count--;
        }
      }
      return chosen.reverse();
    }
    for (let i = candidates.length - 1; i >= 0; i--) {
      if (dpResult.took[i * dpResult.bytesPerItem + cap] === 1) {
        chosen.push(i);
        cap -= candidates[i].weight;
      }
    }
    return chosen.reverse();
  }
  function milsovHeadroom({ tax, settings, uRp = 0, buildingsUsed = 0 }) {
    const s = settings;
    const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);
    if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };
    const { yield: y } = computeBasicYield(s);
    let upkeep = Infinity;
    for (const res of BASIC_RESOURCES) {
      const produced = basicProduction({
        plots: s.plots[res],
        yield: y,
        bonus: resourceBonus(s, res),
        tax
      });
      upkeep = Math.min(upkeep, produced - resourceMinimum(s, res) - buildingUpkeep(s, res));
    }
    return {
      rp: Math.max(0, researchAt({
        research: computeResearch(s),
        rpBonus: prestigeBonus(s, "research"),
        tax
      }) - uRp - resourceMinimum(s, "research")),
      upkeep: Math.max(0, upkeep),
      slots
    };
  }
  function descriptorBonus(tile, structure) {
    const d = tile?.descriptor;
    return d && structure && d.sovKey === structure ? d.bonus ?? 0 : 0;
  }
  function planMilsov({ tiles, headroom, chancery = 1, structure }) {
    const EPS2 = 1e-9;
    const n = Math.min(tiles.length, Math.floor(headroom.slots));
    const RATE = [chancery, 1, 1, 1, 1];
    const D = [];
    for (let j = 0; j < MILSOV_MAX_LEVEL; j++) {
      const pre = [0];
      for (let i = 0; i < n; i++) pre.push(pre[i] + ((tiles[i].held ?? 0) > j ? 0 : tiles[i].d));
      D.push(pre);
    }
    const rpOf = (j, m2) => CLAIM_RP_PER_LEVEL_DISTANCE * RATE[j] * D[j][m2];
    const empty = { counts: [0, 0, 0, 0, 0], levels: [], bonus: 0, rp: 0, upkeep: 0, buildings: 0 };
    if (n === 0) return empty;
    const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);
    const finish = (counts) => {
      const levels = [];
      let bonus = 0;
      for (let i = 0; i < n; i++) {
        const level = counts.filter((m2) => m2 > i).length;
        if (level > 0) levels.push(level);
        bonus += level * (MILSOV_BONUS_PER_LEVEL + descriptorBonus(tiles[i], structure));
      }
      const units = counts.reduce((a, b) => a + b, 0);
      return {
        counts,
        levels,
        bonus,
        rp: counts.reduce((sum, m2, j) => sum + rpOf(j, m2), 0),
        upkeep: counts.reduce((sum, m2, j) => sum + MILSOV_UPKEEP_STEP[j] * m2, 0),
        buildings: levels.length
      };
    };
    const topRp = D.reduce((sum, _, j) => sum + rpOf(j, n), 0);
    if (topRp <= headroom.rp + EPS2 && layerTotal * n <= headroom.upkeep + EPS2) {
      return finish(new Array(MILSOV_MAX_LEVEL).fill(n));
    }
    const m = new Array(MILSOV_MAX_LEVEL).fill(0);
    let best = null;
    const search = (j, units, rp, upkeep, cap) => {
      if (j === MILSOV_MAX_LEVEL) {
        if (!best || units > best.units || units === best.units && rp < best.rp - EPS2) {
          best = { counts: [...m], units, rp };
        }
        return;
      }
      let vMax = 0;
      while (vMax < cap && rp + rpOf(j, vMax + 1) <= headroom.rp + EPS2 && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS2) vMax++;
      for (let v = vMax; v >= 0; v--) {
        if (best) {
          const bound = units + (MILSOV_MAX_LEVEL - j) * v;
          if (bound < best.units) break;
          if (bound === best.units && rp >= best.rp - EPS2) break;
        }
        m[j] = v;
        search(j + 1, units + v, rp + rpOf(j, v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);
      }
      m[j] = 0;
    };
    search(0, 0, 0, 0, n);
    return best ? finish(best.counts) : empty;
  }
  function milsovClaims({ tiles, levels, structure, chancery }) {
    return levels.map((level, i) => {
      const held = tiles[i].held ?? 0;
      return {
        ...tiles[i],
        structure,
        // A standing claim keeps its level.
        sovLevel: Math.max(level, held),
        buildingLevel: level,
        ...claimUpkeep(tiles[i].d, level, chancery, held)
      };
    });
  }
  function milsovBlockedBy({ hosts, free, headroom, chancery }) {
    if (free.length === 0) return "tiles";
    if (hosts.length === 0) return "water";
    if (headroom.slots < 1) return "slots";
    if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return "upkeep";
    const nearest = hosts.reduce((d, t) => Math.min(d, (t.held ?? 0) > 0 ? 0 : t.d), Infinity);
    const cheapest = claimUpkeep(nearest, 1, chancery).rp;
    if (headroom.rp + 1e-9 < cheapest) return "rp";
    return null;
  }
  function prepareSite({ neighbours, settings }) {
    const s = settings;
    const chancery = chanceryFactor(s);
    const maxBuildings = s.maxBuildings ?? 20;
    const byDistance = neighbours.map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) })).sort((a, b) => a.d - b.d || a.food - b.food);
    const foodCandidates = byDistance.filter((t) => t.food > 0).map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery, t.held);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });
    const rpBonus = prestigeBonus(s, "research");
    const budget = Math.max(0, Math.round(researchAt({ research: computeResearch(s), rpBonus, tax: 0 })));
    return {
      settings: s,
      chancery,
      structure: s.milsovStructure || null,
      k: computeK(s.plots.food),
      bOther: computeBOther(s),
      consumption: computeConsumption(s),
      research: computeResearch(s),
      rpBonus,
      minFood: resourceMinimum(s, "food"),
      minRp: resourceMinimum(s, "research"),
      byDistance,
      foodCandidates,
      budget,
      dp: knapsack(foodCandidates, budget, maxBuildings)
    };
  }
  function foodSpendFor(ctx, tax) {
    const needed = tax - PRODUCTION_BASE - ctx.bOther + (ctx.consumption + ctx.minFood) / ctx.k;
    if (!(ctx.dp.best[ctx.budget] >= needed - EPS)) return null;
    let lo = 0;
    let hi = ctx.budget;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (ctx.dp.best[mid] >= needed - EPS) hi = mid;
      else lo = mid + 1;
    }
    const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
    return produced - lo - ctx.minRp < -EPS ? null : lo;
  }
  function bestFoodSpend(ctx, tax) {
    const produced = researchAt({ research: ctx.research, rpBonus: ctx.rpBonus, tax });
    const affordable = Math.max(0, Math.min(ctx.budget, Math.floor(produced - ctx.minRp)));
    const target = ctx.dp.best[affordable];
    let lo = 0;
    let hi = affordable;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (ctx.dp.best[mid] >= target - EPS) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }
  function planSiteAt(ctx, tax, { bestEffort = false } = {}) {
    const s = ctx.settings;
    if (!Number.isFinite(tax)) return null;
    const held = foodSpendFor(ctx, tax);
    const spend = held ?? (bestEffort ? bestFoodSpend(ctx, tax) : null);
    if (spend === null) return null;
    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);
    const claimed = new Set(tiles.map((t) => t.idx));
    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
    const hosts = free.filter((t) => !t.water);
    const headroom = milsovHeadroom({
      tax,
      settings: s,
      uRp: spend,
      buildingsUsed: tiles.length
    });
    const military = planMilsov({
      tiles: ctx.structure ? hosts : [],
      headroom,
      chancery: ctx.chancery,
      structure: ctx.structure
    });
    const milsov = milsovClaims({
      tiles: hosts,
      levels: military.levels,
      structure: ctx.structure,
      chancery: ctx.chancery
    });
    const sFood = ctx.dp.best[spend];
    const milsovRp = milsov.reduce((sum, a) => sum + a.rp, 0);
    const uRp = spend + milsovRp;
    const uGold = claimGold(uRp, s);
    const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });
    const ceiling = tMax({
      food: tFood({
        bOther: ctx.bOther,
        sFood,
        consumption: ctx.consumption,
        k: ctx.k,
        minimum: ctx.minFood
      }),
      rp: tRp({ uRp, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
      res: resCeiling.indicative ? Infinity : resCeiling.ceiling
    });
    return {
      tax,
      // False when the plan is at a tax the site cannot hold.
      holds: held !== null,
      tMax: ceiling.value,
      binding: ceiling.binding,
      sFood,
      spend,
      uRp,
      uGold,
      goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
      surplus: Number.isFinite(tax) ? surplusAt({ tax, settings: s, sFood, uRp, uGold, milsovAssignments: milsov }) : null,
      tiles,
      free,
      headroom,
      milsov,
      milsovBonus: military.bonus,
      milsovUpkeep: military.upkeep,
      milsovRp,
      milsovGold: milsov.reduce((sum, a) => sum + a.gold, 0),
      milsovBlocked: ctx.structure && milsov.length === 0 ? milsovBlockedBy({ hosts, free, headroom, chancery: ctx.chancery }) : null,
      resCeiling: resCeiling.ceiling,
      resIndicative: resCeiling.indicative,
      resBinding: resCeiling.binding,
      resImpossible: resCeiling.impossible
    };
  }
  function milsovAtFloor(ctx, { required, floor, ceiling }) {
    const at = (tax) => {
      const p = planSiteAt(ctx, tax);
      return p && p.milsovBonus >= required ? p : null;
    };
    let lo = Math.ceil(floor);
    let best = at(lo);
    if (!best) return null;
    let hi = Math.floor(ceiling);
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      const p = at(mid);
      if (p) {
        best = p;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    return { bonus: best.milsovBonus, tax: best.tax };
  }
  function siteCeiling(ctx) {
    const floors = tRes({ milsovAssignments: [], plots: ctx.settings.plots, settings: ctx.settings });
    const res = floors.indicative ? Infinity : floors.ceiling;
    let winner = null;
    for (let spend = 0; spend <= ctx.budget; spend++) {
      const sFood = ctx.dp.best[spend];
      const t = tMax({
        food: tFood({
          bOther: ctx.bOther,
          sFood,
          consumption: ctx.consumption,
          k: ctx.k,
          minimum: ctx.minFood
        }),
        rp: tRp({ uRp: spend, research: ctx.research, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
        res
      });
      const net = goldNet({
        tax: t.value,
        consumption: ctx.consumption,
        uGold: claimGold(spend, ctx.settings)
      });
      if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {
        winner = { tMax: t.value, binding: t.binding, sFood, spend };
      }
    }
    return winner;
  }
  function scoreSite({ neighbours, settings }) {
    return scoreSiteFrom(prepareSite({ neighbours, settings }));
  }
  function scoreSiteFrom(ctx) {
    const s = ctx.settings;
    const winner = siteCeiling(ctx);
    if (!winner) return null;
    const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);
    const cheaper = ctx.structure ? planSiteAt(ctx, plan.tax - 1) : null;
    const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : s.milsovMinBonus ?? 0;
    const floor = Math.min(s.tMin ?? 0, plan.tax);
    const reach = required > 0 && plan.milsovBonus < required && Number.isFinite(plan.tax) ? milsovAtFloor(ctx, { required, floor, ceiling: plan.tax }) : null;
    return {
      ...plan,
      // Ranked at the whole-number rate; \`tMaxExact\` is the unrounded ceiling.
      tMax: plan.tax,
      tMaxExact: winner.tMax,
      // Named from the exact ceiling.
      binding: winner.binding,
      milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,
      // The highest tax reaching the minimum bonus, when it is not met for free.
      milsovMinTax: reach ? reach.tax : null,
      milsovMinBonusAt: reach ? reach.bonus : null,
      // Not reachable at any tax the user accepts.
      milsovShortfall: required > 0 && plan.milsovBonus < required && !reach
    };
  }
  function fallbackPlan(ctx, winner) {
    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, winner.spend).map((i) => ctx.foodCandidates[i]);
    const claimed = new Set(tiles.map((t) => t.idx));
    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));
    const headroom = milsovHeadroom({
      tax: winner.tMax,
      settings: ctx.settings,
      uRp: winner.spend,
      buildingsUsed: tiles.length
    });
    return {
      tax: winner.tMax,
      tMax: winner.tMax,
      binding: "food",
      sFood: winner.sFood,
      spend: winner.spend,
      uRp: winner.spend,
      uGold: claimGold(winner.spend, ctx.settings),
      goldNet: goldNet({
        tax: winner.tMax,
        consumption: ctx.consumption,
        uGold: claimGold(winner.spend, ctx.settings)
      }),
      surplus: null,
      tiles,
      free,
      headroom,
      milsov: [],
      milsovBonus: 0,
      milsovUpkeep: 0,
      milsovRp: 0,
      milsovGold: 0,
      milsovBlocked: ctx.structure ? milsovBlockedBy({
        hosts: free.filter((t) => !t.water),
        free,
        headroom,
        chancery: ctx.chancery
      }) : null,
      resCeiling: Infinity,
      resIndicative: false,
      resBinding: null,
      resImpossible: false
    };
  }
  function betterPlan(a, b) {
    const EPS2 = 1e-9;
    if (a.tMax > b.tMax + EPS2) return true;
    if (a.tMax < b.tMax - EPS2) return false;
    if (a.uRp < b.uRp - EPS2) return true;
    if (a.uRp > b.uRp + EPS2) return false;
    return a.goldNet > b.goldNet;
  }

  // src/payload.js
  function tileKey(y, x) {
    return \`\${y}|\${x}\`;
  }
  function parseKey(key) {
    const [y, x] = key.split("|").map(Number);
    return { x, y };
  }
  function parseRs(tile) {
    if (!tile || typeof tile.rs !== "string") return null;
    const parts = tile.rs.split("|").map(Number);
    if (parts.length !== 5 || parts.some(Number.isNaN)) return null;
    return { wood: parts[0], clay: parts[1], iron: parts[2], stone: parts[3], food: parts[4] };
  }
  function foodOf(tile) {
    const rs = parseRs(tile);
    return rs ? rs.food : 0;
  }
  var WATER_BIOME = 20;
  function isWaterTile(tile) {
    if (Number.isFinite(tile?.b)) return tile.b === WATER_BIOME;
    const rs = parseRs(tile);
    return !!rs && rs.wood + rs.clay + rs.iron + rs.stone === 0;
  }
  function indexPayload(payload) {
    const claims = /* @__PURE__ */ new Map();
    const towns = /* @__PURE__ */ new Map();
    for (const [key, claim] of Object.entries(payload.s ?? {})) {
      claims.set(key, claim);
    }
    for (const [key, town] of Object.entries(payload.t ?? {})) {
      towns.set(key, town);
    }
    return { claims, towns };
  }
  function claimLevel(claim) {
    const n = Number(String(claim?.s ?? "").split("|")[0]);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  }
  function townIdentity(town) {
    const text = (v) => String(v ?? "").trim();
    const rec = townRecord(town);
    const parts = rec ? null : townString(town).split("|");
    return (rec ? [rec.TownName, rec.TownId] : [parts[0], parts[1]]).map(text).filter(Boolean);
  }
  function townPlayer(town) {
    const rec = townRecord(town);
    return String((rec ? rec.Player : townString(town).split("|")[10]) ?? "").trim();
  }
  function isTownsClaim(claim, town) {
    if (!claim || !town) return false;
    const player = townPlayer(town);
    if (!player || String(claim.pn ?? "").trim() !== player) return false;
    const own = townIdentity(town);
    const names = claim.t && typeof claim.t === "object" ? townIdentity(claim.t) : [String(claim.t ?? "").trim()].filter(Boolean);
    return names.some((n) => own.includes(n));
  }
  function isClaimable(tile, key, idx, settings) {
    if (!tile || tile.sov !== 1) return false;
    if (tile.imp || tile.brg) return false;
    const claim = idx.claims.get(key);
    if (claim) {
      return isTownsClaim(claim, settings?.homeTown) || claim.rd === "Yours" && !!settings.ownClaimsAvailable;
    }
    return true;
  }
  function heldLevel(key, idx, settings) {
    const claim = idx.claims.get(key);
    if (!isTownsClaim(claim, settings?.preserveTown)) return 0;
    return claimLevel(claim) ?? 0;
  }
  function isSettleable(tile) {
    if (!tile) return false;
    if (tile.set !== void 0) return tile.set === 1;
    if (tile.imp || tile.brg || tile.npc) return false;
    if (isWaterTile(tile)) return false;
    return tile.sov === 1 && tile.hos === 1;
  }
  function isCandidateSite(tile, key, idx, settings, towns) {
    if (!isSettleable(tile)) return { ok: false, reason: "not-settleable" };
    const terrains = settings.siteTerrains ?? [];
    if (terrains.length && !terrains.includes(TERRAIN_NAMES[tile.i]?.[1])) {
      return { ok: false, reason: "terrain" };
    }
    if (idx.claims.has(key)) return { ok: false, reason: "already-claimed" };
    if (idx.towns.has(key)) return { ok: false, reason: "town-tile" };
    const { x, y } = parseKey(key);
    for (const t of towns) {
      const d = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);
      if (t.own) {
        if (d < settings.dOwn) return { ok: false, reason: "too-close-own" };
      } else if (t.ally) {
        if (d < settings.dAlliance) return { ok: false, reason: "too-close-alliance" };
      } else if (d < settings.dOther) {
        return { ok: false, reason: "too-close-other" };
      }
    }
    return { ok: true };
  }
  function townRecord(town) {
    if (!town || typeof town !== "object") return null;
    const isRecord = (o) => !!o && typeof o === "object" && typeof o.TownName === "string" && o.X !== "" && Number.isFinite(Number(o.X)) && o.Y !== "" && Number.isFinite(Number(o.Y));
    if (isRecord(town)) return town;
    for (const v of Object.values(town)) if (isRecord(v)) return v;
    return null;
  }
  function townString(town) {
    if (typeof town === "string") return town;
    if (!town || typeof town !== "object") return "";
    for (const v of Object.values(town)) {
      if (typeof v !== "string" || !v.includes("|")) continue;
      const parts = v.split("|");
      if (parts.length >= 4 && Number.isFinite(Number(parts[2])) && parts[2] !== "" && Number.isFinite(Number(parts[3])) && parts[3] !== "") {
        return v;
      }
    }
    return "";
  }
  function extractTowns(payload) {
    const out = [];
    for (const [key, town] of Object.entries(payload.t ?? {})) {
      const rec = townRecord(town);
      const parts = rec ? null : townString(town).split("|");
      const x = Number(rec ? rec.X : parts[2]);
      const y = Number(rec ? rec.Y : parts[3]);
      const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
      out.push({
        ...pos,
        name: (rec ? rec.TownName : parts[0]) ?? "",
        own: town && town.rd === "Yours",
        // Confederates ("Confed ") are kept at a stranger's distance.
        ally: town && town.rd === "Alliance",
        rd: town && town.rd,
        key
      });
    }
    return out;
  }
  function inWorld(x, y) {
    return x >= WORLD_MIN_X && x <= WORLD_MAX_X && y >= WORLD_MIN_Y && y <= WORLD_MAX_Y;
  }
  function collectNeighbourhood(payload, key, rClaim, idx, settings) {
    const { x, y } = parseKey(key);
    const neighbours = [];
    const missing = [];
    let ring = 0;
    for (let dy = -rClaim; dy <= rClaim; dy++) {
      for (let dx = -rClaim; dx <= rClaim; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (!inWorld(x + dx, y + dy)) continue;
        ring += 1;
        const nKey = tileKey(y + dy, x + dx);
        const tile = payload.data[nKey];
        if (!tile) {
          missing.push(nKey);
          continue;
        }
        if (!isClaimable(tile, nKey, idx, settings)) continue;
        const held = heldLevel(nKey, idx, settings);
        const claim = idx.claims.get(nKey);
        neighbours.push({
          dx,
          dy,
          food: foodOf(tile),
          key: nKey,
          i: tile.i,
          water: isWaterTile(tile),
          // Costs downstream are for the levels above this.
          held,
          // A claim stands here that the plan does not keep and prices as bare
          // ground.
          relaid: held === 0 && !!claim,
          descriptor: descriptorFor(tile.i)
        });
      }
    }
    return { neighbours, missing, ring };
  }
  function neighbourhood(payload, key, rClaim, idx, settings) {
    const { neighbours, missing } = collectNeighbourhood(payload, key, rClaim, idx, settings);
    return missing.length ? null : neighbours;
  }

  // src/worker.js
  self.onmessage = (e) => {
    const { payload, settings } = e.data;
    const idx = indexPayload(payload);
    const towns = extractTowns(payload);
    const keys = Object.keys(payload.data ?? {});
    const results = [];
    const incomplete = [];
    let done = 0;
    for (const key of keys) {
      const tile = payload.data[key];
      if (isCandidateSite(tile, key, idx, settings, towns).ok) {
        const neighbours = neighbourhood(payload, key, settings.rClaim, idx, settings);
        if (neighbours === null) {
          incomplete.push({ key, ...parseKey(key) });
        } else {
          const plan = scoreSite({ neighbours, settings });
          if (plan && !plan.milsovShortfall && plan.tMax >= settings.tMin) {
            results.push({ key, ...parseKey(key), rs: parseRs(tile), neighbours, ...plan });
          }
        }
      }
      if (++done % 100 === 0) {
        self.postMessage({ type: "progress", done, total: keys.length });
      }
    }
    results.sort((a, b) => b.tMax - a.tMax || b.goldNet - a.goldNet);
    self.postMessage({
      type: "done",
      results,
      incomplete,
      scanned: keys.length
    });
  };
})();
`], { type: "text/javascript" })
  );
  var settings = { ...DEFAULT_SETTINGS };
  var store = createSettingsStore();
  var restored = store.load();
  var saveTimer = null;
  var unsaved = null;
  function flushSave() {
    if (!unsaved) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    const s = unsaved;
    unsaved = null;
    panel.setStoreNote(store.save(s));
  }
  function saveSoon(s) {
    unsaved = s;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 250);
  }
  window.addEventListener("pagehide", flushSave);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) flushSave();
  });
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || e.newValue === null || unsaved) return;
    const { settings: s } = decodeSettings(e.newValue);
    if (!s) return;
    panel.setSettings(s, { save: false });
    overlay.setEnabled(s.mapOverlay);
    panel.setStoreNote("Settings were changed in another tab; this panel now matches them.");
  });
  var viewOf = (p) => p && { x: p.x, y: p.y, zoom: p.zoom };
  var overlay = createOverlay({
    getView: () => viewOf(getLatestPayload()),
    onPickSite: (x, y) => panel.selectSite(x, y),
    onPickCentre: (x, y) => panel.planAt(x, y),
    onPicking: (armed) => panel.setPicking(armed),
    onNote: (pane, text, tooltip) => panel.setMapNote(pane, text, tooltip),
    whenViewLoaded
  });
  var panel = createPanel({
    initialSettings: restored.settings ?? DEFAULT_SETTINGS,
    onSettingsChange: (s) => {
      overlay.setEnabled(s.mapOverlay);
      saveSoon(s);
    },
    onScan: runScan,
    onSelect: (result) => overlay.outline(result),
    onPaneShown: (pane) => overlay.setPane(pane),
    onFocusPlan: (plan, geom) => overlay.showPlan(plan, geom),
    onPickOnMap: () => overlay.togglePick(),
    getPayload: getLatestPayload,
    whenViewLoaded
  });
  overlay.setEnabled(panel.getSettings().settings.mapOverlay);
  if (restored.note) panel.setStoreNote(restored.note);
  function runScan() {
    const read = panel.getSettings();
    if (read.errors.length) {
      panel.setStatus(read.errors.join(" "));
      return;
    }
    settings = read.settings;
    const payload = getLatestPayload();
    if (!payload) {
      panel.setStatus("No map data on screen yet. Pan or zoom the map, then Scan.");
      return;
    }
    const view = viewOf(payload);
    overlay.clearTop();
    panel.setStatus("Scanning\u2026");
    const worker = new Worker(workerUrl);
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress") {
        panel.setStatus(`Scanning\u2026 ${msg.done}/${msg.total}`);
        return;
      }
      panel.renderResults(msg.results, { ...view, scanned: msg.scanned });
      overlay.showTop(msg.results);
      panel.renderIncomplete(msg.incomplete);
      panel.setStatus("");
      worker.terminate();
    };
    worker.postMessage({ payload, settings });
  }
  window.__sovScanner = {
    get settings() {
      return panel.getSettings().settings;
    },
    // What a Scan would read now, cut to the screen. The uncut global is window.mapData.
    get payload() {
      return getLatestPayload();
    },
    set settings(v) {
      panel.setSettings({ ...DEFAULT_SETTINGS, ...v });
    },
    probeInPageData
  };
})();
