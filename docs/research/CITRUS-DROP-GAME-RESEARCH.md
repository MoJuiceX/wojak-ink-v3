# **CITRUS DROP GAME - COMPLETE TECHNICAL DOCUMENTATION**

## **GAME OVERVIEW**

**Citrus Drop** is a Suika/Watermelon-style physics merge puzzle game with a citrus theme. Players drop fruits into a container; when two fruits of the same type touch, they merge into the next tier fruit. Goal: create the largest fruit (melon) without letting fruits stay above the danger line.

**Core Concept:** Drop fruits strategically, merge matching types to create bigger fruits. Game over if any fruit stays above the danger line for 2+ seconds.

**Status:** ✅ Fully functional, moderate juice implemented, needs more polish.

---

## **VISUAL APPEARANCE**

### **Layout (Canvas-Based Rendering)**

- **Background:** Dark gradient container (`#1a1a2e` → `#0f0f1a`)
- **Rendering:** HTML5 Canvas (requestAnimationFrame + Matter.js physics)
- **Canvas Size:**
  - Mobile: `Math.min(window.innerWidth - 20, 400)` × `Math.min(window.innerHeight - 180, 650)`
  - Desktop: 400 × 600
- **Controls:** Back button (top-left), Sound toggle (next to back)
- **HUD:** Score panel (top-right), Next fruit indicator, Combo display

### **Game Container**

- **Background:** Warm cream gradient (`#FFF8DC` → `#FFE4B5`)
- **Walls:** Wood texture (left, right, bottom)
  - Color: Brown gradient (`#8B4513` → `#A0522D` → `#8B4513`)
  - Thickness: 15px
- **Game Over Line:** Dashed red line at Y = 100px
  - Warning when fruits stay above this line

### **Fruit Progression (7 Tiers)**

```typescript
0. Seed (🫘)      - radius: 15px, color: #8B4513, points: 1
1. Kumquat (🍊)   - radius: 20px, color: #FFA500, points: 3
2. Clementine (🍊) - radius: 28px, color: #FF8C00, points: 6
3. Orange (🍊)    - radius: 38px, color: #FF6B00, points: 10
4. Grapefruit (🍊) - radius: 50px, color: #FF6347, points: 15
5. Pomelo (🍈)    - radius: 65px, color: #FFFF00, points: 21
6. Melon (🍈)     - radius: 80px, color: #90EE90, points: 28
```

### **Fruit Visual Design**

Each fruit is rendered as:
- **Shadow:** Dark circle offset (3px, 3px) with 20% opacity
- **Gradient Body:** Radial gradient (light top-left → dark bottom-right)
  - Lightened color (+40) at center
  - Base color at 70%
  - Darkened color (-30) at edge
- **Stroke:** Darker border (color -40) with 2px width
- **Highlight:** White circle (top-left, 25% of radius) with 50% opacity
- **Leaf:** Green ellipse (for fruits 1-4: kumquat, clementine, orange, grapefruit)
  - Position: Top of fruit (85% radius up)
  - Color: `#228B22` with dark green stroke `#006400`

### **Drop Preview**

- **Ghost Fruit:** Semi-transparent (40% opacity) preview of next fruit
- **Position:** At Y = 60px (DROP_Y), X = mouse/touch position (clamped to walls)
- **Visual:** Dashed white stroke (5px dash pattern)
- **Drop Line:** Dashed vertical line from preview to floor (white, 30% opacity, 4px dash)

### **Visual States**

- **Ready:** Title screen with fruit progression preview, "TAP TO PLAY" button
- **Playing:** Canvas with physics simulation, HUD overlay
- **Game Over:** Dark overlay with stats, highest fruit emoji, leaderboard option

---

## **GAME MECHANICS**

### **Physics (Matter.js)**

