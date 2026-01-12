/**
 * Gallery Animation Configuration
 *
 * Animation presets for the gallery and NFT explorer.
 */

import type { Transition, Variants } from 'framer-motion';

export const GALLERY_ANIMATIONS = {
  // Modal entry/exit (mobile)
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25 } as Transition,
    },
    content: {
      initial: { opacity: 0, scale: 0.94, y: 30 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.96, y: 20 },
      transition: {
        type: 'spring',
        stiffness: 380,
        damping: 30,
        mass: 0.9,
      } as Transition,
    },
  },

  // Image swipe
  swipe: {
    drag: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    } as Transition,
    threshold: {
      velocity: 500, // px/s
      distance: 0.25, // 25% of container width
    },
  },

  // Swipe hint arrows
  swipeHint: {
    arrow: {
      animate: {
        x: [0, 10, 0],
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    container: {
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  },

  // Tab indicator
  tabIndicator: {
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    } as Transition,
  },

  // Character card
  card: {
    hover: {
      scale: 1.03,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1, ease: 'easeOut' },
    },
  },

  // Price slider emoji
  priceEmoji: {
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    } as Transition,
  },

  // Image crossfade
  imageCrossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 } as Transition,
  },

  // Desktop lightbox popup
  lightbox: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25 } as Transition,
    },
    content: {
      initial: { opacity: 0, scale: 0.92, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 10 },
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 28,
        mass: 0.8,
      } as Transition,
    },
  },

  // Reduced motion alternatives
  reducedMotion: {
    modal: {
      content: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      },
    },
    swipe: {
      exit: { opacity: 0, transition: { duration: 0.1 } },
      enter: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.15 },
      },
    },
    card: {
      hover: { scale: 1 },
      tap: { scale: 1 },
    },
  },
} as const;

/**
 * Swipe exit animation variant
 */
export const swipeExitVariants: Variants = {
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * 300,
    transition: { duration: 0.2 },
  }),
};

/**
 * Swipe enter animation variant
 */
export const swipeEnterVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction * 300,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
};

/**
 * Stagger animation for character grid items
 */
export const gridStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const gridItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0, 0, 0.2, 1],
    },
  },
};

/**
 * NFT Grid Cascade Animation
 *
 * Ultra-fast subtle wave reveal. Nearly instant but with polish.
 */
export const nftGridStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      // 8ms per item = ~0.8s for 100 items total spread
      staggerChildren: 0.008,
      delayChildren: 0,
    },
  },
};

export const nftGridItemVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 0,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};
