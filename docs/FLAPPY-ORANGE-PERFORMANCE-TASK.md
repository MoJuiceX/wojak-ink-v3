# Task: Optimize FlappyOrange.tsx for Mobile Performance

## Your Mission

Analyze `src/pages/FlappyOrange.tsx` for performance issues using the optimization patterns documented in `docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md`.

## Steps

1. **Read the reference document first:**
   ```
   docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md
   ```
   This contains 8 gold-standard optimization patterns with production-ready code.

2. **Read the FlappyOrange game:**
   ```
   src/pages/FlappyOrange.tsx
   ```

3. **Also read any related files it imports from:**
   - `src/lib/canvas/` (especially orangeTree.ts, parallax.ts, drawing.ts)
   - `src/lib/juice/` (especially audio.ts, particles.ts)
   - Any hooks or contexts used

4. **Identify issues** by checking for these RED FLAGS:
   - Gradients created in game loop (not cached)
   - `useState` for game position/velocity (should be `useRef`)
   - `new` objects created every frame (particles, arrays)
   - Multiple AudioContext instances
   - Missing `cancelAnimationFrame` cleanup
   - No fixed timestep (physics tied to framerate)
   - No `touch-action: none` CSS
   - No Page Visibility handling (battery drain)

5. **Create an optimized version** by applying the patterns from the audit doc:
   - Cache all gradients to offscreen canvas
   - Use `useRef` for game state, throttle UI updates
   - Implement object pooling for particles
   - Use fixed timestep with interpolation
   - Add passive touch listeners
   - Add visibility change handling

## Output

Create `src/pages/FlappyOrangeOptimized.tsx` with all optimizations applied, then provide a summary of changes made.

Alternatively, if you prefer to edit in place, update `src/pages/FlappyOrange.tsx` directly and list all the changes.

## Target Performance

- 60 FPS on iPhone 11 / Pixel 5
- No frame drops during gameplay
- Zero memory growth after initial warmup
- Battery-friendly (pause when backgrounded)
