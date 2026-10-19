// The one notation wrapper. Every stave in the app is drawn from data here,
// using VexFlow (vendored, MIT). Pitches come from the music brain.
import { P, staffPos, vexKey, vexAcc } from '../theory/pitch.js';
import { keyFromFifths, signatureMap } from '../theory/keys.js';
import { classifyTime, IRREGULAR_GROUPINGS, parseTime } from '../theory/rhythm.js';

let readyPromise = null;
/** Resolves once VexFlow and the Bravura music font are ready. */
export function notationReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      for (let i = 0; i < 200 && !globalThis.VexFlow; i++) await new Promise((r) => setTimeout(r, 25));
      if (!globalThis.VexFlow) throw new Error('Music notation library failed to load');
      if (document.fonts?.load) {
        await Promise.all([document.fonts.load('30pt Bravura'), document.fonts.load('12pt Academico')]);
      }
      return globalThis.VexFlow;
    })();
  }
  return readyPromise;
}

const VEX_DUR = { breve: '1/2', semibreve: 'w', minim: 'h', crotchet: 'q', quaver: '8', semiquaver: '16', demisemiquaver: '32', w: 'w', h: 'h', q: 'q', 8: '8', 16: '16', 32: '32', '1/2': '1/2' };
const ART = { staccato: 'a.', accent: 'a>', tenuto: 'a-', staccatissimo: 'av', marcato: 'a^', 'strong accent': 'a^', fermata: 'a@a', pause: 'a@a', 'semi-staccato': 'a.' };
// VexFlow 5 names: 'mordent' draws the upper mordent (no line), 'mordentInverted' the lower (with line).
const ORN = { trill: 'tr', turn: 'turn', 'upper mordent': 'mordent', 'lower mordent': 'mordentInverted' };
// Rest positions per clef (middle of the stave).
const REST_KEY = { treble: 'b/4', bass: 'd/3', alto: 'c/4', tenor: 'a/3' };

function keyFifths(k) {
  if (k === null || k === undefined) return null;
  if (typeof k === 'number') return k;
  return k.fifths;
}

function vexKeySigName(fifths) {
  if (fifths === null) return null;
  return keyFromFifths(fifths, 'major').tonic; // VexFlow takes the major-key name
}

/**
 * Decide which noteheads need a printed accidental, given the key signature
 * and accidentals already used earlier in the same bar (same letter + octave).
 */
export function autoAccidentals(measures, fifths) {
  const sig = signatureMap(fifths === null ? keyFromFifths(0) : keyFromFifths(fifths));
  return measures.map((m) => {
    const state = {};
    return m.notes.map((n) => {
      if (n.rest) return [];
      return toKeys(n).map((p, i) => {
        if (n.showAcc && n.showAcc[i] !== undefined) return n.showAcc[i];
        const k = p.letter + p.octave;
        const cur = k in state ? state[k] : sig[p.letter];
        const tiedIn = n.tiedFromPrev;
        state[k] = p.acc;
        if (tiedIn) return false;
        return cur !== p.acc;
      });
    });
  });
}

function toKeys(n) {
  const ks = Array.isArray(n.keys) ? n.keys : n.keys ? [n.keys] : [];
  // Every drawn pitch must say its octave; a missing one is a bug, never a default.
  for (const k of ks) if (typeof k === 'string' && !/\d/.test(k)) throw new Error(`Pitch "${k}" has no octave`);
  return ks.map(P);
}

function normaliseSpec(spec) {
  const measures = spec.measures || [{ notes: spec.notes || [] }];
  return {
    clef: spec.clef || 'treble',
    fifths: keyFifths(spec.key),
    time: spec.time || null,
    measures,
    scale: spec.scale || 1.25,
    endBar: spec.endBar || (spec.free ? 'single' : 'end'),
    free: Boolean(spec.free),
    minNoteWidth: spec.noteWidth || 46,
    showClef: spec.showClef !== false,
    beamGroups: spec.beamGroups || null,
    padding: spec.padding ?? 10,
    height: spec.height || null,
    labelsBelow: Boolean(spec.labelsBelow),
    width: spec.width || null,
    noBarlines: Boolean(spec.noBarlines),
  };
}

