// Section 5: Chords and cadences.
import { parse, name, toString, staffPos, pitch } from '../theory/pitch.js';
import { GRADE5_KEYS, keyName, keyScale, key, ROMAN, DEGREE_NAMES } from '../theory/keys.js';
import { triad, voiceChord, chordLabel, cadenceType, chordContains, cadenceOptions, triadQuality, INVERSION_NAMES } from '../theory/chords.js';
import { mcq, trueFalse } from './util.js';

const SEC = 5;
const DEGS = [1, 2, 4, 5];
const INVS = ['a', 'b', 'c'];
const CAD_KEYS = ['C', 'G', 'D', 'F'].map((t) => key(t, 'major'));
const keysFor = (diff) => GRADE5_KEYS.filter((k) => (diff === 1 ? Math.abs(k.fifths) <= 2 : diff === 2 ? Math.abs(k.fifths) <= 4 : Math.abs(k.fifths) >= 2));

/** Voice a chord in the octave that sits best on the stave (centred on the middle line). */
export function fitChord(k, d, inv, clef) {
  const bassOct = { treble: 4, bass: 2, alto: 3, tenor: 3 }[clef];
  let best = null, bestScore = Infinity;
  for (const o of [bassOct - 1, bassOct, bassOct + 1]) {
    const v = voiceChord(k, d, inv, o);
    const ps = v.map((p) => staffPos(p, clef));
    const score = Math.abs(ps.reduce((a, b) => a + b, 0) / 3 - 4) + (Math.min(...ps) < -2 ? 5 : 0) + (Math.max(...ps) > 10 ? 5 : 0);
    if (score < bestScore) { bestScore = score; best = v; }
  }
  return best;
}

function chordMusic(k, d, inv, clef, useSig = true) {
  const v = fitChord(k, d, inv, clef);
  return { clef, key: useSig ? k.fifths : null, free: true, notes: [{ keys: v.map((p) => toString(p)), dur: 'w' }], scale: 1.15 };
}

export function genChordIdentify(r, diff) {
  const k = r.pick(keysFor(diff));
  const d = r.pick(DEGS);
  const inv = diff === 1 ? r.pick(['a', 'a', 'b']) : r.pick(INVS);
  const clef = r.pick(diff === 1 ? ['treble', 'bass'] : ['treble', 'bass', 'treble', 'bass', 'alto', 'tenor']);
  const correct = chordLabel(d, inv, { showA: true });
  const tri = triad(k, d);
  const ds = [];
  for (const i2 of INVS) if (i2 !== inv) ds.push({ label: chordLabel(d, i2, { showA: true }), why: `${chordLabel(d, i2, { showA: true })} would have ${name(tri[INVS.indexOf(i2)])} in the bass.` });
  for (const d2 of DEGS) if (d2 !== d) {
    // Same bass note, different chord (a very common slip).
    const t2 = triad(k, d2);
    const bi = t2.findIndex((p) => p.letter === tri[INVS.indexOf(inv)].letter && p.acc === tri[INVS.indexOf(inv)].acc);
    if (bi >= 0) ds.push({ label: chordLabel(d2, INVS[bi], { showA: true }), why: `${chordLabel(d2, INVS[bi], { showA: true })} has the same bass note but its notes are ${t2.map((p) => name(p)).join('–')}.` });
    ds.push({ label: chordLabel(d2, inv, { showA: true }), why: `Chord ${ROMAN[d2 - 1]} in ${keyName(k)} is ${t2.map((p) => name(p)).join('–')}.` });
  }
  return mcq(r, {
    section: SEC, topic: 'c-chords', difficulty: diff, sub: clef,
    prompt: `This chord is in ${keyName(k)}. Which chord is it?`,
    check: { kind: 'chord', fifths: k.fifths, mode: k.mode, notes: chordMusic(k, d, inv, clef).notes[0].keys },
    music: chordMusic(k, d, inv, clef),
    listenAfter: { kind: 'chord', notes: chordMusic(k, d, inv, clef).notes[0].keys },
    explanation: `In ${keyName(k)}, chord ${ROMAN[d - 1]} (on the ${DEGREE_NAMES[d - 1]}) is ${tri.map((p) => name(p)).join('–')}${k.mode === 'minor' && d === 5 ? ' (with the raised leading note)' : ''}. The lowest note is ${name(tri[INVS.indexOf(inv)])}, the ${['root', '3rd', '5th'][INVS.indexOf(inv)]}, so it is in ${INVERSION_NAMES[inv]}: ${correct}.`,
  }, { label: correct }, ds);
}

