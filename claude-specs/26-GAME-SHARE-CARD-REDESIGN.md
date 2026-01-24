# SPEC 26: Game Share Card Redesign

## Current Problem

The current share card is **tall/portrait** oriented, which:
- Looks awkward when shared on most social platforms
- Wastes space with vertical stacking
- Doesn't match how game moments are typically shared (Wordle, Spotify Wrapped, etc.)

## Industry Standards

### Optimal Dimensions

**Universal Share Card: 1200 × 630px (1.91:1 ratio)**

This works best across all platforms:
- **Facebook/LinkedIn**: Native Open Graph size
- **Twitter/X**: Displays perfectly in feed
- **Discord**: Shows as rich embed
- **iMessage/WhatsApp**: Clean preview

Alternative sizes for specific use cases:
- **Square (Instagram)**: 1080 × 1080px
- **Twitter Card**: 800 × 418px (compact)

### What Makes Share Cards Viral

Looking at successful examples:

**Wordle** - Simple grid of colored squares, no spoilers, puzzle number + score
**Spotify Wrapped** - Bold colors, big numbers, personality/stats
**NYT Year in Games** - Personalized data, shareable graphics, community comparison

Key patterns:
1. **Spoiler-free** - Show achievement without ruining the experience for others
2. **Visual representation** - Colored blocks, progress bars, not just text
3. **Big, bold numbers** - Score/achievement is the hero
4. **Brand identity** - Immediately recognizable
5. **Call to action** - "Can you beat my score?" / "Play now"

---

## Proposed Redesign

### Layout: Horizontal (1200 × 630px)

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  ┌──────────────────────┐    FLAPPY ORANGE                            │
│  │                      │                                              │
│  │    GAME SCREENSHOT   │    🍊 12        ← Big score number           │
│  │    (cropped square   │    pipes passed                              │
│  │     or 4:3)          │                                              │
│  │                      │    ──────────────                            │
│  │                      │    🏆 Best: 47   👤 @username                │
│  └──────────────────────┘                                              │
│                              Can you beat my score?                    │
│                                                                        │
│  ───────────────────────────────────────────────────────────────────── │
│  🍊 WOJAK.INK                                    [Tang Gang Logo]      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Color Scheme

