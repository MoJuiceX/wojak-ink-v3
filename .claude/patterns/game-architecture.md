# Game Architecture Patterns

<!-- Last updated: 2026-01-18 -->
<!-- Games: 12 | All use canvas rendering -->

## All Games (src/pages/)

| Game | File | CSS Prefix | Type |
|------|------|------------|------|
| FlappyOrange | FlappyOrange.tsx | `fo-` | Endless runner |
| BlockPuzzle | BlockPuzzle.tsx | `bp-` | Tetris-style |
| CitrusDrop | CitrusDrop.tsx | `cd-` | Match-3 |
| OrangeSnake | OrangeSnake.tsx | `osn-` | Snake |
| BrickBreaker | BrickBreaker.tsx | `bb-` | Breakout |
| WojakWhack | WojakWhack.tsx | `ww-` | Whack-a-mole |
| OrangeStack | OrangeStack.tsx | `os-` | Stacking |
| MemoryMatch | MemoryMatch.tsx | `mm-` | Memory |
| OrangePong | OrangePong.tsx | `pong-` | Pong |
| WojakRunner | WojakRunner.tsx | `wr-` | Runner |
| OrangeJuggle | OrangeJuggle.tsx | `oj-` | Juggling |
| KnifeGame | KnifeGame.tsx | `kg-` | Knife throwing |

---

## Standard Game Template

All games follow this structure:

