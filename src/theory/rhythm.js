// Rhythm maths. Durations are exact fractions of a semibreve (whole note).

export function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
export function frac(n, d = 1) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
export const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
export const div = (a, b) => frac(a.n * b.d, a.d * b.n);
export const eq = (a, b) => a.n * b.d === b.n * a.d;
export const lt = (a, b) => a.n * b.d < b.n * a.d;
export const toNum = (a) => a.n / a.d;
export const sum = (list) => list.reduce((acc, x) => add(acc, x), frac(0));

// Note values (British names). `vex` is the VexFlow duration code.
export const VALUES = [
  { id: 'breve', name: 'breve', rest: 'breve rest', value: frac(2), vex: '1/2', us: 'double whole note' },
  { id: 'semibreve', name: 'semibreve', rest: 'semibreve rest', value: frac(1), vex: 'w' },
  { id: 'minim', name: 'minim', rest: 'minim rest', value: frac(1, 2), vex: 'h' },
  { id: 'crotchet', name: 'crotchet', rest: 'crotchet rest', value: frac(1, 4), vex: 'q' },
  { id: 'quaver', name: 'quaver', rest: 'quaver rest', value: frac(1, 8), vex: '8' },
  { id: 'semiquaver', name: 'semiquaver', rest: 'semiquaver rest', value: frac(1, 16), vex: '16' },
  { id: 'demisemiquaver', name: 'demisemiquaver', rest: 'demisemiquaver rest', value: frac(1, 32), vex: '32' },
];
export const valueById = (id) => VALUES.find((v) => v.id === id);

/** Duration of a note value with 0, 1 or 2 dots. */
export function dotted(id, dots = 0) {
  const base = valueById(id).value;
  let total = base, add_ = base;
  for (let i = 0; i < dots; i++) { add_ = mul(add_, frac(1, 2)); total = add(total, add_); }
  return total;
}

export function valueName(id, dots = 0, rest = false) {
  const v = valueById(id);
  const prefix = dots === 2 ? 'double-dotted ' : dots === 1 ? 'dotted ' : '';
  return prefix + (rest ? v.rest : v.name);
}

/** Find {id, dots} for a duration, if it can be written as a single (dotted) note. */
export function noteForDuration(d) {
  for (const v of VALUES) for (let dots = 0; dots <= 2; dots++) if (eq(dotted(v.id, dots), d)) return { id: v.id, dots };
  return null;
}

// ---- Time signatures ----------------------------------------------------

export const SIMPLE = ['2/2', '3/2', '4/2', '2/4', '3/4', '4/4', '2/8', '3/8', '4/8'];
export const COMPOUND = ['6/4', '9/4', '12/4', '6/8', '9/8', '12/8', '6/16', '9/16', '12/16'];
export const IRREGULAR = ['5/4', '7/4', '5/8', '7/8'];
export const ALL_TIMES = [...SIMPLE, ...COMPOUND, ...IRREGULAR];

export function parseTime(ts) {
  const [top, bottom] = ts.split('/').map(Number);
  return { top, bottom };
}

/** e.g. 'simple triple', 'compound duple', 'irregular' (5 or 7 beats). */
export function classifyTime(ts) {
  const { top } = parseTime(ts);
  if ([2, 3, 4].includes(top)) return { kind: 'simple', beats: top, label: `simple ${['', '', 'duple', 'triple', 'quadruple'][top]}` };
  if ([6, 9, 12].includes(top)) return { kind: 'compound', beats: top / 3, label: `compound ${['', '', 'duple', 'triple', 'quadruple'][top / 3]}` };
  if ([5, 7].includes(top)) return { kind: 'irregular', beats: top, label: top === 5 ? 'irregular (five beats)' : 'irregular (seven beats)' };
  throw new Error(`Unsupported time signature ${ts}`);
}

/** Length of one full bar (fraction of a semibreve). */
export function barLength(ts) {
  const { top, bottom } = parseTime(ts);
  return frac(top, bottom);
}

/** The beat unit: in simple time the bottom number; in compound a dotted note. */
export function beatUnit(ts) {
  const { top, bottom } = parseTime(ts);
  const c = classifyTime(ts);
  if (c.kind === 'compound') return { value: frac(3, bottom), note: noteForDuration(frac(3, bottom)) };
  return { value: frac(1, bottom), note: noteForDuration(frac(1, bottom)) };
}

/**
 * Typical beat groupings for irregular times, in units of the bottom number.
 * 5 beats split 3+2 or 2+3; 7 beats split 2+2+3, 3+2+2 or 2+3+2.
 */
export const IRREGULAR_GROUPINGS = { 5: [[3, 2], [2, 3]], 7: [[2, 2, 3], [3, 2, 2], [2, 3, 2]] };

