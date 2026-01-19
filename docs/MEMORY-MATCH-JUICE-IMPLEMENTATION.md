# Memory Match Juice Implementation Guide

> **For Claude CLI:** Implement each enhancement step-by-step in the order listed. Complete one enhancement fully (including testing) before moving to the next. Do not implement multiple enhancements simultaneously.

**Total Enhancements:** 27
**Game:** Memory Match (Wojak.ink)
**Priority:** Implement in order listed

---

## Pre-Implementation Setup

Before starting, locate and familiarize yourself with these files:
- Main game component (likely `MemoryMatch.tsx` or similar)
- `useGameSounds` hook
- `useGameHaptics` hook
- `useGameEffects` hook
- `useTimeUrgency` hook
- Game CSS/styles file
- Any existing sound assets in `/public/sounds/` or similar

---

## SOUND DESIGN (Enhancements 1-6)

### Enhancement 1: Mismatch Sound

**Goal:** Add a soft, non-punishing sound when cards don't match.

**Sound Characteristics:**
- Duration: 150-250ms
- Tone: Low-pitched, muted thud or soft "bonk"
- Volume: 0.3-0.4 (quieter than success sounds)
- Character: Informative, not punishing—player should feel "oh, wrong" not "I failed"

**Implementation:**

1. Add sound file to assets (or generate programmatically)
2. Add to `useGameSounds` hook:

```typescript
// In useGameSounds.ts
const playMismatch = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: ['/sounds/mismatch.mp3'],
    volume: 0.35,
    rate: 0.95, // Slightly lower pitch feels softer
  });
  sound.play();
}, [soundEnabled]);

return {
  // ... existing methods
  playMismatch,
};
```

3. Call in match check logic when cards don't match:

```typescript
// In card comparison logic
if (card1.nftId !== card2.nftId) {
  playMismatch();
  // ... existing mismatch handling
}
```

**Sound Design Notes:**
- Can use a wooden "thock" sound
- Or a muted bass note (around 150-200Hz)
- Avoid harsh sounds like buzzers or error beeps

---

### Enhancement 2: Streak-Specific Sounds

**Goal:** Audio feedback that escalates with consecutive matches.

**Streak Scale (simplified):**
- Streak 1: Normal match sound (existing)
- Streak 2: "Very good" sound (pitched up, extra sparkle)
- Streak 3+: "Max" celebration sound (full excitement)

**Implementation:**

1. Create or obtain 3 distinct sound variations:
   - `match_normal.mp3` - Base satisfying match
   - `match_good.mp3` - Same base + higher pitch + sparkle layer
   - `match_great.mp3` - Celebratory, more complex sound

2. Modify `playMatchFound` to accept streak parameter:

```typescript
// In useGameSounds.ts
const playMatchFound = useCallback((streak: number = 1) => {
  if (!soundEnabled) return;

  let soundFile: string;
  let volume: number;
  let rate: number;

  if (streak >= 3) {
    // Max celebration
    soundFile = '/sounds/match_great.mp3';
    volume = 0.6;
    rate = 1.0;
  } else if (streak === 2) {
    // Very good
    soundFile = '/sounds/match_good.mp3';
    volume = 0.55;
    rate = 1.05;
  } else {
    // Normal
    soundFile = '/sounds/match_normal.mp3';
    volume = 0.5;
    rate = 1.0;
  }

  const sound = new Howl({
    src: [soundFile],
    volume,
    rate,
  });
  sound.play();
}, [soundEnabled]);
```

3. Update call site to pass current streak:

```typescript
// When match is found
playMatchFound(currentStreak);
```

**Alternative (if only one base sound file):**

```typescript
const playMatchFound = useCallback((streak: number = 1) => {
  if (!soundEnabled) return;

  // Base sound with pitch/volume scaling
  const baseSound = new Howl({
    src: ['/sounds/match.mp3'],
    volume: 0.5 + (Math.min(streak, 3) - 1) * 0.05,
    rate: 1.0 + (Math.min(streak, 3) - 1) * 0.08,
  });
  baseSound.play();

  // Add sparkle overlay for streak 2+
  if (streak >= 2) {
    setTimeout(() => {
      const sparkle = new Howl({
        src: ['/sounds/sparkle.mp3'],
        volume: 0.3 + (streak >= 3 ? 0.1 : 0),
      });
      sparkle.play();
    }, 50);
  }
}, [soundEnabled]);
```

---

### Enhancement 3: Near-Completion Anticipation Sound

**Goal:** Build tension when only 1-2 pairs remain.

**Sound Characteristics:**
- Subtle, sustained tension builder
- Could be: rising tone, soft shimmer, heartbeat-like pulse
- Should not be distracting—background ambiance

**Implementation:**

1. Track remaining pairs and trigger sound:

```typescript
// In useGameSounds.ts
const playNearCompletion = useCallback((pairsRemaining: number) => {
  if (!soundEnabled) return;

  if (pairsRemaining === 2) {
    // Subtle anticipation
    const sound = new Howl({
      src: ['/sounds/anticipation_soft.mp3'],
      volume: 0.25,
    });
    sound.play();
  } else if (pairsRemaining === 1) {
    // Heightened anticipation
    const sound = new Howl({
      src: ['/sounds/anticipation_intense.mp3'],
      volume: 0.35,
    });
    sound.play();
  }
}, [soundEnabled]);
```

2. Calculate and trigger in game logic:

```typescript
// After a successful match
const remainingPairs = totalPairs - matchedPairs;
if (remainingPairs <= 2 && remainingPairs > 0) {
  playNearCompletion(remainingPairs);
}
```

**Alternative (musical approach):**
- At 2 pairs: Play a subtle "rising" musical phrase
- At 1 pair: Add a soft sustained note or shimmer loop that fades when matched

