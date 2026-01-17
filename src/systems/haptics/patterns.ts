/**
 * Vibration patterns for different game events
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
  // Basic taps
  'light': 10,
  'medium': 25,
  'heavy': 50,

  // Gameplay
  'score': 15,                          // Quick tap on score
  'combo-1': [20, 10, 20],              // Double tap for low combo
  'combo-2': [25, 15, 25, 15, 25],      // Triple tap for medium combo
  'combo-3': [30, 10, 30, 10, 30, 10, 30], // Quad tap for high combo
  'combo-max': [50, 20, 50, 20, 50, 20, 100], // Epic combo
  'collision': [40, 20, 30],            // Impact feeling

  // Game state
  'high-score': [100, 50, 100, 50, 200], // Celebration
  'game-over': [100, 100, 200],         // Finality
  'level-up': [50, 30, 50, 30, 100],    // Achievement feeling

  // UI
  'button': 10,                          // Subtle button feedback
  'success': [30, 20, 50],              // Positive feedback
  'error': [50, 30, 50, 30, 50],        // Negative feedback
  'warning': [40, 40, 40],              // Alert

  // Other
  'achievement': [50, 50, 50, 50, 150], // Special unlock
  'countdown': 30,                       // Countdown tick
  'countdown-go': [50, 30, 100],        // GO! moment
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
