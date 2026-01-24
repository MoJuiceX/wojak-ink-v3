# Phase 6: Code Cleanup & Polish

**Goal:** Remove dead code, fix TypeScript issues, final polish.

**Time Estimate:** 1 hour

---

## Task 6.1: Remove @ts-nocheck from All Games

**All game files have TypeScript checking disabled:**

```bash
grep -l "@ts-nocheck" src/pages/*.tsx
```

**For each file:**

1. Remove `// @ts-nocheck` from line 1
2. Run `npx tsc --noEmit`
3. Fix type errors one by one

**Common type fixes:**

```typescript
// Refs need types
const containerRef = useRef<HTMLDivElement>(null);
const scoreRef = useRef<number>(0);
const timerRef = useRef<NodeJS.Timeout | null>(null);

// State needs types
const [blocks, setBlocks] = useState<Block[]>([]);
const [grid, setGrid] = useState<(number | null)[][]>([]);

// Event handlers need types
const handleClick = (e: React.MouseEvent<HTMLDivElement>) => { };
const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => { };

// Optional chaining for potentially null refs
containerRef.current?.getBoundingClientRect();
```

**Priority order (easiest to hardest):**
1. Orange2048.tsx (462 lines - simplest)
2. WojakRunner.tsx (885 lines)
3. ColorReaction.tsx (1,452 lines)
4. MemoryMatch.tsx (1,516 lines)
5. BrickByBrick.tsx (1,763 lines)
6. BlockPuzzle.tsx (2,936 lines)
7. FlappyOrange.tsx (4,586 lines - most complex)

---

## Task 6.2: Remove Console Logs

**Find debug logging:**
```bash
grep -rn "console.log\|console.warn\|console.error" src/pages/*.tsx | grep -v "catch\|error" | head -30
```

**Remove patterns like:**
```typescript
console.log('score', score);
console.log('position', x, y);
console.log('[DEBUG]', data);
```

**Keep patterns like:**
```typescript
console.error('Failed to load:', error);
console.warn('API unavailable, using fallback');
```

---

## Task 6.3: Remove Unused Imports

**Check each file for unused imports:**
```bash
npx eslint src/pages/BlockPuzzle.tsx --rule 'no-unused-vars: warn' 2>/dev/null | head -20
```

**Or manually check:**
```bash
grep -n "^import" src/pages/BlockPuzzle.tsx
```

Then search if each import is actually used in the file.

---

## Task 6.4: Remove Dead Code

**Search for commented-out code blocks:**
```bash
grep -n "// TODO\|// FIXME\|// HACK\|// XXX" src/pages/*.tsx
```

**Search for unused functions:**
Look for functions defined but never called. Check if:
- Function is exported but not imported anywhere
- Function is defined in component but never used

**Common dead code patterns:**
```typescript
// This function was replaced but never removed
const oldCalculation = () => { /* ... */ };

// Commented out experiments
// const experimentalFeature = () => { ... };
```

---

## Task 6.5: Consolidate Duplicate Logic

**Search for duplicated patterns across games:**

```bash
# Leaderboard submission pattern
grep -h "submitScore\|handleGameEnd" src/pages/*.tsx | sort | uniq -c | sort -rn | head -10

# Local storage patterns
grep -h "localStorage.getItem\|localStorage.setItem" src/pages/*.tsx | sort | uniq -c | sort -rn | head -10
```

**If same pattern appears 3+ times, extract to shared utility.**

---

## Task 6.6: Remove Duplicate Game Folders

**Check for games in both locations:**
```bash
ls src/games/
ls src/pages/*.tsx | grep -i "game\|puzzle\|orange\|flappy\|runner\|match\|color\|brick\|2048"
```

**If a game exists in both `/src/games/` AND `/src/pages/`:**
1. Determine which is the "real" implementation (check imports, recent changes)
2. Delete the duplicate
3. Update any imports pointing to deleted location

---

## Task 6.7: Organize Hooks Directory

**Current state:** Flat structure with 40+ hooks