---

### Enhancement 4: Card Hover Sound

**Goal:** Subtle audio feedback when hovering over a card (before clicking).

**Sound Characteristics:**
- Ultra-short: 30-50ms
- Very quiet: volume 0.15-0.2
- High-pitched, airy "tick" or soft "pop"
- Must not be annoying with rapid mouse movement

**Implementation:**

1. Add hover sound with debounce to prevent spam:

```typescript
// In useGameSounds.ts
const lastHoverTime = useRef(0);
const HOVER_DEBOUNCE = 50; // ms between hover sounds

const playCardHover = useCallback(() => {
  if (!soundEnabled) return;

  const now = Date.now();
  if (now - lastHoverTime.current < HOVER_DEBOUNCE) return;
  lastHoverTime.current = now;

  const sound = new Howl({
    src: ['/sounds/hover_tick.mp3'],
    volume: 0.15,
    rate: 1.1, // Slightly high pitch
  });
  sound.play();
}, [soundEnabled]);
```

2. Add to card component:

```tsx
<div
  className="mm-card"
  onMouseEnter={() => {
    if (!card.isFlipped && !card.isMatched) {
      playCardHover();
    }
  }}
  onClick={() => handleCardClick(card.id)}
>
```

**Important:** Only play hover sound for unflipped, unmatched cards.

---

### Enhancement 5: Fast Match Celebration Sound

**Goal:** Distinct audio reward when matching quickly (within 2.5 seconds).

**Sound Characteristics:**
- More energetic than normal match
- Could layer a "whoosh" or "zing" on top of match sound
- Slightly faster playback rate

**Implementation:**

1. Add fast match detection and sound:

```typescript
// In useGameSounds.ts
const playFastMatch = useCallback(() => {
  if (!soundEnabled) return;

  // Play base match sound
  const matchSound = new Howl({
    src: ['/sounds/match.mp3'],
    volume: 0.5,
    rate: 1.1, // Slightly faster
  });
  matchSound.play();

  // Layer "fast" bonus sound
  const fastBonus = new Howl({
    src: ['/sounds/fast_whoosh.mp3'],
    volume: 0.4,
  });
  fastBonus.play();
}, [soundEnabled]);
```

2. In match logic, check time since last match:

```typescript
// When match found
const timeSinceLastMatch = Date.now() - lastMatchTime;
const isFastMatch = timeSinceLastMatch < 2500;

if (isFastMatch) {
  playFastMatch();
} else {
  playMatchFound(currentStreak);
}
```

**Note:** Fast match sound should work alongside streak sounds. Consider:

```typescript
if (isFastMatch) {
  playMatchFound(currentStreak); // Still play streak-appropriate sound
  playFastBonus(); // Add extra "fast" layer
}
```

---

### Enhancement 6: Sound Variations

**Goal:** 3-4 variations per sound event to prevent audio fatigue.

**Implementation Pattern:**

```typescript
// In useGameSounds.ts

// Sound pools
const matchSounds = useRef<string[]>([
  '/sounds/match_1.mp3',
  '/sounds/match_2.mp3',
  '/sounds/match_3.mp3',
  '/sounds/match_4.mp3',
]);

const flipSounds = useRef<string[]>([
  '/sounds/flip_1.mp3',
  '/sounds/flip_2.mp3',
  '/sounds/flip_3.mp3',
]);

const mismatchSounds = useRef<string[]>([
  '/sounds/mismatch_1.mp3',
  '/sounds/mismatch_2.mp3',
  '/sounds/mismatch_3.mp3',
]);

// Utility to pick random from pool
const getRandomSound = (pool: string[]): string => {
  return pool[Math.floor(Math.random() * pool.length)];
};

// Usage
const playCardFlip = useCallback(() => {
  if (!soundEnabled) return;

  const sound = new Howl({
    src: [getRandomSound(flipSounds.current)],
    volume: 0.4,
    rate: 0.95 + Math.random() * 0.1, // Small pitch variation too
  });
  sound.play();
}, [soundEnabled]);
```

**Sound Variation Strategy:**

For each base sound, create variations by:
1. **Pitch shifting:** Same sound at +5%, +10%, -5% pitch
2. **Slight timing differences:** Adjust attack/release
3. **Layering differences:** Add/remove subtle elements
4. **Recording multiple takes:** If using recorded sounds

**Files to create variations for:**
- `flip_1.mp3`, `flip_2.mp3`, `flip_3.mp3`
- `match_1.mp3`, `match_2.mp3`, `match_3.mp3`, `match_4.mp3`
- `mismatch_1.mp3`, `mismatch_2.mp3`, `mismatch_3.mp3`

---

## HAPTIC FEEDBACK (Enhancements 7-10)

### Enhancement 7: Card Hover Haptic

**Goal:** Ultra-light haptic feedback when hovering over cards.

**Haptic Pattern:**
- Duration: 5ms (barely perceptible)
- Intensity: Lightest possible
- Purpose: Subtle tactile acknowledgment

**Implementation:**

```typescript
// In useGameHaptics.ts
const hapticHover = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;

  // Ultra-light 5ms tap
  navigator.vibrate(5);
}, [hapticsEnabled]);
```

**For iOS (Core Haptics):**

```typescript
const hapticHover = useCallback(() => {
  if (!hapticsEnabled) return;

  // iOS UIImpactFeedbackGenerator equivalent
  if ('Capacitor' in window) {
    Haptics.impact({ style: ImpactStyle.Light });
  } else if (navigator.vibrate) {
    navigator.vibrate(5);
  }
}, [hapticsEnabled]);
```

**Add to card hover handler (same as sound hover):**

```tsx
onMouseEnter={() => {
  if (!card.isFlipped && !card.isMatched) {
    playCardHover();
    hapticHover();
  }
}}
```

