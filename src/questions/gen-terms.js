// Section 6: Terms, signs, ornaments, instruments and voices.
import { TERMS, SIGNS, DIRECTIONS, ORNAMENTS, INSTRUMENTS, VOICES, meaningsClash } from '../content/terms.js';
import { parse, toString, staffPos, pitchAtStaffPos } from '../theory/pitch.js';
import { transpose } from '../theory/interval.js';
import { GRADE5_MAJOR, keyScale } from '../theory/keys.js';
import { mcq, trueFalse } from './util.js';

const SEC = 6;

function termPool(diff) {
  if (diff === 1) return TERMS.filter((t) => t.grade <= 3);
  if (diff === 2) return TERMS;
  return TERMS.filter((t) => t.grade >= 4);
}

export function genTermMeaning(r, diff) {
  const pool = termPool(diff);
  const t = r.pick(pool);
  const others = TERMS.filter((o) => o !== t && !meaningsClash(o.meaning, t.meaning));
  // Prefer distractors from the same language and nearby grades: harder to guess.
  const same = others.filter((o) => o.lang === t.lang || Math.abs(o.grade - t.grade) <= 1);
  if (r.chance(0.5)) {
    return mcq(r, {
      section: SEC, topic: 't-terms', difficulty: diff, sub: t.lang, grade: t.grade,
      prompt: `What does the ${t.lang} term "${t.term}" mean?`,
      check: { kind: 'term' },
      explanation: `${t.term} (${t.lang}, Grade ${t.grade} list) means "${t.meaning}".`,
    }, { label: t.meaning }, [...same, ...others].map((o) => ({ label: o.meaning, why: `"${o.meaning}" is ${o.term}.` })).filter((o, i, a) => a.findIndex((x) => x.label === o.label) === i && !meaningsClash(o.label, t.meaning)));
  }
  return mcq(r, {
    section: SEC, topic: 't-terms', difficulty: diff, sub: t.lang, grade: t.grade,
    prompt: `Which term means "${t.meaning}"?`,
    explanation: `"${t.meaning}" is ${t.term} (${t.lang}, Grade ${t.grade} list).`,
  }, { label: t.term }, [...same, ...others].map((o) => ({ label: o.term, why: `${o.term} means "${o.meaning}".` })));
}

export function genTermsTrueFalse(r, diff) {
  const pool = r.sample(termPool(diff), 6);
  const st = pool.map((t, i) => {
    if (i % 2 === 0) return { text: `${t.term} means "${t.meaning}".`, answer: true };
    const wrong = r.pick(TERMS.filter((o) => !meaningsClash(o.meaning, t.meaning)));
    return { text: `${t.term} means "${wrong.meaning}".`, answer: false, why: `${t.term} means "${t.meaning}".` };
  });
  return trueFalse(r, { section: SEC, topic: 't-terms', difficulty: diff, prompt: 'Are these statements about musical terms true or false?', explanation: pool.slice(0, 4).map((t) => `${t.term} = ${t.meaning}`).join('; ') + '.' }, st, 4);
}

export function genSign(r, diff) {
  const s = r.pick(SIGNS);
  const music = { clef: 'treble', free: true, notes: [{ keys: 'B4', dur: 'q', art: [s.art], stem: 'down' }], scale: 1.4 };
  return mcq(r, {
    section: SEC, topic: 't-signs', difficulty: diff,
    prompt: 'What does the sign on this note mean?',
    music,
    explanation: `This is a ${s.name}: ${s.meaning}.`,
  }, { label: s.meaning }, SIGNS.filter((o) => o !== s).map((o) => ({ label: o.meaning, why: `That is the ${o.name}.` })));
}

export function genDirection(r, diff) {
  const d = r.pick(DIRECTIONS);
  return mcq(r, {
    section: SEC, topic: 't-signs', difficulty: diff,
    prompt: `What does "${d.term}" mean?`,
    explanation: `${d.term} means: ${d.meaning}.`,
  }, { label: d.meaning }, DIRECTIONS.filter((o) => o !== d).map((o) => ({ label: o.meaning, why: `That is ${o.term}.` })));
}

// ---- Ornaments: written-out → sign ----------------------------------------

