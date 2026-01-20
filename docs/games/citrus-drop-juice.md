# Citrus Drop - Premium Juice Implementation Guide

> Transform Citrus Drop into an ASMR-like, addictive, premium merge puzzle experience.

**Creative Direction:** Juicy, visceral, satisfying with intense danger feedback and spectacular celebrations.

**Last Updated:** January 2026
**Status:** 🔄 Ready for Implementation

---

## Table of Contents

1. [Sound Design (ASMR)](#1-sound-design-asmr)
2. [Merge Effects](#2-merge-effects)
3. [Physics Audio](#3-physics-audio)
4. [Danger Zone System](#4-danger-zone-system)
5. [Melon Explosion](#5-melon-explosion-spectacular)
6. [Anticipation Effects](#6-anticipation-effects)
7. [Freeze Frames (Hitstop)](#7-freeze-frames-hitstop)
8. [Dynamic Environment](#8-dynamic-environment)
9. [Combo Escalation](#9-combo-escalation)
10. [Haptic Feedback](#10-haptic-feedback)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Sound Design (ASMR)

### Juicy Squish Style
The core audio identity: wet, organic, satisfying sounds like biting into fresh fruit.

### Merge Sounds (Tier-Based)

| Tier | Fruit | Sound Character | Duration | Pitch |
|------|-------|-----------------|----------|-------|
| 0→1 | Seed→Kumquat | Soft pop + tiny squish | 80ms | High |
| 1→2 | Kumquat→Clementine | Light squish | 100ms | Med-High |
| 2→3 | Clementine→Orange | Juicy pop + splash | 120ms | Medium |
| 3→4 | Orange→Grapefruit | Deep squish + splatter | 150ms | Med-Low |
| 4→5 | Grapefruit→Pomelo | Heavy squelch + burst | 180ms | Low |
| 5→6 | Pomelo→Melon | Massive juicy explosion | 250ms | Very Low |
| 6+6 | Melon+Melon | Spectacular burst + fanfare | 400ms | Sweep |

### Procedural Audio Implementation

```typescript
// Juicy squish using Web Audio API
const playMergeSound = (tier: number) => {
  const baseFreq = 300 - (tier * 30); // Lower pitch for bigger fruits
  const duration = 80 + (tier * 25);

  // Layer 1: Pop attack
  playTone(audioManager, baseFreq * 2, 0.15, 30, 'sine');

  // Layer 2: Squish body (noise-like)
  playTone(audioManager, baseFreq * 0.5, 0.1, duration, 'triangle');

  // Layer 3: Splash tail (higher tiers)
  if (tier >= 2) {
    setTimeout(() => {
      playTone(audioManager, baseFreq * 1.5, 0.05, 50, 'sine');
    }, 20);
  }

  // Layer 4: Wet resonance (higher tiers)
  if (tier >= 4) {
    setTimeout(() => {
      playTone(audioManager, baseFreq * 0.3, 0.08, 100, 'sine');
    }, 40);
  }
};
```

### Sound Variation
- **3-4 variations per tier** - randomly select + ±5% pitch variation
- **Positional audio** - slightly pan based on X position
- **Combo pitch escalation** - each combo merge raises base pitch by 5%

---

## 2. Merge Effects

### Juice Splatter Particles

```typescript
const MERGE_PARTICLE_CONFIG = {
  // Fruit-colored liquid droplets
  count: 12 + (tier * 4),        // 12-36 particles based on tier
  speed: { min: 3, max: 8 },
  gravity: 0.15,                  // Liquid falls
  lifetime: 400 + (tier * 100),
  size: { min: 3, max: 6 + tier },

  // Color from fruit
  color: FRUITS[newTier].color,
  colorVariation: 0.2,            // ±20% hue variation

  // Splatter pattern
  spread: 360,                    // Full circle
  velocityDecay: 0.95,

  // Liquid drip effect
  elongate: true,                 // Stretch in velocity direction
  trail: true,                    // Leave small trail
};
```

### Ring Shockwave (Subtle)

```typescript
const drawMergeRing = (ctx, x, y, progress, tier) => {
  const maxRadius = 30 + (tier * 10);
  const radius = maxRadius * easeOutCubic(progress);
  const alpha = 1 - progress;

  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
  ctx.lineWidth = 3 - (progress * 2);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
};
```

### Impact Flash

```typescript
// White flash at merge point (50ms)
const flashConfig = {
  color: '#ffffff',
  alpha: 0.6 - (tier * 0.05),  // Brighter for small, subtle for big
  duration: 50 + (tier * 10),
  radius: 20 + (tier * 8),
};
```

---

## 3. Physics Audio

### Soft Bumps on Collision

```typescript
// Gentle ASMR tap sounds
const playBumpSound = (velocity: number, tier: number) => {
  // Only play if velocity is significant
  if (velocity < 1.5) return;

  // Volume based on impact velocity (capped)
  const volume = Math.min(velocity / 15, 0.08);

  // Pitch based on fruit size (smaller = higher)
  const basePitch = 400 - (tier * 40);

  // Soft tap sound
  playTone(audioManager, basePitch, volume, 40, 'sine');

  // Tiny haptic on mobile
  if (velocity > 3) {
    triggerHaptic('tap');
  }
};

// Throttle to prevent audio spam
let lastBumpTime = 0;
const BUMP_COOLDOWN = 50; // ms

const onCollision = (event) => {
  const now = Date.now();
  if (now - lastBumpTime < BUMP_COOLDOWN) return;
  lastBumpTime = now;

  const velocity = getCollisionVelocity(event);
  const tier = Math.max(event.bodyA.fruitType, event.bodyB.fruitType);
  playBumpSound(velocity, tier);
};
```

### Wall Impact Sounds

```typescript
// Distinct wood thud for wall collisions
const playWallSound = (velocity: number) => {
  if (velocity < 2) return;

  const volume = Math.min(velocity / 20, 0.06);

  // Woody thud (lower frequency)
  playTone(audioManager, 150, volume, 60, 'triangle');
  playTone(audioManager, 80, volume * 0.5, 80, 'sine');
};
```

---

## 4. Danger Zone System

### Intense Panic Mode

When ANY fruit is above the danger line (Y < 100):

#### Visual Effects

```typescript
const DANGER_ZONE_EFFECTS = {
  // Vignette pulse (red)
  vignette: {
    color: '#ff0000',
    intensity: 0.3,
    pulseSpeed: 800,  // ms per pulse
  },

  // Fruit glow (fruits above line)
  fruitGlow: {
    color: '#ff4444',
    radius: 10,
    pulseSpeed: 400,
  },

  // Screen edge throb
  edgeThrob: {
    color: '#ff0000',
    width: 20,
    pulseIntensity: 0.5,
  },

  // Background darken
  backgroundDarken: 0.2,
};
```

#### Audio: Heartbeat

```typescript
const playHeartbeat = () => {
  // Double-beat pattern: "lub-DUB"
  const playBeat = (delay: number, volume: number, pitch: number) => {
    setTimeout(() => {
      playTone(audioManager, pitch, volume, 100, 'sine');
    }, delay);
  };

  // First beat (softer)
  playBeat(0, 0.08, 60);

  // Second beat (louder, lower)
  playBeat(150, 0.12, 50);

  // Repeat every 800ms while in danger
};

// Escalation: heartbeat speeds up as time above line increases
const getHeartbeatInterval = (timeAboveLine: number) => {
  const baseInterval = 800;
  const minInterval = 400;
  const escalationRate = timeAboveLine / 2000; // 0-1 over 2 seconds
  return Math.max(minInterval, baseInterval - (escalationRate * 400));
};
```

#### Fruit Warning Glow

```typescript
const drawDangerFruit = (ctx, fruit, timeAboveLine) => {
  const dangerProgress = Math.min(timeAboveLine / 2000, 1);

  // Pulsing red glow
  const pulsePhase = (Date.now() % 400) / 400;
  const glowIntensity = 0.3 + (Math.sin(pulsePhase * Math.PI * 2) * 0.2);

  // Red outline
  ctx.shadowColor = `rgba(255, 0, 0, ${glowIntensity * dangerProgress})`;
  ctx.shadowBlur = 15 + (dangerProgress * 10);

  // Draw fruit normally, then reset shadow
  drawFruit(ctx, fruit);
  ctx.shadowBlur = 0;

  // Add danger indicator above fruit
  if (dangerProgress > 0.3) {
    ctx.fillStyle = `rgba(255, 0, 0, ${dangerProgress})`;
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️', fruit.position.x, fruit.position.y - fruit.circleRadius - 15);
  }
};
```

---

## 5. Melon Explosion (Spectacular)

When two melons merge = MAXIMUM CELEBRATION

### Phase 1: Anticipation (200ms)

```typescript
// Time slows dramatically
setSlowMotion(timeScale, 0.1, 200);

// Both melons glow intensely
drawMelonGlow(ctx, melonA, melonB, 1.0);

// Camera zooms slightly toward merge point
pulseZoom(camera, 1.1, 200);

// Rising tone
playTone(audioManager, 220, 0.1, 200, 'sine');
```

### Phase 2: Impact (50ms freeze)

```typescript
// Full freeze frame
freezeFrame(150);

// Massive screen shake
screenShake = createScreenShake(20, 500);

// White flash
screenFlash = createScreenFlash('#ffffff', 0.8, 150);
```

### Phase 3: Explosion (400ms)

```typescript
// MASSIVE particle burst
spawnBurstParticles(particles, x, y, {
  count: 100,
  speed: { min: 5, max: 15 },
  gravity: 0.1,
  lifetime: 1000,
  colors: ['#90EE90', '#FFD700', '#FF6B35', '#FF4444', '#FFFFFF'],
  size: { min: 4, max: 12 },
});

// Confetti rain from top
for (let i = 0; i < 50; i++) {
  setTimeout(() => {
    spawnConfetti(particles,
      randomInRange(0, canvasWidth),
      -20,
      { gravity: 0.05, lifetime: 2000 }
    );
  }, i * 20);
}

// Triumphant fanfare
playMelonFanfare(); // Rising arpeggio C-E-G-C
```

### Phase 4: Afterglow (500ms)

```typescript
// Golden vignette
drawVignette(ctx, { color: '#FFD700', intensity: 0.3 });

// Floating "+100 MELON BONUS!" text
const text = createFloatingText('🍈 +100 MELON BONUS! 🍈', x, y, {
  color: '#FFD700',
  size: 28,
  duration: 1500,
  rise: 80,
});

// Haptic celebration
triggerHaptic('heavy');
setTimeout(() => triggerHaptic('success'), 100);
setTimeout(() => triggerHaptic('success'), 200);
```

---

## 6. Anticipation Effects

### Glowing Aura for Nearby Matching Fruits

```typescript
const MERGE_PROXIMITY_THRESHOLD = 80; // pixels

const checkMergeProximity = (fruits: FruitBody[]) => {
  const nearbyPairs: Array<[FruitBody, FruitBody, number]> = [];

  for (let i = 0; i < fruits.length; i++) {
    for (let j = i + 1; j < fruits.length; j++) {
      if (fruits[i].fruitType !== fruits[j].fruitType) continue;

      const dist = distance(
        fruits[i].position,
        fruits[j].position
      );

      const touchDist = fruits[i].circleRadius + fruits[j].circleRadius;
      const proximityDist = touchDist + MERGE_PROXIMITY_THRESHOLD;

      if (dist < proximityDist && dist > touchDist) {
        const proximity = 1 - ((dist - touchDist) / MERGE_PROXIMITY_THRESHOLD);
        nearbyPairs.push([fruits[i], fruits[j], proximity]);
      }
    }
  }

  return nearbyPairs;
};

const drawAnticipationGlow = (ctx, fruit, proximity) => {
  const pulsePhase = (Date.now() % 500) / 500;
  const pulse = 0.5 + (Math.sin(pulsePhase * Math.PI * 2) * 0.5);

  const glowRadius = fruit.circleRadius + (10 * proximity * pulse);
  const alpha = proximity * 0.4 * pulse;

  // Soft glow in fruit's color
  const gradient = ctx.createRadialGradient(
    fruit.position.x, fruit.position.y, fruit.circleRadius,
    fruit.position.x, fruit.position.y, glowRadius
  );
  gradient.addColorStop(0, `${FRUITS[fruit.fruitType].color}00`);
  gradient.addColorStop(0.5, `${FRUITS[fruit.fruitType].color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, `${FRUITS[fruit.fruitType].color}00`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(fruit.position.x, fruit.position.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
};
```

---

## 7. Freeze Frames (Hitstop)

### Tier-Based Timing

| Tier | Freeze Duration | Notes |
|------|-----------------|-------|
| 0-1 | 30ms | Barely noticeable, snappy |
| 2 | 50ms | Subtle pause |
| 3 | 80ms | Noticeable impact |
| 4 | 100ms | Satisfying weight |
| 5 | 130ms | Heavy impact |
| 6 | 150ms | Dramatic moment |
| 6+6 | 200ms | Maximum drama |

### Implementation

```typescript
const FREEZE_DURATIONS = [30, 30, 50, 80, 100, 130, 150];

const freezeFrame = (duration: number) => {
  isFrozen = true;
  freezeEndTime = Date.now() + duration;
};

// In game loop
const update = (deltaTime: number) => {
  // Check freeze state
  if (isFrozen) {
    if (Date.now() >= freezeEndTime) {
      isFrozen = false;
    } else {
      // During freeze: still update particles and effects
      updateParticles(particles, deltaTime);
      updateScreenEffects(deltaTime);
      return; // Skip physics update
    }
  }

  // Normal physics update
  Matter.Engine.update(engine, deltaTime);
  // ...
};
```

---

## 8. Dynamic Environment

### Background Pulse on Merge

```typescript
const drawDynamicBackground = (ctx, mergeFlash, comboLevel) => {
  // Base gradient
  const baseGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  baseGradient.addColorStop(0, '#FFF8DC');
  baseGradient.addColorStop(1, '#FFE4B5');

  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Merge flash overlay
  if (mergeFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${mergeFlash * 0.15})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  // Combo-based warmth
  if (comboLevel >= 3) {
    const warmth = Math.min((comboLevel - 2) * 0.05, 0.2);
    ctx.fillStyle = `rgba(255, 150, 50, ${warmth})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
};
```

### Wall Flash on Impact

```typescript
const drawWalls = (ctx, wallFlash) => {
  // Normal wood gradient
  const woodGradient = ctx.createLinearGradient(0, 0, WALL_THICKNESS, 0);
  woodGradient.addColorStop(0, '#8B4513');
  woodGradient.addColorStop(0.5, '#A0522D');
  woodGradient.addColorStop(1, '#8B4513');

  ctx.fillStyle = woodGradient;
  // Draw walls...

  // Flash overlay on impact
  if (wallFlash > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${wallFlash * 0.3})`;
    // Redraw wall rects with flash
  }
};
```

---

## 9. Combo Escalation

### Visual + Audio Progression

| Combo | Visual | Audio | Haptic |
|-------|--------|-------|--------|
| 1-2 | Normal | Normal squish | Light tap |
| 3-4 | Glow + "COMBO x3!" | +10% pitch | Medium |
| 5-6 | Brighter + confetti | +20% pitch, reverb | Strong |
| 7-9 | Screen pulse + "ON FIRE!" | +30% pitch, echo | Double tap |
| 10+ | Rainbow glow + "🔥 UNSTOPPABLE!" | Harmonic layers | Triple tap |

### Combo Sound Escalation

```typescript
const getComboAudioParams = (combo: number) => ({
  pitchMultiplier: 1 + (Math.min(combo, 10) * 0.05),
  volume: 0.1 + (Math.min(combo, 5) * 0.02),
  reverb: combo >= 5,
  harmonics: combo >= 10,
});
```

---

## 10. Haptic Feedback

### Complete Haptic Map

| Event | Pattern | Intensity |
|-------|---------|-----------|
| Drop fruit | Single tap | Light |
| Small merge (0-2) | Quick tap | Light |
| Medium merge (3-4) | Double tap | Medium |
| Large merge (5-6) | Heavy thud | Strong |
| Melon explosion | Triple pulse | Maximum |
| Wall collision | Micro tap | Very light |
| Danger zone | Rhythmic pulse | Medium |
| Game over | Long buzz | Heavy |
| Combo 5+ | Success pattern | Medium |

---

## 11. Implementation Checklist

### Sound Design
- [ ] Procedural merge sounds (tier-based juicy squish)
- [ ] Sound variations (3-4 per tier)
- [ ] Physics bump sounds (soft taps)
- [ ] Wall collision sounds
- [ ] Heartbeat for danger zone
- [ ] Melon fanfare

### Visual Effects
- [ ] Juice splatter particles on merge
- [ ] Ring shockwave on merge
- [ ] Impact flash on merge
- [ ] Anticipation glow for nearby fruits
- [ ] Danger zone vignette pulse
- [ ] Danger fruit glow + ⚠️ indicator
- [ ] Melon explosion sequence
- [ ] Confetti rain
- [ ] Dynamic background pulse
- [ ] Wall flash on impact

### Freeze Frames
- [ ] Tier-based hitstop timing
- [ ] Particles continue during freeze
- [ ] Melon merge extended freeze

### Haptics
- [ ] All events mapped to haptic patterns
- [ ] Danger zone rhythmic feedback

### Integration
- [ ] Import from `@/lib/juice`
- [ ] Import from `@/lib/canvas`
- [ ] Update render loop order
- [ ] Add state for new effects
- [ ] Performance test on mobile

---

## Quick Reference: Import Everything

```typescript
import {
  // Particles
  createParticleSystem,
  spawnBurstParticles,
  updateParticles,
  drawParticles,

  // Screen effects
  createScreenShake,
  updateScreenShake,
  applyScreenShake,
  createScreenFlash,
  drawScreenFlash,
  drawVignette,

  // Time
  createTimeScale,
  setSlowMotion,

  // Audio
  createAudioManager,
  initAudio,
  playTone,
  triggerHaptic,

  // Animations
  easeOutCubic,
  lerp,
} from '@/lib/juice';

import {
  createFloatingText,
  updateFloatingText,
  drawFloatingText,
} from '@/lib/canvas';

import {
  randomInRange,
  distance,
  clamp,
} from '@/lib/utils';
```

---

**This document defines the premium, ASMR-like experience for Citrus Drop.**

Sources:
- [Suika Game Wikipedia](https://en.wikipedia.org/wiki/Suika_Game)
- [Game Juice - Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html)
- [ASMR in Gaming - Medium](https://medium.com/@chomee901/how-asmr-elements-enhance-immersion-in-gaming-4ce1878d0b98)
- [Hitstop Explained - CritPoints](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- [Hexa Sort ASMR](https://www.crazygames.com/game/hexa-sort)
