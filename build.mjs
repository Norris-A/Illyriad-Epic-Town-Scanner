// Two-pass build: bundle the worker to a string, then inline it into the main
// bundle via `define`. Tampermonkey delivers one file and a Worker needs a URL,
// so the worker source has to travel inside the script as a string literal.
//
// Bundled, never minified — the shipped file is the one anyone auditing this
// reads, and a userscript asking for map access should be legible.

import { build, context } from 'esbuild';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { APP_ICON_SVG } from './src/icons.js';

// Two version shapes, because two audiences read them. A release build carries
// the plain package.json number and is what users see in Tampermonkey. A dev
// build appends a minute-resolution stamp as a prerelease, so every rebuild
// looks different to Tampermonkey — which otherwise keeps its installed copy
// and silently runs stale code — and so a `-dev` build always sorts BELOW the
// released number rather than shadowing it on a machine that has both.
const RELEASE = process.argv.includes('--release');
const { version: PKG_VERSION } = JSON.parse(readFileSync('package.json', 'utf8'));

const d = new Date();
const p = (n) => String(n).padStart(2, '0');
const STAMP = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
  + `${p(d.getHours())}${p(d.getMinutes())}`;

export const VERSION = RELEASE ? PKG_VERSION : `${PKG_VERSION}-dev.${STAMP}`;

// Dev and release builds never share a file. Only the release path is tracked
// by git and served to users, so rebuilding while you work cannot overwrite the
// bundle waiting to ship — the two are only ever brought together by choosing
// to run `--release`.
const OUT = RELEASE
  ? 'dist/illyriad-sov-scanner.user.js'
  : 'dist/dev/illyriad-sov-scanner.user.js';

// Where Tampermonkey looks for updates. It polls @updateURL on its own schedule,
// compares @version, and pulls @downloadURL when the number went up — so merging
// to main and committing the rebuilt file is the whole release mechanism.
const RAW = 'https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main'
  + '/dist/illyriad-sov-scanner.user.js';

// The panel's crown, reused for Tampermonkey's dashboard and install icon so the
// two are the same mark. A data URI carries it inside the one shipped file;
// base64 so no character in the SVG needs escaping in the banner comment.
const ICON = 'data:image/svg+xml;base64,'
  + Buffer.from(APP_ICON_SVG).toString('base64');

// A dev build installs under its own name, so it sits beside the released copy
// in Tampermonkey rather than replacing it, and carries no update URLs — the
// released file on main must never be pulled down over the code being tested.
const NAME = RELEASE
  ? 'Illyriad Sovereignty Site Scanner'
  : 'Illyriad Sovereignty Site Scanner (dev)';
const UPDATE_LINES = RELEASE
  ? `// @downloadURL  ${RAW}\n// @updateURL    ${RAW}\n`
  : '';

const BANNER = `// ==UserScript==
// @name         ${NAME}
// @namespace    https://github.com/Norris-A
// @version      ${VERSION}
// @description  Ranks visible world-map tiles by the maximum sustainable tax rate.
// @author       Norris A. (Firebolty)
// @icon         ${ICON}
${UPDATE_LINES}// @supportURL   https://github.com/Norris-A/Illyriad-Epic-Town-Scanner/issues
// @match        https://elgea.illyriad.co.uk/*
// @match        https://illyriad.co.uk/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

// This script makes ZERO network requests. It observes map payloads the game
// has already received on the user's behalf, and analyses them locally.
`;

async function bundleWorker() {
  const result = await build({
    entryPoints: ['src/worker.js'],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    logLevel: 'warning',
  });
  return result.outputFiles[0].text;
}

async function makeConfig() {
  const workerSource = await bundleWorker();
  return {
    entryPoints: ['src/main.js'],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    outfile: OUT,
    banner: { js: BANNER },
    define: {
      __WORKER_SOURCE__: JSON.stringify(workerSource),
      __BUILD_VERSION__: JSON.stringify(VERSION),
    },
    logLevel: 'info',
  };
}

mkdirSync(dirname(OUT), { recursive: true });

if (process.argv.includes('--watch')) {
  // The worker is re-bundled on each rebuild by re-entering makeConfig, so watch
  // mode restarts the context when worker sources change.
  const ctx = await context(await makeConfig());
  await ctx.watch();
  console.log(`watching -> ${OUT}`);
  console.log('note: edits to src/worker.js or its imports need a restart of watch');
} else {
  await build(await makeConfig());
  console.log(`built -> ${OUT}  (version ${VERSION})`);
  console.log(RELEASE
    ? 'release build — commit it on main and push to ship it'
    : 'dev build — reinstall in Tampermonkey to pick it up; the release bundle is untouched');
}
