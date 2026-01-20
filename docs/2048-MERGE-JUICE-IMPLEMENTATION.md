# 2048 Merge Game - Juice Implementation Guide

> Transform the 2048 Citrus Edition into a premium, addictive, TikTok-worthy puzzle experience.

**Target File:** `src/games/Merge2048/Merge2048Game.tsx`
**CSS File:** `src/games/Merge2048/Merge2048Game.css`
**Total Tasks:** 145
**Estimated Time:** 8-12 hours

---

## Research Summary

This implementation is based on extensive research including:
- **Threes!** - The premium 2048 predecessor (tile personalities, animation polish)
- **Candy Crush** - Cascade systems, combo psychology
- **Tetris Effect** - Danger state music, flow state design
- **Wordle** - Viral share mechanics
- **Monument Valley** - Premium audio design
- **Game psychology research** - Dopamine loops, near-miss effects, variable reinforcement

---

## Table of Contents

1. [Phase 1: Sound Foundation](#phase-1-sound-foundation-tasks-1-18)
2. [Phase 2: Premium Haptics](#phase-2-premium-haptics-tasks-19-30)
3. [Phase 3: Tile Personality System](#phase-3-tile-personality-system-tasks-31-45)
4. [Phase 4: Visual Juice Effects](#phase-4-visual-juice-effects-tasks-46-65)
5. [Phase 5: Danger State System](#phase-5-danger-state-system-tasks-66-78)
6. [Phase 6: Fever Mode](#phase-6-fever-mode-tasks-79-92)
7. [Phase 7: Next Tile Preview](#phase-7-next-tile-preview-tasks-93-100)
8. [Phase 8: Combo Visualization](#phase-8-combo-visualization-tasks-101-110)
9. [Phase 9: Extra Features](#phase-9-extra-features-tasks-111-125)
10. [Phase 10: Viral Share System](#phase-10-viral-share-system-tasks-126-138)
11. [Phase 11: Dynamic Music System](#phase-11-dynamic-music-system-tasks-139-145)

---

## Phase 1: Sound Foundation (Tasks 1-18)

### Goal
Replace the current two-tier sound system with an ascending pitch system where each tile value has a progressively higher pitch, plus add missing sounds (spawn, slide).

### Research Insight
> "For merge sequences, sounds go UP in pitch on the scale AND grow bigger in instrumentation for longer sequences. This makes long combo chains feel super satisfying." - Midas Merge Sound Design

### Tasks

#### Task 1: Create Sound Configuration Object
```typescript
// Add to constants section
const MERGE_SOUND_CONFIG: Record<number, { pitch: number; volume: number; layers: number }> = {
  4:    { pitch: 0.8,  volume: 0.4, layers: 1 },  // Low, simple
  8:    { pitch: 0.85, volume: 0.45, layers: 1 },
  16:   { pitch: 0.9,  volume: 0.5, layers: 1 },
  32:   { pitch: 0.95, volume: 0.55, layers: 1 },
  64:   { pitch: 1.0,  volume: 0.6, layers: 1 },
  128:  { pitch: 1.05, volume: 0.65, layers: 2 }, // Add sparkle layer
  256:  { pitch: 1.1,  volume: 0.7, layers: 2 },
  512:  { pitch: 1.15, volume: 0.75, layers: 3 }, // Add bass hit
  1024: { pitch: 1.2,  volume: 0.8, layers: 3 },
  2048: { pitch: 1.3,  volume: 1.0, layers: 4 },  // Full celebration
};
```

#### Task 2: Create Pitch-Based Merge Sound Function
```typescript
const playMergeSound = useCallback((resultValue: number) => {
  const config = MERGE_SOUND_CONFIG[resultValue] || { pitch: 1.0, volume: 0.5, layers: 1 };

  // Base merge sound with pitch variation
  playWithPitch('merge_pop', config.pitch, config.volume);

  // Add sparkle layer for 128+
  if (config.layers >= 2) {
    setTimeout(() => playWithPitch('sparkle', config.pitch * 1.2, 0.3), 30);
  }

  // Add bass hit for 512+
  if (config.layers >= 3) {
    playWithPitch('bass_hit', config.pitch * 0.5, 0.4);
  }

  // Full celebration for 2048
  if (config.layers >= 4) {
    setTimeout(() => playWinSound(), 100);
  }
}, []);
```

#### Task 3: Add Tile Spawn Sound
```typescript
const playSpawnSound = useCallback(() => {
  // Soft "pop" when new tile appears
  playWithPitch('soft_pop', 1.0 + Math.random() * 0.1, 0.25);
}, []);
```

#### Task 4: Add Tile Slide Sound
```typescript
const playSlideSound = useCallback(() => {
  // Subtle whoosh when tiles move
  playWithPitch('whoosh', 0.9 + Math.random() * 0.2, 0.15);
}, []);
```

#### Task 5: Create Signature Chime Sound
```typescript
// Two-note ascending chime (A5 → E6) for milestones
const playSignatureChime = useCallback(() => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Note 1: A5 (880 Hz)
  const osc1 = audioContext.createOscillator();
  const gain1 = audioContext.createGain();
  osc1.frequency.value = 880;
  osc1.type = 'sine';
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  osc1.connect(gain1).connect(audioContext.destination);
  osc1.start(audioContext.currentTime);
  osc1.stop(audioContext.currentTime + 0.3);

  // Note 2: E6 (1318 Hz) - delayed
  setTimeout(() => {
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.frequency.value = 1318;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.35, audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    osc2.connect(gain2).connect(audioContext.destination);
    osc2.start(audioContext.currentTime);
    osc2.stop(audioContext.currentTime + 0.4);
  }, 100);
}, []);
```

#### Task 6: Define Milestone Values for Signature Sound
```typescript
const MILESTONE_VALUES = [128, 256, 512, 1024, 2048];
const milestonesReachedRef = useRef<Set<number>>(new Set());
```

#### Task 7: Trigger Signature Sound on First Milestone Reach
```typescript
// In move() function, after checking highestMerged
const checkMilestone = (highestMerged: number) => {
  if (MILESTONE_VALUES.includes(highestMerged) && !milestonesReachedRef.current.has(highestMerged)) {
    milestonesReachedRef.current.add(highestMerged);
    playSignatureChime();
  }
};
```

#### Task 8: Replace playPerfectBonus with playMergeSound
Update the move() function to use the new pitch-based system instead of `playPerfectBonus()`.

#### Task 9: Replace playCombo with Layered System
Remove the simple `playCombo()` call and use the layered system based on merge value.

#### Task 10: Add Spawn Sound to spawnTile
Call `playSpawnSound()` when a new tile is created after a move.

#### Task 11: Add Slide Sound to move()
Call `playSlideSound()` at the start of a valid move.

#### Task 12: Create Sound Variation Array
```typescript
const MERGE_SOUND_VARIANTS = ['merge_pop_1', 'merge_pop_2', 'merge_pop_3', 'merge_pop_4'];

const getRandomMergeSound = () => {
  return MERGE_SOUND_VARIANTS[Math.floor(Math.random() * MERGE_SOUND_VARIANTS.length)];
};
```

#### Task 13: Add Invalid Move Sound
```typescript
const playInvalidMove = useCallback(() => {
  // Soft "thud" when move doesn't change anything
  playWithPitch('soft_thud', 0.9, 0.2);
}, []);
```

#### Task 14: Trigger Invalid Move Sound
In move() when `moved === false`, play the invalid move sound.

#### Task 15: Add Danger State Sound
```typescript
const dangerLoopRef = useRef<Howl | null>(null);

const startDangerSound = useCallback(() => {
  if (dangerLoopRef.current) return;
  dangerLoopRef.current = new Howl({
    src: ['/sounds/heartbeat_loop.mp3'],
    loop: true,
    volume: 0,
  });
  dangerLoopRef.current.play();
  dangerLoopRef.current.fade(0, 0.3, 500);
}, []);

const stopDangerSound = useCallback(() => {
  if (dangerLoopRef.current) {
    dangerLoopRef.current.fade(0.3, 0, 300);
    setTimeout(() => {
      dangerLoopRef.current?.stop();
      dangerLoopRef.current = null;
    }, 300);
  }
}, []);
```

#### Task 16: Add Game Over Sound Enhancement
Enhance game over with a descending "sad" sound pattern.

#### Task 17: Add Undo Sound
```typescript
const playUndoSound = useCallback(() => {
  playWithPitch('rewind', 0.8, 0.4);
}, []);
```

#### Task 18: Reset Milestone Tracking on New Game
In `handleNewGame()`, clear `milestonesReachedRef.current`.

---

## Phase 2: Premium Haptics (Tasks 19-30)

### Goal
Replace the basic Vibration API with premium progressive haptic patterns that scale logarithmically with tile value.

### Research Insight
> "Haptic intensity should scale logarithmically rather than linearly, as human perception of vibration intensity follows a logarithmic curve." - Haptic Research

### Tasks

#### Task 19: Create Haptic Configuration
```typescript
const HAPTIC_CONFIG: Record<number, { intensity: number; duration: number; pattern: number[] }> = {
  4:    { intensity: 0.3, duration: 12, pattern: [12] },
  8:    { intensity: 0.4, duration: 15, pattern: [15] },
  16:   { intensity: 0.45, duration: 18, pattern: [18] },
  32:   { intensity: 0.5, duration: 20, pattern: [20] },
  64:   { intensity: 0.55, duration: 22, pattern: [22] },
  128:  { intensity: 0.6, duration: 25, pattern: [25] },
  256:  { intensity: 0.7, duration: 28, pattern: [15, 20, 25] }, // Double tap
  512:  { intensity: 0.8, duration: 32, pattern: [20, 15, 25, 15, 30] }, // Triple
  1024: { intensity: 0.9, duration: 38, pattern: [25, 20, 30, 20, 35] },
  2048: { intensity: 1.0, duration: 50, pattern: [30, 20, 35, 20, 40, 20, 50] }, // Celebration
};
```

#### Task 20: Create Premium Haptic Function
```typescript
const triggerMergeHaptic = useCallback((resultValue: number) => {
  const config = HAPTIC_CONFIG[resultValue] || { intensity: 0.5, duration: 20, pattern: [20] };

  if ('vibrate' in navigator) {
    navigator.vibrate(config.pattern);
  }
}, []);
```

#### Task 21: Add Swipe Start Haptic
```typescript
const triggerSwipeHaptic = useCallback(() => {
  // Ultra-light tick at start of swipe
  if ('vibrate' in navigator) {
    navigator.vibrate(5);
  }
}, []);
```

#### Task 22: Add Slide Haptic
```typescript
const triggerSlideHaptic = useCallback(() => {
  // Light haptic when tiles actually move
  if ('vibrate' in navigator) {
    navigator.vibrate(8);
  }
}, []);
```

#### Task 23: Add Error Haptic for Invalid Move
```typescript
const triggerErrorHaptic = useCallback(() => {
  // Double pulse for error
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 50, 10]);
  }
}, []);
```

#### Task 24: Add Win Celebration Haptic
```typescript
const triggerWinHaptic = useCallback(() => {
  // Rising intensity pattern
  if ('vibrate' in navigator) {
    navigator.vibrate([20, 30, 25, 30, 30, 30, 40, 30, 50]);
  }
}, []);
```

#### Task 25: Add Game Over Haptic
```typescript
const triggerGameOverHaptic = useCallback(() => {
  // Heavy descending pattern
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 100, 35, 150, 20]);
  }
}, []);
```

#### Task 26: Add Danger State Haptic
```typescript
const triggerDangerPulse = useCallback(() => {
  // Subtle recurring pulse during danger state
  if ('vibrate' in navigator) {
    navigator.vibrate(8);
  }
}, []);
```

#### Task 27: Replace triggerHaptic('light') with triggerSlideHaptic
Update all basic haptic calls to use appropriate premium patterns.

#### Task 28: Replace triggerHaptic('medium') with triggerMergeHaptic
Pass the merge result value to get appropriate haptic.

#### Task 29: Replace triggerHaptic('heavy') with Specific Functions
Use triggerWinHaptic for win, triggerGameOverHaptic for game over.

#### Task 30: Add Haptic to Touch Start
Call `triggerSwipeHaptic()` in `handleTouchStart`.

---

## Phase 3: Tile Personality System (Tasks 31-45)

### Goal
Add citrus fruit faces to tiles that create emotional attachment. Higher values get more elaborate faces. Tiles react to game state.

### Research Insight
> "The tile faces in Threes! 'make the game feel like something special - like playing with characters instead of just moving numbers around the board.'" - Threes! Analysis

### Tasks

#### Task 31: Create Face Configuration
```typescript
interface TileFace {
  eyes: string;      // CSS or emoji eyes
  mouth: string;     // CSS or emoji mouth
  expression: 'happy' | 'excited' | 'worried' | 'sleepy' | 'shocked';
  extras?: string;   // Additional features for high-value tiles
}

const TILE_FACES: Record<number, TileFace> = {
  2:    { eyes: '• •', mouth: '‿', expression: 'sleepy' },       // Seed - drowsy
  4:    { eyes: '◦ ◦', mouth: '‿', expression: 'happy' },        // Seedling - awake
  8:    { eyes: '° °', mouth: '◡', expression: 'happy' },        // Slice - content
  16:   { eyes: '◉ ◉', mouth: '◡', expression: 'happy' },        // Mandarin - alert
  32:   { eyes: '◉ ◉', mouth: '▽', expression: 'excited' },      // Blood orange - excited
  64:   { eyes: '★ ★', mouth: '▽', expression: 'excited' },      // Tangerine - starry
  128:  { eyes: '✧ ✧', mouth: '◇', expression: 'excited', extras: '✨' }, // Lemon - sparkly
  256:  { eyes: '◈ ◈', mouth: '○', expression: 'shocked', extras: '✨' }, // Grapefruit - wow
  512:  { eyes: '❋ ❋', mouth: '◇', expression: 'excited', extras: '🔥' }, // Pomelo - fire
  1024: { eyes: '☀ ☀', mouth: '◇', expression: 'excited', extras: '👑' }, // Golden - crowned
  2048: { eyes: '🌟 🌟', mouth: '◡◡', expression: 'happy', extras: '🍊👑' }, // THE ORANGE
};
```

#### Task 32: Create Face Renderer Component
```typescript
const TileFaceRenderer: React.FC<{ value: number; isNearMatch: boolean; isDanger: boolean }> = ({
  value,
  isNearMatch,
  isDanger,
}) => {
  const face = TILE_FACES[value] || TILE_FACES[2];

  // Modify expression based on game state
  let currentExpression = face.expression;
  if (isDanger) currentExpression = 'worried';
  if (isNearMatch) currentExpression = 'excited';

  return (
    <div className={`tile-face tile-face-${currentExpression}`}>
      <span className="tile-eyes">{face.eyes}</span>
      <span className="tile-mouth">{face.mouth}</span>
      {face.extras && <span className="tile-extras">{face.extras}</span>}
    </div>
  );
};
```

#### Task 33: Add CSS for Tile Faces
```css
.tile-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.4em;
  opacity: 0.9;
  pointer-events: none;
}

.tile-eyes {
  letter-spacing: 0.1em;
}

.tile-mouth {
  margin-top: -0.2em;
}

.tile-extras {
  position: absolute;
  top: -0.5em;
  right: -0.3em;
  font-size: 0.6em;
}

/* Expression animations */
.tile-face-excited .tile-eyes {
  animation: bounce 0.5s ease-in-out infinite;
}

.tile-face-worried .tile-eyes {
  animation: shake 0.3s ease-in-out infinite;
}

.tile-face-sleepy {
  opacity: 0.6;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}
```

#### Task 34: Track "Near Match" State
```typescript
const checkNearMatch = (tiles: Tile[], targetTile: Tile): boolean => {
  // Check if any adjacent tile has the same value
  const adjacent = tiles.filter(t =>
    (Math.abs(t.row - targetTile.row) === 1 && t.col === targetTile.col) ||
    (Math.abs(t.col - targetTile.col) === 1 && t.row === targetTile.row)
  );
  return adjacent.some(t => t.value === targetTile.value);
};
```

#### Task 35: Create Near Match Map
```typescript
const [nearMatchMap, setNearMatchMap] = useState<Record<number, boolean>>({});

useEffect(() => {
  const map: Record<number, boolean> = {};
  tiles.forEach(tile => {
    map[tile.id] = checkNearMatch(tiles, tile);
  });
  setNearMatchMap(map);
}, [tiles]);
```

#### Task 36: Track Danger State
```typescript
const [isDangerState, setIsDangerState] = useState(false);

useEffect(() => {
  const emptyCells = getEmptyCells(tiles);
  setIsDangerState(emptyCells.length <= 3);
}, [tiles]);
```

#### Task 37: Update renderTile to Include Face
```typescript
const renderTile = (tile: Tile) => {
  // ... existing code ...

  return (
    <div key={tile.id} className={classes} style={style}>
      <TileFaceRenderer
        value={tile.value}
        isNearMatch={nearMatchMap[tile.id]}
        isDanger={isDangerState}
      />
      <span className="tile-value">
        {tile.value}
      </span>
    </div>
  );
};
```

#### Task 38: Add "Hello" Animation for New Tiles
```css
.tile-new .tile-face {
  animation: hello 0.4s ease-out;
}

@keyframes hello {
  0% { transform: translate(-50%, -50%) scale(0); }
  60% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
```

#### Task 39: Add "Celebration" Animation for Merges
```css
.tile-merged .tile-face {
  animation: celebrate 0.3s ease-out;
}

@keyframes celebrate {
  0% { transform: translate(-50%, -50%) scale(1); }
  30% { transform: translate(-50%, -50%) scale(1.3) rotate(-5deg); }
  60% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
```

#### Task 40: Add Tile Bios (Unlockable)
```typescript
const TILE_BIOS: Record<number, { name: string; bio: string }> = {
  2:    { name: 'Seed', bio: 'A tiny citrus seed, full of potential!' },
  4:    { name: 'Sprout', bio: 'Just waking up to the world.' },
  8:    { name: 'Slice', bio: 'A fresh orange slice, ready to merge!' },
  16:   { name: 'Mandy', bio: 'Mandarin with big dreams.' },
  32:   { name: 'Ruby', bio: 'Blood orange with a fiery personality.' },
  64:   { name: 'Tang', bio: 'Tangerine who loves to party!' },
  128:  { name: 'Lemmy', bio: 'Lemon who brings the zest!' },
  256:  { name: 'Grape', bio: 'Grapefruit with serious goals.' },
  512:  { name: 'Pom', bio: 'Pomelo, the wise elder.' },
  1024: { name: 'Goldie', bio: 'Golden citrus royalty!' },
  2048: { name: 'THE ORANGE', bio: 'The legendary supreme citrus!' },
};
```

#### Task 41: Track Unlocked Bios
```typescript
const [unlockedBios, setUnlockedBios] = useState<Set<number>>(() => {
  const saved = localStorage.getItem('merge2048-unlocked-bios');
  return saved ? new Set(JSON.parse(saved)) : new Set([2, 4]);
});

// When reaching new tile value
const unlockBio = (value: number) => {
  setUnlockedBios(prev => {
    const newSet = new Set(prev);
    newSet.add(value);
    localStorage.setItem('merge2048-unlocked-bios', JSON.stringify([...newSet]));
    return newSet;
  });
};
```

#### Task 42: Create Character Gallery Modal
A modal that shows all discovered tile characters with their bios.

#### Task 43: Add Gallery Button to Header
Button to open the character gallery (shows locked/unlocked count).

#### Task 44: Remove TILE_EMOJIS Integration
Since faces replace emojis, clean up the emoji display from tiles.

#### Task 45: Add Face Toggle Setting
Allow players to disable faces if they prefer clean numbers:
```typescript
const [showFaces, setShowFaces] = useState(true);
```

---

## Phase 4: Visual Juice Effects (Tasks 46-65)

### Goal
Add premium visual effects: freeze frames, particle bursts, squash/stretch, slide trails, camera zoom pulses.

### Research Insight
> "The 'Juice It or Lose It' philosophy: A juicy game feels alive and responds to everything you do with cascading action and response for minimal user input." - GDC Talk

### Tasks

#### Task 46: Add Freeze Frame System
```typescript
const [freezeFrame, setFreezeFrame] = useState(false);
const freezeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const triggerFreezeFrame = useCallback((duration: number = 50) => {
  setFreezeFrame(true);
  if (freezeTimeoutRef.current) clearTimeout(freezeTimeoutRef.current);
  freezeTimeoutRef.current = setTimeout(() => setFreezeFrame(false), duration);
}, []);
```

#### Task 47: Integrate Freeze Frame into Move
```typescript
// After big merge detection
if (highestMerged >= BIG_MERGE_THRESHOLD) {
  triggerFreezeFrame(60); // 60ms pause for impact
}
```

#### Task 48: Add CSS for Freeze Frame
```css
.merge2048-grid-wrapper.freeze-frame .tiles-container {
  animation-play-state: paused;
}
```

#### Task 49: Create Particle Burst System
```typescript
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

const [particles, setParticles] = useState<Particle[]>([]);

const createParticleBurst = useCallback((x: number, y: number, color: string, count: number = 12) => {
  const newParticles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    newParticles.push({
      id: Date.now() + i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 3 + Math.random() * 5,
      color: i % 3 === 0 ? '#ffffff' : color,
      alpha: 1,
      life: 1,
    });
  }
  setParticles(prev => [...prev, ...newParticles]);
}, []);
```

#### Task 50: Create Particle Animation Loop
```typescript
useEffect(() => {
  if (particles.length === 0) return;

  const interval = setInterval(() => {
    setParticles(prev =>
      prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15, // gravity
          alpha: p.alpha - 0.03,
          life: p.life - 0.03,
        }))
        .filter(p => p.life > 0)
    );
  }, 16);

  return () => clearInterval(interval);
}, [particles.length > 0]);
```

#### Task 51: Create Particle Renderer
```typescript
const ParticleLayer: React.FC<{ particles: Particle[] }> = ({ particles }) => (
  <div className="particle-layer">
    {particles.map(p => (
      <div
        key={p.id}
        className="particle"
        style={{
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          opacity: p.alpha,
        }}
      />
    ))}
  </div>
);
```

#### Task 52: Add Particle CSS
```css
.particle-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
```

#### Task 53: Trigger Particles on Merge
Get tile position and create particle burst at that location.

#### Task 54: Add Squash/Stretch to Tile Animations
```css
.tile {
  transition:
    top 150ms ease-in-out,
    left 150ms ease-in-out,
    transform 150ms ease-out;
}

/* Stretch in direction of movement */
.tile-moving-left,
.tile-moving-right {
  transform: scaleX(1.15) scaleY(0.9);
}

.tile-moving-up,
.tile-moving-down {
  transform: scaleX(0.9) scaleY(1.15);
}

/* Squash on merge impact */
.tile-merged {
  animation: squashMerge 200ms ease-out;
}

@keyframes squashMerge {
  0% { transform: scale(0.8, 1.2); }
  40% { transform: scale(1.25, 0.85); }
  70% { transform: scale(0.95, 1.05); }
  100% { transform: scale(1, 1); }
}
```

#### Task 55: Track Movement Direction for Squash
```typescript
const [lastMoveDirection, setLastMoveDirection] = useState<Direction | null>(null);

// In move()
setLastMoveDirection(direction);
```

#### Task 56: Apply Movement Direction Class to Tiles
Add conditional class based on `lastMoveDirection`.

#### Task 57: Add Tile Slide Trails
```css
.tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  opacity: 0;
  transform: scaleX(0.8);
  transition: opacity 100ms, transform 100ms;
}

.tile-moving-left::before,
.tile-moving-right::before {
  opacity: 0.3;
  transform: scaleX(1.3);
}

.tile-moving-up::before,
.tile-moving-down::before {
  opacity: 0.3;
  transform: scaleY(1.3);
}
```

#### Task 58: Add Camera Zoom Pulse
```typescript
const [cameraZoom, setCameraZoom] = useState(1);

const triggerCameraZoom = useCallback((intensity: number = 1.03) => {
  setCameraZoom(intensity);
  setTimeout(() => setCameraZoom(1), 150);
}, []);
```

#### Task 59: Apply Camera Zoom to Grid
```typescript
<div
  className="merge2048-grid-wrapper"
  style={{ transform: `scale(${cameraZoom})` }}
>
```

#### Task 60: Add CSS for Smooth Zoom
```css
.merge2048-grid-wrapper {
  transition: transform 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

#### Task 61: Trigger Camera Zoom on Big Merges
```typescript
if (highestMerged >= 256) {
  triggerCameraZoom(1.05);
}
if (highestMerged >= 512) {
  triggerCameraZoom(1.08);
}
```

#### Task 62: Add Impact Flash Effect
```typescript
const [impactFlash, setImpactFlash] = useState<{ x: number; y: number } | null>(null);

const triggerImpactFlash = useCallback((x: number, y: number) => {
  setImpactFlash({ x, y });
  setTimeout(() => setImpactFlash(null), 200);
}, []);
```

#### Task 63: Create Impact Flash Component
```typescript
{impactFlash && (
  <div
    className="impact-flash"
    style={{ left: impactFlash.x, top: impactFlash.y }}
  />
)}
```

#### Task 64: Add Impact Flash CSS
```css
.impact-flash {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
  transform: translate(-50%, -50%);
  animation: flashExpand 200ms ease-out forwards;
  pointer-events: none;
}

@keyframes flashExpand {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}
```

#### Task 65: Enhanced Score Popup Animation
```css
.score-popup {
  animation: scoreFloat 800ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

@keyframes scoreFloat {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -70%) scale(1.3);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -150%) scale(1);
    opacity: 0;
  }
}
```

---

## Phase 5: Danger State System (Tasks 66-78)

### Goal
Create a full danger warning system when the board is 80%+ full: visual warnings, audio changes, and haptic pulses.

### Research Insight
> "The Tetris danger music mechanic creates 'sheer panic' through music speed-up, color shifts, and pulsing effects when blocks approach the top." - Tetris Analysis

### Tasks

#### Task 66: Define Danger Thresholds
```typescript
const DANGER_THRESHOLDS = {
  warning: 4,   // 4 or fewer empty cells
  critical: 2,  // 2 or fewer empty cells
  imminent: 1,  // Only 1 empty cell
};
```

#### Task 67: Create Danger Level State
```typescript
type DangerLevel = 'safe' | 'warning' | 'critical' | 'imminent';
const [dangerLevel, setDangerLevel] = useState<DangerLevel>('safe');

useEffect(() => {
  const emptyCells = getEmptyCells(tiles).length;
  if (emptyCells <= DANGER_THRESHOLDS.imminent) {
    setDangerLevel('imminent');
  } else if (emptyCells <= DANGER_THRESHOLDS.critical) {
    setDangerLevel('critical');
  } else if (emptyCells <= DANGER_THRESHOLDS.warning) {
    setDangerLevel('warning');
  } else {
    setDangerLevel('safe');
  }
}, [tiles]);
```

#### Task 68: Add Visual Danger Indicators
```css
.merge2048-grid-wrapper.danger-warning {
  box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.3);
  animation: warningPulse 1.5s ease-in-out infinite;
}

.merge2048-grid-wrapper.danger-critical {
  box-shadow: inset 0 0 30px rgba(255, 100, 0, 0.4);
  animation: criticalPulse 1s ease-in-out infinite;
}

.merge2048-grid-wrapper.danger-imminent {
  box-shadow: inset 0 0 40px rgba(255, 50, 0, 0.5);
  animation: imminentPulse 0.5s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% { box-shadow: inset 0 0 20px rgba(255, 165, 0, 0.3); }
  50% { box-shadow: inset 0 0 30px rgba(255, 165, 0, 0.5); }
}

@keyframes criticalPulse {
  0%, 100% { box-shadow: inset 0 0 30px rgba(255, 100, 0, 0.4); }
  50% { box-shadow: inset 0 0 45px rgba(255, 100, 0, 0.6); }
}

@keyframes imminentPulse {
  0%, 100% { box-shadow: inset 0 0 40px rgba(255, 50, 0, 0.5); }
  50% { box-shadow: inset 0 0 60px rgba(255, 50, 0, 0.7); }
}
```

#### Task 69: Add Vignette Effect for Danger
```css
.merge2048-grid-wrapper.danger-critical::after,
.merge2048-grid-wrapper.danger-imminent::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(255, 50, 0, 0.15) 100%
  );
}
```

#### Task 70: Highlight Empty Cells in Danger State
```typescript
const renderGridBackground = () => {
  const cells = [];
  const emptyCells = getEmptyCells(tiles);
  const emptySet = new Set(emptyCells.map(c => `${c.row}-${c.col}`));

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isEmpty = emptySet.has(`${row}-${col}`);
      const isHighlighted = dangerLevel !== 'safe' && isEmpty;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`grid-cell ${isHighlighted ? 'cell-highlighted' : ''}`}
        />
      );
    }
  }
  return cells;
};
```

#### Task 71: Add Empty Cell Highlight CSS
```css
.grid-cell.cell-highlighted {
  background: rgba(255, 215, 0, 0.3);
  animation: cellGlow 1s ease-in-out infinite;
}

@keyframes cellGlow {
  0%, 100% { background: rgba(255, 215, 0, 0.2); }
  50% { background: rgba(255, 215, 0, 0.4); }
}
```

#### Task 72: Start Danger Sound on Threshold
```typescript
useEffect(() => {
  if (dangerLevel === 'warning' || dangerLevel === 'critical' || dangerLevel === 'imminent') {
    startDangerSound();
  } else {
    stopDangerSound();
  }
}, [dangerLevel, startDangerSound, stopDangerSound]);
```

#### Task 73: Increase Heartbeat Tempo with Danger Level
```typescript
const getDangerSoundRate = (level: DangerLevel): number => {
  switch (level) {
    case 'warning': return 1.0;
    case 'critical': return 1.3;
    case 'imminent': return 1.6;
    default: return 1.0;
  }
};

// Update heartbeat rate when danger level changes
useEffect(() => {
  if (dangerLoopRef.current) {
    dangerLoopRef.current.rate(getDangerSoundRate(dangerLevel));
  }
}, [dangerLevel]);
```

#### Task 74: Add Periodic Danger Haptic
```typescript
useEffect(() => {
  if (dangerLevel === 'safe') return;

  const interval = setInterval(() => {
    triggerDangerPulse();
  }, dangerLevel === 'imminent' ? 500 : dangerLevel === 'critical' ? 1000 : 2000);

  return () => clearInterval(interval);
}, [dangerLevel, triggerDangerPulse]);
```

#### Task 75: Add "No Moves Possible" Check
```typescript
const checkPossibleMerges = (tiles: Tile[]): boolean => {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return true;

  const grid = tilesToGrid(tiles);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col];
      if (!current) return true;
      // Check right
      if (col < GRID_SIZE - 1 && grid[row][col + 1]?.value === current.value) return true;
      // Check down
      if (row < GRID_SIZE - 1 && grid[row + 1][col]?.value === current.value) return true;
    }
  }
  return false;
};
```

#### Task 76: Show "No Moves Warning" Toast
When board is full but merges are still possible, show a toast message.

#### Task 77: Add Danger Level to Grid Wrapper Class
```typescript
<div
  className={`merge2048-grid-wrapper ${
    dangerLevel !== 'safe' ? `danger-${dangerLevel}` : ''
  }`}
