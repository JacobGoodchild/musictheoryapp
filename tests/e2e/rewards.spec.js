import { test, expect } from '@playwright/test';
import { withProfile } from './helpers.js';

test('buy an avatar item, open a blind bag, see the sticker in the album', async ({ page }) => {
  await withProfile(page, { coins: 500 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/index.html#/rewards/avatar');
  await page.locator('.slot-tabs button', { hasText: 'Hat' }).click();
  await page.locator('.shop-item', { hasText: 'Beanie' }).locator('button.primary').click();
  await page.locator('.modal button', { hasText: 'Buy it' }).click();
  await expect(page.locator('.chip.coin-chip').first()).not.toContainText('500');
  await page.goto('/index.html#/rewards/bags');
  await expect(page.locator('.odds-list')).toContainText('55%');
  await expect(page.locator('.odds-list')).toContainText('1%');
  await page.locator('button', { hasText: 'Open a bag' }).click();
  await expect(page.locator('.reveal h2')).toBeVisible({ timeout: 5000 });
  const name = await page.locator('.reveal h2').innerText();
  await page.goto('/index.html#/rewards/album');
  await expect(page.locator('.album-stats h3')).toContainText('1 / 60');
  await expect(page.locator('.album-cell:not(.locked)')).toContainText(name);
  expect(errors).toEqual([]);
});

test('album shows unlocked stickers (screenshot for review)', async ({ page }) => {
  await page.addInitScript(async () => {
    const owned = {};
    ['crotchet', 'treble-clef', 'flat', 'segno', 'trill', 'alto-clef', 'tenor-clef', 'rainbow-treble', 'cosmic-semibreve', 'golden-crotchet', 'time-78', 'sforzando', 'quintuplet', 'mezzo-forte'].forEach((id) => { owned[id] = 1; });
    localStorage.setItem('g5theory.save', JSON.stringify({ version: 3, profile: { name: 'T' }, stickers: { owned, bagsOpened: 14, sinceEpic: 2, seed: 3 } }));
  });
  await page.goto('/index.html#/rewards/album');
  await expect(page.locator('.album-cell:not(.locked)')).toHaveCount(14);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/album-unlocked.png', fullPage: true });
});
