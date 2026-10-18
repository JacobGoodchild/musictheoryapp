// Keys, key signatures, scales and degree names.
import { pitch, parse, P, LETTERS, LETTER_SEMIS, letterIndex, midi, name, diatonic, staffPos, fromDiatonic } from './pitch.js';
import { transpose } from './interval.js';

export const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

// Keys by position on the circle of fifths: -6 (six flats) .. +6 (six sharps).
const MAJOR_BY_FIFTHS = { '-7': 'Cb', '-6': 'Gb', '-5': 'Db', '-4': 'Ab', '-3': 'Eb', '-2': 'Bb', '-1': 'F', 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F#', 7: 'C#' };
const MINOR_BY_FIFTHS = { '-7': 'Ab', '-6': 'Eb', '-5': 'Bb', '-4': 'F', '-3': 'C', '-2': 'G', '-1': 'D', 0: 'A', 1: 'E', 2: 'B', 3: 'F#', 4: 'C#', 5: 'G#', 6: 'D#', 7: 'A#' };

/** A key: { tonic: 'Eb', mode: 'major'|'minor', fifths: -3 } */
export function key(tonic, mode = 'major') {
  const table = mode === 'major' ? MAJOR_BY_FIFTHS : MINOR_BY_FIFTHS;
  const entry = Object.entries(table).find(([, t]) => t === tonic);
  if (!entry) throw new Error(`Unknown key ${tonic} ${mode}`);
  return { tonic, mode, fifths: Number(entry[0]) };
}

export function keyFromFifths(fifths, mode = 'major') {
  const t = (mode === 'major' ? MAJOR_BY_FIFTHS : MINOR_BY_FIFTHS)[fifths];
  if (!t) throw new Error(`No key with ${fifths} fifths`);
  return { tonic: t, mode, fifths };
}

/** The 26 Grade 5 keys (up to six sharps or flats). */
export const GRADE5_MAJOR = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((f) => keyFromFifths(f, 'major'));
export const GRADE5_MINOR = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((f) => keyFromFifths(f, 'minor'));
export const GRADE5_KEYS = [...GRADE5_MAJOR, ...GRADE5_MINOR];

export const tonicPitch = (k, octave = 4) => parse(k.tonic + octave);

export function keyName(k) {
  return `${name(parse(k.tonic))} ${k.mode}`;
}
export const keyId = (k) => `${k.tonic}-${k.mode}`;
export function keyFromId(id) { const [t, m] = id.split('-'); return key(t, m); }

/** Accidentals in the key signature, in order, e.g. ['F#','C#'] or ['Bb','Eb']. */
export function signature(k) {
  const n = Math.abs(k.fifths);
  if (k.fifths > 0) return SHARP_ORDER.slice(0, n).map((l) => ({ letter: l, acc: 1 }));
  if (k.fifths < 0) return FLAT_ORDER.slice(0, n).map((l) => ({ letter: l, acc: -1 }));
  return [];
}

/** Accidental the key signature gives each letter. */
export function signatureMap(k) {
  const map = { C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0 };
  for (const s of signature(k)) map[s.letter] = s.acc;
  return map;
}

export function relative(k) {
  return keyFromFifths(k.fifths, k.mode === 'major' ? 'minor' : 'major');
}

/** Same tonic, other mode (e.g. C major ↔ C minor). */
export function tonicMinorOrMajor(k) {
  return key(k.tonic, k.mode === 'major' ? 'minor' : 'major');
}

// Standard placement of key-signature accidentals on each clef, as pitches.
// These are the conventional printed positions (tenor clef sharps start low).
export const SIG_POSITIONS = {
  treble: { sharp: ['F5', 'C5', 'G5', 'D5', 'A4', 'E5', 'B4'], flat: ['B4', 'E5', 'A4', 'D5', 'G4', 'C5', 'F4'] },
  bass: { sharp: ['F3', 'C3', 'G3', 'D3', 'A2', 'E3', 'B2'], flat: ['B2', 'E3', 'A2', 'D3', 'G2', 'C3', 'F2'] },
  alto: { sharp: ['F4', 'C4', 'G4', 'D4', 'A3', 'E4', 'B3'], flat: ['B3', 'E4', 'A3', 'D4', 'G3', 'C4', 'F3'] },
  tenor: { sharp: ['F3', 'C4', 'G3', 'D4', 'A3', 'E4', 'B3'], flat: ['B3', 'E4', 'A3', 'D4', 'G3', 'C4', 'F3'] },
};

/** Staff positions (0 = bottom line) of the key signature symbols on a clef. */
export function signaturePositions(k, clef) {
  const n = Math.abs(k.fifths);
  const list = SIG_POSITIONS[clef][k.fifths > 0 ? 'sharp' : 'flat'].slice(0, n);
  return list.map((s) => staffPos(parse(s), clef));
}

// ---- Scales -------------------------------------------------------------

/** Spell a 7-note scale from a tonic using a semitone pattern (letters step by one). */
function spellFrom(tonic, semis) {
  const t = P(tonic);
  const out = [t];
  for (let i = 1; i < semis.length; i++) {
    const d = diatonic(t) + i;
    const base = fromDiatonic(d);
    const acc = midi(t) + semis[i] - midi(base);
    out.push(pitch(base.letter, acc, base.octave));
  }
  return out;
}

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];
const NAT_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10, 12];
const HARM_MINOR_STEPS = [0, 2, 3, 5, 7, 8, 11, 12];
const MEL_MINOR_UP_STEPS = [0, 2, 3, 5, 7, 9, 11, 12];

