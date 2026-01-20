# /juice - Game Juice Implementation

Add visual effects, audio feedback, and polish to games.

## Quick Import
```typescript
import {
  createParticleSystem, spawnBurstParticles, PARTICLE_PRESETS,
  createScreenShake, createScreenFlash, playTone, triggerHaptic,
} from '@/lib/juice';
```

## Common Patterns

### Tap Feedback
```typescript
spawnBurstParticles(particles, x, y, { ...PARTICLE_PRESETS.wing, count: 5 });
playTone(audioManager, 200, 0.1, 80, 'triangle');
triggerHaptic('tap');
```

### Score Feedback
```typescript
spawnBurstParticles(particles, x, y, PARTICLE_PRESETS.pass);
screenFlash = createScreenFlash('#ffffff', 0.3, 80);
playTone(audioManager, 440, 0.1, 100);
triggerHaptic('success');
```

### Death Feedback
```typescript
spawnBurstParticles(particles, x, y, PARTICLE_PRESETS.explosion);
screenFlash = createScreenFlash('#ff0000', 0.5, 200);
screenShake = createScreenShake(15, 400);
playTone(audioManager, 220, 0.15, 200);
triggerHaptic('heavy');
```

## Resources
- Full guide: `.skills/game-juice/SKILL.md`
- Presets: `.skills/game-juice/references/presets.md`
- Workflows: `.skills/game-juice/references/workflows.md`
- Master playbook: `docs/game-juice-playbook.md`
- Testing: `docs/testing/juice-testing-checklist.md`
