// What changed for players in each version, newest first, shown under the
// panel's changelog button. Only what a player would notice belongs here.
// `date` is the release date, null for a version not yet released.

export const CHANGELOG = [
  {
    version: '2.0.0',
    date: null,
    changes: [
      'Site Search numbers its top ten right on the World Map. Click a row to find its tile, or click a number to jump to its row.',
      'Optimal Sovereignty draws its whole plan on the World Map: the radius, your food and military claims, the claims you’re keeping and anything you’ve crossed out. Drag the tax slider and watch it redraw.',
      'Prefer a clean map? Untick Mark sites on the World Map under ⚙ and the panel keeps its pens to itself.',
      'New Pick on map button: press it, click a tile, done. No more squinting at coordinates.',
      'Plan hanging off the edge of the screen? Click Centre the map and it hops over and plans again once the map has loaded.',
      'New City Buildings section in City Configuration. Tell it how many of your level 20 military, diplomacy and magic buildings eat basic resources, and their upkeep gets paid before any sovereignty.',
      'The Chancery of Estates discount only applies to the first level of each claim, just like in game. Build more than one and their discounts stack.',
      'City Configuration sections fold down to a one-line summary, so you can see your whole city at a glance.',
      'A shiny new crown icon, bigger when the panel is folded. Hover over it for a little sparkle.',
      'The folded panel stays where you left it after a reload, instead of creeping in from the edge.',
    ],
  },
  {
    version: '1.2.1',
    date: '2026-09-27',
    changes: [
      'Scan and Optimise only look at the tiles on your screen, not everywhere you’ve panned past since opening the map.',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-09-23',
    changes: [
      'Fixed Preserve Existing Sovereignty: it keeps only the planned town’s own claims, and raising one of them costs just the extra levels.',
      'Turn Preserve Existing Sovereignty off on one of your towns to plan it from scratch. Handy for tearing up an old layout.',
      'The game’s Check All button no longer sneaks in and ticks the scanner’s settings.',
      'Long explanations moved into tooltips, and Optimal Sovereignty nags less about tiles.',
    ],
  },
  {
    version: '1.1.2',
    date: '2026-09-04',
    changes: [
      'Sites at the very edge of the world get scored too.',
      'Barren land like Marsh and Fen is no longer mistaken for water.',
      'Tax can’t drop below 0%. A site that can’t support any tax is shown at 0% with its shortfall, so you can see how far off it is.',
      'Alliance members’ claims are no longer shown as up for grabs.',
      'Fixed checkbox settings switching themselves on when nobody asked.',
    ],
  },
  {
    version: '1.1.1',
    date: '2026-08-31',
    changes: [
      'Research estimates are closer to what the game shows: Allembine and Overflowing Insight add their research after tax.',
      'Claim costs round distances the same way the game does, so the numbers match down to the gold piece.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-08-30',
    changes: [
      'The panel tucks itself away when you leave the World Map. Not a fan? Untick Minimise when off the World Map under ⚙.',
      'Optimal Sovereignty’s town list shows your towns by name and keeps up as you move the map.',
      'The Sovereignty Radius hint follows the Claim Radius you set.',
      'A new icon.',
    ],
  },
  {
    version: '1.0.1',
    date: '2026-08-24',
    changes: [
      'Drag the panel anywhere by its title bar. It remembers where you left it.',
      'The scanner only reads the map the game has already loaded, and never touches your connection to the game.',
      'Fixed the starting research figure for a city.',
      'Added the licence and copyright notice, behind the ⓘ.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-08-22',
    changes: [
      'First release! Site Search, Optimal Sovereignty, City Configuration and CSV export.',
    ],
  },
];
