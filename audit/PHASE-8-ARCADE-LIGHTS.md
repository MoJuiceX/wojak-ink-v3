# PHASE 8: Arcade Button Light Sequences

**Prerequisites:** Phase 7 complete (games using shared infrastructure)

**Time Budget:** 1.5-2 hours

**Reference:** See `ARCADE-LIGHT-SEQUENCES.md` for full specification and user preferences.

---

## Overview

Transform the arcade frame button lights from simple pulsing to authentic, reactive arcade cabinet lighting that responds to gameplay events.

**Current state:** Lights pulse constantly during idle, turn OFF during gameplay.

**Target state:** Lights react to game events (scoring, combos, wins, game over) with escalating drama.

---

## Task 1: Create ArcadeLightsContext (20 min)

**Create file:** `src/contexts/ArcadeLightsContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type LightSequence =
  | 'off'
  | 'idle'
  | 'startup'
  | 'gameStart'
  | 'playing'
  | 'score'
  | 'combo'
  | 'win'
  | 'highScore'
  | 'gameOver';

type PlayingIntensity = 'very-low' | 'low' | 'medium' | 'high';
type ScoreSize = 'small' | 'medium' | 'large';

interface LightOptions {
  intensity?: PlayingIntensity;
  comboLevel?: number;
  scoreSize?: ScoreSize;
}

interface ArcadeLightsContextType {
  sequence: LightSequence;
  options: LightOptions;
  setSequence: (seq: LightSequence, opts?: LightOptions) => void;
  triggerScore: (size?: ScoreSize) => void;
  setCombo: (level: number) => void;
  clearCombo: () => void;
}

const ArcadeLightsContext = createContext<ArcadeLightsContextType | null>(null);

export function ArcadeLightsProvider({ children }: { children: ReactNode }) {
  const [sequence, setSequenceState] = useState<LightSequence>('off');
  const [options, setOptions] = useState<LightOptions>({});
  const previousSequenceRef = useRef<LightSequence>('playing');

  const setSequence = useCallback((seq: LightSequence, opts?: LightOptions) => {
    if (seq !== 'score') {
      previousSequenceRef.current = seq;
    }
    setSequenceState(seq);
    setOptions(opts || {});
  }, []);

  const triggerScore = useCallback((size: ScoreSize = 'medium') => {
    setSequenceState('score');
    setOptions({ scoreSize: size });

    // Return to previous state after flash
    setTimeout(() => {
      setSequenceState(previousSequenceRef.current);
    }, 300);
  }, []);

  const setCombo = useCallback((level: number) => {
    if (level >= 2) {
      setSequenceState('combo');
      setOptions({ comboLevel: level });
    }
  }, []);

  const clearCombo = useCallback(() => {
    setSequenceState('playing');
    setOptions({});
  }, []);

  return (
    <ArcadeLightsContext.Provider value={{
      sequence,
      options,
      setSequence,
      triggerScore,
      setCombo,
      clearCombo,
    }}>
      {children}
    </ArcadeLightsContext.Provider>
  );
}

export function useArcadeLights() {
  const context = useContext(ArcadeLightsContext);
  if (!context) {
    // Return no-op functions when outside provider (e.g., mobile)
    return {
      sequence: 'off' as LightSequence,
      options: {},
      setSequence: () => {},
      triggerScore: () => {},
      setCombo: () => {},
      clearCombo: () => {},
    };
  }
  return context;
}
```

---

## Task 2: Add New CSS Animations (30 min)

**Modify file:** `src/components/ArcadeButtonLights.css`

**Add after existing sequences:**

