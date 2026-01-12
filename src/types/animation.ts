/**
 * Animation System Type Definitions
 */

import type { Transition, TargetAndTransition } from 'framer-motion';

// Duration types
export type DurationKey =
  | 'instant'
  | 'micro'
  | 'fast'
  | 'normal'
  | 'moderate'
  | 'complex'
  | 'slow'
  | 'continuous';

// Spring types
export type SpringPreset =
  | 'snappy'
  | 'quick'
  | 'balanced'
  | 'gentle'
  | 'bouncy'
  | 'elastic'
  | 'soft'
  | 'heavy';

// Easing types
export type EasingPreset =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'materialStandard'
  | 'materialDecelerate'
  | 'materialAccelerate'
  | 'tangSnap'
  | 'tangBounce'
  | 'tangSmooth';

// Animation variants interface
export interface AnimationVariants {
  hidden: TargetAndTransition;
  visible: TargetAndTransition;
  exit?: TargetAndTransition;
}

// Gesture configuration
export interface GestureConfig {
  whileHover?: TargetAndTransition;
  whileTap?: TargetAndTransition;
  whileFocus?: TargetAndTransition;
  whileDrag?: TargetAndTransition;
  transition?: Transition;
}

// Spring configuration
export interface SpringConfig {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass?: number;
  velocity?: number;
  restSpeed?: number;
  restDelta?: number;
}

// Device types for duration scaling
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'wearable';

// Reduced motion configuration
export interface ReducedMotionConfig {
  preference: 'system' | 'reduced' | 'full';
}

// Full animation system configuration
export interface AnimationSystemConfig {
  durations: Record<DurationKey, number>;
  springs: Record<SpringPreset, SpringConfig>;
  easings: Record<EasingPreset, number[]>;
  reducedMotion: ReducedMotionConfig;
}

// Ripple effect type
export interface RippleEffect {
  id: number;
  x: number;
  y: number;
  size: number;
}
