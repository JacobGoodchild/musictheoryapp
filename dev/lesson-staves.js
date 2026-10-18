// Collects every stave in every lesson (blocks, rows, worked-example steps).
export async function lessonStaves() {
  const { LESSONS } = await import('../src/content/lessons/index.js');
  const out = [];
  for (const l of LESSONS) {
    l.blocks.forEach((b, i) => {
      const add = (spec, cap, k) => out.push({ group: 'lessons', id: `${l.id}#${i}${k ?? ''}`, describe: `${l.title}: ${cap || b.caption || b.title || ''}`, spec });
      if (b.music) add(b.music, b.caption);
      (b.items || []).forEach((it, j) => { if (it && it.music) add(it.music, it.caption, `.${j}`); });
      (b.steps || []).forEach((st, j) => { if (st.music) add(st.music, st.text, `.step${j}`); });
    });
  }
  return out;
}