>
```

#### Task 78: Clean Up Danger State on New Game
```typescript
// In handleNewGame()
setDangerLevel('safe');
stopDangerSound();
```

---

## Phase 6: Fever Mode (Tasks 79-92)

### Goal
After 5+ consecutive merges without pause, activate Fever Mode with 2x score multiplier, fire visuals, and driving music.

### Research Insight
> "Fever Mode activation at 15+ streak with 2x multiplier, fire visuals, driving bass audio creates the most addictive 'just one more game' loop." - Color Reaction Research

### Tasks

#### Task 79: Define Fever Mode State
```typescript
interface FeverState {
  active: boolean;
  multiplier: number;
  intensity: number;
  startTime: number;
}

const [feverState, setFeverState] = useState<FeverState>({
  active: false,
  multiplier: 1,
  intensity: 0,
  startTime: 0,
});
```

#### Task 80: Create Fever Mode Configuration
```typescript
const FEVER_CONFIG = {
  activationThreshold: 5,    // Merges needed to activate
  scoreMultiplier: 2,        // 2x score during fever
  minDuration: 3000,         // Minimum fever duration
  cooldownAfterNoMerge: 2000, // Time before fever deactivates
};
```

#### Task 81: Track Consecutive Merges
```typescript
const consecutiveMergesRef = useRef(0);
const lastMergeTimeRef = useRef(0);

