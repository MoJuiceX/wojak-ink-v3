# Game Juice Playbook

> The definitive guide to game feel for Wojak.ink. Comprehensive, practical, performance-conscious.

**Version**: 2.1 | **Updated**: January 2026 | **Applies to**: All 15 Wojak.ink games

---

## Table of Contents

1. [Quick Start](#part-1-quick-start)
2. [Foundations](#part-2-foundations)
   - Accessibility Requirements
   - User Juice Preferences
3. [Audio](#part-3-audio)
   - Sound Design Principles
   - Audio Mix Management
   - Signature Sound Branding
   - Mobile Audio Compatibility (iOS/Safari)
4. [Haptics](#part-4-haptics)
5. [Visuals](#part-5-visuals)
   - Animation Principles
   - Particle Systems
   - Screen Effects
   - Camera Systems
   - **Shader Effects & Post-Processing** *(expanded)*
6. [Game Feel Systems](#part-6-game-feel-systems)
7. [Input & Interaction](#part-7-input--interaction)
8. [UI/UX Juice](#part-8-uiux-juice)
9. [Advanced Topics](#part-9-advanced-topics)
10. [Reference](#part-10-reference)
    - Implementation Checklist
    - Quick Reference Card
    - Troubleshooting Guide
    - Calibration Methodology
    - Error-Resilient Patterns

---

# PART 1: QUICK START

## 5-Minute Juice Checklist

Add these 5 things to any game for immediate improvement:

```typescript
// 1. SQUASH & STRETCH - Objects compress on impact
const applySquash = (obj, isHorizontal) => {
  obj.scaleX = isHorizontal ? 0.7 : 1.3;
  obj.scaleY = isHorizontal ? 1.3 : 0.7;
};

// 2. IMPACT FEEDBACK - Every collision has sound + visual
const onCollision = (x, y) => {
  playSound('pop', 0.4);
  spawnParticles(x, y, 8);
  triggerHaptic(15);
};

// 3. SCREEN SHAKE - Big moments shake the screen
const shake = (intensity = 5, duration = 150) => {
  shakeRef.current = { intensity, duration, start: Date.now() };
};

// 4. SCORE ANIMATION - Count up, don't just set
const animateScore = (from, to) => {
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / 300, 1);
    setDisplayScore(Math.floor(from + (to - from) * easeOutCubic(t)));
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
};

// 5. COMBO ESCALATION - Streaks feel increasingly rewarding
const getComboFeedback = (streak) => ({
  pitch: 1 + streak * 0.05,
  particles: 8 + streak * 2,
  shake: streak >= 5 ? 3 : 0,
});
```

## Priority Matrix

| Technique | Impact | Effort | Priority |
|-----------|--------|--------|----------|
| Squash & stretch | 🟢 High | 🟢 Low | **P0** |
| Sound on every action | 🟢 High | 🟢 Low | **P0** |
| Particle bursts | 🟢 High | 🟢 Low | **P0** |
| Screen shake | 🟢 High | 🟢 Low | **P0** |
| Haptic feedback | 🟡 Medium | 🟢 Low | **P1** |
| Combo systems | 🟢 High | 🟡 Medium | **P1** |
| Freeze frames | 🟡 Medium | 🟢 Low | **P1** |
| Trail effects | 🟡 Medium | 🟡 Medium | **P2** |
| Camera systems | 🟡 Medium | 🟡 Medium | **P2** |
| Procedural animation | 🟡 Medium | 🔴 High | **P3** |
| Shader effects | 🟡 Medium | 🔴 High | **P3** |

## Starter Kit Imports

```typescript
// All juice utilities in one import
import {
  // Particles
  spawnBurstParticles, createParticleSystem, PARTICLE_PRESETS,
  // Screen effects
  createScreenShake, triggerScreenFlash, drawVignette,
  // Animation
  easeOutCubic, easeInOutQuad, lerp, createSpring,
  // Audio
  playTone, createAudioManager, SOUND_PRESETS,
  // Haptics
  triggerHaptic, HAPTIC_PATTERNS,
  // Camera
  createCamera, shakeCamera,
} from '@/lib/juice';

import { clamp, randomInRange, distance } from '@/lib/utils';
import { setupHiDPICanvas, roundRect } from '@/lib/canvas';
```

---

# PART 2: FOUNDATIONS

## Core Philosophy

### What is Game Juice?

> "A juicy game feels alive and responds to everything you do—tons of cascading action and response for minimal user input."

Game juice is the non-essential feedback that makes games feel satisfying. It doesn't change rules—it changes *feel*.

### The Golden Rule

**Every player action needs immediate, multi-sensory feedback:**
- **See** it (visual)
- **Hear** it (audio)
- **Feel** it (haptic)

Missing any channel feels incomplete.

### Six Principles

1. **Responsiveness > Realism** — Exaggerated feedback feels better than realistic
2. **Consistency** — If one action has juice, all similar actions need it
3. **Restraint** — Overuse causes fatigue; save big effects for big moments
4. **Layering** — Stack subtle effects for normal actions, pile on for special moments
5. **Differentiation** — Different events need distinct signatures
6. **Escalation** — Repeated successes should feel increasingly rewarding

---

## Feedback State Machine

### Problem: Conflicting Effects

Without management, multiple simultaneous events cause chaos:
- Two screen shakes override each other
- Sounds stack and clip
- Particles explode everywhere

### Solution: Priority Queue

```typescript
interface FeedbackEvent {
  type: 'shake' | 'flash' | 'sound' | 'haptic';
  priority: number;  // Higher = more important
  duration: number;
  params: any;
}

class FeedbackManager {
  private queue: FeedbackEvent[] = [];
  private active: Map<string, FeedbackEvent> = new Map();

  emit(event: FeedbackEvent) {
    const current = this.active.get(event.type);
    
    // Only override if higher priority or current is finished
    if (!current || event.priority >= current.priority) {
      this.active.set(event.type, event);
      this.execute(event);
    } else {
      // Queue for later if lower priority
      this.queue.push(event);
    }
  }

  private execute(event: FeedbackEvent) {
    switch (event.type) {
      case 'shake':
        this.screenShake(event.params);
        break;
      case 'sound':
        this.playSound(event.params);
        break;
      // ...
    }
    
    // Clear after duration
    setTimeout(() => {
      this.active.delete(event.type);
      this.processQueue(event.type);
    }, event.duration);
  }

  private processQueue(type: string) {
    const next = this.queue.find(e => e.type === type);
    if (next) {
      this.queue = this.queue.filter(e => e !== next);
      this.emit(next);
    }
  }
}
```

### Priority Guidelines

| Event | Priority | Notes |
|-------|----------|-------|
| Death/Game Over | 100 | Always plays |
| Level Complete | 90 | High importance |
| Achievement | 80 | Significant |
| Combo milestone (5+) | 70 | Notable |
| Power-up collect | 60 | Rewarding |
| Normal success | 50 | Base level |
| UI interaction | 30 | Background |
| Ambient effects | 10 | Lowest |

---

## Performance Budgeting

### The 60 FPS Contract

At 60 FPS, you have **16.67ms per frame**. Budget it wisely:

| System | Budget | Notes |
|--------|--------|-------|
| Game logic | 4ms | Physics, collision |
| Rendering | 8ms | Draw calls, canvas |
| Juice effects | 2ms | Particles, shake |
| Audio | 1ms | Sound triggers |
| Buffer | 1.67ms | Safety margin |

### Performance Tiers

Detect device capability and adjust:

```typescript
const getPerformanceTier = (): 'high' | 'medium' | 'low' => {
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return 'low';
  
  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return 'low';
  if (cores && cores < 8) return 'medium';
  
  // Check if mobile
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  if (isMobile) return 'medium';
  
  return 'high';
};

const JUICE_CONFIG = {
  high: {
    maxParticles: 200,
    particlesPerBurst: 20,
    trailLength: 15,
    shaderEffects: true,
  },
  medium: {
    maxParticles: 100,
    particlesPerBurst: 12,
    trailLength: 8,
    shaderEffects: false,
  },
  low: {
    maxParticles: 40,
    particlesPerBurst: 6,
    trailLength: 4,
    shaderEffects: false,
  },
};
```

### Particle Pooling

Never create/destroy particles at runtime:

```typescript
class ParticlePool {
  private pool: Particle[] = [];
  private active: Particle[] = [];
  
  constructor(maxSize: number) {
    // Pre-allocate all particles
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(this.createParticle());
    }
  }
  
  spawn(x: number, y: number, config: ParticleConfig): Particle | null {
    const particle = this.pool.pop();
    if (!particle) return null; // Pool exhausted
    
    // Reset and configure
    particle.x = x;
    particle.y = y;
    particle.vx = config.vx;
    particle.vy = config.vy;
    particle.alpha = 1;
    particle.active = true;
    
    this.active.push(particle);
    return particle;
  }
  
  update() {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      
      if (p.alpha <= 0) {
        p.active = false;
        this.active.splice(i, 1);
        this.pool.push(p); // Return to pool
      }
    }
  }
}
```

### Frame Skip Detection

Disable juice when frames are dropping:

```typescript
let lastFrameTime = 0;
let consecutiveSlowFrames = 0;
let juiceEnabled = true;

const gameLoop = (timestamp: number) => {
  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  
  // Detect slow frames (>20ms = <50fps)
  if (delta > 20) {
    consecutiveSlowFrames++;
    if (consecutiveSlowFrames > 10) {
      juiceEnabled = false; // Disable juice
      console.warn('Performance: Juice disabled due to frame drops');
    }
  } else {
    consecutiveSlowFrames = 0;
  }
  
  update(delta);
  if (juiceEnabled) updateJuice(delta);
  render();
  
  requestAnimationFrame(gameLoop);
};
```

---

## Accessibility Requirements

### Required Toggles

Every game MUST have:

```typescript
interface AccessibilitySettings {
  screenShake: boolean;      // Can cause motion sickness
  haptics: boolean;          // Some find it annoying
  soundEffects: boolean;     // Separate from music
  music: boolean;            // Separate from SFX
  flashEffects: boolean;     // Photosensitivity
  reducedMotion: boolean;    // System preference
}

// Check system preference on load
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const defaultSettings: AccessibilitySettings = {
  screenShake: !prefersReducedMotion,
  haptics: true,
  soundEffects: true,
  music: true,
  flashEffects: !prefersReducedMotion,
  reducedMotion: prefersReducedMotion,
};
```

### Accessibility Principles

1. **Never rely solely on color** — Use icons, patterns, or labels
2. **Provide alternatives** — Visual cues for audio, audio for visual
3. **Haptics are supplementary** — Never the only feedback channel
4. **Respect system preferences** — Check `prefers-reduced-motion`
5. **Test without each channel** — Game should be playable with any single channel disabled

### Reduced Motion CSS

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## User Juice Preferences

### Why This Matters

Not everyone wants maximum juice. Some players:
- Get motion sick from screen shake
- Find haptics distracting
- Play in quiet environments
- Have sensory sensitivities
- Simply prefer minimal effects

A juice intensity system respects preferences while maintaining game feel.

### Preference System Implementation

```typescript
interface JuicePreferences {
  // Master control (0-1 scale)
  juiceIntensity: number;
  
  // Individual toggles
  screenShake: boolean;
  haptics: boolean;
  soundEffects: boolean;
  music: boolean;
  flashEffects: boolean;
  particles: boolean;
  
  // Intensity overrides (0-1 scale)
  shakeIntensity: number;
  particleCount: number;  // Multiplier
  flashOpacity: number;
}

const DEFAULT_PREFERENCES: JuicePreferences = {
  juiceIntensity: 1.0,
  screenShake: true,
  haptics: true,
  soundEffects: true,
  music: true,
  flashEffects: true,
  particles: true,
  shakeIntensity: 1.0,
  particleCount: 1.0,
  flashOpacity: 1.0,
};

class JuicePreferencesManager {
  private prefs: JuicePreferences;
  private readonly STORAGE_KEY = 'juice_preferences';
  
  constructor() {
    this.prefs = this.load();
  }
  
  private load(): JuicePreferences {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {}
    
    // Check system preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return {
        ...DEFAULT_PREFERENCES,
        screenShake: false,
        flashEffects: false,
        juiceIntensity: 0.5,
      };
    }
    
    return { ...DEFAULT_PREFERENCES };
  }
  
  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.prefs));
  }
  
  get<K extends keyof JuicePreferences>(key: K): JuicePreferences[K] {
    return this.prefs[key];
  }
  
  set<K extends keyof JuicePreferences>(key: K, value: JuicePreferences[K]) {
    this.prefs[key] = value;
    this.save();
  }
  
  // Apply master intensity to a value
  applyIntensity(value: number): number {
    return value * this.prefs.juiceIntensity;
  }
  
  // Get effective shake amount
  getShake(baseAmount: number): number {
    if (!this.prefs.screenShake) return 0;
    return baseAmount * this.prefs.shakeIntensity * this.prefs.juiceIntensity;
  }
  
  // Get effective particle count
  getParticleCount(baseCount: number): number {
    if (!this.prefs.particles) return 0;
    return Math.round(baseCount * this.prefs.particleCount * this.prefs.juiceIntensity);
  }
  
  // Get effective flash opacity
  getFlashOpacity(baseOpacity: number): number {
    if (!this.prefs.flashEffects) return 0;
    return baseOpacity * this.prefs.flashOpacity * this.prefs.juiceIntensity;
  }
}

export const juicePrefs = new JuicePreferencesManager();
```

### Using Preferences in Code

```typescript
// Screen shake
const triggerShake = (intensity: number, duration: number) => {
  const effectiveIntensity = juicePrefs.getShake(intensity);
  if (effectiveIntensity <= 0) return;
  
  shakeRef.current = {
    intensity: effectiveIntensity,
    duration,
    startTime: performance.now(),
  };
};

// Particles
const spawnParticles = (x: number, y: number, count: number) => {
  const effectiveCount = juicePrefs.getParticleCount(count);
  if (effectiveCount <= 0) return;
  
  for (let i = 0; i < effectiveCount; i++) {
    particles.push(createParticle(x, y));
  }
};

// Flash
const triggerFlash = (color: string, opacity: number) => {
  const effectiveOpacity = juicePrefs.getFlashOpacity(opacity);
  if (effectiveOpacity <= 0) return;
  
  flashRef.current = { color, opacity: effectiveOpacity, startTime: performance.now() };
};

// Sound
const playSound = (id: string, volume: number = 1) => {
  if (!juicePrefs.get('soundEffects')) return;
  audioManager.play(id, volume * juicePrefs.get('juiceIntensity'));
};

// Haptic
const triggerHaptic = (duration: number) => {
  if (!juicePrefs.get('haptics')) return;
  navigator.vibrate?.(duration);
};
```

### Settings UI Component

```typescript
const JuiceSettingsPanel: React.FC = () => {
  const [prefs, setPrefs] = useState(juicePrefs.getAll());
  
  const updatePref = <K extends keyof JuicePreferences>(
    key: K, 
    value: JuicePreferences[K]
  ) => {
    juicePrefs.set(key, value);
    setPrefs({ ...prefs, [key]: value });
  };
  
  return (
    <div className="juice-settings">
      <h3>Game Feel Settings</h3>
      
      {/* Master intensity slider */}
      <div className="setting-row">
        <label>Effect Intensity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={prefs.juiceIntensity}
          onChange={(e) => updatePref('juiceIntensity', parseFloat(e.target.value))}
        />
        <span>{Math.round(prefs.juiceIntensity * 100)}%</span>
      </div>
      
      {/* Individual toggles */}
      <div className="setting-row">
        <label>Screen Shake</label>
        <input
          type="checkbox"
          checked={prefs.screenShake}
          onChange={(e) => updatePref('screenShake', e.target.checked)}
        />
      </div>
      
      <div className="setting-row">
        <label>Haptic Feedback</label>
        <input
          type="checkbox"
          checked={prefs.haptics}
          onChange={(e) => updatePref('haptics', e.target.checked)}
        />
      </div>
      
      <div className="setting-row">
        <label>Flash Effects</label>
        <input
          type="checkbox"
          checked={prefs.flashEffects}
          onChange={(e) => updatePref('flashEffects', e.target.checked)}
        />
      </div>
      
      <div className="setting-row">
        <label>Particle Effects</label>
        <input
          type="checkbox"
          checked={prefs.particles}
          onChange={(e) => updatePref('particles', e.target.checked)}
        />
      </div>
    </div>
  );
};
```

### Preset Profiles

```typescript
const JUICE_PRESETS = {
  full: {
    juiceIntensity: 1.0,
    screenShake: true,
    haptics: true,
    flashEffects: true,
    particles: true,
  },
  medium: {
    juiceIntensity: 0.7,
    screenShake: true,
    haptics: true,
    flashEffects: false,
    particles: true,
  },
  minimal: {
    juiceIntensity: 0.3,
    screenShake: false,
    haptics: true,
    flashEffects: false,
    particles: false,
  },
  none: {
    juiceIntensity: 0,
    screenShake: false,
    haptics: false,
    flashEffects: false,
    particles: false,
  },
};

const applyPreset = (presetName: keyof typeof JUICE_PRESETS) => {
  const preset = JUICE_PRESETS[presetName];
  Object.entries(preset).forEach(([key, value]) => {
    juicePrefs.set(key as keyof JuicePreferences, value);
  });
};
```

---

# PART 3: AUDIO

## Sound Design Principles

### The Three Rules

1. **Every interaction needs audio** — Silence feels broken
2. **Variation prevents fatigue** — 3-4 variations per sound type
3. **Timing must be perfect** — Audio-visual desync destroys immersion

### Sound Categories

| Category | Duration | Character | Examples |
|----------|----------|-----------|----------|
| Interaction | 50-150ms | Crisp, satisfying | Tap, flip, tap |
| Success | 150-300ms | Rewarding, musical | Match, score, collect |
| Failure | 100-200ms | Soft, informative | Miss, wrong, drop |
| Streak | Variable | Escalating pitch | Combo hits |
| Warning | 200-500ms | Attention-grabbing | Low time, danger |
| Celebration | 500ms+ | Big, memorable | Level complete, high score |
| Ambient | Looping | Subtle, atmospheric | Power-up active, danger mode |

### Sound Variation

```typescript
// Never play the same sound twice in a row
class SoundVariant {
  private sounds: string[];
  private lastPlayed: number = -1;
  
  constructor(baseName: string, count: number = 4) {
    this.sounds = Array.from(
      { length: count }, 
      (_, i) => `${baseName}_${i + 1}`
    );
  }
  
  play(volume: number = 1) {
    let index;
    do {
      index = Math.floor(Math.random() * this.sounds.length);
    } while (index === this.lastPlayed && this.sounds.length > 1);
    
    this.lastPlayed = index;
    
    // Add pitch variation
    const pitch = 0.95 + Math.random() * 0.1;
    playSound(this.sounds[index], volume, pitch);
  }
}

// Usage
const popSound = new SoundVariant('pop', 4);
popSound.play(0.5); // Plays pop_1, pop_2, pop_3, or pop_4 with pitch variation
```

### Procedural Sound Generation

Web Audio API for dynamic sounds:

```typescript
const playTone = (
  ctx: AudioContext,
  frequency: number,
  volume: number,
  duration: number,
  type: OscillatorType = 'sine'
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.value = frequency;
  
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
  
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration / 1000);
};

// Layered success sound
const playSuccessChime = (ctx: AudioContext) => {
  playTone(ctx, 880, 0.3, 100);  // A5
  setTimeout(() => playTone(ctx, 1318, 0.4, 150), 50);  // E6
  setTimeout(() => playTone(ctx, 1760, 0.2, 100), 80);  // A6 shimmer
};
```

### ASMR Sound Design

For satisfying, tactile sounds:

```typescript
// Juicy squish sound (for merge/combine games)
const playSquish = (ctx: AudioContext, intensity: number = 1) => {
  const baseFreq = 300 * intensity;
  
  // Pop attack
  playTone(ctx, baseFreq * 2, 0.15, 30, 'sine');
  
  // Squish body
  playTone(ctx, baseFreq * 0.5, 0.1, 80, 'triangle');
  
  // Wet tail (for bigger objects)
  if (intensity > 0.5) {
    setTimeout(() => playTone(ctx, baseFreq * 1.5, 0.05, 50), 20);
  }
};
```

---

## Audio Mix Management

### The Ducking Problem

When important sounds play, other audio should get quieter temporarily.

```typescript
class AudioMixer {
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private duckingActive: boolean = false;
  
  constructor(ctx: AudioContext) {
    this.masterGain = ctx.createGain();
    this.musicGain = ctx.createGain();
    this.sfxGain = ctx.createGain();
    
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);
  }
  
  // Duck music when important SFX plays
  duck(duration: number = 300) {
    if (this.duckingActive) return;
    this.duckingActive = true;
    
    const now = this.musicGain.context.currentTime;
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Duck to 30%
    
    setTimeout(() => {
      const releaseTime = this.musicGain.context.currentTime;
      this.musicGain.gain.linearRampToValueAtTime(1, releaseTime + 0.2);
      this.duckingActive = false;
    }, duration);
  }
}

// Usage
mixer.duck(200); // Duck music for 200ms when important sound plays
playImportantSound();
```

### Volume Guidelines

| Sound Type | Volume | Notes |
|------------|--------|-------|
| Background music | 0.3-0.4 | Should not overpower SFX |
| UI clicks | 0.2-0.3 | Subtle |
| Success sounds | 0.4-0.5 | Rewarding |
| Impact sounds | 0.4-0.6 | Satisfying |
| Warning sounds | 0.5-0.6 | Attention-grabbing |
| Death/failure | 0.5-0.6 | Impactful |
| Celebration | 0.6-0.7 | Big moment |

### Spatial Audio

For games with position-based elements:

```typescript
const playSpatialSound = (
  ctx: AudioContext,
  sound: AudioBuffer,
  x: number,  // -1 (left) to 1 (right)
  volume: number
) => {
  const source = ctx.createBufferSource();
  const panner = ctx.createStereoPanner();
  const gain = ctx.createGain();
  
  source.buffer = sound;
  panner.pan.value = clamp(x, -1, 1);
  gain.gain.value = volume;
  
  source.connect(panner).connect(gain).connect(ctx.destination);
  source.start();
};
```

---

## Signature Sound Branding

### Why It Matters

Iconic games have iconic sounds: Candy Crush's "Divine!", Wordle's success melody, Flappy Bird's point sound.

### Creating Your Signature Sound

Requirements:
- **Short** (100-300ms)
- **Distinctive** (not generic)
- **Pleasant** (players hear it hundreds of times)
- **Layered** (2-3 tones)
- **Ascending** (feels positive)

```typescript
// Two-note ascending chime (universal success pattern)
const playSignatureChime = (ctx: AudioContext) => {
  const now = ctx.currentTime;
  
  // Note 1: Foundation
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.frequency.value = 880; // A5
  gain1.gain.setValueAtTime(0.4, now);
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.15);
  
  // Note 2: Resolution (slightly delayed)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.frequency.value = 1318; // E6
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.5, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.25);
  
  // Shimmer layer (subtle sparkle)
  const osc3 = ctx.createOscillator();
  const gain3 = ctx.createGain();
  osc3.frequency.value = 2636; // E7
  gain3.gain.setValueAtTime(0.1, now + 0.08);
  gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc3.connect(gain3).connect(ctx.destination);
  osc3.start(now + 0.08);
  osc3.stop(now + 0.2);
};
```

### When to Use Signature Sound

- ✅ Main success action (match, score, collect)
- ✅ Perfect/excellent performance
- ❌ Every tap (too frequent)
- ❌ Failures (should feel distinct)
- ❌ UI interactions (reserve for gameplay)

---

## Mobile Audio Compatibility

### The iOS/Safari Problem

Web Audio on mobile browsers has critical restrictions that **will break your game** if not handled:

1. **AudioContext requires user gesture** — Cannot autoplay
2. **AudioContext may be suspended** — Must call `resume()`
3. **Safari silently fails** — No error, just silence
4. **Page visibility affects playback** — Audio stops in background

### Audio Unlock Pattern (REQUIRED)

```typescript
class MobileAudioManager {
  private ctx: AudioContext | null = null;
  private unlocked: boolean = false;
  private unlockPromise: Promise<void> | null = null;
  
  constructor() {
    this.setupUnlockListeners();
  }
  
  private setupUnlockListeners() {
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    
    const unlock = async () => {
      if (this.unlocked) return;
      
      try {
        // Create context on first user interaction
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Resume if suspended (required on iOS)
        if (this.ctx.state === 'suspended') {
          await this.ctx.resume();
        }
        
        // Play silent buffer to fully unlock (iOS requirement)
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
        
        this.unlocked = true;
        console.log('Audio unlocked successfully');
        
        // Remove listeners after unlock
        events.forEach(e => document.removeEventListener(e, unlock));
      } catch (err) {
        console.warn('Audio unlock failed:', err);
      }
    };
    
    events.forEach(e => document.addEventListener(e, unlock, { passive: true }));
  }
  
  // Always check before playing
  async ensureReady(): Promise<AudioContext | null> {
    if (!this.ctx || this.ctx.state === 'closed') {
      return null;
    }
    
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return null;
      }
    }
    
    return this.ctx;
  }
  
  async playSound(sound: AudioBuffer, volume: number = 1) {
    const ctx = await this.ensureReady();
    if (!ctx) return;
    
    try {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = sound;
      gain.gain.value = volume;
      source.connect(gain).connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.warn('Sound playback failed:', err);
    }
  }
}

// Singleton instance
export const audioManager = new MobileAudioManager();
```

### Howler.js Mobile Setup

If using Howler.js (recommended), still need explicit unlock:

```typescript
import { Howl, Howler } from 'howler';

// Force HTML5 Audio on mobile for better compatibility
Howler.usingWebAudio = true;
Howler.autoUnlock = true; // Howler's built-in unlock

// Manual unlock as backup
const unlockHowler = () => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume();
  }
  
  // Play silent sound
  const unlock = new Howl({
    src: ['data:audio/mp3;base64,//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'],
    volume: 0,
    onend: () => unlock.unload(),
  });
  unlock.play();
};

document.addEventListener('touchstart', unlockHowler, { once: true });
document.addEventListener('click', unlockHowler, { once: true });
```

### Safe Sound Wrapper

```typescript
// Use this wrapper for ALL sound calls
const safePlaySound = (soundId: string, volume: number = 1) => {
  try {
    // Check if sound system is ready
    if (!audioManager.isReady()) {
      return; // Silently fail - better than error
    }
    
    // Check user preference
    if (!localStorage.getItem('soundEnabled') !== 'false') {
      audioManager.play(soundId, volume);
    }
  } catch (err) {
    // Never let audio errors crash the game
    console.warn(`Sound ${soundId} failed:`, err);
  }
};
```

### Visibility Change Handling

```typescript
// Pause/resume audio when tab visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab hidden - pause all audio
    Howler.mute(true);
    // Or for Web Audio:
    audioManager.ctx?.suspend();
  } else {
    // Tab visible - resume
    Howler.mute(false);
    audioManager.ctx?.resume();
  }
});
```

### Testing Checklist

- [ ] Audio plays on first tap (after Play button)
- [ ] Audio works on iOS Safari
- [ ] Audio works on Chrome Android
- [ ] No errors in console on page load (before interaction)
- [ ] Audio pauses when tab is hidden
- [ ] Audio resumes when tab is visible
- [ ] Sound toggle actually mutes (not just volume 0)

---

# PART 4: HAPTICS

## Haptic Patterns

### Platform Reality

| Platform | Support | API |
|----------|---------|-----|
| iOS | Excellent | UIImpactFeedbackGenerator |
| Android | Variable | Vibration API |
| Web | Limited | navigator.vibrate() |

### The Golden Rules

1. **Crisp over buzzy** — Short pulses (10-25ms) feel premium; long buzzes feel cheap
2. **Match action weight** — Light actions = light haptics
3. **Patterns = meaning** — Different patterns communicate different information
4. **Test on real devices** — Simulators don't accurately represent haptics

### Standard Patterns

```typescript
const haptics = {
  // Single pulses
  ultraLight: () => navigator.vibrate?.(5),
  light: () => navigator.vibrate?.(12),
  medium: () => navigator.vibrate?.(20),
  heavy: () => navigator.vibrate?.(35),
  
  // Patterns
  error: () => navigator.vibrate?.([10, 50, 10]),           // tap-gap-tap
  success: () => navigator.vibrate?.(25),                   // single firm
  warning: () => navigator.vibrate?.([8, 80, 8, 80, 8]),    // triple pulse
  powerup: () => navigator.vibrate?.([10, 20, 8, 20, 6]),   // celebratory burst
  gameOver: () => navigator.vibrate?.(50),                  // long heavy
  
  // Streak escalation
  combo: (streak: number) => {
    if (streak >= 5) return navigator.vibrate?.([15, 15, 12, 15, 10, 15, 8]);
    if (streak >= 4) return navigator.vibrate?.([20, 15, 10, 15, 8]);
    if (streak >= 3) return navigator.vibrate?.([15, 15, 10, 15, 8]);
    if (streak >= 2) return navigator.vibrate?.([15, 20, 10]);
    return navigator.vibrate?.(15);
  },
};
```

### Material-Based Haptics

Different objects feel different:

| Material | Pattern | Duration | Feel |
|----------|---------|----------|------|
| Soft (paddle, cushion) | Medium single | 20ms | Bouncy |
| Normal destructible | Light single | 12ms | Crisp |
| Heavy destructible | Double pulse | 20-30-15ms | Substantial |
| Metal/indestructible | Heavy single | 30ms | Solid thud |
| Collectible | Triple burst | 10-20-8ms | Rewarding |

### Common Mistakes

- ❌ Long continuous vibrations (>100ms feels like an error)
- ❌ Buzzy, ringing patterns (feels cheap)
- ❌ Haptics without visual/audio (feels random)
- ❌ Same haptic for all events (loses meaning)

---

# PART 5: VISUALS

## Animation Principles

### Squash & Stretch

The single most important animation principle. Objects compress on impact, stretch when moving fast.

```typescript
// Canvas implementation
interface Deformable {
  scaleX: number;
  scaleY: number;
}

const applySquash = (obj: Deformable, isHorizontal: boolean) => {
  if (isHorizontal) {
    obj.scaleX = 0.7;   // Compress in direction of impact
    obj.scaleY = 1.3;   // Expand perpendicular
  } else {
    obj.scaleX = 1.3;
    obj.scaleY = 0.7;
  }
};

const updateDeformation = (obj: Deformable, recovery: number = 0.15) => {
  obj.scaleX += (1 - obj.scaleX) * recovery;
  obj.scaleY += (1 - obj.scaleY) * recovery;
};

const drawWithDeformation = (ctx: CanvasRenderingContext2D, obj: any) => {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.scale(obj.scaleX, obj.scaleY);
  // Draw object at origin
  ctx.beginPath();
  ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
```

### Velocity Stretch

Fast objects stretch in their direction of movement:

```typescript
const drawWithVelocityStretch = (ctx: CanvasRenderingContext2D, obj: any) => {
  const speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
  const stretch = 1 + Math.min(speed / 20, 0.3); // Max 30% stretch
  const angle = Math.atan2(obj.vy, obj.vx);
  
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(angle);
  ctx.scale(stretch, 1 / stretch); // Preserve volume
  ctx.rotate(-angle);
  // Draw object
  ctx.restore();
};
```

### Easing Functions

**Never use linear animation.** Always use curves:

```typescript
// Essential easing functions
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutElastic = (t: number) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
};
const easeOutBounce = (t: number) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};

// When to use each
// easeOutCubic: UI appearing, objects settling
// easeOutQuart: Snappy movements
// easeInOutQuad: Camera movements, UI transitions
// easeOutElastic: Bouncy buttons, playful UI
// easeOutBounce: Landing, dropping objects
```

### Spring Physics

For natural, organic motion:

```typescript
interface Spring {
  value: number;
  target: number;
  velocity: number;
  stiffness: number;  // Higher = snappier (100-500)
  damping: number;    // Higher = less bouncy (10-30)
}

const updateSpring = (spring: Spring, dt: number = 1/60) => {
  const force = (spring.target - spring.value) * spring.stiffness;
  const damping = spring.velocity * spring.damping;
  
  spring.velocity += (force - damping) * dt;
  spring.value += spring.velocity * dt;
  
  return spring.value;
};

// Presets
const SPRING_PRESETS = {
  bouncy: { stiffness: 200, damping: 12 },
  snappy: { stiffness: 400, damping: 25 },
  smooth: { stiffness: 150, damping: 20 },
  wobbly: { stiffness: 120, damping: 8 },
};
```

---

## Particle Systems

### Particle Structure

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}
```

### Burst Patterns

```typescript
// Radial burst (explosions, celebrations)
const spawnRadialBurst = (
  pool: ParticlePool,
  x: number, 
  y: number, 
  count: number,
  config: Partial<Particle> = {}
) => {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    
    pool.spawn(x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward bias
      size: 3 + Math.random() * 4,
      color: config.color || '#ffffff',
      gravity: 0.1,
      maxLife: 40,
      ...config,
    });
  }
};

// Directional burst (impacts, hits)
const spawnDirectionalBurst = (
  pool: ParticlePool,
  x: number,
  y: number,
  direction: number, // radians
  spread: number,    // radians (e.g., Math.PI/4 for 45° cone)
  count: number
) => {
  for (let i = 0; i < count; i++) {
    const angle = direction + (Math.random() - 0.5) * spread;
    const speed = 3 + Math.random() * 5;
    
    pool.spawn(x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      gravity: 0.05,
      maxLife: 30,
    });
  }
};

// Confetti (celebrations)
const spawnConfetti = (pool: ParticlePool, x: number, y: number, count: number) => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  
  for (let i = 0; i < count; i++) {
    pool.spawn(x, y, {
      vx: (Math.random() - 0.5) * 10,
      vy: -5 - Math.random() * 8,
      size: 6 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.15,
      rotationSpeed: (Math.random() - 0.5) * 20,
      maxLife: 80,
    });
  }
};
```

### Emitter Shapes

```typescript
type EmitterShape = 'point' | 'line' | 'circle' | 'rectangle';

const getEmitterPosition = (
  shape: EmitterShape,
  center: { x: number; y: number },
  size: { width: number; height: number }
): { x: number; y: number } => {
  switch (shape) {
    case 'point':
      return center;
      
    case 'line':
      return {
        x: center.x + (Math.random() - 0.5) * size.width,
        y: center.y,
      };
      
    case 'circle':
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * size.width / 2;
      return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      };
      
    case 'rectangle':
      return {
        x: center.x + (Math.random() - 0.5) * size.width,
        y: center.y + (Math.random() - 0.5) * size.height,
      };
  }
};
```

---

## Screen Effects

### Screen Shake

```typescript
interface ShakeState {
  intensity: number;
  duration: number;
  startTime: number;
  trauma: number; // Accumulated shake from multiple hits
}

const shakeState: ShakeState = {
  intensity: 0,
  duration: 0,
  startTime: 0,
  trauma: 0,
};

// Trigger shake
const triggerShake = (intensity: number, duration: number = 150) => {
  shakeState.intensity = Math.max(shakeState.intensity, intensity);
  shakeState.duration = duration;
  shakeState.startTime = performance.now();
};

// Add trauma (stacks from multiple hits)
const addTrauma = (amount: number) => {
  shakeState.trauma = Math.min(shakeState.trauma + amount, 1);
};

// Get current offset (call in render loop)
const getShakeOffset = (): { x: number; y: number } => {
  const elapsed = performance.now() - shakeState.startTime;
  
  // Decay trauma over time
  shakeState.trauma *= 0.95;
  
  // Calculate effective intensity
  let intensity = shakeState.trauma * 10; // Trauma-based
  
  // Add triggered shake
  if (elapsed < shakeState.duration) {
    const progress = elapsed / shakeState.duration;
    intensity += shakeState.intensity * (1 - progress);
  }
  
  if (intensity < 0.1) return { x: 0, y: 0 };
  
  // Perlin noise would be better, but random works
  return {
    x: (Math.random() - 0.5) * 2 * intensity,
    y: (Math.random() - 0.5) * 2 * intensity,
  };
};

// Apply in render
const render = (ctx: CanvasRenderingContext2D) => {
  const shake = getShakeOffset();
  ctx.save();
  ctx.translate(shake.x, shake.y);
  // ... draw everything
  ctx.restore();
};
```

### Screen Flash

```typescript
let flashState = { color: '', alpha: 0 };

const triggerFlash = (color: string, alpha: number = 0.3) => {
  flashState = { color, alpha };
};

const updateFlash = () => {
  if (flashState.alpha > 0) {
    flashState.alpha *= 0.9; // Exponential decay
    if (flashState.alpha < 0.01) flashState.alpha = 0;
  }
};

const drawFlash = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (flashState.alpha <= 0) return;
  
  ctx.save();
  ctx.globalAlpha = flashState.alpha;
  ctx.fillStyle = flashState.color;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

// Flash presets
const FLASH_PRESETS = {
  success: { color: '#00ff00', alpha: 0.2 },
  failure: { color: '#ff0000', alpha: 0.3 },
  impact: { color: '#ffffff', alpha: 0.5 },
  powerup: { color: '#ffd700', alpha: 0.25 },
};
```

### Vignette

```typescript
const drawVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string = '#000000',
  intensity: number = 0.3,
  innerRadius: number = 0.3,
  outerRadius: number = 0.8
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  const gradient = ctx.createRadialGradient(
    centerX, centerY, maxRadius * innerRadius,
    centerX, centerY, maxRadius * outerRadius
  );
  
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, color.replace(')', `, ${intensity})`).replace('rgb', 'rgba'));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

// Pulsing danger vignette
const drawDangerVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
) => {
  const pulse = 0.2 + Math.sin(time * 0.01) * 0.1;
  drawVignette(ctx, width, height, '#ff0000', pulse);
};
```

### Freeze Frame (Hit Stop)

```typescript
let freezeUntil = 0;

const triggerFreeze = (duration: number = 50) => {
  freezeUntil = performance.now() + duration;
};

// In game loop
const gameLoop = (timestamp: number) => {
  if (timestamp < freezeUntil) {
    // Still render, but don't update physics
    render();
    requestAnimationFrame(gameLoop);
    return;
  }
  
  update();
  render();
  requestAnimationFrame(gameLoop);
};

// Freeze duration guide
const FREEZE_DURATIONS = {
  lightHit: 30,
  normalHit: 50,
  heavyHit: 80,
  combo5: 60,
  combo10: 80,
  death: 150,
  levelComplete: 100,
};
```

---

## Camera Systems

### Camera Structure

```typescript
interface Camera {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  zoom: number;
  targetZoom: number;
  shakeX: number;
  shakeY: number;
  trauma: number;
}

const createCamera = (): Camera => ({
  x: 0, y: 0,
  targetX: 0, targetY: 0,
  zoom: 1, targetZoom: 1,
  shakeX: 0, shakeY: 0,
  trauma: 0,
});
```

### Camera Follow with Easing

```typescript
const updateCamera = (camera: Camera, target: { x: number; y: number }, dt: number) => {
  // Smooth follow
  const followSpeed = 0.1;
  camera.targetX = target.x;
  camera.targetY = target.y;
  
  camera.x += (camera.targetX - camera.x) * followSpeed;
  camera.y += (camera.targetY - camera.y) * followSpeed;
  
  // Smooth zoom
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.1;
  
  // Update shake
  camera.trauma = Math.max(0, camera.trauma - dt * 0.5);
  const shake = camera.trauma * camera.trauma; // Quadratic falloff
  camera.shakeX = (Math.random() - 0.5) * 2 * shake * 10;
  camera.shakeY = (Math.random() - 0.5) * 2 * shake * 10;
};
```

### Look-Ahead

Camera leads player movement for better visibility:

```typescript
const updateCameraWithLookAhead = (
  camera: Camera,
  player: { x: number; y: number; vx: number; vy: number },
  lookAheadFactor: number = 50
) => {
  // Look ahead based on velocity
  const lookAheadX = player.vx * lookAheadFactor;
  const lookAheadY = player.vy * lookAheadFactor;
  
  camera.targetX = player.x + lookAheadX;
  camera.targetY = player.y + lookAheadY;
  
  // Smooth follow
  camera.x += (camera.targetX - camera.x) * 0.08;
  camera.y += (camera.targetY - camera.y) * 0.08;
};
```

### Camera Bounds

```typescript
const clampCameraToBounds = (
  camera: Camera,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  viewWidth: number,
  viewHeight: number
) => {
  const halfWidth = viewWidth / 2 / camera.zoom;
  const halfHeight = viewHeight / 2 / camera.zoom;
  
  camera.x = clamp(camera.x, bounds.minX + halfWidth, bounds.maxX - halfWidth);
  camera.y = clamp(camera.y, bounds.minY + halfHeight, bounds.maxY - halfHeight);
};
```

### Apply Camera Transform

```typescript
const applyCameraTransform = (ctx: CanvasRenderingContext2D, camera: Camera, canvasWidth: number, canvasHeight: number) => {
  ctx.save();
  
  // Center on canvas
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  
  // Apply zoom
  ctx.scale(camera.zoom, camera.zoom);
  
  // Apply shake
  ctx.translate(camera.shakeX, camera.shakeY);
  
  // Move to camera position
  ctx.translate(-camera.x, -camera.y);
};

const resetCameraTransform = (ctx: CanvasRenderingContext2D) => {
  ctx.restore();
};
```

---

## Shader Effects & Post-Processing

Premium visual effects that elevate game feel. Includes both Canvas 2D (no WebGL) and WebGL approaches.

### Effect Impact Table

| Effect | Visual Impact | Performance Cost | Complexity | Recommended For |
|--------|--------------|------------------|------------|-----------------|
| Glow (shadowBlur) | Medium | Low | Easy | All games |
| Bloom (multi-pass) | High | Medium | Medium | Victory, power-ups |
| Chromatic aberration | Medium | Low | Easy | Impact, damage |
| Color grading | Medium | Low | Easy | Mood, theme |
| Vignette | Low-Medium | Very Low | Easy | Focus, atmosphere |
| Screen distortion | High | Medium | Medium | Explosions, impacts |
| Motion blur | Medium | High | Hard | Fast movement |
| CRT/retro effects | Medium | Low | Medium | Aesthetic choice |

---

### Canvas 2D Effects (No WebGL Required)

#### Glow Effect (shadowBlur)

```typescript
// Simple glow - works everywhere
const drawWithGlow = (
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  color: string,
  blur: number,
  passes: number = 1
) => {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  
  // Multiple passes = stronger glow
  for (let i = 0; i < passes; i++) {
    drawFn();
  }
  
  ctx.restore();
};

// Usage: Glowing collectible
const drawGlowingOrb = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  drawWithGlow(ctx, () => {
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  }, '#ffd700', 20, 2);
};
```

#### Bloom Effect (Canvas 2D - No WebGL)

True bloom using offscreen canvas compositing:

```typescript
class CanvasBloom {
  private bloomCanvas: HTMLCanvasElement;
  private bloomCtx: CanvasRenderingContext2D;
  private blurCanvas: HTMLCanvasElement;
  private blurCtx: CanvasRenderingContext2D;
  
  constructor(width: number, height: number) {
    // Create offscreen canvases
    this.bloomCanvas = document.createElement('canvas');
    this.bloomCanvas.width = width;
    this.bloomCanvas.height = height;
    this.bloomCtx = this.bloomCanvas.getContext('2d')!;
    
    // Lower resolution for blur (performance)
    this.blurCanvas = document.createElement('canvas');
    this.blurCanvas.width = width / 4;
    this.blurCanvas.height = height / 4;
    this.blurCtx = this.blurCanvas.getContext('2d')!;
  }
  
  apply(
    mainCtx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    threshold: number = 200,
    intensity: number = 0.5
  ) {
    const { width, height } = sourceCanvas;
    
    // Step 1: Extract bright pixels
    const imageData = mainCtx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness < threshold) {
        // Darken non-bright pixels
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
    
    this.bloomCtx.putImageData(imageData, 0, 0);
    
    // Step 2: Downscale and blur
    this.blurCtx.filter = 'blur(8px)';
    this.blurCtx.drawImage(
      this.bloomCanvas, 
      0, 0, width, height,
      0, 0, this.blurCanvas.width, this.blurCanvas.height
    );
    
    // Step 3: Composite bloom over original
    mainCtx.save();
    mainCtx.globalCompositeOperation = 'lighter';
    mainCtx.globalAlpha = intensity;
    mainCtx.filter = 'blur(4px)';
    mainCtx.drawImage(
      this.blurCanvas,
      0, 0, this.blurCanvas.width, this.blurCanvas.height,
      0, 0, width, height
    );
    mainCtx.restore();
  }
}

// Usage
const bloom = new CanvasBloom(800, 600);

const gameLoop = () => {
  // Draw game normally
  drawGame(ctx);
  
  // Apply bloom post-process
  bloom.apply(ctx, canvas, 180, 0.6);
  
  requestAnimationFrame(gameLoop);
};
```

#### Chromatic Aberration (RGB Split)

Creates that "impact" or "damage" look by splitting color channels:

```typescript
class ChromaticAberration {
  private tempCanvas: HTMLCanvasElement;
  private tempCtx: CanvasRenderingContext2D;
  
  constructor(width: number, height: number) {
    this.tempCanvas = document.createElement('canvas');
    this.tempCanvas.width = width;
    this.tempCanvas.height = height;
    this.tempCtx = this.tempCanvas.getContext('2d')!;
  }
  
  apply(
    ctx: CanvasRenderingContext2D,
    sourceCanvas: HTMLCanvasElement,
    offset: number = 3
  ) {
    const { width, height } = sourceCanvas;
    
    // Copy original
    this.tempCtx.drawImage(sourceCanvas, 0, 0);
    
    // Clear main canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw red channel offset left
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.tempCanvas, -offset, 0);
    
    // Extract and apply channels
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw green channel centered
    ctx.globalCompositeOperation = 'lighter';
    this.tempCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(this.tempCanvas, 0, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, width, height);
    
    // Draw blue channel offset right
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(this.tempCanvas, offset, 0);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'source-over';
  }
}