/** Convert a simple time signature to its compound equivalent (beats become dotted). */
export function simpleToCompound(ts) {
  const { top, bottom } = parseTime(ts);
  if (![2, 3, 4].includes(top)) throw new Error('Not simple');
  return `${top * 3}/${bottom * 2}`;
}
export function compoundToSimple(ts) {
  const { top, bottom } = parseTime(ts);
  if (![6, 9, 12].includes(top)) throw new Error('Not compound');
  return `${top / 3}/${bottom / 2}`;
}

// ---- Tuplets ---------------------------------------------------------------
// A tuplet squeezes `count` notes into the time of `inTimeOf` notes of the same value.
export const TUPLETS = {
  triplet: { count: 3, inTimeOf: 2, name: 'triplet', grade: 2 },
  duplet: { count: 2, inTimeOf: 3, name: 'duplet', grade: 4 },
  quintuplet: { count: 5, inTimeOf: 4, name: 'quintuplet', grade: 5 },
  sextuplet: { count: 6, inTimeOf: 4, name: 'sextuplet', grade: 5 },
};

/** Total length of a tuplet group of `count` notes of value id. */
export function tupletLength(type, noteId) {
  const t = TUPLETS[type];
  return mul(valueById(noteId).value, frac(t.inTimeOf));
}

/** Total of a list of rhythm items: { id, dots, tuplet?: {type} } — tuplet items count per note. */
export function totalDuration(items) {
  let tot = frac(0);
  for (const it of items) {
    let d = dotted(it.id, it.dots || 0);
    if (it.tuplet) { const t = TUPLETS[it.tuplet]; d = mul(d, frac(t.inTimeOf, t.count)); }
    tot = add(tot, d);
  }
  return tot;
}

/** Halve or double every value in a rhythm (dots kept). */
export function scaleValues(items, factor) {
  const order = VALUES.map((v) => v.id);
  return items.map((it) => {
    const i = order.indexOf(it.id) + (factor === 2 ? -1 : 1);
    if (i < 0 || i >= order.length) throw new Error('Out of range');
    return { ...it, id: order[i] };
  });
}

// ---- Rest grouping rules (used for "which rest(s) complete the bar") -----

/**
 * Standard rests that fill a gap from `start` (position in the bar) for
 * `length`, following common rules: in simple time, a whole beat gets its own
 * rest and a whole bar gets a semibreve rest (except 4/2 bars use a breve rest);
 * part beats are completed first; in compound time, a dotted-beat rest per beat.
 * Returns a list of {id, dots}. This is the conventional answer used by ABRSM
 * style questions; we only generate questions where it is unambiguous.
 */
export function restsToFill(ts, start, length) {
  const bar = barLength(ts);
  const c = classifyTime(ts);
  if (eq(start, frac(0)) && eq(length, bar)) {
    if (ts === '4/2') return [{ id: 'breve', dots: 0 }];
    return [{ id: 'semibreve', dots: 0 }];
  }
  const beat = c.kind === 'compound' ? frac(3, parseTime(ts).bottom) : frac(1, parseTime(ts).bottom);
  const out = [];
  let pos = start;
  const end = add(start, length);
  // Allowed single-rest values, largest first, each must not cross a beat
  // boundary unless it starts on a beat and covers whole beats where that is
  // standard (minim rest on beat 1 or 3 of 4/4; dotted-beat rests in compound).
  while (lt(pos, end)) {
    const remaining = sub(end, pos);
    const intoBeat = frac(((pos.n * beat.d) % (beat.n * pos.d)), pos.d * beat.d);
    let chosen = null;
    if (eq(intoBeat, frac(0))) {
      // On a beat.
      if (c.kind === 'simple' && parseTime(ts).top === 4 && !lt(remaining, mul(beat, frac(2)))) {
        const beatNo = toNum(div(pos, beat));
        if (beatNo === 0 || beatNo === 2) chosen = noteForDuration(mul(beat, frac(2)));
      }
      if (!chosen && !lt(remaining, beat)) chosen = noteForDuration(beat);
    }
    if (!chosen) {
      // Fill up to the next beat with the largest plain values (no dotted rests in simple time).
      const toBeat = eq(intoBeat, frac(0)) ? beat : sub(beat, intoBeat);
      const target = lt(remaining, toBeat) ? remaining : toBeat;
      // Within a compound beat, quaver + quaver ... use largest value that keeps alignment.
      for (const v of VALUES) {
        if (!lt(target, v.value) && isAligned(pos, v.value)) { chosen = { id: v.id, dots: 0 }; break; }
      }
    }
    if (!chosen) throw new Error('Cannot fill');
    out.push(chosen);
    pos = add(pos, dotted(chosen.id, chosen.dots));
  }
  return out;
}

function isAligned(pos, value) {
  // A rest should start on a multiple of its own length.
  const q = div(pos, value);
  return q.d === 1;
}
