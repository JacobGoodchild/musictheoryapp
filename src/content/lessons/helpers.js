// Helpers so lesson music is computed from the brain, never typed by hand.
import { parse, toString, name } from '../../theory/pitch.js';
import { scale, melodicMinor, chromaticScale, key, keyName } from '../../theory/keys.js';
import { transpose } from '../../theory/interval.js';
import { voiceChord, chordLabel } from '../../theory/chords.js';

export const ts = (p) => toString(p);
export const notes = (list, dur = 'w', extra = {}) => list.map((p) => ({ keys: typeof p === 'string' ? p : toString(p), dur, ...extra }));

/** A one-octave scale on a stave. type: major | harmonic | melodic-up | melodic | natural | chromatic */
export function scaleMusic(tonic, type, clef = 'treble', { withKey = false, labels = false, dur = 'w' } = {}) {
  const t = parse(tonic);
  let list;
  if (type === 'melodic') list = melodicMinor(t);
  else if (type === 'chromatic') list = chromaticScale(t);
  else list = scale(t, type);
  const k = withKey ? key(t.letter + ['bb', 'b', '', '#', 'x'][t.acc + 2], type === 'major' ? 'major' : 'minor') : null;
  return { clef, key: k ? k.fifths : null, free: true, notes: list.map((p, i) => ({ keys: toString(p), dur, label: labels ? (Array.isArray(labels) ? labels[i] : name(p)) : undefined })), scale: list.length > 9 ? 0.95 : 1.05 };
}

export function keySigMusic(tonic, mode, clef = 'treble') {
  const k = key(tonic, mode);
  return { clef, key: k.fifths, free: true, notes: [], scale: 1.25 };
}

/** Two notes making an interval (number, quality) above `low`. */
export function intervalMusic(low, number, quality, clef = 'treble', harmonic = false) {
  const lo = parse(low);
  const hi = transpose(lo, number, quality, 'up');
  return harmonic
    ? { clef, free: true, notes: [{ keys: [toString(lo), toString(hi)], dur: 'w' }], scale: 1.15 }
    : { clef, free: true, notes: [{ keys: toString(lo), dur: 'w' }, { keys: toString(hi), dur: 'w' }], scale: 1.15 };
}
export const intervalAudio = (low, number, quality) => ({ kind: 'interval', notes: [low, toString(transpose(parse(low), number, quality, 'up'))] });

/** Chords in a key, labelled (e.g. Ia Ib Ic). */
export function chordsMusic(tonic, mode, list, clef = 'treble', bassOct = 4) {
  const k = key(tonic, mode);
  return { clef, key: k.fifths, free: true, scale: 1.05, notes: list.map(([d, inv]) => ({ keys: voiceChord(k, d, inv, bassOct).map((p) => toString(p)), dur: 'w', label: chordLabel(d, inv, { showA: true }) })) };
}
export const chordAudio = (tonic, mode, d, inv, bassOct = 4) => ({ kind: 'chord', notes: voiceChord(key(tonic, mode), d, inv, bassOct).map((p) => toString(p)) });

export { keyName, key, parse, toString, name };
