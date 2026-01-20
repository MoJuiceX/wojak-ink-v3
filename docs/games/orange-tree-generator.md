# Procedural Orange Tree Generator

> Create realistic, varied orange trees for Flappy Orange backgrounds using procedural generation.

**Created:** January 2026
**Location:** `src/lib/canvas/orangeTree.ts`

---

## Overview

This generator creates citrus/orange trees with:
- **Smooth dome canopy** (realistic citrus tree shape)
- **Medium variation** between trees (cohesive grove feel)
- **Oranges at highlighted edges** (visible and appealing)
- **Layered shading** (3D depth effect)

Based on research:
- [University of Florida Citrus Canopy Management](https://edis.ifas.ufl.edu/publication/SS698) - "Citrus trees form dense green globes"
- [Procedural Tree Generation](https://aurbano.eu/post/wp/2013-01-14-procedurally-generated-trees-in-javascript/) - Seed-based variation
- [L-Systems Tutorial](https://hardlikesoftware.com/weblog/2008/01/23/l-systems-in-javascript-using-canvas/) - Organic shapes

---

## Quick Start

```typescript
import {
  generateOrangeTree,
  drawOrangeTree,
  generateOrangeGrove,
  generateParallaxTreeLayer,
} from '@/lib/canvas';

// Generate a single tree
const tree = generateOrangeTree({ seed: 12345 });

// Draw it at position (200, 500) where 500 is ground Y
drawOrangeTree(ctx, tree, 200, 500);

// Generate a grove of 5 trees
const grove = generateOrangeGrove(5, { baseSeed: 42 });

// Generate trees for parallax layers
const layer = generateParallaxTreeLayer(2, 4, canvasWidth);
```

---

## API Reference

### `generateOrangeTree(config?)`

Generates a single tree configuration.

**Config Options:**
```typescript
interface OrangeTreeConfig {
  seed?: number;           // Reproducible randomization
  baseRadius?: number;     // Canopy size (40-70px default)
  scale?: number;          // Overall scale multiplier

  // Color overrides
  canopyLight?: string;    // Default: '#4a7c4e'
  canopyMid?: string;      // Default: '#2d5a30'
  canopyDark?: string;     // Default: '#1a3d1c'
  trunkColor?: string;     // Default: '#5d4037'
  orangeColor?: string;    // Default: '#ff8c00'
  orangeHighlight?: string; // Default: '#ffb347'

  orangeCount?: number;    // Override random count (5-10 default)
}
```

**Returns `OrangeTree`:**
```typescript
interface OrangeTree {
  seed: number;
  canopyRadius: number;
  canopyHeight: number;
  leanAngle: number;       // -3° to 3° natural lean
  trunkWidth: number;
  trunkHeight: number;
  oranges: Array<{ x, y, size, depth }>;
  // ... colors and shape variations
}
```

### `drawOrangeTree(ctx, tree, x, groundY, alpha?)`

Renders a tree at the specified position.

**Parameters:**
- `ctx` - Canvas 2D context
- `tree` - Generated tree data
- `x` - X position (center of tree base)
- `groundY` - Y position of ground line
- `alpha` - Opacity (0-1, for parallax depth)

### `generateOrangeGrove(count, config?)`

Generates multiple trees with consistent variation.

```typescript
const grove = generateOrangeGrove(8, {
  baseSeed: 42,
  scale: 0.8,
});
```

### `generateParallaxTreeLayer(layerIndex, layerCount, canvasWidth, baseSeed?)`

Generates trees optimized for a parallax layer.

```typescript
// Generate 4 parallax layers
for (let i = 0; i < 4; i++) {
  const { trees, positions, scale, alpha } = generateParallaxTreeLayer(
    i,      // Layer index (0 = far back)
    4,      // Total layers
    400,    // Canvas width
    12345   // Base seed
  );

  // Draw each tree
  trees.forEach((tree, j) => {
    drawOrangeTree(ctx, tree, positions[j], groundY, alpha);
  });
}
```

**Layer Characteristics:**
| Layer | Scale | Alpha | Tree Count |
|-------|-------|-------|------------|
| 0 (back) | 0.4 | 0.3 | 8 |
| 1 | 0.6 | 0.53 | 6 |
| 2 | 0.8 | 0.77 | 4 |
| 3 (front) | 1.0 | 1.0 | 3 |

---

## Integration with Flappy Orange

### Replace Current Trees

In your Flappy Orange game, replace the generic pine tree rendering with:

```typescript
// At game initialization
const treeLayersRef = useRef<{
  trees: OrangeTree[];
  positions: number[];
  alpha: number;
}[]>([]);

// Initialize tree layers
useEffect(() => {
  const layers = [];
  for (let i = 0; i < 4; i++) {
    layers.push(generateParallaxTreeLayer(i, 4, canvasWidth, gameSeed));
  }
  treeLayersRef.current = layers;
}, []);

// In render loop
const drawTrees = (ctx: CanvasRenderingContext2D, scrollX: number) => {
  treeLayersRef.current.forEach((layer, layerIndex) => {
    const parallaxSpeed = 0.2 + (layerIndex * 0.2); // Back = slow, front = fast
    const offsetX = scrollX * parallaxSpeed;

    layer.trees.forEach((tree, i) => {
      let x = layer.positions[i] - (offsetX % (canvasWidth + 200));
      if (x < -100) x += canvasWidth + 200; // Wrap around

      drawOrangeTree(ctx, tree, x, groundY, layer.alpha);
    });
  });
};
```

### Z-Index Order

Draw layers back-to-front:
1. Sky gradient
2. Far mountains/hills
3. **Tree layer 0** (far, small, transparent)
4. **Tree layer 1**
5. **Tree layer 2**
6. **Tree layer 3** (close, large, opaque)
7. Ground
8. Pipes
9. Player
10. UI

---

## Customization Examples

### Autumn Theme

```typescript
const autumnTree = generateOrangeTree({
  seed: 42,
  canopyLight: '#c9a227',   // Golden
  canopyMid: '#b8860b',     // Dark goldenrod
  canopyDark: '#8b6914',    // Brown-gold
  orangeColor: '#ff6600',   // Deeper orange
});
```

### Night Theme

```typescript
const nightTree = generateOrangeTree({
  seed: 42,
  canopyLight: '#1a3d1c',   // Dark green
  canopyMid: '#0f2810',     // Very dark
  canopyDark: '#061206',    // Almost black
  orangeColor: '#cc5500',   // Muted orange
});
```

### Larger Trees for Foreground

```typescript
const bigTree = generateOrangeTree({
  seed: 42,
  scale: 1.5,
  baseRadius: 70,
  orangeCount: 12,
});
```

### Smaller Trees for Background

```typescript
const smallTree = generateOrangeTree({
  seed: 42,
  scale: 0.5,
  orangeCount: 4,
});
```

---

## Visual Reference

```
          .--~~~--.
        .'  🍊    `.
       /    🍊      \        ← Oranges at edges
      :              :
      :   🍊    🍊   :       ← Layered shading
       \    🍊     /
        `.       .'
     .--~`-....-'~--.
    :                :       ← Smooth dome canopy
     `.            .'
       `-.______.-'
           |||
           |||               ← Short trunk (often hidden)
    ═══════════════════      ← Ground
```

### Shape Variations

Each tree has subtle differences controlled by seed:
- **Lean angle:** -3° to +3° (natural asymmetry)
- **Squash:** 0.92 to 1.08 (slightly wider or taller)
- **Bump amount:** 2-6% edge waviness
- **Orange count:** 5-10 fruits
- **Orange positions:** Randomized but biased to edges

---

## Performance Notes

- Trees are generated once and cached (not every frame)
- Drawing uses basic canvas operations (fast)
- ~20 trees across 4 layers = negligible performance impact
- For extreme optimization, pre-render trees to offscreen canvas

---

## Related Files

- `src/lib/canvas/orangeTree.ts` - Generator source
- `src/lib/canvas/parallax.ts` - Parallax system
- `src/pages/FlappyOrange.tsx` - Game implementation
