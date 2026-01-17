# Block Puzzle - High-Impact Effects & Polish

## Overview
The Block Puzzle game needs to match the quality and "stickiness" of other Wojak.ink games. This prompt adds immersive effects: screen shake, particle systems, satisfying animations, combo feedback, and visual polish to make the game addictive and entertaining.

## Current State
- **Files**: `src/pages/BlockPuzzle.tsx` and `src/pages/BlockPuzzle.css`
- **Route**: `/media/games/block-puzzle`
- **Status**: Functional but lacks "juice" - needs more visual feedback and effects

---

## CRITICAL FIX: Piece Slot Visual Consistency

The piece slots at the bottom should maintain visual consistency. Currently pieces of different sizes look unbalanced within their slots.

### Problem
Different shaped pieces (single block vs 5-block line) look visually unbalanced in slots.

### Solution - Scale pieces to fit slot uniformly

Update the piece preview rendering to scale pieces proportionally:

```tsx
// In the piece rack rendering section, add scaling logic:
{pieces.map(piece => {
  const canPlace = canPlaceAnywhere(grid, piece);
  const isDragging = draggedPieceId === piece.id;

  // Calculate piece dimensions for scaling
  const pieceWidth = piece.shape[0].length;
  const pieceHeight = piece.shape.length;
  const maxDimension = Math.max(pieceWidth, pieceHeight);

  // Scale factor to fit in slot (target ~80px for the largest dimension)
  const targetSize = isMobile ? 70 : 80;
  const scaleFactor = maxDimension <= 2 ? 1 : targetSize / (maxDimension * (PIECE_CELL_SIZE + 1));

  return (
    <div
      key={piece.id}
      className={`bp-piece-slot ${!canPlace ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={(e) => handleMouseDown(e, piece.id)}
      onTouchStart={(e) => handleTouchStart(e, piece.id)}
    >
      <div
        className="bp-piece-preview"
        style={{ transform: `scale(${scaleFactor})` }}
      >
        {/* existing piece rendering */}
      </div>
    </div>
  );
})}
```

### CSS Addition
```css
.bp-piece-preview {
  display: flex;
  flex-direction: column;
  gap: 1px;
  transform-origin: center center;
  transition: transform 0.15s ease;
}
```

---

## Task 1: Enhanced Piece Placement Animation

When a piece is placed, it should feel satisfying with a "landing" effect.

### Update the just-placed animation
```css
/* Enhanced piece landing */
.bp-grid-cell.just-placed {
  animation: bp-piece-land-enhanced 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bp-piece-land-enhanced {
  0% {
    transform: scale(1.3) translateY(-10px);
    opacity: 0.7;
    filter: brightness(1.5);
  }
  50% {
    transform: scale(0.9);
    filter: brightness(1.2);
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1);
  }
}

/* Add glow pulse on placement */
.bp-grid-cell.just-placed::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 6px;
  background: inherit;
  opacity: 0;
  filter: blur(8px);
  animation: bp-glow-pulse 0.4s ease-out;
  z-index: -1;
}

@keyframes bp-glow-pulse {
  0% { opacity: 0.8; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.3); }
}
```

---

## Task 2: Spectacular Line Clear Animation

Line clears should be the most satisfying moment. Add particles, flash, and chain reaction effect.

### Enhanced clearing animation
```css
/* Staggered cell clearing with white flash */
.bp-grid-cell.clearing {
  animation: bp-cell-clear-enhanced 0.5s ease-out forwards;
}

/* Add delay based on position for wave effect */
.bp-grid-cell.clearing:nth-child(1) { animation-delay: 0ms; }
.bp-grid-cell.clearing:nth-child(2) { animation-delay: 20ms; }
.bp-grid-cell.clearing:nth-child(3) { animation-delay: 40ms; }
.bp-grid-cell.clearing:nth-child(4) { animation-delay: 60ms; }
.bp-grid-cell.clearing:nth-child(5) { animation-delay: 80ms; }
.bp-grid-cell.clearing:nth-child(6) { animation-delay: 100ms; }
.bp-grid-cell.clearing:nth-child(7) { animation-delay: 120ms; }
.bp-grid-cell.clearing:nth-child(8) { animation-delay: 140ms; }

