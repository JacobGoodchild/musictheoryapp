// Turn any stave spec (the same data the renderer draws) into something the synth
// can play, so every question with music can have a "Hear it" button.
import { P, midi } from '../theory/pitch.js';

const BEATS = { '1/2': 8, breve: 8, w: 4, semibreve: 4, h: 2, minim: 2, q: 1, crotchet: 1, 8: 0.5, quaver: 0.5, 16: 0.25, semiquaver: 0.25, 32: 0.125, demisemiquaver: 0.125 };

function lengthOf(n, free) {
  if (free) return Array.isArray(n.keys) && n.keys.length > 1 ? 2 : 1; // plain notes (scales etc.): even beats
  let b = BEATS[n.dur || 'w'] ?? 1;
  let add = b / 2;
  for (let i = 0; i < (n.dots || 0); i++) { b += add; add /= 2; }
  if (n.tuplet) b *= n.tuplet.occupied / n.tuplet.num;
  return b;
}

const keysOf = (n) => (Array.isArray(n.keys) ? n.keys : n.keys ? [n.keys] : []).map((k) => (typeof k === 'string' ? k : `${k.letter}${['bb', 'b', '', '#', '##'][k.acc + 2]}${k.octave}`)).filter((k) => /\d/.test(k));

/** One stave's notes as timed items [{ at, dur, notes }] in crotchet beats. */
function timeline(measures, free) {
  const out = [];
  let t = 0;
  for (const m of measures) {
    for (const n of m.notes || []) {
      const d = lengthOf(n, free);
      const ks = n.rest || n.color === 'transparent' ? [] : keysOf(n);
      const prev = out[out.length - 1];
      if (n.tiedFromPrev && prev) prev.dur += d; // a tie just holds the note on
      else if (ks.length) out.push({ at: t, dur: d, notes: ks });
      t += d;
    }
  }
  return out;
}

/**
 * Audio for a stave spec: { kind: 'timeline', items, tempo } or null when there
 * is nothing to play (e.g. a key signature on its own).
 */
export function musicToAudio(spec) {
  if (!spec) return null;
  let items;
  if (spec.grand) items = [...timeline(spec.upper || [], spec.free), ...timeline(spec.lower || [], spec.free)];
  else items = timeline(spec.measures || [{ notes: spec.notes || [] }], spec.free || !spec.time);
  items = items.filter((x) => x.notes.every((k) => { try { return Number.isFinite(midi(P(k))); } catch { return false; } }));
  if (!items.length) return null;
  const free = spec.free || (!spec.time && !spec.grand);
  return { kind: 'timeline', items: items.sort((a, b) => a.at - b.at), tempo: free ? 100 : 84 };
}
