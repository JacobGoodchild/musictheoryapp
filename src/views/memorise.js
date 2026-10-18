import { h, clear, svg, shuffle, append } from '../dom.js';
import { getState, update } from '../state/store.js';
import { icon } from '../ui/icons.js';
import { renderMusic } from '../notation/render.js';
import { DECKS, dueCards, review } from '../content/cards.js';
import { TERMS, meaningsClash } from '../content/terms.js';
import { GRADE5_MAJOR, keyFromFifths, keyName, relative, signature, SHARP_ORDER, FLAT_ORDER } from '../theory/keys.js';
import { name } from '../theory/pitch.js';
import { addCoins } from '../state/rewards.js';
import { sfx } from '../audio/synth.js';

export default async function memorise({ tool } = {}) {
  if (tool === 'circle') return circleView();
  if (tool === 'clock') return clockView();
  if (tool === 'match') return matchView();
  if (tool && tool.startsWith('cards')) return cardsView(tool.split(':')[1]);
  const s = getState();
  const tile = (href, ic, title, text) => h('a', { class: 'card lift quick-card', href }, h('span', { class: 'quick-icon' }, icon(ic)), h('h3', {}, title), h('p', { class: 'small muted', style: { margin: 0 } }, text));
  return h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Memorise'), h('h1', {}, 'Memorise'), h('p', {}, 'Key signatures, terms, signs and instruments: little and often works best.'))),
    h('div', { class: 'grid cols-3' },
      tile('#/memorise/circle', 'refresh', 'Circle of fifths', 'See how every key leads to the next, with relative minors and the order of sharps and flats.'),
      tile('#/memorise/clock', 'clock', 'Beat the clock', `60 seconds of quick-fire terms. Best: ${s.badges.clockBest || 0}`),
      tile('#/memorise/match', 'shuffle', 'Matching pairs', 'Match each term to its meaning as fast as you can.')),
    h('h2', { class: 'section-title' }, 'Flashcards'),
    h('p', { class: 'muted' }, 'Cards you know come back less often (1, 2, 4, 8, then 16 days). Cards you miss come back straight away.'),
    h('div', { class: 'grid cols-3' }, DECKS.map((d) => {
      const due = dueCards(d, s.cards).length;
      const known = d.cards.filter((c) => (s.cards[c.id]?.box || 0) >= 3).length;
      return h('a', { class: 'card lift deck-card', href: `#/memorise/cards:${d.id}` },
        h('h3', {}, d.title),
        h('div', { class: 'row' }, h('span', { class: `chip ${due ? 'accent' : 'good'}` }, due ? `${due} due` : 'All caught up'), h('span', { class: 'chip' }, `${known}/${d.cards.length} known`)),
        h('div', { class: 'progress', style: { marginTop: '10px' } }, h('span', { style: { width: `${(known / d.cards.length) * 100}%` } })));
    })));
}

