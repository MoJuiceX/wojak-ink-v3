# Wojak Ink - Comprehensive Game Audit for Claude CLI

## Overview

This document provides a systematic audit of all 7 active games in the Wojak Ink project. Claude CLI should use this document to fix bugs, ensure consistency, and make all games work well on both mobile and desktop.

**Active Games:**
1. Brick by Brick (OrangeStack)
2. Memory Match
3. Flappy Orange
4. Wojak Runner
5. Color React (Color Reaction)
6. 2048 Merge (Orange 2048)
7. Block Puzzle

---

## PART 1: SHARED SYSTEMS STANDARDIZATION

All games MUST use these shared systems consistently. Before fixing individual games, ensure these patterns are followed.

### 1.1 Required Imports for Every Game

```typescript
// Effects System
import { useEffects } from '@/systems/effects/EffectsProvider';
import { GameShell } from '@/systems/game-ui/GameShell';

// Sound System
import { useGameSounds } from '@/hooks/useGameSounds';

// Haptics
import { useGameHaptics } from '@/hooks/useGameHaptics';

// Responsive
import { useIsMobile } from '@/hooks/useMediaQuery';

// Leaderboard
import { useLeaderboard } from '@/hooks/useLeaderboard';
```

### 1.2 Standard Effect Triggers (ALL GAMES MUST USE)

Every game should trigger effects consistently:

| Game Event | Required Effects | Sound | Haptic |
|------------|-----------------|-------|--------|
| Score/Point | `score-popup` | `playBlockLand()` | light tap (10ms) |
| Perfect/Bonus | `shockwave` + `sparks` | `playPerfectBonus()` | medium (50ms) |
| Combo 2+ | `combo-text` | `playCombo(level)` | pattern |
| Combo 5+ | + `confetti` | same | stronger |
| Combo 7+ | + `screen-shake` | same | heavy |
| Combo 10+ | + `lightning` + `vignette-pulse` | same | celebration |
| Level Complete | `confetti` + `shockwave` | `playWinSound()` | celebration |
| Game Over | `vignette-pulse` (red) | `playGameOver()` | error pattern |
| New High Score | Full celebration preset | `playWinSound()` | long celebration |

### 1.3 Standard Mobile vs Desktop Breakpoints

```typescript
// Use the shared hook
const isMobile = useIsMobile(); // max-width: 767px

// Standard responsive patterns:
if (isMobile) {
  // Full-width layout
  // Touch controls enabled
  // Simplified effects (fewer particles)
  // Larger touch targets (min 44px)
  // HUD at top (not side panel)
} else {
  // Fixed-width game area
  // Stats panel on side
  // Full effects
  // Keyboard controls
}
```

### 1.4 Standard Game Wrapper Structure

Every game page should follow this structure:

```tsx
export default function GamePage() {
  return (
    <GameShell gameId="game-name">
      <div className="game-layout">
        {isMobile ? <MobileHUD /> : <DesktopStatsPanel />}
        <div className="game-area">
          <GameComponent />
        </div>
      </div>
      <EffectsLayer />
    </GameShell>
  );
}
```

---

## PART 2: INDIVIDUAL GAME AUDITS

### GAME 1: BRICK BY BRICK (OrangeStack)

**Files:**
- `/src/games/OrangeStack/index.tsx`
- `/src/games/OrangeStack/config.ts`
- `/src/pages/BrickByBrick.tsx`
- `/src/games/OrangeStack/OrangeStack.game.css`

#### CRITICAL ISSUES

**Issue 1.1: Two Implementations Exist - MUST CONSOLIDATE**
- `/src/games/OrangeStack/index.tsx` - Game component version
- `/src/pages/BrickByBrick.tsx` - Page version with different physics

**Fix:** The page version (`BrickByBrick.tsx`) should be the source of truth. The game component should import from or align with it.

**Issue 1.2: Different Physics Constants**
```
OrangeStack: Speed 1.2 → 4.5
BrickByBrick: Speed 2.0 → 5.5 (50% harder)
```

