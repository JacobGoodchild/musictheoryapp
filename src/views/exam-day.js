import { h } from '../dom.js';
import { getState, update } from '../state/store.js';
import { SECTIONS } from '../content/sections.js';
import { icon } from '../ui/icons.js';

const CHECKLIST = [
  'Laptop charged (or plugged in) and a reliable internet connection.',
  'Chrome up to date; close other tabs and turn off notifications.',
  'A quiet room, a glass of water, and scrap paper if your exam rules allow it.',
  'Your login details ready, and arrive (log in) a few minutes early.',
  'Do a quick warm-up the day before: one practice section, not a whole new topic.',
  'Sleep well! A rested brain reads ledger lines much faster.',
];

export default async function examDay() {
  const s = getState();
  const ticks = s.badges.examChecklist || {};
  const list = h('ul', { class: 'checklist' }, CHECKLIST.map((t, i) => {
    const box = h('input', { type: 'checkbox', id: `chk-${i}`, checked: Boolean(ticks[i]) });
    box.addEventListener('change', () => update((x) => { x.badges.examChecklist = { ...(x.badges.examChecklist || {}), [i]: box.checked }; }));
    return h('li', {}, box, h('label', { for: `chk-${i}` }, t));
  }));
  return h('div', { class: 'lesson' },
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Exam day'), h('h1', {}, 'Your Grade 5 exam: what to expect'))),
    h('div', { class: 'card stack' },
      h('h2', {}, 'The format'),
      h('p', {}, 'The Grade 5 theory exam is taken online. You have up to **2 hours**, with a timer on screen, and it is marked automatically.'.replace(/\*\*/g, '')),
      h('div', { class: 'table-card' }, h('table', { class: 'table' }, h('thead', {}, h('tr', {}, h('th', {}, 'Section'), h('th', { class: 'num' }, 'Marks'))),
        h('tbody', {}, SECTIONS.map((sec) => h('tr', {}, h('td', {}, `${sec.id}. ${sec.title}`), h('td', { class: 'num' }, String(sec.marks)))), h('tr', {}, h('td', {}, h('strong', {}, 'Total')), h('td', { class: 'num' }, h('strong', {}, '75')))))),
      h('p', {}, 'Results: Pass 50–59 · Merit 60–64 · Distinction 65–75.')),
    h('div', { class: 'card stack' },
      h('h2', {}, 'How you answer'),
      h('ul', {},
        h('li', {}, 'Multiple choice: click an option, then press Answer.'),
        h('li', {}, 'Tick or cross: decide true or false for each statement.'),
        h('li', {}, 'Drag a notehead onto the stave, choosing a sharp, flat, natural or double accidental if needed. You can move it before you answer.'),
        h('li', {}, 'Type a number: digits only (use Tab to move between boxes).'),
        h('li', {}, 'Drop-down boxes, e.g. choosing I, II, IV or V for chords. Fill every box first.')),
      h('p', { class: 'muted small' }, 'The mock exams in this app use the same five kinds of question.')),
    h('div', { class: 'card stack' },
      h('h2', {}, 'Timing tips'),
      h('ul', {},
        h('li', {}, 'Two hours is plenty for most people: aim to finish in about 90 minutes and use the rest to check.'),
        h('li', {}, 'Section 3 (keys and scales) is worth 15 marks, the biggest section.'),
        h('li', {}, 'Stuck? Make your best guess and move on; there is no penalty for a wrong answer.'),
        h('li', {}, 'Check key signatures and clefs before naming any note or interval.'))),
    h('div', { class: 'card stack' }, h('h2', {}, 'Checklist'), list),
    h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#/mock' }, icon('mock', 'coin-icon'), 'Take a mock exam'), h('a', { class: 'btn', href: '#/practice/map' }, icon('map', 'coin-icon'), 'Check your weakest topics')));
}
