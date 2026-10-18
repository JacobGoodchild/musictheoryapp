// Intervals: number (1 = unison, 8 = octave, 9+ = compound) and quality.
import { P, diatonic, midi, fromDiatonic, LETTER_SEMIS, letterIndex, pitch, ordinal } from './pitch.js';

// Semitones in the major/perfect form of each simple interval number 1..7.
const BASE = [0, 2, 4, 5, 7, 9, 11];
export const isPerfectType = (n) => [1, 4, 5].includes(((n - 1) % 7) + 1);

export const QUALITY_NAMES = { P: 'perfect', M: 'major', m: 'minor', A: 'augmented', d: 'diminished', AA: 'doubly augmented', dd: 'doubly diminished' };

/** Semitones for an interval number (≥1) and quality. */
export function semitonesFor(number, quality) {
  const simple = ((number - 1) % 7) + 1;
  const octaves = Math.floor((number - 1) / 7);
  const base = BASE[simple - 1] + 12 * octaves;
  if (isPerfectType(number)) {
    const off = { P: 0, A: 1, AA: 2, d: -1, dd: -2 }[quality];
    if (off === undefined) throw new Error(`Bad quality ${quality} for ${number}`);
    return base + off;
  }
  const off = { M: 0, m: -1, A: 1, AA: 2, d: -2, dd: -3 }[quality];
  if (off === undefined) throw new Error(`Bad quality ${quality} for ${number}`);
  return base + off;
}

/** Interval from a to b, where b is at or above a (by letter). */
export function between(a, b) {
  a = P(a); b = P(b);
  const steps = diatonic(b) - diatonic(a);
  if (steps < 0) throw new Error('Second note must not be lower than the first (by letter name)');
  const number = steps + 1;
  const semis = midi(b) - midi(a);
  const simple = ((number - 1) % 7) + 1;
  const octaves = Math.floor((number - 1) / 7);
  const diff = semis - (BASE[simple - 1] + 12 * octaves);
  let quality;
  if (isPerfectType(number)) quality = { '-2': 'dd', '-1': 'd', 0: 'P', 1: 'A', 2: 'AA' }[diff];
  else quality = { '-3': 'dd', '-2': 'd', '-1': 'm', 0: 'M', 1: 'A', 2: 'AA' }[diff];
  if (!quality) return { number, quality: '?', semitones: semis, valid: false };
  return { number, quality, semitones: semis, valid: true };
}

/** Transpose a pitch up (or down) by an interval {number, quality}. */
export function transpose(p, number, quality, direction = 'up') {
  p = P(p);
  const sign = direction === 'down' ? -1 : 1;
  const targetDia = diatonic(p) + sign * (number - 1);
  const targetMidi = midi(p) + sign * semitonesFor(number, quality);
  const t = fromDiatonic(targetDia);
  const acc = targetMidi - midi(t);
  if (acc < -2 || acc > 2) throw new Error(`Cannot spell ${quality}${number} ${direction} from ${p.letter}`);
  return pitch(t.letter, acc, t.octave);
}

export const simpleNumber = (n) => ((n - 1) % 7) + 1;
export const isCompound = (n) => n > 8;

const NUMBER_WORDS = { 1: 'unison', 8: 'octave' };

/** Name of the simple part, e.g. 'major 3rd', 'perfect 5th', 'perfect octave'. */
function simpleName(number, quality) {
  const q = QUALITY_NAMES[quality];
  if (number === 1) return `${q} unison`;
  if (number === 8) return `${q} octave`;
  return `${q} ${ordinal(number)}`;
}

/**
 * ABRSM-style name. Compound intervals are named as "compound major 3rd" by
 * default; `style: 'full'` gives "major 10th". Octave (8) is simple; a
 * double octave (15) is a "compound perfect octave".
 */
export function intervalName(iv, { style = 'compound' } = {}) {
  const { number, quality } = iv;
  if (number <= 8) return simpleName(number, quality);
  if (style === 'full') return `${QUALITY_NAMES[quality]} ${ordinal(number)}`;
  const s = simpleNumber(number);
  return `compound ${simpleName(s === 1 ? 8 : s, quality)}`;
}

export function shortName(iv) {
  return `${iv.quality}${iv.number}`;
}

/** Parse 'M3', 'P5', 'm10', 'A4', 'd7'. */
export function parseInterval(s) {
  const m = /^(AA|dd|P|M|m|A|d)(\d+)$/.exec(s);
  if (!m) throw new Error(`Bad interval ${s}`);
  return { quality: m[1], number: Number(m[2]) };
}

export { letterIndex, LETTER_SEMIS };
