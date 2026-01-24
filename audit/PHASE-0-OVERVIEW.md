# Wojak Ink Game Audit - Complete Overview

## Critical Findings Summary

After deep analysis of the codebase, here are the systemic issues that need addressing:

### 🚨 CRITICAL ISSUES

1. **Spaghetti Code Architecture**
   - Games are 500-4,586 lines in single files
   - No consistent game structure
   - Duplicate implementations (`/src/games/` AND `/src/pages/`)

2. **Design System Not Used by Games**
   - Beautiful theme system exists in `index.css`
   - Games hardcode colors like `#ff7b00` instead of `var(--color-tang-500)`
   - Theme switching doesn't affect games

3. **No Shared Button Component**
   - Every button implemented differently
   - Inconsistent sizing, padding, hover states

4. **Two Different Effects Systems**
   - `useEffects()` from `/src/systems/effects/` - newer, cleaner
   - `useGameEffects()` from `/src/components/media/` - older, used by most games
   - Causes confusion about which to use

5. **Giant Hook File**
   - `useGameSounds.ts` is 3,346 lines
   - Should be split into modules

---

## Game File Sizes (Red Flags)

| Game | Lines | Status |
|------|-------|--------|
| FlappyOrange.tsx | 4,586 | 🔴 CRITICAL - needs splitting |
| BlockPuzzle.tsx | 2,936 | 🔴 CRITICAL - needs splitting |
| BrickByBrick.tsx | 1,763 | 🟡 Large but manageable |
| MemoryMatch.tsx | 1,516 | 🟡 Large but manageable |
| ColorReaction.tsx | 1,452 | 🟡 Large but manageable |
| WojakRunner.tsx | 885 | 🟢 Reasonable |
| Orange2048.tsx | 462 | 🟢 Good |

---

## What Games SHOULD Look Like

Every game should follow this pattern:

```
/src/pages/GameName.tsx          # Page wrapper (< 100 lines)
/src/games/GameName/
  ├── index.tsx                  # Main game component (< 500 lines)
  ├── config.ts                  # All constants and configuration
  ├── types.ts                   # TypeScript interfaces
  ├── hooks/
  │   └── useGameLogic.ts        # Game-specific logic
  ├── components/
  │   ├── GameBoard.tsx          # Main game area
  │   ├── HUD.tsx                # Score, timer, etc.
  │   └── [GameSpecific].tsx     # Game-specific components
  └── GameName.css               # Game styles using CSS variables
```

---

## Phase Breakdown

| Phase | Focus | Priority | Time |
|-------|-------|----------|------|
| 1 | Architecture & Structure | 🔴 HIGH | 2 hours |
| 2 | Design System Integration | 🔴 HIGH | 1 hour |
| 3 | Mobile/Desktop Parity | 🔴 HIGH | 1 hour |
| 4 | Performance Optimization | 🟡 MEDIUM | 1 hour |
| 5 | Effects Standardization | 🟡 MEDIUM | 30 min |
| 6 | Code Cleanup | 🟢 LOW | 1 hour |

---

## How to Use This Audit

**For Claude CLI:**

1. Read ONE phase file at a time
2. Complete ALL tasks in that phase
3. Run `npm run build` after each task
4. Test affected games manually
5. Move to next phase only when current is complete

**Command pattern:**
```
"Read /audit/PHASE-1-ARCHITECTURE.md and complete Task 1.1 only. Stop after completing and testing."
```

---

## Files in This Audit

```
/audit/
├── PHASE-0-OVERVIEW.md          # This file
├── PHASE-1-ARCHITECTURE.md      # File structure, game splitting
├── PHASE-2-DESIGN-SYSTEM.md     # CSS variables, buttons, consistency
├── PHASE-3-MOBILE-DESKTOP.md    # Touch handling, responsive layout
├── PHASE-4-PERFORMANCE.md       # Memory, renders, optimization
├── PHASE-5-EFFECTS.md           # Visual feedback standardization
└── PHASE-6-CLEANUP.md           # Final polish, dead code removal
```

---

## Success Criteria

After completing all phases:

- [ ] All games under 800 lines each
- [ ] All games use CSS variables for colors
- [ ] All games use shared Button component
- [ ] All games have consistent touch handling
- [ ] All games have consistent effects
- [ ] No duplicate game implementations
- [ ] `npm run build` passes
- [ ] All games playable on mobile and desktop
