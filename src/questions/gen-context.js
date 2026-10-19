// Section 7: Music in context. An original short extract plus several questions
// about it, all computed from the extract's data.
import { parse, name, toString, staffPos, midi, wordName } from '../theory/pitch.js';
import { GRADE5_KEYS, keyName, scale, relative, keyScale, DEGREE_NAMES, signature, signatureMap } from '../theory/keys.js';
import { between, intervalName } from '../theory/interval.js';
import { triad, chordLabel, cadenceType, identifyChord, INVERSION_NAMES } from '../theory/chords.js';
import { fitChord } from './gen-chords.js';
import { toConcert, INSTRUMENT_KEYS } from '../theory/transpose.js';
import * as R from '../theory/rhythm.js';
import { TERMS, meaningsClash } from '../content/terms.js';
import { buildBar, explainTime } from './gen-rhythm.js';
import { mcq, trueFalse } from './util.js';
import { qualitiesFor } from './gen-intervals.js';

const SEC = 7;
const TEMPO_TERMS = TERMS.filter((t) => ['allegro', 'andante', 'moderato', 'adagio', 'allegretto', 'lento', 'largo', 'presto', 'vivace, vivo', 'andantino', 'larghetto', 'grave', 'lent', 'modéré', 'vite', 'langsam', 'lebhaft', 'mässig', 'schnell', 'ruhig', 'traurig', 'animé', 'maestoso', 'grazioso', 'con moto', 'con spirito', 'cantabile', 'dolce', 'tranquillo', 'giocoso', 'mesto', 'misterioso', 'leggiero', 'sostenuto (sost.)', 'cantando', 'sonoro', 'doloroso', 'pesante', 'semplice'].includes(t.term));
/** The term as printed on a score: first form only, no abbreviations in brackets. */
const shownTerm = (t) => t.replace(/ \(.*\)$/, '').split(',')[0].trim();
const INSTRUMENT_FOR = { treble: ['violin', 'flute', 'oboe'], bass: ['cello', 'bassoon'], alto: ['viola'], tenor: ['cello', 'bassoon'] };

