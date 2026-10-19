// Section 3: Keys and scales.
import { parse, name, toString, pitch, midi, spellingsOf, staffPos, wordName, sameSpelling } from '../theory/pitch.js';
import { GRADE5_MAJOR, GRADE5_MINOR, GRADE5_KEYS, keyName, relative, signature, scale, melodicMinor, DEGREE_NAMES, keyFromFifths, chromaticScale, isValidChromatic, key, keyScale, signatureMap } from '../theory/keys.js';
import { mcq, trueFalse, aOrAn } from './util.js';

const SEC = 3;
const CLEF_LIST = ['treble', 'bass', 'alto', 'tenor'];
const OCT = { treble: 4, bass: 2, alto: 3, tenor: 3 };
const clefFor = (r, diff) => (diff === 1 ? r.pick(['treble', 'bass']) : diff === 2 ? r.pick(CLEF_LIST) : r.pick(['alto', 'tenor', 'alto', 'tenor', 'treble', 'bass']));
const keyPool = (diff, mode) => {
  const list = mode === 'major' ? GRADE5_MAJOR : mode === 'minor' ? GRADE5_MINOR : GRADE5_KEYS;
  if (diff === 1) return list.filter((k) => Math.abs(k.fifths) <= 3);
  if (diff === 2) return list.filter((k) => Math.abs(k.fifths) <= 5);
  return list.filter((k) => Math.abs(k.fifths) >= 3);
};
const sigWords = (k) => (k.fifths === 0 ? 'no sharps or flats' : `${Math.abs(k.fifths)} ${k.fifths > 0 ? 'sharp' : 'flat'}${Math.abs(k.fifths) > 1 ? 's' : ''} (${signature(k).map((s) => name(pitch(s.letter, s.acc))).join(', ')})`);
const sigMusic = (k, clef, scale_ = 1.15) => ({ clef, key: k.fifths, free: true, notes: [], scale: scale_ });

export function genKeySigName(r, diff) {
  const mode = r.pick(['major', 'minor']);
  const k = r.pick(keyPool(diff, mode).filter((x) => x.fifths !== 0));
  const clef = clefFor(r, diff);
  const ds = [];
  // Neighbouring keys, same-tonic other mode, relative of the other mode.
  for (const f of [k.fifths - 1, k.fifths + 1, -k.fifths, k.fifths + 2, k.fifths - 2]) {
    if (f >= -6 && f <= 6 && f !== k.fifths) ds.push({ label: keyName(keyFromFifths(f, mode)), why: `${keyName(keyFromFifths(f, mode))} has ${sigWords(keyFromFifths(f, mode))}.` });
  }
  ds.push({ label: keyName(relative(k)), why: `${keyName(relative(k))} has the same key signature, but the question asks for the ${mode} key.` });
  return mcq(r, {
    section: SEC, topic: 'k-signatures', difficulty: diff, sub: clef, tricky: ['alto', 'tenor'].includes(clef),
    prompt: `Which ${mode} key has this key signature?`,
    check: { kind: 'key', fifths: k.fifths, mode },
    music: sigMusic(k, clef, 1.3),
    explanation: `This key signature has ${sigWords(k)}, which is ${keyName(k)} (and its relative ${relative(k).mode}, ${keyName(relative(k))}). ${k.fifths > 0 ? 'Tip: for major keys, the last sharp is the leading note, so the key is a semitone above it.' : k.fifths < -1 ? 'Tip: for major keys with flats, the second-to-last flat is the key name.' : 'One flat (B♭) is F major or D minor.'}${mode === 'minor' ? ' For the minor key, find the major key first, then go down three semitones to its relative minor.' : ''}`,
  }, { label: keyName(k) }, ds.filter((d) => d.label !== keyName(relative(k)) || true));
}

