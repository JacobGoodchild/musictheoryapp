import { test, expect } from '@playwright/test';
import { withProfile, answer } from './helpers.js';

test('a full mock paper can be taken through the UI and is scored correctly', async ({ page, request }) => {
  test.setTimeout(240_000);
  await withProfile(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const mocks = await (await request.get('/data/mocks.json')).json();
  const paper = mocks[0];
  const qs = paper.sections.flatMap((s) => s.questions);
  await page.goto('/index.html#/mock/paper-1');
  await page.click('[data-action=start]');
  await expect(page.locator('.timer')).toHaveText(/1:59:\d\d|2:00:00/);
  // Get every question right except a known set, so the expected score is exact.
  const wrongIdx = new Set([0, 5, 12]);
  let expected = 75;
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const host = page.locator('.mock-host');
    await expect(host.locator('.question')).toHaveAttribute('data-qid', q.id);
    const right = !wrongIdx.has(i);
    if (!right) {
      const m = q.type === 'truefalse' ? q.statements.length : q.type === 'dropdown' ? q.dropdowns.length : q.type === 'number' ? q.numbers.length : 1;
      expected -= m;
    }
    await answer(page, host, q, right);
    if (i < qs.length - 1) await page.click('[data-action=next-q]');
  }
  await page.locator('.mock-foot button', { hasText: 'Finish exam' }).click();
  await page.locator('.modal button', { hasText: 'Finish and mark' }).click();
  await expect(page.locator('.result-score .big')).toHaveText(String(expected));
  await expect(page.locator('.review-card')).toHaveCount(qs.length);
  // History shows on the mock list.
  await page.goto('/index.html#/mock');
  await expect(page.locator('.table tbody tr')).toHaveCount(1);
  await expect(page.locator('.table tbody tr')).toContainText(`${expected}/75`);
  expect(errors).toEqual([]);
});

test('an unfinished mock survives a page reload', async ({ page }) => {
  await withProfile(page);
  await page.goto('/index.html#/mock/paper-2');
  await page.click('[data-action=start]');
  await page.locator('.q-dot').nth(3).click();
  await page.reload();
  await expect(page.locator('.q-dot.current')).toHaveText('4');
  await page.goto('/index.html#/mock');
  await expect(page.locator('.resume-card')).toBeVisible();
});