**Fix:** Standardize to BrickByBrick values (2.0 → 5.5) as they've been play-tested.

**Issue 1.3: Combo Perks Never Implemented**
In `config.ts`:
```typescript
export const COMBO_PERKS = {
  miniShield: 5,      // TODO: Not implemented
  widthRestore: 15,   // TODO: Not implemented
};
```

**Fix:** Either implement these perks or remove them from config to avoid confusion.

#### MOBILE FIXES NEEDED

**Issue 1.4: Mobile Height Calculation**
Current: `viewportSize.height - 220`

**Problem:** The 220px subtraction is arbitrary and doesn't account for:
- Safe area insets on notched phones
- Dynamic viewport changes

**Fix:**
```typescript
const CONTAINER_HEIGHT_RESPONSIVE = isMobile
  ? `calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 160px)`
  : Math.min(MAX_GAME_HEIGHT, availableHeight);
```

**Issue 1.5: Touch Target Size**
The drop area should have a minimum touch target.

**Fix:** Ensure the entire game area responds to touch, not just visible elements.

#### EFFECTS STANDARDIZATION

**Current State:** Uses custom inline effects
**Required:** Should use shared effects system

**Fix:** Replace custom effect code with:
```typescript
const { triggerEffect, triggerPreset } = useEffects();

// On perfect drop:
triggerEffect('shockwave', { position: { x: 50, y: dropY }, data: { color: '#FFD700' } });
triggerEffect('sparks', { position: { x: 50, y: dropY } });

// On combo milestone:
triggerPreset(getComboPreset(combo, { x: 50, y: 30 }));
```

---

### GAME 2: MEMORY MATCH

**Files:**
- `/src/games/MemoryMatch/index.tsx`
- `/src/games/MemoryMatch/config.ts`
- `/src/pages/MemoryMatch.tsx`
- `/src/games/MemoryMatch/MemoryMatch.game.css`

#### CRITICAL ISSUES

**Issue 2.1: Two Implementations with Different Round Configs**
```
config.ts: 6→27 pairs (15 rounds)
MemoryMatch.tsx: 6→16 pairs (10 rounds, more balanced)
```

**Fix:** Use MemoryMatch.tsx values (6→16 pairs) as the standard. Update config.ts to match.

**Issue 2.2: Config Duplication**
`ROUND_CONFIG` exists in both `config.ts` and inline in `MemoryMatch.tsx`.

**Fix:** Single source of truth in `config.ts`, import everywhere else.

**Issue 2.3: Time Settings Mismatch**
```
config.ts: BASE_TIME = 35 seconds
MemoryMatch.tsx: BASE_TIME = 40 seconds
```

**Fix:** Standardize to 40 seconds (more forgiving, better UX).

#### MOBILE FIXES NEEDED

**Issue 2.4: Card Grid Overflow on Small Screens**
At round 10 (8×4 grid), cards may be too small on phones <375px wide.

**Fix:** Add minimum card size enforcement:
```typescript
const minCardSize = 50; // Minimum touchable size
const calculatedSize = (availableWidth - gaps) / cols;
const cardSize = Math.max(calculatedSize, minCardSize);

// If cards would be too small, reduce columns
if (calculatedSize < minCardSize) {
  // Scroll or paginate instead of shrinking
}
```

**Issue 2.5: Timer Visibility on Mobile**
Timer can be hard to see when focused on cards.

**Fix:** Add pulsing/color change when timer < 10 seconds on mobile.

#### EFFECTS STANDARDIZATION

**Current State:** Uses `useGameEffects` hook correctly
**Needed:** Ensure all effect triggers match the standard pattern

**Verify these triggers exist:**
- Match found → `shockwave` + `sparks`
- Streak 3+ → `combo-text`
- Streak 5+ → `confetti`
- Round complete → full celebration
- Game over → `vignette-pulse` (red)

---

### GAME 3: FLAPPY ORANGE

**Files:**
- `/src/pages/FlappyOrange.tsx` (4,586 lines - monolithic)
- `/src/games/FlappyOrange/` (if exists)

