# Mobile Performance Audit - Claude CLI Prompt (Enhanced Edition)

## Context

I'm building 15 games for Wojak.ink, a mobile-first web application. I'm experiencing performance issues on mobile devices. I need you to conduct a comprehensive performance audit of my game codebase and provide specific, actionable recommendations using **cutting-edge 2024-2025 optimization techniques**.

**Target Devices:** Mid-range mobile phones (iPhone 11, Pixel 5, Samsung A52)
**Target Performance:** Consistent 60 FPS with no frame drops during gameplay
**Battery Goal:** Minimize power consumption, especially when backgrounded

---

## Your Task

Analyze the codebase for mobile performance issues. Focus on these **7 critical areas**:

1. **Canvas Rendering** - Gradient creation, draw calls, offscreen caching, dirty regions
2. **Game Loop Architecture** - Fixed timestep, interpolation, delta time handling
3. **Memory Management** - Object pooling, garbage collection avoidance, cleanup
4. **React Performance** - useRef vs useState, memoization, re-render prevention
5. **Audio Performance** - AudioContext sharing, oscillator reuse, node management
6. **Touch & Input** - Passive listeners, touch-action CSS, input latency
7. **Battery & Background** - Page Visibility API, throttling, power optimization

---

## Files to Read and Analyze

### Core Game Files (Read ALL of these)

**Page-Level Game Components (CRITICAL - main game files with canvas/animation loops):**
```
src/pages/FlappyOrange.tsx      ← Uses requestAnimationFrame + gradients
src/pages/CitrusDrop.tsx        ← Uses requestAnimationFrame + gradients
src/pages/OrangeStack.tsx       ← Uses requestAnimationFrame
src/pages/BrickBreaker.tsx      ← Uses requestAnimationFrame + gradients
src/pages/OrangeJuggle.tsx      ← Uses requestAnimationFrame
src/pages/WojakRunner.tsx       ← Uses requestAnimationFrame
src/pages/OrangePong.tsx        ← Uses requestAnimationFrame
src/pages/OrangeSnake.tsx       ← Uses requestAnimationFrame
src/pages/BlockPuzzle.tsx       ← Uses gradients
src/pages/MemoryMatch.tsx       ← Uses gradients
src/pages/Game.tsx              ← Game router/wrapper
```

**Game Logic Components (src/games/):**
```
src/games/OrangeStack/index.tsx
src/games/OrangeStack/config.ts
src/games/OrangePong/index.tsx
src/games/OrangePong/config.ts
src/games/OrangeJuggle/index.tsx
src/games/OrangeJuggle/config.ts
src/games/Orange2048/index.tsx
src/games/Orange2048/config.ts
src/games/WojakRunner/index.tsx
src/games/WojakRunner/config.ts
src/games/KnifeGame/index.tsx
src/games/KnifeGame/config.ts
src/games/ColorReaction/index.tsx
src/games/ColorReaction/config.ts
src/games/MemoryMatch/index.tsx
src/games/MemoryMatch/config.ts
src/games/Wordle/WordleGame.tsx
src/games/Merge2048/Merge2048Game.tsx
```

**Shared Libraries (CRITICAL - these are used by all games):**
```
src/lib/juice/audio.ts
src/lib/juice/particles.ts
src/lib/juice/animations.ts
src/lib/juice/effects.ts
src/lib/juice/camera.ts
src/lib/juice/index.ts
src/lib/canvas/orangeTree.ts
src/lib/canvas/parallax.ts
src/lib/canvas/drawing.ts
src/lib/canvas/text.ts
src/lib/canvas/index.ts
src/lib/utils/math.ts
src/lib/utils/mobile.ts
```

**Audio System (IMPORTANT - 24 files use AudioContext/createOscillator):**
```
src/lib/juice/audio.ts               ← Main audio utilities
src/contexts/AudioContext.tsx        ← React context for audio
src/hooks/useGameSounds.ts           ← Game sounds hook
src/hooks/useColorReactionSounds.ts  ← Color game sounds
src/systems/audio/useGameSounds.ts   ← System-level sounds
```

