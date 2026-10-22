// Hints must help without ever being wrong: ruled-out options are really wrong,
// revealed parts are really right, and hint 3 still leaves a choice to make.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { hintsFor } from '../../src/questions/hints.js';

const bank = [1, 2, 3, 4, 5, 6, 7].flatMap((s) => JSON.parse(fs.readFileSync(new URL(`../../data/questions/section-${s}.json`, import.meta.url))));

test('every bank question has three hints that never give wrong information', () => {
  for (const q of bank) {
    const hs = hintsFor(q);
    assert.equal(hs.length, 3, q.id);
    hs.forEach((h, i) => assert.ok(h.text && h.text.length > 10, `${q.id} hint ${i + 1} is empty`));
    if (q.type === 'mcq') {
      for (const h of hs) assert.ok(!(h.eliminate || []).includes(q.answer), `${q.id}: a hint rules out the right answer`);
      const left = q.options.length - hs[2].eliminate.length;
      assert.equal(left, 2, `${q.id}: hint 3 should leave two options`);
      assert.ok(hs[1].eliminate.length >= 1, `${q.id}: hint 2 rules nothing out`);
    }
    if (q.type === 'truefalse') {
      for (const h of hs.slice(1)) assert.ok(h.reveal.statements.length < q.statements.length, `${q.id}: hints reveal every statement`);
    }
    if (q.type === 'dropdown') {
      const combo = q.acceptCombos ? q.acceptCombos[0] : q.dropdowns.map((d) => d.answer);
      assert.ok(hs[2].reveal.boxes.length < combo.length, `${q.id}: hints fill every box`);
      if (q.acceptCombos) assert.ok(q.acceptCombos.some((c) => c.join() === combo.join()));
    }
    if (q.type === 'place') assert.ok(hs[1].text.includes(`**${q.place.accept[0][0].toUpperCase()}**`), `${q.id}: hint 2 letter`);
  }
});

test('hint 3 hides the answer text of multiple-choice questions', () => {
  for (const q of bank.filter((x) => x.type === 'mcq')) {
    const label = q.options[q.answer].label;
    if (!label || label.length < 3) continue;
    const t = hintsFor(q)[2].text;
    const re = new RegExp(`(^|[^\\w♯♭𝄪𝄫])${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w♯♭𝄪𝄫])`, 'i');
    assert.ok(!re.test(t), `${q.id}: hint 3 shows the answer "${label}"`);
  }
});

test('the first hint explains tricky words, such as cadence', () => {
  const q = bank.find((x) => x.topic === 'x-context' && /cadence/i.test(x.prompt));
  if (q) assert.match(hintsFor(q)[0].text, /cadence/i);
});

import { easyVersion } from '../../src/questions/hints.js';
test('beginner versions keep the right answer and stay consistent', () => {
  for (const q of bank) {
    const e = easyVersion(q);
    if (q.type === 'mcq') {
      assert.ok(e.options.length <= 3, q.id);
      assert.equal(e.options[e.answer].label, q.options[q.answer].label, q.id);
      assert.deepEqual(e.options[e.answer], q.options[q.answer]);
      const h = hintsFor(e);
      assert.ok(!h[1].eliminate.includes(e.answer) && !h[2].eliminate.includes(e.answer), q.id);
    }
    if (q.type === 'truefalse') assert.ok(e.statements.length <= 2 && e.statements.every((s) => q.statements.includes(s)), q.id);
  }
});
