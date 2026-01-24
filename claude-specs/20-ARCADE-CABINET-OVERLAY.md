# SPEC 20: Arcade Cabinet Overlay Effect

> Desktop-only immersive arcade experience that makes the game feel like it's being played inside a real arcade machine.

---

## 🎯 Overview

When users play games on desktop, display an arcade cabinet frame overlay around the game lightbox. This creates an immersive "playing at the arcade" experience.

**Key Requirements:**
- Desktop only (≥1024px width)
- Transparent center cutout where game shows through
- Multiple resolution support (laptop → 4K)
- Toggle on/off in settings
- Zero performance impact (static images)

---

## 📐 Screen Size Strategy

### Resolution Breakpoints

| Breakpoint | Screen Size | Overlay Dimensions | Screen Cutout | File |
|------------|-------------|-------------------|---------------|------|
| **4K** | ≥2560px | 3840×2160 | 2560×1440 | `arcade-4k.png` |
| **1440p** | ≥1920px | 2560×1440 | 1706×960 | `arcade-1440p.png` |
| **1080p** | ≥1366px | 1920×1080 | 1280×720 | `arcade-1080p.png` |
| **Laptop** | ≥1024px | 1440×900 | 960×600 | `arcade-laptop.png` |

### Cutout Ratio
- Screen cutout = **66.67%** of overlay width, **66.67%** of overlay height
- Centered horizontally and vertically (with slight top bias for marquee)

---

## 🖼️ Image Generation Prompts

### Base Prompt (Adapt dimensions for each size)

**For ChatGPT/DALL-E or Midjourney:**

```
Create a retro arcade cabinet frame overlay.

DIMENSIONS: [WIDTH]x[HEIGHT] pixels

CRITICAL REQUIREMENTS:
- The CENTER must be COMPLETELY TRANSPARENT (cut out)
- Transparent area: [CUTOUT_WIDTH]x[CUTOUT_HEIGHT] pixels, centered
- The cutout edges must be PERFECTLY SHARP with no blur/feathering
- Format: PNG with transparency (PNG-32)

ARCADE CABINET DESIGN:
- Classic 1980s arcade cabinet aesthetic
- Side panels: Dark walnut wood grain texture (#2a1810)
- Screen bezel: Brushed metal/chrome with subtle scratches
- Bezel width: approximately 150px (scaled proportionally)

DETAILS:
- Top area: Space for arcade "marquee" with subtle glow
- Bottom area: Decorative control panel with joystick shadow
- Side speakers: Small speaker grilles flanking the screen
- Coin slot: "INSERT COIN" text glowing orange (#F97316)
- Corner accents: Chrome bolts/rivets

LIGHTING & ATMOSPHERE:
- Subtle ambient glow around the screen bezel
- Neon accent lighting: Purple (#8B5CF6) and Cyan (#06B6D4)
- Light wear, dust, and authenticity marks
- The arcade looks well-used but loved

TANG GANG BRANDING:
- Incorporate subtle orange (#F97316) accents
- Optional: Small "WOJAK FARMERS" text on the marquee area
- Small orange 🍊 emoji detail somewhere on the cabinet

The transparent center is CRITICAL - this is where the game will display.
The surrounding cabinet frame creates the immersive arcade effect.

OUTPUT: PNG with alpha channel transparency in the center.
```

---

### Specific Prompts for Each Resolution

#### 4K Version (3840×2160)
```
[Use base prompt above with these values]
DIMENSIONS: 3840x2160 pixels
Transparent cutout: 2560x1440 pixels, centered
Bezel width: ~300px on each side
High detail - this is for 4K displays, show fine wood grain and metal texture
```

#### 1440p Version (2560×1440)
```
[Use base prompt above with these values]
DIMENSIONS: 2560x1440 pixels
Transparent cutout: 1706x960 pixels, centered
Bezel width: ~200px on each side
Good detail level for gaming monitors
```

#### 1080p Version (1920×1080)
```
[Use base prompt above with these values]
DIMENSIONS: 1920x1080 pixels
Transparent cutout: 1280x720 pixels, centered
Bezel width: ~150px on each side
Standard detail level
```

