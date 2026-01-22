// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack, volumeHigh, volumeMute } from 'ionicons/icons';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { GameSEO } from '@/components/seo/GameSEO';
import './FlappyOrange.css';

// ============================================
// PHYSICS CONSTANTS - Tuned for fun, forgiving gameplay
// ============================================
const PHYSICS = {
  GRAVITY: 0.2,            // Very floaty for easy control
  JUMP_VELOCITY: -6,       // Gentle, controllable jump
  MAX_FALL_SPEED: 5,       // Slow fall for easy recovery
  ROTATION_SPEED: 0.04,    // Subtle rotation
};

// ============================================
// JUICE CONSTANTS - Premium feel effects
// ============================================
const JUICE_CONFIG = {
  // Particle limits (for mobile performance)
  MAX_WING_PARTICLES: 15,      // Max wing particles at once
  MAX_PASS_PARTICLES: 20,      // Max pass particles at once
  MAX_DEATH_PARTICLES: 15,     // Max death particles at once

  // Death sequence
  FREEZE_DURATION: 150,        // ms of freeze frame
  SLOW_MO_SCALE: 0.3,          // Time scale during death tumble
  SLOW_MO_DURATION: 400,       // ms of slow-mo
  TUMBLE_ROTATION_SPEED: 12,   // radians per second during tumble
  DEATH_KNOCKBACK_X: 3,        // Horizontal knockback on death
  DEATH_KNOCKBACK_Y: -4,       // Upward bounce on death
  IMPACT_FLASH_ALPHA: 0.6,     // White flash intensity
  IMPACT_FLASH_DURATION: 100,  // ms
  DEATH_PARTICLE_COUNT: 12,    // Number of particles on death (reduced for mobile)
  SCREEN_SHAKE_INTENSITY: 6,   // Shake magnitude
  SCREEN_SHAKE_DURATION: 200,  // ms

  // Flap deformation
  FLAP_SCALE_X: 0.85,
  FLAP_SCALE_Y: 1.3,
  FLAP_DURATION: 80,
  FLAP_RETURN_DURATION: 150,

  // Wing particles
  WING_PARTICLE_COUNT: 3,

  // Pass effects
  PASS_SCALE_FREQUENCIES: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // C major scale
  PASS_PARTICLE_COUNT: 5,
  SCREEN_PULSE_INTENSITY: 0.05,

  // Near-miss
  NEAR_MISS_THRESHOLD: 0.25,   // 25% of gap = near miss
  NEAR_MISS_BONUS: [1, 2, 3],  // Bonus points by intensity

  // Fire mode
  FIRE_THRESHOLD: 5,           // Pipes to activate fire
  FIRE_MULTIPLIER: 1.5,
};

// ============================================
// WEATHER CONSTANTS - Dynamic weather system
// ============================================
const WEATHER_CONFIG = {
  // Weather durations - longer, more natural pacing
  MIN_WEATHER_DURATION: 12000,  // 12 seconds min per weather phase
  MAX_WEATHER_DURATION: 20000,  // 20 seconds max per weather phase
  CLEAR_BUFFER_DURATION: 8000,  // 8 seconds of clear weather between events
  TRANSITION_DURATION: 4000,    // 4 second smooth transitions

  // Particle limits
  MAX_SNOWFLAKES: 60,
  MAX_RAIN_DROPS: 80,
  MAX_LEAVES: 40,  // More leaves
  MAX_BACKGROUND_BIRDS: 7,

  // Weather sequence probabilities (after clear buffer)
  // Higher chance of interesting weather after calm period
  EVENT_CHANCES: {
    rain: 0.25,      // 25% chance of rain sequence
    storm: 0.15,     // 15% chance of storm sequence (rain→storm→rain→clear)
    snow: 0.30,      // 30% chance of snow sequence
    leaves: 0.20,    // 20% chance of leaf fall (during golden/sunset)
    clear: 0.10,     // 10% stay clear longer
  },

  // Fog overlay probability
  FOG_CHANCE: 0.15,
  FOG_DURATION: { min: 15000, max: 30000 },

  // Wind settings
  MAX_WIND_SPEED: 3,
  WIND_CHANGE_RATE: 0.01,
  STORM_WIND_SPEED: 6,  // Stronger wind during storms

  // Snow settings
  SNOW_FALL_SPEED: { min: 0.8, max: 2 },
  SNOW_DRIFT_AMPLITUDE: 30,
  SNOW_SIZE: { min: 2, max: 5 },

  // Fog settings
  FOG_LAYERS: 3,
  FOG_MAX_OPACITY: 0.4,

  // Bird flock settings
  BIRD_SPAWN_INTERVAL: 20000,
  FLOCK_SIZE: { min: 3, max: 7 },
  BIRD_SPEED: { min: 1.5, max: 3 },

  // Leaf settings - more frequent during golden/sunset
  LEAF_COLORS: ['#FF6B00', '#FF8C33', '#FFD700', '#FF4500', '#8B4513'],
  LEAF_SPAWN_RATE: 0.04,  // Doubled leaf spawn rate
};

// ============================================
// DIFFICULTY CONSTANTS - Casual progression
// ============================================
const DIFFICULTY_CONFIG = {
  // Score thresholds for difficulty tiers (faster progression)
  TIER_THRESHOLDS: [5, 12, 20, 35, 50],

  // Gap sizes per tier (starts easy, gets tighter faster)
  GAP_SIZES: [220, 210, 200, 190, 185, 180],

  // Speed multipliers per tier (faster ramping)
  SPEED_MULTIPLIERS: [1.0, 1.12, 1.24, 1.36, 1.48, 1.6],

  // Moving pipe chances per tier (start earlier at tier 1)
  MOVING_PIPE_CHANCES: [0, 0.15, 0.30, 0.45, 0.55, 0.65],

  // Moving pipe settings
  MOVE_SPEED: { min: 0.4, max: 1.0 },
  MOVE_RANGE: { min: 35, max: 70 },
};

// Weather types (fog is a separate overlay that combines with others)
type WeatherType = 'clear' | 'rain' | 'storm' | 'snow';

// Weather sequences - natural progressions that build up and wind down
const WEATHER_SEQUENCES: Record<string, WeatherType[]> = {
  rain: ['clear', 'rain', 'rain', 'clear'],           // clear → rain builds → rain continues → fades to clear
  storm: ['clear', 'rain', 'storm', 'rain', 'clear'], // clear → rain → storm peak → rain → clear
  snow: ['clear', 'snow', 'snow', 'clear'],           // clear → snow builds → snow continues → fades to clear
  clear: ['clear', 'clear'],                          // Extended clear period
};

// Weather state interface
interface WeatherState {
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

// Snowflake particle
interface Snowflake {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  driftPhase: number;
  opacity: number;
  foreground: boolean;  // true = renders on top of pipes
}

// Background bird in flock
interface BackgroundBird {
  x: number;
  y: number;
  wingPhase: number;
  speed: number;
  size: number;
  yOffset: number;
}

// Falling leaf particle
interface FallingLeaf {
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

// Lightning bolt segment
interface LightningBolt {
  segments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  alpha: number;
  startTime: number;
}

// Particle interface for death/wing effects
interface Particle {
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

// Screen shake state
interface ShakeState {
  intensity: number;
  startTime: number;
  duration: number;
}

// Parallax layer configuration
interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Tree {
  x: number;
  height: number;
  width: number;
  hasOranges: boolean; // Some trees have visible oranges
  orangeOffsets: Array<{ dx: number; dy: number }>; // Random positions for oranges
  shapeVariant: number; // 0-2 for different tree shapes
  canopyOffset: number; // Slight variation in canopy position
}

// Environment colors for different stages - Orange Grove day cycle
// Story: An orange escapes from the grove, flying through the day cycle
const ENVIRONMENT_COLORS = {
  dawn: {
    // Early morning - pink/purple sunrise
    skyTop: '#FF9AA2',
    skyBottom: '#FFB7B2',
    treeFoliage: '#2D4A27',
    treeFoliageFar: '#4A6A43',
    treeTrunk: '#5D4037',
    clouds: '#FFDCDC',  // Hex for interpolation (opacity handled separately)
    ground: '#7B5914',
    grass: '#5A8A32',
    orangeFruit: '#E07800',
  },
  day: {
    // Bright midday sun
    skyTop: '#87CEEB',
    skyBottom: '#B0E0FF',
    treeFoliage: '#2D5A27',
    treeFoliageFar: '#4A7C43',
    treeTrunk: '#5D4037',
    clouds: '#FFFFFF',
    ground: '#8B6914',
    grass: '#7CB342',
    orangeFruit: '#FF8C00',
  },
  golden: {
    // Golden hour afternoon
    skyTop: '#FDB347',
    skyBottom: '#FFE4B5',
    treeFoliage: '#3D6A2D',
    treeFoliageFar: '#5A8A4A',
    treeTrunk: '#5A3A28',
    clouds: '#FFE6B4',
    ground: '#8B6B14',
    grass: '#8B9A23',
    orangeFruit: '#FF9500',
  },
  sunset: {
    // Orange/red sunset
    skyTop: '#FF6B35',
    skyBottom: '#FFB347',
    treeFoliage: '#3D5A3D',
    treeFoliageFar: '#5A7A5A',
    treeTrunk: '#4A3728',
    clouds: '#FFB482',
    ground: '#6B5014',
    grass: '#6B8E23',
    orangeFruit: '#CC6600',
  },
  dusk: {
    // Twilight purple
    skyTop: '#4A3A6A',
    skyBottom: '#7A5A8A',
    treeFoliage: '#2A3A2A',
    treeFoliageFar: '#3A4A3A',
    treeTrunk: '#3A2A20',
    clouds: '#9682AA',
    ground: '#3A3A4A',
    grass: '#3A5A3A',
    orangeFruit: '#AA5500',
  },
  night: {
    // Starry night
    skyTop: '#0D1B2A',
    skyBottom: '#1B263B',
    treeFoliage: '#1A2E1A',
    treeFoliageFar: '#2A3E2A',
    treeTrunk: '#2A1F1A',
    clouds: '#646478',
    ground: '#1a1a2e',
    grass: '#1A3A1A',
    orangeFruit: '#994400',
  },
};

// Day/Night cycle timing (120 second full cycle - slower sun/moon movement)
const CYCLE_DURATION_MS = 120000;  // 120 seconds (2 min) for full day/night cycle
const DAY_DURATION_MS = 60000;     // 60 seconds for sun arc
const NIGHT_DURATION_MS = 60000;   // 60 seconds for moon arc

// Helper: Convert hex color to RGB object
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
};

// Helper: Interpolate between two colors
const lerpColor = (color1: string, color2: string, t: number): string => {
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

// Coin interface for collectibles
interface Coin {
  x: number;
  y: number;
  collected: boolean;
  rotation: number;
}

const BIRD_RADIUS = 14;    // Forgiving hitbox (was 16)
const PIPE_WIDTH = 52;     // Slightly narrower pipes (was 55)
const PIPE_GAP = 220;      // Very wide gap to fly through (was 200)
const PIPE_SPACING = 320;  // Lots of time between pipes (was 280)

// Performance mode - disable expensive effects for smooth gameplay
const PERFORMANCE_MODE = false; // Full visuals
// Ultra performance mode - absolute minimal for debugging lag
const ULTRA_PERFORMANCE_MODE = false;
// Light effects mode - sound + flap deformation only, no particles
const LIGHT_EFFECTS_MODE = true;
// Bare bones mode - literally just rectangles, for finding the bottleneck
const BARE_BONES_MODE = false;
// Use MessageChannel for iOS Safari/WebKit (bypasses RAF throttling)
const USE_MESSAGE_CHANNEL_LOOP = true;
// Debug overlay - shows performance metrics for testing
const DEBUG_OVERLAY = false;
// Debug weather panel - allows testing weather effects
const DEBUG_WEATHER = false;

// ============================================
// TYPES
// ============================================
interface Bird {
  y: number;
  velocity: number;
  rotation: number;
  // Juice additions
  scaleX: number;
  scaleY: number;
  velocityX: number;        // For death knockback
  rotationVelocity: number; // For death tumble
}

interface Pipe {
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

type GameState = 'idle' | 'playing' | 'gameover';

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// ============================================
// MAIN COMPONENT
// ============================================
const FlappyOrange: React.FC = () => {

  const navigate = useNavigate();
  const realIsMobile = useIsMobile();
  const isMobile = BARE_BONES_MODE ? true : realIsMobile; // Force mobile in bare bones
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // In BARE_BONES mode, use dummy functions to avoid hook overhead
  const realGameSounds = useGameSounds();
  const realGameHaptics = useGameHaptics();
  const realGameEffects = useGameEffects();
  const realLeaderboard = useLeaderboard('flappy-orange');

  // Use real or dummy based on mode
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playGameStart, playCollect, playScorePoint } = BARE_BONES_MODE
    ? { playBlockLand: () => {}, playPerfectBonus: () => {}, playCombo: () => {}, playGameOver: () => {}, playGameStart: () => {}, playCollect: () => {}, playScorePoint: () => {} }
    : realGameSounds;
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticButton } = BARE_BONES_MODE
    ? { hapticScore: () => {}, hapticCombo: () => {}, hapticHighScore: () => {}, hapticGameOver: () => {}, hapticButton: () => {} }
    : realGameHaptics;

  // Visual effects
  const { effects, triggerBigMoment, triggerConfetti, showEpicCallout, resetAllEffects } = BARE_BONES_MODE
    ? { effects: { shockwave: null, confetti: null, callout: null, shake: false, vignette: false, sparks: null }, triggerBigMoment: () => {}, triggerConfetti: () => {}, showEpicCallout: () => {}, resetAllEffects: () => {} }
    : realGameEffects;

  // Leaderboard
  const { leaderboard: globalLeaderboard, submitScore, isSignedIn, userDisplayName, isSubmitting } = BARE_BONES_MODE
    ? { leaderboard: [], submitScore: () => Promise.resolve(), isSignedIn: false, userDisplayName: '', isSubmitting: false }
    : realLeaderboard;
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // Dynamic canvas dimensions - measured from container
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: BARE_BONES_MODE ? 320 : 500,
    height: BARE_BONES_MODE ? 480 : 600
  });

