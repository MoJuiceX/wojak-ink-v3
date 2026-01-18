# Learnings Log

<!-- Last consolidated: 2026-01-18 -->
<!-- Next review: 2026-01-25 -->

## Format Guide
Each entry: `### [DATE] [CATEGORY] Title`
Categories: BUG, PATTERN, GOTCHA, API, PERF, DECISION
Status: ACTIVE | STALE | ARCHIVED

---

## Active Learnings

### [2026-01-18] [PATTERN] Landing Page Floating NFTs Animation
**Problem**: NFTs "jumping" when scale animation restarts, and overlapping scroll dots
**Solution**:
- Use `AnimatePresence mode="popLayout"` for smooth crossfades without layout jump
- Scale animation ONCE on mount, then only floating/breathing animation continues
- Position right-side NFTs at x: 78-82% to avoid scroll navigation dots
**Files**: `src/components/landing/FloatingNFTs.tsx`
**Code**:
```tsx
<AnimatePresence mode="popLayout">
  <motion.img
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 1.2, ease: 'easeInOut' }}
  />
</AnimatePresence>
```
**Status**: ACTIVE

---

### [2026-01-18] [PATTERN] Rotating Taglines with AnimatePresence
**Problem**: Taglines needed smooth rotation every 4 seconds
**Solution**: useState + setInterval with AnimatePresence mode="wait"
**Files**: `src/components/landing/HeroSection.tsx`
**Code**:
```tsx
const TAGLINES = ['4,200 Unique Wojaks on Chia', 'Banger NFTs on Chia', ...];

useEffect(() => {
  if (prefersReducedMotion) return;
  const interval = setInterval(() => {
    setTaglineIndex(prev => (prev + 1) % TAGLINES.length);
  }, 4000);
  return () => clearInterval(interval);
}, [prefersReducedMotion]);
```
**Status**: ACTIVE

---

### [2026-01-18] [BUG] Pong Crash on Win - e.match is not a function
**Problem**: Error `e.match is not a function` when winning Pong game
**Cause**: `addScorePopup(scoreAmount, ...)` passed a number, but function expects string
**Solution**: Changed to `addScorePopup(\`+${scoreAmount}\`, ...)`
**Files**: `src/pages/OrangePong.tsx:437`
**Lesson**: When error says "X.match is not a function", search for `.match(` calls and check if variable is actually a string
**Status**: ACTIVE

---

### [2026-01-18] [BUG] Vite Cache Corruption - Hook Errors After HMR
**Problem**: Pages randomly stop loading with "Cannot read properties of null (reading 'useContext')"
**Cause**: Vite's dependency pre-bundling cache gets corrupted during hot reload
**Solution**: `rm -rf node_modules/.vite && npm run dev -- --host`
**Lesson**: When multiple pages suddenly break with hook errors after HMR, clear Vite cache first
**Status**: ACTIVE - Promoted to Critical Rules

---

### [2026-01-18] [PATTERN] Vote Sound Pitch Variation
**Problem**: Vote sounds become repetitive and annoying
**Solution**: Random pitch variation makes sounds more satisfying
**Files**: `src/systems/audio/SoundManager.ts`
**Code**:
```typescript
instance.audio.playbackRate = pitchShift * (1 + (Math.random() * 2 - 1) * pitchVariation);
// pitchVariation: 0.15-0.2 (±15-20%)
// pitchShift: 1.1 for positive sounds, 0.95 for negative
```
**Status**: ACTIVE

---

### [2026-01-18] [PATTERN] Persistent State Across Navigation
**Problem**: Game balance (donuts/poops) resets when navigating away
**Solution**: localStorage with useState initializer pattern
**Files**: `src/pages/GamesHub.tsx`
**Code**:
```typescript
const [balance, setBalance] = useState(() => {
  const saved = localStorage.getItem('key');
  return saved !== null ? parseInt(saved, 10) : defaultValue;
});
useEffect(() => {
  localStorage.setItem('key', String(balance));
}, [balance]);
```
**Status**: ACTIVE

---

### [2026-01-14] [PATTERN] Query Invalidation After Async Load
**Problem**: BigPulp shows "No sales available" after page load
**Cause**: TanStack Query caches empty array, sync completes later with 750+ sales
**Solution**: Invalidate queries after sync completes
**Files**: `src/providers/SalesProvider.tsx`
**Code**:
```typescript
// After sync completes
queryClient.invalidateQueries({ queryKey: ['bigPulp'] });
```
**Status**: ACTIVE

---

### [2026-01-14] [GOTCHA] CAT Token Rates Must Run After Sync
**Problem**: `fixSuspiciousSales()` wasn't correcting bad conversions
**Cause**: Function ran before sync completed
**Solution**: Ensure it runs AFTER `syncDexieSales()` completes
**Status**: ACTIVE - Consolidated to api-patterns.md

---

### [2026-01-14] [DECISION] Git Branches Not Folders
**Problem**: Had two folders (`wojak-ink-mobile`, `wojak-ink-redesign`) causing confusion
**Solution**: Use git branches: `git checkout -b experiment`
**Lesson**: One folder, multiple branches = the git way
**Status**: ACTIVE - Promoted to CLAUDE.md

---

## Archived Learnings

### [2026-01-14] [BUG] Old localStorage Currency Issue
**Status**: ARCHIVED - Replaced by server-side currency (FIX-20, ADR-0003)

---

### [2026-01-14] [PATTERN] CAT Token Price Fixes
**Status**: ARCHIVED - Consolidated to `.claude/patterns/api-patterns.md`
Original content: Fixed SPROUT, PIZZA, G4M token conversion rates, added `fixSuspiciousSales()` auto-correction

---

### [2026-01-14] [PATTERN] NFT Naming from Metadata
**Status**: ARCHIVED - Consolidated to `.claude/patterns/api-patterns.md`
Original content: NFT names come from "Base" attribute in metadata, use `getNftName()` helper

---

### [2026-01-14] [PATTERN] Context Management System
**Status**: ARCHIVED - Promoted to CLAUDE.md Knowledge Management section
Original content: Created automatic learnings capture system at 7% context

---

### [2026-01-14] [PATTERN] Context7 Plugin
**Status**: ARCHIVED - Now part of standard workflow
Original content: Use `/docs [library]` for live documentation

---

### [2026-01-14] [PATTERN] Custom Skills Created
**Status**: ARCHIVED - Listed in CLAUDE.md Custom Skills table
Original content: /deploy, /dev, /sync-sales, /add-token, /status, /analyze

---

<!-- Add new learnings above the Archived section -->
