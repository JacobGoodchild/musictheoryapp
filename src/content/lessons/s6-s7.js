// Section 6 (terms, signs, instruments) and Section 7 (music in context) lessons.
import { TERMS, SIGNS, DIRECTIONS, ORNAMENTS, INSTRUMENTS, VOICES } from '../terms.js';
import { writtenOut, signVersion } from '../../questions/gen-terms.js';
import { key } from '../../theory/keys.js';
import { parse } from '../../theory/pitch.js';
import { buildExtract } from '../../questions/gen-context.js';
import { rng } from '../../questions/util.js';
import { keyName as kName, relative as rel } from '../../theory/keys.js';
import { classifyTime } from '../../theory/rhythm.js';
import { between, intervalName } from '../../theory/interval.js';
import { triad as tr, chordLabel } from '../../theory/chords.js';
import { parse as ps, name as nm, midi as md } from '../../theory/pitch.js';

const termRows = (filter) => TERMS.filter(filter).map((t) => [`**${t.term}**`, t.meaning]);
const C = key('C');
const ornRow = (id) => ({
  music: { clef: 'treble', time: '2/4', measures: [{ notes: [...signVersion(id, parse('E5'), C), { keys: 'C5', dur: 'q' }] }, { notes: [...writtenOut(id, parse('E5'), C), { keys: 'C5', dur: 'q' }] }], scale: 1 },
  caption: `**${id}**: sign (bar 1) and how it is played (bar 2)`,
});
const extract = buildExtract(rng(424242), 2);
// Facts about the extract, all computed from its data.
const ex = (() => {
  const notes = extract.measures.flatMap((m, b) => m.notes.filter((x) => !x.rest).map((x) => ({ p: ps(x.keys), bar: b + 1 })));
  const hi = notes.reduce((a, b) => (md(b.p) > md(a.p) ? b : a));
  let iv = null;
  if (extract.xNote) { const a = ps(extract.xNote.keys), c = ps(extract.yNote.keys); const [lo, up] = md(a) <= md(c) ? [a, c] : [c, a]; iv = { a, c, name: intervalName(between(lo, up)) }; }
  return { hi, iv, time: classifyTime(extract.ts).label, chord: chordLabel(extract.chordDeg, 'a'), chordNotes: tr(extract.k, extract.chordDeg).map((p) => nm(p)).join(', ') };
})();

