// The committed question bank and mock papers are valid and mark correctly.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateQuestion } from '../../src/questions/validate.js';
import { mark, marksFor, placedPitch } from '../../src/questions/mark.js';
import { parse, staffPos, samePitch } from '../../src/theory/pitch.js';
import { TOPICS, generate } from '../../src/questions/topics.js';
import { SECTIONS } from '../../src/content/sections.js';

const load = (f) => JSON.parse(fs.readFileSync(new URL(`../../${f}`, import.meta.url)));
const bank = [1, 2, 3, 4, 5, 6, 7].flatMap((s) => load(`data/questions/section-${s}.json`));
const mocks = load('data/mocks.json');

/** The response a student would give if they knew the answer. */
export function correctResponse(q) {
  switch (q.type) {
    case 'mcq': return q.answer;
    case 'truefalse': return q.statements.map((s) => s.answer);
    case 'number': return q.numbers.map((n) => String(n.answer));
    case 'dropdown': return q.acceptCombos ? q.acceptCombos[0].slice() : q.dropdowns.map((d) => d.answer);
    case 'place': {
      const p = parse(q.place.accept[0]);
      // Show the accidental explicitly, as a student dragging a note would.
      return { pos: staffPos(p, q.place.clef), acc: p.acc };
    }
    default: return null;
  }
}

function wrongResponse(q) {
  switch (q.type) {
    case 'mcq': return (q.answer + 1) % q.options.length;
    case 'truefalse': return q.statements.map((s) => !s.answer);
    case 'number': return q.numbers.map((n) => String(n.answer + 1));
    case 'dropdown': {
      const all = ['I', 'II', 'IV', 'V'];
      for (const a of all) for (const b of all) for (const c of all) for (const d of all) {
        const combo = [a, b, c, d];
        if (!(q.acceptCombos || []).some((x) => x.join() === combo.join())) return combo;
      }
      return null;
    }
    case 'place': { const r = correctResponse(q); return { pos: r.pos + 1, acc: r.acc }; }
    default: return null;
  }
}

test('the bank has 2000+ questions covering every topic and section', () => {
  assert.ok(bank.length >= 2000, `bank has ${bank.length}`);
  for (const t of TOPICS) assert.ok(bank.some((q) => q.topic === t.id), `no questions for ${t.id}`);
  for (let s = 1; s <= 7; s++) assert.ok(bank.filter((q) => q.section === s).length >= 150, `section ${s} too small`);
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length, 'ids must be unique');
});

test('every bank question passes validation (structure and musical re-check)', () => {
  const bad = [];
  for (const q of bank) { const p = validateQuestion(q); if (p.length) bad.push(`${q.id}: ${p.join('; ')}`); }
  assert.deepEqual(bad.slice(0, 10), []);
});

test('the correct response always scores full marks, a wrong one never does', () => {
  for (const q of [...bank, ...mocks.flatMap((m) => m.sections.flatMap((s) => s.questions))]) {
    const res = mark(q, correctResponse(q));
    assert.equal(res.score, marksFor(q), `${q.id} correct response scored ${res.score}`);
    assert.equal(res.correct, true, q.id);
    const w = wrongResponse(q);
    if (w !== null) assert.ok(mark(q, w).score < marksFor(q), `${q.id} wrong response scored full`);
  }
});

test('placed notes: no accidental means the key signature applies', () => {
  const place = { clef: 'treble', fifths: 2, notes: [] };
  assert.ok(samePitch(placedPitch(place, { pos: 1, acc: null }), parse('F#4')));
  assert.ok(samePitch(placedPitch(place, { pos: 1, acc: 0 }), parse('F4')));
  assert.ok(samePitch(placedPitch({ clef: 'tenor', notes: [] }, { pos: 6, acc: null }), parse('C4')));
  // An accidental earlier in the bar carries on
  assert.ok(samePitch(placedPitch({ clef: 'treble', notes: [{ keys: 'G#4' }] }, { pos: 2, acc: null }), parse('G#4')));
});

test('mock papers: 7 sections, 10/10/15/10/10/10/10 = 75 marks, all valid', () => {
  assert.ok(mocks.length >= 8);
  for (const m of mocks) {
    assert.equal(m.sections.length, 7);
    let total = 0;
    m.sections.forEach((sec, i) => {
      const marks = sec.questions.reduce((a, q) => a + marksFor(q), 0);
      assert.equal(marks, SECTIONS[i].marks, `${m.title} section ${i + 1}`);
      total += marks;
      for (const q of sec.questions) {
        assert.equal(q.section, i + 1);
        assert.deepEqual(validateQuestion(q), [], q.id);
      }
    });
    assert.equal(total, 75);
  }
});

test('live generation is deterministic and valid for every topic', () => {
  for (const t of TOPICS) {
    for (let i = 0; i < 25; i++) {
      const a = generate(t.id, `t${i}`);
      const b = generate(t.id, `t${i}`);
      assert.deepEqual(a, b, `${t.id} not deterministic`);
      assert.deepEqual(validateQuestion(a), []);
    }
  }
});
