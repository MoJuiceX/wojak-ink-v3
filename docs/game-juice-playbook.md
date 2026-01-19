# Game Juice Playbook

> Universal engagement principles for all Wojak.ink games. Apply these learnings to create satisfying, addictive game experiences that feel polished and professional.

**Last Updated:** January 2025
**Applies To:** All 15 games in the Wojak.ink ecosystem
**Learnings From:** Memory Match, Brick Breaker, Orange Juggle

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
17. [Accessibility Considerations](#accessibility-considerations)
18. [NFT Integration Opportunities](#nft-integration-opportunities)
19. [Implementation Checklist](#implementation-checklist)

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

*Updated with learnings from: Memory Match, Brick Breaker, Orange Juggle*