  // Measure container and update canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Both mobile and desktop: fill the container
        const width = Math.max(rect.width, 320);
        const height = Math.max(rect.height - (isMobile ? 20 : 0), 400);
        setCanvasDimensions({ width, height });
      }
    };

    // Initial measurement after a short delay to let CSS settle
    const timeoutId = setTimeout(updateDimensions, 50);

    // Update on resize
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [isMobile]);

  // Canvas dimensions from state (or static in BARE_BONES mode)
  const CANVAS_WIDTH = BARE_BONES_MODE ? 320 : canvasDimensions.width;
  const CANVAS_HEIGHT = BARE_BONES_MODE ? 480 : canvasDimensions.height;
  const BIRD_X = BARE_BONES_MODE ? 80 : CANVAS_WIDTH * 0.25;

  // Game refs (to avoid stale closures in game loop)
  const gameStateRef = useRef<{
    bird: Bird;
    pipes: Pipe[];
    score: number;
    gameState: GameState;
    frameCount: number;
    stars: Array<{ x: number; y: number; size: number; alpha: number }>;
    // Juice additions
    isFrozen: boolean;
    timeScale: number;
    isDying: boolean;
  }>({
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0, scaleX: 1, scaleY: 1, velocityX: 0, rotationVelocity: 0 },
    pipes: [],
    score: 0,
    gameState: 'idle',
    frameCount: 0,
    stars: [],
    isFrozen: false,
    timeScale: 1,
    isDying: false,
  });

  // Juice refs
  const deathParticlesRef = useRef<Particle[]>([]);
  const wingParticlesRef = useRef<Particle[]>([]);
  const passParticlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef<ShakeState | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const freezeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slowMoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parallax refs
  const cloudsRef = useRef<Cloud[]>([]);
  const treesRef = useRef<Tree[]>([]);
  const treesFarRef = useRef<Tree[]>([]);
  const scrollOffsetRef = useRef(0);
  const grassTuftsRef = useRef<Array<{ x: number; height: number }>>([]);

  // Coin collectibles (coins add to main score)
  const coinsRef = useRef<Coin[]>([]);

  // Fireflies for night mode
  const firefliesRef = useRef<Array<{ x: number; y: number; phase: number; speed: number }>>([]);

  // Day/Night cycle time tracking (accumulates via deltaTime for smooth animation)
  const cycleTimeRef = useRef(0);  // Accumulated time in ms, loops at CYCLE_DURATION_MS

  // Color cache - only recalculate colors every 500ms for performance
  // (cycleInfo is always fresh for smooth animation)
  const colorCacheRef = useRef<{
    lastUpdate: number;
    colors: ReturnType<typeof getInterpolatedColors> | null;
  }>({ lastUpdate: 0, colors: null });

  // Gradient cache - recreate only when colors change (not every frame!)
  const gradientCacheRef = useRef<{
    skyGradient: CanvasGradient | null;
    lastColorKey: string;
  }>({ skyGradient: null, lastColorKey: '' });

  // Touch ripple refs
  const touchRipplesRef = useRef<Array<{ x: number; y: number; radius: number; alpha: number; startTime: number }>>([]);

  // Weather refs (storm mode)
  const rainDropsRef = useRef<Array<{ x: number; y: number; length: number; speed: number; opacity: number; foreground: boolean }>>([]);
  const rainSplashesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; size: number }>>([]);
  const lightningRef = useRef<{ alpha: number; sequence: number; startTime: number } | null>(null);

  // React state for UI
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappyOrangeHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [sadImage, setSadImage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('flappyOrangeSoundEnabled') !== 'false';
  });
  const [floatingScores, setFloatingScores] = useState<Array<{
    id: string;
    value: string;
    x: number;
    y: number;
  }>>([]);

  const gameStartTimeRef = useRef<number>(0);

  // Leaderboard countdown state
  const [nextTarget, setNextTarget] = useState<{ rank: number; score: number; name: string } | null>(null);
  const [tookSpotMessage, setTookSpotMessage] = useState<string | null>(null);
  const beatenRanksRef = useRef<Set<number>>(new Set()); // Track which ranks we've beaten this game

  // Juice state - using refs for game loop performance (avoids re-creating loop on state change)
  const [impactFlashAlpha, setImpactFlashAlpha] = useState(0);
  const [screenBrightness, setScreenBrightness] = useState(1);
  const [nearMissFlashAlpha, setNearMissFlashAlpha] = useState(0);

  // Refs for game loop to read (synced from state)
  const impactFlashAlphaRef = useRef(0);
  const screenBrightnessRef = useRef(1);
  const nearMissFlashAlphaRef = useRef(0);
  const lightningAlphaRef = useRef(0);

  // Share system state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [challengeTarget, setChallengeTarget] = useState<number | null>(null);
  const [challengeBeaten, setChallengeBeaten] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Weather state
  const [lightningAlpha, setLightningAlpha] = useState(0);

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing',
  });

  // Ref for game loop to check dialog state
  const showExitDialogRef = useRef(false);
  useEffect(() => {
    showExitDialogRef.current = showExitDialog;
  }, [showExitDialog]);

  // Sync juice state to refs for game loop (prevents game loop recreation)
  useEffect(() => {
    impactFlashAlphaRef.current = impactFlashAlpha;
  }, [impactFlashAlpha]);
  useEffect(() => {
    screenBrightnessRef.current = screenBrightness;
  }, [screenBrightness]);
  useEffect(() => {
    nearMissFlashAlphaRef.current = nearMissFlashAlpha;
  }, [nearMissFlashAlpha]);
  useEffect(() => {
    lightningAlphaRef.current = lightningAlpha;
  }, [lightningAlpha]);

  // Background music playlist - 4 quiet songs
  const MUSIC_PLAYLIST = [
    { src: '/audio/music/FlappyOrange/gourmet-race-whisper.mp3', name: 'Gourmet Race' },
    { src: '/audio/music/FlappyOrange/lost-woods-whisper.mp3', name: 'Lost Woods' },
    { src: '/audio/music/FlappyOrange/tetris-troika-whisper.mp3', name: 'Tetris' },
    { src: '/audio/music/FlappyOrange/smb3-overworld-whisper.mp3', name: 'SMB3 Overworld' },
  ];
  // Start with random track on first load
  const playlistIndexRef = useRef(Math.floor(Math.random() * 4));
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play specific track - simplified, all tracks normalized
  const playTrack = useCallback((index: number) => {
    // Stop current music but don't reset position
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }

    playlistIndexRef.current = index;
    const track = MUSIC_PLAYLIST[index];

    const music = new Audio(track.src);
    music.volume = 1.0;  // All tracks are normalized

    // When song ends, play next
    music.addEventListener('ended', () => {
      playlistIndexRef.current = (playlistIndexRef.current + 1) % MUSIC_PLAYLIST.length;
      if (gameStateRef.current.gameState === 'playing' && soundEnabledRef.current) {
        playTrack(playlistIndexRef.current);
      }
    }, { once: true });

    musicAudioRef.current = music;
    music.play().catch(() => {});  // Silently ignore errors
  }, []);

  // Play next song in playlist
  const playNextSong = useCallback(() => {
    playTrack(playlistIndexRef.current);
  }, [playTrack]);

  // Ref for soundEnabled (for use in callbacks - gameStateRef already exists above)
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Ref for playNextSong so touch handler can call it (needed for mobile audio)
  const playNextSongRef = useRef(playNextSong);
  useEffect(() => { playNextSongRef.current = playNextSong; }, [playNextSong]);

  // Ref for generateStars so touch handler can call it (stars array is empty otherwise)
  const generateStarsRef = useRef<() => Array<{ x: number; y: number; size: number; alpha: number }>>(() => []);
  // Note: generateStars is defined later, so we update the ref in a useEffect after the component body

  // Initialize music on mount
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
    };
  }, []);

  // Control music based on game state - resume from where it left off
  useEffect(() => {
    if (gameState === 'playing' && soundEnabled) {
      // Resume music if paused (continues from current position)
      if (musicAudioRef.current) {
        musicAudioRef.current.play().catch(() => {});
      }
      // Note: music is started directly from touch handler for mobile compatibility
    } else {
      // Pause current music (keeps position for resume)
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    }
  }, [gameState, soundEnabled]);

  // Page Visibility API - pause game and audio when backgrounded (battery optimization)
  const wasPlayingBeforeHiddenRef = useRef(false);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (backgrounded)
        wasPlayingBeforeHiddenRef.current = gameStateRef.current.gameState === 'playing';

        // Pause music
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
        }

        // Suspend audio contexts to save battery
        if (audioContextRef.current?.state === 'running') {
          audioContextRef.current.suspend();
        }
        if (coinAudioCtxRef.current?.state === 'running') {
          coinAudioCtxRef.current.suspend();
        }
      } else {
        // Page is visible again - resume audio contexts
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
        }
        if (coinAudioCtxRef.current?.state === 'suspended') {
          coinAudioCtxRef.current.resume();
        }

        // Resume music if game was playing and sound is enabled
        if (wasPlayingBeforeHiddenRef.current && soundEnabled && musicAudioRef.current) {
          musicAudioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [soundEnabled]);

  // Audio context for synthesized sounds
  const coinAudioCtxRef = useRef<AudioContext | null>(null);


  // ============================================
  // WEATHER SYSTEM REFS
  // ============================================
  const weatherRef = useRef<WeatherState>({
    current: 'clear',
    intensity: 0,
    windSpeed: 0,
    windDirection: 1,
    transitionProgress: 1,
    nextWeather: null,
    fogIntensity: 0,  // Fog is separate overlay
    currentSequence: ['clear'],  // Start with clear
    sequenceIndex: 0,
    inClearBuffer: false,
  });
  const weatherTimerRef = useRef(WEATHER_CONFIG.MIN_WEATHER_DURATION + Math.random() * (WEATHER_CONFIG.MAX_WEATHER_DURATION - WEATHER_CONFIG.MIN_WEATHER_DURATION));
  const fogTimerRef = useRef(0);  // Timer for fog overlay
  const snowAccumulationRef = useRef(0);  // Ground snow level (0-1), for spawning new snow
  const snowGroundEdgeRef = useRef(0);  // Right edge of snow on ground (scrolls left when snow stops)
  const snowflakesRef = useRef<Snowflake[]>([]);
  const backgroundBirdsRef = useRef<BackgroundBird[]>([]);
  const fallingLeavesRef = useRef<FallingLeaf[]>([]);
  const lightningBoltsRef = useRef<LightningBolt[]>([]);
  const lastBirdSpawnRef = useRef(0);

  // Initialize audio context on first interaction
  useEffect(() => {
    const initAudioContext = () => {
      if (!coinAudioCtxRef.current) {
        coinAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    // Initialize on any user interaction
    const events = ['touchstart', 'mousedown', 'keydown'];
    events.forEach(e => document.addEventListener(e, initAudioContext, { once: true }));
    return () => {
      events.forEach(e => document.removeEventListener(e, initAudioContext));
    };
  }, []);

  // Play soft synthesized coin chime - gentle two-note rising tone
  const playCoinSound = useCallback(() => {
    if (!soundEnabled) return;

    // Lazy init audio context
    if (!coinAudioCtxRef.current) {
      coinAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = coinAudioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const volume = 0.12;  // Soft volume

    // First note - soft sine wave (C5 = 523Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.02);  // Quick attack
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);  // Gentle decay
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second note - slightly higher (E5 = 659Hz), slight delay for "chime" feel
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659, now + 0.05);
    gain2.gain.setValueAtTime(0, now + 0.05);
    gain2.gain.linearRampToValueAtTime(volume * 0.8, now + 0.07);  // Softer second note
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.2);

    // Third note - even higher for sparkle (G5 = 784Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(784, now + 0.08);
    gain3.gain.setValueAtTime(0, now + 0.08);
    gain3.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1);  // Even softer
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.08);
    osc3.stop(now + 0.25);
  }, [soundEnabled]);

  // Initialize parallax elements on mount and when dimensions change
  useEffect(() => {
    // Clear existing elements to regenerate with new dimensions
    cloudsRef.current = [];
    treesRef.current = [];
    treesFarRef.current = [];
    grassTuftsRef.current = [];
    firefliesRef.current = [];

    // Generate clouds
    for (let i = 0; i < 3; i++) { // Reduced from 6 to 3
      cloudsRef.current.push({
        x: Math.random() * CANVAS_WIDTH * 1.5,
        y: 30 + Math.random() * (CANVAS_HEIGHT * 0.3),
        width: 80 + Math.random() * 60, // Slightly larger to compensate
        height: 35 + Math.random() * 35,
        speed: 0.3 + Math.random() * 0.3,
        opacity: 0.7 + Math.random() * 0.2,
      });
    }
    // Helper to generate well-distributed orange positions for a tree
    const generateOrangeOffsets = () => {
      const count = 3 + Math.floor(Math.random() * 2); // 3-4 oranges per tree (reduced for perf)
      const offsets: Array<{ dx: number; dy: number }> = [];
      const angleStep = (Math.PI * 2) / count;
      for (let j = 0; j < count; j++) {
        const angle = j * angleStep + (Math.random() - 0.5) * angleStep * 0.5;
        const radius = 0.3 + Math.random() * 0.35;
        offsets.push({
          dx: Math.cos(angle) * radius,
          dy: Math.sin(angle) * radius * 0.8,
        });
      }
      return offsets;
    };

    // Generate near trees
    for (let i = 0; i < 4; i++) {
      treesRef.current.push({
        x: (i / 4) * CANVAS_WIDTH * 1.5 - CANVAS_WIDTH * 0.25,
        height: CANVAS_HEIGHT * 0.35 + Math.random() * (CANVAS_HEIGHT * 0.1),
        width: 60 + Math.random() * 30,
        hasOranges: Math.random() > 0.3, // 70% have oranges
        orangeOffsets: generateOrangeOffsets(),
        shapeVariant: Math.floor(Math.random() * 6), // 0-5 for 6 tree variants
        canopyOffset: (Math.random() - 0.5) * 0.15, // Slight horizontal offset
      });
    }
    // Generate far trees
    for (let i = 0; i < 4; i++) {
      treesFarRef.current.push({
        x: (i / 4) * CANVAS_WIDTH * 1.5 - CANVAS_WIDTH * 0.25,
        height: CANVAS_HEIGHT * 0.22 + Math.random() * (CANVAS_HEIGHT * 0.08),
        width: 50 + Math.random() * 20,
        hasOranges: Math.random() > 0.5,
        orangeOffsets: generateOrangeOffsets(),
        shapeVariant: Math.floor(Math.random() * 6),
        canopyOffset: (Math.random() - 0.5) * 0.1,
      });
    }
    // Generate grass tufts
    for (let i = 0; i < 12; i++) {
      grassTuftsRef.current.push({
        x: (i / 12) * CANVAS_WIDTH * 1.5,
        height: 6 + Math.random() * 10,
      });
    }
    // Generate fireflies for night mode
    for (let i = 0; i < 8; i++) {
      firefliesRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 50 + Math.random() * (CANVAS_HEIGHT * 0.6),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
      });
    }
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Generate stars for night sky - base size with random reductions
  const generateStars = useCallback(() => {
    const stars = [];
    const baseSize = 1.8;  // Base star size
    for (let i = 0; i < 25; i++) {
      // Some stars are smaller: 0%, 5%, 10%, 15%, or 20% reduction
      const reductions = [0, 0, 0, 0.05, 0.05, 0.10, 0.10, 0.15, 0.15, 0.20];
      const reduction = reductions[Math.floor(Math.random() * reductions.length)];
      const size = baseSize * (1 - reduction);
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT * 0.6,
        size,
        alpha: 0.6 + Math.random() * 0.4,  // Pre-calculate alpha for twinkle effect
      });
    }
    return stars;
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Generate clouds for parallax - optimized for mobile
  const generateClouds = useCallback(() => {
    const clouds: Cloud[] = [];
    for (let i = 0; i < 3; i++) { // Reduced from 6 to 3
      clouds.push({
        x: Math.random() * CANVAS_WIDTH * 1.5,
        y: 30 + Math.random() * (CANVAS_HEIGHT * 0.3),
        width: 80 + Math.random() * 60,
        height: 35 + Math.random() * 35,
        speed: 0.3 + Math.random() * 0.3,
        opacity: 0.7 + Math.random() * 0.2,
      });
    }
    return clouds;
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Generate trees for parallax - orange grove theme
  const generateTrees = useCallback((isFar: boolean) => {
    const trees: Tree[] = [];
    const count = 4; // Reduced for performance
    const baseHeight = isFar ? CANVAS_HEIGHT * 0.22 : CANVAS_HEIGHT * 0.35;
    const minSpacing = isFar ? 80 : 100; // Minimum spacing between trees

    // Helper for well-distributed orange positions
    // Bigger trees get more oranges (4-5), smaller trees get 3
    const makeOrangeOffsets = (treeWidth: number) => {
      const isBigTree = treeWidth > (isFar ? 60 : 75);
      const orangeCount = isBigTree ? (4 + Math.floor(Math.random() * 2)) : 3; // Big: 4-5, Small: 3
      const offsets: Array<{ dx: number; dy: number }> = [];
      const angleStep = (Math.PI * 2) / orangeCount;
      for (let j = 0; j < orangeCount; j++) {
        const angle = j * angleStep + (Math.random() - 0.5) * angleStep * 0.5;
        const radius = 0.3 + Math.random() * 0.35;
        offsets.push({
          dx: Math.cos(angle) * radius,
          dy: Math.sin(angle) * radius * 0.8,
        });
      }
      return offsets;
    };

    // Generate trees with minimum spacing to prevent overlap
    const usedPositions: number[] = [];
    for (let i = 0; i < count; i++) {
      let x: number;
      let attempts = 0;
      const baseX = (i / count) * CANVAS_WIDTH * 1.5 - CANVAS_WIDTH * 0.25;

      // Try to find a position that doesn't overlap
      do {
        x = baseX + (Math.random() - 0.5) * 40; // Small random offset
        attempts++;
      } while (
        attempts < 10 &&
        usedPositions.some(pos => Math.abs(pos - x) < minSpacing)
      );

      usedPositions.push(x);
      const width = isFar ? 50 + Math.random() * 20 : 60 + Math.random() * 30;

      trees.push({
        x,
        height: baseHeight + Math.random() * (CANVAS_HEIGHT * 0.1),
        width,
        hasOranges: true, // Always show oranges on orange trees!
        orangeOffsets: makeOrangeOffsets(width),
        shapeVariant: Math.floor(Math.random() * 6),
        canopyOffset: (Math.random() - 0.5) * (isFar ? 0.1 : 0.15),
      });
    }
    return trees;
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Generate grass tufts for foreground - optimized for mobile
  const generateGrassTufts = useCallback(() => {
    const tufts: Array<{ x: number; height: number }> = [];
    for (let i = 0; i < 12; i++) { // Reduced from 30 to 12
      tufts.push({
        x: (i / 12) * CANVAS_WIDTH * 1.5,
        height: 6 + Math.random() * 10,
      });
    }
    return tufts;
  }, [CANVAS_WIDTH]);

  // Update generateStarsRef so touch handler can access it
  useEffect(() => { generateStarsRef.current = generateStars; }, [generateStars]);

  // Generate stars on mount so they can fade in during day-to-night transition
  useEffect(() => {
    if (gameStateRef.current.stars.length === 0) {
      gameStateRef.current.stars = generateStars();
    }
  }, [generateStars]);

  // Get environment based on score (legacy - kept for compatibility)
  const getEnvironment = useCallback((currentScore: number): keyof typeof ENVIRONMENT_COLORS => {
    // Faster progression through the day cycle
    if (currentScore < 3) return 'dawn';      // 0-2: Early morning sunrise
    if (currentScore < 8) return 'day';       // 3-7: Bright midday
    if (currentScore < 14) return 'golden';   // 8-13: Golden hour
    if (currentScore < 20) return 'sunset';   // 14-19: Sunset
    if (currentScore < 26) return 'dusk';     // 20-25: Twilight
    return 'night';                           // 26+: Starry night
  }, []);

  // ============================================
  // TIME-BASED DAY/NIGHT CYCLE SYSTEM
  // ============================================

  // Get cycle info from current time
  const getCycleInfo = useCallback(() => {
    const cycleTime = cycleTimeRef.current % CYCLE_DURATION_MS;
    const normalizedCycle = cycleTime / CYCLE_DURATION_MS;  // 0 to 1

    const isDay = cycleTime < DAY_DURATION_MS;
    const phaseTime = isDay
      ? cycleTime / DAY_DURATION_MS  // 0-1 during day
      : (cycleTime - DAY_DURATION_MS) / NIGHT_DURATION_MS;  // 0-1 during night

    return { normalizedCycle, isDay, phaseTime, cycleTime };
  }, []);

  // Calculate sun/moon position along arc
  const getCelestialPosition = useCallback((phaseTime: number) => {
    // phaseTime: 0 = rising (left), 0.5 = zenith (top), 1 = setting (right)
    const angle = phaseTime * Math.PI;  // 0 to π

    // Arc spans from left edge to right edge
    const arcWidth = CANVAS_WIDTH * 0.9;
    const arcCenterX = CANVAS_WIDTH / 2;
    const arcCenterY = CANVAS_HEIGHT * 1.1;  // Arc origin below canvas
    const arcHeight = CANVAS_HEIGHT * 0.9;   // How high the sun/moon gets

    return {
      x: arcCenterX - (arcWidth / 2) * Math.cos(angle),  // Left to right
      y: arcCenterY - arcHeight * Math.sin(angle),       // Arc up and down
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Get interpolated colors based on cycle time
  const getInterpolatedColors = useCallback((cycleInfo: { isDay: boolean; phaseTime: number }) => {
    const { isDay, phaseTime } = cycleInfo;

    // Define phase transitions for smooth color blending
    // Day: dawn (0-0.10) → day (0.10-0.75) → golden (0.75-0.88) → sunset (0.88-1.0)
    // Night: dusk (0-0.15) → night (0.15-0.85) → pre-dawn (0.85-1.0)

    let fromEnv: keyof typeof ENVIRONMENT_COLORS;
    let toEnv: keyof typeof ENVIRONMENT_COLORS;
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
    const smoothT = t < 0.5
      ? (1 - Math.cos(t * Math.PI)) / 2
      : (1 - Math.cos(t * Math.PI)) / 2;

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
  }, []);

  // Cached color getter - cycleInfo is always fresh (for smooth animation),
  // but colors are cached every 100ms (expensive to calculate, change slowly)
  const getCachedColors = useCallback(() => {
    const now = performance.now();
    const cache = colorCacheRef.current;

    // Always get fresh cycleInfo for smooth celestial body movement
    const cycleInfo = getCycleInfo();

    // Recalculate colors every 100ms for smooth transitions (still cached, not every frame)
    if (!cache.colors || now - cache.lastUpdate > 100) {
      cache.colors = getInterpolatedColors(cycleInfo);
      cache.lastUpdate = now;
    }

    return { cycleInfo, colors: cache.colors! };
  }, [getCycleInfo, getInterpolatedColors]);

  // ============================================
  // JUICE HELPER FUNCTIONS
  // ============================================

  // Play a tone using Web Audio API
  const playTone = useCallback((frequency: number, volume: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      // Audio context may not be available
    }
  }, [soundEnabled]);

  // Trigger haptic feedback
  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Trigger screen shake
  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    shakeRef.current = { intensity, startTime: Date.now(), duration };
  }, []);

  // Spawn death particles
  const spawnDeathParticles = useCallback((x: number, y: number) => {
    const particles: Particle[] = [];
    const colors = ['#FF6B00', '#FF8C33', '#FFD700', '#FFA500', '#FF4500', '#228B22']; // Orange + leaf colors

    for (let i = 0; i < JUICE_CONFIG.DEATH_PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / JUICE_CONFIG.DEATH_PARTICLE_COUNT + Math.random() * 0.5;
      const speed = 3 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.15,
      });
    }
    deathParticlesRef.current = particles;
    // Cap particles for mobile performance
    if (deathParticlesRef.current.length > JUICE_CONFIG.MAX_DEATH_PARTICLES) {
      deathParticlesRef.current = deathParticlesRef.current.slice(-JUICE_CONFIG.MAX_DEATH_PARTICLES);
    }
  }, []);

  // Spawn wing particles on flap
  const spawnWingParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < JUICE_CONFIG.WING_PARTICLE_COUNT; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 0.8; // Backward direction
      const speed = 2 + Math.random() * 3;
      newParticles.push({
        x: x - 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        alpha: 0.8,
        rotation: 0,
        rotationSpeed: 0,
        color: `rgba(255, 140, 0, ${0.6 + Math.random() * 0.4})`,
      });
    }
    wingParticlesRef.current.push(...newParticles);
    // Cap particles for mobile performance
    if (wingParticlesRef.current.length > JUICE_CONFIG.MAX_WING_PARTICLES) {
      wingParticlesRef.current = wingParticlesRef.current.slice(-JUICE_CONFIG.MAX_WING_PARTICLES);
    }
  }, []);

  // Spawn pass particles
  const spawnPassParticles = useCallback((x: number, gapY: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#FFD700', '#FFA500', '#FF6B00', '#FFFFFF'];

    for (let i = 0; i < JUICE_CONFIG.PASS_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      newParticles.push({
        x,
        y: gapY + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        size: 2 + Math.random() * 4,
        alpha: 1,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    passParticlesRef.current.push(...newParticles);
    // Cap particles for mobile performance
    if (passParticlesRef.current.length > JUICE_CONFIG.MAX_PASS_PARTICLES) {
      passParticlesRef.current = passParticlesRef.current.slice(-JUICE_CONFIG.MAX_PASS_PARTICLES);
    }
  }, []);

  // Play musical note for pipe pass
  const playPassNote = useCallback((pipeNumber: number) => {
    const noteIndex = (pipeNumber - 1) % JUICE_CONFIG.PASS_SCALE_FREQUENCIES.length;
    const frequency = JUICE_CONFIG.PASS_SCALE_FREQUENCIES[noteIndex];
    playTone(frequency, 0.15, 200);
  }, [playTone]);

  // Trigger impact flash
  const triggerImpactFlash = useCallback(() => {
    setImpactFlashAlpha(JUICE_CONFIG.IMPACT_FLASH_ALPHA);
    setTimeout(() => setImpactFlashAlpha(0), JUICE_CONFIG.IMPACT_FLASH_DURATION);
  }, []);

  // Apply flap deformation (squash/stretch)
  const applyFlapDeformation = useCallback(() => {
    const state = gameStateRef.current;
    state.bird.scaleX = JUICE_CONFIG.FLAP_SCALE_X;
    state.bird.scaleY = JUICE_CONFIG.FLAP_SCALE_Y;

    setTimeout(() => {
      // Smooth return
      state.bird.scaleX = 1;
      state.bird.scaleY = 1;
    }, JUICE_CONFIG.FLAP_DURATION);
  }, []);

  // Start slow-motion death sequence
  const startSlowMotionDeath = useCallback(() => {
    const state = gameStateRef.current;
    state.timeScale = JUICE_CONFIG.SLOW_MO_SCALE;
    state.bird.rotationVelocity = JUICE_CONFIG.TUMBLE_ROTATION_SPEED;
    state.bird.velocityX = -JUICE_CONFIG.DEATH_KNOCKBACK_X;
    state.bird.velocity = JUICE_CONFIG.DEATH_KNOCKBACK_Y;

    slowMoTimeoutRef.current = setTimeout(() => {
      state.timeScale = 1;
    }, JUICE_CONFIG.SLOW_MO_DURATION);
  }, []);

  // Stop background music immediately
  const stopBgMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
  }, []);

  const triggerDeathFreeze = useCallback(() => {
    const state = gameStateRef.current;
    if (state.isDying) return; // Prevent double trigger

    state.isDying = true;
    state.isFrozen = true;

    // Stop background music immediately on death
    stopBgMusic();

    // Visual effects
    triggerImpactFlash();
    triggerScreenShake(JUICE_CONFIG.SCREEN_SHAKE_INTENSITY, JUICE_CONFIG.SCREEN_SHAKE_DURATION);
    spawnDeathParticles(BIRD_X, state.bird.y);
    triggerHaptic(40); // Heavy haptic

    // After freeze, start slow-mo tumble
    freezeTimeoutRef.current = setTimeout(() => {
      state.isFrozen = false;
      startSlowMotionDeath();
    }, JUICE_CONFIG.FREEZE_DURATION);
  }, [BIRD_X, triggerImpactFlash, triggerScreenShake, spawnDeathParticles, triggerHaptic, startSlowMotionDeath, stopBgMusic]);

  // Update particles
  const updateParticles = useCallback((particles: Particle[], deltaTime: number): Particle[] => {
    return particles.filter(p => {
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      if (p.gravity) {
        p.vy += p.gravity * deltaTime;
      }
      p.rotation += p.rotationSpeed * deltaTime;
      p.alpha -= 0.02 * deltaTime;
      return p.alpha > 0;
    });
  }, []);

  // Trigger screen brightness pulse for pass
  const triggerPassPulse = useCallback(() => {
    setScreenBrightness(1 + JUICE_CONFIG.SCREEN_PULSE_INTENSITY);
    setTimeout(() => setScreenBrightness(1), 100);
  }, []);

  // Near-miss detection - close to pipe edge = +1 bonus
  const checkNearMiss = useCallback((birdY: number, pipe: Pipe): { isNearMiss: boolean } => {
    const gapTop = pipe.gapY - PIPE_GAP / 2;
    const gapBottom = pipe.gapY + PIPE_GAP / 2;
    const threshold = PIPE_GAP * JUICE_CONFIG.NEAR_MISS_THRESHOLD;

    const distFromTop = (birdY - BIRD_RADIUS) - gapTop;
    const distFromBottom = gapBottom - (birdY + BIRD_RADIUS);
    const minDist = Math.min(distFromTop, distFromBottom);

    // Near miss = within threshold distance of pipe edge
    return { isNearMiss: minDist < threshold && minDist > 0 };
  }, []);

  // Check for perfect center pass (dead center through gap) = +1 bonus
  const checkPerfectCenter = useCallback((birdY: number, pipe: Pipe): { isPerfect: boolean } => {
    const gapCenter = pipe.gapY;
    const distFromCenter = Math.abs(birdY - gapCenter);
    const perfectThreshold = PIPE_GAP * 0.12; // Within 12% of center

    return { isPerfect: distFromCenter < perfectThreshold };
  }, []);

  // Trigger near-miss effects
  const triggerNearMissEffects = useCallback((intensity: number, consecutiveCount: number) => {
    // Yellow flash with intensity
    setNearMissFlashAlpha(0.3 * intensity);
    setTimeout(() => setNearMissFlashAlpha(0), 150);

    // Haptic flutter
    triggerHaptic([10, 20, 10]);

    // Sound - higher pitch for higher intensity
    const basePitch = 400 + (intensity * 200);
    playTone(basePitch, 0.1, 100);

    // Callout for high intensity or consecutive
    if (intensity > 0.7 || consecutiveCount >= 2) {
      const callouts = ['CLOSE!', 'RISKY!', 'NARROW!', 'TIGHT!'];
      showEpicCallout(callouts[Math.floor(Math.random() * callouts.length)]);
    }
  }, [triggerHaptic, playTone, showEpicCallout]);

  // Calculate near-miss bonus: +1 to +3 based on how close to the pipe edge
  const calculateNearMissBonus = useCallback((intensity: number): number => {
    // intensity 0-1 maps to bonus 1-3
    return JUICE_CONFIG.NEAR_MISS_BONUS[Math.min(Math.floor(intensity * 3), 2)];
  }, []);


  // ============================================
  // SHARE SYSTEM FUNCTIONS
  // ============================================

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Generate share image
  const generateShareImage = useCallback(async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#FF6B00');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.fillText('Flappy Orange', 300, 60);

    // Score
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = 20;
    ctx.fillText(String(score), 300, 180);
    ctx.shadowBlur = 0;

    // Label
    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('points', 300, 220);

    // Stats
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText(`Best: ${highScore}`, 300, 280);

    // Branding
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('wojak.ink', 300, 380);

    // Orange emoji
    ctx.font = '48px Arial';
    ctx.fillText('🍊', 300, 350);

    return canvas.toDataURL('image/png');
  }, [score, highScore]);

  // Encode challenge link
  const encodeChallenge = useCallback((targetScore: number): string => {
    const data = { s: targetScore, t: Date.now() };
    const encoded = btoa(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
  }, []);

  // Decode challenge from URL
  const decodeChallenge = useCallback((encoded: string): number | null => {
    try {
      const data = JSON.parse(atob(encoded));
      return data.s || null;
    } catch {
      return null;
    }
  }, []);

  // Create share text
  const createShareText = useCallback((): string => {
    const lines = [
      `🍊 I scored ${score} in Flappy Orange!`,
      `Can you beat me?`,
      encodeChallenge(score),
    ].filter(Boolean);
    return lines.join('\n');
  }, [score, encodeChallenge]);

  // Handle native share
  const handleNativeShare = useCallback(async () => {
    triggerHaptic(10);
    const text = createShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flappy Orange',
          text,
        });
        showToast('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to clipboard
          await navigator.clipboard.writeText(text);
          showToast('Link copied to clipboard!');
        }
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text);
      showToast('Link copied to clipboard!');
    }
  }, [createShareText, showToast, triggerHaptic]);

  // Open share modal
  const openShareModal = useCallback(async () => {
    triggerHaptic(10);
    const imageUrl = await generateShareImage();
    setShareImageUrl(imageUrl);
    setShowShareModal(true);
  }, [generateShareImage, triggerHaptic]);

  // Download share image
  const handleDownloadImage = useCallback(() => {
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.download = `flappy-orange-${score}.png`;
    link.href = shareImageUrl;
    link.click();
    showToast('Image downloaded!');
  }, [shareImageUrl, score, showToast]);

  // Copy challenge link
  const handleCopyLink = useCallback(async () => {
    const link = encodeChallenge(score);
    await navigator.clipboard.writeText(link);
    triggerHaptic(10);
    showToast('Challenge link copied!');
  }, [encodeChallenge, score, showToast, triggerHaptic]);

  // Check for challenge on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('challenge');
    if (challengeParam) {
      const target = decodeChallenge(challengeParam);
      if (target && target > 0) {
        setChallengeTarget(target);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [decodeChallenge]);

  // Check if challenge beaten
  useEffect(() => {
    if (challengeTarget && score >= challengeTarget && !challengeBeaten) {
      setChallengeBeaten(true);
      showEpicCallout('🏆 CHALLENGE BEATEN! 🏆');
      triggerConfetti();
      triggerHaptic([20, 50, 20, 50, 20]);
    }
  }, [score, challengeTarget, challengeBeaten, showEpicCallout, triggerConfetti, triggerHaptic]);

  // ============================================
  // WEATHER EFFECTS (Storm Mode)
  // ============================================

  // Spawn rain drops - optimized for mobile
  // staggerY: if true, spawn at random Y positions across screen (for debug/instant fill)
  const spawnRainDrops = useCallback((count: number, staggerY: boolean = false) => {
    for (let i = 0; i < count; i++) {
      rainDropsRef.current.push({
        x: Math.random() * CANVAS_WIDTH * 1.2 - CANVAS_WIDTH * 0.1,
        y: staggerY ? Math.random() * CANVAS_HEIGHT : -10 - Math.random() * 50,
        length: 12 + Math.random() * 12,
        speed: 10 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.3,
        foreground: Math.random() < 0.4, // 30% render in front of pipes
      });
    }
    // Cap rain drops
    if (rainDropsRef.current.length > WEATHER_CONFIG.MAX_RAIN_DROPS) {
      rainDropsRef.current = rainDropsRef.current.slice(-WEATHER_CONFIG.MAX_RAIN_DROPS);
    }
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Update rain drops - spawn splashes when hitting ground
  const updateRainDrops = useCallback(() => {
    const groundY = CANVAS_HEIGHT - 20;
    rainDropsRef.current = rainDropsRef.current.filter(drop => {
      drop.y += drop.speed;
      drop.x -= 2; // Wind effect

      // Spawn splash when hitting ground
      if (drop.y >= groundY && rainSplashesRef.current.length < 50) {
        // Spawn 2-3 tiny splash particles
        const splashCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < splashCount; i++) {
          rainSplashesRef.current.push({
            x: drop.x,
            y: groundY,
            vx: (Math.random() - 0.5) * 3,
            vy: -1 - Math.random() * 2,
            alpha: 0.6,
            size: 1 + Math.random(),
          });
        }
      }

      return drop.y < groundY;
    });
  }, [CANVAS_HEIGHT]);

  // Update rain splashes
  const updateRainSplashes = useCallback(() => {
    rainSplashesRef.current = rainSplashesRef.current.filter(splash => {
      splash.x += splash.vx;
      splash.y += splash.vy;
      splash.vy += 0.2; // Gravity
      splash.alpha -= 0.05;
      return splash.alpha > 0;
    });
  }, []);

  // Draw rain splashes
  const drawRainSplashes = useCallback((ctx: CanvasRenderingContext2D) => {
    if (rainSplashesRef.current.length === 0) return;
    ctx.save();
    rainSplashesRef.current.forEach(splash => {
      ctx.fillStyle = `rgba(150, 180, 210, ${splash.alpha})`;
      ctx.beginPath();
      ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  // Draw rain (foregroundOnly: true = only foreground drops, false = only background, undefined = all)
  const drawRain = useCallback((ctx: CanvasRenderingContext2D, foregroundOnly?: boolean) => {
    ctx.save();
    rainDropsRef.current.forEach(drop => {
      // Filter by layer
      if (foregroundOnly !== undefined && drop.foreground !== foregroundOnly) return;

      // Darker blue-gray color so rain is visible during day
      ctx.strokeStyle = `rgba(80, 100, 130, ${drop.opacity + 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 3, drop.y + drop.length);
      ctx.stroke();
    });
    ctx.restore();
  }, []);

  // Trigger lightning
  const triggerLightning = useCallback(() => {
    lightningRef.current = { alpha: 1, sequence: 0, startTime: Date.now() };
    setLightningAlpha(0.8);

    // Multi-flash sequence
    setTimeout(() => setLightningAlpha(0.2), 50);
    setTimeout(() => setLightningAlpha(0.6), 100);
    setTimeout(() => setLightningAlpha(0.1), 150);
    setTimeout(() => setLightningAlpha(0.4), 200);
    setTimeout(() => setLightningAlpha(0), 300);

    // Thunder shake after delay
    setTimeout(() => {
      triggerScreenShake(4, 300);
      playTone(60, 0.15, 400); // Low rumble
    }, 400);
  }, [triggerScreenShake, playTone]);

  // Draw lightning flash - blue-white for dramatic effect
  const drawLightningFlash = useCallback((ctx: CanvasRenderingContext2D, alpha: number) => {
    if (alpha <= 0) return;
    ctx.save();
    // Main white flash
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Blue tint overlay for electric feel
    ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw vignette effect - only for truly dark environments
  const drawVignette = useCallback((ctx: CanvasRenderingContext2D, env: keyof typeof ENVIRONMENT_COLORS) => {
    // Only draw vignette for night and storm - skip all other environments
    if (env !== 'night' && env !== 'storm') return;

    ctx.save();
    // Subtle top darkening for atmosphere - use gradient for smooth fade
    const alpha = env === 'storm' ? 0.2 : 0.15;
    const gradient = ctx.createLinearGradient(0, 0, 0, 40);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 40);

    ctx.restore();
  }, [CANVAS_WIDTH]);

  // ============================================
  // WEATHER SYSTEM FUNCTIONS
  // ============================================

  // Get current time-of-day phase for weather decisions
  const getTimeOfDayPhase = useCallback((): 'day' | 'night' | 'dawn' | 'dusk' => {
    const progress = cycleTimeRef.current / CYCLE_DURATION_MS;
    if (progress < 0.5) {
      const dayProgress = progress / 0.5;
      if (dayProgress < 0.12) return 'dawn';
      if (dayProgress > 0.85) return 'dusk';
      return 'day';
    } else {
      const nightProgress = (progress - 0.5) / 0.5;
      if (nightProgress > 0.9) return 'dawn';
      return 'night';
    }
  }, []);

  // Get difficulty tier based on score
  const getDifficultyTier = useCallback((score: number): number => {
    const thresholds = DIFFICULTY_CONFIG.TIER_THRESHOLDS;
    for (let i = 0; i < thresholds.length; i++) {
      if (score < thresholds[i]) return i;
    }
    return thresholds.length;
  }, []);

  // Get current gap size based on difficulty
  const getCurrentGapSize = useCallback((score: number): number => {
    const tier = getDifficultyTier(score);
    return DIFFICULTY_CONFIG.GAP_SIZES[tier] || DIFFICULTY_CONFIG.GAP_SIZES[DIFFICULTY_CONFIG.GAP_SIZES.length - 1];
  }, [getDifficultyTier]);

  // Get current speed multiplier
  const getSpeedMultiplier = useCallback((score: number): number => {
    const tier = getDifficultyTier(score);
    return DIFFICULTY_CONFIG.SPEED_MULTIPLIERS[tier] || DIFFICULTY_CONFIG.SPEED_MULTIPLIERS[DIFFICULTY_CONFIG.SPEED_MULTIPLIERS.length - 1];
  }, [getDifficultyTier]);

  // Update weather state machine - uses sequences for natural progressions
  const updateWeather = useCallback((deltaTime: number) => {
    if (PERFORMANCE_MODE || ULTRA_PERFORMANCE_MODE) return;

    const weather = weatherRef.current;
    const deltaMs = deltaTime * 16.67;
    weatherTimerRef.current -= deltaMs;

    // Check if it's time to advance in the sequence
    if (weatherTimerRef.current <= 0 && !weather.nextWeather) {
      // Move to next step in sequence
      weather.sequenceIndex++;

      // Check if sequence is complete
      if (weather.sequenceIndex >= weather.currentSequence.length) {
        // Sequence done - enter clear buffer period
        if (!weather.inClearBuffer) {
          weather.inClearBuffer = true;
          weather.nextWeather = 'clear';
          weather.transitionProgress = 0;
          weatherTimerRef.current = WEATHER_CONFIG.CLEAR_BUFFER_DURATION;
        } else {
          // Clear buffer done - pick a new weather sequence
          weather.inClearBuffer = false;
          const rand = Math.random();
          const chances = WEATHER_CONFIG.EVENT_CHANCES;
          let sequenceKey: string;

          if (rand < chances.rain) {
            sequenceKey = 'rain';
          } else if (rand < chances.rain + chances.storm) {
            sequenceKey = 'storm';
          } else if (rand < chances.rain + chances.storm + chances.snow) {
            sequenceKey = 'snow';
          } else {
            sequenceKey = 'clear';
          }

          weather.currentSequence = [...WEATHER_SEQUENCES[sequenceKey]];
          weather.sequenceIndex = 0;
          weather.nextWeather = weather.currentSequence[0];
          weather.transitionProgress = 0;
          weatherTimerRef.current = WEATHER_CONFIG.MIN_WEATHER_DURATION +
            Math.random() * (WEATHER_CONFIG.MAX_WEATHER_DURATION - WEATHER_CONFIG.MIN_WEATHER_DURATION);

          // Random chance to start fog overlay with new sequence
          if (weather.fogIntensity === 0 && Math.random() < WEATHER_CONFIG.FOG_CHANCE) {
            fogTimerRef.current = WEATHER_CONFIG.FOG_DURATION.min +
              Math.random() * (WEATHER_CONFIG.FOG_DURATION.max - WEATHER_CONFIG.FOG_DURATION.min);
          }
        }
      } else {
        // Advance to next weather in sequence
        const nextInSequence = weather.currentSequence[weather.sequenceIndex];
        if (nextInSequence !== weather.current) {
          weather.nextWeather = nextInSequence;
          weather.transitionProgress = 0;
        }
        weatherTimerRef.current = WEATHER_CONFIG.MIN_WEATHER_DURATION +
          Math.random() * (WEATHER_CONFIG.MAX_WEATHER_DURATION - WEATHER_CONFIG.MIN_WEATHER_DURATION);
      }
    }

    // Handle weather transitions (smooth fade between types)
    if (weather.nextWeather) {
      weather.transitionProgress += deltaMs / WEATHER_CONFIG.TRANSITION_DURATION;
      if (weather.transitionProgress >= 1) {
        weather.current = weather.nextWeather;
        weather.nextWeather = null;
        weather.transitionProgress = 1;
      }
    }

    // Ramp intensity up/down for precipitation weather (gradual ~5 seconds)
    const isPrecipitating = weather.current === 'rain' || weather.current === 'storm' || weather.current === 'snow';
    const targetIntensity = isPrecipitating ? 1 : 0;
    const intensityRampSpeed = 0.0004; // ~5 seconds to full intensity (slower, more natural)

    if (weather.intensity < targetIntensity) {
      weather.intensity = Math.min(targetIntensity, weather.intensity + intensityRampSpeed * deltaTime);
    } else if (weather.intensity > targetIntensity) {
      weather.intensity = Math.max(targetIntensity, weather.intensity - intensityRampSpeed * deltaTime);
    }

    // Handle fog overlay separately (can combine with any weather)
    // SLOW fade in/out over ~15-20 seconds
    if (fogTimerRef.current > 0) {
      fogTimerRef.current -= deltaMs;
      // Ramp fog in slowly
      weather.fogIntensity = Math.min(1, weather.fogIntensity + 0.0008 * deltaTime);
    } else {
      // Ramp fog out slowly
      weather.fogIntensity = Math.max(0, weather.fogIntensity - 0.0008 * deltaTime);
    }

    // Handle snow accumulation on ground
    // Snow edge scrolls left when snow stops (like ground is moving)
    const isSnowing = weather.current === 'snow' && weather.intensity > 0.2;
    const isPlaying = gameStateRef.current.gameState === 'playing';

    if (isSnowing) {
      // Build up snow on ground (slower than snowflakes appear)
      snowAccumulationRef.current = Math.min(1, snowAccumulationRef.current + 0.0004 * deltaTime);
      // Keep snow edge at right side of screen while snowing
      snowGroundEdgeRef.current = CANVAS_WIDTH + 50;
    } else if (snowGroundEdgeRef.current > -50 && isPlaying) {
      // Snow stopped AND game is playing - scroll the snow edge left with game speed
      const gameSpeed = 2.5 * deltaTime; // Match pipe speed
      snowGroundEdgeRef.current -= gameSpeed;
      // Keep accumulation level for existing snow (doesn't fade, just scrolls off)
    }
    // Reset accumulation when all snow has scrolled off
    if (snowGroundEdgeRef.current <= -50) {
      snowAccumulationRef.current = 0;
    }

    // Update wind (stronger during storm)
    const windChange = weather.current === 'storm' ? 0.03 : WEATHER_CONFIG.WIND_CHANGE_RATE;
    const maxWind = weather.current === 'storm' ? WEATHER_CONFIG.STORM_WIND_SPEED : WEATHER_CONFIG.MAX_WIND_SPEED;
    weather.windSpeed += (Math.random() - 0.5) * windChange;
    weather.windSpeed = Math.max(-maxWind, Math.min(maxWind, weather.windSpeed));
  }, [getTimeOfDayPhase]);

  // Debug: Manually set weather type
  const setWeatherType = useCallback((type: WeatherType) => {
    const weather = weatherRef.current;
    const isPrecipitating = type === 'rain' || type === 'storm' || type === 'snow';
    weather.current = type;
    // Start intensity at 0 for precipitation so it ramps up gradually
    weather.intensity = isPrecipitating ? 0 : 1;
    weather.transitionProgress = 1;
    weather.nextWeather = null;
    lightningBoltsRef.current = [];
  }, []);

  // Debug: Toggle fog overlay
  const toggleFog = useCallback(() => {
    const weather = weatherRef.current;
    if (weather.fogIntensity > 0 || fogTimerRef.current > 0) {
      // Turn off fog
      fogTimerRef.current = 0;
    } else {
      // Turn on fog for 15 seconds
      fogTimerRef.current = 15000;
    }
  }, []);

  // Spawn snowflakes
  // staggerY: if true, spawn at random Y positions across screen (for debug/instant fill)
  const spawnSnowflakes = useCallback((count: number, staggerY: boolean = false) => {
    const snowflakes = snowflakesRef.current;
    for (let i = 0; i < count && snowflakes.length < WEATHER_CONFIG.MAX_SNOWFLAKES; i++) {
      snowflakes.push({
        x: Math.random() * CANVAS_WIDTH,
        y: staggerY ? Math.random() * CANVAS_HEIGHT : -10,
        size: WEATHER_CONFIG.SNOW_SIZE.min + Math.random() * (WEATHER_CONFIG.SNOW_SIZE.max - WEATHER_CONFIG.SNOW_SIZE.min),
        speed: WEATHER_CONFIG.SNOW_FALL_SPEED.min + Math.random() * (WEATHER_CONFIG.SNOW_FALL_SPEED.max - WEATHER_CONFIG.SNOW_FALL_SPEED.min),
        drift: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        opacity: 0.5 + Math.random() * 0.5,
        foreground: Math.random() < 0.4, // 30% in foreground
      });
    }
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Update snowflakes
  const updateSnowflakes = useCallback((deltaTime: number) => {
    const snowflakes = snowflakesRef.current;
    const wind = weatherRef.current.windSpeed;
    for (let i = snowflakes.length - 1; i >= 0; i--) {
      const flake = snowflakes[i];
      flake.y += flake.speed * deltaTime;
      flake.driftPhase += 0.02 * deltaTime;
      flake.x += Math.sin(flake.driftPhase) * 0.5 + wind * 0.3 * deltaTime;
      if (flake.y > CANVAS_HEIGHT || flake.x < -20 || flake.x > CANVAS_WIDTH + 20) {
        snowflakes.splice(i, 1);
      }
    }
  }, [CANVAS_HEIGHT, CANVAS_WIDTH]);

  // Draw snowflakes (foregroundOnly: true = only foreground, false = only background, undefined = all)
  const drawSnowflakes = useCallback((ctx: CanvasRenderingContext2D, foregroundOnly?: boolean) => {
    ctx.save();
    snowflakesRef.current.forEach(flake => {
      // Filter by layer
      if (foregroundOnly !== undefined && flake.foreground !== foregroundOnly) return;

      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }, []);

  // Draw fog effect (uses fogIntensity from weather state) - VERY VISIBLE
  const drawFog = useCallback((ctx: CanvasRenderingContext2D) => {
    const fogIntensity = weatherRef.current.fogIntensity;
    if (fogIntensity <= 0) return;

    ctx.save();

    // Main fog overlay - strong white/gray that actually reduces visibility
    ctx.fillStyle = `rgba(220, 220, 230, ${0.5 * fogIntensity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Bottom fog (thicker near ground)
    const gradient1 = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.3, 0, CANVAS_HEIGHT);
    gradient1.addColorStop(0, 'rgba(200, 200, 210, 0)');
    gradient1.addColorStop(1, `rgba(180, 180, 195, ${0.6 * fogIntensity})`);
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, CANVAS_HEIGHT * 0.3, CANVAS_WIDTH, CANVAS_HEIGHT * 0.7);

    // Additional haze layer
    ctx.fillStyle = `rgba(230, 230, 240, ${0.3 * fogIntensity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Layer 3: Wispy top (lighter)
    const gradient3 = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.5);
    gradient3.addColorStop(0, `rgba(220, 220, 230, ${fogIntensity * 0.5})`);
    gradient3.addColorStop(1, 'rgba(220, 220, 230, 0)');
    ctx.fillStyle = gradient3;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.5);
    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw snow accumulation on ground and ice effect
  // Snow scrolls off from right to left when snow stops
  const drawSnowAccumulation = useCallback((ctx: CanvasRenderingContext2D) => {
    const accumulation = snowAccumulationRef.current;
    const snowEdge = snowGroundEdgeRef.current;
    if (accumulation <= 0 || snowEdge <= 0) return;

    ctx.save();
    const groundY = CANVAS_HEIGHT - 20;
    const snowWidth = Math.min(snowEdge, CANVAS_WIDTH); // Don't draw past screen

    // Snow layer on ground (white with slight blue tint) - only up to snow edge
    const snowHeight = 8 * accumulation; // Up to 8px of snow
    const snowGradient = ctx.createLinearGradient(0, groundY - snowHeight, 0, groundY);
    snowGradient.addColorStop(0, `rgba(255, 255, 255, ${0.95 * accumulation})`);
    snowGradient.addColorStop(1, `rgba(230, 240, 255, ${0.9 * accumulation})`);
    ctx.fillStyle = snowGradient;
    ctx.fillRect(0, groundY - snowHeight, snowWidth, snowHeight + 5);

    // Ice/frost shimmer on ground - only up to snow edge
    ctx.fillStyle = `rgba(200, 230, 255, ${0.3 * accumulation})`;
    ctx.fillRect(0, groundY, snowWidth, 20);

    // Small snow mounds (subtle bumps) - only up to snow edge
    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * accumulation})`;
    for (let x = 20; x < snowWidth; x += 60) {
      const moundWidth = 25 + (x % 30);
      const moundHeight = 3 + (x % 5) * accumulation;
      ctx.beginPath();
      ctx.ellipse(x, groundY - snowHeight + 2, moundWidth, moundHeight, 0, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw frost/ice on pipes - each pipe keeps its frost level from spawn time
  // Frost scrolls off naturally as pipes move left
  const drawPipeFrost = useCallback((ctx: CanvasRenderingContext2D, pipes: Pipe[]) => {
    ctx.save();

    pipes.forEach(pipe => {
      // Use each pipe's individual frost level (set at spawn)
      const pipeFrost = pipe.frostLevel;
      if (pipeFrost <= 0.2) return; // Skip pipes with no significant frost

      const frostAlpha = (pipeFrost - 0.2) * 1.25;
      const gapSize = pipe.gapSize;
      const topPipeBottom = pipe.gapY - gapSize / 2;
      const bottomPipeTop = pipe.gapY + gapSize / 2;

      // Frost on top of bottom pipe cap (snow accumulation)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * frostAlpha})`;
      ctx.fillRect(pipe.x - 5, bottomPipeTop, PIPE_WIDTH + 10, 6 * frostAlpha);

      // Icicles hanging from top pipe
      ctx.fillStyle = `rgba(200, 230, 255, ${0.7 * frostAlpha})`;
      const icicleCount = 4;
      for (let i = 0; i < icicleCount; i++) {
        const icicleX = pipe.x + (i + 0.5) * (PIPE_WIDTH / icicleCount);
        const icicleHeight = 8 + (i % 3) * 4;
        ctx.beginPath();
        ctx.moveTo(icicleX - 3, topPipeBottom);
        ctx.lineTo(icicleX + 3, topPipeBottom);
        ctx.lineTo(icicleX, topPipeBottom + icicleHeight * frostAlpha);
        ctx.closePath();
        ctx.fill();
      }

      // Frost/ice overlay on pipes (subtle blue tint)
      ctx.fillStyle = `rgba(200, 220, 255, ${0.15 * frostAlpha})`;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBottom);
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeTop - 20);
    });

    ctx.restore();
  }, [CANVAS_HEIGHT]);

  // Spawn bird flock
  const spawnBirdFlock = useCallback(() => {
    const birds = backgroundBirdsRef.current;
    if (birds.length > 0) return; // Only one flock at a time
    
    const flockSize = WEATHER_CONFIG.FLOCK_SIZE.min + Math.floor(Math.random() * (WEATHER_CONFIG.FLOCK_SIZE.max - WEATHER_CONFIG.FLOCK_SIZE.min));
    const baseY = 50 + Math.random() * (CANVAS_HEIGHT * 0.4);
    const baseSpeed = WEATHER_CONFIG.BIRD_SPEED.min + Math.random() * (WEATHER_CONFIG.BIRD_SPEED.max - WEATHER_CONFIG.BIRD_SPEED.min);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const startX = direction > 0 ? -50 : CANVAS_WIDTH + 50;
    
    for (let i = 0; i < flockSize; i++) {
      birds.push({
        x: startX - (i * 20 * direction) + (Math.random() - 0.5) * 15,
        y: baseY + (i % 2 === 0 ? i * 8 : -i * 8),
        wingPhase: Math.random() * Math.PI * 2,
        speed: baseSpeed * direction,
        size: 3 + Math.random() * 2,
        yOffset: Math.sin(i) * 10,
      });
    }
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Update background birds
  const updateBackgroundBirds = useCallback((deltaTime: number) => {
    const birds = backgroundBirdsRef.current;
    for (let i = birds.length - 1; i >= 0; i--) {
      const bird = birds[i];
      bird.x += bird.speed * deltaTime;
      bird.wingPhase += 0.3 * deltaTime;
      bird.y += Math.sin(bird.wingPhase * 0.5) * 0.2;
      if ((bird.speed > 0 && bird.x > CANVAS_WIDTH + 100) || (bird.speed < 0 && bird.x < -100)) {
        birds.splice(i, 1);
      }
    }
  }, [CANVAS_WIDTH]);

  // Draw background birds
  const drawBackgroundBirds = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.fillStyle = 'rgba(40, 40, 50, 0.6)';
    backgroundBirdsRef.current.forEach(bird => {
      const wingOffset = Math.sin(bird.wingPhase) * bird.size * 0.8;
      ctx.beginPath();
      // Body
      ctx.ellipse(bird.x, bird.y, bird.size, bird.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.beginPath();
      ctx.moveTo(bird.x - bird.size, bird.y);
      ctx.quadraticCurveTo(bird.x - bird.size * 1.5, bird.y - wingOffset, bird.x - bird.size * 2.5, bird.y - wingOffset * 0.5);
      ctx.moveTo(bird.x + bird.size, bird.y);
      ctx.quadraticCurveTo(bird.x + bird.size * 1.5, bird.y - wingOffset, bird.x + bird.size * 2.5, bird.y - wingOffset * 0.5);
      ctx.stroke();
    });
    ctx.restore();
  }, []);

  // Spawn falling leaf
  const spawnFallingLeaf = useCallback(() => {
    const leaves = fallingLeavesRef.current;
    if (leaves.length >= WEATHER_CONFIG.MAX_LEAVES) return;
    
    leaves.push({
      x: Math.random() * CANVAS_WIDTH,
      y: -10,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      size: 4 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1,
      drift: Math.random() * Math.PI * 2,
      driftPhase: Math.random() * Math.PI * 2,
      color: WEATHER_CONFIG.LEAF_COLORS[Math.floor(Math.random() * WEATHER_CONFIG.LEAF_COLORS.length)],
    });
  }, [CANVAS_WIDTH]);

  // Update falling leaves
  const updateFallingLeaves = useCallback((deltaTime: number) => {
    const leaves = fallingLeavesRef.current;
    const wind = weatherRef.current.windSpeed;
    for (let i = leaves.length - 1; i >= 0; i--) {
      const leaf = leaves[i];
      leaf.y += leaf.speed * deltaTime;
      leaf.driftPhase += 0.03 * deltaTime;
      leaf.x += Math.sin(leaf.driftPhase) * 0.8 + wind * 0.4 * deltaTime;
      leaf.rotation += leaf.rotationSpeed * deltaTime;
      if (leaf.y > CANVAS_HEIGHT + 10) {
        leaves.splice(i, 1);
      }
    }
  }, [CANVAS_HEIGHT]);

  // Draw falling leaves
  const drawFallingLeaves = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    fallingLeavesRef.current.forEach(leaf => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }, []);

  // Generate lightning bolt with zigzag segments
  const generateLightningBolt = useCallback((): LightningBolt => {
    const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    let x = CANVAS_WIDTH * 0.3 + Math.random() * CANVAS_WIDTH * 0.4;
    let y = 0;
    const endY = CANVAS_HEIGHT * 0.6 + Math.random() * CANVAS_HEIGHT * 0.3;
    
    while (y < endY) {
      const nextY = y + 15 + Math.random() * 25;
      const nextX = x + (Math.random() - 0.5) * 40;
      segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });
      
      // Branch chance
      if (Math.random() < 0.3 && segments.length > 2) {
        const branchEndX = nextX + (Math.random() - 0.5) * 60;
        const branchEndY = nextY + 20 + Math.random() * 30;
        segments.push({ x1: nextX, y1: nextY, x2: branchEndX, y2: branchEndY });
      }
      
      x = nextX;
      y = nextY;
    }
    
    return { segments, alpha: 1, startTime: Date.now() };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Trigger lightning bolt
  const triggerLightningBolt = useCallback(() => {
    lightningBoltsRef.current.push(generateLightningBolt());
    // Also trigger the flash
    setLightningAlpha(0.8);
    setTimeout(() => setLightningAlpha(0.2), 50);
    setTimeout(() => setLightningAlpha(0.6), 100);
    setTimeout(() => setLightningAlpha(0.1), 150);
    setTimeout(() => setLightningAlpha(0.4), 200);
    setTimeout(() => setLightningAlpha(0), 300);
    // Thunder shake
    setTimeout(() => {
      triggerScreenShake(4, 300);
      playTone(60, 0.15, 400);
    }, 400);
  }, [generateLightningBolt, triggerScreenShake, playTone]);

  // Update lightning bolts
  const updateLightningBolts = useCallback(() => {
    const bolts = lightningBoltsRef.current;
    const now = Date.now();
    for (let i = bolts.length - 1; i >= 0; i--) {
      const age = now - bolts[i].startTime;
      bolts[i].alpha = Math.max(0, 1 - age / 200);
      if (bolts[i].alpha <= 0) {
        bolts.splice(i, 1);
      }
    }
  }, []);

  // Draw lightning bolts
  const drawLightningBolts = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    lightningBoltsRef.current.forEach(bolt => {
      ctx.strokeStyle = `rgba(255, 255, 220, ${bolt.alpha})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
      ctx.shadowBlur = 10;
      bolt.segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      });
      // Inner bright line
      ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.alpha})`;
      ctx.lineWidth = 1;
      bolt.segments.forEach(seg => {
        ctx.beginPath();
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
        ctx.stroke();
      });
    });
    ctx.restore();
  }, []);
  // Spawn touch ripple - skip in ultra mode
  const spawnTouchRipple = useCallback((x: number, y: number) => {
    if (ULTRA_PERFORMANCE_MODE) return;
    touchRipplesRef.current.push({
      x,
      y,
      radius: 10,
      alpha: 0.6,
      startTime: Date.now(),
    });
    // Cap ripples
    if (touchRipplesRef.current.length > 5) {
      touchRipplesRef.current.shift();
    }
  }, []);

  // Draw touch ripples
  const drawTouchRipples = useCallback((ctx: CanvasRenderingContext2D) => {
    touchRipplesRef.current.forEach(ripple => {
      ctx.save();
      ctx.strokeStyle = `rgba(255, 140, 0, ${ripple.alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  // Draw pipe gap highlight (safe zone glow) - optimized for mobile (no gradient)
  const drawPipeGapHighlight = useCallback((ctx: CanvasRenderingContext2D, pipes: Pipe[], birdX: number) => {
    // Only highlight the nearest pipe for performance
    const nearestPipe = pipes.find(pipe => {
      const distance = pipe.x - birdX;
      return distance > 0 && distance < 150;
    });

    if (!nearestPipe) return;

    const distance = nearestPipe.x - birdX;
    const intensity = 1 - (distance / 150);
    const gapTop = nearestPipe.gapY - PIPE_GAP / 2;

    // Simple semi-transparent overlay (no gradient)
    ctx.save();
    ctx.fillStyle = `rgba(100, 255, 100, ${0.15 * intensity})`;
    ctx.fillRect(nearestPipe.x - 5, gapTop, PIPE_WIDTH + 10, PIPE_GAP);
    ctx.strokeStyle = `rgba(100, 255, 100, ${0.4 * intensity})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(nearestPipe.x - 5, gapTop, PIPE_WIDTH + 10, PIPE_GAP);
    ctx.restore();
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('flappyOrangeSoundEnabled', String(newState));
    hapticButton();
  }, [soundEnabled, hapticButton]);

  // Show floating score - skip in ultra mode to avoid re-renders
  const showFloatingScore = useCallback((value: string, x: number, y: number) => {
    if (ULTRA_PERFORMANCE_MODE) return; // Skip to avoid state updates
    const id = `score-${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // Generate pipe
  const generatePipe = useCallback((isFirst: boolean = false, currentScore: number = 0): Pipe => {
    // Get dynamic gap size based on difficulty tier
    const gapSize = getCurrentGapSize(currentScore);
    const minGapY = gapSize / 2 + 100;
    const maxGapY = CANVAS_HEIGHT - gapSize / 2 - 100;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    // 40% chance to spawn a coin in the pipe gap
    if (Math.random() < 0.4 && !isFirst) {
      coinsRef.current.push({
        x: CANVAS_WIDTH + PIPE_WIDTH + PIPE_SPACING / 2,
        y: gapY + (Math.random() - 0.5) * (gapSize * 0.5),
        collected: false,
        rotation: 0,
      });
    }

    // Check if this pipe should move (based on difficulty tier)
    const tier = getDifficultyTier(currentScore);
    const movingChance = DIFFICULTY_CONFIG.MOVING_PIPE_CHANCES[tier] || 0;
    const isMoving = !isFirst && Math.random() < movingChance;

    return {
      x: isFirst ? CANVAS_WIDTH + PIPE_WIDTH + 300 : CANVAS_WIDTH + PIPE_WIDTH,
      gapY,
      passed: false,
      isMoving,
      moveSpeed: isMoving ? DIFFICULTY_CONFIG.MOVE_SPEED.min + Math.random() * (DIFFICULTY_CONFIG.MOVE_SPEED.max - DIFFICULTY_CONFIG.MOVE_SPEED.min) : 0,
      moveDirection: Math.random() > 0.5 ? 1 : -1,
      moveRange: isMoving ? DIFFICULTY_CONFIG.MOVE_RANGE.min + Math.random() * (DIFFICULTY_CONFIG.MOVE_RANGE.max - DIFFICULTY_CONFIG.MOVE_RANGE.min) : 0,
      baseGapY: gapY,
      movePhase: Math.random() * Math.PI * 2,
      gapSize,
      frostLevel: snowAccumulationRef.current,  // Capture current snow level at spawn
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, getCurrentGapSize, getDifficultyTier]);

  // Find next leaderboard target to beat
  const findNextTarget = useCallback((currentScore: number) => {
    if (!globalLeaderboard || globalLeaderboard.length === 0) {
      setNextTarget(null);
      return null;
    }

    // Find the lowest-ranked player whose score we haven't beaten yet
    // Leaderboard is sorted by rank (1 = highest score)
    for (let i = globalLeaderboard.length - 1; i >= 0; i--) {
      const entry = globalLeaderboard[i];
      if (entry.score > currentScore && !beatenRanksRef.current.has(entry.rank)) {
        const target = { rank: entry.rank, score: entry.score, name: entry.displayName };
        setNextTarget(target);
        return target;
      }
    }

    setNextTarget(null);
    return null;
  }, [globalLeaderboard]);

  // Check if we beat someone and show celebration
  const checkLeaderboardBeat = useCallback((newScore: number) => {
    if (!globalLeaderboard || globalLeaderboard.length === 0) return;

    // Check all entries to see if we just beat someone
    for (let i = globalLeaderboard.length - 1; i >= 0; i--) {
      const entry = globalLeaderboard[i];
      // We beat them if: our new score >= their score AND we haven't already celebrated this
      if (newScore >= entry.score && !beatenRanksRef.current.has(entry.rank)) {
        beatenRanksRef.current.add(entry.rank);

        // Show celebration message
        const message = `You took ${entry.displayName}'s #${entry.rank} spot!`;
        setTookSpotMessage(message);
        showEpicCallout(`🎯 #${entry.rank} BEATEN!`);

        // Clear message after 3 seconds
        setTimeout(() => setTookSpotMessage(null), 3000);

        // Find the next target
        findNextTarget(newScore);
        break; // Only celebrate one at a time
      }
    }

    // Also update target if we don't have one yet
    if (!nextTarget) {
      findNextTarget(newScore);
    }
  }, [globalLeaderboard, nextTarget, findNextTarget, showEpicCallout]);

  // Handle score point
  // pointsEarned and actionWord are passed from updatePipes for context
  const onScorePoint = useCallback((newScore: number, pipeGapY?: number, pointsEarned?: number, actionWord?: string) => {
    setScore(newScore);

    // Check leaderboard progress
    checkLeaderboardBeat(newScore);

    // In ultra performance mode, skip ALL effects including sound
    if (ULTRA_PERFORMANCE_MODE) {
      return;
    }

    // In light effects mode, still show floating score + sound
    if (LIGHT_EFFECTS_MODE) {
      if (soundEnabled) playPassNote(newScore);
      // Note: floating score is shown in updatePipes, not here
      return;
    }

    // Note: floating score is now shown in updatePipes to include action words
    // No need to show it here anymore

    // Juice: Musical pass note (rising scale)
    playPassNote(newScore);

    // Juice: Pass particles at gap location
    if (pipeGapY !== undefined) {
      spawnPassParticles(BIRD_X + 50, pipeGapY);
    }

    // Juice: Screen brightness pulse
    triggerPassPulse();

    // Sound and haptic for every point
    if (soundEnabled) playBlockLand();
    hapticScore();

    // Frequent small celebrations every 3 pipes
    if (newScore % 3 === 0 && newScore > 0 && newScore % 5 !== 0) {
      triggerBigMoment({
        shockwave: true,
        score: newScore,
        x: 50,
        y: 50,
      });
    }

    // Milestone effects every 5 pipes
    if (newScore % 5 === 0 && newScore > 0) {
      const callouts = ['NICE!', 'SWEET!', 'AWESOME!', 'SMOOTH!', 'FLYING HIGH!'];
      showEpicCallout(callouts[Math.floor(Math.random() * callouts.length)]);
      if (soundEnabled) playCombo(1);
      hapticCombo(1);
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        score: newScore,
        emoji: '🍊',
        x: 50,
        y: 50,
      });
    }

    // Bigger celebration every 10 pipes
    if (newScore % 10 === 0 && newScore > 0) {
      const callouts = ['SKY HIGH!', 'ON FIRE!', 'UNSTOPPABLE!', 'SOARING!'];
      showEpicCallout(callouts[Math.floor(Math.random() * callouts.length)]);
      if (soundEnabled) playPerfectBonus();
      hapticCombo(2);
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        score: newScore,
        emoji: '🔥',
        x: 50,
        y: 50,
      });
    }

    // Environment change celebration at 10 (sunset)
    if (newScore === 10) {
      showEpicCallout('🌅 SUNSET MODE!');
    }

    // Special milestone at 25
    if (newScore === 25) {
      showEpicCallout('🌙 NIGHT FLIGHT!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        score: newScore,
        emoji: '⭐',
        x: 50,
        y: 50,
      });
    }

    // Epic milestone at 50
    if (newScore === 50) {
      showEpicCallout('⛈️ STORM CHASER!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '⚡',
        x: 50,
        y: 50,
      });
    }

    // Legendary at 75
    if (newScore === 75) {
      showEpicCallout('🏆 LEGENDARY!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '🏆',
        x: 50,
        y: 50,
      });
    }

    // God mode at 100
    if (newScore === 100) {
      showEpicCallout('👑 ORANGE GOD!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '👑',
        x: 50,
        y: 50,
      });
    }
  }, [soundEnabled, playBlockLand, playCombo, playPerfectBonus, hapticScore, hapticCombo, hapticHighScore, showFloatingScore, showEpicCallout, triggerBigMoment, triggerConfetti, BIRD_X, playPassNote, spawnPassParticles, triggerPassPulse, checkLeaderboardBeat]);

  // Handle game over
  const handleGameOver = useCallback(async () => {
    const state = gameStateRef.current;

    // IMMEDIATELY stop background music AND play death sound together
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
    playGameOver(); // Play game over sound immediately

    // In ultra mode, skip all death effects
    if (ULTRA_PERFORMANCE_MODE) {
      state.gameState = 'gameover';
      setGameState('gameover');
      // Death sound already played above
      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
      if (state.score > highScore) {
        setHighScore(state.score);
        localStorage.setItem('flappyOrangeHighScore', String(state.score));
        setIsNewPersonalBest(true);
      }
      if (isSignedIn && state.score > 0) {
        setScoreSubmitted(true);
        submitScore(state.score, null, { playTime: Date.now() - gameStartTimeRef.current });
      }
      return;
    }

    // Trigger dramatic death sequence
    triggerDeathFreeze();

    // Delay the actual game over state change to allow death animation
    setTimeout(() => {
      state.gameState = 'gameover';
      setGameState('gameover');

      // Death sound already played immediately above
      hapticGameOver();

      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);

      // Check high score
      if (state.score > highScore) {
        setHighScore(state.score);
        localStorage.setItem('flappyOrangeHighScore', String(state.score));
        setIsNewPersonalBest(true);
      }

      // Submit score
      if (isSignedIn && state.score > 0) {
        setScoreSubmitted(true);
        submitScore(state.score, null, {
          playTime: Date.now() - gameStartTimeRef.current,
        });
      }
    }, JUICE_CONFIG.FREEZE_DURATION + JUICE_CONFIG.SLOW_MO_DURATION + 200);
  }, [soundEnabled, playGameOver, hapticGameOver, highScore, isSignedIn, submitScore, triggerDeathFreeze]);

  // Check collision
  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Ground collision - game over
    if (bird.y + BIRD_RADIUS > CANVAS_HEIGHT - 20) return true;

    // Pipe collision
    for (const pipe of pipes) {
      if (pipe.x > BIRD_X + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
        continue;
      }

      // Use the pipe's own gapSize (set at creation time)
      const gapSize = pipe.gapSize;
      const topPipeBottom = pipe.gapY - gapSize / 2;
      const bottomPipeTop = pipe.gapY + gapSize / 2;

      if (BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
        if (bird.y - BIRD_RADIUS < topPipeBottom || bird.y + BIRD_RADIUS > bottomPipeTop) {
          return true;
        }
      }
    }

    return false;
  }, [CANVAS_HEIGHT, BIRD_X]);

  // Update bird physics
  const updateBird = useCallback((bird: Bird, timeScale: number = 1, isDying: boolean = false): Bird => {
    const dt = timeScale;

    let newVelocity = bird.velocity + PHYSICS.GRAVITY * dt;

    // Cap falling speed
    if (newVelocity > PHYSICS.MAX_FALL_SPEED) {
      newVelocity = PHYSICS.MAX_FALL_SPEED;
    }

    let newY = bird.y + newVelocity * dt;

    // X movement for death knockback
    let newVelocityX = bird.velocityX;
    let newX = bird.velocityX * dt; // X offset applied in draw

    // Ceiling clamp - bird bounces off ceiling instead of dying (only if not dying)
    if (!isDying && newY - BIRD_RADIUS < 10) {
      newY = BIRD_RADIUS + 10;
      newVelocity = 0; // Stop upward momentum
    }

    // Rotation
    let newRotation: number;
    let newRotationVelocity = bird.rotationVelocity;

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
  }, []);

  // Update pipes
  const updatePipes = useCallback((pipes: Pipe[], currentScore: number, deltaTime: number = 1): { pipes: Pipe[]; newScore: number } => {
    let newScore = currentScore;
    // Get speed multiplier from difficulty tier
    const speedMultiplier = getSpeedMultiplier(currentScore);
    const baseSpeed = 2.5 * speedMultiplier;
    const speed = baseSpeed * deltaTime;

    pipes.forEach(pipe => {
      pipe.x -= speed;
      
      // Oscillate moving pipes
      if (pipe.isMoving) {
        pipe.movePhase += pipe.moveSpeed * 0.05 * deltaTime;
        pipe.gapY = pipe.baseGapY + Math.sin(pipe.movePhase) * pipe.moveRange;
        
        // Clamp to valid range
        const gapSize = getCurrentGapSize(currentScore);
        const minY = gapSize / 2 + 80;
        const maxY = CANVAS_HEIGHT - gapSize / 2 - 80;
        pipe.gapY = Math.max(minY, Math.min(maxY, pipe.gapY));
      }
    });

    // Update coins (move with same speed as pipes)
    coinsRef.current.forEach(coin => {
      coin.x -= speed;
      coin.rotation += 0.08 * deltaTime;
    });
    coinsRef.current = coinsRef.current.filter(coin => coin.x > -30);

    // Check coin collision with bird
    const birdY = gameStateRef.current.bird.y;
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        const dx = coin.x - BIRD_X;
        const dy = coin.y - birdY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = BIRD_RADIUS + 12;

        if (distance < collisionRadius) {
          coin.collected = true;
          newScore += 1;
          playCoinSound();
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            showFloatingScore('+1', rect.left + coin.x, rect.top + coin.y - 20);
          }
        }
      }
    });

    const filteredPipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    if (filteredPipes.length === 0 || filteredPipes[filteredPipes.length - 1].x < CANVAS_WIDTH - PIPE_SPACING) {
      filteredPipes.push(generatePipe(filteredPipes.length === 0, currentScore));
    }

    filteredPipes.forEach(pipe => {
      if (!pipe.passed && pipe.x < BIRD_X) {
        pipe.passed = true;

        if (ULTRA_PERFORMANCE_MODE) {
          newScore += 1;
          onScorePoint(newScore);
          return;
        }

        const birdY = gameStateRef.current.bird.y;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          showFloatingScore('+1', rect.left + BIRD_X + 40, rect.top + birdY - 20);
        }

        newScore += 1;
        onScorePoint(newScore, pipe.gapY, 1, '');
      }
    });

    return { pipes: filteredPipes, newScore };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, BIRD_X, generatePipe, onScorePoint, showFloatingScore, playCoinSound, getSpeedMultiplier, getCurrentGapSize]);

  // Draw background
  // Draw a single cloud - optimized for mobile (no gradients)
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, cloud: Cloud, color: string) => {
    ctx.save();
    ctx.globalAlpha = cloud.opacity * 0.7;
    ctx.fillStyle = color;

    // Draw cloud as simple overlapping ellipses (no gradients for performance)
    const cx = cloud.x + cloud.width * 0.4;
    const cy = cloud.y;

    // Main body - single ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, cloud.width * 0.5, cloud.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top puff
    ctx.beginPath();
    ctx.ellipse(cx - cloud.width * 0.15, cy - cloud.height * 0.2, cloud.width * 0.3, cloud.height * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  // Draw trees layer - simplified for performance (single circle per tree)
  const drawTrees = useCallback((ctx: CanvasRenderingContext2D, trees: Tree[], foliageColor: string, trunkColor: string, offset: number, isFar: boolean, orangeColor: string = '#FF8C00') => {
    ctx.save();

    trees.forEach(tree => {
      const x = ((tree.x + offset) % (CANVAS_WIDTH * 1.5)) - CANVAS_WIDTH * 0.25;
      const groundY = CANVAS_HEIGHT - 20;
      const trunkHeight = tree.height * 0.3;
      const trunkWidth = tree.width * 0.15;
      const canopyRadius = tree.width * 0.5;
      const canopyX = x + (tree.canopyOffset || 0) * canopyRadius;
      const canopyY = groundY - trunkHeight - canopyRadius * 0.8;

      // Draw trunk
      ctx.fillStyle = trunkColor;
      ctx.fillRect(x - trunkWidth / 2, groundY - trunkHeight, trunkWidth, trunkHeight);

      // Simplified foliage - single circle (was 3-4 circles per tree)
      ctx.fillStyle = foliageColor;
      ctx.beginPath();
      ctx.arc(canopyX, canopyY, canopyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw oranges on near trees only (max 3 oranges)
      if (tree.hasOranges && !isFar && tree.orangeOffsets) {
        ctx.fillStyle = orangeColor;
        const orangeSize = canopyRadius * 0.15;
        const maxOranges = Math.min(3, tree.orangeOffsets.length);
        for (let i = 0; i < maxOranges; i++) {
          const pos = tree.orangeOffsets[i];
          ctx.beginPath();
          ctx.arc(canopyX + pos.dx * canopyRadius, canopyY + pos.dy * canopyRadius, orangeSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw grass tufts
  const drawGrassTufts = useCallback((ctx: CanvasRenderingContext2D, tufts: Array<{ x: number; height: number }>, color: string, offset: number) => {
    ctx.save();
    ctx.fillStyle = color;

    tufts.forEach(tuft => {
      const x = ((tuft.x + offset) % (CANVAS_WIDTH * 1.5)) - 20;
      const baseY = CANVAS_HEIGHT - 20;

      // Draw a simple grass blade
      ctx.beginPath();
      ctx.moveTo(x - 2, baseY);
      ctx.quadraticCurveTo(x, baseY - tuft.height, x + 2, baseY);
      ctx.fill();
    });

    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw coin - shiny gold coin with rotation effect and pulsing glow
  const drawCoin = useCallback((ctx: CanvasRenderingContext2D, coin: Coin) => {
    if (coin.collected) return;

    ctx.save();
    ctx.translate(coin.x, coin.y);

    // Simulate 3D rotation by varying width
    const rotationScale = Math.abs(Math.cos(coin.rotation));
    const coinRadius = 12;

    // Pulsing glow effect (skip in performance modes)
    if (!PERFORMANCE_MODE && !ULTRA_PERFORMANCE_MODE) {
      const pulsePhase = Math.sin(Date.now() / 300) * 0.5 + 0.5; // 0-1 pulsing
      const glowRadius = coinRadius * (1.8 + pulsePhase * 0.6);
      const glowAlpha = 0.3 + pulsePhase * 0.2;

      // Outer glow - radial gradient
      const glow = ctx.createRadialGradient(0, 0, coinRadius * 0.8, 0, 0, glowRadius);
      glow.addColorStop(0, `rgba(255, 215, 0, ${glowAlpha})`);
      glow.addColorStop(0.5, `rgba(255, 180, 0, ${glowAlpha * 0.5})`);
      glow.addColorStop(1, 'rgba(255, 150, 0, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer gold ring
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, coinRadius * rotationScale, coinRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner darker gold
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(0, 0, coinRadius * 0.7 * rotationScale, coinRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shine highlight
    if (rotationScale > 0.3) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-coinRadius * 0.3 * rotationScale, -coinRadius * 0.3, coinRadius * 0.2 * rotationScale, coinRadius * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  // Draw fireflies for night mode (simplified for performance)
  const drawFireflies = useCallback((ctx: CanvasRenderingContext2D, _frameCount: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';

    firefliesRef.current.forEach(firefly => {
      // Simple static fireflies - no per-frame Math.sin
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, []);

  // Draw sun and moon with smooth crossfade transition
  const drawCelestialBody = useCallback((ctx: CanvasRenderingContext2D, cycleInfo: { isDay: boolean; phaseTime: number }) => {
    const { isDay, phaseTime } = cycleInfo;
    const baseRadius = 28;

    // Calculate opacity for smooth crossfade at day/night boundaries
    let sunAlpha = 0;
    let moonAlpha = 0;

    if (isDay) {
      // Day: Sun fully visible, fading out only at very end for moon transition
      if (phaseTime < 0.85) {
        sunAlpha = 1;
      } else {
        // Last 15% - sun fades out while setting
        sunAlpha = 1 - (phaseTime - 0.85) / 0.15;
      }
      // Moon appears at horizon at very end of day
      if (phaseTime > 0.92) {
        moonAlpha = (phaseTime - 0.92) / 0.08;
      }
    } else {
      // Night: Moon visible
      if (phaseTime < 0.08) {
        // Moon finishes fading in at start of night
        moonAlpha = 0.5 + phaseTime / 0.08 * 0.5;
      } else if (phaseTime < 0.85) {
        moonAlpha = 1;
      } else {
        // Moon fades out at end of night
        moonAlpha = 1 - (phaseTime - 0.85) / 0.15;
      }
      // Sun appears at horizon at very end of night (pre-dawn)
      if (phaseTime > 0.92) {
        sunAlpha = (phaseTime - 0.92) / 0.08;
      }
    }

    ctx.save();

    // Draw SUN if visible
    if (sunAlpha > 0) {
      // During day: sun follows phaseTime (0→1 across sky)
      // During night end (pre-dawn): sun stays at horizon (position 0) while fading in
      const sunPhase = isDay ? phaseTime : 0;
      const sunPos = getCelestialPosition(sunPhase);
      const horizonFactor = 1 - Math.sin(sunPhase * Math.PI);
      const sizeMultiplier = 1 + horizonFactor * 0.4;
      const sunRadius = baseRadius * sizeMultiplier;

      // Sun colors - smooth interpolation between phases
      const effectivePhase = isDay ? phaseTime : 0;

      // Define color stops for sun throughout the day
      // Dawn (0): orange-red → Morning (0.25): golden → Noon (0.5): bright yellow → Afternoon (0.75): golden → Sunset (1): orange-red
      const sunColorStops = [
        { phase: 0, color: '#FF6633', glow: '#FF4400' },      // Dawn - deep orange
        { phase: 0.15, color: '#FF9966', glow: '#FF6633' },   // Early morning - orange
        { phase: 0.3, color: '#FFD700', glow: '#FFAA00' },    // Morning - golden
        { phase: 0.5, color: '#FFEE44', glow: '#FFFFAA' },    // Noon - bright yellow
        { phase: 0.7, color: '#FFD700', glow: '#FFAA00' },    // Afternoon - golden
        { phase: 0.85, color: '#FF9966', glow: '#FF6633' },   // Evening - orange
        { phase: 1.0, color: '#FF6633', glow: '#FF4400' },    // Sunset - deep orange
      ];

      // Find the two stops to interpolate between
      let fromStop = sunColorStops[0];
      let toStop = sunColorStops[1];
      for (let i = 0; i < sunColorStops.length - 1; i++) {
        if (effectivePhase >= sunColorStops[i].phase && effectivePhase <= sunColorStops[i + 1].phase) {
          fromStop = sunColorStops[i];
          toStop = sunColorStops[i + 1];
          break;
        }
      }

      // Calculate interpolation factor
      const range = toStop.phase - fromStop.phase;
      const t = range > 0 ? (effectivePhase - fromStop.phase) / range : 0;

      // Smooth interpolation
      const sunColor = lerpColor(fromStop.color, toStop.color, t);
      const glowColor = lerpColor(fromStop.glow, toStop.glow, t);

      ctx.globalAlpha = sunAlpha;
      ctx.fillStyle = sunColor;
      // Skip expensive shadowBlur - just draw the sun
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, sunRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw MOON if visible
    if (moonAlpha > 0) {
      // During night: moon follows phaseTime (0→1 across sky)
      // During day end: moon stays at horizon (position 0) while fading in
      const moonPhase = isDay ? 0 : phaseTime;
      const moonPos = getCelestialPosition(moonPhase);
      const horizonFactor = 1 - Math.sin(moonPhase * Math.PI);
      const sizeMultiplier = 1 + horizonFactor * 0.4;
      const moonRadius = baseRadius * 0.85 * sizeMultiplier;

      // Simple moon color (skip per-frame RGB calculation)
      ctx.globalAlpha = moonAlpha;
      ctx.fillStyle = '#FFFACD';  // Simple pale moon color
      // Skip expensive shadowBlur
      ctx.beginPath();
      ctx.arc(moonPos.x, moonPos.y, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters (simplified - skip when low alpha)
      if (moonAlpha > 0.7) {
        ctx.fillStyle = 'rgba(200, 200, 180, 0.2)';
        ctx.beginPath();
        ctx.arc(moonPos.x - moonRadius * 0.2, moonPos.y - moonRadius * 0.2, moonRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }, [getCelestialPosition]);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, currentScore: number, frameCount: number) => {
    // Get cached cycle info and colors (only recalculated every 100ms for performance)
    const { cycleInfo, colors } = getCachedColors();

    // Sky - gradient for better visuals with interpolated colors
    if (!PERFORMANCE_MODE) {
      // Use cached gradient - only recreate when colors change (not every frame!)
      const colorKey = `${colors.skyTop}-${colors.skyBottom}`;
      if (colorKey !== gradientCacheRef.current.lastColorKey || !gradientCacheRef.current.skyGradient) {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.7);
        gradient.addColorStop(0, colors.skyTop);
        gradient.addColorStop(1, colors.skyBottom);
        gradientCacheRef.current.skyGradient = gradient;
        gradientCacheRef.current.lastColorKey = colorKey;
      }
      ctx.fillStyle = gradientCacheRef.current.skyGradient!;
    } else {
      ctx.fillStyle = colors.skyBottom;
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (!PERFORMANCE_MODE) {
      const scrollOffset = scrollOffsetRef.current;
      const state = gameStateRef.current;

      // Draw stars FIRST (very back of background, behind everything)
      // Stars fade slowly during day/night transitions
      let starVisibility = 0;  // 0 = no stars, 1 = all stars visible

      if (cycleInfo.isDay) {
        // During day: stars fade out slowly at dawn, fade in slowly at dusk
        if (cycleInfo.phaseTime < 0.25) {
          // First ~7.5s of day - stars slowly fading out (100% → 0%)
          // Use easeOutQuad for gradual fade that slows down
          const t = cycleInfo.phaseTime / 0.25;
          const easedT = 1 - (1 - t) * (1 - t);  // Ease out - starts fast, slows down
          starVisibility = 1 - easedT;
        } else if (cycleInfo.phaseTime > 0.80) {
          // Last ~6s of day - stars slowly starting to appear for night
          const t = (cycleInfo.phaseTime - 0.80) / 0.20;
          const easedT = t * t;  // Ease in - starts slow
          starVisibility = easedT * 0.5;  // Fade up to 50% by end of day
        }
      } else {
        // Night: stars fade in over first 20%, stay visible, fade out over last 20%
        if (cycleInfo.phaseTime < 0.20) {
          // First ~6s of night - stars fading in (50% → 100%)
          const t = cycleInfo.phaseTime / 0.20;
          const easedT = t * t;  // Ease in
          starVisibility = 0.5 + easedT * 0.5;
        } else if (cycleInfo.phaseTime > 0.80) {
          // Last ~6s of night - stars fading out (100% → 100% for smooth handoff to day)
          starVisibility = 1;  // Stay at full visibility, day phase handles the fade
        } else {
          // Deep night - all stars visible
          starVisibility = 1;
        }
      }

      if (starVisibility > 0 && state.stars.length > 0) {
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        state.stars.forEach((star) => {
          // Use pre-calculated alpha (no per-frame Math.sin)
          const alpha = starVisibility * star.alpha;
          if (alpha > 0.05) {
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Draw sun/moon with smooth arc movement
      drawCelestialBody(ctx, cycleInfo);

      // Far trees (orange grove) with interpolated colors
      if (treesFarRef.current.length > 0) {
        drawTrees(ctx, treesFarRef.current, colors.treeFoliageFar, colors.treeTrunk, scrollOffset * 0.2, true, colors.orangeFruit);
      }

      // Near trees (orange grove) with interpolated colors
      if (treesRef.current.length > 0) {
        drawTrees(ctx, treesRef.current, colors.treeFoliage, colors.treeTrunk, scrollOffset * 0.4, false, colors.orangeFruit);
      }

      // Clouds - opacity varies with time of day, smooth 3s transitions (10% of phase)
      let cloudOpacityMultiplier = 1;
      if (cycleInfo.isDay) {
        // Day: clouds fade in at dawn, fade out at dusk
        if (cycleInfo.phaseTime < 0.1) {
          // First 3s - clouds fading in from night level (50% → 100%)
          cloudOpacityMultiplier = 0.5 + (cycleInfo.phaseTime / 0.1) * 0.5;
        } else if (cycleInfo.phaseTime > 0.9) {
          // Last 3s - clouds fading out for night (100% → 50%)
          cloudOpacityMultiplier = 0.5 + ((1 - cycleInfo.phaseTime) / 0.1) * 0.5;
        }
      } else {
        // Night: clouds dimmer, smooth transitions
        if (cycleInfo.phaseTime < 0.1) {
          // First 3s - clouds continuing to dim (50% → 30%)
          cloudOpacityMultiplier = 0.5 - (cycleInfo.phaseTime / 0.1) * 0.2;
        } else if (cycleInfo.phaseTime > 0.9) {
          // Last 3s - clouds brightening for dawn (30% → 50%)
          cloudOpacityMultiplier = 0.3 + ((cycleInfo.phaseTime - 0.9) / 0.1) * 0.2;
        } else {
          cloudOpacityMultiplier = 0.3;  // Deep night: 30% opacity
        }
      }

      cloudsRef.current.forEach(cloud => {
        const adjustedX = ((cloud.x - scrollOffset * cloud.speed) % (CANVAS_WIDTH * 1.5)) + CANVAS_WIDTH * 0.25;
        const adjustedCloud = {
          ...cloud,
          x: adjustedX < -cloud.width ? adjustedX + CANVAS_WIDTH * 1.5 : adjustedX,
          opacity: cloud.opacity * cloudOpacityMultiplier
        };
        drawCloud(ctx, adjustedCloud, colors.clouds);
      });
    }

    // Ground with interpolated colors
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Ground grass strip
    ctx.fillStyle = colors.grass;
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 5);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, getCachedColors, drawCloud, drawTrees, drawCelestialBody]);

  // Draw bird - performance mode uses minimal drawing
  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird, xOffset: number = 0) => {
    ctx.save();

    ctx.translate(BIRD_X + xOffset, bird.y);
    // Base rotation offset (-45 degrees) + game rotation
    const baseRotation = -0.78; // ~45 degrees counter-clockwise
    ctx.rotate(bird.rotation + baseRotation);
    ctx.scale(bird.scaleX * -1, bird.scaleY); // Mirror horizontally so leaf points left

    // Draw orange emoji
    const emojiSize = BIRD_RADIUS * 2.5; // Size to match hitbox
    ctx.font = `${emojiSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍊', 0, 0);

    ctx.restore();
  }, [BIRD_X]);

  // Draw pipes - ultra minimal in performance mode
  const drawPipes = useCallback((ctx: CanvasRenderingContext2D, pipes: Pipe[]) => {
    pipes.forEach(pipe => {
      // Use the pipe's own gapSize (set at creation time)
      const gapSize = pipe.gapSize;
      const topPipeBottom = pipe.gapY - gapSize / 2;
      const bottomPipeTop = pipe.gapY + gapSize / 2;

      // Use slightly different color for moving pipes
      ctx.fillStyle = pipe.isMoving ? '#1E8B1E' : '#228B22';

      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBottom);

      // Bottom pipe
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeTop - 20);

      // Caps only if not in performance mode
      if (!PERFORMANCE_MODE) {
        ctx.fillStyle = pipe.isMoving ? '#145A14' : '#1B5E20';
        ctx.fillRect(pipe.x - 5, topPipeBottom - 25, PIPE_WIDTH + 10, 25);
        ctx.fillRect(pipe.x - 5, bottomPipeTop, PIPE_WIDTH + 10, 25);
        ctx.fillStyle = '#228B22';
      }
    });
  }, [CANVAS_HEIGHT]);
  // Draw score on canvas
  const drawScore = useCallback((ctx: CanvasRenderingContext2D, currentScore: number) => {
    ctx.save();
    // Main score
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(String(currentScore), CANVAS_WIDTH / 2, 60);
    ctx.fillText(String(currentScore), CANVAS_WIDTH / 2, 60);

    ctx.restore();
  }, [CANVAS_WIDTH]);

  // Draw leaderboard countdown (top right corner)
  const drawLeaderboardCountdown = useCallback((ctx: CanvasRenderingContext2D, currentScore: number) => {
    if (!nextTarget) return;

    const pipesNeeded = nextTarget.score - currentScore;

    // Only show when within 10 pipes of beating someone
    if (pipesNeeded > 10 || pipesNeeded <= 0) return;

    ctx.save();
    ctx.textAlign = 'right';

    // Background pill
    const text = pipesNeeded === 1 ? `1 more to beat #${nextTarget.rank}` : `${pipesNeeded} more to beat #${nextTarget.rank}`;
    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(text).width;

    const pillX = CANVAS_WIDTH - 10;
    const pillY = 20;
    const pillPadding = 8;
    const pillHeight = 24;

    // Draw pill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(pillX - textWidth - pillPadding * 2, pillY - pillHeight / 2, textWidth + pillPadding * 2, pillHeight, 12);
    ctx.fill();

    // Draw text
    ctx.fillStyle = pipesNeeded <= 3 ? '#FFD700' : '#FFFFFF'; // Gold when close!
    ctx.fillText(text, pillX - pillPadding, pillY + 5);

    ctx.restore();
  }, [CANVAS_WIDTH, nextTarget]);

  // Draw "took spot" celebration message
  const drawTookSpotMessage = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!tookSpotMessage) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px Arial';

    const text = tookSpotMessage;
    const textWidth = ctx.measureText(text).width;

    const x = CANVAS_WIDTH / 2;
    const y = 100;
    const padding = 12;
    const height = 30;

    // Draw background
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2 - padding, y - height / 2, textWidth + padding * 2, height, 15);
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#000';
    ctx.fillText(text, x, y + 6);

    ctx.restore();
  }, [CANVAS_WIDTH, tookSpotMessage]);

  // Draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // Draw impact flash overlay
  const drawImpactFlash = useCallback((ctx: CanvasRenderingContext2D, alpha: number) => {
    if (alpha <= 0) return;
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw near-miss flash overlay - optimized (simple overlay, no gradient)
  const drawNearMissFlash = useCallback((ctx: CanvasRenderingContext2D, alpha: number) => {
    if (alpha <= 0) return;
    ctx.save();
    // Simple yellow flash (no gradient for performance)
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.3})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Apply screen shake transform
  const applyScreenShake = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!shakeRef.current) return;

    const elapsed = Date.now() - shakeRef.current.startTime;
    if (elapsed > shakeRef.current.duration) {
      shakeRef.current = null;
      return;
    }

    const progress = elapsed / shakeRef.current.duration;
    const decay = 1 - progress;
    const intensity = shakeRef.current.intensity * decay;

    const offsetX = (Math.random() - 0.5) * intensity * 2;
    const offsetY = (Math.random() - 0.5) * intensity * 2;

    ctx.translate(offsetX, offsetY);
  }, []);

  // Draw idle screen
  const drawIdleScreen = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF6B00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('Flappy Orange', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.fillText('Flappy Orange', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    // Tap instruction
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText('Tap to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText('Tap to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    // Animated tap indicator
    const bounce = Math.sin(Date.now() * 0.005) * 10;
    ctx.font = '30px Arial';
    ctx.fillText('👆', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70 + bounce);

    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Jump function - ultra optimized for performance mode
  const jump = useCallback(() => {
    const state = gameStateRef.current;

    if (state.gameState === 'gameover' || state.isDying) return;

    // ULTRA mode: absolute minimum work
    if (ULTRA_PERFORMANCE_MODE) {
      if (state.gameState === 'idle') {
        state.gameState = 'playing';
        state.stars = generateStars();  // Generate stars for night sky
        gameStartTimeRef.current = Date.now();
        setGameState('playing');
      }
      if (state.gameState === 'playing') {
        state.bird.velocity = PHYSICS.JUMP_VELOCITY;
        state.bird.rotation = -0.4;
      }
      return;
    }

    // LIGHT mode: deformation + score sound only (no wing particles for performance)
    if (LIGHT_EFFECTS_MODE) {
      if (state.gameState === 'idle') {
        state.gameState = 'playing';
        state.stars = generateStars();  // Generate stars for night sky
        gameStartTimeRef.current = Date.now();
        setGameState('playing');
      }
      if (state.gameState === 'playing') {
        state.bird.velocity = PHYSICS.JUMP_VELOCITY;
        state.bird.rotation = -0.4;
        applyFlapDeformation();
      }
      return;
    }

    // Normal mode with all effects
    if (state.gameState === 'idle') {
      state.gameState = 'playing';
      state.stars = generateStars();
      gameStartTimeRef.current = Date.now();
      setGameState('playing');
      if (soundEnabled) playGameStart();
    }

    if (state.gameState === 'playing') {
      state.bird.velocity = PHYSICS.JUMP_VELOCITY;
      state.bird.rotation = -0.4;

      // Juice: Squash/stretch on flap
      applyFlapDeformation();

      // Juice: Wing particles
      spawnWingParticles(BIRD_X, state.bird.y);

      // Juice: Varied pitch haptic
      triggerHaptic(8);

      if (soundEnabled) playBlockLand();
      hapticButton();
    }
  }, [soundEnabled, playGameStart, playBlockLand, hapticButton, generateStars, applyFlapDeformation, spawnWingParticles, triggerHaptic, BIRD_X]);

  // Reset game
  const resetGame = useCallback(() => {
    gameStateRef.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0, scaleX: 1, scaleY: 1, velocityX: 0, rotationVelocity: 0 },
      pipes: [],
      score: 0,
      gameState: 'idle',
      frameCount: 0,
      stars: [],
      isFrozen: false,
      timeScale: 1,
      isDying: false,
    };

    // Clear juice state
    deathParticlesRef.current = [];
    wingParticlesRef.current = [];
    passParticlesRef.current = [];
    shakeRef.current = null;
    birdXOffsetRef.current = 0;
    setImpactFlashAlpha(0);
    setScreenBrightness(1);
    setNearMissFlashAlpha(0);

    // Reset parallax
    scrollOffsetRef.current = 0;
    cloudsRef.current = generateClouds();
    treesRef.current = generateTrees(false);
    treesFarRef.current = generateTrees(true);
    grassTuftsRef.current = generateGrassTufts();
    touchRipplesRef.current = [];
    rainDropsRef.current = [];
    lightningRef.current = null;
    setLightningAlpha(0);

    // Reset coins (but keep total collected)
    coinsRef.current = [];

    // Clear timeouts
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);

    // Music will resume from current position via useEffect when gameState changes to 'playing'

    setScore(0);
    setGameState('idle');
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    setFloatingScores([]);
    setShowShareModal(false);
    setShareImageUrl(null);
    setChallengeBeaten(false);
    resetAllEffects();

    // Reset leaderboard tracking
    beatenRanksRef.current = new Set();
    setNextTarget(null);
    setTookSpotMessage(null);
    findNextTarget(0); // Initialize with current score 0
  }, [CANVAS_HEIGHT, resetAllEffects, generateClouds, generateTrees, generateGrassTufts, findNextTarget]);

  // Refs for touch handler to avoid recreating listeners
  const jumpRef = useRef<() => void>(() => {});
  const resetGameRef = useRef<() => void>(() => {});

  // Keep refs in sync
  useEffect(() => { jumpRef.current = jump; }, [jump]);
  useEffect(() => { resetGameRef.current = resetGame; }, [resetGame]);

  // Handle tap/click - simplified (for desktop, touch handler handles mobile)
  const handleTap = useCallback((e: React.MouseEvent) => {
    if (gameStateRef.current.gameState === 'gameover') {
      resetGameRef.current();
      return;
    }
    // Start music if transitioning from idle (needs user gesture for audio)
    if (gameStateRef.current.gameState === 'idle' && soundEnabledRef.current && !musicAudioRef.current) {
      playNextSongRef.current();
    }
    jumpRef.current();
  }, []);

  // Native touch handler - only set up once, uses refs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = () => {
      const state = gameStateRef.current;

      // Game over - reset
      if (state.gameState === 'gameover') {
        resetGameRef.current();
        return;
      }

      // Jump - works for both idle and playing
      state.bird.velocity = PHYSICS.JUMP_VELOCITY;
      state.bird.rotation = -0.4;

      // Start game if idle
      if (state.gameState === 'idle') {
        state.gameState = 'playing';
        state.stars = generateStarsRef.current();  // Generate stars for night sky
        gameStartTimeRef.current = Date.now();
        setGameState('playing');

        // Start music immediately from user gesture (required for mobile browsers)
        if (soundEnabledRef.current && !musicAudioRef.current) {
          playNextSongRef.current();
        }
      }
    };

    // passive: true for best performance - CSS touch-action: none handles scroll prevention
    canvas.addEventListener('touchstart', handleTouch, { passive: true });
    return () => canvas.removeEventListener('touchstart', handleTouch);
  }, []); // Empty deps - only runs once!

  // Track bird X offset for death knockback
  const birdXOffsetRef = useRef(0);

  // FPS tracking for debugging
  const fpsRef = useRef({
    frames: 0,
    lastTime: performance.now(),
    fps: 0,
    rafCalls: 0,
    lastRafTime: 0,
    frameTimeMs: 0,      // Current frame time in ms
    avgFrameTime: 0,     // Rolling average frame time
    minFps: 999,         // Minimum FPS seen
    maxFrameTime: 0,     // Maximum frame time seen (worst lag)
  });

  // Game loop
  useEffect(() => {
    if (BARE_BONES_MODE) {
      console.log('Game loop useEffect running!', { CANVAS_WIDTH, CANVAS_HEIGHT, BIRD_X });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Safari iOS optimization: disable alpha and enable desynchronized for smoother animation
    const ctx = canvas.getContext('2d', {
      alpha: false,           // No transparency needed - faster
      desynchronized: true,   // Bypass compositor for lower latency
    });
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      // Track actual RAF interval
      const rafInterval = currentTime - fpsRef.current.lastRafTime;
      fpsRef.current.lastRafTime = currentTime;
      fpsRef.current.rafCalls++;

      // Frame time calculation
      const frameTimeMs = currentTime - fpsRef.current.lastRafTime;
      fpsRef.current.frameTimeMs = frameTimeMs;

      // Rolling average (smoothed)
      fpsRef.current.avgFrameTime = fpsRef.current.avgFrameTime * 0.9 + frameTimeMs * 0.1;

      // Track worst frame time
      if (frameTimeMs > fpsRef.current.maxFrameTime && fpsRef.current.frames > 10) {
        fpsRef.current.maxFrameTime = frameTimeMs;
      }

      // FPS calculation
      fpsRef.current.frames++;
      if (currentTime - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.fps = fpsRef.current.frames;
        // Track minimum FPS
        if (fpsRef.current.fps < fpsRef.current.minFps && fpsRef.current.fps > 0) {
          fpsRef.current.minFps = fpsRef.current.fps;
        }
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = currentTime;
      }

      // Normalize to 60fps, cap at 4x to handle devices running as low as 15fps
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 4);
      lastTime = currentTime;

      // Update day/night cycle time (always runs, independent of game state)
      cycleTimeRef.current += deltaTime * 16.67;  // Convert back to ms
      if (cycleTimeRef.current >= CYCLE_DURATION_MS) {
        cycleTimeRef.current = cycleTimeRef.current % CYCLE_DURATION_MS;
      }

      const state = gameStateRef.current;

      // ============================================
      // WEATHER SYSTEM UPDATE (runs in idle AND playing for testing)
      // ============================================
      if (!PERFORMANCE_MODE && !ULTRA_PERFORMANCE_MODE && !state.isFrozen) {
        updateWeather(deltaTime);
        const weather = weatherRef.current;

        // Rain particles - spawn rate based on intensity (gradual build-up/fade)
        if ((weather.current === 'rain' || weather.current === 'storm') && weather.intensity > 0) {
          // Storm has HEAVIER rain than regular rain
          const isStorm = weather.current === 'storm';
          const baseDrops = isStorm ? 5 : 3; // Storm spawns more drops
          const dropsToSpawn = Math.floor(weather.intensity * baseDrops) + (Math.random() < weather.intensity ? 1 : 0);

          for (let i = 0; i < dropsToSpawn && rainDropsRef.current.length < WEATHER_CONFIG.MAX_RAIN_DROPS; i++) {
            rainDropsRef.current.push({
              x: Math.random() * CANVAS_WIDTH,
              y: -10 - Math.random() * 30,
              length: isStorm ? 18 + Math.random() * 12 : 15 + Math.random() * 10,
              speed: isStorm ? 12 + Math.random() * 8 : 10 + Math.random() * 6,
              opacity: 0.5 + Math.random() * 0.4,
              foreground: Math.random() < 0.4, // 30% render in front of pipes
            });
          }

          // Trigger lightning in storms - MORE FREQUENT
          if (isStorm && weather.intensity > 0.3 && Math.random() < 0.008 * deltaTime) {
            triggerLightningBolt();
          }
        }
        // Always update rain if any drops exist (lets them fall naturally when weather ends)
        if (rainDropsRef.current.length > 0) {
          updateRainDrops();
        }
        // Update rain splashes
        if (rainSplashesRef.current.length > 0) {
          updateRainSplashes();
        }

        // Snow particles - spawn rate based on intensity (gradual build-up/fade)
        if (weather.current === 'snow' && weather.intensity > 0) {
          // Spawn rate scales with intensity: few flakes at first, then more
          const snowSpawnRate = 0.15 * weather.intensity * weather.intensity; // Slightly faster
          if (Math.random() < snowSpawnRate * deltaTime) {
            spawnSnowflakes(Math.ceil(3 * weather.intensity)); // 1-3 flakes based on intensity
          }
        }
        // Always update snowflakes if any exist (lets them fall naturally when weather ends)
        if (snowflakesRef.current.length > 0) {
          updateSnowflakes(deltaTime);
        }

        // Background birds (spawn periodically)
        const now = Date.now();
        if (now - lastBirdSpawnRef.current > WEATHER_CONFIG.BIRD_SPAWN_INTERVAL) {
          if (Math.random() < 0.3) {
            spawnBirdFlock();
          }
          lastBirdSpawnRef.current = now;
        }
        updateBackgroundBirds(deltaTime);

        // Falling leaves (dawn, golden, sunset phases - more variety)
        const { colors: cycleColors } = getCachedColors();
        const isLeafSeason = cycleColors.currentEnv === 'golden' || cycleColors.currentEnv === 'sunset' || cycleColors.currentEnv === 'dawn';
        if (isLeafSeason && Math.random() < WEATHER_CONFIG.LEAF_SPAWN_RATE * deltaTime) {
          spawnFallingLeaf();
          // Occasionally spawn 2 leaves at once for more natural clustering
          if (Math.random() < 0.3) spawnFallingLeaf();
        }
        updateFallingLeaves(deltaTime);

        // Update lightning bolts
        updateLightningBolts();
      }


      // Update physics (skip if frozen, but not if dying with slow-mo)
      const shouldUpdatePhysics = !state.isFrozen && !showExitDialogRef.current;

      if (shouldUpdatePhysics) {
        // Apply time scale for slow-mo, multiply by deltaTime for frame-rate independence
        const effectiveTimeScale = state.timeScale * deltaTime;

        if (state.gameState === 'playing' || state.isDying) {
          state.bird = updateBird(state.bird, effectiveTimeScale, state.isDying);

          // Update bird X offset for knockback
          if (state.isDying) {
            birdXOffsetRef.current += state.bird.velocityX * effectiveTimeScale;
          }

          if (!state.isDying) {
            const { pipes, newScore } = updatePipes(state.pipes, state.score, deltaTime);
            state.pipes = pipes;
            state.score = newScore;

            if (checkCollision(state.bird, state.pipes)) {
              handleGameOver();
            }
          }
        }
      }

      // Update wing particles in LIGHT mode
      if (LIGHT_EFFECTS_MODE) {
        wingParticlesRef.current = updateParticles(wingParticlesRef.current, deltaTime);
      }

      // Update particles (skip in performance mode except death)
      if (!PERFORMANCE_MODE) {
        deathParticlesRef.current = updateParticles(deathParticlesRef.current, deltaTime);
        if (!LIGHT_EFFECTS_MODE) wingParticlesRef.current = updateParticles(wingParticlesRef.current, deltaTime);
        passParticlesRef.current = updateParticles(passParticlesRef.current, deltaTime);

        // Update scroll offset for parallax
        if (state.gameState === 'playing' && !state.isFrozen) {
          const speed = 1.5 + Math.max(0, Math.floor((state.score - 5) / 20)) * 0.15;
          scrollOffsetRef.current += speed * state.timeScale * deltaTime;
        }

        // Update touch ripples
        touchRipplesRef.current = touchRipplesRef.current.filter(ripple => {
          const elapsed = Date.now() - ripple.startTime;
          if (elapsed > 400) return false;
          ripple.radius += 3 * deltaTime;
          ripple.alpha = 1 - (elapsed / 400);
          return true;
        });

        // Weather effects for storm mode (score >= 50)
        const isStorm = state.score >= 50;
        if (isStorm && state.gameState === 'playing' && !state.isFrozen) {
          if (Math.random() < 0.15 * deltaTime) {
            spawnRainDrops(2);
          }
          updateRainDrops();
          if (Math.random() < 0.0003 * deltaTime) {
            triggerLightning();
          }
        }
      }

      state.frameCount++;

      // === RENDER ===
      ctx.save();

      // BARE BONES MODE - absolute minimum rendering for performance testing
      if (BARE_BONES_MODE) {
        // Clear
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

        // Pipes - just green rectangles
        ctx.fillStyle = '#228B22';
        state.pipes.forEach(pipe => {
          const topH = pipe.gapY - PIPE_GAP / 2;
          const bottomY = pipe.gapY + PIPE_GAP / 2;
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topH);
          ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY - 20);
        });

        // Bird - just an orange circle
        ctx.fillStyle = '#FF6B00';
        ctx.beginPath();
        ctx.arc(BIRD_X, state.bird.y, BIRD_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Score
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String(state.score), CANVAS_WIDTH / 2, 50);

        // FPS
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = fpsRef.current.fps < 30 ? '#FF0000' : fpsRef.current.fps < 50 ? '#FFAA00' : '#00FF00';
        ctx.textAlign = 'left';
        ctx.fillText(`FPS: ${fpsRef.current.fps}`, 10, 20);
        ctx.fillText(`DT: ${deltaTime.toFixed(2)}`, 10, 36);

        // Idle screen
        if (state.gameState === 'idle') {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Tap to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }

        ctx.restore();
        // Don't call requestAnimationFrame here - MessageChannel handles it
        return;
      }

      // Apply screen shake
      applyScreenShake(ctx);

      // Apply screen brightness - skip in performance mode (filters are expensive)
      if (!PERFORMANCE_MODE) {
        const brightness = screenBrightnessRef.current;
        if (brightness !== 1) {
          ctx.filter = `brightness(${brightness})`;
        }
      }

      ctx.clearRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
      drawBackground(ctx, state.score, state.frameCount);

      // Draw fireflies at night BEFORE pipes (so they appear in background)
      // Use cached cycle info for performance
      const { cycleInfo } = getCachedColors();
      if (!cycleInfo.isDay && !PERFORMANCE_MODE) {
        drawFireflies(ctx, state.frameCount);
      }


      // ============================================
      // WEATHER BACKGROUND ELEMENTS (before pipes)
      // ============================================
      if (!PERFORMANCE_MODE && !ULTRA_PERFORMANCE_MODE) {
        const weather = weatherRef.current;

        // Background birds (far in the distance)
        drawBackgroundBirds(ctx);

        // Falling leaves (in the air, behind pipes)
        drawFallingLeaves(ctx);

        // Storm overlay (darker, fades in with intensity)
        if (weather.current === 'storm' && weather.intensity > 0) {
          ctx.save();
          ctx.fillStyle = `rgba(30, 30, 50, ${0.35 * weather.intensity})`;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.restore();
        }

        // Snow BACKGROUND layer (behind pipes)
        if (weather.current === 'snow' || snowflakesRef.current.length > 0) {
          drawSnowflakes(ctx, false); // false = background only
        }

        // Rain BACKGROUND layer (behind pipes)
        if (weather.current === 'rain' || weather.current === 'storm' || rainDropsRef.current.length > 0) {
          drawRain(ctx, false); // false = background only
        }

        // Rain splashes on ground
        if (rainSplashesRef.current.length > 0) {
          drawRainSplashes(ctx);
        }

        // Fog overlay (can combine with any weather - uses fogIntensity)
        if (weather.fogIntensity > 0) {
          drawFog(ctx);
        }

        // Lightning bolts (draw on top of weather)
        if (lightningBoltsRef.current.length > 0) {
          drawLightningBolts(ctx);
        }
      }

      // Draw pipe gap highlight BEFORE pipes (so pipes render on top)
      if (!PERFORMANCE_MODE && state.gameState === 'playing') {
        drawPipeGapHighlight(ctx, state.pipes, BIRD_X);
      }

      drawPipes(ctx, state.pipes);

      // Snow accumulation on ground (scrolls off) and frost on pipes (per-pipe)
      if (!PERFORMANCE_MODE && !ULTRA_PERFORMANCE_MODE) {
        // Draw ground snow if there's any snow edge remaining
        if (snowGroundEdgeRef.current > 0 && snowAccumulationRef.current > 0) {
          drawSnowAccumulation(ctx);
        }
        // Draw frost on pipes - each pipe has its own frost level
        drawPipeFrost(ctx, state.pipes);
      }

      // Draw coins
      coinsRef.current.forEach(coin => {
        drawCoin(ctx, coin);
      });

      // Draw wing particles (LIGHT mode or full mode)
      if (LIGHT_EFFECTS_MODE || !PERFORMANCE_MODE) {
        drawParticles(ctx, wingParticlesRef.current);
      }

      // Draw bird
      drawBird(ctx, state.bird, birdXOffsetRef.current);

      // Draw particles (skip in performance mode)
      if (!PERFORMANCE_MODE) {
        drawParticles(ctx, passParticlesRef.current);
        drawParticles(ctx, deathParticlesRef.current);
      }

      // ============================================
      // WEATHER FOREGROUND ELEMENTS (on top of pipes/bird)
      // ============================================
      if (!PERFORMANCE_MODE && !ULTRA_PERFORMANCE_MODE) {
        const weather = weatherRef.current;

        // Snow FOREGROUND layer (in front of pipes)
        if (weather.current === 'snow' || snowflakesRef.current.length > 0) {
          drawSnowflakes(ctx, true); // true = foreground only
        }

        // Rain FOREGROUND layer (in front of pipes)
        if (weather.current === 'rain' || weather.current === 'storm' || rainDropsRef.current.length > 0) {
          drawRain(ctx, true); // true = foreground only
        }

        // Foreground fog (on top of pipes for immersive effect)
        if (weather.fogIntensity > 0) {
          ctx.save();
          // Lighter foreground fog layer
          ctx.fillStyle = `rgba(220, 220, 230, ${0.25 * weather.fogIntensity})`;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          // Bottom fog wisps in foreground
          const fogGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.6, 0, CANVAS_HEIGHT);
          fogGradient.addColorStop(0, 'rgba(200, 200, 210, 0)');
          fogGradient.addColorStop(1, `rgba(180, 180, 195, ${0.35 * weather.fogIntensity})`);
          ctx.fillStyle = fogGradient;
          ctx.fillRect(0, CANVAS_HEIGHT * 0.6, CANVAS_WIDTH, CANVAS_HEIGHT * 0.4);
          ctx.restore();
        }
      }

      if (state.gameState === 'playing' || state.isDying) {
        drawScore(ctx, state.score);
        drawLeaderboardCountdown(ctx, state.score);
        drawTookSpotMessage(ctx);
      }

      if (state.gameState === 'idle') {
        drawIdleScreen(ctx);
      }

      // Skip all post-processing effects in performance mode
      if (!PERFORMANCE_MODE) {
        drawTouchRipples(ctx);
        // Rain removed - was tied to high score, doesn't fit time-based cycle
        const { colors: cycleColors } = getCachedColors();
        drawVignette(ctx, cycleColors.currentEnv);

        drawNearMissFlash(ctx, nearMissFlashAlphaRef.current);
        drawLightningFlash(ctx, lightningAlphaRef.current);
        drawImpactFlash(ctx, impactFlashAlphaRef.current);
      }

      // Debug overlay - shows performance metrics
      // Compact FPS display in top center
      if (DEBUG_OVERLAY) {
        ctx.save();
        const fps = fpsRef.current.fps;
        const minFps = fpsRef.current.minFps === 999 ? '--' : fpsRef.current.minFps;
        const text = `FPS: ${fps} | Min: ${minFps}`;

        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';

        // Position at top center
        const textX = CANVAS_WIDTH / 2;
        const textY = 20;

        // Draw background pill
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(textX - textWidth / 2 - 10, textY - 12, textWidth + 20, 18, 9);
        ctx.fill();

        // Draw text with color coding
        ctx.fillStyle = fps >= 60 ? '#00FF00' : fps >= 45 ? '#FFFF00' : fps >= 30 ? '#FFA500' : '#FF0000';
        ctx.fillText(text, textX, textY);

        ctx.restore();
      }

      ctx.restore();

      // Only use RAF if not using MessageChannel
      if (!USE_MESSAGE_CHANNEL_LOOP) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    // Use MessageChannel for iOS Safari/WebKit - bypasses RAF throttling
    if (USE_MESSAGE_CHANNEL_LOOP) {
      const messageChannel = new MessageChannel();
      let running = true;
      let lastFrameTime = 0;
      // Target ~72fps (14ms) for slightly lower input latency than 60fps (16.67ms)
      const targetFrameTime = 14;

      const fastLoop = () => {
        if (!running) return;

        const now = performance.now();
        const elapsed = now - lastFrameTime;

        // Render if enough time has passed
        if (elapsed >= targetFrameTime) {
          lastFrameTime = now;
          gameLoop(now);
        }

        messageChannel.port1.postMessage(null);
      };

      messageChannel.port2.onmessage = fastLoop;
      messageChannel.port1.postMessage(null);

      return () => {
        running = false;
        messageChannel.port1.close();
        messageChannel.port2.close();
      };
    }

    // Start the loop if not using MessageChannel (MessageChannel starts itself above)
    if (!USE_MESSAGE_CHANNEL_LOOP) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (!USE_MESSAGE_CHANNEL_LOOP) {
        cancelAnimationFrame(animationId);
      }
      // Cleanup timeouts
      if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
      if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, BIRD_X]);

  // ============================================
  // DEBUG PANEL - State for forcing updates
  // ============================================
  const [debugWeather, setDebugWeather] = useState<WeatherType>('clear');
  const [debugTick, setDebugTick] = useState(0);

  // Update debug panel periodically
  useEffect(() => {
    if (!DEBUG_WEATHER) return;
    const interval = setInterval(() => {
      setDebugWeather(weatherRef.current.current);
      setDebugTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Enhanced setWeatherType - all weather fades in gradually
  const debugSetWeather = useCallback((type: WeatherType) => {
    setWeatherType(type);
    setDebugWeather(type);
    // Everything fades in gradually via intensity system - no immediate effects
    // Lightning will trigger naturally once intensity builds up
  }, [setWeatherType]);

  // ============================================
  // DEBUG PANEL COMPONENT (using portal to render outside game)
  // ============================================
  const DebugPanel = () => {
    if (!DEBUG_WEATHER) return null;

    // Read actual weather from ref (not debugWeather state) so it updates with automatic changes
    const currentWeather = weatherRef.current?.current || 'clear';
    const currentScore = gameStateRef.current?.score || 0;
    const currentState = gameStateRef.current?.gameState || 'idle';

    const getButtonStyle = (isActive: boolean) => ({
      padding: '6px 8px',
      fontSize: '11px',
      background: isActive ? '#ff6b00' : '#333',
      color: 'white',
      border: isActive ? '2px solid #fff' : '1px solid #666',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left' as const,
      fontWeight: isActive ? 'bold' : 'normal',
    });

    const sectionStyle = {
      marginBottom: '8px',
      borderBottom: '1px solid #444',
      paddingBottom: '6px',
    };

    const labelStyle = {
      fontSize: '9px',
      color: '#888',
      marginBottom: '4px',
      textTransform: 'uppercase' as const,
    };

    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: '60px',
          left: '10px',
          width: '150px',
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
          background: 'rgba(0,0,0,0.95)',
          padding: '10px',
          borderRadius: '8px',
          zIndex: 999999,
          fontFamily: 'monospace',
          fontSize: '10px',
          color: 'white',
          border: '2px solid #ff6b00',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px', color: '#ff6b00' }}>🛠️ Debug Panel</div>

        {/* Current Status */}
        <div style={{ ...sectionStyle, background: '#222', padding: '6px', borderRadius: '4px', marginBottom: '10px' }}>
          <div style={{ fontSize: '10px' }}>🎯 Score: <b>{currentScore}</b></div>
          <div style={{ fontSize: '10px' }}>🌤️ Weather: <b style={{ color: '#ff6b00' }}>{currentWeather}</b></div>
          <div style={{ fontSize: '10px' }}>💧 Intensity: <b style={{ color: '#4af' }}>{Math.round(weatherRef.current.intensity * 100)}%</b></div>
          <div style={{ fontSize: '10px' }}>🌫️ Fog: <b style={{ color: '#aaa' }}>{Math.round(weatherRef.current.fogIntensity * 100)}%</b></div>
          <div style={{ fontSize: '10px' }}>📍 State: <b>{currentState}</b></div>
        </div>

        {/* Weather Section */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Weather (click to change)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            {(['clear', 'rain', 'storm', 'snow'] as WeatherType[]).map((w) => (
              <button key={w} onClick={() => debugSetWeather(w)} style={getButtonStyle(currentWeather === w)}>
                {w === 'clear' ? '☀️' : w === 'rain' ? '🌧️' : w === 'storm' ? '⛈️' : '❄️'} {w}
              </button>
            ))}
          </div>
        </div>

        {/* Fog Overlay (separate from weather) */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Fog Overlay</div>
          <button
            onClick={() => toggleFog()}
            style={getButtonStyle(weatherRef.current.fogIntensity > 0 || fogTimerRef.current > 0)}
          >
            🌫️ {weatherRef.current.fogIntensity > 0 ? 'Fog ON' : 'Toggle Fog'}
          </button>
        </div>

        {/* Effects Section */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Spawn Effects</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button onClick={() => spawnBirdFlock()} style={getButtonStyle(false)}>🐦 Spawn Birds</button>
            <button onClick={() => { for(let i=0;i<10;i++) spawnFallingLeaf(); }} style={getButtonStyle(false)}>🍂 Spawn Leaves</button>
            <button onClick={() => triggerLightningBolt()} style={getButtonStyle(false)}>⚡ Lightning!</button>
          </div>
        </div>

        {/* Difficulty Section */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Set Score (Difficulty)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
            {[0, 10, 25, 40, 60, 80].map((s) => (
              <button key={s} onClick={() => { gameStateRef.current.score = s; setDebugTick(t => t + 1); }} style={getButtonStyle(currentScore >= s && currentScore < (s + 10))}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pipe Testing */}
        <div style={sectionStyle}>
          <div style={labelStyle}>Pipes</div>
          <button onClick={() => {
            const pipe = generatePipe(100, CANVAS_WIDTH);
            pipe.isMoving = true;
            pipe.moveSpeed = 1.5;
            pipe.moveRange = 60;
            gameStateRef.current.pipes.push(pipe);
          }} style={getButtonStyle(false)}>🔄 Add Moving Pipe</button>
        </div>
      </div>,
      document.body
    );
  };

  // ============================================
  // RENDER
  // Document-level click listener for clicking anywhere to jump
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Don't trigger jump if clicking on buttons or debug panel
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.fo-debug-weather') || target.closest('[style*="zIndex: 999999"]')) {
        return;
      }
      handleTap(e as any);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [handleTap]);

  // ============================================
  return (
    <>
      <DebugPanel />

      <div ref={containerRef} className={`flappy-container ${isMobile ? 'mobile' : 'desktop'}`}>
      <GameSEO
        gameName="Flappy Orange"
        gameSlug="flappy-orange"
        description="Guide your orange through pipes in this addictive arcade game. Tap to flap and avoid obstacles!"
        genre="Arcade"
      />
      {/* Control Buttons */}
      <button
        className="fo-back-btn"
        onClick={(e) => { e.stopPropagation(); navigate('/games'); }}
        aria-label="Back to games"
      >
        <IonIcon icon={arrowBack} />
      </button>

      <button
        className="fo-sound-btn"
        onClick={(e) => { e.stopPropagation(); toggleSound(); }}
        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
      </button>

      {/* Debug: Music track switcher */}
      {DEBUG_OVERLAY && (
        <div className="fo-debug-music" style={{
          position: 'fixed',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 9999,
        }}>
          {MUSIC_PLAYLIST.map((track, i) => (
            <button
              key={i}
              onClick={() => playTrack(i)}
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: '#ff6b00',
                color: 'white',
                border: '3px solid white',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Visual Effects - disabled in performance mode */}
      {!PERFORMANCE_MODE && <GameEffects effects={effects} accentColor="#ff6b00" />}

      {/* Game Canvas - touch handled via native listener for performance */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleTap}
        className="fo-canvas"
      />

      {/* Floating Scores */}
      {floatingScores.map(fs => (
        <div
          key={fs.id}
          className="fo-floating-score"
          style={{ left: fs.x, top: fs.y }}
        >
          {fs.value}
        </div>
      ))}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="fo-game-over-overlay" onClick={(e) => e.stopPropagation()}>
          {/* Main Game Over Content - stays fixed */}
          <div className="fo-game-over-content">
            <div className="fo-game-over-left">
              {sadImage ? (
                <img src={sadImage} alt="Game Over" className="fo-sad-image" />
              ) : (
                <div className="fo-game-over-emoji">🍊</div>
              )}
            </div>
            <div className="fo-game-over-right">
              <h2 className="fo-game-over-title">Game Over!</h2>

              <div className="fo-game-over-score">
                <span className="fo-score-value">{score}</span>
                <span className="fo-score-label">pipes passed</span>
              </div>

              <div className="fo-game-over-stats">
                <div className="fo-stat">
                  <span className="fo-stat-value">{highScore}</span>
                  <span className="fo-stat-label">best</span>
                </div>
              </div>

              {(isNewPersonalBest || score > highScore) && score > 0 && (
                <div className="fo-new-record">New Personal Best!</div>
              )}

              {isSignedIn && (
                <div className="fo-submitted">
                  {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}

              {/* Buttons: Play Again + Share + Leaderboard */}
              <div className="fo-game-over-buttons">
                <button onClick={resetGame} className="fo-play-btn">
                  Play Again
                </button>
                <button onClick={handleNativeShare} className="fo-share-btn">
                  Share
                </button>
                <button
                  onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                  className="fo-leaderboard-btn"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Panel - overlays on top */}
          {showLeaderboardPanel && (
            <div className="fo-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
              <div className="fo-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                <div className="fo-leaderboard-header">
                  <h3>Leaderboard</h3>
                  <button className="fo-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                </div>
                <div className="fo-leaderboard-list">
                  {Array.from({ length: 10 }, (_, index) => {
                    const entry = globalLeaderboard[index];
                    const isCurrentUser = entry && score === entry.score;
                    return (
                      <div key={index} className={`fo-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                        <span className="fo-leaderboard-rank">#{index + 1}</span>
                        <span className="fo-leaderboard-name">{entry?.displayName || '---'}</span>
                        <span className="fo-leaderboard-score">{entry?.score ?? '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Back to Games - positioned in safe area (bottom right) */}
          <button
            onClick={() => { window.location.href = '/games'; }}
            className="fo-back-to-games-btn"
          >
            Back to Games
          </button>
        </div>
      )}

      {/* Challenge Banner */}
      {challengeTarget && !challengeBeaten && gameState === 'playing' && (
        <div className="fo-challenge-banner">
          <span>🎯 Beat {challengeTarget} to win!</span>
        </div>
      )}

      {/* Challenge Beaten Banner */}
      {challengeBeaten && gameState === 'playing' && (
        <div className="fo-challenge-banner fo-challenge-beaten">
          <span>🏆 Challenge Beaten!</span>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fo-toast fo-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fo-share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="fo-share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fo-share-modal-close" onClick={() => setShowShareModal(false)}>×</button>
            <h3>Share Your Score</h3>
            {shareImageUrl && (
              <img src={shareImageUrl} alt="Score" className="fo-share-preview" />
            )}
            <div className="fo-share-modal-buttons">
              <button onClick={handleDownloadImage} className="fo-share-modal-btn">
                Download Image
              </button>
              <button onClick={handleCopyLink} className="fo-share-modal-btn">
                Copy Challenge Link
              </button>
              <button onClick={handleNativeShare} className="fo-share-modal-btn fo-share-modal-btn-primary">
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Game Confirmation Dialog */}
      <ConfirmModal
        isOpen={showExitDialog}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="Leave Game?"
        message="Your progress will be lost. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
        variant="warning"
        icon="🎮"
      />
      </div>
    </>
  );
};

export default FlappyOrange;
