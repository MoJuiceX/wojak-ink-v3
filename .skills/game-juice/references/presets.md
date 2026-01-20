# Juice Presets Quick Reference

## Particle Presets

| Preset | Use Case | Config |
|--------|----------|--------|
| `wing` | Flap/jump action | count: 8, speed: 2-4, gravity: 0.02, color: orange |
| `explosion` | Death, destruction | count: 30, speed: 3-8, gravity: 0.1, multicolor |
| `pass` | Score, success | count: 15, speed: 2-5, gravity: 0.05, color: gold |
| `fire` | Fire mode, power | count: 20, speed: 1-3, gravity: -0.02, color: red/orange |
| `nearMiss` | Close calls | count: 10, speed: 1-2, gravity: 0, color: cyan |
| `confetti` | Celebration | count: 50, speed: 2-6, gravity: 0.08, multicolor |
| `ripple` | Water, impact | count: 12, radial: true, gravity: 0 |

## Flash Presets

| Preset | Use Case | Config |
|--------|----------|--------|
| `hit` | Taking damage | color: #ff4444, alpha: 0.4, duration: 100ms |
| `heal` | Healing, powerup | color: #00ff88, alpha: 0.3, duration: 150ms |
| `score` | Points gained | color: #ffd700, alpha: 0.25, duration: 80ms |
| `death` | Game over | color: #ff0000, alpha: 0.6, duration: 300ms |
| `milestone` | Achievement | color: #ffffff, alpha: 0.5, duration: 200ms |

## Haptic Patterns

| Pattern | Use Case | Vibration |
|---------|----------|-----------|
| `tap` | UI interaction | 10ms light |
| `success` | Score, complete | 30ms medium |
| `fail` | Miss, error | 50ms medium |
| `heavy` | Death, impact | 100ms strong |
| `double` | Special action | 20ms, 50ms gap, 20ms |

## Easing Functions

| Function | Use Case | Curve |
|----------|----------|-------|
| `easeOutCubic` | General movement | Smooth deceleration |
| `easeOutBack` | Bouncy entrance | Overshoots then settles |
| `easeOutElastic` | Springy effects | Wobbles then settles |
| `easeOutBounce` | Ball bounce | Multiple bounces |
| `easeInOutQuad` | Smooth transitions | Symmetric ease |

## Screen Shake Intensities

| Level | Intensity | Duration | Use Case |
|-------|-----------|----------|----------|
| Light | 3 | 100ms | Tap, small hit |
| Medium | 6 | 200ms | Score, collision |
| Heavy | 10 | 300ms | Big impact |
| Death | 15 | 400ms | Game over |

## Color Palettes

```typescript
const GAME_PALETTES = {
  fire: ['#ff4500', '#ff6b35', '#ffa500', '#ffd700'],
  ice: ['#00bfff', '#87ceeb', '#add8e6', '#f0ffff'],
  nature: ['#228b22', '#32cd32', '#90ee90', '#98fb98'],
  ocean: ['#000080', '#0000cd', '#4169e1', '#6495ed'],
  sunset: ['#ff4500', '#ff6347', '#ff7f50', '#ffa07a'],
  neon: ['#ff00ff', '#00ffff', '#ff00aa', '#00ff00'],
  pastel: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba'],
  retro: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'],
};
```

## Combo Color Escalation

```typescript
const COMBO_COLORS = [
  '#4ECDC4',  // 1x - Teal
  '#FFD93D',  // 2x - Gold
  '#FF6B35',  // 3x - Orange
  '#FF4444',  // 4x - Red
  '#E040FB',  // 5x - Purple
  '#00E5FF',  // 6x - Cyan
  '#76FF03',  // 7x - Lime
  '#FF1744',  // 8x+ - Hot Red
];
```

## Audio Frequencies

```typescript
const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
};

// Common game sounds
const TONES = {
  tap: 200,           // Quick UI feedback
  jump: 300,          // Action sound
  score: [440, 554],  // Success (A4 → C#5)
  fail: [220, 185],   // Failure (A3 → F#3)
  powerup: [440, 550, 660, 880],  // Rising arpeggio
};
```
