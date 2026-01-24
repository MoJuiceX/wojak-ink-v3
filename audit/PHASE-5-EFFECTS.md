# Phase 5: Effects Standardization ("Juice")

**Goal:** All games have consistent, satisfying visual and audio feedback.

**Time Estimate:** 30 minutes

---

## The "Juice" Philosophy

Every player action should feel satisfying through:
1. **Visual feedback** - Shockwaves, particles, screen shake
2. **Audio feedback** - Satisfying sounds that escalate with combos
3. **Haptic feedback** - Vibration patterns on mobile
4. **Timing** - Effects feel immediate but not overwhelming

---

## Current Effects Systems

**Two systems exist:**

1. **`useGameEffects()`** from `@/components/media`
   - Used by: MemoryMatch, FlappyOrange, WojakRunner, ColorReaction, Orange2048, BlockPuzzle
   - Functions: `triggerShockwave`, `triggerSparks`, `triggerConfetti`, `showEpicCallout`, etc.

2. **`useEffects()`** from `@/systems/effects`
   - Newer, more structured
   - Used by: BrickByBrick (partially)

**Decision:** Standardize on `useGameEffects()` since 6/7 games already use it.

---

## Task 5.1: Document Standard Effect Triggers

**Create file:** `/src/games/shared/effectPatterns.ts`

```typescript
/**
 * Standard effect patterns all games should follow.
 * Import useGameEffects and trigger these effects for consistent "juice".
 */

import type { GameEffects } from '@/components/media';

// When player scores points
export const onScore = (effects: GameEffects, points: number, x: number, y: number) => {
  effects.addScorePopup?.(points, x, y);
  if (points >= 100) {
    effects.triggerSparks?.(x, y);
  }
};

// When player gets a perfect/bonus action
export const onPerfect = (effects: GameEffects, x: number, y: number) => {
  effects.triggerShockwave?.(x, y, '#ffd700');
  effects.triggerSparks?.(x, y, '#ffd700');
  effects.showEpicCallout?.('PERFECT!');
};

// When combo increases
export const onCombo = (effects: GameEffects, combo: number, x: number, y: number) => {
  effects.updateCombo?.(combo);

  if (combo >= 2) {
    effects.showEpicCallout?.(`${combo}x COMBO!`);
  }
  if (combo >= 3) {
    effects.triggerShockwave?.(x, y);
  }
  if (combo >= 5) {
    effects.triggerConfetti?.();
  }
  if (combo >= 7) {
    effects.triggerScreenShake?.(Math.min(combo - 4, 5));
  }
  if (combo >= 10) {
    effects.triggerVignette?.('#ffd700');
  }
};

// When level/round is complete
export const onLevelComplete = (effects: GameEffects) => {
  effects.triggerConfetti?.();
  effects.showEpicCallout?.('LEVEL UP!');
  effects.triggerShockwave?.(50, 50, '#ffd700');
};

// When player wins/achieves victory
export const onVictory = (effects: GameEffects) => {
  effects.triggerConfetti?.();
  effects.triggerConfetti?.(); // Double confetti!
  effects.showEpicCallout?.('VICTORY!');
  effects.triggerScreenShake?.(3);
};

// When player loses/fails
export const onGameOver = (effects: GameEffects) => {
  effects.triggerVignette?.('#ff0000');
  effects.triggerScreenShake?.(2);
  effects.resetCombo?.();
};

// When player takes damage/makes mistake
export const onMistake = (effects: GameEffects) => {
  effects.triggerVignette?.('#ff4444');
  effects.triggerScreenShake?.(1);
};
```

---

## Task 5.2: Verify Each Game Has Required Effects

**For each game, check these effect triggers exist:**

| Event | Effect | Sound | Haptic |
|-------|--------|-------|--------|
| Score earned | `addScorePopup` | `playBlockLand()` | light (10ms) |
| Perfect action | `triggerShockwave` + `triggerSparks` | `playPerfectBonus()` | medium (50ms) |
| Combo 2+ | `showEpicCallout` | `playCombo(level)` | pattern |
| Combo 5+ | `triggerConfetti` | escalated | stronger |
| Level complete | `triggerConfetti` | `playWinSound()` | celebration |
| Game over | `triggerVignette` (red) | `playGameOver()` | error |

**Check command for each game:**
```bash
FILE="src/pages/BlockPuzzle.tsx"
echo "=== Effects in $FILE ==="
grep -c "triggerShockwave\|addScorePopup\|triggerSparks\|triggerConfetti\|showEpicCallout\|triggerVignette\|triggerScreenShake" $FILE
```

---

## Task 5.3: Update BrickByBrick to Use useGameEffects

**File:** `/src/pages/BrickByBrick.tsx`

**Search current effects:**
```bash
grep -n "useEffects\|useGameEffects\|triggerEffect" src/pages/BrickByBrick.tsx | head -10
```

**Replace `useEffects` with `useGameEffects`:**

```typescript
// BEFORE
import { useEffects } from '@/systems/effects';
const { triggerEffect } = useEffects();
triggerEffect('shockwave', { position: { x, y } });

// AFTER
import { useGameEffects, GameEffects } from '@/components/media';
const effects = useGameEffects();
effects.triggerShockwave?.(x, y);
```

---

## Task 5.4: Add Missing Effects to Games