```typescript
Gravity: { x: 0, y: 1.2 }        // Moderate downward pull
Restitution: 0.3                  // Slight bounce on collision
Friction: 0.5                     // Surface friction
FrictionAir: 0.01                 // Air resistance
Density: 0.001                    // Lightweight fruits
Wall Friction: 0.3                // Wall friction
Wall Restitution: 0.2             // Minimal bounce off walls
```

**Design Philosophy:** Realistic physics simulation with moderate bounce and friction for satisfying merge interactions.

### **How It Works**

1. **Game Start (Ready State):**
   - Shows title screen with fruit progression
   - "TAP TO PLAY" button
   - Instructions: "Move to position • Tap to drop • Match to merge!"

2. **Gameplay Loop:**
   - **Positioning:** Move mouse/touch or arrow keys to position preview fruit
   - **Drop:** Click/tap/Space to drop fruit
   - **Physics:** Fruit falls and interacts with other fruits
   - **Merge:** When two same-type fruits collide, they merge into next tier
   - **Next Fruit:** Random fruit from first 5 types (seed to grapefruit)

3. **Merge System:**
   - **Trigger:** Collision detection via Matter.js events
   - **Same Type Required:** Both fruits must be same fruitType
   - **Merge Position:** Midpoint between two colliding fruits
   - **Velocity Inheritance:** New fruit inherits average velocity of merged fruits
   - **Duplicate Prevention:** Pair tracking prevents double merges
   - **Max Level:** Two melons merge = both disappear + 100 bonus points

4. **Drop System:**
   - **Position:** X position follows mouse/touch or arrow keys
   - **Constraints:** Clamped to container bounds (walls + fruit radius)
   - **Drop Y:** Fixed at 60px from top (DROP_Y)
   - **Cooldown:** 500ms between drops (prevents spam)
   - **Next Fruit:** Random from types 0-4 (seed to grapefruit, excludes pomelo/melon)

5. **Game Over Condition:**
   - **Danger Line:** Y = 100px (GAME_OVER_LINE)
   - **Trigger:** Any fruit stays above line for 2+ seconds
   - **Tracking:** Each fruit tracks `aboveLineTime` when above line
   - **Check:** Runs every frame, triggers game over if timeout exceeded

6. **Combo System:**
   - **Increment:** Combo increases on each merge
   - **Timeout:** 2 seconds (resets if no merge)
   - **Visual:** Combo display shows "🔥 x{N}" when combo ≥ 3
   - **Celebrations:**
     - Combo x3: Epic callout "COMBO x3!"
     - Combo x5: Epic callout "COMBO x5!" + confetti
     - Combo x10: Epic callout "🔥 UNSTOPPABLE! 🔥" + confetti + vignette

7. **Game Over:**
   - Physics engine stops
   - Shows final score, highest fruit achieved, total merges
   - Displays highest fruit emoji (bouncing animation)
   - Leaderboard option

---

## **SCORING SYSTEM**

### **Point Values**

| Fruit | Points | Merge Tier |
|-------|--------|------------|
| Seed | 1 | 0 |
| Kumquat | 3 | 1 |
| Clementine | 6 | 2 |
| Orange | 10 | 3 |
| Grapefruit | 15 | 4 |
| Pomelo | 21 | 5 |
| Melon | 28 | 6 |

### **Score Calculation**

- **Base Points:** Points from merged fruit tier (see table above)
- **Example:** 2 Oranges (tier 3) merge → +10 points
- **Example:** 2 Grapefruits (tier 4) merge → +15 points
- **Max Level Bonus:** 2 Melons merge → +100 bonus points (both disappear)

### **Scoring Formula**

```typescript
score += FRUITS[fruitType].points  // On merge
score += 100                       // If melon + melon merge
```

### **Highest Fruit Tracking**

- Tracks highest fruit tier achieved during game
- Updates when merging creates new highest tier
- Epic callout when reaching tier 4+ (Grapefruit, Pomelo, Melon)

### **Leaderboard Submission**