---

### Enhancement 8: Mismatch Haptic

**Goal:** Distinct "error" haptic pattern when cards don't match.

**Haptic Pattern:**
- Double pulse: 10ms - 50ms gap - 10ms
- Creates recognizable "uh-oh" feeling
- Distinct from success haptics

**Implementation:**

```typescript
// In useGameHaptics.ts
const hapticMismatch = useCallback(() => {
  if (!hapticsEnabled || !navigator.vibrate) return;

  // Double pulse pattern: vibrate, pause, vibrate
  // Pattern: [vibrate, pause, vibrate, pause, ...]
  navigator.vibrate([10, 50, 10]);
}, [hapticsEnabled]);
```

**For iOS:**

```typescript
const hapticMismatch = useCallback(async () => {
  if (!hapticsEnabled) return;

  if ('Capacitor' in window) {
    // Double tap pattern
    await Haptics.impact({ style: ImpactStyle.Light });
    await new Promise(r => setTimeout(r, 50));
    await Haptics.impact({ style: ImpactStyle.Light });
  } else if (navigator.vibrate) {
    navigator.vibrate([10, 50, 10]);
  }
}, [hapticsEnabled]);
```

**Call when mismatch detected:**

```typescript
if (card1.nftId !== card2.nftId) {
  playMismatch();
  hapticMismatch();
  // ... flip cards back
}
```

---

### Enhancement 9: Timer Urgency Haptic

**Goal:** Subtle pulse every second when timer is at 5 seconds or less.

**Haptic Pattern:**
- Single 8-10ms pulse
- Fires every 1000ms
- Only when countdown ≤ 5 seconds

**Implementation:**

```typescript
// In useTimeUrgency.ts or useGameHaptics.ts
const urgencyIntervalRef = useRef<NodeJS.Timeout | null>(null);

const startUrgencyHaptics = useCallback(() => {
  if (!hapticsEnabled || urgencyIntervalRef.current) return;

  urgencyIntervalRef.current = setInterval(() => {
    if (navigator.vibrate) {
      navigator.vibrate(8);
    }
  }, 1000);
}, [hapticsEnabled]);

const stopUrgencyHaptics = useCallback(() => {
  if (urgencyIntervalRef.current) {
    clearInterval(urgencyIntervalRef.current);
    urgencyIntervalRef.current = null;
  }
}, []);

// Cleanup on unmount
useEffect(() => {
  return () => stopUrgencyHaptics();
}, []);
```

**Integrate with timer:**

```typescript
// In timer effect
useEffect(() => {
  if (timeRemaining <= 5 && timeRemaining > 0 && gameState === 'playing') {
    startUrgencyHaptics();
  } else {
    stopUrgencyHaptics();
  }
}, [timeRemaining, gameState]);
```

---

### Enhancement 10: Streak Crescendo Haptics

**Goal:** Haptic intensity increases with streak length.

**Pattern Scale:**
- Streak 1: Single 15ms pulse (normal)
- Streak 2: Double pulse 15ms - 30ms gap - 10ms
- Streak 3+: Triple pulse 15ms - 20ms gap - 10ms - 20ms gap - 8ms

**Implementation:**

```typescript
// In useGameHaptics.ts
const hapticStreakMatch = useCallback((streak: number) => {
  if (!hapticsEnabled || !navigator.vibrate) return;

  if (streak >= 3) {
    // Triple pulse - max excitement
    navigator.vibrate([15, 20, 10, 20, 8]);
  } else if (streak === 2) {
    // Double pulse - very good
    navigator.vibrate([15, 30, 10]);
  } else {
    // Single pulse - normal
    navigator.vibrate(15);
  }
}, [hapticsEnabled]);
```

**For iOS with more nuance:**

```typescript
const hapticStreakMatch = useCallback(async (streak: number) => {
  if (!hapticsEnabled) return;

  if ('Capacitor' in window) {
    if (streak >= 3) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await new Promise(r => setTimeout(r, 20));
      await Haptics.impact({ style: ImpactStyle.Light });
      await new Promise(r => setTimeout(r, 20));
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (streak === 2) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await new Promise(r => setTimeout(r, 30));
      await Haptics.impact({ style: ImpactStyle.Light });
    } else {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } else if (navigator.vibrate) {
    // Fallback pattern
    if (streak >= 3) {
      navigator.vibrate([15, 20, 10, 20, 8]);
    } else if (streak === 2) {
      navigator.vibrate([15, 30, 10]);
    } else {
      navigator.vibrate(15);
    }
  }
}, [hapticsEnabled]);
```

**Usage:**

```typescript
// On match found
hapticStreakMatch(currentStreak);
```

---

## VISUAL FEEDBACK / JUICE (Enhancements 11-17)

### Enhancement 11: Squash and Stretch on Card Flip

**Goal:** Cards compress slightly when they land (flip completes).

**Animation Principle:**
- When card flip animation ends, briefly squash horizontally (scale X > Y)
- Then return to normal
- Creates organic, physical feeling

**CSS Implementation:**

```css
/* Card flip with squash on land */
.mm-card {
  transform-style: preserve-3d;
  transition: transform 350ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.mm-card.flipped {
  transform: rotateY(180deg);
}

/* Add squash animation class when flip completes */
.mm-card.flip-landed {
  animation: cardSquash 150ms ease-out;
}

@keyframes cardSquash {
  0% {
    transform: rotateY(180deg) scale(1, 1);
  }
  50% {
    transform: rotateY(180deg) scale(1.05, 0.95); /* Squash */
  }
  100% {
    transform: rotateY(180deg) scale(1, 1);
  }
}

/* For unflipping (flip back) */
.mm-card.unflip-landed {
  animation: cardSquashUnflip 150ms ease-out;
}

@keyframes cardSquashUnflip {
  0% {
    transform: rotateY(0deg) scale(1, 1);
  }
  50% {
    transform: rotateY(0deg) scale(1.05, 0.95);
  }
  100% {
    transform: rotateY(0deg) scale(1, 1);
  }
}
```

