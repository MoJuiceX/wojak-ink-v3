# Color Reaction Juice Implementation Guide

> Maximum juice enhancements for the Color Reaction game — a reaction-time color matching game with fruit-themed colors, streak system, and progressive difficulty.

**Reference:** `docs/game-juice-playbook.md` for universal principles
**Checklist:** `docs/COLOR-REACTION-JUICE-CHECKLIST.md` for progress tracking

---

## Research Summary

### Industry Standards for Reaction Games

Based on research into professional reaction/reflex games:

1. **Response time must be <100ms** — Players perceive anything faster as "instant"
2. **Audio feedback is faster to process** — Auditory reaction (140-160ms) beats visual (180-200ms)
3. **Freeze frames sell impact** — Brief pauses (30-60ms) make perfect hits feel powerful
4. **Slow-motion rewards mastery** — Time dilation on perfect reactions creates dopamine hits
5. **Countdown urgency escalates** — Visual + audio + haptic should all intensify as time runs out
6. **Near-miss feedback motivates** — "TOO SLOW!" with timing info encourages retry

### Key Juice Opportunities for Color Reaction

| Current Gap | Solution |
|-------------|----------|
| No haptics | Full haptic system integration |
| Single sounds | Sound variations + reaction-based pitch |
| Basic screen shake | Intensity-scaled shake + freeze frames |
| Simple countdown ring | Multi-phase urgency (color + pulse + sound + haptic) |
| No time dilation | Slow-mo effect on PERFECT reactions |
| Weak wrong tap feedback | Gentle but clear error indication |
| No lives warning | Persistent danger state at 1 life |
| No near-miss detection | "TOO SLOW!" with millisecond display |

---

## Game Context

- **Core Mechanic:** Watch two color circles, tap when they match
- **Colors:** Fruit-themed (expandable to 6+ colors)
- **Timing Ratings:**
  - PERFECT: <300ms (100 pts) — Maximum celebration
  - GREAT: <500ms (75 pts)
  - GOOD: <700ms (50 pts)
  - OK: <1000ms (25 pts)
  - SLOW: ≥1000ms (10 pts)
- **Lives:** 3 hearts, game over at 0
- **Streak:** Resets on wrong/miss, milestones at 5, 10, 15, 20
- **Match Window:** 1500ms countdown ring
- **Difficulty:** Speed increases every 100 points

---

## Color System Expansion

### Current Colors (4)
| Name | Hex | Emoji |
|------|-----|-------|
| Orange | #FF6B00 | 🍊 |
| Lime | #32CD32 | 🍋 |
| Grape | #8B5CF6 | 🍇 |
| Berry | #3B82F6 | 🫐 |

### Expanded Colors (6+)
| Name | Hex | Emoji | Particle Color |
|------|-----|-------|----------------|
| Orange | #FF6B00 | 🍊 | #FFA500 |
| Lime | #32CD32 | 🍋 | #90EE90 |
| Grape | #8B5CF6 | 🍇 | #DDA0DD |
| Berry | #3B82F6 | 🫐 | #87CEEB |
| **Strawberry** | #FF4757 | 🍓 | #FF6B81 |
| **Kiwi** | #2ED573 | 🥝 | #7BED9F |

---

## Table of Contents

