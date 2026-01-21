# CLAUDE CLI IMPLEMENTATION GUIDE: Tang Gang Shop & Collectibles

> **For Claude CLI**: This file contains all the CSS code, React components, and implementation details needed to build the shop system defined in SPEC 12.

---

## TABLE OF CONTENTS

1. [CSS Variables & Color Palette](#1-css-variables--color-palette)
2. [Frame CSS - All Tiers](#2-frame-css---all-tiers)
3. [Emoji Frame CSS](#3-emoji-frame-css)
4. [Name Effect CSS](#4-name-effect-css)
5. [Background CSS](#5-background-css)
6. [Celebration Effects](#6-celebration-effects)
7. [BigPulp Component](#7-bigpulp-component)
8. [Achievement Drawer Component](#8-achievement-drawer-component)
9. [Username Display Component](#9-username-display-component)
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
}
```

---

## 2. Frame CSS - All Tiers

### Grove Tier (Simple Borders) - 2,500 🍊

```css
/* frames-grove.css */

/* Seedling Frame - Simple Green */
.frame-seedling {
  border: 4px solid #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

/* Orange Frame - Simple Orange */
.frame-orange {
  border: 4px solid var(--tang-orange-600);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--glow-orange);
}
```

### Orchard Tier (8 Glow Effects) - 7,500 🍊

```css
/* frames-orchard.css */

/* Base glow frame styles */
.frame-glow {
  border: 4px solid transparent;
  border-radius: 50%;
  position: relative;
}

/* Citrus Glow - Orange */
.frame-citrus-glow {
  border: 4px solid var(--tang-orange-600);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-orange),
    0 0 20px var(--glow-orange),
    0 0 30px rgba(234, 88, 12, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Sunset Grove - Golden/Amber */
.frame-sunset-grove {
  border: 4px solid var(--tang-amber);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-amber),
    0 0 20px var(--glow-amber),
    0 0 30px rgba(245, 158, 11, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Honey Drip - Warm Honey Yellow */
.frame-honey-drip {
  border: 4px solid var(--tang-honey);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-honey),
    0 0 20px var(--glow-honey),
    0 0 30px rgba(251, 191, 36, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Ocean Mist - Bluish/Teal */
.frame-ocean-mist {
  border: 4px solid #14b8a6;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-teal),
    0 0 20px var(--glow-teal),
    0 0 30px rgba(20, 184, 166, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Berry Blush - Pink/Magenta */
.frame-berry-blush {
  border: 4px solid #ec4899;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-pink),
    0 0 20px var(--glow-pink),
    0 0 30px rgba(236, 72, 153, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Mint Fresh - Mint Green */
.frame-mint-fresh {
  border: 4px solid #34d399;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-mint),
    0 0 20px var(--glow-mint),
    0 0 30px rgba(52, 211, 153, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Lavender Dream - Purple/Lavender */
.frame-lavender-dream {
  border: 4px solid #a78bfa;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-lavender),
    0 0 20px var(--glow-lavender),
    0 0 30px rgba(167, 139, 250, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Arctic Frost - Ice Blue/White */
.frame-arctic-frost {
  border: 4px solid #93c5fd;
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--glow-ice),
    0 0 20px var(--glow-ice),
    0 0 30px rgba(147, 197, 253, 0.3);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Shared glow pulse animation */
@keyframes glow-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}
```

### Harvest Tier (4 Animated Effects) - 25,000 🍊

```css
/* frames-harvest.css */

/* ============================================
   BURNING CITRUS - Animated Fire Border
   Uses multiple box-shadows with flicker animation
   ============================================ */
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
  0% {
    opacity: 0.8;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* ============================================
   ELECTRIC TANG - Lightning Sparks
   Uses CSS animations with pseudo-elements
   ============================================ */
.frame-electric-tang {
  border: 4px solid var(--tang-orange-500);
  border-radius: 50%;
  position: relative;
  animation: electric-base 0.1s ease-in-out infinite;
}

.frame-electric-tang::before,
.frame-electric-tang::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(45deg, transparent 40%, var(--tang-orange-400) 50%, transparent 60%);
  animation: electric-spark 0.5s linear infinite;
}

.frame-electric-tang::after {
  animation-delay: 0.25s;
  background: linear-gradient(-45deg, transparent 40%, var(--tang-honey) 50%, transparent 60%);
}

@keyframes electric-base {
  0%, 100% {
    box-shadow: 0 0 15px var(--tang-orange-500);
  }
  50% {
    box-shadow: 0 0 25px var(--tang-orange-400), 0 0 35px var(--tang-honey);
  }
}

@keyframes electric-spark {
  0% {
    transform: rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.5;
  }
}

/* ============================================
   LIQUID GOLD - Flowing Metallic Border
   Uses @property for animatable gradients
   ============================================ */
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
  0% {
    --liquid-gold-angle: 0deg;
  }
  100% {
    --liquid-gold-angle: 360deg;
  }
}

/* Shimmer overlay for metallic effect */
.frame-liquid-gold::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-sweep 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer-sweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ============================================
   FROZEN JUICE - Ice Crystal Border
   Uses backdrop-filter and frost particles
   ============================================ */
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
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.7) 0%, transparent 7%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5) 0%, transparent 5%);
  animation: frost-particles 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes frost-shimmer {
  0%, 100% {
    filter: brightness(1) saturate(1);
  }
  50% {
    filter: brightness(1.1) saturate(1.2);
  }
}

@keyframes frost-particles {
  0%, 100% {
    opacity: 0.8;
    transform: rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: rotate(5deg);
  }
}
```

### Legendary Tier (4 Premium Effects) - 75,000 🍊

```css
/* frames-legendary.css */

/* ============================================
   AURORA GROVE - Northern Lights Effect
   Animated gradient with color shifting
   ============================================ */
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
      #22c55e,
      #3b82f6,
      #8b5cf6,
      #ec4899,
      #f97316,
      #fbbf24,
      #22c55e
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
    transparent,
    rgba(139, 92, 246, 0.3),
    transparent
  );
  filter: blur(15px);
  animation: aurora-rotate 8s linear infinite reverse;
  z-index: -1;
}

@keyframes aurora-rotate {
  0% {
    --aurora-hue: 0deg;
  }
  100% {
    --aurora-hue: 360deg;
  }
}

/* ============================================
   VOID CITRUS - Black Hole Effect
   Dark void with orange energy being pulled in
   ============================================ */
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
      #ea580c,
      #1a1a1a,
      #f97316,
      #0a0a0a,
      #fbbf24,
      #1a1a1a,
      #ea580c
    ) border-box;
  animation: void-spin 6s linear infinite;
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(234, 88, 12, 0.4);
}

.frame-void-citrus::before {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    transparent 30%,
    rgba(234, 88, 12, 0.2) 50%,
    transparent 70%
  );
  animation: void-pulse 2s ease-in-out infinite;
  z-index: -1;
}

@keyframes void-spin {
  0% {
    --void-angle: 0deg;
  }
  100% {
    --void-angle: 360deg;
  }
}

@keyframes void-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* ============================================
   HOLOGRAPHIC TANG - Iridescent Shimmer
   Color shifts based on viewing angle simulation
   ============================================ */
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

.frame-holographic-tang::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  animation: holo-shine 2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes holo-shift {
  0% {
    --holo-position: 0%;
  }
  50% {
    --holo-position: 50%;
  }
  100% {
    --holo-position: 0%;
  }
}

@keyframes holo-shine {
  0% {
    background-position: 200% 200%;
  }
  100% {
    background-position: -200% -200%;
  }
}

/* ============================================
   SUPERNOVA - Explosive Star Burst
   Radiating light burst animation
   ============================================ */
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
      transparent 120deg,
      rgba(234, 88, 12, 0.4) 150deg,
      transparent 180deg,
      rgba(251, 191, 36, 0.4) 210deg,
      transparent 240deg,
      rgba(234, 88, 12, 0.4) 270deg,
      transparent 300deg,
      rgba(251, 191, 36, 0.4) 330deg,
      transparent 360deg
    );
  animation: supernova-burst 3s linear infinite;
  z-index: -1;
}

.frame-supernova::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  box-shadow:
    0 0 30px var(--tang-orange-500),
    0 0 60px var(--tang-honey),
    0 0 90px rgba(234, 88, 12, 0.3);
  animation: supernova-glow 2s ease-in-out infinite alternate;
  z-index: -2;
}

@keyframes supernova-core {
  0%, 100% {
    box-shadow: 0 0 20px var(--tang-orange-500);
  }
  50% {
    box-shadow: 0 0 40px var(--tang-honey), 0 0 60px var(--tang-orange-500);
  }
}

@keyframes supernova-burst {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.8;
  }
}

@keyframes supernova-glow {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* ============================================
   FOUNDER'S GROVE FRAME - Ultimate Premium
   Golden-orange animated with special effects
   ============================================ */
@property --founder-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.frame-founders-grove {
  border: 6px solid transparent;
  border-radius: 50%;
  position: relative;
  background:
    linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(
      var(--founder-angle),
      var(--tang-gold) 0%,
      var(--tang-amber) 20%,
      var(--tang-orange-600) 40%,
      var(--tang-amber) 60%,
      var(--tang-gold) 80%,
      var(--tang-honey) 100%
    ) border-box;
  animation: founder-rotate 4s linear infinite;
  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
}

.frame-founders-grove::before {
  content: '🌱';
  position: absolute;
  top: -12px;
  right: -12px;
  font-size: 20px;
  animation: founder-badge-bounce 2s ease-in-out infinite;
}

.frame-founders-grove::after {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.2) 0%,
    transparent 70%
  );
  animation: founder-aura 3s ease-in-out infinite;
  z-index: -1;
}

@keyframes founder-rotate {
  0% {
    --founder-angle: 0deg;
  }
  100% {
    --founder-angle: 360deg;
  }
}

@keyframes founder-badge-bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(10deg);
  }
}

@keyframes founder-aura {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}
```

---

## 3. Emoji Frame CSS

Emoji frames display repeated emojis around the avatar border.

```css
/* frames-emoji.css */

/* Base emoji frame container */
.frame-emoji {
  position: relative;
  border-radius: 50%;
}

/* The emoji border is created using a pseudo-element with repeating emojis */
.frame-emoji::before {
  content: attr(data-emoji);
  position: absolute;
  inset: -16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  letter-spacing: -2px;
  /* This creates the circular text effect */
  animation: emoji-rotate 20s linear infinite;
}

/* Alternative: Use SVG text path for true circular emoji border */
.frame-emoji-svg {
  position: relative;
}

.frame-emoji-svg .emoji-path {
  position: absolute;
  inset: -20px;
  width: calc(100% + 40px);
  height: calc(100% + 40px);
}

@keyframes emoji-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Individual emoji frame classes */
.frame-emoji-crown::before { content: '👑👑👑👑👑👑👑👑'; }
.frame-emoji-tophat::before { content: '🎩🎩🎩🎩🎩🎩🎩🎩'; }
.frame-emoji-cookie::before { content: '🍪🍪🍪🍪🍪🍪🍪🍪'; }
.frame-emoji-frog::before { content: '🐸🐸🐸🐸🐸🐸🐸🐸'; }
.frame-emoji-goose::before { content: '🪿🪿🪿🪿🪿🪿🪿🪿'; }
.frame-emoji-trophy::before { content: '🏆🏆🏆🏆🏆🏆🏆🏆'; }
.frame-emoji-fire::before { content: '🔥🔥🔥🔥🔥🔥🔥🔥'; }
```

### React Component for Emoji Frames

```tsx
// EmojiFrame.tsx
import React from 'react';

interface EmojiFrameProps {
  emoji: string;
  size?: number;
  children: React.ReactNode;
}

export const EmojiFrame: React.FC<EmojiFrameProps> = ({
  emoji,
  size = 80,
  children
}) => {
  // Calculate number of emojis needed based on circumference
  const circumference = Math.PI * (size + 32); // size + padding
  const emojiSize = 16;
  const emojiCount = Math.floor(circumference / emojiSize);
  const emojis = Array(emojiCount).fill(emoji).join('');

  return (
    <div
      className="emoji-frame-container"
      style={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <svg
        className="emoji-frame-svg"
        viewBox={`0 0 ${size + 40} ${size + 40}`}
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          width: size + 40,
          height: size + 40,
          animation: 'emoji-rotate 20s linear infinite',
        }}
      >
        <defs>
          <path
            id={`emoji-path-${size}`}
            d={`
              M ${(size + 40) / 2}, ${(size + 40) / 2}
              m -${(size + 20) / 2}, 0
              a ${(size + 20) / 2},${(size + 20) / 2} 0 1,1 ${size + 20},0
              a ${(size + 20) / 2},${(size + 20) / 2} 0 1,1 -${size + 20},0
            `}
            fill="none"
          />
        </defs>
        <text fontSize="14">
          <textPath href={`#emoji-path-${size}`}>
            {emojis}
          </textPath>
        </text>
      </svg>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
```

---

## 4. Name Effect CSS

```css
/* name-effects.css */

/* ============================================
   BASIC NAME EFFECTS - 2,500 🍊
   ============================================ */

/* Citrus Text - Solid Orange */
.name-citrus-text {
  color: var(--tang-orange-600);
}

/* Bold Grove - Bold + Orange */
.name-bold-grove {
  color: var(--tang-orange-600);
  font-weight: 700;
}

/* Shimmer - Light sweeps across */
.name-shimmer {
  background: linear-gradient(
    90deg,
    var(--tang-orange-600) 0%,
    var(--tang-honey) 50%,
    var(--tang-orange-600) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: name-shimmer 3s ease-in-out infinite;
}

@keyframes name-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}

/* Pulse - Username fades in/out */
.name-pulse {
  color: var(--tang-orange-600);
  animation: name-pulse 2s ease-in-out infinite;
}

@keyframes name-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Gradient Flow - Color shift */
.name-gradient-flow {
  background: linear-gradient(
    90deg,
    var(--tang-orange-600),
    var(--tang-amber),
    var(--tang-honey),
    var(--tang-amber),
    var(--tang-orange-600)
  );
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-flow 4s ease-in-out infinite;
}

@keyframes gradient-flow {
  0% {
    background-position: 0% center;
  }
  50% {
    background-position: 100% center;
  }
  100% {
    background-position: 0% center;
  }
}

/* ============================================
   ANIMATED NAME EFFECTS - 15,000 🍊
   ============================================ */

/* Rainbow Tang - Rainbow cycle */
.name-rainbow-tang {
  background: linear-gradient(
    90deg,
    #ff6b6b,
    #feca57,
    #48dbfb,
    #ff9ff3,
    #54a0ff,
    #5f27cd,
    #ff6b6b
  );
  background-size: 400% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rainbow-cycle 5s linear infinite;
}

@keyframes rainbow-cycle {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 400% center;
  }
}

/* Glitch - Digital corruption */
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
  0%, 100% {
    transform: skew(0deg);
  }
  20% {
    transform: skew(-2deg);
  }
  40% {
    transform: skew(2deg);
  }
}

@keyframes glitch-effect {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

/* Fire Text - Flames on letters */
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
  0% {
    text-shadow:
      0 0 5px #ff4500,
      0 0 10px #ff6600,
      0 0 15px #ff8800,
      0 0 20px #ffaa00,
      0 -5px 10px rgba(255, 100, 0, 0.5);
  }
  100% {
    text-shadow:
      0 0 8px #ff4500,
      0 0 15px #ff6600,
      0 0 20px #ff8800,
      0 0 25px #ffaa00,
      0 -8px 15px rgba(255, 100, 0, 0.7);
  }
}

/* Neon Sign - Flickering neon */
.name-neon-sign {
  color: var(--tang-orange-500);
  text-shadow:
    0 0 5px var(--tang-orange-500),
    0 0 10px var(--tang-orange-500),
    0 0 20px var(--tang-orange-500),
    0 0 40px var(--tang-orange-600),
    0 0 80px var(--tang-orange-600);
  animation: neon-flicker 1.5s infinite alternate;
}

@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    text-shadow:
      0 0 5px var(--tang-orange-500),
      0 0 10px var(--tang-orange-500),
      0 0 20px var(--tang-orange-500),
      0 0 40px var(--tang-orange-600),
      0 0 80px var(--tang-orange-600);
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}

