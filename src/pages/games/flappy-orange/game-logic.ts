/**
 * FlappyOrange Game Logic
 *
 * Pure game logic functions extracted from the main component.
 * These functions have no side effects and can be easily tested.
 */

import { PHYSICS, DIFFICULTY_CONFIG, BIRD_RADIUS, PIPE_WIDTH } from './config';
import type { Bird, Pipe } from './types';

// ============================================
// DIFFICULTY FUNCTIONS
// ============================================

/**
 * Get the difficulty tier based on the current score.
 * Higher tiers mean harder gameplay.
 */
export function getDifficultyTier(score: number): number {
  const thresholds = DIFFICULTY_CONFIG.TIER_THRESHOLDS;
  for (let i = 0; i < thresholds.length; i++) {
    if (score < thresholds[i]) return i;
  }
  return thresholds.length;
}

/**
 * Get the current gap size based on difficulty tier.
 * Lower gap sizes make the game harder.
 */
export function getCurrentGapSize(score: number): number {
  const tier = getDifficultyTier(score);
  return DIFFICULTY_CONFIG.GAP_SIZES[tier] || DIFFICULTY_CONFIG.GAP_SIZES[DIFFICULTY_CONFIG.GAP_SIZES.length - 1];
}

/**
 * Get the current speed multiplier based on difficulty tier.
 * Higher multipliers make pipes move faster.
 */
export function getSpeedMultiplier(score: number): number {
  const tier = getDifficultyTier(score);
  return DIFFICULTY_CONFIG.SPEED_MULTIPLIERS[tier] || DIFFICULTY_CONFIG.SPEED_MULTIPLIERS[DIFFICULTY_CONFIG.SPEED_MULTIPLIERS.length - 1];
}

/**
 * Get the moving pipe chance for the current difficulty tier.
 */
export function getMovingPipeChance(score: number): number {
  const tier = getDifficultyTier(score);
  return DIFFICULTY_CONFIG.MOVING_PIPE_CHANCES[tier] || 0;
}

// ============================================
// COLLISION DETECTION
// ============================================

/**
 * Check if the bird has collided with pipes or ground.
 * Returns true if collision detected.
 */
export function checkCollision(
  bird: Bird,
  pipes: Pipe[],
  canvasHeight: number,
  birdX: number
): boolean {
  // Ground collision - game over
  if (bird.y + BIRD_RADIUS > canvasHeight - 20) return true;

  // Pipe collision
  for (const pipe of pipes) {
    // Skip if pipe is not in collision range horizontally
    if (pipe.x > birdX + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < birdX - BIRD_RADIUS) {
      continue;
    }

    // Use the pipe's own gapSize (set at creation time)
    const gapSize = pipe.gapSize;
    const topPipeBottom = pipe.gapY - gapSize / 2;
    const bottomPipeTop = pipe.gapY + gapSize / 2;

    if (birdX + BIRD_RADIUS > pipe.x && birdX - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
      if (bird.y - BIRD_RADIUS < topPipeBottom || bird.y + BIRD_RADIUS > bottomPipeTop) {
        return true;
      }
    }
  }

  return false;
}

// ============================================
// PIPE GENERATION
// ============================================

/**
 * Generate a new pipe with properties based on current difficulty.
 */
export function generatePipe(
  canvasWidth: number,
  canvasHeight: number,
  currentScore: number,
  isFirst: boolean = false,
  frostLevel: number = 0
): Pipe {
  // Get dynamic gap size based on difficulty tier
  const gapSize = getCurrentGapSize(currentScore);
  const minGapY = gapSize / 2 + 100;
  const maxGapY = canvasHeight - gapSize / 2 - 100;
  const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

  // Check if this pipe should move (based on difficulty tier)
  const tier = getDifficultyTier(currentScore);
  const movingChance = DIFFICULTY_CONFIG.MOVING_PIPE_CHANCES[tier] || 0;
  const isMoving = !isFirst && Math.random() < movingChance;

  return {
    x: isFirst ? canvasWidth + PIPE_WIDTH + 300 : canvasWidth + PIPE_WIDTH,
    gapY,
    passed: false,
    isMoving,
    moveSpeed: isMoving
      ? DIFFICULTY_CONFIG.MOVE_SPEED.min + Math.random() * (DIFFICULTY_CONFIG.MOVE_SPEED.max - DIFFICULTY_CONFIG.MOVE_SPEED.min)
      : 0,
    moveDirection: Math.random() > 0.5 ? 1 : -1,
    moveRange: isMoving
      ? DIFFICULTY_CONFIG.MOVE_RANGE.min + Math.random() * (DIFFICULTY_CONFIG.MOVE_RANGE.max - DIFFICULTY_CONFIG.MOVE_RANGE.min)
      : 0,
    baseGapY: gapY,
    movePhase: Math.random() * Math.PI * 2,
    gapSize,
    frostLevel,  // Capture current snow level at spawn
  };
}

