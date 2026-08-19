// Persistence. Most of these are about the load path: a blob written by
// whatever build was installed last time has to load into the build installed
// now, including one whose fields have changed since.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  STORAGE_KEY,
  STORAGE_VERSION,
  sanitizeSettings,
  encodeSettings,
  decodeSettings,
  createSettingsStore,
  memoryStorage,
} from '../src/settings-store.js';
import { SETTINGS_FIELDS } from '../src/panel.js';
import { computeConsumption } from '../src/scoring.js';
import { DEFAULT_SETTINGS } from '../src/constants.js';

test('a round trip returns exactly what went in', () => {
  const s = sanitizeSettings({
    ...DEFAULT_SETTINGS,
    tMin: 62,
    plots: { wood: 3, clay: 3, iron: 3, stone: 3, food: 13 },
    cityConsumption: 27500,
    milsovStructure: 'joustingYard',
    milsovMinBonus: 40,
    resourceBoosters: { wood: true, clay: false, iron: true, stone: false },
    rpCalibration: { observedRpPerHour: 820, atTax: 30 },
  });
  assert.deepEqual(decodeSettings(encodeSettings(s)).settings, s);
});

test('the defaults survive a round trip untouched', () => {
  // If this drifts, every user gets silently re-defaulted on their next visit.
  assert.deepEqual(decodeSettings(encodeSettings(DEFAULT_SETTINGS)).settings,
    sanitizeSettings(DEFAULT_SETTINGS));
  assert.deepEqual(sanitizeSettings(DEFAULT_SETTINGS), DEFAULT_SETTINGS);
});

test('the envelope carries a version, so a future shape can be told apart', () => {
  const parsed = JSON.parse(encodeSettings(DEFAULT_SETTINGS));
  assert.equal(parsed.version, STORAGE_VERSION);
  assert.ok(parsed.settings, 'the settings live under their own key');
  assert.ok(Date.parse(parsed.savedAt), 'savedAt should be a real timestamp');
});

// --- the load path has to survive anything ---

test('nothing stored is a first run, not a recovery', () => {
  for (const empty of [null, undefined, '']) {
    const r = decodeSettings(empty);
    assert.equal(r.settings, null, 'nothing to restore');
    assert.equal(r.note, '', 'and nothing to say about it');
  }
});

test('an unreadable blob loads the defaults and says so', () => {
  for (const junk of ['{', 'null', '[]', '"a string"', '42']) {
    const r = decodeSettings(junk);
    assert.deepEqual(r.settings, DEFAULT_SETTINGS, `${junk} should fall back whole`);
    assert.match(r.note, /defaults restored/);
  }
});

test('a bare settings object loads, envelope or not', () => {
  const bare = JSON.stringify({ ...DEFAULT_SETTINGS, tMin: 71 });
  assert.equal(decodeSettings(bare).settings.tMin, 71);
});

test('settings added since the blob was written take their defaults', () => {
  // The build that wrote this had two of today's settings and one since dropped.
  const old = JSON.stringify({ tMin: 55, cityConsumption: 27500, legacyKnob: 9 });
  const { settings, note } = decodeSettings(old);

  assert.equal(settings.tMin, 55, 'what was stored is kept');
  assert.equal(settings.cityConsumption, 27500);
  assert.equal(settings.libraryLevel, DEFAULT_SETTINGS.libraryLevel, 'the rest defaults');
  assert.deepEqual(settings.plots, DEFAULT_SETTINGS.plots);
  assert.deepEqual(Object.keys(settings).sort(), Object.keys(DEFAULT_SETTINGS).sort(),
    'the output is built from the spec, so it is always complete');
  assert.ok(!('legacyKnob' in settings), 'a dropped setting must not reach the form');
  assert.match(note, /older build/);
});

test('a blob written by this exact build says nothing', () => {
  assert.equal(decodeSettings(encodeSettings(DEFAULT_SETTINGS)).note, '');
});

// --- every field type is re-validated, not trusted ---

