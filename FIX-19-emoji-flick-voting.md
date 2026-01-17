# FIX-19: Emoji Flick Voting System with Heatmap Rain

> **FOR CLAUDE CLI**: Read this entire file carefully. This is a complete implementation guide with TWO phases:
> 1. **Phase 1**: Core voting system (flick emojis at cards)
> 2. **Phase 2**: Heatmap rain visualization (see all votes rain down and pile up)
>
> Create ALL files listed and modify GamesHub.tsx, GamesGrid.tsx, and GameCard.tsx. Follow the code exactly.
>
> **IMPORTANT**: This system uses generic `targetId` and `pageType` naming to support voting on ANY page (Games, Gallery, Media, etc.) in the future. For Games page, use `pageType: 'games'`.

---

## 📋 OVERVIEW

### What We're Building

**Phase 1 - Voting System**:
- Toggle buttons (🍩 donut/like, 💩 poop/dislike) in bottom-right
- Click cards to fling emojis with gravity arc
- Emoji splashes into 4 pieces on impact
- Vote counts saved to backend + shown on cards

**Phase 2 - Heatmap Rain**:
- "Show Votes" button next to toggle buttons
- Filter by 🍩 or 💩
- ALL votes (up to 200) rain down from the top of the screen
- Each emoji falls to the EXACT position where users clicked
- Emojis pile up showing density (more votes = bigger pile)
- Landing animation: big → squish → shrink into pile

### Future-Proof Design

The system uses **generic naming** to work on any page:
- `targetId` - The ID of the item being voted on (game, NFT, media, etc.)
- `pageType` - Which page the vote is on (`'games'`, `'gallery'`, `'media'`, etc.)
- `data-vote-target` - HTML attribute for identifying voteable items

---

## 🎯 PHASE 1: CORE VOTING SYSTEM

### Visual States

#### IDLE STATE (nothing selected)
- Both 🍩 and 💩 buttons visible, grayscale, gently floating
- On hover: brightens, enlarges slightly

#### SELECTED STATE (one emoji active)
- Selected: Full color, glowing border, pulse animation, sparkles
- Unselected: Stays grayscale, smaller (0.9 scale), static

#### FLIGHT ANIMATION
- Emoji spawns at toggle button
- Parabolic gravity arc to click position
- 360° spin during flight
- ~500ms duration

#### SPLATTER IMPACT
- 4 emoji pieces fly outward (↖ ↗ ↙ ↘)
- Shockwave ring expands
- Particle debris scatters
- Sound effect plays

---

## 🎯 PHASE 2: HEATMAP RAIN VISUALIZATION

### How It Works

1. User clicks "Show 🍩 Votes" or "Show 💩 Votes" button
2. Screen dims slightly (overlay)
3. Up to 200 emojis spawn at top of screen (staggered)
4. Each falls with gravity to its stored X,Y position
5. On landing: emoji squishes, then shrinks and joins the pile
6. Nearby emojis stack on top of each other
7. Result: Visual density map showing where most votes clustered

### Coordinate System

We store clicks as **percentages relative to the target card**:
```
xPercent = ((clickX - cardRect.left) / cardRect.width) * 100
yPercent = ((clickY - cardRect.top) / cardRect.height) * 100
```

This ensures votes display correctly on all screen sizes.

### Performance Strategy

- **Cap at 200 most recent votes** per filter
- **Stagger animation**: 20ms delay between each emoji (total 4s for 200)
- **Spatial clustering**: Nearby emojis stack vertically
- **Cleanup**: Remove rain after 10 seconds

---

## 📁 FILES TO CREATE

### 1. `src/components/voting/FlickModeToggle.tsx`

```tsx
/**
 * Toggle buttons for selecting donut or poop flick mode
 * PLUS heatmap rain trigger buttons
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './FlickModeToggle.css';

interface FlickModeToggleProps {
  activeMode: 'donut' | 'poop' | null;
  onModeChange: (mode: 'donut' | 'poop' | null) => void;
  donutBalance: number;
  onShowHeatmap: (type: 'donut' | 'poop') => void;
  isHeatmapLoading: boolean;
}

// Floating animation for idle buttons
const floatAnimation = {
  y: [0, -6, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Wobble animation for selected button
const wobbleAnimation = {
  rotate: [-3, 3, -3],
  transition: {
    duration: 0.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

export const FlickModeToggle = forwardRef<HTMLDivElement, FlickModeToggleProps>(
  ({ activeMode, onModeChange, donutBalance, onShowHeatmap, isHeatmapLoading }, ref) => {
    const handleToggle = (mode: 'donut' | 'poop') => {
      if (activeMode === mode) {
        onModeChange(null);
      } else {
        onModeChange(mode);
      }
    };

    const isDonutSelected = activeMode === 'donut';
    const isPoopSelected = activeMode === 'poop';
    const hasSelection = activeMode !== null;

    return (
      <div ref={ref} className="flick-mode-toggle">
        {/* Balance display */}
        <div className="flick-mode-balance">
          🍩 {donutBalance}
        </div>

        {/* Donut button (like) */}
        <motion.button
          className={`flick-mode-btn ${isDonutSelected ? 'selected' : ''} ${hasSelection && !isDonutSelected ? 'inactive' : ''}`}
          onClick={() => handleToggle('donut')}
          animate={isDonutSelected ? wobbleAnimation : (!hasSelection ? floatAnimation : {})}
          whileHover={{ scale: 1.1, filter: 'saturate(1)' }}
          whileTap={{ scale: 0.95 }}
          aria-label="Flick donuts (like)"
          aria-pressed={isDonutSelected}
        >
          <span className="btn-emoji">🍩</span>
          {isDonutSelected && <div className="glow-ring" />}
          {isDonutSelected && <div className="sparkles" />}
        </motion.button>

        {/* Poop button (dislike) */}
        <motion.button
          className={`flick-mode-btn ${isPoopSelected ? 'selected' : ''} ${hasSelection && !isPoopSelected ? 'inactive' : ''}`}
          onClick={() => handleToggle('poop')}
          animate={isPoopSelected ? wobbleAnimation : (!hasSelection ? floatAnimation : {})}
          whileHover={{ scale: 1.1, filter: 'saturate(1)' }}
          whileTap={{ scale: 0.95 }}
          aria-label="Flick poop (dislike)"
          aria-pressed={isPoopSelected}
        >
          <span className="btn-emoji">💩</span>
          {isPoopSelected && <div className="glow-ring" />}
          {isPoopSelected && <div className="sparkles" />}
        </motion.button>

        {/* Divider */}
        <div className="flick-mode-divider" />

        {/* Heatmap buttons */}
        <motion.button
          className="heatmap-btn"
          onClick={() => onShowHeatmap('donut')}
          disabled={isHeatmapLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Show all donut votes"
        >
          👁️ 🍩
        </motion.button>

        <motion.button
          className="heatmap-btn"
          onClick={() => onShowHeatmap('poop')}
          disabled={isHeatmapLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Show all poop votes"
        >
          👁️ 💩
        </motion.button>
      </div>
    );
  }
);

FlickModeToggle.displayName = 'FlickModeToggle';
```

