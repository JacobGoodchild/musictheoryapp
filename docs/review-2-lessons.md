# Review 2: lessons (fresh-eyes teacher/examiner pass)

Scope: all 33 lessons in `src/content/lessons/` (s1–s7), read as they actually render. I dumped every block with a throwaway script (`/tmp/claude-0/lessonreview/dump.mjs`, which imports `src/content/lessons/index.js`), so computed captions, tables and the real pitches/durations in every stave were checked, not just the source. Reference: `docs/syllabus.md`.

What I checked by hand: every bar total against its time signature, every interval example (letter count and semitones), every chord spelling and inversion, every key-signature table row, every scale spelling, every transposition, every written-out ornament's total length, and every term against the official 2020 lists.

Overall the content is accurate and friendly. The engraved examples nearly all match their captions: every bar adds up, every interval, chord and transposition is right, and the key tables are correct. The real errors are a few wrong sentences of prose, plus one code filter that silently drops the piano.

Severity: **ERROR** = factually wrong or will mislead; **WARN** = misleading, incomplete or a real syllabus gap; **NIT** = wording or polish.

## Findings

1. **pitch-treble-bass, `mistakes` block** — "Reading bass clef as if it were treble (everything comes out two letters too **high**)". **Why:** it is the other way round. The bottom bass line is G, but a treble reading calls it E. Every bass note read as treble comes out two letter names too **low** (a 3rd lower). **Fix:** "…everything comes out two letters too low (G read as E)". **ERROR**

2. **keys-clefs, `keypoints` block** — "Tenor clef sharps begin on the 2nd line (F♯) and zig-zag **up a 4th, down a 5th**." **Why:** the rendered pattern (F3 → C4 → G3 → D4 → A3 → E4) goes **up a 5th, down a 4th**: F up to C is a 5th, C down to G is a 4th. The lesson's own memorise line (F line 2, C line 4, G space 2…) contradicts this keypoint. **Fix:** "…zig-zag up a 5th, down a 4th." **ERROR**

3. **context-howto, `keypoints` block** — "The key signature affects every note **on that line or space**." **Why:** a key signature applies to that letter name in **every octave**, on any line, space or ledger line. The "same line or space" rule belongs to accidentals. Mixing the two up is a classic exam mistake, and the extract shown goes above the stave (B♭5, E♭6). **Fix:** "The key signature affects every note with that letter name, in every octave. (An accidental only affects its own line or space, until the bar line.)" **ERROR**

4. **terms-instruments, the family tables (block 1)** — the lesson only builds tables for `strings`, `woodwind`, `brass` and `percussion`. The **piano** entry in `terms.js` has family `keyboard`, so it never appears. **Why:** piano is a named Grade 5 syllabus instrument ([SPEC] p. 17: "harp; piccolo; cor anglais; piano"). It is also the most likely instrument for a music-in-context extract. **Fix:** add `keyboard` to the family list, or add a short "Keyboard" table (piano: treble + bass on a grand stave; hammers strike strings; non-transposing). The celesta could be cross-referenced there too. **ERROR**

5. **terms-signs-ornaments, `table` of directions (block 2)** — the table lists 10 directions. **Missing** from the syllabus list: up bow (V), down bow (⊓), slur in string music (= one bow), avec/sans sourdines (G4); **senza pedale**, **pedalling signs (Ped. … ✱ / bracket)** and **arpeggiation (wavy line before a chord)** (G5). **Why:** these are all on [SPEC] p. 17. The context extracts include an arpeggiated chord bar, but the lessons never explain the sign. **Fix:** add the rows to `DIRECTIONS` (or a lesson-only table), with engraved examples of the bow marks, the Ped. sign and the arpeggio line if the renderer supports them. **WARN**

6. **terms-signs-ornaments, `music` block of signs (block 1)** — only 6 signs are shown (staccato, accent, pause, strong accent, staccatissimo, tenuto). **Missing** official G1/G2 signs: slur, crescendo/diminuendo hairpins, metronome mark, repeat marks, **semi-staccato**, **8va**, **multiple-bar rests**, **volta brackets**. Common time and alla breve appear only in the rhythm lesson; the tie appears in rhythm-values as text only. **Why:** "Terms and signs" is cumulative, and these are standard context questions. **Fix:** add a second row or table covering the remaining signs (at least semi-staccato, 8va, multi-bar rest, 1st/2nd-time bars, repeat marks, hairpins, ♩ = 120). **WARN**