test('a value that would be refused when typed is refused when restored', () => {
  const s = sanitizeSettings({
    tMin: 5000,                                        // out of range
    libraryLevel: 'twenty',                            // not a number
    cityCount: 2.6,                                    // not an integer
    flourMill: 'no',                                   // a truthy string
    cityConsumption: 'lots',                           // not a number
    geomancerRetreats: '3',                            // a numeric select
    plots: { wood: 9, clay: 9, iron: 9, stone: 9, food: 9 },   // sums to 45
    milsovStructure: 'farmstead',                      // not offered
    resourceBoosters: { wood: 1, nonsense: true },
    rpCalibration: { observedRpPerHour: 0, atTax: 25 },        // zero is "off"
  });

  assert.equal(s.tMin, 100, 'clamped, not taken as typed');
  assert.equal(s.libraryLevel, 20, 'unparseable falls back');
  assert.equal(s.cityCount, 3);
  assert.equal(s.flourMill, true);
  assert.equal(s.cityConsumption, DEFAULT_SETTINGS.cityConsumption, 'unparseable falls back');
  assert.equal(s.geomancerRetreats, 3, 'and a numeric select stays a number');
  assert.deepEqual(s.plots, DEFAULT_SETTINGS.plots, 'a bad allocation must not block the scan');
  assert.equal(s.milsovStructure, null);
  assert.deepEqual(s.resourceBoosters, { wood: true, clay: false, iron: false, stone: false });
  assert.equal(s.rpCalibration, null);
});

test('a select is checked against the options the build actually offers', () => {
  // A value no <select> contains shows as its first option instead, so the form
  // would disagree with what the scan runs.
  for (const f of SETTINGS_FIELDS.filter((x) => x.type === 'select')) {
    const s = sanitizeSettings({ [f.key]: '— gone —' });
    assert.ok(f.options.some((o) => String(o.value) === String(s[f.key])),
      `${f.key} restored to a value the picker does not offer`);
  }
});

test('the consumption a user typed is what the scan runs on', () => {
  // Nothing may sit between the field and computeConsumption: what the form
  // shows and what the scan scores have to be the same number.
  assert.equal(sanitizeSettings({ cityConsumption: 41000 }).cityConsumption, 41000);
  assert.equal(computeConsumption(sanitizeSettings({ cityConsumption: 41000 })), 41000);
  assert.equal(computeConsumption(sanitizeSettings({})), DEFAULT_SETTINGS.cityConsumption);
});

test('a hostile blob cannot inject anything into the settings', () => {
  const s = sanitizeSettings({
    __proto__: { polluted: true },
    plots: { wood: '5', clay: 5, iron: 5, stone: 3, food: 7, extra: 99 },
    somethingElse: () => {},
  });
  assert.ok(!('somethingElse' in s));
  assert.ok(!('extra' in s.plots), 'the allocation is rebuilt from PLOT_KEYS');
  assert.equal({}.polluted, undefined);
  for (const v of Object.values(s)) assert.notEqual(typeof v, 'function');
});

// --- the store around it ---

test('the store writes what it reads back', () => {
  const mem = memoryStorage();
  const store = createSettingsStore(mem);

  assert.equal(store.load().settings, null, 'nothing stored yet');
  assert.equal(store.save({ ...DEFAULT_SETTINGS, tMin: 44 }), '', 'a good write says nothing');
  assert.equal(store.load().settings.tMin, 44);
  assert.ok(mem.getItem(STORAGE_KEY), 'stored under the documented key');

  store.clear();
  assert.equal(store.load().settings, null);
});

test('a browser that refuses storage still hands back usable settings', () => {
  const store = createSettingsStore(null);
  const { settings, note } = store.load();
  assert.deepEqual(settings, DEFAULT_SETTINGS);
  assert.match(note, /this session only/);
  assert.equal(store.available, false);
  assert.equal(store.save(DEFAULT_SETTINGS), '', 'and saving is quietly a no-op');
});

test('a storage that throws is reported, never propagated', () => {
  const throwing = {
    getItem() { throw new Error('nope'); },
    setItem() { throw new Error('quota'); },
    removeItem() { throw new Error('nope'); },
  };
  const store = createSettingsStore(throwing);
  const { settings, note } = store.load();
  assert.deepEqual(settings, DEFAULT_SETTINGS);
  assert.match(note, /could not be read/);
  assert.match(store.save(DEFAULT_SETTINGS), /could not be saved/);
  store.clear();   // must not throw
});
