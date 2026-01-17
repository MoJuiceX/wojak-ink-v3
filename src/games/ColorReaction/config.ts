/**
 * Color Reaction - Game Configuration
 */

import type { GameConfig } from '@/systems/game-ui/types';

export const COLORS = [
  { name: 'orange', hex: '#FF6B00', emoji: '🍊' },
  { name: 'lime', hex: '#32CD32', emoji: '🍋' },
  { name: 'grape', hex: '#8B5CF6', emoji: '🍇' },
  { name: 'berry', hex: '#3B82F6', emoji: '🫐' },
];

export const MATCH_WINDOW_MS = 1500;
export const BASE_CYCLE_MS = 2500;
export const MIN_CYCLE_MS = 1000;
export const GRACE_PERIOD_MS = 800;
export const TAP_DEBOUNCE_MS = 100;

export const getCycleSpeed = (score: number): number => {
  const reduction = Math.floor(score / 100) * 200;
  return Math.max(MIN_CYCLE_MS, BASE_CYCLE_MS - reduction);
};

export const calculateScore = (reactionTimeMs: number): { points: number; rating: string } => {
  if (reactionTimeMs < 300) return { points: 100, rating: 'PERFECT' };
  if (reactionTimeMs < 500) return { points: 75, rating: 'GREAT' };
  if (reactionTimeMs < 700) return { points: 50, rating: 'GOOD' };
  if (reactionTimeMs < 1000) return { points: 25, rating: 'OK' };
  return { points: 10, rating: 'SLOW' };
};

export const COLOR_REACTION_CONFIG: GameConfig = {
  id: 'color-reaction',
  name: 'Color Reaction',
  description: 'Tap when the colors match! Test your reaction time.',
  emoji: '🎨',
  primaryColor: '#8b5cf6',
  secondaryColor: '#3b82f6',

  rewards: {
    baseOranges: 5,
    bonusThresholds: [
      { score: 250, oranges: 5 },
      { score: 500, oranges: 10 },
      { score: 1000, oranges: 25 },
    ],
  },

  leaderboardId: 'color-reaction',

  settings: {
    hasLives: true,
    maxLives: 3,
    hasComboSystem: true,
  },
};

export default COLOR_REACTION_CONFIG;
