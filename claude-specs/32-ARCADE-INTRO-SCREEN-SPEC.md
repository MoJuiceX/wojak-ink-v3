# Arcade Intro Screen Specification

> Visual specification for consistent intro screens across all games.
> Based on FlappyOrange's polished implementation.

## Overview

The arcade intro screen appears when a game is selected on desktop. It shows inside the arcade cabinet frame, presenting the game before the user clicks Play.

---

## Layer Structure (Bottom to Top)

```
1. Background Image Layer (.arcade-intro-bg)
2. Vignette/Gradient Overlay (.arcade-intro-overlay)
3. Leaderboard Panel (slides from left) (.arcade-leaderboard-panel)
4. Centered Content Card (.arcade-intro-card)
   - Game Title
   - Game Mascot/Emoji
   - Buttons Stack (Play + Leaderboard)
5. Instructions Overlay (when toggled)
```

---

## 1. Background Layer

**Class:** `.arcade-intro-bg`

| Property | Value |
|----------|-------|
| Position | `absolute`, `inset: 0` |
| Background Size | `cover` |
| Background Position | `center` |
| z-index | `0` |
| Default Image | `/assets/wojak-layers/BACKGROUND/Scene/BACKGROUND_Orange Grove.png` |

**Per-game backgrounds:** Set via `game.introBackground` prop

---

## 2. Vignette/Gradient Overlay

**Class:** `.arcade-intro-overlay`

Creates depth and readability with layered gradients:

```css
background:
  /* Radial vignette - darker at edges */
  radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.7) 100%
  ),
  /* Vertical gradient - darker top/bottom */
  linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.4) 100%
  );
```

| Property | Value |
|----------|-------|
| Position | `absolute`, `inset: 0` |
| z-index | `1` |
| pointer-events | `none` |

---

## 3. Leaderboard Panel (Left Slide-in)

**Class:** `.arcade-leaderboard-panel`

| Property | Value |
|----------|-------|
| Position | `absolute`, `top: 0`, `left: 0`, `bottom: 0` |
| Width | `340px` |
| z-index | `35` |
| Background | `linear-gradient(135deg, rgba(25, 25, 35, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%)` |
| Border Right | `1px solid rgba(255, 255, 255, 0.15)` |
| Backdrop Filter | `blur(20px)` |
| Hidden State | `transform: translateX(-100%)` |
| Visible State | `transform: translateX(0)` |
| Transition | `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |
| Padding | `20px` |

### Leaderboard Entry Row

**Class:** `.arcade-leaderboard-entry`

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center` |
| Padding | `0 12px` |
| Background | `rgba(255, 255, 255, 0.05)` |
| Border Radius | `8px` |
| Font Size | `0.95rem` |
| Hover | `background: rgba(255, 255, 255, 0.08)` |

### Entry Components

| Element | Styles |
|---------|--------|
| **Rank** | Width: 32px, Color: `rgba(255, 255, 255, 0.5)`, Font-weight: 700, Size: 0.85rem |
| **#1 Rank** | Color: `#FFD700` (gold) |
| **#2 Rank** | Color: `#C0C0C0` (silver) |
| **#3 Rank** | Color: `#CD7F32` (bronze) |
| **Avatar** | 28x28px, `border-radius: 50%`, DiceBear pixel-art |
| **Name** | Color: `#fff`, Font-weight: 500, Truncate with ellipsis |
| **Score** | Color: `#ffd700`, Font-weight: 700, Min-width: 50px, Text-align: right |

---

## 4. Content Card (Centered)

**Class:** `.arcade-intro-card`

| Property | Value |
|----------|-------|
| Position | `relative` |
| z-index | `10` |
| Display | `flex`, `flex-direction: column`, `align-items: center`, `justify-content: center` |
| Text Align | `center` |
| Gap | `32px` |
| Padding | `60px 20px 20px` |
| Pointer Events | `auto` |
| Width/Height | `100%` |
| Pushed State | `margin-left: 340px` (when leaderboard visible) |
| Transition | `margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)` |

### 4a. Game Title

**Class:** `.arcade-game-title`

| Property | Value |
|----------|-------|
| Font Size | `clamp(2rem, 7vw, 3.2rem)` |
| Font Weight | `900` |
| Text Transform | `uppercase` |
| Letter Spacing | `5px` |
| Color | `white` |
| Stroke | `-webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.4)` |
| Paint Order | `stroke fill` |
| Text Shadow | `2px 2px 0 rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2), 6px 6px 8px rgba(0,0,0,0.4)` |
| Hover Transform | `scale(1.02)` |
| Hover Shadow | `3px 3px 0 rgba(0,0,0,0.3), 6px 6px 0 rgba(0,0,0,0.2), 8px 8px 12px rgba(0,0,0,0.5)` |
| Transition | `transform 0.3s ease, text-shadow 0.3s ease` |

