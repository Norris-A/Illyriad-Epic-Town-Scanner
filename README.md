# Illyriad Sovereignty Site Scanner

A Tampermonkey userscript for planning sovereignty. It has two modes over one
engine and one shared configuration:

- **Scan** ranks every visible world-map tile by the maximum sustainable tax rate.
- **Optimal Sovereignty** points the same engine at a single tile you name, so you
  can plan one site or examine one you are interested in closely.

Product spec: [illyriad-sov-scanner-PRD.md](illyriad-sov-scanner-PRD.md).
Game formulas and payload structure: [illyriad-game-mechanics.md](illyriad-game-mechanics.md).

**The script makes zero network requests.** It observes map payloads the game has
already received and analyses them locally, on an explicit Scan press only. See
PRD §1.2 — those rules are enforced by design, not convention.

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

Produces `dist/illyriad-sov-scanner.user.js`. Install it in Tampermonkey either
by opening that file's URL in the browser, or by pasting its contents into the
Tampermonkey editor.

```bash
npm test
```

Runs the scoring engine against the PRD §6 worked example, plus the CSV writer,
the settings-form validators and the terrain descriptor table.

## Layout

| Path | Role |
|---|---|
| `src/constants.js` | Game constants, each traced to a mechanics §; confidence markers preserved. Also the terrain name table read from the game client, and the descriptor bonuses read by hand |
| `src/scoring.js` | Pure engine — the three ceilings, the food knapsack and frontier walk, then the military plan fitted into what they leave. No DOM. Imported by both the worker and the tests |
| `src/payload.js` | Payload reading and the §3.2/§3.3 filters |
| `src/capture.js` | Passive payload observation. Reader only — no requests |
| `src/worker.js` | Web Worker entry; bundled to a string and inlined |
| `src/focus.js` | The Optimal Sovereignty calculator — one named tile, planned on the shared engine. No DOM |
| `src/panel.js` | Side panel UI (§5), the §4 City Configuration form, the optimiser form, and the CSV writer |
| `src/settings-store.js` | Saving and restoring the City Configuration; sanitizes anything it loads |
| `src/main.js` | Userscript entry; wires the three together |
| `build.mjs` | Two-pass esbuild: worker → string → main bundle |

## Optimal Sovereignty

The Scan tab answers "which of these tiles is best". The Optimal Sovereignty tab
answers "what would I actually build on *this* one" — the same engine, pointed at
a tile you name. It takes four inputs and nothing else:

| Input | Default |
|---|---|
| Coordinates, `x` and `y` | — |
| Sovereignty radius | blank, which follows `R_claim` from City Configuration |
| Starting tax | 60%, then dragged on the same slider the results rows carry |
| Use City Configuration plots | off — the centre tile is planned on its **own** resource ratings |

Everything else comes from City Configuration, so there is never a second place
to set one thing.

Two behaviours are deliberate. The **candidacy filters do not apply**: a tile that
is already settled, already claimed, or too close to a town can still be
examined, and the result says which of those it is. And a **radius reaching past
the last observed payload refuses to plan** rather than planning around tiles that
merely have not arrived — the same rule the scan applies, except it tells you how
many tiles are missing so you know how far to pan.

The optimiser runs on the main thread rather than in the worker. It is one site,
and the tax slider already runs the same planner there.

## City Configuration

The configuration form saves itself to the browser's `localStorage` as you edit
it, under the game's own origin, and restores on the next visit. Nothing else is
stored and nothing leaves the machine. "Reset to defaults" clears it back.

A stored blob is never trusted on the way back in. `sanitizeSettings` rebuilds
the object from `SETTINGS_FIELDS`, running every value through the validator the
form uses: unknown keys are dropped, settings added since take their defaults,
and anything unusable falls back. So a blob from an older build always loads —
the panel says when something drifted — and a corrupt one cannot brick the tool.

## How a site is scored

**Food first, alone.** It is the only claim that gives the city anything back,
and the tax it can sustain is the site's answer (PRD §3.4–§3.5).

