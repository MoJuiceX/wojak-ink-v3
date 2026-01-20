---
name: performance
description: |
  Mobile game performance optimizer for canvas-based games. Analyzes game files for performance bottlenecks and applies cutting-edge 2024-2025 optimization patterns.
  - MANDATORY TRIGGERS: optimize, performance, FPS, lag, slow, mobile performance, frame drops, jank, stuttering
  - Use when: optimizing any game in src/pages/ or src/games/, fixing mobile performance issues, improving frame rate, reducing battery drain
---

# Game Performance Optimizer

Optimize canvas-based games for 60 FPS on mid-range mobile devices (iPhone 11, Pixel 5).

## Quick Start

1. Read `references/patterns.md` for the 8 gold-standard optimization patterns
2. Analyze the target game file for RED FLAGS
3. Apply fixes using patterns from the reference
4. Output summary of changes

## Execution Steps

### Step 1: Identify Game File

Find the game based on user input:
- Full path: use directly (e.g., `src/pages/FlappyOrange.tsx`)
- Game name: check `src/pages/[Name].tsx` first, then `src/games/[Name]/index.tsx`

### Step 2: Read References

**Always read first:** `references/patterns.md` - Contains all 8 optimization patterns with code.

### Step 3: Read Game + Dependencies

Read the main game file, then trace imports from:
- `src/lib/canvas/` - Canvas utilities
- `src/lib/juice/` - Audio, particles, effects
- `src/hooks/` - Game hooks
- `src/systems/` - Shared systems

### Step 4: Identify RED FLAGS

Check for these critical issues:

| RED FLAG | Pattern to Apply |
|----------|------------------|
| `createLinearGradient` in game loop | OffscreenCanvas caching (#2) |
| `useState` for position/velocity | useRef for game state (#4) |
| `new Particle()` in loop | Object pooling (#3) |
| `new AudioContext()` per sound | Audio singleton (#5) |
| No `cancelAnimationFrame` cleanup | Add cleanup return |
| No delta time in physics | Fixed timestep (#1) |
| No `touch-action: none` CSS | Passive listeners (#6) |
| No `visibilitychange` handler | Page Visibility API (#7) |
| `devicePixelRatio` > 2 | Adaptive DPR (#8) |

### Step 5: Apply Fixes

For each issue, apply the corresponding pattern from `references/patterns.md`.

### Step 6: Output Summary

```markdown
## Performance Optimization: [GameName]

### Issues Found
1. [Issue] - Line XX
...

### Fixes Applied
1. [Fix description]
...

### Expected Improvements
| Metric | Before | After |
|--------|--------|-------|
| Gradient calls/frame | X | 0 |
| Re-renders/frame | X | 0 |
| Object allocations/frame | X | 0 |
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Frame time | <16.67ms |
| Gradient calls/frame | 0 |
| Object allocations/frame | 0 |
| React re-renders/frame | 0 |
| AudioContext instances | 1 |

## Related Files

- `references/patterns.md` - All 8 optimization patterns with full code
- `docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md` - Extended documentation
- `docs/games/orange-tree-performance.md` - Tree caching example