#### CRITICAL ISSUES

**Issue 3.1: Monolithic File**
The entire game is in one 4,586-line file with inline configs.

**Fix:** Extract to proper structure:
```
/src/games/FlappyOrange/
  ├── index.tsx (main game logic)
  ├── config.ts (all constants)
  ├── components/ (Bird, Pipe, Weather, etc.)
  └── FlappyOrange.game.css
```

**Issue 3.2: Frame Time Calculation Bug (Line ~3757)**
```typescript
const frameTimeMs = currentTime - fpsRef.current.lastRafTime; // BUG
```

**Fix:** Use previous loop time, not lastRafTime:
```typescript
const frameTimeMs = currentTime - lastFrameTimeRef.current;
lastFrameTimeRef.current = currentTime;
```

**Issue 3.3: Identical Easing Branches (Lines 1191-1193)**
```typescript
const smoothT = t < 0.5
  ? (1 - Math.cos(t * Math.PI)) / 2
  : (1 - Math.cos(t * Math.PI)) / 2;  // IDENTICAL!
```

**Fix:** Implement proper ease-in-out:
```typescript
const smoothT = t < 0.5
  ? 2 * t * t  // Ease in
  : 1 - Math.pow(-2 * t + 2, 2) / 2;  // Ease out
```

**Issue 3.4: Color Interpolation Doesn't Support RGBA**
```typescript
if (color1.startsWith('rgba') || color2.startsWith('rgba')) {
  return t < 0.5 ? color1 : color2;  // Just snaps!
}
```

**Fix:** Implement proper RGBA interpolation:
```typescript
function interpolateRgba(color1: string, color2: string, t: number): string {
  const parse = (c: string) => {
    const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    return { r: +match[1], g: +match[2], b: +match[3], a: match[4] ? +match[4] : 1 };
  };
  const c1 = parse(color1), c2 = parse(color2);
  if (!c1 || !c2) return t < 0.5 ? color1 : color2;
  return `rgba(${Math.round(c1.r + (c2.r - c1.r) * t)}, ${Math.round(c1.g + (c2.g - c1.g) * t)}, ${Math.round(c1.b + (c2.b - c1.b) * t)}, ${(c1.a + (c2.a - c1.a) * t).toFixed(2)})`;
}
```

#### MOBILE FIXES NEEDED

**Issue 3.5: Canvas Size Not Updating on Rotation**
Canvas dimensions set once at mount, don't update on orientation change.

**Fix:** Add resize listener:
```typescript
useEffect(() => {
  const handleResize = () => {
    // Recalculate canvas dimensions
    setCanvasSize(calculateCanvasSize());
  };
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
}, []);
```

**Issue 3.6: Touch Jump Sometimes Unresponsive**
Touch events may not register if finger moves during tap.

**Fix:** Use `touchstart` instead of `touchend` for jump:
```typescript
// More responsive - fires immediately on touch
onTouchStart={(e) => { e.preventDefault(); jump(); }}
```

#### EFFECTS STANDARDIZATION

**Current State:** Has extensive internal particle systems
**Integration:** Should also trigger shared effects for consistency

**Add these shared effect triggers:**
```typescript
// On pipe pass (in addition to internal effects):
triggerEffect('score-popup', { data: { score: 1 } });

// On milestone (10, 25, 50, 100):
triggerPreset(getComboPreset(milestone / 10, position));

// On game over with high score:
triggerPreset(getGameOverPreset({ isHighScore: true, score }));
```

---

### GAME 4: WOJAK RUNNER

**Files:**
- `/src/games/WojakRunner/index.tsx`
- `/src/games/WojakRunner/config.ts`
- `/src/pages/WojakRunner.tsx`
- `/src/games/WojakRunner/WojakRunner.game.css`

#### CRITICAL ISSUES

**Issue 4.1: Two Implementations with Different Effect Systems**
- `index.tsx` - Uses `useEffects()` hook
- `WojakRunner.tsx` - Uses `useGameEffects()`