### 4b. Game Mascot/Emoji

**Class:** `.arcade-game-mascot`

| Property | Value |
|----------|-------|
| Font Size | `clamp(80px, 20vw, 120px)` |
| Line Height | `1` |
| Drop Shadow | `0 6px 16px rgba(0, 0, 0, 0.5)` |
| Margin Top | `24px` |
| Animation | `arcade-mascot-bounce 2s ease-in-out infinite` |

**Bounce Animation:**
```css
@keyframes arcade-mascot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

### 4c. Buttons Stack

**Class:** `.arcade-buttons-stack`

| Property | Value |
|----------|-------|
| Display | `flex`, `flex-direction: column`, `align-items: center` |
| Gap | `10px` |
| Width | `100%` |
| Max Width | `280px` |
| Margin Top | `32px` |

### 4d. Play Button

**Class:** `.arcade-play-btn`

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Gap | `8px` |
| Width | `100%` |
| Padding | `14px 24px` |
| Font Size | `1.1rem` |
| Font Weight | `800` |
| Text Transform | `uppercase` |
| Letter Spacing | `2px` |
| Border | `none` |
| Border Radius | `10px` |
| Color | `white` |
| Background | `linear-gradient(180deg, #60a5fa 0%, #1e40af 100%)` |
| Box Shadow | `0 6px 24px rgba(30, 64, 175, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)` |
| Text Shadow | `0 2px 4px rgba(0, 0, 0, 0.4)` |
| Transition | `all 0.2s ease` |
| Hover | `filter: brightness(1.15)` |
| Active | `filter: brightness(0.95)` |

**Play Icon:** `font-size: 0.9em`, `margin-right: 2px`, Content: `▶`

### 4e. Leaderboard Button

**Class:** `.arcade-leaderboard-btn`

| Property | Value |
|----------|-------|
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Gap | `8px` |
| Width | `100%` |
| Padding | `12px 20px` |
| Font Size | `0.95rem` |
| Font Weight | `600` |
| Letter Spacing | `1px` |
| Color | `rgba(255, 255, 255, 0.9)` |
| Background | `rgba(0, 0, 0, 0.3)` |
| Border | `1px solid rgba(255, 255, 255, 0.2)` |
| Border Radius | `10px` |
| Transition | `all 0.2s ease` |
| Hover | `background: rgba(255, 255, 255, 0.15)`, `border-color: rgba(255, 255, 255, 0.3)` |
| Active State | `background: rgba(255, 255, 255, 0.15)`, `border-color: rgba(255, 255, 255, 0.3)` |

**Trophy Icon:** Content: `🏆`, `font-size: 1em`

---

## 5. Instructions Overlay

Triggered by question mark button on arcade frame.

| Property | Value |
|----------|-------|
| Position | `absolute`, `inset: 0` |
| z-index | `50` |
| Display | `flex`, `align-items: center`, `justify-content: center` |
| Background | `rgba(0, 0, 0, 0.85)` |
| Animation In | `opacity: 0 → 1` |
| Animation Out | `opacity: 1 → 0` |

### Instructions Panel

| Property | Value |
|----------|-------|
| Width | `fit-content` |
| Max Height | `80%` |
| Overflow | `auto` |
| Padding | `24px` (6 * 4px) |
| Border Radius | `12px` (xl) |
| Background | `var(--color-bg-primary)` |
| Border | `1px solid {accentColor}40` |
| Animation | `scale: 0.9 → 1`, `opacity: 0 → 1` |

### Instructions Header
- Font size: `1.125rem` (lg)
- Font weight: `bold`
- Color: `{game.accentColor}`
- Margin bottom: `16px`
- Text: "How to Play"

### Instruction Steps
- Display: ordered list
- Gap between items: `12px`
- Font size: `0.875rem` (sm)
- Color: `var(--color-text-secondary)`

### Step Number Badge
- Size: `20x20px` (w-5 h-5)
- Border radius: `50%`
- Background: `{accentColor}30`
- Color: `{accentColor}`
- Font size: `0.75rem` (xs)
- Font weight: `bold`

---

## 6. Arcade Frame Buttons (Outside Screen)

Positioned on the arcade cabinet frame itself, not inside the game screen.

**Class:** `.arcade-frame-btn`

| Property | Value |
|----------|-------|
| Position | `absolute` |
| Left | `18.4%` |
| Transform | `translateX(-50%)` |
| Size | `44x44px` |
| Border Radius | `50%` |
| Border | `2px solid rgba(255, 255, 255, 0.3)` |
| Background | `rgba(0, 0, 0, 0.7)` |
| Color | `rgba(255, 255, 255, 0.9)` |
| z-index | `20` |
| Box Shadow | `0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)` |
| Transition | `all 0.2s ease` |

**Hover State:**
- Background: `rgba(60, 60, 60, 0.9)`
- Color: `white`
- Transform: `translateX(-50%) scale(1.1)`
- Border Color: `rgba(255, 255, 255, 0.5)`
- Box Shadow: `0 6px 16px rgba(0,0,0,0.6), 0 0 20px rgba(255,255,255,0.1)`

### Help Button (?)
- Class: `.arcade-frame-btn-help`
- Top: `60%`
- Icon: HelpCircle (Lucide), size 20

### Close Button (X)
- Class: `.arcade-frame-btn-close`
- Top: `78%`
- Icon: X (Lucide), size 20

---

## 7. Arcade Light Effects

**Light positions (under left red light):**
- Red light at: `left: 17.6%`, `top: 53.2%`
- Buttons positioned below this light

**Light Sequences:**
- `startup` - Initial boot animation (1500ms)
- `idle` - Gentle pulsing
- `gameStart` - Quick flash (800ms)
- `win` - Celebration pattern (3000ms)
- `gameOver` - Fade out (1500ms)

---

## Component Props Interface

```typescript
interface ArcadeIntroScreenProps {
  // Required
  game: MiniGame;           // Game config object
  onPlay: () => void;       // Called when Play clicked
  onClose: () => void;      // Called when X clicked

  // Optional
  leaderboard?: LeaderboardEntry[];  // Real leaderboard data
  showLeaderboard?: boolean;         // Control panel visibility
  onToggleLeaderboard?: () => void;  // Toggle callback
  showInstructions?: boolean;        // Control instructions visibility
  onToggleInstructions?: () => void; // Toggle callback
}

interface MiniGame {
  id: string;
  name: string;
  emoji: string;
  description: string;
  shortDescription?: string;
  accentColor: string;
  introBackground?: string;
  hasHighScores: boolean;
  instructions: Array<{ step: number; text: string }>;
  controls: Array<{ input: string; action: string }>;
}
```

---

## Active Games to Update

| Game | ID | Emoji | Accent Color |
|------|-----|-------|--------------|
| Brick by Brick | orange-stack | 🧱 | #f59e0b |
| Memory Match | memory-match | 🧠 | #8b5cf6 |
| Flappy Orange | flappy-orange | 🍊 | #14b8a6 |
| Wojak Runner | wojak-runner | 🏃 | #22c55e |
| Color Reaction | color-reaction | 🎨 | #06b6d4 |
| Block Puzzle | block-puzzle | 🧩 | #6366f1 |
| Citrus Drop | citrus-drop | 🍋 | #facc15 |
| Orange Snake | orange-snake | 🐍 | #22c55e |
| Brick Breaker | brick-breaker | 🧱 | #ef4444 |
| Wojak Whack | wojak-whack | 🔨 | #f97316 |
| Orange Pong | orange-pong | 🏓 | #3b82f6 |
| Orange Juggle | orange-juggle | 🤹 | #ec4899 |
| Knife Game | knife-game | 🔪 | #dc2626 |
| Merge 2048 | merge-2048 | 🔢 | #f59e0b |
| Orange Wordle | orange-wordle | 📝 | #22c55e |

---

## Implementation Notes

1. **The intro screen is already implemented in GameModal.tsx** - it's a shared component
2. **Each game just needs the right props** in the games config (accentColor, introBackground, etc.)
3. **No code duplication needed** - GameModal renders the intro for all games
4. **To customize per-game:** Add `introBackground` to game config

## What Already Works

The current implementation in `GameModal.tsx` already:
- Shows the arcade intro screen for all games
- Uses game.accentColor for styling
- Shows game.emoji as mascot
- Shows game.name as title
- Loads real leaderboard data
- Shows instructions overlay

## What May Need Updating

1. **Add introBackground** to each game's config for custom backgrounds
2. **Verify all games** have proper accentColor set
3. **Test each game** to ensure intro screen renders correctly
