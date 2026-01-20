# **2048 MERGE GAME - COMPLETE TECHNICAL DOCUMENTATION**

## **GAME OVERVIEW**

**2048 Merge** is a tile-merging puzzle game in the classic 2048 style, themed around citrus fruits. Players slide tiles on a 4x4 grid; matching tiles merge and double in value. Goal: reach 2048.

**Core Concept:** Swipe in four directions to slide tiles. When two tiles with the same value touch, they merge into one tile with double the value. Continue until reaching 2048 (or the grid fills).

**Status:** ✅ Fully functional, moderate juice, needs more polish.

---

## **VISUAL APPEARANCE**

### **Layout (Mobile-First Design)**

- **Background:** Dark gradient (`#1a1a2e` → `#16213e`)
- **Grid:** 4x4 (16 cells) on tan background (`#bbada0`)
- **Header:**
  - Title: "2048" (large orange, 48px) + "Citrus Edition" subtitle
  - Score boxes: Current Score | Best Score
- **Controls:** "New Game" button + Mute button
- **Instructions:** Text below grid

### **Color System (Citrus Theme)**

Each tile value has a unique color gradient:

```
2:   #eee4da (beige) - seed
4:   #ede0c8 (light beige) - small citrus
8:   #f2b179 (light orange) - orange slice
16:  #f59563 (orange) - mandarin
32:  #f67c5f (deep orange) - blood orange
64:  #f65e3b (tangerine) - tangerine
128: #edcf72 (lemon) - lemon
256: #edcc61 (grapefruit) - grapefruit
512: #edc850 (pomelo) - pomelo
1024: #edc53f (golden citrus) - golden citrus
2048: #ff6b00 (THE ORANGE) - victory! 🍊
```

### **Visual States**

- **Empty cells:** Light beige (`rgba(238, 228, 218, 0.35)`)
- **New tiles:** Spawn animation (scale 0 → 1.1 → 1.0)
- **Merged tiles:** Merge animation (scale 1 → 1.2 → 1.0)
- **High-value tiles:** Glow effects (128+, more intense with higher values)
- **Win state:** Orange overlay with "You Win!" message
- **Game over:** Beige overlay with final score

### **Tile Sizing & Typography**

- **Font sizes:**
  - Large: 36px (values < 100)
  - Medium: 28px (values < 1000)
  - Small: 20px (values >= 1000)
- **Tile size:** Responsive, calc-based (adapts to container)
- **Grid spacing:** 12px desktop, 8px mobile, 6px extra small

---

## **GAME MECHANICS**

### **How It Works**

1. **Game Start:**
   - Empty 4x4 grid
   - Two random tiles spawn (90% chance of 2, 10% chance of 4)
   - Score = 0
   - Best score loaded from localStorage

2. **Movement:**
   - **Mobile:** Swipe gestures (up/down/left/right)
   - **Desktop:** Arrow keys (↑↓←→) or WASD
   - **Swipe threshold:** 50px minimum distance
   - All tiles slide in chosen direction

3. **Merging Rules:**
   - Tiles slide until hitting wall or another tile
   - When two tiles with same value collide, they merge
   - Merged tile = value × 2
   - Points = merged tile value (e.g., 4+4→8 = +8 points)
   - Each tile can only merge once per move

4. **After Move:**
   - If grid changed, spawn new tile (random empty cell)
   - 90% chance = 2, 10% chance = 4
   - Check for win condition (any tile ≥ 2048)
   - Check for game over (no empty cells AND no possible merges)

5. **Win Condition:**
   - Reaching 2048 (or higher) triggers win screen
   - Player can "Keep Playing" to continue
   - Or "New Game" to restart

6. **Game Over:**
   - No empty cells available
   - AND no adjacent tiles can merge
   - Final score submitted to leaderboard (if signed in)

### **Movement Algorithm**

The game uses a **slide-and-merge** algorithm:

1. **Slide:** Remove empty spaces, move tiles to edge
2. **Merge:** Adjacent equal tiles merge (left-to-right or top-to-bottom)
3. **Slide again:** Fill gaps after merging
4. **Spawn:** Add new tile if grid changed

**Direction handling:**
- Left/Up: Direct processing
- Right/Down: Reverse → process → reverse back

### **Grid State Management**

**Data Structure:**
```typescript
interface Tile {
  id: number;          // Unique identifier
  value: number;       // 2, 4, 8, 16... 2048
  row: number;         // 0-3
  col: number;         // 0-3
  isNew?: boolean;     // Spawn animation flag
  isMerged?: boolean;  // Merge animation flag
}
```

