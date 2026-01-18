/**
 * Sound Effects Definitions
 *
 * Defines all game sounds with their properties.
 * Sound files should be placed in /public/assets/sounds/
 */

export type SoundName =
  | 'score'           // Points earned
  | 'combo-1'         // Combo level 1-2
  | 'combo-2'         // Combo level 3-4
  | 'combo-3'         // Combo level 5-6
  | 'combo-4'         // Combo level 7-8
  | 'combo-5'         // Combo level 9-10
  | 'combo-max'       // Combo 10+ (epic)
  | 'high-score'      // New high score achieved
  | 'game-over'       // Game ended
  | 'game-start'      // Game begins
  | 'countdown'       // 3-2-1 countdown beep
  | 'countdown-go'    // GO! sound
  | 'button-click'    // UI button press
  | 'achievement'     // Achievement unlocked
  | 'currency-earn'   // Oranges/gems earned
  | 'level-up'        // Level increased
  | 'warning'         // Low time, low lives warning
  | 'success'         // Generic success
  | 'error'           // Generic error/fail
  | 'vote-whoosh'     // Emoji flying
  | 'vote-splat'      // Donut impact
  | 'vote-plop'       // Poop impact
  | 'vote-rain';      // Heatmap rain

export interface SoundDefinition {
  name: SoundName;
  url: string;
  volume: number;       // 0-1, default volume
  maxInstances: number; // How many can play simultaneously
  category: 'sfx' | 'music' | 'ui';
}

// Base URL for sound assets
const SOUNDS_BASE_URL = '/assets/sounds';

export const SOUND_DEFINITIONS: SoundDefinition[] = [
  // Gameplay sounds
  {
    name: 'score',
    url: `${SOUNDS_BASE_URL}/score.wav`,
    volume: 0.5,
    maxInstances: 5, // Can overlap for rapid scoring
    category: 'sfx'
  },
  {
    name: 'combo-1',
    url: `${SOUNDS_BASE_URL}/combo-1.wav`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-2',
    url: `${SOUNDS_BASE_URL}/combo-2.wav`,
    volume: 0.65,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-3',
    url: `${SOUNDS_BASE_URL}/combo-3.wav`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-4',
    url: `${SOUNDS_BASE_URL}/combo-4.wav`,
    volume: 0.75,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-5',
    url: `${SOUNDS_BASE_URL}/combo-5.wav`,
    volume: 0.8,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'combo-max',
    url: `${SOUNDS_BASE_URL}/combo-max.wav`,
    volume: 0.85,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'high-score',
    url: `${SOUNDS_BASE_URL}/high-score.wav`,
    volume: 0.8,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'game-over',
    url: `${SOUNDS_BASE_URL}/game-over.wav`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'game-start',
    url: `${SOUNDS_BASE_URL}/game-start.wav`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'countdown',
    url: `${SOUNDS_BASE_URL}/countdown.wav`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'countdown-go',
    url: `${SOUNDS_BASE_URL}/countdown-go.wav`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },

  // UI sounds
  {
    name: 'button-click',
    url: `${SOUNDS_BASE_URL}/button-click.wav`,
    volume: 0.4,
    maxInstances: 3,
    category: 'ui'
  },

  // Reward sounds
  {
    name: 'achievement',
    url: `${SOUNDS_BASE_URL}/achievement.wav`,
    volume: 0.75,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'currency-earn',
    url: `${SOUNDS_BASE_URL}/currency-earn.wav`,
    volume: 0.5,
    maxInstances: 3,
    category: 'sfx'
  },
  {
    name: 'level-up',
    url: `${SOUNDS_BASE_URL}/level-up.wav`,
    volume: 0.7,
    maxInstances: 1,
    category: 'sfx'
  },

  // Feedback sounds
  {
    name: 'warning',
    url: `${SOUNDS_BASE_URL}/warning.wav`,
    volume: 0.5,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'success',
    url: `${SOUNDS_BASE_URL}/success.wav`,
    volume: 0.6,
    maxInstances: 1,
    category: 'sfx'
  },
  {
    name: 'error',
    url: `${SOUNDS_BASE_URL}/error.wav`,
    volume: 0.5,
    maxInstances: 1,
    category: 'sfx'
  },

  // Voting sounds
  {
    name: 'vote-whoosh',
    url: `${SOUNDS_BASE_URL}/vote-whoosh.wav`,
    volume: 0.5,
    maxInstances: 3,
    category: 'sfx'
  },
  {
    name: 'vote-splat',
    url: `${SOUNDS_BASE_URL}/vote-splat.wav`,
    volume: 0.6,
    maxInstances: 3,
    category: 'sfx'
  },
  {
    name: 'vote-plop',
    url: `${SOUNDS_BASE_URL}/vote-plop.wav`,
    volume: 0.6,
    maxInstances: 3,
    category: 'sfx'
  },
  {
    name: 'vote-rain',
    url: `${SOUNDS_BASE_URL}/vote-rain.wav`,
    volume: 0.4,
    maxInstances: 1,
    category: 'sfx'
  }
];

/**
 * Get combo sound based on level
 */
export const getComboSound = (comboLevel: number): SoundName => {
  if (comboLevel >= 10) return 'combo-max';
  if (comboLevel >= 8) return 'combo-5';
  if (comboLevel >= 6) return 'combo-4';
  if (comboLevel >= 4) return 'combo-3';
  if (comboLevel >= 2) return 'combo-2';
  return 'combo-1';
};

/**
 * Get sound definition by name
 */
export const getSoundDefinition = (name: SoundName): SoundDefinition | undefined => {
  return SOUND_DEFINITIONS.find(def => def.name === name);
};
