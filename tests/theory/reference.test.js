// Hand-checked reference tables, written from standard theory texts and the
// ABRSM syllabus. The brain must match these exactly.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, name, toString, midi, staffPos, CLEFS } from '../../src/theory/pitch.js';
import { key, signature, scale, melodicMinor, GRADE5_MAJOR, GRADE5_MINOR, relative, signaturePositions, DEGREE_NAMES, degreeOf, chromaticScale, isValidChromatic } from '../../src/theory/keys.js';

const sp = (str) => str.split(' ');
const spell = (notes) => notes.map((n) => n.letter + ['bb', 'b', '', '#', 'x'][n.acc + 2]);

const MAJOR = {
  C: 'C D E F G A B', G: 'G A B C D E F#', D: 'D E F# G A B C#', A: 'A B C# D E F# G#', E: 'E F# G# A B C# D#',
  B: 'B C# D# E F# G# A#', 'F#': 'F# G# A# B C# D# E#', F: 'F G A Bb C D E', Bb: 'Bb C D Eb F G A',
  Eb: 'Eb F G Ab Bb C D', Ab: 'Ab Bb C Db Eb F G', Db: 'Db Eb F Gb Ab Bb C', Gb: 'Gb Ab Bb Cb Db Eb F',
};
const HARMONIC = {
  A: 'A B C D E F G#', E: 'E F# G A B C D#', B: 'B C# D E F# G A#', 'F#': 'F# G# A B C# D E#',
  'C#': 'C# D# E F# G# A B#', 'G#': 'G# A# B C# D# E Fx', 'D#': 'D# E# F# G# A# B Cx',
  D: 'D E F G A Bb C#', G: 'G A Bb C D Eb F#', C: 'C D Eb F G Ab B', F: 'F G Ab Bb C Db E',
  Bb: 'Bb C Db Eb F Gb A', Eb: 'Eb F Gb Ab Bb Cb D',
};
const MELODIC_UP = {
  A: 'A B C D E F# G#', E: 'E F# G A B C# D#', B: 'B C# D E F# G# A#', 'F#': 'F# G# A B C# D# E#',
  'C#': 'C# D# E F# G# A# B#', 'G#': 'G# A# B C# D# E# Fx', 'D#': 'D# E# F# G# A# B# Cx',
  D: 'D E F G A B C#', G: 'G A Bb C D E F#', C: 'C D Eb F G A B', F: 'F G Ab Bb C D E',
  Bb: 'Bb C Db Eb F G A', Eb: 'Eb F Gb Ab Bb C D',
};
// Key signatures: number of sharps (+) or flats (−).
const SIG_COUNT = {
  'C major': 0, 'G major': 1, 'D major': 2, 'A major': 3, 'E major': 4, 'B major': 5, 'F# major': 6,
  'F major': -1, 'Bb major': -2, 'Eb major': -3, 'Ab major': -4, 'Db major': -5, 'Gb major': -6,
  'A minor': 0, 'E minor': 1, 'B minor': 2, 'F# minor': 3, 'C# minor': 4, 'G# minor': 5, 'D# minor': 6,
  'D minor': -1, 'G minor': -2, 'C minor': -3, 'F minor': -4, 'Bb minor': -5, 'Eb minor': -6,
};
const RELATIVES = { C: 'A', G: 'E', D: 'B', A: 'F#', E: 'C#', B: 'G#', 'F#': 'D#', F: 'D', Bb: 'G', Eb: 'C', Ab: 'F', Db: 'Bb', Gb: 'Eb' };

test('there are 13 major and 13 minor Grade 5 keys', () => {
  assert.equal(GRADE5_MAJOR.length, 13);
  assert.equal(GRADE5_MINOR.length, 13);
  assert.deepEqual(GRADE5_MAJOR.map((k) => k.tonic).sort(), Object.keys(MAJOR).sort());
  assert.deepEqual(GRADE5_MINOR.map((k) => k.tonic).sort(), Object.keys(HARMONIC).sort());
});

test('major scales match the reference table', () => {
  for (const [t, ref] of Object.entries(MAJOR)) {
    assert.deepEqual(spell(scale(parse(t + '4'), 'major').slice(0, 7)), sp(ref), t);
  }
});

test('harmonic minor scales match the reference table', () => {
  for (const [t, ref] of Object.entries(HARMONIC)) {
    assert.deepEqual(spell(scale(parse(t + '4'), 'harmonic').slice(0, 7)), sp(ref), t);
  }
});

test('melodic minor: raised 6th and 7th going up, natural minor coming down', () => {
  for (const [t, ref] of Object.entries(MELODIC_UP)) {
    const m = melodicMinor(parse(t + '4'));
    assert.equal(m.length, 15);
    assert.deepEqual(spell(m.slice(0, 7)), sp(ref), t);
    // Descending = natural minor = relative major's notes from the 6th degree.
    const natural = spell(m.slice(7).reverse().slice(0, 7));
    const harm = sp(HARMONIC[t]);
    // natural minor differs from harmonic only at the 7th (lowered by a semitone)
    assert.deepEqual(natural.slice(0, 6), harm.slice(0, 6), t);
    assert.notEqual(natural[6], harm[6]);
  }
});

test('scales go up an octave and every step is a tone, semitone or (harmonic) augmented 2nd', () => {
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const type = k.mode === 'major' ? 'major' : 'harmonic';
    const s = scale(parse(k.tonic + '4'), type);
    assert.equal(midi(s[7]) - midi(s[0]), 12);
    for (let i = 1; i < 8; i++) {
      const step = midi(s[i]) - midi(s[i - 1]);
      assert.ok([1, 2, 3].includes(step));
      if (step === 3) assert.ok(type === 'harmonic' && i === 6, 'aug 2nd only between 6th and 7th');
    }
  }
});

