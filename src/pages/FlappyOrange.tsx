// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
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

// Day/Night cycle timing (60 second full cycle)
const CYCLE_DURATION_MS = 60000;  // 60 seconds for full day/night cycle
const DAY_DURATION_MS = 30000;    // 30 seconds for sun arc
const NIGHT_DURATION_MS = 30000;  // 30 seconds for moon arc

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
  const rainDropsRef = useRef<Array<{ x: number; y: number; length: number; speed: number; opacity: number }>>([]);
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
    // Day: dawn (0-0.12) → day (0.12-0.5) → golden (0.5-0.75) → sunset (0.75-1.0)
    // Night: dusk (0-0.15) → night (0.15-0.85) → pre-dawn (0.85-1.0)

    let fromEnv: keyof typeof ENVIRONMENT_COLORS;
    let toEnv: keyof typeof ENVIRONMENT_COLORS;
    let t: number;

    if (isDay) {
      if (phaseTime < 0.12) {
        // Dawn
        fromEnv = 'dawn';
        toEnv = 'day';
        t = phaseTime / 0.12;
      } else if (phaseTime < 0.5) {
        // Day
        fromEnv = 'day';
        toEnv = 'day';
        t = 0;
      } else if (phaseTime < 0.75) {
        // Day to Golden
        fromEnv = 'day';
        toEnv = 'golden';
        t = (phaseTime - 0.5) / 0.25;
      } else {
        // Golden to Sunset
        fromEnv = 'golden';
        toEnv = 'sunset';
        t = (phaseTime - 0.75) / 0.25;
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
  const spawnRainDrops = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      rainDropsRef.current.push({
        x: Math.random() * CANVAS_WIDTH * 1.2 - CANVAS_WIDTH * 0.1,
        y: -10 - Math.random() * 50,
        length: 12 + Math.random() * 12, // Slightly longer to look denser
        speed: 10 + Math.random() * 4, // Faster so fewer on screen at once
        opacity: 0.4 + Math.random() * 0.3,
      });
    }
    // Cap rain drops (reduced for mobile performance)
    if (rainDropsRef.current.length > 40) {
      rainDropsRef.current = rainDropsRef.current.slice(-40);
    }
  }, [CANVAS_WIDTH]);

  // Update rain drops
  const updateRainDrops = useCallback(() => {
    rainDropsRef.current = rainDropsRef.current.filter(drop => {
      drop.y += drop.speed;
      drop.x -= 2; // Wind effect
      return drop.y < CANVAS_HEIGHT + 20;
    });
  }, [CANVAS_HEIGHT]);

  // Draw rain
  const drawRain = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    rainDropsRef.current.forEach(drop => {
      ctx.strokeStyle = `rgba(150, 180, 200, ${drop.opacity})`;
      ctx.lineWidth = 1;
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

  // Draw lightning flash
  const drawLightningFlash = useCallback((ctx: CanvasRenderingContext2D, alpha: number) => {
    if (alpha <= 0) return;
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw vignette effect - optimized for mobile (simpler, no gradient)
  // Only draw vignette for night/storm modes for performance
  const drawVignette = useCallback((ctx: CanvasRenderingContext2D, env: keyof typeof ENVIRONMENT_COLORS) => {
    // Skip vignette for day mode (performance)
    if (env === 'day') return;

    ctx.save();
    // Simple top darkening only (no bottom bar)
    const alpha = env === 'storm' ? 0.3 : env === 'night' ? 0.25 : 0.15;
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;

    // Top edge only
    ctx.fillRect(0, 0, CANVAS_WIDTH, 30);

    ctx.restore();
  }, [CANVAS_WIDTH]);

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
  const generatePipe = useCallback((isFirst: boolean = false): Pipe => {
    // Gap positioned more towards center for easier gameplay
    const minGapY = PIPE_GAP / 2 + 100;
    const maxGapY = CANVAS_HEIGHT - PIPE_GAP / 2 - 100;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    // 40% chance to spawn a coin in the pipe gap
    if (Math.random() < 0.4 && !isFirst) {
      coinsRef.current.push({
        x: CANVAS_WIDTH + PIPE_WIDTH + PIPE_SPACING / 2, // Between this pipe and the next
        y: gapY + (Math.random() - 0.5) * (PIPE_GAP * 0.5), // Within the gap area
        collected: false,
        rotation: 0,
      });
    }

    return {
      // First pipe spawns much further away for easy start (~3 seconds of free flying)
      x: isFirst ? CANVAS_WIDTH + PIPE_WIDTH + 300 : CANVAS_WIDTH + PIPE_WIDTH,
      gapY,
      passed: false,
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Handle score point
  // pointsEarned and actionWord are passed from updatePipes for context
  const onScorePoint = useCallback((newScore: number, pipeGapY?: number, pointsEarned?: number, actionWord?: string) => {
    setScore(newScore);

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
  }, [soundEnabled, playBlockLand, playCombo, playPerfectBonus, hapticScore, hapticCombo, hapticHighScore, showFloatingScore, showEpicCallout, triggerBigMoment, triggerConfetti, BIRD_X, playPassNote, spawnPassParticles, triggerPassPulse]);

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

    // Ceiling - no longer instant death, handled in updateBird instead

    // Pipe collision
    for (const pipe of pipes) {
      if (pipe.x > BIRD_X + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
        continue;
      }

      const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
      const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;

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
    // Easy start, difficulty ramps after 5 pipes
    // Speed: 2.5 base (increased for better feel), frame-rate independent
    const baseSpeed = 2.5 + Math.max(0, Math.floor((currentScore - 5) / 20)) * 0.2;
    const speed = baseSpeed * deltaTime;

    pipes.forEach(pipe => {
      pipe.x -= speed;
    });

    // Update coins (move with same speed as pipes)
    coinsRef.current.forEach(coin => {
      coin.x -= speed;
      coin.rotation += 0.08 * deltaTime; // Spin animation
    });
    // Remove off-screen coins
    coinsRef.current = coinsRef.current.filter(coin => coin.x > -30);

    // Check coin collision with bird
    const birdY = gameStateRef.current.bird.y;
    // Check coin collision - coins add +3 to main score
    coinsRef.current.forEach(coin => {
      if (!coin.collected) {
        const dx = coin.x - BIRD_X;
        const dy = coin.y - birdY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionRadius = BIRD_RADIUS + 12; // Bird radius + coin radius

        if (distance < collisionRadius) {
          coin.collected = true;
          newScore += 1; // Coins add +1 to main score
          playCoinSound();
          // Show floating +1
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            showFloatingScore('+1', rect.left + coin.x, rect.top + coin.y - 20);
          }
        }
      }
    });

    const filteredPipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    if (filteredPipes.length === 0 || filteredPipes[filteredPipes.length - 1].x < CANVAS_WIDTH - PIPE_SPACING) {
      // First pipe gets extra distance for grace period
      filteredPipes.push(generatePipe(filteredPipes.length === 0));
    }

    filteredPipes.forEach(pipe => {
      // Trigger score when bird enters the pipe gap (immediate feedback)
      if (!pipe.passed && pipe.x < BIRD_X) {
        pipe.passed = true;

        // In ultra performance mode, skip all effects to minimize state updates
        if (ULTRA_PERFORMANCE_MODE) {
          newScore += 1;
          onScorePoint(newScore);
          return;
        }

        // Base score: +1 per pipe
        // Simple scoring: +1 per pipe passed
        const birdY = gameStateRef.current.bird.y;

        // Show floating score
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          showFloatingScore('+1', rect.left + BIRD_X + 40, rect.top + birdY - 20);
        }

        newScore += 1;
        onScorePoint(newScore, pipe.gapY, 1, '');
      }
    });

    return { pipes: filteredPipes, newScore };
  }, [CANVAS_WIDTH, BIRD_X, generatePipe, onScorePoint, showFloatingScore, playCoinSound]);

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

  // Draw coin - shiny gold coin with rotation effect
  const drawCoin = useCallback((ctx: CanvasRenderingContext2D, coin: Coin) => {
    if (coin.collected) return;

    ctx.save();
    ctx.translate(coin.x, coin.y);

    // Simulate 3D rotation by varying width
    const rotationScale = Math.abs(Math.cos(coin.rotation));
    const coinRadius = 12;

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
  const drawPipes = useCallback((ctx: CanvasRenderingContext2D, pipes: Pipe[], currentScore: number) => {
    ctx.fillStyle = '#228B22';

    pipes.forEach(pipe => {
      const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
      const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;

      // Top pipe - just a rectangle
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBottom);

      // Bottom pipe - just a rectangle
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeTop - 20);

      // Caps only if not in performance mode
      if (!PERFORMANCE_MODE) {
        ctx.fillStyle = '#1B5E20';
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
  }, [CANVAS_HEIGHT, resetAllEffects, generateClouds, generateTrees, generateGrassTufts]);

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

      drawPipes(ctx, state.pipes, state.score);

      // Draw coins
      coinsRef.current.forEach(coin => {
        drawCoin(ctx, coin);
      });

      // Draw pipe gap highlight (skip in performance mode)
      if (!PERFORMANCE_MODE && state.gameState === 'playing') {
        drawPipeGapHighlight(ctx, state.pipes, BIRD_X);
      }

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

      if (state.gameState === 'playing' || state.isDying) {
        drawScore(ctx, state.score);
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
  // RENDER
  // ============================================
  return (
    <div ref={containerRef} className={`flappy-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Control Buttons */}
      <button
        className="fo-back-btn"
        onClick={() => navigate('/games')}
        aria-label="Back to games"
      >
        <IonIcon icon={arrowBack} />
      </button>

      <button
        className="fo-sound-btn"
        onClick={toggleSound}
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
  );
};

export default FlappyOrange;
