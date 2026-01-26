# Mobile Game UI Patterns

> Reference guide for implementing consistent mobile UI/UX across all games.
> Created after unifying the 6 active games: Memory Match, Brick by Brick, Flappy Orange, Wojak Runner, Color Reaction, Block Puzzle.

## Overview

Mobile games should have:
- **True fullscreen** - no black bars, edge-to-edge display
- **Scroll lock** - prevent accidental page scrolling during gameplay
- **Pause support** - game pauses when quit confirmation dialog is shown
- **Consistent intro screens** - handled centrally by GameModal

---

## What's Already Handled by GameModal

The following are **automatically applied to ALL games** via `GameModal.tsx`:

1. **Fullscreen mode on intro screen** - `game-fullscreen-mode` class added when modal opens
2. **Scroll lock on intro screen** - body styles prevent scrolling
3. **Full height (100dvh)** - no black bars on intro screens
4. **Quit confirmation dialog** - prevents accidental exit during gameplay
5. **Music management** - centralized playlist playback

**You don't need to implement these in individual games.**

---

## What Individual Games Need

### 1. Import the Shared Fullscreen Hook

For games that have multiple states (playing, gameover, levelComplete), import and use the hook:

```typescript
import { useMobileGameFullscreen } from '@/hooks/useMobileGameFullscreen';
import { useIsMobile } from '@/hooks/useMediaQuery';
```

### 2. Use the Hook

Call the hook with a condition that covers all "active" game states:

```typescript
const isMobile = useIsMobile();

// Fullscreen for all states except idle (intro is handled by GameModal)
const isActiveGameState = gameState !== 'idle';
useMobileGameFullscreen(isActiveGameState, isMobile);
```

### 3. Add Pause Support (For Games with Game Loops)

If the game has a continuous game loop (requestAnimationFrame) or timers:

**a) Import isPaused from context:**
```typescript
const { isMuted: arcadeMuted, musicManagedExternally, gameStarted, isPaused: isContextPaused } = useGameMute();
```

**b) Create a ref to access it in the game loop:**
```typescript
const isContextPausedRef = useRef(false);

useEffect(() => {
  isContextPausedRef.current = isContextPaused;
}, [isContextPaused]);
```

**c) Check the ref in your game loop:**
```typescript
// In requestAnimationFrame loop
if (isContextPausedRef.current) {
  animationRef.current = requestAnimationFrame(gameLoop);
  return; // Skip update but keep loop running
}
```

**d) For timer-based games (like ColorReaction):**
```typescript
// At the start of timer callbacks
if (isContextPausedRef.current) {
  return; // Don't process while paused
}
```

---

## Game Type Reference

| Game Type | Needs Hook? | Needs isPaused? | Notes |
|-----------|-------------|-----------------|-------|
| **Continuous loop** (Flappy, Runner) | Yes | Yes | RAF-based games need pause in loop |
| **Timer-based** (ColorReaction) | Yes | Yes | Pause timers and cycle logic |
| **Turn-based** (BlockPuzzle) | Yes | No | No active loop to pause |
| **Level-based** (BrickByBrick, MemoryMatch) | Yes | Yes | Pause between-level screens too |

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/hooks/useMobileGameFullscreen.ts` | Shared hook for fullscreen + scroll lock |
| `src/components/media/games/GameModal.tsx` | Centralized intro screen handling |
| `src/contexts/GameMuteContext.tsx` | Provides `isPaused` state |

---

## Checklist for New Games

When enabling a grayed-out game:

- [ ] Import `useMobileGameFullscreen` hook
- [ ] Import `useIsMobile` hook
- [ ] Call `useMobileGameFullscreen(isActiveGameState, isMobile)`
- [ ] If game has RAF loop: add `isPaused` ref and check in loop
- [ ] If game has timers: add `isPaused` checks to timer callbacks
- [ ] Test on mobile: no black bars, no scrolling, pause works with quit dialog
- [ ] Test intro screen → gameplay → gameover transitions

---

## Example Implementation

### Minimal (Turn-based game like Block Puzzle)

```typescript
import { useMobileGameFullscreen } from '@/hooks/useMobileGameFullscreen';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameMute } from '@/contexts/GameMuteContext';

const MyGame: React.FC = () => {
  const isMobile = useIsMobile();
  const { isMuted: arcadeMuted, musicManagedExternally, gameStarted } = useGameMute();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  
  // Fullscreen for all active states
  const isActiveGameState = gameState !== 'idle';
  useMobileGameFullscreen(isActiveGameState, isMobile);
  
  // ... rest of game
};
```

### Full (Continuous loop game like Flappy Orange)

```typescript
import { useMobileGameFullscreen } from '@/hooks/useMobileGameFullscreen';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameMute } from '@/contexts/GameMuteContext';

const MyGame: React.FC = () => {
  const isMobile = useIsMobile();
  const { isMuted: arcadeMuted, musicManagedExternally, gameStarted, isPaused: isContextPaused } = useGameMute();
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  
  // Fullscreen for all active states
  const isActiveGameState = gameState !== 'idle';
  useMobileGameFullscreen(isActiveGameState, isMobile);
  
  // Ref for pause state (avoid stale closure in game loop)
  const isContextPausedRef = useRef(false);
  useEffect(() => {
    isContextPausedRef.current = isContextPaused;
  }, [isContextPaused]);
  
  // Game loop
  const gameLoop = useCallback(() => {
    // Pause check - keep loop running but skip updates
    if (isContextPausedRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    
    // ... game logic
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, []);
  
  // ... rest of game
};
```

---

## Grayed-Out Games to Update Later

These games will need the patterns above when enabled:
- Orange Pong
- Orange Juggle
- Knife Game
- Merge 2048
- Orange Wordle
- Citrus Drop
- Orange Snake
- Brick Breaker
- Wojak Whack