function writtenOut(orn, main, k) {
  const sc = [...keyScale(k, main.octave - 1), ...keyScale(k, main.octave), ...keyScale(k, main.octave + 1)];
  const i = sc.findIndex((p) => p.letter === main.letter && p.octave === main.octave);
  const up = sc[i + 1], down = sc[i - 1];
  const n = (p, dur, dots = 0, extra = {}) => ({ keys: toString(p), dur, dots, ...extra });
  switch (orn) {
    case 'upper mordent': return [n(main, '32', 0, { beam: 1 }), n(up, '32', 0, { beam: 1 }), n(main, '8', 1, { beam: 1 })];
    case 'lower mordent': return [n(main, '32', 0, { beam: 1 }), n(down, '32', 0, { beam: 1 }), n(main, '8', 1, { beam: 1 })];
    case 'turn': return [n(up, '16', 0, { beam: 1 }), n(main, '16', 0, { beam: 1 }), n(down, '16', 0, { beam: 1 }), n(main, '16', 0, { beam: 1 })];
    case 'trill': return [up, main, up, main, up, main, up, main].map((p) => n(p, '32', 0, { beam: 1 }));
    case 'appoggiatura': return [n(up, '8', 0, { beam: 1 }), n(main, '8', 0, { beam: 1 })];
    case 'acciaccatura': return [n(up, '32', 0, { beam: 1 }), n(main, '8', 1, { beam: 1 })];
    default: return [];
  }
}

function signVersion(orn, main, k) {
  const sc = [...keyScale(k, main.octave), ...keyScale(k, main.octave + 1)];
  const up = sc[sc.findIndex((p) => p.letter === main.letter && p.octave === main.octave) + 1];
  if (orn === 'appoggiatura') return [{ keys: toString(main), dur: 'q', grace: [{ keys: toString(up), dur: '8', slash: false }] }];
  if (orn === 'acciaccatura') return [{ keys: toString(main), dur: 'q', grace: [{ keys: toString(up), dur: '8', slash: true }] }];
  return [{ keys: toString(main), dur: 'q', orn }];
}

export function genOrnament(r, diff) {
  const k = r.pick(GRADE5_MAJOR.filter((x) => Math.abs(x.fifths) <= 2));
  const sc = keyScale(k, 4);
  const main = r.pick(sc.slice(1, 6).filter((p) => staffPos(p, 'treble') >= 1 && staffPos(p, 'treble') <= 6));
  const orn = r.pick(ORNAMENTS).id;
  const written = writtenOut(orn, main, k);
  const music = { clef: 'treble', key: k.fifths, time: '2/4', measures: [{ notes: [...written, { keys: toString(sc[0]), dur: 'q' }] }], scale: 1.2 };
  const opt = (o) => ({ label: o === 'appoggiatura' || o === 'acciaccatura' ? `${o} (small note ${o === 'acciaccatura' ? 'with' : 'without'} a slash)` : '', music: { clef: 'treble', key: k.fifths, free: true, notes: signVersion(o, main, k), scale: 1.15 }, key: o, aria: o, why: `That sign is a${o === 'upper mordent' ? 'n' : ''} ${o}: ${ORNAMENTS.find((x) => x.id === o).describe}.` });
  const q = mcq(r, {
    section: SEC, topic: 't-ornaments', difficulty: diff,
    prompt: 'The first beat of this bar shows an ornament written out in full. Which sign could replace it?',
    music,
    explanation: `The written-out notes are a${orn === 'upper mordent' || orn === 'appoggiatura' || orn === 'acciaccatura' ? 'n' : ''} ${orn}: ${ORNAMENTS.find((x) => x.id === orn).describe}.`,
  }, { ...opt(orn), why: undefined }, ORNAMENTS.filter((o) => o.id !== orn).map((o) => opt(o.id)));
  // Name each option for screen readers and review.
  return q;
}

// ---- Instruments and voices ------------------------------------------------

