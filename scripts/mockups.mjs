// Renders the README's pictures of the panel into docs/images/: bundles
// scripts/mockup-page.js, opens it in headless Chrome or Edge, and captures each
// of its window.mockups over the DevTools Protocol.

import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import {
  existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync,
} from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = 'docs/images';
const BROWSERS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);

const browser = BROWSERS.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

async function bundle(entry, define = {}) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    write: false,
    logLevel: 'warning',
    define,
  });
  return result.outputFiles[0].text;
}

/**
 * Deletes a run's folder if the browser has let go of its profile. Edge can hold
 * it for half a minute after closing, so a folder still in use is left for the
 * next run to clear.
 */
async function removeRunDir(path, retries = 0) {
  try {
    await rm(path, { recursive: true, force: true, maxRetries: retries, retryDelay: 200 });
  } catch {
    // Still in use.
  }
}

for (const old of readdirSync(tmpdir()).filter((n) => n.startsWith('sov-mockups-'))) {
  await removeRunDir(join(tmpdir(), old));
}
const dir = mkdtempSync(join(tmpdir(), 'sov-mockups-'));
writeFileSync(join(dir, 'page.js'), await bundle('scripts/mockup-page.js', {
  __WORKER_SOURCE__: JSON.stringify(await bundle('src/worker.js')),
  __BUILD_VERSION__: JSON.stringify(version),
}));
writeFileSync(join(dir, 'page.html'),
  '<!doctype html><meta charset="utf-8"><body style="margin:0"><script src="page.js"></script>');
// The World Map route, or the panel folds itself away.
const pageUrl = `${pathToFileURL(join(dir, 'page.html')).href}#/World/Map`;

const profile = join(dir, 'profile');
const proc = spawn(browser, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--no-first-run', 'about:blank',
]);

let ws;
try {
  // The browser writes the port it chose, and its endpoint, here once it is listening.
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  if (!existsSync(portFile)) throw new Error(`${browser} did not start`);
  const [port, endpoint] = readFileSync(portFile, 'utf8').split('\n');
  ws = new WebSocket(`ws://127.0.0.1:${port}${endpoint}`);
  await new Promise((r, reject) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', () => reject(new Error('could not connect to the browser')));
  });

  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', ({ data }) => {
    const msg = JSON.parse(data);
    pending.get(msg.id)?.(msg);
    pending.delete(msg.id);
  });
  const send = (method, params = {}, sessionId) => new Promise((r, reject) => {
    pending.set(++id, (msg) => (msg.error ? reject(new Error(msg.error.message)) : r(msg.result)));
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const { targetInfos } = await send('Target.getTargets');
  const { sessionId } = await send('Target.attachToTarget',
    { targetId: targetInfos.find((t) => t.type === 'page').targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);

  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await page('Runtime.evaluate',
      { expression, awaitPromise: true, returnByValue: true });
    if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
    return result.value;
  };
  // Each picture loads the page afresh, so none inherits another's state.
  const load = async () => {
    await page('Page.navigate', { url: pageUrl });
    for (let i = 0; i < 100; i++) {
      if (await evaluate('!!window.mockups').catch(() => false)) return;
      await sleep(100);
    }
    throw new Error('the mockup page did not load');
  };

  // Tall enough that no picture scrolls; twice the pixels, for sharp text.
  await page('Emulation.setDeviceMetricsOverride',
    { width: 640, height: 2600, deviceScaleFactor: 2, mobile: false });
  await load();
  const names = await evaluate('Object.keys(window.mockups)');
  mkdirSync(OUT, { recursive: true });
  for (const name of names) {
    await load();
    const clip = await evaluate(`window.mockups[${JSON.stringify(name)}]()`);
    // Lets the icons, which are data URIs, finish decoding.
    await sleep(300);
    const { data } = await page('Page.captureScreenshot',
      { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: true });
    writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
    console.log(`${OUT}/${name}.png`);
  }
} finally {
  // Edge's msedge.exe is a launcher that hands off to the real browser and exits,
  // so only the protocol can close it.
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: 0, method: 'Browser.close' }));
    ws.close();
  } else {
    proc.kill();
  }
  await removeRunDir(dir, 10);
}
