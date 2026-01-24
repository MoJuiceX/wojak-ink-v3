/**
 * FlappyOrange Day/Night Cycle & Color Interpolation System
 *
 * Pure functions for calculating colors based on time.
 * Extracted from FlappyOrange.tsx for reusability.
 */

import { ENVIRONMENT_COLORS, CYCLE_DURATION_MS, DAY_DURATION_MS, NIGHT_DURATION_MS, type TimeOfDay } from './config';
import type { Star } from './types';
import { lerpColor } from './utils';

// ============================================
// TYPES
// ============================================

export interface CycleInfo {
  normalizedCycle: number;  // 0-1 through full cycle
  isDay: boolean;           // true during day phase
  phaseTime: number;        // 0-1 within current day/night phase
  cycleTime: number;        // Raw cycle time in ms
}

export interface InterpolatedColors {
  skyTop: string;
  skyBottom: string;
  treeFoliage: string;
  treeFoliageFar: string;
  treeTrunk: string;
  orangeFruit: string;
  clouds: string;
  ground: string;
  grass: string;
  currentEnv: TimeOfDay;  // For vignette and other env-based logic
}

export interface CelestialPosition {
  x: number;
  y: number;
}

// ============================================
// CYCLE INFO
// ============================================

/**
 * Get cycle info from current time
 * @param cycleTime - Accumulated cycle time in milliseconds
 */
export function getCycleInfo(cycleTime: number): CycleInfo {
  const normalizedCycleTime = cycleTime % CYCLE_DURATION_MS;
  const normalizedCycle = normalizedCycleTime / CYCLE_DURATION_MS;  // 0 to 1

  const isDay = normalizedCycleTime < DAY_DURATION_MS;
  const phaseTime = isDay
    ? normalizedCycleTime / DAY_DURATION_MS  // 0-1 during day
    : (normalizedCycleTime - DAY_DURATION_MS) / NIGHT_DURATION_MS;  // 0-1 during night

  return { normalizedCycle, isDay, phaseTime, cycleTime: normalizedCycleTime };
}

// ============================================
// CELESTIAL POSITION
// ============================================

/**
 * Calculate sun/moon position along arc
 * @param phaseTime - 0 to 1 (0 = rising, 0.5 = zenith, 1 = setting)
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 */
export function getCelestialPosition(
  phaseTime: number,
  canvasWidth: number,
  canvasHeight: number
): CelestialPosition {
  // phaseTime: 0 = rising (left), 0.5 = zenith (top), 1 = setting (right)
  const angle = phaseTime * Math.PI;  // 0 to π

  // Arc spans from left edge to right edge
  const arcWidth = canvasWidth * 0.9;
  const arcCenterX = canvasWidth / 2;
  const arcCenterY = canvasHeight * 1.1;  // Arc origin below canvas
  const arcHeight = canvasHeight * 0.9;   // How high the sun/moon gets

  return {
    x: arcCenterX - (arcWidth / 2) * Math.cos(angle),  // Left to right
    y: arcCenterY - arcHeight * Math.sin(angle),       // Arc up and down
  };
}

// ============================================
// COLOR INTERPOLATION
// ============================================

/**
 * Get interpolated colors based on cycle time
 *
 * Day phases: dawn (0-0.10) → day (0.10-0.75) → golden (0.75-0.88) → sunset (0.88-1.0)
 * Night phases: dusk (0-0.15) → night (0.25-0.85) → pre-dawn (0.85-1.0)
 *
 * @param cycleInfo - Current cycle information
 */
