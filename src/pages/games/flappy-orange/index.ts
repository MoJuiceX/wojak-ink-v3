/**
 * FlappyOrange Game Module
 *
 * Re-exports all configuration, types, utilities, and components.
 */

// Configuration
export * from './config';

// Types
export * from './types';

// Utilities
export * from './utils';

// Particles
export * from './particles';

// Weather system
export * from './weather';

// Audio
export * from './audio';

// Game logic (pure functions)
export * from './game-logic';

// Visual effects (pure functions)
export * from './effects';

// Input handling (pure functions)
export * from './input';

// Share system utilities
export * from './share';

// Scoring system (milestones, leaderboard tracking, celebrations)
export * from './scoring';

// Main component (re-export from pages for backwards compatibility)
// Note: The main FlappyOrange.tsx component is still in /src/pages/
// This module provides the extracted configuration, types, and utilities
