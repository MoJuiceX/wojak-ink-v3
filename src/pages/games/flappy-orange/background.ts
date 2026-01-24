/**
 * FlappyOrange Background & Celestial Rendering
 *
 * Pure rendering functions for background, sky, sun/moon, and ground.
 * Extracted from FlappyOrange.tsx for better modularity.
 */

import type { Cloud, Tree, Star } from './types';
import type { CycleInfo, InterpolatedColors } from './colors';
import { getCelestialPosition } from './colors';
import { lerpColor } from './utils';
import { drawCloud, drawTrees } from './renderers';

// ============================================
// TYPES
// ============================================

export interface GradientCache {
  skyGradient: CanvasGradient | null;
  lastColorKey: string;
}

export interface BackgroundDrawParams {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  cycleInfo: CycleInfo;
  colors: InterpolatedColors;
  stars: Star[];
  clouds: Cloud[];
  treesNear: Tree[];
  treesFar: Tree[];
  scrollOffset: number;
  performanceMode: boolean;
  gradientCache: GradientCache;
}

// ============================================
// CELESTIAL BODY RENDERING (SUN/MOON)
// ============================================

/**
 * Draw sun and moon with smooth crossfade transition
 * Handles sunrise/sunset and moonrise/moonset animations
 */
export function drawCelestialBody(
  ctx: CanvasRenderingContext2D,
  cycleInfo: CycleInfo,
  canvasWidth: number,
  canvasHeight: number
): void {
  const { isDay, phaseTime } = cycleInfo;
  const baseRadius = 28;

  // Calculate opacity for smooth crossfade at day/night boundaries
  let sunAlpha = 0;
  let moonAlpha = 0;

  if (isDay) {
    // Day: Sun fully visible, fading out only at very end for moon transition
    if (phaseTime < 0.85) {
      sunAlpha = 1;
    } else {
      // Last 15% - sun fades out while setting
      sunAlpha = 1 - (phaseTime - 0.85) / 0.15;
    }
    // Moon appears at horizon at very end of day
    if (phaseTime > 0.92) {
      moonAlpha = (phaseTime - 0.92) / 0.08;
    }
  } else {
    // Night: Moon visible
    if (phaseTime < 0.08) {
      // Moon finishes fading in at start of night
      moonAlpha = 0.5 + phaseTime / 0.08 * 0.5;
    } else if (phaseTime < 0.85) {
      moonAlpha = 1;
    } else {
      // Moon fades out at end of night
      moonAlpha = 1 - (phaseTime - 0.85) / 0.15;
    }
    // Sun appears at horizon at very end of night (pre-dawn)
    if (phaseTime > 0.92) {
      sunAlpha = (phaseTime - 0.92) / 0.08;
    }
  }

  ctx.save();

  // Draw SUN if visible
  if (sunAlpha > 0) {
    // During day: sun follows phaseTime (0->1 across sky)
    // During night end (pre-dawn): sun stays at horizon (position 0) while fading in
    const sunPhase = isDay ? phaseTime : 0;
    const sunPos = getCelestialPosition(sunPhase, canvasWidth, canvasHeight);
    const horizonFactor = 1 - Math.sin(sunPhase * Math.PI);
    const sizeMultiplier = 1 + horizonFactor * 0.4;
    const sunRadius = baseRadius * sizeMultiplier;

    // Sun colors - smooth interpolation between phases
    const effectivePhase = isDay ? phaseTime : 0;

    // Define color stops for sun throughout the day
    // Dawn (0): orange-red -> Morning (0.25): golden -> Noon (0.5): bright yellow -> Afternoon (0.75): golden -> Sunset (1): orange-red
    const sunColorStops = [
      { phase: 0, color: '#FF6633', glow: '#FF4400' },      // Dawn - deep orange
      { phase: 0.15, color: '#FF9966', glow: '#FF6633' },   // Early morning - orange
      { phase: 0.3, color: '#FFD700', glow: '#FFAA00' },    // Morning - golden
      { phase: 0.5, color: '#FFEE44', glow: '#FFFFAA' },    // Noon - bright yellow
      { phase: 0.7, color: '#FFD700', glow: '#FFAA00' },    // Afternoon - golden
      { phase: 0.85, color: '#FF9966', glow: '#FF6633' },   // Evening - orange
      { phase: 1.0, color: '#FF6633', glow: '#FF4400' },    // Sunset - deep orange
    ];

    // Find the two stops to interpolate between
    let fromStop = sunColorStops[0];
    let toStop = sunColorStops[1];
    for (let i = 0; i < sunColorStops.length - 1; i++) {
      if (effectivePhase >= sunColorStops[i].phase && effectivePhase <= sunColorStops[i + 1].phase) {
        fromStop = sunColorStops[i];
        toStop = sunColorStops[i + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const range = toStop.phase - fromStop.phase;
    const t = range > 0 ? (effectivePhase - fromStop.phase) / range : 0;

    // Smooth interpolation
    const sunColor = lerpColor(fromStop.color, toStop.color, t);

    ctx.globalAlpha = sunAlpha;
    ctx.fillStyle = sunColor;
    // Skip expensive shadowBlur - just draw the sun
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Draw MOON if visible
  if (moonAlpha > 0) {
    // During night: moon follows phaseTime (0->1 across sky)
    // During day end: moon stays at horizon (position 0) while fading in
    const moonPhase = isDay ? 0 : phaseTime;
    const moonPos = getCelestialPosition(moonPhase, canvasWidth, canvasHeight);
    const horizonFactor = 1 - Math.sin(moonPhase * Math.PI);
    const sizeMultiplier = 1 + horizonFactor * 0.4;
    const moonRadius = baseRadius * 0.85 * sizeMultiplier;

    // Simple moon color (skip per-frame RGB calculation)
    ctx.globalAlpha = moonAlpha;
    ctx.fillStyle = '#FFFACD';  // Simple pale moon color
    // Skip expensive shadowBlur
    ctx.beginPath();
    ctx.arc(moonPos.x, moonPos.y, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Moon craters (simplified - skip when low alpha)
    if (moonAlpha > 0.7) {
      ctx.fillStyle = 'rgba(200, 200, 180, 0.2)';
      ctx.beginPath();
      ctx.arc(moonPos.x - moonRadius * 0.2, moonPos.y - moonRadius * 0.2, moonRadius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ============================================
// STAR RENDERING
// ============================================

/**
 * Calculate star visibility based on day/night cycle
 * Stars fade slowly during transitions
 */
export function calculateStarVisibility(cycleInfo: CycleInfo): number {
  const { isDay, phaseTime } = cycleInfo;
  let starVisibility = 0;  // 0 = no stars, 1 = all stars visible

  if (isDay) {
    // During day: stars fade out slowly at dawn, fade in slowly at dusk
    if (phaseTime < 0.25) {
      // First ~7.5s of day - stars slowly fading out (100% -> 0%)
      // Use easeOutQuad for gradual fade that slows down
      const t = phaseTime / 0.25;
      const easedT = 1 - (1 - t) * (1 - t);  // Ease out - starts fast, slows down
      starVisibility = 1 - easedT;
    } else if (phaseTime > 0.80) {
      // Last ~6s of day - stars slowly starting to appear for night
      const t = (phaseTime - 0.80) / 0.20;
      const easedT = t * t;  // Ease in - starts slow
      starVisibility = easedT * 0.5;  // Fade up to 50% by end of day
    }
  } else {
    // Night: stars fade in over first 20%, stay visible, fade out over last 20%
    if (phaseTime < 0.20) {
      // First ~6s of night - stars fading in (50% -> 100%)
      const t = phaseTime / 0.20;
      const easedT = t * t;  // Ease in
      starVisibility = 0.5 + easedT * 0.5;
    } else if (phaseTime > 0.80) {
      // Last ~6s of night - stars fading out (100% -> 100% for smooth handoff to day)
      starVisibility = 1;  // Stay at full visibility, day phase handles the fade
    } else {
      // Deep night - all stars visible
      starVisibility = 1;
    }
  }

  return starVisibility;
}

/**
 * Draw stars with visibility based on day/night cycle
 */
export function drawStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  starVisibility: number
): void {
  if (starVisibility <= 0 || stars.length === 0) return;

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  stars.forEach((star) => {
    // Use pre-calculated alpha (no per-frame Math.sin)
    const alpha = starVisibility * star.alpha;
    if (alpha > 0.05) {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ============================================
// CLOUD RENDERING
// ============================================

/**
 * Calculate cloud opacity multiplier based on day/night cycle
 */
export function calculateCloudOpacity(cycleInfo: CycleInfo): number {
  const { isDay, phaseTime } = cycleInfo;
  let cloudOpacityMultiplier = 1;

  if (isDay) {
    // Day: clouds fade in at dawn, fade out at dusk
    if (phaseTime < 0.1) {
      // First 3s - clouds fading in from night level (50% -> 100%)
      cloudOpacityMultiplier = 0.5 + (phaseTime / 0.1) * 0.5;
    } else if (phaseTime > 0.9) {
      // Last 3s - clouds fading out for night (100% -> 50%)
      cloudOpacityMultiplier = 0.5 + ((1 - phaseTime) / 0.1) * 0.5;
    }
  } else {
    // Night: clouds dimmer, smooth transitions
    if (phaseTime < 0.1) {
      // First 3s - clouds continuing to dim (50% -> 30%)
      cloudOpacityMultiplier = 0.5 - (phaseTime / 0.1) * 0.2;
    } else if (phaseTime > 0.9) {
      // Last 3s - clouds brightening for dawn (30% -> 50%)
      cloudOpacityMultiplier = 0.3 + ((phaseTime - 0.9) / 0.1) * 0.2;
    } else {
      cloudOpacityMultiplier = 0.3;  // Deep night: 30% opacity
    }
  }

  return cloudOpacityMultiplier;
}

/**
 * Draw clouds with parallax scrolling
 */
export function drawClouds(
  ctx: CanvasRenderingContext2D,
  clouds: Cloud[],
  cloudColor: string,
  scrollOffset: number,
  canvasWidth: number,
  cloudOpacityMultiplier: number
): void {
  clouds.forEach(cloud => {
    const adjustedX = ((cloud.x - scrollOffset * cloud.speed) % (canvasWidth * 1.5)) + canvasWidth * 0.25;
    const adjustedCloud = {
      ...cloud,
      x: adjustedX < -cloud.width ? adjustedX + canvasWidth * 1.5 : adjustedX,
      opacity: cloud.opacity * cloudOpacityMultiplier
    };
    drawCloud(ctx, adjustedCloud, cloudColor);
  });
}

// ============================================
// MAIN BACKGROUND RENDERER
// ============================================

/**
 * Draw complete background including sky, celestial bodies, trees, clouds, and ground
 *
 * This is the main background rendering function that orchestrates all background elements.
 */
export function drawBackground(params: BackgroundDrawParams): void {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    cycleInfo,
    colors,
    stars,
    clouds,
    treesNear,
    treesFar,
    scrollOffset,
    performanceMode,
    gradientCache,
  } = params;

  // Sky - gradient for better visuals with interpolated colors
  if (!performanceMode) {
    // Use cached gradient - only recreate when colors change (not every frame!)
    const colorKey = `${colors.skyTop}-${colors.skyBottom}`;
    if (colorKey !== gradientCache.lastColorKey || !gradientCache.skyGradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.7);
      gradient.addColorStop(0, colors.skyTop);
      gradient.addColorStop(1, colors.skyBottom);
      gradientCache.skyGradient = gradient;
      gradientCache.lastColorKey = colorKey;
    }
    ctx.fillStyle = gradientCache.skyGradient!;
  } else {
    ctx.fillStyle = colors.skyBottom;
  }
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (!performanceMode) {
    // Draw stars FIRST (very back of background, behind everything)
    const starVisibility = calculateStarVisibility(cycleInfo);
    drawStars(ctx, stars, starVisibility);

    // Draw sun/moon with smooth arc movement
    drawCelestialBody(ctx, cycleInfo, canvasWidth, canvasHeight);

    // Far trees (orange grove) with interpolated colors
    if (treesFar.length > 0) {
      drawTrees(ctx, treesFar, colors.treeFoliageFar, colors.treeTrunk, scrollOffset * 0.2, true, canvasWidth, canvasHeight, colors.orangeFruit);
    }

    // Near trees (orange grove) with interpolated colors
    if (treesNear.length > 0) {
      drawTrees(ctx, treesNear, colors.treeFoliage, colors.treeTrunk, scrollOffset * 0.4, false, canvasWidth, canvasHeight, colors.orangeFruit);
    }

    // Clouds with opacity based on time of day
    const cloudOpacityMultiplier = calculateCloudOpacity(cycleInfo);
    drawClouds(ctx, clouds, colors.clouds, scrollOffset, canvasWidth, cloudOpacityMultiplier);
  }

  // Ground with interpolated colors
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, canvasHeight - 20, canvasWidth, 20);

  // Ground grass strip
  ctx.fillStyle = colors.grass;
  ctx.fillRect(0, canvasHeight - 20, canvasWidth, 5);
}
