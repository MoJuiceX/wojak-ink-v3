# Orange Stack (Brick by Brick) - Performance & Juice Optimization

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/orange-stack-optimize.md thoroughly, then implement the optimizations in both src/pages/OrangeStack.tsx and src/games/OrangeStack/index.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Replace useState for game state with useRef (player position, velocity, blocks, particles)
2. Add OffscreenCanvas caching for block gradients (orange gradient is recreated every frame)
3. Implement object pooling for floating emojis and confetti particles
4. Add fixed timestep game loop with interpolation
5. Cap devicePixelRatio at 2
6. Add Page Visibility API handling (pause when backgrounded)

JUICE (Priority 2):
1. Add block landing squash animation (scaleY: 0.7 -> 1.0)
2. Add freeze frame on perfect drops (50ms)
3. Implement tier-based landing sounds (deeper pitch for perfect)
4. Add danger zone feedback when block width < 30% original
5. Add velocity-based stretch on moving block
6. Implement adaptive quality system for particles

Target: 60 FPS on iPhone 11, buttery smooth block stacking
```

---

## Executive Summary

**Game:** Orange Stack (also called "Brick by Brick")
**Type:** Stacking precision game - tap to drop blocks, build tower
**Current State:** Has extensive visual juice but significant performance issues

### Overall Assessment

| Area | Score | Notes |
|------|-------|-------|
| **Visual Juice** | ⭐⭐⭐⭐⭐ | Exceptional - has combos, milestones, lightning, confetti, speed lines |
| **Performance** | ⭐⭐☆☆☆ | Poor - useState abuse, no object pooling, gradient recreation |
| **Audio** | ⭐⭐⭐☆☆ | Good - has sounds but could add tier variation |
| **Haptics** | ⭐⭐⭐⭐☆ | Very Good - uses haptic system |
| **Game Feel** | ⭐⭐⭐☆☆ | Missing squash/stretch, freeze frames |

---

## Part 1: Performance Issues (CRITICAL)

### 🔴 Issue 1: useState for Game State (CRITICAL)

**Location:** `src/pages/OrangeStack.tsx` lines 175-233

```typescript
// ❌ CURRENT: Causes re-render EVERY frame
const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
const [blocks, setBlocks] = useState<Block[]>([]);
const [score, setScore] = useState(0);
const [combo, setCombo] = useState(0);
const [showShockwave, setShowShockwave] = useState(false);
// ... 20+ more useState calls
```

**Problem:** Every `setCurrentBlock()` in the animation loop triggers React re-render. This is called ~60 times per second.

**Fix:**
```typescript
// ✅ GOLD STANDARD: Use refs for game state
interface GameState {
  currentBlock: Block | null;
  blocks: Block[];
  score: number;
  combo: number;
  particles: Particle[];
  // ... all game state
}

const gameStateRef = useRef<GameState>({
  currentBlock: null,
  blocks: [],
  score: 0,
  combo: 0,
  particles: []
});

// Only use useState for UI that needs to update
const [displayScore, setDisplayScore] = useState(0);
const [isGameOver, setIsGameOver] = useState(false);

// Throttle UI updates
const updateUI = useCallback((now: number) => {
  if (now - lastUIUpdate.current > 100) { // 10 FPS for UI
    setDisplayScore(gameStateRef.current.score);
    lastUIUpdate.current = now;
  }
}, []);
```

---

### 🔴 Issue 2: No Object Pooling for Effects

**Location:** Lines 570-582 (Floating Emojis), Lines 1344-1358 (Confetti)

```typescript
// ❌ CURRENT: Creates new objects constantly
setFloatingEmojis(prev => [...prev, { id: emojiId, emoji: randomEmoji, x: impactX }]);

// Confetti creates 50 new DOM elements on every milestone
{Array.from({ length: 50 }).map((_, i) => (
  <div key={i} className="confetti-piece" ... />
))}
```

**Problem:**
- Floating emojis: New object per drop, GC pressure
- Confetti: 50 new divs on milestone combos (5x, 10x, 15x, 20x)

**Fix:**
```typescript
// ✅ GOLD STANDARD: Object Pool
class EmojiPool {
  private pool: EmojiParticle[] = [];
  private active: EmojiParticle[] = [];

