# Phase 1: Wojak Generator Layout Restructure

## Objective
Restructure the Wojak Generator page layout to maximize usability on both desktop and mobile by creating proper grid systems and eliminating wasted space.

---

## Current State Analysis

### Desktop Problems:
- Left side (preview) takes ~35% width, right side (options) takes ~65% but options are tiny
- Option thumbnails are in a single row, very small (~50px)
- Massive empty space below the options
- Category tabs are cramped without clear active states

### Mobile Problems:
- Options displayed in 3+2 grid pattern (inconsistent)
- Thumbnails too small to see details or tap accurately
- Categories cramped in horizontal bar
- Excessive vertical scrolling needed

---

## Target Layout

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  Header (Wojak Generator title)                                      │
├────────────────────────────┬────────────────────────────────────────┤
│                            │  Category Tabs (horizontal, pill-style) │
│                            │  [Base] [Clothes] [Mouth] [Mask] ...   │
│   CHARACTER PREVIEW        ├────────────────────────────────────────┤
│   (Large, ~45% width)      │                                        │
│                            │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│   - Centered character     │   │ Opt1 │ │ Opt2 │ │ Opt3 │ │ Opt4 │ │
│   - Checkered background   │   └──────┘ └──────┘ └──────┘ └──────┘ │
│   - Action buttons below   │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│                            │   │ Opt5 │ │ Opt6 │ │ Opt7 │ │ Opt8 │ │
│ ┌────────────────────────┐ │   └──────┘ └──────┘ └──────┘ └──────┘ │
│ │ [🎲][↩][↪][❤][⬇][📋] │ │   (4-column grid, ~100px thumbnails)   │
│ └────────────────────────┘ │   (Scrollable if many options)         │
└────────────────────────────┴────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌─────────────────────────┐
│  Header                 │
├─────────────────────────┤
│                         │
│   CHARACTER PREVIEW     │
│   (Square, full width)  │
│                         │
├─────────────────────────┤
│ [🎲][↩][↪][❤][⬇][📋]  │  Action buttons
├─────────────────────────┤
│ Base│Cloth│Mouth│►      │  Scrollable tabs
├─────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ Op1 │ │ Op2 │ │ Op3 │ │  3-column grid
│ └─────┘ └─────┘ └─────┘ │  (~100px thumbnails)
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ Op4 │ │ Op5 │ │ Op6 │ │
│ └─────┘ └─────┘ └─────┘ │
│       (scrollable)      │
└─────────────────────────┘
```

---

## Implementation Steps

### Step 1: Find the Generator Component

First, locate the main generator page and its components:
```bash
# Look for generator-related files
find src -name "*enerator*" -o -name "*wojak*" | grep -i -E "(generator|creator|builder)"
```

The main file is likely:
- `src/pages/Generator.tsx`
- `src/pages/WojakGenerator.tsx`
- Or similar

### Step 2: Restructure the Main Layout

Create a CSS class or update existing styles for the main container:

```css
/* Generator page container */
.generator-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); /* Viewport minus header */
  height: calc(100dvh - 64px);
  overflow: hidden;
}

/* Main content area - mobile first (column) */
.generator-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 16px;
  padding: 16px;
}

/* Desktop: side by side */
@media (min-width: 1024px) {
  .generator-content {
    flex-direction: row;
    gap: 24px;
    padding: 24px;
  }
}
```

### Step 3: Preview Panel Styles

```css
/* Preview section */
.generator-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Mobile: preview takes reasonable height */
@media (max-width: 1023px) {
  .generator-preview {
    flex-shrink: 0;
  }

  .generator-preview-canvas {
    aspect-ratio: 1;
    max-height: 50vh;
    width: 100%;
  }
}

/* Desktop: preview takes 45% width */
@media (min-width: 1024px) {
  .generator-preview {
    width: 45%;
    flex-shrink: 0;
  }

  .generator-preview-canvas {
    flex: 1;
    min-height: 0;
  }
}
```

### Step 4: Options Panel Styles

```css
/* Options panel */
.generator-options {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 16px;
}

/* Category tabs container */
.generator-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  flex-shrink: 0;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.generator-categories::-webkit-scrollbar {
  display: none;
}

/* Individual category tab */
.generator-category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 9999px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: var(--color-glass-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.generator-category-tab:hover {
  background: var(--color-bg-secondary);
}

.generator-category-tab.active {
  background: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
}

/* Desktop: larger tabs */
@media (min-width: 1024px) {
  .generator-category-tab {
    padding: 12px 20px;
    font-size: 15px;
  }
}
```

### Step 5: Options Grid Styles

```css
/* Options grid container - scrollable */
.generator-options-grid-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 4px; /* Space for hover effects */
}

/* Options grid */
.generator-options-grid {
  display: grid;
  gap: 12px;
}

/* Mobile: 3 columns */
@media (max-width: 1023px) {
  .generator-options-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
}

/* Desktop: 4 columns with larger items */
@media (min-width: 1024px) {
  .generator-options-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}

/* Large desktop: can fit 5 columns */
@media (min-width: 1440px) {
  .generator-options-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

/* Individual option item */
.generator-option-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border);
  transition: all 0.2s ease;
}

.generator-option-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Step 6: Action Buttons Styles

```css
/* Action buttons row */
.generator-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.generator-action-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.generator-action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.generator-action-btn.primary {
  background: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
}

.generator-action-btn.primary:hover {
  filter: brightness(1.1);
}
```

---

## Component Structure (React)

Update the component structure to match this layout:

```tsx
function WojakGenerator() {
  const [activeCategory, setActiveCategory] = useState('base');

  return (
    <div className="generator-page">
      <div className="generator-content">
        {/* Left: Preview */}
        <div className="generator-preview">
          <div className="generator-preview-canvas">
            {/* Character canvas here */}
          </div>
          <div className="generator-actions">
            {/* Action buttons */}
          </div>
        </div>

        {/* Right: Options */}
        <div className="generator-options">
          {/* Category tabs */}
          <div className="generator-categories">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`generator-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <cat.icon size={18} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Options grid */}
          <div className="generator-options-grid-container">
            <div className="generator-options-grid">
              {currentOptions.map(option => (
                <div
                  key={option.id}
                  className="generator-option-item"
                >
                  <img src={option.thumbnail} alt={option.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

After implementing, verify:

- [ ] **Desktop 1920x1080**: Preview ~45% width, 4-5 column grid, no wasted space
- [ ] **Desktop 1280x800**: Preview ~45% width, 4 column grid, options scroll if needed
- [ ] **Tablet 768px**: Layout should switch to mobile (stacked)
- [ ] **Mobile 375px**: Full-width preview, 3 column grid, smooth scrolling
- [ ] **Category tabs**: Horizontal scroll on mobile, all visible on desktop
- [ ] **Options**: Large enough to see details and tap accurately (~80-100px)
- [ ] **No horizontal overflow**: Page should never scroll horizontally

---

## Next Phase

Once layout is complete, proceed to `02-PHASE2-selection-states.md` for visual feedback improvements.
