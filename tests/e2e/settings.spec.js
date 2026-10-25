import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { withProfile } from './helpers.js';

test('export a save file, reset, then import it back', async ({ page }, info) => {
  await withProfile(page, { coins: 321, lessons: { 'rhythm-values': { done: true, at: 1 } } });
  await page.goto('/index.html#/settings');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#export-btn')]);
  const file = info.outputPath('save.json');
  await dl.saveAs(file);
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(saved.app).toBe('grade5-theory');
  const coins = saved.save.coins; // 321 plus today's streak bonus
  expect(coins).toBeGreaterThanOrEqual(321);
  // Reset (two confirmations)
  await page.click('#reset-btn');
  await page.locator('.modal button', { hasText: 'Yes, reset' }).click();
  await page.locator('.modal button', { hasText: 'Delete everything' }).click();
  await expect(page.locator('#profile-name')).toBeVisible();
  // Import
  await page.goto('/index.html#/settings');
  await page.setInputFiles('#import-file', file);
  await page.locator('.modal button', { hasText: 'Load save' }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('g5theory.save')).coins)).toBe(coins);
  await page.goto('/index.html#/learn');
  await expect(page.locator('.lesson-card.done')).toHaveCount(1);
});

test('an old v1 save in the browser is migrated on load', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('g5theory.save', JSON.stringify({ version: 1, profile: { name: 'Old' }, wallet: { coins: 77 }, lessons: ['pitch-alto'] })));
  await page.goto('/index.html#/home');
  await expect(page.locator('h1')).toContainText('Old');
  await expect(page.locator('#sidebar-foot')).toContainText(/77|8\d|9\d|1\d\d/); // 77 + streak bonus
  await page.goto('/index.html#/learn');
  await expect(page.locator('.lesson-card.done')).toHaveCount(1);
});

test('dark mode setting applies', async ({ page }) => {
  await withProfile(page);
  await page.goto('/index.html#/settings');
  await page.selectOption('#set-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('installable and works offline after the first visit', async ({ browser }) => {
  test.setTimeout(90_000);
  const ctx = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  await page.addInitScript(() => { if (!localStorage.getItem('g5theory.save')) localStorage.setItem('g5theory.save', JSON.stringify({ version: 3, profile: { name: 'Off' } })); });
  await page.goto('/index.html#/home');
  // Wait until the worker is fully activated and every file is in the cache.
  // (expect.poll awaits the async check; waitForFunction would not.)
  await expect.poll(() => page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    if (!r || !r.active || r.active.state !== 'activated') return 0;
    const keys = await caches.keys();
    if (!keys.length) return 0;
    return (await (await caches.open(keys[0])).keys()).length;
  }), { timeout: 60_000, intervals: [500] }).toBeGreaterThan(60);
  // Reload once so the page is loaded through the service worker, as on any later visit.
  await page.reload();
  await expect(page.locator('main .view')).toBeVisible();
  const manifest = await page.evaluate(async () => (await fetch('manifest.webmanifest')).json());
  expect(manifest.icons.some((i) => i.sizes === '512x512')).toBe(true);
  await ctx.setOffline(true);
  await page.goto('/index.html#/learn/pitch-tenor');
  await expect(page.locator('.lesson-head h1')).toHaveText('The tenor clef');
  await page.goto('/index.html#/practice/k-signatures');
  await expect(page.locator('.question')).toBeVisible();
  await ctx.close();
});

test('promo code box on the Rewards page', async ({ page }) => {
  await withProfile(page, { coins: 0 });
  await page.goto('/index.html#/rewards/avatar');
  await page.fill('.promo-input', 'snerd');
  await page.click('[data-action=redeem]');
  await expect(page.locator('.promo-msg')).toContainText('Code accepted');
  await page.waitForTimeout(1200); // the page redraws itself after a code
  await page.fill('.promo-input', 'SNERD');
  await page.click('[data-action=redeem]');
  await expect(page.locator('.promo-msg')).toContainText('already used');
});
