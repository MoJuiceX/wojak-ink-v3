/**
 * Standard Effect Patterns
 *
 * All games should follow these patterns for consistent "juice".
 * Import useGameEffects and trigger these effects for consistent feel.
 */

// Type for the effects object from useGameEffects
// Using a flexible interface since the actual type may vary
interface GameEffectsLike {
  addScorePopup?: (points: number | string, x: number, y: number) => void;
  triggerShockwave?: (x: number, y: number, color?: string) => void;
  triggerSparks?: (x: number, y: number, color?: string) => void;
  triggerConfetti?: () => void;
  showEpicCallout?: (text: string) => void;
  triggerScreenShake?: (intensity: number) => void;
  triggerVignette?: (color: string) => void;
  updateCombo?: (combo: number) => void;
  resetCombo?: () => void;
  triggerBigMoment?: () => void;
}

// ============================================
// TIMING CONSTANTS
// ============================================

export const EFFECT_TIMING = {
  // Delay before showing score popup (feels more connected to action)
  SCORE_POPUP_DELAY: 0,

  // Duration of shockwave
  SHOCKWAVE_DURATION: 300,

  // How long to show epic callout
  CALLOUT_DURATION: 1500,

  // Screen shake duration by intensity
  SHAKE_DURATION: {
    light: 150,
    medium: 300,
    heavy: 500,
  },

  // Confetti duration
  CONFETTI_DURATION: 3000,

  // Combo display duration
  COMBO_DISPLAY: 2000,

  // Vignette flash duration
  VIGNETTE_DURATION: 200,
} as const;

// ============================================
// EFFECT PATTERNS
// ============================================

/**
 * When player scores points
 */
export const onScore = (
  effects: GameEffectsLike,
  points: number,
  x: number,
  y: number
): void => {
  effects.addScorePopup?.(points, x, y);
  if (points >= 100) {
    effects.triggerSparks?.(x, y);
  }
};

/**
 * When player gets a perfect/bonus action
 */
export const onPerfect = (
  effects: GameEffectsLike,
  x: number,
  y: number
): void => {
  effects.triggerShockwave?.(x, y, '#ffd700');
  effects.triggerSparks?.(x, y, '#ffd700');
  effects.showEpicCallout?.('PERFECT!');
};

/**
 * When combo increases
 */
export const onCombo = (
  effects: GameEffectsLike,
  combo: number,
  x: number,
  y: number
): void => {
  effects.updateCombo?.(combo);

  if (combo >= 2) {
    effects.showEpicCallout?.(`${combo}x COMBO!`);
  }
  if (combo >= 3) {
    effects.triggerShockwave?.(x, y);
  }
  if (combo >= 5) {
    effects.triggerConfetti?.();
  }
  if (combo >= 7) {
    effects.triggerScreenShake?.(Math.min(combo - 4, 5));
  }
  if (combo >= 10) {
    effects.triggerVignette?.('#ffd700');
  }
};

/**
 * When level/round is complete
 */
export const onLevelComplete = (effects: GameEffectsLike): void => {
  effects.triggerConfetti?.();
  effects.showEpicCallout?.('LEVEL UP!');
  effects.triggerShockwave?.(50, 50, '#ffd700');
};

/**
 * When player achieves a new high score
 */
export const onNewHighScore = (effects: GameEffectsLike): void => {
  effects.triggerConfetti?.();
  effects.showEpicCallout?.('NEW HIGH SCORE!');
  effects.triggerVignette?.('#ffd700');
};

/**
 * When player wins/achieves victory
 */
export const onVictory = (effects: GameEffectsLike): void => {
  effects.triggerConfetti?.();
  effects.triggerConfetti?.(); // Double confetti!
  effects.showEpicCallout?.('VICTORY!');
  effects.triggerScreenShake?.(3);
};

/**
 * When player loses/fails (game over)
 */
export const onGameOver = (effects: GameEffectsLike): void => {
  effects.triggerVignette?.('#ff0000');
  effects.triggerScreenShake?.(2);
  effects.resetCombo?.();
};

/**
 * When player takes damage/makes mistake
 */
export const onMistake = (effects: GameEffectsLike): void => {
  effects.triggerVignette?.('#ff4444');
  effects.triggerScreenShake?.(1);
};

/**
 * When player reaches a milestone (10, 25, 50, 100 points/score)
 */
export const onMilestone = (
  effects: GameEffectsLike,
  milestone: number,
  x: number = 50,
  y: number = 50
): void => {
  effects.triggerShockwave?.(x, y, '#ff6b00');
  effects.showEpicCallout?.(`${milestone}!`);

  if (milestone >= 50) {
    effects.triggerSparks?.(x, y);
  }
  if (milestone >= 100) {
    effects.triggerConfetti?.();
  }
};

/**
 * When player clears multiple lines/matches at once
 */
export const onMultiClear = (
  effects: GameEffectsLike,
  count: number,
  x: number = 50,
  y: number = 50
): void => {
  const labels: Record<number, string> = {
    2: 'DOUBLE!',
    3: 'TRIPLE!',
    4: 'QUAD!',
    5: 'MEGA!',
  };

  const label = labels[Math.min(count, 5)] || `${count}x CLEAR!`;
  effects.showEpicCallout?.(label);
  effects.triggerShockwave?.(x, y);

  if (count >= 3) {
    effects.triggerScreenShake?.(count - 1);
  }
  if (count >= 4) {
    effects.triggerConfetti?.();
  }
};

/**
 * When entering a special mode (fire mode, fever, etc.)
 */
export const onSpecialModeActivate = (
  effects: GameEffectsLike,
  modeName: string = 'FIRE MODE!'
): void => {
  effects.showEpicCallout?.(modeName);
  effects.triggerConfetti?.();
  effects.triggerVignette?.('#ff6b00');
  effects.triggerScreenShake?.(2);
};