7. **terms-signs-ornaments, `music` block caption** — "strong accent: strong accent". **Why:** the meaning just repeats the name. **Fix:** "strong accent (marcato ^): a strong accent, more than >". **NIT**

8. **terms-signs-ornaments, Ornaments section** — grace note(s) are on the G4 ornament list, but there is no example or row for them. Every written-out example is also on E in C major, with no accidentals. **Why:** exam written-out ornaments often carry an accidental (for example a turn with a sharpened lower note), and students should know an accidental can sit above or below the sign. **Fix:** add one example with an accidental (for example a turn in G major on A with G♯), and one line on grace notes. **WARN**

9. **terms-instruments, `keypoints` block** — "Transposing: clarinet (B♭/A), trumpet (B♭), horn (F), cor anglais (F)." **Why:** this is incomplete in a way that could cost a mark. The **piccolo, double bass, xylophone, glockenspiel and celesta** are also transposing (at the octave), and the tables right above mark xylophone, glockenspiel and celesta as "transposing". A "Which is a non-transposing instrument?" question would trip a student who learnt only this list. **Fix:** "Transposing by an interval: clarinet (B♭/A), trumpet (B♭), horn (F), cor anglais (F). Transposing by octave(s): piccolo, double bass, xylophone, glockenspiel, celesta." Also put "transposing (octave lower)" in the double bass Notes cell. **WARN**

10. **terms-instruments, voices `table` (block 6)** — gives only "high female / low male" descriptions. **Why:** the syllabus asks for a "broad understanding of range". There is no indication of rough range or clef (for example that tenor parts are written in treble clef an octave higher, or in bass clef). **Fix:** add an approximate-range column (for example soprano about middle C to high A; bass about low E to middle C) and a note on the treble clef with an 8 below for tenors. **WARN**

11. **context-howto, `worked` block (block 2)** — the method is generic and is never applied to the extract printed just above it, so the extract just sits there with no explanation. **Why:** a worked example is far more useful when it uses the music in front of the student (2 flats, ends on B♭, A naturals, so B♭ major; 4/4 simple quadruple; X–Y interval; the trill; the Eb–G–B♭ bar outlining IV). **Fix:** add a few computed answer lines for this extract (key, time, highest note, the X–Y interval from the brain, the bar-3 chord). **WARN**

12. **context-howto, `worked` method steps** — they leave out **instruments/voices** (for example "Which instrument could play this?", "Name a woodwind instrument that could play it"), **rhythm** questions (counting notes, tuplets, rests) and **cadences/chords at a marked point**. **Why:** the syllabus says context questions include instruments and the "application of theoretical knowledge". **Fix:** add an "Instruments" step (range and clef, so which instrument could play it) and widen "Chords" to include cadences. Update the mnemonic to match. **WARN**

13. **context-howto, extract (block 1)** — the extract is marked *adagio* but is full of semiquaver runs climbing to F6 (3 ledger lines), and it has a trill on a single semiquaver (C6 in the last full bar). **Why:** this is musically unconvincing, and a trill on a semiquaver is barely playable. A teen will happily accept it, but an examiner would not write it. **Fix:** use a seed or generator constraint so ornaments land on crotchets or longer notes, and keep the range within about 2 ledger lines, or pick a faster tempo term. **NIT**

14. **chords-triads, chords-inversions, chords-cadences, `audio` on the music blocks** — the "hear it" audio is an **octave away** from the stave. chords-triads and chords-inversions draw bassOct 4 (for example G4–B4–D5) but play bassOct 3 (G3–B3–D4). The cadence staves draw bassOct 2 (G2–B2–D3, C2–E2–G2) but play bassOct 3. **Why:** this is confusing when a student compares what she sees with what she hears. Pitch is the point of the lesson. **Fix:** pass the same `bassOct` to `chordAudio`/`voiceChord` as the stave uses (for the cadences, draw at octave 3 in the bass clef, which also looks less muddy than close chords on C2). **WARN**

15. **chords-inversions, intro / `keypoints`** — every example is a close-position, three-note triad. **Why:** exam chord and context questions often show four-note (SATB or piano) chords with a doubled note, spread over two staves. The lesson never says "ignore doubled notes; only the lowest note decides a/b/c". **Fix:** add one keypoint, plus one example with a doubled root spread across a grand stave or bass clef. **WARN**