---

### 2. `src/components/voting/FlickModeToggle.css`

```css
/* ============================================
   FLICK MODE TOGGLE CONTAINER
   ============================================ */
.flick-mode-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  padding: 12px 16px;
  background: rgba(20, 15, 10, 0.95);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.flick-mode-balance {
  font-size: 16px;
  font-weight: 700;
  color: #ff9500;
  padding-right: 10px;
  border-right: 2px solid rgba(255, 255, 255, 0.1);
  text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
}

.flick-mode-divider {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 4px;
}

/* ============================================
   EMOJI BUTTONS - BASE STATE
   ============================================ */
.flick-mode-btn {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, #2a2520, #1a1510);
  border: 2px solid rgba(255, 255, 255, 0.1);
  outline: none;
  overflow: visible;
  filter: saturate(0.7) brightness(0.9);
}

.flick-mode-btn .btn-emoji {
  position: relative;
  z-index: 2;
  transition: transform 0.2s ease;
}

.flick-mode-btn:hover {
  filter: saturate(1) brightness(1);
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.2);
}

/* ============================================
   INACTIVE STATE
   ============================================ */
.flick-mode-btn.inactive {
  filter: saturate(0.3) brightness(0.6);
  transform: scale(0.9);
  opacity: 0.7;
}

.flick-mode-btn.inactive:hover {
  filter: saturate(0.5) brightness(0.8);
  transform: scale(0.95);
}

/* ============================================
   SELECTED STATE
   ============================================ */
.flick-mode-btn.selected {
  filter: saturate(1.2) brightness(1.1);
  transform: scale(1);
  border-color: #ff9500;
  background: linear-gradient(145deg, #3a3025, #2a2015);
  box-shadow:
    0 0 20px rgba(255, 149, 0, 0.4),
    0 0 40px rgba(255, 149, 0, 0.2),
    inset 0 0 20px rgba(255, 149, 0, 0.1);
}

.glow-ring {
  position: absolute;
  inset: -4px;
  border-radius: 20px;
  border: 2px solid #ff9500;
  opacity: 0.8;
  animation: glowPulse 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
    box-shadow: 0 0 15px rgba(255, 149, 0, 0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(255, 149, 0, 0.8);
  }
}

.sparkles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  background-image:
    radial-gradient(circle, #fff 1px, transparent 1px),
    radial-gradient(circle, #ff9500 1px, transparent 1px),
    radial-gradient(circle, #fff 1px, transparent 1px),
    radial-gradient(circle, #ff9500 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 5px 5px, 15px 10px, 10px 18px, 2px 12px;
  animation: sparkleFloat 2s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes sparkleFloat {
  0%, 100% { opacity: 0.4; transform: translateY(0) rotate(0deg); }
  50% { opacity: 0.8; transform: translateY(-5px) rotate(5deg); }
}

/* ============================================
   HEATMAP BUTTONS
   ============================================ */
.heatmap-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  background: linear-gradient(145deg, #252520, #1a1a15);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.2s ease;
}

.heatmap-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #353530, #2a2a25);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 149, 0, 0.2);
}

.heatmap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   MOBILE ADJUSTMENTS
   ============================================ */
@media (max-width: 768px) {
  .flick-mode-toggle {
    bottom: 90px;
    right: 12px;
    padding: 10px 12px;
    gap: 8px;
    flex-wrap: wrap;
    max-width: calc(100vw - 24px);
    justify-content: center;
  }

  .flick-mode-btn {
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-radius: 14px;
  }

  .flick-mode-balance {
    font-size: 14px;
  }

  .heatmap-btn {
    font-size: 14px;
    padding: 6px 10px;
  }

  .flick-mode-divider {
    display: none;
  }
}
```

---

### 3. `src/components/voting/FlyingEmoji.tsx`

```tsx
/**
 * Animated emoji that flies from toggle button to target with gravity arc
 */

import { motion } from 'framer-motion';

interface FlyingEmojiProps {
  type: 'donut' | 'poop';
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  onComplete: () => void;
}

export function FlyingEmoji({ type, startPosition, endPosition, onComplete }: FlyingEmojiProps) {
  const emoji = type === 'donut' ? '🍩' : '💩';

  const midX = (startPosition.x + endPosition.x) / 2;
  const distance = Math.sqrt(
    Math.pow(endPosition.x - startPosition.x, 2) +
    Math.pow(endPosition.y - startPosition.y, 2)
  );
  const arcHeight = Math.min(180, Math.max(80, distance * 0.35));
  const baseY = Math.min(startPosition.y, endPosition.y);
  const peakY = baseY - arcHeight;

  return (
    <motion.div
      className="flying-emoji"
      style={{
        position: 'fixed',
        fontSize: '42px',
        pointerEvents: 'none',
        zIndex: 9998,
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
      }}
      initial={{
        x: startPosition.x - 21,
        y: startPosition.y - 21,
        scale: 0.3,
        opacity: 1,
        rotate: 0,
      }}
      animate={{
        x: [startPosition.x - 21, midX - 21, endPosition.x - 21],
        y: [startPosition.y - 21, peakY - 21, endPosition.y - 21],
        scale: [0.3, 1.3, 1],
        opacity: 1,
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        times: [0, 0.45, 1],
      }}
      onAnimationComplete={onComplete}
    >
      {emoji}
    </motion.div>
  );
}
```