/* Matrix - Code rain effect */
.name-matrix {
  color: #00ff00;
  text-shadow:
    0 0 5px #00ff00,
    0 0 10px #00ff00;
  animation: matrix-glow 0.5s ease-in-out infinite alternate;
  font-family: 'Courier New', monospace;
}

@keyframes matrix-glow {
  0% {
    text-shadow:
      0 0 5px #00ff00,
      0 0 10px #00ff00;
  }
  100% {
    text-shadow:
      0 0 10px #00ff00,
      0 0 20px #00ff00,
      0 0 30px #00ff00;
  }
}

/* ============================================
   LEGENDARY NAME EFFECTS - 40,000 🍊
   ============================================ */

/* Dripping Gold - Liquid gold drips */
.name-dripping-gold {
  background: linear-gradient(
    180deg,
    #ffd700 0%,
    #ffb700 30%,
    #ffa500 60%,
    #cc8400 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.5));
  position: relative;
}

.name-dripping-gold::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 10%;
  width: 80%;
  height: 10px;
  background:
    radial-gradient(ellipse at 20% 0%, #ffd700 0%, transparent 50%),
    radial-gradient(ellipse at 50% 0%, #ffd700 0%, transparent 50%),
    radial-gradient(ellipse at 80% 0%, #ffd700 0%, transparent 50%);
  animation: drip-fall 2s ease-in infinite;
  opacity: 0.7;
}

@keyframes drip-fall {
  0% {
    transform: translateY(0) scaleY(1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(10px) scaleY(2);
    opacity: 0;
  }
}

/* Electric Shock - Lightning sparks */
.name-electric-shock {
  color: var(--tang-orange-500);
  text-shadow:
    0 0 10px #fff,
    0 0 20px var(--tang-orange-500),
    0 0 30px var(--tang-orange-500);
  animation: electric-shock 0.1s linear infinite;
}

@keyframes electric-shock {
  0%, 100% {
    text-shadow:
      0 0 10px #fff,
      0 0 20px var(--tang-orange-500),
      0 0 30px var(--tang-orange-500);
    transform: translate(0, 0);
  }
  25% {
    text-shadow:
      2px 0 10px #fff,
      2px 0 20px var(--tang-honey);
    transform: translate(1px, 0);
  }
  50% {
    text-shadow:
      -2px 0 10px #fff,
      -2px 0 20px var(--tang-orange-500);
    transform: translate(-1px, 0);
  }
  75% {
    text-shadow:
      0 2px 10px #fff,
      0 2px 20px var(--tang-honey);
    transform: translate(0, 1px);
  }
}

/* Void Whisper - Dark smoke + orange glow */
.name-void-whisper {
  color: #1a1a1a;
  text-shadow:
    0 0 10px var(--tang-orange-600),
    0 0 20px var(--tang-orange-600),
    0 0 30px rgba(0, 0, 0, 0.5);
  position: relative;
}

.name-void-whisper::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  color: transparent;
  text-shadow:
    0 -5px 15px rgba(0, 0, 0, 0.3),
    0 -10px 20px rgba(0, 0, 0, 0.2);
  animation: void-smoke 3s ease-in-out infinite;
}

@keyframes void-smoke {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-5px);
    opacity: 0.8;
  }
}

/* Supernova Text - Explosive particles */
.name-supernova-text {
  color: var(--tang-orange-500);
  text-shadow:
    0 0 10px var(--tang-orange-500),
    0 0 20px var(--tang-honey),
    0 0 30px var(--tang-orange-600),
    0 0 40px var(--tang-honey);
  animation: supernova-text-pulse 2s ease-in-out infinite;
}

@keyframes supernova-text-pulse {
  0%, 100% {
    text-shadow:
      0 0 10px var(--tang-orange-500),
      0 0 20px var(--tang-honey),
      0 0 30px var(--tang-orange-600),
      0 0 40px var(--tang-honey);
    transform: scale(1);
  }
  50% {
    text-shadow:
      0 0 20px var(--tang-orange-500),
      0 0 40px var(--tang-honey),
      0 0 60px var(--tang-orange-600),
      0 0 80px var(--tang-honey);
    transform: scale(1.02);
  }
}

/* Founder's Name Glow - Special golden shimmer */
.name-founders-glow {
  background: linear-gradient(
    90deg,
    var(--tang-gold) 0%,
    var(--tang-amber) 25%,
    var(--tang-honey) 50%,
    var(--tang-amber) 75%,
    var(--tang-gold) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: founder-name-shimmer 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  font-weight: 700;
}

@keyframes founder-name-shimmer {
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
}
```

---

## 5. Background CSS

```css
/* backgrounds.css */

/* ============================================
   SOLID BACKGROUNDS - 2,500 🍊
   ============================================ */

.bg-midnight {
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
}

.bg-sunset {
  background: linear-gradient(135deg, var(--tang-orange-600) 0%, var(--tang-orange-800) 100%);
}

.bg-honey {
  background: linear-gradient(135deg, var(--tang-honey) 0%, var(--tang-amber) 100%);
}

.bg-forest {
  background: linear-gradient(135deg, #166534 0%, #14532d 100%);
}

.bg-ember {
  background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%);
}

/* ============================================
   GRADIENT BACKGROUNDS - 7,500 🍊
   ============================================ */

.bg-orange-sunrise {
  background: linear-gradient(
    135deg,
    var(--tang-orange-600) 0%,
    var(--tang-amber) 50%,
    var(--tang-honey) 100%
  );
}

.bg-twilight-grove {
  background: linear-gradient(
    135deg,
    #7c3aed 0%,
    var(--tang-orange-500) 50%,
    #ec4899 100%
  );
}

.bg-deep-ocean {
  background: linear-gradient(
    135deg,
    #1e3a5f 0%,
    #0891b2 100%
  );
}

.bg-cotton-candy {
  background: linear-gradient(
    135deg,
    #ec4899 0%,
    var(--tang-orange-400) 50%,
    var(--tang-honey) 100%
  );
}

/* ============================================
   ANIMATED BACKGROUNDS - 25,000 🍊
   ============================================ */

/* Citrus Rain */
.bg-citrus-rain {
  background: linear-gradient(180deg, #1a1a2e 0%, #2d1810 100%);
  position: relative;
  overflow: hidden;
}

.bg-citrus-rain::before {
  content: '🍊 🍊 🍊 🍊 🍊 🍊 🍊 🍊 🍊 🍊';
  position: absolute;
  top: -50px;
  left: 0;
  width: 200%;
  font-size: 20px;
  animation: rain-fall 10s linear infinite;
  opacity: 0.3;
}

@keyframes rain-fall {
  0% {
    transform: translateY(-50px) translateX(0);
  }
  100% {
    transform: translateY(200%) translateX(-10%);
  }
}

/* Floating Oranges */
.bg-floating-oranges {
  background: linear-gradient(180deg, #1a1a2e 0%, #2d2010 100%);
  position: relative;
  overflow: hidden;
}

/* ============================================
   PREMIUM ANIMATED BACKGROUNDS - 40,000 🍊
   ============================================ */

/* Starfield with Orange Nebula */
.bg-starfield {
  background: radial-gradient(
    ellipse at 50% 50%,
    rgba(234, 88, 12, 0.2) 0%,
    transparent 50%
  ),
  linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
  position: relative;
}

.bg-starfield::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, white, transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
    radial-gradient(1px 1px at 90px 40px, white, transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 160px 120px, white, transparent);
  background-size: 200px 200px;
  animation: stars-twinkle 4s ease-in-out infinite;
}

@keyframes stars-twinkle {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

/* Matrix Tang */
.bg-matrix-tang {
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
}

.bg-matrix-tang::before {
  content: '01🍊10🍊01🍊10🍊01🍊10🍊';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  color: var(--tang-orange-500);
  font-family: monospace;
  font-size: 14px;
  opacity: 0.3;
  animation: matrix-fall 15s linear infinite;
  white-space: nowrap;
}

@keyframes matrix-fall {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(200%);
  }
}

/* Founder's Background */
.bg-founders-grove {
  background:
    radial-gradient(
      ellipse at 30% 20%,
      rgba(251, 191, 36, 0.3) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 80%,
      rgba(234, 88, 12, 0.3) 0%,
      transparent 50%
    ),
    linear-gradient(
      180deg,
      #1a1510 0%,
      #2d1f10 50%,
      #1a1510 100%
    );
  animation: founder-bg-pulse 5s ease-in-out infinite;
}

@keyframes founder-bg-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
}
```

---

## 6. Celebration Effects

```tsx
// celebrations.tsx
import React, { useEffect, useRef } from 'react';

// Confetti celebration
export const ConfettiEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = ['#ea580c', '#f59e0b', '#fbbf24', '#fb923c', '#ffd700'];
    const confettiCount = 150;
    const confetti: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      angle: number;
      spin: number;
    }> = [];

    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((c) => {
        c.y += c.speed;
        c.x += Math.sin(c.angle) * 2;
        c.angle += c.spin;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size / 2);
        ctx.restore();

        if (c.y > canvas.height) {
          c.y = -c.size;
          c.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Stop after 3 seconds
    setTimeout(() => {
      cancelAnimationFrame(animationId);
    }, 3000);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

// Orange Rain celebration
export const OrangeRainEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orangeCount = 30;
    const oranges: HTMLDivElement[] = [];

    for (let i = 0; i < orangeCount; i++) {
      const orange = document.createElement('div');
      orange.innerHTML = '🍊';
      orange.style.cssText = `
        position: fixed;
        top: -50px;
        left: ${Math.random() * 100}vw;
        font-size: ${Math.random() * 20 + 20}px;
        animation: orange-fall ${Math.random() * 2 + 2}s linear forwards;
        animation-delay: ${Math.random() * 1}s;
        z-index: 9999;
        pointer-events: none;
      `;
      container.appendChild(orange);
      oranges.push(orange);
    }

    // Cleanup after animation
    setTimeout(() => {
      oranges.forEach((o) => o.remove());
    }, 4000);

    return () => {
      oranges.forEach((o) => o.remove());
    };
  }, []);

  return <div ref={containerRef} />;
};

