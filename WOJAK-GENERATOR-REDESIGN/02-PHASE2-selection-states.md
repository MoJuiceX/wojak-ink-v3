# Phase 2: Selection States & Visual Feedback

## Objective
Add clear visual feedback for hover, selected, and active states to make the interface feel responsive and help users understand what's clickable and what's selected.

---

## Prerequisites
- Phase 1 layout restructure must be complete
- Generator should have proper grid layout working

---

## Selection States Overview

### Option Items Need These States:

| State | Visual Treatment |
|-------|-----------------|
| **Default** | Subtle border, normal opacity |
| **Hover** | Scale up slightly, brighter border, shadow |
| **Selected** | Orange border, glow effect, checkmark badge |
| **Disabled** | Reduced opacity, no hover effect |

### Category Tabs Need These States:

| State | Visual Treatment |
|-------|-----------------|
| **Default** | Transparent background, muted text |
| **Hover** | Slightly brighter background |
| **Active** | Solid orange background, white text/icon |

---

## Implementation

### Step 1: Option Item States

Update the CSS for `.generator-option-item`:

```css
/* Base state */
.generator-option-item {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-primary);
  border: 2px solid var(--color-border);
  transition: all 0.2s ease;
  position: relative;
}

/* Hover state */
.generator-option-item:hover {
  transform: scale(1.05);
  border-color: var(--color-brand-primary);
  box-shadow: 0 4px 20px rgba(255, 140, 0, 0.2);
  z-index: 10;
}

/* Selected state */
.generator-option-item.selected {
  border-color: var(--color-brand-primary);
  border-width: 3px;
  box-shadow:
    0 0 0 2px rgba(255, 140, 0, 0.3),
    0 4px 20px rgba(255, 140, 0, 0.3);
}

/* Selected checkmark badge */
.generator-option-item.selected::after {
  content: '';
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
  /* Checkmark using CSS */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  background-size: 14px;
  background-repeat: no-repeat;
  background-position: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Disabled state */
.generator-option-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

/* Focus state for accessibility */
.generator-option-item:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}
```

### Step 2: Category Tab States

Update the CSS for category tabs:

```css
/* Base state */
.generator-category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 9999px;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  background: var(--color-glass-bg);
  color: var(--color-text-muted);
  cursor: pointer;
  position: relative;
}

/* Icon styling */
.generator-category-tab svg {
  width: 18px;
  height: 18px;
  transition: all 0.2s ease;
}

/* Hover state */
.generator-category-tab:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

/* Active/selected state */
.generator-category-tab.active {
  background: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
  box-shadow: 0 2px 12px rgba(255, 140, 0, 0.4);
}

.generator-category-tab.active svg {
  color: white;
}

/* Notification dot for categories with new items (optional) */
.generator-category-tab .notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  border: 2px solid var(--color-bg-primary);
}

/* Desktop: larger tabs */
@media (min-width: 1024px) {
  .generator-category-tab {
    padding: 12px 20px;
    font-size: 15px;
  }

  .generator-category-tab svg {
    width: 20px;
    height: 20px;
  }
}
```

### Step 3: Action Button States

Update the action buttons with better feedback:

```css
/* Base action button */
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

/* Hover state */
.generator-action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Active/pressed state */
.generator-action-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Primary button (e.g., Download) */
.generator-action-btn.primary {
  background: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
}

.generator-action-btn.primary:hover {
  background: #ff9500;
  box-shadow: 0 4px 16px rgba(255, 140, 0, 0.4);
}

/* Toggled state (e.g., Favorite) */
.generator-action-btn.toggled {
  background: rgba(255, 140, 0, 0.15);
  color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
}

/* Disabled state */
.generator-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

### Step 4: Preview Canvas Border

Add a subtle glow to the preview when the character changes:

```css
/* Preview canvas container */
.generator-preview-canvas {
  border-radius: 16px;
  overflow: hidden;
  background: /* checkered pattern */
    repeating-conic-gradient(
      var(--color-bg-secondary) 0% 25%,
      var(--color-bg-primary) 0% 50%
    ) 50% / 20px 20px;
  border: 2px solid var(--color-border);
  transition: box-shadow 0.3s ease;
}

/* Glow effect when character updates */
.generator-preview-canvas.updated {
  box-shadow: 0 0 30px rgba(255, 140, 0, 0.3);
}
```

---

## React Implementation

### Option Item Component

```tsx
interface OptionItemProps {
  option: {
    id: string;
    thumbnail: string;
    name: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function OptionItem({ option, isSelected, onSelect }: OptionItemProps) {
  return (
    <button
      className={`generator-option-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(option.id)}
      aria-label={option.name}
      aria-pressed={isSelected}
    >
      <img
        src={option.thumbnail}
        alt={option.name}
        loading="lazy"
      />
    </button>
  );
}
```

### Category Tab Component

```tsx
interface CategoryTabProps {
  category: {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    hasNew?: boolean;
  };
  isActive: boolean;
  onSelect: (id: string) => void;
}

function CategoryTab({ category, isActive, onSelect }: CategoryTabProps) {
  const Icon = category.icon;

  return (
    <button
      className={`generator-category-tab ${isActive ? 'active' : ''}`}
      onClick={() => onSelect(category.id)}
      aria-selected={isActive}
      role="tab"
    >
      <Icon size={18} />
      <span>{category.label}</span>
      {category.hasNew && <span className="notification-dot" />}
    </button>
  );
}
```

### Preview Canvas with Update Effect

```tsx
function PreviewCanvas({ character, lastUpdate }) {
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    // Show glow briefly when character updates
    setShowGlow(true);
    const timer = setTimeout(() => setShowGlow(false), 500);
    return () => clearTimeout(timer);
  }, [lastUpdate]);

  return (
    <div className={`generator-preview-canvas ${showGlow ? 'updated' : ''}`}>
      {/* Character rendering */}
    </div>
  );
}
```

---

## Accessibility Considerations

1. **Keyboard Navigation**:
   - All options should be focusable with Tab key
   - Enter/Space should select an option
   - Arrow keys could navigate the grid

2. **Screen Reader Support**:
   - Use `aria-pressed` for toggle buttons
   - Use `aria-selected` for options
   - Use `role="tab"` and `role="tabpanel"` for categories

3. **Focus Visibility**:
   - Clear focus ring on all interactive elements
   - Don't rely solely on color for selected state

---

## Testing Checklist

After implementing, verify:

- [ ] **Hover on option**: Scales up slightly with orange border
- [ ] **Click option**: Orange border with glow, checkmark appears
- [ ] **Hover on category tab**: Background brightens
- [ ] **Click category tab**: Solid orange with white text
- [ ] **Hover on action button**: Lifts up with shadow
- [ ] **Keyboard navigation**: Can tab through all elements
- [ ] **Selected state visible**: Clear even without color (checkmark)
- [ ] **Mobile tap**: States work without hover (active states)

---

## Next Phase

Once selection states are complete, proceed to `03-PHASE3-animations.md` for microinteractions and polish.
