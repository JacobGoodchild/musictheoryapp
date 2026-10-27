import test from 'node:test';
import assert from 'node:assert/strict';
import { migrate, freshSave, SAVE_VERSION, importSave, exportSave, cleanName, loadSave, writeSave } from '../../src/state/save.js';

test('a v1 save migrates without losing progress', () => {
  const v1 = { version: 1, profile: { name: 'Alex' }, wallet: { coins: 42 }, lessons: ['rhythm-1', 'pitch-2'] };
  const s = migrate(v1);
  assert.equal(s.version, SAVE_VERSION);
  assert.equal(s.coins, 42);
  assert.equal(s.profile.name, 'Alex');
  assert.deepEqual(Object.keys(s.lessons).sort(), ['pitch-2', 'rhythm-1']);
  assert.ok(s.stickers && s.settings && s.avatar);
});

test('a v2 save gains sticker and daily fields', () => {
  const s = migrate({ version: 2, coins: 7, lessons: { a: { done: true } } });
  assert.equal(s.coins, 7);
  assert.equal(s.dupeNotes, 0);
  assert.ok(s.stickers.owned);
  assert.equal(s.daily.done, false);
});

test('fresh save is current version and round-trips export/import', () => {
  const s = freshSave();
  s.coins = 99; s.profile.name = 'Kim';
  const back = importSave(exportSave(s));
  assert.equal(back.coins, 99);
  assert.equal(back.profile.name, 'Kim');
});

test('import rejects junk', () => {
  assert.throws(() => importSave('{"hello":1}'));
  assert.throws(() => importSave('not json'));
});

test('names are cleaned and length limited', () => {
  assert.equal(cleanName('  <script>x</script>  '), 'scriptx/script');
  assert.equal(cleanName('a'.repeat(50)).length, 24);
});

test('storage failures never throw', () => {
  const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  assert.equal(loadSave(bad).version, SAVE_VERSION);
  assert.equal(writeSave(freshSave(), bad), false);
});

test('a v3 save keeps its sticker collection when the stickers became food', () => {
  const s = migrate({ version: 3, coins: 5, stickers: { owned: { crotchet: 2, 'alto-clef': 1, 'tenor-clef': 1, quaver: 1 }, bagsOpened: 5, sinceEpic: 2, seed: 9 } });
  assert.equal(s.version, SAVE_VERSION);
  assert.deepEqual(s.stickers.owned, { strawberry: 2, 'golden-apple': 1, 'cosmic-cake': 1, apple: 1 });
  assert.equal(s.stickers.bagsOpened, 5);
});

test('a v4 save moves pets out of the avatar into their own section', () => {
  const s = migrate({ version: 4, avatar: { owned: ['pet-kitten', 'hair-bob'], equipped: { pet: 'pet-kitten', hair: 'hair-bob' } } });
  assert.deepEqual(s.pet.owned, ['pet-kitten']);
  assert.equal(s.pet.active, 'pet-kitten');
  assert.deepEqual(s.avatar.owned, [], 'the bob was removed in v7');
  assert.equal(s.avatar.equipped.hair, 'hair-long');
  assert.equal(s.avatar.equipped.pet, undefined);
  assert.deepEqual(s.pet.home, ['pet-kitten']);
});

test('v7 refunds removed hairstyles and keeps the rest', () => {
  const s = migrate({ version: 6, coins: 10, avatar: { owned: ['hair-braids', 'hair-mermaid', 'hair-crownbraid'], equipped: { hair: 'hair-braids' } }, pet: { owned: ['pet-puppy'], active: 'pet-puppy' } });
  assert.equal(s.coins, 10 + 35 + 55);
  assert.deepEqual(s.avatar.owned, ['hair-mermaid']);
  assert.equal(s.avatar.equipped.hair, 'hair-long');
  assert.deepEqual(s.pet.home, ['pet-puppy']);
});
