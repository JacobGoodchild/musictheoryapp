// Shared helpers for question generators.

/** Small, fast seeded random number generator (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  const r = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.chance = (p) => r() < p;
  r.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  r.sample = (arr, n) => r.shuffle(arr).slice(0, n);
  r.weighted = (pairs) => { const tot = pairs.reduce((s, p) => s + p[1], 0); let x = r() * tot; for (const [v, w] of pairs) { if ((x -= w) < 0) return v; } return pairs[pairs.length - 1][0]; };
  return r;
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Build a multiple-choice question. `correct` is {label, music?, key}, distractors
 * likewise. Options are de-duplicated by `key` (or label), shuffled, and the
 * correct index recorded. Throws if a distractor equals the correct answer.
 */
export function mcq(r, base, correct, distractors, n = 4) {
  const keyOf = (o) => o.key ?? o.label;
  const seen = new Set([keyOf(correct)]);
  const picked = [];
  for (const d of r.shuffle(distractors)) {
    if (picked.length >= n - 1) break;
    if (seen.has(keyOf(d))) continue;
    seen.add(keyOf(d));
    picked.push(d);
  }
  if (picked.length < Math.min(n - 1, 2)) throw new Error(`Not enough distractors for ${base.topic}`);
  const all = r.shuffle([{ ...correct, __correct: true }, ...picked]);
  const answer = all.findIndex((o) => o.__correct);
  const whyWrong = {};
  const options = all.map((o, i) => {
    if (o.why) whyWrong[i] = o.why;
    const opt = { label: o.label };
    if (o.music) opt.music = o.music;
    if (o.aria) opt.aria = o.aria;
    if (o.check) opt.check = o.check;
    return opt;
  });
  return { ...base, type: 'mcq', options, answer, whyWrong: Object.keys(whyWrong).length ? whyWrong : undefined };
}

export function trueFalse(r, base, statements, n = 4) {
  // Aim for a mix of true and false.
  const trues = r.shuffle(statements.filter((s) => s.answer));
  const falses = r.shuffle(statements.filter((s) => !s.answer));
  const nTrue = Math.max(1, Math.min(trues.length, r.int(1, n - 1)));
  let picked = [...trues.slice(0, nTrue), ...falses.slice(0, n - nTrue)];
  // Top up from whichever list has spares so there are always n statements when possible.
  for (const s of [...trues.slice(nTrue), ...falses.slice(n - nTrue)]) { if (picked.length >= n) break; picked.push(s); }
  const chosen = r.shuffle(picked).slice(0, n);
  return { ...base, type: 'truefalse', statements: chosen.map((s) => ({ text: s.text, answer: s.answer, why: s.why })) };
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const aOrAn = (word) => (/^[aeiou]/i.test(word) || /^(F|A|E)\b/.test(word) ? 'an' : 'a');
