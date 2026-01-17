/**
 * Orange 2048 - Game Configuration
 */

import type { GameConfig } from '@/systems/game-ui/types';

export const GRID_SIZE = 4;

export const TILE_EMOJI: { [key: number]: string } = {
  2: '🍊',
  4: '🍋',
  8: '🍎',
  16: '🍇',
  32: '🍓',
  64: '🥭',
  128: '🍑',
  256: '🥝',
  512: '🍍',
  1024: '🌟',
  2048: '👑',
};

export const ORANGE_2048_CONFIG: GameConfig = {
  id: 'orange-2048',
  name: 'Orange 2048',
  description: 'Merge fruits to reach 2048! Swipe to combine matching tiles.',
  emoji: '🍊',
  primaryColor: '#ff6b00',
  secondaryColor: '#ffd700',

  rewards: {
    baseOranges: 5,
    bonusThresholds: [
      { score: 1000, oranges: 5 },
      { score: 2500, oranges: 15 },
      { score: 5000, oranges: 30 },
    ],
  },

  settings: {
    hasComboSystem: true,
  },
};

export default ORANGE_2048_CONFIG;
