# Fix: BigPulp Mobile Search Input Truncation

## Problem
On mobile devices, the BigPulp search input gets truncated on narrow viewports.

## Current Behavior
- Search input text gets cut off
- Input field may be too narrow
- Placeholder text might not fit

## Your Task

1. Find the BigPulp page and search component:
   - `src/pages/BigPulp.tsx`
   - `src/components/BigPulp/SearchInput.tsx`
   - Or similar

2. Make the search input responsive:

```tsx
<input
  type="text"
  placeholder="Search NFT #..."
  className="
    w-full                    /* Full width on mobile */
    px-4 py-3                 /* Adequate padding */
    text-base                 /* Readable text size */
    rounded-xl
    bg-gray-800/50
    border border-gray-700
    text-white
    placeholder:text-gray-500
    focus:outline-none
    focus:border-orange-500
  "
/>
```

3. If the search is in a container, ensure the container is responsive:

```tsx
<div className="w-full max-w-md mx-auto px-4 sm:px-0">
  <input ... />
</div>
```

4. Check if there's a button or icon taking up space:

```tsx
<div className="relative w-full">
  <input
    className="w-full pr-12"  /* Right padding for button */
    ...
  />
  <button className="absolute right-2 top-1/2 -translate-y-1/2">
    <SearchIcon />
  </button>
</div>
```

5. Use shorter placeholder text on mobile if needed:

```tsx
const isMobile = useMediaQuery('(max-width: 640px)');

<input
  placeholder={isMobile ? "NFT #..." : "Search for an NFT by number..."}
  ...
/>
```

## Files to Check
- `src/pages/BigPulp.tsx`
- `src/components/BigPulp/SearchInput.tsx`
- `src/components/BigPulp/BigPulpHeader.tsx`

## Success Criteria
- Search input fills available width on mobile
- Placeholder text is readable
- Input text doesn't get cut off when typing
- Works at 320px, 375px, 390px viewport widths
