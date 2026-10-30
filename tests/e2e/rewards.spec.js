import { test, expect } from '@playwright/test';
import { withProfile } from './helpers.js';

test('buy an avatar item, open a blind bag, see the sticker in the album', async ({ page }) => {
  await withProfile(page, { coins: 500 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/index.html#/rewards/avatar');
  await page.locator('.slot-tabs button', { hasText: 'Headwear' }).click();
  await page.locator('.shop-item', { hasText: 'Pompom beanie' }).locator('button.primary').click();
  await page.locator('.modal button', { hasText: 'Buy it' }).click();
  await expect(page.locator('.chip.coin-chip').first()).not.toContainText('500');
  await page.goto('/index.html#/rewards/bags');
  await expect(page.locator('.odds-list')).toContainText('54.7%');
  await expect(page.locator('.odds-list')).toContainText('Ultra Mythic');
  await expect(page.locator('.odds-list')).toContainText('1%');
  await page.locator('button', { hasText: 'Open a bag' }).click();
  await expect(page.locator('.reveal h2')).toBeVisible({ timeout: 5000 });
  const name = await page.locator('.reveal h2').innerText();
  await page.goto('/index.html#/rewards/album');
  await expect(page.locator('.album-stats h3')).toContainText(`1 / ${await page.evaluate(async () => (await import('/src/state/stickers.js')).STICKERS.length)}`);
  const set = await page.evaluate(async (n) => (await import('/src/state/stickers.js')).STICKERS.find((x) => x.name === n).set, name);
  await page.locator(`[data-set="${set}"]`).click();
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

test('every sticker has its own drawing, and it draws inside the sticker', async ({ page }) => {
  await page.goto('/dev/gallery.html?group=none');
  const problems = await page.evaluate(async () => {
    const { STICKERS } = await import('/src/state/stickers.js');
    const { FOOD } = await import('/src/art/food.js');
    const { COLLECT } = await import('/src/art/collect.js');
    const { stickerSVG } = await import('/src/art/stickers.js');
    const out = [];
    const seen = new Set();
    for (const s of STICKERS) {
      const fn = FOOD[s.art] || COLLECT[s.art];
      if (!fn) { out.push(`${s.id}: no drawing`); continue; }
      const art = fn();
      if (seen.has(art)) out.push(`${s.id}: same drawing as another sticker`);
      seen.add(art);
      const host = document.createElement('div');
      host.innerHTML = stickerSVG(s, { size: 120 });
      document.body.append(host);
      const g = host.querySelector('svg > g');
      const b = g.getBBox();
      if (Math.max(b.width, b.height) < 50 || Math.min(b.width, b.height) < 15) out.push(`${s.id}: drawing too small (${b.width}x${b.height})`);
      if (b.x < -2 || b.y < -2 || b.x + b.width > 122 || b.y + b.height > 122) out.push(`${s.id}: drawing runs off the sticker`);
      if (/NaN|undefined/.test(host.innerHTML)) out.push(`${s.id}: bad SVG`);
      host.remove();
    }
    return out;
  });
  expect(problems).toEqual([]);
});

test('3 for 2: three bags for the price of two', async ({ page }) => {
  await withProfile(page, { coins: 130 });
  await page.goto('/index.html#/rewards/bags');
  await page.click('[data-action=bundle]');
  await expect(page.locator('.reveal')).toHaveCount(3, { timeout: 5000 });
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('g5theory.save')).coins);
  expect(before).toBe(130 + 20 - 120); // starting coins + first-visit streak bonus - the 3-for-2 price
  await page.goto('/index.html#/rewards/album');
  await expect(page.locator('.album-stats')).toContainText('3 bags opened');
});

test('pet house: adopt a pet, throw the ball by dragging, the pet chases and fetches it', async ({ page }) => {
  await withProfile(page, { coins: 300 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/index.html#/rewards/pet');
  await page.locator('.pet-card', { hasText: 'Kitten' }).locator('[data-action=pet-buy]').click();
  await page.locator('.modal button', { hasText: 'Adopt' }).click();
  const house = page.locator('svg.house-svg');
  await expect(house).toBeVisible();
  await expect(page.locator('.modal')).toHaveCount(0);
  await page.waitForTimeout(300);
  await expect(house.locator('.house-pet')).toHaveCount(1);
  await expect(house.locator('.house-girl')).toHaveCount(1);
  // Grab the ball and fling it.
  await house.locator('[data-toy="toy-ball"]').scrollIntoViewIfNeeded();
  const box = await house.locator('[data-toy="toy-ball"]').boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  const startX = Number(await house.getAttribute('data-ball-x'));
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(x + i * 25, y - i * 18); await page.waitForTimeout(16); }
  await page.mouse.up();
  await expect(house).toHaveAttribute('data-throws', '1');
  await expect(house).toHaveAttribute('data-pet-state', /chase|fetch/);
  await expect.poll(async () => Math.abs(Number(await house.getAttribute('data-ball-x')) - startX), { timeout: 4000 }).toBeGreaterThan(40);
  // The pet picks it up and brings it back.
  await expect(house).toHaveAttribute('data-last-event', /pickup|drop/, { timeout: 15000 });
  // A name for this pet.
  await page.locator('[data-action=pets]').click();
  await page.locator('.pet-card', { hasText: 'Kitten' }).locator('.pet-name-input').fill('Mochi');
  await page.locator('.pet-card', { hasText: 'Kitten' }).locator('button', { hasText: 'Save' }).click();
  await expect(page.locator('.house-head h2')).toHaveText('Mochi');
  await page.goto('/index.html#/home');
  await expect(page.locator('.home-avatar .home-pet svg')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('supermarket: fill the trolley, pay at the till, then feed the pet at home', async ({ page }) => {
  await withProfile(page, { coins: 100, pet: { owned: ['pet-hamster'], active: 'pet-hamster' } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/index.html#/rewards/market');
  await page.locator('.market-item[data-item="apple"]').click();
  await page.locator('[data-aisle="pets"]').click();
  await page.locator('.market-item[data-item="pf-seeds"]').click();
  await page.locator('.market-item[data-item="pf-seeds"]').click();
  await page.locator('[data-aisle="toys"]').click();
  await page.locator('.market-item[data-item="toy-duck"]').click();
  await expect(page.locator('.market-item[data-item="toy-duck"]')).toBeDisabled();
  await expect(page.locator('.receipt-total')).toContainText('12');
  await page.locator('[data-action="pay"]').click();
  await expect(page.locator('[data-action="go-home"]')).toBeVisible({ timeout: 15000 });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('g5theory.save')));
  expect(saved.pet.inventory).toEqual({ apple: 1, 'pf-seeds': 2 });
  expect(saved.pet.toys).toEqual(['toy-duck']);
  expect(saved.coins).toBe(100 + 20 - 12); // + first-visit streak bonus
  await page.locator('[data-action="go-home"]').click();
  await expect(page.locator('svg.house-svg [data-toy="toy-duck"]')).toHaveCount(1);
  await page.locator('.house-bar [data-action="feed"]').click();
  await page.locator('[data-action="feed"][data-item="pf-seeds"]').click();
  await expect(page.locator('[data-action="feed"][data-item="pf-seeds"]')).toContainText('×1');
  await expect(page.locator('svg.house-svg')).toHaveAttribute('data-last-event', 'ate', { timeout: 15000 });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('g5theory.save')).pet.needs['pet-hamster']?.hunger || 0)).toBeGreaterThan(70);
  expect(errors).toEqual([]);
});

test('house: several pets at once, rooms, reading a book and eating a treat yourself', async ({ page }) => {
  await withProfile(page, { coins: 50, pet: { owned: ['pet-kitten', 'pet-puppy'], active: 'pet-kitten' } });
  await page.addInitScript(() => { const s = JSON.parse(localStorage.getItem('g5theory.save')); if (s.version === 3) { s.version = 6; s.pet = { owned: ['pet-kitten', 'pet-puppy'], active: 'pet-kitten', names: {}, toys: ['book-percy', 'my-teddy'], inventory: { cupcake: 1 }, needs: {} }; localStorage.setItem('g5theory.save', JSON.stringify(s)); } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/index.html#/rewards/pet');
  await expect(page.locator('svg.house-svg .house-pet')).toHaveCount(1);
  await page.locator('[data-action=pets]').click();
  await page.locator('.pet-card', { hasText: 'Puppy' }).locator('[data-action=pet-home]').click();
  await expect(page.locator('svg.house-svg .house-pet')).toHaveCount(2);
  // Everyone goes to bed, not just one pet.
  await page.locator('[data-action=bed]').click();
  await expect(page.locator('svg.house-svg')).toHaveAttribute('data-pet-states', 'sleep,sleep', { timeout: 15000 });
  await page.locator('[data-room=bedroom]').click();
  await expect(page.locator('svg.house-svg [data-thing=bookshelf]')).toHaveCount(1);
  await page.locator('.house-bar [data-action=feed]').click();
  await page.locator('[data-action=read]').click();
  await expect(page.locator('svg.house-svg')).toHaveAttribute('data-girl-state', 'read', { timeout: 15000 });
  await page.locator('[data-who=me]').click();
  await page.locator('[data-action=feed][data-item=cupcake]').click();
  await expect(page.locator('svg.house-svg')).toHaveAttribute('data-girl-state', 'eat');
  await page.locator('[data-room=kitchen]').click();
  await expect(page.locator('svg.house-svg [data-thing=fridge]')).toHaveCount(1);
  expect(errors).toEqual([]);
});
