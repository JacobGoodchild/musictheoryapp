// Section 2: Pitch — clefs, note names, enharmonics, octave transposition between clefs,
// and transposing instruments.
import { pitch, parse, name, toString, pitchAtStaffPos, staffPos, midi, CLEFS, spellingsOf, describeStaffPos, wordName, sameSpelling, octaveShift } from '../theory/pitch.js';
import { GRADE5_MAJOR, GRADE5_MINOR, scale, keyName, signatureMap, keyFromFifths } from '../theory/keys.js';
import { toConcert, toWritten, INSTRUMENT_KEYS, writtenKeyFifths, bestOctaveShift, shiftOctaves } from '../theory/transpose.js';
import { mcq, trueFalse } from './util.js';
import { buildBar } from './gen-rhythm.js';

const SEC = 2;
const CLEF_LIST = ['treble', 'bass', 'alto', 'tenor'];
const clefFor = (r, diff) => (diff === 1 ? r.pick(['treble', 'bass']) : diff === 2 ? r.pick(CLEF_LIST) : r.pick(['alto', 'tenor', 'alto', 'tenor', 'treble', 'bass']));
const clefName = (c) => `${c} clef`;

function randomNote(r, clef, diff) {
  const range = diff === 1 ? [-1, 9] : diff === 2 ? [-3, 11] : [-4, 12];
  const pos = r.int(range[0], range[1]);
  const accPool = diff === 1 ? [0, 0, 0, 1, -1] : diff === 2 ? [0, 0, 1, -1, 1, -1] : [0, 1, -1, 2, -2, 1, -1];
  return pitchAtStaffPos(pos, clef, r.pick(accPool));
}

export function genNameNote(r, diff) {
  const clef = clefFor(r, diff);
  const p = randomNote(r, clef, diff);
  const correct = name(p);
  // Distractors: same accidental on neighbouring letters, and the name you'd get reading the wrong clef.
  const ds = [];
  for (const d of [-2, -1, 1, 2]) {
    const q = pitchAtStaffPos(staffPos(p, clef) + d, clef, p.acc);
    ds.push({ label: name(q), why: `That would be ${Math.abs(d)} step${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'higher' : 'lower'}.` });
  }
  for (const other of CLEF_LIST.filter((c) => c !== clef)) {
    const q = pitchAtStaffPos(staffPos(p, clef), other, p.acc);
    ds.push({ label: name(q), why: `That is what this line or space would be in the ${other} clef.` });
  }
  const filtered = ds.filter((d) => d.label !== correct && !spellingsOf(midi(p)).some((s) => name(s) === d.label));
  return mcq(r, {
    section: SEC, topic: 'p-clefs', difficulty: diff, sub: clef,
    prompt: `Name this note (${clefName(clef)}).`,
    check: { kind: 'note', pitch: toString(p) },
    music: { clef, free: true, notes: [{ keys: toString(p), dur: 'w' }] },
    explanation: `In the ${clef} clef, ${clefTip(clef)} This note is ${describeStaffPos(staffPos(p, clef))}, so it is ${wordName(p)}.`,
  }, { label: correct }, filtered);
}

export function clefTip(clef) {
  return {
    treble: 'the lines from the bottom are E G B D F, and the clef curls round G on the 2nd line.',
    bass: 'the lines from the bottom are G B D F A, and the two dots sit either side of F on the 4th line.',
    alto: 'the middle (3rd) line is middle C. The lines from the bottom are F A C E G.',
    tenor: 'the 4th line is middle C. The lines from the bottom are D F A C E.',
  }[clef];
}