**Systems (Shared across games):**
```
src/systems/haptics/HapticManager.ts
src/systems/haptics/useGameHaptics.ts
src/systems/effects/components/Confetti.tsx
src/systems/effects/components/Shockwave.tsx
src/systems/effects/components/ComboText.tsx
src/systems/game-ui/GameShell.tsx
src/systems/game-ui/GameHUD.tsx
src/systems/game-ui/components/GameContainer.tsx
src/systems/game-ui/hooks/useGameViewport.ts
```

**Game Components:**
```
src/components/games/GameChrome.tsx
src/components/media/games/effects/GameEffects.tsx
src/components/media/games/effects/useGameEffects.ts
```

---

## CUTTING-EDGE OPTIMIZATION PATTERNS (2024-2025)

### 1. Fixed Timestep Game Loop with Interpolation

**The Problem:** Games running at variable framerates behave inconsistently. A player on 120Hz display moves twice as fast as on 60Hz.

**The Solution:** Fixed timestep physics with render interpolation.

```typescript
// ✅ GOLD STANDARD: Fixed timestep with interpolation
const FIXED_DT = 1000 / 60; // 60 updates per second
const MAX_FRAME_TIME = 250; // Prevent spiral of death

interface GameState {
  current: { x: number; y: number; velocity: number };
  previous: { x: number; y: number; velocity: number };
}

function createGameLoop(
  update: (dt: number) => void,
  render: (alpha: number) => void
) {
  let lastTime = 0;
  let accumulator = 0;
  let frameId: number;

  const gameState: GameState = {
    current: { x: 0, y: 0, velocity: 0 },
    previous: { x: 0, y: 0, velocity: 0 }
  };

  const loop = (currentTime: number) => {
    // Cap frame time to prevent spiral of death after tab switch
    let frameTime = Math.min(currentTime - lastTime, MAX_FRAME_TIME);
    lastTime = currentTime;
    accumulator += frameTime;

    // Fixed timestep updates
    while (accumulator >= FIXED_DT) {
      // Store previous state for interpolation
      gameState.previous = { ...gameState.current };
      update(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    // Interpolation alpha (0-1) for smooth rendering
    const alpha = accumulator / FIXED_DT;
    render(alpha);

    frameId = requestAnimationFrame(loop);
  };

  return {
    start: () => { lastTime = performance.now(); frameId = requestAnimationFrame(loop); },
    stop: () => cancelAnimationFrame(frameId)
  };
}

// Interpolated rendering
function renderWithInterpolation(state: GameState, alpha: number, ctx: CanvasRenderingContext2D) {
  const x = state.previous.x + (state.current.x - state.previous.x) * alpha;
  const y = state.previous.y + (state.current.y - state.previous.y) * alpha;
  ctx.drawImage(sprite, x, y);
}
```

**CHECK FOR:**
- Is there a fixed timestep or is physics tied to framerate?
- Is delta time capped to prevent spiral of death?
- Is interpolation used for smooth rendering?
- Is MAX_FRAME_TIME set to handle tab switches?

---

### 2. OffscreenCanvas for Pre-Rendering

**The Problem:** Creating gradients and complex shapes every frame is expensive.

**The Solution:** Pre-render to OffscreenCanvas once, then use `drawImage()` in game loop.

```typescript
// ✅ GOLD STANDARD: Pre-render complex graphics
interface CachedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

function createCachedGradientCircle(radius: number, colors: string[]): CachedSprite {
  // Create offscreen canvas (works in all browsers)
  const canvas = document.createElement('canvas');
  const size = radius * 2;
  const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance

  canvas.width = size * dpr;
  canvas.height = size * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Create gradient ONCE
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, width: size, height: size };
}

// In game loop - just blit the cached image
function drawCachedSprite(ctx: CanvasRenderingContext2D, sprite: CachedSprite, x: number, y: number) {
  ctx.drawImage(sprite.canvas, x - sprite.width / 2, y - sprite.height / 2, sprite.width, sprite.height);
}

// For even better performance: Web Worker + OffscreenCanvas (if supported)
function createOffscreenWorker() {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = document.querySelector('canvas')!;
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('render-worker.js');
    worker.postMessage({ canvas: offscreen }, [offscreen]);
    return worker;
  }
  return null;
}
```

**CHECK FOR:**
- Are gradients created in the game loop? (BAD!)
- Are sprites/backgrounds pre-rendered to offscreen canvas?
- Is `drawImage()` used instead of repeated `arc()`/`fill()` calls?
- Are complex UI elements cached?