1. [Phase 1: Haptic Foundation](#phase-1-haptic-foundation) — Tasks 1-12
2. [Phase 2: Sound System Overhaul](#phase-2-sound-system-overhaul) — Tasks 13-28
3. [Phase 3: Countdown Urgency System](#phase-3-countdown-urgency-system) — Tasks 29-38
4. [Phase 4: Perfect Reaction Celebration](#phase-4-perfect-reaction-celebration) — Tasks 39-48
5. [Phase 5: Visual Juice Enhancement](#phase-5-visual-juice-enhancement) — Tasks 49-62
6. [Phase 6: Streak & Scoring Polish](#phase-6-streak--scoring-polish) — Tasks 63-72
7. [Phase 7: Failure & Warning States](#phase-7-failure--warning-states) — Tasks 73-82
8. [Phase 8: Near-Miss & Close Call System](#phase-8-near-miss--close-call-system) — Tasks 83-90
9. [Phase 9: Final Polish & Accessibility](#phase-9-final-polish--accessibility) — Tasks 91-100
10. [Phase 10: Fever Mode & Advanced Combos](#phase-10-fever-mode--advanced-combos) — Tasks 101-107
11. [Phase 11: Camera & Advanced Visual Effects](#phase-11-camera--advanced-visual-effects) — Tasks 108-111
12. [Phase 12: Viral & Share System](#phase-12-viral--share-system) — Tasks 112-117

---

## Phase 1: Haptic Foundation

> **Goal:** Implement complete haptic feedback system (currently missing entirely)

### Task 1: Add Haptic Hook Integration

**Description:** Import and set up useGameHaptics in ColorReaction component

**Implementation:**
```typescript
// In ColorReaction/index.tsx
import { useGameHaptics } from '../../hooks/useGameHaptics';

const ColorReaction: React.FC = () => {
  const {
    hapticLight,
    hapticMedium,
    hapticHeavy,
    hapticSuccess,
    hapticError,
    hapticCombo,
    vibrate,
  } = useGameHaptics();

  // ... rest of component
};
```

---

### Task 2: Define Color Reaction Haptic Patterns

**Description:** Add game-specific patterns to patterns.ts

**Implementation:**
```typescript
// In hooks/haptics/patterns.ts
export const COLOR_REACTION_PATTERNS = {
  // Tap feedback
  tap: [8],                          // Ultra-light confirmation

  // Reaction-time based
  perfect: [15, 20, 12, 20, 10, 20, 8],  // Celebratory burst
  great: [15, 25, 12, 25, 10],           // Strong success
  good: [15, 30, 12],                    // Medium success
  ok: [15, 40, 10],                      // Light success
  slow: [12],                            // Minimal success

  // Wrong/error
  wrong: [8, 80, 8],                     // Brief double tap (not punishing)
  miss: [30],                            // Single medium pulse

  // Countdown urgency
  countdownTick: [5],                    // Ultra-light tick
  countdownWarning: [10, 50, 10],        // Double tap warning
  countdownCritical: [8, 30, 8, 30, 8],  // Rapid triple

  // Life/danger
  loseLife: [40],                        // Medium-heavy loss
  lastLife: [15, 100, 15],               // Urgent warning
  gameOver: [60, 100, 40, 100, 20],      // Descending fade

  // Streak milestones
  streak5: [12, 20, 10, 20, 8, 20, 6],   // Building celebration
  streak10: [15, 15, 12, 15, 10, 15, 8, 15, 6], // Bigger celebration
  streak15: [18, 12, 15, 12, 12, 12, 10, 12, 8, 12, 6], // Even bigger
  streak20: [20, 10, 18, 10, 15, 10, 12, 10, 10, 10, 8, 10, 6], // Maximum

  // Speed up notification
  speedUp: [10, 30, 15, 30, 10],         // Alert pattern

  // Match window start
  matchStart: [12, 40, 8],               // "Get ready!"
};
```

---

### Task 3: Implement Tap Haptic

**Description:** Add ultra-light haptic on every tap (before determining correct/wrong)

**Implementation:**
```typescript
// In handleTap function
const handleTap = () => {
  // Immediate haptic feedback on tap
  vibrate(COLOR_REACTION_PATTERNS.tap);

  // ... rest of tap logic
};
```

**Why:** Instant feedback makes interface feel responsive, even before result is determined.

---

### Task 4: Implement Reaction-Time Based Haptics

**Description:** Different haptic patterns based on reaction speed

**Implementation:**
```typescript
const getReactionHaptic = (reactionTimeMs: number) => {
  if (reactionTimeMs < 300) return COLOR_REACTION_PATTERNS.perfect;
  if (reactionTimeMs < 500) return COLOR_REACTION_PATTERNS.great;
  if (reactionTimeMs < 700) return COLOR_REACTION_PATTERNS.good;
  if (reactionTimeMs < 1000) return COLOR_REACTION_PATTERNS.ok;
  return COLOR_REACTION_PATTERNS.slow;
};

// In correct tap handler
const onCorrectTap = (reactionTimeMs: number) => {
  const pattern = getReactionHaptic(reactionTimeMs);
  vibrate(pattern);
  // ... rest of success logic
};
```

---

### Task 5: Implement Wrong Tap Haptic

**Description:** Gentle error haptic (not punishing)

**Implementation:**
```typescript
// In wrong tap handler
const onWrongTap = () => {
  vibrate(COLOR_REACTION_PATTERNS.wrong);
  // ... rest of error logic
};
```

---

### Task 6: Implement Miss Haptic

**Description:** Single pulse when match window expires without tap

**Implementation:**
```typescript
// In match window timeout handler
const onMatchWindowExpire = () => {
  vibrate(COLOR_REACTION_PATTERNS.miss);
  // ... rest of miss logic
};
```

---

### Task 7: Implement Countdown Tick Haptic

**Description:** Ultra-light tick during final 500ms of countdown

**Implementation:**
```typescript
// In countdown interval (when remaining < 500ms)
const updateCountdown = (remainingMs: number) => {
  if (remainingMs < 500 && remainingMs % 100 < 50) {
    vibrate(COLOR_REACTION_PATTERNS.countdownTick);
  }
};
```

---

### Task 8: Implement Countdown Warning Haptic

**Description:** Double tap when countdown reaches 750ms

**Implementation:**
```typescript
// Trigger once when crossing 750ms threshold
if (previousRemaining > 750 && remainingMs <= 750) {
  vibrate(COLOR_REACTION_PATTERNS.countdownWarning);
}
```

---

### Task 9: Implement Countdown Critical Haptic

**Description:** Rapid triple when countdown reaches 300ms

**Implementation:**
```typescript
// Trigger once when crossing 300ms threshold
if (previousRemaining > 300 && remainingMs <= 300) {
  vibrate(COLOR_REACTION_PATTERNS.countdownCritical);
}
```

---

### Task 10: Implement Life Loss Haptic

**Description:** Medium-heavy pulse when losing a life

**Implementation:**
```typescript
const onLoseLife = (newLives: number) => {
  vibrate(COLOR_REACTION_PATTERNS.loseLife);

  // Extra warning if last life
  if (newLives === 1) {
    setTimeout(() => {
      vibrate(COLOR_REACTION_PATTERNS.lastLife);
    }, 200);
  }
};
```

---

### Task 11: Implement Streak Milestone Haptics

**Description:** Escalating celebration patterns at streak milestones

**Implementation:**
```typescript
const getStreakHaptic = (streak: number) => {
  if (streak === 20) return COLOR_REACTION_PATTERNS.streak20;
  if (streak === 15) return COLOR_REACTION_PATTERNS.streak15;
  if (streak === 10) return COLOR_REACTION_PATTERNS.streak10;
  if (streak === 5) return COLOR_REACTION_PATTERNS.streak5;
  return null;
};

// In streak update
const onStreakUpdate = (newStreak: number) => {
  const haptic = getStreakHaptic(newStreak);
  if (haptic) {
    vibrate(haptic);
  }
};
```

---

### Task 12: Implement Game Over Haptic

**Description:** Descending fade pattern on game over

**Implementation:**
```typescript
const onGameOver = () => {
  vibrate(COLOR_REACTION_PATTERNS.gameOver);
  // ... rest of game over logic
};
```

---

## Phase 2: Sound System Overhaul

> **Goal:** Complete audio feedback with variations, reaction-based sounds, and missing sounds

### Task 13: Create Correct Tap Sound with Reaction Variation

**Description:** Sound pitch and richness varies by reaction time

**Implementation:**
```typescript
// In useGameSounds.ts or ColorReaction sounds
export const createCorrectTapSound = (
  audioContext: AudioContext,
  reactionTimeMs: number
) => {
  // Base frequency increases with faster reactions
  const baseFreq = reactionTimeMs < 300 ? 880 :
                   reactionTimeMs < 500 ? 784 :
                   reactionTimeMs < 700 ? 698 :
                   reactionTimeMs < 1000 ? 622 : 554;

  // Main tone
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, audioContext.currentTime + 0.15);

  gain.gain.setValueAtTime(0.4, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);

  // Add sparkle for PERFECT/GREAT
  if (reactionTimeMs < 500) {
    const sparkle = audioContext.createOscillator();
    const sparkleGain = audioContext.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(baseFreq * 2, audioContext.currentTime);
    sparkleGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    sparkle.connect(sparkleGain).connect(audioContext.destination);
    sparkle.start();
    sparkle.stop(audioContext.currentTime + 0.2);
  }

  // Add bass for PERFECT
  if (reactionTimeMs < 300) {
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    bass.type = 'sine';
    bass.frequency.value = baseFreq / 2;
    bassGain.gain.setValueAtTime(0.25, audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.18);

    bass.connect(bassGain).connect(audioContext.destination);
    bass.start();
    bass.stop(audioContext.currentTime + 0.18);
  }
};
```

---

### Task 14: Create Wrong Tap Sound (Gentle)

**Description:** Soft, non-punishing error indication

**Implementation:**
```typescript
export const createWrongTapSound = (audioContext: AudioContext) => {
  // Soft descending tone
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);

  gain.gain.setValueAtTime(0.15, audioContext.currentTime); // Low volume
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.2);
};
```

---

### Task 15: Create Miss Sound (Window Expired)

**Description:** Distinct sound when match window expires

**Implementation:**
```typescript
export const createMissSound = (audioContext: AudioContext) => {
  // Whooshing fade-out
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  noise.connect(filter).connect(gain).connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.3);
};
```

---

### Task 16: Create Match Window Start Sound

**Description:** Attention-grabbing sound when colors match

**Implementation:**
```typescript
export const createMatchStartSound = (audioContext: AudioContext) => {
  // Quick ascending "ding!"
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioContext.currentTime);
  osc.frequency.setValueAtTime(900, audioContext.currentTime + 0.05);

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.15);
};
```

---

### Task 17: Create Countdown Tick Sound

**Description:** Soft tick for final countdown

**Implementation:**
```typescript
export const createCountdownTickSound = (
  audioContext: AudioContext,
  urgencyLevel: number // 0-3
) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Pitch increases with urgency
  const baseFreq = 800 + urgencyLevel * 100;
  osc.type = 'sine';
  osc.frequency.value = baseFreq;

  // Volume increases with urgency
  const volume = 0.1 + urgencyLevel * 0.05;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.05);
};
```

---

### Task 18: Create Countdown Warning Sound

**Description:** More urgent tick at 750ms

**Implementation:**
```typescript
export const createCountdownWarningSound = (audioContext: AudioContext) => {
  // Double beep
  [0, 0.08].forEach((delay) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1000;

    gain.gain.setValueAtTime(0.2, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.06);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + 0.06);
  });
};
```

---

### Task 19: Create Countdown Critical Sound

**Description:** Urgent alert at 300ms remaining

**Implementation:**
```typescript
export const createCountdownCriticalSound = (audioContext: AudioContext) => {
  // Triple beep, ascending
  [0, 0.06, 0.12].forEach((delay, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 1000 + i * 100; // Ascending pitch

    gain.gain.setValueAtTime(0.25, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.05);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + 0.05);
  });
};
```

---

### Task 20: Create Life Loss Sound

**Description:** Soft but noticeable life loss indicator

**Implementation:**
```typescript
export const createLifeLossSound = (audioContext: AudioContext) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.25);

  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.25);
};
```

---

### Task 21: Create Last Life Warning Sound

**Description:** Dramatic warning when down to 1 life

**Implementation:**
```typescript
export const createLastLifeWarningSound = (audioContext: AudioContext) => {
  // Low ominous tone
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, audioContext.currentTime);
  osc.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.4);

  gain.gain.setValueAtTime(0.25, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  // Add pulsing
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.frequency.value = 8;
  lfoGain.gain.value = 0.1;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();
  lfo.stop(audioContext.currentTime + 0.4);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.4);
};
```

---

### Task 22: Create PERFECT Celebration Sound

**Description:** Maximum celebration for <300ms reactions

**Implementation:**
```typescript
export const createPerfectSound = (audioContext: AudioContext) => {
  // Triumphant fanfare
  const notes = [880, 1108, 1318, 1760]; // A5, C#6, E6, A6

  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const delay = i * 0.06;
    gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.25);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + 0.25);
  });

  // Shimmer overlay
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.08, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

  noise.connect(filter).connect(noiseGain).connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.3);
};
```

---

### Task 23: Create Streak Milestone Sounds

**Description:** Escalating celebration sounds at 5, 10, 15, 20

**Implementation:**
```typescript
export const createStreakSound = (audioContext: AudioContext, streak: number) => {
  const noteCount = streak === 5 ? 3 : streak === 10 ? 4 : streak === 15 ? 5 : 6;
  const baseFreq = 523; // C5

  for (let i = 0; i < noteCount; i++) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    // Major scale ascending
    const scaleSteps = [0, 2, 4, 5, 7, 9]; // C D E F G A
    const freq = baseFreq * Math.pow(2, scaleSteps[i % 6] / 12);

    osc.type = 'sine';
    osc.frequency.value = freq;

    const delay = i * 0.08;
    const volume = 0.3 + (streak / 20) * 0.1;

    gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.2);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + 0.2);
  }
};
```

---

### Task 24: Create Speed Up Notification Sound

**Description:** Alert when difficulty increases

**Implementation:**
```typescript
export const createSpeedUpSound = (audioContext: AudioContext) => {
  // Quick ascending whoosh
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;

  osc.connect(filter).connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.2);
};
```

---

### Task 25: Create Color Change Sound

**Description:** Subtle sound when colors cycle (not match)

**Implementation:**
```typescript
export const createColorChangeSound = (audioContext: AudioContext) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 440;

  gain.gain.setValueAtTime(0.05, audioContext.currentTime); // Very quiet
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.08);
};
```

---

### Task 26: Create Near-Miss "Too Slow" Sound

**Description:** Distinct sound for taps just after window expires

**Implementation:**
```typescript
export const createTooSlowSound = (audioContext: AudioContext) => {
  // Sympathetic descending tone (not harsh)
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(500, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);

  gain.gain.setValueAtTime(0.18, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.25);
};
```

---

### Task 27: Create Time Dilation Sound (Slow-Mo)

**Description:** Ethereal sound during slow-motion effect on PERFECT

**Implementation:**
```typescript
export const createTimeDilationSound = (audioContext: AudioContext) => {
  // Whooshing time-stretch effect
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(200, audioContext.currentTime);
  osc1.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.4);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(203, audioContext.currentTime); // Slight detuning
  osc2.frequency.linearRampToValueAtTime(152, audioContext.currentTime + 0.4);

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  osc1.connect(gain).connect(audioContext.destination);
  osc2.connect(gain);

  osc1.start();
  osc2.start();
  osc1.stop(audioContext.currentTime + 0.4);
  osc2.stop(audioContext.currentTime + 0.4);
};
```

---

### Task 28: Add Sound Variations System

**Description:** Pitch variation for repeated sounds

**Implementation:**
```typescript
const playWithVariation = (
  createSound: (ctx: AudioContext, ...args: any[]) => void,
  audioContext: AudioContext,
  ...args: any[]
) => {
  // Add ±5% random pitch variation
  const playbackRate = 0.95 + Math.random() * 0.1;

  // For Web Audio, we modify frequency directly
  // This is already handled in the sound functions via random variation
  createSound(audioContext, ...args);
};

// Usage example
const playCorrectTap = (reactionTimeMs: number) => {
  // Add slight random pitch variation to base frequency
  const pitchVariation = 0.95 + Math.random() * 0.1;
  createCorrectTapSound(audioContext, reactionTimeMs, pitchVariation);
};
```

---

## Phase 3: Countdown Urgency System

> **Goal:** Multi-phase urgency escalation for the 1500ms match window

### Task 29: Define Urgency Phases

**Description:** Create urgency level system based on remaining time

**Implementation:**
```typescript
interface UrgencyPhase {
  name: string;
  threshold: number; // ms remaining
  ringColor: string;
  pulseSpeed: number; // ms per pulse
  textColor: string;
  shake: boolean;
  tickSound: boolean;
}

const URGENCY_PHASES: UrgencyPhase[] = [
  {
    name: 'normal',
    threshold: 1500,
    ringColor: '#2ecc71', // Green
    pulseSpeed: 0,
    textColor: '#2ecc71',
    shake: false,
    tickSound: false,
  },
  {
    name: 'warning',
    threshold: 750,
    ringColor: '#f1c40f', // Yellow
    pulseSpeed: 400,
    textColor: '#f1c40f',
    shake: false,
    tickSound: true,
  },
  {
    name: 'critical',
    threshold: 300,
    ringColor: '#e74c3c', // Red
    pulseSpeed: 150,
    textColor: '#e74c3c',
    shake: true,
    tickSound: true,
  },
];

const getUrgencyPhase = (remainingMs: number): UrgencyPhase => {
  for (const phase of URGENCY_PHASES) {
    if (remainingMs <= phase.threshold) {
      return phase;
    }
  }
  return URGENCY_PHASES[0];
};
```

---

### Task 30: Implement Ring Color Transition

**Description:** Countdown ring smoothly transitions through urgency colors

**Implementation:**
```typescript
// In countdown ring component/logic
const getRingColor = (remainingMs: number, totalMs: number): string => {
  const progress = remainingMs / totalMs;

  if (progress > 0.5) {
    // Green zone
    return '#2ecc71';
  } else if (progress > 0.2) {
    // Yellow zone - interpolate green to yellow
    const t = (0.5 - progress) / 0.3;
    return interpolateColor('#2ecc71', '#f1c40f', t);
  } else {
    // Red zone - interpolate yellow to red
    const t = (0.2 - progress) / 0.2;
    return interpolateColor('#f1c40f', '#e74c3c', t);
  }
};

const interpolateColor = (color1: string, color2: string, t: number): string => {
  // Parse hex colors and interpolate
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
```

---

### Task 31: Implement Ring Pulse Animation

**Description:** Ring pulses faster as urgency increases

**Implementation:**
```css
/* In ColorReaction.game.css */
.countdown-ring {
  transition: stroke 0.1s ease;
}

.countdown-ring.pulse-normal {
  /* No pulse */
}

.countdown-ring.pulse-warning {
  animation: ring-pulse 400ms ease-in-out infinite;
}

.countdown-ring.pulse-critical {
  animation: ring-pulse 150ms ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    opacity: 1;
    stroke-width: 4;
  }
  50% {
    opacity: 0.7;
    stroke-width: 6;
  }
}
```

```typescript
// Add class based on urgency
const getRingPulseClass = (remainingMs: number): string => {
  if (remainingMs <= 300) return 'pulse-critical';
  if (remainingMs <= 750) return 'pulse-warning';
  return 'pulse-normal';
};
```

---

### Task 32: Implement "TAP NOW!" Text Urgency

**Description:** Text pulses and changes color with urgency

**Implementation:**
```css
.tap-now-text {
  font-weight: bold;
  text-transform: uppercase;
  transition: color 0.1s ease, transform 0.1s ease;
}

.tap-now-text.urgency-normal {
  color: #2ecc71;
  animation: tap-pulse 500ms ease-in-out infinite;
}

.tap-now-text.urgency-warning {
  color: #f1c40f;
  animation: tap-pulse 300ms ease-in-out infinite;
}

.tap-now-text.urgency-critical {
  color: #e74c3c;
  animation: tap-pulse-critical 150ms ease-in-out infinite;
}

@keyframes tap-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes tap-pulse-critical {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```

---

### Task 33: Implement Countdown Tick Sound Loop

**Description:** Ticking sound in final 500ms

**Implementation:**
```typescript
// In countdown update interval
const countdownTickIntervalRef = useRef<number | null>(null);

const startCountdownTicks = () => {
  if (countdownTickIntervalRef.current) return;

  countdownTickIntervalRef.current = window.setInterval(() => {
    const remaining = getRemainingTime();
    if (remaining > 0 && remaining <= 500) {
      const urgency = remaining <= 200 ? 3 : remaining <= 350 ? 2 : 1;
      createCountdownTickSound(audioContext, urgency);
      vibrate(COLOR_REACTION_PATTERNS.countdownTick);
    }
  }, 100); // Tick every 100ms
};

const stopCountdownTicks = () => {
  if (countdownTickIntervalRef.current) {
    clearInterval(countdownTickIntervalRef.current);
    countdownTickIntervalRef.current = null;
  }
};
```

---

### Task 34: Implement Circle Shake in Critical Phase

**Description:** Player circle slightly shakes when <300ms remaining

**Implementation:**
```css
.player-circle.critical-shake {
  animation: circle-shake 50ms ease-in-out infinite;
}

@keyframes circle-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

```typescript
// Apply shake class when critical
const getCircleClasses = (remainingMs: number): string => {
  const classes = ['player-circle'];
  if (remainingMs > 0 && remainingMs <= 300) {
    classes.push('critical-shake');
  }
  return classes.join(' ');
};
```

---

### Task 35: Implement Background Urgency Tint

**Description:** Subtle background color shift during match window

**Implementation:**
```typescript
const getBackgroundTint = (remainingMs: number, totalMs: number): string => {
  if (remainingMs <= 0) return 'transparent';

  const progress = remainingMs / totalMs;

  if (progress > 0.5) {
    // Subtle green tint
    return 'rgba(46, 204, 113, 0.05)';
  } else if (progress > 0.2) {
    // Subtle yellow tint
    const t = (0.5 - progress) / 0.3;
    const alpha = 0.05 + t * 0.05;
    return `rgba(241, 196, 15, ${alpha})`;
  } else {
    // Red tint, increasing
    const t = (0.2 - progress) / 0.2;
    const alpha = 0.1 + t * 0.1;
    return `rgba(231, 76, 60, ${alpha})`;
  }
};
```

```css
.game-container {
  transition: background-color 0.1s ease;
}

.urgency-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: background-color 0.1s ease;
}
```

---

### Task 36: Implement Remaining Time Display

**Description:** Show milliseconds remaining in critical phase

**Implementation:**
```typescript
// Show milliseconds when <500ms
const showRemainingMs = remainingMs > 0 && remainingMs <= 500;

// In render
{showRemainingMs && (
  <div className={`remaining-ms ${remainingMs <= 200 ? 'critical' : 'warning'}`}>
    {Math.ceil(remainingMs)}ms
  </div>
)}
```

```css
.remaining-ms {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: bold;
  font-family: monospace;
}

.remaining-ms.warning {
  color: #f1c40f;
}

.remaining-ms.critical {
  color: #e74c3c;
  animation: ms-flash 100ms ease-in-out infinite;
}

@keyframes ms-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

### Task 37: Implement Heartbeat Sound in Critical

**Description:** Low heartbeat-like pulse in final 300ms

**Implementation:**
```typescript
const heartbeatIntervalRef = useRef<number | null>(null);

const startHeartbeat = () => {
  if (heartbeatIntervalRef.current) return;

  const playHeartbeat = () => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 60;

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.15);
  };

  playHeartbeat();
  heartbeatIntervalRef.current = window.setInterval(playHeartbeat, 200);
};

const stopHeartbeat = () => {
  if (heartbeatIntervalRef.current) {
    clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = null;
  }
};

// Start when entering critical phase
useEffect(() => {
  if (remainingMs > 0 && remainingMs <= 300) {
    startHeartbeat();
  } else {
    stopHeartbeat();
  }
  return () => stopHeartbeat();
}, [remainingMs]);
```

---

### Task 38: Implement Vignette Urgency Effect

**Description:** Red vignette intensifies with urgency

**Implementation:**
```css
.urgency-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.urgency-vignette.active {
  opacity: 1;
  background: radial-gradient(
    circle at center,
    transparent 40%,
    rgba(231, 76, 60, var(--vignette-intensity)) 100%
  );
}
```

```typescript
const getVignetteIntensity = (remainingMs: number): number => {
  if (remainingMs <= 0 || remainingMs > 500) return 0;
  if (remainingMs > 300) return 0.1;
  if (remainingMs > 150) return 0.2;
  return 0.3;
};

// In render
<div
  className={`urgency-vignette ${vignetteIntensity > 0 ? 'active' : ''}`}
  style={{ '--vignette-intensity': vignetteIntensity } as React.CSSProperties}
/>
```

---

## Phase 4: Perfect Reaction Celebration

> **Goal:** Maximum celebration for PERFECT (<300ms) reactions

### Task 39: Implement Time Dilation Effect

**Description:** Brief slow-motion effect on PERFECT tap

**Implementation:**
```typescript
const [timeDilation, setTimeDilation] = useState(false);

const triggerTimeDilation = () => {
  setTimeDilation(true);
  createTimeDilationSound(audioContext);

  // Return to normal after 400ms
  setTimeout(() => {
    setTimeDilation(false);
  }, 400);
};

// In correct tap handler for PERFECT
if (reactionTimeMs < 300) {
  triggerTimeDilation();
}
```

```css
.game-container.time-dilation {
  animation: time-dilation 400ms ease-out;
}

@keyframes time-dilation {
  0% {
    filter: saturate(1.5) brightness(1.1);
    transform: scale(1);
  }
  20% {
    filter: saturate(2) brightness(1.2);
    transform: scale(1.02);
  }
  100% {
    filter: saturate(1) brightness(1);
    transform: scale(1);
  }
}

/* Slow down floating scores during dilation */
.game-container.time-dilation .floating-score {
  animation-duration: 3s; /* Slower */
}
```

---

### Task 40: Implement Screen Flash on PERFECT

**Description:** Bright flash effect

**Implementation:**
```typescript
const [screenFlash, setScreenFlash] = useState<string | null>(null);

const triggerScreenFlash = (color: string) => {
  setScreenFlash(color);
  setTimeout(() => setScreenFlash(null), 150);
};

// In PERFECT handler
triggerScreenFlash('#ffd700'); // Gold flash
```

```css
.screen-flash {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.05s ease;
  z-index: 1000;
}

.screen-flash.active {
  opacity: 1;
  animation: flash-fade 150ms ease-out;
}

@keyframes flash-fade {
  0% { opacity: 0.5; }
  100% { opacity: 0; }
}
```

---

### Task 41: Implement Freeze Frame on PERFECT

**Description:** Brief 60ms pause on PERFECT

**Implementation:**
```typescript
const freezeFrameRef = useRef(false);

const triggerFreezeFrame = (durationMs: number) => {
  freezeFrameRef.current = true;
  setTimeout(() => {
    freezeFrameRef.current = false;
  }, durationMs);
};

// In game loop/animation
const gameLoop = () => {
  if (freezeFrameRef.current) {
    // Skip physics updates, still render
    requestAnimationFrame(gameLoop);
    return;
  }
  // Normal update
};

// In PERFECT handler
triggerFreezeFrame(60);
```

---

### Task 42: Implement Particle Explosion on PERFECT

**Description:** Major particle burst from both circles

**Implementation:**
```typescript
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

const [particles, setParticles] = useState<Particle[]>([]);

const createParticleBurst = (x: number, y: number, color: string, count: number) => {
  const newParticles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 3 + Math.random() * 5;

    newParticles.push({
      id: Date.now() + i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      color: i % 4 === 0 ? '#ffffff' : color,
      size: 4 + Math.random() * 6,
      life: 1,
    });
  }

  setParticles((prev) => [...prev, ...newParticles]);
};

// In PERFECT handler - burst from both circles
const targetCirclePos = getTargetCirclePosition();
const playerCirclePos = getPlayerCirclePosition();

createParticleBurst(targetCirclePos.x, targetCirclePos.y, currentColor, 20);
createParticleBurst(playerCirclePos.x, playerCirclePos.y, currentColor, 20);
```

---

### Task 43: Implement "PERFECT!" Callout Animation

**Description:** Large animated text callout

**Implementation:**
```typescript
const [callout, setCallout] = useState<{text: string; color: string} | null>(null);

const showCallout = (text: string, color: string) => {
  setCallout({ text, color });
  setTimeout(() => setCallout(null), 1500);
};

// In PERFECT handler
showCallout('PERFECT!', '#ffd700');
```

```css
.callout {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  text-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  z-index: 100;
  animation: callout-enter 1.5s ease-out forwards;
}

@keyframes callout-enter {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  10% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 1;
  }
  20% {
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}
```

---

### Task 44: Implement Screen Shake on PERFECT

**Description:** Brief shake with decay

**Implementation:**
```typescript
const [shakeIntensity, setShakeIntensity] = useState(0);

const triggerScreenShake = (intensity: number, durationMs: number) => {
  setShakeIntensity(intensity);

  const startTime = performance.now();
  const animate = () => {
    const elapsed = performance.now() - startTime;
    if (elapsed < durationMs) {
      const decay = 1 - elapsed / durationMs;
      setShakeIntensity(intensity * decay);
      requestAnimationFrame(animate);
    } else {
      setShakeIntensity(0);
    }
  };
  requestAnimationFrame(animate);
};

// In PERFECT handler
triggerScreenShake(8, 200);
```

```css
.game-container {
  transform: translate(
    calc(var(--shake-x, 0) * 1px),
    calc(var(--shake-y, 0) * 1px)
  );
}
```

```typescript
// Apply shake offset
const shakeX = shakeIntensity > 0 ? (Math.random() - 0.5) * 2 * shakeIntensity : 0;
const shakeY = shakeIntensity > 0 ? (Math.random() - 0.5) * 2 * shakeIntensity : 0;

<div
  className="game-container"
  style={{
    '--shake-x': shakeX,
    '--shake-y': shakeY,
  } as React.CSSProperties}
>
```

---

### Task 45: Implement Circle Pulse on PERFECT

**Description:** Both circles pulse outward

**Implementation:**
```css
.color-circle.perfect-pulse {
  animation: circle-perfect-pulse 400ms ease-out;
}

@keyframes circle-perfect-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.15);
    box-shadow: 0 0 30px 10px currentColor;
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
  }
}
```

---

### Task 46: Implement Confetti Burst on PERFECT

**Description:** Colorful confetti explosion

**Implementation:**
```typescript
interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
}

const createConfettiBurst = (x: number, y: number, count: number) => {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff00ff'];
  const newConfetti: Confetti[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 6;

    newConfetti.push({
      id: Date.now() + i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size: 8 + Math.random() * 8,
      life: 1,
    });
  }

  setConfetti((prev) => [...prev, ...newConfetti]);
};

// In PERFECT handler
createConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 50);
```

---

### Task 47: Implement Reaction Time Display Animation

**Description:** Show reaction time with emphasis on PERFECT

**Implementation:**
```typescript
const [reactionDisplay, setReactionDisplay] = useState<{
  time: number;
  rating: string;
} | null>(null);

const showReactionTime = (timeMs: number, rating: string) => {
  setReactionDisplay({ time: timeMs, rating });
  setTimeout(() => setReactionDisplay(null), 2000);
};
```

```css
.reaction-display {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: reaction-display-enter 2s ease-out forwards;
}

.reaction-time {
  font-size: 36px;
  font-weight: bold;
  font-family: monospace;
}

.reaction-time.perfect {
  color: #ffd700;
  text-shadow: 0 0 20px #ffd700;
  animation: perfect-glow 500ms ease-in-out infinite alternate;
}

@keyframes perfect-glow {
  0% { text-shadow: 0 0 20px #ffd700; }
  100% { text-shadow: 0 0 40px #ffd700, 0 0 60px #ffa500; }
}

@keyframes reaction-display-enter {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  20% {
    transform: translateX(-50%) scale(1);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}
```

---

### Task 48: Implement Circle Connection Line on PERFECT

**Description:** Glowing line connects both circles on PERFECT match

**Implementation:**
```css
.connection-line {
  position: absolute;
  height: 4px;
  background: linear-gradient(90deg, var(--color-1), var(--color-2));
  transform-origin: left center;
  animation: connection-pulse 400ms ease-out forwards;
  box-shadow: 0 0 20px var(--color-1);
}

@keyframes connection-pulse {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  30% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(1);
  }
}
```

---

## Phase 5: Visual Juice Enhancement

> **Goal:** Enhanced visual feedback for all interactions

### Task 49: Implement Circle Squash on Tap

**Description:** Circle compresses when tapped

**Implementation:**
```css
.color-circle {
  transition: transform 0.1s ease;
}

.color-circle.tapped {
  animation: circle-squash 150ms ease-out;
}

@keyframes circle-squash {
  0% { transform: scale(1, 1); }
  30% { transform: scale(1.1, 0.9); }
  60% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}
```

---

### Task 50: Implement Color Change Animation

**Description:** Smooth color transitions with bounce

**Implementation:**
```css
.color-circle {
  transition: background-color 0.15s ease;
}

.color-circle.color-changing {
  animation: color-change-bounce 200ms ease-out;
}

@keyframes color-change-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(0.92); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

---

### Task 51: Implement Impact Flash on Correct

**Description:** White expanding circle at tap point

**Implementation:**
```typescript
const [impactFlash, setImpactFlash] = useState<{x: number; y: number} | null>(null);

const createImpactFlash = (x: number, y: number) => {
  setImpactFlash({ x, y });
  setTimeout(() => setImpactFlash(null), 200);
};
```

```css
.impact-flash {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transform: translate(-50%, -50%);
  animation: impact-flash-expand 200ms ease-out forwards;
  pointer-events: none;
}

@keyframes impact-flash-expand {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(4);
    opacity: 0;
  }
}
```

---

### Task 52: Implement Particle System for All Reactions

**Description:** Particle bursts scaled by reaction quality

**Implementation:**
```typescript
const getParticleCount = (rating: string): number => {
  switch (rating) {
    case 'PERFECT': return 20;
    case 'GREAT': return 15;
    case 'GOOD': return 10;
    case 'OK': return 5;
    case 'SLOW': return 3;
    default: return 0;
  }
};

// In correct tap handler
const particleCount = getParticleCount(rating);
if (particleCount > 0) {
  createParticleBurst(playerCirclePos.x, playerCirclePos.y, currentColor, particleCount);
}
```

---

### Task 53: Implement Floating Score Animation

**Description:** Enhanced floating score with rating-based styling

**Implementation:**
```css
.floating-score {
  position: absolute;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  animation: float-up 1.5s ease-out forwards;
  pointer-events: none;
}

.floating-score.perfect {
  font-size: 28px;
  color: #ffd700;
  text-shadow: 0 0 10px #ffd700;
}

.floating-score.great {
  font-size: 24px;
  color: #2ecc71;
}

.floating-score.good {
  font-size: 20px;
  color: #3498db;
}

.floating-score.ok {
  font-size: 18px;
  color: #9b59b6;
}

.floating-score.slow {
  font-size: 16px;
  color: #95a5a6;
}

@keyframes float-up {
  0% {
    transform: translateY(0) scale(1.2);
    opacity: 1;
  }
  20% {
    transform: translateY(-10px) scale(1);
  }
  100% {
    transform: translateY(-80px);
    opacity: 0;
  }
}
```

---

### Task 54: Implement Wrong Tap Red Flash

**Description:** Brief red tint on wrong tap (gentle)

**Implementation:**
```typescript
const [wrongFlash, setWrongFlash] = useState(false);

const triggerWrongFlash = () => {
  setWrongFlash(true);
  setTimeout(() => setWrongFlash(false), 200);
};
```

```css
.wrong-flash-overlay {
  position: fixed;
  inset: 0;
  background: rgba(231, 76, 60, 0.15);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.wrong-flash-overlay.active {
  animation: wrong-flash 200ms ease-out;
}

@keyframes wrong-flash {
  0% { opacity: 0.3; }
  100% { opacity: 0; }
}
```

---

### Task 55: Implement Gentle Screen Shake on Wrong

**Description:** Very light shake on wrong tap

**Implementation:**
```typescript
// In wrong tap handler - use lighter shake
triggerScreenShake(3, 150); // Much lighter than PERFECT
```

---

### Task 56: Implement Circle Glow Enhancement

**Description:** Circles glow during match window

**Implementation:**
```css
.color-circle.match-active {
  box-shadow:
    0 0 20px currentColor,
    0 0 40px currentColor,
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  animation: match-glow 500ms ease-in-out infinite alternate;
}

@keyframes match-glow {
  0% {
    box-shadow:
      0 0 20px currentColor,
      0 0 40px currentColor;
  }
  100% {
    box-shadow:
      0 0 30px currentColor,
      0 0 60px currentColor;
  }
}
```

---

### Task 57: Implement Score Counter Animation

**Description:** Score counts up with bounce

**Implementation:**
```typescript
const [displayScore, setDisplayScore] = useState(0);
const [scoreTarget, setScoreTarget] = useState(0);

// Animate score counting
useEffect(() => {
  if (displayScore < scoreTarget) {
    const diff = scoreTarget - displayScore;
    const increment = Math.max(1, Math.ceil(diff * 0.1));
    const timeout = setTimeout(() => {
      setDisplayScore(Math.min(displayScore + increment, scoreTarget));
    }, 16);
    return () => clearTimeout(timeout);
  }
}, [displayScore, scoreTarget]);

// When score changes
const addScore = (points: number) => {
  setScoreTarget((prev) => prev + points);
};
```

```css
.score-display {
  transition: transform 0.1s ease;
}

.score-display.counting {
  animation: score-bounce 100ms ease-out;
}

@keyframes score-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

---

### Task 58: Implement Lives Animation

**Description:** Hearts bounce on gain/loss

**Implementation:**
```css
.life-heart {
  display: inline-block;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.life-heart.losing {
  animation: heart-lose 300ms ease-out;
}

@keyframes heart-lose {
  0% { transform: scale(1); opacity: 1; }
  30% { transform: scale(1.3); }
  100% { transform: scale(0); opacity: 0; }
}

.life-heart.warning {
  animation: heart-warning-pulse 500ms ease-in-out infinite;
  color: #e74c3c;
}

@keyframes heart-warning-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

---

### Task 59: Implement Speed Up Visual Callout

**Description:** "SPEED UP!" notification when difficulty increases

**Implementation:**
```typescript
const [speedUpNotification, setSpeedUpNotification] = useState(false);

const showSpeedUp = () => {
  setSpeedUpNotification(true);
  createSpeedUpSound(audioContext);
  vibrate(COLOR_REACTION_PATTERNS.speedUp);
  setTimeout(() => setSpeedUpNotification(false), 1500);
};

// Trigger when score crosses 100-point threshold
useEffect(() => {
  if (score > 0 && score % 100 === 0) {
    showSpeedUp();
  }
}, [Math.floor(score / 100)]);
```

```css
.speed-up-notification {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 0 0 10px #e74c3c;
  animation: speed-up-enter 1.5s ease-out forwards;
}

@keyframes speed-up-enter {
  0% {
    transform: translateX(-50%) scale(0.5);
    opacity: 0;
  }
  15% {
    transform: translateX(-50%) scale(1.2);
    opacity: 1;
  }
  25% {
    transform: translateX(-50%) scale(1);
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
}
```

---

### Task 60: Implement Background Pulse on Match

**Description:** Subtle background pulse when match occurs

**Implementation:**
```css
.game-background.match-pulse {
  animation: bg-pulse 300ms ease-out;
}

@keyframes bg-pulse {
  0% {
    filter: brightness(1);
  }
  30% {
    filter: brightness(1.1);
  }
  100% {
    filter: brightness(1);
  }
}
```

---

### Task 61: Implement Streak Fire Effect

**Description:** Visual fire/glow effect at high streaks

**Implementation:**
```css
.player-circle.streak-fire {
  position: relative;
}

.player-circle.streak-5::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 165, 0, 0.3) 0%, transparent 70%);
  animation: fire-pulse 400ms ease-in-out infinite;
}

.player-circle.streak-10::after {
  background: radial-gradient(circle, rgba(255, 100, 0, 0.4) 0%, transparent 70%);
  animation: fire-pulse 300ms ease-in-out infinite;
}

.player-circle.streak-15::after {
  background: radial-gradient(circle, rgba(255, 50, 0, 0.5) 0%, transparent 70%);
  animation: fire-pulse 200ms ease-in-out infinite;
}

.player-circle.streak-20::after {
  background: radial-gradient(circle, rgba(255, 0, 100, 0.6) 0%, transparent 70%);
  animation: fire-pulse 150ms ease-in-out infinite;
}

@keyframes fire-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
}
```

---

### Task 62: Implement Emoji Burst on Correct

**Description:** Fruit emoji bursts from circle on correct tap

**Implementation:**
```typescript
const createEmojiBurst = (x: number, y: number, emoji: string, count: number) => {
  const newEmojis: EmojiParticle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    newEmojis.push({
      id: Date.now() + i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      emoji,
      size: 16 + Math.random() * 8,
      life: 1,
      rotation: Math.random() * 360,
    });
  }

  setEmojiParticles((prev) => [...prev, ...newEmojis]);
};

// In correct tap handler
const currentEmoji = COLORS[playerColor].emoji;
createEmojiBurst(playerCirclePos.x, playerCirclePos.y, currentEmoji, 8);
```

---

## Phase 6: Streak & Scoring Polish

> **Goal:** Enhanced streak celebrations and scoring feedback

### Task 63: Implement Combo Meter Visual

**Description:** On-screen combo meter that fills

**Implementation:**
```typescript
// Streak meter component
const StreakMeter: React.FC<{ streak: number; maxStreak: number }> = ({
  streak,
  maxStreak,
}) => {
  const progress = Math.min(streak / 20, 1); // Max at 20
  const nextMilestone = [5, 10, 15, 20].find((m) => m > streak) || 20;
  const milestoneProgress = streak % 5 / 5;

  return (
    <div className="streak-meter">
      <div className="streak-bar">
        <div
          className="streak-fill"
          style={{ width: `${progress * 100}%` }}
        />
        {[5, 10, 15, 20].map((milestone) => (
          <div
            key={milestone}
            className={`milestone-marker ${streak >= milestone ? 'achieved' : ''}`}
            style={{ left: `${(milestone / 20) * 100}%` }}
          />
        ))}
      </div>
      <div className="streak-count">x{streak}</div>
    </div>
  );
};
```

```css
.streak-meter {
  position: absolute;
  top: 60px;
  left: 10px;
  right: 10px;
}

.streak-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.streak-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff6b6b);
  border-radius: 4px;
  transition: width 0.2s ease;
}

.milestone-marker {
  position: absolute;
  top: -4px;
  width: 2px;
  height: 16px;
  background: rgba(255, 255, 255, 0.5);
  transform: translateX(-50%);
}

.milestone-marker.achieved {
  background: #ffd700;
  box-shadow: 0 0 10px #ffd700;
}

.streak-count {
  position: absolute;
  right: 0;
  top: -20px;
  font-weight: bold;
  font-size: 18px;
  color: #ffd700;
}
```

---

### Task 64: Implement Streak Milestone Celebration

**Description:** Special celebration at 5, 10, 15, 20

**Implementation:**
```typescript
const celebrateStreakMilestone = (streak: number) => {
  // Sound
  createStreakSound(audioContext, streak);

  // Haptic
  const pattern = getStreakHaptic(streak);
  if (pattern) vibrate(pattern);

  // Visual callout
  const callouts = {
    5: 'NICE!',
    10: 'AMAZING!',
    15: 'INCREDIBLE!',
    20: 'LEGENDARY!',
  };
  showCallout(callouts[streak] || '', '#ffd700');

  // Screen effects
  if (streak >= 10) {
    triggerScreenFlash('#ffd700');
    triggerScreenShake(streak / 5, 150);
  }

  // Confetti at 10+
  if (streak >= 10) {
    createConfettiBurst(
      window.innerWidth / 2,
      window.innerHeight / 2,
      streak * 3
    );
  }
};
```

---

### Task 65: Implement Streak Break Feedback

**Description:** Visual/audio feedback when streak ends

**Implementation:**
```typescript
const onStreakBreak = (lostStreak: number) => {
  if (lostStreak < 3) return; // Only for meaningful streaks

  // Sound - descending
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.35);

  // Visual - show lost streak
  showFloatingText(`-${lostStreak} STREAK`, 'warning');
};
```

---

### Task 66: Implement Score Multiplier Display

**Description:** Show multiplier based on streak

**Implementation:**
```typescript
const getScoreMultiplier = (streak: number): number => {
  if (streak >= 20) return 2.0;
  if (streak >= 15) return 1.75;
  if (streak >= 10) return 1.5;
  if (streak >= 5) return 1.25;
  return 1.0;
};

// In scoring
const basePoints = calculateBasePoints(reactionTimeMs);
const multiplier = getScoreMultiplier(streak);
const finalPoints = Math.floor(basePoints * multiplier);

// Show multiplier in floating score
showFloatingScore(`+${finalPoints}`, multiplier > 1 ? `x${multiplier}` : null);
```

```css
.floating-score .multiplier {
  font-size: 0.7em;
  opacity: 0.8;
  margin-left: 4px;
}
```

---

### Task 67: Implement High Score Notification

**Description:** Celebrate when beating high score

**Implementation:**
```typescript
const [isNewHighScore, setIsNewHighScore] = useState(false);

// Check on score update
useEffect(() => {
  if (score > previousHighScore && !isNewHighScore) {
    setIsNewHighScore(true);

    // Celebration
    showCallout('NEW HIGH SCORE!', '#ffd700');
    createConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 60);
    triggerScreenFlash('#ffd700');

    // Special sound
    createPerfectSound(audioContext);
  }
}, [score, previousHighScore]);
```

---

### Task 68: Implement Floating Score Position Variation

**Description:** Floating scores appear at tap position

**Implementation:**
```typescript
const createFloatingScore = (
  x: number,
  y: number,
  points: number,
  rating: string
) => {
  setFloatingScores((prev) => [
    ...prev,
    {
      id: Date.now(),
      x,
      y,
      points,
      rating: rating.toLowerCase(),
    },
  ]);
};

// Remove after animation
useEffect(() => {
  const timeout = setTimeout(() => {
    setFloatingScores((prev) => prev.slice(1));
  }, 1500);
  return () => clearTimeout(timeout);
}, [floatingScores.length]);
```

---

### Task 69: Implement Best Reaction Time Tracker

**Description:** Track and celebrate best reaction time

**Implementation:**
```typescript
const [bestReactionTime, setBestReactionTime] = useState<number | null>(null);

const onCorrectTap = (reactionTimeMs: number) => {
  if (!bestReactionTime || reactionTimeMs < bestReactionTime) {
    setBestReactionTime(reactionTimeMs);

    // Celebrate new best
    showFloatingText('NEW BEST!', 'success');
  }
};
```

---

### Task 70: Implement Score Pop Effect

**Description:** Score number "pops" on increase

**Implementation:**
```css
.score-value {
  transition: transform 0.1s ease;
}

.score-value.pop {
  animation: score-pop 200ms ease-out;
}

@keyframes score-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); color: #ffd700; }
  100% { transform: scale(1); }
}
```

---

### Task 71: Implement Rating Color Coding

**Description:** Visual color feedback based on rating

**Implementation:**
```typescript
const RATING_COLORS = {
  PERFECT: '#ffd700', // Gold
  GREAT: '#2ecc71',   // Green
  GOOD: '#3498db',    // Blue
  OK: '#9b59b6',      // Purple
  SLOW: '#95a5a6',    // Gray
};

// Apply to floating scores, callouts, etc.
```

---

### Task 72: Implement Session Stats Tracker

**Description:** Track stats for end screen

**Implementation:**
```typescript
interface SessionStats {
  totalTaps: number;
  correctTaps: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  okCount: number;
  slowCount: number;
  wrongTaps: number;
  misses: number;
  averageReactionTime: number;
  bestReactionTime: number;
  maxStreak: number;
}

const [sessionStats, setSessionStats] = useState<SessionStats>({
  totalTaps: 0,
  correctTaps: 0,
  perfectCount: 0,
  greatCount: 0,
  goodCount: 0,
  okCount: 0,
  slowCount: 0,
  wrongTaps: 0,
  misses: 0,
  averageReactionTime: 0,
  bestReactionTime: 0,
  maxStreak: 0,
});
```

---

## Phase 7: Failure & Warning States

> **Goal:** Gentle but clear failure feedback, persistent danger warnings

### Task 73: Implement Last Life Warning State

**Description:** Persistent visual warning when on last life

**Implementation:**
```typescript
const isLastLife = lives === 1;
```

```css
.game-container.last-life {
  animation: last-life-pulse 1s ease-in-out infinite;
}

@keyframes last-life-pulse {
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: rgba(231, 76, 60, 0.5);
  }
}

