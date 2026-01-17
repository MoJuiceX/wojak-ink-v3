# Shared Mobile Game UI System

## Goal
Create a **unified mobile game UI system** that all games use, so mobile optimizations apply to all games automatically.

---

## Current Problem

Each game has its own CSS with duplicated mobile styles:
- `OrangeStack.game.css` - has some @media queries
- `MemoryMatch.game.css` - has some @media queries
- `WojakRunner.game.css` - has NO mobile styles!
- `OrangePong.game.css` - unknown
- etc.

This leads to inconsistency and makes maintenance difficult.

---

## Solution: Create Shared Game UI System

### File Structure

```
src/systems/game-ui/
├── index.ts                    # Main export
├── game-ui.css                 # Shared CSS (may exist already)
├── mobile-game-ui.css          # NEW: Mobile-specific overrides
├── components/
│   ├── MobileHUD.tsx           # NEW: Reusable mobile stats HUD
│   ├── GameContainer.tsx       # Wrapper that handles layout
│   ├── StatsPanel.tsx          # Desktop side panel
│   └── index.ts
└── hooks/
    ├── useGameViewport.ts      # NEW: Viewport detection hook
    ├── useFullscreenGame.ts    # NEW: Fullscreen mode handling
    └── index.ts
```

---

## Implementation

### 1. Create `useGameViewport` Hook

**File: `src/systems/game-ui/hooks/useGameViewport.ts`**

```typescript
import { useState, useEffect } from 'react';

export interface ViewportInfo {
  width: number;
  height: number;
  isMobile: boolean;        // width <= 768
  isSmallMobile: boolean;   // width <= 480
  isLandscape: boolean;
  safeAreaBottom: number;
}

export function useGameViewport(): ViewportInfo {
  const [viewport, setViewport] = useState<ViewportInfo>(() => getViewportInfo());

  useEffect(() => {
    const handleResize = () => {
      setViewport(getViewportInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}

function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Get safe area inset for devices with notches
  const safeAreaBottom = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--sab') || '0'
  ) || 60; // Default to 60px for bottom nav

  return {
    width,
    height,
    isMobile: width <= 768,
    isSmallMobile: width <= 480,
    isLandscape: width > height,
    safeAreaBottom,
  };
}

export default useGameViewport;
```

---

### 2. Create `MobileHUD` Component

**File: `src/systems/game-ui/components/MobileHUD.tsx`**

```tsx
import React from 'react';
import './MobileHUD.css';

export interface HUDStat {
  label: string;
  value: string | number;
  color?: string;       // Optional accent color
  warning?: boolean;    // Pulse animation for warnings
}

interface MobileHUDProps {
  stats: HUDStat[];
  position?: 'top' | 'bottom';
  className?: string;
}

export const MobileHUD: React.FC<MobileHUDProps> = ({
  stats,
  position = 'top',
  className = '',
}) => {
  return (
    <div
      className={`mobile-hud mobile-hud--${position} ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`mobile-hud__stat ${stat.warning ? 'mobile-hud__stat--warning' : ''}`}
          style={stat.color ? { '--stat-color': stat.color } as React.CSSProperties : undefined}
        >
          <span className="mobile-hud__label">{stat.label}</span>
          <span className="mobile-hud__value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
};

export default MobileHUD;
```

**File: `src/systems/game-ui/components/MobileHUD.css`**

```css
/* ============================================
   MOBILE HUD - Compact horizontal stats bar
   ============================================ */

.mobile-hud {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 20px;
  border: 1px solid rgba(255, 107, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 200;
  max-width: calc(100% - 24px);
  flex-wrap: wrap;
  justify-content: center;
}

.mobile-hud--top {
  top: 12px;
}

.mobile-hud--bottom {
  bottom: 12px;
}

.mobile-hud__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 48px;
}

.mobile-hud__label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.mobile-hud__value {
  font-size: 18px;
  font-weight: 800;
  color: var(--stat-color, #fff);
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  line-height: 1;
}

/* Warning state - pulsing animation */
.mobile-hud__stat--warning .mobile-hud__value {
  color: #ef4444;
  animation: hud-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes hud-pulse {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.05); opacity: 1; }
}

