# Orange2048 Performance & Juice Audit

**Game:** Orange2048 (2048 puzzle with fruit theme)
**File:** `src/pages/Orange2048.tsx`
**Lines:** ~416 lines

## Executive Summary

Orange2048 is a simple, well-structured 2048 clone using DOM rendering. At ~416 lines, it's one of the smaller games. Performance is not a major concern for this grid-based puzzle game since there are no real-time animations. The juice implementation is basic but functional. This game has the most room for juice improvements.

---

## Performance Issues

### MINOR (Game is lightweight)

1. **Grid Rotation for Move Logic**
   ```typescript
   // Lines 126-138: Creates new grids for rotation
   const rotateGrid = (g: Grid, times: number): Grid => {
     let result = g;
     for (let i = 0; i < times; i++) {
       const rotated: Grid = createEmptyGrid();
       for (let row = 0; row < GRID_SIZE; row++) {
         for (let col = 0; col < GRID_SIZE; col++) {
           rotated[col][GRID_SIZE - 1 - row] = result[row][col];
         }
       }
       result = rotated;
     }
     return result;
   };
   ```

   **Fix:** Pre-compute rotation transforms or use index mapping instead of creating new arrays.

2. **Grid State Creates New Arrays**
   ```typescript
   // Line 122: Deep copy on every move
   let newGrid = grid.map(r => [...r]);
   ```

   This is fine for a 4x4 grid but could use immer or structural sharing.

3. **No Touch Gesture Optimization**
   ```typescript
   // Lines 247-265: Touch handling
   const handleTouchEnd = (e: React.TouchEvent) => {
     if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
     // ...
   };
   ```

   **Fix:** Use passive: true for touch listeners and consider using touch-action CSS.

---

## Juice Assessment

### Already Implemented (Basic)

- **Shockwave/Sparks:** On high-value merges (128+)
- **Screen Shake:** On 256+ tiles
- **Epic Callouts:** Tile value callouts
- **Confetti:** On 512+ and win
- **Score Popups:** On merge
- **Floating Emojis:** Tile emoji on high merges
- **Tile Emoji Progression:** Visual fruit progression

### Missing Juice (Significant Opportunity)

1. **No Tile Slide Animation**
   - Tiles snap to new positions instantly. Add CSS transition for sliding.

2. **No Tile Merge Animation**
   - When tiles merge, no pop/scale effect. Add merge pop animation.

3. **No New Tile Spawn Animation**
   - New tiles appear without animation. Add scale-up or fade-in.

4. **No Move Sound Feedback**
   - No audio for successful moves. Add slide sound.

5. **No Combo for Fast Merges**
   - Multiple merges in one move could trigger combo callout.

6. **No Near-Loss Warning**
   - When board is almost full with no moves, add danger visual.

7. **No Tile Squash on Move**
   - Tiles could squash slightly in direction of movement.

8. **No High-Value Tile Glow**
   - Higher value tiles (512+) could have animated glow effect.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/orange-2048-optimize.md thoroughly, then REFACTOR src/pages/Orange2048.tsx. This game needs significant juice improvements.

PERFORMANCE (Priority 2 - game is already lightweight):
1. Add passive: true to touch event listeners
2. Add touch-action: none CSS to prevent scroll interference
3. Optimize grid rotation with index mapping instead of array creation

JUICE (Priority 1 - MAJOR IMPROVEMENTS NEEDED):
1. Add tile slide animation:
   - Track tile positions with unique IDs
   - Use CSS transform transitions (200ms ease-out)
   - Animate from previous position to new position

2. Add tile merge pop animation:
   - Scale to 1.2 then back to 1.0 (150ms)
   - Add brief color flash on merge

3. Add new tile spawn animation:
   - Scale from 0 to 1.0 with bounce easing (200ms)
   - Slight rotation wobble on spawn

4. Add audio feedback:
   - Slide sound on valid move
   - Merge pop sound (pitch based on tile value)
   - New tile spawn "bloop" sound
   - Game over descending tone

5. Add multi-merge combo system:
   - Track merges per move
   - Show "DOUBLE MERGE!", "TRIPLE!" callouts
   - Extra points for combos

6. Add near-loss danger mode:
   - When <4 empty cells and no obvious merges, add red vignette pulse
   - Heartbeat audio warning

7. Add high-value tile effects:
   - 512+ tiles get animated gradient glow
   - 1024+ tiles get particle aura
   - 2048 tile gets rainbow shimmer

8. Add tile squash in move direction:
   - Brief 0.9x scale in movement axis
   - Return to normal after slide completes

Target: Transform from basic puzzle to premium juicy experience while maintaining snappy input response
```

---

## Implementation Priority

1. **High Impact, Medium:** Add tile slide animations (CSS transitions)
2. **High Impact, Easy:** Add merge pop animation
3. **High Impact, Easy:** Add spawn animation
4. **Medium Impact, Easy:** Add audio feedback
5. **Medium Impact, Easy:** Add combo system for multi-merges
6. **Low Impact, Easy:** Add danger mode warning
7. **Low Impact, Medium:** Add high-value tile effects
