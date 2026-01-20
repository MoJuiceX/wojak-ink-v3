# Mobile Performance Audit Results

**Date:** January 2026
**Auditor:** Claude Code
**Focus:** FlappyOrange, CitrusDrop, and shared libraries

---

## Executive Summary

The codebase has **3 critical performance issues** causing mobile lag: (1) gradients created every frame instead of cached, (2) setState calls inside game loops triggering React re-renders, and (3) event listeners not cleaned up causing memory leaks. Additionally, unbounded particle arrays and per-sound audio node creation add cumulative overhead.

---

## Critical Issues (Fix Immediately)

### Issue 1: Gradients Created Every Frame

- **File(s):** `src/pages/FlappyOrange.tsx` (lines 2147-2150), `src/pages/CitrusDrop.tsx` (lines 458, 475, 505-512)
- **Problem:** `ctx.createLinearGradient()` and `ctx.createRadialGradient()` called inside render loop, creating 20-30+ gradient objects per frame
- **Current Code:**
```typescript
// FlappyOrange.tsx - drawBackground() called every frame
const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.7);
gradient.addColorStop(0, colors.skyTop);
gradient.addColorStop(1, colors.skyBottom);
ctx.fillStyle = gradient;
```
- **Recommended Fix:** Cache gradients at initialization or when colors change:
```typescript
// Cache gradient when colors change (every 500ms)
const gradientCacheRef = useRef<CanvasGradient | null>(null);
const lastColorsRef = useRef<string>('');

// In getCachedColors or separate effect
const colorKey = `${colors.skyTop}-${colors.skyBottom}`;
if (colorKey !== lastColorsRef.current) {
  gradientCacheRef.current = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.7);
  gradientCacheRef.current.addColorStop(0, colors.skyTop);
  gradientCacheRef.current.addColorStop(1, colors.skyBottom);
  lastColorsRef.current = colorKey;
}
ctx.fillStyle = gradientCacheRef.current;
```
- **Impact:** HIGH - 20-30 allocations/frame on mobile
- **Effort:** Medium

---

### Issue 2: setState Calls in Game Loop

- **File(s):** `src/pages/FlappyOrange.tsx` (multiple locations)
- **Problem:** `setImpactFlashAlpha()`, `setScreenBrightness()`, `setLightningAlpha()`, `setNearMissFlashAlpha()` called during effects, triggering React re-renders that compete with RAF
- **Current Code:**
```typescript
// Called during juice effects
setImpactFlashAlpha(1);
setTimeout(() => setImpactFlashAlpha(0), 100);

// Lightning effect - 5 setState calls rapid fire
setLightningAlpha(1);
setTimeout(() => setLightningAlpha(0.5), 50);
setTimeout(() => setLightningAlpha(0.8), 100);
// ...etc
```
- **Recommended Fix:** Use refs for visual state, only update React state for UI:
```typescript
const impactFlashAlphaRef = useRef(0);
const lightningAlphaRef = useRef(0);

// In effects - mutate ref directly
impactFlashAlphaRef.current = 1;
setTimeout(() => { impactFlashAlphaRef.current = 0; }, 100);

// In render loop - read from ref
drawImpactFlash(ctx, impactFlashAlphaRef.current);
```
- **Impact:** HIGH - Each setState triggers full component re-render
- **Effort:** Medium

---

### Issue 3: Music Event Listeners Not Cleaned Up

- **File(s):** `src/pages/FlappyOrange.tsx` (line 488)
- **Problem:** `music.addEventListener('ended', ...)` adds listener but never removes it. If user plays 100 games, 100 stacked listeners accumulate
- **Current Code:**
```typescript
const playTrack = useCallback((index: number) => {
  const music = new Audio(track.src);

  music.addEventListener('ended', () => {
    // This listener is never removed
    playTrack(playlistIndexRef.current);
  });

  musicAudioRef.current = music;
  music.play();
}, []);
```
- **Recommended Fix:** Remove listener before adding new one, or use `{ once: true }`:
```typescript
music.addEventListener('ended', () => {
  playTrack(playlistIndexRef.current);
}, { once: true }); // Auto-removes after firing
```
- **Impact:** HIGH - Memory leak on repeated plays
- **Effort:** Easy

---

## High Priority Issues

### Issue 4: Unbounded Particle Arrays

