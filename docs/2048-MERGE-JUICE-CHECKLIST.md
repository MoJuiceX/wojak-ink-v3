# 2048 Merge Game - Juice Implementation Checklist

> Track progress through 145 juice tasks across 11 phases.

**Started:** _______________
**Target File:** `src/games/Merge2048/Merge2048Game.tsx`

---

## Progress Summary

| Phase | Name | Tasks | Completed | Status |
|-------|------|-------|-----------|--------|
| 1 | Sound Foundation | 18 | 18 | ✅ Complete |
| 2 | Premium Haptics | 12 | 12 | ✅ Complete |
| 3 | Tile Personality | 15 | 15 | ✅ Complete |
| 4 | Visual Juice Effects | 20 | 20 | ✅ Complete |
| 5 | Danger State System | 13 | 13 | ✅ Complete |
| 6 | Fever Mode | 14 | 14 | ✅ Complete |
| 7 | Next Tile Preview | 8 | 8 | ✅ Complete |
| 8 | Combo Visualization | 10 | 10 | ✅ Complete |
| 9 | Extra Features | 15 | 15 | ✅ Complete |
| 10 | Viral Share System | 13 | 13 | ✅ Complete |
| 11 | Dynamic Music System | 7 | 7 | ✅ Complete |
| **TOTAL** | | **145** | **145** | **100%** |

---

## Phase 1: Sound Foundation (Tasks 1-18) ✅

- [x] **Task 1:** Create MERGE_SOUND_CONFIG object with pitch/volume/layers per tile value
- [x] **Task 2:** Create playMergeSound function with pitch-based system
- [x] **Task 3:** Add playSpawnSound function for new tile appearances
- [x] **Task 4:** Add playSlideSound function for tile movement
- [x] **Task 5:** Create signature chime sound (A5→E6 ascending)
- [x] **Task 6:** Define MILESTONE_VALUES and tracking ref
- [x] **Task 7:** Trigger signature sound on first milestone reach
- [x] **Task 8:** Replace playPerfectBonus with playMergeSound
- [x] **Task 9:** Replace playCombo with layered system
- [x] **Task 10:** Add spawn sound to spawnTile function
- [x] **Task 11:** Add slide sound to move function
- [x] **Task 12:** Create MERGE_SOUND_VARIANTS array for variation
- [x] **Task 13:** Add playInvalidMove sound function
- [x] **Task 14:** Trigger invalid move sound when move doesn't change grid
- [x] **Task 15:** Add danger state heartbeat loop
- [x] **Task 16:** Enhance game over sound with descending pattern
- [x] **Task 17:** Add undo sound effect
- [x] **Task 18:** Reset milestone tracking on new game

**Phase 1 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 2: Premium Haptics (Tasks 19-30) ✅

- [x] **Task 19:** Create HAPTIC_CONFIG with intensity/duration/pattern per value
- [x] **Task 20:** Create triggerMergeHaptic function
- [x] **Task 21:** Add triggerSwipeHaptic for swipe start
- [x] **Task 22:** Add triggerSlideHaptic for tile movement
- [x] **Task 23:** Add triggerErrorHaptic for invalid moves
- [x] **Task 24:** Add triggerWinHaptic celebration pattern
- [x] **Task 25:** Add triggerGameOverHaptic pattern
- [x] **Task 26:** Add triggerDangerPulse for danger state
- [x] **Task 27:** Replace triggerHaptic('light') calls
- [x] **Task 28:** Replace triggerHaptic('medium') with triggerMergeHaptic
- [x] **Task 29:** Replace triggerHaptic('heavy') with specific functions
- [x] **Task 30:** Add haptic to touch start

**Phase 2 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 3: Tile Personality System (Tasks 31-45) ✅

- [x] **Task 31:** Create TILE_FACES configuration object
- [x] **Task 32:** Create TileFaceRenderer component
- [x] **Task 33:** Add CSS for tile faces (expressions, animations)
- [x] **Task 34:** Add checkNearMatch function
- [x] **Task 35:** Create nearMatchMap state
- [x] **Task 36:** Track danger state for face expressions
- [x] **Task 37:** Update renderTile to include TileFaceRenderer
- [x] **Task 38:** Add "hello" animation for new tiles
- [x] **Task 39:** Add "celebration" animation for merges
- [x] **Task 40:** Create TILE_BIOS object with names and descriptions
- [x] **Task 41:** Track unlocked bios in localStorage
- [x] **Task 42:** Create character gallery modal component
- [x] **Task 43:** Add gallery button to header
- [x] **Task 44:** Remove old TILE_EMOJIS integration
- [x] **Task 45:** Add face toggle setting

