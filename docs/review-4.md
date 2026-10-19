# Review 4: four-part chords and piano extracts (19 Oct 2026)

A fresh subagent (which did not write the content) checked 140 grand-stave chord/cadence
questions and 150 piano context sets (1,286 questions) with independent scripts (tonal).

- Errors: 0. Ambiguities: 0.
- Warnings (all fixed):
  1. Consecutive 5ths/octaves in IV–V → `voiceFourPart` now penalises parallels; unit test over every key.
  2. Tune leapt up to the forced leading note → bar 3 now walks to the cadence note and the final tonic is chosen near the tune's register.
  3. Augmented 2nds (6th to raised 7th) in minor tunes → banned.
  4. Diminished II in root position in minor → only IIb in minor.
  5. Long right-hand notes clashing with the chord → crotchets and longer are chord notes.
  6. Between-hands interval question dropped ~65% of the time → now measured from the highest left-hand note (present in ~88% of sets).
- Nits fixed: ornaments not on semiquavers; articulation not on minims/semibreves; diminished chord doubles its 3rd.
- Nits left: the left hand often doubles the leading note in bar 3 (acceptable in piano writing); IIc in minor still appears in isolated chord-naming questions (valid identification practice).

Guard test: tests/unit/piano-style.test.js.
