/**
 * Animation Configuration
 *
 * Centralized animation presets for consistent motion design.
 * All animations respect prefers-reduced-motion.
 */

import type { Transition, Variants } from 'framer-motion';

/**
 * Common easing curves
 */
export const EASING = {
  // Standard Material Design easing
  standard: [0.4, 0, 0.2, 1] as const,
  // Decelerate - for entering elements
  decelerate: [0, 0, 0.2, 1] as const,
  // Accelerate - for exiting elements
  accelerate: [0.4, 0, 1, 1] as const,
  // Sharp - for elements that exit and then return
  sharp: [0.4, 0, 0.6, 1] as const,
  // Bounce for playful interactions
  bounce: [0.68, -0.55, 0.27, 1.55] as const,
} as const;

/**
 * Page transition animations
 */
export const pageTransition = {
  enter: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.25,
      ease: EASING.standard,
    } as Transition,
  },
  exit: {
    animate: { opacity: 0, y: -8 },
    transition: {
      duration: 0.15,
      ease: EASING.accelerate,
    } as Transition,
  },
} as const;

/**
 * Sidebar animations
 */
export const sidebarTransition = {
  expand: {
    duration: 0.2,
    ease: EASING.standard,
  } as Transition,
  label: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: {
      duration: 0.15,
      delay: 0.05,
      ease: EASING.decelerate,
    } as Transition,
  },
} as const;

/**
 * Mobile navigation animations
 */
export const mobileNavTransition = {
  underline: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  } as Transition,
  icon: {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 },
  },
} as const;

/**
 * Common hover effects
 */
export const hoverEffects = {
  scale: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.15, ease: EASING.standard },
  },
  lift: {
    whileHover: { y: -4, boxShadow: 'var(--glow-primary)' },
    transition: { duration: 0.2, ease: EASING.standard },
  },
  glow: {
    whileHover: { boxShadow: 'var(--glow-subtle)' },
    transition: { duration: 0.2, ease: EASING.standard },
  },
} as const;

/**
 * Reduced motion alternatives
 */
export const reducedMotion = {
  page: {
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
    exit: {
      animate: { opacity: 0 },
      transition: { duration: 0.1 },
    },
  },
  sidebar: {
    duration: 0,
  },
  mobileNav: {
    type: 'tween' as const,
    duration: 0,
  },
} as const;

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASING.decelerate,
    },
  },
};

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: EASING.standard },
  },
};

/**
 * Slide up animation
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASING.decelerate },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: EASING.decelerate },
  },
};
