/**
 * Orange Juggle - Game Configuration
 */

import type { GameConfig } from '@/systems/game-ui/types';

export const PADDLE_SIZE = 150;
export const PADDLE_COLLISION_RADIUS = 50;
export const ORANGE_SIZE = 56;
export const POWERUP_SIZE = 35;
export const GRAVITY = 0.3;
export const BOUNCE_DAMPING = 0.7;
export const HIT_VELOCITY = -7;

export const BANANA_SPEEDS = [1, 1.5, 2.0, 2.5];
export const RUM_SPEEDS = [1, 0.7, 0.5, 0.3];
export const POWERUP_FALL_SPEED = 2;
export const RUMS_FOR_REVERSE = 1;

export const COMBO_DECAY_TIME = 2500;

export const LEVEL_CONFIG: Record<number, {
  oranges: number;
  rumEnabled: boolean;
  bananaEnabled: boolean;
  gravity: number;
  time: number;
  targetScore: number;
  camelChance: number;
  chaos: number;
}> = {
  1: { oranges: 1, rumEnabled: false, bananaEnabled: false, gravity: 0.12, time: 15, targetScore: 500, camelChance: 0, chaos: 1.0 },
  2: { oranges: 1, rumEnabled: true, bananaEnabled: false, gravity: 0.13, time: 20, targetScore: 2000, camelChance: 0.10, chaos: 1.3 },
  3: { oranges: 2, rumEnabled: true, bananaEnabled: true, gravity: 0.14, time: 25, targetScore: 5000, camelChance: 0.15, chaos: 1.6 },
  4: { oranges: 2, rumEnabled: true, bananaEnabled: true, gravity: 0.15, time: 30, targetScore: 10000, camelChance: 0.20, chaos: 2.0 },
  5: { oranges: 3, rumEnabled: true, bananaEnabled: true, gravity: 0.16, time: 40, targetScore: 0, camelChance: 0.25, chaos: 2.5 },
};

export const CAMEL_SIZE = 50;
export const CAMEL_SPAWN_INTERVAL = 2500;

export const ORANGE_JUGGLE_CONFIG: GameConfig = {
  id: 'orange-juggle',
  name: 'Orange Juggle',
  description: 'Keep the oranges in the air! Watch out for camels and power-ups.',
  emoji: '🦧',
  primaryColor: '#ff6b00',
  secondaryColor: '#8b4513',

  rewards: {
    baseOranges: 10,
    bonusThresholds: [
      { score: 500, oranges: 5 },
      { score: 2000, oranges: 15 },
      { score: 5000, oranges: 30 },
      { score: 10000, oranges: 50 },
    ],
    streakMultiplier: 0.15,
  },

  leaderboardId: 'orange-juggle',

  settings: {
    hasLevels: true,
    maxLevels: 5,
    hasComboSystem: true,
    hasTimer: true,
    hasPowerUps: true,
  },
};

export default ORANGE_JUGGLE_CONFIG;