```css
/* ============================================
   PLAYING SEQUENCE - subtle ambient
   ============================================ */

/* Very low intensity (Block Puzzle) */
.arcade-lights-playing-very-low .arcade-glow {
  animation: playing-glow 5s ease-in-out infinite;
  --playing-opacity: 0.15;
}

/* Low intensity (Flappy, Memory, 2048, Runner) */
.arcade-lights-playing-low .arcade-glow {
  animation: playing-glow 4s ease-in-out infinite;
  --playing-opacity: 0.25;
}

/* Medium intensity (Color React, Brick) */
.arcade-lights-playing-medium .arcade-glow {
  animation: playing-glow 3s ease-in-out infinite;
  --playing-opacity: 0.35;
}

@keyframes playing-glow {
  0%, 100% { opacity: var(--playing-opacity, 0.25); }
  50% { opacity: calc(var(--playing-opacity, 0.25) + 0.1); }
}

/* ============================================
   SCORE SEQUENCE - quick flash
   ============================================ */

/* Small score - 2 buttons */
.arcade-lights-score-small .arcade-glow-bottom3,
.arcade-lights-score-small .arcade-glow-bottom5 {
  animation: score-flash 0.3s ease-out forwards;
}

/* Medium score - 4 buttons */
.arcade-lights-score-medium .arcade-glow-bottom2,
.arcade-lights-score-medium .arcade-glow-bottom3,
.arcade-lights-score-medium .arcade-glow-bottom5,
.arcade-lights-score-medium .arcade-glow-bottom6 {
  animation: score-flash 0.3s ease-out forwards;
}

/* Large score - all bottom + green */
.arcade-lights-score-large .arcade-glow-bottom1,
.arcade-lights-score-large .arcade-glow-bottom2,
.arcade-lights-score-large .arcade-glow-bottom3,
.arcade-lights-score-large .arcade-glow-bottom4,
.arcade-lights-score-large .arcade-glow-bottom5,
.arcade-lights-score-large .arcade-glow-bottom6,
.arcade-lights-score-large .arcade-glow-bottom7,
.arcade-lights-score-large .arcade-glow-right5 {
  animation: score-flash 0.3s ease-out forwards;
}

@keyframes score-flash {
  0% { opacity: 1; filter: brightness(1.3); }
  100% { opacity: var(--playing-opacity, 0.25); filter: brightness(1); }
}

/* ============================================
   COMBO SEQUENCE - escalating drama
   ============================================ */

/* Combo 2-4: Faster breathing, bottom row only */
.arcade-lights-combo-low .arcade-glow-bottom1,
.arcade-lights-combo-low .arcade-glow-bottom2,
.arcade-lights-combo-low .arcade-glow-bottom3,
.arcade-lights-combo-low .arcade-glow-bottom4,
.arcade-lights-combo-low .arcade-glow-bottom5,
.arcade-lights-combo-low .arcade-glow-bottom6,
.arcade-lights-combo-low .arcade-glow-bottom7 {
  animation: combo-breathe 1.5s ease-in-out infinite;
}

/* Combo 5-7: Chase pattern, bottom + right */
.arcade-lights-combo-mid .arcade-glow {
  animation: combo-chase 1s ease-in-out infinite;
}
.arcade-lights-combo-mid .arcade-glow-bottom1 { animation-delay: 0s; }
.arcade-lights-combo-mid .arcade-glow-bottom2 { animation-delay: 0.08s; }
.arcade-lights-combo-mid .arcade-glow-bottom3 { animation-delay: 0.16s; }
.arcade-lights-combo-mid .arcade-glow-bottom4 { animation-delay: 0.24s; }
.arcade-lights-combo-mid .arcade-glow-bottom5 { animation-delay: 0.32s; }
.arcade-lights-combo-mid .arcade-glow-bottom6 { animation-delay: 0.40s; }
.arcade-lights-combo-mid .arcade-glow-bottom7 { animation-delay: 0.48s; }
.arcade-lights-combo-mid .arcade-glow-right5 { animation-delay: 0.56s; }
.arcade-lights-combo-mid .arcade-glow-right4 { animation-delay: 0.64s; }
.arcade-lights-combo-mid .arcade-glow-right3 { animation-delay: 0.72s; }
.arcade-lights-combo-mid .arcade-glow-right2 { animation-delay: 0.80s; }
.arcade-lights-combo-mid .arcade-glow-right1 { animation-delay: 0.88s; }
.arcade-lights-combo-mid .arcade-glow-left1 { animation-delay: 0.44s; }

/* Combo 8-9: Fast chase, all buttons */
.arcade-lights-combo-high .arcade-glow {
  animation: combo-chase 0.6s ease-in-out infinite;
}
.arcade-lights-combo-high .arcade-glow-bottom1 { animation-delay: 0s; }
.arcade-lights-combo-high .arcade-glow-bottom2 { animation-delay: 0.05s; }
.arcade-lights-combo-high .arcade-glow-bottom3 { animation-delay: 0.10s; }
.arcade-lights-combo-high .arcade-glow-bottom4 { animation-delay: 0.15s; }
.arcade-lights-combo-high .arcade-glow-bottom5 { animation-delay: 0.20s; }
.arcade-lights-combo-high .arcade-glow-bottom6 { animation-delay: 0.25s; }
.arcade-lights-combo-high .arcade-glow-bottom7 { animation-delay: 0.30s; }
.arcade-lights-combo-high .arcade-glow-right5 { animation-delay: 0.35s; }
.arcade-lights-combo-high .arcade-glow-right4 { animation-delay: 0.40s; }
.arcade-lights-combo-high .arcade-glow-right3 { animation-delay: 0.45s; }
.arcade-lights-combo-high .arcade-glow-right2 { animation-delay: 0.50s; }
.arcade-lights-combo-high .arcade-glow-right1 { animation-delay: 0.55s; }
.arcade-lights-combo-high .arcade-glow-left1 { animation-delay: 0.28s; }

/* Combo 10+: STROBE - all buttons */
.arcade-lights-combo-max .arcade-glow {
  animation: strobe 0.3s linear infinite;
}

@keyframes combo-breathe {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes combo-chase {
  0%, 100% { opacity: 0.2; }
  30%, 50% { opacity: 1; filter: brightness(1.2); }
}

@keyframes strobe {
  0%, 49% { opacity: 1; filter: brightness(1.5); }
  50%, 100% { opacity: 0.1; }
}

/* ============================================
   HIGH SCORE SEQUENCE - maximum celebration
   ============================================ */

.arcade-lights-highScore .arcade-glow {
  animation: highscore-celebration 4s ease-in-out forwards;
}

@keyframes highscore-celebration {
  /* Phase 1: Rainbow chase (0-37.5%) */
  0% { opacity: 0.3; }
  5%, 10% { opacity: 1; filter: brightness(1.3) hue-rotate(0deg); }
  12%, 15% { opacity: 1; filter: brightness(1.3) hue-rotate(60deg); }
  17%, 20% { opacity: 1; filter: brightness(1.3) hue-rotate(120deg); }
  22%, 25% { opacity: 1; filter: brightness(1.3) hue-rotate(180deg); }
  27%, 30% { opacity: 1; filter: brightness(1.3) hue-rotate(240deg); }
  32%, 37% { opacity: 1; filter: brightness(1.3) hue-rotate(300deg); }

  /* Phase 2: Strobe (37.5-62.5%) */
  38%, 42% { opacity: 1; filter: brightness(1.5); }
  43%, 47% { opacity: 0.1; }
  48%, 52% { opacity: 1; filter: brightness(1.5); }
  53%, 57% { opacity: 0.1; }
  58%, 62% { opacity: 1; filter: brightness(1.5); }

  /* Phase 3: Victory pulse (62.5-87.5%) */
  63%, 75% { opacity: 0.6; filter: brightness(1); }
  70% { opacity: 1; filter: brightness(1.2); }
  76%, 87% { opacity: 0.6; }
  82% { opacity: 1; filter: brightness(1.2); }

  /* Phase 4: Fade to idle (87.5-100%) */
  100% { opacity: 0.7; filter: brightness(1); }
}

/* Stagger for chase effect in highScore */
.arcade-lights-highScore .arcade-glow-bottom1 { animation-delay: 0s; }
.arcade-lights-highScore .arcade-glow-bottom2 { animation-delay: 0.05s; }
.arcade-lights-highScore .arcade-glow-bottom3 { animation-delay: 0.10s; }
.arcade-lights-highScore .arcade-glow-bottom4 { animation-delay: 0.15s; }
.arcade-lights-highScore .arcade-glow-bottom5 { animation-delay: 0.20s; }
.arcade-lights-highScore .arcade-glow-bottom6 { animation-delay: 0.25s; }
.arcade-lights-highScore .arcade-glow-bottom7 { animation-delay: 0.30s; }
.arcade-lights-highScore .arcade-glow-right5 { animation-delay: 0.35s; }
.arcade-lights-highScore .arcade-glow-right4 { animation-delay: 0.40s; }
.arcade-lights-highScore .arcade-glow-right3 { animation-delay: 0.45s; }
.arcade-lights-highScore .arcade-glow-right2 { animation-delay: 0.50s; }
.arcade-lights-highScore .arcade-glow-right1 { animation-delay: 0.55s; }
.arcade-lights-highScore .arcade-glow-left1 { animation-delay: 0.25s; }

/* ============================================
   GAME OVER SEQUENCE - red flash then fade
   ============================================ */

.arcade-lights-gameOver .arcade-glow {
  animation: gameover-red-flash 1.5s ease-out forwards;
}

@keyframes gameover-red-flash {
  /* Flash 1 */
  0% { opacity: 0.5; }
  7% {
    opacity: 1;
    filter: brightness(1.2) saturate(2) hue-rotate(-30deg);
  }
  15% { opacity: 0.3; }

  /* Flash 2 */
  25% {
    opacity: 1;
    filter: brightness(1.2) saturate(2) hue-rotate(-30deg);
  }
  35% { opacity: 0.3; filter: brightness(1) saturate(1) hue-rotate(0deg); }

  /* Fade out */
  100% { opacity: 0; }
}

/* Cascade the fade */
.arcade-lights-gameOver .arcade-glow-bottom1,
.arcade-lights-gameOver .arcade-glow-bottom7 { animation-delay: 0s; }
.arcade-lights-gameOver .arcade-glow-bottom2,
.arcade-lights-gameOver .arcade-glow-bottom6 { animation-delay: 0.03s; }
.arcade-lights-gameOver .arcade-glow-bottom3,
.arcade-lights-gameOver .arcade-glow-bottom5 { animation-delay: 0.06s; }
.arcade-lights-gameOver .arcade-glow-bottom4 { animation-delay: 0.09s; }
.arcade-lights-gameOver .arcade-glow-left1 { animation-delay: 0.12s; }
.arcade-lights-gameOver .arcade-glow-right1 { animation-delay: 0.12s; }
.arcade-lights-gameOver .arcade-glow-right2 { animation-delay: 0.15s; }
.arcade-lights-gameOver .arcade-glow-right3 { animation-delay: 0.18s; }
.arcade-lights-gameOver .arcade-glow-right4 { animation-delay: 0.21s; }
.arcade-lights-gameOver .arcade-glow-right5 { animation-delay: 0.24s; }

/* ============================================
   TITLE GLOW REACTIONS
   ============================================ */

/* During gameplay - dimmer, slower */
.arcade-lights-playing-very-low .arcade-title-glow,
.arcade-lights-playing-low .arcade-title-glow,
.arcade-lights-playing-medium .arcade-title-glow {
  opacity: 0.5;
  animation: title-glow-pulse 4s ease-in-out infinite;
}

/* During combo - faster pulse */
.arcade-lights-combo-low .arcade-title-glow,
.arcade-lights-combo-mid .arcade-title-glow {
  animation: title-glow-pulse 1.5s ease-in-out infinite;
}

.arcade-lights-combo-high .arcade-title-glow {
  animation: title-glow-pulse 0.8s ease-in-out infinite;
}

/* Combo max - strobe with buttons */
.arcade-lights-combo-max .arcade-title-glow {
  animation: strobe 0.3s linear infinite;
}

/* High score - maximum brightness */
.arcade-lights-highScore .arcade-title-glow {
  opacity: 1;
  animation: title-highscore 4s ease-in-out forwards;
}

@keyframes title-highscore {
  0%, 62% { opacity: 1; filter: brightness(1.3); }
  38%, 42%, 48%, 52%, 58%, 62% { opacity: 1; }
  43%, 47%, 53%, 57% { opacity: 0.3; }
  100% { opacity: 0.7; }
}

/* Game over - dim during flashes */
.arcade-lights-gameOver .arcade-title-glow {
  animation: title-gameover 1.5s ease-out forwards;
}

@keyframes title-gameover {
  0%, 7%, 25% { opacity: 0.3; }
  15%, 35% { opacity: 0.7; }
  100% { opacity: 0; }
}
```

