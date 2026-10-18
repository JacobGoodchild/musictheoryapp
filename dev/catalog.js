// Collects every stave the app can draw (demo set + lessons + question bank)
// with a plain-English description of what should be on it.
import { GRADE5_KEYS, keyName, scale, chromaticScale } from '../src/theory/keys.js';
import { parse, name, CLEF_NAMES } from '../src/theory/pitch.js';
import { voiceChord, chordLabel } from '../src/theory/chords.js';

export async function allStaves() {
  const out = [];
  // Key signatures in every clef.
  for (const clef of CLEF_NAMES) for (const k of GRADE5_KEYS.filter((k) => k.mode === 'major')) {
    out.push({ group: 'keysig', id: `${clef}-${k.tonic}`, describe: `${clef} clef, key signature of ${keyName(k)} (${Math.abs(k.fifths)} ${k.fifths >= 0 ? 'sharps' : 'flats'})`, spec: { clef, key: k, notes: [] , free: true } });
  }
  // Scales in every clef (one per key, rotating clefs).
  GRADE5_KEYS.forEach((k, i) => {
    const clef = CLEF_NAMES[i % 4];
    const oct = { treble: 4, bass: 2, alto: 3, tenor: 3 }[clef];
    const notes = scale(parse(k.tonic + oct), k.mode === 'major' ? 'major' : 'harmonic');
    out.push({ group: 'scale', id: `${k.tonic}-${k.mode}-${clef}`, describe: `${keyName(k)}${k.mode === 'minor' ? ' harmonic' : ''} scale, ${clef} clef, with accidentals (no key sig): ${notes.map((n) => name(n, true)).join(' ')}`, spec: { clef, notes: notes.map((p) => ({ keys: p, dur: 'w' })), free: true } });
  });
  // Chromatic
  out.push({ group: 'scale', id: 'chromatic-C', describe: 'Chromatic scale from C4, treble', spec: { clef: 'treble', free: true, notes: chromaticScale(parse('C4')).map((p) => ({ keys: p, dur: 'q' })) } });
  // Chords
  for (const k of GRADE5_KEYS.slice(0, 26).filter((_, i) => i % 3 === 0)) {
    const notes = [1, 2, 4, 5].flatMap((d) => ['a', 'b', 'c'].map((inv) => ({ keys: voiceChord(k, d, inv, 4), dur: 'w', label: chordLabel(d, inv, { showA: true }) })));
    out.push({ group: 'chord', id: `chords-${k.tonic}-${k.mode}`, describe: `${keyName(k)}: I, II, IV, V in a, b, c with key signature`, spec: { clef: 'treble', key: k, free: true, notes } });
  }
  // Rhythm sampler
  out.push({ group: 'rhythm', id: 'rhythm-44', describe: '4/4: crotchet, two quavers, dotted crotchet + quaver, 4 semiquavers, minim rest', spec: { clef: 'treble', time: '4/4', measures: [
    { notes: [{ keys: 'G4', dur: 'q' }, { keys: 'A4', dur: '8' }, { keys: 'B4', dur: '8' }, { keys: 'C5', dur: 'q', dots: 1 }, { keys: 'D5', dur: '8' }] },
    { notes: [{ keys: 'E5', dur: '16' }, { keys: 'D5', dur: '16' }, { keys: 'C5', dur: '16' }, { keys: 'B4', dur: '16' }, { keys: 'A4', dur: 'q' }, { rest: true, dur: 'h' }] },
  ] } });
  out.push({ group: 'rhythm', id: 'tuplets', describe: '2/4: triplet quavers, then quintuplet semiquavers; 6/8 duplet', spec: { clef: 'treble', time: '2/4', measures: [
    { notes: [{ keys: 'C5', dur: '8', tuplet: { id: 1, num: 3, occupied: 2 } }, { keys: 'D5', dur: '8', tuplet: { id: 1, num: 3, occupied: 2 } }, { keys: 'E5', dur: '8', tuplet: { id: 1, num: 3, occupied: 2 } },
      ...['F5', 'E5', 'D5', 'C5', 'B4'].map((k) => ({ keys: k, dur: '16', tuplet: { id: 2, num: 5, occupied: 4 } }))] },
  ] } });
  out.push({ group: 'rhythm', id: 'ties-orn', describe: '3/4 tenor clef in Eb: tie across bar, trill, staccato, accent, tenuto, F#3 accidental', spec: { clef: 'tenor', key: -3, time: '3/4', measures: [
    { notes: [{ keys: 'Bb3', dur: 'q', art: ['staccato'] }, { keys: 'C4', dur: 'q', art: ['accent'] }, { keys: 'D4', dur: 'q', tie: true }] },
    { notes: [{ keys: 'D4', dur: 'h', orn: 'trill', tiedFromPrev: true }, { keys: 'F#3', dur: 'q', art: ['tenuto'] }] },
  ] } });
  return out;
}