export function genKeySigChoose(r, diff) {
  const mode = r.pick(['major', 'minor']);
  const k = r.pick(keyPool(diff, mode).filter((x) => x.fifths !== 0));
  const clef = clefFor(r, diff);
  const wrongFifths = [k.fifths - 1, k.fifths + 1, -k.fifths, k.fifths + (k.mode === 'minor' ? 3 : -3)].filter((f) => f >= -6 && f <= 6 && f !== k.fifths && f !== 0);
  const ds = wrongFifths.map((f) => {
    const wk = keyFromFifths(f, mode);
    return { label: '', music: sigMusic(wk, clef), key: String(f), aria: 'key signature', why: `This is the key signature of ${keyName(wk)} (${sigWords(wk)}).` };
  });
  return mcq(r, {
    section: SEC, topic: 'k-signatures', difficulty: diff, sub: clef, tricky: ['alto', 'tenor'].includes(clef),
    prompt: `Which is the correct key signature of ${keyName(k)} in the ${clef} clef?`,
    explanation: `${keyName(k)} has ${sigWords(k)}. ${k.mode === 'minor' ? `It shares this with its relative major, ${keyName(relative(k))}.` : ''} Sharps always go in the order F C G D A E B; flats in the order B E A D G C F.`,
  }, { label: '', music: sigMusic(k, clef), key: String(k.fifths), aria: 'key signature' }, ds);
}

/** Key signature in any clef: drag the tonic of the named mode onto the stave (any octave). */
export function genSigTonicPlace(r, diff) {
  const mode = r.pick(['major', 'minor']);
  const k = r.pick(keyPool(diff, mode).filter((x) => x.fifths !== 0));
  const clef = diff === 1 ? r.pick(['treble', 'bass']) : r.pick(['alto', 'tenor', 'alto', 'tenor', 'treble', 'bass']);
  // Show the answer in an octave that sits on the stave.
  let ans = parse(k.tonic + OCT[clef]);
  while (staffPos(ans, clef) > 8) ans = { ...ans, octave: ans.octave - 1 };
  while (staffPos(ans, clef) < 0) ans = { ...ans, octave: ans.octave + 1 };
  const rel = relative(k);
  return {
    section: SEC, topic: 'k-signatures', difficulty: diff, sub: clef, type: 'place', tricky: ['alto', 'tenor'].includes(clef),
    prompt: `This is the key signature of a ${mode} key in the ${clef} clef. Write its tonic (key note) on the stave, in any octave.`,
    place: { clef, fifths: k.fifths, anyOctave: true, accept: [toString(ans)], answerText: `${name(ans)} (any octave)` },
    explanation: `The key signature has ${sigWords(k)}: ${keyName(k)} (relative ${rel.mode}: ${keyName(rel)}). The tonic is ${name(ans)}.${ans.acc !== 0 ? ` The key signature already makes it ${name(ans)}, so no extra accidental is needed.` : ''} In the ${clef} clef ${name(ans)} sits ${staffPos(ans, clef) % 2 === 0 ? 'on a line' : 'in a space'}.`,
  };
}

export function genSigCount(r, diff) {
  const k = r.pick(keyPool(diff, null));
  return {
    section: SEC, topic: 'k-signatures', difficulty: diff,
    prompt: `How many ${k.fifths >= 0 ? 'sharps' : 'flats'} are there in the key signature of ${keyName(k)}?`,
    type: 'number', numbers: [{ answer: Math.abs(k.fifths) }],
    explanation: `${keyName(k)} has ${sigWords(k)}.${k.mode === 'minor' ? ` Its relative major is ${keyName(relative(k))}.` : ''}`,
  };
}

export function genRelative(r, diff) {
  const k = r.pick(keyPool(diff, null));
  const rel = relative(k);
  const ds = [];
  for (const f of [k.fifths + 1, k.fifths - 1, k.fifths + 3, k.fifths - 3]) if (f >= -6 && f <= 6) ds.push({ label: keyName(keyFromFifths(f, rel.mode)) });
  // Same tonic, other mode (common confusion).
  try { const par = key(k.tonic, rel.mode); if (Math.abs(par.fifths) <= 6) ds.push({ label: keyName(par), why: `${keyName(par)} has the same tonic (the "tonic ${rel.mode}"), not the same key signature.` }); } catch { /* not a listed key */ }
  return mcq(r, {
    section: SEC, topic: 'k-relative', difficulty: diff,
    prompt: `What is the relative ${rel.mode} of ${keyName(k)}?`,
    check: { kind: 'key', fifths: rel.fifths, mode: rel.mode },
    explanation: `Relative keys share a key signature (${sigWords(k)}). ${k.mode === 'major' ? 'The relative minor starts on the 6th note of the major scale (or count down three semitones).' : 'The relative major starts on the 3rd note of the minor scale (or count up three semitones).'} So it is ${keyName(rel)}.`,
  }, { label: keyName(rel) }, ds);
}

