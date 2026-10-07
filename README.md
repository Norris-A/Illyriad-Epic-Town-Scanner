# Illyriad Sovereignty Site Scanner

A Tampermonkey script for [Illyriad](https://www.illyriad.co.uk/) that finds the
best places on the World Map to build a sovereignty city, and plans which tiles
to claim around them.

- **Site Search** ranks every tile on screen you could settle by the highest tax
  a city there could sustain.
- **Optimal Sovereignty** plans the claims around one tile you choose — empty
  ground or one of your own towns.
- **City Configuration** tells both what your city has: its plots, buildings,
  research and bonuses.

**Nothing leaves your browser.** The script makes no network requests. It reads
the map the game has already loaded, does its work on your machine, and never
contacts the game server or anyone else.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Click **[install the script](https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js)**
   and confirm on Tampermonkey's install screen.
3. Open the World Map in Illyriad. The panel appears on the right.

Updates install themselves. To check straight away, open Tampermonkey's dashboard
and choose *Utilities → Check for userscript updates*.

## Quick start

1. Open **City Configuration** and describe your city — at the least, how its
   settle tile's plots will be split and how much food it eats. Everything saves
   as you type.
2. Pan the World Map to the area you are interested in.
3. On **Site Search**, press **Scan**.
4. Click a result to see its plan, or press **Optimise** on it to fine-tune it.

## The panel

- **Move it** by dragging the title bar. **Fold it** to a small icon by clicking
  the title, and click again to open it. It remembers where you left it.
- **Away from the World Map** it folds itself, since there is no map to read
  there.
- **The changelog**, the page icon beside ⚙, lists what changed in each
  version.
- **The ⚙ menu** has two switches: *Minimise when off the World Map*, and *Mark
  sites on the World Map*, which turns off everything the panel draws on the
  game's map.
- **The ⓘ** links to the licence and copyright notice.

## Site Search

Pan or zoom so the area you care about is on screen, then press **Scan**. Every
tile there that you could settle is ranked by the highest tax a city on it could
sustain.

A tile is left out if it already has a town or is already claimed, if it is
closer to another town than the distances you set in City Configuration, or if
it cannot reach your Minimum Tax. If you set a Minimum Military Bonus, sites that
cannot reach it at any tax down to your Minimum Tax are left out too.

| Column | Shows |
|---|---|
| Site | The rank and the tile's coordinates. The top ten are ringed, matching the numbers drawn on the World Map |
| Max Tax | The highest tax the site can hold on its food claims alone. The small icon beside it shows what stops it going higher: food, research, a basic resource running out, or the game's tax cap |
| Food icon | Food per hour left over at that tax |
| Research icon | Research per hour the claims cost |
| Gold icon | Gold per hour after paying for the claims |
| Military icon | The military unit production bonus the site fits for free, if you chose a military structure. Small tags flag anything worth knowing — hover them for the details |

The line above the table says where the scan looked and how many sites it found.
If some sites were skipped because their claims would reach off screen, it says
how many: zoom out or pan, then scan again.

The table lists the best 200. **Export CSV** saves every site the scan found as a
spreadsheet.

### A site's plan

Click a row to open its plan.

- **Tax slider** — drag it down to see what a lower tax buys you, usually a
  bigger military bonus.
- **Balance** — for each production, a bar of how much is spent out of what the
  city makes, and what is left over each hour. *limit* marks the one that sets
  the tax.
- **Military** — the bonus, the buildings that give it, and their hourly upkeep.
- **Claim grid** — the tiles around the site, showing what to claim and at what
  level: green for food claims, amber for military, ✕ for tiles you cannot have.
  A tile's small text is its terrain bonus. Click a tile to cross it out and
  re-plan without it; hover for its distance, research cost and upkeep.
- **Optimise x|y →** — takes the site to Optimal Sovereignty.

### On the World Map

After a scan, the top ten are numbered on the World Map itself. Clicking a row
outlines its tile in blue, and clicking a numbered tile opens its row.

The numbers stay on their tiles as you move the map, so you can pan away and
back; ground that comes into view is not numbered until you scan it. They show
only while Site Search is open, and leaving the World Map clears them.

## Optimal Sovereignty

Where Site Search asks "which of these tiles is best?", this asks "what should I
build on *this* one?" It plans any tile, even one that is settled, claimed or too
close to a town — it just tells you which.

**Choose the tile** in one of three ways: pick one of your towns from the list,
type its coordinates, or press **Pick on map** and click it on the World Map.
While Pick on map is waiting for your click it turns red; press it again to
cancel.

| Option | What it does |
|---|---|
| Sovereignty Radius | How far out to claim. Leave it blank to use the Claim Radius from City Configuration |
| Starting Tax | Where the tax slider starts, 60% unless you change it. If the tile cannot hold it, the plan starts at the tile's maximum instead |
| Preserve Existing Sovereignty | For one of your towns: keep the claims it already holds and plan around them, paying only to raise their levels. Leave it off to plan from scratch, for reworking a layout |

The folded **City Configuration** section below these holds three settings
shared with that tab — change them in either place:

- **Use the Plot Allocation from City Configuration** — on, the tile is planned
  as you will terraform it; off, on its plots as they are today.
- **The plot allocation** itself.
- **Treat Your Own Claims as Available** — on, tiles you already claim count as
  free ground, as if you gave them up; off, they are off limits except to the
  town that holds them.

Press **Optimise**. The result shows the tile's maximum tax, radius and how many
tiles around it can be claimed, then the same plan as a Site Search row: slider,
balance, military and claim grid.

The whole radius has to be on screen. If it is not, the result says so and offers
*Centre the map on x|y*, which moves the map there and optimises again once it
has loaded.

The plan is also drawn on the World Map: the tile outlined in blue, the radius as
a dashed square, food claims green, military claims amber, claims you are keeping
blue-grey, and crossed-out tiles with a red ✕. It follows the slider and your
cross-outs, and stays in place as you move the map; leaving the World Map clears
it. It is only a picture: clicking the map still does what it normally does.

## City Configuration

Everything the planner needs to know about your city. Changes apply from the next
Scan or Optimise.

Each section folds down to its name and a one-line summary, so you can see the
whole configuration at a glance. Click a section to open it.

| Section | What you set |
|---|---|
| Settle Tile | How the settle tile's 25 plots will be split once terraformed. **Prefill from Selected Tile** copies the plots of the result row you last clicked |
| City Food | Food eaten per hour, Nature's Bounty and Geomancer Retreats, how many cities you have, and whether this one is your capital |
| Research | Allembine Research, Overflowing Insight, and an optional reading of your city's actual research output, which replaces the estimate |
| Production | For each production: whether its booster building is built (the Flour Mill, for food), whether prestige is boosting it, and how much per hour the plan must leave spare |
| City Buildings | How many you have of each building that uses wood, clay, iron or stone every hour. Their upkeep is set aside before any sovereignty is paid for, and Chanceries of Estates also make the first level of every claim cheaper. Hover a building's resource icons for what it uses |
| Sovereignty | Claim radius, the most buildings to place, which military structure to build, and the smallest military bonus worth having |
| Site Filters | The Minimum Tax a site needs to be listed, how far a site must be from other players, your own cities and alliance towns, and whether tiles you already claim count as free ground |

Your configuration is saved in this browser as you edit it. **Reset to Defaults**
puts back the starting values; it does not move the panel. If you edit it in two
game tabs at once, the other tab follows along. After an update, settings the
new version no longer uses are dropped, new ones start at their defaults, and the
panel says when it has done so.

## How sites are scored

**Food comes first.** The tax a site can sustain on food claims alone is its
score, and decides the ranking.

**Military sovereignty uses what is left over** — the research, tiles, building
slots and resources the food plan did not need. So it never costs a site any tax
and never changes the ranking. You choose the structure; the planner decides how
many to build, at what levels and on which tiles.

That last choice is a balancing act. A claim's research cost grows with its
distance from the town, which favours a few buildings close in. But a building's
upkeep doubles with every level — 150, 300, 600, 1,200, then 2,400 per hour —
which favours many low-level buildings spread out. The planner weighs the two for
each site. To trade tax for a bigger military bonus, drag the tax slider down.

## Terrain bonuses

Most tiles give a small bonus — 1% to 3% of one product per level of a matching
building — shown on the tile as, say, `+3% Bows`. These bonuses are **not
scored**, since those products are outside what the planner models. Treat them as
a hint about what a tile is good for.

A few terrain types have never been found in the game world, so their bonus is
unknown. Hovering a tile says whether its terrain gives nothing or simply has not
been recorded yet.

## Known limits

- **Only the five military structures are offered** — Training Ground, Target
  Range, Military Academy, Jousting Yard and Assembly Yard. Crafting structures
  are not offered.
- **Terrain bonuses are not scored**, as above.
- **Buildings are assumed to be at level 20**, the level a finished city runs
  them at.
- **Only what is on screen is scanned.** Pan or zoom out to cover more ground.

## Development

Building, testing and releasing the script are covered in
[DEVELOPMENT.md](DEVELOPMENT.md).

## Licence

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify and share for any
noncommercial purpose. It covers the code in this repository only. The game's
icon art comes from the official Illyriad fansite kit; it, the game data and the
terrain names remain the intellectual property of Illyriad Games Limited, whose
[copyright notice](LICENSE#illyriad-content) applies wherever they appear. This
is an unofficial fan tool, not affiliated with or endorsed by Illyriad Games
Limited.
