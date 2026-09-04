# Illyriad Sovereignty Site Scanner

A Tampermonkey userscript that finds good sovereignty sites on the Illyriad world
map, and plans the claims for one you have picked.

- **Site Search** ranks every claimable tile on screen by the highest tax rate a
  city there could sustain.
- **Optimal Sovereignty** points the same planner at one tile you name, settled
  or not, and shows what to claim around it.

**The script makes no network requests.** It reads the map data the game has
already loaded into the page, works on it locally when you press Scan or
Optimise, and never contacts the game server. Nothing you enter leaves your
machine.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Click **[install the script](https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main/dist/illyriad-sov-scanner.user.js)**.
   Tampermonkey recognises the `.user.js` address and opens its install screen —
   confirm there.
3. Load the Illyriad world map. The panel appears down the side.

Updates are automatic: Tampermonkey checks for a new version on its own schedule
and installs it. You can force a check from its dashboard under *Utilities →
Check for userscript updates*.

## The panel

Three tabs — **Site Search**, **Optimal Sovereignty** and **City
Configuration** — and a gear for the panel's own settings.

Drag the title bar to move the panel; click the title to fold it down to its
icon, and click again to open it. It stays where you put it between visits. On
any page other than the world map it folds itself away, since there is no map
data to read there; turn that off under the gear if you would rather it stayed
open.

## Site Search

Pan or zoom the map to the region you care about, then press **Scan**. Every
tile on screen that you could settle is ranked by the highest tax a city there
could sustain.

| Column | What it means |
|---|---|
| Site | The tile's coordinates |
| Max Tax | Highest whole-number tax the site holds on food alone |
| Limited By | What stops it going higher — tax cap, food, research or resources |
| Food | Food per hour the city nets at that tax |
| Research | Research per hour the claims cost |
| Net Gold | Gold per hour after claim upkeep |
| Military | Free military bonus fitted on top, if you asked for a structure |

Click a row to open the plan: a grid of the tiles around the site showing what to
claim and at what level, and a tax slider so you can see what the plan looks like
at a lower rate. **Optimise x|y →** carries that tile over to the Optimal
Sovereignty tab. **Export CSV** writes out every site the scan found, not just
the first two hundred the table lists.

The summary line above the results says how much map was checked and how many
candidates it held, whether or not any met your minimum. If sites were skipped
because the map data does not reach all the way around them, it says how many —
zoom out or pan so the whole area is on screen, then scan again.

Tiles are dropped from the results when they already carry a town, are already
claimed, sit closer to an existing town than the distances you set under
Neighbours, or hold less than your Minimum Tax.

## Optimal Sovereignty

Where Site Search answers "which of these tiles is best", this answers "what
would I actually build on *this* one".

| Input | Default |
|---|---|
| One of Your Towns | Fills the coordinates from a town of yours on the map |
| Coordinates, `x` and `y` | — |
| Sovereignty Radius | Blank, which follows the Claim Radius in City Configuration |
| Starting Tax | 60%, then dragged on the same slider the results carry |
| Use the Plot Allocation from City Configuration | On — plans the centre tile as you mean to terraform it, rather than on its ratings today |
| Preserve Existing Sovereignty | Off — on a town of yours, keeps the claims you already hold and charges what they already cost, so the plan is what you can still add |

Everything else comes from City Configuration.

Any tile can be examined here, including one already settled, already claimed, or
too near a town — the result says which of those it is rather than hiding the
tile. If the radius reaches past the map data currently loaded, it says how many
tiles are missing instead of planning around ground it cannot see.

## City Configuration

What the planner assumes about your city. It applies to the next Scan and the
next Optimise.

| Group | Setting |
|---|---|
| Ranking | Minimum Tax a site must hold to be listed (50%) |
| Settle Tile | How the settle tile's 25 plots are split once terraformed. **Prefill from Selected Tile** copies the ratings of whichever result row you last clicked |
| City Food | Food consumed per hour, Flour Mill, Nature's Bounty and Geomancer Retreats, number of cities, and whether this one is the capital |
| Research | Allembine Research, Overflowing Insight, and an override for reading your city's actual research output off the game |
| Basic Resources | Which booster buildings you run at level 20 |
| Prestige | The production boost, per resource |
| Minimum Surplus | A floor per hour on any of the six productions, so a plan cannot starve one |
| Sovereignty | Chancery of Estates, claim radius, maximum buildings, which military structure to place, and the smallest military bonus worth having |
| Neighbours | Minimum distance to other players (10), to your own cities (3) and to alliance towns (3), and whether to treat tiles you have already claimed as available |

The form saves itself in your browser as you edit it, under the game's own
origin, and restores next visit. **Reset to Defaults** clears it back; it does
not move the panel, which remembers its position separately. Nothing is sent
anywhere.

Settings saved by an older version still load: anything unrecognised is dropped,
anything missing takes its default, and the panel says when something drifted.

## Terrain bonuses

Most tiles grant a small production bonus — 1–3% of one product, per level of a
named building — shown on the tile as `+3% Bows`, with the full sentence in the
hover text. It is **not scored**: those products are outside what the tool
models. Treat it as advice about what a tile is *for*.

Terrain names come from the game client itself. Of the 229 it names, 188 have had
their bonus read off a real tile; the rest appear nowhere in the world, so there
has been no tile to stand on and read. The hover text distinguishes a terrain
that grants nothing from one nobody has read yet, so a blank is never ambiguous.

## How a site is scored

**Food first, alone.** It is the only claim that gives the city anything back,
and the tax it can sustain is the site's answer.

