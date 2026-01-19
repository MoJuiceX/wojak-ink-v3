# Orange Juggle Juice Implementation Guide

> Comprehensive juice enhancements for the Orange Juggle game featuring an orangutan juggling oranges, with powerups (banana, golden orange, rum) and enemies (camel).

**Reference:** `docs/game-juice-playbook.md` for universal principles
**Checklist:** `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md` for progress tracking

---

## Game Context

- **Paddle:** Orangutan character (150px wide, 50px collision radius) with animated arm swings
- **Primary Object:** Oranges to juggle (10 points each)
- **Powerups:**
  - **Golden Orange** — 5x points
  - **Banana** — Clears rum debuff + 1.5x score multiplier for 5 seconds
  - **Rum** — Negative effect: slows paddle, reverses controls
- **Enemy:** Camel — Drops from sky, causes game restart on collision
- **Combo System:** 2.5 second decay, max 10x multiplier
- **Levels:** 5 levels with increasing difficulty (more oranges, obstacles)
- **Visual Style:** High intensity with trails, screen shake, combo explosions

---

## Table of Contents

1. [Phase 1: Sound Foundation](#phase-1-sound-foundation) — Enhancements 1-14
2. [Phase 2: Haptic Layer](#phase-2-haptic-layer) — Enhancements 15-24
3. [Phase 3: Core Visual Juice](#phase-3-core-visual-juice) — Enhancements 25-34
4. [Phase 4: Powerup & Collectible Feedback](#phase-4-powerup--collectible-feedback) — Enhancements 35-42
5. [Phase 5: Enemy & Hazard Feedback](#phase-5-enemy--hazard-feedback) — Enhancements 43-48
6. [Phase 6: Combo & Scoring System](#phase-6-combo--scoring-system) — Enhancements 49-55
7. [Phase 7: Anticipation & Polish](#phase-7-anticipation--polish) — Enhancements 56-62

---

## Phase 1: Sound Foundation

### Enhancement 1: Orange Juggle Hit Sound

**Description:** Satisfying "boing" or "thwap" when orangutan hits an orange

**Implementation:**
```typescript
// In useGameSounds.ts
export const createOrangeHitSound = (audioContext: AudioContext, hitPosition: number = 0.5) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Rubbery boing with pitch variation based on hit position
  oscillator.type = 'sine';
  const basePitch = 280;
  const pitchVariation = (hitPosition - 0.5) * 80; // Edge hits = higher pitch
  oscillator.frequency.setValueAtTime(basePitch + pitchVariation, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(180, audioContext.currentTime + 0.15);

  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
};
```

**Sound Characteristics:**
- Duration: 100-150ms
- Character: Rubbery, bouncy, satisfying
- Volume: 0.4
- Pitch varies by hit position (edges = higher)

---

### Enhancement 2: Orange Drop/Miss Sound

**Description:** Descending "womp" when orange falls below paddle

**Implementation:**
```typescript
export const createOrangeDropSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  // Descending tone - disappointment but not harsh
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.4);

  gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.4);
};
```

**Sound Characteristics:**
- Duration: 350-400ms
- Character: Descending, soft disappointment
- Volume: 0.25 (not punishing)

---

### Enhancement 3: Golden Orange Hit Sound

**Description:** Magical chime with sparkle layer when hitting golden orange

**Implementation:**
```typescript
export const createGoldenOrangeHitSound = (audioContext: AudioContext) => {
  // Layer 1: Base chime
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(880, audioContext.currentTime); // High A
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  // Layer 2: Harmonic sparkle
  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1320, audioContext.currentTime); // High E
  osc2.frequency.setValueAtTime(1760, audioContext.currentTime + 0.1); // Higher A
  gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  // Layer 3: Shimmer (noise filtered)
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 8000;

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.08, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

  // Connect all
  osc1.connect(gain1).connect(audioContext.destination);
  osc2.connect(gain2).connect(audioContext.destination);
  noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);

  osc1.start();
  osc2.start();
  noise.start();
  osc1.stop(audioContext.currentTime + 0.3);
  osc2.stop(audioContext.currentTime + 0.4);
  noise.stop(audioContext.currentTime + 0.3);
};
```

**Sound Characteristics:**
- Duration: 300-400ms
- Character: Magical, rewarding, sparkly
- Volume: 0.35 total
- 3 layers: chime + harmonic + shimmer

---

### Enhancement 4: Banana Collect Sound

**Description:** Upbeat "boop-boop-boop" ascending when collecting banana

**Implementation:**
```typescript
export const createBananaCollectSound = (audioContext: AudioContext) => {
  const notes = [523, 659, 784]; // C5, E5, G5 - happy major arpeggio

  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.08);

    gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.35, audioContext.currentTime + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.15);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + i * 0.08);
    osc.stop(audioContext.currentTime + i * 0.08 + 0.15);
  });
};
```

**Sound Characteristics:**
- Duration: ~350ms total
- Character: Happy, cleansing, energizing
- Notes: Major arpeggio ascending

---

### Enhancement 5: Rum Collect Sound

**Description:** Sloshing "glug-glug" with slight detuning when collecting rum

**Implementation:**
```typescript
export const createRumCollectSound = (audioContext: AudioContext) => {
  // Glug 1
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(200, audioContext.currentTime);
  osc1.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 0.1);
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

  // Glug 2 (delayed)
  const osc2 = audioContext.createOscillator();
  const gain2 = audioContext.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(180, audioContext.currentTime + 0.15);
  osc2.frequency.linearRampToValueAtTime(100, audioContext.currentTime + 0.25);
  gain2.gain.setValueAtTime(0, audioContext.currentTime);
  gain2.gain.setValueAtTime(0.25, audioContext.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.28);

  // Woozy warble overlay
  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 5; // Slow wobble
  lfoGain.gain.value = 30;

  const mainOsc = audioContext.createOscillator();
  const mainGain = audioContext.createGain();
  mainOsc.type = 'triangle';
  mainOsc.frequency.setValueAtTime(150, audioContext.currentTime);
  mainGain.gain.setValueAtTime(0.15, audioContext.currentTime);
  mainGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  lfo.connect(lfoGain).connect(mainOsc.frequency);

  osc1.connect(gain1).connect(audioContext.destination);
  osc2.connect(gain2).connect(audioContext.destination);
  mainOsc.connect(mainGain).connect(audioContext.destination);

  osc1.start();
  osc2.start();
  lfo.start();
  mainOsc.start();

  osc1.stop(audioContext.currentTime + 0.12);
  osc2.stop(audioContext.currentTime + 0.28);
  lfo.stop(audioContext.currentTime + 0.4);
  mainOsc.stop(audioContext.currentTime + 0.4);
};
```

**Sound Characteristics:**
- Duration: ~400ms
- Character: Sloshing, woozy, slightly ominous
- Double "glug" + warble overlay

---

### Enhancement 6: Camel Warning Sound

**Description:** Dramatic descending horn/blare when camel shadow appears

**Implementation:**
```typescript
export const createCamelWarningSound = (audioContext: AudioContext) => {
  // Alarm horn
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, audioContext.currentTime);
  osc.frequency.linearRampToValueAtTime(220, audioContext.currentTime + 0.5);

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  // Low rumble
  const rumble = audioContext.createOscillator();
  const rumbleGain = audioContext.createGain();
  rumble.type = 'sine';
  rumble.frequency.value = 60;
  rumbleGain.gain.setValueAtTime(0.2, audioContext.currentTime);
  rumbleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

  osc.connect(gain).connect(audioContext.destination);
  rumble.connect(rumbleGain).connect(audioContext.destination);

  osc.start();
  rumble.start();
  osc.stop(audioContext.currentTime + 0.5);
  rumble.stop(audioContext.currentTime + 0.6);
};
```

**Sound Characteristics:**
- Duration: 500-600ms
- Character: Alarming, dramatic, attention-grabbing
- Descending horn + low rumble

---

### Enhancement 7: Camel Impact Sound

**Description:** Harsh crash/thud when camel collides with paddle (game over moment)

**Implementation:**
```typescript
export const createCamelImpactSound = (audioContext: AudioContext) => {
  // Heavy impact thud
  const impact = audioContext.createOscillator();
  const impactGain = audioContext.createGain();
  impact.type = 'sine';
  impact.frequency.setValueAtTime(80, audioContext.currentTime);
  impact.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
  impactGain.gain.setValueAtTime(0.5, audioContext.currentTime);
  impactGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  // Crash noise
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.4, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
  noiseFilter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);

  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.4, audioContext.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

  impact.connect(impactGain).connect(audioContext.destination);
  noise.connect(noiseFilter).connect(noiseGain).connect(audioContext.destination);

  impact.start();
  noise.start();
  impact.stop(audioContext.currentTime + 0.4);
  noise.stop(audioContext.currentTime + 0.4);
};
```

**Sound Characteristics:**
- Duration: ~400ms
- Character: Heavy, impactful, final
- Deep thud + filtered crash noise

---

### Enhancement 8: Combo Escalation Sound

**Description:** Sound pitch and complexity increases with combo level

**Implementation:**
```typescript
export const createComboHitSound = (audioContext: AudioContext, comboCount: number) => {
  const baseFreq = 400 + Math.min(comboCount, 10) * 30; // Escalating pitch

  // Base hit
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, audioContext.currentTime + 0.1);
  gain.gain.setValueAtTime(0.35, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.12);

  // Add sparkle at combo 5+
  if (comboCount >= 5) {
    const sparkle = audioContext.createOscillator();
    const sparkleGain = audioContext.createGain();
    sparkle.type = 'sine';
    sparkle.frequency.setValueAtTime(baseFreq * 2, audioContext.currentTime);
    sparkleGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    sparkle.connect(sparkleGain).connect(audioContext.destination);
    sparkle.start();
    sparkle.stop(audioContext.currentTime + 0.2);
  }

  // Add bass hit at combo 8+
  if (comboCount >= 8) {
    const bass = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(80, audioContext.currentTime);
    bassGain.gain.setValueAtTime(0.25, audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    bass.connect(bassGain).connect(audioContext.destination);
    bass.start();
    bass.stop(audioContext.currentTime + 0.15);
  }

  // Add shimmer at combo 10 (max)
  if (comboCount >= 10) {
    const shimmer = audioContext.createOscillator();
    const shimmerGain = audioContext.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(baseFreq * 3, audioContext.currentTime);
    shimmer.frequency.linearRampToValueAtTime(baseFreq * 4, audioContext.currentTime + 0.25);
    shimmerGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

    shimmer.connect(shimmerGain).connect(audioContext.destination);
    shimmer.start();
    shimmer.stop(audioContext.currentTime + 0.25);
  }
};
```

**Sound Characteristics:**
- Combo 1-4: Base hit with escalating pitch
- Combo 5-7: + sparkle layer
- Combo 8-9: + bass hit
- Combo 10: + shimmer (maximum)

---

### Enhancement 9: Combo Break Sound

**Description:** Deflating "whoosh-down" when combo timer expires

**Implementation:**
```typescript
export const createComboBreakSound = (audioContext: AudioContext, lostCombo: number) => {
  if (lostCombo < 3) return; // Only for meaningful combos

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  // Descending whoosh
  osc.type = 'triangle';
  const startFreq = 400 + Math.min(lostCombo, 10) * 20;
  osc.frequency.setValueAtTime(startFreq, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.3);

  gain.gain.setValueAtTime(0.2, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.35);
};
```

---

### Enhancement 10: Rum Active Ambient Loop

**Description:** Woozy, sloshing ambient sound while rum effect is active

**Implementation:**
```typescript
export const createRumAmbientLoop = (audioContext: AudioContext): { start: () => void; stop: () => void } => {
  let isPlaying = false;
  let oscillators: OscillatorNode[] = [];
  let gains: GainNode[] = [];

  const start = () => {
    if (isPlaying) return;
    isPlaying = true;

    // Woozy LFO
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // Very slow wobble
    lfoGain.gain.value = 20;

    // Main woozy tone
    const main = audioContext.createOscillator();
    const mainGain = audioContext.createGain();
    main.type = 'triangle';
    main.frequency.value = 100;
    mainGain.gain.value = 0.1;

    lfo.connect(lfoGain).connect(main.frequency);
    main.connect(mainGain).connect(audioContext.destination);

    lfo.start();
    main.start();

    oscillators = [lfo, main];
    gains = [lfoGain, mainGain];
  };

  const stop = () => {
    if (!isPlaying) return;
    isPlaying = false;

    gains.forEach(g => {
      g.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
    });

    setTimeout(() => {
      oscillators.forEach(o => o.stop());
      oscillators = [];
      gains = [];
    }, 500);
  };

  return { start, stop };
};
```

---

### Enhancement 11: Banana Active Ambient

**Description:** Light, energetic shimmer while banana multiplier is active

**Implementation:**
```typescript
export const createBananaAmbientLoop = (audioContext: AudioContext): { start: () => void; stop: () => void } => {
  // Similar structure to rum but with happy, sparkly tones
  // Higher frequencies, faster LFO, brighter character
  // Volume: 0.08 (subtle background)
  // Character: Energetic sparkle
};
```

---

### Enhancement 12: Sound Variations

**Description:** Create 3-4 variations of common sounds to prevent fatigue

**Implementation:**
```typescript
// In OrangeJuggle.tsx
const soundVariations = {
  orangeHit: [
    () => createOrangeHitSound(audioContext, 0.3),
    () => createOrangeHitSound(audioContext, 0.5),
    () => createOrangeHitSound(audioContext, 0.7),
  ],
};

const playRandomVariation = (soundType: keyof typeof soundVariations) => {
  const variations = soundVariations[soundType];
  const index = Math.floor(Math.random() * variations.length);
  variations[index]();
};
```

Sounds with variations:
- Orange hit (4 variations based on hit position)
- Orange drop (3 variations)
- Arm swing whoosh (3 variations)

---

### Enhancement 13: Level Complete Sound

**Description:** Triumphant fanfare when completing a level

**Implementation:**
```typescript
export const createLevelCompleteSound = (audioContext: AudioContext) => {
  const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6

  melody.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);

    gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + i * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.12 + 0.3);

    osc.connect(gain).connect(audioContext.destination);
    osc.start(audioContext.currentTime + i * 0.12);
    osc.stop(audioContext.currentTime + i * 0.12 + 0.3);
  });
};
```

---

### Enhancement 14: Arm Swing Whoosh

**Description:** Subtle whoosh sound when orangutan swings arm

**Implementation:**
```typescript
export const createArmSwingSound = (audioContext: AudioContext, isLeftArm: boolean) => {
  const noise = audioContext.createBufferSource();
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.08, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = isLeftArm ? 800 : 900; // Slight variation
  filter.Q.value = 1;

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);

  noise.connect(filter).connect(gain).connect(audioContext.destination);
  noise.start();
  noise.stop(audioContext.currentTime + 0.08);
};
```

---

## Phase 2: Haptic Layer

### Enhancement 15: Orange Hit Haptic

**Description:** Medium bounce when orangutan hits an orange

**Pattern:** Single pulse, 20ms, medium intensity

**Implementation:**
```typescript
// In patterns.ts
export const ORANGE_JUGGLE_PATTERNS = {
  orangeHit: [20],
  // ...
};

// In useGameHaptics.ts
export const useOrangeJuggleHaptics = () => {
  const hapticOrangeHit = useCallback(() => {
    vibrate(ORANGE_JUGGLE_PATTERNS.orangeHit);
  }, []);

  return { hapticOrangeHit };
};
```

---

### Enhancement 16: Golden Orange Haptic

**Description:** Rewarding triple pulse when hitting golden orange

**Pattern:** `[15, 25, 12, 25, 10]` — celebratory burst

**Implementation:**
```typescript
goldenOrangeHit: [15, 25, 12, 25, 10],
```

---

### Enhancement 17: Orange Drop Haptic

**Description:** Long drop feeling when orange is missed

**Pattern:** `[50]` — 50ms heavy pulse

**Implementation:**
```typescript
orangeDrop: [50],
```

---

### Enhancement 18: Banana Collect Haptic

**Description:** Energetic triple pulse on banana collection

**Pattern:** `[10, 20, 8, 20, 6]` — quick ascending pattern

**Implementation:**
```typescript
bananaCollect: [10, 20, 8, 20, 6],
```

---

### Enhancement 19: Rum Collect Haptic

**Description:** Woozy double pulse when collecting rum

**Pattern:** `[30, 80, 25]` — slow, uneven, "drunk" feel

**Implementation:**
```typescript
rumCollect: [30, 80, 25],
```

---

### Enhancement 20: Camel Warning Haptic

**Description:** Alarming pulse pattern when camel shadow appears

**Pattern:** `[15, 100, 15, 100, 15]` — urgent triple warning

**Implementation:**
```typescript
camelWarning: [15, 100, 15, 100, 15],
```

---

### Enhancement 21: Camel Impact Haptic

**Description:** Heavy impact when camel collision occurs

**Pattern:** `[80]` — long, heavy pulse (game over feeling)

**Implementation:**
```typescript
camelImpact: [80],
```

---

### Enhancement 22: Combo Escalation Haptic

**Description:** Haptic intensity scales with combo level

**Implementation:**
```typescript
export const getComboHapticPattern = (combo: number): number[] => {
  if (combo >= 10) return [20, 15, 15, 15, 12, 15, 10]; // Full celebration
  if (combo >= 8) return [18, 18, 15, 18, 12];
  if (combo >= 5) return [15, 20, 12, 20, 10];
  if (combo >= 3) return [15, 25, 12];
  if (combo >= 2) return [15, 30, 10];
  return [15]; // Single tap
};
```

---

### Enhancement 23: Near-Miss Haptic

**Description:** Ultra-light warning when orange barely misses paddle

**Pattern:** `[5]` — 5ms ultra-light tap

**Implementation:**
```typescript
nearMiss: [5],

// In OrangeJuggle.tsx - detect near miss
const checkNearMiss = (orange: Orange, paddle: Paddle) => {
  if (orange.y > paddle.y + 20 && orange.y < paddle.y + 50) {
    const distance = Math.abs(orange.x - paddle.x);
    if (distance > paddle.width / 2 && distance < paddle.width / 2 + 30) {
      hapticNearMiss();
      return true;
    }
  }
  return false;
};
```

---

### Enhancement 24: Level Complete Haptic

**Description:** Celebratory burst pattern on level completion

**Pattern:** `[25, 50, 20, 50, 15, 50, 10]` — triumphant pattern

**Implementation:**
```typescript
levelComplete: [25, 50, 20, 50, 15, 50, 10],
```

---

## Phase 3: Core Visual Juice

### Enhancement 25: Orange Squash on Impact

**Description:** Orange compresses when hit by paddle arm

**Implementation:**
```typescript
interface Orange {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  squashX: number;
  squashY: number;
  // ...
}

const triggerOrangeSquash = (orange: Orange, isHorizontalHit: boolean) => {
  if (isHorizontalHit) {
    orange.squashX = 0.6;
    orange.squashY = 1.4;
  } else {
    orange.squashX = 1.4;
    orange.squashY = 0.6;
  }
};

// In game loop - recovery
const updateOrangeSquash = (orange: Orange) => {
  const recovery = 0.12;
  orange.squashX += (1 - orange.squashX) * recovery;
  orange.squashY += (1 - orange.squashY) * recovery;
};

// In draw function
const drawOrange = (ctx: CanvasRenderingContext2D, orange: Orange) => {
  ctx.save();
  ctx.translate(orange.x, orange.y);
  ctx.scale(orange.squashX, orange.squashY);

  // Draw orange circle
  ctx.fillStyle = '#ff8c00';
  ctx.beginPath();
  ctx.arc(0, 0, orange.radius, 0, Math.PI * 2);
  ctx.fill();

  // Orange details (leaf, segments) at origin

  ctx.restore();
};
```

---

### Enhancement 26: Orange Velocity Stretch

**Description:** Orange stretches in direction of movement when fast

**Implementation:**
```typescript
const drawOrangeWithVelocity = (ctx: CanvasRenderingContext2D, orange: Orange) => {
  const speed = Math.sqrt(orange.vx * orange.vx + orange.vy * orange.vy);
  const stretchFactor = 1 + Math.min(speed / 15, 0.35); // Max 35% stretch
  const angle = Math.atan2(orange.vy, orange.vx);

  ctx.save();
  ctx.translate(orange.x, orange.y);
  ctx.rotate(angle);

  // Combine with squash
  ctx.scale(stretchFactor * orange.squashX, (1 / stretchFactor) * orange.squashY);

  // Draw orange at origin
  ctx.fillStyle = '#ff8c00';
  ctx.beginPath();
  ctx.arc(0, 0, orange.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 27: Orangutan Arm Animation on Hit

**Description:** Arm swings with follow-through motion when hitting

**Implementation:**
```typescript
interface Orangutan {
  x: number;
  y: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftArmTarget: number;
  rightArmTarget: number;
  // ...
}

const triggerArmSwing = (orangutan: Orangutan, isLeftArm: boolean) => {
  if (isLeftArm) {
    orangutan.leftArmTarget = -Math.PI / 3; // Swing up
    setTimeout(() => {
      orangutan.leftArmTarget = 0; // Return to rest
    }, 150);
  } else {
    orangutan.rightArmTarget = -Math.PI / 3;
    setTimeout(() => {
      orangutan.rightArmTarget = 0;
    }, 150);
  }
};

// In game loop
const updateOrangutanArms = (orangutan: Orangutan) => {
  const armSpeed = 0.25;
  orangutan.leftArmAngle += (orangutan.leftArmTarget - orangutan.leftArmAngle) * armSpeed;
  orangutan.rightArmAngle += (orangutan.rightArmTarget - orangutan.rightArmAngle) * armSpeed;
};
```

---

### Enhancement 28: Impact Flash on Collision

**Description:** White expanding circle at point of paddle-orange contact

**Implementation:**
```typescript
interface ImpactFlash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const impactFlashesRef = useRef<ImpactFlash[]>([]);

const createImpactFlash = (x: number, y: number) => {
  impactFlashesRef.current.push({
    x, y,
    radius: 8,
    alpha: 1,
  });
};

const updateImpactFlashes = () => {
  const flashes = impactFlashesRef.current;
  for (let i = flashes.length - 1; i >= 0; i--) {
    const flash = flashes[i];
    flash.radius += 4;
    flash.alpha -= 0.12;
    if (flash.alpha <= 0) flashes.splice(i, 1);
  }
};

const drawImpactFlashes = (ctx: CanvasRenderingContext2D) => {
  impactFlashesRef.current.forEach(flash => {
    ctx.save();
    ctx.globalAlpha = flash.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};
```

---

### Enhancement 29: Orange Trail Effect

**Description:** Motion trail behind fast-moving oranges, color escalates with combo

**Implementation:**
```typescript
interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  radius: number;
}

interface Orange {
  // ...existing
  trail: TrailPoint[];
}

const updateOrangeTrail = (orange: Orange, combo: number) => {
  const speed = Math.sqrt(orange.vx * orange.vx + orange.vy * orange.vy);

  // Only add trail points when moving fast
  if (speed > 5) {
    orange.trail.push({
      x: orange.x,
      y: orange.y,
      alpha: 0.6,
      radius: orange.radius * 0.8,
    });
  }

  // Update existing trail points
  for (let i = orange.trail.length - 1; i >= 0; i--) {
    orange.trail[i].alpha -= 0.1;
    orange.trail[i].radius *= 0.92;
    if (orange.trail[i].alpha <= 0) {
      orange.trail.splice(i, 1);
    }
  }

  // Limit trail length
  while (orange.trail.length > 8) {
    orange.trail.shift();
  }
};

const getComboTrailColor = (combo: number): string => {
  if (combo >= 10) return '#ff00ff'; // Magenta
  if (combo >= 8) return '#ff4500';  // OrangeRed
  if (combo >= 5) return '#ffd700';  // Gold
  if (combo >= 3) return '#ffaa00';  // Orange
  return '#ff8c00'; // Default orange
};

const drawOrangeTrail = (ctx: CanvasRenderingContext2D, orange: Orange, combo: number) => {
  const color = getComboTrailColor(combo);

  orange.trail.forEach(point => {
    ctx.save();
    ctx.globalAlpha = point.alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
};
```

---

### Enhancement 30: Particle Burst on Hit

**Description:** Colorful particles explode from impact point

**Implementation:**
```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  gravity: number;
}

const particlesRef = useRef<Particle[]>([]);

const createParticleBurst = (x: number, y: number, color: string, count: number = 12) => {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 5;

    particlesRef.current.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Bias upward
      size: 2 + Math.random() * 4,
      color: i % 4 === 0 ? '#ffffff' : color, // Some white sparkles
      alpha: 1,
      gravity: 0.12 + Math.random() * 0.08,
    });
  }
};

const updateParticles = () => {
  const particles = particlesRef.current;
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.alpha -= 0.025;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
};
```

---

### Enhancement 31: Screen Shake

**Description:** Screen shakes on various events with variable intensity

**Implementation:**
```typescript
interface ScreenShake {
  intensity: number;
  duration: number;
  startTime: number;
}

const screenShakeRef = useRef<ScreenShake | null>(null);

const triggerScreenShake = (intensity: number, duration: number = 150) => {
  screenShakeRef.current = {
    intensity,
    duration,
    startTime: performance.now(),
  };
};

const getShakeOffset = (): { x: number; y: number } => {
  const shake = screenShakeRef.current;
  if (!shake) return { x: 0, y: 0 };

  const elapsed = performance.now() - shake.startTime;
  if (elapsed > shake.duration) {
    screenShakeRef.current = null;
    return { x: 0, y: 0 };
  }

  const progress = elapsed / shake.duration;
  const currentIntensity = shake.intensity * (1 - progress); // Decay

  return {
    x: (Math.random() - 0.5) * 2 * currentIntensity,
    y: (Math.random() - 0.5) * 2 * currentIntensity,
  };
};

// Shake intensity guide for Orange Juggle:
// Orange hit: 3px
// Golden orange hit: 5px
// Combo 5+: 4px
// Combo 8+: 6px
// Combo 10: 8px
// Orange drop: 4px
// Camel warning: 6px
// Camel impact: 15px
```

---

### Enhancement 32: Freeze Frame on Big Hits

**Description:** Brief pause for impactful moments

**Implementation:**
```typescript
const freezeFrameUntilRef = useRef<number>(0);

const triggerFreezeFrame = (duration: number) => {
  freezeFrameUntilRef.current = performance.now() + duration;
};

// In game loop
const gameLoop = (timestamp: number) => {
  if (timestamp < freezeFrameUntilRef.current) {
    draw(); // Still render
    requestAnimationFrame(gameLoop);
    return; // Don't update physics
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
};

// Freeze frame durations:
// Golden orange hit: 50ms
// Combo 5+: 40ms
// Combo 10: 60ms
// Camel impact: 100ms
// Level complete: 80ms
```

---

### Enhancement 33: Combo Glow Effect

**Description:** Orangutan glows brighter as combo increases

**Implementation:**
```typescript
const drawOrangutanWithComboGlow = (
  ctx: CanvasRenderingContext2D,
  orangutan: Orangutan,
  combo: number,
  time: number
) => {
  if (combo >= 3) {
    const glowColor = getComboTrailColor(combo);
    const pulseIntensity = 10 + Math.sin(time * 0.01) * 5;
    const glowAlpha = Math.min(0.3 + combo * 0.05, 0.7);

    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = pulseIntensity + combo * 2;
    ctx.globalAlpha = glowAlpha;

    // Draw glow layer
    drawOrangutan(ctx, orangutan);

    ctx.restore();
  }

  // Draw normal orangutan on top
  drawOrangutan(ctx, orangutan);
};
```

---

### Enhancement 34: Multiple Orange Panic Indicators

**Description:** Visual cues when multiple oranges are falling simultaneously

**Implementation:**
```typescript
const drawPanicIndicators = (
  ctx: CanvasRenderingContext2D,
  fallingOranges: Orange[],
  paddleX: number,
  time: number
) => {
  if (fallingOranges.length <= 1) return;

  // Warning intensity based on count
  const panicLevel = Math.min(fallingOranges.length - 1, 4);
  const pulseAlpha = 0.2 + Math.sin(time * 0.02 * panicLevel) * 0.15;

  // Draw predicted landing zones
  fallingOranges.forEach(orange => {
    if (orange.vy > 0) { // Only falling oranges
      const timeToBottom = (canvasHeight - 80 - orange.y) / orange.vy;
      const predictedX = orange.x + orange.vx * timeToBottom;

      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(predictedX, canvasHeight - 70, 6, 0, Math.PI * 2);
      ctx.fill();

      // Danger line
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(orange.x, orange.y);
      ctx.lineTo(predictedX, canvasHeight - 70);
      ctx.stroke();

      ctx.restore();
    }
  });

  // Screen edge vignette at high panic
  if (panicLevel >= 3) {
    const gradient = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.3,
      canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, `rgba(255, 0, 0, ${pulseAlpha * 0.5})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
};
```

---

## Phase 4: Powerup & Collectible Feedback

### Enhancement 35: Golden Orange Glow and Pulse

**Description:** Golden orange has radiant glow and pulsing animation

**Implementation:**
```typescript
const drawGoldenOrange = (
  ctx: CanvasRenderingContext2D,
  orange: Orange,
  time: number
) => {
  const pulseScale = 1 + Math.sin(time * 0.012) * 0.08;
  const glowIntensity = 12 + Math.sin(time * 0.015) * 6;

  ctx.save();
  ctx.translate(orange.x, orange.y);
  ctx.scale(pulseScale * orange.squashX, pulseScale * orange.squashY);

  // Outer glow
  ctx.shadowColor = '#ffd700';
  ctx.shadowBlur = glowIntensity;

  // Golden orange
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, orange.radius);
  gradient.addColorStop(0, '#fff4b0');
  gradient.addColorStop(0.5, '#ffd700');
  gradient.addColorStop(1, '#daa520');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, orange.radius, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle overlay
  const sparkleAngle = time * 0.005;
  ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.sin(time * 0.02) * 0.2})`;
  ctx.beginPath();
  ctx.arc(
    Math.cos(sparkleAngle) * orange.radius * 0.5,
    Math.sin(sparkleAngle) * orange.radius * 0.5,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 36: Banana Glow and Float Animation

**Description:** Banana has yellow glow and gentle floating motion

**Implementation:**
```typescript
const drawBanana = (
  ctx: CanvasRenderingContext2D,
  banana: Powerup,
  time: number
) => {
  const floatOffset = Math.sin(time * 0.008) * 5;
  const rotateAngle = Math.sin(time * 0.006) * 0.15;
  const pulseScale = 1 + Math.sin(time * 0.01) * 0.06;

  ctx.save();
  ctx.translate(banana.x, banana.y + floatOffset);
  ctx.rotate(rotateAngle);
  ctx.scale(pulseScale, pulseScale);

  // Glow
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 10 + Math.sin(time * 0.012) * 5;

  // Banana shape (curved rectangle)
  ctx.fillStyle = '#ffe135';
  ctx.beginPath();
  ctx.ellipse(0, 0, 25, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Banana tips
  ctx.fillStyle = '#8b4513';
  ctx.beginPath();
  ctx.arc(-22, 0, 4, 0, Math.PI * 2);
  ctx.arc(22, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 37: Rum Bottle Wobble Animation

**Description:** Rum bottle wobbles and has ominous purple glow

**Implementation:**
```typescript
const drawRum = (
  ctx: CanvasRenderingContext2D,
  rum: Powerup,
  time: number
) => {
  const wobbleAngle = Math.sin(time * 0.015) * 0.2;
  const pulseScale = 1 + Math.sin(time * 0.008) * 0.04;

  ctx.save();
  ctx.translate(rum.x, rum.y);
  ctx.rotate(wobbleAngle);
  ctx.scale(pulseScale, pulseScale);

  // Ominous glow
  ctx.shadowColor = '#8b008b';
  ctx.shadowBlur = 8 + Math.sin(time * 0.01) * 4;

  // Bottle body
  ctx.fillStyle = '#4a0e4a';
  ctx.beginPath();
  ctx.roundRect(-12, -20, 24, 35, 4);
  ctx.fill();

  // Bottle neck
  ctx.fillStyle = '#4a0e4a';
  ctx.beginPath();
  ctx.roundRect(-6, -30, 12, 12, 2);
  ctx.fill();

  // Liquid highlight
  ctx.fillStyle = 'rgba(139, 0, 139, 0.5)';
  ctx.beginPath();
  ctx.roundRect(-10, -10, 20, 20, 3);
  ctx.fill();

  // Skull icon (danger indicator)
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☠', 0, 0);

  ctx.restore();
};
```

---

### Enhancement 38: Powerup Collection Flash

**Description:** Screen-wide color flash when collecting powerups

**Implementation:**
```typescript
interface ScreenFlash {
  color: string;
  alpha: number;
}

const screenFlashRef = useRef<ScreenFlash | null>(null);

const triggerPowerupFlash = (powerupType: 'golden' | 'banana' | 'rum') => {
  const colors = {
    golden: '#ffd700',
    banana: '#ffff00',
    rum: '#8b008b',
  };

  screenFlashRef.current = {
    color: colors[powerupType],
    alpha: powerupType === 'rum' ? 0.25 : 0.35, // Rum is more subtle
  };
};

const updateScreenFlash = () => {
  if (screenFlashRef.current) {
    screenFlashRef.current.alpha -= 0.04;
    if (screenFlashRef.current.alpha <= 0) {
      screenFlashRef.current = null;
    }
  }
};

const drawScreenFlash = (ctx: CanvasRenderingContext2D) => {
  if (!screenFlashRef.current) return;

  ctx.save();
  ctx.globalAlpha = screenFlashRef.current.alpha;
  ctx.fillStyle = screenFlashRef.current.color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
};
```

---

### Enhancement 39: Banana Multiplier Timer Bar

**Description:** Visual timer showing remaining banana multiplier duration

**Implementation:**
```typescript
interface ActivePowerup {
  type: 'banana';
  startTime: number;
  duration: number; // 5000ms
  color: string;
}

const drawBananaTimer = (
  ctx: CanvasRenderingContext2D,
  powerup: ActivePowerup,
  currentTime: number
) => {
  const elapsed = currentTime - powerup.startTime;
  const remaining = powerup.duration - elapsed;
  const progress = remaining / powerup.duration;

  const x = 10;
  const y = 60;
  const width = 100;
  const height = 20;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, height);

  // Progress bar
  ctx.fillStyle = '#ffe135';
  ctx.fillRect(x, y, width * progress, height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('1.5x SCORE', x + 5, y + height / 2);

  // Flash red when about to expire
  if (remaining < 2000) {
    ctx.globalAlpha = 0.5 + Math.sin(currentTime * 0.02) * 0.5;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.globalAlpha = 1;
  }
};
```

---

### Enhancement 40: Rum Effect Visual Overlay

**Description:** Screen has woozy overlay while rum effect is active

**Implementation:**
```typescript
const drawRumOverlay = (
  ctx: CanvasRenderingContext2D,
  time: number,
  rumActive: boolean
) => {
  if (!rumActive) return;

  // Wobbly vignette
  const wobble = Math.sin(time * 0.005) * 0.1;

  ctx.save();

  // Purple-tinted edges
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2 + Math.sin(time * 0.003) * 20,
    canvasHeight / 2 + Math.cos(time * 0.004) * 15,
    canvasWidth * 0.3,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * 0.8
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(1, `rgba(75, 0, 75, ${0.25 + wobble})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle scan lines for dizziness
  ctx.globalAlpha = 0.03;
  for (let y = 0; y < canvasHeight; y += 4) {
    ctx.fillStyle = y % 8 === 0 ? '#000000' : 'transparent';
    ctx.fillRect(0, y, canvasWidth, 2);
  }

  ctx.restore();
};
```

---

### Enhancement 41: Powerup Spawn Particles

**Description:** Particles burst when powerup spawns

**Implementation:**
```typescript
const spawnPowerup = (x: number, y: number, type: 'golden' | 'banana' | 'rum') => {
  // Particle burst
  const colors = {
    golden: '#ffd700',
    banana: '#ffe135',
    rum: '#8b008b',
  };

  createParticleBurst(x, y, colors[type], 10);

  // Play spawn sound
  playPowerupSpawn(type);

  return {
    x, y, type,
    spawnTime: performance.now(),
  };
};
```

---

### Enhancement 42: Collection Score Popup

**Description:** Animated score popup when collecting any item

**Implementation:**
```typescript
interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  scale: number;
}

const scorePopupsRef = useRef<ScorePopup[]>([]);

const createScorePopup = (
  x: number,
  y: number,
  baseScore: number,
  multiplier: number,
  type: 'normal' | 'golden' | 'banana'
) => {
  const finalScore = Math.floor(baseScore * multiplier);
  const text = multiplier > 1
    ? `+${finalScore} (x${multiplier})`
    : `+${finalScore}`;

  const colors = {
    normal: '#ffffff',
    golden: '#ffd700',
    banana: '#ffe135',
  };

  scorePopupsRef.current.push({
    x, y,
    text,
    color: colors[type],
    alpha: 1,
    vy: -2,
    scale: type === 'golden' ? 1.3 : 1,
  });
};

const updateScorePopups = () => {
  const popups = scorePopupsRef.current;
  for (let i = popups.length - 1; i >= 0; i--) {
    const popup = popups[i];
    popup.y += popup.vy;
    popup.vy *= 0.98; // Slow down
    popup.alpha -= 0.02;
    if (popup.alpha <= 0) popups.splice(i, 1);
  }
};

const drawScorePopups = (ctx: CanvasRenderingContext2D) => {
  scorePopupsRef.current.forEach(popup => {
    ctx.save();
    ctx.globalAlpha = popup.alpha;
    ctx.fillStyle = popup.color;
    ctx.font = `bold ${14 * popup.scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow for readability
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;

    ctx.fillText(popup.text, popup.x, popup.y);
    ctx.restore();
  });
};
```

---

## Phase 5: Enemy & Hazard Feedback

### Enhancement 43: Camel Shadow Warning

**Description:** Dark shadow grows on ground before camel drops

**Implementation:**
```typescript
interface CamelWarning {
  x: number;
  startTime: number;
  duration: number; // 1500ms warning time
}

const camelWarningRef = useRef<CamelWarning | null>(null);

const startCamelWarning = (dropX: number) => {
  camelWarningRef.current = {
    x: dropX,
    startTime: performance.now(),
    duration: 1500,
  };

  // Play warning sound
  playCamelWarning();

  // Warning haptic
  hapticCamelWarning();
};

const drawCamelWarning = (ctx: CanvasRenderingContext2D, currentTime: number) => {
  const warning = camelWarningRef.current;
  if (!warning) return;

  const elapsed = currentTime - warning.startTime;
  const progress = Math.min(elapsed / warning.duration, 1);

  // Growing shadow
  const shadowRadius = 20 + progress * 40;
  const shadowAlpha = 0.2 + progress * 0.4;

  ctx.save();
  ctx.globalAlpha = shadowAlpha;

  // Elliptical shadow
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(
    warning.x,
    canvasHeight - 60, // Ground level
    shadowRadius,
    shadowRadius * 0.4,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Pulsing danger ring
  const pulseAlpha = Math.sin(elapsed * 0.02) * 0.3 + 0.3;
  ctx.globalAlpha = pulseAlpha;
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(
    warning.x,
    canvasHeight - 60,
    shadowRadius + 10,
    (shadowRadius + 10) * 0.4,
    0, 0, Math.PI * 2
  );
  ctx.stroke();

  // Warning icon
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = '#ff0000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('⚠', warning.x, canvasHeight - 90);

  ctx.restore();
};
```

---

### Enhancement 44: Camel Drop Animation

**Description:** Camel dramatically drops from sky with dust cloud on landing

**Implementation:**
```typescript
interface Camel {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  landed: boolean;
  landTime: number;
  squashY: number;
}

const spawnCamel = (x: number): Camel => {
  return {
    x,
    y: -100, // Start above screen
    targetY: canvasHeight - 100, // Landing position
    vy: 0,
    landed: false,
    landTime: 0,
    squashY: 1,
  };
};

const updateCamel = (camel: Camel) => {
  if (!camel.landed) {
    // Accelerating drop
    camel.vy += 0.8; // Gravity
    camel.y += camel.vy;

    if (camel.y >= camel.targetY) {
      camel.y = camel.targetY;
      camel.landed = true;
      camel.landTime = performance.now();
      camel.squashY = 0.5; // Squash on landing

      // Landing effects
      createDustCloud(camel.x, camel.targetY);
      triggerScreenShake(10, 200);
      playCamelLand();
    }
  } else {
    // Squash recovery
    camel.squashY += (1 - camel.squashY) * 0.15;
  }
};

const createDustCloud = (x: number, y: number) => {
  // Brown/tan particles spreading outward
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI; // Only upper hemisphere
    const speed = 2 + Math.random() * 4;

    particlesRef.current.push({
      x, y,
      vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
      vy: -Math.sin(angle) * speed,
      size: 4 + Math.random() * 6,
      color: Math.random() > 0.5 ? '#d2b48c' : '#c4a57b',
      alpha: 0.8,
      gravity: 0.05,
    });
  }
};

const drawCamel = (ctx: CanvasRenderingContext2D, camel: Camel) => {
  ctx.save();
  ctx.translate(camel.x, camel.y);
  ctx.scale(1, camel.squashY);

  // Simple camel representation (can be sprite)
  ctx.fillStyle = '#d2b48c';

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Humps
  ctx.beginPath();
  ctx.ellipse(-15, -25, 12, 15, 0, 0, Math.PI * 2);
  ctx.ellipse(15, -25, 12, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.ellipse(45, -10, 15, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Angry eyes
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(50, -15, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};
```

---

### Enhancement 45: Camel Movement Trail

**Description:** Dust trail as camel moves across screen

**Implementation:**
```typescript
const updateCamelMovement = (camel: Camel, deltaTime: number) => {
  if (!camel.landed) return;

  // Camel moves toward paddle
  const direction = paddle.x > camel.x ? 1 : -1;
  camel.x += direction * camelSpeed * deltaTime;

  // Dust particles while moving
  if (Math.random() < 0.3) {
    particlesRef.current.push({
      x: camel.x - direction * 30,
      y: camel.y + 20,
      vx: -direction * (1 + Math.random()),
      vy: -Math.random() * 2,
      size: 3 + Math.random() * 3,
      color: '#c4a57b',
      alpha: 0.5,
      gravity: 0.02,
    });
  }
};
```

---

### Enhancement 46: Camel Collision Impact

**Description:** Dramatic visual explosion when camel hits paddle

**Implementation:**
```typescript
const handleCamelCollision = (camel: Camel, paddle: Orangutan) => {
  // Check collision
  const distance = Math.abs(camel.x - paddle.x);
  if (distance < 50 && camel.y > paddle.y - 30) {
    // Collision!

    // Sound
    playCamelImpact();

    // Haptic
    hapticCamelImpact();

    // Major screen shake
    triggerScreenShake(15, 300);

    // Freeze frame
    triggerFreezeFrame(100);

    // Explosion particles
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 3 + Math.random() * 6;

      particlesRef.current.push({
        x: paddle.x,
        y: paddle.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color: i % 3 === 0 ? '#ff4444' : '#ffaa00',
        alpha: 1,
        gravity: 0.15,
      });
    }

    // Red screen flash
    triggerScreenFlash('#ff0000', 0.5);

    // Trigger game over
    setGameOver(true);
  }
};
```

---

### Enhancement 47: Near-Miss with Camel

**Description:** Feedback when narrowly avoiding camel

**Implementation:**
```typescript
const checkCamelNearMiss = (camel: Camel, paddle: Orangutan): boolean => {
  if (!camel.landed) return false;

  const distance = Math.abs(camel.x - paddle.x);

  // Within near-miss range but not collision
  if (distance > 50 && distance < 80 && camel.y > paddle.y - 50) {
    // Ultra-light haptic
    hapticNearMiss();

    // Brief orange flash (warning but survived)
    screenFlashRef.current = { color: '#ff8800', alpha: 0.15 };

    return true;
  }

  return false;
};
```

---

### Enhancement 48: Camel Exit Animation

**Description:** When level changes or camel leaves screen, exit animation

**Implementation:**
```typescript
const exitCamel = (camel: Camel) => {
  // Camel walks off screen with dust trail
  camel.isExiting = true;
  camel.exitDirection = camel.x > canvasWidth / 2 ? 1 : -1;
};

const updateCamelExit = (camel: Camel) => {
  if (!camel.isExiting) return;

  camel.x += camel.exitDirection * 5;

  // Dust while exiting
  if (Math.random() < 0.4) {
    createDustParticle(camel.x, camel.y + 20);
  }

  // Remove when off screen
  if (camel.x < -100 || camel.x > canvasWidth + 100) {
    removeCamel(camel);
  }
};
```

---

## Phase 6: Combo & Scoring System

### Enhancement 49: Combo Meter Visual

**Description:** On-screen combo meter with timeout bar

**Implementation:**
```typescript
interface ComboState {
  count: number;
  lastHitTime: number;
  maxCombo: number;
}

const drawComboMeter = (
  ctx: CanvasRenderingContext2D,
  combo: ComboState,
  currentTime: number
) => {
  if (combo.count < 2) return;

  const timeSinceHit = currentTime - combo.lastHitTime;
  const comboTimeout = 2500; // 2.5 seconds
  const timeRemaining = Math.max(0, comboTimeout - timeSinceHit);
  const progress = timeRemaining / comboTimeout;

  const x = canvasWidth - 120;
  const y = 15;
  const width = 100;
  const height = 12;

  // Combo count
  const comboColor = getComboColor(combo.count);
  ctx.fillStyle = comboColor;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`x${combo.count}`, x + width, y + 35);

  // Glow at high combos
  if (combo.count >= 5) {
    ctx.shadowColor = comboColor;
    ctx.shadowBlur = 10 + Math.sin(currentTime * 0.01) * 5;
  }

  // Timer bar background
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, width, height);

  // Timer bar fill
  ctx.fillStyle = progress < 0.3 ? '#ff4444' : comboColor;
  ctx.fillRect(x, y, width * progress, height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);

  // Flash when about to expire
  if (progress < 0.2) {
    ctx.globalAlpha = Math.sin(currentTime * 0.03) * 0.5 + 0.5;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.globalAlpha = 1;
  }
};

const getComboColor = (combo: number): string => {
  if (combo >= 10) return '#ff00ff'; // Max combo - magenta
  if (combo >= 8) return '#ff4500';  // OrangeRed
  if (combo >= 5) return '#ffd700';  // Gold
  if (combo >= 3) return '#ffaa00';  // Orange
  return '#ffffff';
};
```

---

### Enhancement 50: Combo Multiplier Display

**Description:** Show score multiplier from combo

**Implementation:**
```typescript
const getComboMultiplier = (combo: number): number => {
  if (combo >= 10) return 2.5;
  if (combo >= 8) return 2.0;
  if (combo >= 5) return 1.5;
  if (combo >= 3) return 1.2;
  return 1.0;
};

const drawMultiplierIndicator = (
  ctx: CanvasRenderingContext2D,
  combo: number,
  currentTime: number
) => {
  const multiplier = getComboMultiplier(combo);
  if (multiplier <= 1) return;

  const x = canvasWidth - 60;
  const y = 60;

  const pulseScale = 1 + Math.sin(currentTime * 0.01) * 0.05;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulseScale, pulseScale);

  ctx.fillStyle = getComboColor(combo);
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${multiplier}x`, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px Arial';
  ctx.fillText('MULTIPLIER', 0, 14);

  ctx.restore();
};
```

---

### Enhancement 51: Combo Break Feedback

**Description:** Visual and audio feedback when combo is lost

**Implementation:**
```typescript
const handleComboBreak = (lostCombo: number, lastComboX: number) => {
  if (lostCombo < 3) return; // Only for meaningful combos

  // Sound
  playComboBreak(lostCombo);

  // Haptic (for bigger combos)
  if (lostCombo >= 5) {
    hapticComboBreak();
  }

  // Visual: "COMBO LOST" text
  comboLostTextRef.current = {
    text: `x${lostCombo} LOST`,
    x: lastComboX,
    y: canvasHeight / 2,
    alpha: 1,
    scale: 1.5,
  };

  // Red vignette flash
  triggerVignetteFlash('#ff0000', 0.2);
};

const drawComboLostText = (ctx: CanvasRenderingContext2D) => {
  const text = comboLostTextRef.current;
  if (!text) return;

  ctx.save();
  ctx.globalAlpha = text.alpha;
  ctx.translate(text.x, text.y);
  ctx.scale(text.scale, text.scale);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.fillText(text.text, 0, 0);

  ctx.restore();

  // Update
  text.y -= 1;
  text.alpha -= 0.02;
  text.scale *= 0.99;

  if (text.alpha <= 0) {
    comboLostTextRef.current = null;
  }
};
```

---

### Enhancement 52: Max Combo Celebration

**Description:** Special celebration when reaching 10x combo

**Implementation:**
```typescript
const triggerMaxComboCelebration = () => {
  // Sound: Full celebration
  playMaxComboSound();

  // Haptic: Full pattern
  hapticMaxCombo();

  // Screen flash: Gold
  triggerScreenFlash('#ffd700', 0.4);

  // Freeze frame
  triggerFreezeFrame(80);

  // Screen shake
  triggerScreenShake(8, 200);

  // Confetti burst
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;

    confettiRef.current.push({
      x: canvasWidth / 2,
      y: canvasHeight / 3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 6 + Math.random() * 6,
      color: ['#ff00ff', '#ffd700', '#00ffff', '#ff4500'][Math.floor(Math.random() * 4)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    });
  }

  // "MAX COMBO!" callout
  calloutRef.current = {
    text: 'MAX COMBO!',
    startTime: performance.now(),
    duration: 1500,
  };
};

const drawCallout = (ctx: CanvasRenderingContext2D, currentTime: number) => {
  const callout = calloutRef.current;
  if (!callout) return;

  const elapsed = currentTime - callout.startTime;
  if (elapsed > callout.duration) {
    calloutRef.current = null;
    return;
  }

  const progress = elapsed / callout.duration;
  const alpha = progress < 0.2 ? progress * 5 : 1 - (progress - 0.2) / 0.8;
  const scale = 1 + Math.sin(elapsed * 0.02) * 0.1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(canvasWidth / 2, canvasHeight / 3);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  ctx.fillText(callout.text, 0, 0);

  ctx.restore();
};
```

---

### Enhancement 53: Score Animation

**Description:** Animated score counter that counts up

**Implementation:**
```typescript
interface ScoreAnimation {
  displayScore: number;
  targetScore: number;
}

const scoreAnimRef = useRef<ScoreAnimation>({ displayScore: 0, targetScore: 0 });

const addScore = (points: number) => {
  scoreAnimRef.current.targetScore += points;
};

const updateScoreAnimation = () => {
  const anim = scoreAnimRef.current;
  if (anim.displayScore < anim.targetScore) {
    const diff = anim.targetScore - anim.displayScore;
    const increment = Math.max(1, Math.ceil(diff * 0.1));
    anim.displayScore = Math.min(anim.displayScore + increment, anim.targetScore);
  }
};

const drawScore = (ctx: CanvasRenderingContext2D) => {
  const anim = scoreAnimRef.current;
  const isAnimating = anim.displayScore !== anim.targetScore;

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isAnimating ? 28 : 24}px Arial`;
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${anim.displayScore}`, 10, 30);

  // Glow when animating
  if (isAnimating) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
  }
};
```

---

### Enhancement 54: High Score Celebration

**Description:** Special effects when beating high score

**Implementation:**
```typescript
const checkHighScore = (currentScore: number, highScore: number) => {
  if (currentScore > highScore && !highScoreBeatenRef.current) {
    highScoreBeatenRef.current = true;

    // Sound
    playHighScoreSound();

    // Haptic celebration
    hapticHighScore();

    // Visual callout
    calloutRef.current = {
      text: 'NEW HIGH SCORE!',
      startTime: performance.now(),
      duration: 2000,
    };

    // Confetti
    for (let i = 0; i < 40; i++) {
      // Similar to max combo confetti
    }
  }
};
```

---

### Enhancement 55: Lives Display Animation

**Description:** Animated lives display with bounce on gain/loss

**Implementation:**
```typescript
interface LivesDisplay {
  count: number;
  scale: number;
  lastChangeTime: number;
}

const livesDisplayRef = useRef<LivesDisplay>({ count: 3, scale: 1, lastChangeTime: 0 });

const updateLives = (newCount: number) => {
  const display = livesDisplayRef.current;
  display.count = newCount;
  display.scale = 1.3; // Bounce
  display.lastChangeTime = performance.now();
};

const drawLives = (ctx: CanvasRenderingContext2D) => {
  const display = livesDisplayRef.current;

  // Recovery bounce
  display.scale += (1 - display.scale) * 0.15;

  ctx.save();
  ctx.translate(canvasWidth - 80, 80);
  ctx.scale(display.scale, display.scale);

  for (let i = 0; i < display.count; i++) {
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.arc(i * 25, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Orange details
    ctx.fillStyle = '#228b22';
    ctx.fillRect(i * 25 - 2, -12, 4, 4);
  }

  ctx.restore();
};
```

---

## Phase 7: Anticipation & Polish

### Enhancement 56: Landing Prediction Indicator

**Description:** Shows where falling oranges will land

**Implementation:**
```typescript
const drawLandingPredictions = (
  ctx: CanvasRenderingContext2D,
  oranges: Orange[],
  paddleY: number
) => {
  oranges.forEach(orange => {
    if (orange.vy <= 0) return; // Only falling oranges

    const timeToLand = (paddleY - orange.y) / orange.vy;
    if (timeToLand < 0 || timeToLand > 90) return; // Too far away

    const predictedX = orange.x + orange.vx * timeToLand;

    // Urgency based on time
    const urgency = Math.max(0, 1 - timeToLand / 60);
    const alpha = urgency * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Landing dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(predictedX, paddleY - 5, 4 + urgency * 4, 0, Math.PI * 2);
    ctx.fill();

    // Trajectory line (dashed)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(orange.x, orange.y);
    ctx.lineTo(predictedX, paddleY - 5);
    ctx.stroke();

    ctx.restore();
  });
};
```

---

### Enhancement 57: Final Orange Highlight

**Description:** Last 1-3 oranges needed for level completion glow

**Implementation:**
```typescript
const drawOrangesWithHighlight = (
  ctx: CanvasRenderingContext2D,
  oranges: Orange[],
  remainingForLevel: number,
  time: number
) => {
  const shouldHighlight = remainingForLevel <= 3;

  oranges.forEach(orange => {
    if (shouldHighlight) {
      const pulseIntensity = 8 + Math.sin(time * 0.015) * 5;

      ctx.save();
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = pulseIntensity;

      // Pulsing border
      ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(time * 0.015) * 0.3})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(orange.x, orange.y, orange.radius + 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    drawOrange(ctx, orange);
  });
};
```

---

### Enhancement 58: Level Transition Animation

**Description:** Smooth fade transition between levels

**Implementation:**
```typescript
interface LevelTransition {
  phase: 'fadeOut' | 'display' | 'fadeIn' | null;
  progress: number;
  levelNumber: number;
}

const levelTransitionRef = useRef<LevelTransition>({
  phase: null,
  progress: 0,
  levelNumber: 1,
});

const startLevelTransition = (newLevel: number) => {
  levelTransitionRef.current = {
    phase: 'fadeOut',
    progress: 0,
    levelNumber: newLevel,
  };
};

const updateLevelTransition = () => {
  const transition = levelTransitionRef.current;
  if (!transition.phase) return;

  transition.progress += 0.025;

  if (transition.progress >= 1) {
    if (transition.phase === 'fadeOut') {
      transition.phase = 'display';
      transition.progress = 0;
      loadLevel(transition.levelNumber);
    } else if (transition.phase === 'display') {
      transition.phase = 'fadeIn';
      transition.progress = 0;
    } else {
      transition.phase = null;
    }
  }
};

const drawLevelTransition = (ctx: CanvasRenderingContext2D) => {
  const transition = levelTransitionRef.current;
  if (!transition.phase) return;

  let overlayAlpha = 0;
  if (transition.phase === 'fadeOut') overlayAlpha = transition.progress;
  else if (transition.phase === 'display') overlayAlpha = 1;
  else if (transition.phase === 'fadeIn') overlayAlpha = 1 - transition.progress;

  ctx.save();
  ctx.globalAlpha = overlayAlpha;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (transition.phase === 'display') {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`LEVEL ${transition.levelNumber}`, canvasWidth / 2, canvasHeight / 2);

    // Level subtitle
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ffffff';
    const subtitles = [
      '',
      'The Basics',
      'Picking Up Speed',
      'Getting Crowded',
      'Watch for Camels!',
      'Master Juggler',
    ];
    ctx.fillText(subtitles[transition.levelNumber] || '', canvasWidth / 2, canvasHeight / 2 + 40);
  }

  ctx.restore();
};
```

---

### Enhancement 59: Anticipation Sound for Final Oranges

**Description:** Tension-building audio when close to level completion

**Implementation:**
```typescript
let anticipationLoopRef: { stop: () => void } | null = null;

const checkAnticipation = (remainingOranges: number) => {
  if (remainingOranges <= 3 && remainingOranges > 0) {
    if (!anticipationLoopRef) {
      anticipationLoopRef = createAnticipationLoop(audioContextRef.current);
      anticipationLoopRef.start();
    }
  } else {
    if (anticipationLoopRef) {
      anticipationLoopRef.stop();
      anticipationLoopRef = null;
    }
  }
};

// Clean up on level complete or game over
const onLevelComplete = () => {
  if (anticipationLoopRef) {
    anticipationLoopRef.stop();
    anticipationLoopRef = null;
  }
};
```

---

### Enhancement 60: Level Complete Celebration

**Description:** Full celebration sequence on level completion

**Implementation:**
```typescript
const celebrateLevelComplete = () => {
  // Sound
  playLevelComplete();

  // Haptic
  hapticLevelComplete();

  // Screen shake
  triggerScreenShake(6, 200);

  // Freeze frame
  triggerFreezeFrame(80);

  // Screen flash
  triggerScreenFlash('#00ff00', 0.3);

  // Confetti burst
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvasWidth;
    confettiRef.current.push({
      x,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 3,
      size: 8 + Math.random() * 8,
      color: ['#ff8c00', '#ffd700', '#00ff00', '#ff00ff'][Math.floor(Math.random() * 4)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      alpha: 1,
    });
  }

  // "LEVEL COMPLETE!" callout
  calloutRef.current = {
    text: 'LEVEL COMPLETE!',
    startTime: performance.now(),
    duration: 2000,
  };

  // Start transition after delay
  setTimeout(() => {
    startLevelTransition(currentLevel + 1);
  }, 1500);
};
```

---

### Enhancement 61: Game Over Sequence

**Description:** Dramatic game over presentation

**Implementation:**
```typescript
const handleGameOver = () => {
  gameOverRef.current = {
    startTime: performance.now(),
    phase: 'impact', // impact -> fadeIn -> display
  };

  // Major shake
  triggerScreenShake(15, 400);

  // Heavy haptic
  hapticGameOver();

  // Game over sound
  playGameOver();
};

const drawGameOver = (ctx: CanvasRenderingContext2D, currentTime: number) => {
  const go = gameOverRef.current;
  if (!go) return;

  const elapsed = currentTime - go.startTime;

  // Phase transitions
  if (elapsed < 500) {
    // Red flash fading
    ctx.save();
    ctx.globalAlpha = 0.5 * (1 - elapsed / 500);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  } else if (elapsed < 1500) {
    // Fade to dark
    const fadeProgress = (elapsed - 500) / 1000;
    ctx.save();
    ctx.globalAlpha = fadeProgress * 0.8;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  } else {
    // Display game over
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvasWidth / 2, canvasHeight / 2 + 20);
    ctx.fillText(`Best Combo: x${maxCombo}`, canvasWidth / 2, canvasHeight / 2 + 55);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('Tap to restart', canvasWidth / 2, canvasHeight / 2 + 100);

    ctx.restore();
  }
};
```

---

### Enhancement 62: Pause State Feedback

**Description:** Visual treatment when game is paused

**Implementation:**
```typescript
const drawPauseOverlay = (ctx: CanvasRenderingContext2D, time: number) => {
  ctx.save();

  // Dim background
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.globalAlpha = 1;

  // Pause text with pulse
  const pulse = 1 + Math.sin(time * 0.005) * 0.05;
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.scale(pulse, pulse);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 0, -20);

  ctx.font = '18px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Tap to resume', 0, 30);

  ctx.restore();
};
```

---

## Integration Summary

### Game Loop Structure

```typescript
const gameLoop = (timestamp: number) => {
  // Check freeze frame
  if (timestamp < freezeFrameUntilRef.current) {
    draw(timestamp);
    requestAnimationFrame(gameLoop);
    return;
  }

  // Update
  updateOranges();
  updateOrangutanArms();
  updateSquash();
  updateParticles();
  updateConfetti();
  updateImpactFlashes();
  updateScreenFlash();
  updateScoreAnimation();
  updateScorePopups();
  updateCamel();
  updateLevelTransition();
  checkCollisions();
  checkAnticipation();

  // Draw
  draw(timestamp);

  requestAnimationFrame(gameLoop);
};

const draw = (timestamp: number) => {
  const shake = getShakeOffset();

  ctx.save();
  ctx.translate(shake.x, shake.y);

  // Background
  drawBackground(ctx);

  // Game elements
  drawOrangeTrails(ctx, oranges, combo.count);
  drawLandingPredictions(ctx, oranges, paddle.y);
  drawOrangesWithHighlight(ctx, oranges, remainingForLevel, timestamp);
  drawPowerups(ctx, powerups, timestamp);
  drawOrangutanWithComboGlow(ctx, paddle, combo.count, timestamp);
  drawCamelWarning(ctx, timestamp);
  drawCamel(ctx, camel);

  // Effects
  drawParticles(ctx);
  drawConfetti(ctx);
  drawImpactFlashes(ctx);
  drawScorePopups(ctx);
  drawComboLostText(ctx);

  ctx.restore();

  // Overlays (not affected by shake)
  drawRumOverlay(ctx, timestamp, rumActive);
  drawScreenFlash(ctx);
  drawPanicIndicators(ctx, fallingOranges, paddle.x, timestamp);

  // UI
  drawScore(ctx);
  drawLives(ctx);
  drawComboMeter(ctx, combo, timestamp);
  drawMultiplierIndicator(ctx, combo.count, timestamp);
  drawBananaTimer(ctx, activeBanana, timestamp);
  drawCallout(ctx, timestamp);

  // State overlays
  drawLevelTransition(ctx);
  drawGameOver(ctx, timestamp);
  drawPauseOverlay(ctx, timestamp);
};
```

---

## File Modifications Summary

| File | Additions |
|------|-----------|
| `useGameSounds.ts` | 14 new sound functions for Orange Juggle |
| `useGameHaptics.ts` | 10 new haptic patterns |
| `patterns.ts` | Orange Juggle pattern constants |
| `OrangeJuggle.tsx` | All visual effects, game loop integration |

---

## Total Enhancements: 62

| Phase | Count | Description |
|-------|-------|-------------|
| Sound Foundation | 14 | All audio feedback |
| Haptic Layer | 10 | All tactile feedback |
| Core Visual Juice | 10 | Squash, trails, particles, shake |
| Powerup & Collectible | 8 | Powerup animations and effects |
| Enemy & Hazard | 6 | Camel feedback and near-misses |
| Combo & Scoring | 7 | Combo meter, multipliers, animations |
| Anticipation & Polish | 7 | Predictions, transitions, game states |

---

*Reference: `docs/game-juice-playbook.md` for universal principles*
*Updated with learnings from: Memory Match, Brick Breaker, Orange Juggle*
