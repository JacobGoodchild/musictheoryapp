import { h } from '../dom.js';
import { getState, update } from '../state/store.js';
import { cleanName } from '../state/save.js';
import { SECTIONS } from '../content/sections.js';
import { icon, coinIcon } from '../ui/icons.js';

function greeting() {
  const hr = new Date().getHours();
  return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

function nameForm(onDone) {
  const input = h('input', { type: 'text', id: 'profile-name', maxlength: 24, placeholder: 'Your name', autocomplete: 'off', 'aria-label': 'Your name' });
  const form = h('form', { class: 'row', onsubmit: (e) => {
    e.preventDefault();
    const name = cleanName(input.value);
    if (!name) { input.focus(); return; }
    update((s) => { s.profile.name = name; });
    onDone();
  } }, input, h('button', { class: 'btn primary', type: 'submit' }, "Let's go"));
  return form;
}

export default async function home() {
  const s = getState();
  const root = h('div', {});
  if (!s.profile.name) {
    root.append(h('div', { class: 'card', style: { maxWidth: '560px', margin: '40px auto', padding: '36px' } },
      h('div', { class: 'eyebrow' }, 'Welcome'),
      h('h1', {}, 'Grade 5 Theory'),
      h('p', { class: 'muted' }, 'Lessons, practice questions and full mock exams for the Grade 5 music theory exam. Everything is saved on this computer only.'),
      h('p', {}, 'What should we call you?'),
      nameForm(() => { location.hash = '#/home'; window.dispatchEvent(new HashChangeEvent('hashchange')); })));
    return root;
  }
  const nameEl = h('span', {});
  nameEl.textContent = s.profile.name;
  root.append(
    h('div', { class: 'page-head' },
      h('div', {}, h('div', { class: 'eyebrow' }, greeting()), h('h1', {}, 'Hi, ', nameEl, '!')),
      h('div', { class: 'row' }, h('span', { class: 'chip' }, coinIcon(), `${s.coins} coins`), h('span', { class: 'chip' }, icon('flame', 'coin-icon'), `${s.streak.count}-day streak`))),
    h('h2', { class: 'section-title' }, 'Exam sections'),
    h('div', { class: 'grid cols-3' }, SECTIONS.map((sec) => h('a', { class: 'card lift', href: `#/learn` },
      h('div', { class: 'eyebrow' }, `Section ${sec.id} · ${sec.marks} marks`), h('h3', {}, sec.title)))),
  );
  return root;
}
