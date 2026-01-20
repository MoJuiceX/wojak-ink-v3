# 2048 Merge Game - Juice Implementation Prompts

> Phase-specific prompts for Claude CLI to implement juice enhancements.

**Main Guide:** `docs/2048-MERGE-JUICE-IMPLEMENTATION.md`
**Checklist:** `docs/2048-MERGE-JUICE-CHECKLIST.md`
**Game File:** `src/games/Merge2048/Merge2048Game.tsx`
**CSS File:** `src/games/Merge2048/Merge2048Game.css`

---

## Priority Order for Maximum Impact

1. **Phase 1-2** (Sound + Haptics) — Foundation, do first
2. **Phase 5** (Danger State) — Creates tension
3. **Phase 6** (Fever Mode) — Addictive loop
4. **Phase 3** (Tile Personality) — Emotional attachment
5. **Phase 4** (Visual Juice) — Premium polish
6. **Phase 10** (Share System) — Viral growth
7. **Phase 8** (Combo Visualization) — Feedback
8. **Phase 7** (Next Preview) — Strategy depth
9. **Phase 11** (Dynamic Music) — Atmosphere
10. **Phase 9** (Extra Features) — Quality of life

---

## Phase 1: Sound Foundation

```
Implement Phase 1 (Sound Foundation) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 1 section)
File: src/games/Merge2048/Merge2048Game.tsx

Tasks 1-18:
1. Create MERGE_SOUND_CONFIG with pitch/volume/layers for each tile value (4, 8, 16... 2048)
2. Create playMergeSound() that plays base pop + optional sparkle layer (128+) + bass hit (512+)
3. Add playSpawnSound() for new tile appearances (soft pop)
4. Add playSlideSound() for tile movement (subtle whoosh)
5. Create signature chime (A5→E6 ascending) using Web Audio API for milestones
6. Define MILESTONE_VALUES = [128, 256, 512, 1024, 2048] and tracking ref
7. Trigger signature sound on FIRST time reaching each milestone only
8. Replace playPerfectBonus() calls with playMergeSound(resultValue)
9. Replace playCombo() calls with the layered system based on merge value
10. Call playSpawnSound() when spawning new tiles
11. Call playSlideSound() at start of valid moves
12. Create sound variation array for merge sounds
13. Add playInvalidMove() for when grid doesn't change
14. Add danger state heartbeat loop (startDangerSound/stopDangerSound)
15. Reset milestone tracking in handleNewGame()

Key insight: Each tile value should have progressively higher pitch. 2→4 is low, 512→1024 is high.

Update the checklist after completing each task.
```

---

## Phase 2: Premium Haptics

```
Implement Phase 2 (Premium Haptics) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 2 section)
File: src/games/Merge2048/Merge2048Game.tsx

Tasks 19-30:
1. Create HAPTIC_CONFIG with intensity/duration/pattern per tile value
   - Small merges (4-64): single pulse 12-22ms
   - Medium merges (128-256): double pulse
   - Large merges (512-1024): triple/quad pulse
   - 2048: celebration pattern
2. Create triggerMergeHaptic(resultValue) using navigator.vibrate()
3. Add triggerSwipeHaptic() - ultra-light tick (5ms) at touch start
4. Add triggerSlideHaptic() - light (8ms) when tiles actually move
5. Add triggerErrorHaptic() - double pulse [10, 50, 10] for invalid moves
6. Add triggerWinHaptic() - rising intensity celebration
7. Add triggerGameOverHaptic() - heavy descending pattern
8. Add triggerDangerPulse() - subtle recurring pulse during danger state
9. Replace all existing triggerHaptic() calls with specific functions

Key insight: Haptic intensity should scale logarithmically with tile value.

Update the checklist after completing each task.
```

---

## Phase 3: Tile Personality System

```
Implement Phase 3 (Tile Personality) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 3 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 31-45:
1. Create TILE_FACES config with eyes, mouth, expression for each value
   - 2: sleepy face (• •, ‿)
   - 4-64: progressively more awake/excited
   - 128+: add extras like ✨, 🔥, 👑
   - 2048: ultimate happy face with crown
2. Create TileFaceRenderer component with isNearMatch and isDanger props
3. Add CSS for faces: .tile-face, .tile-eyes, .tile-mouth, expression animations
4. Create checkNearMatch(tiles, targetTile) function
5. Create nearMatchMap state updated when tiles change
6. Track isDangerState (emptyCells <= 3)
7. Update renderTile to include TileFaceRenderer
8. Add "hello" animation for new tiles
9. Add "celebration" animation for merged tiles
10. Create TILE_BIOS with name and description for each tile
11. Track unlocked bios in localStorage
12. Create character gallery modal (optional, lower priority)
13. Add showFaces toggle setting

Key insight: Tiles should look "worried" when board is almost full, "excited" when near a match.

Update the checklist after completing each task.
```