  constructor() {
    // Pre-warm with 20 emojis
    for (let i = 0; i < 20; i++) {
      this.pool.push({ id: i, emoji: '', x: 0, y: 0, active: false, life: 0 });
    }
  }

  acquire(emoji: string, x: number): EmojiParticle | null {
    const obj = this.pool.pop();
    if (!obj) return null;
    obj.emoji = emoji;
    obj.x = x;
    obj.y = 0;
    obj.active = true;
    obj.life = 90; // 1.5 seconds at 60fps
    this.active.push(obj);
    return obj;
  }

  release(obj: EmojiParticle) {
    obj.active = false;
    const idx = this.active.indexOf(obj);
    if (idx !== -1) this.active.splice(idx, 1);
    this.pool.push(obj);
  }
}
```

---

### 🔴 Issue 3: Block Gradient Recreation

**Location:** CSS file `OrangeStack.game.css` lines 221-229

```css
/* Block uses CSS gradient - OK for stacked blocks */
.stack-block.moving {
  background: linear-gradient(180deg, #ff9500 0%, #ff6b00 100%);
}

.stack-block.stacked {
  background: linear-gradient(180deg, #ff8c00 0%, #e67300 100%);
}
```

**Note:** CSS gradients are GPU-accelerated and OK, BUT if any canvas rendering uses gradients:

```typescript
// ❌ If this exists in any canvas code
const gradient = ctx.createLinearGradient(0, 0, 0, BLOCK_HEIGHT);
gradient.addColorStop(0, '#ff9500');
gradient.addColorStop(1, '#ff6b00');
ctx.fillStyle = gradient;
```

**Fix:** Pre-render to OffscreenCanvas once:
```typescript
// ✅ Cache gradient blocks on init
const cachedBlockRef = useRef<HTMLCanvasElement | null>(null);

useEffect(() => {
  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = MAX_BLOCK_WIDTH * dpr;
  canvas.height = BLOCK_HEIGHT * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const gradient = ctx.createLinearGradient(0, 0, 0, BLOCK_HEIGHT);
  gradient.addColorStop(0, '#ff9500');
  gradient.addColorStop(1, '#ff6b00');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, MAX_BLOCK_WIDTH, BLOCK_HEIGHT);

  cachedBlockRef.current = canvas;
}, []);
```

---

### 🟡 Issue 4: No Fixed Timestep Game Loop

**Location:** Lines 725-772

```typescript
// ❌ CURRENT: Variable timestep - physics tied to framerate
const animate = () => {
  setCurrentBlock(prev => {
    if (!prev) return prev;
    const effectiveSpeed = isSlowMo ? speed * 0.5 : speed;
    let newX = prev.x + effectiveSpeed * direction; // No deltaTime!
    // ...
  });
  animationRef.current = requestAnimationFrame(animate);
};
```

**Problem:** On a 120Hz display, block moves twice as fast. On 30 FPS, block moves half speed.

**Fix:**
```typescript
// ✅ GOLD STANDARD: Fixed timestep with interpolation
const FIXED_DT = 1000 / 60;
const MAX_FRAME_TIME = 250;

let lastTime = 0;
let accumulator = 0;

const gameLoop = (currentTime: number) => {
  let frameTime = Math.min(currentTime - lastTime, MAX_FRAME_TIME);
  lastTime = currentTime;
  accumulator += frameTime;

  // Store previous state for interpolation
  const prevX = gameStateRef.current.currentBlock?.x ?? 0;

  // Fixed timestep updates
  while (accumulator >= FIXED_DT) {
    updatePhysics(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  // Interpolation for smooth rendering
  const alpha = accumulator / FIXED_DT;
  renderWithInterpolation(prevX, gameStateRef.current.currentBlock?.x ?? 0, alpha);

  animationRef.current = requestAnimationFrame(gameLoop);
};
```

---

### 🟡 Issue 5: No Page Visibility Handling

**Location:** Missing entirely

```typescript
// ❌ CURRENT: Game continues running when tab is backgrounded
// Wastes battery, causes "spiral of death" when returning
```

**Fix:**
```typescript
// ✅ Add visibility handling
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      // Pause
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (localAudioRef.current) {
        localAudioRef.current.pause();
      }
    } else {
      // Show "tap to resume" instead of auto-resuming
      setShowPauseOverlay(true);
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);
```

---

### 🟡 Issue 6: No devicePixelRatio Cap

**Location:** Not set - defaults to device native (3x on modern phones)

**Problem:** iPhone 14 Pro has 3x DPR, rendering 3x more pixels than needed.

**Fix:**
```typescript
// ✅ Cap at 2x
const dpr = Math.min(window.devicePixelRatio, 2);
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

---

## Part 2: Juice Improvements

### 🟢 Current Juice (Already Implemented)

The game already has excellent juice:
- ✅ Combo system with escalating colors (2x → 10x)
- ✅ Milestone celebrations (5x, 10x, 15x, 20x)
- ✅ Screen shake on perfect drops
- ✅ Floating emojis
- ✅ Confetti explosions
- ✅ Lightning bolts at high combos
- ✅ Speed lines background
- ✅ Vignette pulse
- ✅ Impact shockwave
- ✅ Impact sparks
- ✅ Altitude indicator when climbing
- ✅ Floating clouds at height
- ✅ Power-up system (magnet, slow-mo, width+, shield)
- ✅ Combo meter bar

### 🟡 Missing Juice Elements

#### 1. Block Landing Squash Animation

**Status:** Missing
**Priority:** High

The moving block should squash on landing - this is a fundamental "game feel" element.

```typescript
// Add to CSS
.stack-block.landing {
  animation: blockLand 0.15s ease-out;
}

@keyframes blockLand {
  0% { transform: scaleX(1) scaleY(1); }
  40% { transform: scaleX(1.15) scaleY(0.7); }
  70% { transform: scaleX(0.95) scaleY(1.05); }
  100% { transform: scaleX(1) scaleY(1); }
}

// Trigger on drop
setBlockSquish(true);
setTimeout(() => setBlockSquish(false), 150);
```

---

#### 2. Freeze Frame on Perfect/Great Drops

**Status:** Missing
**Priority:** High

Pause game for 40-80ms on perfect alignment - makes the moment feel impactful.

```typescript
// Add freeze frame state
const freezeUntilRef = useRef(0);

// On perfect drop
if (isPerfect) {
  freezeUntilRef.current = performance.now() + 60; // 60ms freeze
} else if (isNearPerfect) {
  freezeUntilRef.current = performance.now() + 40; // 40ms freeze
}

// In game loop
const animate = (timestamp: number) => {
  if (timestamp < freezeUntilRef.current) {
    // Still render, but don't update physics
    animationRef.current = requestAnimationFrame(animate);
    return;
  }
  // ... normal update
};
```

---

#### 3. Tier-Based Landing Sounds

**Status:** Partial - has playBlockLand() and playPerfectBonus()
**Priority:** Medium

Current sounds are binary (perfect vs not). Should have graduated feedback.

```typescript
// ✅ Enhanced sound system
const playLandingSound = (trimmedAmount: number, combo: number) => {
  const basePitch = 1.0;

  if (trimmedAmount === 0) {
    // Perfect - highest pitch, richest sound
    playSound('perfect_land', { pitch: 1.2, volume: 0.7 });
    playSparkle();
  } else if (trimmedAmount <= 5) {
    // Near perfect - medium-high pitch
    playSound('good_land', { pitch: 1.1, volume: 0.6 });
  } else if (trimmedAmount <= 15) {
    // Okay drop
    playSound('block_land', { pitch: 1.0, volume: 0.5 });
  } else {
    // Bad drop - lower pitch, feedback that it wasn't great
    playSound('block_land', { pitch: 0.9, volume: 0.4 });
  }

  // Combo adds pitch boost
  if (combo >= 5) {
    // Additional harmonic layer
    playSound('combo_layer', { pitch: 1.0 + combo * 0.02, volume: 0.3 });
  }
};
```

---

#### 4. Danger Zone Feedback

**Status:** Missing
**Priority:** High

When block width gets critically small (< 30% of original), player should feel tension.

```typescript
// Visual
const isDangerZone = currentBlockWidth < INITIAL_WIDTH * 0.3;

{isDangerZone && (
  <>
    {/* Pulsing red vignette */}
    <div className="danger-vignette" />

    {/* Warning indicator */}
    <div className="danger-indicator">⚠️ CAREFUL!</div>
  </>
)}

// CSS
.danger-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(255,0,0,0.3) 100%);
  animation: danger-pulse 0.5s ease-in-out infinite alternate;
  pointer-events: none;
}

@keyframes danger-pulse {
  0% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

// Audio - heartbeat sound
const heartbeatInterval = useRef<NodeJS.Timeout>();

useEffect(() => {
  if (isDangerZone && !heartbeatInterval.current) {
    heartbeatInterval.current = setInterval(() => {
      playHeartbeat();
      hapticWarning();
    }, 600);
  } else if (!isDangerZone && heartbeatInterval.current) {
    clearInterval(heartbeatInterval.current);
    heartbeatInterval.current = undefined;
  }
}, [isDangerZone]);
```

---

#### 5. Moving Block Velocity Stretch

**Status:** Missing
**Priority:** Medium

The moving block should stretch slightly in its direction of movement.

```typescript
// CSS approach
.stack-block.moving {
  transform-origin: center;
  /* Applied via inline style based on direction */
}

// JS - calculate stretch based on speed
const stretchFactor = Math.min(speed / 5, 0.15); // Max 15% stretch
const stretchStyle = direction > 0
  ? { transform: `scaleX(${1 + stretchFactor}) scaleY(${1 - stretchFactor * 0.5})` }
  : { transform: `scaleX(${1 + stretchFactor}) scaleY(${1 - stretchFactor * 0.5})` };
```

---

#### 6. Anticipation Before Drop

**Status:** Missing
**Priority:** Low

Brief "wind-up" animation when player touches screen (before drop executes).

```typescript
// On touch start (not end)
const handleTouchStart = () => {
  setIsAnticipating(true);
};

const handleTouchEnd = () => {
  setIsAnticipating(false);
  dropBlock();
};

// CSS
.stack-block.moving.anticipating {
  animation: anticipate 0.1s ease-out;
}

@keyframes anticipate {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); filter: brightness(1.1); }
}
```

---

## Part 3: Implementation Priority

### Phase 1: Critical Performance (Do First)
1. [ ] Replace useState with useRef for game state
2. [ ] Add fixed timestep game loop
3. [ ] Implement object pooling for effects
4. [ ] Add Page Visibility API handling

### Phase 2: Performance Polish
5. [ ] Cap devicePixelRatio at 2
6. [ ] Pre-render block gradients (if any canvas rendering)
7. [ ] Add adaptive quality system

### Phase 3: Juice Enhancement
8. [ ] Add block landing squash animation
9. [ ] Add freeze frame on perfect/great drops
10. [ ] Implement danger zone feedback
11. [ ] Add tier-based landing sounds
12. [ ] Add velocity stretch to moving block

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/OrangeStack.tsx` | Main game - all performance fixes |
| `src/games/OrangeStack/index.tsx` | Alternate version - apply same fixes |
| `src/games/OrangeStack/OrangeStack.game.css` | Add squash, danger, stretch animations |
| `src/games/OrangeStack/config.ts` | Add performance constants |

---

## Testing Checklist

After implementation, verify:

- [ ] 60 FPS on iPhone 11 during intense combo sequences
- [ ] No frame drops during confetti explosions
- [ ] Smooth block movement at all speeds
- [ ] Game pauses when tab is backgrounded
- [ ] "Tap to resume" appears when returning to game
- [ ] Squash animation visible on every block landing
- [ ] Freeze frame noticeable on perfect drops
- [ ] Danger zone feedback triggers at low block width
- [ ] Memory usage stable over 5-minute session

---

## Performance Budget

| Metric | Target | Notes |
|--------|--------|-------|
| Frame time | < 16.67ms | 60 FPS |
| Active particles | < 100 | Pool limit |
| Active emojis | < 20 | Pool limit |
| Draw calls | < 50/frame | Batch where possible |
| Memory growth | 0 after warmup | No leaks |
