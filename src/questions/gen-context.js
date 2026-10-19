// Section 7: Music in context. An original short extract plus several questions
// about it, all computed from the extract's data.
import { parse, name, toString, staffPos, midi, wordName } from '../theory/pitch.js';
import { GRADE5_KEYS, keyName, scale, relative, keyScale, DEGREE_NAMES, signature } from '../theory/keys.js';
import { between, intervalName } from '../theory/interval.js';
import { triad, chordLabel } from '../theory/chords.js';
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
    const st = [
      { text: `The highest note appears in bar ${highBars[0]}.`, answer: true },
      { text: `The highest note appears in bar ${wrongBar}.`, answer: false },
      { text: `The lowest note is ${name(lowest.p)}.`, answer: true },
      { text: 'The extract contains a dotted note.', answer: hasDotted },
      { text: `The leading note (${name(leading)}) appears in the extract.`, answer: hasLeading },
      { text: `Some notes in bar ${ex.artBar + 1} are to be played ${artWord}.`, answer: true },
      { text: `The extract ends on the dominant.`, answer: false },
      { text: `The extract ends on the tonic.`, answer: true },
      { text: `The extract is written in the ${ex.clef} clef.`, answer: true },
      { text: `The extract is written in the ${r.pick(['treble', 'bass', 'alto', 'tenor'].filter((c) => c !== ex.clef))} clef.`, answer: false },
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

export const CONTEXT_TOPICS = [
  { id: 'x-context', section: 7, title: 'Music in context', gens: [genContext] },
];

void staffPos; void wordName; void keyScale;
