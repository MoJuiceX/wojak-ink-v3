# Game Over Screen Standardization Guide

> Reference for standardizing game over screens to match the FlappyOrange "gold standard" design.

## Quick Reference

| Completed Game | Complexity | File Location |
|----------------|------------|---------------|
| FlappyOrange | Gold Standard | `src/pages/FlappyOrange.tsx` |
| MemoryMatch | Low | `src/pages/MemoryMatch.tsx` |
| WojakRunner | Medium | `src/pages/WojakRunner.tsx` |
| Merge2048 | High | `src/games/Merge2048/Merge2048Game.tsx` |
| ColorReaction | High | `src/pages/ColorReaction.tsx` |

---

## Design Standard

### Visual Requirements
- Dark modal overlay with blur (`rgba(0, 0, 0, 0.85)` + `backdrop-filter: blur(8px)`)
- Split layout: Sad NFT image on left, content on right
- Orange "Game Over!" title (`#ff6b00`)
- Large score display with pulsing glow animation
- Stats section (game-specific metrics)
- "New Personal Best!" badge (gold, glowing)
- 3 buttons in row: **Play Again** (orange) | **Share** (orange) | **Leaderboard** (gray)
- Leaderboard panel overlay (click outside to close)
- "Back to Games" button (bottom right)

### Functional Requirements
- Screenshot captured BEFORE game over state change
- High score persisted to localStorage
- Share button uses `ShareButton` component (handles modal internally)
- No "Enter your name" input fields
- Leaderboard shows top 10 from global leaderboard

---

## Step-by-Step Process

### Step 1: Add Imports

```tsx
import { ShareButton } from '@/systems/sharing';
import { captureGameArea } from '@/systems/sharing/captureDOM';
```

### Step 2: Add SAD_IMAGES Constant

Add near top of file, after imports:

```tsx
// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) =>
  `/assets/Games/games_media/sad_runner_${i + 1}.png`
);
```

### Step 3: Update useLeaderboard Hook

Change from:
```tsx
const { submitScore, isSignedIn } = useLeaderboard('game-id');
```

To:
```tsx
const { submitScore, isSignedIn, leaderboard: globalLeaderboard, userDisplayName, isSubmitting } = useLeaderboard('game-id');
```

### Step 4: Add State Variables

Add these state variables (use game-specific prefix in comments):

```tsx
// Game over screen states
const [sadImage, setSadImage] = useState<string | null>(null);
const [gameScreenshot, setGameScreenshot] = useState<string | null>(null);
const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
const [highScore, setHighScore] = useState(() => {
  return parseInt(localStorage.getItem('gameNameHighScore') || '0', 10);
});
```

### Step 5: Add Game Area Ref (if not exists)

```tsx
const gameAreaRef = useRef<HTMLDivElement>(null);
```

Add ref to game container div:
```tsx
<div className="game-area" ref={gameAreaRef}>
```

### Step 6: Add Screenshot Capture Before Game Over

Find where game over is triggered. Add this BEFORE the state change:

```tsx
// Capture screenshot and set sad image before game over
if (gameAreaRef.current) {
  // Set sad image
  setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);

  // Check for personal best
  const currentHighScore = highScore;
  if (currentScore > currentHighScore) {
    setIsNewPersonalBest(true);
    setHighScore(currentScore);
    localStorage.setItem('gameNameHighScore', String(currentScore));
  } else {
    setIsNewPersonalBest(false);
  }

  // Capture screenshot (async, non-blocking)
  captureGameArea(gameAreaRef.current).then(screenshot => {
    if (screenshot) setGameScreenshot(screenshot);
  });
}
```

**For canvas-based games**, use canvas.toDataURL instead:
```tsx
if (canvasRef.current) {
  setGameScreenshot(canvasRef.current.toDataURL('image/png'));
}
```

### Step 7: Replace Game Over JSX

Replace existing game over overlay with this template (change `PREFIX` to game prefix like `cr-`, `m2048-`, etc.):

