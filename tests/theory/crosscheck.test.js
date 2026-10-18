// Independent cross-check against the `tonal` library (test-only, never shipped).
// Thousands of cases: scales, key signatures, intervals, transposition, triads.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Scale, Interval, Note, Key } from 'tonal';
import { parse, pitch, toString, midi, LETTERS } from '../../src/theory/pitch.js';
import { between, transpose, semitonesFor } from '../../src/theory/interval.js';
import { scale, GRADE5_MAJOR, GRADE5_MINOR, signature, keyScale } from '../../src/theory/keys.js';
import { triad, triadQuality } from '../../src/theory/chords.js';

// tonal writes double sharps as '##'; we write 'x'.
const toTonal = (p, oct = true) => p.letter + ['bb', 'b', '', '#', '##'][p.acc + 2] + (oct ? p.octave : '');
const pcName = (p) => toTonal(p, false);

test('scales agree with tonal for all 26 keys (major, harmonic, melodic, natural)', () => {
  let n = 0;
  for (const k of GRADE5_MAJOR) {
    assert.deepEqual(scale(parse(k.tonic + '4'), 'major').slice(0, 7).map(pcName), Scale.get(`${k.tonic} major`).notes);
    n++;
  }
  for (const k of GRADE5_MINOR) {
    const t = parse(k.tonic + '4');
    assert.deepEqual(scale(t, 'harmonic').slice(0, 7).map(pcName), Scale.get(`${k.tonic} harmonic minor`).notes);
    assert.deepEqual(scale(t, 'melodic-up').slice(0, 7).map(pcName), Scale.get(`${k.tonic} melodic minor`).notes);
    assert.deepEqual(scale(t, 'natural').slice(0, 7).map(pcName), Scale.get(`${k.tonic} aeolian`).notes);
    n += 3;
  }
  assert.equal(n, 13 + 39);
});

test('key signatures agree with tonal', () => {
  for (const k of GRADE5_MAJOR) {
    const sig = Key.majorKey(k.tonic).keySignature; // e.g. '###' or 'bb'
    assert.equal(signature(k).length, sig.length);
    assert.equal(signature(k).every((s) => s.acc === (sig[0] === '#' ? 1 : -1)), true);
  }
  for (const k of GRADE5_MINOR) {
    assert.equal(signature(k).length, Key.minorKey(k.tonic).keySignature.length);
  }
});

// Every note with up to one accidental across octaves 2..5, and some doubles.
function allNotes() {
  const out = [];
  for (let oct = 2; oct <= 5; oct++) for (const L of LETTERS) for (const acc of [-2, -1, 0, 1, 2]) out.push(pitch(L, acc, oct));
  return out;
}

test('every interval up to a 15th between scale notes of every key matches tonal', () => {
  let count = 0;
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const lower = [...keyScale(k, 3).slice(0, 7), ...keyScale(k, 4).slice(0, 7)];
    const upper = [...keyScale(k, 3), ...keyScale(k, 4), ...keyScale(k, 5)];
    for (const a of lower) for (const b of upper) {
      if (midi(b) < midi(a)) continue;
      const iv = between(a, b);
      if (iv.number > 15 || iv.number < 1) continue;
      const t = Interval.get(Interval.distance(toTonal(a), toTonal(b)));
      assert.equal(iv.number, t.num, `${toString(a)}→${toString(b)}`);
      assert.equal(iv.semitones, t.semitones);
      const tq = { P: 'P', M: 'M', m: 'm', A: 'A', d: 'd', AA: 'AA', dd: 'dd' }[t.q];
      assert.equal(iv.quality, tq, `${toString(a)}→${toString(b)}`);
      count++;
    }
  }
  assert.ok(count > 5000, `checked ${count}`);
});

test('transposing any note by any Grade 5 interval agrees with tonal (both directions)', () => {
  const qualities = { perfect: ['P', 'A', 'd'], major: ['M', 'm', 'A', 'd'] };
  let count = 0;
  for (const p of allNotes()) {
    if (Math.abs(p.acc) > 1) continue;
    for (let n = 1; n <= 15; n++) {
      const qs = [1, 4, 5, 8, 11, 12, 15].includes(n) ? qualities.perfect : qualities.major;
      for (const q of qs) {
        if (n === 1 && q === 'd') continue;
        for (const dir of ['up', 'down']) {
          const iv = `${dir === 'down' ? '-' : ''}${n}${q}`;
          const expected = Note.transpose(toTonal(p), iv);
          let ours;
          try { ours = transpose(p, n, q, dir); } catch { ours = null; }
          // tonal can produce triple accidentals; we refuse those. Only compare when tonal stays within doubles.
          if (/###|bbb/.test(expected)) { assert.equal(ours, null); continue; }
          assert.equal(toTonal(ours), expected, `${toString(p)} ${iv}`);
          assert.equal(Math.abs(midi(ours) - midi(p)), semitonesFor(n, q));
          count++;
        }
      }
    }
  }
  assert.ok(count > 8000, `checked ${count}`);
});

test('primary triads agree with tonal chord tones; minor keys use harmonic minor', () => {
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const sc = k.mode === 'major' ? Scale.get(`${k.tonic} major`).notes : Scale.get(`${k.tonic} harmonic minor`).notes;
    for (const d of [1, 2, 4, 5]) {
      const ours = triad(k, d).map(pcName);
      const expected = [sc[d - 1], sc[(d + 1) % 7], sc[(d + 3) % 7]];
      assert.deepEqual(ours, expected, `${k.tonic} ${k.mode} ${d}`);
    }
    const q = (d) => triadQuality(triad(k, d));
    if (k.mode === 'major') {
      assert.deepEqual([q(1), q(2), q(4), q(5)], ['major', 'minor', 'major', 'major']);
    } else {
      assert.deepEqual([q(1), q(2), q(4), q(5)], ['minor', 'diminished', 'minor', 'major']);
    }
  }
});

test('MIDI numbers agree with tonal for all notes', () => {
  for (const p of allNotes()) assert.equal(midi(p), Note.midi(toTonal(p)), toString(p));
});