export function genDegree(r, diff) {
  const k = r.pick(keyPool(diff, null));
  const clef = clefFor(r, diff);
  const deg = r.int(1, 7);
  const sc = keyScale(k, OCT[clef]);
  const p = sc[deg - 1];
  const useSig = r.chance(0.6);
  if (r.chance(0.5)) {
    return mcq(r, {
      section: SEC, topic: 'k-degrees', difficulty: diff, sub: clef,
      prompt: `This note is in ${keyName(k)}. What is its technical name?`,
      music: { clef, key: useSig ? k.fifths : null, free: true, notes: [{ keys: toString(p), dur: 'w' }] },
      explanation: `In ${keyName(k)} the notes are ${sc.slice(0, 7).map((n) => name(n)).join(', ')}${k.mode === 'minor' ? ' (harmonic minor, with the raised 7th)' : ''}. ${name(p)} is degree ${deg}: the ${DEGREE_NAMES[deg - 1]}.`,
    }, { label: DEGREE_NAMES[deg - 1] }, DEGREE_NAMES.filter((d, i) => i !== deg - 1).map((d) => ({ label: d })));
  }
  const correct = name(p);
  const ds = [];
  for (let i = 0; i < 7; i++) if (i !== deg - 1) ds.push({ label: name(sc[i]), why: `${name(sc[i])} is the ${DEGREE_NAMES[i]}.` });
  if (deg === 7 && k.mode === 'minor') { const lowered = pitch(p.letter, p.acc - 1, p.octave); ds.push({ label: name(lowered), why: 'In a minor key the leading note is raised a semitone (harmonic minor).' }); }
  return mcq(r, {
    section: SEC, topic: 'k-degrees', difficulty: diff,
    prompt: `Which note is the ${DEGREE_NAMES[deg - 1]} of ${keyName(k)}?`,
    explanation: `The degrees are tonic (1), supertonic (2), mediant (3), subdominant (4), dominant (5), submediant (6) and leading note (7). In ${keyName(k)} the ${DEGREE_NAMES[deg - 1]} is ${correct}.`,
  }, { label: correct }, ds);
}

function scaleNotesFor(k, type, oct) {
  const t = parse(k.tonic + oct);
  if (type === 'melodic') return melodicMinor(t).slice(0, 8);
  return scale(t, type);
}

export function genScaleIdentify(r, diff) {
  const k = r.pick(keyPool(diff, null));
  const clef = clefFor(r, diff);
  const type = k.mode === 'major' ? 'major' : r.pick(['harmonic', 'melodic']);
  const notes = scaleNotesFor(k, type, OCT[clef]);
  const label = (kk, tp) => `${name(parse(kk.tonic))} ${tp === 'major' ? 'major' : tp === 'harmonic' ? 'harmonic minor' : 'melodic minor'}`;
  const correct = label(k, type);
  const ds = [];
  if (k.mode === 'minor') {
    ds.push({ label: label(k, type === 'harmonic' ? 'melodic' : 'harmonic'), why: type === 'harmonic' ? 'The melodic minor (going up) raises the 6th as well as the 7th.' : 'The harmonic minor only raises the 7th; here the 6th is raised too.' });
    ds.push({ label: label(relative(k), 'major'), why: `${keyName(relative(k))} uses the same key signature but starts on ${name(parse(relative(k).tonic))}.` });
    try { if (Math.abs(key(k.tonic, 'major').fifths) <= 6) ds.push({ label: label(key(k.tonic, 'major'), 'major'), why: `${name(parse(k.tonic))} major has a major 3rd above the tonic; this scale has a minor 3rd.` }); } catch { /* */ }
  } else {
    ds.push({ label: label(relative(k), 'harmonic'), why: `This scale starts and ends on ${name(parse(k.tonic))}, not ${name(parse(relative(k).tonic))}.` });
    try { if (Math.abs(key(k.tonic, 'minor').fifths) <= 6) ds.push({ label: label(key(k.tonic, 'minor'), 'harmonic'), why: 'A minor scale has a minor 3rd above the tonic.' }); } catch { /* */ }
    try { if (Math.abs(key(k.tonic, 'minor').fifths) <= 6) ds.push({ label: label(key(k.tonic, 'minor'), 'melodic'), why: 'A minor scale has a minor 3rd above the tonic.' }); } catch { /* */ }
    ds.push({ label: label(keyFromFifths(Math.max(-6, Math.min(6, k.fifths + 1)), 'major'), 'major') });
  }
  return mcq(r, {
    section: SEC, topic: 'k-scales', difficulty: diff, sub: clef,
    prompt: 'Which scale is this (ascending)?',
    music: { clef, free: true, notes: notes.map((p) => ({ keys: toString(p), dur: 'w' })), scale: 1 },
    explanation: `It starts and ends on ${name(notes[0])}. ${type === 'major' ? `The pattern is tone, tone, semitone, tone, tone, tone, semitone: ${correct}.` : type === 'harmonic' ? `It has a minor 3rd and a raised 7th (${name(notes[6])}) but a normal 6th (${name(notes[5])}): harmonic minor.` : `It has a minor 3rd and both the 6th (${name(notes[5])}) and 7th (${name(notes[6])}) raised: melodic minor going up.`}`,
  }, { label: correct }, ds.filter((d) => d.label !== correct));
}