// Simpler approach: Just offset draws
const drawWithChromaticAberration = (
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  offset: number
) => {
  ctx.save();
  
  // Red channel
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.5;
  ctx.filter = 'url(#redChannel)'; // SVG filter
  ctx.translate(-offset, 0);
  drawFn();
  
  // Blue channel
  ctx.filter = 'url(#blueChannel)';
  ctx.translate(offset * 2, 0);
  drawFn();
  
  // Normal
  ctx.translate(-offset, 0);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawFn();
  
  ctx.restore();
};
```

#### Impact Chromatic Aberration (Animated)

```typescript
interface ChromaticState {
  active: boolean;
  intensity: number;
  startTime: number;
  duration: number;
}

const chromatic: ChromaticState = {
  active: false,
  intensity: 0,
  startTime: 0,
  duration: 200,
};

const triggerChromatic = (intensity: number = 5, duration: number = 200) => {
  chromatic.active = true;
  chromatic.intensity = intensity;
  chromatic.startTime = performance.now();
  chromatic.duration = duration;
};

const updateChromatic = (now: number): number => {
  if (!chromatic.active) return 0;
  
  const elapsed = now - chromatic.startTime;
  if (elapsed >= chromatic.duration) {
    chromatic.active = false;
    return 0;
  }
  
  // Ease out
  const t = elapsed / chromatic.duration;
  return chromatic.intensity * (1 - t * t);
};

