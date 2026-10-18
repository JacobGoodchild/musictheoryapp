import { test, expect } from '@playwright/test';

test('every stave in the catalogue engraves correctly (noteheads, accidentals, key signatures, clefs)', async ({ page }) => {
  test.setTimeout(240_000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/dev/gallery.html');
  await page.waitForFunction(() => window.galleryResults, null, { timeout: 200_000 });
  const results = await page.evaluate(() => window.galleryResults);
  const bad = results.filter((r) => r.problems.length);
  expect(errors).toEqual([]);
  expect(results.length).toBeGreaterThan(50);
  expect(bad, JSON.stringify(bad.slice(0, 10), null, 1)).toEqual([]);
});