---

### 3. Object Pooling for Particles & Projectiles

**The Problem:** Creating/destroying objects triggers garbage collection, causing frame stutters.

**The Solution:** Pre-allocate objects and reuse them.

```typescript
// ✅ GOLD STANDARD: Object Pool with reset pattern
interface Poolable {
  active: boolean;
  reset(): void;
}

class Particle implements Poolable {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  life = 0;
  maxLife = 0;
  color = '';
  size = 0;
  active = false;

  reset() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.active = false;
    // Clear any object references to allow GC of referenced objects
    this.color = '';
  }
}

class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private active: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize: number = 100) {
    this.factory = factory;
    // Pre-warm the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    const obj = this.pool.pop() || this.factory();
    obj.active = true;
    this.active.push(obj);
    return obj;
  }

  release(obj: T) {
    obj.reset();
    obj.active = false;
    const idx = this.active.indexOf(obj);
    if (idx !== -1) {
      this.active.splice(idx, 1);
    }
    this.pool.push(obj);
  }

  // Bulk release - more efficient than individual releases
  releaseAll(predicate: (obj: T) => boolean) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (predicate(this.active[i])) {
        const obj = this.active[i];
        obj.reset();
        obj.active = false;
        this.active.splice(i, 1);
        this.pool.push(obj);
      }
    }
  }

  getActive(): readonly T[] {
    return this.active;
  }

  get activeCount(): number {
    return this.active.length;
  }

  get poolSize(): number {
    return this.pool.length;
  }
}

// Usage
const particlePool = new ObjectPool(() => new Particle(), 200);

function spawnExplosion(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const p = particlePool.acquire();
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 10;
    p.vy = (Math.random() - 0.5) * 10;
    p.life = 60;
    p.maxLife = 60;
    p.color = '#ff6600';
    p.size = 4 + Math.random() * 4;
  }
}

function updateParticles() {
  // Release dead particles in bulk
  particlePool.releaseAll(p => p.life <= 0);

  // Update active particles
  for (const p of particlePool.getActive()) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // Gravity
    p.life--;
  }
}
```

**CHECK FOR:**
- Are particles created with `new` and left for GC? (BAD!)
- Is there an object pool for frequently created/destroyed objects?
- Are dead objects being recycled?
- Is the pool pre-warmed to avoid allocations during gameplay?

---

### 4. React Performance: useRef for Game State

**The Problem:** Using `useState` for game state causes re-renders on every frame.

**The Solution:** Use `useRef` for game state, only use `useState` for UI updates.

```typescript
// ✅ GOLD STANDARD: Separate game state from React state
interface GameStateType {
  player: { x: number; y: number; velocity: number };
  score: number;
  gameOver: boolean;
  particles: Particle[];
}

function useGameEngine() {
  // Game state in ref - NO re-renders
  const gameStateRef = useRef<GameStateType>({
    player: { x: 100, y: 100, velocity: 0 },
    score: 0,
    gameOver: false,
    particles: []
  });

  // Only UI state in useState - updates only when needed
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Throttled score update - don't update every frame
  const lastScoreUpdate = useRef(0);
  const SCORE_UPDATE_INTERVAL = 100; // ms

  const updateUI = useCallback((now: number) => {
    const state = gameStateRef.current;

    // Throttle score updates to avoid re-renders
    if (now - lastScoreUpdate.current > SCORE_UPDATE_INTERVAL) {
      if (state.score !== displayScore) {
        setDisplayScore(state.score);
      }
      lastScoreUpdate.current = now;
    }

    // Game over only updates once
    if (state.gameOver && !isGameOver) {
      setIsGameOver(true);
    }
  }, [displayScore, isGameOver]);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || state.gameOver) return;

    // Update game state (no React re-render)
    state.player.y += state.player.velocity;
    state.player.velocity += 0.5; // Gravity

    // Render directly to canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Throttled UI update
    updateUI(timestamp);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateUI]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { canvasRef, displayScore, isGameOver, gameStateRef };
}
```

**CHECK FOR:**
- Is `useState` called inside the game loop? (BAD!)
- Is game position/velocity/etc stored in refs or state?
- Are UI updates throttled or batched?
- Is `useCallback` used for stable function references?

