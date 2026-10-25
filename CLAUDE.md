# Overnight brief: Grade 5 Music Theory app (repo: JacobGoodchild/musictheoryapp)

Paste everything below into a new Claude Code session connected to the `musictheoryapp` repo.

---

You are building, overnight and on your own, a polished, gamified web app that teaches and drills **ABRSM Grade 5 Music Theory** (the current online exam, syllabus from 2020). It is hosted free on GitHub Pages from this repo and used by a real student on a **Linux laptop in Chrome**. She is also doing a short Udemy Grade 5 crash course, so this app is where the deep learning and the heavy practice happen.

The repo is empty right now. Your first job is to save this whole brief as `CLAUDE.md` in the repo root, so every later session (and you, after any context reset) can re-read it. Keep a progress log at the bottom of it.

## 0. Time and working rules: read this first

- **Work continuously until 05:40 UTC on Monday 19 October 2026 (06:40 UK time).** Do not stop early, do not ask me questions, and do not wait for approval. I am asleep.
- Run `date -u` at the start of every feature and keep track of how much time is left. Being "finished" with the plan is never a reason to stop. If you run out of planned items, go to the backlog (section 9) and keep improving quality, then content, then polish, until the deadline.
- In the **last 20 minutes**, stop starting new features. Make sure `main` is green and deployed, then write the morning summary (section 10).
- Make every sensible decision yourself and record each one in the progress log, one line per decision.
- Do **one feature per commit**. Run the tests before every commit and push to `main` after every green commit, so the live site updates through the night. If you work on a branch, merge it into `main` after each green feature.
- **Never leave `main` broken.** If something breaks and you can't fix it quickly, revert it rather than piling fixes on top.
- Use the web freely while building (research, checking facts, docs). The *app itself* must make **no network requests at runtime** (see section 7).
- You may use subagents for reviews and checks (section 6). A fresh reviewer that didn't write the content is the best way to catch mistakes.

## 1. The goal in one paragraph

A student should be able to open the site, name her profile, and work through Grade 5 from start to finish: short, clear lessons with properly engraved music; practice by topic; unlimited random exam questions; full timed mock exams that look and mark like the real thing; memorisation tools for terms, keys and instruments; and a light, fun reward layer (coins, an avatar to customise, blind-bag stickers to collect) that makes her want to come back. **Correctness beats everything.** A wrong note on a stave, a wrongly spelled scale or a wrong answer key is the worst possible bug in this app. One rule decides most design choices: **no musical fact or answer is typed in by hand when code can compute it and tests can check it.**

## 2. Syllabus facts (researched 18 Oct 2026, so verify against ABRSM's own documents)

The official sources are the authority. Look them up yourself and save the key facts into `docs/syllabus.md` with links:
- ABRSM *Music Theory Syllabus Outline Grades 1–5 (from 2020)*: https://www.abrsm.org/sites/default/files/2023-09/music-theory-syllabus-outline-grades-1-5-from-2020.pdf
- ABRSM *Music Theory Grades Qualification Specification* (Apr 2023): https://www.abrsm.org/sites/default/files/2023-09/Music%20Theory%20Qual%20Spec%20April%202023%20[2023%20rebrand].pdf
- ABRSM *online theory example questions / reference sheet*: https://www.abrsm.org/sites/default/files/2023-09/abrsm-ot-reference-sheet-example-questions_online-music-theory-from-2020.pdf
- ABRSM *Music Theory terms and signs for Grades 1–5 (from 2020)*: find the official list. Several websites still show the **older, pre-2020 lists**, so don't trust a list just because a site has it.

**Exam format:** online, up to **2 hours** with a countdown timer, **7 sections, 75 marks**. Section marks are 10 / 10 / 15 / 10 / 10 / 10 / 10. Result bands: **Pass 50–59, Merit 60–64, Distinction 65–75**, below 50 is not a pass. Marking is automatic. Section order (matching sample papers and the Udemy course chapters):
1. Rhythm (10)
2. Pitch (10)
3. Keys and scales (15)
4. Intervals (10)
5. Chords (10)
6. Terms, signs and instruments (10)
7. Music in context (10)

**Question formats in the real online exam** (copy these interactions):
- Multiple choice: click one option, then press **Answer** to confirm.
- Tick or cross several statements (true/false).
- **Drag and drop a notehead onto a stave.** The notehead can carry a natural, sharp, flat, double sharp or double flat, and must be placed accurately. It can be adjusted before submitting.
- Type a number (digits only, Tab moves between boxes).
- Drop-down boxes, for example choosing I, II, IV or V under cadence points. All boxes must be filled before Answer becomes active.
- There is no hand-writing of music and no composition.

**Grade 5 content (cumulative: everything from Grades 1–4 is examinable too):**
- **Rhythm:**
  - All note and rest values from breve to demisemiquaver, ties, dots and double dots.
  - All simple and compound duple, triple and quadruple time signatures, plus **irregular time signatures** (e.g. 5/4, 7/8, 5/8) and correct grouping of notes and rests in them.
  - Triplets, duplets, and **irregular divisions of simple time values** (quintuplets, sextuplets, septuplets; check exactly which are listed).
  - Halving/doubling note values, converting between simple and compound time, adding missing bar lines, time signatures and rests.
- **Pitch:**
  - Treble, bass, alto and **tenor** clefs; notes in all four clefs in any Grade 5 key; ledger lines.
  - Accidentals including double sharps and flats, and enharmonic equivalents.
  - Transposing a simple melody **at the octave from any clef to any other**.
  - Transposing a short melody **to concert pitch from instruments in B♭, A and F, and the reverse**. The question states the interval. Typically B♭ sounds a major 2nd lower (clarinet, trumpet), A sounds a minor 3rd lower (clarinet in A) and F sounds a perfect 5th lower (horn, cor anglais); verify.
