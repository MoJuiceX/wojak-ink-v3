/**
 * FlappyOrange Visual Effects
 *
 * Pure functions for screen shake, impact flash, flap deformation,
 * and death sequence effects. These can be used without React state.
 */

import type { ShakeState, Bird } from './types';
import { JUICE_CONFIG } from './config';

// ============================================
// SCREEN SHAKE
// ============================================

/**
 * Create a new screen shake state
 */
export function createScreenShake(intensity: number, duration: number): ShakeState {
  return {
    intensity,
    startTime: Date.now(),
    duration,
  };
}

/**
 * Calculate current shake offset based on elapsed time
 * Returns { x: 0, y: 0 } if shake is complete or null
 */
export function calculateShakeOffset(shake: ShakeState | null): { x: number; y: number; isComplete: boolean } {
  if (!shake) {
    return { x: 0, y: 0, isComplete: true };
  }

  const elapsed = Date.now() - shake.startTime;
  if (elapsed > shake.duration) {
    return { x: 0, y: 0, isComplete: true };
  }

  const progress = elapsed / shake.duration;
  const decay = 1 - progress;
  const intensity = shake.intensity * decay;

  const offsetX = (Math.random() - 0.5) * intensity * 2;
  const offsetY = (Math.random() - 0.5) * intensity * 2;

  return { x: offsetX, y: offsetY, isComplete: false };
}

/**
 * Apply screen shake to canvas context
 * Modifies the context's transform
 */
export function applyShakeToContext(
  ctx: CanvasRenderingContext2D,
  shake: ShakeState | null
): boolean {
  const { x, y, isComplete } = calculateShakeOffset(shake);
  if (!isComplete) {
    ctx.translate(x, y);
  }
  return isComplete;
}

// ============================================
// FLAP DEFORMATION
// ============================================

/**
 * Apply flap squash/stretch deformation to bird
 * Returns a new bird object with deformation applied
 */
export function applyFlapDeformation(bird: Bird): Bird {
  return {
    ...bird,
    scaleX: JUICE_CONFIG.FLAP_SCALE_X,
    scaleY: JUICE_CONFIG.FLAP_SCALE_Y,
  };
}

/**
 * Reset bird deformation back to normal
 */
export function resetBirdDeformation(bird: Bird): Bird {
  return {
    ...bird,
    scaleX: 1,
    scaleY: 1,
  };
}

/**
 * Get deformation values for current time during flap animation
 * Returns scale values based on elapsed time since flap
 */
export function getFlapDeformationValues(elapsedMs: number): { scaleX: number; scaleY: number } {
  if (elapsedMs < JUICE_CONFIG.FLAP_DURATION) {
    // Still in squash phase
    return {
      scaleX: JUICE_CONFIG.FLAP_SCALE_X,
      scaleY: JUICE_CONFIG.FLAP_SCALE_Y,
    };
  } else if (elapsedMs < JUICE_CONFIG.FLAP_DURATION + JUICE_CONFIG.FLAP_RETURN_DURATION) {
    // In return phase - lerp back to 1
    const returnProgress = (elapsedMs - JUICE_CONFIG.FLAP_DURATION) / JUICE_CONFIG.FLAP_RETURN_DURATION;
    const eased = 1 - Math.pow(1 - returnProgress, 2); // Ease out quad
    return {
      scaleX: JUICE_CONFIG.FLAP_SCALE_X + (1 - JUICE_CONFIG.FLAP_SCALE_X) * eased,
      scaleY: JUICE_CONFIG.FLAP_SCALE_Y + (1 - JUICE_CONFIG.FLAP_SCALE_Y) * eased,
    };
  }
  // Animation complete
  return { scaleX: 1, scaleY: 1 };
}

// ============================================
// DEATH SLOW-MOTION
// ============================================

/**
 * Calculate time scale for death slow-motion effect
 * Returns 1.0 when animation is complete
 */
export function calculateDeathSlowMo(elapsedTime: number): { timeScale: number; isComplete: boolean } {
  if (elapsedTime >= JUICE_CONFIG.SLOW_MO_DURATION) {
    return { timeScale: 1, isComplete: true };
  }

  // During slow-mo, use the configured slow-mo scale
  return { timeScale: JUICE_CONFIG.SLOW_MO_SCALE, isComplete: false };
}

/**
 * Get death knockback values for bird
 */
export function getDeathKnockback(): { velocityX: number; velocityY: number; rotationVelocity: number } {
  return {
    velocityX: -JUICE_CONFIG.DEATH_KNOCKBACK_X,
    velocityY: JUICE_CONFIG.DEATH_KNOCKBACK_Y,
    rotationVelocity: JUICE_CONFIG.TUMBLE_ROTATION_SPEED,
  };
}

/**
 * Apply death knockback to bird, returning new bird state
 */
export function applyDeathKnockback(bird: Bird): Bird {
  const knockback = getDeathKnockback();
  return {
    ...bird,
    velocityX: knockback.velocityX,
    velocity: knockback.velocityY,
    rotationVelocity: knockback.rotationVelocity,
  };
}

// ============================================
// IMPACT FLASH
// ============================================

/**
 * Get impact flash alpha value based on elapsed time
 */
export function getImpactFlashAlpha(elapsedMs: number): number {
  if (elapsedMs >= JUICE_CONFIG.IMPACT_FLASH_DURATION) {
    return 0;
  }
  // Linear fade out
  const progress = elapsedMs / JUICE_CONFIG.IMPACT_FLASH_DURATION;
  return JUICE_CONFIG.IMPACT_FLASH_ALPHA * (1 - progress);
}

// ============================================
// PASS PULSE
// ============================================

/**
 * Get screen brightness multiplier for pass pulse effect
 */
export function getPassPulseBrightness(elapsedMs: number, duration: number = 100): number {
  if (elapsedMs >= duration) {
    return 1;
  }
  // Quick pulse that fades back to normal
  const progress = elapsedMs / duration;
  const pulseAmount = JUICE_CONFIG.SCREEN_PULSE_INTENSITY * (1 - progress);
  return 1 + pulseAmount;
}

// ============================================
// TIMING CONSTANTS (re-exported for convenience)
// ============================================

export const EFFECT_DURATIONS = {
  FREEZE: JUICE_CONFIG.FREEZE_DURATION,
  SLOW_MO: JUICE_CONFIG.SLOW_MO_DURATION,
  IMPACT_FLASH: JUICE_CONFIG.IMPACT_FLASH_DURATION,
  SCREEN_SHAKE: JUICE_CONFIG.SCREEN_SHAKE_DURATION,
  FLAP: JUICE_CONFIG.FLAP_DURATION,
  FLAP_RETURN: JUICE_CONFIG.FLAP_RETURN_DURATION,
} as const;

export const EFFECT_INTENSITIES = {
  SCREEN_SHAKE: JUICE_CONFIG.SCREEN_SHAKE_INTENSITY,
  IMPACT_FLASH: JUICE_CONFIG.IMPACT_FLASH_ALPHA,
  SCREEN_PULSE: JUICE_CONFIG.SCREEN_PULSE_INTENSITY,
} as const;