export function getInterpolatedColors(cycleInfo: Pick<CycleInfo, 'isDay' | 'phaseTime'>): InterpolatedColors {
  const { isDay, phaseTime } = cycleInfo;

  // Define phase transitions for smooth color blending
  // Day: dawn (0-0.10) → day (0.10-0.75) → golden (0.75-0.88) → sunset (0.88-1.0)
  // Night: dusk (0-0.15) → night (0.15-0.85) → pre-dawn (0.85-1.0)

  let fromEnv: TimeOfDay;
  let toEnv: TimeOfDay;
  let t: number;

  if (isDay) {
    if (phaseTime < 0.10) {
      // Dawn (shorter)
      fromEnv = 'dawn';
      toEnv = 'day';
      t = phaseTime / 0.10;
    } else if (phaseTime < 0.75) {
      // Day (longer - more time in normal daylight)
      fromEnv = 'day';
      toEnv = 'day';
      t = 0;
    } else if (phaseTime < 0.88) {
      // Day to Golden (shorter orange phase)
      fromEnv = 'day';
      toEnv = 'golden';
      t = (phaseTime - 0.75) / 0.13;
    } else {
      // Golden to Sunset (shorter)
      fromEnv = 'golden';
      toEnv = 'sunset';
      t = (phaseTime - 0.88) / 0.12;
    }
  } else {
    if (phaseTime < 0.15) {
      // Sunset to Dusk
      fromEnv = 'sunset';
      toEnv = 'dusk';
      t = phaseTime / 0.15;
    } else if (phaseTime < 0.25) {
      // Dusk to Night
      fromEnv = 'dusk';
      toEnv = 'night';
      t = (phaseTime - 0.15) / 0.1;
    } else if (phaseTime < 0.85) {
      // Night
      fromEnv = 'night';
      toEnv = 'night';
      t = 0;
    } else {
      // Night to Dawn (pre-dawn)
      fromEnv = 'night';
      toEnv = 'dawn';
      t = (phaseTime - 0.85) / 0.15;
    }
  }

  // Smooth color interpolation between phases
  // Since colors are cached (recalculated every 500ms), this is performant
  const fromColors = ENVIRONMENT_COLORS[fromEnv];
  const toColors = ENVIRONMENT_COLORS[toEnv];

  // Use easeInOutSine for extra smooth transitions
  const smoothT = (1 - Math.cos(t * Math.PI)) / 2;

  return {
    skyTop: lerpColor(fromColors.skyTop, toColors.skyTop, smoothT),
    skyBottom: lerpColor(fromColors.skyBottom, toColors.skyBottom, smoothT),
    treeFoliage: lerpColor(fromColors.treeFoliage, toColors.treeFoliage, smoothT),
    treeFoliageFar: lerpColor(fromColors.treeFoliageFar, toColors.treeFoliageFar, smoothT),
    treeTrunk: lerpColor(fromColors.treeTrunk, toColors.treeTrunk, smoothT),
    orangeFruit: lerpColor(fromColors.orangeFruit, toColors.orangeFruit, smoothT),
    clouds: lerpColor(fromColors.clouds, toColors.clouds, smoothT),
    ground: lerpColor(fromColors.ground, toColors.ground, smoothT),
    grass: lerpColor(fromColors.grass, toColors.grass, smoothT),
    currentEnv: t < 0.5 ? fromEnv : toEnv,  // For vignette and other env-based logic
  };
}

// ============================================
// STAR GENERATION
// ============================================

/**
 * Generate stars for night sky with varying sizes
 * Base size with random reductions for visual variety
 *
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @param count - Number of stars to generate (default: 25)
 */
export function generateStars(
  canvasWidth: number,
  canvasHeight: number,
  count: number = 25
): Star[] {
  const stars: Star[] = [];
  const baseSize = 1.8;  // Base star size

  for (let i = 0; i < count; i++) {
    // Some stars are smaller: 0%, 5%, 10%, 15%, or 20% reduction
    const reductions = [0, 0, 0, 0.05, 0.05, 0.10, 0.10, 0.15, 0.15, 0.20];
    const reduction = reductions[Math.floor(Math.random() * reductions.length)];
    const size = baseSize * (1 - reduction);

    stars.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.6,  // Only in upper 60% of screen
      size,
      alpha: 0.6 + Math.random() * 0.4,  // Pre-calculate alpha for twinkle effect
    });
  }

  return stars;
}