```tsx
{/* Game Over Overlay - FlappyOrange Style */}
{gameState === 'gameover' && (
  <div className="PREFIX-game-over-overlay" onClick={(e) => e.stopPropagation()}>
    {/* Main Game Over Content */}
    <div className="PREFIX-game-over-content">
      <div className="PREFIX-game-over-left">
        {sadImage ? (
          <img src={sadImage} alt="Game Over" className="PREFIX-sad-image" />
        ) : (
          <div className="PREFIX-game-over-emoji">🍊</div>
        )}
      </div>
      <div className="PREFIX-game-over-right">
        <h2 className="PREFIX-game-over-title">Game Over!</h2>

        <div className="PREFIX-game-over-score">
          <span className="PREFIX-score-value">{score}</span>
          <span className="PREFIX-score-label">points</span>
        </div>

        <div className="PREFIX-game-over-stats">
          <div className="PREFIX-stat">
            <span className="PREFIX-stat-value">{highScore}</span>
            <span className="PREFIX-stat-label">best</span>
          </div>
          {/* Add more stats as needed */}
        </div>

        {isNewPersonalBest && score > 0 && (
          <div className="PREFIX-new-record">New Personal Best!</div>
        )}

        {isSignedIn && (
          <div className="PREFIX-submitted">
            {isSubmitting ? 'Saving...' : `Saved as ${userDisplayName}!`}
          </div>
        )}

        {/* Buttons: Play Again + Share + Leaderboard */}
        <div className="PREFIX-game-over-buttons">
          <button onClick={handleRestart} className="PREFIX-play-btn">
            Play Again
          </button>
          <ShareButton
            scoreData={{
              gameId: 'game-id',
              gameName: 'Game Name',
              score: score,
              highScore: highScore,
              isNewHighScore: isNewPersonalBest,
            }}
            screenshot={gameScreenshot}
            className="PREFIX-share-btn"
          />
          <button
            onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
            className="PREFIX-leaderboard-btn"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>

    {/* Leaderboard Panel */}
    {showLeaderboardPanel && (
      <div className="PREFIX-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
        <div className="PREFIX-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
          <div className="PREFIX-leaderboard-header">
            <h3>Leaderboard</h3>
            <button className="PREFIX-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
          </div>
          <div className="PREFIX-leaderboard-list">
            {Array.from({ length: 10 }, (_, index) => {
              const entry = globalLeaderboard[index];
              const isCurrentUser = entry && score === entry.score;
              return (
                <div key={index} className={`PREFIX-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                  <span className="PREFIX-leaderboard-rank">#{index + 1}</span>
                  <span className="PREFIX-leaderboard-name">{entry?.displayName || '---'}</span>
                  <span className="PREFIX-leaderboard-score">{entry?.score ?? '-'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}

    {/* Back to Games */}
    <button
      onClick={() => { window.location.href = '/games'; }}
      className="PREFIX-back-to-games-btn"
    >
      Back to Games
    </button>
  </div>
)}
```

### Step 8: Delete Old Code

Remove any of these if they exist:
- Guest name input form and related state (`playerName`, `saveScoreLocal`, etc.)
- Old share modal/button code
- Old game over JSX

---

## CSS Template

Add this to the game's CSS file. Replace `PREFIX` with game prefix (e.g., `cr-`, `m2048-`, `bp-`):

```css
/* ============================================
   GAME OVER OVERLAY - FlappyOrange Style
   ============================================ */

.PREFIX-game-over-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  pointer-events: auto;
  padding: 24px;
  animation: PREFIX-game-over-appear 0.4s ease-out;
}

@keyframes PREFIX-game-over-appear {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.PREFIX-game-over-content {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 680px;
  width: 100%;
  animation: PREFIX-game-over-content 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes PREFIX-game-over-content {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.PREFIX-game-over-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.PREFIX-sad-image {
  width: 240px;
  height: 240px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.PREFIX-game-over-emoji {
  font-size: 10rem;
}

.PREFIX-game-over-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  flex: 1;
}

.PREFIX-game-over-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #ff6b00;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 20px rgba(255, 107, 0, 0.3);
}

.PREFIX-game-over-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 12px 0;
}

.PREFIX-game-over-score .PREFIX-score-value {
  font-size: 5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 40px rgba(255, 107, 0, 0.6);
  line-height: 1;
  animation: PREFIX-final-score-pulse 2s ease-in-out infinite;
}

@keyframes PREFIX-final-score-pulse {
  0%, 100% {
    text-shadow: 0 0 40px rgba(255, 107, 0, 0.6);
  }
  50% {
    text-shadow: 0 0 60px rgba(255, 107, 0, 0.9), 0 0 100px rgba(255, 107, 0, 0.5);
  }
}

.PREFIX-game-over-score .PREFIX-score-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-top: 4px;
}

