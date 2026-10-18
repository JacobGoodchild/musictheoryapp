import { test, expect } from '@playwright/test';

// Every stave the app can show: demo set, every bank question (and its options
// and correct placed answer), every mock paper, and every lesson stave.
const GROUPS = ['', 'bank-s1', 'bank-s2', 'bank-s3', 'bank-s4', 'bank-s5', 'bank-s6', 'bank-s7', 'mocks', 'lessons'];

for (const group of GROUPS) {
  test(`engraving check: ${group || 'demo staves'}`, async ({ page }) => {
    test.setTimeout(420_000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`/dev/gallery.html?group=${group}`);
    await page.waitForFunction(() => window.galleryResults, null, { timeout: 400_000 });
    const results = await page.evaluate(() => window.galleryResults);
    const bad = results.filter((r) => r.problems.length);
    expect(errors).toEqual([]);
    if (group !== 'lessons') expect(results.length).toBeGreaterThan(20);
    expect(bad, JSON.stringify(bad.slice(0, 8), null, 1)).toEqual([]);
  });
}