Use the wojak.ink brand colors:
- **Background**: Dark (#1a1a2e or your site's dark bg)
- **Accent**: Tang Orange (#FF6B00)
- **Text**: White/Light gray
- **Secondary**: Muted orange for less important text

### Information Hierarchy

**Primary (Biggest)**
1. Score number - HUGE, bold, orange
2. Game name - Clear, prominent

**Secondary**
3. Screenshot/game moment - Visual proof
4. Personal best - Shows context
5. Username - Social identity

**Tertiary (Smallest)**
6. Branding - wojak.ink logo
7. Call to action - "Can you beat my score?"

---

## Implementation

### Component Structure

```tsx
// components/ShareCard.tsx
interface ShareCardProps {
  gameName: string;
  score: number;
  scoreLabel: string;        // "pipes passed", "lines cleared", "points"
  bestScore: number;
  username: string;
  screenshotUrl: string;     // Captured game moment
  gameSlug: string;          // For the play link
}

export function ShareCard({
  gameName,
  score,
  scoreLabel,
  bestScore,
  username,
  screenshotUrl,
  gameSlug
}: ShareCardProps) {
  return (
    <div className="share-card">
      {/* Left: Game Screenshot */}
      <div className="share-card__screenshot">
        <img src={screenshotUrl} alt={gameName} />
      </div>

      {/* Right: Stats */}
      <div className="share-card__stats">
        <h2 className="share-card__game-name">{gameName}</h2>

        <div className="share-card__score">
          <span className="share-card__score-number">{score}</span>
          <span className="share-card__score-label">{scoreLabel}</span>
        </div>

        <div className="share-card__meta">
          <span>🏆 Best: {bestScore}</span>
          <span>👤 @{username}</span>
        </div>

        <p className="share-card__cta">Can you beat my score? 🎮</p>
      </div>

      {/* Bottom: Branding */}
      <div className="share-card__branding">
        <span>🍊 WOJAK.INK</span>
        <img src="/img/tang-gang-logo.png" alt="Tang Gang" />
      </div>
    </div>
  );
}
```

### CSS

```css
.share-card {
  width: 1200px;
  height: 630px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: grid;
  grid-template-columns: 400px 1fr;
  grid-template-rows: 1fr 60px;
  padding: 40px;
  gap: 40px;
  font-family: 'Inter', sans-serif;
  color: white;
}

.share-card__screenshot {
  grid-row: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.share-card__screenshot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-card__stats {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}

.share-card__game-name {
  font-size: 36px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
}

.share-card__score {
  display: flex;
  flex-direction: column;
}

.share-card__score-number {
  font-size: 120px;
  font-weight: 900;
  color: #FF6B00;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(255, 107, 0, 0.4);
}

.share-card__score-label {
  font-size: 24px;
  color: rgba(255,255,255,0.7);
  margin-top: 8px;
}

.share-card__meta {
  display: flex;
  gap: 24px;
  font-size: 20px;
  color: rgba(255,255,255,0.8);
}

.share-card__cta {
  font-size: 18px;
  color: rgba(255,255,255,0.6);
  font-style: italic;
}

.share-card__branding {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 20px;
  font-size: 24px;
  font-weight: 700;
  color: #FF6B00;
}

.share-card__branding img {
  height: 40px;
}
```

---

## Generating the Image

### Option A: Server-Side with Puppeteer/Playwright

```typescript
// functions/api/share/generate.ts
import puppeteer from 'puppeteer';

export async function generateShareCard(data: ShareCardData): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(`${BASE_URL}/share-card?data=${encodeURIComponent(JSON.stringify(data))}`);

  const screenshot = await page.screenshot({ type: 'png' });
  await browser.close();

  return screenshot;
}
```

### Option B: Canvas API (Client-Side)

```typescript
// utils/generateShareCard.ts
export async function generateShareCard(
  canvas: HTMLCanvasElement,
  data: ShareCardData
): Promise<Blob> {
  const ctx = canvas.getContext('2d')!;
  canvas.width = 1200;
  canvas.height = 630;

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Draw screenshot
  const screenshot = await loadImage(data.screenshotUrl);
  ctx.drawImage(screenshot, 40, 40, 360, 440);

  // Draw score
  ctx.font = '900 120px Inter';
  ctx.fillStyle = '#FF6B00';
  ctx.fillText(data.score.toString(), 440, 320);

  // ... etc

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob!), 'image/png');
  });
}
```

### Option C: @vercel/og or Satori (Recommended)

Use Vercel's OG image generation for serverless:

```typescript
// functions/api/og/[game].tsx
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get('score');
  const game = searchParams.get('game');

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: 40,
      }}>
        {/* ... JSX layout ... */}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## Additional Features to Consider

### 1. Visual Score Representation (Wordle-style)

Instead of just a number, show the journey:

```
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩  ← 12 pipes = 12 green squares
```

Or for deaths, show where they got stuck:
```
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩💥
```

### 2. Rank/Percentile

"You scored better than 73% of players!"

### 3. Daily Challenge Number

"Flappy Orange #47" (like Wordle's puzzle numbers)

### 4. Streak Counter

"🔥 5 day streak"

### 5. NFT Badge Display

Show equipped title/frame on share card if user has premium items

---

## Files to Create/Modify

1. **NEW**: `/src/components/ShareCard.tsx` - The share card component
2. **NEW**: `/src/utils/generateShareCard.ts` - Canvas generation logic
3. **NEW**: `/functions/api/og/[game].tsx` - Server-side OG image generation
4. **MODIFY**: Game components to capture screenshot at death
5. **MODIFY**: Share modal to use new horizontal card

---

## Acceptance Criteria

- [ ] Share card is 1200×630px (horizontal)
- [ ] Game screenshot appears on the left (cropped nicely)
- [ ] Score is BIG and orange, immediately visible
- [ ] Username and best score shown
- [ ] wojak.ink branding at bottom
- [ ] "Can you beat my score?" call to action
- [ ] Image downloads/shares correctly to Twitter, Discord, etc.
- [ ] Works for all games (Flappy Orange, Block Puzzle, etc.)

---

## Sources

- [Hootsuite Social Media Image Sizes Guide](https://blog.hootsuite.com/social-media-image-sizes-guide/)
- [How to Share Your Wordle Score](https://www.howtogeek.com/108120/how-to-share-your-wordle-score-without-spoilers/)
- [NYT Games Year in Games (Spotify Wrapped style)](https://parade.com/news/nyt-games-year-in-games-2025-spotify-wrapped-wordle)
