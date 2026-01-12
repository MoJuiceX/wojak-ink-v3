/**
 * Treasury Animation Configuration
 *
 * Animation presets for the Treasury page components.
 */

export const TREASURY_ANIMATIONS = {
  // Value counting
  valueCount: {
    duration: 1.5,
    ease: [0.16, 1, 0.3, 1] as const, // Custom ease-out
    delay: 0.2, // After card enters
  },

  // Card entrance
  cardEntrance: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
    stagger: 0.1, // Delay between cards
  },

  // Bubble spawn
  bubbleSpawn: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
    stagger: 0.05, // Bubbles appear sequentially
  },

  // Bubble pop
  bubblePop: {
    scale: { from: 1, to: 0 },
    opacity: { from: 1, to: 0 },
    duration: 150, // ms
    ease: 'easeIn',
  },

  // Bubble respawn
  bubbleRespawn: {
    scale: { from: 0, to: 1 },
    opacity: { from: 0, to: 1 },
    duration: 300,
    ease: [0.34, 1.56, 0.64, 1] as const, // Overshoot
  },

  // Glow pulse on portfolio card
  glowPulse: {
    keyframes: [{ opacity: 0.15 }, { opacity: 0.25 }, { opacity: 0.15 }],
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },

  // Toast notification
  toast: {
    initial: { opacity: 0, y: 50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 },
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },

  // Reduced motion
  reducedMotion: {
    valueCount: { duration: 0 },
    bubbleSpawn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    },
    bubblePop: { duration: 50 },
    glowPulse: null, // Disable pulsing
  },
} as const;

export type TreasuryAnimationsConfig = typeof TREASURY_ANIMATIONS;
