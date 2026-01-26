# Game Juice Playbook

> Universal engagement principles for all Wojak.ink games. Apply these learnings to create satisfying, addictive game experiences that feel polished and professional.

**Last Updated:** January 2026
**Applies To:** All 15 games in the Wojak.ink ecosystem
**Learnings From:** Memory Match, Brick Breaker, Orange Juggle, Color Reaction, 2048 Merge, Block Puzzle, Flappy Orange, Citrus Drop

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Sound Design](#sound-design)
3. [Haptic Feedback](#haptic-feedback)
4. [Visual Juice](#visual-juice)
5. [Collision & Impact Systems](#collision--impact-systems)
6. [Combo & Streak Systems](#combo--streak-systems)
7. [Anticipation & Tension](#anticipation--tension)
8. [Powerup & Collectible Feedback](#powerup--collectible-feedback)
9. [Debuff & Negative Effect Systems](#debuff--negative-effect-systems)
10. [Enemy Warning & Hazard Systems](#enemy-warning--hazard-systems)
11. [Multi-Object Chaos Management](#multi-object-chaos-management)
12. [Character-Based Player Feedback](#character-based-player-feedback)
13. [Timer & Urgency Systems](#timer--urgency-systems)
14. [Scoring & Progression](#scoring--progression)
15. [Near-Miss & Close Call Feedback](#near-miss--close-call-feedback)
16. [Feedback Timing](#feedback-timing)
17. [Reaction Time Games](#reaction-time-games)
18. [Time Dilation & Slow Motion](#time-dilation--slow-motion)
19. [Countdown Urgency Systems](#countdown-urgency-systems)
20. [Fever Mode & Bonus States](#fever-mode--bonus-states)
21. [Camera Effects](#camera-effects)
22. [Viral & Share Mechanics](#viral--share-mechanics)
23. [Signature Sound Design](#signature-sound-design)
24. [Tile & Grid Game Juice](#tile--grid-game-juice)
25. [Character Personality on Objects](#character-personality-on-objects)
26. [Next Item Preview Systems](#next-item-preview-systems)
27. [Drag & Drop Juice](#drag--drop-juice)
28. [Line Clear & Cascade Systems](#line-clear--cascade-systems)
29. [Musical Combo Escalation](#musical-combo-escalation)
30. [Squash & Stretch Animation](#squash--stretch-animation)
31. [Death Sequence Design](#death-sequence-design)
32. [Near-Miss Bonus Systems](#near-miss-bonus-systems)
33. [Accessibility Considerations](#accessibility-considerations)
34. [NFT Integration Opportunities](#nft-integration-opportunities)
35. [Implementation Checklist](#implementation-checklist)
36. [Reusable Code Libraries](#reusable-code-libraries)

---

## Reusable Code Libraries

> **NEW:** All juice patterns in this playbook have been implemented as reusable TypeScript libraries. Use these instead of reimplementing patterns for each game.

### Library Structure

```
src/lib/
├── juice/                 # Game feel & effects
│   ├── particles.ts       # Particle systems, presets, ring effects
│   ├── animations.ts      # Easing functions, tweens, springs, timers
│   ├── effects.ts         # Screen shake, flash, vignette, time dilation
│   ├── audio.ts           # Web Audio API, procedural sounds, haptics
│   ├── camera.ts          # Camera zoom, shake, follow, coordinate conversion
│   └── index.ts           # Barrel export
│
├── utils/                 # General utilities
│   ├── math.ts            # Clamp, random, vectors, collision detection
│   ├── color.ts           # Color conversion, interpolation, palettes
│   ├── mobile.ts          # Touch handling, gestures, device detection
│   └── index.ts           # Barrel export
│
├── canvas/                # Drawing helpers
│   ├── drawing.ts         # Shapes, gradients, shadows, transforms
│   ├── parallax.ts        # Multi-layer parallax system
│   ├── text.ts            # Floating text, score display, text effects
│   └── index.ts           # Barrel export
```

### Quick Import Examples

```typescript
// Juice effects
import {
  createParticleSystem,
  spawnBurstParticles,
  PARTICLE_PRESETS
} from '@/lib/juice';

// Screen effects
import {
  createScreenShake,
  createScreenFlash,
  drawVignette
} from '@/lib/juice';

// Animations
import {
  easeOutCubic,
  createTween,
  lerp,
  createSpring
} from '@/lib/juice';

// Audio & haptics
import {
  createAudioManager,
  playTone,
  triggerHaptic,
  FEEDBACK_PRESETS
} from '@/lib/juice';

// Camera system
import {
  createCamera,
  applyCameraTransform,
  shakeCamera
} from '@/lib/juice';

// Canvas drawing
import {
  roundRect,
  withShadow,
  setupHiDPICanvas
} from '@/lib/canvas';

// Parallax
import {
  createPremiumParallaxSystem,
  updateParallax,
  drawParallaxSystem
} from '@/lib/canvas';

// Utilities
import { clamp, randomInRange, distance } from '@/lib/utils';
import { lerpColor, GAME_PALETTES } from '@/lib/utils';
import { isMobile, detectGesture, getThumbZone } from '@/lib/utils';
```

### Related Documentation

| Document | Description |
|----------|-------------|
| `docs/research/retention-patterns.md` | Daily rewards, streaks, progression systems |
| `docs/research/viral-patterns.md` | Sharing, challenges, referrals, leaderboards |
| `docs/testing/juice-testing-checklist.md` | Comprehensive testing guide for all juice |
| `templates/canvas-game-starter/` | Ready-to-use game template with hooks |

### Game-Specific Implementation Guides

| Game | Guide |
|------|-------|
| Flappy Orange | `docs/FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md` |
| Color Reaction | `docs/research/COLOR-REACTION-GAME-RESEARCH.md` |
| Block Puzzle | `docs/research/BLOCK-PUZZLE-GAME-RESEARCH.md` |
| 2048 Merge | `docs/research/MERGE-2048-GAME-RESEARCH.md` |
| Citrus Drop | `docs/research/CITRUS-DROP-GAME-RESEARCH.md` |

---

## Core Philosophy

### What is "Game Juice"?

> "A juicy game element will bounce and wiggle and squirt and make a little noise when you touch it. A juicy game feels alive and responds to everything you do—tons of cascading action and response for minimal user input."

**Game juice** (also called "game feel") refers to the non-essential visual, audio, and haptic effects that enhance the player's experience. These elements don't change gameplay rules but dramatically change how the game *feels*.

### The Golden Rule

**Every player action should have immediate, multi-sensory feedback.**

When a player does something:
- They should **see** a response (visual)
- They should **hear** a response (audio)
- They should **feel** a response (haptic)

Missing any channel makes the experience feel incomplete.

### Key Principles

1. **Responsiveness over realism** — Exaggerated feedback feels better than realistic feedback
2. **Consistency** — If one action has juice, all similar actions need juice
3. **Restraint** — Overuse leads to fatigue; save the big effects for big moments
4. **Layering** — Combine subtle effects for normal actions, stack effects for special moments
5. **Differentiation** — Different events need distinct feedback signatures
6. **Escalation** — Repeated successes should feel increasingly rewarding

---

## Sound Design

### Fundamental Rules

1. **Every interaction needs audio feedback** — Silence feels broken
2. **Create sound variations** — 3-4 variations per sound type prevents fatigue
3. **Layer complexity with importance** — Simple sounds for common actions, rich sounds for achievements
4. **Audio must match visual timing exactly** — Desync destroys immersion
5. **Differentiate by context** — Same action in different contexts can have different sounds

### Sound Categories Every Game Needs

| Category | Examples | Notes |
|----------|----------|-------|
| **Interaction sounds** | Button press, card flip, tile tap, paddle hit | Short (50-150ms), crisp, satisfying |
| **Success sounds** | Match found, brick destroyed, goal scored | Rewarding, musical, can be slightly longer |
| **Failure sounds** | Mismatch, miss, ball lost | Soft, non-punishing, informative |
| **Streak/combo sounds** | Consecutive successes | Escalating pitch/intensity with each hit |
| **Warning sounds** | Low time, low health, danger | Attention-grabbing but not annoying |
| **Celebration sounds** | Level complete, high score, achievement | Big, satisfying, memorable |
| **Ambient/UI sounds** | Menu navigation, hover states | Subtle, unobtrusive |
| **Collision sounds** | Wall hit, surface bounce, deflect | Context-specific, material-appropriate |
| **Powerup sounds** | Spawn, collect, activate, expire | Distinct per powerup type |
| **Anticipation sounds** | Near completion, final target | Tension-building, loopable |

### ASMR Sound Design (NEW - Citrus Drop)

**Source:** Citrus Drop research + ASMR mobile game analysis (January 2026)

ASMR (Autonomous Sensory Meridian Response) sounds trigger pleasant tingles and create addictive gameplay. Key principles:

#### Sound Styles for Different Game Types

| Style | Sound Character | Best For |
|-------|-----------------|----------|
| **Juicy Squish** | Wet, organic pop/squish | Fruit games, merge puzzles |
| **Crisp Pop** | Clean bubble-pop | Casual puzzles, tap games |
| **Deep Thud** | Weighty impact + resonance | Physics games, heavy objects |
| **Musical Chimes** | Melodic, harmonizing | Zen games, match-3 |

#### Layered ASMR Sounds

Create rich sounds by layering multiple frequencies:

```javascript
// Juicy squish merge sound (Citrus Drop style)
const playMergeSquish = (tier: number) => {
  const baseFreq = 300 - (tier * 30); // Lower pitch for bigger objects
  const duration = 80 + (tier * 25);

  // Layer 1: Pop attack (instant)
  playTone(audioManager, baseFreq * 2, 0.15, 30, 'sine');

  // Layer 2: Squish body (sustain)
  playTone(audioManager, baseFreq * 0.5, 0.1, duration, 'triangle');

  // Layer 3: Splash tail (bigger objects)
  if (tier >= 2) {
    setTimeout(() => {
      playTone(audioManager, baseFreq * 1.5, 0.05, 50, 'sine');
    }, 20);
  }

  // Layer 4: Wet resonance (largest objects)
  if (tier >= 4) {
    setTimeout(() => {
      playTone(audioManager, baseFreq * 0.3, 0.08, 100, 'sine');
    }, 40);
  }
};
```

#### Soft Physics Bump Sounds

For ASMR-like tactile feedback during physics simulations:

```javascript
const playBumpSound = (velocity: number, objectSize: number) => {
  if (velocity < 1.5) return; // Only significant impacts

  const volume = Math.min(velocity / 15, 0.08); // Subtle, not jarring
  const pitch = 400 - (objectSize * 40);        // Smaller = higher

  // Soft tap
  playTone(audioManager, pitch, volume, 40, 'sine');

  // Micro haptic on mobile
  if (velocity > 3) triggerHaptic('tap');
};

// Throttle to prevent audio spam
let lastBumpTime = 0;
const onCollision = (velocity, size) => {
  if (Date.now() - lastBumpTime < 50) return;
  lastBumpTime = Date.now();
  playBumpSound(velocity, size);
};
```

### Collision Sound Differentiation

**Critical learning from Brick Breaker:** Different surfaces and objects need distinct sounds.

| Collision Type | Sound Character | Volume | Example |
|----------------|-----------------|--------|---------|
| Soft surface (paddle, card) | Rubbery thwack, boing | 0.45 | Ball hitting paddle |
| Hard surface (wall, border) | Clean ping, click | 0.25 | Ball hitting wall |
| Breakable object (brick, tile) | Pop, crunch, shatter | 0.50 | Brick destruction |
| Unbreakable object | Metallic clang, thud | 0.40 | Indestructible barrier |
| Damaged but not destroyed | Crack, chip | 0.45 | Multi-hit object first hit |

### Sound Variation Technique

Instead of one sound per event, create a family:

```
brickDestroy_1.mp3  (base)
brickDestroy_2.mp3  (base + 5% pitch)
brickDestroy_3.mp3  (base + 10% pitch)
brickDestroy_4.mp3  (base - 5% pitch)
```

Randomly select from the family AND add slight pitch variation:

```javascript
const playWithVariation = (sounds: string[], baseVolume: number) => {
  const sound = sounds[Math.floor(Math.random() * sounds.length)];
  const pitch = 0.95 + Math.random() * 0.1; // ±5% additional variation
  play(sound, { volume: baseVolume, rate: pitch });
};
```

### Positional Sound Variation

For games with spatial elements, vary sound based on position:

```javascript
// Pitch varies by where ball hits paddle (edges = higher pitch)
const playPaddleHit = (hitPosition: number) => {
  // hitPosition: 0 = left edge, 0.5 = center, 1 = right edge
  const basePitch = 1.0;
  const pitchVariation = Math.abs(hitPosition - 0.5) * 0.3;
  play('paddle_hit.mp3', { rate: basePitch + pitchVariation });
};
```

### Ambient Sound Loops

For active states (powerups, danger modes), use looping ambient sounds:

```javascript
// Fireball mode ambient loop
const startAmbientLoop = (soundFile: string, volume: number = 0.2) => {
  const loop = new Howl({
    src: [soundFile],
    loop: true,
    volume: 0,
  });
  loop.play();
  loop.fade(0, volume, 300); // Fade in
  return loop;
};

const stopAmbientLoop = (loop: Howl) => {
  loop.fade(loop.volume(), 0, 500);
  setTimeout(() => loop.stop(), 500);
};
```

### Streak Sound Escalation

For combo/streak systems, escalate audio excitement:

| Streak | Sound Modification |
|--------|-------------------|
| 1 | Base sound |
| 2 | +10% pitch |
| 3 | +15% pitch, add sparkle layer |
| 4 | +20% pitch, add bass hit |
| 5+ | Full celebration sound, distinct from base |

### Dynamic Music Layering

For games with background music, consider stem-based mixing:

- **Base layer:** Always playing, calm
- **Intensity layer:** Fades in during action/streaks
- **Urgency layer:** Fades in when time pressure increases
- **Victory swell:** Brief overlay when near completion

This creates a soundtrack that responds to gameplay without jarring transitions.

### Technical Specifications

- **Format:** MP3 or WebM for web, AAC for mobile
- **Sample rate:** 44.1kHz standard
- **Bit depth:** 16-bit minimum
- **Loudness:** Normalize to -14 LUFS for consistency
- **Attack time:** <10ms for responsive feel

---

## Haptic Feedback

### Platform Considerations

- **iOS:** Rich haptic support via Taptic Engine and Core Haptics
- **Android:** Varies significantly by device; use HapticFeedbackConstants for consistency
- **Web:** Limited; use Vibration API where available

### Haptic Design Principles

1. **Crisp over buzzy** — Short, clean pulses (10-25ms) feel premium; long buzzes feel cheap
2. **Match the action weight** — Light actions get light haptics, heavy actions get heavy haptics
3. **Use patterns for meaning** — Different patterns = different information
4. **Test on real devices** — Haptics feel different on every device
5. **Differentiate by material/context** — Different surfaces feel different

### Haptic Pattern Library

| Event Type | Pattern | Duration | Intensity |
|------------|---------|----------|-----------|
| **Light tap** (hover, small item) | Single pulse | 5-10ms | Ultra-light |
| **Button tap** | Single pulse | 10-15ms | Light |
| **Success** (match, destroy) | Single pulse | 20-25ms | Medium |
| **Heavy impact** (strong object) | Single pulse | 30-35ms | Heavy |
| **Failure/Error** | Double pulse (tap-gap-tap) | 10ms-50ms-10ms | Light |
| **Combo hit** | Escalating (tap-tap-tap) | 10ms each, tightening gaps | Medium→Heavy |
| **Warning** | Triple pulse | 15ms each, 100ms gaps | Medium |
| **Critical alert** | Continuous short pulses | 8ms every 500ms | Light |
| **Achievement/Powerup** | Pattern burst | 10ms-20ms-8ms-20ms-6ms | Medium |
| **Loss/Drop** | Long single pulse | 50ms | Heavy |
| **Game over** | Long pulse + fade | 50ms | Heavy |

### Material-Based Haptics

**Critical learning from Brick Breaker:** Different objects should have distinct haptic signatures.

| Object Type | Haptic Pattern | Duration | Feel |
|-------------|---------------|----------|------|
| Soft/elastic (paddle, cushion) | Medium single | 20ms | Bouncy |
| Normal destructible | Light single | 12ms | Crisp |
| Heavy destructible | Double pulse | 20ms-30ms-15ms | Substantial |
| Indestructible | Heavy single | 30ms | Solid thud |
| Damaged (cracked) | Medium single | 18ms | Informative |
| Collectible/Powerup | Triple burst | 10ms-20ms-8ms-20ms-6ms | Rewarding |

### Streak Haptic Escalation

```
Streak 1: 15ms single pulse
Streak 2: 15ms + 10ms double pulse
Streak 3: 15ms + 10ms + 8ms triple pulse
Streak 4: 20ms + 15ms + 10ms + 8ms quad pulse
Streak 5+: Full celebration pattern
```

### Implementation Pattern

```javascript
// Centralized haptic service pattern
const haptics = {
  ultraLight: () => vibrate(5),
  light: () => vibrate(12),
  medium: () => vibrate(20),
  heavy: () => vibrate(35),
  error: () => vibrate([10, 50, 10]),
  success: () => vibrate(25),
  powerup: () => vibrate([10, 20, 8, 20, 6]),
  loss: () => vibrate(50),
  combo: (streak) => {
    if (streak >= 5) return vibrate([15, 15, 12, 15, 10, 15, 8]);
    if (streak >= 4) return vibrate([20, 15, 10, 15, 8]);
    if (streak >= 3) return vibrate([15, 15, 10, 15, 8]);
    if (streak >= 2) return vibrate([15, 20, 10]);
    return vibrate(15);
  }
};
```

### Avoid These Mistakes

- Long continuous vibrations (>100ms feels like an error)
- Buzzy, ringing vibrations (feels cheap)
- Haptics without corresponding visual/audio (feels random)
- Same haptic for different event types (loses meaning)

---

## Visual Juice

### Core Visual Techniques

#### 1. Squash and Stretch

**Critical learning:** This is the most important animation principle. Apply to ALL moving objects.

Objects compress on impact, stretch when moving fast. Volume should be preserved.

**For DOM elements (CSS):**
```css
/* On button press */
.button:active {
  transform: scale(0.95, 1.05);
}

/* On card land */
@keyframes cardLand {
  0% { transform: scale(1, 1); }
  50% { transform: scale(1.1, 0.9); }
  100% { transform: scale(1, 1); }
}
```

**For Canvas elements:**
```javascript
// Ball squash on collision
const triggerSquash = (ball, isHorizontalCollision) => {
  if (isHorizontalCollision) {
    ball.squashX = 0.7;  // Compress horizontally
    ball.squashY = 1.3;  // Expand vertically
  } else {
    ball.squashX = 1.3;
    ball.squashY = 0.7;
  }
};

// Recovery in update loop
const updateSquash = (ball) => {
  const recovery = 0.15;
  ball.squashX += (1 - ball.squashX) * recovery;
  ball.squashY += (1 - ball.squashY) * recovery;
};

// Draw with squash
const drawBall = (ctx, ball) => {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.scale(ball.squashX, ball.squashY);
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
```

#### 2. Velocity-Based Stretch

Fast-moving objects should stretch in their direction of movement:

```javascript
const drawWithVelocityStretch = (ctx, obj) => {
  const speed = Math.sqrt(obj.vx * obj.vx + obj.vy * obj.vy);
  const stretchFactor = 1 + Math.min(speed / 20, 0.3); // Max 30% stretch
  const angle = Math.atan2(obj.vy, obj.vx);

  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(angle);
  ctx.scale(stretchFactor, 1 / stretchFactor);
  // Draw object at origin
  ctx.restore();
};
```

#### 3. Impact Flash

Brief white flash at point of collision:

```javascript
const impactFlashes = [];

const createImpactFlash = (x, y) => {
  impactFlashes.push({ x, y, radius: 5, alpha: 1 });
};

const updateImpactFlashes = () => {
  for (let i = impactFlashes.length - 1; i >= 0; i--) {
    const flash = impactFlashes[i];
    flash.radius += 3;
    flash.alpha -= 0.15;
    if (flash.alpha <= 0) impactFlashes.splice(i, 1);
  }
};

const drawImpactFlashes = (ctx) => {
  impactFlashes.forEach(flash => {
    ctx.save();
    ctx.globalAlpha = flash.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};
```

#### 4. Shatter/Destruction Animation

When objects are destroyed, break them into pieces with physics:

```javascript
const shards = [];

const createShatter = (obj, shardCount = 6) => {
  const shardWidth = obj.width / 3;
  const shardHeight = obj.height / 2;

  for (let i = 0; i < shardCount; i++) {
    shards.push({
      x: obj.x + (i % 3) * shardWidth,
      y: obj.y + Math.floor(i / 3) * shardHeight,
      width: shardWidth * 0.9,
      height: shardHeight * 0.9,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 5 - 2,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      color: obj.color,
      alpha: 1,
    });
  }
};

const updateShards = () => {
  const gravity = 0.3;
  for (let i = shards.length - 1; i >= 0; i--) {
    const shard = shards[i];
    shard.x += shard.vx;
    shard.y += shard.vy;
    shard.vy += gravity;
    shard.rotation += shard.rotationSpeed;
    shard.alpha -= 0.02;
    if (shard.alpha <= 0) shards.splice(i, 1);
  }
};
```

#### 5. Screen Shake

**Use sparingly** — Can cause nausea if overused.

```javascript
let currentShake = null;

const triggerScreenShake = (intensity, duration = 150) => {
  currentShake = { intensity, duration, startTime: performance.now() };
};

const getShakeOffset = () => {
  if (!currentShake) return { x: 0, y: 0 };

  const elapsed = performance.now() - currentShake.startTime;
  if (elapsed > currentShake.duration) {
    currentShake = null;
    return { x: 0, y: 0 };
  }

  // Decay over time
  const progress = elapsed / currentShake.duration;
  const currentIntensity = currentShake.intensity * (1 - progress);

  return {
    x: (Math.random() - 0.5) * 2 * currentIntensity,
    y: (Math.random() - 0.5) * 2 * currentIntensity,
  };
};
```

**Screen shake intensity guide:**
| Event | Intensity | Duration |
|-------|-----------|----------|
| Small impact | 2-3px | 100ms |
| Medium impact | 4-5px | 150ms |
| Large impact | 6-8px | 200ms |
| Massive (rare) | 10px+ | 250ms |

#### 6. Freeze Frame (Hit Stop)

Pause the game for 30-100ms on significant impacts. Makes hits feel powerful.

```javascript
let freezeFrameUntil = 0;

const triggerFreezeFrame = (duration = 50) => {
  freezeFrameUntil = performance.now() + duration;
};

// In game loop
const gameLoop = (timestamp) => {
  if (timestamp < freezeFrameUntil) {
    draw(); // Still render, but don't update physics
    requestAnimationFrame(gameLoop);
    return;
  }
  update();
  draw();
  requestAnimationFrame(gameLoop);
};
```

**Freeze frame duration guide:**
| Event | Duration |
|-------|----------|
| Normal success | 40-50ms |
| Combo 5+ | 50-60ms |
| Combo 10+ | 70-80ms |
| Big destruction | 60-80ms |
| Level complete | 100ms |

#### 7. Color Flash / Screen Flash

Brief color overlay on events:

```javascript
let screenFlash = null;

const triggerScreenFlash = (color, alpha = 0.3) => {
  screenFlash = { color, alpha };
};

const updateScreenFlash = () => {
  if (screenFlash) {
    screenFlash.alpha -= 0.03;
    if (screenFlash.alpha <= 0) screenFlash = null;
  }
};

const drawScreenFlash = (ctx) => {
  if (!screenFlash) return;
  ctx.save();
  ctx.globalAlpha = screenFlash.alpha;
  ctx.fillStyle = screenFlash.color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
};
```

**Flash colors:**
- **Success:** Green/gold (#00ff00, #ffd700)
- **Failure:** Red, subtle (#ff0000, alpha 0.2)
- **Powerup:** Powerup's signature color
- **Critical:** Pulsing vignette

#### 8. Particles

Enhanced particle system with varied sizes and colors:

```javascript
const createParticleBurst = (x, y, color, count = 14) => {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Bias upward
      size: 2 + Math.random() * 4,
      color: i % 3 === 0 ? '#ffffff' : color, // Some white sparkles
      alpha: 1,
      gravity: 0.1 + Math.random() * 0.1,
    });
  }
};
```

#### 9. Trail Effects with Color Escalation

Trail color changes based on game state (combo level, powerup active):

```javascript
const getTrailColor = (combo, isPoweredUp) => {
  if (isPoweredUp) return '#ff4500'; // Fireball orange
  if (combo >= 10) return '#ff00ff'; // Magenta
  if (combo >= 8) return '#ff4500';  // OrangeRed
  if (combo >= 5) return '#ffd700';  // Gold
  if (combo >= 3) return '#ffaa00';  // Orange
  return '#ff8c00'; // Default
};
```

### Easing Functions

Never use linear easing. Always use curves:

| Use Case | Easing |
|----------|--------|
| UI appearing | `ease-out` or `cubic-bezier(0.0, 0.0, 0.2, 1)` |
| UI disappearing | `ease-in` or `cubic-bezier(0.4, 0.0, 1, 1)` |
| Bouncy feel | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |
| Snappy | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Elastic | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` |

---

## Collision & Impact Systems

**New section from Brick Breaker learnings.**

### Principle: Every Collision Type Needs Unique Feedback

When objects collide, the feedback should communicate:
1. **What** collided (ball vs paddle, card vs card)
2. **Material** of what it hit (soft, hard, breakable, unbreakable)
3. **Outcome** (destroyed, damaged, deflected)

### Collision Feedback Matrix

| Collision | Sound | Haptic | Visual |
|-----------|-------|--------|--------|
| Player tool + projectile | Rubbery thwack | Medium 20ms | Tool squash, impact flash |
| Projectile + wall | Clean ping | None or ultra-light | Impact flash |
| Projectile + breakable (destroy) | Pop/crunch | Light 12ms | Shatter + particles |
| Projectile + breakable (damage) | Crack | Medium 18ms | Crack overlay |
| Projectile + unbreakable | Metallic clang | Heavy 30ms | Impact flash, no damage |
| Player + collectible | Sparkle chime | Triple burst | Glow flash |
| Player + hazard | Harsh buzz | Error pattern | Red flash |

### Implementation Pattern

```javascript
const handleCollision = (objA, objB, collisionPoint) => {
  const collisionType = getCollisionType(objA, objB);

  // Sound
  playCollisionSound(collisionType, collisionPoint);

  // Haptic
  triggerCollisionHaptic(collisionType);

  // Visual
  createImpactFlash(collisionPoint.x, collisionPoint.y);

  if (collisionType.destroys) {
    createShatter(objB);
    createParticleBurst(objB.x, objB.y, objB.color);
    triggerFreezeFrame(40);
  }

  if (collisionType.squashes) {
    triggerSquash(objA, collisionType.isHorizontal);
  }
};
```

---

## Combo & Streak Systems

**New section from Brick Breaker learnings.**

### Core Combo Mechanics

A combo system should:
1. **Track** consecutive successes
2. **Reward** with escalating feedback
3. **Timeout** after brief inactivity (0.5-2 seconds)
4. **Multiply** score or other rewards
5. **Break** with clear feedback when lost

### Combo Feedback Escalation

| Combo | Sound | Haptic | Visual |
|-------|-------|--------|--------|
| 1 | Base | 15ms single | Base animation |
| 2 | +10% pitch | Double pulse | + Sparkles |
| 3 | +15% pitch, sparkle layer | Triple pulse | + Color flash |
| 4-5 | +20% pitch, bass hit | Quad pulse | + Screen shake (light) |
| 6-9 | Celebratory | Pattern burst | + Trail color change |
| 10+ | Full celebration | Full pattern | + Confetti, callout |

### Visual Combo Meter

Always show the player their combo status:

```javascript
const drawComboMeter = (ctx, combo, timeUntilReset, maxTime) => {
  if (combo < 2) return;

  const fillPercent = timeUntilReset / maxTime;
  const meterColor = combo >= 10 ? '#ff00ff' : combo >= 5 ? '#ffd700' : '#ff8c00';

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, height);

  // Fill (time remaining)
  ctx.fillStyle = meterColor;
  ctx.fillRect(x, y, width * fillPercent, height);

  // Combo count
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`x${combo}`, x + width / 2, y - 8);
};
```

### Combo Score Multiplier

```javascript
const getComboMultiplier = (combo) => {
  if (combo >= 10) return 2.5;
  if (combo >= 8) return 2.0;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.2;
  return 1.0;
};

const calculateScore = (basePoints, combo) => {
  return Math.floor(basePoints * getComboMultiplier(combo));
};
```

### Combo Break Feedback

When a combo is lost, provide clear feedback:

```javascript
const onComboBreak = (lostCombo) => {
  if (lostCombo < 3) return; // Only for meaningful combos

  // Sound: Descending, disappointed tone
  playComboBreak(lostCombo);

  // Haptic: Brief error-like pattern
  if (lostCombo >= 5) haptics.error();

  // Visual: Red vignette flash
  triggerVignetteFlash('#ff0000', 0.3);
};
```

---

## Anticipation & Tension

**New section from Brick Breaker learnings.**

### Principle: Build Tension Before Big Moments

Anticipation makes achievements feel more satisfying. Key moments to add anticipation:
- Near completion (1-3 items remaining)
- Approaching danger (projectile heading toward player)
- Timer critical state
- About to achieve milestone

### Final Target Highlighting

When only 1-3 targets remain, highlight them:

```javascript
const drawWithHighlight = (ctx, obj, remainingCount, time) => {
  const shouldHighlight = remainingCount <= 3;

  if (shouldHighlight) {
    // Pulsing glow
    const pulseIntensity = 10 + Math.sin(time * 0.01) * 8;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = pulseIntensity;

    // Pulsing border
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 0.01) * 0.3})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
  }

  // Draw object normally
  drawObject(ctx, obj);
};
```

### Anticipation Sound Loop

Start a tension-building sound when near completion:

```javascript
let anticipationLoop = null;

const checkAnticipation = (remainingTargets) => {
  if (remainingTargets <= 3 && remainingTargets > 0 && !anticipationLoop) {
    anticipationLoop = startAmbientLoop('/sounds/anticipation_loop.mp3', 0.25);
  } else if (remainingTargets === 0 || remainingTargets > 3) {
    if (anticipationLoop) {
      stopAmbientLoop(anticipationLoop);
      anticipationLoop = null;
    }
  }
};
```

### Trajectory Prediction

For games with projectiles, show where they're heading:

```javascript
const drawTrajectoryHint = (ctx, projectile, targetY, paddle) => {
  // Only show when projectile is heading toward target
  if (projectile.vy <= 0) return;

  // Calculate predicted landing position
  const timeToReach = (targetY - projectile.y) / projectile.vy;
  if (timeToReach < 0 || timeToReach > 60) return;

  const predictedX = projectile.x + projectile.vx * timeToReach;

  // Draw subtle indicator
  const alpha = Math.max(0, 1 - timeToReach / 60) * 0.5;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(predictedX, targetY - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
```

### Level Transition Animation

Smooth transitions between levels:

```javascript
const levelTransition = {
  phase: null, // 'fadeOut' | 'display' | 'fadeIn'
  progress: 0,
  levelNumber: 0,
};

const startLevelTransition = (newLevel) => {
  levelTransition.phase = 'fadeOut';
  levelTransition.progress = 0;
  levelTransition.levelNumber = newLevel;
};
```

### Danger Zone Warning System (NEW - Citrus Drop)

**Source:** Citrus Drop research (January 2026)

For games with "game over" zones (like the danger line in merge games), create intense panic feedback:

#### Visual Danger Indicators
```javascript
const DANGER_ZONE_CONFIG = {
  // Pulsing red vignette
  vignette: {
    color: '#ff0000',
    intensity: 0.3,
    pulseSpeed: 800, // ms per pulse
  },

  // Glowing danger objects
  objectGlow: {
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
};

const drawDangerObject = (ctx, obj, timeInDanger) => {
  const dangerProgress = Math.min(timeInDanger / 2000, 1);
  const pulsePhase = (Date.now() % 400) / 400;
  const glowIntensity = 0.3 + (Math.sin(pulsePhase * Math.PI * 2) * 0.2);

  // Pulsing red glow
  ctx.shadowColor = `rgba(255, 0, 0, ${glowIntensity * dangerProgress})`;
  ctx.shadowBlur = 15 + (dangerProgress * 10);

  drawObject(ctx, obj);
  ctx.shadowBlur = 0;

  // Warning indicator
  if (dangerProgress > 0.3) {
    ctx.fillStyle = `rgba(255, 0, 0, ${dangerProgress})`;
    ctx.font = 'bold 14px system-ui';
    ctx.fillText('⚠️', obj.x, obj.y - obj.radius - 15);
  }
};
```

#### Audio: Heartbeat Pattern
```javascript
const playHeartbeat = () => {
  // Double-beat pattern: "lub-DUB"
  playTone(audioManager, 60, 0.08, 100, 'sine');  // First beat
  setTimeout(() => {
    playTone(audioManager, 50, 0.12, 100, 'sine'); // Second beat (louder)
  }, 150);
};

// Escalate speed as danger increases
const getHeartbeatInterval = (timeInDanger) => {
  const baseInterval = 800;
  const minInterval = 400;
  const escalation = Math.min(timeInDanger / 2000, 1);
  return Math.max(minInterval, baseInterval - (escalation * 400));
};
```

### Merge Anticipation Glow (NEW - Citrus Drop)

When matching objects are near each other but haven't merged yet, show anticipation:

```javascript
const MERGE_PROXIMITY = 80; // pixels

const checkMergeProximity = (objects) => {
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      if (objects[i].type !== objects[j].type) continue;

      const dist = distance(objects[i], objects[j]);
      const touchDist = objects[i].radius + objects[j].radius;

      if (dist < touchDist + MERGE_PROXIMITY && dist > touchDist) {
        const proximity = 1 - ((dist - touchDist) / MERGE_PROXIMITY);
        drawAnticipationGlow(ctx, objects[i], proximity);
        drawAnticipationGlow(ctx, objects[j], proximity);
      }
    }
  }
};

const drawAnticipationGlow = (ctx, obj, proximity) => {
  const pulse = 0.5 + (Math.sin(Date.now() / 250) * 0.5);
  const glowRadius = obj.radius + (10 * proximity * pulse);
  const alpha = proximity * 0.4 * pulse;

  const gradient = ctx.createRadialGradient(
    obj.x, obj.y, obj.radius,
    obj.x, obj.y, glowRadius
  );
  gradient.addColorStop(0, `${obj.color}00`);
  gradient.addColorStop(0.5, `${obj.color}${Math.round(alpha * 255).toString(16)}`);
  gradient.addColorStop(1, `${obj.color}00`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
};

const updateLevelTransition = () => {
  if (!levelTransition.phase) return;

  levelTransition.progress += 0.02;

  if (levelTransition.progress >= 1) {
    if (levelTransition.phase === 'fadeOut') {
      levelTransition.phase = 'display';
      levelTransition.progress = 0;
      loadLevel(levelTransition.levelNumber);
    } else if (levelTransition.phase === 'display') {
      levelTransition.phase = 'fadeIn';
      levelTransition.progress = 0;
    } else {
      levelTransition.phase = null;
    }
  }
};

const drawLevelTransition = (ctx) => {
  if (!levelTransition.phase) return;

  let overlayAlpha = 0;
  if (levelTransition.phase === 'fadeOut') overlayAlpha = levelTransition.progress;
  else if (levelTransition.phase === 'display') overlayAlpha = 1;
  else if (levelTransition.phase === 'fadeIn') overlayAlpha = 1 - levelTransition.progress;

  ctx.save();
  ctx.globalAlpha = overlayAlpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (levelTransition.phase === 'display') {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${levelTransition.levelNumber}`, canvasWidth / 2, canvasHeight / 2);
  }
  ctx.restore();
};
```

---

## Powerup & Collectible Feedback

**New section from Brick Breaker learnings.**

### Powerup Lifecycle

Every powerup should have feedback at each stage:

1. **Spawn** — Something valuable appeared
2. **Idle/Falling** — It's available, grab it!
3. **Collection** — You got it!
4. **Activation** — It's now active
5. **Active state** — Visual reminder it's working
6. **Expiring soon** — Warning it's about to end
7. **Expired** — It's gone

### Spawn Feedback

```javascript
const spawnPowerup = (x, y, type) => {
  playSound('powerup_spawn.mp3', 0.35); // Sparkle chime
  createParticleBurst(x, y, powerupColors[type], 8);

  return {
    x, y, type,
    pulsePhase: 0, // For idle animation
  };
};
```

### Idle Animation (Glow & Pulse)

```javascript
const drawPowerup = (ctx, powerup, time) => {
  const pulseScale = 1 + Math.sin(time * 0.01) * 0.1;
  const glowIntensity = 10 + Math.sin(time * 0.015) * 5;

  ctx.save();
  ctx.shadowColor = powerup.color;
  ctx.shadowBlur = glowIntensity;

  ctx.translate(powerup.x, powerup.y);
  ctx.scale(pulseScale, pulseScale);

  // Draw powerup
  ctx.fillStyle = powerup.color;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.fill();

  // Icon
  ctx.fillStyle = '#ffffff';
  ctx.fillText(powerup.icon, 0, 0);

  ctx.restore();
};
```

### Collection Feedback

```javascript
const collectPowerup = (powerup) => {
  // Type-specific sound
  playSound(powerupSounds[powerup.type], 0.5);

  // Haptic: Rewarding triple burst
  haptics.powerup();

  // Screen flash in powerup's color
  triggerScreenFlash(powerup.color, 0.3);

  // Particles
  createParticleBurst(powerup.x, powerup.y, powerup.color, 12);
};
```

### Active State Indicator

Show which powerups are active and their remaining duration:

```javascript
const drawActivePowerups = (ctx, activePowerups, currentTime) => {
  activePowerups.forEach((powerup, index) => {
    const remaining = powerup.expiresAt - currentTime;
    const progress = remaining / powerup.duration;

    const x = 10;
    const y = 60 + index * 25;
    const width = 80;
    const height = 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);

    // Progress bar
    ctx.fillStyle = powerup.color;
    ctx.fillRect(x, y, width * progress, height);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.fillText(powerup.type.toUpperCase(), x + 5, y + 14);

    // Flash when about to expire (<2 seconds)
    if (remaining < 2000) {
      ctx.globalAlpha = 0.5 + Math.sin(currentTime * 0.02) * 0.5;
      ctx.strokeStyle = '#ff0000';
      ctx.strokeRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  });
};
```

### Type-Specific Active Effects

Some powerups need ambient feedback while active:

```javascript
// Fireball mode: Ember particles + ambient sound
const updateFireballMode = (ball, isActive) => {
  if (isActive) {
    // Ambient sound loop
    if (!fireballLoop) fireballLoop = startAmbientLoop('fireball_loop.mp3', 0.2);

    // Draw ember particles around ball
    drawEmberParticles(ball);
  } else {
    if (fireballLoop) {
      stopAmbientLoop(fireballLoop);
      fireballLoop = null;
    }
  }
};
```

---

## Debuff & Negative Effect Systems

**New section from Orange Juggle learnings.**

### Principle: Debuffs Need Constant Feedback

When players are affected by a negative status, they need continuous reminders:
1. **Visual overlay** — Constantly visible effect
2. **Audio loop** — Ambient sound while active
3. **Clear cleanse indicator** — Show how to remove it

### Visual Debuff Overlay

Create an immersive "affected" state with screen overlays:

```javascript
const drawDebuffOverlay = (ctx, debuffType, time) => {
  if (!activeDebuff) return;

  ctx.save();

  if (debuffType === 'drunk' || debuffType === 'slowed') {
    // Woozy purple vignette that wobbles
    const wobbleX = Math.sin(time * 0.003) * 20;
    const wobbleY = Math.cos(time * 0.004) * 15;
    const wobbleAlpha = 0.25 + Math.sin(time * 0.005) * 0.1;

    const gradient = ctx.createRadialGradient(
      canvasWidth / 2 + wobbleX,
      canvasHeight / 2 + wobbleY,
      canvasWidth * 0.3,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.8
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(75, 0, 75, ${wobbleAlpha})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Optional: Subtle scan lines for dizziness
    ctx.globalAlpha = 0.03;
    for (let y = 0; y < canvasHeight; y += 4) {
      if (y % 8 === 0) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, y, canvasWidth, 2);
      }
    }
  }

  ctx.restore();
};
```

### Debuff Audio Loop

```javascript
const debuffSounds = {
  drunk: {
    loop: null,
    start: (audioContext) => {
      // Woozy, sloshing ambient with slow LFO
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.value = 0.5; // Very slow wobble
      lfoGain.gain.value = 20;

      const main = audioContext.createOscillator();
      main.type = 'triangle';
      main.frequency.value = 100;

      const mainGain = audioContext.createGain();
      mainGain.gain.value = 0.1;

      lfo.connect(lfoGain).connect(main.frequency);
      main.connect(mainGain).connect(audioContext.destination);

      lfo.start();
      main.start();

      return { lfo, main, mainGain };
    },
    stop: (nodes) => {
      nodes.mainGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      setTimeout(() => {
        nodes.lfo.stop();
        nodes.main.stop();
      }, 500);
    }
  }
};
```

### Debuff Cleanse Feedback

When a debuff is removed (by powerup or timer), provide satisfying cleanse:

```javascript
const cleansDebuff = (debuffType, cleanseSource) => {
  // Sound: Upward cleansing chime
  const notes = [523, 659, 784]; // C5, E5, G5 ascending
  notes.forEach((freq, i) => {
    playNote(freq, audioContext.currentTime + i * 0.08, 0.15);
  });

  // Haptic: Quick energetic pattern
  vibrate([10, 20, 8, 20, 6]);

  // Visual: Flash in cleanse color (usually gold/white)
  triggerScreenFlash('#ffd700', 0.3);

  // Particles: Outward burst symbolizing removal
  createParticleBurst(playerX, playerY, '#ffd700', 15);

  // Stop debuff ambient
  debuffSounds[debuffType].stop();
  debuffOverlay = null;
};
```

### Debuff Collection Sound

Negative powerups need distinct, slightly ominous sounds:

```javascript
const createDebuffCollectSound = (audioContext) => {
  // Double "glug-glug" with woozy warble
  const glug1 = createGlugSound(200, 120, 0, 0.1);
  const glug2 = createGlugSound(180, 100, 0.15, 0.25);

  // Woozy warble overlay
  const lfo = audioContext.createOscillator();
  lfo.frequency.value = 5;
  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 30;

  const mainOsc = audioContext.createOscillator();
  mainOsc.type = 'triangle';
  mainOsc.frequency.value = 150;

  const mainGain = audioContext.createGain();
  mainGain.gain.setValueAtTime(0.15, audioContext.currentTime);
  mainGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  lfo.connect(lfoGain).connect(mainOsc.frequency);
  mainOsc.connect(mainGain).connect(audioContext.destination);

  lfo.start();
  mainOsc.start();
  lfo.stop(audioContext.currentTime + 0.4);
  mainOsc.stop(audioContext.currentTime + 0.4);
};
```

### Debuff Haptic Pattern

```javascript
// Woozy, uneven pattern that feels "drunk"
const debuffHaptics = {
  drunk: [30, 80, 25],    // Long-pause-medium (sloshy)
  slowed: [40, 40, 40],   // Heavy, sluggish
  confused: [10, 20, 10, 50, 10, 20, 10], // Erratic
};
```

---

## Enemy Warning & Hazard Systems

**New section from Orange Juggle learnings.**

### Principle: Enemies Need Anticipation

Sudden enemy appearances feel unfair. Always provide warning:
1. **Visual warning** — Shadow, icon, or highlight
2. **Audio warning** — Distinct danger sound
3. **Time to react** — 1-2 seconds minimum

### Shadow Warning System (Drop from Sky)

For enemies that drop into play:

```javascript
interface EnemyWarning {
  x: number;
  startTime: number;
  duration: number; // 1500ms typical
  enemyType: string;
}

const enemyWarningRef = useRef<EnemyWarning | null>(null);

const startEnemyWarning = (dropX: number, enemyType: string) => {
  enemyWarningRef.current = {
    x: dropX,
    startTime: performance.now(),
    duration: 1500,
    enemyType,
  };

  // Warning sound
  playEnemyWarning(enemyType);

  // Warning haptic
  vibrate([15, 100, 15, 100, 15]); // Urgent triple pulse
};

const drawEnemyWarning = (ctx: CanvasRenderingContext2D, currentTime: number) => {
  const warning = enemyWarningRef.current;
  if (!warning) return;

  const elapsed = currentTime - warning.startTime;
  const progress = Math.min(elapsed / warning.duration, 1);

  // Growing shadow
  const shadowRadius = 20 + progress * 40;
  const shadowAlpha = 0.2 + progress * 0.4;

  ctx.save();
  ctx.globalAlpha = shadowAlpha;

  // Elliptical shadow on ground
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(
    warning.x,
    groundY, // Ground level
    shadowRadius,
    shadowRadius * 0.4, // Flattened for perspective
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Pulsing danger ring
  const pulseAlpha = Math.sin(elapsed * 0.02) * 0.3 + 0.3;
  ctx.globalAlpha = pulseAlpha;
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(
    warning.x,
    groundY,
    shadowRadius + 10,
    (shadowRadius + 10) * 0.4,
    0, 0, Math.PI * 2
  );
  ctx.stroke();

  // Warning icon
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⚠', warning.x, groundY - 30);

  ctx.restore();
};
```

### Enemy Drop Animation

```javascript
interface Enemy {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  landed: boolean;
  squashY: number;
}

const spawnEnemy = (x: number, targetY: number): Enemy => {
  return {
    x,
    y: -100, // Start above screen
    targetY,
    vy: 0,
    landed: false,
    squashY: 1,
  };
};

const updateEnemyDrop = (enemy: Enemy) => {
  if (enemy.landed) {
    // Squash recovery
    enemy.squashY += (1 - enemy.squashY) * 0.15;
    return;
  }

  // Accelerating drop
  enemy.vy += 0.8; // Gravity
  enemy.y += enemy.vy;

  if (enemy.y >= enemy.targetY) {
    enemy.y = enemy.targetY;
    enemy.landed = true;
    enemy.squashY = 0.5; // Squash on landing

    // Landing effects
    createDustCloud(enemy.x, enemy.targetY);
    triggerScreenShake(10, 200);
    playEnemyLand();
  }
};

const createDustCloud = (x: number, y: number) => {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI; // Upper hemisphere
    const speed = 2 + Math.random() * 4;

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: '#d2b48c', // Tan/brown
      alpha: 0.8,
      gravity: 0.05,
    });
  }
};
```

### Enemy Warning Sound

```javascript
const createEnemyWarningSound = (audioContext: AudioContext) => {
  // Descending alarm horn
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.5);

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  // Low rumble layer
  const rumble = audioContext.createOscillator();
  const rumbleGain = audioContext.createGain();
  rumble.type = 'sine';
  rumble.frequency.value = 60;
  rumbleGain.gain.setValueAtTime(0.2, audioContext.currentTime);
  rumbleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

  osc.connect(gain).connect(audioContext.destination);
  rumble.connect(rumbleGain).connect(audioContext.destination);

  osc.start();
  rumble.start();
  osc.stop(audioContext.currentTime + 0.5);
  rumble.stop(audioContext.currentTime + 0.6);
};
```

### Enemy Collision Impact

When enemy hits player (game over moment):

```javascript
const handleEnemyCollision = () => {
  // Heavy impact sound
  playEnemyImpact(); // Crash + thud

  // Major haptic
  vibrate([80]); // Long heavy pulse

  // Major screen shake
  triggerScreenShake(15, 300);

  // Freeze frame for impact
  triggerFreezeFrame(100);

  // Explosion particles
  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const speed = 3 + Math.random() * 6;

    particles.push({
      x: player.x, y: player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: i % 3 === 0 ? '#ff4444' : '#ffaa00',
      alpha: 1,
      gravity: 0.15,
    });
  }

  // Red screen flash
  triggerScreenFlash('#ff0000', 0.5);

  setGameOver(true);
};
```

### Near-Miss with Enemy

Escaping an enemy narrowly should be acknowledged:

```javascript
const checkEnemyNearMiss = (enemy, player): boolean => {
  const distance = Math.abs(enemy.x - player.x);

  // Within near-miss range but not collision
  if (distance > collisionThreshold && distance < collisionThreshold + 30) {
    // Ultra-light haptic warning
    vibrate([5]);

    // Brief orange flash (warning but survived)
    triggerScreenFlash('#ff8800', 0.15);

    return true;
  }
  return false;
};
```

---

## Multi-Object Chaos Management

**New section from Orange Juggle learnings.**

### Principle: Help Players Manage Overwhelming Situations

When multiple objects require attention simultaneously:
1. **Prioritize visually** — Show which is most urgent
2. **Predict outcomes** — Show where things are heading
3. **Escalate feedback** — More chaos = more intensity

### Panic Level System

```javascript
const getPanicLevel = (activeObjects: number): number => {
  if (activeObjects >= 5) return 4; // Maximum chaos
  if (activeObjects >= 4) return 3;
  if (activeObjects >= 3) return 2;
  if (activeObjects >= 2) return 1;
  return 0; // Calm
};

const PANIC_EFFECTS = {
  0: { vignette: false, predictionAlpha: 0.3, shakeMultiplier: 1 },
  1: { vignette: false, predictionAlpha: 0.4, shakeMultiplier: 1 },
  2: { vignette: true, vignetteAlpha: 0.1, predictionAlpha: 0.5, shakeMultiplier: 1.2 },
  3: { vignette: true, vignetteAlpha: 0.2, predictionAlpha: 0.6, shakeMultiplier: 1.5 },
  4: { vignette: true, vignetteAlpha: 0.3, predictionAlpha: 0.7, shakeMultiplier: 2 },
};
```

### Landing Prediction Indicators

Show where falling objects will land:

```javascript
const drawLandingPredictions = (
  ctx: CanvasRenderingContext2D,
  fallingObjects: FallingObject[],
  targetY: number,
  panicLevel: number
) => {
  const baseAlpha = PANIC_EFFECTS[panicLevel].predictionAlpha;

  fallingObjects.forEach(obj => {
    if (obj.vy <= 0) return; // Only falling objects

    // Calculate landing position
    const timeToLand = (targetY - obj.y) / obj.vy;
    if (timeToLand < 0 || timeToLand > 90) return; // Too far away

    const predictedX = obj.x + obj.vx * timeToLand;

    // Urgency increases as it gets closer
    const urgency = Math.max(0, 1 - timeToLand / 60);
    const alpha = baseAlpha * urgency;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Landing dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(predictedX, targetY - 5, 4 + urgency * 4, 0, Math.PI * 2);
    ctx.fill();

    // Trajectory line (dashed)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(obj.x, obj.y);
    ctx.lineTo(predictedX, targetY - 5);
    ctx.stroke();

    ctx.restore();
  });
};
```

### Panic Vignette

Red edge glow when overwhelmed:

```javascript
const drawPanicVignette = (
  ctx: CanvasRenderingContext2D,
  panicLevel: number,
  time: number
) => {
  const effects = PANIC_EFFECTS[panicLevel];
  if (!effects.vignette) return;

  const pulseAlpha = effects.vignetteAlpha + Math.sin(time * 0.02 * panicLevel) * 0.1;

  const gradient = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.3,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, `rgba(255, 0, 0, ${pulseAlpha})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};
```

### Prioritized Object Highlighting

Highlight the most urgent object:

```javascript
const getMostUrgentObject = (objects: FallingObject[], targetY: number): FallingObject | null => {
  let mostUrgent = null;
  let shortestTime = Infinity;

  objects.forEach(obj => {
    if (obj.vy > 0) {
      const timeToTarget = (targetY - obj.y) / obj.vy;
      if (timeToTarget > 0 && timeToTarget < shortestTime) {
        shortestTime = timeToTarget;
        mostUrgent = obj;
      }
    }
  });

  return mostUrgent;
};

const drawUrgentHighlight = (ctx: CanvasRenderingContext2D, obj: FallingObject, time: number) => {
  const pulseIntensity = 8 + Math.sin(time * 0.02) * 4;

  ctx.save();
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = pulseIntensity;

  // Pulsing ring around urgent object
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(obj.x, obj.y, obj.radius + 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};
```

### Chaos Sound Layering

Add audio intensity as chaos increases:

```javascript
const updateChaosAudio = (panicLevel: number) => {
  // Base game audio always playing

  // Layer 1: Tension drone (panic 2+)
  if (panicLevel >= 2 && !tensionDrone) {
    tensionDrone = startAmbientLoop('tension_drone.mp3', 0.15);
  } else if (panicLevel < 2 && tensionDrone) {
    stopAmbientLoop(tensionDrone);
    tensionDrone = null;
  }

  // Layer 2: Heartbeat (panic 3+)
  if (panicLevel >= 3 && !heartbeat) {
    heartbeat = startAmbientLoop('heartbeat.mp3', 0.2);
  } else if (panicLevel < 3 && heartbeat) {
    stopAmbientLoop(heartbeat);
    heartbeat = null;
  }

  // Layer 3: Alarm (panic 4)
  if (panicLevel >= 4 && !alarmLoop) {
    alarmLoop = startAmbientLoop('alarm_loop.mp3', 0.25);
  } else if (panicLevel < 4 && alarmLoop) {
    stopAmbientLoop(alarmLoop);
    alarmLoop = null;
  }
};
```

---

## Character-Based Player Feedback

**New section from Orange Juggle learnings.**

### Principle: Characters Have More Feedback Opportunities

When the player controls a character (not just a paddle or cursor):
1. **Animate body parts** — Arms, legs, expressions
2. **Character reactions** — Surprise, effort, celebration
3. **Personality through movement** — Squash, bounce, anticipation

### Animated Limb System

For characters with arms/appendages that interact:

```javascript
interface Character {
  x: number;
  y: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftArmTarget: number;
  rightArmTarget: number;
  bodySquash: number;
  expression: 'neutral' | 'effort' | 'happy' | 'worried';
}

const triggerArmSwing = (character: Character, isLeftArm: boolean) => {
  const arm = isLeftArm ? 'leftArmTarget' : 'rightArmTarget';

  // Swing up
  character[arm] = -Math.PI / 3;

  // Return to rest after delay
  setTimeout(() => {
    character[arm] = 0;
  }, 150);

  // Body squash on effort
  character.bodySquash = 0.9;

  // Arm whoosh sound
  playArmSwing(isLeftArm);
};

const updateCharacterAnimation = (character: Character) => {
  const armSpeed = 0.25;
  const bodyRecovery = 0.15;

  // Arm interpolation
  character.leftArmAngle += (character.leftArmTarget - character.leftArmAngle) * armSpeed;
  character.rightArmAngle += (character.rightArmTarget - character.rightArmAngle) * armSpeed;

  // Body squash recovery
  character.bodySquash += (1 - character.bodySquash) * bodyRecovery;
};
```

### Character Expression System

```javascript
const setCharacterExpression = (character: Character, expression: string, duration: number = 500) => {
  character.expression = expression;

  if (duration > 0) {
    setTimeout(() => {
      character.expression = 'neutral';
    }, duration);
  }
};

// Usage
onHit: () => setCharacterExpression(player, 'effort', 200);
onCombo5: () => setCharacterExpression(player, 'happy', 1000);
onDanger: () => setCharacterExpression(player, 'worried', 0); // Until danger passes
onSuccess: () => setCharacterExpression(player, 'happy', 1500);
```

### Character Glow with Combo

```javascript
const drawCharacterWithComboGlow = (
  ctx: CanvasRenderingContext2D,
  character: Character,
  combo: number,
  time: number
) => {
  if (combo >= 3) {
    const glowColor = getComboColor(combo);
    const pulseIntensity = 10 + Math.sin(time * 0.01) * 5;
    const glowAlpha = Math.min(0.3 + combo * 0.05, 0.7);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = pulseIntensity + combo * 2;
    ctx.globalAlpha = glowAlpha;

    // Draw glow layer (silhouette)
    drawCharacterSilhouette(ctx, character);

    ctx.restore();
  }

  // Draw normal character on top
  drawCharacter(ctx, character);
};
```

### Arm Swing Sound

```javascript
const createArmSwingSound = (audioContext: AudioContext, isLeftArm: boolean) => {
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.08, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = isLeftArm ? 800 : 900; // Slight variation
  filter.Q.value = 1;

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

  noise.connect(filter).connect(gain).connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.08);
};
```

### Character Celebration Animation

```javascript
const triggerCharacterCelebration = (character: Character) => {
  // Both arms up
  character.leftArmTarget = -Math.PI / 2;
  character.rightArmTarget = -Math.PI / 2;

  // Bounce
  const bounceTimeline = [
    { time: 0, bodySquash: 0.8 },
    { time: 100, bodySquash: 1.2 },
    { time: 200, bodySquash: 0.9 },
    { time: 300, bodySquash: 1.1 },
    { time: 400, bodySquash: 1.0 },
  ];

  bounceTimeline.forEach(({ time, bodySquash }) => {
    setTimeout(() => {
      character.bodySquash = bodySquash;
    }, time);
  });

  // Happy expression
  setCharacterExpression(character, 'happy', 1500);

  // Reset arms
  setTimeout(() => {
    character.leftArmTarget = 0;
    character.rightArmTarget = 0;
  }, 800);
};
```

---

## Near-Miss & Close Call Feedback

**New section from Brick Breaker learnings.**

### Why Near-Misses Matter

Research shows near-misses create strong engagement:
- Activates "almost had it" psychology
- Motivates retry behavior
- Creates memorable moments
- Builds tension

### Detecting Near-Misses

```javascript
const checkNearMiss = (projectile, target) => {
  // Projectile passed target Y but was within range horizontally
  if (projectile.y > target.y && projectile.y < target.y + 30) {
    const distanceFromTarget = Math.min(
      Math.abs(projectile.x - target.x),
      Math.abs(projectile.x - (target.x + target.width))
    );

    if (distanceFromTarget < 20) {
      triggerNearMissFeedback(projectile.x);
      return true;
    }
  }
  return false;
};
```

### Near-Miss Feedback

```javascript
const triggerNearMissFeedback = (x) => {
  // Haptic: Ultra-light warning tap
  haptics.ultraLight(); // 5ms

  // Visual: Brief warning indicator
  nearMissEffect = { x, alpha: 1 };

  // Sound: Optional subtle "whoosh" or nothing
  // (Don't make it too punishing)
};

const drawNearMissEffect = (ctx, targetY) => {
  if (!nearMissEffect) return;

  ctx.save();
  ctx.globalAlpha = nearMissEffect.alpha;
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(nearMissEffect.x, targetY - 20);
  ctx.lineTo(nearMissEffect.x, targetY + 30);
  ctx.stroke();

  ctx.restore();

  nearMissEffect.alpha -= 0.05;
  if (nearMissEffect.alpha <= 0) nearMissEffect = null;
};
```

---

## Timer & Urgency Systems

### Why Timers Work

Research shows time pressure:
- Increases player engagement and flow states
- Creates memorable emotional peaks
- Makes victories feel more triumphant
- Adds challenge without changing mechanics

### Urgency Level Design

Implement 4-5 distinct urgency levels:

| Level | Trigger | Visual | Audio | Haptic |
|-------|---------|--------|-------|--------|
| **Normal** | >50% time | Default colors | Normal music | None |
| **Warning** | ≤50% time | Yellow tint | Music intensity +1 | None |
| **Urgent** | ≤25% time | Orange tint, subtle pulse | Warning beep, music +2 | Light pulse on threshold |
| **Critical** | ≤10 seconds | Red, faster pulse | Ticking, urgent beeps | Pulse every 2s |
| **Countdown** | ≤5 seconds | Dark red, flash | Escalating beeps | Pulse every 1s |

### Timer Sound Escalation

```
50% threshold: Single tone (volume 0.4, pitch 1.0)
25% threshold: Double tone (volume 0.5, pitch 1.2)
10 seconds: Warning + tick every 1000ms
5-1 seconds:
  - 5s: volume 0.3, pitch 1.0
  - 4s: volume 0.35, pitch 1.05
  - 3s: volume 0.4, pitch 1.10
  - 2s: volume 0.45, pitch 1.15
  - 1s: volume 0.5, pitch 1.25
```

### Visual Timer Treatments

- **Progress bar:** Fill or drain with color gradient (green→yellow→orange→red)
- **Glow effect:** Intensifies with urgency
- **Pulse animation:** Speed increases with urgency
- **Number color:** Changes through urgency levels
- **Container effects:** Border glow, vignette in danger zone

### Psychological Considerations

- **Don't make timers too tight** — Frustration kills engagement
- **Provide "almost made it" feedback** — "You were 2 seconds away!" softens failure
- **Consider "time bonuses"** — Reward efficiency, don't just punish slowness
- **Dynamic difficulty** — If player struggles, subtly add time; if dominating, subtly reduce

---

## Scoring & Progression

### Scoring Psychology

1. **Big numbers feel better** — 1000 points feels better than 10 points
2. **Show the math** — Display bonuses separately before combining
3. **Animate score changes** — Count up, don't just set
4. **Celebrate milestones** — Special feedback at round numbers
5. **Show multipliers** — Make combo/streak bonuses visible

### Score Display Animation

```javascript
function animateScore(from, to, duration = 500) {
  const start = performance.now();
  const diff = to - from;

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out

    scoreDisplay.textContent = Math.floor(from + diff * eased);

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
```

### Score Popup with Multiplier

```javascript
const showScorePopup = (x, y, baseScore, multiplier) => {
  const text = multiplier > 1
    ? `+${baseScore * multiplier} (x${multiplier})`
    : `+${baseScore}`;

  const color = multiplier >= 2 ? '#ffd700' : multiplier > 1 ? '#ffaa00' : '#ffffff';

  scorePopups.push({
    x, y, text, color,
    alpha: 1,
    vy: -2,
  });
};
```

### Progression Feedback

| Event | Feedback |
|-------|----------|
| Points earned | Floating score popup, flies to total |
| Bonus earned | Distinct color, larger popup |
| Multiplier up | Flash, sound escalation |
| Level up | Full-screen celebration, pause for effect |
| New high score | Special animation, badge/icon |

---

## Feedback Timing

### Response Time Targets

| Interaction | Target Response |
|-------------|-----------------|
| Button/tap visual | <16ms (1 frame) |
| Sound playback | <50ms |
| Haptic trigger | <30ms |
| Animation start | <100ms |
| State change | <200ms |

### The 100-300-1000 Rule

- **<100ms:** Feels instant, direct manipulation
- **100-300ms:** Noticeable but acceptable
- **>300ms:** Needs loading indicator or animation to feel intentional
- **>1000ms:** User thinks something is broken

### Debounce vs. Buffer

**Debounce:** Prevent rapid repeated inputs (good for buttons)
```javascript
let lastClick = 0;
function handleClick() {
  if (Date.now() - lastClick < 100) return;
  lastClick = Date.now();
  // ... handle click
}
```

**Buffer:** Queue inputs during busy states (good for fast gameplay)
```javascript
let queuedInput = null;
function handleInput(input) {
  if (isBusy) {
    queuedInput = input;
    return;
  }
  processInput(input);
}

function onBusyComplete() {
  if (queuedInput) {
    processInput(queuedInput);
    queuedInput = null;
  }
}
```

---

## Reaction Time Games

**New section from Color Reaction learnings.**

### Principle: Milliseconds Matter

In reaction-time games, feedback must be instant and differentiated by performance:
1. **Response time <100ms feels instant** — This is your target
2. **Audio processes faster than visual** — Prioritize audio for critical feedback
3. **Reaction ratings need distinct feedback** — PERFECT ≠ GREAT ≠ GOOD
4. **Near-misses need acknowledgment** — "TOO SLOW!" motivates retry

### Reaction Time Rating System

Define clear thresholds with escalating rewards:

```javascript
const REACTION_RATINGS = [
  { name: 'PERFECT', maxTime: 300, points: 100, celebration: 'maximum' },
  { name: 'GREAT', maxTime: 500, points: 75, celebration: 'high' },
  { name: 'GOOD', maxTime: 800, points: 50, celebration: 'medium' },
  { name: 'OK', maxTime: 1500, points: 25, celebration: 'low' },
];

const getReactionRating = (reactionTimeMs: number) => {
  return REACTION_RATINGS.find(r => reactionTimeMs <= r.maxTime)
    || { name: 'MISS', points: 0, celebration: 'none' };
};
```

### Reaction-Based Sound Variation

Faster reactions = higher pitch, richer sound:

```javascript
const playReactionSound = (audioContext: AudioContext, reactionTimeMs: number) => {
  const rating = getReactionRating(reactionTimeMs);

  // Base frequency increases with better performance
  const baseFreq = rating.name === 'PERFECT' ? 880
    : rating.name === 'GREAT' ? 784
    : rating.name === 'GOOD' ? 698
    : 523;

  // Layer count increases with performance
  const layers = rating.name === 'PERFECT' ? 4
    : rating.name === 'GREAT' ? 3
    : rating.name === 'GOOD' ? 2
    : 1;

  // Play layered sound
  for (let i = 0; i < layers; i++) {
    const freq = baseFreq * (1 + i * 0.5); // Harmonics
    const delay = i * 0.03;
    const volume = 0.3 - i * 0.05;

    playNote(audioContext, freq, delay, 0.15, volume);
  }

  // Add shimmer for PERFECT
  if (rating.name === 'PERFECT') {
    playShimmerEffect(audioContext);
  }
};
```

### Reaction-Based Haptic Patterns

```javascript
const REACTION_HAPTICS = {
  PERFECT: [15, 20, 12, 20, 10, 20, 8], // Celebratory escalating burst
  GREAT: [15, 25, 12, 25, 10],          // Triple celebration
  GOOD: [15, 30, 12],                   // Double pulse
  OK: [15],                             // Single pulse
  MISS: [8, 80, 8],                     // Gentle error
};

const triggerReactionHaptic = (rating: string) => {
  const pattern = REACTION_HAPTICS[rating];
  if (pattern) vibrate(pattern);
};
```

### Reaction Time Display

Show the exact milliseconds with rating-appropriate styling:

```javascript
const showReactionTime = (ms: number, rating: string) => {
  const colors = {
    PERFECT: '#ffd700', // Gold
    GREAT: '#00ff88',   // Green
    GOOD: '#3b82f6',    // Blue
    OK: '#ffffff',      // White
  };

  const sizes = {
    PERFECT: '48px',
    GREAT: '36px',
    GOOD: '28px',
    OK: '24px',
  };

  // Animate in with bounce for PERFECT/GREAT
  const animation = rating === 'PERFECT' || rating === 'GREAT'
    ? 'bounce-in 0.3s ease-out'
    : 'fade-in 0.2s ease-out';

  return {
    text: `${ms}ms`,
    color: colors[rating],
    fontSize: sizes[rating],
    animation,
  };
};
```

### Near-Miss Detection (Too Slow)

Detect taps that were close but just outside the window:

```javascript
const NEAR_MISS_WINDOW = 200; // ms after deadline

const checkNearMiss = (tapTime: number, deadlineTime: number): boolean => {
  const timePastDeadline = tapTime - deadlineTime;

  if (timePastDeadline > 0 && timePastDeadline <= NEAR_MISS_WINDOW) {
    // Show "TOO SLOW!" with timing info
    showNearMissCallout(timePastDeadline);

    // Sympathetic haptic (softer than wrong)
    vibrate([5, 40, 5]);

    // Descending sympathetic sound
    playNearMissSound();

    return true;
  }
  return false;
};

const showNearMissCallout = (msPastDeadline: number) => {
  // Messages rotate for variety
  const messages = [
    `TOO SLOW! (${msPastDeadline}ms late)`,
    `ALMOST! Just ${msPastDeadline}ms too slow`,
    `SO CLOSE! ${msPastDeadline}ms over`,
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];
  showCallout(message, '#ff6b6b', 1500);
};
```

---

## Time Dilation & Slow Motion

**New section from Color Reaction + Citrus Drop learnings.**

### Freeze Frames / Hitstop (NEW - Citrus Drop)

**Source:** Citrus Drop research + fighting game analysis (January 2026)

Hitstop (brief pause at impact) makes collisions feel powerful. The game freezes characters/objects while effects continue.

#### Tier-Based Freeze Duration

| Event Size | Freeze Duration | Notes |
|------------|-----------------|-------|
| Small impact | 30-50ms | Barely noticeable, snappy |
| Medium impact | 50-80ms | Subtle pause |
| Large impact | 80-120ms | Noticeable weight |
| Massive impact | 120-200ms | Dramatic moment |
| Maximum (melon) | 150-200ms | Full drama |

#### Implementation

```javascript
let isFrozen = false;
let freezeEndTime = 0;

const freezeFrame = (duration: number) => {
  isFrozen = true;
  freezeEndTime = Date.now() + duration;
};

// In game loop
const update = (deltaTime: number) => {
  if (isFrozen) {
    if (Date.now() >= freezeEndTime) {
      isFrozen = false;
    } else {
      // IMPORTANT: Still update particles and effects during freeze
      updateParticles(particles, deltaTime);
      updateScreenEffects(deltaTime);
      return; // Skip physics update
    }
  }

  // Normal physics/game update
  Matter.Engine.update(engine, deltaTime);
};
```

#### Key Principle: Effects Continue During Freeze
- Particles keep animating
- Screen shake continues
- Flash effects progress
- Only game physics pauses

This creates the "time stopped but impact reverberates" feeling.

### Principle: Slow Motion Rewards Mastery

Time dilation (brief slow-motion effect) makes perfect moments feel epic:
- Creates "time standing still" feeling
- Gives player time to appreciate their achievement
- Makes the moment memorable and shareable
- Increases perceived skill validation

### When to Use Time Dilation

| Event | Duration | Use |
|-------|----------|-----|
| PERFECT reaction | 300-400ms | Yes - maximum reward |
| Critical hit | 200-300ms | Yes - moment of impact |
| Boss defeat | 500ms+ | Yes - climactic moment |
| Regular success | - | No - overuse kills impact |
| Combo milestone (10+) | 250ms | Yes - achievement moment |

### Time Dilation Implementation

```javascript
interface TimeDilation {
  active: boolean;
  startTime: number;
  duration: number;
  factor: number; // 0.2 = 20% speed
}

const timeDilationRef = useRef<TimeDilation | null>(null);

const triggerTimeDilation = (duration = 400, factor = 0.2) => {
  timeDilationRef.current = {
    active: true,
    startTime: performance.now(),
    duration,
    factor,
  };

  // Ethereal slow-mo sound
  playTimeDilationSound();
};

const getTimeScale = (currentTime: number): number => {
  const dilation = timeDilationRef.current;
  if (!dilation || !dilation.active) return 1;

  const elapsed = currentTime - dilation.startTime;

  if (elapsed >= dilation.duration) {
    timeDilationRef.current = null;
    return 1;
  }

  // Smooth ease-in-out of slow motion
  const progress = elapsed / dilation.duration;

  if (progress < 0.2) {
    // Entering slow motion (ease into slow)
    const enterProgress = progress / 0.2;
    return 1 - (1 - dilation.factor) * enterProgress;
  } else if (progress > 0.8) {
    // Exiting slow motion (ease back to normal)
    const exitProgress = (progress - 0.8) / 0.2;
    return dilation.factor + (1 - dilation.factor) * exitProgress;
  }

  // Full slow motion
  return dilation.factor;
};

// In game loop
const gameLoop = (timestamp: number) => {
  const timeScale = getTimeScale(timestamp);
  const deltaTime = (timestamp - lastTimestamp) * timeScale;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
};
```

### Time Dilation Visual Effects

```javascript
const drawTimeDilationEffect = (ctx: CanvasRenderingContext2D, timeScale: number) => {
  if (timeScale >= 1) return;

  // Golden vignette
  const alpha = (1 - timeScale) * 0.3;
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, 0,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, `rgba(255, 215, 0, ${alpha})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Motion blur effect (draw previous positions with fade)
  if (motionTrail.length > 0) {
    motionTrail.forEach((pos, i) => {
      ctx.globalAlpha = (i / motionTrail.length) * 0.3;
      drawObjectAt(ctx, pos);
    });
    ctx.globalAlpha = 1;
  }
};
```

### Time Dilation Sound

```javascript
const createTimeDilationSound = (audioContext: AudioContext) => {
  // Ethereal whoosh with reverb feel
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);

  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 5;

  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  osc.connect(filter).connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.4);

  // Add shimmer layer
  for (let i = 0; i < 3; i++) {
    const shimmer = audioContext.createOscillator();
    const shimmerGain = audioContext.createGain();

    shimmer.type = 'sine';
    shimmer.frequency.value = 1000 + i * 200 + Math.random() * 100;

    shimmerGain.gain.setValueAtTime(0.05, audioContext.currentTime + i * 0.05);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3 + i * 0.05);

    shimmer.connect(shimmerGain).connect(audioContext.destination);
    shimmer.start(audioContext.currentTime + i * 0.05);
    shimmer.stop(audioContext.currentTime + 0.3 + i * 0.05);
  }
};
```

---

## Countdown Urgency Systems

**New section from Color Reaction learnings.**

### Principle: Multi-Phase Urgency Escalation

For time-limited windows (like reaction windows), urgency should escalate:
1. **Visual changes** — Color, pulse speed, effects
2. **Audio changes** — Ticking, heartbeat, pitch increase
3. **Haptic changes** — Pulses become more frequent

### Urgency Phase Definition

```javascript
interface UrgencyPhase {
  name: string;
  threshold: number; // ms remaining
  ringColor: string;
  pulseSpeed: number; // ms per pulse (0 = no pulse)
  tickSound: boolean;
  heartbeat: boolean;
  shake: boolean;
  vignetteAlpha: number;
}

const URGENCY_PHASES: UrgencyPhase[] = [
  { name: 'normal', threshold: 1500, ringColor: '#2ecc71', pulseSpeed: 0,
    tickSound: false, heartbeat: false, shake: false, vignetteAlpha: 0 },
  { name: 'warning', threshold: 750, ringColor: '#f1c40f', pulseSpeed: 400,
    tickSound: false, heartbeat: false, shake: false, vignetteAlpha: 0.05 },
  { name: 'critical', threshold: 300, ringColor: '#e74c3c', pulseSpeed: 150,
    tickSound: true, heartbeat: true, shake: true, vignetteAlpha: 0.15 },
];

const getCurrentUrgencyPhase = (remainingMs: number): UrgencyPhase => {
  for (const phase of URGENCY_PHASES) {
    if (remainingMs <= phase.threshold) {
      return phase;
    }
  }
  return URGENCY_PHASES[0];
};
```

### Ring/Border Color Transition

```javascript
const drawUrgencyRing = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  remainingMs: number,
  totalMs: number,
  time: number
) => {
  const phase = getCurrentUrgencyPhase(remainingMs);

  // Progress arc
  const progress = remainingMs / totalMs;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (1 - progress) * Math.PI * 2;

  // Pulse scale
  let pulseScale = 1;
  if (phase.pulseSpeed > 0) {
    pulseScale = 1 + Math.sin(time / phase.pulseSpeed * Math.PI * 2) * 0.05;
  }

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(pulseScale, pulseScale);

  // Ring glow
  ctx.shadowColor = phase.ringColor;
  ctx.shadowBlur = 10 + (phase.name === 'critical' ? Math.sin(time * 0.02) * 5 : 0);

  // Draw ring
  ctx.strokeStyle = phase.ringColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, endAngle);
  ctx.stroke();

  ctx.restore();

  // Shake in critical
  if (phase.shake) {
    const shakeIntensity = 2;
    return {
      offsetX: (Math.random() - 0.5) * shakeIntensity,
      offsetY: (Math.random() - 0.5) * shakeIntensity,
    };
  }

  return { offsetX: 0, offsetY: 0 };
};
```

### Countdown Sound System

```javascript
const useCountdownSounds = (audioContext: AudioContext) => {
  const lastTickRef = useRef<number>(0);
  const heartbeatRef = useRef<OscillatorNode | null>(null);

  const playTick = (remainingMs: number) => {
    const phase = getCurrentUrgencyPhase(remainingMs);

    // Tick in critical phase (final 500ms)
    if (remainingMs <= 500 && remainingMs > 0) {
      const now = performance.now();
      if (now - lastTickRef.current > 100) { // Max 10 ticks/sec
        const pitch = 1 + (500 - remainingMs) / 500 * 0.3; // Pitch rises as time runs out
        playTickSound(audioContext, pitch);
        lastTickRef.current = now;
      }
    }

    // Heartbeat in critical phase (final 300ms)
    if (phase.heartbeat && !heartbeatRef.current) {
      heartbeatRef.current = startHeartbeat(audioContext);
    } else if (!phase.heartbeat && heartbeatRef.current) {
      stopHeartbeat(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  return { playTick };
};

const playTickSound = (audioContext: AudioContext, pitch: number) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 800 * pitch;

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.05);
};

const startHeartbeat = (audioContext: AudioContext): OscillatorNode => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  // Low heartbeat thump
  osc.type = 'sine';
  osc.frequency.value = 60;

  // LFO for pulsing
  lfo.frequency.value = 1.5; // 90 BPM
  lfoGain.gain.value = 0.1;

  lfo.connect(lfoGain).connect(gain.gain);
  osc.connect(gain).connect(audioContext.destination);

  gain.gain.value = 0.15;

  lfo.start();
  osc.start();

  return osc;
};

const stopHeartbeat = (osc: OscillatorNode) => {
  osc.stop();
};
```

### Urgency Haptic Patterns

```javascript
const useUrgencyHaptics = () => {
  const lastHapticRef = useRef<number>(0);

  const triggerUrgencyHaptic = (remainingMs: number) => {
    const now = performance.now();

    // Warning threshold (750ms)
    if (remainingMs <= 750 && remainingMs > 300) {
      if (now - lastHapticRef.current > 500) {
        vibrate([8, 50, 8]); // Double tap
        lastHapticRef.current = now;
      }
    }

    // Critical threshold (300ms)
    if (remainingMs <= 300 && remainingMs > 0) {
      if (now - lastHapticRef.current > 150) {
        vibrate([8, 30, 8, 30, 8]); // Rapid triple
        lastHapticRef.current = now;
      }
    }
  };

  return { triggerUrgencyHaptic };
};
```

### "TAP NOW!" Text Urgency

```javascript
const drawUrgencyText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  remainingMs: number,
  time: number
) => {
  const phase = getCurrentUrgencyPhase(remainingMs);

  // Text pulses in warning/critical
  let scale = 1;
  let alpha = 1;

  if (phase.name === 'warning') {
    scale = 1 + Math.sin(time * 0.01) * 0.05;
    alpha = 0.8 + Math.sin(time * 0.015) * 0.2;
  } else if (phase.name === 'critical') {
    scale = 1 + Math.sin(time * 0.03) * 0.1;
    alpha = 0.7 + Math.sin(time * 0.04) * 0.3;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  ctx.fillStyle = phase.ringColor;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add glow in critical
  if (phase.name === 'critical') {
    ctx.shadowColor = phase.ringColor;
    ctx.shadowBlur = 10;
  }

  ctx.fillText('TAP NOW!', 0, 0);

  // Show remaining ms in critical
  if (remainingMs <= 500 && remainingMs > 0) {
    ctx.font = '16px monospace';
    ctx.fillText(`${Math.ceil(remainingMs)}ms`, 0, 30);
  }

  ctx.restore();
};
```

### Urgency Vignette

```javascript
const drawUrgencyVignette = (
  ctx: CanvasRenderingContext2D,
  remainingMs: number,
  time: number
) => {
  const phase = getCurrentUrgencyPhase(remainingMs);

  if (phase.vignetteAlpha <= 0) return;

  // Pulse the vignette in critical
  let alpha = phase.vignetteAlpha;
  if (phase.name === 'critical') {
    alpha += Math.sin(time * 0.02) * 0.05;
  }

  const gradient = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.3,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
  );

  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, `rgba(255, 0, 0, ${alpha})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};
```

---

## Fever Mode & Bonus States

**New section from Color Reaction learnings.**

### Principle: Reward Sustained Excellence with Special States

When players achieve sustained success (high combos, long streaks), reward them with a distinct "bonus state" that feels like entering a special mode. This gives players a clear goal to chase.

### When to Trigger Fever Mode

| Game Type | Trigger | Duration |
|-----------|---------|----------|
| Reaction games | 15+ streak | Until miss |
| Combo games | 10+ combo | Until combo breaks |
| Survival games | 60s+ survival | Time-limited (15s) |
| Score games | Score milestone | Until next milestone or fail |

### Fever Mode Components

Every fever/bonus state should include:

1. **Visual Transformation**
   - Background color shift (often warm/fire colors)
   - Particle effects (embers, sparkles, energy)
   - Enhanced glow on player/active elements
   - Pulsing vignette

2. **Audio Layer**
   - Distinct ambient loop (driving bass, energy hum)
   - Enhanced sound effects (louder, richer)
   - Optional: Music layer change

3. **Gameplay Reward**
   - Score multiplier (typically 2x)
   - Enhanced effects (1.5x particle count, shake intensity)
   - Visual multiplier display (large, prominent)

4. **Entry Celebration**
   - Dramatic announcement ("FEVER MODE!")
   - Screen flash + shake
   - Confetti burst
   - Ascending fanfare sound

5. **Exit Feedback**
   - Clear "fever ended" indication
   - Descending sound
   - Effects fade out (not instant cut)

### Fever Mode Implementation

```typescript
interface FeverState {
  active: boolean;
  startTime: number;
  multiplier: number;
  intensity: number; // 0-1, grows with continued success
}

const FEVER_CONFIG = {
  activationThreshold: 15,  // Streak/combo needed
  scoreMultiplier: 2,
  effectScale: 1.5,         // Multiply particle counts, shake intensity
};

const [feverState, setFeverState] = useState<FeverState>({
  active: false,
  startTime: 0,
  multiplier: 1,
  intensity: 0,
});

const activateFeverMode = () => {
  setFeverState({
    active: true,
    startTime: performance.now(),
    multiplier: FEVER_CONFIG.scoreMultiplier,
    intensity: 0.5,
  });

  // Entry effects
  showCallout('🔥 FEVER MODE! 🔥');
  triggerScreenShake(200);
  triggerConfetti();
  triggerScreenFlash('#ffd700', 0.4);
  playFeverActivationSound();
  vibrate([20, 30, 15, 30, 12, 30, 10, 30, 8]);
};

const deactivateFeverMode = () => {
  setFeverState({ active: false, startTime: 0, multiplier: 1, intensity: 0 });
  showCallout('FEVER ENDED');
  playFeverEndSound();
  stopFeverAudioLoop();
};
```

### Fever Mode Visual CSS

```css
.game-container.fever-mode {
  animation: fever-background 1s ease-in-out infinite;
}

.game-container.fever-mode::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 100, 0, 0.1) 0%,
    rgba(255, 50, 0, 0.2) 100%
  );
  animation: fever-pulse 500ms ease-in-out infinite;
  pointer-events: none;
}

@keyframes fever-background {
  0%, 100% { background-color: #1a0505; }
  50% { background-color: #2a0808; }
}

/* Rising ember particles */
.fever-ember {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6b00;
  border-radius: 50%;
  box-shadow: 0 0 10px #ff6b00;
  animation: ember-rise 2s linear infinite;
}

@keyframes ember-rise {
  0% { transform: translateY(100vh) scale(1); opacity: 1; }
  100% { transform: translateY(-20vh) scale(0); opacity: 0; }
}
```

### Fever Multiplier Display

```css
.fever-multiplier {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: multiplier-pulse 300ms ease-in-out infinite;
}

.multiplier-value {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow:
    0 0 20px #ff6b00,
    0 0 40px #ff4500,
    0 0 60px #ff0000;
}

@keyframes multiplier-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}
```

---

## Camera Effects

**New section from Color Reaction learnings.**

### Principle: Camera Movement Adds Physicality

Camera effects (zoom, shake, pan) make on-screen events feel like they have physical weight. They're a core juice technique often overlooked in web games.

### Camera Zoom Pulse

Brief zoom on impactful moments, then ease back:

```typescript
const [cameraZoom, setCameraZoom] = useState(1);

const triggerCameraZoom = (intensity: number = 1.05, duration: number = 200) => {
  setCameraZoom(intensity);
  setTimeout(() => setCameraZoom(1), duration);
};

// Scale intensity by event importance
const ZOOM_INTENSITIES = {
  tap: 1.02,
  success: 1.04,
  great: 1.06,
  perfect: 1.08,
  milestone: 1.10,
};
```

```css
.game-container {
  transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center center;
}
```

### Touch Point Ripple

Ripple effect at the actual touch location reinforces input-output connection:

```typescript
interface TouchRipple {
  id: string;
  x: number;
  y: number;
  color: string;
}

const createTouchRipple = (event: TouchEvent | MouseEvent, color: string) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = 'touches' in event
    ? event.touches[0].clientX - rect.left
    : event.clientX - rect.left;
  const y = 'touches' in event
    ? event.touches[0].clientY - rect.top
    : event.clientY - rect.top;

  const id = `ripple-${Date.now()}`;
  addRipple({ id, x, y, color });
  setTimeout(() => removeRipple(id), 600);
};
```

```css
.touch-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: ripple-expand 600ms ease-out forwards;
}

@keyframes ripple-expand {
  0% { width: 20px; height: 20px; opacity: 0.6; }
  100% { width: 150px; height: 150px; opacity: 0; }
}
```

### Hit-Stop (Frame Freeze)

Brief pause on impact makes hits feel powerful. Scale duration by importance:

```typescript
const HIT_STOP_DURATIONS = {
  light: 15,    // ms
  medium: 30,
  heavy: 50,
  perfect: 60,
  massive: 100,
};

const [hitStop, setHitStop] = useState(false);

const triggerHitStop = (intensity: keyof typeof HIT_STOP_DURATIONS) => {
  const duration = HIT_STOP_DURATIONS[intensity];
  setHitStop(true);
  setTimeout(() => setHitStop(false), duration);
};
```

```css
/* Pause all animations during hit-stop */
.hit-stop-active * {
  animation-play-state: paused !important;
}

/* Slight brightness boost during freeze */
.hit-stop-active .game-container {
  filter: brightness(1.2) contrast(1.1);
}
```

### When to Use Camera Effects

| Event | Zoom | Ripple | Hit-Stop |
|-------|------|--------|----------|
| Any tap/click | ✗ | ✓ | ✗ |
| Successful action | 1.04x | ✓ | 15ms |
| Great performance | 1.06x | ✓ | 30ms |
| Perfect performance | 1.08x | ✓ | 60ms |
| Combo milestone | 1.10x | ✓ | 50ms |
| Big destruction | 1.06x | ✗ | 50ms |
| Level complete | 1.10x | ✗ | 100ms |

---

## Viral & Share Mechanics

**New section from Color Reaction learnings.**

### Principle: Without Sharing, There's No Viral Loop

Research shows viral mobile games MUST have frictionless sharing. Players who share:
- Return 2.3x more often
- Have 40% higher lifetime value
- Bring in new players organically

### Share Image Generator

Create branded, shareable images with game stats:

```typescript
interface GameStats {
  score: number;
  maxStreak: number;
  bestTime?: number;
  perfectCount?: number;
}

const generateShareImage = async (stats: GameStats): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Game title with branding
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎮 GAME NAME', 300, 50);

  // Score (large and prominent)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(stats.score.toLocaleString(), 300, 140);
  ctx.font = '20px Arial';
  ctx.fillText('POINTS', 300, 170);

  // Stats row
  const statsY = 220;
  ctx.font = '16px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText('Best Streak', 100, statsY);
  ctx.fillText('Best Time', 300, statsY);
  ctx.fillText('Perfects', 500, statsY);

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`🔥 ${stats.maxStreak}`, 100, statsY + 35);
  ctx.fillText(`⚡ ${stats.bestTime}ms`, 300, statsY + 35);
  ctx.fillText(`🌟 ${stats.perfectCount}`, 500, statsY + 35);

  // Branding
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  ctx.fillText('Play at wojak.ink', 300, 370);

  return canvas.toDataURL('image/png');
};
```

### Share Button with Web Share API

```typescript
const handleShare = async (stats: GameStats) => {
  const imageUrl = await generateShareImage(stats);

  // Try native share first (mobile)
  if (navigator.share) {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], 'game-score.png', { type: 'image/png' });
      await navigator.share({
        title: `I scored ${stats.score} points!`,
        text: `Best streak: ${stats.maxStreak} 🔥`,
        files: [file],
      });
      return;
    } catch (e) {
      // Fall through to download
    }
  }

  // Fallback: download image
  const link = document.createElement('a');
  link.download = 'game-score.png';
  link.href = imageUrl;
  link.click();
};
```

### Challenge Mode (Friend Challenges)

Let players challenge friends with shareable links:

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
  return `${window.location.origin}/game?challenge=${encoded}`;
};

// On game load, check for challenge
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get('challenge');

  if (challengeParam) {
    try {
      const challenge: Challenge = JSON.parse(atob(challengeParam));
      setActiveChallenge(challenge);
    } catch (e) {
      console.error('Invalid challenge');
    }
  }
}, []);
```

### Challenge Mode UI

```typescript
// During gameplay, show challenge target
{activeChallenge && (
  <div className="challenge-banner">
    <span>Beat {activeChallenge.creatorName}'s {activeChallenge.targetScore} pts!</span>
    <div className="challenge-progress">
      <div
        className="challenge-fill"
        style={{ width: `${Math.min(100, (score / activeChallenge.targetScore) * 100)}%` }}
      />
    </div>
  </div>
)}
```

### Share Button Placement

- **Game Over Screen:** Primary placement, large button
- **Pause Menu:** Secondary placement
- **After Milestone:** Prompt to share (non-blocking)
- **Challenge Win:** Automatic prompt with "Share your victory!"

### What Makes Shares Effective

1. **Visual Appeal:** Branded, colorful, readable at small sizes
2. **Clear Achievement:** Score/stat prominently displayed
3. **Call to Action:** "Play at [url]" visible
4. **Emotional Hook:** Emojis, celebration imagery
5. **Challenge Element:** "Can you beat this?" implicit

---

## Signature Sound Design

**New section from Color Reaction learnings.**

### Principle: Every Viral Game Has an Iconic Sound

Think of Candy Crush's "Divine!", Wordle's success melody, or Flappy Bird's point sound. These sounds become synonymous with the game and trigger instant recognition.

### Creating a Signature Sound

Your signature sound should be:
- **Short** (100-300ms)
- **Distinctive** (not generic)
- **Pleasant** (players hear it hundreds of times)
- **Layered** (2-3 tones, not single note)
- **Ascending** (feels positive/rewarding)

### Two-Note Chime Pattern

The most effective pattern is a quick two-note ascending chime:

```typescript
const createSignatureSound = (audioContext: AudioContext) => {
  // Note 1: Lower tone
  const note1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  note1.type = 'sine';
  note1.frequency.value = 880; // A5
  gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.1);

  // Note 2: Higher tone (slightly delayed)
  const note2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  note2.type = 'sine';
  note2.frequency.value = 1318; // E6
  gain2.gain.setValueAtTime(0, audioContext.currentTime);
  gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

  // Shimmer layer (octave up, quiet)
  const shimmer = audioContext.createOscillator();
  const shimmerGain = audioContext.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.value = 2636; // E7
  shimmerGain.gain.setValueAtTime(0.1, audioContext.currentTime + 0.08);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  // Connect and play
  note1.connect(gain1).connect(audioContext.destination);
  note2.connect(gain2).connect(audioContext.destination);
  shimmer.connect(shimmerGain).connect(audioContext.destination);

  note1.start();
  note2.start(audioContext.currentTime + 0.08);
  shimmer.start(audioContext.currentTime + 0.08);

  note1.stop(audioContext.currentTime + 0.15);
  note2.stop(audioContext.currentTime + 0.3);
  shimmer.stop(audioContext.currentTime + 0.25);
};
```

### When to Play Signature Sound

Use your signature sound sparingly for maximum impact:
- ✅ Main success action (match, score, collect)
- ✅ Perfect/excellent performance
- ❌ Every tap (too frequent)
- ❌ Failures (should feel distinct)
- ❌ UI interactions (reserve for gameplay)

### Sound Branding Across Games

For Wojak.ink, consider a consistent audio identity:
- **Same signature chime** in all games (brand recognition)
- **Game-specific variations** (different keys/instruments)
- **Consistent volume levels** across all games
- **Shared sound library** for common actions (button clicks, errors)

---

## Tile & Grid Game Juice

**New section from 2048 Merge learnings.**

### Principle: Merge Games Need Progressive Feedback

In tile/merge games, the feedback should escalate with tile value. Higher-value merges feel more impactful.

### Ascending Pitch Sound System

Each tile value should have a progressively higher pitch:

```typescript
const MERGE_SOUND_CONFIG: Record<number, { pitch: number; volume: number; layers: number }> = {
  4:    { pitch: 0.8,  volume: 0.4, layers: 1 },  // Low, simple
  8:    { pitch: 0.85, volume: 0.45, layers: 1 },
  16:   { pitch: 0.9,  volume: 0.5, layers: 1 },
  32:   { pitch: 0.95, volume: 0.55, layers: 1 },
  64:   { pitch: 1.0,  volume: 0.6, layers: 1 },
  128:  { pitch: 1.05, volume: 0.65, layers: 2 }, // Add sparkle layer
  256:  { pitch: 1.1,  volume: 0.7, layers: 2 },
  512:  { pitch: 1.15, volume: 0.75, layers: 3 }, // Add bass hit
  1024: { pitch: 1.2,  volume: 0.8, layers: 3 },
  2048: { pitch: 1.3,  volume: 1.0, layers: 4 },  // Full celebration
};

const playMergeSound = (resultValue: number) => {
  const config = MERGE_SOUND_CONFIG[resultValue];

  // Base merge sound with pitch variation
  playWithPitch('merge_pop', config.pitch, config.volume);

  // Add sparkle layer for 128+
  if (config.layers >= 2) {
    setTimeout(() => playWithPitch('sparkle', config.pitch * 1.2, 0.3), 30);
  }

  // Add bass hit for 512+
  if (config.layers >= 3) {
    playWithPitch('bass_hit', config.pitch * 0.5, 0.4);
  }
};
```

### Progressive Haptic Intensity

Haptic feedback should scale logarithmically with tile value:

```typescript
const HAPTIC_CONFIG: Record<number, number[]> = {
  4:    [12],                           // Single light tap
  8:    [15],
  16:   [18],
  32:   [20],
  64:   [22],
  128:  [25],
  256:  [15, 20, 25],                   // Double tap
  512:  [20, 15, 25, 15, 30],           // Triple tap
  1024: [25, 20, 30, 20, 35],
  2048: [30, 20, 35, 20, 40, 20, 50],   // Celebration pattern
};

const triggerMergeHaptic = (resultValue: number) => {
  const pattern = HAPTIC_CONFIG[resultValue] || [20];
  navigator.vibrate?.(pattern);
};
```

### Grid Danger State System

When the grid is almost full, create escalating tension:

```typescript
type DangerLevel = 'safe' | 'warning' | 'critical' | 'imminent';

const DANGER_THRESHOLDS = {
  warning: 4,   // 4 or fewer empty cells
  critical: 2,  // 2 or fewer empty cells
  imminent: 1,  // Only 1 empty cell
};

// Visual effects per danger level
const DANGER_VISUALS = {
  warning: {
    glowColor: 'rgba(255, 165, 0, 0.3)',
    pulseSpeed: 1.5, // seconds
  },
  critical: {
    glowColor: 'rgba(255, 100, 0, 0.4)',
    pulseSpeed: 1.0,
  },
  imminent: {
    glowColor: 'rgba(255, 50, 0, 0.5)',
    pulseSpeed: 0.5,
  },
};
```

### Empty Cell Highlighting

In danger states, highlight available spaces:

```css
.grid-cell.cell-highlighted {
  background: rgba(255, 215, 0, 0.3);
  animation: cellGlow 1s ease-in-out infinite;
}

@keyframes cellGlow {
  0%, 100% { background: rgba(255, 215, 0, 0.2); }
  50% { background: rgba(255, 215, 0, 0.4); }
}
```

### Tile Squash & Stretch

Apply squash/stretch based on movement direction:

```css
/* Stretch in direction of movement */
.tile-moving-left,
.tile-moving-right {
  transform: scaleX(1.15) scaleY(0.9);
}

.tile-moving-up,
.tile-moving-down {
  transform: scaleX(0.9) scaleY(1.15);
}

/* Squash on merge impact */
.tile-merged {
  animation: squashMerge 200ms ease-out;
}

@keyframes squashMerge {
  0% { transform: scale(0.8, 1.2); }
  40% { transform: scale(1.25, 0.85); }
  70% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}
```

---

## Character Personality on Objects

**New section from 2048 Merge learnings (inspired by Threes!).**

### Principle: Faces Create Emotional Attachment

Adding simple faces to game objects transforms abstract elements into characters players care about.

> "The tile faces in Threes! 'make the game feel like something special - like playing with characters instead of just moving numbers around the board.'" - Threes! Analysis

### Face Configuration System

```typescript
interface ObjectFace {
  eyes: string;      // Character eyes
  mouth: string;     // Character mouth
  expression: 'happy' | 'excited' | 'worried' | 'sleepy' | 'shocked';
  extras?: string;   // Additional features (sparkles, crown, etc.)
}

// Example for a progression system (cards, tiles, etc.)
const OBJECT_FACES: Record<number, ObjectFace> = {
  1:  { eyes: '• •', mouth: '‿', expression: 'sleepy' },     // Basic
  2:  { eyes: '◦ ◦', mouth: '‿', expression: 'happy' },      // Awakening
  3:  { eyes: '° °', mouth: '◡', expression: 'happy' },      // Content
  4:  { eyes: '◉ ◉', mouth: '◡', expression: 'happy' },      // Alert
  5:  { eyes: '◉ ◉', mouth: '▽', expression: 'excited' },    // Excited
  6:  { eyes: '★ ★', mouth: '▽', expression: 'excited' },    // Starry
  7:  { eyes: '✧ ✧', mouth: '◇', expression: 'excited', extras: '✨' }, // Sparkly
  8:  { eyes: '☀ ☀', mouth: '◇', expression: 'excited', extras: '👑' }, // Crowned
};
```

### Context-Reactive Faces

Faces should react to game state:

```typescript
const ObjectFaceRenderer: React.FC<{
  value: number;
  isNearMatch: boolean;  // Adjacent to a matching piece
  isDanger: boolean;     // Game in danger state
}> = ({ value, isNearMatch, isDanger }) => {
  const face = OBJECT_FACES[value];

  // Modify expression based on context
  let currentExpression = face.expression;
  if (isDanger) currentExpression = 'worried';
  if (isNearMatch) currentExpression = 'excited';

  return (
    <div className={`object-face face-${currentExpression}`}>
      <span className="face-eyes">{face.eyes}</span>
      <span className="face-mouth">{face.mouth}</span>
      {face.extras && <span className="face-extras">{face.extras}</span>}
    </div>
  );
};
```

### Face Animation CSS

```css
.object-face {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.4em;
  opacity: 0.9;
}

/* Expression animations */
.face-excited .face-eyes {
  animation: bounce 0.5s ease-in-out infinite;
}

.face-worried .face-eyes {
  animation: shake 0.3s ease-in-out infinite;
}

.face-sleepy {
  opacity: 0.6;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

/* New object "hello" animation */
.object-new .object-face {
  animation: hello 0.4s ease-out;
}

@keyframes hello {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

### Unlockable Character Bios

Track and reward discovery:

```typescript
const OBJECT_BIOS: Record<number, { name: string; bio: string }> = {
  1: { name: 'Seed', bio: 'A tiny beginning, full of potential!' },
  2: { name: 'Sprout', bio: 'Just waking up to the world.' },
  // ... etc
};

// Track unlocked bios
const [unlockedBios, setUnlockedBios] = useState<Set<number>>(() => {
  const saved = localStorage.getItem('game-unlocked-bios');
  return saved ? new Set(JSON.parse(saved)) : new Set([1, 2]);
});

const unlockBio = (value: number) => {
  setUnlockedBios(prev => {
    const newSet = new Set(prev);
    newSet.add(value);
    localStorage.setItem('game-unlocked-bios', JSON.stringify([...newSet]));
    return newSet;
  });
};
```

---

## Next Item Preview Systems

**New section from 2048 Merge learnings (inspired by Threes!).**

### Principle: Preview Adds Strategy and Reduces Frustration

Showing upcoming items transforms random-feeling games into strategic experiences.

> "The 'peek' mechanic in Threes! shows what's coming next, adding strategy and anticipation. Players can plan one move ahead." - Threes! Analysis

### Queue-Based Preview System

```typescript
const [nextItemQueue, setNextItemQueue] = useState<number[]>([]);

// Generate next random item
const generateNextItem = (): number => {
  // Game-specific logic (e.g., 90% chance of 2, 10% chance of 4)
  return Math.random() < 0.9 ? 2 : 4;
};

// Initialize queue
const initQueue = () => {
  setNextItemQueue([generateNextItem(), generateNextItem()]);
};

// Use queue when spawning
const spawnFromQueue = (): number => {
  const nextValue = nextItemQueue[0];
  setNextItemQueue(prev => [...prev.slice(1), generateNextItem()]);
  return nextValue;
};
```

### Preview UI Component

```typescript
const NextItemPreview: React.FC<{ queue: number[] }> = ({ queue }) => (
  <div className="next-preview">
    <span className="preview-label">NEXT</span>
    <div className="preview-items">
      {queue.map((value, i) => (
        <div
          key={i}
          className={`preview-item preview-item-${i}`}
          style={getItemStyle(value)}
        >
          <ObjectFace value={value} />
          <span className="preview-value">{value}</span>
        </div>
      ))}
    </div>
  </div>
);
```

### Preview CSS

```css
.next-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.preview-label {
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  opacity: 0.7;
}

.preview-items {
  display: flex;
  gap: 4px;
}

.preview-item {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  animation: previewPop 200ms ease-out;
}

/* Secondary item is smaller and faded */
.preview-item-1 {
  opacity: 0.5;
  transform: scale(0.8);
}

@keyframes previewPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Direction-Based Spawn Preview

For games where spawn location matters:

```typescript
// Show which edge the item will spawn from
const SpawnDirectionIndicator: React.FC<{ direction: Direction }> = ({ direction }) => {
  const arrowMap = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  };

  return (
    <div className="spawn-indicator">
      <span className="spawn-arrow">{arrowMap[direction]}</span>
      <span className="spawn-label">Spawns from {direction}</span>
    </div>
  );
};
```

### Move Preview (Peek Before Commit)

Allow players to see result before committing:

```typescript
const [previewState, setPreviewState] = useState<{
  active: boolean;
  direction: Direction | null;
  resultState: GameState;
} | null>(null);

// Show preview on touch-hold
const showMovePreview = (direction: Direction) => {
  const simulatedResult = simulateMove(currentState, direction);
  setPreviewState({ active: true, direction, resultState: simulatedResult });
};

// Hide preview on release (and optionally execute)
const hideMovePreview = (shouldExecute: boolean) => {
  if (shouldExecute && previewState) {
    executeMove(previewState.direction);
  }
  setPreviewState(null);
};
```

### Preview Overlay Rendering

```typescript
{previewState?.active && (
  <div className="move-preview-overlay">
    {previewState.resultState.items.map(item => (
      <div
        key={item.id}
        className="preview-ghost"
        style={getPositionStyle(item)}
      >
        {item.value}
      </div>
    ))}
  </div>
)}
```

```css
.move-preview-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.preview-ghost {
  position: absolute;
  opacity: 0.5;
  border: 2px dashed rgba(255,255,255,0.5);
}
```

---

## Drag & Drop Juice

**New section from Block Puzzle learnings.**

### Principle: Dragging Should Feel Premium

When players drag objects, provide continuous feedback through trails, glow effects, and magnetic snapping.

### Particle Trail System

```typescript
interface TrailParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
}

const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
const lastTrailPosRef = useRef({ x: 0, y: 0 });

// Emit particle every 25px of movement
const emitTrailParticle = (x: number, y: number, color: string) => {
  const dx = x - lastTrailPosRef.current.x;
  const dy = y - lastTrailPosRef.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 25) {
    lastTrailPosRef.current = { x, y };
    setTrailParticles(prev => [...prev, {
      id: Date.now(),
      x, y,
      size: 8 + Math.random() * 4,
      color,
      alpha: 0.6,
    }]);
  }
};
```

### Trail Particle CSS

```css
.trail-particle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  filter: blur(2px);
  pointer-events: none;
}
```

### Magnetic Snap Feedback

```typescript
const SNAP_RADIUS = 0.25; // 25% of cell width

const calculateSnapPosition = (rawX: number, rawY: number) => {
  const snapX = Math.round(rawX / cellSize) * cellSize;
  const snapY = Math.round(rawY / cellSize) * cellSize;

  const distX = Math.abs(rawX - snapX);
  const distY = Math.abs(rawY - snapY);

  // If within snap radius, snap to grid
  if (distX < cellSize * SNAP_RADIUS && distY < cellSize * SNAP_RADIUS) {
    return { x: snapX, y: snapY, snapped: true };
  }

  return { x: rawX, y: rawY, snapped: false };
};

// Haptic feedback on snap
if (newSnapped && !prevSnapped) {
  navigator.vibrate?.(10);
}
```

### Dragged Object Glow

```css
.dragged-object {
  filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.5));
  animation: dragGlow 1s ease-in-out infinite;
}

@keyframes dragGlow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.8)); }
}
```

### Touch Offset for Mobile

```typescript
// Offset piece above finger so player can see it
const TOUCH_OFFSET_Y = -60; // 60px above touch point

const handleTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0];
  setDragPosition({
    x: touch.clientX,
    y: touch.clientY + TOUCH_OFFSET_Y, // Offset above finger
  });
};
```

---

## Line Clear & Cascade Systems

**New section from Block Puzzle learnings.**

### Principle: Line Clears Should Feel EXPLOSIVE

Multi-line clears deserve massive feedback: freeze frame, shockwave, particles bursting outward.

### Freeze Frame by Clear Count

```typescript
const FREEZE_DURATIONS = {
  1: 0,      // No freeze for single
  2: 40,     // Brief pause for double
  3: 60,     // Longer for triple
  4: 100,    // Maximum for quad+
};

const triggerFreezeFrame = (duration: number) => {
  setFreezeFrame(true);
  setTimeout(() => setFreezeFrame(false), duration);
};
```

### Shockwave Effect

```css
.line-clear-shockwave {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 200, 0, 0.8);
  background: radial-gradient(circle, rgba(255, 200, 0, 0.3) 0%, transparent 70%);
  pointer-events: none;
  animation: shockwaveExpand 400ms ease-out forwards;
}

@keyframes shockwaveExpand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
```

### Staggered Cell Clear Animation

```typescript
// Clear cells with staggered delay for wave effect
cells.forEach((cell, index) => {
  setTimeout(() => {
    markCellAsClearing(cell);
    createParticleBurst(cell.x, cell.y, cell.color);
  }, index * 30); // 30ms stagger per cell
});
```

### Clear Cell CSS with Flash

```css
.cell-clearing {
  animation: cellClearFlash 500ms ease-out forwards;
}

@keyframes cellClearFlash {
  0% { filter: brightness(1); transform: scale(1); }
  15% { filter: brightness(2.5); background: white !important; transform: scale(1.1); }
  30% { filter: brightness(1.5); transform: scale(1.2); }
  100% { filter: brightness(0); transform: scale(0) rotate(180deg); opacity: 0; }
}
```

### Screen Shake by Line Count

```typescript
const SHAKE_CONFIG = {
  1: { intensity: 3, duration: 150 },
  2: { intensity: 5, duration: 200 },
  3: { intensity: 8, duration: 300 },
  4: { intensity: 12, duration: 400 },
};
```

### Perfect Clear Detection

```typescript
// Massive celebration when grid is completely empty
const checkPerfectClear = (grid: Grid): boolean => {
  return grid.every(row => row.every(cell => !cell.filled));
};

if (checkPerfectClear(newGrid)) {
  triggerPerfectClear(); // Massive confetti, fanfare, bonus points
}
```

---

## Musical Combo Escalation

**New section from Block Puzzle learnings.**

### Principle: Combos Should Create Melodies

Each consecutive combo plays the next note in a musical scale, creating satisfying melodies during hot streaks.

> "For merge sequences, sounds go UP in pitch on the scale. This makes long combo chains feel super satisfying." - Tetris Effect

### Musical Scale Configuration

```typescript
// C Major scale frequencies
const COMBO_SCALE_FREQUENCIES = [
  261.63, // C4 - Do (combo 1)
  293.66, // D4 - Re (combo 2)
  329.63, // E4 - Mi (combo 3)
  349.23, // F4 - Fa (combo 4)
  392.00, // G4 - Sol (combo 5+)
];

const playComboNote = (comboLevel: number) => {
  const noteIndex = Math.min(comboLevel - 1, 4);
  const frequency = COMBO_SCALE_FREQUENCIES[noteIndex];

  const audioContext = new AudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.frequency.value = frequency;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.5, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);
};
```

### Layered Sound by Combo Level

```typescript
const COMBO_SOUND_CONFIG = {
  1: { layers: 1 },           // Base note only
  2: { layers: 1 },           // Base note only
  3: { layers: 2 },           // Add sparkle layer
  4: { layers: 2 },           // Add sparkle layer
  5: { layers: 3 },           // Add bass hit
};

const playComboSound = (combo: number) => {
  const config = COMBO_SOUND_CONFIG[Math.min(combo, 5)];

  playComboNote(combo);

  if (config.layers >= 2) {
    playSparkleSound();
  }

  if (config.layers >= 3) {
    playBassHit();
  }
};
```

### Combo Timeout Bar

```typescript
const ComboTimeoutBar: React.FC<{ lastTime: number; timeout: number }> = ({
  lastTime, timeout
}) => {
  const [remaining, setRemaining] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastTime;
      setRemaining(Math.max(0, 100 - (elapsed / timeout) * 100));
    }, 16);
    return () => clearInterval(interval);
  }, [lastTime, timeout]);

  return (
    <div className="combo-timeout-bar">
      <div className="fill" style={{ width: `${remaining}%` }} />
    </div>
  );
};
```

### Combo Break Feedback

```typescript
const playComboBreak = (lostCombo: number) => {
  if (lostCombo >= 3) {
    // Descending "womp womp" sound
    playWithPitch('combo_break', 0.8, 0.4);

    // Brief red vignette flash
    triggerVignetteFlash('#ff0000', 0.2);
  }
};
```

---

## Squash & Stretch Animation

**New section from Flappy Orange learnings.**

### Principle: Deformation Creates Life

Squash and stretch is the #1 animation principle for making game characters feel alive and weighty. When objects deform on impact and return to shape, they feel organic rather than rigid.

### Character Deformation Config

```typescript
interface DeformationConfig {
  scaleX: number;
  scaleY: number;
  duration: number;      // Time to reach deformation
  returnDuration: number; // Time to return to normal
}

const DEFORMATION_CONFIGS = {
  // On upward action (jump, flap, bounce up)
  UPWARD: {
    scaleX: 0.85,      // Compress horizontally
    scaleY: 1.3,       // Stretch vertically
    duration: 80,
    returnDuration: 150
  },
  // At apex of movement
  APEX: {
    scaleX: 1.1,       // Slightly wider
    scaleY: 0.9,       // Slightly shorter
    duration: 100,
    returnDuration: 100
  },
  // On downward impact
  IMPACT: {
    scaleX: 1.4,       // Very wide
    scaleY: 0.6,       // Very short
    duration: 60,
    returnDuration: 200
  }
};
```

### Canvas Implementation

```typescript
const drawDeformedCharacter = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-x, -y);

  // Draw character at original position
  drawCharacter(ctx, x, y);

  ctx.restore();
};

// Apply deformation with easing
const applyDeformation = (config: DeformationConfig) => {
  characterRef.current.scaleX = config.scaleX;
  characterRef.current.scaleY = config.scaleY;

  setTimeout(() => {
    animateToValue(characterRef.current, 'scaleX', 1.0, config.returnDuration, 'easeOut');
    animateToValue(characterRef.current, 'scaleY', 1.0, config.returnDuration, 'easeOut');
  }, config.duration);
};
```

### Timing Guidelines

| Event | Stretch/Squash | Duration | Return |
|-------|----------------|----------|--------|
| Jump/Flap | Tall & thin (0.85x, 1.3y) | 80ms | 150ms |
| Apex | Wide & short (1.1x, 0.9y) | 100ms | 100ms |
| Land/Impact | Very wide (1.4x, 0.6y) | 60ms | 200ms |
| Bounce | Alternating | 60ms each | 100ms |

### Key Principles

1. **Volume preservation**: When squashing, the object should appear to maintain the same volume (wider = shorter)
2. **Speed indicates weight**: Faster return = lighter object, slower return = heavier
3. **Anticipation**: Slight squash before a jump makes the action feel more powerful
4. **Follow-through**: Overshoot slightly past normal before settling

---

## Death Sequence Design

**New section from Flappy Orange learnings.**

### Principle: Death Should Feel Impactful, Not Frustrating

A well-designed death sequence creates the "I know exactly what I did wrong" moment that drives the "one more try" loop.

### The Golden Death Formula

```
FREEZE FRAME (150ms) → SLOW-MO (400ms at 0.3x) → NORMAL SPEED → GAME OVER
```

### Freeze Frame Implementation

```typescript
const FREEZE_CONFIG = {
  duration: 150,        // 150ms pause
  shakeIntensity: 6,    // Screen shake intensity
  shakeDuration: 200    // Shake continues into slow-mo
};

const triggerDeathFreeze = () => {
  gameStateRef.current.isFrozen = true;

  // Effects trigger during freeze
  triggerScreenShake(FREEZE_CONFIG.shakeIntensity, FREEZE_CONFIG.shakeDuration);
  spawnDeathParticles(character.x, character.y);
  triggerImpactFlash(0.6);

  setTimeout(() => {
    gameStateRef.current.isFrozen = false;
    startSlowMotionDeath();
  }, FREEZE_CONFIG.duration);
};

// In game loop - skip physics when frozen
if (gameStateRef.current.isFrozen) {
  renderFrame(); // Still render, just don't update physics
  return;
}
```

### Slow-Motion Death

```typescript
const SLOW_MO_CONFIG = {
  timeScale: 0.3,           // 30% speed
  duration: 400,            // 400ms of slow-mo
  tumbleSpeed: 720,         // Degrees per second (at normal speed)
  knockbackForce: 3         // Sideways push
};

const startSlowMotionDeath = () => {
  gameStateRef.current.timeScale = SLOW_MO_CONFIG.timeScale;

  // Character tumbles
  character.rotationVelocity = SLOW_MO_CONFIG.tumbleSpeed;
  character.velocityX = -SLOW_MO_CONFIG.knockbackForce; // Knocked back

  // Apply squash deformation
  applyDeformation(DEFORMATION_CONFIGS.IMPACT);

  setTimeout(() => {
    gameStateRef.current.timeScale = 1.0;
    showGameOverScreen();
  }, SLOW_MO_CONFIG.duration);
};

// Apply timeScale to physics
const deltaTime = 1 * gameStateRef.current.timeScale;
character.velocity += GRAVITY * deltaTime;
character.y += character.velocity * deltaTime;
character.rotation += character.rotationVelocity * deltaTime * (Math.PI / 180);
```

### Death Particle Explosion

```typescript
const spawnDeathParticles = (x: number, y: number) => {
  const particles: Particle[] = [];
  const count = 25 + Math.floor(Math.random() * 10); // 25-35 particles

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const speed = 3 + Math.random() * 4;

    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      alpha: 1,
      color: Math.random() > 0.3 ? characterColor : '#ffffff',
      gravity: 0.1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  return particles;
};
```

### Impact Flash

```typescript
const triggerImpactFlash = (intensity: number = 0.6) => {
  setImpactFlashAlpha(intensity);

  const decay = () => {
    setImpactFlashAlpha(prev => {
      if (prev <= 0.05) return 0;
      return prev * 0.85; // Exponential decay
    });
    if (impactFlashAlpha > 0.05) requestAnimationFrame(decay);
  };

  requestAnimationFrame(decay);
};

// Render white overlay
if (impactFlashAlpha > 0) {
  ctx.fillStyle = `rgba(255, 255, 255, ${impactFlashAlpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

### Chromatic Aberration (Optional Premium Effect)

```typescript
// CSS-based approach (performant)
.chromatic-aberration {
  animation: chromaticFlash 200ms ease-out;
}

@keyframes chromaticFlash {
  0% { filter: drop-shadow(-3px 0 0 red) drop-shadow(3px 0 0 cyan); }
  100% { filter: none; }
}
```

### Death Sound Design

- **Impact sound**: Low thud + high crack (layered)
- **Timing**: Plays at freeze frame start
- **Volume**: Loud but not jarring
- **No music cut**: Let music fade naturally

---

## Near-Miss Bonus Systems

**New section from Flappy Orange learnings.**

### Principle: Reward Risky Play

Near-miss systems detect when players barely succeed and reward them with bonus points and feedback. This creates tension and encourages skillful play.

### Detection Algorithm

```typescript
interface NearMissResult {
  isNearMiss: boolean;
  intensity: number;     // 0-1, closer = higher
  edge: 'top' | 'bottom' | 'left' | 'right' | 'both' | null;
}

const NEAR_MISS_CONFIG = {
  threshold: 0.25,       // Within 25% of danger zone
  bonusPoints: [1, 2, 3], // Points by intensity tier
  callouts: ['close!', 'CLOSE!', 'INSANE!']
};

const checkNearMiss = (
  playerPosition: number,
  safeZoneStart: number,
  safeZoneEnd: number
): NearMissResult => {
  const safeZoneSize = safeZoneEnd - safeZoneStart;
  const threshold = safeZoneSize * NEAR_MISS_CONFIG.threshold;

  const distFromStart = playerPosition - safeZoneStart;
  const distFromEnd = safeZoneEnd - playerPosition;

  let isNearMiss = false;
  let intensity = 0;
  let edge: NearMissResult['edge'] = null;

  if (distFromStart < threshold && distFromStart > 0) {
    isNearMiss = true;
    intensity = 1 - (distFromStart / threshold);
    edge = 'top';
  }

  if (distFromEnd < threshold && distFromEnd > 0) {
    const endIntensity = 1 - (distFromEnd / threshold);
    if (endIntensity > intensity) {
      intensity = endIntensity;
      edge = edge ? 'both' : 'bottom';
    }
  }

  return { isNearMiss, intensity, edge };
};
```

### Bonus Points Calculation

```typescript
const calculateNearMissBonus = (intensity: number): number => {
  if (intensity > 0.8) return 3; // "INSANE!" tier
  if (intensity > 0.5) return 2; // "CLOSE!" tier
  if (intensity > 0.2) return 1; // "close!" tier
  return 0;
};
```

### Visual Feedback

```typescript
const triggerNearMissVisuals = (intensity: number) => {
  // Yellow screen flash
  setNearMissFlashAlpha(intensity * 0.3);

  // Particles at danger edge
  spawnNearMissParticles(intensity);

  // Callout text
  const tier = intensity > 0.8 ? 2 : intensity > 0.5 ? 1 : 0;
  showFloatingText(NEAR_MISS_CONFIG.callouts[tier], '#ffdd00');

  // Screen border pulse
  triggerBorderPulse('#ffdd00', intensity * 0.5);
};
```

### Near-Miss Audio

```typescript
const playNearMissSound = (intensity: number) => {
  // Rising tone - pitch scales with intensity
  const baseFreq = 400;
  const freqBoost = intensity * 200;

  const osc = audioContext.createOscillator();
  osc.frequency.value = baseFreq + freqBoost;
  osc.type = 'triangle';

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.2 * intensity, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);
};
```

### Haptic Pattern

```typescript
const NEAR_MISS_HAPTIC = [5, 5, 5, 5, 5]; // Rapid flutter

const triggerNearMissHaptic = (intensity: number) => {
  if ('vibrate' in navigator) {
    // More intense = more pulses
    const pulseCount = Math.ceil(intensity * 5);
    const pattern = Array(pulseCount * 2 - 1).fill(5);
    navigator.vibrate(pattern);
  }
};
```

### Integration Example

```typescript
// On successful obstacle pass
const handleObstaclePass = (player: Player, obstacle: Obstacle) => {
  const nearMiss = checkNearMiss(player.y, obstacle.gapStart, obstacle.gapEnd);

  let points = 1; // Base point

  if (nearMiss.isNearMiss) {
    const bonus = calculateNearMissBonus(nearMiss.intensity);
    points += bonus;

    if (bonus > 0) {
      triggerNearMissVisuals(nearMiss.intensity);
      playNearMissSound(nearMiss.intensity);
      triggerNearMissHaptic(nearMiss.intensity);

      showFloatingText(`+${bonus}`, player.x, player.y - 40, '#ffdd00');
    }
  }

  addScore(points);
};
```

### Design Considerations

1. **Don't punish safe play**: Base points should still feel rewarding
2. **Make it opt-in**: Players naturally take more risks as they improve
3. **Clear feedback**: Players must understand WHY they got bonus points
4. **Diminishing returns**: Avoid making risky play the ONLY viable strategy

---

## Accessibility Considerations

### Required Toggles

Every game must have toggles for:
- [ ] **Screen shake** — Can cause motion sickness
- [ ] **Haptic feedback** — Some users find it annoying or overwhelming
- [ ] **Sound effects** — Separate from music toggle
- [ ] **Background music** — Separate from SFX toggle
- [ ] **Flash effects** — Can trigger photosensitive reactions
- [ ] **Reduced motion** — Respect system preferences

### Accessibility Best Practices

1. **Never rely solely on color** — Use icons, patterns, or labels too
2. **Provide visual alternatives to audio cues** — Flash or icon for warnings
3. **Provide audio alternatives to visual cues** — For visually impaired users
4. **Haptics as supplementary** — Never the only feedback channel
5. **Respect prefers-reduced-motion** — Check and respond to system setting

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Testing Checklist

- [ ] Play with sound off — Is it still playable?
- [ ] Play with screen shake off — Is it still satisfying?
- [ ] Test with reduced motion preference
- [ ] Test with high contrast mode
- [ ] Test with screen reader

---

## NFT Integration Opportunities

### Showcase Your Collection

Your games feature 4,200 unique Wojak NFTs. Don't just use them as textures—make them characters:

1. **Display NFT metadata on interaction**
   - Show NFT name when matched/selected
   - Show rarity tier with special effects
   - Display trait information briefly

2. **Rarity-based bonuses**
   - Rare NFTs could give bonus points
   - Legendary NFTs could trigger special effects
   - Track which NFTs players interact with most

3. **Collection progress**
   - "You've seen 342/4200 Wojaks!"
   - "New Wojak discovered!" celebration
   - Post-game summary of NFTs encountered

4. **Trait-based gameplay**
   - Bonus for matching same-trait NFTs
   - Special rounds featuring specific bases
   - Themed events around NFT attributes

5. **Social/sharing features**
   - Generate shareable images with matched NFTs
   - "My best streak featured [NFT Name]!"
   - Collection highlights and favorites

---

## Implementation Checklist

### Before Launch

#### Sound
- [ ] Every tap/click has audio feedback
- [ ] Different collision types have distinct sounds
- [ ] Success sounds are satisfying and varied (3+ variations)
- [ ] Failure sounds are informative but not punishing
- [ ] Streak/combo sounds escalate appropriately
- [ ] Warning sounds grab attention without annoying
- [ ] Level complete has celebration audio
- [ ] Game over has appropriate closure sound
- [ ] Powerups have spawn, collect, and active sounds
- [ ] Sound toggle works and persists

#### Haptics
- [ ] Tap interactions have light haptic
- [ ] Different collision types have distinct haptics
- [ ] Success has medium haptic
- [ ] Failure has distinct error pattern
- [ ] Streaks have escalating haptics
- [ ] Critical warnings have haptic pulse
- [ ] Powerup collection has reward haptic
- [ ] Near-miss has ultra-light warning
- [ ] Haptic toggle works and persists

#### Visual
- [ ] Moving objects have squash/stretch
- [ ] Impacts have flash effect
- [ ] Destruction has shatter/particle burst
- [ ] Success has visual celebration (glow, particles, scale)
- [ ] Failure has visual feedback (shake, flash)
- [ ] Streaks have escalating visual effects
- [ ] Combo meter shows current streak
- [ ] Final targets are highlighted
- [ ] Powerups glow and pulse
- [ ] Active powerups show timer bars
- [ ] Timer has urgency color progression
- [ ] Score changes animate (count up)
- [ ] Screen shake is implemented with decay
- [ ] Freeze frames on big impacts
- [ ] All animations use proper easing (no linear)

#### Timing
- [ ] Input response feels instant (<100ms)
- [ ] Animations don't block input
- [ ] Input buffering prevents lost clicks during animations
- [ ] Debounce prevents accidental double-inputs

#### Accessibility
- [ ] Screen shake toggle
- [ ] Haptic toggle
- [ ] Sound/music separate toggles
- [ ] Respects prefers-reduced-motion
- [ ] Color is not sole indicator of state

#### Polish
- [ ] Anticipation states before completions
- [ ] Near-completion has special feedback
- [ ] Milestones have callouts
- [ ] Score popups show multipliers
- [ ] Level transitions are smooth
- [ ] Combo break has feedback

---

## Quick Reference Card

### Minimum Viable Juice

If you can only implement 5 things:

1. **Squash & stretch** — Objects compress on impact, stretch when fast
2. **Impact flash + sound** — Every collision has visual and audio feedback
3. **Score animation** — Count up, don't just set
4. **Combo escalation** — Visual, audio, haptic all increase with streak
5. **Anticipation states** — Highlight final targets, build tension

### Common Mistakes to Avoid

| Mistake | Why It's Bad | Fix |
|---------|--------------|-----|
| Linear easing | Feels robotic | Use ease-out, ease-in-out |
| Same sound every time | Causes fatigue | 3-4 variations per sound |
| Same feedback for all collisions | Loses meaning | Differentiate by type |
| Missing failure feedback | Feels broken | Add subtle sound + visual |
| Screen shake on everything | Causes nausea | Save for big moments only |
| Buzzy haptics | Feels cheap | Short, crisp pulses only |
| Audio/visual desync | Destroys immersion | Test timing carefully |
| No anticipation states | Endings feel abrupt | Add "almost there" feedback |
| No combo visualization | Players don't know streak | Add combo meter |
| Static powerups | Easy to miss | Add glow and pulse |

---

## Resources & References

### Game Feel / Juice
- [Juice It or Lose It - GDC Talk](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose)
- [Juice in Game Design - Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html)
- [Game Feel - Wikipedia](https://en.wikipedia.org/wiki/Game_feel)
- [Squeezing More Juice - GameAnalytics](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design)

### Animation Principles
- [Squash and Stretch - CG Wire](https://blog.cg-wire.com/squash-stretch-principle/)
- [12 Principles of Animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)

### Haptics
- [Android Haptics Design Principles](https://developer.android.com/develop/ui/views/haptics/haptics-principles)
- [Haptics Best Practices for Mobile - Interhaptics](https://medium.com/nerd-for-tech/haptics-for-mobile-the-best-practices-for-android-and-ios-d2aa72409bdd)

### Combo Systems
- [The Design of Combos and Chains - Game Developer](https://www.gamedeveloper.com/design/the-design-of-combos-and-chains)
- [Multiplier Systems in Gaming - ContestBeat](https://contestbeat.com/an-in-depth-guide-to-mastering-multiplier-systems-in-gaming)

### Psychology
- [Near-Miss Effect in Games](https://www.psychologyofgames.com/2016/09/the-near-miss-effect-and-game-rewards/)
- [Time Pressure as Video Game Design Element - ResearchGate](https://www.researchgate.net/publication/281637918_Time_Pressure_as_Video_Game_Design_Element_and_Basic_Need_Satisfaction)
- [Building Tension in Games - Gamigion](https://www.gamigion.com/use-of-tension-in-game-design/)

---

*This playbook should be referenced when polishing any Wojak.ink game. The goal is consistency across all 15 games while allowing each game's unique mechanics to shine.*

*Updated with learnings from: Memory Match, Brick Breaker, Orange Juggle, Color Reaction*
*Enhanced with 2026 research on viral mechanics, rhythm game psychology, and mobile game best practices*