// Reset if too much time between merges
useEffect(() => {
  const checkCooldown = setInterval(() => {
    if (Date.now() - lastMergeTimeRef.current > FEVER_CONFIG.cooldownAfterNoMerge) {
      if (feverState.active) {
        deactivateFeverMode();
      }
      consecutiveMergesRef.current = 0;
    }
  }, 500);

  return () => clearInterval(checkCooldown);
}, [feverState.active]);
```

#### Task 82: Create Fever Activation Function
```typescript
const activateFeverMode = useCallback(() => {
  setFeverState({
    active: true,
    multiplier: FEVER_CONFIG.scoreMultiplier,
    intensity: 1,
    startTime: Date.now(),
  });
  playFeverActivation();
  triggerConfetti();
  showEpicCallout('FEVER MODE!');
}, []);

const deactivateFeverMode = useCallback(() => {
  setFeverState({
    active: false,
    multiplier: 1,
    intensity: 0,
    startTime: 0,
  });
  playFeverDeactivation();
}, []);
```

#### Task 83: Trigger Fever on Consecutive Merges
```typescript
// In move() after a successful merge
consecutiveMergesRef.current++;
lastMergeTimeRef.current = Date.now();

if (!feverState.active && consecutiveMergesRef.current >= FEVER_CONFIG.activationThreshold) {
  activateFeverMode();
}
```

#### Task 84: Apply Score Multiplier in Fever Mode
```typescript
const calculateFinalScore = (baseScore: number): number => {
  return Math.floor(baseScore * feverState.multiplier);
};

