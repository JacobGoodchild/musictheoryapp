// Triads on I, II, IV, V (and others), inversions, cadences, chords for melodies.
import { parse, midi, pc, sameSpelling, name } from './pitch.js';
import { keyScale, ROMAN, key } from './keys.js';
import { between } from './interval.js';

export const INVERSIONS = ['a', 'b', 'c'];
export const INVERSION_NAMES = { a: 'root position', b: '1st inversion', c: '2nd inversion' };

/**
 * Triad on a scale degree (1..7) of a key. Minor keys use the harmonic minor,
 * so V is major and II is diminished. Returns pitch classes as spelled pitches
 * in octave 4 (root, 3rd, 5th) stacked upwards.
 */
export function triad(k, degree) {
  const sc = keyScale(k, 4).slice(0, 7);
  const sc5 = keyScale(k, 5).slice(0, 7);
  const at = (i) => (i < 7 ? sc[i] : sc5[i - 7]);
  const r = degree - 1;
  return [at(r), at(r + 2), at(r + 4)];
}

export function triadQuality(notes) {
  const t = between(notes[0], notes[1]);
  const f = between(notes[0], notes[2]);
  const key3 = t.quality, key5 = f.quality;
  if (key3 === 'M' && key5 === 'P') return 'major';
  if (key3 === 'm' && key5 === 'P') return 'minor';
  if (key3 === 'm' && key5 === 'd') return 'diminished';
  if (key3 === 'M' && key5 === 'A') return 'augmented';
  return 'other';
}

/** Chord symbol like 'Ib', 'Vc', 'IV' (root position written without 'a' when plain). */
export function chordLabel(degree, inversion = 'a', { showA = false } = {}) {
  return ROMAN[degree - 1] + (inversion === 'a' && !showA ? '' : inversion);
}

/**
 * Voice a chord in close position with a chosen bass note for the inversion.
 * Returns pitches low→high starting with the bass at around the given octave.
 */
export function voiceChord(k, degree, inversion = 'a', bassOctave = 4) {
  const [r, t, f] = triad(k, degree);
  const order = inversion === 'a' ? [r, t, f] : inversion === 'b' ? [t, f, r] : [f, r, t];
  const out = [];
  let prevMidi = -Infinity;
  for (let i = 0; i < 3; i++) {
    let p = parse(order[i].letter + ['bb', 'b', '', '#', 'x'][order[i].acc + 2] + (i === 0 ? bassOctave : out[i - 1].octave));
    while (midi(p) <= prevMidi) p = { ...p, octave: p.octave + 1 };
    out.push(p);
    prevMidi = midi(p);
  }
  return out;
}

/** Which degree/inversion is this chord (low→high pitches) in this key, if any. */
export function identifyChord(k, notes, degrees = [1, 2, 4, 5]) {
  const bass = notes.reduce((lo, n) => (midi(n) < midi(lo) ? n : lo), notes[0]);
  for (const d of degrees) {
    const tri = triad(k, d);
    const allIn = notes.every((n) => tri.some((t) => sameSpelling(t, n)));
    const covers = tri.every((t) => notes.some((n) => sameSpelling(t, n)));
    if (!allIn || !covers) continue;
    const idx = tri.findIndex((t) => sameSpelling(t, bass));
    return { degree: d, inversion: INVERSIONS[idx] };
  }
  return null;
}

/** Does chord (degree) contain this pitch (by spelling) in key k? */
export function chordContains(k, degree, p) {
  return triad(k, degree).some((t) => sameSpelling(t, p));
}

// ---- Cadences ------------------------------------------------------------
export const CADENCES = {
  perfect: { name: 'perfect', pairs: [[5, 1]] },
  plagal: { name: 'plagal', pairs: [[4, 1]] },
  imperfect: { name: 'imperfect', pairs: [[1, 5], [2, 5], [4, 5]] },
};

export function cadenceType(d1, d2) {
  if (d1 === 5 && d2 === 1) return 'perfect';
  if (d1 === 4 && d2 === 1) return 'plagal';
  if (d2 === 5 && [1, 2, 4].includes(d1)) return 'imperfect';
  return null;
}

export const CADENCE_KEYS = ['C', 'G', 'D', 'F'].map((t) => key(t, 'major'));

/**
 * All chord pairs (from I, II, IV, V) that harmonise a two-note melody at a
 * cadence. Each chord must contain its melody note. `type` can restrict to
 * 'final' (perfect or plagal) or 'mid' (imperfect) or a specific cadence name.
 */
export function cadenceOptions(k, note1, note2, type = 'any') {
  const out = [];
  for (const d1 of [1, 2, 4, 5]) {
    for (const d2 of [1, 2, 4, 5]) {
      const c = cadenceType(d1, d2);
      if (!c) continue;
      if (type === 'final' && !(c === 'perfect' || c === 'plagal')) continue;
      if (type === 'mid' && c !== 'imperfect') continue;
      if (!['any', 'final', 'mid'].includes(type) && c !== type) continue;
      if (chordContains(k, d1, note1) && chordContains(k, d2, note2)) out.push([d1, d2, c]);
    }
  }
  return out;
}

export function chordNames(k, degree) {
  return triad(k, degree).map((p) => name(p)).join('–');
}

export { pc };

/**
 * Four-part voicing for a grand stave: one bass note (bass clef) and three
 * upper notes (treble clef), all four chord letters present between them.
 * Doublings follow the usual habits: root position doubles the root, 1st
 * inversion doubles the root or 5th (not the 3rd), 2nd inversion doubles the bass (5th).
 * Pass the previous chord's upper notes as `near` for smooth voice leading.
 */
export function voiceFourPart(k, degree, inversion = 'a', near = null) {
  const [r, t, f] = triad(k, degree);
  const bassPc = { a: r, b: t, c: f }[inversion];
  // 1st inversion: double the root or the 5th (never the 3rd), whichever sits lower.
  const upperSets = inversion === 'b' ? [[r, f, r], [f, r, f]] : [[r, t, f]];
  // Bass between G2 and B3.
  let bass = { ...bassPc, octave: 2 };
  while (midi(bass) < 43) bass = { ...bass, octave: bass.octave + 1 };
  while (midi(bass) > 59) bass = { ...bass, octave: bass.octave - 1 };
  // Upper voices in close position above middle C: try each rotation of the
  // three notes and keep the one that sits lowest (but starts above C#4).
  let out = null;
  for (const upperPcs of upperSets) for (let rot = 0; rot < 3; rot++) {
    const order = [...upperPcs.slice(rot), ...upperPcs.slice(0, rot)];
    const cand = [];
    let prev = 61;
    for (const pc of order) {
      let p = { ...pc, octave: 3 };
      while (midi(p) <= prev) p = { ...p, octave: p.octave + 1 };
      cand.push(p);
      prev = midi(p);
    }
    // With `near` (the previous chord's upper notes), move as little as possible.
    const score = (c) => (near ? c.reduce((a, p, i) => a + Math.abs(midi(p) - midi(near[i])), 0) : midi(c[2]));
    if (cand.every((p, i) => i === 0 || midi(p) > midi(cand[i - 1])) && midi(cand[2]) <= 80 && (!out || score(cand) < score(out))) out = cand;
  }
  return { bass, upper: out };
}
