# Question bank review 3: fresh-eyes examiner check

Reviewer: independent subagent (did not write the bank or the generators). Date: 19 Oct 2026, 07:00–07:35 UTC.
Scope: `data/questions/section-1.json` to `section-7.json` (2,412 questions) and `data/mocks.json` (15 papers, 945 questions), checked against `docs/syllabus.md` and `docs/review-1.md`.
Note: the bank was regenerated (07:20 commit) while this review was running. I re-ran every script on the new files, and re-checked every id cited below against them.

Severity: **ERROR** = wrong or ambiguous answer, or wrong notation. **WARN** = misleading, unmusical, off-style, or a claimed fix that does not hold. **NIT** = cosmetic.

## Method

- **Scripts over the whole bank plus all mock questions.** Throwaway scripts in `/tmp/claude-0/review3/`. Where possible, pitch facts were recomputed independently with `tonal`.
  - **Every bar of every stave that has a time signature** (2,038 staves, 5,473 bars) adds up to the bar length. This counts dots, double dots and tuplet ratios. It covers all correct options. Wrong options in r-barlines, r-rests and r-time were left out, because those are meant to be wrong.
  - **Every tuplet group**: 3:2, 5:4, 6:4 and 2:3 have the right written and real length.
  - **All 115 ornament questions**:
    - the written-out pattern matches the keyed sign (mordents, turn, trill, acciaccatura as a demisemiquaver plus a double-dotted quaver, and appoggiatura taking half the value);
    - the grace note is the first written note and a step from the main note;
    - every note fits the key signature;
    - the option kinds are all different.
  - **All 45 music-in-context extracts (366 questions)**:
    - the key answer matches the key signature;
    - every minor extract has its raised leading note, and every extract ends on the tonic;
    - major extracts have no accidentals;
    - every "bar N makes one chord" question: the bar's notes are exactly one offered triad (all three notes present);
    - every X–Y interval, every tonic/mediant/dominant count and every first-note transposition;
    - every true/false statement (highest note, lowest note, tonic/dominant ending, leading note, clef, dotted note, articulation in bar N), the ornament named in bar N, and the term on the first note.
  - **All 320 interval questions** (naming, and "write a note"). No distractor is also correct.
  - **All 123 chord questions** (identify, choose, and root/3rd/5th).
  - **All 72 cadence drop-downs.** I recomputed the full set of valid chord combinations myself, and it matches `acceptCombos` exactly.
  - **All 63 cadence-naming questions.** Perfect and plagal cadences are always root position.
  - **All 246 clef-transposition and transposing-instrument questions**, including the new key signature.
  - **201 degree and clef questions**, 36 note-naming questions, and 192 key/scale true/false statements.
  - **All 108 r-barlines questions** (bank and mocks). See section B.
  - **Every mock's marks**: every paper is 10/10/15/10/10/10/10 = 75.
  - Grammar patterns, and option keys beyond 6 sharps or 6 flats.
- **By hand:** 136 bank questions in a stratified sample (at least 3 from every topic and type), plus 32 mock questions. I worked every answer out myself. The ids are at the end.

---

## A. Do the review-1 fixes hold?

| Review-1 item | Status |
|---|---|
| E1 acciaccatura bar length | **Holds.** Every bar adds up (script, all 115 ornament questions) |
| E2 grace note pitch | **Holds.** Always the first written note, a scale step away, and diatonic |
| E3 one-note chord bar | **Holds.** Every chord bar contains the whole triad and matches exactly one option |
| E4 minor extract without leading note | **Holds.** All minor extracts contain the raised 7th |
| E5 "highest note in bar N" | **Holds.** The wording is now "appears in bar N", and every statement is marked correctly |
| E6 inverted perfect/plagal cadences | **Holds.** All perfect/plagal cadences are root position. Imperfect cadences use Ib, IIb or Ic only on the first chord |
| W9 unvocal cadence leaps | **Not fixed** (finding 5) |
| W12/W15 a/an grammar | **Partly fixed** (findings 2 and 3) |
| W13 verb agreement | **Not fixed** (finding 20) |
| W17 note-value explanations | **Partly fixed** (finding 19) |
| W18 "complete the part beat first" | **Not fixed** (finding 4) |
| W21 keys with 7 sharps/flats | **Fixed for staves, not for text options** (finding 15) |
| N23 double spaces | **Not fixed** (finding 16) |
| N25 key-signature tip for minor keys | **Not fixed** (finding 17) |