---

## Phase 4: Visual Juice Effects

```
Implement Phase 4 (Visual Juice) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 4 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 46-65:
1. Add freeze frame system: triggerFreezeFrame(duration) pauses for 50-60ms on big merges
2. Create particle burst system with Particle interface and createParticleBurst()
3. Add particle animation loop with gravity
4. Create ParticleLayer renderer
5. Trigger particles at merge locations with tile color
6. Add squash/stretch CSS - tiles compress on impact, stretch when moving
7. Track lastMoveDirection state
8. Apply movement direction class to tiles for directional stretch
9. Add tile slide trails with ::before pseudo-element
10. Add camera zoom pulse: triggerCameraZoom(1.05) on 256+, 1.08 on 512+
11. Apply smooth zoom transition to grid wrapper
12. Add impact flash effect at merge point (white expanding circle)
13. Enhance score popup animation (bouncy, floats up)

Key insight: "Juice It or Lose It" - every action should have cascading visual response.

Update the checklist after completing each task.
```

---

## Phase 5: Danger State System

```
Implement Phase 5 (Danger State) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 5 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 66-78:
1. Define DANGER_THRESHOLDS: warning=4, critical=2, imminent=1 empty cells
2. Create dangerLevel state: 'safe' | 'warning' | 'critical' | 'imminent'
3. Add useEffect to update dangerLevel based on empty cells
4. Add CSS for danger states:
   - warning: orange inner glow, slow pulse
   - critical: deeper orange, faster pulse
   - imminent: red glow, rapid pulse
5. Add vignette effect (darkened edges) for critical/imminent
6. Highlight empty cells with golden glow in danger state
7. Start/stop heartbeat sound based on danger level
8. Increase heartbeat tempo with danger level (1x → 1.3x → 1.6x)
9. Add periodic danger haptic pulses (every 2s warning, 1s critical, 0.5s imminent)
10. Add dangerLevel class to grid wrapper
11. Clean up danger state on new game

Key insight: Like Tetris, create "sheer panic" through escalating audio/visual pressure.

Update the checklist after completing each task.
```

---

## Phase 6: Fever Mode

```
Implement Phase 6 (Fever Mode) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 6 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 79-92:
1. Create FeverState interface: active, multiplier, intensity, startTime
2. Create FEVER_CONFIG: activationThreshold=5, scoreMultiplier=2, cooldownAfterNoMerge=2000
3. Track consecutive merges with ref, reset if >2s between merges
4. Create activateFeverMode() - sets state, plays sound, shows callout "FEVER MODE!"
5. Create deactivateFeverMode() - resets state, plays sound
6. Trigger fever when consecutiveMerges >= 5
7. Apply 2x score multiplier during fever
8. Add fever visual CSS:
   - Orange/fire gradient background
   - Glowing pulsing box-shadow
   - Golden border on tiles
9. Create FeverMeter UI component showing progress or "2x" when active
10. Add fever activation/deactivation sounds
11. Start fever music layer (driving bass loop)
12. Add fire particles rising from bottom during fever
13. Reset fever state on new game

Key insight: Fever mode creates the "just one more game" addiction loop.

Update the checklist after completing each task.
```

---

## Phase 7: Next Tile Preview

```
Implement Phase 7 (Next Tile Preview) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 7 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 93-100:
1. Create nextTileQueue state: number[] (queue of next 2 tiles)
2. Create generateNextTile(): 90% chance of 2, 10% chance of 4
3. Initialize queue in handleNewGame() with 2 tiles
4. Modify spawnTile to use queue[0] instead of random, then shift queue and add new
5. Create NextTilePreview component showing next 1-2 tiles
6. Style preview: small tiles with faces, second tile at 50% opacity
7. Place preview in header area near scores
8. Add previewPop animation when queue changes
9. Add showPreview toggle setting

Key insight: Like Threes!, preview adds strategy depth and reduces randomness frustration.

Update the checklist after completing each task.
```

---

## Phase 8: Combo Visualization

```
Implement Phase 8 (Combo Visualization) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 8 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 101-110:
1. Create ComboState: count, lastMergeTime, isActive
2. Define COMBO_TIMEOUT = 1500ms
3. Create incrementCombo() - continues combo if within timeout, else resets to 1
4. Add useEffect to check timeout and reset combo with break feedback
5. Create ComboDisplay component: shows "3x COMBO!" with escalating size/color
   - 3-4: orange
   - 5-6: gold
   - 7-9: orange-red
   - 10+: magenta with pulse
6. Create ComboTimeoutBar component showing time remaining
7. Escalate sound pitch with combo (use semitones: C4, D4, E4...)
8. Add combo break sound for lost combos of 3+

Key insight: Combo visualization makes chains feel rewarding even without gameplay multiplier.

Update the checklist after completing each task.
```

