// Unit tests for intervals, chords, cadences, transposition and rhythm.
import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, name, midi, spellingsOf, staffPos, describeStaffPos } from '../../src/theory/pitch.js';
import { between, intervalName, transpose } from '../../src/theory/interval.js';
import { key, GRADE5_MAJOR, GRADE5_MINOR } from '../../src/theory/keys.js';
import { triad, voiceChord, identifyChord, cadenceOptions, cadenceType, INVERSIONS } from '../../src/theory/chords.js';
import { toConcert, toWritten, writtenKeyFifths, transposeKey, bestOctaveShift } from '../../src/theory/transpose.js';
import * as R from '../../src/theory/rhythm.js';

const iv = (a, b) => intervalName(between(parse(a), parse(b)));

test('interval names (hand-checked)', () => {
  assert.equal(iv('C4', 'E4'), 'major 3rd');
  assert.equal(iv('C4', 'Eb4'), 'minor 3rd');
  assert.equal(iv('C4', 'F#4'), 'augmented 4th');
  assert.equal(iv('C4', 'Gb4'), 'diminished 5th');
  assert.equal(iv('C4', 'C5'), 'perfect octave');
  assert.equal(iv('C4', 'Cb5'), 'diminished octave');
  assert.equal(iv('C4', 'C#5'), 'augmented octave');
  assert.equal(iv('E4', 'C#5'), 'major 6th');
  assert.equal(iv('E4', 'C5'), 'minor 6th');
  assert.equal(iv('Eb4', 'C#5'), 'augmented 6th');
  assert.equal(iv('E4', 'Cb5'), 'diminished 6th');
  assert.equal(iv('C4', 'B#4'), 'augmented 7th');
  assert.equal(iv('C#4', 'Bb4'), 'diminished 7th');
  assert.equal(iv('D4', 'F#4'), 'major 3rd');
  assert.equal(iv('Db4', 'F#4'), 'augmented 3rd');
  assert.equal(iv('D#4', 'F4'), 'diminished 3rd');
  assert.equal(iv('C4', 'E5'), 'compound major 3rd');
  assert.equal(intervalName(between(parse('C4'), parse('E5')), { style: 'full' }), 'major 10th');
  assert.equal(iv('G3', 'D5'), 'compound perfect 5th');
  assert.equal(iv('F3', 'B4'), 'compound augmented 4th');
  assert.equal(iv('A3', 'G5'), 'compound minor 7th');
  assert.equal(iv('C3', 'C5'), 'compound perfect octave');
  assert.equal(iv('B3', 'C4'), 'minor 2nd');
  assert.equal(iv('B3', 'C5'), 'compound minor 2nd');
});

test('transpose round trip: up then down gives back the original', () => {
  const ivs = [[2, 'M'], [2, 'm'], [3, 'M'], [3, 'm'], [4, 'P'], [4, 'A'], [5, 'P'], [5, 'd'], [6, 'M'], [6, 'm'], [7, 'M'], [7, 'm'], [8, 'P'], [10, 'M'], [12, 'P']];
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    const t = parse(k.tonic + '4');
    for (const [n, q] of ivs) {
      let up;
      try { up = transpose(t, n, q, 'up'); } catch { continue; }
      const back = transpose(up, n, q, 'down');
      assert.equal(name(back, true), name(t, true));
      const bi = between(t, up);
      assert.equal(bi.number, n); assert.equal(bi.quality, q);
    }
  }
});

test('transposing instruments', () => {
  // Clarinet in B♭: written D5 sounds C5.
  assert.equal(name(toConcert(parse('D5'), 'Bb'), true), 'C5');
  assert.equal(name(toWritten(parse('C5'), 'Bb'), true), 'D5');
  // Clarinet in A: written C5 sounds A4.
  assert.equal(name(toConcert(parse('C5'), 'A'), true), 'A4');
  assert.equal(name(toWritten(parse('A4'), 'A'), true), 'C5');
  // Horn in F: written C5 sounds F4.
  assert.equal(name(toConcert(parse('C5'), 'F'), true), 'F4');
  assert.equal(name(toWritten(parse('Bb4'), 'F'), true), 'F5');
  // Key signatures: concert F major → B♭ instrument writes G major; A instrument writes Ab major; F instrument writes C major.
  assert.equal(writtenKeyFifths(-1, 'Bb'), 1);
  assert.equal(writtenKeyFifths(-1, 'A'), -4);
  assert.equal(writtenKeyFifths(-1, 'F'), 0);
  for (const k of GRADE5_MAJOR) {
    for (const inst of ['Bb', 'A', 'F']) {
      const ivl = { Bb: [2, 'M'], A: [3, 'm'], F: [5, 'P'] }[inst];
      const tk = transposeKey(k, ivl[0], ivl[1], 'up');
      if (tk) assert.equal(tk.fifths, writtenKeyFifths(k.fifths, inst), `${k.tonic} ${inst}`);
    }
  }
});

