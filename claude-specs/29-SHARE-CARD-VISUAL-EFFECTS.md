# SPEC 29: Share Card Visual Effects & Empty Space Design

## Current State

The share card layout is good, but:
- Too much empty space on the right side
- Feels flat and static
- Needs more visual interest and "wow factor"
- Should feel exciting and shareable

---

## Goal

Make the share card **visually exciting** so users WANT to share it. Fill the empty space with cool effects that enhance the arcade/gaming vibe without overwhelming the key information (score, game name).

---

## Visual Effects to Add

### 1. Animated-Style Background Elements

Add subtle decorative elements behind the score area:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│                                                    ✦  ·               ✧  │
│    ┌─────────────────┐       FLAPPY ORANGE    ·    ╲  ╱                  │
│    │                 │                          ✧   ──────    ✦          │
│    │   SCREENSHOT    │       2 4            ·      ╱  ╲                  │
│    │                 │       pipes passed              ·    ✧            │
│    │                 │                     ══════════════════            │
│    │                 │       🍊 Best: 51        NICE RUN!               │
│    │                 │                                    ·              │
│    │                 │       Can you beat my score? 💪   ✦       ✧      │
│    └─────────────────┘                                                   │
│                                                         ·                │
│  ──────────────────────────────────────────────────────────────────────  │
│  🍊 WOJAK.INK                              🍊 Tang Grove Gaming 🍊       │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2. Score Achievement Badge

Add a dynamic badge based on score performance:

```typescript
function getScoreBadge(score: number, bestScore: number): { text: string; color: string } | null {
  if (score === bestScore && score > 0) {
    return { text: "🏆 NEW RECORD!", color: "#FFD700" };  // Gold
  }
  if (score >= 100) {
    return { text: "🔥 LEGENDARY!", color: "#FF4500" };   // Red-orange
  }
  if (score >= 50) {
    return { text: "⚡ AMAZING!", color: "#9B59B6" };      // Purple
  }
  if (score >= 25) {
    return { text: "💪 NICE RUN!", color: "#3498DB" };    // Blue
  }
  if (score >= 10) {
    return { text: "👍 GOOD TRY!", color: "#2ECC71" };    // Green
  }
  if (score >= 1) {
    return { text: "🎮 KEEP GOING!", color: "#95A5A6" };  // Gray
  }
  return null;  // Score 0 - no badge
}
```

**CSS for badge:**

```css
.share-card__badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 16px;
  background: linear-gradient(135deg, var(--badge-color) 0%, var(--badge-color-dark) 100%);
  box-shadow:
    0 4px 15px rgba(var(--badge-color-rgb), 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
```

### 3. Decorative Sparkles/Stars

Scatter small decorative elements in the empty space:

```css
/* Sparkle elements positioned in the background */
.share-card__sparkle {
  position: absolute;
  font-size: 14px;
  opacity: 0.4;
  color: #FF6B00;
}

.share-card__sparkle--1 { top: 15%; right: 10%; font-size: 20px; opacity: 0.6; }
.share-card__sparkle--2 { top: 25%; right: 25%; font-size: 12px; }
.share-card__sparkle--3 { top: 40%; right: 8%; font-size: 16px; opacity: 0.5; }
.share-card__sparkle--4 { top: 55%; right: 20%; font-size: 10px; }
.share-card__sparkle--5 { top: 70%; right: 12%; font-size: 14px; opacity: 0.3; }
.share-card__sparkle--6 { top: 35%; right: 5%; font-size: 8px; }
```

**Using CSS pseudo-elements or actual elements:**

```tsx
// Sparkle positions (as percentages from right/top)
const sparkles = [
  { char: "✦", top: "15%", right: "8%", size: 20, opacity: 0.5 },
  { char: "·", top: "25%", right: "22%", size: 16, opacity: 0.4 },
  { char: "✧", top: "18%", right: "35%", size: 14, opacity: 0.3 },
  { char: "·", top: "45%", right: "5%", size: 12, opacity: 0.4 },
  { char: "✦", top: "60%", right: "15%", size: 18, opacity: 0.35 },
  { char: "✧", top: "70%", right: "28%", size: 10, opacity: 0.25 },
  { char: "·", top: "38%", right: "12%", size: 14, opacity: 0.45 },
  { char: "✦", top: "52%", right: "32%", size: 12, opacity: 0.3 },
];
```

### 4. Radial Glow Behind Score

