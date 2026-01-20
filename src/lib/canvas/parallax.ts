/**
 * Parallax System
 * Multi-layer scrolling backgrounds for depth effect
 */

// ============================================
// TYPES
// ============================================

export interface ParallaxLayer {
  name: string;
  speedMultiplier: number; // 0 = static, 1 = full speed
  yPosition: number; // 0-1 (percentage from top)
  opacity: number;
  elements: ParallaxElement[];
}

export interface ParallaxElement {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  draw?: (ctx: CanvasRenderingContext2D, element: ParallaxElement) => void;
}

export interface ParallaxSystem {
  layers: ParallaxLayer[];
  scrollOffset: number;
  screenWidth: number;
  screenHeight: number;
}

// ============================================
// SYSTEM CREATION
// ============================================

/**
 * Create a parallax system
 */
export const createParallaxSystem = (
  screenWidth: number,
  screenHeight: number
): ParallaxSystem => ({
  layers: [],
  scrollOffset: 0,
  screenWidth,
  screenHeight,
});

/**
 * Add layer to system
 */
export const addParallaxLayer = (
  system: ParallaxSystem,
  layer: ParallaxLayer
): void => {
  system.layers.push(layer);
  // Sort by speed (slowest/furthest first)
  system.layers.sort((a, b) => a.speedMultiplier - b.speedMultiplier);
};

// ============================================
// PRESET LAYERS
// ============================================

/**
 * Create mountain silhouette layer
 */
export const createMountainLayer = (
  screenWidth: number,
  screenHeight: number,
  color: string = 'rgba(100, 100, 150, 0.4)',
  speedMultiplier: number = 0.2
): ParallaxLayer => {
  const elements: ParallaxElement[] = [];

  // Generate mountain peaks
  const peakCount = Math.ceil(screenWidth / 100) + 2;
  for (let i = 0; i < peakCount; i++) {
    elements.push({
      type: 'mountain',
      x: i * 100 - 50,
      y: screenHeight * 0.5,
      width: 150 + Math.random() * 100,
      height: 80 + Math.random() * 60,
      color,
    });
  }

  return {
    name: 'mountains',
    speedMultiplier,
    yPosition: 0.5,
    opacity: 1,
    elements,
  };
};

/**
 * Create cloud layer
 */
export const createCloudLayer = (
  screenWidth: number,
  screenHeight: number,
  color: string = '#FFFFFF',
  speedMultiplier: number = 0.5,
  cloudCount: number = 5
): ParallaxLayer => {
  const elements: ParallaxElement[] = [];

  for (let i = 0; i < cloudCount; i++) {
    elements.push({
      type: 'cloud',
      x: Math.random() * screenWidth * 1.5,
      y: 50 + Math.random() * (screenHeight * 0.3),
      width: 80 + Math.random() * 60,
      height: 30 + Math.random() * 20,
      color,
    });
  }

  return {
    name: 'clouds',
    speedMultiplier,
    yPosition: 0.2,
    opacity: 0.7,
    elements,
  };
};

/**
 * Create foreground grass layer
 */
export const createGrassLayer = (
  screenWidth: number,
  screenHeight: number,
  color: string = '#228B22',
  speedMultiplier: number = 1.1
): ParallaxLayer => {
  const elements: ParallaxElement[] = [];

  const tuftCount = Math.ceil(screenWidth / 25) + 2;
  for (let i = 0; i < tuftCount; i++) {
    elements.push({
      type: 'grass',
      x: i * 25,
      y: screenHeight - 20,
      width: 8,
      height: 6 + Math.random() * 4,
      color,
    });
  }

  return {
    name: 'foreground',
    speedMultiplier,
    yPosition: 0.95,
    opacity: 1,
    elements,
  };
};

// ============================================
// DRAWING FUNCTIONS
// ============================================

/**
 * Draw a mountain element
 */
export const drawMountain = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): void => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y + height);
  ctx.lineTo(x, y);
  ctx.lineTo(x + width / 2, y + height);
  ctx.closePath();
  ctx.fill();
};

/**
 * Draw a cloud element (fluffy circles)
 */