.last-life-vignette {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at center,
    transparent 50%,
    rgba(231, 76, 60, 0.15) 100%
  );
  animation: danger-vignette-pulse 1s ease-in-out infinite;
}

@keyframes danger-vignette-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

---

### Task 74: Implement Life Loss Animation

**Description:** Heart breaks/fades with animation

**Implementation:**
```typescript
const [losingLife, setLosingLife] = useState<number | null>(null);

const onLoseLife = () => {
  setLosingLife(lives);
  setTimeout(() => setLosingLife(null), 500);
  setLives((prev) => prev - 1);
};
```

```css
.heart-${losingLife}.losing {
  animation: heart-break 500ms ease-out forwards;
}

@keyframes heart-break {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  30% {
    transform: scale(1.3);
    color: #e74c3c;
  }
  100% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
}
```

---

### Task 75: Implement Game Over Sequence

**Description:** Dramatic game over presentation

**Implementation:**
```typescript
const [gameOverPhase, setGameOverPhase] = useState<'shake' | 'fade' | 'display' | null>(null);

const triggerGameOver = () => {
  // Phase 1: Shake
  setGameOverPhase('shake');
  triggerScreenShake(12, 400);
  vibrate(COLOR_REACTION_PATTERNS.gameOver);
  playGameOverSound();

  // Phase 2: Fade
  setTimeout(() => {
    setGameOverPhase('fade');
  }, 400);

  // Phase 3: Display
  setTimeout(() => {
    setGameOverPhase('display');
  }, 800);
};
```

