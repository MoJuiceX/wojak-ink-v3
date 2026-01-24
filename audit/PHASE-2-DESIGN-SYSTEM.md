# Phase 2: Design System Integration

**Goal:** Make all games use the centralized theme system for visual consistency.

**Time Estimate:** 1 hour

---

## The Problem

Your `index.css` has a beautiful design system:
```css
--color-tang-500: #ff6b00;
--color-bg-primary: #0a0a0f;
--gradient-accent: linear-gradient(135deg, var(--color-tang-500), var(--color-neon-500));
```

But games hardcode colors:
```css
/* BlockPuzzle.css line 14 */
background: linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, #0f0f1a 100%);

/* Should be: */
background: var(--gradient-game-bg);
```

---

## Task 2.1: Add Game-Specific CSS Variables

**Edit file:** `/src/index.css`

Add after line 188 (after `:root {`):

```css
  /* ----------------------------------------
     GAME-SPECIFIC VARIABLES
     ---------------------------------------- */

  /* Game backgrounds */
  --gradient-game-bg: linear-gradient(180deg,
    var(--color-bg-primary) 0%,
    var(--color-bg-secondary) 50%,
    var(--color-bg-primary) 100%
  );

  /* Game ambient glows */
  --color-tang-500-10: rgba(255, 107, 0, 0.1);
  --color-tang-500-20: rgba(255, 107, 0, 0.2);
  --color-tang-500-30: rgba(255, 107, 0, 0.3);

  /* Game UI colors */
  --game-btn-bg: rgba(0, 0, 0, 0.5);
  --game-btn-border: rgba(255, 255, 255, 0.2);
  --game-btn-hover-bg: var(--color-tang-500-30);
  --game-btn-hover-border: var(--color-tang-500);

  /* Score/combo colors */
  --game-score-color: var(--color-tang-400);
  --game-combo-color: var(--color-neon-500);
  --game-perfect-color: #ffd700;

  /* Danger states */
  --game-danger-low: var(--color-tang-500);
  --game-danger-medium: #ff4444;
  --game-danger-high: #ff0000;
```

---

## Task 2.2: Update BlockPuzzle.css

**File:** `/src/pages/BlockPuzzle.css`

**Replace hardcoded colors with CSS variables:**

Line 13-16, replace:
```css
background:
  radial-gradient(ellipse at 30% 20%, rgba(255, 100, 0, 0.06) 0%, transparent 50%),
  radial-gradient(ellipse at 70% 80%, rgba(100, 50, 255, 0.04) 0%, transparent 50%),
  linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 50%, #0f0f1a 100%);
```

With:
```css
background:
  radial-gradient(ellipse at 30% 20%, var(--color-tang-500-10) 0%, transparent 50%),
  radial-gradient(ellipse at 70% 80%, rgba(100, 50, 255, 0.04) 0%, transparent 50%),
  var(--gradient-game-bg);
```

Line 30, replace:
```css
background: radial-gradient(circle at 50% 50%, rgba(255, 107, 0, 0.02) 0%, transparent 60%);
```

With:
```css
background: radial-gradient(circle at 50% 50%, var(--color-tang-500-10) 0%, transparent 60%);
```

Lines 62-63, replace:
```css
background: rgba(0, 0, 0, 0.5);
border: 1px solid rgba(255, 255, 255, 0.2);
```

With:
```css
background: var(--game-btn-bg);
border: 1px solid var(--game-btn-border);
```

Lines 96-97, replace:
```css
background: rgba(255, 107, 0, 0.3);
border-color: rgba(255, 107, 0, 0.5);
```

With:
```css
background: var(--game-btn-hover-bg);
border-color: var(--game-btn-hover-border);
```

---

## Task 2.3: Update BrickByBrick Styles

**Search for hardcoded colors:**
```bash
grep -n "#ff\|#0d\|#1a\|rgba(255" src/pages/BrickByBrick.tsx | head -20
```

**Replace inline styles in JSX:**

Find patterns like:
```typescript
style={{ background: 'linear-gradient(135deg, #ff7b00, #e65c00)' }}
```

Replace with:
```typescript
style={{ background: 'linear-gradient(135deg, var(--color-tang-500), var(--color-tang-600))' }}
```

Or better, use className and CSS:
```typescript
className="game-block-primary"
```

---

## Task 2.4: Create Game Color Classes

**Create file:** `/src/styles/game-colors.css`

