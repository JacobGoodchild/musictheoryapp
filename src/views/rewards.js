import { h, clear, svgFromString, toast, confirmDialog } from '../dom.js';
import { getState, update } from '../state/store.js';
import { icon, coinIcon, noteIcon } from '../ui/icons.js';
import { avatarSVG, ITEMS, SLOTS, DEFAULT_EQUIPPED, itemById, FREE_ITEMS } from '../art/avatar.js';
import { stickerSVG } from '../art/stickers.js';
import { STICKERS, RARITIES, PITY, openBag, collectionStats, rarityById } from '../state/stickers.js';
import { ECONOMY, spendCoins } from '../state/rewards.js';
import { sfx } from '../audio/synth.js';
import { confetti } from '../ui/confetti.js';

const TABS = [
  { id: 'avatar', label: 'Avatar & shop', icon: 'star' },
  { id: 'bags', label: 'Blind bags', icon: 'bag' },
  { id: 'album', label: 'Sticker album', icon: 'memorise' },
];

const owns = (s, id) => FREE_ITEMS.includes(id) || s.avatar.owned.includes(id);

export default async function rewards({ tab = 'avatar' } = {}) {
  const s = getState();
  const wallet = h('div', { class: 'row' }, h('span', { class: 'chip coin-chip big-chip' }, coinIcon(), `${s.coins} coins`), h('span', { class: 'chip big-chip', title: 'Notes come from duplicate stickers' }, noteIcon(), `${s.dupeNotes} notes`));
  const root = h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Rewards'), h('h1', {}, 'Rewards'), h('p', {}, 'Earn coins by learning, then spend them on your avatar and sticker bags.')), wallet),
    h('div', { class: 'tabs', role: 'tablist' }, TABS.map((t) => h('a', { class: `tab${t.id === tab ? ' active' : ''}`, role: 'tab', 'aria-selected': String(t.id === tab), href: `#/rewards/${t.id}` }, icon(t.icon, 'coin-icon'), t.label))));
  if (tab === 'bags') root.append(bagsTab());
  else if (tab === 'album') root.append(albumTab());
  else root.append(avatarTab());
  return root;
}

function refresh() { window.dispatchEvent(new HashChangeEvent('hashchange')); }

// ---------------------------------------------------------------- Avatar
function avatarTab() {
  const s = getState();
  let slot = 'outfit';
  const preview = h('div', { class: 'avatar-preview' });
  let trying = null;
  const shop = h('div', {});
  const drawPreview = () => {
    clear(preview);
    const eq = { ...DEFAULT_EQUIPPED, ...getState().avatar.equipped, ...(trying ? { [trying.slot]: trying.id } : {}) };
    preview.append(svgFromString(avatarSVG(eq, { size: 240 })));
    if (trying && !owns(getState(), trying.id)) preview.append(h('div', { class: 'chip accent' }, `Trying on: ${trying.name}`));
  };
  const drawShop = () => {
    clear(shop);
    const st = getState();
    shop.append(h('div', { class: 'slot-tabs row' }, SLOTS.map((sl) => h('button', { class: `btn small${sl.id === slot ? ' primary' : ''}`, onclick: () => { slot = sl.id; trying = null; drawShop(); drawPreview(); } }, sl.name))));
    const items = ITEMS.filter((i) => i.slot === slot);
    shop.append(h('div', { class: 'shop-grid' }, items.map((it) => {
      const owned = owns(st, it.id);
      const equipped = ({ ...DEFAULT_EQUIPPED, ...st.avatar.equipped })[it.slot] === it.id;
      const eq = { ...DEFAULT_EQUIPPED, ...st.avatar.equipped, [it.slot]: it.id };
      const card = h('div', { class: `shop-item card${equipped ? ' equipped' : ''}` },
        h('button', { class: 'shop-thumb', 'aria-label': `Try on ${it.name}`, onmouseenter: () => { trying = it; drawPreview(); }, onfocus: () => { trying = it; drawPreview(); }, onclick: () => { trying = it; drawPreview(); } }, svgFromString(avatarSVG(eq, { size: 96, label: it.name }))),
        h('div', { class: 'shop-name' }, it.name),
        equipped ? h('span', { class: 'chip good' }, icon('check', 'coin-icon'), 'Wearing')
          : owned ? h('button', { class: 'btn small', onclick: () => { update((x) => { x.avatar.equipped[it.slot] = it.id; }); trying = null; drawShop(); drawPreview(); } }, 'Wear')
            : h('button', { class: 'btn small primary', disabled: st.coins < it.price, onclick: () => buy(it) }, coinIcon(), String(it.price)));
      return card;
    })));
  };
  const buy = async (it) => {
    const ok = await confirmDialog(`Buy ${it.name}?`, `This costs ${it.price} coins. You have ${getState().coins}.`, { ok: 'Buy it' });
    if (!ok) return;
    let done = false;
    update((x) => { if (spendCoins(x, it.price)) { x.avatar.owned.push(it.id); x.avatar.equipped[it.slot] = it.id; done = true; } });
    if (done) { sfx('reveal'); toast(`New: ${it.name}!`, { icon: icon('star', 'coin-icon') }); refresh(); }
  };
  drawPreview(); drawShop();
  const ownedCount = ITEMS.filter((i) => i.price > 0 && s.avatar.owned.includes(i.id)).length;
  const total = ITEMS.filter((i) => i.price > 0).length;
  return h('div', { class: 'avatar-layout' },
    h('div', { class: 'card avatar-card' }, preview, h('p', { class: 'small muted' }, `${ownedCount} of ${total} items unlocked`), h('div', { class: 'progress' }, h('span', { style: { width: `${(ownedCount / total) * 100}%` } }))),
    h('div', { class: 'card' }, shop));
}

