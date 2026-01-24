# Phase 4: Performance Optimization

**Goal:** Eliminate memory leaks, optimize renders, ensure 60fps gameplay.

**Time Estimate:** 1 hour

---

## Performance Issues Found

1. **Memory leaks** - Timers/listeners not cleaned up
2. **Expensive recalculations** - No memoization
3. **Render thrashing** - State updates during animation frames
4. **Large hook file** - useGameSounds.ts is 3,346 lines

---

## Task 4.1: Audit Timer Cleanup

**For each game, verify all `setTimeout` and `setInterval` are cleaned up.**

**Search pattern:**
```bash
grep -n "setTimeout\|setInterval" src/pages/FlappyOrange.tsx | wc -l
grep -n "clearTimeout\|clearInterval" src/pages/FlappyOrange.tsx | wc -l
```

**The counts should be close (every set needs a clear).**

**Common fix pattern:**
```typescript
// Store timer ID in ref
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Set timer
timerRef.current = setTimeout(() => {
  // do something
}, 1000);

// Clean up in useEffect return
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
}, []);
```

**Check each game:**
```bash
for file in src/pages/FlappyOrange.tsx src/pages/BlockPuzzle.tsx src/pages/BrickByBrick.tsx src/pages/MemoryMatch.tsx src/pages/WojakRunner.tsx src/pages/ColorReaction.tsx src/pages/Orange2048.tsx; do
  echo "=== $file ==="
  echo "setTimeout/setInterval:"
  grep -c "setTimeout\|setInterval" $file
  echo "clearTimeout/clearInterval:"
  grep -c "clearTimeout\|clearInterval" $file
done
```

---

## Task 4.2: Audit Event Listener Cleanup

**Search for event listeners:**
```bash
grep -n "addEventListener" src/pages/FlappyOrange.tsx
```

**Every `addEventListener` needs a matching `removeEventListener` in cleanup.**

**Common fix:**
```typescript
useEffect(() => {
  const handleResize = () => { /* ... */ };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**Check each game for proper cleanup.**

---

## Task 4.3: Audit requestAnimationFrame Cleanup

**Search:**
```bash
grep -n "requestAnimationFrame\|cancelAnimationFrame" src/pages/FlappyOrange.tsx
```

**Pattern to verify:**
```typescript
const animationRef = useRef<number | null>(null);

const gameLoop = () => {
  // game logic
  animationRef.current = requestAnimationFrame(gameLoop);
};

// Start
animationRef.current = requestAnimationFrame(gameLoop);

// Cleanup
useEffect(() => {
  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, []);
```

---

## Task 4.4: Add Memoization to Expensive Calculations

**BlockPuzzle - Valid placements calculation:**

**File:** `/src/pages/BlockPuzzle.tsx`

Search for where valid placements are calculated:
```bash
grep -n "validPlacement\|canPlace" src/pages/BlockPuzzle.tsx | head -10
```

**Wrap in useMemo:**
```typescript
const validPlacements = useMemo(() => {
  if (dangerLevel === 'safe') return new Set<string>();

  const placements = new Set<string>();
  pieces.forEach((piece, pieceIndex) => {
    if (!piece) return;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (canPlacePiece(grid, piece.shape, row, col)) {
          placements.add(`${pieceIndex}-${row}-${col}`);
        }
      }
    }
  });
  return placements;
}, [grid, pieces, dangerLevel]);
```

---

## Task 4.5: Optimize State Updates in Animation Loop

**Problem:** Calling `setState` during `requestAnimationFrame` causes extra renders.

**Search for state updates in game loops:**
```bash
grep -n "set.*\(.*\)" src/pages/FlappyOrange.tsx | grep -v "setValueAtTime\|setTimeout" | head -20
```

**Fix:** Use refs for values that change every frame, only setState when needed for render:

```typescript
// BAD - causes render every frame
const [birdY, setBirdY] = useState(0);

const gameLoop = () => {
  setBirdY(y => y + velocity);  // Render every frame!
};

// GOOD - ref for internal state, state for render
const birdYRef = useRef(0);
const [displayBirdY, setDisplayBirdY] = useState(0);

