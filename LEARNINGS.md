# Learnings Log

<!-- Last consolidated: 2026-01-18 -->
<!-- Active entries: 14 (target: <50) -->
<!-- Health check: .claude/scripts/knowledge-health.sh -->

## Format Guide
Entry format: `### [DATE] [CATEGORY] [PRIORITY] Title`
- **Categories**: BUG, PATTERN, GOTCHA, API, PERF, DECISION
- **Priority**: P0=critical, P1=important, P2=nice-to-know
- **Status**: ACTIVE | STALE | ARCHIVED
- **ID**: LEARN-YYYY-MM-DD-NNN (for cross-referencing)

### Event-Driven Triggers
- **>30 active entries** → Consolidate before adding more
- **Entry >90 days old** → Mark STALE, review for archival
- **3+ related entries** → Consolidate into pattern file

---

## Active Learnings

### [2026-01-18] [BUG] [P1] Game Navigation - Back Button Goes to Gallery
**ID**: LEARN-2026-01-18-001
**Problem**: Clicking "Back to Games" in 6 games navigated to gallery instead of games hub
**Cause**: Games used `window.history.back()` which goes to previous page in history
**Solution**: Replace with `useNavigate` from react-router-dom, navigate to `/games` explicitly
**Files**:
- `src/pages/CitrusDrop.tsx`
- `src/pages/BlockPuzzle.tsx`
- `src/pages/BrickBreaker.tsx`
- `src/pages/FlappyOrange.tsx`
- `src/pages/OrangeSnake.tsx`
- `src/pages/WojakWhack.tsx`
**Code**:
```typescript
// WRONG - goes to whatever page user came from
window.history.back()

// RIGHT - always goes to games hub
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/games');
// Or fallback: window.location.href = '/games';
```
**Status**: ACTIVE

---

### [2026-01-18] [PATTERN] [P1] Game Over UI - Leaderboard Overlay Pattern
**ID**: LEARN-2026-01-18-002
**Problem**:
1. Leaderboard sliding in pushed content around (bad UX)
2. "Back to Games" button too close to tap area (accidental clicks)
**Solution**:
1. Leaderboard opens as centered modal overlay, doesn't shift content
2. Click outside to close
3. "Back to Games" positioned in bottom-right corner (safe area)
**Files**: `src/pages/FlappyOrange.tsx`, `src/pages/FlappyOrange.css`
**Code**:
```tsx
{/* Leaderboard - overlays on top, doesn't shift content */}
{showLeaderboardPanel && (
  <div className="leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
    <div className="leaderboard-panel" onClick={e => e.stopPropagation()}>
      {/* content */}
    </div>
  </div>
)}

{/* Back to Games - in safe area (bottom right) */}
<button className="back-to-games-btn" style={{ position: 'absolute', bottom: 20, right: 20 }}>
  Back to Games
</button>
```
**Status**: ACTIVE - Should be applied to all games for consistency

---

### [2026-01-18] [PATTERN] Flappy Orange Difficulty Tuning
**Problem**: Game was too hard, users died immediately
**Solution**: Tuned physics for 10-15 seconds of easy play before difficulty ramps
**Files**: `src/pages/FlappyOrange.tsx`
**Code**:
```typescript
const PHYSICS = {
  GRAVITY: 0.2,            // Very floaty
  JUMP_VELOCITY: -6,       // Gentle jump
  MAX_FALL_SPEED: 5,       // Slow fall
  ROTATION_SPEED: 0.04,    // Subtle rotation
};

const BIRD_RADIUS = 14;    // Forgiving hitbox
const PIPE_GAP = 220;      // Wide gap
const PIPE_SPACING = 320;  // Lots of time between pipes

// Speed: no increase for first 5 pipes (~10-15 sec easy intro)
const speed = 1.5 + Math.max(0, Math.floor((score - 5) / 20)) * 0.15;

// First pipe spawns far away (3 sec of free flying)
x: isFirst ? CANVAS_WIDTH + PIPE_WIDTH + 300 : CANVAS_WIDTH + PIPE_WIDTH
```
**Status**: ACTIVE

---

### [2026-01-18] [DECISION] Knowledge Flywheel v2.0 Implementation
**Problem**: Flywheel was partially implemented - CLAUDE.md referenced pattern files that didn't exist
**Solution**: Created all missing directories and files
**Created**:
```
.claude/patterns/api-patterns.md      # API rates, CAT tokens, caching
.claude/patterns/ui-patterns.md       # Animations, sounds, game UI
.claude/patterns/database-patterns.md # D1 queries, migrations
.claude/patterns/deployment-patterns.md # Cloudflare, Vite, git
.claude/rules/.gitkeep
docs/adr/template.md
docs/adr/0001-cloudflare-d1-database.md
docs/adr/0002-clerk-authentication.md
docs/adr/0003-server-side-currency.md
docs/archive/.gitkeep
```
**Status**: ACTIVE - Flywheel now fully operational

---

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

### [2026-01-18] [BUG] [P0] Vite Cache Corruption - Hook Errors After HMR
**ID**: LEARN-2026-01-18-003
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
