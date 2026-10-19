// The offline service worker lists every current app file.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { swSource } from '../../scripts/gen-sw.mjs';

test('sw.js is up to date (run node scripts/gen-sw.mjs)', () => {
  assert.equal(fs.readFileSync(new URL('../../sw.js', import.meta.url), 'utf8'), swSource());
});
