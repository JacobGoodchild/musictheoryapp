// Marking. Pure functions (no DOM) so they can be unit-tested in Node.
import { parse, midi, sameSpelling, samePitch, pitch, pitchAtStaffPos } from '../theory/pitch.js';
import { signatureMap, keyFromFifths } from '../theory/keys.js';

/** Total marks a question is worth. */
export function marksFor(q) {
  if (q.marks) return q.marks;
  if (q.type === 'truefalse') return q.statements.length;
  if (q.type === 'dropdown') return q.dropdowns.length;
  if (q.type === 'number') return q.numbers.length;
  return 1;
}

/** Is the response complete enough to press Answer? */
export function isComplete(q, r) {
  if (r === undefined || r === null) return false;
  switch (q.type) {
    case 'mcq': return Number.isInteger(r);
    case 'truefalse': return Array.isArray(r) && r.length === q.statements.length && r.every((v) => v === true || v === false);
    case 'place': return Boolean(r && Number.isInteger(r.pos));
    case 'number': return Array.isArray(r) && r.length === q.numbers.length && r.every((v) => /^\d+$/.test(String(v ?? '')));
    case 'dropdown': return Array.isArray(r) && r.length === q.dropdowns.length && r.every((v) => v !== '' && v !== null && v !== undefined);
    default: return false;
  }
}

/**
 * Turn a placed notehead into a pitch. `acc` is the accidental the student
 * chose to show (null = none). With no accidental, the key signature applies.
 */
export function placedPitch(place, r) {
  const base = pitchAtStaffPos(r.pos, place.clef);
  let acc;
  if (r.acc === null || r.acc === undefined) {
    const sig = place.fifths ? signatureMap(keyFromFifths(place.fifths)) : null;
    acc = sig ? sig[base.letter] : 0;
    // Earlier accidentals in the same bar on the same line/space carry on.
    for (const n of place.notes || []) {
      if (n.rest || n.barline) continue;
      const p = parse(Array.isArray(n.keys) ? n.keys[0] : n.keys);
      if (p.letter === base.letter && p.octave === base.octave) acc = p.acc;
    }
  } else acc = r.acc;
  return pitch(base.letter, acc, base.octave);
}

/** Mark a response. Returns { score, max, correct, parts } */
export function mark(q, r) {
  const max = marksFor(q);
  if (!isComplete(q, r)) return { score: 0, max, correct: false, parts: [] };
  switch (q.type) {
    case 'mcq': {
      const ok = r === q.answer;
      return { score: ok ? max : 0, max, correct: ok, parts: [ok] };
    }
    case 'truefalse': {
      const parts = q.statements.map((s, i) => r[i] === s.answer);
      const score = parts.filter(Boolean).length * (max / q.statements.length);
      return { score, max, correct: parts.every(Boolean), parts };
    }
    case 'place': {
      const p = placedPitch(q.place, r);
      const accept = q.place.accept.map(parse);
      const ok = accept.some((a) => (q.place.anyOctave ? sameSpelling(a, p) : samePitch(a, p)));
      return { score: ok ? max : 0, max, correct: ok, parts: [ok], placed: p };
    }
    case 'number': {
      const parts = q.numbers.map((n, i) => Number(r[i]) === n.answer);
      const score = parts.filter(Boolean).length * (max / q.numbers.length);
      return { score, max, correct: parts.every(Boolean), parts };
    }
    case 'dropdown': {
      // Either each box has its own accepted values, or whole combinations are listed.
      let parts;
      if (q.acceptCombos) {
        // Credit from the accepted combination that best matches the answer.
        let best = null;
        for (const combo of q.acceptCombos) {
          const p = combo.map((v, i) => v === r[i]);
          if (!best || p.filter(Boolean).length > best.filter(Boolean).length) best = p;
        }
        parts = best;
      } else {
        parts = q.dropdowns.map((d, i) => (d.accept || [d.answer]).includes(r[i]));
      }
      const score = parts.filter(Boolean).length * (max / q.dropdowns.length);
      return { score, max, correct: parts.every(Boolean), parts };
    }
    default: return { score: 0, max, correct: false, parts: [] };
  }
}

/** Human-readable correct answer (for review screens). */
export function answerText(q) {
  switch (q.type) {
    case 'mcq': return q.options[q.answer].label;
    case 'truefalse': return q.statements.map((s) => `${s.answer ? '✓' : '✗'} ${s.text}`).join('\n');
    case 'place': return q.place.answerText || q.place.accept.join(' or ');
    case 'number': return q.numbers.map((n) => `${n.label ? n.label + ': ' : ''}${n.answer}`).join(', ');
    case 'dropdown': return q.acceptCombos ? q.acceptCombos.map((c) => c.join(' – ')).join(' or ') : q.dropdowns.map((d) => `${d.label ? d.label + ': ' : ''}${d.answer}`).join(', ');
    default: return '';
  }
}

export { midi };
