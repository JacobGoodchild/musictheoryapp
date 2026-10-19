// Registry of all practice topics and their generators.
import { RHYTHM_TOPICS } from './gen-rhythm.js';
import { PITCH_TOPICS } from './gen-pitch.js';
import { KEYS_TOPICS } from './gen-keys.js';
import { INTERVAL_TOPICS } from './gen-intervals.js';
import { CHORD_TOPICS } from './gen-chords.js';
import { TERMS_TOPICS } from './gen-terms.js';
import { CONTEXT_TOPICS } from './gen-context.js';
import { rng, hashString } from './util.js';
import { validateQuestion } from './validate.js';

export const TOPICS = [...RHYTHM_TOPICS, ...PITCH_TOPICS, ...KEYS_TOPICS, ...INTERVAL_TOPICS, ...CHORD_TOPICS, ...TERMS_TOPICS, ...CONTEXT_TOPICS];
export const topicById = (id) => TOPICS.find((t) => t.id === id);
export const topicsForSection = (sec) => TOPICS.filter((t) => t.section === Number(sec));

/**
 * Generate one checked question for a topic. Deterministic for a given seed.
 * Retries with a new seed if a generator fails or its output fails validation.
 */
export function generate(topicId, seed, difficulty = null) {
  const topic = topicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);
  let lastErr = null;
  for (let attempt = 0; attempt < 25; attempt++) {
    const r = rng(hashString(`${topicId}:${seed}:${attempt}`));
    const diff = difficulty || r.pick([1, 2, 2, 3]);
    const gen = r.pick(topic.gens);
    try {
      const q = gen(r, diff);
      if (!q) continue;
      const problems = validateQuestion(q);
      if (problems.length) { lastErr = new Error(problems.join('; ')); continue; }
      for (const k of ['prompt', 'explanation']) if (q[k]) q[k] = q[k].replace(/ {2,}/g, ' ').trim();
      q.id = q.id || `${topicId}-${hashString(`${seed}:${attempt}`).toString(36)}`;
      q.topic = q.topic || topicId;
      q.gen = gen.name;
      return q;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`Could not generate ${topicId}`);
}

/** Pick a topic for a section, weighted (harder/emphasised topics a little more). */
export function pickTopic(r, section = null) {
  const pool = section ? topicsForSection(section) : TOPICS;
  return r.weighted(pool.map((t) => [t, t.weight || 1]));
}
