# IMPLEMENTATION PROMPT 00: Shared Systems Architecture

## Priority: RUN THIS FIRST
This prompt establishes the shared systems architecture that ALL games will use. Run this BEFORE creating any new games, and BEFORE the engagement system prompts.

---

## Overview

Create a centralized systems architecture where visual effects, UI components, engagement hooks, and theme variables are shared across ALL games. This ensures:

1. **Update once, all games benefit** - Improve confetti? All 9+ games get it instantly.
2. **Consistency** - All games look and feel the same
3. **Faster development** - New games just import shared systems
4. **No code drift** - Games can't diverge over time

---

## Architecture

```
src/
├── systems/                          # 🎯 SHARED SYSTEMS
│   │
│   ├── effects/                      # Visual Effects System
│   │   ├── index.ts                  # Export all effects
│   │   ├── EffectsProvider.tsx       # Context for triggering effects
│   │   ├── EffectsLayer.tsx          # Renders all active effects
│   │   ├── effects.css               # All effect animations
│   │   │
│   │   ├── components/
│   │   │   ├── Shockwave.tsx
│   │   │   ├── Sparks.tsx
│   │   │   ├── Confetti.tsx
│   │   │   ├── ComboText.tsx
│   │   │   ├── FloatingEmoji.tsx
│   │   │   ├── ScreenShake.tsx
│   │   │   ├── Lightning.tsx
│   │   │   ├── SpeedLines.tsx
│   │   │   └── ScorePopup.tsx
│   │   │
│   │   └── presets/
│   │       ├── combo.ts              # Combo celebration presets
│   │       ├── gameOver.ts           # Game over effect presets
│   │       └── achievement.ts        # Achievement unlock presets
│   │
│   ├── game-ui/                      # Game UI Components
│   │   ├── index.ts
│   │   ├── GameShell.tsx             # Wrapper for all games
│   │   ├── GameIntroScreen.tsx       # Unified intro screen
│   │   ├── GameOverScreen.tsx        # Unified game over screen
│   │   ├── GameHUD.tsx               # Score, combo, timer display
│   │   ├── PauseMenu.tsx             # Pause overlay
│   │   ├── CountdownOverlay.tsx      # 3-2-1-GO countdown
│   │   └── game-ui.css               # All game UI styles
│   │
│   ├── engagement/                   # Player Engagement Hooks
│   │   ├── index.ts
│   │   ├── useGameSession.ts         # Master hook (combines all below)
│   │   ├── useScoreSubmission.ts     # Submit to leaderboard
│   │   ├── useCurrencyRewards.ts     # Earn oranges/gems
│   │   ├── useAchievements.ts        # Track & unlock achievements
│   │   ├── useDailyChallenge.ts      # Daily challenge integration
│   │   └── useGameAnalytics.ts       # Track play sessions
│   │
│   └── theme/                        # Design System
│       ├── index.css                 # Import all theme files
│       ├── colors.css                # Color variables
│       ├── glassmorphism.css         # Glass effect classes
│       ├── typography.css            # Font styles
│       ├── animations.css            # Shared keyframes
│       └── spacing.css               # Spacing variables
│
├── contexts/                         # App-wide Contexts
│   ├── AuthContext.tsx
│   ├── CurrencyContext.tsx
│   ├── LeaderboardContext.tsx
│   ├── GuildContext.tsx
│   └── NotificationContext.tsx
│
├── games/                            # Individual Games
│   ├── OrangeStack/
│   │   ├── index.tsx                 # Main component
│   │   ├── OrangeStack.game.css      # Game-SPECIFIC styles only
│   │   ├── useOrangeStackLogic.ts    # Game logic hook
│   │   └── config.ts                 # Game configuration
│   │
│   ├── MemoryMatch/
│   ├── OrangePong/
│   └── ... (all games follow same structure)
│
└── pages/                            # Route pages
    ├── GamePage.tsx                  # Generic game page wrapper
    └── ...
```

---

## Part 1: Effects System

### 1.1 Effects Context
Create `src/systems/effects/EffectsProvider.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Effect types
export type EffectType =
  | 'shockwave'
  | 'sparks'
  | 'confetti'
  | 'combo-text'
  | 'floating-emoji'
  | 'screen-shake'
  | 'lightning'
  | 'speed-lines'
  | 'score-popup'
  | 'vignette-pulse';

export interface Effect {
  id: string;
  type: EffectType;
  position?: { x: number; y: number };
  data?: Record<string, any>;
  duration: number;
  createdAt: number;
}

export interface EffectPreset {
  effects: Omit<Effect, 'id' | 'createdAt'>[];
}

interface EffectsContextType {
  activeEffects: Effect[];
  triggerEffect: (type: EffectType, options?: Partial<Effect>) => void;
  triggerPreset: (preset: EffectPreset) => void;
  clearEffects: () => void;
  setIntensity: (level: 'low' | 'medium' | 'high') => void;
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

let effectIdCounter = 0;

export const EffectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeEffects, setActiveEffects] = useState<Effect[]>([]);
  const [intensity, setIntensityState] = useState<'low' | 'medium' | 'high'>('high');

  // Generate unique ID
  const generateId = () => `effect-${++effectIdCounter}-${Date.now()}`;

  // Trigger a single effect
  const triggerEffect = useCallback((
    type: EffectType,
    options?: Partial<Effect>
  ) => {
    // Skip some effects on low intensity
    if (intensity === 'low' && ['sparks', 'lightning', 'speed-lines'].includes(type)) {
      return;
    }

    const effect: Effect = {
      id: generateId(),
      type,
      duration: getDefaultDuration(type),
      createdAt: Date.now(),
      ...options
    };

    setActiveEffects(prev => [...prev, effect]);

    // Auto-remove after duration
    setTimeout(() => {
      setActiveEffects(prev => prev.filter(e => e.id !== effect.id));
    }, effect.duration);
  }, [intensity]);

  // Trigger a preset (multiple effects at once)
  const triggerPreset = useCallback((preset: EffectPreset) => {
    preset.effects.forEach((effectConfig, index) => {
      // Stagger effects slightly for more dynamic feel
      setTimeout(() => {
        triggerEffect(effectConfig.type, effectConfig);
      }, index * 50);
    });
  }, [triggerEffect]);

  // Clear all effects
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  // Set intensity level
  const setIntensity = useCallback((level: 'low' | 'medium' | 'high') => {
    setIntensityState(level);
  }, []);

  return (
    <EffectsContext.Provider
      value={{
        activeEffects,
        triggerEffect,
        triggerPreset,
        clearEffects,
        setIntensity
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
};

export const useEffects = () => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within EffectsProvider');
  }
  return context;
};

// Default durations for each effect type
function getDefaultDuration(type: EffectType): number {
  const durations: Record<EffectType, number> = {
    'shockwave': 600,
    'sparks': 800,
    'confetti': 3000,
    'combo-text': 1000,
    'floating-emoji': 2000,
    'screen-shake': 500,
    'lightning': 300,
    'speed-lines': 500,
    'score-popup': 1500,
    'vignette-pulse': 400
  };
  return durations[type] || 1000;
}
```