**JavaScript to trigger:**

```typescript
// After flip transition ends
const handleCardFlip = (cardId: number) => {
  // ... flip logic

  // Add landed class after flip animation duration
  setTimeout(() => {
    const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardEl) {
      cardEl.classList.add('flip-landed');
      // Remove class after animation
      setTimeout(() => cardEl.classList.remove('flip-landed'), 150);
    }
  }, 350); // Match flip transition duration
};
```

---

### Enhancement 12: Matched Card "Pop" Animation

**Goal:** Scale 1 → 1.1 → 1 with easing when cards are matched.

**Implementation:**

```css
/* Match celebration pop */
.mm-card.matched {
  animation: matchPop 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes matchPop {
  0% {
    transform: rotateY(180deg) scale(1);
  }
  50% {
    transform: rotateY(180deg) scale(1.1);
  }
  100% {
    transform: rotateY(180deg) scale(1);
  }
}

/* Add glow effect during pop */
.mm-card.matched::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.6) 0%,
    rgba(255, 215, 0, 0) 70%
  );
  animation: matchGlow 400ms ease-out forwards;
  pointer-events: none;
}

@keyframes matchGlow {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0;
    transform: scale(1.4);
  }
}
```

**The cubic-bezier `(0.68, -0.55, 0.265, 1.55)` creates a bouncy overshoot effect.**

---

### Enhancement 13: Particle Burst on Match

**Goal:** Confetti/sparkle particles explode from matched cards.

**Implementation Options:**

**Option A: CSS-only particles**

```css
.mm-card.matched .particle-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particleBurst 600ms ease-out forwards;
}

@keyframes particleBurst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}
```

```tsx
// Generate particles dynamically
const createParticles = (cardElement: HTMLElement) => {
  const container = document.createElement('div');
  container.className = 'particle-container';

  const colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'];

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random direction
    const angle = (i / 12) * Math.PI * 2;
    const distance = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.style.cssText = `
      --tx: ${tx}px;
      --ty: ${ty}px;
      left: 50%;
      top: 50%;
      background: ${colors[i % colors.length]};
      animation-delay: ${Math.random() * 50}ms;
    `;

    container.appendChild(particle);
  }

  cardElement.appendChild(container);

  // Cleanup after animation
  setTimeout(() => container.remove(), 700);
};
```

**Option B: Use existing useGameEffects hook**

If you have a `triggerConfetti` or `triggerParticles` method:

```typescript
// When match found
triggerParticles({
  x: cardCenterX,
  y: cardCenterY,
  count: 12,
  colors: ['#FFD700', '#FFA500', '#FF6347'],
  spread: 60,
});
```

---

### Enhancement 14: Card "Wobble" on Mismatch

**Goal:** Subtle shake/wobble before cards flip back on mismatch.

**Implementation:**

```css
.mm-card.mismatch-wobble {
  animation: cardWobble 300ms ease-in-out;
}

@keyframes cardWobble {
  0%, 100% {
    transform: rotateY(180deg) rotateZ(0deg);
  }
  20% {
    transform: rotateY(180deg) rotateZ(-3deg);
  }
  40% {
    transform: rotateY(180deg) rotateZ(3deg);
  }
  60% {
    transform: rotateY(180deg) rotateZ(-2deg);
  }
  80% {
    transform: rotateY(180deg) rotateZ(1deg);
  }
}
```

**Trigger in mismatch logic:**

```typescript
// When mismatch detected
const handleMismatch = (card1Id: number, card2Id: number) => {
  // Add wobble class
  const card1El = document.querySelector(`[data-card-id="${card1Id}"]`);
  const card2El = document.querySelector(`[data-card-id="${card2Id}"]`);

  card1El?.classList.add('mismatch-wobble');
  card2El?.classList.add('mismatch-wobble');

  playMismatch();
  hapticMismatch();

  // Flip back after wobble (300ms) + viewing time
  setTimeout(() => {
    card1El?.classList.remove('mismatch-wobble');
    card2El?.classList.remove('mismatch-wobble');
    // ... flip cards back
  }, 300 + 900); // wobble duration + extra viewing time
};
```

---

### Enhancement 15: Progress Bar Celebration

**Goal:** Timeline bar pulses/glows when a pair is matched.

**Implementation:**

```css
.mm-timeline {
  position: relative;
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
}

.mm-timeline-fill {
  height: 100%;
  transition: width 1s linear;
  position: relative;
}

/* Pulse animation on match */
.mm-timeline.pulse-celebration {
  animation: timelinePulse 400ms ease-out;
}

@keyframes timelinePulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.5);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
  }
}

/* Glow effect on the fill */
.mm-timeline.pulse-celebration .mm-timeline-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 30px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8));
  animation: fillGlow 400ms ease-out;
}

@keyframes fillGlow {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  50% {
    opacity: 1;
    transform: scaleX(1.5);
  }
  100% {
    opacity: 0;
    transform: scaleX(0);
  }
}
```

**Trigger:**

```typescript
// When match found
const triggerTimelineCelebration = () => {
  const timeline = document.querySelector('.mm-timeline');
  if (timeline) {
    timeline.classList.add('pulse-celebration');
    setTimeout(() => timeline.classList.remove('pulse-celebration'), 400);
  }
};
```

---

### Enhancement 16: Near-Win Celebration

**Goal:** Screen-wide shimmer effect when only 1 pair remains.

**Implementation:**

