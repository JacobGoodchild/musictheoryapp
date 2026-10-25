// Coin economy. All numbers live here and in docs/economy.md; the pacing is
// proven by tests/unit/economy.test.js.

export const ECONOMY = {
  correct: { 1: 8, 2: 10, 3: 12 },    // coins per correct answer by difficulty
  goodTry: 2,                         // a first try at a new question earns a little even if wrong
  repeatDecay: 0.5,                   // each repeat of the same question earns half
  repeatFloor: 3,                     // after 3 correct repeats a question earns nothing
  lessonComplete: 60,
  lessonPerfect: 25,
  mockBase: 100,
  mockBand: { Pass: 60, Merit: 120, Distinction: 200 },
  mockPersonalBest: 80,
  streakPerDay: 20,                   // × streak length, capped
  streakCap: 7,
  mistakeCleared: 12,
  dailyChallenge: 80,
  dailyChallengePerfect: 40,
  bagCost: 60,
  bagBundle: { count: 3, price: 120 }, // '3 for 2' offer
};

/** Coins for a correct answer, with diminishing returns for repeats. */
export function coinsForCorrect(q, timesCorrectBefore = 0) {
  const base = ECONOMY.correct[q.difficulty || 2] || 3;
  if (timesCorrectBefore >= ECONOMY.repeatFloor) return 0;
  return Math.max(0, Math.round(base * Math.pow(ECONOMY.repeatDecay, timesCorrectBefore)));
}

export function addCoins(s, amount, reason = 'other') {
  if (!amount) return 0;
  s.coins += amount;
  s.totalCoinsEarned = (s.totalCoinsEarned || 0) + amount;
  s.coinLog[reason] = (s.coinLog[reason] || 0) + amount;
  return amount;
}

export function spendCoins(s, amount) {
  if (s.coins < amount) return false;
  s.coins -= amount;
  return true;
}

export function streakBonus(streakCount) {
  return ECONOMY.streakPerDay * Math.min(streakCount, ECONOMY.streakCap);
}

export function mockReward(score, band, previousBest) {
  let c = ECONOMY.mockBase + (ECONOMY.mockBand[band] || 0);
  if (previousBest !== null && previousBest !== undefined && score > previousBest) c += ECONOMY.mockPersonalBest;
  return c;
}
