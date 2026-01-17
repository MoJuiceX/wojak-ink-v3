# Phase 3: Microinteractions & Animations

## Objective
Add delightful, satisfying animations that make the Wojak Generator feel polished and responsive. These subtle details significantly improve perceived quality and user enjoyment.

---

## Prerequisites
- Phase 1 layout must be complete
- Phase 2 selection states must be implemented
- Framer Motion should already be installed in the project

---

## Animation Principles

1. **Fast & Snappy**: Keep animations under 300ms
2. **Purposeful**: Every animation should provide feedback
3. **Non-blocking**: User should never wait for animations
4. **Consistent**: Use the same easing across the app
5. **Performant**: Use `transform` and `opacity` only

---

## Animation Catalog

### 1. Character Update Animation

When a trait is applied, the character should react:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function CharacterPreview({ character, lastUpdate }) {
  return (
    <motion.div
      className="generator-preview-canvas"
      key={lastUpdate} // Re-mount triggers animation
      initial={{ scale: 0.95, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Character layers */}
      <AnimatePresence mode="sync">
        {character.layers.map((layer, index) => (
          <motion.img
            key={`${layer.category}-${layer.id}`}
            src={layer.src}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 2. Option Selection Pop

When an option is selected, it should "pop" briefly:

```tsx
function OptionItem({ option, isSelected, onSelect }) {
  const [justSelected, setJustSelected] = useState(false);

  const handleSelect = () => {
    onSelect(option.id);
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 300);
  };

  return (
    <motion.button
      className={`generator-option-item ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={justSelected ? {
        scale: [1, 1.15, 1],
        transition: { duration: 0.3 }
      } : {}}
    >
      <img src={option.thumbnail} alt={option.name} />

      {/* Selection ring animation */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="selection-ring"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Checkmark animation */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="checkmark-badge"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check size={14} color="white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

CSS for the selection ring:

```css
.selection-ring {
  position: absolute;
  inset: -3px;
  border: 3px solid var(--color-brand-primary);
  border-radius: 14px;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(255, 140, 0, 0.4);
}

.checkmark-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: var(--color-brand-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

### 3. Category Tab Indicator

Add a sliding indicator under the active tab:

```tsx
function CategoryTabs({ categories, activeCategory, onSelect }) {
  const [tabRects, setTabRects] = useState({});
  const containerRef = useRef(null);

  // Measure tab positions
  useEffect(() => {
    // ... measure logic
  }, [categories]);

  return (
    <div className="generator-categories" ref={containerRef}>
      {/* Sliding indicator */}
      <motion.div
        className="category-indicator"
        layoutId="category-indicator"
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />

      {categories.map(cat => (
        <motion.button
          key={cat.id}
          className={`generator-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelect(cat.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <cat.icon size={18} />
          <span>{cat.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
```

### 4. Options Grid Stagger Animation

When switching categories, stagger the option appearance:

```tsx
function OptionsGrid({ options, selectedId, onSelect, categoryId }) {
  return (
    <div className="generator-options-grid-container">
      <motion.div
        className="generator-options-grid"
        key={categoryId} // Re-mount on category change
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03,
              delayChildren: 0.05,
            },
          },
        }}
      >
        {options.map(option => (
          <motion.div
            key={option.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                },
              },
            }}
          >
            <OptionItem
              option={option}
              isSelected={selectedId === option.id}
              onSelect={onSelect}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
```

### 5. Randomize Button Shake

When clicking the randomize button, add a fun shake effect:

```tsx
function RandomizeButton({ onRandomize }) {
  const [isShaking, setIsShaking] = useState(false);

  const handleClick = () => {
    setIsShaking(true);
    onRandomize();
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <motion.button
      className="generator-action-btn"
      onClick={handleClick}
      animate={isShaking ? {
        rotate: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Shuffle size={20} />
    </motion.button>
  );
}
```

### 6. Download Success Celebration

When download completes, show brief confetti or sparkle:

```tsx
function DownloadButton({ onDownload }) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDownload = async () => {
    await onDownload();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="download-btn-container">
      <motion.button
        className="generator-action-btn primary"
        onClick={handleDownload}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download size={20} />
      </motion.button>

      {/* Success sparkles */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="sparkle"
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 40,
                  y: Math.sin(i * 60 * Math.PI / 180) * 40,
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

CSS for sparkles:

```css
.download-btn-container {
  position: relative;
}

.success-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--color-brand-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--color-brand-primary);
}
```

### 7. Undo/Redo Button Feedback

When undo/redo is available or used:

```tsx
function HistoryButtons({ canUndo, canRedo, onUndo, onRedo }) {
  return (
    <div className="history-buttons">
      <motion.button
        className="generator-action-btn"
        onClick={onUndo}
        disabled={!canUndo}
        whileHover={canUndo ? { scale: 1.1, x: -2 } : {}}
        whileTap={canUndo ? { scale: 0.9 } : {}}
      >
        <Undo size={20} />
      </motion.button>

      <motion.button
        className="generator-action-btn"
        onClick={onRedo}
        disabled={!canRedo}
        whileHover={canRedo ? { scale: 1.1, x: 2 } : {}}
        whileTap={canRedo ? { scale: 0.9 } : {}}
      >
        <Redo size={20} />
      </motion.button>
    </div>
  );
}
```

---

## Performance Tips

1. **Use `will-change` sparingly**:
```css
.generator-option-item {
  will-change: transform; /* Only on frequently animated elements */
}
```

2. **Disable animations for reduced motion preference**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

3. **Use Framer Motion's layout animations** for position changes:
```tsx
<motion.div layout layoutId="unique-id">
```

4. **Batch state updates** to avoid animation interruption.

---

## Testing Checklist

After implementing, verify:

- [ ] **Select option**: Pop animation with checkmark appearing
- [ ] **Switch category**: Smooth stagger animation of new options
- [ ] **Hover option**: Scale up smoothly
- [ ] **Character update**: Brief bounce/scale effect
- [ ] **Randomize button**: Fun shake animation
- [ ] **Download complete**: Sparkle/celebration effect
- [ ] **Undo/Redo**: Button moves in direction of action
- [ ] **Reduced motion**: Animations are minimized
- [ ] **Mobile**: Tap animations work (no hover needed)
- [ ] **Performance**: 60fps on mid-range devices

---

## Summary

With all three phases complete, the Wojak Generator should now:

1. ✅ Use space efficiently on both desktop and mobile
2. ✅ Have large, easy-to-see and tap options
3. ✅ Provide clear visual feedback for selections
4. ✅ Feel polished and satisfying to use
5. ✅ Match or exceed the UX quality of tools like Bitmoji

The generator should now feel like a premium, professional tool that users enjoy interacting with!
