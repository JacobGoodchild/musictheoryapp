// App entry: theme, navigation, hash router.
import { h, clear, toast } from './dom.js';
import { icon, coinIcon } from './ui/icons.js';
import { getState, subscribe, update } from './state/store.js';
import { applyTheme } from './ui/theme.js';
import { routes, resolve } from './routes.js';

export const APP_VERSION = '0.1.0';

const NAV = [
  { href: '#/home', label: 'Home', icon: 'home' },
  { href: '#/learn', label: 'Learn', icon: 'learn' },
  { href: '#/practice', label: 'Practice', icon: 'practice' },
  { href: '#/mock', label: 'Mock exams', icon: 'mock' },
  { href: '#/memorise', label: 'Memorise', icon: 'memorise' },
  { href: '#/rewards', label: 'Rewards', icon: 'rewards' },
  { href: '#/settings', label: 'Settings', icon: 'settings' },
];

function buildNav() {
  const nav = document.getElementById('nav');
  clear(nav);
  for (const item of NAV) {
    nav.append(h('li', {}, h('a', { href: item.href, 'data-nav': item.href }, icon(item.icon), h('span', {}, item.label))));
  }
}

function markNav(path) {
  const top = '#/' + (path.split('/')[1] || 'home');
  for (const a of document.querySelectorAll('[data-nav]')) {
    if (a.dataset.nav === top) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

function renderFoot() {
  const s = getState();
  const foot = document.getElementById('sidebar-foot');
  clear(foot);
  foot.append(
    h('div', { class: 'card', style: { padding: '12px 14px' } },
      h('div', { class: 'row between' },
        h('span', { class: 'coin', title: 'Coins' }, coinIcon(), h('span', { 'data-coins': '' }, String(s.coins))),
        h('span', { class: 'chip', title: 'Daily streak' }, icon('flame', 'coin-icon'), `${s.streak.count} day${s.streak.count === 1 ? '' : 's'}`)),
    ),
  );
}

let navToken = 0;
async function router() {
  const hash = location.hash || '#/home';
  const path = hash.slice(1);
  const main = document.getElementById('main');
  const token = ++navToken;
  markNav(path);
  const { view, params } = resolve(path);
  let el;
  try {
    el = await view(params);
  } catch (err) {
    console.error(err);
    el = h('div', { class: 'card' }, h('h2', {}, 'Something went wrong'), h('p', { class: 'muted' }, String(err && err.message || err)));
  }
  if (token !== navToken) return;
  clear(main);
  el.classList.add('view');
  main.append(el);
  if (!path.includes('#')) window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
}

async function boot() {
  const s = getState();
  applyTheme(s.settings);
  buildNav();
  renderFoot();
  subscribe(() => renderFoot());
  // Daily streak bookkeeping happens on load.
  const { touchStreak } = await import('./state/progress.js');
  const { addCoins, streakBonus } = await import('./state/rewards.js');
  let bonus = 0;
  update((st) => {
    touchStreak(st);
    if (st.streak.pendingBonus && st.profile.name) { bonus = addCoins(st, streakBonus(st.streak.count), 'streak'); st.streak.pendingBonus = false; }
  });
  if (bonus) setTimeout(() => toast(`Day ${getState().streak.count} streak: +${bonus} coins`, { icon: icon('flame', 'coin-icon') }), 800);
  window.addEventListener('hashchange', router);
  await router();
  const { registerSW } = await import('./ui/pwa.js');
  registerSW();
}

void routes;
boot();