// ---------------------------------------------------------------- Bags
function bagsTab() {
  const s = getState();
  const stage = h('div', { class: 'bag-stage' });
  const showBag = () => {
    clear(stage);
    const bag = h('button', { class: 'blind-bag', 'aria-label': `Open a blind bag for ${ECONOMY.bagCost} coins`, disabled: getState().coins < ECONOMY.bagCost, onclick: () => open(bag) }, svgFromString(bagArt()));
    stage.append(bag, h('button', { class: 'btn primary big', disabled: getState().coins < ECONOMY.bagCost, onclick: () => open(bag) }, 'Open a bag · ', coinIcon(), String(ECONOMY.bagCost)),
      getState().coins < ECONOMY.bagCost ? h('p', { class: 'muted small' }, `You need ${ECONOMY.bagCost - getState().coins} more coins. Answer some questions to earn them!`) : null);
  };
  const open = async (bagEl) => {
    let res = null;
    update((x) => {
      if (!spendCoins(x, ECONOMY.bagCost)) return;
      if (!x.stickers.seed) x.stickers.seed = (Date.now() % 100000) + 1;
      res = openBag(x.stickers);
      x.dupeNotes += res.notes;
    });
    if (!res) return;
    bagEl.classList.add('shaking');
    sfx('coin');
    await new Promise((r) => setTimeout(r, 900));
    bagEl.classList.add('tearing');
    await new Promise((r) => setTimeout(r, 450));
    clear(stage);
    const ra = rarityById(res.rarity);
    const card = h('div', { class: `reveal rarity-${res.rarity}`, style: { '--glow': ra.colour } },
      h('div', { class: 'reveal-glow' }), h('div', { class: 'reveal-sticker' }, svgFromString(stickerSVG(res.sticker, { size: 200 }))),
      h('div', { class: 'reveal-text' }, h('span', { class: 'rarity-pill', style: { background: ra.colour } }, ra.name), h('h2', {}, res.sticker.name),
        res.duplicate ? h('p', {}, 'Duplicate! Turned into ', h('strong', {}, `${res.notes} notes`), ' to swap for a sticker you choose.') : h('p', {}, 'New sticker for your album!')));
    stage.append(card, h('div', { class: 'row', style: { justifyContent: 'center' } }, h('button', { class: 'btn', onclick: () => refresh() }, 'Done'), h('button', { class: 'btn primary', disabled: getState().coins < ECONOMY.bagCost, onclick: () => showBag() }, 'Open another')));
    sfx('reveal');
    if (['legendary', 'mythic'].includes(res.rarity)) confetti();
  };
  showBag();
  const since = s.stickers.sinceEpic;
  return h('div', { class: 'bags-layout' },
    h('div', { class: 'card' }, stage),
    h('div', { class: 'card odds-card' },
      h('h3', {}, 'What\'s inside?'),
      h('p', { class: 'small muted' }, 'Each bag holds one music sticker. The odds are always:'),
      h('ul', { class: 'odds-list' }, RARITIES.map((r) => h('li', {}, h('span', { class: 'rarity-pill', style: { background: r.colour } }, r.name), h('strong', {}, `${r.odds}%`)))),
      h('p', { class: 'small' }, h('strong', {}, 'Lucky dip guarantee: '), `at least one Epic or better every ${PITY} bags. `, since >= PITY - 1 ? h('strong', {}, 'Your next bag is guaranteed Epic or better!') : `${PITY - since} bag${PITY - since === 1 ? '' : 's'} to go at most.`),
      h('p', { class: 'small' }, h('strong', {}, 'Duplicates '), 'turn into notes. Spend notes in the album to pick any sticker you\'re missing.')));
}

