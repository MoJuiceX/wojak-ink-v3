// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack, volumeHigh, volumeMute, pause, play } from 'ionicons/icons';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import './BlockPuzzle.css';

// ============================================
// BLOCK SHAPES
// ============================================
const BLOCK_SHAPES: Record<string, number[][]> = {
  // Singles and lines
  single: [[1]],
  line2h: [[1, 1]],
  line3h: [[1, 1, 1]],
  line4h: [[1, 1, 1, 1]],
  line5h: [[1, 1, 1, 1, 1]],
  line2v: [[1], [1]],
  line3v: [[1], [1], [1]],
  line4v: [[1], [1], [1], [1]],

  // Squares
  square2: [[1, 1], [1, 1]],
  square3: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],

  // L shapes
  lShape1: [[1, 0], [1, 0], [1, 1]],
  lShape2: [[0, 1], [0, 1], [1, 1]],
  lShape3: [[1, 1], [1, 0], [1, 0]],
  lShape4: [[1, 1], [0, 1], [0, 1]],

  // T shape
  tShape: [[1, 1, 1], [0, 1, 0]],

  // Corner
  corner: [[1, 1], [1, 0]],
};

const SHAPE_KEYS = Object.keys(BLOCK_SHAPES);

// Block colors - distinct and vibrant palette
const BLOCK_COLORS = [
  'linear-gradient(135deg, #ff7b00, #e65c00)',  // Orange (brand)
  'linear-gradient(135deg, #00d68f, #00b377)',  // Bright green/teal
  'linear-gradient(135deg, #a855f7, #7c3aed)',  // Purple
  'linear-gradient(135deg, #3b82f6, #2563eb)',  // Blue
  'linear-gradient(135deg, #f43f5e, #e11d48)',  // Pink/rose
  'linear-gradient(135deg, #fbbf24, #f59e0b)',  // Yellow/gold
];

// ============================================
// PHASE 3: EXPLOSIVE LINE CLEARS CONFIG
// ============================================

// TASK 28: Freeze frame durations by line count
const FREEZE_DURATIONS: Record<number, number> = {
  1: 0,      // No freeze for single line
  2: 50,     // Brief pause for double
  3: 80,     // Longer for triple
  4: 120,    // Maximum for quad+
};

// TASK 36: Enhanced shake config by line count
const SHAKE_CONFIG: Record<number, { intensity: number; duration: number; rotation: number }> = {
  1: { intensity: 3, duration: 150, rotation: 0 },
  2: { intensity: 6, duration: 250, rotation: 1 },
  3: { intensity: 10, duration: 350, rotation: 2 },
  4: { intensity: 15, duration: 450, rotation: 3 },
};

// TASK 42: Clear callout messages
const CLEAR_CALLOUTS: Record<number, string> = {
  2: 'DOUBLE!',
  3: 'TRIPLE!',
  4: 'QUAD CLEAR!',
  5: 'MEGA CLEAR!',
};

// ============================================
// PHASE 1: SOUND FOUNDATION CONFIG
// ============================================

// TASK 1: Musical scale frequencies for combo escalation (C Major)
const COMBO_SCALE_FREQUENCIES = [
  261.63, // C4 - Do (combo 1)
  293.66, // D4 - Re (combo 2)
  329.63, // E4 - Mi (combo 3)
  349.23, // F4 - Fa (combo 4)
  392.00, // G4 - Sol (combo 5+)
];

const COMBO_SOUND_CONFIG: Record<number, { note: number; volume: number; layers: number }> = {
  1: { note: 0, volume: 0.4, layers: 1 },
  2: { note: 1, volume: 0.45, layers: 1 },
  3: { note: 2, volume: 0.5, layers: 2 },  // Add sparkle
  4: { note: 3, volume: 0.55, layers: 2 },
  5: { note: 4, volume: 0.6, layers: 3 },  // Add bass
};

// TASK 3: Line clear sound configuration
const LINE_CLEAR_SOUNDS: Record<number, { pitch: number; volume: number; duration: number }> = {
  1: { pitch: 1.0, volume: 0.4, duration: 200 },
  2: { pitch: 1.15, volume: 0.5, duration: 250 },
  3: { pitch: 1.3, volume: 0.6, duration: 300 },
  4: { pitch: 1.45, volume: 0.7, duration: 400 },
};

// ============================================
// PHASE 2: PREMIUM HAPTICS CONFIG
// ============================================

// TASK 17: Haptic vibration patterns (duration in ms)
const HAPTIC_PATTERNS = {
  dragStart: [5],                              // Ultra-light tick
  snapLock: [15, 30, 15],                      // Double-tap confirmation
  lineClear1: [20],                            // Single line - short pulse
  lineClear2: [20, 20, 25],                    // Double line - rhythmic
  lineClear3: [25, 20, 30, 20, 35],            // Triple line - building
  lineClear4: [30, 20, 35, 20, 40, 20, 50],    // Quad+ EXPLOSION
  invalidPlacement: [10, 50, 10],              // Error double-tap
  comboHit: [15, 15, 20],                      // Combo confirmation
  perfectClear: [20, 30, 25, 30, 30, 30, 40, 30, 50], // Celebration crescendo
  dangerPulse: [8],                            // Subtle warning heartbeat
  streakFire: [15, 20, 25, 30],                // Ignition pattern
};

// ============================================
// PHASE 6: DANGER STATE CONFIG
// ============================================

// TASK 69: Danger thresholds based on percentage of filled cells
const DANGER_THRESHOLDS = {
  safe: 0.55,      // < 55% filled
  warning: 0.65,   // 65% filled
  critical: 0.78,  // 78% filled
  imminent: 0.88,  // 88% filled
};

type DangerLevel = 'safe' | 'warning' | 'critical' | 'imminent';

// Danger haptic intervals (ms)
const DANGER_HAPTIC_INTERVALS: Record<DangerLevel, number> = {
  safe: 0,
  warning: 2500,
  critical: 1500,
  imminent: 800,
};

// ============================================
// PHASE 7: STREAK FIRE MODE CONFIG
// ============================================

// TASK 84: Streak configuration
const STREAK_CONFIG = {
  activationThreshold: 3,  // 3 consecutive clears to activate fire mode
  timeout: 6000,           // 6 seconds between clears before reset
  bonusMultiplier: 1.5,    // 50% bonus during streak
};

// TASK 96: Perfect clear bonus
const PERFECT_CLEAR_BONUS = 5000;

// TASK 83: Streak state interface
interface StreakState {
  count: number;
  active: boolean;
  lastClearTime: number;
}

// ============================================
// TYPES
// ============================================
interface GridCell {
  filled: boolean;
  color: string | null;
  blockId: string | null;
}

type Grid = GridCell[][];

interface DraggablePiece {
  id: string;
  shape: number[][];
  color: string;
}

// TASK 32: Particle interface for line clear bursts
interface ClearParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

// Shockwave interface
interface Shockwave {
  id: number;
  x: number;
  y: number;
  size: number;
  maxSize: number;
  alpha: number;
}

// TASK 43: Trail particle interface for drag effects
interface TrailParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
}

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// ============================================
// HELPER FUNCTIONS
// ============================================
const createEmptyGrid = (): Grid =>
  Array(8).fill(null).map(() =>
    Array(8).fill(null).map(() => ({
      filled: false,
      color: null,
      blockId: null
    }))
  );

const generateRandomPiece = (): DraggablePiece => {
  const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shape: BLOCK_SHAPES[shapeKey],
    color: BLOCK_COLORS[colorIndex],
  };
};

const generateThreePieces = (): DraggablePiece[] => {
  return [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
};

const canPlacePiece = (
  grid: Grid,
  shape: number[][],
  startRow: number,
  startCol: number
): boolean => {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 0) continue;

      const gridRow = startRow + r;
      const gridCol = startCol + c;

      // Out of bounds
      if (gridRow < 0 || gridRow >= 8 || gridCol < 0 || gridCol >= 8) {
        return false;
      }

      // Cell occupied
      if (grid[gridRow][gridCol].filled) {
        return false;
      }
    }
  }
  return true;
};

const canPlaceAnywhere = (grid: Grid, piece: DraggablePiece): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (canPlacePiece(grid, piece.shape, row, col)) {
        return true;
      }
    }
  }
  return false;
};

const placePiece = (
  grid: Grid,
  shape: number[][],
  startRow: number,
  startCol: number,
  color: string
): { newGrid: Grid; placedCells: string[] } => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const blockId = `block-${Date.now()}`;
  const placedCells: string[] = [];

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        newGrid[startRow + r][startCol + c] = {
          filled: true,
          color,
          blockId
        };
        placedCells.push(`${startRow + r}-${startCol + c}`);
      }
    }
  }

  return { newGrid, placedCells };
};

const clearLines = (grid: Grid): {
  clearedGrid: Grid;
  linesCleared: number;
  cellsCleared: Set<string>;
} => {
  const cellsToClear = new Set<string>();
  let rowsCleared = 0;
  let colsCleared = 0;

  // Check rows
  for (let row = 0; row < 8; row++) {
    if (grid[row].every(cell => cell.filled)) {
      rowsCleared++;
      for (let col = 0; col < 8; col++) {
        cellsToClear.add(`${row}-${col}`);
      }
    }
  }

  // Check columns
  for (let col = 0; col < 8; col++) {
    let columnFull = true;
    for (let row = 0; row < 8; row++) {
      if (!grid[row][col].filled) {
        columnFull = false;
        break;
      }
    }
    if (columnFull) {
      colsCleared++;
      for (let row = 0; row < 8; row++) {
        cellsToClear.add(`${row}-${col}`);
      }
    }
  }

  // Clear cells
  const clearedGrid = grid.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      if (cellsToClear.has(`${rowIdx}-${colIdx}`)) {
        return { filled: false, color: null, blockId: null };
      }
      return cell;
    })
  );

  return {
    clearedGrid,
    linesCleared: rowsCleared + colsCleared,
    cellsCleared: cellsToClear
  };
};

