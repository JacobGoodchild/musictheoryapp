// Style guards for piano music-in-context extracts (from review 4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPianoExtract } from '../../src/questions/gen-context.js';
import { rng } from '../../src/questions/util.js';
import { midi, parse } from '../../src/theory/pitch.js';
import { between } from '../../src/theory/interval.js';
import { triad } from '../../src/theory/chords.js';

test('piano extracts: no big leaps, no augmented 2nds, long notes in the chord, sensible marks', () => {
  for (let i = 0; i < 300; i++) {
    const ex = buildPianoExtract(rng(i), [1, 2, 3][i % 3]);
    const rh = ex.upper.flatMap((m, b) => m.notes.map((n) => ({ ...n, b, p: parse(n.keys) })));
    rh.forEach((n, j) => {
      assert.ok(midi(n.p) >= 62 && midi(n.p) <= 79, `seed ${i}: note out of range`);
      if (['q', 'h', 'w'].includes(n.dur)) assert.ok(triad(ex.k, ex.prog[n.b][0]).some((t) => t.letter === n.p.letter && t.acc === n.p.acc), `seed ${i}: long note ${n.keys} not in chord`);
      if (n.art) assert.ok(!['h', 'w'].includes(n.dur), `seed ${i}: articulation on a long note`);
      if (n.orn) assert.ok(!['16', '32'].includes(n.dur), `seed ${i}: ornament on a semiquaver`);
      if (j === 0) return;
      const a = rh[j - 1].p, c = n.p;
      assert.ok(Math.abs(midi(a) - midi(c)) <= 9, `seed ${i}: leap of more than a 6th`);
      const [lo, hi] = midi(a) <= midi(c) ? [a, c] : [c, a];
      if (lo.letter !== hi.letter) { const iv = between(lo, hi); assert.ok(!(iv.number === 2 && iv.quality === 'A'), `seed ${i}: augmented 2nd`); }
    });
    if (ex.k.mode === 'minor') assert.ok(!ex.prog.some(([d, inv]) => d === 2 && inv !== 'b'), `seed ${i}: diminished II not in 1st inversion`);
  }
});