---

## Task 3: Update ArcadeButtonLights.tsx (20 min)

**Modify file:** `src/components/ArcadeButtonLights.tsx`

**Changes needed:**

1. Import the new LightSequence type that includes new sequences
2. Update the component to apply correct CSS classes based on sequence + options

```typescript
// Update the type to include new sequences
export type LightSequence =
  | 'off'
  | 'startup'
  | 'idle'
  | 'gameStart'
  | 'playing'
  | 'score'
  | 'combo'
  | 'win'
  | 'highScore'
  | 'gameOver';

// Add interface for options
interface LightOptions {
  intensity?: 'very-low' | 'low' | 'medium' | 'high';
  comboLevel?: number;
  scoreSize?: 'small' | 'medium' | 'large';
}

interface ArcadeButtonLightsProps {
  sequence: LightSequence;
  options?: LightOptions;
  onSequenceComplete?: () => void;
}

// Update the component to build the correct class name
export function ArcadeButtonLights({
  sequence,
  options = {},
  onSequenceComplete
}: ArcadeButtonLightsProps) {

  // Build the CSS class based on sequence and options
  const getSequenceClass = () => {
    if (sequence === 'playing' && options.intensity) {
      return `arcade-lights-playing-${options.intensity}`;
    }
    if (sequence === 'score' && options.scoreSize) {
      return `arcade-lights-score-${options.scoreSize}`;
    }
    if (sequence === 'combo' && options.comboLevel) {
      if (options.comboLevel >= 10) return 'arcade-lights-combo-max';
      if (options.comboLevel >= 8) return 'arcade-lights-combo-high';
      if (options.comboLevel >= 5) return 'arcade-lights-combo-mid';
      return 'arcade-lights-combo-low';
    }
    return `arcade-lights-${sequence}`;
  };

  // ... rest of component
  return (
    <div className={`arcade-button-lights ${getSequenceClass()}`}>
      {/* existing button glow elements */}
    </div>
  );
}
```