Add a glowing effect behind the big score number:

```css
.share-card__score-container {
  position: relative;
}

.share-card__score-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 107, 0, 0.15) 0%,
    rgba(255, 107, 0, 0.05) 40%,
    transparent 70%
  );
  z-index: -1;
  pointer-events: none;
}
```

### 5. Decorative Line/Divider

Add a stylized divider line with orange gradient:

```css
.share-card__divider {
  width: 200px;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #FF6B00 20%,
    #FF8C00 50%,
    #FF6B00 80%,
    transparent 100%
  );
  margin: 20px 0;
  border-radius: 2px;
}
```

### 6. Game-Specific Decorative Icons

For Flappy Orange, scatter small orange/pipe icons. Make this game-specific:

```typescript
interface GameDecorations {
  icons: string[];  // Emoji or SVG paths
  colors: string[];
}

const gameDecorations: Record<string, GameDecorations> = {
  'flappy-orange': {
    icons: ['🍊', '🌳', '☁️'],
    colors: ['#FF6B00', '#4A7C23', '#FFFFFF'],
  },
  'block-puzzle': {
    icons: ['🟦', '🟨', '🟩', '🟥'],
    colors: ['#3498DB', '#F1C40F', '#2ECC71', '#E74C3C'],
  },
  // Add more games...
};
```

**Render small game icons in the background:**

```tsx
function GameDecoIcons({ gameSlug }: { gameSlug: string }) {
  const deco = gameDecorations[gameSlug];
  if (!deco) return null;

  const positions = [
    { top: '20%', right: '6%', size: 24, rotate: 15 },
    { top: '50%', right: '3%', size: 20, rotate: -10 },
    { top: '75%', right: '8%', size: 18, rotate: 25 },
  ];

  return (
    <>
      {positions.map((pos, i) => (
        <span
          key={i}
          className="share-card__deco-icon"
          style={{
            top: pos.top,
            right: pos.right,
            fontSize: pos.size,
            transform: `rotate(${pos.rotate}deg)`,
            opacity: 0.25,
          }}
        >
          {deco.icons[i % deco.icons.length]}
        </span>
      ))}
    </>
  );
}
```

### 7. Subtle Background Pattern

Add a very subtle pattern or noise texture:

```css
.share-card {
  background:
    /* Subtle dot pattern */
    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 1px),
    /* Main gradient */
    linear-gradient(145deg, #1e2140 0%, #151829 100%);
  background-size: 24px 24px, 100% 100%;
}
```

Or a diagonal line pattern:

```css
.share-card {
  background:
    /* Diagonal lines */
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 30px,
      rgba(255, 107, 0, 0.02) 30px,
      rgba(255, 107, 0, 0.02) 32px
    ),
    /* Main gradient */
    linear-gradient(145deg, #1e2140 0%, #151829 100%);
}
```

### 8. Corner Decorations

Add subtle corner flourishes:

```css
.share-card::after {
  content: '';
  position: absolute;
  top: 60px;
  right: 40px;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 107, 0, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

/* Second circle, offset */
.share-card__corner-deco {
  position: absolute;
  top: 80px;
  right: 60px;
  width: 120px;
  height: 120px;
  border: 1px solid rgba(255, 107, 0, 0.05);
  border-radius: 50%;
  pointer-events: none;
}
```

---

## Complete Updated Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │
│                                                         ╭───╮    ✦      │
│    ┌─────────────────┐                                ╭─╯   ╰─╮    🍊   │
│    │                 │       FLAPPY ORANGE          ╭─╯       ╰─╮       │
│    │                 │                              ╰───────────╯   ✧   │
│    │   SCREENSHOT    │       ░░░░░░░░░░░░░                              │
│    │   (full game    │       ░░  2 4  ░░░░    ← Glowing score           │
│    │    canvas)      │       ░░░░░░░░░░░░░                        🌳    │
│    │                 │       pipes passed                               │
│    │                 │       ━━━━━━━━━━━━━━     ← Orange gradient line  │
│    │                 │                                             ✦    │
│    │                 │       🍊 Best: 51                                │
│    │                 │                                                  │
│    │                 │       ╭─────────────────╮                   ☁️   │
│    │                 │       │  💪 NICE RUN!  │  ← Achievement badge   │
│    │                 │       ╰─────────────────╯                        │
│    └─────────────────┘                                            ✧     │
│                              Can you beat my score? 💪                  │
│  ──────────────────────────────────────────────────────────────────────  │
│  🍊 WOJAK.INK                              🍊 Tang Grove Gaming 🍊       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Component Code