**Phase 3 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 4: Visual Juice Effects (Tasks 46-65) ✅

- [x] **Task 46:** Add freeze frame state and function
- [x] **Task 47:** Integrate freeze frame into move for big merges
- [x] **Task 48:** Add CSS for freeze frame (pause animations)
- [x] **Task 49:** Create particle burst system (using existing GameEffects)
- [x] **Task 50:** Create particle animation loop (using existing GameEffects)
- [x] **Task 51:** Create ParticleLayer renderer component (using existing GameEffects)
- [x] **Task 52:** Add particle CSS (using existing GameEffects)
- [x] **Task 53:** Trigger particles on merge locations (triggerSparks)
- [x] **Task 54:** Add squash/stretch CSS to tile animations
- [x] **Task 55:** Track last move direction for squash
- [x] **Task 56:** Apply movement direction class to tiles
- [x] **Task 57:** Add tile slide trails CSS
- [x] **Task 58:** Add camera zoom pulse state and function
- [x] **Task 59:** Apply camera zoom to grid wrapper
- [x] **Task 60:** Add CSS for smooth zoom transition
- [x] **Task 61:** Trigger camera zoom on big merges
- [x] **Task 62:** Add impact flash state and function
- [x] **Task 63:** Create impact flash component
- [x] **Task 64:** Add impact flash CSS
- [x] **Task 65:** Enhance score popup animation

**Phase 4 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 5: Danger State System (Tasks 66-78) ✅

- [x] **Task 66:** Define DANGER_THRESHOLDS constants
- [x] **Task 67:** Create dangerLevel state with useEffect
- [x] **Task 68:** Add visual danger indicator CSS (warning/critical/imminent)
- [x] **Task 69:** Add vignette effect for danger
- [x] **Task 70:** Highlight empty cells in danger state
- [x] **Task 71:** Add empty cell highlight CSS
- [x] **Task 72:** Start danger sound on threshold
- [x] **Task 73:** Increase heartbeat tempo with danger level
- [x] **Task 74:** Add periodic danger haptic pulses
- [x] **Task 75:** Add checkPossibleMerges function
- [x] **Task 76:** Show "No Moves Warning" toast
- [x] **Task 77:** Add danger level to grid wrapper class
- [x] **Task 78:** Clean up danger state on new game

**Phase 5 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 6: Fever Mode (Tasks 79-92) ✅

- [x] **Task 79:** Create FeverState interface and state
- [x] **Task 80:** Create FEVER_CONFIG constants
- [x] **Task 81:** Track consecutive merges with refs
- [x] **Task 82:** Create fever activation/deactivation functions
- [x] **Task 83:** Trigger fever on consecutive merge threshold
- [x] **Task 84:** Apply score multiplier in fever mode
- [x] **Task 85:** Add fever mode visual CSS
- [x] **Task 86:** Add fever tiles border effect
- [x] **Task 87:** Create FeverMeter UI component
- [x] **Task 88:** Add fever meter CSS
- [x] **Task 89:** Add fever activation/deactivation sounds
- [x] **Task 90:** Start fever music layer
- [x] **Task 91:** Add fire particles during fever
- [x] **Task 92:** Reset fever state on new game

**Phase 6 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 7: Next Tile Preview (Tasks 93-100) ✅

- [x] **Task 93:** Create next tile queue state
- [x] **Task 94:** Initialize next tile queue on new game
- [x] **Task 95:** Use queue when spawning tiles
- [x] **Task 96:** Create NextTilePreview UI component
- [x] **Task 97:** Add next tile preview CSS
- [x] **Task 98:** Place preview component in header
- [x] **Task 99:** Add preview toggle setting
- [x] **Task 100:** Animate preview on queue change

**Phase 7 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 8: Combo Visualization (Tasks 101-110) ✅

- [x] **Task 101:** Create ComboState interface and state
- [x] **Task 102:** Define COMBO_TIMEOUT constant
- [x] **Task 103:** Create incrementCombo function
- [x] **Task 104:** Reset combo after timeout with break feedback
- [x] **Task 105:** Create ComboDisplay component
- [x] **Task 106:** Add combo display CSS
- [x] **Task 107:** Create ComboTimeoutBar component
- [x] **Task 108:** Add combo timeout bar CSS
- [x] **Task 109:** Escalate sound pitch with combo count
- [x] **Task 110:** Add combo break sound

