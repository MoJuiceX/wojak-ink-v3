# 🔄 SYNC PROMPT: Update Existing Games to New Systems

## When to Use This Prompt

Use this prompt when:
1. You've made improvements to the shared systems (effects, UI, engagement)
2. You want to ensure all existing games use the latest systems
3. You've added a new feature that all games should have
4. You're migrating older games to the shared architecture

---

## Current Games Inventory

| Game | ID | Status | Uses Shared Systems? |
|------|-----|--------|---------------------|
| Orange Stack | `orange-stack` | ✅ Live | 🔄 To Migrate |
| Memory Match | `memory-match` | ✅ Live | 🔄 To Migrate |
| Orange Pong | `orange-pong` | ✅ Live | 🔄 To Migrate |
| Wojak Runner | `wojak-runner` | ✅ Live | 🔄 To Migrate |
| Juggle the Orange | `juggle-orange` | ✅ Live | 🔄 To Migrate |
| The Knife Game | `knife-game` | ✅ Live | 🔄 To Migrate |
| Color Reaction | `color-reaction` | ✅ Live | 🔄 To Migrate |
| 2048 Merge | `2048-merge` | ✅ Live | 🔄 To Migrate |
| Orange Wordle | `orange-wordle` | ✅ Live | 🔄 To Migrate |

---

## TASK 1: Migrate Game to Shared Systems

For each game that needs migration, perform these steps:

### Step 1: Analyze Current Implementation

```bash
# Check current file structure
ls -la src/pages/[GameName].tsx
ls -la src/pages/[GameName].css

# Count lines to understand complexity
wc -l src/pages/[GameName].tsx
wc -l src/pages/[GameName].css
```

Read the current implementation and identify:
- [ ] How scoring is currently handled
- [ ] How effects are currently triggered
- [ ] How game over is currently shown
- [ ] What CSS is game-specific vs duplicated from other games

### Step 2: Create New Game Folder Structure

```bash
mkdir -p src/games/[GameName]/components
```

Create these files:
- `src/games/[GameName]/index.tsx` - Main component (refactored)
- `src/games/[GameName]/[GameName].game.css` - Game-specific styles only
- `src/games/[GameName]/use[GameName]Logic.ts` - Extracted game logic
- `src/games/[GameName]/config.ts` - Game configuration

### Step 3: Extract Game Logic

Move all game-specific logic into the custom hook:
- Game state (board, pieces, position, etc.)
- Game loop / update function
- Input handling
- Collision detection
- Scoring rules

Keep this OUT of the main component.

### Step 4: Refactor Main Component

Replace the main component to use:
```typescript
import { GameShell, GameHUD, GameOverScreen } from '../../systems/game-ui';
import { useGameSession } from '../../systems/engagement';
import { use[GameName]Logic } from './use[GameName]Logic';
```

Follow the template from `MASTER-game-creation-template.md`.

### Step 5: Migrate CSS

1. **DELETE** any CSS that duplicates shared systems:
   - Glassmorphism effects (use `.glass-panel` classes)
   - HUD styles (provided by GameHUD)
   - Game over modal styles (provided by GameOverScreen)
   - Effect animations (provided by effects system)

2. **KEEP** only game-specific CSS:
   - Game board layout
   - Game piece styles
   - Game-specific animations

### Step 6: Update Routing

If the game was at `/orange-stack`, keep it there but point to new location:

```typescript
// In routes
import OrangeStack from './games/OrangeStack';
<Route path="/orange-stack" component={OrangeStack} />
```

### Step 7: Test Thoroughly

- [ ] Game starts from intro screen
- [ ] Gameplay works as before
- [ ] Effects trigger correctly
- [ ] Score submits on game end
- [ ] Currency earned displays
- [ ] Play again works
- [ ] No visual regressions

### Step 8: Delete Old Files

Once confirmed working:
```bash
rm src/pages/[GameName].tsx
rm src/pages/[GameName].css
```

---

## TASK 2: Propagate New Effect to All Games

When you've added a new effect to the shared system:

### Step 1: Update Effects System

Already done - the new effect is in `src/systems/effects/`.

### Step 2: Update Presets (if applicable)

If the effect should be part of combo celebrations or game over:

```typescript
// In src/systems/effects/presets/combo.ts
export const getComboPreset = (level: number, position: { x: number; y: number }): EffectPreset => {
  const effects = [];

  // Add new effect at appropriate combo level
  if (level >= X) {
    effects.push({
      type: 'new-effect-name',
      position,
      data: { /* config */ },
      duration: 1000
    });
  }

  return { effects };
};
```

