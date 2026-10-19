// Engraving checks: read back what VexFlow actually drew and compare it with
// what the music data says should be there. Runs in the browser (tests and
// the dev gallery). Returns a list of problems (empty = all good).
import { signaturePositions } from '../theory/keys.js';
import { keyFromFifths } from '../theory/keys.js';
import { inkBounds } from './render.js';

const NOTEHEADS = new Set([0xE0A0, 0xE0A1, 0xE0A2, 0xE0A3, 0xE0A4]);
const REST_GLYPH = { '1/2': 0xE4E2, w: 0xE4E3, h: 0xE4E4, q: 0xE4E5, 8: 0xE4E6, 16: 0xE4E7, 32: 0xE4E8 };
const ACC = { 0xE260: -1, 0xE261: 0, 0xE262: 1, 0xE263: 2, 0xE264: -2 };
const CLEF_GLYPH = { treble: 0xE050, bass: 0xE062, alto: 0xE05C, tenor: 0xE05C };
// Staff position the clef glyph's origin sits on: G line, F line, C line.
const CLEF_POS = { treble: 2, bass: 6, alto: 4, tenor: 6 };

// SMuFL ornament glyphs: trill, turn, upper mordent (short trill), lower mordent (with line).
const ORN_GLYPH = { trill: 0xE566, turn: 0xE567, 'upper mordent': 0xE56C, 'lower mordent': 0xE56D };

const cp = (t) => (t.textContent || '').codePointAt(0);
const num = (el, a) => parseFloat(el.getAttribute(a));