export function genChordWhich(r, diff) {
  const k = r.pick(keysFor(diff));
  const d = r.pick(DEGS);
  const inv = r.pick(diff === 1 ? ['a', 'b'] : INVS);
  const clef = r.pick(diff === 1 ? ['treble', 'bass'] : ['treble', 'bass', 'alto', 'tenor']);
  const target = chordLabel(d, inv, { showA: true });
  const opt = (dd, ii) => ({ label: '', music: { ...chordMusic(k, dd, ii, clef), scale: 1 }, key: chordLabel(dd, ii, { showA: true }), aria: 'chord', why: `This is ${chordLabel(dd, ii, { showA: true })}.` });
  const ds = [];
  for (const i2 of INVS) if (i2 !== inv) ds.push(opt(d, i2));
  for (const d2 of DEGS) if (d2 !== d) ds.push(opt(d2, inv));
  return mcq(r, {
    section: SEC, topic: 'c-chords', difficulty: diff, sub: clef,
    prompt: `Which of these is chord ${target} in ${keyName(k)}?`,
    explanation: `Chord ${ROMAN[d - 1]} in ${keyName(k)} is ${triad(k, d).map((p) => name(p)).join('–')}. "${inv}" means ${INVERSION_NAMES[inv]}, so the lowest note is ${name(triad(k, d)[INVS.indexOf(inv)])}.`,
  }, { ...opt(d, inv), why: undefined }, ds);
}

export function genChordNotes(r, diff) {
  const k = r.pick(keysFor(diff));
  const d = r.pick(DEGS);
  const tri = triad(k, d);
  const which = r.int(0, 2);
  const roleNames = ['root', '3rd', '5th'];
  const correct = name(tri[which]);
  const sc = keyScale(k, 4).slice(0, 7);
  const ds = sc.filter((p) => name(p) !== correct).map((p) => ({ label: name(p) }));
  if (k.mode === 'minor' && d === 5 && which === 1) ds.push({ label: name(pitch(tri[1].letter, tri[1].acc - 1)), why: 'In a minor key, chord V uses the raised leading note (harmonic minor).' });
  return mcq(r, {
    section: SEC, topic: 'c-chords', difficulty: diff,
    prompt: `Which note is the ${roleNames[which]} of chord ${ROMAN[d - 1]} in ${keyName(k)}?`,
    explanation: `Chord ${ROMAN[d - 1]} in ${keyName(k)} is built on the ${DEGREE_NAMES[d - 1]}: ${tri.map((p) => name(p)).join('–')}. Its ${roleNames[which]} is ${correct}.`,
  }, { label: correct }, ds);
}

export function genChordFacts(r, diff) {
  const k = r.pick(keysFor(diff));
  const qual = (d) => triadQuality(triad(k, d));
  const st = [];
  for (const d of DEGS) {
    st.push({ text: `In ${keyName(k)}, chord ${ROMAN[d - 1]} is a ${qual(d)} triad.`, answer: true });
    const wrong = ['major', 'minor', 'diminished'].filter((q) => q !== qual(d));
    st.push({ text: `In ${keyName(k)}, chord ${ROMAN[d - 1]} is a ${r.pick(wrong)} triad.`, answer: false });
  }
  const d = r.pick(DEGS);
  st.push({ text: `In ${keyName(k)}, chord ${ROMAN[d - 1]}b has ${name(triad(k, d)[1])} as its lowest note.`, answer: true });
  st.push({ text: `In ${keyName(k)}, chord ${ROMAN[d - 1]}c has ${name(triad(k, d)[0])} as its lowest note.`, answer: false });
  return trueFalse(r, { section: SEC, topic: 'c-chords', difficulty: diff, prompt: 'Are these statements true or false?', explanation: `${keyName(k)}: I = ${triad(k, 1).map((p) => name(p)).join('–')}, II = ${triad(k, 2).map((p) => name(p)).join('–')}, IV = ${triad(k, 4).map((p) => name(p)).join('–')}, V = ${triad(k, 5).map((p) => name(p)).join('–')}. "b" = 1st inversion (3rd in the bass), "c" = 2nd inversion (5th in the bass).` }, st, 4);
}

