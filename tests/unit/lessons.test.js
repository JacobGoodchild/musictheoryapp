// Every lesson is complete and its end-of-lesson check questions are valid.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../../src/content/lessons/index.js';
import { generate, topicById } from '../../src/questions/topics.js';
import { validateQuestion } from '../../src/questions/validate.js';
import { SECTIONS } from '../../src/content/sections.js';

test('lessons cover all 7 sections, with unique ids', () => {
  for (const s of SECTIONS) assert.ok(LESSONS.some((l) => l.section === s.id), `no lesson for section ${s.id}`);
  assert.equal(new Set(LESSONS.map((l) => l.id)).size, LESSONS.length);
  assert.ok(LESSONS.length >= 30);
});

test('each lesson has intro, explanation, key points, mistakes, memorise and a 5–8 question check', () => {
  for (const l of LESSONS) {
    const types = l.blocks.map((b) => b.type);
    for (const need of ['intro', 'keypoints', 'mistakes', 'memorise']) assert.ok(types.includes(need), `${l.id} lacks ${need}`);
    assert.ok(types.some((t) => ['music', 'musicRow', 'table', 'worked'].includes(t)), `${l.id} has no examples`);
    assert.ok(l.check && l.check.count >= 5 && l.check.count <= 8, `${l.id} check size`);
    for (const t of l.check.topics) assert.ok(topicById(t), `${l.id}: unknown topic ${t}`);
  }
});

test('lesson check questions generate and validate', () => {
  for (const l of LESSONS) {
    for (let i = 0; i < l.check.count; i++) {
      const q = generate(l.check.topics[i % l.check.topics.length], `lesson-${l.id}-${i}`, l.check.difficulty || (i < 2 ? 1 : 2));
      assert.deepEqual(validateQuestion(q), [], `${l.id} q${i}`);
    }
  }
});

test('lesson text uses British terminology', () => {
  const text = JSON.stringify(LESSONS);
  for (const bad of ['quarter note', 'half note', 'whole note', 'eighth note', 'sixteenth note', 'half step', 'whole step']) assert.ok(!text.toLowerCase().includes(bad), bad);
  // "measure" as a noun (American for bar); the verb "measure from" is fine.
  assert.ok(!/\b(the|each|a|per|this|every) measures?\b/i.test(text), 'measure (bar)');
});
