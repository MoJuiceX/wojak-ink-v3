# SPEC 28: Arcade Frame Overlay for Game Lightbox

## Goal

Wrap games in an arcade cabinet frame overlay so users feel like they're playing in a real arcade. Support both standard games (14 games) and the extra-wide Memory Match game.

---

## Quick Reference

| Item | Value |
|------|-------|
| Frame PNG | `/public/img/arcade-frame.png` ✅ EXISTS |
| PNG Size | 1400 × 900px |
| Screen Left | 15.50% (217px) |
| Screen Top | 7.78% (70px) |
| Screen Width | 69.14% (968px) |
| Screen Height | 86.67% (780px) |
| Screen Ratio | 1.24:1 (nearly square) |

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| ✅ EXISTS | `/public/img/arcade-frame.png` | Main frame PNG (already uploaded) |
| CREATE | `/src/components/ArcadeFrame.tsx` | Arcade frame wrapper component |
| CREATE | `/src/components/ArcadeFrame.css` | Styles for arcade frame |
| CREATE | `/public/img/arcade-edge-top.png` | Top edge for wide games |
| CREATE | `/public/img/arcade-edge-bottom.png` | Bottom edge for wide games |
| CREATE | `/public/img/arcade-edge-left.png` | Left edge for wide games |
| CREATE | `/public/img/arcade-edge-right.png` | Right edge for wide games |
| MODIFY | Game lightbox component | Wrap games with ArcadeFrame |

---

## Phase 1: Standard Frame Component

This handles **14 of 15 games** that fit within the standard frame.

### Component Code

```tsx
// src/components/ArcadeFrame.tsx
import './ArcadeFrame.css';

interface ArcadeFrameProps {
  children: React.ReactNode;
  variant?: 'standard' | 'wide';
}

export function ArcadeFrame({ children, variant = 'standard' }: ArcadeFrameProps) {
  if (variant === 'wide') {
    return <ArcadeFrameWide>{children}</ArcadeFrameWide>;
  }

  return (
    <div className="arcade-frame-container">
      {/* Game renders in the screen area */}
      <div className="arcade-screen">
        {children}
      </div>

      {/* Frame PNG overlays on top */}
      <img
        src="/img/arcade-frame.png"
        alt=""
        className="arcade-frame-overlay"
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}
```

### CSS Code

```css
/* src/components/ArcadeFrame.css */

/* ============================================
   STANDARD FRAME (14 games)
   ============================================ */

.arcade-frame-container {
  position: relative;
  width: 100%;
  max-width: 1400px;
  aspect-ratio: 1400 / 900;
  margin: 0 auto;
}

/* Screen area - EXACT position from PNG measurements */
.arcade-screen {
  position: absolute;
  left: 15.50%;
  top: 7.78%;
  width: 69.14%;
  height: 86.67%;
  overflow: hidden;
  background: #000;
  border-radius: 2px;
}

/* Game content fills screen, maintains aspect ratio */
.arcade-screen > * {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.arcade-screen iframe,
.arcade-screen canvas {
  border: none;
  display: block;
  width: 100%;
  height: 100%;
}

/* Frame PNG on top, clicks pass through */
.arcade-frame-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
```

---

## Phase 2: Wide Frame for Memory Match

Memory Match is wider than the standard frame. Use **4 edge pieces** that can stretch to accommodate any width.

### Step 1: Create Edge Images in Photoshop

From the existing `arcade-frame.png`, slice these 4 edges:

| File | What to slice | Size |
|------|---------------|------|
| `arcade-edge-top.png` | Top metal bezel with screws | 1400 × 70px (full width, top 70px) |
| `arcade-edge-bottom.png` | Bottom metal bezel | 1400 × 50px (full width, bottom 50px) |
| `arcade-edge-left.png` | Red cabinet + left bezel | 217 × 900px (left side, full height) |
| `arcade-edge-right.png` | Wood panel + buttons | 215 × 900px (right side, full height) |

### Step 2: Wide Frame Component

```tsx
// Add to src/components/ArcadeFrame.tsx

function ArcadeFrameWide({ children }: { children: React.ReactNode }) {
  return (
    <div className="arcade-frame-wide">
      {/* Edge pieces */}
      <img
        src="/img/arcade-edge-top.png"
        className="arcade-edge arcade-edge-top"
        alt=""
        aria-hidden="true"
      />
      <img
        src="/img/arcade-edge-bottom.png"
        className="arcade-edge arcade-edge-bottom"
        alt=""
        aria-hidden="true"
      />
      <img
        src="/img/arcade-edge-left.png"
        className="arcade-edge arcade-edge-left"
        alt=""
        aria-hidden="true"
      />
      <img
        src="/img/arcade-edge-right.png"
        className="arcade-edge arcade-edge-right"
        alt=""
        aria-hidden="true"
      />

      {/* Game content in center */}
      <div className="arcade-screen-wide">
        {children}
      </div>
    </div>
  );
}
```

### Wide Frame CSS