### 1.2 Effects Layer (Renders all effects)
Create `src/systems/effects/EffectsLayer.tsx`:

```typescript
import React from 'react';
import { useEffects, Effect } from './EffectsProvider';
import { Shockwave } from './components/Shockwave';
import { Sparks } from './components/Sparks';
import { Confetti } from './components/Confetti';
import { ComboText } from './components/ComboText';
import { FloatingEmoji } from './components/FloatingEmoji';
import { ScreenShake } from './components/ScreenShake';
import { Lightning } from './components/Lightning';
import { SpeedLines } from './components/SpeedLines';
import { ScorePopup } from './components/ScorePopup';
import { VignettePulse } from './components/VignettePulse';
import './effects.css';

export const EffectsLayer: React.FC = () => {
  const { activeEffects } = useEffects();

  const renderEffect = (effect: Effect) => {
    const props = {
      key: effect.id,
      position: effect.position,
      data: effect.data,
      duration: effect.duration
    };

    switch (effect.type) {
      case 'shockwave':
        return <Shockwave {...props} />;
      case 'sparks':
        return <Sparks {...props} />;
      case 'confetti':
        return <Confetti {...props} />;
      case 'combo-text':
        return <ComboText {...props} />;
      case 'floating-emoji':
        return <FloatingEmoji {...props} />;
      case 'screen-shake':
        return <ScreenShake {...props} />;
      case 'lightning':
        return <Lightning {...props} />;
      case 'speed-lines':
        return <SpeedLines {...props} />;
      case 'score-popup':
        return <ScorePopup {...props} />;
      case 'vignette-pulse':
        return <VignettePulse {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="effects-layer" aria-hidden="true">
      {activeEffects.map(renderEffect)}
    </div>
  );
};
```

### 1.3 Individual Effect Components

Create `src/systems/effects/components/Shockwave.tsx`:
```typescript
import React from 'react';

interface ShockwaveProps {
  position?: { x: number; y: number };
  data?: {
    color?: string;
    size?: number;
  };
  duration: number;
}

export const Shockwave: React.FC<ShockwaveProps> = ({
  position = { x: 50, y: 50 },
  data = {},
  duration
}) => {
  const { color = 'rgba(255, 140, 50, 0.6)', size = 200 } = data;

  return (
    <div
      className="effect-shockwave"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--shockwave-color': color,
        '--shockwave-size': `${size}px`,
        '--shockwave-duration': `${duration}ms`
      } as React.CSSProperties}
    />
  );
};
```

Create `src/systems/effects/components/Confetti.tsx`:
```typescript
import React, { useMemo } from 'react';

interface ConfettiProps {
  position?: { x: number; y: number };
  data?: {
    count?: number;
    colors?: string[];
    spread?: number;
  };
  duration: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
  position = { x: 50, y: 50 },
  data = {},
  duration
}) => {
  const {
    count = 50,
    colors = ['#FF6B35', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF8C42'],
    spread = 120
  } = data;

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: (Math.random() - 0.5) * spread,
      velocity: 50 + Math.random() * 100,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 8
    }));
  }, [count, colors, spread]);

  return (
    <div
      className="effect-confetti-container"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="effect-confetti-particle"
          style={{
            '--confetti-color': particle.color,
            '--confetti-angle': `${particle.angle}deg`,
            '--confetti-velocity': particle.velocity,
            '--confetti-rotation': `${particle.rotation}deg`,
            '--confetti-size': `${particle.size}px`,
            '--confetti-duration': `${duration}ms`,
            animationDelay: `${Math.random() * 100}ms`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
```

Create `src/systems/effects/components/ComboText.tsx`:
```typescript
import React from 'react';

interface ComboTextProps {
  position?: { x: number; y: number };
  data?: {
    text: string;
    level?: number; // 1-10, affects color and size
    subtext?: string;
  };
  duration: number;
}

const COMBO_COLORS = [
  '#FFFFFF',    // Level 1
  '#FFD93D',    // Level 2
  '#FF8C42',    // Level 3
  '#FF6B35',    // Level 4
  '#FF4757',    // Level 5
  '#E91E63',    // Level 6
  '#9B59B6',    // Level 7
  '#3498DB',    // Level 8
  '#00D4FF',    // Level 9
  '#FFD700',    // Level 10 (GOLD)
];

export const ComboText: React.FC<ComboTextProps> = ({
  position = { x: 50, y: 50 },
  data = { text: 'COMBO!' },
  duration
}) => {
  const { text, level = 1, subtext } = data;
  const color = COMBO_COLORS[Math.min(level - 1, COMBO_COLORS.length - 1)];
  const scale = 1 + (level * 0.1);

  return (
    <div
      className="effect-combo-text"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--combo-color': color,
        '--combo-scale': scale,
        '--combo-duration': `${duration}ms`
      } as React.CSSProperties}
    >
      <span className="combo-main">{text}</span>
      {subtext && <span className="combo-sub">{subtext}</span>}
    </div>
  );
};
```

