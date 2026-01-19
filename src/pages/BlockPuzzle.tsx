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
  }>>([]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [newPieceId, setNewPieceId] = useState<string | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  const showFloatingScore = useCallback((value: number, x: number, y: number, isBig = false) => {
    const id = `score-${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x, y, isBig }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1000);
  }, []);

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
    resetAllEffects();
    setGameState('playing');
  }, [soundEnabled, playGameStart, hapticButton, resetAllEffects]);

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

    // Play sound and haptic
    if (soundEnabled) playBlockLand();
    hapticScore();

    // Show placed animation
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

      // Clear combo timer and set new one
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(0);
        setShowCombo(false);
      }, 3000);

      // Calculate points with combo multiplier
      const linePoints = linesCleared * 100;
      const lineComboMultiplier = linesCleared >= 2 ? linesCleared : 1;
      const comboBonus = newCombo >= 2 ? Math.min(newCombo, 5) : 1;
      const totalPoints = linePoints * lineComboMultiplier * comboBonus;
      newScore += totalPoints;

      // Set screen shake based on lines cleared
      if (linesCleared === 1) {
        setShakeLevel('light');
      } else if (linesCleared === 2) {
        setShakeLevel('medium');
      } else if (linesCleared >= 3) {
        setShakeLevel('heavy');
      }
      setTimeout(() => setShakeLevel('none'), 400);

      setTimeout(() => {
        // Clear animation
        setClearingCells(new Set());
        setGrid(clearedGrid);
        gridStateRef.current = clearedGrid;
        setTotalLinesCleared(prev => prev + linesCleared);

        // Show floating score for line clear bonus
        if (gridRect) {
          showFloatingScore(totalPoints, gridRect.left + gridRect.width / 2, gridRect.top + gridRect.height / 3, true);
        }

        // Effects based on lines cleared
        if (linesCleared === 1) {
          if (soundEnabled) playCombo(1);
          hapticCombo(1);
          triggerBigMoment({
            shockwave: true,
            score: totalPoints,
            x: 50,
            y: 50,
          });
        } else if (linesCleared === 2) {
          if (soundEnabled) playCombo(2);
          hapticCombo(2);
          showEpicCallout(newCombo >= 2 ? `${newCombo}x COMBO!` : 'DOUBLE!');
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
          if (soundEnabled) playPerfectBonus();
          hapticCombo(3);
          showEpicCallout(newCombo >= 2 ? `${newCombo}x COMBO!` : 'TRIPLE!');
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
          if (soundEnabled) playPerfectBonus();
          hapticHighScore();
          showEpicCallout(newCombo >= 2 ? `${newCombo}x COMBO!` : 'QUAD CLEAR!');
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
      }, 500);

      // Update grid immediately for visual feedback
      setGrid(newGrid);
      gridStateRef.current = newGrid;
    } else {
      // Reset combo if no lines cleared
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(0);
        setShowCombo(false);
      }, 3000);

      setGrid(newGrid);
      gridStateRef.current = newGrid;
    }

    setScore(newScore);

    // Replace used piece with spawn animation
    const spawnedPiece = generateRandomPiece();
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
  }, [score, combo, soundEnabled, getPieceById, playBlockLand, playCombo, playPerfectBonus, hapticScore, hapticCombo, hapticHighScore, triggerBigMoment, triggerConfetti, showEpicCallout, showFloatingScore, handleGameOver]);

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
    hapticButton();

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
      setDragPosition({ x: touch.clientX, y: touch.clientY - 80 });

      // Calculate grid position (use the visual position, not finger position)
      const gridPos = calculateGridPosition(touch.clientX, touch.clientY - 80, pieceId);
      if (gridPos) {
        setPreviewPosition(gridPos);
        previewPositionRef.current = gridPos;
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
        }
      }

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
  }, [gameState, calculateGridPosition, getPieceById, attemptPlacement]);

  // ============================================
  // MOUSE HANDLERS (Desktop)
  // ============================================
  const handleMouseDown = (e: React.MouseEvent, pieceId: string) => {
    if (gameState !== 'playing' || isPaused) return;

    const piece = getPieceById(pieceId);
    if (!piece || !canPlaceAnywhere(gridStateRef.current, piece)) return;

    e.preventDefault();
    hapticButton();

    setDraggedPieceId(pieceId);
    draggedPieceIdRef.current = pieceId;
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pieceId = draggedPieceIdRef.current;
      if (!pieceId || gameState !== 'playing') return;

      setDragPosition({ x: e.clientX, y: e.clientY });

      const gridPos = calculateGridPosition(e.clientX, e.clientY, pieceId);
      if (gridPos) {
        setPreviewPosition(gridPos);
        previewPositionRef.current = gridPos;
      }
    };

    const handleMouseUp = () => {
      const pieceId = draggedPieceIdRef.current;
      const pos = previewPositionRef.current;

      if (pieceId && pos && gameState === 'playing') {
        const piece = getPieceById(pieceId);
        if (piece && canPlacePiece(gridStateRef.current, piece.shape, pos.row, pos.col)) {
          attemptPlacement(pieceId, pos.row, pos.col);
        }
      }

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
  }, [draggedPieceId, gameState, calculateGridPosition, getPieceById, attemptPlacement]);

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
              </div>

              {(isNewPersonalBest || score > highScore) && score > 0 && (
                <div className="bp-new-record">New Personal Best!</div>
              )}

              {isSignedIn && (
                <div className="bp-submitted">
                  {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}

              {/* Buttons: Play Again + Leaderboard */}
              <div className="bp-game-over-buttons">
                <button onClick={startGame} className="bp-play-btn">
                  Play Again
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
        <div className="bp-score-panel">
          <div className="bp-score-main">
            <span className="bp-score-value">{score}</span>
            <span className="bp-score-label">Score</span>
          </div>
          <div className="bp-score-secondary">
            <span>Lines: {totalLinesCleared}</span>
            <span>Best: {Math.max(highScore, score)}</span>
          </div>
        </div>
      )}

      {/* Game Grid */}
      {gameState === 'playing' && (
        <div
          ref={gridRef}
          className={`bp-game-grid ${shakeLevel !== 'none' ? `screen-shake-${shakeLevel}` : ''} ${draggedPieceId ? 'active' : ''}`}
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

              return (
                <div
                  key={cellKey}
                  className={`bp-grid-cell ${cell.filled ? 'filled' : ''} ${
                    isPreview ? (previewValid ? 'preview' : 'preview-invalid') : ''
                  } ${isClearing ? 'clearing' : ''} ${isJustPlaced ? 'just-placed' : ''}`}
                  style={{
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    background: cell.filled ? cell.color : undefined,
                  }}
                />
              );
            })
          )}
        </div>
      )}

      {/* Combo Display */}
      {showCombo && combo >= 2 && gameState === 'playing' && (
        <div className={`bp-combo-display combo-${Math.min(combo, 5)}`}>
          <div className="bp-combo-multiplier">{combo}x</div>
          <div className="bp-combo-text">COMBO</div>
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
                className={`bp-piece-slot ${!canPlace ? 'disabled' : ''} ${isDragging ? 'dragging' : ''} ${isSpawning ? 'spawning' : ''}`}
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

      {/* Floating Drag Preview */}
      {draggedPieceId && (
        <div
          className="bp-drag-preview"
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
        </div>
      ))}

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
