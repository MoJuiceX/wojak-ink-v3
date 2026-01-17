# 🎮 MASTER GAME CREATION PROMPT v2.0

## How to Use This Template

When creating a NEW game, copy this template and fill in **Section 1** with your game-specific details. Everything else is standardized and will automatically integrate with all systems.

---

## SECTION 1: GAME SPECIFICATION (FILL THIS IN)

### Game Identity
```
GAME_NAME: [e.g., "Orange Tetris"]
GAME_ID: [e.g., "orange-tetris"]
GAME_DESCRIPTION: [One sentence description]
DIFFICULTY: [Easy / Medium / Hard / Progressive]
```

### Core Mechanics
```
GAMEPLAY_TYPE: [e.g., Puzzle, Arcade, Reflex, Strategy, Memory]
INPUT_METHOD: [Tap, Swipe, Drag, Hold, Keyboard]
GAME_GOAL: [What is the player trying to achieve?]
FAIL_CONDITION: [How does the player lose?]
```

### Scoring System
```
BASE_POINTS: [Points for basic action]
COMBO_MULTIPLIER: [How combos multiply points]
BONUS_CONDITIONS: [Special bonuses, e.g., "Clear 4 lines = Tetris bonus"]
```

### Game-Specific Elements
```
UNIQUE_MECHANICS: [What makes this game special?]
POWER_UPS: [Any power-ups? List them]
DIFFICULTY_PROGRESSION: [How does difficulty increase?]
```

### Visual Theme
```
COLOR_PALETTE: [Primary colors for this game]
SPECIAL_EFFECTS: [Game-specific effects beyond standard system]
BACKGROUND: [Background style/animation]
```

---

## SECTION 2: STANDARD FILE STRUCTURE

Every game follows this structure:

```
src/games/[GameName]/
├── index.tsx                 # Main game component
├── [GameName].game.css       # Game-SPECIFIC styles only
├── use[GameName]Logic.ts     # Game logic hook
├── config.ts                 # Game configuration
├── components/               # Game-specific components
│   ├── [GamePiece].tsx
│   └── [GameBoard].tsx
└── types.ts                  # Game-specific types
```

---

## SECTION 3: GAME COMPONENT TEMPLATE

