# Block Puzzle Game - Juice Implementation Guide

> Transform Block Puzzle into an EXPLOSIVE, premium, addictive experience.

**Target File:** `src/pages/BlockPuzzle.tsx`
**CSS File:** `src/pages/BlockPuzzle.css`
**Total Tasks:** 128
**Estimated Time:** 6-10 hours

---

## Research Summary

Based on research from:
- **Woodoku / Block Puzzle Star** - Premium mobile block puzzles
- **Tetris Effect** - Audio-visual-haptic synchronization
- **Candy Crush** - Cascade psychology, dopamine loops
- **"Juice It or Lose It" GDC Talk** - Cascading feedback for minimal input
- **Puyo Puyo** - Chain reaction scoring psychology

---

## Table of Contents

1. [Phase 1: Sound Foundation](#phase-1-sound-foundation-tasks-1-16)
2. [Phase 2: Premium Haptics](#phase-2-premium-haptics-tasks-17-26)
3. [Phase 3: EXPLOSIVE Line Clears](#phase-3-explosive-line-clears-tasks-27-42)
4. [Phase 4: Drag & Drop Juice](#phase-4-drag--drop-juice-tasks-43-56)
5. [Phase 5: Snap & Placement Feedback](#phase-5-snap--placement-feedback-tasks-57-68)
6. [Phase 6: Danger State System](#phase-6-danger-state-system-tasks-69-82)
7. [Phase 7: Streak Fire Mode](#phase-7-streak-fire-mode-tasks-83-94)
8. [Phase 8: Perfect Clear Celebration](#phase-8-perfect-clear-celebration-tasks-95-102)
9. [Phase 9: Combo Visualization Enhancement](#phase-9-combo-visualization-enhancement-tasks-103-112)
10. [Phase 10: Viral Share System](#phase-10-viral-share-system-tasks-113-128)

---

## Phase 1: Sound Foundation (Tasks 1-16)

### Goal
Add musical scale escalation for combos, sound variations, and missing sounds (spawn, invalid, snap).

### Research Insight
> "Each consecutive combo plays next note in scale (Do-Re-Mi-Fa-Sol). Creates satisfying melody during hot streaks." - Tetris Effect

### Tasks

#### Task 1: Create Musical Scale Configuration
```typescript
// C Major scale frequencies for combo escalation
const COMBO_SCALE_FREQUENCIES = [
  261.63, // C4 - Do (combo 1)
  293.66, // D4 - Re (combo 2)
  329.63, // E4 - Mi (combo 3)
  349.23, // F4 - Fa (combo 4)
  392.00, // G4 - Sol (combo 5+)
];

const COMBO_SOUND_CONFIG = {
  1: { note: 0, volume: 0.5, layers: 1 },
  2: { note: 1, volume: 0.55, layers: 1 },
  3: { note: 2, volume: 0.6, layers: 2 },  // Add sparkle
  4: { note: 3, volume: 0.7, layers: 2 },
  5: { note: 4, volume: 0.8, layers: 3 },  // Add bass
};
```

#### Task 2: Create playComboNote Function
```typescript
const playComboNote = useCallback((comboLevel: number) => {
  const config = COMBO_SOUND_CONFIG[Math.min(comboLevel, 5)];
  const frequency = COMBO_SCALE_FREQUENCIES[config.note];

  // Play musical note
  const audioContext = new AudioContext();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.frequency.value = frequency;
  osc.type = 'sine';
  gain.gain.setValueAtTime(config.volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);

  // Add sparkle layer for combo 3+
  if (config.layers >= 2) {
    playSparkleSound();
  }

  // Add bass layer for combo 5
  if (config.layers >= 3) {
    playBassHit();
  }
}, []);
```

#### Task 3: Create Line Clear Sound with Line Count Variation
```typescript
const LINE_CLEAR_SOUNDS = {
  1: { pitch: 1.0, volume: 0.5, duration: 200 },
  2: { pitch: 1.1, volume: 0.6, duration: 250 },   // Double
  3: { pitch: 1.2, volume: 0.7, duration: 300 },   // Triple
  4: { pitch: 1.3, volume: 0.85, duration: 400 },  // Quad+
};

const playLineClearSound = useCallback((linesCleared: number) => {
  const config = LINE_CLEAR_SOUNDS[Math.min(linesCleared, 4)];
  // Ascending "whoosh" + chime
  playWithPitch('line_clear', config.pitch, config.volume);
}, []);
```

#### Task 4: Add Piece Spawn Sound
```typescript
const playSpawnSound = useCallback(() => {
  // Soft "pop" with slight pitch variation
  const pitch = 0.95 + Math.random() * 0.1;
  playWithPitch('piece_spawn', pitch, 0.3);
}, []);
```

#### Task 5: Add Piece Snap/Lock Sound
```typescript
const playSnapSound = useCallback(() => {
  // Satisfying "click" - deep thunk (80Hz bass)
  playWithPitch('piece_snap', 1.0, 0.5);
}, []);
```

#### Task 6: Add Invalid Placement Sound
```typescript
const playInvalidSound = useCallback(() => {
  // Short buzz/rejection sound (150Hz, 80ms)
  playWithPitch('invalid_placement', 0.9, 0.3);
}, []);
```

#### Task 7: Add Combo Timeout Sound
```typescript
const playComboBreakSound = useCallback((lostCombo: number) => {
  if (lostCombo >= 3) {
    // Descending "womp womp" for lost big combo
    playWithPitch('combo_break', 0.8, 0.4);
  }
}, []);
```

#### Task 8: Add Danger State Heartbeat Loop
```typescript
const dangerLoopRef = useRef<Howl | null>(null);

const startDangerSound = useCallback(() => {
  if (dangerLoopRef.current) return;
  dangerLoopRef.current = new Howl({
    src: ['/sounds/heartbeat_tension.mp3'],
    loop: true,
    volume: 0,
  });
  dangerLoopRef.current.play();
  dangerLoopRef.current.fade(0, 0.35, 500);
}, []);

const stopDangerSound = useCallback(() => {
  if (dangerLoopRef.current) {
    dangerLoopRef.current.fade(0.35, 0, 300);
    setTimeout(() => {
      dangerLoopRef.current?.stop();
      dangerLoopRef.current = null;
    }, 300);
  }
}, []);
```

#### Task 9: Add Perfect Clear Fanfare
```typescript
const playPerfectClearSound = useCallback(() => {
  // Triumphant ascending arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playNote(freq, 0.4, 200);
    }, i * 100);
  });
}, []);
```

#### Task 10: Add Streak Fire Activation Sound
```typescript
const playStreakFireSound = useCallback(() => {
  // Whoosh + ignition sound
  playWithPitch('fire_ignite', 1.0, 0.6);
}, []);
```

#### Task 11: Create Sound Variation Arrays
```typescript
const SNAP_SOUND_VARIANTS = ['snap_1', 'snap_2', 'snap_3'];
const CLEAR_SOUND_VARIANTS = ['clear_1', 'clear_2', 'clear_3'];

const getRandomSound = (variants: string[]) => {
  return variants[Math.floor(Math.random() * variants.length)];
};
```

#### Task 12: Replace playBlockLand with playSnapSound
Update piece placement to use new snap sound.

#### Task 13: Replace playCombo with playComboNote
Update combo system to use musical scale.

#### Task 14: Add Spawn Sound to generateRandomPiece
Call `playSpawnSound()` when new piece appears in rack.

#### Task 15: Add Invalid Sound to Failed Placement
Call `playInvalidSound()` when piece returns to rack.

#### Task 16: Add Combo Break Sound to Timeout
Call `playComboBreakSound(combo)` when combo resets.

---

## Phase 2: Premium Haptics (Tasks 17-26)

### Goal
Add nuanced haptic patterns for all interactions.

### Tasks

#### Task 17: Create Haptic Configuration
```typescript
const HAPTIC_PATTERNS = {
  dragStart: [5],                          // Ultra-light tick
  snapLock: [15, 30, 15],                  // Double-tap confirmation
  lineClear1: [20],                        // Single line
  lineClear2: [20, 20, 25],                // Double line
  lineClear3: [25, 20, 30, 20, 35],        // Triple line
  lineClear4: [30, 20, 35, 20, 40, 20, 50], // Quad+ EXPLOSION
  invalidPlacement: [10, 50, 10],          // Error double-tap
  comboHit: [15, 15, 20],                  // Combo confirmation
  perfectClear: [20, 30, 25, 30, 30, 30, 40, 30, 50], // Celebration
  dangerPulse: [8],                        // Subtle warning
  streakFire: [15, 20, 25, 30],            // Ignition pattern
};
```

#### Task 18: Create triggerLineClearHaptic
```typescript
const triggerLineClearHaptic = useCallback((linesCleared: number) => {
  const patterns = {
    1: HAPTIC_PATTERNS.lineClear1,
    2: HAPTIC_PATTERNS.lineClear2,
    3: HAPTIC_PATTERNS.lineClear3,
    4: HAPTIC_PATTERNS.lineClear4,
  };
  const pattern = patterns[Math.min(linesCleared, 4)];
  navigator.vibrate?.(pattern);
}, []);
```

#### Task 19: Create triggerSnapHaptic
```typescript
const triggerSnapHaptic = useCallback(() => {
  navigator.vibrate?.(HAPTIC_PATTERNS.snapLock);
}, []);
```

#### Task 20: Create triggerInvalidHaptic
```typescript
const triggerInvalidHaptic = useCallback(() => {
  navigator.vibrate?.(HAPTIC_PATTERNS.invalidPlacement);
}, []);
```

#### Task 21: Create triggerDragStartHaptic
```typescript
const triggerDragStartHaptic = useCallback(() => {
  navigator.vibrate?.(HAPTIC_PATTERNS.dragStart);
}, []);
```

#### Task 22: Create triggerPerfectClearHaptic
```typescript
const triggerPerfectClearHaptic = useCallback(() => {
  navigator.vibrate?.(HAPTIC_PATTERNS.perfectClear);
}, []);
```

#### Task 23: Create triggerDangerPulse
```typescript
const triggerDangerPulse = useCallback(() => {
  navigator.vibrate?.(HAPTIC_PATTERNS.dangerPulse);
}, []);
```

#### Task 24: Add Haptic to Drag Start
Call `triggerDragStartHaptic()` in handleTouchStart/handleMouseDown.

#### Task 25: Add Haptic to Invalid Placement
Call `triggerInvalidHaptic()` when placement fails.

#### Task 26: Replace hapticCombo with triggerLineClearHaptic
Use line-count-specific patterns.

---

## Phase 3: EXPLOSIVE Line Clears (Tasks 27-42)

### Goal
Make line clears feel like fireworks - freeze frame, shockwave, particles bursting outward, screen shake.

### Research Insight
> "Particle burst systems: When lines clear, launch confetti particles in multiple directions from the cleared line's endpoints." - Block Puzzle Research

### Tasks

#### Task 27: Add Freeze Frame System
```typescript
const [freezeFrame, setFreezeFrame] = useState(false);

const triggerFreezeFrame = useCallback((duration: number) => {
  setFreezeFrame(true);
  setTimeout(() => setFreezeFrame(false), duration);
}, []);
```

#### Task 28: Create Freeze Frame Durations by Line Count
```typescript
const FREEZE_DURATIONS = {
  1: 0,      // No freeze for single
  2: 40,    // Brief pause for double
  3: 60,    // Longer for triple
  4: 100,   // Maximum for quad+
};
```

#### Task 29: Trigger Freeze Frame on Line Clear
```typescript
// In clearLines handling
if (linesCleared >= 2) {
  triggerFreezeFrame(FREEZE_DURATIONS[Math.min(linesCleared, 4)]);
}
```

#### Task 30: Create Shockwave Effect
```typescript
const [shockwave, setShockwave] = useState<{ x: number; y: number; size: number } | null>(null);

const triggerShockwave = useCallback((x: number, y: number) => {
  setShockwave({ x, y, size: 0 });
  // Animate size expansion
  let size = 0;
  const expand = setInterval(() => {
    size += 15;
    if (size > 300) {
      clearInterval(expand);
      setShockwave(null);
    } else {
      setShockwave({ x, y, size });
    }
  }, 16);
}, []);
```

#### Task 31: Add Shockwave CSS
```css
.line-clear-shockwave {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 200, 0, 0.8);
  background: radial-gradient(circle, rgba(255, 200, 0, 0.3) 0%, transparent 70%);
  pointer-events: none;
  animation: shockwaveExpand 400ms ease-out forwards;
}

@keyframes shockwaveExpand {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
```

#### Task 32: Create Particle Burst System for Line Clears
```typescript
interface ClearParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

const [clearParticles, setClearParticles] = useState<ClearParticle[]>([]);

const createLineClearBurst = useCallback((cells: { row: number; col: number }[], color: string) => {
  const newParticles: ClearParticle[] = [];

  cells.forEach((cell, cellIndex) => {
    const cellX = cell.col * cellSize + cellSize / 2;
    const cellY = cell.row * cellSize + cellSize / 2;

    // 6-10 particles per cell
    const particleCount = 6 + Math.floor(Math.random() * 5);

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 3 + Math.random() * 6;

      newParticles.push({
        id: Date.now() + cellIndex * 100 + i,
        x: cellX,
        y: cellY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Bias upward
        size: 4 + Math.random() * 6,
        color: i % 4 === 0 ? '#ffffff' : color, // Some white sparkles
        alpha: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      });
    }
  });

  setClearParticles(prev => [...prev, ...newParticles]);
}, [cellSize]);
```

#### Task 33: Create Particle Animation Loop
```typescript
useEffect(() => {
  if (clearParticles.length === 0) return;

  const interval = setInterval(() => {
    setClearParticles(prev =>
      prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // gravity
          alpha: p.alpha - 0.025,
          rotation: p.rotation + p.rotationSpeed,
          size: p.size * 0.98, // Shrink slightly
        }))
        .filter(p => p.alpha > 0)
    );
  }, 16);

  return () => clearInterval(interval);
}, [clearParticles.length > 0]);
```

#### Task 34: Create Particle Renderer
```typescript
const ClearParticleLayer: React.FC<{ particles: ClearParticle[] }> = ({ particles }) => (
  <div className="clear-particle-layer">
    {particles.map(p => (
      <div
        key={p.id}
        className="clear-particle"
        style={{
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          opacity: p.alpha,
          transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
        }}
      />
    ))}
  </div>
);
```

#### Task 35: Add Particle CSS
```css
.clear-particle-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.clear-particle {
  position: absolute;
  border-radius: 2px;
}
```

#### Task 36: Enhanced Screen Shake for Line Clears
```typescript
const SHAKE_CONFIG = {
  1: { intensity: 3, duration: 150, rotation: 0 },
  2: { intensity: 5, duration: 200, rotation: 1 },
  3: { intensity: 8, duration: 300, rotation: 2 },
  4: { intensity: 12, duration: 400, rotation: 3 },
};

const triggerEnhancedShake = useCallback((linesCleared: number) => {
  const config = SHAKE_CONFIG[Math.min(linesCleared, 4)];
  setShakeLevel({
    intensity: config.intensity,
    duration: config.duration,
    rotation: config.rotation,
  });
}, []);
```

#### Task 37: Add White Flash to Clearing Cells
```css
.cell-clearing {
  animation: cellClearFlash 500ms ease-out forwards;
}

@keyframes cellClearFlash {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }
  15% {
    filter: brightness(2.5);
    background: white !important;
    transform: scale(1.1);
  }
  30% {
    filter: brightness(1.5);
    transform: scale(1.2);
  }
  100% {
    filter: brightness(0);
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
}
```

#### Task 38: Create Staggered Clear with Particle Timing
```typescript
const triggerStaggeredClear = useCallback((cellsToClcar: Set<string>, color: string) => {
  const cells = Array.from(cellsToClcar).map(key => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });

  // Stagger delay per cell
  cells.forEach((cell, index) => {
    setTimeout(() => {
      // Mark cell as clearing
      setClearingCells(prev => new Set([...prev, `${cell.row}-${cell.col}`]));

      // Create particles at this cell
      createLineClearBurst([cell], color);
    }, index * 30); // 30ms stagger
  });
}, [createLineClearBurst]);
```

#### Task 39: Add Screen Flash on Big Clears
```typescript
const [screenFlash, setScreenFlash] = useState<string | null>(null);

const triggerScreenFlash = useCallback((color: string) => {
  setScreenFlash(color);
  setTimeout(() => setScreenFlash(null), 150);
}, []);

// Trigger on 3+ lines
if (linesCleared >= 3) {
  triggerScreenFlash('rgba(255, 200, 0, 0.3)');
}
```

#### Task 40: Add Screen Flash CSS
```css
.screen-flash {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
  animation: flashFade 150ms ease-out forwards;
}

@keyframes flashFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

#### Task 41: Trigger Shockwave from Grid Center on Big Clears
```typescript
// On 2+ line clears
if (linesCleared >= 2) {
  const gridCenter = { x: gridWidth / 2, y: gridHeight / 2 };
  triggerShockwave(gridCenter.x, gridCenter.y);
}
```

#### Task 42: Add Epic Callout Text for Multi-Clears
```typescript
const CLEAR_CALLOUTS = {
  2: 'DOUBLE!',
  3: 'TRIPLE!',
  4: 'QUAD CLEAR!',
  5: 'MEGA CLEAR!',
};

// On line clear
if (linesCleared >= 2) {
  showEpicCallout(CLEAR_CALLOUTS[Math.min(linesCleared, 5)]);
}
```

---

## Phase 4: Drag & Drop Juice (Tasks 43-56)

### Goal
Add particle trails when dragging, enhanced ghost preview, magnetic snap feedback.

### Research Insight
> "As piece is dragged, leave a faint particle trail showing the path taken. Color matches piece for visual coherence." - Drag UX Research

### Tasks

#### Task 43: Create Drag Trail Particle System
```typescript
interface TrailParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
}

const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
const lastTrailPosRef = useRef({ x: 0, y: 0 });
```

#### Task 44: Emit Trail Particles on Drag Move
```typescript
const emitTrailParticle = useCallback((x: number, y: number, color: string) => {
  const dx = x - lastTrailPosRef.current.x;
  const dy = y - lastTrailPosRef.current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Emit particle every 25px of movement
  if (distance > 25) {
    lastTrailPosRef.current = { x, y };

    setTrailParticles(prev => [
      ...prev,
      {
        id: Date.now(),
        x,
        y,
        size: 8 + Math.random() * 4,
        color,
        alpha: 0.6,
      },
    ]);
  }
}, []);
```

#### Task 45: Create Trail Particle Fade Loop
```typescript
useEffect(() => {
  if (trailParticles.length === 0) return;

  const interval = setInterval(() => {
    setTrailParticles(prev =>
      prev
        .map(p => ({ ...p, alpha: p.alpha - 0.05, size: p.size * 0.95 }))
        .filter(p => p.alpha > 0)
    );
  }, 16);

  return () => clearInterval(interval);
}, [trailParticles.length > 0]);
```

#### Task 46: Add Trail Particle Renderer
```typescript
const TrailParticleLayer: React.FC<{ particles: TrailParticle[] }> = ({ particles }) => (
  <div className="trail-particle-layer">
    {particles.map(p => (
      <div
        key={p.id}
        className="trail-particle"
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

#### Task 47: Add Trail Particle CSS
```css
.trail-particle-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
}

.trail-particle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  filter: blur(2px);
}
```

#### Task 48: Call emitTrailParticle in Drag Handlers
```typescript
// In handleTouchMove / handleMouseMove
if (draggedPieceId && draggedPiece) {
  emitTrailParticle(dragPosition.x, dragPosition.y, draggedPiece.color);
}
```

#### Task 49: Clear Trail on Drag End
```typescript
// In handleTouchEnd / handleMouseUp
setTrailParticles([]);
lastTrailPosRef.current = { x: 0, y: 0 };
```

#### Task 50: Enhanced Ghost Preview Glow
```css
.preview-cell-valid {
  background: rgba(255, 107, 0, 0.5) !important;
  box-shadow:
    inset 0 0 10px rgba(255, 200, 0, 0.5),
    0 0 15px rgba(255, 107, 0, 0.4);
  animation: previewPulse 0.8s ease-in-out infinite;
}

@keyframes previewPulse {
  0%, 100% {
    box-shadow: inset 0 0 10px rgba(255, 200, 0, 0.5), 0 0 15px rgba(255, 107, 0, 0.4);
  }
  50% {
    box-shadow: inset 0 0 15px rgba(255, 200, 0, 0.7), 0 0 25px rgba(255, 107, 0, 0.6);
  }
}
```

#### Task 51: Enhanced Invalid Preview Effect
```css
.preview-cell-invalid {
  background: rgba(255, 50, 50, 0.3) !important;
  border: 2px dashed rgba(255, 50, 50, 0.8);
  animation: invalidShake 0.3s ease-in-out infinite;
}

@keyframes invalidShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

#### Task 52: Add Magnetic Snap Radius
```typescript
const SNAP_RADIUS = 0.25; // 25% of cell width

const calculateSnapPosition = (rawRow: number, rawCol: number) => {
  const snapRow = Math.round(rawRow);
  const snapCol = Math.round(rawCol);

  const rowDiff = Math.abs(rawRow - snapRow);
  const colDiff = Math.abs(rawCol - snapCol);

  // If within snap radius, snap to grid
  if (rowDiff < SNAP_RADIUS && colDiff < SNAP_RADIUS) {
    return { row: snapRow, col: snapCol, snapped: true };
  }

  return { row: snapRow, col: snapCol, snapped: false };
};
```

#### Task 53: Add Snap Indicator Visual
```css
.preview-snapped {
  transition: all 100ms ease-out;
}

.preview-snapped .preview-cell-valid {
  transform: scale(1.05);
  box-shadow:
    inset 0 0 15px rgba(255, 200, 0, 0.8),
    0 0 25px rgba(255, 107, 0, 0.7);
}
```

#### Task 54: Add Dragged Piece Glow Effect
```css
.floating-piece {
  filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.5));
  animation: floatGlow 1s ease-in-out infinite;
}

@keyframes floatGlow {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 200, 0, 0.5)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 200, 0, 0.8)); }
}
```

#### Task 55: Offset Piece Above Touch Point on Mobile
```typescript
// In touch handler, offset piece above finger
const TOUCH_OFFSET_Y = -60; // 60px above touch point

const adjustedY = isMobile ? touchY + TOUCH_OFFSET_Y : mouseY;
setDragPosition({ x: touchX, y: adjustedY });
```

#### Task 56: Add Haptic on Snap Detection
```typescript
// When piece snaps to valid position
if (newSnapState && !prevSnapState) {
  triggerSnapHaptic();
}
```

---

## Phase 5: Snap & Placement Feedback (Tasks 57-68)

### Goal
Make piece locking feel impactful with bounce, particles, and satisfying sound.

### Research Insight
> "Impact particles emit from placement point when block locks in grid. Minimal but visible confirmation." - Placement UX

### Tasks

#### Task 57: Create Placement Bounce Animation
```typescript
const [placementBounce, setPlacementBounce] = useState<Set<string>>(new Set());

const triggerPlacementBounce = useCallback((cells: { row: number; col: number }[]) => {
  const cellKeys = cells.map(c => `${c.row}-${c.col}`);
  setPlacementBounce(new Set(cellKeys));

  setTimeout(() => setPlacementBounce(new Set()), 300);
}, []);
```

#### Task 58: Add Placement Bounce CSS
```css
.cell-just-placed {
  animation: placementBounce 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes placementBounce {
  0% { transform: scale(0.8); }
  40% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
```

#### Task 59: Create Corner Impact Particles
```typescript
const createCornerParticles = useCallback((cells: { row: number; col: number }[], color: string) => {
  const corners = getCornerCells(cells);

  corners.forEach(corner => {
    const x = corner.col * cellSize + (corner.isRight ? cellSize : 0);
    const y = corner.row * cellSize + (corner.isBottom ? cellSize : 0);

    // 3-4 particles per corner
    for (let i = 0; i < 4; i++) {
      const angle = corner.angle + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 2;

      // Add particle
      addPlacementParticle(x, y, angle, speed, color);
    }
  });
}, [cellSize]);
```

#### Task 60: Add Placement Particles to placePiece
```typescript
// After successful placement
createCornerParticles(placedCells, piece.color);
triggerPlacementBounce(placedCells);
playSnapSound();
triggerSnapHaptic();
```

#### Task 61: Add Scale Pulse on Lock
```css
.cell-scale-pulse {
  animation: scalePulse 150ms ease-out;
}

@keyframes scalePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
```

#### Task 62: Add Glow Pulse on Placement
```css
.cell-glow-pulse {
  animation: glowPulse 300ms ease-out;
}

@keyframes glowPulse {
  0% { box-shadow: 0 0 0 rgba(255, 200, 0, 0); }
  30% { box-shadow: 0 0 20px rgba(255, 200, 0, 0.8); }
  100% { box-shadow: 0 0 0 rgba(255, 200, 0, 0); }
}
```

#### Task 63: Track justPlacedCells for Animation
Already exists - ensure it triggers bounce animation.

#### Task 64: Add Mini Screen Shake on Placement
```typescript
// Small shake on every placement
triggerMiniShake(); // 2px, 100ms
```

#### Task 65: Create triggerMiniShake Function
```typescript
const triggerMiniShake = useCallback(() => {
  setShakeLevel({ intensity: 2, duration: 100, rotation: 0 });
}, []);
```

#### Task 66: Add Placement Sound with Piece Size Variation
```typescript
const playPlacementSound = useCallback((blockCount: number) => {
  // Larger pieces = deeper sound
  const pitch = 1.1 - (blockCount * 0.02);
  playWithPitch('piece_snap', pitch, 0.5);
}, []);
```

#### Task 67: Add Visual Confirmation Flash
```typescript
// Brief brightness flash on placed cells
const triggerPlacementFlash = useCallback((cells: Set<string>) => {
  setFlashingCells(cells);
  setTimeout(() => setFlashingCells(new Set()), 100);
}, []);
```

#### Task 68: Add Placement Flash CSS
```css
.cell-flash {
  filter: brightness(1.5);
  transition: filter 100ms ease-out;
}
```

---

## Phase 6: Danger State System (Tasks 69-82)

### Goal
Create escalating tension when board fills up with wobble, vignette, heartbeat, and valid move highlighting.

### Research Insight
> "When board is near-full, apply subtle rotation wobble to the entire board (±1-2 degrees oscillation). Communicates instability." - Danger UX

### Tasks

#### Task 69: Define Danger Thresholds
```typescript
// Based on percentage of filled cells
const DANGER_THRESHOLDS = {
  safe: 0.6,      // < 60% filled
  warning: 0.7,   // 70% filled
  critical: 0.85, // 85% filled
  imminent: 0.95, // 95% filled
};

type DangerLevel = 'safe' | 'warning' | 'critical' | 'imminent';
```

#### Task 70: Create Danger Level State
```typescript
const [dangerLevel, setDangerLevel] = useState<DangerLevel>('safe');

useEffect(() => {
  const filledCells = countFilledCells(grid);
  const fillPercent = filledCells / 64;

  if (fillPercent >= DANGER_THRESHOLDS.imminent) {
    setDangerLevel('imminent');
  } else if (fillPercent >= DANGER_THRESHOLDS.critical) {
    setDangerLevel('critical');
  } else if (fillPercent >= DANGER_THRESHOLDS.warning) {
    setDangerLevel('warning');
  } else {
    setDangerLevel('safe');
  }
}, [grid]);
```

#### Task 71: Add Grid Wobble Animation
```css
.grid-danger-warning {
  animation: gridWobble 2s ease-in-out infinite;
}

.grid-danger-critical {
  animation: gridWobble 1.2s ease-in-out infinite;
}

.grid-danger-imminent {
  animation: gridWobble 0.6s ease-in-out infinite;
}

@keyframes gridWobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(0.5deg); }
  75% { transform: rotate(-0.5deg); }
}
```

#### Task 72: Add Red Vignette Effect
```css
.danger-vignette-warning {
  box-shadow: inset 0 0 50px rgba(255, 100, 0, 0.2);
}

.danger-vignette-critical {
  box-shadow: inset 0 0 60px rgba(255, 50, 0, 0.3);
  animation: vignettePulse 1s ease-in-out infinite;
}

.danger-vignette-imminent {
  box-shadow: inset 0 0 80px rgba(255, 0, 0, 0.4);
  animation: vignettePulse 0.5s ease-in-out infinite;
}

@keyframes vignettePulse {
  0%, 100% { box-shadow: inset 0 0 60px rgba(255, 50, 0, 0.3); }
  50% { box-shadow: inset 0 0 80px rgba(255, 50, 0, 0.5); }
}
```

#### Task 73: Highlight Valid Placement Cells
```typescript
const [validPlacements, setValidPlacements] = useState<Set<string>>(new Set());

useEffect(() => {
  if (dangerLevel === 'safe') {
    setValidPlacements(new Set());
    return;
  }

  // Calculate all valid placement cells for all pieces
  const valid = new Set<string>();
  pieces.forEach(piece => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (canPlacePiece(grid, piece.shape, row, col)) {
          // Mark cells this piece would occupy
          piece.shape.forEach((shapeRow, r) => {
            shapeRow.forEach((cell, c) => {
              if (cell) valid.add(`${row + r}-${col + c}`);
            });
          });
        }
      }
    }
  });
  setValidPlacements(valid);
}, [grid, pieces, dangerLevel]);
```

#### Task 74: Add Valid Cell Highlight CSS
```css
.cell-valid-placement {
  background: rgba(0, 255, 100, 0.15) !important;
  animation: validPulse 1.5s ease-in-out infinite;
}

@keyframes validPulse {
  0%, 100% { background: rgba(0, 255, 100, 0.1); }
  50% { background: rgba(0, 255, 100, 0.25); }
}
```

#### Task 75: Start Danger Sound on Threshold
```typescript
useEffect(() => {
  if (dangerLevel !== 'safe') {
    startDangerSound();
  } else {
    stopDangerSound();
  }
}, [dangerLevel]);
```

#### Task 76: Adjust Heartbeat Tempo by Danger Level
```typescript
const DANGER_TEMPO = {
  warning: 1.0,
  critical: 1.3,
  imminent: 1.8,
};

useEffect(() => {
  if (dangerLoopRef.current && dangerLevel !== 'safe') {
    dangerLoopRef.current.rate(DANGER_TEMPO[dangerLevel]);
  }
}, [dangerLevel]);
```

#### Task 77: Add Periodic Danger Haptic
```typescript
useEffect(() => {
  if (dangerLevel === 'safe') return;

  const intervals = {
    warning: 2000,
    critical: 1000,
    imminent: 500,
  };

  const interval = setInterval(() => {
    triggerDangerPulse();
  }, intervals[dangerLevel]);

  return () => clearInterval(interval);
}, [dangerLevel]);
```

#### Task 78: Show "X Moves Left" Warning
```typescript
const [movesLeft, setMovesLeft] = useState<number | null>(null);

useEffect(() => {
  if (dangerLevel === 'imminent') {
    const count = countValidMoves(grid, pieces);
    setMovesLeft(count);
  } else {
    setMovesLeft(null);
  }
}, [grid, pieces, dangerLevel]);
```

#### Task 79: Add Moves Left UI
```typescript
{movesLeft !== null && movesLeft <= 5 && (
  <div className={`moves-warning ${movesLeft <= 2 ? 'critical' : ''}`}>
    {movesLeft} move{movesLeft !== 1 ? 's' : ''} left!
  </div>
)}
```

#### Task 80: Add Moves Warning CSS
```css
.moves-warning {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 100, 0, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  animation: warningBounce 0.5s ease-out;
}

.moves-warning.critical {
  background: rgba(255, 0, 0, 0.9);
  animation: warningPulse 0.5s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.1); }
}
```

#### Task 81: Apply Danger Classes to Grid
```typescript
<div
  className={`block-puzzle-grid ${
    dangerLevel !== 'safe' ? `grid-danger-${dangerLevel} danger-vignette-${dangerLevel}` : ''
  }`}
>
```

#### Task 82: Clean Up Danger State on New Game
```typescript
// In startGame()
setDangerLevel('safe');
stopDangerSound();
setValidPlacements(new Set());
setMovesLeft(null);
```

---

## Phase 7: Streak Fire Mode (Tasks 83-94)

### Goal
After 3+ consecutive line-clearing placements, activate fire mode with glowing pieces and bonus effects.

### Research Insight
> "Cascading reward scaling: each cascade segment triggers its own reward, creating a self-amplifying feedback loop." - Cascade Psychology

### Tasks

#### Task 83: Create Streak State
```typescript
interface StreakState {
  count: number;
  active: boolean; // Fire mode active when count >= 3
  lastClearTime: number;
}

const [streakState, setStreakState] = useState<StreakState>({
  count: 0,
  active: false,
  lastClearTime: 0,
});
```

#### Task 84: Define Streak Configuration
```typescript
const STREAK_CONFIG = {
  activationThreshold: 3,  // 3 consecutive clears to activate
  timeout: 5000,           // 5 seconds between clears
  bonusMultiplier: 1.5,    // 50% bonus during streak
};
```

#### Task 85: Track Consecutive Line Clears
```typescript
const updateStreak = useCallback((clearedLines: boolean) => {
  const now = Date.now();

  setStreakState(prev => {
    if (clearedLines) {
      const newCount = prev.count + 1;
      const isActive = newCount >= STREAK_CONFIG.activationThreshold;

      if (isActive && !prev.active) {
        // Just activated!
        playStreakFireSound();
        triggerConfetti();
        showEpicCallout('STREAK FIRE!');
      }

      return {
        count: newCount,
        active: isActive,
        lastClearTime: now,
      };
    } else {
      // Placement without clear - reset streak
      if (prev.count >= 2) {
        playComboBreakSound(prev.count);
      }
      return { count: 0, active: false, lastClearTime: 0 };
    }
  });
}, []);
```

#### Task 86: Add Streak Timeout Check
```typescript
useEffect(() => {
  if (streakState.count === 0) return;

  const checkTimeout = setInterval(() => {
    if (Date.now() - streakState.lastClearTime > STREAK_CONFIG.timeout) {
      if (streakState.count >= 2) {
        playComboBreakSound(streakState.count);
      }
      setStreakState({ count: 0, active: false, lastClearTime: 0 });
    }
  }, 500);

  return () => clearInterval(checkTimeout);
}, [streakState]);
```

#### Task 87: Apply Streak Bonus to Score
```typescript
const calculateStreakBonus = (baseScore: number): number => {
  if (streakState.active) {
    return Math.floor(baseScore * STREAK_CONFIG.bonusMultiplier);
  }
  return baseScore;
};
```

#### Task 88: Add Fire Visual to Pieces During Streak
```css
.piece-slot.streak-fire .piece-block {
  animation: fireGlow 0.5s ease-in-out infinite alternate;
  box-shadow: 0 0 15px rgba(255, 100, 0, 0.8);
}

@keyframes fireGlow {
  0% {
    filter: brightness(1) hue-rotate(0deg);
    box-shadow: 0 0 15px rgba(255, 100, 0, 0.6);
  }
  100% {
    filter: brightness(1.2) hue-rotate(10deg);
    box-shadow: 0 0 25px rgba(255, 50, 0, 0.9);
  }
}
```

#### Task 89: Add Fire Border to Grid During Streak
```css
.block-puzzle-grid.streak-active {
  border-color: rgba(255, 100, 0, 0.8);
  box-shadow:
    0 0 20px rgba(255, 100, 0, 0.5),
    inset 0 0 20px rgba(255, 100, 0, 0.1);
  animation: fireBorder 0.5s ease-in-out infinite alternate;
}

@keyframes fireBorder {
  0% { box-shadow: 0 0 20px rgba(255, 100, 0, 0.5), inset 0 0 20px rgba(255, 100, 0, 0.1); }
  100% { box-shadow: 0 0 35px rgba(255, 50, 0, 0.7), inset 0 0 30px rgba(255, 100, 0, 0.2); }
}
```

#### Task 90: Create Streak Meter UI
```typescript
const StreakMeter: React.FC<{ count: number; isActive: boolean }> = ({ count, isActive }) => {
  if (count === 0) return null;

  return (
    <div className={`streak-meter ${isActive ? 'active' : ''}`}>
      <div className="streak-fill" style={{ width: `${Math.min(count / 3 * 100, 100)}%` }} />
      <span className="streak-label">
        {isActive ? `🔥 FIRE x${count}` : `${count}/3`}
      </span>
    </div>
  );
};
```

#### Task 91: Add Streak Meter CSS
```css
.streak-meter {
  width: 120px;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.streak-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff8c00, #ff4500);
  border-radius: 12px;
  transition: width 200ms ease-out;
}

.streak-meter.active .streak-fill {
  animation: fireFlicker 0.3s ease-in-out infinite;
}

.streak-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

@keyframes fireFlicker {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}
```

#### Task 92: Add Fire Particles During Streak
```typescript
useEffect(() => {
  if (!streakState.active) return;

  const interval = setInterval(() => {
    // Random fire particle from bottom of grid
    const x = Math.random() * gridWidth;
    addFireParticle(x, gridHeight);
  }, 150);

  return () => clearInterval(interval);
}, [streakState.active]);
```

#### Task 93: Apply Streak Classes
```typescript
<div className={`block-puzzle-grid ${streakState.active ? 'streak-active' : ''}`}>

// And on pieces:
<div className={`piece-slot ${streakState.active ? 'streak-fire' : ''}`}>
```

#### Task 94: Reset Streak on New Game
```typescript
// In startGame()
setStreakState({ count: 0, active: false, lastClearTime: 0 });
```

---

## Phase 8: Perfect Clear Celebration (Tasks 95-102)

### Goal
When the entire grid is cleared, trigger massive celebration with bonus points.

### Research Insight
> "Rare but incredibly satisfying achievements create memorable moments that players chase." - Reward Psychology

### Tasks

#### Task 95: Detect Perfect Clear
```typescript
const checkPerfectClear = useCallback((grid: Grid): boolean => {
  return grid.every(row => row.every(cell => !cell.filled));
}, []);
```

#### Task 96: Define Perfect Clear Bonus
```typescript
const PERFECT_CLEAR_BONUS = 5000; // Big bonus!
```

#### Task 97: Trigger Perfect Clear Celebration
```typescript
const triggerPerfectClear = useCallback(() => {
  // Sound
  playPerfectClearSound();

  // Haptic
  triggerPerfectClearHaptic();

  // Visual: Screen flash gold
  triggerScreenFlash('rgba(255, 215, 0, 0.5)');

  // Confetti explosion
  triggerMassiveConfetti();

  // Epic callout
  showEpicCallout('PERFECT CLEAR!');

  // Bonus score
  setScore(prev => prev + PERFECT_CLEAR_BONUS);
  showFloatingScore(PERFECT_CLEAR_BONUS, gridWidth / 2, gridHeight / 2, true);

  // Heavy screen shake
  triggerEnhancedShake(4);
}, []);
```

#### Task 98: Check for Perfect Clear After Line Clears
```typescript
// After clearLines()
if (checkPerfectClear(newGrid)) {
  triggerPerfectClear();
}
```

#### Task 99: Create Massive Confetti Function
```typescript
const triggerMassiveConfetti = useCallback(() => {
  // 100+ particles in all directions
  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 5 + Math.random() * 10;
    const colors = ['#ffd700', '#ff6b00', '#ff4500', '#ffffff', '#00ff00'];

    addConfettiParticle(
      gridWidth / 2,
      gridHeight / 2,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 5,
      colors[Math.floor(Math.random() * colors.length)]
    );
  }
}, []);
```

#### Task 100: Add Perfect Clear CSS
```css
.perfect-clear-flash {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%);
  animation: perfectFlash 500ms ease-out forwards;
  pointer-events: none;
  z-index: 1000;
}

