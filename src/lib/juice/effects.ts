/**
 * Screen Effects Library
 * Screen shake, flash, vignette, chromatic aberration, and more
 *
 * @example
 * import { createScreenShake, updateScreenShake, applyScreenShake } from '@/lib/juice/effects';
 *
 * const shake = createScreenShake(8, 200);
 * // In game loop:
 * const offset = updateScreenShake(shake, deltaTime);
 * ctx.translate(offset.x, offset.y);
 */

// ============================================
// SCREEN SHAKE
// ============================================

export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  frequency: number;
  decay: boolean;
  isActive: boolean;
}

export interface ShakeOffset {
  x: number;
  y: number;
}

/**
 * Create a screen shake effect
 */
export const createScreenShake = (
  intensity: number,
  duration: number,
  options?: {
    frequency?: number;
    decay?: boolean;
  }
): ScreenShake => ({
  intensity,
  duration,
  elapsed: 0,
  frequency: options?.frequency ?? 30,
  decay: options?.decay ?? true,
  isActive: true,
});

/**
 * Update shake and return current offset
 */
export const updateScreenShake = (
  shake: ScreenShake,
  deltaTime: number
): ShakeOffset => {
  if (!shake.isActive) return { x: 0, y: 0 };

  shake.elapsed += deltaTime;

  if (shake.elapsed >= shake.duration) {
    shake.isActive = false;
    return { x: 0, y: 0 };
  }

  // Calculate decay
  const progress = shake.elapsed / shake.duration;
  const currentIntensity = shake.decay
    ? shake.intensity * (1 - progress)
    : shake.intensity;

  // Perlin-like noise (simplified)
  const time = shake.elapsed * shake.frequency * 0.001;
  const x = (Math.sin(time * 1.1) + Math.sin(time * 2.3)) * currentIntensity;
  const y = (Math.cos(time * 1.3) + Math.cos(time * 1.7)) * currentIntensity;

  return { x, y };
};

/**
 * Apply shake to canvas context
 */
export const applyScreenShake = (
  ctx: CanvasRenderingContext2D,
  offset: ShakeOffset
): void => {
  ctx.translate(offset.x, offset.y);
};

// ============================================
// SCREEN FLASH
// ============================================

export interface ScreenFlash {
  color: string;
  alpha: number;
  targetAlpha: number;
  fadeSpeed: number;
  isActive: boolean;
}

/**
 * Create a flash effect
 */
export const createScreenFlash = (
  color: string = '#FFFFFF',
  alpha: number = 0.6,
  fadeSpeed: number = 0.005
): ScreenFlash => ({
  color,
  alpha,
  targetAlpha: 0,
  fadeSpeed,
  isActive: true,
});

/**
 * Update flash effect
 */
export const updateScreenFlash = (
  flash: ScreenFlash,
  deltaTime: number
): void => {
  if (!flash.isActive) return;

  flash.alpha -= flash.fadeSpeed * deltaTime;

  if (flash.alpha <= 0) {
    flash.alpha = 0;
    flash.isActive = false;
  }
};

/**
 * Draw flash overlay
 */
export const drawScreenFlash = (
  ctx: CanvasRenderingContext2D,
  flash: ScreenFlash,
  width: number,
  height: number
): void => {
  if (!flash.isActive || flash.alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = flash.alpha;
  ctx.fillStyle = flash.color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

// ============================================
// VIGNETTE
// ============================================

export interface Vignette {
  color: string;
  intensity: number;
  radius: number; // 0-1, percentage of screen
}

/**
 * Create vignette config
 */
export const createVignette = (
  color: string = 'rgba(0, 0, 0, 0.3)',
  intensity: number = 1,
  radius: number = 0.7
): Vignette => ({
  color,
  intensity,
  radius,
});

/**
 * Draw vignette effect
 */
export const drawVignette = (
  ctx: CanvasRenderingContext2D,
  vignette: Vignette,
  width: number,
  height: number
): void => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    maxRadius * vignette.radius
  );

  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, vignette.color);

  ctx.save();
  ctx.globalAlpha = vignette.intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

// ============================================
// CHROMATIC ABERRATION (Simplified)
// ============================================

export interface ChromaticAberration {
  intensity: number; // pixels of RGB separation
  duration: number;
  elapsed: number;
  isActive: boolean;
}

/**
 * Create chromatic aberration effect
 * Note: Full implementation requires off-screen canvas manipulation
 * This is a simplified version using color overlay
 */
export const createChromaticAberration = (
  intensity: number = 3,
  duration: number = 200
): ChromaticAberration => ({
  intensity,
  duration,
  elapsed: 0,
  isActive: true,
});

/**
 * Update chromatic aberration
 */
export const updateChromaticAberration = (
  ca: ChromaticAberration,
  deltaTime: number
): number => {
  if (!ca.isActive) return 0;

  ca.elapsed += deltaTime;

  if (ca.elapsed >= ca.duration) {
    ca.isActive = false;
    return 0;
  }

  // Decay over time
  const progress = ca.elapsed / ca.duration;
  return ca.intensity * (1 - progress);
};

