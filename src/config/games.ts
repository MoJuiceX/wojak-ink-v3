/**
 * Games Configuration
 *
 * Mini-games data for the Media Hub.
 */

import type { MiniGame } from '@/types/media';

export const MINI_GAMES: MiniGame[] = [
  {
    id: 'orange-stack',
    name: 'Orange Stack',
    emoji: '📦',
    description: 'Stack oranges as high as you can without toppling!',
    status: 'available',
    route: '/media/games/stack',
    accentColor: '#f59e0b',
    hasHighScores: true,
    difficulty: 'medium',
    estimatedPlayTime: '3-10 min',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: true,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Tap to drop the swinging block onto the stack' },
      { step: 2, text: 'Perfect alignment = +50 bonus points' },
      { step: 3, text: 'Drop faster for speed bonus (up to +30)' },
      { step: 4, text: 'Each wall bounce = -1 point penalty' },
      { step: 5, text: 'Build combos for score multipliers!' },
    ],
    controls: [],
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    emoji: '🧠',
    description: 'Match pairs of Wojak traits in this memory game!',
    status: 'available',
    route: '/media/games/memory',
    accentColor: '#8b5cf6',
    hasHighScores: true,
    difficulty: 'easy',
    estimatedPlayTime: '2-5 min',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: true,
      colorBlindMode: true,
      reducedMotionSupport: true,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Flip the cards' },
    ],
    controls: [],
  },
  {
    id: 'orange-pong',
    name: 'Orange Pong',
    emoji: '🏓',
    description: 'Classic Pong with an orange twist!',
    status: 'available',
    route: '/media/games/pong',
    accentColor: '#ec4899',
    hasHighScores: true,
    difficulty: 'medium',
    estimatedPlayTime: '5-15 min',
    accessibilityFeatures: {
      keyboardPlayable: false,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Play against the AI!' },
      { step: 2, text: 'Move your paddle to hit the 🍊 orange' },
      { step: 3, text: "Don't let it pass your side" },
      { step: 4, text: 'First to 5 wins the match' },
      { step: 5, text: 'Build streaks for bonus points: 1→2→4' },
    ],
    controls: [
      { input: 'Mouse / Touch', action: 'Move paddle up/down' },
    ],
  },
  {
    id: 'wojak-runner',
    name: 'Wojak Runner',
    emoji: '🏃',
    description: 'Help Wojak run and jump through obstacles!',
    status: 'available',
    route: '/media/games/runner',
    accentColor: '#22c55e',
    hasHighScores: true,
    difficulty: 'hard',
    estimatedPlayTime: 'Endless',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Wojak runs automatically' },
      { step: 2, text: 'Swipe left/right to dodge obstacles' },
      { step: 3, text: 'Collect 🍊 oranges for points' },
      { step: 4, text: 'Avoid 🐫 camels and 🐻 bears!' },
    ],
    controls: [
      { input: 'Arrow Left / Right', action: 'Change lane' },
      { input: 'Swipe Left / Right', action: 'Change lane' },
    ],
  },
  {
    id: 'orange-juggle',
    name: 'Juggle the Orange',
    emoji: '🦧',
    description: 'Juggle oranges with your orangutan! Avoid the camels!',
    status: 'available',
    route: '/media/games/juggle',
    accentColor: '#f97316',
    hasHighScores: true,
    difficulty: 'easy',
    estimatedPlayTime: '3-15 min',
    accessibilityFeatures: {
      keyboardPlayable: false,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Keep 🍊 oranges bouncing' },
      { step: 2, text: 'Avoid 🐫 camels - they\'ll kill you!' },
      { step: 3, text: '🍌 Bananas make you faster' },
      { step: 4, text: '🥃 Rum will make you drunk' },
      { step: 5, text: 'Pro tip: 🍌 bananas sober you up!' },
    ],
    controls: [],
  },
  {
    id: 'knife-game',
    name: 'The Knife Game',
    emoji: '🔪',
    description: 'Stab between your fingers as fast as you can!',
    status: 'available',
    route: '/media/games/knife',
    accentColor: '#ef4444',
    hasHighScores: false,
    difficulty: 'hard',
    estimatedPlayTime: '1-5 min',
    accessibilityFeatures: {
      keyboardPlayable: false,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: false,
      pauseAnytime: false,
    },
    instructions: [
      { step: 1, text: 'Stab between your fingers as fast as you can' },
      { step: 2, text: 'Don\'t hit your fingers!' },
      { step: 3, text: 'Sing along to the song!' },
    ],
    controls: [],
  },
];

// Accessibility icons mapping
export const ACCESSIBILITY_ICONS: Record<keyof MiniGame['accessibilityFeatures'], { icon: string; label: string }> = {
  keyboardPlayable: { icon: '⌨️', label: 'Keyboard playable' },
  screenReaderSupport: { icon: '♿', label: 'Screen reader support' },
  colorBlindMode: { icon: '🎨', label: 'Color blind mode' },
  reducedMotionSupport: { icon: '🔄', label: 'Reduced motion support' },
  audioDescriptions: { icon: '🔊', label: 'Audio descriptions' },
  pauseAnytime: { icon: '⏸️', label: 'Pause anytime' },
};

// Difficulty colors
export const DIFFICULTY_COLORS: Record<NonNullable<MiniGame['difficulty']>, string> = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

// Get game by ID
export function getGameById(id: string): MiniGame | undefined {
  return MINI_GAMES.find((game) => game.id === id);
}

// Get available games
export function getAvailableGames(): MiniGame[] {
  return MINI_GAMES.filter((game) => game.status === 'available');
}

// Get coming soon games
export function getComingSoonGames(): MiniGame[] {
  return MINI_GAMES.filter((game) => game.status === 'coming-soon');
}
