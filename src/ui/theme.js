// Light/dark theme and reduced-motion preference.
export function applyTheme(settings) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const theme = settings.theme === 'system' ? (prefersDark ? 'dark' : 'light') : settings.theme;
  root.dataset.theme = theme;
  if (settings.reducedMotion === 'system') delete root.dataset.reducedMotion;
  else root.dataset.reducedMotion = settings.reducedMotion;
}
