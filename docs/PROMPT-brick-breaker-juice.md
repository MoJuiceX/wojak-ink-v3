# Prompt: Brick Breaker Juice Implementation

Copy and paste the appropriate prompt to Claude CLI:

---

## Implementation Prompt (Start Fresh)

```
I need you to implement juice enhancements for my Brick Breaker game step by step.

**Reference Documents:**
- Implementation guide: `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
- Progress checklist: `docs/BRICK-BREAKER-JUICE-CHECKLIST.md`
- Universal principles: `docs/game-juice-playbook.md`

**Instructions:**

1. Read the full implementation guide first to understand all 45 enhancements
2. Implement ONE enhancement at a time, in order (1 through 45)
3. After completing each enhancement:
   - Test that it works
   - Update the checklist by changing `[ ]` to `[x]`
   - Fill in the "File(s) Modified" and "Notes" columns in the table
   - Update the "Completed" count and "Progress" percentage at the bottom
4. Do NOT skip ahead or implement multiple at once
5. If an enhancement requires new audio files that don't exist, note it in the checklist and move on
6. All visual effects should be implemented in the Canvas rendering (not DOM)

**Start with Enhancement #1: Ball launch sound**

Show me your plan for implementing it, then implement it.
```

---

## Resume Prompt (Continue Where Left Off)

```
Continue implementing Brick Breaker juice enhancements.

1. Read `docs/BRICK-BREAKER-JUICE-CHECKLIST.md` to see current progress
2. Find the first unchecked item `[ ]`
3. Implement that enhancement following `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
4. Update the checklist when done
5. Continue to the next unchecked item

Reference `docs/game-juice-playbook.md` for universal game juice principles.
```

---

## Audit Prompt (Verify Implementation)

```
Audit the Brick Breaker juice implementation progress.

1. Read `docs/BRICK-BREAKER-JUICE-CHECKLIST.md` to see what's marked as complete
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
Implement Brick Breaker juice enhancement #[NUMBER]: [TITLE]

Follow the implementation details in `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md` section for this enhancement.

This is a Canvas-based game, so visual effects should be implemented in the draw loop, not as DOM elements.

After implementing:
1. Test it works
2. Update `docs/BRICK-BREAKER-JUICE-CHECKLIST.md` to mark it complete
3. Fill in the notes table with files modified
```

---

## Phase-Specific Prompts

### Sound Phase Only
```
Implement Brick Breaker juice enhancements #1-14 (Sound Foundation).

Reference: `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
Checklist: `docs/BRICK-BREAKER-JUICE-CHECKLIST.md`

Focus on:
- Adding new sound functions to useGameSounds hook
- Creating sound variations to prevent fatigue
- Proper volume and pitch settings
- Sound loops for ambient effects (fireball, anticipation)

Update checklist after each enhancement.
```

### Haptic Phase Only
```
Implement Brick Breaker juice enhancements #15-24 (Haptic Layer).

Reference: `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
Checklist: `docs/BRICK-BREAKER-JUICE-CHECKLIST.md`

Focus on:
- Adding new haptic functions to useGameHaptics hook
- Distinct patterns for different events
- Escalating intensity for combos
- Near-miss detection and feedback

Update checklist after each enhancement.
```

### Visual Phase Only
```
Implement Brick Breaker juice enhancements #25-38 (Visual Juice).

Reference: `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
Checklist: `docs/BRICK-BREAKER-JUICE-CHECKLIST.md`

Focus on:
- Canvas-based rendering (not DOM)
- Squash/stretch animations for ball and paddle
- Particle systems and shatter effects
- Screen shake with proper decay
- Freeze frames for impact

Update checklist after each enhancement.
```

### Combo System Only
```
Implement Brick Breaker juice enhancements #43-45 (Combo System).

Reference: `docs/BRICK-BREAKER-JUICE-IMPLEMENTATION.md`
Checklist: `docs/BRICK-BREAKER-JUICE-CHECKLIST.md`

Focus on:
- Visual combo meter
- Score multiplier integration
- Combo break feedback

Update checklist after each enhancement.
```

---

## Sound File Generation Prompt

```
Review the sound file requirements in `docs/BRICK-BREAKER-JUICE-CHECKLIST.md` under "Sound Files Status".

For each missing sound file:
1. Describe what the sound should be like (duration, character, purpose)
2. Suggest whether to:
   - Use an existing sound from the project
   - Generate programmatically with Web Audio API
   - Source from a free sound library
3. If programmatic generation is viable, provide the Web Audio API code

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
