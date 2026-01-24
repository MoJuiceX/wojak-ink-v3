# Arcade Button Light Sequences Specification

**Purpose:** Authentic arcade cabinet feel through dynamic button lighting.

**Implementation:** Reference document for manual implementation (not Claude CLI audit).

---

## Current System Summary

### Button Layout (13 total)

```
                    RIGHT SIDE (5 buttons)
                    ┌─────────────────────┐
                    │  right1 - RED       │  top
                    │  right2 - ORANGE    │
                    │  right3 - ORANGE    │
                    │  right4 - BLUE      │
                    │  right5 - GREEN     │  bottom
                    └─────────────────────┘

┌────────┐
│ left1  │  ←── RED button (single)
│  RED   │
└────────┘

        BOTTOM ROW (7 buttons)
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ b1   │ b2   │ b3   │ b4   │ b5   │ b6   │ b7   │
│ BLUE │ORANGE│ BLUE │ PINK │ BLUE │ PINK │GREEN │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

### Button Colors (hex values)
- **Blue:** `#3b82f6` (bottom1, bottom3, bottom5, right4)
- **Orange:** `#f97316` (bottom2, right2, right3)
- **Pink:** `#ec4899` (bottom4, bottom6)
- **Green:** `#22c55e` (bottom7, right5)
- **Red:** `#ef4444` (left1, right1)

### Existing CSS Glow System
- Bottom buttons: Upward-facing glow (no visible center dot)
- Right buttons: Internal bulb effect with radial gradient (80px, 30% opacity)
- Left button: Smaller bulb effect (53px, 24% opacity)
- Title glow: Separate PNG overlay that pulses

---

## User Preferences (Collected)

| Setting | Choice |
|---------|--------|
| Gameplay lights | **Game-specific** - ALL games should have active lights |
| Win triggers | **Both** - Level win (smaller) + High score (bigger) |
| Score feedback | **Only big scores** - Flash for combos/bonuses, not every point |
| Game over style | **Red flash then fade** - Two red flashes, then fade out |
| Attract/idle mode | **Current breathing wave** - Keep existing synchronized pulse |
| Combo feedback | **Full arcade drama** - Chase at 5+, strobe at 10+ |
| Title glow | **React to events** - Flash on big scores/wins, dim during intense play |
| Integration method | **React Context** - LightContext for games to trigger sequences |
| Seedling glow | **Not used** - Ignore this asset |

---

## Sequence Types

### Existing Sequences (keep/modify)
| Sequence | Duration | Current Behavior | Changes Needed |
|----------|----------|------------------|----------------|
| `off` | 0ms | No lights | Keep as-is |
| `idle` | ∞ | Breathing wave (2.5s cycle) | Keep as-is |
| `startup` | 1500ms | Center-out cascade | Keep as-is |
| `gameStart` | 800ms | Quick burst edges→center | Keep as-is |
| `win` | 3000ms | Perimeter chase | Modify for "level win" |
| `gameOver` | 1500ms | Fade out | **Change to red flash + fade** |

### New Sequences (to add)
| Sequence | Duration | Purpose |
|----------|----------|---------|
| `playing` | ∞ | Ambient during gameplay (game-specific) |
| `score` | 300ms | Quick flash for big point gains |
| `combo` | ∞ | Escalating pattern based on combo count |
| `highScore` | 4000ms | Maximum celebration for new records |

---

## Detailed Sequence Specifications

### 1. `idle` - Attract Mode (KEEP AS-IS)
Current breathing wave is preferred. No changes needed.

```css
/* Already implemented */
@keyframes idle-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
/* 2.5s cycle with staggered delays */
```

---

### 2. `playing` - Active Gameplay (NEW)

**Purpose:** Subtle ambient presence, game-specific intensity.

**Base Pattern:**
```css
@keyframes playing-glow {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.35; }
}
/* 4s cycle - very slow, unobtrusive */
```

**Game-Specific Variants:**

| Game | Intensity | Special Behavior |
|------|-----------|------------------|
| Flappy Orange | Low (20%) | Brief pulse on successful pipe pass |
| Color React | Medium (40%) | Buttons match game colors being shown |
| Wojak Runner | Low-Medium (30%) | Pulse syncs with running rhythm |
| Block Puzzle | Very Low (15%) | Almost dark, focus on puzzle |
| Memory Match | Low (20%) | Gentle ambient only |
| 2048 Merge | Low (20%) | Gentle ambient only |
| Brick by Brick | Medium (35%) | Pulse with ball bounces |

**Implementation:**
```typescript
type PlayingIntensity = 'very-low' | 'low' | 'medium';

const GAME_LIGHT_INTENSITY: Record<string, PlayingIntensity> = {
  'flappy-orange': 'low',
  'color-reaction': 'medium',
  'wojak-runner': 'low',
  'block-puzzle': 'very-low',
  'memory-match': 'low',
  'merge-2048': 'low',
  'brick-by-brick': 'medium',
};
```

---

### 3. `score` - Big Score Flash (NEW)

**Purpose:** Quick acknowledgment of significant point gains.