---

## Phase 9: Extra Features

```
Implement Phase 9 (Extra Features) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 9 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 111-125:
1. Create undo system:
   - UndoState: tiles, score, available
   - Save state BEFORE each move (only if undo not used)
   - handleUndo() restores state, marks undoUsed=true
   - One undo per game only
2. Add undo button with disabled state when used
3. Reset undo state on new game
4. Create AnimatedScore component that counts up smoothly (ease toward target)
5. Replace static score with AnimatedScore
6. Add milestone confetti for 128, 256, 512, 1024, 2048
7. Create move preview system (optional, lower priority):
   - On touch-hold (300ms), show ghost tiles of result
   - Release to cancel preview and execute move
8. Create settings panel with toggles: faces, preview, haptics

Update the checklist after completing each task.
```

---

## Phase 10: Viral Share System

```
Implement Phase 10 (Viral Share System) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 10 section)
Files:
- src/games/Merge2048/Merge2048Game.tsx
- src/games/Merge2048/Merge2048Game.css

Tasks 126-138:
1. Create generateShareImage() using Canvas API:
   - 600x400 canvas
   - Dark gradient background
   - "2048 Citrus Edition" title in orange
   - Large score number
   - Highest tile with color
   - "Play at wojak.ink" footer
   - Return dataURL
2. Create ShareModal component with:
   - Generated image preview
   - Share, Copy Link, Save Image buttons
3. Implement handleNativeShare() using Web Share API
4. Create challenge link system:
   - encodeScore(score) → base64 string
   - decodeChallenge(encoded) → { score, timestamp }
5. Check for challenge param on page load
6. Show challenge target display when active
7. Celebrate when score beats challenge
8. Create generateTextShare() for clipboard (Wordle style)
9. Add share button to game over screen
10. Track shares for analytics

Key insight: Wordle's success came from shareable, spoiler-free results format.

Update the checklist after completing each task.
```

---

## Phase 11: Dynamic Music System

```
Implement Phase 11 (Dynamic Music System) for the 2048 Merge game.

Read: docs/2048-MERGE-JUICE-IMPLEMENTATION.md (Phase 11 section)
File: src/games/Merge2048/Merge2048Game.tsx

Tasks 139-145:
1. Create MusicState: baseVolume, intensityVolume, urgencyVolume, isPlaying
2. Create refs for three Howl instances: base, intensity, urgency layers
3. Create initMusicLayers() to set up all three
4. Create startMusic() to play all layers synchronized, fade in base
5. Add useEffect to fade intensity layer based on combo count (3+, 5+ = louder)
6. Add useEffect to fade urgency layer based on danger level
7. Add toggleMusic() function and button
8. Clean up music on unmount

Key insight: Vertical layering maintains musical cohesion while responding to game state.

Note: This phase requires music audio files. If not available, can use Web Audio API to generate simple tones or skip this phase.

Update the checklist after completing each task.
```

---

## Complete Implementation Prompt

```
Implement all juice enhancements for the 2048 Merge game.

Read these files first:
1. docs/2048-MERGE-JUICE-IMPLEMENTATION.md — Full guide (145 tasks)
2. docs/2048-MERGE-JUICE-CHECKLIST.md — Progress tracking
3. This file for phase-specific context

Game file: src/games/Merge2048/Merge2048Game.tsx
CSS file: src/games/Merge2048/Merge2048Game.css

Work through phases in priority order:
1. Phase 1-2 (Sound + Haptics) — Foundation
2. Phase 5 (Danger State) — Tension
3. Phase 6 (Fever Mode) — Addiction
4. Phase 3 (Tile Personality) — Emotion
5. Phase 4 (Visual Juice) — Polish
6. Phase 10 (Share System) — Viral
7. Phase 8 (Combo Viz) — Feedback
8. Phase 7 (Next Preview) — Strategy
9. Phase 11 (Music) — Atmosphere
10. Phase 9 (Extras) — QoL

Complete all tasks in each phase before moving to next.
Update the checklist after each task.
Test on mobile after each phase (haptics don't work on desktop).
```

---

## Sound Files Needed

If sound files are missing, these can be:
1. Generated with Web Audio API (see signature chime example in implementation guide)
2. Downloaded from free sound libraries
3. Synthesized with tools like jsfxr

Required sounds:
- merge_pop (with variations)
- sparkle
- bass_hit
- soft_pop (spawn)
- whoosh (slide)
- soft_thud (invalid)
- heartbeat_loop
- fever_activate
- fever_deactivate
- fever_loop
- combo_break
- undo/rewind
- score_tick
- music layers (base, intensity, urgency)

---

*Prompts for 2048 Merge Game Juice Implementation*
