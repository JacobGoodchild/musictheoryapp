// Section 4: Intervals.
import { parse, name, toString, pitchAtStaffPos, staffPos, midi, describeStaffPos } from '../theory/pitch.js';
import { between, intervalName, transpose, simpleNumber, isPerfectType, semitonesFor } from '../theory/interval.js';
import { GRADE5_KEYS, keyName } from '../theory/keys.js';
import { mcq } from './util.js';

const SEC = 4;
const CLEF_LIST = ['treble', 'bass', 'alto', 'tenor'];
const clefFor = (r, diff) => (diff === 1 ? r.pick(['treble', 'bass']) : r.pick(CLEF_LIST));

// Qualities examined at Grade 5 for each simple number (no unisons, no dim 2nd, no doubly altered).
export const G5_QUALITIES = { 2: ['m', 'M', 'A'], 3: ['m', 'M', 'A', 'd'], 4: ['P', 'A', 'd'], 5: ['P', 'A', 'd'], 6: ['m', 'M', 'A', 'd'], 7: ['m', 'M', 'A', 'd'], 8: ['P', 'A', 'd'] };
const COMMON = { 2: ['m', 'M'], 3: ['m', 'M'], 4: ['P', 'A'], 5: ['P', 'd'], 6: ['m', 'M'], 7: ['m', 'M'], 8: ['P'] };

export function qualitiesFor(number) {
  const s = number > 8 ? (simpleNumber(number) === 1 ? 8 : simpleNumber(number)) : number;
  return G5_QUALITIES[s];
}

function pickInterval(r, diff) {
  const number = diff === 1 ? r.int(2, 8) : diff === 2 ? r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) : r.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  const s = number > 8 ? (simpleNumber(number) === 1 ? 8 : simpleNumber(number)) : number;
  const quality = r.pick(diff === 1 ? COMMON[s] : G5_QUALITIES[s]);
  return { number, quality };
}

function makePair(r, diff, clef) {
  for (let t = 0; t < 80; t++) {
    const { number, quality } = pickInterval(r, diff);
    const lowPos = r.int(-2, Math.max(-2, 9 - (number - 1)));
    const low = pitchAtStaffPos(lowPos, clef, r.pick(diff === 1 ? [0, 0, 0, 1, -1] : [0, 0, 1, -1]));
    let high;
    try { high = transpose(low, number, quality, 'up'); } catch { continue; }
    if (Math.abs(high.acc) > (diff === 3 ? 2 : 1)) continue;
    if (staffPos(high, clef) > 12) continue;
    return { low, high, number, quality };
  }
  throw new Error('pair');
}

export function genIntervalName(r, diff) {
  const clef = clefFor(r, diff);
  const { low, high, number, quality } = makePair(r, diff, clef);
  const style = number > 8 && r.chance(0.3) ? 'full' : 'compound';
  const iv = { number, quality };
  const correct = intervalName(iv, { style });
  const ds = [];
  // Beginner (difficulty 1): only simple intervals and the common qualities, so no
  // augmented/diminished or compound options appear.
  const qualsFor = (n) => (diff === 1 ? COMMON[n] || qualitiesFor(n) : qualitiesFor(n));
  for (const q of qualsFor(number)) if (q !== quality) ds.push({ label: intervalName({ number, quality: q }, { style }), why: whyQuality(low, high, number, q) });
  for (const n of [number - 1, number + 1, diff === 1 ? 0 : number > 8 ? number - 7 : number + 7]) {
    if (n < 2 || n > 15 || (diff === 1 && n > 8)) continue;
    const qs = qualsFor(n);
    ds.push({ label: intervalName({ number: n, quality: qs.includes(quality) ? quality : qs[0] }, { style }), why: n === number - 7 || n === number + 7 ? (n > number ? 'That would be an octave wider.' : 'This interval is more than an octave: it is compound.') : `Count the letter names from ${low.letter} to ${high.letter}, including both: that gives ${art(ordinalNum(number))} ${ordinalNum(number)}${number > 8 ? ` (a compound ${simpleNumber(number) === 1 ? 'octave' : ordinalNum(simpleNumber(number))})` : ''}.` });
  }
  const harmonic = r.chance(0.5);
  const music = harmonic
    ? { clef, free: true, notes: [{ keys: [toString(low), toString(high)], dur: 'w' }] }
    : { clef, free: true, notes: [{ keys: toString(low), dur: 'w' }, { keys: toString(high), dur: 'w' }] };
  return mcq(r, {
    section: SEC, topic: 'i-name', difficulty: diff + (number > 8 && diff < 3 ? 0 : 0), sub: clef,
    prompt: `Name this ${harmonic ? 'harmonic' : 'melodic'} interval (${clef} clef).`,
    check: { kind: 'interval', low: toString(low), high: toString(high) },
    music,
    listenAfter: { kind: 'interval', notes: [toString(low), toString(high)] },
    explanation: explainInterval(low, high, number, quality, style),
  }, { label: correct }, ds);
}

