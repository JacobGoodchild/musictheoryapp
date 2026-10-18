# Question bank review 1: fresh-eyes examiner check

Reviewer: independent subagent (did not write the bank). Date: 18 Oct 2026.
Scope: `data/questions/section-1.json` to `section-7.json` (2,340 questions), checked against `docs/syllabus.md`.

**Method.**
- **By hand:** a stratified sample of **194 questions**, at least one from every topic, generator and clef/sub-type in every section, including 44 tricky ones. It covers mcq 138, place 29, truefalse 12, number 8, dropdown 7. I printed it with `/tmp/claude-0/review/print.js` and worked every answer out myself from the pitch data. The ids are listed at the end.
- **By script, whole bank:** I used throwaway scripts to cross-check every question in these groups:
  - all interval names and placements (section 4)
  - all cadence chord-choice combinations
  - all octave and instrument transpositions
  - all key-signature, relative-key, scale-degree, scale-identification and chromatic-scale items
  - all ornament bars (durations and grace-note pitches)
  - all 30 music-in-context extracts: bar lengths, highest/lowest note, counts, X–Y intervals, bar chords, transpositions and key evidence
  - exact duplicates
  - off-syllabus terms and keys

  The scripts found no wrong answers in those groups except the ones listed below.

Severity: **ERROR** = wrong or ambiguous answer, or wrong notation. **WARN** = unclear, misleading or off-style. **NIT** = cosmetic.

---

## Findings

### Section 6: ornaments (written-out ornament questions)

1. **ERROR: every acciaccatura question has a written-out bar that is too short.**
   - **Ids (16):** t-ornaments-006, 007, 012, 013, 015, 016, 017, 022, 026, 029, 033, 035, 055, 064, 066, 071.
   - **What is wrong:** the bar is 2/4, but the first beat is written as a demisemiquaver plus a dotted quaver (for example t-ornaments-026: `G4/32 F#4/8. D4/q`). That makes ⅛ + ¾ = ⅞ of a crotchet, so the bar adds up to 1⅞ beats, not 2.
   - **Why it matters:** a student who checks the rhythm will see an incomplete bar. A wrongly notated rhythm is a "wrong note on a stave" bug.
   - **Fix:** write the beat as a demisemiquaver plus a **double-dotted** quaver (⅛ + ⅞ = 1), or as a semiquaver plus a dotted quaver. Add a test that every bar of every ornament stave adds up to the time signature.

2. **ERROR: in 9 questions the correct option shows the grace note at the wrong pitch.**
   - **Ids:** t-ornaments-007, 012, 013, 015, 020, 036, 053, 063, 077.
   - **What is wrong:** the grace note should be the note written first in the bar, but the generator has put a different note there:

     | Id | Written-out notes | Grace note shown | Should be |
     |---|---|---|---|
     | t-ornaments-077 | D5 C5 | G5 (a 5th above C5) | D5 |
     | t-ornaments-007, 013 | D5 C5 | B♭5 | D5 |
     | t-ornaments-012, 020, 063 | E♭5 D5 | B♭5 | E♭5 |
     | t-ornaments-015 | D5 C5 | F5 | D5 |
     | t-ornaments-036, 053 | D5 C5 | B♭5 | D5 |

   - **Why it matters:** the "correct" sign does not represent the written-out notes, so the marked answer is wrong as engraved.
   - **Fix:** take the grace pitch from the first written note. The grace-note distractors have the same bug in about 40 questions (for example t-ornaments-024, 028, 040, 049, 070: a G5 or B♭5 grace over C5 or D5). Fix those too, so a distractor is wrong only because of its ornament type and never because of a random pitch.

### Section 7: music in context

3. **ERROR: x-context-006-5 asks for the chord in a bar that has only one note.**
   - **What is wrong:** the prompt says "The notes of bar 4 make up one chord. Which chord is it?", but bar 4 is a single B♭4 semibreve. B♭ belongs to IV (B♭–D–F) and also to II (G–B♭–D), and II is one of the options. The explanation says "Bar 4 uses only B♭, D, F", which is false.
   - **Fix:** choose a bar that outlines all three notes of a triad, or regenerate the extract. Add a check that the bar named in a chord question contains at least the root and 3rd of exactly one of the offered chords.