/**
 * Draw simplified chromatic aberration (color fringe overlay)
 * For full effect, see advanced implementation in comments
 */
export const drawChromaticAberration = (
  ctx: CanvasRenderingContext2D,
  intensity: number,
  width: number,
  height: number
): void => {
  if (intensity <= 0) return;

  // Simplified: draw colored edges
  const alpha = Math.min(0.3, intensity * 0.1);

  ctx.save();

  // Red shift left
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, intensity * 2, height);

  // Cyan shift right
  ctx.fillStyle = '#00FFFF';
  ctx.fillRect(width - intensity * 2, 0, intensity * 2, height);

  ctx.restore();
};

/*
// ADVANCED: Full chromatic aberration implementation
// Requires rendering game to off-screen canvas first

export const applyFullChromaticAberration = (
  sourceCanvas: HTMLCanvasElement,
  targetCtx: CanvasRenderingContext2D,
  intensity: number
): void => {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Draw red channel shifted left
  targetCtx.globalCompositeOperation = 'lighter';
  targetCtx.drawImage(sourceCanvas, -intensity, 0);

  // Draw green channel centered
  targetCtx.drawImage(sourceCanvas, 0, 0);

  // Draw blue channel shifted right
  targetCtx.drawImage(sourceCanvas, intensity, 0);

  targetCtx.globalCompositeOperation = 'source-over';
};
*/

// ============================================
// TIME EFFECTS
// ============================================

export interface TimeScale {
  current: number;
  target: number;
  transitionSpeed: number;
}

/**
 * Create time scale controller
 */
export const createTimeScale = (initialScale: number = 1): TimeScale => ({
  current: initialScale,
  target: initialScale,
  transitionSpeed: 0.1,
});

/**
 * Set slow motion
 */
export const setSlowMotion = (
  timeScale: TimeScale,
  scale: number,
  transitionSpeed?: number
): void => {
  timeScale.target = scale;
  if (transitionSpeed !== undefined) {
    timeScale.transitionSpeed = transitionSpeed;
  }
};

/**
 * Update time scale (lerp to target)
 */
export const updateTimeScale = (timeScale: TimeScale): number => {
  timeScale.current +=
    (timeScale.target - timeScale.current) * timeScale.transitionSpeed;

  // Snap to target when close
  if (Math.abs(timeScale.target - timeScale.current) < 0.001) {
    timeScale.current = timeScale.target;
  }

  return timeScale.current;
};

// ============================================
// FREEZE FRAME
// ============================================

export interface FreezeFrame {
  duration: number;
  elapsed: number;
  isActive: boolean;
  callback?: () => void;
}

/**
 * Create freeze frame effect
 */
export const createFreezeFrame = (
  duration: number,
  callback?: () => void
): FreezeFrame => ({
  duration,
  elapsed: 0,
  isActive: true,
  callback,
});

/**
 * Update freeze frame, returns true if still frozen
 */
export const updateFreezeFrame = (
  freeze: FreezeFrame,
  deltaTime: number
): boolean => {
  if (!freeze.isActive) return false;

  freeze.elapsed += deltaTime;

  if (freeze.elapsed >= freeze.duration) {
    freeze.isActive = false;
    if (freeze.callback) {
      freeze.callback();
    }
    return false;
  }

  return true;
};

// ============================================
// COLOR EFFECTS
// ============================================

/**
 * Flash the screen a color then fade
 */
export const flashColor = (
  color: string,
  duration: number = 100
): ScreenFlash => {
  return createScreenFlash(color, 0.6, 0.6 / duration);
};

/**
 * Preset flash effects
 */
export const FLASH_PRESETS = {
  death: () => flashColor('#FF0000', 150),
  impact: () => flashColor('#FFFFFF', 100),
  nearMiss: () => flashColor('#FFDD00', 80),
  heal: () => flashColor('#00FF88', 120),
  powerUp: () => flashColor('#FFD700', 150),
  damage: () => flashColor('#FF4444', 100),
};

// ============================================
// COMBO EFFECTS
// ============================================

/**
 * Combine multiple effects for death sequence
 */
export interface DeathEffectBundle {
  shake: ScreenShake;
  flash: ScreenFlash;
  freeze: FreezeFrame;
  slowMo: TimeScale;
}

export const createDeathEffects = (): DeathEffectBundle => ({
  shake: createScreenShake(8, 300),
  flash: createScreenFlash('#FFFFFF', 0.7, 0.007),
  freeze: createFreezeFrame(150),
  slowMo: createTimeScale(0.3),
});

/**
 * Combine multiple effects for milestone celebration
 */
export interface CelebrationEffectBundle {
  shake: ScreenShake;
  flash: ScreenFlash;
}

export const createCelebrationEffects = (): CelebrationEffectBundle => ({
  shake: createScreenShake(4, 200),
  flash: createScreenFlash('#FFD700', 0.4, 0.004),
});
