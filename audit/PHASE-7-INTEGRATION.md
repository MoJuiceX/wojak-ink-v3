# PHASE 7: Integration Sprint

**Context:** Phases 1-6 created infrastructure but didn't wire it up. This phase is ONLY about connecting existing pieces - NO new files.

**Time Budget:** 2 hours maximum

**Rule:** If it takes more than 10 minutes to integrate something into ONE game, skip it and move to the next task.

---

## Priority Order (Do in this exact order)

### 1. Orange2048 - Full Integration (30 min)
**Why first:** Smallest game (462 lines), easiest to modify, proves the pattern works.

**Tasks:**
```bash
# File: src/games/Orange2048/Orange2048.tsx
```

1. **Remove @ts-nocheck** (line 1)
   - Delete `// @ts-nocheck`
   - Fix any TypeScript errors that appear (should be minimal)

2. **Import and use GameButton**
   ```typescript
   // Add import at top
   import { GameButton } from '@/components/ui/GameButton';

   // Find all <button> elements and replace with <GameButton>
   // Example: <button onClick={...}>New Game</button>
   // Becomes: <GameButton onClick={...}>New Game</GameButton>
   ```

3. **Import and use useGameTouch** (if game has touch handling)
   ```typescript
   import { useGameTouch } from '@/hooks/useGameTouch';

   // Replace manual touch handlers with hook
   const touchHandlers = useGameTouch({
     onSwipe: (direction) => {
       if (direction === 'up') move('up');
       // etc...
     }
   });

   // Spread onto game container
   <div {...touchHandlers} className="game-board">
   ```

4. **Verify config.ts is being used**
   ```bash
   # Check if Orange2048 imports from its config
   grep -n "from.*config" src/games/Orange2048/Orange2048.tsx
   ```
   If not importing, add:
   ```typescript
   import { GAME_CONFIG, COLORS, ANIMATIONS } from './config';
   ```

**Success criteria:** Orange2048 builds, runs, and uses shared components.

---

### 2. Memory Match - GameButton Only (15 min)
**Why:** Second smallest, simple button replacement.

**File:** `src/games/MemoryMatch/MemoryMatch.tsx` or `src/pages/MemoryMatch.tsx`

**Tasks:**
1. Keep @ts-nocheck (fix TypeScript later)
2. Import GameButton
3. Replace restart/menu buttons only (NOT the card flip buttons)

**Success criteria:** GameButton visible in Memory Match UI.

---

### 3. FlappyOrange - Config Import Only (20 min)
**Why:** Largest file, but config already extracted. Just wire it up.

**File:** `src/pages/FlappyOrange.tsx`

**DO NOT attempt to:**
- Remove @ts-nocheck
- Split the file
- Fix all issues

**ONLY do:**
1. Add import at top:
   ```typescript
   import {
     PHYSICS,
     JUICE_CONFIG,
     DIFFICULTY_CONFIG,
     BIRD_RADIUS,
     PIPE_WIDTH,
     PIPE_GAP,
     PIPE_SPACING,
   } from './games/flappy-orange/config';
   ```

2. Find and replace ONE hardcoded value to prove it works:
   ```typescript
   // Find something like:
   const GRAVITY = 0.2;
   // Replace with:
   const GRAVITY = PHYSICS.GRAVITY;
   ```

3. **Stop there.** Don't try to replace everything.

**Success criteria:** FlappyOrange builds and runs with at least one config import.

---

### 4. Block Puzzle - Config Import Only (15 min)
**Same approach as FlappyOrange:**

**File:** `src/pages/BlockPuzzle.tsx`

1. Import from config
2. Replace ONE hardcoded value
3. Stop

---

### 5. Timer Cleanup in ONE Game (20 min)
**Pick:** FlappyOrange (most timers) OR WojakRunner

**DO NOT try to fix all timers.** Fix the most obvious one.

**Pattern to find:**
```typescript
// Bad - timer not cleaned up
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  // Missing: return () => clearTimeout(timer);
}, []);
```

**Fix pattern:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  return () => clearTimeout(timer);  // ADD THIS
}, []);
```

**Find timers:**
```bash
grep -n "setTimeout\|setInterval" src/pages/FlappyOrange.tsx | head -20
```

**Success criteria:** At least 2-3 timers have cleanup added.

---

### 6. CSS Variables - One Game (15 min)
**Pick:** Color React (most colorful, will benefit most)

**File:** `src/pages/ColorReaction.tsx` and `src/pages/ColorReaction.css`

**Find hardcoded colors:**
```bash
grep -n "#[0-9a-fA-F]\{6\}" src/pages/ColorReaction.css
```

**Replace with CSS variables where sensible:**
```css
/* Before */
background: #1a1a2e;

/* After */
background: var(--color-bg-primary);
```

**Don't replace game-specific colors** (the actual color buttons should stay hardcoded).

---

## What NOT To Do

❌ Don't remove @ts-nocheck from large files (FlappyOrange, BlockPuzzle)
❌ Don't try to split useGameSounds.ts
❌ Don't create any new files
❌ Don't refactor entire games
❌ Don't fix "all" of anything - just fix ONE example per category

---

## Verification Commands

After each game modification:
```bash
# Build check
npm run build

# If build fails, check errors
npm run build 2>&1 | head -50

# Type check (optional, may have warnings)
npx tsc --noEmit
```

---

## Success Metrics for This Phase

✅ Orange2048 has NO @ts-nocheck and uses GameButton
✅ At least 2 games use GameButton
✅ At least 2 games import from their config.ts
✅ At least 3 timers have proper cleanup
✅ Build passes with no errors
✅ All games still run correctly

---

## If You Finish Early

**Bonus tasks (only if time permits):**
1. Add useGameTouch to Wojak Runner (swipe to jump)
2. Replace more buttons with GameButton in other games
3. Add more timer cleanups

---

## Reporting

When complete, provide:
1. List of files modified
2. Which tasks completed vs skipped
3. Any errors encountered
4. Games tested and verified working
