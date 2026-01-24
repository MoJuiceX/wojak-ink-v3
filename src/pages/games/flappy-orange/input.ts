/**
 * FlappyOrange Input Handling
 *
 * Pure functions for input handling and game state initialization.
 * Extracted from FlappyOrange.tsx to reduce component size.
 */

import type { Bird, GameState, GameStateRef, Star } from './types';
import { PHYSICS } from './config';
import { createInitialBird } from './game-logic';

// ============================================
// INITIAL STATE
// ============================================

/**
 * Create the initial game state ref object.
 * This is used to reset the game and initialize on mount.
 */
export function createInitialGameState(canvasHeight: number): GameStateRef {
  return {
    bird: createInitialBird(canvasHeight / 2),
    pipes: [],
    score: 0,
    gameState: 'idle',
    frameCount: 0,
    stars: [],
    isFrozen: false,
    timeScale: 1,
    isDying: false,
  };
}

// ============================================
// FLAP / JUMP HANDLING
// ============================================

/**
 * Apply jump velocity and rotation to bird.
 * Returns a new bird object with jump applied.
 */
export function handleFlap(bird: Bird): Bird {
  return {
    ...bird,
    velocity: PHYSICS.JUMP_VELOCITY,
    rotation: -0.4,
  };
}

/**
 * Apply jump to bird and optionally apply deformation.
 * Convenience function for full flap effect.
 */
export function handleFlapWithDeformation(
  bird: Bird,
  scaleX: number = 0.85,
  scaleY: number = 1.3
): Bird {
  return {
    ...bird,
    velocity: PHYSICS.JUMP_VELOCITY,
    rotation: -0.4,
    scaleX,
    scaleY,
  };
}

// ============================================
// INPUT GUARDS
// ============================================

/**
 * Check if tap/input should be ignored based on game state.
 * Used to prevent input during game over or exit dialogs.
 */
export function shouldIgnoreTap(
  gameState: GameState,
  showExitDialog: boolean
): boolean {
  // Ignore when game is over - use Play Again button instead
  if (gameState === 'gameover') {
    return true;
  }

  // Ignore when exit dialog is showing
  if (showExitDialog) {
    return true;
  }

  return false;
}

/**
 * Check if tap/input should be ignored when bird is dying.
 */
export function shouldIgnoreInput(
  gameState: GameState,
  isDying: boolean,
  showExitDialog: boolean
): boolean {
  if (gameState === 'gameover' || isDying) {
    return true;
  }

  if (showExitDialog) {
    return true;
  }

  return false;
}

/**
 * Check if the target element should block tap propagation.
 * Prevents jumps when clicking UI elements.
 */
export function shouldBlockTapPropagation(target: HTMLElement): boolean {
  // Block taps on buttons
  if (target.closest('button')) {
    return true;
  }

  // Block taps on debug panel
  if (target.closest('.fo-debug-weather')) {
    return true;
  }

  // Block taps on high z-index overlays
  if (target.closest('[style*="zIndex: 999999"]')) {
    return true;
  }

  return false;
}

// ============================================
// GAME START / TRANSITION
// ============================================

/**
 * Transition game state from idle to playing.
 * Returns the updated game state ref (mutates for performance).
 */
export function startGameFromIdle(
  state: GameStateRef,
  stars: Star[]
): GameStateRef {
  if (state.gameState === 'idle') {
    state.gameState = 'playing';
    state.stars = stars;
  }
  return state;
}

/**
 * Handle a jump action during play on a GameStateRef.
 * Updates bird velocity and rotation (mutates for performance).
 * Named differently from game-logic's applyJump which takes a Bird.
 */
export function applyJumpToState(state: GameStateRef): void {
  if (state.gameState === 'playing') {
    state.bird.velocity = PHYSICS.JUMP_VELOCITY;
    state.bird.rotation = -0.4;
  }
}

/**
 * Handle tap input - combines idle start and playing jump.
 * Returns true if game just started (was idle).
 */
export function handleTapInput(
  state: GameStateRef,
  stars: Star[]
): { didStart: boolean } {
  const wasIdle = state.gameState === 'idle';

  if (wasIdle) {
    state.gameState = 'playing';
    state.stars = stars;
  }

  if (state.gameState === 'playing') {
    state.bird.velocity = PHYSICS.JUMP_VELOCITY;
    state.bird.rotation = -0.4;
  }

  return { didStart: wasIdle };
}

// ============================================
// TOUCH EVENT HELPERS
// ============================================

/**
 * Get touch position from a TouchEvent.
 * Returns null if no touches available.
 */
export function getTouchPosition(
  event: TouchEvent
): { x: number; y: number } | null {
  if (event.touches.length === 0) {
    return null;
  }

  const touch = event.touches[0];
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
}

/**
 * Get touch position relative to canvas.
 */
export function getTouchPositionInCanvas(
  event: TouchEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } | null {
  const position = getTouchPosition(event);
  if (!position) {
    return null;
  }

  const rect = canvas.getBoundingClientRect();
  return {
    x: position.x - rect.left,
    y: position.y - rect.top,
  };
}

// ============================================
// KEYBOARD HELPERS
// ============================================

/**
 * Check if a keyboard event should trigger a flap.
 * Space bar is the typical flap key.
 */
export function isFlapKey(event: KeyboardEvent): boolean {
  return event.code === 'Space' || event.key === ' ';
}

/**
 * Check if a keyboard event should trigger restart.
 */
export function isRestartKey(event: KeyboardEvent): boolean {
  return event.code === 'KeyR' || event.key === 'r' || event.key === 'R';
}

/**
 * Check if a keyboard event should pause/resume.
 */
export function isPauseKey(event: KeyboardEvent): boolean {
  return event.code === 'Escape' || event.key === 'Escape';
}