Create `src/systems/effects/components/ScorePopup.tsx`:
```typescript
import React from 'react';

interface ScorePopupProps {
  position?: { x: number; y: number };
  data?: {
    score: number;
    prefix?: string;
    color?: string;
  };
  duration: number;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  position = { x: 50, y: 50 },
  data = { score: 0 },
  duration
}) => {
  const { score, prefix = '+', color = '#FFD700' } = data;

  return (
    <div
      className="effect-score-popup"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        '--popup-color': color,
        '--popup-duration': `${duration}ms`
      } as React.CSSProperties}
    >
      {prefix}{score.toLocaleString()}
    </div>
  );
};
```

### 1.4 Effect Presets
Create `src/systems/effects/presets/combo.ts`:

```typescript
import { EffectPreset } from '../EffectsProvider';

// Combo celebration presets based on combo level
export const getComboPreset = (level: number, position: { x: number; y: number }): EffectPreset => {
  const effects: EffectPreset['effects'] = [];

  // Always show combo text
  effects.push({
    type: 'combo-text',
    position,
    data: {
      text: `${level}x COMBO!`,
      level,
      subtext: level >= 5 ? getComboSubtext(level) : undefined
    },
    duration: 1000
  });

  // Level 2+: Add sparks
  if (level >= 2) {
    effects.push({
      type: 'sparks',
      position,
      data: { count: level * 3 },
      duration: 800
    });
  }

  // Level 3+: Add shockwave
  if (level >= 3) {
    effects.push({
      type: 'shockwave',
      position,
      data: { size: 100 + level * 20 },
      duration: 600
    });
  }

  // Level 5+: Add confetti
  if (level >= 5) {
    effects.push({
      type: 'confetti',
      position,
      data: { count: level * 10 },
      duration: 2000
    });
  }

  // Level 7+: Add screen shake
  if (level >= 7) {
    effects.push({
      type: 'screen-shake',
      data: { intensity: Math.min(level - 5, 5) },
      duration: 400
    });
  }

  // Level 10+: Add lightning
  if (level >= 10) {
    effects.push({
      type: 'lightning',
      duration: 300
    });
    effects.push({
      type: 'vignette-pulse',
      data: { color: '#FFD700' },
      duration: 400
    });
  }

  return { effects };
};

function getComboSubtext(level: number): string {
  if (level >= 10) return '🔥 LEGENDARY! 🔥';
  if (level >= 8) return '⚡ UNSTOPPABLE! ⚡';
  if (level >= 6) return '💥 ON FIRE! 💥';
  if (level >= 5) return '✨ AMAZING! ✨';
  return '';
}

// Score milestone celebrations
export const getScoreMilestonePreset = (milestone: number): EffectPreset => {
  return {
    effects: [
      {
        type: 'combo-text',
        position: { x: 50, y: 40 },
        data: {
          text: `${milestone.toLocaleString()} POINTS!`,
          level: Math.min(Math.floor(milestone / 1000), 10)
        },
        duration: 1500
      },
      {
        type: 'confetti',
        position: { x: 50, y: 50 },
        data: { count: 100, spread: 180 },
        duration: 3000
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { size: 300, color: 'rgba(255, 215, 0, 0.5)' },
        duration: 800
      }
    ]
  };
};
```

Create `src/systems/effects/presets/gameOver.ts`:

```typescript
import { EffectPreset } from '../EffectsProvider';

export const getGameOverPreset = (options: {
  isHighScore: boolean;
  isTopTen: boolean;
  score: number;
}): EffectPreset => {
  const { isHighScore, isTopTen, score } = options;
  const effects: EffectPreset['effects'] = [];

  if (isHighScore) {
    // Massive celebration for new high score
    effects.push(
      {
        type: 'confetti',
        position: { x: 50, y: 30 },
        data: { count: 150, spread: 180 },
        duration: 4000
      },
      {
        type: 'combo-text',
        position: { x: 50, y: 25 },
        data: {
          text: '🏆 NEW HIGH SCORE! 🏆',
          level: 10
        },
        duration: 2000
      },
      {
        type: 'lightning',
        duration: 500
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { size: 400, color: 'rgba(255, 215, 0, 0.6)' },
        duration: 1000
      }
    );
  } else if (isTopTen) {
    // Good celebration for top 10
    effects.push(
      {
        type: 'confetti',
        position: { x: 50, y: 40 },
        data: { count: 80 },
        duration: 3000
      },
      {
        type: 'combo-text',
        position: { x: 50, y: 30 },
        data: {
          text: '⭐ TOP 10! ⭐',
          level: 7
        },
        duration: 1500
      }
    );
  }

  return { effects };
};

export const getAchievementUnlockPreset = (achievementName: string): EffectPreset => {
  return {
    effects: [
      {
        type: 'combo-text',
        position: { x: 50, y: 30 },
        data: {
          text: '🏆 ACHIEVEMENT UNLOCKED!',
          level: 8,
          subtext: achievementName
        },
        duration: 2500
      },
      {
        type: 'confetti',
        position: { x: 50, y: 50 },
        data: {
          count: 60,
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        },
        duration: 2500
      },
      {
        type: 'shockwave',
        position: { x: 50, y: 50 },
        data: { color: 'rgba(255, 215, 0, 0.5)' },
        duration: 600
      }
    ]
  };
};
```