- **Game ID:** `'citrus-drop'`
- **Submitted Data:**
  - `score` (total points)
  - `highestFruit` (fruit name string)
  - `totalMerges` (number of merges performed)
  - `playTime` (milliseconds played)
- **When:** On game over (if signed in)
- **High Score:** Tracks via `isNewHighScore` from leaderboard response

---

## **CURRENT SOUND IMPLEMENTATION**

### **Sounds Used (via `useGameSounds`)**

1. `playBlockLand()` - Every drop + every merge
2. `playCombo(fruitType)` - Big merges (tier 4+: grapefruit, pomelo)
3. `playPerfectBonus()` - Pomelo merges (tier 5)
4. `playWinSound()` - Melon explosion (max level merge)
5. `playGameOver()` - Game over state

### **Sound Logic**

- **Drop Sound:** Always plays `playBlockLand()` when fruit is dropped
- **Merge Sound:** Always plays `playBlockLand()` when fruits merge
- **Big Merge (tier 4+):** `playCombo(fruitType)` for grapefruit and above
- **Pomelo Merge:** `playPerfectBonus()` for tier 5 merges
- **Melon Merge:** `playWinSound()` for max level (tier 6) merge
- **Game Over:** Plays once on game over

### **Sound State**

- Uses shared `useGameSounds()` hook
- Sound toggle button (top-left)
- State stored in component (not localStorage)

### **Missing / Needs Improvement**

- No sound variation (same drop/merge sounds every time)
- No sound for fruit bouncing/rolling
- No sound for approaching danger line
- No sound for combo milestones (3, 5, 10)
- No ambient sounds or background music
- No contextual sounds based on fruit size
- Could use different sounds for different merge tiers

---

## **VISUAL EFFECTS (CURRENT JUICE)**

### **Implemented Effects**

1. **Fruit Rendering:**
   - **Shadows:** Realistic drop shadows (offset 3px, 20% opacity)
   - **Gradients:** Radial gradients for 3D appearance
   - **Highlights:** White highlight circles (top-left)
   - **Leaves:** Green leaves on citrus fruits (tiers 1-4)
   - **Rotation:** Fruits rotate based on physics simulation

2. **Merge Effects:**
   - **Screen Shake:** Based on fruit tier (tier 2+: `tier * 40`ms duration)
   - **Score Popup:** Shows "+{points}" at merge position
   - **Epic Callouts:** 
     - Tier 3+: "NICE MERGE!"
     - Tier 4+: "CITRUS MASTER!" + confetti
     - Tier 5+: "POMELO POWER!" + vignette
     - Tier 6: "🎉 MELON EXPLOSION! 🎉" + confetti + vignette
   - **Combo Callouts:**
     - Combo x3: "COMBO x3!"
     - Combo x5: "COMBO x5!" + confetti
     - Combo x10: "🔥 UNSTOPPABLE! 🔥" + confetti + vignette

3. **Universal Effects System (`useGameEffects`):**
   - **Screen Shake:** Tier 2+ merges (intensity based on tier)
   - **Confetti:** Tier 4+ merges, combo x5, combo x10, melon merge
   - **Vignette:** Tier 5+ merges, combo x10
   - **Score Popups:** Every merge shows "+{points}"
   - **Epic Callouts:** Various messages based on merge tier and combo

4. **Game Over Effects:**
   - Dark overlay with backdrop blur
   - Highest fruit emoji (bouncing animation)
   - Score pulsing animation
   - "NEW RECORD!" gold glow animation (if new high score)
   - Leaderboard panel overlay (slide-in animation)

5. **HUD Display:**
   - **Score:** Large orange text with glow effect
   - **Next Fruit:** White background, emoji preview
   - **Combo:** Orange gradient background, pulsing animation when active (combo ≥ 3)

6. **Ready Screen:**
   - Title with glowing orange text animation
   - Fruit progression preview (all 7 fruits shown)
   - "TAP TO PLAY" button with hover effects

### **Missing / Needs Improvement**