**Grid Representation:**
- Internally stored as `Tile[]` array
- Converted to 2D grid `(Tile | null)[][]` for processing
- Tiles positioned using CSS calc() based on row/col

---

## **SCORING SYSTEM**

### **Score Calculation**

- **Base Score:** Sum of all merged tile values
  - Example: 4+4→8 adds +8 points
  - Example: 16+16→32 adds +32 points
- **Highest Tile:** Tracked separately (leaderboard metadata)
- **Best Score:** Stored in localStorage, persists between sessions

### **Score Display**

- **Current Score:** Top-right header
- **Best Score:** Next to current score
- **Score Popup:** Animated "+X" appears on merge (800ms)
- **Score Updates:** Immediate on merge

### **Leaderboard Submission**

- **Game ID:** `'2048-merge'`
- **Submitted Data:**
  - `score` (total points)
  - `highestTile` (highest tile value achieved)
- **When:** On game over (if signed in)

---

## **CURRENT SOUND IMPLEMENTATION**

### **Sounds Used (via `useHowlerSounds`)**

1. `playClick()` - Button presses (New Game, mute toggle)
2. `playBlockLand()` - Every valid move (slide sound)
3. `playPerfectBonus()` - Regular merges (< 256)
4. `playCombo()` - Big merges (≥ 256 threshold)
5. `playWinSound()` - Reaching 2048 (win condition)
6. `playGameOver()` - Game over state

### **Sound Logic**

- **Move sound:** Always plays on valid move
- **Merge sound:** 
  - Regular: `playPerfectBonus()` for merges < 256
  - Big: `playCombo()` for merges ≥ 256
- **Win sound:** Plays once when 2048 reached
- **Game over:** Plays once on game over

### **Sound State**

- Uses Howler.js (`useHowlerSounds`)
- Mute button (top-right, next to New Game)
- iOS audio unlock on touchstart

### **Missing / Needs Improvement**

- No variation in sounds (same sound every time)
- No positional/contextual sound (same sound for all merges)
- No sound for tile spawn
- No sound escalation for consecutive merges
- No ambient sounds or music
- No haptic feedback integration (code exists but not connected to proper system)

---

## **VISUAL EFFECTS (CURRENT JUICE)**

### **Implemented Effects**

1. **Tile Animations:**
   - **Spawn:** Scale 0 → 1.1 → 1.0 (200ms)
   - **Merge:** Scale 1 → 1.2 → 1.0 (200ms)
   - **Position:** Smooth 150ms transitions when sliding

2. **Screen Shake:**
   - Triggers on big merges (≥ 256)
   - Duration: 300ms
   - Intensity: Moderate (4px movement with slight rotation)
   - Game over: Strong shake (500ms)

3. **Score Popup:**
   - Shows "+X" in center of grid
   - Orange color (`#ff6b00`)
   - Floats up, scales up then down
   - Duration: 600ms

4. **Glow Effects:**
   - Tiles 128+ have box-shadow glow
   - Intensity increases with value:
     - 128: Light glow
     - 256: Medium glow
     - 512: Strong glow
     - 1024: Very strong glow
     - 2048: Maximum glow (dual shadow)

5. **Universal Effects System (`useGameEffects`):**
   - **Shockwave:** Big merges (≥256) - orange, scale 0.7
   - **Sparks:** Big merges - orange particles
   - **Screen Shake:** Big merges + game over
   - **Floating Emojis:** Big merges (tile emoji)
   - **Epic Callout:** Big merges show tile value (e.g., "512!")
   - **Confetti:** Very high merges (≥512) + win condition
   - **Combo Update:** Tracks streak (but no visual combo meter)

### **Missing / Needs Improvement**

- **Particle bursts** - No particles on merge
- **Freeze frame** - No hit-stop on big merges
- **Impact flash** - No white expanding circle
- **Tile trail effects** - No trails when sliding
- **Anticipation** - No visual warnings before game over
- **Combo meter** - Tracked but not displayed
- **Celebration sequence** - Basic confetti, could be more dramatic
- **Near-game-over warning** - No visual indicator when almost stuck

---

## **FUNCTIONS & LOGIC**

### **Core Functions**

1. **`initGame()`**
   - Creates empty grid
   - Spawns 2 initial tiles
   - Returns `{ tiles: Tile[], nextTileId: number }`

2. **`spawnTile(tiles, nextId)`**
   - Finds random empty cell
   - Creates new tile (90% = 2, 10% = 4)
   - Marks as `isNew: true` for animation
   - Returns new tile or null if grid full

