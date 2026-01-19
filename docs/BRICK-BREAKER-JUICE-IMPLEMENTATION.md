# Brick Breaker Juice Implementation Guide

> **For Claude CLI:** Implement each enhancement step-by-step in the order listed. Complete one enhancement fully (including testing) before moving to the next. Do not implement multiple enhancements simultaneously.

**Total Enhancements:** 45
**Game:** Brick Breaker (Wojak.ink)
**Priority:** Implement in order listed
**Reference:** See `docs/game-juice-playbook.md` for universal principles

---

## Pre-Implementation Setup

Before starting, locate and familiarize yourself with these files:
- Main game component (likely `BrickBreaker.tsx` or similar)
- Canvas rendering logic (game loop, draw functions)
- `useGameSounds` hook
- `useGameHaptics` hook
- `useGameEffects` hook
- Ball, Paddle, Brick classes/objects
- Powerup system
- Any existing sound assets in `/public/sounds/`

---

## SOUND DESIGN (Enhancements 1-14)

### Enhancement 1: Ball Launch Sound

**Goal:** Satisfying "whoosh" when ball is launched at game start or after losing a life.

**Sound Characteristics:**
- Duration: 150-200ms
- Type: Quick ascending "swoosh" or "ping"
- Volume: 0.4
- Conveys: Energy, momentum, beginning

**Implementation:**

```typescript
// In useGameSounds.ts
const playBallLaunch = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/ball_launch.mp3'],
    volume: 0.4,
    rate: 1.0 + (Math.random() * 0.1 - 0.05), // Slight variation
  });
  sound.play();
}, [soundEnabled]);
```

**Trigger:** When ball state changes from stationary to moving (game start, respawn).

---

### Enhancement 2: Paddle Hit Sound

**Goal:** Distinct "bounce" sound when ball hits paddle, different from wall/brick hits.

**Sound Characteristics:**
- Duration: 80-120ms
- Type: Solid "thwack" or "boing" - rubbery, elastic feel
- Volume: 0.45
- Pitch variation: Based on where ball hits paddle (edges = higher pitch)

**Implementation:**

```typescript
const playPaddleHit = useCallback((hitPosition: number) => {
  // hitPosition: 0 = left edge, 0.5 = center, 1 = right edge
  if (!soundEnabled) return;

  const basePitch = 1.0;
  const pitchVariation = Math.abs(hitPosition - 0.5) * 0.3; // ±15% at edges

  const sound = new Howl({
    src: ['/sounds/paddle_hit.mp3'],
    volume: 0.45,
    rate: basePitch + pitchVariation,
  });
  sound.play();
}, [soundEnabled]);
```

**Calculate hit position:**
```typescript
const hitPosition = (ball.x - paddle.x) / paddle.width;
playPaddleHit(hitPosition);
```

---

### Enhancement 3: Wall Hit Sound

**Goal:** Subtle "ping" when ball bounces off walls (left, right, top).

**Sound Characteristics:**
- Duration: 50-80ms
- Type: Clean, short ping or click
- Volume: 0.25 (quieter than paddle/brick - walls are passive)
- Distinct from other impacts

**Implementation:**

