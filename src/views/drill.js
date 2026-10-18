import { h, clear, toast, append } from '../dom.js';
import { getState, update } from '../state/store.js';
import { questionView } from '../questions/engine.js';
import { loadSection, loadAll } from '../questions/bank.js';
import { topicById, TOPICS, generate, pickTopic } from '../questions/topics.js';
import { recordAnswer, dayKey } from '../state/progress.js';
import { addCoins, ECONOMY } from '../state/rewards.js';
import { sectionById } from '../content/sections.js';
import { rng } from '../questions/util.js';
import { icon, coinIcon } from '../ui/icons.js';
import { sfx } from '../audio/synth.js';
import { listeningQuestion } from '../questions/gen-listening.js';

/** Build a question source for a practice mode. Returns { title, next(), size? } */
async function makeSource(mode) {
  const s = getState();
  const r = rng(Date.now() & 0xffffffff);
  const leastSeenFirst = (list) => r.shuffle(list).sort((a, b) => (s.qSeen[a.id]?.c || 0) - (s.qSeen[b.id]?.c || 0));
  const fromList = (list) => {
    let queue = leastSeenFirst(list);
    let i = 0;
    return () => { if (i >= queue.length) { queue = leastSeenFirst(list); i = 0; } return queue[i++]; };
  };
  if (mode === 'random') {
    const all = await loadAll();
    const bank = fromList(all);
    let n = 0;
    return { title: 'Random mode', sub: 'Questions from the whole syllabus, mixing the bank with freshly generated ones.', next: () => (n++ % 2 === 0 ? bank() : generate(pickTopic(r).id, `live-${Date.now()}-${n}`)) };
  }
  if (mode === 'mistakes') {
    const list = Object.values(s.mistakes).map((m) => m.q);
    let i = 0;
    return { title: 'Review mistakes', sub: 'Get each one right to clear it from the list.', size: list.length, next: () => list[i++] || null };
  }
  if (mode === 'tricky') {
    const all = (await loadAll()).filter((q) => q.tricky);
    return { title: 'Tricky set', sub: 'Key signatures in alto and tenor clefs, clef changes and transposing instruments.', next: fromList(all) };
  }
  if (mode === 'listening') {
    let n = 0;
    return { title: 'Listening practice', sub: 'Bonus practice for your ears. This is not part of the real exam.', next: () => listeningQuestion(rng(Date.now() + n++)) };
  }
  if (mode === 'daily') {
    const today = dayKey();
    const seed = Number(today.replace(/-/g, ''));
    const dr = rng(seed);
    const qs = [];
    for (let i = 0; i < 5; i++) qs.push(generate(pickTopic(dr).id, `daily-${today}-${i}`));
    let i = 0;
    return { title: 'Daily challenge', sub: 'Five questions, the same for everyone today. Bonus coins for finishing.', size: 5, daily: true, next: () => qs[i++] || null };
  }
  const secMatch = /^s(\d)$/.exec(mode);
  if (secMatch) {
    const sec = Number(secMatch[1]);
    const list = await loadSection(sec);
    const bank = fromList(list);
    const topics = TOPICS.filter((t) => t.section === sec);
    let n = 0;
    return { title: `Section ${sec}: ${sectionById(sec).title}`, next: () => (n++ % 3 === 2 ? generate(r.pick(topics).id, `live-${Date.now()}-${n}`) : bank()) };
  }
  const topic = topicById(mode);
  if (!topic) return null;
  const list = (await loadSection(topic.section)).filter((q) => q.topic === topic.id);
  const bank = fromList(list);
  let n = 0;
  return { title: topic.title, sectionId: topic.section, next: () => (n++ % 3 === 2 || !list.length ? generate(topic.id, `live-${Date.now()}-${n}`) : bank()) };
}