---

### 4. `src/components/voting/SplatterEffect.tsx`

```tsx
/**
 * Splatter effect - emoji splits into 4 pieces on impact
 */

import { motion } from 'framer-motion';

interface SplatterEffectProps {
  type: 'donut' | 'poop';
  position: { x: number; y: number };
  onComplete: () => void;
}

const pieceDirections = [
  { x: -60, y: -50, rotate: -180 },
  { x: 60, y: -50, rotate: 180 },
  { x: -50, y: 60, rotate: -90 },
  { x: 50, y: 60, rotate: 90 },
];

export function SplatterEffect({ type, position, onComplete }: SplatterEffectProps) {
  const emoji = type === 'donut' ? '🍩' : '💩';

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Shockwave ring */}
      <motion.div
        style={{
          position: 'absolute',
          left: -40,
          top: -40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: `3px solid ${type === 'donut' ? 'rgba(255, 180, 100, 0.8)' : 'rgba(139, 90, 43, 0.8)'}`,
        }}
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />

      {/* Inner flash */}
      <motion.div
        style={{
          position: 'absolute',
          left: -30,
          top: -30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: type === 'donut'
            ? 'radial-gradient(circle, rgba(255,200,150,0.9) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,90,43,0.9) 0%, transparent 70%)',
        }}
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* 4 emoji pieces */}
      {pieceDirections.map((dir, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            left: -16,
            top: -16,
            fontSize: '32px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: dir.x,
            y: dir.y + 20,
            scale: [1, 0.8, 0.4],
            opacity: [1, 0.8, 0],
            rotate: dir.rotate,
          }}
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.6, 1] }}
          onAnimationComplete={index === 0 ? onComplete : undefined}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Particle debris */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: -4,
            top: -4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: type === 'donut' ? '#ffb366' : '#8B5A2B',
          }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 100 + 30,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: Math.random() * 0.1 }}
        />
      ))}
    </div>
  );
}
```

---

### 5. `src/components/voting/HeatmapRain.tsx`

```tsx
/**
 * HEATMAP RAIN VISUALIZATION
 * Emojis rain down from the sky and pile up where users voted
 *
 * Uses generic targetId to work with any page (games, gallery, media, etc.)
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VotePosition {
  id: string;
  xPercent: number;
  yPercent: number;
  targetId: string;
}

interface HeatmapRainProps {
  votes: VotePosition[];
  type: 'donut' | 'poop';
  containerRef: React.RefObject<HTMLElement>;
  onComplete: () => void;
}

interface PiledEmoji {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

// Cluster nearby emojis for pile effect
function clusterVotes(votes: VotePosition[], threshold: number = 5): Map<string, VotePosition[]> {
  const clusters = new Map<string, VotePosition[]>();

  votes.forEach(vote => {
    const cellX = Math.floor(vote.xPercent / threshold);
    const cellY = Math.floor(vote.yPercent / threshold);
    const key = `${vote.targetId}-${cellX}-${cellY}`;

    const existing = clusters.get(key) || [];
    existing.push(vote);
    clusters.set(key, existing);
  });

  return clusters;
}

export function HeatmapRain({ votes, type, containerRef, onComplete }: HeatmapRainProps) {
  const emoji = type === 'donut' ? '🍩' : '💩';
  const [fallingEmojis, setFallingEmojis] = useState<string[]>([]);
  const [piledEmojis, setPiledEmojis] = useState<PiledEmoji[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Calculate absolute positions from percentages
  const getAbsolutePosition = (xPercent: number, yPercent: number, targetId: string) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    // Find the target element using data-vote-target attribute
    const targetElement = container.querySelector(`[data-vote-target="${targetId}"]`);
    if (!targetElement) {
      // Fallback to container
      const rect = container.getBoundingClientRect();
      return {
        x: rect.left + (xPercent / 100) * rect.width,
        y: rect.top + (yPercent / 100) * rect.height,
      };
    }

    const targetRect = targetElement.getBoundingClientRect();
    return {
      x: targetRect.left + (xPercent / 100) * targetRect.width,
      y: targetRect.top + (yPercent / 100) * targetRect.height,
    };
  };

  // Cluster votes for pile stacking
  const clusters = useMemo(() => clusterVotes(votes), [votes]);

  // Start the rain animation
  useEffect(() => {
    const ids = votes.map(v => v.id);
    ids.forEach((id, index) => {
      setTimeout(() => {
        setFallingEmojis(prev => [...prev, id]);
      }, index * 20);
    });

    const totalDuration = votes.length * 20 + 3000;
    const cleanupTimer = setTimeout(() => {
      setIsComplete(true);
      setTimeout(onComplete, 500);
    }, totalDuration + 5000);

    return () => clearTimeout(cleanupTimer);
  }, [votes, onComplete]);

  // Handle emoji landing
  const handleLand = (vote: VotePosition, clusterKey: string) => {
    const cluster = clusters.get(clusterKey) || [];
    const indexInCluster = cluster.findIndex(v => v.id === vote.id);
    const pos = getAbsolutePosition(vote.xPercent, vote.yPercent, vote.targetId);

    setPiledEmojis(prev => {
      const newEmoji: PiledEmoji = {
        id: vote.id,
        x: pos.x + (Math.random() - 0.5) * 20,
        y: pos.y - indexInCluster * 8,
        scale: 0.5 + Math.random() * 0.2,
        rotation: (Math.random() - 0.5) * 40,
        zIndex: prev.length,
      };
      return [...prev, newEmoji];
    });

    setFallingEmojis(prev => prev.filter(id => id !== vote.id));
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="heatmap-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: isComplete ? 0 : 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9000,
          pointerEvents: isComplete ? 'none' : 'auto',
        }}
      />

      {/* Falling emojis */}
      <AnimatePresence>
        {votes.map(vote => {
          if (!fallingEmojis.includes(vote.id)) return null;

          const cellX = Math.floor(vote.xPercent / 5);
          const cellY = Math.floor(vote.yPercent / 5);
          const clusterKey = `${vote.targetId}-${cellX}-${cellY}`;
          const endPos = getAbsolutePosition(vote.xPercent, vote.yPercent, vote.targetId);

          return (
            <motion.div
              key={vote.id}
              style={{
                position: 'fixed',
                fontSize: '36px',
                pointerEvents: 'none',
                zIndex: 9500,
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
              }}
              initial={{
                x: endPos.x - 18 + (Math.random() - 0.5) * 100,
                y: -60,
                scale: 1.2,
                rotate: Math.random() * 360,
                opacity: 1,
              }}
              animate={{
                x: endPos.x - 18,
                y: endPos.y - 18,
                scale: [1.2, 1.1, 0.6],
                rotate: Math.random() * 720 - 360,
                opacity: 1,
              }}
              transition={{
                duration: 1.5 + Math.random() * 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                scale: {
                  times: [0, 0.9, 1],
                },
              }}
              onAnimationComplete={() => handleLand(vote, clusterKey)}
            >
              {emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Piled emojis (landed) */}
      {piledEmojis.map(item => (
        <motion.div
          key={`piled-${item.id}`}
          style={{
            position: 'fixed',
            left: item.x - 12,
            top: item.y - 12,
            fontSize: '24px',
            pointerEvents: 'none',
            zIndex: 9100 + item.zIndex,
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: item.scale,
            rotate: item.rotation,
            opacity: isComplete ? 0 : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 300,
            opacity: { duration: 0.5 },
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Close button */}
      {!isComplete && (
        <motion.button
          className="heatmap-close-btn"
          onClick={onComplete}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9600,
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✕ Close
        </motion.button>
      )}
    </>
  );
}
```