Create `src/games/[GameName]/index.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';

// Shared Systems
import { GameShell, GameHUD, GameOverScreen } from '../../systems/game-ui';
import { useEffects, getComboPreset } from '../../systems/effects';
import { useGameSession } from '../../systems/engagement';

// Game-specific
import { use[GameName]Logic } from './use[GameName]Logic';
import { GAME_CONFIG } from './config';
import './[GameName].game.css';

// Unified Intro Screen
import GameIntroOverlay from '../../components/GameIntroOverlay';

export const [GameName]: React.FC = () => {
  // ===== GAME SESSION (Handles score, combo, currency, leaderboard) =====
  const {
    score,
    highScore,
    combo,
    isPlaying,
    isNftHolder,
    initSession,
    startGame,
    addScore,
    incrementCombo,
    resetCombo,
    endGame,
    triggerEffect,
    triggerPreset
  } = useGameSession({
    gameId: GAME_CONFIG.id,
    onHighScore: (newScore) => {
      // Optional: Custom high score handling
    }
  });

  // ===== GAME-SPECIFIC LOGIC =====
  const {
    // Destructure your game-specific state and functions
    gameState,
    handleInput,
    // ... etc
  } = use[GameName]Logic({
    onScore: (points, position) => {
      addScore(points, position);
      incrementCombo(position);
    },
    onGameOver: () => {
      handleGameEnd();
    }
  });

  // ===== UI STATE =====
  const [showIntro, setShowIntro] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameEndResult, setGameEndResult] = useState<any>(null);

  // ===== LIFECYCLE =====
  useEffect(() => {
    initSession();
  }, [initSession]);

  // ===== HANDLERS =====
  const handleStartGame = () => {
    setShowIntro(false);
    setShowGameOver(false);
    startGame();
    // Initialize game-specific state
  };

  const handleGameEnd = async () => {
    const result = await endGame();
    setGameEndResult(result);
    setShowGameOver(true);
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    handleStartGame();
  };

  const handleMainMenu = () => {
    // Navigate back to game selection
    window.history.back();
  };

  // ===== RENDER =====
  return (
    <IonPage>
      <IonContent>
        <GameShell gameId={GAME_CONFIG.id}>

          {/* INTRO SCREEN */}
          <GameIntroOverlay
            isOpen={showIntro}
            game={{
              id: GAME_CONFIG.id,
              title: GAME_CONFIG.name,
              description: GAME_CONFIG.description,
              icon: GAME_CONFIG.icon,
              gradient: GAME_CONFIG.gradient,
              howToPlay: GAME_CONFIG.howToPlay
            }}
            onStart={handleStartGame}
            onClose={handleMainMenu}
          />

          {/* GAME HUD */}
          {isPlaying && (
            <GameHUD
              score={score}
              highScore={highScore}
              combo={combo}
              // Add game-specific HUD props:
              // timer={timeRemaining}
              // lives={lives}
              // level={level}
            />
          )}

          {/* GAME CONTENT */}
          <div className="game-content">
            {/* Your game-specific rendering here */}
          </div>

          {/* GAME OVER SCREEN */}
          <GameOverScreen
            isVisible={showGameOver}
            score={score}
            highScore={highScore}
            isNewHighScore={gameEndResult?.isNewHighScore || false}
            currencyEarned={gameEndResult?.currencyEarned}
            leaderboardRank={gameEndResult?.leaderboardRank}
            isNftHolder={isNftHolder}
            newAchievements={gameEndResult?.newAchievements}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
            gameName={GAME_CONFIG.name}
            gameId={GAME_CONFIG.id}
          />

        </GameShell>
      </IonContent>
    </IonPage>
  );
};

export default [GameName];
```

---

## SECTION 4: GAME CONFIG TEMPLATE

Create `src/games/[GameName]/config.ts`:

```typescript
import { GameRewardConfig } from '../../types/currency';

export const GAME_CONFIG = {
  // Identity
  id: '[game-id]' as const,
  name: '[Game Name]',
  description: '[Short description for intro screen]',
  icon: '🎮', // Emoji icon
  gradient: ['#FF8C32', '#FF6420'], // Brand colors

  // How to play (shown on intro screen)
  howToPlay: [
    'Step 1 instruction',
    'Step 2 instruction',
    'Step 3 instruction',
  ],

  // Gameplay settings
  settings: {
    initialSpeed: 1,
    speedIncrement: 0.1,
    maxSpeed: 3,
    // ... game-specific settings
  },

  // Scoring
  scoring: {
    basePoints: 10,
    comboMultiplier: 1.5,
    bonuses: {
      // Game-specific bonuses
    }
  },

  // Currency rewards (used by engagement system)
  rewards: {
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 100,
    maxOrangesPerGame: 500,
    bonusForHighScore: 50,
    bonusForTop10: 100
  } as GameRewardConfig,

  // Effects triggers
  effects: {
    comboThreshold: 2, // Combo level to start showing effects
    milestones: [1000, 5000, 10000, 25000, 50000], // Score milestones for celebrations
  }
};

export type GameConfig = typeof GAME_CONFIG;
```

---

## SECTION 5: GAME LOGIC HOOK TEMPLATE

Create `src/games/[GameName]/use[GameName]Logic.ts`:

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_CONFIG } from './config';

interface GameLogicOptions {
  onScore: (points: number, position?: { x: number; y: number }) => void;
  onGameOver: () => void;
  onComboBreak?: () => void;
}

interface GameState {
  // Define your game-specific state
  // e.g., board, pieces, position, etc.
}

