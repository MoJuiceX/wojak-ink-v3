# Fix Black Screen Games (URGENT)

## Priority: P0 - CRITICAL

Three games render as completely black/empty on narrow viewports:
1. **Color Reaction** (`/media/games/color-reaction`)
2. **2048 Merge** (`/media/games/merge-2048`)
3. **Orange Wordle** (`/media/games/wordle`)

---

## Diagnosis Steps

For each game, check:

### 1. Find the game files
```bash
# Find all files for each game
find src/games -name "*ColorReaction*" -o -name "*color-reaction*"
find src/games -name "*2048*" -o -name "*Orange2048*"
find src/games -name "*Wordle*" -o -name "*wordle*"
```

### 2. Check for fixed dimensions

Look for these patterns in the TSX and CSS files:

**PROBLEMATIC:**
```css
.container {
  width: 800px;   /* Fixed width - will break on narrow screens */
  height: 600px;  /* Fixed height */
}
```

```tsx
<canvas width={800} height={600} />  // Fixed canvas dimensions
```

**ALSO CHECK:**
```css
.container {
  min-width: 500px;  /* Min-width larger than mobile screen */
}
```

### 3. Check for viewport calculations

Games using canvas or SVG might calculate dimensions based on container size. If the container collapses to 0, the game renders nothing.

---

## Fix Patterns

### Pattern A: CSS Container Fixes

**Before:**
```css
.color-reaction-container {
  width: 600px;
  height: 600px;
}
```

**After:**
```css
.color-reaction-container {
  width: 100%;
  max-width: 600px;
  height: auto;
  aspect-ratio: 1 / 1;  /* Square */
  min-width: 280px;     /* Minimum for usability */
  min-height: 280px;
}

@media (max-width: 768px) {
  .color-reaction-container {
    width: 100%;
    max-width: none;
    height: calc(100vh - 120px);  /* Full height minus header/nav */
    aspect-ratio: auto;
  }
}
```

### Pattern B: Canvas Responsiveness

**Before:**
```tsx
<canvas width={600} height={600} />
```

**After:**
```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });

useEffect(() => {
  const updateSize = () => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      // Use smaller dimension for square games
      const size = Math.min(clientWidth, clientHeight, 600);
      setCanvasSize({ width: size, height: size });
    }
  };

  updateSize();
  window.addEventListener('resize', updateSize);
  return () => window.removeEventListener('resize', updateSize);
}, []);

return (
  <div ref={containerRef} className="game-canvas-container">
    <canvas width={canvasSize.width} height={canvasSize.height} />
  </div>
);
```

### Pattern C: Grid/Flex Container Fixes

For 2048, the game likely uses a grid:

**Before:**
```css
.grid-container {
  width: 400px;
  height: 400px;
  display: grid;
  grid-template-columns: repeat(4, 100px);
}
```

**After:**
```css
.grid-container {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* Flexible columns */
  gap: 8px;
  padding: 8px;
}

@media (max-width: 768px) {
  .grid-container {
    max-width: calc(100vw - 24px);  /* Full width minus padding */
  }
}
```

---

## Game-Specific Fixes

### Color Reaction

This game likely has:
- A target color circle (large)
- A player color indicator
- Score/streak display

**Check for:**
- Fixed position elements that go off-screen
- Flex containers with no `flex-wrap`
- Absolute positioned elements without proper container

**Recommended layout for mobile:**
```css
.color-reaction-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 16px;
  box-sizing: border-box;
}

.target-circle {
  width: 60vw;
  height: 60vw;
  max-width: 300px;
  max-height: 300px;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .target-circle {
    width: 70vw;
    height: 70vw;
    max-width: 280px;
    max-height: 280px;
  }
}
```

### 2048 Merge

This game has:
- 4x4 grid of tiles
- Swipe/arrow key controls
- Score display

**The grid needs to be responsive:**
```css
.merge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 8px;
}

.merge-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 5vw, 32px);  /* Responsive font */
  font-weight: 700;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .merge-grid {
    max-width: calc(100vw - 32px);
  }

  .merge-tile {
    font-size: clamp(14px, 6vw, 28px);
  }
}
```

### Orange Wordle

This game has:
- 5x6 letter grid
- On-screen keyboard
- Both need to fit on mobile

**Key fixes:**
```css
.wordle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 16px;
  gap: 16px;
  box-sizing: border-box;
}

.wordle-grid {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 4px;
  width: 100%;
  max-width: 350px;
  flex: 0 1 auto;
}

.wordle-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.wordle-cell {
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(18px, 5vw, 32px);
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.wordle-keyboard {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  max-width: 500px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.keyboard-key {
  min-width: 28px;
  height: 48px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .wordle-container {
    padding: 8px;
    gap: 12px;
  }

  .wordle-grid {
    max-width: 280px;
  }

  .keyboard-key {
    min-width: 24px;
    height: 44px;
    padding: 0 6px;
    font-size: 12px;
  }
}

@media (max-width: 380px) {
  .keyboard-key {
    min-width: 20px;
    height: 40px;
    padding: 0 4px;
    font-size: 11px;
  }
}
```

---

## Quick Debugging Steps

If a game is black, open Chrome DevTools and:

1. **Inspect the container:**
   - Is it 0 width or 0 height?
   - Is `display: none` applied?
   - Is `opacity: 0` applied?

2. **Check computed styles:**
   - Look for `width: 0` or `height: 0`
   - Look for elements positioned off-screen (`left: -9999px`)

3. **Check parent containers:**
   - Sometimes a parent collapses, hiding all children

4. **Console check:**
   - Are there JavaScript errors preventing render?
   - Is the game state stuck in a loading state?

---

## Verification

After fixing, test each game at these widths:
- 375px (iPhone SE)
- 390px (iPhone 12)
- 360px (Small Android)
- 768px (Tablet)

Confirm:
- [ ] Game is visible (not black)
- [ ] Game fills available space appropriately
- [ ] Game is playable (controls work)
- [ ] Text/numbers are readable
- [ ] No horizontal scroll
