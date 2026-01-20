# Flappy Orange - Quick Start Prompt

Copy this prompt to start implementing Flappy Orange juice:

---

## Prompt

```
I'm implementing juice effects and design enhancements for Flappy Orange game. Read these files first:

1. /sessions/brave-confident-mccarthy/mnt/wojak-ink/docs/FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md - Full juice guide (160 tasks)
2. /sessions/brave-confident-mccarthy/mnt/wojak-ink/docs/FLAPPY-ORANGE-DESIGN-ENHANCEMENTS.md - Premium design guide (56 tasks)
3. /sessions/brave-confident-mccarthy/mnt/wojak-ink/docs/FLAPPY-ORANGE-JUICE-CHECKLIST.md - Progress tracking (216 total tasks)
4. /sessions/brave-confident-mccarthy/mnt/uploads/FLAPPY-ORANGE-GAME-RESEARCH.md - Current game state
5. /sessions/brave-confident-mccarthy/mnt/wojak-ink/docs/game-juice-playbook.md - Universal juice patterns

The game file is at: src/pages/FlappyOrange.tsx (901 lines, Canvas-based)

PRIORITY ORDER (JUICE):
1. Phase 2: DRAMATIC Death (freeze frame + slow-mo tumble + particles + chromatic aberration)
2. Phase 1: Premium Flap Feel (squash/stretch + wing particles + varied sounds + camera pulse)
3. Phase 4: Full Pass Juice (particles + musical scale notes + screen pulse)
4. Phase 3: Near-Miss System (detection + yellow flash + bonus points + "CLOSE!" callout)
5. Phase 6: Streak Fire Mode (fire trail + 1.5x multiplier + border glow after 5 pipes)

PRIORITY ORDER (DESIGN):
1. Phase D1: Character Personality (eye tracking + expressions + breathing + premium trail)
2. Phase D3: Modern Pipe Design (gradients + lighting + gap highlights)
3. Phase D4: Premium UI (modern score + animated popups + game over screen)
4. Phase D2: Environment Depth (7-layer parallax + volumetric clouds + light rays)
5. Phase D5: Atmospheric Effects (vignette + rain + lightning)

KEY FEATURES TO IMPLEMENT:
- DRAMATIC DEATH: 150ms freeze → slow-mo tumble (0.3x speed) → 25-35 particle explosion → chromatic aberration flash
- PREMIUM FLAP: Squash/stretch (0.85x/1.3y on flap) + wing burst particles + varied pitch sounds (±15%) + 2% camera zoom pulse
- NEAR-MISS SYSTEM: Detect when within 25% of gap edges → yellow flash → +1-3 bonus points → "CLOSE!" callout
- MUSICAL PASS NOTES: C major scale (Do-Re-Mi-Fa-Sol-La-Ti-Do) cycling on each pipe pass
- STREAK FIRE: After 5 pipes → fire particle trail + 1.5x score multiplier + pulsing orange border

Start with Phase 2 (Death) - the freeze frame + tumble combo creates instant premium feel.

Update the checklist after completing each task.
```

---

## Priority Tasks Summary

### Juice Effects (160 tasks)
| Priority | Phase | Key Feature | Impact |
|----------|-------|-------------|--------|
| 1 | Phase 2 | Freeze Frame + Slow-Mo Tumble | Instant premium death feel |
| 2 | Phase 1 | Squash/Stretch + Wing Particles | Every tap feels powerful |
| 3 | Phase 4 | Musical Scale Notes | Addictive pass feedback |
| 4 | Phase 3 | Near-Miss Bonus System | Rewards risky play |
| 5 | Phase 6 | Fire Mode at 5 Pipes | Creates "hot streak" hook |
| 6 | Phase 13 | Playbook Bonus (ripples, combo bar, time dilation) | Extra polish |

### Design Enhancements (56 tasks)
| Priority | Phase | Key Feature | Impact |
|----------|-------|-------------|--------|
| 1 | Phase D1 | Eye Tracking + Expressions | Character feels alive |
| 2 | Phase D3 | Gradient Pipes + Gap Glow | Modern professional look |
| 3 | Phase D4 | Game Over Card + Popups | Premium UI polish |
| 4 | Phase D2 | 7-Layer Parallax + Clouds | Incredible depth |
| 5 | Phase D5 | Rain + Lightning + Vignette | Atmospheric immersion |

---

## Key Code Patterns

