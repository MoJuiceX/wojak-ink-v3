/**
 * FlappyOrange Game Loop Helpers
 *
 * Pure helper functions extracted from the main game loop.
 * These handle state updates without side effects (no sounds, no React state).
 * Side effects should be handled by the caller based on return values.
 */

import { BIRD_RADIUS, PIPE_WIDTH, PIPE_SPACING } from './config';
import { getSpeedMultiplier, getCurrentGapSize } from './game-logic';
import type { Bird, Pipe, Coin, GameStateRef } from './types';

// ============================================
// TYPES FOR HELPER RETURNS
// ============================================

export interface PipeUpdateResult {
  pipes: Pipe[];
  newScore: number;
  /** Pipes that were just passed (for triggering effects) */
  passedPipes: Array<{ pipe: Pipe; birdY: number }>;
}

export interface CoinUpdateResult {
  coins: Coin[];
  /** Coins that were just collected (for triggering effects) */
  collectedCoins: Coin[];
  scoreGained: number;
  /** Coins that went off-screen without being collected (for combo break) */
  missedCoins: Coin[];
}

export interface GamePhysicsResult {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  /** Info for triggering collision effects */
  collision: boolean;
  /** Coins collected this frame */
  coinsCollected: Coin[];
  /** Pipes passed this frame */
  pipesPassed: Array<{ pipe: Pipe; birdY: number }>;
}

// ============================================
// PIPE UPDATE LOGIC (Pure)
// ============================================

/**
 * Update pipe positions and check for passed pipes.
 * Returns updated pipes and info about which were passed.
 * Does NOT handle: sounds, floating scores, generating new pipes.
 */
export function updatePipePositions(
  pipes: Pipe[],
  currentScore: number,
  deltaTime: number,
  canvasHeight: number,
  birdX: number,
  birdY: number
): PipeUpdateResult {
  let newScore = currentScore;
  const passedPipes: Array<{ pipe: Pipe; birdY: number }> = [];

  // Get speed multiplier from difficulty tier
  const speedMultiplier = getSpeedMultiplier(currentScore);
  const baseSpeed = 2.5 * speedMultiplier;
  const speed = baseSpeed * deltaTime;

  // Update positions and oscillation
  pipes.forEach(pipe => {
    pipe.x -= speed;

    // Oscillate moving pipes
    if (pipe.isMoving) {
      pipe.movePhase += pipe.moveSpeed * 0.05 * deltaTime;
      pipe.gapY = pipe.baseGapY + Math.sin(pipe.movePhase) * pipe.moveRange;

      // Clamp to valid range
      const gapSize = getCurrentGapSize(currentScore);
      const minY = gapSize / 2 + 80;
      const maxY = canvasHeight - gapSize / 2 - 80;
      pipe.gapY = Math.max(minY, Math.min(maxY, pipe.gapY));
    }
  });

  // Filter off-screen pipes
  const filteredPipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

  // Check for passed pipes
  filteredPipes.forEach(pipe => {
    if (!pipe.passed && pipe.x < birdX) {
      pipe.passed = true;
      newScore += 1;
      passedPipes.push({ pipe, birdY });
    }
  });

  return { pipes: filteredPipes, newScore, passedPipes };
}

/**
 * Check if a new pipe should be spawned.
 * Returns true if the caller should generate a new pipe.
 */
export function shouldSpawnPipe(
  pipes: Pipe[],
  canvasWidth: number
): boolean {
  return pipes.length === 0 || pipes[pipes.length - 1].x < canvasWidth - PIPE_SPACING;
}

// ============================================
// COIN UPDATE LOGIC (Pure)
// ============================================

/**
 * Update coin positions and check for collection.
 * Returns updated coins and info about which were collected.
 * Also tracks missed coins (went off-screen without collection) for combo breaking.
 * Does NOT handle: sounds, floating scores, combo calculation.
 * 
 * NOTE: Score calculation is now done by the caller using combo multiplier.
 * scoreGained returns the RAW number of coins collected (not points).
 */