3. **`move(direction)`**
   - Main move function (up/down/left/right)
   - Processes grid, slides tiles, merges matches
   - Returns new tile array if changed, else old array
   - Handles animation delay (150ms before spawning new tile)
   - Prevents multiple moves during animation (`isMovingRef`)

4. **`slideAndMerge(line, nextIdRef)`**
   - Processes single row or column
   - Slides tiles, merges adjacent equals
   - Returns `{ tiles: Tile[], scoreGained: number }`

5. **`checkGameOver(tiles)`**
   - Checks if no empty cells
   - Checks if any adjacent tiles can merge
   - Returns `true` if game over

6. **`checkWin(tiles)`**
   - Checks if any tile ≥ 2048
   - Returns `true` if won

7. **`getHighestMergedValue(tiles)`**
   - Finds highest value among newly merged tiles
   - Used for effects triggering

8. **`handleNewGame()`**
   - Resets all state
   - Initializes new game
   - Clears effects

9. **`handleTouchStart/End/Move(e)`**
   - Touch/swipe detection
   - Calculates swipe direction from touch delta
   - Minimum 50px swipe distance

10. **`handleKeyDown(e)`**
    - Keyboard input (arrow keys + WASD)
    - Prevents default scroll behavior

### **State Management**

**Game State:**
```typescript
tiles: Tile[]              // All tiles on grid
score: number              // Current score
bestScore: number          // Best score (localStorage)
isGameOver: boolean        // Game over flag
hasWon: boolean            // Reached 2048
dismissedWin: boolean      // Dismissed win screen
isMuted: boolean           // Sound mute state
scorePopup: { value, key } // Popup animation state
```

**Refs (Performance & State):**
- `nextTileIdRef` - Next tile ID counter
- `touchStartRef` - Touch start position for swipe detection
- `isMovingRef` - Prevents multiple moves during animation
- `gridWrapperRef` - Grid container DOM ref
- `scorePopupKeyRef` - Score popup animation key
- `highestTileRef` - Tracks highest tile achieved (for leaderboard)

---

## **GAME GOALS / WIN CONDITIONS**

### **Primary Goals**

1. **Reach 2048:** Main objective
2. **High Score:** Maximize total points
3. **Highest Tile:** Achieve highest possible tile (4096, 8192, etc.)
4. **Beat Best Score:** Surpass personal best
5. **Leaderboard Ranking:** Compete globally

### **Win Condition**

- **Reach 2048:** Any tile reaches value ≥ 2048
- **Continue Playing:** Option to keep playing after win
- **Celebration:** Confetti, epic callout, win sound

### **Lose Condition**

- **Game Over:** No empty cells AND no possible merges
- **Final Score:** Score at game over submitted to leaderboard
- **Stats Shown:** Final score, highest tile achieved

---

## **TECHNICAL IMPLEMENTATION**

### **Architecture**

- **Framework:** React + TypeScript
- **Styling:** CSS modules with CSS animations
- **Sound:** Howler.js (`useHowlerSounds` hook)
- **Effects:** Universal effects system (`useGameEffects`)
- **Leaderboard:** `useLeaderboard('2048-merge')` hook
- **Storage:** localStorage for best score

### **File Structure**

```
src/games/Merge2048/
├── Merge2048Game.tsx    // Main game component (830 lines)
├── Merge2048Game.css    // All styles + animations (558 lines)
└── index.ts             // Export
```

### **Performance Optimizations**

- **Animation Lock:** `isMovingRef` prevents moves during animation
- **Debounced Input:** No input during tile spawning delay (150ms)
- **CSS Transitions:** Hardware-accelerated tile movements
- **Refs for State:** Immediate access without re-renders
- **Efficient Grid Processing:** Direct array manipulation, minimal object creation

### **Responsive Design**

- **Mobile-First:** Base styles for mobile
- **Breakpoints:**
  - Desktop: `@media (min-width: 768px)`
  - Small screens: `@media (max-width: 420px)`
  - Extra small: `@media (max-width: 320px)`
  - Short screens: `@media (max-height: 600px)`
- **Grid Scaling:** CSS calc() for responsive tile sizing
- **Touch Optimized:** `touch-action: none` prevents scroll interference

### **Accessibility**

- ✅ **Keyboard playable:** Arrow keys + WASD
- ✅ **Color blind mode:** Supported (colors have distinct values)
- ✅ **Reduced motion:** Supported (CSS respects prefers-reduced-motion)
- ❌ **Screen reader:** NOT implemented
- ❌ **Audio descriptions:** NOT implemented
- ✅ **Pause anytime:** Can restart game anytime

