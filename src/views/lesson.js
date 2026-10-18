import { h, clear } from '../dom.js';
import { getState, update } from '../state/store.js';
import { LESSONS } from '../content/lessons/index.js';
import { sectionById } from '../content/sections.js';
import { renderMusic } from '../notation/render.js';
import { questionView } from '../questions/engine.js';
import { generate } from '../questions/topics.js';
import { completeLesson, recordAnswer } from '../state/progress.js';
import { playQuestionAudio, sfx } from '../audio/synth.js';
import { icon, coinIcon } from '../ui/icons.js';
import { coinPop } from './drill.js';

/** Tiny safe markup: **bold**, *italic*, built with DOM nodes (never innerHTML). */
export function rich(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    out.push(t.startsWith('**') ? h('strong', {}, t.slice(2, -2)) : h('em', {}, t.slice(1, -1)));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function music(spec, caption, audio) {
  const fig = h('figure', { class: 'lesson-music' });
  const div = h('div', {});
  fig.append(div);
  renderMusic(div, spec).catch((e) => { div.textContent = 'Could not draw music.'; console.error(e); });
  if (caption || audio) {
    fig.append(h('figcaption', { class: 'row' }, caption ? h('span', {}, ...rich(caption)) : null,
      audio ? h('button', { class: 'btn small', onclick: () => playQuestionAudio(audio), 'aria-label': `Hear it${caption ? ': ' + caption : ''}` }, icon('speaker', 'coin-icon'), 'Hear it') : null));
  }
  return fig;
}

export function renderBlock(b) {
  switch (b.type) {
    case 'intro': return h('p', { class: 'lesson-intro' }, ...rich(b.text));
    case 'text': return h('div', { class: 'lesson-text' }, (Array.isArray(b.text) ? b.text : [b.text]).map((t) => h('p', {}, ...rich(t))));
    case 'heading': return h('h2', { class: 'lesson-h' }, b.text);
    case 'music': return music(b.music, b.caption, b.audio);
    case 'musicRow': return h('div', { class: 'music-row' }, b.items.map((it) => music(it.music, it.caption, it.audio)));
    case 'hear': return h('div', { class: 'hear-row' }, b.items.map((it) => h('button', { class: 'btn', onclick: () => playQuestionAudio(it.audio) }, icon('speaker', 'coin-icon'), it.label)));
    case 'worked': return h('div', { class: 'worked card' },
      h('div', { class: 'worked-head' }, h('span', { class: 'chip accent' }, 'Worked example'), h('h3', {}, b.title)),
      h('ol', { class: 'steps' }, b.steps.map((st) => h('li', {}, h('p', {}, ...rich(st.text)), st.music ? music(st.music, st.caption, st.audio) : null))));
    case 'keypoints': return box('Key points', 'star', 'kp', b.items);
    case 'mistakes': return box('Common mistakes', 'cross', 'mistake', b.items);
    case 'memorise': return box('Things to memorise', 'memorise', 'memo', b.items);
    case 'tip': return h('div', { class: 'tip' }, h('strong', {}, 'Tip: '), ...rich(b.text));
    case 'table': return h('div', { class: 'table-card card' }, h('table', { class: 'table' },
      b.head ? h('thead', {}, h('tr', {}, b.head.map((c) => h('th', {}, c)))) : null,
      h('tbody', {}, b.rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, ...rich(String(c)))))))));
    default: return null;
  }
}

function box(title, ic, cls, items) {
  return h('div', { class: `lesson-box ${cls}` }, h('h3', {}, icon(ic, 'coin-icon'), title), h('ul', {}, items.map((i) => h('li', {}, ...rich(i)))));
}

export function lessonCheckQuestions(lesson) {
  const topics = lesson.check?.topics || [];
  const n = lesson.check?.count || 6;
  const qs = [];
  for (let i = 0; i < n && topics.length; i++) {
    const t = topics[i % topics.length];
    try { qs.push(generate(t, `lesson-${lesson.id}-${i}`, lesson.check.difficulty || (i < 2 ? 1 : 2))); } catch (e) { console.error(e); }
  }
  return qs;
}