### 1.5 Effects CSS
Create `src/systems/effects/effects.css`:

```css
/* Effects Layer Container */
.effects-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

/* ===== SHOCKWAVE ===== */
.effect-shockwave {
  position: absolute;
  transform: translate(-50%, -50%);
  width: var(--shockwave-size, 200px);
  height: var(--shockwave-size, 200px);
  border-radius: 50%;
  border: 4px solid var(--shockwave-color, rgba(255, 140, 50, 0.6));
  animation: shockwave-expand var(--shockwave-duration, 600ms) ease-out forwards;
}

@keyframes shockwave-expand {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* ===== CONFETTI ===== */
.effect-confetti-container {
  position: absolute;
  transform: translate(-50%, -50%);
}

.effect-confetti-particle {
  position: absolute;
  width: var(--confetti-size, 8px);
  height: var(--confetti-size, 8px);
  background: var(--confetti-color, #FFD700);
  border-radius: 2px;
  animation: confetti-burst var(--confetti-duration, 3000ms) ease-out forwards;
}

@keyframes confetti-burst {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform:
      translate(
        calc(cos(var(--confetti-angle)) * var(--confetti-velocity) * 1px),
        calc(sin(var(--confetti-angle)) * var(--confetti-velocity) * 1px + 200px)
      )
      rotate(calc(var(--confetti-rotation) + 720deg))
      scale(0);
    opacity: 0;
  }
}

/* Fallback for browsers without cos/sin support */
@supports not (transform: translate(calc(cos(45deg) * 100px), 0)) {
  .effect-confetti-particle {
    animation: confetti-burst-fallback var(--confetti-duration, 3000ms) ease-out forwards;
  }

  @keyframes confetti-burst-fallback {
    0% {
      transform: translateY(0) rotate(0deg) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateY(-100px) rotate(360deg) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(300px) rotate(720deg) scale(0);
      opacity: 0;
    }
  }
}

/* ===== COMBO TEXT ===== */
.effect-combo-text {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  animation: combo-appear var(--combo-duration, 1000ms) ease-out forwards;
}

.effect-combo-text .combo-main {
  display: block;
  font-size: calc(2rem * var(--combo-scale, 1));
  font-weight: 900;
  color: var(--combo-color, #FFD700);
  text-shadow:
    0 0 20px var(--combo-color),
    0 0 40px var(--combo-color),
    2px 2px 0 rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
}

.effect-combo-text .combo-sub {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-top: 4px;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

@keyframes combo-appear {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    transform: translate(-50%, -50%) scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8) translateY(-30px);
    opacity: 0;
  }
}

/* ===== SPARKS ===== */
.effect-sparks-container {
  position: absolute;
  transform: translate(-50%, -50%);
}

.effect-spark {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--spark-color, #FFD700);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--spark-color, #FFD700);
  animation: spark-fly var(--spark-duration, 800ms) ease-out forwards;
}

@keyframes spark-fly {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform:
      translate(
        var(--spark-x, 50px),
        var(--spark-y, -50px)
      )
      scale(0);
    opacity: 0;
  }
}

/* ===== SCORE POPUP ===== */
.effect-score-popup {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--popup-color, #FFD700);
  text-shadow:
    0 0 10px var(--popup-color),
    2px 2px 0 rgba(0, 0, 0, 0.5);
  animation: score-float var(--popup-duration, 1500ms) ease-out forwards;
}

@keyframes score-float {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    transform: translate(-50%, calc(-50% - 60px)) scale(0.8);
    opacity: 0;
  }
}

/* ===== SCREEN SHAKE ===== */
.effect-screen-shake {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: screen-shake var(--shake-duration, 500ms) ease-out;
}

@keyframes screen-shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-5px) translateY(2px); }
  20% { transform: translateX(5px) translateY(-2px); }
  30% { transform: translateX(-4px) translateY(1px); }
  40% { transform: translateX(4px) translateY(-1px); }
  50% { transform: translateX(-3px); }
  60% { transform: translateX(3px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
}

/* ===== LIGHTNING ===== */
.effect-lightning {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  animation: lightning-flash var(--lightning-duration, 300ms) ease-out forwards;
}

@keyframes lightning-flash {
  0% { opacity: 0; }
  10% { opacity: 0.9; }
  20% { opacity: 0.2; }
  30% { opacity: 0.8; }
  40% { opacity: 0.1; }
  50% { opacity: 0.6; }
  100% { opacity: 0; }
}

/* ===== VIGNETTE PULSE ===== */
.effect-vignette-pulse {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: inset 0 0 150px var(--vignette-color, rgba(255, 140, 50, 0.5));
  animation: vignette-pulse var(--vignette-duration, 400ms) ease-out forwards;
}

@keyframes vignette-pulse {
  0% {
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* ===== SPEED LINES ===== */
.effect-speed-lines {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.effect-speed-line {
  position: absolute;
  width: 2px;
  height: 100px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(255, 255, 255, 0.8),
    transparent
  );
  animation: speed-line-move var(--speed-duration, 500ms) linear forwards;
}

@keyframes speed-line-move {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}

/* ===== FLOATING EMOJI ===== */
.effect-floating-emoji {
  position: absolute;
  font-size: var(--emoji-size, 2rem);
  animation: emoji-float var(--emoji-duration, 2000ms) ease-out forwards;
}

@keyframes emoji-float {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2) rotate(10deg);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -70%) scale(1) rotate(-5deg);
  }
  100% {
    transform: translate(-50%, -150%) scale(0.5) rotate(15deg);
    opacity: 0;
  }
}
```

### 1.6 Effects Index Export
Create `src/systems/effects/index.ts`:

```typescript
// Provider and hooks
export { EffectsProvider, useEffects } from './EffectsProvider';
export type { Effect, EffectType, EffectPreset } from './EffectsProvider';

// Layer component
export { EffectsLayer } from './EffectsLayer';

// Individual components (for direct use if needed)
export { Shockwave } from './components/Shockwave';
export { Sparks } from './components/Sparks';
export { Confetti } from './components/Confetti';
export { ComboText } from './components/ComboText';
export { FloatingEmoji } from './components/FloatingEmoji';
export { ScorePopup } from './components/ScorePopup';

// Presets
export { getComboPreset, getScoreMilestonePreset } from './presets/combo';
export { getGameOverPreset, getAchievementUnlockPreset } from './presets/gameOver';
```

---

## Part 2: Game UI System

### 2.1 Game Shell (Wrapper for all games)
Create `src/systems/game-ui/GameShell.tsx`:

```typescript
import React, { ReactNode } from 'react';
import { EffectsProvider, EffectsLayer } from '../effects';
import './game-ui.css';

interface GameShellProps {
  children: ReactNode;
  gameId: string;
  className?: string;
}

/**
 * GameShell wraps every game with:
 * - Effects system
 * - Common styling
 * - Accessibility attributes
 */
export const GameShell: React.FC<GameShellProps> = ({
  children,
  gameId,
  className = ''
}) => {
  return (
    <EffectsProvider>
      <div
        className={`game-shell game-shell-${gameId} ${className}`}
        data-game-id={gameId}
        role="application"
        aria-label={`${gameId} game`}
      >
        {children}
        <EffectsLayer />
      </div>
    </EffectsProvider>
  );
};
```

### 2.2 Unified Game Over Screen
Create `src/systems/game-ui/GameOverScreen.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { IonButton, IonSpinner } from '@ionic/react';
import { useEffects, getGameOverPreset } from '../effects';
import { CurrencyEarnedDisplay } from './CurrencyEarnedDisplay';
import { LeaderboardPreview } from './LeaderboardPreview';
import './game-ui.css';

interface GameOverScreenProps {
  isVisible: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;

  // Engagement data
  currencyEarned?: {
    oranges: number;
    gems: number;
    breakdown?: Record<string, number>;
  };
  leaderboardRank?: number;
  isNftHolder?: boolean;
  newAchievements?: Array<{ id: string; name: string; icon: string }>;

  // Callbacks
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onViewLeaderboard?: () => void;
  onShare?: () => void;

  // Game info
  gameName: string;
  gameId: string;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  isVisible,
  score,
  highScore,
  isNewHighScore,
  currencyEarned,
  leaderboardRank,
  isNftHolder = false,
  newAchievements = [],
  onPlayAgain,
  onMainMenu,
  onViewLeaderboard,
  onShare,
  gameName,
  gameId
}) => {
  const { triggerPreset } = useEffects();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger celebration effects
      triggerPreset(getGameOverPreset({
        isHighScore: isNewHighScore,
        isTopTen: !!leaderboardRank && leaderboardRank <= 10,
        score
      }));

      // Stagger content reveal
      setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
  }, [isVisible, isNewHighScore, leaderboardRank, score, triggerPreset]);

  if (!isVisible) return null;

  return (
    <div className="game-over-overlay">
      <div className={`game-over-modal ${showContent ? 'show' : ''}`}>
        {/* Header */}
        <div className="game-over-header">
          <h2 className="game-over-title">
            {isNewHighScore ? '🏆 New High Score!' : 'Game Over'}
          </h2>
        </div>

        {/* Score Display */}
        <div className="game-over-score-section">
          <div className="score-main">
            <span className="score-label">Score</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <div className="score-best">
            <span className="score-label">Best</span>
            <span className="score-value">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Leaderboard Rank (if applicable) */}
        {isNftHolder && leaderboardRank && (
          <div className="leaderboard-rank-display">
            <span className="rank-label">Leaderboard Rank</span>
            <span className="rank-value">#{leaderboardRank}</span>
          </div>
        )}

        {/* NFT Gate Message (if not holder) */}
        {!isNftHolder && (
          <div className="nft-gate-message">
            <span className="gate-icon">🔒</span>
            <p>Set a Wojak NFT as your avatar to compete on the leaderboard!</p>
            <button className="gate-link" onClick={onViewLeaderboard}>
              Learn More →
            </button>
          </div>
        )}

        {/* Currency Earned */}
        {currencyEarned && (currencyEarned.oranges > 0 || currencyEarned.gems > 0) && (
          <CurrencyEarnedDisplay
            oranges={currencyEarned.oranges}
            gems={currencyEarned.gems}
            breakdown={currencyEarned.breakdown}
          />
        )}

        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <div className="new-achievements">
            <h3>Achievements Unlocked!</h3>
            {newAchievements.map((achievement) => (
              <div key={achievement.id} className="achievement-badge">
                <span className="achievement-icon">{achievement.icon}</span>
                <span className="achievement-name">{achievement.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="game-over-actions">
          <IonButton
            onClick={onPlayAgain}
            expand="block"
            className="play-again-button"
          >
            Play Again
          </IonButton>

          <div className="secondary-actions">
            {onShare && (
              <IonButton fill="outline" onClick={onShare}>
                Share
              </IonButton>
            )}
            {onViewLeaderboard && (
              <IonButton fill="outline" onClick={onViewLeaderboard}>
                Leaderboard
              </IonButton>
            )}
            <IonButton fill="clear" onClick={onMainMenu}>
              Menu
            </IonButton>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2.3 Game HUD Component
Create `src/systems/game-ui/GameHUD.tsx`:

```typescript
import React from 'react';
import './game-ui.css';

