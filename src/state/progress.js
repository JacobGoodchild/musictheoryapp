// Progress bookkeeping: streaks, topic stats, lessons, mistakes.

export function dayKey(d = new Date()) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function daysBetween(a, b) {
  const pa = new Date(a + 'T12:00:00'), pb = new Date(b + 'T12:00:00');
  return Math.round((pb - pa) / 86400000);
}

/** Called once per visit. Keeps the daily streak. Returns nothing. */
export function touchStreak(s, today = dayKey()) {
  const last = s.streak.lastDay;
  if (last === today) return;
  if (last && daysBetween(last, today) === 1) s.streak.count += 1;
  else s.streak.count = 1;
  s.streak.best = Math.max(s.streak.best || 0, s.streak.count);
  s.streak.lastDay = today;
  s.streak.pendingBonus = true;
}

import { coinsForCorrect, addCoins, ECONOMY } from './rewards.js';

/**
 * Record an answered question. Updates topic stats, the mistakes list and
 * coins. Returns the coins earned. `context` = 'practice' | 'mistakes' | 'mock' | 'lesson' | 'daily'.
 */
export function recordAnswer(s, q, result, context = 'practice') {
  const t = (s.topics[q.topic] = s.topics[q.topic] || { seen: 0, correct: 0, recent: [] });
  t.seen += 1;
  if (result.correct) t.correct += 1;
  t.recent = [...t.recent, result.correct ? 1 : 0].slice(-12);
  t.last = Date.now();
  const seen = (s.qSeen[q.id] = s.qSeen[q.id] || { n: 0, c: 0 });
  const before = seen.c;
  seen.n += 1;
  let coins = 0;
  if (result.correct) {
    seen.c += 1;
    if (context !== 'mock') coins += addCoins(s, coinsForCorrect(q, before), 'answers');
    if (s.mistakes[q.id] && (context === 'mistakes' || Date.now() - s.mistakes[q.id].added > 60_000)) {
      delete s.mistakes[q.id];
      coins += addCoins(s, ECONOMY.mistakeCleared, 'mistakes');
    }
  } else {
    if (context !== 'mock' && seen.n === 1) coins += addCoins(s, ECONOMY.goodTry, 'tries');
    const m = s.mistakes[q.id];
    s.mistakes[q.id] = { q: stripForSave(q), added: Date.now(), attempts: (m?.attempts || 0) + 1 };
  }
  s.last = s.last || null;
  return coins;
}

function stripForSave(q) {
  // Keep everything needed to show the question again.
  return JSON.parse(JSON.stringify(q));
}

/** 0..1 strength for a topic, from recent answers (recent ones count more). */
export function mastery(s, topicId) {
  const t = s.topics[topicId];
  if (!t || !t.recent.length) return null;
  let num = 0, den = 0;
  t.recent.forEach((v, i) => { const w = 1 + i * 0.25; num += v * w; den += w; });
  const conf = Math.min(1, t.recent.length / 6);
  return (num / den) * conf + 0.5 * (1 - conf) * (num / den);
}

export function completeLesson(s, lessonId, perfect = false) {
  const first = !s.lessons[lessonId]?.done;
  const prev = s.lessons[lessonId] || {};
  s.lessons[lessonId] = { done: true, at: Date.now(), perfect: prev.perfect || perfect };
  let coins = 0;
  if (first) coins += addCoins(s, ECONOMY.lessonComplete, 'lessons');
  if (perfect && !prev.perfect) coins += addCoins(s, ECONOMY.lessonPerfect, 'lessons');
  return coins;
}