const ordinalNum = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

/** "a" or "an" before a word or interval name (an augmented, an 8th, an 11th). */
export const art = (w) => (/^(a|e|i|o|u|8|11|18)/i.test(String(w)) ? 'an' : 'a');
const semis = (n) => `${n} semitone${n === 1 ? '' : 's'}`;

function whyQuality(low, high, number, q) {
  const want = semitonesFor(number, q);
  const got = midi(high) - midi(low);
  const nm = intervalName({ number, quality: q });
  return `${art(nm)[0].toUpperCase() + art(nm).slice(1)} ${nm} spans ${semis(want)}; this one spans ${semis(got)}.`;
}

const GRADE5_MAJOR_TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];

export function explainInterval(low, high, number, quality, style = 'compound') {
  const s = number > 8 ? (simpleNumber(number) === 1 ? 8 : simpleNumber(number)) : number;
  const nSemis = midi(high) - midi(low);
  const numWord = number > 8 ? `${ordinalNum(number)} (a compound ${s === 8 ? 'octave' : ordinalNum(s)})` : ordinalNum(number);
  const parts = [`From ${name(low)} up to ${name(high)}: counting letter names gives ${art(numWord)} ${numWord}.`];
  const tonic = low.letter + ['bb', 'b', '', '#', 'x'][low.acc + 2];
  if (GRADE5_MAJOR_TONICS.includes(tonic)) {
    if (isPerfectType(number)) parts.push(`In the major scale of ${name(low)}, the ${s === 8 ? 'octave' : ordinalNum(s)} is perfect; one semitone bigger is augmented, one smaller is diminished.`);
    else parts.push(`In the major scale of ${name(low)}, the ${ordinalNum(s)} is major. One semitone smaller is minor, smaller again is diminished; one semitone bigger than major is augmented.`);
  } else {
    // Unfamiliar key: work it out from the plain letter names first.
    const lo = { letter: low.letter, acc: 0, octave: low.octave };
    const natHigh = { letter: high.letter, acc: 0, octave: high.octave };
    const base = between(lo, natHigh);
    if (base.valid) {
      const baseName = intervalName(base, { style });
      const lowWord = low.acc === 0 ? '' : `${low.acc > 0 ? 'Raising' : 'Lowering'} the bottom note (${name(low)}) makes the interval ${low.acc > 0 ? 'smaller' : 'bigger'}${high.acc ? '; ' : '.'}`;
      const highWord = high.acc === 0 ? '' : `${high.acc > 0 ? 'raising' : 'lowering'} the top note (${name(high)}) makes it ${high.acc > 0 ? 'bigger' : 'smaller'}.`;
      parts.push(`Start from the plain letters: ${low.letter} up to ${high.letter} is ${art(baseName)} ${baseName}. ${lowWord}${highWord}`.trim());
    }
  }
  const nm = intervalName({ number, quality }, { style });
  parts.push(`This one spans ${semis(nSemis)}, so it is ${art(nm)} ${nm}${number > 8 ? ` (also called ${art(intervalName({ number, quality }, { style: style === 'full' ? 'compound' : 'full' }))} ${intervalName({ number, quality }, { style: style === 'full' ? 'compound' : 'full' })})` : ''}.`);
  return parts.join(' ');
}

