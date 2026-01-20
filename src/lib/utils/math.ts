/**
 * Math Utilities
 * Common mathematical functions for game development
 */

// ============================================
// BASIC OPERATIONS
// ============================================

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Random number in range (inclusive)
 */
export const randomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/**
 * Random integer in range (inclusive)
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Random item from array
 */
export const randomItem = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

/**
 * Shuffle array (Fisher-Yates)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ============================================
// GEOMETRY
// ============================================

/**
 * Distance between two points
 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

/**
 * Squared distance (faster, no sqrt)
 */
export const distanceSquared = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => (x2 - x1) ** 2 + (y2 - y1) ** 2;

/**
 * Angle between two points (radians)
 */
export const angle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => Math.atan2(y2 - y1, x2 - x1);

/**
 * Degrees to radians
 */
export const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Radians to degrees
 */
export const radToDeg = (radians: number): number => (radians * 180) / Math.PI;

/**
 * Normalize angle to 0-2PI
 */
export const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;
  return angle;
};

/**
 * Shortest angle difference
 */
export const angleDifference = (from: number, to: number): number => {
  const diff = normalizeAngle(to - from);
  return diff > Math.PI ? diff - Math.PI * 2 : diff;
};

// ============================================
// VECTORS
// ============================================

export interface Vector2 {
  x: number;
  y: number;
}

export const createVector = (x: number = 0, y: number = 0): Vector2 => ({
  x,
  y,
});

export const addVectors = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const subtractVectors = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const scaleVector = (v: Vector2, scale: number): Vector2 => ({
  x: v.x * scale,
  y: v.y * scale,
});

export const normalizeVector = (v: Vector2): Vector2 => {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

export const vectorLength = (v: Vector2): number =>
  Math.sqrt(v.x * v.x + v.y * v.y);

export const vectorLengthSquared = (v: Vector2): number =>
  v.x * v.x + v.y * v.y;

export const dotProduct = (a: Vector2, b: Vector2): number =>
  a.x * b.x + a.y * b.y;

export const vectorFromAngle = (angle: number, length: number = 1): Vector2 => ({
  x: Math.cos(angle) * length,
  y: Math.sin(angle) * length,
});

// ============================================
// COLLISION DETECTION
// ============================================

/**
 * Point in rectangle
 */
export const pointInRect = (
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;

/**
 * Point in circle
 */
export const pointInCircle = (
  px: number,
  py: number,
  cx: number,
  cy: number,
  radius: number
): boolean => distanceSquared(px, py, cx, cy) <= radius * radius;

/**
 * Rectangle overlap
 */
export const rectOverlap = (
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean => x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;

/**
 * Circle overlap
 */
export const circleOverlap = (
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean => distanceSquared(x1, y1, x2, y2) <= (r1 + r2) ** 2;

/**
 * Circle vs rectangle collision
 */
export const circleRectOverlap = (
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean => {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  return distanceSquared(cx, cy, closestX, closestY) <= cr * cr;
};

// ============================================
// INTERPOLATION
// ============================================

/**
 * Map value from one range to another
 */
export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;

/**
 * Wrap value within range
 */
export const wrap = (value: number, min: number, max: number): number => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/**
 * Round to decimal places
 */
export const roundTo = (value: number, decimals: number): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// ============================================
// GAME-SPECIFIC
// ============================================

/**
 * Calculate percentage (safe division)
 */
export const percentage = (value: number, total: number): number =>
  total === 0 ? 0 : (value / total) * 100;

/**
 * Format number with commas
 */
export const formatNumber = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Format time (seconds to mm:ss)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format time with milliseconds (seconds to mm:ss.ms)
 */
export const formatTimeMs = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};
