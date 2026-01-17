# Block Puzzle Game - Polish & Improvements

## Overview
The Block Puzzle game at `src/pages/BlockPuzzle.tsx` is functional but needs polish to match the quality standards of other games. This prompt covers improvements identified during testing.

## Current State
- **Location**: `src/pages/BlockPuzzle.tsx` and `src/pages/BlockPuzzle.css`
- **Route**: `/media/games/block-puzzle`
- **Status**: Playable, but needs refinement

---

## Task 1: Add Back Button for Navigation

The game currently has no way to exit back to the games list without using browser back button.

### Implementation
Add a back button in the top-left corner:

```tsx
// Add import
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

// Inside component
const navigate = useNavigate();

// Add to JSX (at the start of the return, inside container)
<button
  className="bp-back-btn"
  onClick={() => {
    stopAllSounds(); // If you have sound cleanup
    navigate('/games');
  }}
  aria-label="Back to games"
>
  <IonIcon icon={arrowBack} />
</button>
```

### CSS for back button
```css
.bp-back-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 22px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s ease;
}

.bp-back-btn:hover {
  background: rgba(255, 107, 0, 0.3);
  border-color: rgba(255, 107, 0, 0.5);
}

.bp-back-btn:active {
  transform: scale(0.95);
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .bp-back-btn {
    top: 8px;
    left: 8px;
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
```

---

## Task 2: Add Sound Toggle Button

Allow users to mute/unmute game sounds.

### Implementation
```tsx
// Add state
const [soundEnabled, setSoundEnabled] = useState(() => {
  return localStorage.getItem('blockPuzzleSoundEnabled') !== 'false';
});

// Toggle function
const toggleSound = useCallback(() => {
  const newState = !soundEnabled;
  setSoundEnabled(newState);
  localStorage.setItem('blockPuzzleSoundEnabled', String(newState));
  if (!newState) {
    stopAllSounds();
  }
  hapticButton();
}, [soundEnabled, hapticButton]);

// Modify sound playing to check soundEnabled
// Wrap all playSound calls:
if (soundEnabled) playBlockLand();

// Add button next to back button
<button
  className="bp-sound-btn"
  onClick={toggleSound}
  aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
>
  <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
</button>
```

### CSS
```css
.bp-sound-btn {
  position: absolute;
  top: 12px;
  left: 64px; /* Position next to back button */
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s ease;
}

.bp-sound-btn:hover {
  background: rgba(255, 107, 0, 0.3);
  border-color: rgba(255, 107, 0, 0.5);
}

@media (max-width: 480px) {
  .bp-sound-btn {
    top: 8px;
    left: 56px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
```

---

## Task 3: Improve Mobile Layout

On very small screens, ensure the game fits without scrolling.

### CSS Improvements
```css
/* Ensure full viewport usage on mobile */
.block-puzzle-container.mobile {
  padding: 4px;
  gap: 6px;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
  max-height: 100vh;
  max-height: 100dvh;
  overflow: hidden;
}

/* Adjust score panel for mobile */
@media (max-width: 480px) {
  .bp-score-panel {
    padding: 4px 12px;
    margin-top: 44px; /* Space for back button */
  }

  .bp-score-main .bp-score-value {
    font-size: 1.4rem;
  }

  .bp-score-secondary {
    font-size: 0.65rem;
    gap: 12px;
  }
}

/* Smaller piece cells on tiny screens */
@media (max-width: 360px) {
  .bp-piece-slot {
    padding: 4px;
    min-width: 50px;
    min-height: 50px;
  }

  .bp-piece-rack {
    gap: 6px;
    padding: 6px;
  }
}
```

---

## Task 4: Add Pause Functionality

Allow pausing the game (especially useful on mobile when interrupted).

### Implementation
```tsx
// Add pause state
const [isPaused, setIsPaused] = useState(false);

// Pause toggle
const togglePause = useCallback(() => {
  if (gameState !== 'playing') return;
  setIsPaused(prev => !prev);
  hapticButton();
}, [gameState, hapticButton]);

// Pause overlay JSX (add before game grid)
{isPaused && gameState === 'playing' && (
  <div className="bp-pause-overlay">
    <div className="bp-pause-content">
      <h2>Paused</h2>
      <div className="bp-pause-score">Score: {score}</div>
      <button onClick={togglePause} className="bp-resume-btn">
        Resume
      </button>
      <button onClick={() => navigate('/games')} className="bp-quit-btn">
        Quit Game
      </button>
    </div>
  </div>
)}

// Add pause button
<button
  className="bp-pause-btn"
  onClick={togglePause}
  aria-label="Pause game"
>
  <IonIcon icon={isPaused ? play : pause} />
</button>

// Disable interactions when paused
// In touch/mouse handlers, add at start:
if (isPaused) return;
```

