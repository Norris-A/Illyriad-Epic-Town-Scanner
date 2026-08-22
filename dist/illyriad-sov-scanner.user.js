// ==UserScript==
// @name         Illyriad Sovereignty Site Scanner
// @namespace    https://github.com/Norris-A
// @version      1.0.0
// @description  Ranks visible world-map tiles by the maximum sustainable tax rate.
// @author       Norris A. (Firebolty)
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAK0UlEQVR4XpWXe3CV9ZnHP+/tXHPOSU4ScpMEwiVcvSSillu7igVBhQwYFBRRkFplLMtFJRZBCVQLgl0FuwVZYZRVdGm7RNjqVLqi2EVEaLGABALkfiEnOffb+z57psMfzqpd/cx85/fn9/POb553fg/fE5fLpk8sdhtPjsxxbB/pd+4YmZOJ3/Fqmcf2c5eu3qwqePkGDFVB4evofDeGDyrKnz+stOROG9aw9pZWwtEYmqajKAqoGn5D6JclpEzzXHcsua81HN9lCZ/zNb6fQN51w4bU3TRi6E/isTg2p5vSqwrwOnX0dAxJxUAEM52iJxDgwqU2zrcGBimKsaTE417SEYnuutAXewpo5ltQ+BY8Hk/16seX7XSK6Wnr6qbq2uEYiRiXu3qIRHqIRS8jySjpRIRIX4BQ80WSvSFcTjCdPo536oQSKipm6ovu3ociKWvndxYYUj7g55ueW79WtznRnQ5K8vI5vH8/ze0n8BXbKS69ipIiB3abhqrZMVFoawnR+GUL5/98hPDJLyjKgoDLz5EmFbumcL63b0NbOPn4/yswaOCA2hfr1qwLpSxu/NHNoOTzq7pFFPjPMHf+LZQNqwTyIRGGZAh0G2gOsOUAfuKJEO+88wH7X3mVovYG/MVe/rPRwKFqnL7c+0JnJLmcr6DyFVxO522L7pq+rqWzm2kza+i+bFD35CQW3t1B7XO3U+LPJtzSSaq3DSsFqAJGnGggSLS9mXDrCYx4N/fOvYOdh95EflzNqS+D3DM4TkpMBuX4lrkNdd63CXhnjL++PhpPMn3OPM43Bvm3zdPYtMLFiCGD6TjZS29PkKwSOxZBunuaOPLJSd7b+yFRTwStUCOrSCce7qKv6XOM+GU2bd1I1fLFHD0TYUZ5AlMsRuRn7wSKviZQmGV/0Qz1qVXjx5EMxNm8dia/WJqHaiuipTmGGU+QV57NkfcO8+TNq1lz52b+ff4ujtX+iY6V7/PBAy/xh/2HcZd4yMrSCfUESPc18s/Laym/dw7Nl8L8sMwkbWkMzHZt5/9QVpmtyX1Tb5Wj9Xvk/slj5PAblRL8rFrOHZwp7cceFLGeka0rK2UyNmmcvUDaxt0ip8uHyoUBg+RvZMmnIHeBPLJimphyQET+R4KX9kmq75CInJK5kypk1SjkjopcqSrMFUNVruUK+A11002FPtm14WlZN69aVj1YJOapavlb/WTp+KxGzK7HZPv68bIgu7+k7povJ344UZaAVIPUgEwFWQCyHuQGkFuHl8in/73l78XBpn0ickIOvr9F7huIrBnvkcqMQJnP9TqAAugVbqVh5DVjyubNnMwHf9zDT5dV4NHBMjQKB+Wx8bFDvPbWaU7W3MuxhpMsOHYcP5AAIkAWoAAGMAfIRaPeYfCL869T6M8nFY5gz83miTmPopz4nBOJXNrCVuivnYEyNIVxldmGPD6vRjYvvEuefahcpGORXDw0R9ItD8q2p66WanRpqrpB9oDcCDL5ypfXZmfLW6Wlst3tlkPV1fJYbq5cC9I4eIjswCszbyj7+1XEOl8XkT/JG9uWyCPlyMNVuXJ1vl8K3LYatcCp3azYnOT7nAQ6L1JS5kaiEbBSaN4s/nqsjR+oebjtOhsBF5CjKDwwYwa1c+cytH9/Rmga4wsKyHI6SQE7z59jSnkBp45c5ItP/ojD74REM8OuuRotz4NPi5MWIdthVKnZNn2IYjhwkCaV7mXA4H5EwuDI0mk+1UX8WJz7bpvAzkuXAMgChjgcTKmo4MCbbzLp44+ZHQyyevdumlpbKQPOWBY0NTIWePXFfaBZJAKtFPVLYM/NQ1KZUwND0Qp1FMXKhEQ4gGpFsds9qDYv/cqy2bKqntFKGQUelY+am8kFPEBjLMbmTZsoSKX4FXAYqM9IDAJcgAlcSqWZCrx9oRXMCKrmwe5UsRlgioWmQtJURVUUBVBIRIJYqSSq4UQzbFhJ+OTdL3G4nMRFMAAADYgCv82U/xpoAGYA04EUkARyVJXrpk7FQCNtqqB50B0elMwJoCqgKAAiKqCiKMSjURLxFKquoGtpkuEAiWiCXtWkLxYnDNgATVFwA1mAE9gLvA1cA5RekSuxLNoaGtiNibufF1Cx0jFS8SAWKrrLhyUgWKoaTVsXME16QxFivRFamoJohoFu6OT0z+NMw2myM3I+oBvIV1W2T5/O0ilTcANe4PqKCspycjCBGDDQ78cFNAIF5f0AE82m0d7eh5mwcPryiKUsEKtLbY0kD+qKSXtPhHQ0yaWzAcgpRs8rY9T1QzlOFEd2NuOBKJA0TT5IJhk9axYbMhPwvM/Hosw0nMyUHgUqgImjRpE/YSI9wMjrS8G6DG6Ds6ebMBImEUtHsSwux1LH1YQph5PpdGtzIIHLpdN8qoVEzECSdmoenkzarvHwf/yeRQUFzHY6uQg8c+AAdyxcyL/09vJWNMqUp59m87lzlAKzgNKJE6j/+FMuARPHFGOFUoDKqaNnyfV5OdsWAiTWl0y9B0Bxln1rVWGePFrllwcGILu33yMS2yBWsE4uHF4sWSBrNJ8c9fnkZ1f++dUgN4HceCUzQf7L6RSZMkXqr66UIpDfvDRLRHaIxLbJpx+ulGV3jpEdCydIZb5HBnid76gKAKAoVIwtyZVx/fPkiVGazBlbINGu9RJuWCaSWisHtkyTIp8qw0H2grwMcg/IHSBzQB7Xdem4/36R6mpZeVWpAPLTR8aLyBsSb9siEntZlj4yTfauWyqLJ42SEV67OHT1B3yVUq/j7TFF+bKgMleWDUWWPHijiLwswfNLRCQjc2mxVA32yu0gF4x8OVkxXPYbhnyuGiKzZkvjjJqMEFfKfySS3inJzh0iiW3ywjNTZevqWjm8e7NU9fNJmVv/kG8g/6biHLkucxWrxvrkvmJkw7OTRGStxC5kJCJPSfT0QtmwtEqe//EIWZ97lTyLLivQ5Ccuv1SB3DKuTN54ZaZIOCPcsFoksll2bZ0pa9esl2Rrg9wzsVKGORFNUcr5JpyGeveE0nypLMqV5yd65f5S5IlHx4gVXi4SWi6J1p+JWCsk0LNYNtbeIFOmDZGVz/2TbHutRo4dXi5WT51Id61I+zKR3tWy7okJUle3UTLI5rpVMtqtikdXlvzDR2k/t+2Xw3OzV4TTJtWD0nS399FVWkzNQ9dx5+SB4HZBVAHDAAVwuoBMYnGwUhDq4+Cfm9n7bgfjblnK3Xffzo5XXub1X9Zxuq1rR1vCWvAPBa5MxcaB2Z5lcRPGl1p4Y0Gao+CvLGXE2HIqRpdQWuLHZjhIm4JlKbS0XObc2W4a/tKNGcvn1ltvp2jEMLZt+TWH6n9LRzS143xfbMF3X0xs2sLhed7fJE1NKfIIVQUmqb4w0ZSJ+FzYfG68+YXYnB5MVBSx48zErQm5/Xyc6Tb53e8OcLkzRK/B8t40L4jwNdRvMrJrKqGkuf1IZs0KJaN7uiKw76zGZxEfcZcfp6WidgWhrQdHMIEvpZOjakQjvRw8fpq6f/09r722h0Ak8m6bpowOpHjBrmkoyvffDRvPBaKzbVrspZIs53xFsd3WEVaLTdExVA21NYiqhBAUYsk0YlloinTHRP7Qaik7lYS8LwBwpfz7C6CikDTlo8a+6Ef5yWSBQ9cm2nV9tKZoJWlEsdIWYElarI64ZX1hCR/2JtJN8bTgs2mYIiRM4dv4X2dFWMDYePh0AAAAAElFTkSuQmCC
// @downloadURL  https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js
// @updateURL    https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js
// @supportURL   https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/issues
// @match        https://elgea.illyriad.co.uk/*
// @match        https://illyriad.co.uk/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

// This script makes ZERO network requests. It observes map payloads the game
// has already received on the user's behalf, and analyses them locally.