## B. r-barlines (all 108: 85 bank + 23 mock)

By script, every question passes these checks:
- all options contain the same notes;
- the correct option's bars all add up;
- every wrong option has at least one bar of the wrong length;
- no wrong option could be read as a valid anacrusis layout (short first bar plus short last bar adding to one bar, with full bars between);
- no two options split the bars the same way;
- no note in the correct option starts off the beat and runs across a beat.

By hand I checked one question for every time signature in use: 2/4, 3/4, 4/4, 2/2, 3/2, 3/8, 6/8, 9/8, 12/8, 6/4, 5/4, 5/8 and 7/8. The keyed answers are right and the beat grouping is conventional. Only finding 13 below (beaming gives the answer away) and the coverage note in finding 11 apply.

---

## Findings

1. **ERROR (ambiguous): "This bar is in simple time." is marked false for 5/4 and 7/4.**
   - **Ids:** r-time-011, r-time-056, r-time-060, mock-paper-5-s1-q1.
   - **Why it matters:** 5/4 and 7/4 have plain (undotted) crotchet beats. Many textbooks call them "simple quintuple/septuple" or "irregular simple" time. A student who answers "true" has a defensible answer. ABRSM's own term is just "irregular".
   - **Fix:** don't generate the simple/compound statement for irregular time signatures. Keep "This bar is in irregular time" (true) and "…compound time" (false).
   - **Also (NIT):** the hint "Irregular time signatures have 5 or 7 beats in a bar" is shaky for 5/8 and 7/8, which are usually felt in 2 or 3 uneven beats. Say "5 or 7 crotchets or quavers".

2. **WARN: "a augmented" is still in 26 interval prompts and one context explanation.**
   - **Ids:** i-write-003, 006, 011, 022, 024, 027, 074 and others (26 prompts, for example "Write a note that is a augmented octave below this note"). Also mock-paper-14-s7-q3: "From D up to E♯ is a augmented 2nd."
   - **Why it matters:** review-1 W15 is logged as fixed, but the a/an helper is not used in the i-write prompt template or the context interval explanation.
   - **Fix:** use the a/an helper there too.

3. **WARN: the explanations for the two accent signs are circular, with a grammar slip.**
   - **Ids:** "This is a accent: accent the note." in t-signs-036, 037, 054, 055, 065, 077 and two more (8 in all). "This is a strong accent: strong accent." in mock-paper-11-s6-q3 and the other marcato items.
   - **Why it matters:** both meanings define the sign by its own name, so the student learns nothing.
   - **Fix:** use the `docs/syllabus.md` wording: accent = "play the note with emphasis"; strong accent = "a strong accent (more than >)". Fix the article as well.

4. **WARN: 49 of the 108 rest explanations say "Complete the part beat first" when there is no part beat.**
   - **Ids include:** r-rests-001, 002, 005, 007, 017, 063 (for example 4/4: a crotchet, then a crotchet rest and a minim rest).
   - **Why:** review-1 W18 is logged as fixed, but it is not.
   - **Fix:** only add that sentence when the notes end part-way through a beat.
   - **Also (NIT):** r-rests-050 says "10 demisemiquavers are left". "5 semiquavers" or "1¼ crotchet beats" would be clearer.

5. **WARN: cadence melodies still have unvocal leaps (review-1 W9 not done).**
   - **Ids (8 of 72):**
     - c-cadences-013: F♯4 → G5, a minor 9th;
     - c-cadences-063 and 072: G4 → F♯5, a major 7th;
     - c-cadences-023 and 027: F4 → E5, a major 7th;
     - c-cadences-016, 069 and 085: minor 7ths.
   - **Why it matters:** the syllabus asks for "a simple melody", and these leaps don't sound like one.
   - **Fix:** cap leaps at a 6th (an octave at most). Reject 7ths and anything wider than an octave.

