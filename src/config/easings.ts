/**
 * Easing Functions Library
 *
 * Research-backed easing functions for different interaction types.
 *
 * PRINCIPLES:
 * - ease-out for ENTERING elements (fast start, slow end = "arriving")
 * - ease-in for EXITING elements (slow start, fast end = "leaving")
 * - ease-in-out for MOVING elements (smooth journey)
 * - spring for PLAYFUL interactions (overshoot = delight)
 */

// CSS cubic-bezier strings (for CSS transitions)
export const EASING_CSS = {
  // Standard easings
  linear: 'cubic-bezier(0, 0, 1, 1)',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',

  // Material Design (Google)
  materialStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  materialDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  materialAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',

  // Apple-style (smooth, premium)
  appleEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

  // Snappy (quick, responsive UI)
  snappy: 'cubic-bezier(0.2, 0, 0, 1)',

  // Bounce (overshoot effect)
  bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounceIn: 'cubic-bezier(0.36, 0, 0.66, -0.56)',

  // Elastic (spring-like)
  elasticOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Custom for Wojak.ink (Tang Gang feel)
  tangSnap: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  tangBounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Framer Motion easing arrays (for Motion animations)
export const EASING = {
  // Standard easings
  linear: [0, 0, 1, 1] as const,
  ease: [0.25, 0.1, 0.25, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,

  // Material Design (Google)
  materialStandard: [0.4, 0, 0.2, 1] as const,
  materialDecelerate: [0, 0, 0.2, 1] as const,
  materialAccelerate: [0.4, 0, 1, 1] as const,

  // Apple-style (smooth, premium)
  appleEase: [0.25, 0.46, 0.45, 0.94] as const,

  // Snappy (quick, responsive UI)
  snappy: [0.2, 0, 0, 1] as const,

  // Bounce (overshoot effect)
  bounceOut: [0.34, 1.56, 0.64, 1] as const,
  bounceIn: [0.36, 0, 0.66, -0.56] as const,

  // Elastic (spring-like)
  elasticOut: [0.68, -0.55, 0.265, 1.55] as const,

  // Custom for Wojak.ink (Tang Gang feel)
  tangSnap: [0.22, 0.61, 0.36, 1] as const,
  tangBounce: [0.175, 0.885, 0.32, 1.275] as const,
} as const;

// Framer Motion spring configs
export const SPRING = {
  // Snappy (buttons, toggles)
  snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },

  // Gentle (modals, cards)
  gentle: { type: 'spring' as const, stiffness: 300, damping: 30 },

  // Bouncy (playful elements)
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },

  // Slow (page transitions)
  slow: { type: 'spring' as const, stiffness: 200, damping: 30 },

  // None (reduced motion)
  instant: { type: 'tween' as const, duration: 0.05 },
} as const;

// Duration presets (milliseconds)
export const DURATION = {
  instant: 50,
  fast: 150,
  normal: 250,
  slow: 400,
  deliberate: 600,
} as const;

// Duration presets for Framer Motion (seconds)
export const DURATION_SECONDS = {
  instant: 0.05,
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  deliberate: 0.6,
} as const;