.PREFIX-game-over-stats {
  display: flex;
  gap: 32px;
  margin: 16px 0;
}

.PREFIX-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.PREFIX-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b00;
}

.PREFIX-stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.PREFIX-new-record {
  font-size: 1.1rem;
  color: #ffd700;
  font-weight: 700;
  margin-top: 4px;
  animation: PREFIX-glow 1s ease-in-out infinite alternate;
}

@keyframes PREFIX-glow {
  from { text-shadow: 0 0 10px #ffd700; }
  to { text-shadow: 0 0 30px #ffd700, 0 0 60px #ffa500; }
}

.PREFIX-submitted {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  min-height: 1.4em;
}

.PREFIX-game-over-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.PREFIX-play-btn {
  padding: 14px 36px;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b00, #ff8533);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.PREFIX-play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(255, 107, 0, 0.5);
}

.PREFIX-play-btn:active {
  transform: translateY(0);
}

.PREFIX-share-btn {
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #FF6B00, #FF8533);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  box-shadow: 0 4px 20px rgba(255, 107, 0, 0.4);
}

.PREFIX-share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(255, 107, 0, 0.5);
}

.PREFIX-leaderboard-btn {
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.PREFIX-leaderboard-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.PREFIX-back-to-games-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 100;
}

.PREFIX-back-to-games-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.4);
}

/* Leaderboard Overlay & Panel */
.PREFIX-leaderboard-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 700;
  animation: PREFIX-fade-in 0.2s ease;
}

@keyframes PREFIX-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.PREFIX-leaderboard-panel {
  width: 360px;
  max-width: 90%;
  max-height: 80%;
  background: rgba(20, 20, 30, 0.98);
  border: 1px solid rgba(255, 107, 0, 0.4);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(20px);
  animation: PREFIX-scale-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow-y: auto;
}

@keyframes PREFIX-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.PREFIX-leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.PREFIX-leaderboard-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff6b00;
}

.PREFIX-leaderboard-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.PREFIX-leaderboard-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.PREFIX-leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.PREFIX-leaderboard-entry {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: background 0.2s ease;
}

.PREFIX-leaderboard-entry:hover {
  background: rgba(255, 255, 255, 0.08);
}

.PREFIX-leaderboard-entry.current-user {
  background: rgba(255, 107, 0, 0.2);
  border: 1px solid rgba(255, 107, 0, 0.5);
}

.PREFIX-leaderboard-rank {
  width: 36px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 700;
  font-size: 0.9rem;
}

