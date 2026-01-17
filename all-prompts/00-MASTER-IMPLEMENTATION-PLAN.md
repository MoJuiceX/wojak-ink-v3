# Master Implementation Plan - Wojak.ink Games Platform

## Overview
This document outlines the recommended order of implementation for all prompts. Follow this sequence to build systems correctly with proper dependencies.

---

## Phase 1: Critical Fixes (Do First!)
These fix existing broken functionality.

| Order | Prompt | Priority | Description |
|-------|--------|----------|-------------|
| 1.1 | `fix-prompts/03-fix-black-screen-games.md` | CRITICAL | Fix Color Reaction, 2048 Merge, Orange Wordle - completely broken |
| 1.2 | `fix-prompts/01-mobile-ui-ux-critical-fixes.md` | HIGH | Fix stats panels, dev panels, nav overlap |

---

## Phase 2: Shared Systems (Foundation)
These create reusable systems that all games depend on.

| Order | Prompt | Priority | Description |
|-------|--------|----------|-------------|
| 2.1 | `fix-prompts/02-shared-mobile-game-ui-system.md` | HIGH | Creates `MobileHUD`, `GameContainer`, `useGameViewport()` |
| 2.2 | `fix-prompts/04-navigation-cleanup-mobile.md` | HIGH | Creates `/games` route, `MoreMenu`, 5-item bottom nav |

---

## Phase 3: Core Hooks (Before New Games)
Create these shared hooks BEFORE implementing new games.

### Create: `src/hooks/useGameSounds.ts`
```typescript
import { useCallback, useRef } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

export const useGameSounds = () => {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const play = useCallback((soundName: string, options: SoundOptions = {}) => {
    const { volume = 0.5, loop = false } = options;

    // Get or create audio element
    let audio = audioRefs.current.get(soundName);
    if (!audio) {
      audio = new Audio(`/sounds/${soundName}.mp3`);
      audioRefs.current.set(soundName, audio);
    }

    audio.volume = volume;
    audio.loop = loop;
    audio.currentTime = 0;
    audio.play().catch(() => {}); // Ignore autoplay errors
  }, []);

  const stop = useCallback((soundName: string) => {
    const audio = audioRefs.current.get(soundName);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback(() => {
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  return { play, stop, stopAll };
};
```

### Create: `src/hooks/useLeaderboard.ts`
```typescript
import { useState, useCallback } from 'react';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  date: string;
}

export const useLeaderboard = (gameId: string) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const submitScore = useCallback(async (score: number, playerName: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const entry: LeaderboardEntry = {
        id: Date.now().toString(),
        playerName,
        score,
        date: new Date().toISOString(),
      };

      // Store locally for now
      const stored = localStorage.getItem(`leaderboard_${gameId}`) || '[]';
      const existing = JSON.parse(stored) as LeaderboardEntry[];
      existing.push(entry);
      existing.sort((a, b) => b.score - a.score);
      const top10 = existing.slice(0, 10);
      localStorage.setItem(`leaderboard_${gameId}`, JSON.stringify(top10));
      setEntries(top10);

      return true;
    } catch (error) {
      console.error('Failed to submit score:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const stored = localStorage.getItem(`leaderboard_${gameId}`) || '[]';
      setEntries(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  return { entries, isLoading, submitScore, fetchLeaderboard };
};
```

### Create: `src/hooks/useIsMobile.ts`
```typescript
import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};
```

### Create: `src/hooks/index.ts`
```typescript
export { useGameSounds } from './useGameSounds';
export { useLeaderboard } from './useLeaderboard';
export { useIsMobile } from './useIsMobile';
export { useGameViewport } from './useGameViewport'; // From shared UI system
```

---

## Phase 4: New Games (One at a Time)
Implement games in this order based on complexity and dependencies.

| Order | Prompt | Complexity | Notes |
|-------|--------|------------|-------|
| 4.1 | `game-prompts/09-whack-a-mole-game.md` | Easy | DOM-based, good first test |
| 4.2 | `game-prompts/07-wordle-game.md` | Easy | DOM-based, no physics |
| 4.3 | `game-prompts/06-color-reaction-game.md` | Easy | DOM-based, simple logic |
| 4.4 | `game-prompts/03-flappy-orange-game.md` | Medium | Canvas, basic physics |
| 4.5 | `game-prompts/08-brick-breaker-game.md` | Medium | Canvas, collision detection |
| 4.6 | `game-prompts/05-snake-io-game.md` | Medium | Canvas, smooth movement |
| 4.7 | `game-prompts/04-citrus-drop-suika-game.md` | Hard | Matter.js physics engine |