// Citrus Explosion celebration
export const CitrusExplosionEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const citrusEmojis = ['🍊', '🍋', '🍈', '🍑'];
    const particleCount = 40;
    const particles: HTMLDivElement[] = [];

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const emoji = citrusEmojis[Math.floor(Math.random() * citrusEmojis.length)];
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = Math.random() * 200 + 100;
      const endX = Math.cos(angle) * velocity;
      const endY = Math.sin(angle) * velocity;

      particle.innerHTML = emoji;
      particle.style.cssText = `
        position: fixed;
        top: ${centerY}px;
        left: ${centerX}px;
        font-size: ${Math.random() * 15 + 20}px;
        transform: translate(-50%, -50%);
        animation: explode-out 1s ease-out forwards;
        --end-x: ${endX}px;
        --end-y: ${endY}px;
        z-index: 9999;
        pointer-events: none;
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    setTimeout(() => {
      particles.forEach((p) => p.remove());
    }, 1500);

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} />;
};

// Fireworks celebration
export const FireworksEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
    }

    const particles: Particle[] = [];
    const colors = ['#ea580c', '#f59e0b', '#fbbf24', '#ffd700', '#ff6600'];

    const createFirework = (x: number, y: number) => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        const velocity = Math.random() * 5 + 3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          alpha: 1,
          color,
        });
      }
    };

    // Create initial fireworks
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createFirework(
          Math.random() * canvas.width * 0.6 + canvas.width * 0.2,
          Math.random() * canvas.height * 0.4 + canvas.height * 0.1
        );
      }, i * 400);
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'transparent',
      }}
    />
  );
};

// Add keyframes to document
const style = document.createElement('style');
style.textContent = `
  @keyframes orange-fall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @keyframes explode-out {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(1);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
```

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
}

const hatEmojis: Record<string, string> = {
  party: '🎉',
  cowboy: '🤠',
  chef: '👨‍🍳',
  viking: '⚔️',
  pirate: '🏴‍☠️',
  beret: '🪖',
  tophat: '🎩',
  wizard: '🧙',
  devil: '😈',
  crown: '👑',
  halo: '😇',
};

const moodAnimations: Record<string, string> = {
  happy: 'bigpulp-bob',
  chill: 'bigpulp-float',
  sleepy: 'bigpulp-breathe',
  hype: 'bigpulp-bounce',
  grumpy: 'bigpulp-shake',
  sergeant: 'bigpulp-attention',
  numb: 'bigpulp-still',
  rekt: 'bigpulp-drip',
};

const moodExpressions: Record<string, React.ReactNode> = {
  happy: <div className="bigpulp-face happy">😊</div>,
  chill: <div className="bigpulp-face chill">😌</div>,
  sleepy: <div className="bigpulp-face sleepy">😴</div>,
  hype: <div className="bigpulp-face hype">🤩</div>,
  grumpy: <div className="bigpulp-face grumpy">😤</div>,
  sergeant: <div className="bigpulp-face sergeant">🫡</div>,
  numb: <div className="bigpulp-face numb">😐</div>,
  rekt: <div className="bigpulp-face rekt">🩸😵🩸</div>,
};

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
};

export const BigPulp: React.FC<BigPulpProps> = ({
  hat = null,
  mood = 'happy',
  accessory = null,
  size = 'medium',
}) => {
  const pixelSize = sizeMap[size];
  const animation = moodAnimations[mood];

  return (
    <div
      className={`bigpulp-container ${animation}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Orange body */}
      <div className="bigpulp-body">
        {/* Glasses (always present) */}
        <div className="bigpulp-glasses">🕶️</div>

        {/* Face expression based on mood */}
        {moodExpressions[mood]}

        {/* Hat */}
        {hat && (
          <div className="bigpulp-hat">
            {hatEmojis[hat] || '🎩'}
          </div>
        )}

        {/* Accessory */}
        {accessory && (
          <div className={`bigpulp-accessory bigpulp-accessory-${accessory}`}>
            {accessory === 'cigar' && '🚬'}
            {accessory === 'bowtie' && '🎀'}
            {accessory === 'headphones' && '🎧'}
            {accessory === 'monocle' && '🧐'}
            {accessory === 'bandana' && '🏴‍☠️'}
            {accessory === 'earring' && '💎'}
            {accessory === 'scar' && '⚔️'}
          </div>
        )}
      </div>
    </div>
  );
};
```

```css
/* bigpulp.css */