export default async function lessonView({ id }) {
  const idx = LESSONS.findIndex((l) => l.id === id);
  const lesson = LESSONS[idx];
  if (!lesson) return h('div', { class: 'card' }, h('h1', {}, 'Lesson not found'), h('a', { href: '#/learn' }, 'All lessons'));
  const sec = sectionById(lesson.section);
  update((s) => { s.last = { href: `#/learn/${id}`, label: lesson.title }; });
  const next = LESSONS[idx + 1];
  const prev = LESSONS[idx - 1];
  const root = h('article', { class: 'lesson' },
    h('a', { class: 'back-link', href: '#/learn' }, icon('back', 'coin-icon'), 'All lessons'),
    h('header', { class: 'lesson-head' },
      h('span', { class: 'lesson-glyph big', style: { background: sec.colour }, 'aria-hidden': 'true' }, lesson.glyph || sec.glyph),
      h('div', {}, h('div', { class: 'eyebrow' }, `Section ${sec.id} · ${sec.title}${lesson.refresh ? ' · Refresh' : lesson.isNew ? ' · New at Grade 5' : ''}`), h('h1', {}, lesson.title))),
    ...lesson.blocks.map(renderBlock));

  // End-of-lesson check
  const qs = lessonCheckQuestions(lesson);
  if (qs.length) {
    const checkHost = h('div', { class: 'lesson-check card' });
    root.append(h('h2', { class: 'lesson-h' }, 'Check your understanding'), checkHost);
    let i = 0, right = 0;
    const showQ = () => {
      clear(checkHost);
      if (i >= qs.length) {
        let coins = 0;
        const perfect = right === qs.length;
        update((s) => { coins = completeLesson(s, lesson.id, perfect); });
        if (coins) coinPop(checkHost, coins);
        if (perfect) sfx('reveal');
        checkHost.append(h('div', { class: 'empty-state' },
          h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, perfect ? '🏆' : right >= qs.length / 2 ? '✅' : '📘'),
          h('h2', {}, `${right} out of ${qs.length}`),
          h('p', { class: 'muted' }, perfect ? 'Perfect! Lesson complete.' : 'Lesson complete. Anything you missed will come back in Review mistakes.'),
          coins ? h('p', { class: 'coin', style: { justifyContent: 'center' } }, coinIcon(), `+${coins} coins`) : null,
          h('div', { class: 'row' },
            h('button', { class: 'btn', onclick: () => { i = 0; right = 0; showQ(); } }, 'Try again'),
            next ? h('a', { class: 'btn primary', href: `#/learn/${next.id}` }, 'Next lesson', icon('arrow', 'coin-icon')) : h('a', { class: 'btn primary', href: '#/practice' }, 'Go to practice'))));
        return;
      }
      const q = qs[i];
      const nextBtn = h('button', { class: 'btn primary', 'data-action': 'next', onclick: () => { i++; showQ(); } }, i === qs.length - 1 ? 'Finish' : 'Next question', icon('arrow', 'coin-icon'));
      const qv = questionView(q, { mode: 'practice', number: i + 1, onAnswer: (res) => {
        if (res.correct) { right++; sfx('correct'); } else sfx('wrong');
        let c = 0;
        update((s) => { c = recordAnswer(s, q, res, 'lesson'); });
        if (c) coinPop(checkHost, c);
        qv.append(h('div', { class: 'row q-next' }, nextBtn));
        nextBtn.focus({ preventScroll: true });
      } });
      checkHost.append(h('div', { class: 'small muted', style: { marginBottom: '8px' } }, `Question ${i + 1} of ${qs.length}`), qv);
    };
    showQ();
  }
  root.append(h('nav', { class: 'lesson-nav row between' },
    prev ? h('a', { class: 'btn', href: `#/learn/${prev.id}` }, icon('back', 'coin-icon'), prev.title) : h('span', {}),
    next ? h('a', { class: 'btn', href: `#/learn/${next.id}` }, next.title, icon('arrow', 'coin-icon')) : h('span', {})));
  return root;
}