- **No particle bursts** - No particles on merge (could have fruit chunks/splashes)
- **No freeze frame** - No hit-stop on big merges (would feel more impactful)
- **No impact flash** - No white expanding circle on merge
- **No fruit trails** - No velocity trails when fruits are moving
- **No merge animation** - Fruits just disappear and new one appears (could have scale/pulse)
- **No danger line warning** - No visual warning when approaching game over line
- **No fruit glow** - Fruits don't glow when about to merge
- **Limited screen shake** - Only on tier 2+, could be more varied
- **No fruit bounce animation** - Fruits just stop (could have bounce on impact)

---

## **HAPTIC FEEDBACK**

### **Implemented Haptics (via `useGameHaptics`)**

1. `hapticScore()` - Every drop and tier 2+ merges
2. `hapticCollision()` - Tier 3+ merges
3. `hapticGameOver()` - Tier 4+ merges (grapefruit and above)

### **Haptic Patterns**

- Uses shared haptics system (`@/systems/haptics`)
- Different haptic patterns for different merge tiers
- No haptic on game over (only sound)

### **Missing / Needs Improvement**

- No haptic on every merge (only tier 2+)
- No haptic on fruit bounces/rolls
- No haptic on approaching danger line
- No haptic escalation for combos
- Could have more nuanced patterns for different fruit sizes
- No haptic on game over

---

## **FUNCTIONS & LOGIC**

### **Core Functions**

1. **`createFruit(fruitType, x, y)`**
   - Creates Matter.js circle body
   - Sets physics properties (restitution, friction, density)
   - Assigns fruitType and unique fruitId
   - Returns FruitBody with extended Matter.Body properties

2. **`mergeFruits(fruitA, fruitB)`**
   - Calculates merge position (midpoint)
   - Removes both old fruits from world
   - Adds points based on merged fruit tier
   - Triggers merge effects
   - Updates combo (with timeout)
   - Creates new fruit at next tier (if not max level)
   - Inherits velocity from merged fruits
   - Handles max level merge (melon + melon = explosion + bonus)

3. **`triggerMergeEffects(fruitType, x, y)`**
   - Shows score popup at merge position
   - Plays sound based on tier
   - Triggers screen shake (tier 2+)
   - Shows epic callouts (tier 3+)
   - Triggers confetti (tier 4+)
   - Triggers vignette (tier 5+)

4. **`setupCollisionEvents(engine)`**
   - Sets up Matter.js collision detection
   - Filters for fruit-to-fruit collisions
   - Checks if same fruit type
   - Prevents duplicate merges (pair tracking)
   - Schedules merge (10ms delay to avoid physics issues)

5. **`checkGameOver()`**
   - Checks all fruits in world
   - Tracks time each fruit is above danger line
   - Triggers game over if any fruit exceeds 2 seconds above line
   - Resets tracking when fruit drops below line

6. **`dropFruit()`**
   - Creates fruit at drop position
   - Adds to physics world
   - Plays sound and haptic
   - Starts cooldown (500ms)
   - Generates next random fruit (types 0-4)

7. **`handlePointerMove(e)`**
   - Updates drop X position based on mouse/touch
   - Clamps to container bounds (accounting for fruit radius)
   - Only active during 'playing' state

8. **`handlePointerDown(e)`**
   - Triggers drop when clicked/tapped
   - Only active during 'playing' state

9. **`render()`**
   - Clears canvas
   - Draws background gradient
   - Draws game over line (dashed red)
   - Draws walls (wood texture)
   - Draws all fruits (with shadows, gradients, highlights, leaves)
   - Draws drop preview (ghost fruit + drop line)
   - Called every frame via game loop

10. **`startGame()`**
    - Resets all state
    - Sets game state to 'playing'
    - Initializes random first fruit
    - Resets score, combo, merges

11. **`resetGame()`**
    - Clears physics world
    - Resets Matter.js engine
    - Calls startGame()