**Military sovereignty then takes what is left over** — the research the food
plan did not spend, the tiles it did not claim, the building slots it did not
use, and what the city can still afford to run. It never costs the site a point
of tax, so the military column never moves the ranking. You pick the structure;
the tool works out how many, at what levels, and on which squares.

That last part is a real trade rather than a rule of thumb. Research cost per
point of bonus is `2 × distance` at *any* level, so research wants the plan
concentrated on near tiles — while the hourly upkeep table is convex
(150/300/600/1,200/2,400), so upkeep wants it spread over many low-level
buildings. Which wins depends on the site, and each site says what it chose and
what one more point of tax would have bought (§3.6).

## Terrain descriptors

Most tiles grant a small production bonus — 1–3% of one product, per level of a
named building. It is **not scored**: the products are outside what the tool
models. It shows on the tile itself as `+3% Bows`, with the full sentence in the
hover text.

Every building a descriptor names is a **Production Structure** — the thirteen
crafting ones as much as the five military — so a descriptor is advice about
what a tile is *for*, not a caveat about something the city might lack. The
product is written out rather than drawn because the icon set cannot separate
the rungs: Bowyer makes Bows and Target Range makes Ranged Units, and there is
one bow icon.

Names come from the game itself. `window.terrain` on the map page is the
client's own 229-entry `i` → terrain lookup, copied verbatim into
`TERRAIN_NAMES`, and a test checks every hand-written name against it. Bonuses
are not in it, so those are read off tiles one at a time.

Four things the table distinguishes, because they are different answers and a
blank would collapse them:

- a terrain that grants something, which names it;
- a terrain known to grant **nothing** — `Plains`, `Drumlin` — which says so;
- a terrain whose bonus **nobody has read yet**, which says *that*;
- an `i` past the end of the client's table, which means the captured table is
  stale rather than the reading behind.

A `(building, bonus)` rung is **not** unique to one terrain — several terrains
can hold the same one, and some rungs are held by none. `sharedRungs` lists the
duplicates and a test pins that list, so a new one shows up when a row is added:
an unexpected duplicate is what a transcription error looks like. See mechanics
§2.

188 of the 229 named terrains have had their bonus read, which is every terrain
the world data file contains. The 41 left are named by the client but appear
nowhere in the world, so there is no tile to stand on and read; they are unread,
not missing. New rows go in by hand as tiles are read.

## Status

The engine implements §3.4–§3.6, and the panel carries the full §4 settings
form. Capture and the panel have been exercised against the live client — a
scan returns a ranked table — but only the pure functions have automated tests.

Known gaps, all deliberate:

- **`LIBRARY_BASE_RP_L20` is a placeholder** chosen to reproduce the §6 example
  (mechanics open item 2). Use the RP calibration override for real figures.
- **Resource sovereignty is not placed.** Logging Camp, Earthworks, Mineshaft
  and Gravel Pit are costed correctly wherever they appear but are absent from
  the picker. They pay their claim's RP and gold like any other claim, exactly as
  a Farmstead or Fishery does — what they do not pay is the hourly
  wood/clay/iron/stone bill a military structure carries. With no hourly bill to
  limit it, nothing would stop the planner claiming every spare tile with one,
  and the host tile's resource rating that would justify doing so is not scored.
- **The crafting Production Structures are not offered.** All thirteen are in
  `SOV_STRUCTURES` and cost correctly, because the terrain descriptors name them
  and a plan carrying one must be billed — but the picker offers the five
  military structures, since the question it asks is which unit the city is
  being built to make, and eighteen entries made it a catalogue.
- **The panel has no automated test of its DOM.** `createPanel` cannot run under
  Node, so the field specs, the validators and both markup contracts are tested
  but the event wiring, the tabs, gating and Prefill are not. Adding jsdom would
  close it.

- **The optimiser's own four inputs are not persisted.** City Configuration is;
  the tile, radius, tax and plot override reset to their defaults each visit,
  since they describe one question rather than a standing setup.

## First task

PRD §1.2 asks whether the client already exposes parsed map data before any
interceptor is written. Load a map, open the console, and run:

```js
window.__sovScanner.probeInPageData()
```

If that returns hits, `src/capture.js` can drop the XHR/fetch patching entirely.
