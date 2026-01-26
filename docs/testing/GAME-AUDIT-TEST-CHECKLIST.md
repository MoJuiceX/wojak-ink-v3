# Game Audit Test Checklist

## CRITICAL: Game Lifecycle Bug (Fixed 2026-01-26)

**Bug**: Games were auto-starting (timers running) when the game modal opened, before the user clicked PLAY.

**Affected Games** (now fixed):
- MemoryMatch
- BrickByBrick  
- BlockPuzzle

**Test Procedure** (verify fix):
1. Navigate to /games
2. Click on a game (e.g., Memory Match)
3. Observe the console for `[GameName] Start check: { gameStarted: false, gameState: idle }`
4. Verify timer is NOT counting down while PLAY button is visible
5. Click PLAY
6. Observe `[GameName] Starting game - user clicked PLAY` in console
7. Verify timer NOW starts counting

**Console Debugging**: All 6 games now log lifecycle events:
- `[GameName] Lifecycle: { gameStarted, gameState }` - Every render
- `[GameName] Start check: { ... }` - When start conditions are checked

---

> **Created:** January 26, 2026  
> **Purpose:** Comprehensive testing checklist for all audited games  
> **Test URL:** https://wojak.ink or http://localhost:5178

---

## Quick Reference - Games to Test

| Game | URL Path | Tier | Reward |
|------|----------|------|--------|
| Color Reaction | `/games/color-reaction` | Easy | 5🍊 |
| Memory Match | `/games/memory-match` | Easy | 5🍊 |
| Brick by Brick | `/games/brick-by-brick` | Medium | 10🍊 |
| Flappy Orange | `/games/flappy-orange` | Hard | 15🍊 |
| Wojak Runner | `/games/wojak-runner` | Hard | 15🍊 |
| Block Puzzle | `/games/block-puzzle` | Medium | 10🍊 |

---

## 1. Color Reaction

### 1.1 Critical Bug Fixes
- [ ] **Urgency System Colors** - Watch the countdown ring during a match window:
  - [ ] Green when >50% time remaining
  - [ ] Yellow/warning when 25-50% remaining
  - [ ] Red/critical when <25% remaining
- [ ] **Stale Screenshot on Replay** - Play to game over, note the final state, replay, play to game over again:
  - [ ] Screenshot shows the NEW game's final state, not the previous game
- [ ] **Stale Personal Best Flag** - Beat your high score, replay, lose with lower score:
  - [ ] "New Personal Best" should NOT show on the second game over

### 1.2 State Reset on Replay
- [ ] Quick restart (spam replay button 3-4 times rapidly) - no glitched states
- [ ] Lives reset to 3
- [ ] Score resets to 0
- [ ] Streak resets to 0
- [ ] Combo/fever mode deactivated
- [ ] Tutorial "TAP TO START" instruction shows again (first 15 seconds)

### 1.3 Gameplay Mechanics
- [ ] Tap on FULL match (fruit + color match) awards points
- [ ] Tap on NO match loses a life
- [ ] Tap on PARTIAL match (first time) shows warning only
- [ ] Tap on PARTIAL match (second time) loses a life
- [ ] Miss a match window shows "TOO LATE" and loses a life
- [ ] Streak fire effect appears at 5+ streak
- [ ] Fever mode activates at 15+ streak

### 1.4 Audio & Haptics
- [ ] Correct tap sound plays
- [ ] Wrong tap sound plays
- [ ] Miss sound plays
- [ ] Game over sound plays
- [ ] Music plays and loops
- [ ] Mute button (arcade frame) mutes all audio
- [ ] Haptic feedback on taps (mobile)

### 1.5 Visual Effects
- [ ] Screen shake on wrong tap
- [ ] Floating score popups appear
- [ ] Reaction time popup shows milliseconds
- [ ] Rating display (PERFECT, GREAT, GOOD, OK)
- [ ] Player circle flash on correct/wrong tap

### 1.6 Leaderboard Integration
- [ ] Score submits on game over (if signed in)
- [ ] Leaderboard shows in game over screen
- [ ] Minimum 3 correct taps required for submission

### 1.7 Accessibility
- [ ] Game respects system "reduce motion" preference
- [ ] Toggle reduce motion mid-game and verify behavior changes

---

## 2. Memory Match

