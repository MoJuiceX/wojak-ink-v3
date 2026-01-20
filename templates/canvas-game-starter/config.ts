/**
 * Game Configuration
 * Centralized config for easy tuning and balancing
 */

// ============================================
// GAME IDENTITY
// ============================================

export const GAME_CONFIG = {
  name: 'Canvas Game',
  version: '1.0.0',

  // Display
  canvas: {
    width: 400,
    height: 600,
    backgroundColor: '#1a1a2e',
  },

  // Frame timing
  timing: {
    targetFPS: 60,
    fixedTimeStep: 1000 / 60, // ~16.67ms
    maxDeltaTime: 100, // Cap to prevent spiral of death
  },
} as const;

// ============================================
// PHYSICS
// ============================================

export const PHYSICS = {
  gravity: 0.5,
  terminalVelocity: 15,
  friction: 0.98,
  bounce: 0.8,
} as const;

// ============================================
// PLAYER CONFIG
// ============================================

export const PLAYER = {
  // Size
  width: 40,
  height: 40,

  // Movement
  speed: 5,
  jumpForce: -12,
  acceleration: 0.8,
  deceleration: 0.9,

  // Bounds
  minX: 0,
  maxX: GAME_CONFIG.canvas.width,
  minY: 0,
  maxY: GAME_CONFIG.canvas.height,
} as const;

// ============================================
// DIFFICULTY SCALING
// ============================================

export const DIFFICULTY = {
  // Score thresholds for difficulty increases
  thresholds: [0, 10, 25, 50, 100, 200],

  // Speed multipliers per difficulty level
  speedMultipliers: [1.0, 1.15, 1.3, 1.5, 1.75, 2.0],

  // Spawn rate multipliers (lower = faster spawning)
  spawnRateMultipliers: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5],

  // Get difficulty level from score
  getLevel: (score: number): number => {
    for (let i = DIFFICULTY.thresholds.length - 1; i >= 0; i--) {
      if (score >= DIFFICULTY.thresholds[i]) return i;
    }
    return 0;
  },

  // Get current multipliers
  getMultipliers: (score: number) => {
    const level = DIFFICULTY.getLevel(score);
    return {
      speed: DIFFICULTY.speedMultipliers[level],
      spawnRate: DIFFICULTY.spawnRateMultipliers[level],
    };
  },
} as const;

// ============================================
// SCORING
// ============================================

export const SCORING = {
  // Points per event
  points: {
    basicAction: 1,
    bonusAction: 5,
    comboBonus: 10,
    perfectBonus: 25,
    milestone: 100,
  },

  // Combo system
  combo: {
    maxMultiplier: 8,
    decayTime: 2000, // ms before combo resets
    increaseThreshold: 1, // actions needed to increase multiplier
  },

  // Milestones (for celebrations)
  milestones: [10, 25, 50, 100, 200, 500, 1000],

  // Check if score hit a milestone
  isMilestone: (oldScore: number, newScore: number): number | null => {
    for (const milestone of SCORING.milestones) {
      if (oldScore < milestone && newScore >= milestone) {
        return milestone;
      }
    }
    return null;
  },
} as const;

// ============================================
// JUICE CONFIG
// ============================================

export const JUICE = {
  // Particles
  particles: {
    maxCount: 200,
    mobileMaxCount: 100,
    defaultLifespan: 1000,
  },

  // Screen shake
  shake: {
    light: { intensity: 3, duration: 100 },
    medium: { intensity: 6, duration: 200 },
    heavy: { intensity: 10, duration: 300 },
    death: { intensity: 15, duration: 400 },
  },

  // Screen flash
  flash: {
    light: { alpha: 0.3, duration: 80 },
    medium: { alpha: 0.5, duration: 120 },
    heavy: { alpha: 0.7, duration: 200 },
  },

  // Animation durations (ms)
  animations: {
    fast: 100,
    normal: 200,
    slow: 400,
    celebration: 600,
  },
} as const;

// ============================================
// AUDIO CONFIG
// ============================================

export const AUDIO = {
  // Master volume (0-1)
  masterVolume: 0.7,

  // Category volumes
  volumes: {
    music: 0.4,
    sfx: 0.8,
    ui: 0.5,
  },

  // Tone frequencies for procedural audio
  tones: {
    success: [440, 554.37], // A4, C#5 (major third)
    fail: [220, 185], // A3, F#3 (minor feel)
    tap: 200,
    milestone: [523.25, 659.25, 783.99], // C5, E5, G5 (C major chord)
  },
} as const;

// ============================================
// MOBILE CONFIG
// ============================================

export const MOBILE = {
  // Touch zones
  touchZones: {
    tap: { x: 0, y: 0, width: '100%', height: '100%' },
  },

  // Gesture thresholds
  gestures: {
    swipeMinDistance: 50,
    swipeMaxTime: 300,
    tapMaxDuration: 200,
    holdMinDuration: 500,
  },

  // Performance
  performance: {
    reduceParticles: true,
    reduceShadows: true,
    lowerResolution: false,
  },
} as const;

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE = {
  prefix: 'game_',
  keys: {
    highScore: 'highScore',
    totalGames: 'totalGames',
    settings: 'settings',
    achievements: 'achievements',
    lastPlayed: 'lastPlayed',
  },

  getKey: (key: keyof typeof STORAGE.keys): string => {
    return `${STORAGE.prefix}${STORAGE.keys[key]}`;
  },
} as const;

// ============================================
// DEBUG CONFIG
// ============================================

export const DEBUG = {
  enabled: process.env.NODE_ENV === 'development',
  showFPS: true,
  showHitboxes: false,
  showTouchZones: false,
  logEvents: false,
  invincible: false,
} as const;

// ============================================
// COLORS
// ============================================

export const COLORS = {
  // UI Colors
  ui: {
    primary: '#FF6B35',
    secondary: '#4ECDC4',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#ffffff',
    textMuted: '#a0a0a0',
  },

  // Game colors
  game: {
    player: '#FF6B35',
    enemy: '#e63946',
    collectible: '#FFD700',
    obstacle: '#6c757d',
    safe: '#4ECDC4',
    danger: '#e63946',
  },

  // Effect colors
  effects: {
    flash: '#ffffff',
    damage: '#ff4444',
    heal: '#00ff88',
    powerup: '#ffd700',
  },

  // Combo colors (escalating)
  combo: [
    '#4ECDC4', // 1x
    '#FFD93D', // 2x
    '#FF6B35', // 3x
    '#FF4444', // 4x
    '#E040FB', // 5x
    '#00E5FF', // 6x
    '#76FF03', // 7x
    '#FF1744', // 8x+
  ],
} as const;
