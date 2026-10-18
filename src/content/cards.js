// Flashcard decks, built from the official term lists and the music brain.
import { TERMS, SIGNS, DIRECTIONS, ORNAMENTS, INSTRUMENTS, VOICES } from './terms.js';
import { GRADE5_KEYS, keyName, relative, signature } from '../theory/keys.js';
import { name } from '../theory/pitch.js';

const sigText = (k) => (k.fifths === 0 ? 'no sharps or flats' : `${Math.abs(k.fifths)} ${k.fifths > 0 ? 'sharp' : 'flat'}${Math.abs(k.fifths) > 1 ? 's' : ''}: ${signature(k).map((s) => name({ letter: s.letter, acc: s.acc })).join(' ')}`);

export const DECKS = [
  { id: 'terms-g5', title: 'Grade 5 terms (Italian & German)', grade: 5, cards: TERMS.filter((t) => t.grade === 5).map((t) => ({ id: `t:${t.id}`, front: t.term, sub: `${t.lang} · Grade ${t.grade}`, back: t.meaning })) },
  { id: 'terms-g4', title: 'Grade 4 terms (Italian & French)', grade: 4, cards: TERMS.filter((t) => t.grade === 4).map((t) => ({ id: `t:${t.id}`, front: t.term, sub: `${t.lang} · Grade ${t.grade}`, back: t.meaning })) },
  { id: 'terms-g13', title: 'Grades 1–3 terms', grade: 3, cards: TERMS.filter((t) => t.grade <= 3).map((t) => ({ id: `t:${t.id}`, front: t.term, sub: `${t.lang} · Grade ${t.grade}`, back: t.meaning })) },
  { id: 'keys', title: 'Key signatures (all 26 keys)', grade: 5, cards: GRADE5_KEYS.map((k) => ({ id: `k:${k.tonic}-${k.mode}`, front: keyName(k), sub: 'How many sharps or flats?', back: `${sigText(k)} · relative ${relative(k).mode}: ${keyName(relative(k))}`, music: { clef: 'treble', key: k.fifths, free: true, notes: [], scale: 1.2 }, musicOnBack: true })) },
  { id: 'keys-reverse', title: 'Name the key from its signature', grade: 5, cards: GRADE5_KEYS.filter((k) => k.mode === 'major').map((k) => ({ id: `kr:${k.tonic}`, front: '', sub: 'Which major and minor key?', music: { clef: 'treble', key: k.fifths, free: true, notes: [], scale: 1.3 }, back: `${keyName(k)} / ${keyName(relative(k))}` })) },
  { id: 'signs', title: 'Signs, directions and ornaments', grade: 5, cards: [
    ...SIGNS.map((s) => ({ id: `s:${s.id}`, front: '', sub: 'What does this sign mean?', music: { clef: 'treble', free: true, notes: [{ keys: 'B4', dur: 'q', art: [s.art], stem: 'down' }], scale: 1.5 }, back: `${s.name}: ${s.meaning}` })),
    ...DIRECTIONS.map((d) => ({ id: `d:${d.term}`, front: d.term, sub: `Instrumental direction · Grade ${d.grade}`, back: d.meaning })),
    ...ORNAMENTS.filter((o) => !['appoggiatura', 'acciaccatura'].includes(o.id)).map((o) => ({ id: `o:${o.id}`, front: '', sub: 'Name this ornament', music: { clef: 'treble', free: true, notes: [{ keys: 'C5', dur: 'q', orn: o.id }], scale: 1.5 }, back: `${o.name}: ${o.describe}` })),
  ] },
  { id: 'instruments', title: 'Instruments and voices', grade: 5, cards: [
    ...INSTRUMENTS.map((i) => ({ id: `i:${i.name}`, front: i.name, sub: 'Family? Clef? How is the sound made?', back: `${i.family}${i.clefs.length ? ` · ${i.clefs.join('/')} clef` : ''} · ${i.sound}${i.notes ? ` · ${i.notes}` : ''}${i.pitch ? ` · ${i.pitch} pitch` : ''}` })),
    ...VOICES.map((v) => ({ id: `v:${v.name}`, front: v.name, sub: 'Voice type', back: `${v.type} (number ${v.order} of 6, high to low)` })),
  ] },
];

/** Leitner-style spaced repetition. Box 0 = new/forgotten … 5 = well known. */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16];

export function dueCards(deck, saved, now = Date.now()) {
  return deck.cards.filter((c) => { const s = saved[c.id]; return !s || s.due <= now; });
}

export function review(saved, cardId, knewIt, now = Date.now()) {
  const cur = saved[cardId] || { box: 0, due: 0, seen: 0 };
  const box = knewIt ? Math.min(5, cur.box + 1) : 0;
  saved[cardId] = { box, due: now + BOX_DAYS[box] * 86400000 + (knewIt ? 0 : 60_000), seen: cur.seen + 1 };
  return saved[cardId];
}
