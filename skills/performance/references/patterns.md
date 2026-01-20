# Performance Optimization Patterns

8 gold-standard patterns for mobile game performance. Apply these to fix RED FLAGS.

## Table of Contents

1. [Fixed Timestep Game Loop](#1-fixed-timestep-game-loop)
2. [OffscreenCanvas Caching](#2-offscreencanvas-caching)
3. [Object Pooling](#3-object-pooling)
4. [React useRef for Game State](#4-react-useref-for-game-state)
5. [Audio Singleton](#5-audio-singleton)
6. [Passive Touch Listeners](#6-passive-touch-listeners)
7. [Page Visibility API](#7-page-visibility-api)
8. [Adaptive devicePixelRatio](#8-adaptive-devicepixelratio)

---

## 1. Fixed Timestep Game Loop

**Problem:** Physics tied to framerate - 120Hz displays run 2x faster than 60Hz.

**Solution:** Fixed timestep with interpolation.

```typescript
const FIXED_DT = 1000 / 60; // 60 updates/sec
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

  const loop = (currentTime: number) => {
    const frameTime = Math.min(currentTime - lastTime, MAX_FRAME_TIME);
    lastTime = currentTime;
    accumulator += frameTime;

    while (accumulator >= FIXED_DT) {
      update(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    const alpha = accumulator / FIXED_DT;
    render(alpha);

    frameId = requestAnimationFrame(loop);
  };

  return {
    start: () => { lastTime = performance.now(); frameId = requestAnimationFrame(loop); },
    stop: () => cancelAnimationFrame(frameId)
  };
}

// Interpolated rendering for smooth visuals
function renderWithInterpolation(prev: number, curr: number, alpha: number): number {
  return prev + (curr - prev) * alpha;
}
```

---

## 2. OffscreenCanvas Caching

**Problem:** `createLinearGradient`/`createRadialGradient` in game loop.

**Solution:** Pre-render to offscreen canvas once, blit with `drawImage()`.

```typescript
interface CachedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

function createCachedGradientCircle(radius: number, colors: string[]): CachedSprite {
  const canvas = document.createElement('canvas');
  const size = radius * 2;
  const dpr = Math.min(window.devicePixelRatio, 2);

  canvas.width = size * dpr;
  canvas.height = size * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  // Gradient created ONCE
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  colors.forEach((color, i) => gradient.addColorStop(i / (colors.length - 1), color));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, width: size, height: size };
}

// In game loop - fast blit
function drawCachedSprite(ctx: CanvasRenderingContext2D, sprite: CachedSprite, x: number, y: number) {
  ctx.drawImage(sprite.canvas, x - sprite.width / 2, y - sprite.height / 2, sprite.width, sprite.height);
}

// React: cache in useMemo
const cachedOrange = useMemo(() => createCachedGradientCircle(20, ['#FFA500', '#FF6600']), []);
```

---

## 3. Object Pooling

**Problem:** `new Particle()` and `.filter()` create GC pressure.

**Solution:** Pre-allocate and reuse objects.

```typescript
interface Poolable {
  active: boolean;
  reset(): void;
}

class Particle implements Poolable {
  x = 0; y = 0; vx = 0; vy = 0;
  life = 0; maxLife = 0; size = 0;
  color = ''; active = false;

  reset() {
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.life = 0; this.active = false; this.color = '';
  }
}

class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private active: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize = 100) {
    this.factory = factory;
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
    const idx = this.active.indexOf(obj);
    if (idx !== -1) this.active.splice(idx, 1);
    this.pool.push(obj);
  }

  releaseAll(predicate: (obj: T) => boolean) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (predicate(this.active[i])) {
        const obj = this.active[i];
        obj.reset();
        this.active.splice(i, 1);
        this.pool.push(obj);
      }
    }
  }

  getActive(): readonly T[] { return this.active; }
}

// Usage
const particlePool = new ObjectPool(() => new Particle(), 200);

function spawnParticles(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const p = particlePool.acquire();
    p.x = x; p.y = y;
    p.vx = (Math.random() - 0.5) * 10;
    p.vy = (Math.random() - 0.5) * 10;
    p.life = 60; p.maxLife = 60;
  }
}

function updateParticles() {
  particlePool.releaseAll(p => p.life <= 0);
  for (const p of particlePool.getActive()) {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.2; p.life--;
  }
}
```

---

## 4. React useRef for Game State

**Problem:** `useState` for position/velocity triggers re-render every frame.

**Solution:** `useRef` for game state, `useState` only for UI with throttling.

```typescript
interface GameStateType {
  player: { x: number; y: number; velocity: number };
  score: number;
  gameOver: boolean;
}

function useGameEngine() {
  // Game state in ref - NO re-renders
  const gameState = useRef<GameStateType>({
    player: { x: 100, y: 100, velocity: 0 },
    score: 0,
    gameOver: false
  });

  // UI state only - throttled updates
  const [displayScore, setDisplayScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastUIUpdate = useRef(0);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameState.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || state.gameOver) return;

    // Update game state (no re-render)
    state.player.y += state.player.velocity;
    state.player.velocity += 0.5;

    // Render directly to canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Throttled UI update (every 100ms)
    if (timestamp - lastUIUpdate.current > 100) {
      if (state.score !== displayScore) setDisplayScore(state.score);
      lastUIUpdate.current = timestamp;
    }

    if (state.gameOver && !isGameOver) setIsGameOver(true);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [displayScore, isGameOver]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { canvasRef, displayScore, isGameOver, gameState };
}
```

---

## 5. Audio Singleton

**Problem:** Multiple `new AudioContext()` (limit is ~6) or oscillators per sound.

**Solution:** Singleton with node pooling.

```typescript
class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private gainPool: GainNode[] = [];
  private initialized = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Pre-warm pool
    for (let i = 0; i < 20; i++) {
      this.gainPool.push(this.ctx.createGain());
    }

    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.initialized = true;
  }

  private acquireGain(): GainNode {
    let gain = this.gainPool.pop();
    if (!gain && this.ctx) gain = this.ctx.createGain();
    gain?.connect(this.masterGain!);
    return gain!;
  }

  private releaseGain(gain: GainNode) {
    gain.disconnect();
    gain.gain.value = 1;
    this.gainPool.push(gain);
  }

  playTone(freq: number, duration: number, volume = 0.3, type: OscillatorType = 'sine') {
    if (!this.ctx || !this.initialized) return;

    const osc = this.ctx.createOscillator();
    const gain = this.acquireGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration / 1000);

    osc.connect(gain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration / 1000);

    osc.onended = () => {
      osc.disconnect();
      this.releaseGain(gain);
    };
  }

  suspend() { this.ctx?.suspend(); }
  resume() { this.ctx?.resume(); }
}

// Usage
const audio = AudioManager.getInstance();
document.addEventListener('click', () => audio.init(), { once: true });
```

---

## 6. Passive Touch Listeners

**Problem:** Non-passive touch listeners block scrolling (100-400ms delay).

**Solution:** `touch-action: none` CSS + passive listeners where possible.

```typescript
// CSS (required)
const styles = `
  .game-canvas {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
`;

// TypeScript
function setupTouchHandlers(canvas: HTMLCanvasElement, handlers: {
  onTouchStart: (x: number, y: number) => void;
  onTouchMove: (x: number, y: number) => void;
  onTouchEnd: () => void;
}) {
  const getTouch = (e: TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleStart = (e: TouchEvent) => {
    e.preventDefault();
    const pos = getTouch(e);
    handlers.onTouchStart(pos.x, pos.y);
  };

  const handleMove = (e: TouchEvent) => {
    const pos = getTouch(e);
    handlers.onTouchMove(pos.x, pos.y);
  };

  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: true });
  canvas.addEventListener('touchend', () => handlers.onTouchEnd(), { passive: true });
  canvas.addEventListener('touchcancel', () => handlers.onTouchEnd(), { passive: true });

  return () => {
    canvas.removeEventListener('touchstart', handleStart);
    canvas.removeEventListener('touchmove', handleMove);
    canvas.removeEventListener('touchend', handlers.onTouchEnd);
    canvas.removeEventListener('touchcancel', handlers.onTouchEnd);
  };
}
```

---

## 7. Page Visibility API

**Problem:** Game runs in background = battery drain.

**Solution:** Pause on `visibilitychange`.

```typescript
class GameLifecycle {
  private gameLoop: { start: () => void; stop: () => void } | null = null;
  private audioManager: AudioManager;
  private isVisible = true;
  private wasPlaying = false;

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
    this.setup();
  }

  setGameLoop(loop: { start: () => void; stop: () => void }) {
    this.gameLoop = loop;
  }

  private setup() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.onHidden();
      else this.onVisible();
    });

    window.addEventListener('blur', () => this.onHidden());
    window.addEventListener('focus', () => this.onVisible());
  }

  private onHidden() {
    if (!this.isVisible) return;
    this.isVisible = false;
    this.wasPlaying = true;
    this.gameLoop?.stop();
    this.audioManager.suspend();
  }

  private onVisible() {
    if (this.isVisible) return;
    this.isVisible = true;
    this.audioManager.resume();
    // Show "tap to resume" instead of auto-resuming
  }
}

// React hook
function useGameLifecycle(audioManager: AudioManager) {
  const lifecycleRef = useRef<GameLifecycle>();

  useEffect(() => {
    lifecycleRef.current = new GameLifecycle(audioManager);
    return () => { /* cleanup */ };
  }, [audioManager]);

  return lifecycleRef;
}
```

---

## 8. Adaptive devicePixelRatio

**Problem:** 3x DPR on modern phones tanks FPS.

**Solution:** Cap at 2x, detect low-end devices.

```typescript
function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
  const isLowEnd = detectLowEndDevice();
  const maxDpr = isLowEnd ? 1 : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return ctx;
}

function detectLowEndDevice(): boolean {
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;

  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;

  if (/iPhone\s(5|6|7|SE)/i.test(navigator.userAgent)) return true;

  return false;
}

// Dynamic quality adjustment
class AdaptiveQuality {
  private timestamps: number[] = [];
  private quality: 'high' | 'medium' | 'low' = 'high';

  measureFrame(timestamp: number) {
    this.timestamps.push(timestamp);
    if (this.timestamps.length > 60) this.timestamps.shift();

    if (this.timestamps.length >= 60) {
      const fps = 59 / ((this.timestamps[59] - this.timestamps[0]) / 1000);
      this.adjust(fps);
    }
  }

  private adjust(fps: number) {
    if (fps < 45 && this.quality !== 'low') {
      this.quality = this.quality === 'high' ? 'medium' : 'low';
    } else if (fps > 58 && this.quality !== 'high') {
      this.quality = this.quality === 'low' ? 'medium' : 'high';
    }
  }

  get particleMultiplier() {
    return { high: 1, medium: 0.5, low: 0.25 }[this.quality];
  }
}
```

---

## Quick Reference: RED FLAG → Fix

| RED FLAG Code | Fix |
|---------------|-----|
| `ctx.createLinearGradient(...)` in loop | Cache with Pattern #2 |
| `const [pos, setPos] = useState(...)` | Use `useRef` Pattern #4 |
| `particles.push(new Particle())` | Object pool Pattern #3 |
| `new AudioContext()` in function | Singleton Pattern #5 |
| `useEffect(() => { ... })` no return | Add cleanup |
| `position += velocity` no dt | Fixed timestep Pattern #1 |
| `<canvas>` no touch-action | Pattern #6 |
| No `visibilitychange` listener | Pattern #7 |
| `devicePixelRatio` uncapped | Pattern #8 |
