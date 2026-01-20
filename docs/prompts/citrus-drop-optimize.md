# CitrusDrop Performance & Juice Audit

**Game:** CitrusDrop (Suika/Watermelon-style merge game)
**File:** `src/pages/CitrusDrop.tsx`
**Lines:** ~964 lines

## Executive Summary

CitrusDrop uses Matter.js for physics, which is appropriate for this type of game. The architecture is decent - it uses refs for physics bodies and only triggers React re-renders for score/UI updates. Canvas rendering is used. Main concerns are Matter.js optimization and potential memory leaks from merged pairs tracking.

---

## Performance Issues

### MODERATE

1. **Gradient Creation Per Frame**
   ```typescript
   // Lines 505-516: Gradients created every render call
   const fruitGradient = ctx.createRadialGradient(
     -fruit.radius * 0.3,
     -fruit.radius * 0.3,
     0,
     0,
     0,
     fruit.radius
   );
   ```

   **Fix:** Cache gradients per fruit type at initialization. Gradients are static - create them once.

2. **Matter.js Not Optimized**
   ```typescript
   // Lines 608-609: Default engine settings
   const engine = Engine.create({
     gravity: { x: 0, y: 1.2 },
   });
   ```

   **Fix:** Enable sleeping, reduce iterations for mobile:
   ```typescript
   const engine = Engine.create({
     gravity: { x: 0, y: 1.2 },
     enableSleeping: true,
     positionIterations: 4,
     velocityIterations: 3,
   });
   ```

3. **Merged Pairs Set Not Cleaned**
   ```typescript
   // Lines 127, 372-378: mergedPairsRef tracks merged pairs
   const mergedPairsRef = useRef<Set<string>>(new Set());
   // ...
   mergedPairsRef.current.add(pairKey);
   setTimeout(() => {
     mergedPairsRef.current.delete(pairKey);
   }, 10);
   ```

   The cleanup in setTimeout works, but there's potential for race conditions. Consider using a WeakSet or clearing on round end.

4. **Canvas Size Not DPR-Aware**
   ```typescript
   // Lines 854-858: Canvas uses dimensions directly
   <canvas
     ref={canvasRef}
     width={dimensions.width}
     height={dimensions.height}
   />
   ```

   **Fix:** Apply devicePixelRatio scaling with cap at 2:
   ```typescript
   const dpr = Math.min(window.devicePixelRatio || 1, 2);
   canvas.width = dimensions.width * dpr;
   canvas.height = dimensions.height * dpr;
   ctx.scale(dpr, dpr);
   ```

5. **Multiple setTimeout for Juice Effects**
   ```typescript
   // Lines 376-378: setTimeout for merge
   setTimeout(() => {
     mergeFruits(bodyA, bodyB);
     mergedPairsRef.current.delete(pairKey);
   }, 10);
   ```

   This is acceptable but consider using requestAnimationFrame queuing for visual effects.

### MINOR

6. **Dimension Recalculation on Resize**
   ```typescript
   // Lines 158-174: Resize handler
   const updateDimensions = () => {
     // recalculates on every resize
   };
   ```

   **Fix:** Debounce resize handler.

7. **Fruit Filtering Every Frame**
   ```typescript
   // Lines 425, 489: Filtering bodies every frame
   const fruits = world.bodies.filter((b) => b.label?.startsWith('fruit_'));
   ```

   **Fix:** Maintain separate fruit array in a ref, update on add/remove.

---

## Juice Assessment

### Already Implemented (Good!)

- **Screen Shake:** Triggered on higher-tier merges
- **Score Popups:** `addScorePopup` on merge
- **Epic Callouts:** "NICE MERGE!", "CITRUS MASTER!", "POMELO POWER!"
- **Confetti:** On high-tier merges and max level
- **Haptics:** `hapticScore`, `hapticCollision`, `hapticGameOver`
- **Combo System:** Tracks consecutive merges with timeout
- **Fruit Gradients:** Radial gradients with highlights
- **Drop Preview:** Ghost fruit and drop line

### Missing Juice

1. **No Merge Animation**
   - Fruits disappear instantly on merge. Add scale-up/pop animation on new fruit spawn.

2. **No Squash on Landing**
   - Fruits land without deformation. Add brief squash animation using render transform.

3. **No Particle Burst on Merge**
   - Merge could emit colored particles. Add burst at merge point.

4. **No Near-Full Warning**
   - Game over comes suddenly. Add visual warning (red pulse, vignette) when fruits near danger line.

5. **No Chain Reaction Visual**
   - When merges cause more merges, no visual indication. Add "CHAIN!" callout.

6. **No Fruit Wobble on Spawn**
   - New dropped fruit appears static. Add slight wobble/bounce on spawn.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/citrus-drop-optimize.md thoroughly, then review and optimize src/pages/CitrusDrop.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Cache fruit gradients at init - create 7 gradient objects (one per fruit type) and reuse
2. Optimize Matter.js engine settings: enableSleeping: true, positionIterations: 4, velocityIterations: 3
3. Apply devicePixelRatio scaling to canvas (cap at 2x)
4. Maintain separate fruitsRef array instead of filtering world.bodies every frame
5. Debounce window resize handler (200ms)
6. Clear mergedPairsRef on game reset to prevent memory buildup

JUICE (Priority 2):
1. Add merge animation (new fruit scales from 0.5 to 1.0 over 100ms with bounce easing)
2. Add squash animation on fruit landing (scale Y to 0.85 for 50ms)
3. Add particle burst on merge (8-12 particles in fruit's color, radiate outward)
4. Add danger warning when any fruit stays above danger line for 500ms (red vignette pulse)
5. Add "CHAIN x2!", "CHAIN x3!" callouts for consecutive merges within 500ms
6. Add slight wobble on newly dropped fruit (rotate ±5° over 200ms)

Target: Maintain smooth 60 FPS with 15+ fruits on iPhone 11
```

---

## Implementation Priority

1. **Medium Impact, Easy:** Cache fruit gradients
2. **Medium Impact, Easy:** Matter.js optimization settings
3. **Medium Impact, Medium:** DPR-aware canvas scaling
4. **Low Impact, Easy:** Add merge scale animation
5. **Low Impact, Easy:** Add squash on landing
6. **Low Impact, Medium:** Add particle burst on merge