/**
 * One octave scale ascending, 8 notes including the top tonic.
 * type: 'major' | 'natural' | 'harmonic' | 'melodic-up' | 'melodic-down'
 * 'melodic-down' is returned descending (top tonic first).
 */
export function scale(tonic, type = 'major') {
  const steps = { major: MAJOR_STEPS, natural: NAT_MINOR_STEPS, harmonic: HARM_MINOR_STEPS, 'melodic-up': MEL_MINOR_UP_STEPS, 'melodic-down': NAT_MINOR_STEPS }[type];
  if (!steps) throw new Error(`Unknown scale type ${type}`);
  const notes = spellFrom(tonic, steps);
  return type === 'melodic-down' ? notes.reverse() : notes;
}

/** Melodic minor: up then down (15 notes, top tonic once). */
export function melodicMinor(tonic) {
  const up = scale(tonic, 'melodic-up');
  const down = scale(tonic, 'melodic-down');
  return [...up, ...down.slice(1)];
}

/** The scale of a key: major, or harmonic minor for minor keys (used for chords). */
export function keyScale(k, octave = 4, type) {
  const t = parse(k.tonic + octave);
  return scale(t, type || (k.mode === 'major' ? 'major' : 'harmonic'));
}

export const DEGREE_NAMES = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading note'];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Degree (1..7) of a pitch in a key, or null if it is not a scale note. */
export function degreeOf(p, k, type) {
  const notes = keyScale(k, 4, type).slice(0, 7);
  const i = notes.findIndex((n) => n.letter === p.letter && n.acc === p.acc);
  return i === -1 ? null : i + 1;
}

// ---- Chromatic scale ----------------------------------------------------

/**
 * A chromatic scale is correctly written (ABRSM convention) if: it starts and
 * ends on the same note an octave apart, every step is a semitone, every step
 * either repeats the letter or moves to the next letter, and no letter name is
 * used more than twice in a row.
 */
export function isValidChromatic(notes, direction = 'up') {
  if (notes.length !== 13) return false;
  const first = notes[0], last = notes[12];
  if (first.letter !== last.letter || first.acc !== last.acc) return false;
  const sign = direction === 'up' ? 1 : -1;
  if (midi(last) - midi(first) !== 12 * sign) return false;
  for (let i = 1; i < 13; i++) {
    const a = notes[i - 1], b = notes[i];
    if (midi(b) - midi(a) !== sign) return false;
    const step = diatonic(b) - diatonic(a);
    if (!(step === 0 || step === sign)) return false;
    if (i >= 2 && notes[i - 2].letter === a.letter && a.letter === b.letter) return false;
  }
  return true;
}

/**
 * The "harmonic" chromatic scale: tonic and dominant once, every other degree
 * twice (1 ♭2 2 ♭3 3 4 ♯4 5 ♭6 6 ♭7 7 1, measured from the major scale on the
 * tonic). It reads the same up and down. Remote tonics can need double flats.
 */
const CHROM_LETTERS = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7];
export function chromaticScale(tonic, direction = 'up') {
  const t = P(tonic);
  const up = CHROM_LETTERS.map((dl, i) => {
    const base = fromDiatonic(diatonic(t) + dl);
    return pitch(base.letter, midi(t) + i - midi(base), base.octave);
  });
  return direction === 'up' ? up : up.slice().reverse();
}

export { transpose, LETTERS, LETTER_SEMIS, letterIndex };