```css
/* Shimmer overlay */
.mm-near-win-shimmer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background: linear-gradient(
    45deg,
    transparent 0%,
    transparent 40%,
    rgba(255, 215, 0, 0.1) 50%,
    transparent 60%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: shimmerSweep 2s ease-in-out infinite;
  opacity: 0;
  transition: opacity 500ms ease;
}

.mm-near-win-shimmer.active {
  opacity: 1;
}

@keyframes shimmerSweep {
  0% {
    background-position: 200% 200%;
  }
  100% {
    background-position: -200% -200%;
  }
}

/* Also add subtle glow to remaining cards */
.mm-card:not(.matched).near-win-highlight {
  animation: nearWinPulse 1.5s ease-in-out infinite;
}

@keyframes nearWinPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
}
```

**React component:**

```tsx
// Add to game component
{remainingPairs === 1 && (
  <div className={`mm-near-win-shimmer ${remainingPairs === 1 ? 'active' : ''}`} />
)}
```

**Add highlight to remaining cards:**

```typescript
useEffect(() => {
  if (remainingPairs === 1) {
    const unmatchedCards = document.querySelectorAll('.mm-card:not(.matched)');
    unmatchedCards.forEach(card => card.classList.add('near-win-highlight'));
  }
  return () => {
    document.querySelectorAll('.near-win-highlight').forEach(card =>
      card.classList.remove('near-win-highlight')
    );
  };
}, [remainingPairs]);
```

---

### Enhancement 17: Freeze Frame on Match

**Goal:** 50-100ms game pause when match is found for impact.

**Implementation:**

```typescript
// State for freeze frame
const [isFrozen, setIsFrozen] = useState(false);

// Freeze frame function
const triggerFreezeFrame = useCallback((duration: number = 60) => {
  setIsFrozen(true);
  setTimeout(() => setIsFrozen(false), duration);
}, []);

// In match handler
const handleMatch = () => {
  triggerFreezeFrame(60); // 60ms freeze

  // Visual/audio effects play during freeze
  playMatchFound(currentStreak);
  hapticStreakMatch(currentStreak);
  createParticles(cardElement);

  // Match processing continues after freeze
  setTimeout(() => {
    setCards(prev => prev.map(c =>
      c.id === card1.id || c.id === card2.id
        ? { ...c, isMatched: true }
        : c
    ));
  }, 60);
};
```

**Pause timer during freeze:**

```typescript
// In timer effect
useEffect(() => {
  if (gameState !== 'playing' || isFrozen) return;

  const interval = setInterval(() => {
    setTimeRemaining(prev => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [gameState, isFrozen]);
```

**Visual freeze indication (optional):**

```css
.mm-game-container.frozen {
  filter: brightness(1.1);
}

.mm-game-container.frozen .mm-card:not(.matched) {
  pointer-events: none;
}
```

---

## ANTICIPATION STATES (Enhancements 18-20)

### Enhancement 18: 2 Pairs Remaining - Subtle Glow

**Goal:** Remaining unmatched cards get a subtle glow when 2 pairs left.

**Implementation:**

```css
/* 2 pairs remaining state */
.mm-card:not(.matched).anticipation-2 {
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  transition: box-shadow 500ms ease;
}
```

```typescript
// Track and apply class
useEffect(() => {
  const unmatched = document.querySelectorAll('.mm-card:not(.matched)');

  if (remainingPairs === 2) {
    unmatched.forEach(card => {
      card.classList.add('anticipation-2');
      card.classList.remove('anticipation-1');
    });
  } else {
    unmatched.forEach(card => card.classList.remove('anticipation-2'));
  }
}, [remainingPairs]);
```

---

### Enhancement 19: 1 Pair Remaining - Pulsing Border + Music Intensity

**Goal:** Final pair has pulsing border, background music intensifies.

**CSS:**

```css
/* 1 pair remaining - pulsing border */
.mm-card:not(.matched).anticipation-1 {
  animation: finalPairPulse 1s ease-in-out infinite;
  border: 2px solid rgba(255, 215, 0, 0.6);
}

@keyframes finalPairPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    border-color: rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    border-color: rgba(255, 215, 0, 1);
  }
}
```

**Music intensity (if using dynamic audio):**

```typescript
// In useAudio or music management
const setMusicIntensity = useCallback((level: 'normal' | 'high') => {
  if (!bgMusicRef.current) return;

  if (level === 'high') {
    bgMusicRef.current.rate(1.05); // Slightly faster
    bgMusicRef.current.volume(0.7); // Slightly louder
  } else {
    bgMusicRef.current.rate(1.0);
    bgMusicRef.current.volume(0.5);
  }
}, []);

// Usage
useEffect(() => {
  if (remainingPairs === 1) {
    setMusicIntensity('high');
  } else {
    setMusicIntensity('normal');
  }
}, [remainingPairs]);
```

---

### Enhancement 20: Timer Critical + Many Pairs - Help Shimmer

**Goal:** When <10s left AND >3 pairs remain, cards get subtle help shimmer.

**Implementation:**

```css
/* Struggling state - subtle shimmer */
.mm-card:not(.matched).struggle-shimmer {
  animation: struggleShimmer 2s ease-in-out infinite;
}

@keyframes struggleShimmer {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.15);
  }
}
```

```typescript
// Detect struggle state
const isStruggling = timeRemaining <= 10 && remainingPairs > 3;

useEffect(() => {
  const unmatched = document.querySelectorAll('.mm-card:not(.matched)');

  if (isStruggling) {
    unmatched.forEach(card => card.classList.add('struggle-shimmer'));
  } else {
    unmatched.forEach(card => card.classList.remove('struggle-shimmer'));
  }
}, [isStruggling]);
```

---

## SCREEN SHAKE IMPROVEMENTS (Enhancements 21-22)

