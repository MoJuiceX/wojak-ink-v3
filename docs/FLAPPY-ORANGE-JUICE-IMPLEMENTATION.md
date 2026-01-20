# Flappy Orange - MAXIMUM JUICE Implementation Guide

> Transform Flappy Orange into a viral, premium-feeling, hyper-engaging experience

**Game:** Flappy Orange (Canvas-based tap-to-fly)
**Target:** Maximum hype, premium feel, viral engagement
**Total Tasks:** 216 (160 juice + 56 design)
**File:** `src/pages/FlappyOrange.tsx` (901 lines, Canvas-based)

> 📄 **See also:** [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md) for 56 premium design tasks

---

## 🚀 QUICK WINS - Do These First! (30 min total)

These 5 changes give 80% of the premium feel with minimal code:

| # | Feature | Lines | Time | Impact |
|---|---------|-------|------|--------|
| 1 | **Freeze frame on death** | 10 | 5 min | 🔥🔥🔥 Instant premium |
| 2 | **Squash on flap** | 8 | 5 min | 🔥🔥🔥 Every tap satisfies |
| 3 | **Screen shake on death** | 6 | 3 min | 🔥🔥 Impact feel |
| 4 | **Impact flash on death** | 5 | 3 min | 🔥🔥 Visual punch |
| 5 | **Musical pass notes** | 15 | 10 min | 🔥🔥🔥 Addictive feedback |

```typescript
// QUICK WIN 1: Freeze Frame (add to death handler)
const triggerDeathFreeze = () => {
  gameStateRef.current.isFrozen = true;
  setTimeout(() => { gameStateRef.current.isFrozen = false; }, 150);
};

// QUICK WIN 2: Squash on Flap (add to flap handler)
const applyFlapSquash = () => {
  birdRef.current.scaleX = 0.85;
  birdRef.current.scaleY = 1.3;
  setTimeout(() => { birdRef.current.scaleX = 1; birdRef.current.scaleY = 1; }, 80);
};

// QUICK WIN 3: Screen Shake (add to death handler)
const triggerScreenShake = (intensity = 6, duration = 200) => {
  shakeRef.current = { intensity, startTime: Date.now(), duration };
};

// QUICK WIN 4: Impact Flash (add to death handler)
const triggerImpactFlash = () => {
  setImpactFlashAlpha(0.6);
  setTimeout(() => setImpactFlashAlpha(0), 100);
};

// QUICK WIN 5: Musical Notes (add to pass handler)
const PASS_NOTES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
const playPassNote = (pipeNumber: number) => {
  const noteIndex = pipeNumber % PASS_NOTES.length;
  playTone(PASS_NOTES[noteIndex], 0.1, 150);
};
```

---

## 🎨 RENDER ORDER (Z-Index Guide)

Draw in this exact order for correct layering:

```typescript
// === RENDER LOOP ORDER ===
const render = () => {
  // 1. BACKGROUND (furthest back)
  drawSkyGradient(ctx, environment);

  // 2. FAR PARALLAX (0.2x speed)
  drawMountainLayer(ctx, scrollOffset * 0.2, environment);

  // 3. MID PARALLAX (0.5x speed)
  drawClouds(ctx, scrollOffset * 0.5, environment);
  drawLightRays(ctx, environment); // sunset/day only

  // 4. GAME OBJECTS (1.0x speed)
  drawPipes(ctx, pipes);
  drawGapHighlight(ctx, pipes, bird.x); // safe zone glow

  // 5. CHARACTER
  drawTrail(ctx, trailSegments);
  drawBird(ctx, bird); // with squash/stretch applied
  drawWingParticles(ctx, wingParticles);

  // 6. FOREGROUND PARALLAX (1.1x speed)
  drawGround(ctx, scrollOffset);
  drawGrassTufts(ctx, scrollOffset * 1.1);

  // 7. PARTICLES (above everything)
  drawPassParticles(ctx, passParticles);
  drawDeathParticles(ctx, deathParticles);
  drawFireParticles(ctx, fireParticles); // when on fire

  // 8. UI LAYER
  drawScore(ctx, score);
  drawFloatingScores(ctx, floatingScores);
  drawFireModeIndicator(ctx, streak); // when active
  drawComboMeter(ctx, lastPassTime); // when streak >= 2

  // 9. OVERLAY EFFECTS (topmost)
  drawVignette(ctx, environment);
  drawNearMissFlash(ctx, nearMissFlashAlpha);
  drawImpactFlash(ctx, impactFlashAlpha);
  drawLightningFlash(ctx, lightningAlpha); // storm only

  // 10. GAME OVER (absolute top)
  if (gameState === 'gameover') {
    drawGameOverScreen(ctx, stats, gameOverAnimProgress);
  }
};
```

---

## 🛠️ HELPER FUNCTIONS (Copy These First!)

These are used throughout the implementation:

```typescript
// === HELPER FUNCTIONS ===

// Rounded rectangle (used for pipes, UI cards, buttons)
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// Easing functions (used for animations)
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Linear interpolation (used for smooth transitions)
const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * t;

// Color lerp (used for environment transitions)
const lerpColor = (color1: string, color2: string, t: number): string => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  const r = Math.round(lerp(c1.r, c2.r, t));
  const g = Math.round(lerp(c1.g, c2.g, t));
  const b = Math.round(lerp(c1.b, c2.b, t));
  return `rgb(${r}, ${g}, ${b})`;
};

// Hex to RGB (used by lerpColor)
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Clamp value between min and max
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

// Random in range (used for particles, variations)
const randomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

// Play tone with Web Audio API (used for musical notes)
const playTone = (frequency: number, volume: number, duration: number) => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  const ctx = audioContextRef.current;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
};

// Trigger haptic feedback (mobile)
const triggerHaptic = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};
```

---

## ⚠️ COMMON BUGS & GOTCHAS

Avoid these common implementation mistakes:

| Bug | Problem | Solution |
|-----|---------|----------|
| **Frozen game after death** | `timeScale` not reset | Always set `timeScale = 1` on game restart |
| **Memory leak** | Particles grow forever | Cap arrays: `if (particles.length > 100) particles.shift()` |
| **No sound on mobile** | AudioContext before tap | Create `AudioContext` in first user interaction |
| **Haptics not working** | HTTP, not HTTPS | Haptics require HTTPS (or localhost) |
| **Memory leak #2** | setTimeout not cleared | Store refs: `timeoutRef.current = setTimeout(...)` and clear on unmount |
| **Jittery animations** | Using `Date.now()` inconsistently | Pass `deltaTime` through game loop |
| **Particles after restart** | Arrays not cleared | Clear all particle arrays on `startGame()` |
| **Double death trigger** | No debounce | Set `isDead = true` immediately, check before triggering |

```typescript
// EXAMPLE: Proper cleanup on unmount
useEffect(() => {
  return () => {
    if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    wingParticlesRef.current = [];
    deathParticlesRef.current = [];
  };
}, []);

// EXAMPLE: Proper game restart
const startGame = () => {
  // Reset ALL state
  gameStateRef.current = { ...INITIAL_GAME_STATE };
  birdRef.current = { ...INITIAL_BIRD };

  // Clear all particles
  wingParticlesRef.current = [];
  deathParticlesRef.current = [];
  passParticlesRef.current = [];
  fireParticlesRef.current = [];
  trailSegmentsRef.current = [];

  // Reset time scale
  timeScaleRef.current = 1;

  // Reset visual effects
  setImpactFlashAlpha(0);
  setNearMissFlashAlpha(0);
  shakeRef.current = null;
};
```

---

## 📱 MOBILE-SPECIFIC CONSIDERATIONS

| Issue | Solution |
|-------|----------|
| **Finger covers tap point** | Bird position is higher than finger - this is fine |
| **Touch offset** | Add 20px upward offset to touch detection |
| **Safari audio** | Must create AudioContext on user gesture, not on load |
| **iOS haptics** | Use `navigator.vibrate()` - works on Safari 16.4+ |
| **Android haptics** | Works on Chrome, use short patterns (10-50ms) |
| **60fps target** | Profile on real device, not just Chrome DevTools |
| **Fat finger** | Touch targets should be 44x44px minimum |
| **Thumb zone** | Primary actions in bottom 40% of screen (96% accuracy) |

```typescript
// Mobile touch handling with offset
const handleTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top - 20; // 20px offset for finger

  // Only handle if in valid play area
  if (y > 0 && y < canvas.height) {
    handleFlap();
  }
};

// iOS-safe audio initialization
const initAudio = () => {
  if (!audioInitialized) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Resume on iOS
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    audioInitialized = true;
  }
};

// Call on first user interaction
canvas.addEventListener('touchstart', initAudio, { once: true });
canvas.addEventListener('click', initAudio, { once: true });
```

---

## 📊 PERFORMANCE BUDGET

Stay within these limits for smooth 60fps:

| Resource | Limit | Why |
|----------|-------|-----|
| **Particles on screen** | 100 max | GPU overdraw |
| **Trail segments** | 12 max | Draw calls |
| **Parallax layers** | 7 max | Rendering passes |
| **Active audio voices** | 8 max | Audio buffer |
| **Floating scores** | 5 max | Text rendering |
| **Clouds** | 6 max | Radial gradients expensive |

```typescript
// Particle pool with limit
const MAX_PARTICLES = 100;

const addParticle = (particle: Particle) => {
  if (particlesRef.current.length >= MAX_PARTICLES) {
    particlesRef.current.shift(); // Remove oldest
  }
  particlesRef.current.push(particle);
};

// Or use object pooling for better perf
const particlePool: Particle[] = [];
const getParticle = (): Particle => {
  return particlePool.pop() || createNewParticle();
};
const releaseParticle = (p: Particle) => {
  if (particlePool.length < MAX_PARTICLES) {
    particlePool.push(p);
  }
};
```

