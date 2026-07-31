// Two-pass build: bundle the worker to a string, then inline it into the main
// bundle via `define`. Tampermonkey delivers one file and a Worker needs a URL,
// so the worker source has to travel inside the script as a string literal.
//
// Bundled, never minified — Greasy Fork and readers both want source legible.

import { build, context } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'dist/illyriad-sov-scanner.user.js';

const BANNER = `// ==UserScript==
// @name         Illyriad Sovereignty Site Scanner
// @namespace    https://github.com/illyriad-sov-scanner
// @version      0.1.0
// @description  Ranks visible world-map tiles by the maximum sustainable tax rate.
// @author       Norris Alrichani
// @match        https://elgea.illyriad.co.uk/*
// @match        https://illyriad.co.uk/*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

// This script makes ZERO network requests. It observes map payloads the game
// has already received on the user's behalf, and analyses them locally.
// See illyriad-sov-scanner-PRD.md §1.2.
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
    define: { __WORKER_SOURCE__: JSON.stringify(workerSource) },
    logLevel: 'info',
  };
}

mkdirSync('dist', { recursive: true });

if (process.argv.includes('--watch')) {
  // The worker is re-bundled on each rebuild by re-entering makeConfig, so watch
  // mode restarts the context when worker sources change.
  const ctx = await context(await makeConfig());
  await ctx.watch();
  console.log(`watching -> ${OUT}`);
  console.log('note: edits to src/worker.js or its imports need a restart of watch');
} else {
  await build(await makeConfig());
  console.log(`built -> ${OUT}`);
}