@keyframes bp-cell-clear-enhanced {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  20% {
    transform: scale(1.2);
    background: #fff !important;
    box-shadow: 0 0 30px #ff6b00, 0 0 60px #ff6b00;
    filter: brightness(2);
  }
  40% {
    transform: scale(1.4) rotate(5deg);
  }
  100% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
}
```

---

## Task 3: Screen Shake for Big Moments

Add screen shake when clearing 2+ lines.

### Enhanced shake animation
```css
.bp-game-grid.screen-shake-light {
  animation: bp-shake-light 0.2s ease-out;
}

.bp-game-grid.screen-shake-medium {
  animation: bp-shake-medium 0.3s ease-out;
}

.bp-game-grid.screen-shake-heavy {
  animation: bp-shake-heavy 0.4s ease-out;
}

@keyframes bp-shake-light {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-3px) translateY(1px); }
  75% { transform: translateX(3px) translateY(-1px); }
}

@keyframes bp-shake-medium {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  20% { transform: translateX(-5px) translateY(2px) rotate(-0.5deg); }
  40% { transform: translateX(5px) translateY(-2px) rotate(0.5deg); }
  60% { transform: translateX(-3px) translateY(1px) rotate(-0.3deg); }
  80% { transform: translateX(3px) translateY(-1px) rotate(0.3deg); }
}

@keyframes bp-shake-heavy {
  0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
  10% { transform: translateX(-8px) translateY(3px) rotate(-1deg); }
  20% { transform: translateX(8px) translateY(-3px) rotate(1deg); }
  30% { transform: translateX(-6px) translateY(2px) rotate(-0.8deg); }
  40% { transform: translateX(6px) translateY(-2px) rotate(0.8deg); }
  50% { transform: translateX(-4px) translateY(1px) rotate(-0.5deg); }
  60% { transform: translateX(4px) translateY(-1px) rotate(0.5deg); }
  70% { transform: translateX(-2px) translateY(1px) rotate(-0.3deg); }
  80% { transform: translateX(2px) translateY(-1px) rotate(0.3deg); }
}
```

### Update shake logic in TSX
```tsx
// Add state for shake level
const [shakeLevel, setShakeLevel] = useState<'none' | 'light' | 'medium' | 'heavy'>('none');

// In line clearing logic:
if (linesCleared === 1) {
  setShakeLevel('light');
} else if (linesCleared === 2) {
  setShakeLevel('medium');
} else if (linesCleared >= 3) {
  setShakeLevel('heavy');
}

// Clear shake after animation
setTimeout(() => setShakeLevel('none'), 400);

// Update grid className:
<div
  ref={gridRef}
  className={`bp-game-grid ${shakeLevel !== 'none' ? `screen-shake-${shakeLevel}` : ''}`}
>
```

---

## Task 4: Floating Score Popup

Show score gained with animated floating text.

### Add floating score component
```tsx
// Add state for floating scores
const [floatingScores, setFloatingScores] = useState<Array<{
  id: string;
  value: number;
  x: number;
  y: number;
}>>([]);

// Function to show floating score
const showFloatingScore = useCallback((value: number, x: number, y: number) => {
  const id = `score-${Date.now()}`;
  setFloatingScores(prev => [...prev, { id, value, x, y }]);

  // Remove after animation
  setTimeout(() => {
    setFloatingScores(prev => prev.filter(s => s.id !== id));
  }, 1000);
}, []);

// Call when placing piece:
// After calculating score, get the grid center position
const gridRect = gridRef.current?.getBoundingClientRect();
if (gridRect) {
  showFloatingScore(basePoints, gridRect.left + gridRect.width / 2, gridRect.top + gridRect.height / 2);
}