interface GameHUDProps {
  score: number;
  highScore?: number;
  combo?: number;
  comboTimer?: number; // 0-100 percentage
  timer?: number; // Seconds remaining (for timed games)
  lives?: number;
  level?: number;
  showCombo?: boolean;
  position?: 'top' | 'bottom';
  children?: React.ReactNode; // For game-specific HUD elements
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  combo,
  comboTimer,
  timer,
  lives,
  level,
  showCombo = true,
  position = 'top',
  children
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`game-hud game-hud-${position}`}>
      {/* Left Section: Score */}
      <div className="hud-section hud-left">
        <div className="hud-score">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score.toLocaleString()}</span>
        </div>
        {highScore !== undefined && (
          <div className="hud-best">
            <span className="hud-label">Best</span>
            <span className="hud-value">{highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Center Section: Combo / Timer */}
      <div className="hud-section hud-center">
        {showCombo && combo !== undefined && combo > 1 && (
          <div className={`hud-combo combo-level-${Math.min(combo, 10)}`}>
            <span className="combo-value">{combo}x</span>
            <span className="combo-label">COMBO</span>
            {comboTimer !== undefined && (
              <div className="combo-timer">
                <div
                  className="combo-timer-fill"
                  style={{ width: `${comboTimer}%` }}
                />
              </div>
            )}
          </div>
        )}

        {timer !== undefined && (
          <div className="hud-timer">
            <span className="timer-icon">⏱️</span>
            <span className="timer-value">{formatTime(timer)}</span>
          </div>
        )}
      </div>

      {/* Right Section: Lives / Level */}
      <div className="hud-section hud-right">
        {lives !== undefined && (
          <div className="hud-lives">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="life-icon">❤️</span>
            ))}
          </div>
        )}

        {level !== undefined && (
          <div className="hud-level">
            <span className="hud-label">Level</span>
            <span className="hud-value">{level}</span>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
```

### 2.4 Game UI Styles
Create `src/systems/game-ui/game-ui.css`:

```css
/* ===== GAME SHELL ===== */
.game-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  overflow: hidden;
}

/* ===== GAME HUD ===== */
.game-hud {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  z-index: 100;
  pointer-events: none;
}

.game-hud-top {
  top: 0;
}

.game-hud-bottom {
  bottom: 0;
}

.hud-section {
  display: flex;
  gap: 16px;
  pointer-events: auto;
}

.hud-left {
  justify-content: flex-start;
}

.hud-center {
  justify-content: center;
  flex: 1;
}

.hud-right {
  justify-content: flex-end;
}

/* HUD Score */
.hud-score,
.hud-best,
.hud-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(20, 20, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 140, 50, 0.2);
}

.hud-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hud-value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
}

.hud-score .hud-value {
  color: #FF8C32;
}

/* HUD Combo */
.hud-combo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 20px;
  background: rgba(255, 140, 50, 0.2);
  border-radius: 16px;
  border: 2px solid rgba(255, 140, 50, 0.5);
  animation: combo-pulse 0.5s ease-out;
}

