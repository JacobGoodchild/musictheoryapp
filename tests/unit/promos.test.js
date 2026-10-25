import test from 'node:test';
import assert from 'node:assert/strict';
import { redeemPromo, codeHash, PROMOS } from '../../src/state/promos.js';
import { freshSave } from '../../src/state/save.js';

test('the launch code gives 100 coins and 100 notes, once only, any letter case', () => {
  const s = freshSave();
  assert.equal(redeemPromo(s, 'nope').ok, false);
  const r = redeemPromo(s, ' snerd ');
  assert.equal(r.ok, true);
  assert.equal(s.coins, 100);
  assert.equal(s.dupeNotes, 100);
  assert.equal(redeemPromo(s, 'SNERD').ok, false, 'second use is refused');
  assert.equal(s.coins, 100);
});

test('codes are stored only as hashes', () => {
  for (const p of PROMOS) assert.ok(!/SNERD/i.test(JSON.stringify(p)));
  assert.equal(codeHash('snerd'), PROMOS[0].hash);
});