```css
/* ============================================
   WIDE FRAME (Memory Match)
   ============================================ */

.arcade-frame-wide {
  position: relative;
  width: 100%;
  max-width: 1600px;
  min-height: 500px;
  margin: 0 auto;
}

.arcade-edge {
  position: absolute;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}

/* Top edge stretches horizontally */
.arcade-edge-top {
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 70px;
  object-fit: fill;
}

/* Bottom edge stretches horizontally */
.arcade-edge-bottom {
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 50px;
  object-fit: fill;
}

/* Left edge - fixed width, full height */
.arcade-edge-left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 217px;
  height: 100%;
  object-fit: fill;
}

/* Right edge - fixed width, full height */
.arcade-edge-right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 215px;
  height: 100%;
  object-fit: fill;
}

/* Screen area - inset from edges */
.arcade-screen-wide {
  position: absolute;
  top: 70px;
  bottom: 50px;
  left: 217px;
  right: 215px;
  background: #000;
  overflow: hidden;
}

.arcade-screen-wide > * {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

---

## Game Configuration

```typescript
// src/config/gameFrames.ts

// Only Memory Match needs the wide variant
export const WIDE_FRAME_GAMES = ['memory-match'];

export function getFrameVariant(gameSlug: string): 'standard' | 'wide' {
  return WIDE_FRAME_GAMES.includes(gameSlug) ? 'wide' : 'standard';
}
```

---

## Integration with Lightbox

```tsx
// In your game lightbox/modal component

import { ArcadeFrame } from '@/components/ArcadeFrame';
import { getFrameVariant } from '@/config/gameFrames';

interface GameLightboxProps {
  gameSlug: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function GameLightbox({ gameSlug, children, isOpen, onClose }: GameLightboxProps) {
  if (!isOpen) return null;

  const variant = getFrameVariant(gameSlug);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>

        <ArcadeFrame variant={variant}>
          {children}
        </ArcadeFrame>

        <button className="lightbox-close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
```

---

## Visual Diagrams

### Standard Frame (14 games)

```
┌──────────────────────────────────────────────────┐
│  ●                  BEZEL                    ●   │
│ ╔══╗ ┌────────────────────────────────┐ ┌─────┐  │
│ ║R ║ │                                │ │ 🔴  │  │
│ ║E ║ │                                │ │     │  │
│ ║D ║ │      GAME SCREEN AREA          │ │ 🔵  │  │
│ ║  ║ │      (object-fit: contain)     │ │     │  │
│ ║C ║ │                                │ │ 🟢  │  │
│ ║A ║ │      Portrait games:           │ │     │  │
│ ║B ║ │      centered with             │ │ 🔵  │  │
│ ║  ║ │      black bars on sides       │ │     │  │
│ ╚══╝ └────────────────────────────────┘ │ 🔴  │  │
│  ●                  BEZEL                └─────┘  │
└──────────────────────────────────────────────────┘
          1400px × 900px frame
```

### Wide Frame (Memory Match)

```
┌──────────────────────────────────────────────────────────────────┐
│ ●                    TOP EDGE (stretches)                    ●   │
├────┬──────────────────────────────────────────────────────┬─────┤
│    │                                                      │     │
│ L  │                                                      │  R  │
│ E  │              MEMORY MATCH GAME                       │  I  │
│ F  │              (full width, no letterboxing)           │  G  │
│ T  │                                                      │  H  │
│    │                                                      │  T  │
│    │                                                      │     │
├────┴──────────────────────────────────────────────────────┴─────┤
│                      BOTTOM EDGE (stretches)                     │
└──────────────────────────────────────────────────────────────────┘
          Up to 1600px wide
```

---

## Implementation Checklist

### Phase 1 (Standard Frame)
- [ ] Create `/src/components/ArcadeFrame.tsx`
- [ ] Create `/src/components/ArcadeFrame.css`
- [ ] Verify frame displays with existing `arcade-frame.png`
- [ ] Test with Block Puzzle, 2048, Flappy Orange
- [ ] Confirm pointer-events pass through to game
- [ ] Confirm games are letterboxed correctly

### Phase 2 (Wide Frame for Memory Match)
- [ ] Create edge images in Photoshop:
  - [ ] `arcade-edge-top.png` (1400 × 70)
  - [ ] `arcade-edge-bottom.png` (1400 × 50)
  - [ ] `arcade-edge-left.png` (217 × 900)
  - [ ] `arcade-edge-right.png` (215 × 900)
- [ ] Add `ArcadeFrameWide` component
- [ ] Add wide frame CSS
- [ ] Create `/src/config/gameFrames.ts`
- [ ] Test Memory Match with wide frame
- [ ] Verify edges stretch correctly

### Integration
- [ ] Modify existing lightbox to use `ArcadeFrame`
- [ ] Pass correct `variant` prop based on game slug
- [ ] Test all 15 games
- [ ] Test on mobile (frame should scale down)

---

## Important Notes

1. **PNG is already uploaded** - No need to create `arcade-frame.png`

2. **Coordinates are EXACT** - Measured programmatically from the PNG:
   - Left: 15.50%
   - Top: 7.78%
   - Width: 69.14%
   - Height: 86.67%

3. **`pointer-events: none`** - Critical! Without this, users can't click the game

4. **`object-fit: contain`** - Games maintain their aspect ratio and get letterboxed if needed

5. **Memory Match ONLY** - Only this game needs the wide variant. All others use standard.

6. **Edge images for wide frame** - Must be created in Photoshop by slicing the main frame
