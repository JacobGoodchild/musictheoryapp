import { h } from '../dom.js';
import { getState } from '../state/store.js';
import { SECTIONS } from '../content/sections.js';
import { LESSONS } from '../content/lessons/index.js';
import { icon } from '../ui/icons.js';

export default async function learn() {
  const s = getState();
  const done = LESSONS.filter((l) => s.lessons[l.id]?.done).length;
  const next = LESSONS.find((l) => !s.lessons[l.id]?.done);
  const root = h('div', {},
    h('div', { class: 'page-head' },
      h('div', {}, h('div', { class: 'eyebrow' }, 'Learn'), h('h1', {}, 'Lessons'),
        h('p', {}, 'Short lessons in exam order. "Refresh" lessons recap Grades 1–4, which are all still examinable.')),
      h('div', { class: 'stack', style: { minWidth: '240px' } },
        h('div', { class: 'row between small' }, h('span', {}, `${done} of ${LESSONS.length} lessons done`), h('strong', {}, `${Math.round((done / LESSONS.length) * 100)}%`)),
        h('div', { class: 'progress' }, h('span', { style: { width: `${(done / LESSONS.length) * 100}%` } })),
        next ? h('a', { class: 'btn primary', href: `#/learn/${next.id}` }, 'Next lesson: ', next.title) : null)));
  for (const sec of SECTIONS) {
    const list = LESSONS.filter((l) => l.section === sec.id);
    root.append(h('h2', { class: 'section-title' }, h('span', { class: 'sec-dot', style: { background: sec.colour } }), `${sec.id}. ${sec.title}`),
      h('div', { class: 'grid cols-3' }, list.map((l) => {
        const st = s.lessons[l.id];
        return h('a', { class: `card lift lesson-card${st?.done ? ' done' : ''}`, href: `#/learn/${l.id}` },
          h('div', { class: 'row between' },
            h('span', { class: 'lesson-glyph', style: { background: sec.colour }, 'aria-hidden': 'true' }, l.glyph || sec.glyph),
            st?.done ? h('span', { class: 'chip good' }, icon('check', 'coin-icon'), st.perfect ? 'Perfect' : 'Done') : l.refresh ? h('span', { class: 'chip' }, 'Refresh') : l.isNew ? h('span', { class: 'chip accent' }, 'New at Grade 5') : null),
          h('h3', {}, l.title),
          h('p', { class: 'small muted', style: { margin: 0 } }, l.summary));
      })));
  }
  return root;
}
