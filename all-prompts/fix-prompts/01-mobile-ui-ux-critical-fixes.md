# Mobile UI/UX Critical Fixes

## Priority: CRITICAL
These issues make games completely unplayable on mobile devices.

---

## Overview of Issues Found

### 🚨 CRITICAL: Games Rendering as Black Screen
The following games render as **completely black** on narrow viewports:
- Color Reaction (`/media/games/color-reaction`)
- 2048 Merge (`/media/games/merge-2048`)
- Orange Wordle (`/media/games/wordle`)

**Root Cause**: These games are likely using fixed pixel dimensions or absolute positioning that doesn't account for narrow viewports. When the container width is too small, the game canvas/content gets pushed off-screen or collapses to 0 width.

### 🔴 HIGH: Stats Panel Blocking Gameplay
Games with side stats panels (SCORE, LEVEL, TIME, etc.) consume **30-40% of screen width** on mobile:
- Orange Stack - Left panel with LEVEL, PROGRESS, SCORE
- Memory Match - Left panel with ROUND, SCORE, TIME, PAIRS
- Wojak Runner - Left panel with SCORE, BEST, SPEED, DISTANCE
- Orange Pong - Similar layout issues

**The Problem**: On a 390px wide phone screen, a 120-140px stats panel leaves only ~250px for gameplay, making games nearly unplayable.

### 🟡 MEDIUM: Dev Panel Visible in Production
Memory Match shows a **DEV panel** with numbered buttons (1-17) on the right side of the screen. This debug UI should be hidden in production.

### 🟡 MEDIUM: Bottom Navigation Overlapping Games
The app's bottom navigation bar overlaps the game area, cutting off the bottom of games like:
- Orange Juggle
- Wojak Runner

### 🟡 MEDIUM: UI Elements Bleeding Through
Orange Juggle has a pink/red element bleeding through on the left edge, suggesting z-index or overflow issues.

---

## Implementation Tasks

### Task 1: Fix Black Screen Games (Color Reaction, 2048, Wordle)

**Files to check/modify:**
- `src/games/ColorReaction/ColorReaction.tsx`
- `src/games/ColorReaction/ColorReaction.game.css`
- `src/games/Orange2048/Orange2048.tsx`
- `src/games/Orange2048/Orange2048.game.css`
- `src/games/OrangeWordle/` (find the folder and files)

**What to fix:**
1. Find any fixed width/height values that don't have mobile fallbacks
2. Add `min-width` and `min-height` constraints
3. Ensure game containers use `100%` width on mobile with proper max constraints
4. Check if games use canvas - canvas dimensions need to be responsive
5. Add CSS media queries for viewports under 768px

**Pattern to look for:**
```css
/* BAD - Fixed dimensions */
.game-container {
  width: 800px;
  height: 600px;
}

/* GOOD - Responsive with mobile support */
.game-container {
  width: 100%;
  max-width: 800px;
  height: auto;
  min-height: 400px;
  aspect-ratio: 4/3; /* Or use JS to calculate */
}

@media (max-width: 768px) {
  .game-container {
    width: 100%;
    height: 100%;
  }
}
```

---

### Task 2: Mobile-First Stats Panel Layout

**The Solution**: On mobile, move stats from side panel to a **compact horizontal HUD at the top** of the game.

**Files to modify:**
- `src/games/OrangeStack/OrangeStack.game.css`
- `src/games/MemoryMatch/MemoryMatch.game.css`
- `src/games/WojakRunner/WojakRunner.game.css`
- `src/games/OrangePong/OrangePong.game.css`

**Each game's TSX file** needs conditional rendering:
```tsx
// Desktop: Side panel layout
// Mobile: Horizontal HUD overlay

const isMobile = window.innerWidth <= 768;

{isMobile ? (
  <div className="mobile-hud">
    <div className="hud-stat">
      <span className="label">SCORE</span>
      <span className="value">{score}</span>
    </div>
    {/* ... other stats */}
  </div>
) : (
  <div className="stats-panel">
    {/* Full side panel */}
  </div>
)}
```