/* Extra small screens - more compact */
@media (max-width: 380px) {
  .mobile-hud {
    gap: 8px;
    padding: 6px 12px;
  }

  .mobile-hud__stat {
    min-width: 40px;
  }

  .mobile-hud__label {
    font-size: 8px;
  }

  .mobile-hud__value {
    font-size: 14px;
  }
}
```

---

### 3. Create `GameContainer` Wrapper

**File: `src/systems/game-ui/components/GameContainer.tsx`**

```tsx
import React, { useEffect } from 'react';
import { useGameViewport } from '../hooks/useGameViewport';
import { MobileHUD, HUDStat } from './MobileHUD';
import './GameContainer.css';

interface GameContainerProps {
  children: React.ReactNode;
  stats?: HUDStat[];
  gameState: 'menu' | 'playing' | 'paused' | 'gameover';
  accentColor?: string;
  hideNavOnPlay?: boolean;
  className?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  children,
  stats = [],
  gameState,
  accentColor = '#ff6b00',
  hideNavOnPlay = true,
  className = '',
}) => {
  const { isMobile } = useGameViewport();

  // Hide bottom navigation during gameplay
  useEffect(() => {
    if (hideNavOnPlay && gameState === 'playing') {
      document.body.classList.add('game-fullscreen-mode');
    } else {
      document.body.classList.remove('game-fullscreen-mode');
    }

    return () => {
      document.body.classList.remove('game-fullscreen-mode');
    };
  }, [gameState, hideNavOnPlay]);

  return (
    <div
      className={`game-container ${className} ${isMobile ? 'game-container--mobile' : ''}`}
      style={{ '--game-accent': accentColor } as React.CSSProperties}
    >
      {/* Mobile HUD - only show during gameplay on mobile */}
      {isMobile && gameState === 'playing' && stats.length > 0 && (
        <MobileHUD stats={stats} position="top" />
      )}

      {/* Game content */}
      <div className="game-container__content">
        {children}
      </div>
    </div>
  );
};

export default GameContainer;
```

**File: `src/systems/game-ui/components/GameContainer.css`**

```css
/* ============================================
   GAME CONTAINER - Universal game wrapper
   ============================================ */

