# OrangeSnake Performance & Juice Audit

**Game:** OrangeSnake (Slither.io-style snake game)
**File:** `src/pages/OrangeSnake.tsx`
**Lines:** ~1079 lines

## Executive Summary

OrangeSnake is a well-architected canvas-based game with proper use of refs for game state. It has good performance patterns but could benefit from optimizations to the snake movement calculations and food spawning. Juice is decent but could be enhanced.

---

## Performance Issues

### CRITICAL

1. **No Fixed Timestep Game Loop**
   ```typescript
   // Lines 722-806: Game loop uses RAF without deltaTime normalization
   const gameLoop = () => {
     // ... direct updates without deltaTime
     animationRef.current = requestAnimationFrame(gameLoop);
   };
   ```

   **Fix:** Implement fixed timestep with accumulator pattern:
   ```typescript
   const FIXED_DT = 1/60;
   let accumulator = 0;
   const gameLoop = (timestamp) => {
     const dt = (timestamp - lastTime) / 1000;
     accumulator += dt;
     while (accumulator >= FIXED_DT) {
       update(FIXED_DT);
       accumulator -= FIXED_DT;
     }
     render();
   };
   ```

2. **Snake Segment Recalculation Every Frame**
   ```typescript
   // Lines 285-303: Updates ALL segments every frame
   snake.segments.forEach((seg, i) => {
     const t = i / Math.max(1, snake.segments.length - 1);
     seg.radius = HEAD_RADIUS - (HEAD_RADIUS - TAIL_RADIUS) * t;
   });
   ```

   **Fix:** Only recalculate radius when snake grows. Store radius once per segment.

3. **Collision Detection Checks All Segments**
   ```typescript
   // Lines 334-345: O(n) for every snake pair
   for (const segment of otherSnake.segments) {
     if (checkCircleCollision(...)) return true;
   }
   ```

   **Fix:** Use spatial hashing or quadtree for collision detection with many snakes.

### MODERATE

4. **Food Array Filter on Collection**
   ```typescript
   // Line 762: Creates new array
   state.food = state.food.filter((f) => f.id !== collectedFood.id);
   ```

   **Fix:** Use object pooling for food. Mark collected as inactive, recycle.

5. **AI Snake Target Finding Every Frame**
   ```typescript
   // Lines 373-380: Scans all food for every AI snake
   for (const f of food) {
     const dist = Math.hypot(f.x - head.x, f.y - head.y);
   ```

   **Fix:** Only recalculate target every 10-15 frames, or when current target is eaten.

6. **Multiple New Segment Objects**
   ```typescript
   // Line 270-274: Creates new object every frame
   const newHead: Segment = {
     x: head.x + snake.direction.x * snake.speed,
     ...
   };
   ```

   **Fix:** Reuse segment objects from tail when moving (circular buffer).

### MINOR

7. **Shadow Blur Set Per Snake**
   ```typescript
   // Line 585: shadowBlur = 12
   ctx.shadowBlur = 12;
   ```

   **Fix:** Shadow is expensive on mobile. Make optional or reduce to 6.

8. **Grid Drawing Every Frame**
   ```typescript
   // Lines 556-575: Draws full grid every frame
   for (let x = 0; x < CANVAS_WIDTH; x += gridSize) { ... }
   ```

   **Fix:** Cache grid to offscreen canvas, draw once.

---

## Juice Assessment

### Already Implemented (Good!)

- **Snake Glow:** Player snake has shadow glow (line 584-585)
- **Eyes with Pupils:** Head has animated eyes facing direction
- **Milestone Callouts:** "GROWING!", "SNAKE KING!", "SLITHER GOD!" etc.
- **Screen Shake:** On death and milestones
- **Confetti:** On major milestones (75+, 100+, 150+)
- **Food Glow:** Food has subtle shadow glow

### Missing Juice

1. **No Squash/Stretch on Head**
   - Snake head should squash when hitting food, stretch when moving fast.

2. **No Death Animation**
   - Snake just disappears. Should have:
     - Body segments scatter
     - Fade to food particles
     - Screen flash

3. **No Eating Animation**
   - Food just disappears. Add:
     - Pop effect
     - Brief particle burst
     - Sound escalation

4. **No Speed Trail**
   - Fast-moving snake should leave a motion blur/trail.

5. **No Near-Miss Feedback**
   - Barely avoiding another snake should trigger "CLOSE!" effect.

6. **AI Death Lacks Impact**
   - AI snakes dying should have visible explosion, not just food scatter.

7. **No Urgency for Larger Snakes Nearby**
   - Player should get warning when large snake is approaching.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/orange-snake-optimize.md thoroughly, then review and optimize src/pages/OrangeSnake.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Implement fixed timestep game loop with accumulator pattern (60 FPS target)
2. Only recalculate segment radius when snake grows, not every frame
3. Implement spatial hashing for collision detection (grid-based, 50px cells)
4. Add object pooling for food (pre-allocate 50 food objects)
5. Cache AI snake targets - only recalculate every 15 frames or on target eaten
6. Use circular buffer for snake segments - reuse tail objects for new head
7. Cache grid to offscreen canvas (draw once at init)
8. Reduce player snake shadowBlur from 12 to 6 for mobile

JUICE (Priority 2):
1. Add head squash/stretch animation (squash on eat, stretch at speed > 3)
2. Add death sequence (freeze frame, segments scatter outward, fade to food)
3. Add food pop effect (scale 1.3 -> 0 with particle burst)
4. Add motion trail for player snake when speed > 2.5
5. Add near-miss detection and "CLOSE!" callout when within 10px of AI
6. Enhance AI death with explosion particles before food scatter
7. Add proximity warning (subtle vignette) when large snake is within 100px

Target: Maintain 60 FPS with 6 AI snakes on iPhone 11
```

---

## Implementation Priority

1. **High Impact, Medium:** Fixed timestep game loop
2. **High Impact, Medium:** Spatial hashing for collisions
3. **High Impact, Easy:** Object pooling for food
4. **Medium Impact, Easy:** Cache segment radius
5. **Medium Impact, Easy:** Cache AI targets
6. **Low Impact, Easy:** Add death animation
7. **Low Impact, Easy:** Add eating animation
