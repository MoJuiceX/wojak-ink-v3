# FIX 17: Treasury Page Viewport-Fit Dashboard Layout

## OBJECTIVE
Make the Treasury page fit within the viewport on desktop screens without requiring page-level scrolling. Implement modern CSS best practices for dashboard layouts.

## PROBLEM ANALYSIS
The Treasury page currently scrolls on desktop because:
1. `.treasury-page` has no viewport height constraint
2. Grid children grow to content size instead of using available space
3. No internal scrolling for panels with overflow content

## CURRENT STRUCTURE
```
Treasury Page (3-column grid on desktop):
├── Left Column (stacked):
│   ├── PortfolioValueCard (total value display)
│   ├── OtherTokensCard (CAT token list) ← This can overflow
│   └── WalletAddressCard (wallet address)
├── Center Column:
│   └── CryptoBubbles (interactive NFT visualization)
└── Right Column:
    └── NFTCollections (collection grid) ← Already has internal scroll
```

## KNOWN CONSTANTS
- Desktop header height: 64px (from `src/config/layout.ts`)
- Mobile header height: 56px
- Sidebar width: 56px (icon-only mode)

---

## IMPLEMENTATION STEPS

### Step 1: Add Viewport Height Constraint to Treasury.css

In `src/pages/Treasury.css`, update `.treasury-page`:

```css
.treasury-page {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /* ADD THESE for viewport-fit on desktop */
  /* Will be overridden by media query for mobile */
}

/* ADD this new media query for desktop viewport constraint */
@media (min-width: 1024px) {
  .treasury-page {
    /* Constrain to viewport height minus header */
    height: calc(100vh - 64px);
    height: calc(100dvh - 64px); /* Modern browsers - handles mobile browser UI */
    max-height: calc(100vh - 64px);
    max-height: calc(100dvh - 64px);
    overflow: hidden; /* Prevent page scroll - panels scroll internally */
  }
}
```

### Step 2: Update Grid to Fill Available Height

In the desktop grid section of `src/pages/Treasury.css`, update:

```css
@media (min-width: 1024px) {
  .treasury-grid {
    display: grid;
    grid-template-columns: 280px 1fr 300px;
    grid-template-rows: auto 1fr auto;
    gap: 20px;
    height: 100%; /* ADD: Fill parent height */
    min-height: 0; /* ADD: Critical - allows grid to shrink */
    overflow: hidden;
  }

  .treasury-other-tokens {
    grid-column: 1;
    grid-row: 2;
    order: unset;
    display: flex;
    flex-direction: column;
    min-height: 0; /* ADD: Critical - allows flex child to shrink */
    overflow: hidden; /* ADD: Contain overflow */
  }

  .treasury-bubbles {
    grid-column: 2;
    grid-row: 1 / 4;
    order: unset;
    min-height: unset;
    display: flex;
    flex-direction: column;
    min-height: 0; /* ADD: Allow shrinking */
  }

  .treasury-nft {
    grid-column: 3;
    grid-row: 1 / 4;
    order: unset;
    position: relative;
    overflow: hidden;
    height: unset;
    max-height: unset;
    min-height: 0;
  }
}
```

### Step 3: Add Internal Scrolling to OtherTokensCard

In `src/components/treasury/OtherTokensCard.tsx`, update the component structure:

The outer container should allow internal scrolling:

```tsx
// Change the outer motion.div to:
<motion.div
  className="rounded-2xl overflow-hidden flex-1 flex flex-col min-h-0"
  style={{
    background: 'var(--color-glass-bg)',
    border: '1px solid var(--color-border)',
  }}
  // ... rest of props
>
  {/* Make the inner content area scrollable */}
  <div className="p-3 flex-1 overflow-y-auto min-h-0">
    <div className="flex flex-col gap-1.5"> {/* Reduced gap from gap-2 */}
      {/* ... token items */}
    </div>
  </div>
</motion.div>
```

Key changes:
1. Add `flex flex-col min-h-0` to outer container
2. Add `flex-1 overflow-y-auto min-h-0` to the scrollable content wrapper
3. Optionally reduce `gap-2` to `gap-1.5` for tighter spacing

### Step 4: Reduce Token Row Padding (Optional - if still too tall)

In `OtherTokensCard.tsx`, the token rows have `py-2.5` padding. If content still doesn't fit:

```tsx
// Change from:
className="flex items-center gap-3 px-3 py-2.5 rounded-lg"

// To:
className="flex items-center gap-3 px-3 py-2 rounded-lg"
```

### Step 5: Ensure NFTCollections Works Correctly

The NFTCollections component already uses `absolute inset-0` positioning which should work with the parent container. Verify:

In `src/components/treasury/NFTCollections.tsx`:
- The outer div has `className="... absolute inset-0"`
- The scrollable area has `className="p-4 flex-1 overflow-y-auto"`
- Has `style={{ minHeight: 0 }}` on the scrollable area

If `minHeight: 0` is missing from the scrollable div, add it.

---

## RESPONSIVE BREAKPOINTS TO TEST

| Viewport | Expected Behavior |
|----------|------------------|
| 1920x1080 | No page scroll, comfortable spacing |
| 1440x900 | No page scroll, normal spacing |
| 1280x800 | No page scroll, compact spacing, tokens may scroll internally |
| 1024x768 | No page scroll, tight but usable, internal scrolling likely |
| < 1024px (mobile) | Page SHOULD scroll - vertical stack layout |

---

## TESTING CHECKLIST

After implementation, verify:

- [ ] **1920x1080**: Page fits viewport, no scrollbar on body
- [ ] **1280x800**: Page fits viewport, token list scrolls internally if needed
- [ ] **1024x768**: Page fits viewport, both panels may scroll internally
- [ ] **Mobile (375px)**: Page scrolls normally, vertical layout preserved
- [ ] Token list shows scrollbar when content overflows
- [ ] NFT collections shows scrollbar when many collections
- [ ] Bubble visualization remains fully visible and interactive
- [ ] No content is clipped or inaccessible
- [ ] Wallet address card stays visible at bottom of left column

---

## FILES TO MODIFY

1. `src/pages/Treasury.css` - Main layout changes
2. `src/components/treasury/OtherTokensCard.tsx` - Internal scrolling for token list

---

## DO NOT CHANGE

- Mobile layout (< 1024px) - keep vertical stacking with page scroll
- The order of elements on mobile
- CryptoBubbles component internal behavior
- NFTCollections component (it already handles internal scrolling)

---

## TECHNICAL NOTES

### Why `min-height: 0`?
In CSS Grid and Flexbox, children have an implicit `min-height: auto` which prevents them from shrinking below their content size. Setting `min-height: 0` allows children to shrink and enables `overflow: auto` to work correctly.

### Why `100dvh` instead of `100vh`?
On mobile browsers, `100vh` includes the area behind the address bar, causing content to be cut off. `100dvh` (dynamic viewport height) adjusts for the actual visible area. We include both for fallback support.

### Why internal scrolling?
Dashboard layouts should keep navigation and key information visible while allowing data-heavy sections to scroll independently. This is a standard UX pattern for financial dashboards.