```css
.game-over-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-overlay.fade-phase {
  background: rgba(0, 0, 0, 0);
  animation: fade-to-dark 400ms ease-out forwards;
}

@keyframes fade-to-dark {
  0% { background: rgba(0, 0, 0, 0); }
  100% { background: rgba(0, 0, 0, 0.85); }
}

.game-over-title {
  font-size: 48px;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 0 0 20px #e74c3c;
  animation: game-over-title-enter 500ms ease-out;
}

@keyframes game-over-title-enter {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
```

---

### Task 76: Implement Game Over Stats Display

**Description:** Animated stats reveal on game over

**Implementation:**
```typescript
const GameOverStats: React.FC<{ stats: SessionStats }> = ({ stats }) => {
  const [visibleStats, setVisibleStats] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleStats((prev) => Math.min(prev + 1, 6));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: 'Final Score', value: stats.totalScore },
    { label: 'Best Reaction', value: `${stats.bestReactionTime}ms` },
    { label: 'Max Streak', value: stats.maxStreak },
    { label: 'Perfect Taps', value: stats.perfectCount },
    { label: 'Accuracy', value: `${Math.round((stats.correctTaps / stats.totalTaps) * 100)}%` },
    { label: 'Avg Reaction', value: `${Math.round(stats.averageReactionTime)}ms` },
  ];

  return (
    <div className="game-over-stats">
      {statItems.slice(0, visibleStats).map((stat, i) => (
        <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
};
```