export const TERMS_LESSONS = [
  {
    id: 'terms-italian', section: 6, refresh: true, glyph: '𝆏', title: 'Italian terms (Grades 1–5)',
    summary: 'Speed, dynamics, mood and other directions you must know.',
    blocks: [
      { type: 'intro', text: 'All terms from Grades 1–5 can appear at Grade 5. These are the official ABRSM lists (from 2020). Learn them in small groups and use the Flashcards in **Memorise**.' },
      { type: 'heading', text: 'Grade 5 (new)' },
      { type: 'table', head: ['Term', 'Meaning'], rows: termRows((t) => t.grade === 5 && t.lang === 'Italian') },
      { type: 'heading', text: 'Grade 4' },
      { type: 'table', head: ['Term', 'Meaning'], rows: termRows((t) => t.grade === 4 && t.lang === 'Italian') },
      { type: 'heading', text: 'Grade 3' },
      { type: 'table', head: ['Term', 'Meaning'], rows: termRows((t) => t.grade === 3) },
      { type: 'heading', text: 'Grades 1 and 2' },
      { type: 'table', head: ['Term', 'Meaning'], rows: termRows((t) => t.grade <= 2) },
      { type: 'keypoints', items: ['Learn little words that combine: **con** (with), **senza** (without), **molto** (very), **poco** (a little), **meno** (less), **più** (more), **ma non troppo** (but not too much).', 'So *poco più mosso* = a little more movement (a little quicker).'] },
      { type: 'mistakes', items: ['Mixing up *rallentando* (gradually slower) and *ritenuto* (held back, slower at once).', '*Morendo*, *perdendosi* and *smorzando* all mean "dying away".'] },
      { type: 'memorise', items: ['Grade 5 set: a niente, ad libitum, attacca, cantando, con dolore, con spirito, doloroso, largamente, morendo, perdendosi, quasi, rinforzando, smorzando, sonoro, sotto voce.'] },
    ],
    check: { topics: ['t-terms'], count: 6 },
  },
  {
    id: 'terms-french-german', section: 6, isNew: true, glyph: 'Ä', title: 'French and German terms',
    summary: 'Six French terms (Grade 4) and six German terms (Grade 5).',
    blocks: [
      { type: 'intro', text: 'Grade 4 added six **French** terms and Grade 5 adds six **German** terms. Many match Italian ones you know.' },
      { type: 'table', head: ['French', 'Meaning'], rows: termRows((t) => t.lang === 'French') },
      { type: 'table', head: ['German', 'Meaning'], rows: termRows((t) => t.lang === 'German') },
      { type: 'keypoints', items: ['French *lent* and German *langsam* both mean slow (like Italian *lento*).', 'German *schnell* = fast; *lebhaft* = lively; *mässig* = moderate speed.'] },
      { type: 'mistakes', items: ['Thinking *lent* means "lent" in English: it means slow.', 'Confusing *ruhig* (peaceful) and *traurig* (sad).'] },
      { type: 'memorise', items: ['German: langsam, lebhaft, mässig, ruhig, schnell, traurig.', 'French: animé, douce, lent, modéré, retenu, vite.'] },
    ],
    check: { topics: ['t-terms'], count: 5, difficulty: 3 },
  },
  {
    id: 'terms-signs-ornaments', section: 6, glyph: '𝆖', title: 'Signs and ornaments',
    summary: 'Articulation, instrumental directions, and recognising written-out ornaments.',
    blocks: [
      { type: 'intro', text: 'Signs tell the player how to play a note. At Grade 5 you must also recognise **ornaments written out in full** and choose the sign that replaces them.' },
      { type: 'music', music: { clef: 'treble', free: true, scale: 1.15, notes: SIGNS.map((s) => ({ keys: 'B4', dur: 'q', art: [s.art], stem: 'down', label: s.name.split(' (')[0] })), noteWidth: 80 }, caption: SIGNS.map((s) => `${s.name}: ${s.meaning}`).join(' · ') },
      { type: 'table', head: ['More signs (Grades 1–2)', 'Meaning'], rows: [
        ['**crescendo / diminuendo hairpins** (< and >)', 'gradually getting louder / gradually getting quieter'],
        ['**semi-staccato** (dots under a slur, or dot with a tenuto line)', 'slightly separated'],
        ['**8va** (over the notes) / **8va bassa** (under the notes)', 'play an octave higher / an octave lower'],
        ['**multi-bar rest** (thick bar with a number over it)', 'rest for that number of bars'],
        ['**repeat marks**', 'play the passage between the marks again'],
        ['**volta brackets** (1. and 2.)', '1st-time and 2nd-time bars: on the repeat, skip bar 1. and play bar 2.'],
        ['**C** / **¢**', 'common time (4/4) / alla breve (2/2)'],
      ] },
      { type: 'table', head: ['Direction', 'Meaning'], rows: DIRECTIONS.map((d) => [`**${d.term}**`, d.meaning]) },
      { type: 'heading', text: 'Ornaments' },
      ...['upper mordent', 'lower mordent', 'turn', 'trill', 'appoggiatura', 'acciaccatura'].map((id) => ({ type: 'music', ...ornRow(id) })),
      { type: 'table', head: ['Ornament', 'What you play'], rows: ORNAMENTS.map((o) => [`**${o.name}**`, o.describe]) },
      { type: 'keypoints', items: ['Upper mordent: note–above–note. Lower mordent: note–below–note (the sign has a line through it).', 'Turn: above–note–below–note.', 'Acciaccatura (with a slash) is crushed in; appoggiatura (no slash) takes time from the main note.'] },
      { type: 'mistakes', items: ['Mixing up the upper mordent (no line) and lower mordent (with a vertical line).'] },
      { type: 'memorise', items: ['Slash = acciaccatura = "crushed". No slash = appoggiatura = "leaning".'] },
    ],
    check: { topics: ['t-signs', 't-ornaments'], count: 6 },
  },
  {
    id: 'terms-instruments', section: 6, isNew: true, glyph: '🎻', title: 'Instruments and voices',
    summary: 'Families, clefs, reeds, transposing instruments and voice types.',
    blocks: [
      { type: 'intro', text: 'You need a broad understanding of the standard orchestral instruments: their **family**, **clef**, **how they make sound**, and whether they **transpose**.' },
      ...['strings', 'woodwind', 'brass', 'percussion', 'keyboard'].map((fam) => ({ type: 'table', head: [fam[0].toUpperCase() + fam.slice(1), 'Clef(s)', 'Sound', 'Notes'], rows: INSTRUMENTS.filter((i) => i.family === fam).map((i) => [`**${i.name}**`, i.clefs.join(', ') || '—', i.sound + (i.pitch ? ` (${i.pitch} pitch)` : ''), i.notes || (i.transposing ? 'transposing' : '')]) })),
      { type: 'text', text: ['Woodwind: the **clarinet** has a **single reed**; the **oboe**, **cor anglais** and **bassoon** have **double reeds**; the **flute** and **piccolo** have **no reed**.', 'Percussion of **definite pitch** plays particular notes (timpani, xylophone, glockenspiel…); **indefinite pitch** does not (side drum, cymbals, triangle…).'] },
      { type: 'table', head: ['Voice (high → low)', 'Description', 'Rough range'], rows: VOICES.map((v) => [`**${v.name}**`, v.type, v.range]) },
      { type: 'keypoints', items: ['Viola reads the alto clef; cello, bassoon and trombone use the tenor clef for high notes.', 'Transposing: clarinet (B♭/A), trumpet (B♭), horn (F), cor anglais (F). Some instruments sound an octave (or two) away from the written notes: piccolo, xylophone and celesta sound an octave higher, glockenspiel two octaves higher, and double bass an octave lower.'] },
      { type: 'mistakes', items: ['Putting the horn in the woodwind family (it is brass).', 'Thinking the flute uses a reed.'] },
      { type: 'memorise', items: ['Voices: soprano, mezzo-soprano, alto, tenor, baritone, bass.'] },
    ],
    check: { topics: ['t-instruments'], count: 6 },
  },
];