**Fix:** Consolidate to use `useGameEffects()` pattern consistently.

**Issue 4.2: Collision Detection Inconsistency**
Different Y position calculations between versions:
```typescript
// index.tsx: Fixed CSS position
// WojakRunner.tsx: Calculated from game area height
```

**Fix:** Standardize to calculated approach:
```typescript
const playerY = gameAreaHeight - PLAYER_BOTTOM_OFFSET - PLAYER_SIZE;
```

**Issue 4.3: Score Popup Fallback Indicates Underlying Issue**
Comment: "REMOVED: addScorePopupRef - was causing artifact on sides"

**Fix:** Investigate and fix the positioning issue properly instead of using fallback:
```typescript
// Ensure score popup position is calculated relative to game container
const rect = gameContainerRef.current.getBoundingClientRect();
const popupX = ((collectX - rect.left) / rect.width) * 100;
const popupY = ((collectY - rect.top) / rect.height) * 100;
triggerEffect('score-popup', { position: { x: popupX, y: popupY }, data: { score: points } });
```

**Issue 4.4: Combo Reset Logic - Closure Bug**
```typescript
const wasBlocked = obstacles.some(o =>
  o.lane === c.lane &&
  Math.abs(o.y - c.y) < OBSTACLE_SIZE + COLLECTIBLE_SIZE
);
```

**Fix:** Use current obstacles from ref, not stale closure:
```typescript
const wasBlocked = obstaclesRef.current.some(o => ...);
```

#### MOBILE FIXES NEEDED

**Issue 4.5: Swipe Sensitivity Too High/Low**
30px threshold may be wrong for different screen sizes.

**Fix:** Make threshold relative to screen size:
```typescript
const SWIPE_THRESHOLD = Math.max(30, window.innerWidth * 0.08); // 8% of width, min 30px
```

**Issue 4.6: Player Offset Mismatch CSS vs JS**
```
CSS: bottom: 90px (mobile)
JS: height - playerBottomOffsetRef.current - PLAYER_SIZE
```

**Fix:** Single source of truth - use CSS custom property:
```css
:root { --player-bottom-offset: 60px; }
@media (max-width: 767px) { :root { --player-bottom-offset: 90px; } }
```
```typescript
const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--player-bottom-offset'));
```

#### EFFECTS STANDARDIZATION

**Verify these are implemented:**
- Orange collect → `shockwave` (orange) + `sparks` + `score-popup`
- Collision → `vignette-pulse` (red) + `screen-shake`
- Distance milestone → `confetti` + `combo-text`
- Streak 5+ → `floating-emoji` (🔥)

---

### GAME 5: COLOR REACT (Color Reaction)

**Files:**
- `/src/games/ColorReaction/index.tsx`
- `/src/games/ColorReaction/config.ts`
- `/src/pages/ColorReaction.tsx`

#### CRITICAL ISSUES

**Issue 5.1: Two Versions with Different Features**
```
config version: 4 colors, 100ms debounce, basic effects
page version: 6 colors, 50ms debounce, Fever Mode, advanced effects
```

**Fix:** Page version is more complete - migrate all features to shared game component or make page version the standard.

**Issue 5.2: Match Probability Mismatch**
```
config: 40% match chance
page: 60% match chance
```

**Fix:** Standardize to 60% (more engaging gameplay).

**Issue 5.3: Race Condition in Match Handling**
Complex triple-check system indicates underlying timing issue.

**Fix:** Simplify with proper state machine:
```typescript
type MatchState = 'idle' | 'matching' | 'processing' | 'result';
const [matchState, setMatchState] = useState<MatchState>('idle');

// Only one handler can process based on state
const handleTap = () => {
  if (matchState !== 'matching') return;
  setMatchState('processing');
  // ... process tap
};

const handleTimeout = () => {
  if (matchState !== 'matching') return;
  setMatchState('processing');
  // ... process timeout
};
```

#### MOBILE FIXES NEEDED

**Issue 5.4: Circle Size Too Small on Small Phones**
195px circles on 320px wide phone leave only 125px between them.

