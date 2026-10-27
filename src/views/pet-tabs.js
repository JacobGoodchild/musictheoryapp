// Rewards → Pet (the pet house) and Rewards → Supermarket.
import { h, clear, svgFromString, toast, confirmDialog } from '../dom.js';
import { getState, update, subscribe } from '../state/store.js';
import { icon, coinIcon } from '../ui/icons.js';
import { cleanName } from '../state/save.js';
import { spendCoins } from '../state/rewards.js';
import { sfx } from '../audio/synth.js';
import { confetti } from '../ui/confetti.js';
import { PETS, petById, MARKET, AISLES, marketItem, isOneOff, FAVOURITES, needsNow, changeNeeds, takeFood, foodEffect, trolleyTotal, checkout, petName } from '../state/pet.js';
import { petSVG } from '../game/pet-rig.js';
import { createHouse } from '../game/house.js';
import { createMarketScene } from '../game/market-scene.js';
import { itemSVG } from '../game/item-art.js';
import { DEFAULT_EQUIPPED } from '../art/avatar.js';

const NEEDS = [
  { key: 'hunger', label: 'Tummy', icon: 'heart' },
  { key: 'fun', label: 'Fun', icon: 'star' },
  { key: 'energy', label: 'Energy', icon: 'bolt' },
];
const reduced = () => document.documentElement.dataset.reducedMotion === 'true'
  || (document.documentElement.dataset.reducedMotion !== 'false' && matchMedia('(prefers-reduced-motion: reduce)').matches);

function needMeters(petId) {
  const wrap = h('div', { class: 'need-meters', 'aria-label': 'How your pet is feeling' });
  const rows = NEEDS.map((n) => {
    const fill = h('span', { class: 'need-fill' });
    const val = h('span', { class: 'need-val' });
    const row = h('div', { class: `need need-${n.key}` }, h('span', { class: 'need-label' }, icon(n.icon, 'coin-icon'), n.label), h('span', { class: 'need-bar', role: 'presentation' }, fill), val);
    wrap.append(row);
    return { n, fill, val, row };
  });
  const paint = () => {
    const nv = needsNow(getState().pet, petId);
    for (const r of rows) {
      const v = nv[r.n.key];
      r.fill.style.width = `${v}%`;
      r.val.textContent = `${v}%`;
      r.row.classList.toggle('low', v < 30);
    }
  };
  paint();
  const off = subscribe(() => { if (!wrap.isConnected && wrap.__seen) { off(); return; } if (wrap.isConnected) wrap.__seen = true; paint(); });
  const timer = setInterval(() => { if (!wrap.isConnected && wrap.__seen) clearInterval(timer); else paint(); }, 30000);
  return wrap;
}