@keyframes combo-pulse {
  0% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.combo-value {
  font-size: 1.8rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.combo-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
}

.combo-timer {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.combo-timer-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF8C32, #FFD700);
  border-radius: 2px;
  transition: width 0.1s linear;
}

/* Combo Level Colors */
.hud-combo.combo-level-2 { border-color: #FFD93D; }
.hud-combo.combo-level-3 { border-color: #FF8C42; }
.hud-combo.combo-level-4 { border-color: #FF6B35; }
.hud-combo.combo-level-5 { border-color: #FF4757; }
.hud-combo.combo-level-6 { border-color: #E91E63; }
.hud-combo.combo-level-7 { border-color: #9B59B6; }
.hud-combo.combo-level-8 { border-color: #3498DB; }
.hud-combo.combo-level-9 { border-color: #00D4FF; }
.hud-combo.combo-level-10 {
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

/* HUD Timer */
.hud-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(20, 20, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.timer-icon {
  font-size: 1.2rem;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

/* HUD Lives */
.hud-lives {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(20, 20, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.life-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 4px rgba(255, 100, 100, 0.5));
}

/* ===== GAME OVER SCREEN ===== */
.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: overlay-fade-in 0.3s ease-out;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.game-over-modal {
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.95));
  border-radius: 24px;
  border: 1px solid rgba(255, 140, 50, 0.3);
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  transform: scale(0.9);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-over-modal.show {
  transform: scale(1);
  opacity: 1;
}

.game-over-header {
  margin-bottom: 24px;
}

.game-over-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

/* Score Section */
.game-over-score-section {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
}

.score-main,
.score-best {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-main .score-value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #FF8C32;
}

.score-best .score-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
}

.score-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Leaderboard Rank */
.leaderboard-rank-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 50, 0.1));
  border-radius: 16px;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.rank-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.rank-value {
  font-size: 2rem;
  font-weight: 900;
  color: #FFD700;
}

/* NFT Gate Message */
.nft-gate-message {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 24px;
}

.gate-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 8px;
}

.nft-gate-message p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.gate-link {
  background: none;
  border: none;
  color: #FF8C32;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
}

/* Actions */
.game-over-actions {
  margin-top: 24px;
}

.play-again-button {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 16px;
  font-weight: 700;
  font-size: 1.1rem;
  height: 56px;
}

.secondary-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.secondary-actions ion-button {
  --color: rgba(255, 255, 255, 0.8);
}

/* ===== CURRENCY EARNED DISPLAY ===== */
.currency-earned-display {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 16px;
}

.currency-earned-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency-icon {
  font-size: 1.5rem;
}

.currency-amount {
  font-size: 1.3rem;
  font-weight: 800;
}

.currency-earned-item.oranges .currency-amount {
  color: #FF8C32;
}

.currency-earned-item.gems .currency-amount {
  color: #9B59B6;
}

/* ===== ACHIEVEMENTS ===== */
.new-achievements {
  margin-bottom: 24px;
}

.new-achievements h3 {
  color: #FFD700;
  font-size: 1rem;
  margin-bottom: 12px;
}

.achievement-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 50, 0.1));
  border-radius: 8px;
  margin-bottom: 8px;
}

.achievement-icon {
  font-size: 1.2rem;
}

.achievement-name {
  color: #fff;
  font-weight: 600;
}
```

---

## Part 3: Engagement Hooks

### 3.1 Master Game Session Hook
Create `src/systems/engagement/useGameSession.ts`:

```typescript
import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLeaderboard } from '../../contexts/LeaderboardContext';
import { useEffects, getGameOverPreset, getAchievementUnlockPreset } from '../effects';
import { GameId, GAME_REWARDS } from '../../types/currency';

interface GameSessionOptions {
  gameId: GameId;
  onHighScore?: (score: number) => void;
  onAchievement?: (achievement: any) => void;
}

interface GameSessionState {
  isPlaying: boolean;
  score: number;
  highScore: number;
  combo: number;
  comboTimer: number;
}

interface GameEndResult {
  score: number;
  isNewHighScore: boolean;
  leaderboardRank?: number;
  currencyEarned: {
    oranges: number;
    gems: number;
    breakdown: Record<string, number>;
  };
  newAchievements: any[];
}

export const useGameSession = (options: GameSessionOptions) => {
  const { gameId, onHighScore, onAchievement } = options;

  const { user } = useAuth();
  const { earnFromGame } = useCurrency();
  const { submitScore, canUserCompete, fetchPersonalStats } = useLeaderboard();
  const { triggerEffect, triggerPreset } = useEffects();

  const [state, setState] = useState<GameSessionState>({
    isPlaying: false,
    score: 0,
    highScore: 0,
    combo: 0,
    comboTimer: 100
  });

  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const personalStatsRef = useRef<any>(null);

  // Load personal stats on mount
  const initSession = useCallback(async () => {
    if (user) {
      const stats = await fetchPersonalStats(gameId);
      personalStatsRef.current = stats;
      setState(prev => ({
        ...prev,
        highScore: stats?.highScore || 0
      }));
    }
  }, [user, gameId, fetchPersonalStats]);

  // Start game
  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      score: 0,
      combo: 0,
      comboTimer: 100
    }));
  }, []);

  // Add score with optional combo
  const addScore = useCallback((points: number, position?: { x: number; y: number }) => {
    setState(prev => {
      const newScore = prev.score + points;

      // Show score popup
      if (position) {
        triggerEffect('score-popup', {
          position,
          data: { score: points }
        });
      }

      return { ...prev, score: newScore };
    });
  }, [triggerEffect]);

  // Increment combo
  const incrementCombo = useCallback((position?: { x: number; y: number }) => {
    // Clear existing timeout
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }

    setState(prev => {
      const newCombo = prev.combo + 1;

      // Trigger combo effects
      if (newCombo > 1 && position) {
        const preset = getComboPreset(newCombo, position);
        triggerPreset(preset);
      }

      return {
        ...prev,
        combo: newCombo,
        comboTimer: 100
      };
    });

    // Start combo decay
    comboTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, combo: 0, comboTimer: 0 }));
    }, 2000); // 2 second combo window
  }, [triggerPreset]);

  // Reset combo
  const resetCombo = useCallback(() => {
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    setState(prev => ({ ...prev, combo: 0, comboTimer: 0 }));
  }, []);

  // End game and process results
  const endGame = useCallback(async (): Promise<GameEndResult> => {
    setState(prev => ({ ...prev, isPlaying: false }));

    const currentScore = state.score;
    const isNewHighScore = currentScore > state.highScore;

    // Update high score locally
    if (isNewHighScore) {
      setState(prev => ({ ...prev, highScore: currentScore }));
      onHighScore?.(currentScore);
    }

    // Submit score to leaderboard
    const scoreResult = await submitScore(gameId, currentScore);
    const leaderboardRank = canUserCompete() ? scoreResult.newRank : undefined;

    // Earn currency
    const currencyResult = await earnFromGame(
      gameId,
      currentScore,
      isNewHighScore,
      leaderboardRank
    );

    // Trigger game over effects
    triggerPreset(getGameOverPreset({
      isHighScore: isNewHighScore,
      isTopTen: !!leaderboardRank && leaderboardRank <= 10,
      score: currentScore
    }));

    // Check for achievements (would be implemented in achievement system)
    const newAchievements: any[] = [];

    return {
      score: currentScore,
      isNewHighScore,
      leaderboardRank,
      currencyEarned: {
        oranges: currencyResult.orangesEarned,
        gems: currencyResult.gemsEarned,
        breakdown: currencyResult.breakdown
      },
      newAchievements
    };
  }, [
    state.score,
    state.highScore,
    gameId,
    submitScore,
    canUserCompete,
    earnFromGame,
    triggerPreset,
    onHighScore
  ]);

  return {
    // State
    ...state,
    isNftHolder: canUserCompete(),

    // Actions
    initSession,
    startGame,
    addScore,
    incrementCombo,
    resetCombo,
    endGame,

    // Effects (exposed for custom use)
    triggerEffect,
    triggerPreset
  };
};
```

### 3.2 Engagement Index
Create `src/systems/engagement/index.ts`:

```typescript
export { useGameSession } from './useGameSession';
```

---

## Part 4: Theme System

### 4.1 Color Variables
Create `src/systems/theme/colors.css`:

```css
:root {
  /* Brand Colors */
  --color-primary: #FF8C32;
  --color-primary-light: #FFA552;
  --color-primary-dark: #FF6420;

  /* Accent Colors */
  --color-accent: #FFD700;
  --color-accent-light: #FFE44D;
  --color-accent-dark: #E6C200;

  /* Background */
  --color-bg-primary: #0f0f1a;
  --color-bg-secondary: #1a1a2e;
  --color-bg-tertiary: #252540;

  /* Surface (cards, modals) */
  --color-surface: rgba(20, 20, 35, 0.95);
  --color-surface-light: rgba(30, 30, 50, 0.9);

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
  --color-text-tertiary: rgba(255, 255, 255, 0.5);

  /* Currency */
  --color-oranges: #FF8C32;
  --color-gems: #9B59B6;

  /* Status */
  --color-success: #4CAF50;
  --color-warning: #FFD93D;
  --color-error: #FF4757;
  --color-info: #3498DB;

  /* Combo Colors (escalating intensity) */
  --color-combo-1: #FFFFFF;
  --color-combo-2: #FFD93D;
  --color-combo-3: #FF8C42;
  --color-combo-4: #FF6B35;
  --color-combo-5: #FF4757;
  --color-combo-6: #E91E63;
  --color-combo-7: #9B59B6;
  --color-combo-8: #3498DB;
  --color-combo-9: #00D4FF;
  --color-combo-10: #FFD700;

  /* Rarity Colors */
  --color-rarity-common: #95A5A6;
  --color-rarity-rare: #3498DB;
  --color-rarity-epic: #9B59B6;
  --color-rarity-legendary: #FFD700;
}
```

### 4.2 Glassmorphism Classes
Create `src/systems/theme/glassmorphism.css`:

```css
/* Glass Panel - Primary */
.glass-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Glass Panel - Dark */
.glass-panel-dark {
  background: linear-gradient(
    135deg,
    rgba(20, 20, 35, 0.95),
    rgba(30, 30, 50, 0.9)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 140, 50, 0.2);
  border-radius: 16px;
}