const gameLoop = () => {
  birdYRef.current += velocity;

  // Only update state every few frames or when needed
  if (frameCount % 2 === 0) {
    setDisplayBirdY(birdYRef.current);
  }
};
```

---

## Task 4.6: Split useGameSounds Hook

**File:** `/src/hooks/useGameSounds.ts` (3,346 lines!)

**Step 1:** Identify sections:
```bash
grep -n "// ====\|HELPER\|function " src/hooks/useGameSounds.ts | head -30
```

**Step 2:** Extract into separate files:

Create `/src/systems/audio/sounds/`:
- `helpers.ts` - createSoftPop, createChimeTail, etc.
- `blockSounds.ts` - Block placement sounds
- `comboSounds.ts` - Combo escalation sounds
- `winSounds.ts` - Victory sounds
- `gameSounds.ts` - Generic game sounds

**Step 3:** Main hook imports from modules:
```typescript
// useGameSounds.ts (should be ~200 lines after split)
import { createSoftPop, createChimeTail } from '@/systems/audio/sounds/helpers';
import { playBlockLand, playBlockFall } from '@/systems/audio/sounds/blockSounds';
import { playCombo, playComboEscalation } from '@/systems/audio/sounds/comboSounds';
// etc.
```

---

## Task 4.7: Add Performance Monitoring

**Create file:** `/src/hooks/useGamePerformance.ts`

```typescript
import { useRef, useCallback, useEffect } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

export function useGamePerformance(enabled = false) {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);

  const measureFrame = useCallback(() => {
    if (!enabled) return;

    frameCountRef.current++;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= 1000) {
      fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed);
      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Log if FPS drops below 50
      if (fpsRef.current < 50) {
        console.warn(`[Performance] FPS dropped to ${fpsRef.current}`);
      }
    }
  }, [enabled]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    return {
      fps: fpsRef.current,
      frameTime: 1000 / fpsRef.current,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
    };
  }, []);

  return { measureFrame, getMetrics };
}
```

**Usage in games:**
```typescript
const { measureFrame, getMetrics } = useGamePerformance(import.meta.env.DEV);

const gameLoop = () => {
  measureFrame();
  // game logic
};
```

---

## Task 4.8: Optimize Particle Systems

**Problem:** Games create new particle objects every frame.

**Solution:** Use object pooling.

**Create file:** `/src/systems/effects/ParticlePool.ts`

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  active: boolean;
}

class ParticlePool {
  private pool: Particle[] = [];
  private activeCount = 0;
  private maxParticles: number;

  constructor(maxParticles = 200) {
    this.maxParticles = maxParticles;
    // Pre-allocate particles
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return { x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '', size: 0, active: false };
  }

  acquire(): Particle | null {
    for (const particle of this.pool) {
      if (!particle.active) {
        particle.active = true;
        this.activeCount++;
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  release(particle: Particle) {
    particle.active = false;
    this.activeCount--;
  }

  getActive(): Particle[] {
    return this.pool.filter(p => p.active);
  }

  clear() {
    for (const particle of this.pool) {
      particle.active = false;
    }
    this.activeCount = 0;
  }
}

export const particlePool = new ParticlePool(200);
```

---

## Task 4.9: Add useCallback to Event Handlers

**For each game, wrap event handlers in useCallback:**

**Search for inline handlers:**
```bash
grep -n "onClick={() =>\|onTouchStart={() =>" src/pages/FlappyOrange.tsx
```

**Fix:**
```typescript
// BAD - new function every render
<div onClick={() => handleClick(x, y)}>

// GOOD - memoized handler
const handleClick = useCallback((e: React.MouseEvent) => {
  // handle click
}, [/* dependencies */]);

<div onClick={handleClick}>
```

---

## Task 4.10: Reduce Re-renders with React.memo

**For heavy child components, wrap in React.memo:**

```typescript
// Before
const GameGrid = ({ grid, onCellClick }) => {
  // render grid
};

// After
const GameGrid = React.memo(({ grid, onCellClick }) => {
  // render grid
});
```

**Candidates for memoization:**
- Game boards/grids
- Piece/block components
- Score displays (if they have complex rendering)

---

## Verification After Phase 4

**Performance testing:**

1. Open Chrome DevTools → Performance tab
2. Record 30 seconds of gameplay for each game
3. Check:
   - [ ] FPS stays above 55
   - [ ] No memory growth over time (memory leak)
   - [ ] No long tasks blocking main thread

**Memory leak test:**

1. Play game for 2 minutes
2. Trigger game over
3. Start new game
4. Repeat 5 times
5. Check memory in Task Manager - should not continuously grow

**Build check:**
```bash
npm run build
```

**Checklist:**
- [ ] All timers have cleanup
- [ ] All event listeners have cleanup
- [ ] requestAnimationFrame properly cleaned up
- [ ] Expensive calculations memoized
- [ ] useGameSounds split into modules
- [ ] Performance monitoring hook created
- [ ] Particle pool created (optional)
- [ ] Event handlers use useCallback
- [ ] Heavy components use React.memo
- [ ] FPS stays above 55 in all games
