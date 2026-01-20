# Juice Implementation Workflows

## Workflow 1: Add Juice to Existing Game

### Step 1: Set Up Juice Systems
```typescript
// At component level
const particlesRef = useRef(createParticleSystem());
const shakeRef = useRef<ScreenShake | null>(null);
const flashRef = useRef<ScreenFlash | null>(null);
const audioRef = useRef(createAudioManager());

// Initialize audio on first interaction
const handleFirstInteraction = () => {
  initAudio(audioRef.current);
};
```

### Step 2: Update Loop Integration
```typescript
const update = (deltaTime: number) => {
  // Update particles
  updateParticles(particlesRef.current, deltaTime);

  // Update screen shake
  if (shakeRef.current) {
    updateScreenShake(shakeRef.current, deltaTime);
  }

  // Update screen flash
  if (flashRef.current) {
    updateScreenFlash(flashRef.current, deltaTime);
  }
};
```

### Step 3: Render Loop Integration
```typescript
const render = (ctx: CanvasRenderingContext2D) => {
  // Apply screen shake transform
  if (shakeRef.current) {
    applyScreenShake(ctx, shakeRef.current);
  }

  // Draw game world...

  // Draw particles (above game objects)
  drawParticles(ctx, particlesRef.current);

  // Draw screen flash (on top of everything)
  if (flashRef.current) {
    drawScreenFlash(ctx, flashRef.current);
  }

  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);
};
```

### Step 4: Add Event Triggers
```typescript
// On player action
const onPlayerAction = (x: number, y: number) => {
  spawnBurstParticles(particlesRef.current, x, y, PARTICLE_PRESETS.wing);
  playTone(audioRef.current, 200, 0.1, 80);
  triggerHaptic('tap');
};

// On score
const onScore = (x: number, y: number, points: number) => {
  spawnBurstParticles(particlesRef.current, x, y, PARTICLE_PRESETS.pass);
  flashRef.current = createScreenFlash('#ffffff', 0.3, 80);
  playTone(audioRef.current, 440, 0.1, 100);
  triggerHaptic('success');
};

// On death
const onDeath = (x: number, y: number) => {
  spawnBurstParticles(particlesRef.current, x, y, PARTICLE_PRESETS.explosion);
  flashRef.current = createScreenFlash('#ff0000', 0.5, 200);
  shakeRef.current = createScreenShake(15, 400);
  playTone(audioRef.current, 220, 0.15, 200);
  triggerHaptic('heavy');
};
```

---

## Workflow 2: Create New Juicy Game

### Step 1: Copy Template
```bash
cp -r templates/canvas-game-starter src/pages/MyNewGame
```

### Step 2: Configure Game
Edit `config.ts`:
```typescript
export const GAME_CONFIG = {
  name: 'My New Game',
  canvas: { width: 400, height: 600, backgroundColor: '#1a1a2e' },
};

export const PHYSICS = {
  gravity: 0.5,
  // Game-specific physics...
};
```

### Step 3: Define Game State
Edit `types.ts`:
```typescript
export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover';
  score: number;
  // Game-specific state...
}
```

### Step 4: Implement Game Loop
Edit `components/GameCanvas.tsx`:
- Add game-specific update logic
- Add game-specific rendering
- Wire up juice triggers to game events

### Step 5: Add Game-Specific Juice
Identify key moments:
- Player actions (tap, swipe, drag)
- Scoring events (collect, destroy, match)
- Failure events (miss, collision, timeout)
- Achievements (milestone, combo, perfect)

---

## Workflow 3: Diagnose Missing Juice

### Checklist
1. **No response on tap?**
   - Add particles at tap location
   - Add sound (200Hz, 80ms, triangle wave)
   - Add haptic ('tap')

2. **Death feels flat?**
   - Add explosion particles
   - Add screen shake (intensity 15, 400ms)
   - Add red flash (0.5 alpha, 200ms)
   - Add descending tone
   - Add freeze frame (100ms)

3. **Scoring unnoticeable?**
   - Add floating text (+10, +25, etc.)
   - Add small particle burst
   - Add quick white flash
   - Add rising tone

4. **Combos feel same?**
   - Escalate shake intensity
   - Escalate pitch
   - Change particle colors
   - Add combo counter with scale animation

5. **Mobile feels dead?**
   - Check `initAudio()` on first touch
   - Add `triggerHaptic()` to all feedback
   - Test on real device (not emulator)

---

## Workflow 4: Performance Optimization

### Symptoms & Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Stuttering | Too many particles | Cap at 200 (100 mobile) |
| Lag on death | Particle explosion | Limit burst to 30 particles |
| Audio delay | Not pre-warmed | Call initAudio on first touch |
| Memory leak | Particles not removed | Ensure update removes dead particles |

### Performance Budget
```typescript
const PERFORMANCE_BUDGET = {
  particles: isMobile() ? 100 : 200,
  floatingTexts: 10,
  activeEffects: 5,
  targetFPS: 60,
};
```

### Reduced Motion Support
```typescript
import { prefersReducedMotion } from '@/lib/utils';

if (prefersReducedMotion()) {
  // Skip particles and shake
  // Still play sounds and show score
}
```

---

## Workflow 5: Testing Juice

### Manual Test Sequence
1. **Fresh start** - Tap to start, verify sound plays
2. **First action** - Check particle + sound + haptic
3. **Quick actions** - Spam tap, no audio stacking/distortion
4. **Score moment** - Verify feedback proportional
5. **Near miss** - Tension feedback present
6. **Death** - Dramatic multi-sensory response
7. **High score** - Extra celebration
8. **Milestone** - Special effects at 10, 25, 50, 100

### Device Testing
- [ ] Chrome desktop (baseline)
- [ ] Safari mobile (audio restrictions)
- [ ] Android Chrome (haptics)
- [ ] iOS Safari (haptics + audio)
- [ ] Low-end device (performance)
