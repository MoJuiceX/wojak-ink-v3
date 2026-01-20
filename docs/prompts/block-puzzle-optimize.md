# BlockPuzzle Performance & Juice Audit

**Game:** BlockPuzzle (Block-fitting puzzle like Tetris without gravity)
**File:** `src/pages/BlockPuzzle.tsx`
**Lines:** ~1000+ lines (only first 1000 read)

## Executive Summary

BlockPuzzle is an extremely well-implemented game with excellent juice across all phases. It uses DOM rendering with extensive custom particle systems, procedural audio via Web Audio API, and sophisticated haptic patterns. The game demonstrates premium-level polish with freeze frames, shockwaves, streak fire mode, danger states, and more. Performance is generally good but has some areas for optimization.

---

## Performance Issues

### MODERATE

1. **Particle Animation with setInterval**
   ```typescript
   // Lines 666-686: Particle animation loop
   const interval = setInterval(() => {
     setClearParticles(prev =>
       prev.map(p => ({ ...p, /* updates */ }))
         .filter(p => p.alpha > 0)
     );
   }, 16);
   ```

   **Fix:** Use requestAnimationFrame instead of setInterval for smoother animation.

2. **Trail Particles State Updates**
   ```typescript
   // Lines 479-485: Trail particle state
   const [trailParticles, setTrailParticles] = useState<TrailParticle[]>([]);
   ```

   Trail particles during drag could cause frequent re-renders.

   **Fix:** Consider using refs and canvas rendering for drag trail.

3. **Shockwave Animation with setInterval**
   ```typescript
   // Lines 689-705: Shockwave animation
   const interval = setInterval(() => {
     setShockwaves(prev =>
       prev.map(s => ({ ...s, size: s.size + 15, alpha: 1 - (s.size / s.maxSize) }))
         .filter(s => s.size < s.maxSize)
     );
   }, 16);
   ```

   **Fix:** Consolidate all particle systems into single RAF loop.

4. **Valid Placements Calculation**
   ```typescript
   // Line 490-491: Valid placements state
   const [validPlacements, setValidPlacements] = useState<Set<string>>(new Set());
   ```

   Calculating valid placements for danger highlighting could be expensive on complex boards.

   **Fix:** Debounce or memoize valid placement calculations.

### MINOR

5. **Multiple Audio Context Oscillators**
   ```typescript
   // Lines 712-756: Multiple oscillator creation per sound
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   ```

   Creating many oscillators is fine for occasional sounds but could benefit from pooling.

6. **Grid State Deep Copy**
   ```typescript
   // Line 301-302: Deep copy on place
   const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
   ```

   This creates 64 new objects per placement. For an 8x8 grid this is acceptable.

---

## Juice Assessment

### Already Implemented (EXCELLENT!)

- **Phase 1 - Sound Foundation:**
  - Musical combo notes (Do-Re-Mi-Fa-Sol scale)
  - Line clear sounds with pitch variation
  - Piece spawn/snap/invalid sounds
  - Combo break sound
  - Danger heartbeat loop
  - Perfect clear fanfare
  - Streak fire activation sound

- **Phase 2 - Premium Haptics:**
  - Line-specific haptic patterns (single → quad escalation)
  - Snap/lock haptic
  - Invalid placement haptic
  - Drag start haptic
  - Perfect clear haptic
  - Danger pulse haptic
  - Streak fire haptic

- **Phase 3 - Explosive Line Clears:**
  - Freeze frames (duration by line count)
  - Shockwave effects
  - Particle bursts from cleared cells
  - Screen flash
  - Clear callouts (DOUBLE!, TRIPLE!, QUAD!)
  - Enhanced screen shake

- **Phase 4 - Drag Effects:**
  - Trail particles during drag
  - Snap detection state
  - Visual feedback for valid/invalid placement

- **Phase 6 - Danger State:**
  - Danger level tracking (safe/warning/critical/imminent)
  - Valid placement highlighting
  - Moves left warning
  - Danger haptic intervals

- **Phase 7 - Streak Fire Mode:**
  - Streak activation at 3 consecutive clears
  - Timeout system (6 seconds)
  - Bonus multiplier (1.5x)
  - Perfect clear bonus (5000 points)

- **Phase 10 - Viral Share:**
  - Challenge system
  - Share modal
  - Toast notifications

### Missing Juice (Minor - Game is already excellent)

1. **No Piece Preview Shadow on Grid**
   - During drag, grid cells could show subtle shadow/highlight where piece would land.

2. **No Piece Rotation**
   - Some block puzzles allow rotation. Could be a power-up feature.

3. **No Board Clear Celebration**
   - Perfect clear has bonus but could have even bigger celebration (full-screen effect).

---

## Quick Copy-Paste Prompt for Claude CLI

```
Read docs/prompts/block-puzzle-optimize.md thoroughly, then review and optimize src/pages/BlockPuzzle.tsx. Focus on:

PERFORMANCE (Priority 1):
1. Replace all particle setInterval loops with single unified requestAnimationFrame loop
2. Consider canvas rendering for drag trail particles instead of React state
3. Debounce valid placement calculations during danger state (100ms)
4. Consolidate shockwave and clear particle animation into single RAF
5. Consider object pooling for oscillators in procedural audio (optional)
6. Memoize piece shape lookups

JUICE (Priority 2 - Game already has excellent juice):
1. Add subtle grid cell highlight during drag showing where piece would land
2. Add "BOARD CLEAR!" ultra celebration for perfect clear (full-screen gold flash, extended confetti, special sound)
3. Add piece "anticipation" - brief scale-down before placement for weight feeling
4. Add chain reaction visual when line clear causes another line clear possibility

Target: Maintain smooth 60 FPS during quad line clears with max particles on iPhone 11
```

---

## Implementation Priority

1. **High Impact, Medium:** Unify particle/shockwave animation into single RAF loop
2. **Medium Impact, Medium:** Canvas rendering for drag trail
3. **Low Impact, Easy:** Add grid cell highlight during drag
4. **Low Impact, Easy:** Enhance perfect clear celebration
5. **Low Impact, Easy:** Add piece anticipation animation