/** Build a short original extract. Returns music spec plus facts about it. */
export function buildExtract(r, diff) {
  const k = r.pick(GRADE5_KEYS.filter((x) => (diff === 1 ? Math.abs(x.fifths) <= 2 : diff === 2 ? Math.abs(x.fifths) <= 4 : true)));
  const ts = r.pick(diff === 1 ? ['3/4', '4/4', '6/8', '2/4'] : ['3/4', '4/4', '6/8', '2/4', '9/8', '12/8', '2/2', '3/8']);
  const clef = r.pick(diff === 3 ? ['treble', 'bass', 'alto', 'treble'] : ['treble', 'treble', 'bass']);
  const oct = { treble: 4, bass: 2, alto: 3, tenor: 3 }[clef];
  const type = k.mode === 'major' ? 'major' : 'harmonic';
  const sc = [...scale(parse(k.tonic + oct), type).slice(0, 7), ...scale(parse(k.tonic + (oct + 1)), type)];
  const nBars = 6;
  const measures = [];
  let idx = r.pick([0, 2, 4]);
  // The arpeggio bar never takes the leading-note bar (bar 5), so minor extracts always show their raised 7th.
  const arpBar = r.int(1, 3);
  const chordDeg = r.pick([1, 4, 5]);
  const tempo = r.pick(TEMPO_TERMS);
  const dyn = r.pick(['p', 'mf', 'f', 'mp']);
  let ornBar = r.int(1, nBars - 2);
  for (let b = 0; b < nBars; b++) {
    let notes;
    if (b === nBars - 1) {
      // Final bar: tonic, one long note filling the bar where possible.
      const bar = R.barLength(ts);
      const nd = R.noteForDuration(bar);
      const durCode = { breve: '1/2', semibreve: 'w', minim: 'h', crotchet: 'q', quaver: '8' };
      notes = nd ? [{ keys: toString(sc[7]), dur: durCode[nd.id], dots: nd.dots }] : buildBar(r, ts).notes;
      if (!nd) notes.forEach((n) => { n.keys = toString(sc[7]); });
    } else if (b === arpBar) {
      // Needs at least three notes so the whole chord is outlined.
      for (let t = 0; t < 30; t++) { notes = buildBar(r, ts).notes; if (notes.filter((x) => !x.rest).length >= 3) break; }
      if (notes.filter((x) => !x.rest).length < 3) throw new Error('arpeggio bar too short');
      const tri = triad(k, chordDeg).map((p) => sc.find((s) => s.letter === p.letter && s.acc === p.acc) || sc[0]);
      let j = 0;
      notes.forEach((n) => { if (!n.rest) n.keys = toString(tri[j++ % 3]); });
    } else {
      notes = buildBar(r, ts).notes;
      for (const n of notes) {
        if (n.rest) continue;
        // Keep the tune within about a 10th of the tonic so it sits on the stave.
        idx = Math.max(0, Math.min(9, idx + r.pick([-1, 1, 1, -1, 2, -2, 0])));
        n.keys = toString(sc[idx]);
      }
      if (b === nBars - 2) {
        // Lead into the final tonic via the leading note.
        const last = notes.filter((n) => !n.rest).pop();
        last.keys = toString(sc[6]);
      }
    }
    measures.push({ notes });
  }
  // Tempo marking, dynamic and an ornament.
  measures[0].notes[0].text = shownTerm(tempo.term);
  if (k.mode === 'minor') {
    const lead = sc[6];
    const has = measures.some((m) => m.notes.some((x) => !x.rest && parse(x.keys).letter === lead.letter && parse(x.keys).acc === lead.acc));
    if (!has) throw new Error('minor extract without leading note');
  }
  const orn = r.pick(['trill', 'turn', 'upper mordent', 'lower mordent']);
  const ornNote = measures[ornBar].notes.find((n) => !n.rest && !n.text);
  if (ornNote) ornNote.orn = orn; else ornBar = -1;
  const art = r.pick(['staccato', 'accent', 'tenuto']);
  const artBar = (ornBar + 2) % (nBars - 1);
  measures[artBar].notes.filter((n) => !n.rest).slice(0, 2).forEach((n) => { n.art = [art]; });
  // Interval marks X and Y on two notes in the same bar.
  let ivBar = -1, xNote = null, yNote = null;
  for (const b of r.shuffle([0, 1, 2, 3, 4].filter((b) => b !== arpBar))) {
    const ns = measures[b].notes.filter((n) => !n.rest && !n.text && !n.orn);
    for (let i = 0; i < ns.length - 1; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const a = parse(ns[i].keys), c = parse(ns[j].keys);
        if (a.letter === c.letter && a.octave === c.octave) continue;
        const [lo, hi] = midi(a) <= midi(c) ? [a, c] : [c, a];
        let iv;
        try { iv = between(lo, hi); } catch { continue; }
        if (!iv.valid || iv.number < 2 || !qualitiesFor(iv.number).includes(iv.quality)) continue;
        xNote = ns[i]; yNote = ns[j]; ivBar = b; break;
      }
      if (xNote) break;
    }
    if (xNote) break;
  }
  if (xNote) { xNote.text = (xNote.text ? xNote.text + ' ' : '') + 'X'; yNote.text = 'Y'; }
  const music = { clef, key: k.fifths, time: ts, measures: measures.slice(0, 3), scale: 1 };
  const music2 = { clef, key: k.fifths, time: null, measures: measures.slice(3), scale: 1, showClef: true };
  return { k, ts, clef, measures, tempo, dyn, orn, ornBar, art, artBar, arpBar, chordDeg, xNote, yNote, ivBar, sc, music: { clef, key: k.fifths, time: ts, measures, scale: 0.95, maxWidth: 820 }, music1: music, music2 };
}

function allNotes(ex) {
  return ex.measures.flatMap((m, b) => m.notes.filter((n) => !n.rest).map((n) => ({ ...n, bar: b + 1, p: parse(n.keys) })));
}