6. **WARN: some music-in-context extracts are not "convincing classical style".**
   - **Major 7th leap up to the leading note in bar 5:** x-context-007, 019, 023, 029, 030; mock-paper-8-s7-q1 and mock-paper-12-s7-q1. Other 7th leaps: x-context-001, 003, 005, 017, 020, 025; mock-paper-7-s7-q1.
   - **Leaps wider than an octave:**
     - x-context-005 bar 2: F♯5 → D4;
     - x-context-008 bar 4: C♯6 → B4;
     - x-context-016 and 020 bar 2: C6 → B♭4;
     - x-context-022 bars 3–4: E3 → D2 → F♯3.
   - **The 9/8 mock extracts end with a run of repeated tonic notes instead of a held final note:**
     - mock-paper-1-s7-q1: C♯3 ×5;
     - mock-paper-6-s7-q1: E5 ×10;
     - mock-paper-14-s7-q1: F♯5 ×10.
   - **Fix:**
     - approach the leading note by step, or by a leap of a 3rd or less;
     - cap leaps;
     - in 9/8 (and 12/8), end on a dotted minim tied to a dotted crotchet, or on a dotted minim plus a rest.

7. **WARN: the music-in-context true/false statements are predictable.**
   - **Bank and mocks:**
     - "The extract ends on the dominant" is always false (31 times);
     - "The extract ends on the tonic" is always true (14);
     - "The lowest note is N" is always true (13);
     - "The leading note (N) appears" is always true (14);
     - every "Some notes in bar N are played staccato/tenuto/accented" is true (10).
   - **Why it matters:** a student can score these by pattern without reading the music. Review-1 W7 made the same point about "could be played by".
   - **Fix:** generate false versions too: a wrong lowest note, a bar without the articulation, a wrong leading-note spelling.

8. **WARN: the same question appears twice in one mock paper.**
   - **Ids:**
     - paper-3: mock-paper-3-s5-q6 = q7 (D–F♯–A → G–B–D, perfect, G major);
     - paper-15: mock-paper-15-s5-q5 = q7 (F–A–C → C–E–G, plagal, C major).
   - **Fix:** in mock-builder, de-duplicate by fingerprint within each paper.
   - **Also:** paper-14 section 5 has 5 cadence-naming items out of 10 marks. Consider capping these at 2–3 per paper.

9. **WARN: some term true/false questions have only 3 statements, but the explanation lists 4 terms.**
   - **Ids:** t-terms-006, 007, 012, 021, 026, 038, 043, 052, 054, 056, 064, 085, 089, 101, 104, 113; mock-paper-1-s6-q2, mock-paper-2-s6-q5, mock-paper-8-s6-q5, mock-paper-9-s6-q4.
   - **Example:** t-terms-038 explains "e, ed = and", but no statement is about e/ed.
   - **Cause:** `genTermsTrueFalse` builds the explanation from the 4-term pool before `trueFalse` drops a statement.
   - **Fix:** build the explanation from the statements that survive, or top the list back up to 4.

10. **WARN: the Grade 1–2 signs are not tested in the bank.**
    - **What is wrong:** `genSign` uses only 6 signs: staccato, accent, pause, strong accent, staccatissimo and tenuto. None of these is ever asked:
      - semi-staccato;
      - 8va / 8va bassa;
      - alla breve ¢ and common time C (as a sign);
      - multiple-bar rests;
      - volta brackets;
      - repeat marks;
      - slur and tie;
      - hairpins;
      - metronome marks.
    - **Why it matters:** these are on the official list (syllabus.md §3) and examinable at Grade 5, since the syllabus is cumulative. The lessons cover them, but there is no practice.
    - **Fix:** add sign items for them. Most can be engraved through VexFlow.
    - **Also (NIT):** "poco" (a little) is missing from `TERMS`. Only "poco a poco" is there, but the official Grade 2 entry is "poco, poco a poco".

11. **WARN: irregular time signatures, which are new at Grade 5, are thinly covered.**
    - **What the counts show:**
      - r-barlines has 1 question in 5/4, 4 in 5/8, 4 in 7/8 and none in 7/4;
      - r-time has about 8 irregular items;
      - r-rests has none (left out on purpose);
      - no extract is in an irregular time.
    - **Why it matters:** the grouping of notes in 5/4, 7/4, 5/8 and 7/8 is the main new rhythm topic at Grade 5.
    - **Fix:** weight the d3 r-barlines pool towards irregular times. Consider note-grouping MCQs ("which beaming is correct for 7/8 grouped 2+2+3?"), whose conventions are not in dispute in the way rest conventions are.

