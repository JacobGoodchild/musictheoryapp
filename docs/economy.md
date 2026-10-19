# Reward economy

The goal is a reward layer that feels generous day to day but takes roughly
**6–8 weeks of regular study** to complete (all avatar items and all stickers).
All numbers live in `src/state/rewards.js`, `src/state/stickers.js` and
`src/art/avatar.js`, and the pacing is checked by `tests/unit/economy.test.js`
using the simulation in `src/state/economy-sim.js`.

## Earning coins

| Activity | Coins |
|---|---|
| Correct answer (easy / medium / hard) | 3 / 4 / 5 |
| Same question answered correctly again | half each time; nothing after the 3rd repeat |
| Lesson completed (first time) | 30 |
| Lesson check all correct (first time) | +10 |
| Mock paper finished | 40 + band bonus (Pass 30, Merit 60, Distinction 100) |
| Mock personal best | +50 |
| Daily streak bonus (first visit each day) | 10 × streak length, capped at 70 |
| Daily challenge | 40 (+20 for 5/5) |
| Clearing a question from Review mistakes | 5 |
| Flashcard you knew (due cards only) | 1 |
| Beat the clock / matching pairs | up to 15 / 5 |

No coins in a mock until it is finished, so a mock cannot be farmed.

## Spending

- **Avatar shop:** 45 items (plus free starters, including every skin tone),
  20–295 coins each, 4,155 coins in total.
- **Blind bag:** 60 coins. One sticker per bag.

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

Six study days a week, about 35 questions a session at 70% correct, a lesson
most days until all 33 are done, the daily challenge, a few flashcards, and a
mock every 5 days (about 10 mocks in 7 weeks). Spending alternates between the
cheapest avatar item and a bag, and uses notes for swaps whenever possible.

Over 30 simulated students (different random seeds):

- Everything is collected in **47–64 days, median about 54 days (~7.7 weeks)**.
- The first purchase happens in the first session.
- After one week most of the avatar shop and most stickers are still to win.
- On average there is at least one purchase every study session.