// Render floating scores
{floatingScores.map(score => (
  <div
    key={score.id}
    className="bp-floating-score"
    style={{
      left: score.x,
      top: score.y,
    }}
  >
    +{score.value}
  </div>
))}
```

### CSS for floating score
```css
.bp-floating-score {
  position: fixed;
  font-size: 2rem;
  font-weight: 900;
  color: #ff6b00;
  text-shadow:
    0 0 10px rgba(255, 107, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 200;
  animation: bp-score-float 1s ease-out forwards;
  transform: translate(-50%, -50%);
}

@keyframes bp-score-float {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  40% {
    transform: translate(-50%, -70%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(0.8);
  }
}

/* Special styling for big scores */
.bp-floating-score.big {
  font-size: 3rem;
  color: #ffd700;
}
```

---

## Task 5: Combo Counter with Visual Flair

Track and display consecutive line clears.

### Add combo system
```tsx
// Add combo state
const [combo, setCombo] = useState(0);
const [showCombo, setShowCombo] = useState(false);
const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

// In line clearing logic:
if (linesCleared > 0) {
  // Increment combo
  const newCombo = combo + 1;
  setCombo(newCombo);
  setShowCombo(true);

  // Clear combo timer
  if (comboTimeoutRef.current) {
    clearTimeout(comboTimeoutRef.current);
  }

  // Reset combo after 3 seconds of no clears
  comboTimeoutRef.current = setTimeout(() => {
    setCombo(0);
    setShowCombo(false);
  }, 3000);

  // Apply combo multiplier to score
  const comboMultiplier = Math.min(newCombo, 5); // Cap at 5x
  const bonusPoints = linePoints * comboMultiplier;

  // Show combo feedback
  if (newCombo >= 2) {
    showEpicCallout(`${newCombo}x COMBO!`);
  }
}

// Render combo display
{showCombo && combo >= 2 && (
  <div className={`bp-combo-display combo-${Math.min(combo, 5)}`}>
    <div className="bp-combo-multiplier">{combo}x</div>
    <div className="bp-combo-text">COMBO</div>
  </div>
)}
```

### CSS for combo display
```css
.bp-combo-display {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bp-combo-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 80;
}

.bp-combo-multiplier {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(180deg, #ff6b00, #ff4400);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 20px rgba(255, 107, 0, 0.5);
}

.bp-combo-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 3px;
}

/* Combo level colors */
.bp-combo-display.combo-2 .bp-combo-multiplier {
  background: linear-gradient(180deg, #ff6b00, #ff4400);
}

.bp-combo-display.combo-3 .bp-combo-multiplier {
  background: linear-gradient(180deg, #ff4400, #ff0044);
}

.bp-combo-display.combo-4 .bp-combo-multiplier {
  background: linear-gradient(180deg, #ff0044, #aa00ff);
}

.bp-combo-display.combo-5 .bp-combo-multiplier {
  background: linear-gradient(180deg, #ffd700, #ff6b00);
  animation: bp-combo-glow 0.5s ease-in-out infinite alternate;
}

@keyframes bp-combo-appear {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.5) rotate(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateY(-50%) scale(1) rotate(0deg);
  }
}

@keyframes bp-combo-glow {
  0% { filter: drop-shadow(0 0 10px #ffd700); }
  100% { filter: drop-shadow(0 0 30px #ffd700); }
}
```

---

## Task 6: Piece Hover/Pickup Animation

Make pieces feel responsive when interacted with.

### CSS for piece interactions
```css
/* Piece pickup animation */
.bp-piece-slot:not(.disabled):hover .bp-piece-preview {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.bp-piece-slot:not(.disabled):active .bp-piece-preview {
  transform: scale(0.95);
}

/* Floating piece while dragging */
.bp-drag-preview {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  animation: bp-drag-pulse 1s ease-in-out infinite;
}

@keyframes bp-drag-pulse {
  0%, 100% {
    filter: drop-shadow(0 8px 20px rgba(255, 107, 0, 0.4));
  }
  50% {
    filter: drop-shadow(0 12px 30px rgba(255, 107, 0, 0.6));
  }
}

/* Valid placement preview glow */
.bp-grid-cell.preview {
  background: rgba(255, 107, 0, 0.4) !important;
  border: 2px solid #ff6b00;
  box-shadow: inset 0 0 10px rgba(255, 107, 0, 0.5);
  animation: bp-preview-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes bp-preview-pulse {
  0% { box-shadow: inset 0 0 10px rgba(255, 107, 0, 0.3); }
  100% { box-shadow: inset 0 0 20px rgba(255, 107, 0, 0.6); }
}

/* Invalid placement */
.bp-grid-cell.preview-invalid {
  background: rgba(255, 50, 50, 0.3) !important;
  border: 2px dashed #ff4444;
  animation: bp-invalid-shake 0.1s ease-in-out;
}

@keyframes bp-invalid-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

---

## Task 7: Background Ambient Animation

Add subtle background effects that respond to gameplay.

### CSS for ambient effects
```css
/* Ambient grid glow that intensifies with score */
.block-puzzle-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 107, 0, 0.1) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
  opacity: var(--ambient-intensity, 0.3);
  transition: opacity 0.5s ease;
}

/* Grid border glow on activity */
.bp-game-grid {
  transition: box-shadow 0.3s ease;
}

.bp-game-grid.active {
  box-shadow:
    0 0 40px rgba(255, 107, 0, 0.2),
    0 0 80px rgba(255, 107, 0, 0.1),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
}
```

---

## Task 8: Game Over Dramatic Effect

Make game over feel impactful.

### Enhanced game over animation
```css
.bp-game-over-overlay {
  animation: bp-game-over-appear 0.5s ease-out;
}

@keyframes bp-game-over-appear {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.bp-game-over-content {
  animation: bp-game-over-content 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes bp-game-over-content {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Pulsing score on game over */
.bp-game-over-score .bp-score-value {
  animation: bp-final-score-pulse 2s ease-in-out infinite;
}

@keyframes bp-final-score-pulse {
  0%, 100% {
    text-shadow: 0 0 30px rgba(255, 107, 0, 0.5);
  }
  50% {
    text-shadow: 0 0 50px rgba(255, 107, 0, 0.8), 0 0 80px rgba(255, 107, 0, 0.4);
  }
}
```

---

## Task 9: Sound Enhancement Integration

Ensure sounds are playing at the right moments with haptics.

### Sound trigger points (verify these exist)
```tsx
// On piece pickup
hapticButton();

// On piece placement
if (soundEnabled) playBlockLand();
hapticScore();

// On line clear (1 line)
if (soundEnabled) playCombo(1);
hapticCombo(1);

// On double clear
if (soundEnabled) playCombo(2);
hapticCombo(2);

// On triple clear
if (soundEnabled) playPerfectBonus();
hapticCombo(3);
triggerConfetti();

// On quad+ clear
if (soundEnabled) playPerfectBonus();
hapticHighScore();
triggerConfetti();

// On game over
if (soundEnabled) playGameOver();
hapticGameOver();
```

---

## Task 10: New Piece Spawn Animation

When new pieces appear after placing one, animate them in.

### Add spawn animation class
```tsx
// Track newly spawned piece
const [newPieceId, setNewPieceId] = useState<string | null>(null);

// When replacing a piece:
const newPiece = generateRandomPiece();
setNewPieceId(newPiece.id);
setTimeout(() => setNewPieceId(null), 500);

// In render:
<div
  className={`bp-piece-slot ${piece.id === newPieceId ? 'spawning' : ''}`}
>
```

### CSS for spawn animation
```css
.bp-piece-slot.spawning {
  animation: bp-piece-spawn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bp-piece-slot.spawning .bp-piece-preview {
  animation: bp-piece-spawn-inner 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bp-piece-spawn {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bp-piece-spawn-inner {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}
```

---

## Testing Checklist

After implementing these effects:

- [ ] Pieces scale proportionally within slots
- [ ] Piece placement has satisfying bounce animation
- [ ] Line clears have staggered white flash effect
- [ ] Screen shakes on multi-line clears (intensity varies)
- [ ] Floating score numbers appear on placement
- [ ] Combo counter shows and increments
- [ ] Combo resets after 3 seconds of no clears
- [ ] Piece hover shows brightness increase
- [ ] Drag preview has pulsing shadow
- [ ] Valid placement preview pulses orange
- [ ] Invalid placement shakes red
- [ ] Game over has blur + content slide animation
- [ ] New pieces spawn with rotation animation
- [ ] All sounds trigger at correct moments
- [ ] All haptics trigger at correct moments

---

## Performance Notes

- Use `will-change: transform` sparingly (only on actively animating elements)
- Remove animation classes after completion to prevent memory buildup
- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `box-shadow` on many elements simultaneously
- Consider using `requestAnimationFrame` for particle systems if added

---

## Files to Modify

1. `src/pages/BlockPuzzle.tsx` - Add state for effects, update event handlers
2. `src/pages/BlockPuzzle.css` - Add all animation keyframes and classes