---

### 5. Audio: Shared Context & Node Pooling

**The Problem:** Creating AudioContext or oscillators for each sound is expensive.

**The Solution:** Single shared AudioContext with node reuse.

```typescript
// ✅ GOLD STANDARD: Singleton AudioManager with pooling
class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  // Pre-created gain nodes for pooling
  private gainPool: GainNode[] = [];
  private activeGains: Set<GainNode> = new Set();

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Must be called from user gesture (click/tap)
  async init(): Promise<void> {
    if (this.initialized) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Pre-warm gain node pool
    for (let i = 0; i < 20; i++) {
      const gain = this.ctx.createGain();
      this.gainPool.push(gain);
    }

    // Resume if suspended (iOS requirement)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.initialized = true;
  }

  private acquireGain(): GainNode {
    let gain = this.gainPool.pop();
    if (!gain && this.ctx) {
      gain = this.ctx.createGain();
    }
    if (gain) {
      gain.connect(this.masterGain!);
      this.activeGains.add(gain);
    }
    return gain!;
  }

  private releaseGain(gain: GainNode) {
    gain.disconnect();
    gain.gain.value = 1;
    this.activeGains.delete(gain);
    this.gainPool.push(gain);
  }

  playTone(frequency: number, duration: number, volume: number = 0.3, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.initialized) return;

    const osc = this.ctx.createOscillator();
    const gain = this.acquireGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration / 1000);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration / 1000);

    // Clean up after sound finishes
    osc.onended = () => {
      osc.disconnect();
      this.releaseGain(gain);
    };
  }

  // For frequently played sounds - use pre-decoded AudioBuffers
  private bufferCache: Map<string, AudioBuffer> = new Map();

  async loadSound(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    if (!this.ctx) return null;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (e) {
      console.warn('Failed to load sound:', url);
      return null;
    }
  }

  playBuffer(buffer: AudioBuffer, volume: number = 1) {
    if (!this.ctx) return;

    const source = this.ctx.createBufferSource();
    const gain = this.acquireGain();

    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    source.start();

    source.onended = () => {
      source.disconnect();
      this.releaseGain(gain);
    };
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Pause when backgrounded
  suspend() {
    this.ctx?.suspend();
  }

  resume() {
    this.ctx?.resume();
  }
}

// Usage
const audio = AudioManager.getInstance();
// On first user interaction:
document.addEventListener('click', () => audio.init(), { once: true });
```

**CHECK FOR:**
- Are multiple AudioContexts being created? (BAD! Limit is ~6)
- Are oscillators/nodes being pooled or created fresh each time?
- Is there cleanup (disconnect) after sounds finish?
- Is AudioContext suspended when page is backgrounded?

---

### 6. Passive Touch Listeners & CSS touch-action

**The Problem:** Non-passive touch listeners block scrolling, causing 100-400ms delay.

**The Solution:** Use passive listeners and `touch-action: none` CSS.

```typescript
// ✅ GOLD STANDARD: Passive touch handling for games

// CSS - Add to game canvas container
const gameContainerStyles = `
  .game-container {
    touch-action: none; /* Disable browser gestures */
    user-select: none;  /* Prevent text selection */
    -webkit-user-select: none;
    -webkit-touch-callout: none; /* Disable iOS callout */
  }
`;

// TypeScript - Passive listeners with fallback
function setupTouchHandlers(canvas: HTMLCanvasElement, handlers: {
  onTouchStart: (x: number, y: number) => void;
  onTouchMove: (x: number, y: number) => void;
  onTouchEnd: () => void;
}) {
  const getTouch = (e: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const handleStart = (e: TouchEvent) => {
    e.preventDefault(); // Only if touch-action: none is set
    const pos = getTouch(e);
    handlers.onTouchStart(pos.x, pos.y);
  };

  const handleMove = (e: TouchEvent) => {
    const pos = getTouch(e);
    handlers.onTouchMove(pos.x, pos.y);
  };

  const handleEnd = () => {
    handlers.onTouchEnd();
  };

  // Passive: false for start (we need preventDefault for games)
  // But touch-action: none handles this better
  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: true }); // Can be passive if we don't preventDefault
  canvas.addEventListener('touchend', handleEnd, { passive: true });
  canvas.addEventListener('touchcancel', handleEnd, { passive: true });

  return () => {
    canvas.removeEventListener('touchstart', handleStart);
    canvas.removeEventListener('touchmove', handleMove);
    canvas.removeEventListener('touchend', handleEnd);
    canvas.removeEventListener('touchcancel', handleEnd);
  };
}

// React hook version
function useTouchHandlers(canvasRef: RefObject<HTMLCanvasElement>) {
  const handlersRef = useRef({
    onTouchStart: (x: number, y: number) => {},
    onTouchMove: (x: number, y: number) => {},
    onTouchEnd: () => {}
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return setupTouchHandlers(canvas, handlersRef.current);
  }, [canvasRef]);

  return handlersRef;
}
```