export function genScaleMissing(r, diff) {
  for (let tries = 0; tries < 30; tries++) {
    const k = r.pick(keyPool(diff, null));
    const clef = clefFor(r, diff);
    const type = k.mode === 'major' ? 'major' : r.pick(['harmonic', 'melodic-up', 'melodic-down']);
    const t = parse(k.tonic + OCT[clef]);
    const notes = type === 'melodic-up' ? scale(t, 'melodic-up') : type === 'melodic-down' ? scale(t, 'melodic-down').map((p) => p) : scale(t, type);
    // melodic-down uses the octave above the tonic as its start; shift so it sits like the others.
    const seq = type === 'melodic-down' ? notes : notes;
    const pos = seq.map((p) => staffPos(p, clef));
    if (Math.min(...pos) < -3 || Math.max(...pos) > 11) continue;
    const missing = r.int(1, 6);
    const useSig = r.chance(diff === 1 ? 0.3 : 0.5);
    const show = (p) => ({ keys: toString(p), dur: 'w' });
    const ans = seq[missing];
    const typeWords = type === 'major' ? 'major' : type === 'harmonic' ? 'harmonic minor' : type === 'melodic-up' ? 'melodic minor, ascending' : 'melodic minor, descending';
    return {
      section: SEC, topic: 'k-scales', difficulty: diff, sub: clef, type: 'place', tricky: diff >= 2,
      prompt: `Add the missing note to complete the scale of ${name(parse(k.tonic))} ${typeWords}${useSig ? ' (the key signature is given)' : ' (no key signature: add any accidental that is needed)'}.`,
      place: { clef, fifths: useSig ? k.fifths : null, notes: seq.slice(0, missing).map(show), after: seq.slice(missing + 1).map(show), accept: [toString(ans)], answerText: `${name(ans, true)}` },
      explanation: `The scale is ${seq.map((p) => name(p)).join(' ')}. The missing note is ${wordName(ans)}${type === 'harmonic' && missing === 6 ? ' (the raised 7th, or leading note)' : type === 'melodic-up' && missing >= 5 ? ' (melodic minor raises the 6th and 7th going up)' : type === 'melodic-down' && (missing === 1 || missing === 2) ? ' (melodic minor uses the natural 7th and 6th coming down)' : ''}.${useSig && ans.acc !== signatureMap(k)[ans.letter] ? ' It needs an accidental because it is not in the key signature.' : ''}`,
    };
  }
  throw new Error('scaleMissing');
}