export const drawCloud = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): void => {
  ctx.fillStyle = color;

  // Draw overlapping circles for fluffy effect
  const puffs = [
    { dx: 0, dy: 0, r: height * 0.6 },
    { dx: width * 0.3, dy: -height * 0.1, r: height * 0.5 },
    { dx: -width * 0.25, dy: height * 0.05, r: height * 0.45 },
    { dx: width * 0.15, dy: height * 0.15, r: height * 0.4 },
  ];

  puffs.forEach((puff) => {
    ctx.beginPath();
    ctx.arc(x + puff.dx, y + puff.dy, puff.r, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * Draw a grass tuft
 */
export const drawGrassTuft = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): void => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width / 2, y - height);
  ctx.lineTo(x + width, y);
  ctx.closePath();
  ctx.fill();
};

// ============================================
// SYSTEM UPDATE & RENDER
// ============================================

/**
 * Update parallax scroll offset
 */
export const updateParallax = (
  system: ParallaxSystem,
  scrollDelta: number
): void => {
  system.scrollOffset += scrollDelta;
};

/**
 * Set parallax scroll offset directly
 */
export const setParallaxOffset = (
  system: ParallaxSystem,
  offset: number
): void => {
  system.scrollOffset = offset;
};

/**
 * Draw all parallax layers
 */
export const drawParallaxSystem = (
  ctx: CanvasRenderingContext2D,
  system: ParallaxSystem
): void => {
  system.layers.forEach((layer) => {
    drawParallaxLayer(ctx, system, layer);
  });
};

/**
 * Draw a single parallax layer
 */
export const drawParallaxLayer = (
  ctx: CanvasRenderingContext2D,
  system: ParallaxSystem,
  layer: ParallaxLayer
): void => {
  ctx.save();
  ctx.globalAlpha = layer.opacity;

  const layerOffset = system.scrollOffset * layer.speedMultiplier;

  layer.elements.forEach((element) => {
    // Calculate wrapped X position
    const totalWidth = system.screenWidth * 1.5;
    let drawX = element.x - (layerOffset % totalWidth);

    // Wrap around
    if (drawX < -element.width) {
      drawX += totalWidth;
    }

    // Draw element
    if (element.draw) {
      element.draw(ctx, { ...element, x: drawX });
    } else {
      // Default drawing based on type
      switch (element.type) {
        case 'mountain':
          drawMountain(
            ctx,
            drawX,
            element.y,
            element.width,
            element.height,
            element.color
          );
          break;
        case 'cloud':
          drawCloud(
            ctx,
            drawX,
            element.y,
            element.width,
            element.height,
            element.color
          );
          break;
        case 'grass':
          drawGrassTuft(
            ctx,
            drawX,
            element.y,
            element.width,
            element.height,
            element.color
          );
          break;
        default:
          // Generic rectangle
          ctx.fillStyle = element.color;
          ctx.fillRect(drawX, element.y, element.width, element.height);
      }
    }
  });

  ctx.restore();
};

// ============================================
// PRESET CONFIGURATIONS
// ============================================

/**
 * Create a 7-layer parallax system (premium)
 */
export const createPremiumParallaxSystem = (
  screenWidth: number,
  screenHeight: number,
  theme: 'day' | 'sunset' | 'night' | 'storm' = 'day'
): ParallaxSystem => {
  const system = createParallaxSystem(screenWidth, screenHeight);

  const themes = {
    day: {
      mountain: 'rgba(100, 120, 150, 0.3)',
      hill: 'rgba(80, 150, 80, 0.4)',
      cloud: '#FFFFFF',
      grass: '#228B22',
    },
    sunset: {
      mountain: 'rgba(80, 60, 100, 0.4)',
      hill: 'rgba(100, 80, 60, 0.5)',
      cloud: '#FFB347',
      grass: '#6B8E23',
    },
    night: {
      mountain: 'rgba(30, 40, 60, 0.5)',
      hill: 'rgba(40, 50, 70, 0.4)',
      cloud: 'rgba(60, 70, 90, 0.5)',
      grass: '#1B4D1B',
    },
    storm: {
      mountain: 'rgba(50, 50, 60, 0.5)',
      hill: 'rgba(60, 60, 70, 0.4)',
      cloud: 'rgba(80, 80, 90, 0.7)',
      grass: '#2E5E2E',
    },
  };

  const colors = themes[theme];

  // Layer 1: Far mountains (slowest)
  addParallaxLayer(
    system,
    createMountainLayer(screenWidth, screenHeight, colors.mountain, 0.2)
  );

  // Layer 2: Hills
  addParallaxLayer(system, {
    name: 'hills',
    speedMultiplier: 0.35,
    yPosition: 0.6,
    opacity: 1,
    elements: createHillElements(screenWidth, screenHeight, colors.hill),
  });

  // Layer 3: Clouds
  addParallaxLayer(
    system,
    createCloudLayer(screenWidth, screenHeight, colors.cloud, 0.5, 6)
  );

  // Layer 4: Foreground grass
  addParallaxLayer(
    system,
    createGrassLayer(screenWidth, screenHeight, colors.grass, 1.1)
  );

  return system;
};

/**
 * Create hill elements
 */
const createHillElements = (
  screenWidth: number,
  screenHeight: number,
  color: string
): ParallaxElement[] => {
  const elements: ParallaxElement[] = [];
  const hillCount = Math.ceil(screenWidth / 150) + 2;

  for (let i = 0; i < hillCount; i++) {
    elements.push({
      type: 'mountain', // Use same drawing as mountain
      x: i * 150 - 75,
      y: screenHeight * 0.65,
      width: 200 + Math.random() * 100,
      height: 50 + Math.random() * 30,
      color,
    });
  }

  return elements;
};
