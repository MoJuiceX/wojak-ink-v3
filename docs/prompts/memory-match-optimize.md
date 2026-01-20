# MemoryMatch Performance & Juice Audit

**Game:** MemoryMatch (Memory card matching game with NFT images)
**File:** `src/pages/MemoryMatch.tsx`
**Lines:** ~1482 lines

## Executive Summary

MemoryMatch is a DOM-based card game that is well-optimized for its use case. Card flips use CSS 3D transforms which are GPU-accelerated. The game uses refs to prevent race conditions with rapid clicks and has a buffered input queue. Main performance concerns are DOM manipulation for animations and the image preloading strategy. Juice implementation is excellent.

---

## Performance Issues

### MODERATE

1. **DOM Queries for Card Animations**
   ```typescript
   // Lines 548-554, 571-577: Direct DOM queries for animations
   const addCardAnimation = useCallback((cardId: number, className: string, duration: number) => {
     const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
     if (cardEl) {
       cardEl.classList.add(className);
       setTimeout(() => cardEl.classList.remove(className), duration);
     }
   }, []);
   ```

   **Fix:** Use refs map or React state for animations instead of direct DOM manipulation.

2. **Card DOM Queries for Anticipation States**
   ```typescript
   // Lines 911-946: Queries all unmatched cards every effect run
   const unmatchedCards = document.querySelectorAll('.mm-card:not(.matched)');
   unmatchedCards.forEach(card => {
     card.classList.remove('anticipation-1', 'anticipation-2', 'near-win-highlight', 'struggle-shimmer');
   });
   ```

   **Fix:** Use React state for anticipation classes, applied via className in JSX.

3. **Image Preloading Could Be Parallelized Better**
   ```typescript
   // Lines 326-340: Sequential Promise.all for unique images
   return Promise.all(
     uniqueImages.map(src => {
       return new Promise<void>((resolve) => {
         const img = new Image();
         img.onload = () => resolve();
         img.onerror = () => resolve();
         img.src = src;
       });
     })
   );
   ```

   This is fine, but could add connection limit handling for slow networks.

4. **Share Image Generation on Main Thread**
   ```typescript
   // Lines 957-1068: Canvas operations for share image
   const generateShareImage = useCallback(async () => {
     // ... extensive canvas drawing
   });
   ```

   **Fix:** Consider OffscreenCanvas or Web Worker for large canvas operations.

### MINOR

5. **Multiple setTimeout for Visual Feedback**
   ```typescript
   // Various: Many setTimeout calls for animations
   setTimeout(() => addCardAnimation(cardId, 'flip-landed', 120), 250);
   setTimeout(() => showEpicCallout('⚡ SPEED BONUS!'), 400);
   ```

   This is acceptable for the use case, but could consolidate into animation queue.

6. **Grid Layout Calculation Every Render**
   ```typescript
   // Lines 1321-1365: Calculate grid dimensions inside render
   const gridMap: Record<number, { cols: number; rows: number }> = { ... };
   const optimalCardSize = Math.max(40, Math.min(cardSizeByWidth, cardSizeByHeight, 140));
   ```

   **Fix:** Memoize grid calculations with useMemo based on card count.

---

## Juice Assessment

### Already Implemented (Excellent!)

- **Card Flip Animations:** CSS 3D transforms with smooth transitions
- **Match Pop Animation:** Scale/glow effect on successful match
- **Mismatch Wobble:** Shake animation on failed match
- **Streak System:** Escalating combo feedback
- **Fast Match Bonus:** Extra celebration for quick matches
- **Near-Win Shimmer:** Visual highlight when 1 pair remains
- **Timeline Celebration:** Progress bar pulses on match
- **Screen Shake:** Variable intensity based on streak
- **Freeze Frames:** Brief pause for impact on match
- **Theme-Specific Callouts:** NFT Base attribute-aware messages
- **Progress Milestones:** "Halfway!", "Almost There!" callouts
- **Time Urgency System:** Visual + audio warnings for low time
- **Share Image Generator:** Canvas-based score card

### Missing Juice (Minor)

1. **No Card Hover Preview**
   - On hover, could show subtle glow or scale-up to indicate interactivity.

2. **No Time Bonus Visual**
   - When completing with significant time left, could show "+X seconds saved!" bonus.

3. **No Perfect Round Celebration**
   - Completing a round with zero mismatches could have extra celebration.

4. **No Difficulty Indicator**
   - Higher rounds with similar-looking NFT filters could show "HARD MODE" badge.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/memory-match-optimize.md thoroughly, then review and optimize src/pages/MemoryMatch.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Replace DOM queries for card animations with React state/refs approach
2. Use React state for anticipation classes instead of querySelectorAll
3. Memoize grid layout calculations with useMemo (lines 1321-1365)
4. Consider OffscreenCanvas for share image generation (non-blocking)
5. Add connection-aware image preloading (limit concurrent requests on slow connections)

JUICE (Priority 2):
1. Add subtle card hover effect (scale to 1.02, slight glow on hover for unflipped cards)
2. Add time bonus celebration when completing with 50%+ time remaining
3. Add "PERFECT MEMORY!" extra celebration for completing round with 0 mismatches
4. Add "HARD MODE" badge indicator for rounds with baseFilter (similar NFTs)
5. Add card flip sound pitch variation based on streak (higher pitch for longer streaks)

Target: Maintain smooth 60 FPS card flips on large 9x6 grids (Round 10+)
```

---

## Implementation Priority

1. **Medium Impact, Medium:** Replace DOM queries with React state for animations
2. **Low Impact, Easy:** Memoize grid calculations
3. **Low Impact, Easy:** Add card hover effect
4. **Low Impact, Easy:** Add time bonus celebration
5. **Low Impact, Easy:** Add perfect round celebration