test('key signatures have the right number of sharps/flats in the right order', () => {
  for (const [nm, n] of Object.entries(SIG_COUNT)) {
    const [t, mode] = nm.split(' ');
    const sig = signature(key(t, mode));
    assert.equal(sig.length, Math.abs(n), nm);
    const order = n > 0 ? 'FCGDAEB' : 'BEADGCF';
    assert.equal(sig.map((s) => s.letter).join(''), order.slice(0, Math.abs(n)), nm);
    for (const s of sig) assert.equal(s.acc, Math.sign(n));
  }
});

test('key signature matches the accidentals in the major / natural minor scale', () => {
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const notes = scale(parse(k.tonic + '4'), k.mode === 'major' ? 'major' : 'natural').slice(0, 7);
    const accs = notes.filter((n) => n.acc !== 0).map((n) => n.letter + (n.acc > 0 ? '#' : 'b')).sort();
    const sig = signature(k).map((s) => s.letter + (s.acc > 0 ? '#' : 'b')).sort();
    assert.deepEqual(accs, sig, `${k.tonic} ${k.mode}`);
  }
});

test('relative minors', () => {
  for (const [maj, min] of Object.entries(RELATIVES)) {
    assert.equal(relative(key(maj, 'major')).tonic, min);
    assert.equal(relative(key(min, 'minor')).tonic, maj);
  }
});

test('clef bottom lines and middle C positions', () => {
  // Middle C: one ledger line below treble, one above bass, middle line alto, 4th line tenor.
  assert.equal(staffPos(parse('C4'), 'treble'), -2);
  assert.equal(staffPos(parse('C4'), 'bass'), 10);
  assert.equal(staffPos(parse('C4'), 'alto'), 4);
  assert.equal(staffPos(parse('C4'), 'tenor'), 6);
  // Top lines: treble F5, bass A3, alto G4, tenor E4.
  assert.equal(staffPos(parse('F5'), 'treble'), 8);
  assert.equal(staffPos(parse('A3'), 'bass'), 8);
  assert.equal(staffPos(parse('G4'), 'alto'), 8);
  assert.equal(staffPos(parse('E4'), 'tenor'), 8);
  for (const c of Object.keys(CLEFS)) assert.equal(staffPos(parse(CLEFS[c].bottom), c), 0);
});

test('key signature symbols sit on the standard lines and spaces', () => {
  // Treble sharps: F (top line), C (3rd space), G (space above), D (4th line), A (2nd space), E (4th space), B (3rd line)
  assert.deepEqual(signaturePositions(key('F#', 'major'), 'treble'), [8, 5, 9, 6, 3, 7]);
  // Treble flats: B (3rd line), E (4th space), A (2nd space), D (4th line), G (2nd line), C (3rd space)
  assert.deepEqual(signaturePositions(key('Gb', 'major'), 'treble'), [4, 7, 3, 6, 2, 5]);
  // Bass is the treble pattern two steps lower
  assert.deepEqual(signaturePositions(key('F#', 'major'), 'bass'), [6, 3, 7, 4, 1, 5]);
  assert.deepEqual(signaturePositions(key('Gb', 'major'), 'bass'), [2, 5, 1, 4, 0, 3]);
  // Alto sharps one step lower than treble
  assert.deepEqual(signaturePositions(key('F#', 'major'), 'alto'), [7, 4, 8, 5, 2, 6]);
  assert.deepEqual(signaturePositions(key('Gb', 'major'), 'alto'), [3, 6, 2, 5, 1, 4]);
  // Tenor sharps start low: F (2nd line), C (4th line), G (2nd space), D (4th space), A (3rd line), E (top line)
  assert.deepEqual(signaturePositions(key('F#', 'major'), 'tenor'), [2, 6, 3, 7, 4, 8]);
  assert.deepEqual(signaturePositions(key('Gb', 'major'), 'tenor'), [5, 8, 4, 7, 3, 6]);
  // All within the stave (or the space just above, for treble G#)
  for (const clef of Object.keys(CLEFS)) for (const k of [...GRADE5_MAJOR]) {
    for (const p of signaturePositions(k, clef)) assert.ok(p >= 0 && p <= 9, `${clef} ${k.tonic}`);
  }
});

test('degree names', () => {
  assert.deepEqual(DEGREE_NAMES, ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading note']);
  assert.equal(degreeOf(parse('F#4'), key('G', 'major')), 7);
  assert.equal(degreeOf(parse('G#4'), key('A', 'minor')), 7);
  assert.equal(degreeOf(parse('Bb4'), key('F', 'major')), 4);
  assert.equal(degreeOf(parse('F4'), key('G', 'major')), null);
});

test('chromatic scales are correctly written for every Grade 5 tonic', () => {
  const sample = chromaticScale(parse('C4'));
  assert.deepEqual(sample.map((n) => name(n)), ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B', 'C']);
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const up = chromaticScale(parse(k.tonic + '4'), 'up');
    assert.ok(isValidChromatic(up, 'up'), k.tonic);
    assert.ok(isValidChromatic(chromaticScale(parse(k.tonic + '5'), 'down'), 'down'), k.tonic);
  }
  // Breaking the letter-name rule is caught
  const bad = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'E#4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'].map(parse);
  assert.ok(isValidChromatic(bad, 'up'), 'E# then F# is fine (E, E#, F# uses E twice)');
  const bad2 = ['C4', 'C#4', 'Cx4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'].map(parse);
  assert.equal(isValidChromatic(bad2, 'up'), false, 'C used three times');
  const bad3 = ['C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'Cb5', 'C5'].map(parse);
  assert.equal(isValidChromatic(bad3, 'up'), false, 'skips letter B');
  void toString;
});