export function genContext(r, diff, { all = false } = {}) {
  const ex = buildExtract(r, diff);
  const base = { section: SEC, topic: 'x-context', difficulty: diff, music: ex.music, contextId: `ctx-${Math.floor(r() * 1e9)}` };
  const intro = `Look at this extract${ex.clef !== 'treble' ? ` (${ex.clef} clef)` : ''}, then answer the question.`;
  const qs = [];
  const notes = allNotes(ex);

  // 1. Tempo term
  qs.push(() => mcq(r, { ...base, check: { kind: 'term' }, prompt: `${intro}\nWhat does "${shownTerm(ex.tempo.term)}" (at the start) mean?`, explanation: `${ex.tempo.term} means "${ex.tempo.meaning}".` },
    { label: ex.tempo.meaning }, TERMS.filter((t) => !meaningsClash(t.meaning, ex.tempo.meaning)).map((t) => ({ label: t.meaning }))));

  // 2. Key
  qs.push(() => mcq(r, { ...base, check: { kind: 'key', fifths: ex.k.fifths, mode: ex.k.mode }, prompt: `${intro}\nIn which key is this extract?`, explanation: `The key signature (${signature(ex.k).length} ${ex.k.fifths >= 0 ? 'sharp' : 'flat'}${signature(ex.k).length === 1 ? '' : 's'}) gives ${keyName(ex.k)} or ${keyName(relative(ex.k))}. ${ex.k.mode === 'minor' ? `The accidental ${name(ex.sc[6])} is the raised leading note of ${keyName(ex.k)}` : 'There is no raised leading note for the relative minor'}, and the extract ends on ${name(ex.sc[7])}.` },
    { label: keyName(ex.k) }, [{ label: keyName(relative(ex.k)) }, ...GRADE5_KEYS.filter((k2) => Math.abs(k2.fifths - ex.k.fifths) === 1).map((k2) => ({ label: keyName(k2) }))]));

  // 3. Interval X–Y
  if (ex.xNote) {
    const a = parse(ex.xNote.keys), c = parse(ex.yNote.keys);
    const [lo, hi] = midi(a) <= midi(c) ? [a, c] : [c, a];
    const iv = between(lo, hi);
    const ds = qualitiesFor(iv.number).filter((q) => q !== iv.quality).map((q) => ({ label: intervalName({ number: iv.number, quality: q }) }));
    for (const n of [iv.number - 1, iv.number + 1]) if (n >= 2 && n <= 15) ds.push({ label: intervalName({ number: n, quality: qualitiesFor(n)[0] }) });
    qs.push(() => mcq(r, { ...base, check: { kind: 'interval', low: toString(lo), high: toString(hi) }, prompt: `${intro}\nName the interval between the notes marked X and Y (bar ${ex.ivBar + 1}).`, explanation: `X is ${name(a)} and Y is ${name(c)} (remember the key signature). From ${name(lo)} up to ${name(hi)} is ${/^[ae]/.test(intervalName(iv)) ? 'an' : 'a'} ${intervalName(iv)}.`, listenAfter: { kind: 'interval', notes: [toString(lo), toString(hi)] } },
      { label: intervalName(iv) }, ds));
  }

  // 4. Time signature
  qs.push(() => {
    const c = R.classifyTime(ex.ts);
    const label = c.kind === 'irregular' ? 'irregular' : c.label;
    return mcq(r, { ...base, prompt: `${intro}\nDescribe the time signature.`, explanation: explainTime(ex.ts) },
      { label }, ['simple duple', 'simple triple', 'simple quadruple', 'compound duple', 'compound triple', 'compound quadruple'].filter((l) => l !== label).map((l) => ({ label: l })));
  });

  // 5. Chord outlined in the arpeggio bar
  qs.push(() => {
    const d = ex.chordDeg;
    const barNotes = ex.measures[ex.arpBar].notes.filter((x) => !x.rest).map((x) => parse(x.keys));
    const tri = triad(ex.k, d);
    if (!tri.every((t) => barNotes.some((p) => p.letter === t.letter && p.acc === t.acc))) return null;
    const ds = [1, 2, 4, 5].filter((x) => x !== d).map((x) => ({ label: chordLabel(x, 'a').replace(/a$/, '') }));
    return mcq(r, { ...base, prompt: `${intro}\nThe notes of bar ${ex.arpBar + 1} make up one chord. Which chord is it?`, explanation: `Bar ${ex.arpBar + 1} uses only ${triad(ex.k, d).map((p) => name(p)).join(', ')}: chord ${chordLabel(d, 'a')} in ${keyName(ex.k)}.` },
      { label: chordLabel(d, 'a') }, ds);
  });

  // 6. Ornament name
  if (ex.ornBar >= 0) {
    qs.push(() => mcq(r, { ...base, prompt: `${intro}\nWhat is the name of the ornament in bar ${ex.ornBar + 1}?`, explanation: `The sign in bar ${ex.ornBar + 1} is a${ex.orn.startsWith('u') ? 'n' : ''} ${ex.orn}.` },
      { label: ex.orn }, ['trill', 'turn', 'upper mordent', 'lower mordent', 'appoggiatura', 'acciaccatura'].filter((o) => o !== ex.orn).map((o) => ({ label: o }))));
  }

  // 7. Count a scale degree
  qs.push(() => {
    const deg = r.pick([1, 5, 3]);
    const target = ex.sc[deg - 1];
    const count = notes.filter((n) => n.p.letter === target.letter && n.p.acc === target.acc).length;
    return { ...base, type: 'number', prompt: `${intro}\nHow many times does the ${DEGREE_NAMES[deg - 1]} (${name(target)}) appear in this extract (in any octave)?`, numbers: [{ answer: count }], explanation: `The ${DEGREE_NAMES[deg - 1]} of ${keyName(ex.k)} is ${name(target)}. It appears ${count} time${count === 1 ? '' : 's'}.` };
  });

  // 8. True/false statements
  qs.push(() => {
    const highest = notes.reduce((a, b) => (midi(b.p) > midi(a.p) ? b : a));
    const lowest = notes.reduce((a, b) => (midi(b.p) < midi(a.p) ? b : a));
    const highBars = [...new Set(notes.filter((n) => midi(n.p) === midi(highest.p)).map((n) => n.bar))];
    const wrongBar = [1, 2, 3, 4, 5, 6].find((b) => !highBars.includes(b));
    const hasDotted = notes.some((n) => n.dots);
    const leading = ex.sc[6];
    const hasLeading = notes.some((n) => n.p.letter === leading.letter && n.p.acc === leading.acc);
    const artWord = { staccato: 'staccato (detached)', accent: 'accented', tenuto: 'held (tenuto)' }[ex.art];
    // Every fact has a true and a false version (or a computed truth), so no statement is always true.
    const nBars = ex.measures.length;
    const sig = signatureMap(ex.k);
    const barHasAcc = (b) => ex.measures[b].notes.some((x) => !x.rest && parse(x.keys).acc !== sig[parse(x.keys).letter]);
    const barHasRest = (b) => ex.measures[b].notes.some((x) => x.rest);
    const accBar = r.int(0, nBars - 1), restBar = r.int(0, nBars - 1);
    const otherLow = r.pick(ex.sc.slice(0, 7).filter((p) => !(p.letter === lowest.p.letter && p.acc === lowest.p.acc)));
    const firstIsTonic = notes[0].p.letter === ex.sc[0].letter && notes[0].p.acc === ex.sc[0].acc;
    const artBars = ex.measures.map((m, i) => (m.notes.some((x) => (x.art || []).includes(ex.art)) ? i : -1)).filter((i) => i >= 0);
    const noArtBar = [0, 1, 2, 3, 4, 5].find((i) => i < nBars && !artBars.includes(i));
    const otherArt = r.pick(['staccato (detached)', 'accented', 'held (tenuto)'].filter((w) => w !== artWord));
    const st = [
      { text: `The highest note appears in bar ${highBars[0]}.`, answer: true },
      { text: `The highest note appears in bar ${wrongBar}.`, answer: false },
      r.chance(0.5) ? { text: `The lowest note is ${name(lowest.p)}.`, answer: true } : { text: `The lowest note is ${name(otherLow)}.`, answer: false },
      { text: 'The extract contains a dotted note.', answer: hasDotted },
      (() => { const d = r.pick([2, 3, 4, 6]); const t = ex.sc[d - 1]; return { text: `The ${DEGREE_NAMES[d - 1]} (${name(t)}) appears in the extract.`, answer: notes.some((n) => n.p.letter === t.letter && n.p.acc === t.acc) }; })(),
      r.chance(0.5) ? { text: `Some notes in bar ${ex.artBar + 1} are to be played ${artWord}.`, answer: true } : { text: `Some notes in bar ${ex.artBar + 1} are to be played ${otherArt}.`, answer: false },
      ...(noArtBar !== undefined ? [{ text: `Some notes in bar ${noArtBar + 1} are to be played ${artWord}.`, answer: false }] : []),
      r.chance(0.5) ? { text: 'The extract ends on the tonic.', answer: true } : { text: `The extract ends on the ${r.pick(['dominant', 'subdominant', 'mediant'])}.`, answer: false },
      { text: 'The extract begins on the tonic.', answer: firstIsTonic },
      { text: `Bar ${accBar + 1} contains an accidental.`, answer: barHasAcc(accBar) },
      { text: `Bar ${restBar + 1} contains a dotted note.`, answer: ex.measures[restBar].notes.some((x) => !x.rest && x.dots) },
      r.chance(0.5) ? { text: `The extract is written in the ${ex.clef} clef.`, answer: true } : { text: `The extract is written in the ${r.pick(['treble', 'bass', 'alto', 'tenor'].filter((c) => c !== ex.clef))} clef.`, answer: false },
    ];
    return trueFalse(r, { ...base, prompt: `${intro}\nAre these statements true or false?`, explanation: `Highest note ${name(highest.p, true)} (bar ${highBars[0]}); lowest ${name(lowest.p, true)}. The extract is in ${keyName(ex.k)} and ends on the tonic.` }, st, 4);
  });

  // 9. Transposing instrument: written first note → sounding note
  qs.push(() => {
    const inst = r.pick(['Bb', 'A', 'F']);
    const first = notes[0].p;
    if (ex.clef !== 'treble') return null;
    const sounding = toConcert(first, inst);
    const ds = [toConcert(first, ['Bb', 'A', 'F'].find((x) => x !== inst)), parse(toString(first))].map((p) => ({ label: name(p, true) }));
    ds.push({ label: name({ ...sounding, octave: sounding.octave + 1 }, true) });
    const instName = { Bb: 'clarinet in B♭', A: 'clarinet in A', F: 'horn in F' }[inst];
    return mcq(r, { ...base, prompt: `${intro}\nIf this extract were played on a ${instName} (sounds ${INSTRUMENT_KEYS[inst].words} than written), what would the first note sound as?`, explanation: `The written first note is ${name(first, true)}. A ${instName} sounds ${INSTRUMENT_KEYS[inst].words}, so it sounds ${name(sounding, true)}.` },
      { label: name(sounding, true) }, ds.filter((d) => d.label !== name(sounding, true)));
  });

  const built = qs.map((f) => { try { return f(); } catch { return null; } }).filter(Boolean);
  return all ? built : r.pick(built);
}

