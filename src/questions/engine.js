// Question UI: renders any question type, collects a response, shows feedback.
import { h, clear } from '../dom.js';
import { renderMusic } from '../notation/render.js';
import { mark, isComplete, marksFor, answerText, placedPitch } from './mark.js';
import { icon } from '../ui/icons.js';
import { pitchAtStaffPos, toString as pitchStr, describeStaffPos } from '../theory/pitch.js';
import { playQuestionAudio } from '../audio/synth.js';

const ACC_BUTTONS = [
  { acc: null, label: 'None', aria: 'no accidental' },
  { acc: 0, label: '♮', aria: 'natural' },
  { acc: 1, label: '♯', aria: 'sharp' },
  { acc: -1, label: '♭', aria: 'flat' },
  { acc: 2, label: '𝄪', aria: 'double sharp' },
  { acc: -2, label: '𝄫', aria: 'double flat' },
];

function musicBlock(spec, cls = '') {
  const div = h('div', { class: `q-music ${cls}` });
  div.ready = renderMusic(div, spec).catch((e) => { div.textContent = 'Could not draw music.'; console.error(e); });
  return div;
}

/**
 * Build the view for one question.
 * opts.mode: 'practice' (feedback straight away) | 'mock' (no feedback; answer saved) | 'review' (show response + feedback)
 * opts.onAnswer(result, response) is called when Answer is pressed.
 */