**Go through each game and add missing effects:**

### FlappyOrange
```bash
grep -n "triggerShockwave\|addScorePopup\|triggerConfetti" src/pages/FlappyOrange.tsx
```

**Should have:**
- [ ] Score popup on pipe pass
- [ ] Shockwave on milestone (10, 25, 50, 100)
- [ ] Confetti on new high score
- [ ] Vignette on death

### BlockPuzzle
**Should have:**
- [ ] Shockwave on line clear
- [ ] Screen shake on multi-line clear
- [ ] Confetti on perfect clear
- [ ] Epic callout on DOUBLE/TRIPLE/QUAD

### MemoryMatch
**Should have:**
- [ ] Shockwave on match
- [ ] Sparks on match
- [ ] Confetti on round complete
- [ ] Epic callout on streak

### WojakRunner
**Should have:**
- [ ] Sparks + score popup on collect
- [ ] Shockwave on streak milestone
- [ ] Vignette on collision

### ColorReaction
**Should have:**
- [ ] Shockwave on correct tap
- [ ] Confetti on fever mode
- [ ] Vignette on wrong tap

### Orange2048
**Should have:**
- [ ] Sparks on merge
- [ ] Shockwave on high tile (512, 1024, 2048)
- [ ] Confetti on 2048 achieved

---

## Task 5.5: Standardize Sound Triggers

**All games should use `useGameSounds` consistently:**

```typescript
import { useGameSounds } from '@/hooks/useGameSounds';

const {
  playBlockLand,      // Generic positive feedback
  playPerfectBonus,   // Perfect/bonus action
  playCombo,          // Combo (pass level for escalation)
  playWinSound,       // Victory
  playGameOver,       // Loss
} = useGameSounds();
```

**Check each game uses the hook:**
```bash
grep -l "useGameSounds" src/pages/FlappyOrange.tsx src/pages/BlockPuzzle.tsx src/pages/BrickByBrick.tsx src/pages/MemoryMatch.tsx src/pages/WojakRunner.tsx src/pages/ColorReaction.tsx src/pages/Orange2048.tsx
```

---

## Task 5.6: Standardize Haptic Triggers

**All games should use `useGameHaptics`:**

```typescript
import { useGameHaptics } from '@/systems/haptics';

const haptics = useGameHaptics();

// Usage:
haptics.light();        // Minor interaction
haptics.medium();       // Successful action
haptics.heavy();        // Major event
haptics.success();      // Win/complete
haptics.error();        // Mistake/fail
haptics.selection();    // UI selection
```

**Check each game:**
```bash
grep -l "useGameHaptics\|useHaptic\|vibrate" src/pages/*.tsx
```

---

## Task 5.7: Create Effect Timing Constants

**Add to `/src/games/shared/effectPatterns.ts`:**

```typescript
// Timing constants for consistent feel
export const EFFECT_TIMING = {
  // Delay before showing score popup (feels more connected to action)
  SCORE_POPUP_DELAY: 0,

  // Duration of shockwave
  SHOCKWAVE_DURATION: 300,

  // How long to show epic callout
  CALLOUT_DURATION: 1500,

  // Screen shake duration by intensity
  SHAKE_DURATION: {
    light: 150,
    medium: 300,
    heavy: 500,
  },

  // Confetti duration
  CONFETTI_DURATION: 3000,

  // Combo display duration
  COMBO_DISPLAY: 2000,
};
```

---

## Task 5.8: Verify GameEffects Component Rendered

**Each game must render the effects:**

```bash
grep -n "<GameEffects" src/pages/FlappyOrange.tsx src/pages/BlockPuzzle.tsx src/pages/BrickByBrick.tsx src/pages/MemoryMatch.tsx src/pages/WojakRunner.tsx src/pages/ColorReaction.tsx src/pages/Orange2048.tsx
```

**If missing, add to each game's JSX:**
```tsx
import { useGameEffects, GameEffects } from '@/components/media';

// At component level:
const effects = useGameEffects();

// In JSX (at the end, inside main container):
return (
  <div className="game-container">
    {/* game content */}
    <GameEffects effects={effects} />
  </div>
);
```

---

## Verification After Phase 5

**Visual consistency test:**

Play each game and verify these feel the same:

1. **Scoring feels satisfying**
   - [ ] All games show score popup
   - [ ] All games have a "pop" feel on score

2. **Combos escalate properly**
   - [ ] Combo 2-3: Callout text
   - [ ] Combo 4-5: Add shockwave
   - [ ] Combo 6+: Add confetti
   - [ ] Combo 8+: Add screen shake

3. **Winning feels epic**
   - [ ] Confetti bursts
   - [ ] Celebratory sound
   - [ ] Haptic celebration

4. **Losing feels impactful**
   - [ ] Red vignette flash
   - [ ] Screen shake
   - [ ] Sad sound

5. **Sound consistency**
   - [ ] Same sounds for same actions across games
   - [ ] Volume levels consistent

**Checklist:**
- [ ] effectPatterns.ts created
- [ ] BrickByBrick uses useGameEffects
- [ ] All games have required effects
- [ ] All games use useGameSounds
- [ ] All games use useGameHaptics
- [ ] Effect timing constants created
- [ ] GameEffects component rendered in all games
- [ ] Effects feel consistent across all games
