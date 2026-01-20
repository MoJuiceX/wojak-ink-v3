# Skill: Game Performance Optimizer

## Description
Optimize any game file for mobile performance using cutting-edge 2024-2025 techniques. This skill analyzes a game file, identifies performance bottlenecks, and applies gold-standard optimization patterns.

## Trigger
Use this skill when:
- User asks to "optimize [GameName] for performance"
- User asks to "make [GameName] run faster on mobile"
- User asks to "fix lag in [GameName]"
- User asks to "improve FPS in [GameName]"
- User mentions "performance", "optimize", "lag", "slow", "FPS" with a game name

## Usage
```
/performance <GameName>
/performance FlappyOrange
/performance CitrusDrop
/performance src/pages/MyGame.tsx
```

---

## Execution Steps

### Step 1: Identify the Game File

Find the game file based on user input:
- If full path given: use it directly
- If game name given: look in `src/pages/[GameName].tsx` first
- Also check: `src/games/[GameName]/index.tsx`

### Step 2: Read Reference Documentation

**ALWAYS read this file first:**
```
docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md
```

This contains the 8 gold-standard optimization patterns:
1. Fixed Timestep Game Loop with Interpolation
2. OffscreenCanvas for Pre-Rendering (gradient caching)
3. Object Pooling for Particles & Projectiles
4. React useRef for Game State (not useState)
5. Audio Singleton with Node Pooling
6. Passive Touch Listeners + CSS touch-action
7. Page Visibility API for Battery Optimization
8. Adaptive devicePixelRatio

### Step 3: Read the Game File and Its Dependencies

Read the main game file, then trace and read its imports:
- Canvas utilities from `src/lib/canvas/`
- Juice/effects from `src/lib/juice/`
- Audio hooks from `src/hooks/` or `src/systems/audio/`
- Any game-specific components

### Step 4: Analyze for Performance Issues

Check for these **RED FLAGS** (from the audit doc):

```typescript
// ❌ RED FLAG 1: Gradient in game loop
const gradient = ctx.createLinearGradient(...); // EVERY FRAME!

// ❌ RED FLAG 2: useState for game state
const [position, setPosition] = useState({ x: 0, y: 0 });
setPosition(...); // IN GAME LOOP = RE-RENDER EVERY FRAME!

// ❌ RED FLAG 3: Creating objects in game loop
particles.push(new Particle()); // GC PRESSURE!
particles = particles.filter(p => p.alive); // NEW ARRAY EVERY FRAME!

// ❌ RED FLAG 4: Multiple AudioContexts
const ctx = new AudioContext(); // IN SOUND FUNCTION = BAD!

// ❌ RED FLAG 5: No cleanup
useEffect(() => {
  requestAnimationFrame(gameLoop);
  window.addEventListener('resize', handler);
  // NO RETURN CLEANUP!
});

// ❌ RED FLAG 6: Physics tied to framerate
position.x += velocity * 1; // NO DELTA TIME!

// ❌ RED FLAG 7: No touch-action CSS
<canvas> // WITHOUT touch-action: none = SCROLL JANK!

// ❌ RED FLAG 8: No visibility handling
// Game keeps running when tab is backgrounded = BATTERY DRAIN!
```

### Step 5: Apply Optimizations

For each issue found, apply the corresponding fix from `docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md`:

| Issue | Fix Pattern |
|-------|-------------|
| Gradient in loop | OffscreenCanvas caching (Pattern #2) |
| useState in loop | useRef + throttled UI (Pattern #4) |
| new Particle() | Object pooling (Pattern #3) |
| Multiple AudioContext | Singleton AudioManager (Pattern #5) |
| No cleanup | Add useEffect return cleanup |
| No delta time | Fixed timestep + interpolation (Pattern #1) |
| No touch-action | Passive listeners + CSS (Pattern #6) |
| No visibility API | GameLifecycle class (Pattern #7) |
| High DPI issues | Adaptive devicePixelRatio (Pattern #8) |

### Step 6: Output

Create or update the game file with optimizations. Provide a summary:

```markdown
## Performance Optimization Summary: [GameName]

### Issues Found
1. [Issue description] - Line XX
2. [Issue description] - Line XX
...

### Fixes Applied
1. [Fix description]
2. [Fix description]
...

### Before/After Comparison
| Metric | Before | After (Expected) |
|--------|--------|------------------|
| Gradient calls/frame | X | 0 |
| React re-renders/frame | X | 0 |
| Object allocations/frame | X | 0 |
| Estimated FPS improvement | - | +XX% |

### Files Modified
- `src/pages/[GameName].tsx`
- `src/lib/...` (if shared utilities needed updates)
```

---

## Quick Reference: The 8 Patterns

### Pattern 1: Fixed Timestep Game Loop
```typescript
const FIXED_DT = 1000 / 60;
const MAX_FRAME_TIME = 250;
let accumulator = 0;
let lastTime = 0;

function gameLoop(currentTime: number) {
  const frameTime = Math.min(currentTime - lastTime, MAX_FRAME_TIME);
  lastTime = currentTime;
  accumulator += frameTime;

  while (accumulator >= FIXED_DT) {
    update(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  const alpha = accumulator / FIXED_DT;
  render(alpha); // Interpolate for smooth visuals

  requestAnimationFrame(gameLoop);
}
```

### Pattern 2: OffscreenCanvas Caching
```typescript
// Cache at init, not in loop
const cachedSprite = useMemo(() => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(...); // ONCE!
  // ... draw to canvas
  return canvas;
}, []);

// In game loop - just blit
ctx.drawImage(cachedSprite, x, y);
```

### Pattern 3: Object Pooling
```typescript
const particlePool: Particle[] = [];
const activeParticles: Particle[] = [];

function acquire(): Particle {
  return particlePool.pop() || new Particle();
}

function release(p: Particle) {
  p.reset();
  particlePool.push(p);
}
```

### Pattern 4: useRef for Game State
```typescript
// Game state in ref (no re-renders)
const gameState = useRef({ x: 0, y: 0, velocity: 0, score: 0 });

// UI state only for display
const [displayScore, setDisplayScore] = useState(0);

// Throttle UI updates
if (now - lastUIUpdate > 100) {
  setDisplayScore(gameState.current.score);
  lastUIUpdate = now;
}
```

### Pattern 5: Audio Singleton
```typescript
// Single shared AudioContext
const audioManager = AudioManager.getInstance();

// On user gesture
audioManager.init();

// Play sounds (uses pooled nodes internally)
audioManager.playTone(440, 100);
```

### Pattern 6: Passive Touch Listeners
```typescript
// CSS
.game-canvas { touch-action: none; }

// JS
canvas.addEventListener('touchstart', handler, { passive: false });
canvas.addEventListener('touchmove', handler, { passive: true });
```

### Pattern 7: Page Visibility
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(frameId);
    audioManager.suspend();
  } else {
    // Show "tap to resume" instead of auto-resuming
  }
});
```

### Pattern 8: Adaptive Quality
```typescript
const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x
canvas.width = width * dpr;
canvas.height = height * dpr;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;
ctx.scale(dpr, dpr);
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame time | <16.67ms (60 FPS) |
| Gradient calls per frame | 0 (all cached) |
| Object allocations per frame | 0 (all pooled) |
| React re-renders per frame | 0 (use refs) |
| AudioContext instances | 1 (singleton) |
| Memory growth after warmup | 0 |

---

## Files to Reference

- `docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md` - Full patterns with code
- `docs/games/orange-tree-performance.md` - Tree caching example
- `src/lib/performance/` - Utility implementations (if created)

---

## Example Invocations

```bash
# Optimize FlappyOrange
/performance FlappyOrange

# Optimize CitrusDrop
/performance CitrusDrop

# Optimize by file path
/performance src/pages/BrickBreaker.tsx

# Optimize all games (batch mode)
/performance --all
```
