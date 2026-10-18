import { h, clear, confirmDialog } from '../dom.js';
import { getState, update, flush } from '../state/store.js';
import { loadMocks } from '../questions/bank.js';
import { questionView } from '../questions/engine.js';
import { mark, marksFor, isComplete } from '../questions/mark.js';
import { band, SECTIONS } from '../content/sections.js';
import { addCoins, mockReward } from '../state/rewards.js';
import { recordAnswer } from '../state/progress.js';
import { icon, coinIcon } from '../ui/icons.js';
import { bandChip } from './mock.js';
import { confetti } from '../ui/confetti.js';
import { sfx } from '../audio/synth.js';

const EXAM_SECONDS = 2 * 60 * 60;

async function loadPaper(id) {
  if (id.startsWith('new-')) {
    const { buildMock } = await import('../questions/mock-builder.js');
    return buildMock(id, 'Generated mock');
  }
  const papers = await loadMocks();
  return papers.find((p) => p.id === id) || null;
}

const flatQs = (paper) => paper.sections.flatMap((s) => s.questions.map((q) => ({ q, section: s.id })));

export default async function mockRun({ id }) {
  if (id.startsWith('review-')) return reviewView(id.slice(7));
  const paper = await loadPaper(id);
  if (!paper) return h('div', { class: 'card' }, h('h1', {}, 'Paper not found'), h('a', { href: '#/mock' }, 'Back to mocks'));
  const s = getState();
  const running = s.mockRun && s.mockRun.id === id ? s.mockRun : null;
  if (!running) return introView(paper, id);
  return examView(paper, id);
}

function introView(paper, id) {
  const s = getState();
  const other = s.mockRun && s.mockRun.id !== id ? s.mockRun : null;
  return h('div', { class: 'mock-intro' },
    h('a', { class: 'back-link', href: '#/mock' }, icon('back', 'coin-icon'), 'Mock exams'),
    h('div', { class: 'card', style: { maxWidth: '720px', padding: '32px' } },
      h('div', { class: 'eyebrow' }, 'Mock exam'),
      h('h1', {}, paper.title),
      h('ul', { class: 'intro-list' },
        h('li', {}, '7 sections, 75 marks. You have 2 hours; the timer counts down.'),
        h('li', {}, 'Choose or place your answer, then press Answer to save it. You can change an answer any time before you finish.'),
        h('li', {}, 'Use the question numbers at the top to move around, and the flag to mark questions to come back to.'),
        h('li', {}, 'Your results come at the end: section scores, your band, and a full review with explanations.'),
        h('li', {}, 'Pass 50–59 · Merit 60–64 · Distinction 65–75.')),
      other ? h('p', { class: 'chip warn' }, `Starting this will end your unfinished mock (${other.title}).`) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary big', 'data-action': 'start', onclick: () => {
          update((st) => { st.mockRun = { id, title: paper.title, startedAt: Date.now(), responses: {}, flags: {}, current: 0 }; });
          flush();
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } }, 'Start the exam'),
        h('a', { class: 'btn', href: '#/mock' }, 'Not now'))));
}

