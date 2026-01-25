/**
 * Color Reaction — Arcade Mode config, formulas, and helpers.
 * Use performance.now() consistently for all timing.
 */

export const FRUITS = [
  { name: 'orange', emoji: '🍊' },
  { name: 'lime', emoji: '🍋' },
  { name: 'grape', emoji: '🍇' },
  { name: 'berry', emoji: '🫐' },
  { name: 'strawberry', emoji: '🍓' },
  { name: 'kiwi', emoji: '🥝' },
] as const;

export const COLORS = [
  { name: 'orange', hex: '#FF6B00' }, // Bright orange
  { name: 'lime', hex: '#00FF00' }, // Pure green (was #32CD32 - too similar to kiwi)
  { name: 'grape', hex: '#8B00FF' }, // Bright purple (was #8B5CF6 - too similar to berry)
  { name: 'berry', hex: '#0066FF' }, // Bright blue (was #3B82F6 - too similar to grape)
  { name: 'strawberry', hex: '#FF0066' }, // Bright pink (was #FF4D6A - too similar to orange)
  { name: 'kiwi', hex: '#66FF00' }, // Bright lime green (was #7CB342 - too similar to lime)
] as const;

export const N = FRUITS.length;

export const GRACE_PERIOD_MS = 800;
export const TAP_DEBOUNCE_MS = 100;

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

export function randomFruit(): number {
  return Math.floor(Math.random() * N);
}

export function randomColor(): number {
  return Math.floor(Math.random() * N);
}

export function randomFruitExcept(exclude: number): number {
  let i: number;
  do {
    i = Math.floor(Math.random() * N);
  } while (i === exclude);
  return i;
}

export function randomColorExcept(exclude: number): number {
  let i: number;
  do {
    i = Math.floor(Math.random() * N);
  } while (i === exclude);
  return i;
}

/** Cycle speed (ms). 1000–2500.
 * More gradual: -150ms per 100 points (was -200ms)
 * Higher minimum: 1000ms (was 900ms) - less frantic at high scores
 */
export function getCycleMs(score: number): number {
  const reduction = Math.floor(score / 100) * 150;
  return clamp(2500 - reduction, 1000, 2500);
}

/** Match window (ms). Use current streak (before hit). 600–1000.
 * More gradual difficulty: -25ms per 100 points (was -45ms)
 * Higher minimum: 600ms (was 500ms) - gives players a fair chance
 */
export function getMatchWindowMs(score: number, streak: number): number {
  const w = 1000 - Math.floor(score / 100) * 25 - streak * 10;
  return clamp(w, 600, 1000);
}

/** Full match chance %. Target: match every 3-5 seconds.
 * Early: 70% on 2500ms cycle = ~3.6s average (more frequent for engagement)
 * Late: 45% on 900ms cycle = ~2s average (but cycles are faster, so still feels frequent)
 */
export function getFullMatchChancePct(score: number): number {
  const p = 70 - Math.floor(score / 200) * 5;
  return clamp(p, 45, 70);
}

/** Partial chance % (among non-full). 55–80. */
export function getPartialChancePct(score: number): number {
  const p = 55 + Math.floor(score / 200) * 5;
  return clamp(p, 55, 80);
}

/** Base points from reaction time. 10–100. */
export function calculateBasePoints(reactionMs: number): number {
  const raw = Math.round(110 - reactionMs / 12);
  return clamp(raw, 10, 100);
}

/** Streak bonus uses nextStreak (after increment). Capped 15. */
export function getStreakBonus(nextStreak: number): number {
  return Math.min(15, nextStreak * 2);
}

export type MatchType = 'FULL_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH';