// In game loop
const render = () => {
  const now = performance.now();
  const chromaticOffset = updateChromatic(now);
  
  if (chromaticOffset > 0.5) {
    drawWithChromaticAberration(ctx, () => drawGame(), chromaticOffset);
  } else {
    drawGame();
  }
};
```

#### Vignette Effect

```typescript
const drawVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.3,
  radius: number = 0.7
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  const gradient = ctx.createRadialGradient(
    centerX, centerY, maxRadius * radius,
    centerX, centerY, maxRadius
  );
  
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

// Dynamic vignette (intensify during danger)
const drawDangerVignette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dangerLevel: number // 0-1
) => {
  const baseIntensity = 0.2;
  const dangerIntensity = 0.5;
  const intensity = baseIntensity + (dangerIntensity - baseIntensity) * dangerLevel;
  
  // Red tint when in danger
  const color = dangerLevel > 0.5 
    ? `rgba(255, 0, 0, ${dangerLevel * 0.3})`
    : 'rgba(0, 0, 0, 0)';
  
  drawVignette(ctx, width, height, intensity);
  
  // Add red overlay
  if (dangerLevel > 0.5) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }
};
```

#### Color Grading (Simple)

```typescript
interface ColorGrade {
  brightness: number;  // -1 to 1
  contrast: number;    // 0 to 2
  saturation: number;  // 0 to 2
  hue: number;         // 0 to 360
}

