# Phase 3: Mobile/Desktop Parity

**Goal:** All games work flawlessly on both mobile and desktop with consistent behavior.

**Time Estimate:** 1 hour

---

## Common Mobile Issues Found

1. **Touch events not using `touchstart`** - causes delayed response
2. **No `touch-action: none`** - causes accidental scrolling
3. **Fixed dimensions** - don't adapt to screen size
4. **No orientation change handling** - breaks layout on rotate
5. **No safe area support** - content hidden behind notch

---

## Task 3.1: Create Shared Touch Handling Hook

**Create file:** `/src/hooks/useGameTouch.ts`

```typescript
import { useCallback, useRef } from 'react';

interface TouchConfig {
  onTap?: (x: number, y: number) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number, dx: number, dy: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  swipeThreshold?: number;
  preventScroll?: boolean;
}

export function useGameTouch(config: TouchConfig) {
  const {
    onTap,
    onSwipe,
    onDragStart,
    onDrag,
    onDragEnd,
    swipeThreshold = Math.max(30, window.innerWidth * 0.08),
    preventScroll = true,
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    if (onDragStart) {
      isDraggingRef.current = true;
      onDragStart(touch.clientX, touch.clientY);
    }
  }, [onDragStart, preventScroll]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (isDraggingRef.current && onDrag) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      onDrag(touch.clientX, touch.clientY, dx, dy);
    }
  }, [onDrag, preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (preventScroll) e.preventDefault();
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    // Detect swipe vs tap
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (isDraggingRef.current && onDragEnd) {
      onDragEnd(touch.clientX, touch.clientY);
      isDraggingRef.current = false;
    } else if (absX > swipeThreshold || absY > swipeThreshold) {
      // Swipe detected
      if (onSwipe) {
        if (absX > absY) {
          onSwipe(dx > 0 ? 'right' : 'left');
        } else {
          onSwipe(dy > 0 ? 'down' : 'up');
        }
      }
    } else if (duration < 300 && onTap) {
      // Quick tap
      onTap(touch.clientX, touch.clientY);
    }

    touchStartRef.current = null;
  }, [onTap, onSwipe, onDragEnd, swipeThreshold, preventScroll]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
```

---

## Task 3.2: Create Viewport Hook

**Create file:** `/src/hooks/useGameViewport.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isLandscape: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
}

export function useGameViewport(): ViewportSize {
  const getSize = useCallback((): ViewportSize => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Get safe area insets from CSS
    const computedStyle = getComputedStyle(document.documentElement);
    const safeTop = parseInt(computedStyle.getPropertyValue('--sat') || '0', 10);
    const safeBottom = parseInt(computedStyle.getPropertyValue('--sab') || '0', 10);

    return {
      width,
      height,
      isMobile: width < 768,
      isLandscape: width > height,
      safeAreaTop: safeTop || 0,
      safeAreaBottom: safeBottom || 0,
    };
  }, []);

  const [size, setSize] = useState<ViewportSize>(getSize);

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Also listen for visual viewport changes (keyboard, etc.)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [getSize]);

  return size;
}
```

---

## Task 3.3: Add Safe Area CSS Variables

**Edit:** `/src/index.css`

Add at the beginning of the file (after imports):

```css
/* Safe area insets as CSS variables for JS access */
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);
}
```

---

## Task 3.4: Fix FlappyOrange Touch Handling

**File:** `/src/pages/FlappyOrange.tsx`

**Search current touch implementation:**
```bash
grep -n "onTouchStart\|onTouchEnd\|onClick" src/pages/FlappyOrange.tsx | head -10
```

**Issue:** If using `onTouchEnd` for jump, there's a delay.

**Fix:** Use `onTouchStart` for immediate response:

Find the game area touch handler and change:
```typescript
// BEFORE
onTouchEnd={() => jump()}

// AFTER
onTouchStart={(e) => {
  e.preventDefault();
  jump();
}}
```

Also add `touch-action: none` to the game container CSS.

---

## Task 3.5: Fix Orange2048 Swipe Handling

**File:** `/src/pages/Orange2048.tsx`

**Search current implementation:**
```bash
grep -n "touch\|swipe\|Touch" src/pages/Orange2048.tsx | head -15
```

**Replace with shared hook:**

```typescript
import { useGameTouch } from '@/hooks/useGameTouch';

// In component:
const touchHandlers = useGameTouch({
  onSwipe: (direction) => {
    if (gameState !== 'playing') return;
    handleMove(direction);
  },
  preventScroll: true,
});

// In JSX:
<div className="game-grid" {...touchHandlers}>
```

---

## Task 3.6: Fix WojakRunner Lane Switching