```typescript
const playWallHit = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/wall_ping.mp3'],
    volume: 0.25,
    rate: 0.95 + Math.random() * 0.1,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 4: Normal Brick Destruction Sound

**Goal:** Satisfying "crunch" or "pop" when normal (1-hit) bricks are destroyed.

**Sound Characteristics:**
- Duration: 100-150ms
- Type: Crisp breaking/popping sound
- Volume: 0.5
- Should feel rewarding

**Implementation:**

```typescript
const playBrickDestroy = useCallback((brickType: 'normal' | 'strong') => {
  if (!soundEnabled) return;

  const soundFile = brickType === 'strong'
    ? '/sounds/brick_strong_destroy.mp3'
    : '/sounds/brick_normal_destroy.mp3';

  const sound = new Howl({
    src: [soundFile],
    volume: brickType === 'strong' ? 0.55 : 0.5,
    rate: 0.95 + Math.random() * 0.1,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 5: Strong Brick Hit Sound (Damaged)

**Goal:** "Crack" sound when strong brick is hit but not destroyed (first hit).

**Sound Characteristics:**
- Duration: 100-120ms
- Type: Stone/concrete crack sound
- Volume: 0.45
- Conveys: Damage dealt, but not finished

**Implementation:**

```typescript
const playBrickCrack = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/brick_crack.mp3'],
    volume: 0.45,
    rate: 0.9 + Math.random() * 0.2,
  });
  sound.play();
}, [soundEnabled]);
```

**Usage:**
```typescript
if (brick.type === 'strong' && brick.hits === 1) {
  playBrickCrack(); // First hit - cracked
} else if (brick.hits >= brick.maxHits) {
  playBrickDestroy(brick.type); // Destroyed
}
```

---

### Enhancement 6: Strong Brick Destruction Sound

**Goal:** More substantial destruction sound for strong bricks (2-hit).

**Sound Characteristics:**
- Duration: 150-200ms
- Type: Heavier crumble/shatter - more bass
- Volume: 0.55
- Conveys: Greater reward for harder brick

**Implementation:** Already included in Enhancement 4 with `brickType === 'strong'` branch.

---

### Enhancement 7: Unbreakable Brick Deflect Sound

**Goal:** Distinct "clang" when ball hits unbreakable (gray) bricks.

**Sound Characteristics:**
- Duration: 80-100ms
- Type: Metallic clang or solid "thunk"
- Volume: 0.4
- Conveys: Solid, immovable obstacle

**Implementation:**

```typescript
const playUnbreakableHit = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/unbreakable_clang.mp3'],
    volume: 0.4,
    rate: 0.95 + Math.random() * 0.1,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 8: Powerup Spawn Sound

**Goal:** Magical/sparkle sound when powerup drops from destroyed brick.

**Sound Characteristics:**
- Duration: 200-300ms
- Type: Sparkle, chime, or magical "ding"
- Volume: 0.35
- Conveys: Something special is available

**Implementation:**

```typescript
const playPowerupSpawn = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/powerup_spawn.mp3'],
    volume: 0.35,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 9: Powerup Collection Sound (Type-Specific)

**Goal:** Different sounds for each powerup type to build recognition.

**Sound Characteristics:**
| Powerup | Sound Type | Duration | Character |
|---------|------------|----------|-----------|
| Expand (E) | Stretching/growing | 200ms | Elastic |
| Multiball (M) | Split/multiply | 250ms | Bubbly |
| Fireball (F) | Ignition/whoosh | 200ms | Fiery |
| Slow (S) | Deceleration | 300ms | Winding down |
| Extra Life (+) | Celebration | 300ms | Triumphant |

**Implementation:**

```typescript
const powerupSounds: Record<string, string> = {
  expand: '/sounds/powerup_expand.mp3',
  multiball: '/sounds/powerup_multiball.mp3',
  fireball: '/sounds/powerup_fireball.mp3',
  slow: '/sounds/powerup_slow.mp3',
  extraLife: '/sounds/powerup_life.mp3',
};

const playPowerupCollect = useCallback((type: string) => {
  if (!soundEnabled) return;

  const soundFile = powerupSounds[type] || '/sounds/powerup_generic.mp3';

  const sound = new Howl({
    src: [soundFile],
    volume: 0.5,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 10: Ball Lost Sound

**Goal:** Disappointing "womp" when ball falls off bottom (but not game over).

**Sound Characteristics:**
- Duration: 300-400ms
- Type: Descending tone, deflating
- Volume: 0.5
- Conveys: Setback, but not the end

**Implementation:**

```typescript
const playBallLost = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/ball_lost.mp3'],
    volume: 0.5,
  });
  sound.play();
}, [soundEnabled]);
```

---

### Enhancement 11: Combo Sound Escalation

**Goal:** Pitch and intensity escalate with combo count.

**Current:** `playCombo(count)` exists but needs enhancement.

**Sound Characteristics:**
| Combo | Pitch | Volume | Additional Layer |
|-------|-------|--------|------------------|
| 3 | 1.0 | 0.4 | Base combo chime |
| 4 | 1.1 | 0.45 | — |
| 5 | 1.2 | 0.5 | Add sparkle |
| 6-7 | 1.3 | 0.55 | — |
| 8-9 | 1.4 | 0.6 | Add bass hit |
| 10+ | 1.5 | 0.65 | Full celebration |

**Implementation:**

```typescript
const playComboSound = useCallback((combo: number) => {
  if (!soundEnabled || combo < 3) return;

  const pitch = Math.min(1.0 + (combo - 3) * 0.1, 1.5);
  const volume = Math.min(0.4 + (combo - 3) * 0.05, 0.65);

  const baseSound = new Howl({
    src: ['/sounds/combo_chime.mp3'],
    volume,
    rate: pitch,
  });
  baseSound.play();

  // Add sparkle layer at combo 5+
  if (combo >= 5) {
    setTimeout(() => {
      const sparkle = new Howl({
        src: ['/sounds/sparkle.mp3'],
        volume: 0.3,
      });
      sparkle.play();
    }, 50);
  }

  // Add bass hit at combo 8+
  if (combo >= 8) {
    const bass = new Howl({
      src: ['/sounds/bass_hit.mp3'],
      volume: 0.4,
    });
    bass.play();
  }
}, [soundEnabled]);
```

---

### Enhancement 12: Last Brick Anticipation Sound

**Goal:** Tension-building sound when only 1-3 breakable bricks remain.

**Sound Characteristics:**
- Type: Subtle sustained tone or heartbeat pulse
- Volume: 0.25 (background, not distracting)
- Fades in when few bricks remain, fades out on level complete

**Implementation:**

```typescript
const anticipationSoundRef = useRef<Howl | null>(null);

const startAnticipation = useCallback((bricksRemaining: number) => {
  if (!soundEnabled || anticipationSoundRef.current) return;

  if (bricksRemaining <= 3 && bricksRemaining > 0) {
    anticipationSoundRef.current = new Howl({
      src: ['/sounds/anticipation_loop.mp3'],
      volume: 0.25,
      loop: true,
    });
    anticipationSoundRef.current.play();
  }
}, [soundEnabled]);

