/**
 * Spring Physics Presets
 *
 * Named for their feel, not physics values.
 * Tuned for UI interactions based on:
 * - Framer Motion defaults (stiffness: 100, damping: 10, mass: 1)
 * - Apple SwiftUI recommendations (damping: 15, stiffness: 170)
 * - Material Design physics guidelines
 */

/**
 * SPRING PHYSICS:
 *
 * STIFFNESS: Higher = snappier, faster | Lower = softer, slower
 * DAMPING: Higher = less bounce | Lower = more bounce
 * MASS: Higher = more inertia | Lower = more responsive
 *
 * DAMPING TYPES:
 * - Underdamped (< critical): Bounces past target
 * - Critically damped: Fastest without bounce
 * - Overdamped: Slow, no bounce
 */

export const SPRING = {
  // Snappy, minimal bounce - buttons, toggles
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  // Quick with subtle bounce - cards, lists
  quick: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 25,
    mass: 1,
  },

  // Balanced feel - modals, drawers
  balanced: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },

  // Gentle, smooth - page transitions
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 18,
    mass: 1,
  },

  // Bouncy, playful - celebrations, achievements
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 15,
    mass: 1,
  },

  // Very bouncy - special effects, gamification
  elastic: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 10,
    mass: 1,
  },

  // Soft landing - dropdowns, tooltips
  soft: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1,
  },

  // Heavy, deliberate - large UI elements
  heavy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 30,
    mass: 1.5,
  },
} as const;

export type SpringPreset = keyof typeof SPRING;
export type SpringConfig = (typeof SPRING)[SpringPreset];

/**
 * When to use Springs vs Tween (duration-based):
 *
 * USE SPRINGS FOR:
 * - Interactive elements (buttons, cards)
 * - Drag and drop
 * - Gestures (swipe, pinch)
 * - Position/scale changes
 * - Anything that should feel "physical"
 *
 * USE TWEEN (DURATION) FOR:
 * - Opacity fades
 * - Color changes
 * - Sequential animations
 * - Precisely timed animations
 * - Progress indicators
 */