12. **WARN (borderline ambiguity): "low male voice" is keyed as bass when baritone is also an option.**
    - **Ids:** t-instruments-061, 085; mock-paper-10-s6-q6, mock-paper-1-s6-q7.
    - **Why it matters:** a baritone is also a low male voice.
    - **Fix:** say "the lowest male voice", or remove baritone from the options.

13. **WARN: in r-barlines, the beaming gives the answer away.**
    - **What is wrong:** every option keeps the beam groups of the correct barring. A wrong bar line usually cuts a beat's beam group in two, and the correct version never does.
    - **Scale:** in 28 of the 108 questions, every wrong option has a beam group split by a bar line, so a student can find the answer without counting. Examples: r-barlines-001, 002, 006, 022, 025, 036, 047, 049, 063, 075, 077.
    - **Fix:** re-beam each wrong option from its own bars (auto-beam), or drop the beam ids from the wrong options.

14. **NIT: the ornament options are labelled inconsistently.**
    - **What is wrong:** the acciaccatura and appoggiatura options carry text naming the ornament ("acciaccatura (small note with a slash)"), while the sign options have no label.
    - **Why it matters:** the name gives a hint. A student who knows "acciaccatura = crushed note" can pick it without recognising the sign.
    - **Fix:** label every option, or none.

15. **NIT: tonic-major and tonic-minor distractors name keys with 7 sharps or flats.**
    - **Ids:** C♯ major in 14 items (k-relative-024, 027, 071; k-scales-038; k-key-of-melody-002, 042, 055, 062, …). A♭ minor in 7 items (k-relative-037, 045, 072; k-key-of-melody-011; mock-paper-9-s3-q8, mock-paper-11-s3-q10, mock-paper-14-s3-q6).
    - **Why it matters:** these keys are off-syllabus, and an unfamiliar key name gives the distractor away.
    - **Fix:** use D♭ major and G♯ minor where an enharmonic is meant, or pick a different distractor.

16. **NIT: double spaces in 36 explanations (review-1 N23 not done).**
    - **Ids:** k-signatures-001, 006, 011, 062 and others; p-instruments-003, 007, 019, 058, 066.
    - **Cause:** the key-change or relative-key sentence is empty.

17. **NIT: the minor-key key-signature tip still talks only about major keys.**
    - **Ids:** k-signatures-123, k-signatures-003 and the other "Which minor key…" items. The tip says "for major keys, the last sharp is the leading note…".
    - **Fix:** add "…then go down a minor 3rd for the relative minor".
    - **Also:** mock-paper-6-s3-q1 repeats itself ("…which is D minor (and its relative major, F major). One flat (B♭) is F major or D minor.").

18. **NIT: C♭4 is called middle C.**
    - **Ids:** p-clefs-002 and p-clefs-071 ("The note is C♭4 (C♭, middle C)").
    - **Fix:** C♭4 is on the middle-C line, but it is not middle C. Say "on the middle-C ledger line".

19. **NIT: some note-value explanations are still circular.**
    - **Example:** "A demisemiquaver lasts 1 demisemiquaver" (r-values-031, r-values-015 and the other demisemiquaver items).
    - **Fix:** drop the clause when the small value is the unit.

20. **NIT: verb agreement in instrument prompts (review-1 N13 not done).**
    - **Ids:**
      - t-instruments-048 and 051: "Is the cymbals / tubular bells a percussion instrument…";
      - t-instruments-018: "Is the timpani…";
      - t-instruments-026 and 075: "does the castanets / cymbals belong";
      - mock-paper-6-s6-q6: "Which clef does the timpani normally read?"
    - **Fix:** add a `plural` flag to `INSTRUMENTS` and choose "are" or "do" from it.

21. **NIT: 11 tuplet questions use the 2/8 time signature.**
    - **Ids:** r-tuplets-008, 020, 031, 067 and others.
    - **Why:** 2/8 is a valid simple duple time, but it is very rare and is not one of the times listed in the syllabus table.
    - **Fix:** use 2/4.