4. **ERROR: x-context-012-2 asks for the key of an extract that has no raised leading note.**
   - **What is wrong:** ctx-810675273 has 4 sharps and 3/8 time, and the answer given is C♯ minor. But no B♯ appears anywhere in the extract. The explanation states "The accidental B♯ is the raised leading note of C♯ minor", which is false. The same extract's true/false item x-context-012-8 correctly marks "The leading note (B♯) appears" as **false**, so the extract contradicts itself.
   - **Why it matters:** by ABRSM convention, without a raised 7th the key is not proven to be minor. E major is an option.
   - **Fix:** add a B♯ to the melody (for example in bar 4), or regenerate. Add a test that every minor-key extract contains the raised leading note.

5. **ERROR (ambiguous): x-context-001-8 says "The highest note is in bar 2." is true.**
   - **What is wrong:** the highest note, G3, appears in bars 2, 5 and 6, so the statement is true but not the whole story. The explanation says only "(bar 2)".
   - **Fix:** only generate "highest note is in bar N" when the highest pitch occurs in a single bar. Otherwise phrase it as "The highest note first appears in bar N".
   - **Also affected (explanation names one bar, but the highest note recurs):** x-context-002-8, 003-8, 005-8, 006-8, 010-8 and 011-8. Their statements are about other bars, so they are marked correctly, but the explanations should list every bar.

6. **WARN: the performance direction printed on the score includes the list variants.**
   - **Ids:** ctx-63522791 (x-context-003-*) and ctx-335703119 (x-context-011-*).
   - **What is wrong:** the score shows "vivace, vivo" over the first note. A real score would show one word.
   - **Fix:** print the first variant only ("vivace"), and ask "What does 'vivace' mean?".

7. **WARN: "The extract could be played by a …" is true in all 9 places it appears.**
   - **Ids:** x-context-003-8, 004-8, 009-8, 014-8, 015-8, 016-8, 024-8, 025-8, 027-8.
   - **What is wrong:** the statement is never false, so the student never has to judge range.
   - **Fix:** sometimes generate a false version (for example a flute for a bass-clef extract).
   - **Also (NIT):** "a oboe" should be "an oboe" (x-context-009-8, 024-8, 025-8).

### Section 5: chords and cadences

8. **ERROR (ambiguous): inverted chords are labelled as plain perfect cadences.**
   - **Ids (Vb–I labelled "perfect cadence"):** c-cadences-007 (F♯2–A2–D3 → G2–B2–D3), c-cadences-011 (B2–D3–G3 → C), c-cadences-028 and c-cadences-083 (C♯3–E3–A3 → D).
   - **Why it matters:** in British/ABRSM teaching, a perfect cadence is V–I with both chords normally in root position. With the leading note in the bass, a teacher would hesitate to call it a perfect cadence. The explanation calls the chord "V (D–F♯–A)" and never mentions the inversion.
   - **Fix:** use root-position V and I in cadence-naming items, as ABRSM does at Grade 5.
   - **Related (WARN): IVb–I labelled "plagal".** Ids: c-cadences-008, 016, 024, 037. Same fix, or at least say "IVb–I" in the explanation.

9. **WARN: two cadence melodies have unvocal leaps.**
   - **c-cadences-014:** F♯4 → G5, a 9th.
   - **c-cadences-034:** F4 → F5, an octave, straight into the cadence point.
   - **Why it matters:** the syllabus asks for "a simple melody", so these look unmusical. The chord answers themselves are right.
   - **Fix:** cap melodic leaps at a 6th or octave and prefer stepwise approaches to cadence notes.

### Section 6: terms, signs, instruments (explanations)

10. **WARN: true/false term explanations don't match their statements.**
    - **Ids:** 39 of the 42 genTermsTrueFalse questions.
    - **What is wrong:** the explanation lists the meanings of other terms, not the ones in the statements. For example:
      - t-terms-001: the statements are about allegro, decrescendo, subito and dal segno. The explanation gives D.S., subito, decrescendo and "più = more", and never says what allegro means.
      - t-terms-002: the explanation gives langsam, risoluto, meno and rinforzando, while the statements are about prestissimo, vite and others.
      - t-terms-064 has the same problem.
    - **Why it matters:** a student who gets a false statement wrong is not told the right meaning.
    - **Fix:** build the explanation from the terms actually in the statements, giving each one's real meaning.

11. **WARN: explanations that don't explain anything.**
    - **t-instruments-004 and t-instruments-007 (and the other t-instruments true/false items):** the explanation is a fixed paragraph about reeds and percussion pitch. It doesn't mention the double bass, cello clef, baritone/tenor or brass statements being asked.
    - **t-instruments-075:** "The answer is the bass." gives no reason.
    - **Fix:** give the reason for each statement (for example "Voices from high to low: soprano, mezzo, alto, tenor, baritone, bass").

