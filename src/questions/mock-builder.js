// Builds full mock papers: 7 sections, 10/10/15/10/10/10/10 = 75 marks.
import { topicsForSection, generate } from './topics.js';
import { genAnyContext } from './gen-context.js';
import { marksFor } from './mark.js';
import { rng, hashString } from './util.js';
import { SECTIONS } from '../content/sections.js';

function buildSection(sec, seed) {
  const target = SECTIONS.find((s) => s.id === sec).marks;
  const r = rng(hashString(`mock:${seed}:s${sec}`));
  if (sec === 7) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const set = genAnyContext(rng(hashString(`mock:${seed}:ctx:${attempt}`)), r.pick([2, 2, 3]), { all: true });
      const tf = set.find((q) => q.type === 'truefalse');
      const singles = r.shuffle(set.filter((q) => q !== tf));
      const chosen = tf ? [tf] : [];
      let marks = tf ? marksFor(tf) : 0;
      for (const q of singles) if (marks + marksFor(q) <= target) { chosen.push(q); marks += marksFor(q); }
      if (marks === target) return chosen.sort((a, b) => set.indexOf(a) - set.indexOf(b));
    }
    throw new Error('Could not build section 7');
  }
  const topics = topicsForSection(sec);
  const out = [];
  let marks = 0;
  const usedTopics = {};
  const seenQ = new Set();
  for (let i = 0; i < 400 && marks < target; i++) {
    // Cover every topic once before repeating, weighted by topic emphasis.
    const fresh = topics.filter((t) => !usedTopics[t.id]);
    const pool = fresh.length ? fresh : topics;
    const t = r.weighted(pool.map((x) => [x, x.weight || 1]));
    const diff = r.weighted([[1, 1], [2, 2], [3, 1]]);
    let q;
    try { q = generate(t.id, `mock:${seed}:${sec}:${i}`, diff); } catch { continue; }
    const fp = JSON.stringify([q.prompt, q.music, q.place && q.place.accept]);
    if (seenQ.has(fp)) continue;
    const m = marksFor(q);
    if (marks + m > target) continue;
    // Keep multi-mark questions to a sensible share.
    if (m > 1 && out.filter((x) => marksFor(x) > 1).length >= 1 && sec !== 3) continue;
    if (m > 1 && out.filter((x) => marksFor(x) > 1).length >= 2) continue;
    out.push(q);
    seenQ.add(fp);
    marks += m;
    usedTopics[t.id] = (usedTopics[t.id] || 0) + 1;
  }
  if (marks !== target) throw new Error(`Section ${sec} has ${marks} marks`);
  return out;
}

/** A full mock paper. */
export function buildMock(seed, title = null) {
  const sections = SECTIONS.map((s) => ({ id: s.id, title: s.title, marks: s.marks, questions: buildSection(s.id, seed) }));
  sections.forEach((s) => s.questions.forEach((q, i) => { q.id = `mock-${seed}-s${s.id}-q${i + 1}`; }));
  return { id: String(seed), title: title || `Mock paper`, seed, sections };
}

export function buildFixedMocks(n = 10) {
  return Array.from({ length: n }, (_, i) => buildMock(`paper-${i + 1}`, `Paper ${i + 1}`));
}
