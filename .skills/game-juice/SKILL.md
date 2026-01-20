---
name: game-juice
description: |
  Game juice implementation assistant for Wojak.ink games. Helps apply visual effects, audio feedback, animations, and polish to canvas-based games using pre-built reusable libraries.

  **MANDATORY TRIGGERS:**
  - "juice", "game feel", "polish", "effects", "particles", "screen shake", "haptics"
  - Adding visual/audio feedback to games
  - Making games feel more responsive or satisfying
  - Implementing death sequences, celebrations, combos
  - Creating new games from the starter template
  - Running juice testing checklists
---

# Game Juice Skill

Add satisfying game feel to Wojak.ink canvas games using pre-built libraries and proven patterns.

## Quick Reference

| Task | Action |
|------|--------|
| Add particles | `import { spawnBurstParticles, PARTICLE_PRESETS } from '@/lib/juice'` |
| Add screen shake | `import { createScreenShake, updateScreenShake } from '@/lib/juice'` |
| Add sound | `import { playTone, triggerHaptic } from '@/lib/juice'` |
| Add animation | `import { createTween, easeOutCubic } from '@/lib/juice'` |
| New game | Copy `templates/canvas-game-starter/` to `src/pages/[GameName]/` |

## Library Imports

```typescript
// All juice effects
import {
  // Particles
  createParticleSystem, spawnBurstParticles, updateParticles, drawParticles,
  PARTICLE_PRESETS,  // wing, explosion, pass, fire, nearMiss, confetti

  // Screen effects
  createScreenShake, updateScreenShake, applyScreenShake,
  createScreenFlash, drawScreenFlash, FLASH_PRESETS,
  drawVignette,

  // Animations
  easeOutCubic, easeOutBack, easeOutElastic,
  createTween, updateTween, lerp,
  createSpring, updateSpring,

  // Audio
  createAudioManager, initAudio, playTone, triggerHaptic,
  FEEDBACK_PRESETS,  // tap, success, fail, heavy

  // Camera
  createCamera, shakeCamera, applyCameraTransform,
} from '@/lib/juice';

// Utilities
import { clamp, randomInRange, distance } from '@/lib/utils';
import { lerpColor, GAME_PALETTES } from '@/lib/utils';
import { isMobile, detectGesture } from '@/lib/utils';

// Canvas drawing
import { roundRect, withShadow, setupHiDPICanvas } from '@/lib/canvas';
import { createPremiumParallaxSystem, updateParallax } from '@/lib/canvas';
import { createFloatingText, drawFloatingText } from '@/lib/canvas';
```

## Core Juice Patterns

### 1. Tap/Click Feedback
```typescript
// Visual: slight scale pulse
playerScale = 1.15;
setTimeout(() => playerScale = 1.0, 100);

// Particles: small burst
spawnBurstParticles(particles, x, y, { ...PARTICLE_PRESETS.wing, count: 5 });

// Audio: crisp tone
playTone(audioManager, 200, 0.1, 80, 'triangle');
triggerHaptic('tap');
```

### 2. Success/Score Feedback
```typescript
// Visual: floating text
const text = createFloatingText(`+${points}`, x, y, { color: '#FFD700' });

// Particles: celebration burst
spawnBurstParticles(particles, x, y, PARTICLE_PRESETS.pass);

// Audio: rising tones
playTone(audioManager, 440, 0.1, 100);
setTimeout(() => playTone(audioManager, 554, 0.08, 150), 50);
triggerHaptic('success');

// Screen: subtle flash
screenFlash = createScreenFlash('#ffffff', 0.3, 80);
```

### 3. Death/Failure Feedback
```typescript
// Visual: red flash + shake
screenFlash = createScreenFlash('#ff0000', 0.5, 200);
screenShake = createScreenShake(15, 400);

// Particles: explosion
spawnBurstParticles(particles, x, y, PARTICLE_PRESETS.explosion);

// Audio: descending tone
playTone(audioManager, 220, 0.15, 200);
setTimeout(() => playTone(audioManager, 185, 0.12, 300), 100);
triggerHaptic('heavy');

// Time: brief freeze frame
setSlowMotion(timeScale, 0.1, 150);
```

### 4. Combo Escalation
```typescript
const COMBO_COLORS = ['#4ECDC4', '#FFD93D', '#FF6B35', '#FF4444', '#E040FB'];

// Scale feedback with combo
const intensity = Math.min(combo, 5);
screenShake = createScreenShake(2 + intensity * 2, 100 + intensity * 30);

// Rising pitch
const pitch = 1 + (combo * 0.1);
playTone(audioManager, 440 * pitch, 0.1, 100);

// Color progression
const color = COMBO_COLORS[Math.min(combo - 1, COMBO_COLORS.length - 1)];
```

## Game-Specific Guides

Read these for detailed implementation:

| Game | Guide Location |
|------|----------------|
| Flappy Orange | `docs/FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md` |
| All Games | `docs/game-juice-playbook.md` |

## Testing Checklist

After implementing juice, run through `docs/testing/juice-testing-checklist.md`:

1. ✅ Tap/action feel - Immediate response, satisfying feedback
2. ✅ Death sequence - Dramatic, clear what happened
3. ✅ Score moments - Celebrations proportional to achievement
4. ✅ Near-miss - Tension and reward for close calls
5. ✅ Special modes - Fire mode, fever mode feel distinct
6. ✅ Audio variety - No repetitive sounds
7. ✅ Mobile haptics - Feedback works on devices
8. ✅ Performance - 60fps maintained, particles capped

## Creating New Games

```bash
# 1. Copy template
cp -r templates/canvas-game-starter src/pages/MyNewGame

# 2. Update config.ts with game-specific values
# 3. Implement game logic in GameCanvas.tsx
# 4. Add game-specific juice effects
```

## Research Patterns

For retention/viral features, see:
- `docs/research/retention-patterns.md` - Daily rewards, streaks, progression
- `docs/research/viral-patterns.md` - Sharing, challenges, leaderboards