// ============================================
// BIRD PHYSICS
// ============================================

/**
 * Update bird physics (position, velocity, rotation).
 * Returns a new bird state without mutating the input.
 */
export function updateBirdPhysics(
  bird: Bird,
  timeScale: number = 1,
  isDying: boolean = false
): Bird {
  const dt = timeScale;

  let newVelocity = bird.velocity + PHYSICS.GRAVITY * dt;

  // Cap falling speed
  if (newVelocity > PHYSICS.MAX_FALL_SPEED) {
    newVelocity = PHYSICS.MAX_FALL_SPEED;
  }

  let newY = bird.y + newVelocity * dt;

  // X movement for death knockback
  let newVelocityX = bird.velocityX;

  // Ceiling clamp - bird bounces off ceiling instead of dying (only if not dying)
  if (!isDying && newY - BIRD_RADIUS < 10) {
    newY = BIRD_RADIUS + 10;
    newVelocity = 0; // Stop upward momentum
  }

  // Rotation
  let newRotation: number;
  const newRotationVelocity = bird.rotationVelocity;

  if (isDying && bird.rotationVelocity !== 0) {
    // Tumble rotation during death
    newRotation = bird.rotation + bird.rotationVelocity * dt * 0.016; // Convert to per-frame
  } else {
    // Smooth rotation based on velocity
    newRotation = bird.rotation + (newVelocity > 0 ? PHYSICS.ROTATION_SPEED : -PHYSICS.ROTATION_SPEED * 2);
    newRotation = Math.max(-0.4, Math.min(newRotation, Math.PI / 3)); // Less extreme rotation
  }

  // Decay X velocity
  newVelocityX *= 0.98;

  return {
    y: newY,
    velocity: newVelocity,
    rotation: newRotation,
    scaleX: bird.scaleX,
    scaleY: bird.scaleY,
    velocityX: newVelocityX,
    rotationVelocity: newRotationVelocity,
  };
}

/**
 * Apply jump physics to the bird.
 * Returns a new bird state with jump velocity applied.
 */
export function applyJump(bird: Bird): Bird {
  return {
    ...bird,
    velocity: PHYSICS.JUMP_VELOCITY,
  };
}

/**
 * Create initial bird state.
 */
export function createInitialBird(startY: number): Bird {
  return {
    y: startY,
    velocity: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    velocityX: 0,
    rotationVelocity: 0,
  };
}

// ============================================
// PIPE UPDATES
// ============================================

/**
 * Update a moving pipe's vertical position.
 * Returns the new gapY value clamped to valid range.
 */
export function updateMovingPipe(
  pipe: Pipe,
  deltaTime: number,
  canvasHeight: number,
  currentScore: number
): number {
  if (!pipe.isMoving) return pipe.gapY;

  const newPhase = pipe.movePhase + pipe.moveSpeed * 0.05 * deltaTime;
  let newGapY = pipe.baseGapY + Math.sin(newPhase) * pipe.moveRange;

  // Clamp to valid range
  const gapSize = getCurrentGapSize(currentScore);
  const minY = gapSize / 2 + 80;
  const maxY = canvasHeight - gapSize / 2 - 80;
  newGapY = Math.max(minY, Math.min(maxY, newGapY));

  return newGapY;
}

/**
 * Calculate pipe speed based on current score.
 */
export function calculatePipeSpeed(currentScore: number, baseSpeed: number = 2.5): number {
  const speedMultiplier = getSpeedMultiplier(currentScore);
  return baseSpeed * speedMultiplier;
}
