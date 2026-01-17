# Loading States & Skeleton Screens - Premium Loading Experience

## Philosophy
Loading states should feel intentional and premium, not like an error. The user should always know something is happening and feel confident the app is working.

---

## 1. Skeleton Screen Patterns

### NFT Card Skeleton
```tsx
const NFTCardSkeleton = () => (
  <div className="nft-card-skeleton">
    <div className="skeleton skeleton-image" />
    <div className="skeleton-content">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
    </div>
  </div>
);
```

```css
.nft-card-skeleton {
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-image {
  aspect-ratio: 1;
  border-radius: 0;
}

.skeleton-content {
  padding: 12px;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 16px;
  width: 50%;
}
```

### Gallery Grid Skeleton
```tsx
const GalleryGridSkeleton = ({ count = 12 }) => (
  <div className="gallery-grid">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <NFTCardSkeleton />
      </motion.div>
    ))}
  </div>
);
```

### Character Type Card Skeleton
```tsx
const CharacterCardSkeleton = () => (
  <div className="character-card-skeleton">
    <div className="skeleton skeleton-character-image" />
    <div className="skeleton skeleton-character-name" />
  </div>
);
```

```css
.character-card-skeleton {
  aspect-ratio: 1;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

.skeleton-character-image {
  position: absolute;
  inset: 0;
}

.skeleton-character-name {
  position: absolute;
  bottom: 12px;
  left: 12px;
  height: 24px;
  width: 60%;
}
```

### BigPulp Analysis Skeleton
```tsx
const BigPulpAnalysisSkeleton = () => (
  <div className="analysis-skeleton">
    <div className="analysis-header">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton-text">
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>

    <div className="analysis-stats">
      {[1, 2, 3].map(i => (
        <div key={i} className="stat-skeleton">
          <div className="skeleton skeleton-stat-value" />
          <div className="skeleton skeleton-stat-label" />
        </div>
      ))}
    </div>

    <div className="analysis-attributes">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton skeleton-attribute" />
      ))}
    </div>
  </div>
);
```

### Media Card Skeleton
```tsx
const MediaCardSkeleton = () => (
  <div className="media-card-skeleton">
    <div className="skeleton skeleton-thumbnail">
      <div className="skeleton-play-btn" />
    </div>
    <div className="skeleton-info">
      <div className="skeleton skeleton-media-title" />
      <div className="skeleton skeleton-media-meta" />
    </div>
  </div>
);
```

### Leaderboard Row Skeleton
```tsx
const LeaderboardRowSkeleton = () => (
  <div className="leaderboard-row-skeleton">
    <div className="skeleton skeleton-rank" />
    <div className="skeleton skeleton-player-avatar" />
    <div className="skeleton skeleton-player-name" />
    <div className="skeleton skeleton-score" />
  </div>
);
```

---

## 2. Premium Loading Spinner

### Orange Glow Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(249, 115, 22, 0.2);
  border-top-color: var(--color-primary-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.with-glow {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### BigPulp Loading Animation
```tsx
const BigPulpLoader = () => (
  <div className="bigpulp-loader">
    <motion.div
      className="bigpulp-icon"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🍊
    </motion.div>
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      BigPulp is thinking...
    </motion.p>
  </div>
);
```

```css
.bigpulp-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
}

.bigpulp-icon {
  font-size: 64px;
  filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.5));
}

.bigpulp-loader p {
  color: var(--text-secondary);
  font-size: 14px;
}
```

### Dots Loader
```css
.dots-loader {
  display: flex;
  gap: 4px;
}

.dots-loader span {
  width: 8px;
  height: 8px;
  background: var(--color-primary-500);
  border-radius: 50%;
  animation: dotBounce 1.4s infinite ease-in-out both;
}

.dots-loader span:nth-child(1) { animation-delay: -0.32s; }
.dots-loader span:nth-child(2) { animation-delay: -0.16s; }
.dots-loader span:nth-child(3) { animation-delay: 0s; }

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 3. Page Loading States

### Full Page Loader
```tsx
const PageLoader = () => (
  <motion.div
    className="page-loader"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="loader-content">
      <motion.div
        className="logo"
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))",
            "drop-shadow(0 0 30px rgba(249, 115, 22, 0.6))",
            "drop-shadow(0 0 10px rgba(249, 115, 22, 0.3))"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🍊
      </motion.div>
      <div className="spinner" />
    </div>
  </motion.div>
);
```

```css
.page-loader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: var(--z-max);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loader-content .logo {
  font-size: 64px;
}
```

### Inline Content Loader
```tsx
const ContentLoader = ({ text = "Loading..." }) => (
  <div className="content-loader">
    <div className="spinner small" />
    <span>{text}</span>
  </div>
);
```

```css
.content-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--text-secondary);
}

.spinner.small {
  width: 20px;
  height: 20px;
  border-width: 2px;
}
```

---

## 4. Progressive Loading

### Image Progressive Load
```tsx
const ProgressiveImage = ({ src, placeholder, alt }) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div className="progressive-image">
      <img
        src={currentSrc}
        alt={alt}
        className={isLoaded ? 'loaded' : 'loading'}
      />
    </div>
  );
};
```

```css
.progressive-image img {
  transition: filter 0.3s ease;
}

.progressive-image img.loading {
  filter: blur(10px);
}

