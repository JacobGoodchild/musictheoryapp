// Structural and musical checks every question must pass before it is shown or
// saved to the bank. Musical checks re-derive the right answer from the brain
// where the question carries `check` data, so a wrong option can never be right.
import { parse, midi, name } from '../theory/pitch.js';
import { between, intervalName } from '../theory/interval.js';
import { keyFromFifths, keyName } from '../theory/keys.js';
import { identifyChord, chordContains, cadenceType, chordLabel } from '../theory/chords.js';
import { meaningsClash } from '../content/terms.js';

const BRITISH_SLIPS = [/\bquarter note\b/i, /\bhalf note\b/i, /\bwhole note\b/i, /\beighth note\b/i, /\bsixteenth\b/i, /\bmeasure\b/i, /\bhalf step\b/i, /\bwhole step\b/i];

export function validateQuestion(q) {
  const p = [];
  if (!q.section || q.section < 1 || q.section > 7) p.push('bad section');
  if (!q.prompt) p.push('no prompt');
  const texts = [q.prompt, q.explanation || '', ...(q.options || []).map((o) => o.label || ''), ...(q.statements || []).map((s) => s.text)];
  for (const t of texts) for (const re of BRITISH_SLIPS) if (re.test(t)) p.push(`American term in "${t.slice(0, 40)}"`);
  for (const t of texts) if (/undefined|NaN|\[object/.test(t)) p.push(`broken text "${t.slice(0, 60)}"`);
  switch (q.type) {
    case 'mcq': {
      if (!Array.isArray(q.options) || q.options.length < 2) p.push('too few options');
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) p.push('answer out of range');
      const keys = q.options.map((o) => (o.label || '') + '|' + (o.music ? JSON.stringify(o.music) : ''));
      if (new Set(keys).size !== keys.length) p.push('duplicate options');
      for (const o of q.options) if (!o.label && !o.music) p.push('empty option');
      break;
    }
    case 'truefalse':
      if (!q.statements?.length) p.push('no statements');
      if (new Set(q.statements.map((s) => s.text)).size !== q.statements.length) p.push('duplicate statements');
      for (const s of q.statements) if (typeof s.answer !== 'boolean') p.push('statement without answer');
      break;
    case 'place':
      if (!q.place?.clef || !q.place.accept?.length) p.push('place without clef/accept');
      for (const a of q.place.accept) { try { parse(a); } catch { p.push(`bad accept ${a}`); } }
      break;
    case 'number':
      if (!q.numbers?.length) p.push('no numbers');
      for (const n of q.numbers) if (!Number.isInteger(n.answer) || n.answer < 0 || n.answer > 999) p.push('bad number answer');
      break;
    case 'dropdown':
      if (!q.dropdowns?.length) p.push('no dropdowns');
      for (const d of q.dropdowns) if (!d.options.includes(d.answer)) p.push('dropdown answer not in options');
      break;
    default: p.push(`unknown type ${q.type}`);
  }
  const specs = [q.music, ...(q.options || []).map((o) => o.music)].filter(Boolean);
  for (const sp of specs) for (const m of sp.measures || [{ notes: sp.notes || [] }]) for (const n of m.notes) {
    for (const k of [].concat(n.keys || [])) if (typeof k === 'string' && !/\d/.test(k)) p.push(`pitch ${k} without octave`);
  }
  if (q.check) p.push(...musicalCheck(q));
  return p;
}

/** Re-derive the answer from the music brain and compare. */
export function musicalCheck(q) {
  const c = q.check;
  const p = [];
  const labels = (q.options || []).map((o) => o.label);
  const exactlyOne = (want, what) => {
    const hits = labels.map((l, i) => (want.includes(l) ? i : -1)).filter((i) => i >= 0);
    if (hits.length !== 1) p.push(`${what}: ${hits.length} options are correct`);
    else if (hits[0] !== q.answer) p.push(`${what}: marked answer is not the correct option`);
  };
  switch (c.kind) {
    case 'interval': {
      const lo = parse(c.low), hi = parse(c.high);
      const iv = between(lo, hi);
      exactlyOne([intervalName(iv), intervalName(iv, { style: 'full' })], 'interval');
      break;
    }
    case 'note': exactlyOne([name(parse(c.pitch))], 'note name'); break;
    case 'key': exactlyOne([keyName(keyFromFifths(c.fifths, c.mode))], 'key'); break;
    case 'chord': {
      const k = keyFromFifths(c.fifths, c.mode);
      const id = identifyChord(k, c.notes.map(parse));
      if (!id) { p.push('chord not identifiable'); break; }
      exactlyOne([chordLabel(id.degree, id.inversion, { showA: true })], 'chord');
      break;
    }
    case 'cadence-name': {
      const k = keyFromFifths(c.fifths, c.mode);
      const ids = c.chords.map((ch) => identifyChord(k, ch.map(parse)));
      if (ids.some((x) => !x)) { p.push('cadence chord not identifiable'); break; }
      const t = cadenceType(ids[0].degree, ids[1].degree);
      if (!t) { p.push('chords do not form a cadence'); break; }
      exactlyOne([`${t} cadence`], 'cadence');
      break;
    }
    case 'term': {
      const right = q.options[q.answer].label;
      q.options.forEach((o, i) => { if (i !== q.answer && meaningsClash(o.label, right)) p.push(`term options clash: "${o.label}" vs "${right}"`); });
      break;
    }
    case 'cadence-chords': {
      const k = keyFromFifths(c.fifths, 'major');
      const R = { I: 1, II: 2, IV: 4, V: 5 };
      const notes = c.notes.map(parse);
      const valid = (combo) => combo.every((ch, i) => chordContains(k, R[ch], notes[i])) && cadenceType(R[combo[0]], R[combo[1]]) && ['perfect', 'plagal'].includes(cadenceType(R[combo[2]], R[combo[3]]));
      for (const combo of q.acceptCombos) if (!valid(combo)) p.push(`accepted combo ${combo.join('-')} is not valid`);
      // Every valid combination must be accepted.
      const all = ['I', 'II', 'IV', 'V'];
      for (const a of all) for (const b of all) for (const d of all) for (const e of all) {
        const combo = [a, b, d, e];
        if (valid(combo) && !q.acceptCombos.some((x) => x.join() === combo.join())) p.push(`valid combo ${combo.join('-')} not accepted`);
      }
      break;
    }
    case 'place-interval': {
      const given = parse(c.given), ans = parse(q.place.accept[0]);
      const [lo, hi] = c.below ? [ans, given] : [given, ans];
      const iv = between(lo, hi);
      if (iv.number !== c.number || iv.quality !== c.quality) p.push('placed interval answer is wrong');
      break;
    }
    case 'same-pitch': {
      const want = midi(parse(c.pitch));
      // In music-option questions, exactly the answer option holds the same pitch.
      q.options.forEach((o, i) => {
        const k = o.music?.notes?.[0]?.keys;
        if (!k) return;
        const same = midi(parse(k)) === want && parse(k).letter === parse(c.pitch).letter;
        if (same !== (i === q.answer)) p.push('same-pitch option check failed');
      });
      break;
    }
    default: break;
  }
  return p;
}