export function genIntervalPlace(r, diff) {
  const clef = clefFor(r, diff);
  for (let t = 0; t < 40; t++) {
    const { low, high, number, quality } = makePair(r, diff, clef);
    const below = diff >= 2 && r.chance(0.35);
    const given = below ? high : low;
    const ans = below ? low : high;
    const p = staffPos(ans, clef);
    if (p < -4 || p > 12) continue;
    const ivName = intervalName({ number, quality }, { style: number > 8 && r.chance(0.3) ? 'full' : 'compound' });
    return {
      section: SEC, topic: 'i-write', difficulty: diff, sub: clef, type: 'place',
      prompt: `Write a note that is ${art(ivName)} ${ivName} ${below ? 'below' : 'above'} this note.`,
      check: { kind: 'place-interval', given: toString(given), below, number, quality },
      music: { clef, free: true, notes: [{ keys: toString(given), dur: 'w' }] },
      place: { clef, accept: [toString(ans)], answerText: `${name(ans, true)} (${describeStaffPos(p)})`, range: [-5, 13] },
      listenAfter: { kind: 'interval', notes: [toString(low), toString(high)] },
      explanation: `${below ? 'Count down' : 'Count up'} ${number} letter names from ${name(given)} (including it) to reach ${ans.letter}. ${explainInterval(low, high, number, quality)}`,
    };
  }
  throw new Error('ivPlace');
}

export function genIntervalInKey(r, diff) {
  // Interval between two notes of a melody with a key signature.
  const k = r.pick(GRADE5_KEYS.filter((x) => Math.abs(x.fifths) <= (diff === 1 ? 2 : 6)));
  const clef = clefFor(r, diff);
  const oct = { treble: 4, bass: 2, alto: 3, tenor: 3 }[clef];
  for (let t = 0; t < 60; t++) {
    const lowPos = r.int(-1, 6);
    const lowNat = pitchAtStaffPos(lowPos, clef);
    const lowP = parse(lowNat.letter + ({ '-1': 'b', 0: '', 1: '#' })[sigAcc(k, lowNat.letter)] + lowNat.octave);
    const number = r.int(2, diff === 3 ? 12 : 8);
    const highNat = pitchAtStaffPos(lowPos + number - 1, clef);
    const highP = parse(highNat.letter + ({ '-1': 'b', 0: '', 1: '#' })[sigAcc(k, highNat.letter)] + highNat.octave);
    const iv = between(lowP, highP);
    if (!iv.valid || !qualitiesFor(iv.number).includes(iv.quality)) continue;
    const correct = intervalName(iv);
    const ds = qualitiesFor(iv.number).filter((q) => q !== iv.quality).map((q) => ({ label: intervalName({ number: iv.number, quality: q }), why: `Remember the key signature: the notes are ${name(lowP)} and ${name(highP)}.` }));
    for (const n of [iv.number - 1, iv.number + 1]) if (n >= 2) ds.push({ label: intervalName({ number: n, quality: qualitiesFor(n)[0] }) });
    void oct;
    return mcq(r, {
      section: SEC, topic: 'i-name', difficulty: diff, sub: 'key signature', tricky: true,
      prompt: `This melody is in ${keyName(k)}. Name the interval between the two notes (remember the key signature).`,
      check: { kind: 'interval', low: toString(lowP), high: toString(highP) },
      music: { clef, key: k.fifths, free: true, notes: [{ keys: toString(lowP), dur: 'h' }, { keys: toString(highP), dur: 'h' }] },
      listenAfter: { kind: 'interval', notes: [toString(lowP), toString(highP)] },
      explanation: `With the key signature, the notes are ${name(lowP)} and ${name(highP)}. ${explainInterval(lowP, highP, iv.number, iv.quality)}`,
    }, { label: correct }, ds);
  }
  throw new Error('ivKey');
}

function sigAcc(k, letter) {
  const n = Math.abs(k.fifths);
  const order = k.fifths > 0 ? 'FCGDAEB' : 'BEADGCF';
  return order.slice(0, n).includes(letter) ? Math.sign(k.fifths) : 0;
}

export const INTERVAL_TOPICS = [
  { id: 'i-name', section: 4, title: 'Naming intervals (simple and compound)', gens: [genIntervalName, genIntervalName, genIntervalInKey] },
  { id: 'i-write', section: 4, title: 'Writing intervals above and below', gens: [genIntervalPlace] },
];