12. **WARN: the sign explanations repeat themselves or have broken grammar.**
    - **t-signs-026:** "This is a strong accent: strong accent."
    - **t-signs-063:** "This is a accent: accent the note."
    - **Fix:** use "This is an accent (>): play the note with emphasis." The "a"/"an" article bug affects 7 accent, 33 acciaccatura and 35 appoggiatura texts in section 6 ("That sign is a acciaccatura / a appoggiatura").

13. **NIT: verb agreement in instrument prompts.**
    - "To which family of the orchestra does the castanets belong?"
    - "Is the cymbals a percussion instrument…"
    - "Is the tubular bells a percussion instrument…"
    - **Fix:** use the plural verb or a neutral wording ("Which family do castanets belong to?").

### Section 4: intervals

14. **WARN: interval explanations rely on keys that are not on the Grade 5 syllabus.**
    - **What is wrong:** the template says "In the major scale of X, the 6th is major". When the lower note is G♯, D♯, E♯, F♭ or C♭, that refers to a scale with 7 or more sharps/flats (or a theoretical key), which a Grade 5 student has never met.
    - **Ids:** i-name-011, 014, 015, 023, 047, 050, 056, 059, 064, 080; i-write-006, 012, 015, 021, 024, 039, 048, 051, 056, 058, 069, 072, 078.
    - **Fix:** in those cases, explain using the plain letter: "G to E is a major 6th; sharpening both notes keeps it a major 6th." Otherwise use semitone counting only.

15. **WARN: grammar errors repeated through the interval texts (58 questions in section 4).**
    - "a augmented" (51 occurrences, including prompts such as i-write-047 and i-write-003: "Write a note that is a augmented 15th above this note").
    - "gives a 8th" and "a 11th".
    - "spans 1 semitones" (5 occurrences, for example i-name-017).
    - Whys such as "A augmented 3rd spans 5 semitones" (i-name-001).
    - **Fix:** choose "an" before vowels and before 8th/11th/18th, and make "semitone" agree with the number.

16. **NIT: augmented 15ths with double-sharp answers are very hard.**
    - **Ids:** i-write-047 (E♯2 → E𝄪4) and i-write-003 / i-write-023 (augmented 15th / compound augmented octave).
    - **Why:** the syllabus allows these ("aug 8ve" plus "15th or compound 8ve"), but they are much harder than ABRSM papers. Writing a double sharp two ledger lines above the bass stave is about the limit.
    - **Fix:** consider tagging them as tricky or limiting them to difficulty 3.

### Section 1: rhythm

17. **WARN: the note-value explanations are broken.**
    - **Ids:** all 46 r-values questions.
    - **What is wrong:**
      - "A quaver lasts 0½ crotchet beats" (should be "½").
      - "A demisemiquaver lasts 1 demisemiquavers".
      - "A semiquaver lasts 2 demisemiquavers, so 16 of them fit into one semibreve" (r-values-023). The two halves of the sentence use different units, so the reasoning doesn't follow.
    - **Examples:** r-values-001, 008, 019, 023, 038.
    - **Fix:** use one unit throughout, for example "A semibreve = 4 crotchets = 16 semiquavers (each crotchet holds 4 semiquavers)".

18. **WARN: grammar and logic in the rest explanations.**
    - **Ids:** about 60 r-rests questions.
    - **What is wrong:** "After the notes there is 2 crotchet beats left" (should be "there are"). "Complete the part beat first" also appears when there is no part beat (for example r-rests-008: crotchet, crotchet, then a minim rest).
    - **Fix:** use "there are"/"there is" correctly, and only mention part beats when one exists.

19. **WARN: mismatched units in a time-signature hint.**
    - **r-time-037:** the hint for the 9/16 option says "9/16 needs 18 demisemiquavers in a bar; this bar has 4 crotchet beats". Comparing demisemiquavers with crotchets is confusing.
    - **Fix:** use one unit, for example "9/16 = 9 semiquavers (2¼ crotchets)".

20. **WARN: heavy duplication, so the bank is much smaller than its counts suggest.**
    - **Exact duplicates found:** prompt, music and option set identical, with options in a different order. Section 1 has 134 (r-tuplets 67 of 85, r-rests 34, r-convert 33). Section 3 has 81 (k-relative 38, k-chromatic 22, k-signatures 17). Section 6 has 29 (t-instruments 22). Section 5 has 11 (c-cadences). Example pairs: r-tuplets-014 = r-tuplets-036; r-rests-005 = 006 = 008 = 042 = 083 = 084; c-cadences-030 = 069 = 071.
    - **Fix:** de-duplicate on (prompt, music, sorted options), or add variety to the generators.
    - **Also:** the rests generator only ever puts a single note at the start of the bar and never uses 5/4, 7/4, 5/8 or 7/8, the irregular times that are new at Grade 5. Consider extending it.