12. **`handleGameOver()`**
    - Sets game over state
    - Stops physics engine
    - Submits score to leaderboard
    - Plays game over sound

### **State Management**

**Game State (React State):**
```typescript
gameState: 'ready' | 'playing' | 'gameover'
dimensions: { width, height }        // Canvas dimensions
score: number                        // Current score
highestFruit: number                 // Highest fruit tier (0-6)
combo: number                        // Current combo count
nextFruitType: number                // Next fruit to drop (0-4)
dropX: number                        // X position for drop
canDrop: boolean                     // Cooldown flag
isNewRecord: boolean                 // Flag for new high score
submitted: boolean                   // Leaderboard submission status
soundEnabled: boolean                // Sound toggle
showLeaderboardPanel: boolean        // Leaderboard overlay
```

**Refs (Performance & Physics):**
- `engineRef` - Matter.js Engine instance
- `worldRef` - Matter.js World instance
- `animationRef` - requestAnimationFrame ID
- `mergedPairsRef` - Set of merged fruit pairs (prevents duplicates)
- `comboTimeoutRef` - Combo reset timer
- `gameStartTimeRef` - Game start timestamp
- `totalMergesRef` - Total merges counter
- `gameStateRef` - Current game state (for game loop)
- `scoreRef` - Current score (for game loop)
- `highestFruitRef` - Highest fruit tier (for game loop)
- `comboRef` - Current combo (for game loop)
- `showExitDialogRef` - Navigation guard dialog state

**Extended Matter.js Types:**
```typescript
interface FruitBody extends Matter.Body {
  fruitType: number      // Fruit tier (0-6)
  fruitId: string        // Unique identifier
  aboveLineTime?: number | null  // Timestamp when above danger line
}
```

---

## **GAME GOALS / WIN CONDITIONS**

### **Primary Goals**

1. **Create Melon** - Ultimate goal (tier 6 fruit)
2. **High Score** - Maximize total points
3. **Highest Fruit** - Achieve highest fruit tier
4. **Max Merges** - Perform as many merges as possible
5. **Long Combos** - Build high combo streaks
6. **Beat Personal Best** - Surpass high score
7. **Leaderboard Ranking** - Compete globally

### **Lose Condition**

- **Game Over:** Any fruit stays above danger line (Y = 100px) for 2+ seconds
- **Final Score:** Total points achieved
- **Stats Shown:** Score, highest fruit name, total merges

---

## **TECHNICAL IMPLEMENTATION**

### **Architecture**

- **Framework:** React + TypeScript
- **Physics:** Matter.js (realistic physics simulation)
- **Rendering:** HTML5 Canvas (requestAnimationFrame game loop)
- **Animation:** Matter.js physics engine + manual rendering
- **Sound:** Shared `useGameSounds()` hook
- **Haptics:** Shared `useGameHaptics()` system
- **Effects:** Universal `useGameEffects()` system
- **Leaderboard:** `useLeaderboard('citrus-drop')` hook
- **Navigation:** React Router
- **Mobile Detection:** `useIsMobile()` hook
- **Navigation Guard:** `useGameNavigationGuard()` (prevents accidental exit)

### **File Structure**

```
src/pages/
├── CitrusDrop.tsx    // Main game component (964 lines)
└── CitrusDrop.css    // UI styles (698 lines)
```

### **Performance Optimizations**

- **Ref-based state** - Game state in refs (avoids re-renders during game loop)
- **requestAnimationFrame** - Smooth 60fps game loop
- **Matter.js physics** - Efficient collision detection and physics simulation
- **Pair tracking** - Prevents duplicate merge calculations
- **Cooldown system** - Prevents drop spam
- **Efficient rendering** - Canvas-based, minimal DOM manipulation

### **Responsive Design**

- **Mobile-First:** Adapts to viewport size
- **Canvas Scaling:** Responsive dimensions based on screen size
  - Mobile: `Math.min(window.innerWidth - 20, 400)` × `Math.min(window.innerHeight - 180, 650)`
  - Desktop: Fixed 400×600