---

## Task 4: Update GameModal Integration (15 min)

**Modify file:** `src/components/media/games/GameModal.tsx`

**Changes:**

1. Import ArcadeLightsProvider
2. Wrap arcade frame content with provider
3. Pass sequence and options to ArcadeFrame

```typescript
import { ArcadeLightsProvider, useArcadeLights } from '@/contexts/ArcadeLightsContext';

// Inside the component, wrap the ArcadeFrame:
<ArcadeLightsProvider>
  <ArcadeFrame
    variant={frameVariant}
    lightSequence={lightSequence}
    lightOptions={lightOptions}  // NEW
    onLightSequenceComplete={handleLightSequenceComplete}
    // ... other props
  >
    {/* game content */}
  </ArcadeFrame>
</ArcadeLightsProvider>
```

---

## Task 5: Integrate into ONE Game (20 min)

**Start with:** Flappy Orange (most event types)

**File:** `src/pages/FlappyOrange.tsx`

**Add at component level:**
```typescript
import { useArcadeLights } from '@/contexts/ArcadeLightsContext';

// Inside component
const { setSequence, triggerScore, setCombo, clearCombo } = useArcadeLights();

// When game starts
useEffect(() => {
  if (gameState === 'playing') {
    setSequence('playing', { intensity: 'low' });
  }
}, [gameState]);

// When passing a pipe (find the score increment location)
// Add after score increment:
if (consecutivePipes >= 2) {
  setCombo(consecutivePipes);
}
if (consecutivePipes % 5 === 0) {
  triggerScore('medium');
}

// On game over (find the collision/death handler)
clearCombo();
setSequence('gameOver');

// Check for high score and trigger celebration
if (score > highScore) {
  setTimeout(() => setSequence('highScore'), 1500);
}
```