// Update score calculation to use this
if (totalScoreGained > 0) {
  const finalScore = calculateFinalScore(totalScoreGained);
  setScore(prev => prev + finalScore);
  showScorePopup(finalScore);
}
```

#### Task 85: Add Fever Mode Visuals
```css
.merge2048-grid-wrapper.fever-active {
  background: linear-gradient(135deg, #ff8c00 0%, #ff4500 50%, #ff6347 100%);
  animation: feverGlow 0.5s ease-in-out infinite alternate;
}

@keyframes feverGlow {
  0% { box-shadow: 0 0 20px rgba(255, 100, 0, 0.5), inset 0 0 20px rgba(255, 200, 0, 0.2); }
  100% { box-shadow: 0 0 40px rgba(255, 100, 0, 0.8), inset 0 0 30px rgba(255, 200, 0, 0.4); }
}
```

#### Task 86: Add Fever Tiles Border Effect
```css
.fever-active .tile {
  border: 2px solid rgba(255, 215, 0, 0.6);
  box-shadow: 0 0 10px rgba(255, 140, 0, 0.5);
}
```

#### Task 87: Create Fever Meter UI
```typescript
const FeverMeter: React.FC<{ consecutiveMerges: number; isActive: boolean }> = ({
  consecutiveMerges,
  isActive,
}) => {
  const fillPercent = isActive
    ? 100
    : (consecutiveMerges / FEVER_CONFIG.activationThreshold) * 100;

  return (
    <div className={`fever-meter ${isActive ? 'fever-active' : ''}`}>
      <div className="fever-meter-fill" style={{ width: `${fillPercent}%` }} />
      <span className="fever-meter-label">
        {isActive ? '🔥 FEVER! 2x' : `${consecutiveMerges}/${FEVER_CONFIG.activationThreshold}`}
      </span>
    </div>
  );
};
```

#### Task 88: Add Fever Meter CSS
```css
.fever-meter {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
}

.fever-meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ff4500);
  border-radius: 12px;
  transition: width 200ms ease-out;
}