22. **NIT: some interval distractors say "Remember the key signature" when the key signature doesn't change the answer.**
    - **Ids:** i-name-042 (D♭–E♭ in G♭ major) and mock-paper-13-s4-q3 (C♯–G♯ in F♯ minor).
    - **What is wrong:** the "why" for the minor 2nd, augmented 2nd and diminished 5th distractors says "Remember the key signature". But both notes are altered, so the interval would be the same without the key signature, and the trap doesn't apply.
    - **Fix:** prefer note pairs where only one note is changed by the key signature.

23. **NIT: the cadence prompt says "bars 1–2 end with a cadence", but chord 2 falls on beat 1 of bar 2.**
    - **Ids:** c-cadences-039, 028, 063 and others. Chord 2 is followed by two more notes in the same bar, so the cadence comes at the start of bar 2, not the end.
    - **Fix:** "so that there is a cadence at notes 1–2".

24. **NIT: clumsy position wording in clef explanations.**
    - **Examples:** "So it sits 3rd space" (p-clefs-038) and "goes below 1 ledger line" (p-clefs-031).
    - **Fix:** "in the 3rd space"; "just below the first ledger line".

---

## Checked and found correct

- **Music:** every bar total and every tuplet group in the bank and the mocks.
- **Ornaments:** every ornament bar and every ornament option.
- **Music in context:** every extract fact listed under Method.
- **Pitch facts:**
  - every interval, chord, cadence-name and cadence combination;
  - every clef and instrument transposition, including the new key signature;
  - every degree, note-name, same-pitch and key/scale true/false fact.
- **Sampled by hand:**
  - enharmonic spellings;
  - harmonic chromatic spellings (all 5 sampled, ascending and descending);
  - rest conventions (every distinct pattern in the bank, including 3/8, 6/4, 9/8, 3/2 and 2/2);
  - simple↔compound conversions and halving values;
  - transposing-instrument facts;
  - term meanings (no distractor shares a meaning group with the key).
- **Terminology:** British throughout. No American terms (quarter, measure, half note) were found.
- **Off-syllabus content:** no septuplets, no keys beyond 6 sharps/flats on any stave, and no pre-2020-only terms.

## Summary

| Severity | Findings | Questions affected (approx.) |
|---|---|---|
| ERROR | 1 (finding 1) | 4 |
| WARN | 12 (findings 2–13) | about 230 (mostly template text: 26 + 10 + 49 + 20, plus musicality items and coverage gaps) |
| NIT | 11 (findings 14–24) | about 180 (template text) |

No wrong answer key was found anywhere in the automated checks or the hand sample. The one ERROR is an ambiguity of definition.

**Highest priority:**
- finding 1 (ambiguous "simple time" statements);
- finding 13 (beaming gives the bar-line answer away);
- finding 10 (Grade 1–2 signs never practised);
- findings 5 and 6 (unmusical leaps and endings);
- finding 8 (duplicate questions within a mock).

## Ids checked by hand (168)