**Better structure:**
```
src/hooks/
├── data/           # Data fetching hooks
│   ├── useLeaderboard.ts
│   ├── useWallet.ts
│   └── useTreasuryData.ts
├── game/           # Game-specific hooks
│   ├── useGameSounds.ts
│   ├── useGameScore.ts
│   └── useGameNavigationGuard.ts
├── ui/             # UI utility hooks
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   └── useCopyToClipboard.ts
└── index.ts        # Re-exports all hooks
```

**Create index.ts for easy imports:**
```typescript
// src/hooks/index.ts
export * from './data/useLeaderboard';
export * from './game/useGameSounds';
export * from './ui/useMediaQuery';
// etc.
```

---

## Task 6.8: Add JSDoc Comments to Shared Functions

**For key shared functions, add documentation:**

```typescript
/**
 * Triggers standard score effect with popup and optional particles.
 * @param effects - The effects object from useGameEffects
 * @param points - Points scored
 * @param x - X position (0-100, percentage)
 * @param y - Y position (0-100, percentage)
 */
export const onScore = (effects: GameEffects, points: number, x: number, y: number) => {
  // ...
};
```

---

## Task 6.9: Verify All Imports Use Aliases

**Check for relative imports that should use aliases:**
```bash
grep -rn "from '\.\./\.\./\.\." src/pages/*.tsx | head -10
```

**Replace with path aliases:**
```typescript
// BAD
import { Button } from '../../../components/ui/Button';

// GOOD
import { Button } from '@/components/ui/Button';
```

**Available aliases (from vite.config.ts):**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@assets/` → `src/assets/`

---

## Task 6.10: Final Build & Lint Check

**Run full build:**
```bash
npm run build
```

**Should complete with:**
- No errors
- Warnings only for expected issues (vendor libs, etc.)

**Run lint:**
```bash
npm run lint
```

**Fix any critical errors. Warnings are OK but note them.**

---

## Task 6.11: Create CHANGELOG Entry

**If `/CHANGELOG.md` exists, add entry. Otherwise create:**

```markdown
# Changelog

## [Unreleased] - 2024-XX-XX

### Added
- Shared GameButton component
- useGameTouch hook for consistent touch handling
- useGameViewport hook for responsive layouts
- Standard effect patterns (effectPatterns.ts)

### Changed
- All games now use CSS variables from design system
- Standardized effects across all games
- Improved mobile touch responsiveness
- Reduced FlappyOrange.tsx from 4,586 to ~2,000 lines

### Fixed
- Memory leaks in game timers
- Touch event handling on mobile
- Orientation change handling
- Safe area support for notched phones

### Removed
- Duplicate OrangeStack game folder
- Unused console.log statements
- Dead code and commented experiments
```

---

## Final Verification

**Complete checklist:**

### Code Quality
- [ ] No `@ts-nocheck` in game files
- [ ] No debug console.log statements
- [ ] No unused imports
- [ ] No dead code
- [ ] No duplicate game folders
- [ ] Hooks organized in subdirectories
- [ ] Key functions have JSDoc comments
- [ ] All imports use path aliases
- [ ] Build passes without errors
- [ ] Lint passes (or only acceptable warnings)

### Game Functionality
- [ ] All 7 games load without errors
- [ ] All 7 games playable on desktop
- [ ] All 7 games playable on mobile
- [ ] All games have consistent effects
- [ ] All games have consistent styling
- [ ] Theme switching works

### Performance
- [ ] No memory leaks detected
- [ ] 60fps maintained during gameplay
- [ ] Fast initial load time

---

## Audit Complete! 🎉

After completing all 6 phases, your games should be:

1. **Well-structured** - Consistent architecture
2. **Visually consistent** - Shared design system
3. **Mobile-friendly** - Responsive and touch-optimized
4. **Performant** - No leaks, smooth 60fps
5. **Juicy** - Satisfying effects everywhere
6. **Clean** - No dead code, proper TypeScript

**Ready for your community game session!**
