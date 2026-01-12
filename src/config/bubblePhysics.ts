/**
 * Bubble Physics Configuration
 *
 * Physics constants for the crypto bubble visualization.
 */

export const BUBBLE_PHYSICS = {
  // Canvas sizing
  canvas: {
    mobile: { width: 360, height: 340 },
    tablet: { width: 480, height: 400 },
    desktop: { width: 600, height: 450 },
    maxWidth: 720,
    aspectRatio: 360 / 340, // Maintain on resize
  },

  // Bubble sizing (logarithmic scale)
  sizing: {
    minRadius: 24, // Minimum bubble radius (px)
    maxRadius: 80, // Maximum bubble radius (px)
    xchMinRadius: 48, // XCH is always prominent

    // Logarithmic scaling formula:
    // radius = minRadius + (maxRadius - minRadius) * (log10(value + 1) / log10(maxValue + 1))
    // This prevents huge value disparities from dominating

    valueThreshold: 1, // Minimum $1 to show as bubble
  },

  // Physics constants
  physics: {
    friction: 0.995, // Velocity decay per frame (1 = no friction)
    restitution: 0.85, // Bounce energy retention (1 = perfect bounce)
    maxVelocity: 8, // Max velocity cap (px/frame)
    minVelocity: 0.1, // Below this, snap to 0

    // Initial spawn velocity
    spawnVelocity: {
      min: 1,
      max: 3,
    },

    // Collision response
    collisionDamping: 0.9, // Energy lost in bubble-bubble collision
    separationForce: 0.5, // Force to separate overlapping bubbles
  },

  // Wall collision
  walls: {
    padding: 4, // Keep bubbles this far from edge
    restitution: 0.9, // Wall bounce retention
  },

  // Ambient movement (gentle floating)
  ambient: {
    enabled: true,
    noiseScale: 0.001, // Perlin noise scale
    noiseStrength: 0.3, // Force applied from noise
    updateInterval: 100, // ms between noise recalculation
  },

  // Timing
  timing: {
    targetFPS: 60,
    maxDeltaTime: 32, // Cap delta to prevent huge jumps
    respawnDelay: 30000, // 30 seconds to respawn popped bubble
    celebrationDuration: 3000, // 3 seconds of confetti
  },

  // Performance limits
  performance: {
    maxBubbles: 20, // Max concurrent bubbles
    maxParticles: 100, // Max particles across all effects
    maxRipples: 5, // Max concurrent ripples
    skipFramesOnLag: true, // Skip physics on frame drops
  },
} as const;

// Pop effect configuration
export const POP_EFFECTS = {
  particles: {
    count: { min: 10, max: 15 },
    radius: { min: 3, max: 8 },
    velocity: { min: 3, max: 8 },
    decay: { min: 0.015, max: 0.025 },
    gravity: 0.15,
  },

  ripple: {
    maxRadius: 80,
    expandSpeed: 4,
    fadeSpeed: 0.04,
  },

  confetti: {
    particleCount: 150,
    spread: 360,
    startVelocity: 30,
    decay: 0.94,
    gravity: 0.8,
    colors: ['#ff6b00', '#ff8c00', '#ffaa00', '#22c55e', '#4ade80'],
  },
} as const;

export type BubblePhysicsConfig = typeof BUBBLE_PHYSICS;
export type PopEffectsConfig = typeof POP_EFFECTS;