function beamGroupsFor(VF, time, override) {
  if (override) return override.map((g) => new VF.Fraction(g[0], g[1]));
  if (!time) return [new VF.Fraction(1, 4)];
  const { top, bottom } = parseTime(time);
  const c = classifyTime(time);
  if (c.kind === 'compound') return [new VF.Fraction(3, bottom)];
  if (c.kind === 'irregular') return IRREGULAR_GROUPINGS[top][0].map((g) => new VF.Fraction(g, bottom));
  if (bottom === 8) return [new VF.Fraction(top === 4 ? 2 : top, 8)];
  if (bottom === 2) return [new VF.Fraction(1, 4)];
  return [new VF.Fraction(1, bottom)];
}

/**
 * Render music into `container`. Returns geometry and metadata for checks and
 * for interactive questions.
 *
 * spec: { clef, key (fifths number or key object), time, measures: [{notes}] | notes,
 *         free (no time signature, plain notes), scale, endBar, beamGroups }
 * note: { keys: 'C#4' | ['C4','E4'], dur: 'q'|'8'|'w'|..., dots, rest, tie,
 *         tuplet: { id, num, occupied }, art: ['staccato'], orn: 'trill', text,
 *         label (text under the note), color, showAcc: [bool], grace: [keys] }
 */
export async function renderMusic(container, spec) {
  if (spec.grand) return renderGrand(container, spec);
  const VF = await notationReady();
  const s = normaliseSpec(spec);
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam, Dot, Tuplet, StaveTie, Articulation, Ornament, Annotation, GraceNote, GraceNoteGroup } = VF;

  container.textContent = '';
  container.classList.add('stave');
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  const ctx = renderer.getContext();

  const accMap = autoAccidentals(s.measures, s.fifths);
  const built = [];
  const allNotes = [];
  const tieList = [];

  s.measures.forEach((m, mi) => {
    const vexNotes = m.notes.map((n, ni) => {
      const dur = VEX_DUR[n.dur || 'w'] || n.dur || 'w';
      const dots = n.dots || 0;
      const keys = n.rest ? [n.restKey || REST_KEY[s.clef]] : toKeys(n).map(vexKey);
      const sn = new StaveNote({ keys, duration: dur + (n.rest ? 'r' : ''), clef: s.clef, dots, auto_stem: true, autoStem: true, align_center: n.rest && n.wholeBar, alignCenter: n.rest && n.wholeBar });
      if (n.stem === 'up') sn.setStemDirection(1);
      if (n.stem === 'down') sn.setStemDirection(-1);
      if (dots) Dot.buildAndAttach([sn], { all: true });
      if (!n.rest) {
        toKeys(n).forEach((p, ki) => {
          if (accMap[mi][ni][ki]) sn.addModifier(new Accidental(vexAcc(p.acc)), ki);
        });
      }
      for (const a of n.art || []) {
        if (!ART[a]) continue;
        const art = new Articulation(ART[a]);
        if (a === 'fermata' || a === 'pause') art.setPosition(3);
        sn.addModifier(art, 0);
      }
      if (n.orn && ORN[n.orn]) sn.addModifier(new Ornament(ORN[n.orn]), 0);
      if (n.text) sn.addModifier(new Annotation(n.text).setVerticalJustification(Annotation.VerticalJustify?.TOP ?? 1), 0);
      if (n.label) sn.addModifier(new Annotation(n.label).setVerticalJustification(Annotation.VerticalJustify?.BOTTOM ?? 3).setFont('Academico', 11), 0);
      if (n.grace && n.grace.length) {
        const gn = n.grace.map((g) => {
          const gp = P(g.keys || g);
          const note = new GraceNote({ keys: [vexKey(gp)], duration: g.dur || '8', slash: Boolean(g.slash ?? true), clef: s.clef });
          if (g.showAcc) note.addModifier(new Accidental(vexAcc(gp.acc)), 0);
          return note;
        });
        sn.addModifier(new GraceNoteGroup(gn, Boolean(n.graceSlur)), 0);
      }
      if (n.color) sn.setStyle({ fillStyle: n.color, strokeStyle: n.color });
      sn.setAttribute?.('id', `n${mi}-${ni}`);
      sn.__spec = n;
      sn.__m = mi; sn.__n = ni;
      return sn;
    });
    built.push({ m, vexNotes });
    allNotes.push(...vexNotes);
  });
  // Ties (can cross barlines).
  for (let i = 0; i < allNotes.length - 1; i++) {
    if (allNotes[i].__spec.tie) tieList.push([allNotes[i], allNotes[i + 1]]);
  }

  // Layout: measure widths from content.
  const x0 = s.padding;
  // Vertical fit: find the highest and lowest things on the stave.
  let topPos = 9, botPos = -1;
  for (const n of allNotes) {
    const sp = n.__spec;
    if (sp.rest) continue;
    const ps = toKeys(sp).map((p) => staffPos(p, s.clef));
    const hi = Math.max(...ps), lo = Math.min(...ps);
    const stemmed = !['w', '1/2'].includes(VEX_DUR[sp.dur || 'w']);
    const up = stemmed && (sp.stem === 'up' || (sp.stem !== 'down' && (hi + lo) / 2 < 4));
    topPos = Math.max(topPos, hi + 2 + (up ? 6 : 0) + (sp.orn || sp.text || sp.art?.length || sp.tuplet ? 4 : 0));
    botPos = Math.min(botPos, lo - 2 - (stemmed && !up ? 6 : 0) - (sp.art?.length ? 2 : 0));
  }
  if (spec.range) { topPos = Math.max(topPos, spec.range[1] + 1); botPos = Math.min(botPos, spec.range[0] - 1); }
  const anyLabelsEarly = allNotes.some((n) => n.__spec.label);
  const topLineTarget = 8 + (topPos - 8) * 5;
  const y0 = Math.max(0, topLineTarget - 40);
  const lineHeight = Math.ceil(40 + Math.max(0, topPos - 8) * 5 + (-botPos) * 5 + 30 + (anyLabelsEarly ? 22 : 0));

  // Measure widths (content only), then pack into lines.
  const contentWidths = built.map(({ m, vexNotes }) => {
    // Each note needs room for itself and for any label written under or over it.
    const perNote = vexNotes.map((vn) => Math.max(s.minNoteWidth, ((vn.__spec.label || '').length * 7.2) + 14, ((vn.__spec.text || '').length * 6) + 10));
    let w = Math.max(s.free ? 60 : 90, perNote.reduce((a, b) => a + b, 0) + 24);
    w += vexNotes.reduce((acc, n) => acc + (n.getModifiers().filter((md) => md.getCategory?.() === 'Accidental').length ? 12 : 0) + (n.__spec.grace ? 26 : 0), 0);
    return m.width || w;
  });
  const modWidthFor = (first, mi) => {
    const st = new Stave(0, 0, 100);
    if (first) {
      if (s.showClef) st.addClef(s.clef);
      if (s.fifths !== null && s.fifths !== 0) st.addKeySignature(vexKeySigName(s.fifths));
      if (mi === 0 && s.time && !s.free) st.addTimeSignature(s.time);
    }
    if (built[mi].m.time) st.addTimeSignature(built[mi].m.time);
    return st.getNoteStartX();
  };
  const maxW = spec.maxWidth || 1e9;
  const lines = [];
  let cur = [], curW = 0;
  built.forEach((_, mi) => {
    const w = modWidthFor(cur.length === 0, mi) + contentWidths[mi];
    if (cur.length && curW + w > maxW) { lines.push(cur); cur = []; curW = 0; }
    const w2 = modWidthFor(cur.length === 0, mi) + contentWidths[mi];
    cur.push(mi); curW += w2;
  });
  if (cur.length) lines.push(cur);
  const wrapped = lines.length > 1;

  const staves = [];
  const formatted = [];
  let totalW = 0;
  lines.forEach((line, li) => {
    const natural = line.reduce((acc, mi, j) => acc + modWidthFor(j === 0, mi) + contentWidths[mi], 0);
    const stretch = wrapped && (li < lines.length - 1 || natural > maxW * 0.7) ? (maxW - natural) / line.reduce((acc, mi) => acc + contentWidths[mi], 0) : 0;
    let x = x0;
    const y = y0 + li * lineHeight;
    line.forEach((mi, j) => {
      const { m, vexNotes } = built[mi];
      const stave = new Stave(x, y, 100);
      if (j === 0) {
        if (s.showClef) stave.addClef(s.clef);
        if (s.fifths !== null && s.fifths !== 0) stave.addKeySignature(vexKeySigName(s.fifths));
        if (mi === 0 && s.time && !s.free) stave.addTimeSignature(s.time);
      }
      if (m.time) stave.addTimeSignature(m.time);
      if (s.noBarlines || (s.free && mi < built.length - 1)) stave.setEndBarType(VF.Barline.type.NONE);
      if (mi === built.length - 1) {
        const t = { single: VF.Barline.type.SINGLE, double: VF.Barline.type.DOUBLE, end: VF.Barline.type.END, none: VF.Barline.type.NONE }[s.endBar];
        stave.setEndBarType(t);
      }
      if (j > 0) stave.setBegBarType(VF.Barline.type.NONE);
      if (m.begRepeat) stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      if (m.endRepeat) stave.setEndBarType(VF.Barline.type.REPEAT_END);
      const modWidth = stave.getNoteStartX() - x;
      let contentW = contentWidths[mi] * (1 + Math.max(0, stretch));
      stave.setWidth(modWidth + contentW);
      staves.push(stave);
      x += modWidth + contentW;
      formatted.push({ stave, vexNotes, contentW, m, line: li });
      for (const n of vexNotes) n.__line = li;
    });
    totalW = Math.max(totalW, x + s.padding);
  });

  if (s.width && s.width > totalW && !wrapped) {
    // Stretch the last stave to the requested width.
    const last = formatted[formatted.length - 1];
    const extra = s.width - totalW;
    last.stave.setWidth(last.stave.getWidth() + extra);
    last.contentW += extra;
    totalW = s.width;
  }
  const bottomLineY = y0 + 80 + (lines.length - 1) * lineHeight;
  const height = s.height || Math.ceil(bottomLineY + (-botPos) * 5 + 10 + (anyLabelsEarly ? 22 : 0));
  renderer.resize(totalW * s.scale, height * s.scale);
  ctx.scale(s.scale, s.scale);

  const beams = [];
  const tuplets = [];
  for (const f of formatted) {
    f.stave.setContext(ctx).draw();
    if (!f.vexNotes.length) continue;
    // Tuplets
    const groups = {};
    f.vexNotes.forEach((n) => { const t = n.__spec.tuplet; if (t) (groups[t.id] = groups[t.id] || { t, notes: [] }).notes.push(n); });
    for (const g of Object.values(groups)) {
      tuplets.push(new Tuplet(g.notes, { num_notes: g.t.num, numNotes: g.t.num, notes_occupied: g.t.occupied, notesOccupied: g.t.occupied, ratioed: false, bracketed: g.t.bracketed ?? true }));
    }
    const voice = new Voice({ num_beats: 4, beat_value: 4, numBeats: 4, beatValue: 4 });
    voice.setMode(Voice.Mode.SOFT);
    voice.addTickables(f.vexNotes);
    // Beams: explicit groups by beam id, else auto.
    const explicit = {};
    // Only quavers and shorter can be beamed; a beam id on a longer note is ignored.
    f.vexNotes.forEach((n) => { const b = n.__spec.beam; if (b !== undefined && b !== null && b !== false && ['8', '16', '32'].includes(n.__spec.dur)) (explicit[b] = explicit[b] || []).push(n); });
    if (Object.keys(explicit).length) {
      for (const list of Object.values(explicit)) if (list.length > 1) beams.push(new Beam(list));
    } else if (!s.free && !f.m.noBeams) {
      const groupsFr = beamGroupsFor(VF, s.time, f.m.beamGroups || s.beamGroups);
      beams.push(...Beam.generateBeams(f.vexNotes.filter((n) => !n.__spec.noBeam), { groups: groupsFr, beam_rests: false, beamRests: false, maintain_stem_directions: false }));
    }
    new Formatter().joinVoices([voice]).format([voice], f.contentW - 20);
    voice.draw(ctx, f.stave);
  }
  beams.forEach((b) => b.setContext(ctx).draw());
  tuplets.forEach((t) => t.setContext(ctx).draw());
  for (const [a, b] of tieList) {
    new StaveTie({ first_note: a, last_note: b, firstNote: a, lastNote: b, first_indices: [0], last_indices: [0], firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw();
  }

  const svgEl = container.querySelector('svg');
  svgEl.setAttribute('role', 'img');
  // Fit the drawing to its ink so nothing is clipped and there is no dead space.
  let vbX = 0, vbY = 0, vbW = totalW, vbH = height;
  if (spec.fit !== false) {
    const b = inkBounds(svgEl);
    vbY = Math.floor(Math.min(b.top - 6, geometry0(staves[0]).topLineY - 14));
    const bottom = Math.ceil(Math.max(b.bottom + 6, geometry0(staves[staves.length - 1]).bottomLineY + 14));
    vbH = bottom - vbY;
    vbX = Math.floor(Math.min(0, b.left - 4));
    vbW = Math.ceil(Math.max(totalW, b.right + 4)) - vbX;
    svgEl.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
    svgEl.setAttribute('width', vbW * s.scale);
    svgEl.setAttribute('height', vbH * s.scale);
    svgEl.style.width = `${vbW * s.scale}px`;
    svgEl.style.height = `${vbH * s.scale}px`;
  }
  if (spec.ariaLabel) svgEl.setAttribute('aria-label', spec.ariaLabel);
  const first = staves[0];
  const geometry = {
    scale: s.scale,
    topLineY: first.getYForLine(0),
    bottomLineY: first.getYForLine(4),
    spacing: first.getSpacingBetweenLines(),
    noteStartX: first.getNoteStartX(),
    endX: staves[staves.length - 1].getX() + staves[staves.length - 1].getWidth(),
    width: vbW,
    height: vbH,
    viewBox: [vbX, vbY, vbW, vbH],
    lines: lines.map((line) => { const st = staves[formatted.findIndex((f) => f.line === lines.indexOf(line))]; return { topLineY: st.getYForLine(0), bottomLineY: st.getYForLine(4) }; }),
  };
  /** y (unscaled) for a staff position (0 = bottom line). */
  geometry.yForPos = (pos) => geometry.bottomLineY - pos * geometry.spacing / 2;
  geometry.posForY = (y) => Math.round((geometry.bottomLineY - y) / (geometry.spacing / 2));

  const info = {
    clef: s.clef, fifths: s.fifths, time: s.time, geometry, svg: svgEl,
    notes: allNotes.map((n) => ({ spec: n.__spec, m: n.__m, n: n.__n, line: n.__line || 0, x: n.getAbsoluteX(), positions: n.__spec.rest ? [] : toKeys(n.__spec).map((p) => staffPos(p, s.clef)) })),
    accidentals: accMap,
  };
  container.__music = info;
  container.dataset.music = JSON.stringify({ clef: s.clef, fifths: s.fifths, time: s.time, notes: info.notes.map((n) => ({ keys: n.spec.rest ? [] : toKeys(n.spec).map((p) => p.letter + p.acc + '/' + p.octave), rest: Boolean(n.spec.rest), acc: n.spec.rest ? [] : accMap[n.m][n.n] })) });
  return info;
}

function geometry0(st) { return { topLineY: st.getYForLine(0), bottomLineY: st.getYForLine(4) }; }

/** Convenience: draw music into a new <div> and return it. */
export function staveEl(spec, { caption } = {}) {
  const wrap = document.createElement('figure');
  wrap.className = 'music';
  const div = document.createElement('div');
  wrap.append(div);
  if (caption) {
    const cap = document.createElement('figcaption');
    cap.className = 'stave-caption';
    cap.textContent = caption;
    wrap.append(cap);
  }
  wrap.ready = renderMusic(div, spec).catch((e) => { div.textContent = 'Could not draw music: ' + e.message; console.error(e); });
  return wrap;
}

let measureCtx = null;
/** Ink bounds (user units) of everything drawn: real glyph extents via canvas text metrics. */
export function inkBounds(svg) {
  measureCtx = measureCtx || document.createElement('canvas').getContext('2d');
  const b = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
  const grow = (l, r, t, bt) => { b.left = Math.min(b.left, l); b.right = Math.max(b.right, r); b.top = Math.min(b.top, t); b.bottom = Math.max(b.bottom, bt); };
  for (const el of svg.querySelectorAll('path, rect')) {
    if (el.getAttribute('opacity') === '0') continue;
    const bb = el.getBBox();
    if (!bb.width && !bb.height) continue;
    grow(bb.x, bb.x + bb.width, bb.y, bb.y + bb.height);
  }
  for (const t of svg.querySelectorAll('text')) {
    const txt = (t.textContent || '').replace(/\u00a0/g, '');
    if (!txt.trim()) continue;
    const fam = t.getAttribute('font-family') || t.closest('[font-family]')?.getAttribute('font-family') || 'Bravura';
    const size = t.getAttribute('font-size') || t.closest('[font-size]')?.getAttribute('font-size') || '10pt';
    measureCtx.font = `${size} ${fam}`;
    const m = measureCtx.measureText(txt);
    const x = parseFloat(t.getAttribute('x')) || 0, y = parseFloat(t.getAttribute('y')) || 0;
    grow(x - m.actualBoundingBoxLeft, x + m.actualBoundingBoxRight, y - m.actualBoundingBoxAscent, y + m.actualBoundingBoxDescent);
  }
  return b;
}

/**
 * Grand stave (treble + bass joined by a brace), one line of music, as used for
 * chords, cadences and piano-style examples. spec: { grand: true, key, time,
 * upper: [{notes}], lower: [{notes}], scale } — upper and lower have the same
 * number of bars and matching rhythms per bar.
 */
export async function renderGrand(container, spec) {
  const VF = await notationReady();
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Dot, StaveConnector, Beam } = VF;
  const fifths = keyFifths(spec.key);
  const scale = spec.scale || 1.15;
  const parts = [{ clef: spec.upperClef || 'treble', measures: spec.upper, mOffset: 0 }, { clef: spec.lowerClef || 'bass', measures: spec.lower, mOffset: 100 }];
  container.textContent = '';
  container.classList.add('stave');
  const renderer = new Renderer(container, Renderer.Backends.SVG);
  const ctx = renderer.getContext();
  const acc = {};
  const built = parts.map((part) => {
    const map = autoAccidentals(part.measures, fifths);
    return part.measures.map((m, mi) => m.notes.map((n, ni) => {
      const dur = VEX_DUR[n.dur || 'w'] || n.dur;
      const keys = n.rest ? [REST_KEY[part.clef]] : toKeys(n).map(vexKey);
      const sn = new StaveNote({ keys, duration: dur + (n.rest ? 'r' : ''), clef: part.clef, dots: n.dots || 0, autoStem: true, auto_stem: true });
      if (n.stem === 'up') sn.setStemDirection(1);
      if (n.stem === 'down') sn.setStemDirection(-1);
      if (n.dots) Dot.buildAndAttach([sn], { all: true });
      if (!n.rest) toKeys(n).forEach((p, ki) => { if (map[mi][ni][ki]) sn.addModifier(new Accidental(vexAcc(p.acc)), ki); });
      for (const a of n.art || []) if (ART[a]) sn.addModifier(new VF.Articulation(ART[a]), 0);
      if (n.orn && ORN[n.orn]) sn.addModifier(new VF.Ornament(ORN[n.orn]), 0);
      if (n.text) sn.addModifier(new VF.Annotation(n.text).setVerticalJustification(VF.Annotation.VerticalJustify?.TOP ?? 1), 0);
      if (n.color) sn.setStyle({ fillStyle: n.color, strokeStyle: n.color });
      const m = mi + part.mOffset;
      sn.setAttribute?.('id', `n${m}-${ni}`);
      sn.__spec = n; sn.__m = m; sn.__n = ni; sn.__clef = part.clef;
      (acc[m] = acc[m] || [])[ni] = map[mi][ni];
      return sn;
    }));
  });
  const nBars = spec.upper.length;
  const x0 = 24; // room for the brace, which VexFlow draws to the left of the staves
  const yTop = 30, gap = 110;
  // Bar widths from the busier staff.
  const widths = Array.from({ length: nBars }, (_, mi) => Math.max(110, Math.max(built[0][mi].length, built[1][mi].length) * (spec.noteWidth || 62) + 30));
  const top = [], bot = [];
  let x = x0;
  for (let mi = 0; mi < nBars; mi++) {
    const t = new Stave(x, yTop, 100), b = new Stave(x, yTop + gap, 100);
    if (mi === 0) {
      t.addClef(parts[0].clef); b.addClef(parts[1].clef);
      if (fifths) { t.addKeySignature(vexKeySigName(fifths)); b.addKeySignature(vexKeySigName(fifths)); }
      if (spec.time) { t.addTimeSignature(spec.time); b.addTimeSignature(spec.time); }
    }
    const mod = Math.max(t.getNoteStartX(), b.getNoteStartX()) - x;
    t.setNoteStartX(x + mod); b.setNoteStartX(x + mod);
    t.setWidth(mod + widths[mi]); b.setWidth(mod + widths[mi]);
    if (mi === nBars - 1) { t.setEndBarType(spec.free ? VF.Barline.type.SINGLE : VF.Barline.type.END); b.setEndBarType(spec.free ? VF.Barline.type.SINGLE : VF.Barline.type.END); }
    if (spec.free && mi < nBars - 1) { t.setEndBarType(VF.Barline.type.NONE); b.setEndBarType(VF.Barline.type.NONE); }
    if (mi > 0) { t.setBegBarType(VF.Barline.type.NONE); b.setBegBarType(VF.Barline.type.NONE); }
    top.push({ st: t, w: widths[mi] }); bot.push({ st: b, w: widths[mi] });
    x += mod + widths[mi];
  }
  const totalW = x + 10;
  const height = yTop + gap + 120;
  renderer.resize(totalW * scale, height * scale);
  ctx.scale(scale, scale);
  top.forEach((o) => o.st.setContext(ctx).draw());
  bot.forEach((o) => o.st.setContext(ctx).draw());
  new StaveConnector(top[0].st, bot[0].st).setType(StaveConnector.type.BRACE).setContext(ctx).draw();
  new StaveConnector(top[0].st, bot[0].st).setType(StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
  const lastT = top[nBars - 1].st, lastB = bot[nBars - 1].st;
  new StaveConnector(lastT, lastB).setType(spec.free ? StaveConnector.type.SINGLE_RIGHT : StaveConnector.type.BOLD_DOUBLE_RIGHT).setContext(ctx).draw();
  const beams = [];
  for (let mi = 0; mi < nBars; mi++) {
    const vt = new Voice({ numBeats: 4, beatValue: 4, num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(built[0][mi]);
    const vb = new Voice({ numBeats: 4, beatValue: 4, num_beats: 4, beat_value: 4 }).setMode(Voice.Mode.SOFT).addTickables(built[1][mi]);
    if (spec.time && !spec.free) for (const list of [built[0][mi], built[1][mi]]) beams.push(...Beam.generateBeams(list, { groups: beamGroupsFor(VF, spec.time, null) }));
    new Formatter().joinVoices([vt]).joinVoices([vb]).format([vt, vb], widths[mi] - 24);
    vt.draw(ctx, top[mi].st); vb.draw(ctx, bot[mi].st);
  }
  beams.forEach((bm) => bm.setContext(ctx).draw());
  const svgEl = container.querySelector('svg');
  svgEl.setAttribute('role', 'img');
  if (spec.ariaLabel) svgEl.setAttribute('aria-label', spec.ariaLabel);
  let vb2 = [0, 0, totalW, height];
  if (spec.fit !== false) {
    const bb = inkBounds(svgEl);
    const vy = Math.floor(Math.min(bb.top - 6, top[0].st.getYForLine(0) - 14));
    const bottom = Math.ceil(Math.max(bb.bottom + 6, bot[0].st.getYForLine(4) + 14));
    const vx = Math.floor(Math.min(0, bb.left - 4));
    const vw = Math.ceil(Math.max(totalW, bb.right + 4)) - vx;
    vb2 = [vx, vy, vw, bottom - vy];
    svgEl.setAttribute('viewBox', vb2.join(' '));
    svgEl.setAttribute('width', vw * scale); svgEl.setAttribute('height', vb2[3] * scale);
    svgEl.style.width = `${vw * scale}px`; svgEl.style.height = `${vb2[3] * scale}px`;
  }
  const t0 = top[0].st, b0 = bot[0].st;
  const geometry = {
    scale, topLineY: t0.getYForLine(0), bottomLineY: t0.getYForLine(4), spacing: t0.getSpacingBetweenLines(),
    noteStartX: t0.getNoteStartX(), width: vb2[2], height: vb2[3], viewBox: vb2,
    lines: [{ topLineY: t0.getYForLine(0), bottomLineY: t0.getYForLine(4), clef: parts[0].clef }, { topLineY: b0.getYForLine(0), bottomLineY: b0.getYForLine(4), clef: parts[1].clef }],
  };
  geometry.yForPos = (pos) => geometry.bottomLineY - pos * geometry.spacing / 2;
  geometry.posForY = (y) => Math.round((geometry.bottomLineY - y) / (geometry.spacing / 2));
  const all = [...built[0].flat(), ...built[1].flat()];
  const info = {
    clef: parts[0].clef, fifths, time: spec.time || null, geometry, svg: svgEl, grand: true,
    notes: all.map((n) => ({ spec: n.__spec, m: n.__m, n: n.__n, line: n.__m >= 100 ? 1 : 0, x: n.getAbsoluteX(), positions: n.__spec.rest ? [] : toKeys(n.__spec).map((p) => staffPos(p, n.__clef)) })),
    accidentals: acc,
  };
  container.__music = info;
  return info;
}
