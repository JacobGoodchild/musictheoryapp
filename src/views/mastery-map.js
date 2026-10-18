import { h } from '../dom.js';
import { getState } from '../state/store.js';
import { SECTIONS } from '../content/sections.js';
import { topicsForSection } from '../questions/topics.js';
import { mastery } from '../state/progress.js';
import { icon } from '../ui/icons.js';

export default async function masteryMap() {
  const s = getState();
  const root = h('div', {},
    h('div', { class: 'page-head' }, h('div', {}, h('a', { class: 'back-link', href: '#/practice' }, icon('back', 'coin-icon'), 'Practice'), h('h1', {}, 'Mastery map'), h('p', {}, 'Your strength in every topic, from your recent answers. Tap a tile to practise it.'))),
    h('div', { class: 'legend row small muted' },
      h('span', {}, h('span', { class: 'swatch m-none' }), ' not started'),
      h('span', {}, h('span', { class: 'swatch m-low' }), ' needs work'),
      h('span', {}, h('span', { class: 'swatch m-mid' }), ' getting there'),
      h('span', {}, h('span', { class: 'swatch m-high' }), ' strong')),
  );
  for (const sec of SECTIONS) {
    root.append(h('h2', { class: 'section-title' }, `${sec.id}. ${sec.title}`));
    root.append(h('div', { class: 'map-grid' }, topicsForSection(sec.id).map((t) => {
      const m = mastery(s, t.id);
      const cls = m === null ? 'm-none' : m >= 0.8 ? 'm-high' : m >= 0.55 ? 'm-mid' : 'm-low';
      const word = m === null ? 'Not started' : `${Math.round(m * 100)}%`;
      return h('a', { class: `map-tile ${cls}`, href: `#/practice/${t.id}`, 'aria-label': `${t.title}: ${word}` },
        h('span', { class: 'map-title' }, t.title), h('span', { class: 'map-score' }, word));
    })));
  }
  return root;
}
