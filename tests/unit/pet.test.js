import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKET, AISLES, FAVOURITES, PETS, needsNow, changeNeeds, takeFood, foodEffect, trolleyTotal, checkout, FLOOR, isOneOff } from '../../src/state/pet.js';
import { freshSave, migrate } from '../../src/state/save.js';
import { FOOD } from '../../src/art/food.js';
import { TOYS } from '../../src/game/props.js';

test('supermarket: everything is cheap, in an aisle, and has a picture', () => {
  const ids = new Set();
  for (const m of MARKET) {
    assert.ok(!ids.has(m.id), `duplicate ${m.id}`); ids.add(m.id);
    assert.ok(m.price >= 1 && m.price <= 12, `${m.id} price ${m.price}`);
    assert.ok(AISLES.some((a) => a.id === m.aisle), m.id);
    if (m.kind === 'food') assert.ok(FOOD[m.id], `food art for ${m.id}`);
    if (m.kind === 'toy') assert.ok(TOYS[m.id], `toy art for ${m.id}`);
    if (m.kind === 'book') assert.match(m.cover, /^#[0-9a-f]{6}$/);
    if (!isOneOff(m)) assert.ok(m.hunger > 0, `${m.id} fills a tummy`);
  }
  for (const [pet, favs] of Object.entries(FAVOURITES)) {
    assert.ok(PETS.some((p) => p.id === pet));
    for (const f of favs) assert.ok(MARKET.some((m) => m.id === f), `${pet} favourite ${f}`);
  }
});

test('pets are cheap, and the most special ones are not much dearer', () => {
  for (const p of PETS) assert.ok(p.price <= 45, p.id);
  assert.ok(Math.max(...PETS.map((p) => p.price)) - Math.min(...PETS.map((p) => p.price)) <= 15);
});

test('needs fall gently while you are away and never below the floor; energy recovers', () => {
  const s = freshSave();
  const t0 = Date.UTC(2026, 0, 1);
  changeNeeds(s, 'pet-kitten', {}, t0);
  const start = s.pet.needs['pet-kitten'];
  const later = needsNow(s.pet, 'pet-kitten', t0 + 5 * 3.6e6);
  assert.ok(later.hunger < start.hunger && later.fun < start.fun);
  assert.ok(later.energy >= start.energy);
  const week = needsNow(s.pet, 'pet-kitten', t0 + 7 * 24 * 3.6e6);
  assert.equal(week.hunger, FLOOR); assert.equal(week.fun, FLOOR); assert.equal(week.energy, 100);
  const n = changeNeeds(s, 'pet-kitten', { hunger: 500, fun: -500 }, t0);
  assert.equal(n.hunger, 100); assert.equal(n.fun, 0);
});

test('checkout takes the coins and puts the shopping away; refuses if too dear', () => {
  const s = freshSave();
  s.coins = 20;
  const trolley = { apple: 2, 'pf-fish': 1, 'toy-yarn': 1 };
  assert.equal(trolleyTotal(trolley), 2 * 2 + 3 + 5);
  assert.equal(checkout(s, trolley), true);
  assert.equal(s.coins, 8);
  assert.deepEqual(s.pet.inventory, { apple: 2, 'pf-fish': 1 });
  assert.deepEqual(s.pet.toys, ['toy-yarn']);
  assert.equal(checkout(s, { 'toy-yarn': 1 }), false, 'a toy is only bought once');
  assert.equal(checkout(s, { 'birthday-cake': 2 }), false, 'not enough coins');
  assert.equal(s.coins, 8);
  assert.equal(checkout(s, {}), false);
});

test('feeding uses up food, and favourites are extra fun', () => {
  const s = freshSave();
  s.pet.inventory = { 'pf-fish': 1 };
  const it = takeFood(s, 'pf-fish');
  assert.equal(it.id, 'pf-fish');
  assert.equal(takeFood(s, 'pf-fish'), null);
  assert.deepEqual(s.pet.inventory, {});
  assert.equal(foodEffect(it, 'pet-kitten').favourite, true);
  assert.ok(foodEffect(it, 'pet-kitten').fun > foodEffect(it, 'pet-bunny').fun);
});

test('v5 saves move the pet name onto the active pet', () => {
  const s = migrate({ version: 5, pet: { owned: ['pet-kitten'], active: 'pet-kitten', name: 'Mochi<b>' } });
  assert.equal(s.version, 7);
  assert.deepEqual(s.pet.names, { 'pet-kitten': 'Mochib' });
  assert.deepEqual(s.pet.inventory, {});
  assert.deepEqual(s.pet.toys, []);
  assert.deepEqual(s.pet.owned, ['pet-kitten']);
});
