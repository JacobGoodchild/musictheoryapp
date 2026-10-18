// Collects staves from every lesson (filled in once lessons exist).
export async function lessonStaves() {
  try {
    const { LESSONS } = await import('../src/content/lessons/index.js');
    const out = [];
    for (const l of LESSONS) {
      for (const [i, b] of (l.blocks || []).entries()) {
        if (b.music) out.push({ group: 'lessons', id: `${l.id}#${i}`, describe: `${l.title}: ${b.caption || b.text || ''}`, spec: b.music });
      }
    }
    return out;
  } catch (e) {
    return [];
  }
}
