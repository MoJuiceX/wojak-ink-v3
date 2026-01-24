# SPEC 27: Share Card Visual Improvements

## Current State

The share card is now horizontal (good!), but needs visual polish to look professional and shareable.

---

## Issues to Fix

### 1. Screenshot Has Ugly Pink Border/Rounded Corners

**Problem:** The game screenshot has a pink/mauve rounded rectangle border that looks cheap and doesn't match the game aesthetic.

**Fix:** Remove the colored border entirely. Options:
- No border at all (clean edge)
- Subtle dark border (1-2px, #000 or very dark gray)
- Subtle drop shadow instead of border

```css
/* REMOVE THIS */
border: 8px solid #c4a0a0;  /* NO pink borders */
border-radius: 16px;

/* USE THIS INSTEAD */
border: none;
border-radius: 8px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
```

### 2. Screenshot Aspect Ratio is Wrong

**Problem:** The screenshot appears squished/distorted. Flappy Orange is a portrait game but the screenshot area is forcing it into a weird shape.

**Fix:** Maintain the original aspect ratio of the game screenshot. Use `object-fit: contain` or `object-fit: cover` with proper cropping.

```css
.screenshot {
  width: 320px;
  height: 400px;  /* Maintain portrait ratio for Flappy */
  object-fit: cover;
  object-position: center;
}
```

### 3. Score "0" Looks Sad/Unimpressive

**Problem:** A score of 0 with "pipes passed" looks like failure. This is the death screen, so we need to reframe it.

**Fix Options:**
- If score is 0, show a funny message: "First pipe is the hardest! 😅"
- Show "Game Over" or "Try Again?" instead of emphasizing the 0
- Always show personal best prominently to give context
- Add attempt number: "Attempt #47"

### 4. "Can you beat my score?" Doesn't Make Sense for 0

**Problem:** Asking "Can you beat my score?" when score is 0 is awkward.

**Fix:** Dynamic messaging based on score:

```typescript
function getShareMessage(score: number, bestScore: number): string {
  if (score === 0) {
    return "Think you can do better? 😏";
  } else if (score === bestScore) {
    return "NEW PERSONAL BEST! Can you beat it? 🏆";
  } else if (score >= 50) {
    return "Can you beat my score? 🔥";
  } else if (score >= 20) {
    return "Can you beat my score? 💪";
  } else {
    return "Can you beat my score? 🎮";
  }
}
```

### 5. Trophy Emoji Looks Generic

**Problem:** The 🏆 emoji is fine but could be more on-brand.

**Fix:** Use Tang Gang orange styling or custom icon:

```css
.best-score {
  color: #FF6B00;  /* Tang Orange */
  font-weight: 700;
}
```

Or use the 🍊 emoji for brand consistency: "🍊 Best: 51"

### 6. Bottom Bar is Unbalanced

**Problem:** "WOJAK.INK" on left, "wojak.ink/games" on right - redundant and inconsistent.

**Fix:**

```
Left:  🍊 WOJAK.INK
Right: 🍊 Tang Grove Gaming 🍊
```

### 7. Overall Color Scheme is Dull

**Problem:** The dark blue background is okay but feels flat and corporate.

**Fix:** Add subtle gradient or texture:

```css
.share-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  /* Or add subtle noise texture */
}
```

Consider adding a subtle Tang Orange accent line or glow:

```css
.share-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FF6B00, #FF8C00, #FF6B00);
}
```

### 8. Typography Hierarchy Needs Work

**Problem:** "FLAPPY ORANGE" and the score compete for attention.

**Fix:** Clear hierarchy:

1. **Score** = BIGGEST (this is what people care about)
2. **Game name** = Medium, secondary
3. **Best score** = Smaller, supporting info
4. **CTA** = Smallest, subtle

```css
.game-name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
}

.score-number {
  font-size: 140px;  /* HUGE */
  font-weight: 900;
  color: #FF6B00;
  line-height: 0.9;
  text-shadow: 0 0 40px rgba(255, 107, 0, 0.3);
}

.score-label {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.best-score {
  font-size: 20px;
  color: #FF6B00;
  margin-top: 24px;
}

.cta {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin-top: 20px;
}
```

---

## Improved Layout Spec

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ │  ← Orange accent line (4px)
│                                                                          │
│    ┌─────────────────┐                                                   │
│    │                 │       FLAPPY ORANGE                               │
│    │                 │                                                   │
│    │    SCREENSHOT   │       1 4 7                    ← HUGE orange #    │
│    │    (portrait    │       pipes passed                                │
│    │     aspect      │                                                   │
│    │     ratio)      │       🍊 Best: 51                                 │
│    │                 │                                                   │
│    │                 │       Can you beat my score? 🎮                   │
│    │                 │                                                   │
│    └─────────────────┘                                                   │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  🍊 WOJAK.INK                              🍊 Tang Grove Gaming 🍊       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Complete CSS

```css
.share-card {
  width: 1200px;
  height: 630px;
  background: linear-gradient(145deg, #1e2140 0%, #151829 100%);
  position: relative;
  display: flex;
  padding: 48px;
  padding-top: 52px;  /* Account for accent line */
  gap: 48px;
  font-family: 'Inter', -apple-system, sans-serif;
  color: white;
  overflow: hidden;
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

/* Left: Screenshot */
.share-card__screenshot {
  width: 320px;
  height: 440px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.share-card__screenshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

/* Right: Content */
.share-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 24px;
}

.share-card__game-name {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 8px 0;
}

.share-card__score {
  margin: 16px 0;
}

.share-card__score-number {
  font-size: 160px;
  font-weight: 900;
  color: #FF6B00;
  line-height: 0.85;
  letter-spacing: -8px;
  text-shadow:
    0 0 60px rgba(255, 107, 0, 0.25),
    0 4px 12px rgba(0, 0, 0, 0.3);
}

.share-card__score-label {
  font-size: 24px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 4px;
}

.share-card__best {
  font-size: 22px;
  font-weight: 600;
  color: #FF6B00;
  margin-top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-card__cta {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.45);
  font-style: italic;
  margin-top: 20px;
}

/* Bottom: Branding bar */
.share-card__branding {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 48px;
}

.share-card__brand-left {
  font-size: 20px;
  font-weight: 700;
  color: #FF6B00;
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-card__brand-right {
  font-size: 18px;
  font-weight: 600;
  color: #FF6B00;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

---

## Component Structure

```tsx
interface ShareCardProps {
  gameName: string;
  score: number;
  scoreLabel: string;
  bestScore: number;
  screenshotUrl: string;
}

export function ShareCard({
  gameName,
  score,
  scoreLabel,
  bestScore,
  screenshotUrl
}: ShareCardProps) {

  // Dynamic CTA based on score
  const getCTA = () => {
    if (score === 0) return "Think you can do better? 😏";
    if (score === bestScore && score > 0) return "NEW BEST! Can you beat it? 🏆";
    if (score >= 50) return "Can you beat my score? 🔥";
    return "Can you beat my score? 🎮";
  };

  return (
    <div className="share-card">
      {/* Screenshot */}
      <div className="share-card__screenshot">
        <img src={screenshotUrl} alt={gameName} />
      </div>

      {/* Content */}
      <div className="share-card__content">
        <h1 className="share-card__game-name">{gameName}</h1>

        <div className="share-card__score">
          <div className="share-card__score-number">{score}</div>
          <div className="share-card__score-label">{scoreLabel}</div>
        </div>

        <div className="share-card__best">
          🍊 Best: {bestScore}
        </div>

        <p className="share-card__cta">{getCTA()}</p>
      </div>

      {/* Branding */}
      <div className="share-card__branding">
        <div className="share-card__brand-left">
          🍊 WOJAK.INK
        </div>
        <div className="share-card__brand-right">
          🍊 Tang Grove Gaming 🍊
        </div>
      </div>
    </div>
  );
}
```

---

## Checklist

- [ ] Remove pink border from screenshot
- [ ] Fix screenshot aspect ratio (portrait for Flappy)
- [ ] Add subtle drop shadow to screenshot instead of border
- [ ] Add orange accent line at top of card
- [ ] Make score number HUGE (160px) and orange with glow
- [ ] Use 🍊 emoji instead of 🏆 for brand consistency
- [ ] Add dynamic CTA based on score value
- [ ] Fix bottom bar consistency (WOJAK GAMES left, wojak.ink/games → right)
- [ ] Add subtle gradient to background
- [ ] Ensure proper typography hierarchy
- [ ] Test with score = 0, low scores, and high scores

---

## Final Dimensions

- **Card size:** 1200 × 630px
- **Screenshot area:** Dynamic based on game aspect ratio (see below)
- **Score font size:** 160px
- **Top accent line:** 4px height, orange gradient
- **Bottom bar:** 56px height
- **Padding:** 48px

---

## CRITICAL: Screenshot Must Capture ENTIRE Game Canvas

### Problem

The current screenshot is cropped/narrow - it cuts off the left and right sides of the game. This is wrong. The share card must show the **ENTIRE game canvas** that the user sees in the lightbox.

### Requirements

1. **Capture the FULL game canvas** - Every pixel the user sees should be in the screenshot
2. **Maintain original aspect ratio** - Don't crop or distort
3. **Different games have different aspect ratios** - Flappy Orange is portrait, Block Puzzle might be square, etc.

### Implementation

#### Step 1: Capture Full Canvas

When taking the screenshot, capture the entire game element:

```typescript
// Get the game canvas/iframe element
const gameElement = document.querySelector('.game-canvas')
  || document.querySelector('.game-iframe')
  || document.querySelector('[data-game-container]');

// Use html2canvas or similar to capture the FULL element
const screenshot = await html2canvas(gameElement, {
  // Capture at full resolution
  scale: 2,
  // Don't crop anything
  width: gameElement.scrollWidth,
  height: gameElement.scrollHeight,
  // Ensure we get everything
  windowWidth: gameElement.scrollWidth,
  windowHeight: gameElement.scrollHeight,
});
```

#### Step 2: Dynamic Screenshot Area in Share Card

The share card should adapt to the game's aspect ratio:

```typescript
interface GameScreenshotConfig {
  // The actual dimensions of the captured screenshot
  originalWidth: number;
  originalHeight: number;
}

function calculateScreenshotArea(config: GameScreenshotConfig) {
  const { originalWidth, originalHeight } = config;
  const aspectRatio = originalWidth / originalHeight;

  // Maximum area available for screenshot in share card
  const maxWidth = 400;
  const maxHeight = 480;

  let displayWidth: number;
  let displayHeight: number;

  if (aspectRatio > 1) {
    // Landscape game (wider than tall)
    displayWidth = maxWidth;
    displayHeight = maxWidth / aspectRatio;
  } else {
    // Portrait game (taller than wide) or square
    displayHeight = maxHeight;
    displayWidth = maxHeight * aspectRatio;
  }

  return { displayWidth, displayHeight };
}
```

#### Step 3: CSS for Dynamic Screenshot

```css
.share-card__screenshot {
  /* Remove fixed dimensions */
  max-width: 400px;
  max-height: 480px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);

  /* Center the screenshot if it doesn't fill the area */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.share-card__screenshot img {
  /* Fit entire image without cropping */
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;  /* NOT cover - we want to see EVERYTHING */
}
```

### Game Canvas Capture Examples

**Flappy Orange (Portrait ~9:16):**
```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │               │  │
│  │  FULL GAME    │  │
│  │  VISIBLE      │  │
│  │               │  │
│  │  Trees, pipes │  │
│  │  orange, sky  │  │
│  │  ALL OF IT    │  │
│  │               │  │
│  └───────────────┘  │
└─────────────────────┘
```

**Block Puzzle (Square 1:1):**
```
┌─────────────────────┐
│                     │
│  ┌───────────────┐  │
│  │  FULL GRID    │  │
│  │  VISIBLE      │  │
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Future Landscape Game (16:9):**
```
┌─────────────────────┐
│                     │
│                     │
│  ┌───────────────┐  │
│  │ FULL GAME     │  │
│  └───────────────┘  │
│                     │
│                     │
└─────────────────────┘
```

### Do NOT:

- ❌ Crop the sides of the game
- ❌ Use `object-fit: cover` (this crops)
- ❌ Force a fixed aspect ratio that doesn't match the game
- ❌ Take a screenshot of just a portion of the canvas

### DO:

- ✅ Capture the ENTIRE game canvas element
- ✅ Use `object-fit: contain` to show the full image
- ✅ Let the screenshot area adapt to the game's natural aspect ratio
- ✅ Show every pixel the user was seeing when they died
