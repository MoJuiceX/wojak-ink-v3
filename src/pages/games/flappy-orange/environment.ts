/**
 * FlappyOrange Environment Initialization
 *
 * Extracted parallax element generation and firefly creation.
 */

import type { Cloud, Tree } from './types';

// ============================================
// PARALLAX ELEMENT GENERATORS
// ============================================

/**
 * Generate cloud objects for parallax background.
 */
export function generateClouds(
  count: number,
  canvasWidth: number,
  canvasHeight: number
): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvasWidth * 1.5,
      y: 30 + Math.random() * (canvasHeight * 0.3),
      width: 80 + Math.random() * 60,
      height: 35 + Math.random() * 35,
      speed: 0.3 + Math.random() * 0.3,
      opacity: 0.7 + Math.random() * 0.2,
    });
  }
  return clouds;
}

/**
 * Generate orange offset positions for tree fruit.
 */
function generateOrangeOffsets(): Array<{ dx: number; dy: number }> {
  const count = 3 + Math.floor(Math.random() * 2); // 3-4 oranges per tree
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
}

/**
 * Generate near tree objects for parallax foreground.
 */
export function generateNearTrees(
  count: number,
  canvasWidth: number,
  canvasHeight: number
): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0; i < count; i++) {
    trees.push({
      x: (i / count) * canvasWidth * 1.5 - canvasWidth * 0.25,
      height: canvasHeight * 0.35 + Math.random() * (canvasHeight * 0.1),
      width: 60 + Math.random() * 30,
      hasOranges: Math.random() > 0.3, // 70% have oranges
      orangeOffsets: generateOrangeOffsets(),
      shapeVariant: Math.floor(Math.random() * 6), // 0-5 for 6 tree variants
      canopyOffset: (Math.random() - 0.5) * 0.15, // Slight horizontal offset
    });
  }
  return trees;
}

/**
 * Generate far tree objects for parallax background.
 */
export function generateFarTrees(
  count: number,
  canvasWidth: number,
  canvasHeight: number
): Tree[] {
  const trees: Tree[] = [];
  for (let i = 0; i < count; i++) {
    trees.push({
      x: (i / count) * canvasWidth * 1.5 - canvasWidth * 0.25,
      height: canvasHeight * 0.22 + Math.random() * (canvasHeight * 0.08),
      width: 50 + Math.random() * 20,
      hasOranges: Math.random() > 0.5,
      orangeOffsets: generateOrangeOffsets(),
      shapeVariant: Math.floor(Math.random() * 6),
      canopyOffset: (Math.random() - 0.5) * 0.1,
    });
  }
  return trees;
}

/**
 * Generate grass tuft positions.
 */
export function generateGrassTufts(
  count: number,
  canvasWidth: number
): Array<{ x: number; height: number }> {
  const tufts: Array<{ x: number; height: number }> = [];
  for (let i = 0; i < count; i++) {
    tufts.push({
      x: (i / count) * canvasWidth * 1.5,
      height: 6 + Math.random() * 10,
    });
  }
  return tufts;
}

/**
 * Generate firefly objects for night mode.
 */
export function generateFireflies(
  count: number,
  canvasWidth: number,
  canvasHeight: number
): Array<{ x: number; y: number; phase: number; speed: number }> {
  const fireflies: Array<{ x: number; y: number; phase: number; speed: number }> = [];
  for (let i = 0; i < count; i++) {
    fireflies.push({
      x: Math.random() * canvasWidth,
      y: 50 + Math.random() * (canvasHeight * 0.6),
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
    });
  }
  return fireflies;
}

// ============================================
// ALL-IN-ONE INITIALIZER
// ============================================

export interface ParallaxElements {
  clouds: Cloud[];
  treesNear: Tree[];
  treesFar: Tree[];
  grassTufts: Array<{ x: number; height: number }>;
  fireflies: Array<{ x: number; y: number; phase: number; speed: number }>;
}

/**
 * Initialize all parallax elements at once.
 */
export function initializeParallaxElements(
  canvasWidth: number,
  canvasHeight: number
): ParallaxElements {
  return {
    clouds: generateClouds(3, canvasWidth, canvasHeight),
    treesNear: generateNearTrees(4, canvasWidth, canvasHeight),
    treesFar: generateFarTrees(4, canvasWidth, canvasHeight),
    grassTufts: generateGrassTufts(12, canvasWidth),
    fireflies: generateFireflies(8, canvasWidth, canvasHeight),
  };
}