---

## **CURRENT POLISH LEVEL**

### **✅ What's Working Well**

- Core gameplay functional
- Smooth tile animations (spawn, merge, slide)
- Basic visual feedback (glow effects, score popup)
- Sound system integrated
- Universal effects system working
- Progressive difficulty (naturally gets harder as grid fills)
- Leaderboard integration
- Responsive design (mobile/desktop)
- Best score persistence (localStorage)

### **⚠️ What Needs Improvement (Juice Gaps)**

1. **Sound Design**
   - Missing sound variations (same sounds every time)
   - No sound for tile spawn
   - No contextual sounds (different sounds for different merge values)
   - No sound layers/composition
   - No ambient sounds or music

2. **Visual Effects**
   - Missing particle bursts on merges
   - No freeze frame on big merges (would feel more impactful)
   - No impact flash (white expanding circle on merge)
   - Limited screen shake intensity (could be more dramatic)
   - No tile trail effects when sliding
   - No anticipation effects (warning before game over)

3. **Haptic Feedback**
   - Code exists (`triggerHaptic`) but uses basic Vibration API
   - NOT using shared haptics system
   - Should integrate with `useGameHaptics` hook
   - No haptic patterns (just simple vibrations)

4. **Feedback Timing**
   - Effects feel slightly delayed
   - No freeze frame on big merges (would feel more satisfying)
   - Score popup could animate faster
   - Tile animations could be snappier

5. **Combo System**
   - Combo tracked (`updateCombo`) but NOT VISUAL
   - No combo meter displayed
   - No combo multiplier for score
   - No combo celebration beyond universal effects

6. **Anticipation & Warnings**
   - No visual warning when almost game over
   - No prediction of game over state
   - No "last move possible" indicator

7. **Celebrations**
   - Basic confetti exists
   - Win celebration could be more dramatic
   - No sequence of effects for big achievements
   - Game over could be more impactful

8. **Polish Details**
   - Tile animations could use better easing (bouncy feel)
   - Score popup could have more personality
   - Glow effects could pulse/breathe on high tiles
   - No particle trails on tile movement

---

## **CONFIGURATION**

### **Game Config**

```typescript
{
  id: 'merge-2048',
  name: '2048 Merge',
  description: 'Slide and merge citrus tiles to reach 2048!',
  emoji: '🍊',
  accentColor: '#eab308',
  hasHighScores: true,
  difficulty: 'medium',
  estimatedPlayTime: '5-15 min',
  accessibilityFeatures: {
    keyboardPlayable: true,
    screenReaderSupport: false,
    colorBlindMode: true,
    reducedMotionSupport: true,
    audioDescriptions: false,
    pauseAnytime: true
  }
}
```

### **Constants**

```typescript
GRID_SIZE = 4              // 4x4 grid
WINNING_VALUE = 2048       // Target value
BIG_MERGE_THRESHOLD = 256  // Trigger screen shake/effects
SPAWN_CHANCE_4 = 0.1       // 10% chance of spawning 4
SPAWN_CHANCE_2 = 0.9       // 90% chance of spawning 2
SWIPE_THRESHOLD = 50       // Minimum swipe distance (px)
```

---

## **SUMMARY FOR LLM ADVISOR**

The **2048 Merge** game is a functional puzzle game with moderate polish. It needs:

1. **Enhanced sound design** - More sounds, variations, contextual audio for different merge values
2. **More visual juice** - Particles, freeze frames, impact flashes, better screen shake, tile trails
3. **Haptic feedback integration** - Connect to shared haptics system, add patterns
4. **Improved feedback timing** - Faster, snappier animations, freeze frames on big merges
5. **Combo system visualization** - Display combo meter, add combo multipliers
6. **Anticipation improvements** - Warnings before game over, predictions
7. **Polish** - Better easing, more personality in animations, breathing glow effects

**Current State:** ✅ Solid foundation, basic juice implemented, needs more dramatic effects to match the quality of your most polished games (Orange Stack, Brick Breaker).

**Key Differentiators:**
- Unique citrus color theme
- Smooth tile animations
- Universal effects system integrated
- Responsive design working well

**Biggest Gaps:**
- No particle effects on merges
- No haptic system integration (basic vibrations only)
- No combo meter (tracked but not displayed)
- Sound design needs more variation and context

---

**This document contains everything needed to understand the 2048 Merge game.** You can use this to provide research and advice on improvements and juicing up the game.