---

### Task 77: Implement Wrong Tap "Floating X"

**Description:** Floating X appears on wrong tap

**Implementation:**
```typescript
const showWrongIndicator = (x: number, y: number) => {
  setFloatingIndicators((prev) => [
    ...prev,
    {
      id: Date.now(),
      x,
      y,
      type: 'wrong',
      text: '✗',
    },
  ]);
};
```

```css
.floating-indicator.wrong {
  color: #e74c3c;
  font-size: 36px;
  font-weight: bold;
  animation: wrong-float 1s ease-out forwards;
}

@keyframes wrong-float {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  30% {
    transform: scale(1.2);
  }
  100% {
    transform: translateY(-40px) scale(1);
    opacity: 0;
  }
}
```

---

### Task 78: Implement Miss "Floating Clock"

**Description:** Clock icon appears when match window expires

**Implementation:**
```typescript
const showMissIndicator = (x: number, y: number) => {
  setFloatingIndicators((prev) => [
    ...prev,
    {
      id: Date.now(),
      x,
      y,
      type: 'miss',
      text: '⏱️',
    },
  ]);
};
```

---

### Task 79: Implement Danger Heartbeat Ambient

**Description:** Low heartbeat sound when on last life

**Implementation:**
```typescript
const dangerHeartbeatRef = useRef<{ stop: () => void } | null>(null);

useEffect(() => {
  if (lives === 1 && !dangerHeartbeatRef.current) {
    // Start heartbeat loop
    const interval = setInterval(() => {
      createHeartbeatSound(audioContext);
    }, 800);

    dangerHeartbeatRef.current = {
      stop: () => clearInterval(interval),
    };
  } else if (lives !== 1 && dangerHeartbeatRef.current) {
    dangerHeartbeatRef.current.stop();
    dangerHeartbeatRef.current = null;
  }

  return () => {
    if (dangerHeartbeatRef.current) {
      dangerHeartbeatRef.current.stop();
    }
  };
}, [lives]);
```