export function updateCoinPositions(
  coins: Coin[],
  speed: number,
  deltaTime: number,
  birdX: number,
  birdY: number
): CoinUpdateResult {
  const collectedCoins: Coin[] = [];
  const missedCoins: Coin[] = [];
  let scoreGained = 0;

  // Update positions
  coins.forEach(coin => {
    coin.x -= speed;
    coin.rotation += 0.08 * deltaTime;
  });

  // Check for missed coins (went off-screen without being collected)
  coins.forEach(coin => {
    if (coin.x <= -30 && !coin.collected) {
      missedCoins.push(coin);
    }
  });

  // Filter off-screen coins
  const filteredCoins = coins.filter(coin => coin.x > -30);

  // Check coin collision with bird
  filteredCoins.forEach(coin => {
    if (!coin.collected) {
      const dx = coin.x - birdX;
      const dy = coin.y - birdY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const collisionRadius = BIRD_RADIUS + 12;

      if (distance < collisionRadius) {
        coin.collected = true;
        scoreGained += 1; // Raw coin count (caller applies combo)
        collectedCoins.push(coin);
      }
    }
  });

  return { coins: filteredCoins, collectedCoins, scoreGained, missedCoins };
}

/**
 * Calculate the current pipe/coin movement speed.
 */
export function calculateMovementSpeed(
  currentScore: number,
  deltaTime: number,
  baseSpeed: number = 2.5
): number {
  const speedMultiplier = getSpeedMultiplier(currentScore);
  return baseSpeed * speedMultiplier * deltaTime;
}

// ============================================
// COLLISION HELPERS
// ============================================

/**
 * Process pipe collisions and scoring in one pass.
 * Returns collision status, pipes passed, and new score.
 */
export function processPipeCollisions(
  bird: Bird,
  pipes: Pipe[],
  currentScore: number,
  birdX: number,
  canvasHeight: number
): { passed: boolean; collision: boolean; newScore: number; passedPipes: Pipe[] } {
  let collision = false;
  let newScore = currentScore;
  const passedPipes: Pipe[] = [];

  // Ground collision check
  if (bird.y + BIRD_RADIUS > canvasHeight - 20) {
    collision = true;
  }

  // Pipe collision and passing check
  for (const pipe of pipes) {
    // Check if pipe is passed
    if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
      pipe.passed = true;
      newScore += 1;
      passedPipes.push(pipe);
    }

    // Skip collision check if pipe is not in horizontal range
    if (pipe.x > birdX + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < birdX - BIRD_RADIUS) {
      continue;
    }

    // Vertical collision check
    const gapSize = pipe.gapSize;
    const topPipeBottom = pipe.gapY - gapSize / 2;
    const bottomPipeTop = pipe.gapY + gapSize / 2;

    if (birdX + BIRD_RADIUS > pipe.x && birdX - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
      if (bird.y - BIRD_RADIUS < topPipeBottom || bird.y + BIRD_RADIUS > bottomPipeTop) {
        collision = true;
      }
    }
  }

  return { passed: passedPipes.length > 0, collision, newScore, passedPipes };
}

// ============================================
// GAME STATE UPDATE (Composite)
// ============================================

/**
 * Configuration for game state updates.
 */
export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  birdX: number;
}

/**
 * Full game state update result.
 * Includes all information needed to trigger effects.
 */
export interface GameUpdateResult {
  /** Updated bird state */
  bird: Bird;
  /** Updated pipes array */
  pipes: Pipe[];
  /** Updated coins array */
  coins: Coin[];
  /** New score after this frame */
  newScore: number;
  /** Whether bird collided with something */
  collision: boolean;
  /** Pipes that were passed this frame (for scoring effects) */
  passedPipes: Array<{ pipe: Pipe; birdY: number }>;
  /** Coins collected this frame (for collection effects) */
  collectedCoins: Coin[];
  /** Whether a new pipe should be spawned */
  shouldSpawnPipe: boolean;
}

/**
 * Perform a complete game state update for one frame.
 * This is a pure function that returns all info needed for side effects.
 *
 * Use this to simplify the game loop - call once, then handle effects based on result.
 *
 * Note: This does NOT update bird physics - that should be done separately
 * since it involves the updateBirdPhysics function from game-logic.ts.
 */
