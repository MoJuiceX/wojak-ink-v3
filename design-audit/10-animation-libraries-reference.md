# Animation Libraries Reference Guide

## What You Already Have
Based on the README, wojak.ink already uses **Framer Motion**. This is excellent - it's the #1 choice for React animations in 2024/2025.

---

## Recommended Library Stack

### 1. Framer Motion (Already Installed ✅)
**Use for:** Page transitions, hover effects, scroll animations, layout animations, gestures

```bash
# Already in your project
```

**Key APIs to leverage:**
- `useScroll` + `useTransform` - Scroll-linked parallax
- `AnimatePresence` - Exit animations
- `layoutId` - Shared element transitions
- `whileHover`, `whileTap` - Gesture animations
- `useInView` - Scroll reveal triggers

### 2. canvas-confetti (Add This!)
**Use for:** Celebration moments, achievements, purchases

```bash
npm install canvas-confetti
# or
bun add canvas-confetti
```

**Usage:**
```tsx
import confetti from 'canvas-confetti';

// Basic burst
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});

// Wojak.ink themed (orange/gold)
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  colors: ['#F97316', '#FFD700', '#FF6B00', '#EA580C']
});

// Side cannons for big celebrations
const end = Date.now() + 3000;
const colors = ['#F97316', '#FFD700'];

(function frame() {
  confetti({
    particleCount: 2,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors
  });
  confetti({
    particleCount: 2,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors
  });

  if (Date.now() < end) {
    requestAnimationFrame(frame);
  }
}());
```

**When to use:**
- Game high score achieved
- NFT avatar set successfully
- Purchase completed in shop
- Guild joined
- Leaderboard ranking achieved

### 3. tsParticles (Optional - For Advanced Effects)
**Use for:** Background particle effects, ambient animations

```bash
npm install @tsparticles/react @tsparticles/slim
# or
bun add @tsparticles/react @tsparticles/slim
```

**Usage:**
```tsx
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// Initialize once in app
useEffect(() => {
  initParticlesEngine(async (engine) => {
    await loadSlim(engine);
  });
}, []);

// Floating particles background
<Particles
  options={{
    particles: {
      number: { value: 30 },
      color: { value: "#F97316" },
      opacity: { value: 0.3 },
      size: { value: 3 },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true
      }
    }
  }}
/>
```

**When to use:**
- Landing page hero background
- BigPulp page ambient effect
- Special celebration screens

### 4. GSAP (Optional - For Complex Sequences)
**Use for:** Complex timeline animations, scroll-triggered sequences

```bash
npm install gsap @gsap/react
# or
bun add gsap @gsap/react
```

**Note:** Only add if Framer Motion isn't enough. For most cases, Framer Motion will suffice.

---

## Pre-Built Animated Components (Inspiration)

### Magic UI
Free animated components built with Framer Motion + Tailwind:
- https://magicui.design/

Components to potentially adapt:
- Animated gradients
- Text reveal animations
- Card hover effects
- Particle backgrounds

### Aceternity UI
High-impact hero sections:
- https://ui.aceternity.com/

---

## Animation Patterns for Wojak.ink

### Pattern 1: Card Hover
```tsx
<motion.div
  whileHover={{
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(249,115,22,0.3)"
  }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
```

### Pattern 2: Staggered List
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i} variants={item}>{i}</motion.li>
  ))}
</motion.ul>
```

### Pattern 3: Scroll Reveal
```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
```

### Pattern 4: Parallax Scroll
```tsx
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

<motion.div style={{ y }}>
  Moves up as you scroll down
</motion.div>
```

### Pattern 5: Page Transition
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### Pattern 6: Celebration Confetti
```tsx
const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#F97316', '#FFD700', '#FF6B00']
  });
};
```

---

## Performance Tips

1. **Use `transform` only** - Avoid animating width, height, top, left
2. **Add `will-change`** - For heavy animations
3. **Use `layoutId`** - Instead of animating position manually
4. **Lazy load particles** - Don't load tsParticles on every page
5. **Respect `prefers-reduced-motion`**

```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Skip animations if user prefers reduced motion
```

---

## Quick Install Commands

```bash
# Essential (if not already installed)
bun add framer-motion

# Confetti (recommended)
bun add canvas-confetti
bun add -D @types/canvas-confetti

# Particles (optional)
bun add @tsparticles/react @tsparticles/slim

# GSAP (optional, for complex timelines)
bun add gsap @gsap/react
```

---

## Summary

| Library | Purpose | Priority |
|---------|---------|----------|
| Framer Motion | Everything | ✅ Already have |
| canvas-confetti | Celebrations | 🔥 Add now |
| tsParticles | Background effects | ⏳ Optional |
| GSAP | Complex timelines | ⏳ Only if needed |

**Recommendation:** Add `canvas-confetti` immediately - it's tiny and will add delightful moments throughout the app with minimal effort.
