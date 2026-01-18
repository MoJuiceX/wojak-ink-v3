# UI Patterns

> Consolidated patterns for animations, state management, and CSS conventions.

## Animation Patterns

### AnimatePresence Modes

| Mode | Use Case |
|------|----------|
| `mode="popLayout"` | Smooth crossfades, no layout jump (floating NFTs) |
| `mode="wait"` | Sequential animations (rotating text, step wizards) |
| `mode="sync"` | Simultaneous enter/exit (tab panels) |

### Floating NFTs Without Jump

Use `AnimatePresence mode="popLayout"` for smooth crossfades:

```tsx
<AnimatePresence mode="popLayout">
  <motion.img
    key={image.id}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 1.2, ease: 'easeInOut' }}
  />
</AnimatePresence>
```

**Key insight**: Scale animation ONCE on mount, then only floating/breathing animation continues.

### Rotating Text (Taglines)

```tsx
const TAGLINES = ['First tagline', 'Second tagline', ...];
const [index, setIndex] = useState(0);

useEffect(() => {
  if (prefersReducedMotion) return;
  const interval = setInterval(() => {
    setIndex(prev => (prev + 1) % TAGLINES.length);
  }, 4000);
  return () => clearInterval(interval);
}, [prefersReducedMotion]);

<AnimatePresence mode="wait">
  <motion.span
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {TAGLINES[index]}
  </motion.span>
</AnimatePresence>
```

## Sound Patterns

### Pitch Variation for Satisfying Sounds

Makes repetitive sounds less annoying:

```typescript
// In SoundManager.ts
instance.audio.playbackRate = pitchShift * (1 + (Math.random() * 2 - 1) * pitchVariation);
// pitchVariation: 0.15-0.2 (±15-20%)
// pitchShift: 1.1 for positive sounds, 0.95 for negative
```

## State Persistence

### localStorage with useState Initializer

For state that survives navigation:

```typescript
const [balance, setBalance] = useState(() => {
  try {
    const saved = localStorage.getItem('key');
    return saved !== null ? parseInt(saved, 10) : defaultValue;
  } catch {
    return defaultValue;
  }
});

useEffect(() => {
  try {
    localStorage.setItem('key', String(balance));
  } catch {}
}, [balance]);
```

## CSS Conventions

### Z-Index Hierarchy (Standard)
```css
/* Game overlays */
.game-over-overlay { z-index: 500; }
.leaderboard-overlay { z-index: 700; }

/* App-wide modals */
.modal-overlay { z-index: 1000; }
.toast-container { z-index: 1100; }
```

### Game CSS Class Naming
**CRITICAL**: Every game MUST prefix all CSS classes with game initials:
- FlappyOrange: `fo-game-over`, `fo-play-btn`
- BlockPuzzle: `bp-game-over`, `bp-play-btn`
- OrangeSnake: `osn-game-over`, `osn-play-btn`

This prevents CSS conflicts when multiple games share similar elements.

### General Class Naming
- Avoid generic class names that might conflict
- Use `.color-orange` not `.orange`
- Game.css has `.orange { position: absolute }` - don't reuse

### Tables
- Use `table-layout: fixed` for stable column widths (no jumping on sort/filter)
- Attribute names left-aligned, numeric columns centered

### Display Rules
- **Always show USD alongside XCH** - e.g., "0.8 XCH" with "$4" below
- Format: XCH on its own line, USD + label together (e.g., "$4 Floor Price")

## Game Over UI Pattern

Standard structure for all games:

```tsx
{gameState === 'gameover' && (
  <div className="game-over-overlay">
    {/* Main content - stays fixed */}
    <div className="game-over-content">
      <h2>Game Over!</h2>
      <div className="score">{score}</div>

      {/* Buttons: Play Again + Leaderboard side by side */}
      <div className="game-over-buttons">
        <button onClick={resetGame}>Play Again</button>
        <button onClick={() => setShowLeaderboard(true)}>Leaderboard</button>
      </div>
    </div>

    {/* Leaderboard - overlays on top, doesn't shift content */}
    {showLeaderboard && (
      <div className="leaderboard-overlay" onClick={() => setShowLeaderboard(false)}>
        <div className="leaderboard-panel" onClick={e => e.stopPropagation()}>
          {/* Leaderboard content */}
        </div>
      </div>
    )}

    {/* Back to Games - in safe area (bottom right) */}
    <button className="back-to-games-btn">Back to Games</button>
  </div>
)}
```

**Key rules**:
- Leaderboard opens as overlay, doesn't push content
- "Back to Games" in bottom-right corner (away from tap area)
- Click outside leaderboard to close

## Common UI Issues

| Issue | Fix |
|-------|-----|
| Content shifts when panel opens | Use absolute positioning for panel overlay |
| Accidental button clicks | Place navigation buttons away from game tap area |
| Animations jumping | Use `mode="popLayout"` for AnimatePresence |
| Sounds repetitive | Add pitch variation (±15-20%) |