**Military sovereignty then takes what is left over** — the research the food
plan did not spend, the tiles it did not claim, the building slots it did not
use, and what the city can still afford to run. It never costs the site a point
of tax, so the military column never changes the ranking. You pick the structure;
the tool works out how many, at what levels, and on which tiles.

That last part is a real trade rather than a rule of thumb. Research costs
`2 × distance` per point of bonus at any level, so research wants the plan
concentrated on near tiles — while hourly upkeep climbs steeply with level
(150/300/600/1,200/2,400), so upkeep wants it spread over many low-level
buildings. Which wins depends on the site, and each site says what it chose and
what one more point of tax would have bought.

## Known limits

- **Only the five military structures are offered** as sovereignty buildings. The
  thirteen crafting ones are costed correctly when a tile's terrain names one,
  but the picker asks which unit the city is being built to make, and eighteen
  entries made it a catalogue.
- **Terrain bonuses are not scored**, as above.

---

# Development

## Setup

```bash
npm install
```

Requires **Node 18+**; developed and verified on Node 24 LTS. npm 11+ blocks
install scripts by default, so `package.json` carries an `allowScripts` entry
for esbuild — without it the platform binary never unpacks and the build fails.

```bash
npm run build
```

Produces `dist/dev/illyriad-sov-scanner.user.js` at a `-dev` version stamped to
the minute. Install it in Tampermonkey by opening that file's URL in the browser,
or by pasting its contents into the Tampermonkey editor. `npm run watch` rebuilds
on save — edits to `src/worker.js` or its imports need the watch restarted.

A dev build installs under its own `@name` and carries no update URLs, so it sits
beside the released copy in Tampermonkey instead of replacing it, and Tampermonkey
never pulls `main` down over the code being tested. Dev builds also write to
`dist/dev/`, which is untracked; only `npm run release` writes
`dist/illyriad-sov-scanner.user.js`, the file users are served.

```bash
npm test
```

Runs the scoring engine against the mechanics worked example, the optimiser, the
payload reader and capture, the grid, the CSV writer, the settings validators and
store, and the terrain descriptor table.

## Releasing

`main` is what users run. Tampermonkey polls the built file on `main` by raw URL,
so pushing to `main` is the deploy.

1. Branch, work, `npm run build`, test against the live client.
2. Merge to `main`.
3. Bump `version` in `package.json`.
4. `npm run release` — the same bundle, versioned from `package.json` with no
   `-dev` suffix, written to `dist/illyriad-sov-scanner.user.js`.
5. Commit that file along with the bump, and push.

Two rules keep this from going wrong. **Only ever commit the bundle on `main`** —
a generated 200KB file tracked on feature branches conflicts on every merge; the
`.gitignore` tracks exactly that one path and nothing else under `dist/`. And
**never change the released `@name` or `@namespace`** — Tampermonkey identifies an
installed script by that pair, so changing either makes every existing install a
different script that silently stops updating. The dev build's `(dev)` suffix is
that rule at work rather than an exception to it: it is deliberately a separate
identity.

Users do not update instantly. `raw.githubusercontent.com` caches for a few
minutes, and Tampermonkey's own update check runs roughly daily.

## Version scheme

`npm run build` produces `1.0.0-dev.202608202336` in `dist/dev/`; `npm run
release` produces `1.0.0` in `dist/`. Tampermonkey compares versions semver-style,
so a `-dev` build sorts *below* the released number — a local build never shadows
the shipped one on a machine that has both, while every rebuild still looks
distinct enough that Tampermonkey picks it up instead of silently running a stale
copy.

## Layout

| Path | Role |
|---|---|
| `src/constants.js` | Game constants, each marked with how well it is known — verified, sourced, derived or assumed. Also the terrain name table read from the game client, and the descriptor bonuses read by hand |
| `src/scoring.js` | Pure engine — the three ceilings, the food knapsack and frontier walk, then the military plan fitted into what they leave. No DOM. Imported by both the worker and the tests |
| `src/payload.js` | Payload reading and the candidacy filters |
| `src/capture.js` | Reads the client's live `window.mapData`. Reader only — no requests |
| `src/worker.js` | Web Worker entry; bundled to a string and inlined |
| `src/focus.js` | The Optimal Sovereignty calculator — one named tile, planned on the shared engine. No DOM |
| `src/panel.js` | Side panel UI — the three tabs, the gear menu and the CSV writer |
| `src/icons.js` | The app mark and the resource icons, as inline SVG and data URIs |
| `src/settings-store.js` | Saving and restoring the City Configuration; sanitizes anything it loads |
| `src/main.js` | Userscript entry; wires capture, panel and worker together |
| `build.mjs` | Two-pass esbuild: worker → string → main bundle |

The product spec and the game-mechanics notes are maintained outside this repo
and are not tracked here.

## Payload source

The client parks its current map view in `window.mapData`, replacing it whole on
every pan or zoom. `getLatestPayload` reads that global **live** on each Scan and
Optimise press, so a scan always sees what is on screen. This is a plain memory
read of data the client already fetched to draw the tiles — no network, no side
effects. It is the tool's only source: nothing patches or wraps the network.

To confirm the global on a live map, open the console and run:

```js
window.__sovScanner.probeInPageData()
```

It reports which globals hold a payload. If a client update ever hides
`window.mapData`, a Scan reports no payload rather than reading a stale one, and
`IN_PAGE_NAMES` in `src/capture.js` is where a renamed global would be added.

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free to use, modify and share for
any noncommercial purpose, and it covers the code in this repository only. The
icon art comes from the official Illyriad fansite kit; it, the game data and
the terrain names remain the intellectual property of Illyriad Games Limited,
whose [copyright notice](LICENSE#illyriad-content) applies wherever they
appear. This is an unofficial fan tool, not affiliated with or endorsed by
Illyriad Games Limited.