(() => {
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
    const svg = typeof document !== "undefined" ? document.getElementById("mapSVG") : null;
    if (svg) {
      for (const prop of Object.keys(svg)) {
        try {
          if (looksLikeMapPayload(svg[prop])) return svg[prop];
        } catch (_) {
        }
      }
    }
    return null;
  }
  function getLatestPayload() {
    return readInPageData();
  }
  function probeInPageData() {
    const hits2 = [];
    for (const n of IN_PAGE_NAMES) {
      try {
        if (looksLikeMapPayload(window[n])) hits2.push({ source: `window.${n}`, value: window[n] });
      } catch (_) {
      }
    }
    const svg = document.getElementById("mapSVG");
    if (svg) {
      for (const prop of Object.keys(svg)) {
        try {
          if (looksLikeMapPayload(svg[prop])) hits2.push({ source: `mapSVG.${prop}`, value: svg[prop] });
        } catch (_) {
        }
      }
    }
    return hits2;
  }

  // src/constants.js
  var PRODUCTION_BASE = 125;
  var FARM_YIELD_L20 = 2014;
  var GOLD_PER_TAX_POP = 0.04;
  var CLAIM_RP_PER_LEVEL_DISTANCE = 10;
  var CLAIM_GOLD_PER_LEVEL_DISTANCE = 100;
  var CHANCERY_FACTOR = 0.6;
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
    // The crafting half of the Production Structures. Same hourly ladder as the
    // military five — the class is about upkeep, not about what is made — and the
    // terrain descriptors name these, so they have to be here or a descriptor
    // reads as a bonus riding on something the tool does not know about.
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
    15: { name: "Fertile Orchard" },
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
    48: { name: "Wooded Quarry", bonus: 1, product: "Siege Blocks", building: "Engineering Yard" },
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
    // Rivers. Food is read from `rs` like any other tile; there is no descriptor
    // bonus on top of it, so a river is worth exactly its food rating.
    59: { name: "Fresh Water", water: true },
    // An NPC settlement and the ring of eight it occupies. Neither is claimable —
    // the centre carries no `sov` and the ring is `imp` — so these are here to
    // keep a settlement in view from reporting nine unidentified IDs per scan.
    //
    // The ring's `rs` is the one place a land tile does NOT sum to 25: it keeps
    // its terrain ratings with food forced to 0, summing to 20. Nothing reads it,
    // but do not take it as a counterexample to the 25-plot rule.
    66: { name: "Faction Hub", settlement: true },
    67: { name: "Forbidden", impassable: true },
    80: { name: "Drumlin" },
    // The glacial terrains, read off tiles in a b:2 region. Their plots total 0
    // to 15 where most land totals 25, so they are poor ground whatever they
    // grant — which is what the scanner reads, the bonus being a column.
    68: { name: "Barren Wastes", bonus: 3, product: "Spears", building: "Poleturner" },
    69: { name: "Glacier" },
    70: { name: "Frozen Ground" },
    // The one military rung above +2 anywhere in the table. Eight other military
    // readings — Training Ground, Target Range, Military Academy and Jousting
    // Yard, +1 and +2 each — all stop at +2, while crafting rungs reach +3
    // freely. Read by eye before the in-game harvester existed, and the game
    // prints "Siege Block production" for the Engineering Yard against "Siege
    // unit production" for the Assembly Yard, which is an easy conflation.
    // Marked until a Nunatak is hovered and it is read again.
    71: {
      name: "Nunatak",
      bonus: 3,
      product: "Siege Units",
      building: "Assembly Yard",
      disputed: "only military rung above +2; re-read against Siege Block"
    },
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
    // Shares its name with i:30, which grants Finishing School +1%. Same name,
    // different terrain, different answer — the id identifies a terrain and the
    // name does not.
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
    89: { name: "Swamp", bonus: 2, product: "Bows", building: "Bowyer" },
    90: { name: "Marsh", bonus: 3, product: "Spears", building: "Poleturner" },
    91: { name: "Bog" },
    92: { name: "Mire" },
    // The rainforests, all read in the Jungle biome. Their plots total 22 or 23,
    // which is the counterexample to "land always sums to 25".
    //
    // Thick Rainforest grants Poleturner +3%, a rung three other terrains also
    // hold. Rainforest Hilltop grants Papermill +3%, which i:6 Rich Clay Seam
    // holds — and both were read in the SAME biome, which is what finally
    // disproved the one-terrain-per-rung rule rather than rescoping it again.
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
    // Holds Bowyer +3% alongside i:52 Thick Forest — the second rung read twice
    // in the Jungle biome, after Papermill +3% on i:6 and i:120.
    116: { name: "Rainforest Canopy", bonus: 3, product: "Bows", building: "Bowyer" },
    117: { name: "Rainforest" },
    118: { name: "Dense Rainforest" },
    119: { name: "Thick Rainforest", bonus: 3, product: "Spears", building: "Poleturner" },
    // Holds Papermill +3% alongside i:6 Rich Clay Seam, in the same biome. This
    // is the row that ended the one-terrain-per-rung rule.
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
    3: { name: "Plains" },
    63: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },
    64: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },
    65: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },
    76: { name: "Tarn" },
    88: { name: "Petrified Forest" },
    // The desert. Two of the eight grant anything: the Oasis, and the Mesa, whose
    // Plate Forger +3% i:46 Abundant Quarry also holds. The gravel and stone
    // flats — Yardang, Hamada, Reg, Wadi — grant nothing despite rating as high
    // as 10 plots between them, so a plot total does not predict a bonus.
    93: { name: "Sand Dune" },
    94: { name: "Oasis", bonus: 3, product: "Livestock", building: "Cattle Rancher" },
    96: { name: "Yardang" },
    97: { name: "Mesa", bonus: 3, product: "Platesteel", building: "Plate Forger" },
    98: { name: "Rocky Mountain" },
    99: { name: "Hamada (Stone Plateau)" },
    100: { name: "Reg (Gravel Plain)" },
    102: { name: "Wadi" },
    // Open water and the shoreline. The four water rows rate zero on all five and
    // are flagged like i:18, i:19 and i:59; the four shore rows rate food alone,
    // 5 to 10 of it, and are worth exactly that food and no bonus — the same
    // answer a river gets.
    60: { name: "Tidal Water", water: true },
    61: { name: "Shallow Salt Water", water: true },
    62: { name: "Ocean", water: true },
    172: { name: "Bankside" },
    173: { name: "Beach" },
    174: { name: "Shallow Coastline" },
    175: { name: "Coast" },
    198: { name: "Dead Water", water: true },
    // The volcanic terrains. All nine rate zero on all five plots, which reads
    // like the impassable rows and is not: their combat class is Obsidian
    // Mountains, and only i:20-23 are class Impassable anywhere in the client's
    // table. So this is walkable ground that grows nothing — not a wall.
    //
    // isWaterTile tests wood+clay+iron+stone === 0, which these satisfy, so the
    // payload calls them water. They are not flagged `water` here, because they
    // are not — and nothing reads this flag, so the two do not have to agree.
    199: { name: "Obsidian Mountain" },
    200: { name: "Glassy Crag" },
    201: { name: "Volcanic Mountain" },
    202: { name: "Lava Peak" },
    203: { name: "Active Peak" },
    204: { name: "Emerging Mountaintop" },
    206: { name: "Lava Pool" },
    207: { name: "Magma Rift" },
    // The dead forests, all three rating 7|3|3|2|3 — one plot signature across
    // three names, and none of them grants anything. i:195 shares its name with
    // i:88, which rates 0|3|5|4|3: a third same-name pair, after the Scrublands
    // and the Swamps.
    194: { name: "Scorched Forest" },
    195: { name: "Petrified Forest" },
    196: { name: "Deadvlei Forest" },
    // Landmarks and sites, twenty-five of them, and not one grants anything —
    // which is what every landmark already in the table says too, from Standing
    // Stones to Mausoleum. Their plots vary tile to tile where most terrain's are
    // fixed, so a landmark is worth its own ratings and nothing more. The four
    // Altars answer the same: fixed single tiles, one per element, granting
    // nothing.
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
      combat: named?.[1],
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
  var ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;
  var OVERFLOWING_INSIGHT_FACTOR = 1.5;
  var LIBRARY_BASE_RP_L20 = 1013;
  var PLOT_KEYS = ["wood", "clay", "iron", "stone", "food"];
  var PLOT_TOTAL = 25;
  var DEFAULT_SETTINGS = {
    tMin: 50,
    plots: { wood: 5, clay: 5, iron: 5, stone: 3, food: 7 },
    // must sum to 25
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
    // Surplus per hour the plan may not touch, per resource. A city sitting exactly
    // on T_res puts its whole scarcest resource into upkeep and can never build or
    // trade in it again — this is where the user says how much to hold back. Zero
    // is the ceiling as it was. Food is counted above what the city eats and
    // research above what the claims cost.
    resourceMinimums: { wood: 0, clay: 0, iron: 0, stone: 0, food: 0, research: 0 },
    // Which productions the boost is running on, PRESTIGE_PRODUCTION_BONUS points
    // each.
    prestige: {
      wood: false,
      clay: false,
      iron: false,
      stone: false,
      food: false,
      research: false
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
    allianceClaimsAvailable: false
  };

  // src/icons.js
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
    troops: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADWklEQVR4XrWUTWgbRxiGv9mfWWmlXUnU1kryv+sUt3EwooUaiuIUaieHEqhNWkKhyDTgHFp0Lg245NgYEuixB+eUEtNDwQmlYEhLyaEQEIQcUgpJbLBkRZEs78YraXdnph8iBldNdQkdeC/zDQ/vs7O78L8umRByOPgymbx6PBz+I6vrv31gmr9+3tf3+5XBwZu4v3AI0PB8N4O8DPzTxMR3Fd//IqWqEAgBe0EAVYzLucC0QpJ066nvf/b9s2etf5Xqht0YH188MTy8+mYuB8OnToGxvQ2j6TRY7TYIAOJwrjY5P26pqrjjOHe6gdJR2OVMJpWQ5SvhyclGdGamDpLk7+3vgxSJuIlkkoWlznHRxta+EJ8uJBJmT2CaUmsMoXR09ECfnvZoJmMPzM0142fP7pJQSOwzBqgL/YoiED7+Vij0UTdQOQoMhHhOh4Z22d6e4pXLreaDB/0gxAGr11VWrSqoCQSXi2AdwRlCaE/grGW9YczOGqpl1fWpKcXe3FREEJDw9HQjZtvNsY0N7a9aTRKoHEMgxugJxJxxi8U+9949pk1MyNVikaKCFNTrqdCxYzw+P8/j6+tSyfMggkDU1noCUdf4cWMDBlXVquzuwrflMlxMJuHn27ejw5oG86YJDNuhOrymKKASInpeCnD+cOH0acjl87UPc7nqTDQKS/l844flZe+rgYHOhTQYA2x32BB6AwmRuW1D+9GjuFcqxbABOigOdxxf1XUYoRQ03JMxFBuG8LZ7KvN2m5EgAN5qyXizsss5BLWa2pl5XkdXQRhBgMAZA8AZWJjKfyk/pSMj+7JpHniMifdQGRtLhFJXCod5DFsNUdp5hqF4HGRKDWRcxBReChSt1jtqOt3Us9mS7ftBnTFw79+PiyDgCGz52NDBvTpaMNsGSdfPTUWjYwi41oEeVS6vrp4PKpVloiju87t3tTVUtRlrr2xtaalGo1+g8o7rikoQEPw8oR9b+js7qceue+IF4to//jY7ly69zhznazmR+PiX69cj35RKxW3Py8Krrj/n5t5+ePLkZUOWP8HBWsY0b81EIvaZWKyJ72H7fcNo5EzzyZiubwLOMUWMeJGrPeFxGd1wPV5aGnhy4cK7W4XC4nahMNR1bKUL9spZOQr7G1G3Y0SaxbhxAAAAAElFTkSuQmCC",
    horses: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAADeklEQVR4Xs3UWWhcZRjH4f+cOdvsS2Yms57Z4jTJnJROtpqENkmb2QxtCtFQ0YymUDGU0tRoA0rFqsVas4hWS4uiNiK1aBG1xSpSW1HUC0WkV4IXXtQmRajLhYLk9ftOmGEMiDe9cODHO3zwPec9czEgopvazQenK9H6cGAihr07Q+hrk/DAeBSTt4fwxL4mjA25sDCTxcxEFKcXNmJ0wCUUO1Xz+G0NpqP7U0JzAEJl2Cv+G1jboFL21YNsgTBen+2Szx0fQLlbFe8tenHqKR1bNyjy3WWPisN7U7UOTSZr0NLZEi2fL9L1jwr086d5Gu61JRafzNmvnS7T8vvs/EKRzsy10/K5ItIBIBbE6icUWM3vBTIa8MrTHdbLU5305cIW+u5Yga4xuIpe/7BAV98o0dU3i7T0Dpvv5enw/nXkDsh2FiSrCGSbJKN1SRHvPncXiZJAlya7DPCDo30G+PHJTXTpRD9dnB8wzq+8OkRXXhuiC8/0cIzGtscuO7ySjQW0ZSSj1rSEYl+UgzwDPPt4N710fztNdQeNObtzvQFePDJAP54p0A8ny9QYsZCzQaKoZuk1wEREhhZW0JmVYLeZDUzXHHxLjtTAhwsJmi5odGxMN9Av2LbfL+apJ+cjBpHTJ39lgGlNRiauYIo93eFeBTm8ISVzqNZm3UWjHT4aTIOmNwfp+I5W+uaxrXRfPkWOBg5KKy0ZxQ2TAGgRFTa7aEDVycsxdNt6F/U3WcnjECjMNjlSidNnz/aMP9gVprnSLTQzmCR/QCG7R/zVH1Im8MliL14+NCIbCMNgwi+JiFLZc2diX5smUi4uUTwg/GWzYMVqQWnp7ZL201tFE990qj1IL4600o5cIwfJ5ZFuYOGRVnP1tZwOobohnn+03duTUimuSQ/ZrVjxOEAMNDNQYgnBqJLp1ZVvOVzKWeb57+jySb/B5ZRWOHZ+d46yMTsB8DEUe+7wbOSgnhSzelx4gWF04uA2IwaaWLhVVwc5uKtgmXMH5K/dfvlzzI5k+twuieZHkxT2qfxCrZaYuYY0N+IPdvmUgda1qU39s3rG0BDYZuKB7Y2/7857aEuXOlwPRjSZ6gGXDTfWgjababa7RREZCB4HcU/JSbuG3PWX0d+h+tdcrn/lJpZJT4smABKH1oJmVpgfrI1tyed/1tksoyMj4f//j/032kXCk2YKR0MAAAAASUVORK5CYII=",
    siege: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAEh0lEQVR4Xq2Ue2yTZRjFz3frfStt13ZrM1rohlvLOsWBOhFkjAXkrlyVQESJI2AM4Q8zAhjAKKLLJPGCIBBiBk7FAGoiQQlzZoDbYBuwOBe2Qdvd3KV0vXzfvstr0wCJMZkx8fz55M3vOee8yUMRQvB/isW/qPat4gdvniaEvDOQ5tPfU7QuqxAIGXv7DoPFNwW7z/VkWG0AgHEdshTFfX9g45aoylJlbqkDFAJJryWhbB8l0zQmRgNgg72E0uAMMTOb29ML/6QxjpxG7ReqtraqET6B/vwigEGUjSVEV3uj7IwNKp7F5UJaoV8hApYzoq73hfU7L9LjRQ3cSyweMoowcSKiCiDOXmIgRooDIKlDnUr/L4cSmfM20s6XNoMxqyiaYWelIpvTNCmITABWEZni6T7XupUL6mSZcjz2VBlAs7jT9TvCw/2YohnBaEc9QChQLHC+k5IG5Qns82vXYaLbM8YCqWpAAKhoSp3tdCyblJ15sL8naM/IcoHh1GBZDj7/E5DEMRyorEJ7ywASkoKhe3HsP/Ae657kBkURdHW08imgLAhgWZozm81LtVrVTp2att+t/xlBDQtndg56RiKQwoOYs3AV3nh9K/bu5/FbfR0kSUJjQyOqq6uxaOF83uNx21IdvvnqbMx90pORLGFrOBKfGm69CjkaR1buNARCnQi11qKzrgbVBytSThYtKANN0yCE4MTxE7haf5V0B7pm7Nq+TUgBy2bma4djynZFlovnZCSgoxR4y5YhLduNcN9dDLdcRqxvGEM3ruDyhdPIMJuQk+OBLMsAAI5jFYlix/Yl60htObZn+RZ/rkN4ZnI62TbdSCo3LyCff7CNfLJjDakosSVnyXlROqmY6yQ1n+0j1Yc/JJVvVxDvZAdxWgxk0/rVypW6H1KslMMbHQNeRSEqi9UKS04eTLk+hEO30Xf9V/ARHiCA1mJC4cpNGBoJIxjsRrpBg2TnKCoqwo5du8Sm1puTAaSA0Gs4Sc0xSsdAFEbfDCSCbRj9owlClAcAmFwOeJdsgCyKOHnqW3AqNvUhOp0e71cdxJ3u23w4EuYeAu0WwymOpb9MCJJyvfY8gtcaEBkYhRAXkGa3IW/+BkxIT8ets8ehYwC1SoWar88mgVpcqbvAgwi2mUXT2h8CdTpmw9qFvtUuxwTSPSyDogAKgMmZmYxZjthwHy4deheJ0TgWrViFeDyOPE9WIt9laIgMddheXPOygPtij+1d9hyA13QaDo977fFLTT2x2jGdLc9qgrdkNfp6Amg7dxJajkNGySpIihzQ63U7rEamuiDXSuwFpThVU/q381UOgNA0RXLdFp7npZbmjhH/tV7RfPP4V5xeq0L+JD94rTnGcqpWSZQ/am67eToWjRJ/rhWzSlfggR5EbgUQAUCzDG151JtZunKex17sz+JEIYYEzw9muh/h9Vr1xSOHj71y9NOPa3768TthvAN7BMCzADwANBRF3TXo1U3Tp9pvOa2aQJwXu+SRdrWBJiH/lMyu5lvdGE/U0T1LAYC5D//H5o27z+C/6C8ohPDeWkjBBAAAAABJRU5ErkJggg==",
    plate: PNG + "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAB+UlEQVR4XpXTv2tTURjG8ZMOXSyIuCimLa0/EAoOlkYRwYg6iOLQyxVRUeQOgpOxChpTIw7VqHRyilIJDUjiFjA45Q9QyC5xioOZdbqoHJ/z0AfO5V6tDl/eM5x8eO9NYqy1qVZvnx5funJ0zJ3f1M5zNlfC3OtHizl3bj+7MFaOjvGsVAo7cWivjeOYNZtNNjU1maherzPcUdmgu3zq8Q0bRZEdDAbCMvPBlVuLhUwQEIG7a6tEh8Mh0dFoJIhnYV4/X9w7e01gYjuhr961ieIyAUBKIPFKpWLz+bwy3mYEmXCgrLCwIJQTuTtEwzC0nU6H59bzy/cFCmK1Wi0FVqsPCCk9BbZyIOfNqyctQW0mVJVKJR9kQRAkQGH9fp8JZD42iUsTE1uICcRMgMYYOz9/0AeND7Lq9eNC7VLAKZCY3l2v1yPaaDSUEagMEPcvIKTK5bJttVqZYLFYVCYTVHcuzfF9AuTsdrsCGUD25P26D9L4JxAf3BSEsTnIL2fndoFC9ch/B19Wz+XQLEqAM9O7tOV/g2fQL/TUQV4CiSFiiBhQ44PCtm1gMRqiTwfm9vigthPCgJo/gVvRWw/9jj7s3zdjd89OEwHmfo/cWBgSlgJd42gH+og+ox8b+JcjhwvEfBAZJCgTdLjgi+gh+oa+omUHeQlL9Rtnl6VdvZBRqgAAAABJRU5ErkJggg=="
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
  var STRUCTURE_ICONS = {
    trainingGround: ICONS.troops,
    targetRange: ICONS.troops,
    militaryAcademy: ICONS.troops,
    joustingYard: ICONS.troops,
    assemblyYard: ICONS.troops
  };
  var DEFAULT_STRUCTURE_ICON = ICONS.troops;

  // src/payload.js
  function tileKey(y, x) {
    return `${y}|${x}`;
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
    const rs = parseRs(tile);
    if (!rs) return tile?.b === WATER_BIOME;
    return rs.wood + rs.clay + rs.iron + rs.stone === 0;
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
  function isClaimable(tile, key, idx, settings2) {
    if (!tile || tile.sov !== 1) return false;
    if (tile.imp || tile.brg) return false;
    const claim = idx.claims.get(key);
    if (claim) {
      const rd = claim.rd;
      if (rd === "Yours" && settings2.ownClaimsAvailable) return true;
      if (rd === "Alliance" && settings2.allianceClaimsAvailable) return true;
      return false;
    }
    return true;
  }
  function isSettleable(tile) {
    if (!tile) return false;
    if (tile.set !== void 0) return tile.set === 1;
    if (tile.imp || tile.brg || tile.npc) return false;
    if (isWaterTile(tile)) return false;
    return tile.sov === 1 && tile.hos === 1;
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
      const parts = townString(town).split("|");
      const x = Number(parts[2]);
      const y = Number(parts[3]);
      const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };
      out.push({
        ...pos,
        // parts[0] is the town's name. Blank where the string is not the pipe
        // format, which the caller shows as the coordinates instead.
        name: parts[0] ?? "",
        own: town && town.rd === "Yours",
        rd: town && town.rd,
        key
      });
    }
    return out;
  }
  function collectNeighbourhood(payload, key, rClaim, idx, settings2) {
    const { x, y } = parseKey(key);
    const neighbours = [];
    const missing = [];
    for (let dy = -rClaim; dy <= rClaim; dy++) {
      for (let dx = -rClaim; dx <= rClaim; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nKey = tileKey(y + dy, x + dx);
        const tile = payload.data[nKey];
        if (!tile) {
          missing.push(nKey);
          continue;
        }
        if (!isClaimable(tile, nKey, idx, settings2)) continue;
        neighbours.push({
          dx,
          dy,
          food: foodOf(tile),
          key: nKey,
          i: tile.i,
          water: isWaterTile(tile),
          // Carried on the tile so the panel never repeats the lookup, and so a
          // plan travelling from the worker arrives with its descriptors already
          // on it. Null where nothing identifies the terrain.
          descriptor: descriptorFor(tile.i)
        });
      }
    }
    return { neighbours, missing };
  }

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
  function computeRRef(s) {
    const cal = s.rpCalibration;
    if (cal && cal.observedRpPerHour > 0) {
      const m = PRODUCTION_BASE - cal.atTax + (cal.prestige ? PRESTIGE_PRODUCTION_BONUS : 0);
      return cal.observedRpPerHour * 100 / m;
    }
    let base = LIBRARY_BASE_RP_L20;
    if (s.allembine) base += ALLEMBINE_RP_PER_LIBRARY_LEVEL * (s.libraryLevel ?? 20);
    return s.overflowingInsight ? base * OVERFLOWING_INSIGHT_FACTOR : base;
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
  function researchAt({ rRef, rpBonus = 0, tax }) {
    return rRef * (PRODUCTION_BASE - tax + rpBonus) / 100;
  }
  function basicProduction({ plots, yield: y, bonus, tax }) {
    return plots * y * (PRODUCTION_BASE - tax + bonus) / 100;
  }
  function distance(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  }
  function claimUpkeep(d, level, chancery) {
    const f = chancery ? CHANCERY_FACTOR : 1;
    return {
      rp: CLAIM_RP_PER_LEVEL_DISTANCE * level * d * f,
      gold: CLAIM_GOLD_PER_LEVEL_DISTANCE * level * d * f
    };
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
  function tRp({ uRp, rRef, rpBonus = 0, minimum = 0 }) {
    return PRODUCTION_BASE + rpBonus - 100 * (uRp + minimum) / rRef;
  }
  function tRes({ milsovAssignments, plots, settings: settings2 = {} }) {
    const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };
    const upkeep = milsovUpkeep(milsovAssignments ?? []);
    const fenced = BASIC_RESOURCES.some((res) => resourceMinimum(settings2, res) > 0);
    if (upkeep <= 0 && !fenced) return none;
    const { yield: y, measured } = computeBasicYield(settings2);
    let worst = Infinity;
    let binding = null;
    for (const res of BASIC_RESOURCES) {
      const need = upkeep + resourceMinimum(settings2, res);
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
      rp: researchAt({ rRef: computeRRef(s), rpBonus: prestigeBonus(s, "research"), tax }),
      gold: GOLD_PER_TAX_POP * tax * consumption
    };
    const out = {
      tax,
      food: base.food - consumption,
      rp: base.rp - (uRp ?? 0),
      gold: base.gold - (uGold ?? 0),
      upkeep,
      indicative: !measured
    };
    for (const res of BASIC_RESOURCES) {
      base[res] = basicProduction({
        plots: s.plots[res],
        yield: y,
        bonus: resourceBonus(s, res),
        tax
      });
      out[res] = base[res] - upkeep;
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
      upkeep = Math.min(upkeep, produced - resourceMinimum(s, res));
    }
    return {
      rp: Math.max(0, researchAt({
        rRef: computeRRef(s),
        rpBonus: prestigeBonus(s, "research"),
        tax
      }) - uRp - resourceMinimum(s, "research")),
      // A minimum bigger than the production it protects leaves nothing to spend
      // rather than a negative budget.
      upkeep: Math.max(0, upkeep),
      slots
    };
  }
  function descriptorBonus(tile, structure) {
    const d = tile?.descriptor;
    return d && structure && d.sovKey === structure ? d.bonus ?? 0 : 0;
  }
  function planMilsov({ tiles, headroom, chancery, structure }) {
    const EPS2 = 1e-9;
    const f = chancery ? CHANCERY_FACTOR : 1;
    const n = Math.min(tiles.length, Math.floor(headroom.slots));
    const D = [0];
    for (let i = 0; i < n; i++) D.push(D[i] + tiles[i].d);
    const rpOf = (m2) => CLAIM_RP_PER_LEVEL_DISTANCE * f * D[m2];
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
        rp: counts.reduce((sum, m2) => sum + rpOf(m2), 0),
        upkeep: counts.reduce((sum, m2, j) => sum + MILSOV_UPKEEP_STEP[j] * m2, 0),
        buildings: levels.length
      };
    };
    if (rpOf(n) * MILSOV_MAX_LEVEL <= headroom.rp + EPS2 && layerTotal * n <= headroom.upkeep + EPS2) {
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
      while (vMax < cap && rp + rpOf(vMax + 1) <= headroom.rp + EPS2 && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS2) vMax++;
      for (let v = vMax; v >= 0; v--) {
        if (best) {
          const bound = units + (MILSOV_MAX_LEVEL - j) * v;
          if (bound < best.units) break;
          if (bound === best.units && rp >= best.rp - EPS2) break;
        }
        m[j] = v;
        search(j + 1, units + v, rp + rpOf(v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);
      }
      m[j] = 0;
    };
    search(0, 0, 0, 0, n);
    return best ? finish(best.counts) : empty;
  }
  function milsovClaims({ tiles, levels, structure, chancery }) {
    return levels.map((level, i) => ({
      ...tiles[i],
      structure,
      sovLevel: level,
      buildingLevel: level,
      ...claimUpkeep(tiles[i].d, level, chancery)
    }));
  }
  function milsovBlockedBy({ hosts, free, headroom, chancery }) {
    if (free.length === 0) return "tiles";
    if (hosts.length === 0) return "water";
    if (headroom.slots < 1) return "slots";
    if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return "upkeep";
    const cheapest = CLAIM_RP_PER_LEVEL_DISTANCE * (chancery ? CHANCERY_FACTOR : 1) * hosts[0].d;
    if (headroom.rp + 1e-9 < cheapest) return "rp";
    return null;
  }
  function prepareSite({ neighbours, settings: settings2 }) {
    const s = settings2;
    const chancery = !!s.chancery;
    const maxBuildings = s.maxBuildings ?? 20;
    const byDistance = neighbours.map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) })).sort((a, b) => a.d - b.d || a.food - b.food);
    const foodCandidates = byDistance.filter((t) => t.food > 0).map((t) => {
      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery);
      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };
    });
    const rpBonus = prestigeBonus(s, "research");
    const budget = Math.max(0, Math.round(researchAt({ rRef: computeRRef(s), rpBonus, tax: 0 })));
    return {
      settings: s,
      chancery,
      structure: s.milsovStructure || null,
      k: computeK(s.plots.food),
      bOther: computeBOther(s),
      consumption: computeConsumption(s),
      rRef: computeRRef(s),
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
    const produced = researchAt({ rRef: ctx.rRef, rpBonus: ctx.rpBonus, tax });
    return produced - lo - ctx.minRp < -EPS ? null : lo;
  }
  function planSiteAt(ctx, tax) {
    const s = ctx.settings;
    const spend = Number.isFinite(tax) ? foodSpendFor(ctx, tax) : null;
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
      rp: tRp({ uRp, rRef: ctx.rRef, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
      res: resCeiling.indicative ? Infinity : resCeiling.ceiling
    });
    return {
      tax,
      tMax: ceiling.value,
      binding: ceiling.binding,
      sFood,
      spend,
      uRp,
      uGold,
      goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),
      // What running this plan leaves per hour, at the tax it is run at, so the
      // ceiling that binds reads 0 and the rest read as headroom.
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
        rp: tRp({ uRp: spend, rRef: ctx.rRef, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),
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
      // What the site is reported and ranked at: the highest whole number its food
      // plan holds. `tMaxExact` is what the arithmetic solved for, kept because it
      // is the true ceiling — and because it is not a rate anyone can set.
      tMax: plan.tax,
      tMaxExact: winner.tMax,
      // Which ceiling stopped the tax going higher is a question about the exact
      // one; the plan's own ceiling has the rounding slack in it.
      binding: winner.binding,
      milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,
      // Where the minimum is met, if it is not met for free: the highest tax that
      // still delivers it. Null means the free plan already covers it, or nothing
      // in the acceptable range does.
      milsovMinTax: reach ? reach.tax : null,
      milsovMinBonusAt: reach ? reach.bonus : null,
      // Only a genuine shortfall now: not reachable anywhere the user would accept.
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
  var FOCUS_TAX_FLOOR = -100;
  var DEFAULT_FOCUS = {
    x: null,
    y: null,
    radius: null,
    // null follows R_claim from the city configuration
    tax: FOCUS_DEFAULT_TAX,
    // On, because the tile as you intend to terraform it is the usual question
    // here; its ratings today describe ground nobody is going to leave alone.
    useConfiguredPlots: true,
    // Off by default, because it only means anything on a tile that is already
    // yours, and the common case here is unsettled ground.
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
        // Blank tracks the configuration; a number overrides it for this run only.
        radius: toInt(raw?.radius, { min: 1, max: 6, fallback: null }),
        // Whole points only, since the game accepts no other rate — a fractional
        // request would answer a question the user cannot act on.
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
  function claimLevel(claim) {
    const n = Number(String(claim?.s ?? "").split("|")[0]);
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
  }
  function keptClaims({ payload, centre, radius, idx, chancery }) {
    const claims = [];
    let rp = 0;
    let unknownLevel = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const key = tileKey(centre.y + dy, centre.x + dx);
        const claim = idx.claims.get(key);
        if (!claim || claim.rd !== "Yours") continue;
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
    return { claims, rp, unknownLevel };
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
        message: "No map payload observed yet. Pan or zoom the map, then try again."
      };
    }
    const radius = focusRadius(focus, settings2);
    const key = tileKey(focus.y, focus.x);
    const centre = payload.data[key];
    if (!centre) {
      return {
        ok: false,
        reason: "centre-missing",
        message: `${focus.x}|${focus.y} is not in the last map payload. Pan the map over that tile, then try again.`
      };
    }
    const idx = indexPayload(payload);
    const rs = parseRs(centre);
    const { plots, source: plotSource, note: plotNote } = resolvePlots(focus, settings2, rs);
    let effective = { ...settings2, plots, rClaim: radius };
    const kept = focus.preserveSovereignty ? keptClaims({ payload, centre: focus, radius, idx, chancery: !!settings2.chancery }) : { claims: [], rp: 0, unknownLevel: 0 };
    if (focus.preserveSovereignty) {
      effective = {
        ...effective,
        ownClaimsAvailable: false,
        keptClaimRp: kept.rp,
        resourceMinimums: {
          ...effective.resourceMinimums,
          research: (effective.resourceMinimums?.research ?? 0) + kept.rp
        }
      };
    }
    const { neighbours, missing } = collectNeighbourhood(payload, key, radius, idx, effective);
    if (missing.length) {
      const ring = (2 * radius + 1) ** 2 - 1;
      return {
        ok: false,
        reason: "incomplete",
        message: `${missing.length} of the ${ring} tiles within radius ${radius} of ${focus.x}|${focus.y} are outside the last map payload. Pan the map so the whole area is on screen, then try again.`,
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
    const floor = Math.min(settings2.tMin ?? 0, ceiling);
    const requested = focus.tax;
    const tax = Math.min(ceiling, Math.max(floor, requested));
    const plan = planSiteAt(ctx, tax) ?? base;
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
      // Both kept so the caller can re-plan this site without a tile, which needs
      // the settings this plan was made with — the pane overrides two of them.
      neighbours,
      settings: effective,
      kept,
      claimable: neighbours.length,
      ring: (2 * radius + 1) ** 2 - 1,
      ctx,
      base,
      plan,
      tax,
      requestedTax: requested,
      // Set when the clamp above moved the tax; `plan` is then at `ceiling`.
      aboveCeiling: requested > ceiling + 1e-9,
      ceiling,
      floor
    };
  }

  // src/panel.js
  var CSS = `
/* The panel is injected into the host page, so its elements are also matched by
   the game's own stylesheet. A colour inherited from the panel root loses to any
   rule the host sets on h2, table or td, which is what turned the heading and the
   results table dark red. Every element gets its own colour and font here, and
   this block is first so the specific rules below still win. */
.sov-panel,.sov-panel *{color:#e6e6e6;background:transparent;text-shadow:none;
  text-transform:none;letter-spacing:normal;font:12px/1.4 system-ui,sans-serif}
.sov-panel{position:fixed;top:0;right:0;width:420px;max-height:100vh;overflow:auto;
  z-index:99999;background:#1b1b1b;border-left:1px solid #444;
  box-shadow:-2px 0 8px rgba(0,0,0,.5)}
.sov-panel h2{margin:0;padding:8px 10px;font-size:13px;font-weight:600;color:#fff;
  background:#2a2a2a;cursor:pointer}
.sov-panel h2 .sov-about{float:right;color:#8a8a8a;text-decoration:none}
.sov-panel h2 .sov-about:hover{color:#fff}
.sov-body{padding:8px 10px}
.sov-panel table{width:100%;border-collapse:collapse}
.sov-panel th,.sov-panel td{padding:2px 4px;border-bottom:1px solid #333;text-align:right}
.sov-panel th{font-weight:600;color:#b9c4b9}
.sov-panel th:first-child,.sov-panel td:first-child{text-align:left}
.sov-panel button{background:#3a5;color:#fff;border:0;padding:5px 10px;cursor:pointer}
.sov-panel button.sec{background:#444}
.sov-panel button[disabled]{background:#333;color:#888;cursor:not-allowed}
.sov-row{cursor:pointer}
.sov-detail{background:#222;font-size:11px}
.sov-detail-actions{margin:2px 0 6px}
.sov-flag{color:#e94}
.sov-collapsed .sov-body{display:none}
.sov-selected>td{background:#243}
.sov-form fieldset{border:1px solid #333;margin:0 0 8px;padding:4px 8px 6px}
.sov-form legend{color:#9c9;padding:0 4px}
.sov-form input,.sov-form select{background:#111;color:#ddd;border:1px solid #444;
  padding:1px 3px;font:inherit}
.sov-f{display:flex;align-items:center;justify-content:space-between;gap:6px;margin:3px 0}
.sov-f>span{flex:1}
.sov-f input[type=number]{width:76px;text-align:right}
.sov-f select{max-width:170px}
.sov-gated{opacity:.4}
.sov-plot-fields{display:flex;gap:4px;margin:2px 0}
.sov-plot-fields label{flex:1;text-align:center;font-size:10px;color:#b5b5b5}
.sov-plot-fields input{width:100%;text-align:center}
.sov-plot-sum{display:flex;justify-content:space-between;align-items:center;gap:6px}
.sov-bad{color:#e66;font-weight:bold}
.sov-ok{color:#6c6}
.sov-derived{margin:2px 0 0;padding-left:16px;font-size:11px}
.sov-derived .sov-off{color:#888}
.sov-derived .sov-on{color:#6c6}
.sov-hint{color:#a9a9a9;font-size:11px;margin:2px 0}
.sov-build{color:#888;font-size:10px;font-weight:normal}
.sov-tax{margin:6px 0;padding-top:4px;border-top:1px solid #333}
.sov-tax input[type=range]{width:190px}
.sov-tax output{color:#6bf;font-variant-numeric:tabular-nums}
.sov-desc{display:block;font-size:9px;line-height:1.15;opacity:.85;word-break:break-word}
.sov-balance{margin:4px 0}
.sov-balance td:nth-child(n+2){font-variant-numeric:tabular-nums}
.sov-balance th,.sov-balance td{padding:2px 3px}
/* Sized to the line rather than to the art, so a row's height stays its text's. */
.sov-panel img.sov-ico{width:12px;height:12px;vertical-align:-2px;margin-right:4px;
  image-rendering:pixelated}
.sov-plot-fields label .sov-ico{display:block;margin:0 auto 1px}
.sov-tabs{display:flex;gap:2px;margin:0 0 8px;border-bottom:1px solid #444}
.sov-tabs button{background:#2a2a2a;color:#b5b5b5;padding:5px 9px;border-bottom:2px solid transparent}
.sov-tabs button.on{background:#333;color:#fff;border-bottom-color:#3a5}
.sov-xy{display:flex;gap:4px}
.sov-xy input{width:60px;text-align:right}
.sov-focus-out h3{margin:8px 0 2px;font-size:12px;font-weight:600;color:#fff}
.sov-note{color:#a9a9a9;font-size:11px;margin:2px 0}
.sov-warn{color:#e66;font-weight:bold;font-size:11px;margin:2px 0}
/* The claim grid. Cell colours are qualified with .sov-grid and the table width
   with .sov-panel, because the panel's own table and td rules carry an element in
   the selector and a bare class loses to them. */
.sov-grid-wrap{overflow-x:auto;margin:6px 0}
.sov-panel table.sov-grid{width:auto;border-collapse:separate;border-spacing:2px}
.sov-grid th{padding:0 2px;border:0;text-align:center;font-size:10px;font-weight:400;
  color:#8a8a8a;font-variant-numeric:tabular-nums}
.sov-grid td{width:46px;height:38px;padding:1px;border:1px solid #303030;text-align:center;
  vertical-align:middle;background:#1e1e1e}
.sov-grid img{width:12px;height:12px;vertical-align:-2px;image-rendering:pixelated}
.sov-lv{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;color:#8a8a8a}
.sov-cv{display:block;font-size:11px;font-variant-numeric:tabular-nums}
.sov-grid .sov-cell-town{background:#243;border-color:#6bf}
.sov-grid .sov-cell-town .sov-lv{color:#6bf}
.sov-grid .sov-cell-food{background:#1d2a1d;border-color:#3a5}
.sov-grid .sov-cell-food .sov-lv{color:#8d8}
.sov-grid .sov-cell-mil{background:#2a241a;border-color:#a83}
.sov-grid .sov-cell-mil .sov-lv{color:#eb8}
.sov-grid .sov-cell-free .sov-cv{color:#7d7d7d}
.sov-grid .sov-cell-water{background:#16202a;border-color:#2a3a4a}
/* Kept claims: neither a tile the plan chose nor one it could not have, so a
   third colour rather than either of theirs. */
.sov-grid .sov-cell-kept{background:#1b2430;border-color:#4a6a8a}
.sov-grid .sov-cell-kept .sov-lv{color:#8ab}
.sov-grid .sov-cell-kept .sov-cv{color:#7d8fa0}
.sov-legend .sov-key-kept{color:#8ab}
/* A tile the user crossed out and one the game never offered are both tiles the
   plan cannot have, so they differ in weight, not in kind. */
.sov-grid .sov-cell-out{background:#2b1a1a;border-color:#8a3a3a}
.sov-grid .sov-cell-out .sov-x{color:#e55}
.sov-grid .sov-cell-none{background:#161616;border-color:#252525}
.sov-grid .sov-cell-none .sov-x{color:#3f3f3f}
.sov-x{display:block;font-size:13px;line-height:1.3}
.sov-grid .sov-pick{cursor:pointer}
.sov-grid .sov-pick:hover{outline:1px solid #6bf}
.sov-legend{color:#a9a9a9;font-size:10px;margin:2px 0 0}
.sov-legend b{font-weight:600;font-size:10px}
.sov-legend .sov-key-food{color:#8d8}
.sov-legend .sov-key-mil{color:#eb8}
.sov-legend .sov-key-free{color:#7d7d7d}
.sov-legend .sov-key-out{color:#e55}
/* The bonus is the return on the tax, so it is sized to be read at a glance, in
   the amber the grid gives military claims. */
.sov-mil{margin:6px 0;padding:4px 6px;background:#221d15;border-left:2px solid #a83}
.sov-mil .sov-mil-bonus{font-size:17px;font-weight:700;color:#eb8;
  font-variant-numeric:tabular-nums}
.sov-mil .sov-mil-what{color:#eb8}
.sov-mil .sov-hint{display:block;margin:1px 0 0}
/* Drawn even while empty: the red frame is the warning that anything typed here
   beats the settings above. The filled state deepens it rather than adding it. */
.sov-form fieldset.sov-override{border-color:#a33;background:#231a1a;margin:6px 0 8px}
.sov-form fieldset.sov-override.sov-override-on{border-color:#e55;background:#2a1b1b}
.sov-form .sov-override>legend{color:#e88;font-weight:600}
.sov-form .sov-override.sov-override-on>legend{color:#f99}
/* The host page's own [hidden] handling cannot be relied on: an author rule like
   .sov-f{display:flex} beats the user-agent one whatever its specificity, so
   anything this panel hides needs a rule of its own, last so it wins on order. */
.sov-panel [hidden]{display:none}
`;
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
  function milsovPlanText(plan) {
    if (!plan?.milsov?.length) return "";
    return `${milsovSplitText(plan)} \u2014 +${plan.milsovBonus}% military unit production, upkeep ${(plan.milsovUpkeep ?? 0).toLocaleString("en-GB")}/hr of wood, clay, iron and stone.`;
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
  var SETTINGS_FIELDS = [
    { key: "tMin", group: "Ranking", label: "Minimum Tax (%)", type: "number", min: -100, max: 100 },
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
    {
      key: "flourMill",
      group: "City Food",
      label: `Flour Mill at Level 20 (+${FLOUR_MILL_L20}%)`,
      type: "checkbox"
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
    {
      key: "libraryLevel",
      group: "Research",
      label: "Library Level",
      type: "number",
      min: 0,
      max: 20,
      integer: true,
      fallback: 20,
      overriddenWhen: (s) => !!s.rpCalibration
    },
    {
      key: "allembine",
      group: "Research",
      label: "Allembine Research",
      type: "checkbox",
      overriddenWhen: (s) => !!s.rpCalibration
    },
    {
      key: "overflowingInsight",
      group: "Research",
      label: "Overflowing Insight (\xD71.5)",
      type: "checkbox",
      overriddenWhen: (s) => !!s.rpCalibration
    },
    {
      key: "rpCalibration",
      group: "Research",
      label: "Measured Research Output",
      type: "calibration"
    },
    {
      key: "resourceBoosters",
      group: "Basic Resources",
      label: "Booster Buildings at Level 20",
      type: "boosters"
    },
    // Its own group because it spans everything the city produces — the four basic
    // resources, food and research — so it belongs under none of theirs.
    {
      key: "prestige",
      group: "Prestige",
      label: "Prestige Production Boost",
      type: "prestige"
    },
    // Its own group: a floor can be asked for on any of the six productions, so
    // it belongs under no single one.
    {
      key: "resourceMinimums",
      group: "Minimum Surplus",
      label: "Minimum Surplus per Hour",
      type: "minimums"
    },
    { key: "chancery", group: "Sovereignty", label: "Chancery of Estates (\xD70.6 upkeep)", type: "checkbox" },
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
    { key: "dOther", group: "Neighbours", label: "Minimum Distance to Other Players", type: "number", min: 0, max: 100 },
    { key: "dOwn", group: "Neighbours", label: "Minimum Distance to Your Cities", type: "number", min: 0, max: 100 },
    { key: "ownClaimsAvailable", group: "Neighbours", label: "Treat Your Own Claims as Available", type: "checkbox" },
    { key: "allianceClaimsAvailable", group: "Neighbours", label: "Treat Alliance Claims as Available", type: "checkbox" }
  ];
  function attr(name, v) {
    return v === void 0 || v === null ? "" : ` ${name}="${escapeHtml(v)}"`;
  }
  function numberFieldHtml(f, value) {
    return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <input type="number" data-key="${f.key}"${attr("min", f.min)}${attr("max", f.max)}
      step="${f.integer ? 1 : "any"}"${attr("value", value)}></label>`;
  }
  function selectFieldHtml(f, value) {
    const opts = f.options.map((o) => `<option value="${escapeHtml(o.value)}"${String(o.value) === String(value) ? " selected" : ""}>${escapeHtml(o.label)}</option>`).join("");
    return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <select data-key="${f.key}">${opts}</select></label>`;
  }
  function checkboxFieldHtml(f, value) {
    return `<label class="sov-f" data-key="${f.key}"><span>${escapeHtml(f.label)}</span>
    <input type="checkbox" data-key="${f.key}"${value ? " checked" : ""}></label>`;
  }
  function plotsFieldHtml(f, plots) {
    const fields = PLOT_KEYS.map((p) => `<label>${productionLabel(p)}<input type="number" data-plot="${p}" min="0" max="${PLOT_TOTAL}"
      step="1" value="${plots?.[p] ?? 0}"></label>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} \u2014 how the settle tile's ${PLOT_TOTAL} plots are
        split. The five must total ${PLOT_TOTAL}. Terraforming applies to the settle tile only.</p>
      <div class="sov-plot-fields">${fields}</div>
      <div class="sov-plot-sum">
        <span class="sov-plot-total"></span>
        <button type="button" class="sov-prefill sec">Prefill from Selected Tile</button>
      </div>
      <p class="sov-hint sov-prefill-src"></p>
    </div>`;
  }
  function calibrationFieldHtml(f, cal) {
    return `<fieldset class="sov-f-block sov-override" data-key="${f.key}">
      <legend>Override \u2014 ${escapeHtml(f.label)}</legend>
      <p class="sov-hint">Read your city's actual research output off the game and enter it
        here. While a figure is set it replaces the Library Level, Allembine Research and
        Overflowing Insight settings above, which grey out to show they no longer apply.</p>
      <div class="sov-f"><span>Observed research per hour</span>
        <input type="number" data-cal="observedRpPerHour" min="0" step="any"
          placeholder="blank = off"${attr("value", cal?.observedRpPerHour)}></div>
      <div class="sov-f"><span>\u2026at this tax rate (%)</span>
        <input type="number" data-cal="atTax" min="0" max="100" step="any"
          value="${cal?.atTax ?? 0}"></div>
      <div class="sov-f"><span>\u2026with the Prestige boost running</span>
        <input type="checkbox" data-cal="prestige"${cal?.prestige ? " checked" : ""}></div>
      <p class="sov-hint sov-rp-read"></p>
    </fieldset>`;
  }
  function boostersFieldHtml(f, boosters) {
    const boxes = BASIC_RESOURCES.map((res) => `<label class="sov-f" data-booster-row="${res}"><span>${RESOURCE_BOOSTERS[res]} \u2014
      ${productionLabel(res)} (+${RESOURCE_BOOSTER_BONUS}%)</span>
      <input type="checkbox" data-booster="${res}"${boosters?.[res] ? " checked" : ""}></label>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} \u2014 each adds ${RESOURCE_BOOSTER_BONUS}% to that
        resource's production percentage, the same way the Flour Mill adds to food. It is added
        to that percentage rather than multiplied into it, so it is worth a straight
        ${RESOURCE_BOOSTER_BONUS} points of tax headroom against the resource's ceiling.</p>
      ${boxes}
    </div>`;
  }
  function prestigeFieldHtml(f, prestige) {
    const boxes = PRESTIGE_KEYS.map((key) => `<label class="sov-f" data-prestige-row="${key}"><span>${productionLabel(key)}
      (+${PRESTIGE_PRODUCTION_BONUS}%)</span>
      <input type="checkbox" data-prestige="${key}"${prestige?.[key] ? " checked" : ""}></label>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">+${PRESTIGE_PRODUCTION_BONUS}% on the production percentage,
        cumulative with spells and sovereignty. Added rather than multiplied, so each is worth
        ${PRESTIGE_PRODUCTION_BONUS} points of tax headroom \u2014 half a booster building. Tick
        only what the boost is actually running on: these move every ceiling they touch.</p>
      ${boxes}
    </div>`;
  }
  function minimumsFieldHtml(f, minimums) {
    const boxes = MINIMUM_KEYS.map((key) => `<label class="sov-f" data-minimum-row="${key}"><span>${productionLabel(key)} \u2014 keep at least</span>
      <input type="number" data-minimum="${key}" min="0" step="1"
        value="${minimums?.[key] ?? 0}"></label>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      <p class="sov-hint">${escapeHtml(f.label)} \u2014 how much of each must still be free once
        the plan is paid for: the four resources after sovereignty upkeep, food after the
        town has eaten, research after the claims. Zero spends the lot, which is what a
        city sitting exactly on a ceiling does \u2014 it can run what it has placed and never
        build, grow or trade on top of it. Each figure lowers the ceiling it belongs to by
        its own worth in production points.</p>
      ${boxes}
    </div>`;
  }
  function milsovFieldHtml(f, structure) {
    const opts = MILSOV_STRUCTURES.map((s) => `<option value="${s.key}"${s.key === structure ? " selected" : ""}>${escapeHtml(s.name)}</option>`).join("");
    return `<div class="sov-f-block" data-key="${f.key}">
      <label class="sov-f"><span>${escapeHtml(f.label)}</span>
        <select data-key="${f.key}" title="Which structure to place on the tiles the food plan leaves free">
          <option value=""${structure ? "" : " selected"}>None \u2014 food only</option>${opts}</select></label>
      <p class="sov-hint">Food is planned first and sets the tax. Military sovereignty is
        then fitted into what that plan leaves over \u2014 the research it did not spend, the
        tiles it did not claim, and what the city can still afford to run \u2014 so it never
        costs the site a point of tax. Each result says how much it fitted and what one
        more point of tax would buy. The minimum below drops sites that fit less than
        you want; it does not make them fit more.</p>
    </div>`;
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
      case "boosters":
        return boostersFieldHtml(f, v);
      case "prestige":
        return prestigeFieldHtml(f, v);
      case "minimums":
        return minimumsFieldHtml(f, v);
      case "milsov":
        return milsovFieldHtml(f, v);
      default:
        return numberFieldHtml(f, v ?? f.fallback);
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
      const extra = g.fields.some((f) => f.key === "isCapital") ? '<ul class="sov-derived"></ul>' : "";
      return `<fieldset><legend>${escapeHtml(g.name)}</legend>
      ${g.fields.map((f) => fieldHtml(f, settings2)).join("")}${extra}</fieldset>`;
    }).join("");
    return `<form class="sov-form">
      ${body}
      <p class="sov-hint sov-derived-food"></p>
      <p><button type="button" class="sov-reset sec">Reset to Defaults</button></p>
      <p class="sov-hint">This configuration is saved in this browser as you edit it and
        restored next time. It is applied to the map on the next Scan, and to a single
        tile on the next Optimise.</p>
      <p class="sov-hint sov-store-note"></p>
    </form>`;
  }
  function focusFormHtml(focus, settings2) {
    const f = { ...DEFAULT_FOCUS, ...focus };
    const rClaim = Math.round(settings2?.rClaim ?? 2);
    return `<form class="sov-focus-form">
      <fieldset><legend>Tile</legend>
        <label class="sov-f"><span>One of Your Towns</span>
          <select class="sov-town-pick"><option value="">\u2014</option></select></label>
        <p class="sov-hint sov-town-note">Fills the coordinates below from a town of yours on
          the map. For a town you have already built out, tick Preserve Existing Sovereignty
          so the plan accounts for the claims it is already paying for.</p>
        <label class="sov-f"><span>Coordinates \u2014 x | y</span>
          <span class="sov-xy">
            <input type="number" data-focus="x" step="1" placeholder="x"${attr("value", f.x)}>
            <input type="number" data-focus="y" step="1" placeholder="y"${attr("value", f.y)}>
          </span></label>
        <label class="sov-f"><span>Sovereignty Radius</span>
          <input type="number" data-focus="radius" min="1" max="6" step="1"
            placeholder="${rClaim}"${attr("value", f.radius)}></label>
        <p class="sov-hint">How far out sovereignty may be placed. Blank follows the claim
          radius in City Configuration, currently ${rClaim}.</p>
      </fieldset>
      <fieldset><legend>Plan</legend>
        <label class="sov-f"><span>Starting Tax (%)</span>
          <input type="number" data-focus="tax" min="${FOCUS_TAX_FLOOR}" max="100" step="1"
            value="${f.tax ?? FOCUS_DEFAULT_TAX}"></label>
        <label class="sov-f"><span>Use the Plot Allocation from City Configuration</span>
          <input type="checkbox" data-focus="useConfiguredPlots"${f.useConfiguredPlots ? " checked" : ""}></label>
        <p class="sov-hint">On, the plan uses the ${PLOT_TOTAL}-plot allocation from City
          Configuration \u2014 the tile as you intend to terraform it. Off, it uses the tile's own
          resource ratings, as the map reports them today.</p>
        <label class="sov-f"><span>Preserve Existing Sovereignty</span>
          <input type="checkbox" data-focus="preserveSovereignty"${f.preserveSovereignty ? " checked" : ""}></label>
        <p class="sov-hint">For a tile you have already settled. On, claims you already hold
          inside the radius are kept as they are: they are drawn on the grid and the research
          and gold they already cost are taken off the top, so the plan is what you can still
          add. Off, the plan is drawn as though the ground were empty.</p>
      </fieldset>
      <p><button type="button" class="sov-focus-run">Optimise</button></p>
      <p class="sov-hint">Everything else \u2014 research, city food, chancery, the building cap
        and which military structure to place \u2014 comes from City Configuration. Any tile can
        be examined here, including one already settled, claimed, or too near a town.</p>
    </form>
    <div class="sov-focus-status"></div>
    <div class="sov-focus-out"></div>`;
  }
  function ownTowns(payload) {
    const seen = /* @__PURE__ */ new Map();
    for (const t of extractTowns(payload)) {
      if (!t.own || !Number.isFinite(t.x) || !Number.isFinite(t.y)) continue;
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
      return `<li class="${active ? "sov-on" : "sov-off"}">${name} +${bonus}% \u2014 ${active ? "active" : `inactive (${why})`}</li>`;
    }).join("");
  }
  function createPanel({ onScan, onExport, initialSettings, onSettingsChange, getPayload }) {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    const root = document.createElement("div");
    root.className = "sov-panel";
    const opening = initialSettings ?? DEFAULT_SETTINGS;
    root.innerHTML = `
    <h2>Sovereignty Scanner <span class="sov-build"></span><a class="sov-about"
      href="https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/blob/main/LICENSE"
      target="_blank" rel="noopener" title="Unofficial fan tool. Illyriad, its game data and
the icon art are the intellectual property of Illyriad Games Limited \u2014 click for the
licence and full copyright notice.">\u24D8</a></h2>
    <div class="sov-body">
      <nav class="sov-tabs">
        <button type="button" data-tab="scan" class="on">Site Search</button>
        <button type="button" data-tab="focus">Optimal Sovereignty</button>
        <button type="button" data-tab="config">City Configuration</button>
      </nav>
      <section data-pane="scan">
        <p><button class="sov-scan">Scan</button>
           <button class="sov-export sec">Export CSV</button></p>
        <div class="sov-status"></div>
        <div class="sov-results"></div>
        <div class="sov-diagnostics"></div>
      </section>
      <section data-pane="focus" hidden>${focusFormHtml(DEFAULT_FOCUS, opening)}</section>
      <section data-pane="config" hidden>${settingsFormHtml(opening)}</section>
    </div>`;
    root.querySelector(".sov-build").textContent = false ? "dev" : "1.0.0";
    document.body.appendChild(root);
    const $ = (sel) => root.querySelector(sel);
    const form = $(".sov-form");
    const scanBtn = $(".sov-scan");
    let rendered = [];
    let selected = null;
    let incomplete = [];
    root.querySelector("h2").addEventListener("click", (e) => {
      if (e.target.closest(".sov-about")) return;
      root.classList.toggle("sov-collapsed");
    });
    scanBtn.addEventListener("click", onScan);
    $(".sov-export").addEventListener("click", onExport);
    function showTab(name) {
      root.querySelectorAll(".sov-tabs button").forEach((t) => {
        t.classList.toggle("on", t.dataset.tab === name);
      });
      root.querySelectorAll("[data-pane]").forEach((p) => {
        p.hidden = p.dataset.pane !== name;
      });
      if (name === "focus") syncFocusRadiusHint();
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
            out[f.key] = form.querySelector(`input[data-key="${f.key}"]`).checked;
            break;
          case "select": {
            const v = form.querySelector(`select[data-key="${f.key}"]`).value;
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
          default:
            out[f.key] = clampNumber(form.querySelector(`input[data-key="${f.key}"]`).value, f);
        }
      }
      return { settings: out, errors };
    }
    function writeSettings(s) {
      for (const f of SETTINGS_FIELDS) {
        const v = s[f.key];
        switch (f.type) {
          case "checkbox":
            form.querySelector(`input[data-key="${f.key}"]`).checked = !!v;
            break;
          case "select":
            form.querySelector(`select[data-key="${f.key}"]`).value = String(v);
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
          default:
            form.querySelector(`input[data-key="${f.key}"]`).value = v ?? f.fallback ?? "";
        }
      }
      refresh();
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
      const total = form.querySelector(".sov-plot-total");
      total.className = `sov-plot-total ${plots.ok ? "sov-ok" : "sov-bad"}`;
      total.textContent = `Total ${plots.total} / ${PLOT_TOTAL}${plots.ok ? "" : ` \u2014 ${plots.message}`} \xB7 ${computeK(plots.plots.food).toFixed(2)} food/hr per production point`;
      form.querySelector(".sov-derived").innerHTML = capitalDerivedHtml(s);
      const bOther = computeBOther(s);
      form.querySelector(".sov-derived-food").textContent = `City food bonuses total ${bOther >= 0 ? "+" : ""}${bOther}% on food production.`;
      const rp = Math.round(researchAt({
        rRef: computeRRef(s),
        rpBonus: prestigeBonus(s, "research"),
        tax: 0
      })).toLocaleString("en-GB");
      form.querySelector(".sov-rp-read").textContent = s.rpCalibration ? `In use: ${rp} research per hour at 0% tax, from your reading.` : `In use: ${rp} research per hour at 0% tax, from the settings above.`;
      scanBtn.disabled = !plots.ok;
      scanBtn.title = plots.ok ? "" : "Settle plot allocation must sum to 25";
    }
    form.addEventListener("submit", (e) => e.preventDefault());
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
      }
    }
    function drawIncomplete() {
      $(".sov-diagnostics").innerHTML = incomplete.length ? `<p class="sov-hint">${incomplete.length} ${incomplete.length === 1 ? "site was" : "sites were"} skipped because the map data does
        not reach all the way around them. Zoom out or pan so the whole area is on screen,
        then scan again.</p>` : "";
    }
    const focusForm = $(".sov-focus-form");
    function syncFocusRadiusHint() {
      const { settings: s } = readSettings();
      focusForm.querySelector('[data-focus="radius"]').placeholder = String(Math.round(s.rClaim ?? 2));
      syncTownPicker();
    }
    function syncTownPicker() {
      const sel = focusForm.querySelector(".sov-town-pick");
      const payload = getPayload?.();
      const towns = payload ? ownTowns(payload) : [];
      sel.disabled = !towns.length;
      sel.innerHTML = towns.length ? `<option value="">\u2014</option>${towns.map((t) => `<option value="${t.x}|${t.y}">${escapeHtml(t.label)}</option>`).join("")}` : `<option value="">${payload ? "none on the map right now" : "no map data yet"}</option>`;
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
    function runFocus() {
      const status = $(".sov-focus-status");
      const out = $(".sov-focus-out");
      const read = readSettings();
      if (read.errors.length) {
        status.textContent = read.errors.join(" ");
        out.innerHTML = "";
        return;
      }
      const { focus, errors } = parseFocus(readFocus());
      if (errors.length) {
        status.textContent = errors.join(" ");
        out.innerHTML = "";
        return;
      }
      const result = focusSite({ payload: getPayload?.(), focus, settings: read.settings });
      if (!result.ok) {
        status.textContent = result.message;
        out.innerHTML = "";
        return;
      }
      status.textContent = "";
      out.innerHTML = focusResultHtml(result);
      mountPlanBlock(out.querySelector(".sov-plan-block"), {
        neighbours: result.neighbours,
        // What the plan on screen was made with, which is not what the form holds.
        settings: result.settings,
        ctx: result.ctx,
        base: result.base,
        floor: result.floor,
        geom: { radius: result.radius, x: result.x, y: result.y, kept: result.kept?.claims },
        tax: result.plan.tax
      });
    }
    function optimiseSite(result) {
      focusForm.querySelector('[data-focus="x"]').value = result.x;
      focusForm.querySelector('[data-focus="y"]').value = result.y;
      showTab("focus");
      runFocus();
      $(".sov-focus-status").scrollIntoView({ block: "start" });
    }
    focusForm.addEventListener("change", (e) => {
      const sel = e.target.closest(".sov-town-pick");
      if (!sel || !sel.value) return;
      const [x, y] = sel.value.split("|");
      focusForm.querySelector('[data-focus="x"]').value = x;
      focusForm.querySelector('[data-focus="y"]').value = y;
    });
    focusForm.addEventListener("submit", (e) => e.preventDefault());
    focusForm.addEventListener("click", (e) => {
      if (e.target.closest(".sov-focus-run")) runFocus();
    });
    refresh({ save: false });
    syncFocusRadiusHint();
    return {
      root,
      /** How the last load or save went, in the user's terms; '' clears it. */
      setStoreNote(text) {
        $(".sov-store-note").textContent = text ?? "";
      },
      /** Returns `{ settings, errors }`; a scan is refused while errors is non-empty. */
      getSettings: readSettings,
      setSettings: writeSettings,
      setStatus(html) {
        root.querySelector(".sov-status").innerHTML = html;
      },
      /**
       * @param {object[]} results ranked sites
       * @param {object} scan `{x, y, zoom, scanned}` — the facts of the run. The
       *   wording is the panel's, not the caller's.
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
      renderIncomplete(list) {
        incomplete = list;
        drawIncomplete();
      }
    };
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
  function flagsHtml(r) {
    const flags = [];
    const res = resFlag(r);
    if (res) flags.push({ cls: "sov-flag", ...res });
    if (r.milsovBlocked) {
      flags.push({
        cls: "sov-flag",
        text: "no military",
        title: `No military sovereignty fits here for free \u2014 ${MILSOV_BLOCKED_TEXT[r.milsovBlocked] ?? "nothing was left over"}.`
      });
    }
    if (r.milsovMinTax != null) {
      flags.push({
        cls: "sov-advice",
        text: `minimum at ${r.milsovMinTax.toFixed(0)}%`,
        title: `This site reaches your minimum military bonus (+${r.milsovMinBonusAt}%) at ${r.milsovMinTax.toFixed(0)}% tax, against the ${r.tMax.toFixed(0)}% it holds on food alone. Open the row and drag the tax slider to see the trade.`
      });
    }
    const conditional = conditionalDescriptors(r);
    if (conditional.size) {
      flags.push({
        cls: "sov-advice",
        text: "conditional bonus",
        title: `${[...conditional].map(([b, n]) => `${n}\xD7 ${b}`).join(", ")} \u2014 these tiles carry a terrain bonus that only pays if the city has that building. Not scored either way.`
      });
    }
    return flags.map((f) => `<span class="${f.cls}" title="${escapeHtml(f.title)}">${escapeHtml(f.text)}</span>`).join(" ");
  }
  function planBlockHtml({ ctx, base, plan, floor, geom }) {
    const lowest = Math.ceil(floor);
    const slider = ctx && Number.isFinite(base.tMax) && base.tMax - lowest >= 1 ? `<div class="sov-tax">
        <div class="sov-f"><span>Tax <output class="sov-tax-at">${plan.tax.toFixed(0)}%</output>
          <span class="sov-hint">\u2014 drag to trade tax for sovereignty</span></span>
          <input type="range" class="sov-tax-range" min="${lowest}" max="${base.tMax}"
            step="1" value="${plan.tax}"></div>
      </div>` : "";
    return `${slider}<div class="sov-body-at">${detailBodyHtml(plan, base, geom)}</div>`;
  }
  function bindPlanBlock(scope, ctx, base, geom, onTax) {
    const range2 = scope.querySelector(".sov-tax-range");
    if (!range2) return;
    const at = scope.querySelector(".sov-tax-at");
    const body = scope.querySelector(".sov-body-at");
    range2.addEventListener("input", () => {
      const tax = Number(range2.value);
      at.textContent = `${tax.toFixed(0)}%`;
      onTax?.(tax);
      const plan = planSiteAt(ctx, tax);
      body.innerHTML = plan ? detailBodyHtml(plan, base, geom) : '<p class="sov-flag">This site cannot hold that tax.</p>';
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
        scope.innerHTML = `<p class="sov-flag">No plan holds with those tiles crossed out.</p>${planGridHtml({ tiles: [], free: [], milsov: [] }, geom)}`;
        return;
      }
      tax = Math.min(base.tMax, Math.max(Math.ceil(state.floor), tax));
      const plan = (ctx ? planSiteAt(ctx, tax) : null) ?? base;
      scope.innerHTML = planBlockHtml({ ctx, base, plan, floor: state.floor, geom });
      bindPlanBlock(scope, ctx, base, geom, (t) => {
        tax = t;
      });
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
    cell.colSpan = 8;
    const actions = document.createElement("p");
    actions.className = "sov-detail-actions";
    actions.innerHTML = `<button type="button" class="sov-optimise sec">Optimise ${result.x}|${result.y} \u2192</button>`;
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
      floor: Math.min(settings2.tMin ?? 0, result.tMax),
      geom: { radius: Math.round(settings2.rClaim ?? 2), x: result.x, y: result.y },
      tax: result.tax
    });
  }
  function keptNote(kept) {
    if (!kept?.claims?.length && !kept?.unknownLevel) return "";
    const parts = [];
    if (kept.claims.length) {
      parts.push(`Keeping ${kept.claims.length} claim${kept.claims.length === 1 ? "" : "s"} you already hold, costing ${Math.round(kept.rp).toLocaleString("en-GB")} research and ${Math.round(kept.rp * 10).toLocaleString("en-GB")} gold an hour. The plan below is what fits on top of that. Any food or military bonus those claims already produce is not counted \u2014 the map does not say what is built on them.`);
    }
    if (kept.unknownLevel) {
      parts.push(`${kept.unknownLevel} more could not be read and are ignored.`);
    }
    return parts.join(" ");
  }
  function focusResultHtml(r) {
    const notes = [
      r.plotNote,
      `Radius ${r.radius}${r.radiusFromConfig ? ", from City Configuration" : ""}. ${r.claimable} of the ${r.ring} surrounding tiles are claimable.`,
      keptNote(r.kept)
    ].filter(Boolean);
    const warnings = [];
    if (!r.centre.settleable) {
      warnings.push("This tile cannot be settled and its claims cannot be placed \u2014 the plan below is for analysis only.");
    }
    if (r.centre.isTown) warnings.push("This tile already carries a town.");
    if (r.centre.claimedBy) warnings.push(`This tile is already claimed (${r.centre.claimedBy}).`);
    const exact = Number.isFinite(r.base.tMaxExact) ? ` The arithmetic reaches ${r.base.tMaxExact.toFixed(2)}%, but tax is whole numbers only.` : "";
    const ceiling = `<p class="sov-note">Highest tax this tile holds on food alone: <strong>${r.base.tMax.toFixed(0)}%</strong>, limited by ${escapeHtml(bindingLabel(r.base.binding).toLowerCase())}.${exact}</p>`;
    const asked = r.aboveCeiling ? `<p class="sov-flag">This tile cannot hold ${r.requestedTax.toFixed(0)}% \u2014 the plan below is at its ceiling of ${r.ceiling.toFixed(0)}%.</p>` : "";
    return `<h3>${r.x}|${r.y}</h3>
    ${warnings.map((w) => `<p class="sov-warn">${escapeHtml(w)}</p>`).join("")}
    ${notes.map((n) => `<p class="sov-note">${escapeHtml(n)}</p>`).join("")}
    ${ceiling}${asked}
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
    if (!d) return `, terrain ${tile.i} \u2014 unidentified`;
    const varies = d.nodeClass ? " (rating varies; not a fixed terrain)" : "";
    if (d.bonusUnread) return `, ${d.name}${varies} \u2014 bonus not read yet`;
    if (d.nodeClass) return `, ${d.name}${varies}`;
    if (!d.building) return `, ${d.name} \u2014 no sovereignty bonus`;
    const conditional = d.conditional ? `, needs a ${d.building}` : "";
    const disputed = d.disputed ? " [unconfirmed]" : "";
    return `, ${d.name}: +${d.bonus}% ${d.product} per level of ${d.building}${conditional}${disputed}`;
  }
  function resultsHtml(results, summary) {
    const head = `<p>${summary}</p>`;
    if (!results?.length) return `${head}<p>No sites met the minimum tax.</p>`;
    const rows = results.slice(0, 200).map((r, n) => `
        <tr class="sov-row" data-n="${n}">
          <td>${r.x}|${r.y}</td>
          <td${Number.isFinite(r.tMaxExact) ? ` title="The arithmetic reaches ${r.tMaxExact.toFixed(2)}%, but tax is whole numbers only, so the plan is made at this rate."` : ""}>${Number.isFinite(r.tMax) ? r.tMax.toFixed(0) : r.tMax}%</td>
          <td>${bindingLabel(r.binding)}</td>
          <td>${r.sFood.toFixed(0)}</td>
          <td>${r.uRp.toFixed(0)}</td>
          <td>${Math.round(r.goldNet).toLocaleString()}</td>
          <td>${r.milsovBonus ? `+${r.milsovBonus}%` : ""}</td>
          <td>${flagsHtml(r)}</td>
        </tr>`).join("");
    return `
        ${head}
        <table>
          <thead><tr><th>Site</th>
            <th title="The highest whole-number tax this site can hold on food alone \u2014 the game takes no other kind">Max Tax</th>
            <th title="Which ceiling stops the tax going any higher">Limited By</th><th>Food</th>
            <th title="Research per hour the claims cost">Research</th><th>Net Gold</th>
            <th title="Free military unit production bonus \u2014 costs this site no tax">Military</th>
            <th></th></tr></thead>
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
    for (const t of plan.free ?? []) {
      specs.set(cellKey(t.dx, t.dy), {
        cls: t.water ? "sov-cell-free sov-cell-water" : "sov-cell-free",
        badge: descriptorBadge(t),
        title: `${name(t.dx, t.dy)} \u2014 unclaimed${t.water ? " water" : ""}, food ${t.food}, distance ${t.d.toFixed(2)}${descriptorText(t)}`,
        body: `${FOOD_ICON} ${t.food}`
      });
    }
    for (const t of plan.tiles ?? []) {
      specs.set(cellKey(t.dx, t.dy), {
        cls: "sov-cell-food",
        badge: descriptorBadge(t),
        title: `${name(t.dx, t.dy)} \u2014 Sov ${roman(t.level)} food claim, food ${t.food}, distance ${t.d.toFixed(2)}, ${t.rp.toFixed(0)} RP${descriptorText(t)}`,
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
        title: `${name(m.dx, m.dy)} \u2014 Sov ${roman(m.sovLevel)} claim carrying a level ${m.buildingLevel} ${structure.name}, distance ${m.d.toFixed(2)}, ${m.rp.toFixed(0)} RP, ${structureUpkeep(m).toLocaleString("en-GB")}/hr upkeep` + descriptorText(m),
        level: roman(m.sovLevel),
        body: `${icon ? `<img src="${icon}" alt="${escapeHtml(structure.name)}">` : ""} L${m.buildingLevel}`
      });
    }
    const cell = (dx, dy) => {
      if (dx === 0 && dy === 0) {
        return gridCell({ cls: "sov-cell-town", title: `${name(0, 0)} \u2014 the town`, level: "TOWN" });
      }
      if (excluded.has(cellKey(dx, dy))) {
        return gridCell({
          cls: "sov-cell-out",
          title: `${name(dx, dy)} \u2014 crossed out${pickable ? ", click to put it back" : ""}`,
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
          return gridCell({
            cls: "sov-cell-kept",
            title: `${name(dx, dy)} \u2014 Sov ${roman(k.level)} claim you already hold, distance ${k.d.toFixed(2)}, ${k.rp.toFixed(0)} RP. Kept as it is.`,
            level: roman(k.level),
            body: "kept"
          });
        }
        return gridCell({ cls: "sov-cell-none", title: `${name(dx, dy)} \u2014 not claimable`, body: CROSS });
      }
      return gridCell({ ...spec, dx, dy, pick: pickable });
    };
    const head = `<tr><th></th>${range(r).map((dx) => `<th>${xLabel(dx)}</th>`).join("")}</tr>`;
    const body = range(r).slice().reverse().map((dy) => `<tr><th>${yLabel(dy)}</th>${range(r).map((dx) => cell(dx, dy)).join("")}</tr>`).join("");
    return `<div class="sov-grid-wrap"><table class="sov-grid">
      <thead>${head}</thead><tbody>${body}</tbody></table></div>
    <p class="sov-legend"><b class="sov-key-food">I\u2013V</b> food claim,
      <b class="sov-key-mil">I\u2013V</b> military claim with its building level,
      <b class="sov-key-free">grey</b> claimable but unclaimed,
      <b class="sov-key-out">\u2715</b> not available${kept.size ? ', <b class="sov-key-kept">I\u2013V</b> already yours and kept' : ""}.${pickable ? " Click a tile to cross it out and re-plan without it." : ""}
      A tile's third line is its terrain bonus, if it has one.
      Hover for distance, research cost, upkeep and the full descriptor.</p>`;
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
  function detailBodyHtml(plan, base, geom) {
    const atCeiling = Math.abs(plan.tax - plan.tMax) < 0.05;
    const rows = surplusRows(plan.surplus, atCeiling ? plan.binding : null);
    const num2 = (v) => Number.isFinite(v) ? Math.round(v).toLocaleString("en-GB") : "";
    const balance = rows.length ? `<table class="sov-balance"><thead><tr><th>At ${plan.tax.toFixed(0)}% Tax</th>
        <th>Produced</th><th>Spent</th><th>Net</th><th></th></tr></thead><tbody>${rows.map((r) => `<tr><td>${productionLabel(r.icon)}</td><td class="sov-hint">${num2(r.base)}</td>
        <td class="sov-hint">${num2(r.spent)}</td><td class="${r.value < 0 ? "sov-bad" : "sov-ok"}">${num2(r.value)}</td>
        <td class="sov-hint">${r.note}</td></tr>`).join("")}</tbody></table>` : "";
    const milPlan = plan.milsov.length ? milsovPlanHtml(plan) : plan.milsovBlocked ? `<p class="sov-flag">No military sovereignty fits at this tax \u2014 ${escapeHtml(MILSOV_BLOCKED_TEXT[plan.milsovBlocked] ?? "nothing was left over")}.</p>` : "";
    const res = upkeepLimitHtml(plan);
    const claimDelta = plan.tiles.length - base.tiles.length;
    const goldDelta = Math.round(plan.goldNet - base.goldNet);
    const signed2 = (v) => `${v >= 0 ? "+" : ""}${v.toLocaleString("en-GB")}`;
    const trade = plan.tax < base.tMax - 0.05 ? `<p class="sov-hint">Against the ${base.tMax.toFixed(1)}% ceiling, which fits ${base.milsovBonus ? `+${base.milsovBonus}%` : "no military bonus"}: ${signed2(claimDelta)} food claims, ${signed2(goldDelta)} gold/hr.</p>` : "";
    return `${balance}${milPlan}${res}${trade}${planGridHtml(plan, geom)}`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }
  function csvField(v) {
    const s = v === null || v === void 0 ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  var CSV_EOL = "\r\n";
  var CSV_BOM = "\uFEFF";
  function resColumns(r) {
    if (!r.resIndicative) {
      return [num(r.resCeiling, 2), Number.isFinite(r.resCeiling) ? r.resBinding : "", ""];
    }
    return r.resImpossible ? ["", r.resBinding, "impossible"] : [num(r.resCeiling, 2), r.resBinding, "indicative"];
  }
  function num(v, dp = 0) {
    return Number.isFinite(v) ? v.toFixed(dp) : "";
  }
  function toCsv(results) {
    const head = [
      "x",
      "y",
      "T_max",
      "T_max_exact",
      "binding",
      "S_food",
      "U_RP",
      "U_gold",
      "Gold_net",
      "milsov_buildings",
      "milsov_bonus",
      "milsov_upkeep",
      "milsov_RP",
      "milsov_gold",
      "milsov_price",
      "milsov_min_tax",
      "milsov_min_bonus",
      "T_res",
      "res_binding",
      "res_status",
      "milsov_plan"
    ];
    const lines = results.map((r) => [
      r.x,
      r.y,
      num(r.tMax),
      num(r.tMaxExact, 2),
      r.binding,
      num(r.sFood),
      num(r.uRp),
      num(r.uGold),
      num(r.goldNet),
      r.milsov?.length ?? 0,
      r.milsovBonus ?? 0,
      r.milsovUpkeep ?? 0,
      num(r.milsovRp ?? 0),
      num(r.milsovGold ?? 0),
      r.milsovPrice ?? 0,
      // Where a minimum bonus is met, if it was not met for free. Blank covers
      // both "nothing was asked for" and "nothing in range reaches it" — the
      // milsovShortfall rows never reach the export, having been filtered out.
      num(r.milsovMinTax),
      num(r.milsovMinBonusAt),
      ...resColumns(r),
      milsovPlanText(r)
    ].map(csvField).join(","));
    return [head.join(","), ...lines].join(CSV_EOL);
  }
  function csvFile(results) {
    return CSV_BOM + toCsv(results);
  }
  function csvFilename(now = /* @__PURE__ */ new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `sov-sites-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}.csv`;
  }

  // src/settings-store.js
  var STORAGE_KEY = "illyriad-sov-scanner.settings";
  var STORAGE_VERSION = 1;
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
        case "prestige":
          out.prestige = parsePrestige(v);
          break;
        case "minimums":
          out.resourceMinimums = parseResourceMinimums(v);
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
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { settings: sanitizeSettings({}), note: "Saved settings were unreadable \u2014 defaults restored." };
    }
    const body = parsed?.settings ?? parsed;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { settings: sanitizeSettings({}), note: "Saved settings were unreadable \u2014 defaults restored." };
    }
    return { settings: sanitizeSettings(body), note: driftNote(body) };
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
    new Blob(['(() => {\n  // src/constants.js\n  var PRODUCTION_BASE = 125;\n  var FARM_YIELD_L20 = 2014;\n  var GOLD_PER_TAX_POP = 0.04;\n  var CLAIM_RP_PER_LEVEL_DISTANCE = 10;\n  var CLAIM_GOLD_PER_LEVEL_DISTANCE = 100;\n  var CHANCERY_FACTOR = 0.6;\n  var FOOD_CLAIM_LEVEL = 5;\n  var MILSOV_UPKEEP_BY_LEVEL = { 1: 150, 2: 300, 3: 600, 4: 1200, 5: 2400 };\n  var MILSOV_UPKEEP_STEP = [1, 2, 3, 4, 5].map(\n    (level) => MILSOV_UPKEEP_BY_LEVEL[level] - (MILSOV_UPKEEP_BY_LEVEL[level - 1] ?? 0)\n  );\n  var MILSOV_MAX_LEVEL = 5;\n  var MILSOV_BONUS_PER_LEVEL = 5;\n  var SOV_STRUCTURES = [\n    { key: "trainingGround", name: "Training Ground", type: "production", military: true },\n    { key: "targetRange", name: "Target Range", type: "production", military: true },\n    { key: "militaryAcademy", name: "Military Academy", type: "production", military: true },\n    { key: "joustingYard", name: "Jousting Yard", type: "production", military: true },\n    { key: "assemblyYard", name: "Assembly Yard", type: "production", military: true },\n    // The crafting half of the Production Structures. Same hourly ladder as the\n    // military five \u2014 the class is about upkeep, not about what is made \u2014 and the\n    // terrain descriptors name these, so they have to be here or a descriptor\n    // reads as a bonus riding on something the tool does not know about.\n    { key: "cattleRancher", name: "Cattle Rancher", type: "production" },\n    { key: "bladesmith", name: "Bladesmith", type: "production" },\n    { key: "renderer", name: "Renderer", type: "production" },\n    { key: "farrier", name: "Farrier", type: "production" },\n    { key: "bowyer", name: "Bowyer", type: "production" },\n    { key: "poleturner", name: "Poleturner", type: "production" },\n    { key: "bridlemaker", name: "Bridlemaker", type: "production" },\n    { key: "plateForger", name: "Plate Forger", type: "production" },\n    { key: "armourer", name: "Armourer", type: "production" },\n    { key: "engineeringYard", name: "Engineering Yard", type: "production" },\n    { key: "papermill", name: "Papermill", type: "production" },\n    { key: "brewersYard", name: "Brewer\'s Yard", type: "production" },\n    { key: "finishingSchool", name: "Finishing School", type: "production" },\n    { key: "loggingCamp", name: "Logging Camp", type: "resource", boosts: "wood" },\n    { key: "earthworks", name: "Earthworks", type: "resource", boosts: "clay" },\n    { key: "mineshaft", name: "Mineshaft", type: "resource", boosts: "iron" },\n    { key: "gravelPit", name: "Gravel Pit", type: "resource", boosts: "stone" },\n    { key: "farmstead", name: "Farmstead", type: "resource", boosts: "food" },\n    { key: "fishery", name: "Fishery", type: "resource", boosts: "food" }\n  ];\n  var SOV_STRUCTURE_BY_KEY = Object.fromEntries(SOV_STRUCTURES.map((s) => [s.key, s]));\n  var MILSOV_STRUCTURES = SOV_STRUCTURES.filter((s) => s.military);\n  var DEFAULT_SOV_STRUCTURE = "trainingGround";\n  var TERRAIN_DESCRIPTORS = {\n    1: { name: "Plains" },\n    2: { name: "Plains" },\n    5: { name: "Plains" },\n    6: { name: "Rich Clay Seam", bonus: 3, product: "Books", building: "Papermill" },\n    7: { name: "Abundant Clay", bonus: 2, product: "Books", building: "Papermill" },\n    8: { name: "Exposed Clay", bonus: 1, product: "Leather Armour", building: "Renderer" },\n    9: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },\n    10: { name: "Turned Clay", bonus: 2, product: "Saddles", building: "Bridlemaker" },\n    11: { name: "Heavy Clay Seam", bonus: 1, product: "Saddles", building: "Bridlemaker" },\n    12: { name: "Abundant Crops", bonus: 3, product: "Beer", building: "Brewer\'s Yard" },\n    13: { name: "Bountiful Land", bonus: 3, product: "Livestock", building: "Cattle Rancher" },\n    14: { name: "Fertile Pasture", bonus: 2, product: "Cavalry Units", building: "Jousting Yard" },\n    15: { name: "Fertile Orchard" },\n    16: { name: "Alluvial Plain", bonus: 1, product: "Livestock", building: "Cattle Rancher" },\n    17: { name: "Fertile Ground", bonus: 1, product: "Horses", building: "Farrier" },\n    18: { name: "Lake", water: true },\n    19: { name: "Loch", water: true },\n    20: { name: "Volcanic Peak", impassable: true },\n    21: { name: "Fiery Mountain", impassable: true },\n    22: { name: "Canyon", impassable: true },\n    23: { name: "Swampland", impassable: true },\n    24: { name: "Craggy Peaks", bonus: 3, product: "Chainmail", building: "Armourer" },\n    25: {\n      name: "Bleak Mountains",\n      bonus: 2,\n      product: "Diplomatic Units",\n      building: "Finishing School"\n    },\n    26: { name: "Lonely Peaks", bonus: 1, product: "Platesteel", building: "Plate Forger" },\n    27: { name: "Sharp Crags", bonus: 3, product: "Swords", building: "Bladesmith" },\n    28: { name: "Treacherous Mountains", bonus: 2, product: "Beer", building: "Brewer\'s Yard" },\n    29: { name: "Mountains", bonus: 1, product: "Swords", building: "Bladesmith" },\n    30: {\n      name: "Scrubland",\n      bonus: 1,\n      product: "Diplomatic Units",\n      building: "Finishing School"\n    },\n    31: { name: "Clearing", bonus: 1, product: "Ranged Units", building: "Target Range" },\n    32: { name: "Tundra", bonus: 1, product: "Spear Units", building: "Training Ground" },\n    33: { name: "Open Plains", bonus: 1, product: "Cavalry Units", building: "Jousting Yard" },\n    34: { name: "Moor", bonus: 1, product: "Infantry Units", building: "Military Academy" },\n    35: { name: "Plains" },\n    36: { name: "Plains" },\n    37: { name: "Plains" },\n    38: { name: "Plains" },\n    39: { name: "Plains" },\n    40: { name: "Standing Stones" },\n    42: { name: "Abandoned Mineshaft" },\n    43: { name: "Ruined Tower" },\n    44: { name: "Ancient Forest" },\n    45: { name: "Dolmen" },\n    46: { name: "Abundant Quarry", bonus: 3, product: "Platesteel", building: "Plate Forger" },\n    47: { name: "Rich Quarry", bonus: 2, product: "Infantry Units", building: "Military Academy" },\n    48: { name: "Wooded Quarry", bonus: 1, product: "Siege Blocks", building: "Engineering Yard" },\n    49: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },\n    50: { name: "Landslip", bonus: 2, product: "Siege Units", building: "Assembly Yard" },\n    51: { name: "Stony Ground", bonus: 1, product: "Chainmail", building: "Armourer" },\n    52: { name: "Thick Forest", bonus: 3, product: "Bows", building: "Bowyer" },\n    53: { name: "Dense Forest", bonus: 2, product: "Ranged Units", building: "Target Range" },\n    54: { name: "Forested Hilltop", bonus: 1, product: "Bows", building: "Bowyer" },\n    55: { name: "Wooded Land", bonus: 3, product: "Spears", building: "Poleturner" },\n    56: { name: "Wooded Glade", bonus: 2, product: "Spear Units", building: "Training Ground" },\n    57: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },\n    58: { name: "Plains" },\n    // Rivers. Food is read from `rs` like any other tile; there is no descriptor\n    // bonus on top of it, so a river is worth exactly its food rating.\n    59: { name: "Fresh Water", water: true },\n    // An NPC settlement and the ring of eight it occupies. Neither is claimable \u2014\n    // the centre carries no `sov` and the ring is `imp` \u2014 so these are here to\n    // keep a settlement in view from reporting nine unidentified IDs per scan.\n    //\n    // The ring\'s `rs` is the one place a land tile does NOT sum to 25: it keeps\n    // its terrain ratings with food forced to 0, summing to 20. Nothing reads it,\n    // but do not take it as a counterexample to the 25-plot rule.\n    66: { name: "Faction Hub", settlement: true },\n    67: { name: "Forbidden", impassable: true },\n    80: { name: "Drumlin" },\n    // The glacial terrains, read off tiles in a b:2 region. Their plots total 0\n    // to 15 where most land totals 25, so they are poor ground whatever they\n    // grant \u2014 which is what the scanner reads, the bonus being a column.\n    68: { name: "Barren Wastes", bonus: 3, product: "Spears", building: "Poleturner" },\n    69: { name: "Glacier" },\n    70: { name: "Frozen Ground" },\n    // The one military rung above +2 anywhere in the table. Eight other military\n    // readings \u2014 Training Ground, Target Range, Military Academy and Jousting\n    // Yard, +1 and +2 each \u2014 all stop at +2, while crafting rungs reach +3\n    // freely. Read by eye before the in-game harvester existed, and the game\n    // prints "Siege Block production" for the Engineering Yard against "Siege\n    // unit production" for the Assembly Yard, which is an easy conflation.\n    // Marked until a Nunatak is hovered and it is read again.\n    71: {\n      name: "Nunatak",\n      bonus: 3,\n      product: "Siege Units",\n      building: "Assembly Yard",\n      disputed: "only military rung above +2; re-read against Siege Block"\n    },\n    72: {\n      name: "Scoured Bedrock",\n      bonus: 2,\n      product: "Infantry Units",\n      building: "Military Academy"\n    },\n    73: { name: "Icefield" },\n    74: { name: "Glacial Crevasse" },\n    75: { name: "Ice cave" },\n    77: {\n      name: "Rogen Moraine",\n      bonus: 1,\n      product: "Ranged Units",\n      building: "Target Range"\n    },\n    78: { name: "Moraine", bonus: 2, product: "Chainmail", building: "Armourer" },\n    79: { name: "Kame" },\n    81: {\n      name: "Roche Moutonnee",\n      bonus: 1,\n      product: "Chainmail",\n      building: "Armourer"\n    },\n    82: { name: "Ice Holes" },\n    // Shares its name with i:30, which grants Finishing School +1%. Same name,\n    // different terrain, different answer \u2014 the id identifies a terrain and the\n    // name does not.\n    83: { name: "Scrubland" },\n    84: { name: "Permafrost" },\n    85: { name: "Icy Moss" },\n    86: { name: "Frosty Heath" },\n    87: {\n      name: "Lichen",\n      bonus: 1,\n      product: "Livestock",\n      building: "Cattle Rancher"\n    },\n    // The wetland terrains, read off a b:16 region. Their plots total 10 to 17,\n    // so they are poor ground too.\n    //\n    // Marsh grants Poleturner +3%, which i:55 Wooded Land also holds. That was\n    // taken as evidence for a per-family ladder; it is simply a shared rung, of\n    // which there are several \u2014 see sharedRungs.\n    //\n    // i:89 is the only Swamp in the table. The two tiles this project called\n    // Swamps for months are i:22 Canyon and i:23 Swampland \u2014 both impassable,\n    // both named from sprite context rather than from the game, and both wrong\n    // until the client\'s own table settled it.\n    89: { name: "Swamp", bonus: 2, product: "Bows", building: "Bowyer" },\n    90: { name: "Marsh", bonus: 3, product: "Spears", building: "Poleturner" },\n    91: { name: "Bog" },\n    92: { name: "Mire" },\n    // The rainforests, all read in the Jungle biome. Their plots total 22 or 23,\n    // which is the counterexample to "land always sums to 25".\n    //\n    // Thick Rainforest grants Poleturner +3%, a rung three other terrains also\n    // hold. Rainforest Hilltop grants Papermill +3%, which i:6 Rich Clay Seam\n    // holds \u2014 and both were read in the SAME biome, which is what finally\n    // disproved the one-terrain-per-rung rule rather than rescoping it again.\n    41: { name: "Barrow" },\n    95: { name: "Playa" },\n    101: { name: "Cactus", bonus: 3, product: "Horses", building: "Farrier" },\n    103: { name: "Tropical Foliage", bonus: 1, product: "Bows", building: "Bowyer" },\n    104: { name: "Light Tropical Cover" },\n    105: { name: "Palm Trees", bonus: 1, product: "Spears", building: "Poleturner" },\n    106: { name: "Dense Foliage", bonus: 1, product: "Books", building: "Papermill" },\n    107: { name: "Dense Tropical Forest", bonus: 2, product: "Bows", building: "Bowyer" },\n    108: { name: "Tropical Hilltop" },\n    109: { name: "Monsoon Jungle", bonus: 2, product: "Spear Units", building: "Training Ground" },\n    110: { name: "Jungle" },\n    111: { name: "Damp Jungle" },\n    112: { name: "Dense Jungle", bonus: 2, product: "Spears", building: "Poleturner" },\n    113: { name: "Dense Monsoon Jungle", bonus: 2, product: "Books", building: "Papermill" },\n    114: { name: "Monsoon Hilltop" },\n    115: { name: "Light Rainforest" },\n    // Holds Bowyer +3% alongside i:52 Thick Forest \u2014 the second rung read twice\n    // in the Jungle biome, after Papermill +3% on i:6 and i:120.\n    116: { name: "Rainforest Canopy", bonus: 3, product: "Bows", building: "Bowyer" },\n    117: { name: "Rainforest" },\n    118: { name: "Dense Rainforest" },\n    119: { name: "Thick Rainforest", bonus: 3, product: "Spears", building: "Poleturner" },\n    // Holds Papermill +3% alongside i:6 Rich Clay Seam, in the same biome. This\n    // is the row that ended the one-terrain-per-rung rule.\n    120: { name: "Rainforest Hilltop", bonus: 3, product: "Books", building: "Papermill" },\n    121: { name: "Succulents" },\n    122: { name: "Dry tundra" },\n    124: { name: "Faerie Ring" },\n    127: { name: "Stone Circle" },\n    128: { name: "Mountain Cave" },\n    129: { name: "Pyramids" },\n    130: { name: "Sphinx" },\n    139: { name: "Blessed Oak" },\n    142: { name: "Mausoleum" },\n    143: { name: "Dark Forest" },\n    144: { name: "Ancient Lair" },\n    146: { name: "Deserted Wayhouse" },\n    147: { name: "Rockhewn Monastery" },\n    150: { name: "Hidden Temple" },\n    151: { name: "Place of High Sacrifice" },\n    152: { name: "Crooked House" },\n    153: { name: "Deserted Monastery" },\n    156: { name: "Abandoned Campsite" },\n    205: { name: "Glassy Mountain" },\n    209: { name: "Ancient Graveyard" },\n    211: { name: "Dormant Portal" },\n    213: { name: "Fortified Hostel" },\n    214: { name: "Lawstones" },\n    215: { name: "Sacrificial Altar" },\n    217: { name: "Weeping Willow" },\n    222: { name: "Head Statue" },\n    223: { name: "Jungle Standing Stones" },\n    224: { name: "Shattered Head" },\n    // The fifty-eight the world data file said were still unread, worked through\n    // in one pass. Five of them grant something; the rest are answers of the\n    // other kind. With these in, every terrain the world actually contains has a\n    // row here \u2014 the forty-one still absent are named by the client and appear\n    // nowhere in the world, so there is no tile to go and read.\n    // Three of the five reproduce a same-named terrain exactly: i:63 matches\n    // i:57 Light Woods, i:64 matches i:49 Rocky Outcrop, i:65 matches i:9 Clay\n    // Seam, rung for rung. That is NOT the name determining the answer \u2014 i:30 and\n    // i:83 are both Scrubland and disagree, and so do i:88 and i:195, both\n    // Petrified Forest. Three names matched and two did not.\n    3: { name: "Plains" },\n    63: { name: "Light Woods", bonus: 1, product: "Spears", building: "Poleturner" },\n    64: { name: "Rocky Outcrop", bonus: 3, product: "Horses", building: "Farrier" },\n    65: { name: "Clay Seam", bonus: 3, product: "Leather Armour", building: "Renderer" },\n    76: { name: "Tarn" },\n    88: { name: "Petrified Forest" },\n    // The desert. Two of the eight grant anything: the Oasis, and the Mesa, whose\n    // Plate Forger +3% i:46 Abundant Quarry also holds. The gravel and stone\n    // flats \u2014 Yardang, Hamada, Reg, Wadi \u2014 grant nothing despite rating as high\n    // as 10 plots between them, so a plot total does not predict a bonus.\n    93: { name: "Sand Dune" },\n    94: { name: "Oasis", bonus: 3, product: "Livestock", building: "Cattle Rancher" },\n    96: { name: "Yardang" },\n    97: { name: "Mesa", bonus: 3, product: "Platesteel", building: "Plate Forger" },\n    98: { name: "Rocky Mountain" },\n    99: { name: "Hamada (Stone Plateau)" },\n    100: { name: "Reg (Gravel Plain)" },\n    102: { name: "Wadi" },\n    // Open water and the shoreline. The four water rows rate zero on all five and\n    // are flagged like i:18, i:19 and i:59; the four shore rows rate food alone,\n    // 5 to 10 of it, and are worth exactly that food and no bonus \u2014 the same\n    // answer a river gets.\n    60: { name: "Tidal Water", water: true },\n    61: { name: "Shallow Salt Water", water: true },\n    62: { name: "Ocean", water: true },\n    172: { name: "Bankside" },\n    173: { name: "Beach" },\n    174: { name: "Shallow Coastline" },\n    175: { name: "Coast" },\n    198: { name: "Dead Water", water: true },\n    // The volcanic terrains. All nine rate zero on all five plots, which reads\n    // like the impassable rows and is not: their combat class is Obsidian\n    // Mountains, and only i:20-23 are class Impassable anywhere in the client\'s\n    // table. So this is walkable ground that grows nothing \u2014 not a wall.\n    //\n    // isWaterTile tests wood+clay+iron+stone === 0, which these satisfy, so the\n    // payload calls them water. They are not flagged `water` here, because they\n    // are not \u2014 and nothing reads this flag, so the two do not have to agree.\n    199: { name: "Obsidian Mountain" },\n    200: { name: "Glassy Crag" },\n    201: { name: "Volcanic Mountain" },\n    202: { name: "Lava Peak" },\n    203: { name: "Active Peak" },\n    204: { name: "Emerging Mountaintop" },\n    206: { name: "Lava Pool" },\n    207: { name: "Magma Rift" },\n    // The dead forests, all three rating 7|3|3|2|3 \u2014 one plot signature across\n    // three names, and none of them grants anything. i:195 shares its name with\n    // i:88, which rates 0|3|5|4|3: a third same-name pair, after the Scrublands\n    // and the Swamps.\n    194: { name: "Scorched Forest" },\n    195: { name: "Petrified Forest" },\n    196: { name: "Deadvlei Forest" },\n    // Landmarks and sites, twenty-five of them, and not one grants anything \u2014\n    // which is what every landmark already in the table says too, from Standing\n    // Stones to Mausoleum. Their plots vary tile to tile where most terrain\'s are\n    // fixed, so a landmark is worth its own ratings and nothing more. The four\n    // Altars answer the same: fixed single tiles, one per element, granting\n    // nothing.\n    123: { name: "Geyser" },\n    131: { name: "Obelisk" },\n    135: { name: "Heroic Human Statue" },\n    145: { name: "Abandoned Lodge" },\n    148: { name: "House of the Spirits" },\n    149: { name: "Forgotten Temple" },\n    155: { name: "Gypsy Campsite" },\n    157: { name: "Fortune Teller" },\n    158: { name: "Fortress of Shadows" },\n    161: { name: "Temple of Reason" },\n    162: { name: "Steamtastic Brewery" },\n    163: { name: "Brewery Outbuildings" },\n    164: { name: "Cylindroconical Vessels" },\n    167: { name: "Altar of Water" },\n    168: { name: "Altar of Fire" },\n    169: { name: "Altar of Air" },\n    170: { name: "Altar of Earth" },\n    197: { name: "Parched Bones" },\n    208: { name: "Abandoned Lair" },\n    210: { name: "Broken Tower" },\n    212: { name: "Fallen Dwarfhold" },\n    216: { name: "Tiki Pole" },\n    218: { name: "Crumbling Lighthouse" },\n    219: { name: "Fisherman\'s Hut" },\n    221: { name: "Ferry Post" }\n  };\n  var TERRAIN_NAMES = [\n    null,\n    // 0 - unused; the client\'s array starts at 1\n    ["Plains", "Plains"],\n    // 1\n    ["Plains", "Plains"],\n    // 2\n    ["Plains", "Plains"],\n    // 3\n    ["Town", "Buildings"],\n    // 4\n    ["Plains", "Plains"],\n    // 5\n    ["Rich Clay Seam", "Large Hill"],\n    // 6\n    ["Abundant Clay", "Large Hill"],\n    // 7\n    ["Exposed Clay", "Small Hill"],\n    // 8\n    ["Clay Seam", "Small Hill"],\n    // 9\n    ["Turned Clay", "Large Hill"],\n    // 10\n    ["Heavy Clay Seam", "Small Hill"],\n    // 11\n    ["Abundant Crops", "Plains"],\n    // 12\n    ["Bountiful Land", "Plains"],\n    // 13\n    ["Fertile Pasture", "Plains"],\n    // 14\n    ["Fertile Orchard", "Plains"],\n    // 15\n    ["Alluvial Plain", "Plains"],\n    // 16\n    ["Fertile Ground", "Plains"],\n    // 17\n    ["Lake", "Small Hill"],\n    // 18\n    ["Loch", "Small Hill"],\n    // 19\n    ["Volcanic Peak", "Impassable"],\n    // 20\n    ["Fiery Mountain", "Impassable"],\n    // 21\n    ["Canyon", "Impassable"],\n    // 22\n    ["Swampland", "Impassable"],\n    // 23\n    ["Craggy Peaks", "Large Mountain"],\n    // 24\n    ["Bleak Mountains", "Large Mountain"],\n    // 25\n    ["Lonely Peaks", "Large Mountain"],\n    // 26\n    ["Sharp Crags", "Small Mountain"],\n    // 27\n    ["Treacherous Mountains", "Small Mountain"],\n    // 28\n    ["Mountains", "Small Mountain"],\n    // 29\n    ["Scrubland", "Plains"],\n    // 30\n    ["Clearing", "Plains"],\n    // 31\n    ["Tundra", "Plains"],\n    // 32\n    ["Open Plains", "Plains"],\n    // 33\n    ["Moor", "Plains"],\n    // 34\n    ["Plains", "Plains"],\n    // 35\n    ["Plains", "Plains"],\n    // 36\n    ["Plains", "Plains"],\n    // 37\n    ["Plains", "Plains"],\n    // 38\n    ["Plains", "Plains"],\n    // 39\n    ["Standing Stones", "Plains"],\n    // 40\n    ["Barrow", "Small Hill"],\n    // 41\n    ["Abandoned Mineshaft", "Large Mountain"],\n    // 42\n    ["Ruined Tower", "Buildings"],\n    // 43\n    ["Ancient Forest", "Large Forest"],\n    // 44\n    ["Dolmen", "Plains"],\n    // 45\n    ["Abundant Quarry", "Small Mountain"],\n    // 46\n    ["Rich Quarry", "Small Mountain"],\n    // 47\n    ["Wooded Quarry", "Large Hill"],\n    // 48\n    ["Rocky Outcrop", "Large Hill"],\n    // 49\n    ["Landslip", "Small Hill"],\n    // 50\n    ["Stony Ground", "Large Hill"],\n    // 51\n    ["Thick Forest", "Large Forest"],\n    // 52\n    ["Dense Forest", "Large Forest"],\n    // 53\n    ["Forested Hilltop", "Large Forest"],\n    // 54\n    ["Wooded Land", "Small Forest"],\n    // 55\n    ["Wooded Glade", "Small Forest"],\n    // 56\n    ["Light Woods", "Small Forest"],\n    // 57\n    ["Plains", "Plains"],\n    // 58\n    ["Fresh Water", "Fresh Water"],\n    // 59\n    ["Tidal Water", "Tidal Water"],\n    // 60\n    ["Shallow Salt Water", "Shallow Salt Water"],\n    // 61\n    ["Ocean", "Ocean"],\n    // 62\n    ["Light Woods", "Small Forest"],\n    // 63\n    ["Rocky Outcrop", "Large Hill"],\n    // 64\n    ["Clay Seam", "Small Hill"],\n    // 65\n    ["Faction Hub", "Buildings"],\n    // 66\n    ["Forbidden", "Buildings"],\n    // 67\n    ["Barren Wastes", "Plains"],\n    // 68\n    ["Glacier", "Small Hill"],\n    // 69\n    ["Frozen Ground", "Plains"],\n    // 70\n    ["Nunatak", "Small Mountain"],\n    // 71\n    ["Scoured Bedrock", "Large Hill"],\n    // 72\n    ["Icefield", "Plains"],\n    // 73\n    ["Glacial Crevasse", "Large Hill"],\n    // 74\n    ["Ice cave", "Small Mountain"],\n    // 75\n    ["Tarn", "Small Hill"],\n    // 76\n    ["Rogen Moraine", "Large Hill"],\n    // 77\n    ["Moraine", "Small Mountain"],\n    // 78\n    ["Kame", "Small Hill"],\n    // 79\n    ["Drumlin", "Large Hill"],\n    // 80\n    ["Roche Moutonnee", "Small Mountain"],\n    // 81\n    ["Ice Holes", "Plains"],\n    // 82\n    ["Scrubland", "Plains"],\n    // 83\n    ["Permafrost", "Plains"],\n    // 84\n    ["Icy Moss", "Plains"],\n    // 85\n    ["Frosty Heath", "Plains"],\n    // 86\n    ["Lichen", "Plains"],\n    // 87\n    ["Petrified Forest", "Small Forest"],\n    // 88\n    ["Swamp", "Small Hill"],\n    // 89\n    ["Marsh", "Large Hill"],\n    // 90\n    ["Bog", "Small Mountain"],\n    // 91\n    ["Mire", "Large Mountain"],\n    // 92\n    ["Sand Dune", "Large Hill"],\n    // 93\n    ["Oasis", "Small Forest"],\n    // 94\n    ["Playa", "Plains"],\n    // 95\n    ["Yardang", "Small Hill"],\n    // 96\n    ["Mesa", "Large Mountain"],\n    // 97\n    ["Rocky Mountain", "Small Mountain"],\n    // 98\n    ["Hamada (Stone Plateau)", "Large Hill"],\n    // 99\n    ["Reg (Gravel Plain)", "Plains"],\n    // 100\n    ["Cactus", "Plains"],\n    // 101\n    ["Wadi", "Plains"],\n    // 102\n    ["Tropical Foliage", "Small Forest"],\n    // 103\n    ["Light Tropical Cover", "Small Forest"],\n    // 104\n    ["Palm Trees", "Small Forest"],\n    // 105\n    ["Dense Foliage", "Large Forest"],\n    // 106\n    ["Dense Tropical Forest", "Large Forest"],\n    // 107\n    ["Tropical Hilltop", "Large Forest"],\n    // 108\n    ["Monsoon Jungle", "Small Forest"],\n    // 109\n    ["Jungle", "Small Forest"],\n    // 110\n    ["Damp Jungle", "Small Forest"],\n    // 111\n    ["Dense Jungle", "Large Forest"],\n    // 112\n    ["Dense Monsoon Jungle", "Large Forest"],\n    // 113\n    ["Monsoon Hilltop", "Large Forest"],\n    // 114\n    ["Light Rainforest", "Small Forest"],\n    // 115\n    ["Rainforest Canopy", "Small Forest"],\n    // 116\n    ["Rainforest", "Small Forest"],\n    // 117\n    ["Dense Rainforest", "Large Forest"],\n    // 118\n    ["Thick Rainforest", "Large Forest"],\n    // 119\n    ["Rainforest Hilltop", "Large Forest"],\n    // 120\n    ["Succulents", "Plains"],\n    // 121\n    ["Dry tundra", "Plains"],\n    // 122\n    ["Geyser", "Plains"],\n    // 123\n    ["Faerie Ring", "Plains"],\n    // 124\n    ["Cairn", "Small Mountain"],\n    // 125\n    ["Lighthouse", "Buildings"],\n    // 126\n    ["Stone Circle", "Plains"],\n    // 127\n    ["Mountain Cave", "Large Mountain"],\n    // 128\n    ["Pyramids", "Buildings"],\n    // 129\n    ["Sphinx", "Plains"],\n    // 130\n    ["Obelisk", "Plains"],\n    // 131\n    ["Clock Tower", "Buildings"],\n    // 132\n    ["Column", "Plains"],\n    // 133\n    ["Dragon Monument", "Plains"],\n    // 134\n    ["Heroic Human Statue", "Plains"],\n    // 135\n    ["Elf Monument", "Plains"],\n    // 136\n    ["Dwarf Monument", "Plains"],\n    // 137\n    ["Orc Monument", "Plains"],\n    // 138\n    ["Blessed Oak", "Large Forest"],\n    // 139\n    ["Ornamental Gardens", "Plains"],\n    // 140\n    ["Ornamental Gardens", "Plains"],\n    // 141\n    ["Mausoleum", "Buildings"],\n    // 142\n    ["Dark Forest", "Large Forest"],\n    // 143\n    ["Ancient Lair", "Small Mountain"],\n    // 144\n    ["Abandoned Lodge", "Buildings"],\n    // 145\n    ["Deserted Wayhouse", "Buildings"],\n    // 146\n    ["Rockhewn Monastery", "Buildings"],\n    // 147\n    ["House of the Spirits", "Buildings"],\n    // 148\n    ["Forgotten Temple", "Buildings"],\n    // 149\n    ["Hidden Temple", "Buildings"],\n    // 150\n    ["Place of High Sacrifice", "Buildings"],\n    // 151\n    ["Crooked House", "Buildings"],\n    // 152\n    ["Deserted Monastery", "Buildings"],\n    // 153\n    ["Dark Temple", "Buildings"],\n    // 154\n    ["Gypsy Campsite", "Plains"],\n    // 155\n    ["Abandoned Campsite", "Plains"],\n    // 156\n    ["Fortune Teller", "Plains"],\n    // 157\n    ["Fortress of Shadows", "Buildings"],\n    // 158\n    ["Ancient Claws", "Buildings"],\n    // 159\n    ["Gathering Place", "Plains"],\n    // 160\n    ["Temple of Reason", "Buildings"],\n    // 161\n    ["Steamtastic Brewery", "Buildings"],\n    // 162\n    ["Brewery Outbuildings", "Buildings"],\n    // 163\n    ["Cylindroconical Vessels", "Buildings"],\n    // 164\n    ["Mystic Tomb", "Buildings"],\n    // 165\n    ["Corrupted Land", "Large Forest"],\n    // 166\n    ["Altar of Water", "Large Forest"],\n    // 167\n    ["Altar of Fire", "Plains"],\n    // 168\n    ["Altar of Air", "Large Hill"],\n    // 169\n    ["Altar of Earth", "Large Mountain"],\n    // 170\n    ["Activated Standing Stones", "Plains"],\n    // 171\n    ["Bankside", "Plains"],\n    // 172\n    ["Beach", "Plains"],\n    // 173\n    ["Shallow Coastline", "Plains"],\n    // 174\n    ["Coast", "Plains"],\n    // 175\n    ["Coniferous Thick Forest", "Large Forest"],\n    // 176\n    ["Coniferous Dense Forest", "Large Forest"],\n    // 177\n    ["Coniferous Forested Hilltop", "Large Forest"],\n    // 178\n    ["Coniferous Wooded Land", "Small Forest"],\n    // 179\n    ["Coniferous Wooded Glade", "Small Forest"],\n    // 180\n    ["Coniferous Light Woods", "Small Forest"],\n    // 181\n    ["Snowy Thick Forest", "Large Forest"],\n    // 182\n    ["Snowy Dense Forest", "Large Forest"],\n    // 183\n    ["Snowy Forested Hilltop", "Large Forest"],\n    // 184\n    ["Snowy Wooded Land", "Small Forest"],\n    // 185\n    ["Snowy Wooded Glade", "Small Forest"],\n    // 186\n    ["Snowy Light Woods", "Small Forest"],\n    // 187\n    ["Temperate Thick Forest", "Large Forest"],\n    // 188\n    ["Temperate Dense Forest", "Large Forest"],\n    // 189\n    ["Temperate Forested Hilltop", "Large Forest"],\n    // 190\n    ["Temperate Wooded Land", "Small Forest"],\n    // 191\n    ["Temperate Wooded Glade", "Small Forest"],\n    // 192\n    ["Temperate Light Woods", "Small Forest"],\n    // 193\n    ["Scorched Forest", "Large Forest"],\n    // 194\n    ["Petrified Forest", "Large Forest"],\n    // 195\n    ["Deadvlei Forest", "Large Forest"],\n    // 196\n    ["Parched Bones", "Plains"],\n    // 197\n    ["Dead Water", "Ocean"],\n    // 198\n    ["Obsidian Mountain", "Obsidian Mountains"],\n    // 199\n    ["Glassy Crag", "Obsidian Mountains"],\n    // 200\n    ["Volcanic Mountain", "Obsidian Mountains"],\n    // 201\n    ["Lava Peak", "Obsidian Mountains"],\n    // 202\n    ["Active Peak", "Obsidian Mountains"],\n    // 203\n    ["Emerging Mountaintop", "Obsidian Mountains"],\n    // 204\n    ["Glassy Mountain", "Obsidian Mountains"],\n    // 205\n    ["Lava Pool", "Obsidian Mountains"],\n    // 206\n    ["Magma Rift", "Obsidian Mountains"],\n    // 207\n    ["Abandoned Lair", "Buildings"],\n    // 208\n    ["Ancient Graveyard", "Buildings"],\n    // 209\n    ["Broken Tower", "Buildings"],\n    // 210\n    ["Dormant Portal", "Buildings"],\n    // 211\n    ["Fallen Dwarfhold", "Buildings"],\n    // 212\n    ["Fortified Hostel", "Buildings"],\n    // 213\n    ["Lawstones", "Buildings"],\n    // 214\n    ["Sacrificial Altar", "Buildings"],\n    // 215\n    ["Tiki Pole", "Small Forest"],\n    // 216\n    ["Weeping Willow", "Small Forest"],\n    // 217\n    ["Crumbling Lighthouse", "Buildings"],\n    // 218\n    ["Fisherman\'s Hut", "Buildings"],\n    // 219\n    ["Seahenge", "Buildings"],\n    // 220\n    ["Ferry Post", "Buildings"],\n    // 221\n    ["Head Statue", "Buildings"],\n    // 222\n    ["Jungle Standing Stones", "Buildings"],\n    // 223\n    ["Shattered Head", "Buildings"],\n    // 224\n    ["Shipwreck", "Buildings"],\n    // 225\n    ["Shipwreck", "Buildings"],\n    // 226\n    ["Shipwreck", "Buildings"],\n    // 227\n    ["Shipwreck", "Buildings"],\n    // 228\n    ["Shipwreck", "Buildings"]\n    // 229\n  ];\n  var NODE_CLASS_TERRAIN = /* @__PURE__ */ new Set([40, 41, 42, 43, 44, 45]);\n  var SOV_STRUCTURE_BY_NAME = new Map(SOV_STRUCTURES.map((s) => [s.name, s]));\n  function descriptorFor(i) {\n    const named = TERRAIN_NAMES[i];\n    const entry = TERRAIN_DESCRIPTORS[i];\n    if (!named && !entry) return null;\n    const base = {\n      i,\n      name: named?.[0] ?? entry.name,\n      combat: named?.[1],\n      nodeClass: NODE_CLASS_TERRAIN.has(i) || void 0\n    };\n    if (!entry) return { ...base, bonusUnread: true, conditional: false, sovKey: null };\n    const sov = entry.building ? SOV_STRUCTURE_BY_NAME.get(entry.building) : void 0;\n    return {\n      ...entry,\n      ...base,\n      sovKey: sov?.key ?? null,\n      conditional: !!entry.building && !sov\n    };\n  }\n  var BASIC_RESOURCES = ["wood", "clay", "iron", "stone"];\n  var RESOURCE_BOOSTER_BONUS = 40;\n  var BASIC_YIELD_L20 = 2538;\n  var PRESTIGE_PRODUCTION_BONUS = 20;\n  var PRESTIGE_KEYS = [...BASIC_RESOURCES, "food", "research"];\n  var MINIMUM_KEYS = [...BASIC_RESOURCES, "food", "research"];\n  var DEFAULT_CITY_CONSUMPTION = 30800;\n  var FLOUR_MILL_L20 = 40;\n  var NATURES_BOUNTY_BY_RETREATS = [8, 16, 20, 22, 23];\n  var FAMINE_MANAGEMENT = 10;\n  var SOIL_ENRICHMENT = 15;\n  var ALLEMBINE_RP_PER_LIBRARY_LEVEL = 5;\n  var OVERFLOWING_INSIGHT_FACTOR = 1.5;\n  var LIBRARY_BASE_RP_L20 = 1013;\n\n  // src/scoring.js\n  var EPS = 1e-9;\n  function settableTax(t) {\n    return Number.isFinite(t) ? Math.floor(t) : t;\n  }\n  function computeK(foodPlots) {\n    return foodPlots * FARM_YIELD_L20 / 100;\n  }\n  function computeBOther(s) {\n    let b = prestigeBonus(s, "food");\n    if (s.flourMill) b += FLOUR_MILL_L20;\n    if (s.naturesBounty) {\n      const retreats = Math.min(s.geomancerRetreats ?? 0, 4);\n      b += NATURES_BOUNTY_BY_RETREATS[retreats];\n    }\n    if (s.isCapital) {\n      if ((s.cityCount ?? 1) >= 10) b += FAMINE_MANAGEMENT;\n      if ((s.cityCount ?? 1) >= 30) b += SOIL_ENRICHMENT;\n    }\n    return b;\n  }\n  function computeConsumption(s) {\n    return Number.isFinite(s.cityConsumption) ? s.cityConsumption : DEFAULT_CITY_CONSUMPTION;\n  }\n  function computeRRef(s) {\n    const cal = s.rpCalibration;\n    if (cal && cal.observedRpPerHour > 0) {\n      const m = PRODUCTION_BASE - cal.atTax + (cal.prestige ? PRESTIGE_PRODUCTION_BONUS : 0);\n      return cal.observedRpPerHour * 100 / m;\n    }\n    let base = LIBRARY_BASE_RP_L20;\n    if (s.allembine) base += ALLEMBINE_RP_PER_LIBRARY_LEVEL * (s.libraryLevel ?? 20);\n    return s.overflowingInsight ? base * OVERFLOWING_INSIGHT_FACTOR : base;\n  }\n  function computeBasicYield() {\n    return { yield: BASIC_YIELD_L20, measured: true };\n  }\n  function boosterBonus(s, resource) {\n    return s.resourceBoosters?.[resource] ? RESOURCE_BOOSTER_BONUS : 0;\n  }\n  function prestigeBonus(s, resource) {\n    return s.prestige?.[resource] ? PRESTIGE_PRODUCTION_BONUS : 0;\n  }\n  function resourceBonus(s, resource) {\n    return boosterBonus(s, resource) + prestigeBonus(s, resource);\n  }\n  function resourceMinimum(s, resource) {\n    const v = s.resourceMinimums?.[resource];\n    return Number.isFinite(v) && v > 0 ? v : 0;\n  }\n  function researchAt({ rRef, rpBonus = 0, tax }) {\n    return rRef * (PRODUCTION_BASE - tax + rpBonus) / 100;\n  }\n  function basicProduction({ plots, yield: y, bonus, tax }) {\n    return plots * y * (PRODUCTION_BASE - tax + bonus) / 100;\n  }\n  function distance(dx, dy) {\n    return Math.sqrt(dx * dx + dy * dy);\n  }\n  function claimUpkeep(d, level, chancery) {\n    const f = chancery ? CHANCERY_FACTOR : 1;\n    return {\n      rp: CLAIM_RP_PER_LEVEL_DISTANCE * level * d * f,\n      gold: CLAIM_GOLD_PER_LEVEL_DISTANCE * level * d * f\n    };\n  }\n  function sovStructure(entry) {\n    return SOV_STRUCTURE_BY_KEY[entry?.structure] ?? SOV_STRUCTURE_BY_KEY[DEFAULT_SOV_STRUCTURE];\n  }\n  function isProductionStructure(entry) {\n    return sovStructure(entry).type === "production";\n  }\n  function structureUpkeep(entry) {\n    return isProductionStructure(entry) ? MILSOV_UPKEEP_BY_LEVEL[entry?.buildingLevel] ?? 0 : 0;\n  }\n  function milsovUpkeep(entries) {\n    return (entries ?? []).reduce((sum, e) => sum + structureUpkeep(e), 0);\n  }\n  function tFood({ bOther, sFood, consumption, k, minimum = 0 }) {\n    return PRODUCTION_BASE + bOther + sFood - (consumption + minimum) / k;\n  }\n  function tRp({ uRp, rRef, rpBonus = 0, minimum = 0 }) {\n    return PRODUCTION_BASE + rpBonus - 100 * (uRp + minimum) / rRef;\n  }\n  function tRes({ milsovAssignments, plots, settings = {} }) {\n    const none = { ceiling: Infinity, indicative: false, binding: null, impossible: false };\n    const upkeep = milsovUpkeep(milsovAssignments ?? []);\n    const fenced = BASIC_RESOURCES.some((res) => resourceMinimum(settings, res) > 0);\n    if (upkeep <= 0 && !fenced) return none;\n    const { yield: y, measured } = computeBasicYield(settings);\n    let worst = Infinity;\n    let binding = null;\n    for (const res of BASIC_RESOURCES) {\n      const need = upkeep + resourceMinimum(settings, res);\n      const perPoint = plots[res] * y;\n      const ceiling = perPoint > 0 ? PRODUCTION_BASE + resourceBonus(settings, res) - 100 * need / perPoint : need > 0 ? -Infinity : Infinity;\n      if (ceiling < worst) {\n        worst = ceiling;\n        binding = res;\n      }\n    }\n    return { ceiling: worst, indicative: !measured, binding, impossible: worst === -Infinity };\n  }\n  function surplusAt({ tax, settings, sFood, uRp, uGold, milsovAssignments }) {\n    const s = settings;\n    const k = computeK(s.plots.food);\n    const upkeep = milsovUpkeep(milsovAssignments ?? []);\n    const { yield: y, measured } = computeBasicYield(s);\n    const consumption = computeConsumption(s);\n    const base = {\n      food: k * (PRODUCTION_BASE - tax + computeBOther(s) + (sFood ?? 0)),\n      rp: researchAt({ rRef: computeRRef(s), rpBonus: prestigeBonus(s, "research"), tax }),\n      gold: GOLD_PER_TAX_POP * tax * consumption\n    };\n    const out = {\n      tax,\n      food: base.food - consumption,\n      rp: base.rp - (uRp ?? 0),\n      gold: base.gold - (uGold ?? 0),\n      upkeep,\n      indicative: !measured\n    };\n    for (const res of BASIC_RESOURCES) {\n      base[res] = basicProduction({\n        plots: s.plots[res],\n        yield: y,\n        bonus: resourceBonus(s, res),\n        tax\n      });\n      out[res] = base[res] - upkeep;\n    }\n    out.base = base;\n    return out;\n  }\n  function tMax({ food, rp, res }) {\n    const candidates = [\n      { name: "cap", value: 100 },\n      { name: "food", value: food },\n      { name: "rp", value: rp },\n      { name: "res", value: res }\n    ];\n    let best = candidates[0];\n    for (const c of candidates) if (c.value < best.value) best = c;\n    return { value: best.value, binding: best.name };\n  }\n  function claimGold(uRp, s) {\n    return (uRp + (s?.keptClaimRp ?? 0)) * 10;\n  }\n  function goldNet({ tax, consumption, uGold }) {\n    return GOLD_PER_TAX_POP * tax * consumption - uGold;\n  }\n  function knapsack(candidates, budget, maxItems = Infinity) {\n    const needCountDim = candidates.length > maxItems;\n    const width = budget + 1;\n    const best = new Float64Array(width);\n    if (!needCountDim) {\n      const bytesPerItem = width;\n      const took = new Uint8Array(candidates.length * bytesPerItem);\n      for (let i = 0; i < candidates.length; i++) {\n        const w = candidates[i].weight;\n        const v = candidates[i].food;\n        if (w > budget) continue;\n        for (let cap = budget; cap >= w; cap--) {\n          const alt = best[cap - w] + v;\n          if (alt > best[cap]) {\n            best[cap] = alt;\n            took[i * bytesPerItem + cap] = 1;\n          }\n        }\n      }\n      return { best, took, bytesPerItem, countLimited: false };\n    }\n    const dp = [];\n    for (let c = 0; c <= maxItems; c++) dp.push(new Float64Array(width).fill(-Infinity));\n    dp[0].fill(0);\n    const choice = [];\n    for (let i = 0; i < candidates.length; i++) {\n      choice.push(new Uint8Array((maxItems + 1) * width));\n    }\n    for (let i = 0; i < candidates.length; i++) {\n      const w = candidates[i].weight;\n      const v = candidates[i].food;\n      for (let c = maxItems; c >= 1; c--) {\n        for (let cap = budget; cap >= w; cap--) {\n          const prev = dp[c - 1][cap - w];\n          if (prev === -Infinity) continue;\n          const alt = prev + v;\n          if (alt > dp[c][cap]) {\n            dp[c][cap] = alt;\n            choice[i][c * width + cap] = 1;\n          }\n        }\n      }\n    }\n    const bestCount = new Int32Array(width);\n    for (let cap = 0; cap <= budget; cap++) {\n      let m = 0;\n      let mc = 0;\n      for (let c = 0; c <= maxItems; c++) {\n        if (dp[c][cap] > m) {\n          m = dp[c][cap];\n          mc = c;\n        }\n      }\n      best[cap] = m;\n      bestCount[cap] = mc;\n    }\n    return { best, took: null, dp, choice, bestCount, width, maxItems, countLimited: true };\n  }\n  function recoverSet(candidates, dpResult, spend) {\n    const chosen = [];\n    let cap = spend;\n    if (dpResult.countLimited) {\n      const { choice, bestCount, width } = dpResult;\n      let count = bestCount[cap];\n      for (let i = candidates.length - 1; i >= 0 && count > 0; i--) {\n        if (choice[i][count * width + cap] === 1) {\n          chosen.push(i);\n          cap -= candidates[i].weight;\n          count--;\n        }\n      }\n      return chosen.reverse();\n    }\n    for (let i = candidates.length - 1; i >= 0; i--) {\n      if (dpResult.took[i * dpResult.bytesPerItem + cap] === 1) {\n        chosen.push(i);\n        cap -= candidates[i].weight;\n      }\n    }\n    return chosen.reverse();\n  }\n  function milsovHeadroom({ tax, settings, uRp = 0, buildingsUsed = 0 }) {\n    const s = settings;\n    const slots = Math.max(0, (s.maxBuildings ?? 20) - buildingsUsed);\n    if (!Number.isFinite(tax)) return { rp: 0, upkeep: 0, slots };\n    const { yield: y } = computeBasicYield(s);\n    let upkeep = Infinity;\n    for (const res of BASIC_RESOURCES) {\n      const produced = basicProduction({\n        plots: s.plots[res],\n        yield: y,\n        bonus: resourceBonus(s, res),\n        tax\n      });\n      upkeep = Math.min(upkeep, produced - resourceMinimum(s, res));\n    }\n    return {\n      rp: Math.max(0, researchAt({\n        rRef: computeRRef(s),\n        rpBonus: prestigeBonus(s, "research"),\n        tax\n      }) - uRp - resourceMinimum(s, "research")),\n      // A minimum bigger than the production it protects leaves nothing to spend\n      // rather than a negative budget.\n      upkeep: Math.max(0, upkeep),\n      slots\n    };\n  }\n  function descriptorBonus(tile, structure) {\n    const d = tile?.descriptor;\n    return d && structure && d.sovKey === structure ? d.bonus ?? 0 : 0;\n  }\n  function planMilsov({ tiles, headroom, chancery, structure }) {\n    const EPS2 = 1e-9;\n    const f = chancery ? CHANCERY_FACTOR : 1;\n    const n = Math.min(tiles.length, Math.floor(headroom.slots));\n    const D = [0];\n    for (let i = 0; i < n; i++) D.push(D[i] + tiles[i].d);\n    const rpOf = (m2) => CLAIM_RP_PER_LEVEL_DISTANCE * f * D[m2];\n    const empty = { counts: [0, 0, 0, 0, 0], levels: [], bonus: 0, rp: 0, upkeep: 0, buildings: 0 };\n    if (n === 0) return empty;\n    const layerTotal = MILSOV_UPKEEP_STEP.reduce((a, b) => a + b, 0);\n    const finish = (counts) => {\n      const levels = [];\n      let bonus = 0;\n      for (let i = 0; i < n; i++) {\n        const level = counts.filter((m2) => m2 > i).length;\n        if (level > 0) levels.push(level);\n        bonus += level * (MILSOV_BONUS_PER_LEVEL + descriptorBonus(tiles[i], structure));\n      }\n      const units = counts.reduce((a, b) => a + b, 0);\n      return {\n        counts,\n        levels,\n        bonus,\n        rp: counts.reduce((sum, m2) => sum + rpOf(m2), 0),\n        upkeep: counts.reduce((sum, m2, j) => sum + MILSOV_UPKEEP_STEP[j] * m2, 0),\n        buildings: levels.length\n      };\n    };\n    if (rpOf(n) * MILSOV_MAX_LEVEL <= headroom.rp + EPS2 && layerTotal * n <= headroom.upkeep + EPS2) {\n      return finish(new Array(MILSOV_MAX_LEVEL).fill(n));\n    }\n    const m = new Array(MILSOV_MAX_LEVEL).fill(0);\n    let best = null;\n    const search = (j, units, rp, upkeep, cap) => {\n      if (j === MILSOV_MAX_LEVEL) {\n        if (!best || units > best.units || units === best.units && rp < best.rp - EPS2) {\n          best = { counts: [...m], units, rp };\n        }\n        return;\n      }\n      let vMax = 0;\n      while (vMax < cap && rp + rpOf(vMax + 1) <= headroom.rp + EPS2 && upkeep + MILSOV_UPKEEP_STEP[j] * (vMax + 1) <= headroom.upkeep + EPS2) vMax++;\n      for (let v = vMax; v >= 0; v--) {\n        if (best) {\n          const bound = units + (MILSOV_MAX_LEVEL - j) * v;\n          if (bound < best.units) break;\n          if (bound === best.units && rp >= best.rp - EPS2) break;\n        }\n        m[j] = v;\n        search(j + 1, units + v, rp + rpOf(v), upkeep + MILSOV_UPKEEP_STEP[j] * v, v);\n      }\n      m[j] = 0;\n    };\n    search(0, 0, 0, 0, n);\n    return best ? finish(best.counts) : empty;\n  }\n  function milsovClaims({ tiles, levels, structure, chancery }) {\n    return levels.map((level, i) => ({\n      ...tiles[i],\n      structure,\n      sovLevel: level,\n      buildingLevel: level,\n      ...claimUpkeep(tiles[i].d, level, chancery)\n    }));\n  }\n  function milsovBlockedBy({ hosts, free, headroom, chancery }) {\n    if (free.length === 0) return "tiles";\n    if (hosts.length === 0) return "water";\n    if (headroom.slots < 1) return "slots";\n    if (headroom.upkeep + 1e-9 < MILSOV_UPKEEP_BY_LEVEL[1]) return "upkeep";\n    const cheapest = CLAIM_RP_PER_LEVEL_DISTANCE * (chancery ? CHANCERY_FACTOR : 1) * hosts[0].d;\n    if (headroom.rp + 1e-9 < cheapest) return "rp";\n    return null;\n  }\n  function prepareSite({ neighbours, settings }) {\n    const s = settings;\n    const chancery = !!s.chancery;\n    const maxBuildings = s.maxBuildings ?? 20;\n    const byDistance = neighbours.map((n, idx) => ({ ...n, idx, d: distance(n.dx, n.dy) })).sort((a, b) => a.d - b.d || a.food - b.food);\n    const foodCandidates = byDistance.filter((t) => t.food > 0).map((t) => {\n      const up = claimUpkeep(t.d, FOOD_CLAIM_LEVEL, chancery);\n      return { ...t, level: FOOD_CLAIM_LEVEL, ...up, weight: Math.round(up.rp) };\n    });\n    const rpBonus = prestigeBonus(s, "research");\n    const budget = Math.max(0, Math.round(researchAt({ rRef: computeRRef(s), rpBonus, tax: 0 })));\n    return {\n      settings: s,\n      chancery,\n      structure: s.milsovStructure || null,\n      k: computeK(s.plots.food),\n      bOther: computeBOther(s),\n      consumption: computeConsumption(s),\n      rRef: computeRRef(s),\n      rpBonus,\n      minFood: resourceMinimum(s, "food"),\n      minRp: resourceMinimum(s, "research"),\n      byDistance,\n      foodCandidates,\n      budget,\n      dp: knapsack(foodCandidates, budget, maxBuildings)\n    };\n  }\n  function foodSpendFor(ctx, tax) {\n    const needed = tax - PRODUCTION_BASE - ctx.bOther + (ctx.consumption + ctx.minFood) / ctx.k;\n    if (!(ctx.dp.best[ctx.budget] >= needed - EPS)) return null;\n    let lo = 0;\n    let hi = ctx.budget;\n    while (lo < hi) {\n      const mid = lo + hi >> 1;\n      if (ctx.dp.best[mid] >= needed - EPS) hi = mid;\n      else lo = mid + 1;\n    }\n    const produced = researchAt({ rRef: ctx.rRef, rpBonus: ctx.rpBonus, tax });\n    return produced - lo - ctx.minRp < -EPS ? null : lo;\n  }\n  function planSiteAt(ctx, tax) {\n    const s = ctx.settings;\n    const spend = Number.isFinite(tax) ? foodSpendFor(ctx, tax) : null;\n    if (spend === null) return null;\n    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, spend).map((i) => ctx.foodCandidates[i]);\n    const claimed = new Set(tiles.map((t) => t.idx));\n    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));\n    const hosts = free.filter((t) => !t.water);\n    const headroom = milsovHeadroom({\n      tax,\n      settings: s,\n      uRp: spend,\n      buildingsUsed: tiles.length\n    });\n    const military = planMilsov({\n      tiles: ctx.structure ? hosts : [],\n      headroom,\n      chancery: ctx.chancery,\n      structure: ctx.structure\n    });\n    const milsov = milsovClaims({\n      tiles: hosts,\n      levels: military.levels,\n      structure: ctx.structure,\n      chancery: ctx.chancery\n    });\n    const sFood = ctx.dp.best[spend];\n    const milsovRp = milsov.reduce((sum, a) => sum + a.rp, 0);\n    const uRp = spend + milsovRp;\n    const uGold = claimGold(uRp, s);\n    const resCeiling = tRes({ milsovAssignments: milsov, plots: s.plots, settings: s });\n    const ceiling = tMax({\n      food: tFood({\n        bOther: ctx.bOther,\n        sFood,\n        consumption: ctx.consumption,\n        k: ctx.k,\n        minimum: ctx.minFood\n      }),\n      rp: tRp({ uRp, rRef: ctx.rRef, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),\n      res: resCeiling.indicative ? Infinity : resCeiling.ceiling\n    });\n    return {\n      tax,\n      tMax: ceiling.value,\n      binding: ceiling.binding,\n      sFood,\n      spend,\n      uRp,\n      uGold,\n      goldNet: goldNet({ tax, consumption: ctx.consumption, uGold }),\n      // What running this plan leaves per hour, at the tax it is run at, so the\n      // ceiling that binds reads 0 and the rest read as headroom.\n      surplus: Number.isFinite(tax) ? surplusAt({ tax, settings: s, sFood, uRp, uGold, milsovAssignments: milsov }) : null,\n      tiles,\n      free,\n      headroom,\n      milsov,\n      milsovBonus: military.bonus,\n      milsovUpkeep: military.upkeep,\n      milsovRp,\n      milsovGold: milsov.reduce((sum, a) => sum + a.gold, 0),\n      milsovBlocked: ctx.structure && milsov.length === 0 ? milsovBlockedBy({ hosts, free, headroom, chancery: ctx.chancery }) : null,\n      resCeiling: resCeiling.ceiling,\n      resIndicative: resCeiling.indicative,\n      resBinding: resCeiling.binding,\n      resImpossible: resCeiling.impossible\n    };\n  }\n  function milsovAtFloor(ctx, { required, floor, ceiling }) {\n    const at = (tax) => {\n      const p = planSiteAt(ctx, tax);\n      return p && p.milsovBonus >= required ? p : null;\n    };\n    let lo = Math.ceil(floor);\n    let best = at(lo);\n    if (!best) return null;\n    let hi = Math.floor(ceiling);\n    while (hi - lo > 1) {\n      const mid = Math.floor((lo + hi) / 2);\n      const p = at(mid);\n      if (p) {\n        best = p;\n        lo = mid;\n      } else {\n        hi = mid;\n      }\n    }\n    return { bonus: best.milsovBonus, tax: best.tax };\n  }\n  function siteCeiling(ctx) {\n    const floors = tRes({ milsovAssignments: [], plots: ctx.settings.plots, settings: ctx.settings });\n    const res = floors.indicative ? Infinity : floors.ceiling;\n    let winner = null;\n    for (let spend = 0; spend <= ctx.budget; spend++) {\n      const sFood = ctx.dp.best[spend];\n      const t = tMax({\n        food: tFood({\n          bOther: ctx.bOther,\n          sFood,\n          consumption: ctx.consumption,\n          k: ctx.k,\n          minimum: ctx.minFood\n        }),\n        rp: tRp({ uRp: spend, rRef: ctx.rRef, rpBonus: ctx.rpBonus, minimum: ctx.minRp }),\n        res\n      });\n      const net = goldNet({\n        tax: t.value,\n        consumption: ctx.consumption,\n        uGold: claimGold(spend, ctx.settings)\n      });\n      if (!winner || betterPlan({ tMax: t.value, uRp: spend, goldNet: net }, winner)) {\n        winner = { tMax: t.value, binding: t.binding, sFood, spend };\n      }\n    }\n    return winner;\n  }\n  function scoreSite({ neighbours, settings }) {\n    return scoreSiteFrom(prepareSite({ neighbours, settings }));\n  }\n  function scoreSiteFrom(ctx) {\n    const s = ctx.settings;\n    const winner = siteCeiling(ctx);\n    if (!winner) return null;\n    const plan = planSiteAt(ctx, settableTax(winner.tMax)) ?? fallbackPlan(ctx, winner);\n    const cheaper = ctx.structure ? planSiteAt(ctx, plan.tax - 1) : null;\n    const required = ctx.structure ? Math.max(0, s.milsovMinBonus ?? 0) : s.milsovMinBonus ?? 0;\n    const floor = Math.min(s.tMin ?? 0, plan.tax);\n    const reach = required > 0 && plan.milsovBonus < required && Number.isFinite(plan.tax) ? milsovAtFloor(ctx, { required, floor, ceiling: plan.tax }) : null;\n    return {\n      ...plan,\n      // What the site is reported and ranked at: the highest whole number its food\n      // plan holds. `tMaxExact` is what the arithmetic solved for, kept because it\n      // is the true ceiling \u2014 and because it is not a rate anyone can set.\n      tMax: plan.tax,\n      tMaxExact: winner.tMax,\n      // Which ceiling stopped the tax going higher is a question about the exact\n      // one; the plan\'s own ceiling has the rounding slack in it.\n      binding: winner.binding,\n      milsovPrice: cheaper ? cheaper.milsovBonus - plan.milsovBonus : 0,\n      // Where the minimum is met, if it is not met for free: the highest tax that\n      // still delivers it. Null means the free plan already covers it, or nothing\n      // in the acceptable range does.\n      milsovMinTax: reach ? reach.tax : null,\n      milsovMinBonusAt: reach ? reach.bonus : null,\n      // Only a genuine shortfall now: not reachable anywhere the user would accept.\n      milsovShortfall: required > 0 && plan.milsovBonus < required && !reach\n    };\n  }\n  function fallbackPlan(ctx, winner) {\n    const tiles = recoverSet(ctx.foodCandidates, ctx.dp, winner.spend).map((i) => ctx.foodCandidates[i]);\n    const claimed = new Set(tiles.map((t) => t.idx));\n    const free = ctx.byDistance.filter((t) => !claimed.has(t.idx));\n    const headroom = milsovHeadroom({\n      tax: winner.tMax,\n      settings: ctx.settings,\n      uRp: winner.spend,\n      buildingsUsed: tiles.length\n    });\n    return {\n      tax: winner.tMax,\n      tMax: winner.tMax,\n      binding: "food",\n      sFood: winner.sFood,\n      spend: winner.spend,\n      uRp: winner.spend,\n      uGold: claimGold(winner.spend, ctx.settings),\n      goldNet: goldNet({\n        tax: winner.tMax,\n        consumption: ctx.consumption,\n        uGold: claimGold(winner.spend, ctx.settings)\n      }),\n      surplus: null,\n      tiles,\n      free,\n      headroom,\n      milsov: [],\n      milsovBonus: 0,\n      milsovUpkeep: 0,\n      milsovRp: 0,\n      milsovGold: 0,\n      milsovBlocked: ctx.structure ? milsovBlockedBy({\n        hosts: free.filter((t) => !t.water),\n        free,\n        headroom,\n        chancery: ctx.chancery\n      }) : null,\n      resCeiling: Infinity,\n      resIndicative: false,\n      resBinding: null,\n      resImpossible: false\n    };\n  }\n  function betterPlan(a, b) {\n    const EPS2 = 1e-9;\n    if (a.tMax > b.tMax + EPS2) return true;\n    if (a.tMax < b.tMax - EPS2) return false;\n    if (a.uRp < b.uRp - EPS2) return true;\n    if (a.uRp > b.uRp + EPS2) return false;\n    return a.goldNet > b.goldNet;\n  }\n\n  // src/payload.js\n  function tileKey(y, x) {\n    return `${y}|${x}`;\n  }\n  function parseKey(key) {\n    const [y, x] = key.split("|").map(Number);\n    return { x, y };\n  }\n  function parseRs(tile) {\n    if (!tile || typeof tile.rs !== "string") return null;\n    const parts = tile.rs.split("|").map(Number);\n    if (parts.length !== 5 || parts.some(Number.isNaN)) return null;\n    return { wood: parts[0], clay: parts[1], iron: parts[2], stone: parts[3], food: parts[4] };\n  }\n  function foodOf(tile) {\n    const rs = parseRs(tile);\n    return rs ? rs.food : 0;\n  }\n  var WATER_BIOME = 20;\n  function isWaterTile(tile) {\n    const rs = parseRs(tile);\n    if (!rs) return tile?.b === WATER_BIOME;\n    return rs.wood + rs.clay + rs.iron + rs.stone === 0;\n  }\n  function indexPayload(payload) {\n    const claims = /* @__PURE__ */ new Map();\n    const towns = /* @__PURE__ */ new Map();\n    for (const [key, claim] of Object.entries(payload.s ?? {})) {\n      claims.set(key, claim);\n    }\n    for (const [key, town] of Object.entries(payload.t ?? {})) {\n      towns.set(key, town);\n    }\n    return { claims, towns };\n  }\n  function isClaimable(tile, key, idx, settings) {\n    if (!tile || tile.sov !== 1) return false;\n    if (tile.imp || tile.brg) return false;\n    const claim = idx.claims.get(key);\n    if (claim) {\n      const rd = claim.rd;\n      if (rd === "Yours" && settings.ownClaimsAvailable) return true;\n      if (rd === "Alliance" && settings.allianceClaimsAvailable) return true;\n      return false;\n    }\n    return true;\n  }\n  function isSettleable(tile) {\n    if (!tile) return false;\n    if (tile.set !== void 0) return tile.set === 1;\n    if (tile.imp || tile.brg || tile.npc) return false;\n    if (isWaterTile(tile)) return false;\n    return tile.sov === 1 && tile.hos === 1;\n  }\n  function isCandidateSite(tile, key, idx, settings, towns) {\n    if (!isSettleable(tile)) return { ok: false, reason: "not-settleable" };\n    if (idx.claims.has(key)) return { ok: false, reason: "already-claimed" };\n    if (idx.towns.has(key)) return { ok: false, reason: "town-tile" };\n    const { x, y } = parseKey(key);\n    for (const t of towns) {\n      const d = Math.sqrt((t.x - x) ** 2 + (t.y - y) ** 2);\n      if (t.own) {\n        if (d < settings.dOwn) return { ok: false, reason: "too-close-own" };\n      } else if (d < settings.dOther) {\n        return { ok: false, reason: "too-close-other" };\n      }\n    }\n    return { ok: true };\n  }\n  function townString(town) {\n    if (typeof town === "string") return town;\n    if (!town || typeof town !== "object") return "";\n    for (const v of Object.values(town)) {\n      if (typeof v !== "string" || !v.includes("|")) continue;\n      const parts = v.split("|");\n      if (parts.length >= 4 && Number.isFinite(Number(parts[2])) && parts[2] !== "" && Number.isFinite(Number(parts[3])) && parts[3] !== "") {\n        return v;\n      }\n    }\n    return "";\n  }\n  function extractTowns(payload) {\n    const out = [];\n    for (const [key, town] of Object.entries(payload.t ?? {})) {\n      const parts = townString(town).split("|");\n      const x = Number(parts[2]);\n      const y = Number(parts[3]);\n      const pos = Number.isNaN(x) || Number.isNaN(y) ? parseKey(key) : { x, y };\n      out.push({\n        ...pos,\n        // parts[0] is the town\'s name. Blank where the string is not the pipe\n        // format, which the caller shows as the coordinates instead.\n        name: parts[0] ?? "",\n        own: town && town.rd === "Yours",\n        rd: town && town.rd,\n        key\n      });\n    }\n    return out;\n  }\n  function collectNeighbourhood(payload, key, rClaim, idx, settings) {\n    const { x, y } = parseKey(key);\n    const neighbours = [];\n    const missing = [];\n    for (let dy = -rClaim; dy <= rClaim; dy++) {\n      for (let dx = -rClaim; dx <= rClaim; dx++) {\n        if (dx === 0 && dy === 0) continue;\n        const nKey = tileKey(y + dy, x + dx);\n        const tile = payload.data[nKey];\n        if (!tile) {\n          missing.push(nKey);\n          continue;\n        }\n        if (!isClaimable(tile, nKey, idx, settings)) continue;\n        neighbours.push({\n          dx,\n          dy,\n          food: foodOf(tile),\n          key: nKey,\n          i: tile.i,\n          water: isWaterTile(tile),\n          // Carried on the tile so the panel never repeats the lookup, and so a\n          // plan travelling from the worker arrives with its descriptors already\n          // on it. Null where nothing identifies the terrain.\n          descriptor: descriptorFor(tile.i)\n        });\n      }\n    }\n    return { neighbours, missing };\n  }\n  function neighbourhood(payload, key, rClaim, idx, settings) {\n    const { neighbours, missing } = collectNeighbourhood(payload, key, rClaim, idx, settings);\n    return missing.length ? null : neighbours;\n  }\n\n  // src/worker.js\n  self.onmessage = (e) => {\n    const { payload, settings } = e.data;\n    const idx = indexPayload(payload);\n    const towns = extractTowns(payload);\n    const keys = Object.keys(payload.data ?? {});\n    const results = [];\n    const incomplete = [];\n    let done = 0;\n    for (const key of keys) {\n      const tile = payload.data[key];\n      if (isCandidateSite(tile, key, idx, settings, towns).ok) {\n        const neighbours = neighbourhood(payload, key, settings.rClaim, idx, settings);\n        if (neighbours === null) {\n          incomplete.push({ key, ...parseKey(key) });\n        } else {\n          const plan = scoreSite({ neighbours, settings });\n          if (plan && !plan.milsovShortfall && plan.tMax >= settings.tMin) {\n            results.push({ key, ...parseKey(key), rs: parseRs(tile), neighbours, ...plan });\n          }\n        }\n      }\n      if (++done % 100 === 0) {\n        self.postMessage({ type: "progress", done, total: keys.length });\n      }\n    }\n    results.sort((a, b) => b.tMax - a.tMax || b.goldNet - a.goldNet);\n    self.postMessage({\n      type: "done",\n      results,\n      incomplete,\n      scanned: keys.length\n    });\n  };\n})();\n'], { type: "text/javascript" })
  );
  var settings = { ...DEFAULT_SETTINGS };
  var lastResults = [];
  var store = createSettingsStore();
  var restored = store.load();
  var hits = probeInPageData();
  if (hits.length) {
    console.info("[sov-scanner] reading in-page map data live from:", hits.map((h) => h.source).join(", "));
  }
  var saveTimer = null;
  function saveSoon(s) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => panel.setStoreNote(store.save(s)), 250);
  }
  var panel = createPanel({
    initialSettings: restored.settings ?? DEFAULT_SETTINGS,
    onSettingsChange: saveSoon,
    onScan: runScan,
    // Read on each Optimise press, against the same payload the last Scan ran on.
    getPayload: getLatestPayload,
    onExport: () => {
      if (!lastResults.length) return;
      const blob = new Blob([csvFile(lastResults)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = csvFilename();
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 0);
    }
  });
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
      panel.setStatus("No map payload observed yet. Pan or zoom the map, then Scan.");
      return;
    }
    panel.setStatus("Scanning\u2026");
    const worker = new Worker(workerUrl);
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress") {
        panel.setStatus(`Scanning\u2026 ${msg.done}/${msg.total}`);
        return;
      }
      lastResults = msg.results;
      panel.renderResults(msg.results, {
        x: payload.x,
        y: payload.y,
        zoom: payload.zoom,
        scanned: msg.scanned
      });
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
    // The last payload, for looking at when the tool reads something out of it
    // wrongly — the block formats are only partly documented.
    get payload() {
      return getLatestPayload();
    },
    set settings(v) {
      panel.setSettings({ ...DEFAULT_SETTINGS, ...v });
    },
    probeInPageData
  };
})();