test('chords: inversions and identification in every key', () => {
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) {
    for (const d of [1, 2, 4, 5]) {
      for (const inv of INVERSIONS) {
        const v = voiceChord(k, d, inv, 3);
        for (let i = 1; i < v.length; i++) assert.ok(midi(v[i]) > midi(v[i - 1]));
        const id = identifyChord(k, v);
        assert.deepEqual(id, { degree: d, inversion: inv }, `${k.tonic} ${k.mode} ${d}${inv}`);
        const tri = triad(k, d);
        const bassIdx = { a: 0, b: 1, c: 2 }[inv];
        assert.equal(v[0].letter, tri[bassIdx].letter);
        assert.equal(v[0].acc, tri[bassIdx].acc);
      }
    }
  }
  // Hand-checked: G major Vb = D7-less chord F#–A–D with F# in the bass
  const v = voiceChord(key('G'), 5, 'b', 3);
  assert.deepEqual(v.map((p) => name(p)), ['F♯', 'A', 'D']);
  // C minor V = G–B♮–D (harmonic minor)
  assert.deepEqual(triad(key('C', 'minor'), 5).map((p) => name(p)), ['G', 'B', 'D']);
  // C minor II = D–F–A♭ (diminished)
  assert.deepEqual(triad(key('C', 'minor'), 2).map((p) => name(p)), ['D', 'F', 'A♭']);
});

test('cadences', () => {
  assert.equal(cadenceType(5, 1), 'perfect');
  assert.equal(cadenceType(4, 1), 'plagal');
  assert.equal(cadenceType(2, 5), 'imperfect');
  assert.equal(cadenceType(1, 4), null);
  const C = key('C');
  // Final cadence, melody D→C: only V–I fits (II contains D but II–I is not a cadence).
  assert.deepEqual(cadenceOptions(C, parse('D5'), parse('C5'), 'final').map((o) => o.slice(0, 2)), [[5, 1]]);
  // Melody F→E at the end: IV–I (plagal).
  assert.deepEqual(cadenceOptions(C, parse('F5'), parse('E5'), 'final').map((o) => o.slice(0, 2)), [[4, 1]]);
  // In final cadences IV and V never share a note, so the answer is always unique.
  for (const k of ['C', 'G', 'D', 'F'].map((t) => key(t))) {
    for (const note1 of triad(k, 4).concat(triad(k, 5))) {
      for (const note2 of triad(k, 1)) assert.equal(cadenceOptions(k, note1, note2, 'final').length, 1);
    }
  }
});

test('staff positions and descriptions', () => {
  assert.equal(describeStaffPos(staffPos(parse('E4'), 'treble')), '1st line');
  assert.equal(describeStaffPos(staffPos(parse('B4'), 'treble')), '3rd line');
  assert.equal(describeStaffPos(staffPos(parse('C4'), 'treble')), 'on 1 ledger line below');
  assert.equal(describeStaffPos(staffPos(parse('C4'), 'alto')), '3rd line');
  assert.equal(describeStaffPos(staffPos(parse('C4'), 'tenor')), '4th line');
  assert.equal(spellingsOf(60).length, 3); // B#3, C4, Dbb4
});

test('octave fitting for clef transposition keeps melodies on the stave', () => {
  const mel = ['C4', 'E4', 'G4', 'C5'].map(parse);
  assert.equal(bestOctaveShift(mel, 'treble'), 0);
  assert.equal(bestOctaveShift(mel, 'bass'), -1);
});

