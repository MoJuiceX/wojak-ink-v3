# Global Animations & Effects - Cyberpunk Polish Layer

## Overview
This file contains system-wide animations and effects that should be applied across the entire site for consistency and that "always something happening" feel.

---

## 1. Background Ambient Effects

### Animated Gradient Background (Global)
```css
/* Add to body or main container */
.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    /* Floating orbs */
    radial-gradient(
      ellipse 600px 600px at 20% 80%,
      rgba(249, 115, 22, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 400px 400px at 80% 20%,
      rgba(124, 58, 237, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 500px 500px at 60% 60%,
      rgba(249, 115, 22, 0.04) 0%,
      transparent 50%
    ),
    /* Base gradient */
    linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%);

  animation: backgroundPulse 20s ease-in-out infinite;
}

@keyframes backgroundPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}
```

### Noise/Grain Texture Overlay
```css
/* Subtle film grain for premium feel */
.noise-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

---

## 2. Global Card Effects

### Universal Card Hover
```css
/* Apply to all cards site-wide */
.card, [class*="card"] {
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.card:hover, [class*="card"]:hover {
  transform: translateY(-4px);
}
```

### Glassmorphism Utility
```css
.glass {
  background: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-orange {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  backdrop-filter: blur(12px);
  border: 1px solid rgba(249, 115, 22, 0.2);
}
```

---

## 3. Button Micro-interactions

### Universal Button Effects
```css
/* Base button style */
button, .btn, [class*="btn"] {
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

/* Active/Press state */
button:active, .btn:active {
  transform: scale(0.97);
}

/* Primary button glow */
.btn-primary:hover {
  box-shadow:
    0 4px 15px rgba(249, 115, 22, 0.4),
    0 0 30px rgba(249, 115, 22, 0.2);
}
```

### Ripple Effect (Optional)
```tsx
// Hook for ripple effect on buttons
const useRipple = () => {
  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(249, 115, 22, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return createRipple;
};
```

```css
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
```

---

## 4. Loading States

### Skeleton Shimmer
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Loading Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(249, 115, 22, 0.2);
  border-top-color: #F97316;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alternative: Pulsing orange */
.pulse-loader {
  width: 12px;
  height: 12px;
  background: #F97316;
  border-radius: 50%;
  animation: pulseLoader 1s ease-in-out infinite;
}

@keyframes pulseLoader {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
}
```

---

## 5. Page Transitions

### Framer Motion Page Wrapper
```tsx
// Create a PageTransition wrapper component
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: "blur(4px)"
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: {
      duration: 0.2
    }
  }
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

// Usage in App.tsx with AnimatePresence
<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
    {/* ... other routes */}
  </Routes>
</AnimatePresence>
```

---

## 6. Scroll Animations

### Scroll Reveal Hook
```tsx
import { useInView } from 'framer-motion';

export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
    ...options
  });

  return { ref, isInView };
};

// Usage
const { ref, isInView } = useScrollReveal();

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 30 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  Content appears on scroll
</motion.div>
```

### Stagger Children on Scroll
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 7. Interactive Feedback

### Tooltip Animations
```tsx
<motion.div
  className="tooltip"
  initial={{ opacity: 0, y: 5, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 5, scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
  Tooltip content
</motion.div>
```

### Toast Notifications
```css
.toast {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(249, 115, 22, 0.2);
}

.toast.success {
  border-color: rgba(34, 197, 94, 0.4);
}

.toast.error {
  border-color: rgba(239, 68, 68, 0.4);
}
```

---

## 8. Focus States (Accessibility)

```css
/* Custom focus ring */
:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #0d0d0d,
    0 0 0 4px rgba(249, 115, 22, 0.6);
}

/* For buttons/interactive elements */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #0d0d0d,
    0 0 0 4px rgba(249, 115, 22, 0.6),
    0 0 20px rgba(249, 115, 22, 0.3);
}
```

---

## 9. Reduced Motion Support

```css
/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```tsx
// In Framer Motion components
const shouldReduceMotion = useReducedMotion();

<motion.div
  animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }}
>
```

---

## 10. CSS Custom Properties for Consistency

```css
:root {
  /* Colors */
  --color-primary: #F97316;
  --color-primary-glow: rgba(249, 115, 22, 0.4);
  --color-gold: #FFD700;
  --color-purple: #7C3AED;

  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Easing */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Shadows */
  --shadow-glow-sm: 0 0 10px var(--color-primary-glow);
  --shadow-glow-md: 0 0 20px var(--color-primary-glow);
  --shadow-glow-lg: 0 0 40px var(--color-primary-glow);

  /* Blur */
  --blur-sm: 8px;
  --blur-md: 12px;
  --blur-lg: 20px;
}
```

---

## Implementation Checklist

- [ ] Add animated background gradient
- [ ] Add noise texture overlay
- [ ] Implement glassmorphism utility classes
- [ ] Add universal card hover effects
- [ ] Create primary button glow effects
- [ ] Add skeleton shimmer animation
- [ ] Create loading spinner styles
- [ ] Implement PageTransition component
- [ ] Add scroll reveal animations
- [ ] Create tooltip animations
- [ ] Style toast notifications
- [ ] Add focus state styles
- [ ] Add reduced motion support
- [ ] Define CSS custom properties

---

## Files to Create/Modify

1. `src/styles/animations.css` - All keyframe animations
2. `src/styles/utilities.css` - Utility classes (glass, glow, etc.)
3. `src/components/common/PageTransition.tsx`
4. `src/hooks/useScrollReveal.ts`
5. `src/hooks/useRipple.ts`
6. `src/App.tsx` - Wrap routes with AnimatePresence
7. `src/index.css` or `src/main.css` - CSS variables

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/07-global-animations-effects.md and implement the global animation system. Add the animated background gradient, create glassmorphism utility classes, implement the PageTransition component with blur effects, add skeleton shimmer animations, and define CSS custom properties for consistency. Apply these across the entire site.
```