const isGameOver = (grid: Grid, pieces: DraggablePiece[]): boolean => {
  for (const piece of pieces) {
    if (canPlaceAnywhere(grid, piece)) {
      return false;
    }
  }
  return true;
};

// ============================================
// MAIN COMPONENT
// ============================================
const BlockPuzzle: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playGameStart } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticButton, hapticSuccess } = useGameHaptics();

  // Visual effects
  const {
    effects,
    triggerBigMoment,
    triggerConfetti,
    showEpicCallout,
    resetAllEffects,
  } = useGameEffects();

  // Leaderboard
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('block-puzzle');
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [pieces, setPieces] = useState<DraggablePiece[]>(generateThreePieces);
  const [score, setScore] = useState(0);
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);
  const [totalBlocksPlaced, setTotalBlocksPlaced] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  // TASK 101: Track perfect clears
  const [perfectClears, setPerfectClears] = useState(0);
  const [showPerfectClear, setShowPerfectClear] = useState(false);

  // PHASE 10: Viral Share System state
  // TASK 125: Track best combo for share
  const [bestCombo, setBestCombo] = useState(0);
  // TASK 114: Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  // TASK 116-117: Challenge system
  const [challengeTarget, setChallengeTarget] = useState<number | null>(null);
  const [challengeBeaten, setChallengeBeaten] = useState(false);
  // TASK 127: Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Drag state - use refs to avoid stale closures
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [previewPosition, setPreviewPosition] = useState<{ row: number; col: number } | null>(null);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [justPlacedCells, setJustPlacedCells] = useState<Set<string>>(new Set());

  // Effect states for "juice"
  const [shakeLevel, setShakeLevel] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');
  const [floatingScores, setFloatingScores] = useState<Array<{
    id: string;
    value: number;
    x: number;
    y: number;
    isBig: boolean;
    multiplier?: string; // TASK 107: Optional multiplier text
  }>>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [newPieceId, setNewPieceId] = useState<string | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // TASK 103 & 110: Combo visualization state
  const [comboTimeLeft, setComboTimeLeft] = useState(100); // Percentage
  const comboStartTimeRef = useRef<number>(0);
  const [comboShake, setComboShake] = useState(false);
  const [lostCombo, setLostCombo] = useState<number | null>(null);
  const COMBO_TIMEOUT_MS = 3000;

  // PHASE 3: EXPLOSIVE LINE CLEARS state
  // TASK 27: Freeze frame state
  const [freezeFrame, setFreezeFrame] = useState(false);
  const freezeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TASK 32: Particle state for line clear bursts
  const [clearParticles, setClearParticles] = useState<ClearParticle[]>([]);

  // TASK 30: Shockwave state
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  // TASK 39: Screen flash state
  const [screenFlash, setScreenFlash] = useState<string | null>(null);

  // PHASE 4: Drag trail particles state
  // TASK 43: Trail particle state
  const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
  const lastTrailPosRef = useRef({ x: 0, y: 0 });
  // TASK 52: Snap detection state
  const [isSnapped, setIsSnapped] = useState(false);
  const prevSnappedRef = useRef(false);

  // PHASE 6: Danger state system
  // TASK 70: Danger level state
  const [dangerLevel, setDangerLevel] = useState<DangerLevel>('safe');
  // TASK 73: Valid placement cells for highlighting
  const [validPlacements, setValidPlacements] = useState<Set<string>>(new Set());
  // TASK 78: Moves left warning
  const [movesLeft, setMovesLeft] = useState<number | null>(null);
  const dangerHapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // PHASE 7: Streak fire mode state
  // TASK 83: Streak state
  const [streakState, setStreakState] = useState<StreakState>({
    count: 0,
    active: false,
    lastClearTime: 0,
  });
  const streakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // PHASE 1: Audio context for procedural sounds
  const audioContextRef = useRef<AudioContext | null>(null);
  const dangerLoopRef = useRef<OscillatorNode | null>(null);
  const dangerGainRef = useRef<GainNode | null>(null);

  // Get or create audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Refs for drag state (to avoid stale closures)
  const containerRef = useRef<HTMLDivElement>(null);
  const draggedPieceIdRef = useRef<string | null>(null);
  const previewPositionRef = useRef<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<DraggablePiece[]>(pieces);
  const gridStateRef = useRef<Grid>(grid);

  // High score
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('blockPuzzleHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [sadImage, setSadImage] = useState('');

  // Sound and pause state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('blockPuzzleSoundEnabled') !== 'false';
  });
  const [isPaused, setIsPaused] = useState(false);

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing',
  });

  // Keep refs in sync with state
  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  useEffect(() => {
    gridStateRef.current = grid;
  }, [grid]);

  useEffect(() => {
    draggedPieceIdRef.current = draggedPieceId;
  }, [draggedPieceId]);

  useEffect(() => {
    previewPositionRef.current = previewPosition;
  }, [previewPosition]);

  // Calculate cell size based on viewport
  const GRID_SIZE = isMobile ? Math.min(window.innerWidth - 32, 360) : 400;
  const CELL_SIZE = GRID_SIZE / 8;
  // Piece cell size must fit largest piece (5-wide) in slot: 5*cell + 4 gaps < slot width
  // Slots: 110px desktop, 95px mobile, 85px small (400px), 75px very small (360px)
  const getSlotSize = () => {
    if (!isMobile) return 110;
    const width = window.innerWidth;
    if (width <= 360) return 75;
    if (width <= 400) return 85;
    return 95;
  };
  const slotSize = getSlotSize();
  // Calculate cell size: (slotSize - 4 gaps) / 5 cells, with some padding
  const PIECE_CELL_SIZE = Math.floor((slotSize - 8) / 5);

  // Get piece by ID
  const getPieceById = useCallback((id: string): DraggablePiece | undefined => {
    return piecesRef.current.find(p => p.id === id);
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('blockPuzzleSoundEnabled', String(newState));
    hapticButton();
  }, [soundEnabled, hapticButton]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameState !== 'playing') return;
    setIsPaused(prev => !prev);
    hapticButton();
  }, [gameState, hapticButton]);

  // Show floating score popup
  // TASK 107: Updated to show optional multiplier
  const showFloatingScore = useCallback((value: number, x: number, y: number, isBig = false, multiplier?: string) => {
    const id = `score-${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x, y, isBig, multiplier }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1000);
  }, []);

  // ============================================
  // PHASE 3: EXPLOSIVE LINE CLEARS FUNCTIONS
  // ============================================

  // TASK 27: Trigger freeze frame
  const triggerFreezeFrame = useCallback((duration: number) => {
    if (duration <= 0) return;
    setFreezeFrame(true);
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    freezeTimeoutRef.current = setTimeout(() => setFreezeFrame(false), duration);
  }, []);

  // TASK 30: Trigger shockwave effect
  const triggerShockwave = useCallback((x: number, y: number, maxSize: number = 300) => {
    const id = Date.now();
    setShockwaves(prev => [...prev, { id, x, y, size: 0, maxSize, alpha: 1 }]);
  }, []);

  // TASK 32: Create particle burst from cleared cells
  const createLineClearBurst = useCallback((cells: { row: number; col: number }[], color: string) => {
    const newParticles: ClearParticle[] = [];
    const baseColor = color.includes('gradient') ? '#ff6b00' : color;

    cells.forEach((cell, cellIndex) => {
      const cellX = cell.col * CELL_SIZE + CELL_SIZE / 2;
      const cellY = cell.row * CELL_SIZE + CELL_SIZE / 2;

      // 6-10 particles per cell
      const particleCount = 6 + Math.floor(Math.random() * 5);

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 3 + Math.random() * 6;

        newParticles.push({
          id: Date.now() + cellIndex * 100 + i,
          x: cellX,
          y: cellY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2, // Bias upward
          size: 4 + Math.random() * 6,
          color: i % 4 === 0 ? '#ffffff' : baseColor, // Some white sparkles
          alpha: 1,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
        });
      }
    });

    setClearParticles(prev => [...prev, ...newParticles]);
  }, [CELL_SIZE]);

  // TASK 39: Trigger screen flash
  const triggerScreenFlash = useCallback((color: string) => {
    setScreenFlash(color);
    setTimeout(() => setScreenFlash(null), 150);
  }, []);

  // TASK 33: Particle animation loop
  useEffect(() => {
    if (clearParticles.length === 0) return;

    const interval = setInterval(() => {
      setClearParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3, // gravity
            alpha: p.alpha - 0.025,
            rotation: p.rotation + p.rotationSpeed,
            size: p.size * 0.98, // Shrink slightly
          }))
          .filter(p => p.alpha > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [clearParticles.length > 0]);

  // Shockwave animation loop
  useEffect(() => {
    if (shockwaves.length === 0) return;

    const interval = setInterval(() => {
      setShockwaves(prev =>
        prev
          .map(s => ({
            ...s,
            size: s.size + 15,
            alpha: 1 - (s.size / s.maxSize),
          }))
          .filter(s => s.size < s.maxSize)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [shockwaves.length > 0]);

  // ============================================
  // PHASE 1: SOUND FOUNDATION FUNCTIONS
  // ============================================

  // TASK 2: Play musical combo note (Do-Re-Mi-Fa-Sol)
  const playComboNote = useCallback((comboLevel: number) => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const config = COMBO_SOUND_CONFIG[Math.min(comboLevel, 5)];
    const frequency = COMBO_SCALE_FREQUENCIES[config.note];

    // Main note oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(config.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);

    // TASK 11: Add sparkle layer for combo 3+
    if (config.layers >= 2) {
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkleOsc.frequency.value = frequency * 2; // Octave up
      sparkleOsc.type = 'triangle';
      sparkleGain.gain.setValueAtTime(config.volume * 0.3, ctx.currentTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      sparkleOsc.connect(sparkleGain).connect(ctx.destination);
      sparkleOsc.start();
      sparkleOsc.stop(ctx.currentTime + 0.15);
    }

    // Add bass layer for combo 5
    if (config.layers >= 3) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.frequency.value = frequency / 2; // Octave down
      bassOsc.type = 'sine';
      bassGain.gain.setValueAtTime(config.volume * 0.4, ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      bassOsc.connect(bassGain).connect(ctx.destination);
      bassOsc.start();
      bassOsc.stop(ctx.currentTime + 0.2);
    }
  }, [soundEnabled, getAudioContext]);

  // TASK 3: Play line clear sound with pitch variation
  const playLineClearSound = useCallback((linesCleared: number) => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const config = LINE_CLEAR_SOUNDS[Math.min(linesCleared, 4)];
    const baseFreq = 440 * config.pitch;

    // Ascending whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + config.duration / 1000);
    gain.gain.setValueAtTime(config.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + config.duration / 1000);

    // Add chime for multi-clears
    if (linesCleared >= 2) {
      setTimeout(() => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.frequency.value = baseFreq * 1.5;
        chimeOsc.type = 'triangle';
        chimeGain.gain.setValueAtTime(config.volume * 0.5, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        chimeOsc.connect(chimeGain).connect(ctx.destination);
        chimeOsc.start();
        chimeOsc.stop(ctx.currentTime + 0.2);
      }, 50);
    }
  }, [soundEnabled, getAudioContext]);

  // TASK 4: Play piece spawn sound
  const playSpawnSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const pitch = 0.95 + Math.random() * 0.1;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 600 * pitch;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, [soundEnabled, getAudioContext]);

  // TASK 5: Play piece snap/lock sound
  const playSnapSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Deep thunk (80Hz bass)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 80;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    // Click overlay
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.frequency.value = 400;
    clickOsc.type = 'square';
    clickGain.gain.setValueAtTime(0.15, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
    clickOsc.connect(clickGain).connect(ctx.destination);
    clickOsc.start();
    clickOsc.stop(ctx.currentTime + 0.03);
  }, [soundEnabled, getAudioContext]);

  // TASK 6: Play invalid placement sound
  const playInvalidSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Short buzz/rejection sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 150;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }, [soundEnabled, getAudioContext]);

  // TASK 7: Play combo break sound
  const playComboBreakSound = useCallback((lostCombo: number) => {
    if (!soundEnabled || lostCombo < 3) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Descending "womp womp"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, [soundEnabled, getAudioContext]);

  // TASK 8: Start danger heartbeat loop
  const startDangerSound = useCallback(() => {
    if (!soundEnabled || dangerLoopRef.current) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Low frequency pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 40;
    osc.type = 'sine';
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start();

    // Fade in
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.5);

    dangerLoopRef.current = osc;
    dangerGainRef.current = gain;
  }, [soundEnabled, getAudioContext]);

  const stopDangerSound = useCallback(() => {
    if (dangerLoopRef.current && dangerGainRef.current) {
      const ctx = getAudioContext();
      dangerGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      setTimeout(() => {
        dangerLoopRef.current?.stop();
        dangerLoopRef.current = null;
        dangerGainRef.current = null;
      }, 300);
    }
  }, [getAudioContext]);

  // TASK 9: Play perfect clear fanfare
  const playPerfectClearSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Triumphant ascending arpeggio (C5-E5-G5-C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }, i * 100);
    });
  }, [soundEnabled, getAudioContext]);

  // TASK 10: Play streak fire activation sound
  const playStreakFireSound = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    // Whoosh + ignition
    const noiseLength = 0.3;
    const bufferSize = ctx.sampleRate * noiseLength;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    noiseGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + noiseLength);
    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start();
  }, [soundEnabled, getAudioContext]);

  // ============================================
  // PHASE 2: PREMIUM HAPTICS FUNCTIONS
  // ============================================

  // TASK 18: Trigger line-specific haptic patterns
  const triggerLineClearHaptic = useCallback((linesCleared: number) => {
    const patterns: Record<number, number[]> = {
      1: HAPTIC_PATTERNS.lineClear1,
      2: HAPTIC_PATTERNS.lineClear2,
      3: HAPTIC_PATTERNS.lineClear3,
      4: HAPTIC_PATTERNS.lineClear4,
    };
    const pattern = patterns[Math.min(linesCleared, 4)];
    navigator.vibrate?.(pattern);
  }, []);

  // TASK 19: Trigger snap/lock haptic
  const triggerSnapHaptic = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.snapLock);
  }, []);

  // TASK 20: Trigger invalid placement haptic
  const triggerInvalidHaptic = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.invalidPlacement);
  }, []);

  // TASK 21: Trigger drag start haptic
  const triggerDragStartHaptic = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.dragStart);
  }, []);

  // TASK 22: Trigger perfect clear haptic
  const triggerPerfectClearHaptic = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.perfectClear);
  }, []);

  // TASK 23: Trigger danger pulse haptic
  const triggerDangerPulse = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.dangerPulse);
  }, []);

  // Trigger streak fire haptic
  const triggerStreakFireHaptic = useCallback(() => {
    navigator.vibrate?.(HAPTIC_PATTERNS.streakFire);
  }, []);

  // ============================================
  // PHASE 4: DRAG & DROP JUICE FUNCTIONS
  // ============================================

  // TASK 44: Emit trail particles on drag move
  const emitTrailParticle = useCallback((x: number, y: number, color: string) => {
    const dx = x - lastTrailPosRef.current.x;
    const dy = y - lastTrailPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Emit particle every 20px of movement
    if (distance > 20) {
      lastTrailPosRef.current = { x, y };

      // Extract base color from gradient
      const baseColor = color.includes('gradient') ? '#ff6b00' : color;

      setTrailParticles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x,
          y,
          size: 6 + Math.random() * 4,
          color: baseColor,
          alpha: 0.5,
        },
      ]);
    }
  }, []);

  // TASK 49: Clear trail on drag end
  const clearTrailParticles = useCallback(() => {
    setTrailParticles([]);
    lastTrailPosRef.current = { x: 0, y: 0 };
  }, []);

  // TASK 45: Trail particle fade animation loop
  useEffect(() => {
    if (trailParticles.length === 0) return;

    const interval = setInterval(() => {
      setTrailParticles(prev =>
        prev
          .map(p => ({ ...p, alpha: p.alpha - 0.04, size: p.size * 0.92 }))
          .filter(p => p.alpha > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [trailParticles.length > 0]);

  // TASK 52: Magnetic snap detection
  const SNAP_RADIUS = 0.3; // 30% of cell for easier snapping

  const checkSnapPosition = useCallback((row: number, col: number): boolean => {
    // Check if position is close enough to snap
    const rowDiff = Math.abs(row - Math.round(row));
    const colDiff = Math.abs(col - Math.round(col));
    return rowDiff < SNAP_RADIUS && colDiff < SNAP_RADIUS;
  }, []);

  // ============================================
  // PHASE 5: SNAP & PLACEMENT FEEDBACK FUNCTIONS
  // ============================================

  // TASK 65: Mini shake for placement feedback
  const triggerMiniShake = useCallback(() => {
    setShakeLevel('light');
    setTimeout(() => setShakeLevel('none'), 100);
  }, []);

  // TASK 59: Create corner impact particles on placement
  const createPlacementParticles = useCallback((placedCells: string[], color: string) => {
    const newParticles: ClearParticle[] = [];
    const baseColor = color.includes('gradient') ? '#ff6b00' : color;

    // Find corner cells of the placed piece
    const cellCoords = placedCells.map(key => {
      const [r, c] = key.split('-').map(Number);
      return { row: r, col: c };
    });

    // Get bounding box corners
    const minRow = Math.min(...cellCoords.map(c => c.row));
    const maxRow = Math.max(...cellCoords.map(c => c.row));
    const minCol = Math.min(...cellCoords.map(c => c.col));
    const maxCol = Math.max(...cellCoords.map(c => c.col));

    // Create particles at corners
    const corners = [
      { row: minRow, col: minCol, angle: Math.PI * 1.25 },  // Top-left
      { row: minRow, col: maxCol, angle: Math.PI * 1.75 },  // Top-right
      { row: maxRow, col: minCol, angle: Math.PI * 0.75 },  // Bottom-left
      { row: maxRow, col: maxCol, angle: Math.PI * 0.25 },  // Bottom-right
    ];

    corners.forEach((corner, cornerIdx) => {
      const x = corner.col * CELL_SIZE + CELL_SIZE / 2;
      const y = corner.row * CELL_SIZE + CELL_SIZE / 2;

      // 3 particles per corner
      for (let i = 0; i < 3; i++) {
        const angle = corner.angle + (Math.random() - 0.5) * 0.8;
        const speed = 2 + Math.random() * 2;

        newParticles.push({
          id: Date.now() + cornerIdx * 10 + i,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: i === 0 ? '#ffffff' : baseColor,
          alpha: 0.8,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 15,
        });
      }
    });

    setClearParticles(prev => [...prev, ...newParticles]);
  }, [CELL_SIZE]);

  // ============================================
  // PHASE 6: DANGER STATE EFFECTS
  // ============================================

  // Helper: Count filled cells
  const countFilledCells = useCallback((g: Grid): number => {
    return g.flat().filter(cell => cell.filled).length;
  }, []);

  // TASK 95: Check if grid is completely empty (perfect clear)
  const checkPerfectClear = useCallback((g: Grid): boolean => {
    return g.flat().every(cell => !cell.filled);
  }, []);

  // TASK 99: Massive confetti for perfect clear
  const triggerMassiveConfetti = useCallback(() => {
    // Fire confetti bursts in rapid succession
    triggerConfetti();
    setTimeout(() => triggerConfetti(), 150);
    setTimeout(() => triggerConfetti(), 300);
    setTimeout(() => triggerConfetti(), 500);
    setTimeout(() => triggerConfetti(), 750);
  }, [triggerConfetti]);

  // TASK 97: Trigger perfect clear celebration
  const triggerPerfectClear = useCallback(() => {
    // Sound and haptic
    playPerfectClearSound();
    triggerPerfectClearHaptic();

    // Visual celebration
    setShowPerfectClear(true);
    showEpicCallout('PERFECT CLEAR!');
    triggerMassiveConfetti();
    triggerScreenFlash('#ffffff');

    // Create massive particle explosion from center
    const centerX = GRID_SIZE / 2;
    const centerY = GRID_SIZE / 2;
    const perfectParticles: ClearParticle[] = [];

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
      const speed = 4 + Math.random() * 6;
      perfectParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 8,
        color: ['#ffcc00', '#ff6b00', '#ffffff', '#00ff88'][Math.floor(Math.random() * 4)],
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      });
    }
    setClearParticles(prev => [...prev, ...perfectParticles]);

    // Hide overlay after animation
    setTimeout(() => setShowPerfectClear(false), 2500);
  }, [playPerfectClearSound, triggerPerfectClearHaptic, showEpicCallout, triggerMassiveConfetti, triggerScreenFlash, GRID_SIZE]);

  // ============================================
  // PHASE 10: VIRAL SHARE SYSTEM
  // ============================================

  // TASK 127: Toast notification helper
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // TASK 113: Generate share image using canvas
  const generateShareImage = useCallback(async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Orange accent border
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 580, 380);

    // Title
    ctx.fillStyle = '#ff8c1a';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLOCK PUZZLE', 300, 60);

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px system-ui, sans-serif';
    ctx.fillText(score.toLocaleString(), 300, 160);
    ctx.fillStyle = '#888888';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('POINTS', 300, 195);

    // Stats row
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 28px system-ui, sans-serif';
    const statsY = 260;
    ctx.fillText(`${totalLinesCleared}`, 150, statsY);
    ctx.fillText(`${bestCombo}x`, 300, statsY);
    ctx.fillText(`${perfectClears}`, 450, statsY);

    ctx.fillStyle = '#888888';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Lines', 150, statsY + 25);
    ctx.fillText('Best Combo', 300, statsY + 25);
    ctx.fillText('Perfect', 450, statsY + 25);

    // Call to action
    ctx.fillStyle = '#ff6b00';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('Can you beat my score?', 300, 340);

    // Branding
    ctx.fillStyle = '#666666';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('wojak.ink/games', 300, 375);

    return canvas.toDataURL('image/png');
  }, [score, totalLinesCleared, bestCombo, perfectClears]);

  // TASK 116: Encode challenge link
  const encodeChallenge = useCallback((targetScore: number): string => {
    const encoded = btoa(JSON.stringify({ s: targetScore, t: Date.now() }));
    return `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
  }, []);

  // TASK 116: Decode challenge from URL
  const decodeChallenge = useCallback((encoded: string): number | null => {
    try {
      const decoded = JSON.parse(atob(encoded));
      return decoded.s || null;
    } catch {
      return null;
    }
  }, []);

  // TASK 120: Create text share format
  const createShareText = useCallback((): string => {
    const lines = [
      `🧩 Block Puzzle Score: ${score.toLocaleString()}`,
      `📊 Lines: ${totalLinesCleared} | Best Combo: ${bestCombo}x${perfectClears > 0 ? ` | Perfect: ${perfectClears}` : ''}`,
      ``,
      `Can you beat my score?`,
      `🎮 Play at wojak.ink/games`
    ];
    return lines.join('\n');
  }, [score, totalLinesCleared, bestCombo, perfectClears]);

  // TASK 115: Native share
  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: 'Block Puzzle Score',
      text: createShareText(),
      url: encodeChallenge(score),
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          showToast('Share failed', 'error');
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  }, [createShareText, encodeChallenge, score, showToast]);

  // TASK 121: Copy to clipboard
  const handleCopyLink = useCallback(async () => {
    hapticButton();
    const challengeUrl = encodeChallenge(score);
    try {
      await navigator.clipboard.writeText(challengeUrl);
      showToast('Challenge link copied!');
    } catch {
      showToast('Copy failed', 'error');
    }
  }, [encodeChallenge, score, showToast, hapticButton]);

  // TASK 121: Copy text to clipboard
  const handleCopyText = useCallback(async () => {
    hapticButton();
    try {
      await navigator.clipboard.writeText(createShareText());
      showToast('Copied to clipboard!');
    } catch {
      showToast('Copy failed', 'error');
    }
  }, [createShareText, showToast, hapticButton]);

  // TASK 122: Download share image
  const handleDownloadImage = useCallback(async () => {
    hapticButton();
    const imageUrl = await generateShareImage();
    const link = document.createElement('a');
    link.download = `block-puzzle-${score}.png`;
    link.href = imageUrl;
    link.click();
    showToast('Image downloaded!');
  }, [generateShareImage, score, showToast, hapticButton]);

  // TASK 114: Open share modal
  const openShareModal = useCallback(async () => {
    const imageUrl = await generateShareImage();
    setShareImageUrl(imageUrl);
    setShowShareModal(true);
  }, [generateShareImage]);

  // TASK 119: Celebrate challenge victory
  const celebrateChallengeVictory = useCallback(() => {
    setChallengeBeaten(true);
    showEpicCallout('CHALLENGE BEATEN!');
    triggerMassiveConfetti();
    playPerfectClearSound();
    triggerPerfectClearHaptic();
  }, [showEpicCallout, triggerMassiveConfetti, playPerfectClearSound, triggerPerfectClearHaptic]);

  // Helper: Count valid moves for all pieces
  const countValidMoves = useCallback((g: Grid, p: DraggablePiece[]): number => {
    let count = 0;
    p.forEach(piece => {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (canPlacePiece(g, piece.shape, row, col)) {
            count++;
          }
        }
      }
    });
    return count;
  }, []);

  // TASK 70: Update danger level based on grid fill
  useEffect(() => {
    if (gameState !== 'playing') return;

    const filledCells = countFilledCells(grid);
    const fillPercent = filledCells / 64;

    let newLevel: DangerLevel = 'safe';
    if (fillPercent >= DANGER_THRESHOLDS.imminent) {
      newLevel = 'imminent';
    } else if (fillPercent >= DANGER_THRESHOLDS.critical) {
      newLevel = 'critical';
    } else if (fillPercent >= DANGER_THRESHOLDS.warning) {
      newLevel = 'warning';
    }

    setDangerLevel(newLevel);
  }, [grid, gameState, countFilledCells]);

  // TASK 73: Calculate valid placement cells when in danger
  useEffect(() => {
    if (dangerLevel === 'safe' || gameState !== 'playing') {
      setValidPlacements(new Set());
      return;
    }

    // Only highlight in critical/imminent states
    if (dangerLevel === 'warning') {
      setValidPlacements(new Set());
      return;
    }

    const valid = new Set<string>();
    pieces.forEach(piece => {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (canPlacePiece(grid, piece.shape, row, col)) {
            // Mark cells this piece would occupy
            piece.shape.forEach((shapeRow, r) => {
              shapeRow.forEach((cell, c) => {
                if (cell) valid.add(`${row + r}-${col + c}`);
              });
            });
          }
        }
      }
    });
    setValidPlacements(valid);
  }, [grid, pieces, dangerLevel, gameState]);

  // TASK 75-76: Start/stop danger sound based on danger level
  useEffect(() => {
    if (gameState !== 'playing') {
      stopDangerSound();
      return;
    }

    if (dangerLevel !== 'safe') {
      startDangerSound();
    } else {
      stopDangerSound();
    }
  }, [dangerLevel, gameState, startDangerSound, stopDangerSound]);

  // TASK 77: Periodic danger haptic
  useEffect(() => {
    if (dangerHapticIntervalRef.current) {
      clearInterval(dangerHapticIntervalRef.current);
      dangerHapticIntervalRef.current = null;
    }

    if (dangerLevel === 'safe' || gameState !== 'playing') return;

    const interval = DANGER_HAPTIC_INTERVALS[dangerLevel];
    if (interval > 0) {
      dangerHapticIntervalRef.current = setInterval(() => {
        triggerDangerPulse();
      }, interval);
    }

    return () => {
      if (dangerHapticIntervalRef.current) {
        clearInterval(dangerHapticIntervalRef.current);
      }
    };
  }, [dangerLevel, gameState, triggerDangerPulse]);

  // TASK 78: Calculate moves left when in imminent danger
  useEffect(() => {
    if (dangerLevel === 'imminent' && gameState === 'playing') {
      const count = countValidMoves(grid, pieces);
      setMovesLeft(count <= 10 ? count : null);
    } else {
      setMovesLeft(null);
    }
  }, [grid, pieces, dangerLevel, gameState, countValidMoves]);

  // ============================================
  // PHASE 7: STREAK FIRE MODE FUNCTIONS
  // ============================================

  // TASK 85: Update streak on line clear or placement
  const updateStreak = useCallback((clearedLines: boolean) => {
    const now = Date.now();

    setStreakState(prev => {
      if (clearedLines) {
        const newCount = prev.count + 1;
        const isActive = newCount >= STREAK_CONFIG.activationThreshold;

        // TASK 85: Fire mode activation effects
        if (isActive && !prev.active) {
          playStreakFireSound();
          triggerStreakFireHaptic();
          triggerConfetti();
          showEpicCallout('STREAK FIRE!');
        }

        return {
          count: newCount,
          active: isActive,
          lastClearTime: now,
        };
      } else {
        // Placement without clear - reset streak
        return { count: 0, active: false, lastClearTime: 0 };
      }
    });
  }, [playStreakFireSound, triggerStreakFireHaptic, triggerConfetti, showEpicCallout]);

  // TASK 86: Streak timeout check
  useEffect(() => {
    if (streakState.count === 0 || gameState !== 'playing') {
      if (streakTimeoutRef.current) {
        clearTimeout(streakTimeoutRef.current);
        streakTimeoutRef.current = null;
      }
      return;
    }

    // Set timeout to reset streak
    if (streakTimeoutRef.current) {
      clearTimeout(streakTimeoutRef.current);
    }

    streakTimeoutRef.current = setTimeout(() => {
      setStreakState({ count: 0, active: false, lastClearTime: 0 });
    }, STREAK_CONFIG.timeout);

    return () => {
      if (streakTimeoutRef.current) {
        clearTimeout(streakTimeoutRef.current);
      }
    };
  }, [streakState.count, streakState.lastClearTime, gameState]);

  // TASK 87: Calculate streak bonus
  const calculateStreakBonus = useCallback((baseScore: number): number => {
    if (streakState.active) {
      return Math.floor(baseScore * STREAK_CONFIG.bonusMultiplier);
    }
    return baseScore;
  }, [streakState.active]);

  // TASK 92: Fire particles during streak
  useEffect(() => {
    if (!streakState.active || gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Random fire particle from bottom edges of grid
      const side = Math.random() > 0.5;
      const x = side ? Math.random() * GRID_SIZE * 0.3 : GRID_SIZE - Math.random() * GRID_SIZE * 0.3;
      const y = GRID_SIZE;

      const fireParticle: ClearParticle = {
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: -3 - Math.random() * 3,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.3 ? '#ff6b00' : '#ffcc00',
        alpha: 0.8,
        rotation: 0,
        rotationSpeed: 0,
      };

      setClearParticles(prev => [...prev, fireParticle]);
    }, 120);

    return () => clearInterval(interval);
  }, [streakState.active, gameState, GRID_SIZE]);

  // TASK 103: Combo timeout bar animation
  useEffect(() => {
    if (!showCombo || combo < 2 || gameState !== 'playing') {
      setComboTimeLeft(100);
      return;
    }

    // Update time remaining every 30ms for smooth animation
    const interval = setInterval(() => {
      const elapsed = Date.now() - comboStartTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / COMBO_TIMEOUT_MS) * 100);
      setComboTimeLeft(remaining);
    }, 30);

    return () => clearInterval(interval);
  }, [showCombo, combo, gameState, COMBO_TIMEOUT_MS]);

  // TASK 117: Check for challenge on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('challenge');
    if (challengeParam) {
      const targetScore = decodeChallenge(challengeParam);
      if (targetScore) {
        setChallengeTarget(targetScore);
      }
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [decodeChallenge]);

  // TASK 125: Track best combo
  useEffect(() => {
    if (combo > bestCombo) {
      setBestCombo(combo);
    }
  }, [combo, bestCombo]);

  // TASK 119: Check if challenge is beaten
  useEffect(() => {
    if (challengeTarget && score > challengeTarget && !challengeBeaten && gameState === 'playing') {
      celebrateChallengeVictory();
    }
  }, [score, challengeTarget, challengeBeaten, gameState, celebrateChallengeVictory]);

  // Start new game
  const startGame = useCallback(() => {
    if (soundEnabled) playGameStart();
    hapticButton();
    const newGrid = createEmptyGrid();
    const newPieces = generateThreePieces();
    setGrid(newGrid);
    setPieces(newPieces);
    gridStateRef.current = newGrid;
    piecesRef.current = newPieces;
    setScore(0);
    setTotalLinesCleared(0);
    setTotalBlocksPlaced(0);
    setGameStartTime(Date.now());
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    setIsPaused(false);
    setDraggedPieceId(null);
    setPreviewPosition(null);
    draggedPieceIdRef.current = null;
    previewPositionRef.current = null;
    // Reset effect states
    setShakeLevel('none');
    setFloatingScores([]);
    setCombo(0);
    setShowCombo(false);
    setNewPieceId(null);
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = null;
    }
    // Reset Phase 3 states
    setFreezeFrame(false);
    setClearParticles([]);
    setShockwaves([]);
    setScreenFlash(null);
    if (freezeTimeoutRef.current) {
      clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = null;
    }
    // Reset Phase 4 states
    setTrailParticles([]);
    lastTrailPosRef.current = { x: 0, y: 0 };
    setIsSnapped(false);
    prevSnappedRef.current = false;
    // TASK 82: Reset Phase 6 danger states
    setDangerLevel('safe');
    setValidPlacements(new Set());
    setMovesLeft(null);
    stopDangerSound();
    if (dangerHapticIntervalRef.current) {
      clearInterval(dangerHapticIntervalRef.current);
      dangerHapticIntervalRef.current = null;
    }
    // TASK 94: Reset Phase 7 streak states
    setStreakState({ count: 0, active: false, lastClearTime: 0 });
    if (streakTimeoutRef.current) {
      clearTimeout(streakTimeoutRef.current);
      streakTimeoutRef.current = null;
    }
    // Reset Phase 8 perfect clear states
    setPerfectClears(0);
    setShowPerfectClear(false);
    // Reset Phase 9 combo visualization states
    setComboTimeLeft(100);
    comboStartTimeRef.current = 0;
    setComboShake(false);
    setLostCombo(null);
    // TASK 126: Reset Phase 10 share states
    setBestCombo(0);
    setShowShareModal(false);
    setShareImageUrl(null);
    setChallengeBeaten(false);
    // Note: Don't reset challengeTarget - keep the challenge active across games
    resetAllEffects();
    setGameState('playing');
  }, [soundEnabled, playGameStart, hapticButton, resetAllEffects, stopDangerSound]);

  // Auto-start on mount
  useEffect(() => {
    if (gameState === 'idle') {
      startGame();
    }
  }, []);

  // Submit score
  const submitScoreGlobal = useCallback(async (finalScore: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('blockPuzzleHighScore', String(finalScore));
      setIsNewPersonalBest(true);
    }

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, null, {
      linesCleared: totalLinesCleared,
      blocksPlaced: totalBlocksPlaced,
      playTime: Date.now() - gameStartTime,
    });

    if (result.success) {
      console.log('[BlockPuzzle] Score submitted:', result);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, highScore, totalLinesCleared, totalBlocksPlaced, gameStartTime]);

  // Handle game over
  const handleGameOver = useCallback((currentScore: number) => {
    if (soundEnabled) playGameOver();
    hapticGameOver();
    setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
    setGameState('gameover');

    if (isSignedIn && currentScore > 0) {
      submitScoreGlobal(currentScore);
    }
  }, [soundEnabled, playGameOver, hapticGameOver, isSignedIn, submitScoreGlobal]);

  // Get cells that would be covered by piece at preview position
  const getPreviewCells = useCallback((row: number, col: number, piece: DraggablePiece | undefined): Set<string> => {
    const cells = new Set<string>();
    if (!piece) return cells;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] === 1) {
          cells.add(`${row + r}-${col + c}`);
        }
      }
    }
    return cells;
  }, []);

  // Place piece on grid
  const attemptPlacement = useCallback((pieceId: string, row: number, col: number) => {
    const piece = getPieceById(pieceId);
    const currentGrid = gridStateRef.current;

    if (!piece) {
      console.log('[BlockPuzzle] Piece not found:', pieceId);
      return false;
    }

    if (!canPlacePiece(currentGrid, piece.shape, row, col)) {
      console.log('[BlockPuzzle] Cannot place at:', row, col);
      return false;
    }

    // Place the piece
    const { newGrid, placedCells } = placePiece(currentGrid, piece.shape, row, col, piece.color);

    // Calculate blocks placed
    const blocksInPiece = piece.shape.flat().filter(c => c === 1).length;
    setTotalBlocksPlaced(prev => prev + blocksInPiece);

    // TASK 12 & 19: Play snap sound and double-tap haptic confirmation
    playSnapSound();
    triggerSnapHaptic();

    // PHASE 5: Placement feedback
    // TASK 64: Mini screen shake on placement
    triggerMiniShake();

    // TASK 59-60: Create corner impact particles
    createPlacementParticles(placedCells, piece.color);

    // TASK 63: Show placed animation with bounce
    setJustPlacedCells(new Set(placedCells));
    setTimeout(() => setJustPlacedCells(new Set()), 300);

    // Add base points
    const basePoints = blocksInPiece * 10;

    // Show floating score for base points
    const gridRect = gridRef.current?.getBoundingClientRect();
    if (gridRect) {
      showFloatingScore(basePoints, gridRect.left + gridRect.width / 2, gridRect.top + gridRect.height / 2, false);
    }

    // Check for line clears
    const { clearedGrid, linesCleared, cellsCleared } = clearLines(newGrid);

    // Update score
    let newScore = score + basePoints;

    if (linesCleared > 0) {
      // Show clearing animation
      setClearingCells(cellsCleared);

      // Increment combo
      const newCombo = combo + 1;
      setCombo(newCombo);
      setShowCombo(true);

      // TASK 103 & 110: Reset combo timer and trigger shake on increment
      comboStartTimeRef.current = Date.now();
      setComboTimeLeft(100);
      if (newCombo >= 2) {
        setComboShake(true);
        setTimeout(() => setComboShake(false), 300);
      }

      // Clear combo timer and set new one
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      // TASK 16: Combo timeout with break sound
      comboTimeoutRef.current = setTimeout(() => {
        playComboBreakSound(newCombo);
        // TASK 111: Show lost combo notification
        if (newCombo >= 2) {
          setLostCombo(newCombo);
          setTimeout(() => setLostCombo(null), 1500);
        }
        setCombo(0);
        setShowCombo(false);
      }, 3000);

      // Calculate points with combo multiplier
      const linePoints = linesCleared * 100;
      const lineComboMultiplier = linesCleared >= 2 ? linesCleared : 1;
      const comboBonus = newCombo >= 2 ? Math.min(newCombo, 5) : 1;
      let totalPoints = linePoints * lineComboMultiplier * comboBonus;

      // TASK 85 & 87: Update streak and apply bonus
      updateStreak(true);
      totalPoints = calculateStreakBonus(totalPoints);
      newScore += totalPoints;

      // TASK 36: Enhanced screen shake based on lines cleared
      const shakeConfig = SHAKE_CONFIG[Math.min(linesCleared, 4)];
      if (linesCleared === 1) {
        setShakeLevel('light');
      } else if (linesCleared === 2) {
        setShakeLevel('medium');
      } else if (linesCleared >= 3) {
        setShakeLevel('heavy');
      }
      setTimeout(() => setShakeLevel('none'), shakeConfig.duration);

      // TASK 29: Trigger freeze frame on 2+ line clears
      const freezeDuration = FREEZE_DURATIONS[Math.min(linesCleared, 4)];
      if (freezeDuration > 0) {
        triggerFreezeFrame(freezeDuration);
      }

      // TASK 39: Screen flash on 3+ line clears
      if (linesCleared >= 3) {
        triggerScreenFlash('rgba(255, 200, 0, 0.4)');
      }

      // TASK 38 & 32: Create particle bursts from cleared cells
      const clearedCellsArray = Array.from(cellsCleared).map(key => {
        const [r, c] = key.split('-').map(Number);
        return { row: r, col: c };
      });
      createLineClearBurst(clearedCellsArray, piece.color);

      // TASK 41: Trigger shockwave from grid center on 2+ lines
      if (linesCleared >= 2 && gridRect) {
        const gridCenterX = gridRect.width / 2;
        const gridCenterY = gridRect.height / 2;
        triggerShockwave(gridCenterX, gridCenterY, 250 + linesCleared * 50);
      }

      setTimeout(() => {
        // Clear animation
        setClearingCells(new Set());
        setGrid(clearedGrid);
        gridStateRef.current = clearedGrid;
        setTotalLinesCleared(prev => prev + linesCleared);

        // TASK 98: Check for perfect clear after line clears
        if (checkPerfectClear(clearedGrid)) {
          // TASK 96 & 101: Award bonus and track perfect clear
          newScore += PERFECT_CLEAR_BONUS;
          setScore(s => s + PERFECT_CLEAR_BONUS);
          setPerfectClears(prev => prev + 1);
          triggerPerfectClear();

          // Show perfect clear bonus in floating score
          if (gridRect) {
            setTimeout(() => {
              showFloatingScore(PERFECT_CLEAR_BONUS, gridRect.left + gridRect.width / 2, gridRect.top + gridRect.height / 2, true);
            }, 300);
          }
        }

        // Show floating score for line clear bonus
        // TASK 107: Include multiplier text if combo is active
        if (gridRect) {
          const multiplierText = newCombo >= 2 ? `×${Math.min(newCombo, 5)}` : undefined;
          showFloatingScore(totalPoints, gridRect.left + gridRect.width / 2, gridRect.top + gridRect.height / 3, true, multiplierText);
        }

        // TASK 42: Epic callout with clear messages
        const calloutMessage = newCombo >= 2
          ? `${newCombo}x COMBO!`
          : CLEAR_CALLOUTS[Math.min(linesCleared, 5)] || '';

        // TASK 13: Effects based on lines cleared with musical scale
        // Play line clear sound + combo note
        playLineClearSound(linesCleared);
        playComboNote(newCombo);

        // TASK 26: Line-specific haptic patterns
        if (linesCleared === 1) {
          triggerLineClearHaptic(1);
          triggerBigMoment({
            shockwave: true,
            score: totalPoints,
            x: 50,
            y: 50,
          });
        } else if (linesCleared === 2) {
          triggerLineClearHaptic(2);
          if (calloutMessage) showEpicCallout(calloutMessage);
          triggerBigMoment({
            shockwave: true,
            sparks: true,
            shake: true,
            score: totalPoints,
            emoji: '🔥',
            x: 50,
            y: 50,
          });
        } else if (linesCleared === 3) {
          triggerLineClearHaptic(3);
          if (calloutMessage) showEpicCallout(calloutMessage);
          triggerConfetti();
          triggerBigMoment({
            shockwave: true,
            sparks: true,
            shake: true,
            vignette: true,
            score: totalPoints,
            emoji: '💥',
            x: 50,
            y: 50,
          });
        } else if (linesCleared >= 4) {
          triggerLineClearHaptic(4);
          if (calloutMessage) showEpicCallout(calloutMessage);
          triggerConfetti();
          triggerBigMoment({
            shockwave: true,
            sparks: true,
            shake: true,
            vignette: true,
            score: totalPoints,
            emoji: '⚡',
            x: 50,
            y: 50,
          });
        }
      }, 500 + freezeDuration);

      // Update grid immediately for visual feedback
      setGrid(newGrid);
      gridStateRef.current = newGrid;
    } else {
      // Reset combo if no lines cleared
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      // TASK 16: Combo timeout with break sound (only if combo was active)
      const currentCombo = combo;
      comboTimeoutRef.current = setTimeout(() => {
        if (currentCombo > 0) {
          playComboBreakSound(currentCombo);
          // TASK 111: Show lost combo notification
          if (currentCombo >= 2) {
            setLostCombo(currentCombo);
            setTimeout(() => setLostCombo(null), 1500);
          }
        }
        setCombo(0);
        setShowCombo(false);
      }, 3000);

      // TASK 85: Reset streak on placement without clear
      updateStreak(false);

      setGrid(newGrid);
      gridStateRef.current = newGrid;
    }

    setScore(newScore);

    // TASK 14: Replace used piece with spawn animation and sound
    const spawnedPiece = generateRandomPiece();
    playSpawnSound();
    setNewPieceId(spawnedPiece.id);
    setTimeout(() => setNewPieceId(null), 500);

    const newPieces = piecesRef.current.map(p =>
      p.id === pieceId ? spawnedPiece : p
    );
    setPieces(newPieces);
    piecesRef.current = newPieces;

    // Check game over after a tick (to let state update)
    setTimeout(() => {
      const finalGrid = linesCleared > 0 ? clearedGrid : newGrid;
      if (isGameOver(finalGrid, newPieces)) {
        handleGameOver(newScore);
      }
    }, linesCleared > 0 ? 600 : 100);

    return true;
  }, [score, combo, soundEnabled, getPieceById, playSnapSound, playLineClearSound, playComboNote, playSpawnSound, playComboBreakSound, triggerSnapHaptic, triggerLineClearHaptic, triggerMiniShake, createPlacementParticles, triggerBigMoment, triggerConfetti, showEpicCallout, showFloatingScore, handleGameOver, triggerFreezeFrame, triggerScreenFlash, createLineClearBurst, triggerShockwave, updateStreak, calculateStreakBonus, checkPerfectClear, triggerPerfectClear, CELL_SIZE]);

  // Calculate grid position from screen coordinates
  const calculateGridPosition = useCallback((clientX: number, clientY: number, pieceId: string | null) => {
    const gridElement = gridRef.current;
    if (!gridElement || !pieceId) return null;

    const piece = getPieceById(pieceId);
    if (!piece) return null;

    const rect = gridElement.getBoundingClientRect();
    const pieceWidth = piece.shape[0].length;
    const pieceHeight = piece.shape.length;

    // Calculate which cell the center of the piece would be in
    const col = Math.floor((clientX - rect.left) / CELL_SIZE - pieceWidth / 2 + 0.5);
    const row = Math.floor((clientY - rect.top) / CELL_SIZE - pieceHeight / 2 + 0.5);

    return { row, col };
  }, [CELL_SIZE, getPieceById]);

  // ============================================
  // TOUCH HANDLERS
  // ============================================
  const handleTouchStart = (e: React.TouchEvent, pieceId: string) => {
    if (gameState !== 'playing' || isPaused) return;

    const piece = getPieceById(pieceId);
    if (!piece || !canPlaceAnywhere(gridStateRef.current, piece)) return;

    // Don't preventDefault on touchstart - it's passive by default
    // preventDefault is handled in native touchmove/touchend listeners
    // TASK 24: Ultra-light tick on drag start
    triggerDragStartHaptic();

    setDraggedPieceId(pieceId);
    draggedPieceIdRef.current = pieceId;

    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY - 80 });
  };

  // Native touch move/end handlers (to use passive: false)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      const pieceId = draggedPieceIdRef.current;
      if (!pieceId || gameState !== 'playing') return;

      e.preventDefault();

      const touch = e.touches[0];
      // Position the floating piece above the finger
      const dragX = touch.clientX;
      const dragY = touch.clientY - 80;
      setDragPosition({ x: dragX, y: dragY });

      // TASK 48: Emit trail particle on drag move
      const piece = getPieceById(pieceId);
      if (piece) {
        emitTrailParticle(dragX, dragY, piece.color);
      }

      // Calculate grid position (use the visual position, not finger position)
      const gridPos = calculateGridPosition(dragX, dragY, pieceId);
      if (gridPos) {
        setPreviewPosition(gridPos);
        previewPositionRef.current = gridPos;

        // TASK 56: Check snap and trigger haptic on snap detection
        if (piece && canPlacePiece(gridStateRef.current, piece.shape, gridPos.row, gridPos.col)) {
          if (!prevSnappedRef.current) {
            triggerSnapHaptic();
            prevSnappedRef.current = true;
          }
          setIsSnapped(true);
        } else {
          prevSnappedRef.current = false;
          setIsSnapped(false);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const pieceId = draggedPieceIdRef.current;
      const pos = previewPositionRef.current;

      if (pieceId && pos && gameState === 'playing') {
        e.preventDefault();
        const piece = getPieceById(pieceId);
        if (piece && canPlacePiece(gridStateRef.current, piece.shape, pos.row, pos.col)) {
          attemptPlacement(pieceId, pos.row, pos.col);
        } else if (piece && pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8) {
          // TASK 15 & 25: Play invalid sound and haptic when placement fails
          playInvalidSound();
          triggerInvalidHaptic();
        }
      }

      // TASK 49: Clear trail particles on drag end
      clearTrailParticles();
      prevSnappedRef.current = false;
      setIsSnapped(false);

      // Reset drag state
      setDraggedPieceId(null);
      setPreviewPosition(null);
      draggedPieceIdRef.current = null;
      previewPositionRef.current = null;
    };

    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, calculateGridPosition, getPieceById, attemptPlacement, emitTrailParticle, clearTrailParticles, triggerSnapHaptic, playInvalidSound, triggerInvalidHaptic]);

  // ============================================
  // MOUSE HANDLERS (Desktop)
  // ============================================
  const handleMouseDown = (e: React.MouseEvent, pieceId: string) => {
    if (gameState !== 'playing' || isPaused) return;

    const piece = getPieceById(pieceId);
    if (!piece || !canPlaceAnywhere(gridStateRef.current, piece)) return;

    e.preventDefault();
    // TASK 24: Ultra-light tick on drag start
    triggerDragStartHaptic();

    setDraggedPieceId(pieceId);
    draggedPieceIdRef.current = pieceId;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pieceId = draggedPieceIdRef.current;
      if (!pieceId || gameState !== 'playing') return;

      const dragX = e.clientX;
      const dragY = e.clientY;
      setDragPosition({ x: dragX, y: dragY });

      // TASK 48: Emit trail particle on drag move
      const piece = getPieceById(pieceId);
      if (piece) {
        emitTrailParticle(dragX, dragY, piece.color);
      }

      const gridPos = calculateGridPosition(dragX, dragY, pieceId);
      if (gridPos) {
        setPreviewPosition(gridPos);
        previewPositionRef.current = gridPos;

        // TASK 56: Check snap and trigger haptic on snap detection
        if (piece && canPlacePiece(gridStateRef.current, piece.shape, gridPos.row, gridPos.col)) {
          if (!prevSnappedRef.current) {
            triggerSnapHaptic();
            prevSnappedRef.current = true;
          }
          setIsSnapped(true);
        } else {
          prevSnappedRef.current = false;
          setIsSnapped(false);
        }
      }
    };

    const handleMouseUp = () => {
      const pieceId = draggedPieceIdRef.current;
      const pos = previewPositionRef.current;

      if (pieceId && pos && gameState === 'playing') {
        const piece = getPieceById(pieceId);
        if (piece && canPlacePiece(gridStateRef.current, piece.shape, pos.row, pos.col)) {
          attemptPlacement(pieceId, pos.row, pos.col);
        } else if (piece && pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8) {
          // TASK 15 & 25: Play invalid sound and haptic when placement fails
          playInvalidSound();
          triggerInvalidHaptic();
        }
      }

      // TASK 49: Clear trail particles on drag end
      clearTrailParticles();
      prevSnappedRef.current = false;
      setIsSnapped(false);

      // Reset drag state
      setDraggedPieceId(null);
      setPreviewPosition(null);
      draggedPieceIdRef.current = null;
      previewPositionRef.current = null;
    };

    if (draggedPieceId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedPieceId, gameState, calculateGridPosition, getPieceById, attemptPlacement, emitTrailParticle, clearTrailParticles, triggerSnapHaptic, playInvalidSound, triggerInvalidHaptic]);

  // Get preview cells for current drag
  const previewCells = draggedPieceId && previewPosition
    ? getPreviewCells(previewPosition.row, previewPosition.col, getPieceById(draggedPieceId))
    : new Set<string>();

  const previewValid = draggedPieceId && previewPosition
    ? canPlacePiece(grid, getPieceById(draggedPieceId)?.shape || [[]], previewPosition.row, previewPosition.col)
    : false;

  // ============================================
  // RENDER - Updated with high-impact effects
  // ============================================
  return (
    <div
      ref={containerRef}
      className={`block-puzzle-container ${isMobile ? 'mobile' : 'desktop'}`}
    >
      {/* Control Buttons */}
      <button
        className="bp-back-btn"
        onClick={() => navigate('/games')}
        aria-label="Back to games"
      >
        <IonIcon icon={arrowBack} />
      </button>

      <button
        className="bp-sound-btn"
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
      </button>

      {gameState === 'playing' && (
        <button
          className="bp-pause-btn"
          onClick={togglePause}
          aria-label={isPaused ? 'Resume game' : 'Pause game'}
        >
          <IonIcon icon={isPaused ? play : pause} />
        </button>
      )}

      {/* Pause Overlay */}
      {isPaused && gameState === 'playing' && (
        <div className="bp-pause-overlay">
          <div className="bp-pause-content">
            <h2>Paused</h2>
            <div className="bp-pause-score">Score: {score}</div>
            <button onClick={togglePause} className="bp-resume-btn">
              Resume
            </button>
            <button onClick={() => navigate('/games')} className="bp-quit-btn">
              Quit Game
            </button>
          </div>
        </div>
      )}

      {/* Visual Effects */}
      <GameEffects effects={effects} accentColor="#ff6b00" />

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="bp-game-over-overlay" onClick={(e) => e.stopPropagation()}>
          {/* Main Game Over Content - stays fixed */}
          <div className="bp-game-over-content">
            <div className="bp-game-over-left">
              {sadImage ? (
                <img src={sadImage} alt="Game Over" className="bp-sad-image" />
              ) : (
                <div className="bp-game-over-emoji">🧩</div>
              )}
            </div>
            <div className="bp-game-over-right">
              <h2 className="bp-game-over-title">Game Over!</h2>
              <div className="bp-game-over-reason">No moves left</div>

              <div className="bp-game-over-score">
                <span className="bp-score-value">{score}</span>
                <span className="bp-score-label">points</span>
              </div>

              <div className="bp-game-over-stats">
                <div className="bp-stat">
                  <span className="bp-stat-value">{totalLinesCleared}</span>
                  <span className="bp-stat-label">lines</span>
                </div>
                <div className="bp-stat">
                  <span className="bp-stat-value">{totalBlocksPlaced}</span>
                  <span className="bp-stat-label">blocks</span>
                </div>
                {/* Show best combo if achieved */}
                {bestCombo >= 2 && (
                  <div className="bp-stat bp-stat-combo">
                    <span className="bp-stat-value">{bestCombo}x</span>
                    <span className="bp-stat-label">combo</span>
                  </div>
                )}
                {/* TASK 102: Show perfect clears in game over */}
                {perfectClears > 0 && (
                  <div className="bp-stat bp-stat-perfect">
                    <span className="bp-stat-value">{perfectClears}</span>
                    <span className="bp-stat-label">perfect</span>
                  </div>
                )}
              </div>
              {/* Play time */}
              <div className="bp-game-over-time">
                {Math.floor((Date.now() - gameStartTime) / 60000)}:{String(Math.floor(((Date.now() - gameStartTime) % 60000) / 1000)).padStart(2, '0')}
              </div>

              {(isNewPersonalBest || score > highScore) && score > 0 && (
                <div className="bp-new-record">New Personal Best!</div>
              )}

              {isSignedIn && (
                <div className="bp-submitted">
                  {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}

              {/* Buttons: Play Again + Share + Leaderboard */}
              <div className="bp-game-over-buttons">
                <button onClick={startGame} className="bp-play-btn">
                  Play Again
                </button>
                {/* TASK 124: Share button */}
                <button onClick={openShareModal} className="bp-share-btn">
                  Share
                </button>
                <button
                  onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                  className="bp-leaderboard-btn"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Panel - overlays on top */}
          {showLeaderboardPanel && (
            <div className="bp-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
              <div className="bp-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                <div className="bp-leaderboard-header">
                  <h3>Leaderboard</h3>
                  <button className="bp-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                </div>
                <div className="bp-leaderboard-list">
                  {Array.from({ length: 10 }, (_, index) => {
                    const entry = globalLeaderboard[index];
                    const isCurrentUser = entry && score === entry.score;
                    return (
                      <div key={index} className={`bp-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                        <span className="bp-leaderboard-rank">#{index + 1}</span>
                        <span className="bp-leaderboard-name">{entry?.displayName || '---'}</span>
                        <span className="bp-leaderboard-score">{entry?.score ?? '-'}</span>
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
            className="bp-back-to-games-btn"
          >
            Back to Games
          </button>
        </div>
      )}

      {/* Score Panel */}
      {gameState === 'playing' && (
        <div className={`bp-score-panel ${streakState.active ? 'streak-active' : ''}`}>
          <div className="bp-score-main">
            <span className="bp-score-value">{score}</span>
            <span className="bp-score-label">Score</span>
          </div>
          <div className="bp-score-secondary">
            <span>Lines: {totalLinesCleared}</span>
            {bestCombo >= 2 && <span>Combo: {bestCombo}x</span>}
            <span>Best: {Math.max(highScore, score)}</span>
          </div>
        </div>
      )}

      {/* TASK 90: Streak Meter */}
      {gameState === 'playing' && streakState.count > 0 && (
        <div className={`bp-streak-meter ${streakState.active ? 'active' : ''}`}>
          <div className="bp-streak-label">
            {streakState.active ? '🔥 STREAK FIRE!' : `🔥 ${streakState.count}/${STREAK_CONFIG.activationThreshold}`}
          </div>
          <div className="bp-streak-bar">
            <div
              className="bp-streak-fill"
              style={{ width: `${Math.min(100, (streakState.count / STREAK_CONFIG.activationThreshold) * 100)}%` }}
            />
          </div>
          {streakState.active && (
            <div className="bp-streak-bonus">×{STREAK_CONFIG.bonusMultiplier} BONUS!</div>
          )}
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div
          ref={gridRef}
          className={`bp-game-grid ${shakeLevel !== 'none' ? `screen-shake-${shakeLevel}` : ''} ${draggedPieceId ? 'active' : ''} ${freezeFrame ? 'freeze-frame' : ''} ${dangerLevel !== 'safe' ? `bp-danger-${dangerLevel}` : ''} ${streakState.active ? 'bp-streak-fire' : ''}`}
          style={{
            width: GRID_SIZE,
            height: GRID_SIZE,
          }}
        >
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const cellKey = `${rowIdx}-${colIdx}`;
              const isPreview = previewCells.has(cellKey);
              const isClearing = clearingCells.has(cellKey);
              const isJustPlaced = justPlacedCells.has(cellKey);
              // TASK 73: Valid placement highlight in danger state
              const isValidPlacement = !cell.filled && validPlacements.has(cellKey);

              return (
                <div
                  key={cellKey}
                  className={`bp-grid-cell ${cell.filled ? 'filled' : ''} ${
                    isPreview ? (previewValid ? 'preview' : 'preview-invalid') : ''
                  } ${isClearing ? 'clearing' : ''} ${isJustPlaced ? 'just-placed' : ''} ${isValidPlacement ? 'valid-placement' : ''}`}
                  style={{
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    background: cell.filled ? cell.color : undefined,
                  }}
                />
              );
            })
          )}
          {/* TASK 30: Shockwave effects layer */}
          {shockwaves.map(sw => (
            <div
              key={sw.id}
              className="bp-shockwave"
              style={{
                left: sw.x,
                top: sw.y,
                width: sw.size,
                height: sw.size,
                opacity: sw.alpha,
              }}
            />
          ))}

          {/* TASK 34: Particle layer for line clear bursts */}
          <div className="bp-particle-layer">
            {clearParticles.map(p => (
              <div
                key={p.id}
                className="bp-clear-particle"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  opacity: p.alpha,
                  transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* TASK 40: Screen flash on big clears */}
      {screenFlash && (
        <div
          className="bp-screen-flash"
          style={{ backgroundColor: screenFlash }}
        />
      )}

      {/* TASK 103 & 105: Enhanced Combo Display with Timeout Bar */}
      {showCombo && combo >= 2 && gameState === 'playing' && (
        <div className={`bp-combo-display combo-${Math.min(combo, 5)} ${comboShake ? 'shake' : ''}`}>
          <div className="bp-combo-multiplier">{combo}x</div>
          <div className="bp-combo-text">COMBO</div>
          {/* TASK 105: Show multiplier bonus */}
          <div className="bp-combo-bonus">×{Math.min(combo, 5)} pts</div>
          {/* TASK 103: Timeout bar */}
          <div className="bp-combo-timeout-bar">
            <div
              className="bp-combo-timeout-fill"
              style={{ width: `${comboTimeLeft}%` }}
            />
          </div>
        </div>
      )}

      {/* TASK 111: Lost Combo Notification */}
      {lostCombo !== null && (
        <div className="bp-lost-combo">
          <span className="bp-lost-combo-value">{lostCombo}x</span>
          <span className="bp-lost-combo-text">combo lost!</span>
        </div>
      )}

      {/* TASK 79: Moves Left Warning */}
      {movesLeft !== null && movesLeft <= 8 && gameState === 'playing' && (
        <div className={`bp-moves-warning ${movesLeft <= 3 ? 'critical' : ''}`}>
          {movesLeft === 0 ? 'No moves!' : `${movesLeft} move${movesLeft !== 1 ? 's' : ''} left!`}
        </div>
      )}

      {/* Danger Vignette Overlay */}
      {dangerLevel !== 'safe' && gameState === 'playing' && (
        <div className={`bp-danger-vignette bp-vignette-${dangerLevel}`} />
      )}

      {/* TASK 100: Perfect Clear Flash Overlay */}
      {showPerfectClear && (
        <div className="bp-perfect-clear-overlay">
          <div className="bp-perfect-clear-text">PERFECT CLEAR!</div>
          <div className="bp-perfect-clear-bonus">+{PERFECT_CLEAR_BONUS} BONUS</div>
        </div>
      )}

      {/* Piece Rack */}
      {gameState === 'playing' && (
        <div className="bp-piece-rack">
          {pieces.map(piece => {
            const canPlace = canPlaceAnywhere(grid, piece);
            const isDragging = draggedPieceId === piece.id;
            const isSpawning = piece.id === newPieceId;

            // Calculate scaling for uniform visual appearance
            const pieceWidth = piece.shape[0].length;
            const pieceHeight = piece.shape.length;
            const maxDimension = Math.max(pieceWidth, pieceHeight);
            // Scale larger pieces down to fit uniformly in slot
            const targetSize = isMobile ? 65 : 75;
            const naturalSize = maxDimension * (PIECE_CELL_SIZE + 1);
            const scaleFactor = maxDimension <= 2 ? 1 : Math.min(1, targetSize / naturalSize);

            return (
              <div
                key={piece.id}
                className={`bp-piece-slot ${!canPlace ? 'disabled' : ''} ${isDragging ? 'dragging' : ''} ${isSpawning ? 'spawning' : ''} ${streakState.active ? 'bp-streak-fire' : ''}`}
                onMouseDown={(e) => handleMouseDown(e, piece.id)}
                onTouchStart={(e) => handleTouchStart(e, piece.id)}
              >
                <div
                  className="bp-piece-preview"
                  style={{ transform: `scale(${scaleFactor})` }}
                >
                  {piece.shape.map((row, rowIdx) => (
                    <div key={rowIdx} className="bp-piece-row">
                      {row.map((cell, colIdx) => (
                        <div
                          key={colIdx}
                          className={`bp-piece-cell ${cell ? 'filled' : ''}`}
                          style={{
                            width: PIECE_CELL_SIZE,
                            height: PIECE_CELL_SIZE,
                            background: cell ? piece.color : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TASK 46: Trail Particle Layer */}
      {trailParticles.length > 0 && (
        <div className="bp-trail-particle-layer">
          {trailParticles.map(p => (
            <div
              key={p.id}
              className="bp-trail-particle"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.alpha,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Drag Preview */}
      {draggedPieceId && (
        <div
          className={`bp-drag-preview ${isSnapped ? 'snapped' : ''}`}
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {(() => {
            const piece = getPieceById(draggedPieceId);
            if (!piece) return null;
            return (
              <div className="bp-piece-preview floating">
                {piece.shape.map((row, rowIdx) => (
                  <div key={rowIdx} className="bp-piece-row">
                    {row.map((cell, colIdx) => (
                      <div
                        key={colIdx}
                        className={`bp-piece-cell ${cell ? 'filled' : ''}`}
                        style={{
                          width: CELL_SIZE - 4,
                          height: CELL_SIZE - 4,
                          background: cell ? piece.color : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Scores */}
      {floatingScores.map(score => (
        <div
          key={score.id}
          className={`bp-floating-score ${score.isBig ? 'big' : ''}`}
          style={{
            left: score.x,
            top: score.y,
          }}
        >
          +{score.value}
          {/* TASK 107: Show multiplier if present */}
          {score.multiplier && <span className="bp-floating-multiplier">{score.multiplier}</span>}
        </div>
      ))}

      {/* TASK 118: Challenge Target Banner */}
      {challengeTarget && gameState === 'playing' && !challengeBeaten && (
        <div className="bp-challenge-banner">
          <span className="bp-challenge-label">Challenge:</span>
          <span className="bp-challenge-target">Beat {challengeTarget.toLocaleString()} pts</span>
          <span className="bp-challenge-progress">
            {score >= challengeTarget ? '✅' : `${Math.floor((score / challengeTarget) * 100)}%`}
          </span>
        </div>
      )}

      {/* Challenge beaten banner */}
      {challengeBeaten && gameState === 'playing' && (
        <div className="bp-challenge-banner beaten">
          <span>🏆 Challenge Beaten!</span>
        </div>
      )}

      {/* TASK 114: Share Modal */}
      {showShareModal && (
        <div className="bp-share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="bp-share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="bp-share-close" onClick={() => setShowShareModal(false)}>×</button>
            <h2 className="bp-share-title">Share Your Score</h2>

            {/* Preview image */}
            {shareImageUrl && (
              <div className="bp-share-preview">
                <img src={shareImageUrl} alt="Score card" />
              </div>
            )}

            {/* Share buttons */}
            <div className="bp-share-actions">
              {navigator.share && (
                <button onClick={handleNativeShare} className="bp-share-action-btn primary">
                  📤 Share
                </button>
              )}
              <button onClick={handleCopyLink} className="bp-share-action-btn">
                🔗 Copy Link
              </button>
              <button onClick={handleCopyText} className="bp-share-action-btn">
                📋 Copy Text
              </button>
              <button onClick={handleDownloadImage} className="bp-share-action-btn">
                💾 Save Image
              </button>
            </div>

            {/* Challenge link preview */}
            <div className="bp-share-challenge-info">
              <p>Challenge your friends to beat your score!</p>
            </div>
          </div>
        </div>
      )}

      {/* TASK 127: Toast Notification */}
      {toast && (
        <div className={`bp-toast ${toast.type}`}>
          {toast.message}
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

export default BlockPuzzle;
