# Quick Performance Optimization Prompts

Copy-paste these to Claude CLI to optimize any game.

---

## One-Liner (Recommended)

```
Read skills/performance/SKILL.md, then read skills/performance/references/patterns.md, then optimize src/pages/FlappyOrange.tsx using those patterns. Fix all RED FLAGS and output summary of changes.
```

**Change `FlappyOrange` to any game name.**

---

## By Game Name

```bash
# FlappyOrange
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/FlappyOrange.tsx

# CitrusDrop
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/CitrusDrop.tsx

# BrickBreaker
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/BrickBreaker.tsx

# OrangeStack
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/OrangeStack.tsx

# OrangePong
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/OrangePong.tsx

# OrangeJuggle
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/OrangeJuggle.tsx

# WojakRunner
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/WojakRunner.tsx

# OrangeSnake
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/OrangeSnake.tsx

# MemoryMatch
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/MemoryMatch.tsx

# BlockPuzzle
Read skills/performance/SKILL.md and references/patterns.md, then optimize src/pages/BlockPuzzle.tsx
```

---

## Batch Optimize All Games

```
Read skills/performance/SKILL.md and skills/performance/references/patterns.md. Then analyze all game files in src/pages/ for performance issues. Create a report at docs/PERFORMANCE-AUDIT-ALL-GAMES.md listing issues found in each game and recommended fixes.
```

---

## Full Audit Mode

```
Read docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md and execute the full audit on all games. Create docs/MOBILE-PERFORMANCE-AUDIT-RESULTS.md with findings and docs/PERFORMANCE-FIXES-PRIORITY.md with ordered fix list.
```
