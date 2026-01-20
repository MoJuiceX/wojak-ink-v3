/**
 * Canvas Game Starter Template
 * Re-export all components, hooks, types, and config
 *
 * @example
 * import { GameCanvas, useGameLoop, useAudio, useInput } from './canvas-game-starter';
 * import { GAME_CONFIG, COLORS, SCORING } from './canvas-game-starter';
 * import type { GameState, Entity, Player } from './canvas-game-starter';
 */

// Components
export { GameCanvas } from './components';

// Hooks
export { useGameLoop, useAudio, useInput } from './hooks';
export type {
  UseGameLoopReturn,
  UseAudioReturn,
  UseInputReturn,
  SoundType,
  SoundOptions,
  InputAction,
  Point,
  Pointer,
  TouchInfo,
} from './hooks';

// Types
export type {
  GameState,
  Entity,
  Player,
  Obstacle,
  Collectible,
  Particle,
  ParticleSystem,
  ParticleConfig,
  Animation,
  ScreenShake,
  ScreenFlash,
  Camera,
  SaveData,
  GameEvent,
} from './types';

// Config
export {
  GAME_CONFIG,
  PHYSICS,
  PLAYER,
  DIFFICULTY,
  SCORING,
  JUICE,
  AUDIO,
  MOBILE,
  STORAGE,
  DEBUG,
  COLORS,
} from './config';
