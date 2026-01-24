/**
 * BlockPuzzle Game Module
 *
 * Re-exports all configuration, types, and components.
 */

// Configuration
export * from './config';

// Types
export * from './types';

// Effects & Particles
export * from './effects';

// Haptics
export * from './haptics';

// Sounds
export * from './sounds';

// Game Logic (grid, pieces, scoring)
export * from './game-logic';

// Main component (re-export from pages for backwards compatibility)
// Note: The main BlockPuzzle.tsx component is still in /src/pages/
// This module provides the extracted configuration and types
