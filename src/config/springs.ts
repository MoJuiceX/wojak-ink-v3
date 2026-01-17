/**
 * Framer Motion Spring Configurations
 *
 * Reusable spring presets for consistent animations across the app.
 * Use these with Framer Motion's `transition` prop.
 */

import type { Transition } from 'framer-motion';

// ============================================
// SPRING PRESETS
// ============================================

/**
 * Gentle - For subtle UI movements
 * Low stiffness, medium damping = soft, slow animations
 */
export const gentle: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
};

/**
 * Default - Balanced spring for general use
 * Good for most UI transitions
 */
export const defaultSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

/**
 * Snappy - Quick responsive feedback
 * High stiffness = fast response, good for buttons/interactions
 */
export const snappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

/**
 * Bouncy - Playful interactions
 * Low damping = visible bounce effect
 */
export const bouncy: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 10,
};

/**
 * Stiff - Minimal overshoot
 * Very high stiffness and damping = almost linear but smooth
 */
export const stiff: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

/**
 * Modal - For modal/overlay animations
 * Balanced with slight bounce for a "pop" effect
 */
export const modal: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

/**
 * Page - For page transitions
 * Slower, more gentle for larger movements
 */
export const page: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
};

// ============================================
// TWEEN PRESETS
// ============================================

/**
 * Fast tween - For instant feedback
 */
export const tweenFast: Transition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
};

/**
 * Normal tween - Standard duration
 */
export const tweenNormal: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Slow tween - For deliberate animations
 */
export const tweenSlow: Transition = {
  type: 'tween',
  duration: 0.5,
  ease: 'easeInOut',
};

// ============================================
// STAGGER PRESETS
// ============================================

/**
 * Creates a stagger delay for child animations
 */
export const stagger = {
  fast: 0.03,
  normal: 0.05,
  slow: 0.08,
} as const;

/**
 * Container variants for staggered children
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
    },
  },
};

/**
 * Child variants for staggered animations
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultSpring,
  },
};

// ============================================
// COMBINED EXPORT
// ============================================

export const springs = {
  gentle,
  default: defaultSpring,
  snappy,
  bouncy,
  stiff,
  modal,
  page,
} as const;

export const tweens = {
  fast: tweenFast,
  normal: tweenNormal,
  slow: tweenSlow,
} as const;

export const transitions = {
  springs,
  tweens,
  stagger,
  staggerContainer,
  staggerItem,
} as const;

export default transitions;