/* Glass Panel - Accent */
.glass-panel-accent {
  background: linear-gradient(
    135deg,
    rgba(255, 140, 50, 0.15),
    rgba(255, 100, 50, 0.1)
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 140, 50, 0.3);
  border-radius: 16px;
}

/* Glass Button */
.glass-button {
  background: linear-gradient(
    135deg,
    rgba(255, 140, 50, 0.3),
    rgba(255, 100, 50, 0.2)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 140, 50, 0.4);
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  transition: all 0.2s ease;
}

.glass-button:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 140, 50, 0.4),
    rgba(255, 100, 50, 0.3)
  );
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 140, 50, 0.3);
}

/* Glass Input */
.glass-input {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  padding: 12px 16px;
}

.glass-input:focus {
  border-color: rgba(255, 140, 50, 0.5);
  outline: none;
}

.glass-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
```

### 4.3 Theme Index
Create `src/systems/theme/index.css`:

```css
@import './colors.css';
@import './glassmorphism.css';
@import './animations.css';
@import './typography.css';
@import './spacing.css';
```

---

## Part 5: Migration Guide for Existing Games

To migrate an existing game to use shared systems:

### Step 1: Update imports
```typescript
// Before
import './OrangeStack.css';

// After
import '../../systems/theme/index.css';
import '../../systems/effects/effects.css';
import '../../systems/game-ui/game-ui.css';
import './OrangeStack.game.css'; // Only game-SPECIFIC styles
```

### Step 2: Wrap with GameShell
```typescript
// Before
return (
  <div className="orange-stack-game">
    {/* game content */}
  </div>
);

// After
import { GameShell } from '../../systems/game-ui';

return (
  <GameShell gameId="orange-stack">
    {/* game content */}
  </GameShell>
);
```

### Step 3: Use shared effects
```typescript
// Before - custom effect implementation
const triggerConfetti = () => {
  // Custom confetti code...
};

// After - use shared system
import { useEffects, getComboPreset } from '../../systems/effects';

const { triggerPreset } = useEffects();
triggerPreset(getComboPreset(combo, { x: 50, y: 50 }));
```

### Step 4: Use engagement hooks
```typescript
// Before - custom score handling
const [score, setScore] = useState(0);

// After - use game session
import { useGameSession } from '../../systems/engagement';

const {
  score,
  highScore,
  combo,
  addScore,
  incrementCombo,
  endGame
} = useGameSession({ gameId: 'orange-stack' });
```

### Step 5: Use shared GameOverScreen
```typescript
// Before - custom game over UI
{showGameOver && <div className="custom-game-over">...</div>}

// After - use shared component
import { GameOverScreen } from '../../systems/game-ui';

<GameOverScreen
  isVisible={showGameOver}
  score={score}
  highScore={highScore}
  isNewHighScore={isNewHighScore}
  currencyEarned={currencyEarned}
  onPlayAgain={handlePlayAgain}
  onMainMenu={handleMainMenu}
  gameName="Orange Stack"
  gameId="orange-stack"
/>
```

---

## Implementation Checklist

- [ ] Create `src/systems/` folder structure
- [ ] Implement EffectsProvider and all effect components
- [ ] Create effect presets (combo, gameOver, achievement)
- [ ] Build shared game-ui components (GameShell, GameHUD, GameOverScreen)
- [ ] Create engagement hooks (useGameSession)
- [ ] Set up theme system (colors, glassmorphism)
- [ ] Export everything from index files
- [ ] Migrate OrangeStack to use shared systems (as reference)
- [ ] Migrate remaining 8 games
- [ ] Remove duplicate code from individual game files
- [ ] Test all games still work correctly

---

## Benefits After Migration

1. **Update confetti once** → All 9 games get better confetti
2. **Improve HUD design** → All games update automatically
3. **Add new effect** → Available to all games immediately
4. **Change accent color** → Entire app updates
5. **New game creation** → Just import systems, add game logic only
