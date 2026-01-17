# Gallery Page Redesign - Premium Cyberpunk Overhaul

## Current Issues
- Cards are completely static - no hover effects, no animations
- No visual hierarchy or depth
- Character type cards look flat and boring
- No ambient motion or life
- Missing the "always something happening" feel
- NFT detail modal is functional but plain

---

## Target Design: Dynamic Luxury Gallery

### 1. Character Type Cards (Homepage Grid)

#### Card Container
```css
/* Add glassmorphism background */
.character-card {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover state - lift and glow */
.character-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(249, 115, 22, 0.3),
    inset 0 0 20px rgba(249, 115, 22, 0.1);
}
```

#### Image Animation
```css
/* Subtle floating animation on images */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.character-card img {
  animation: float 4s ease-in-out infinite;
  animation-delay: var(--card-index, 0) * 0.2s; /* Stagger */
}

/* On hover, image scales slightly */
.character-card:hover img {
  transform: scale(1.05);
  transition: transform 0.4s ease;
}
```

#### Name Label Enhancement
```css
/* Gradient text with glow */
.character-name {
  background: linear-gradient(90deg, #F97316, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
  font-weight: 700;
}
```

---

### 2. Page Entry Animation (Framer Motion)

```tsx
// In Gallery.tsx or GalleryPage.tsx

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Wrap the grid
<motion.div
  className="character-grid"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  {characters.map((char, index) => (
    <motion.div
      key={char.id}
      variants={cardVariants}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.98 }}
      style={{ '--card-index': index } as React.CSSProperties}
    >
      <CharacterCard character={char} />
    </motion.div>
  ))}
</motion.div>
```

---

### 3. Background Enhancement

Add animated gradient background or subtle particle effect:

```css
/* Animated gradient background */
.gallery-page {
  background:
    radial-gradient(
      ellipse at 20% 80%,
      rgba(249, 115, 22, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 20%,
      rgba(124, 58, 237, 0.1) 0%,
      transparent 50%
    ),
    linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

### 4. NFT Grid View (When Viewing a Character Type)

#### Grid Cards
```tsx
// Add hover effects to individual NFT cards
<motion.div
  className="nft-card"
  whileHover={{
    scale: 1.05,
    rotateY: 5,
    rotateX: -5,
    z: 50
  }}
  transition={{ type: "spring", stiffness: 300 }}
>
  {/* Card content */}
</motion.div>
```

#### Card Glow Ring on Hover
```css
.nft-card {
  position: relative;
}

.nft-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(45deg, #F97316, #FFD700, #F97316);
  background-size: 200% 200%;
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
}

.nft-card:hover::before {
  opacity: 1;
  animation: borderGlow 2s linear infinite;
}

@keyframes borderGlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

---

### 5. NFT Detail Modal Enhancements

#### Modal Entry Animation
```tsx
<motion.div
  className="nft-modal"
  initial={{ opacity: 0, scale: 0.9, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 10 }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
>
```

#### Attribute Pills with Glow
```css
.attribute-pill {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s;
}

.attribute-pill:hover {
  background: rgba(249, 115, 22, 0.25);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}
```

#### Rarity Number Glow
```css
.rarity-number {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}
```

---

### 6. Mobile Specific Enhancements

#### Touch Feedback
```tsx
// Add haptic-like visual feedback on tap
<motion.div
  whileTap={{
    scale: 0.95,
    boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.5)"
  }}
>
```

#### Pull-to-Refresh Indicator (if applicable)
- Use orange spinner with glow
- Add subtle bounce animation when releasing

---

## Implementation Checklist

- [ ] Add glassmorphism to character type cards
- [ ] Implement floating animation on card images
- [ ] Add staggered entry animation with Framer Motion
- [ ] Create animated gradient background
- [ ] Add glowing border effect on NFT card hover
- [ ] Enhance NFT detail modal with spring animations
- [ ] Style attribute pills with glow effects
- [ ] Add mobile touch feedback animations
- [ ] Test all animations at 60fps on mobile

---

## Files to Modify

1. `src/pages/Gallery.tsx` or `GalleryPage.tsx`
2. `src/components/gallery/CharacterCard.tsx` (or similar)
3. `src/components/gallery/NFTCard.tsx`
4. `src/components/gallery/NFTModal.tsx` or detail view
5. Global CSS file for keyframe animations
6. `src/config/animations.ts` - Add new animation variants

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/01-gallery-redesign.md and implement all the gallery enhancements described. Focus on adding Framer Motion animations, glassmorphism effects, and glowing hover states to make the gallery feel premium and dynamic. Test on localhost:5173/gallery after changes.
```
