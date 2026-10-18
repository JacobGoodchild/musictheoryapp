// Route table. Views are loaded lazily so first paint stays fast.
const lazy = (path, name = 'default') => async (params) => (await import(path))[name](params);

export const routes = [
  ['/home', lazy('./views/home.js')],
  ['/learn', lazy('./views/learn.js')],
  ['/learn/:id', lazy('./views/lesson.js')],
  ['/practice', lazy('./views/practice.js')],
  ['/practice/:topic', lazy('./views/drill.js')],
  ['/mock', lazy('./views/mock.js')],
  ['/mock/:id', lazy('./views/mock-run.js')],
  ['/memorise', lazy('./views/memorise.js')],
  ['/memorise/:tool', lazy('./views/memorise.js')],
  ['/rewards', lazy('./views/rewards.js')],
  ['/rewards/:tab', lazy('./views/rewards.js')],
  ['/settings', lazy('./views/settings.js')],
  ['/exam-day', lazy('./views/exam-day.js')],
];

export function resolve(path) {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  for (const [pattern, view] of routes) {
    const pp = pattern.split('/').filter(Boolean);
    if (pp.length !== parts.length) continue;
    const params = {};
    let ok = true;
    pp.forEach((seg, i) => {
      if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(parts[i]);
      else if (seg !== parts[i]) ok = false;
    });
    if (ok) return { view, params };
  }
  return { view: routes[0][1], params: {} };
}