const stopAnticipation = useCallback(() => {
  if (anticipationSoundRef.current) {
    anticipationSoundRef.current.fade(0.25, 0, 500);
    setTimeout(() => {
      anticipationSoundRef.current?.stop();
      anticipationSoundRef.current = null;
    }, 500);
  }
}, []);
```

---

### Enhancement 13: Fireball Mode Loop

**Goal:** Ambient "burning" sound while fireball powerup is active.

**Sound Characteristics:**
- Type: Crackling fire/energy loop
- Volume: 0.2 (background ambiance)
- Duration: Loops while active, fades out when expired

**Implementation:**

```typescript
const fireballLoopRef = useRef<Howl | null>(null);

const startFireballLoop = useCallback(() => {
  if (!soundEnabled || fireballLoopRef.current) return;

  fireballLoopRef.current = new Howl({
    src: ['/sounds/fireball_loop.mp3'],
    volume: 0,
    loop: true,
  });
  fireballLoopRef.current.play();
  fireballLoopRef.current.fade(0, 0.2, 300);
}, [soundEnabled]);

const stopFireballLoop = useCallback(() => {
  if (fireballLoopRef.current) {
    fireballLoopRef.current.fade(0.2, 0, 500);
    setTimeout(() => {
      fireballLoopRef.current?.stop();
      fireballLoopRef.current = null;
    }, 500);
  }
}, []);
```

---

### Enhancement 14: Sound Variations for Repeated Hits

**Goal:** 3-4 variations per sound to prevent audio fatigue.

**Implementation Pattern:**

```typescript
const brickDestroySounds = [
  '/sounds/brick_destroy_1.mp3',
  '/sounds/brick_destroy_2.mp3',
  '/sounds/brick_destroy_3.mp3',
  '/sounds/brick_destroy_4.mp3',
];

const getRandomSound = (sounds: string[]): string => {
  return sounds[Math.floor(Math.random() * sounds.length)];
};

const playBrickDestroy = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: [getRandomSound(brickDestroySounds)],
    volume: 0.5,
    rate: 0.95 + Math.random() * 0.1, // Additional pitch variation
  });
  sound.play();
}, [soundEnabled]);
```

**Apply to:**
- Brick destruction (normal)
- Brick destruction (strong)
- Paddle hits
- Wall hits

---

## HAPTIC FEEDBACK (Enhancements 15-24)

### Enhancement 15: Paddle Hit Haptic

**Goal:** Distinct haptic when ball hits paddle.

**Pattern:** Single medium pulse, 20ms

**Implementation:**

```typescript
const hapticPaddleHit = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(20);
}, [hapticsEnabled]);
```

---

### Enhancement 16: Normal Brick Haptic

**Goal:** Light tap when normal brick is destroyed.

**Pattern:** Single light pulse, 12ms

**Implementation:**

```typescript
const hapticBrickNormal = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(12);
}, [hapticsEnabled]);
```

---

### Enhancement 17: Strong Brick Crack Haptic

**Goal:** Medium tap when strong brick is damaged (cracked).

**Pattern:** Single pulse, 18ms

```typescript
const hapticBrickCrack = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(18);
}, [hapticsEnabled]);
```

---

### Enhancement 18: Strong Brick Destroy Haptic

**Goal:** Heavier feedback when strong brick is fully destroyed.

**Pattern:** Double pulse - 20ms, 30ms gap, 15ms

```typescript
const hapticBrickStrong = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate([20, 30, 15]);
}, [hapticsEnabled]);
```

---

### Enhancement 19: Unbreakable Brick Haptic

**Goal:** Solid "thud" feeling when hitting unbreakable brick.

**Pattern:** Single heavy pulse, 30ms

```typescript
const hapticUnbreakable = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(30);
}, [hapticsEnabled]);
```

---

### Enhancement 20: Powerup Collection Haptic

**Goal:** Rewarding buzz when collecting any powerup.

**Pattern:** Quick triple pulse - 10ms, 20ms gap, 8ms, 20ms gap, 6ms

```typescript
const hapticPowerupCollect = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate([10, 20, 8, 20, 6]);
}, [hapticsEnabled]);
```

---

### Enhancement 21: Ball Lost Haptic

**Goal:** Disappointing thud when ball falls off screen.

**Pattern:** Long single pulse, 50ms (feels like a "drop")

```typescript
const hapticBallLost = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(50);
}, [hapticsEnabled]);
```

---

### Enhancement 22: Combo Escalation Haptic

**Goal:** Haptic intensity increases with combo count.

**Pattern:**
- Combo 3-4: Single 15ms
- Combo 5-7: Double 15ms-20ms-10ms
- Combo 8-9: Triple 15ms-15ms-12ms-15ms-10ms
- Combo 10+: Quad burst

```typescript
const hapticCombo = useCallback((combo: number) => {
  if (!hapticsEnabled || !navigator.vibrate || combo < 3) return;

  if (combo >= 10) {
    navigator.vibrate([15, 15, 12, 15, 10, 15, 8]);
  } else if (combo >= 8) {
    navigator.vibrate([15, 15, 12, 15, 10]);
  } else if (combo >= 5) {
    navigator.vibrate([15, 20, 10]);
  } else {
    navigator.vibrate(15);
  }
}, [hapticsEnabled]);
```

---

### Enhancement 23: Near-Miss Haptic

**Goal:** Ultra-light "warning" tap when ball barely misses paddle (close call).

**Pattern:** Single 5ms (barely perceptible)

**Detection:** Ball passed paddle Y position but was within 20px horizontally of paddle edges.

```typescript
const hapticNearMiss = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate(5);
}, [hapticsEnabled]);

