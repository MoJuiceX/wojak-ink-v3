# Game Prompt Template - Use This Structure for All Games

## IMPORTANT: Before Implementing Any Game

1. **Ensure Phase 2 is complete** - Shared systems must exist first
2. **Ensure Phase 3 is complete** - Core hooks must exist first
3. **Follow the file structure below exactly**

---

## File Structure

```
src/games/[GameName]/
├── [GameName].tsx          # Main component
├── [GameName].game.css     # Game-specific styles
├── [GameName].logic.ts     # Game logic (optional, for complex games)
└── index.ts                # Export
```

---

## Required Imports

Every game MUST include these imports:

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack, play, pause, refresh, volumeHigh, volumeMute } from 'ionicons/icons';

// Shared systems (from Phase 2)
import { GameContainer } from '@/components/ui/GameContainer';
import { MobileHUD } from '@/components/ui/MobileHUD';

// Shared hooks (from Phase 3)
import { useGameSounds, useLeaderboard, useIsMobile, useGameViewport } from '@/hooks';

// Game-specific styles
import './[GameName].game.css';
```

---

## Component Structure Template

```typescript
interface GameState {
  score: number;
  lives: number;
  level: number;
  // Add game-specific state
}

const [GameName]: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { width, height } = useGameViewport();
  const { play: playSound, stopAll } = useGameSounds();
  const { submitScore } = useLeaderboard('[game-id]');

  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Stats for MobileHUD
  const gameStats = [
    { label: 'Score', value: score },
    { label: 'Lives', value: lives },
  ];

  // Game over handler
  const handleGameOver = useCallback(async () => {
    setGameState('gameover');
    playSound('game-over');
    stopAll();
    await submitScore(score, 'Player'); // TODO: Get actual player name
  }, [score, playSound, stopAll, submitScore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, [stopAll]);

  return (
    <GameContainer className="[game-name]-container">
      {/* Mobile HUD - Only shows on mobile */}
      {isMobile && gameState === 'playing' && (
        <MobileHUD stats={gameStats} />
      )}

      {/* Back button */}
      <button className="game-back-btn" onClick={() => navigate('/games')}>
        <IonIcon icon={arrowBack} />
      </button>

      {/* Game content based on state */}
      {gameState === 'menu' && (
        <div className="game-menu">
          <h1>[Game Name]</h1>
          <button onClick={() => setGameState('playing')}>Play</button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-area">
          {/* Desktop stats - hidden on mobile */}
          {!isMobile && (
            <div className="game-stats-desktop">
              <div>Score: {score}</div>
              <div>Lives: {lives}</div>
            </div>
          )}

          {/* Game canvas or DOM content */}
          <canvas ref={canvasRef} width={width} height={height} />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          <p>Score: {score}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
          <button onClick={() => navigate('/games')}>Back to Games</button>
        </div>
      )}
    </GameContainer>
  );
};

export default [GameName];
```

---

## CSS Structure Template

```css
/* ============================================
   [GAME NAME] - Game styles
   ============================================ */

/* Container - inherits from GameContainer */
.[game-name]-container {
  /* Game-specific overrides */
}

/* Game area - responsive */
.game-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Canvas - responsive sizing */
.game-area canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Desktop stats - hidden on mobile via GameContainer */
.game-stats-desktop {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Menu screen */
.game-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  text-align: center;
}

/* Game over overlay */
.game-over-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(0, 0, 0, 0.85);
  z-index: 100;
}

/* Back button - consistent across all games */
.game-back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 50;
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .game-stats-desktop {
    display: none; /* Hidden - MobileHUD takes over */
  }

  .game-back-btn {
    top: 8px;
    left: 8px;
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .game-menu h1 {
    font-size: 1.5rem;
  }
}
```

---

## Registration Checklist

After creating the game, you MUST:

### 1. Add to games config (`src/config/games.ts`)
```typescript
{
  id: '[game-id]',
  name: '[Game Name]',
  emoji: '🎮',
  route: '/games/[game-id]',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  accentColor: '#ff6b00',
  description: 'Brief description'
}
```

### 2. Add route to router config
```typescript
{ path: '/games/[game-id]', element: <[GameName] /> }
```

### 3. Create export file (`src/games/[GameName]/index.ts`)
```typescript
export { default } from './[GameName]';
```

---

## Testing Checklist

- [ ] Game loads without console errors
- [ ] Desktop: Stats display correctly
- [ ] Mobile (< 768px): MobileHUD displays stats
- [ ] Mobile: No horizontal scrolling
- [ ] Mobile: Touch controls work
- [ ] Sound effects play
- [ ] Game over submits score
- [ ] Back button returns to /games
- [ ] Game appears in GamesHub grid
