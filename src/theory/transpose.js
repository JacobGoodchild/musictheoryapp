// Transposition: by interval, by octave between clefs, and transposing instruments.
import { P, midi, staffPos, pitch } from './pitch.js';
import { transpose as tr } from './interval.js';
import { keyFromFifths } from './keys.js';

/**
 * Transposing instruments (Grade 5). Each sounds lower than written by the
 * given interval. To get concert pitch from written, go DOWN by it; to write a
 * part from concert pitch, go UP by it.
 */
export const INSTRUMENT_KEYS = {
  Bb: { label: 'in B♭', interval: { number: 2, quality: 'M' }, words: 'a major 2nd lower', examples: ['clarinet in B♭', 'trumpet in B♭'], keyShift: 2 },
  A: { label: 'in A', interval: { number: 3, quality: 'm' }, words: 'a minor 3rd lower', examples: ['clarinet in A'], keyShift: 3 },
  F: { label: 'in F', interval: { number: 5, quality: 'P' }, words: 'a perfect 5th lower', examples: ['horn in F', 'cor anglais'], keyShift: 1 },
};

/** Written note for this instrument → sounding (concert) note. */
export function toConcert(p, inst) {
  const { number, quality } = INSTRUMENT_KEYS[inst].interval;
  return tr(P(p), number, quality, 'down');
}

/** Concert note → written note for this instrument. */
export function toWritten(p, inst) {
  const { number, quality } = INSTRUMENT_KEYS[inst].interval;
  return tr(P(p), number, quality, 'up');
}

/** Number of fifths the key moves when written for the instrument (concert → written). */
export function writtenKeyFifths(concertFifths, inst) {
  // Up a major 2nd adds 2 sharps; up a minor 3rd adds 3 flats... computed generally:
  const steps = { Bb: 2, A: -3, F: 1 }[inst];
  return concertFifths + steps;
}

export function concertKeyFifths(writtenFifths, inst) {
  const steps = { Bb: 2, A: -3, F: 1 }[inst];
  return writtenFifths - steps;
}

/** Transpose a key (by fifths) the same way notes move by an interval up. */
export function transposeKey(k, number, quality, direction = 'up') {
  const t = tr(P(k.tonic + '4'), number, quality, direction);
  const tonic = t.letter + ['bb', 'b', '', '#', 'x'][t.acc + 2];
  // Find fifths for this tonic in the mode.
  for (let f = -7; f <= 7; f++) {
    try {
      const kk = keyFromFifths(f, k.mode);
      if (kk.tonic === tonic) return kk;
    } catch { /* not in range */ }
  }
  return null;
}

/**
 * Rewrite a melody at the same pitch in a different clef. Returns the same
 * pitches (clef changes do not change pitch); used with `octaveFit` to move
 * by octaves so the melody sits well on the new stave.
 */
export function bestOctaveShift(pitches, clef) {
  // Choose the octave shift (−3..+3) that keeps the most notes on the stave
  // (positions −2..10 allowed with ledger lines) and centres them.
  let best = 0, bestScore = Infinity;
  for (let k = -3; k <= 3; k++) {
    const pos = pitches.map((p) => staffPos(pitch(p.letter, p.acc, p.octave + k), clef));
    const out = pos.reduce((n, x) => n + (x < -3 ? (-3 - x) * 3 : x > 11 ? (x - 11) * 3 : 0), 0);
    const centre = Math.abs(pos.reduce((a, b) => a + b, 0) / pos.length - 4);
    const score = out * 10 + centre;
    if (score < bestScore) { bestScore = score; best = k; }
  }
  return best;
}

/** Shift every pitch by whole octaves. */
export const shiftOctaves = (pitches, n) => pitches.map((p) => pitch(p.letter, p.acc, p.octave + n));

export { midi };