**CSS Pattern for Mobile HUD:**
```css
/* Mobile HUD - Horizontal stats at top */
.mobile-hud {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20px;
  border: 1px solid rgba(255, 107, 0, 0.4);
  z-index: 200;
  backdrop-filter: blur(10px);
}

.mobile-hud .hud-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.mobile-hud .label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

.mobile-hud .value {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  font-family: 'SF Mono', 'Monaco', monospace;
}

/* Hide side panel on mobile */
@media (max-width: 768px) {
  .stats-panel {
    display: none !important;
  }

  .game-layout {
    flex-direction: column;
  }

  .lightbox-wrapper {
    width: 100% !important;
    border-radius: 12px !important;
    border: 1px solid rgba(255, 107, 0, 0.4) !important;
  }
}
```

---

### Task 3: Hide Dev Panel in Production

**File to modify:**
- `src/games/MemoryMatch/MemoryMatch.tsx`
- `src/games/MemoryMatch/MemoryMatch.game.css`

**Option A - Environment-based:**
```tsx
// Only show in development
{process.env.NODE_ENV === 'development' && (
  <div className="dev-panel">
    {/* Dev buttons */}
  </div>
)}
```

**Option B - CSS Hide (quick fix):**
```css
/* Hide dev panel in production */
.dev-panel {
  display: none !important;
}

/* Or only show in development via a class */
body:not(.dev-mode) .dev-panel {
  display: none;
}
```

---

### Task 4: Fix Bottom Navigation Overlap

**The Issue**: App's bottom navigation bar (with Gallery, Generator, etc. icons) overlaps game content.

**Solution Options:**

**Option A - Safe area padding:**
```css
/* Add safe area at bottom of game containers */
.game-container {
  padding-bottom: env(safe-area-inset-bottom, 60px);
}

@media (max-width: 768px) {
  .lightbox-wrapper,
  .runner-container,
  .juggle-container {
    margin-bottom: 60px; /* Height of bottom nav */
  }
}
```

**Option B - Hide nav during gameplay:**
In the game component, emit an event or set a context to hide the bottom nav:
```tsx
useEffect(() => {
  if (gameState === 'playing') {
    document.body.classList.add('game-fullscreen');
  } else {
    document.body.classList.remove('game-fullscreen');
  }
  return () => document.body.classList.remove('game-fullscreen');
}, [gameState]);
```

```css
/* Hide bottom nav during fullscreen game */
body.game-fullscreen .bottom-navigation {
  display: none;
}

body.game-fullscreen .game-modal {
  bottom: 0 !important;
}
```

---

### Task 5: Fix Orange Juggle UI Bleeding

**File to check:**
- `src/games/OrangeJuggle/OrangeJuggle.tsx`
- `src/games/OrangeJuggle/OrangeJuggle.game.css`

**Look for:**
1. Elements with `position: absolute` that might be extending beyond container
2. Missing `overflow: hidden` on containers
3. Z-index issues where background elements show through

**Fix pattern:**
```css
.juggle-container {
  position: relative;
  overflow: hidden;
}

/* Ensure all child elements stay within bounds */
.juggle-container * {
  max-width: 100%;
}
```

---

## Mobile Viewport Testing Checklist

After implementing fixes, test on these viewport sizes:

| Device | Width | Height |
|--------|-------|--------|
| iPhone SE | 375px | 667px |
| iPhone 12/13 | 390px | 844px |
| iPhone 12 Pro Max | 428px | 926px |
| Samsung Galaxy S21 | 360px | 800px |
| iPad Mini | 768px | 1024px |

### Test Cases:
1. [ ] Game loads and is visible (not black screen)
2. [ ] All game controls are accessible and tappable
3. [ ] Score/stats are visible without blocking gameplay
4. [ ] Game area fills available space appropriately
5. [ ] Touch interactions work (tap, swipe)
6. [ ] No UI elements cut off at edges
7. [ ] Bottom navigation doesn't overlap game
8. [ ] Game over screen is fully visible and interactive

---

## Implementation Order

1. **FIRST**: Fix black screen games (Critical - users can't play at all)
2. **SECOND**: Convert stats panels to mobile HUD (High impact)
3. **THIRD**: Hide dev panel (Easy win)
4. **FOURTH**: Fix bottom nav overlap (Medium effort)
5. **FIFTH**: Fix UI bleeding issues (Polish)

---

## Notes for Claude Code

- Use `window.innerWidth` or a custom `useIsMobile()` hook to detect mobile
- Consider using CSS Container Queries for more robust responsive behavior
- Test thoroughly in Chrome DevTools with mobile emulation
- The game modal system may need modifications to support fullscreen mobile games
- Consider adding a "fullscreen" button for mobile users that uses the Fullscreen API
