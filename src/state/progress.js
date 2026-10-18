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
