// Loads the pre-generated question bank (data/questions/*.json), cached.
const cache = {};

export async function loadSection(sec) {
  if (!cache[sec]) {
    cache[sec] = fetch(`data/questions/section-${sec}.json`).then((r) => {
      if (!r.ok) throw new Error('Could not load questions');
      return r.json();
    });
  }
  return cache[sec];
}

export async function loadAll() {
  const lists = await Promise.all([1, 2, 3, 4, 5, 6, 7].map(loadSection));
  return lists.flat();
}

export async function questionById(id) {
  const sec = id.startsWith('mock-') ? null : null;
  void sec;
  for (const list of await Promise.all([1, 2, 3, 4, 5, 6, 7].map(loadSection))) {
    const q = list.find((x) => x.id === id);
    if (q) return q;
  }
  return null;
}

let mocksCache = null;
export async function loadMocks() {
  if (!mocksCache) mocksCache = fetch('data/mocks.json').then((r) => r.json());
  return mocksCache;
}
