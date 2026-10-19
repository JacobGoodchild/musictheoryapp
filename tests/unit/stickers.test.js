// Blind bags: odds match what is shown, pity rule holds, duplicates give notes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STICKERS, RARITIES, PITY, openBag, collectionStats } from '../../src/state/stickers.js';

test('about 60 stickers, unique ids, every rarity present, shown odds add to 100', () => {
  assert.ok(STICKERS.length >= 55 && STICKERS.length <= 70);
  assert.equal(new Set(STICKERS.map((s) => s.id)).size, STICKERS.length);
  for (const r of RARITIES) assert.ok(STICKERS.some((s) => s.rarity === r.id), r.id);
  assert.equal(RARITIES.reduce((a, r) => a + r.odds, 0), 100);
  assert.equal(STICKERS.filter((s) => s.rarity === 'mythic').length, 3);
  assert.equal(STICKERS.find((s) => s.id === 'golden-teapot').rarity, 'mythic');
});

test('real odds over many openings match the shown odds (pity included)', () => {
  const N = 200000;
  const counts = Object.fromEntries(RARITIES.map((r) => [r.id, 0]));
  const st = { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 7 };
  let maxGap = 0, gap = 0;
  for (let i = 0; i < N; i++) {
    const res = openBag(st);
    counts[res.rarity]++;
    gap = ['epic', 'legendary', 'mythic'].includes(res.rarity) ? 0 : gap + 1;
    maxGap = Math.max(maxGap, gap);
  }
  assert.ok(maxGap <= PITY - 1, `went ${maxGap} bags without Epic+`);
  // Pity nudges Epic+ up slightly; everything stays within 2 percentage points of the shown odds.
  for (const r of RARITIES) {
    const pct = (counts[r.id] / N) * 100;
    assert.ok(Math.abs(pct - r.odds) < 2, `${r.id}: ${pct.toFixed(2)}% vs ${r.odds}%`);
  }
});

test('duplicates turn into notes; collection stats count correctly', () => {
  const st = { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 1 };
  let notes = 0;
  for (let i = 0; i < 300; i++) notes += openBag(st).notes;
  const dupes = Object.values(st.owned).reduce((a, c) => a + c - 1, 0);
  assert.ok(dupes > 0 && notes > 0);
  const stats = collectionStats(st.owned);
  assert.equal(stats.have, Object.keys(st.owned).length);
  assert.equal(stats.total, STICKERS.length);
});

test('bags are deterministic for a given seed', () => {
  const a = { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 42 };
  const b = { owned: {}, bagsOpened: 0, sinceEpic: 0, seed: 42 };
  for (let i = 0; i < 50; i++) assert.equal(openBag(a).sticker.id, openBag(b).sticker.id);
});
