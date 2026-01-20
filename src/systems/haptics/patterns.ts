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
  | 'hover'           // Ultra-light hover feedback
  | 'score'           // Points earned
  | 'combo-1'         // Low combo
  | 'combo-2'         // Medium combo
  | 'combo-3'         // High combo
  | 'combo-max'       // Maximum combo
  | 'high-score'      // New high score
  | 'game-over'       // Game ended
  | 'success'         // Generic success
  | 'mismatch'        // Memory match mismatch - double tap error
  | 'error'           // Generic error/fail
  | 'warning'         // Warning alert
  | 'button'          // Button press
  | 'achievement'     // Achievement unlocked
  | 'countdown'       // Countdown tick
  | 'countdown-go'    // Countdown GO!
  | 'collision'       // Hit/collision
  | 'urgency-tick'    // Timer urgency tick (final seconds)
  | 'level-up'        // Level up
  // Brick Breaker specific
  | 'bb-paddle-hit'       // Ball hits paddle
  | 'bb-brick-normal'     // Normal brick destroyed
  | 'bb-brick-crack'      // Strong brick cracked (not destroyed)
  | 'bb-brick-strong'     // Strong brick destroyed
  | 'bb-unbreakable'      // Ball hits unbreakable brick
  | 'bb-powerup-collect'  // Powerup collected
  | 'bb-ball-lost'        // Ball falls off screen
  | 'bb-near-miss'        // Ball barely missed paddle
  | 'bb-level-complete'   // Level completed
  | 'bb-combo-break'      // Combo was lost (timeout)
  // Orange Juggle specific
  | 'oj-orange-hit'       // Orange bounced off orangutan
  | 'oj-golden-hit'       // Golden orange hit - celebratory
  | 'oj-orange-drop'      // Orange dropped/missed
  | 'oj-banana-collect'   // Banana powerup collected
  | 'oj-rum-collect'      // Rum powerup collected
  | 'oj-camel-warning'    // Camel is about to spawn
  | 'oj-camel-impact'     // Hit by camel - game over
  | 'oj-near-miss'        // Barely caught the orange
  | 'oj-level-complete'   // Level completed
  // Color Reaction specific
  | 'cr-tap'              // Ultra-light tap confirmation
  | 'cr-perfect'          // PERFECT reaction (<300ms) - celebratory burst
  | 'cr-great'            // GREAT reaction (<500ms) - strong success
  | 'cr-good'             // GOOD reaction (<700ms) - medium success
  | 'cr-ok'               // OK reaction (<1000ms) - light success
  | 'cr-wrong'            // Wrong tap - gentle error
  | 'cr-miss'             // Match window expired - single pulse
  | 'cr-countdown-tick'   // Ultra-light tick in final 500ms
  | 'cr-countdown-warning' // Double tap at 750ms
  | 'cr-countdown-critical' // Rapid triple at 300ms
  | 'cr-lose-life'        // Medium-heavy life loss
  | 'cr-last-life'        // Urgent last life warning
  | 'cr-streak-5'         // 5x streak milestone
  | 'cr-streak-10'        // 10x streak milestone
  | 'cr-streak-15'        // 15x streak milestone
  | 'cr-streak-20';       // 20x streak milestone - maximum

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
  'hover': 5,          // Ultra-light, barely perceptible

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
  'mismatch': [10, 50, 10],                      // Memory match double-tap error (not harsh)
  'error': [35, 50, 25],                         // Soft bonk, not harsh
  'warning': [25, 40, 25],                       // Gentle alert pulse
  'urgency-tick': 8,                             // Subtle tick for final countdown

  // Other
  'achievement': [30, 20, 30, 20, 50, 30, 80],  // Fanfare pattern - celebration!
  'countdown': 20,                               // Consistent tick
  'countdown-go': [35, 25, 60],                 // Energetic start signal

  // Brick Breaker specific - distinct feedback for each event
  'bb-paddle-hit': 20,                          // Medium pulse - ball bounced
  'bb-brick-normal': 12,                        // Light tap - satisfying pop
  'bb-brick-crack': 18,                         // Medium tap - damaged but not destroyed
  'bb-brick-strong': [20, 30, 15],              // Double pulse - heavier reward
  'bb-unbreakable': 30,                         // Heavy thud - solid obstacle
  'bb-powerup-collect': [10, 20, 8, 20, 6],     // Triple pulse - reward pattern
  'bb-ball-lost': 50,                           // Long pulse - disappointing drop
  'bb-near-miss': 5,                            // Ultra-light - barely perceptible warning
  'bb-level-complete': [25, 50, 20, 50, 15],    // Success pattern - celebration
  'bb-combo-break': [15, 40, 10],               // Double tap - disappointment but not harsh

  // Orange Juggle specific - bouncy and playful
  'oj-orange-hit': 20,                          // Medium bounce pulse - satisfying juggle
  'oj-golden-hit': [15, 25, 12, 25, 10],        // Celebratory triple burst - special orange!
  'oj-orange-drop': 50,                         // Long drop feeling - disappointment
  'oj-banana-collect': [10, 20, 8, 20, 6],      // Energetic triple - speed boost reward
  'oj-rum-collect': [30, 80, 25],               // Woozy double - sluggish feeling
  'oj-camel-warning': [15, 100, 15, 100, 15],   // Urgent triple - danger incoming!
  'oj-camel-impact': 80,                        // Heavy game over pulse - big hit
  'oj-near-miss': 5,                            // Ultra-light warning tap
  'oj-level-complete': [25, 50, 20, 50, 15, 50, 10], // Extended celebration burst

  // Color Reaction specific - reaction-time based feedback
  'cr-tap': 8,                                  // Ultra-light confirmation on every tap
  'cr-perfect': [15, 20, 12, 20, 10, 20, 8],    // Celebratory burst for <300ms reaction
  'cr-great': [15, 25, 12, 25, 10],             // Strong success for <500ms
  'cr-good': [15, 30, 12],                      // Medium success for <700ms
  'cr-ok': [15, 40, 10],                        // Light success for <1000ms
  'cr-wrong': [8, 80, 8],                       // Brief double tap - not punishing
  'cr-miss': 30,                                // Single medium pulse - window expired
  'cr-countdown-tick': 5,                       // Ultra-light tick in final 500ms
  'cr-countdown-warning': [10, 50, 10],         // Double tap warning at 750ms
  'cr-countdown-critical': [8, 30, 8, 30, 8],   // Rapid triple at 300ms - urgent!
  'cr-lose-life': 40,                           // Medium-heavy life loss pulse
  'cr-last-life': [15, 100, 15],                // Urgent double pulse warning
  'cr-streak-5': [12, 20, 10, 20, 8, 20, 6],    // Building celebration
  'cr-streak-10': [15, 15, 12, 15, 10, 15, 8, 15, 6], // Bigger celebration
  'cr-streak-15': [18, 12, 15, 12, 12, 12, 10, 12, 8, 12, 6], // Even bigger
  'cr-streak-20': [20, 10, 18, 10, 15, 10, 12, 10, 10, 10, 8, 10, 6], // Maximum!
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
