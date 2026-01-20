# Canvas Game Starter Template

> A reusable template for creating juicy canvas-based games

## Features

- 🎮 Fully typed game loop with delta time
- ✨ Pre-integrated juice library
- 📱 Mobile-ready (touch, haptics)
- 🎵 Audio system with Web Audio API
- 🎥 Camera system with shake and zoom
- 🌟 Particle system ready to use
- ⚡ High-DPI canvas support
- ♿ Reduced motion support

## Quick Start

1. Copy this folder to `src/pages/[GameName]/`
2. Rename files as needed
3. Implement your game logic in `GameLoop.tsx`
4. Add game-specific juice effects

## File Structure

```
canvas-game-starter/
├── README.md              # This file
├── types.ts               # Shared type definitions
├── config.ts              # Game configuration constants
├── components/
│   ├── index.ts           # Component exports
│   └── GameCanvas.tsx     # Main game component
└── hooks/
    ├── index.ts           # Hook exports
    ├── useGameLoop.ts     # RAF loop with delta time
    ├── useAudio.ts        # Web Audio API manager
    └── useInput.ts        # Touch/keyboard input
```

## Usage

```tsx
import { GameCanvas } from './components';

export default function MyGame() {
  const [score, setScore] = useState(0);

  return (
    <div className="game-container">
      <GameCanvas
        onScoreChange={setScore}
        onGameOver={(finalScore) => console.log('Game Over:', finalScore)}
        onStateChange={(state) => console.log('State:', state)}
      />
      <div className="score-display">{score}</div>
    </div>
  );
}
```

## Juice Integration

All juice from `src/lib/juice/` is ready to use:

```tsx
import {
  createParticleSystem,
  spawnBurstParticles,
  createScreenShake,
  playTone,
  triggerHaptic,
} from '@/lib/juice';

// In your game:
spawnBurstParticles(particles, x, y, 'explosion');
shakeRef.current = createScreenShake(6, 200);
playTone(audioManager, 440, 0.1, 150);
triggerHaptic('tap');
```

## Customization

### Adding New States

Edit `types.ts`:

```typescript
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'YOUR_STATE';
```

### Adding New Juice Effects

1. Import from `@/lib/juice`
2. Create ref/state for the effect
3. Trigger in game logic
4. Render in draw loop

### Changing Physics

Edit `config.ts`:

```typescript
export const PHYSICS = {
  GRAVITY: 0.5,
  JUMP_VELOCITY: -10,
  MAX_VELOCITY: 15,
  // Add your constants
};
```

## Best Practices

1. **Keep game loop lean:** Heavy calculations outside RAF
2. **Use refs for mutable state:** Avoid useState in game loop
3. **Pool particles:** Don't create new objects every frame
4. **Profile on device:** Chrome DevTools !== real phone
5. **Test without sound:** Visuals should still satisfy

## Extending

### Add Leaderboard

```tsx
import { submitScore, getLeaderboard } from '@/lib/leaderboard';

const handleGameOver = async (score: number) => {
  await submitScore('game-id', score);
  const leaderboard = await getLeaderboard('game-id');
};
```

### Add Achievements

```tsx
import { checkAchievement, unlockAchievement } from '@/lib/achievements';

if (score >= 100 && !checkAchievement('CENTURION')) {
  unlockAchievement('CENTURION');
  // Show celebration
}
```

### Add Daily Challenges

```tsx
import { getDailyChallenge, updateProgress } from '@/lib/challenges';

const challenge = getDailyChallenge();
// Check progress during gameplay
updateProgress(challenge.id, currentValue);
```

---

Created for Wojak.ink Games