**Fix:** Dynamic sizing based on viewport:
```typescript
const circleSize = isMobile
  ? Math.min(195, (viewportWidth - 40) / 2) // 40px total padding
  : 280;
```

**Issue 5.5: Vertical Layout Cramped**
On phones <600px height, elements may overlap.

**Fix:** Add scroll or compress spacing dynamically:
```typescript
const verticalGap = viewportHeight < 600 ? 10 : 15;
const fontSize = viewportHeight < 600 ? '0.9rem' : '1rem';
```

#### EFFECTS STANDARDIZATION

**Verify Fever Mode effects use shared system:**
```typescript
// Fever activation
triggerEffect('confetti', { data: { colors: ['#ff6b00', '#ffcc00'] } });
triggerEffect('combo-text', { data: { text: '🔥 FEVER MODE!', level: 8 } });

// Perfect tap
triggerEffect('shockwave', { data: { color: '#FFD700' } });
```

---

### GAME 6: 2048 MERGE (Orange 2048)

**Files:**
- `/src/games/Orange2048/index.tsx`
- `/src/games/Orange2048/config.ts`
- `/src/pages/Orange2048.tsx`
- `/src/games/Orange2048/Orange2048.game.css`

#### CRITICAL ISSUES

**Issue 6.1: Duplicate Implementations**
Both `index.tsx` and `Orange2048.tsx` implement the same game with different effect systems.

**Fix:** Keep one implementation. Recommend keeping `Orange2048.tsx` (page version) and making `index.tsx` just re-export it.

**Issue 6.2: Duplicate CSS Files**
- `/src/games/Orange2048/Orange2048.game.css` (272 lines)
- `/src/pages/Orange2048.css` (330 lines)

**Fix:** Delete one, keep single CSS file.

**Issue 6.3: Last Merge Tracking Bug**
```typescript
lastMergeValueRef.current = totalScore;  // BUG: Should track highest TILE
```

**Fix:**
```typescript
const highestMerge = Math.max(...newGrid.flat().filter((v): v is number => v !== null));
if (highestMerge > lastMergeValueRef.current) {
  // Trigger effects
  lastMergeValueRef.current = highestMerge;
}
```

**Issue 6.4: Touch Listener Scope**
`index.tsx` attaches to document, `Orange2048.tsx` scopes to container.

**Fix:** Always scope to game container:
```tsx
<div
  ref={containerRef}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
>
```

#### MOBILE FIXES NEEDED

**Issue 6.5: Grid Not Responsive to Orientation**
Grid size fixed at mount, doesn't update on rotation.

**Fix:**
```typescript
const [gridSize, setGridSize] = useState(calculateGridSize());

useEffect(() => {
  const handleResize = () => setGridSize(calculateGridSize());
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

const calculateGridSize = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const size = Math.min(vw - 32, vh - 200, 400);
  return size;
};
```

**Issue 6.6: Swipe Conflicts with Page Scroll**
On mobile, vertical swipes may trigger page scroll.

**Fix:** Prevent default on touch events within game:
```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  e.preventDefault();
  // ... handle
};
```
And CSS:
```css
.game-container { touch-action: none; }
```

#### EFFECTS STANDARDIZATION

**Add milestone effects:**
```typescript
// On reaching new tile value (128, 256, 512, 1024, 2048):
if (highestTile > previousHighest && [128, 256, 512, 1024, 2048].includes(highestTile)) {
  triggerEffect('shockwave', { data: { size: 200 + highestTile / 10 } });
  triggerEffect('combo-text', { data: { text: `${highestTile}!`, level: Math.log2(highestTile) - 6 } });
  if (highestTile >= 512) triggerEffect('confetti');
}

// On win (2048):
triggerPreset(getVictoryPreset());
```

---

### GAME 7: BLOCK PUZZLE

**Files:**
- `/src/pages/BlockPuzzle.tsx` (2,936 lines - monolithic)
- `/src/pages/BlockPuzzle.css` (3,053 lines)

#### CRITICAL ISSUES