```typescript
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameEffects, GameEffects } from '@/components/media';
import './GameName.css';

type GameState = 'idle' | 'playing' | 'gameover';

const GameName = () => {
  // === STATE ===
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gameNameHighScore') || '0', 10);
  });
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // === HOOKS ===
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { soundEnabled, toggleSound, playBlockLand, playCombo, playGameOver } = useGameSounds();
  const { hapticScore, hapticCombo, hapticGameOver } = useGameHaptics();
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
    scoreSubmitted,
    isNewPersonalBest
  } = useLeaderboard('game-name');
  const { effects, triggerConfetti, addScorePopup, showEpicCallout } = useGameEffects();

  // === REFS ===
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // === GAME LOGIC ===
  // ... game-specific logic ...

  // === RENDER ===
  return (
    <div className={`game-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Sound Toggle */}
      <button className="gn-sound-btn" onClick={toggleSound}>
        <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
      </button>

      {/* Visual Effects */}
      <GameEffects effects={effects} accentColor="#ff6b00" />

      {/* Game Canvas */}
      <canvas ref={canvasRef} className="gn-canvas" />

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <GameOverOverlay />
      )}
    </div>
  );
};
```

---

## Game Over UI Pattern (CRITICAL)

All games must use this exact structure:

```tsx
{gameState === 'gameover' && (
  <div className="gn-game-over-overlay" onClick={(e) => e.stopPropagation()}>
    {/* Main Game Over Content - stays fixed */}
    <div className="gn-game-over-content">
      <div className="gn-game-over-left">
        {/* Emoji or sad image */}
        <div className="gn-game-over-emoji">🎮</div>
      </div>
      <div className="gn-game-over-right">
        <h2 className="gn-game-over-title">Game Over!</h2>

        <div className="gn-game-over-score">
          <span className="gn-score-value">{score}</span>
          <span className="gn-score-label">points</span>
        </div>

        {isNewPersonalBest && score > 0 && (
          <div className="gn-new-record">New Personal Best!</div>
        )}

        {isSignedIn && (
          <div className="gn-submitted">
            {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
          </div>
        )}

        {/* Buttons: Play Again + Leaderboard - SIDE BY SIDE */}
        <div className="gn-game-over-buttons">
          <button onClick={startGame} className="gn-play-btn">
            Play Again
          </button>
          <button
            onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
            className="gn-leaderboard-btn"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>

    {/* Leaderboard Panel - CENTERED OVERLAY MODAL */}
    {showLeaderboardPanel && (
      <div className="gn-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
        <div className="gn-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
          <div className="gn-leaderboard-header">
            <h3>Leaderboard</h3>
            <button className="gn-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
          </div>
          <div className="gn-leaderboard-list">
            {Array.from({ length: 10 }, (_, index) => {
              const entry = globalLeaderboard[index];
              const isCurrentUser = entry && score === entry.score;
              return (
                <div key={index} className={`gn-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                  <span className="gn-leaderboard-rank">#{index + 1}</span>
                  <span className="gn-leaderboard-name">{entry?.displayName || '---'}</span>
                  <span className="gn-leaderboard-score">{entry?.score ?? '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* Back to Games - BOTTOM RIGHT SAFE AREA */}
    <button
      onClick={() => navigate('/games')}  // NOT window.history.back()!
      className="gn-back-to-games-btn"
    >
      Back to Games
    </button>
  </div>
)}
```

---

## CSS Z-Index Hierarchy

```css
/* Standard z-index values - DO NOT CHANGE */
.gn-game-over-overlay { z-index: 500; }
.gn-leaderboard-overlay { z-index: 700; }
.gn-back-to-games-btn { z-index: 100; }  /* Inside overlay, so relative */

/* Modal overlays outside game */
.modal-overlay { z-index: 1000; }
```

---

## CSS Class Naming Convention

**CRITICAL**: Every game MUST prefix all CSS classes with game initials to avoid conflicts.

```css
/* FlappyOrange uses fo- prefix */
.fo-game-over-overlay { }
.fo-leaderboard-panel { }
.fo-play-btn { }

/* BlockPuzzle uses bp- prefix */
.bp-game-over-overlay { }
.bp-leaderboard-panel { }
.bp-play-btn { }
```

---

## Game Difficulty Tuning Pattern

Based on FlappyOrange success (10-15 sec easy play before difficulty ramps):

```typescript
// Physics constants - start forgiving
const PHYSICS = {
  GRAVITY: 0.2,           // Lower = floatier
  JUMP_VELOCITY: -6,      // Less negative = gentler jump
  MAX_FALL_SPEED: 5,      // Lower = slower fall
};

// Hitbox - slightly smaller than visual
const PLAYER_RADIUS = 14;  // Visual might be 18

// Gaps/spacing - generous
const OBSTACLE_GAP = 220;     // Wide gaps
const OBSTACLE_SPACING = 320; // Lots of time between

// Speed ramp - flat for first 10-15 seconds, then gradual
const getSpeed = (score: number) => {
  const baseSpeed = 1.5;
  const rampStart = 5;  // Don't increase until score 5
  const rampRate = 0.15; // Small increments
  const increment = Math.max(0, Math.floor((score - rampStart) / 20));
  return baseSpeed + increment * rampRate;
};

// First obstacle spawns far away (3 sec of free play)
const firstObstacleDelay = CANVAS_WIDTH + 300;
```

---

## Required Hooks Checklist

When creating a new game, ensure these hooks are imported and used:

- [ ] `useGameSounds()` - Audio feedback
- [ ] `useGameHaptics()` - Haptic feedback
- [ ] `useLeaderboard('game-id')` - Global leaderboard
- [ ] `useGameEffects()` - Confetti, score popups, callouts
- [ ] `useIsMobile()` - Responsive behavior
- [ ] `useNavigate()` - Navigation (NOT window.history)

---

## Score Popup Pattern

**CRITICAL**: `addScorePopup()` expects a STRING, not a number!

```typescript
// WRONG - will crash
addScorePopup(scoreAmount, x, y);

// CORRECT - use template literal
addScorePopup(`+${scoreAmount}`, x, y);
```

---

## Sound Effects Pattern

Always check `soundEnabled` before playing:

```typescript
// In score handler
if (soundEnabled) {
  playBlockLand();
  if (combo >= 3) playCombo();
}

// In game over
if (soundEnabled) playGameOver();
```

---

## High Score Persistence

```typescript
// Initialize from localStorage
const [highScore, setHighScore] = useState(() => {
  return parseInt(localStorage.getItem('gameNameHighScore') || '0', 10);
});

// Update when score exceeds
useEffect(() => {
  if (score > highScore) {
    setHighScore(score);
    localStorage.setItem('gameNameHighScore', String(score));
  }
}, [score, highScore]);
```

---

## Common Gotchas

1. **Navigation Bug**: Use `navigate('/games')` NOT `window.history.back()`
2. **Score Type**: `addScorePopup()` expects string, not number
3. **CSS Conflicts**: Always prefix classes with game initials
4. **Sound Check**: Always check `soundEnabled` before `play*()`
5. **Leaderboard Click-Through**: Use `e.stopPropagation()` on panel
6. **Mobile Touch**: Test touch events, not just mouse
7. **@ts-nocheck**: All games use this - TypeScript issues are known

---

## New Game Checklist

1. [ ] Create `GameName.tsx` in `src/pages/`
2. [ ] Create `GameName.css` with prefixed classes
3. [ ] Add route in `src/App.tsx` (lazy loaded)
4. [ ] Add to GamesHub grid
5. [ ] Register leaderboard ID in backend
6. [ ] Import all required hooks
7. [ ] Follow Game Over UI pattern exactly
8. [ ] Test mobile touch controls
9. [ ] Test leaderboard submission
10. [ ] Tune difficulty for 10-15 sec easy intro
