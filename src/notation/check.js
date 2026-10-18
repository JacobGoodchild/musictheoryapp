// Engraving checks: read back what VexFlow actually drew and compare it with
// what the music data says should be there. Runs in the browser (tests and
// the dev gallery). Returns a list of problems (empty = all good).
import { signaturePositions } from '../theory/keys.js';
import { keyFromFifths } from '../theory/keys.js';
import { inkBounds } from './render.js';

const NOTEHEADS = new Set([0xE0A0, 0xE0A1, 0xE0A2, 0xE0A3, 0xE0A4]);
const ACC = { 0xE260: -1, 0xE261: 0, 0xE262: 1, 0xE263: 2, 0xE264: -2 };
const CLEF_GLYPH = { treble: 0xE050, bass: 0xE062, alto: 0xE05C, tenor: 0xE05C };
// Staff position the clef glyph's origin sits on: G line, F line, C line.
const CLEF_POS = { treble: 2, bass: 6, alto: 4, tenor: 6 };

const cp = (t) => (t.textContent || '').codePointAt(0);
const num = (el, a) => parseFloat(el.getAttribute(a));

export function checkEngraving(container) {
  const info = container.__music;
  const problems = [];
  if (!info) return ['no music info on container'];
  const svg = container.querySelector('svg');
  const g = info.geometry;
  const half = g.spacing / 2;
  const posOf = (y) => (g.bottomLineY - y) / half;

  // Stave lines are where we think they are.
  const lines = [...svg.querySelectorAll('g.vf-stave')][0]?.querySelectorAll('path');
  if (!lines || lines.length !== 5) problems.push(`expected 5 stave lines, found ${lines ? lines.length : 0}`);
  else {
    const ys = [...lines].map((p) => parseFloat(/M[\d.]+ ([\d.]+)/.exec(p.getAttribute('d'))[1])).sort((a, b) => a - b);
    if (Math.abs(ys[4] - g.bottomLineY) > 1 || Math.abs(ys[0] - g.topLineY) > 1) problems.push('stave line geometry mismatch');
  }

  // Clef.
  const clefText = svg.querySelector('g.vf-clef text');
  if (clefText) {
    if (cp(clefText) !== CLEF_GLYPH[info.clef]) problems.push(`wrong clef glyph for ${info.clef}`);
    const p = posOf(num(clefText, 'y'));
    if (Math.abs(p - CLEF_POS[info.clef]) > 0.1) problems.push(`${info.clef} clef sits on position ${p}, expected ${CLEF_POS[info.clef]}`);
  }

  // Key signature.
  if (info.fifths) {
    const texts = [...svg.querySelectorAll('g.vf-keysignature text')];
    const k = keyFromFifths(info.fifths, 'major');
    const expected = signaturePositions(k, info.clef);
    if (texts.length !== expected.length) problems.push(`key signature has ${texts.length} symbols, expected ${expected.length}`);
    const want = info.fifths > 0 ? 1 : -1;
    texts.forEach((t, i) => {
      if (ACC[cp(t)] !== want) problems.push(`key signature symbol ${i + 1} is the wrong accidental`);
      const p = posOf(num(t, 'y'));
      if (Math.abs(p - expected[i]) > 0.1) problems.push(`key signature symbol ${i + 1} on position ${p.toFixed(1)}, expected ${expected[i]}`);
    });
  } else if (svg.querySelector('g.vf-keysignature text')) problems.push('unexpected key signature');

  // Notes.
  const groups = [...svg.querySelectorAll('g.vf-stavenote')].filter((el) => /^vf-n\d+-\d+$/.test(el.id));
  if (groups.length !== info.notes.length) problems.push(`drew ${groups.length} notes, expected ${info.notes.length}`);
  info.notes.forEach((n, i) => {
    const el = svg.querySelector(`[id="vf-n${n.m}-${n.n}"]`);
    if (!el) { problems.push(`note ${i + 1} missing`); return; }
    if (n.spec.rest) return;
    const texts = [...el.querySelectorAll('text')].filter((t) => !t.closest('.vf-gracenote, .vf-gracenotegroup, .vf-annotation, .vf-ornament, .vf-articulation'));
    const heads = texts.filter((t) => NOTEHEADS.has(cp(t)));
    const accs = texts.filter((t) => cp(t) in ACC);
    const drawnPos = heads.map((t) => posOf(num(t, 'y'))).sort((a, b) => a - b);
    const want = [...n.positions].sort((a, b) => a - b);
    if (drawnPos.length !== want.length) problems.push(`note ${i + 1}: ${drawnPos.length} noteheads, expected ${want.length}`);
    want.forEach((p, j) => {
      if (drawnPos[j] === undefined || Math.abs(drawnPos[j] - p) > 0.1) problems.push(`note ${i + 1}: notehead at ${drawnPos[j]}, expected staff position ${p}`);
    });
    // Accidentals: same count and kinds as the data says should be shown.
    const keys = Array.isArray(n.spec.keys) ? n.spec.keys : [n.spec.keys];
    const shown = info.accidentals[n.m][n.n];
    const expectAcc = [];
    keys.forEach((k, j) => { if (shown[j]) expectAcc.push({ acc: typeof k === 'string' ? accOf(k) : k.acc, pos: n.positions[j] }); });
    if (accs.length !== expectAcc.length) problems.push(`note ${i + 1}: ${accs.length} accidentals drawn, expected ${expectAcc.length}`);
    for (const e of expectAcc) {
      const match = accs.find((t) => ACC[cp(t)] === e.acc && Math.abs(posOf(num(t, 'y')) - e.pos) < 0.1);
      if (!match) problems.push(`note ${i + 1}: missing ${e.acc} accidental at position ${e.pos}`);
    }
  });

  // Nothing runs off the drawing.
  const vb = svg.viewBox?.baseVal;
  const X = vb && vb.width ? vb.x : 0, Y = vb && vb.width ? vb.y : 0;
  const W = (vb && vb.width ? vb.width : g.width) + X, H = (vb && vb.height ? vb.height : g.height) + Y;
  const ink = inkBounds(svg);
  if (ink.left < X - 1 || ink.right > W + 1) problems.push(`music runs off the side of the drawing (${ink.left.toFixed(0)}..${ink.right.toFixed(0)} of ${W.toFixed(0)})`);
  if (ink.top < Y - 1 || ink.bottom > H + 1) problems.push(`music runs off the top or bottom of the drawing (${ink.top.toFixed(0)}..${ink.bottom.toFixed(0)} of ${H.toFixed(0)})`);
  // Noteheads of successive notes do not overlap.
  const xs = groups.map((el) => {
    const h = [...el.querySelectorAll('text')].find((t) => NOTEHEADS.has(cp(t)));
    return h ? num(h, 'x') : null;
  }).filter((v) => v !== null);
  for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] < 8) problems.push(`notes ${i} and ${i + 1} overlap`);
  return problems;
}

function accOf(k) {
  const m = /^[A-Ga-g](bb|b|#|x|##)?/.exec(k);
  return { bb: -2, b: -1, '#': 1, x: 2, '##': 2 }[m[1]] ?? 0;
}