.progressive-image img.loaded {
  filter: blur(0);
}
```

### Lazy Load with Intersection Observer
```tsx
const useLazyLoad = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Usage
const LazyNFTCard = ({ nft }) => {
  const { ref, isVisible } = useLazyLoad();

  return (
    <div ref={ref}>
      {isVisible ? <NFTCard nft={nft} /> : <NFTCardSkeleton />}
    </div>
  );
};
```

---

## 5. Error States

### Retry Card
```tsx
const RetryCard = ({ onRetry, message = "Failed to load" }) => (
  <motion.div
    className="retry-card"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <span className="retry-icon">😕</span>
    <p>{message}</p>
    <motion.button
      className="retry-btn"
      onClick={onRetry}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Try Again
    </motion.button>
  </motion.div>
);
```

```css
.retry-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-xl);
  text-align: center;
}

.retry-icon {
  font-size: 48px;
}

.retry-card p {
  color: var(--text-secondary);
}

.retry-btn {
  padding: 12px 24px;
  background: var(--gradient-orange);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-weight: 600;
  cursor: pointer;
}
```

### Network Error State
```tsx
const NetworkError = () => (
  <div className="network-error">
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      📡
    </motion.div>
    <h3>Connection Lost</h3>
    <p>Please check your internet connection</p>
  </div>
);
```

---

## 6. Optimistic UI Updates

### Like/Favorite Button
```tsx
const FavoriteButton = ({ nftId, isFavorited: initialState }) => {
  const [isFavorited, setIsFavorited] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    // Optimistic update
    setIsFavorited(!isFavorited);

    try {
      await toggleFavorite(nftId);
    } catch (error) {
      // Revert on error
      setIsFavorited(isFavorited);
      toast.error("Failed to update favorite");
    }
  };

  return (
    <motion.button
      className={`favorite-btn ${isFavorited ? 'active' : ''}`}
      onClick={handleToggle}
      whileTap={{ scale: 0.9 }}
    >
      <motion.span
        animate={isFavorited ? {
          scale: [1, 1.3, 1],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {isFavorited ? '❤️' : '🤍'}
      </motion.span>
    </motion.button>
  );
};
```

---

## 7. Loading State Hooks

### useLoadingState Hook
```tsx
const useLoadingState = (asyncFn, deps = []) => {
  const [state, setState] = useState({
    isLoading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState(s => ({ ...s, isLoading: true, error: null }));

      try {
        const data = await asyncFn();
        if (!cancelled) {
          setState({ isLoading: false, error: null, data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ isLoading: false, error, data: null });
        }
      }
    };

    load();

    return () => { cancelled = true; };
  }, deps);

  return state;
};

// Usage
const Gallery = () => {
  const { isLoading, error, data: nfts } = useLoadingState(
    () => fetchNFTs(),
    []
  );

  if (isLoading) return <GalleryGridSkeleton />;
  if (error) return <RetryCard onRetry={() => {}} />;
  return <NFTGrid nfts={nfts} />;
};
```

---

## 8. Skeleton Component Library

### Reusable Skeleton Base
```tsx
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
    }}
  />
);

// Compound components
Skeleton.Circle = ({ size = 40 }) => (
  <Skeleton width={size} height={size} borderRadius="50%" />
);

Skeleton.Text = ({ lines = 3, lastLineWidth = '60%' }) => (
  <div className="skeleton-text-block">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? lastLineWidth : '100%'}
        className="skeleton-line"
      />
    ))}
  </div>
);

Skeleton.Button = () => (
  <Skeleton height={44} borderRadius={12} />
);
```

---

## Implementation Checklist

- [ ] Create base Skeleton component with shimmer animation
- [ ] Build NFTCardSkeleton component
- [ ] Build CharacterCardSkeleton component
- [ ] Build GalleryGridSkeleton (uses NFTCardSkeleton)
- [ ] Build BigPulpAnalysisSkeleton
- [ ] Build MediaCardSkeleton
- [ ] Build LeaderboardRowSkeleton
- [ ] Create orange glow spinner
- [ ] Create BigPulp thinking animation
- [ ] Create dots loader
- [ ] Create full page loader
- [ ] Implement progressive image loading
- [ ] Implement lazy loading with Intersection Observer
- [ ] Create RetryCard error component
- [ ] Create NetworkError component
- [ ] Implement optimistic UI patterns
- [ ] Create useLoadingState hook

---

## Files to Create

1. `src/components/ui/Skeleton.tsx` - Base skeleton component
2. `src/components/skeletons/NFTCardSkeleton.tsx`
3. `src/components/skeletons/GalleryGridSkeleton.tsx`
4. `src/components/skeletons/BigPulpSkeleton.tsx`
5. `src/components/ui/Spinner.tsx` - Various spinners
6. `src/components/ui/PageLoader.tsx`
7. `src/components/ui/RetryCard.tsx`
8. `src/components/common/ProgressiveImage.tsx`
9. `src/hooks/useLazyLoad.ts`
10. `src/hooks/useLoadingState.ts`

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/14-loading-states-skeletons.md and implement the loading state system. Create a reusable Skeleton component with shimmer animation, build skeleton components for NFT cards, gallery grid, and BigPulp analysis. Add an orange glow spinner, BigPulp thinking animation, and progressive image loading with blur placeholders. Create error states with retry functionality.
```