// Detection in game loop
const checkNearMiss = (ball: Ball, paddle: Paddle) => {
  if (ball.y > paddle.y && ball.y < paddle.y + 30) {
    const distanceFromPaddle = Math.min(
      Math.abs(ball.x - paddle.x),
      Math.abs(ball.x - (paddle.x + paddle.width))
    );
    if (distanceFromPaddle < 20) {
      hapticNearMiss();
      // Also trigger visual feedback (see Enhancement 35)
    }
  }
};
```

---

### Enhancement 24: Level Complete Haptic

**Goal:** Celebratory burst when level is completed.

**Pattern:** Success pattern - 25ms, 50ms gap, 20ms, 50ms gap, 15ms

```typescript
const hapticLevelComplete = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;
  navigator.vibrate([25, 50, 20, 50, 15]);
}, [hapticsEnabled]);
```

---

## VISUAL FEEDBACK / JUICE (Enhancements 25-38)

### Enhancement 25: Ball Squash on Impact

**Goal:** Ball visually squashes when hitting surfaces, stretches when moving fast.

**Implementation (Canvas):**

```typescript
interface Ball {
  // ... existing properties
  squashX: number; // 1.0 = normal
  squashY: number;
  squashRecovery: number; // How fast it returns to normal
}

// On any collision
const triggerBallSquash = (ball: Ball, isHorizontal: boolean) => {
  if (isHorizontal) {
    ball.squashX = 0.7;
    ball.squashY = 1.3;
  } else {
    ball.squashX = 1.3;
    ball.squashY = 0.7;
  }
};

// In game loop update
const updateBallSquash = (ball: Ball) => {
  const recovery = 0.15; // Per frame recovery
  ball.squashX += (1 - ball.squashX) * recovery;
  ball.squashY += (1 - ball.squashY) * recovery;
};

// In draw function
const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.scale(ball.squashX, ball.squashY);

  // Draw ball at origin (since we translated)
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 26: Paddle Squash on Ball Hit

**Goal:** Paddle visually compresses when ball bounces off it.

**Implementation:**

```typescript
interface Paddle {
  // ... existing properties
  squashY: number; // 1.0 = normal
}

const triggerPaddleSquash = (paddle: Paddle) => {
  paddle.squashY = 0.7; // Compress vertically
};

// In update loop
const updatePaddleSquash = (paddle: Paddle) => {
  paddle.squashY += (1 - paddle.squashY) * 0.2;
};

// In draw
const drawPaddle = (ctx: CanvasRenderingContext2D, paddle: Paddle) => {
  ctx.save();
  ctx.translate(paddle.x + paddle.width / 2, paddle.y + paddle.height / 2);
  ctx.scale(1, paddle.squashY);
  ctx.translate(-(paddle.x + paddle.width / 2), -(paddle.y + paddle.height / 2));

  // Draw paddle normally
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.restore();
};
```

---

### Enhancement 27: Ball Stretch Based on Velocity

**Goal:** Ball stretches in direction of movement when moving fast.

**Implementation:**

```typescript
const drawBallWithVelocityStretch = (
  ctx: CanvasRenderingContext2D,
  ball: Ball
) => {
  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  const stretchFactor = 1 + Math.min(speed / 20, 0.3); // Max 30% stretch
  const angle = Math.atan2(ball.vy, ball.vx);

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(angle);
  ctx.scale(stretchFactor, 1 / stretchFactor); // Stretch in direction, compress perpendicular

  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 28: Impact Flash on Collisions

**Goal:** Brief white flash at point of impact when ball hits anything.

**Implementation:**

```typescript
interface ImpactFlash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const impactFlashes: ImpactFlash[] = [];

const createImpactFlash = (x: number, y: number) => {
  impactFlashes.push({
    x,
    y,
    radius: 5,
    alpha: 1,
  });
};

// In update loop
const updateImpactFlashes = () => {
  for (let i = impactFlashes.length - 1; i >= 0; i--) {
    const flash = impactFlashes[i];
    flash.radius += 3;
    flash.alpha -= 0.15;
    if (flash.alpha <= 0) {
      impactFlashes.splice(i, 1);
    }
  }
};

