// All lessons, in exam-section order.
import { RHYTHM_LESSONS } from './s1-rhythm.js';
import { PITCH_LESSONS } from './s2-pitch.js';
import { KEYS_LESSONS } from './s3-keys.js';
import { INTERVAL_LESSONS, CHORD_LESSONS } from './s4-s5.js';
import { TERMS_LESSONS, CONTEXT_LESSONS } from './s6-s7.js';

export const LESSONS = [...RHYTHM_LESSONS, ...PITCH_LESSONS, ...KEYS_LESSONS, ...INTERVAL_LESSONS, ...CHORD_LESSONS, ...TERMS_LESSONS, ...CONTEXT_LESSONS];
