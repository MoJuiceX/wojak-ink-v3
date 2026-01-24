# Phase 1: Architecture & Structure

**Goal:** Establish consistent game structure, eliminate duplicates, reduce file sizes.

**Time Estimate:** 2 hours

---

## Task 1.1: Create Shared Game Types

**Problem:** Each game defines its own state types inconsistently.

**Create file:** `/src/games/shared/types.ts`

```typescript
// Standard game state interface all games should use
export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover';

export interface BaseGameState {
  status: GameStatus;
  score: number;
  highScore: number;
  level?: number;
  combo?: number;
}

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  leaderboardId: string;
  colors: {
    primary: string;      // CSS variable name, e.g., '--color-tang-500'
    secondary: string;
    accent: string;
  };
}

export interface GameProps {
  onGameOver?: (score: number) => void;
  onScoreChange?: (score: number) => void;
}
```

**Verify:**
```bash
cat src/games/shared/types.ts
```

---

## Task 1.2: Create Shared Button Component

**Problem:** Buttons are inconsistent across all games and UI.

**Create file:** `/src/components/ui/GameButton.tsx`

```typescript
import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './GameButton.css';

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={`game-btn game-btn-${variant} game-btn-${size} ${className}`}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GameButton.displayName = 'GameButton';
```

**Create file:** `/src/components/ui/GameButton.css`

```css
.game-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 600;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* Sizes */
.game-btn-sm { padding: 8px 16px; font-size: 14px; }
.game-btn-md { padding: 12px 24px; font-size: 16px; }
.game-btn-lg { padding: 16px 32px; font-size: 18px; }
.game-btn-icon {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 50%;
}

/* Variants using CSS variables */
.game-btn-primary {
  background: linear-gradient(135deg, var(--color-tang-500), var(--color-tang-600));
  color: white;
  border-color: var(--color-tang-400);
}
.game-btn-primary:hover {
  background: linear-gradient(135deg, var(--color-tang-400), var(--color-tang-500));
  box-shadow: 0 0 20px var(--color-tang-500);
}

.game-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}
.game-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.game-btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.game-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.game-btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: #f87171;
}

/* Disabled state */
.game-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
```

**Export from index:**
Add to `/src/components/ui/index.ts`:
```typescript
export { GameButton } from './GameButton';
export type { GameButtonProps } from './GameButton';
```

**Verify:**
```bash
npm run build
```

---

## Task 1.3: Delete Duplicate OrangeStack

**Problem:** OrangeStack exists in `/src/games/` but BrickByBrick is the real implementation in `/src/pages/`.

**Step 1:** Check if OrangeStack is imported anywhere:
```bash
grep -r "from.*games/OrangeStack\|from.*OrangeStack" src/ --include="*.tsx" --include="*.ts"
```

**Step 2:** If imported, update those imports to use BrickByBrick instead.

**Step 3:** Delete the duplicate:
```bash
rm -rf src/games/OrangeStack/
```

**Verify:**
```bash
npm run build
ls src/games/
```

---

## Task 1.4: Create Game Index File

**Problem:** No central registry of games.

**Create file:** `/src/games/index.ts`

```typescript
// Central game registry
export const GAMES = {
  'brick-by-brick': {
    id: 'brick-by-brick',
    name: 'Brick by Brick',
    path: '/games/brick-by-brick',
    component: () => import('@/pages/BrickByBrick'),
  },
  'memory-match': {
    id: 'memory-match',
    name: 'Memory Match',
    path: '/games/memory-match',
    component: () => import('@/pages/MemoryMatch'),
  },
  'flappy-orange': {
    id: 'flappy-orange',
    name: 'Flappy Orange',
    path: '/games/flappy-orange',
    component: () => import('@/pages/FlappyOrange'),
  },
  'wojak-runner': {
    id: 'wojak-runner',
    name: 'Wojak Runner',
    path: '/games/wojak-runner',
    component: () => import('@/pages/WojakRunner'),
  },
  'color-reaction': {
    id: 'color-reaction',
    name: 'Color React',
    path: '/games/color-reaction',
    component: () => import('@/pages/ColorReaction'),
  },
  'orange-2048': {
    id: 'orange-2048',
    name: '2048 Merge',
    path: '/games/orange-2048',
    component: () => import('@/pages/Orange2048'),
  },
  'block-puzzle': {
    id: 'block-puzzle',
    name: 'Block Puzzle',
    path: '/games/block-puzzle',
    component: () => import('@/pages/BlockPuzzle'),
  },
} as const;

export type GameId = keyof typeof GAMES;
```

