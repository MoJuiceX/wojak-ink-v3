/**
 * BlockPuzzle Haptic Functions
 *
 * Pure functions for haptic feedback during gameplay.
 * Uses navigator.vibrate() with patterns from HAPTIC_PATTERNS.
 */

import { HAPTIC_PATTERNS } from './config';

/**
 * Trigger haptic feedback for line clear based on number of lines cleared.
 * Pattern intensity increases with more lines.
 */
export function triggerLineClearHaptic(linesCleared: number): void {
  const patterns: Record<number, readonly number[]> = {
    1: HAPTIC_PATTERNS.lineClear1,
    2: HAPTIC_PATTERNS.lineClear2,
    3: HAPTIC_PATTERNS.lineClear3,
    4: HAPTIC_PATTERNS.lineClear4,
  };
  const pattern = patterns[Math.min(linesCleared, 4)];
  if (navigator.vibrate) navigator.vibrate([...pattern]);
}

/**
 * Trigger haptic feedback when a piece snaps into place.
 * Double-tap confirmation feel.
 */
export function triggerSnapHaptic(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.snapLock]);
}

/**
 * Trigger haptic feedback for invalid placement attempt.
 * Error double-tap feel.
 */
export function triggerInvalidHaptic(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.invalidPlacement]);
}

/**
 * Trigger haptic feedback when starting to drag a piece.
 * Ultra-light tick for initial pickup.
 */
export function triggerDragStartHaptic(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.dragStart]);
}

/**
 * Trigger haptic feedback for perfect clear (empty board).
 * Celebration crescendo pattern.
 */
export function triggerPerfectClearHaptic(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.perfectClear]);
}

/**
 * Trigger subtle haptic pulse for danger state warning.
 * Heartbeat-like warning when board is filling up.
 */
export function triggerDangerPulse(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.dangerPulse]);
}

/**
 * Trigger haptic feedback when streak fire mode activates.
 * Ignition pattern for streak activation.
 */
export function triggerStreakFireHaptic(): void {
  if (navigator.vibrate) navigator.vibrate([...HAPTIC_PATTERNS.streakFire]);
}