---

## 📝 BEFORE / AFTER COMPARISON

### Death Sequence

**BEFORE:**
```
Bird hits pipe → Instant game over screen
```

**AFTER:**
```
Bird hits pipe
  → 150ms FREEZE FRAME (time stops, dramatic pause)
  → White IMPACT FLASH (0.6 alpha, 100ms)
  → Screen SHAKE (intensity 6, 200ms)
  → 30 PARTICLES explode outward
  → Slow-mo TUMBLE (0.3x speed, 400ms, 720° rotation)
  → CHROMATIC ABERRATION flash
  → Heavy HAPTIC (40ms)
  → Slide-up game over card
```

### Flap

**BEFORE:**
```
Tap → Bird moves up
```

**AFTER:**
```
Tap
  → SQUASH (0.85x width, 1.3x height, 80ms)
  → 5 WING PARTICLES burst backward
  → Varied pitch FLAP SOUND (±15%)
  → 2% camera ZOOM pulse
  → 8ms HAPTIC pulse
  → Smooth RETURN to normal (150ms eased)
```

### Pipe Pass

**BEFORE:**
```
Pass pipe → Score +1
```

**AFTER:**
```
Pass pipe
  → MUSICAL NOTE (C major scale, cycles through)
  → 10 GOLD PARTICLES burst
  → "+1" FLOATING SCORE (arcs up, fades)
  → Screen BRIGHTNESS pulse
  → 15ms double HAPTIC
  → Near-miss check (if close: yellow flash + bonus)
  → Streak counter +1 (if 5+: FIRE MODE activates!)
```

---

## Quick Reference Card

### Key Constants to Add
```typescript
// Physics Feel
const DEFORMATION = { flapX: 0.85, flapY: 1.3, duration: 80, return: 150 };
const FREEZE_FRAME = { duration: 150, shake: 6 };
const SLOW_MO = { timeScale: 0.3, duration: 400, tumble: 720 };

// Near-Miss
const NEAR_MISS_THRESHOLD = 0.25; // 25% of gap
const NEAR_MISS_BONUS = [1, 2, 3]; // by intensity tier

// Musical Scale (C Major)
const PASS_FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];

// Fire Mode
const FIRE_THRESHOLD = 5; // pipes to activate
const FIRE_MULTIPLIER = 1.5;

// Particles
const WING_PARTICLES = { count: 5, speed: 2, life: 300 };
const DEATH_PARTICLES = { count: 30, speed: 5, life: 600 };
const PASS_PARTICLES = { count: 10, speed: 3, life: 400 };
```

### Event → Effect Mapping
| Event | Sound | Visual | Haptic | Camera |
|-------|-------|--------|--------|--------|
| Flap | Varied pitch (±15%) | Squash/stretch + wing particles | 8ms pulse | 2% zoom |
| Pass Pipe | Musical note (scale) | Gold particles + "+1" | 15ms double | Brightness pulse |
| Near-Miss | Rising tone | Yellow flash + "CLOSE!" | 5ms flutter | - |
| Fire Mode Start | Whoosh + crackle loop | Fire trail + border glow | Building pattern | - |
| Milestone (10/25/50/75/100) | Celebration sound | Confetti + callout + time dilation | Heavy pattern | 5% zoom |
| Death | Impact thud | Freeze → particles → tumble | 40ms heavy | 6 intensity shake |

### Color Palette (Unified)

