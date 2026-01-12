/**
 * Hover Effects Configuration
 *
 * GPU-accelerated hover, press, and interaction effects.
 *
 * GUIDELINES:
 * - Scale: 1.02-1.05 for cards, 1.01-1.02 for buttons (subtle)
 * - Y-translate: -2px to -4px for "lift" effect
 * - Only animate transform, opacity, filter (GPU-accelerated)
 * - Transition: 150-200ms ease-out (enter), 100-150ms ease-in (leave)
 */

import type { Variants } from 'framer-motion';
import { DURATION_SECONDS } from './easings';

// ============ Button Variants ============

export const buttonVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -1,
    transition: { duration: DURATION_SECONDS.fast },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: { duration: 0.1 },
  },
};

export const buttonPrimaryVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(255, 107, 0, 0)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 20px 2px rgba(255, 107, 0, 0.3)',
    transition: { duration: DURATION_SECONDS.fast },
  },
  tap: {
    scale: 0.96,
    transition: { duration: 0.1 },
  },
};

export const buttonIconVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: 15,
    transition: { duration: DURATION_SECONDS.fast },
  },
  tap: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
};

// ============ Card Variants ============

export const cardVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: DURATION_SECONDS.normal },
  },
  tap: {
    scale: 0.99,
    y: -2,
    transition: { duration: 0.1 },
  },
};

export const cardNFTVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.03,
    y: -6,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
    y: -3,
    transition: { duration: 0.1 },
  },
};

// ============ List Item Variants ============

export const listItemVariants: Variants = {
  initial: {
    x: 0,
    backgroundColor: 'transparent',
  },
  hover: {
    x: 4,
    backgroundColor: 'rgba(255, 107, 0, 0.05)',
    transition: { duration: DURATION_SECONDS.fast },
  },
  tap: {
    x: 2,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    transition: { duration: 0.1 },
  },
};

// ============ Thumbnail Variants ============

export const thumbnailVariants: Variants = {
  initial: {
    scale: 1,
    filter: 'brightness(1)',
  },
  hover: {
    scale: 1.05,
    filter: 'brightness(1.1)',
    transition: { duration: DURATION_SECONDS.normal },
  },
};

// ============ Nav Item Variants ============

export const navItemVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
  },
  hover: {
    scale: 1.05,
    opacity: 1,
    transition: { duration: DURATION_SECONDS.fast },
  },
  active: {
    scale: 1,
    opacity: 1,
  },
};

// ============ Link Variants ============

export const linkVariants: Variants = {
  initial: {
    opacity: 1,
  },
  hover: {
    opacity: 0.8,
    transition: { duration: DURATION_SECONDS.fast },
  },
  tap: {
    opacity: 0.6,
    transition: { duration: 0.1 },
  },
};

// ============ Reduced Motion Variants ============

export const reducedMotionVariants: Variants = {
  initial: {
    opacity: 1,
  },
  hover: {
    opacity: 0.9,
    transition: { duration: 0.05 },
  },
  tap: {
    opacity: 0.8,
    transition: { duration: 0.05 },
  },
};

// ============ Stagger Container ============

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_SECONDS.normal },
  },
};

// ============ Fade In Variants ============

export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: DURATION_SECONDS.normal },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATION_SECONDS.fast },
  },
};

export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_SECONDS.normal },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: DURATION_SECONDS.fast },
  },
};

export const fadeInScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION_SECONDS.normal },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATION_SECONDS.fast },
  },
};
