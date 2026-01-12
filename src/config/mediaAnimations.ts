/**
 * Media Animation Configuration
 *
 * Framer Motion animation presets for the Media Hub.
 */

import type { Variants, Transition } from 'framer-motion';

// ============ Shared Transitions ============

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.2,
  ease: 'easeOut',
};

// ============ Game Card Animations ============

export const gameCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
  hover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
  },
};

export const gameGridVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// ============ Video Card Animations ============

export const videoCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  hover: {
    scale: 1.02,
  },
  tap: {
    scale: 0.98,
  },
};

export const videoThumbnailVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

export const playOverlayVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// ============ Floating Player Animations ============

export const floatingPlayerVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const playerControlsVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// ============ Music Player Animations ============

export const musicPlayerVariants: Variants = {
  collapsed: {
    height: 64,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  expanded: {
    height: 'auto',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const trackItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: { duration: 0.15 },
  },
};

export const trackChangeVariants: Variants = {
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  enter: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

export const nowPlayingVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

// ============ Game Modal Animations ============

export const gameModalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const gameModalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export const instructionsPanelVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ============ Progress Bar Animations ============

export const progressThumbVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.2 },
  drag: {
    scale: 1.3,
    transition: { type: 'spring', stiffness: 500, damping: 30 },
  },
};

// ============ Volume Slider Animations ============

export const volumeSliderVariants: Variants = {
  collapsed: { width: 0, opacity: 0 },
  expanded: {
    width: 100,
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

// ============ Play/Pause Button Animations ============

export const playButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

export const playIconVariants: Variants = {
  playing: { scale: [1, 0.8, 1], transition: { duration: 0.2 } },
  paused: { scale: [1, 0.8, 1], transition: { duration: 0.2 } },
};

// ============ Shuffle/Repeat Animations ============

export const shuffleVariants: Variants = {
  inactive: { opacity: 0.5 },
  active: {
    opacity: 1,
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.3 },
  },
};

export const repeatVariants: Variants = {
  off: { opacity: 0.5 },
  all: { opacity: 1 },
  one: {
    opacity: 1,
    scale: [1, 1.1, 1],
    transition: { duration: 0.2 },
  },
};

// ============ Picture-in-Picture Animations ============

export const pipTransitionVariants: Variants = {
  initial: { scale: 1 },
  entering: {
    scale: [1, 0.5, 0],
    transition: { duration: 0.3 },
  },
  exiting: {
    scale: [0, 0.5, 1],
    transition: { duration: 0.3 },
  },
};

// ============ Category Filter Animations ============

export const filterTabVariants: Variants = {
  initial: { opacity: 0.6 },
  active: { opacity: 1 },
  hover: { opacity: 0.8 },
};

export const filterIndicatorVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

// ============ Reduced Motion Alternatives ============

export const reducedMotionVariants = {
  gameCard: {
    hover: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
  },
  videoCard: {
    hover: { scale: 1 },
  },
  floatingPlayer: {
    transition: { duration: 0.1 },
  },
  gameModal: {
    content: { transition: { duration: 0.1 } },
  },
} as const;

// ============ Drag Configuration ============

export const dragConfig = {
  dragElastic: 0.1,
  dragMomentum: true,
  dragTransition: { bounceStiffness: 300, bounceDamping: 20 },
};

// ============ Album Art Animation ============

export const albumArtVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

// Spinning animation for playing state
export const albumSpinVariants: Variants = {
  playing: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  paused: {
    rotate: 0,
    transition: { duration: 0.5 },
  },
};

// ============ Loading States ============

export const skeletonPulseVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============ Audio Visualizer (placeholder) ============

export const audioBarVariants: Variants = {
  playing: (i: number) => ({
    scaleY: [0.3, 1, 0.5, 0.8, 0.3],
    transition: {
      duration: 0.5 + i * 0.1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
  paused: {
    scaleY: 0.3,
    transition: { duration: 0.2 },
  },
};