> 📄 **Full palette with environment colors:** See [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md#color-palette-premium-orange-theme)

```typescript
const COLORS = {
  // Character
  orange: '#FF6B00',
  orangeLight: '#FF8C33',
  orangeDark: '#CC5500',
  orangeGlow: '#FFB366',

  // UI & Effects
  gold: '#FFD700',
  nearMiss: '#FFDD00',
  fire: '#FF4500',
  success: '#00FF88',
  danger: '#FF6B6B',

  // Pipes
  pipeGreen: '#228B22',
  pipeGreenDark: '#1B5E20',
};
```

---

## User Preferences Selected

| Feature | Choice |
|---------|--------|
| Death Feel | **DRAMATIC** - Freeze frame + slow-mo tumble + particle explosion + chromatic aberration |
| Flap Feel | **PREMIUM** - Squash/stretch + wing particles + varied sounds + camera pulse + haptic |
| Near-Miss System | **FULL** - Detection + yellow flash + rising tone + bonus points + callout |
| Pass Feedback | **FULL JUICE** - Particles + floating score + musical note + screen pulse + haptic |
| Parallax | **FULL 3-LAYER** - Distant bg + clouds + foreground at different speeds |
| Squash/Stretch | **FULL** - Stretch on flap + squash at peak + compress on death |
| Streak Fire | **FULL** - Fire trail + 1.5x multiplier + intensifying effects after 5 pipes |
| Share System | **FULL VIRAL** - Canvas screenshot + challenge link + one-tap share |

---

## Phase 1: PREMIUM FLAP FEEL (18 tasks)

The flap is the CORE interaction - must feel powerful every single time.

### 1.1 Squash & Stretch System

```typescript
interface BirdDeformation {
  scaleX: number;
  scaleY: number;
  targetScaleX: number;
  targetScaleY: number;
}

const DEFORMATION_CONFIG = {
  FLAP: {
    scaleX: 0.85,      // Compress horizontally
    scaleY: 1.3,       // Stretch vertically
    duration: 80,      // Fast stretch
    returnDuration: 150 // Slower return
  },
  FALL_PEAK: {
    scaleX: 1.1,       // Slightly wider
    scaleY: 0.9,       // Slightly shorter
    duration: 100
  },
  DEATH_IMPACT: {
    scaleX: 1.4,       // Very wide
    scaleY: 0.6,       // Very short
    duration: 60,
    returnDuration: 200
  }
};

// Apply on flap
const applyFlapDeformation = () => {
  birdRef.current.scaleX = DEFORMATION_CONFIG.FLAP.scaleX;
  birdRef.current.scaleY = DEFORMATION_CONFIG.FLAP.scaleY;

  setTimeout(() => {
    // Ease back to normal
    animateToValue(birdRef.current, 'scaleX', 1.0, DEFORMATION_CONFIG.FLAP.returnDuration);
    animateToValue(birdRef.current, 'scaleY', 1.0, DEFORMATION_CONFIG.FLAP.returnDuration);
  }, DEFORMATION_CONFIG.FLAP.duration);
};
```

**Tasks:**
- [ ] 1.1.1 Add scaleX/scaleY to bird state
- [ ] 1.1.2 Create DEFORMATION_CONFIG constant
- [ ] 1.1.3 Implement applyFlapDeformation function
- [ ] 1.1.4 Implement applyFallPeakDeformation (at velocity apex)
- [ ] 1.1.5 Implement applyDeathDeformation
- [ ] 1.1.6 Modify drawBird to use scale transforms
- [ ] 1.1.7 Add easing function for smooth returns

### 1.2 Wing Burst Particles

```typescript
interface WingParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

const spawnWingParticles = (birdX: number, birdY: number) => {
  const particles: WingParticle[] = [];
  const count = 5 + Math.floor(Math.random() * 3); // 5-7 particles

  for (let i = 0; i < count; i++) {
    particles.push({
      id: Date.now() + i,
      x: birdX - 10, // Behind bird (wing position)
      y: birdY + Math.random() * 10 - 5,
      vx: -2 - Math.random() * 2, // Shoot backward
      vy: Math.random() * 2 - 1,
      size: 3 + Math.random() * 3,
      alpha: 0.8,
      color: `hsl(${30 + Math.random() * 20}, 100%, 60%)` // Orange variants
    });
  }

  return particles;
};
```

**Tasks:**
- [ ] 1.2.1 Create WingParticle interface
- [ ] 1.2.2 Add wingParticles state array
- [ ] 1.2.3 Implement spawnWingParticles function
- [ ] 1.2.4 Add particle update loop (fade + move)
- [ ] 1.2.5 Add particle render in game loop
- [ ] 1.2.6 Call spawnWingParticles on every flap

### 1.3 Varied Pitch Flap Sounds

```typescript
const FLAP_SOUND_CONFIG = {
  baseFrequency: 220, // A3
  pitchVariation: 0.15, // ±15%
  volumeVariation: 0.1, // ±10%
  duration: 0.12,
  type: 'sine' as OscillatorType
};

const playFlapSound = () => {
  const audioContext = audioContextRef.current;
  if (!audioContext || !soundEnabled) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Randomize pitch
  const pitchMultiplier = 1 + (Math.random() * 2 - 1) * FLAP_SOUND_CONFIG.pitchVariation;
  osc.frequency.value = FLAP_SOUND_CONFIG.baseFrequency * pitchMultiplier;
  osc.type = FLAP_SOUND_CONFIG.type;

  // Randomize volume
  const volume = 0.3 + (Math.random() * 2 - 1) * FLAP_SOUND_CONFIG.volumeVariation;

  // Fast attack, quick decay (responsive feel)
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + FLAP_SOUND_CONFIG.duration);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + FLAP_SOUND_CONFIG.duration);
};
```

**Tasks:**
- [ ] 1.3.1 Create FLAP_SOUND_CONFIG constant
- [ ] 1.3.2 Implement playFlapSound with Web Audio API
- [ ] 1.3.3 Add pitch randomization (±15%)
- [ ] 1.3.4 Add volume randomization (±10%)
- [ ] 1.3.5 Replace existing flap sound call

### 1.4 Micro Camera Pulse

```typescript
const CAMERA_PULSE_CONFIG = {
  flapZoom: 1.02, // 2% zoom on flap
  flapDuration: 50,
  returnDuration: 100
};

const triggerCameraPulse = () => {
  setCameraZoom(CAMERA_PULSE_CONFIG.flapZoom);

  setTimeout(() => {
    // Ease back to 1.0
    animateCameraZoom(1.0, CAMERA_PULSE_CONFIG.returnDuration);
  }, CAMERA_PULSE_CONFIG.flapDuration);
};

// Apply in canvas transform
ctx.save();
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(cameraZoom, cameraZoom);
ctx.translate(-canvas.width / 2, -canvas.height / 2);
// ... render game ...
ctx.restore();
```

**Tasks:**
- [ ] 1.4.1 Add cameraZoom state (default 1.0)
- [ ] 1.4.2 Create CAMERA_PULSE_CONFIG
- [ ] 1.4.3 Implement triggerCameraPulse function
- [ ] 1.4.4 Apply camera zoom in canvas render
- [ ] 1.4.5 Call on every flap

### 1.5 Enhanced Haptic Feedback

```typescript
const HAPTIC_PATTERNS = {
  FLAP: [8], // Short pulse
  PASS: [15, 5, 15], // Double tap
  NEAR_MISS: [5, 5, 5, 5, 5], // Rapid flutter
  MILESTONE: [20, 10, 20, 10, 30], // Escalating
  DEATH: [40, 20, 60], // Heavy impact
  STREAK_START: [10, 5, 10, 5, 10, 5, 20] // Building
};

const triggerHaptic = (pattern: number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};
```

**Tasks:**
- [ ] 1.5.1 Create HAPTIC_PATTERNS constant
- [ ] 1.5.2 Implement triggerHaptic helper
- [ ] 1.5.3 Apply FLAP pattern on every tap

---

## Phase 2: DRAMATIC DEATH SEQUENCE (16 tasks)

Death must feel impactful but not frustrating - the "I know what I did wrong" moment.

### 2.1 Freeze Frame System

```typescript
const FREEZE_CONFIG = {
  duration: 150, // 150ms freeze
  shakeIntensity: 6,
  shakeDuration: 200
};

const triggerDeathFreeze = () => {
  gameStateRef.current.isFrozen = true;

  // Trigger screen shake during freeze
  triggerScreenShake(FREEZE_CONFIG.shakeIntensity, FREEZE_CONFIG.shakeDuration);

  setTimeout(() => {
    gameStateRef.current.isFrozen = false;
    startSlowMotionDeath();
  }, FREEZE_CONFIG.duration);
};

// In game loop
if (gameStateRef.current.isFrozen) {
  // Don't update physics, just render current frame
  return;
}
```

**Tasks:**
- [ ] 2.1.1 Add isFrozen flag to game state
- [ ] 2.1.2 Create FREEZE_CONFIG constant
- [ ] 2.1.3 Implement triggerDeathFreeze function
- [ ] 2.1.4 Skip physics updates when frozen
- [ ] 2.1.5 Continue rendering during freeze (particles still animate)

### 2.2 Slow-Motion Tumble

```typescript
const SLOW_MO_CONFIG = {
  timeScale: 0.3, // 30% speed
  duration: 400,
  tumbleRotationSpeed: 720, // degrees per second at normal speed
  knockbackX: 2 + Math.random() * 2 // Random sideways
};

const startSlowMotionDeath = () => {
  gameStateRef.current.timeScale = SLOW_MO_CONFIG.timeScale;
  gameStateRef.current.bird.rotationVelocity = SLOW_MO_CONFIG.tumbleRotationSpeed;
  gameStateRef.current.bird.velocityX = -SLOW_MO_CONFIG.knockbackX; // Knocked back

  setTimeout(() => {
    gameStateRef.current.timeScale = 1.0;
    showGameOver();
  }, SLOW_MO_CONFIG.duration);
};

// Apply timeScale in physics
const deltaTime = 1 * gameStateRef.current.timeScale;
bird.velocity += GRAVITY * deltaTime;
bird.y += bird.velocity * deltaTime;
bird.rotation += bird.rotationVelocity * deltaTime * (Math.PI / 180);
```

**Tasks:**
- [ ] 2.2.1 Add timeScale to game state (default 1.0)
- [ ] 2.2.2 Add rotationVelocity to bird state
- [ ] 2.2.3 Add velocityX to bird state (for knockback)
- [ ] 2.2.4 Create SLOW_MO_CONFIG constant
- [ ] 2.2.5 Implement startSlowMotionDeath function
- [ ] 2.2.6 Apply timeScale to all physics calculations

### 2.3 Death Particle Explosion

```typescript
const spawnDeathParticles = (x: number, y: number) => {
  const particles: DeathParticle[] = [];
  const count = 25 + Math.floor(Math.random() * 10); // 25-35 particles

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;

    particles.push({
      id: Date.now() + i,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      alpha: 1,
      color: Math.random() > 0.3
        ? `hsl(${25 + Math.random() * 15}, 100%, ${50 + Math.random() * 20}%)` // Orange
        : '#ffffff', // White sparks
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  return particles;
};
```

**Tasks:**
- [ ] 2.3.1 Create DeathParticle interface
- [ ] 2.3.2 Add deathParticles state array
- [ ] 2.3.3 Implement spawnDeathParticles function
- [ ] 2.3.4 Add gravity to death particles
- [ ] 2.3.5 Render death particles with rotation

### 2.4 Chromatic Aberration Flash

```typescript
const CHROMATIC_CONFIG = {
  intensity: 0.02, // 2% RGB split
  duration: 200,
  decayType: 'exponential'
};

const applyChromaticAberration = (ctx: CanvasRenderingContext2D) => {
  if (chromaticIntensity <= 0) return;

  // Get current canvas as image
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const offset = Math.floor(chromaticIntensity * canvas.width);

  // Simple RGB split effect
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const offsetI = (y * canvas.width + Math.min(x + offset, canvas.width - 1)) * 4;

      // Shift red channel
      data[i] = data[offsetI];
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
```

**Tasks:**
- [ ] 2.4.1 Add chromaticIntensity state
- [ ] 2.4.2 Create CHROMATIC_CONFIG constant
- [ ] 2.4.3 Implement applyChromaticAberration (simplified version)
- [ ] 2.4.4 Trigger on death, decay over 200ms
- [ ] 2.4.5 Alternative: CSS filter approach for performance

### 2.5 Impact Flash

```typescript
const triggerImpactFlash = () => {
  setImpactFlashAlpha(0.6); // White flash

  // Rapid decay
  const decay = () => {
    setImpactFlashAlpha(prev => {
      if (prev <= 0.05) return 0;
      return prev * 0.85; // Exponential decay
    });

    if (impactFlashAlpha > 0.05) {
      requestAnimationFrame(decay);
    }
  };

  requestAnimationFrame(decay);
};

// Render as overlay
if (impactFlashAlpha > 0) {
  ctx.fillStyle = `rgba(255, 255, 255, ${impactFlashAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

**Tasks:**
- [ ] 2.5.1 Add impactFlashAlpha state
- [ ] 2.5.2 Implement triggerImpactFlash function
- [ ] 2.5.3 Render white overlay in game loop
- [ ] 2.5.4 Trigger on death collision

---

## Phase 3: NEAR-MISS DETECTION SYSTEM (14 tasks)

Creates tension and rewards risky play.

### 3.1 Near-Miss Detection Algorithm

```typescript
interface NearMissResult {
  isNearMiss: boolean;
  intensity: number; // 0-1, closer = higher
  edge: 'top' | 'bottom' | 'both' | null;
}

const NEAR_MISS_CONFIG = {
  threshold: 0.25, // Within 25% of gap edges
  bonusPoints: 2,
  minGapFromEdge: 15 // pixels
};

const checkNearMiss = (bird: Bird, pipe: Pipe): NearMissResult => {
  const birdTop = bird.y - BIRD_RADIUS;
  const birdBottom = bird.y + BIRD_RADIUS;

  const gapTop = pipe.gapY;
  const gapBottom = pipe.gapY + PIPE_GAP;

  const distFromTop = birdTop - gapTop;
  const distFromBottom = gapBottom - birdBottom;

  const threshold = PIPE_GAP * NEAR_MISS_CONFIG.threshold;

  let isNearMiss = false;
  let intensity = 0;
  let edge: 'top' | 'bottom' | 'both' | null = null;

  if (distFromTop < threshold && distFromTop > 0) {
    isNearMiss = true;
    intensity = Math.max(intensity, 1 - (distFromTop / threshold));
    edge = 'top';
  }

  if (distFromBottom < threshold && distFromBottom > 0) {
    isNearMiss = true;
    const bottomIntensity = 1 - (distFromBottom / threshold);
    if (bottomIntensity > intensity) {
      intensity = bottomIntensity;
      edge = edge === 'top' ? 'both' : 'bottom';
    }
  }

  return { isNearMiss, intensity, edge };
};
```

**Tasks:**
- [ ] 3.1.1 Create NearMissResult interface
- [ ] 3.1.2 Create NEAR_MISS_CONFIG constant
- [ ] 3.1.3 Implement checkNearMiss function
- [ ] 3.1.4 Call on every pipe pass
- [ ] 3.1.5 Track consecutive near-misses for bonus escalation

### 3.2 Near-Miss Visual Feedback

```typescript
const triggerNearMissVisuals = (intensity: number, edge: string) => {
  // Yellow screen flash (proportional to intensity)
  setNearMissFlashAlpha(intensity * 0.3);

  // Spawn edge particles
  const particleY = edge === 'top'
    ? pipe.gapY + 10
    : pipe.gapY + PIPE_GAP - 10;

  spawnNearMissParticles(bird.x, particleY, intensity);

  // Show "CLOSE!" callout for high intensity
  if (intensity > 0.7) {
    showEpicCallout('CLOSE!', '#ffdd00');
  } else if (intensity > 0.4) {
    showFloatingText('close!', bird.x, bird.y - 30, '#ffdd00');
  }
};
```

**Tasks:**
- [ ] 3.2.1 Add nearMissFlashAlpha state
- [ ] 3.2.2 Implement yellow screen flash (quick fade)
- [ ] 3.2.3 Create spawnNearMissParticles function
- [ ] 3.2.4 Add "CLOSE!" callout for high intensity
- [ ] 3.2.5 Render yellow vignette overlay

### 3.3 Near-Miss Audio

```typescript
const playNearMissSound = (intensity: number) => {
  const audioContext = audioContextRef.current;
  if (!audioContext || !soundEnabled) return;

  // Rising tone - higher intensity = higher pitch
  const baseFreq = 400;
  const freqBoost = intensity * 200; // Up to 600Hz

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.frequency.setValueAtTime(baseFreq + freqBoost, audioContext.currentTime);
  osc.frequency.linearRampToValueAtTime(baseFreq + freqBoost + 100, audioContext.currentTime + 0.1);
  osc.type = 'triangle';

  gain.gain.setValueAtTime(0.2 * intensity, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);
};
```

**Tasks:**
- [ ] 3.3.1 Implement playNearMissSound function
- [ ] 3.3.2 Pitch scales with intensity
- [ ] 3.3.3 Call on near-miss detection

### 3.4 Near-Miss Bonus Points

```typescript
const calculateNearMissBonus = (intensity: number): number => {
  if (intensity > 0.8) return 3; // "INSANE" close
  if (intensity > 0.5) return 2; // Very close
  if (intensity > 0.2) return 1; // Close
  return 0;
};

// In score handler
const nearMiss = checkNearMiss(bird, pipe);
let points = 1; // Base point

if (nearMiss.isNearMiss) {
  const bonus = calculateNearMissBonus(nearMiss.intensity);
  points += bonus;

  if (bonus > 0) {
    showFloatingText(`+${bonus} CLOSE!`, bird.x, bird.y - 40, '#ffdd00');
    triggerNearMissVisuals(nearMiss.intensity, nearMiss.edge);
    playNearMissSound(nearMiss.intensity);
    triggerHaptic(HAPTIC_PATTERNS.NEAR_MISS);
  }
}
```

**Tasks:**
- [ ] 3.4.1 Implement calculateNearMissBonus function
- [ ] 3.4.2 Integrate into scoring system
- [ ] 3.4.3 Show bonus points floating text
- [ ] 3.4.4 Track total near-miss bonuses for stats

---

## Phase 4: FULL PASS JUICE (12 tasks)

Every pipe pass should feel rewarding.

### 4.1 Pass Particle Burst

```typescript
const spawnPassParticles = (x: number, y: number) => {
  const particles: PassParticle[] = [];
  const count = 8 + Math.floor(Math.random() * 4); // 8-12 particles

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    particles.push({
      id: Date.now() + i,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // Slight upward bias
      size: 4 + Math.random() * 4,
      alpha: 1,
      color: Math.random() > 0.5 ? '#ffd700' : '#ffffff' // Gold and white
    });
  }

  return particles;
};
```

**Tasks:**
- [ ] 4.1.1 Create PassParticle interface
- [ ] 4.1.2 Add passParticles state array
- [ ] 4.1.3 Implement spawnPassParticles function
- [ ] 4.1.4 Trigger on every pipe pass

### 4.2 Musical Pass Notes (Rising Scale)

```typescript
const PASS_SCALE_FREQUENCIES = [
  261.63, // C4 (pass 1, or after reset)
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25  // C5 (octave up, max)
];

const playPassNote = (pipeNumber: number) => {
  const audioContext = audioContextRef.current;
  if (!audioContext || !soundEnabled) return;

  // Cycle through scale, reset every 8
  const noteIndex = (pipeNumber - 1) % PASS_SCALE_FREQUENCIES.length;
  const frequency = PASS_SCALE_FREQUENCIES[noteIndex];

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.frequency.value = frequency;
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.4, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.25);
};
```

**Tasks:**
- [ ] 4.2.1 Create PASS_SCALE_FREQUENCIES constant (C major scale)
- [ ] 4.2.2 Implement playPassNote function
- [ ] 4.2.3 Track pipe number for scale position
- [ ] 4.2.4 Reset scale on game over

### 4.3 Subtle Screen Pulse

```typescript
const triggerPassPulse = () => {
  setScreenBrightness(1.1); // 10% brighter

  setTimeout(() => {
    animateToValue('screenBrightness', 1.0, 100);
  }, 30);
};

// Apply as CSS filter or canvas brightness
ctx.filter = `brightness(${screenBrightness})`;
```

**Tasks:**
- [ ] 4.3.1 Add screenBrightness state
- [ ] 4.3.2 Implement triggerPassPulse function
- [ ] 4.3.3 Apply brightness in render
- [ ] 4.3.4 Call on every pipe pass

### 4.4 Enhanced Floating Score

```typescript
const showPassScore = (points: number, x: number, y: number, isNearMiss: boolean) => {
  const scorePopup: FloatingScore = {
    id: Date.now(),
    text: `+${points}`,
    x,
    y,
    startY: y,
    scale: isNearMiss ? 1.5 : 1.0,
    alpha: 1,
    color: isNearMiss ? '#ffdd00' : '#ffd700',
    lifetime: 800
  };

  setFloatingScores(prev => [...prev, scorePopup]);
};
```

**Tasks:**
- [ ] 4.4.1 Enhance FloatingScore to include scale
- [ ] 4.4.2 Make near-miss scores larger and yellow
- [ ] 4.4.3 Add scale animation (grow then shrink)
- [ ] 4.4.4 Improve floating animation (arc, not linear)

---

## Phase 5: 3-LAYER PARALLAX SYSTEM (14 tasks)

> ⚠️ **NOTE:** For a more comprehensive **7-layer parallax system** with volumetric clouds, light rays, and mountain silhouettes, see [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md - Phase D2](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md#phase-d2-environment-depth-14-tasks).

Creates depth and premium feel. This is the basic 3-layer system - upgrade to D2 for premium visuals.

### 5.1 Parallax Layer Structure

```typescript
interface ParallaxLayer {
  elements: ParallaxElement[];
  speedMultiplier: number; // 0-1, lower = further away
  yOffset: number;
}

interface ParallaxElement {
  type: 'cloud' | 'mountain' | 'bush' | 'tree';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const PARALLAX_CONFIG = {
  background: {
    speedMultiplier: 0.3,
    elements: ['distant_mountains', 'sun_moon']
  },
  midground: {
    speedMultiplier: 0.6,
    elements: ['clouds', 'birds']
  },
  foreground: {
    speedMultiplier: 0.9,
    elements: ['bushes', 'grass_detail']
  }
};
```

**Tasks:**
- [ ] 5.1.1 Create ParallaxLayer interface
- [ ] 5.1.2 Create ParallaxElement interface
- [ ] 5.1.3 Create PARALLAX_CONFIG constant
- [ ] 5.1.4 Add parallaxLayers state

### 5.2 Background Layer (30% speed)

```typescript
const drawBackgroundLayer = (ctx: CanvasRenderingContext2D, offset: number) => {
  const layerOffset = offset * 0.3;

  // Distant mountains
  ctx.fillStyle = getEnvironmentColor('mountain');
  drawMountainRange(ctx, layerOffset, canvas.height * 0.6);

  // Sun or moon based on environment
  if (environment === 'day' || environment === 'sunset') {
    drawSun(ctx, canvas.width * 0.8, canvas.height * 0.2);
  } else {
    drawMoon(ctx, canvas.width * 0.8, canvas.height * 0.15);
  }
};

const drawMountainRange = (ctx: CanvasRenderingContext2D, offset: number, baseY: number) => {
  ctx.beginPath();
  ctx.moveTo(0, baseY);

  // Generate mountain peaks
  for (let x = 0; x < canvas.width + 200; x += 100) {
    const peakHeight = 30 + Math.sin((x + offset) * 0.02) * 20;
    ctx.lineTo(x - offset % 200, baseY - peakHeight);
  }

  ctx.lineTo(canvas.width, baseY);
  ctx.closePath();
  ctx.fill();
};
```

**Tasks:**
- [ ] 5.2.1 Implement drawBackgroundLayer function
- [ ] 5.2.2 Create drawMountainRange function
- [ ] 5.2.3 Create drawSun function
- [ ] 5.2.4 Create drawMoon function (for night)
- [ ] 5.2.5 Apply environment-specific colors

### 5.3 Midground Layer (60% speed) - Clouds

```typescript
interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

const generateClouds = (): Cloud[] => {
  const clouds: Cloud[] = [];
  const count = 5 + Math.floor(Math.random() * 3);

  for (let i = 0; i < count; i++) {
    clouds.push({
      x: Math.random() * canvas.width * 2, // Spread across 2x width
      y: 50 + Math.random() * (canvas.height * 0.3),
      width: 80 + Math.random() * 60,
      height: 30 + Math.random() * 20,
      opacity: 0.4 + Math.random() * 0.3
    });
  }

  return clouds;
};

const drawCloud = (ctx: CanvasRenderingContext2D, cloud: Cloud) => {
  ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;

  // Draw fluffy cloud shape (multiple circles)
  const cx = cloud.x;
  const cy = cloud.y;

  ctx.beginPath();
  ctx.arc(cx, cy, cloud.height * 0.5, 0, Math.PI * 2);
  ctx.arc(cx + cloud.width * 0.3, cy - 5, cloud.height * 0.4, 0, Math.PI * 2);
  ctx.arc(cx + cloud.width * 0.6, cy, cloud.height * 0.45, 0, Math.PI * 2);
  ctx.fill();
};
```

**Tasks:**
- [ ] 5.3.1 Create Cloud interface
- [ ] 5.3.2 Implement generateClouds function
- [ ] 5.3.3 Implement drawCloud function
- [ ] 5.3.4 Add clouds state
- [ ] 5.3.5 Update cloud positions based on scroll offset

### 5.4 Foreground Layer (90% speed)

```typescript
const drawForegroundLayer = (ctx: CanvasRenderingContext2D, offset: number) => {
  const layerOffset = offset * 0.9;

  // Grass tufts on ground
  ctx.fillStyle = getEnvironmentColor('grass');

  for (let x = 0; x < canvas.width + 50; x += 30) {
    const xPos = x - (layerOffset % 30);
    const height = 8 + Math.sin(x * 0.1) * 4;

    // Triangle grass tuft
    ctx.beginPath();
    ctx.moveTo(xPos, canvas.height - 20);
    ctx.lineTo(xPos + 5, canvas.height - 20 - height);
    ctx.lineTo(xPos + 10, canvas.height - 20);
    ctx.fill();
  }
};
```

**Tasks:**
- [ ] 5.4.1 Implement drawForegroundLayer function
- [ ] 5.4.2 Create grass tuft drawing
- [ ] 5.4.3 Add subtle bushes/plants
- [ ] 5.4.4 Integrate into render loop

---

## Phase 6: STREAK FIRE MODE (16 tasks)

After 5 consecutive pipe passes, activate fire mode!

### 6.1 Streak Tracking

```typescript
interface StreakState {
  current: number;
  isOnFire: boolean;
  fireStartTime: number;
  multiplier: number;
}

const STREAK_CONFIG = {
  fireThreshold: 5, // Pipes to activate fire mode
  baseMultiplier: 1.0,
  fireMultiplier: 1.5,
  fireParticleRate: 3 // per frame
};

const updateStreak = (passed: boolean) => {
  if (passed) {
    setStreak(prev => {
      const newStreak = prev.current + 1;
      const isOnFire = newStreak >= STREAK_CONFIG.fireThreshold;

      if (isOnFire && !prev.isOnFire) {
        // Just entered fire mode!
        triggerFireModeStart();
      }

      return {
        current: newStreak,
        isOnFire,
        fireStartTime: isOnFire && !prev.isOnFire ? Date.now() : prev.fireStartTime,
        multiplier: isOnFire ? STREAK_CONFIG.fireMultiplier : STREAK_CONFIG.baseMultiplier
      };
    });
  } else {
    // Streak broken on death
    if (streak.isOnFire) {
      triggerFireModeEnd();
    }
    setStreak({ current: 0, isOnFire: false, fireStartTime: 0, multiplier: 1.0 });
  }
};
```

**Tasks:**
- [ ] 6.1.1 Create StreakState interface
- [ ] 6.1.2 Create STREAK_CONFIG constant
- [ ] 6.1.3 Add streak state
- [ ] 6.1.4 Implement updateStreak function
- [ ] 6.1.5 Call on pipe pass and death

### 6.2 Fire Mode Visual Effects

```typescript
const drawFireTrail = (ctx: CanvasRenderingContext2D, bird: Bird) => {
  if (!streak.isOnFire) return;

  // Fire particles behind bird
  const fireColors = ['#ff4500', '#ff6600', '#ff8800', '#ffaa00', '#ffcc00'];

  for (let i = 0; i < STREAK_CONFIG.fireParticleRate; i++) {
    const particle = {
      x: bird.x - 15 - Math.random() * 20,
      y: bird.y + (Math.random() - 0.5) * 20,
      size: 6 + Math.random() * 8,
      color: fireColors[Math.floor(Math.random() * fireColors.length)],
      alpha: 0.8
    };

    fireParticlesRef.current.push(particle);
  }

  // Draw fire particles
  fireParticlesRef.current.forEach((p, i) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${hexToRgb(p.color)}, ${p.alpha})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Update particle
    p.x -= 3;
    p.alpha -= 0.05;
    p.size *= 0.95;
  });

  // Remove dead particles
  fireParticlesRef.current = fireParticlesRef.current.filter(p => p.alpha > 0.1);
};
```

**Tasks:**
- [ ] 6.2.1 Add fireParticles ref
- [ ] 6.2.2 Implement drawFireTrail function
- [ ] 6.2.3 Create fire color palette
- [ ] 6.2.4 Add fire glow around bird

### 6.3 Fire Mode Border Glow

```typescript
const drawFireBorder = (ctx: CanvasRenderingContext2D) => {
  if (!streak.isOnFire) return;

  const intensity = 0.3 + Math.sin(Date.now() * 0.01) * 0.1; // Pulsing

  // Gradient border
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `rgba(255, 68, 0, ${intensity})`);
  gradient.addColorStop(0.5, `rgba(255, 68, 0, 0)`);
  gradient.addColorStop(1, `rgba(255, 68, 0, ${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 10, canvas.height); // Left border
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height); // Right border

  // Top and bottom
  const hGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  hGradient.addColorStop(0, `rgba(255, 68, 0, ${intensity})`);
  hGradient.addColorStop(0.5, `rgba(255, 68, 0, 0)`);
  hGradient.addColorStop(1, `rgba(255, 68, 0, ${intensity})`);

  ctx.fillStyle = hGradient;
  ctx.fillRect(0, 0, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
};
```

**Tasks:**
- [ ] 6.3.1 Implement drawFireBorder function
- [ ] 6.3.2 Add pulsing animation
- [ ] 6.3.3 Intensity increases with streak length

### 6.4 Fire Mode Audio

```typescript
const playFireModeStartSound = () => {
  // Whoosh + rising tone
  playWithPitch('powerup_collect', 1.2);

  // Start ambient fire crackle
  startFireAmbience();
};

const startFireAmbience = () => {
  // Low rumble + crackle loop
  if (fireAmbienceRef.current) return;

  const audioContext = audioContextRef.current;
  const noise = createWhiteNoise(audioContext);
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;

  const gain = audioContext.createGain();
  gain.gain.value = 0.1;

  noise.connect(filter).connect(gain).connect(audioContext.destination);
  fireAmbienceRef.current = { noise, gain };
};

const stopFireAmbience = () => {
  if (fireAmbienceRef.current) {
    fireAmbienceRef.current.gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    setTimeout(() => {
      fireAmbienceRef.current.noise.stop();
      fireAmbienceRef.current = null;
    }, 300);
  }
};
```

**Tasks:**
- [ ] 6.4.1 Implement playFireModeStartSound
- [ ] 6.4.2 Implement startFireAmbience (crackling loop)
- [ ] 6.4.3 Implement stopFireAmbience
- [ ] 6.4.4 Trigger on fire mode start/end

### 6.5 Fire Mode Score Display

```typescript
const drawFireModeScore = (ctx: CanvasRenderingContext2D) => {
  if (!streak.isOnFire) return;

  // "x1.5" multiplier badge
  ctx.save();
  ctx.fillStyle = '#ff4500';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';

  const text = `x${STREAK_CONFIG.fireMultiplier}`;
  const x = canvas.width / 2;
  const y = 80;

  // Glow effect
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 10;
  ctx.fillText(text, x, y);

  // Flame emoji
  ctx.font = '20px Arial';
  ctx.fillText('🔥', x - 40, y);
  ctx.fillText('🔥', x + 40, y);

  ctx.restore();
};
```

**Tasks:**
- [ ] 6.5.1 Implement drawFireModeScore
- [ ] 6.5.2 Show multiplier badge
- [ ] 6.5.3 Add flame emojis
- [ ] 6.5.4 Pulsing glow animation

---

## Phase 7: ENHANCED HAPTICS (8 tasks)

**Tasks:**
- [ ] 7.1 Apply FLAP pattern on every tap
- [ ] 7.2 Apply PASS pattern on pipe pass
- [ ] 7.3 Apply NEAR_MISS pattern (rapid flutter)
- [ ] 7.4 Apply MILESTONE pattern on milestones
- [ ] 7.5 Apply DEATH pattern (heavy impact)
- [ ] 7.6 Apply STREAK_START pattern when fire mode activates
- [ ] 7.7 Intensity scaling with streak length
- [ ] 7.8 Disable duplicate haptics (no double-tap on jump+score)

---

## Phase 8: PIPE ANTICIPATION & WARNING (10 tasks)

### 8.1 Pipe Gap Highlighting

```typescript
const drawPipeGapHighlight = (ctx: CanvasRenderingContext2D, pipe: Pipe) => {
  const distance = pipe.x - bird.x;

  if (distance < 200 && distance > 0) {
    const intensity = 1 - (distance / 200);

    // Glow inside gap
    const gradient = ctx.createRadialGradient(
      pipe.x + PIPE_WIDTH / 2, pipe.gapY + PIPE_GAP / 2, 0,
      pipe.x + PIPE_WIDTH / 2, pipe.gapY + PIPE_GAP / 2, PIPE_GAP / 2
    );
    gradient.addColorStop(0, `rgba(100, 255, 100, ${intensity * 0.2})`);
    gradient.addColorStop(1, 'rgba(100, 255, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, pipe.gapY, PIPE_WIDTH, PIPE_GAP);
  }
};
```

**Tasks:**
- [ ] 8.1.1 Implement drawPipeGapHighlight
- [ ] 8.1.2 Intensity based on distance
- [ ] 8.1.3 Green glow for safe zone
- [ ] 8.1.4 Integrate into pipe render

### 8.2 Approaching Pipe Warning

```typescript
const drawApproachingWarning = (ctx: CanvasRenderingContext2D, pipe: Pipe) => {
  const distance = pipe.x - bird.x;

  if (distance < 150 && distance > 50) {
    // Subtle pulsing outline on pipe edges
    const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.5;

    ctx.strokeStyle = `rgba(255, 200, 0, ${pulseIntensity * 0.5})`;
    ctx.lineWidth = 2;

    // Top pipe outline
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
    // Bottom pipe outline
    ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height - (pipe.gapY + PIPE_GAP) - 20);
  }
};
```

**Tasks:**
- [ ] 8.2.1 Implement drawApproachingWarning
- [ ] 8.2.2 Pulsing outline effect
- [ ] 8.2.3 Only show when pipe is close
- [ ] 8.2.4 Disable in "hardcore" mode (future option)

---

## Phase 9: ENVIRONMENT ENHANCEMENTS (12 tasks)

### 9.1 Smooth Environment Transitions

```typescript
const ENVIRONMENT_COLORS = {
  day: {
    skyTop: '#87CEEB',
    skyBottom: '#E0F6FF',
    ground: '#8B4513',
    grass: '#228B22',
    mountain: '#6B8E23'
  },
  sunset: {
    skyTop: '#FF6B00',
    skyBottom: '#FFD700',
    ground: '#8B4513',
    grass: '#228B22',
    mountain: '#8B4513'
  },
  night: {
    skyTop: '#0D1B2A',
    skyBottom: '#1B263B',
    ground: '#1a1a2e',
    grass: '#2a2a3e',
    mountain: '#1a1a2e'
  },
  storm: {
    skyTop: '#2C3E50',
    skyBottom: '#1A252F',
    ground: '#1a1a2e',
    grass: '#2a2a3e',
    mountain: '#34495E'
  }
};

const lerpColor = (color1: string, color2: string, t: number): string => {
  // Convert hex to RGB, interpolate, convert back
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
};
```

**Tasks:**
- [ ] 9.1.1 Create ENVIRONMENT_COLORS constant
- [ ] 9.1.2 Implement lerpColor function
- [ ] 9.1.3 Add transitionProgress state
- [ ] 9.1.4 Smooth 2-second transitions between environments

### 9.2 Weather Particles (Storm Mode)

```typescript
const drawStormEffects = (ctx: CanvasRenderingContext2D) => {
  if (environment !== 'storm') return;

  // Rain drops
  stormParticlesRef.current.forEach(drop => {
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y);
    ctx.lineTo(drop.x + drop.vx * 2, drop.y + drop.vy * 2);
    ctx.stroke();

    // Update
    drop.x += drop.vx;
    drop.y += drop.vy;

    // Reset if off screen
    if (drop.y > canvas.height) {
      drop.y = -10;
      drop.x = Math.random() * canvas.width;
    }
  });

  // Lightning flash (occasional)
  if (Math.random() < 0.001) { // 0.1% chance per frame
    triggerLightningFlash();
  }
};
```

**Tasks:**
- [ ] 9.2.1 Create storm particle system
- [ ] 9.2.2 Implement rain drops
- [ ] 9.2.3 Add occasional lightning flash
- [ ] 9.2.4 Screen shake on thunder (delayed after flash)

### 9.3 Enhanced Star Twinkle

```typescript
const drawEnhancedStars = (ctx: CanvasRenderingContext2D, stars: Star[]) => {
  stars.forEach(star => {
    const twinkle = Math.sin(Date.now() * 0.003 + star.twinkleOffset) * 0.5 + 0.5;
    const size = star.baseSize * (0.8 + twinkle * 0.4);

    // Star glow
    const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${twinkle})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(star.x, star.y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Star core
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
};
```

**Tasks:**
- [ ] 9.3.1 Enhance star rendering with glow
- [ ] 9.3.2 Add shooting stars (occasional)
- [ ] 9.3.3 Constellation patterns (Easter egg)

---

## Phase 10: VIRAL SHARE SYSTEM (14 tasks)

### 10.1 Canvas Screenshot Generation

```typescript
const generateShareImage = async (): Promise<string> => {
  const shareCanvas = document.createElement('canvas');
  shareCanvas.width = 600;
  shareCanvas.height = 400;
  const ctx = shareCanvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, 600, 400);

  // Game screenshot (scaled)
  const gameCanvas = canvasRef.current;
  ctx.drawImage(gameCanvas, 50, 50, 300, 250);

  // Score overlay
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${score}`, 450, 150);

  ctx.font = '24px Arial';
  ctx.fillText('PIPES', 450, 180);

  // Branding
  ctx.fillStyle = '#ff6b00';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('FLAPPY ORANGE', 300, 360);

  ctx.fillStyle = '#888888';
  ctx.font = '16px Arial';
  ctx.fillText('wojak.ink', 300, 385);

  return shareCanvas.toDataURL('image/png');
};
```

**Tasks:**
- [ ] 10.1.1 Implement generateShareImage function
- [ ] 10.1.2 Include game screenshot
- [ ] 10.1.3 Overlay score prominently
- [ ] 10.1.4 Add branding

### 10.2 Challenge Link System

```typescript
const generateChallengeLink = (): string => {
  const baseUrl = 'https://wojak.ink/games/flappy-orange';
  const params = new URLSearchParams({
    challenge: 'true',
    target: score.toString(),
    from: username || 'anonymous'
  });

  return `${baseUrl}?${params.toString()}`;
};

// On game load, check for challenge
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('challenge') === 'true') {
    const target = parseInt(params.get('target') || '0');
    const from = params.get('from') || 'Someone';

    setChallengeMode({
      active: true,
      targetScore: target,
      challenger: from
    });

    showChallengeToast(`${from} challenged you to beat ${target} pipes!`);
  }
}, []);
```

**Tasks:**
- [ ] 10.2.1 Implement generateChallengeLink
- [ ] 10.2.2 Parse challenge parameters on load
- [ ] 10.2.3 Show challenge toast
- [ ] 10.2.4 Display target score during gameplay
- [ ] 10.2.5 Celebrate when challenge beaten

### 10.3 One-Tap Share

```typescript
const shareScore = async () => {
  const shareImage = await generateShareImage();
  const challengeLink = generateChallengeLink();

  const shareData = {
    title: 'Flappy Orange Challenge',
    text: `I scored ${score} pipes in Flappy Orange! Can you beat me? 🍊`,
    url: challengeLink
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled or error
      fallbackShare(challengeLink);
    }
  } else {
    fallbackShare(challengeLink);
  }
};

const fallbackShare = (link: string) => {
  // Copy to clipboard
  navigator.clipboard.writeText(link);
  showToast('Link copied to clipboard!');
};
```

**Tasks:**
- [ ] 10.3.1 Implement shareScore function
- [ ] 10.3.2 Use Web Share API where available
- [ ] 10.3.3 Fallback to clipboard copy
- [ ] 10.3.4 Add share button to game over screen

---

## Phase 11: SOUND SYSTEM OVERHAUL (12 tasks)

### 11.1 Sound Variation System

```typescript
const SOUND_VARIATIONS = {
  flap: {
    count: 4,
    baseFreq: 220,
    freqRange: 40,
    volumeRange: 0.1
  },
  pass: {
    count: 8, // Full scale
    frequencies: PASS_SCALE_FREQUENCIES
  },
  nearMiss: {
    count: 3,
    baseFreq: 400,
    freqRange: 100
  }
};

let lastFlapVariation = -1;

const playVariedSound = (type: string) => {
  const config = SOUND_VARIATIONS[type];

  // Avoid repeating same variation twice
  let variation = Math.floor(Math.random() * config.count);
  if (variation === lastFlapVariation) {
    variation = (variation + 1) % config.count;
  }
  lastFlapVariation = variation;

  // Play with variation parameters
  playSoundWithVariation(type, variation);
};
```

**Tasks:**
- [ ] 11.1.1 Create SOUND_VARIATIONS config
- [ ] 11.1.2 Implement variation tracking
- [ ] 11.1.3 Apply to flap sounds
- [ ] 11.1.4 Apply to pass sounds

### 11.2 Environment Ambient Audio

```typescript
const AMBIENT_AUDIO = {
  day: { type: 'birds', volume: 0.1 },
  sunset: { type: 'wind', volume: 0.15 },
  night: { type: 'crickets', volume: 0.1 },
  storm: { type: 'rain_thunder', volume: 0.2 }
};

const updateAmbientAudio = (newEnvironment: string) => {
  if (currentAmbient !== newEnvironment) {
    fadeOutAmbient(currentAmbient);
    fadeInAmbient(newEnvironment);
    currentAmbient = newEnvironment;
  }
};
```

**Tasks:**
- [ ] 11.2.1 Create ambient audio configs
- [ ] 11.2.2 Implement ambient crossfade
- [ ] 11.2.3 Generate or load ambient sounds
- [ ] 11.2.4 Trigger on environment change

### 11.3 Milestone Sounds

```typescript
const MILESTONE_SOUNDS = {
  5: { sound: 'milestone_small', pitch: 1.0 },
  10: { sound: 'milestone_medium', pitch: 1.0 },
  25: { sound: 'milestone_big', pitch: 1.0 },
  50: { sound: 'milestone_epic', pitch: 1.0 },
  75: { sound: 'milestone_legendary', pitch: 1.1 },
  100: { sound: 'milestone_godlike', pitch: 1.2 }
};
```

**Tasks:**
- [ ] 11.3.1 Create distinct milestone sounds
- [ ] 11.3.2 Environment change sounds
- [ ] 11.3.3 Fire mode start/end sounds
- [ ] 11.3.4 Death impact sound (separate from game over)

---

## Phase 12: POLISH & OPTIMIZATION (10 tasks)

**Tasks:**
- [ ] 12.1 Object pooling for particles (performance)
- [ ] 12.2 RequestAnimationFrame optimization
- [ ] 12.3 Canvas layer separation (static vs dynamic)
- [ ] 12.4 Reduced motion support (prefers-reduced-motion)
- [ ] 12.5 Sound toggle persistence
- [ ] 12.6 Particle count limits (max 100)
- [ ] 12.7 Memory cleanup on unmount
- [ ] 12.8 Mobile touch offset adjustment
- [ ] 12.9 High DPI canvas support
- [ ] 12.10 Final integration testing

---

## Phase 13: PLAYBOOK BONUS TECHNIQUES (18 tasks)

**From Universal Game Juice Playbook - additional techniques perfect for Flappy Orange.**

### 13.1 Touch Point Ripple (from Camera Effects)

Every tap should create a visual ripple at the touch location:

```typescript
interface TouchRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

const createTouchRipple = (touchX: number, touchY: number) => {
  const ripple: TouchRipple = {
    id: `ripple-${Date.now()}`,
    x: touchX,
    y: touchY,
    radius: 10,
    alpha: 0.6,
    color: '#ff6b00' // Orange to match bird
  };

  touchRipplesRef.current.push(ripple);
};

// Update in game loop
touchRipplesRef.current.forEach((ripple, i) => {
  ripple.radius += 5;
  ripple.alpha -= 0.03;

  if (ripple.alpha <= 0) {
    touchRipplesRef.current.splice(i, 1);
  }
});

// Draw ripples
const drawTouchRipples = (ctx: CanvasRenderingContext2D) => {
  touchRipplesRef.current.forEach(ripple => {
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 107, 0, ${ripple.alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  });
};
```

**Tasks:**
- [ ] 13.1.1 Add touchRipples ref array
- [ ] 13.1.2 Implement createTouchRipple function
- [ ] 13.1.3 Update ripples in game loop
- [ ] 13.1.4 Draw ripples on canvas
- [ ] 13.1.5 Trigger on every tap/click

### 13.2 Combo Timeout Bar (from Combo Systems)

Visual meter showing time until streak resets:

```typescript
const COMBO_TIMEOUT = 3000; // 3 seconds between pipes to maintain combo

const drawComboMeter = (ctx: CanvasRenderingContext2D) => {
  if (streak.current < 2) return;

  const timeSinceLastPass = Date.now() - lastPassTimeRef.current;
  const fillPercent = Math.max(0, 1 - (timeSinceLastPass / COMBO_TIMEOUT));

  const meterWidth = 100;
  const meterHeight = 6;
  const x = canvas.width / 2 - meterWidth / 2;
  const y = 100;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, meterWidth, meterHeight);

  // Fill (time remaining)
  const meterColor = streak.isOnFire ? '#ff4500' : streak.current >= 3 ? '#ffd700' : '#ff8c00';
  ctx.fillStyle = meterColor;
  ctx.fillRect(x, y, meterWidth * fillPercent, meterHeight);

  // Streak count above
  ctx.fillStyle = meterColor;
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`x${streak.current}`, canvas.width / 2, y - 5);
};
```

**Tasks:**
- [ ] 13.2.1 Add lastPassTime tracking
- [ ] 13.2.2 Implement drawComboMeter function
- [ ] 13.2.3 Show meter when streak >= 2
- [ ] 13.2.4 Color changes by streak level

### 13.3 Anticipation Sound Loop (from Anticipation & Tension)

Tension-building ambient sound when approaching milestones:

```typescript
const MILESTONE_ANTICIPATION = {
  10: { startAt: 8, sound: 'anticipation_light' },
  25: { startAt: 22, sound: 'anticipation_medium' },
  50: { startAt: 45, sound: 'anticipation_heavy' },
  75: { startAt: 70, sound: 'anticipation_epic' },
  100: { startAt: 95, sound: 'anticipation_legendary' }
};

let anticipationLoop: AudioBufferSourceNode | null = null;

const checkAnticipation = (score: number) => {
  for (const [milestone, config] of Object.entries(MILESTONE_ANTICIPATION)) {
    const milestoneNum = parseInt(milestone);

    if (score >= config.startAt && score < milestoneNum && !anticipationLoop) {
      anticipationLoop = startAmbientLoop(config.sound, 0.15);
    } else if (score >= milestoneNum && anticipationLoop) {
      stopAmbientLoop(anticipationLoop);
      anticipationLoop = null;
    }
  }
};
```

**Tasks:**
- [ ] 13.3.1 Create MILESTONE_ANTICIPATION config
- [ ] 13.3.2 Implement anticipation loop start/stop
- [ ] 13.3.3 Call checkAnticipation on score change
- [ ] 13.3.4 Fade out on milestone reached

### 13.4 Score Counter Animation (from Scoring & Progression)

Animated score count-up instead of instant set:

```typescript
const animateScoreChange = (from: number, to: number) => {
  const duration = 300; // ms
  const startTime = performance.now();
  const diff = to - from;

  const update = (time: number) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

    displayScoreRef.current = Math.floor(from + diff * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

// Call when score changes
if (newScore > currentScore) {
  animateScoreChange(currentScore, newScore);
}
```

**Tasks:**
- [ ] 13.4.1 Add displayScore ref (separate from actual score)
- [ ] 13.4.2 Implement animateScoreChange function
- [ ] 13.4.3 Use displayScore for rendering
- [ ] 13.4.4 Trigger on score increase

### 13.5 Time Dilation on Perfect Moments (from Time Dilation)

Brief slow-motion on major milestones (not every pass):

```typescript
const DILATION_TRIGGERS = {
  25: { duration: 300, factor: 0.3 },  // Night mode
  50: { duration: 400, factor: 0.25 }, // Storm mode
  75: { duration: 500, factor: 0.2 },  // Legendary
  100: { duration: 600, factor: 0.15 } // God mode
};

const checkTimeDilation = (score: number) => {
  const config = DILATION_TRIGGERS[score];
  if (config) {
    triggerTimeDilation(config.duration, config.factor);
  }
};

const triggerTimeDilation = (duration: number, factor: number) => {
  timeDilationRef.current = {
    active: true,
    startTime: performance.now(),
    duration,
    factor
  };

  // Golden vignette during dilation
  setDilationVignetteAlpha(0.3);
};
```

**Tasks:**
- [ ] 13.5.1 Create DILATION_TRIGGERS config
- [ ] 13.5.2 Add timeDilation ref
- [ ] 13.5.3 Implement triggerTimeDilation
- [ ] 13.5.4 Apply timeScale in physics loop
- [ ] 13.5.5 Add golden vignette overlay

---

## Updated Task Count

| Category | Phases | Tasks |
|----------|--------|-------|
| Juice Effects | Phase 1-12 | 142 |
| Playbook Bonus | Phase 13 | 18 |
| **Juice Subtotal** | **Phases 1-13** | **160** |
| Design Enhancements | Phases D1-D5 | 56 |
| **GRAND TOTAL** | **All Phases** | **216** |

> 📄 **Design Details:** See [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md) for all 56 design tasks including:
> - **D1:** Character Personality (eye tracking, expressions, breathing, trail)
> - **D2:** Environment Depth (7-layer parallax, volumetric clouds, light rays)
> - **D3:** Modern Pipe Design (gradients, lighting, gap highlights)
> - **D4:** Premium UI Design (modern score, popups, game over screen)
> - **D5:** Atmospheric Effects (vignette, rain, lightning)

---

## Implementation Priority Order

**Start Here (Maximum Impact):**
1. **Phase 2: DRAMATIC Death** - The freeze + tumble combo is instant premium feel
2. **Phase 1: Premium Flap** - Core interaction must feel amazing
3. **Phase 4: Pass Juice** - Reward every success

**Next (Engagement Boosters):**
4. **Phase 3: Near-Miss System** - Creates tension and rewards skill
5. **Phase 6: Streak Fire Mode** - Adds "one more try" hook

**Then (Premium Polish):**
6. **Phase 5: Parallax** - Depth and premium feel
7. **Phase 8: Pipe Anticipation** - Reduces frustration
8. **Phase 9: Environment Enhancements** - Beautiful atmosphere

**Finally (Viral Growth):**
9. **Phase 10: Share System** - Enables viral spread
10. **Phase 11: Sound Overhaul** - Complete audio experience
11. **Phase 7: Haptics** - Mobile polish
12. **Phase 12: Optimization** - Performance tuning

---

## Key Metrics to Track

| Metric | Before | Target |
|--------|--------|--------|
| Average Session Length | ? | +50% |
| Retry Rate | ? | 85%+ |
| Share Rate | ? | 15%+ |
| 10+ Pipe Rate | ? | 60%+ |
| 25+ Pipe Rate | ? | 30%+ |

---

**Total Juice Tasks: 160** (142 original + 18 playbook bonus)
**Total Design Tasks: 56** (see [FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md](./FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md))
**GRAND TOTAL: 216 tasks**
**Estimated Implementation Time: 16-22 hours** (10-14 juice + 6-8 design)
**Priority: Phases 1-4 first for maximum impact, then D1+D3 for premium look, then remaining phases**

---

## FUTURE FEATURES: VIRAL & RETENTION (Phase 14+)

**Based on 2024-2025 viral flappy game research. These are BEYOND juice - they're engagement systems.**

### 14.1 Ghost Racing vs Friends (HIGH VIRAL POTENTIAL)

Record each player's best run as a "ghost" and race against friends asynchronously:

```typescript
interface GhostRun {
  odorId: string;
  username: string;
  score: number;
  frames: GhostFrame[]; // Bird Y position per frame
  timestamp: number;
}

interface GhostFrame {
  y: number;
  rotation: number;
  frameIndex: number;
}

// Record ghost during play
const recordGhostFrame = () => {
  if (isRecordingGhost) {
    ghostFramesRef.current.push({
      y: bird.y,
      rotation: bird.rotation,
      frameIndex: frameCount
    });
  }
};

// Play ghost during next game
const drawGhost = (ctx: CanvasRenderingContext2D, ghostRun: GhostRun) => {
  const frame = ghostRun.frames[frameCount % ghostRun.frames.length];
  if (!frame) return;

  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#888888';
  // Draw ghost bird silhouette at frame.y
  drawBirdSilhouette(ctx, BIRD_X, frame.y, frame.rotation);
  ctx.globalAlpha = 1;

  // Show "Racing [username]" label
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Arial';
  ctx.fillText(`vs ${ghostRun.username}`, BIRD_X, frame.y - 30);
};
```

**Why it works:** Natural revenge mechanism drives sessions. Players return to beat friends.

### 14.2 Daily Challenge System (35% CHURN REDUCTION)

One random challenge per day that resets at midnight:

```typescript
interface DailyChallenge {
  id: string;
  type: 'score' | 'games' | 'streak' | 'near_miss' | 'fire_mode';
  target: number;
  reward: number; // coins
  description: string;
}

const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: 'score_50', type: 'score', target: 50, reward: 10, description: 'Score 50+ pipes today' },
  { id: 'play_3', type: 'games', target: 3, reward: 5, description: 'Play 3 games' },
  { id: 'beat_pb', type: 'streak', target: 1, reward: 15, description: 'Beat your personal best' },
  { id: 'near_miss_5', type: 'near_miss', target: 5, reward: 8, description: 'Get 5 near-misses' },
  { id: 'fire_mode', type: 'fire_mode', target: 1, reward: 12, description: 'Activate Fire Mode' },
];

const getTodaysChallenge = (): DailyChallenge => {
  const today = new Date().toDateString();
  const seed = hashString(today);
  return DAILY_CHALLENGES[seed % DAILY_CHALLENGES.length];
};
```

### 14.3 Streak System (2.3x DAILY ENGAGEMENT)

```typescript
interface PlayerStreak {
  currentStreak: number;
  lastPlayDate: string;
  longestStreak: number;
  streakFreezeAvailable: boolean;
}

const STREAK_REWARDS = {
  7: { coins: 50, badge: '🔥 Week Warrior' },
  14: { coins: 100, badge: '⚡ Fortnight Flyer' },
  30: { coins: 250, badge: '🏆 Monthly Master' },
  100: { coins: 1000, badge: '👑 Legendary' }
};

const checkStreak = (streak: PlayerStreak): PlayerStreak => {
  const today = new Date().toDateString();
  const lastPlay = new Date(streak.lastPlayDate).toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastPlay === today) {
    return streak; // Already played today
  } else if (lastPlay === yesterday) {
    // Continued streak!
    return {
      ...streak,
      currentStreak: streak.currentStreak + 1,
      lastPlayDate: today,
      longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1)
    };
  } else if (streak.streakFreezeAvailable) {
    // Use streak freeze
    return {
      ...streak,
      lastPlayDate: today,
      streakFreezeAvailable: false
    };
  } else {
    // Streak broken
    return {
      currentStreak: 1,
      lastPlayDate: today,
      longestStreak: streak.longestStreak,
      streakFreezeAvailable: false
    };
  }
};
```

### 14.4 Wojak Skin Unlock System (NFT Integration!)

Perfect for Wojak.ink - unlock Wojak skins as the bird:

```typescript
interface WojakSkin {
  id: string;
  name: string;
  nftId?: number; // Links to actual NFT
  unlockCondition: {
    type: 'score' | 'games' | 'streak' | 'achievement';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const WOJAK_SKINS: WojakSkin[] = [
  { id: 'default', name: 'Orange Wojak', unlockCondition: { type: 'score', value: 0 }, rarity: 'common' },
  { id: 'pink', name: 'Pink Wojak', unlockCondition: { type: 'score', value: 25 }, rarity: 'common' },
  { id: 'doomer', name: 'Doomer Wojak', unlockCondition: { type: 'score', value: 50 }, rarity: 'rare' },
  { id: 'bloomer', name: 'Bloomer Wojak', unlockCondition: { type: 'score', value: 100 }, rarity: 'rare' },
  { id: 'chad', name: 'Chad Wojak', unlockCondition: { type: 'score', value: 200 }, rarity: 'epic' },
  { id: 'golden', name: 'Golden Wojak', unlockCondition: { type: 'streak', value: 30 }, rarity: 'legendary' },
  // NFT-linked skins (if user owns the NFT)
  { id: 'nft_rare', name: 'Rare NFT Wojak', nftId: 1234, unlockCondition: { type: 'score', value: 0 }, rarity: 'legendary' },
];

// Check if user owns NFT to unlock special skins
const checkNFTSkins = async (walletAddress: string): Promise<string[]> => {
  const ownedNFTs = await fetchUserNFTs(walletAddress);
  return WOJAK_SKINS
    .filter(skin => skin.nftId && ownedNFTs.includes(skin.nftId))
    .map(skin => skin.id);
};
```

### 14.5 Auto-Highlight Recording (TIKTOK VIRAL)

Auto-capture 6-second clip of best moments:

```typescript
interface GameHighlight {
  frames: ImageData[];
  score: number;
  timestamp: number;
  type: 'personal_best' | 'milestone' | 'near_miss_streak';
}

const HIGHLIGHT_BUFFER_SIZE = 360; // 6 seconds at 60fps
const frameBufferRef = useRef<ImageData[]>([]);

// Continuously record last 6 seconds
const recordFrame = (ctx: CanvasRenderingContext2D) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  frameBufferRef.current.push(imageData);

  if (frameBufferRef.current.length > HIGHLIGHT_BUFFER_SIZE) {
    frameBufferRef.current.shift();
  }
};

// Save highlight on trigger
const saveHighlight = (type: GameHighlight['type']) => {
  const highlight: GameHighlight = {
    frames: [...frameBufferRef.current],
    score: currentScore,
    timestamp: Date.now(),
    type
  };

  // Convert to video/gif for sharing
  exportHighlightAsGif(highlight);
};

// Trigger on:
// - New personal best
// - Milestone (25, 50, 75, 100)
// - 3+ consecutive near-misses
```

### 14.6 Quick Restart Optimization (<0.5 seconds)

```typescript
// Pre-load next game state while playing
const preloadNextGame = () => {
  nextGameStateRef.current = {
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 },
    pipes: [],
    score: 0,
    frameCount: 0
  };
};

// On death - instant swap
const handleDeath = () => {
  // 1. Trigger death effects (runs in parallel)
  triggerDeathSequence();

  // 2. Swap to pre-loaded state (instant)
  setTimeout(() => {
    gameStateRef.current = nextGameStateRef.current;
    preloadNextGame(); // Prepare next one
  }, DEATH_SEQUENCE_DURATION);
};

// Target: < 500ms from death to playable
// - 150ms freeze frame
// - 300ms death animation
// - 50ms state swap (pre-loaded)
```

### 14.7 Thumb Zone Optimization

```typescript
const THUMB_ZONES = {
  natural: { top: 0.6, bottom: 1.0 },    // Bottom 40% - 96% accuracy
  comfortable: { top: 0.3, bottom: 0.6 }, // Middle - 84% accuracy
  stretch: { top: 0, bottom: 0.3 }        // Top 30% - 61% accuracy
};

// Tap anywhere in bottom 60% to flap (not just center)
const handleTouch = (e: TouchEvent) => {
  const touchY = e.touches[0].clientY / window.innerHeight;

  if (touchY >= THUMB_ZONES.comfortable.top) {
    // Natural/comfortable zone - instant response
    jump();
  }
  // Ignore touches in stretch zone during gameplay (accidental)
};

// UI Placement:
// - Score: Top 10% (passive, no interaction needed)
// - Restart button: Bottom center (natural zone)
// - Pause: Top right (infrequent, ok in stretch zone)
// - Share: Bottom right (natural zone)
```

---

## Engagement Metrics Targets

| Metric | Current | With Juice | With Future Features |
|--------|---------|------------|---------------------|
| Retry Rate | ~60% | 85%+ | 95%+ |
| Daily Return Rate | ~15% | ~25% | 40%+ |
| Share Rate | ~2% | 15%+ | 30%+ |
| 7-Day Retention | ~10% | ~20% | 35%+ |
| Avg Session Length | ~3 min | ~5 min | ~8 min |

---

## Implementation Roadmap

### Now (Juice - 160 tasks)
Phases 1-13: Core juice effects for premium feel

### Next (Viral - Phase 14)
- Ghost Racing vs Friends
- Auto-Highlight Recording
- Quick Restart (<0.5s)

### Later (Retention - Phase 15)
- Daily Challenges
- Streak System
- Wojak Skin Unlocks
- Thumb Zone Optimization

### Future (Growth)
- Battle Royale Mode (100 players)
- Seasonal Events
- NFT-Linked Skins