// ---- Cadences -------------------------------------------------------------

export function genCadenceName(r, diff) {
  const k = r.pick(CAD_KEYS);
  const type = r.pick(['perfect', 'plagal', 'imperfect']);
  const pair = type === 'perfect' ? [5, 1] : type === 'plagal' ? [4, 1] : r.pick([[1, 5], [2, 5], [4, 5]]);
  // Perfect and plagal cadences use root-position chords; the first chord of an imperfect cadence may be inverted.
  const inv1 = type !== 'imperfect' ? 'a' : pair[0] === 1 && diff >= 2 && r.chance(0.3) ? 'c' : r.pick(['a', 'a', 'b']);
  const v1 = fitChord(k, pair[0], inv1, 'bass');
  const v2 = fitChord(k, pair[1], 'a', 'bass');
  const music = { clef: 'bass', key: k.fifths, free: true, notes: [{ keys: v1.map((p) => toString(p)), dur: 'h' }, { keys: v2.map((p) => toString(p)), dur: 'h' }], scale: 1.2 };
  const why = { perfect: 'A perfect cadence is V–I.', plagal: 'A plagal cadence is IV–I.', imperfect: 'An imperfect cadence ends on V (for example I–V, II–V or IV–V).' };
  return mcq(r, {
    section: SEC, topic: 'c-cadences', difficulty: diff,
    prompt: `These two chords are in ${keyName(k)}. Name the cadence.`,
    music,
    listenAfter: { kind: 'sequence', events: [{ notes: v1.map((p) => toString(p)), beats: 2 }, { notes: v2.map((p) => toString(p)), beats: 3 }], tempo: 70 },
    explanation: `The chords are ${ROMAN[pair[0] - 1]} (${triad(k, pair[0]).map((p) => name(p)).join('–')}) then ${ROMAN[pair[1] - 1]} (${triad(k, pair[1]).map((p) => name(p)).join('–')}). ${why[type]}`,
  }, { label: `${type} cadence` }, ['perfect', 'plagal', 'imperfect'].filter((t) => t !== type).map((t) => ({ label: `${t} cadence`, why: why[t] })), 3);
}

/**
 * Melody in C, G, D or F major with two cadences. Four drop-down boxes for the
 * chords (I, II, IV or V). Every combination that fits the melody notes and
 * makes a real cadence is accepted; the final cadence must be perfect or plagal.
 */
