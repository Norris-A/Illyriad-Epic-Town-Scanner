import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { CHANGELOG } from '../src/changelog.js';

// A version cannot be released without saying what changed in it.
test('the changelog has an entry for the package version', () => {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.ok(CHANGELOG.some((v) => v.version === version), `no changelog entry for ${version}`);
});