16. **rhythm-irregular, `worked` "Which time signature?"** — the steps say "Count the notes in the bar in quavers: 3 + 2 + 2 = 7", but **no bar is shown**, so the student has nothing to count. The last step switches to a different, hypothetical bar. **Why:** a worked example needs the music. **Fix:** attach a stave (for example 7/8 beamed 3 + 2 + 2) to step 1, and drop or illustrate the 5/4 aside. **WARN**

17. **rhythm-grouping, the whole lesson** — the summary promises "Beaming and rests", but there is **no content on beaming rules** (for example in 4/4 quavers may be beamed in fours across beats 1–2 or 3–4 but not 2–3; semiquaver grouping; beaming in 3/4). There is also nothing on **rests in 5/8, 7/8, 5/4, 7/4** (follow the 3 + 2 / 2 + 2 + 3 grouping) or on compound part-beat rests. **Why:** the syllabus asks for "the grouping of notes and rests within these times" for irregular times, and this is G1–G3 cumulative content. **Fix:** add a "Beaming" subsection with one ✓/✗ pair in 4/4, and one irregular-time example (for example 7/8 as 2 + 2 + 3 with a crotchet rest + dotted crotchet rest). **WARN**

18. **pitch-octave-transpose, worked examples** — they cover treble → bass and bass → alto only. **Nothing involves the tenor clef**, the one clef that is new at G5, and there is no case without a key signature. **Why:** the syllabus says "from any clef to another", and the brief asks for slight emphasis on clef transposition. **Fix:** add a third worked example (for example alto → tenor at the same pitch, or tenor → treble an octave higher). **WARN**

19. **pitch-instruments, worked examples** — every example has a key signature. **Why:** the syllabus says "with or without key signature". Without one, every accidental must be transposed individually, which is where students go wrong (for example concert B♭ for B♭ clarinet becomes C, but concert F♯ becomes G♯). **Fix:** add a short example without a key signature, showing accidentals being transposed. **WARN**

20. **pitch-instruments, `worked` "Clarinet in A"** — concert F major for clarinet in A is written in A♭ major (4 flats). **Why:** the arithmetic is correct, but in practice a composer would choose the B♭ clarinet for a flat key; A clarinets play in sharp keys. That is fine for drilling the interval, but worth a one-line aside so the example doesn't plant a false impression. **Fix:** optionally use a sharp-key melody (for example concert D major → written F major) for the A clarinet example. **NIT**

21. **pitch-accidentals, keypoints** — there is nothing on **cancelling a double sharp or double flat** (G4 syllabus: "Double sharp and double flat signs, and their cancellation"). For example, F𝄪 followed by F♯ in the same bar is written with ♯ (older style ♮♯). **Fix:** add one line and a two-note example. **WARN**

22. **keys-major, `tip` block** — "Flat keys: the second-to-last flat is the key." **Why:** this doesn't work for F major (one flat), and the tip gives no exception. **Fix:** add "(except F major, which has just one flat: B♭)". **WARN**

23. **keys-major, `table` (Signature column)** — C major shows "0 ♯" and A minor "0 ♯ (—)". **Why:** "0 sharps" reads oddly, as though C major were a sharp key. **Fix:** show "none". **NIT**

24. **keys-major-scales, musicRow** — scales are shown in treble, bass and alto clefs but **not the tenor clef**. **Why:** the brief says "scales in all four clefs", and tenor is the new G5 clef. **Fix:** add one scale in the tenor clef (for example B♭ major or D♯ harmonic minor with key signature). **WARN**

25. **keys-major-scales, `mistakes` block** — "Using two letters the same (e.g. F and F♯) in one major scale". **Why:** the wording is awkward ("two letters the same" really means one letter used twice). **Fix:** "Using the same letter twice (e.g. F and F♯) in one scale: each letter appears once." **NIT**

26. **keys-melody, `mistakes` block** — "Choosing the major key just because there are no flats or sharps in the key signature." **Why:** this is confusingly specific (it only applies to C major / A minor). The general mistake is choosing the major key without looking for the minor key's leading note. **Fix:** "Choosing the major key without checking for the minor key's raised 7th (e.g. G♯ in a melody with no key signature means A minor)." Also mention the raised 6th of the melodic minor as a clue. **NIT**

27. **intervals-basics, `text` (Quality rule)** — "imagine the major scale of the lower note". **Why:** this breaks down when the lower note is, for example, D♯, G♯ or A♯ (no such major key at G5, and D♯ major has a double sharp). A teenager will get stuck. **Fix:** add a tip: "If the lower note has an awkward sharp or flat, work out the interval without it, then adjust (D♯–B: D–B is a major 6th, raising the bottom note makes it smaller, so minor 6th)." **WARN**