- **File(s):** `src/pages/FlappyOrange.tsx`
- **Problem:** `deathParticlesRef`, `wingParticlesRef`, `passParticlesRef` grow unbounded
- **Recommended Fix:** Add max cap and pool particles:
```typescript
const MAX_PARTICLES = 50;
if (particlesRef.current.length > MAX_PARTICLES) {
  particlesRef.current = particlesRef.current.slice(-MAX_PARTICLES);
}
```
- **Impact:** Medium - Memory growth over long sessions
- **Effort:** Easy

### Issue 5: Audio Nodes Created Per Sound

- **File(s):** `src/lib/juice/audio.ts`
- **Problem:** Every `playTone()` creates new oscillator + gain nodes
- **Recommended Fix:** Pool oscillators or use pre-recorded audio buffers for common sounds
- **Impact:** Medium - 10+ allocations per collision
- **Effort:** Hard

### Issue 6: New Audio Elements Per Track

- **File(s):** `src/pages/FlappyOrange.tsx` (line 462)
- **Problem:** `new Audio(track.src)` creates new HTMLAudioElement every track change
- **Recommended Fix:** Preload all tracks and reuse elements:
```typescript
const audioElementsRef = useRef<HTMLAudioElement[]>([]);

useEffect(() => {
  // Preload all tracks once
  audioElementsRef.current = MUSIC_PLAYLIST.map(track => {
    const audio = new Audio(track.src);
    audio.preload = 'auto';
    return audio;
  });
}, []);
```
- **Impact:** Medium - Memory accumulation
- **Effort:** Medium

---

## Medium Priority Issues

### Issue 7: Color Interpolation Every Cache Update

- **File(s):** `src/pages/FlappyOrange.tsx`
- **Problem:** `lerpColor()` parses hex strings every 500ms (now using discrete colors - FIXED)
- **Status:** RESOLVED - Changed to discrete color lookup

### Issue 8: Text Measuring Per Character

- **File(s):** `src/lib/canvas/text.ts`
- **Problem:** `drawWaveText()` and `drawRainbowText()` call `ctx.measureText()` per character
- **Impact:** Low - Only affects specific text effects
- **Effort:** Medium

---

## Low Priority Issues

### Issue 9: Parallax Element Wrapping

- **File(s):** `src/lib/canvas/parallax.ts`
- **Problem:** Modulo wrapping calculated per element per frame
- **Impact:** Low - Simple math, acceptable overhead
- **Effort:** Low

---

## Game-Specific Issues

### FlappyOrange
- Sky gradient created every frame (CRITICAL)
- Multiple setState for visual effects (CRITICAL)
- Music listener leak (CRITICAL)
- Particle arrays unbounded (HIGH)
- Fireflies drawn every night frame (MEDIUM)

### CitrusDrop
- Background gradient every frame (CRITICAL)
- Fruit radial gradient per fruit per frame (CRITICAL)
- setState in collision callbacks (HIGH)
- Merge pair Set grows unbounded (LOW)

---

## Shared Library Issues

### src/lib/juice/audio.ts
- Oscillator created per sound (no pooling)
- AudioBuffer created per impact sound (should cache)

### src/lib/canvas/orangeTree.ts
- Gradients created per tree draw (should pre-render to offscreen canvas)

### src/lib/canvas/text.ts
- Per-character measurement in wave/rainbow text

---

## Recommended Architecture Changes

1. **Gradient Caching System**
   - Create utility to cache gradients by key
   - Invalidate only when colors change

2. **Visual State Refs**
   - Move all per-frame visual state from React state to refs
   - Only use React state for UI elements (score display, game over screen)

3. **Particle Pool**
   - Create shared particle pool across all games
   - Recycle particles instead of creating new objects

4. **Audio Preloading**
   - Load all game audio on first user interaction
   - Store in shared cache for reuse

5. **Tree Pre-rendering**
   - Implement offscreen canvas caching as documented in `orange-tree-performance.md`

---

## Performance Budget Recommendations

| Metric | Target | Current Estimate |
|--------|--------|------------------|
| Frame time | <16ms | 30-50ms on mobile |
| Gradient creations/frame | 0 | 20-30 |
| setState calls/frame | 0 | 2-5 |
| Particle count max | 50 | Unbounded |
| Audio nodes/second | <5 | 10-20 |
| Memory growth/minute | <1MB | ~5MB |

---

## Next Steps

1. Fix gradient caching in FlappyOrange (highest impact)
2. Convert visual effect state to refs
3. Add `{ once: true }` to music ended listener
4. Cap particle arrays
5. Audit remaining games for same patterns
