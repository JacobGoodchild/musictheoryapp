// The seven exam sections, in exam order, with their marks.
export const SECTIONS = [
  { id: 1, key: 'rhythm', title: 'Rhythm', marks: 10, colour: 'var(--sec1)', glyph: '♪' },
  { id: 2, key: 'pitch', title: 'Pitch', marks: 10, colour: 'var(--sec2)', glyph: '𝄢' },
  { id: 3, key: 'keys', title: 'Keys and scales', marks: 15, colour: 'var(--sec3)', glyph: '♯' },
  { id: 4, key: 'intervals', title: 'Intervals', marks: 10, colour: 'var(--sec4)', glyph: '⇕' },
  { id: 5, key: 'chords', title: 'Chords', marks: 10, colour: 'var(--sec5)', glyph: '♫' },
  { id: 6, key: 'terms', title: 'Terms, signs and instruments', marks: 10, colour: 'var(--sec6)', glyph: '𝆏' },
  { id: 7, key: 'context', title: 'Music in context', marks: 10, colour: 'var(--sec7)', glyph: '𝄞' },
];
export const TOTAL_MARKS = 75;
export const sectionById = (id) => SECTIONS.find((s) => s.id === Number(id));
export const sectionByKey = (k) => SECTIONS.find((s) => s.key === k);

export function band(score) {
  if (score >= 65) return 'Distinction';
  if (score >= 60) return 'Merit';
  if (score >= 50) return 'Pass';
  return 'Not yet a pass';
}