---

## Phase 5: Enhancements (After Core Complete)
Implement after all games are working.

| Order | Prompt | Description |
|-------|--------|-------------|
| 5.1 | `enhancement-prompts/daily-challenges.md` | Daily challenge system |
| 5.2 | `enhancement-prompts/streak-system.md` | Login streaks |
| 5.3 | `enhancement-prompts/achievements.md` | Achievement badges |

---

## Game Prompt Updates Required

Before giving game prompts to Claude CLI, update each one with:

### 1. Correct File Structure
```
CHANGE: src/pages/FlappyOrange/
TO:     src/games/FlappyOrange/
```

### 2. Import Shared Systems
Add to each game:
```typescript
// Add these imports
import { GameContainer } from '@/components/ui/GameContainer';
import { MobileHUD } from '@/components/ui/MobileHUD';
import { useGameSounds, useLeaderboard, useIsMobile, useGameViewport } from '@/hooks';
```

### 3. Use GameContainer Wrapper
```typescript
// Wrap game content
return (
  <GameContainer>
    {isMobile && <MobileHUD stats={gameStats} />}
    {/* Game content */}
  </GameContainer>
);
```

### 4. Register in Games Config
Add to `src/config/games.ts`:
```typescript
{
  id: 'flappy-orange',
  name: 'Flappy Orange',
  emoji: '🍊',
  route: '/games/flappy-orange',
  difficulty: 'Medium',
  accentColor: '#ff6b00'
}
```

### 5. Add Route
Add to router configuration:
```typescript
{ path: '/games/flappy-orange', element: <FlappyOrange /> }
```

---

## Quick Reference: What To Tell Claude CLI

### Session 1: Critical Fixes
```
Read and implement: all-prompts/fix-prompts/03-fix-black-screen-games.md
```

### Session 2: Mobile UI System
```
Read and implement: all-prompts/fix-prompts/02-shared-mobile-game-ui-system.md
```

### Session 3: Navigation Cleanup
```
Read and implement: all-prompts/fix-prompts/04-navigation-cleanup-mobile.md
```

### Session 4: Core Hooks
```
Create the following hooks in src/hooks/:
- useGameSounds.ts
- useLeaderboard.ts
- useIsMobile.ts
- index.ts (exports all hooks)

Reference the code in: all-prompts/00-MASTER-IMPLEMENTATION-PLAN.md Phase 3
```

### Session 5+: Games (one per session)
```
Read and implement: all-prompts/game-prompts/[game-name].md

IMPORTANT updates to apply:
1. Put game in src/games/ not src/pages/
2. Import and use GameContainer, MobileHUD from shared systems
3. Import hooks from @/hooks
4. Add game to src/config/games.ts
5. Add route to router config
```

---

## Verification Checklist

After each phase, verify:

### Phase 1 ✓
- [ ] Color Reaction renders correctly
- [ ] 2048 Merge renders correctly
- [ ] Orange Wordle renders correctly

### Phase 2 ✓
- [ ] `MobileHUD` component exists
- [ ] `GameContainer` component exists
- [ ] `/games` route shows GamesHub
- [ ] Bottom nav has 5 items
- [ ] "More" menu slides up correctly

### Phase 3 ✓
- [ ] `useGameSounds()` hook works
- [ ] `useLeaderboard()` hook works
- [ ] `useIsMobile()` hook works

### Phase 4 ✓ (per game)
- [ ] Game loads without errors
- [ ] Game plays correctly on desktop
- [ ] Game plays correctly on mobile
- [ ] Stats display in MobileHUD on mobile
- [ ] Sound effects work
- [ ] Game over submits to leaderboard
- [ ] Game appears in GamesHub

---

## Estimated Time

| Phase | Estimated Sessions | Time |
|-------|-------------------|------|
| Phase 1 | 1-2 sessions | 1-2 hours |
| Phase 2 | 2-3 sessions | 2-3 hours |
| Phase 3 | 1 session | 30 min |
| Phase 4 | 7 sessions | 7-10 hours |
| Phase 5 | 3 sessions | 3-4 hours |

**Total: ~15-20 sessions over several days**

---

## Notes

- Always test on mobile viewport after each change
- If a game breaks, check browser console for errors
- Keep each session focused on ONE task
- Commit after each successful implementation