### CSS
```css
.bp-pause-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 22px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s ease;
}

.bp-pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  backdrop-filter: blur(4px);
}

.bp-pause-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.bp-pause-content h2 {
  font-size: 2rem;
  color: #ff6b00;
  margin: 0;
}

.bp-pause-score {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
}

.bp-resume-btn {
  padding: 12px 40px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b00, #ff8533);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.bp-quit-btn {
  padding: 10px 30px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
}

.bp-quit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

---

## Task 5: Add Tutorial/Help for First-Time Players

Show brief instructions on first play.

### Implementation
```tsx
// Check if first time playing
const [showTutorial, setShowTutorial] = useState(() => {
  return !localStorage.getItem('blockPuzzleTutorialSeen');
});

// Tutorial overlay
{showTutorial && (
  <div className="bp-tutorial-overlay">
    <div className="bp-tutorial-content">
      <h2>How to Play</h2>
      <div className="bp-tutorial-steps">
        <div className="bp-tutorial-step">
          <span className="bp-step-icon">👆</span>
          <span>Drag blocks from the bottom onto the grid</span>
        </div>
        <div className="bp-tutorial-step">
          <span className="bp-step-icon">📏</span>
          <span>Fill complete rows or columns to clear them</span>
        </div>
        <div className="bp-tutorial-step">
          <span className="bp-step-icon">🎯</span>
          <span>Clear multiple lines at once for bonus points!</span>
        </div>
        <div className="bp-tutorial-step">
          <span className="bp-step-icon">⚠️</span>
          <span>Game ends when no pieces can fit</span>
        </div>
      </div>
      <button
        className="bp-tutorial-btn"
        onClick={() => {
          setShowTutorial(false);
          localStorage.setItem('blockPuzzleTutorialSeen', 'true');
        }}
      >
        Got it!
      </button>
    </div>
  </div>
)}
```

### CSS
```css
.bp-tutorial-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.bp-tutorial-content {
  max-width: 320px;
  text-align: center;
}

.bp-tutorial-content h2 {
  font-size: 1.5rem;
  color: #ff6b00;
  margin: 0 0 20px 0;
}

.bp-tutorial-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.bp-tutorial-step {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
}

.bp-step-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.bp-tutorial-btn {
  padding: 12px 40px;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b00, #ff8533);
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
```

---

## Task 6: Improve Game Over Screen

Add "Back to Games" button and improve layout.

### Update Game Over JSX
```tsx
<div className="bp-game-over-buttons">
  <button onClick={startGame} className="bp-play-btn">
    Play Again
  </button>
  <button
    onClick={() => navigate('/games')}
    className="bp-back-to-games-btn"
  >
    Back to Games
  </button>
</div>
```

### CSS
```css
.bp-back-to-games-btn {
  padding: 10px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bp-back-to-games-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}
```

---

## Task 7: Add Combo Counter Visual

Show streak when clearing multiple lines in succession.

### Implementation
```tsx
// Add combo state
const [comboCount, setComboCount] = useState(0);
const [showCombo, setShowCombo] = useState(false);

// In the line clearing logic, track combos:
if (linesCleared > 0) {
  setComboCount(prev => prev + 1);
  setShowCombo(true);
  setTimeout(() => setShowCombo(false), 1500);
} else {
  setComboCount(0);
}

// Combo display JSX (add near score panel)
{showCombo && comboCount > 1 && (
  <div className="bp-combo-display">
    <span className="bp-combo-count">{comboCount}x</span>
    <span className="bp-combo-label">COMBO!</span>
  </div>
)}
```

### CSS
```css
.bp-combo-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bp-combo-pop 1.5s ease-out forwards;
  pointer-events: none;
  z-index: 80;
}

.bp-combo-count {
  font-size: 4rem;
  font-weight: 900;
  color: #ff6b00;
  text-shadow:
    0 0 20px rgba(255, 107, 0, 0.8),
    0 0 40px rgba(255, 107, 0, 0.5);
  line-height: 1;
}

.bp-combo-label {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 4px;
}

@keyframes bp-combo-pop {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  40% {
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -70%) scale(0.8);
  }
}
```

---

## Testing Checklist

After implementing these improvements, verify:

- [ ] Back button navigates to /games
- [ ] Sound toggle works and persists across sessions
- [ ] Pause overlay appears and game freezes
- [ ] Resume continues gameplay correctly
- [ ] Tutorial shows on first play only
- [ ] Game over screen has both "Play Again" and "Back to Games"
- [ ] Combo counter displays for consecutive line clears
- [ ] All buttons work on mobile (44px minimum touch target)
- [ ] No layout overflow on small screens (360px width)
- [ ] Sound preference persists in localStorage

---

## Files to Modify

1. `src/pages/BlockPuzzle.tsx` - Add all new features
2. `src/pages/BlockPuzzle.css` - Add all new styles

## Priority Order

1. **High**: Back button (essential for navigation)
2. **High**: Sound toggle (user preference)
3. **Medium**: Pause functionality
4. **Medium**: Mobile layout improvements
5. **Low**: Tutorial overlay
6. **Low**: Combo counter visual
