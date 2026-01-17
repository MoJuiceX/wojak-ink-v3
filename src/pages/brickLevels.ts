/**
 * Brick Breaker Level Definitions
 *
 * 0 = empty, 1 = normal (1 hit), 2 = strong (2 hits), 9 = unbreakable
 */

export const LEVELS: number[][][] = [
  // Level 1 - Simple intro
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Level 2 - Introduce strong bricks
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 1, 1, 2, 2, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Level 3 - Pyramid
  [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Level 4 - Walls
  [
    [1, 9, 1, 1, 1, 1, 1, 1, 9, 1],
    [1, 9, 1, 1, 1, 1, 1, 1, 9, 1],
    [1, 9, 2, 2, 2, 2, 2, 2, 9, 1],
    [1, 9, 1, 1, 1, 1, 1, 1, 9, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Level 5 - Checker
  [
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  ],

  // Level 6 - Diamond
  [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
    [0, 0, 1, 2, 1, 1, 2, 1, 0, 0],
    [0, 1, 2, 1, 9, 9, 1, 2, 1, 0],
    [0, 0, 1, 2, 1, 1, 2, 1, 0, 0],
    [0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  ],

  // Level 7 - Fortress
  [
    [9, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    [9, 1, 2, 2, 2, 2, 2, 2, 1, 9],
    [9, 1, 2, 0, 0, 0, 0, 2, 1, 9],
    [9, 1, 2, 0, 0, 0, 0, 2, 1, 9],
    [9, 1, 2, 2, 2, 2, 2, 2, 1, 9],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],

  // Level 8 - Snake
  [
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 1, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 0],
  ],

  // Level 9 - Invaders
  [
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  ],

  // Level 10 - Final challenge
  [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 9, 9, 2, 2, 2, 2, 9, 9, 2],
    [2, 9, 9, 2, 2, 2, 2, 9, 9, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
];

export const generateRandomLevel = (levelNumber: number): number[][] => {
  // More rows and stronger bricks as level increases
  const baseRows = 4;
  const extraRows = Math.floor((levelNumber - 10) / 3);
  const rows = Math.min(8, baseRows + extraRows);

  const strongChance = Math.min(0.4, 0.2 + (levelNumber - 10) * 0.02);
  const unbreakableChance = Math.min(0.15, 0.05 + (levelNumber - 10) * 0.01);

  const level: number[][] = [];

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < 10; c++) {
      const rand = Math.random();
      if (rand < 0.08) row.push(0); // 8% empty
      else if (rand < 0.08 + unbreakableChance) row.push(9); // Unbreakable
      else if (rand < 0.08 + unbreakableChance + strongChance) row.push(2); // Strong
      else row.push(1); // Normal
    }
    level.push(row);
  }

  return level;
};