// ---- Piano extracts: tune in the right hand, block chords in the left -------

const WHOLE_BAR = { '2/4': ['h', 0], '3/4': ['h', 1], '4/4': ['w', 0], '6/8': ['h', 1] };
const sameNote = (a, b) => a.letter === b.letter && a.acc === b.acc;

/**
 * A four-bar piano extract. Each bar has one left-hand chord (I, II, IV or V in
 * any position, chosen so the phrase makes sense) and a right-hand tune whose
 * first note in each bar belongs to that bar's chord. Ends with a perfect or
 * plagal cadence in bars 3–4.
 */
export function buildPianoExtract(r, diff) {
  const k = r.pick(GRADE5_KEYS.filter((x) => (diff === 1 ? Math.abs(x.fifths) <= 2 : diff === 2 ? Math.abs(x.fifths) <= 4 : true)));
  const ts = r.pick(diff === 1 ? ['2/4', '3/4', '4/4'] : ['2/4', '3/4', '4/4', '6/8']);
  // Minor keys always use V so the raised leading note appears.
  const bar3 = k.mode === 'minor' || r.chance(0.7) ? [5, 'a'] : [4, 'a'];
  const bar2 = bar3[0] === 5 ? r.pick([[4, 'a'], [4, 'b'], [2, 'b'], [2, 'a'], [1, 'c']]) : [1, 'b'];
  const prog = [[1, 'a'], bar2, bar3, [1, 'a']];
  const type = k.mode === 'major' ? 'major' : 'harmonic';
  // Scale over three octaves; the tune only uses notes from D4 to G5 so it sits on the treble stave.
  const sc = [3, 4, 5].flatMap((o) => scale(parse(k.tonic + o), type).slice(0, 7));
  const ok = (i) => i >= 0 && i < sc.length && midi(sc[i]) >= 62 && midi(sc[i]) <= 79;
  // Final tonic: one with the leading note and submediant below it also in range.
  const T = sc.map((p, i) => i).filter((i) => i % 7 === 0 && ok(i) && ok(i - 2)).pop();
  const [wd, wdots] = WHOLE_BAR[ts];
  const lower = prog.map(([d, inv]) => ({ notes: [{ keys: fitChord(k, d, inv, 'bass').map((p) => toString(p)), dur: wd, dots: wdots }] }));
  const upper = [];
  let idx = r.pick([T - 7, T - 5, T - 3, T].filter(ok));
  prog.forEach(([d], b) => {
    const tri = triad(k, d);
    const chordIdx = sc.map((p, i) => (tri.some((t) => sameNote(t, p)) && ok(i) ? i : -1)).filter((i) => i >= 0);
    const nearest = (from) => chordIdx.reduce((a, c) => (Math.abs(c - from) < Math.abs(a - from) ? c : a));
    if (b === 3) { upper.push({ notes: [{ keys: toString(sc[T]), dur: wd, dots: wdots }] }); return; }
    let notes;
    for (let t = 0; t < 20; t++) { notes = buildBar(r, ts).notes; if (notes.length >= 2 && notes.length <= 6) break; }
    notes.forEach((n, i) => {
      if (i === 0) idx = nearest(idx + r.pick([-1, 0, 1]));
      else { const next = idx + r.pick([-1, 1, 1, -1, 2, -2]); if (ok(next)) idx = next; else if (ok(idx - (next - idx))) idx -= next - idx; }
      n.keys = toString(sc[idx]);
      delete n.beam;
    });
    // Lead into the cadence: the last note of bar 3 belongs to its chord and sits just below the final tonic.
    if (b === 2) {
      idx = bar3[0] === 5 ? T - 1 : T - 2; // leading note (in V) or submediant (in IV)
      notes[notes.length - 1].keys = toString(sc[idx]);
    }
    upper.push({ notes });
  });
  upper[0].notes[0].text = shownTerm(r.pick(TEMPO_TERMS).term);
  const tempoText = upper[0].notes[0].text;
  const tempo = TEMPO_TERMS.find((t) => shownTerm(t.term) === tempoText);
  const art = r.pick(['staccato', 'accent', 'tenuto']);
  const artBar = r.int(0, 2);
  upper[artBar].notes.slice(-2).forEach((n) => { n.art = [art]; });
  // An ornament on a right-hand note away from the articulation.
  const orn = r.pick(['trill', 'turn', 'upper mordent', 'lower mordent']);
  const ornBar = [0, 1, 2].find((b) => b !== artBar && upper[b].notes.length >= 2 && !upper[b].notes[0].text);
  if (ornBar !== undefined) upper[ornBar].notes[0].orn = orn;
  const music = { grand: true, key: k.fifths, time: ts, upper, lower, scale: 0.95, noteWidth: 52 };
  return { k, ts, prog, upper, lower, tempo, art, artBar, orn, ornBar: ornBar ?? -1, sc, music };
}

