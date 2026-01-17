# Accessibility & Performance Guide

## Accessibility Enhancements

### 1. Reduced Motion Support

Users with vestibular disorders can be made nauseous by animations. Always respect their preference:

```css
/* Global reduced motion styles */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```tsx
// Hook for detecting reduced motion preference
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Usage in components
const CardAnimation = () => {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      whileHover={prefersReducedMotion ? undefined : { y: -8, scale: 1.02 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring" }}
    >
      Card content
    </motion.div>
  );
};
```

### 2. Focus Management

```css
/* Visible focus states - essential for keyboard navigation */
:focus-visible {
  outline: 2px solid #F97316;
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Custom focus ring for buttons */
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.4);
}

/* Skip link for keyboard users */
.skip-link {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  background: #F97316;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 9999;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 16px;
}
```

```tsx
// Skip link component
const SkipLink = () => (
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
);

// Usage in App
const App = () => (
  <>
    <SkipLink />
    <Header />
    <main id="main-content" tabIndex={-1}>
      {/* Content */}
    </main>
  </>
);
```

### 3. Color Contrast

Ensure all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

```css
/* Good contrast values for dark theme */
:root {
  /* Primary text - white on dark = 15.5:1 ✅ */
  --text-primary: #FFFFFF;

  /* Secondary text - needs at least 4.5:1 on #0D0D0D */
  --text-secondary: rgba(255, 255, 255, 0.7); /* ~11:1 ✅ */

  /* Tertiary text - minimum readable */
  --text-tertiary: rgba(255, 255, 255, 0.5); /* ~7.5:1 ✅ */

  /* Disabled - intentionally low contrast but still readable */
  --text-disabled: rgba(255, 255, 255, 0.38); /* ~5:1 ✅ */

  /* Orange on dark - #F97316 on #0D0D0D = 5.1:1 ✅ */
  --color-primary-500: #F97316;

  /* Gold on dark - needs adjustment */
  --color-gold-accessible: #FFD54F; /* Better than #EAB308 for text */
}

/* Don't use orange text on orange backgrounds */
.btn-primary {
  /* Bad: orange text on orange bg */
  /* Good: white text on orange bg */
  color: white;
  background: var(--color-primary-500);
}
```

### 4. Screen Reader Support

```tsx
// Announce dynamic content changes
const ScoreDisplay = ({ score }: { score: number }) => {
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      // Announce score change to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `Score increased to ${score}`;
      document.body.appendChild(announcement);

      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
    prevScore.current = score;
  }, [score]);

  return (
    <div aria-label={`Current score: ${score}`}>
      {score}
    </div>
  );
};

// Hidden text for screen readers only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 5. Game Accessibility

```tsx
// Games should have keyboard alternatives
const FlappyOrangeAccessible = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div
      role="application"
      aria-label="Flappy Orange game. Press space or tap to jump."
    >
      {/* Game canvas */}
    </div>
  );
};
```

---

## Performance Optimizations

### 1. Image Optimization

```tsx
// Progressive image loading component
const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Generate low-quality placeholder URL
  const placeholderSrc = src.replace(/(\.\w+)$/, '-thumb$1');

  return (
    <div
      className={`optimized-image ${className || ''}`}
      style={{ width, height }}
    >
      {/* Low-quality placeholder */}
      <img
        src={placeholderSrc}
        alt=""
        className={`placeholder ${isLoaded ? 'hidden' : ''}`}
        aria-hidden="true"
      />

      {/* Full image (lazy loaded) */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`full-image ${isLoaded ? 'loaded' : ''}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};
```

```css
.optimized-image {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.optimized-image .placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  transform: scale(1.1);
  transition: opacity 0.3s;
}

.optimized-image .placeholder.hidden {
  opacity: 0;
}

.optimized-image .full-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
}