---

## Task 6: Test All Sequences (15 min)

**Manual testing checklist:**

1. Open any game in desktop mode
2. Verify `idle` breathing on game select screen
3. Click start - verify `gameStart` burst
4. Play - verify `playing` ambient glow
5. Score points - verify `score` flash (if integrated)
6. Build combo - verify escalation through tiers
7. Lose - verify `gameOver` red flash
8. Beat high score - verify `highScore` celebration

**Quick test panel (optional):**
Add temporary debug buttons to test each sequence:
```typescript
// Temporary - remove after testing
<div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999 }}>
  <button onClick={() => setSequence('idle')}>Idle</button>
  <button onClick={() => setSequence('playing', { intensity: 'medium' })}>Playing</button>
  <button onClick={() => triggerScore('large')}>Score</button>
  <button onClick={() => setCombo(5)}>Combo 5</button>
  <button onClick={() => setCombo(10)}>Combo 10</button>
  <button onClick={() => setSequence('gameOver')}>Game Over</button>
  <button onClick={() => setSequence('highScore')}>High Score</button>
</div>
```

---

## Files Summary

**Create:**
- `src/contexts/ArcadeLightsContext.tsx`

**Modify:**
- `src/components/ArcadeButtonLights.css` (add new animations)
- `src/components/ArcadeButtonLights.tsx` (handle new sequences)
- `src/components/ArcadeFrame.tsx` (pass options prop)
- `src/components/media/games/GameModal.tsx` (add provider)
- `src/pages/FlappyOrange.tsx` (integrate hooks)

---

## Success Criteria

- [ ] All existing sequences still work (idle, startup, gameStart, win, gameOver)
- [ ] `playing` shows subtle ambient glow during gameplay
- [ ] `score` flashes on big point gains
- [ ] `combo` escalates visibly through 4 tiers
- [ ] `combo` 10+ triggers strobe effect
- [ ] `highScore` plays full 4-phase celebration
- [ ] `gameOver` shows red flash before fade
- [ ] Title glow reacts to game state
- [ ] Build passes with no errors
- [ ] Mobile still works (lights disabled)