// ---------------------------------------------------------------- Circle of fifths
function circleView() {
  let selected = 0;
  let clef = 'treble';
  const info = h('div', { class: 'circle-info card' });
  const size = 420, cx = size / 2, cy = size / 2;
  const svgEl = svg('svg', { viewBox: `0 0 ${size} ${size}`, class: 'circle-svg', role: 'group', 'aria-label': 'Circle of fifths' });
  const fifthsOrder = [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1];
  const draw = () => {
    while (svgEl.firstChild) svgEl.firstChild.remove();
    svgEl.append(svg('circle', { cx, cy, r: 196, class: 'ring-outer' }), svg('circle', { cx, cy, r: 128, class: 'ring-inner' }), svg('circle', { cx, cy, r: 66, class: 'ring-centre' }));
    fifthsOrder.forEach((f, i) => {
      const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isSel = f === selected || (selected === -6 && f === 6) || (selected === 6 && f === 6);
      const maj = keyFromFifths(f, 'major');
      const min = keyFromFifths(f, 'minor');
      const pos = (rad) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
      const [x1, y1] = pos(164), [x2, y2] = pos(98);
      const g = svg('g', { class: `ck${isSel ? ' sel' : ''}`, tabindex: 0, role: 'button', 'aria-label': `${keyName(maj)} and ${keyName(min)}`, 'data-fifths': f });
      g.append(svg('circle', { cx: x1, cy: y1, r: 26, class: 'ck-maj' }), svg('text', { x: x1, y: y1 + 6, 'text-anchor': 'middle', class: 'ck-t' }, f === 6 ? 'F♯/G♭' : name({ letter: maj.tonic[0], acc: { '#': 1, b: -1 }[maj.tonic[1]] || 0 })),
        svg('circle', { cx: x2, cy: y2, r: 21, class: 'ck-min' }), svg('text', { x: x2, y: y2 + 5, 'text-anchor': 'middle', class: 'ck-t small' }, (f === 6 ? 'd♯/e♭' : name({ letter: min.tonic[0], acc: { '#': 1, b: -1 }[min.tonic[1]] || 0 }).toLowerCase())));
      const pick = () => { selected = f === 6 && selected === 6 ? -6 : f; draw(); show(); };
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      svgEl.append(g);
    });
    svgEl.append(svg('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', class: 'ck-centre' }, 'majors outside'), svg('text', { x: cx, y: cy + 14, 'text-anchor': 'middle', class: 'ck-centre' }, 'minors inside'));
  };
  const show = () => {
    clear(info);
    const maj = keyFromFifths(selected, 'major');
    const min = relative(maj);
    const sig = signature(maj);
    const staff = h('div', {});
    const clefBtns = h('div', { class: 'row' }, ['treble', 'bass', 'alto', 'tenor'].map((c) => h('button', { class: `btn small${c === clef ? ' primary' : ''}`, onclick: () => { clef = c; show(); } }, c)));
    append(info, [h('h2', {}, `${keyName(maj)} · ${keyName(min)}`),
      h('p', {}, selected === 0 ? 'No sharps or flats.' : `${Math.abs(selected)} ${selected > 0 ? 'sharp' : 'flat'}${Math.abs(selected) > 1 ? 's' : ''}: ${sig.map((s) => name({ letter: s.letter, acc: s.acc })).join(' ')}`),
      clefBtns, staff,
      h('p', { class: 'small muted' }, selected > 0 ? `Clockwise each key is a perfect 5th higher and adds one sharp. The new sharp is the leading note of the major key (here ${sig.length ? name({ letter: sig[sig.length - 1].letter, acc: 1 }) : '—'}).` : selected < 0 ? 'Anticlockwise each key is a perfect 5th lower and adds one flat. The second-to-last flat names the major key.' : 'C major and A minor sit at the top: no sharps or flats.'),
      h('p', { class: 'small' }, h('strong', {}, 'Order of sharps: '), SHARP_ORDER.join(' '), h('br'), h('strong', {}, 'Order of flats: '), FLAT_ORDER.join(' ')),
      selected === 6 || selected === -6 ? h('p', { class: 'chip accent' }, 'F♯ major (6♯) and G♭ major (6♭) sound the same: click again to switch.') : null]);
    renderMusic(staff, { clef, key: selected, free: true, notes: [], scale: 1.3 });
  };
  draw(); show();
  return h('div', {}, h('a', { class: 'back-link', href: '#/memorise' }, icon('back', 'coin-icon'), 'Memorise'), h('h1', {}, 'Circle of fifths'),
    h('div', { class: 'circle-wrap' }, h('div', { class: 'card circle-card' }, svgEl), info));
}

// ---------------------------------------------------------------- Flashcards
function cardsView(deckId) {
  const deck = DECKS.find((d) => d.id === deckId);
  if (!deck) return h('div', { class: 'card' }, 'Deck not found');
  const host = h('div', { class: 'flash-host' });
  let queue = shuffle(dueCards(deck, getState().cards));
  let extra = false;
  if (!queue.length) { queue = shuffle(deck.cards).slice(0, 10); extra = true; }
  let done = 0;
  const next = () => {
    clear(host);
    if (!queue.length) {
      host.append(h('div', { class: 'card empty-state' }, h('div', { class: 'big-emoji' }, '🎉'), h('h2', {}, 'Deck done for now'), h('p', { class: 'muted' }, `${done} cards reviewed. Come back tomorrow for the next ones.`), h('a', { class: 'btn primary', href: '#/memorise' }, 'Back to Memorise')));
      return;
    }
    const c = queue[0];
    let flipped = false;
    const front = h('div', { class: 'flash-face front' }, c.sub ? h('div', { class: 'eyebrow' }, c.sub) : null, c.front ? h('div', { class: 'flash-big' }, c.front) : null);
    const back = h('div', { class: 'flash-face back' }, h('div', { class: 'flash-answer' }, c.back));
    if (c.music) { const m = h('div', {}); renderMusic(m, c.music); (c.musicOnBack ? back : front).append(m); }
    const card = h('button', { class: 'flashcard', 'aria-label': 'Flashcard. Press to turn over.', onclick: () => flip() }, front, back);
    const btns = h('div', { class: 'row flash-btns', hidden: true },
      h('button', { class: 'btn danger', onclick: () => grade(false) }, 'Not yet'),
      h('button', { class: 'btn good', onclick: () => grade(true) }, 'Got it'));
    function flip() { if (flipped) return; flipped = true; card.classList.add('flipped'); btns.hidden = false; btns.querySelector('.good').focus(); }
    function grade(ok) {
      update((s) => { review(s.cards, c.id, ok); if (ok && !extra) addCoins(s, 1, 'cards'); });
      queue.shift(); done++;
      if (!ok) queue.splice(Math.min(queue.length, 3), 0, c);
      next();
    }
    host.append(h('div', { class: 'small muted' }, `${queue.length} to go${extra ? ' (extra practice: nothing due)' : ''}`), card, btns, h('p', { class: 'tiny muted' }, 'Space or click to turn over; then choose.'));
    card.focus();
  };
  next();
  return h('div', {}, h('a', { class: 'back-link', href: '#/memorise' }, icon('back', 'coin-icon'), 'Memorise'), h('h1', {}, deck.title), host);
}