.bigpulp-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bigpulp-body {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, #fbbf24, #ea580c);
  border-radius: 50%;
  position: relative;
  box-shadow:
    inset -5px -5px 15px rgba(0, 0, 0, 0.2),
    0 4px 10px rgba(0, 0, 0, 0.3);
}

.bigpulp-glasses {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.5em;
}

.bigpulp-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.4em;
}

.bigpulp-hat {
  position: absolute;
  top: -30%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.6em;
}

.bigpulp-accessory {
  position: absolute;
  font-size: 0.3em;
}

.bigpulp-accessory-cigar {
  bottom: 20%;
  right: 10%;
}

.bigpulp-accessory-bowtie {
  bottom: 5%;
  left: 50%;
  transform: translateX(-50%);
}

.bigpulp-accessory-headphones {
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
}

/* Animations */
@keyframes bigpulp-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes bigpulp-float {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}

@keyframes bigpulp-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes bigpulp-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.1); }
}

@keyframes bigpulp-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

@keyframes bigpulp-attention {
  0%, 100% { transform: translateY(0); }
  10% { transform: translateY(-2px); }
}

@keyframes bigpulp-drip {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(0.8) saturate(0.8); }
}

.bigpulp-bob { animation: bigpulp-bob 1s ease-in-out infinite; }
.bigpulp-float { animation: bigpulp-float 2s ease-in-out infinite; }
.bigpulp-breathe { animation: bigpulp-breathe 3s ease-in-out infinite; }
.bigpulp-bounce { animation: bigpulp-bounce 0.5s ease-in-out infinite; }
.bigpulp-shake { animation: bigpulp-shake 0.3s ease-in-out infinite; }
.bigpulp-attention { animation: bigpulp-attention 2s ease-in-out infinite; }
.bigpulp-still { animation: none; }
.bigpulp-drip { animation: bigpulp-drip 2s ease-in-out infinite; }

