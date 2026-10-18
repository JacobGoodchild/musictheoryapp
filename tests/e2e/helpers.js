// Shared helpers: answer any question through the real UI.
export async function withProfile(page, extra = {}) {
  await page.addInitScript((extra) => {
    if (!localStorage.getItem('g5theory.save')) {
      localStorage.setItem('g5theory.save', JSON.stringify({ version: 3, profile: { name: 'Tester' }, settings: { sound: false }, ...extra }));
    }
  }, extra);
}

/** Answer question q inside `scope` (a locator). correct=false gives a wrong answer. */
export async function answer(page, scope, q, correct = true) {
  if (q.type === 'mcq') {
    const i = correct ? q.answer : (q.answer + 1) % q.options.length;
    await scope.locator('.q-option').nth(i).click();
  } else if (q.type === 'truefalse') {
    const rows = scope.locator('.tf-row');
    for (let i = 0; i < q.statements.length; i++) {
      const v = correct ? q.statements[i].answer : !q.statements[i].answer;
      await rows.nth(i).locator(`[data-tf="${v}"]`).click();
    }
  } else if (q.type === 'number') {
    const inputs = scope.locator('.num-input');
    for (let i = 0; i < q.numbers.length; i++) await inputs.nth(i).fill(String(q.numbers[i].answer + (correct ? 0 : 1)));
  } else if (q.type === 'dropdown') {
    const sel = scope.locator('.q-dropdowns select');
    const combo = correct ? q.acceptCombos?.[0] || q.dropdowns.map((d) => d.answer) : ['I', 'I', 'I', 'I'];
    for (let i = 0; i < combo.length; i++) await sel.nth(i).selectOption(combo[i]);
  } else if (q.type === 'place') {
    const target = await page.evaluate(async (q) => {
      const { parse, staffPos } = await import('/src/theory/pitch.js');
      const p = parse(q.place.accept[0]);
      return { pos: staffPos(p, q.place.clef), acc: p.acc };
    }, q);
    const accLabel = { '-2': 'double flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double sharp' }[target.acc];
    await scope.locator(`.acc-btn[aria-label="${accLabel}"]`).click();
    const pos = correct ? target.pos : target.pos + 1;
    const pt = await scope.locator('.place-stave').evaluate((host, pos) => {
      const svg = host.querySelector('svg');
      const g = host.__music.geometry;
      const p = svg.createSVGPoint();
      p.x = g.noteStartX + 40; p.y = g.yForPos(pos);
      const s = p.matrixTransform(svg.getScreenCTM());
      return { x: s.x, y: s.y };
    }, pos);
    await page.mouse.click(pt.x, pt.y);
  }
  await scope.locator('[data-action=answer]').click();
}