@keyframes perfectFlash {
  0% { opacity: 1; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.5); }
  100% { opacity: 0; transform: scale(2); }
}
```

#### Task 101: Track Perfect Clears for Stats
```typescript
const [perfectClears, setPerfectClears] = useState(0);

// In triggerPerfectClear
setPerfectClears(prev => prev + 1);
```

#### Task 102: Show Perfect Clear in Game Over Stats
```typescript
{perfectClears > 0 && (
  <div className="stat-row perfect">
    <span>Perfect Clears</span>
    <span>{perfectClears}</span>
  </div>
)}
```

---

## Phase 9: Combo Visualization Enhancement (Tasks 103-112)

### Goal
Add combo timeout bar, enhanced multiplier display, and better visual feedback.

### Tasks

#### Task 103: Create Combo Timeout Bar
```typescript
const ComboTimeoutBar: React.FC<{ lastClearTime: number; isActive: boolean }> = ({
  lastClearTime,
  isActive,
}) => {
  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastClearTime;
      const remaining = Math.max(0, 100 - (elapsed / 3000) * 100);
      setTimeLeft(remaining);
    }, 16);

    return () => clearInterval(interval);
  }, [lastClearTime, isActive]);

  if (!isActive) return null;

  return (
    <div className="combo-timeout-bar">
      <div className="combo-timeout-fill" style={{ width: `${timeLeft}%` }} />
    </div>
  );
};
```

#### Task 104: Add Combo Timeout Bar CSS
```css
.combo-timeout-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.combo-timeout-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b00, #ffd700);
  transition: width 50ms linear;
}
```

#### Task 105: Enhanced Combo Display with Multiplier
```typescript
const ComboDisplay: React.FC<{ combo: number; multiplier: number }> = ({ combo, multiplier }) => {
  if (combo < 2) return null;

  const getComboColor = () => {
    if (combo >= 5) return 'gold';
    if (combo >= 4) return 'purple';
    if (combo >= 3) return 'red';
    return 'orange';
  };

  return (
    <div className={`combo-display combo-${getComboColor()}`}>
      <span className="combo-count">{combo}x</span>
      <span className="combo-label">COMBO</span>
      <span className="combo-multiplier">({multiplier}x pts)</span>
      <ComboTimeoutBar lastClearTime={lastClearTimeRef.current} isActive={true} />
    </div>
  );
};
```

#### Task 106: Add Enhanced Combo CSS
```css
.combo-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  border-radius: 12px;
  animation: comboAppear 300ms ease-out;
}

