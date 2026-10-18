import { h } from '../dom.js';
import { getState } from '../state/store.js';
import { loadMocks } from '../questions/bank.js';
import { icon } from '../ui/icons.js';
import { band } from '../content/sections.js';

export function bandChip(score) {
  const b = band(score);
  const cls = b === 'Distinction' ? 'good' : b === 'Merit' ? 'accent' : b === 'Pass' ? 'warn' : 'bad';
  return h('span', { class: `chip ${cls}` }, b);
}

export default async function mockList() {
  const s = getState();
  const papers = await loadMocks();
  const best = (id) => s.mocks.filter((m) => m.paperId === id).reduce((b, m) => Math.max(b, m.score), -1);
  const inProgress = s.mockRun;
  const root = h('div', {},
    h('div', { class: 'page-head' },
      h('div', {}, h('div', { class: 'eyebrow' }, 'Exam practice'), h('h1', {}, 'Mock exams'),
        h('p', {}, 'Full papers just like the real online exam: 7 sections, 75 marks, 2 hours. Pass 50, Merit 60, Distinction 65.')),
      h('a', { class: 'btn primary big', href: `#/mock/new-${Date.now().toString(36)}` }, icon('refresh', 'coin-icon'), 'Generate a new mock')),
    inProgress ? h('div', { class: 'card resume-card row between' },
      h('div', {}, h('strong', {}, 'You have a mock in progress: '), inProgress.title),
      h('a', { class: 'btn primary', href: `#/mock/${inProgress.id}` }, 'Carry on')) : null,
    h('h2', { class: 'section-title' }, 'Fixed papers'),
    h('div', { class: 'grid cols-4' }, papers.map((p) => {
      const b = best(p.id);
      return h('a', { class: 'card lift paper-card', href: `#/mock/${p.id}` },
        h('div', { class: 'paper-icon', 'aria-hidden': 'true' }, icon('mock')),
        h('h3', {}, p.title),
        b >= 0 ? h('div', { class: 'row' }, h('span', { class: 'small muted' }, `Best ${b}/75`), bandChip(b)) : h('span', { class: 'small muted' }, 'Not tried yet'));
    })),
    h('h2', { class: 'section-title' }, 'History'),
    s.mocks.length ? historyTable(s.mocks) : h('div', { class: 'card empty-state' }, h('p', { class: 'muted', style: { margin: 0 } }, 'Your finished mocks will appear here, with scores for every section.')),
  );
  return root;
}

function historyTable(mocks) {
  const rows = mocks.slice().reverse().slice(0, 30);
  return h('div', { class: 'card table-card' }, h('table', { class: 'table' },
    h('thead', {}, h('tr', {}, h('th', {}, 'Date'), h('th', {}, 'Paper'), ...[1, 2, 3, 4, 5, 6, 7].map((n) => h('th', { class: 'num' }, `S${n}`)), h('th', { class: 'num' }, 'Total'), h('th', {}, 'Result'), h('th', {}, ''))),
    h('tbody', {}, rows.map((m) => h('tr', {},
      h('td', {}, new Date(m.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
      h('td', {}, m.title),
      ...m.sections.map((sec) => h('td', { class: 'num' }, `${fmt(sec.score)}/${sec.max}`)),
      h('td', { class: 'num' }, h('strong', {}, `${fmt(m.score)}/75`)),
      h('td', {}, bandChip(m.score)),
      h('td', {}, h('a', { href: `#/mock/review-${m.runId}` }, 'Review')))))));
}

const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
