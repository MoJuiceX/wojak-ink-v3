/**
 * Desktop Animation Configuration
 *
 * Animation presets for desktop gallery components.
 */

import type { Transition } from 'framer-motion';

export const DESKTOP_ANIMATIONS = {
  // Panel slide
  panel: {
    enter: {
      initial: { x: '100%', opacity: 0.5 },
      animate: { x: 0, opacity: 1 },
      transition: {
        x: {
          duration: 0.35,
          ease: [0.32, 0.72, 0, 1], // custom ease-out
        },
        opacity: { duration: 0.2 },
      },
    },
    exit: {
      animate: { x: '100%', opacity: 0 },
      transition: {
        x: {
          duration: 0.3,
          ease: [0.32, 0, 0.67, 0], // custom ease-in
        },
        opacity: { duration: 0.2, delay: 0.1 },
      },
    },
  },

  // Overlay fade
  overlay: {
    enter: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: {
      animate: { opacity: 0 },
      transition: { duration: 0.2, ease: 'easeIn' },
    },
  },

  // Card hover (desktop-specific)
  cardHover: {
    lift: {
      y: -8,
      transition: {
        duration: 0.25,
        ease: [0.34, 1.56, 0.64, 1], // overshoot
      },
    },
    unlift: {
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    shadow: {
      boxShadow: [
        '0 2px 8px rgba(0, 0, 0, 0.1)',
        '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 107, 0, 0.1), 0 0 30px rgba(255, 107, 0, 0.1)',
      ],
      transition: { duration: 0.2 },
    },
    imageScale: {
      scale: 1.03,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    badgeReveal: {
      initial: { opacity: 0, x: 8 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.2, delay: 0.05 },
    },
    ctaReveal: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.15, delay: 0.1 },
    },
  },

  // Thumbnail strip
  thumbnailStrip: {
    scroll: {
      type: 'spring',
      stiffness: 400,
      damping: 35,
    } as Transition,
    currentHighlight: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.2 },
    },
    dimmed: {
      scale: 1,
      opacity: 0.5,
      transition: { duration: 0.2 },
    },
  },

  // Image crossfade
  imageCrossfade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  },

  // Image directional hint (subtle)
  imageDirectional: {
    forward: {
      initial: { opacity: 0, x: 8 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -8 },
    },
    backward: {
      initial: { opacity: 0, x: -8 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 8 },
    },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },

  // Reduced motion alternatives
  reducedMotion: {
    panel: {
      enter: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.15 },
      },
      exit: {
        animate: { opacity: 0 },
        transition: { duration: 0.1 },
      },
    },
    cardHover: {
      lift: { y: 0 },
      imageScale: { scale: 1 },
    },
    imageCrossfade: {
      transition: { duration: 0.1 },
    },
  },
} as const;

export type DesktopAnimationsConfig = typeof DESKTOP_ANIMATIONS;
