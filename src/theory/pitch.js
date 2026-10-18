// Pitches: letter + accidental + octave (scientific pitch notation, C4 = middle C).
// Octave numbers follow the letter, so B#3 sounds the same as C4 (MIDI 60).

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const LETTER_SEMIS = [0, 2, 4, 5, 7, 9, 11];
export const ACC_TEXT = { '-2': 'bb', '-1': 'b', 0: '', 1: '#', 2: 'x' };
export const ACC_SYMBOL = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
export const ACC_NAME = { '-2': 'double flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double sharp' };

/** Make a pitch object. */
export function pitch(letter, acc = 0, octave = 4) {
  const L = letter.toUpperCase();
  if (!LETTERS.includes(L)) throw new Error(`Bad letter ${letter}`);
  if (acc < -2 || acc > 2) throw new Error(`Accidental out of range: ${acc}`);
  return { letter: L, acc, octave };
}

/** Parse 'C#4', 'Bb3', 'Fx5', 'Ebb2', 'C4'. Octave optional (defaults to 4). */
export function parse(str) {
  const m = /^([A-Ga-g])(bb|b|#|x|##|)(-?\d+)?$/.exec(String(str).trim());
  if (!m) throw new Error(`Cannot parse pitch "${str}"`);
  const acc = { bb: -2, b: -1, '': 0, '#': 1, x: 2, '##': 2 }[m[2]];
  return pitch(m[1], acc, m[3] === undefined ? 4 : Number(m[3]));
}

export const P = (s) => (typeof s === 'string' ? parse(s) : s);

/** 'C#4' style text (ASCII). */
export function toString(p, withOctave = true) {
  return p.letter + ACC_TEXT[p.acc] + (withOctave ? p.octave : '');
}

/** Pitch class name with nice symbols, e.g. 'F♯', 'B♭'. */
export function name(p, withOctave = false) {
  return p.letter + ACC_SYMBOL[p.acc] + (withOctave ? p.octave : '');
}

/** Spoken-style name, e.g. 'F sharp', 'B double flat'. */
export function wordName(p) {
  return p.acc === 0 ? p.letter : `${p.letter} ${ACC_NAME[p.acc]}`;
}

export const letterIndex = (p) => LETTERS.indexOf(p.letter);

/** MIDI number (C4 = 60). */
export function midi(p) {
  return 12 * (p.octave + 1) + LETTER_SEMIS[letterIndex(p)] + p.acc;
}

/** Diatonic step number: counts letter names, ignores accidentals. */
export function diatonic(p) {
  return p.octave * 7 + letterIndex(p);
}

export function fromDiatonic(d, acc = 0) {
  const octave = Math.floor(d / 7);
  return pitch(LETTERS[((d % 7) + 7) % 7], acc, octave);
}

/** Pitch class 0..11. */
export const pc = (p) => ((midi(p) % 12) + 12) % 12;

export const samePitch = (a, b) => a.letter === b.letter && a.acc === b.acc && a.octave === b.octave;
export const sameSpelling = (a, b) => a.letter === b.letter && a.acc === b.acc;
export const enharmonic = (a, b) => midi(a) === midi(b);

/** All spellings (single letters, accidentals −2..+2) of a MIDI number. */
export function spellingsOf(m) {
  const out = [];
  for (let li = 0; li < 7; li++) {
    for (let acc = -2; acc <= 2; acc++) {
      const base = LETTER_SEMIS[li] + acc;
      const oct = (m - base) / 12 - 1;
      if (Number.isInteger(oct)) out.push(pitch(LETTERS[li], acc, oct));
    }
  }
  return out;
}

/** Move a pitch by whole octaves. */
export const octaveShift = (p, n) => pitch(p.letter, p.acc, p.octave + n);

// ---- Clefs -------------------------------------------------------------
// Bottom-line pitch for each clef. Staff position 0 = bottom line, 1 = first
// space, 2 = second line ... 8 = top line. Negative/above 8 need ledger lines.
export const CLEFS = {
  treble: { bottom: 'E4', name: 'treble', label: 'Treble clef', middleC: -2 },
  bass: { bottom: 'G2', name: 'bass', label: 'Bass clef', middleC: 10 },
  alto: { bottom: 'F3', name: 'alto', label: 'Alto clef', middleC: 4 },
  tenor: { bottom: 'D3', name: 'tenor', label: 'Tenor clef', middleC: 6 },
};
export const CLEF_NAMES = Object.keys(CLEFS);

/** Staff position of a pitch on a clef (0 = bottom line, 8 = top line). */
export function staffPos(p, clef) {
  return diatonic(P(p)) - diatonic(parse(CLEFS[clef].bottom));
}

export function pitchAtStaffPos(pos, clef, acc = 0) {
  return fromDiatonic(diatonic(parse(CLEFS[clef].bottom)) + pos, acc);
}

/** Describe where a note sits, e.g. "2nd line", "3rd space", "1 ledger line below". */
export function describeStaffPos(pos) {
  if (pos >= 0 && pos <= 8) {
    const n = Math.floor(pos / 2) + 1;
    return pos % 2 === 0 ? `${ordinal(n)} line` : `${ordinal(n)} space`;
  }
  if (pos < 0) {
    if (pos === -1) return 'space below the stave';
    const ledgers = Math.floor(-pos / 2);
    return pos % 2 === 0 ? `on ${ledgers} ledger line${ledgers > 1 ? 's' : ''} below` : `below ${ledgers} ledger line${ledgers > 1 ? 's' : ''}`;
  }
  if (pos === 9) return 'space above the stave';
  const ledgers = Math.floor((pos - 8) / 2);
  return pos % 2 === 0 ? `on ${ledgers} ledger line${ledgers > 1 ? 's' : ''} above` : `above ${ledgers} ledger line${ledgers > 1 ? 's' : ''}`;
}

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** VexFlow key string, e.g. 'c#/4', 'bbb/3', 'f##/5'. */
export function vexKey(p) {
  const acc = { '-2': 'bb', '-1': 'b', 0: '', 1: '#', 2: '##' }[p.acc];
  return `${p.letter.toLowerCase()}${acc}/${p.octave}`;
}
export const vexAcc = (acc) => ({ '-2': 'bb', '-1': 'b', 0: 'n', 1: '#', 2: '##' })[acc];
