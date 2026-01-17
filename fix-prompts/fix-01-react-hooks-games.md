# Fix: React Hooks Error Breaking All Games

## Problem
All 15 mini-games crash with a React hooks error when loaded. The error occurs in `useGameSounds.ts`.

## Error Message
```
TypeError: Cannot read properties of null (reading 'useRef')
    at exports.useRef (chunk-BUAIWO5B.js:956:35)
    at useGameSounds (useGameSounds.ts:380:27)
```

## Root Cause
This error typically means there are multiple React versions bundled, causing the React dispatcher to be null when hooks are called.

## Your Task

1. First, check for duplicate React versions:
```bash
bun pm ls react
```

2. If duplicates found, update `vite.config.ts` to add explicit React aliases:
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  },
  // ... rest of config
});
```

3. If no duplicates, check `src/hooks/useGameSounds.ts` for:
   - Any conditional hook calls (hooks must be called unconditionally)
   - Any hooks called inside callbacks or loops
   - Ensure `useRef`, `useCallback`, `useEffect` are imported from 'react'

4. Clear cache and rebuild:
```bash
rm -rf node_modules/.vite
bun run dev
```

5. Test by navigating to `/games/orange-stack` and verify the game loads

## Files to Check
- `vite.config.ts`
- `src/hooks/useGameSounds.ts`
- `package.json` (check for conflicting React dependencies)

## Success Criteria
- Games load without black screen
- No React hooks errors in console
- At least one game (Orange Stack) is playable