### 2.1 Core Gameplay
- [ ] Cards flip on tap
- [ ] Matched pairs stay face up
- [ ] Non-matched pairs flip back after delay
- [ ] Game completes when all pairs found
- [ ] Move counter increments correctly
- [ ] Timer counts up during gameplay

### 2.2 NFT Integration
- [ ] NFT filter dropdown works
- [ ] Filtered cards show correct Wojak attributes
- [ ] "Random" filter shows mixed cards

### 2.3 State Reset on Replay
- [ ] All cards reset to face down
- [ ] Move counter resets to 0
- [ ] Timer resets to 0
- [ ] Quick restart - no glitched card states

### 2.4 Visual Effects
- [ ] Card flip animation smooth
- [ ] Match celebration effect
- [ ] Combo streak visuals
- [ ] Screen shake on mismatch (if enabled)

### 2.5 Audio & Haptics
- [ ] Card flip sound
- [ ] Match sound
- [ ] Mismatch sound
- [ ] Game complete sound
- [ ] Haptic feedback on flips (mobile)

### 2.6 Leaderboard
- [ ] Score based on moves and time
- [ ] Submits on game completion
- [ ] Leaderboard displays correctly

### 2.7 Performance
- [ ] No lag when flipping cards
- [ ] Smooth animations on mobile
- [ ] No memory leaks on multiple replays

---

## 3. Brick by Brick

### 3.1 Core Gameplay
- [ ] Blocks can be dragged from tray
- [ ] Blocks snap to valid grid positions
- [ ] Invalid placements rejected (visual feedback)
- [ ] Lines clear when complete (horizontal)
- [ ] Lines clear when complete (vertical)
- [ ] Score increments on line clear
- [ ] Game over when no valid moves remain

### 3.2 State Reset on Replay
- [ ] Grid clears completely
- [ ] Score resets to 0
- [ ] New blocks generated in tray
- [ ] Quick restart - no phantom blocks

### 3.3 Touch/Drag Mechanics
- [ ] Touch drag works on mobile
- [ ] Mouse drag works on desktop
- [ ] Block preview shows during drag
- [ ] Block returns to tray if dropped invalid

### 3.4 Visual Effects
- [ ] Line clear animation
- [ ] Block placement animation
- [ ] Combo multiplier display
- [ ] Grid pulse on clear

### 3.5 Audio & Haptics
- [ ] Block pickup sound
- [ ] Block place sound
- [ ] Line clear sound
- [ ] Game over sound
- [ ] Haptic on placement (mobile)

### 3.6 Leaderboard
- [ ] Score submits on game over
- [ ] Leaderboard displays in game over screen

---

## 4. Flappy Orange

### 4.1 Core Gameplay
- [ ] Tap/click makes orange jump
- [ ] Gravity pulls orange down
- [ ] Collision with pipes ends game
- [ ] Collision with ground ends game
- [ ] Score increments when passing pipes
- [ ] Pipes generate at random heights

### 4.2 State Reset on Replay
- [ ] Orange resets to start position
- [ ] Score resets to 0
- [ ] Pipes clear and regenerate
- [ ] Quick restart - no physics glitches

### 4.3 Difficulty Progression
- [ ] Pipe gap decreases over time (or stays constant)
- [ ] Pipe speed may increase

### 4.4 Visual Effects
- [ ] Orange rotation based on velocity
- [ ] Background parallax scrolling
- [ ] Death animation/effect
- [ ] Score popup on pipe pass

### 4.5 Audio & Haptics
- [ ] Flap sound on tap
- [ ] Score sound on pipe pass
- [ ] Collision/death sound
- [ ] Background music (if any)
- [ ] Haptic on flap (mobile)

### 4.6 Leaderboard
- [ ] Score submits on game over
- [ ] High score saved locally
- [ ] Leaderboard displays correctly

### 4.7 Performance
- [ ] Consistent 60 FPS on mobile
- [ ] No input lag on tap
- [ ] Smooth pipe scrolling

---

## 5. Wojak Runner

### 5.1 Critical Bug Fixes
- [ ] **No Auto-Start** - Game should NOT start until player taps/clicks
- [ ] **Stale Screenshot on Replay** - Screenshot shows current game, not previous
- [ ] **Stale Personal Best** - Flag resets correctly between games