export const use[GameName]Logic = (options: GameLogicOptions) => {
  const { onScore, onGameOver, onComboBreak } = options;

  // ===== STATE =====
  const [gameState, setGameState] = useState<GameState>({
    // Initial state
  });

  const [isActive, setIsActive] = useState(false);

  // Refs for game loop
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // ===== GAME INITIALIZATION =====
  const initGame = useCallback(() => {
    setGameState({
      // Reset to initial state
    });
    setIsActive(true);
  }, []);

  // ===== GAME LOOP =====
  const gameLoop = useCallback((timestamp: number) => {
    if (!isActive) return;

    const deltaTime = timestamp - lastUpdateRef.current;
    lastUpdateRef.current = timestamp;

    // Update game state based on deltaTime
    setGameState(prev => {
      // Game logic here
      // Check for scoring conditions
      // Check for game over conditions

      return prev; // Return updated state
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isActive]);

  // Start/stop game loop
  useEffect(() => {
    if (isActive) {
      lastUpdateRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isActive, gameLoop]);

  // ===== INPUT HANDLING =====
  const handleInput = useCallback((input: any) => {
    if (!isActive) return;

    // Process input
    // Update game state accordingly
  }, [isActive]);

  // ===== SCORING =====
  const checkForScore = useCallback((/* params */) => {
    // Check if player scored
    // Call onScore with points and position for effects
    // onScore(points, { x: 50, y: 50 });
  }, [onScore]);

  // ===== GAME OVER CHECK =====
  const checkGameOver = useCallback(() => {
    // Check if game should end
    // if (gameOverCondition) {
    //   setIsActive(false);
    //   onGameOver();
    // }
  }, [onGameOver]);

  // ===== CLEANUP =====
  const cleanup = useCallback(() => {
    setIsActive(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  return {
    // State
    gameState,
    isActive,

    // Actions
    initGame,
    handleInput,
    cleanup,

    // Expose anything else the component needs
  };
};
```

---

## SECTION 6: GAME-SPECIFIC STYLES TEMPLATE

Create `src/games/[GameName]/[GameName].game.css`:

```css
/*
 * [GAME NAME] - Game-Specific Styles
 *
 * IMPORTANT: Only put styles here that are UNIQUE to this game.
 * All shared styles (glass panels, buttons, HUD, effects) come from:
 * - src/systems/theme/
 * - src/systems/game-ui/game-ui.css
 * - src/systems/effects/effects.css
 */

/* Game Container */
.game-[game-id] {
  /* Game-specific layout */
}

/* Game Board / Play Area */
.game-[game-id]-board {
  /* Board-specific styles */
}

/* Game Pieces (if applicable) */
.game-[game-id]-piece {
  /* Piece styles */
}

/* Game-specific animations */
@keyframes [game-id]-custom-animation {
  /* Custom keyframes */
}
```

---

## SECTION 7: ROUTING INTEGRATION

Add to your router:

```typescript
// In App.tsx or routes config
import { [GameName] } from './games/[GameName]';

<Route path="/games/[game-id]" component={[GameName]} />
```

Add to game list:

```typescript
// In your games list/menu
{
  id: '[game-id]',
  name: '[Game Name]',
  description: '[Description]',
  icon: '🎮',
  route: '/games/[game-id]',
  gradient: ['#FF8C32', '#FF6420']
}
```

---

## SECTION 8: TESTING CHECKLIST

Before considering the game complete:

### Gameplay
- [ ] Game starts correctly from intro screen
- [ ] Core mechanics work as specified
- [ ] Scoring system calculates correctly
- [ ] Combo system triggers at right times
- [ ] Game over triggers at correct condition
- [ ] Play again resets everything properly

### Visual Effects
- [ ] Combo effects show at correct thresholds
- [ ] Score popup appears at correct position
- [ ] Game over celebration plays for high scores
- [ ] All animations are smooth (60fps)

### Engagement Integration
- [ ] Score submits to leaderboard
- [ ] Currency (oranges) earned correctly
- [ ] High score bonus applies
- [ ] Top 10 bonus applies (if NFT holder)
- [ ] NFT gate message shows for non-holders
- [ ] Achievements trigger (if applicable)

### UI/UX
- [ ] HUD displays correctly
- [ ] Game responds to all input methods
- [ ] Works on mobile (touch)
- [ ] Works on desktop (keyboard/mouse)
- [ ] No visual glitches or overflow

### Performance
- [ ] No memory leaks (play multiple rounds)
- [ ] Smooth on low-end devices
- [ ] Effects don't cause lag

---

## SECTION 9: EFFECT TRIGGERS GUIDE

Use these shared effects in your game:

```typescript
// Import
import { useEffects, getComboPreset } from '../../systems/effects';
const { triggerEffect, triggerPreset } = useEffects();

// Score popup when player scores
triggerEffect('score-popup', {
  position: { x: 50, y: 50 }, // Percentage position
  data: { score: 100, prefix: '+' }
});

// Combo celebration (use presets)
triggerPreset(getComboPreset(comboLevel, { x: 50, y: 50 }));

// Individual effects
triggerEffect('shockwave', { position: { x: 50, y: 50 } });
triggerEffect('sparks', { position: { x: 50, y: 50 }, data: { count: 20 } });
triggerEffect('confetti', { position: { x: 50, y: 50 }, data: { count: 50 } });
triggerEffect('screen-shake', { data: { intensity: 3 } });
triggerEffect('floating-emoji', { position: { x: 50, y: 50 }, data: { emoji: '🔥' } });

// Milestone celebration
import { getScoreMilestonePreset } from '../../systems/effects';
triggerPreset(getScoreMilestonePreset(10000)); // For 10k milestone
```

---

## SECTION 10: QUICK REFERENCE - WHAT'S AUTOMATIC

When you use the shared systems, these things happen **automatically**:

| Feature | System | What Happens |
|---------|--------|--------------|
| Score tracking | useGameSession | Tracks score, updates high score |
| Combo system | useGameSession | Tracks combo, applies multipliers |
| Leaderboard | useGameSession | Submits score on game end |
| Currency | useGameSession | Calculates and awards oranges/gems |
| Effects layer | GameShell | Renders all triggered effects |
| Intro screen | GameIntroOverlay | Shows how-to-play, handles start |
| Game over | GameOverScreen | Shows score, currency, rank, replay |
| HUD | GameHUD | Displays score, combo, timer |
| Theme | CSS imports | Colors, glass effects, animations |

**You only need to implement:**
1. Game-specific logic (pieces, physics, rules)
2. Game-specific rendering (board, objects)
3. When to call `addScore()`, `incrementCombo()`, `endGame()`
4. Game-specific CSS (minimal)

---

## EXAMPLE: Creating "Orange Tetris"

### Section 1 filled in:
```
GAME_NAME: Orange Tetris
GAME_ID: orange-tetris
GAME_DESCRIPTION: Classic block-stacking with an orange twist!
DIFFICULTY: Progressive

GAMEPLAY_TYPE: Puzzle
INPUT_METHOD: Swipe (mobile), Arrow keys (desktop)
GAME_GOAL: Clear lines by filling rows completely
FAIL_CONDITION: Blocks stack to the top

BASE_POINTS: 100 per line
COMBO_MULTIPLIER: 1.5x for consecutive clears
BONUS_CONDITIONS:
  - Single line: 100 pts
  - Double: 300 pts
  - Triple: 500 pts
  - Tetris (4 lines): 800 pts

UNIQUE_MECHANICS: Orange-themed pieces, "Citrus Crush" power-up
POWER_UPS: Citrus Crush (clears bottom 2 rows)
DIFFICULTY_PROGRESSION: Pieces fall faster every 10 lines

COLOR_PALETTE: Orange (#FF8C32), Yellow (#FFD93D)
SPECIAL_EFFECTS: Line clear shockwave, piece lock sparks
BACKGROUND: Subtle falling orange slices
```

Then use the templates above to build the game!