export function genChromatic(r, diff) {
  const tonics = GRADE5_KEYS.filter((k) => Math.abs(k.fifths) <= (diff === 1 ? 2 : 5)).map((k) => k.tonic);
  for (let tries = 0; tries < 30; tries++) {
    const t = parse(r.pick(tonics) + '4');
    const dir = r.pick(['up', 'down']);
    const start = dir === 'up' ? t : pitch(t.letter, t.acc, 5);
    const good = chromaticScale(start, dir);
    // Keep to spellings students will recognise (no E♯, B♯, C♭, F♭ or doubles in the correct answer).
    if (good.some((p) => Math.abs(p.acc) > 1 || ['E#', 'B#', 'Cb', 'Fb'].includes(p.letter + (p.acc > 0 ? '#' : p.acc < 0 ? 'b' : '')))) continue;
    // Wrong versions: respell one or two notes so the letter-name rule breaks.
    const wrongs = [];
    for (let attempt = 0; attempt < 60 && wrongs.length < 6; attempt++) {
      const w = good.slice();
      const i = r.int(1, 11);
      const alts = spellingsOf(midi(w[i])).filter((s) => !sameSpelling(s, w[i]) && Math.abs(s.acc) <= 1);
      if (!alts.length) continue;
      w[i] = r.pick(alts);
      if (!isValidChromatic(w, dir) && !wrongs.some((x) => x.map((p) => name(p)).join() === w.map((p) => name(p)).join())) wrongs.push(w);
    }
    if (wrongs.length < 2) continue;
    const m = (ns) => ({ clef: 'treble', free: true, notes: ns.map((p) => ({ keys: toString(p), dur: 'q', stem: 'up' })), scale: 0.85, noteWidth: 30 });
    return mcq(r, {
      section: SEC, topic: 'k-chromatic', difficulty: diff,
      prompt: `Which of these is a correctly written chromatic scale ${dir === 'up' ? 'ascending' : 'descending'} from ${name(start)}?`,
      explanation: 'A chromatic scale moves by semitones. It must start and end on the same note, and no letter name may be used more than twice in a row (and no letter may be skipped). The correct one here is: ' + good.map((p) => name(p)).join(' ') + '.',
    }, { label: '', music: m(good), key: 'good', aria: 'chromatic scale' }, wrongs.map((w, i) => ({ label: '', music: m(w), key: 'w' + i, aria: 'chromatic scale', why: whyChromatic(w) })), 3);
  }
  throw new Error('chromatic');
}

function whyChromatic(w) {
  for (let i = 2; i < w.length; i++) if (w[i].letter === w[i - 1].letter && w[i - 1].letter === w[i - 2].letter) return `The letter ${w[i].letter} is used three times in a row.`;
  for (let i = 1; i < w.length; i++) {
    const a = 'CDEFGAB'.indexOf(w[i - 1].letter), b = 'CDEFGAB'.indexOf(w[i].letter);
    const step = ((b - a) + 7) % 7;
    if (step !== 0 && step !== 1 && step !== 6) return `It skips from ${name(w[i - 1])} to ${name(w[i])}, missing out a letter name.`;
  }
  return 'The letter names break the chromatic-scale rules.';
}

export function genKeyOfMelody(r, diff) {
  const k = r.pick(keyPool(diff, null));
  const clef = r.pick(diff === 1 ? ['treble'] : ['treble', 'bass', 'treble', 'alto']);
  const oct = OCT[clef];
  const type = k.mode === 'major' ? 'major' : 'harmonic';
  const sc = [...scale(parse(k.tonic + oct), type), ...scale(parse(k.tonic + (oct + 1)), type).slice(1, 5)];
  // Shape: start on tonic triad, wander, include the leading note, end on the tonic.
  const idx = [r.pick([0, 2, 4]), r.int(1, 5), r.int(2, 6), r.int(3, 8), r.int(1, 6), 6, 7];
  const mel = idx.map((i) => sc[i]);
  const durs = ['q', 'q', 'q', 'q', 'q', 'q', 'h'];
  const notes = mel.map((p, i) => ({ keys: toString(p), dur: durs[i] }));
  const music = { clef, key: k.fifths, time: '3/4', measures: [{ notes: notes.slice(0, 3) }, { notes: notes.slice(3, 6) }, { notes: [{ ...notes[6], dur: 'h', dots: 1 }] }], scale: 1.05 };
  const ds = [{ label: keyName(relative(k)), why: k.mode === 'major' ? `${keyName(relative(k))} shares the key signature, but its leading note would need an accidental, and the melody would centre on ${name(parse(relative(k).tonic))}.` : `${keyName(relative(k))} shares the key signature, but the ${name(sc[6])} accidental is the raised leading note of ${keyName(k)}.` }];
  for (const f of [k.fifths + 1, k.fifths - 1]) if (f >= -6 && f <= 6) ds.push({ label: keyName(keyFromFifths(f, k.mode)) });
  try { const o = key(k.tonic, k.mode === 'major' ? 'minor' : 'major'); if (Math.abs(o.fifths) <= 6) ds.push({ label: keyName(o) }); } catch { /* */ }
  return mcq(r, {
    section: SEC, topic: 'k-key-of-melody', difficulty: diff,
    prompt: 'In which key is this melody?',
    check: { kind: 'key', fifths: k.fifths, mode: k.mode },
    music,
    explanation: `The key signature (${sigWords(k)}) means ${keyName(k)} or ${keyName(relative(k))}. ${k.mode === 'minor' ? `The accidental ${name(sc[6])} is the raised 7th (leading note) of ${keyName(k)}, and the melody ends on ${name(sc[7])}.` : `There is no raised leading note for ${keyName(relative(k))}, and the melody ends on the tonic ${name(sc[7])}.`}`,
  }, { label: keyName(k) }, ds);
}