**File:** `/src/pages/WojakRunner.tsx`

**Search current implementation:**
```bash
grep -n "swipe\|touch\|lane" src/pages/WojakRunner.tsx | head -15
```

**Ensure:**
1. Swipe threshold is responsive to screen size
2. Touch events use `onTouchStart` for immediate response
3. `touch-action: none` is on game container

**Fix pattern:**
```typescript
import { useGameTouch } from '@/hooks/useGameTouch';

const touchHandlers = useGameTouch({
  onSwipe: (direction) => {
    if (direction === 'left' && lane > 0) setLane(lane - 1);
    if (direction === 'right' && lane < 2) setLane(lane + 1);
  },
});
```

---

## Task 3.7: Fix BlockPuzzle Piece Dragging

**File:** `/src/pages/BlockPuzzle.tsx`

**Search current implementation:**
```bash
grep -n "onTouchStart\|onTouchMove\|onTouchEnd\|drag" src/pages/BlockPuzzle.tsx | head -20
```

**Ensure:**
1. Touch coordinates are calculated relative to container, not window
2. Uses `getBoundingClientRect()` for accurate positioning
3. Prevents page scroll during drag

**Pattern:**
```typescript
const handleTouchMove = (e: React.TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = containerRef.current?.getBoundingClientRect();
  if (!rect) return;

  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  // Use x, y for piece positioning
};
```

---

## Task 3.8: Add Viewport Hook to All Games

**For each game file, add:**

```typescript
import { useGameViewport } from '@/hooks/useGameViewport';

// In component:
const { width, height, isMobile, isLandscape, safeAreaTop, safeAreaBottom } = useGameViewport();

// Use for dynamic sizing:
const gameHeight = height - safeAreaTop - safeAreaBottom - 100; // 100 for HUD
const gameWidth = isMobile ? width - 16 : Math.min(600, width - 32);
```

**Games to update:**
1. `/src/pages/BrickByBrick.tsx`
2. `/src/pages/MemoryMatch.tsx`
3. `/src/pages/FlappyOrange.tsx`
4. `/src/pages/WojakRunner.tsx`
5. `/src/pages/ColorReaction.tsx`
6. `/src/pages/Orange2048.tsx`
7. `/src/pages/BlockPuzzle.tsx`

---

## Task 3.9: Add Touch-Action CSS to All Game Containers

**Check each game's CSS for touch-action:**
```bash
grep -l "touch-action" src/pages/*.css
```

**Add to any missing game container:**
```css
.game-container {
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

---

## Task 3.10: Test Mobile on All Games

**Testing checklist for each game:**

**FlappyOrange:**
- [ ] Tap to flap responds immediately
- [ ] No page scroll while playing
- [ ] Fits screen on iPhone SE (375×667)
- [ ] Fits screen on iPhone 14 Pro (393×852)
- [ ] Rotation doesn't break layout

**BlockPuzzle:**
- [ ] Piece dragging works smoothly
- [ ] No page scroll during drag
- [ ] Grid fits on small screens
- [ ] Pieces fit in rack area

**BrickByBrick:**
- [ ] Tap to drop responds immediately
- [ ] Layout fits screen
- [ ] Stats visible without scrolling

**MemoryMatch:**
- [ ] Cards are touchable (min 44px)
- [ ] Grid doesn't overflow
- [ ] Timer visible

**WojakRunner:**
- [ ] Lane switching swipes work
- [ ] Jump/action taps work
- [ ] No accidental scrolling

**ColorReaction:**
- [ ] Circles are touchable
- [ ] Tap registers correctly
- [ ] Layout centered

**Orange2048:**
- [ ] Swipes in all 4 directions work
- [ ] No interference with page scroll
- [ ] Grid fits screen

---

## Verification After Phase 3

**Device testing matrix:**

| Device | Width | Height | Test All Games |
|--------|-------|--------|----------------|
| iPhone SE | 375 | 667 | [ ] |
| iPhone 12/13/14 | 390 | 844 | [ ] |
| iPhone Plus/Max | 428 | 926 | [ ] |
| iPad Mini | 744 | 1133 | [ ] |
| Desktop | 1920 | 1080 | [ ] |

**Use Chrome DevTools to emulate devices.**

**Checklist:**
- [ ] useGameTouch hook created
- [ ] useGameViewport hook created
- [ ] Safe area CSS variables added
- [ ] FlappyOrange touch fixed
- [ ] Orange2048 swipe fixed
- [ ] WojakRunner lane switching fixed
- [ ] BlockPuzzle dragging fixed
- [ ] All games use viewport hook
- [ ] All games have touch-action: none
- [ ] All games tested on mobile emulator
