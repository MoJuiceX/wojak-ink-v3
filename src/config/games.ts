/**
 * Games Configuration
 *
 * Mini-games data for the Media Hub.
 */

import type { MiniGame } from '@/types/media';

export const MINI_GAMES: MiniGame[] = [
  {
    id: 'orange-slice',
    name: 'Orange Slice',
    emoji: '🍊',
    description: 'Slice falling oranges before they hit the ground!',
    status: 'coming-soon',
    accentColor: '#ff6b00',
    hasHighScores: true,
    difficulty: 'easy',
    estimatedPlayTime: '2-5 min',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: true,
      audioDescriptions: false,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Oranges fall from the top of the screen' },
      { step: 2, text: 'Swipe or press keys to slice them' },
      { step: 3, text: "Don't let any oranges hit the ground!" },
      { step: 4, text: 'Combo slices for bonus points' },
    ],
    controls: [
      { input: 'Mouse/Touch', action: 'Slice', alternatives: ['Arrow Keys'] },
      { input: 'Space', action: 'Pause' },
      { input: 'R', action: 'Restart' },
    ],
  },
  {
    id: 'orange-stack',
    name: 'Orange Stack',
    emoji: '📦',
    description: 'Stack oranges as high as you can without toppling!',
    status: 'coming-soon',
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
      { step: 1, text: 'An orange swings back and forth' },
      { step: 2, text: 'Tap or press Space to drop it' },
      { step: 3, text: 'Land it perfectly on the stack' },
      { step: 4, text: 'Misaligned drops shrink the platform' },
    ],
    controls: [
      { input: 'Space / Click / Tap', action: 'Drop orange' },
      { input: 'P', action: 'Pause' },
      { input: 'Escape', action: 'Exit game' },
    ],
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    emoji: '🧠',
    description: 'Match pairs of Wojak traits in this memory game!',
    status: 'coming-soon',
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
      { step: 1, text: 'A grid of face-down cards appears' },
      { step: 2, text: 'Flip two cards to reveal them' },
      { step: 3, text: 'If they match, they stay revealed' },
      { step: 4, text: 'Find all pairs in the fewest moves' },
    ],
    controls: [
      { input: 'Click / Tap', action: 'Flip card' },
      { input: 'Arrow Keys', action: 'Navigate grid' },
      { input: 'Enter / Space', action: 'Select card' },
      { input: 'Tab', action: 'Move between cards' },
    ],
  },
  {
    id: 'orange-pong',
    name: 'Orange Pong',
    emoji: '🏓',
    description: 'Classic Pong with an orange twist!',
    status: 'coming-soon',
    accentColor: '#ec4899',
    hasHighScores: true,
    difficulty: 'medium',
    estimatedPlayTime: '5-15 min',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: false,
      colorBlindMode: true,
      reducedMotionSupport: false,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Move your paddle to hit the orange' },
      { step: 2, text: "Don't let it pass your side" },
      { step: 3, text: 'First to 10 points wins!' },
      { step: 4, text: 'Play vs AI or a friend (same keyboard)' },
    ],
    controls: [
      { input: 'W / S or Up / Down', action: 'Move paddle' },
      { input: 'Player 2: A / Z', action: 'Move paddle (2P mode)' },
      { input: 'Space', action: 'Serve / Pause' },
    ],
  },
  {
    id: 'wojak-runner',
    name: 'Wojak Runner',
    emoji: '🏃',
    description: 'Help Wojak run and jump through obstacles!',
    status: 'coming-soon',
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
      { step: 2, text: 'Tap or press Space to jump' },
      { step: 3, text: 'Double-tap for a higher jump' },
      { step: 4, text: 'Collect Tang oranges for points' },
      { step: 5, text: 'Avoid red candles and rug-pulls!' },
    ],
    controls: [
      { input: 'Space / Click / Tap', action: 'Jump' },
      { input: 'Double Space', action: 'High jump' },
      { input: 'Down Arrow', action: 'Slide/duck' },
    ],
  },
  {
    id: '2048-oranges',
    name: '2048 Oranges',
    emoji: '🔢',
    description: 'Slide and merge oranges to reach 2048!',
    status: 'coming-soon',
    accentColor: '#3b82f6',
    hasHighScores: true,
    difficulty: 'medium',
    estimatedPlayTime: '5-20 min',
    accessibilityFeatures: {
      keyboardPlayable: true,
      screenReaderSupport: true,
      colorBlindMode: true,
      reducedMotionSupport: true,
      audioDescriptions: true,
      pauseAnytime: true,
    },
    instructions: [
      { step: 1, text: 'Swipe or use arrow keys to move tiles' },
      { step: 2, text: 'Matching numbers merge and double' },
      { step: 3, text: '2 + 2 = 4, 4 + 4 = 8, etc.' },
      { step: 4, text: 'Reach 2048 to win!' },
    ],
    controls: [
      { input: 'Arrow Keys / WASD', action: 'Move tiles' },
      { input: 'Swipe', action: 'Move tiles (touch)' },
      { input: 'R', action: 'Restart' },
      { input: 'Z', action: 'Undo last move' },
    ],
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