export function genCadenceChords(r, diff) {
  for (let tries = 0; tries < 60; tries++) {
    const k = r.pick(CAD_KEYS);
    const sc = [...keyScale(k, 4).slice(0, 7), ...keyScale(k, 5).slice(0, 7)];
    const inRange = sc.filter((p) => staffPos(p, 'treble') >= -1 && staffPos(p, 'treble') <= 9);
    // Choose the final cadence notes: penultimate from IV or V, last from I.
    const lastChoices = inRange.filter((p) => chordContains(k, 1, p));
    const n4 = r.pick(lastChoices);
    const penChoices = inRange.filter((p) => (chordContains(k, 5, p) || chordContains(k, 4, p)) && Math.abs(staffPos(p, 'treble') - staffPos(n4, 'treble')) <= 4 && staffPos(p, 'treble') !== staffPos(n4, 'treble'));
    if (!penChoices.length) continue;
    const n3 = r.pick(penChoices);
    // Mid cadence: second note in V (imperfect), first note anything that works.
    const n2 = r.pick(inRange.filter((p) => chordContains(k, 5, p)));
    const n1choices = inRange.filter((p) => Math.abs(staffPos(p, 'treble') - staffPos(n2, 'treble')) <= 3 && staffPos(p, 'treble') !== staffPos(n2, 'treble') && cadenceOptions(k, p, n2, 'any').length);
    if (!n1choices.length) continue;
    const n1 = r.pick(n1choices);
    const midOpts = cadenceOptions(k, n1, n2, 'any');
    const endOpts = cadenceOptions(k, n3, n4, 'final');
    if (!midOpts.length || !endOpts.length) continue;
    // Fill the rest of the phrase stepwise.
    const walk = (from, to, len) => {
      const out = [];
      let cur = staffPos(from, 'treble');
      const goal = staffPos(to, 'treble');
      for (let i = 0; i < len; i++) {
        const dir = Math.sign(goal - cur) || r.pick([-1, 1]);
        cur = Math.max(-1, Math.min(9, cur + (r.chance(0.7) ? dir : -dir) * r.pick([1, 1, 2])));
        out.push(cur);
      }
      return out.map((p) => sc.find((s) => staffPos(s, 'treble') === p));
    };
    const start = r.pick(inRange.filter((p) => chordContains(k, 1, p)));
    const b1 = [start, ...walk(start, n1, 2)];
    const mid = walk(n2, n3, 4);
    if ([...b1, ...mid].some((x) => !x)) continue;
    const q = (p, extra = {}) => ({ keys: toString(p), dur: 'q', ...extra });
    const measures = [
      { notes: [...b1.map((p) => q(p)), q(n1, { text: '1' })] },
      { notes: [{ keys: toString(n2), dur: 'h', text: '2' }, q(mid[0]), q(mid[1])] },
      { notes: [q(mid[2]), q(mid[3]), { keys: toString(n3), dur: 'h', text: '3' }] },
      { notes: [{ keys: toString(n4), dur: 'w', text: '4' }] },
    ];
    const R = ['I', 'II', 'IV', 'V'];
    const combos = [];
    for (const m of midOpts) for (const e of endOpts) combos.push([R[DEGS.indexOf(m[0])], R[DEGS.indexOf(m[1])], R[DEGS.indexOf(e[0])], R[DEGS.indexOf(e[1])]]);
    const ex = combos[0];
    return {
      section: SEC, topic: 'c-cadences', difficulty: diff, type: 'dropdown',
      prompt: `This melody is in ${keyName(k)}. Choose suitable chords (I, II, IV or V) for the notes marked 1–4, so that bars 1–2 end with a cadence and the melody ends with a perfect or plagal cadence.`,
      music: { clef: 'treble', key: k.fifths, time: '4/4', measures, scale: 1.05 },
      dropdowns: [1, 2, 3, 4].map((i) => ({ label: `Chord ${i}`, options: R, answer: ex[i - 1] })),
      acceptCombos: combos,
      check: { kind: 'cadence-chords', fifths: k.fifths, notes: [n1, n2, n3, n4].map((p) => toString(p)) },
      explanation: `Each chord must contain its melody note. In ${keyName(k)}: I = ${triad(k, 1).map((p) => name(p)).join('–')}, II = ${triad(k, 2).map((p) => name(p)).join('–')}, IV = ${triad(k, 4).map((p) => name(p)).join('–')}, V = ${triad(k, 5).map((p) => name(p)).join('–')}. Note 2 is ${name(n2)}, in chord V, so chords 1–2 make an imperfect cadence${midOpts.length > 1 ? ' (several first chords fit)' : ''}. Notes 3–4 (${name(n3)} → ${name(n4)}) give a ${endOpts[0][2]} cadence: ${R[DEGS.indexOf(endOpts[0][0])]}–I.`,
    };
  }
  throw new Error('cadenceChords');
}

export const CHORD_TOPICS = [
  { id: 'c-chords', section: 5, title: 'Chords I, II, IV, V and inversions', gens: [genChordIdentify, genChordWhich, genChordNotes, genChordFacts] },
  { id: 'c-cadences', section: 5, title: 'Cadences and choosing chords', gens: [genCadenceName, genCadenceChords] },
];

void parse; void cadenceType;