export function genPianoContext(r, diff, { all = false } = {}) {
  const ex = buildPianoExtract(r, diff);
  const base = { section: SEC, topic: 'x-context', difficulty: diff, music: ex.music, contextId: `ctx-${Math.floor(r() * 1e9)}` };
  const intro = 'Look at this piano extract, then answer the question.';
  const qs = [];
  const rh = ex.upper.flatMap((m, b) => m.notes.map((n) => ({ ...n, bar: b + 1, p: parse(n.keys) })));
  const lhKeys = (b) => ex.lower[b].notes[0].keys;
  const chordQ = (b) => {
    const [d, inv] = ex.prog[b];
    const keys = lhKeys(b);
    const right = chordLabel(d, inv, { showA: true });
    const ds = [];
    for (const i2 of ['a', 'b', 'c']) if (i2 !== inv) ds.push({ label: chordLabel(d, i2, { showA: true }) });
    for (const d2 of [1, 2, 4, 5]) if (d2 !== d) ds.push({ label: chordLabel(d2, inv, { showA: true }) });
    const tri = triad(ex.k, d);
    return mcq(r, { ...base, check: { kind: 'chord', fifths: ex.k.fifths, mode: ex.k.mode, notes: keys }, listenAfter: { kind: 'chord', notes: keys },
      prompt: `${intro}\nName the chord played by the left hand in bar ${b + 1}. Use I, II, IV or V, with a, b or c for the position.`,
      explanation: `The left hand plays ${keys.map((x) => name(parse(x))).join(', ')} (lowest first). In ${keyName(ex.k)} these are the notes of chord ${ROMAN_OF(d)} (${tri.map((p) => name(p)).join('–')}). The lowest note is ${name(parse(keys[0]))}, the ${['root', '3rd', '5th'][['a', 'b', 'c'].indexOf(inv)]}, so it is ${INVERSION_NAMES[inv]}: ${right}.` },
    { label: right }, ds);
  };

  // 1. Key
  qs.push(() => mcq(r, { ...base, check: { kind: 'key', fifths: ex.k.fifths, mode: ex.k.mode }, prompt: `${intro}\nIn which key is this extract?`, explanation: `The key signature gives ${keyName(ex.k)} or ${keyName(relative(ex.k))}. ${ex.k.mode === 'minor' ? `The ${name(ex.sc[6])} is the raised leading note of ${keyName(ex.k)}` : 'There is no raised leading note for the relative minor'}, and both hands end on ${keyName(ex.k).split(' ')[0]} (chord I).` },
    { label: keyName(ex.k) }, [{ label: keyName(relative(ex.k)) }, ...GRADE5_KEYS.filter((k2) => Math.abs(k2.fifths - ex.k.fifths) === 1).map((k2) => ({ label: keyName(k2) }))]));
  // 2–3. Chords in bars 2 and 3
  qs.push(() => chordQ(1));
  qs.push(() => chordQ(2));
  // 4. Cadence (only in the cadence keys of the syllabus: C, G, D, F major)
  if (ex.k.mode === 'major' && ['C', 'G', 'D', 'F'].includes(ex.k.tonic)) {
    qs.push(() => {
      const t = cadenceType(ex.prog[2][0], ex.prog[3][0]);
      const why = { perfect: 'A perfect cadence is V–I.', plagal: 'A plagal cadence is IV–I.', imperfect: 'An imperfect cadence ends on V.' };
      return mcq(r, { ...base, check: { kind: 'cadence-name', fifths: ex.k.fifths, mode: ex.k.mode, chords: [lhKeys(2), lhKeys(3)] },
        prompt: `${intro}\nThe left-hand chords in bars 3 and 4 form a cadence. Which one?`,
        explanation: `Bar 3 is chord ${ROMAN_OF(ex.prog[2][0])} and bar 4 is chord I. ${why[t]}` },
      { label: `${t} cadence` }, ['perfect', 'plagal', 'imperfect'].filter((x) => x !== t).map((x) => ({ label: `${x} cadence`, why: why[x] })), 3);
    });
  }
  // 5. Interval between the hands at the start of a bar (often compound)
  qs.push(() => {
    const b = r.int(0, 3);
    const lo = parse(lhKeys(b)[0]), hi = parse(ex.upper[b].notes[0].keys);
    const iv = between(lo, hi);
    if (!iv.valid || iv.number >= 15 || !qualitiesFor(iv.number).includes(iv.quality)) return null;
    const ds = qualitiesFor(iv.number).filter((q) => q !== iv.quality).map((q) => ({ label: intervalName({ number: iv.number, quality: q }) }));
    for (const n of [iv.number - 1, iv.number + 1, iv.number - 7]) if (n >= 2 && n <= 15) ds.push({ label: intervalName({ number: n, quality: qualitiesFor(n)[0] }) });
    return mcq(r, { ...base, check: { kind: 'interval', low: toString(lo), high: toString(hi) }, listenAfter: { kind: 'interval', notes: [toString(lo), toString(hi)] },
      prompt: `${intro}\nName the interval between the lowest left-hand note and the right-hand note at the start of bar ${b + 1}.`,
      explanation: `The lowest left-hand note is ${name(lo, true)} and the right-hand note is ${name(hi, true)}. Count the letters from ${name(lo)} up to ${name(hi)} across both staves: ${intervalName(iv)}.` },
    { label: intervalName(iv) }, ds);
  });
  // 6. Tempo term
  if (ex.tempo) {
    qs.push(() => mcq(r, { ...base, check: { kind: 'term' }, prompt: `${intro}\nWhat does "${shownTerm(ex.tempo.term)}" (at the start) mean?`, explanation: `${ex.tempo.term} means "${ex.tempo.meaning}".` },
      { label: ex.tempo.meaning }, TERMS.filter((t) => !meaningsClash(t.meaning, ex.tempo.meaning)).map((t) => ({ label: t.meaning }))));
  }
  // 7. Time signature
  qs.push(() => {
    const label = R.classifyTime(ex.ts).label;
    return mcq(r, { ...base, prompt: `${intro}\nDescribe the time signature.`, explanation: explainTime(ex.ts) },
      { label }, ['simple duple', 'simple triple', 'simple quadruple', 'compound duple', 'compound triple', 'compound quadruple'].filter((l) => l !== label).map((l) => ({ label: l })));
  });
  // 8. Ornament
  if (ex.ornBar >= 0) {
    qs.push(() => mcq(r, { ...base, prompt: `${intro}\nWhat is the name of the ornament in bar ${ex.ornBar + 1}?`, explanation: `The sign in bar ${ex.ornBar + 1} is a${ex.orn.startsWith('u') ? 'n' : ''} ${ex.orn}.` },
      { label: ex.orn }, ['trill', 'turn', 'upper mordent', 'lower mordent', 'appoggiatura', 'acciaccatura'].filter((o) => o !== ex.orn).map((o) => ({ label: o }))));
  }
  // 9. Count notes in the right hand
  qs.push(() => {
    const b = r.int(0, 2);
    const n = ex.upper[b].notes.length;
    return { ...base, type: 'number', prompt: `${intro}\nHow many notes does the right hand play in bar ${b + 1}?`, numbers: [{ answer: n }], explanation: `Bar ${b + 1} of the right hand has ${n} note${n === 1 ? '' : 's'}.` };
  });
  // 10. True/false
  qs.push(() => {
    const chordName = (b) => chordLabel(ex.prog[b][0], ex.prog[b][1], { showA: true });
    const b1 = r.int(1, 2);
    const wrongChord = r.pick([1, 2, 4, 5].filter((d) => d !== ex.prog[b1][0]));
    const artWord = { staccato: 'staccato (detached)', accent: 'accented', tenuto: 'held (tenuto)' }[ex.art];
    const otherArt = r.pick(['staccato (detached)', 'accented', 'held (tenuto)'].filter((w) => w !== artWord));
    const lead = ex.sc[6];
    const bassBar = r.int(0, 3);
    const bassNote = parse(lhKeys(bassBar)[0]);
    const otherBass = r.pick(ex.sc.slice(0, 7).filter((p) => !sameNote(p, bassNote)));
    const anyInv = ex.prog.some(([, inv]) => inv !== 'a');
    const st = [
      r.chance(0.5) ? { text: `The left-hand chord in bar ${b1 + 1} is ${chordName(b1)}.`, answer: true } : { text: `The left-hand chord in bar ${b1 + 1} is ${ROMAN_OF(wrongChord)}${ex.prog[b1][1]}.`, answer: false },
      r.chance(0.5) ? { text: `The lowest note in bar ${bassBar + 1} is ${name(bassNote)}.`, answer: true } : { text: `The lowest note in bar ${bassBar + 1} is ${name(otherBass)}.`, answer: false },
      { text: 'Every left-hand chord is in root position.', answer: !anyInv },
      r.chance(0.5) ? { text: `Some right-hand notes in bar ${ex.artBar + 1} are to be played ${artWord}.`, answer: true } : { text: `Some right-hand notes in bar ${ex.artBar + 1} are to be played ${otherArt}.`, answer: false },
      { text: `The right hand plays the leading note (${name(lead)}).`, answer: rh.some((n) => sameNote(n.p, lead)) },
      { text: 'The right hand contains a dotted note.', answer: rh.some((n) => n.dots) },
      r.chance(0.5) ? { text: 'Both hands end on the tonic.', answer: true } : { text: `The right hand ends on the ${r.pick(['dominant', 'subdominant', 'mediant'])}.`, answer: false },
    ];
    return trueFalse(r, { ...base, prompt: `${intro}\nAre these statements true or false?`, explanation: `The left-hand chords are ${ex.prog.map((_, b) => chordName(b)).join(', ')} in ${keyName(ex.k)}.` }, st, 4);
  });

  const built = qs.map((f) => { try { return f(); } catch { return null; } }).filter(Boolean);
  // Sanity: every left-hand chord is what the progression says.
  ex.prog.forEach(([d, inv], b) => {
    const id = identifyChord(ex.k, lhKeys(b).map(parse));
    if (!id || id.degree !== d || id.inversion !== inv) throw new Error('piano extract chord mismatch');
  });
  return all ? built : r.pick(built);
}

const ROMAN_OF = (d) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][d - 1];

/** Either kind of extract: single-line melody (most) or piano (about 40%). */
export function genAnyContext(r, diff, opts) {
  return r.chance(0.4) ? genPianoContext(r, diff, opts) : genContext(r, diff, opts);
}

export const CONTEXT_TOPICS = [
  { id: 'x-context', section: 7, title: 'Music in context', gens: [genContext, genContext, genPianoContext] },
];

void staffPos; void wordName; void keyScale;