---

## Task 1.5: Extract FlappyOrange Config

**Problem:** FlappyOrange.tsx is 4,586 lines with inline config.

**Step 1:** Create config file `/src/pages/games/flappy-orange/config.ts`

First, search for config constants:
```bash
grep -n "^const.*=" src/pages/FlappyOrange.tsx | head -50
```

**Step 2:** Move all `const` declarations from top of file to `config.ts`:
- GRAVITY, FLAP_FORCE, PIPE_GAP, etc.
- Color arrays, difficulty settings
- Sound configuration

**Step 3:** Import config in FlappyOrange.tsx:
```typescript
import { PHYSICS, COLORS, SOUNDS } from './games/flappy-orange/config';
```

**Goal:** FlappyOrange.tsx should drop by ~500 lines after extracting config.

---

## Task 1.6: Extract FlappyOrange Components

**Problem:** Weather system, particle system, and bird rendering are all inline.

**Create:** `/src/pages/games/flappy-orange/components/`

**Step 1:** Identify component boundaries:
```bash
grep -n "// ==\|Weather\|Particle\|Bird\|Pipe" src/pages/FlappyOrange.tsx | head -30
```

**Step 2:** Extract into separate files:
- `WeatherSystem.tsx` - Weather effects (rain, snow, wind)
- `ParticleSystem.tsx` - Particle rendering
- `Bird.tsx` - Bird component and physics
- `Pipe.tsx` - Pipe rendering

**Step 3:** Update imports in FlappyOrange.tsx

**Goal:** FlappyOrange.tsx should be under 1,500 lines after extraction.

---

## Task 1.7: Extract BlockPuzzle Config

**Problem:** BlockPuzzle.tsx is 2,936 lines with inline config.

**Search for config:**
```bash
grep -n "^const.*=" src/pages/BlockPuzzle.tsx | head -40
```

**Move to:** `/src/pages/games/block-puzzle/config.ts`
- BLOCK_SHAPES
- BLOCK_COLORS
- FREEZE_DURATIONS
- SHAKE_CONFIG
- HAPTIC_PATTERNS
- DANGER_THRESHOLDS
- COMBO_SOUND_CONFIG
- LINE_CLEAR_SOUNDS

**Goal:** BlockPuzzle.tsx should drop by ~300 lines.

---

## Task 1.8: Create Shared Game Container CSS

**Problem:** Each game creates its own container styles with hardcoded colors.

**Create file:** `/src/styles/game-container.css`

```css
/* Shared game container styles using CSS variables */
.game-container-base {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: var(--gradient-game-bg,
    linear-gradient(180deg,
      var(--color-bg-primary) 0%,
      var(--color-bg-secondary) 50%,
      var(--color-bg-primary) 100%
    )
  );
  padding: var(--game-padding, 12px);
  gap: var(--game-gap, 12px);
  overflow: hidden;
  position: relative;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

/* Ambient glow effect */
.game-container-base::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 30%,
    var(--color-tang-500-10, rgba(255, 107, 0, 0.05)) 0%,
    transparent 60%
  );
  animation: ambient-glow 5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ambient-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .game-container-base {
    padding: var(--game-padding-mobile, 8px);
    gap: var(--game-gap-mobile, 8px);
  }
}

/* Safe area support */
@supports (padding-top: env(safe-area-inset-top)) {
  .game-container-base {
    padding-top: calc(var(--game-padding, 12px) + env(safe-area-inset-top));
    padding-bottom: calc(var(--game-padding, 12px) + env(safe-area-inset-bottom));
  }
}
```

**Add to index.css:**
```css
@import './styles/game-container.css';
```

---

## Verification After Phase 1

Run these checks:

```bash
# Build should pass
npm run build

# Check file sizes improved
wc -l src/pages/FlappyOrange.tsx
wc -l src/pages/BlockPuzzle.tsx

# Verify no broken imports
npm run dev
# Open each game and verify it loads
```

**Checklist:**
- [ ] Shared types file created
- [ ] GameButton component created
- [ ] OrangeStack duplicate removed
- [ ] Game index file created
- [ ] FlappyOrange config extracted
- [ ] FlappyOrange under 2,000 lines
- [ ] BlockPuzzle config extracted
- [ ] Shared game container CSS created
- [ ] All games still load and play
