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
- [ ] 2. Music brain + exhaustive tests + tonal cross-check
- [ ] 3. Notation wrapper, position test, dev gallery
- [ ] 4. Question engine (all interaction types)
- [ ] 5. Generators + checked bank (sections 1→7) with reviews
- [ ] 6. Practice: by topic, random, mistakes
- [ ] 7. Mock exams (+8 fixed)
- [ ] 8. Learn: lessons + review pass
- [ ] 9. Memorise
- [ ] 10. Audio
- [ ] 11. Rewards
- [ ] 12. Settings, export/import, migration, PWA
- [ ] 13. Polish + screenshots
- [ ] 14. Backlog

## Decisions (one line each)
- 2026-10-18 19:00 UTC: Work on branch `claude/elegant-davinci-qdhagy` (session branch) and fast-forward `main` to it after every green commit, as the brief allows.
- VexFlow 5.0.0, `vexflow-bravura.js` UMD build vendored: it embeds Bravura + Academico as data: URLs, so no CDN fetch. Never call `VexFlow.loadFonts()` (that fetches from jsdelivr); instead await `document.fonts.load('30pt Bravura')` before drawing.
- Plain ES modules, hash router, lazy-loaded views; no build step.
- Node's built-in test runner (`node --test`) for unit tests; Playwright 1.56.1 (matches the preinstalled Chromium) for e2e.
- Strict Content-Security-Policy meta tag (script-src 'self', connect-src 'self') to guarantee no runtime network calls.
- Save is versioned (v3 now) with a migration chain from v1; all storage access in try/catch.
