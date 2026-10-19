// Pre-generate the checked question bank into data/questions/*.json.
// Every question passes validateQuestion (structure + musical re-check).
// Usage: node scripts/gen-bank.mjs
import fs from 'node:fs';
import path from 'node:path';
import { TOPICS, generate } from '../src/questions/topics.js';
import { genContext, genPianoContext } from '../src/questions/gen-context.js';
import { rng } from '../src/questions/util.js';
import { validateQuestion } from '../src/questions/validate.js';
import { buildFixedMocks } from '../src/questions/mock-builder.js';
import { genKeySigName, genKeySigChoose, genSigTonicPlace } from '../src/questions/gen-keys.js';
import { genOctaveTranspose, genInstrument, genInstrumentPlaceInKey, genClefPlace } from '../src/questions/gen-pitch.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'data', 'questions');
fs.mkdirSync(outDir, { recursive: true });

const BASE = 85;
const bySection = {};
const seen = new Set();
// Same question with options in a different order counts as a duplicate.
const fingerprint = (q) => JSON.stringify({ p: q.prompt, m: q.music, o: (q.options || []).map((o) => JSON.stringify(o)).sort(), s: (q.statements || []).map((x) => x.text).sort(), pl: q.place, n: q.numbers, d: q.dropdowns });
let dupes = 0;

function add(q) {
  const fp = fingerprint(q);
  if (seen.has(fp)) { dupes++; return false; }
  seen.add(fp);
  const problems = validateQuestion(q);
  if (problems.length) throw new Error(`Invalid question ${q.id}: ${problems.join('; ')}`);
  (bySection[q.section] = bySection[q.section] || []).push(q);
  return true;
}

for (const t of TOPICS) {
  if (t.id === 'x-context') continue;
  const target = Math.round(BASE * (t.weight || 1));
  let made = 0;
  for (let seed = 0; made < target && seed < target * 12; seed++) {
    // Spread difficulty evenly: 1, 2, 3, 2 ...
    const diff = [1, 2, 3, 2][seed % 4];
    const q = generate(t.id, `bank-${seed}`, diff);
    q.id = `${t.id}-${String(made + 1).padStart(3, '0')}`;
    if (add(q)) made++;
  }
  console.log(`${t.id}: ${made}`);
}

// Extra "tricky" questions (slight emphasis on key signatures in alto/tenor clef and
// transposition): only questions the generators themselves mark as tricky are kept.
const TRICKY = [[genKeySigName, 30], [genKeySigChoose, 30], [genSigTonicPlace, 30], [genOctaveTranspose, 20], [genInstrument, 25], [genInstrumentPlaceInKey, 35], [genClefPlace, 20]];
let trickyCount = 0, trickyAdded = 0;
for (const [gen, want] of TRICKY) {
  let made = 0;
  for (let seed = 0; made < want && seed < want * 40; seed++) {
    let q;
    try { q = gen(rng(70000 + seed * 7 + trickyCount), [3, 2, 3][seed % 3]); } catch { continue; }
    if (!q.tricky) continue;
    for (const k of ['prompt', 'explanation']) if (q[k]) q[k] = q[k].replace(/ {2,}/g, ' ').trim();
    q.gen = gen.name;
    q.id = `${q.topic}-t${String(++trickyCount).padStart(3, '0')}`;
    if (add(q)) { made++; trickyAdded++; }
  }
}
console.log(`extra tricky: ${trickyAdded}`);

// Music in context: whole sets (one extract, several questions), stored by set.
let ctxCount = 0;
for (let i = 0; ctxCount < 340; i++) {
  const r = rng(90000 + i);
  const diff = [1, 2, 3, 2][i % 4];
  let set;
  // Every third set is a piano extract (tune over left-hand chords).
  try { set = (i % 3 === 2 ? genPianoContext : genContext)(r, diff, { all: true }); } catch { continue; }
  set.forEach((q, j) => {
    q.id = `x-context-${String(i + 1).padStart(3, '0')}-${j + 1}`;
    q.topic = 'x-context';
    if (add(q)) ctxCount++;
  });
}
console.log(`x-context: ${ctxCount}`);

let total = 0;
const index = { generated: new Date().toISOString().slice(0, 10), sections: {}, topics: {} };
for (const [sec, list] of Object.entries(bySection)) {
  fs.writeFileSync(path.join(outDir, `section-${sec}.json`), JSON.stringify(list));
  index.sections[sec] = list.length;
  for (const q of list) index.topics[q.topic] = (index.topics[q.topic] || 0) + 1;
  total += list.length;
}
index.total = total;
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 1));

// Keep the offline file list in step with the data.
import("./gen-sw.mjs").then(({ swSource }) => fs.writeFileSync(path.join(root, "sw.js"), swSource()));

// Fixed mock papers.
const mocks = buildFixedMocks(15);
fs.writeFileSync(path.join(root, 'data', 'mocks.json'), JSON.stringify(mocks));
console.log(`Total ${total} questions (${dupes} duplicates skipped). ${mocks.length} fixed mocks.`);
