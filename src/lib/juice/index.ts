/**
 * Game Juice Library
 * A comprehensive toolkit for making games feel amazing
 *
 * @example
 * import {
 *   // Particles
 *   createParticleSystem,
 *   spawnBurstParticles,
 *   PARTICLE_PRESETS,
 *
 *   // Animations
 *   easeOutCubic,
 *   createTween,
 *   lerp,
 *
 *   // Effects
 *   createScreenShake,
 *   createScreenFlash,
 *   drawVignette,
 *
 *   // Audio
 *   createAudioManager,
 *   playTone,
 *   triggerHaptic,
 *
 *   // Camera
 *   createCamera,
 *   applyCameraTransform,
 * } from '@/lib/juice';
 */

// ============================================
// PARTICLES
// ============================================

export {
  // Types
  type Particle,
  type ParticleConfig,
  type ParticleSystem,
  type RingEffect,

  // Presets
  PARTICLE_PRESETS,

  // Core functions
  createParticleSystem,
  spawnBurstParticles,
  spawnTrailParticle,
  updateParticles,
  drawParticles,
  drawParticlesCircle,
  clearParticles,

  // Ring effects
  createRingEffect,
  updateRingEffect,
  drawRingEffect,
} from './particles';

// ============================================
// ANIMATIONS & EASING
// ============================================

export {
  // Types
  type EasingFunction,
  type Tween,
  type Spring,
  type Timer,

  // Easing functions
  linear,
  easeOutCubic,
  easeInCubic,
  easeInOutCubic,
  easeOutQuad,
  easeInOutQuad,
  easeOutBack,
  easeInBack,
  easeOutElastic,
  easeOutBounce,
  easeInExpo,
  easeOutExpo,

  // Tween system
  createTween,
  updateTween,
  resetTween,

  // Utilities
  lerp,
  inverseLerp,
  remap,
  smoothstep,

  // Spring physics
  createSpring,
  updateSpring,
  setSpringTarget,

  // Timing
  createTimer,
  updateTimer,
  resetTimer,
  pulse,
  oscillate,
} from './animations';

// ============================================
// SCREEN EFFECTS
// ============================================

export {
  // Types
  type ScreenShake,
  type ShakeOffset,
  type ScreenFlash,
  type Vignette,
  type ChromaticAberration,
  type TimeScale,
  type FreezeFrame,
  type DeathEffectBundle,
  type CelebrationEffectBundle,

  // Screen shake
  createScreenShake,
  updateScreenShake,
  applyScreenShake,

  // Screen flash
  createScreenFlash,
  updateScreenFlash,
  drawScreenFlash,
  flashColor,
  FLASH_PRESETS,

  // Vignette
  createVignette,
  drawVignette,

  // Chromatic aberration
  createChromaticAberration,
  updateChromaticAberration,
  drawChromaticAberration,

  // Time effects
  createTimeScale,
  setSlowMotion,
  updateTimeScale,

  // Freeze frame
  createFreezeFrame,
  updateFreezeFrame,

  // Effect bundles
  createDeathEffects,
  createCelebrationEffects,
} from './effects';

// ============================================
// AUDIO & HAPTICS
// ============================================

export {
  // Types
  type AudioManager,
  type ToneOptions,
  type HapticPattern,

  // Audio manager
  createAudioManager,
  initAudio,
  setVolume,
  toggleMute,

  // Tone generation
  playTone,
  playToneADSR,

  // Musical notes
  NOTES,
  C_MAJOR_SCALE,
  playScaleNote,
  playChord,

  // Sound effects
  playFlapSound,
  playImpactSound,
  playSuccessSound,
  playNearMissSound,
  playFireModeSound,

  // Haptics
  HAPTIC_PATTERNS,
  supportsHaptics,
  triggerHaptic,
  stopHaptic,

  // Combined feedback
  feedback,
  FEEDBACK_PRESETS,
} from './audio';

// ============================================
// CAMERA
// ============================================

export {
  // Types
  type Camera,
  type CameraBounds,

  // Creation
  createCamera,

  // Control
  setCameraTarget,
  setCameraPosition,
  setCameraZoom,
  setCameraZoomImmediate,
  zoomIn,
  zoomOut,
  pulseZoom,

  // Shake
  shakeCamera,

  // Update
  updateCamera,

  // Transform
  applyCameraTransform,
  resetCameraTransform,

  // Coordinate conversion
  screenToWorld,
  worldToScreen,
  isInView,
  getVisibleBounds,
} from './camera';