### Enhancement 21: Variable Shake Intensity

**Goal:** Shake intensity scales with streak (2=2px, 3+=4px).

**Implementation:**

```typescript
// In useGameEffects or dedicated shake utility
const triggerScreenShake = useCallback((streak: number) => {
  if (streak < 2) return; // No shake for streak 1

  const intensity = streak === 2 ? 2 : 4; // 2px for streak 2, 4px for 3+
  const container = document.querySelector('.mm-game-container');

  if (!container) return;

  container.style.setProperty('--shake-intensity', `${intensity}px`);
  container.classList.add('screen-shake');

  setTimeout(() => {
    container.classList.remove('screen-shake');
  }, 200);
}, []);
```

**CSS:**

```css
.mm-game-container {
  --shake-intensity: 4px;
}

.mm-game-container.screen-shake {
  animation: screenShake 200ms ease-out;
}

@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(calc(var(--shake-intensity) * -1), calc(var(--shake-intensity) * -0.5)); }
  20% { transform: translate(var(--shake-intensity), calc(var(--shake-intensity) * 0.5)); }
  30% { transform: translate(calc(var(--shake-intensity) * -0.8), calc(var(--shake-intensity) * -0.4)); }
  40% { transform: translate(calc(var(--shake-intensity) * 0.8), calc(var(--shake-intensity) * 0.4)); }
  50% { transform: translate(calc(var(--shake-intensity) * -0.6), calc(var(--shake-intensity) * -0.3)); }
  60% { transform: translate(calc(var(--shake-intensity) * 0.6), calc(var(--shake-intensity) * 0.3)); }
  70% { transform: translate(calc(var(--shake-intensity) * -0.4), calc(var(--shake-intensity) * -0.2)); }
  80% { transform: translate(calc(var(--shake-intensity) * 0.4), calc(var(--shake-intensity) * 0.2)); }
  90% { transform: translate(calc(var(--shake-intensity) * -0.2), calc(var(--shake-intensity) * -0.1)); }
}
```

---

### Enhancement 22: Shake Decay

**Goal:** Shake starts strong and fades over 200ms.

The keyframe animation in Enhancement 21 already implements this with decreasing multipliers:
- 10-20%: Full intensity
- 30-40%: 80% intensity
- 50-60%: 60% intensity
- 70-80%: 40% intensity
- 90%: 20% intensity

**Alternative JavaScript approach for smoother decay:**

```typescript
const triggerScreenShake = useCallback((streak: number) => {
  if (streak < 2) return;

  const baseIntensity = streak === 2 ? 2 : 4;
  const container = document.querySelector('.mm-game-container') as HTMLElement;
  if (!container) return;

  const duration = 200;
  const startTime = performance.now();

  const shake = (time: number) => {
    const elapsed = time - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      container.style.transform = '';
      return;
    }

    // Decay: intensity decreases as progress increases
    const currentIntensity = baseIntensity * (1 - progress);
    const x = (Math.random() - 0.5) * 2 * currentIntensity;
    const y = (Math.random() - 0.5) * 2 * currentIntensity;

    container.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(shake);
  };

  requestAnimationFrame(shake);
}, []);
```

---

## MILESTONE CALLOUTS (Enhancements 23-24)

### Enhancement 23: Theme-Specific Callouts

**Goal:** Pull callout text from actual NFT metadata attributes.

**Implementation:**

First, understand your NFT metadata structure. Assuming you have access to attributes like "Base" (Alien, Bepe, Wojak, etc.):

```typescript
// Callout phrases based on NFT attributes
const THEME_CALLOUTS: Record<string, string[]> = {
  'Alien Baddie': ['Aliens Unite!', 'Cosmic Match!', 'Out of This World!'],
  'Alien Waifu': ['Stellar Memory!', 'Space Brain!', 'Galactic!'],
  'Bepe Baddie': ['Bepe Power!', 'Rare Find!', 'Legendary Bepe!'],
  'Bepe Waifu': ['Kawaii Bepe!', 'Bepe-tastic!', 'UwU Match!'],
  'Wojak': ['Wojak Approved!', 'Feel Good Man!', 'Based Match!'],
  'default': ['Nice Match!', 'Keep Going!', 'Memory Master!'],
};

const getThemedCallout = (nftBase: string): string => {
  const phrases = THEME_CALLOUTS[nftBase] || THEME_CALLOUTS.default;
  return phrases[Math.floor(Math.random() * phrases.length)];
};
```

**Use when displaying callouts:**

```typescript
// On match, get the NFT's base attribute
const handleMatch = (card1: Card, card2: Card) => {
  const nftBase = card1.attributes?.base || 'default';
  const calloutText = getThemedCallout(nftBase);

  showCallout(calloutText);
};
```

**Callout display component:**

```tsx
const [callout, setCallout] = useState<string | null>(null);

const showCallout = (text: string) => {
  setCallout(text);
  setTimeout(() => setCallout(null), 1500);
};

// In JSX
{callout && (
  <div className="mm-callout">
    {callout}
  </div>
)}
```

```css
.mm-callout {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: calloutPop 1.5s ease-out forwards;
  z-index: 100;
  pointer-events: none;
}

@keyframes calloutPop {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  30% {
    transform: translateX(-50%) scale(1);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(1);
  }
}
```

---

### Enhancement 24: Contextual Progress

**Goal:** Show "5/12 - Keep Going!" with actual progress numbers.

**Implementation:**

```typescript
// Milestone callout with context
const checkProgressMilestone = (matched: number, total: number) => {
  const percentage = matched / total;

  if (matched === Math.floor(total / 2)) {
    // Halfway
    showCallout(`${matched}/${total} - Halfway There!`);
  } else if (percentage >= 0.75 && percentage < 1) {
    // 75% - only show once
    showCallout(`${matched}/${total} - Almost Done!`);
  }
};

// Call after each match
useEffect(() => {
  checkProgressMilestone(matchedPairs, totalPairs);
}, [matchedPairs]);
```