28. **intervals-aug-dim, `table` (block 1)** — the headers "Smaller ← | (blank) | → Bigger" over cells such as "diminished ← minor | ← major | → augmented" don't line up and are hard to read. **Fix:** use one line per row instead, for example "diminished ← minor ← **major** → augmented" and "diminished ← **perfect** → augmented", or columns "dim | min | maj | aug" with "—" for perfect intervals. **NIT**

29. **rhythm-compound, `text` (block 1)** — "Each beat is a dotted crotchet (three quavers)." **Why:** this is true only for /8 times. The table right below lists 6/4 (dotted minim beats) and 6/16 (dotted quaver beats). **Fix:** "In 6/8, 9/8 and 12/8 each beat is a dotted crotchet (three quavers); with a 4 or 16 at the bottom it is a dotted minim or dotted quaver." **NIT**

30. **rhythm-values, keypoints/memorise** — double-dotted **rests** (G4: "Double-dotted notes and rests") and dotted rests aren't mentioned or shown. **Fix:** add one sentence ("Rests can be dotted and double-dotted in the same way") with a dotted crotchet rest in the rests stave. **NIT**

31. **rhythm-triplets, musicRow** — only quaver triplets and quaver duplets are shown. **Why:** the syllabus names semiquaver, quaver and crotchet duplets (G4) and triplet minims/crotchets/semiquavers (G2). **Fix:** add a crotchet-triplet example in 2/4 or 4/4, and a crotchet duplet in 6/4 (or say in text that any value can form a triplet or duplet). **NIT**

32. **pitch-tenor, `worked` "Same pitch, different clef"** — "G is four letters below C (C, B, A, G)". **Why:** the inclusive count makes it sound like "4 letters below" = a 5th. **Fix:** "G is a 4th below C (count C, B, A, G)". **NIT**

33. **terms-italian, `table` Grade 3** — "sforzando (sfz, sf)" leaves out **sforzato**, which is on the official entry ("sforzando, sforzato, sfz, sf"). "sostenuto (sost.)": the official list prints "sost" with no full stop (cosmetic). **Fix:** add sforzato to the term string. **NIT**

34. **terms-italian, `table` Grades 1 and 2** — "fine" leaves out "al fine" ("fine, al fine"), and "poco a poco" leaves out standalone "poco" ("poco, poco a poco"), although the keypoint teaches poco. The merged table also looks unsorted: alphabetical to "staccato", then it restarts at "alla marcia". **Fix:** use the official headwords, and either split the table into "Grade 1" and "Grade 2" headings or sort the merged list. **NIT**

35. **terms-italian, `mistakes` block** — "*Morendo*, *perdendosi* and *smorzando* all mean 'dying away'" is listed as a mistake but is really a fact. **Fix:** move it to keypoints, or reword as "Thinking morendo / perdendosi / smorzando mean different things: all mean dying away." **NIT**

36. **terms-french-german, `mistakes` block** — "Thinking *lent* means 'lent' in English". **Why:** this is a mistake almost nobody makes, so it takes up space for nothing. A more useful pair: *douce* vs *dolce* (both sweet), or *retenu* (held back) vs *ritenuto*. **Fix:** replace it with "French *retenu* = Italian *ritenuto* (held back); French *vite* is quick, not 'with life'". **NIT**

37. **chords-cadences, `music` (musicRow)** — close root-position triads drawn on C2–G2 in the bass clef sit on 2 ledger lines below the stave and look cramped. **Fix:** draw at bassOct 3 (see item 14). **NIT**

## Syllabus coverage gaps

These syllabus points are not taught by any lesson, or only in passing. They are checked against `docs/syllabus.md` §2a–2c.