---

### 6. `src/components/voting/VoteCounter.tsx`

```tsx
/**
 * Vote counter badge for cards
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoteCounterProps {
  donutCount: number;
  poopCount: number;
}

export function VoteCounter({ donutCount, poopCount }: VoteCounterProps) {
  const [donutBounce, setDonutBounce] = useState(false);
  const [poopBounce, setPoopBounce] = useState(false);
  const [prevDonut, setPrevDonut] = useState(donutCount);
  const [prevPoop, setPrevPoop] = useState(poopCount);

  useEffect(() => {
    if (donutCount > prevDonut) {
      setDonutBounce(true);
      setTimeout(() => setDonutBounce(false), 400);
    }
    setPrevDonut(donutCount);
  }, [donutCount, prevDonut]);

  useEffect(() => {
    if (poopCount > prevPoop) {
      setPoopBounce(true);
      setTimeout(() => setPoopBounce(false), 400);
    }
    setPrevPoop(poopCount);
  }, [poopCount, prevPoop]);

  return (
    <div className="vote-counter">
      <motion.span
        className="vote-counter-item"
        animate={donutBounce ? { scale: [1, 1.4, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        🍩 {donutCount}
      </motion.span>
      <span className="vote-counter-divider">|</span>
      <motion.span
        className="vote-counter-item"
        animate={poopBounce ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        💩 {poopCount}
      </motion.span>
    </div>
  );
}
```

---

### 7. `src/components/voting/index.ts`

```typescript
export { FlickModeToggle } from './FlickModeToggle';
export { FlyingEmoji } from './FlyingEmoji';
export { SplatterEffect } from './SplatterEffect';
export { HeatmapRain } from './HeatmapRain';
export { VoteCounter } from './VoteCounter';
```

---

### 8. `src/hooks/useFlickVoting.ts`