// ---------------------------------------------------------------- Pet house
export function petTab() {
  const wrap = h('div', {});
  const draw = () => {
    clear(wrap);
    const st = getState();
    const p = st.pet;
    const home = (p.home || []).filter((id) => p.owned.includes(id));
    const active = home.length ? petById(home[0]) : null;
    if (active) {
      const room = p.room || 'living';
      const books = (p.toys || []).map(marketItem).filter((m) => m && m.kind === 'book');
      const house = createHouse({
        petId: active.id,
        friends: home.slice(1),
        room,
        books,
        myToys: (p.toys || []).filter((id) => marketItem(id)?.kind === 'mytoy'),
        equipped: { ...DEFAULT_EQUIPPED, ...st.avatar.equipped },
        toys: p.toys || [],
        getNeeds: () => needsNow(getState().pet, active.id),
        onNeeds: (d) => update((s) => { changeNeeds(s, active.id, d); }),
      });
      const nameEl = h('h2', { class: 'pet-name' });
      nameEl.textContent = home.length > 1 ? `${petName(p, active.id)} and friends` : petName(p, active.id);
      let eater = 'pet';
      const tray = h('div', { class: 'food-tray', role: 'group', 'aria-label': 'Food cupboard' });
      const whoBar = h('div', { class: 'row who-eats', role: 'group', 'aria-label': 'Who is eating?' });
      const drawWho = () => {
        clear(whoBar);
        for (const [k, label] of [['pet', `Feed ${petName(getState().pet, active.id)}`], ['me', 'Eat it myself']]) whoBar.append(h('button', { class: `btn small${eater === k ? ' primary' : ''}`, 'aria-pressed': String(eater === k), 'data-who': k, onclick: () => { eater = k; drawWho(); } }, label));
      };
      drawWho();
      const drawTray = () => {
        clear(tray);
        const food = Object.entries(getState().pet.inventory || {}).filter(([id, n]) => n > 0 && marketItem(id));
        if (!food.length) { tray.append(h('p', { class: 'muted small' }, 'The cupboard is empty. Pop to the supermarket for some food!')); return; }
        for (const [id, n] of food) {
          const item = marketItem(id);
          const fav = (FAVOURITES[active.id] || []).includes(id);
          tray.append(h('button', { class: 'food-btn', 'data-action': 'feed', 'data-item': id, title: item.name, 'aria-label': `${item.name}, ${n} left${fav ? `, ${petName(getState().pet, active.id)}'s favourite` : ''}`, onclick: () => {
            if (eater === 'me') {
              if (item.kind === 'petfood') { toast('That one is pet food! Choose something else for you.'); return; }
              let it = null;
              update((s) => { it = takeFood(s, id); });
              if (!it) return;
              house.girlEat(item); toast(`Yum, ${item.name.toLowerCase()}!`); drawTray();
              return;
            }
            let eff = null;
            update((s) => { const it = takeFood(s, id); if (it) eff = foodEffect(it, active.id); });
            if (!eff) return;
            house.feed(item, eff);
            if (eff.favourite) toast(`Yum! ${item.name} is a favourite!`);
            drawTray();
          } }, svgFromString(itemSVG(id, 46, item.name)), h('span', { class: 'food-count' }, `×${n}`), fav ? h('span', { class: 'fav', 'aria-hidden': 'true' }, '♥') : null));
        }
      };
      drawTray();
      const rooms = h('div', { class: 'tabs room-tabs', role: 'tablist', 'aria-label': 'Rooms' }, [['living', 'Living room'], ['kitchen', 'Kitchen'], ['bedroom', 'Bedroom']].map(([id, label]) =>
        h('button', { class: `tab${room === id ? ' active' : ''}`, role: 'tab', 'aria-selected': String(room === id), 'data-room': id, onclick: () => { update((x) => { x.pet.room = id; }); draw(); } }, label)));
      const shelf = books.length ? h('div', { class: 'stack' }, h('strong', {}, 'My books'), h('div', { class: 'row wrap' }, books.map((b) =>
        h('button', { class: 'food-btn book-btn', 'data-action': 'read', 'data-item': b.id, title: `Read ${b.name}`, 'aria-label': `Read ${b.name}`, onclick: () => { house.read(b); toast(`Reading ${b.name}…`); } }, svgFromString(itemSVG(b.id, 46, b.name)), h('span', { class: 'food-count' }, 'Read'))))) : null;
      const nameInput = h('input', { type: 'text', maxlength: 16, class: 'pet-name-input', 'aria-label': 'Pet name', placeholder: 'Give your pet a name', value: (p.names || {})[active.id] || '' });
      wrap.append(h('div', { class: 'card house-card' },
        h('div', { class: 'house-head' }, h('div', {}, nameEl, h('p', { class: 'muted small' }, 'Click the floor to walk there. Drag a toy and let go to throw it. Click a pet for a cuddle.')), needMeters(active.id)),
        rooms,
        h('div', { class: 'house-frame' }, house.el),
        h('div', { class: 'house-actions' },
          h('div', { class: 'stack' }, h('strong', {}, 'Food cupboard'), whoBar, tray),
          shelf,
          h('div', { class: 'row wrap' },
            h('button', { class: 'btn', 'data-action': 'cuddle', onclick: () => house.cuddle() }, icon('heart', 'coin-icon'), 'Cuddle'),
            h('button', { class: 'btn', 'data-action': 'bedtime', onclick: () => house.bedtime() }, icon('moon', 'coin-icon'), 'Bedtime'),
            h('a', { class: 'btn primary', href: '#/rewards/market' }, icon('trolley', 'coin-icon'), 'Go to the supermarket')))));
      wrap.append(h('form', { class: 'row pet-name-form', onsubmit: (e) => {
        e.preventDefault();
        update((x) => { x.pet.names = x.pet.names || {}; x.pet.names[active.id] = cleanName(nameInput.value).slice(0, 16); });
        draw();
        toast('Name saved');
      } }, nameInput, h('button', { class: 'btn', type: 'submit' }, 'Save name')));
    } else {
      wrap.append(h('div', { class: 'card stack' }, h('h2', {}, p.owned.length ? 'Nobody is home' : 'No pet yet'), h('p', { class: 'muted' }, p.owned.length ? 'Bring a pet home below to open your house.' : 'Adopt a pet friend below. It will live in your house with you: chasing the ball you throw, playing with its own special toy, eating the food you buy at the supermarket, and napping in its bed.')));
    }
    // Pet shop.
    const shop = h('div', { class: 'pet-shop' }, PETS.map((pt) => {
      const owned = p.owned.includes(pt.id);
      const isHome = (p.home || []).includes(pt.id);
      const btn = owned ? h('button', { class: `btn small${isHome ? ' good' : ''}`, 'data-action': 'pet-home', 'aria-pressed': String(isHome), onclick: () => {
        update((x) => { x.pet.home = x.pet.home || []; if (x.pet.home.includes(pt.id)) x.pet.home = x.pet.home.filter((i) => i !== pt.id); else x.pet.home.push(pt.id); x.pet.active = x.pet.home[0] || null; });
        draw();
      } }, isHome ? 'At home ✓ (send out to play)' : 'Bring home')
        : h('button', { class: 'btn small primary', 'data-action': 'pet-buy', disabled: st.coins < pt.price, onclick: async () => {
          const ok = await confirmDialog(`Adopt the ${pt.name}?`, `This costs ${pt.price} coins. It comes with its own ${pt.toy}.`, { ok: 'Adopt' });
          if (!ok) return;
          let done = false;
          update((x) => { if (spendCoins(x, pt.price)) { x.pet.owned.push(pt.id); x.pet.home = [...(x.pet.home || []), pt.id]; x.pet.active = x.pet.home[0]; done = true; } });
          if (done) { sfx('reveal'); confetti(); toast(`Welcome home, little ${pt.name.toLowerCase()}!`); draw(); }
        } }, coinIcon(), String(pt.price));
      const isActive = isHome;
      return h('div', { class: `card pet-card${isActive ? ' current' : ''}` }, petSVG(pt.id, { size: 104, label: pt.name }), h('strong', {}, pt.name), h('span', { class: 'muted small' }, `Comes with: ${pt.toy}`), btn);
    }));
    wrap.append(h('h3', {}, 'Pet shop'), shop);
  };
  draw();
  return wrap;
}