export function questionView(q, opts = {}) {
  const mode = opts.mode || 'practice';
  let response = opts.response !== undefined ? structuredClone(opts.response) : initialResponse(q);
  let locked = mode === 'review';
  const root = h('div', { class: `question q-${q.type}`, 'data-qid': q.id, 'data-type': q.type });
  const answerBtn = h('button', { class: 'btn primary big', 'data-action': 'answer', disabled: true, onclick: () => submit() }, mode === 'mock' ? 'Save answer' : 'Answer');
  const feedback = h('div', { class: 'q-feedback', 'aria-live': 'polite' });
  const refreshers = [];

  const update = () => {
    const ok = isComplete(q, response);
    answerBtn.disabled = !ok || locked;
    for (const f of refreshers) f();
  };

  // Header
  const head = h('div', { class: 'q-head' },
    opts.number ? h('span', { class: 'chip accent' }, `Question ${opts.number}`) : null,
    q.listening ? h('span', { class: 'chip warn' }, icon('ear', 'coin-icon'), 'Listening practice') : null,
    h('span', { class: 'chip' }, `${marksFor(q)} mark${marksFor(q) > 1 ? 's' : ''}`),
  );
  const prompt = h('div', { class: 'q-prompt' });
  for (const para of String(q.prompt).split('\n')) prompt.append(h('p', {}, para));
  root.append(head, prompt);
  if (q.audio) {
    root.append(h('div', { class: 'row' }, h('button', { class: 'btn', 'data-action': 'play', onclick: () => playQuestionAudio(q.audio) }, icon('play', 'coin-icon'), 'Play')));
  }
  if (q.music) root.append(musicBlock(q.music));

  // Body by type
  const body = h('div', { class: 'q-body' });
  root.append(body);
  switch (q.type) {
    case 'mcq': buildMcq(); break;
    case 'truefalse': buildTrueFalse(); break;
    case 'place': buildPlace(); break;
    case 'number': buildNumber(); break;
    case 'dropdown': buildDropdown(); break;
    default: body.append(h('p', {}, 'Unknown question type'));
  }
  const actions = h('div', { class: 'q-actions row' }, mode !== 'review' ? answerBtn : null);
  root.append(actions, feedback);
  update();
  if (mode === 'review') showFeedback(mark(q, response));

  function buildMcq() {
    const list = h('div', { class: `q-options ${q.options.some((o) => o.music) ? 'with-music' : ''}`, role: 'radiogroup', 'aria-label': 'Options' });
    q.options.forEach((opt, i) => {
      const btn = h('button', { class: 'q-option', role: 'radio', 'aria-checked': 'false', 'data-index': i, onclick: () => { if (locked) return; response = i; update(); } },
        h('span', { class: 'q-letter', 'aria-hidden': 'true' }, String.fromCharCode(65 + i)),
        h('span', { class: 'q-option-body' }, opt.music ? musicBlock(opt.music, 'small') : null, opt.label ? h('span', { class: 'q-option-label' }, opt.label) : null));
      if (opt.music && !opt.label) btn.setAttribute('aria-label', opt.aria || `Option ${String.fromCharCode(65 + i)}`);
      list.append(btn);
    });
    // Arrow-key navigation within the radio group.
    list.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key) || locked) return;
      e.preventDefault();
      const n = q.options.length;
      const cur = Number.isInteger(response) ? response : -1;
      response = (cur + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : n - 1)) % n;
      update();
      list.children[response].focus();
    });
    refreshers.push(() => {
      [...list.children].forEach((b, i) => { b.setAttribute('aria-checked', String(response === i)); b.classList.toggle('selected', response === i); b.tabIndex = (response === i || (!Number.isInteger(response) && i === 0)) ? 0 : -1; });
    });
    body.append(list);
  }

  function buildTrueFalse() {
    const list = h('div', { class: 'q-tf' });
    q.statements.forEach((s, i) => {
      const yes = h('button', { class: 'tf-btn', 'aria-label': `True: ${s.text}`, 'data-tf': 'true', onclick: () => { if (locked) return; response[i] = true; update(); } }, icon('check', 'coin-icon'));
      const no = h('button', { class: 'tf-btn', 'aria-label': `False: ${s.text}`, 'data-tf': 'false', onclick: () => { if (locked) return; response[i] = false; update(); } }, icon('cross', 'coin-icon'));
      const row = h('div', { class: 'tf-row' }, h('span', { class: 'tf-text' }, s.text), h('span', { class: 'tf-btns' }, yes, no));
      list.append(row);
      refreshers.push(() => {
        yes.setAttribute('aria-pressed', String(response[i] === true));
        no.setAttribute('aria-pressed', String(response[i] === false));
      });
    });
    body.append(h('p', { class: 'small muted' }, 'Tick the true statements and cross the false ones.'), list);
  }

  function buildNumber() {
    const wrap = h('div', { class: 'q-numbers row' });
    q.numbers.forEach((n, i) => {
      const input = h('input', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: 3, class: 'num-input', 'aria-label': n.label || `Answer ${i + 1}`, value: response[i] ?? '' });
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
        response[i] = input.value;
        update();
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !answerBtn.disabled) submit(); });
      if (locked) input.disabled = true;
      wrap.append(h('label', { class: 'num-label' }, n.label ? h('span', {}, n.label) : null, input));
    });
    body.append(wrap, h('p', { class: 'tiny muted' }, 'Digits only. Tab moves between boxes.'));
  }

  function buildDropdown() {
    const wrap = h('div', { class: 'q-dropdowns row' });
    q.dropdowns.forEach((d, i) => {
      const sel = h('select', { 'aria-label': d.label || `Box ${i + 1}`, 'data-index': i },
        h('option', { value: '' }, '—'), d.options.map((o) => h('option', { value: o, selected: response[i] === o }, o)));
      sel.addEventListener('change', () => { response[i] = sel.value; update(); });
      if (locked) sel.disabled = true;
      wrap.append(h('label', { class: 'dd-label' }, d.label ? h('span', {}, d.label) : null, sel));
    });
    body.append(wrap);
  }

  function buildPlace() {
    const place = q.place;
    const range = place.range || [-5, 13];
    let acc = response?.acc ?? null;
    let hoverPos = null;
    const staveHost = h('div', { class: 'place-stave', tabindex: 0, role: 'application', 'aria-label': 'Stave. Click or drag to place the note. Use the up and down arrow keys to move it, and the accidental buttons to change it.' });
    const status = h('div', { class: 'small muted place-status', 'aria-live': 'polite' }, 'Drag the notehead onto the stave, or click where it should go.');
    const accRow = h('div', { class: 'acc-row', role: 'group', 'aria-label': 'Accidental' });
    const chip = h('div', { class: 'notehead-chip', draggable: 'false', title: 'Drag me onto the stave', 'aria-hidden': 'true' }, h('span', { class: 'nh' }));
    ACC_BUTTONS.forEach((b) => {
      const btn = h('button', { class: 'acc-btn', 'aria-label': b.aria, 'data-acc': String(b.acc), onclick: () => { if (locked) return; acc = b.acc; if (response) { response.acc = acc; } draw(); update(); } }, b.label);
      accRow.append(btn);
    });
    const toolbar = h('div', { class: 'place-toolbar row' }, chip, h('span', { class: 'small muted' }, 'Accidental:'), accRow);
    body.append(toolbar, staveHost, status);

    let info = null;
    let drawing = false, pending = false;
    async function draw(extra = {}) {
      if (drawing) { pending = true; return; }
      drawing = true;
      const notes = (place.notes || []).map((n) => ({ ...n }));
      const after = (place.after || []).map((n) => ({ ...n }));
      const pos = response?.pos ?? hoverPos;
      let placed = null;
      if (Number.isInteger(pos)) {
        const pp = placedPitch(place, { pos, acc: response ? response.acc : acc });
        placed = { keys: pitchStr(pp), dur: place.dur || 'w', color: extra.color || (response ? 'var(--accent)' : 'rgba(91,91,214,.45)'), showAcc: [response ? response.acc !== null && response.acc !== undefined : acc !== null] };
      } else {
        placed = { rest: true, dur: place.dur || 'w', color: 'transparent', restKey: undefined, invisible: true };
      }
      const extraNotes = extra.correct ? [{ keys: extra.correct, dur: place.dur || 'w', color: 'var(--good)', showAcc: [true] }] : [];
      const measures = place.measures ? place.measures(placed) : [{ notes: [...notes, placed, ...after, ...extraNotes] }];
      info = await renderMusic(staveHost, { clef: place.clef, key: place.fifths, time: place.time, measures, free: !place.time, range, fit: false, scale: 1.45, endBar: place.endBar || 'single' });
      // Hide the placeholder rest when nothing is placed.
      if (!Number.isInteger(pos)) {
        const idx = notes.length;
        staveHost.querySelector(`[id="vf-n0-${idx}"]`)?.setAttribute('opacity', '0');
      }
      info.slotIndex = notes.length;
      drawing = false;
      if (pending) { pending = false; draw(extra); }
    }

    function posFromEvent(e) {
      const svg = staveHost.querySelector('svg');
      if (!svg || !info) return null;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const m = svg.getScreenCTM();
      if (!m) return null;
      const u = pt.matrixTransform(m.inverse());
      const pos = info.geometry.posForY(u.y);
      return Math.max(range[0], Math.min(range[1], pos));
    }
    const setPos = (pos) => {
      if (locked || pos === null) return;
      response = { pos, acc };
      status.textContent = `Note placed ${describeStaffPos(pos)}.`;
      draw(); update();
    };
    let dragging = false;
    staveHost.addEventListener('pointerdown', (e) => { if (locked) return; dragging = true; staveHost.setPointerCapture?.(e.pointerId); setPos(posFromEvent(e)); });
    staveHost.addEventListener('pointermove', (e) => {
      if (locked) return;
      const p = posFromEvent(e);
      if (dragging) { if (p !== response?.pos) setPos(p); }
      else if (!response && p !== hoverPos) { hoverPos = p; draw(); }
    });
    staveHost.addEventListener('pointerup', () => { dragging = false; });
    staveHost.addEventListener('pointerleave', () => { if (!response && hoverPos !== null) { hoverPos = null; draw(); } });
    // Drag from the palette chip.
    chip.addEventListener('pointerdown', (e) => {
      if (locked) return;
      e.preventDefault();
      const ghost = h('div', { class: 'drag-ghost' }, h('span', { class: 'nh' }));
      document.body.append(ghost);
      const move = (ev) => {
        ghost.style.left = `${ev.clientX}px`; ghost.style.top = `${ev.clientY}px`;
        const r = staveHost.getBoundingClientRect();
        const inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        staveHost.classList.toggle('drop-target', inside);
      };
      const up = (ev) => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        ghost.remove();
        staveHost.classList.remove('drop-target');
        const r = staveHost.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) setPos(posFromEvent(ev));
      };
      move(e);
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
    staveHost.addEventListener('keydown', (e) => {
      if (locked) return;
      const keyAcc = { n: 0, '0': 0, s: 1, '#': 1, b: -1, f: -1, x: 2, d: -2 }[e.key];
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const cur = response?.pos ?? 4;
        setPos(Math.max(range[0], Math.min(range[1], response ? cur + (e.key === 'ArrowUp' ? 1 : -1) : 4)));
      } else if (keyAcc !== undefined) {
        acc = keyAcc; if (response) response.acc = acc; draw(); update();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        response = null; draw(); update();
      } else if (e.key === 'Enter' && !answerBtn.disabled) submit();
    });
    refreshers.push(() => {
      [...accRow.children].forEach((b) => b.setAttribute('aria-pressed', String(String(acc) === b.dataset.acc)));
    });
    draw();
    root.__showPlaceAnswer = (result) => {
      const correct = place.accept[0];
      if (!result.correct) draw({ color: 'var(--bad)', correct });
      else draw({ color: 'var(--good)' });
    };
    root.__placePitchOf = (pos, a) => placedPitch(place, { pos, acc: a });
    void pitchAtStaffPos;
  }

  function submit() {
    if (!isComplete(q, response) || locked) return;
    const result = mark(q, response);
    if (mode === 'mock') {
      opts.onAnswer?.(result, structuredClone(response));
      answerBtn.textContent = 'Saved ✓';
      setTimeout(() => { answerBtn.textContent = 'Save answer'; }, 900);
      return;
    }
    locked = true;
    update();
    root.querySelectorAll('input, select').forEach((el) => { el.disabled = true; });
    showFeedback(result);
    opts.onAnswer?.(result, structuredClone(response));
  }

  function showFeedback(result) {
    clear(feedback);
    root.classList.add(result.correct ? 'is-correct' : 'is-wrong');
    // Mark individual parts
    if (q.type === 'mcq') {
      const opts_ = root.querySelectorAll('.q-option');
      opts_[q.answer]?.classList.add('right');
      if (response !== q.answer && Number.isInteger(response)) opts_[response]?.classList.add('wrong');
    }
    if (q.type === 'truefalse') {
      root.querySelectorAll('.tf-row').forEach((row, i) => row.classList.add(result.parts[i] ? 'right' : 'wrong'));
    }
    if (q.type === 'number') root.querySelectorAll('.num-input').forEach((el, i) => el.classList.add(result.parts[i] ? 'right' : 'wrong'));
    if (q.type === 'dropdown') root.querySelectorAll('.q-dropdowns select').forEach((el, i) => el.classList.add(result.parts[i] ? 'right' : 'wrong'));
    if (q.type === 'place') root.__showPlaceAnswer?.(result);

    const title = result.correct ? 'Correct!' : result.score > 0 ? `Partly right: ${fmt(result.score)} out of ${result.max}` : 'Not quite';
    const box = h('div', { class: `feedback-box ${result.correct ? 'good' : 'bad'}` },
      h('div', { class: 'feedback-title' }, icon(result.correct ? 'check' : 'cross', 'coin-icon'), title));
    if (!result.correct) box.append(h('p', { class: 'answer-line' }, h('strong', {}, 'Answer: '), answerText(q)));
    if (q.explanation) box.append(h('p', {}, q.explanation));
    if (!result.correct && q.type === 'mcq' && Number.isInteger(response) && q.whyWrong && q.whyWrong[response]) {
      box.append(h('p', { class: 'why-wrong' }, h('strong', {}, 'Why not that one? '), q.whyWrong[response]));
    }
    if (q.listenAfter) box.append(h('button', { class: 'btn small', onclick: () => playQuestionAudio(q.listenAfter) }, icon('speaker', 'coin-icon'), 'Hear it'));
    feedback.append(box);
  }

  root.getResponse = () => response;
  root.focusFirst = () => root.querySelector('.q-option, .tf-btn, input, select, .place-stave')?.focus();
  return root;
}

function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

function initialResponse(q) {
  switch (q.type) {
    case 'truefalse': return q.statements.map(() => null);
    case 'number': return q.numbers.map(() => '');
    case 'dropdown': return q.dropdowns.map(() => '');
    default: return null;
  }
}