const PRESETS: Record<string, ColorGrade> = {
  normal: { brightness: 0, contrast: 1, saturation: 1, hue: 0 },
  cinematic: { brightness: -0.05, contrast: 1.1, saturation: 0.9, hue: 0 },
  retro: { brightness: 0.05, contrast: 0.9, saturation: 0.7, hue: 30 },
  danger: { brightness: -0.1, contrast: 1.2, saturation: 1.3, hue: 350 },
  victory: { brightness: 0.1, contrast: 1.1, saturation: 1.2, hue: 45 },
  night: { brightness: -0.2, contrast: 0.9, saturation: 0.6, hue: 220 },
};

const applyColorGrade = (
  ctx: CanvasRenderingContext2D,
  grade: ColorGrade
) => {
  // Use CSS filter for simplicity and performance
  const filter = [
    `brightness(${1 + grade.brightness})`,
    `contrast(${grade.contrast})`,
    `saturate(${grade.saturation})`,
    `hue-rotate(${grade.hue}deg)`,
  ].join(' ');
  
  ctx.filter = filter;
};

// Usage
const drawWithGrade = (ctx: CanvasRenderingContext2D, preset: string) => {
  ctx.save();
  applyColorGrade(ctx, PRESETS[preset] || PRESETS.normal);
  drawGame();
  ctx.restore();
};
```

---

### WebGL Shader Effects (Advanced)

For games already using WebGL or needing maximum quality.

#### Bloom Shader (GLSL)

```glsl
// Vertex shader (shared)
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
```

```glsl
// Fragment shader - Bloom extract (pass 1)
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float u_threshold;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  
  if (brightness > u_threshold) {
    gl_FragColor = color;
  } else {
    gl_FragColor = vec4(0.0);
  }
}
```

```glsl
// Fragment shader - Gaussian blur (pass 2 & 3)
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_direction; // (1,0) for horizontal, (0,1) for vertical
uniform float u_resolution;

void main() {
  vec4 color = vec4(0.0);
  float blur = 4.0 / u_resolution;
  
  // 9-tap Gaussian
  color += texture2D(u_texture, v_texCoord + vec2(-4.0 * blur * u_direction.x, -4.0 * blur * u_direction.y)) * 0.0162;
  color += texture2D(u_texture, v_texCoord + vec2(-3.0 * blur * u_direction.x, -3.0 * blur * u_direction.y)) * 0.0540;
  color += texture2D(u_texture, v_texCoord + vec2(-2.0 * blur * u_direction.x, -2.0 * blur * u_direction.y)) * 0.1216;
  color += texture2D(u_texture, v_texCoord + vec2(-1.0 * blur * u_direction.x, -1.0 * blur * u_direction.y)) * 0.1945;
  color += texture2D(u_texture, v_texCoord) * 0.2270;
  color += texture2D(u_texture, v_texCoord + vec2(1.0 * blur * u_direction.x, 1.0 * blur * u_direction.y)) * 0.1945;
  color += texture2D(u_texture, v_texCoord + vec2(2.0 * blur * u_direction.x, 2.0 * blur * u_direction.y)) * 0.1216;
  color += texture2D(u_texture, v_texCoord + vec2(3.0 * blur * u_direction.x, 3.0 * blur * u_direction.y)) * 0.0540;
  color += texture2D(u_texture, v_texCoord + vec2(4.0 * blur * u_direction.x, 4.0 * blur * u_direction.y)) * 0.0162;
  
  gl_FragColor = color;
}
```

```glsl
// Fragment shader - Composite (pass 4)
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform float u_intensity;