.fever-meter.fever-active .fever-meter-fill {
  animation: feverPulse 0.5s ease-in-out infinite alternate;
}

.fever-meter-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

@keyframes feverPulse {
  0% { filter: brightness(1); }
  100% { filter: brightness(1.3); }
}
```

#### Task 89: Add Fever Sound Effect
```typescript
const playFeverActivation = useCallback(() => {
  // Ascending whoosh + impact
  playWithPitch('fever_activate', 1.0, 0.7);
}, []);

const playFeverDeactivation = useCallback(() => {
  // Descending whoosh
  playWithPitch('fever_deactivate', 0.8, 0.5);
}, []);
```

#### Task 90: Start Fever Music Layer
```typescript
const feverMusicRef = useRef<Howl | null>(null);

useEffect(() => {
  if (feverState.active && !feverMusicRef.current) {
    feverMusicRef.current = new Howl({
      src: ['/sounds/fever_loop.mp3'],
      loop: true,
      volume: 0,
    });
    feverMusicRef.current.play();
    feverMusicRef.current.fade(0, 0.4, 500);
  } else if (!feverState.active && feverMusicRef.current) {
    feverMusicRef.current.fade(0.4, 0, 500);
    setTimeout(() => {
      feverMusicRef.current?.stop();
      feverMusicRef.current = null;
    }, 500);
  }
}, [feverState.active]);
```

#### Task 91: Add Fire Particles During Fever
```typescript
useEffect(() => {
  if (!feverState.active) return;

  const interval = setInterval(() => {
    // Random fire particle from bottom
    const x = Math.random() * gridWidth;
    createParticleBurst(x, gridHeight, '#ff4500', 3);
  }, 200);

  return () => clearInterval(interval);
}, [feverState.active]);
```

#### Task 92: Reset Fever State on New Game
```typescript
// In handleNewGame()
setFeverState({ active: false, multiplier: 1, intensity: 0, startTime: 0 });
consecutiveMergesRef.current = 0;
```

---

## Phase 7: Next Tile Preview (Tasks 93-100)

### Goal
Show the next 1-2 tiles that will spawn, adding strategy depth like Threes!

### Research Insight
> "The 'peek' mechanic in Threes! shows what's coming next, adding strategy and anticipation. Players can plan one move ahead." - Threes! Analysis

### Tasks

#### Task 93: Create Next Tile Queue State
```typescript
const [nextTileQueue, setNextTileQueue] = useState<number[]>([]);

// Generate queue of next tiles
const generateNextTile = (): number => {
  return Math.random() < 0.9 ? 2 : 4;
};
```

#### Task 94: Initialize Next Tile Queue
```typescript
// In handleNewGame() and initGame()
const initNextTileQueue = () => {
  setNextTileQueue([generateNextTile(), generateNextTile()]);
};
```

#### Task 95: Use Queue When Spawning
```typescript
const spawnTileFromQueue = (tiles: Tile[], nextId: number): Tile | null => {
  const emptyCells = getEmptyCells(tiles);
  if (emptyCells.length === 0) return null;

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = nextTileQueue[0]; // Use first in queue

  // Shift queue and add new tile
  setNextTileQueue(prev => [...prev.slice(1), generateNextTile()]);

  return {
    id: nextId,
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true,
  };
};
```

#### Task 96: Create Next Tile Preview UI
```typescript
const NextTilePreview: React.FC<{ queue: number[] }> = ({ queue }) => (
  <div className="next-tile-preview">
    <span className="preview-label">NEXT</span>
    <div className="preview-tiles">
      {queue.map((value, i) => (
        <div
          key={i}
          className={`preview-tile preview-tile-${i}`}
          style={getTileStyle(value)}
        >
          {TILE_FACES[value] && (
            <TileFaceRenderer value={value} isNearMatch={false} isDanger={false} />
          )}
          <span className="preview-value">{value}</span>
        </div>
      ))}
    </div>
  </div>
);
```

#### Task 97: Add Next Tile Preview CSS
```css
.next-tile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.preview-label {
  font-size: 10px;
  font-weight: bold;
  color: #776e65;
  text-transform: uppercase;
}