export function genScaleFacts(r, diff) {
  const k = r.pick(keyPool(diff, null));
  const rel = relative(k);
  const sc = keyScale(k, 4).slice(0, 7);
  const deg = r.int(1, 7);
  const wrongDeg = (deg % 7) + 1;
  const st = [
    { text: `${keyName(k)} has ${sigWords(k).replace(/ \(.*\)$/, '')}.`, answer: true },
    { text: `${keyName(k)} has ${Math.abs(k.fifths) + 1} ${k.fifths >= 0 ? 'sharps' : 'flats'}.`, answer: false },
    { text: `The relative ${rel.mode} of ${keyName(k)} is ${keyName(rel)}.`, answer: true },
    { text: `The ${DEGREE_NAMES[deg - 1]} of ${keyName(k)} is ${name(sc[deg - 1])}.`, answer: true },
    { text: `The ${DEGREE_NAMES[deg - 1]} of ${keyName(k)} is ${name(sc[wrongDeg - 1])}.`, answer: false },
  ];
  if (k.mode === 'minor') {
    st.push({ text: `In ${keyName(k)}, the harmonic minor scale has ${name(sc[6])} as its 7th note.`, answer: true });
    st.push({ text: `The melodic minor scale of ${keyName(k)} is the same going up and coming down.`, answer: false });
    st.push({ text: `The melodic minor scale of ${keyName(k)} raises the 6th and 7th notes going up.`, answer: true });
  } else {
    st.push({ text: `The leading note of ${keyName(k)} is ${name(sc[6])}.`, answer: true });
    st.push({ text: `The scale of ${keyName(k)} has a semitone between the 3rd and 4th notes.`, answer: true });
    st.push({ text: `The scale of ${keyName(k)} has a semitone between the 4th and 5th notes.`, answer: false });
  }
  return trueFalse(r, { section: SEC, topic: 'k-scales', difficulty: diff, prompt: 'Are these statements true or false?', explanation: `${keyName(k)}: ${sc.map((n) => name(n)).join(' ')}${k.mode === 'minor' ? ' (harmonic minor)' : ''}. Key signature: ${sigWords(k)}.` }, st, 4);
}

export const KEYS_TOPICS = [
  { id: 'k-signatures', section: 3, title: 'Key signatures in all four clefs', gens: [genKeySigName, genKeySigChoose, genSigTonicPlace, genSigCount], weight: 1.5 },
  { id: 'k-relative', section: 3, title: 'Relative major and minor', gens: [genRelative] },
  { id: 'k-degrees', section: 3, title: 'Technical names of scale degrees', gens: [genDegree] },
  { id: 'k-scales', section: 3, title: 'Major, harmonic and melodic minor scales', gens: [genScaleIdentify, genScaleMissing, genScaleFacts], weight: 1.3 },
  { id: 'k-chromatic', section: 3, title: 'Chromatic scales', gens: [genChromatic] },
  { id: 'k-key-of-melody', section: 3, title: 'Finding the key of a melody', gens: [genKeyOfMelody] },
];

void aOrAn;
