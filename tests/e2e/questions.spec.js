import { test, expect } from '@playwright/test';

async function open(page, section, type, i = 0) {
  await page.goto(`/dev/q.html?section=${section}&type=${type}&i=${i}`);
  await page.waitForFunction(() => window.__ready);
  await page.waitForTimeout(300);
  return page.evaluate(() => window.__q);
}
const lastResult = (page) => page.evaluate(() => window.__results.at(-1));

test('multiple choice: pick the right option, press Answer, marked correct', async ({ page }) => {
  for (const [sec, i] of [[3, 0], [4, 1], [6, 2]]) {
    const q = await open(page, sec, 'mcq', i);
    await expect(page.locator('[data-action=answer]')).toBeDisabled();
    await page.locator('.q-option').nth(q.answer).click();
    await page.click('[data-action=answer]');
    expect((await lastResult(page)).r.correct).toBe(true);
    await expect(page.locator('.feedback-box.good')).toBeVisible();
  }
});

test('multiple choice: a wrong option is marked wrong and the answer shown', async ({ page }) => {
  const q = await open(page, 4, 'mcq', 3);
  await page.locator('.q-option').nth((q.answer + 1) % q.options.length).click();
  await page.click('[data-action=answer]');
  expect((await lastResult(page)).r.correct).toBe(false);
  await expect(page.locator('.q-option.right')).toHaveCount(1);
  await expect(page.locator('.feedback-box.bad')).toContainText('Answer');
});

test('true/false: all statements must be set before Answer is active', async ({ page }) => {
  const q = await open(page, 6, 'truefalse', 0);
  const rows = page.locator('.tf-row');
  for (let i = 0; i < q.statements.length; i++) {
    await expect(page.locator('[data-action=answer]')).toBeDisabled();
    await rows.nth(i).locator(`[data-tf="${q.statements[i].answer}"]`).click();
  }
  await page.click('[data-action=answer]');
  const res = await lastResult(page);
  expect(res.r.correct).toBe(true);
  expect(res.r.score).toBe(q.statements.length);
});

test('number entry: digits only, marked correctly', async ({ page }) => {
  const q = await open(page, 1, 'number', 0);
  const input = page.locator('.num-input').first();
  await input.type('a1b');
  await expect(input).toHaveValue('1');
  await input.fill('');
  await input.type(String(q.numbers[0].answer));
  await page.click('[data-action=answer]');
  expect((await lastResult(page)).r.correct).toBe(true);
});

test('drop-downs: every box must be filled; accepted chords mark correct', async ({ page }) => {
  const q = await open(page, 5, 'dropdown', 0);
  const selects = page.locator('.q-dropdowns select');
  const combo = q.acceptCombos[0];
  for (let i = 0; i < combo.length; i++) {
    await expect(page.locator('[data-action=answer]')).toBeDisabled();
    await selects.nth(i).selectOption(combo[i]);
  }
  await page.click('[data-action=answer]');
  expect((await lastResult(page)).r.correct).toBe(true);
});

async function placeNote(page, q) {
  // Work out where the answer note goes and click there on the stave.
  const target = await page.evaluate(async (q) => {
    const { parse, staffPos } = await import('/src/theory/pitch.js');
    const p = parse(q.place.accept[0]);
    return { pos: staffPos(p, q.place.clef), acc: p.acc };
  }, q);
  const accLabel = { '-2': 'double flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double sharp' }[target.acc];
  await page.click(`.acc-btn[aria-label="${accLabel}"]`);
  const pt = await page.evaluate((pos) => {
    const host = document.querySelector('.place-stave');
    const svg = host.querySelector('svg');
    const g = host.__music.geometry;
    const p = svg.createSVGPoint();
    p.x = g.noteStartX + 40; p.y = g.yForPos(pos);
    const s = p.matrixTransform(svg.getScreenCTM());
    return { x: s.x, y: s.y };
  }, target.pos);
  // Drag the notehead from the palette onto the stave.
  const chip = await page.locator('.notehead-chip').boundingBox();
  await page.mouse.move(chip.x + 10, chip.y + 10);
  await page.mouse.down();
  await page.mouse.move(pt.x, pt.y, { steps: 8 });
  await page.mouse.up();
  return target;
}

test('drag a notehead onto the stave (with accidental) and mark it', async ({ page }) => {
  for (const [sec, i] of [[2, 0], [2, 3], [3, 0], [4, 0], [4, 5]]) {
    const q = await open(page, sec, 'place', i);
    await expect(page.locator('[data-action=answer]')).toBeDisabled();
    await placeNote(page, q);
    await page.click('[data-action=answer]');
    const res = await lastResult(page);
    expect(res.r.correct, `${q.id}: placed ${JSON.stringify(res.resp)} for ${q.place.accept[0]}`).toBe(true);
  }
});

test('placed note can be adjusted with the keyboard before answering', async ({ page }) => {
  const q = await open(page, 4, 'place', 2);
  const target = await placeNote(page, q);
  await page.focus('.place-stave');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');
  await page.click('[data-action=answer]');
  const res = await lastResult(page);
  expect(res.resp.pos).toBe(target.pos);
  expect(res.r.correct).toBe(true);
});

test('hints: three levels, wrong options greyed out, the answer still works', async ({ page }) => {
  const q = await open(page, 5, 'mcq', 2);
  for (let i = 1; i <= 3; i++) {
    await page.click('[data-action=hint]');
    await expect(page.locator('.hint-card')).toHaveCount(i);
  }
  await expect(page.locator('[data-action=hint]')).toHaveCount(0);
  await expect(page.locator('.q-option:not(.eliminated)')).toHaveCount(2);
  await expect(page.locator('.q-option').nth(q.answer)).not.toHaveClass(/eliminated/);
  await page.locator('.q-option').nth(q.answer).click();
  await page.click('[data-action=answer]');
  const res = (await lastResult(page)).r;
  expect(res.correct).toBe(true);
  expect(res.hintsUsed).toBe(3);
});

test('hints: a drop-down hint fills in the first box', async ({ page }) => {
  await open(page, 5, 'dropdown', 0);
  await page.click('[data-action=hint]');
  await page.click('[data-action=hint]');
  await expect(page.locator('.q-dropdowns select').first()).not.toHaveValue('');
});