- **Keys and scales:**
  - All major and minor keys with **up to six sharps and six flats** (majors C, G, D, A, E, B, F♯, F, B♭, E♭, A♭, D♭, G♭; minors A, E, B, F♯, C♯, G♯, D♯, D, G, C, F, B♭, E♭) and their key signatures in all four clefs.
  - Harmonic and melodic minor (melodic differs going down), and chromatic scales (correct spelling).
  - Relative keys and technical names of degrees (tonic, supertonic, mediant, subdominant, dominant, submediant, leading note).
  - **Scales in all four clefs.**
- **Intervals:** all **simple and compound intervals from any note** (number and quality: perfect, major, minor, augmented, diminished).
- **Chords:**
  - Tonic, supertonic, subdominant and dominant (I, II, IV, V) in **root position (a), first inversion (b) and second inversion (c)** in any Grade 5 key.
  - Minor keys use the harmonic minor, so V is major and II is diminished. Check how ABRSM presents these.
  - Choosing chords at cadence points of a simple melody, in **C, G, D or F major only**.
  - **Perfect, plagal and imperfect cadences** in C, G, D or F major.
- **Terms, signs, instruments:**
  - Cumulative Italian terms (Grades 1–5), French (Grade 4) and German (Grade 5).
  - Grade 5 signs include strong accent, semi-staccato, staccatissimo, tenuto, 8va, alla breve, multi-bar rests and volta brackets, plus all earlier signs.
  - **Ornaments**: trill, turn, upper and lower mordent, acciaccatura, appoggiatura. At Grade 5, the student must recognise written-out ornaments and replace them with the sign; the reverse is not required.
  - Voice types, standard orchestral instruments, their clefs, families, ranges and how each family produces sound.
- **Music in context:** answering questions about a real-looking piano or instrumental extract, combining everything above (keys, intervals, chords, rhythm, terms, transposition, instruments).

**Grade 5 term lists as researched:** these match ABRSM's published counts for the 2020 list (15 Italian and 6 German at Grade 5; 15 Italian and 6 French at Grade 4). Still confirm them against the official list.
- **Grade 5 Italian:** a niente, ad libitum (ad lib.), attacca, cantando, con dolore, con spirito, doloroso, largamente, morendo, perdendosi, quasi, rinforzando (rf, rfz, rinf.), smorzando (smorz.), sonoro, sotto voce.
- **Grade 5 German:** langsam, lebhaft, mässig, ruhig, schnell, traurig.
- **Grade 4 Italian:** affettuoso, alla breve, amabile, appassionato, assai, come prima, comodo / tempo comodo, con brio, deciso, larghetto, mesto, misterioso, ritmico, rubato / tempo rubato, stringendo.
- **Grade 4 French:** animé, douce, lent, modéré, retenu, vite.
- **Grades 1–3:** find the official 2020 lists (published counts: Grade 1 has 24 terms and 10 signs, Grade 2 has 24 terms and 9 signs, Grade 3 has 23 terms). If a term only appears in pre-2020 lists, it may appear in a "bonus" set but must be clearly marked, and it must never appear in mock exams.

**Copyright:** never copy ABRSM past-paper questions or music. Study the free official example questions and reputable sample papers for *style and difficulty*, then write **original** questions. For music-in-context extracts, write original short pieces in a convincing classical style, or use genuinely public-domain melodies, and re-engrave and check them yourself.

