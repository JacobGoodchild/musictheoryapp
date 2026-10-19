// Section 1 lessons: Rhythm.
const n = (keys, dur, extra = {}) => ({ keys, dur, ...extra });
const r = (dur, extra = {}) => ({ rest: true, dur, ...extra });
const trip = (id, num = 3, occ = 2) => ({ tuplet: { id, num, occupied: occ } });

export const RHYTHM_LESSONS = [
  {
    id: 'rhythm-values', section: 1, refresh: true, glyph: '♩', title: 'Note and rest values',
    summary: 'From the breve down to the demisemiquaver, plus dots, double dots and ties.',
    blocks: [
      { type: 'intro', text: 'Every note and rest has a length. Each value is **half** the one before it, so they fit together like a family tree.' },
      { type: 'music', music: { clef: 'treble', free: true, scale: 1.05, notes: [n('B4', '1/2', { label: 'breve' }), n('B4', 'w', { label: 'semibreve' }), n('B4', 'h', { label: 'minim' }), n('B4', 'q', { label: 'crotchet' }), n('B4', '8', { label: 'quaver' }), n('B4', '16', { label: 'semiquaver' }), n('B4', '32', { label: 'demisemiquaver' })] }, caption: 'The note values, longest to shortest. Each lasts half as long as the one before.' },
      { type: 'table', head: ['Note', 'Crotchet beats', 'Equals'], rows: [['breve', '8', '2 semibreves'], ['semibreve', '4', '2 minims'], ['minim', '2', '2 crotchets'], ['crotchet', '1', '2 quavers'], ['quaver', '½', '2 semiquavers'], ['semiquaver', '¼', '2 demisemiquavers'], ['demisemiquaver', '⅛', '']] },
      { type: 'music', music: { clef: 'treble', free: true, scale: 1.05, notes: [r('1/2', { label: 'breve' }), r('w', { label: 'semibreve' }), r('h', { label: 'minim' }), r('q', { label: 'crotchet' }), r('8', { label: 'quaver' }), r('16', { label: 'semiquaver' }), r('32', { label: 'demisemiquaver' })] }, caption: 'The matching rests. The semibreve rest **hangs** from the 4th line; the minim rest **sits** on the 3rd line.' },
      { type: 'heading', text: 'Dots and double dots' },
      { type: 'text', text: ['A **dot** adds half the note\'s value again. A dotted minim = minim + crotchet = 3 crotchet beats.', 'A **double dot** adds half, then half of that. A double-dotted minim = minim + crotchet + quaver = 3½ crotchet beats.'] },
      { type: 'music', music: { clef: 'treble', free: true, scale: 1.1, notes: [n('G4', 'h', { dots: 1, label: '3 beats' }), n('G4', 'q', { dots: 1, label: '1½ beats' }), n('G4', 'h', { dots: 2, label: '3½ beats' }), n('G4', 'q', { dots: 2, label: '1¾ beats' })] }, caption: 'Dotted minim, dotted crotchet, double-dotted minim, double-dotted crotchet.' },
      { type: 'worked', title: 'How many semiquavers in a double-dotted crotchet?', steps: [
        { text: 'A crotchet is 4 semiquavers.' },
        { text: 'The first dot adds half of that: 2 semiquavers (a quaver).' },
        { text: 'The second dot adds half of the first dot: 1 semiquaver.' },
        { text: 'Total: 4 + 2 + 1 = **7 semiquavers**.' },
      ] },
      { type: 'text', text: 'A **tie** joins two notes of the same pitch: play the first and hold it for both values. Ties let a note last across a bar line.' },
      { type: 'keypoints', items: ['Each value is half the one before: breve → semibreve → minim → crotchet → quaver → semiquaver → demisemiquaver.', 'A dot adds half the value; a second dot adds a quarter of the original.', 'A tie joins notes of the **same pitch**; a slur joins different notes.'] },
      { type: 'mistakes', items: ['Mixing up the semibreve rest (hangs below the 4th line) and the minim rest (sits on the 3rd line).', 'Thinking a double dot adds a whole value: it adds half, then a quarter.'] },
      { type: 'memorise', items: ['Breve = 8 crotchet beats; demisemiquaver = ⅛ of a crotchet beat.', 'Dotted = ×1½. Double-dotted = ×1¾.'] },
    ],
    check: { topics: ['r-values'], count: 5 },
  },
  {
    id: 'rhythm-simple', section: 1, refresh: true, glyph: '𝄴', title: 'Simple time signatures',
    summary: 'Duple, triple and quadruple time with minim, crotchet or quaver beats.',
    blocks: [
      { type: 'intro', text: 'A time signature tells you **how many beats** are in each bar (top number) and **what kind of note** gets one beat (bottom number).' },
      { type: 'table', head: ['Bottom number', 'Beat'], rows: [['2', 'minim'], ['4', 'crotchet'], ['8', 'quaver'], ['16', 'semiquaver']] },
      { type: 'text', text: 'In **simple time** each beat is a plain (undotted) note that splits into **two**. The top number is 2 (duple), 3 (triple) or 4 (quadruple).' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '2/4', measures: [{ notes: [n('G4', 'q'), n('A4', '8'), n('B4', '8')] }] }, caption: '2/4: simple duple' },
        { music: { clef: 'treble', time: '3/2', measures: [{ notes: [n('C5', 'h'), n('B4', 'q'), n('A4', 'q'), n('G4', 'h')] }] }, caption: '3/2: simple triple (minim beats)' },
        { music: { clef: 'treble', time: '4/8', measures: [{ notes: [n('E5', '8'), n('D5', '16'), n('C5', '16'), n('B4', '8'), n('A4', '8')] }] }, caption: '4/8: simple quadruple (quaver beats)' },
      ] },
      { type: 'table', head: ['', 'Duple', 'Triple', 'Quadruple'], rows: [['Minim beats', '2/2 (also ¢)', '3/2', '4/2'], ['Crotchet beats', '2/4', '3/4', '4/4 (also C)'], ['Quaver beats', '2/8', '3/8', '4/8']] },
      { type: 'keypoints', items: ['Top number 2, 3 or 4 = simple time.', 'Duple = 2 beats, triple = 3, quadruple = 4.', '**C** means 4/4 (common time); **¢** means 2/2 (alla breve).'] },
      { type: 'mistakes', items: ['3/8 is **simple** triple (3 quaver beats), not compound.', 'In 2/2 the beat is a minim, so four crotchets make one bar of only **two** beats.'] },
      { type: 'memorise', items: ['Simple time: 2, 3 or 4 on top.', 'Bottom 2 = minim, 4 = crotchet, 8 = quaver.'] },
    ],
    check: { topics: ['r-time'], count: 5, difficulty: 1 },
  },
  {
    id: 'rhythm-compound', section: 1, glyph: '𝄵', title: 'Compound time signatures',
    summary: 'Dotted beats that split into three: 6/8, 9/8, 12/8 and friends.',
    blocks: [
      { type: 'intro', text: 'In **compound time** each beat is a **dotted** note, so it splits into **three**. The top number is 6, 9 or 12.' },
      { type: 'text', text: 'To find the number of beats, **divide the top number by 3**: 6/8 has 2 beats, 9/8 has 3, 12/8 has 4. Each beat is a dotted crotchet (three quavers).' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '6/8', measures: [{ notes: [n('G4', '8'), n('A4', '8'), n('B4', '8'), n('C5', 'q', { dots: 1 })] }] }, caption: '6/8: compound duple' },
        { music: { clef: 'treble', time: '9/8', measures: [{ notes: [n('E5', 'q'), n('D5', '8'), n('C5', '8'), n('B4', '8'), n('A4', '8'), n('G4', 'q', { dots: 1 })] }] }, caption: '9/8: compound triple' },
      ] },
      { type: 'table', head: ['', 'Duple', 'Triple', 'Quadruple'], rows: [['Dotted minim beats', '6/4', '9/4', '12/4'], ['Dotted crotchet beats', '6/8', '9/8', '12/8'], ['Dotted quaver beats', '6/16', '9/16', '12/16']] },
      { type: 'worked', title: 'Is 6/8 the same as 3/4?', steps: [
        { text: 'Both bars hold six quavers, so they are the **same length**.' },
        { text: '3/4 has **three crotchet beats**: quavers are grouped in **twos**.', music: { clef: 'treble', time: '3/4', measures: [{ notes: [n('C5', '8', { beam: 1 }), n('B4', '8', { beam: 1 }), n('A4', '8', { beam: 2 }), n('G4', '8', { beam: 2 }), n('F4', '8', { beam: 3 }), n('E4', '8', { beam: 3 })] }] } },
        { text: '6/8 has **two dotted-crotchet beats**: quavers are grouped in **threes**.', music: { clef: 'treble', time: '6/8', measures: [{ notes: [n('C5', '8', { beam: 1 }), n('B4', '8', { beam: 1 }), n('A4', '8', { beam: 1 }), n('G4', '8', { beam: 2 }), n('F4', '8', { beam: 2 }), n('E4', '8', { beam: 2 })] }] } },
        { text: 'So the **grouping** tells you which time signature it is.' },
      ] },
      { type: 'keypoints', items: ['Compound = 6, 9 or 12 on top; beats are dotted.', 'Number of beats = top number ÷ 3.', 'Quavers group in threes in 6/8, 9/8 and 12/8.'] },
      { type: 'mistakes', items: ['Saying 6/8 has six beats: it has **two** (dotted crotchets).', 'Grouping 6/8 quavers in twos (that is 3/4).'] },
      { type: 'memorise', items: ['6 → duple, 9 → triple, 12 → quadruple.', 'Compound beat = dotted note = three of the bottom-number note.'] },
    ],
    check: { topics: ['r-time'], count: 6 },
  },
  {
    id: 'rhythm-irregular', section: 1, isNew: true, glyph: '5', title: 'Irregular time signatures',
    summary: '5/4, 7/4, 5/8 and 7/8: bars with uneven groups.',
    blocks: [
      { type: 'intro', text: 'At Grade 5 you meet **irregular** time signatures: **5/4, 7/4, 5/8 and 7/8**. The bar can\'t be split into equal beats, so it is grouped into twos and threes.' },
      { type: 'text', text: ['**5** splits as **3 + 2** or **2 + 3**.', '**7** splits as **2 + 2 + 3**, **3 + 2 + 2** or **2 + 3 + 2**.'] },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '5/8', measures: [{ notes: [n('C5', '8', { beam: 1 }), n('D5', '8', { beam: 1 }), n('E5', '8', { beam: 1 }), n('D5', '8', { beam: 2 }), n('C5', '8', { beam: 2 })] }] }, caption: '5/8 grouped 3 + 2' },
        { music: { clef: 'treble', time: '7/8', measures: [{ notes: [n('G4', '8', { beam: 1 }), n('A4', '8', { beam: 1 }), n('B4', '8', { beam: 2 }), n('C5', '8', { beam: 2 }), n('D5', '8', { beam: 3 }), n('C5', '8', { beam: 3 }), n('B4', '8', { beam: 3 })] }] }, caption: '7/8 grouped 2 + 2 + 3' },
        { music: { clef: 'treble', time: '5/4', measures: [{ notes: [n('E5', 'h', { dots: 1 }), n('D5', 'q'), n('C5', 'q')] }] }, caption: '5/4 felt as 3 + 2 crotchets' },
      ] },
      { type: 'worked', title: 'Which time signature?', steps: [
        { text: 'Count the notes in the bar in quavers: 3 + 2 + 2 = 7 quavers.', music: { clef: 'treble', measures: [{ notes: [n('E5', 'q'), n('D5', '8'), n('C5', '8', { beam: 2 }), n('B4', '8', { beam: 2 }), n('A4', '8', { beam: 3 }), n('G4', '8', { beam: 3 })] }], endBar: 'single' } },
        { text: 'Seven quavers in a bar = **7/8**.' },
        { text: 'If the notes were crotchets (3 + 2 = 5 crotchets), it would be **5/4**.' },
      ] },
      { type: 'text', text: 'Group notes so the 2s and 3s are easy to see: beam quavers within each group, never across from one group into the next. Rests are written to show the groups too, so a player can count "1-2-3, 1-2".' },
      { type: 'keypoints', items: ['Irregular times at Grade 5: 5/4, 7/4, 5/8, 7/8.', 'Groups are always made of 2s and 3s.', 'Beaming shows the grouping.'] },
      { type: 'mistakes', items: ['Calling 5/8 "compound": it is irregular.', 'Beaming across the groups (e.g. all five quavers of 5/8 in one beam).'] },
      { type: 'memorise', items: ['5 = 3+2 or 2+3. 7 = 2+2+3, 3+2+2 or 2+3+2.'] },
    ],
    check: { topics: ['r-time'], count: 5, difficulty: 3 },
  },
  {
    id: 'rhythm-grouping', section: 1, glyph: '♫', title: 'Grouping notes and rests',
    summary: 'Beaming and rests that show the beats clearly.',
    blocks: [
      { type: 'intro', text: 'Good grouping lets a player **see the beats**. Notes are beamed beat by beat, and rests are written so that each beat is clear.' },
      { type: 'heading', text: 'Rests in simple time' },
      { type: 'text', text: ['**Finish the part-beat first**, then use one rest for each whole beat.', 'A **whole bar** of rest is always a **semibreve rest** (except 4/2, which uses a breve rest).', 'In **4/4**, a minim rest may be used for beats 1–2 or beats 3–4, but **not** for beats 2–3.'] },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '4/4', measures: [{ notes: [n('G4', '8'), r('8'), r('q'), r('h')] }] }, caption: '✓ Quaver, quaver rest, crotchet rest, minim rest' },
        { music: { clef: 'treble', time: '4/4', measures: [{ notes: [n('G4', 'q'), r('q'), r('q'), n('A4', 'q')] }] }, caption: '✓ Beats 2 and 3 need separate crotchet rests' },
      ] },
      { type: 'heading', text: 'Rests in compound time' },
      { type: 'text', text: 'Each whole **dotted beat** gets a **dotted rest**. In 6/8, a whole beat of rest is a dotted crotchet rest.' },
      { type: 'music', music: { clef: 'treble', time: '6/8', measures: [{ notes: [n('C5', 'q', { dots: 1 }), r('q', { dots: 1 })] }, { notes: [n('E5', '8'), n('D5', '8'), n('C5', '8'), r('q', { dots: 1 })] }] }, caption: '6/8: one dotted-crotchet rest for a whole beat.' },
      { type: 'keypoints', items: ['Beam notes beat by beat.', 'Complete the part-beat, then whole beats.', 'Whole-bar rest = semibreve rest (breve rest in 4/2).'] },
      { type: 'mistakes', items: ['A minim rest across beats 2–3 of 4/4.', 'A dotted crotchet rest in 2/4 after a quaver (use a quaver rest then a crotchet rest).'] },
      { type: 'memorise', items: ['"Part-beat first, then whole beats."'] },
    ],
    check: { topics: ['r-rests'], count: 5 },
  },
  {
    id: 'rhythm-triplets', section: 1, glyph: '3', title: 'Triplets and duplets',
    summary: 'Three in the time of two, and two in the time of three.',
    blocks: [
      { type: 'intro', text: 'A **triplet** squeezes **three** notes into the time of **two** of the same kind. A **duplet** stretches **two** notes into the time of **three**.' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '2/4', measures: [{ notes: [n('C5', '8', trip(1)), n('D5', '8', trip(1)), n('E5', '8', trip(1)), n('F5', 'q')] }] }, caption: 'Triplet quavers = one crotchet beat in simple time.', audio: { kind: 'sequence', tempo: 80, events: [{ notes: 'C5', beats: 1 / 3 }, { notes: 'D5', beats: 1 / 3 }, { notes: 'E5', beats: 1 / 3 }, { notes: 'F5', beats: 1 }] } },
        { music: { clef: 'treble', time: '6/8', measures: [{ notes: [n('G4', '8', { tuplet: { id: 1, num: 2, occupied: 3 } }), n('A4', '8', { tuplet: { id: 1, num: 2, occupied: 3 } }), n('B4', 'q', { dots: 1 })] }] }, caption: 'Duplet quavers = one dotted-crotchet beat in compound time.', audio: { kind: 'sequence', tempo: 60, events: [{ notes: 'G4', beats: 0.75 }, { notes: 'A4', beats: 0.75 }, { notes: 'B4', beats: 1.5 }] } },
      ] },
      { type: 'text', text: 'Triplets usually appear in **simple** time (where beats normally split in two). Duplets appear in **compound** time (where beats normally split in three).' },
      { type: 'keypoints', items: ['Triplet = 3 in the time of 2.', 'Duplet = 2 in the time of 3.', 'The number (3 or 2) is written over or under the group.'] },
      { type: 'mistakes', items: ['Thinking triplet quavers last three quavers: they last **two** (one crotchet).'] },
      { type: 'memorise', items: ['Triplet quavers = 1 crotchet. Duplet quavers = 1 dotted crotchet.'] },
    ],
    check: { topics: ['r-tuplets'], count: 5, difficulty: 1 },
  },
  {
    id: 'rhythm-tuplets', section: 1, isNew: true, glyph: '5', title: 'Quintuplets and sextuplets',
    summary: 'Five or six notes squeezed into the time of four.',
    blocks: [
      { type: 'intro', text: 'Grade 5 adds two more irregular divisions of **simple** time values: the **quintuplet** (5) and the **sextuplet** (6).' },
      { type: 'text', text: ['A **quintuplet** is **five** notes in the time of **four** of the same kind.', 'A **sextuplet** is **six** notes in the time of **four** of the same kind.'] },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '2/4', measures: [{ notes: [...['C5', 'D5', 'E5', 'F5', 'G5'].map((k) => n(k, '16', { tuplet: { id: 1, num: 5, occupied: 4 } })), n('A5', 'q')] }] }, caption: 'Five semiquavers in the time of four = one crotchet beat.' },
        { music: { clef: 'treble', time: '2/4', measures: [{ notes: [...['G4', 'A4', 'B4', 'C5', 'D5', 'E5'].map((k) => n(k, '16', { tuplet: { id: 1, num: 6, occupied: 4 } })), n('F5', 'q')] }] }, caption: 'Six semiquavers in the time of four = one crotchet beat.' },
      ] },
      { type: 'table', head: ['Group', 'Notes', 'In the time of'], rows: [['triplet', '3', '2'], ['duplet', '2', '3'], ['quintuplet', '5', '4'], ['sextuplet', '6', '4']] },
      { type: 'worked', title: 'Does this bar of 2/4 add up?', steps: [
        { text: 'Bar: a quintuplet of semiquavers, then a crotchet.' },
        { text: 'The quintuplet lasts as long as **four** semiquavers = 1 crotchet beat.' },
        { text: '1 beat + 1 crotchet = 2 beats. ✓ It fits 2/4.' },
      ] },
      { type: 'keypoints', items: ['Quintuplet: 5 in the time of 4.', 'Sextuplet: 6 in the time of 4.', 'They divide simple time values.'] },
      { type: 'mistakes', items: ['Counting each note of a quintuplet as an ordinary semiquaver (then the bar seems too long).'] },
      { type: 'memorise', items: ['5 → 4, 6 → 4, 3 → 2, 2 → 3.'] },
    ],
    check: { topics: ['r-tuplets'], count: 5, difficulty: 3 },
  },
  {
    id: 'rhythm-convert', section: 1, glyph: '⇄', title: 'Changing time: simple ↔ compound, halving and doubling',
    summary: 'Rewrite rhythms in a new time signature without changing the sound.',
    blocks: [
      { type: 'intro', text: 'Sometimes you need to rewrite a rhythm in another time signature so it **sounds exactly the same**.' },
      { type: 'heading', text: 'Triplets ↔ compound time' },
      { type: 'text', text: 'A melody in 2/4 full of triplet quavers sounds just like 6/8: every beat splits into three. So **2/4 with triplets = 6/8**, **3/4 with triplets = 9/8**, **4/4 with triplets = 12/8**.' },
      { type: 'musicRow', items: [
        { music: { clef: 'treble', time: '2/4', measures: [{ notes: [n('C5', '8', trip(1)), n('D5', '8', trip(1)), n('E5', '8', trip(1)), n('F5', '8', trip(2)), n('E5', '8', trip(2)), n('D5', '8', trip(2))] }] }, caption: '2/4 with triplets…' },
        { music: { clef: 'treble', time: '6/8', measures: [{ notes: [n('C5', '8'), n('D5', '8'), n('E5', '8'), n('F5', '8'), n('E5', '8'), n('D5', '8')] }] }, caption: '…sounds the same as 6/8.' },
      ] },
      { type: 'text', text: 'Going the other way, **duplets** in compound time become ordinary notes in simple time: 6/8 with duplets → 2/4.' },
      { type: 'heading', text: 'Halving and doubling' },
      { type: 'text', text: 'If every note value is **halved**, the bottom number **doubles** (3/4 → 3/8). If every value is **doubled**, the bottom number **halves** (3/4 → 3/2). The top number stays the same.' },
      { type: 'keypoints', items: ['Simple time + triplets → compound time (top ×3, bottom ×2).', 'Compound time + duplets → simple time (top ÷3, bottom ÷2).', 'Halve values → double the bottom number.'] },
      { type: 'mistakes', items: ['Changing the top number when halving or doubling values.'] },
      { type: 'memorise', items: ['2/4 ↔ 6/8, 3/4 ↔ 9/8, 4/4 ↔ 12/8.'] },
    ],
    check: { topics: ['r-convert'], count: 5 },
  },
];