void main() {
  vec4 sceneColor = texture2D(u_scene, v_texCoord);
  vec4 bloomColor = texture2D(u_bloom, v_texCoord);
  
  gl_FragColor = sceneColor + bloomColor * u_intensity;
}
```

#### WebGL Bloom Pipeline (TypeScript)

```typescript
class WebGLBloom {
  private gl: WebGLRenderingContext;
  private extractProgram: WebGLProgram;
  private blurProgram: WebGLProgram;
  private compositeProgram: WebGLProgram;
  private framebuffers: WebGLFramebuffer[];
  private textures: WebGLTexture[];
  
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    
    // Compile shaders and create programs
    this.extractProgram = this.createProgram(vertexShader, extractFragShader);
    this.blurProgram = this.createProgram(vertexShader, blurFragShader);
    this.compositeProgram = this.createProgram(vertexShader, compositeFragShader);
    
    // Create framebuffers for multi-pass
    this.framebuffers = [];
    this.textures = [];
    for (let i = 0; i < 3; i++) {
      const { fb, tex } = this.createFramebuffer();
      this.framebuffers.push(fb);
      this.textures.push(tex);
    }
  }
  
  apply(sceneTexture: WebGLTexture, intensity: number = 0.5, threshold: number = 0.8) {
    const gl = this.gl;
    
    // Pass 1: Extract bright pixels
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[0]);
    gl.useProgram(this.extractProgram);
    gl.uniform1f(gl.getUniformLocation(this.extractProgram, 'u_threshold'), threshold);
    this.renderQuad(sceneTexture);
    
    // Pass 2: Horizontal blur
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[1]);
    gl.useProgram(this.blurProgram);
    gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 1, 0);
    this.renderQuad(this.textures[0]);
    
    // Pass 3: Vertical blur
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[2]);
    gl.uniform2f(gl.getUniformLocation(this.blurProgram, 'u_direction'), 0, 1);
    this.renderQuad(this.textures[1]);
    
    // Pass 4: Composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to screen
    gl.useProgram(this.compositeProgram);
    gl.uniform1f(gl.getUniformLocation(this.compositeProgram, 'u_intensity'), intensity);
    
    // Bind both textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
    
    this.renderQuad();
  }
  
  // Helper methods omitted for brevity...
  private createProgram(vert: string, frag: string): WebGLProgram { /* ... */ }
  private createFramebuffer(): { fb: WebGLFramebuffer, tex: WebGLTexture } { /* ... */ }
  private renderQuad(texture?: WebGLTexture): void { /* ... */ }
}
```

#### CRT / Retro Effect Shader

```glsl
// CRT scanlines + curvature
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_time;

// Barrel distortion for CRT curve
vec2 curve(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(6.0, 4.0);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}

void main() {
  vec2 uv = curve(v_texCoord);
  
  // Out of bounds = black
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  
  vec4 color = texture2D(u_texture, uv);
  
  // Scanlines
  float scanline = sin(uv.y * u_resolution.y * 1.5) * 0.04;
  color.rgb -= scanline;
  
  // RGB offset (chromatic aberration)
  float r = texture2D(u_texture, uv + vec2(0.001, 0.0)).r;
  float b = texture2D(u_texture, uv - vec2(0.001, 0.0)).b;
  color.r = r;
  color.b = b;
  
  // Vignette
  float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  color.rgb *= smoothstep(0.0, 0.4, vignette * 15.0);
  
  // Slight flicker
  color.rgb *= 0.95 + 0.05 * sin(u_time * 10.0);
  
  gl_FragColor = color;
}
```

---

### Using Libraries (Recommended)

For complex shader effects, use a library rather than raw WebGL:

#### PixiJS Filters

```typescript
import * as PIXI from 'pixi.js';
import { BloomFilter, CRTFilter, GlowFilter } from 'pixi-filters';

const app = new PIXI.Application({ width: 800, height: 600 });

// Bloom
const bloomFilter = new BloomFilter({
  blur: 2,
  quality: 3,
});

// CRT
const crtFilter = new CRTFilter({
  curvature: 1,
  lineWidth: 1,
  lineContrast: 0.25,
  noise: 0.1,
});

// Apply to container
gameContainer.filters = [bloomFilter];

// Dynamic bloom on impact
const triggerBloom = (intensity: number) => {
  bloomFilter.blur = intensity;
  gsap.to(bloomFilter, { blur: 2, duration: 0.3, ease: 'power2.out' });
};
```

#### Three.js Post-Processing

```typescript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// Render
const animate = () => {
  requestAnimationFrame(animate);
  composer.render();
};
```

---

### Performance Considerations

| Effect | Draw Calls | Texture Reads | Recommendation |
|--------|------------|---------------|----------------|
| shadowBlur | 1 | 0 | Use freely |
| Canvas bloom | 3-4 | Multiple | Use sparingly |
| WebGL bloom | 4 passes | 4 | 60fps on most devices |
| Chromatic | 3 | 3 | Impact moments only |
| Full CRT | 1 | 5+ | Constant OK if targeted |

**Mobile Optimization:**
```typescript
// Detect low-end and skip expensive effects
const isLowEnd = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  if (!gl) return true;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    // Low-end indicators
    if (/Mali-4|Adreno 3|PowerVR SGX/i.test(renderer)) {
      return true;
    }
  }
  
  return navigator.hardwareConcurrency <= 2;
};

const shaderTier = isLowEnd() ? 'none' : 'full';
```

---

# PART 6: GAME FEEL SYSTEMS

## Combo & Streak Systems

### Core Mechanics

A combo system needs:
1. **Tracking** — Count consecutive successes
2. **Timeout** — Reset after brief inactivity (0.5-2s)
3. **Escalation** — Feedback intensifies with streak
4. **Visualization** — Show current combo clearly
5. **Break feedback** — Clear signal when combo lost

### Implementation

```typescript
interface ComboState {
  count: number;
  lastSuccessTime: number;
  timeoutMs: number;
  isActive: boolean;
}

const createComboSystem = (timeoutMs: number = 1500): ComboState => ({
  count: 0,
  lastSuccessTime: 0,
  timeoutMs,
  isActive: false,
});

const incrementCombo = (combo: ComboState) => {
  const now = performance.now();
  const timeSinceLast = now - combo.lastSuccessTime;
  
  if (timeSinceLast > combo.timeoutMs && combo.count > 0) {
    // Timeout - reset
    onComboBreak(combo.count);
    combo.count = 0;
  }
  
  combo.count++;
  combo.lastSuccessTime = now;
  combo.isActive = true;
  
  return combo.count;
};

const updateCombo = (combo: ComboState) => {
  if (!combo.isActive) return;
  
  const timeSinceLast = performance.now() - combo.lastSuccessTime;
  if (timeSinceLast > combo.timeoutMs) {
    onComboBreak(combo.count);
    combo.count = 0;
    combo.isActive = false;
  }
};
```

### Feedback Escalation Table

| Combo | Sound | Haptic | Visual | Screen Effect |
|-------|-------|--------|--------|---------------|
| 1 | Base | 15ms | Base animation | None |
| 2 | +5% pitch | Double pulse | + Sparkles | None |
| 3 | +10% pitch | Triple pulse | + Color flash | None |
| 4-5 | +15% pitch, sparkle | Quad pulse | + Trail change | Light shake |
| 6-9 | Celebration tone | Pattern burst | + Glow effect | Medium shake |
| 10+ | Full fanfare | Full pattern | + Confetti | Flash + heavy shake |

### Score Multiplier

```typescript
const getComboMultiplier = (combo: number): number => {
  if (combo >= 15) return 3.0;
  if (combo >= 10) return 2.5;
  if (combo >= 8) return 2.0;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.25;
  return 1.0;
};
```

### Combo UI

```typescript
const drawComboMeter = (
  ctx: CanvasRenderingContext2D,
  combo: ComboState,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  if (combo.count < 2) return;
  
  const timeRemaining = combo.timeoutMs - (performance.now() - combo.lastSuccessTime);
  const fillPercent = Math.max(0, timeRemaining / combo.timeoutMs);
  
  // Color based on combo level
  const color = combo.count >= 10 ? '#ff00ff' 
    : combo.count >= 5 ? '#ffd700' 
    : '#ff8c00';
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  roundRect(ctx, x, y, width, height, 4);
  ctx.fill();
  
  // Fill
  ctx.fillStyle = color;
  roundRect(ctx, x, y, width * fillPercent, height, 4);
  ctx.fill();
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`x${combo.count}`, x + width / 2, y - 8);
};
```

### Fever Mode

When combo reaches a threshold, enter special state:

```typescript
interface FeverState {
  active: boolean;
  startTime: number;
  duration: number;
  multiplier: number;
}

const checkFeverMode = (combo: number, fever: FeverState) => {
  if (!fever.active && combo >= 10) {
    fever.active = true;
    fever.startTime = performance.now();
    fever.duration = 5000; // 5 seconds
    fever.multiplier = 3;
    
    triggerFeverStart();
  }
};

const updateFeverMode = (fever: FeverState) => {
  if (!fever.active) return;
  
  if (performance.now() - fever.startTime > fever.duration) {
    fever.active = false;
    triggerFeverEnd();
  }
};

const triggerFeverStart = () => {
  playSound('fever_start');
  triggerFlash('#ffd700', 0.4);
  triggerShake(5, 200);
  // Start ambient fever loop
};
```

---

## Timer & Urgency Systems

### Urgency Phases

```typescript
interface UrgencyPhase {
  name: string;
  threshold: number; // Remaining time in ms
  color: string;
  pulseSpeed: number;
  soundPitch: number;
  hapticInterval: number;
}

const URGENCY_PHASES: UrgencyPhase[] = [
  { name: 'calm', threshold: Infinity, color: '#00ff00', pulseSpeed: 0, soundPitch: 1, hapticInterval: 0 },
  { name: 'warning', threshold: 10000, color: '#ffff00', pulseSpeed: 1, soundPitch: 1.05, hapticInterval: 1000 },
  { name: 'danger', threshold: 5000, color: '#ff8800', pulseSpeed: 2, soundPitch: 1.1, hapticInterval: 500 },
  { name: 'critical', threshold: 2000, color: '#ff0000', pulseSpeed: 4, soundPitch: 1.2, hapticInterval: 200 },
];

const getCurrentPhase = (remainingMs: number): UrgencyPhase => {
  return URGENCY_PHASES.find(p => remainingMs <= p.threshold) || URGENCY_PHASES[0];
};
```

### Timer Display

```typescript
const drawTimer = (
  ctx: CanvasRenderingContext2D,
  remainingMs: number,
  totalMs: number,
  x: number,
  y: number,
  time: number
) => {
  const phase = getCurrentPhase(remainingMs);
  const percent = remainingMs / totalMs;
  
  // Pulse effect
  const pulse = phase.pulseSpeed > 0 
    ? 1 + Math.sin(time * phase.pulseSpeed * 0.01) * 0.1 
    : 1;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse, pulse);
  
  // Timer text
  const seconds = Math.ceil(remainingMs / 1000);
  ctx.fillStyle = phase.color;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(seconds.toString(), 0, 0);
  
  // Glow in critical
  if (phase.name === 'critical') {
    ctx.shadowColor = phase.color;
    ctx.shadowBlur = 10 + Math.sin(time * 0.02) * 5;
  }
  
  ctx.restore();
};
```

### Anticipation States

When near completion, highlight remaining targets:

```typescript
const drawWithAnticipation = (
  ctx: CanvasRenderingContext2D,
  obj: any,
  remainingCount: number,
  time: number
) => {
  const shouldHighlight = remainingCount <= 3;
  
  if (shouldHighlight) {
    // Pulsing glow
    const pulseIntensity = 10 + Math.sin(time * 0.01) * 8;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = pulseIntensity;
    
    // Scale pulse
    const scale = 1 + Math.sin(time * 0.008) * 0.05;
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.scale(scale, scale);
    ctx.translate(-obj.x, -obj.y);
  }
  
  // Draw object
  drawObject(ctx, obj);
  
  if (shouldHighlight) {
    ctx.restore();
  }
};
```

---

## Near-Miss & Close Call

### Detection

```typescript
interface NearMissResult {
  isNearMiss: boolean;
  intensity: number; // 0-1, closer = higher
  edge: 'top' | 'bottom' | 'left' | 'right' | null;
}

const NEAR_MISS_THRESHOLD = 0.25; // Within 25% of danger zone

