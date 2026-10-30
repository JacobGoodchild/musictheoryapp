// Rewards → Pet (the pet house) and Rewards → Supermarket.
import { h, clear, svgFromString, toast, confirmDialog } from '../dom.js';
import { getState, update, subscribe } from '../state/store.js';
import { icon, coinIcon } from '../ui/icons.js';
import { cleanName } from '../state/save.js';
import { spendCoins } from '../state/rewards.js';
import { sfx } from '../audio/synth.js';
import { confetti } from '../ui/confetti.js';
import { PETS, MARKET, AISLES, marketItem, isOneOff, FAVOURITES, needsNow, changeNeeds, takeFood, foodEffect, trolleyTotal, checkout, petName, storable, whereIs, putOut, ROOM_LIMIT, giftReady, openGift, totalCorrect } from '../state/pet.js';
import { petSVG } from '../game/pet-rig.js';
import { createHouse, ROOMS, TRICKS } from '../game/house.js';
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
const DRAWERS = [
  ['feed', 'Feed', 'heart'], ['cuddle', 'Cuddle all', 'heart'], ['bed', 'Bedtime', 'moon'], ['tricks', 'Tricks', 'star'],
  ['storage', 'Storage', 'bag'], ['pets', 'My pets', 'paw'], ['photo', 'Photo', 'download'],
];

/** Save a picture of the house as a PNG file. */
function savePhoto(svgEl) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute('width', 1600); clone.setAttribute('height', 900);
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 1600; c.height = 900;
    c.getContext('2d').drawImage(img, 0, 0, 1600, 900);
    URL.revokeObjectURL(url);
    const a = h('a', { href: c.toDataURL('image/png'), download: 'my-house.png' });
    document.body.append(a); a.click(); a.remove();
    toast('Photo saved!');
  };
  img.src = url;
}