---

### Task 80: Implement "Play Again" Button Animation

**Description:** Attractive play again button with bounce

**Implementation:**
```css
.play-again-button {
  padding: 16px 48px;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  animation: play-again-enter 500ms ease-out;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.play-again-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
}

.play-again-button:active {
  transform: scale(0.95);
}

@keyframes play-again-enter {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

### Task 81: Implement Continue Prompt Delay

**Description:** Brief delay before showing play again to prevent accidental tap

**Implementation:**
```typescript
const [showPlayAgain, setShowPlayAgain] = useState(false);

useEffect(() => {
  if (gameOverPhase === 'display') {
    const timeout = setTimeout(() => {
      setShowPlayAgain(true);
    }, 1500); // 1.5s delay
    return () => clearTimeout(timeout);
  }
}, [gameOverPhase]);
```

---

### Task 82: Implement Retry Animation

**Description:** Smooth transition from game over to new game

**Implementation:**
```typescript
const restartGame = () => {
  // Fade out game over
  setGameOverPhase('exit');

  setTimeout(() => {
    // Reset all state
    resetGameState();
    setGameOverPhase(null);

    // Start with flash
    triggerScreenFlash('#2ecc71');
  }, 300);
};
```

```css
.game-over-overlay.exit-phase {
  animation: game-over-exit 300ms ease-in forwards;
}

@keyframes game-over-exit {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

---

## Phase 8: Near-Miss & Close Call System

> **Goal:** Detect and provide feedback for near-miss situations

### Task 83: Implement Near-Miss Detection

**Description:** Detect taps just after window expires

**Implementation:**
```typescript
const NEAR_MISS_THRESHOLD_MS = 200; // Taps within 200ms after expiry

const handleTapAfterWindowExpired = (msAfterExpiry: number) => {
  if (msAfterExpiry <= NEAR_MISS_THRESHOLD_MS) {
    // Near miss!
    triggerNearMissFeedback(msAfterExpiry);
  } else {
    // Regular wrong tap
    triggerWrongTapFeedback();
  }
};

// In handleTap
const handleTap = () => {
  if (wasMatchWindow && !isMatchWindow) {
    const msAfterExpiry = performance.now() - matchWindowEndTime;
    handleTapAfterWindowExpired(msAfterExpiry);
    return;
  }
  // ... rest of tap handling
};
```

---

### Task 84: Implement "TOO SLOW!" Callout

**Description:** Show "TOO SLOW!" with timing info

**Implementation:**
```typescript
const triggerNearMissFeedback = (msLate: number) => {
  // Sound - sympathetic, not harsh
  createTooSlowSound(audioContext);

  // Haptic - different from wrong
  vibrate([15, 50, 10]);

  // Visual - show how late they were
  showCallout(`TOO SLOW!`, '#f39c12');
  showFloatingText(`${Math.round(msLate)}ms late`, 'warning');
};
```

---

### Task 85: Implement Timing Bar Visualization

**Description:** Show how close the tap was to the window

**Implementation:**
```typescript
interface TimingFeedback {
  msLate: number;
  visible: boolean;
}

const [timingFeedback, setTimingFeedback] = useState<TimingFeedback | null>(null);

const showTimingFeedback = (msLate: number) => {
  setTimingFeedback({ msLate, visible: true });
  setTimeout(() => setTimingFeedback(null), 2000);
};
```

```css
.timing-feedback {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  animation: timing-feedback-enter 2s ease-out forwards;
}

.timing-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.timing-marker {
  position: absolute;
  width: 4px;
  height: 16px;
  top: -4px;
  background: #e74c3c;
  border-radius: 2px;
  /* Position based on how late (0-200ms maps to 0-100%) */
  left: calc(var(--late-percent) * 1%);
}

.timing-label {
  text-align: center;
  font-size: 12px;
  color: #f39c12;
  margin-top: 4px;
}

@keyframes timing-feedback-enter {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  15% { opacity: 1; transform: translateX(-50%) translateY(0); }
  85% { opacity: 1; }
  100% { opacity: 0; }
}
```

---

### Task 86: Implement Encouraging Near-Miss Messages

**Description:** Rotating encouraging messages for near-misses

**Implementation:**
```typescript
const NEAR_MISS_MESSAGES = [
  'So close!',
  'Almost!',
  'Just missed it!',
  'Keep trying!',
  'Nearly there!',
];

const getRandomNearMissMessage = (): string => {
  return NEAR_MISS_MESSAGES[Math.floor(Math.random() * NEAR_MISS_MESSAGES.length)];
};
```

---

### Task 87: Implement Close Call Sound

**Description:** Distinct sound for near-miss (sympathetic)

**Implementation:**
```typescript
// Already created in Task 26 (createTooSlowSound)
// This task ensures it's integrated properly

const onNearMiss = (msLate: number) => {
  createTooSlowSound(audioContext);
};
```

---

### Task 88: Implement Visual "Almost" Effect

**Description:** Ring briefly shows where the window ended

**Implementation:**
```css
.countdown-ring.expired-recent {
  animation: ring-expire-flash 500ms ease-out;
}

@keyframes ring-expire-flash {
  0% {
    stroke: #e74c3c;
    stroke-width: 6;
    opacity: 1;
  }
  100% {
    stroke: #e74c3c;
    stroke-width: 2;
    opacity: 0;
  }
}
```

---

### Task 89: Implement Near-Miss Haptic

**Description:** Distinct haptic for near-miss

**Implementation:**
```typescript
// In patterns.ts
nearMiss: [15, 50, 10], // Softer than wrong, acknowledges attempt

// Usage
const onNearMiss = () => {
  vibrate(COLOR_REACTION_PATTERNS.nearMiss);
};
```

---

### Task 90: Implement Miss vs Near-Miss Differentiation

**Description:** Clear visual distinction between miss types

**Implementation:**
```typescript
// Miss (no tap at all during window)
const onMatchWindowExpire = () => {
  showFloatingText('MISSED!', 'error');
  vibrate(COLOR_REACTION_PATTERNS.miss);
  createMissSound(audioContext);
};

// Near-miss (tapped just too late)
const onNearMiss = (msLate: number) => {
  showFloatingText(`TOO SLOW! (${msLate}ms)`, 'warning');
  vibrate(COLOR_REACTION_PATTERNS.nearMiss);
  createTooSlowSound(audioContext);
};
```

---

## Phase 9: Final Polish & Accessibility

> **Goal:** Final polish, performance optimization, and accessibility

### Task 91: Add Color Expansion (Strawberry & Kiwi)

**Description:** Add two new colors to the game

**Implementation:**
```typescript
export const COLORS = [
  { name: 'Orange', hex: '#FF6B00', emoji: '🍊', particle: '#FFA500' },
  { name: 'Lime', hex: '#32CD32', emoji: '🍋', particle: '#90EE90' },
  { name: 'Grape', hex: '#8B5CF6', emoji: '🍇', particle: '#DDA0DD' },
  { name: 'Berry', hex: '#3B82F6', emoji: '🫐', particle: '#87CEEB' },
  { name: 'Strawberry', hex: '#FF4757', emoji: '🍓', particle: '#FF6B81' },
  { name: 'Kiwi', hex: '#2ED573', emoji: '🥝', particle: '#7BED9F' },
];
```

---

### Task 92: Implement Settings Toggles

**Description:** Add accessibility toggles

**Implementation:**
```typescript
interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  screenShakeEnabled: boolean;
  flashEffectsEnabled: boolean;
  reducedMotion: boolean;
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  screenShakeEnabled: true,
  flashEffectsEnabled: true,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
};
```

---

### Task 93: Implement Reduced Motion Mode

**Description:** Respect system reduced motion preference

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  .color-circle,
  .floating-score,
  .callout,
  .particle {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  .countdown-ring {
    animation: none !important;
  }
}
```

---

### Task 94: Implement Performance Optimization

**Description:** Optimize particle systems and effects

**Implementation:**
```typescript
// Limit particle count
const MAX_PARTICLES = 100;

const createParticleBurst = (...) => {
  setParticles((prev) => {
    const newParticles = [...prev, ...newParticles];
    // Keep only most recent particles
    return newParticles.slice(-MAX_PARTICLES);
  });
};

// Use requestAnimationFrame for particle updates
useEffect(() => {
  let animationId: number;

  const updateParticles = () => {
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // Gravity
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0)
    );
    animationId = requestAnimationFrame(updateParticles);
  };

  animationId = requestAnimationFrame(updateParticles);
  return () => cancelAnimationFrame(animationId);
}, []);
```

---

### Task 95: Implement Touch Feedback Enhancement

**Description:** Visual feedback at touch point

**Implementation:**
```typescript
const [touchRipples, setTouchRipples] = useState<Array<{id: number; x: number; y: number}>>([]);

const onTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  setTouchRipples((prev) => [
    ...prev,
    { id: Date.now(), x: touch.clientX, y: touch.clientY },
  ]);
};
```

```css
.touch-ripple {
  position: fixed;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  animation: ripple-expand 400ms ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
```

---

### Task 96: Implement Start Game Animation

**Description:** Smooth transition from idle to playing

**Implementation:**
```typescript
const startGame = () => {
  // Countdown animation
  setStartCountdown(3);

  const countdown = setInterval(() => {
    setStartCountdown((prev) => {
      if (prev === 1) {
        clearInterval(countdown);
        setStatus('playing');
        return null;
      }
      return prev - 1;
    });
  }, 800);
};
```

```css
.start-countdown {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 72px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 30px #ffd700;
  animation: countdown-number 800ms ease-out;
}

@keyframes countdown-number {
  0% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}
```

---

### Task 97: Implement Leaderboard Integration Polish

**Description:** Smooth leaderboard submission with feedback

**Implementation:**
```typescript
const submitScore = async () => {
  setSubmitting(true);

  try {
    await leaderboard.submitScore({
      score,
      bestReactionTime,
      maxStreak,
    });

    // Success feedback
    showToast('Score submitted!', 'success');
    vibrate([10, 30, 10]);
  } catch (error) {
    showToast('Failed to submit', 'error');
  } finally {
    setSubmitting(false);
  }
};
```

---

### Task 98: Implement Tutorial/First Play Hints

**Description:** Show hints for first-time players

**Implementation:**
```typescript
const [showTutorial, setShowTutorial] = useState(!localStorage.getItem('colorReactionPlayed'));

// Show tutorial overlay on first play
{showTutorial && (
  <div className="tutorial-overlay">
    <div className="tutorial-content">
      <h2>How to Play</h2>
      <p>Watch the two colors</p>
      <p>TAP when they MATCH!</p>
      <p>Faster = More points</p>
      <button onClick={() => {
        setShowTutorial(false);
        localStorage.setItem('colorReactionPlayed', 'true');
      }}>
        Got it!
      </button>
    </div>
  </div>
)}
```

---

### Task 99: Implement Sound Preloading

**Description:** Preload all sounds on game load

**Implementation:**
```typescript
const preloadSounds = () => {
  // Create audio context on first user interaction
  const initAudio = () => {
    audioContextRef.current = new AudioContext();
    document.removeEventListener('touchstart', initAudio);
    document.removeEventListener('click', initAudio);
  };

  document.addEventListener('touchstart', initAudio, { once: true });
  document.addEventListener('click', initAudio, { once: true });
};

useEffect(() => {
  preloadSounds();
}, []);
```

---

### Task 100: Final Integration Test

**Description:** Verify all systems work together

**Implementation Checklist:**
- [ ] All sounds play correctly
- [ ] All haptics trigger correctly
- [ ] All visual effects render properly
- [ ] No performance issues on mobile
- [ ] Accessibility toggles work
- [ ] Game over flow is smooth
- [ ] Leaderboard submission works
- [ ] No memory leaks from particles/effects

---

## Phase 10: Fever Mode & Advanced Combos

> **Goal:** Create an epic high-combo state that makes long runs feel legendary

### Task 101: Define Fever Mode State

**Description:** Create fever mode state and thresholds

**Implementation:**
```typescript
interface FeverState {
  active: boolean;
  startTime: number;
  multiplier: number;
  intensity: number; // 0-1, grows with continued success
}

const FEVER_CONFIG = {
  activationStreak: 15,      // Streak needed to enter fever
  deactivationMiss: true,    // Exit on any miss
  scoreMultiplier: 2,        // Double points during fever
  minDuration: 5000,         // Minimum 5s of fever
};

const [feverState, setFeverState] = useState<FeverState>({
  active: false,
  startTime: 0,
  multiplier: 1,
  intensity: 0,
});

// Check for fever activation
const checkFeverActivation = (newStreak: number) => {
  if (!feverState.active && newStreak >= FEVER_CONFIG.activationStreak) {
    activateFeverMode();
  }
};
```

---

### Task 102: Implement Fever Mode Activation

**Description:** Dramatic entry into fever mode

**Implementation:**
```typescript
const activateFeverMode = () => {
  setFeverState({
    active: true,
    startTime: performance.now(),
    multiplier: FEVER_CONFIG.scoreMultiplier,
    intensity: 0.5,
  });

  // Activation effects
  showEpicCallout('🔥 FEVER MODE! 🔥');
  triggerScreenShake(200);
  triggerConfetti();
  createFeverActivationSound(audioContext);
  vibrate([20, 30, 15, 30, 12, 30, 10, 30, 8]);

  // Flash gold
  triggerScreenFlash('#ffd700', 0.4);
};

const createFeverActivationSound = (audioContext: AudioContext) => {
  // Dramatic ascending fanfare
  const notes = [523, 659, 784, 880, 1047]; // C5 to C6
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    const delay = i * 0.08;
    gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + delay + 0.3);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + delay);
    osc.stop(audioContext.currentTime + delay + 0.3);
  });
};
```

---

### Task 103: Implement Fever Mode Visual State

**Description:** Distinct visual appearance during fever

**Implementation:**
```css
.game-container.fever-mode {
  animation: fever-background 1s ease-in-out infinite;
}

.game-container.fever-mode::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(255, 100, 0, 0.1) 0%,
    rgba(255, 50, 0, 0.2) 100%
  );
  animation: fever-pulse 500ms ease-in-out infinite;
  pointer-events: none;
}

@keyframes fever-background {
  0%, 100% {
    background-color: #1a0505;
  }
  50% {
    background-color: #2a0808;
  }
}

@keyframes fever-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Fever mode particles - fire embers */
.fever-ember {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ff6b00;
  border-radius: 50%;
  animation: ember-rise 2s linear infinite;
  box-shadow: 0 0 10px #ff6b00;
}

@keyframes ember-rise {
  0% {
    transform: translateY(100vh) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-20vh) scale(0);
    opacity: 0;
  }
}
```

```typescript
// Generate ember particles during fever
useEffect(() => {
  if (!feverState.active) return;

  const interval = setInterval(() => {
    const ember = document.createElement('div');
    ember.className = 'fever-ember';
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.animationDuration = `${1 + Math.random() * 2}s`;
    document.querySelector('.game-container')?.appendChild(ember);

    setTimeout(() => ember.remove(), 3000);
  }, 100);

  return () => clearInterval(interval);
}, [feverState.active]);
```

---

### Task 104: Implement Fever Mode Score Display

**Description:** Show fever multiplier prominently

**Implementation:**
```typescript
// In render
{feverState.active && (
  <div className="fever-multiplier">
    <span className="multiplier-value">x{feverState.multiplier}</span>
    <span className="fever-label">FEVER!</span>
  </div>
)}
```

```css
.fever-multiplier {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: multiplier-pulse 300ms ease-in-out infinite;
}

.multiplier-value {
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow:
    0 0 20px #ff6b00,
    0 0 40px #ff4500,
    0 0 60px #ff0000;
  display: block;
}

.fever-label {
  font-size: 18px;
  color: #ff6b00;
  text-transform: uppercase;
  letter-spacing: 4px;
}

@keyframes multiplier-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}
```

---

### Task 105: Implement Fever Mode Audio Loop

**Description:** Distinct audio during fever mode

**Implementation:**
```typescript
const feverAudioRef = useRef<OscillatorNode | null>(null);

const startFeverAudio = (audioContext: AudioContext) => {
  // Low driving bass pulse
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();

  osc.type = 'sine';
  osc.frequency.value = 80;

  lfo.frequency.value = 2; // 120 BPM pulse
  lfoGain.gain.value = 0.15;

  lfo.connect(lfoGain).connect(gain.gain);
  osc.connect(gain).connect(audioContext.destination);

  gain.gain.value = 0.2;

  lfo.start();
  osc.start();

  feverAudioRef.current = osc;
};

const stopFeverAudio = () => {
  if (feverAudioRef.current) {
    feverAudioRef.current.stop();
    feverAudioRef.current = null;
  }
};
```

---

### Task 106: Implement Fever Mode Deactivation

**Description:** Exit fever mode on miss/wrong tap

**Implementation:**
```typescript
const deactivateFeverMode = () => {
  if (!feverState.active) return;

  setFeverState({
    active: false,
    startTime: 0,
    multiplier: 1,
    intensity: 0,
  });

  stopFeverAudio();
  showEpicCallout('FEVER ENDED');

  // Subtle sound for fever end
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.frequency.setValueAtTime(400, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);
};

// Call in wrong tap / miss handlers
const onWrongTap = () => {
  deactivateFeverMode(); // Exit fever on any failure
  // ... rest of wrong tap logic
};
```

---

### Task 107: Implement Fever Mode Intensity Growth

**Description:** Fever gets more intense with continued success

**Implementation:**
```typescript
// On each correct tap during fever
const onCorrectTapDuringFever = () => {
  setFeverState(prev => ({
    ...prev,
    intensity: Math.min(1, prev.intensity + 0.05), // Grows 5% per hit
  }));
};

// Intensity affects visual effects
const getFeverEffectScale = (intensity: number): number => {
  return 1 + intensity * 0.5; // 1x to 1.5x scale for effects
};

// Use in particle bursts, shake, etc.
const particleCount = Math.floor(20 * getFeverEffectScale(feverState.intensity));
const shakeIntensity = 100 * getFeverEffectScale(feverState.intensity);
```

---

## Phase 11: Camera & Advanced Visual Effects

> **Goal:** Add professional camera effects missing from core juice

### Task 108: Implement Camera Zoom Pulse on Tap

**Description:** Brief zoom to 105% on correct tap, ease back

**Implementation:**
```typescript
const [cameraZoom, setCameraZoom] = useState(1);

const triggerCameraZoom = (intensity: number = 1.05, duration: number = 200) => {
  setCameraZoom(intensity);
  setTimeout(() => setCameraZoom(1), duration);
};

// In correct tap handler
const onCorrectTap = (rating: string) => {
  const zoomIntensity = rating === 'PERFECT' ? 1.08 :
                        rating === 'GREAT' ? 1.06 : 1.04;
  triggerCameraZoom(zoomIntensity, 200);
};
```

```css
.game-container {
  transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.game-container.zoom-active {
  transform-origin: center center;
}
```

```typescript
// Apply in render
<div
  className="game-container"
  style={{ transform: `scale(${cameraZoom})` }}
>
```

---

### Task 109: Implement Touch Point Ripple

**Description:** Ripple effect at actual touch location

**Implementation:**
```typescript
interface TouchRipple {
  id: string;
  x: number;
  y: number;
  color: string;
}

const [touchRipples, setTouchRipples] = useState<TouchRipple[]>([]);

const createTouchRipple = (e: TouchEvent | MouseEvent, color: string) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
  const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

  const id = `ripple-${Date.now()}`;
  setTouchRipples(prev => [...prev, { id, x, y, color }]);

  setTimeout(() => {
    setTouchRipples(prev => prev.filter(r => r.id !== id));
  }, 600);
};
```

```css
.touch-ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-expand 600ms ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  0% {
    width: 20px;
    height: 20px;
    opacity: 0.6;
  }
  100% {
    width: 150px;
    height: 150px;
    opacity: 0;
  }
}
```

---

### Task 110: Implement Hit-Stop on All Correct Taps

**Description:** Brief frame freeze scaled by rating

**Implementation:**
```typescript
const HIT_STOP_DURATIONS = {
  PERFECT: 60,  // ms
  GREAT: 40,
  GOOD: 25,
  OK: 15,
  SLOW: 0,
};