#### Laptop Version (1440×900)
```
[Use base prompt above with these values]
DIMENSIONS: 1440x900 pixels
Transparent cutout: 960x600 pixels, centered
Bezel width: ~115px on each side
Slightly simplified details for smaller screens
```

---

## 💻 Implementation

### File Structure

```
public/
  assets/
    arcade/
      arcade-4k.png      (3840×2160, ~2-4MB)
      arcade-1440p.png   (2560×1440, ~1-2MB)
      arcade-1080p.png   (1920×1080, ~500KB-1MB)
      arcade-laptop.png  (1440×900, ~300-500KB)
```

### Component: ArcadeOverlay.tsx

```tsx
/**
 * Arcade Cabinet Overlay
 *
 * Displays a decorative arcade cabinet frame around the game lightbox.
 * Desktop only (≥1024px). Can be toggled in settings.
 */

import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function ArcadeOverlay() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);

  // Only show on desktop and when enabled in settings
  useEffect(() => {
    const checkVisibility = () => {
      const isDesktop = window.innerWidth >= 1024;
      const isEnabled = settings?.arcadeMode !== false; // Default to true
      setIsVisible(isDesktop && isEnabled);
    };

    checkVisibility();
    window.addEventListener('resize', checkVisibility);
    return () => window.removeEventListener('resize', checkVisibility);
  }, [settings?.arcadeMode]);

  if (!isVisible) return null;

  return (
    <div className="arcade-overlay" aria-hidden="true">
      <picture>
        {/* 4K screens */}
        <source
          media="(min-width: 2560px)"
          srcSet="/assets/arcade/arcade-4k.png"
        />
        {/* 1440p screens */}
        <source
          media="(min-width: 1920px)"
          srcSet="/assets/arcade/arcade-1440p.png"
        />
        {/* 1080p screens */}
        <source
          media="(min-width: 1366px)"
          srcSet="/assets/arcade/arcade-1080p.png"
        />
        {/* Laptop screens */}
        <source
          media="(min-width: 1024px)"
          srcSet="/assets/arcade/arcade-laptop.png"
        />
        {/* Fallback */}
        <img
          src="/assets/arcade/arcade-1080p.png"
          alt=""
          loading="eager"
          decoding="async"
        />
      </picture>
    </div>
  );
}
```

### CSS: arcade-overlay.css

```css
/* =====================================================
   ARCADE CABINET OVERLAY
   Desktop-only decorative frame around game lightbox
   ===================================================== */

.arcade-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999; /* Above everything except modals */
  pointer-events: none; /* Allow clicks through to game */
  display: none; /* Hidden by default */
  overflow: hidden;
}

/* Only show on desktop (1024px+) */
@media (min-width: 1024px) {
  .arcade-overlay {
    display: block;
  }
}

/* The overlay image */
.arcade-overlay picture,
.arcade-overlay img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Performance optimization */
.arcade-overlay img {
  will-change: auto;
  contain: strict;
}

/* Optional: Subtle animation on load */
@keyframes arcadeFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.arcade-overlay {
  animation: arcadeFadeIn 0.5s ease-out;
}

/* Hide during game loading to prevent flash */
.game-loading .arcade-overlay {
  opacity: 0;
}
```

### Add to GameModal or Game Container

In your game modal/container component, add the overlay:

```tsx
// In GameModal.tsx or wherever games are rendered

import { ArcadeOverlay } from '@/components/ArcadeOverlay';

export function GameModal({ game, onClose }) {
  return (
    <>
      {/* Arcade cabinet overlay - renders at fixed position */}
      <ArcadeOverlay />

      {/* Game content */}
      <div className="game-modal">
        <div className="game-container">
          {/* Your game iframe/canvas here */}
        </div>
      </div>
    </>
  );
}
```

### Settings Toggle

Add to settings page:

```tsx
// In Settings.tsx

function ArcadeModeToggle() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="setting-row">
      <div className="setting-info">
        <label htmlFor="arcade-mode">Arcade Mode</label>
        <p className="setting-description">
          Show decorative arcade cabinet frame around games (desktop only)
        </p>
      </div>
      <input
        type="checkbox"
        id="arcade-mode"
        checked={settings.arcadeMode !== false}
        onChange={(e) => updateSettings({ arcadeMode: e.target.checked })}
      />
    </div>
  );
}
```

### Update SettingsContext

Add the arcadeMode setting:

```typescript
interface UserSettings {
  // ... existing settings
  arcadeMode?: boolean; // Default true
}

// In default settings:
const defaultSettings: UserSettings = {
  // ... existing
  arcadeMode: true,
};
```

---

## 🎨 Alternative: Pure CSS Arcade Frame (No Images)

If you want a simpler version without generating images, here's a pure CSS approach:

```css
.arcade-frame-css {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  display: none;
}

@media (min-width: 1024px) {
  .arcade-frame-css {
    display: block;
  }
}

/* Top bezel */
.arcade-frame-css::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
  border-bottom: 4px solid #444;
  box-shadow: inset 0 -10px 30px rgba(0,0,0,0.5);
}

/* Bottom bezel */
.arcade-frame-css::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(0deg, #1a1a1a 0%, #2a2a2a 100%);
  border-top: 4px solid #444;
  box-shadow: inset 0 10px 30px rgba(0,0,0,0.5);
}

/* Side bezels using box-shadow */
.arcade-frame-css {
  box-shadow:
    inset 150px 0 0 #1a1a1a,  /* Left panel */
    inset -150px 0 0 #1a1a1a, /* Right panel */
    inset 154px 0 0 #444,     /* Left border */
    inset -154px 0 0 #444;    /* Right border */
}
```

This CSS-only approach is:
- ✅ Zero additional downloads
- ✅ Infinitely scalable
- ❌ Less realistic than images
- ❌ Can't show wood grain/metal textures

---

## 📋 Implementation Checklist

### Phase 1: Generate Images
- [ ] Generate 4K arcade cabinet PNG (3840×2160)
- [ ] Generate 1440p arcade cabinet PNG (2560×1440)
- [ ] Generate 1080p arcade cabinet PNG (1920×1080)
- [ ] Generate laptop arcade cabinet PNG (1440×900)
- [ ] Optimize images (TinyPNG or similar)
- [ ] Place in `/public/assets/arcade/`

### Phase 2: Implement Component
- [ ] Create `ArcadeOverlay.tsx` component
- [ ] Create `arcade-overlay.css` styles
- [ ] Add to game modal/container

### Phase 3: Settings Integration
- [ ] Add `arcadeMode` to settings schema
- [ ] Add toggle in Settings page
- [ ] Persist setting to localStorage/database

### Phase 4: Testing
- [ ] Test on 4K monitor
- [ ] Test on 1440p monitor
- [ ] Test on 1080p monitor
- [ ] Test on laptop
- [ ] Test toggle on/off
- [ ] Test that clicks pass through to game
- [ ] Test performance (no FPS drop)

---

## 🎮 Expected Result

When playing a game on desktop:
1. The game lightbox appears in the center
2. An arcade cabinet frame surrounds it
3. The frame has realistic wood panels, chrome bezel, speaker grilles
4. "INSERT COIN" glows at the bottom
5. The user feels like they're at an arcade
6. They can disable it in settings if they prefer clean view

---

## 📝 Notes for Image Generation

When you get the images from DALL-E/Midjourney:

1. **Verify transparency**: Open in Photoshop/GIMP and confirm the center is truly transparent (checkerboard pattern)

2. **Sharp edges**: Zoom in to 200% and check the cutout edges are crisp, not blurry

3. **Correct dimensions**: Verify each image matches the specified dimensions exactly

4. **File size**: Optimize with TinyPNG - aim for:
   - 4K: Under 3MB
   - 1440p: Under 1.5MB
   - 1080p: Under 800KB
   - Laptop: Under 500KB

5. **Color consistency**: All four images should have matching colors/style

---

**Let's bring the arcade experience to wojak.ink!** 🕹️🍊