**Enhanced version with streak awareness:**

```typescript
const getProgressCallout = (matched: number, total: number, streak: number): string | null => {
  const remaining = total - matched;
  const percentage = matched / total;

  // Halfway milestone
  if (matched === Math.floor(total / 2)) {
    return `${matched}/${total} - Halfway!`;
  }

  // 75% milestone
  if (percentage >= 0.75 && percentage < 0.8) {
    return `${matched}/${total} - Almost There!`;
  }

  // Streak milestones
  if (streak === 3) {
    return `${matched}/${total} - On Fire!`;
  }
  if (streak === 5) {
    return `${matched}/${total} - Unstoppable!`;
  }

  return null;
};
```

---

## AUDIO LAYERING (Enhancement 25)

### Enhancement 25: Dynamic Music Stems

**Goal:** Background music has layers that fade in/out based on game state.

**Concept:**
- **Base layer:** Always playing, calm ambient
- **Urgency layer:** Fades in when timer <50%
- **Intensity layer:** Fades in when streak ≥2
- **Victory layer:** Brief swell when near completion

**Implementation:**

```typescript
// In useAudio.ts or dedicated music hook
interface MusicLayers {
  base: Howl | null;
  urgency: Howl | null;
  intensity: Howl | null;
  victory: Howl | null;
}

const useDynamicMusic = () => {
  const layers = useRef<MusicLayers>({
    base: null,
    urgency: null,
    intensity: null,
    victory: null,
  });

  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize all layers (muted except base)
  const initMusic = useCallback(() => {
    layers.current.base = new Howl({
      src: ['/music/mm_base.mp3'],
      loop: true,
      volume: 0.4,
    });

    layers.current.urgency = new Howl({
      src: ['/music/mm_urgency.mp3'],
      loop: true,
      volume: 0, // Start muted
    });

    layers.current.intensity = new Howl({
      src: ['/music/mm_intensity.mp3'],
      loop: true,
      volume: 0, // Start muted
    });

    layers.current.victory = new Howl({
      src: ['/music/mm_victory.mp3'],
      loop: true,
      volume: 0, // Start muted
    });
  }, []);

  // Start all layers in sync
  const startMusic = useCallback(() => {
    Object.values(layers.current).forEach(layer => {
      if (layer && !layer.playing()) {
        layer.play();
      }
    });
    setIsPlaying(true);
  }, []);

  // Stop all layers
  const stopMusic = useCallback(() => {
    Object.values(layers.current).forEach(layer => layer?.stop());
    setIsPlaying(false);
  }, []);

  // Fade layer in/out
  const setLayerVolume = useCallback((
    layer: keyof MusicLayers,
    targetVolume: number,
    duration: number = 500
  ) => {
    const howl = layers.current[layer];
    if (!howl) return;

    howl.fade(howl.volume(), targetVolume, duration);
  }, []);

  // Update based on game state
  const updateMusicState = useCallback((state: {
    timePercentage: number;
    streak: number;
    remainingPairs: number;
  }) => {
    const { timePercentage, streak, remainingPairs } = state;

    // Urgency layer: fade in when <50% time
    setLayerVolume('urgency', timePercentage < 50 ? 0.3 : 0);

    // Intensity layer: fade in on streak 2+
    setLayerVolume('intensity', streak >= 2 ? 0.25 : 0);

    // Victory layer: fade in when 1-2 pairs left
    setLayerVolume('victory', remainingPairs <= 2 ? 0.35 : 0);

  }, [setLayerVolume]);

  return {
    initMusic,
    startMusic,
    stopMusic,
    updateMusicState,
    isPlaying,
  };
};
```

**Usage in game component:**

```typescript
const { initMusic, startMusic, stopMusic, updateMusicState } = useDynamicMusic();

// Initialize on mount
useEffect(() => {
  initMusic();
}, []);

// Update layers based on state
useEffect(() => {
  if (gameState === 'playing') {
    updateMusicState({
      timePercentage: (timeRemaining / totalTime) * 100,
      streak: currentStreak,
      remainingPairs,
    });
  }
}, [timeRemaining, currentStreak, remainingPairs, gameState]);

// Start/stop with game
useEffect(() => {
  if (gameState === 'playing') {
    startMusic();
  } else {
    stopMusic();
  }
}, [gameState]);
```

**Audio File Requirements:**
All stems must be:
- Same BPM/tempo
- Same length (or perfect loop points)
- Mixed to work together when layered
- Each stem should add to the base without overpowering

---

## GAME OVER ENHANCEMENTS (Enhancements 26-27)

### Enhancement 26: "Revenge" Framing

**Goal:** Show how close player was to next milestone.

**Implementation:**

```typescript
interface GameOverStats {
  finalScore: number;
  roundReached: number;
  pairsMatched: number;
  totalPairsInRound: number;
  timeWhenLost: number;
}

const getRevengeMessage = (stats: GameOverStats): string => {
  const { roundReached, pairsMatched, totalPairsInRound } = stats;
  const pairsRemaining = totalPairsInRound - pairsMatched;

  if (pairsRemaining === 1) {
    return `So close! Just 1 pair away from completing Round ${roundReached}!`;
  } else if (pairsRemaining === 2) {
    return `Almost had it! Only 2 pairs from finishing Round ${roundReached}!`;
  } else if (pairsRemaining <= 4) {
    return `You were ${pairsRemaining} pairs away from Round ${roundReached + 1}!`;
  } else {
    return `Round ${roundReached} put up a fight! ${pairsMatched}/${totalPairsInRound} pairs matched.`;
  }
};
```