.optimized-image .full-image.loaded {
  opacity: 1;
}
```

### 2. Component Virtualization for Large Lists

```tsx
// Virtual scrolling for NFT gallery
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedGallery = ({ items }: { items: NFT[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(items.length / 4), // 4 items per row
    getScrollElement: () => parentRef.current,
    estimateSize: () => 250, // Estimated row height
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      className="gallery-container"
      style={{ height: '100vh', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * 4;
          const rowItems = items.slice(startIndex, startIndex + 4);

          return (
            <div
              key={virtualRow.key}
              className="gallery-row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowItems.map((item) => (
                <NFTCard key={item.id} nft={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### 3. Animation Performance

```tsx
// Use transform and opacity only for animations
// BAD - triggers layout
const badAnimation = {
  initial: { width: 0, marginLeft: 0 },
  animate: { width: 100, marginLeft: 20 },
};

// GOOD - compositor only, no layout
const goodAnimation = {
  initial: { scaleX: 0, x: 0, opacity: 0 },
  animate: { scaleX: 1, x: 20, opacity: 1 },
};

// Use will-change sparingly
const PerformantCard = () => (
  <motion.div
    className="card"
    style={{ willChange: 'transform' }}
    whileHover={{ y: -8 }}
  >
    Content
  </motion.div>
);
```

```css
/* GPU acceleration for animations */
.animated-element {
  transform: translateZ(0); /* Creates new stacking context */
  backface-visibility: hidden;
}

/* Don't animate these properties */
.avoid-animating {
  /* width, height, top, left, margin, padding, border-width */
  /* These trigger expensive layout calculations */
}

/* Animate these instead */
.prefer-animating {
  transform: translate(), scale(), rotate();
  opacity: 0-1;
  filter: blur(), brightness();
}
```

### 4. Code Splitting & Lazy Loading

```tsx
// Lazy load heavy components
const LazyGenerator = lazy(() => import('@/pages/Generator'));
const LazyGallery = lazy(() => import('@/pages/Gallery'));
const LazyGames = lazy(() => import('@/pages/GamesHub'));

// Route-based code splitting
const AppRoutes = () => (
  <Suspense fallback={<PageSkeleton />}>
    <Routes>
      <Route path="/generator" element={<LazyGenerator />} />
      <Route path="/gallery" element={<LazyGallery />} />
      <Route path="/games" element={<LazyGames />} />
    </Routes>
  </Suspense>
);

// Lazy load non-critical animations
const LazyConfetti = lazy(() => import('canvas-confetti'));

const CelebrationEffect = () => {
  const triggerConfetti = async () => {
    const confetti = await import('canvas-confetti');
    confetti.default({
      particleCount: 100,
      spread: 70,
      colors: ['#F97316', '#FFD700'],
    });
  };

  return <button onClick={triggerConfetti}>Celebrate!</button>;
};
```

### 5. Memory Management

```tsx
// Clean up subscriptions and timers
const GameComponent = () => {
  const animationRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start game loop
    const gameLoop = () => {
      // Update game state
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    animationRef.current = requestAnimationFrame(gameLoop);

    // Start timer
    timerRef.current = setInterval(() => {
      // Timer logic
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return <canvas />;
};

// Object pooling for particles
class ParticlePool {
  private pool: Particle[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
    // Pre-allocate particles
    for (let i = 0; i < maxSize; i++) {
      this.pool.push(new Particle());
    }
  }

  acquire(): Particle | null {
    const particle = this.pool.find(p => !p.active);
    if (particle) {
      particle.active = true;
      return particle;
    }
    return null;
  }

  release(particle: Particle): void {
    particle.active = false;
    particle.reset();
  }
}
```

### 6. Network Optimization

```tsx
// Prefetch critical data
const usePrefetchGallery = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch first page of gallery data
    queryClient.prefetchQuery({
      queryKey: ['nfts', { page: 1 }],
      queryFn: () => fetchNFTs(1),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Prefetch metadata
    queryClient.prefetchQuery({
      queryKey: ['metadata'],
      queryFn: fetchMetadata,
    });
  }, [queryClient]);
};

// Preload images for next page
const usePreloadImages = (images: string[]) => {
  useEffect(() => {
    images.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, [images]);
};
```

### 7. Render Optimization

```tsx
// Memoize expensive computations
const FilteredNFTs = memo(({ nfts, filters }) => {
  const filteredNFTs = useMemo(() => {
    return nfts.filter((nft) => {
      // Complex filtering logic
      return matchesFilters(nft, filters);
    });
  }, [nfts, filters]);

  return (
    <div className="grid">
      {filteredNFTs.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
});

// Debounce rapid state updates
const SearchInput = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // Only search after user stops typing
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

---

## Performance Checklist

### Before Launch
- [ ] Run Lighthouse audit (target: 90+ on mobile)
- [ ] Test on low-end devices (e.g., Moto G4)
- [ ] Check bundle size (`npx source-map-explorer`)
- [ ] Verify lazy loading works
- [ ] Test with slow 3G throttling

### Images
- [ ] All images use modern formats (WebP/AVIF with fallbacks)
- [ ] Responsive images with srcset
- [ ] Lazy loading for off-screen images
- [ ] Proper compression (TinyPNG or similar)

### JavaScript
- [ ] Tree shaking enabled
- [ ] No unused dependencies
- [ ] Code splitting by route
- [ ] Dynamic imports for heavy libraries

### CSS
- [ ] No unused CSS (PurgeCSS or similar)
- [ ] Critical CSS inlined
- [ ] Animations use GPU-accelerated properties

### Network
- [ ] Enable gzip/brotli compression
- [ ] CDN for static assets
- [ ] Proper cache headers
- [ ] Preload critical resources

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/17-accessibility-performance.md and implement the accessibility improvements. Start by adding the usePrefersReducedMotion hook, then update the focus styles globally, and add the skip link component. Also implement the OptimizedImage component for lazy loading images with blur placeholders.
```
