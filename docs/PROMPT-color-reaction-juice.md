# Prompt: Color Reaction Juice Implementation

Copy and paste the appropriate prompt to Claude CLI:

---

## Implementation Prompt (Start Fresh)

```
I need you to implement juice enhancements for my Color Reaction game step by step.

**Reference Documents:**
- Implementation guide: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
- Progress checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`
- Universal principles: `docs/game-juice-playbook.md`

**Game Files:**
- Main component: `src/pages/ColorReaction.tsx`
- Styles: `src/pages/ColorReaction.css` and `src/games/ColorReaction/ColorReaction.game.css`
- Haptic patterns: `src/hooks/haptics/patterns.ts`
- Sound hooks: `src/hooks/useHowlerSounds.ts` or create `src/hooks/useColorReactionSounds.ts`

**Game Context:**
- Reaction-time color matching game with fruit-themed colors
- Two circles that cycle through colors independently
- Player taps when colors match within 1500ms window
- Reaction time ratings: PERFECT (<300ms), GREAT (<500ms), GOOD (<700ms), OK (<1000ms)
- Lives system (3 lives), streak multiplier
- Speed increases every 100 points
- Currently has basic juice (screen shake, confetti, floating scores), but missing:
  - Haptics entirely
  - Fever Mode (for high combos)
  - Camera zoom effects
  - Touch ripples
  - Share/viral mechanics

**Instructions:**