// ---------------------------------------------------------------- Beat the clock
function clockView() {
  const host = h('div', { class: 'card clock-host' });
  let score = 0, timeLeft = 60, timer = null;
  const start = () => {
    score = 0; timeLeft = 60;
    timer = setInterval(() => { timeLeft--; tick(); if (timeLeft <= 0) end(); }, 1000);
    ask();
  };
  const timeEl = h('span', { class: 'chip timer-chip' });
  const scoreEl = h('span', { class: 'chip accent' });
  const tick = () => { timeEl.textContent = `⏱ ${timeLeft}s`; scoreEl.textContent = `Score ${score}`; if (!document.body.contains(host) && timer) clearInterval(timer); };
  const ask = () => {
    clear(host);
    const t = TERMS[Math.floor(Math.random() * TERMS.length)];
    const wrong = shuffle(TERMS.filter((o) => !meaningsClash(o.meaning, t.meaning))).slice(0, 3).map((o) => o.meaning);
    const opts = shuffle([t.meaning, ...new Set(wrong)]).slice(0, 4);
    if (!opts.includes(t.meaning)) opts[0] = t.meaning;
    host.append(h('div', { class: 'row between' }, timeEl, scoreEl), h('h2', { class: 'clock-term' }, t.term), h('div', { class: 'q-options' }, opts.map((o) => h('button', { class: 'q-option', onclick: (e) => {
      if (o === t.meaning) { score++; sfx('correct'); } else { sfx('wrong'); e.currentTarget.classList.add('wrong'); }
      tick(); setTimeout(ask, o === t.meaning ? 120 : 500);
    } }, h('span', { class: 'q-option-label' }, o)))));
    tick();
  };
  const end = () => {
    clearInterval(timer); timer = null;
    let best = 0, coins = 0;
    update((s) => { best = s.badges.clockBest || 0; if (score > best) s.badges.clockBest = score; coins = addCoins(s, Math.min(15, Math.floor(score / 2)), 'games'); });
    clear(host);
    host.append(h('div', { class: 'empty-state' }, h('div', { class: 'big-emoji' }, score > best ? '🏆' : '⏰'), h('h2', {}, `${score} correct`), h('p', { class: 'muted' }, score > best ? 'New personal best!' : `Your best is ${best}.`), coins ? h('p', {}, `+${coins} coins`) : null, h('button', { class: 'btn primary', onclick: start }, 'Play again')));
  };
  host.append(h('div', { class: 'empty-state' }, h('h2', {}, 'Beat the clock'), h('p', { class: 'muted' }, 'Pick the meaning of each term. How many can you get in 60 seconds?'), h('button', { class: 'btn primary big', onclick: start }, 'Start')));
  return h('div', {}, h('a', { class: 'back-link', href: '#/memorise' }, icon('back', 'coin-icon'), 'Memorise'), h('h1', {}, 'Beat the clock'), host);
}

// ---------------------------------------------------------------- Matching pairs
function matchView() {
  const host = h('div', {});
  const play = () => {
    clear(host);
    const picked = [];
    for (const t of shuffle(TERMS)) { if (picked.length >= 6) break; if (!picked.some((p) => meaningsClash(p.meaning, t.meaning))) picked.push(t); }
    const tiles = shuffle([...picked.map((t) => ({ id: t.id, text: t.term, kind: 'term' })), ...picked.map((t) => ({ id: t.id, text: t.meaning, kind: 'meaning' }))]);
    let first = null, matched = 0, moves = 0;
    const startT = Date.now();
    const grid = h('div', { class: 'match-grid' });
    tiles.forEach((tile) => {
      const b = h('button', { class: `match-tile ${tile.kind}` }, tile.text);
      b.addEventListener('click', () => {
        if (b.classList.contains('done') || b === first?.el) return;
        b.classList.add('picked');
        if (!first) { first = { tile, el: b }; return; }
        moves++;
        const ok = first.tile.id === tile.id && first.tile.kind !== tile.kind;
        const a = first.el; first = null;
        if (ok) { a.classList.add('done'); b.classList.add('done'); a.classList.remove('picked'); b.classList.remove('picked'); matched++; sfx('correct');
          if (matched === picked.length) {
            const secs = Math.round((Date.now() - startT) / 1000);
            let coins = 0;
            update((s) => { coins = addCoins(s, 5, 'games'); });
            host.append(h('div', { class: 'card empty-state' }, h('h2', {}, `All matched in ${secs}s (${moves} tries)`), h('p', {}, `+${coins} coins`), h('button', { class: 'btn primary', onclick: play }, 'New set')));
          }
        } else { a.classList.add('nope'); b.classList.add('nope'); sfx('wrong'); setTimeout(() => { a.classList.remove('picked', 'nope'); b.classList.remove('picked', 'nope'); }, 600); }
      });
      grid.append(b);
    });
    host.append(grid);
  };
  play();
  return h('div', {}, h('a', { class: 'back-link', href: '#/memorise' }, icon('back', 'coin-icon'), 'Memorise'), h('h1', {}, 'Matching pairs'), h('p', { class: 'muted' }, 'Click a term, then its meaning.'), host);
}

void GRADE5_MAJOR;