/* Rekt mood special effect - blood drips */
.bigpulp-face.rekt::before,
.bigpulp-face.rekt::after {
  content: '💧';
  position: absolute;
  color: red;
  font-size: 0.5em;
  animation: blood-drip 2s ease-in infinite;
}

.bigpulp-face.rekt::before {
  left: 20%;
  animation-delay: 0s;
}

.bigpulp-face.rekt::after {
  right: 20%;
  animation-delay: 0.5s;
}

@keyframes blood-drip {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
}
```

---

## 8. Achievement Drawer Component

```tsx
// AchievementDrawer.tsx
import React from 'react';
import { BigPulp } from './BigPulp';
import './achievement-drawer.css';

interface DrawerItem {
  id: string;
  name: string;
  type: string;
  emoji?: string;
  cssClass?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'founder';
}

interface DrawerData {
  username: string;
  totalItems: number;
  totalSpent: number;
  emojiBadges: string[];
  frames: DrawerItem[];
  titles: DrawerItem[];
  nameEffects: DrawerItem[];
  backgrounds: DrawerItem[];
  celebrations: DrawerItem[];
  bigpulp: {
    hats: string[];
    moods: string[];
    accessories: string[];
  };
  achievements: Array<{ id: string; name: string; icon: string; earnedAt: string }>;
}

interface AchievementDrawerProps {
  data: DrawerData;
}

