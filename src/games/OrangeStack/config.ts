/**
 * Brick by Brick - Game Configuration
 *
 * Stack bricks as high as you can! Precision stacking game with combos,
 * power-ups, and 10 levels of increasing difficulty.
 */

import type { GameConfig } from '@/systems/game-ui/types';

// Level configurations - 10 levels with gradual difficulty
export const LEVEL_CONFIG: Record<number, {
  startSpeed: number;
  speedIncrease: number;
  blocksToComplete: number;
  minBlockWidth: number;
  theme: string;
}> = {
  1:  { startSpeed: 1.2, speedIncrease: 0.03, blocksToComplete: 6,  minBlockWidth: 50, theme: 'sunrise' },
  2:  { startSpeed: 1.5, speedIncrease: 0.04, blocksToComplete: 7,  minBlockWidth: 45, theme: 'morning' },
  3:  { startSpeed: 1.8, speedIncrease: 0.05, blocksToComplete: 8,  minBlockWidth: 40, theme: 'day' },
  4:  { startSpeed: 2.2, speedIncrease: 0.06, blocksToComplete: 9,  minBlockWidth: 35, theme: 'afternoon' },
  5:  { startSpeed: 2.6, speedIncrease: 0.07, blocksToComplete: 10, minBlockWidth: 30, theme: 'sunset' },
  6:  { startSpeed: 3.0, speedIncrease: 0.08, blocksToComplete: 11, minBlockWidth: 26, theme: 'dusk' },
  7:  { startSpeed: 3.4, speedIncrease: 0.09, blocksToComplete: 12, minBlockWidth: 22, theme: 'evening' },
  8:  { startSpeed: 3.8, speedIncrease: 0.10, blocksToComplete: 13, minBlockWidth: 18, theme: 'night' },
  9:  { startSpeed: 4.2, speedIncrease: 0.11, blocksToComplete: 14, minBlockWidth: 15, theme: 'storm' },
  10: { startSpeed: 4.5, speedIncrease: 0.12, blocksToComplete: 15, minBlockWidth: 12, theme: 'inferno' },
};

export const MAX_LEVEL = 10;

// Block dimensions
export const BLOCK_HEIGHT_DESKTOP = 45;
export const BLOCK_HEIGHT_MOBILE = 40;
export const INITIAL_WIDTH = 220;
export const GAME_WIDTH = 650;

// Power-up types
export type PowerUpType = 'magnet' | 'slowmo' | 'width' | 'shield';

export const POWER_UPS: Record<PowerUpType, { emoji: string; name: string; duration?: number }> = {
  magnet: { emoji: '🧲', name: 'Magnet', duration: 1 },
  slowmo: { emoji: '⏱️', name: 'Slow-Mo', duration: 5000 },
  width:  { emoji: '📏', name: 'Width+', duration: 1 },
  shield: { emoji: '🛡️', name: 'Shield', duration: 1 },
};

// Combo perk thresholds
export const COMBO_PERKS = {
  miniShield: 5,
  autoSlowMo: 10,
  widthRestore: 15,
};

// Scoring configuration
export const SCORING = {
  basePoints: 10,
  perfectBonus: 50,
  nearPerfectBonus: 20,
  speedBonusMax: 30,
  speedBonusTime: 2000,
  bounceMultiplier: 1,
  comboMultiplier: 0.1,
  levelBonus: 100,
  powerUpChance: 0.15,
};

// Sad images for game over screen (1-19)
export const SAD_IMAGES = Array.from(
  { length: 19 },
  (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`
);

// Game identity configuration
export const ORANGE_STACK_CONFIG: GameConfig = {
  id: 'orange-stack',
  name: 'Brick by Brick',
  description: 'Stack bricks as high as you can! Perfect alignment gives bonus points.',
  emoji: '🧱',
  primaryColor: '#ff6b00',
  secondaryColor: '#ffd700',
  backgroundImage: '/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png',

  // Reward configuration
  rewards: {
    baseOranges: 10,
    bonusThresholds: [
      { score: 500, oranges: 5 },
      { score: 1000, oranges: 10 },
      { score: 2000, oranges: 20 },
      { score: 5000, oranges: 50 },
    ],
    perfectBonusOranges: 2,
    streakMultiplier: 0.1,
  },

  // Leaderboard
  leaderboardId: 'orange-stack',

  // Sound effects
  sounds: {
    blockLand: '/assets/sounds/block_land.mp3',
    perfectBonus: '/assets/sounds/perfect.mp3',
    combo: '/assets/sounds/combo.mp3',
    gameOver: '/assets/sounds/game_over.mp3',
    levelComplete: '/assets/sounds/level_complete.mp3',
  },

  // Game-specific settings
  settings: {
    maxLevels: MAX_LEVEL,
    hasLevels: true,
    hasPowerUps: true,
    hasComboSystem: true,
  },
};

export default ORANGE_STACK_CONFIG;
