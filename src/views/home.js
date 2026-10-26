import { petSVG } from '../game/pet-rig.js';
import { STICKERS } from '../state/stickers.js';
import { h, svgFromString } from '../dom.js';
import { getState, update } from '../state/store.js';
import { cleanName } from '../state/save.js';
import { SECTIONS, band } from '../content/sections.js';
import { LESSONS } from '../content/lessons/index.js';
import { topicsForSection, topicById } from '../questions/topics.js';
import { mastery, dayKey } from '../state/progress.js';
import { avatarSVG } from '../art/avatar.js';
import { icon, coinIcon } from '../ui/icons.js';

function greeting() {
  const hr = new Date().getHours();
  return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

function welcome() {
  const input = h('input', { type: 'text', id: 'profile-name', maxlength: 24, placeholder: 'Your name', autocomplete: 'off', 'aria-label': 'Your name' });
  const steps = [
    ['learn', 'Learn', '33 short lessons in exam order, with music you can hear.'],
    ['practice', 'Practise', '2,000+ exam-style questions with explanations.'],
    ['mock', 'Mock exams', 'Full 75-mark papers with a 2-hour timer.'],
    ['rewards', 'Rewards', 'Earn coins for your avatar and sticker bags.'],
  ];
  return h('div', { class: 'welcome card' },
    h('div', { class: 'welcome-art', 'aria-hidden': 'true' }, svgFromString(avatarSVG({}, { size: 150 }))),
    h('div', { class: 'eyebrow' }, 'Welcome'),
    h('h1', {}, 'Grade 5 Theory'),
    h('p', { class: 'muted' }, 'Everything you need for the Grade 5 music theory exam. Your progress is saved on this computer only.'),
    h('div', { class: 'welcome-steps' }, steps.map(([ic, t, d]) => h('div', { class: 'welcome-step' }, h('span', { class: 'quick-icon' }, icon(ic)), h('div', {}, h('strong', {}, t), h('div', { class: 'small muted' }, d))))),
    h('p', { style: { marginTop: '18px' } }, h('strong', {}, 'What should we call you?')),
    h('form', { class: 'row', onsubmit: (e) => {
      e.preventDefault();
      const name = cleanName(input.value);
      if (!name) { input.focus(); return; }
      update((s) => { s.profile.name = name; });
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } }, input, h('button', { class: 'btn primary', type: 'submit' }, "Let's go")));
}

/** The best next thing to do: unfinished lesson in the weakest area, else weakest topic. */
function suggestion(s) {
  const scored = [];
  for (const sec of SECTIONS) for (const t of topicsForSection(sec.id)) {
    const m = mastery(s, t.id);
    if (m !== null) scored.push({ t, m });
  }
  scored.sort((a, b) => a.m - b.m);
  const weak = scored.find((x) => x.m < 0.7);
  const nextLesson = LESSONS.find((l) => !s.lessons[l.id]?.done);
  if (weak) return { href: `#/practice/${weak.t.id}`, title: `Practise: ${weak.t.title}`, why: `Your weakest topic right now (${Math.round(weak.m * 100)}% recently).` };
  if (nextLesson) return { href: `#/learn/${nextLesson.id}`, title: `Lesson: ${nextLesson.title}`, why: nextLesson.summary };
  if (!s.mocks.length || Date.now() - s.mocks[s.mocks.length - 1].at > 3 * 86400000) return { href: '#/mock', title: 'Take a mock exam', why: 'All lessons done: test yourself under exam conditions.' };
  return { href: '#/practice/random', title: 'Random practice', why: 'Keep everything fresh with mixed questions.' };
}

export default async function home() {
  const s = getState();
  if (!s.profile.name) return h('div', {}, welcome());
  const nameEl = h('span', {});
  nameEl.textContent = s.profile.name;
  const sug = suggestion(s);
  const best = s.mocks.length ? Math.max(...s.mocks.map((m) => m.score)) : null;
  const nMistakes = Object.keys(s.mistakes).length;
  const dailyDone = s.daily.day === dayKey() && s.daily.done;
  const lessonsDone = LESSONS.filter((l) => s.lessons[l.id]?.done).length;

  const hero = h('div', { class: 'home-hero card' },
    h('a', { class: 'home-avatar', href: s.pet?.active ? '#/rewards/pet' : '#/rewards/avatar', 'aria-label': s.pet?.active ? 'Visit your pet' : 'Change your avatar' }, svgFromString(avatarSVG(s.avatar.equipped, { size: 128 })), s.pet?.active ? h('span', { class: 'home-pet' }, petSVG(s.pet.active, { size: 70, label: 'Your pet' })) : null),
    h('div', { class: 'home-hello' },
      h('div', { class: 'eyebrow' }, greeting()),
      h('h1', {}, 'Hi, ', nameEl, '!'),
      h('div', { class: 'row' },
        h('span', { class: 'chip coin-chip' }, coinIcon(), `${s.coins} coins`),
        h('span', { class: 'chip warn' }, icon('flame', 'coin-icon'), `${s.streak.count}-day streak`),
        h('span', { class: 'chip' }, `${lessonsDone}/${LESSONS.length} lessons`),
        best !== null ? h('span', { class: 'chip accent' }, `Best mock ${best}/75 · ${band(best)}`) : null)),
    h('div', { class: 'home-next' },
      h('div', { class: 'eyebrow' }, 'Suggested next step'),
      h('a', { class: 'btn primary big', href: sug.href }, sug.title, icon('arrow', 'coin-icon')),
      h('p', { class: 'small muted' }, sug.why),
      s.last ? h('a', { class: 'btn ghost small', href: s.last.href }, icon('refresh', 'coin-icon'), 'Continue: ', s.last.label) : null));

  const quick = h('div', { class: 'grid quick-grid' },
    tile('#/practice/daily', 'calendar', dailyDone ? 'Daily challenge ✓' : 'Daily challenge', dailyDone ? 'Done today. Back tomorrow!' : '5 questions · bonus coins'),
    tile('#/practice/random', 'shuffle', 'Random practice', 'Questions from everywhere'),
    tile('#/practice/mistakes', 'refresh', `Review mistakes${nMistakes ? ` (${nMistakes})` : ''}`, nMistakes ? 'Clear them for coins' : 'Nothing waiting'),
    tile('#/mock', 'mock', 'Mock exam', best === null ? 'Try your first paper' : `Best so far: ${best}/75`),
    tile('#/memorise/cards:terms-g5', 'memorise', 'Flashcards', 'Grade 5 terms and more'),
    tile('#/memorise/circle', 'refresh', 'Circle of fifths', 'Keys at a glance'),
    tile('#/rewards/bags', 'bag', 'Blind bags', `Collect all ${STICKERS.length} stickers`),
    tile('#/exam-day', 'calendar', 'Exam-day guide', 'Format, timing, checklist'));

  const sections = h('div', { class: 'grid cols-3' }, SECTIONS.map((sec) => {
    const lessons = LESSONS.filter((l) => l.section === sec.id);
    const done = lessons.filter((l) => s.lessons[l.id]?.done).length;
    const ms = topicsForSection(sec.id).map((t) => mastery(s, t.id)).filter((m) => m !== null);
    const strength = ms.length ? Math.round((ms.reduce((a, b) => a + b, 0) / ms.length) * 100) : null;
    return h('div', { class: 'card sec-card' },
      h('div', { class: 'row between' }, h('div', { class: 'eyebrow' }, `Section ${sec.id} · ${sec.marks} marks`), h('span', { class: 'sec-dot', style: { background: sec.colour } })),
      h('h3', {}, sec.title),
      h('div', { class: 'small muted' }, `Lessons ${done}/${lessons.length}`),
      h('div', { class: 'progress' }, h('span', { style: { width: `${(done / lessons.length) * 100}%`, background: sec.colour } })),
      h('div', { class: 'small muted', style: { marginTop: '8px' } }, strength === null ? 'Practice strength: not started' : `Practice strength: ${strength}%`),
      h('div', { class: 'progress' }, h('span', { style: { width: `${strength || 0}%` } })),
      h('div', { class: 'row', style: { marginTop: '12px' } },
        h('a', { class: 'btn small', href: `#/learn/${(lessons.find((l) => !s.lessons[l.id]?.done) || lessons[0]).id}` }, 'Learn'),
        h('a', { class: 'btn small', href: `#/practice/s${sec.id}` }, 'Practise')));
  }));

  return h('div', {}, hero,
    h('h2', { class: 'section-title' }, 'Quick start'), quick,
    h('h2', { class: 'section-title' }, 'Your progress by exam section'), sections);
}

function tile(href, ic, title, text) {
  return h('a', { class: 'card lift quick-card', href }, h('span', { class: 'quick-icon' }, icon(ic)), h('h3', {}, title), h('p', { class: 'small muted', style: { margin: 0 } }, text));
}

void topicById;
