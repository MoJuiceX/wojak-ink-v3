# Fix: Landing Page Renders Black

## Problem
The landing page at `/landing` renders completely black with no visible content.

## Current Behavior
- Page loads but shows only black screen
- No JavaScript errors in console
- All Landing component files exist

## Suspected Cause
The `isStartupComplete` state in `App.tsx` may be blocking render, or there's a CSS visibility issue.

## Your Task

1. Check `src/App.tsx` around line 125 for the landing route and any conditional rendering:
```tsx
// Look for patterns like:
{isStartupComplete && <Landing />}
// or visibility CSS
```

2. If there's a startup check, ensure the Landing page either:
   - Bypasses the startup check, OR
   - The startup sequence completes properly

3. Check `src/pages/Landing.tsx` for:
   - Any CSS that might hide content (opacity: 0, visibility: hidden)
   - Any animation that starts invisible and never completes
   - useScroll or framer-motion hooks that might fail silently

4. Check the CSS in Landing.tsx and its sub-components:
   - `src/pages/Landing/HeroSection.tsx`
   - `src/pages/Landing/FeatureSection.tsx`
   - Look for `opacity`, `visibility`, or `display: none` styles

5. Add a simple test element to Landing.tsx to verify rendering:
```tsx
return (
  <div>
    <h1 style={{color: 'white', fontSize: '48px'}}>LANDING TEST</h1>
    {/* rest of component */}
  </div>
);
```

## Files to Check
- `src/App.tsx` (lines 120-160)
- `src/pages/Landing.tsx`
- `src/pages/Landing/*.tsx` (sub-components)

## Success Criteria
- Landing page shows content when visiting `/landing`
- Hero section with animations visible
- All sections render properly
