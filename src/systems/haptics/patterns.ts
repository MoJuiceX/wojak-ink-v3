/**
 * Vibration patterns for different game events
 *
 * JUICE PHILOSOPHY:
 * - Sync haptics with audio for unified feedback
 * - Escalating intensity for combos (matches sound escalation)
 * - Celebration patterns for achievements
 * - Soft, not harsh for negative feedback
 *
 * Pattern format: number | number[]
 * - Single number: vibrate for that many milliseconds
 * - Array: [vibrate, pause, vibrate, pause, ...]
 *
 * Example: [100, 50, 100] = vibrate 100ms, pause 50ms, vibrate 100ms
 */

export type HapticPattern =
  | 'light'           // Light tap
  | 'medium'          // Medium tap
  | 'heavy'           // Heavy tap
  | 'score'           // Points earned
  | 'combo-1'         // Low combo
  | 'combo-2'         // Medium combo
  | 'combo-3'         // High combo
  | 'combo-max'       // Maximum combo
  | 'high-score'      // New high score
  | 'game-over'       // Game ended
  | 'success'         // Generic success
  | 'error'           // Generic error/fail
  | 'warning'         // Warning alert
  | 'button'          // Button press
  | 'achievement'     // Achievement unlocked
  | 'countdown'       // Countdown tick
  | 'countdown-go'    // Countdown GO!
  | 'collision'       // Hit/collision
  | 'level-up';       // Level up

export interface HapticDefinition {
  name: HapticPattern;
  pattern: number | number[];
  description: string;
}

export const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  // Basic taps - snappy and satisfying
  'light': 8,          // Quick pop feeling
  'medium': 20,        // Noticeable but not intrusive
  'heavy': 40,         // Strong feedback

  // Gameplay - THE ADDICTION ENGINE (synced with sound escalation)
  'score': 12,                                    // Quick satisfying pop
  'combo-1': [15, 20, 15],                        // Light double tap
  'combo-2': [18, 15, 18, 15, 25],                // Escalating triple
  'combo-3': [22, 12, 22, 12, 30, 12, 35],        // Building quad
  'combo-max': [30, 15, 35, 15, 40, 15, 50, 20, 80], // Epic celebration burst
  'collision': [25, 15, 20],                      // Impact but not harsh

  // Game state - celebration or gentle feedback
  'high-score': [40, 30, 50, 30, 60, 40, 100],   // Triumphant fanfare pattern
  'game-over': [60, 80, 40],                     // Soft double tap, NOT punishing
  'level-up': [30, 25, 40, 25, 60],              // Rising celebration

  // UI - subtle and responsive
  'button': 8,                                    // Barely there, just confirms tap
  'success': [20, 25, 35],                       // Positive light tap
  'error': [35, 50, 25],                         // Soft bonk, not harsh
  'warning': [25, 40, 25],                       // Gentle alert pulse

  // Other
  'achievement': [30, 20, 30, 20, 50, 30, 80],  // Fanfare pattern - celebration!
  'countdown': 20,                               // Consistent tick
  'countdown-go': [35, 25, 60],                 // Energetic start signal
};

/**
 * Get haptic pattern based on combo level
 */
export const getComboHaptic = (comboLevel: number): HapticPattern => {
  if (comboLevel >= 10) return 'combo-max';
  if (comboLevel >= 7) return 'combo-3';
  if (comboLevel >= 4) return 'combo-2';
  if (comboLevel >= 2) return 'combo-1';
  return 'score'; // Level 1 is just a score tap
};

/**
 * Get a dynamic combo pattern that escalates with level
 * Creates the "I want to feel the next one" sensation
 */
export const getDynamicComboPattern = (comboLevel: number): number | number[] => {
  const level = Math.max(1, Math.min(comboLevel, 15));

  // Base vibration duration increases with level
  const baseDuration = 10 + level * 2;

  // Number of pulses increases with level (1-5)
  const pulseCount = Math.min(Math.floor((level + 1) / 2), 5);

  if (pulseCount === 1) {
    return baseDuration;
  }

  // Build escalating pattern
  const pattern: number[] = [];
  for (let i = 0; i < pulseCount; i++) {
    // Each pulse slightly longer than the last
    const pulseDuration = baseDuration + i * 5;
    pattern.push(pulseDuration);

    // Add pause between pulses (except after last)
    if (i < pulseCount - 1) {
      pattern.push(15 - i); // Pauses get shorter for urgency
    }
  }

  // Final pulse is extra strong at high levels
  if (level >= 8) {
    pattern.push(25); // Extra pause
    pattern.push(baseDuration + 30); // Big finale
  }

  return pattern;
};

/**
 * Scale a pattern's intensity (multiply all values)
 */
export const scalePattern = (
  pattern: number | number[],
  scale: number
): number | number[] => {
  if (typeof pattern === 'number') {
    return Math.round(pattern * scale);
  }
  return pattern.map(v => Math.round(v * scale));
};

/**
 * Create a celebration pattern for achievements
 */
export const createCelebrationPattern = (): number[] => {
  // Fanfare: tap-tap-tap-TAP-TAAAP
  return [30, 20, 30, 20, 50, 30, 80];
};