export default async function drill({ topic: mode }) {
  if (mode === 'map') return (await import('./mastery-map.js')).default();
  const src = await makeSource(mode);
  if (!src) return h('div', { class: 'card' }, h('h1', {}, 'Topic not found'), h('a', { href: '#/practice' }, 'Back to practice'));
  const s0 = getState();
  if (src.daily && s0.daily.day === dayKey() && s0.daily.done) {
    return h('div', { class: 'card empty-state' }, h('h1', {}, 'Daily challenge done!'), h('p', { class: 'muted' }, `You scored ${s0.daily.best}/5 today. A new challenge appears tomorrow.`), h('a', { class: 'btn primary', href: '#/practice' }, 'Back to practice'));
  }
  update((s) => { s.last = { href: `#/practice/${mode}`, label: src.title }; });
  let answered = 0, correct = 0, coinsEarned = 0, streak = 0;
  const stats = h('div', { class: 'drill-stats row' });
  const host = h('div', { class: 'drill-host card' });
  const root = h('div', { class: 'drill' },
    h('div', { class: 'page-head' },
      h('div', {}, h('a', { class: 'back-link', href: '#/practice' }, icon('back', 'coin-icon'), 'Practice'), h('h1', {}, src.title), src.sub ? h('p', {}, src.sub) : null),
      stats),
    host);
  const renderStats = () => {
    clear(stats);
    append(stats, [
      h('span', { class: 'chip' }, `${correct}/${answered} correct`),
      streak >= 3 ? h('span', { class: 'chip warn streak-chip' }, icon('flame', 'coin-icon'), `${streak} in a row`) : null,
      h('span', { class: 'chip coin-chip' }, coinIcon(), `+${coinsEarned}`),
      h('button', { class: 'btn small', onclick: finish }, 'Finish')]);
  };

  function finish() {
    clear(host);
    const pct = answered ? Math.round((correct / answered) * 100) : 0;
    let bonus = 0;
    if (src.daily) {
      update((s) => {
        if (!(s.daily.day === dayKey() && s.daily.done)) {
          bonus = addCoins(s, ECONOMY.dailyChallenge + (correct === 5 ? ECONOMY.dailyChallengePerfect : 0), 'daily');
          s.daily = { day: dayKey(), done: true, best: correct };
        }
      });
    }
    host.append(h('div', { class: 'empty-state' },
      h('div', { class: 'big-emoji', 'aria-hidden': 'true' }, pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'),
      h('h2', {}, answered ? `${correct} out of ${answered} (${pct}%)` : 'No questions answered'),
      h('p', { class: 'muted' }, answered ? (pct >= 80 ? 'Brilliant work!' : pct >= 50 ? 'Good going. Mistakes will come back in Review.' : 'Keep at it: every mistake is something new learned.') : ''),
      h('p', { class: 'coin' }, coinIcon(), `${coinsEarned + bonus} coins earned`),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('a', { class: 'btn', href: '#/practice' }, 'Back to practice'),
        src.daily ? null : h('button', { class: 'btn primary', onclick: () => { answered = correct = coinsEarned = streak = 0; renderStats(); nextQ(); } }, 'Keep going'))));
  }

  async function nextQ() {
    let q;
    try { q = await src.next(); } catch (e) { console.error(e); q = null; }
    if (!q) { finish(); return; }
    clear(host);
    const nextBtn = h('button', { class: 'btn primary big', 'data-action': 'next', onclick: () => nextQ() }, (src.size && answered >= src.size) ? 'See results' : 'Next question', icon('arrow', 'coin-icon'));
    const qv = questionView(q, {
      mode: 'practice',
      number: answered + 1,
      onAnswer: (result) => {
        answered++;
        if (result.correct) { correct++; streak++; sfx('correct'); } else { streak = 0; sfx('wrong'); }
        let earned = 0;
        update((s) => { earned = recordAnswer(s, q, result, mode === 'mistakes' ? 'mistakes' : src.daily ? 'daily' : 'practice'); });
        coinsEarned += earned;
        if (earned) coinPop(host, earned);
        if (streak === 5 || streak === 10 || streak === 20) toast(`${streak} in a row! Keep it up`, { icon: icon('flame', 'coin-icon') });
        renderStats();
        qv.append(h('div', { class: 'row q-next' }, nextBtn));
        if (src.size && answered >= src.size) nextBtn.onclick = finish;
        nextBtn.focus({ preventScroll: true });
        nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      },
    });
    host.append(qv);
    qv.focusFirst?.();
  }
  renderStats();
  nextQ();
  return root;
}

export function coinPop(host, n) {
  const el = h('div', { class: 'coin-pop', 'aria-hidden': 'true' }, coinIcon(), `+${n}`);
  host.append(el);
  setTimeout(() => el.remove(), 1200);
  sfx('coin');
}