.preview-tiles {
  display: flex;
  gap: 4px;
}

.preview-tile {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  position: relative;
}

.preview-tile-1 {
  opacity: 0.5;
  transform: scale(0.8);
}
```

#### Task 98: Place Preview in Header
Add the `NextTilePreview` component next to the score boxes.

#### Task 99: Add Preview Toggle Setting
```typescript
const [showPreview, setShowPreview] = useState(true);

// Add toggle in settings
```

#### Task 100: Animate Preview on Queue Change
```css
.preview-tile {
  animation: previewPop 200ms ease-out;
}

@keyframes previewPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.preview-tile-1 {
  animation: previewSlide 200ms ease-out;
}

@keyframes previewSlide {
  0% { transform: translateX(20px) scale(0.8); opacity: 0; }
  100% { transform: translateX(0) scale(0.8); opacity: 0.5; }
}
```

---

## Phase 8: Combo Visualization (Tasks 101-110)

### Goal
Make the combo system visible with a combo meter, streak counter, and escalating visual/audio feedback.

### Research Insight
> "Cascades in Candy Crush create satisfaction through visual spectacle, audio escalation, and minimal input for maximum output." - Match-3 Psychology

### Tasks

#### Task 101: Create Combo State
```typescript
interface ComboState {
  count: number;
  lastMergeTime: number;
  isActive: boolean;
}

const [comboState, setComboState] = useState<ComboState>({
  count: 0,
  lastMergeTime: 0,
  isActive: false,
});
```

#### Task 102: Define Combo Timeout
```typescript
const COMBO_TIMEOUT = 1500; // 1.5 seconds between merges to maintain combo
```

#### Task 103: Update Combo on Merge
```typescript
const incrementCombo = useCallback(() => {
  const now = Date.now();
  setComboState(prev => {
    const timeSinceLastMerge = now - prev.lastMergeTime;

    if (timeSinceLastMerge > COMBO_TIMEOUT) {
      // Combo broken, start fresh
      return { count: 1, lastMergeTime: now, isActive: true };
    }

    // Continue combo
    return { count: prev.count + 1, lastMergeTime: now, isActive: true };
  });
}, []);
```

#### Task 104: Reset Combo After Timeout
```typescript
useEffect(() => {
  const checkTimeout = setInterval(() => {
    if (comboState.isActive && Date.now() - comboState.lastMergeTime > COMBO_TIMEOUT) {
      if (comboState.count >= 3) {
        // Play combo break sound
        playComboBreak(comboState.count);
      }
      setComboState({ count: 0, lastMergeTime: 0, isActive: false });
    }
  }, 200);

  return () => clearInterval(checkTimeout);
}, [comboState]);
```

#### Task 105: Create Combo Display Component
```typescript
const ComboDisplay: React.FC<{ count: number; isActive: boolean }> = ({ count, isActive }) => {
  if (!isActive || count < 2) return null;

  const getComboColor = () => {
    if (count >= 10) return '#ff00ff';
    if (count >= 7) return '#ff4500';
    if (count >= 5) return '#ffd700';
    if (count >= 3) return '#ff8c00';
    return '#ffffff';
  };

  return (
    <div
      className={`combo-display combo-${Math.min(count, 10)}`}
      style={{ color: getComboColor() }}
    >
      <span className="combo-count">{count}x</span>
      <span className="combo-label">COMBO!</span>
    </div>
  );
};
```

#### Task 106: Add Combo Display CSS
```css
.combo-display {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  animation: comboAppear 300ms ease-out;
  z-index: 100;
}

.combo-count {
  font-size: 32px;
  line-height: 1;
}

.combo-label {
  font-size: 12px;
  text-transform: uppercase;
}

@keyframes comboAppear {
  0% { transform: translateX(-50%) scale(0.5); opacity: 0; }
  50% { transform: translateX(-50%) scale(1.2); }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

/* Scale up with combo */
.combo-3 { font-size: 1em; }
.combo-5 { font-size: 1.2em; }
.combo-7 { font-size: 1.4em; }
.combo-10 { font-size: 1.6em; animation: comboAppear 300ms ease-out, comboPulse 0.5s infinite; }

@keyframes comboPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}
```

#### Task 107: Add Combo Timeout Bar
```typescript
const ComboTimeoutBar: React.FC<{ lastMergeTime: number; isActive: boolean }> = ({
  lastMergeTime,
  isActive,
}) => {
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(100);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastMergeTime;
      const remaining = Math.max(0, 100 - (elapsed / COMBO_TIMEOUT) * 100);
      setTimeLeft(remaining);
    }, 16);

    return () => clearInterval(interval);
  }, [lastMergeTime, isActive]);

  if (!isActive) return null;

  return (
    <div className="combo-timeout-bar">
      <div className="combo-timeout-fill" style={{ width: `${timeLeft}%` }} />
    </div>
  );
};
```

#### Task 108: Add Combo Timeout Bar CSS
```css
.combo-timeout-bar {
  width: 80px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.combo-timeout-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ffd700);
  transition: width 50ms linear;
}
```

#### Task 109: Escalate Sound Pitch with Combo
```typescript
const getComboSoundPitch = (combo: number): number => {
  // Escalating pitch: C4, D4, E4, F4, G4, A4, B4, C5...
  const baseNote = 261.63; // C4
  const semitones = Math.min(combo - 1, 12);
  return Math.pow(2, semitones / 12);
};

// In playMergeSound, multiply pitch by combo factor
const comboPitchFactor = comboState.count >= 2 ? getComboSoundPitch(comboState.count) / 261.63 : 1;
```

#### Task 110: Add Combo Break Sound
```typescript
const playComboBreak = useCallback((lostCount: number) => {
  if (lostCount >= 5) {
    playWithPitch('combo_break_big', 0.8, 0.5);
    triggerVignetteFlash('#ff0000', 0.2);
  } else if (lostCount >= 3) {
    playWithPitch('combo_break_small', 0.9, 0.3);
  }
}, []);
```

---

## Phase 9: Extra Features (Tasks 111-125)

### Goal
Add undo button, move preview, animated score counter, and milestone confetti.

### Research Insight
> "The Threes! 'peek before commit' system lets players preview moves, reducing anxiety about mistakes." - Threes! Analysis

### Tasks

#### Task 111: Create Undo System State
```typescript
interface UndoState {
  tiles: Tile[];
  score: number;
  available: boolean;
}

const [undoState, setUndoState] = useState<UndoState | null>(null);
const [undoUsed, setUndoUsed] = useState(false);
```

#### Task 112: Save State Before Each Move
```typescript
// At the start of move() before any changes
const saveStateForUndo = () => {
  if (!undoUsed) {
    setUndoState({
      tiles: JSON.parse(JSON.stringify(tiles)),
      score: score,
      available: true,
    });
  }
};
```

#### Task 113: Create Undo Function
```typescript
const handleUndo = useCallback(() => {
  if (!undoState?.available || undoUsed) return;

  setTiles(undoState.tiles);
  setScore(undoState.score);
  setUndoUsed(true);
  setUndoState(null);
  playUndoSound();
}, [undoState, undoUsed]);
```

#### Task 114: Add Undo Button to UI
```typescript
<button
  className={`undo-btn ${undoUsed ? 'disabled' : ''}`}
  onClick={handleUndo}
  disabled={undoUsed || !undoState?.available}
>
  ↩️ Undo
</button>
```

#### Task 115: Add Undo Button CSS
```css
.undo-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background: #8f7a66;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 200ms;
}

.undo-btn:hover:not(.disabled) {
  background: #9f8a76;
  transform: scale(1.05);
}

.undo-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

#### Task 116: Reset Undo on New Game
```typescript
// In handleNewGame()
setUndoState(null);
setUndoUsed(false);
```