export const CONTEXT_LESSONS = [
  {
    id: 'context-howto', section: 7, glyph: '🔍', title: 'How to tackle music in context',
    summary: 'A step-by-step method for questions about an extract.',
    blocks: [
      { type: 'intro', text: 'The last section shows a short piece of music and asks questions that combine everything: keys, intervals, chords, rhythm, terms, ornaments and instruments.' },
      { type: 'music', music: extract.music, caption: 'A practice extract (original music, made for this app).' },
      { type: 'worked', title: 'Using the method on this extract', steps: [
        { text: `**Key**: the key signature means ${kName(extract.k)} or ${kName(rel(extract.k))}. ${extract.k.mode === 'minor' ? `The ${nm(extract.sc[6])} accidental is the raised leading note, and the music ends on ${nm(extract.sc[7])}: **${kName(extract.k)}**.` : `There is no raised leading note for the minor key, and it ends on ${nm(extract.sc[7])}: **${kName(extract.k)}**.`}` },
        { text: `**Time**: ${extract.ts} is ${ex.time}.` },
        { text: `**Terms**: "${extract.measures[0].notes[0].text}" at the start means "${extract.tempo.meaning}". The ornament in bar ${extract.ornBar + 1} is a${/^[aeiou]/.test(extract.orn) ? 'n' : ''} ${extract.orn}.` },
        ...(ex.iv ? [{ text: `**Interval X–Y** (bar ${extract.ivBar + 1}): with the key signature the notes are ${nm(ex.iv.a)} and ${nm(ex.iv.c)}: a **${ex.iv.name}**.` }] : []),
        { text: `**Chord**: bar ${extract.arpBar + 1} uses only ${ex.chordNotes}, so it outlines chord **${ex.chord}**.` },
        { text: `**Highest note**: ${nm(ex.hi.p, true)}, first in bar ${ex.hi.bar}.` },
      ] },
      { type: 'worked', title: 'A method that works', steps: [
        { text: '**Key**: read the key signature, then look for a raised leading note to decide major or relative minor. Check the last note.' },
        { text: '**Time signature**: is it simple, compound or irregular? How many beats?' },
        { text: '**Terms and signs**: find every word and symbol and say what it means.' },
        { text: '**Notes**: find the highest and lowest notes; spot accidentals; name intervals between marked notes (remember the key signature).' },
        { text: '**Chords**: if a bar uses only three notes in thirds, it outlines a chord: work out which.' },
      ] },
      { type: 'keypoints', items: ['Read the whole extract before the questions.', 'The key signature affects every note with that letter name, in every octave.', 'Count bars carefully (bar 1 is the first full bar).'] },
      { type: 'mistakes', items: ['Forgetting the key signature when naming intervals.', 'Mixing up the ornament names.'] },
      { type: 'memorise', items: ['K-T-T-N-C: Key, Time, Terms, Notes, Chords.'] },
    ],
    check: { topics: ['x-context'], count: 5 },
  },
];