- **Touch Support:** Pointer events for mobile (onPointerMove, onPointerDown)
- **Keyboard Support:** Arrow keys for positioning, Space/Enter for drop
- **Breakpoints:** CSS media queries for mobile adjustments

### **Accessibility**

- ✅ **Keyboard playable:** Arrow keys + Space/Enter
- ✅ **Color blind mode:** Supported (fruits have distinct sizes, not just colors)
- ❌ **Screen reader:** NOT implemented (Canvas is not accessible)
- ❌ **Reduced motion:** NOT implemented (60fps physics required)
- ✅ **Audio descriptions:** Supported (sound effects provide feedback)
- ✅ **Pause anytime:** Can exit anytime (navigation guard prevents accidental exit)

---

## **CURRENT POLISH LEVEL**

### **✅ What's Working Very Well**

- ✅ Core gameplay fully functional
- ✅ Realistic physics simulation (Matter.js)
- ✅ Smooth 60fps rendering
- ✅ Beautiful fruit rendering (gradients, shadows, highlights, leaves)
- ✅ Merge system working correctly
- ✅ Combo system with visual display
- ✅ Score popups on merges
- ✅ Epic callouts for big merges and combos
- ✅ Screen shake based on merge tier
- ✅ Confetti and vignette effects
- ✅ Sound system integrated
- ✅ Haptic feedback integrated
- ✅ Universal effects system working
- ✅ Leaderboard integration
- ✅ Responsive design (mobile/desktop)
- ✅ Game over detection (danger line system)
- ✅ Ready screen with fruit preview

### **⚠️ What Needs Improvement (Juice Gaps)**

1. **Sound Design**
   - Missing sound variations (same drop/merge sounds every time)
   - No sound for fruit bouncing/rolling
   - No sound for approaching danger line
   - No sound for combo milestones (3, 5, 10)
   - No ambient sounds or background music
   - No contextual sounds based on fruit size
   - Could use different sounds for different merge tiers