// In draw loop
const drawImpactFlashes = (ctx: CanvasRenderingContext2D) => {
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

---

### Enhancement 29: Brick Shatter Animation

**Goal:** Bricks break apart into multiple pieces that fall with physics.

**Implementation:**

```typescript
interface BrickShard {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  alpha: number;
}

const brickShards: BrickShard[] = [];

const createBrickShatter = (brick: Brick) => {
  const shardCount = 6; // Number of pieces
  const shardWidth = brick.width / 3;
  const shardHeight = brick.height / 2;

  for (let i = 0; i < shardCount; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);

    brickShards.push({
      x: brick.x + col * shardWidth + shardWidth / 2,
      y: brick.y + row * shardHeight + shardHeight / 2,
      width: shardWidth * 0.9,
      height: shardHeight * 0.9,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 5 - 2,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      color: brick.color,
      alpha: 1,
    });
  }
};

// In update loop
const updateBrickShards = () => {
  const gravity = 0.3;

  for (let i = brickShards.length - 1; i >= 0; i--) {
    const shard = brickShards[i];
    shard.x += shard.vx;
    shard.y += shard.vy;
    shard.vy += gravity;
    shard.rotation += shard.rotationSpeed;
    shard.alpha -= 0.02;

    if (shard.alpha <= 0 || shard.y > canvasHeight + 50) {
      brickShards.splice(i, 1);
    }
  }
};

// In draw loop
const drawBrickShards = (ctx: CanvasRenderingContext2D) => {
  brickShards.forEach(shard => {
    ctx.save();
    ctx.globalAlpha = shard.alpha;
    ctx.translate(shard.x, shard.y);
    ctx.rotate(shard.rotation);
    ctx.fillStyle = shard.color;
    ctx.fillRect(-shard.width / 2, -shard.height / 2, shard.width, shard.height);
    ctx.restore();
  });
};
```

---

### Enhancement 30: Enhanced Particle Burst

**Goal:** More particles with varied sizes, colors, and behaviors.

**Current:** 8 particles per brick.
**Enhanced:** 12-16 particles with sparks and debris variation.

```typescript
const createEnhancedParticles = (
  x: number,
  y: number,
  color: string,
  count: number = 14
) => {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    const size = 2 + Math.random() * 4;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Bias upward
      size,
      color: i % 3 === 0 ? '#ffffff' : color, // Some white sparkles
      alpha: 1,
      gravity: 0.1 + Math.random() * 0.1,
    });
  }
};
```

---

### Enhancement 31: Combo Trail Color Escalation

**Goal:** Ball trail changes color based on current combo count.

**Implementation:**

```typescript
const getComboTrailColor = (combo: number): string => {
  if (combo >= 10) return '#ff00ff'; // Magenta - UNSTOPPABLE
  if (combo >= 8) return '#ff4500';  // OrangeRed
  if (combo >= 5) return '#ffd700';  // Gold
  if (combo >= 3) return '#ffaa00';  // Orange
  return '#ff8c00'; // Default orange
};

// In trail drawing
const drawBallTrail = (ctx: CanvasRenderingContext2D, ball: Ball, combo: number) => {
  const trailColor = getComboTrailColor(combo);

  ball.trail.forEach((pos, i) => {
    const alpha = (i / ball.trail.length) * 0.5;
    const size = ball.radius * (i / ball.trail.length);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = trailColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};
```

---

### Enhancement 32: Powerup Glow and Pulse

**Goal:** Powerups pulse and glow as they fall, making them more noticeable.

**Implementation:**

```typescript
const drawPowerup = (
  ctx: CanvasRenderingContext2D,
  powerup: Powerup,
  time: number
) => {
  const pulseScale = 1 + Math.sin(time * 0.01) * 0.1;
  const glowIntensity = 10 + Math.sin(time * 0.015) * 5;

  ctx.save();

  // Outer glow
  ctx.shadowColor = powerup.color;
  ctx.shadowBlur = glowIntensity;

  // Pulsing circle
  ctx.translate(powerup.x, powerup.y);
  ctx.scale(pulseScale, pulseScale);

  ctx.fillStyle = powerup.color;
  ctx.beginPath();
  ctx.arc(0, 0, powerup.radius, 0, Math.PI * 2);
  ctx.fill();

  // Letter icon
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(powerup.icon, 0, 0);

  ctx.restore();
};
```

---

### Enhancement 33: Powerup Activation Flash

**Goal:** Screen-wide flash effect when powerup is collected.

**Implementation:**

```typescript
interface ScreenFlash {
  color: string;
  alpha: number;
}

let screenFlash: ScreenFlash | null = null;

const triggerPowerupFlash = (powerupType: string) => {
  const colors: Record<string, string> = {
    expand: '#00ff00',
    multiball: '#ff00ff',
    fireball: '#ff6600',
    slow: '#00ffff',
    extraLife: '#ff0000',
  };

  screenFlash = {
    color: colors[powerupType] || '#ffffff',
    alpha: 0.3,
  };
};

// In update loop
const updateScreenFlash = () => {
  if (screenFlash) {
    screenFlash.alpha -= 0.03;
    if (screenFlash.alpha <= 0) {
      screenFlash = null;
    }
  }
};

// In draw loop (draw last, over everything)
const drawScreenFlash = (ctx: CanvasRenderingContext2D) => {
  if (screenFlash) {
    ctx.save();
    ctx.globalAlpha = screenFlash.alpha;
    ctx.fillStyle = screenFlash.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }
};
```

---

### Enhancement 34: Fireball Visual Enhancement

**Goal:** Fireball mode ball has flames/ember particles trailing behind.

**Implementation:**

```typescript
const drawFireballMode = (
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  isFireball: boolean
) => {
  if (!isFireball) return;

  // Ember particles
  for (let i = 0; i < 3; i++) {
    const offsetX = (Math.random() - 0.5) * ball.radius * 2;
    const offsetY = (Math.random() - 0.5) * ball.radius * 2;

    ctx.save();
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.fillStyle = Math.random() > 0.5 ? '#ff4500' : '#ffd700';
    ctx.beginPath();
    ctx.arc(
      ball.x + offsetX - ball.vx * 0.5,
      ball.y + offsetY - ball.vy * 0.5,
      2 + Math.random() * 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }

  // Ball glow
  ctx.save();
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
```

---

### Enhancement 35: Near-Miss Visual Feedback

**Goal:** Visual indicator when ball barely misses paddle (close call).

**Implementation:**

```typescript
let nearMissEffect: { x: number; alpha: number } | null = null;

const triggerNearMiss = (x: number) => {
  nearMissEffect = { x, alpha: 1 };
};

// In update
const updateNearMissEffect = () => {
  if (nearMissEffect) {
    nearMissEffect.alpha -= 0.05;
    if (nearMissEffect.alpha <= 0) {
      nearMissEffect = null;
    }
  }
};

// In draw
const drawNearMissEffect = (ctx: CanvasRenderingContext2D, paddleY: number) => {
  if (!nearMissEffect) return;

  ctx.save();
  ctx.globalAlpha = nearMissEffect.alpha;
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);

  // Draw warning line where ball passed
  ctx.beginPath();
  ctx.moveTo(nearMissEffect.x, paddleY - 20);
  ctx.lineTo(nearMissEffect.x, paddleY + 30);
  ctx.stroke();

  ctx.restore();
};
```

---

### Enhancement 36: Last Bricks Highlight

**Goal:** When 1-3 bricks remain, they pulse/glow to draw attention.

**Implementation:**

```typescript
const drawBrickWithHighlight = (
  ctx: CanvasRenderingContext2D,
  brick: Brick,
  remainingBricks: number,
  time: number
) => {
  const shouldHighlight = remainingBricks <= 3 && brick.type !== 'unbreakable';
  const pulseIntensity = shouldHighlight
    ? 10 + Math.sin(time * 0.01) * 8
    : 0;

  ctx.save();

  if (shouldHighlight) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = pulseIntensity;
  }

  // Draw brick normally
  ctx.fillStyle = brick.color;
  ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

  // Pulsing border for last bricks
  if (shouldHighlight) {
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 + Math.sin(time * 0.01) * 0.3})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
  }

  ctx.restore();
};
```

---

### Enhancement 37: Freeze Frame on Big Events

**Goal:** Brief pause (50-80ms) on significant events for impact.

**Events:**
- Combo 5+ achieved
- Combo 10+ achieved (longer freeze)
- Strong brick destroyed
- Powerup collected
- Last brick destroyed

**Implementation:**

```typescript
let freezeFrameUntil = 0;

const triggerFreezeFrame = (duration: number) => {
  freezeFrameUntil = performance.now() + duration;
};

// In game loop
const gameLoop = (timestamp: number) => {
  // Check if we're in freeze frame
  if (timestamp < freezeFrameUntil) {
    // Still draw, but don't update physics
    draw();
    requestAnimationFrame(gameLoop);
    return;
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
};

// Usage examples
if (combo === 5) triggerFreezeFrame(50);
if (combo === 10) triggerFreezeFrame(80);
if (brick.type === 'strong') triggerFreezeFrame(40);
```

---

### Enhancement 38: Screen Shake Improvements

**Goal:** Variable intensity based on event, with proper decay.

**Current:** Fixed shake values. **Enhanced:** Dynamic intensity.

```typescript
interface ScreenShake {
  intensity: number;
  duration: number;
  startTime: number;
}

let currentShake: ScreenShake | null = null;

const triggerScreenShake = (intensity: number, duration: number = 150) => {
  currentShake = {
    intensity,
    duration,
    startTime: performance.now(),
  };
};

const getShakeOffset = (): { x: number; y: number } => {
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

// Shake intensity guide:
// Paddle hit: 3px, 100ms
// Normal brick: 2px, 80ms
// Strong brick: 5px, 120ms
// Combo 5+: 6px, 150ms
// Combo 10+: 10px, 200ms
// Ball lost: 8px, 200ms
// Game over: 12px, 300ms
```

---

## ANTICIPATION & TENSION (Enhancements 39-42)

### Enhancement 39: Ball Approaching Paddle Warning

**Goal:** Subtle visual cue when ball is heading toward paddle from above.

**Implementation:**

```typescript
const drawPaddleWarning = (
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  paddle: Paddle
) => {
  // Only show if ball is moving downward and in upper half
  if (ball.vy <= 0 || ball.y > canvasHeight * 0.6) return;

  // Calculate where ball will intersect paddle Y
  const timeToReach = (paddle.y - ball.y) / ball.vy;
  if (timeToReach < 0 || timeToReach > 60) return; // Only show when close

  const predictedX = ball.x + ball.vx * timeToReach;

  // Draw subtle indicator on paddle
  const alpha = Math.max(0, 1 - timeToReach / 60) * 0.5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(predictedX, paddle.y - 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
```

---

### Enhancement 40: Multiball Spawn Animation

**Goal:** Visual flourish when multiball powerup creates new balls.

**Implementation:**

```typescript
const spawnMultiballs = (sourceBall: Ball) => {
  // Create spawn animation
  const spawnEffects: Array<{x: number; y: number; alpha: number; radius: number}> = [];

  for (let i = 0; i < 2; i++) {
    const angle = (i === 0 ? -1 : 1) * (Math.PI / 4);
    const newBall = createBall(
      sourceBall.x,
      sourceBall.y,
      Math.cos(angle) * 5,
      Math.sin(angle) * -5
    );
    balls.push(newBall);

    // Spawn effect
    spawnEffects.push({
      x: sourceBall.x,
      y: sourceBall.y,
      alpha: 1,
      radius: 10,
    });
  }

  // Animate spawn effects (ring expanding outward)
  // Add to particles or separate effect array
};
```

---

### Enhancement 41: Powerup Timer Indicator

**Goal:** Visual indicator showing remaining duration for timed powerups.

**Implementation:**

```typescript
interface ActivePowerup {
  type: string;
  expiresAt: number;
  duration: number;
}

const activePowerups: ActivePowerup[] = [];

const drawPowerupTimers = (
  ctx: CanvasRenderingContext2D,
  currentTime: number
) => {
  activePowerups.forEach((powerup, index) => {
    const remaining = powerup.expiresAt - currentTime;
    const progress = remaining / powerup.duration;

    if (progress <= 0) return;

    const x = 10;
    const y = 60 + index * 25;
    const width = 80;
    const height = 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);

    // Progress bar
    const colors: Record<string, string> = {
      expand: '#00ff00',
      fireball: '#ff6600',
      slow: '#00ffff',
    };
    ctx.fillStyle = colors[powerup.type] || '#ffffff';
    ctx.fillRect(x, y, width * progress, height);

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(powerup.type.toUpperCase(), x + 5, y + 14);

    // Flash when about to expire
    if (remaining < 2000) {
      ctx.globalAlpha = 0.5 + Math.sin(currentTime * 0.02) * 0.5;
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  });
};
```

---

### Enhancement 42: Level Transition Animation

**Goal:** Smooth visual transition between levels.

**Implementation:**

```typescript
interface LevelTransition {
  phase: 'fadeOut' | 'display' | 'fadeIn';
  progress: number;
  levelNumber: number;
}

let levelTransition: LevelTransition | null = null;

const startLevelTransition = (newLevel: number) => {
  levelTransition = {
    phase: 'fadeOut',
    progress: 0,
    levelNumber: newLevel,
  };
};

const updateLevelTransition = () => {
  if (!levelTransition) return;

  levelTransition.progress += 0.02;

  if (levelTransition.phase === 'fadeOut' && levelTransition.progress >= 1) {
    levelTransition.phase = 'display';
    levelTransition.progress = 0;
    // Actually load new level here
    loadLevel(levelTransition.levelNumber);
  } else if (levelTransition.phase === 'display' && levelTransition.progress >= 1) {
    levelTransition.phase = 'fadeIn';
    levelTransition.progress = 0;
  } else if (levelTransition.phase === 'fadeIn' && levelTransition.progress >= 1) {
    levelTransition = null;
  }
};

const drawLevelTransition = (ctx: CanvasRenderingContext2D) => {
  if (!levelTransition) return;

  let overlayAlpha = 0;

  if (levelTransition.phase === 'fadeOut') {
    overlayAlpha = levelTransition.progress;
  } else if (levelTransition.phase === 'display') {
    overlayAlpha = 1;
  } else if (levelTransition.phase === 'fadeIn') {
    overlayAlpha = 1 - levelTransition.progress;
  }

  // Dark overlay
  ctx.save();
  ctx.globalAlpha = overlayAlpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Level text (only during display phase)
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

## COMBO SYSTEM ENHANCEMENTS (Enhancements 43-45)

### Enhancement 43: Combo Meter Visual

**Goal:** On-screen meter showing current combo with visual escalation.

**Implementation:**

```typescript
const drawComboMeter = (
  ctx: CanvasRenderingContext2D,
  combo: number,
  comboTimer: number // Time until combo resets
) => {
  if (combo < 2) return;

  const x = canvasWidth - 100;
  const y = 50;
  const width = 80;
  const height = 15;

  // Meter background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, height);

  // Meter fill (time remaining)
  const fillPercent = comboTimer / 500; // 500ms timeout
  const meterColor = combo >= 10 ? '#ff00ff' : combo >= 5 ? '#ffd700' : '#ff8c00';
  ctx.fillStyle = meterColor;
  ctx.fillRect(x, y, width * fillPercent, height);

  // Combo count
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`x${combo}`, x + width / 2, y - 8);

  // Glow effect for high combos
  if (combo >= 5) {
    ctx.shadowColor = meterColor;
    ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.01) * 5;
  }
};
```

---

### Enhancement 44: Combo Multiplier Score Bonus

**Goal:** Combos actually multiply points earned.

**Current:** Combos don't affect scoring.
**Enhanced:** Add multiplier to brick destruction points.

**Implementation:**

```typescript
const calculateBrickScore = (brick: Brick, combo: number): number => {
  const baseScore = brick.type === 'strong' ? 25 : 10;

  // Multiplier based on combo
  let multiplier = 1;
  if (combo >= 10) multiplier = 2.5;
  else if (combo >= 8) multiplier = 2.0;
  else if (combo >= 5) multiplier = 1.5;
  else if (combo >= 3) multiplier = 1.2;

  return Math.floor(baseScore * multiplier);
};

