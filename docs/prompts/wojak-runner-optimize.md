# WojakRunner Performance & Juice Audit

**Game:** WojakRunner (Endless runner with lane switching)
**File:** `src/pages/WojakRunner.tsx`
**Lines:** ~715 lines

## Executive Summary

WojakRunner is a DOM-based endless runner with lane-switching mechanics. The game uses useState for game objects which causes re-renders every frame. The juice system is decent with visual effects integration but could be enhanced.

---

## Performance Issues

### CRITICAL

1. **useState for Obstacles and Collectibles (Re-renders Every Frame)**
   ```typescript
   // Lines 77-78: These cause re-renders on every position update
   const [obstacles, setObstacles] = useState<Obstacle[]>([]);
   const [collectibles, setCollectibles] = useState<Collectible[]>([]);
   ```

   Updated every frame in game loop (lines 368-379).

   **Fix:** Convert to canvas rendering or use refs with direct DOM manipulation.

2. **useState for Distance (Updates Every Frame)**
   ```typescript
   // Line 80
   const [distance, setDistance] = useState(0);

   // Line 303: Updated every frame
   setDistance(prev => prev + 1);
   ```

   **Fix:** Use ref for distance, only update state every 10 frames for UI.

3. **Multiple setState Calls in Game Loop**
   The game loop calls multiple setState functions:
   - `setDistance` - every frame
   - `setSpeed` - on milestone
   - `setObstacles` - every frame
   - `setCollectibles` - every frame
   - `setScore` - on collect

   **Fix:** Batch state updates or move to refs with RAF-synced renders.

4. **No Object Pooling**
   ```typescript
   // Line 343-350: Creates new objects
   setObstacles(prev => [
     ...prev,
     { id: obstacleIdRef.current++, lane, y: -OBSTACLE_SIZE, type: ... }
   ]);
   ```

   **Fix:** Pre-allocate 10 obstacle objects, 10 collectible objects. Recycle instead of create.

### MODERATE

5. **Collision Check Uses Array Filter**
   ```typescript
   // Lines 414-458: Filter creates new array
   setCollectibles(prev => {
     const remaining: Collectible[] = [];
     prev.forEach(collectible => { ... });
     return remaining;
   });
   ```

   **Fix:** Mark collected items as inactive, filter once per frame outside loop.

6. **Effect Refs Updated Every Render**
   ```typescript
   // Lines 136-148: Many useEffect hooks to sync refs
   useEffect(() => {
     triggerShockwaveRef.current = triggerShockwave;
     // ... 10 more refs
   }, [dependencies]);
   ```

   **Fix:** Consolidate into single useEffect or use useLatest pattern.

### MINOR

7. **DOM-Based Rendering**
   Game objects are rendered as DOM elements (lines 542-567).

   **Fix:** Consider canvas for smoother animation, especially on mobile.

8. **Swipe Detection Threshold**
   ```typescript
   // Line 264: Fixed 30px threshold
   if (Math.abs(diff) > 30) {
   ```

   **Fix:** Scale threshold by screen width for consistent feel across devices.

---

## Juice Assessment

### Already Implemented (Good!)

- **Visual Effects System:** Uses `useGameEffects` hook
- **Screen Shake:** On crash (line 395)
- **Shockwave:** On collect (line 435)
- **Sparks:** On crash and collect
- **Floating Emojis:** On crash and collect
- **Epic Callouts:** Distance milestones and collect streaks
- **Confetti:** On major milestones (250m, 500m, 1km)
- **Score Popups:** On collect with streak bonus display
- **Combo System:** Tracks collect streak

### Missing Juice

1. **No Lane Switch Animation**
   - Player snaps between lanes. Add smooth slide animation.

2. **No Obstacle Entrance Animation**
   - Obstacles just appear at top. Add scale-in or drop effect.

3. **No Speed Increase Feedback**
   - Speed changes silently. Add visual pulse or "SPEED UP!" callout.

4. **No Near-Miss System**
   - No bonus for barely avoiding obstacles.

5. **No Running Animation on Player**
   - Player is static. Add bobbing or leg animation.

6. **No Ground Effects**
   - Add dust particles behind player, speed lines at high speed.

7. **No Danger Zone Warning**
   - Obstacle in same lane approaching should trigger warning.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/wojak-runner-optimize.md thoroughly, then review and optimize src/pages/WojakRunner.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Convert obstacles and collectibles from useState to useRef
2. Use refs for distance/speed, only sync to state every 10 frames for UI
3. Implement object pooling: 10 obstacles, 10 collectibles pre-allocated
4. Batch state updates - collect all changes, apply once per frame
5. Remove duplicate ref-syncing useEffects, use single consolidated effect
6. Move collision detection outside of setState callback
7. Consider canvas rendering for game objects (optional but recommended)
8. Scale swipe threshold by screen width: Math.max(30, screenWidth * 0.08)

JUICE (Priority 2):
1. Add smooth lane switch animation (CSS transition or tween, 100ms)
2. Add obstacle entrance animation (scale from 0.5 to 1.0 as they enter)
3. Add "SPEED UP!" callout when speed increases
4. Implement near-miss system (+5 bonus, "CLOSE!" callout)
5. Add player running bobbing animation (subtle Y oscillation)
6. Add dust particles behind player at higher speeds
7. Add danger zone indicator when obstacle is approaching in same lane

Target: 60 FPS on iPhone 11 with smooth lane transitions
```

---

## Implementation Priority

1. **High Impact, Medium:** Convert game objects to refs/canvas
2. **High Impact, Medium:** Object pooling for obstacles/collectibles
3. **Medium Impact, Easy:** Throttle distance state updates
4. **Medium Impact, Easy:** Add lane switch animation
5. **Low Impact, Easy:** Add speed up callout
6. **Low Impact, Medium:** Add near-miss system
