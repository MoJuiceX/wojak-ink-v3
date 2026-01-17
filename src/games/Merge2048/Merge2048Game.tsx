/**
 * Merge 2048 Game - Citrus Edition
 *
 * A 2048-style merge game with an orange citrus theme for wojak.ink
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Howler } from 'howler';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameEffects, GameEffects } from '@/components/media';
import './Merge2048Game.css';

// Direction type for moves
type Direction = 'up' | 'down' | 'left' | 'right';

// ============================================================================
// INTERFACES
// ============================================================================

interface Tile {
  id: number;
  value: number; // 2, 4, 8, 16... (citrus sizes)
  row: number;
  col: number;
  isNew?: boolean; // for spawn animation
  isMerged?: boolean; // for merge animation
}

// GameState interface - will be used when implementing move logic
// interface GameState {
//   tiles: Tile[];
//   score: number;
//   bestScore: number;
//   isGameOver: boolean;
//   hasWon: boolean; // reached 2048
// }

// ============================================================================
// CONSTANTS
// ============================================================================

const GRID_SIZE = 4;
const WINNING_VALUE = 2048;
const BIG_MERGE_THRESHOLD = 256; // Trigger screen shake for big merges

// Tile value to color mapping (citrus theme)
const TILE_COLORS: Record<number, { background: string; text: string }> = {
  2: { background: '#eee4da', text: '#776e65' }, // seed
  4: { background: '#ede0c8', text: '#776e65' }, // small citrus
  8: { background: '#f2b179', text: '#f9f6f2' }, // orange slice
  16: { background: '#f59563', text: '#f9f6f2' }, // mandarin
  32: { background: '#f67c5f', text: '#f9f6f2' }, // blood orange
  64: { background: '#f65e3b', text: '#f9f6f2' }, // tangerine
  128: { background: '#edcf72', text: '#f9f6f2' }, // lemon
  256: { background: '#edcc61', text: '#f9f6f2' }, // grapefruit
  512: { background: '#edc850', text: '#f9f6f2' }, // pomelo
  1024: { background: '#edc53f', text: '#f9f6f2' }, // golden citrus
  2048: { background: '#ff6b00', text: '#f9f6f2' }, // THE ORANGE - victory!
};

// Emoji mapping for tiles (optional visual flair)
const TILE_EMOJIS: Record<number, string> = {
  2: '',
  4: '',
  8: '',
  16: '',
  32: '',
  64: '',
  128: '',
  256: '',
  512: '',
  1024: '',
  2048: '',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all empty cell positions on the grid
 */