// Show multiplier in score popup
const showScorePopup = (x: number, y: number, score: number, multiplier: number) => {
  const text = multiplier > 1
    ? `+${score} (x${multiplier})`
    : `+${score}`;

  // Create floating text...
};
```

---

### Enhancement 45: Combo Break Feedback

**Goal:** Visual/audio feedback when combo is lost (timeout).

**Implementation:**

```typescript
let comboBreakEffect: { alpha: number } | null = null;

const onComboBreak = (lostCombo: number) => {
  if (lostCombo < 3) return; // Only show for meaningful combos

  // Visual effect
  comboBreakEffect = { alpha: 1 };

  // Sound
  playComboBreak(lostCombo);

  // Haptic
  if (lostCombo >= 5) {
    hapticComboBreak();
  }
};

const playComboBreak = (combo: number) => {
  const sound = new Howl({
    src: ['/sounds/combo_break.mp3'],
    volume: 0.3 + Math.min(combo * 0.03, 0.2),
    rate: 0.8, // Lower pitch = sad
  });
  sound.play();
};

const drawComboBreakEffect = (ctx: CanvasRenderingContext2D) => {
  if (!comboBreakEffect) return;

  // Red vignette flash
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, 0,
    canvasWidth / 2, canvasHeight / 2, canvasWidth
  );
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(255, 0, 0, ${comboBreakEffect.alpha * 0.3})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  comboBreakEffect.alpha -= 0.05;
  if (comboBreakEffect.alpha <= 0) comboBreakEffect = null;
};
```

---

## Implementation Order Summary

**Phase 1: Sound Foundation (1-14)**
1. Ball launch sound
2. Paddle hit sound
3. Wall hit sound
4. Normal brick destruction sound
5. Strong brick hit sound (cracked)
6. Strong brick destruction sound
7. Unbreakable brick deflect sound
8. Powerup spawn sound
9. Powerup collection sounds (type-specific)
10. Ball lost sound
11. Combo sound escalation
12. Last brick anticipation sound
13. Fireball mode loop
14. Sound variations

**Phase 2: Haptic Layer (15-24)**
15. Paddle hit haptic
16. Normal brick haptic
17. Strong brick crack haptic
18. Strong brick destroy haptic
19. Unbreakable brick haptic
20. Powerup collection haptic
21. Ball lost haptic
22. Combo escalation haptic
23. Near-miss haptic
24. Level complete haptic

**Phase 3: Core Visual Juice (25-31)**
25. Ball squash on impact
26. Paddle squash on ball hit
27. Ball stretch based on velocity
28. Impact flash on collisions
29. Brick shatter animation
30. Enhanced particle burst
31. Combo trail color escalation

**Phase 4: Powerup & Effect Visuals (32-38)**
32. Powerup glow and pulse
33. Powerup activation flash
34. Fireball visual enhancement
35. Near-miss visual feedback
36. Last bricks highlight
37. Freeze frame on big events
38. Screen shake improvements

**Phase 5: Anticipation & Polish (39-42)**
39. Ball approaching paddle warning
40. Multiball spawn animation
41. Powerup timer indicator
42. Level transition animation

**Phase 6: Combo System (43-45)**
43. Combo meter visual
44. Combo multiplier score bonus
45. Combo break feedback

---

## Sound Files Needed

| Sound | File Name | Description |
|-------|-----------|-------------|
| Ball launch | ball_launch.mp3 | Whoosh/ping |
| Paddle hit | paddle_hit.mp3 | Rubbery thwack |
| Wall hit | wall_ping.mp3 | Clean ping |
| Brick normal | brick_destroy_1-4.mp3 | Pop/crunch (4 variations) |
| Brick crack | brick_crack.mp3 | Stone crack |
| Brick strong | brick_strong_destroy.mp3 | Heavy crumble |
| Unbreakable | unbreakable_clang.mp3 | Metallic clang |
| Powerup spawn | powerup_spawn.mp3 | Sparkle chime |
| Powerup expand | powerup_expand.mp3 | Stretching |
| Powerup multiball | powerup_multiball.mp3 | Split/multiply |
| Powerup fireball | powerup_fireball.mp3 | Ignition |
| Powerup slow | powerup_slow.mp3 | Deceleration |
| Powerup life | powerup_life.mp3 | Triumphant |
| Ball lost | ball_lost.mp3 | Descending womp |
| Combo chime | combo_chime.mp3 | Success chime |
| Sparkle | sparkle.mp3 | Sparkle layer |
| Bass hit | bass_hit.mp3 | Impact bass |
| Anticipation | anticipation_loop.mp3 | Tension loop |
| Fireball loop | fireball_loop.mp3 | Crackling fire |
| Combo break | combo_break.mp3 | Disappointed tone |

---

## Notes for Implementation

- **Canvas-based:** All visual effects are drawn on canvas, not DOM elements
- **Performance:** Keep particle counts reasonable on mobile
- **60fps:** Ensure all effects run smoothly in the game loop
- **Test on mobile:** Haptics and touch feel different on devices
- **Sound preloading:** Preload all sounds before game starts
- **Preserve existing logic:** These are additions, not replacements

---

## Resources & References

- [Juice It or Lose It - GDC Talk](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose)
- [Game Juice Playbook](./game-juice-playbook.md)
- [Squash and Stretch Animation Principle](https://blog.cg-wire.com/squash-stretch-principle/)
- [Game Feel - Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html)
- [Combo System Design - Game Developer](https://www.gamedeveloper.com/design/the-design-of-combos-and-chains)

---

*Document created: January 2025*
*For: Wojak.ink Brick Breaker Game*
