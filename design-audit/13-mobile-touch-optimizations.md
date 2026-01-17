# Mobile Touch Optimizations - iPhone-First Experience

## Overview
Since wojak.ink is mobile-first with iPhone as the primary target, every interaction must feel native and responsive. This document covers touch-specific optimizations.

---

## 1. Touch Target Sizes

### Minimum Touch Targets
Apple's Human Interface Guidelines recommend **44x44 points** minimum.

```css
/* Ensure all interactive elements meet minimum size */
button,
a,
[role="button"],
.touchable {
  min-width: 44px;
  min-height: 44px;
}

/* For icon-only buttons, add padding */
.icon-btn {
  padding: 10px;
  /* Icon 24px + padding 10px*2 = 44px */
}

/* For inline links, add vertical padding */
a {
  padding: 8px 0;
  margin: -8px 0;
}
```

### Touch Target Spacing
```css
/* Minimum 8px between touch targets */
.button-group {
  gap: 8px;
}

.nav-items {
  gap: 8px;
}
```

---

## 2. Touch Feedback

### Tap Highlight
```css
/* Custom tap highlight color */
* {
  -webkit-tap-highlight-color: rgba(249, 115, 22, 0.2);
}

/* Remove default and add custom */
button, a {
  -webkit-tap-highlight-color: transparent;
}

button:active, a:active {
  background-color: rgba(249, 115, 22, 0.15);
}
```

### Press State Animation
```tsx
// Framer Motion press feedback
<motion.button
  whileTap={{
    scale: 0.97,
    backgroundColor: "rgba(249, 115, 22, 0.15)"
  }}
  transition={{ duration: 0.1 }}
>
  Button Text
</motion.button>
```

### Haptic-Like Visual Feedback
```css
/* Quick scale bounce on tap */
.tap-bounce:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* Card press effect */
.card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
```

---

## 3. Scroll Behavior

### Smooth Scroll with Momentum
```css
/* Enable iOS-style momentum scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

/* Scroll snap for carousels */
.carousel {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.carousel-item {
  scroll-snap-align: center;
}
```

### Pull-to-Refresh Styling
```css
/* Custom pull-to-refresh indicator */
.pull-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--color-primary-500);
}

.pull-indicator .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(249, 115, 22, 0.2);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### Overscroll Behavior
```css
/* Prevent pull-to-refresh on specific containers */
.no-overscroll {
  overscroll-behavior: contain;
}

/* Prevent horizontal overscroll */
body {
  overscroll-behavior-x: none;
}
```

---

## 4. Gesture Support

### Swipe to Navigate
```tsx
import { useSwipeable } from 'react-swipeable';

const SwipeableGallery = () => {
  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Min distance for swipe
    preventScrollOnSwipe: true,
  });

  return (
    <div {...handlers} className="gallery">
      {/* Gallery content */}
    </div>
  );
};
```

### Pinch to Zoom (NFT Images)
```tsx
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

const ZoomableImage = ({ src }) => {
  const [style, api] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
  }));

  const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
      api.start({ scale: Math.max(1, Math.min(scale, 3)) });
    },
    onDrag: ({ offset: [x, y] }) => {
      if (style.scale.get() > 1) {
        api.start({ x, y });
      }
    },
  });

  return (
    <animated.img
      {...bind()}
      src={src}
      style={{
        transform: style.scale.to(s => `scale(${s})`),
        x: style.x,
        y: style.y,
        touchAction: 'none',
      }}
    />
  );
};
```

### Long Press for Context Menu
```tsx
import { useLongPress } from 'use-long-press';

const NFTCard = ({ nft }) => {
  const bind = useLongPress(() => {
    showContextMenu(nft);
  }, {
    threshold: 500, // 500ms
    captureEvent: true,
    cancelOnMovement: true,
  });

  return (
    <div {...bind()} className="nft-card">
      {/* Card content */}
    </div>
  );
};
```

---

## 5. Bottom Sheet Pattern

Common on iOS for modals and menus:

```tsx
import { motion, useDragControls } from 'framer-motion';

const BottomSheet = ({ isOpen, onClose, children }) => {
  const controls = useDragControls();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="bottom-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Drag handle */}
            <div
              className="sheet-handle"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="handle-bar" />
            </div>

            <div className="sheet-content">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 90vh;
  z-index: var(--z-modal);
  touch-action: none;
}

.sheet-handle {
  padding: 12px;
  cursor: grab;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto;
}

.sheet-content {
  padding: 0 20px 20px;
  overflow-y: auto;
  max-height: calc(90vh - 40px);
  -webkit-overflow-scrolling: touch;
}