export function genInstrumentFacts(r, diff) {
  const kind = r.pick(['family', 'reed', 'clef', 'pitch', 'tf', 'voice', 'lowest']);
  if (kind === 'family') {
    const ins = r.pick(INSTRUMENTS.filter((i) => i.family !== 'keyboard'));
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: `To which family of the orchestra does the ${ins.name} belong?`, explanation: `The ${ins.name} is a${ins.family === 'woodwind' ? '' : ''} ${ins.family.replace(/s$/, '')} instrument (${ins.sound}).` },
      { label: ins.family }, ['strings', 'woodwind', 'brass', 'percussion'].filter((f) => f !== ins.family).map((f) => ({ label: f })), 4);
  }
  if (kind === 'reed') {
    const ins = r.pick(INSTRUMENTS.filter((i) => i.family === 'woodwind'));
    const label = ins.reed === 'none' ? 'no reed' : `${ins.reed} reed`;
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: `How is the sound made on the ${ins.name}?`, explanation: `The ${ins.name}: ${ins.sound}. Oboe, cor anglais and bassoon use a double reed; the clarinet uses a single reed; flute and piccolo have no reed.` },
      { label }, ['single reed', 'double reed', 'no reed'].filter((x) => x !== label).map((x) => ({ label: x })), 3);
  }
  if (kind === 'clef') {
    const pairs = [['viola', 'alto'], ['violin', 'treble'], ['double bass', 'bass'], ['tuba', 'bass'], ['flute', 'treble'], ['trumpet', 'treble'], ['oboe', 'treble'], ['clarinet', 'treble'], ['timpani', 'bass']];
    const [ins, clef] = r.pick(pairs);
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: `Which clef does the ${ins} normally read?`, explanation: `The ${ins} normally reads the ${clef} clef.${ins === 'viola' ? ' (It uses the treble clef for very high notes.)' : ''}` },
      { label: `${clef} clef` }, ['treble', 'bass', 'alto', 'tenor'].filter((c) => c !== clef).map((c) => ({ label: `${c} clef` })), 4);
  }
  if (kind === 'pitch') {
    const ins = r.pick(INSTRUMENTS.filter((i) => i.pitch));
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: `Is the ${ins.name} a percussion instrument of definite or indefinite pitch?`, explanation: `The ${ins.name} has ${ins.pitch} pitch${ins.pitch === 'definite' ? ' (it plays particular notes)' : ' (it does not play particular notes)'}.` },
      { label: `${ins.pitch} pitch` }, [{ label: ins.pitch === 'definite' ? 'indefinite pitch' : 'definite pitch' }], 2);
  }
  if (kind === 'voice') {
    const v = r.pick(VOICES);
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: `Which voice type is described as: ${v.type}?`, explanation: `From highest to lowest: soprano, mezzo-soprano, alto, tenor, baritone, bass. ${v.name} = ${v.type}.` },
      { label: v.name }, VOICES.filter((x) => x !== v).map((x) => ({ label: x.name })), 4);
  }
  if (kind === 'lowest') {
    const qs = [
      ['Which is the lowest-sounding instrument of the string family?', 'double bass', ['viola', 'cello', 'violin']],
      ['Which is the highest-sounding woodwind instrument?', 'piccolo', ['flute', 'oboe', 'clarinet']],
      ['Which is the lowest-sounding brass instrument?', 'tuba', ['trombone', 'horn', 'trumpet']],
      ['Which is the lowest standard woodwind instrument?', 'bassoon', ['clarinet', 'oboe', 'cor anglais']],
      ['Which of these voices is the lowest?', 'bass', ['tenor', 'baritone', 'alto']],
      ['Which of these voices is the highest?', 'soprano', ['mezzo-soprano', 'alto', 'tenor']],
      ['Which instrument changes pitch with a slide?', 'trombone', ['trumpet', 'horn', 'tuba']],
    ];
    const [p, a, ws] = r.pick(qs);
    return mcq(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: p, explanation: `The answer is the ${a}.` }, { label: a }, ws.map((w) => ({ label: w })), 4);
  }
  const st = [
    { text: 'The clarinet is a single-reed instrument.', answer: true },
    { text: 'The oboe is a single-reed instrument.', answer: false },
    { text: 'The bassoon is a double-reed instrument.', answer: true },
    { text: 'The cor anglais is a brass instrument.', answer: false },
    { text: 'The viola normally reads the alto clef.', answer: true },
    { text: 'The cello sometimes uses the tenor clef for high notes.', answer: true },
    { text: 'The trombone can read the tenor clef.', answer: true },
    { text: 'The triangle is a percussion instrument of definite pitch.', answer: false },
    { text: 'The xylophone is a percussion instrument of definite pitch.', answer: true },
    { text: 'The side drum is a percussion instrument of definite pitch.', answer: false },
    { text: 'The timpani can be tuned to particular notes.', answer: true },
    { text: 'The harp belongs to the string family.', answer: true },
    { text: 'The flute uses a reed.', answer: false },
    { text: 'The horn belongs to the woodwind family.', answer: false },
    { text: 'Brass players make the sound by buzzing their lips into a mouthpiece.', answer: true },
    { text: 'A tenor is a high male voice.', answer: true },
    { text: 'A baritone is higher than a tenor.', answer: false },
    { text: 'A mezzo-soprano is lower than a soprano.', answer: true },
    { text: 'The piccolo sounds an octave higher than written.', answer: true },
    { text: 'The double bass sounds an octave lower than written.', answer: true },
  ];
  return trueFalse(r, { section: SEC, topic: 't-instruments', difficulty: diff, prompt: 'Are these statements about instruments and voices true or false?', explanation: 'Single reed: clarinet. Double reed: oboe, cor anglais, bassoon. No reed: flute, piccolo. Definite-pitch percussion plays notes (timpani, xylophone, glockenspiel…); indefinite-pitch percussion does not (side drum, triangle, cymbals…).' }, st, 4);
}

export const TERMS_TOPICS = [
  { id: 't-terms', section: 6, title: 'Italian, French and German terms', gens: [genTermMeaning, genTermMeaning, genTermsTrueFalse], weight: 1.4 },
  { id: 't-signs', section: 6, title: 'Signs and instrumental directions', gens: [genSign, genDirection] },
  { id: 't-ornaments', section: 6, title: 'Ornaments (written out → sign)', gens: [genOrnament] },
  { id: 't-instruments', section: 6, title: 'Instruments and voices', gens: [genInstrumentFacts] },
];

void parse; void transpose; void pitchAtStaffPos;