.game-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.game-container__content {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Mobile specific */
.game-container--mobile {
  /* Add safe area padding for notched devices */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.game-container--mobile .game-container__content {
  /* On mobile, content should fill available space */
  width: 100%;
  height: 100%;
}

/* ============================================
   GLOBAL: Hide nav during fullscreen game
   Add this to your global CSS or App.css
   ============================================ */

body.game-fullscreen-mode .bottom-navigation,
body.game-fullscreen-mode .sidebar-navigation,
body.game-fullscreen-mode [class*="sidebar"],
body.game-fullscreen-mode [class*="bottom-nav"] {
  display: none !important;
}

body.game-fullscreen-mode .game-modal,
body.game-fullscreen-mode [class*="game-modal"] {
  /* Expand to fill space freed by hidden nav */
  bottom: 0 !important;
  max-height: 100vh !important;
  max-height: 100dvh !important; /* Dynamic viewport height for mobile */
}
```

---

### 4. Create Shared Mobile CSS

**File: `src/systems/game-ui/mobile-game-ui.css`**

```css
/* ============================================
   SHARED MOBILE GAME UI
   Import this in each game's CSS file:
   @import '@/systems/game-ui/mobile-game-ui.css';
   ============================================ */

/* Mobile breakpoint: 768px and below */
@media (max-width: 768px) {
  /* ========================================
     HIDE DESKTOP-ONLY ELEMENTS
     ======================================== */

  .stats-panel,
  .desktop-stats,
  [class*="stats-panel"],
  .game-layout > .stats-panel {
    display: none !important;
  }

  /* ========================================
     GAME LAYOUT - MOBILE
     ======================================== */

  .game-layout {
    flex-direction: column !important;
    width: 100% !important;
    height: 100% !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  /* Lightbox wrapper should fill available space */
  .lightbox-wrapper,
  [class*="lightbox-wrapper"] {
    width: 100% !important;
    max-width: 100% !important;
    height: 100% !important;
    border-radius: 0 !important;
    border: none !important;
    border-left: none !important;
    border-right: none !important;
  }

  /* ========================================
     GAME OVER SCREEN - MOBILE LAYOUT
     ======================================== */

  .game-over-screen,
  [class*="game-over-screen"] {
    flex-direction: column !important;
    overflow-y: auto !important;
  }

  .game-over-left,
  [class*="game-over-left"] {
    flex: 0 0 auto !important;
    padding: 20px !important;
    min-height: 150px !important;
    max-height: 200px !important;
  }

  .game-over-right,
  [class*="game-over-right"] {
    flex: 1 !important;
    padding: 20px !important;
    border-left: none !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    overflow-y: auto !important;
  }

  /* Smaller game over title on mobile */
  .game-over-title,
  [class*="game-over-title"] {
    font-size: 28px !important;
  }

  /* Smaller sad image */
  .sad-image-large,
  [class*="sad-image"] {
    width: 120px !important;
    height: 120px !important;
    max-height: 120px !important;
  }

  /* Score display - compact */
  .game-over-score,
  [class*="game-over-score"]:not([class*="value"]):not([class*="label"]) {
    padding: 16px 24px !important;
  }

  .game-over-score-value,
  [class*="game-over-score-value"] {
    font-size: 40px !important;
  }

  /* ========================================
     MENU SCREEN - MOBILE LAYOUT
     ======================================== */

  .game-menu,
  [class*="game-menu"] {
    padding: 16px !important;
  }

  .game-emoji,
  [class*="game-emoji"] {
    font-size: 60px !important;
    margin-bottom: 16px !important;
  }

  .game-title,
  [class*="game-title"] {
    font-size: 24px !important;
    margin-bottom: 8px !important;
  }

  /* ========================================
     TOUCH OPTIMIZATION
     ======================================== */

  /* Larger touch targets */
  button,
  [role="button"],
  .play-btn,
  .game-over-save,
  .game-over-skip,
  .leaderboard-toggle-btn {
    min-height: 44px !important; /* iOS minimum */
    min-width: 44px !important;
  }

  /* Disable text selection during gameplay */
  .game-container--mobile {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
}

/* Extra small mobile (380px and below) */
@media (max-width: 380px) {
  .game-over-title,
  [class*="game-over-title"] {
    font-size: 24px !important;
  }

  .game-over-score-value,
  [class*="game-over-score-value"] {
    font-size: 32px !important;
  }

  .sad-image-large,
  [class*="sad-image"] {
    width: 100px !important;
    height: 100px !important;
  }
}
```

---

### 5. Update Existing Games to Use Shared System

**Example: Updating Orange Stack**

**In `OrangeStack.tsx`:**

```tsx
import { useGameViewport } from '@/systems/game-ui/hooks/useGameViewport';
import { MobileHUD } from '@/systems/game-ui/components/MobileHUD';

// Inside component:
const { isMobile } = useGameViewport();

// Build stats array for HUD
const hudStats = [
  { label: 'LEVEL', value: level, color: '#ffd700' },
  { label: 'PROGRESS', value: `${progress}/${target}`, color: '#ff6b00' },
  { label: 'SCORE', value: score, color: '#00ff88' },
];

// In JSX:
return (
  <div className={`stack-content ${isMobile ? 'mobile' : ''}`}>
    {/* Mobile: Show HUD, Desktop: Show side panel */}
    {isMobile && gameState === 'playing' && (
      <MobileHUD stats={hudStats} />
    )}

    {!isMobile && gameState === 'playing' && (
      <div className="stats-panel">
        {/* Existing desktop stats */}
      </div>
    )}

    {/* Rest of game */}
  </div>
);
```

**In `OrangeStack.game.css`, add at the top:**

```css
@import '@/systems/game-ui/mobile-game-ui.css';

/* Rest of existing CSS... */
```

---

## Migration Checklist

Apply this pattern to each game:

### Orange Stack
- [ ] Add `useGameViewport` hook
- [ ] Add `MobileHUD` component for mobile
- [ ] Import shared mobile CSS
- [ ] Test on mobile viewport

### Memory Match
- [ ] Same as above
- [ ] ALSO: Remove/hide dev panel

### Wojak Runner
- [ ] Same as above

### Orange Pong
- [ ] Same as above

### Orange Juggle
- [ ] Same as above
- [ ] ALSO: Fix UI bleeding issue

### Color Reaction
- [ ] CRITICAL: Fix black screen first
- [ ] Then apply mobile UI pattern

### 2048 Merge
- [ ] CRITICAL: Fix black screen first
- [ ] Then apply mobile UI pattern

### Orange Wordle
- [ ] CRITICAL: Fix black screen first
- [ ] Then apply mobile UI pattern

### Knife Game
- [ ] Check if playable (was "Coming Soon")
- [ ] Apply pattern when game is ready

---

## Testing After Implementation

1. Test each game at 390px width (iPhone 12)
2. Verify HUD is visible and readable
3. Verify game fills available space
4. Verify touch controls work
5. Verify game over screen is scrollable and all elements accessible
6. Verify bottom nav is hidden during gameplay
7. Test orientation changes (if applicable)