const [hitStop, setHitStop] = useState(false);

const triggerHitStop = (rating: string) => {
  const duration = HIT_STOP_DURATIONS[rating] || 0;
  if (duration === 0) return;

  setHitStop(true);
  setTimeout(() => setHitStop(false), duration);
};

// Pause game updates during hit stop
useEffect(() => {
  if (hitStop) {
    // Pause all animations temporarily
    document.body.classList.add('hit-stop-active');
  } else {
    document.body.classList.remove('hit-stop-active');
  }
}, [hitStop]);
```

```css
.hit-stop-active * {
  animation-play-state: paused !important;
}

.hit-stop-active .game-container {
  filter: brightness(1.2) contrast(1.1);
}
```

---

### Task 111: Implement Signature Match Sound

**Description:** Distinctive, memorable match sound

**Implementation:**
```typescript
export const createSignatureMatchSound = (audioContext: AudioContext) => {
  // Two-note ascending chime - THE signature sound
  // Think "ding-DING!" - instantly recognizable

  const note1 = audioContext.createOscillator();
  const note2 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  const gain2 = audioContext.createGain();

  // First note - lower
  note1.type = 'sine';
  note1.frequency.value = 880; // A5
  gain1.gain.setValueAtTime(0.4, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.1);

  // Second note - higher, slightly delayed
  note2.type = 'sine';
  note2.frequency.value = 1318; // E6
  gain2.gain.setValueAtTime(0, audioContext.currentTime);
  gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

  // Add subtle shimmer
  const shimmer = audioContext.createOscillator();
  const shimmerGain = audioContext.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.value = 2636; // E7 (octave up)
  shimmerGain.gain.setValueAtTime(0.1, audioContext.currentTime + 0.08);
  shimmerGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  note1.connect(gain1).connect(audioContext.destination);
  note2.connect(gain2).connect(audioContext.destination);
  shimmer.connect(shimmerGain).connect(audioContext.destination);

  note1.start();
  note2.start(audioContext.currentTime + 0.08);
  shimmer.start(audioContext.currentTime + 0.08);

  note1.stop(audioContext.currentTime + 0.15);
  note2.stop(audioContext.currentTime + 0.3);
  shimmer.stop(audioContext.currentTime + 0.25);
};
```

---

## Phase 12: Viral & Share System

> **Goal:** Enable viral spread through sharing and challenges

### Task 112: Implement Share Stats Image Generator

**Description:** Generate shareable image with game stats

**Implementation:**
```typescript
const generateShareImage = async (stats: GameStats): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Game title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🍊 COLOR REACTION', 300, 50);

  // Score (big and prominent)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(stats.score.toLocaleString(), 300, 140);
  ctx.font = '20px Arial';
  ctx.fillText('POINTS', 300, 170);

  // Stats grid
  const statsY = 220;
  const statItems = [
    { label: 'Best Streak', value: stats.maxStreak.toString(), emoji: '🔥' },
    { label: 'Best Time', value: `${stats.bestReactionTime}ms`, emoji: '⚡' },
    { label: 'Perfects', value: stats.perfectCount.toString(), emoji: '🌟' },
  ];

  statItems.forEach((stat, i) => {
    const x = 100 + i * 200;
    ctx.fillStyle = '#888888';
    ctx.font = '16px Arial';
    ctx.fillText(stat.label, x, statsY);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`${stat.emoji} ${stat.value}`, x, statsY + 35);
  });

  // Wojak.ink branding
  ctx.fillStyle = '#666666';
  ctx.font = '14px Arial';
  ctx.fillText('Play at wojak.ink', 300, 370);

  return canvas.toDataURL('image/png');
};
```

---

### Task 113: Implement Share Button UI

**Description:** Share button that appears after game over

**Implementation:**
```typescript
const [shareImage, setShareImage] = useState<string | null>(null);

const handleShare = async () => {
  const stats = {
    score: gameState.score,
    maxStreak: maxStreakRef.current,
    bestReactionTime: gameState.bestReactionTime,
    perfectCount: perfectCountRef.current,
  };

  const imageUrl = await generateShareImage(stats);
  setShareImage(imageUrl);

  // Try native share API first
  if (navigator.share) {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], 'color-reaction-score.png', { type: 'image/png' });
      await navigator.share({
        title: `I scored ${stats.score} in Color Reaction! 🍊`,
        text: `Best streak: ${stats.maxStreak} 🔥 | Best time: ${stats.bestReactionTime}ms ⚡`,
        files: [file],
      });
    } catch (e) {
      // Fall back to download
      downloadShareImage(imageUrl);
    }
  } else {
    downloadShareImage(imageUrl);
  }
};

const downloadShareImage = (dataUrl: string) => {
  const link = document.createElement('a');
  link.download = 'color-reaction-score.png';
  link.href = dataUrl;
  link.click();
};
```

```css
.share-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  animation: share-button-enter 0.5s ease-out;
}

.share-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

@keyframes share-button-enter {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### Task 114: Implement Challenge Link Generator

**Description:** Create shareable challenge links

**Implementation:**
```typescript
interface Challenge {
  targetScore: number;
  creatorName: string;
  createdAt: number;
}

const generateChallengeLink = (score: number, name: string): string => {
  const challenge: Challenge = {
    targetScore: score,
    creatorName: name,
    createdAt: Date.now(),
  };

  // Encode challenge data
  const encoded = btoa(JSON.stringify(challenge));
  return `${window.location.origin}/games/color-reaction?challenge=${encoded}`;
};

// Check for challenge on load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challengeParam = params.get('challenge');

  if (challengeParam) {
    try {
      const challenge: Challenge = JSON.parse(atob(challengeParam));
      setActiveChallenge(challenge);
      showChallengeModal(challenge);
    } catch (e) {
      console.error('Invalid challenge link');
    }
  }
}, []);
```

---

### Task 115: Implement Challenge Mode UI

**Description:** Display challenge target during gameplay

**Implementation:**
```typescript
const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

// In render
{activeChallenge && (
  <div className="challenge-banner">
    <span className="challenge-target">
      Beat {activeChallenge.creatorName}'s {activeChallenge.targetScore} points!
    </span>
    <div className="challenge-progress">
      <div
        className="challenge-fill"
        style={{
          width: `${Math.min(100, (gameState.score / activeChallenge.targetScore) * 100)}%`
        }}
      />
    </div>
  </div>
)}
```

```css
.challenge-banner {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #ffd700;
  border-radius: 10px;
}

.challenge-target {
  color: #ffd700;
  font-size: 14px;
  font-weight: bold;
}

.challenge-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.challenge-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff6b00);
  transition: width 0.3s ease;
}
```

---

### Task 116: Implement Challenge Complete Celebration

**Description:** Special celebration when beating a challenge

**Implementation:**
```typescript
useEffect(() => {
  if (activeChallenge && gameState.score > activeChallenge.targetScore) {
    // Only trigger once
    if (!challengeBeatenRef.current) {
      challengeBeatenRef.current = true;
      celebrateChallengeWin();
    }
  }
}, [gameState.score, activeChallenge]);

const celebrateChallengeWin = () => {
  showEpicCallout('🎉 CHALLENGE BEATEN! 🎉');
  triggerConfetti();
  triggerScreenShake(300);

  // Victory fanfare
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playNote(audioContext, freq, 0, 0.3, 0.4);
    }, i * 150);
  });

  // Extra confetti waves
  setTimeout(() => triggerConfetti(), 500);
  setTimeout(() => triggerConfetti(), 1000);
};
```

---

### Task 117: Implement Auto-Highlight Clip (Advanced)

**Description:** Automatically capture best moments for sharing

**Implementation:**
```typescript
interface GameMoment {
  timestamp: number;
  type: 'perfect' | 'streak' | 'fever';
  value: number; // reaction time or streak count
}

const gameMomentsRef = useRef<GameMoment[]>([]);

// Track notable moments
const trackMoment = (type: GameMoment['type'], value: number) => {
  gameMomentsRef.current.push({
    timestamp: performance.now() - gameStartTimeRef.current,
    type,
    value,
  });
};

// On PERFECT
trackMoment('perfect', reactionTime);

// On streak milestone
trackMoment('streak', newStreak);

// On fever activation
trackMoment('fever', feverState.intensity);

// Generate highlight summary for share text
const getHighlightText = (): string => {
  const moments = gameMomentsRef.current;
  const perfects = moments.filter(m => m.type === 'perfect').length;
  const bestReaction = Math.min(...moments.filter(m => m.type === 'perfect').map(m => m.value));
  const maxStreak = Math.max(...moments.filter(m => m.type === 'streak').map(m => m.value), 0);

  return `🍊 ${gameState.score} pts | ⚡ ${bestReaction}ms best | 🔥 ${maxStreak} streak`;
};
```

---

## Integration Summary

### Files to Create/Modify

| File | Changes |
|------|---------|
| `ColorReaction/index.tsx` | Main game component with all juice |
| `ColorReaction/config.ts` | Constants, colors, timing values |
| `ColorReaction/ColorReaction.game.css` | All CSS animations and styles |
| `hooks/haptics/patterns.ts` | Color Reaction haptic patterns |
| `hooks/useGameSounds.ts` | Color Reaction sound functions |
| `hooks/useColorReactionSounds.ts` | Game-specific sound hook (optional) |

### Total Tasks: 117

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 12 | Haptic Foundation |
| 2 | 16 | Sound System Overhaul |
| 3 | 10 | Countdown Urgency System |
| 4 | 10 | Perfect Reaction Celebration |
| 5 | 14 | Visual Juice Enhancement |
| 6 | 10 | Streak & Scoring Polish |
| 7 | 10 | Failure & Warning States |
| 8 | 8 | Near-Miss & Close Call System |
| 9 | 10 | Final Polish & Accessibility |
| 10 | 7 | Fever Mode & Advanced Combos |
| 11 | 4 | Camera & Advanced Visual Effects |
| 12 | 6 | Viral & Share System |

---

## Key Research Sources

- [Game Juice - Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html)
- [Juicing Up Your Video Games - LinkedIn](https://www.linkedin.com/pulse/juicing-up-your-video-games-art-adding-satisfying-iman-irajdoost-wmwbe)
- [Game Feel Beginner's Guide](https://gamedesignskills.com/game-design/game-feel/)
- [Hitstop/Freeze Frame Analysis - CritPoints](https://critpoints.net/2017/05/17/hitstophitfreezehitlaghitpausehitshit/)
- [Time for a Timer - Game Developer](https://www.gamedeveloper.com/design/time-for-a-timer---effective-use-of-timers-in-game-design)
- [Slow-Mo Tips and Tricks - Game Developer](https://www.gamedeveloper.com/design/slow-mo-tips-and-tricks)
- [Visual Feedback in Game Design - Brave Zebra](https://www.bravezebra.com/blog/visual-feedback-game-design/)

---

*Reference: `docs/game-juice-playbook.md` for universal principles*
*This guide will add new learnings to the playbook: Reaction-Time Feedback Systems, Time Dilation Effects*
