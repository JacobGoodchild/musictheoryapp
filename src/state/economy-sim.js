// Simulates a typical study routine to check the reward pacing (used by the
// economy test and quoted in docs/economy.md). Pure, deterministic.
import { ECONOMY, streakBonus, mockReward, coinsForCorrect } from './rewards.js';
import { ITEMS } from '../art/avatar.js';
import { STICKERS, RARITIES, openBag } from './stickers.js';
import { rng } from '../questions/util.js';

/**
 * A "regular" student: practises most days (6 days in 7), ~35 questions a
 * session at ~70% correct, one lesson most days until all 33 are done, the
 * daily challenge, ~10 flashcards, and a mock every 5 days (about 10 in 7 weeks).
 * Spending: buy the cheapest avatar item they can afford, alternating with bags.
 */
export function simulate({ days = 70, seed = 1, sessionsPerWeek = 6 } = {}) {
  const r = rng(seed);
  const avatarLeft = ITEMS.filter((i) => i.price > 0).sort((a, b) => a.price - b.price);
  const st = { owned: {}, bagsOpened: 0, sinceEpic: 0, seed };
  let coins = 0, notes = 0, lessonsDone = 0, mocks = 0, streak = 0, best = null;
  const timeline = [];
  let firstPurchaseDay = null, allDoneDay = null, purchases = 0;
  const seen = new Map();
  let qid = 0;
  for (let day = 1; day <= days; day++) {
    const studies = (day % 7) < sessionsPerWeek;
    if (!studies) { streak = 0; timeline.push({ day, coins }); continue; }
    streak++;
    coins += streakBonus(streak);
    // Questions: mostly new ones, some repeats (repeats earn less).
    for (let i = 0; i < 35; i++) {
      const id = r.chance(0.75) ? `q${qid++}` : `q${r.int(0, Math.max(0, qid - 1))}`;
      const diff = r.weighted([[1, 1], [2, 2], [3, 1]]);
      if (r.chance(0.7)) { const before = seen.get(id) || 0; coins += coinsForCorrect({ difficulty: diff }, before); seen.set(id, before + 1); }
    }
    if (lessonsDone < 33 && r.chance(0.8)) { lessonsDone++; coins += ECONOMY.lessonComplete + (r.chance(0.5) ? ECONOMY.lessonPerfect : 0); }
    coins += ECONOMY.dailyChallenge + (r.chance(0.3) ? ECONOMY.dailyChallengePerfect : 0);
    coins += 8; // flashcards
    coins += r.int(0, 3) * ECONOMY.mistakeCleared;
    if (day % 5 === 0) {
      mocks++;
      const score = Math.min(75, 45 + mocks * 2.5 + r.int(-4, 4));
      const band = score >= 65 ? 'Distinction' : score >= 60 ? 'Merit' : score >= 50 ? 'Pass' : 'none';
      coins += mockReward(score, band, best);
      best = Math.max(best ?? 0, score);
    }
    // Spend: alternate between the cheapest avatar item and a bag (or a swap).
    let bought = true;
    while (bought) {
      bought = false;
      const missing = STICKERS.filter((s) => !st.owned[s.id]);
      const swappable = missing.find((s) => RARITIES.find((x) => x.id === s.rarity).swapCost <= notes);
      if (swappable) { notes -= RARITIES.find((x) => x.id === swappable.rarity).swapCost; st.owned[swappable.id] = 1; bought = true; purchases++; continue; }
      const preferBag = purchases % 2 === 1 || !avatarLeft.length;
      if (preferBag && missing.length && coins >= ECONOMY.bagCost) { coins -= ECONOMY.bagCost; notes += openBag(st).notes; bought = true; purchases++; }
      else if (avatarLeft.length && coins >= avatarLeft[0].price) { coins -= avatarLeft.shift().price; bought = true; purchases++; }
      else if (missing.length && coins >= ECONOMY.bagCost) { coins -= ECONOMY.bagCost; notes += openBag(st).notes; bought = true; purchases++; }
      if (bought && firstPurchaseDay === null) firstPurchaseDay = day;
    }
    const stickersLeft = STICKERS.filter((s) => !st.owned[s.id]).length;
    timeline.push({ day, coins, avatarLeft: avatarLeft.length, stickersLeft, purchases });
    if (allDoneDay === null && !avatarLeft.length && !stickersLeft) allDoneDay = day;
  }
  return { allDoneDay, firstPurchaseDay, timeline, mocks, lessonsDone, bags: st.bagsOpened };
}
