# OrangePong Performance & Juice Audit

**Game:** OrangePong (Pong vs AI)
**File:** `src/pages/OrangePong.tsx`
**Lines:** ~786 lines

## Executive Summary

OrangePong is a DOM-based Pong game with CRITICAL useState abuse in the game loop. Ball position is updated via setState callbacks every frame, causing massive re-renders. The juice system is decent but the core architecture needs refactoring.

---

## Performance Issues

### CRITICAL

1. **useState Abuse in Game Loop (SEVERE)**
   ```typescript
   // Lines 356-522: Ball position updated via setState every frame
   setBallX(prevX => {
     setBallY(prevY => {
       // ... all game logic inside setState callbacks
       return newY;
     });
     return prevX + ballVX;
   });
   ```

   This causes React re-renders 60 times per second!

   **Fix:** Convert to canvas rendering with refs:
   ```typescript
   const ballRef = useRef({ x: 0, y: 0, vx: 5, vy: 3 });
   // Update ref in game loop, render to canvas
   ```

2. **Nested setAiY Inside setBallY**
   ```typescript
   // Lines 411-448: AI position updated inside ball update
   setAiY(prevAiY => {
     // AI collision and movement inside
     return newAiY;
   });
   ```

   **Fix:** Move all game logic to refs, single render pass.

3. **Multiple useState for Positions**
   ```typescript
   // Lines 76-81: All positions as state
   const [playerY, setPlayerY] = useState(0);
   const [aiY, setAiY] = useState(0);
   const [ballX, setBallX] = useState(0);
   const [ballY, setBallY] = useState(0);
   ```

   **Fix:** Use single game state ref:
   ```typescript
   const gameRef = useRef({
     playerY: 0, aiY: 0,
     ball: { x: 0, y: 0, vx: 5, vy: 3 }
   });
   ```

### MODERATE

4. **Hit Ripples as State**
   ```typescript
   // Line 111
   const [hitRipples, setHitRipples] = useState<Array<...>>([]);
   ```

   **Fix:** Render ripples via canvas, use refs.

5. **DOM-Based Rendering**
   - Ball and paddles are DOM elements with style updates.

   **Fix:** Convert to canvas for smoother animation.

6. **Multiple Effect Refs Updated**
   ```typescript
   // Lines 134-154: Many useEffect to sync refs
   ```

   **Fix:** Consolidate into single effect or use custom hook.

### MINOR

7. **Time-Based Scoring Interval**
   ```typescript
   // Lines 331-340: setInterval for time scoring
   const timer = setInterval(() => {
     setPlayTime(prev => prev + 1);
     setTotalPoints(prev => prev + 1);
   }, 1000);
   ```

   This is acceptable for 1-second intervals.

---

## Juice Assessment

### Already Implemented (Good!)

- **Visual Effects System:** Uses `useGameEffects` hook
- **Rally Counter:** Tracks consecutive hits
- **Rally Milestones:** "RALLY 5!", "RALLY 10!", "LEGENDARY RALLY!"
- **Screen Shake:** On various events
- **Shockwave/Sparks:** On scoring
- **Combo System:** Updates with rally
- **Hit Ripples:** At paddle contact points
- **Floating Emojis:** Fire emoji for long rallies

### Missing Juice

1. **No Ball Trail**
   - Ball has no motion trail. Add trail based on velocity.

2. **No Ball Speed Visual**
   - No indication when ball is getting faster. Add glow or stretch.

3. **No Paddle Squash**
   - Paddles don't react to hits. Add squash animation.

4. **No Anticipation Before Serve**
   - Ball appears instantly after reset. Add countdown/anticipation.

5. **No AI Reaction Animation**
   - AI paddle just moves. Add slight anticipation/overshoot.

6. **No Match Point Drama**
   - When either player is at 4 (one away from win), no extra drama.

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/orange-pong-optimize.md thoroughly, then REFACTOR src/pages/OrangePong.tsx. This game has CRITICAL performance issues.

PERFORMANCE (Priority 1 - MANDATORY):
1. REFACTOR: Convert from DOM-based to Canvas-based rendering
2. REFACTOR: Replace all position useState (playerY, aiY, ballX, ballY) with single gameRef
3. REFACTOR: Move ALL game logic out of setState callbacks into ref-based update
4. Implement proper game loop pattern:
   - Single RAF loop
   - Update all positions in refs
   - Draw everything to canvas
   - No setState in game loop except for UI (score changes)
5. Convert hit ripples from state to canvas-drawn effects
6. Consolidate effect ref syncing into single useEffect

JUICE (Priority 2 - After Refactor):
1. Add ball trail (8-10 afterimages based on velocity)
2. Add ball stretch based on speed (stretch in direction of movement)
3. Add paddle squash on hit (scale Y to 0.8 for 50ms)
4. Add serve countdown (3-2-1-GO before ball moves)
5. Add AI paddle micro-anticipation (slight move toward predicted position)
6. Add match point mode (when either at 4: red vignette, dramatic music cue)

Target: 60 FPS with no jank on iPhone 11 - current implementation causes severe frame drops
```

---

## Implementation Priority

1. **CRITICAL:** Convert to canvas + refs (game is currently unusable on low-end devices)
2. **High Impact, Medium:** Proper game loop pattern
3. **Medium Impact, Easy:** Add ball trail
4. **Medium Impact, Easy:** Add paddle squash
5. **Low Impact, Easy:** Add serve countdown
6. **Low Impact, Easy:** Add match point mode
