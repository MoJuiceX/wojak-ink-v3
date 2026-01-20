/**
 * Canvas Utilities
 * Drawing helpers, parallax, and text rendering
 */

// ============================================
// DRAWING
// ============================================

export {
  // Shapes
  roundRect,
  circle,
  ellipse,
  polygon,
  star,
  arrow,

  // Gradients
  createLinearGradient,
  createRadialGradient,
  createVerticalGradient,
  createHorizontalGradient,

  // Effects
  withShadow,
  withGlow,
  textWithOutline,

  // Transforms
  withRotation,
  withScale,
  withAlpha,
  withComposite,

  // Canvas setup
  setupHiDPICanvas,
  clearCanvas,
  canvasToImage,
  downloadCanvas,
} from './drawing';

// ============================================
// PARALLAX
// ============================================

export {
  // Types
  type ParallaxLayer,
  type ParallaxElement,
  type ParallaxSystem,

  // System
  createParallaxSystem,
  addParallaxLayer,
  updateParallax,
  setParallaxOffset,
  drawParallaxSystem,
  drawParallaxLayer,

  // Preset layers
  createMountainLayer,
  createCloudLayer,
  createGrassLayer,
  createPremiumParallaxSystem,

  // Drawing functions
  drawMountain,
  drawCloud,
  drawGrassTuft,
} from './parallax';

// ============================================
// TEXT
// ============================================

export {
  // Types
  type FloatingText,
  type ScoreDisplayConfig,
  type ComboDisplayConfig,

  // Floating text
  createFloatingText,
  updateFloatingText,
  drawFloatingText,

  // Score display
  DEFAULT_SCORE_CONFIG,
  drawScore,
  drawMilestoneScore,

  // Combo display
  DEFAULT_COMBO_CONFIG,
  drawCombo,

  // Text effects
  drawTypewriterText,
  drawWaveText,
  drawRainbowText,

  // Helpers
  getTextWidth,
  wrapText,
} from './text';

// ============================================
// ORANGE TREES
// ============================================

export {
  // Types
  type OrangeTreeConfig,
  type OrangeTree,

  // Generator
  generateOrangeTree,
  generateOrangeGrove,
  generateParallaxTreeLayer,

  // Renderer
  drawOrangeTree,
} from './orangeTree';