export const AchievementDrawer: React.FC<AchievementDrawerProps> = ({ data }) => {
  const rarityClasses: Record<string, string> = {
    common: 'rarity-common',
    uncommon: 'rarity-uncommon',
    rare: 'rarity-rare',
    legendary: 'rarity-legendary',
    founder: 'rarity-founder',
  };

  return (
    <div className="achievement-drawer">
      {/* Header */}
      <div className="drawer-header">
        <h1>🍊 {data.username}'s Achievement Drawer</h1>
        <div className="drawer-stats">
          <span className="stat">
            <strong>{data.totalItems}</strong> Items
          </span>
          <span className="stat">
            <strong>{data.totalSpent.toLocaleString()}</strong> 🍊 Spent
          </span>
        </div>
      </div>

      {/* Emoji Badges Section */}
      {data.emojiBadges.length > 0 && (
        <section className="drawer-section">
          <h2>EMOJI BADGES</h2>
          <div className="drawer-grid emoji-grid">
            {data.emojiBadges.map((emoji, i) => (
              <div key={i} className="drawer-item emoji-item">
                <span className="emoji-badge">{emoji}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frames Section */}
      {data.frames.length > 0 && (
        <section className="drawer-section">
          <h2>FRAMES</h2>
          <div className="drawer-grid">
            {data.frames.map((frame) => (
              <div
                key={frame.id}
                className={`drawer-item ${rarityClasses[frame.rarity]}`}
              >
                <div className={`frame-preview ${frame.cssClass}`}>
                  <div className="preview-avatar" />
                </div>
                <span className="item-name">{frame.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Titles Section */}
      {data.titles.length > 0 && (
        <section className="drawer-section">
          <h2>TITLES</h2>
          <div className="drawer-grid">
            {data.titles.map((title) => (
              <div
                key={title.id}
                className={`drawer-item title-item ${rarityClasses[title.rarity]}`}
              >
                <span className="title-text">"{title.name}"</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Name Effects Section */}
      {data.nameEffects.length > 0 && (
        <section className="drawer-section">
          <h2>NAME EFFECTS</h2>
          <div className="drawer-grid">
            {data.nameEffects.map((effect) => (
              <div
                key={effect.id}
                className={`drawer-item ${rarityClasses[effect.rarity]}`}
              >
                <span className={`name-preview ${effect.cssClass}`} data-text="Preview">
                  Preview
                </span>
                <span className="item-name">{effect.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BigPulp Section */}
      {(data.bigpulp.hats.length > 0 ||
        data.bigpulp.moods.length > 0 ||
        data.bigpulp.accessories.length > 0) && (
        <section className="drawer-section">
          <h2>BIGPULP</h2>
          <div className="bigpulp-showcase">
            <BigPulp size="large" />
            <div className="bigpulp-items">
              {data.bigpulp.hats.length > 0 && (
                <div className="bigpulp-category">
                  <h3>Hats</h3>
                  <div className="drawer-grid small">
                    {data.bigpulp.hats.map((hat) => (
                      <div key={hat} className="drawer-item small">
                        {hat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.bigpulp.moods.length > 0 && (
                <div className="bigpulp-category">
                  <h3>Moods</h3>
                  <div className="drawer-grid small">
                    {data.bigpulp.moods.map((mood) => (
                      <div key={mood} className="drawer-item small">
                        {mood}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.bigpulp.accessories.length > 0 && (
                <div className="bigpulp-category">
                  <h3>Accessories</h3>
                  <div className="drawer-grid small">
                    {data.bigpulp.accessories.map((acc) => (
                      <div key={acc} className="drawer-item small">
                        {acc}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Backgrounds Section */}
      {data.backgrounds.length > 0 && (
        <section className="drawer-section">
          <h2>BACKGROUNDS</h2>
          <div className="drawer-grid">
            {data.backgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`drawer-item bg-item ${rarityClasses[bg.rarity]}`}
              >
                <div className={`bg-preview ${bg.cssClass}`} />
                <span className="item-name">{bg.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Win Effects Section */}
      {data.celebrations.length > 0 && (
        <section className="drawer-section">
          <h2>WIN EFFECTS</h2>
          <div className="drawer-grid">
            {data.celebrations.map((effect) => (
              <div
                key={effect.id}
                className={`drawer-item ${rarityClasses[effect.rarity]}`}
              >
                <span className="effect-icon">🎉</span>
                <span className="item-name">{effect.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievement Badges Section */}
      {data.achievements.length > 0 && (
        <section className="drawer-section">
          <h2>ACHIEVEMENT BADGES</h2>
          <div className="drawer-grid">
            {data.achievements.map((badge) => (
              <div key={badge.id} className="drawer-item achievement-item">
                <span className="achievement-icon">{badge.icon}</span>
                <span className="item-name">{badge.name}</span>
                <span className="earned-date">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
```

```css
/* achievement-drawer.css */

.achievement-drawer {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  color: white;
}

.drawer-header {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(234, 88, 12, 0.3);
  margin-bottom: 20px;
}

.drawer-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.drawer-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.drawer-stats .stat {
  color: rgba(255, 255, 255, 0.7);
}

.drawer-stats .stat strong {
  color: var(--tang-orange-500);
}

.drawer-section {
  margin-bottom: 30px;
}

.drawer-section h2 {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
}

.drawer-grid.small {
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
}

.drawer-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.drawer-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.drawer-item.small {
  padding: 10px;
}

/* Rarity borders */
.rarity-common {
  border: 2px solid var(--rarity-common);
}

.rarity-uncommon {
  border: 2px solid var(--rarity-uncommon);
}

.rarity-rare {
  border: 2px solid var(--rarity-rare);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.rarity-legendary {
  border: 2px solid var(--rarity-legendary);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}

.rarity-founder {
  border: 2px solid transparent;
  background:
    linear-gradient(#1a1a2e, #1a1a2e) padding-box,
    linear-gradient(135deg, #fbbf24, #ea580c) border-box;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.emoji-item {
  font-size: 32px;
}

.frame-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.preview-avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #4a4a4a, #2a2a2a);
  border-radius: 50%;
}

.item-name {
  font-size: 12px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.title-text {
  font-style: italic;
  color: var(--tang-honey);
}

.bg-preview {
  width: 80px;
  height: 50px;
  border-radius: 8px;
}

.bigpulp-showcase {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.bigpulp-items {
  flex: 1;
}

.bigpulp-category {
  margin-bottom: 15px;
}

.bigpulp-category h3 {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.achievement-item {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(234, 88, 12, 0.1));
}

.achievement-icon {
  font-size: 24px;
}

.earned-date {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}
```

---

## 9. Username Display Component

```tsx
// UsernameDisplay.tsx
import React from 'react';

interface UsernameDisplayProps {
  username: string;
  emojiBadges?: string[];
  nameEffectClass?: string;
  title?: string;
}

export const UsernameDisplay: React.FC<UsernameDisplayProps> = ({
  username,
  emojiBadges = [],
  nameEffectClass,
  title,
}) => {
  return (
    <div className="username-display">
      {/* Emoji badges before name */}
      {emojiBadges.length > 0 && (
        <span className="emoji-badges">
          {emojiBadges.join('')}
        </span>
      )}

      {/* Username with effect */}
      <span
        className={`username ${nameEffectClass || ''}`}
        data-text={username}
      >
        {username}
      </span>

      {/* Title below */}
      {title && (
        <span className="user-title">"{title}"</span>
      )}
    </div>
  );
};
```

```css
/* username-display.css */

.username-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.emoji-badges {
  font-size: 0.9em;
  letter-spacing: -2px;
}

.username {
  font-weight: 600;
}

.user-title {
  font-size: 0.75em;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  margin-left: 4px;
}
```

---

## 10. Database Seed Data

```sql
-- seed-shop-items.sql

-- ============================================
-- EMOJI BADGES
-- ============================================

-- General Emojis
INSERT INTO shop_items (id, name, category, rarity, price_oranges, emoji) VALUES
('emoji-orange', 'Orange', 'emoji_badge', 'common', 500, '🍊'),
('emoji-heart', 'Orange Heart', 'emoji_badge', 'common', 500, '🧡'),
('emoji-seedling', 'Seedling', 'emoji_badge', 'common', 500, '🌱'),
('emoji-star', 'Star', 'emoji_badge', 'common', 750, '⭐'),
('emoji-target', 'Target', 'emoji_badge', 'common', 750, '🎯'),
('emoji-lightning', 'Lightning', 'emoji_badge', 'uncommon', 1500, '⚡'),
('emoji-rocket', 'Rocket', 'emoji_badge', 'uncommon', 1500, '🚀'),
('emoji-skull', 'Skull', 'emoji_badge', 'uncommon', 2500, '💀'),
('emoji-alien', 'Alien', 'emoji_badge', 'uncommon', 2500, '👽'),
('emoji-robot', 'Robot', 'emoji_badge', 'uncommon', 2500, '🤖'),
('emoji-ape', 'Ape', 'emoji_badge', 'rare', 4000, '🦍'),
('emoji-glowstar', 'Glowing Star', 'emoji_badge', 'rare', 4000, '🌟'),
('emoji-diamond', 'Diamond', 'emoji_badge', 'rare', 5000, '💎'),
('emoji-moneybag', 'Money Bag', 'emoji_badge', 'rare', 7500, '💰');

-- Legend Tribute Emojis
INSERT INTO shop_items (id, name, category, rarity, price_oranges, emoji, legend_tribute) VALUES
('emoji-fire', 'Fire (TheStakerClass)', 'emoji_badge', 'legendary', 15000, '🔥', 'TheStakerClass'),
('emoji-cookie', 'Cookie (OrangeGooey)', 'emoji_badge', 'legendary', 15000, '🍪', 'OrangeGooey'),
('emoji-frog', 'Frog (Tom Bepe)', 'emoji_badge', 'legendary', 20000, '🐸', 'Tom Bepe'),
('emoji-goose', 'Goose (Foods)', 'emoji_badge', 'legendary', 20000, '🪿', 'Foods'),
('emoji-trophy', 'Trophy (Papa Tang)', 'emoji_badge', 'legendary', 25000, '🏆', 'Papa Tang'),
('emoji-tophat', 'Top Hat (DegenWaffle)', 'emoji_badge', 'legendary', 25000, '🎩', 'DegenWaffle'),
('emoji-crown', 'Crown (Bullish0x)', 'emoji_badge', 'legendary', 40000, '👑', 'Bullish0x');

-- ============================================
-- FRAMES
-- ============================================

-- Grove Tier
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('frame-seedling', 'Seedling', 'frame', 'common', 2500, 'frame-seedling'),
('frame-orange', 'Orange', 'frame', 'common', 2500, 'frame-orange');

-- Orchard Tier (Glow Effects)
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('frame-citrus-glow', 'Citrus Glow', 'frame', 'uncommon', 7500, 'frame-citrus-glow'),
('frame-sunset-grove', 'Sunset Grove', 'frame', 'uncommon', 7500, 'frame-sunset-grove'),
('frame-honey-drip', 'Honey Drip', 'frame', 'uncommon', 7500, 'frame-honey-drip'),
('frame-ocean-mist', 'Ocean Mist', 'frame', 'uncommon', 7500, 'frame-ocean-mist'),
('frame-berry-blush', 'Berry Blush', 'frame', 'uncommon', 7500, 'frame-berry-blush'),
('frame-mint-fresh', 'Mint Fresh', 'frame', 'uncommon', 7500, 'frame-mint-fresh'),
('frame-lavender-dream', 'Lavender Dream', 'frame', 'uncommon', 7500, 'frame-lavender-dream'),
('frame-arctic-frost', 'Arctic Frost', 'frame', 'uncommon', 7500, 'frame-arctic-frost');

-- Harvest Tier (Animated)
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('frame-burning-citrus', 'Burning Citrus', 'frame', 'rare', 25000, 'frame-burning-citrus'),
('frame-electric-tang', 'Electric Tang', 'frame', 'rare', 25000, 'frame-electric-tang'),
('frame-liquid-gold', 'Liquid Gold', 'frame', 'rare', 25000, 'frame-liquid-gold'),
('frame-frozen-juice', 'Frozen Juice', 'frame', 'rare', 25000, 'frame-frozen-juice');

-- Legendary Tier
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('frame-aurora-grove', 'Aurora Grove', 'frame', 'legendary', 75000, 'frame-aurora-grove'),
('frame-void-citrus', 'Void Citrus', 'frame', 'legendary', 75000, 'frame-void-citrus'),
('frame-holographic-tang', 'Holographic Tang', 'frame', 'legendary', 75000, 'frame-holographic-tang'),
('frame-supernova', 'Supernova', 'frame', 'legendary', 75000, 'frame-supernova');

-- Legend Emoji Frames
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class, emoji, legend_tribute) VALUES
('frame-emoji-crown', 'Crown Frame', 'frame', 'legendary', 75000, 'frame-emoji-crown', '👑', 'Bullish0x'),
('frame-emoji-tophat', 'Top Hat Frame', 'frame', 'legendary', 75000, 'frame-emoji-tophat', '🎩', 'DegenWaffle'),
('frame-emoji-cookie', 'Cookie Frame', 'frame', 'legendary', 75000, 'frame-emoji-cookie', '🍪', 'OrangeGooey'),
('frame-emoji-frog', 'Frog Frame', 'frame', 'legendary', 75000, 'frame-emoji-frog', '🐸', 'Tom Bepe'),
('frame-emoji-goose', 'Goose Frame', 'frame', 'legendary', 75000, 'frame-emoji-goose', '🪿', 'Foods'),
('frame-emoji-trophy', 'Trophy Frame', 'frame', 'legendary', 75000, 'frame-emoji-trophy', '🏆', 'Papa Tang'),
('frame-emoji-fire', 'Fire Frame', 'frame', 'legendary', 75000, 'frame-emoji-fire', '🔥', 'TheStakerClass');

-- ============================================
-- NAME EFFECTS
-- ============================================

-- Basic
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('name-citrus-text', 'Citrus Text', 'name_effect', 'common', 2500, 'name-citrus-text'),
('name-bold-grove', 'Bold Grove', 'name_effect', 'common', 2500, 'name-bold-grove'),
('name-shimmer', 'Shimmer', 'name_effect', 'common', 2500, 'name-shimmer'),
('name-pulse', 'Pulse', 'name_effect', 'common', 2500, 'name-pulse'),
('name-gradient-flow', 'Gradient Flow', 'name_effect', 'common', 2500, 'name-gradient-flow');

-- Animated
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('name-rainbow-tang', 'Rainbow Tang', 'name_effect', 'rare', 15000, 'name-rainbow-tang'),
('name-glitch', 'Glitch', 'name_effect', 'rare', 15000, 'name-glitch'),
('name-fire-text', 'Fire Text', 'name_effect', 'rare', 15000, 'name-fire-text'),
('name-neon-sign', 'Neon Sign', 'name_effect', 'rare', 15000, 'name-neon-sign'),
('name-matrix', 'Matrix', 'name_effect', 'rare', 15000, 'name-matrix');

-- Legendary
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('name-dripping-gold', 'Dripping Gold', 'name_effect', 'legendary', 40000, 'name-dripping-gold'),
('name-electric-shock', 'Electric Shock', 'name_effect', 'legendary', 40000, 'name-electric-shock'),
('name-void-whisper', 'Void Whisper', 'name_effect', 'legendary', 40000, 'name-void-whisper'),
('name-supernova-text', 'Supernova Text', 'name_effect', 'legendary', 40000, 'name-supernova-text');

-- ============================================
-- TITLES
-- ============================================

-- Grove Ranks
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('title-seedling', 'Seedling', 'title', 'common', 2500),
('title-grove-keeper', 'Grove Keeper', 'title', 'common', 2500),
('title-orchard-master', 'Orchard Master', 'title', 'common', 2500),
('title-citrus-lord', 'Citrus Lord', 'title', 'common', 2500),
('title-tang-emperor', 'Tang Emperor', 'title', 'common', 2500);

-- Mood Titles
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('title-vibing', 'Vibing', 'title', 'uncommon', 5000),
('title-wagmi', 'WAGMI', 'title', 'uncommon', 5000),
('title-ngmi', 'NGMI', 'title', 'uncommon', 5000),
('title-diamond-hands', 'Diamond Hands', 'title', 'uncommon', 5000),
('title-smooth-brain', 'Smooth Brain', 'title', 'uncommon', 5000),
('title-galaxy-brain', 'Galaxy Brain', 'title', 'uncommon', 5000),
('title-absolute-unit', 'Absolute Unit', 'title', 'uncommon', 5000),
('title-touch-grass', 'Touch Grass', 'title', 'uncommon', 5000);

-- Legend Catchphrases
INSERT INTO shop_items (id, name, category, rarity, price_oranges, legend_tribute) VALUES
('title-king-grove', 'King of the Grove', 'title', 'legendary', 15000, 'Bullish0x'),
('title-neckbeard', 'Neckbeard', 'title', 'legendary', 15000, 'DegenWaffle'),
('title-accept-cookies', 'Accept Cookies', 'title', 'legendary', 15000, 'OrangeGooey'),
('title-bepe-army', 'Bepe Army', 'title', 'legendary', 15000, 'Tom Bepe'),
('title-breadsticks', 'Breadsticks', 'title', 'legendary', 15000, 'Foods'),
('title-winners-win', 'Winners Win!', 'title', 'legendary', 15000, 'Papa Tang'),
('title-beret-stays-on', 'The Beret Stays On', 'title', 'legendary', 15000, 'TheStakerClass');

-- Custom Title Slot
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('title-custom-slot', 'Custom Title Slot', 'title', 'legendary', 50000);

-- ============================================
-- BIGPULP ITEMS
-- ============================================

-- Hats
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-hat-party', 'Party Hat', 'bigpulp_hat', 'common', 2500),
('bigpulp-hat-cowboy', 'Cowboy Hat', 'bigpulp_hat', 'common', 4000),
('bigpulp-hat-chef', 'Chef Hat', 'bigpulp_hat', 'common', 4000),
('bigpulp-hat-viking', 'Viking Helmet', 'bigpulp_hat', 'uncommon', 7500),
('bigpulp-hat-pirate', 'Pirate Hat', 'bigpulp_hat', 'uncommon', 7500),
('bigpulp-hat-beret', 'Beret', 'bigpulp_hat', 'uncommon', 7500),
('bigpulp-hat-tophat', 'Top Hat', 'bigpulp_hat', 'rare', 10000),
('bigpulp-hat-wizard', 'Wizard Hat', 'bigpulp_hat', 'rare', 10000),
('bigpulp-hat-devil', 'Devil Horns', 'bigpulp_hat', 'rare', 12500),
('bigpulp-hat-crown', 'Crown', 'bigpulp_hat', 'legendary', 25000),
('bigpulp-hat-halo', 'Halo', 'bigpulp_hat', 'legendary', 25000);

-- Moods
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-mood-happy', 'Happy', 'bigpulp_mood', 'common', 1500),
('bigpulp-mood-chill', 'Chill', 'bigpulp_mood', 'common', 1500),
('bigpulp-mood-sleepy', 'Sleepy', 'bigpulp_mood', 'common', 2500),
('bigpulp-mood-hype', 'Hype', 'bigpulp_mood', 'uncommon', 4000),
('bigpulp-mood-grumpy', 'Grumpy', 'bigpulp_mood', 'uncommon', 4000),
('bigpulp-mood-sergeant', 'Sergeant', 'bigpulp_mood', 'rare', 7500),
('bigpulp-mood-numb', 'Numb', 'bigpulp_mood', 'rare', 10000),
('bigpulp-mood-rekt', 'Rekt', 'bigpulp_mood', 'legendary', 15000);

-- Accessories
INSERT INTO shop_items (id, name, category, rarity, price_oranges) VALUES
('bigpulp-acc-bowtie', 'Bowtie', 'bigpulp_accessory', 'common', 1500),
('bigpulp-acc-bandana', 'Bandana', 'bigpulp_accessory', 'common', 2500),
('bigpulp-acc-earring', 'Earring', 'bigpulp_accessory', 'common', 2500),
('bigpulp-acc-headphones', 'Headphones', 'bigpulp_accessory', 'uncommon', 4000),
('bigpulp-acc-cigar', 'Cigar', 'bigpulp_accessory', 'uncommon', 5000),
('bigpulp-acc-monocle', 'Monocle', 'bigpulp_accessory', 'rare', 7500),
('bigpulp-acc-scar', 'Scar', 'bigpulp_accessory', 'rare', 10000);

-- ============================================
-- BACKGROUNDS
-- ============================================

-- Solid
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('bg-midnight', 'Midnight', 'background', 'common', 2500, 'bg-midnight'),
('bg-sunset', 'Sunset', 'background', 'common', 2500, 'bg-sunset'),
('bg-honey', 'Honey', 'background', 'common', 2500, 'bg-honey'),
('bg-forest', 'Forest', 'background', 'common', 2500, 'bg-forest'),
('bg-ember', 'Ember', 'background', 'common', 2500, 'bg-ember');

-- Gradients
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('bg-orange-sunrise', 'Orange Sunrise', 'background', 'uncommon', 7500, 'bg-orange-sunrise'),
('bg-twilight-grove', 'Twilight Grove', 'background', 'uncommon', 7500, 'bg-twilight-grove'),
('bg-deep-ocean', 'Deep Ocean', 'background', 'uncommon', 7500, 'bg-deep-ocean'),
('bg-cotton-candy', 'Cotton Candy', 'background', 'uncommon', 7500, 'bg-cotton-candy');

-- Animated
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('bg-citrus-rain', 'Citrus Rain', 'background', 'rare', 25000, 'bg-citrus-rain'),
('bg-floating-oranges', 'Floating Oranges', 'background', 'rare', 25000, 'bg-floating-oranges');

-- Premium Animated
INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('bg-orange-grove', 'Orange Grove', 'background', 'legendary', 40000, 'bg-orange-grove'),
('bg-starfield', 'Starfield', 'background', 'legendary', 40000, 'bg-starfield'),
('bg-matrix-tang', 'Matrix Tang', 'background', 'legendary', 40000, 'bg-matrix-tang');

-- ============================================
-- WIN EFFECTS
-- ============================================

INSERT INTO shop_items (id, name, category, rarity, price_oranges, css_class) VALUES
('celebration-confetti', 'Confetti', 'celebration', 'common', 5000, 'celebration-confetti'),
('celebration-orange-rain', 'Orange Rain', 'celebration', 'uncommon', 10000, 'celebration-orange-rain'),
('celebration-citrus-explosion', 'Citrus Explosion', 'celebration', 'rare', 15000, 'celebration-citrus-explosion'),
('celebration-fireworks', 'Fireworks', 'celebration', 'legendary', 25000, 'celebration-fireworks');

-- ============================================
-- ACHIEVEMENT BADGES (defined for reference, earned not bought)
-- ============================================

INSERT INTO shop_items (id, name, category, rarity, price_oranges, emoji) VALUES
('achievement-pioneer', 'Pioneer', 'achievement', 'legendary', 0, '🌱'),
('achievement-builder', 'Builder', 'achievement', 'legendary', 0, '🔨'),
('achievement-veteran', 'Grove Veteran', 'achievement', 'legendary', 0, '⭐'),
('achievement-big-spender', 'Big Spender', 'achievement', 'legendary', 0, '💰'),
('achievement-collector', 'Collector', 'achievement', 'legendary', 0, '📦'),
('achievement-whale', 'Whale', 'achievement', 'legendary', 0, '🐋');
```

---

## IMPLEMENTATION NOTES FOR CLAUDE CLI

### Priority Order

1. **Database Setup** - Run seed SQL first
2. **CSS Files** - Create all CSS files in the styles directory
3. **Core Components** - UsernameDisplay, BigPulp, EmojiFrame
4. **Shop UI** - Item listings with preview
5. **Purchase Flow** - API endpoints for buying
6. **Achievement Drawer** - Profile showcase page
7. **Celebrations** - Win effects system
8. **Founder's Collection** - XCH payment integration

### Key Technical Notes

1. **@property CSS** - Required for animated gradient borders. Check browser support and add fallbacks.

2. **Emoji Frames** - Use SVG textPath for true circular emoji borders. The CSS-only version is a fallback.

3. **Name Effects with data-text** - Glitch and void effects need `data-text` attribute for pseudo-element content.

4. **Celebration Cleanup** - All celebration effects should auto-cleanup after animation completes.

5. **BigPulp Moods** - The "rekt" mood needs special blood drip effect using pseudo-elements.

6. **Database Queries** - Always join with user_inventory to check ownership and equipped status.

### File Structure

```
src/
├── styles/
│   ├── shop-variables.css
│   ├── frames-grove.css
│   ├── frames-orchard.css
│   ├── frames-harvest.css
│   ├── frames-legendary.css
│   ├── frames-emoji.css
│   ├── name-effects.css
│   ├── backgrounds.css
│   └── achievement-drawer.css
├── components/
│   ├── shop/
│   │   ├── ShopItem.tsx
│   │   ├── ShopCategory.tsx
│   │   └── ShopPage.tsx
│   ├── cosmetics/
│   │   ├── EmojiFrame.tsx
│   │   ├── UsernameDisplay.tsx
│   │   ├── BigPulp.tsx
│   │   └── AchievementDrawer.tsx
│   └── celebrations/
│       ├── Confetti.tsx
│       ├── OrangeRain.tsx
│       ├── CitrusExplosion.tsx
│       └── Fireworks.tsx
└── api/
    ├── shop.ts
    ├── inventory.ts
    └── bigpulp.ts
```

---

**Winners win, baby!** 🍊