function examView(paper, id) {
  const items = flatQs(paper);
  const s = getState();
  const run = s.mockRun;
  let current = Math.min(run.current || 0, items.length - 1);
  const timerEl = h('span', { class: 'timer', role: 'timer', 'aria-live': 'off' });
  const nav = h('div', { class: 'q-nav', role: 'navigation', 'aria-label': 'Questions' });
  const host = h('div', { class: 'card mock-host' });
  const sectionLabel = h('div', { class: 'eyebrow' });
  const finishBtn = h('button', { class: 'btn danger', onclick: () => finish(false) }, 'Finish exam');
  const root = h('div', { class: 'mock-run' },
    h('div', { class: 'mock-bar card' },
      h('div', { class: 'row between' },
        h('div', {}, h('strong', {}, paper.title), h('span', { class: 'muted small' }, ` · ${items.length} questions · 75 marks`)),
        h('div', { class: 'row' }, h('span', { class: 'chip timer-chip' }, icon('clock', 'coin-icon'), timerEl), finishBtn)),
      nav),
    sectionLabel, host);

  const remaining = () => Math.max(0, EXAM_SECONDS - Math.floor((Date.now() - run.startedAt) / 1000));
  let mounted = false;
  const tick = () => {
    if (document.body.contains(root)) mounted = true;
    else if (mounted) { clearInterval(timer); return; }
    const r = remaining();
    const hh = Math.floor(r / 3600), mm = Math.floor((r % 3600) / 60), ss = r % 60;
    timerEl.textContent = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    timerEl.parentElement?.classList.toggle('low', r < 600);
    if (r <= 0) { clearInterval(timer); finish(true); }
  };
  const timer = setInterval(tick, 1000);
  tick();

  function renderNav() {
    clear(nav);
    let lastSec = 0;
    items.forEach((it, i) => {
      if (it.section !== lastSec) { nav.append(h('span', { class: 'nav-sec', title: SECTIONS[it.section - 1].title }, `S${it.section}`)); lastSec = it.section; }
      const answered = getState().mockRun.responses[it.q.id] !== undefined;
      const flagged = getState().mockRun.flags[it.q.id];
      nav.append(h('button', { class: `q-dot${answered ? ' answered' : ''}${flagged ? ' flagged' : ''}${i === current ? ' current' : ''}`, 'aria-label': `Question ${i + 1}${answered ? ', answered' : ''}${flagged ? ', flagged' : ''}`, 'aria-current': i === current ? 'step' : undefined, onclick: () => go(i) }, String(i + 1)));
    });
  }

  function go(i) {
    current = Math.max(0, Math.min(items.length - 1, i));
    update((st) => { st.mockRun.current = current; });
    render();
  }

  function render() {
    renderNav();
    clear(host);
    const { q, section } = items[current];
    sectionLabel.textContent = `Section ${section}: ${SECTIONS[section - 1].title} (${SECTIONS[section - 1].marks} marks)`;
    const saved = getState().mockRun.responses[q.id];
    const flagged = getState().mockRun.flags[q.id];
    const qv = questionView(q, {
      mode: 'mock', number: current + 1, response: saved,
      onAnswer: (_res, resp) => {
        update((st) => { st.mockRun.responses[q.id] = resp; });
        renderNav();
      },
    });
    host.append(qv,
      h('div', { class: 'row between mock-foot' },
        h('button', { class: 'btn', disabled: current === 0, onclick: () => go(current - 1) }, icon('back', 'coin-icon'), 'Previous'),
        h('button', { class: `btn ghost${flagged ? ' flag-on' : ''}`, 'aria-pressed': String(Boolean(flagged)), onclick: () => { update((st) => { st.mockRun.flags[q.id] = !st.mockRun.flags[q.id]; }); render(); } }, flagged ? '⚑ Flagged' : '⚐ Flag for later'),
        current < items.length - 1
          ? h('button', { class: 'btn primary', 'data-action': 'next-q', onclick: () => go(current + 1) }, 'Next', icon('arrow', 'coin-icon'))
          : h('button', { class: 'btn primary', onclick: () => finish(false) }, 'Finish exam')));
  }

  async function finish(timeUp) {
    const st = getState();
    const unanswered = items.filter((it) => st.mockRun.responses[it.q.id] === undefined).length;
    if (!timeUp) {
      const ok = await confirmDialog('Finish the exam?', unanswered ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Unanswered questions score 0.` : 'All questions answered. Ready to see your result?', { ok: 'Finish and mark', cancel: 'Keep going' });
      if (!ok) return;
    }
    clearInterval(timer);
    const result = scorePaper(paper, st.mockRun.responses);
    const runId = `${Date.now().toString(36)}`;
    let coins = 0;
    update((s2) => {
      const prev = s2.mocks.length ? Math.max(...s2.mocks.map((m) => m.score)) : null;
      coins = addCoins(s2, mockReward(result.score, band(result.score), prev), 'mocks');
      for (const it of items) {
        const resp = s2.mockRun.responses[it.q.id];
        if (resp !== undefined) recordAnswer(s2, it.q, mark(it.q, resp), 'mock');
      }
      s2.mocks.push({ runId, paperId: paper.id.startsWith('new-') ? null : paper.id, seed: paper.id, title: paper.title, at: Date.now(), score: result.score, band: band(result.score), sections: result.sections, seconds: Math.min(EXAM_SECONDS, Math.floor((Date.now() - s2.mockRun.startedAt) / 1000)), responses: s2.mockRun.responses });
      s2.mockRun = null;
    });
    flush();
    try { sessionStorage.setItem('g5.justFinished', JSON.stringify({ runId, coins, timeUp })); } catch { /* ignore */ }
    location.hash = `#/mock/review-${runId}`;
  }

  render();
  return root;
}

export function scorePaper(paper, responses) {
  const sections = paper.sections.map((sec) => {
    let score = 0;
    for (const q of sec.questions) {
      const r = responses[q.id];
      if (r !== undefined && isComplete(q, r)) score += mark(q, r).score;
    }
    return { id: sec.id, score: Math.round(score * 10) / 10, max: sec.marks };
  });
  const score = Math.round(sections.reduce((a, s) => a + s.score, 0) * 10) / 10;
  return { score, sections };
}

async function reviewView(runId) {
  const s = getState();
  const rec = s.mocks.find((m) => m.runId === runId);
  if (!rec) return h('div', { class: 'card' }, h('h1', {}, 'Result not found'), h('a', { href: '#/mock' }, 'Back to mocks'));
  const paper = await loadPaper(rec.seed);
  let just = null;
  try { just = JSON.parse(sessionStorage.getItem('g5.justFinished') || 'null'); } catch { /* ignore */ }
  if (just && just.runId === runId) sessionStorage.removeItem('g5.justFinished'); else just = null;
  const b = band(rec.score);
  const head = h('div', { class: `card result-hero band-${b.split(' ')[0].toLowerCase()}` },
    h('div', { class: 'eyebrow' }, `${rec.title} · ${new Date(rec.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`),
    h('div', { class: 'result-score' }, h('span', { class: 'big' }, fmt(rec.score)), h('span', { class: 'of' }, '/75')),
    h('div', { class: 'row', style: { justifyContent: 'center' } }, bandChip(rec.score), h('span', { class: 'chip' }, `${Math.round((rec.score / 75) * 100)}%`), h('span', { class: 'chip' }, icon('clock', 'coin-icon'), `${Math.floor(rec.seconds / 60)} min`)),
    just ? h('p', { class: 'coin', style: { justifyContent: 'center', marginTop: '12px' } }, coinIcon(), `+${just.coins} coins`) : null,
    just?.timeUp ? h('p', { class: 'chip warn' }, 'Time ran out, so the paper was marked automatically.') : null,
    h('p', { class: 'muted' }, resultMessage(rec.score)));
  const table = h('div', { class: 'card' }, h('h2', {}, 'Section scores'),
    h('div', { class: 'section-bars' }, rec.sections.map((sec) => h('div', { class: 'section-bar' },
      h('div', { class: 'row between' }, h('span', {}, `${sec.id}. ${SECTIONS[sec.id - 1].title}`), h('strong', {}, `${fmt(sec.score)}/${sec.max}`)),
      h('div', { class: 'progress' }, h('span', { style: { width: `${(sec.score / sec.max) * 100}%`, background: SECTIONS[sec.id - 1].colour } }))))));
  const reviewHost = h('div', { class: 'stack' });
  const root = h('div', {}, h('a', { class: 'back-link', href: '#/mock' }, icon('back', 'coin-icon'), 'Mock exams'), head, table,
    h('div', { class: 'row between section-title' }, h('h2', { style: { margin: 0 } }, 'Review every question'),
      h('label', { class: 'row small' }, h('input', { type: 'checkbox', id: 'only-wrong', onchange: (e) => renderReview(e.target.checked) }), 'Show only questions I got wrong')),
    reviewHost);
  function renderReview(onlyWrong) {
    clear(reviewHost);
    if (!paper) { reviewHost.append(h('p', { class: 'muted' }, 'This paper could not be loaded for review.')); return; }
    let n = 0;
    for (const sec of paper.sections) {
      reviewHost.append(h('h3', { class: 'section-title' }, `Section ${sec.id}: ${SECTIONS[sec.id - 1].title}`));
      for (const q of sec.questions) {
        n++;
        const resp = rec.responses[q.id];
        const res = resp !== undefined ? mark(q, resp) : { correct: false, score: 0, max: marksFor(q) };
        if (onlyWrong && res.correct) continue;
        const card = h('div', { class: 'card review-card' });
        if (resp === undefined) card.append(h('p', { class: 'chip bad' }, 'Not answered'));
        card.append(resp === undefined ? questionView(q, { mode: 'review', number: n, response: undefined }) : questionView(q, { mode: 'review', number: n, response: resp }));
        reviewHost.append(card);
      }
    }
  }
  renderReview(false);
  if (just && b === 'Distinction') setTimeout(() => { confetti(); sfx('reveal'); }, 300);
  return root;
}

function resultMessage(score) {
  if (score >= 65) return 'Distinction! Outstanding work. You are exam-ready.';
  if (score >= 60) return `Merit. Just ${65 - score} more mark${65 - score === 1 ? '' : 's'} for a Distinction.`;
  if (score >= 50) return `A pass. ${60 - score} more mark${60 - score === 1 ? '' : 's'} for a Merit. Check your weakest section below.`;
  return `Not a pass yet: ${50 - score} more mark${50 - score === 1 ? '' : 's'} needed. Look at the review and practise your weakest sections.`;
}
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
