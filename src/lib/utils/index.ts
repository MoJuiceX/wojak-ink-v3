/**
 * Utility Libraries
 * Math, color, and mobile utilities for game development
 */

// ============================================
// MATH
// ============================================

export {
  // Basic operations
  clamp,
  randomInRange,
  randomInt,
  randomItem,
  shuffle,

  // Geometry
  distance,
  distanceSquared,
  angle,
  degToRad,
  radToDeg,
  normalizeAngle,
  angleDifference,

  // Vectors
  type Vector2,
  createVector,
  addVectors,
  subtractVectors,
  scaleVector,
  normalizeVector,
  vectorLength,
  vectorLengthSquared,
  dotProduct,
  vectorFromAngle,

  // Collision detection
  pointInRect,
  pointInCircle,
  rectOverlap,
  circleOverlap,
  circleRectOverlap,

  // Interpolation
  map,
  wrap,
  roundTo,

  // Game-specific
  percentage,
  formatNumber,
  formatTime,
  formatTimeMs,
} from './math';

// ============================================
// COLOR
// ============================================

export {
  // Types
  type RGB,
  type RGBA,
  type HSL,
  type HSLA,

  // Conversion
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,

  // Interpolation
  lerpRgb,
  lerpColor,
  lerpColors,

  // Manipulation
  lighten,
  darken,
  saturate,
  desaturate,
  rotateHue,
  complementary,
  triadic,
  withAlpha,

  // Strings
  rgbString,
  rgbaString,
  hslString,
  hslaString,

  // Presets
  randomColor,
  randomPastel,
  randomVibrant,
  getContrastColor,
  GAME_PALETTES,
  getGradientStops,
} from './color';

// ============================================
// MOBILE
// ============================================

export {
  // Device detection
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
  isStandalone,
  getDevicePixelRatio,

  // Touch handling
  type TouchPoint,
  type TouchInfo,
  getTouchInfo,
  getTouchPosition,
  getPinchScale,

  // Gesture detection
  type GestureType,
  type GestureConfig,
  type GestureState,
  DEFAULT_GESTURE_CONFIG,
  createGestureState,
  detectGesture,

  // Thumb zones
  THUMB_ZONES,
  getThumbZone,
  isInThumbZone,

  // Viewport helpers
  getSafeAreaInsets,
  lockOrientation,
  preventDefaultTouch,
  requestFullscreen,
  exitFullscreen,

  // Performance
  prefersReducedMotion,
  isLowPowerMode,
  getRecommendedParticleCount,
} from './mobile';