export function checkEngraving(container) {
  const info = container.__music;
  const problems = [];
  if (!info) return ['no music info on container'];
  const svg = container.querySelector('svg');
  const g = info.geometry;
  const half = g.spacing / 2;

  // Stave lines are where we think they are.
  const lineGeo = g.lines || [{ topLineY: g.topLineY, bottomLineY: g.bottomLineY }];
  const staveGroups = [...svg.querySelectorAll('g.vf-stave')];
  for (const sg of staveGroups) {
    const paths = sg.querySelectorAll('path');
    if (paths.length !== 5) { problems.push(`expected 5 stave lines, found ${paths.length}`); break; }
    const ys = [...paths].map((p) => parseFloat(/M[\d.]+ ([\d.]+)/.exec(p.getAttribute('d'))[1])).sort((a, b) => a - b);
    if (!lineGeo.some((lg) => Math.abs(ys[4] - lg.bottomLineY) <= 1 && Math.abs(ys[0] - lg.topLineY) <= 1)) problems.push('stave line geometry mismatch');
  }
  const posOnLine = (y, li) => (lineGeo[li].bottomLineY - y) / half;
  const clefOf = (li) => lineGeo[li]?.clef || info.clef;
  const lineOfY = (y) => { let best = 0; lineGeo.forEach((lg, i) => { if (Math.abs((lg.topLineY + lg.bottomLineY) / 2 - y) < Math.abs((lineGeo[best].topLineY + lineGeo[best].bottomLineY) / 2 - y)) best = i; }); return best; };

  // Clef.
  for (const clefText of svg.querySelectorAll('g.vf-clef text')) {
    const y = num(clefText, 'y');
    const li = lineOfY(y);
    const clef = clefOf(li);
    if (cp(clefText) !== CLEF_GLYPH[clef]) problems.push(`wrong clef glyph for ${clef}`);
    const p = posOnLine(y, li);
    if (Math.abs(p - CLEF_POS[clef]) > 0.1) problems.push(`${clef} clef sits on position ${p}, expected ${CLEF_POS[clef]}`);
  }

  // Key signature.
  if (info.fifths) {
    const k = keyFromFifths(info.fifths, 'major');
    const want = info.fifths > 0 ? 1 : -1;
    const groupsK = [...svg.querySelectorAll('g.vf-keysignature')];
    if (groupsK.length !== lineGeo.length) problems.push(`expected a key signature on each of ${lineGeo.length} lines, found ${groupsK.length}`);
    for (const gk of groupsK) {
      const texts = [...gk.querySelectorAll('text')];
      const li0 = texts.length ? lineOfY(num(texts[0], 'y')) : 0;
      const expected = signaturePositions(k, clefOf(li0));
      if (texts.length !== expected.length) problems.push(`key signature has ${texts.length} symbols, expected ${expected.length}`);
      const li = texts.length ? lineOfY(num(texts[0], 'y')) : 0;
      texts.forEach((t, i) => {
        if (ACC[cp(t)] !== want) problems.push(`key signature symbol ${i + 1} is the wrong accidental`);
        const p = posOnLine(num(t, 'y'), li);
        if (Math.abs(p - expected[i]) > 0.1) problems.push(`key signature symbol ${i + 1} on position ${p.toFixed(1)}, expected ${expected[i]}`);
      });
    }
  } else if (svg.querySelector('g.vf-keysignature text')) problems.push('unexpected key signature');

  // Notes.
  const groups = [...svg.querySelectorAll('g.vf-stavenote')].filter((el) => /^vf-n\d+-\d+$/.test(el.id));
  if (groups.length !== info.notes.length) problems.push(`drew ${groups.length} notes, expected ${info.notes.length}`);
  info.notes.forEach((n, i) => {
    const el = svg.querySelector(`[id="vf-n${n.m}-${n.n}"]`);
    if (!el) { problems.push(`note ${i + 1} missing`); return; }
    if (n.spec.rest) {
      if (n.spec.color === 'transparent') return;
      const glyphs = [...el.querySelectorAll('text')].map(cp);
      const want = REST_GLYPH[n.spec.dur || 'w'];
      if (!glyphs.includes(want)) problems.push(`rest ${i + 1}: wrong or missing rest symbol for ${n.spec.dur}`);
      return;
    }
    if (n.spec.orn) {
      const glyphs = [...el.querySelectorAll('text')].map(cp);
      if (!glyphs.includes(ORN_GLYPH[n.spec.orn])) problems.push(`note ${i + 1}: ${n.spec.orn} sign missing or wrong`);
    }
    const texts = [...el.querySelectorAll('text')].filter((t) => !t.closest('.vf-gracenote, .vf-gracenotegroup, .vf-annotation, .vf-ornament, .vf-articulation'));
    // Grace notes are drawn smaller: ignore noteheads below the main size.
    const sizeOf = (t) => parseFloat(t.getAttribute('font-size') || t.closest('[font-size]')?.getAttribute('font-size') || '30');
    const allHeads = texts.filter((t) => NOTEHEADS.has(cp(t)));
    const mainSize = Math.max(...allHeads.map(sizeOf), 0);
    const heads = allHeads.filter((t) => sizeOf(t) >= mainSize * 0.9);
    const accs = texts.filter((t) => cp(t) in ACC && sizeOf(t) >= mainSize * 0.9);
    const drawnPos = heads.map((t) => posOnLine(num(t, 'y'), n.line || 0)).sort((a, b) => a - b);
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
      const match = accs.find((t) => ACC[cp(t)] === e.acc && Math.abs(posOnLine(num(t, 'y'), n.line || 0) - e.pos) < 0.1);
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
  const xs = groups.map((el, i) => {
    const h = [...el.querySelectorAll('text')].find((t) => NOTEHEADS.has(cp(t)));
    return h ? { x: num(h, 'x'), line: info.notes[i]?.line || 0 } : null;
  });
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] && xs[i - 1] && xs[i].line === xs[i - 1].line && xs[i].x - xs[i - 1].x < 8) problems.push(`notes ${i} and ${i + 1} overlap`);
  }
  return problems;
}

function accOf(k) {
  const m = /^[A-Ga-g](bb|b|#|x|##)?/.exec(k);
  return { bb: -2, b: -1, '#': 1, x: 2, '##': 2 }[m[1]] ?? 0;
}

