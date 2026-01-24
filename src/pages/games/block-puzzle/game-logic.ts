/**
 * BlockPuzzle Game Logic
 *
 * Pure functions for game state manipulation:
 * - Grid creation and manipulation
 * - Piece generation and placement
 * - Line clearing logic
 * - Game over detection
 * - Score calculations
 */

import { BLOCK_SHAPES, SHAPE_KEYS, BLOCK_COLORS, GRID_SIZE } from './config';
import type { Grid, DraggablePiece } from './types';

// ============================================
// GRID FUNCTIONS
// ============================================

/**
 * Create an empty 8x8 grid
 */
export const createEmptyGrid = (): Grid =>
  Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      filled: false,
      color: null,
      blockId: null
    }))
  );

/**
 * Count the number of filled cells in the grid
 */
export const countFilledCells = (grid: Grid): number => {
  return grid.flat().filter(cell => cell.filled).length;
};

/**
 * Check if the grid is completely empty (perfect clear)
 */
export const checkPerfectClear = (grid: Grid): boolean => {
  return grid.flat().every(cell => !cell.filled);
};

// ============================================
// PIECE GENERATION
// ============================================

/**
 * Generate a random piece with random shape and color
 */
export const generateRandomPiece = (): DraggablePiece => {
  const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
  const colorIndex = Math.floor(Math.random() * BLOCK_COLORS.length);
  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shape: BLOCK_SHAPES[shapeKey],
    color: BLOCK_COLORS[colorIndex],
  };
};

/**
 * Generate three random pieces for the piece rack
 */
export const generateThreePieces = (): DraggablePiece[] => {
  return [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
};

// ============================================
// PIECE PLACEMENT VALIDATION
// ============================================

/**
 * Check if a piece can be placed at a specific position
 */
export const canPlacePiece = (
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
      if (gridRow < 0 || gridRow >= GRID_SIZE || gridCol < 0 || gridCol >= GRID_SIZE) {
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

/**
 * Check if a piece can be placed anywhere on the grid
 */
export const canPlaceAnywhere = (grid: Grid, piece: DraggablePiece): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (canPlacePiece(grid, piece.shape, row, col)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Count total valid moves for all pieces
 */
export const countValidMoves = (grid: Grid, pieces: DraggablePiece[]): number => {
  let count = 0;
  pieces.forEach(piece => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlacePiece(grid, piece.shape, row, col)) {
          count++;
        }
      }
    }
  });
  return count;
};

// ============================================
// PIECE PLACEMENT
// ============================================

/**
 * Place a piece on the grid and return the new grid state
 */
export const placePiece = (
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

// ============================================
// LINE CLEARING
// ============================================

/**
 * Check and clear complete rows and columns
 */
export const clearLines = (grid: Grid): {
  clearedGrid: Grid;
  linesCleared: number;
  cellsCleared: Set<string>;
} => {
  const cellsToClear = new Set<string>();
  let rowsCleared = 0;
  let colsCleared = 0;

  // Check rows
  for (let row = 0; row < GRID_SIZE; row++) {
    if (grid[row].every(cell => cell.filled)) {
      rowsCleared++;
      for (let col = 0; col < GRID_SIZE; col++) {
        cellsToClear.add(`${row}-${col}`);
      }
    }
  }

  // Check columns
  for (let col = 0; col < GRID_SIZE; col++) {
    let columnFull = true;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (!grid[row][col].filled) {
        columnFull = false;
        break;
      }
    }
    if (columnFull) {
      colsCleared++;
      for (let row = 0; row < GRID_SIZE; row++) {
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

// ============================================
// GAME STATE CHECKS
// ============================================

/**
 * Check if the game is over (no pieces can be placed)
 */
export const isGameOver = (grid: Grid, pieces: DraggablePiece[]): boolean => {
  for (const piece of pieces) {
    if (canPlaceAnywhere(grid, piece)) {
      return false;
    }
  }
  return true;
};

/**
 * Get preview cells for a piece at a given position
 */
export const getPreviewCells = (
  row: number,
  col: number,
  piece: DraggablePiece | undefined
): Set<string> => {
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
};

// ============================================
// SCORE CALCULATIONS
// ============================================

/**
 * Calculate base points for placing a piece
 */
export const calculatePlacementPoints = (shape: number[][]): number => {
  const blocksInPiece = shape.flat().filter(c => c === 1).length;
  return blocksInPiece * 10;
};

/**
 * Calculate line clear bonus points
 */
export const calculateLineClearPoints = (
  linesCleared: number,
  comboCount: number
): number => {
  const linePoints = linesCleared * 100;
  const lineComboMultiplier = linesCleared >= 2 ? linesCleared : 1;
  const comboBonus = comboCount >= 2 ? Math.min(comboCount, 5) : 1;
  return linePoints * lineComboMultiplier * comboBonus;
};

/**
 * Apply streak bonus to score
 */
export const applyStreakBonus = (
  baseScore: number,
  streakActive: boolean,
  bonusMultiplier: number
): number => {
  if (streakActive) {
    return Math.floor(baseScore * bonusMultiplier);
  }
  return baseScore;
};

// ============================================
// CHALLENGE SYSTEM
// ============================================

/**
 * Decode a challenge string from URL parameters
 */
export const decodeChallenge = (encoded: string): number | null => {
  try {
    const decoded = JSON.parse(atob(encoded));
    return decoded.s || null;
  } catch {
    return null;
  }
};