**Bank (136):** r-values-031, r-values-015, r-values-030, r-time-083, r-time-063, r-time-011, r-time-074, r-time-055, r-time-069, r-rests-063, r-rests-029, r-rests-068, r-rests-017, r-rests-050, r-tuplets-024, r-tuplets-023, r-tuplets-074, r-tuplets-068, r-tuplets-067, r-tuplets-012, r-convert-040, r-convert-061, r-convert-031, r-convert-024, r-convert-077, p-clefs-075, p-clefs-038, p-clefs-071, p-clefs-022, p-clefs-029, p-clefs-031, p-enharmonic-043, p-enharmonic-083, p-enharmonic-040, p-enharmonic-065, p-enharmonic-020, p-transpose-clef-049, p-transpose-clef-097, p-transpose-clef-091, p-transpose-clef-035, p-transpose-clef-060, p-transpose-clef-094, p-instruments-087, p-instruments-015, p-instruments-077, p-instruments-013, p-instruments-080, p-instruments-043, p-instruments-093, p-instruments-030, p-instruments-051, p-instruments-003, k-signatures-059, k-signatures-061, k-signatures-123, k-signatures-062, k-signatures-003, k-signatures-038, k-signatures-012, k-signatures-057, k-signatures-007, k-relative-022, k-relative-021, k-relative-031, k-relative-017, k-relative-037, k-degrees-069, k-degrees-041, k-degrees-046, k-degrees-073, k-degrees-053, k-scales-088, k-scales-001, k-scales-076, k-scales-046, k-scales-053, k-scales-067, k-scales-027, k-scales-049, k-scales-110, k-scales-038, k-chromatic-018, k-chromatic-045, k-chromatic-078, k-chromatic-052, k-chromatic-002, k-key-of-melody-055, k-key-of-melody-056, k-key-of-melody-034, k-key-of-melody-069, k-key-of-melody-059, i-name-025, i-name-068, i-name-085, i-name-042, i-name-017, i-write-049, i-write-058, i-write-074, i-write-059, i-write-008, i-write-003, c-chords-079, c-chords-008, c-chords-021, c-chords-039, c-chords-057, c-chords-030, c-chords-032, c-cadences-039, c-cadences-001, c-cadences-028, c-cadences-063, c-cadences-066, c-cadences-057, c-cadences-083, c-cadences-002, c-cadences-003, c-cadences-005, t-terms-080, t-terms-110, t-terms-038, t-terms-003, t-terms-032, t-terms-062, t-terms-073, t-signs-059, t-signs-058, t-signs-042, t-signs-056, t-signs-079, t-signs-036, t-ornaments-001 to 006, t-ornaments-058, t-ornaments-012, t-ornaments-049, t-ornaments-019, t-ornaments-038, t-instruments-028, t-instruments-055, t-instruments-030, t-instruments-033, t-instruments-015, t-instruments-023, t-instruments-008, all of x-context-004-*, x-context-002-9, x-context-012-9, r-barlines-001, 002, 003, 004, 005, 006, 015, 016, 019, 022, 023, 035, 041, 067.

**Mocks (32):** mock-paper-9-s3-q4, mock-paper-15-s4-q3, mock-paper-11-s5-q1, mock-paper-8-s7-q7, mock-paper-13-s4-q3, mock-paper-13-s2-q1, mock-paper-5-s7-q4, mock-paper-8-s3-q7, mock-paper-8-s3-q8, mock-paper-3-s1-q8, mock-paper-14-s3-q7, mock-paper-6-s3-q1, mock-paper-1-s1-q9, mock-paper-10-s3-q1, mock-paper-7-s1-q4, mock-paper-2-s4-q3, mock-paper-3-s1-q2, mock-paper-2-s7-q1, mock-paper-2-s7-q2, mock-paper-12-s5-q2, mock-paper-11-s6-q3, mock-paper-11-s5-q3, mock-paper-6-s4-q1, mock-paper-4-s3-q8, mock-paper-8-s3-q1, mock-paper-14-s7-q3, mock-paper-5-s6-q6, mock-paper-2-s4-q1, mock-paper-14-s3-q6, mock-paper-6-s4-q3, mock-paper-15-s5-q6, mock-paper-4-s4-q2.

---

## Fixes applied (main session, 19 Oct ~07:45 UTC)

- **E1** simple/compound statements are no longer generated for 5/4, 7/4, 5/8, 7/8.
- **W** "a augmented" in interval prompts/context explanations, "a accent", circular sign meanings (accent / strong accent now explain what to do), "Is the cymbals…", double spaces, part-beat wording only when there is a part beat, minor-key tip in key-signature explanations, C♭4 no longer called middle C.
- **W** r-barlines options no longer carry the correct version's beams (each option is beamed bar by bar), so beaming can't give the answer away.
- **W** mocks never repeat a question within a paper; true/false questions always top up to 4 statements where possible.
- **W** voices: "the lowest male voice" etc. so baritone is no longer defensible; "poco" restored as "poco, poco a poco".
- **NIT** 7-sharp/flat keys removed from distractors.
- A new unit test guards the wording fixes and mock repeats across the whole bank.
- Not changed yet: awkward leaps in some cadence melodies and extracts, predictable extract true/false statements, untested signs (semi-staccato, 8va, voltas…), thin irregular-time coverage.