export function updateGameFrame(
  state: GameStateRef,
  coins: Coin[],
  deltaTime: number,
  config: GameConfig
): GameUpdateResult {
  const { canvasWidth, canvasHeight, birdX } = config;
  const birdY = state.bird.y;

  // Calculate movement speed
  const speed = calculateMovementSpeed(state.score, deltaTime);

  // Update pipe positions and check for passed pipes
  const pipeResult = updatePipePositions(
    state.pipes,
    state.score,
    deltaTime,
    canvasHeight,
    birdX,
    birdY
  );

  // Update coin positions and check for collection
  const coinResult = updateCoinPositions(
    coins,
    speed,
    deltaTime,
    birdX,
    birdY
  );

  // Combine scores
  const newScore = pipeResult.newScore + coinResult.scoreGained;

  // Check collision (pipes already updated)
  let collision = false;
  if (state.bird.y + BIRD_RADIUS > canvasHeight - 20) {
    collision = true;
  }
  // Also check pipe collision
  for (const pipe of pipeResult.pipes) {
    if (pipe.x > birdX + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < birdX - BIRD_RADIUS) {
      continue;
    }
    const gapSize = pipe.gapSize;
    const topPipeBottom = pipe.gapY - gapSize / 2;
    const bottomPipeTop = pipe.gapY + gapSize / 2;

    if (birdX + BIRD_RADIUS > pipe.x && birdX - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
      if (state.bird.y - BIRD_RADIUS < topPipeBottom || state.bird.y + BIRD_RADIUS > bottomPipeTop) {
        collision = true;
        break;
      }
    }
  }

  return {
    bird: state.bird,
    pipes: pipeResult.pipes,
    coins: coinResult.coins,
    newScore,
    collision,
    passedPipes: pipeResult.passedPipes,
    collectedCoins: coinResult.collectedCoins,
    shouldSpawnPipe: shouldSpawnPipe(pipeResult.pipes, canvasWidth),
  };
}

// ============================================
// NEAR-MISS DETECTION
// ============================================

/**
 * Check if the bird had a near-miss with any pipe.
 * Returns the closest distance to pipe edges if within threshold.
 */
export function checkNearMiss(
  bird: Bird,
  pipes: Pipe[],
  birdX: number,
  threshold: number = 15
): { isNearMiss: boolean; closestDistance: number } {
  let closestDistance = Infinity;

  for (const pipe of pipes) {
    // Only check pipes the bird is passing through
    if (birdX + BIRD_RADIUS < pipe.x || birdX - BIRD_RADIUS > pipe.x + PIPE_WIDTH) {
      continue;
    }

    const gapSize = pipe.gapSize;
    const topPipeBottom = pipe.gapY - gapSize / 2;
    const bottomPipeTop = pipe.gapY + gapSize / 2;

    // Distance to top pipe
    const distToTop = (bird.y - BIRD_RADIUS) - topPipeBottom;
    // Distance to bottom pipe
    const distToBottom = bottomPipeTop - (bird.y + BIRD_RADIUS);

    const minDist = Math.min(Math.abs(distToTop), Math.abs(distToBottom));
    if (minDist < closestDistance) {
      closestDistance = minDist;
    }
  }

  return {
    isNearMiss: closestDistance < threshold && closestDistance > 0,
    closestDistance,
  };
}

// ============================================
// DELTA TIME HELPERS
// ============================================

/**
 * Calculate normalized delta time for frame-rate independent physics.
 * Normalizes to 60fps (16.67ms per frame) and caps at 4x to handle lag.
 */
export function calculateDeltaTime(
  currentTime: number,
  lastTime: number,
  maxMultiplier: number = 4
): number {
  const rawDelta = (currentTime - lastTime) / 16.67;
  return Math.min(rawDelta, maxMultiplier);
}

/**
 * Apply time scale for slow-mo effects.
 */
export function applyTimeScale(
  deltaTime: number,
  timeScale: number
): number {
  return deltaTime * timeScale;
}
