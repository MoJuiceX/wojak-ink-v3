# CLAUDE CLI IMPLEMENTATION GUIDE: Tang Gang Shop & Collectibles (v2.0)

> **For Claude CLI**: This file contains all the CSS code, React components, and implementation details needed to build the shop system defined in SPEC 12 v2.0.

---

## CRITICAL CHANGES FROM v1.0

1. **50% price reduction** on all items
2. **Emoji Ring System** - 18 slots (3 left + 3 right + 6 top + 6 bottom) around username
3. **Fixed ring dimensions** - Same width for all users regardless of name length
4. **Keep all purchased items** - Users can switch between owned items
5. **Merged badge system** - NFT + purchased badges in same ring
6. **BigPulp everywhere** - Profile + Games + Drawer with dialogue
7. **Replace existing shop** - Remove all 19 demo items, use SPEC 12 catalog
8. **Consumables separate** - Continue tokens/boosts are NOT part of SPEC 12

---

## TABLE OF CONTENTS

1. [CSS Variables & Color Palette](#1-css-variables--color-palette)
2. [Emoji Ring Component](#2-emoji-ring-component)
3. [Frame CSS - All Tiers](#3-frame-css---all-tiers)
4. [Name Effect CSS](#4-name-effect-css)
5. [Background CSS](#5-background-css)
6. [Celebration Effects](#6-celebration-effects)
7. [BigPulp Component](#7-bigpulp-component)
8. [BigPulp Dialogue System](#8-bigpulp-dialogue-system)
9. [Achievement Drawer Component](#9-achievement-drawer-component)
10. [Database Seed Data](#10-database-seed-data)

---

## 1. CSS Variables & Color Palette

```css
/* shop-variables.css */
:root {
  /* Tang Gang Orange Palette */
  --tang-orange-50: #fff7ed;
  --tang-orange-100: #ffedd5;
  --tang-orange-200: #fed7aa;
  --tang-orange-300: #fdba74;
  --tang-orange-400: #fb923c;
  --tang-orange-500: #f97316;
  --tang-orange-600: #ea580c;
  --tang-orange-700: #c2410c;
  --tang-orange-800: #9a3412;
  --tang-orange-900: #7c2d12;

  /* Accent Colors */
  --tang-honey: #fbbf24;
  --tang-amber: #f59e0b;
  --tang-gold: #ffd700;

  /* Glow Colors for Frames */
  --glow-orange: rgba(234, 88, 12, 0.6);
  --glow-amber: rgba(245, 158, 11, 0.6);
  --glow-honey: rgba(251, 191, 36, 0.6);
  --glow-teal: rgba(20, 184, 166, 0.6);
  --glow-pink: rgba(236, 72, 153, 0.6);
  --glow-mint: rgba(52, 211, 153, 0.6);
  --glow-lavender: rgba(167, 139, 250, 0.6);
  --glow-ice: rgba(147, 197, 253, 0.6);

  /* Rarity Colors */
  --rarity-common: #9ca3af;
  --rarity-uncommon: #22c55e;
  --rarity-rare: #3b82f6;
  --rarity-legendary: #f59e0b;
  --rarity-founder: linear-gradient(135deg, #fbbf24, #ea580c);

  /* Emoji Ring Dimensions (FIXED for all users) */
  --ring-name-width: 200px;    /* Fixed width for name area */
  --ring-emoji-size: 20px;     /* Size of each emoji */
  --ring-side-gap: 8px;        /* Gap between side emojis and name */
  --ring-row-gap: 4px;         /* Gap between top/bottom rows and name */
}
```

---

## 2. Emoji Ring Component

The emoji ring displays 18 emoji slots around the username with **fixed dimensions** for leaderboard consistency.

### Ring Layout
```
           🍊  🌱  ⭐  🎯  ⚡  🚀        ← TOP ROW (6 slots)

      👑                            🎩
      🪿      [  USERNAME  ]        🏆    ← LEFT (3) + RIGHT (3)
      🐸                            🔥

           🦍  🌟  💎  💰  🤖  👽        ← BOTTOM ROW (6 slots)
```

### React Component

```tsx
// EmojiRing.tsx
import React from 'react';
import './emoji-ring.css';

interface EmojiRingProps {
  username: string;
  nameEffectClass?: string;
  positions: {
    left_1?: string;
    left_2?: string;
    left_3?: string;
    right_1?: string;
    right_2?: string;
    right_3?: string;
    top_1?: string;
    top_2?: string;
    top_3?: string;
    top_4?: string;
    top_5?: string;
    top_6?: string;
    bottom_1?: string;
    bottom_2?: string;
    bottom_3?: string;
    bottom_4?: string;
    bottom_5?: string;
    bottom_6?: string;
  };
  size?: 'compact' | 'normal' | 'large';
  showTitle?: boolean;
  title?: string;
}

export const EmojiRing: React.FC<EmojiRingProps> = ({
  username,
  nameEffectClass,
  positions,
  size = 'normal',
  showTitle = false,
  title,
}) => {
  const sizeClasses = {
    compact: 'ring-compact',
    normal: 'ring-normal',
    large: 'ring-large',
  };

  return (
    <div className={`emoji-ring ${sizeClasses[size]}`}>
      {/* Top Row */}
      <div className="ring-row ring-top">
        {positions.top_1 && <span className="ring-emoji">{positions.top_1}</span>}
        {positions.top_2 && <span className="ring-emoji">{positions.top_2}</span>}
        {positions.top_3 && <span className="ring-emoji">{positions.top_3}</span>}
        {positions.top_4 && <span className="ring-emoji">{positions.top_4}</span>}
        {positions.top_5 && <span className="ring-emoji">{positions.top_5}</span>}
        {positions.top_6 && <span className="ring-emoji">{positions.top_6}</span>}
      </div>

      {/* Middle Section: Left + Name + Right */}
      <div className="ring-middle">
        {/* Left Column */}
        <div className="ring-column ring-left">
          {positions.left_1 && <span className="ring-emoji">{positions.left_1}</span>}
          {positions.left_2 && <span className="ring-emoji">{positions.left_2}</span>}
          {positions.left_3 && <span className="ring-emoji">{positions.left_3}</span>}
        </div>

        {/* Name Area (Fixed Width) */}
        <div className="ring-name-area">
          <span
            className={`ring-username ${nameEffectClass || ''}`}
            data-text={username}
          >
            {username}
          </span>
          {showTitle && title && (
            <span className="ring-title">"{title}"</span>
          )}
        </div>

        {/* Right Column */}
        <div className="ring-column ring-right">
          {positions.right_1 && <span className="ring-emoji">{positions.right_1}</span>}
          {positions.right_2 && <span className="ring-emoji">{positions.right_2}</span>}
          {positions.right_3 && <span className="ring-emoji">{positions.right_3}</span>}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="ring-row ring-bottom">
        {positions.bottom_1 && <span className="ring-emoji">{positions.bottom_1}</span>}
        {positions.bottom_2 && <span className="ring-emoji">{positions.bottom_2}</span>}
        {positions.bottom_3 && <span className="ring-emoji">{positions.bottom_3}</span>}
        {positions.bottom_4 && <span className="ring-emoji">{positions.bottom_4}</span>}
        {positions.bottom_5 && <span className="ring-emoji">{positions.bottom_5}</span>}
        {positions.bottom_6 && <span className="ring-emoji">{positions.bottom_6}</span>}
      </div>
    </div>
  );
};
```

### CSS for Emoji Ring

```css
/* emoji-ring.css */

.emoji-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ring-row-gap);
}

/* Size Variants */
.ring-normal {
  --ring-name-width: 200px;
  --ring-emoji-size: 18px;
  --ring-font-size: 16px;
}

.ring-compact {
  --ring-name-width: 160px;
  --ring-emoji-size: 14px;
  --ring-font-size: 14px;
}

.ring-large {
  --ring-name-width: 240px;
  --ring-emoji-size: 22px;
  --ring-font-size: 18px;
}

/* Top and Bottom Rows */
.ring-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  min-height: var(--ring-emoji-size);
  width: calc(var(--ring-name-width) + 60px); /* Name + side columns */
}

.ring-emoji {
  font-size: var(--ring-emoji-size);
  line-height: 1;
}

/* Middle Section */
.ring-middle {
  display: flex;
  align-items: center;
  gap: var(--ring-side-gap);
}

/* Side Columns */
.ring-column {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 24px;
  align-items: center;
}

/* Name Area - FIXED WIDTH */
.ring-name-area {
  width: var(--ring-name-width);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ring-username {
  font-size: var(--ring-font-size);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ring-title {
  font-size: calc(var(--ring-font-size) * 0.75);
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Leaderboard Layout - Ensure consistent spacing */
.leaderboard-row .emoji-ring {
  --ring-name-width: 180px; /* Slightly smaller for table layout */
}
```

### Drag-and-Drop Arrangement UI

```tsx
// EmojiRingEditor.tsx
import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface EmojiRingEditorProps {
  ownedEmojis: string[];
  currentPositions: Record<string, string | null>;
  onSave: (positions: Record<string, string | null>) => void;
}

const POSITIONS = [
  'left_1', 'left_2', 'left_3',
  'right_1', 'right_2', 'right_3',
  'top_1', 'top_2', 'top_3', 'top_4', 'top_5', 'top_6',
  'bottom_1', 'bottom_2', 'bottom_3', 'bottom_4', 'bottom_5', 'bottom_6',
];

export const EmojiRingEditor: React.FC<EmojiRingEditorProps> = ({
  ownedEmojis,
  currentPositions,
  onSave,
}) => {
  const [positions, setPositions] = useState(currentPositions);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const emoji = active.id as string;
    const targetPosition = over.id as string;

    // If dropping on a position slot
    if (POSITIONS.includes(targetPosition)) {
      setPositions(prev => ({
        ...prev,
        [targetPosition]: emoji,
      }));
    }

    // If dropping back to owned emojis (remove from ring)
    if (targetPosition === 'owned-emojis') {
      // Find which position had this emoji and clear it
      const positionToRemove = Object.entries(positions).find(
        ([_, e]) => e === emoji
      )?.[0];
      if (positionToRemove) {
        setPositions(prev => ({
          ...prev,
          [positionToRemove]: null,
        }));
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="ring-editor">
        <h3>Arrange Your Emoji Ring</h3>
        <p>Drag emojis to position them around your name</p>

        {/* Preview */}
        <div className="ring-preview">
          {/* Render droppable slots in ring layout */}
          <div className="ring-editor-layout">
            {/* Top row slots */}
            <div className="editor-row">
              {['top_1', 'top_2', 'top_3', 'top_4', 'top_5', 'top_6'].map(pos => (
                <DroppableSlot key={pos} id={pos} emoji={positions[pos]} />
              ))}
            </div>

            {/* Middle section */}
            <div className="editor-middle">
              <div className="editor-column">
                {['left_1', 'left_2', 'left_3'].map(pos => (
                  <DroppableSlot key={pos} id={pos} emoji={positions[pos]} />
                ))}
              </div>
              <div className="editor-name-preview">Your Name</div>
              <div className="editor-column">
                {['right_1', 'right_2', 'right_3'].map(pos => (
                  <DroppableSlot key={pos} id={pos} emoji={positions[pos]} />
                ))}
              </div>
            </div>

            {/* Bottom row slots */}
            <div className="editor-row">
              {['bottom_1', 'bottom_2', 'bottom_3', 'bottom_4', 'bottom_5', 'bottom_6'].map(pos => (
                <DroppableSlot key={pos} id={pos} emoji={positions[pos]} />
              ))}
            </div>
          </div>
        </div>

        {/* Owned emojis palette */}
        <div className="owned-emojis-palette">
          <h4>Your Emojis</h4>
          <div className="emoji-palette" id="owned-emojis">
            {ownedEmojis.map(emoji => (
              <DraggableEmoji key={emoji} emoji={emoji} />
            ))}
          </div>
        </div>

        <button onClick={() => onSave(positions)} className="save-ring-btn">
          Save Arrangement
        </button>
      </div>
    </DndContext>
  );
};

// Draggable emoji component
const DraggableEmoji: React.FC<{ emoji: string }> = ({ emoji }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: emoji,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="draggable-emoji"
    >
      {emoji}
    </span>
  );
};

// Droppable slot component
const DroppableSlot: React.FC<{ id: string; emoji?: string | null }> = ({ id, emoji }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`droppable-slot ${isOver ? 'slot-hover' : ''} ${emoji ? 'slot-filled' : ''}`}
    >
      {emoji || '·'}
    </div>
  );
};
```

---

## 3. Frame CSS - All Tiers

### Grove Tier (Simple Borders) - 1,250 🍊

```css
/* frames-grove.css */

.frame-seedling {
  border: 4px solid #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.frame-orange {
  border: 4px solid var(--tang-orange-600);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--glow-orange);
}
```

### Orchard Tier (8 Glow Effects) - 3,750 🍊

```css
/* frames-orchard.css */

.frame-citrus-glow {
  border: 4px solid var(--tang-orange-600);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-orange),
    0 0 20px var(--glow-orange),
    0 0 30px rgba(234, 88, 12, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-sunset-grove {
  border: 4px solid var(--tang-amber);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-amber),
    0 0 20px var(--glow-amber),
    0 0 30px rgba(245, 158, 11, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-honey-drip {
  border: 4px solid var(--tang-honey);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-honey),
    0 0 20px var(--glow-honey),
    0 0 30px rgba(251, 191, 36, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-ocean-mist {
  border: 4px solid #14b8a6;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-teal),
    0 0 20px var(--glow-teal),
    0 0 30px rgba(20, 184, 166, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-berry-blush {
  border: 4px solid #ec4899;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-pink),
    0 0 20px var(--glow-pink),
    0 0 30px rgba(236, 72, 153, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-mint-fresh {
  border: 4px solid #34d399;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-mint),
    0 0 20px var(--glow-mint),
    0 0 30px rgba(52, 211, 153, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-lavender-dream {
  border: 4px solid #a78bfa;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-lavender),
    0 0 20px var(--glow-lavender),
    0 0 30px rgba(167, 139, 250, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

.frame-arctic-frost {
  border: 4px solid #93c5fd;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-ice),
    0 0 20px var(--glow-ice),
    0 0 30px rgba(147, 197, 253, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}
```

### Harvest Tier (4 Animated Effects) - 12,500 🍊

```css
/* frames-harvest.css */

/* BURNING CITRUS - Fire Border */
.frame-burning-citrus {
  border: 4px solid var(--tang-orange-600);
  border-radius: 50%;
  position: relative;
  animation: fire-flicker 0.15s ease-in-out infinite alternate;
}

.frame-burning-citrus::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: transparent;
  box-shadow:
    0 0 10px #ff4500,
    0 0 20px #ff6600,
    0 0 30px #ff8800,
    0 0 40px rgba(255, 100, 0, 0.5);
  animation: fire-glow 0.3s ease-in-out infinite alternate;
  z-index: -1;
}

@keyframes fire-flicker {
  0% {
    box-shadow:
      0 -5px 10px #ff4500,
      5px 0 10px #ff6600,
      0 5px 10px #ff8800,
      -5px 0 10px #ffaa00;
  }
  100% {
    box-shadow:
      0 -8px 15px #ff4500,
      8px 0 15px #ff6600,
      0 8px 15px #ff8800,
      -8px 0 15px #ffaa00;
  }
}

@keyframes fire-glow {
  0% { opacity: 0.8; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.05); }
}

/* ELECTRIC TANG - Lightning Sparks */
@property --electric-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-electric-tang {
  border: 4px solid var(--tang-orange-500);
  border-radius: 50%;
  position: relative;
  animation: electric-base 0.1s ease-in-out infinite;
}

.frame-electric-tang::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(var(--electric-angle), transparent 40%, var(--tang-orange-400) 50%, transparent 60%);
  animation: electric-spark 0.5s linear infinite;
}

@keyframes electric-base {
  0%, 100% { box-shadow: 0 0 15px var(--tang-orange-500); }
  50% { box-shadow: 0 0 25px var(--tang-orange-400), 0 0 35px var(--tang-honey); }
}

@keyframes electric-spark {
  0% { --electric-angle: 0deg; opacity: 1; }
  100% { --electric-angle: 360deg; opacity: 0.5; }
}

/* LIQUID GOLD - Flowing Metallic */
@property --liquid-gold-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-liquid-gold {
  border: 5px solid transparent;
  border-radius: 50%;
  background:
    linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(
      var(--liquid-gold-angle),
      #ffd700 0%,
      #ffb700 15%,
      #ffa500 30%,
      #ffb700 45%,
      #ffd700 60%,
      #fff4b0 75%,
      #ffd700 90%,
      #ffb700 100%
    ) border-box;
  animation: liquid-gold-flow 3s linear infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
}

@keyframes liquid-gold-flow {
  0% { --liquid-gold-angle: 0deg; }
  100% { --liquid-gold-angle: 360deg; }
}

/* FROZEN JUICE - Ice Crystal */
.frame-frozen-juice {
  border: 4px solid #a5d8ff;
  border-radius: 50%;
  position: relative;
  box-shadow:
    0 0 10px rgba(165, 216, 255, 0.6),
    0 0 20px rgba(165, 216, 255, 0.4),
    inset 0 0 15px rgba(255, 255, 255, 0.3);
  animation: frost-shimmer 3s ease-in-out infinite;
}

.frame-frozen-juice::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 8%),
    radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 6%),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.7) 0%, transparent 7%);
  animation: frost-particles 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes frost-shimmer {
  0%, 100% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.1) saturate(1.2); }
}

@keyframes frost-particles {
  0%, 100% { opacity: 0.8; transform: rotate(0deg); }
  50% { opacity: 1; transform: rotate(5deg); }
}
```

### Legendary Tier (4 Premium Effects) - 37,500 🍊

```css
/* frames-legendary.css */

/* AURORA GROVE - Northern Lights */
@property --aurora-hue {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-aurora-grove {
  border: 5px solid transparent;
  border-radius: 50%;
  position: relative;
  background:
    linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    conic-gradient(
      from var(--aurora-hue),
      #22c55e, #3b82f6, #8b5cf6, #ec4899, #f97316, #fbbf24, #22c55e
    ) border-box;
  animation: aurora-rotate 8s linear infinite;
  filter: saturate(1.3);
}

.frame-aurora-grove::before {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: conic-gradient(
    from var(--aurora-hue),
    transparent,
    rgba(34, 197, 94, 0.3),
    transparent,
    rgba(59, 130, 246, 0.3),
    transparent
  );
  filter: blur(15px);
  animation: aurora-rotate 8s linear infinite reverse;
  z-index: -1;
}

@keyframes aurora-rotate {
  0% { --aurora-hue: 0deg; }
  100% { --aurora-hue: 360deg; }
}

/* VOID CITRUS - Black Hole */
@property --void-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-void-citrus {
  border: 5px solid transparent;
  border-radius: 50%;
  position: relative;
  background:
    radial-gradient(circle, #0a0a0a 40%, transparent 70%) padding-box,
    conic-gradient(
      from var(--void-angle),
      #ea580c, #1a1a1a, #f97316, #0a0a0a, #fbbf24, #1a1a1a, #ea580c
    ) border-box;
  animation: void-spin 6s linear infinite;
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(234, 88, 12, 0.4);
}

@keyframes void-spin {
  0% { --void-angle: 0deg; }
  100% { --void-angle: 360deg; }
}

/* HOLOGRAPHIC TANG - Iridescent */
@property --holo-position {
  syntax: '<percentage>';
  initial-value: 0%;
  inherits: false;
}

.frame-holographic-tang {
  border: 5px solid transparent;
  border-radius: 50%;
  position: relative;
  background:
    linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(
      135deg,
      #ff6b6b var(--holo-position),
      #feca57 calc(var(--holo-position) + 15%),
      #48dbfb calc(var(--holo-position) + 30%),
      #ff9ff3 calc(var(--holo-position) + 45%),
      #54a0ff calc(var(--holo-position) + 60%),
      #5f27cd calc(var(--holo-position) + 75%),
      #ff6b6b calc(var(--holo-position) + 90%)
    ) border-box;
  animation: holo-shift 4s ease-in-out infinite;
  filter: saturate(1.5) brightness(1.1);
}

@keyframes holo-shift {
  0% { --holo-position: 0%; }
  50% { --holo-position: 50%; }
  100% { --holo-position: 0%; }
}

/* SUPERNOVA - Star Burst */
.frame-supernova {
  border: 5px solid var(--tang-orange-500);
  border-radius: 50%;
  position: relative;
  animation: supernova-core 2s ease-in-out infinite;
}

.frame-supernova::before {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 30%, rgba(251, 191, 36, 0.3) 50%, transparent 70%),
    conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(234, 88, 12, 0.4) 30deg,
      transparent 60deg,
      rgba(251, 191, 36, 0.4) 90deg,
      transparent 120deg
    );
  animation: supernova-burst 3s linear infinite;
  z-index: -1;
}

@keyframes supernova-core {
  0%, 100% { box-shadow: 0 0 20px var(--tang-orange-500); }
  50% { box-shadow: 0 0 40px var(--tang-honey), 0 0 60px var(--tang-orange-500); }
}

@keyframes supernova-burst {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1); }
}
```

### Legend Emoji Frames - 37,500 🍊

```css
/* frames-emoji.css */

/* Emoji frames use SVG textPath for circular emoji rendering */
.frame-emoji-container {
  position: relative;
  border-radius: 50%;
}

.frame-emoji-svg {
  position: absolute;
  inset: -16px;
  width: calc(100% + 32px);
  height: calc(100% + 32px);
  animation: emoji-rotate 20s linear infinite;
}

@keyframes emoji-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* CSS class identifiers for each emoji frame */
.frame-emoji-crown { --frame-emoji: '👑'; }
.frame-emoji-tophat { --frame-emoji: '🎩'; }
.frame-emoji-cookie { --frame-emoji: '🍪'; }
.frame-emoji-frog { --frame-emoji: '🐸'; }
.frame-emoji-goose { --frame-emoji: '🪿'; }
.frame-emoji-trophy { --frame-emoji: '🏆'; }
.frame-emoji-fire { --frame-emoji: '🔥'; }
```

---

## 4. Name Effect CSS

```css
/* name-effects.css */

/* === BASIC EFFECTS (1,250 🍊) === */

.name-citrus-text {
  color: var(--tang-orange-600);
}

.name-bold-grove {
  color: var(--tang-orange-600);
  font-weight: 700;
}

.name-shimmer {
  background: linear-gradient(90deg, var(--tang-orange-600) 0%, var(--tang-honey) 50%, var(--tang-orange-600) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: name-shimmer 3s ease-in-out infinite;
}

@keyframes name-shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.name-pulse {
  color: var(--tang-orange-600);
  animation: name-pulse 2s ease-in-out infinite;
}

@keyframes name-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.name-gradient-flow {
  background: linear-gradient(90deg, var(--tang-orange-600), var(--tang-amber), var(--tang-honey), var(--tang-amber), var(--tang-orange-600));
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 4s ease-in-out infinite;
}

@keyframes gradient-flow {
  0% { background-position: 0% center; }
  50% { background-position: 100% center; }
  100% { background-position: 0% center; }
}

/* === ANIMATED EFFECTS (7,500 🍊) === */

.name-rainbow-tang {
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff, #5f27cd, #ff6b6b);
  background-size: 400% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-cycle 5s linear infinite;
}

@keyframes rainbow-cycle {
  0% { background-position: 0% center; }
  100% { background-position: 400% center; }
}

.name-glitch {
  color: var(--tang-orange-600);
  position: relative;
  animation: glitch-skew 1s infinite linear alternate-reverse;
}

.name-glitch::before,
.name-glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.name-glitch::before {
  color: #ff00ff;
  animation: glitch-effect 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
}

.name-glitch::after {
  color: #00ffff;
  animation: glitch-effect 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse infinite;
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
}

@keyframes glitch-skew {
  0%, 100% { transform: skew(0deg); }
  20% { transform: skew(-2deg); }
  40% { transform: skew(2deg); }
}

@keyframes glitch-effect {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.name-fire-text {
  color: #ff4500;
  text-shadow:
    0 0 5px #ff4500,
    0 0 10px #ff6600,
    0 0 15px #ff8800,
    0 0 20px #ffaa00,
    0 -5px 10px rgba(255, 100, 0, 0.5);
  animation: fire-text-flicker 0.15s ease-in-out infinite alternate;
}

@keyframes fire-text-flicker {
  0% { text-shadow: 0 0 5px #ff4500, 0 0 10px #ff6600, 0 0 15px #ff8800, 0 0 20px #ffaa00, 0 -5px 10px rgba(255, 100, 0, 0.5); }
  100% { text-shadow: 0 0 8px #ff4500, 0 0 15px #ff6600, 0 0 20px #ff8800, 0 0 25px #ffaa00, 0 -8px 15px rgba(255, 100, 0, 0.7); }
}

.name-neon-sign {
  color: var(--tang-orange-500);
  text-shadow:
    0 0 5px var(--tang-orange-500),
    0 0 10px var(--tang-orange-500),
    0 0 20px var(--tang-orange-500),
    0 0 40px var(--tang-orange-600);
  animation: neon-flicker 1.5s infinite alternate;
}

@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow: 0 0 5px var(--tang-orange-500), 0 0 10px var(--tang-orange-500), 0 0 20px var(--tang-orange-500), 0 0 40px var(--tang-orange-600);
  }
  20%, 24%, 55% { text-shadow: none; }
}

.name-matrix {
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00;
  animation: matrix-glow 0.5s ease-in-out infinite alternate;
  font-family: 'Courier New', monospace;
}

@keyframes matrix-glow {
  0% { text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00; }
  100% { text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00; }
}

/* === LEGENDARY EFFECTS (20,000 🍊) === */

.name-dripping-gold {
  background: linear-gradient(180deg, #ffd700 0%, #ffb700 30%, #ffa500 60%, #cc8400 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.5));
  position: relative;
}

.name-electric-shock {
  color: var(--tang-orange-500);
  text-shadow: 0 0 10px #fff, 0 0 20px var(--tang-orange-500), 0 0 30px var(--tang-orange-500);
  animation: electric-shock 0.1s linear infinite;
}

@keyframes electric-shock {
  0%, 100% { text-shadow: 0 0 10px #fff, 0 0 20px var(--tang-orange-500); transform: translate(0, 0); }
  25% { text-shadow: 2px 0 10px #fff; transform: translate(1px, 0); }
  50% { text-shadow: -2px 0 10px #fff; transform: translate(-1px, 0); }
  75% { text-shadow: 0 2px 10px #fff; transform: translate(0, 1px); }
}

.name-void-whisper {
  color: #1a1a1a;
  text-shadow: 0 0 10px var(--tang-orange-600), 0 0 20px var(--tang-orange-600), 0 0 30px rgba(0, 0, 0, 0.5);
}

.name-supernova-text {
  color: var(--tang-orange-500);
  text-shadow: 0 0 10px var(--tang-orange-500), 0 0 20px var(--tang-honey), 0 0 30px var(--tang-orange-600), 0 0 40px var(--tang-honey);
  animation: supernova-text-pulse 2s ease-in-out infinite;
}

@keyframes supernova-text-pulse {
  0%, 100% { text-shadow: 0 0 10px var(--tang-orange-500), 0 0 20px var(--tang-honey); transform: scale(1); }
  50% { text-shadow: 0 0 20px var(--tang-orange-500), 0 0 40px var(--tang-honey), 0 0 60px var(--tang-orange-600); transform: scale(1.02); }
}

/* FOUNDER'S NAME GLOW */
.name-founders-glow {
  background: linear-gradient(90deg, var(--tang-gold) 0%, var(--tang-amber) 25%, var(--tang-honey) 50%, var(--tang-amber) 75%, var(--tang-gold) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: founder-name-shimmer 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  font-weight: 700;
}

@keyframes founder-name-shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

---

## 5. Background CSS

```css
/* backgrounds.css */

/* === SOLID COLORS (1,250 🍊) === */
.bg-midnight { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); }
.bg-sunset { background: linear-gradient(135deg, var(--tang-orange-600) 0%, var(--tang-orange-800) 100%); }
.bg-honey { background: linear-gradient(135deg, var(--tang-honey) 0%, var(--tang-amber) 100%); }
.bg-forest { background: linear-gradient(135deg, #166534 0%, #14532d 100%); }
.bg-ember { background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); }

/* === GRADIENTS (3,750 🍊) === */
.bg-orange-sunrise { background: linear-gradient(135deg, var(--tang-orange-600) 0%, var(--tang-amber) 50%, var(--tang-honey) 100%); }
.bg-twilight-grove { background: linear-gradient(135deg, #7c3aed 0%, var(--tang-orange-500) 50%, #ec4899 100%); }
.bg-deep-ocean { background: linear-gradient(135deg, #1e3a5f 0%, #0891b2 100%); }
.bg-cotton-candy { background: linear-gradient(135deg, #ec4899 0%, var(--tang-orange-400) 50%, var(--tang-honey) 100%); }

/* === ANIMATED (12,500 🍊) === */
.bg-citrus-rain {
  background: linear-gradient(180deg, #1a1a2e 0%, #2d1810 100%);
  position: relative;
  overflow: hidden;
}

.bg-floating-oranges {
  background: linear-gradient(180deg, #1a1a2e 0%, #2d2010 100%);
  position: relative;
  overflow: hidden;
}

/* === PREMIUM ANIMATED (20,000 🍊) === */
.bg-starfield {
  background: radial-gradient(ellipse at 50% 50%, rgba(234, 88, 12, 0.2) 0%, transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
  position: relative;
}

.bg-matrix-tang {
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

/* FOUNDER'S BACKGROUND */
.bg-founders-grove {
  background:
    radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(234, 88, 12, 0.3) 0%, transparent 50%),
    linear-gradient(180deg, #1a1510 0%, #2d1f10 50%, #1a1510 100%);
  animation: founder-bg-pulse 5s ease-in-out infinite;
}

@keyframes founder-bg-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.1); }
}
```

---

## 6. Celebration Effects

See full React components in the separate celebrations file. Key effects:

- **Confetti** (2,500 🍊) - Orange confetti particles
- **Orange Rain** (5,000 🍊) - 🍊 emojis falling
- **Citrus Explosion** (7,500 🍊) - Burst of citrus emojis from center
- **Fireworks** (12,500 🍊) - Orange firework particles

---

## 7. BigPulp Component

```tsx
// BigPulp.tsx
import React from 'react';
import './bigpulp.css';

interface BigPulpProps {
  hat?: string | null;
  mood?: 'happy' | 'chill' | 'sleepy' | 'hype' | 'grumpy' | 'sergeant' | 'numb' | 'rekt';
  accessory?: string | null;
  size?: 'small' | 'medium' | 'large';
  dialogue?: string;
  showDialogue?: boolean;
}

const hatEmojis: Record<string, string> = {
  party: '🎉', cowboy: '🤠', chef: '👨‍🍳', viking: '⚔️', pirate: '🏴‍☠️',
  beret: '🪖', tophat: '🎩', wizard: '🧙', devil: '😈', crown: '👑', halo: '😇',
};

const moodAnimations: Record<string, string> = {
  happy: 'bigpulp-bob', chill: 'bigpulp-float', sleepy: 'bigpulp-breathe',
  hype: 'bigpulp-bounce', grumpy: 'bigpulp-shake', sergeant: 'bigpulp-attention',
  numb: 'bigpulp-still', rekt: 'bigpulp-drip',
};

export const BigPulp: React.FC<BigPulpProps> = ({
  hat = null, mood = 'happy', accessory = null,
  size = 'medium', dialogue, showDialogue = false,
}) => {
  const animation = moodAnimations[mood];

  return (
    <div className={`bigpulp-wrapper ${size}`}>
      <div className={`bigpulp-container ${animation}`}>
        <div className="bigpulp-body">
          <div className="bigpulp-glasses">🕶️</div>
          {hat && <div className="bigpulp-hat">{hatEmojis[hat] || '🎩'}</div>}
          {accessory && <div className={`bigpulp-accessory bigpulp-accessory-${accessory}`} />}
        </div>
      </div>
      {showDialogue && dialogue && (
        <div className="bigpulp-dialogue">
          <span className="dialogue-bubble">💬 {dialogue}</span>
        </div>
      )}
    </div>
  );
};
```

---

## 8. BigPulp Dialogue System

```typescript
// bigpulp-dialogue.ts

interface DialogueEntry {
  text: string;
  mood: string;
}

const WIN_DIALOGUES: DialogueEntry[] = [
  { text: "WINNERS WIN, BABY! 🍊", mood: "hype" },
  { text: "That's what I'm talking about!", mood: "hype" },
  { text: "The Grove is proud of you!", mood: "happy" },
  { text: "Now THAT'S how it's done!", mood: "sergeant" },
  { text: "You absolute legend.", mood: "chill" },
];

const LOSS_DIALOGUES: DialogueEntry[] = [
  { text: "Paper hands detected... Try again!", mood: "grumpy" },
  { text: "Even legends have bad days. Run it back!", mood: "chill" },
  { text: "The beret stays on. So do you. Again.", mood: "sergeant" },
  { text: "That was rough. But we don't quit.", mood: "numb" },
  { text: "Accept cookies and try again.", mood: "grumpy" },
];

const DRAWER_DIALOGUES: Record<string, DialogueEntry[]> = {
  small: [
    { text: "Nice start! Keep grinding, seedling.", mood: "happy" },
    { text: "Everyone starts somewhere. Keep at it!", mood: "chill" },
  ],
  medium: [
    { text: "Now we're talking! The Grove recognizes you.", mood: "happy" },
    { text: "Solid collection. You're getting there!", mood: "hype" },
  ],
  large: [
    { text: "ABSOLUTE UNIT. This drawer is STACKED!", mood: "hype" },
    { text: "Look at this flex! Impressive.", mood: "sergeant" },
  ],
  legendary: [
    { text: "You madlad. You actually got them all. 👑", mood: "hype" },
    { text: "This is what PEAK performance looks like.", mood: "sergeant" },
  ],
};

export function getBigPulpDialogue(
  context: 'win' | 'loss' | 'drawer' | 'game_start',
  options?: { collectionSize?: number; score?: number }
): DialogueEntry {
  let pool: DialogueEntry[];

  switch (context) {
    case 'win':
      pool = WIN_DIALOGUES;
      break;
    case 'loss':
      pool = LOSS_DIALOGUES;
      break;
    case 'drawer':
      const size = options?.collectionSize || 0;
      if (size >= 50) pool = DRAWER_DIALOGUES.legendary;
      else if (size >= 20) pool = DRAWER_DIALOGUES.large;
      else if (size >= 10) pool = DRAWER_DIALOGUES.medium;
      else pool = DRAWER_DIALOGUES.small;
      break;
    default:
      pool = [{ text: "Let's do this! 🍊", mood: "hype" }];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
```

---

## 9. Achievement Drawer Component

```tsx
// AchievementDrawer.tsx
import React from 'react';
import { BigPulp } from './BigPulp';
import { EmojiRing } from './EmojiRing';
import { getBigPulpDialogue } from './bigpulp-dialogue';
import './achievement-drawer.css';

interface DrawerData {
  username: string;
  totalItems: number;
  totalSpent: number;
  emojiRing: Record<string, string>;
  ownedEmojis: string[];
  frames: Array<{ id: string; name: string; cssClass: string; rarity: string }>;
  titles: Array<{ id: string; name: string; rarity: string }>;
  nameEffects: Array<{ id: string; name: string; cssClass: string; rarity: string }>;
  backgrounds: Array<{ id: string; name: string; cssClass: string; rarity: string }>;
  celebrations: Array<{ id: string; name: string; rarity: string }>;
  bigpulp: { hat: string | null; mood: string; accessory: string | null };
  bigpulpItems: { hats: string[]; moods: string[]; accessories: string[] };
  achievements: Array<{ id: string; name: string; icon: string; earnedAt: string }>;
}

export const AchievementDrawer: React.FC<{ data: DrawerData }> = ({ data }) => {
  const dialogue = getBigPulpDialogue('drawer', { collectionSize: data.totalItems });

  return (
    <div className="achievement-drawer">
      <header className="drawer-header">
        <h1>🍊 {data.username}'s Achievement Drawer</h1>
        <div className="drawer-stats">
          <span><strong>{data.totalItems}</strong> Items</span>
          <span><strong>{data.totalSpent.toLocaleString()}</strong> 🍊 Spent</span>
        </div>
      </header>

      <div className="drawer-bigpulp">
        <BigPulp
          hat={data.bigpulp.hat}
          mood={data.bigpulp.mood as any}
          accessory={data.bigpulp.accessory}
          size="large"
          dialogue={dialogue.text}
          showDialogue={true}
        />
      </div>

      <section className="drawer-section">
        <h2>EMOJI RING BADGES</h2>
        <div className="emoji-grid">
          {data.ownedEmojis.map((emoji, i) => (
            <div key={i} className="emoji-item">{emoji}</div>
          ))}
        </div>
      </section>

      {data.frames.length > 0 && (
        <section className="drawer-section">
          <h2>FRAMES</h2>
          <div className="item-grid">
            {data.frames.map(frame => (
              <div key={frame.id} className={`drawer-item rarity-${frame.rarity}`}>
                <div className={`frame-preview ${frame.cssClass}`}><div className="preview-avatar" /></div>
                <span>{frame.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.titles.length > 0 && (
        <section className="drawer-section">
          <h2>TITLES</h2>
          <div className="item-grid">
            {data.titles.map(title => (
              <div key={title.id} className={`drawer-item rarity-${title.rarity}`}>
                <span className="title-text">"{title.name}"</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.nameEffects.length > 0 && (
        <section className="drawer-section">
          <h2>NAME EFFECTS</h2>
          <div className="item-grid">
            {data.nameEffects.map(effect => (
              <div key={effect.id} className={`drawer-item rarity-${effect.rarity}`}>
                <span className={`name-preview ${effect.cssClass}`} data-text="Preview">Preview</span>
                <span>{effect.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {(data.bigpulpItems.hats.length > 0 || data.bigpulpItems.moods.length > 0) && (
        <section className="drawer-section">
          <h2>BIGPULP ITEMS</h2>
          <div className="bigpulp-items-grid">
            {data.bigpulpItems.hats.map(hat => (
              <div key={hat} className="drawer-item">{hat}</div>
            ))}
            {data.bigpulpItems.moods.map(mood => (
              <div key={mood} className="drawer-item">{mood}</div>
            ))}
            {data.bigpulpItems.accessories.map(acc => (
              <div key={acc} className="drawer-item">{acc}</div>
            ))}
          </div>
        </section>
      )}

      {data.achievements.length > 0 && (
        <section className="drawer-section">
          <h2>ACHIEVEMENT BADGES</h2>
          <div className="item-grid">
            {data.achievements.map(badge => (
              <div key={badge.id} className="drawer-item achievement">
                <span className="achievement-icon">{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
```

---

## 10. Database Seed Data (50% Reduced Prices)

```sql
-- seed-shop-items.sql (SPEC 12 v2.0 with 50% reduced prices)

-- EMOJI BADGES
INSERT INTO shop_items (id, name, category, rarity, price_oranges, emoji) VALUES
('emoji-orange', 'Orange', 'emoji_badge', 'common', 250, '🍊'),
('emoji-heart', 'Orange Heart', 'emoji_badge', 'common', 250, '🧡'),
('emoji-seedling', 'Seedling', 'emoji_badge', 'common', 250, '🌱'),
('emoji-star', 'Star', 'emoji_badge', 'common', 375, '⭐'),
('emoji-target', 'Target', 'emoji_badge', 'common', 375, '🎯'),
('emoji-lightning', 'Lightning', 'emoji_badge', 'uncommon', 750, '⚡'),
('emoji-rocket', 'Rocket', 'emoji_badge', 'uncommon', 750, '🚀'),
('emoji-skull', 'Skull', 'emoji_badge', 'rare', 1250, '💀'),
('emoji-alien', 'Alien', 'emoji_badge', 'rare', 1250, '👽'),
('emoji-robot', 'Robot', 'emoji_badge', 'rare', 1250, '🤖'),
('emoji-ape', 'Ape', 'emoji_badge', 'rare', 2000, '🦍'),
('emoji-glowstar', 'Glowing Star', 'emoji_badge', 'rare', 2000, '🌟'),
('emoji-diamond', 'Diamond', 'emoji_badge', 'epic', 2500, '💎'),
('emoji-moneybag', 'Money Bag', 'emoji_badge', 'epic', 3750, '💰'),
('emoji-fire', 'Fire (TheStakerClass)', 'emoji_badge', 'legendary', 7500, '🔥'),
('emoji-cookie', 'Cookie (OrangeGooey)', 'emoji_badge', 'legendary', 7500, '🍪'),
('emoji-frog', 'Frog (Tom Bepe)', 'emoji_badge', 'legendary', 10000, '🐸'),
('emoji-goose', 'Goose (Foods)', 'emoji_badge', 'legendary', 10000, '🪿'),
('emoji-trophy', 'Trophy (Papa Tang)', 'emoji_badge', 'legendary', 12500, '🏆'),
('emoji-tophat', 'Top Hat (DegenWaffle)', 'emoji_badge', 'legendary', 12500, '🎩'),
('emoji-crown', 'Crown (Bullish0x)', 'emoji_badge', 'legendary', 20000, '👑');

-- FRAMES
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('frame-seedling', 'Seedling', 'frame', 'common', 1250, 'frame-seedling'),
('frame-orange', 'Orange', 'frame', 'common', 1250, 'frame-orange'),
('frame-citrus-glow', 'Citrus Glow', 'frame', 'uncommon', 3750, 'frame-citrus-glow'),
('frame-sunset-grove', 'Sunset Grove', 'frame', 'uncommon', 3750, 'frame-sunset-grove'),
('frame-honey-drip', 'Honey Drip', 'frame', 'uncommon', 3750, 'frame-honey-drip'),
('frame-ocean-mist', 'Ocean Mist', 'frame', 'uncommon', 3750, 'frame-ocean-mist'),
('frame-berry-blush', 'Berry Blush', 'frame', 'uncommon', 3750, 'frame-berry-blush'),
('frame-mint-fresh', 'Mint Fresh', 'frame', 'uncommon', 3750, 'frame-mint-fresh'),
('frame-lavender-dream', 'Lavender Dream', 'frame', 'uncommon', 3750, 'frame-lavender-dream'),
('frame-arctic-frost', 'Arctic Frost', 'frame', 'uncommon', 3750, 'frame-arctic-frost'),
('frame-burning-citrus', 'Burning Citrus', 'frame', 'rare', 12500, 'frame-burning-citrus'),
('frame-electric-tang', 'Electric Tang', 'frame', 'rare', 12500, 'frame-electric-tang'),
('frame-liquid-gold', 'Liquid Gold', 'frame', 'rare', 12500, 'frame-liquid-gold'),
('frame-frozen-juice', 'Frozen Juice', 'frame', 'rare', 12500, 'frame-frozen-juice'),
('frame-aurora-grove', 'Aurora Grove', 'frame', 'legendary', 37500, 'frame-aurora-grove'),
('frame-void-citrus', 'Void Citrus', 'frame', 'legendary', 37500, 'frame-void-citrus'),
('frame-holographic-tang', 'Holographic Tang', 'frame', 'legendary', 37500, 'frame-holographic-tang'),
('frame-supernova', 'Supernova', 'frame', 'legendary', 37500, 'frame-supernova'),
('frame-emoji-crown', 'Crown Frame', 'frame', 'legendary', 37500, 'frame-emoji-crown'),
('frame-emoji-tophat', 'Top Hat Frame', 'frame', 'legendary', 37500, 'frame-emoji-tophat'),
('frame-emoji-cookie', 'Cookie Frame', 'frame', 'legendary', 37500, 'frame-emoji-cookie'),
('frame-emoji-frog', 'Frog Frame', 'frame', 'legendary', 37500, 'frame-emoji-frog'),
('frame-emoji-goose', 'Goose Frame', 'frame', 'legendary', 37500, 'frame-emoji-goose'),
('frame-emoji-trophy', 'Trophy Frame', 'frame', 'legendary', 37500, 'frame-emoji-trophy'),
('frame-emoji-fire', 'Fire Frame', 'frame', 'legendary', 37500, 'frame-emoji-fire');

-- NAME EFFECTS
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('name-citrus-text', 'Citrus Text', 'name_effect', 'common', 1250, 'name-citrus-text'),
('name-bold-grove', 'Bold Grove', 'name_effect', 'common', 1250, 'name-bold-grove'),
('name-shimmer', 'Shimmer', 'name_effect', 'common', 1250, 'name-shimmer'),
('name-pulse', 'Pulse', 'name_effect', 'common', 1250, 'name-pulse'),
('name-gradient-flow', 'Gradient Flow', 'name_effect', 'common', 1250, 'name-gradient-flow'),
('name-rainbow-tang', 'Rainbow Tang', 'name_effect', 'rare', 7500, 'name-rainbow-tang'),
('name-glitch', 'Glitch', 'name_effect', 'rare', 7500, 'name-glitch'),
('name-fire-text', 'Fire Text', 'name_effect', 'rare', 7500, 'name-fire-text'),
('name-neon-sign', 'Neon Sign', 'name_effect', 'rare', 7500, 'name-neon-sign'),
('name-matrix', 'Matrix', 'name_effect', 'rare', 7500, 'name-matrix'),
('name-dripping-gold', 'Dripping Gold', 'name_effect', 'legendary', 20000, 'name-dripping-gold'),
('name-electric-shock', 'Electric Shock', 'name_effect', 'legendary', 20000, 'name-electric-shock'),
('name-void-whisper', 'Void Whisper', 'name_effect', 'legendary', 20000, 'name-void-whisper'),
('name-supernova-text', 'Supernova Text', 'name_effect', 'legendary', 20000, 'name-supernova-text');

-- TITLES
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('title-seedling', 'Seedling', 'title', 'common', 1250),
('title-grove-keeper', 'Grove Keeper', 'title', 'common', 1250),
('title-orchard-master', 'Orchard Master', 'title', 'common', 1250),
('title-citrus-lord', 'Citrus Lord', 'title', 'common', 1250),
('title-tang-emperor', 'Tang Emperor', 'title', 'common', 1250),
('title-vibing', 'Vibing', 'title', 'uncommon', 2500),
('title-wagmi', 'WAGMI', 'title', 'uncommon', 2500),
('title-ngmi', 'NGMI', 'title', 'uncommon', 2500),
('title-diamond-hands', 'Diamond Hands', 'title', 'uncommon', 2500),
('title-smooth-brain', 'Smooth Brain', 'title', 'uncommon', 2500),
('title-galaxy-brain', 'Galaxy Brain', 'title', 'uncommon', 2500),
('title-absolute-unit', 'Absolute Unit', 'title', 'uncommon', 2500),
('title-touch-grass', 'Touch Grass', 'title', 'uncommon', 2500),
('title-king-grove', 'King of the Grove', 'title', 'legendary', 7500),
('title-neckbeard', 'Neckbeard', 'title', 'legendary', 7500),
('title-accept-cookies', 'Accept Cookies', 'title', 'legendary', 7500),
('title-bepe-army', 'Bepe Army', 'title', 'legendary', 7500),
('title-breadsticks', 'Breadsticks', 'title', 'legendary', 7500),
('title-winners-win', 'Winners Win!', 'title', 'legendary', 7500),
('title-beret-stays-on', 'The Beret Stays On', 'title', 'legendary', 7500),
('title-custom-slot', 'Custom Title Slot', 'title', 'legendary', 25000);

-- BIGPULP HATS
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-hat-party', 'Party Hat', 'bigpulp_hat', 'common', 1250),
('bigpulp-hat-cowboy', 'Cowboy Hat', 'bigpulp_hat', 'common', 2000),
('bigpulp-hat-chef', 'Chef Hat', 'bigpulp_hat', 'common', 2000),
('bigpulp-hat-viking', 'Viking Helmet', 'bigpulp_hat', 'uncommon', 3750),
('bigpulp-hat-pirate', 'Pirate Hat', 'bigpulp_hat', 'uncommon', 3750),
('bigpulp-hat-beret', 'Beret', 'bigpulp_hat', 'uncommon', 3750),
('bigpulp-hat-tophat', 'Top Hat', 'bigpulp_hat', 'rare', 5000),
('bigpulp-hat-wizard', 'Wizard Hat', 'bigpulp_hat', 'rare', 5000),
('bigpulp-hat-devil', 'Devil Horns', 'bigpulp_hat', 'rare', 6250),
('bigpulp-hat-crown', 'Crown', 'bigpulp_hat', 'legendary', 12500),
('bigpulp-hat-halo', 'Halo', 'bigpulp_hat', 'legendary', 12500);

-- BIGPULP MOODS
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-mood-happy', 'Happy', 'bigpulp_mood', 'common', 750),
('bigpulp-mood-chill', 'Chill', 'bigpulp_mood', 'common', 750),
('bigpulp-mood-sleepy', 'Sleepy', 'bigpulp_mood', 'common', 1250),
('bigpulp-mood-hype', 'Hype', 'bigpulp_mood', 'uncommon', 2000),
('bigpulp-mood-grumpy', 'Grumpy', 'bigpulp_mood', 'uncommon', 2000),
('bigpulp-mood-sergeant', 'Sergeant', 'bigpulp_mood', 'rare', 3750),
('bigpulp-mood-numb', 'Numb', 'bigpulp_mood', 'rare', 5000),
('bigpulp-mood-rekt', 'Rekt', 'bigpulp_mood', 'legendary', 7500);

-- BIGPULP ACCESSORIES
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-acc-bowtie', 'Bowtie', 'bigpulp_accessory', 'common', 750),
('bigpulp-acc-bandana', 'Bandana', 'bigpulp_accessory', 'common', 1250),
('bigpulp-acc-earring', 'Earring', 'bigpulp_accessory', 'common', 1250),
('bigpulp-acc-headphones', 'Headphones', 'bigpulp_accessory', 'uncommon', 2000),
('bigpulp-acc-cigar', 'Cigar', 'bigpulp_accessory', 'uncommon', 2500),
('bigpulp-acc-monocle', 'Monocle', 'bigpulp_accessory', 'rare', 3750),
('bigpulp-acc-scar', 'Scar', 'bigpulp_accessory', 'rare', 5000);

-- BACKGROUNDS
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('bg-midnight', 'Midnight', 'background', 'common', 1250, 'bg-midnight'),
('bg-sunset', 'Sunset', 'background', 'common', 1250, 'bg-sunset'),
('bg-honey', 'Honey', 'background', 'common', 1250, 'bg-honey'),
('bg-forest', 'Forest', 'background', 'common', 1250, 'bg-forest'),
('bg-ember', 'Ember', 'background', 'common', 1250, 'bg-ember'),
('bg-orange-sunrise', 'Orange Sunrise', 'background', 'uncommon', 3750, 'bg-orange-sunrise'),
('bg-twilight-grove', 'Twilight Grove', 'background', 'uncommon', 3750, 'bg-twilight-grove'),
('bg-deep-ocean', 'Deep Ocean', 'background', 'uncommon', 3750, 'bg-deep-ocean'),
('bg-cotton-candy', 'Cotton Candy', 'background', 'uncommon', 3750, 'bg-cotton-candy'),
('bg-citrus-rain', 'Citrus Rain', 'background', 'rare', 12500, 'bg-citrus-rain'),
('bg-floating-oranges', 'Floating Oranges', 'background', 'rare', 12500, 'bg-floating-oranges'),
('bg-orange-grove', 'Orange Grove', 'background', 'legendary', 20000, 'bg-orange-grove'),
('bg-starfield', 'Starfield', 'background', 'legendary', 20000, 'bg-starfield'),
('bg-matrix-tang', 'Matrix Tang', 'background', 'legendary', 20000, 'bg-matrix-tang');

-- CELEBRATIONS
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('celebration-confetti', 'Confetti', 'celebration', 'common', 2500, 'celebration-confetti'),
('celebration-orange-rain', 'Orange Rain', 'celebration', 'uncommon', 5000, 'celebration-orange-rain'),
('celebration-citrus-explosion', 'Citrus Explosion', 'celebration', 'rare', 7500, 'celebration-citrus-explosion'),
('celebration-fireworks', 'Fireworks', 'celebration', 'legendary', 12500, 'celebration-fireworks');
```

---

## IMPLEMENTATION PRIORITY

1. **Database tables** - Create all tables, seed shop items
2. **Emoji Ring component** - Core display feature for leaderboards/profiles
3. **Shop UI overhaul** - Replace demo items with SPEC 12 catalog
4. **Frame CSS** - All tiers with animations
5. **Name effect CSS** - All tiers
6. **Achievement Drawer** - New page at `/drawer/:userId`
7. **BigPulp component** - Profile + drawer integration
8. **BigPulp in games** - Reactions during gameplay
9. **Celebration effects** - Win triggers
10. **Founder's Collection** - XCH payment flow

---

**Winners win, baby!** 🍊
