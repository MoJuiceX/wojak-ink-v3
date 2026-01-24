/**
 * FlappyOrange Game Types
 *
 * All TypeScript interfaces and types for the FlappyOrange game.
 */

import type { WeatherType } from './config';

// ============================================
// GAME STATE TYPES
// ============================================
export type GameState = 'idle' | 'playing' | 'gameover';

// ============================================
// BIRD / PLAYER
// ============================================
export interface Bird {
  y: number;
  velocity: number;
  rotation: number;
  // Juice additions
  scaleX: number;
  scaleY: number;
  velocityX: number;        // For death knockback
  rotationVelocity: number; // For death tumble
}

// ============================================
// PIPES / OBSTACLES
// ============================================
export interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
  // Moving pipe properties
  isMoving: boolean;
  moveSpeed: number;
  moveDirection: 1 | -1;
  moveRange: number;
  baseGapY: number;
  movePhase: number;
  gapSize: number;  // Gap size at creation time
  frostLevel: number;  // Snow/ice level (0-1), set at creation, persists until off-screen
}

// ============================================
// WEATHER SYSTEM
// ============================================
export interface WeatherState {
  current: WeatherType;
  intensity: number;
  windSpeed: number;
  windDirection: number;
  transitionProgress: number;
  nextWeather: WeatherType | null;
  fogIntensity: number;  // Separate fog layer (0-1) that can combine with any weather
  // Sequence tracking
  currentSequence: WeatherType[];  // Current weather sequence being played
  sequenceIndex: number;           // Current position in sequence
  inClearBuffer: boolean;          // True if in mandatory clear period between events
}

// ============================================
// PARTICLES
// ============================================
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  gravity?: number;
}

export interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  driftPhase: number;
  opacity: number;
  foreground: boolean;  // true = renders on top of pipes
}

export interface FallingLeaf {
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  speed: number;
  drift: number;
  driftPhase: number;
  color: string;
}

// ============================================
// WEATHER EFFECTS
// ============================================
export interface LightningBolt {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  alpha: number;
  startTime: number;
}

export interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  foreground: boolean;
}

export interface RainSplash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

// ============================================
// ENVIRONMENT
// ============================================
export interface BackgroundBird {
  x: number;
  y: number;
  wingPhase: number;
  speed: number;
  size: number;
  yOffset: number;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

export interface Tree {
  x: number;
  height: number;
  width: number;
  hasOranges: boolean; // Some trees have visible oranges
  orangeOffsets: Array<{ dx: number; dy: number }>; // Random positions for oranges
  shapeVariant: number; // 0-2 for different tree shapes
  canopyOffset: number; // Slight variation in canopy position
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export interface GrassTuft {
  x: number;
  height: number;
}

export interface Firefly {
  x: number;
  y: number;
  phase: number;
  speed: number;
}

// ============================================
// EFFECTS
// ============================================
export interface ShakeState {
  intensity: number;
  startTime: number;
  duration: number;
}

export interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  startTime: number;
}

// ============================================
// COLLECTIBLES
// ============================================
export interface Coin {
  x: number;
  y: number;
  collected: boolean;
  rotation: number;
}

// ============================================
// UI
// ============================================
export interface FloatingScore {
  id: string;
  value: string;
  x: number;
  y: number;
}

export interface LeaderboardTarget {
  rank: number;
  score: number;
  name: string;
}

// ============================================
// GAME STATE REF (for game loop)
// ============================================
export interface GameStateRef {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  gameState: GameState;
  frameCount: number;
  stars: Star[];
  // Juice additions
  isFrozen: boolean;
  timeScale: number;
  isDying: boolean;
}