**CHECK FOR:**
- Are touch listeners using `{ passive: true }` where possible?
- Is `touch-action: none` set on game canvas?
- Are touch events cleaned up on unmount?
- Is there any scroll jank when interacting with games?

---

### 7. Page Visibility API & Battery Optimization

**The Problem:** Games running in background tabs waste battery and CPU.

**The Solution:** Pause everything when page is hidden.

```typescript
// ✅ GOLD STANDARD: Full visibility handling
class GameLifecycle {
  private gameLoop: { start: () => void; stop: () => void } | null = null;
  private audioManager: AudioManager;
  private isVisible = true;
  private wasPlaying = false;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
    this.setupVisibilityHandling();
  }

  setGameLoop(loop: { start: () => void; stop: () => void }) {
    this.gameLoop = loop;
  }

  private setupVisibilityHandling() {
    // Page Visibility API
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onHidden();
      } else {
        this.onVisible();
      }
    });

    // Also handle window blur/focus for multi-window scenarios
    window.addEventListener('blur', () => this.onHidden());
    window.addEventListener('focus', () => this.onVisible());

    // iOS-specific: handle page being put in background
    window.addEventListener('pagehide', () => this.onHidden());
    window.addEventListener('pageshow', () => this.onVisible());
  }

  private onHidden() {
    if (!this.isVisible) return; // Already hidden
    this.isVisible = false;

    console.log('[GameLifecycle] Page hidden - pausing');

    // Store playing state
    this.wasPlaying = true; // Or check actual game state

    // Pause game loop
    this.gameLoop?.stop();

    // Suspend audio to save battery
    this.audioManager.suspend();

    // Optionally: save game state to localStorage
    // this.saveGameState();
  }

  private onVisible() {
    if (this.isVisible) return; // Already visible
    this.isVisible = true;

    console.log('[GameLifecycle] Page visible - resuming');

    // Resume audio
    this.audioManager.resume();

    // Only resume game if it was playing before
    if (this.wasPlaying) {
      // Show "tap to resume" instead of auto-resuming
      // This prevents disorientation and gives player time to refocus
      this.showResumePrompt();
    }
  }

  private showResumePrompt() {
    // Implementation: show overlay with "Tap to Continue"
    // On tap: this.gameLoop?.start();
  }

  destroy() {
    // Remove listeners
    document.removeEventListener('visibilitychange', this.onHidden);
    // ... other cleanup
  }
}

// Usage with React
function useGameLifecycle(audioManager: AudioManager) {
  const lifecycleRef = useRef<GameLifecycle>();

  useEffect(() => {
    lifecycleRef.current = new GameLifecycle(audioManager);
    return () => lifecycleRef.current?.destroy();
  }, [audioManager]);

  return lifecycleRef;
}
```

**CHECK FOR:**
- Is the game loop paused when `document.hidden` is true?
- Is AudioContext suspended when backgrounded?
- Is there a "tap to resume" instead of auto-resuming?
- Are all intervals/timeouts cleared when hidden?

---

### 8. Adaptive devicePixelRatio

**The Problem:** High DPI scaling (3x on modern phones) can tank FPS.

**The Solution:** Cap pixel ratio based on device capability.

