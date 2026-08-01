# Illyriad Sovereignty Site Scanner

A Tampermonkey userscript that ranks visible world-map tiles by the maximum
sustainable tax rate. Product spec: [illyriad-sov-scanner-PRD.md](illyriad-sov-scanner-PRD.md).
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

Runs the scoring engine against the PRD §6 worked example, plus the CSV writer
and the settings-form validators.

## Layout

| Path | Role |
|---|---|
| `src/constants.js` | Game constants, each traced to a mechanics §; confidence markers preserved |
| `src/scoring.js` | Pure engine — the three ceilings, knapsack, frontier walk. No DOM. Imported by both the worker and the tests |
| `src/payload.js` | Payload reading and the §3.2/§3.3 filters |
| `src/capture.js` | Passive payload observation. Reader only — no requests |
| `src/worker.js` | Web Worker entry; bundled to a string and inlined |
| `src/panel.js` | Side panel UI (§5), the §4 settings form, and the CSV writer |
| `src/main.js` | Userscript entry; wires the three together |
| `build.mjs` | Two-pass esbuild: worker → string → main bundle |

## Status

The engine implements §3.4–§3.6, and the panel carries the full §4 settings
form. Capture and the panel have been exercised against the live client — a
scan returns a ranked table — but only the pure functions have automated tests.

Known gaps, all deliberate:

- **`LIBRARY_BASE_RP_L20` is a placeholder** chosen to reproduce the §6 example
  (mechanics open item 2). Use the RP calibration override for real figures.
- **`T_res` is indicative only** — per-plot yields for wood/clay/iron/stone are
  unmeasured (mechanics open item 12). Flagged in the UI. Food-only scans are
  unaffected.
- **The settings form has no automated test of its DOM.** `createPanel` cannot
  run under Node, so the field spec, the validators and the markup contract are
  tested but the event wiring, gating and Prefill are not. Adding jsdom would
  close it.

## First task

PRD §1.2 asks whether the client already exposes parsed map data before any
interceptor is written. Load a map, open the console, and run:

```js
window.__sovScanner.probeInPageData()
```

If that returns hits, `src/capture.js` can drop the XHR/fetch patching entirely.