const checkNearMiss = (
  playerPos: number,
  dangerStart: number,
  dangerEnd: number
): NearMissResult => {
  const gapSize = dangerEnd - dangerStart;
  const threshold = gapSize * NEAR_MISS_THRESHOLD;
  
  const distToTop = playerPos - dangerStart;
  const distToBottom = dangerEnd - playerPos;
  
  // Check if within gap but near edge
  if (playerPos > dangerStart && playerPos < dangerEnd) {
    if (distToTop < threshold) {
      return { isNearMiss: true, intensity: 1 - distToTop / threshold, edge: 'top' };
    }
    if (distToBottom < threshold) {
      return { isNearMiss: true, intensity: 1 - distToBottom / threshold, edge: 'bottom' };
    }
  }
  
  return { isNearMiss: false, intensity: 0, edge: null };
};
```

### Feedback

```typescript
const onNearMiss = (result: NearMissResult) => {
  if (!result.isNearMiss) return;
  
  // Bonus points based on intensity
  const bonus = Math.ceil(result.intensity * 3); // 1-3 bonus points
  addScore(bonus);
  
  // Visual feedback
  triggerFlash('#ffff00', result.intensity * 0.2);
  
  // Sound - higher pitch for closer calls
  const pitch = 1 + result.intensity * 0.3;
  playSound('whoosh', 0.3, pitch);
  
  // Haptic
  if (result.intensity > 0.7) {
    haptics.light();
  }
  
  // Floating text
  showFloatingText(`+${bonus}`, playerX, playerY - 30, '#ffdd00');
};
```

---

## Death Sequences

### The Golden Formula

```
FREEZE FRAME (150ms) → SLOW-MO (400ms at 0.3x) → GAME OVER
```

### Implementation

```typescript
interface DeathSequence {
  phase: 'freeze' | 'slowmo' | 'done';
  startTime: number;
  timeScale: number;
}

const DEATH_CONFIG = {
  freezeDuration: 150,
  slowMoDuration: 400,
  slowMoScale: 0.3,
  shakeIntensity: 8,
  particleCount: 25,
};

const startDeathSequence = (player: any): DeathSequence => {
  const sequence: DeathSequence = {
    phase: 'freeze',
    startTime: performance.now(),
    timeScale: 0,
  };
  
  // Immediate effects
  triggerShake(DEATH_CONFIG.shakeIntensity, 200);
  triggerFlash('#ffffff', 0.6);
  spawnDeathParticles(player.x, player.y, DEATH_CONFIG.particleCount);
  playSound('death_impact');
  haptics.heavy();
  
  return sequence;
};

const updateDeathSequence = (sequence: DeathSequence): number => {
  const elapsed = performance.now() - sequence.startTime;
  
  if (sequence.phase === 'freeze') {
    if (elapsed > DEATH_CONFIG.freezeDuration) {
      sequence.phase = 'slowmo';
      sequence.startTime = performance.now();
      sequence.timeScale = DEATH_CONFIG.slowMoScale;
    }
    return 0; // No physics update during freeze
  }
  
  if (sequence.phase === 'slowmo') {
    if (elapsed > DEATH_CONFIG.slowMoDuration) {
      sequence.phase = 'done';
      sequence.timeScale = 1;
      showGameOver();
    }
    return sequence.timeScale;
  }
  
  return 1;
};

// In game loop
const gameLoop = (dt: number) => {
  if (deathSequence) {
    const timeScale = updateDeathSequence(deathSequence);
    if (timeScale === 0) {
      render(); // Still render during freeze
      return;
    }
    dt *= timeScale; // Slow-mo physics
  }
  
  update(dt);
  render();
};
```

### Death Particles

```typescript
const spawnDeathParticles = (x: number, y: number, count: number) => {
  const colors = ['#ff4444', '#ffaa00', '#ffffff'];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;
    
    particlePool.spawn(x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
      maxLife: 60,
    });
  }
};
```

---

# PART 7: INPUT & INTERACTION

## Response Timing & Prediction

### Target Response Times

| Interaction | Target | Notes |
|-------------|--------|-------|
| Visual feedback | <16ms | 1 frame |
| Sound playback | <50ms | Perceptible if slower |
| Haptic trigger | <30ms | Must feel instant |
| Animation start | <100ms | Feels immediate |
| State change | <200ms | Acceptable |

### The 100-300-1000 Rule

- **<100ms**: Feels instant, direct manipulation
- **100-300ms**: Noticeable but acceptable
- **>300ms**: Needs loading indicator
- **>1000ms**: User thinks something is broken

### Input Prediction

Show feedback before server response:

```typescript
// Optimistic UI pattern
const handleTap = async (x: number, y: number) => {
  // Immediate local feedback (optimistic)
  playSound('tap');
  triggerHaptic(12);
  spawnParticles(x, y, 5);
  setLocalState({ ...state, tapped: true });
  
  try {
    // Server validation
    const result = await api.validateAction(x, y);
    
    if (result.valid) {
      // Success - state already reflects action
      triggerSuccessFeedback();
    } else {
      // Rollback optimistic update
      setLocalState(previousState);
      triggerErrorFeedback();
    }
  } catch (error) {
    // Network error - rollback
    setLocalState(previousState);
    showRetryPrompt();
  }
};
```

### Input Buffering

Queue inputs during busy states:

```typescript
class InputBuffer {
  private queue: InputEvent[] = [];
  private isBusy: boolean = false;
  
  enqueue(event: InputEvent) {
    if (this.isBusy) {
      this.queue.push(event);
      return;
    }
    this.process(event);
  }
  
  private process(event: InputEvent) {
    this.isBusy = true;
    
    handleInput(event).then(() => {
      this.isBusy = false;
      
      // Process queued input
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        this.process(next);
      }
    });
  }
}
```

### Debouncing

Prevent accidental double-inputs:

```typescript
let lastInputTime = 0;
const DEBOUNCE_MS = 100;

const handleInput = (event: InputEvent) => {
  const now = performance.now();
  if (now - lastInputTime < DEBOUNCE_MS) return;
  lastInputTime = now;
  
  processInput(event);
};
```

---

## Touch & Mobile Patterns

### Touch Offset

Keep dragged objects visible above finger:

```typescript
const TOUCH_OFFSET_Y = -60; // 60px above touch point

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  setDragPosition({
    x: touch.clientX,
    y: touch.clientY + TOUCH_OFFSET_Y,
  });
};
```

### Long Press Detection

```typescript
interface LongPressState {
  startTime: number | null;
  startX: number;
  startY: number;
  triggered: boolean;
}

const LONG_PRESS_DURATION = 500;
const MOVE_THRESHOLD = 10;

const detectLongPress = (state: LongPressState, e: TouchEvent): boolean => {
  const touch = e.touches[0];
  
  // Check if moved too much
  const dx = touch.clientX - state.startX;
  const dy = touch.clientY - state.startY;
  if (Math.sqrt(dx*dx + dy*dy) > MOVE_THRESHOLD) {
    state.startTime = null;
    return false;
  }
  
  // Check duration
  if (state.startTime && !state.triggered) {
    if (performance.now() - state.startTime > LONG_PRESS_DURATION) {
      state.triggered = true;
      return true;
    }
  }
  
  return false;
};
```

### Swipe Detection

```typescript
interface SwipeResult {
  direction: 'up' | 'down' | 'left' | 'right' | null;
  velocity: number;
}

const MIN_SWIPE_DISTANCE = 50;
const MAX_SWIPE_TIME = 300;

const detectSwipe = (
  startX: number, startY: number,
  endX: number, endY: number,
  duration: number
): SwipeResult => {
  if (duration > MAX_SWIPE_TIME) return { direction: null, velocity: 0 };
  
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  
  if (distance < MIN_SWIPE_DISTANCE) return { direction: null, velocity: 0 };
  
  const velocity = distance / duration;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return { direction: dx > 0 ? 'right' : 'left', velocity };
  } else {
    return { direction: dy > 0 ? 'down' : 'up', velocity };
  }
};
```

### Thumb Zone Awareness

```typescript
const getThumbZone = (screenHeight: number): { top: number; bottom: number } => {
  // Bottom 40% of screen is comfortable thumb zone
  return {
    top: screenHeight * 0.6,
    bottom: screenHeight,
  };
};

// Place primary interactions in thumb zone
const isInThumbZone = (y: number, screenHeight: number): boolean => {
  const zone = getThumbZone(screenHeight);
  return y >= zone.top && y <= zone.bottom;
};
```

---

## Drag & Drop

### Trail Particles

```typescript
const lastTrailPos = { x: 0, y: 0 };
const TRAIL_EMIT_DISTANCE = 25;

const emitTrailParticle = (x: number, y: number, color: string) => {
  const dx = x - lastTrailPos.x;
  const dy = y - lastTrailPos.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  
  if (distance > TRAIL_EMIT_DISTANCE) {
    lastTrailPos.x = x;
    lastTrailPos.y = y;
    
    particlePool.spawn(x, y, {
      vx: 0,
      vy: 0,
      size: 8 + Math.random() * 4,
      color,
      alpha: 0.6,
      maxLife: 20,
    });
  }
};
```

### Magnetic Snapping

```typescript
const SNAP_RADIUS = 0.25; // 25% of cell size

const calculateSnapPosition = (
  rawX: number,
  rawY: number,
  cellSize: number
): { x: number; y: number; snapped: boolean } => {
  const snapX = Math.round(rawX / cellSize) * cellSize;
  const snapY = Math.round(rawY / cellSize) * cellSize;
  
  const distX = Math.abs(rawX - snapX);
  const distY = Math.abs(rawY - snapY);
  
  if (distX < cellSize * SNAP_RADIUS && distY < cellSize * SNAP_RADIUS) {
    return { x: snapX, y: snapY, snapped: true };
  }
  
  return { x: rawX, y: rawY, snapped: false };
};

// Haptic on snap
let wasSnapped = false;
const onDragMove = (x: number, y: number) => {
  const { snapped } = calculateSnapPosition(x, y, cellSize);
  
  if (snapped && !wasSnapped) {
    haptics.ultraLight();
  }
  wasSnapped = snapped;
};
```

### Dragged Object Styling

```css
.dragged {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  transform: scale(1.1);
  z-index: 1000;
  transition: transform 0.1s ease-out;
}

.drag-ghost {
  opacity: 0.5;
  border: 2px dashed rgba(255,255,255,0.5);
}
```

---

# PART 8: UI/UX JUICE

## Scoring & Progression

### Score Animation

```typescript
const animateScore = (
  from: number,
  to: number,
  duration: number = 500,
  onUpdate: (value: number) => void
) => {
  const start = performance.now();
  const diff = to - from;
  
  const update = (now: number) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    
    onUpdate(Math.floor(from + diff * eased));
    
    if (progress < 1) requestAnimationFrame(update);
  };
  
  requestAnimationFrame(update);
};
```

### Floating Score Popup

```typescript
interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

const createScorePopup = (
  x: number, 
  y: number, 
  points: number, 
  multiplier: number = 1
): ScorePopup => {
  const text = multiplier > 1 
    ? `+${points * multiplier} (x${multiplier})` 
    : `+${points}`;
  
  const color = multiplier >= 2 ? '#ffd700' 
    : multiplier > 1 ? '#ffaa00' 
    : '#ffffff';
  
  return {
    x, y,
    text,
    color,
    alpha: 1,
    vy: -2,
    scale: multiplier > 1 ? 1.2 : 1,
  };
};

const updateScorePopups = (popups: ScorePopup[]) => {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy;
    p.alpha -= 0.02;
    p.scale *= 0.99;
    
    if (p.alpha <= 0) popups.splice(i, 1);
  }
};

const drawScorePopups = (ctx: CanvasRenderingContext2D, popups: ScorePopup[]) => {
  popups.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
  });
};
```

### Milestone Celebrations

```typescript
const SCORE_MILESTONES = [100, 500, 1000, 2500, 5000, 10000];

const checkMilestone = (oldScore: number, newScore: number) => {
  for (const milestone of SCORE_MILESTONES) {
    if (oldScore < milestone && newScore >= milestone) {
      triggerMilestoneCelebration(milestone);
      return;
    }
  }
};

const triggerMilestoneCelebration = (milestone: number) => {
  // Big celebration
  playSound('milestone');
  triggerFlash('#ffd700', 0.3);
  triggerShake(4, 150);
  spawnConfetti(canvasWidth / 2, canvasHeight / 2, 30);
  
  // Show callout
  showCallout(`${milestone} POINTS!`, 2000);
};
```

---

## Loading & Waiting States

### Skeleton Screens

Show structure immediately, fill in details when ready:

```typescript
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-image shimmer" />
    <div className="skeleton-text shimmer" style={{ width: '80%' }} />
    <div className="skeleton-text shimmer" style={{ width: '60%' }} />
  </div>
);

// CSS
.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Progress Bars with Juice

```typescript
const drawProgressBar = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  progress: number, // 0-1
  time: number
) => {
  // Background
  ctx.fillStyle = '#333';
  roundRect(ctx, x, y, width, height, height / 2);
  ctx.fill();
  
  // Fill with gradient
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, '#4CAF50');
  gradient.addColorStop(1, '#8BC34A');
  ctx.fillStyle = gradient;
  roundRect(ctx, x, y, width * progress, height, height / 2);
  ctx.fill();
  
  // Shine animation
  const shineX = x + (time * 0.1 % (width + 50)) - 25;
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(shineX, y, 50, height);
  ctx.restore();
};
```

