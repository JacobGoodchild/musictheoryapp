// Proves the reward pacing described in docs/economy.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../../src/state/economy-sim.js';
import { coinsForCorrect } from '../../src/state/rewards.js';

const runs = Array.from({ length: 30 }, (_, i) => simulate({ seed: i + 1, days: 120 }));
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

test('collecting everything takes roughly 6–8 weeks of regular study', () => {
  const days = runs.map((r) => r.allDoneDay);
  assert.ok(days.every((d) => d !== null), 'every simulated student finishes within 120 days');
  const m = median(days);
  assert.ok(m >= 42 && m <= 58, `median ${m} days`);
  assert.ok(Math.min(...days) >= 35, `fastest ${Math.min(...days)} days`);
});

test('something affordable in the first session, and plenty left after the first week', () => {
  for (const r of runs) {
    assert.equal(r.firstPurchaseDay, 1);
    const wk = r.timeline[6];
    assert.ok(wk.avatarLeft >= 25 && wk.stickersLeft >= 40, `after a week: ${JSON.stringify(wk)}`);
  }
});

test('roughly one purchase or more every session on average', () => {
  for (const r of runs) {
    const d14 = r.timeline[13];
    assert.ok(d14.purchases >= 12, `only ${d14.purchases} purchases in two weeks`);
  }
});

test('repeating the same question earns less and less, then nothing', () => {
  const q = { difficulty: 1 };
  const earned = [0, 1, 2, 3, 4].map((n) => coinsForCorrect(q, n));
  assert.ok(earned[0] > earned[1] && earned[1] >= earned[2]);
  assert.equal(earned[3], 0);
  assert.equal(earned[4], 0);
});
