// Printable one-page summary per exam section (facts computed from the brain / term lists).
import { h } from '../dom.js';
import { SECTIONS, sectionById } from '../content/sections.js';
import { renderMusic } from '../notation/render.js';
import { GRADE5_MAJOR, keyName, relative, signature, DEGREE_NAMES, key } from '../theory/keys.js';
import { triad } from '../theory/chords.js';
import { name } from '../theory/pitch.js';
import { TERMS, ORNAMENTS, INSTRUMENTS, VOICES, SIGNS } from '../content/terms.js';
import { icon } from '../ui/icons.js';

const music = (spec) => { const d = h('div', { class: 'sum-music' }); renderMusic(d, { ...spec, scale: 0.85 }); return d; };
const table = (head, rows) => h('table', { class: 'table sum-table' }, h('thead', {}, h('tr', {}, head.map((c) => h('th', {}, c)))), h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, c))))));
const list = (items) => h('ul', {}, items.map((i) => h('li', {}, i)));
const tri = (t, m, d) => triad(key(t, m), d).map((p) => name(p)).join('–');

const CONTENT = {
  1: () => [
    table(['Note', 'Crotchet beats'], [['breve', '8'], ['semibreve', '4'], ['minim', '2'], ['crotchet', '1'], ['quaver', '½'], ['semiquaver', '¼'], ['demisemiquaver', '⅛']]),
    list(['Dot = + half the value; double dot = + half + quarter.', 'Simple time: top 2, 3, 4 (beats split in 2). Compound: 6, 9, 12 (dotted beats split in 3; beats = top ÷ 3). Irregular: 5/4, 7/4, 5/8, 7/8 (groups of 2s and 3s).', 'Triplet 3 in 2 · duplet 2 in 3 · quintuplet 5 in 4 · sextuplet 6 in 4.', 'Rests: finish the part-beat first, then whole beats. Whole bar = semibreve rest (breve rest in 4/2). 4/4: minim rest only on beats 1–2 or 3–4.', 'Simple + triplets ↔ compound (2/4 ↔ 6/8, 3/4 ↔ 9/8, 4/4 ↔ 12/8). Halve values → double the bottom number.']),
  ],
  2: () => [
    h('div', { class: 'sum-row' }, ['treble', 'bass', 'alto', 'tenor'].map((c) => h('div', {}, h('strong', {}, `${c[0].toUpperCase()}${c.slice(1)}: middle C`), music({ clef: c, free: true, notes: [{ keys: 'C4', dur: 'w' }] })))),
    list(['Treble lines E G B D F · bass G B D F A · alto F A C E G · tenor D F A C E.', 'Enharmonic: same pitch, different name (F♯ = G♭, B♯ = C, F𝄪 = G).', 'Octave transposition: same letter names, move 8 notes; copy the key signature and accidentals.', 'Instruments in B♭ sound a major 2nd lower · in A a minor 3rd lower · in F a perfect 5th lower.', 'Written → concert: go DOWN. Concert → written: go UP. Move the key signature too.']),
  ],
  3: () => [
    table(['Major', '♯/♭', 'Relative minor'], GRADE5_MAJOR.slice().sort((a, b) => a.fifths - b.fifths).map((k) => [keyName(k), signature(k).map((s) => name({ letter: s.letter, acc: s.acc })).join(' ') || '—', keyName(relative(k))])),
    list(['Order of sharps F C G D A E B; flats B E A D G C F.', `Degrees: ${DEGREE_NAMES.map((d, i) => `${i + 1} ${d}`).join(', ')}.`, 'Harmonic minor: raise the 7th. Melodic minor: raise 6th and 7th going up, natural coming down.', 'Chromatic: semitones, no letter more than twice in a row, none skipped.', 'Tenor-clef sharps start on the 2nd line (F♯).']),
  ],
  4: () => [
    list(['Number: count letters, including both notes. Quality: compare with the major scale of the LOWER note.', 'Perfect: 1, 4, 5, 8. Major/minor: 2, 3, 6, 7.', 'Major − 1 semitone = minor; − 2 = diminished; major + 1 = augmented. Perfect ± 1 = augmented/diminished.', 'Compound = more than an octave: subtract 7 (10th = compound 3rd).', 'Semitones: m2 1 · M2 2 · m3 3 · M3 4 · P4 5 · A4/d5 6 · P5 7 · m6 8 · M6 9 · m7 10 · M7 11 · P8 12.']),
  ],
  5: () => [
    table(['Key', 'I', 'II', 'IV', 'V'], ['C', 'G', 'D', 'F'].map((t) => [keyName(key(t)), tri(t, 'major', 1), tri(t, 'major', 2), tri(t, 'major', 4), tri(t, 'major', 5)])),
    list(['a = root position, b = 1st inversion (3rd in bass), c = 2nd inversion (5th in bass).', 'Minor keys use the harmonic minor: V major, II diminished.', 'Perfect V–I · plagal IV–I · imperfect ends on V (I–V, II–V, IV–V). Cadences only in C, G, D, F major.']),
  ],
  6: () => [
    table(['Grade 5 term', 'Meaning'], TERMS.filter((t) => t.grade === 5).map((t) => [t.term, t.meaning])),
    list([`Ornaments: ${ORNAMENTS.map((o) => `${o.name} (${o.describe})`).join('; ')}.`, `Signs: ${SIGNS.map((s) => `${s.name} = ${s.meaning}`).join('; ')}.`, `Reeds: single = clarinet; double = oboe, cor anglais, bassoon; none = flute, piccolo. Voices: ${VOICES.map((v) => v.name).join(', ')}.`, `Definite-pitch percussion: ${INSTRUMENTS.filter((i) => i.pitch === 'definite').map((i) => i.name).join(', ')}.`]),
  ],
  7: () => [
    list(['Key: key signature → major or relative minor; look for the raised leading note; check the last note.', 'Time: simple, compound or irregular? How many beats?', 'Terms and signs: say what every word and symbol means.', 'Notes: highest/lowest, accidentals, intervals between marked notes (remember the key signature!).', 'Chords: three notes a 3rd apart in one bar outline a chord (I, II, IV or V).', 'Instruments: which clef, which family, could it be played by …?']),
  ],
};

export default async function summary({ id }) {
  const sec = sectionById(id) || SECTIONS[0];
  return h('div', { class: 'summary-page' },
    h('div', { class: 'row between no-print' },
      h('a', { class: 'back-link', href: '#/learn' }, icon('back', 'coin-icon'), 'Lessons'),
      h('div', { class: 'row' }, SECTIONS.map((s) => h('a', { class: `btn small${s.id === sec.id ? ' primary' : ''}`, href: `#/summary/${s.id}` }, String(s.id))), h('button', { class: 'btn primary', onclick: () => window.print() }, icon('print', 'coin-icon'), 'Print'))),
    h('article', { class: 'card sum-card' },
      h('div', { class: 'eyebrow' }, `Grade 5 Theory · one-page summary · ${sec.marks} marks`),
      h('h1', {}, `Section ${sec.id}: ${sec.title}`),
      ...CONTENT[sec.id]()));
}
