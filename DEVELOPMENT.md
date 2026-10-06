# Development

How to build, test and release the Illyriad Sovereignty Site Scanner. For what
the script does and how to use it, see the [README](README.md).

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
payload reader and capture, the grid, the map markers' geometry, the CSV writer,
the settings validators and store, and the terrain descriptor table.

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
| `src/capture.js` | Reads the client's live `window.mapData`, cut to the tiles on screen. Reader only — no requests |
| `src/worker.js` | Web Worker entry; bundled to a string and inlined |
| `src/focus.js` | The Optimal Sovereignty calculator — one named tile, planned on the shared engine. No DOM |
| `src/panel.js` | Side panel UI — the three tabs, the gear menu and the CSV writer |
| `src/overlay.js` | What the panel draws on the game's World Map — Site Search's numbered top ten and selected row, and the optimiser's plan — and the clicks on it that open a row or pick a tile to plan. The geometry is DOM-free and tested |
| `src/icons.js` | The app mark, the game's resource icons as data URIs, and the panel's line glyphs as inline SVG |
| `src/settings-store.js` | Saving and restoring the City Configuration; sanitizes anything it loads |
| `src/main.js` | Userscript entry; wires capture, the panel, the overlay, the settings store and the worker together |
| `build.mjs` | Two-pass esbuild: worker → string → main bundle |

The product spec and the game-mechanics notes are maintained outside this repo
and are not tracked here.

## Payload source

The client keeps its map data in `window.mapData`. It is cumulative: each pan
and zoom is merged in, so its tiles cover every view since the World Map was
entered, while its `x`, `y` and `zoom` describe the view on screen now — centred
on `x|y`, reaching `zoom` tiles out on every side. `getLatestPayload` reads that
global **live** on each Scan and Optimise press and keeps only the tiles within
that square, so a scan ranks exactly what is on screen and nothing panned past
earlier. The towns and claims the global carries are kept whole: they only ever
rule a site out, so one just past the edge still keeps its distance.

This is a plain memory read of data the client already fetched to draw the
tiles — no network, no side effects. It is the tool's only source: nothing
patches or wraps the network.

To confirm the global on a live map, open the console and run:

```js
window.__sovScanner.probeInPageData()
```

It reports which globals hold a payload. If a client update ever hides
`window.mapData`, or stops giving it an `x`, `y` and `zoom` to say where the
screen is, a Scan reports no payload rather than reading a stale one or guessing
at the view. `IN_PAGE_NAMES` in `src/capture.js` is where a renamed global would
be added.
