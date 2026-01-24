/**
 * FlappyOrange Utility Functions
 *
 * Pure utility functions extracted from the main component.
 */

import { ENVIRONMENT_COLORS, CYCLE_DURATION_MS, type TimeOfDay } from './config';

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Convert hex color to RGB object
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

/**
 * Convert RGB to hex string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Interpolate between two colors
 */
export const lerpColor = (color1: string, color2: string, t: number): string => {
  // Handle rgba colors
  if (color1.startsWith('rgba') || color2.startsWith('rgba')) {
    return t < 0.5 ? color1 : color2; // Simple switch for rgba
  }
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Linear interpolation
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

/**
 * Ease in-out function
 */
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// ============================================
// CYCLE INFO TYPES
// ============================================

export interface CycleInfo {
  progress: number;      // 0-1 through full cycle
  isDay: boolean;        // true during day phase
  celestialProgress: number; // 0-1 for sun/moon arc
  phaseTime: number;     // 0-1 within current time-of-day phase
  currentPhase: TimeOfDay;
  nextPhase: TimeOfDay;
}

// ============================================
// DAY/NIGHT CYCLE UTILITIES
// ============================================

/**
 * Get cycle information from accumulated time
 */
export const getCycleInfo = (cycleTime: number): CycleInfo => {
  const progress = (cycleTime % CYCLE_DURATION_MS) / CYCLE_DURATION_MS;
  const isDay = progress < 0.5;
  const celestialProgress = isDay
    ? progress / 0.5
    : (progress - 0.5) / 0.5;

  // Determine current time-of-day phase (6 phases)
  // Dawn (0-0.083), Day (0.083-0.333), Golden (0.333-0.417),
  // Sunset (0.417-0.5), Dusk (0.5-0.583), Night (0.583-1.0)
  let currentPhase: TimeOfDay;
  let nextPhase: TimeOfDay;
  let phaseTime: number;

  if (progress < 0.083) {
    currentPhase = 'dawn';
    nextPhase = 'day';
    phaseTime = progress / 0.083;
  } else if (progress < 0.333) {
    currentPhase = 'day';
    nextPhase = 'golden';
    phaseTime = (progress - 0.083) / 0.25;
  } else if (progress < 0.417) {
    currentPhase = 'golden';
    nextPhase = 'sunset';
    phaseTime = (progress - 0.333) / 0.084;
  } else if (progress < 0.5) {
    currentPhase = 'sunset';
    nextPhase = 'dusk';
    phaseTime = (progress - 0.417) / 0.083;
  } else if (progress < 0.583) {
    currentPhase = 'dusk';
    nextPhase = 'night';
    phaseTime = (progress - 0.5) / 0.083;
  } else {
    currentPhase = 'night';
    nextPhase = 'dawn';
    phaseTime = (progress - 0.583) / 0.417;
  }

  return { progress, isDay, celestialProgress, phaseTime, currentPhase, nextPhase };
};

/**
 * Get interpolated environment colors based on cycle info
 */
export const getInterpolatedColors = (cycleInfo: CycleInfo) => {
  const { phaseTime, currentPhase, nextPhase } = cycleInfo;
  const currentColors = ENVIRONMENT_COLORS[currentPhase];
  const nextColors = ENVIRONMENT_COLORS[nextPhase];

  // Smooth transition between phases
  const t = easeInOut(phaseTime);

  return {
    skyTop: lerpColor(currentColors.skyTop, nextColors.skyTop, t),
    skyBottom: lerpColor(currentColors.skyBottom, nextColors.skyBottom, t),
    treeFoliage: lerpColor(currentColors.treeFoliage, nextColors.treeFoliage, t),
    treeFoliageFar: lerpColor(currentColors.treeFoliageFar, nextColors.treeFoliageFar, t),
    treeTrunk: lerpColor(currentColors.treeTrunk, nextColors.treeTrunk, t),
    clouds: lerpColor(currentColors.clouds, nextColors.clouds, t),
    ground: lerpColor(currentColors.ground, nextColors.ground, t),
    grass: lerpColor(currentColors.grass, nextColors.grass, t),
    orangeFruit: lerpColor(currentColors.orangeFruit, nextColors.orangeFruit, t),
  };
};

// ============================================
// RANDOM UTILITIES
// ============================================

/**
 * Random number in range
 */
export const randomInRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

/**
 * Random integer in range (inclusive)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(randomInRange(min, max + 1));
};

/**
 * Pick random item from array
 */
export const randomPick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// ============================================
// GEOMETRY UTILITIES
// ============================================

/**
 * Distance between two points
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * Normalize angle to 0-2PI range
 */
export const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
};

// ============================================
// CANVAS UTILITIES
// ============================================

/**
 * Draw rounded rectangle
 */
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * Create gradient with stops
 */
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: Array<{ offset: number; color: string }>
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(stop => gradient.addColorStop(stop.offset, stop.color));
  return gradient;
};
