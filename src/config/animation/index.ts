/**
 * Animation System - Main Export
 *
 * Production-grade animation system with research-backed timing,
 * physics-based springs, and accessibility support.
 */

// Duration system
export {
  DURATION,
  DEVICE_MULTIPLIER,
  getDeviceDuration,
  toSeconds,
  type DurationKey,
  type DeviceType,
} from './durations';

// Spring presets
export {
  SPRING,
  type SpringPreset,
  type SpringConfig,
} from './springs';

// Animation variants
export {
  // Fades
  FADE_IN,
  FADE_IN_DELAY,
  // Slides
  SLIDE_UP,
  SLIDE_DOWN,
  SLIDE_LEFT,
  SLIDE_RIGHT,
  // Scales
  SCALE_IN,
  SCALE_IN_BOUNCE,
  POP_IN,
  // Stagger
  STAGGER_CONTAINER,
  STAGGER_CONTAINER_SLOW,
  STAGGER_ITEM,
  // Modal/Overlay
  MODAL_BACKDROP,
  MODAL_CONTENT,
  DRAWER_LEFT,
  DRAWER_RIGHT,
  DRAWER_BOTTOM,
  // Toast
  TOAST_SLIDE,
  // Effects
  GLOW_PULSE,
  BREATHE,
  SHIMMER,
} from './variants';

// Gesture configurations
export {
  BUTTON_GESTURES,
  CARD_GESTURES,
  LINK_GESTURES,
  NAV_GESTURES,
  DRAG_CONFIG,
  type ButtonGesturePreset,
  type CardGesturePreset,
  type LinkGesturePreset,
  type NavGesturePreset,
  type DragConfigPreset,
} from './gestures';

// Re-export easing from existing config
export { EASING } from '../easings';
