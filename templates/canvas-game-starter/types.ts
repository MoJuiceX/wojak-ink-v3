/**
 * Game Type Definitions
 * Shared types for the game
 */

// ============================================
// GAME STATE
// ============================================

export type GameState = 'menu' | 'ready' | 'playing' | 'paused' | 'gameover';

export interface GameData {
  state: GameState;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  timeElapsed: number;
}

// ============================================
// ENTITIES
// ============================================

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface MovingEntity extends Entity {
  vx: number;
  vy: number;
  speed: number;
}

export interface Player extends MovingEntity {
  scaleX: number;
  scaleY: number;
  rotation: number;
  rotationVelocity: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
}

export interface Enemy extends MovingEntity {
  type: string;
  health: number;
  damage: number;
}

export interface Collectible extends Entity {
  type: 'coin' | 'powerup' | 'health';
  value: number;
  collected: boolean;
}

// ============================================
// INPUT
// ============================================

export interface InputState {
  // Keyboard
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  action: boolean;

  // Touch
  touching: boolean;
  touchX: number;
  touchY: number;
  touchStartX: number;
  touchStartY: number;
  swipeDirection: 'none' | 'left' | 'right' | 'up' | 'down';
}

// ============================================
// EFFECTS
// ============================================

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  gravity: number;
  friction: number;
  shrink: boolean;
}

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  alpha: number;
  scale: number;
  age: number;
  color: string;
}

export interface ScreenEffect {
  type: 'shake' | 'flash' | 'freeze';
  intensity: number;
  duration: number;
  elapsed: number;
  active: boolean;
}

// ============================================
// AUDIO
// ============================================

export type SoundEffect =
  | 'jump'
  | 'land'
  | 'collect'
  | 'hit'
  | 'death'
  | 'levelUp'
  | 'powerUp'
  | 'menuSelect'
  | 'menuBack';

export type MusicTrack = 'menu' | 'gameplay' | 'boss' | 'victory' | 'gameover';

// ============================================
// CALLBACKS
// ============================================

export interface GameCallbacks {
  onScore?: (score: number) => void;
  onHighScore?: (score: number) => void;
  onGameOver?: (finalScore: number) => void;
  onLevelUp?: (level: number) => void;
  onAchievement?: (achievementId: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

// ============================================
// CONFIGURATION
// ============================================

export interface GameConfig {
  // Display
  width: number;
  height: number;
  backgroundColor: string;
  pixelRatio: number;

  // Physics
  gravity: number;
  friction: number;
  maxVelocity: number;

  // Gameplay
  startingLives: number;
  invulnerabilityDuration: number;
  difficultyScale: number;

  // Juice
  particlesEnabled: boolean;
  screenShakeEnabled: boolean;
  hapticEnabled: boolean;
  soundEnabled: boolean;

  // Performance
  maxParticles: number;
  targetFPS: number;
}

// ============================================
// SAVE DATA
// ============================================

export interface SaveData {
  version: number;
  highScore: number;
  totalScore: number;
  gamesPlayed: number;
  timePlayed: number;
  achievements: string[];
  unlockedSkins: string[];
  selectedSkin: string;
  settings: GameSettings;
  dailyChallenge: {
    date: string;
    progress: number;
    completed: boolean;
  };
  streak: {
    current: number;
    longest: number;
    lastPlayDate: string;
  };
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  hapticEnabled: boolean;
  reducedMotion: boolean;
  showFPS: boolean;
  showTutorial: boolean;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_GAME_CONFIG: GameConfig = {
  width: 390,
  height: 700,
  backgroundColor: '#1a1a2e',
  pixelRatio: window.devicePixelRatio || 1,

  gravity: 0.5,
  friction: 0.98,
  maxVelocity: 15,

  startingLives: 3,
  invulnerabilityDuration: 2000,
  difficultyScale: 1.0,

  particlesEnabled: true,
  screenShakeEnabled: true,
  hapticEnabled: true,
  soundEnabled: true,

  maxParticles: 100,
  targetFPS: 60,
};

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  musicVolume: 0.5,
  hapticEnabled: true,
  reducedMotion: false,
  showFPS: false,
  showTutorial: true,
};

export const DEFAULT_SAVE_DATA: SaveData = {
  version: 1,
  highScore: 0,
  totalScore: 0,
  gamesPlayed: 0,
  timePlayed: 0,
  achievements: [],
  unlockedSkins: ['default'],
  selectedSkin: 'default',
  settings: DEFAULT_SETTINGS,
  dailyChallenge: {
    date: '',
    progress: 0,
    completed: false,
  },
  streak: {
    current: 0,
    longest: 0,
    lastPlayDate: '',
  },
};