**About the Udemy course** (complement it, don't copy it): it's probably *"ABRSM Grade 5 Theory Crash Course"* on Udemy (25 short lectures, about 1.5 hours). It is built as 7 chapters that mirror the exam sections, each mostly walking through exam questions. So use the **same 7 section names and order** so the two line up, and make this app the place for proper explanations and lots of practice.

**Slight emphasis (a tiny bit, not a lot):** key signatures, transposition (clef-to-clef and transposing instruments) and the harder topics generally. Give these slightly bigger question banks, an extra "tricky" set and an extra worked example each. Every topic must still be fully covered.

## 3. The music brain and engraving (build these first; everything depends on them)

### 3a. The music brain (`src/theory/`)
A pure JavaScript library with no rendering, which is the single source of truth:
- **Pitches:** letter + accidental + octave, MIDI number, and staff position in each clef.
- **Intervals:** name and spell intervals both ways, including compound and enharmonic cases.
- **Keys, signatures and scales:** key signatures (correct order and placement of sharps and flats per clef), scales (major, harmonic/melodic minor, chromatic, spelled correctly), and degree names.
- **Chords:** chords and inversions, cadences, and choosing chords for melody notes in C, G, D and F.
- **Transposition:** by interval and between clefs, and the B♭/A/F instrument rules.
- **Rhythm:** time-signature maths, beat grouping rules (simple, compound, irregular), and tuplets.

Every question's correct answer **and** its wrong options come from this brain.

### 3b. Prove the brain correct (tests in `tests/theory/`)
- **Exhaustive tests:** every key up to 6♯/6♭ checked against hand-checked reference tables written from the official syllabus and standard theory texts. Also every interval from every note in every Grade 5 key, every chord and inversion in every key, and round-trip transposition (up then down gives back the original).
- **A second, independent check:** in the tests only (never shipped), compare your brain against a well-known library such as **`tonal`** (npm, MIT) for scales, intervals, chords and key signatures across thousands of cases. Any disagreement must be investigated and explained in a test comment. Don't just make the numbers match.
- **Wrong options must really be wrong:** generated distractors are never accidentally correct (e.g. an enharmonic spelling that is also acceptable). Write a property test for this.

### 3c. Engraving
- Use a well-known, properly licensed music notation library, **VexFlow** (MIT) preferred, **vendored into the repo** (no CDN).
- Notes, clefs (including alto and tenor), key and time signatures, accidentals, ledger lines, beams, tuplets, ties, dots, rests, ornaments and articulation signs must all look like real printed music. **No home-made shape diagrams.**
- Every stave in the app is drawn from data, through one wrapper (`src/notation/`).

### 3d. Checking the engraving (two layers)
1. **Automated:** after rendering, read back the drawn noteheads' positions and assert each sits on the correct line or space for its pitch and clef. Also check the accidental and key signature symbols, and that nothing overlaps or runs off the stave. Run this over **every stave in every lesson and every question in the bank**.
2. **By eye:** build a dev-only page, `dev/gallery.html` (not linked from the app), that shows every stave with its intended content written underneath. Use Playwright to screenshot it in batches, then **actually look at the screenshots** and fix anything wrong or ugly. Repeat after any notation change.

## 4. App structure and features

The look is a modern, sleek app with a little colour: clean type, rounded cards, gentle shadows, smooth small animations (buttons that press in slightly, cards that lift, satisfying correct/incorrect feedback), and light and dark mode. It is designed for a laptop screen in Chrome but works fine when resized. It should feel like a real product, not a homework website. Use system fonts or fonts vendored into the repo with an open licence.

**No personal info anywhere.** Don't put real names, the student's name, or anything about the person this is for in the code, content, commits or site. The app is generic: "Grade 5 Theory".

### Home
- Profile name (entered on first visit, editable, stored locally only).
- Avatar, coin balance, daily streak, and overall progress per section.
- "Continue where you left off", a suggested next step (weakest topic or next lesson), and quick buttons into each area.

### Learn
- Lessons grouped by the **7 exam sections**, with clear titles and a picture or icon each, and a progress tick per lesson. Split big topics into several bite-size lessons.
- Each lesson has:
  - a short intro;
  - an explanation with engraved examples;
  - worked examples shown step by step;
  - key points;
  - common mistakes;
  - "things to memorise";
  - a 5–8 question check at the end;
  - a **"hear it" button** where sound helps (intervals, chords, cadences, major vs minor, transposing instruments).
- Cover every syllabus point in section 2, including the Grade 1–4 basics as quick "refresh" lessons.
- Lesson text is written by you, so it gets a review pass (section 6).

### Exam practice
- **By topic:** pick a section, or a sub-topic like "tenor clef" or "B♭ transposition", and drill questions.
- **Random mode:** unlimited questions drawn from the whole syllabus.
- **Mock papers:** a full exam with **7 sections, 75 marks, a 2-hour countdown**, the same interaction types as the real exam, and section weightings and difficulty matched to the real paper. At the end, show the score per section, the band (Pass/Merit/Distinction), a review of every question with explanations, and history of past mocks. Offer a set of fixed mock papers (at least 8) plus "generate a new mock".
- **Question bank:** pre-generate a large, checked bank into `data/questions/*.json` (aim for **2,000+** questions across all topics). Each question records its topic, difficulty, the data needed to draw it, the correct answer and an explanation (including why each common wrong answer is wrong). Random mode can also generate fresh questions live from the same generators, using the same checks.
- **Review mistakes:** questions she got wrong come back later until she gets them right.
- **Audio questions** (bonus, not in the real exam): e.g. hear an interval and name it, hear a cadence and name it, major or minor, hear a transposing-instrument melody. Label them clearly as "listening practice".

### Memorise
- Key signatures: an interactive circle of fifths showing how each key leads to the next, relative minors, and the order of sharps and flats.
- Terms (Italian, French, German), signs and ornaments, and instruments (families, clefs, transposition).
- Quick quiz games, e.g. a "beat the clock" round and matching pairs.
- **Flashcard mode** with simple spaced repetition: cards you know come back less often. Tag cards by grade so the Grade 5 set can be drilled on its own.

### Rewards (fun, but not a grind and not a giveaway)
- **Coins** are earned for real learning: correct answers, completing lessons, mock papers (more for higher bands and personal bests), daily streaks, and clearing the mistakes list. They are not earned for repeating easy questions endlessly (diminishing coins for the same easy question).
- Tune the economy so that collecting everything takes roughly **6–8 weeks of regular use** (finishing all lessons, about 10 mocks, and steady daily practice). She should be able to buy something nice every session or two, but should never run out of things to work towards in the first week. Write the numbers in `docs/economy.md` and write a test that simulates a typical study routine to prove the pacing.
- **Avatar:** a customisable character (original art drawn in SVG by you, e.g. a cute modern character) with unlockable outfits, hats, hair, colours, accessories and backgrounds bought with coins.
- **Blind bags:**
  - Buy a bag with coins and open it with a satisfying animation (shake, tear, reveal, rarity glow).
  - Each bag gives one music-theory sticker. Rarities are **Common, Rare, Epic, Legendary and a few Mythic**, with odds always shown on screen (e.g. 55 / 27 / 12 / 5 / 1%).
  - About 60 stickers, original SVG art. Examples: Crotchet (Common), Treble Clef (Common), Alto Clef (Legendary), Tenor Clef (Mythic).
  - Duplicates turn into "notes" (a second currency) that can be swapped for a chosen missing sticker.
  - There is a pity rule: guaranteed Epic or better at least every 10 bags.
  - Use a seeded random number generator so it's testable, and run a test that checks the real odds over many openings.
- **Sticker album:** a grid of all stickers, with uncollected ones shown as silhouettes behind a see-through padlock, plus collection progress per rarity.
- Small extras if there's time: trophies or badges, a level bar, and confetti on a Distinction.

### Settings and saving
- Progress is saved in `localStorage` (always inside try/catch).
- **Export / import save as a file**, so progress survives a browser clear.
- Sound and volume, dark mode, reduced motion, and a reset-progress option behind a confirm step.
- Keep old saves working when the save format changes (versioned save + migration + test).

## 5. Tech

- Plain HTML/CSS/JavaScript ES modules, no build step needed to run (a small Node script to pre-generate the question bank is fine; commit its output).
- Libraries vendored into `vendor/` (VexFlow; `tonal` only in tests/dev). Only well-known, licensed npm packages.
- **Audio:** Web Audio. Either a pleasant synthesised piano-like sound, or freely licensed samples (CC0, or CC-BY with credit) stored in the repo and listed in `CREDITS.md`.
- **Tests:** Node unit tests for the brain, and Playwright (headless Chromium) for the app. Cover:
  - no console errors on every screen;
  - lessons render;
  - every question type can be answered and marked correctly;
  - a full mock can be taken and scored;
  - saving, export/import and migration work;
  - the blind bag odds are right;
  - the economy pacing passes.
- **GitHub Actions:** run all tests on every push to `main`, and deploy to GitHub Pages only if they pass (the Pages source is set to "GitHub Actions"). Keep CI under about 15 minutes.
- **Installable:** add a manifest and offline service worker so it can be installed in Chrome and works offline, with an "update ready" banner and the version shown in Settings.

## 6. Quality passes (run these, don't skip them)

- **After each content batch, run a fresh-eyes review:**
  - Use a subagent that did not write the content. It reads lessons and a random sample of 100+ questions against the official sources and `docs/syllabus.md`.
  - It lists any error, any ambiguity (two defensible answers), anything off-syllabus, and any British/American term slip.
  - Fix everything it finds and log it.
- **Terminology:** British terms throughout (crotchet, quaver, semibreve, bar, stave/staff). Use ABRSM wording such as "leading note" and "1st inversion".
- **Screenshots:** take them of every main screen at 1366×768 and 1920×1080 in light and dark mode. Look at them and fix layout or ugliness.
- **Accessibility:** keyboard usable, visible focus, readable contrast, and no information carried by colour alone.

## 7. Safety rules (the site is public)

- No runtime network requests (no CDNs, analytics, trackers, fonts from the web, or remote code), no `eval`, no cookies, no accounts, no secrets in the repo.
- The profile name is shown only with `textContent` (never as HTML) and length-limited.
- Nothing personal about the real user anywhere (see section 4).

## 8. Build order (tick these off in CLAUDE.md as you go)

1. Setup: repo skeleton, CLAUDE.md, CI test + Pages deploy, vendored VexFlow, the test runner, and an app shell with home and navigation. **Push early so the site goes live in the first hour.**
2. The music brain with exhaustive tests and the `tonal` cross-check.
3. The notation wrapper, the position-checking test and the dev gallery with screenshot review.
4. The question engine: all interaction types (multiple choice, tick/cross, drag-notehead-on-stave, number entry, drop-downs) and marking.
5. Generators and the checked question bank, section by section in exam order (1 → 7), with a review pass after each.
6. Exam practice: by topic, random mode and the mistakes review.
7. Mock exams: timer, sections, scoring, bands, review and history, plus 8 fixed mocks.
8. Learn: all lessons with engraved examples, worked examples and end checks, plus a review pass.
9. Memorise: circle of fifths, terms, signs, instruments, flashcards and games.
10. Audio: "hear it" buttons and listening practice.
11. Rewards: coins and economy test, avatar and shop, blind bags with odds and pity, sticker album.
12. Settings, export/import, migration, PWA and update banner.
13. Full polish pass: animations, empty states, onboarding for first visit, dark mode, and screenshots of everything.
14. Then the backlog until the deadline.

If you're short on time, the priority is: correct content and questions > mocks and practice > lessons > memorise > rewards > polish. Never trade correctness for features.

## 9. Backlog (keep going here until 05:40 UTC)

- More fixed mock papers and more "tricky" questions for key signatures and transposition.
- A topic-mastery map showing strength per sub-topic, driven by her answers.
- A short daily challenge (5 questions, bonus coins).
- More avatar items and stickers (keep the odds shown and the economy test passing).
- An exam-day page: format, timing, what to expect, and checklist (written in your own words).
- A printable one-page summary per section.
- More review passes over random samples of the bank. Every error found is a win.

## 10. Morning summary (last 20 minutes)

At the bottom of CLAUDE.md, write a dated summary in plain English:
- What's in the app now, and the live link (`https://jacobgoodchild.github.io/musictheoryapp/`).
- How content was checked, with numbers: questions in the bank, tests, review passes, and errors found and fixed.
- Anything not done, and anything you're unsure about in the syllabus, so a human can check it.
- The top 5 things to improve next.

---

# Progress log

## Build order checklist
- [x] 1. Setup: skeleton, CLAUDE.md, CI + Pages deploy, vendored VexFlow, test runner, app shell
- [x] 2. Music brain + exhaustive tests + tonal cross-check
- [x] 3. Notation wrapper, position test, dev gallery
- [x] 4. Question engine (all interaction types)
- [x] 5. Generators + checked bank (sections 1→7) — review pass 1 done (docs/review-1.md)
- [x] 6. Practice: by topic, random, mistakes, tricky set, daily challenge, mastery map, listening
- [x] 7. Mock exams (10 fixed + generate new), timer, navigator, flags, resume after reload, results, review, history
- [x] 8. Learn: 33 lessons (all 7 sections, refresh lessons for G1–4) with engraved examples, worked examples, checks
- [x] 9. Memorise: circle of fifths, 7 flashcard decks with spaced repetition, beat the clock, matching pairs
- [x] 10. Audio: Web Audio piano synth, hear-it buttons in lessons and after interval/chord/cadence answers, listening practice (labelled bonus)
- [x] 11. Rewards: coins economy (simulated + tested), avatar (8 slots, 45 paid items + free starters), blind bags with shown odds and pity, 60-sticker album with swaps
- [x] 12. Settings (name, theme, reduced motion, sound/volume), export/import save file, reset with double confirm, migration test, offline PWA with update banner, version shown
- [x] 13. Polish: new Home (avatar, coins, streak, suggested next step from weakest topic/next lesson, continue, quick start, per-section progress), first-visit welcome, 48 screenshots reviewed (12 screens × 1366/1920 × light/dark)
- [~] 14. Backlog: mastery map, daily challenge, exam-day page, printable summaries, bar-line questions done; more mocks/tricky sets and further review passes ongoing

## Decisions (one line each)
- 2026-10-18 19:00 UTC: Work on branch `claude/elegant-davinci-qdhagy` (session branch) and fast-forward `main` to it after every green commit, as the brief allows.
- VexFlow 5.0.0, `vexflow-bravura.js` UMD build vendored: it embeds Bravura + Academico as data: URLs, so no CDN fetch. Never call `VexFlow.loadFonts()` (that fetches from jsdelivr); instead await `document.fonts.load('30pt Bravura')` before drawing.
- Plain ES modules, hash router, lazy-loaded views; no build step.
- Node's built-in test runner (`node --test`) for unit tests; Playwright 1.56.1 (matches the preinstalled Chromium) for e2e.
- Strict Content-Security-Policy meta tag (script-src 'self', connect-src 'self') to guarantee no runtime network calls.
- Save is versioned (v3 now) with a migration chain from v1; all storage access in try/catch.
- 19:35 Syllabus research saved to docs/syllabus.md (subagent read the ABRSM spec PDFs). Irregular times limited to 5/4, 7/4, 5/8, 7/8; tuplets = triplet, duplet, quintuplet, sextuplet (septuplets not named, so not tested); intervals up to a 15th.
- Compound intervals named "compound major 3rd" by default (lesson also teaches "major 10th"); MCQ options never offer both names of one interval.
- Minor-key chords use the harmonic minor (V major, II diminished); Roman numerals are upper case throughout, as ABRSM prints them.
- Chromatic scale: validity = 13 notes, semitone steps, same-or-next letter, no letter 3 times running; canonical form = "harmonic chromatic" (1 b2 2 b3 3 4 #4 5 b6 6 b7 7 1).
- Cadence chord questions accept every chord pair that contains the melody notes and forms a valid cadence of the stated kind; final cadences (V-I / IV-I) are always unique (tested).
- Tonal cross-check: 52 scales, 26 signatures, 5000+ intervals, 8000+ transpositions, 104 triads, all MIDI numbers agree. Only difference: tonal allows triple accidentals, we refuse to spell those (asserted).
- Notation: every stave goes through src/notation/render.js (renderMusic). Accidentals are decided automatically from key signature + earlier accidentals in the bar. Drawings are auto-fitted to their real ink bounds (canvas text metrics on the Bravura glyphs), so nothing is clipped.
- Engraving check (src/notation/check.js) reads back SMuFL glyph code points + positions from the SVG: clef glyph and line, each key-signature symbol's line/space, every notehead's staff position, every accidental's kind and height, no clipping, no overlapping noteheads. Runs in Playwright over dev/gallery.html (dev/catalog.js gathers all staves).
- VexFlow's tenor-clef sharp key signature matches the standard printed pattern (F# on 2nd line, then C#, G#, D#, A#, E#) — verified by the check.
- Question model: {section, topic, difficulty, type: mcq|truefalse|place|number|dropdown, prompt, music, options/statements/place/numbers/dropdowns, answer, explanation, whyWrong, check}. Marking is pure (src/questions/mark.js) and unit-tested.
- Marks: mcq/place/single number = 1; true/false = 1 per statement; drop-downs = 1 per box. Partial credit per part.
- Placed notes: the student picks the accidental to SHOW; "none" means the key signature (or an earlier accidental in the bar) applies — exactly how written music works.
- validateQuestion re-derives answers from the brain using `check` data (interval, note name, key, chord, term clash, cadence combos — all valid combos must be accepted, place-interval, same-pitch). It found a real bug on first run: `.map(toString)` passed the index as the "withOctave" flag, dropping the bass note's octave. Fixed, and the renderer now throws on any pitch without an octave.
- Rests questions in compound time only leave whole dotted beats to fill (part-beat conventions differ between textbooks), and "single rest across beats" distractors are only used in simple time.
- Bank: 2,340 questions (85 per topic, x1.3-1.5 for emphasised topics: key signatures, scales, clef transposition, transposing instruments, terms; 261 music-in-context questions from ~37 extracts). Duplicates removed by fingerprint.
- Music-in-context extracts are generated originals (6 bars, any Grade 5 key, tempo term, ornament, articulation, X/Y interval marks, an arpeggiated chord bar) so there is no copyright issue.
- Fixed mocks: 10 papers (data/mocks.json), built by mock-builder: each section exactly 10/10/15/10/10/10/10 marks, topic coverage before repeats, difficulty mix 1:2:1.
- Mocks: questions can be revisited and changed until "Finish"; unfinished mock is stored in the save (mockRun) and resumes after reload; timer auto-marks at 0. Distinction triggers confetti. Coins: base 40 + band bonus + personal best.
- Fixed a CSS bug the screenshots exposed: wide staves inside option cards were clipped (rests looked missing). All staves now scale down to fit (max-width:100%, height:auto). Engraving checker now also verifies rest glyphs, and ignores grace-note heads (smaller font size) when counting noteheads.
- Engraving check covers 10 groups (demo, 7 bank sections, mocks, lessons) — ~4,000 staves, all clean; ~3.5 min locally.
- 20:45 Review pass 1 (fresh subagent, 194 questions by hand + scripts over whole bank): 6 errors (acciaccatura bar length, wrong grace note, one-note "chord" bar, minor extract missing its leading note, "highest note in bar N" ambiguity, inverted perfect/plagal cadences), 14 warnings, 6 nits. All errors and warnings fixed except rests in irregular time (left out on purpose). See docs/review-1.md.
- Lessons: every stave computed from the brain via helpers (scales, key signatures, intervals, chords, transposed melodies). End-of-lesson checks are generated from the same validated generators with fixed seeds. I caught and fixed two of my own lesson errors while re-reading (tenor vs alto is a 3rd apart, not a 2nd; chord II in F major does not contain F).
- Renderer now sizes each note's slot to fit its label text, so labelled examples never spill past the stave.
- Flashcards: Leitner boxes (0,1,2,4,8,16 days); 1 coin per known due card (none for extra practice).
- 2026-10-19 06:53 UTC: the session stopped at ~20:30 UTC when the usage limit hit and was not woken; ~10 hours lost. Added an hourly scheduled check-in that resumes the build if it has stopped.
- Economy tuned with a deterministic simulation of a "regular student" (6 days/week, ~35 questions, lessons, daily challenge, mock every 5 days): median ~54 days to collect everything (47–64 over 30 seeds). Numbers in docs/economy.md; tests/unit/economy.test.js enforces median 42–58 days, a purchase in session 1, and most things still locked after week 1.
- Stickers use Bravura glyphs (OFL, bundled with VexFlow) on original die-cut sticker art; a test checks every glyph exists in the bundled font. 200,000-bag test: each rarity within 2 points of the shown odds; pity never fails.
- Skin tones are all free (everyone can look like themselves from the start). Streak bonus awarded on the first visit each day.
- PWA: sw.js is generated by scripts/gen-sw.mjs and pre-caches every app file (79); a unit test fails if it is out of date (run `npm run gen`). New versions wait for the "Update now" banner. PNG icons rendered from assets/icon.svg. Offline e2e test passes.
- Added exam-day guide page (format, answer types, timing tips, saved checklist), written in my own words.
- Screenshot review caught a stray "null" on the blind-bag screen (native Element.append prints null); fixed and added a smoke test with a rich save that scans every screen for null/undefined/NaN text.
- Backlog: printable one-page summary per section (#/summary/N, print stylesheet hides the app chrome), linked from each section on the Learn page; tables computed from the brain and term lists.
- 07:20 Review pass 2 (lessons, fresh subagent): 4 errors, 17 warnings, 16 nits. All 4 errors and the main warnings fixed (docs/review-2-lessons.md). New r-barlines topic; bank now 2,412 questions.
- Found and fixed a test bug: Playwright's waitForFunction does not await async predicates, so the offline test wasn't really waiting for the service worker cache. Now uses expect.poll. Also the app no longer reloads itself on the first service-worker install (only after "Update now").


---

# Morning summary — Monday 19 October 2026 (written ~07:20 UTC)

**Live site:** https://jacobgoodchild.github.io/musictheoryapp/

**Note on timing:** the build stopped at about 20:30 UTC on Sunday when the usage limit was hit, and nothing woke it until about 06:50 UTC on Monday, so roughly 10 hours were lost. An hourly scheduled check-in now resumes the build automatically if it stops again. Everything below was finished between 19:00–20:30 UTC and 06:50–07:20 UTC.

## What's in the app
- **Home:** your avatar, coins, daily streak, a suggested next step (your weakest topic, or the next lesson), continue-where-you-left-off, quick-start tiles and progress for each of the 7 exam sections. On the first visit, a welcome screen asks for a name.
- **Learn:** 33 short lessons in exam order, covering all 7 sections (Grade 1–4 basics are marked "Refresh"). Each lesson has engraved examples, worked examples, key points, common mistakes, things to memorise, "Hear it" buttons and a 5–8 question check. There is also a printable one-page summary for each section.
- **Practice:**
  - by topic (25 topics) or by whole section, plus random mode (bank and freshly generated questions)
  - review mistakes, a tricky set (key signatures, clefs, transposition) and a daily challenge
  - a mastery map, and listening practice (clearly labelled as a bonus)
  - all five real-exam answer types: multiple choice, tick/cross, drag a notehead with accidentals onto the stave, number entry, and drop-downs
- **Mock exams:** 20 fixed papers plus "generate a new mock". Each has 7 sections and 75 marks (10/10/15/10/10/10/10) with a 2-hour countdown, a question navigator, flags and resume after a reload. Results show the band, section scores and a full review with explanations, and past mocks are kept in a history.
- **Memorise:** an interactive circle of fifths (in all four clefs), 7 flashcard decks with spaced repetition (the Grade 5 set can be drilled on its own), beat the clock, and matching pairs.
- **Rewards:**
  - coins for real learning, with less for repeating the same question
  - an original SVG avatar with 8 customisable slots
  - blind bags with the odds shown on screen (55/27/12/5/1) and a pity rule (Epic or better at least every 10 bags)
  - a 60-sticker album with padlocked silhouettes; duplicate stickers give "notes" you can swap for a sticker you choose
- **Settings:** name, light/dark/system theme, reduced motion, sound and volume, save export/import as a file, and reset behind two confirmations. The version is shown here.
- **Installable and offline:** it can be installed from Chrome, works offline after the first visit, and shows an "update ready" banner when a new version arrives.
- **Exam-day guide:** the format, how to answer each question type, timing tips and a checklist.

## How the content was checked (numbers)
- **Music logic** (`src/theory/`): hand-written reference tables for all 26 keys (scales, key signatures, relative keys, degrees, chromatic scales, key-signature positions in all four clefs). It was also cross-checked against the `tonal` library: 52 scales, 26 key signatures, over 5,000 intervals, over 8,000 transpositions, 104 triads and every MIDI number agree.
- **Question bank:** 2,707 questions in `data/questions/` (538 in the tricky set). Every one is re-checked by `validateQuestion`, which works the answer out again from the music logic for intervals, note names, keys, chords, cadence combinations, placed notes and same-pitch questions. A test also confirms that the right answer always gets full marks and a wrong one never does, across the bank and all 20 mocks.
- **Engraving:** every stave (about 4,100: the whole bank, all options, all placed answers, all mocks, all lessons) is drawn and read back. The check covers the clef, key signature positions, each notehead's line or space, accidentals, rests, ornaments, nothing clipped and no overlaps. All are clean, and screenshots were looked at by eye.
- **Tests:** 52 Node unit tests and 29 Playwright browser tests, all green, run in CI before every deploy. The browser tests cover:
  - every screen loads with no console errors, no outside requests and no stray "null" text
  - every question type answered through the real UI
  - a full mock taken through the UI with an exact score
  - export/import and migration of old saves
  - the offline mode
  - blind-bag odds (200,000 openings) and the pity rule
  - economy pacing (30 simulated students: median about 54 days to collect everything)
- **Independent reviews** (subagents that didn't write the content), 4 passes:
  - Review 1 (bank): 6 errors and 14 warnings, all fixed.
  - Review 2 (lessons): 4 errors and 17 warnings; all errors and most warnings fixed.
  - Review 3 (whole bank and all mocks re-checked by script, 182 by hand): no wrong answers; 1 ambiguous statement and 12 warnings, the ambiguity and most warnings fixed.
  - Review 4 (new grand-stave chords and piano extracts, ~1,400 questions by script): no wrong answers, no ambiguities; 6 style warnings, all fixed.
- **Bugs I caught myself:**
  - bass notes losing their octave (`.map(toString)`)
  - wide staves clipped inside answer cards
  - a stray "null" on two screens
  - an offline test that wasn't really waiting
  - the app reloading itself on the first install

## Not done, or uncertain (please check)
- **Rests in irregular time signatures** (5/4, 7/8 …) are taught only briefly and never quizzed, because the conventions vary. Rests questions in compound time only leave whole dotted beats to fill, for the same reason.
- **Septuplets** are not included: the 2020 spec only names quintuplets and sextuplets at Grade 5.
- **Term meanings** follow ABRSM style, but only about 15 are confirmed word for word from ABRSM model answers (the official list gives terms without meanings). The term list itself is the official 2020 one.
- **Grade 2 signs:** ABRSM's spec lists 8 and another ABRSM document says 9; the ninth is unidentified.
- **Compound intervals** are named "compound major 3rd" by default (the lessons also teach "major 10th"); I'm not sure which style ABRSM's online multiple choice uses.
- **Chord questions** now use both close single-stave chords and four-part grand-stave chords (added on Monday); worth a teacher's glance at the voicing style.
- **Cadence chord questions** accept every valid chord pair, rather than one fixed answer.
- **Not finished from review 2:** a worked music-in-context example on the extract shown in that lesson, and chords with doubled notes.

## Top 5 things to improve next
Done on Monday from the original list: four-part grand-stave chords and cadences, piano-style context extracts, 20 fixed mocks, a bigger tricky set, and a phone layout pass. Next:
1. Have a human teacher check the term meanings and the rest-grouping conventions, then add irregular-time rest questions if they're confirmed.
2. Longer piano extracts (8 bars, with a mid-phrase imperfect cadence) and questions that mark two notes across the hands.
3. "Choose the chords" cadence questions written on a grand stave with the melody in the top part.
4. A second audio voice (e.g. strings) for listening practice, so cadences sound less piano-only.
5. Another fresh review pass over a random 150-question sample of the whole bank.
- 07:20 Fixed mocks increased from 10 to 15 (all pass the marks, validation and engraving checks).
- Music-in-context extract melodies capped to about a 10th above the tonic (worked example revealed an F6 in treble); added a worked context example computed from the lesson's extract.
- 07:45 Review pass 3 (bank re-check, fresh subagent, scripts over all 2,412 questions + 945 mock questions, 182 by hand): no wrong answers; 1 ambiguity (simple time vs 5/4), 12 warnings, 11 nits. Ambiguity and most warnings fixed (docs/review-3.md); a wording-guard unit test now covers them. Bank: 2,406 questions.
- 07:50 After review 3: signs now quizzed (hairpins, slur, tie, metronome mark, repeats, semi-staccato, 8va/8va bassa, multi-bar rests, voltas, C and ¢); more irregular-time questions (r-time weighted 1.3, 7/4 in bar-line questions); context true/false statements now all have computed or paired true/false versions; cadence melodies never leap more than a 5th. Bank 2,432.
- 11:15 Grand-stave (treble + bass) four-part chords: voiceFourPart in the brain (bass G2–B3, upper notes in close position above middle C, 1st inversion never doubles the 3rd, smooth voice leading between cadence chords), renderGrand in the renderer, engraving check reads each stave with its own clef. Used in 70% of cadence-naming questions and about a quarter of chord-naming questions; a new 'cadence-name' validation re-identifies both chords from the drawn notes.
- 11:35 Inversions and cadences lessons now also show four-part grand-stave chords (with Hear it). Fixed the brace being clipped when a grand stave is drawn off-screen (staves now start further right).
- 11:55 Piano music-in-context extracts: 4 bars, right-hand tune (D4–G5, first note of each bar in the chord, leading note into the final tonic) over left-hand block chords (I–x–V/IV–I, any position). Questions: key, left-hand chord with position, cadence (C/G/D/F major only), interval between the hands (no 15ths), tempo term, time, ornament, note count, true/false. Every third bank set and ~40% of mock section 7s are piano. Engraving check fixed to pair notes by id on grand staves. Context lesson has a worked piano example. Bank 2,517.
- 12:10 Tricky set 348 → 538: new 'place the tonic of this key signature' (any octave, alto/tenor mostly) and 'write the note marked X transposed, on a stave with the new key signature' questions, plus an extra tricky-only pass in the bank builder. Bank 2,707.
- 12:25 Phone layout: no sideways scrolling on any screen at 390px (grid columns use minmax(0,1fr) and min(Npx,100%)), lesson tables wrap, and the drag-a-note stave doubles in size on small/touch screens (tap position uses the SVG screen matrix, so scaling is safe).
- 12:45 Review 4 (fresh subagent; 140 grand-stave chord questions, 150 piano sets): 0 errors, 0 ambiguities, 6 style warnings, all fixed (parallels, leaps, augmented 2nds, IIa in minor, clashing long notes, interval question coverage) plus 3 nits; style guard test added (docs/review-4.md).
- 12:55 Fixed mocks 15 → 20 (all pass marks, validation and engraving checks). Morning summary updated with Monday's work.

## Feedback round (student feedback, started 18:51 UTC 19 Oct)
1) girl avatar, brown hair default, many more hairstyles/accessories; 2) easier coins; 3) easier beginner-friendly questions + 3-level optional hints; 4) larger question text/options on desktop; 5) replace stickers with cute kawaii food/sweets collectables.
- 18:56 Feedback 1 done: avatar redrawn as a kawaii girl (brown long hair by default), 18 hairstyles, 15 hair colours (6 natural free), new 'Hair bits' slot (bows, clips, headband…), 14 outfits (dresses, tutu, pinafore…), 8 faces with lashes, 10 accessories, 11 headwear (bunny/cat ears, tiara…), 12 backgrounds. Fixed a bug where all avatars on a page shared the first one's gradient (shop thumbnails showed the wrong background).
- 18:58 Feedback 2 done: coins roughly doubled (correct 8/10/12, lessons 60+25, mocks 100+band up to 200, streak 20/day, daily challenge 80+40, mistakes 12), +2 'good try' coins for a first wrong attempt; prices 0.55 scale; simulated student now completes everything in ~31 days (was ~54) with ~10 purchases on day 1. Economy test bounds updated (median 26–38 days).
- 19:04 Feedback 3 done: Beginner/Standard/Exam level (default Beginner; switch on every practice page and in Settings; mocks stay full exam mix). Beginner (difficulty 1) made genuinely easy: simple intervals with common qualities only, no double sharps in enharmonics, major-key chords, treble↔bass clef changes only, halving/doubling instead of triplets. Three optional hints on every practice/lesson question (src/questions/hints.js): 1) plain-English topic tip + definitions of tricky words (e.g. cadence), 2) rules out half the wrong options / reveals the letter, a statement or a box, 3) worked explanation with the answer masked and only two options left (cadence chords hints list which chords contain each melody note, computed from the brain). Using all 3 hints halves the coins. Tests: hints never rule out the right answer, never reveal everything, hint 3 hides the answer text (whole bank) + 2 e2e hint tests.
- 19:06 Feedback 4 done: questions larger on laptop/desktop (>860px): prompt 1.32rem, options 72px tall with 1.22rem labels, bigger letters/tick-cross/number boxes/drop-downs/accidental buttons; question music drawn ~1.55× (options ~1.35×, drag-a-note stave 1.9×), still shrinking to fit on small screens.
- 19:13 Feedback 5 done: all 60 stickers replaced with original kawaii food & sweets art (src/art/food.js; 25 common fruit/snacks, 16 rare treats, 10 epic desserts, 6 legendary sparkly/golden/galaxy, 3 mythic: Cosmic Cake, Rainbow Dragon Fruit, Golden Teapot). Die-cut white edge traced by an SVG filter, rarity glow + sparkles, silhouettes behind a padlock in the album. Blind bag redrawn in pastel with a cupcake. Save v4 migration maps each old music sticker to the food sticker in the same rarity slot (collection kept, test added). Odds, pity and economy tests unchanged and passing.
- 16:17 22 Oct, feedback 'still too difficult': lesson checks now always difficulty 1; on Beginner, multiple choice shows 3 options (answer + the 2 hardest-to-rule-out wrong ones), true/false shows 2 statements (one true, one false), and hint 1 opens automatically. Mocks unchanged (exam style). Test: beginner versions keep the right answer and hints stay valid (whole bank).
- 16:18 22 Oct: 'Easy practice mock' button on the Mock exams page: same 7 sections and 10/10/15/10/10/10/10 marks, every question generated at difficulty 1 (test added).
- 16:19 22 Oct: Beginner random mode leaves out music-in-context extracts (still in their own topic and in mocks).
- 19:40 25 Oct: 'Hear it' on every practice/lesson question with music (src/audio/from-music.js turns any stave spec — single, multi-bar, grand stave, ties, dots, tuplets — into a timed note list; new playTimeline in the synth; each playback stops the previous one). Music options get Hear A/B/C… buttons. Not in mocks (the real exam has no sound). Test: every bank stave with notes produces valid audio.
- 19:45 25 Oct: stickers 60 → 100 (40 new kawaii foods: 15 common, 11 rare, 8 epic, 4 legendary incl. Rainbow Cake/Crystal Candy, 2 mythic: Unicorn Cake, Galaxy Boba); cuter faces (bigger eyes with two sparkles, rounder blush, softer plum outline). '3 for 2' bag deal (3 bags for 120 coins, three stickers revealed side by side; e2e test). Rewards wallet chip now updates live. Economy sim buys the deal; ~35 days to collect everything.
- 19:48 25 Oct: avatar 18 → 30 hairstyles (12 new long-ish ones: curtain bangs, layers, side-swept, long bob, waves with fringe, low/side ponytail, side locks, mini buns, princess curls, braided crown, mermaid waves) + a soft hair shine; new 'Eye colour' slot (6 natural free + amber/teal/violet/pink/gold sparkle) with coloured irises; new 'Pet friend' slot (kitten, bunny, chick, puppy, hamster, panda, baby unicorn). Prices ×0.48; economy ~37 days for everything (test 28–44).
- 19:50 25 Oct: promo codes (src/state/promos.js; codes stored only as FNV hashes, once per save, case-insensitive). One code: 100 coins + 100 notes. 'Have a promo code?' box on every Rewards tab and in Settings; page redraws after redeeming. Unit + e2e tests.
- 25 Oct: pets moved out of the avatar into their own Rewards tab ("Pet"): 7 original chibi pets (src/art/pets.js) with soft 3D shading (radial gradients, gloss, contact shadow); a pet room, naming, adopt/choose/hide. src/ui/pet-widget.js makes the pet wander, sit and blink, play with a ball, and nap (Zzz) inside the room and the avatar frames (home + avatar shop); reduced motion keeps it still. Save v5 migration moves any pet out of the avatar. Pet art review: chick's extra mouth line under the beak removed (beak is the mouth), unicorn mane redrawn as rainbow curls behind the head + forelock, kitten stripes neatened; fixed CSS transform-box that displaced rotated parts (panda/chick).
- 25 Oct: hairstyle clean-up: middle parting no longer shows a skin spike (soft parting line instead); layers, side-swept, side locks, crown braid and princess curls redrawn; braids, side braid, side/low ponytails and pigtails now hang from BEHIND the head and ears (new 'mid' hair layer between body and head).
- 25 Oct: correct-answer chime is now a soft bell "da-ding" rising a perfect 4th (B♭5 → E♭6).