1. Read the full implementation guide first to understand all 117 enhancements across 12 phases
2. Work through ONE PHASE at a time, completing all tasks in order
3. After completing each task:
   - TEST on mobile device (haptics/touch won't work on desktop)
   - Update the checklist by changing `[ ]` to `[x]`
   - Fill in the "File(s) Modified" and "Notes" columns
4. After completing a phase:
   - Update the "Completed" count in the Progress Summary
   - Change phase status from "Not Started" to "Complete"
5. Do NOT skip ahead or implement multiple phases at once
6. All visual effects should use CSS animations (DOM-based React, not Canvas)

**Priority Phases:**
- Phases 1-9: Core juice (haptics, sounds, visuals)
- Phase 10: FEVER MODE - Makes long runs epic (15+ streak)
- Phase 11: Camera effects - Professional polish
- Phase 12: VIRAL/SHARE - Critical for growth (share images, challenge links)

**Start with Phase 1: Haptic Foundation (Tasks 1-12)**

Show me your plan for Task 1, then implement it.
```

---

## Resume Prompt (Continue Where Left Off)

```
Continue implementing Color Reaction juice enhancements.

1. Read `docs/COLOR-REACTION-JUICE-CHECKLIST.md` to see current progress
2. Find the first unchecked phase/task `[ ]`
3. Implement that enhancement following `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
4. Update the checklist when done
5. Continue to the next unchecked item in the current phase
6. When a phase is complete, update the Progress Summary

Reference `docs/game-juice-playbook.md` for universal game juice principles.
```

---

## Audit Prompt (Verify Implementation)

```
Audit the Color Reaction juice implementation progress.

1. Read `docs/COLOR-REACTION-JUICE-CHECKLIST.md` to see what's marked as complete
2. For each item marked `[x]`, verify the implementation actually exists in the codebase
3. Check:
   - Haptic hook calls in ColorReaction.tsx
   - Sound hook calls for audio enhancements
   - CSS classes/animations for visual enhancements
   - State variables for urgency system, time dilation, etc.
4. Report:
   - Which enhancements are truly implemented and working
   - Which are marked complete but missing or broken
   - Which are not yet implemented
5. Update the checklist to reflect actual status
```

---

## Single Task Prompt (Specific Item)

```
Implement Color Reaction juice task #[NUMBER]: [TITLE]

Follow the implementation details in `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md` for this task.

This is a DOM-based React game, so visual effects should use CSS animations, not Canvas.

After implementing:
1. Test it works
2. Update `docs/COLOR-REACTION-JUICE-CHECKLIST.md` to mark it complete
3. Fill in the notes table with files modified
```

---

## Phase-Specific Prompts

### Phase 1: Haptic Foundation
```
Implement Color Reaction juice tasks #1-12 (Haptic Foundation).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Importing useGameHaptics hook
- Adding haptic patterns to patterns.ts
- Tap haptic on every tap (ultra-light)
- Reaction-time based haptics (PERFECT/GREAT/GOOD/OK)
- Wrong tap and miss haptics (gentle)
- Countdown urgency haptics (tick, warning, critical)
- Life loss and game over haptics
- Streak milestone haptics (escalating at 5, 10, 15, 20)

Update checklist after each task.
```

### Phase 2: Sound System Overhaul
```
Implement Color Reaction juice tasks #13-28 (Sound System Overhaul).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Correct tap sound with reaction-time pitch variation
- Wrong tap sound (gentle, non-punishing)
- Miss sound (whooshing fade)
- Match window start sound
- Countdown tick/warning/critical sounds
- Life loss and last life warning sounds
- PERFECT celebration fanfare
- Streak milestone sounds
- Speed up and color change sounds
- Near-miss "too slow" sound
- Time dilation ethereal effect
- Sound variations system for repeated sounds

Update checklist after each task.
```

### Phase 3: Countdown Urgency System
```
Implement Color Reaction juice tasks #29-38 (Countdown Urgency System).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Define 3 urgency phases: Normal (>750ms), Warning (750-300ms), Critical (<300ms)
- Ring color transition: Green → Yellow → Red
- Ring pulse animation (faster with urgency)
- "TAP NOW!" text urgency (pulses, changes color)
- Countdown tick sound loop in final 500ms
- Circle shake in critical phase (<300ms)
- Background urgency tint
- Remaining time display when <500ms
- Heartbeat sound in final 300ms
- Red vignette intensifies with urgency

Update checklist after each task.
```

### Phase 4: Perfect Reaction Celebration
```
Implement Color Reaction juice tasks #39-48 (Perfect Reaction Celebration).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Time dilation effect (brief slow-mo on PERFECT)
- Screen flash (gold flash effect)
- Freeze frame (60ms pause)
- Particle explosion from circles
- "PERFECT!" callout animation (large animated text)
- Screen shake with decay
- Circle pulse outward
- Confetti burst
- Reaction time display animation (show ms with emphasis)
- Circle connection line (glowing line connects circles)

Update checklist after each task.
```

### Phase 5: Visual Juice Enhancement
```
Implement Color Reaction juice tasks #49-62 (Visual Juice Enhancement).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Circle squash on tap
- Color change animation (smooth with bounce)
- Impact flash on correct (white expanding circle)
- Particle system for all reactions (scaled by rating)
- Floating score animation
- Wrong tap red flash
- Gentle screen shake on wrong
- Circle glow during match
- Score counter animation (count up with bounce)
- Lives animation (hearts bounce)
- Speed up visual callout
- Background pulse on match
- Streak fire effect at high streaks
- Emoji burst on correct

Update checklist after each task.
```

### Phase 6: Streak & Scoring Polish
```
Implement Color Reaction juice tasks #63-72 (Streak & Scoring Polish).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Combo meter visual (on-screen meter that fills)
- Streak milestone celebration at 5/10/15/20
- Streak break feedback
- Score multiplier display
- High score notification
- Floating score position variation (appear at tap)
- Best reaction time tracker
- Score pop effect
- Rating color coding
- Session stats tracker

Update checklist after each task.
```

### Phase 7: Failure & Warning States
```
Implement Color Reaction juice tasks #73-82 (Failure & Warning States).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Last life warning state (persistent red vignette/pulse)
- Life loss animation (heart breaks)
- Game over sequence (shake → fade → display)
- Game over stats display (animated reveal)
- Wrong tap "floating X"
- Miss "floating clock"
- Danger heartbeat ambient on last life
- Play again button animation (attractive bounce-in)
- Continue prompt delay (1.5s before showing)
- Retry animation (smooth transition)

Update checklist after each task.
```

### Phase 8: Near-Miss & Close Call System
```
Implement Color Reaction juice tasks #83-90 (Near-Miss & Close Call System).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Near-miss detection (taps 0-200ms after window)
- "TOO SLOW!" callout with timing info
- Timing bar visualization (how close the tap was)
- Encouraging near-miss messages (rotating)
- Close call sound (distinct, sympathetic)
- Visual "almost" effect (ring shows where window ended)
- Near-miss haptic (softer than wrong tap)
- Miss vs near-miss differentiation

Update checklist after each task.
```

### Phase 9: Final Polish & Accessibility
```
Implement Color Reaction juice tasks #91-100 (Final Polish & Accessibility).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Color expansion (add Strawberry & Kiwi colors)
- Settings toggles (sound/haptics/shake/flash)
- Reduced motion mode (respect system preference)
- Performance optimization (limit particles, use RAF)
- Touch feedback enhancement (ripple at touch point)
- Start game animation (3-2-1 countdown)
- Leaderboard integration polish
- Tutorial/first play hints
- Sound preloading
- Final integration test

Update checklist after each task.
```

### Phase 10: Fever Mode & Advanced Combos ⭐ HIGH PRIORITY
```
Implement Color Reaction juice tasks #101-107 (Fever Mode).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

This is a HIGH PRIORITY phase - Fever Mode makes long runs feel EPIC!

Focus on:
- Define FeverState interface and config (15+ streak activation)
- Dramatic fever mode activation (fanfare, confetti, screen flash)
- Visual fever state (fire background, rising ember particles)
- x2 multiplier display (large, pulsing, golden)
- Driving bass audio loop while active
- Deactivation on miss/wrong tap
- Intensity growth with continued success

The goal is to make players CHASE that 15-streak to enter Fever Mode.
It should feel like entering a bonus round!

Update checklist after each task.
```

### Phase 11: Camera & Advanced Visual Effects
```
Implement Color Reaction juice tasks #108-111 (Camera Effects).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

Focus on:
- Camera zoom pulse (105% on tap, scale back via CSS transition)
- Touch point ripple (ripple at actual touch location, not circle center)
- Hit-stop on ALL correct taps (not just PERFECT) - scaled by rating
- Signature match sound ("ding-DING!" two-note chime that's memorable)

These are professional polish touches that separate good games from great ones.

Update checklist after each task.
```

### Phase 12: Viral & Share System ⭐ CRITICAL FOR GROWTH
```
Implement Color Reaction juice tasks #112-117 (Viral & Share).

Reference: `docs/COLOR-REACTION-JUICE-IMPLEMENTATION.md`
Checklist: `docs/COLOR-REACTION-JUICE-CHECKLIST.md`

This is CRITICAL for viral growth - without share mechanics, the game has no viral loop!

Focus on:
- Share stats image generator (Canvas-based, branded image with stats)
- Share button UI (use Web Share API where available, fallback to download)
- Challenge link generator (encoded URL params with target score)
- Challenge mode UI (show target during gameplay with progress bar)
- Challenge complete celebration (special win animation, extra confetti)
- Auto-highlight tracking (track best moments for share text)

The share image should include:
- Game title with emoji branding
- Score prominently displayed
- Best streak, best time, perfect count
- "Play at wojak.ink" branding

Update checklist after each task.
```

---

## Quick Reference

| Prompt | Use When |
|--------|----------|
| Implementation | Starting fresh |
| Resume | Continuing after a break |
| Audit | Checking what's actually done |
| Single Task | Fixing or adding specific item |
| Phase-Specific | Focus on one category |

### ⭐ Priority Order for Maximum Impact
1. **Phase 1-2** (Haptics + Sounds) — Foundation, do first
2. **Phase 10** (Fever Mode) — HIGH IMPACT, makes game addictive
3. **Phase 11** (Camera Effects) — Professional polish
4. **Phase 12** (Viral/Share) — CRITICAL for growth
5. **Phases 3-9** — Core juice, do as needed

---

## Game-Specific Notes

### Reaction Time Thresholds
| Rating | Time | Points | Celebration Level |
|--------|------|--------|-------------------|
| PERFECT | <300ms | 100 | Maximum (time dilation, confetti, fanfare) |
| GREAT | <500ms | 75 | High (particles, sound, haptic burst) |
| GOOD | <800ms | 50 | Medium (particles, sound) |
| OK | <1500ms | 25 | Low (minimal feedback) |

### Match Window Timing
- Total window: 1500ms
- Normal phase: 1500ms - 750ms (green ring)
- Warning phase: 750ms - 300ms (yellow ring, faster pulse)
- Critical phase: <300ms (red ring, shake, heartbeat)

### Color System
| Color | Hex | Emoji |
|-------|-----|-------|
| Orange | #FF6B00 | 🍊 |
| Lime | #32CD32 | 🍋 |
| Grape | #8B5CF6 | 🍇 |
| Berry | #3B82F6 | 🫐 |
| Strawberry (NEW) | #FF4757 | 🍓 |
| Kiwi (NEW) | #2ED573 | 🥝 |

### Key Psychology Principles
- Response time <100ms feels instant
- Audio processes faster than visual (use sound for urgency)
- Freeze frames (30-60ms) make impacts feel powerful
- Time dilation rewards mastery
- Near-miss feedback motivates retry
- Gentle failure, maximum celebration

### File Structure
- `src/games/ColorReaction/ColorReaction.tsx` - Main game component
- `src/games/ColorReaction/ColorReaction.css` - Styles and animations
- `src/hooks/useGameHaptics.ts` - Haptic feedback hook
- `src/hooks/haptics/patterns.ts` - Haptic pattern definitions
- `src/hooks/useGameSounds.ts` - Sound effects hook

---

## Debugging Tips

### Haptics Not Working?
1. Check if `useGameHaptics` is imported
2. Verify patterns exist in `patterns.ts`
3. Test on mobile device (haptics don't work on desktop)
4. Check browser console for errors

### Sounds Not Playing?
1. Verify AudioContext is created on user interaction
2. Check volume settings
3. Look for Web Audio API errors in console
4. Ensure sounds are triggered after user gesture

### Animations Choppy?
1. Use `transform` and `opacity` for animations (GPU accelerated)
2. Add `will-change` property for animated elements
3. Limit particle count
4. Use `requestAnimationFrame` for JavaScript animations

### Time Dilation Not Smooth?
1. Use CSS `transition` with proper easing
2. Apply to transform, not position properties
3. Consider using `animation-play-state` for pause effect

---

*Last updated: 2026-01-19*
