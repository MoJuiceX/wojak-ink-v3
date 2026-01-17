# Fix: Guild Page Not Rendering

## Problem
The Guild page at `/guild` shows a black screen with no content.

## Current Behavior
- Page loads but nothing renders
- No JavaScript errors in console
- Silent failure

## Your Task

1. Check the route definition in `src/App.tsx` for the guild route

2. Find and examine `src/pages/Guild.tsx`:
   - Check for missing imports
   - Check for context dependencies
   - Look for authentication requirements that might block render

3. Add console logging to debug:
```tsx
const Guild: React.FC = () => {
  console.log('Guild component rendering');

  useEffect(() => {
    console.log('Guild mounted');
  }, []);

  // ... rest
};
```

4. Check if Guild requires authentication:
   - Look for `useAuth` or similar hooks
   - Check if it redirects when not authenticated
   - See if there's a loading state that never resolves

5. Temporarily simplify to test:
```tsx
const Guild: React.FC = () => {
  return (
    <div style={{color: 'white', padding: '20px'}}>
      <h1>Guild Page Test</h1>
    </div>
  );
};
```

## Files to Check
- `src/App.tsx` (route definition)
- `src/pages/Guild.tsx`
- Any guild-related contexts

## Success Criteria
- Guild page renders content
- Guild info or join prompt displays
- No silent failures