export function genSamePitch(r, diff) {
  const from = clefFor(r, diff);
  const to = r.pick(CLEF_LIST.filter((c) => c !== from));
  for (let tries = 0; tries < 30; tries++) {
    const p = randomNote(r, from, Math.min(diff, 2));
    const posTo = staffPos(p, to);
    if (posTo < -4 || posTo > 12) continue;
    const opt = (q) => ({ clef: to, free: true, notes: [{ keys: toString(q), dur: 'w' }], scale: 1 });
    const wrongs = [
      { q: octaveShift(p, 1), why: 'Right letter, but an octave too high.' },
      { q: octaveShift(p, -1), why: 'Right letter, but an octave too low.' },
      { q: pitchAtStaffPos(posTo + 1, to, p.acc), why: 'One step too high.' },
      { q: pitchAtStaffPos(posTo - 1, to, p.acc), why: 'One step too low.' },
      { q: pitchAtStaffPos(staffPos(p, from), to, p.acc), why: `This is on the same line/space as the original, but the ${to} clef changes what that line means.` },
    ].filter((w) => { const ps = staffPos(w.q, to); return ps >= -5 && ps <= 13 && midi(w.q) !== midi(p); });
    if (wrongs.length < 3) continue;
    return mcq(r, {
      section: SEC, topic: 'p-clefs', difficulty: diff, sub: to,
      prompt: `Which note in the ${to} clef is at the same pitch as this note in the ${from} clef?`,
      check: { kind: 'same-pitch', pitch: toString(p) },
      music: { clef: from, free: true, notes: [{ keys: toString(p), dur: 'w' }] },
      explanation: `The note is ${name(p, true)} (${name(p)}${p.octave === 4 && p.letter === 'C' ? ', middle C' : ''}). In the ${to} clef, ${clefTip(to)} So it sits ${describeStaffPos(posTo)}.`,
    }, { label: '', music: opt(p), key: toString(p), aria: `${to} clef note` }, wrongs.map((w) => ({ label: '', music: opt(w.q), key: toString(w.q), why: w.why, aria: `${to} clef note` })));
  }
  throw new Error('samePitch');
}

export function genClefPlace(r, diff) {
  const from = clefFor(r, diff);
  const to = r.pick(CLEF_LIST.filter((c) => c !== from));
  for (let tries = 0; tries < 30; tries++) {
    const p = randomNote(r, from, Math.min(diff, 2));
    const posTo = staffPos(p, to);
    if (posTo < -3 || posTo > 11) continue;
    return {
      section: SEC, topic: 'p-clefs', difficulty: diff, sub: to, type: 'place', tricky: ['alto', 'tenor'].includes(to),
      prompt: `Write this note at the same pitch in the ${to} clef. Drag the notehead onto the stave and choose an accidental if needed.`,
      music: { clef: from, free: true, notes: [{ keys: toString(p), dur: 'w' }] },
      place: { clef: to, accept: [toString(p)], answerText: `${name(p, true)}: ${describeStaffPos(posTo)} in the ${to} clef${p.acc ? `, with a ${wordName(p).split(' ').slice(1).join(' ')}` : ''}` },
      explanation: `The note is ${name(p, true)}. In the ${to} clef, ${clefTip(to)} So it goes ${describeStaffPos(posTo)}${p.acc ? `, and it still needs its ${wordName(p).split(' ').slice(1).join(' ')}` : ''}.`,
    };
  }
  throw new Error('clefPlace');
}