// ---------------------------------------------------------------- Supermarket
export function marketTab() {
  const st = getState();
  const petId = st.pet.active;
  const trolley = {};
  const order = [];
  let aisle = 'fruit';
  const scene = createMarketScene({ petId, equipped: { ...DEFAULT_EQUIPPED, ...st.avatar.equipped } });
  const shelf = h('div', { class: 'market-shelf', role: 'list' });
  const receipt = h('div', { class: 'receipt card' });
  const aisleBar = h('div', { class: 'tabs aisle-tabs', role: 'tablist' });

  const drawAisles = () => {
    clear(aisleBar);
    for (const a of AISLES) aisleBar.append(h('button', { class: `tab${a.id === aisle ? ' active' : ''}`, role: 'tab', 'aria-selected': String(a.id === aisle), 'data-aisle': a.id, onclick: () => { aisle = a.id; drawAisles(); drawShelf(); } }, a.name));
    const a = AISLES.find((x) => x.id === aisle);
    const s0 = getState();
    scene.setAisle(a.name, MARKET.filter((m) => m.aisle === aisle && !(isOneOff(m) && (s0.pet.toys || []).includes(m.id))), (item) => { const card = shelf.querySelector(`[data-item="${item.id}"]`); if (card && !card.disabled) add(item, card); }, aisle === 'icecream');
  };
  const drawShelf = () => {
    clear(shelf);
    const s = getState();
    for (const item of MARKET.filter((m) => m.aisle === aisle)) {
      const have = isOneOff(item) && ((s.pet.toys || []).includes(item.id) || trolley[item.id]);
      const fav = petId && (FAVOURITES[petId] || []).includes(item.id);
      const card = h('button', { class: 'market-item', role: 'listitem', 'data-item': item.id, disabled: have, onclick: (e) => add(item, e.currentTarget) },
        svgFromString(itemSVG(item.id, 64, item.name)),
        h('span', { class: 'mi-name' }, item.name),
        fav ? h('span', { class: 'mi-fav' }, `♥ ${petName(s.pet, petId)} loves this`) : null,
        have ? h('span', { class: 'mi-price' }, (s.pet.toys || []).includes(item.id) ? 'At home' : 'In trolley')
          : h('span', { class: 'mi-price' }, coinIcon(), String(item.price)));
      shelf.append(card);
    }
  };
  const drawReceipt = () => {
    clear(receipt);
    const s = getState();
    const total = trolleyTotal(trolley);
    const lines = Object.entries(trolley).filter(([, n]) => n > 0);
    receipt.append(h('h3', {}, icon('bag', 'coin-icon'), ' Trolley'));
    if (!lines.length) receipt.append(h('p', { class: 'muted small' }, 'Tap things on the shelves to pop them in your trolley.'));
    const list = h('ul', { class: 'receipt-lines' });
    for (const [id, n] of lines) {
      const item = marketItem(id);
      list.append(h('li', {}, h('span', {}, `${item.name}${n > 1 ? ` ×${n}` : ''}`), h('span', { class: 'r-price' }, String(item.price * n)),
        h('button', { class: 'btn tiny', 'aria-label': `Take one ${item.name} out`, 'data-action': 'remove', onclick: () => { trolley[id] -= 1; if (!trolley[id]) delete trolley[id]; order.splice(order.lastIndexOf(id), 1); scene.setTrolley(order); drawReceipt(); drawShelf(); } }, '−')));
    }
    receipt.append(list);
    const short = total - s.coins;
    receipt.append(h('div', { class: 'receipt-total' }, h('span', {}, 'Total'), h('strong', {}, coinIcon(), String(total))));
    receipt.append(h('div', { class: 'muted small' }, `You have ${s.coins} coins.`));
    if (short > 0) receipt.append(h('p', { class: 'warn small' }, `You need ${short} more coins. Take something out, or earn more by practising!`));
    receipt.append(h('button', { class: 'btn primary block', 'data-action': 'pay', disabled: !lines.length || short > 0, onclick: pay }, 'Pay at the till'));
  };
  function add(item, card) {
    if (isOneOff(item) && trolley[item.id]) return;
    trolley[item.id] = (trolley[item.id] || 0) + 1;
    order.push(item.id);
    sfx('pop');
    // Fly the picture into the trolley.
    const pic = card.querySelector('svg');
    const tgt = scene.el.getBoundingClientRect();
    if (pic && !reduced() && tgt.width) {
      const r = pic.getBoundingClientRect();
      const ghost = pic.cloneNode(true);
      Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: 50, pointerEvents: 'none' });
      document.body.append(ghost);
      const tx = tgt.left + tgt.width * 0.42 - r.left, ty = tgt.top + tgt.height * 0.5 - r.top;
      const anim = ghost.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${tx * 0.5}px, ${ty - 120}px) scale(.8)`, offset: 0.5 }, { transform: `translate(${tx}px, ${ty}px) scale(.3)`, opacity: 0.6 }], { duration: 650, easing: 'ease-in-out' });
      anim.onfinish = () => ghost.remove();
    }
    setTimeout(() => scene.setTrolley(order), reduced() ? 0 : 600);
    drawReceipt(); drawShelf();
  }
  let paying = false;
  async function pay() {
    if (paying) return;
    const total = trolleyTotal(trolley);
    let ok = false;
    const bought = { ...trolley };
    update((s) => { ok = checkout(s, bought); });
    if (!ok) { toast('Not enough coins for all of that.'); return; }
    paying = true;
    receipt.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    await scene.checkout(order.slice(), total);
    for (const k of Object.keys(trolley)) delete trolley[k];
    order.length = 0;
    scene.setTrolley([]);
    paying = false;
    confetti();
    clear(receipt);
    receipt.append(h('h3', {}, 'Thank you!'), h('p', {}, 'Everything is put away at home.'),
      getState().pet.active ? h('a', { class: 'btn primary block', href: '#/rewards/pet', 'data-action': 'go-home' }, `Go home to ${petName(getState().pet, getState().pet.active)}`) : h('a', { class: 'btn primary block', href: '#/rewards/pet' }, 'Adopt a pet'),
      h('button', { class: 'btn block', onclick: () => { drawReceipt(); drawShelf(); } }, 'Keep shopping'));
    drawShelf();
  }
  drawAisles(); drawShelf(); drawReceipt();
  return h('div', { class: 'market' },
    h('div', { class: 'card market-scene' }, scene.el),
    !petId ? h('p', { class: 'muted' }, 'Tip: adopt a pet first, so it can come shopping with you!') : null,
    h('div', { class: 'market-layout' }, h('div', { class: 'stack' }, aisleBar, shelf), receipt));
}
