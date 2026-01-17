/**
 * Audio System
 *
 * Centralized sound effects system for games.
 *
 * Usage:
 *   import { useGameSounds, SoundManager, MuteButton } from '@/systems/audio';
 *
 *   // In a game component:
 *   const { playScore, playCombo, playGameOver } = useGameSounds();
 *
 *   // Play sounds
 *   playScore();
 *   playCombo(5);
 *   playGameOver();
 */

// Core manager
export { SoundManager } from './SoundManager';

// Hooks
export { useGameSounds } from './useGameSounds';

// Components
export { SoundSettings, MuteButton, MuteToggle } from './SoundSettings';

// Types and definitions
export { SOUND_DEFINITIONS, getComboSound, getSoundDefinition } from './sounds';
export type { SoundName, SoundDefinition } from './sounds';