```typescript
// ✅ GOLD STANDARD: Adaptive resolution
function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  // Detect device capability
  const isLowEnd = detectLowEndDevice();

  // Cap pixel ratio for performance
  // Modern phones are 3x but 2x is usually indistinguishable and much faster
  const maxDpr = isLowEnd ? 1 : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  // Set canvas buffer size
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // Set display size via CSS
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  return ctx;
}

function detectLowEndDevice(): boolean {
  // Check for low memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;

  // Check for slow CPU (if available)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;

  // Check for older iOS devices
  const ua = navigator.userAgent;
  if (/iPhone\s(5|6|7|SE)/i.test(ua)) return true;

  // Check for battery saver mode (future API)
  // if (navigator.getBattery) { ... }

  return false;
}

// Dynamic quality adjustment based on FPS
class AdaptiveQuality {
  private frameTimestamps: number[] = [];
  private currentQuality: 'high' | 'medium' | 'low' = 'high';
  private readonly TARGET_FPS = 55; // Slightly below 60 to have headroom

  measureFrame(timestamp: number) {
    this.frameTimestamps.push(timestamp);

    // Keep last 60 frames
    if (this.frameTimestamps.length > 60) {
      this.frameTimestamps.shift();
    }

    // Calculate FPS every second
    if (this.frameTimestamps.length >= 60) {
      const fps = this.calculateFPS();
      this.adjustQuality(fps);
    }
  }

  private calculateFPS(): number {
    const times = this.frameTimestamps;
    const duration = times[times.length - 1] - times[0];
    return (times.length - 1) / (duration / 1000);
  }

  private adjustQuality(fps: number) {
    if (fps < this.TARGET_FPS - 10 && this.currentQuality !== 'low') {
      this.currentQuality = this.currentQuality === 'high' ? 'medium' : 'low';
      console.log(`[AdaptiveQuality] Dropping to ${this.currentQuality} (${fps.toFixed(1)} FPS)`);
    } else if (fps > this.TARGET_FPS + 5 && this.currentQuality !== 'high') {
      this.currentQuality = this.currentQuality === 'low' ? 'medium' : 'high';
      console.log(`[AdaptiveQuality] Raising to ${this.currentQuality} (${fps.toFixed(1)} FPS)`);
    }
  }

  get quality() { return this.currentQuality; }

  // Use these to adjust rendering
  get particleMultiplier() {
    return { high: 1, medium: 0.5, low: 0.25 }[this.currentQuality];
  }

  get shadowsEnabled() {
    return this.currentQuality === 'high';
  }

  get pixelRatio() {
    return { high: 2, medium: 1.5, low: 1 }[this.currentQuality];
  }
}
```

**CHECK FOR:**
- Is devicePixelRatio capped at 2?
- Is there low-end device detection?
- Is there dynamic quality adjustment based on FPS?
- Are particle counts reduced on low-end devices?

---

## CRITICAL RED FLAGS (Must Fix)

```typescript
// ❌ BAD: Gradient in game loop
function render() {
  const gradient = ctx.createLinearGradient(0, 0, 0, 100); // EVERY FRAME!
  gradient.addColorStop(0, '#ff6600');
  gradient.addColorStop(1, '#ff0000');
  ctx.fillStyle = gradient;
  // ...
}

// ❌ BAD: useState in game loop
const [position, setPosition] = useState({ x: 0, y: 0 });
function gameLoop() {
  setPosition({ x: position.x + 1, y: position.y }); // RE-RENDER EVERY FRAME!
  requestAnimationFrame(gameLoop);
}

// ❌ BAD: New objects in game loop
function update() {
  particles.push(new Particle()); // GC PRESSURE!
  particles = particles.filter(p => p.alive); // CREATES NEW ARRAY!
}

// ❌ BAD: Multiple AudioContexts
function playSound() {
  const ctx = new AudioContext(); // LIMIT IS ~6!
  const osc = ctx.createOscillator();
  // ...
}

// ❌ BAD: No cleanup
useEffect(() => {
  const id = requestAnimationFrame(gameLoop);
  window.addEventListener('resize', handleResize);
  // NO CLEANUP RETURN!
});

// ❌ BAD: Non-passive touch listeners without touch-action CSS
canvas.addEventListener('touchstart', handler); // BLOCKS SCROLLING!
```

---

## Output Requirements

Create these documents:

### 1. `docs/MOBILE-PERFORMANCE-AUDIT-RESULTS.md`

