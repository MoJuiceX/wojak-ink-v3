# Claude CLI Fix: Shop Frame Previews Are All Identical

## The Problem

In the shop, ALL legendary frames display the same plain orange border. Each frame should have its own unique visual effect as defined in SPEC 12.

**Current State:** Every frame preview shows a generic orange border
**Expected State:** Each frame should display its unique effect

## Frames That Need Fixing

### Legendary Effect Frames (CSS Animations)

| Frame | Required Effect |
|-------|-----------------|
| **Holographic Tang** | Iridescent holographic shimmer - rainbow colors shift and flow across the border |
| **Supernova** | Explosive star burst animation - radiating light particles |
| **Aurora Grove** | Northern lights effect - shifting colors flowing around border |
| **Void Citrus** | Black hole effect - dark void with orange energy being pulled in |

### Legend Emoji Frames (Emoji Borders)

These frames should have the ACTUAL EMOJI repeated around the border, not just an orange line:

| Frame | Border Should Be |
|-------|------------------|
| **Crown Frame** | 👑👑👑👑👑👑👑👑 crowns around the entire border |
| **Top Hat Frame** | 🎩🎩🎩🎩🎩🎩🎩🎩 top hats around the entire border |
| **Cookie Frame** | 🍪🍪🍪🍪🍪🍪🍪🍪 cookies around the entire border |
| **Frog Frame** | 🐸🐸🐸🐸🐸🐸🐸🐸 frogs around the entire border |
| **Goose Frame** | 🪿🪿🪿🪿🪿🪿🪿🪿 geese around the entire border |
| **Trophy Frame** | 🏆🏆🏆🏆🏆🏆🏆🏆 trophies around the entire border |
| **Fire Frame** | 🔥🔥🔥🔥🔥🔥🔥🔥 fire emojis around the entire border |

## Implementation Details

### For Emoji Frames

Use SVG with `<textPath>` to place emojis along a rectangular path:

```tsx
const EmojiFrame: React.FC<{ emoji: string; children: React.ReactNode }> = ({ emoji, children }) => {
  // Repeat emoji enough times to fill the border
  const emojiString = emoji.repeat(20);

  return (
    <div className="emoji-frame-container">
      <svg className="emoji-frame-svg" viewBox="0 0 100 100">
        <defs>
          <path
            id="frame-path"
            d="M 5,5 L 95,5 L 95,95 L 5,95 Z"
            fill="none"
          />
        </defs>
        <text className="emoji-frame-text">
          <textPath href="#frame-path">
            {emojiString}
          </textPath>
        </text>
      </svg>
      <div className="emoji-frame-content">
        {children}
      </div>
    </div>
  );
};
```

```css
.emoji-frame-container {
  position: relative;
  display: inline-block;
}

.emoji-frame-svg {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  pointer-events: none;
}

.emoji-frame-text {
  font-size: 8px;
  dominant-baseline: middle;
}

.emoji-frame-content {
  position: relative;
  z-index: 1;
}
```

### For Holographic Frame

```css
.frame-holographic {
  position: relative;
  border: 3px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(var(--bg-color), var(--bg-color)) padding-box,
    linear-gradient(
      var(--holo-angle, 0deg),
      #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0088, #ff0000
    ) border-box;
  animation: holographic-shift 3s linear infinite;
}

@property --holo-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes holographic-shift {
  to {
    --holo-angle: 360deg;
  }
}
```

### For Supernova Frame

```css
.frame-supernova {
  position: relative;
  border: 3px solid #F97316;
  border-radius: 12px;
  box-shadow:
    0 0 10px #F97316,
    0 0 20px #F97316,
    0 0 30px #ff6600,
    0 0 40px #ff3300;
  animation: supernova-pulse 2s ease-in-out infinite;
}

@keyframes supernova-pulse {
  0%, 100% {
    box-shadow:
      0 0 10px #F97316,
      0 0 20px #F97316,
      0 0 30px #ff6600,
      0 0 40px #ff3300;
  }
  50% {
    box-shadow:
      0 0 20px #F97316,
      0 0 40px #F97316,
      0 0 60px #ff6600,
      0 0 80px #ff3300,
      0 0 100px #ff0000;
  }
}

/* Add particle burst effect */
.frame-supernova::before {
  content: '';
  position: absolute;
  inset: -5px;
  border-radius: 16px;
  background: radial-gradient(circle at center, transparent 60%, rgba(249, 115, 22, 0.3) 100%);
  animation: supernova-burst 1.5s ease-out infinite;
}

@keyframes supernova-burst {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
```

## Files to Modify

1. **`/src/components/Shop/ShopItemCard.tsx`** (or wherever frame preview is rendered)
   - Apply correct CSS class based on frame type
   - Use EmojiFrame component for legend emoji frames

2. **`/src/styles/frames.css`** (or create if doesn't exist)
   - Add all unique frame CSS classes
   - Add emoji frame styles

3. **`/src/components/Frames/EmojiFrame.tsx`** (create new)
   - SVG-based emoji border component

## Expected Result

After fix, the shop should show:
- **Holographic Tang**: Rainbow shimmer cycling around the border
- **Supernova**: Pulsing explosive glow with particle effects
- **Crown Frame**: 👑👑👑👑 actual crown emojis forming the border
- **Top Hat Frame**: 🎩🎩🎩🎩 actual top hat emojis forming the border
- **Cookie Frame**: 🍪🍪🍪🍪 actual cookie emojis forming the border
- **Frog Frame**: 🐸🐸🐸🐸 actual frog emojis forming the border
- **Goose Frame**: 🪿🪿🪿🪿 actual goose emojis forming the border
- **Trophy Frame**: 🏆🏆🏆🏆 actual trophy emojis forming the border
- **Fire Frame**: 🔥🔥🔥🔥 actual fire emojis forming the border

Each frame must be visually distinct and match its name/description. No two frames should look the same.

## Reference

See `/claude-specs/12-SHOP-COLLECTIBLES-SPEC.md` for full frame definitions and `/claude-specs/12-CLAUDE-CLI-IMPLEMENTATION.md` for CSS code examples.
