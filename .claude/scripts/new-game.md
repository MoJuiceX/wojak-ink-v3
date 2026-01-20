# /new-game - Create New Game from Template

Create a new canvas-based game with pre-integrated juice systems.

## Steps

### 1. Copy Template
```bash
cp -r templates/canvas-game-starter src/pages/[GameName]
```

### 2. Update Configuration
Edit `src/pages/[GameName]/config.ts`:
- Set `GAME_CONFIG.name`
- Set canvas dimensions
- Configure physics constants
- Define scoring rules

### 3. Define Types
Edit `src/pages/[GameName]/types.ts`:
- Add game-specific entity types
- Define game state structure

### 4. Implement Game Loop
Edit `src/pages/[GameName]/components/GameCanvas.tsx`:
- Add game objects and logic in `update()`
- Render game world in `render()`
- Wire juice triggers to events

### 5. Add to Router
```typescript
// In App.tsx or router config
<Route path="/games/[game-name]" component={lazy(() => import('./pages/[GameName]'))} />
```

## Template Contents
```
templates/canvas-game-starter/
├── config.ts          # Game configuration
├── types.ts           # TypeScript types
├── index.ts           # Main exports
├── components/
│   └── GameCanvas.tsx # Main game component
└── hooks/
    ├── useGameLoop.ts # RAF loop with fixed timestep
    ├── useAudio.ts    # Web Audio + haptics
    └── useInput.ts    # Keyboard/touch input
```

## Pre-Integrated Features
- ✅ Game loop with delta time
- ✅ Particle system
- ✅ Screen shake/flash
- ✅ Audio with Web Audio API
- ✅ Haptic feedback
- ✅ Touch/keyboard input
- ✅ High-DPI canvas
- ✅ Mobile detection