**Issue 7.1: No Separate Game Component**
Unlike other games, Block Puzzle has no `/src/games/BlockPuzzle/` folder.

**Fix:** Extract to standard structure:
```
/src/games/BlockPuzzle/
  ├── index.tsx
  ├── config.ts
  ├── components/
  │   ├── Grid.tsx
  │   ├── Piece.tsx
  │   └── PieceRack.tsx
  └── BlockPuzzle.game.css
```

**Issue 7.2: Line Clear Timing Bug**
Grid updates at different time than clearLines result used.

**Fix:** Ensure atomic update:
```typescript
const { clearedGrid, linesCleared } = clearLines(newGrid);
setGrid(clearedGrid); // Use cleared grid, not newGrid
```

**Issue 7.3: Combo Timeout Closure Bug**
Timeout captures stale `newCombo` vs `currentCombo`.

**Fix:** Use ref for combo value in timeout:
```typescript
const comboRef = useRef(0);
comboRef.current = newCombo;

setTimeout(() => {
  if (comboRef.current === newCombo) {
    setCombo(0);
  }
}, COMBO_TIMEOUT_MS);
```

**Issue 7.4: Danger Valid Placements Performance**
Expensive calculation (4800+ checks) on every grid change.

**Fix:** Add debouncing and memoization:
```typescript
const validPlacements = useMemo(() => {
  if (dangerLevel === 'safe') return [];
  return calculateValidPlacements(grid, pieces);
}, [grid, pieces, dangerLevel]);
```

#### MOBILE FIXES NEEDED

**Issue 7.5: Grid Doesn't Resize on Orientation Change**
```typescript
GRID_SIZE = isMobile ? Math.min(window.innerWidth - 32, 360) : 540;
```
Calculated once, not reactive.

**Fix:** Use state with resize listener (same pattern as 2048).

**Issue 7.6: Piece Dragging Offset on iOS**
Touch coordinates may be offset due to viewport scaling.

**Fix:** Use `getBoundingClientRect` for accurate positioning:
```typescript
const rect = gameContainerRef.current.getBoundingClientRect();
const x = (touch.clientX - rect.left) / rect.width;
const y = (touch.clientY - rect.top) / rect.height;
```

**Issue 7.7: iOS Audio Context Unlock Issues**
Multiple places try to resume audio context without coordination.

**Fix:** Centralize audio context management:
```typescript
const audioContextRef = useRef<AudioContext | null>(null);
const audioUnlockedRef = useRef(false);

const ensureAudioContext = async () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!audioUnlockedRef.current && audioContextRef.current.state === 'suspended') {
    await audioContextRef.current.resume();
    audioUnlockedRef.current = true;
  }
  return audioContextRef.current;
};
```

#### EFFECTS STANDARDIZATION

**Ensure these match standard patterns:**
- 1 line clear → `shockwave` (light)
- 2 line clear → `shockwave` + `sparks` + `combo-text` ("DOUBLE!")
- 3 line clear → + `confetti` + `screen-shake` ("TRIPLE!")
- 4+ line clear → full celebration ("QUAD!" / "MEGA!")
- Perfect clear → massive `confetti` + `lightning`
- Streak fire active → `floating-emoji` (🔥) + `vignette-pulse` (orange)

---

## PART 3: CROSS-GAME CONSISTENCY CHECKLIST

### 3.1 Visual Consistency

All games should have:

- [ ] Same background style (dark gradient or game-specific themed)
- [ ] Same font family (system-ui or configured font)
- [ ] Same color palette for UI elements (using CSS variables)
- [ ] Same button styles (rounded, with hover states)
- [ ] Same score display format (with commas for thousands)
- [ ] Same game over screen component (`ArcadeGameOverScreen`)

### 3.2 Effect Timing Consistency

All games should trigger effects at the same relative times:

- [ ] Score popup appears IMMEDIATELY on point earn
- [ ] Shockwave starts at impact point
- [ ] Combo text appears CENTER of game area
- [ ] Screen shake lasts 200-500ms (not longer)
- [ ] Confetti lasts 2-3 seconds (not longer)