```css
/* Reusable game color classes using CSS variables */

/* Block/piece gradients */
.game-gradient-orange {
  background: linear-gradient(135deg, var(--color-tang-500), var(--color-tang-600));
}
.game-gradient-green {
  background: linear-gradient(135deg, var(--color-chia-500), var(--color-chia-600));
}
.game-gradient-purple {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
}
.game-gradient-blue {
  background: linear-gradient(135deg, var(--color-cyber-500), var(--color-cyber-600));
}
.game-gradient-pink {
  background: linear-gradient(135deg, var(--color-neon-500), var(--color-neon-600));
}
.game-gradient-gold {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

/* Text colors */
.game-text-score { color: var(--game-score-color); }
.game-text-combo { color: var(--game-combo-color); }
.game-text-perfect { color: var(--game-perfect-color); }

/* Glow effects */
.game-glow-orange {
  box-shadow: 0 0 20px var(--color-tang-500-30);
}
.game-glow-intense {
  box-shadow: 0 0 30px var(--color-tang-500), 0 0 60px var(--color-tang-500-30);
}

/* Danger indicators */
.game-danger-warning { border-color: var(--game-danger-low); }
.game-danger-critical { border-color: var(--game-danger-medium); }
.game-danger-imminent { border-color: var(--game-danger-high); }
```

**Import in index.css:**
```css
@import './styles/game-colors.css';
```

---

## Task 2.5: Update BlockPuzzle.tsx Inline Colors

**File:** `/src/pages/BlockPuzzle.tsx`

**Search for inline color definitions:**
```bash
grep -n "linear-gradient\|#ff\|#00\|rgba" src/pages/BlockPuzzle.tsx | head -30
```

**Lines 54-61, BLOCK_COLORS array:**
```typescript
const BLOCK_COLORS = [
  'linear-gradient(135deg, #ff7b00, #e65c00)',  // Orange
  'linear-gradient(135deg, #00d68f, #00b377)',  // Green
  'linear-gradient(135deg, #a855f7, #7c3aed)',  // Purple
  'linear-gradient(135deg, #3b82f6, #2563eb)',  // Blue
  'linear-gradient(135deg, #f43f5e, #e11d48)',  // Pink
  'linear-gradient(135deg, #fbbf24, #f59e0b)',  // Gold
];
```

**Move to CSS classes and use classNames instead:**
```typescript
const BLOCK_COLOR_CLASSES = [
  'game-gradient-orange',
  'game-gradient-green',
  'game-gradient-purple',
  'game-gradient-blue',
  'game-gradient-pink',
  'game-gradient-gold',
];
```

Then update block rendering to use `className={BLOCK_COLOR_CLASSES[colorIndex]}` instead of inline styles.

---

## Task 2.6: Update FlappyOrange Colors

**Search for hardcoded colors:**
```bash
grep -n "#ff\|#00\|rgba(255" src/pages/FlappyOrange.tsx | head -30
```

**Common replacements:**
- `#ff6b00` → `var(--color-tang-500)`
- `#ff7b00` → `var(--color-tang-400)`
- `#e65c00` → `var(--color-tang-600)`
- `#0a0a0f` → `var(--color-bg-primary)`
- `#1a1a2e` → `var(--color-bg-secondary)`

---

## Task 2.7: Update All Game Control Buttons

**Problem:** Each game has its own button styles.

**Search for button patterns:**
```bash
grep -n "bp-back-btn\|back-btn\|pause-btn\|sound-btn" src/pages/*.tsx src/pages/*.css
```

**All games should use the GameButton component from Task 1.2:**

Replace:
```tsx
<button className="bp-back-btn" onClick={handleBack}>
  <IonIcon icon={arrowBack} />
</button>
```

With:
```tsx
import { GameButton } from '@/components/ui/GameButton';

<GameButton variant="ghost" size="icon" onClick={handleBack} aria-label="Back">
  <IonIcon icon={arrowBack} />
</GameButton>
```

---

## Task 2.8: Verify Theme Switching Affects Games

**Test procedure:**

1. Open a game (e.g., Block Puzzle)
2. Open browser DevTools
3. Change theme: `document.documentElement.setAttribute('data-theme', 'tang-orange')`
4. Verify game colors update

**If colors don't update:** Game is using hardcoded values that need to be replaced with CSS variables.

---

## Task 2.9: Create Game Typography Classes

**Add to game-colors.css:**

```css
/* Game typography */
.game-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--color-text-primary);
  text-shadow: 0 0 20px var(--color-tang-500-30);
}

.game-score {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: clamp(1.25rem, 3vw, 2rem);
  color: var(--game-score-color);
}

.game-score-large {
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.game-combo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--game-combo-color);
  text-shadow: 0 0 20px var(--game-combo-color);
}

.game-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Verification After Phase 2

**Visual consistency check:**

1. Open each game side by side (in separate tabs)
2. Compare:
   - [ ] Background gradients look similar
   - [ ] Button styles are identical
   - [ ] Score text uses same color
   - [ ] Combo effects use same color
   - [ ] Glow effects are consistent

**Theme test:**

1. For each game:
   - [ ] Load game
   - [ ] Switch to 'tang-orange' theme
   - [ ] Verify colors update
   - [ ] Switch to 'dark' theme
   - [ ] Verify colors update

**Build check:**
```bash
npm run build
```

**Checklist:**
- [ ] Game CSS variables added to index.css
- [ ] BlockPuzzle.css uses CSS variables
- [ ] game-colors.css created
- [ ] Block colors use CSS classes
- [ ] All games use GameButton component
- [ ] Theme switching affects all games
- [ ] Typography classes created
- [ ] All games visually consistent