### Step 3: No Game Changes Needed!

Because games use `triggerPreset(getComboPreset(...))`, they automatically get the new effect.

---

## TASK 3: Add New Engagement Feature to All Games

When adding a feature like "Daily Challenges":

### Step 1: Create the Hook

```typescript
// src/systems/engagement/useDailyChallenge.ts
export const useDailyChallenge = (gameId: string) => {
  // Implementation
};
```

### Step 2: Integrate into useGameSession

```typescript
// In useGameSession.ts
import { useDailyChallenge } from './useDailyChallenge';

export const useGameSession = (options) => {
  const dailyChallenge = useDailyChallenge(options.gameId);

  // Include daily challenge in return
  return {
    // ... existing returns
    dailyChallenge
  };
};
```

### Step 3: Games Automatically Have Access

Because games use `useGameSession`, they now have:
```typescript
const { dailyChallenge } = useGameSession({ gameId: 'orange-stack' });
```

### Step 4: Update UI Components (if needed)

If the feature needs UI (like a daily challenge banner), add it to shared components:

```typescript
// src/systems/game-ui/DailyChallengeBanner.tsx
```

Then include in GameShell or GameHUD.

---

## TASK 4: Update Game Rewards Configuration

When changing how currency is earned:

### Step 1: Update Reward Config

```typescript
// src/types/currency.ts
export const GAME_REWARDS: Record<string, GameRewardConfig> = {
  'orange-stack': {
    baseOranges: 15,        // Changed from 10
    scoreMultiplier: 1.5,   // Changed from 1
    // ...
  },
  // Update for all games...
};
```

### Step 2: No Game Code Changes!

The `useGameSession` hook reads from `GAME_REWARDS` automatically.

---

## TASK 5: Sync Theme Changes

When updating colors, fonts, or design tokens:

### Step 1: Update Theme CSS

```css
/* src/systems/theme/colors.css */
:root {
  --color-primary: #FF9944; /* Changed from #FF8C32 */
}
```

### Step 2: No Other Changes Needed!

All components using `var(--color-primary)` update automatically.

---

## Migration Checklist for All 9 Games

### Orange Stack
- [ ] Create `src/games/OrangeStack/` folder
- [ ] Extract logic to `useOrangeStackLogic.ts`
- [ ] Create `config.ts`
- [ ] Refactor main component to use shared systems
- [ ] Move game-specific CSS only
- [ ] Update routing
- [ ] Test fully
- [ ] Delete old files

### Memory Match
- [ ] Create `src/games/MemoryMatch/` folder
- [ ] Extract logic to `useMemoryMatchLogic.ts`
- [ ] Create `config.ts`
- [ ] Refactor main component
- [ ] Move game-specific CSS
- [ ] Update routing
- [ ] Test fully
- [ ] Delete old files

### Orange Pong
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### Wojak Runner
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### Juggle the Orange
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### The Knife Game
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### Color Reaction
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### 2048 Merge
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

### Orange Wordle
- [ ] Create folder
- [ ] Extract logic
- [ ] Create config
- [ ] Refactor component
- [ ] Move CSS
- [ ] Update routing
- [ ] Test
- [ ] Delete old

---

## Automated Sync Verification Script

After any shared system update, run this verification:

```typescript
// scripts/verify-game-sync.ts

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const GAMES_DIR = 'src/games';
const REQUIRED_IMPORTS = [
  'GameShell',
  'useGameSession',
  'GameOverScreen'
];

const games = readdirSync(GAMES_DIR);

games.forEach(game => {
  const indexPath = join(GAMES_DIR, game, 'index.tsx');
  const content = readFileSync(indexPath, 'utf-8');

  REQUIRED_IMPORTS.forEach(imp => {
    if (!content.includes(imp)) {
      console.error(`❌ ${game} missing ${imp}`);
    }
  });

  console.log(`✅ ${game} verified`);
});
```

---

## Benefits of This Architecture

After migration, when you:

| You Change This... | All Games Get... |
|-------------------|------------------|
| Confetti particle count | Better confetti |
| Combo level colors | New color scheme |
| Game over modal design | Updated modal |
| Currency reward formula | New earning rates |
| Leaderboard submission | New submission logic |
| Achievement triggers | New achievements |
| HUD layout | Updated HUD |
| Theme colors | New color scheme |
| Add new effect | Access to new effect |

**One change = All 9+ games updated instantly.**