2. **Visual Effects**
   - **Missing particle bursts** on merge (could have fruit chunks/splashes)
   - **No freeze frame** on big merges (would feel more impactful)
   - **No impact flash** (white expanding circle on merge)
   - **No fruit trails** (no velocity trails when fruits are moving)
   - **No merge animation** (fruits just disappear and new one appears)
   - **No danger line warning** (no visual warning when approaching game over)
   - **No fruit glow** (fruits don't glow when about to merge)
   - **Limited screen shake** (only on tier 2+, could be more varied)
   - **No fruit bounce animation** (fruits just stop on impact)

3. **Haptic Feedback**
   - Working but could vary intensity
   - No haptic on every merge (only tier 2+)
   - No haptic on fruit bounces/rolls
   - No haptic on approaching danger line
   - Could escalate more with combos
   - No haptic on game over

4. **Physics Feel**
   - Physics are good but could be more bouncy/satisfying
   - Fruits could have more weight/satisfaction on impact
   - Merge timing could be more dramatic (slight delay?)

5. **Celebrations**
   - Good milestone system exists
   - Could be more dramatic at higher tiers
   - Melon explosion could be more spectacular
   - Game over could have more personality

6. **Anticipation & Warnings**
   - No visual warning when approaching danger line
   - No countdown or indicators
   - Could highlight fruits above danger line
   - No prediction of game over state

7. **Polish Details**
   - Score display could pulse/glow on big merges
   - Fruits could have more texture/detail
   - Walls could have more wood texture detail
   - Could add particle effects to fruit drops
   - Merge position could have more dramatic effects

---

## **CONFIGURATION**

### **Game Config**

```typescript
{
  id: 'citrus-drop',
  name: 'Citrus Drop',
  emoji: '🍊',
  description: 'Drop and merge fruits to create bigger citrus! A Suika-style physics puzzle.',
  shortDescription: 'Drop fruits! Match to merge! How big can you go?',
  accentColor: '#f472b6',
  hasHighScores: true,
  difficulty: 'medium',
  estimatedPlayTime: '3-10 min',
  accessibilityFeatures: {
    keyboardPlayable: true,
    screenReaderSupport: false,
    colorBlindMode: true,
    reducedMotionSupport: false,
    audioDescriptions: true,
    pauseAnytime: false
  }
}
```

### **Constants**

```typescript
FRUITS: 7 tiers (seed → melon)
WALL_THICKNESS: 15          // Pixels
GAME_OVER_LINE: 100         // Y position (pixels from top)
DROP_Y: 60                  // Drop position (pixels from top)
DROP_COOLDOWN: 500          // Milliseconds between drops
DANGER_LINE_TIMEOUT: 2000   // Milliseconds above line before game over

PHYSICS:
  Gravity: { x: 0, y: 1.2 }
  Restitution: 0.3          // Bounce
  Friction: 0.5             // Surface friction
  FrictionAir: 0.01         // Air resistance
  Density: 0.001            // Lightweight
  Wall Friction: 0.3
  Wall Restitution: 0.2

FRUIT RANDOMIZATION:
  Next fruit types: 0-4 (seed to grapefruit, excludes pomelo/melon)
```

---

## **UNIQUE FEATURES**

### **What Makes This Game Special**

1. **Realistic Physics:** Matter.js physics engine for satisfying fruit interactions
2. **7-Tier Progression:** From tiny seed to massive melon
3. **Danger Line System:** Strategic gameplay - prevent fruits from staying too high
4. **Combo System:** Chain merges for bonuses (2 second timeout)
5. **Max Level Explosion:** Two melons merge = spectacular explosion + 100 bonus points
6. **Beautiful Fruit Rendering:** Gradients, shadows, highlights, leaves for 3D appearance
7. **Tier-Based Effects:** Different effects scale with fruit size (screen shake, callouts, confetti)
8. **Strategic Positioning:** Preview system lets you plan drops
9. **Merge Velocity Inheritance:** New fruits inherit momentum from merged fruits
10. **Cooldown System:** Prevents drop spam, encourages strategic placement

---

## **SUMMARY FOR LLM ADVISOR**

The **Citrus Drop** game is a functional Suika-style physics merge puzzle with moderate polish. It needs:

1. **Enhanced sound design** - More variation, contextual sounds, ambient audio, different sounds for merge tiers
2. **More visual juice** - Particles on merge, freeze frames, impact flashes, merge animations, fruit trails
3. **Haptic refinements** - More variation, bounce feedback, danger line warnings, combo escalation
4. **Better physics feel** - More bouncy/satisfying impacts, dramatic merge timing
5. **Enhanced celebrations** - More dramatic effects at higher tiers, spectacular melon explosion
6. **Anticipation improvements** - Danger line warnings, countdown indicators, visual highlights
7. **Polish** - Better score display, more fruit detail, particle effects, wall textures

**Current State:** ✅ Solid foundation, Matter.js physics working well, beautiful fruit rendering, good merge system. Needs more dramatic effects to match the intensity of your most polished games.

**Key Differentiators:**
- Realistic physics simulation (Matter.js)
- 7-tier fruit progression
- Danger line system (strategic gameplay)
- Beautiful fruit rendering (gradients, shadows, leaves)
- Tier-based effects (escalating celebrations)
- Combo system with visual display
- Max level explosion (melon + melon)

**Biggest Gaps:**
- No particle effects on merges
- No merge animation (instant replacement)
- No danger line warnings (unexpected game over)
- Sound design needs variation
- No fruit bounce/roll sounds
- Limited haptic feedback (only on tier 2+)
- Could use more dramatic effects overall

---

**This document contains everything needed to understand the Citrus Drop game.** Use it to provide research and advice on improvements and juicing up the game.