export function genEnharmonic(r, diff) {
  const accs = diff === 1 ? [1, -1] : [1, -1, 2, -2];
  for (let tries = 0; tries < 40; tries++) {
    const L = r.pick(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    const p = pitch(L, r.pick(accs), 4);
    const others = spellingsOf(midi(p)).filter((s) => !sameSpelling(s, p));
    if (!others.length) continue;
    const ans = r.pick(others);
    const wrongs = [];
    for (const d of [-2, -1, 1, 2]) for (const s of spellingsOf(midi(p) + d)) wrongs.push({ label: name(s), why: `${name(s)} is ${Math.abs(d)} semitone${Math.abs(d) > 1 ? 's' : ''} ${d > 0 ? 'higher' : 'lower'} than ${name(p)}.` });
    const okNames = new Set(spellingsOf(midi(p)).map((s) => name(s)));
    return mcq(r, {
      section: SEC, topic: 'p-enharmonic', difficulty: diff,
      prompt: `Which note is an enharmonic equivalent of ${name(p)} (the same pitch with a different name)?`,
      explanation: `${name(p)} sounds the same as ${others.map((o) => name(o)).join(' and ')}. Enharmonic equivalents are the same key on the piano, written with a different letter name.`,
    }, { label: name(ans) }, wrongs.filter((w) => !okNames.has(w.label)));
  }
  throw new Error('enh');
}

// ---- Octave transposition of a melody between clefs ----------------------

function shortMelody(r, k, clef, len = 6) {
  const oct = { treble: 4, bass: 2, alto: 3, tenor: 3 }[clef];
  const sc = [...scale(parse(k.tonic + oct), k.mode === 'major' ? 'major' : 'harmonic'), ...scale(parse(k.tonic + (oct + 1)), k.mode === 'major' ? 'major' : 'harmonic').slice(1)];
  let i = r.int(0, 4);
  const out = [];
  for (let n = 0; n < len; n++) {
    out.push(sc[i]);
    i = Math.max(0, Math.min(sc.length - 1, i + r.pick([-2, -1, -1, 1, 1, 2, 0, 3, -3])));
  }
  return out;
}

function melodyMusic(clef, fifths, pitches, time = '4/4', rhythm = null) {
  const durs = rhythm || ['q', 'q', 'q', 'q', 'h', 'h'];
  const notes = pitches.map((p, i) => ({ keys: toString(p), dur: durs[i % durs.length] }));
  // split into bars by 4 crotchets
  const measures = [];
  let cur = [], beats = 0;
  const val = { w: 4, h: 2, q: 1, 8: 0.5 };
  for (const n of notes) { cur.push(n); beats += val[n.dur]; if (beats >= 4) { measures.push({ notes: cur }); cur = []; beats = 0; } }
  if (cur.length) measures.push({ notes: cur });
  return { clef, key: fifths, time, measures, scale: 1 };
}

export function genOctaveTranspose(r, diff) {
  const from = clefFor(r, diff);
  const to = r.pick(CLEF_LIST.filter((c) => c !== from));
  const k = r.pick(diff === 1 ? GRADE5_MAJOR.slice(4, 9) : [...GRADE5_MAJOR, ...GRADE5_MINOR]);
  const mel = shortMelody(r, k, from, 6);
  const dir = r.pick(['up', 'down', 'same']);
  const shift = dir === 'up' ? 1 : dir === 'down' ? -1 : 0;
  const target = shiftOctaves(mel, shift);
  // Make sure the target sits sensibly on the new clef.
  const pos = target.map((p) => staffPos(p, to));
  if (Math.min(...pos) < -4 || Math.max(...pos) > 12) return genOctaveTranspose(r, diff);
  const rhythm = ['q', 'q', 'q', 'q', 'h', 'h'];
  const correct = melodyMusic(to, k.fifths, target, '4/4', rhythm);
  const wrongOct = shiftOctaves(target, shift === 0 ? r.pick([1, -1]) : -shift);
  const oneWrongIdx = r.int(1, 4);
  const stepDir = r.pick([-1, 1]);
  const oneWrong = target.map((p, i) => {
    if (i !== oneWrongIdx) return p;
    const q = pitchAtStaffPos(staffPos(p, to) + stepDir, to);
    return pitch(q.letter, signatureMap(k)[q.letter], q.octave);
  });
  const sameLines = mel.map((p) => pitchAtStaffPos(staffPos(p, from), to, 0)).map((p) => pitch(p.letter, signatureMap(k)[p.letter], p.octave));
  const words = shift === 0 ? 'at the same pitch' : `one octave ${shift > 0 ? 'higher' : 'lower'}`;
  const opts = [
    { music: melodyMusic(to, k.fifths, wrongOct, '4/4', rhythm), key: 'oct', why: 'The notes are right, but they are in the wrong octave.' },
    { music: melodyMusic(to, k.fifths, oneWrong, '4/4', rhythm), key: 'one', why: `Note ${oneWrongIdx + 1} is on the wrong line or space.` },
    { music: melodyMusic(to, k.fifths, sameLines, '4/4', rhythm), key: 'lines', why: `This copies the lines and spaces from the ${from} clef, which changes the pitches.` },
  ].filter((o) => JSON.stringify(o.music) !== JSON.stringify(correct)).map((o) => ({ ...o, key: JSON.stringify(o.music.measures), label: '', aria: 'melody' }));
  return mcq(r, {
    section: SEC, topic: 'p-transpose-clef', difficulty: diff, tricky: true,
    prompt: `This melody is rewritten ${words} in the ${to} clef. Which version is correct?`,
    music: melodyMusic(from, k.fifths, mel, '4/4', rhythm),
    explanation: `${shift === 0 ? 'Same pitch' : `An octave ${shift > 0 ? 'higher' : 'lower'}`} means every note keeps its letter name${shift === 0 ? ' and octave' : ` but moves ${shift > 0 ? 'up' : 'down'} eight notes`}. The first note ${name(mel[0], true)} becomes ${name(target[0], true)}, which in the ${to} clef is ${describeStaffPos(staffPos(target[0], to))}. (${cap1(to)} clef: ${clefTip(to)})`,
  }, { label: '', music: correct, key: JSON.stringify(correct.measures), aria: 'melody' }, opts, 4);
}

const cap1 = (s) => s[0].toUpperCase() + s.slice(1);

// ---- Transposing instruments --------------------------------------------

const INSTR_NAME = { Bb: ['clarinet in B♭', 'trumpet in B♭'], A: ['clarinet in A'], F: ['horn in F', 'cor anglais'] };

export function genInstrument(r, diff) {
  const inst = r.pick(['Bb', 'A', 'F']);
  const instName = r.pick(INSTR_NAME[inst]);
  const toConcertDir = r.chance(0.5);
  const iv = INSTRUMENT_KEYS[inst];
  // Choose a concert key whose written key stays within six sharps/flats.
  const concertPool = GRADE5_MAJOR.filter((k) => Math.abs(writtenKeyFifths(k.fifths, inst)) <= (diff === 1 ? 3 : 6) && Math.abs(k.fifths) <= (diff === 1 ? 3 : 6));
  const ck = r.pick(concertPool);
  const wk = keyFromFifths(writtenKeyFifths(ck.fifths, inst), 'major');
  const useKeySig = diff < 3 ? true : r.chance(0.5);
  const concertMel = shortMelody(r, ck, 'treble', 6);
  const writtenMel = concertMel.map((p) => toWritten(p, inst));
  const srcMel = toConcertDir ? writtenMel : concertMel;
  const ansMel = toConcertDir ? concertMel : writtenMel;
  const srcKey = toConcertDir ? wk : ck;
  const ansKey = toConcertDir ? ck : wk;
  const rhythm = ['q', 'q', 'h', 'q', 'q', 'h'];
  const m = (mel, k) => melodyMusic('treble', useKeySig ? k.fifths : null, mel, '4/4', rhythm);
  // Wrong versions: wrong direction, wrong interval (another instrument), octave error.
  const wrongDir = srcMel.map((p) => (toConcertDir ? toWritten(p, inst) : toConcert(p, inst)));
  const fit = (f) => (f >= -7 && f <= 7 ? keyFromFifths(f, 'major') : { fifths: 99 });
  const wrongDirKey = fit(toConcertDir ? writtenKeyFifths(srcKey.fifths, inst) : srcKey.fifths - (writtenKeyFifths(0, inst)));
  const otherInst = r.pick(['Bb', 'A', 'F'].filter((x) => x !== inst));
  const wrongInt = srcMel.map((p) => (toConcertDir ? toConcert(p, otherInst) : toWritten(p, otherInst)));
  const wrongIntKey = fit(toConcertDir ? srcKey.fifths - writtenKeyFifths(0, otherInst) : writtenKeyFifths(srcKey.fifths, otherInst));
  const okKey = (k) => Math.abs(k.fifths) <= 6;
  const opts = [];
  if (okKey(wrongDirKey)) opts.push({ label: '', music: m(wrongDir, wrongDirKey), key: 'dir', why: `This moves the melody the wrong way: ${toConcertDir ? 'to get concert pitch from a written part, go down' : 'to write a part for this instrument, go up'} ${iv.words.replace(' lower', '')}.`, aria: 'melody' });
  if (okKey(wrongIntKey)) opts.push({ label: '', music: m(wrongInt, wrongIntKey), key: 'int', why: `This uses the wrong interval (that would be for an instrument ${INSTRUMENT_KEYS[otherInst].label}).`, aria: 'melody' });
  const octMel = shiftOctaves(ansMel, toConcertDir ? 1 : -1);
  opts.push({ label: '', music: m(octMel, ansKey), key: 'oct', why: `The notes have the right names but are in the wrong octave: the interval is ${iv.words.replace(' lower', '')}, not a ${toConcertDir ? '7th' : '7th'} or more.`, aria: 'melody' });
  return mcq(r, {
    section: SEC, topic: 'p-instruments', difficulty: diff, tricky: true, sub: inst,
    prompt: toConcertDir
      ? `This melody is written for ${instName}, which sounds ${iv.words} than written. Which version shows it at concert pitch (the sounding pitch)?`
      : `This melody is at concert pitch. It is to be played on the ${instName}, which sounds ${iv.words} than written. Which version is correctly written for the ${instName}?`,
    music: m(srcMel, srcKey),
    explanation: toConcertDir
      ? `The ${instName} sounds ${iv.words} than written, so to find concert pitch move every note DOWN ${iv.words.replace(' lower', '')}. ${useKeySig ? `The key signature moves too: ${keyName(srcKey)} becomes ${keyName(ansKey)}.` : ''} The first note ${name(srcMel[0], true)} becomes ${name(ansMel[0], true)}.`
      : `The ${instName} sounds ${iv.words} than written, so the written part must be ${iv.words.replace('lower', 'higher')} than concert pitch: move every note UP. ${useKeySig ? `The key signature moves too: ${keyName(srcKey)} becomes ${keyName(ansKey)}.` : ''} The first note ${name(srcMel[0], true)} becomes ${name(ansMel[0], true)}.`,
  }, { label: '', music: m(ansMel, ansKey), key: 'correct', aria: 'melody' }, opts, 4);
}

export function genInstrumentPlace(r, diff) {
  const inst = r.pick(['Bb', 'A', 'F']);
  const instName = r.pick(INSTR_NAME[inst]);
  const iv = INSTRUMENT_KEYS[inst];
  const toConcertDir = r.chance(0.5);
  for (let t = 0; t < 30; t++) {
    const src = pitchAtStaffPos(r.int(0, 8), 'treble', r.pick(diff === 1 ? [0, 0, 1, -1] : [0, 1, -1]));
    const ans = toConcertDir ? toConcert(src, inst) : toWritten(src, inst);
    if (Math.abs(ans.acc) > 1 && diff < 3) continue;
    const pos = staffPos(ans, 'treble');
    if (pos < -3 || pos > 11) continue;
    return {
      section: SEC, topic: 'p-instruments', difficulty: diff, type: 'place', tricky: true, sub: inst,
      prompt: toConcertDir
        ? `This note is written for ${instName} (sounds ${iv.words} than written). Write the note it actually sounds (concert pitch).`
        : `This note is at concert pitch. Write it as it would appear in a part for ${instName} (sounds ${iv.words} than written).`,
      music: { clef: 'treble', free: true, notes: [{ keys: toString(src), dur: 'w' }] },
      place: { clef: 'treble', accept: [toString(ans)], answerText: `${name(ans, true)} (${describeStaffPos(pos)})` },
      explanation: `${toConcertDir ? 'Concert pitch is lower, so go down' : 'The written part is higher, so go up'} ${iv.words.replace(' lower', '')}: ${name(src, true)} → ${name(ans, true)}.`,
    };
  }
  throw new Error('instPlace');
}

export function genInstrumentFacts(r, diff) {
  const st = [
    { text: 'A clarinet in B♭ sounds a major 2nd lower than written.', answer: true },
    { text: 'A clarinet in B♭ sounds a major 2nd higher than written.', answer: false },
    { text: 'A clarinet in A sounds a minor 3rd lower than written.', answer: true },
    { text: 'A clarinet in A sounds a major 3rd lower than written.', answer: false },
    { text: 'A horn in F sounds a perfect 5th lower than written.', answer: true },
    { text: 'A horn in F sounds a perfect 4th lower than written.', answer: false },
    { text: 'A trumpet in B♭ sounds a major 2nd lower than written.', answer: true },
    { text: 'The cor anglais sounds a perfect 5th lower than written.', answer: true },
    { text: 'The cor anglais is a transposing instrument in B♭.', answer: false },
    { text: 'To write a part for clarinet in B♭, the concert-pitch music is moved up a major 2nd.', answer: true },
    { text: 'To write a part for horn in F, the concert-pitch music is moved down a perfect 5th.', answer: false },
    { text: 'Concert F major written for clarinet in B♭ is in G major.', answer: true },
    { text: 'Concert C major written for horn in F is in G major.', answer: true },
    { text: 'Concert C major written for clarinet in A is in E♭ major.', answer: true },
    { text: 'Concert C major written for clarinet in A is in A major.', answer: false },
    { text: 'The flute is a transposing instrument.', answer: false },
    { text: 'The oboe sounds at the written pitch.', answer: true },
  ];
  return trueFalse(r, { section: SEC, topic: 'p-instruments', difficulty: diff, tricky: true, prompt: 'Are these statements about transposing instruments true or false?', explanation: 'B♭ instruments sound a major 2nd lower than written, A instruments a minor 3rd lower, and F instruments (horn, cor anglais) a perfect 5th lower. Writing a part means going UP by that interval; finding concert pitch means going DOWN.' }, st, 4);
}

export const PITCH_TOPICS = [
  { id: 'p-clefs', section: 2, title: 'Clefs and note names (incl. tenor clef)', gens: [genNameNote, genSamePitch, genClefPlace] },
  { id: 'p-enharmonic', section: 2, title: 'Accidentals and enharmonic equivalents', gens: [genEnharmonic] },
  { id: 'p-transpose-clef', section: 2, title: 'Transposing at the octave between clefs', gens: [genOctaveTranspose], weight: 1.3 },
  { id: 'p-instruments', section: 2, title: 'Transposing instruments (B♭, A, F)', gens: [genInstrument, genInstrumentPlace, genInstrumentFacts], weight: 1.4 },
];

void buildBar; void CLEFS; void trueFalse; void GRADE5_MINOR;