### 5.2 Core Gameplay
- [ ] Tap/click to jump
- [ ] Double tap for double jump (if enabled)
- [ ] Collision with obstacles ends game
- [ ] Score increments over time/distance
- [ ] Obstacles spawn at intervals

### 5.3 State Reset on Replay
- [ ] Player resets to start position
- [ ] Score resets to 0
- [ ] Obstacles clear
- [ ] Speed resets to initial
- [ ] Quick restart - no animation glitches

### 5.4 Difficulty Progression
- [ ] Speed increases over time
- [ ] Obstacle frequency may increase

### 5.5 Visual Effects
- [ ] Running animation
- [ ] Jump animation
- [ ] Death animation
- [ ] Background parallax
- [ ] Distance/score display

### 5.6 Audio & Haptics
- [ ] Jump sound
- [ ] Collision sound
- [ ] Background music
- [ ] Milestone sounds (if any)
- [ ] Haptic on jump (mobile)

### 5.7 Leaderboard
- [ ] Score submits on game over
- [ ] Minimum actions required for submission
- [ ] Leaderboard displays correctly

---

## 6. Block Puzzle

### 6.1 Core Gameplay
- [ ] Blocks can be dragged to grid
- [ ] Valid placements accepted
- [ ] Invalid placements rejected
- [ ] Rows clear when complete
- [ ] Columns clear when complete
- [ ] Score increments on clear
- [ ] Game over when no moves possible

### 6.2 State Reset on Replay
- [ ] Grid clears
- [ ] Score resets
- [ ] New blocks in queue
- [ ] Quick restart stability

### 6.3 Touch Mechanics
- [ ] Drag and drop on mobile
- [ ] Drag and drop on desktop
- [ ] Block preview during drag
- [ ] Cancel drag (drop outside grid)

### 6.4 Visual Effects
- [ ] Row/column clear animation
- [ ] Block placement feedback
- [ ] Combo indicators
- [ ] Grid highlighting

### 6.5 Audio & Haptics
- [ ] Pickup sound
- [ ] Place sound
- [ ] Clear sound
- [ ] Game over sound
- [ ] Haptics on mobile

### 6.6 Leaderboard
- [ ] Score submission works
- [ ] Leaderboard UI displays

---

## Cross-Game Tests (Apply to ALL)

### Arcade Frame Integration
- [ ] Game loads within arcade frame
- [ ] Arcade "PLAY" button starts game
- [ ] Mute button mutes game audio
- [ ] Back button returns to Games Hub
- [ ] Leaderboard button works
- [ ] Game fills arcade frame (no max-width issues)

### Mobile-Specific
- [ ] Touch controls responsive
- [ ] No accidental scrolling during gameplay
- [ ] Fullscreen mode works (hides nav)
- [ ] Portrait orientation supported
- [ ] Landscape orientation (if supported)
- [ ] Safe area insets respected (notch, home indicator)

### Desktop-Specific
- [ ] Mouse/keyboard controls work
- [ ] Hover states visible
- [ ] Window resize doesn't break layout

### Performance
- [ ] 60 FPS during gameplay
- [ ] No memory leaks on multiple replays
- [ ] Fast load time (<2s)
- [ ] No jank during animations

### Signed In vs Signed Out
- [ ] Game playable when signed out
- [ ] Score submission only when signed in
- [ ] Proper messaging for sign-in prompt

### Network Conditions
- [ ] Game works offline (cached assets)
- [ ] Graceful handling of leaderboard API failure
- [ ] No crash on slow network

---

## Testing Environments

### Browsers to Test
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Chrome (mobile Android)
- [ ] Safari (mobile iOS)

### Devices to Test
- [ ] Desktop (1920x1080+)
- [ ] Tablet (iPad)
- [ ] Phone (iPhone 14/15)
- [ ] Phone (Android flagship)
- [ ] Phone (smaller screen - iPhone SE)

---

## Test Execution Log

| Date | Tester | Game | Platform | Status | Notes |
|------|--------|------|----------|--------|-------|
| | | | | | |

---

## Known Issues / Skip List

*Document any known issues that should be skipped during testing:*

1. (none yet)

---

## Post-Test Actions

After completing all tests:

1. [ ] Document any bugs found in GitHub Issues
2. [ ] Update this checklist with new edge cases discovered
3. [ ] Mark audit as complete in project tracker