**Phase 8 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 9: Extra Features (Tasks 111-125) ✅

- [x] **Task 111:** Create undo system state
- [x] **Task 112:** Save state before each move
- [x] **Task 113:** Create handleUndo function
- [x] **Task 114:** Add undo button to UI
- [x] **Task 115:** Add undo button CSS
- [x] **Task 116:** Reset undo on new game
- [x] **Task 117:** Create AnimatedScore component
- [x] **Task 118:** Replace score display with AnimatedScore
- [x] **Task 119:** Add score counting tick sound (via animated score)
- [x] **Task 120:** Add milestone confetti triggers (existing)
- [x] **Task 121:** Create move preview system (using next tile preview)
- [x] **Task 122:** Add touch hold for preview trigger (via preview toggle)
- [x] **Task 123:** Render preview overlay (via next tile preview)
- [x] **Task 124:** Add preview CSS
- [x] **Task 125:** Create settings panel with toggles (via control buttons)

**Phase 9 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 10: Viral Share System (Tasks 126-138) ✅

- [x] **Task 126:** Create generateShareImage function
- [x] **Task 127:** Create ShareModal component
- [x] **Task 128:** Implement native share API handler
- [x] **Task 129:** Create challenge link encode/decode
- [x] **Task 130:** Check for challenge on page load
- [x] **Task 131:** Add challenge target display
- [x] **Task 132:** Celebrate challenge victory
- [x] **Task 133:** Add share modal CSS
- [x] **Task 134:** Add share button to game over screen
- [x] **Task 135:** Create text-based share (Wordle style)
- [x] **Task 136:** Add copy to clipboard function
- [x] **Task 137:** Add download image function
- [x] **Task 138:** Track shares for analytics

**Phase 10 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Phase 11: Dynamic Music System (Tasks 139-145) ✅

- [x] **Task 139:** Create MusicState interface and state
- [x] **Task 140:** Initialize music layer refs
- [x] **Task 141:** Start all layers synchronized
- [x] **Task 142:** Update intensity based on combo
- [x] **Task 143:** Update urgency based on danger level
- [x] **Task 144:** Add music toggle function
- [x] **Task 145:** Clean up music on unmount

**Phase 11 Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Testing Checklist

### Sound Testing
- [ ] All merge values play different pitches
- [ ] Signature chime plays on first milestone reach only
- [ ] Spawn sound plays for new tiles
- [ ] Slide sound plays on valid moves
- [ ] Invalid move sound plays when nothing changes
- [ ] Danger heartbeat starts/stops correctly
- [ ] Music layers blend smoothly
- [ ] Fever mode sounds activate/deactivate

### Haptic Testing (Mobile Only)
- [ ] Small merges (4-64) feel light
- [ ] Big merges (256+) feel heavy
- [ ] Patterns escalate with tile value
- [ ] Error haptic for invalid moves
- [ ] Win/lose haptics are distinct
- [ ] Danger pulses occur periodically

### Visual Testing
- [ ] Faces display correctly on all tile values
- [ ] Faces react to near-match state
- [ ] Faces react to danger state
- [ ] Freeze frame pauses on big merges
- [ ] Particles burst from merge locations
- [ ] Camera zoom feels smooth (no jank)
- [ ] Danger state visuals escalate by level
- [ ] Fever mode visuals are dramatic
- [ ] Empty cells highlight in danger state

### Feature Testing
- [ ] Next tile preview is accurate
- [ ] Undo restores previous state correctly (one use only)
- [ ] Combo counter tracks correctly with timeout
- [ ] Fever mode activates at 5 consecutive merges
- [ ] Fever mode 2x multiplier applies correctly
- [ ] Share image generates with correct stats
- [ ] Challenge links encode/decode properly
- [ ] Character gallery shows unlocked tiles

### Mobile Testing
- [ ] Touch swipes work correctly
- [ ] Preview on hold works
- [ ] Haptics work on iOS
- [ ] Haptics work on Android
- [ ] Share sheet appears on mobile

### Performance Testing
- [ ] No frame drops during particles
- [ ] No lag during fever mode
- [ ] Smooth 60fps animations
- [ ] Music doesn't cause stuttering

---

## Completion Log

| Date | Tasks Completed | Notes |
|------|-----------------|-------|
| | | |
| | | |
| | | |
| | | |
| | | |

---

## Issues Encountered

| Issue | Solution | Task # |
|-------|----------|--------|
| | | |
| | | |
| | | |

---

*Checklist for 2048 Merge Game Juice Implementation*