function bagArt() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240" aria-hidden="true"><defs><linearGradient id="bagg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b8bff"/><stop offset="1" stop-color="#c04fd0"/></linearGradient></defs>
  <path d="M40 40h120l10 180q-80 14-140 0z" fill="url(#bagg)"/><path d="M40 40l8-14h104l8 14z" fill="#6e6af0"/><path d="M44 40q8 8 16 0t16 0 16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#fff8" stroke-width="2"/>
  <circle cx="100" cy="125" r="38" fill="#fff" opacity=".95"/><text x="100" y="145" text-anchor="middle" font-family="Bravura" font-size="54" fill="#6e6af0"></text>
  <text x="100" y="196" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="20" fill="#fff">?</text></svg>`;
}

// ---------------------------------------------------------------- Album
function albumTab() {
  const s = getState();
  const stats = collectionStats(s.stickers.owned);
  const grid = h('div', { class: 'album-grid' });
  for (const st of STICKERS) {
    const have = s.stickers.owned[st.id] || 0;
    const ra = rarityById(st.rarity);
    const cell = h('div', { class: `album-cell${have ? '' : ' locked'}` },
      svgFromString(stickerSVG(st, { locked: !have, size: 104 })),
      h('div', { class: 'album-name' }, have ? st.name : '???'),
      h('span', { class: 'rarity-pill small', style: { background: ra.colour } }, ra.name),
      have > 1 ? h('span', { class: 'tiny muted' }, `×${have}`) : null,
      !have ? h('button', { class: 'btn small', disabled: s.dupeNotes < ra.swapCost, onclick: () => swap(st) }, noteIcon(), `${ra.swapCost}`) : null);
    grid.append(cell);
  }
  async function swap(st) {
    const ra = rarityById(st.rarity);
    const ok = await confirmDialog('Swap notes for this sticker?', `Spend ${ra.swapCost} notes on a ${ra.name} sticker (${st.name}).`, { ok: 'Swap' });
    if (!ok) return;
    update((x) => { if (x.dupeNotes >= ra.swapCost && !x.stickers.owned[st.id]) { x.dupeNotes -= ra.swapCost; x.stickers.owned[st.id] = 1; } });
    sfx('reveal'); toast(`${st.name} added to your album!`); refresh();
  }
  return h('div', {},
    h('div', { class: 'card album-stats' },
      h('div', { class: 'row between' }, h('h3', { style: { margin: 0 } }, `${stats.have} / ${stats.total} stickers`), h('span', { class: 'small muted' }, `${s.stickers.bagsOpened} bags opened`)),
      h('div', { class: 'progress', style: { margin: '10px 0' } }, h('span', { style: { width: `${(stats.have / stats.total) * 100}%` } })),
      h('div', { class: 'row' }, stats.byRarity.map((r) => h('span', { class: 'chip' }, h('span', { class: 'rarity-dot', style: { background: r.colour } }), `${r.name} ${r.have}/${r.total}`)))),
    grid);
}

void itemById;
