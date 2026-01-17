# Fix: Mobile Header Text Overlap in Gallery

## Problem
On mobile devices, the Gallery page header has text overlap or truncation issues with character type names.

## Current Behavior
- Character type names get cut off or overlap on narrow screens
- Makes it hard to read which type is selected

## Your Task

1. Find the Gallery header component. Check:
   - `src/pages/Gallery.tsx`
   - `src/components/Gallery/GalleryHeader.tsx`
   - Any component rendering the character type selector

2. Look for the character type name display and add proper truncation:

```tsx
// Find the element displaying character type names and add:
<span className="truncate max-w-[100px] sm:max-w-[150px]">
  {characterType.name}
</span>
```

3. If it's a horizontal scrollable list, ensure it has proper overflow handling:

```tsx
<div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
  {characterTypes.map((type) => (
    <button
      key={type.id}
      className="flex-shrink-0 px-3 py-2 rounded-lg whitespace-nowrap"
    >
      {type.name}
    </button>
  ))}
</div>
```

4. Add responsive text sizing:

```tsx
<h2 className="text-lg sm:text-xl md:text-2xl truncate">
  {selectedType?.name || 'All Characters'}
</h2>
```

5. Test at viewport widths: 320px, 375px, 390px, 414px

## Files to Check
- `src/pages/Gallery.tsx`
- `src/components/Gallery/GalleryHeader.tsx`
- `src/components/Gallery/CharacterTypeSelector.tsx` (if exists)

## CSS Classes to Use
- `truncate` - adds ellipsis for overflow
- `whitespace-nowrap` - prevents text wrapping
- `overflow-x-auto` - allows horizontal scroll
- `flex-shrink-0` - prevents flex items from shrinking
- `scrollbar-hide` - hides scrollbar (if available)

## Success Criteria
- No text overlap on mobile
- Character type names readable (truncated with ellipsis if needed)
- Horizontal scroll works for many character types
