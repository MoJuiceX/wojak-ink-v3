# WojakWhack Performance & Juice Audit

**Game:** WojakWhack (Whack-a-Mole style game)
**File:** `src/pages/WojakWhack.tsx`
**Lines:** ~674 lines

## Executive Summary

WojakWhack is a DOM-based whack-a-mole game with a 60-second timer. It uses useState for hole states which triggers re-renders on each character spawn/hit. The game has good juice integration but the core architecture could be optimized.

---

## Performance Issues

### CRITICAL

1. **useState for Holes Array (Re-render on Every Spawn)**
   ```typescript
   // Lines 105-115: Holes state updated frequently
   const [holes, setHoles] = useState<Hole[]>(() => Array(9).fill(null).map(...));

   // Line 218-227: Updated on every spawn
   setHoles((prev) => {
     const newHoles = [...prev];
     newHoles[holeId] = { ...newHoles[holeId], character, isActive: true, ... };
     return newHoles;
   });
   ```

   Spawning triggers 2-3 state updates per second, plus hits.

   **Fix:** Use refs for hole state, trigger minimal re-renders. Or use CSS animations directly.

2. **Multiple setTimeout for Hide Animations**
   ```typescript
   // Lines 233-237: Each spawn creates a timeout
   const hideTimeout = window.setTimeout(() => {
     hideCharacter(holeId);
   }, config.visibleTime);
   ```

   **Fix:** Use a single animation loop that checks visibility times.

3. **Map for Hide Timeouts**
   ```typescript
   // Line 134
   const hideTimeoutsRef = useRef<Map<number, number>>(new Map());
   ```

   Map operations on every spawn/hit add overhead.

   **Fix:** Use fixed-size array since we know there are exactly 9 holes.

### MODERATE

4. **Difficulty Config Lookup Every Spawn**
   ```typescript
   // Line 232-233
   const config = DIFFICULTY_CONFIG[difficulty as 1 | 2 | 3] || DIFFICULTY_CONFIG[1];
   ```

   **Fix:** Cache current difficulty config in ref, update only when difficulty changes.

5. **DOM-Based Animation**
   Characters animate via CSS classes (lines 550-553). This is fine but could be smoother with canvas.

   **Fix:** Consider canvas for more complex animations, but CSS is acceptable here.

6. **Score Popup Position Calculation**
   ```typescript
   // Lines 373-378: getBoundingClientRect on every hit
   const holeElement = document.getElementById(`hole-${holeId}`);
   const rect = holeElement?.getBoundingClientRect();
   ```

   **Fix:** Cache hole positions on init and window resize.

### MINOR

7. **Timer Using setInterval**
   ```typescript
   // Lines 312-330
   timerRef.current = window.setInterval(() => { ... }, 1000);
   ```

   This is acceptable for a 1-second timer, but could drift.

   **Fix:** Use requestAnimationFrame with timestamp comparison for precision.

---

## Juice Assessment

### Already Implemented (Good!)

- **Visual Effects Integration:** Uses `useGameEffects` hook
- **Screen Shake:** On bad hit and time warnings
- **Confetti:** On golden hit and high combo
- **Epic Callouts:** Combo milestones, time warnings, character hits
- **Score Popups:** Positioned at hit location
- **Sound Variations:** Different sounds per character type
- **Hit Animation:** CSS-based hit effect on holes
- **Combo Display:** Shows multiplier when combo >= 3

### Missing Juice

1. **No Pop-Up Animation Variety**
   - Characters pop up the same way. Add variety:
     - Fast pop for golden
     - Slow peek for regular
     - Jittery pop for bad

2. **No Anticipation Indicator**
   - No warning before character pops up. Add subtle hole glow.

3. **No Miss Feedback**
   - Tapping empty hole or missing character has no feedback.

4. **No Character Exit Animation**
   - Characters just disappear. Add retreat animation.

5. **No Combo Streak Visual**
   - Combo counter is just a number. Add glow/pulse effect.

6. **No Final Countdown Drama**
   - Last 5 seconds could have more drama (screen pulse, faster music).

7. **No Perfect Reaction Bonus**
   - Hitting within 100ms of spawn could give bonus.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/wojak-whack-optimize.md thoroughly, then review and optimize src/pages/WojakWhack.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Convert holes from useState to useRef - trigger re-render only when needed for UI
2. Replace Map for hide timeouts with fixed-size array[9]
3. Replace multiple setTimeout with single animation loop checking visibility
4. Cache difficulty config in ref, update only on difficulty change
5. Cache hole DOM positions on init and window resize
6. Use requestAnimationFrame for timer (precision, not setInterval drift)

JUICE (Priority 2):
1. Add pop-up animation variety (fast for golden, slow peek for regular, jitter for bad)
2. Add anticipation indicator (subtle hole glow 200ms before pop)
3. Add miss feedback (hole ripple + "MISS" sound when tapping empty hole)
4. Add character retreat animation (slide down instead of instant disappear)
5. Add combo glow effect (multiplier text pulses and grows with combo)
6. Enhance final 5 seconds (screen pulse, red vignette, speed up ambient)
7. Add quick reaction bonus (+5 for hitting within 150ms of spawn)

Target: Buttery smooth 60 FPS, responsive tap feedback on all devices
```

---

## Implementation Priority

1. **High Impact, Medium:** Convert holes state to refs
2. **High Impact, Easy:** Replace Map with fixed array
3. **Medium Impact, Medium:** Single animation loop for timeouts
4. **Medium Impact, Easy:** Cache hole positions
5. **Low Impact, Easy:** Add pop-up animation variety
6. **Low Impact, Easy:** Add miss feedback