Structure:
```markdown
# Mobile Performance Audit Results

## Executive Summary
[2-3 sentences on overall health and most critical issues]

## Critical Issues (Fix Immediately)
[Issues causing visible lag on mobile - include code snippets and fixes]

## High Priority Issues
[Issues causing occasional jank]

## Medium Priority Issues
[Optimization opportunities]

## Architecture Recommendations
[Structural changes needed - e.g., implement object pooling system, centralize audio]

## Game-Specific Issues
### FlappyOrange
### CitrusDrop
### OrangeStack
### etc...

## Performance Budget
| Metric | Target | Current (estimate) |
|--------|--------|-------------------|
| Frame time | <16.67ms | ? |
| Draw calls | <50/frame | ? |
| Active particles | <200 | ? |
| Memory growth | 0 after warmup | ? |
```

### 2. `docs/PERFORMANCE-FIXES-PRIORITY.md`

Ordered implementation list with effort estimates.

### 3. `src/lib/performance/` (NEW)

Create these utility files with the patterns above:
- `gameLoop.ts` - Fixed timestep loop with interpolation
- `objectPool.ts` - Generic object pooling
- `canvasCache.ts` - Offscreen canvas caching utilities
- `adaptiveQuality.ts` - Dynamic quality adjustment
- `gameLifecycle.ts` - Visibility and battery handling

---

## Known Issues (Pre-Analysis)

### Files Using Gradients (Likely Performance Issues)
1. `src/pages/FlappyOrange.tsx` - **INVESTIGATE**: Is gradient in game loop?
2. `src/pages/CitrusDrop.tsx` - **INVESTIGATE**: Is gradient in game loop?
3. `src/pages/BrickBreaker.tsx` - **INVESTIGATE**
4. `src/pages/BlockPuzzle.tsx`
5. `src/pages/MemoryMatch.tsx`
6. `src/lib/canvas/orangeTree.ts` - **KNOWN ISSUE**: Creates gradients for each tree
7. `src/lib/canvas/drawing.ts`
8. `src/lib/juice/effects.ts`
9. `src/games/Merge2048/Merge2048Game.tsx`

### Files Using requestAnimationFrame (Check for cleanup)
18 files - verify ALL have proper `cancelAnimationFrame` in cleanup.

### Files Creating Audio Nodes (Check for reuse)
24 files use `AudioContext` or `createOscillator`:
- Is there a shared AudioContext? (GOOD)
- Or multiple contexts? (BAD - limit is ~6)
- Is there oscillator/node pooling?

---

## Existing Documentation

- `docs/games/orange-tree-performance.md` - orangeTree.ts caching solution
- `docs/game-juice-playbook.md` - Current juice patterns
- `docs/juice-implementation-tracker.md` - Implementation status

---

## Start

### Priority Order:
1. **First**: `src/lib/juice/audio.ts` + `src/contexts/AudioContext.tsx` - Audio affects ALL games
2. **Second**: `src/lib/canvas/*.ts` - Canvas utilities used everywhere
3. **Third**: `src/pages/FlappyOrange.tsx` + `src/pages/CitrusDrop.tsx` - Main games with gradients
4. **Fourth**: Other page-level games
5. **Fifth**: Create `src/lib/performance/` utilities

Report back with findings in the specified format.

---

## Research Sources

This prompt incorporates cutting-edge techniques from:
- [MDN: Optimizing Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [web.dev: OffscreenCanvas](https://web.dev/articles/offscreen-canvas)
- [web.dev: Static Memory with Object Pools](https://web.dev/articles/speed-static-mem-pools)
- [Game Programming Patterns: Object Pool](https://gameprogrammingpatterns.com/object-pool.html)
- [Chrome Blog: Passive Event Listeners](https://developer.chrome.com/blog/passive-event-listeners)
- [Aleksandr Hovhannisyan: JavaScript Game Loop](https://www.aleksandrhovhannisyan.com/blog/javascript-game-loop/)
- [Isaac Sukin: Game Loops and Timing](https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing)
- [HdM Stuttgart: Web Audio API Performance](https://blog.mi.hdm-stuttgart.de/index.php/2021/02/24/web-audio-api-tips-for-performance/)
- [Chrome Blog: Timer Throttling](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
- [PlayCanvas: Device Pixel Ratio](https://developer.playcanvas.com/user-manual/optimization/runtime-devicepixelratio/)