### Section 2: pitch and transposition

21. **WARN: one distractor in each of two questions uses a 7-sharp/flat key.**
    - **p-instruments-107:** the "wrong interval" option is written in C♭ major (7 flats), with an F♭5.
    - **p-instruments-039:** a distractor uses C♯ major (7 sharps).
    - **Why it matters:** the syllabus stops at 6 sharps/flats. A 7-accidental key signature looks odd and gives the distractor away.
    - **Fix:** choose a different wrong interval when the result would be beyond 6 sharps/flats.

22. **NIT: the written trumpet part goes very high.**
    - **p-instruments-056:** the written trumpet in B♭ part climbs to G♯6, well above the normal written range (about C6).
    - **Fix:** keep transposition melodies within a playable range for the named instrument.

23. **NIT: double space in an explanation.**
    - **p-instruments-058:** "move every note UP.  The first note" (the key-change sentence is empty when there is no key signature).
    - **Same in section 3:** the k-signatures major-key template has it too, for example k-signatures-011, 063, 089: "(B♭, E♭).  Sharps always go…". 35 occurrences in all.

### Section 3: keys and scales

24. **WARN: some correct chromatic scales use unusual spellings.**
    - **Examples:**
      - ascending from B: B C C♯ D D♯ E **E♯** F♯ …
      - ascending from B♭: B♭ **C♭** C D♭ …
      - ascending from E♭: E♭ **F♭** F …
      - descending from B: … F♯ **E♯** E …
      - descending from F♯: F♯ **E♯** E D♯ D C♯ **B♯** B …
    - **Ids:** k-chromatic-078, and the other B, B♭, E♭ and F♯ items.
    - **Why it matters:** they pass the "no letter more than twice in a row" rule, and the script found every correct option valid and every distractor invalid. But most teachers would expect B C C♯ … E F F♯, and B♭ B C …. A student taught the usual "harmonic chromatic" may think the keyed answer is wrong.
    - **Fix:** use the standard harmonic chromatic spelling for the correct option: tonic and dominant once each, every other letter twice.

25. **NIT: the key-signature tip doesn't fit minor-key questions.**
    - **Ids:** k-signatures-085, 061 and the other "Which minor key has this key signature?" items.
    - **What is wrong:** the tip says "for major keys with flats, the second-to-last flat is the key name". That is unhelpful when the question asks for the minor key.
    - **Fix:** add "…then go down a minor 3rd for the relative minor".

26. **NIT: k-relative-050 has only three options.** The other relative-key questions have four.

---

## Checked and found correct (no issue)
- **Clefs and pitch:** all clef reading and same-pitch items in the sample, including tenor and alto with double sharps (p-clefs-064, p-clefs-049).
- **Enharmonics:** every option in the sample checked.
- **Transposition:** all 111 octave transpositions and all instrument transpositions (script). That includes the instrument key-signature changes.
- **Keys:** every key signature, relative key and degree question (script, whole bank). No 7-sharp/flat key is ever a correct answer.
- **Scales:** all 40 scale-identification answers, plus the sampled missing-note scales (melodic minor ascending/descending handled correctly).
- **Intervals:** all 170 interval names and placements (script). No double-diminished or double-augmented intervals, no unisons.
- **Chords:** I, II, IV and V in a/b/c position in major and harmonic-minor keys (sample).
- **Cadence chord choices:** all 51 drop-down questions' acceptCombos exactly match the full set of valid combinations (script).
- **Off-syllabus content:** no septuplets, no interrupted cadences, and none of the pre-2020-only terms anywhere in the bank.
- **Rhythm:** tuplet, time-signature, conversion and rest answers in the sample are all correct, including the grouping conventions (3/8 and 3/4 rests, 6/4 dotted minim rest, 9/8).
- **Music in context:** all 30 extracts have correct bar lengths. Every count, X–Y interval, transposition and time-signature answer is correct apart from items 3 to 5 above.

---

## Summary

| Severity | Count |
|---|---|
| ERROR | 6 findings (1, 2, 3, 4, 5, 8), covering about 32 questions (16 + 9 + 1 + 1 + 1 + 4) |
| WARN | 14 findings (6, 7, 9, 10, 11, 12, 14, 15, 17, 18, 19, 20, 21, 24), mostly template text affecting several hundred questions |
| NIT | 6 findings (13, 16, 22, 23, 25, 26) |

Highest priority: the ornament notation bugs (1 and 2), the music-in-context items 3 and 4, and the term true/false explanations (10).

