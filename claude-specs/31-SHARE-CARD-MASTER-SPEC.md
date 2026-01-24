# SPEC 31: Share Card Master Specification

## Why This Matters

The share card is the **single most important viral mechanic** for wojak.ink games. When designed well, it becomes free marketing - every share is an advertisement. Wordle's viral success was largely due to its simple, spoiler-free share grid that let players "tell a story" about their game without words.

Our goal: **Make users WANT to share, not just able to share.**

---

## Design Philosophy

### Learn from Wordle's Success

According to [The Hard Copy's analysis](https://thehardcopy.co/wordles-viral-success-is-based-on-design/), Wordle's share feature works because:

1. **It tells a story** - The colored grid shows your journey, not just the result
2. **It's spoiler-free** - Others can see your achievement without ruining their game
3. **It creates FOMO** - Seeing others share makes non-players curious
4. **It's instantly recognizable** - The format is unique and branded

### Learn from Supercell (Brawl Stars)

According to [Brawl Stars UX analysis](https://medium.com/@matt.sullivan28/a-brief-look-brawl-stars-ux-ui-562f6225b7e3):

1. **High energy visuals** - Bold colors, dynamic elements
2. **Never overcrowded** - Despite many elements, it feels balanced
3. **Player empowerment** - Makes the player feel like a champion

---

## Implementation Phases

**IMPORTANT: Implement in phases to avoid overwhelming complexity.**

---

# PHASE 1: Foundation Layout

## Objective
Create the basic share card structure with proper proportions and positioning.

## Dimensions
- **Card size:** 1200 × 630px (optimal for all social platforms)
- **Aspect ratio:** 1.91:1

## Layout Grid

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           4px ORANGE ACCENT LINE                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│     ┌─────────────────────┐         ┌─────────────────────────────┐       │
│     │                     │         │                             │       │
│     │                     │         │      RIGHT CONTENT          │       │
│     │    LEFT SECTION     │         │      (centered vertically)  │       │
│     │    (Screenshot)     │   48px  │                             │       │
│     │                     │   gap   │      - Game Title           │       │
│     │    Max: 420×460px   │         │      - Score                │       │
│     │                     │         │      - Best + Badge         │       │
│     │                     │         │      - CTA                  │       │
│     │                     │         │                             │       │
│     └─────────────────────┘         └─────────────────────────────┘       │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│  🍊 WOJAK.INK                                 🍊 Tang Grove Gaming 🍊      │
│                              56px BRANDING BAR                             │
└────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1 CSS

```css
.share-card {
  width: 1200px;
  height: 630px;
  position: relative;
  display: flex;
  padding: 40px;
  padding-bottom: 96px; /* Space for branding bar */
  gap: 48px;
  background: linear-gradient(145deg, #1a1f3c 0%, #0f1225 100%);
  font-family: 'Inter', -apple-system, sans-serif;
  color: white;
  overflow: hidden;
}

/* Orange top accent */
.share-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B00, #FF8C00, #FF6B00);
}

/* Screenshot container */
.share-card__screenshot {
  width: 420px;
  max-height: 460px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.share-card__screenshot img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* CRITICAL: contain, not cover */
}

/* Content area - vertically centered */
.share-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* CRITICAL: center vertically */
  gap: 12px;
}

/* Branding bar */
.share-card__branding {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.share-card__brand-left,
.share-card__brand-right {
  font-size: 18px;
  font-weight: 700;
  color: #FF6B00;
}
```

## Phase 1 Checklist
- [ ] Card is exactly 1200×630px
- [ ] Left section holds screenshot (max 420×460)
- [ ] Right content is VERTICALLY CENTERED
- [ ] 48px gap between sections
- [ ] Orange 4px accent line at top
- [ ] 56px branding bar at bottom
- [ ] Screenshot uses `object-fit: contain`

---

# PHASE 2: Typography & Content

## Objective
Establish clear visual hierarchy where the score is the hero.

## Typography Scale

| Element | Size | Weight | Color | Spacing |
|---------|------|--------|-------|---------|
| Game Title | 38px | 900 | white 95% | letter-spacing: 6px |
| Score Number | 160px | 900 | #FF6B00 | letter-spacing: -4px |
| Score Label | 26px | 500 | white 50% | normal |
| Best Score | 22px | 700 | #FF6B00 | normal |
| Badge | 14px | 800 | white | letter-spacing: 1px |
| CTA | 18px | 500 | white 40% | italic |

## Visual Hierarchy (Top to Bottom)

```
1. GAME TITLE         ← Identifies what game (medium emphasis)
   ─────────────      ← Thin divider line

2.    147             ← THE HERO - biggest, boldest, orange glow
   pipes passed       ← Context for the number

   ═══════════════    ← Thicker divider

3. 🍊 Best: 51  [💪 NICE RUN!]  ← Achievement context + badge

4. Can you beat my score?      ← Call to action (subtle)
```

## Phase 2 CSS

```css
/* Game title - stacked words for impact */
.share-card__title {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 8px;
}

.share-card__title-word {
  font-size: 38px;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.1;
}

/* Divider lines */
.share-card__divider {
  height: 2px;
  border-radius: 1px;
  margin: 12px 0;
}

.share-card__divider--thin {
  width: 80px;
  background: rgba(255, 107, 0, 0.4);
}

.share-card__divider--thick {
  width: 140px;
  height: 3px;
  background: linear-gradient(90deg, #FF6B00 0%, rgba(255, 107, 0, 0.2) 100%);
}

/* Score - THE HERO */
.share-card__score {
  margin: 8px 0;
}

.share-card__score-number {
  font-size: 160px;
  font-weight: 900;
  color: #FF6B00;
  line-height: 0.85;
  letter-spacing: -4px;
  text-shadow:
    0 0 60px rgba(255, 107, 0, 0.35),
    0 4px 16px rgba(0, 0, 0, 0.4);
}

.share-card__score-label {
  font-size: 26px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

/* Best score + Badge row */
.share-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.share-card__best {
  font-size: 22px;
  font-weight: 700;
  color: #FF6B00;
}

.share-card__badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: white;
  background: var(--badge-bg);
  box-shadow: 0 4px 12px var(--badge-glow);
}

/* CTA */
.share-card__cta {
  font-size: 18px;
  font-weight: 500;
  font-style: italic;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 16px;
}
```

## Phase 2 Checklist
- [ ] Game title is 38px, uppercase, letter-spaced
- [ ] Score is 160px, orange, with text-shadow glow
- [ ] Score label is 26px, 50% white
- [ ] Two divider lines (thin above score, thick below)
- [ ] Best score and badge on same row
- [ ] CTA is subtle (40% white, italic)

---

# PHASE 3: Visual Effects & Polish

## Objective
Fill empty space with purposeful decorations that enhance the gaming vibe.

## Decoration Layers (Back to Front)

```
Layer 0: Background gradient + subtle pattern
Layer 1: Blurred gradient orbs
Layer 2: Decorative circles
Layer 3: Sparkles (✦ ✧ ·)
Layer 4: Game-specific icons
Layer 5: Main content
Layer 6: Score glow effect
```

## 3A: Background Enhancement

```css
.share-card {
  background:
    /* Subtle dot pattern */
    radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 1px),
    /* Main gradient */
    linear-gradient(145deg, #1a1f3c 0%, #0f1225 60%, #1a1f3c 100%);
  background-size: 20px 20px, 100% 100%;
}
```

## 3B: Gradient Orbs (Blurred Background Elements)

```css
.share-card__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.share-card__orb--1 {
  top: 5%;
  right: 5%;
  width: 280px;
  height: 280px;
  background: rgba(255, 107, 0, 0.08);
}

.share-card__orb--2 {
  bottom: 25%;
  right: 15%;
  width: 180px;
  height: 180px;
  background: rgba(99, 102, 241, 0.05);
}
```

## 3C: Decorative Circles

Position in the empty top-right corner:

```css
.share-card__circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* Large outer circle */
.share-card__circle--1 {
  top: 50px;
  right: 20px;
  width: 180px;
  height: 180px;
  border: 2px solid rgba(255, 107, 0, 0.1);
}

/* Medium circle */
.share-card__circle--2 {
  top: 80px;
  right: 60px;
  width: 120px;
  height: 120px;
  border: 1px solid rgba(255, 107, 0, 0.06);
}

/* Small accent circle */
.share-card__circle--3 {
  top: 160px;
  right: 10px;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
```

## 3D: Sparkles

```tsx
const SPARKLES = [
  { char: '✦', top: '10%', right: '4%', size: 22, opacity: 0.5 },
  { char: '✧', top: '20%', right: '18%', size: 16, opacity: 0.35 },
  { char: '·', top: '32%', right: '8%', size: 14, opacity: 0.5 },
  { char: '✦', top: '48%', right: '3%', size: 18, opacity: 0.4 },
  { char: '✧', top: '62%', right: '14%', size: 14, opacity: 0.3 },
  { char: '·', top: '75%', right: '6%', size: 12, opacity: 0.4 },
];
```

```css
.share-card__sparkle {
  position: absolute;
  color: #FF6B00;
  pointer-events: none;
  z-index: 2;
}
```

## 3E: Game-Specific Icons

```tsx
const GAME_ICONS: Record<string, GameIcon[]> = {
  'flappy-orange': [
    { emoji: '🍊', top: '15%', right: '2%', size: 32, opacity: 0.2, rotate: 12 },
    { emoji: '🌳', top: '68%', right: '5%', size: 26, opacity: 0.15, rotate: -8 },
    { emoji: '☁️', top: '8%', right: '22%', size: 22, opacity: 0.12, rotate: 0 },
  ],
  'block-puzzle': [
    { emoji: '🟦', top: '12%', right: '3%', size: 30, opacity: 0.2, rotate: 8 },
    { emoji: '🟨', top: '55%', right: '4%', size: 26, opacity: 0.18, rotate: -12 },
    { emoji: '🟩', top: '35%', right: '16%', size: 22, opacity: 0.15, rotate: 15 },
  ],
};
```

## 3F: Score Glow Effect

```css
.share-card__score {
  position: relative;
}

.share-card__score::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 60px;
  transform: translateY(-50%);
  width: 280px;
  height: 180px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 107, 0, 0.12) 0%,
    rgba(255, 107, 0, 0.04) 50%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}
```

## Phase 3 Checklist
- [ ] Subtle dot pattern in background
- [ ] 2 blurred gradient orbs (orange, blue)
- [ ] 3 decorative circles in top-right
- [ ] 6 sparkles scattered (✦ ✧ ·)
- [ ] Game-specific icons (🍊 🌳 ☁️ for Flappy)
- [ ] Radial glow behind score number
- [ ] All decorations have low opacity (0.1-0.5)

---

# PHASE 4: Dynamic Content & Badge System

## Objective
Add intelligence to the card - dynamic messages and achievements.

## Badge Thresholds

| Score Range | Badge | Icon | Background Color | Glow Color |
|-------------|-------|------|------------------|------------|
| New Record | NEW RECORD! | 🏆 | #FFD700 | rgba(255, 215, 0, 0.4) |
| 100+ | LEGENDARY | 🔥 | #FF4500 | rgba(255, 69, 0, 0.4) |
| 50-99 | AMAZING | ⚡ | #9B59B6 | rgba(155, 89, 182, 0.4) |
| 25-49 | NICE RUN | 💪 | #3498DB | rgba(52, 152, 219, 0.4) |
| 10-24 | GOOD TRY | 👍 | #2ECC71 | rgba(46, 204, 113, 0.4) |
| 1-9 | KEEP GOING | 🎮 | #6B7280 | rgba(107, 114, 128, 0.3) |
| 0 | (no badge) | - | - | - |

## Badge Logic

```typescript
interface Badge {
  text: string;
  icon: string;
  bg: string;
  glow: string;
}

function getScoreBadge(score: number, bestScore: number): Badge | null {
  if (score > 0 && score === bestScore) {
    return { text: 'NEW RECORD!', icon: '🏆', bg: '#FFD700', glow: 'rgba(255,215,0,0.4)' };
  }
  if (score >= 100) {
    return { text: 'LEGENDARY', icon: '🔥', bg: '#FF4500', glow: 'rgba(255,69,0,0.4)' };
  }
  if (score >= 50) {
    return { text: 'AMAZING', icon: '⚡', bg: '#9B59B6', glow: 'rgba(155,89,182,0.4)' };
  }
  if (score >= 25) {
    return { text: 'NICE RUN', icon: '💪', bg: '#3498DB', glow: 'rgba(52,152,219,0.4)' };
  }
  if (score >= 10) {
    return { text: 'GOOD TRY', icon: '👍', bg: '#2ECC71', glow: 'rgba(46,204,113,0.4)' };
  }
  if (score >= 1) {
    return { text: 'KEEP GOING', icon: '🎮', bg: '#6B7280', glow: 'rgba(107,114,128,0.3)' };
  }
  return null;
}
```

## Dynamic CTA Messages

```typescript
function getCTA(score: number, bestScore: number): string {
  if (score === 0) {
    return "Think you can do better? 😏";
  }
  if (score === bestScore && score > 0) {
    return "Can you beat my NEW record? 🏆";
  }
  if (score >= 50) {
    return "Can you beat my score? 🔥";
  }
  if (score >= 25) {
    return "Can you beat my score? 💪";
  }
  return "Can you beat my score? 🎮";
}
```

## Phase 4 Checklist
- [ ] Badge appears next to Best score
- [ ] Badge color changes based on score
- [ ] Badge has subtle glow matching its color
- [ ] CTA message changes based on score
- [ ] No badge shown for score = 0
- [ ] "NEW RECORD!" badge when score = bestScore

---

# PHASE 5: Screenshot Capture (CRITICAL)

## The Problem

The current implementation crops the game screenshot. This is WRONG.

**The share card MUST show the EXACT same view the user had when playing.**

## Requirements

1. Capture the FULL game canvas element
2. Preserve the original aspect ratio
3. Never crop or distort
4. Use `object-fit: contain` to display

## Implementation

```typescript
async function captureGameScreenshot(): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  // Find the game element - try multiple selectors
  const gameElement =
    document.querySelector('[data-game-canvas]') ||
    document.querySelector('.game-canvas') ||
    document.querySelector('.game-container canvas') ||
    document.querySelector('.game-iframe');

  if (!gameElement) {
    throw new Error('Game element not found');
  }

  // Get the RENDERED dimensions (what the user actually sees)
  const rect = gameElement.getBoundingClientRect();

  // Capture using html2canvas at 2x scale for quality
  const canvas = await html2canvas(gameElement as HTMLElement, {
    width: rect.width,
    height: rect.height,
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: rect.width,
    height: rect.height,
  };
}
```

## Display in Share Card

```css
.share-card__screenshot {
  width: 420px;
  max-height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
}

.share-card__screenshot img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain; /* NEVER use 'cover' */
}
```

## Phase 5 Checklist
- [ ] Screenshot captures entire game canvas
- [ ] Original aspect ratio is preserved
- [ ] No cropping on any side
- [ ] Uses `object-fit: contain`
- [ ] 2x scale for retina quality
- [ ] Works for portrait, landscape, and square games

---

# Final Complete Component

```tsx
import React from 'react';

interface ShareCardProps {
  gameName: string;
  gameSlug: string;
  score: number;
  scoreLabel: string;
  bestScore: number;
  screenshotUrl: string;
}

// Constants
const SPARKLES = [
  { char: '✦', top: '10%', right: '4%', size: 22, opacity: 0.5 },
  { char: '✧', top: '20%', right: '18%', size: 16, opacity: 0.35 },
  { char: '·', top: '32%', right: '8%', size: 14, opacity: 0.5 },
  { char: '✦', top: '48%', right: '3%', size: 18, opacity: 0.4 },
  { char: '✧', top: '62%', right: '14%', size: 14, opacity: 0.3 },
  { char: '·', top: '75%', right: '6%', size: 12, opacity: 0.4 },
];

const GAME_ICONS: Record<string, Array<{emoji: string; top: string; right: string; size: number; opacity: number; rotate: number}>> = {
  'flappy-orange': [
    { emoji: '🍊', top: '15%', right: '2%', size: 32, opacity: 0.2, rotate: 12 },
    { emoji: '🌳', top: '68%', right: '5%', size: 26, opacity: 0.15, rotate: -8 },
    { emoji: '☁️', top: '8%', right: '22%', size: 22, opacity: 0.12, rotate: 0 },
  ],
  'block-puzzle': [
    { emoji: '🟦', top: '12%', right: '3%', size: 30, opacity: 0.2, rotate: 8 },
    { emoji: '🟨', top: '55%', right: '4%', size: 26, opacity: 0.18, rotate: -12 },
    { emoji: '🟩', top: '35%', right: '16%', size: 22, opacity: 0.15, rotate: 15 },
  ],
};

function getScoreBadge(score: number, bestScore: number) {
  if (score > 0 && score === bestScore) {
    return { text: 'NEW RECORD!', icon: '🏆', bg: '#FFD700', glow: 'rgba(255,215,0,0.4)' };
  }
  if (score >= 100) return { text: 'LEGENDARY', icon: '🔥', bg: '#FF4500', glow: 'rgba(255,69,0,0.4)' };
  if (score >= 50) return { text: 'AMAZING', icon: '⚡', bg: '#9B59B6', glow: 'rgba(155,89,182,0.4)' };
  if (score >= 25) return { text: 'NICE RUN', icon: '💪', bg: '#3498DB', glow: 'rgba(52,152,219,0.4)' };
  if (score >= 10) return { text: 'GOOD TRY', icon: '👍', bg: '#2ECC71', glow: 'rgba(46,204,113,0.4)' };
  if (score >= 1) return { text: 'KEEP GOING', icon: '🎮', bg: '#6B7280', glow: 'rgba(107,114,128,0.3)' };
  return null;
}

function getCTA(score: number, bestScore: number): string {
  if (score === 0) return "Think you can do better? 😏";
  if (score === bestScore && score > 0) return "Can you beat my NEW record? 🏆";
  if (score >= 50) return "Can you beat my score? 🔥";
  return "Can you beat my score? 💪";
}

export function ShareCard({
  gameName,
  gameSlug,
  score,
  scoreLabel,
  bestScore,
  screenshotUrl,
}: ShareCardProps) {
  const badge = getScoreBadge(score, bestScore);
  const cta = getCTA(score, bestScore);
  const gameIcons = GAME_ICONS[gameSlug] || [];
  const titleWords = gameName.toUpperCase().split(' ');

  return (
    <div className="share-card">
      {/* Background decorations */}
      <div className="share-card__orb share-card__orb--1" />
      <div className="share-card__orb share-card__orb--2" />

      <div className="share-card__circle share-card__circle--1" />
      <div className="share-card__circle share-card__circle--2" />
      <div className="share-card__circle share-card__circle--3" />

      {/* Sparkles */}
      {SPARKLES.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="share-card__sparkle"
          style={{
            top: s.top,
            right: s.right,
            fontSize: `${s.size}px`,
            opacity: s.opacity,
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Game icons */}
      {gameIcons.map((icon, i) => (
        <span
          key={`icon-${i}`}
          className="share-card__game-icon"
          style={{
            top: icon.top,
            right: icon.right,
            fontSize: `${icon.size}px`,
            opacity: icon.opacity,
            transform: `rotate(${icon.rotate}deg)`,
          }}
        >
          {icon.emoji}
        </span>
      ))}

      {/* Screenshot */}
      <div className="share-card__screenshot">
        <img src={screenshotUrl} alt={gameName} />
      </div>

      {/* Content */}
      <div className="share-card__content">
        {/* Game title */}
        <div className="share-card__title">
          {titleWords.map((word, i) => (
            <span key={i} className="share-card__title-word">{word}</span>
          ))}
        </div>

        <div className="share-card__divider share-card__divider--thin" />

        {/* Score */}
        <div className="share-card__score">
          <span className="share-card__score-number">{score}</span>
          <span className="share-card__score-label">{scoreLabel}</span>
        </div>

        <div className="share-card__divider share-card__divider--thick" />

        {/* Best + Badge */}
        <div className="share-card__meta">
          <span className="share-card__best">🍊 Best: {bestScore}</span>
          {badge && (
            <span
              className="share-card__badge"
              style={{
                '--badge-bg': badge.bg,
                '--badge-glow': badge.glow,
              } as React.CSSProperties}
            >
              {badge.icon} {badge.text}
            </span>
          )}
        </div>

        {/* CTA */}
        <p className="share-card__cta">{cta}</p>
      </div>

      {/* Branding */}
      <div className="share-card__branding">
        <span className="share-card__brand-left">🍊 WOJAK.INK</span>
        <span className="share-card__brand-right">🍊 Tang Grove Gaming 🍊</span>
      </div>
    </div>
  );
}
```

---

# Implementation Order

1. **Phase 1** - Get the layout right first (foundation)
2. **Phase 2** - Add typography and content hierarchy
3. **Phase 3** - Add visual polish and decorations
4. **Phase 4** - Implement dynamic badge/CTA system
5. **Phase 5** - Fix screenshot capture

**Do NOT try to implement all phases at once. Complete each phase and test before moving to the next.**

---

# Sources

- [Wordle's Viral Success is Based on Design](https://thehardcopy.co/wordles-viral-success-is-based-on-design/)
- [Brawl Stars UX/UI Analysis](https://medium.com/@matt.sullivan28/a-brief-look-brawl-stars-ux-ui-562f6225b7e3)
- [5 UX Design Tricks from Wordle](https://blog.tbhcreative.com/ux-design/)
- [Supercell Fankit](https://fankit.supercell.com/)