test('rhythm maths', () => {
  assert.ok(R.eq(R.dotted('crotchet', 1), R.frac(3, 8)));
  assert.ok(R.eq(R.dotted('minim', 2), R.frac(7, 8)));
  assert.ok(R.eq(R.barLength('6/8'), R.frac(3, 4)));
  assert.equal(R.classifyTime('9/8').label, 'compound triple');
  assert.equal(R.classifyTime('2/2').label, 'simple duple');
  assert.equal(R.classifyTime('12/16').label, 'compound quadruple');
  assert.equal(R.classifyTime('7/8').kind, 'irregular');
  assert.deepEqual(R.beatUnit('6/8').note, { id: 'crotchet', dots: 1 });
  assert.equal(R.simpleToCompound('3/4'), '9/8');
  assert.equal(R.compoundToSimple('6/8'), '2/4');
  // Triplet quavers = one crotchet; quintuplet semiquavers = one crotchet; sextuplet semiquavers = one crotchet; duplet quavers = dotted crotchet.
  assert.ok(R.eq(R.tupletLength('triplet', 'quaver'), R.frac(1, 4)));
  assert.ok(R.eq(R.tupletLength('quintuplet', 'semiquaver'), R.frac(1, 4)));
  assert.ok(R.eq(R.tupletLength('sextuplet', 'semiquaver'), R.frac(1, 4)));
  assert.ok(R.eq(R.tupletLength('duplet', 'quaver'), R.frac(3, 8)));
  assert.ok(R.eq(R.totalDuration([{ id: 'semiquaver', tuplet: 'quintuplet' }, { id: 'semiquaver', tuplet: 'quintuplet' }, { id: 'semiquaver', tuplet: 'quintuplet' }, { id: 'semiquaver', tuplet: 'quintuplet' }, { id: 'semiquaver', tuplet: 'quintuplet' }]), R.frac(1, 4)));
  // Rest filling, hand-checked: 4/4 after a crotchet on beat 1 → crotchet + minim.
  assert.deepEqual(R.restsToFill('4/4', R.frac(1, 4), R.frac(3, 4)).map((r) => r.id), ['crotchet', 'minim']);
  // 4/4 a quaver into beat 1 → quaver, crotchet, minim.
  assert.deepEqual(R.restsToFill('4/4', R.frac(1, 8), R.frac(7, 8)).map((r) => r.id), ['quaver', 'crotchet', 'minim']);
  // 6/8 after a crotchet → quaver, dotted crotchet.
  assert.deepEqual(R.restsToFill('6/8', R.frac(1, 4), R.frac(1, 2)).map((r) => `${r.id}${r.dots ? '.' : ''}`), ['quaver', 'crotchet.']);
  // 3/4 whole bar → semibreve rest.
  assert.deepEqual(R.restsToFill('3/4', R.frac(0), R.frac(3, 4)).map((r) => r.id), ['semibreve']);
  // 4/4 rest on beats 2-3 → two crotchets (a minim rest should not start on beat 2).
  assert.deepEqual(R.restsToFill('4/4', R.frac(1, 4), R.frac(1, 2)).map((r) => r.id), ['crotchet', 'crotchet']);
  // 2/4 semiquaver into beat → semiquaver, quaver, crotchet
  assert.deepEqual(R.restsToFill('2/4', R.frac(1, 16), R.frac(7, 16)).map((r) => r.id), ['semiquaver', 'quaver', 'crotchet']);
});

import { voiceFourPart } from '../../src/theory/chords.js';
test('four-part voicings contain the whole chord with the right bass note', () => {
  for (const k of [...GRADE5_MAJOR, ...GRADE5_MINOR]) for (const d of [1, 2, 4, 5]) for (const inv of INVERSIONS) {
    const v = voiceFourPart(k, d, inv);
    const id = identifyChord(k, [v.bass, ...v.upper]);
    assert.deepEqual(id, { degree: d, inversion: inv }, `${k.tonic} ${k.mode} ${d}${inv}`);
    assert.ok(midi(v.bass) >= 43 && midi(v.bass) <= 59, 'bass in range');
    assert.ok(midi(v.upper[0]) > 61 && midi(v.upper[2]) <= 80, 'upper voices in treble range');
    // 1st inversion never doubles the 3rd.
    // Voiced next to I (as in a cadence), every chord still checks out and moves smoothly.
    const near = voiceFourPart(k, 1, 'a').upper;
    const v2 = voiceFourPart(k, d, inv, near);
    assert.deepEqual(identifyChord(k, [v2.bass, ...v2.upper]), { degree: d, inversion: inv });
    assert.ok(midi(v2.upper[0]) > 61 && midi(v2.upper[2]) <= 80 && v2.upper.every((p, i) => i === 0 || midi(p) > midi(v2.upper[i - 1])));
    assert.ok(v2.upper.every((p, i) => Math.abs(midi(p) - midi(near[i])) <= 12), 'no upper part leaps more than an octave');
    if (inv === 'b') { const third = triad(k, d)[1]; assert.equal(v.upper.filter((p) => p.letter === third.letter && p.acc === third.acc).length, 0); }
  }
});