.PREFIX-leaderboard-entry:nth-child(1) .PREFIX-leaderboard-rank { color: #FFD700; }
.PREFIX-leaderboard-entry:nth-child(2) .PREFIX-leaderboard-rank { color: #C0C0C0; }
.PREFIX-leaderboard-entry:nth-child(3) .PREFIX-leaderboard-rank { color: #CD7F32; }

.PREFIX-leaderboard-name {
  flex: 1;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.PREFIX-leaderboard-score {
  color: #ff6b00;
  font-weight: 700;
  min-width: 50px;
  text-align: right;
  font-size: 1rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .PREFIX-game-over-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .PREFIX-sad-image {
    width: 180px;
    height: 180px;
  }

  .PREFIX-game-over-title {
    font-size: 2rem;
  }

  .PREFIX-game-over-score .PREFIX-score-value {
    font-size: 3.5rem;
  }

  .PREFIX-game-over-score .PREFIX-score-label {
    font-size: 0.9rem;
  }

  .PREFIX-stat-value {
    font-size: 1.6rem;
  }

  .PREFIX-game-over-buttons {
    flex-direction: row;
    width: 100%;
    gap: 10px;
  }

  .PREFIX-play-btn,
  .PREFIX-leaderboard-btn,
  .PREFIX-share-btn {
    flex: 1;
    padding: 12px 16px;
    font-size: 0.95rem;
    min-width: auto;
  }

  .PREFIX-back-to-games-btn {
    bottom: 16px;
    right: 16px;
    padding: 8px 16px;
    font-size: 0.8rem;
  }

  .PREFIX-leaderboard-panel {
    width: calc(100% - 32px);
    max-height: 70%;
    padding: 20px;
  }

  .PREFIX-leaderboard-header h3 {
    font-size: 1.1rem;
  }

  .PREFIX-leaderboard-entry {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
```

---

## Verification Checklist

After implementing, verify:

### Visual
- [ ] Dark overlay with blur visible
- [ ] Split layout: sad image left, content right
- [ ] Orange "Game Over!" title
- [ ] Large score with label
- [ ] Stats section formatted correctly
- [ ] "New Personal Best!" badge when applicable (gold, glowing)
- [ ] 3 buttons in row: Play Again | Share | Leaderboard
- [ ] "Back to Games" link at bottom right

### Functional
- [ ] Play Again resets game correctly
- [ ] Share opens modal with image preview
- [ ] Download works in share modal
- [ ] Leaderboard panel opens/closes
- [ ] Click outside closes leaderboard panel
- [ ] No "Enter your name" field anywhere
- [ ] Screenshot captured at game over moment
- [ ] High score persists across sessions (localStorage)

### Mobile
- [ ] Layout stacks vertically on small screens
- [ ] Buttons remain accessible and tappable
- [ ] Touch targets adequate size (min 44px)

---

## Game-Specific Notes

### Canvas-based games (FlappyOrange, OrangeSnake, etc.)
- Use `canvasRef.current.toDataURL('image/png')` for screenshot
- Capture BEFORE any game over animations that change the canvas

### DOM-based games (MemoryMatch, Merge2048, etc.)
- Use `captureGameArea(gameAreaRef.current)` for screenshot
- Make sure the ref is on the main game container

### Games with existing share functionality
- Remove old share modal/button code
- ShareButton component handles everything

### Games with guest name input
- Delete all `playerName` state and related functions
- Delete guest input JSX
- Users must be signed in to save scores

---

## File References

| Purpose | File |
|---------|------|
| Gold standard JSX | `src/pages/FlappyOrange.tsx` lines 4441-4528 |
| Gold standard CSS | `src/pages/FlappyOrange.css` lines 155-590 |
| ShareButton component | `src/systems/sharing/ShareButton.tsx` |
| DOM screenshot capture | `src/systems/sharing/captureDOM.ts` |
| Leaderboard hook | `src/hooks/data/useLeaderboard.ts` |
| Sad images | `public/assets/Games/games_media/sad_runner_*.png` (1-19) |

---

## Common Prefixes Used

| Game | Prefix | localStorage Key |
|------|--------|------------------|
| FlappyOrange | `fo-` | `flappyOrangeHighScore` |
| MemoryMatch | `mm-` | `memoryMatchHighScore` |
| WojakRunner | `wr-` | `wojakRunnerHighScore` |
| Merge2048 | `m2048-` | `merge2048HighScore` |
| ColorReaction | `cr-` | `colorReactionHighScore` |
| BlockPuzzle | `bp-` | `blockPuzzleHighScore` |
| OrangeSnake | `os-` | `orangeSnakeHighScore` |
| CitrusDrop | `cd-` | `citrusDropHighScore` |
| BrickBreaker | `bb-` | `brickBreakerHighScore` |
| WojakWhack | `ww-` | `wojakWhackHighScore` |
| OrangeStack | `ost-` | `orangeStackHighScore` |
| OrangePong | `op-` | `orangePongHighScore` |
| OrangeJuggle | `oj-` | `orangeJuggleHighScore` |
| KnifeGame | `kg-` | `knifeGameHighScore` |
| OrangeWordle | `ow-` | `orangeWordleHighScore` |
