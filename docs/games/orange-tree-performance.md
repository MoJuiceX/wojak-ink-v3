# Orange Tree Generator - Mobile Performance Analysis & Optimization

> Analysis of performance bottlenecks and recommended optimizations for mobile-first deployment.

**Created:** January 2026
**Priority:** P0 - Must fix before deployment

---

## Executive Summary

### ⚠️ Current Performance Concerns

The current `drawOrangeTree()` function has **several expensive operations** that will cause lag on mobile:

| Issue | Severity | Impact |
|-------|----------|--------|
| Radial gradients created every frame | 🔴 High | 2-3 gradients per tree × ~20 trees = 40-60 gradient creations/frame |
| Linear gradient for trunk every frame | 🟡 Medium | 20 gradient creations/frame |
| Multiple `ctx.save()`/`ctx.restore()` | 🟡 Medium | State stack operations |
| `ctx.rotate()` transform | 🟡 Medium | Matrix calculations |
| 32-point polygon for canopy | 🟢 Low | Simple math, acceptable |
| Orange highlight circles | 🟢 Low | Simple arcs |

### ✅ Recommended Solution: Pre-render to Offscreen Canvas

Based on [MDN Canvas Optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) and [web.dev Canvas Performance](https://web.dev/canvas-performance/):

> "If you find yourself repeating the same drawing operations on each animation frame, consider offloading them to an offscreen canvas."

**Trees are STATIC** - they don't change shape during gameplay. Pre-render once, then use fast `drawImage()` to blit.

---

## Performance Bottleneck Analysis

### 1. Gradient Creation (🔴 CRITICAL)

**Current code creates gradients every frame:**
```typescript
// Called 60× per second per tree!
const canopyGradient = ctx.createRadialGradient(...);
canopyGradient.addColorStop(0, tree.canopyLight);
canopyGradient.addColorStop(0.4, tree.canopyMid);
canopyGradient.addColorStop(1, tree.canopyDark);
```

**Cost per tree per frame:**
- 1× radial gradient for canopy
- 1× linear gradient for trunk
- 5-10× radial gradients for oranges
- **Total: 7-12 gradient objects created PER TREE PER FRAME**

With 20 trees across 4 layers: **140-240 gradient creations per frame = 8,400-14,400 per second**

### 2. Canvas State Operations

```typescript
ctx.save();           // Push entire state to stack
ctx.translate(...);   // Matrix operation
ctx.rotate(...);      // Matrix operation
// ... drawing ...
ctx.restore();        // Pop and restore state
```

These are relatively cheap but add up with many trees.

### 3. Alpha Blending

```typescript
ctx.globalAlpha = alpha;  // Requires compositing
```

Alpha blending is GPU-accelerated but still has overhead.

---

## Recommended Optimizations

### Option A: Pre-render Trees to Offscreen Canvas (RECOMMENDED)

**Render each tree ONCE at game start to an offscreen canvas, then blit with `drawImage()`.**

```typescript
interface CachedOrangeTree extends OrangeTree {
  canvas: HTMLCanvasElement;  // Pre-rendered tree image
  width: number;
  height: number;
  anchorX: number;            // Where to position (center bottom)
  anchorY: number;
}

/**
 * Pre-render a tree to an offscreen canvas
 * Call ONCE at initialization, not every frame
 */
export const cacheOrangeTree = (tree: OrangeTree): CachedOrangeTree => {
  // Calculate bounding box with padding
  const padding = 10;
  const width = Math.ceil(tree.canopyRadius * 2 * tree.squash) + padding * 2;
  const height = Math.ceil(tree.trunkHeight + tree.canopyHeight * 2) + padding * 2;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw tree centered in canvas
  const anchorX = width / 2;
  const anchorY = height - padding;

  // Render tree ONCE (expensive operations happen here, not in game loop)
  drawOrangeTree(ctx, tree, anchorX, anchorY, 1);

  return {
    ...tree,
    canvas,
    width,
    height,
    anchorX,
    anchorY,
  };
};

/**
 * Fast drawing using pre-rendered cache
 * This is what runs 60× per second - just a single drawImage!
 */
export const drawCachedOrangeTree = (
  ctx: CanvasRenderingContext2D,
  cachedTree: CachedOrangeTree,
  x: number,
  groundY: number,
  alpha: number = 1
) => {
  if (alpha < 1) {
    ctx.globalAlpha = alpha;
  }

  // Single drawImage call - MUCH faster than all the gradient/path operations
  ctx.drawImage(
    cachedTree.canvas,
    Math.round(x - cachedTree.anchorX),  // Round to avoid sub-pixel rendering
    Math.round(groundY - cachedTree.anchorY)
  );

  if (alpha < 1) {
    ctx.globalAlpha = 1;
  }
};
```

**Performance improvement:**
- Before: 7-12 gradient creations + 32-point path + multiple fills per tree
- After: 1× `drawImage()` call per tree

**Estimated speedup: 10-20×** for tree rendering

### Option B: Simplified Flat Design (Alternative)

If pre-rendering is complex to implement, simplify the drawing:

```typescript
/**
 * Performance-optimized flat tree drawing
 * No gradients, minimal operations
 */
export const drawOrangeTreeFlat = (
  ctx: CanvasRenderingContext2D,
  tree: OrangeTree,
  x: number,
  groundY: number,
  alpha: number = 1
) => {
  ctx.globalAlpha = alpha;

  const canopyCenterY = groundY - tree.trunkHeight - tree.canopyHeight + tree.canopyOffsetY;
  const radiusX = tree.canopyRadius * tree.squash;
  const radiusY = tree.canopyHeight;

  // Trunk - solid color, no gradient
  ctx.fillStyle = tree.trunkColor;
  ctx.fillRect(
    Math.round(x - tree.trunkWidth / 3),
    Math.round(groundY - tree.trunkHeight),
    Math.round(tree.trunkWidth * 0.66),
    Math.round(tree.trunkHeight)
  );

  // Shadow layer - solid color
  ctx.fillStyle = tree.canopyDark;
  ctx.beginPath();
  ctx.ellipse(x + 3, canopyCenterY + 3, radiusX * 0.95, radiusY * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main canopy - solid color (no gradient!)
  ctx.fillStyle = tree.canopyMid;
  ctx.beginPath();
  ctx.ellipse(x, canopyCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Oranges - solid circles (no gradient!)
  ctx.fillStyle = tree.orangeColor;
  tree.oranges.forEach((orange) => {
    ctx.beginPath();
    ctx.arc(
      Math.round(x + orange.x * radiusX),
      Math.round(canopyCenterY + orange.y * radiusY),
      orange.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.globalAlpha = 1;
};
```

**Trade-off:** Less visual quality, but ~5× faster than gradient version.

### Option C: Hybrid Approach

Use **pre-rendered trees for parallax backgrounds** (static) and **flat drawing for any dynamic trees** (if needed).

---

## Implementation Recommendations

### For Claude-CLI Implementation

Add these to `orangeTree.ts`:

```typescript
// ============================================
// PERFORMANCE-OPTIMIZED RENDERING
// ============================================

/**
 * Cache for pre-rendered tree canvases
 */
const treeCache = new Map<number, CachedOrangeTree>();

/**
 * Pre-render a tree (call once at init)
 */
export const cacheOrangeTree = (tree: OrangeTree): CachedOrangeTree => {
  // Check if already cached
  if (treeCache.has(tree.seed)) {
    return treeCache.get(tree.seed)!;
  }

  const padding = 10;
  const width = Math.ceil(tree.canopyRadius * 2 * tree.squash) + padding * 2;
  const height = Math.ceil(tree.trunkHeight + tree.canopyHeight * 2) + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const anchorX = width / 2;
  const anchorY = height - padding;

  // Render once with full quality
  drawOrangeTree(ctx, tree, anchorX, anchorY, 1);

  const cached: CachedOrangeTree = {
    ...tree,
    canvas,
    width,
    height,
    anchorX,
    anchorY,
  };

  treeCache.set(tree.seed, cached);
  return cached;
};

/**
 * Fast cached drawing (use in game loop)
 */
export const drawCachedOrangeTree = (
  ctx: CanvasRenderingContext2D,
  cachedTree: CachedOrangeTree,
  x: number,
  groundY: number,
  alpha: number = 1
) => {
  const prevAlpha = ctx.globalAlpha;
  if (alpha < 1) ctx.globalAlpha = alpha;

  ctx.drawImage(
    cachedTree.canvas,
    Math.round(x - cachedTree.anchorX),
    Math.round(groundY - cachedTree.anchorY)
  );

  if (alpha < 1) ctx.globalAlpha = prevAlpha;
};

/**
 * Pre-cache all trees in a parallax layer
 */
export const cacheParallaxTreeLayer = (
  layer: ReturnType<typeof generateParallaxTreeLayer>
): CachedOrangeTree[] => {
  return layer.trees.map(cacheOrangeTree);
};

/**
 * Clear tree cache (call on game reset if needed)
 */
export const clearTreeCache = () => {
  treeCache.clear();
};
```

### Usage in Flappy Orange

```typescript
// At game initialization (once)
const treeLayers = useRef<{
  cachedTrees: CachedOrangeTree[];
  positions: number[];
  alpha: number;
}[]>([]);

useEffect(() => {
  // Generate and pre-render all trees ONCE
  const layers = [];
  for (let i = 0; i < 4; i++) {
    const layer = generateParallaxTreeLayer(i, 4, canvasWidth, gameSeed);
    layers.push({
      cachedTrees: cacheParallaxTreeLayer(layer),
      positions: layer.positions,
      alpha: layer.alpha,
    });
  }
  treeLayers.current = layers;

  // Cleanup
  return () => clearTreeCache();
}, []);

// In game loop (60fps) - FAST!
const drawTrees = (ctx: CanvasRenderingContext2D, scrollX: number) => {
  treeLayers.current.forEach((layer, layerIndex) => {
    const parallaxSpeed = 0.2 + layerIndex * 0.2;
    const offsetX = scrollX * parallaxSpeed;

    layer.cachedTrees.forEach((tree, i) => {
      let x = layer.positions[i] - (offsetX % (canvasWidth + 200));
      if (x < -100) x += canvasWidth + 200;

      // This is now just a single drawImage() call!
      drawCachedOrangeTree(ctx, tree, x, groundY, layer.alpha);
    });
  });
};
```

---

## Performance Budget

### Target: 60fps on mid-range mobile (iPhone 11, Pixel 5)

| Component | Budget | Optimized Estimate |
|-----------|--------|-------------------|
| Tree rendering (20 trees) | 2ms | ~0.5ms (with caching) |
| Parallax scrolling | 1ms | ~0.3ms |
| Player + pipes | 2ms | 2ms |
| Particles | 1ms | 1ms |
| UI overlay | 1ms | 1ms |
| **Total per frame** | **<8ms** | **~5ms** ✅ |

Frame budget at 60fps = 16.67ms, so we have headroom.

---

## Testing Recommendations

1. **Profile on real devices** - Chrome DevTools Performance tab, not just desktop
2. **Test on low-end Android** - Samsung A-series, older Pixels
3. **Monitor frame times** - Add FPS counter during development
4. **Test with particles active** - Combined load matters

### Quick Performance Test

```typescript
// Add to game for testing
const fpsRef = useRef({ frames: 0, lastTime: Date.now() });

// In game loop
fpsRef.current.frames++;
const now = Date.now();
if (now - fpsRef.current.lastTime >= 1000) {
  console.log('FPS:', fpsRef.current.frames);
  fpsRef.current = { frames: 0, lastTime: now };
}
```

---

## Summary

| Approach | Visual Quality | Performance | Complexity |
|----------|---------------|-------------|------------|
| Current (gradients every frame) | ⭐⭐⭐⭐⭐ | ⭐⭐ Poor | Low |
| **Pre-render + cache** (Recommended) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ Excellent | Medium |
| Flat design (no gradients) | ⭐⭐⭐ | ⭐⭐⭐⭐ Good | Low |

**Recommendation:** Implement **Option A (Pre-render to offscreen canvas)** for best balance of quality and performance.

---

## Sources

- [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [web.dev: Canvas Performance](https://web.dev/canvas-performance/)
- [web.dev: OffscreenCanvas](https://web.dev/articles/offscreen-canvas)
- [HTML5 Canvas Performance Tips (GitHub)](https://gist.github.com/jaredwilli/5469626)
