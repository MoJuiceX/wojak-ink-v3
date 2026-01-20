# OrangeJuggle Performance & Juice Audit

**Game:** OrangeJuggle (Juggling game with orangutan character)
**File:** `src/pages/OrangeJuggle.tsx`
**Lines:** ~1623 lines

## Executive Summary

OrangeJuggle is a well-structured game with good juice implementation (squash/stretch, trails, particles, screen shake). It uses refs appropriately for game loop state but still has some useState that could cause re-renders during gameplay.

---

## Performance Issues

### CRITICAL

1. **useState for Objects Array (Major Re-renders)**
   ```typescript
   // Line 187: This causes re-render every frame when objects move
   const [objects, setObjects] = useState<GameObject[]>([]);
   ```

   The game does use `objectsRef` for the game loop (line 209), but still syncs to state for rendering:
   ```typescript
   objectsRef.current = [...objectsRef.current, obj];
   setObjects(objectsRef.current);
   ```

   **Fix:** Move to canvas rendering. The current DOM-based rendering with `setObjects` creates React re-renders every frame. Use canvas for game objects.

2. **useState for Particles (Creates Re-renders)**
   ```typescript
   // Lines 150-159: Particle state
   const [particles, setParticles] = useState<Array<{...}>>([]);
   ```

   Particles are updated in a `setInterval` (lines 302-319), causing frequent re-renders.

   **Fix:** Move particles to refs and render via canvas.

3. **Impact Flashes Array (Creates DOM Elements)**
   ```typescript
   // Lines 148-149
   const [impactFlashes, setImpactFlashes] = useState<Array<{...}>>([]);
   ```

   **Fix:** Use canvas drawing instead of DOM elements for flashes.

4. **Landing Indicators State**
   ```typescript
   // Line 165
   const [landingIndicators, setLandingIndicators] = useState<Array<{...}>>([]);
   ```

   Updated every frame when oranges are falling (lines 832-846).

   **Fix:** Calculate at render time or draw directly on canvas.

### MODERATE

5. **Trail Array on Each Game Object**
   ```typescript
   // Line 81: Each object stores its own trail
   trail: TrailPoint[];
   ```

   Trail is filtered and recreated every frame (lines 756-764).

   **Fix:** Pre-allocate trail array with fixed size, use circular buffer pattern.

6. **No Object Pooling**
   - Oranges, power-ups, and camels are created with `new` objects.

   **Fix:** Pool game objects (pre-allocate 5 oranges, 3 power-ups, 2 camels).

7. **Multiple setInterval for Particle Update**
   ```typescript
   // Lines 303-319
   const updateInterval = setInterval(() => {
     setParticles(prev => { ... });
   }, 16);
   ```

   **Fix:** Integrate particle update into main game loop.

### MINOR

8. **Screen Shake Uses setInterval**
   ```typescript
   // Lines 328-344
   const shakeInterval = setInterval(() => { ... }, 16);
   ```

   **Fix:** Use requestAnimationFrame-based shake with refs.

---

## Juice Assessment

### Already Implemented (Good!)

- **Squash/Stretch:** On impact (lines 731-734) and recovery (lines 747-749)
- **Velocity Stretch:** Objects stretch based on speed (lines 1309-1312)
- **Motion Trails:** Trail rendering for fast-moving oranges (lines 1329-1343)
- **Impact Flashes:** White flash at collision point
- **Particle Bursts:** On hit with color variation based on combo
- **Screen Shake:** Intensity based on combo and golden hit
- **Freeze Frames:** For big hits (lines 972-979)
- **Arm Swing Animation:** Orangutan arm swings on hit direction
- **Combo Visual System:** Glow levels based on combo (line 1397)
- **Panic Indicators:** Vignette and landing zone indicators
- **Power-up Effects:** Different sounds/visuals for banana/rum

### Missing Juice

1. **Object Landing Anticipation**
   - No shadow/indicator where orange will land when high up.

2. **Gravity Pull Visual**
   - No visual showing increased gravity as level progresses.

3. **Golden Orange Announcement**
   - Golden orange should have entry fanfare/glow when it spawns.

4. **Camel Warning Enhancement**
   - Add screen border flash before camel enters.

5. **Level Transition Celebration**
   - Level complete screen could have more confetti/fireworks.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/orange-juggle-optimize.md thoroughly, then review and optimize src/pages/OrangeJuggle.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Convert from DOM rendering to Canvas rendering for game objects
2. Move particles from useState to useRef + canvas drawing
3. Move impact flashes from useState to useRef + canvas drawing
4. Move landing indicators from useState to ref-based calculation
5. Pre-allocate trail arrays with fixed size (8 points), use circular buffer
6. Implement object pooling for oranges (5), power-ups (3), camels (2)
7. Merge particle update interval into main requestAnimationFrame loop
8. Convert screen shake from setInterval to RAF-based with refs

JUICE (Priority 2):
1. Add landing shadow/indicator for high-altitude oranges
2. Add golden orange spawn fanfare (brief glow expansion + sound)
3. Enhance camel warning with screen border flash (red pulse)
4. Add visual indicator for increased gravity at higher levels
5. Improve level complete transition with more celebration effects

Target: 60 FPS on iPhone 11 with smooth responsive paddle movement
```

---

## Implementation Priority

1. **High Impact, High Effort:** Convert to canvas rendering
2. **High Impact, Medium:** Object pooling for game objects
3. **Medium Impact, Medium:** Merge intervals into main loop
4. **Medium Impact, Easy:** Pre-allocate trail arrays
5. **Low Impact, Easy:** Add landing shadows
6. **Low Impact, Easy:** Enhance camel warning
