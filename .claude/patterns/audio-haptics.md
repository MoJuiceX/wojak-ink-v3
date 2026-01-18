# Audio & Haptics Patterns

<!-- Last updated: 2026-01-18 -->
<!-- Systems: SoundManager (Howler.js), HapticManager -->

## System Architecture

```
src/systems/
├── audio/
│   ├── SoundManager.ts      # Howler.js wrapper, pooling, pitch variation
│   └── sounds.ts            # Synthesized sounds (Web Audio API)
└── haptics/
    ├── HapticManager.ts     # Vibration API wrapper
    ├── useGameHaptics.ts    # Game-specific haptic hook
    └── patterns.ts          # Haptic pattern definitions

src/hooks/
├── useGameSounds.ts         # Game sound effects hook
└── useHowlerSounds.ts       # Low-level Howler hook

src/contexts/
└── AudioContext.tsx         # Background music, global mute
```

---

## Using Game Sounds

```typescript
import { useGameSounds } from '@/hooks/useGameSounds';

const MyGame = () => {
  const {
    soundEnabled,      // boolean - respect this before playing
    toggleSound,       // function to toggle
    playBlockLand,     // Score/collect sound
    playPerfectBonus,  // Perfect action sound
    playCombo,         // Combo multiplier sound
    playGameOver,      // Death/failure sound
    playLevelUp,       // Level advancement
  } = useGameSounds();

  const handleScore = () => {
    if (soundEnabled) {
      playBlockLand();
    }
  };
};
```

---

## Using Game Haptics

```typescript
import { useGameHaptics } from '@/systems/haptics';

const MyGame = () => {
  const {
    hapticScore,      // Light tap on score
    hapticCombo,      // Medium pulse on combo
    hapticHighScore,  // Strong vibration on new record
    hapticGameOver,   // Long rumble on death
  } = useGameHaptics();

  const handleScore = () => {
    hapticScore();  // No need to check enabled - handled internally
  };
};
```

---

## Pitch Variation for Satisfying Sounds

The SoundManager applies random pitch variation to prevent repetitive sounds:

```typescript
// In SoundManager.ts
instance.audio.playbackRate = pitchShift * (1 + (Math.random() * 2 - 1) * pitchVariation);

// Parameters:
// pitchVariation: 0.15-0.2 (±15-20% random variation)
// pitchShift: 1.1 for positive sounds, 0.95 for negative sounds
```

**Why this matters**: Without variation, collecting 10 coins sounds mechanical. With ±15% pitch variation, each coin sounds slightly different, creating a more satisfying experience.

---

## Sound Effect Categories

| Sound | Usage | Pitch Shift |
|-------|-------|-------------|
| `playBlockLand` | Score, collect, place | 1.1 (bright) |
| `playPerfectBonus` | Perfect timing, bonus | 1.2 (brighter) |
| `playCombo` | Combo multiplier | 1.15 |
| `playLevelUp` | Level advancement | 1.0 |
| `playGameOver` | Death, failure | 0.95 (darker) |

---

## Haptic Patterns

| Pattern | Duration | Intensity | Use Case |
|---------|----------|-----------|----------|
| `hapticScore` | 10ms | Light | Every score |
| `hapticCombo` | 25ms | Medium | Combo activation |
| `hapticHighScore` | 100ms | Strong | New record |
| `hapticGameOver` | 200ms | Strong | Game over |

---

## Background Music System

```typescript
import { useAudio } from '@/contexts/AudioContext';

const MyComponent = () => {
  const {
    isPlaying,
    currentTrack,
    play,
    pause,
    toggle,
    setVolume,
  } = useAudio();

  // Background music auto-pauses during games
  // and resumes when returning to menu
};
```

---

## Best Practices

### Always Check soundEnabled
```typescript
// CORRECT
if (soundEnabled) playBlockLand();

// WRONG - will play even when muted
playBlockLand();
```

### Use Appropriate Sound for Context
```typescript
// Score events
if (soundEnabled) playBlockLand();
hapticScore();

// Combo events
if (soundEnabled) playCombo();
hapticCombo();

// Game over
if (soundEnabled) playGameOver();
hapticGameOver();
```

### Don't Spam Sounds
```typescript
// Use debouncing for rapid events
const lastSoundRef = useRef(0);
const SOUND_COOLDOWN = 50; // ms

const handleRapidEvent = () => {
  const now = Date.now();
  if (now - lastSoundRef.current > SOUND_COOLDOWN) {
    if (soundEnabled) playBlockLand();
    lastSoundRef.current = now;
  }
};
```

---

## Adding New Sounds

1. Add sound to `src/systems/audio/sounds.ts` (synthesized) or assets folder (MP3)
2. Register in SoundManager
3. Add play function to `useGameSounds` hook
4. Document in this file

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Sound not playing | Check `soundEnabled` state |
| Sound too loud/quiet | Adjust in SoundManager config |
| Haptics not working | Check device supports Vibration API |
| Sound cuts off | Increase pool size in SoundManager |
| Sounds feel repetitive | Increase pitch variation |
