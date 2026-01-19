# Prompt: Orange Juggle Juice Implementation

Copy and paste the appropriate prompt to Claude CLI:

---

## Implementation Prompt (Start Fresh)

```
I need you to implement juice enhancements for my Orange Juggle game step by step.

**Reference Documents:**
- Implementation guide: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
- Progress checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`
- Universal principles: `docs/game-juice-playbook.md`

**Game Context:**
- Orangutan paddle with animated arm swings
- Oranges to juggle (normal + golden)
- Powerups: Banana (clears rum + 1.5x score), Rum (slows/reverses)
- Enemy: Camel that drops from sky
- 5 levels with increasing difficulty
- Combo system: 2.5s decay, max 10x multiplier
- High intensity visual chaos mode

**Instructions:**

1. Read the full implementation guide first to understand all 62 enhancements
2. Implement ONE enhancement at a time, in order (1 through 62)
3. After completing each enhancement:
   - Test that it works
   - Update the checklist by changing `[ ]` to `[x]`
   - Fill in the "File(s) Modified" and "Notes" columns in the table
   - Update the "Completed" count and "Progress" percentage at the bottom
4. Do NOT skip ahead or implement multiple at once
5. If an enhancement requires new audio files that don't exist, note it in the checklist and move on
6. All visual effects should be implemented in the Canvas rendering (not DOM)

**Start with Enhancement #1: Orange juggle hit sound**

Show me your plan for implementing it, then implement it.
```

---

## Resume Prompt (Continue Where Left Off)

```
Continue implementing Orange Juggle juice enhancements.

1. Read `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md` to see current progress
2. Find the first unchecked item `[ ]`
3. Implement that enhancement following `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
4. Update the checklist when done
5. Continue to the next unchecked item

Reference `docs/game-juice-playbook.md` for universal game juice principles.
```

---

## Audit Prompt (Verify Implementation)

```
Audit the Orange Juggle juice implementation progress.

1. Read `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md` to see what's marked as complete
2. For each item marked `[x]`, verify the implementation actually exists in the codebase
3. Check:
   - Sound hooks for audio enhancements
   - Haptic hooks for vibration enhancements
   - Canvas draw functions for visual enhancements
4. Report:
   - Which enhancements are truly implemented and working
   - Which are marked complete but missing or broken
   - Which are not yet implemented
5. Update the checklist to reflect actual status
```

---

## Single Enhancement Prompt (Specific Item)

```
Implement Orange Juggle juice enhancement #[NUMBER]: [TITLE]

Follow the implementation details in `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md` section for this enhancement.

This is a Canvas-based game, so visual effects should be implemented in the draw loop, not as DOM elements.

After implementing:
1. Test it works
2. Update `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md` to mark it complete
3. Fill in the notes table with files modified
```

---

## Phase-Specific Prompts

### Sound Phase Only
```
Implement Orange Juggle juice enhancements #1-14 (Sound Foundation).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Adding new sound functions to useGameSounds hook
- Creating sound variations to prevent fatigue
- Proper volume and pitch settings
- Sound loops for ambient effects (rum woozy, banana shimmer)
- Arm swing whoosh sounds

Update checklist after each enhancement.
```

### Haptic Phase Only
```
Implement Orange Juggle juice enhancements #15-24 (Haptic Layer).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Adding new haptic functions to useGameHaptics hook
- Distinct patterns for different events (oranges vs camel vs powerups)
- Escalating intensity for combos
- Near-miss detection and ultra-light feedback
- Woozy pattern for rum collection

Update checklist after each enhancement.
```

### Visual Phase Only
```
Implement Orange Juggle juice enhancements #25-42 (Visual Juice + Powerups).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Canvas-based rendering (not DOM)
- Squash/stretch animations for oranges
- Orangutan arm swing animation
- Particle systems and trail effects
- Powerup glow/pulse animations
- Screen shake with proper decay
- Freeze frames for impact

Update checklist after each enhancement.
```

### Enemy Phase Only
```
Implement Orange Juggle juice enhancements #43-48 (Enemy & Hazard Feedback).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Camel shadow warning system (drop from sky mechanic)
- Camel drop animation with dust cloud
- Camel movement and dust trail
- Collision impact (game over moment)
- Near-miss detection for narrow escapes

Update checklist after each enhancement.
```

### Combo System Only
```
Implement Orange Juggle juice enhancements #49-55 (Combo & Scoring).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Visual combo meter with timeout bar
- Score multiplier display (max 10x)
- Combo break feedback
- Max combo (10x) celebration
- Animated score counter
- High score celebration
- Lives display animation

Update checklist after each enhancement.
```

### Polish Phase Only
```
Implement Orange Juggle juice enhancements #56-62 (Anticipation & Polish).

Reference: `docs/ORANGE-JUGGLE-JUICE-IMPLEMENTATION.md`
Checklist: `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md`

Focus on:
- Landing prediction indicators
- Final orange highlighting (1-3 remaining)
- Level transition animations
- Anticipation sound loop
- Level complete celebration
- Game over sequence
- Pause state feedback

Update checklist after each enhancement.
```

---

## Sound File Generation Prompt

```
Review the sound file requirements in `docs/ORANGE-JUGGLE-JUICE-CHECKLIST.md` under "Sound Files Status".

For each missing sound file:
1. Describe what the sound should be like (duration, character, purpose)
2. Suggest whether to:
   - Use an existing sound from the project
   - Generate programmatically with Web Audio API
   - Source from a free sound library
3. If programmatic generation is viable, provide the Web Audio API code

Priority sounds for Orange Juggle:
- Orange hit (bouncy, satisfying) - needs 4 variations
- Golden orange (magical chime)
- Banana collect (happy arpeggio)
- Rum collect (sloshing glug)
- Camel warning (alarming horn)
- Camel impact (heavy crash)
- Arm whoosh (subtle air movement) - needs 3 variations

Mark the sound file status in the checklist as you address each one.
```

---

## Quick Reference

| Prompt | Use When |
|--------|----------|
| Implementation | Starting fresh |
| Resume | Continuing after a break |
| Audit | Checking what's actually done |
| Single Enhancement | Fixing or adding specific item |
| Phase-Specific | Focus on one category |
| Sound File | Need audio assets |

---

## Game-Specific Notes

### Orangutan Character
- Has animated left/right arms (not static paddle)
- Arms swing to hit oranges with follow-through
- Body can squash on impacts
- Glows brighter as combo increases

### Camel Enemy
- Drops from sky (shadow appears first as warning)
- 1.5 second warning before drop
- Creates dust cloud on landing
- Moves toward player after landing
- Collision = game restart
- Has near-miss detection

### Banana Powerup
- Clears rum debuff effect
- Grants 1.5x score multiplier for 5 seconds
- Shows timer bar while active
- Yellow glow with floating animation

### Rum Debuff
- Slows paddle movement
- Reverses controls
- Purple woozy visual overlay
- Ambient sloshing sound loop

### Visual Intensity
- High intensity mode selected
- Multiple trails, screen shake on juggles
- Panic indicators when multiple oranges falling
- Full combo explosions and celebrations

---
