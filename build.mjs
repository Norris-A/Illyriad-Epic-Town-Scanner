// Two-pass build: the worker is bundled to a string and inlined into the main
// bundle, since Tampermonkey ships one file. Never minified, so the shipped
// script stays readable to anyone auditing it.

import { build, context } from 'esbuild';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { APP_ICON_SVG } from './src/app-icons.js';

// A dev build's version carries a minute stamp as a prerelease, so Tampermonkey
// sees every rebuild as new, and it sorts below the released version.
const RELEASE = process.argv.includes('--release');
const { version: PKG_VERSION } = JSON.parse(readFileSync('package.json', 'utf8'));

const d = new Date();
const p = (n) => String(n).padStart(2, '0');
const STAMP = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
  + `${p(d.getHours())}${p(d.getMinutes())}`;

export const VERSION = RELEASE ? PKG_VERSION : `${PKG_VERSION}-dev.${STAMP}`;

// Only the release file is tracked and served to users.
const OUT = RELEASE
  ? 'dist/illyriad-sov-scanner.user.js'
  : 'dist/dev/illyriad-sov-scanner.user.js';

// Tampermonkey polls this for updates, so pushing the release file to main ships it.
const RAW = 'https://raw.githubusercontent.com/Norris-A/Illyriad-Epic-Town-Scanner/main'
  + '/dist/illyriad-sov-scanner.user.js';

// Base64, so nothing in the SVG needs escaping inside the banner comment.
const ICON = 'data:image/svg+xml;base64,'
  + Buffer.from(APP_ICON_SVG).toString('base64');

// A dev build installs under its own name and without update URLs, so it sits
// beside the released copy and is never updated over.
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
  // The worker is bundled once, so changes to it or its imports need a restart.
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
