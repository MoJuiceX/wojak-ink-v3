# BrickBreaker Performance & Juice Audit

**Game:** BrickBreaker (Breakout-style game with powerups)
**File:** `src/pages/BrickBreaker.tsx`
**Lines:** ~1900+ lines

## Executive Summary

BrickBreaker is a well-architected canvas-based game that already follows many performance best practices. It uses refs for game state (`ballsRef`, `paddleRef`, `bricksRef`, etc.) which prevents re-renders during gameplay. The juice implementation is excellent with squash/stretch, impact flashes, brick shatter effects, and freeze frames. Minor optimizations possible.

---

## Performance Issues

### MODERATE (Game is already well-optimized)

1. **Multiple Visual Effect Refs**
   ```typescript
   // Lines 220-256: Many separate refs for visual effects
   const impactFlashesRef = useRef<ImpactFlash[]>([]);
   const brickShardsRef = useRef<BrickShard[]>([]);
   const emberParticlesRef = useRef<EmberParticle[]>([]);
   const spawnEffectsRef = useRef<SpawnEffect[]>([]);
   ```

   **Fix:** Consider consolidating into single `visualEffectsRef` with typed arrays for each effect type.

2. **Gradient Creation Per Frame**
   - If brick gradients are created per-draw, cache them.

   **Fix:** Pre-create gradient patterns at level load, cache by brick type.

3. **Collision Detection O(n)**
   ```typescript
   // Brick collision checks all bricks
   ```

   **Fix:** Use spatial partitioning (grid-based) when brick count is high (>50).

4. **Particle Array Filter**
   ```typescript
   // Particles filtered every frame
   particlesRef.current = particlesRef.current.filter(p => p.life > 0);
   ```

   **Fix:** Use object pooling for particles. Pre-allocate 50-100 particle objects.

### MINOR

5. **UI State Still Triggers Re-renders**
   ```typescript
   // Lines 259-264: These update during gameplay
   const [score, setScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [level, setLevel] = useState(1);
   ```

   This is acceptable since updates are infrequent (on brick destroy, level change).

6. **Anticipation Loop Sound State**
   ```typescript
   // Line 237: Separate ref for sound state
   const anticipationPlayingRef = useRef(false);
   ```

   This is fine, just ensure cleanup on unmount.

---

## Juice Assessment

### Already Implemented (Excellent!)

- **Ball Squash/Stretch:** On wall, paddle, and brick impacts (Enhancement #25)
- **Paddle Squash:** On ball hit (Enhancement #26)
- **Impact Flashes:** At collision points (Enhancement #28)
- **Brick Shatter:** Shard explosion with physics (Enhancement #29)
- **Combo Trail Colors:** Changes based on combo count (Enhancement #31)
- **Powerup Screen Flash:** Flash on powerup activation (Enhancement #33)
- **Near-Miss Visual:** Edge-of-paddle feedback (Enhancement #35)
- **Freeze Frames:** On big events (Enhancement #37)
- **Ember Particles:** For fireball mode (Enhancement #34)
- **Active Powerup UI:** Timer bars for active powerups (Enhancement #41)
- **Spawn Effects:** For multiball (Enhancement #40)
- **Level Transitions:** Fade animations between levels (Enhancement #42)
- **Combo Timer Bar:** Visual countdown for combo window (#43)
- **Combo Break Effect:** Visual on combo reset (#45)

### Missing/Enhancement Opportunities

1. **Ball Trail Enhancement**
   - Current trail could have more prominent motion blur at high speeds.

2. **Danger Zone When Low Lives**
   - Add red vignette pulse when lives = 1.

3. **Last Brick Drama**
   - When only 1-2 bricks remain, add "FINISH IT!" callout and spotlight effect.

4. **Boss Bricks**
   - Unbreakable bricks could have subtle pulse animation.

5. **Paddle Edge Glow at High Combo**
   - Paddle could glow progressively with combo.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/brick-breaker-optimize.md thoroughly, then review and optimize src/pages/BrickBreaker.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Consolidate visual effect refs into single visualEffectsRef object
2. Pre-create and cache brick gradient patterns at level load
3. Implement spatial partitioning (grid-based, 50px cells) for brick collisions when count > 50
4. Implement object pooling for particles (pre-allocate 100 particle objects)
5. Verify devicePixelRatio is capped at 2 in canvas setup
6. Add cleanup for anticipation loop sound on component unmount

JUICE (Priority 2):
1. Enhance ball trail with more prominent motion blur at speed > 8
2. Add red vignette pulse when lives = 1 (danger mode)
3. Add "FINISH IT!" callout + spotlight when 1-2 bricks remain
4. Add subtle pulse animation on unbreakable bricks
5. Add paddle edge glow that intensifies with combo (3+ combo = glow)

Target: Maintain smooth 60 FPS during fireball mode with max particles on iPhone 11
```

---

## Implementation Priority

1. **Medium Impact, Medium:** Object pooling for particles
2. **Medium Impact, Low:** Spatial partitioning (only for large brick counts)
3. **Low Impact, Easy:** Consolidate visual effect refs
4. **Low Impact, Easy:** Add danger mode vignette
5. **Low Impact, Easy:** Add last brick drama