## Question ids checked by hand (194)

**Section 1 (22):** r-values-008, r-values-023, r-values-038, r-time-026, r-time-035, r-time-037, r-time-029, r-rests-008, r-rests-025, r-rests-042, r-rests-059, r-rests-076, r-tuplets-020, r-tuplets-014, r-tuplets-036, r-tuplets-055, r-tuplets-074, r-convert-008, r-convert-025, r-convert-042, r-convert-059, r-convert-076. Also from an earlier sample: r-time-013, r-time-030, r-time-047, r-time-072, r-time-073, r-tuplets-004, r-tuplets-032, r-tuplets-047, r-tuplets-062, r-tuplets-077, and every distinct rest pattern (r-rests-003 to r-rests-082).

**Section 2 (41):** p-clefs-054, 070, 003, 006, 084, 078, 034, 011, 081, 051, 029, 049, 061, 064; p-enharmonic-015, 032, 049, 066, 083; p-transpose-clef-015, 033, 052, 070, 089, 107, 007; p-instruments-027, 055, 041, 096, 021, 056, 068, 107, 058, 039, 047, 035, 065, 101, 069.

**Section 3 (38):** k-signatures-011, 119, 085, 089, 112, 060, 124, 063, 031, 061, 077, 062; k-relative-022, 050, 078; k-degrees-038, 084, 061, 042, 065, 067; k-scales-090, 064, 055, 040, 050, 103, 107, 031, 047, 043, 027; k-chromatic-022, 050, 078; k-key-of-melody-022, 050, 078.

**Section 4 (23):** i-name-001, 039, 064, 022, 013, 071, 074, 017, 031, 048, 059, 040; i-write-016, 047, 002, 038, 066, 003, 056, 005, 023, 046, 067.

**Section 5 (24, plus all 34 cadence-naming items listed by script):** c-chords-001, 019, 077, 085, 004, 028, 062, 045, 007, 083, 071, 056, 078; c-cadences-001, 014, 023, 034, 048, 059, 075, 007, 030, 056, 069.

**Section 6 (23, plus every ornament bar by script):** t-terms-001, 064, 018, 049, 076, 105, 035, 102; t-signs-011, 043, 073, 026, 063; t-ornaments-009, 026, 043, 060, 077; t-instruments-014, 033, 054, 075, 004.

**Section 7 (23, plus all 30 extracts by script and x-context-006-5 and x-context-012-* by hand):** x-context-001-6, 003-4, 005-4, 007-2, 008-9, 010-5, 012-3, 014-1, 015-6, 017-5, 019-4, 021-2, 023-1, 024-6, 026-4, 028-3, 030-1, 010-7, 020-7, 030-7, 010-8, 020-8, 030-8.

---

## Fixes applied (main session, 18 Oct, ~20:45 UTC)

- **E1 acciaccatura length**: written-out acciaccatura is now demisemiquaver + double-dotted quaver (a full crotchet beat).
- **E2 wrong grace note**: neighbour notes now come from a shared `neighbours()` helper over 7-note scales in several octaves (the old code searched a scale that didn't contain the main note). Same helper drives sign and written-out versions, so they always match.
- **E3 one-note chord bar**: the arpeggio bar must have 3+ notes, and the question is dropped unless the bar's notes cover the whole triad.
- **E4 C♯ minor without B♯**: the arpeggio bar can no longer be bar 5 (which carries the leading note); generator throws if a minor extract lacks its raised 7th.
- **E5 highest note in several bars**: statement now reads "appears in bar N".
- **E6 inverted cadences**: perfect and plagal cadence questions use root-position chords only; inversion only on the first chord of an imperfect cadence.
- **W term true/false explanations**: now list exactly the four terms in the statements.
- **W grammar**: a/an helper for interval names and ornaments; plurals for semitones/demisemiquavers; "½ crotchet beat"; "is/are left".
- **W interval explanations in remote keys**: when the lower note isn't a Grade 5 major key, the explanation starts from the plain letter names and explains how each accidental changes the size.
- **W duplicates**: fingerprint ignores option order; tuplet questions vary pitch and position. Bank now 2,327 unique questions.
- **W chromatic spellings**: correct answers avoid E♯/B♯/C♭/F♭/double accidentals.
- **W 7-sharp/flat distractors**: limited to 6.
- **W extracts**: the printed term is the first form only ("vivace"); "could be played by" statements replaced with true/false clef statements.
- **Not changed**: rest questions in irregular time signatures — conventions for grouping rests in 5/4, 7/8 etc. vary, so they are left out deliberately (logged for a human to check).