**Trigger:** Only for big scores (combos, bonuses, multipliers - NOT every point).

**Pattern:**
```
Timing: 300ms total
- 0ms: 3-4 random bottom buttons flash to 100%
- 100ms: Begin rapid fade
- 300ms: Return to playing state
```

**CSS:**
```css
@keyframes score-flash {
  0% { opacity: 1; filter: brightness(1.3); }
  100% { opacity: var(--playing-opacity, 0.25); }
}
/* Duration: 0.3s ease-out */
```

**Which buttons flash:**
- Small bonus: 2 random bottom buttons
- Medium bonus: 4 bottom buttons (center-weighted)
- Large bonus: All bottom buttons + right5 (green)

---

### 4. `combo` - Streak Escalation (NEW)

**Purpose:** Build excitement as combo grows. **FULL ARCADE DRAMA.**

**Escalation Tiers:**

| Combo | Pattern | Speed | Buttons |
|-------|---------|-------|---------|
| 2-4 | Faster breathing | 1.5s cycle | Bottom row only |
| 5-7 | Chase pattern | 1s cycle | Bottom + right side |
| 8-9 | Fast chase | 0.6s cycle | All buttons |
| 10+ | **STROBE** | 0.15s on/off | All buttons + title flash |

**CSS for each tier:**
```css
/* Combo 2-4: Accelerated breathing */
.arcade-lights-combo-low .arcade-glow-bottom1,
.arcade-lights-combo-low .arcade-glow-bottom2,
/* ... etc */
{
  animation: combo-breathe 1.5s ease-in-out infinite;
}

/* Combo 5-7: Chase pattern */
.arcade-lights-combo-mid .arcade-glow {
  animation: combo-chase 1s ease-in-out infinite;
}
/* Staggered delays create chase effect */

/* Combo 8-9: Fast chase */
.arcade-lights-combo-high .arcade-glow {
  animation: combo-chase 0.6s ease-in-out infinite;
}

/* Combo 10+: STROBE */
.arcade-lights-combo-max .arcade-glow {
  animation: strobe 0.3s linear infinite;
}

@keyframes strobe {
  0%, 49% { opacity: 1; filter: brightness(1.5); }
  50%, 100% { opacity: 0.1; }
}
```

**Title Glow Reaction:**
At combo 10+, title_glow.png should also strobe in sync.

---

### 5. `win` - Level Complete (MODIFY EXISTING)

**Purpose:** Celebrate level/round completion. Smaller than high score.

**Keep existing chase pattern but:**
- Duration: 2000ms (reduced from 3000ms)
- One full chase cycle around perimeter
- End with brief all-on flash, then fade to idle

**Sequence:**
```
0-1200ms: Perimeter chase (existing animation)
1200-1400ms: All buttons flash 100%
1400-2000ms: Fade to idle state
```

---

### 6. `highScore` - New Record (NEW)

**Purpose:** MAXIMUM CELEBRATION. Player beat their best!

**Pattern:** Multi-phase extravaganza

```
Phase 1 (0-1500ms): Rainbow Chase
  - Colors cycle through buttons regardless of their assigned color
  - Fast chase (50ms per button)
  - Color order: Red → Orange → Yellow → Green → Blue → Purple

Phase 2 (1500-2500ms): Full Strobe
  - All buttons rapid flash (100ms on/off)
  - White/gold color override
  - Title glow at maximum brightness

Phase 3 (2500-3500ms): Victory Pulse
  - All buttons pulse together at 60% → 100%
  - 0.4s cycle

Phase 4 (3500-4000ms): Graceful Fade
  - Slow fade to idle state
  - Random sparkle on 2-3 buttons during fade
```

**CSS (simplified):**
```css
.arcade-lights-highScore .arcade-glow {
  animation:
    rainbow-chase 1.5s linear,
    strobe 1s linear 1.5s,
    victory-pulse 1s ease-in-out 2.5s 2,
    fade-to-idle 0.5s ease-out 3.5s forwards;
}
```

---

### 7. `gameOver` - Game Ended (MODIFY EXISTING)

**Purpose:** Clear "you lost" signal. **Red flash then fade** (user choice).

**New Pattern:**
```
Phase 1 (0-400ms): Red Flash #1
  - ALL buttons override to RED (#ef4444)
  - Flash to 100% for 150ms
  - Dim to 30% for 50ms

Phase 2 (400-800ms): Red Flash #2
  - Same pattern: 150ms bright, 50ms dim

Phase 3 (800-1500ms): Fade Out
  - Return to normal colors
  - Fade from 30% → 0%
  - Edges fade first, center last (current cascade)
```

**CSS:**
```css
@keyframes gameover-red-flash {
  0% {
    opacity: 0.3;
    --glow-color: var(--original-color);
  }
  10%, 25% {
    opacity: 1;
    filter: brightness(1.2);
    --glow-color: #ef4444; /* Force red */
  }
  35% {
    opacity: 0.3;
    --glow-color: #ef4444;
  }
  45%, 60% {
    opacity: 1;
    filter: brightness(1.2);
    --glow-color: #ef4444;
  }
  70% {
    opacity: 0.3;
    --glow-color: var(--original-color); /* Return to normal */
  }
  100% {
    opacity: 0;
    --glow-color: var(--original-color);
  }
}
```

