import { h } from '../dom.js';
import { getState } from '../state/store.js';
import { SECTIONS } from '../content/sections.js';
import { topicsForSection } from '../questions/topics.js';
import { mastery } from '../state/progress.js';
import { icon } from '../ui/icons.js';

export function masteryChip(m) {
  if (m === null || m === undefined) return h('span', { class: 'chip' }, 'Not started');
  const pct = Math.round(m * 100);
  const cls = pct >= 80 ? 'good' : pct >= 55 ? 'warn' : 'bad';
  const word = pct >= 80 ? 'Strong' : pct >= 55 ? 'Getting there' : 'Needs work';
  return h('span', { class: `chip ${cls}`, title: `${pct}% recent accuracy` }, `${word} · ${pct}%`);
}

export default async function practice() {
  const s = getState();
  const nMistakes = Object.keys(s.mistakes).length;
  const root = h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('div', { class: 'eyebrow' }, 'Exam practice'), h('h1', {}, 'Practice'), h('p', {}, 'Drill one topic, a whole section, or everything at random. Every answer comes with an explanation.'))),
    h('div', { class: 'grid cols-4' },
      quick('#/practice/random', 'shuffle', 'Random mode', 'Unlimited questions from the whole syllabus'),
      quick('#/practice/mistakes', 'refresh', `Review mistakes${nMistakes ? ` (${nMistakes})` : ''}`, nMistakes ? 'Questions you got wrong come back until you get them right' : 'Nothing to review yet: nice!', !nMistakes),
      quick('#/practice/tricky', 'bolt', 'Tricky set', 'Extra-hard key signature, clef and transposition questions'),
      quick('#/practice/listening', 'ear', 'Listening practice', 'Bonus: hear intervals, chords and cadences (not in the real exam)'),
      quick('#/practice/daily', 'calendar', 'Daily challenge', s.daily.day === todayKey() && s.daily.done ? 'Done today ✓ Come back tomorrow' : '5 questions, bonus coins'),
      quick('#/practice/map', 'map', 'Mastery map', 'See your strength in every topic'),
    ),
  );
  for (const sec of SECTIONS) {
    const topics = topicsForSection(sec.id);
    root.append(h('div', { class: 'section-block' },
      h('div', { class: 'row between section-title' },
        h('h2', { style: { margin: 0 } }, h('span', { class: 'sec-dot', style: { background: sec.colour } }), `${sec.id}. ${sec.title}`),
        h('a', { class: 'btn small', href: `#/practice/s${sec.id}` }, 'Practise whole section', icon('arrow', 'coin-icon'))),
      h('div', { class: 'grid cols-3' }, topics.map((t) => h('a', { class: 'card lift topic-card', href: `#/practice/${t.id}` },
        h('h3', {}, t.title),
        h('div', { class: 'row' }, masteryChip(mastery(s, t.id)), s.topics[t.id] ? h('span', { class: 'tiny muted' }, `${s.topics[t.id].seen} answered`) : null)))),
    ));
  }
  return root;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function quick(href, ic, title, text, disabled = false) {
  return h('a', { class: `card lift quick-card${disabled ? ' is-disabled' : ''}`, href: disabled ? undefined : href, 'aria-disabled': disabled ? 'true' : undefined },
    h('span', { class: 'quick-icon' }, icon(ic)), h('h3', {}, title), h('p', { class: 'small muted', style: { margin: 0 } }, text));
}
