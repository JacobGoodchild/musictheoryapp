# Reward economy

The goal is a reward layer that feels generous day to day (several treats every
session) and takes roughly **4–5 weeks of regular study** to complete (all avatar
items and all stickers). It was made easier after student feedback on 19 Oct:
coins roughly doubled, a small "good try" coin for wrong answers, and the original
6–8 week target shortened.
All numbers live in `src/state/rewards.js`, `src/state/stickers.js` and
`src/art/avatar.js`, and the pacing is checked by `tests/unit/economy.test.js`
using the simulation in `src/state/economy-sim.js`.

## Earning coins

| Activity | Coins |
|---|---|
| Correct answer (easy / medium / hard) | 8 / 10 / 12 |
| First try at a new question, even if wrong | 2 |
| Same question answered correctly again | half each time; nothing after the 3rd repeat |
| Lesson completed (first time) | 60 |
| Lesson check all correct (first time) | +25 |
| Mock paper finished | 100 + band bonus (Pass 60, Merit 120, Distinction 200) |
| Mock personal best | +80 |
| Daily streak bonus (first visit each day) | 20 × streak length, capped at 140 |
| Daily challenge | 80 (+40 for 5/5) |
| Clearing a question from Review mistakes | 12 |
| Flashcard you knew (due cards only) | 1 |
| Beat the clock / matching pairs | up to 15 / 5 |

No coins in a mock until it is finished, so a mock cannot be farmed.

## Spending

- **Avatar shop:** 78 items (plus 28 free starters, including every skin tone
  and the natural hair colours), 20–285 coins each, 6,490 coins in total.
- **Blind bag:** 60 coins. One sticker per bag. **3 for 2:** three bags for 120 coins.

## Stickers

| Rarity | Odds (shown on screen) | Stickers | Duplicate gives | Swap cost (notes) |
|---|---|---|---|---|
| Common | 55% | 25 | 15 notes | 25 |
| Rare | 27% | 16 | 25 notes | 50 |
| Epic | 12% | 10 | 50 notes | 90 |
| Legendary | 5% | 6 | 100 notes | 160 |
| Mythic | 1% | 3 | 250 notes | 280 |

**Pity rule:** if 9 bags in a row are below Epic, the 10th is guaranteed Epic or
better. The test opens 200,000 bags and checks every rarity is within 2
percentage points of the shown odds and that the pity rule never fails.

## The simulated "regular student"

Six study days a week, about 35 questions a session at 60% correct, a lesson
most days until all 33 are done, the daily challenge, a few flashcards, and a
mock every 5 days (about 10 mocks in 7 weeks). Spending alternates between the
cheapest avatar item and a bag, and uses notes for swaps whenever possible.

Over 30 simulated students (different random seeds):

- Everything is collected in **33–39 days, median about 37 days (~5 weeks)** (after the 25 Oct update: 100 stickers, 30 hairstyles, eye colours, pets, and the 3-for-2 bag deal).
- About 10 purchases happen in the very first session.
- After one week most of the avatar shop and a good number of stickers are still to win.
- On average there are several purchases every study session.