```typescript
/**
 * Hook for flick voting with backend integration
 *
 * Uses generic targetId and pageType to support voting on any page:
 * - Games page: pageType='games', targetId=gameId
 * - Gallery page: pageType='gallery', targetId=nftId
 * - Media page: pageType='media', targetId=mediaId
 */

import { useState, useCallback, useEffect } from 'react';

// Page types for voting - extend this as you add more pages
export type VotePageType = 'games' | 'gallery' | 'media' | 'shop';

interface VotePosition {
  id: string;
  xPercent: number;
  yPercent: number;
  targetId: string;
  emoji: 'donut' | 'poop';
  createdAt: number;
}

interface VoteCounts {
  donuts: number;
  poops: number;
}

interface VoteStore {
  [targetId: string]: VoteCounts;
}

const API_BASE = '/api/votes';

export function useFlickVoting(pageType: VotePageType) {
  const [activeMode, setActiveMode] = useState<'donut' | 'poop' | null>(null);
  const [votes, setVotes] = useState<VoteStore>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load vote counts on mount
  useEffect(() => {
    fetchVoteCounts();
  }, [pageType]);

  const fetchVoteCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/counts?pageType=${pageType}`);
      if (response.ok) {
        const data = await response.json();
        setVotes(data.counts || {});
      }
    } catch (error) {
      console.error('Failed to fetch vote counts:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(`wojak_votes_${pageType}`);
        if (stored) setVotes(JSON.parse(stored));
      } catch {}
    }
  };

  const getVotes = useCallback((targetId: string): VoteCounts => {
    return votes[targetId] || { donuts: 0, poops: 0 };
  }, [votes]);

  // Add a vote with position data
  const addVote = useCallback(async (
    targetId: string,
    type: 'donut' | 'poop',
    xPercent: number,
    yPercent: number
  ) => {
    // Optimistic update
    setVotes(prev => {
      const current = prev[targetId] || { donuts: 0, poops: 0 };
      return {
        ...prev,
        [targetId]: {
          ...current,
          [type === 'donut' ? 'donuts' : 'poops']:
            current[type === 'donut' ? 'donuts' : 'poops'] + 1,
        },
      };
    });

    // Send to backend
    try {
      await fetch(`${API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          pageType,
          emoji: type,
          xPercent: Math.round(xPercent * 100) / 100,
          yPercent: Math.round(yPercent * 100) / 100,
        }),
      });
    } catch (error) {
      console.error('Failed to save vote:', error);
      // Store in localStorage as backup
      try {
        const stored = localStorage.getItem('wojak_pending_votes') || '[]';
        const pending = JSON.parse(stored);
        pending.push({ targetId, pageType, emoji: type, xPercent, yPercent, timestamp: Date.now() });
        localStorage.setItem('wojak_pending_votes', JSON.stringify(pending));
      } catch {}
    }
  }, [pageType]);

  // Fetch votes with positions for heatmap
  const fetchVotesForHeatmap = useCallback(async (
    type: 'donut' | 'poop'
  ): Promise<VotePosition[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/positions?pageType=${pageType}&emoji=${type}&limit=200`);
      if (response.ok) {
        const data = await response.json();
        return data.votes || [];
      }
    } catch (error) {
      console.error('Failed to fetch heatmap votes:', error);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [pageType]);

  return {
    activeMode,
    setActiveMode,
    getVotes,
    addVote,
    fetchVotesForHeatmap,
    isLoading,
  };
}
```

---

### 9. **MODIFY** `src/systems/audio/sounds.ts`

**ADD these new sound definitions to the existing `SOUND_DEFINITIONS` array:**

```typescript
// Add to SoundName type:
// | 'vote-whoosh'     // Emoji flying
// | 'vote-splat'      // Donut impact
// | 'vote-plop'       // Poop impact
// | 'vote-rain'       // Heatmap rain

// Add to SOUND_DEFINITIONS array:
{
  name: 'vote-whoosh',
  url: `${SOUNDS_BASE_URL}/vote-whoosh.mp3`,
  volume: 0.5,
  maxInstances: 3,
  category: 'sfx'
},
{
  name: 'vote-splat',
  url: `${SOUNDS_BASE_URL}/vote-splat.mp3`,
  volume: 0.6,
  maxInstances: 3,
  category: 'sfx'
},
{
  name: 'vote-plop',
  url: `${SOUNDS_BASE_URL}/vote-plop.mp3`,
  volume: 0.6,
  maxInstances: 3,
  category: 'sfx'
},
{
  name: 'vote-rain',
  url: `${SOUNDS_BASE_URL}/vote-rain.mp3`,
  volume: 0.4,
  maxInstances: 1,
  category: 'sfx'
},
```

**Use the existing SoundManager in components:**
```typescript
import { SoundManager } from '@/systems/audio';
// Play sound: SoundManager.play('vote-whoosh');
```

---

### 10. `src/styles/voting.css`

```css
/* ============================================
   VOTE COUNTER ON CARDS
   ============================================ */
.vote-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.vote-counter-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
}

.vote-counter-divider {
  color: rgba(255, 255, 255, 0.3);
  font-weight: 300;
}

/* ============================================
   FLICK MODE ACTIVE STATE
   ============================================ */
.flick-mode-active {
  cursor: crosshair !important;
}

/* Generic voteable card styling - works for any page */
.flick-mode-active [data-vote-target] {
  cursor: crosshair !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.flick-mode-active [data-vote-target]:hover {
  transform: scale(1.02);
  box-shadow:
    0 0 20px rgba(255, 149, 0, 0.3),
    0 0 40px rgba(255, 149, 0, 0.1);
}

/* ============================================
   VOTE BADGE POSITION (use on any card)
   ============================================ */
.vote-target-votes {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

/* ============================================
   FLYING EMOJI
   ============================================ */
.flying-emoji {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}
```

---

## 🔧 BACKEND: Cloudflare Worker + D1

### 11. `workers/votes/schema.sql`

```sql
-- Vote positions for heatmap
-- Uses generic target_id and page_type to support any page
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target_id TEXT NOT NULL,
  page_type TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('donut', 'poop')),
  x_percent REAL NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent REAL NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  ip_hash TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_id);
CREATE INDEX IF NOT EXISTS idx_votes_page ON votes(page_type);
CREATE INDEX IF NOT EXISTS idx_votes_emoji ON votes(emoji);
CREATE INDEX IF NOT EXISTS idx_votes_page_emoji ON votes(page_type, emoji);
CREATE INDEX IF NOT EXISTS idx_votes_target_emoji ON votes(target_id, emoji);
CREATE INDEX IF NOT EXISTS idx_votes_time ON votes(created_at DESC);

-- Aggregated counts for fast totals
CREATE TABLE IF NOT EXISTS vote_counts (
  target_id TEXT NOT NULL,
  page_type TEXT NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('donut', 'poop')),
  count INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (target_id, page_type, emoji)
);

CREATE INDEX IF NOT EXISTS idx_counts_page ON vote_counts(page_type);
```

---

### 12. `workers/votes/index.ts`

```typescript
/**
 * Cloudflare Worker for vote API
 * Supports voting on any page via pageType parameter
 */

interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /api/votes - Add a vote
      if (request.method === 'POST' && url.pathname === '/api/votes') {
        const body = await request.json() as {
          targetId: string;
          pageType: string;
          emoji: 'donut' | 'poop';
          xPercent: number;
          yPercent: number;
        };

        // Validate
        if (!body.targetId || !body.pageType || !body.emoji ||
            body.xPercent < 0 || body.xPercent > 100 ||
            body.yPercent < 0 || body.yPercent > 100) {
          return new Response(JSON.stringify({ error: 'Invalid data' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Hash IP for privacy
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const ipHash = await hashString(clientIP);

        // Insert vote
        await env.DB.prepare(`
          INSERT INTO votes (target_id, page_type, emoji, x_percent, y_percent, ip_hash)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(body.targetId, body.pageType, body.emoji, body.xPercent, body.yPercent, ipHash).run();

        // Update count
        await env.DB.prepare(`
          INSERT INTO vote_counts (target_id, page_type, emoji, count)
          VALUES (?, ?, ?, 1)
          ON CONFLICT(target_id, page_type, emoji)
          DO UPDATE SET count = count + 1, updated_at = unixepoch()
        `).bind(body.targetId, body.pageType, body.emoji).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/votes/counts - Get vote counts for a page
      if (request.method === 'GET' && url.pathname === '/api/votes/counts') {
        const pageType = url.searchParams.get('pageType');

        let query = 'SELECT target_id, emoji, count FROM vote_counts';
        const params: string[] = [];

        if (pageType) {
          query += ' WHERE page_type = ?';
          params.push(pageType);
        }

        const result = await env.DB.prepare(query).bind(...params).all();

        // Transform to { targetId: { donuts: X, poops: Y } }
        const counts: Record<string, { donuts: number; poops: number }> = {};
        for (const row of result.results as any[]) {
          if (!counts[row.target_id]) {
            counts[row.target_id] = { donuts: 0, poops: 0 };
          }
          counts[row.target_id][row.emoji === 'donut' ? 'donuts' : 'poops'] = row.count;
        }

        return new Response(JSON.stringify({ counts }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // GET /api/votes/positions - Get vote positions for heatmap
      if (request.method === 'GET' && url.pathname === '/api/votes/positions') {
        const pageType = url.searchParams.get('pageType');
        const emoji = url.searchParams.get('emoji') || 'donut';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '200'), 200);
        const targetId = url.searchParams.get('targetId');

        let query = `
          SELECT id, target_id as targetId, x_percent as xPercent, y_percent as yPercent, created_at as createdAt
          FROM votes
          WHERE emoji = ?
        `;
        const params: any[] = [emoji];

        if (pageType) {
          query += ' AND page_type = ?';
          params.push(pageType);
        }

        if (targetId) {
          query += ' AND target_id = ?';
          params.push(targetId);
        }

        query += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        const result = await env.DB.prepare(query).bind(...params).all();

        return new Response(JSON.stringify({
          votes: result.results,
          total: result.results?.length || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response('Not found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str + 'wojak-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

### 13. `workers/votes/wrangler.toml`

```toml
name = "wojak-votes-api"
main = "index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "wojak-votes"
database_id = "YOUR_DATABASE_ID_HERE"
```

---

## 🔧 INTEGRATION: Modifying Existing Components

The voting system needs to integrate with the existing component hierarchy:
- `GamesHub.tsx` - Page wrapper (add voting state, FlickModeToggle, effects)
- `GamesGrid.tsx` - Passes voting props to cards
- `GameCard.tsx` - Handles flick clicks + shows VoteCounter

### 14. **MODIFY** `src/pages/GamesHub.tsx`

```tsx
/**
 * Games Hub Page
 *
 * Dedicated page for all mini-games with /games route.
 * Desktop: 3-column layout (Leaderboard | Games | Stats)
 * Mobile: Scrollable single column layout.
 *
 * UPDATED: Added emoji flick voting system
 */

import { useState, useCallback, useRef } from 'react';
import { PageTransition } from '@/components/layout/PageTransition';
import { useLayout } from '@/hooks/useLayout';
import { GamesGrid, GameModal } from '@/components/media';
import { LeaderboardPanel } from '@/components/media/games/LeaderboardPanel';
import { StatsPanel } from '@/components/media/games/StatsPanel';
import { useMediaContent } from '@/hooks/data/useMediaData';
import type { MiniGame } from '@/types/media';

// Voting imports
import {
  FlickModeToggle,
  FlyingEmoji,
  SplatterEffect,
  HeatmapRain,
} from '@/components/voting';
import { useFlickVoting } from '@/hooks/useFlickVoting';
import { SoundManager } from '@/systems/audio';
import '@/styles/voting.css';

export default function GamesHub() {
  const { contentPadding, isDesktop } = useLayout();

  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);

  // Fetch games using TanStack Query
  const { games, isLoading } = useMediaContent('all');

  // === VOTING STATE ===
  const {
    activeMode,
    setActiveMode,
    getVotes,
    addVote,
    fetchVotesForHeatmap,
    isLoading: isVotingLoading,
  } = useFlickVoting('games');

  const toggleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [flickState, setFlickState] = useState<{
    flyingEmoji: {
      type: 'donut' | 'poop';
      start: { x: number; y: number };
      end: { x: number; y: number };
      targetId: string;
      xPercent: number;
      yPercent: number;
    } | null;
    splatter: {
      type: 'donut' | 'poop';
      position: { x: number; y: number };
    } | null;
  }>({
    flyingEmoji: null,
    splatter: null,
  });

  const [heatmapState, setHeatmapState] = useState<{
    isActive: boolean;
    type: 'donut' | 'poop';
    votes: Array<{
      id: string;
      xPercent: number;
      yPercent: number;
      targetId: string;
    }>;
  }>({
    isActive: false,
    type: 'donut',
    votes: [],
  });

  // === HANDLERS ===
  const handleGameSelect = useCallback((game: MiniGame) => {
    // Don't open game if flick mode is active
    if (activeMode) return;
    setSelectedGame(game);
    setGameModalOpen(true);
  }, [activeMode]);

  const handleGameModalClose = useCallback(() => {
    setGameModalOpen(false);
    setSelectedGame(null);
  }, []);

  const getTogglePosition = useCallback(() => {
    if (!toggleRef.current) {
      return { x: window.innerWidth - 60, y: window.innerHeight - 60 };
    }
    const rect = toggleRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Handle card flick (called from GameCard)
  const handleCardFlick = useCallback((
    gameId: string,
    clickX: number,
    clickY: number,
    cardRect: DOMRect
  ) => {
    if (!activeMode || flickState.flyingEmoji) return;

    const startPos = getTogglePosition();
    const xPercent = ((clickX - cardRect.left) / cardRect.width) * 100;
    const yPercent = ((clickY - cardRect.top) / cardRect.height) * 100;

    SoundManager.play('vote-whoosh');

    setFlickState({
      flyingEmoji: {
        type: activeMode,
        start: startPos,
        end: { x: clickX, y: clickY },
        targetId: gameId,
        xPercent,
        yPercent,
      },
      splatter: null,
    });
  }, [activeMode, flickState.flyingEmoji, getTogglePosition]);

  const handleEmojiLand = useCallback(() => {
    if (!flickState.flyingEmoji) return;

    const { type, end, targetId, xPercent, yPercent } = flickState.flyingEmoji;

    SoundManager.play(type === 'donut' ? 'vote-splat' : 'vote-plop');
    addVote(targetId, type, xPercent, yPercent);

    setFlickState({
      flyingEmoji: null,
      splatter: { type, position: end },
    });
  }, [flickState.flyingEmoji, addVote]);

  const handleSplatterComplete = useCallback(() => {
    setFlickState(prev => ({ ...prev, splatter: null }));
  }, []);

  const handleShowHeatmap = useCallback(async (type: 'donut' | 'poop') => {
    SoundManager.play('vote-rain');
    const votes = await fetchVotesForHeatmap(type);
    setHeatmapState({ isActive: true, type, votes });
  }, [fetchVotesForHeatmap]);

  const handleCloseHeatmap = useCallback(() => {
    setHeatmapState(prev => ({ ...prev, isActive: false, votes: [] }));
  }, []);

  // === RENDER ===
  const gamesGridWithVoting = (
    <GamesGrid
      games={games}
      onGameSelect={handleGameSelect}
      isLoading={isLoading}
      // Voting props
      flickModeActive={activeMode}
      onFlick={handleCardFlick}
      getVotes={getVotes}
    />
  );

  // Desktop: 3-column layout that fits viewport
  if (isDesktop) {
    return (
      <PageTransition>
        <div
          ref={containerRef}
          className={activeMode ? 'flick-mode-active' : ''}
          style={{
            padding: contentPadding,
            height: 'calc(100vh - 64px)',
            maxHeight: 'calc(100dvh - 64px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '220px 1fr 220px',
              gap: '20px',
              minHeight: 0,
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
            }}
          >
            <LeaderboardPanel />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 0 }}>
              {gamesGridWithVoting}
            </div>
            <StatsPanel />
          </div>
        </div>

        {/* Game Modal */}
        <GameModal game={selectedGame} isOpen={gameModalOpen} onClose={handleGameModalClose} />

        {/* Voting UI */}
        <FlickModeToggle
          ref={toggleRef}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          donutBalance={100}
          onShowHeatmap={handleShowHeatmap}
          isHeatmapLoading={isVotingLoading}
        />

        {flickState.flyingEmoji && (
          <FlyingEmoji
            type={flickState.flyingEmoji.type}
            startPosition={flickState.flyingEmoji.start}
            endPosition={flickState.flyingEmoji.end}
            onComplete={handleEmojiLand}
          />
        )}

        {flickState.splatter && (
          <SplatterEffect
            type={flickState.splatter.type}
            position={flickState.splatter.position}
            onComplete={handleSplatterComplete}
          />
        )}

        {heatmapState.isActive && (
          <HeatmapRain
            votes={heatmapState.votes}
            type={heatmapState.type}
            containerRef={containerRef}
            onComplete={handleCloseHeatmap}
          />
        )}
      </PageTransition>
    );
  }

  // Mobile: Scrollable single column
  return (
    <PageTransition>
      <div
        ref={containerRef}
        className={activeMode ? 'flick-mode-active' : ''}
        style={{ padding: contentPadding, minHeight: '100%' }}
      >
        <div style={{ paddingBottom: '96px', paddingTop: '16px' }}>
          {gamesGridWithVoting}
        </div>
      </div>

      <GameModal game={selectedGame} isOpen={gameModalOpen} onClose={handleGameModalClose} />

      {/* Voting UI */}
      <FlickModeToggle
        ref={toggleRef}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        donutBalance={100}
        onShowHeatmap={handleShowHeatmap}
        isHeatmapLoading={isVotingLoading}
      />

      {flickState.flyingEmoji && (
        <FlyingEmoji
          type={flickState.flyingEmoji.type}
          startPosition={flickState.flyingEmoji.start}
          endPosition={flickState.flyingEmoji.end}
          onComplete={handleEmojiLand}
        />
      )}

      {flickState.splatter && (
        <SplatterEffect
          type={flickState.splatter.type}
          position={flickState.splatter.position}
          onComplete={handleSplatterComplete}
        />
      )}

      {heatmapState.isActive && (
        <HeatmapRain
          votes={heatmapState.votes}
          type={heatmapState.type}
          containerRef={containerRef}
          onComplete={handleCloseHeatmap}
        />
      )}
    </PageTransition>
  );
}
```

---

### 15. **MODIFY** `src/components/media/games/GamesGrid.tsx`

**Add voting props to GamesGrid and pass them to GameCard:**

```tsx
/**
 * Games Grid Component
 *
 * Responsive grid of game cards.
 * UPDATED: Added voting props support
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { MiniGame } from '@/types/media';
import { GameCard } from './GameCard';
import { gameGridVariants } from '@/config/mediaAnimations';

interface VoteCounts {
  donuts: number;
  poops: number;
}

interface GamesGridProps {
  games: MiniGame[];
  onGameSelect: (game: MiniGame) => void;
  isLoading?: boolean;
  // Voting props (optional for backward compatibility)
  flickModeActive?: 'donut' | 'poop' | null;
  onFlick?: (gameId: string, clickX: number, clickY: number, cardRect: DOMRect) => void;
  getVotes?: (gameId: string) => VoteCounts;
}

function GameCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="aspect-video" style={{ background: 'var(--color-border)' }} />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded" style={{ background: 'var(--color-border)', width: '70%' }} />
        <div className="h-3 rounded" style={{ background: 'var(--color-border)', width: '50%' }} />
      </div>
    </div>
  );
}

export function GamesGrid({
  games,
  onGameSelect,
  isLoading = false,
  flickModeActive,
  onFlick,
  getVotes,
}: GamesGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="py-2">
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6"
          variants={prefersReducedMotion ? undefined : gameGridVariants}
          initial="initial"
          animate="animate"
        >
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              totalGames={games.length}
              onClick={() => onGameSelect(game)}
              // Voting props
              flickModeActive={flickModeActive}
              onFlick={onFlick}
              votes={getVotes?.(game.id)}
            />
          ))}
        </motion.div>
      )}

      {!isLoading && games.length === 0 && (
        <div
          className="p-8 rounded-xl text-center"
          style={{ background: 'var(--color-glass-bg)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-5xl block mb-4 opacity-30">🎮</span>
          <p style={{ color: 'var(--color-text-muted)' }}>No games available yet</p>
        </div>
      )}
    </div>
  );
}

export default GamesGrid;
```

---

### 16. **MODIFY** `src/components/media/games/GameCard.tsx`

**Add voting click handling and VoteCounter badge:**

```tsx
/**
 * Game Card Component
 *
 * Individual game card with rank-based visual effects.
 * UPDATED: Added voting support with VoteCounter
 */

import { memo, useMemo, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { MiniGame } from '@/types/media';
import { getRankEffects } from '@/config/games';
import { VoteCounter } from '@/components/voting';

interface VoteCounts {
  donuts: number;
  poops: number;
}

interface GameCardProps {
  game: MiniGame;
  index: number;
  totalGames: number;
  onClick: () => void;
  // Voting props (optional)
  flickModeActive?: 'donut' | 'poop' | null;
  onFlick?: (gameId: string, clickX: number, clickY: number, cardRect: DOMRect) => void;
  votes?: VoteCounts;
}

export const GameCard = memo(function GameCard({
  game,
  index,
  totalGames,
  onClick,
  flickModeActive,
  onFlick,
  votes,
}: GameCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const effects = useMemo(() => getRankEffects(index, totalGames), [index, totalGames]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const backgroundTint = effects.backgroundTint > 0
    ? hexToRgba(effects.color, effects.backgroundTint)
    : 'transparent';

  const cardStyle = {
    background: effects.backgroundTint > 0
      ? `linear-gradient(135deg, ${backgroundTint}, var(--color-glass-bg))`
      : 'var(--color-glass-bg)',
    border: '1px solid var(--color-border)',
    outline: isHovered ? `${effects.borderWidth}px solid ${effects.color}` : 'none',
    outlineOffset: '-1px',
    boxShadow: isHovered
      ? `0 0 ${effects.glowRadius}px ${hexToRgba(effects.color, effects.glowOpacity)}`
      : 'none',
  };

  // Handle click - either flick emoji or open game
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (flickModeActive && onFlick) {
      // Flick mode: send emoji to click position
      const rect = e.currentTarget.getBoundingClientRect();
      onFlick(game.id, e.clientX, e.clientY, rect);
    } else {
      // Normal mode: open game
      onClick();
    }
  }, [flickModeActive, onFlick, onClick, game.id]);

  return (
    <motion.button
      className="relative flex flex-col items-center p-4 rounded-xl text-center cursor-pointer"
      style={cardStyle}
      data-vote-target={game.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { scale: effects.hoverScale }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rank badge for top 3 */}
      {effects.badge && game.status === 'available' && (
        <div
          className="absolute -top-2 -left-2 text-xl pointer-events-none"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))', zIndex: 10 }}
          title={`Ranked ${effects.badge.label}`}
        >
          {effects.badge.emoji}
        </div>
      )}

      {/* Vote counter badge (top-right) */}
      {votes && (votes.donuts > 0 || votes.poops > 0) && (
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <VoteCounter donutCount={votes.donuts} poopCount={votes.poops} />
        </div>
      )}

      {/* Emoji icon */}
      <div className="text-5xl mb-3 pointer-events-none">{game.emoji}</div>

      {/* Name */}
      <h3 className="text-base font-semibold pointer-events-none" style={{ color: 'var(--color-text-primary)' }}>
        {game.name}
      </h3>

      {/* Status badge */}
      {game.status === 'coming-soon' && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium pointer-events-none"
          style={{ background: 'var(--color-brand-primary)', color: 'white' }}
        >
          Coming Soon
        </div>
      )}

      {game.status === 'maintenance' && (
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium pointer-events-none"
          style={{ background: 'var(--color-warning)', color: 'black' }}
        >
          Maintenance
        </div>
      )}
    </motion.button>
  );
});

export default GameCard;
```

---

## 🔮 FUTURE: Adding Voting to Other Pages

To add voting to Gallery, Media, or any other page, just:

1. **Import the components and hook**
2. **Call the hook with the correct pageType**:
   ```tsx
   const { ... } = useFlickVoting('gallery'); // or 'media', 'shop', etc.
   ```
3. **Add `data-vote-target={item.id}` to voteable cards**
4. **Add VoteCounter and wire up handlers** (same as Games.tsx)

The backend and all components already support multiple page types!

---

## 🔊 SOUND FILES

Place in `public/assets/sounds/`:
- `vote-whoosh.mp3` - Air swoosh (~200ms)
- `vote-splat.mp3` - Soft donut impact (~300ms)
- `vote-plop.mp3` - Comedic poop plop (~300ms)
- `vote-rain.mp3` - Light rain/falling sound (~2s, loopable)

---

## ✅ TESTING CHECKLIST

### Phase 1: Voting
- [ ] Toggle buttons appear, grayscale, floating animation
- [ ] Select donut → glows, poop goes dim
- [ ] Click card → emoji flies with arc
- [ ] Emoji splatters into 4 pieces on impact
- [ ] Vote counter increments with bounce
- [ ] Votes persist (check backend/localStorage)

### Phase 2: Heatmap Rain
- [ ] "👁️ 🍩" button triggers donut rain
- [ ] "👁️ 💩" button triggers poop rain
- [ ] Screen dims with overlay
- [ ] Emojis rain from top of screen
- [ ] Each emoji lands at stored position
- [ ] Emojis pile up showing density
- [ ] Emojis shrink when landing (big → small)
- [ ] Close button works
- [ ] Auto-closes after ~10 seconds

### Backend
- [ ] POST /api/votes saves vote with targetId, pageType, coordinates
- [ ] GET /api/votes/counts?pageType=games returns totals
- [ ] GET /api/votes/positions?pageType=games&emoji=donut returns positions
- [ ] Different pageTypes keep votes separate

---

## ⛔ DO NOT IMPLEMENT YET

- Diamond conversion system
- User authentication
- Vote undo
- Real-time WebSocket updates
- Advanced clustering algorithms
