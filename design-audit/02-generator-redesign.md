# Wojak Generator Redesign - Interactive Cyberpunk Creator

## Current Issues
- Avatar preview area is static and plain
- Layer tabs look basic and unengaging
- Trait selection cards are flat with minimal feedback
- No celebration/delight moments when creating
- Action buttons (download, favorite, etc.) are standard
- Missing the "creative playground" feeling

---

## Target Design: Dynamic Avatar Workshop

### 1. Avatar Preview Area

#### Ambient Glow Behind Avatar
```css
.avatar-preview-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pulsing glow behind the avatar */
.avatar-preview-container::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  background: radial-gradient(
    circle,
    rgba(249, 115, 22, 0.4) 0%,
    rgba(249, 115, 22, 0.1) 40%,
    transparent 70%
  );
  filter: blur(40px);
  animation: pulseGlow 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes pulseGlow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```

#### Avatar Change Animation
```tsx
// When a trait changes, animate the avatar
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={avatarKey} // Change this when traits update
    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 0.3 }}
    className="avatar-image"
  >
    <img src={avatarSrc} alt="Your Wojak" />
  </motion.div>
</AnimatePresence>
```

#### Sparkle Effect on Change
```tsx
// Add particle burst when trait changes
const SparkleEffect = ({ trigger }) => {
  return (
    <motion.div
      key={trigger}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 2],
        opacity: [1, 0.8, 0]
      }}
      transition={{ duration: 0.5 }}
      className="sparkle-burst"
    />
  );
};

// CSS for sparkle
.sparkle-burst {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.6) 0%,
    transparent 50%
  );
  pointer-events: none;
}
```

---

### 2. Layer Tab Bar Enhancement

#### Glowing Active Tab
```css
.layer-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.layer-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.layer-tab:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.3);
}

.layer-tab.active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1));
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow:
    0 0 20px rgba(249, 115, 22, 0.3),
    inset 0 0 15px rgba(249, 115, 22, 0.1);
}

/* Orange dot indicator for tabs with selections */
.layer-tab.has-selection::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #F97316;
  border-radius: 50%;
  margin-top: 4px;
  box-shadow: 0 0 8px #F97316;
}
```

#### Tab Switch Animation
```tsx
<motion.div
  className="layer-tab-indicator"
  layoutId="activeTab"
  transition={{ type: "spring", stiffness: 500, damping: 30 }}
/>
```

---

### 3. Trait Selection Cards

#### Card Design with Rarity Glow
```css
.trait-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 30, 30, 0.8);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Selected state */
.trait-card.selected {
  border-color: #F97316;
  box-shadow:
    0 0 20px rgba(249, 115, 22, 0.5),
    inset 0 0 20px rgba(249, 115, 22, 0.1);
}

/* Check mark animation */
.trait-card.selected::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #F97316;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Hover lift */
.trait-card:hover:not(.selected) {
  transform: translateY(-4px);
  border-color: rgba(249, 115, 22, 0.4);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}
```

#### Staggered Grid Animation
```tsx
const traitGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const traitCardVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200 }
  }
};

<motion.div
  className="trait-grid"
  variants={traitGridVariants}
  initial="hidden"
  animate="visible"
>
  {traits.map((trait) => (
    <motion.div
      key={trait.id}
      variants={traitCardVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <TraitCard trait={trait} />
    </motion.div>
  ))}
</motion.div>
```

---

### 4. Action Buttons Enhancement

#### Button Bar with Glass Effect
```css
.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.2);
  color: #F97316;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(249, 115, 22, 0.2);
  border-color: rgba(249, 115, 22, 0.5);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
  transform: translateY(-2px);
}

.action-btn:active {
  transform: translateY(0) scale(0.95);
}

/* Special styling for primary actions */
.action-btn.primary {
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.5);
}
```

#### Randomize Button Special Effect
```tsx
// When clicking randomize, add a spin animation
<motion.button
  className="action-btn randomize"
  whileTap={{
    rotate: 360,
    scale: 0.9
  }}
  transition={{ duration: 0.5 }}
  onClick={handleRandomize}
>
  🎲
</motion.button>
```

---

### 5. Download/Save Celebration

#### Success Toast with Confetti
```tsx
// When user downloads/saves their creation
const showSuccessToast = () => {
  // Trigger confetti particles
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#F97316', '#FFD700', '#FF6B00']
  });

  // Show toast
  toast.success("Your Wojak is ready! 🎉", {
    icon: "🍊",
    style: {
      background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
      border: '1px solid rgba(249, 115, 22, 0.3)',
      color: '#fff'
    }
  });
};
```

Note: Install `canvas-confetti` package if not already available.

---

### 6. Mobile Optimizations

#### Bottom Sheet for Trait Selection
```css
/* On mobile, traits appear in a bottom sheet */
@media (max-width: 768px) {
  .trait-selector {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 50vh;
    background: rgba(20, 20, 20, 0.98);
    backdrop-filter: blur(20px);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    border-top: 1px solid rgba(249, 115, 22, 0.3);
    padding-top: 12px;
    overflow-y: auto;
  }

  /* Drag handle */
  .trait-selector::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }
}
```

#### Gesture-Based Tab Switching
```tsx
// Allow swiping between layer tabs on mobile
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => nextTab(),
  onSwipedRight: () => prevTab(),
  trackMouse: false
});

<div {...handlers} className="trait-selector">
  {/* content */}
</div>
```

---

## Implementation Checklist

- [ ] Add pulsing glow behind avatar preview
- [ ] Implement trait change animation with blur transition
- [ ] Add sparkle/particle effect on trait selection
- [ ] Restyle layer tabs with glowing active state
- [ ] Enhance trait cards with selection animation
- [ ] Add staggered grid entry animation
- [ ] Style action buttons with glass effect
- [ ] Add spin animation to randomize button
- [ ] Implement download celebration with confetti
- [ ] Add mobile bottom sheet for traits
- [ ] Test performance on mobile devices

---

## Files to Modify

1. `src/pages/Generator.tsx` or `GeneratorPage.tsx`
2. `src/components/generator/AvatarPreview.tsx`
3. `src/components/generator/LayerTabs.tsx`
4. `src/components/generator/TraitCard.tsx`
5. `src/components/generator/ActionBar.tsx`
6. Add `canvas-confetti` to dependencies if needed

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/02-generator-redesign.md and implement the generator page enhancements. Add the pulsing glow effect behind the avatar, animate trait changes with blur transitions, style the layer tabs with glowing active states, and add staggered animations to the trait grid. Test on localhost:5173/generator.
```