#### Task 117: Create Animated Score Counter
```typescript
const AnimatedScore: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    const animate = () => {
      setDisplayValue(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 1) return targetRef.current;
        return prev + diff * 0.2; // Ease toward target
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [value]);

  return <span className="score-value">{Math.floor(displayValue)}</span>;
};
```

#### Task 118: Replace Score Display with AnimatedScore
```typescript
<div className="score-box">
  <span className="score-label">SCORE</span>
  <AnimatedScore value={score} />
</div>
```

#### Task 119: Add Score Counting Sound
```typescript
// Play soft tick during score counting
useEffect(() => {
  if (Math.abs(displayValue - value) > 1) {
    playScoreTick();
  }
}, [displayValue]);
```

#### Task 120: Add Milestone Confetti Triggers
```typescript
const CONFETTI_MILESTONES = [128, 256, 512, 1024, 2048];

// In move() when checking for milestones
if (CONFETTI_MILESTONES.includes(highestMerged) && !milestonesReachedRef.current.has(highestMerged)) {
  triggerConfetti();
}
```

#### Task 121: Create Move Preview System
```typescript
const [previewState, setPreviewState] = useState<{
  active: boolean;
  direction: Direction | null;
  resultTiles: Tile[];
} | null>(null);

const showMovePreview = useCallback((direction: Direction) => {
  // Calculate what would happen without committing
  const previewTiles = simulateMove(tiles, direction);
  setPreviewState({ active: true, direction, resultTiles: previewTiles });
}, [tiles]);

const hideMovePreview = useCallback(() => {
  setPreviewState(null);
}, []);
```

#### Task 122: Add Touch Hold for Preview
```typescript
const touchHoldRef = useRef<NodeJS.Timeout | null>(null);

const handleTouchStart = useCallback((e: React.TouchEvent) => {
  const touch = e.touches[0];
  touchStartRef.current = { x: touch.clientX, y: touch.clientY };

  // Start hold timer for preview
  touchHoldRef.current = setTimeout(() => {
    // If still holding, show preview
    const direction = getSwipeDirection(touchStartRef.current, { x: touch.clientX, y: touch.clientY });
    if (direction) showMovePreview(direction);
  }, 300);
}, [showMovePreview]);

const handleTouchEnd = useCallback((e: React.TouchEvent) => {
  if (touchHoldRef.current) {
    clearTimeout(touchHoldRef.current);
    touchHoldRef.current = null;
  }
  hideMovePreview();
  // ... existing swipe logic
}, [hideMovePreview]);
```

#### Task 123: Render Preview Overlay
```typescript
{previewState?.active && (
  <div className="move-preview-overlay">
    {previewState.resultTiles.map(tile => (
      <div
        key={tile.id}
        className="preview-ghost-tile"
        style={{
          ...getTileStyle(tile.value),
          '--tile-row': tile.row,
          '--tile-col': tile.col,
        } as React.CSSProperties}
      >
        {tile.value}
      </div>
    ))}
  </div>
)}
```

#### Task 124: Add Preview CSS
```css
.move-preview-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.preview-ghost-tile {
  position: absolute;
  opacity: 0.5;
  transform: translate(-50%, -50%);
  border: 2px dashed rgba(255,255,255,0.5);
}
```

#### Task 125: Add Settings Panel
Create a settings panel with toggles for: faces on/off, preview on/off, haptics on/off.

---

## Phase 10: Viral Share System (Tasks 126-138)

### Goal
Create a share system with canvas-generated images and challenge links, inspired by Wordle's viral success.

### Research Insight
> "Wordle's emoji-based results format grew from 90 players to 2+ million in two months. The format enables both bragging and spoiler-free sharing." - Wordle Viral Analysis

### Tasks

#### Task 126: Create Share Image Generator Function
```typescript
const generateShareImage = async (
  finalScore: number,
  highestTile: number,
  movesCount: number,
): Promise<string> => {
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

  // Title
  ctx.fillStyle = '#ff6b00';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('2048 Citrus Edition', 300, 60);

  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(finalScore.toLocaleString(), 300, 160);
  ctx.font = '24px Arial';
  ctx.fillText('SCORE', 300, 195);

  // Highest tile
  const tileColor = TILE_COLORS[highestTile]?.background || '#ff6b00';
  ctx.fillStyle = tileColor;
  ctx.fillRect(225, 220, 150, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.fillText(highestTile.toString(), 300, 275);
  ctx.font = '16px Arial';
  ctx.fillText('HIGHEST TILE', 300, 320);

  // Branding
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Arial';
  ctx.fillText('Play at wojak.ink', 300, 380);

  return canvas.toDataURL('image/png');
};
```

#### Task 127: Create Share Modal Component
```typescript
const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  score: number;
  highestTile: number;
}> = ({ isOpen, onClose, score, highestTile }) => {
  const [shareImage, setShareImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateShareImage(score, highestTile, 0).then(setShareImage);
    }
  }, [isOpen, score, highestTile]);

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <h2>Share Your Score!</h2>
        {shareImage && <img src={shareImage} alt="Share preview" />}
        <div className="share-buttons">
          <button onClick={() => handleNativeShare(shareImage, score)}>
            📤 Share
          </button>
          <button onClick={() => handleCopyLink(score, highestTile)}>
            🔗 Copy Link
          </button>
          <button onClick={() => downloadImage(shareImage)}>
            💾 Save Image
          </button>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};
```

#### Task 128: Implement Native Share API
```typescript
const handleNativeShare = async (imageUrl: string | null, score: number) => {
  const shareData = {
    title: '2048 Citrus Edition',
    text: `I scored ${score.toLocaleString()} in 2048 Citrus Edition! Can you beat it?`,
    url: `https://wojak.ink/games/2048-merge?challenge=${encodeScore(score)}`,
  };

  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled or error
    }
  } else {
    // Fallback to copy
    handleCopyLink(score, 0);
  }
};
```

#### Task 129: Create Challenge Link System
```typescript
const encodeScore = (score: number): string => {
  return btoa(`${score}-${Date.now()}`);
};

const decodeChallenge = (encoded: string): { score: number; timestamp: number } | null => {
  try {
    const decoded = atob(encoded);
    const [score, timestamp] = decoded.split('-').map(Number);
    return { score, timestamp };
  } catch {
    return null;
  }
};
```

#### Task 130: Check for Challenge on Load
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challenge = params.get('challenge');

  if (challenge) {
    const decoded = decodeChallenge(challenge);
    if (decoded) {
      setChallengeTarget(decoded.score);
      showToast(`Challenge: Beat ${decoded.score.toLocaleString()} points!`);
    }
  }
}, []);
```

#### Task 131: Add Challenge Target Display
```typescript
{challengeTarget && (
  <div className="challenge-target">
    <span className="challenge-label">BEAT</span>
    <span className="challenge-score">{challengeTarget.toLocaleString()}</span>
  </div>
)}
```

#### Task 132: Celebrate Challenge Victory
```typescript
useEffect(() => {
  if (challengeTarget && score > challengeTarget) {
    triggerConfetti();
    showEpicCallout('CHALLENGE BEATEN!');
    playWinSound();
    setChallengeBeaten(true);
  }
}, [score, challengeTarget]);
```

#### Task 133: Add Share Modal CSS
```css
.share-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-modal {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 24px;
  max-width: 90vw;
  text-align: center;
}

.share-modal img {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
}

.share-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.share-buttons button {
  padding: 12px 24px;
  border-radius: 8px;
  background: #ff6b00;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 200ms;
}

.share-buttons button:hover {
  background: #ff8533;
  transform: scale(1.05);
}
```

#### Task 134: Add Share Button to Game Over Screen
```typescript
{isGameOver && (
  <div className="game-overlay game-over">
    <h2>Game Over!</h2>
    <p>Final Score: {score}</p>
    <button className="overlay-btn" onClick={() => setShowShareModal(true)}>
      📤 Share Score
    </button>
    <button className="overlay-btn secondary" onClick={handleNewGame}>
      Try Again
    </button>
  </div>
)}
```

