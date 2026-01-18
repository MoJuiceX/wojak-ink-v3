# UI Patterns

<!-- Last updated: 2026-01-18 -->
<!-- Source: Consolidated from LEARNINGS.md -->

## Animation Patterns

### Framer Motion AnimatePresence
- Use `mode="popLayout"` for smooth crossfades without layout jump
- Use `mode="wait"` when old element must exit before new enters
- Scale animations should happen ONCE on mount, then only floating/breathing

```tsx
<AnimatePresence mode="popLayout">
  <motion.img
    key={image}
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    transition={{ duration: 1.2, ease: 'easeInOut' }}
  />
</AnimatePresence>
```

### Breathing/Floating Animation
- Continuous y-axis movement for idle state
- Different durations per element for organic feel
- xDrift for subtle horizontal sway

```tsx
animate={{
  y: [0, -15, 0],
  x: [0, xDrift * 0.5, 0],
}}
transition={{
  duration: position.duration, // 10-15s
  repeat: Infinity,
  ease: 'easeInOut',
}}
```

### Parallax Layers
- Background: -150px at 30% scroll
- Mid-layer: -80px at 30% scroll
- Front-layer: -30px at 30% scroll
- Use `useTransform` from Framer Motion

## Component Patterns

### Rotating Content (Taglines, Images)
- Use setInterval in useEffect with cleanup
- Respect `prefersReducedMotion`
- Use AnimatePresence for smooth transitions

```tsx
useEffect(() => {
  if (prefersReducedMotion) return;
  const interval = setInterval(() => {
    setIndex(prev => (prev + 1) % ITEMS.length);
  }, 4000);
  return () => clearInterval(interval);
}, [prefersReducedMotion]);
```

### Floating NFTs Per Section
- Each section needs unique image pool to avoid repetition
- HERO_IMAGES, COLLECTION_IMAGES, CTA_IMAGES as separate arrays
- Position right-side NFTs at x: 78-82% to avoid scroll dots

## Sound Patterns

### Vote Sound Pitch Variation
Makes sounds less repetitive and more satisfying:

```typescript
// In SoundManager.ts
instance.audio.playbackRate = pitchShift * (1 + (Math.random() * 2 - 1) * pitchVariation);
// pitchVariation: 0.15-0.2 (±15-20%)
// pitchShift: 1.1 for positive sounds, 0.95 for negative
```

## State Management

### Persistent State Across Navigation
Use localStorage with useState initializer:

```typescript
const [balance, setBalance] = useState(() => {
  const saved = localStorage.getItem('key');
  return saved !== null ? parseInt(saved, 10) : defaultValue;
});

useEffect(() => {
  localStorage.setItem('key', String(balance));
}, [balance]);
```

### Query Invalidation After Async Load
When async data loads after initial render, invalidate dependent queries:

```typescript
// After sync completes
queryClient.invalidateQueries({ queryKey: ['bigPulp'] });
```

## CSS Conventions

### Naming
- Avoid generic class names (use `.color-orange` not `.orange`)
- Game.css has `.orange { position: absolute }` - don't reuse

### Tables
- Use `table-layout: fixed` for stable column widths
- Attribute names left-aligned, numeric columns centered

### Subtle UI Elements (Floating Icons)
- Transparent background, no hover background effect
- Just opacity change on hover
- Position with negative values if needed (`top: -6`)