.combo-orange { background: linear-gradient(135deg, #ff8c00, #ff6b00); }
.combo-red { background: linear-gradient(135deg, #ff4500, #ff0000); }
.combo-purple { background: linear-gradient(135deg, #a855f7, #7c3aed); }
.combo-gold {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  animation: comboAppear 300ms ease-out, goldPulse 0.5s ease-in-out infinite;
}

.combo-count {
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.combo-label {
  font-size: 12px;
  font-weight: bold;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
}

.combo-multiplier {
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
}

@keyframes comboAppear {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
}
```

#### Task 107: Show Multiplier in Floating Score
```typescript
// When showing score popup during combo
const displayScore = combo >= 2
  ? `+${score} (${combo}x)`
  : `+${score}`;
```

#### Task 108: Add Combo Sound Variation
Already covered in Phase 1 with musical scale.

#### Task 109: Shake Combo Display on Increment
```css
.combo-display.incrementing {
  animation: comboShake 200ms ease-out;
}

@keyframes comboShake {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1) rotate(-2deg); }
  75% { transform: scale(1.1) rotate(2deg); }
}
```

#### Task 110: Add Combo Increment Detection
```typescript
const [comboIncrementing, setComboIncrementing] = useState(false);

// When combo increases
setComboIncrementing(true);
setTimeout(() => setComboIncrementing(false), 200);
```

#### Task 111: Show Lost Combo Notification
```typescript
const [lostCombo, setLostCombo] = useState<number | null>(null);

// When combo breaks
if (prevCombo >= 3) {
  setLostCombo(prevCombo);
  setTimeout(() => setLostCombo(null), 1500);
}
```

#### Task 112: Add Lost Combo CSS
```css
.lost-combo-notification {
  position: absolute;
  color: rgba(255, 100, 100, 0.9);
  font-weight: bold;
  animation: lostComboFade 1.5s ease-out forwards;
}

@keyframes lostComboFade {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-30px); }
}
```

---

## Phase 10: Viral Share System (Tasks 113-128)

### Goal
Create shareable score images and challenge links.

### Tasks

#### Task 113: Create Share Image Generator
```typescript
const generateShareImage = async (
  score: number,
  linesCleared: number,
  bestCombo: number,
  perfectClears: number,
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Title
  ctx.fillStyle = '#ff6b00';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Block Puzzle', 300, 50);

  // Score (big)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(score.toLocaleString(), 300, 150);
  ctx.font = '20px Arial';
  ctx.fillText('SCORE', 300, 180);

  // Stats row
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`${linesCleared} Lines`, 150, 250);
  ctx.fillText(`${bestCombo}x Combo`, 300, 250);
  if (perfectClears > 0) {
    ctx.fillText(`${perfectClears} Perfect`, 450, 250);
  }

  // Challenge text
  ctx.fillStyle = '#ff6b00';
  ctx.font = '18px Arial';
  ctx.fillText('Can you beat my score?', 300, 320);

  // Branding
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '16px Arial';
  ctx.fillText('Play at wojak.ink', 300, 380);

  return canvas.toDataURL('image/png');
};
```

#### Task 114: Create Share Modal Component
```typescript
const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  score: number;
  linesCleared: number;
  bestCombo: number;
  perfectClears: number;
}> = ({ isOpen, onClose, score, linesCleared, bestCombo, perfectClears }) => {
  const [shareImage, setShareImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generateShareImage(score, linesCleared, bestCombo, perfectClears).then(setShareImage);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <h2>Share Your Score!</h2>
        {shareImage && <img src={shareImage} alt="Score" />}
        <div className="share-buttons">
          <button onClick={() => handleNativeShare(score)}>📤 Share</button>
          <button onClick={() => handleCopyText(score, linesCleared, bestCombo)}>📋 Copy</button>
          <button onClick={() => downloadImage(shareImage)}>💾 Save</button>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
    </div>
  );
};
```

#### Task 115: Implement Native Share
```typescript
const handleNativeShare = async (score: number) => {
  const shareData = {
    title: 'Block Puzzle',
    text: `I scored ${score.toLocaleString()} in Block Puzzle! Can you beat it?`,
    url: `https://wojak.ink/games/block-puzzle?challenge=${encodeScore(score)}`,
  };

  if (navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
  } else {
    handleCopyText(score, 0, 0);
  }
};
```

#### Task 116: Create Challenge Link Encoding
```typescript
const encodeScore = (score: number): string => {
  return btoa(`${score}-${Date.now()}`);
};

const decodeChallenge = (encoded: string): { score: number } | null => {
  try {
    const decoded = atob(encoded);
    const [score] = decoded.split('-').map(Number);
    return { score };
  } catch {
    return null;
  }
};
```

#### Task 117: Check Challenge on Load
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const challenge = params.get('challenge');

  if (challenge) {
    const decoded = decodeChallenge(challenge);
    if (decoded) {
      setChallengeTarget(decoded.score);
    }
  }
}, []);
```

#### Task 118: Show Challenge Target
```typescript
{challengeTarget && (
  <div className="challenge-banner">
    <span>Beat: {challengeTarget.toLocaleString()}</span>
  </div>
)}
```

#### Task 119: Celebrate Challenge Victory
```typescript
useEffect(() => {
  if (challengeTarget && score > challengeTarget && !challengeBeaten) {
    setChallengeBeaten(true);
    triggerConfetti();
    showEpicCallout('CHALLENGE BEATEN!');
    playPerfectClearSound();
  }
}, [score, challengeTarget, challengeBeaten]);
```

#### Task 120: Create Text Share Format
```typescript
const generateTextShare = (score: number, lines: number, combo: number): string => {
  return `🧩 Block Puzzle
Score: ${score.toLocaleString()}
Lines: ${lines}
Best Combo: ${combo}x
Play: wojak.ink/games/block-puzzle`;
};
```

#### Task 121: Add Copy to Clipboard
```typescript
const handleCopyText = async (score: number, lines: number, combo: number) => {
  const text = generateTextShare(score, lines, combo);
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
};
```

#### Task 122: Add Download Image
```typescript
const downloadImage = (imageUrl: string | null) => {
  if (!imageUrl) return;
  const link = document.createElement('a');
  link.download = `block-puzzle-${Date.now()}.png`;
  link.href = imageUrl;
  link.click();
};
```

#### Task 123: Add Share Modal CSS
```css
.share-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
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
}
```

#### Task 124: Add Share Button to Game Over
```typescript
<button className="share-btn" onClick={() => setShowShareModal(true)}>
  📤 Share Score
</button>
```

#### Task 125: Track Best Combo for Share
```typescript
const [bestCombo, setBestCombo] = useState(0);

// Update when combo increases
if (combo > bestCombo) {
  setBestCombo(combo);
}
```

#### Task 126: Reset Best Combo on New Game
```typescript
// In startGame()
setBestCombo(0);
```

#### Task 127: Add Toast Notification System
```typescript
const [toast, setToast] = useState<string | null>(null);

const showToast = (message: string) => {
  setToast(message);
  setTimeout(() => setToast(null), 2000);
};
```

#### Task 128: Add Toast CSS
```css
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  animation: toastSlide 2s ease-out forwards;
  z-index: 3000;
}

@keyframes toastSlide {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
```

---

## Testing Checklist

### Sound Testing
- [ ] Combo notes play ascending scale (Do-Re-Mi-Fa-Sol)
- [ ] Line clear sounds vary by line count
- [ ] Piece spawn sound plays
- [ ] Snap sound plays on placement
- [ ] Invalid placement sound plays
- [ ] Danger heartbeat starts/stops correctly
- [ ] Perfect clear fanfare plays

### Haptic Testing (Mobile)
- [ ] Drag start has light tick
- [ ] Snap has double-tap pattern
- [ ] Line clears scale with count
- [ ] Invalid placement has error pattern
- [ ] Danger pulses periodically

### Visual Testing
- [ ] Line clears have freeze frame (2+ lines)
- [ ] Particles burst from cleared cells
- [ ] Shockwave expands from center
- [ ] Drag trails follow piece
- [ ] Ghost preview pulses
- [ ] Placement bounce animation
- [ ] Danger wobble and vignette
- [ ] Streak fire glow effects
- [ ] Perfect clear celebration

### Feature Testing
- [ ] Streak activates at 3 consecutive clears
- [ ] Perfect clear detected when grid empty
- [ ] Share image generates correctly
- [ ] Challenge links work

---

## Priority Order

1. **Phase 3** (EXPLOSIVE Line Clears) — Biggest impact
2. **Phase 1** (Sound Foundation) — Musical scale combos
3. **Phase 5** (Snap Feedback) — Every placement feels good
4. **Phase 6** (Danger System) — Tension
5. **Phase 4** (Drag Trails) — Premium feel
6. **Phase 7** (Streak Fire) — Addiction loop
7. **Phase 2** (Haptics) — Mobile polish
8. **Phase 8** (Perfect Clear) — Memorable moments
9. **Phase 9** (Combo Enhancement) — Feedback
10. **Phase 10** (Share System) — Viral growth

---

*Document created based on research from Woodoku, Tetris Effect, Candy Crush, and "Juice It or Lose It" GDC talk.*