### Death Freeze Frame
```typescript
const FREEZE_CONFIG = { duration: 150, shakeIntensity: 6 };
gameStateRef.current.isFrozen = true;
triggerScreenShake(6, 200);
setTimeout(() => { isFrozen = false; startSlowMotionDeath(); }, 150);
```

### Squash/Stretch on Flap
```typescript
bird.scaleX = 0.85; bird.scaleY = 1.3; // Stretch up
setTimeout(() => animateTo(1.0, 1.0, 150), 80); // Return
```

### Near-Miss Detection
```typescript
const threshold = PIPE_GAP * 0.25;
const distFromEdge = Math.min(birdTop - gapTop, gapBottom - birdBottom);
if (distFromEdge < threshold) { intensity = 1 - (distFromEdge / threshold); }
```

### Musical Scale
```typescript
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
const noteIndex = (pipeNumber - 1) % 8;
```

### Fire Mode
```typescript
if (streak >= 5 && !isOnFire) {
  isOnFire = true;
  multiplier = 1.5;
  startFireAmbience();
}
```

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/pages/FlappyOrange.tsx` | Main game component (901 lines) |
| `src/pages/FlappyOrange.css` | Styles (553 lines) |

---

## Key Constants to Add

```typescript
// Add these at the top of FlappyOrange.tsx
const JUICE_CONFIG = {
  // Squash/Stretch
  FLAP_SCALE: { x: 0.85, y: 1.3, duration: 80, return: 150 },
  DEATH_SCALE: { x: 1.4, y: 0.6, duration: 60, return: 200 },

  // Death Sequence
  FREEZE_DURATION: 150,
  SLOW_MO_SCALE: 0.3,
  SLOW_MO_DURATION: 400,
  TUMBLE_SPEED: 720,

  // Near-Miss
  NEAR_MISS_THRESHOLD: 0.25,
  NEAR_MISS_BONUS: [1, 2, 3],

  // Fire Mode
  FIRE_THRESHOLD: 5,
  FIRE_MULTIPLIER: 1.5,

  // Musical Scale (C Major)
  PASS_FREQUENCIES: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],

  // Particles
  WING_PARTICLES: 5,
  DEATH_PARTICLES: 30,
  PASS_PARTICLES: 10,
};
```

---

## State to Add

```typescript
// Add to gameStateRef
scaleX: 1,
scaleY: 1,
isFrozen: false,
timeScale: 1,
rotationVelocity: 0,
velocityX: 0,

// Add new refs
const wingParticlesRef = useRef<Particle[]>([]);
const deathParticlesRef = useRef<Particle[]>([]);
const passParticlesRef = useRef<Particle[]>([]);
const touchRipplesRef = useRef<Ripple[]>([]);
const fireParticlesRef = useRef<Particle[]>([]);

// Add new state
const [streak, setStreak] = useState({ current: 0, isOnFire: false, multiplier: 1 });
const [cameraZoom, setCameraZoom] = useState(1);
const [screenBrightness, setScreenBrightness] = useState(1);
const [impactFlashAlpha, setImpactFlashAlpha] = useState(0);
const [nearMissFlashAlpha, setNearMissFlashAlpha] = useState(0);
```

---

## Expected Results

### After Juice Implementation:
- Death feels IMPACTFUL (freeze + tumble + explosion)
- Every flap feels POWERFUL (squash/stretch + particles + sound)
- Pass rewards feel MUSICAL (rising scale)
- Near-misses feel TENSE (yellow flash + bonus)
- Hot streaks feel ON FIRE (literally)

### After Design Implementation:
- Character feels ALIVE (eye tracking + expressions + breathing)
- World feels DEEP (7-layer parallax + volumetric clouds)
- Pipes look MODERN (gradients + lighting + gap glow)
- UI feels PREMIUM (animated popups + polished game over)
- Atmosphere feels IMMERSIVE (vignette + weather effects)

**Target: Make players say "ONE MORE TRY" every time they die**
**Design Target: Make players say "This looks amazing!" on first impression**

---

## Testing Checklist

After each phase, verify:
- [ ] Effect triggers at correct moment
- [ ] Sound plays with variation
- [ ] Haptic fires on mobile
- [ ] No performance lag (check FPS)
- [ ] Reduced motion respected

---

## Future Features (After Juice)

See implementation guide for Phase 14+:
- Ghost Racing vs Friends
- Daily Challenges + Streak System
- Wojak Skin Unlocks (NFT!)
- Auto-Highlight Recording (TikTok viral)