export function petTab() {
  const wrap = h('div', {});
  let drawer = null;
  const draw = () => {
    clear(wrap);
    const st = getState();
    const p = st.pet;
    const home = (p.home || []).filter((id) => p.owned.includes(id));
    const room = p.room || 'living';
    if (home.length) {
      const books = (p.toys || []).map(marketItem).filter((m) => m && m.kind === 'book');
      const outHere = (p.out && p.out[room]) || [];
      const house = createHouse({
        pets: home.map((id) => ({ id, name: petName(p, id) })),
        room,
        books,
        out: { decor: outHere.filter((id) => id.startsWith('decor-')), toys: outHere.filter((id) => id.startsWith('toy-')), myToys: outHere.filter((id) => id.startsWith('my-')) },
        equipped: { ...DEFAULT_EQUIPPED, ...st.avatar.equipped },
        gift: giftReady(p),
        onGift: () => { let r = null; update((x) => { r = openGift(x); }); return r ? `A present! ${r.message}` : 'A present!'; },
        getNeeds: (id) => needsNow(getState().pet, id),
        onNeeds: (id, d) => update((x) => { changeNeeds(x, id, d); }),
      });
      const panel = h('div', { class: 'house-drawer' });
      const bar = h('div', { class: 'house-bar', role: 'toolbar', 'aria-label': 'House actions' });
      const drawBar = () => {
        clear(bar);
        for (const [id, label, ic] of DRAWERS) {
          const isToggle = !['cuddle', 'bed', 'photo'].includes(id);
          bar.append(h('button', { class: `house-btn${drawer === id ? ' on' : ''}`, 'data-action': id, 'aria-pressed': isToggle ? String(drawer === id) : null, onclick: () => {
            if (id === 'cuddle') { house.cuddleAll(); return; }
            if (id === 'bed') { house.bedtime(); return; }
            if (id === 'photo') { savePhoto(house.el); return; }
            drawer = drawer === id ? null : id; drawBar(); drawPanel();
          } }, icon(ic, 'coin-icon'), label));
        }
        bar.append(h('a', { class: 'house-btn primary', href: '#/rewards/market' }, icon('trolley', 'coin-icon'), 'Supermarket'));
      };
      const drawPanel = () => {
        clear(panel);
        panel.hidden = !drawer;
        if (drawer === 'feed') panel.append(feedPanel());
        else if (drawer === 'tricks') panel.append(tricksPanel());
        else if (drawer === 'storage') panel.append(storagePanel());
        else if (drawer === 'pets') panel.append(petsPanel());
      };
      // Feed: choose who eats (one pet, everyone, or me), then the food.
      let eater = 'all';
      const feedPanel = () => {
        const box = h('div', { class: 'stack' });
        const who = h('div', { class: 'row wrap who-eats', role: 'group', 'aria-label': 'Who is eating?' });
        const opts = [['all', home.length > 1 ? 'Everyone' : petName(p, home[0])], ...(home.length > 1 ? home.map((id, i) => [`p${i}`, petName(getState().pet, id)]) : []), ['me', 'Me']];
        for (const [k, label] of opts) who.append(h('button', { class: `btn small${eater === k ? ' primary' : ''}`, 'aria-pressed': String(eater === k), 'data-who': k, onclick: () => { eater = k; drawPanel(); } }, label));
        const tray = h('div', { class: 'food-tray' });
        const food = Object.entries(getState().pet.inventory || {}).filter(([id, n]) => n > 0 && marketItem(id));
        if (!food.length) tray.append(h('p', { class: 'muted small' }, 'The cupboard is empty. Pop to the supermarket for some food!'));
        for (const [id, n] of food) {
          const item = marketItem(id);
          tray.append(h('button', { class: 'food-btn', 'data-action': 'feed', 'data-item': id, title: item.name, 'aria-label': `${item.name}, ${n} left`, onclick: () => {
            if (eater === 'me') {
              if (item.kind === 'petfood') { house.say('That’s pet food, silly!'); return; }
              let ok = null; update((x) => { ok = takeFood(x, id); });
              if (ok) house.girlEat(item);
            } else {
              const targets = eater === 'all' ? home.map((_, i) => i) : [Number(eater.slice(1))];
              for (const i of targets) {
                let eff = null;
                update((x) => { const it = takeFood(x, id); if (it) eff = foodEffect(it, home[i]); });
                if (!eff) { if (i === targets[0]) house.say('Oh no, we ran out!'); break; }
                house.feed(item, eff, i);
              }
            }
            drawPanel();
          } }, svgFromString(itemSVG(id, 46, item.name)), h('span', { class: 'food-count' }, `×${n}`)));
        }
        box.append(h('strong', {}, 'Who’s eating?'), who, h('strong', {}, 'Food cupboard'), tray);
        const books = (getState().pet.toys || []).map(marketItem).filter((m) => m && m.kind === 'book');
        if (books.length) box.append(h('strong', {}, 'My books'), h('div', { class: 'row wrap' }, books.map((b) => h('button', { class: 'food-btn book-btn', 'data-action': 'read', 'data-item': b.id, 'aria-label': `Read ${b.name}`, onclick: () => house.read(b) }, svgFromString(itemSVG(b.id, 46, b.name)), h('span', { class: 'food-count' }, 'Read')))));
        return box;
      };
      const tricksPanel = () => {
        const n = totalCorrect(getState());
        const next = TRICKS.find((t) => t.at > n);
        return h('div', { class: 'stack' },
          h('p', { class: 'muted small' }, 'Your pets learn new tricks as you get questions right in Practice, Learn and Mocks.'),
          h('div', { class: 'row wrap' }, TRICKS.map((t) => t.at <= n
            ? h('button', { class: 'btn small', 'data-trick': t.id, onclick: () => house.trick(t.id) }, t.name)
            : h('span', { class: 'chip' }, icon('lock', 'coin-icon'), `${t.name} (${t.at} right answers)`))),
          next ? h('p', { class: 'small' }, `${next.at - n} more right answers until they learn "${next.name}"!`) : h('p', { class: 'small' }, 'They know every trick. Superstars!'),
          room === 'living' ? h('button', { class: 'btn small', 'data-action': 'piano', onclick: () => house.playPiano() }, 'Play the piano (the pets will dance!)') : null);
      };
      const storagePanel = () => {
        const x = getState().pet;
        const owned = (x.toys || []).filter(storable);
        const list = h('div', { class: 'storage-grid' });
        if (!owned.length) list.append(h('p', { class: 'muted small' }, 'Nothing here yet. Toys and decorations you buy can be kept here.'));
        for (const id of owned) {
          const item = marketItem(id);
          const where = whereIs(x, id);
          const here = where === room;
          list.append(h('div', { class: `storage-item${here ? ' here' : ''}` }, svgFromString(itemSVG(id, 44, item ? item.name : id)),
            h('span', { class: 'small' }, item ? item.name : id),
            h('span', { class: 'muted tiny' }, where === 'storage' ? 'In storage' : `In the ${ROOMS.find((r) => r[0] === where)[1].toLowerCase()}`),
            h('button', { class: `btn tiny${here ? '' : ' primary'}`, 'data-store': id, onclick: () => {
              let ok = true;
              update((s2) => { ok = putOut(s2, id, here ? 'storage' : room); });
              if (!ok) toast(`This room is full (${ROOM_LIMIT} things). Put something away first.`);
              draw();
            } }, here ? 'Put away' : 'Put out here')));
        }
        return h('div', { class: 'stack' }, h('p', { class: 'muted small' }, `Choose what is out in this room (up to ${ROOM_LIMIT} things). Everything else waits safely in storage.`), list);
      };
      const petsPanel = () => {
        const x = getState().pet;
        const box = h('div', { class: 'pet-shop' });
        for (const pt of PETS) {
          const owned = x.owned.includes(pt.id), isHome = (x.home || []).includes(pt.id);
          const nameIn = h('input', { type: 'text', maxlength: 16, class: 'pet-name-input', 'aria-label': `${pt.name}'s name`, placeholder: 'Name', value: (x.names || {})[pt.id] || '' });
          box.append(h('div', { class: `card pet-card${isHome ? ' current' : ''}` }, petSVG(pt.id, { size: 90, label: pt.name }), h('strong', {}, owned ? petName(x, pt.id) : pt.name),
            owned ? h('button', { class: `btn small${isHome ? ' good' : ''}`, 'data-action': 'pet-home', 'aria-pressed': String(isHome), onclick: () => {
              update((y) => { y.pet.home = y.pet.home || []; if (y.pet.home.includes(pt.id)) y.pet.home = y.pet.home.filter((i) => i !== pt.id); else y.pet.home.push(pt.id); y.pet.active = y.pet.home[0] || null; });
              draw();
            } }, isHome ? 'At home ✓' : 'Bring home') : buyPetButton(pt, draw),
            owned ? h('form', { class: 'row tight', onsubmit: (e) => { e.preventDefault(); update((y) => { y.pet.names = y.pet.names || {}; y.pet.names[pt.id] = cleanName(nameIn.value).slice(0, 16); }); toast('Name saved'); draw(); } }, nameIn, h('button', { class: 'btn tiny', type: 'submit' }, 'Save')) : h('span', { class: 'muted tiny' }, `Comes with: ${pt.toy}`)));
        }
        return box;
      };
      const rooms = h('div', { class: 'tabs room-tabs', role: 'tablist', 'aria-label': 'Rooms' }, ROOMS.map(([id, label]) =>
        h('button', { class: `tab${room === id ? ' active' : ''}`, role: 'tab', 'aria-selected': String(room === id), 'data-room': id, onclick: () => { update((x) => { x.pet.room = id; }); draw(); } }, label)));
      const names = home.map((id) => petName(p, id));
      const title = h('h2', { class: 'pet-name' });
      title.textContent = names.length > 2 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names.join(' and ');
      const meters = h('div', { class: 'pet-meters' }, home.map((id) => { const n = h('strong', { class: 'small' }); n.textContent = petName(p, id); return h('div', { class: 'pet-meter' }, petSVG(id, { size: 34, label: '' }), n, needMeters(id)); }));
      wrap.append(h('div', { class: 'card house-card' },
        h('div', { class: 'house-head' }, h('div', {}, title, h('p', { class: 'muted small' }, 'Click the floor to walk. Drag a toy and let go to throw it. Click a pet for a cuddle.')), rooms),
        h('div', { class: 'house-frame' }, house.el),
        bar, panel,
        h('details', { class: 'pet-needs' }, h('summary', {}, 'How are my pets feeling?'), meters)));
      drawBar(); drawPanel();
    } else {
      const box = h('div', { class: 'card stack' }, h('h2', {}, p.owned.length ? 'Nobody is home' : 'No pet yet'),
        h('p', { class: 'muted' }, p.owned.length ? 'Bring a pet home to open your house.' : 'Adopt a pet friend. It will live in your house with you: chasing the ball you throw, learning tricks, eating the food you buy at the supermarket, and napping in its bed.'));
      const shop = h('div', { class: 'pet-shop' }, PETS.map((pt) => {
        const owned = p.owned.includes(pt.id);
        return h('div', { class: 'card pet-card' }, petSVG(pt.id, { size: 104, label: pt.name }), h('strong', {}, pt.name), h('span', { class: 'muted small' }, `Comes with: ${pt.toy}`),
          owned ? h('button', { class: 'btn small', 'data-action': 'pet-home', onclick: () => { update((y) => { y.pet.home = [...(y.pet.home || []), pt.id]; y.pet.active = y.pet.home[0]; }); draw(); } }, 'Bring home') : buyPetButton(pt, draw));
      }));
      wrap.append(box, h('h3', {}, 'Pet shop'), shop);
    }
  };
  draw();
  return wrap;
}

function buyPetButton(pt, redraw) {
  return h('button', { class: 'btn small primary', 'data-action': 'pet-buy', disabled: getState().coins < pt.price, onclick: async () => {
    const ok = await confirmDialog(`Adopt the ${pt.name}?`, `This costs ${pt.price} coins. It comes with its own ${pt.toy}.`, { ok: 'Adopt' });
    if (!ok) return;
    let done = false;
    update((x) => { if (spendCoins(x, pt.price)) { x.pet.owned.push(pt.id); x.pet.home = [...(x.pet.home || []), pt.id]; x.pet.active = x.pet.home[0]; done = true; } });
    if (done) { sfx('reveal'); confetti(); toast(`Welcome home, little ${pt.name.toLowerCase()}!`); redraw(); }
  } }, coinIcon(), String(pt.price));
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
