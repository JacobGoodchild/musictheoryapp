// Pre-generate the checked question bank into data/questions/*.json.
// Every question passes validateQuestion (structure + musical re-check).
// Usage: node scripts/gen-bank.mjs
import fs from 'node:fs';
import path from 'node:path';
import { TOPICS, generate } from '../src/questions/topics.js';
import { genContext } from '../src/questions/gen-context.js';
import { rng } from '../src/questions/util.js';
import { validateQuestion } from '../src/questions/validate.js';
import { buildFixedMocks } from '../src/questions/mock-builder.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'data', 'questions');
fs.mkdirSync(outDir, { recursive: true });

const BASE = 85;
const bySection = {};
const seen = new Set();
const fingerprint = (q) => JSON.stringify({ p: q.prompt, m: q.music, o: q.options, s: q.statements, pl: q.place, n: q.numbers, d: q.dropdowns });
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
  for (let seed = 0; made < target && seed < target * 4; seed++) {
    // Spread difficulty evenly: 1, 2, 3, 2 ...
    const diff = [1, 2, 3, 2][seed % 4];
    const q = generate(t.id, `bank-${seed}`, diff);
    q.id = `${t.id}-${String(made + 1).padStart(3, '0')}`;
    if (add(q)) made++;
  }
  console.log(`${t.id}: ${made}`);
}

// Music in context: whole sets (one extract, several questions), stored by set.
let ctxCount = 0;
for (let i = 0; ctxCount < 260; i++) {
  const r = rng(90000 + i);
  const diff = [1, 2, 3, 2][i % 4];
  let set;
  try { set = genContext(r, diff, { all: true }); } catch { continue; }
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

// Fixed mock papers.
const mocks = buildFixedMocks(10);
fs.writeFileSync(path.join(root, 'data', 'mocks.json'), JSON.stringify(mocks));
console.log(`Total ${total} questions (${dupes} duplicates skipped). ${mocks.length} fixed mocks.`);