const getEmptyCells = (tiles: Tile[]): { row: number; col: number }[] => {
  const occupied = new Set(tiles.map((t) => `${t.row}-${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!occupied.has(`${row}-${col}`)) {
        empty.push({ row, col });
      }
    }
  }

  return empty;
};

/**
 * Spawn a new tile in a random empty cell
 * 90% chance of 2, 10% chance of 4
 */
const spawnTile = (tiles: Tile[], nextId: number): Tile | null => {
  const emptyCells = getEmptyCells(tiles);
  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return {
    id: nextId,
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true,
  };
};

/**
 * Initialize a new game with 2 starting tiles
 */
const initGame = (): { tiles: Tile[]; nextTileId: number } => {
  const tiles: Tile[] = [];
  let nextTileId = 1;

  // Spawn first tile
  const tile1 = spawnTile(tiles, nextTileId++);
  if (tile1) tiles.push(tile1);

  // Spawn second tile
  const tile2 = spawnTile(tiles, nextTileId++);
  if (tile2) tiles.push(tile2);

  return { tiles, nextTileId };
};

/**
 * Get tile style based on value
 */
const getTileStyle = (value: number): React.CSSProperties => {
  const colors = TILE_COLORS[value] || { background: '#3c3a32', text: '#f9f6f2' };
  return {
    backgroundColor: colors.background,
    color: colors.text,
  };
};

/**
 * Get font size class based on tile value (for large numbers)
 */
const getFontSizeClass = (value: number): string => {
  if (value < 100) return 'tile-font-large';
  if (value < 1000) return 'tile-font-medium';
  return 'tile-font-small';
};

/**
 * Convert tiles array to 2D grid representation
 */
const tilesToGrid = (tiles: Tile[]): (Tile | null)[][] => {
  const grid: (Tile | null)[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile;
  });
  return grid;
};

/**
 * Slide and merge a single line (row or column)
 * Returns the merged tiles and score gained
 */
const slideAndMerge = (
  line: (Tile | null)[],
  nextIdRef: { current: number }
): { tiles: Tile[]; scoreGained: number } => {
  // Filter out nulls
  const filtered = line.filter((t): t is Tile => t !== null);
  let scoreGained = 0;
  const merged: Tile[] = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i].value === filtered[i + 1].value) {
      // Merge these two tiles
      const newValue = filtered[i].value * 2;
      merged.push({
        id: nextIdRef.current++,
        value: newValue,
        row: 0, // Will be set later
        col: 0, // Will be set later
        isMerged: true,
        isNew: false,
      });
      scoreGained += newValue;
      i++; // Skip next tile (it was merged)
    } else {
      merged.push({
        ...filtered[i],
        isMerged: false,
        isNew: false,
      });
    }
  }

  return { tiles: merged, scoreGained };
};

/**
 * Get a column from the grid
 */
const getColumn = (grid: (Tile | null)[][], col: number): (Tile | null)[] => {
  return grid.map((row) => row[col]);
};

/**
 * Set a column in the grid
 */
const setColumn = (grid: (Tile | null)[][], col: number, column: (Tile | null)[]): void => {
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row][col] = column[row];
  }
};

/**
 * Check if the game is over (no moves possible)
 */
const checkGameOver = (tiles: Tile[]): boolean => {
  // Not game over if there are empty cells
  if (tiles.length < GRID_SIZE * GRID_SIZE) return false;

  const grid = tilesToGrid(tiles);

  // Check for any possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col];
      if (!current) return false; // Empty cell exists

      // Check right neighbor
      if (col < GRID_SIZE - 1 && grid[row][col + 1]?.value === current.value) {
        return false; // Can merge right
      }
      // Check bottom neighbor
      if (row < GRID_SIZE - 1 && grid[row + 1][col]?.value === current.value) {
        return false; // Can merge down
      }
    }
  }

  return true; // No moves possible
};

/**
 * Check if player has won (reached 2048)
 */
const checkWin = (tiles: Tile[]): boolean => {
  return tiles.some((tile) => tile.value >= WINNING_VALUE);
};

/**
 * Get the highest merged value from a move (for effects)
 */
const getHighestMergedValue = (tiles: Tile[]): number => {
  const mergedTiles = tiles.filter((t) => t.isMerged);
  if (mergedTiles.length === 0) return 0;
  return Math.max(...mergedTiles.map((t) => t.value));
};

// ============================================================================
// COMPONENT
// ============================================================================

const Merge2048Game: React.FC = () => {
  // Game state
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('merge2048-best');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [dismissedWin, setDismissedWin] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Visual effects state (local)
  const [scorePopup, setScorePopup] = useState<{ value: number; key: number } | null>(null);

  // Audio hooks
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, playClick, setMuted } = useHowlerSounds();

  // Leaderboard hooks
  const { submitScore, isSignedIn } = useLeaderboard('2048-merge');

  // Universal visual effects system
  const {
    effects,
    triggerShockwave,
    triggerSparks,
    triggerScreenShake,
    addFloatingEmoji,
    showEpicCallout,
    triggerConfetti,
    updateCombo,
    resetAllEffects,
  } = useGameEffects();

  // Refs
  const nextTileIdRef = useRef(1);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isMovingRef = useRef(false); // Prevent multiple moves during animation
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const scorePopupKeyRef = useRef(0);
  const highestTileRef = useRef(2); // Track highest tile achieved

  // Initialize game on mount
  useEffect(() => {
    handleNewGame();
  }, []);

  // iOS audio unlock
  useEffect(() => {
    const unlock = () => {
      Howler.ctx?.resume();
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('touchstart', unlock);
    return () => document.removeEventListener('touchstart', unlock);
  }, []);

  // Save best score to localStorage
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('merge2048-best', score.toString());
    }
  }, [score, bestScore]);

  // Clear isNew/isMerged flags after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTiles((prev) =>
        prev.map((tile) => ({
          ...tile,
          isNew: false,
          isMerged: false,
        }))
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [tiles]);

  /**
   * Trigger haptic feedback (mobile devices)
   */
  const triggerHaptic = useCallback((pattern: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(durations[pattern]);
    }
  }, []);


  /**
   * Show score popup animation
   */
  const showScorePopup = useCallback((value: number) => {
    scorePopupKeyRef.current += 1;
    setScorePopup({ value, key: scorePopupKeyRef.current });
    setTimeout(() => setScorePopup(null), 800);
  }, []);

  /**
   * Handle mute toggle
   */
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      setMuted(newMuted);
      return newMuted;
    });
  }, [setMuted]);

  /**
   * Start a new game
   */
  const handleNewGame = useCallback(() => {
    playClick();
    const { tiles: newTiles, nextTileId: newNextId } = initGame();
    setTiles(newTiles);
    nextTileIdRef.current = newNextId;
    highestTileRef.current = 2;
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setDismissedWin(false);
    setScorePopup(null);
    resetAllEffects();
  }, [playClick, resetAllEffects]);

  /**
   * Move tiles in the specified direction
   */
  const move = useCallback(
    (direction: Direction) => {
      if (isGameOver || isMovingRef.current) return;

      isMovingRef.current = true;

      setTiles((currentTiles) => {
        const grid = tilesToGrid(currentTiles);
        const newGrid: (Tile | null)[][] = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill(null));
        let totalScoreGained = 0;
        let moved = false;

        // Process based on direction
        if (direction === 'left' || direction === 'right') {
          // Process rows
          for (let row = 0; row < GRID_SIZE; row++) {
            let line = [...grid[row]];

            // Reverse for right movement (so we always merge toward index 0)
            if (direction === 'right') {
              line = line.reverse();
            }

            const { tiles: mergedTiles, scoreGained } = slideAndMerge(line, nextTileIdRef);
            totalScoreGained += scoreGained;

            // Pad with nulls and assign positions
            const newLine: (Tile | null)[] = [];
            for (let col = 0; col < GRID_SIZE; col++) {
              if (col < mergedTiles.length) {
                const tile = mergedTiles[col];
                const actualCol = direction === 'right' ? GRID_SIZE - 1 - col : col;
                newLine.push({ ...tile, row, col: actualCol });
              } else {
                newLine.push(null);
              }
            }

            // Reverse back for right movement
            if (direction === 'right') {
              newLine.reverse();
            }

            newGrid[row] = newLine;
          }
        } else {
          // Process columns (up/down)
          for (let col = 0; col < GRID_SIZE; col++) {
            let line = getColumn(grid, col);

            // Reverse for down movement
            if (direction === 'down') {
              line = line.reverse();
            }

            const { tiles: mergedTiles, scoreGained } = slideAndMerge(line, nextTileIdRef);
            totalScoreGained += scoreGained;

            // Pad with nulls and assign positions
            const newColumn: (Tile | null)[] = [];
            for (let row = 0; row < GRID_SIZE; row++) {
              if (row < mergedTiles.length) {
                const tile = mergedTiles[row];
                const actualRow = direction === 'down' ? GRID_SIZE - 1 - row : row;
                newColumn.push({ ...tile, row: actualRow, col });
              } else {
                newColumn.push(null);
              }
            }

            // Reverse back for down movement
            if (direction === 'down') {
              newColumn.reverse();
            }

            setColumn(newGrid, col, newColumn);
          }
        }

        // Convert grid back to tiles array
        const newTiles: Tile[] = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            const tile = newGrid[row][col];
            if (tile) {
              newTiles.push(tile);
            }
          }
        }

        // Check if anything moved
        const oldPositions = new Set(currentTiles.map((t) => `${t.row}-${t.col}-${t.value}`));
        const newPositions = new Set(newTiles.map((t) => `${t.row}-${t.col}-${t.value}`));
        moved =
          oldPositions.size !== newPositions.size ||
          [...oldPositions].some((p) => !newPositions.has(p));

        if (moved) {
          // Play slide sound
          playBlockLand();
          triggerHaptic('light');

          // Update score and show popup
          if (totalScoreGained > 0) {
            setScore((prev) => prev + totalScoreGained);
            showScorePopup(totalScoreGained);
          }

          // Check for big merges (screen shake + combo sound + universal effects)
          const highestMerged = getHighestMergedValue(newTiles);
          if (highestMerged >= BIG_MERGE_THRESHOLD) {
            triggerScreenShake(300);
            triggerShockwave('#ff6b00', 0.7);
            triggerSparks('#ff6b00');
            playCombo();
            triggerHaptic('heavy');
            updateCombo();
            // Track highest tile for metadata
            if (highestMerged > highestTileRef.current) {
              highestTileRef.current = highestMerged;
              addFloatingEmoji(TILE_EMOJIS[highestMerged] || '🔥');
              showEpicCallout(`${highestMerged}!`);
            }
            // Extra celebration for very high tiles
            if (highestMerged >= 512) {
              triggerConfetti();
            }
          } else if (highestMerged > 0) {
            // Regular merge - satisfying pop
            playPerfectBonus();
            triggerHaptic('medium');
            updateCombo();
          }

          // Check for win (first time reaching 2048)
          if (!hasWon && checkWin(newTiles)) {
            setHasWon(true);
            playWinSound();
            triggerHaptic('heavy');
            triggerConfetti();
            showEpicCallout('YOU WIN!');
            triggerShockwave('#FFD700', 1.0);
          }

          // Spawn new tile after animation delay
          setTimeout(() => {
            setTiles((prev) => {
              const newTile = spawnTile(prev, nextTileIdRef.current++);
              if (newTile) {
                const tilesWithNew = [...prev, newTile];
                // Check for game over after spawning new tile
                if (checkGameOver(tilesWithNew)) {
                  setIsGameOver(true);
                  playGameOver();
                  triggerScreenShake(500);
                  addFloatingEmoji('💀');
                  // Submit score to leaderboard
                  if (isSignedIn) {
                    submitScore(score + totalScoreGained, undefined, {
                      highestTile: highestTileRef.current,
                    });
                  }
                }
                return tilesWithNew;
              }
              // Check game over even without new tile
              if (checkGameOver(prev)) {
                setIsGameOver(true);
                playGameOver();
                triggerScreenShake(500);
                addFloatingEmoji('💀');
                if (isSignedIn) {
                  submitScore(score + totalScoreGained, undefined, {
                    highestTile: highestTileRef.current,
                  });
                }
              }
              return prev;
            });
            isMovingRef.current = false;
          }, 150);

          return newTiles;
        } else {
          isMovingRef.current = false;
          return currentTiles;
        }
      });
    },
    [isGameOver, hasWon, showScorePopup, triggerScreenShake, triggerHaptic, playBlockLand, playCombo, playPerfectBonus, playWinSound, playGameOver, isSignedIn, submitScore, score, triggerShockwave, triggerSparks, addFloatingEmoji, showEpicCallout, triggerConfetti, updateCombo]
  );

  /**
   * Handle keyboard input
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      let direction: Direction | null = null;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }

      if (direction) {
        e.preventDefault();
        move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, isGameOver]);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  /**
   * Handle touch end - detect swipe direction
   */
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || isGameOver) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const minSwipe = 50; // Minimum swipe distance

      touchStartRef.current = null;

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipe) {
          move(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipe) {
          move(deltaY > 0 ? 'down' : 'up');
        }
      }
    },
    [move, isGameOver]
  );

  /**
   * Prevent default touch behavior (scrolling)
   */
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Render the grid background (empty cells)
   */
  const renderGridBackground = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      cells.push(<div key={i} className="grid-cell" />);
    }
    return cells;
  };

  /**
   * Get glow class for high-value tiles
   */
  const getGlowClass = (value: number): string => {
    if (value >= 2048) return 'tile-glow-2048';
    if (value >= 1024) return 'tile-glow-1024';
    if (value >= 512) return 'tile-glow-512';
    if (value >= 256) return 'tile-glow-256';
    if (value >= 128) return 'tile-glow-128';
    return '';
  };

  /**
   * Render a single tile
   */
  const renderTile = (tile: Tile) => {
    const style: React.CSSProperties = {
      ...getTileStyle(tile.value),
      '--tile-row': tile.row,
      '--tile-col': tile.col,
    } as React.CSSProperties;

    const classes = [
      'tile',
      getFontSizeClass(tile.value),
      getGlowClass(tile.value),
      tile.isNew ? 'tile-new' : '',
      tile.isMerged ? 'tile-merged' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div key={tile.id} className={classes} style={style}>
        <span className="tile-value">
          {TILE_EMOJIS[tile.value] || ''} {tile.value}
        </span>
      </div>
    );
  };

  return (
    <div className="merge2048-container">
      {/* Header */}
      <div className="merge2048-header">
        <div className="merge2048-title">
          <h1>2048</h1>
          <span className="merge2048-subtitle">Citrus Edition</span>
        </div>

        <div className="merge2048-scores">
          <div className="score-box">
            <span className="score-label">SCORE</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-box">
            <span className="score-label">BEST</span>
            <span className="score-value">{bestScore}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="merge2048-controls">
        <button className="new-game-btn" onClick={handleNewGame}>
          New Game
        </button>
        <button className="mute-btn" onClick={handleMuteToggle} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Universal Game Effects Layer */}
      <GameEffects effects={effects} accentColor="#ff6b00" />

      {/* Game Grid */}
      <div
        ref={gridWrapperRef}
        className={`merge2048-grid-wrapper ${effects.screenShake ? 'shake' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className="merge2048-grid">
          {/* Background cells */}
          <div className="grid-background">{renderGridBackground()}</div>

          {/* Tiles layer */}
          <div className="tiles-container">{tiles.map(renderTile)}</div>

          {/* Score popup animation */}
          {scorePopup && (
            <span key={scorePopup.key} className="score-popup">
              +{scorePopup.value}
            </span>
          )}

          {/* Game Over overlay */}
          {isGameOver && (
            <div className="game-overlay game-over">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
              <button className="overlay-btn" onClick={handleNewGame}>
                Try Again
              </button>
            </div>
          )}

          {/* Win overlay */}
          {hasWon && !dismissedWin && !isGameOver && (
            <div className="game-overlay game-won">
              <h2>You Win!</h2>
              <p>You reached 2048!</p>
              <button className="overlay-btn" onClick={() => setDismissedWin(true)}>
                Keep Playing
              </button>
              <button className="overlay-btn secondary" onClick={handleNewGame}>
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="merge2048-instructions">
        <p>Swipe to move tiles. Merge matching numbers to reach 2048!</p>
      </div>
    </div>
  );
};

export default Merge2048Game;