### Fake Progress for Indeterminate Waits

```typescript
// Psychology: Fast start, slow middle, fast finish
const getFakeProgress = (elapsed: number, expectedDuration: number): number => {
  const t = elapsed / expectedDuration;
  
  if (t < 0.3) {
    // Fast start (0-30% in first 30% of time)
    return t / 0.3 * 0.3;
  } else if (t < 0.9) {
    // Slow middle (30-80% in next 60% of time)
    return 0.3 + ((t - 0.3) / 0.6) * 0.5;
  } else {
    // Actual completion will jump to 100%
    return 0.8 + ((t - 0.9) / 0.1) * 0.15;
  }
};
```

---

## Tutorial & Onboarding

### First-Time User Experience (FTUE)

```typescript
const TUTORIAL_STEPS = [
  { target: 'play-button', text: 'Tap to start!', arrow: 'down' },
  { target: 'game-area', text: 'Match the pairs', arrow: 'none' },
  { target: 'timer', text: 'Beat the clock!', arrow: 'up' },
];

interface TutorialState {
  step: number;
  complete: boolean;
  hasSeenBefore: boolean;
}

const initTutorial = (): TutorialState => ({
  step: 0,
  complete: localStorage.getItem('tutorial_complete') === 'true',
  hasSeenBefore: localStorage.getItem('tutorial_complete') === 'true',
});
```

### Attention-Guiding Animation

```typescript
// Pulsing highlight around target element
const drawTutorialHighlight = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  time: number
) => {
  const pulse = 1 + Math.sin(time * 0.005) * 0.1;
  const glowIntensity = 10 + Math.sin(time * 0.008) * 5;
  
  ctx.save();
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = glowIntensity;
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  
  ctx.translate(x + width/2, y + height/2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(x + width/2), -(y + height/2));
  
  roundRect(ctx, x - 5, y - 5, width + 10, height + 10, 8);
  ctx.stroke();
  
  ctx.restore();
};

// Pointing hand animation
const drawPointingHand = (
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  time: number
) => {
  const bobY = Math.sin(time * 0.01) * 5;
  
  ctx.save();
  ctx.translate(x, y + bobY);
  ctx.font = '32px Arial';
  ctx.fillText('👆', 0, 0);
  ctx.restore();
};
```

### Tutorial Completion Celebration

```typescript
const completeTutorial = () => {
  localStorage.setItem('tutorial_complete', 'true');
  
  // Celebration
  playSound('tutorial_complete');
  triggerFlash('#00ff00', 0.2);
  spawnConfetti(canvasWidth / 2, canvasHeight / 2, 20);
  
  // Bonus reward
  showCallout('🎉 +250 Oranges!', 3000);
  addCurrency(250);
};
```

---

## Share & Viral Mechanics

### Scorecard Generation

```typescript
const generateScorecard = async (
  score: number,
  highScore: number,
  gameScreenshot: string | null
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  
  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, 600, 400);
  
  // Game screenshot
  if (gameScreenshot) {
    const img = await loadImage(gameScreenshot);
    ctx.drawImage(img, 50, 50, 200, 150);
  }
  
  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(score.toLocaleString(), 400, 120);
  
  ctx.font = '20px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('SCORE', 400, 150);
  
  // New high score badge
  if (score >= highScore) {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🏆 NEW HIGH SCORE!', 400, 200);
  }
  
  // Branding
  ctx.fillStyle = '#888888';
  ctx.font = '16px Arial';
  ctx.fillText('Play at wojak.ink', 300, 380);
  
  return canvas.toDataURL('image/png');
};
```

### Challenge Link Generation

```typescript
interface Challenge {
  targetScore: number;
  creatorName: string;
  createdAt: number;
}

const generateChallengeLink = (score: number, name: string): string => {
  const challenge: Challenge = {
    targetScore: score,
    creatorName: name,
    createdAt: Date.now(),
  };
  const encoded = btoa(JSON.stringify(challenge));
  return `${window.location.origin}/games?challenge=${encoded}`;
};

// On game load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get('challenge');
  
  if (challengeParam) {
    try {
      const challenge = JSON.parse(atob(challengeParam));
      setActiveChallenge(challenge);
    } catch (e) {
      console.error('Invalid challenge');
    }
  }
}, []);
```

### Share Prompt Timing

Best times to prompt for share:
- ✅ After new high score
- ✅ After completing a challenge
- ✅ After milestone achievement
- ❌ After every game (annoying)
- ❌ During gameplay (disruptive)

---

# PART 9: ADVANCED TOPICS

## Procedural Animation

### Spring-Based UI

Make UI elements feel alive with springs:

```typescript
// Button that responds to hover/press with spring physics
const SpringButton = ({ children, onClick }) => {
  const [spring, setSpring] = useState({ value: 1, velocity: 0, target: 1 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSpring(s => {
        const force = (s.target - s.value) * 300;
        const damping = s.velocity * 20;
        const velocity = s.velocity + (force - damping) * 0.016;
        const value = s.value + velocity * 0.016;
        return { ...s, value, velocity };
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setSpring(s => ({ ...s, target: 1.1 }))}
      onMouseLeave={() => setSpring(s => ({ ...s, target: 1 }))}
      onMouseDown={() => setSpring(s => ({ ...s, target: 0.9 }))}
      onMouseUp={() => setSpring(s => ({ ...s, target: 1.1 }))}
      style={{ transform: `scale(${spring.value})` }}
    >
      {children}
    </button>
  );
};
```

### Procedural Wobble

```typescript
// Objects wobble organically when disturbed
interface WobbleState {
  angle: number;
  velocity: number;
  damping: number;
  stiffness: number;
}

const createWobble = (): WobbleState => ({
  angle: 0,
  velocity: 0,
  damping: 0.9,
  stiffness: 0.3,
});

const disturbWobble = (wobble: WobbleState, force: number) => {
  wobble.velocity += force;
};

const updateWobble = (wobble: WobbleState) => {
  wobble.velocity += -wobble.angle * wobble.stiffness;
  wobble.velocity *= wobble.damping;
  wobble.angle += wobble.velocity;
  return wobble.angle;
};

// Usage
const drawWithWobble = (ctx, obj, wobble) => {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(wobble.angle * 0.1); // Convert to radians
  // Draw object
  ctx.restore();
};
```

### Breathing/Idle Animation

```typescript
// Subtle scale pulsing for idle objects
const getBreathingScale = (time: number, speed: number = 0.002, amount: number = 0.02): number => {
  return 1 + Math.sin(time * speed) * amount;
};

// Subtle floating motion
const getFloatingOffset = (time: number, speed: number = 0.003, amount: number = 3): number => {
  return Math.sin(time * speed) * amount;
};
```

---

## Environmental Systems

### Weather Effects

```typescript
interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

// Rain system
const createRainParticle = (canvasWidth: number): WeatherParticle => ({
  x: Math.random() * canvasWidth,
  y: -10,
  vx: -1,
  vy: 8 + Math.random() * 4,
  size: 2,
  alpha: 0.3 + Math.random() * 0.3,
});

const updateRain = (particles: WeatherParticle[], canvasWidth: number, canvasHeight: number) => {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.y > canvasHeight) {
      Object.assign(p, createRainParticle(canvasWidth));
    }
  });
};

const drawRain = (ctx: CanvasRenderingContext2D, particles: WeatherParticle[]) => {
  ctx.strokeStyle = '#6688aa';
  particles.forEach(p => {
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
};
```

### Day/Night Cycle

```typescript
interface DayCycle {
  time: number; // 0-1 (0 = midnight, 0.5 = noon)
  colors: {
    sky: string;
    ambient: number; // 0-1 brightness
  };
}

const getDayCycleColors = (time: number): DayCycle['colors'] => {
  // Simplified day cycle
  if (time < 0.25) {
    // Night to dawn
    return { sky: lerpColor('#0a0a20', '#ff7733', time * 4), ambient: 0.3 + time * 2 };
  } else if (time < 0.5) {
    // Morning to noon
    return { sky: lerpColor('#ff7733', '#87ceeb', (time - 0.25) * 4), ambient: 0.8 + (time - 0.25) * 0.8 };
  } else if (time < 0.75) {
    // Noon to evening
    return { sky: lerpColor('#87ceeb', '#ff7733', (time - 0.5) * 4), ambient: 1 - (time - 0.5) * 0.8 };
  } else {
    // Evening to night
    return { sky: lerpColor('#ff7733', '#0a0a20', (time - 0.75) * 4), ambient: 0.5 - (time - 0.75) * 0.8 };
  }
};
```

### Ambient Sound Layers

```typescript
const createAmbientSoundscape = (audioContext: AudioContext) => {
  const layers = {
    base: createAmbientLoop('forest_base.mp3', 0.3),
    birds: createAmbientLoop('birds.mp3', 0),
    wind: createAmbientLoop('wind.mp3', 0),
  };
  
  // Crossfade based on game state
  const updateAmbience = (intensity: number) => {
    // More intense = more wind, less birds
    layers.birds.volume = Math.max(0, 0.3 - intensity * 0.3);
    layers.wind.volume = Math.min(0.4, intensity * 0.4);
  };
  
  return { layers, updateAmbience };
};
```

---

## NFT Integration

### Display NFT Metadata

```typescript
const showNftInfo = (nftId: number, metadata: NftMetadata) => {
  // Brief overlay showing NFT details
  const overlay = document.createElement('div');
  overlay.className = 'nft-info-popup';
  overlay.innerHTML = `
    <div class="nft-name">${metadata.name}</div>
    <div class="nft-rarity ${metadata.rarity}">${metadata.rarity}</div>
    <div class="nft-traits">${metadata.traits.join(' • ')}</div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2000);
};
```

### Rarity-Based Effects

```typescript
const RARITY_EFFECTS = {
  common: { particles: 5, sound: 'match_common', shake: 0 },
  uncommon: { particles: 8, sound: 'match_uncommon', shake: 1 },
  rare: { particles: 12, sound: 'match_rare', shake: 2 },
  legendary: { particles: 20, sound: 'match_legendary', shake: 4 },
};

const onNftMatch = (rarity: string) => {
  const effects = RARITY_EFFECTS[rarity] || RARITY_EFFECTS.common;
  
  spawnParticles(x, y, effects.particles);
  playSound(effects.sound);
  if (effects.shake > 0) {
    triggerShake(effects.shake, 100);
  }
  
  if (rarity === 'legendary') {
    triggerFlash('#ffd700', 0.3);
    spawnConfetti(x, y, 15);
  }
};
```

### Collection Progress

```typescript
const trackNftEncounter = (nftId: number) => {
  const seen = JSON.parse(localStorage.getItem('seen_nfts') || '[]');
  
  if (!seen.includes(nftId)) {
    seen.push(nftId);
    localStorage.setItem('seen_nfts', JSON.stringify(seen));
    
    // First-time encounter celebration
    showCallout(`New Wojak discovered! (${seen.length}/4200)`, 2000);
    playSound('discovery');
  }
};
```

---

# PART 10: REFERENCE

## Reusable Code Libraries

### Library Structure

```
src/lib/
├── juice/
│   ├── particles.ts      # Particle systems, pools, presets
│   ├── animations.ts     # Easing, springs, tweens
│   ├── effects.ts        # Screen shake, flash, vignette
│   ├── audio.ts          # Web Audio, procedural sounds
│   ├── camera.ts         # Camera system
│   └── index.ts
├── utils/
│   ├── math.ts           # Clamp, random, vectors
│   ├── color.ts          # Color interpolation
│   ├── mobile.ts         # Touch handling
│   └── index.ts
└── canvas/
    ├── drawing.ts        # Shapes, gradients
    ├── parallax.ts       # Parallax system
    ├── text.ts           # Floating text
    └── index.ts
```

### Import Examples

```typescript
// All-in-one import
import {
  spawnBurstParticles,
  createScreenShake,
  easeOutCubic,
  playTone,
  triggerHaptic,
  createCamera,
} from '@/lib/juice';