.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: calc(var(--z-modal) - 1);
}
```

---

## 6. Safe Areas (iPhone Notch/Dynamic Island)

```css
/* Account for iPhone safe areas */
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Fixed bottom navigation */
.mobile-nav {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

/* Fixed header */
.app-header {
  padding-top: calc(12px + env(safe-area-inset-top));
}

/* Full-height modals */
.fullscreen-modal {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 7. Keyboard Handling

### Input Focus Behavior
```css
/* Prevent zoom on input focus (iOS) */
input, textarea, select {
  font-size: 16px; /* Prevents zoom on iOS */
}

/* Scroll input into view */
input:focus {
  scroll-margin-bottom: 100px;
}
```

### Virtual Keyboard Detection
```tsx
const useKeyboardVisible = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Visual viewport is smaller when keyboard is open
      const isVisible = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.75
        : false;
      setKeyboardVisible(isVisible);
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardVisible;
};

// Usage: Hide bottom nav when keyboard is open
const MobileNav = () => {
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;

  return <nav className="mobile-nav">...</nav>;
};
```

---

## 8. Image Optimization for Mobile

### Responsive Images
```tsx
<img
  src={nft.image}
  srcSet={`
    ${nft.image}?w=200 200w,
    ${nft.image}?w=400 400w,
    ${nft.image}?w=800 800w
  `}
  sizes="(max-width: 400px) 200px, (max-width: 800px) 400px, 800px"
  loading="lazy"
  decoding="async"
  alt={nft.name}
/>
```

### Blur Placeholder
```tsx
const ImageWithPlaceholder = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="image-container">
      {/* Blur placeholder */}
      <div
        className={`blur-placeholder ${loaded ? 'hidden' : ''}`}
        style={{ backgroundImage: `url(${src}?w=20&blur=10)` }}
      />

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={loaded ? 'loaded' : ''}
      />
    </div>
  );
};
```

```css
.image-container {
  position: relative;
  overflow: hidden;
}

.blur-placeholder {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  transform: scale(1.1);
  transition: opacity 0.3s;
}

.blur-placeholder.hidden {
  opacity: 0;
}

.image-container img {
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container img.loaded {
  opacity: 1;
}
```

---

## 9. Performance Optimizations

### Reduce Motion
```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Use simpler animations
const variants = prefersReducedMotion
  ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
  : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
```

### Touch Event Passive
```tsx
// Add passive flag for better scroll performance
useEffect(() => {
  const element = ref.current;
  const options = { passive: true };

  element.addEventListener('touchstart', handleTouch, options);
  element.addEventListener('touchmove', handleMove, options);

  return () => {
    element.removeEventListener('touchstart', handleTouch);
    element.removeEventListener('touchmove', handleMove);
  };
}, []);
```

### GPU Acceleration
```css
/* Force GPU acceleration for smoother animations */
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}

/* Remove will-change after animation */
.animated-element.done {
  will-change: auto;
}
```

---

## 10. iOS-Specific Fixes

### Prevent Double-Tap Zoom
```css
/* Disable double-tap zoom on interactive elements */
button, a, [role="button"] {
  touch-action: manipulation;
}
```

### Fix 100vh Issue
```css
/* iOS doesn't calculate 100vh correctly */
.full-height {
  height: 100vh;
  height: 100dvh; /* Use dynamic viewport height */
  height: -webkit-fill-available; /* Fallback for older iOS */
}
```

### Disable Text Selection on UI Elements
```css
.no-select {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
```

### Fix Sticky Hover States
```css
/* Remove hover on touch devices */
@media (hover: none) {
  .button:hover {
    background: inherit;
    transform: none;
  }
}
```

---

## Implementation Checklist

- [ ] Ensure all touch targets are minimum 44x44px
- [ ] Add custom tap highlight color
- [ ] Implement press state animations
- [ ] Add momentum scrolling to scrollable areas
- [ ] Implement swipe gestures where appropriate
- [ ] Create reusable BottomSheet component
- [ ] Add safe area padding throughout app
- [ ] Prevent input zoom with 16px font size
- [ ] Add blur placeholder for images
- [ ] Implement reduced motion support
- [ ] Fix iOS 100vh issue
- [ ] Add passive touch event listeners

---

## Files to Modify/Create

1. `src/styles/mobile.css` - All mobile-specific styles
2. `src/hooks/useSwipeable.ts` - Swipe gesture hook
3. `src/hooks/useKeyboardVisible.ts` - Keyboard detection
4. `src/components/common/BottomSheet.tsx` - Reusable bottom sheet
5. `src/components/common/ImageWithPlaceholder.tsx` - Lazy image component

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/13-mobile-touch-optimizations.md and implement the mobile touch optimizations. Ensure all touch targets are 44x44px minimum, add custom tap feedback with orange highlight, create a reusable BottomSheet component with drag-to-dismiss, add safe area padding for iPhone notch, and implement blur placeholders for lazy-loaded images. Test on iPhone viewport.
```