| # | Syllabus point | Grade | Status in lessons |
|---|---|---|---|
| G1 | **Piano** as a named instrument | 5 | Missing (filtered out by family; item 4) |
| G2 | Instrumental directions: **senza pedale, pedalling signs, arpeggiation** | 5 | Missing (item 5) |
| G3 | Instrumental directions: **up bow, down bow, string slur, avec/sans sourdines** | 4 | Missing (item 5) |
| G4 | Signs: **semi-staccato, 8va, multiple-bar rests, volta brackets**; slur, hairpins, repeat marks, metronome mark | 1–2 | Not shown (item 6) |
| G5 | **Grace note(s)** ornament | 4 | Missing (item 8) |
| G6 | **Voice ranges** ("broad understanding of range") | 5 | Names only (item 10) |
| G7 | Octave transposers (piccolo, double bass, glockenspiel, xylophone, celesta) as **transposing/non-transposing** | 5 | Only in table cells; contradicted by keypoint (item 9) |
| G8 | Grouping of notes and **rests in irregular time** (5/4, 7/4, 5/8, 7/8) | 5 | Notes beamed only; no rests (item 17) |
| G9 | **Beaming rules** in simple/compound time | 1–3 | Not taught (item 17) |
| G10 | **Upbeat (anacrusis) opening** | 3 | Not mentioned in any lesson (affects "bar 1 is the first full bar" in context-howto, which assumes the student knows the term) |
| G11 | Octave transposition **to/from the tenor clef** | 5 | No example (item 18) |
| G12 | Transposing-instrument melodies **without key signature** | 5 | No example (item 19) |
| G13 | **Cancellation of double sharps/flats** | 4 | Missing (item 21) |
| G14 | **Scales in the tenor clef** | 5 | No example (item 24) |
| G15 | Double-dotted and dotted **rests** | 2–4 | Missing (item 30) |
| G16 | Crotchet/semiquaver duplets; minim/crotchet/semiquaver triplets | 2–4 | Only quaver tuplets shown (item 31) |
| G17 | Chords with **doubled notes** / spread voicing (how they appear in the exam) | 5 | Not addressed (item 15) |

Covered well: all 4 irregular time signatures, quintuplets/sextuplets (correctly no septuplets), the four clefs including the tenor key-signature pattern, all 26 Grade 5 keys with correct signatures and relatives, harmonic/melodic/chromatic scales, technical degree names, all G5 chromatic and compound intervals up to the 15th, I/II/IV/V in a/b/c with minor keys on the harmonic minor, perfect/plagal/imperfect cadences restricted to C/G/D/F, chord choice at cadence points, all 101 + 6 + 6 terms (the counts match the official lists), written-out ornaments (sign → played, never the reverse as an exam task), single/double reed, and definite/indefinite pitch.

## Summary counts

| Severity | Count |
|---|---|
| ERROR | 4 (items 1, 2, 3, 4) |
| WARN | 17 (items 5, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27) |
| NIT | 16 (items 7, 13, 20, 23, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37) |
| **Total findings** | **37** |
| Syllabus coverage gaps | 17 (G1–G17; most overlap with the items above) |

No British/American terminology slips were found. A search of every rendered block for "whole note", "half note", "quarter", "eighth", "measure" (as a noun), "staff" and "leading tone" found nothing. Captions use "leading note", "1st inversion", "bar" and "stave" throughout. All bar totals, interval spans, chord spellings, scale spellings, key-signature tables and transpositions in the music specs were verified correct.

---

## Fixes applied (main session, 19 Oct ~07:20 UTC)

- **E1** bass-as-treble mistake now says notes come out two letters too *low* (G read as E).
- **E2** tenor sharps keypoint now "up a 5th, down a 4th" (matches the memorise line and the engraving).
- **E3** music-in-context keypoint: key signature affects every note with that letter name in every octave.
- **E4** piano now appears (keyboard family table added).
- **W** chord/cadence "Hear it" audio now plays in the same octave as the stave.
- **W** added instrumental directions: up bow, down bow, string slur, avec/sans sourdines, senza pedale, pedal marks, arpeggiation (overlapping ones are lesson-only, never rival quiz options).
- **W** added a table of Grade 1–2 signs: hairpins, semi-staccato, 8va/8va bassa, multi-bar rests, repeat marks, volta brackets, C and ¢.
- **W** octave-transposing instruments added to the instruments keypoints; rough voice ranges added.
- **W** "second-to-last flat" tip now mentions the F major exception.
- **Bank** new topic "Adding bar lines" (r-barlines) covers the missing syllabus point; wrong options are checked to have a bar with the wrong number of beats.
- Later in the same session: added grouping text for irregular time, a stave for the 7/8 worked example, a treble→tenor octave-transposition worked example, a transposing-instrument example without key signature, and cancelling a double sharp. Still not done: worked context example on the shown extract, chords with doubled notes, interval method for D♯/G♯ lower notes in the lesson (question explanations already handle it).