import { clamp, randomInRange, lerpColor } from '@/lib/utils';
import { roundRect, setupHiDPICanvas } from '@/lib/canvas';
```

---

## Implementation Checklist

### Before Launch

#### Audio
- [ ] Every tap/click has audio feedback
- [ ] Different collision types have distinct sounds
- [ ] 3+ sound variations per event type
- [ ] Streak/combo sounds escalate
- [ ] Sound toggle works and persists
- [ ] Music ducks during important SFX

#### Haptics
- [ ] Tap interactions have light haptic
- [ ] Different events have distinct patterns
- [ ] Streak haptics escalate
- [ ] Haptic toggle works and persists

#### Visual
- [ ] Moving objects have squash/stretch
- [ ] Impacts have flash + particles
- [ ] Destruction has shatter animation
- [ ] Combo meter visible during streaks
- [ ] Timer has urgency color progression
- [ ] Score changes animate (count up)
- [ ] Screen shake with decay
- [ ] Freeze frames on big impacts
- [ ] All animations use proper easing

#### Performance
- [ ] Particle pooling implemented
- [ ] Performance tiers for different devices
- [ ] Frame budget respected
- [ ] No memory leaks in particle systems

#### Accessibility
- [ ] Screen shake toggle
- [ ] Haptic toggle
- [ ] Sound/music separate toggles
- [ ] Respects prefers-reduced-motion
- [ ] Color is not sole indicator

---

## Quick Reference Card

### Minimum Viable Juice (Top 5)

1. **Squash & stretch** on all moving objects
2. **Sound + haptic** on every interaction
3. **Particle burst** on destruction/success
4. **Score count-up** animation
5. **Screen shake** on big moments

### Common Mistakes

| Mistake | Fix |
|---------|-----|
| Linear easing | Use ease-out, ease-in-out |
| Same sound every time | 3-4 variations per sound |
| Same feedback for all events | Differentiate by type |
| Screen shake on everything | Save for big moments |
| Buzzy haptics | Short, crisp pulses only |
| No combo visualization | Add combo meter |
| Audio-visual desync | Test timing carefully |

### Effect Intensity Guide

| Event | Shake | Flash | Particles | Freeze |
|-------|-------|-------|-----------|--------|
| Light tap | 0 | 0 | 0 | 0 |
| Normal hit | 0 | 0.1 | 8 | 0 |
| Good hit | 2 | 0.15 | 12 | 30ms |
| Great hit | 3 | 0.2 | 16 | 50ms |
| Combo 5+ | 4 | 0.25 | 20 | 60ms |
| Combo 10+ | 5 | 0.3 | 30 | 80ms |
| Death | 8 | 0.5 | 25 | 150ms |
| Level complete | 4 | 0.3 | Confetti | 100ms |

---

## Troubleshooting Guide

### "Something Feels Wrong" Diagnostic

When juice doesn't feel right, diagnose systematically:

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Feels "floaty" | Linear easing | Use ease-out for movements, ease-in-out for UI |
| Feels "dead" | Missing audio | Add sound to every interaction |
| Feels "cheap" | Same feedback every time | Add 3-4 variations per sound, randomize particles |
| Feels "laggy" | Visual-audio desync | Sound must trigger within 16ms of visual |
| Feels "nauseating" | Too much shake | Reduce intensity, add decay, offer toggle |
| Feels "random" | No clear cause-effect | Feedback must be immediate and proportional |
| Feels "annoying" | Over-frequent effects | Add cooldowns, reduce intensity on repeat |
| Feels "cluttered" | Particles blocking view | Lower z-index, shorter lifespan, fewer particles |

### Common Anti-Patterns

#### 1. Shake Overuse
```typescript
// ❌ BAD: Shake on everything
const onTap = () => shake(5, 200);
const onScore = () => shake(5, 200);
const onCollect = () => shake(5, 200);

// ✅ GOOD: Reserve shake for significant moments
const onTap = () => playSound('tap'); // No shake
const onScore = () => { playSound('score'); spawnParticles(x, y, 8); }; // No shake
const onCombo10 = () => { playSound('combo'); shake(4, 150); }; // Earned shake
```

#### 2. Linear Everything
```typescript
// ❌ BAD: Linear feels robotic
const animate = (t) => t;

// ✅ GOOD: Ease-out feels responsive
const animate = (t) => 1 - Math.pow(1 - t, 3);
```

#### 3. Identical Feedback
```typescript
// ❌ BAD: Everything sounds/looks the same
const onHit = () => playSound('hit');
const onMiss = () => playSound('hit'); // Same sound!

// ✅ GOOD: Distinct feedback types
const onHit = () => playSound(hitVariants.random(), { pitch: 0.9 + Math.random() * 0.2 });
const onMiss = () => playSound('miss', { volume: 0.5 }); // Distinct, softer
```

#### 4. Feedback Spam
```typescript
// ❌ BAD: Effect on every frame
gameLoop(() => {
  if (player.moving) spawnParticles(player.x, player.y, 5);
});

// ✅ GOOD: Cooldown between effects
let lastTrail = 0;
gameLoop((now) => {
  if (player.moving && now - lastTrail > 50) {
    spawnParticle(player.x, player.y);
    lastTrail = now;
  }
});
```

#### 5. Blocking Particles
```typescript
// ❌ BAD: Particles cover gameplay
particles.push({ 
  ...baseParticle, 
  size: 30, 
  lifetime: 2000,
  opacity: 1.0,
});

// ✅ GOOD: Non-intrusive particles
particles.push({
  ...baseParticle,
  size: 8,
  lifetime: 400,
  opacity: 0.6,
  zIndex: -1, // Behind game objects
});
```

### Debugging Workflow

1. **Isolate the channel** — Turn off sound, turn off particles, turn off shake one at a time
2. **Check timing** — Log timestamps of visual and audio events
3. **Test extremes** — Set values to 0 and max to understand range
4. **Test on target device** — Desktop feel ≠ mobile feel
5. **Get fresh eyes** — Ask someone who hasn't seen it before

---

## Calibration Methodology

### The Tuning Process

Getting juice values right is iterative. Here's a systematic approach:

#### Step 1: Start with Defaults

Use these baseline values as starting points:

| Effect | Start Value | Range | Notes |
|--------|-------------|-------|-------|
| Screen shake intensity | 3-5 | 1-15 | Higher = more violent |
| Screen shake duration | 100-200ms | 50-500ms | Shorter = snappier |
| Particle count | 8-12 | 3-50 | More = more celebration |
| Particle lifetime | 300-500ms | 100-2000ms | Shorter = snappier |
| Flash opacity | 0.15-0.2 | 0.05-0.5 | Lower = subtler |
| Flash duration | 100-150ms | 50-300ms | Shorter = punchier |
| Freeze frame | 30-60ms | 0-150ms | 0 = no freeze |
| Haptic duration | 10-20ms | 5-50ms | Shorter = crisper |

#### Step 2: Test Extremes

```typescript
// Test with exaggerated values to understand the range
const DEBUG_MODE = true;

const shake = DEBUG_MODE ? 20 : 5;  // Exaggerate to see effect
const particles = DEBUG_MODE ? 50 : 12;
const flashOpacity = DEBUG_MODE ? 0.8 : 0.2;
```

#### Step 3: Context-Based Scaling

Different events need different intensities:

```typescript
const INTENSITY_SCALE = {
  // Micro feedback (every tap)
  tap: { shake: 0, flash: 0, particles: 0, freeze: 0 },
  
  // Small success
  collect: { shake: 0, flash: 0.1, particles: 6, freeze: 0 },
  
  // Medium success
  match: { shake: 2, flash: 0.15, particles: 10, freeze: 30 },
  
  // Big success
  combo5: { shake: 3, flash: 0.2, particles: 15, freeze: 50 },
  
  // Huge success
  combo10: { shake: 5, flash: 0.25, particles: 25, freeze: 80 },
  
  // Failure
  gameOver: { shake: 8, flash: 0.4, particles: 20, freeze: 150 },
};
```

#### Step 4: Device Testing

```typescript
// Mobile needs different values than desktop
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

const getShakeIntensity = (base: number) => {
  // Mobile screens are smaller, shake feels more intense
  return isMobile ? base * 0.7 : base;
};

const getParticleCount = (base: number) => {
  // Mobile has less GPU headroom
  return isMobile ? Math.floor(base * 0.6) : base;
};
```

#### Step 5: Fatigue Testing

Play your game for 10+ minutes continuously. Effects that feel good at first may become annoying:

- **Sound fatigue** — Same sound 100x gets grating → add variations
- **Visual fatigue** — Constant particles obscure gameplay → reduce or add cooldown
- **Shake fatigue** — Too much shake causes discomfort → reduce frequency

### Value Tuning Checklist

Before finalizing values:

- [ ] Tested on mobile device (not just simulator)
- [ ] Tested on low-end device
- [ ] Played for 10+ minutes straight
- [ ] Asked 3+ people for feedback
- [ ] Tested with sound off
- [ ] Tested with reduced motion enabled
- [ ] Values feel good at 60fps AND 30fps

---

## Error-Resilient Patterns

Production code must handle failures gracefully. Juice should enhance, never break.

### Feature Detection

```typescript
// Always check API availability
const hasHaptics = 'vibrate' in navigator;
const hasWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
const hasPointerEvents = 'PointerEvent' in window;

// Feature-based implementation
const triggerHaptic = (duration: number) => {
  if (!hasHaptics) return;
  try {
    navigator.vibrate(duration);
  } catch {
    // Silently fail - some browsers throw on vibrate
  }
};
```

### Safe Audio Context

```typescript
class SafeAudioContext {
  private ctx: AudioContext | null = null;
  private initAttempted = false;
  
  async getContext(): Promise<AudioContext | null> {
    // Don't retry if init already failed
    if (this.initAttempted && !this.ctx) return null;
    
    if (!this.ctx) {
      this.initAttempted = true;
      
      try {
        const AudioContextClass = window.AudioContext || 
          (window as any).webkitAudioContext;
        
        if (!AudioContextClass) {
          console.warn('Web Audio API not supported');
          return null;
        }
        
        this.ctx = new AudioContextClass();
      } catch (err) {
        console.warn('Failed to create AudioContext:', err);
        return null;
      }
    }
    
    // Handle suspended state
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Resume failed, but context might still work
      }
    }
    
    // Don't return closed context
    if (this.ctx.state === 'closed') {
      this.ctx = null;
      return null;
    }
    
    return this.ctx;
  }
}
```

### Safe Canvas Operations

```typescript
const safeDrawParticles = (
  ctx: CanvasRenderingContext2D | null,
  particles: Particle[]
) => {
  // Null check
  if (!ctx) return;
  
  // Empty check
  if (particles.length === 0) return;
  
  try {
    ctx.save();
    
    particles.forEach(p => {
      // Skip invalid particles
      if (!isFinite(p.x) || !isFinite(p.y)) return;
      if (p.opacity <= 0 || p.size <= 0) return;
      
      ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
      ctx.fillStyle = p.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  } catch (err) {
    // Canvas operations can fail (e.g., context lost)
    console.warn('Particle draw failed:', err);
  }
};
```

### Graceful Degradation

```typescript
// Tiered juice system that degrades gracefully
class JuiceSystem {
  private tier: 'full' | 'reduced' | 'minimal' | 'none';
  
  constructor() {
    this.tier = this.detectTier();
  }
  
  private detectTier(): 'full' | 'reduced' | 'minimal' | 'none' {
    // No juice if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'minimal';
    }
    
    // Check device capability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      return 'minimal'; // No WebGL = probably low-end
    }
    
    // Check for low memory
    if ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) {
      return 'reduced';
    }
    
    // Check for slow CPU (rough heuristic)
    const cores = navigator.hardwareConcurrency || 2;
    if (cores <= 2) {
      return 'reduced';
    }
    
    return 'full';
  }
  
  getParticleLimit(): number {
    return { full: 100, reduced: 50, minimal: 20, none: 0 }[this.tier];
  }
  
  shouldShake(): boolean {
    return this.tier !== 'none' && this.tier !== 'minimal';
  }
  
  shouldFlash(): boolean {
    return this.tier === 'full' || this.tier === 'reduced';
  }
}
```

### Error Boundary for Juice

```typescript
// React error boundary specifically for juice effects
class JuiceErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('Juice effect error:', error, info);
    // Log to analytics but don't crash the game
  }
  
  render() {
    // If juice crashes, just render nothing (game continues)
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Usage
<JuiceErrorBoundary>
  <ParticleSystem />
  <ScreenEffects />
</JuiceErrorBoundary>
```

### Safe localStorage

```typescript
const safeStorage = {
  get(key: string, defaultValue: any = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      // localStorage full or unavailable
      return false;
    }
  },
};

// Usage for preferences
const prefs = safeStorage.get('juice_prefs', DEFAULT_PREFERENCES);
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| `docs/research/retention-patterns.md` | Daily rewards, streaks, progression |
| `docs/research/viral-patterns.md` | Sharing, challenges, leaderboards |
| `docs/testing/juice-testing-checklist.md` | Testing guide for all juice |
| `templates/canvas-game-starter/` | Ready-to-use game template |

---

## Changelog

### v2.1 (January 2026)
- **NEW**: Mobile Audio Compatibility section (iOS/Safari unlock patterns)
- **NEW**: User Juice Preferences system (intensity slider, toggles, presets)
- **NEW**: Troubleshooting Guide with anti-patterns and diagnostic table
- **NEW**: Calibration Methodology (starting values, tuning process, fatigue testing)
- **NEW**: Error-Resilient Patterns (feature detection, graceful degradation, error boundaries)
- **EXPANDED**: Shader Effects section with full implementations (Canvas bloom, chromatic aberration, color grading, WebGL shaders, GLSL code, PixiJS/Three.js examples)

### v2.0 (January 2026)
- Complete restructure from 36 sections to 22
- Added: Feedback State Machine, Performance Budgeting, Audio Mix Management
- Added: Input Prediction, Touch Patterns, Loading States, Tutorial Juice
- Added: Procedural Animation, Environmental Systems
- Consolidated redundant sections
- Added Priority Matrix and Quick Start guide
- Improved code examples with TypeScript
- Added effect intensity reference table