### 3.3 Sound Consistency

All games should use the same sound hooks:

- [ ] `useGameSounds()` for all game SFX
- [ ] `playBlockLand()` for positive feedback
- [ ] `playPerfectBonus()` for perfect actions
- [ ] `playCombo(level)` for combos (escalating pitch)
- [ ] `playWinSound()` for victories
- [ ] `playGameOver()` for losses

### 3.4 Haptic Consistency

All games should use the same haptic patterns:

- [ ] Light tap (10ms) for minor interactions
- [ ] Medium tap (30ms) for successful actions
- [ ] Pattern for combos
- [ ] Celebration pattern for wins
- [ ] Error pattern for failures

### 3.5 Mobile Consistency

All games should have:

- [ ] Full-width layout on mobile
- [ ] Stats/HUD at top (not side)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scroll
- [ ] Safe area inset support
- [ ] Orientation change handling
- [ ] Touch controls that work (not just mouse events)

### 3.6 Performance Consistency

All games should:

- [ ] Use `requestAnimationFrame` for animation loops
- [ ] Clean up intervals/timeouts on unmount
- [ ] Limit particle counts (max 100-150)
- [ ] Use CSS transforms for animations (GPU accelerated)
- [ ] Debounce expensive calculations
- [ ] Use refs for values accessed in animation loops

---

## PART 4: IMPLEMENTATION PRIORITY ORDER

### Priority 1: Critical Fixes (Do First)

1. **Consolidate duplicate implementations** (all games with two versions)
2. **Fix frame timing bugs** (Flappy Orange)
3. **Fix collision detection** (Wojak Runner)
4. **Fix race conditions** (Color React, Block Puzzle)

### Priority 2: Mobile Fixes

1. **Add orientation change handling** (all games)
2. **Fix touch event handling** (ensure all games use touchstart/touchend properly)
3. **Fix viewport calculations** (safe area insets, dynamic sizing)
4. **Fix swipe conflicts** (2048, Block Puzzle)

### Priority 3: Effects Standardization

1. **Ensure all games use shared effects system**
2. **Standardize effect triggers** (same events → same effects)
3. **Verify sound integration**
4. **Verify haptic integration**

### Priority 4: Code Quality

1. **Extract monolithic files** (Flappy Orange, Block Puzzle)
2. **Remove duplicate CSS files**
3. **Standardize config structures**
4. **Add proper TypeScript types**

---

## PART 5: TESTING CHECKLIST

After making fixes, verify each game with this checklist:

### Desktop Testing

- [ ] Game loads without console errors
- [ ] Keyboard controls work
- [ ] All effects trigger correctly
- [ ] Sounds play (if enabled)
- [ ] Score saves to leaderboard
- [ ] Game over screen appears correctly
- [ ] Can restart game

### Mobile Testing

- [ ] Game loads without console errors
- [ ] Touch controls work
- [ ] Swipe/tap gestures register
- [ ] No accidental page scroll
- [ ] Layout fits screen (no overflow)
- [ ] Safe areas respected (notch, home indicator)
- [ ] Orientation change works
- [ ] Performance is smooth (60fps target)
- [ ] Haptics work (if device supports)

### Cross-Browser Testing

- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox

---

## APPENDIX: Quick Reference

### CSS Variables to Use

```css
:root {
  --color-tang-500: #ff6b00;  /* Primary orange */
  --color-tang-400: #ff8c33;  /* Light orange */
  --color-tang-600: #e05e00;  /* Dark orange */
  --color-cyber-500: #00d4ff; /* Accent cyan */
  --color-neon-500: #ff00ff;  /* Accent pink */
  --color-chia-500: #32cd32;  /* Success green */
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
}
```

### Standard Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }
```

### Standard Game Container CSS

```css
.game-container {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  overflow: hidden;
}
```

---

**END OF AUDIT DOCUMENT**

This document should be used by Claude CLI to systematically fix all issues. Work through Priority 1 first, then Priority 2, etc. Test after each major change.