**Display in game over screen:**

```tsx
<div className="mm-game-over">
  <h2>Game Over!</h2>
  <div className="mm-final-score">{finalScore}</div>
  <p className="mm-revenge-message">{getRevengeMessage(gameOverStats)}</p>
  <button onClick={handlePlayAgain}>Try Again</button>
</div>
```

```css
.mm-revenge-message {
  font-size: 1.1rem;
  color: #fbbf24;
  margin: 1rem 0;
  font-style: italic;
}
```

---

### Enhancement 27: Share Image Generator

**Goal:** Generate a beautiful shareable image showing score, round, matched NFTs with effects.

**Implementation using HTML Canvas:**

```typescript
interface ShareImageData {
  score: number;
  round: number;
  matchedNfts: { image: string; name: string }[];
  playerName?: string;
}

const generateShareImage = async (data: ShareImageData): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Canvas size (Instagram-friendly 1:1)
  canvas.width = 1080;
  canvas.height = 1080;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  // Add decorative elements (confetti dots)
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'];
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.3 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(
      Math.random() * 1080,
      Math.random() * 1080,
      3 + Math.random() * 8,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MEMORY MATCH', 540, 100);

  // Subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = '32px Arial, sans-serif';
  ctx.fillText('Wojak.ink', 540, 150);

  // Score
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 120px Arial, sans-serif';
  ctx.fillText(data.score.toLocaleString(), 540, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = '36px Arial, sans-serif';
  ctx.fillText('POINTS', 540, 370);

  // Round reached
  ctx.fillStyle = '#00CED1';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText(`Round ${data.round}`, 540, 450);

  // Load and draw NFT images (grid of matched NFTs)
  const nftsToShow = data.matchedNfts.slice(0, 9); // Max 9 for 3x3 grid
  const gridSize = Math.ceil(Math.sqrt(nftsToShow.length));
  const nftSize = 120;
  const gridWidth = gridSize * (nftSize + 20);
  const startX = (1080 - gridWidth) / 2 + 10;
  const startY = 520;

  await Promise.all(nftsToShow.map((nft, i) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const x = startX + col * (nftSize + 20);
        const y = startY + row * (nftSize + 20);

        // Draw with rounded corners
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, nftSize, nftSize, 10);
        ctx.clip();
        ctx.drawImage(img, x, y, nftSize, nftSize);
        ctx.restore();

        // Border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, nftSize, nftSize, 10);
        ctx.stroke();

        resolve();
      };
      img.onerror = () => resolve();
      img.src = nft.image;
    });
  }));

  // Footer
  ctx.fillStyle = '#888888';
  ctx.font = '24px Arial, sans-serif';
  ctx.fillText('Play at wojak.ink', 540, 1020);

  // Player name if provided
  if (data.playerName) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText(`Played by ${data.playerName}`, 540, 1050);
  }

  return canvas.toDataURL('image/png');
};
```

**Usage in game over screen:**

```tsx
const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerateShareImage = async () => {
  setIsGenerating(true);

  try {
    const imageUrl = await generateShareImage({
      score: finalScore,
      round: roundReached,
      matchedNfts: matchedNftsThisGame,
      playerName: user?.username,
    });
    setShareImageUrl(imageUrl);
  } catch (error) {
    console.error('Failed to generate share image:', error);
  } finally {
    setIsGenerating(false);
  }
};

// In JSX
<div className="mm-share-section">
  {!shareImageUrl ? (
    <button
      onClick={handleGenerateShareImage}
      disabled={isGenerating}
      className="mm-generate-share-btn"
    >
      {isGenerating ? 'Generating...' : 'Create Share Image'}
    </button>
  ) : (
    <div className="mm-share-image-container">
      <img
        src={shareImageUrl}
        alt="Share your score"
        className="mm-share-image"
      />
      <p className="mm-share-hint">Right-click to save image</p>
    </div>
  )}
</div>
```

```css
.mm-share-section {
  margin-top: 1.5rem;
  text-align: center;
}

.mm-generate-share-btn {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1a1a2e;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.mm-generate-share-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.mm-generate-share-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.mm-share-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.mm-share-image {
  max-width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.mm-share-hint {
  font-size: 0.875rem;
  color: #888;
}
```

---

## Implementation Order Summary

**Phase 1: Sound Foundation (1-6)**
1. Mismatch sound
2. Streak-specific sounds
3. Near-completion anticipation sound
4. Card hover sound
5. Fast match celebration sound
6. Sound variations

**Phase 2: Haptic Layer (7-10)**
7. Card hover haptic
8. Mismatch haptic
9. Timer urgency haptic
10. Streak crescendo haptics

**Phase 3: Visual Polish (11-17)**
11. Squash and stretch on card flip
12. Matched card "pop" animation
13. Particle burst on match
14. Card "wobble" on mismatch
15. Progress bar celebration
16. Near-win celebration
17. Freeze frame on match

**Phase 4: Anticipation & Flow (18-22)**
18. 2 pairs remaining glow
19. 1 pair remaining pulse + music
20. Timer critical shimmer
21. Variable shake intensity
22. Shake decay

**Phase 5: Polish & Personality (23-27)**
23. Theme-specific callouts
24. Contextual progress
25. Dynamic music stems
26. "Revenge" framing
27. Share image generator

---

## Notes for Implementation

- **Test each enhancement individually** before moving to the next
- **Check mobile performance** especially for particles and animations
- **Sound files needed:** Approximately 15-20 audio files (or use programmatic audio)
- **Consider loading states** for audio and image assets
- **Preserve existing functionality** - these are additions, not replacements

---

*Document created: January 2025*
*For: Wojak.ink Memory Match Game*