---

## Title Glow Behavior

**React to Events** (user preference):

| State | Title Behavior |
|-------|----------------|
| `idle` | Slow pulse (current 2s cycle) |
| `playing` | Dim to 50% opacity, slower pulse (4s) |
| `score` | Brief flash to 100%, return to playing |
| `combo 5+` | Faster pulse matching combo tier |
| `combo 10+` | Strobe with buttons |
| `win` | Flash bright, then pulse |
| `highScore` | Maximum brightness throughout, strobe in phase 2 |
| `gameOver` | Dim during red flashes, fade with buttons |

**CSS:**
```css
/* Default */
.arcade-title-glow {
  animation: title-glow-pulse 2s ease-in-out infinite;
}

/* During gameplay */
.arcade-lights-playing .arcade-title-glow {
  opacity: 0.5;
  animation: title-glow-pulse 4s ease-in-out infinite;
}

/* High score celebration */
.arcade-lights-highScore .arcade-title-glow {
  opacity: 1;
  animation: title-glow-strobe 0.3s linear infinite;
}
```

---

## React Context Integration

**Create:** `src/contexts/ArcadeLightsContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

interface LightOptions {
  intensity?: 'very-low' | 'low' | 'medium' | 'high';
  comboLevel?: number;
  scoreSize?: 'small' | 'medium' | 'large';
  duration?: number;
}

interface ArcadeLightsContextType {
  sequence: LightSequence;
  options: LightOptions;
  setSequence: (seq: LightSequence, opts?: LightOptions) => void;
  triggerScore: (size?: 'small' | 'medium' | 'large') => void;
  setCombo: (level: number) => void;
  clearCombo: () => void;
}

const ArcadeLightsContext = createContext<ArcadeLightsContextType | null>(null);

export function ArcadeLightsProvider({ children }: { children: ReactNode }) {
  const [sequence, setSequenceState] = useState<LightSequence>('off');
  const [options, setOptions] = useState<LightOptions>({});

  const setSequence = useCallback((seq: LightSequence, opts?: LightOptions) => {
    setSequenceState(seq);
    setOptions(opts || {});
  }, []);

  const triggerScore = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    // Temporarily switch to score, then back to playing
    const prevSequence = sequence;
    setSequenceState('score');
    setOptions({ scoreSize: size });

    setTimeout(() => {
      setSequenceState(prevSequence === 'score' ? 'playing' : prevSequence);
    }, 300);
  }, [sequence]);

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
    throw new Error('useArcadeLights must be used within ArcadeLightsProvider');
  }
  return context;
}
```

---

## Game Integration Examples

### Flappy Orange
```typescript
import { useArcadeLights } from '@/contexts/ArcadeLightsContext';

function FlappyOrange() {
  const { setSequence, triggerScore, setCombo, clearCombo } = useArcadeLights();

  // When game starts
  useEffect(() => {
    setSequence('playing', { intensity: 'low' });
  }, [gameStarted]);

  // When passing through pipes
  const onPipePass = (consecutivePipes: number) => {
    if (consecutivePipes >= 2) {
      setCombo(consecutivePipes);
    }
    if (consecutivePipes >= 5) {
      triggerScore('medium');
    }
  };

  // On collision
  const onGameOver = (isHighScore: boolean) => {
    clearCombo();
    setSequence('gameOver');
    if (isHighScore) {
      setTimeout(() => setSequence('highScore'), 1500);
    }
  };
}
```

### Color React
```typescript
// Could sync button colors with game colors!
const onColorMatch = (color: string, streak: number) => {
  if (streak >= 2) setCombo(streak);
  if (streak >= 5) triggerScore('large');
};
```

---

## Files to Create/Modify

### New Files
1. `src/contexts/ArcadeLightsContext.tsx` - Context provider
2. Updates to `src/components/ArcadeButtonLights.css` - New animations

### Files to Modify
1. `src/components/ArcadeButtonLights.tsx` - Handle new sequences + options
2. `src/components/media/games/GameModal.tsx` - Wrap with ArcadeLightsProvider
3. Each game file - Integrate useArcadeLights hook

---

## Testing Checklist

- [ ] `idle` - Breathing wave looks good on game select
- [ ] `startup` - Cascade feels satisfying on modal open
- [ ] `gameStart` - Quick burst signals "GO!"
- [ ] `playing` - Each game has appropriate ambient intensity
- [ ] `score` - Only triggers on big points, not spam
- [ ] `combo` - Escalation feels dramatic at 5+, 10+ is HYPE
- [ ] `win` - Level complete feels rewarding
- [ ] `highScore` - Rainbow chase + strobe is maximum celebration
- [ ] `gameOver` - Red flash is clear but not depressing
- [ ] Title glow reacts appropriately to all states
- [ ] Transitions between states are smooth
- [ ] No performance issues with rapid state changes
- [ ] Mobile: All lights disabled (existing behavior)