```tsx
interface ShareCardProps {
  gameName: string;
  gameSlug: string;
  score: number;
  scoreLabel: string;
  bestScore: number;
  screenshotUrl: string;
}

// Achievement badge logic
function getScoreBadge(score: number, bestScore: number) {
  if (score === bestScore && score > 0) {
    return { text: "🏆 NEW RECORD!", color: "#FFD700", colorDark: "#B8860B" };
  }
  if (score >= 100) {
    return { text: "🔥 LEGENDARY!", color: "#FF4500", colorDark: "#CC3700" };
  }
  if (score >= 50) {
    return { text: "⚡ AMAZING!", color: "#9B59B6", colorDark: "#7D3C98" };
  }
  if (score >= 25) {
    return { text: "💪 NICE RUN!", color: "#3498DB", colorDark: "#2980B9" };
  }
  if (score >= 10) {
    return { text: "👍 GOOD TRY!", color: "#2ECC71", colorDark: "#27AE60" };
  }
  if (score >= 1) {
    return { text: "🎮 KEEP GOING!", color: "#95A5A6", colorDark: "#7F8C8D" };
  }
  return null;
}

// Dynamic CTA
function getCTA(score: number, bestScore: number): string {
  if (score === 0) return "Think you can do better? 😏";
  if (score === bestScore && score > 0) return "NEW BEST! Can you beat it? 🏆";
  if (score >= 50) return "Can you beat my score? 🔥";
  if (score >= 25) return "Can you beat my score? 💪";
  return "Can you beat my score? 🎮";
}

// Sparkle positions
const sparkles = [
  { char: "✦", top: "12%", right: "8%", size: 18, opacity: 0.4 },
  { char: "✧", top: "22%", right: "25%", size: 14, opacity: 0.3 },
  { char: "·", top: "35%", right: "5%", size: 12, opacity: 0.5 },
  { char: "✦", top: "50%", right: "18%", size: 16, opacity: 0.35 },
  { char: "✧", top: "65%", right: "10%", size: 12, opacity: 0.25 },
  { char: "·", top: "75%", right: "22%", size: 10, opacity: 0.4 },
];

// Game-specific decorations
const gameIcons: Record<string, string[]> = {
  'flappy-orange': ['🍊', '🌳', '☁️'],
  'block-puzzle': ['🟦', '🟨', '🟩'],
  'default': ['🎮', '⭐', '🏆'],
};

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
  const icons = gameIcons[gameSlug] || gameIcons['default'];

  return (
    <div className="share-card">
      {/* Decorative sparkles */}
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="share-card__sparkle"
          style={{
            top: s.top,
            right: s.right,
            fontSize: s.size,
            opacity: s.opacity,
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Game-specific icons */}
      {icons.map((icon, i) => (
        <span
          key={`icon-${i}`}
          className="share-card__game-icon"
          style={{
            top: `${20 + i * 25}%`,
            right: `${4 + (i % 2) * 8}%`,
            fontSize: 20 - i * 2,
            opacity: 0.2,
            transform: `rotate(${(i - 1) * 15}deg)`,
          }}
        >
          {icon}
        </span>
      ))}

      {/* Corner decoration circles */}
      <div className="share-card__corner-circle share-card__corner-circle--1" />
      <div className="share-card__corner-circle share-card__corner-circle--2" />

      {/* Screenshot */}
      <div className="share-card__screenshot">
        <img src={screenshotUrl} alt={gameName} />
      </div>

      {/* Content */}
      <div className="share-card__content">
        <h1 className="share-card__game-name">{gameName}</h1>

        <div className="share-card__score-container">
          <div className="share-card__score-glow" />
          <div className="share-card__score-number">{score}</div>
          <div className="share-card__score-label">{scoreLabel}</div>
        </div>

        <div className="share-card__divider" />

        <div className="share-card__best">🍊 Best: {bestScore}</div>

        {badge && (
          <div
            className="share-card__badge"
            style={{
              '--badge-color': badge.color,
              '--badge-color-dark': badge.colorDark,
            } as React.CSSProperties}
          >
            {badge.text}
          </div>
        )}

        <p className="share-card__cta">{cta}</p>
      </div>

      {/* Branding */}
      <div className="share-card__branding">
        <div className="share-card__brand-left">🍊 WOJAK.INK</div>
        <div className="share-card__brand-right">🍊 Tang Grove Gaming 🍊</div>
      </div>
    </div>
  );
}
```

