/**
 * Wojak Games - Shared Systems
 *
 * This module exports all shared systems used across games.
 * Import from here to access effects, UI components, engagement hooks, and theme.
 *
 * Usage:
 * import { useEffects, GameShell, useGameSession } from '@/systems';
 * // or
 * import { useEffects } from '@/systems/effects';
 * import { GameShell } from '@/systems/game-ui';
 * import { useGameSession } from '@/systems/engagement';
 */

// Effects System
export * from './effects';

// Game UI Components
export * from './game-ui';

// Engagement Hooks
export * from './engagement';

// Theme (CSS imports should be done separately)
// import '@/systems/theme/index.css';
