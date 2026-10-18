import { test, expect } from '@playwright/test';

const SCREENS = ['#/home', '#/learn', '#/learn/pitch-tenor', '#/learn/terms-signs-ornaments', '#/practice', '#/practice/k-signatures', '#/practice/map', '#/practice/listening', '#/mock', '#/mock/paper-3', '#/memorise', '#/memorise/circle', '#/memorise/cards:keys', '#/memorise/match', '#/memorise/clock', '#/rewards', '#/settings'];

async function withProfile(page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem('g5theory.save')) {
      localStorage.setItem('g5theory.save', JSON.stringify({ version: 3, profile: { name: 'Tester' } }));
    }
  });
}

test('first visit asks for a name', async ({ page }) => {
  await page.goto('/index.html');
  await page.fill('#profile-name', '<b>Sam</b>');
  await page.click('text=Let\'s go');
  await expect(page.locator('h1')).toContainText('Hi, bSam/b!');
});

test('no console errors and no external requests on every screen', async ({ page }) => {
  await withProfile(page);
  const errors = [];
  const external = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('request', (r) => { if (!r.url().startsWith('http://localhost:4173')) external.push(r.url()); });
  for (const s of SCREENS) {
    await page.goto('/index.html' + s);
    await expect(page.locator('main .view')).toBeVisible();
    await page.waitForTimeout(400);
    const text = await page.locator('main').innerText();
    expect(text, s).not.toMatch(/\b(null|undefined|NaN)\b|\[object/);
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