---

## Complete CSS

```css
.share-card {
  width: 1200px;
  height: 630px;
  position: relative;
  display: flex;
  padding: 48px;
  padding-top: 52px;
  padding-bottom: 80px;  /* Space for branding bar */
  gap: 48px;
  font-family: 'Inter', -apple-system, sans-serif;
  color: white;
  overflow: hidden;

  /* Background with subtle pattern */
  background:
    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(145deg, #1e2140 0%, #151829 100%);
  background-size: 20px 20px, 100% 100%;
}

/* Orange accent line at top */
.share-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B00 0%, #FF8C00 50%, #FF6B00 100%);
}

/* Sparkles */
.share-card__sparkle {
  position: absolute;
  color: #FF6B00;
  pointer-events: none;
  user-select: none;
}

/* Game-specific icons */
.share-card__game-icon {
  position: absolute;
  pointer-events: none;
  user-select: none;
}

/* Corner decoration circles */
.share-card__corner-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.share-card__corner-circle--1 {
  top: 60px;
  right: 40px;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255, 107, 0, 0.08);
}

.share-card__corner-circle--2 {
  top: 90px;
  right: 70px;
  width: 160px;
  height: 160px;
  border: 1px solid rgba(255, 107, 0, 0.04);
}

/* Screenshot */
.share-card__screenshot {
  max-width: 400px;
  max-height: 480px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.share-card__screenshot img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Content area */
.share-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 24px;
  position: relative;
  z-index: 1;
}

.share-card__game-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 12px 0;
}

/* Score with glow */
.share-card__score-container {
  position: relative;
  margin: 8px 0;
}

.share-card__score-glow {
  position: absolute;
  top: 50%;
  left: 100px;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 180px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 107, 0, 0.12) 0%,
    rgba(255, 107, 0, 0.04) 50%,
    transparent 70%
  );
  pointer-events: none;
}

.share-card__score-number {
  font-size: 160px;
  font-weight: 900;
  color: #FF6B00;
  line-height: 0.85;
  letter-spacing: -6px;
  text-shadow:
    0 0 60px rgba(255, 107, 0, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

.share-card__score-label {
  font-size: 24px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

/* Divider line */
.share-card__divider {
  width: 180px;
  height: 3px;
  background: linear-gradient(
    90deg,
    #FF6B00 0%,
    #FF8C00 50%,
    rgba(255, 140, 0, 0.3) 100%
  );
  margin: 20px 0;
  border-radius: 2px;
}

.share-card__best {
  font-size: 22px;
  font-weight: 600;
  color: #FF6B00;
}

/* Achievement badge */
.share-card__badge {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 20px;
  background: linear-gradient(
    135deg,
    var(--badge-color) 0%,
    var(--badge-color-dark) 100%
  );
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.share-card__cta {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
  margin-top: 20px;
}

/* Branding bar */
.share-card__branding {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 48px;
}

.share-card__brand-left {
  font-size: 20px;
  font-weight: 700;
  color: #FF6B00;
}

.share-card__brand-right {
  font-size: 18px;
  font-weight: 600;
  color: #FF6B00;
}
```

---

## Checklist

- [ ] Add sparkle decorations (✦ ✧ ·) scattered in empty space
- [ ] Add radial glow behind score number
- [ ] Add orange gradient divider line under score
- [ ] Add achievement badge based on score (NICE RUN!, AMAZING!, etc.)
- [ ] Add corner decoration circles
- [ ] Add game-specific emoji icons (🍊 🌳 ☁️ for Flappy Orange)
- [ ] Add subtle dot pattern to background
- [ ] Keep orange accent line at top
- [ ] Ensure all decorations have low opacity (0.2-0.4) so they don't distract
- [ ] Test with different scores to see badge variations
- [ ] Make decorations game-configurable for other games

---

## Score Badge Thresholds

| Score | Badge | Color |
|-------|-------|-------|
| 0 | None | - |
| 1-9 | 🎮 KEEP GOING! | Gray |
| 10-24 | 👍 GOOD TRY! | Green |
| 25-49 | 💪 NICE RUN! | Blue |
| 50-99 | ⚡ AMAZING! | Purple |
| 100+ | 🔥 LEGENDARY! | Red-orange |
| New Best | 🏆 NEW RECORD! | Gold |