#### Task 135: Create Text-Based Share (Wordle Style)
```typescript
const generateTextShare = (score: number, highestTile: number): string => {
  const tileEmoji = highestTile >= 2048 ? '🍊' : highestTile >= 512 ? '🔥' : '✨';
  return `2048 Citrus Edition ${tileEmoji}
Score: ${score.toLocaleString()}
Highest: ${highestTile}
Play: wojak.ink/games/2048-merge`;
};
```

#### Task 136: Add Copy to Clipboard Function
```typescript
const handleCopyLink = async (score: number, highestTile: number) => {
  const text = generateTextShare(score, highestTile);
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
};
```

#### Task 137: Add Download Image Function
```typescript
const downloadImage = (imageUrl: string | null) => {
  if (!imageUrl) return;

  const link = document.createElement('a');
  link.download = `2048-score-${Date.now()}.png`;
  link.href = imageUrl;
  link.click();
};
```

#### Task 138: Track Shares for Analytics
```typescript
const trackShare = (method: 'native' | 'copy' | 'download') => {
  // Analytics tracking
  console.log(`Share via ${method}`);
};
```

---

## Phase 11: Dynamic Music System (Tasks 139-145)

### Goal
Create a layered music system that responds to game state: calm base, intensity during streaks, urgency when board fills.

### Research Insight
> "Vertical layering maintains musical cohesion because the underlying melody/harmony continues while layers add or subtract, creating seamless intensity transitions." - Adaptive Audio Research

### Tasks

#### Task 139: Create Music Layer State
```typescript
interface MusicState {
  baseVolume: number;
  intensityVolume: number;
  urgencyVolume: number;
  isPlaying: boolean;
}

const [musicState, setMusicState] = useState<MusicState>({
  baseVolume: 0.3,
  intensityVolume: 0,
  urgencyVolume: 0,
  isPlaying: false,
});
```

#### Task 140: Initialize Music Layers
```typescript
const baseMusicRef = useRef<Howl | null>(null);
const intensityMusicRef = useRef<Howl | null>(null);
const urgencyMusicRef = useRef<Howl | null>(null);

const initMusicLayers = useCallback(() => {
  baseMusicRef.current = new Howl({
    src: ['/sounds/music_base_layer.mp3'],
    loop: true,
    volume: 0,
  });

  intensityMusicRef.current = new Howl({
    src: ['/sounds/music_intensity_layer.mp3'],
    loop: true,
    volume: 0,
  });

  urgencyMusicRef.current = new Howl({
    src: ['/sounds/music_urgency_layer.mp3'],
    loop: true,
    volume: 0,
  });
}, []);
```

#### Task 141: Start All Layers Synchronized
```typescript
const startMusic = useCallback(() => {
  if (musicState.isPlaying) return;

  baseMusicRef.current?.play();
  intensityMusicRef.current?.play();
  urgencyMusicRef.current?.play();

  // Fade in base layer
  baseMusicRef.current?.fade(0, 0.3, 1000);

  setMusicState(prev => ({ ...prev, isPlaying: true }));
}, [musicState.isPlaying]);
```

#### Task 142: Update Intensity Based on Combo
```typescript
useEffect(() => {
  if (!musicState.isPlaying) return;

  const targetIntensity = comboState.count >= 5 ? 0.4 : comboState.count >= 3 ? 0.2 : 0;
  intensityMusicRef.current?.fade(
    intensityMusicRef.current.volume(),
    targetIntensity,
    500
  );
}, [comboState.count, musicState.isPlaying]);
```

#### Task 143: Update Urgency Based on Danger Level
```typescript
useEffect(() => {
  if (!musicState.isPlaying) return;

  const targetUrgency =
    dangerLevel === 'imminent' ? 0.5 :
    dangerLevel === 'critical' ? 0.35 :
    dangerLevel === 'warning' ? 0.2 : 0;

  urgencyMusicRef.current?.fade(
    urgencyMusicRef.current.volume(),
    targetUrgency,
    500
  );
}, [dangerLevel, musicState.isPlaying]);
```

#### Task 144: Add Music Toggle
```typescript
const toggleMusic = useCallback(() => {
  if (musicState.isPlaying) {
    baseMusicRef.current?.fade(baseMusicRef.current.volume(), 0, 500);
    intensityMusicRef.current?.fade(intensityMusicRef.current.volume(), 0, 500);
    urgencyMusicRef.current?.fade(urgencyMusicRef.current.volume(), 0, 500);

    setTimeout(() => {
      baseMusicRef.current?.stop();
      intensityMusicRef.current?.stop();
      urgencyMusicRef.current?.stop();
    }, 500);

    setMusicState(prev => ({ ...prev, isPlaying: false }));
  } else {
    startMusic();
  }
}, [musicState.isPlaying, startMusic]);
```

#### Task 145: Clean Up Music on Unmount
```typescript
useEffect(() => {
  return () => {
    baseMusicRef.current?.stop();
    intensityMusicRef.current?.stop();
    urgencyMusicRef.current?.stop();
  };
}, []);
```

---

## Testing Checklist

After implementing each phase, verify:

### Sound Testing
- [ ] All merge values play different pitches
- [ ] Signature chime plays on first milestone reach
- [ ] Spawn sound plays for new tiles
- [ ] Slide sound plays on valid moves
- [ ] Invalid move sound plays when nothing changes
- [ ] Danger heartbeat starts/stops correctly
- [ ] Music layers blend smoothly

### Haptic Testing (Mobile Only)
- [ ] Small merges feel light
- [ ] Big merges feel heavy
- [ ] Patterns escalate with tile value
- [ ] Error haptic for invalid moves
- [ ] Win/lose haptics are distinct

### Visual Testing
- [ ] Faces display correctly on all tiles
- [ ] Faces react to danger state
- [ ] Freeze frame pauses on big merges
- [ ] Particles burst from merge locations
- [ ] Camera zoom feels smooth
- [ ] Danger state visuals escalate
- [ ] Fever mode visuals are dramatic

### Feature Testing
- [ ] Next tile preview is accurate
- [ ] Undo restores previous state correctly
- [ ] Combo counter tracks correctly
- [ ] Fever mode activates at threshold
- [ ] Share image generates correctly
- [ ] Challenge links encode/decode properly

---

## Priority Order for Maximum Impact

1. **Phase 1-2** (Sound + Haptics) — Foundation, do first
2. **Phase 5** (Danger State) — Creates tension
3. **Phase 6** (Fever Mode) — Addictive loop
4. **Phase 3** (Tile Personality) — Emotional attachment
5. **Phase 4** (Visual Juice) — Premium polish
6. **Phase 10** (Share System) — Viral growth
7. **Phase 8** (Combo Visualization) — Feedback
8. **Phase 7** (Next Preview) — Strategy depth
9. **Phase 11** (Dynamic Music) — Atmosphere
10. **Phase 9** (Extra Features) — Quality of life

---

## Files to Create/Modify

### Primary Files
- `src/games/Merge2048/Merge2048Game.tsx` — Main game logic
- `src/games/Merge2048/Merge2048Game.css` — All styles

### New Components (Optional)
- `src/games/Merge2048/components/TileFace.tsx`
- `src/games/Merge2048/components/FeverMeter.tsx`
- `src/games/Merge2048/components/ComboDisplay.tsx`
- `src/games/Merge2048/components/ShareModal.tsx`
- `src/games/Merge2048/components/NextTilePreview.tsx`

### Sound Files Needed
- `/public/sounds/merge_pop_1-4.mp3`
- `/public/sounds/sparkle.mp3`
- `/public/sounds/bass_hit.mp3`
- `/public/sounds/soft_pop.mp3`
- `/public/sounds/whoosh.mp3`
- `/public/sounds/soft_thud.mp3`
- `/public/sounds/heartbeat_loop.mp3`
- `/public/sounds/fever_activate.mp3`
- `/public/sounds/fever_loop.mp3`
- `/public/sounds/music_base_layer.mp3`
- `/public/sounds/music_intensity_layer.mp3`
- `/public/sounds/music_urgency_layer.mp3`

---

*Document created based on research from Threes!, Candy Crush, Tetris Effect, Wordle, Monument Valley, and game psychology studies.*
