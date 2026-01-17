# Fix: Gallery Mobile Slow Initial Load

## Problem
On mobile devices, the Gallery page shows a 3-5 second black screen before content appears.

## Current Behavior
- Desktop loads quickly
- Mobile shows extended black screen
- No loading indicator during wait

## Your Task

1. Find the Gallery page at `src/pages/Gallery.tsx`

2. Check if there's a Suspense fallback for the Gallery route in `src/App.tsx`:
```tsx
<Route path="gallery" element={
  <Suspense fallback={<GallerySkeleton />}>
    <Gallery />
  </Suspense>
} />
```

3. Create or improve the skeleton component. Add `src/components/skeletons/GallerySkeleton.tsx`:

```tsx
import React from 'react';

export const GallerySkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-700/50 rounded animate-pulse mb-6" />

      {/* Character type cards skeleton */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-20 h-24 bg-gray-700/50 rounded-lg animate-pulse flex-shrink-0"
          />
        ))}
      </div>

      {/* NFT grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gray-700/50 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
```

4. Update the Gallery route in `src/App.tsx` to use the skeleton:

```tsx
import { GallerySkeleton } from './components/skeletons/GallerySkeleton';

<Route path="gallery" element={
  <Suspense fallback={<GallerySkeleton />}>
    <Gallery />
  </Suspense>
} />
```

5. If Gallery fetches data, add a loading state inside the component too:

```tsx
const Gallery: React.FC = () => {
  const { data, isLoading } = useNFTData();

  if (isLoading) {
    return <GallerySkeleton />;
  }

  // ... rest of component
};
```

## Files to Create/Modify
- Create: `src/components/skeletons/GallerySkeleton.tsx`
- Modify: `src/App.tsx` (update Suspense fallback)
- Optionally modify: `src/pages/Gallery.tsx` (add loading state)

## Success Criteria
- Mobile shows skeleton animation immediately
- No black screen during load
- Smooth transition when content appears
