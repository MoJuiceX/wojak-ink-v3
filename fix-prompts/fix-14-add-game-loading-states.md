# Fix: Add Loading States for Game Pages

## Problem
Game pages show black screen during load. Even after fixing the React hooks error, games need proper loading states.

## Your Task

1. Create a game loading component at `src/components/games/GameLoading.tsx`:

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface GameLoadingProps {
  gameName?: string;
}

export const GameLoading: React.FC<GameLoadingProps> = ({ gameName }) => {
  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center">
      {/* Bouncing orange animation */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-6xl mb-6"
      >
        🍊
      </motion.div>

      <h2 className="text-xl text-white mb-2">
        {gameName ? `Loading ${gameName}...` : 'Loading Game...'}
      </h2>

      <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-orange-500 rounded-full"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: '50%' }}
        />
      </div>

      <p className="text-gray-500 mt-4 text-sm">
        Preparing your game experience...
      </p>
    </div>
  );
};
```

2. Update game routes in `src/App.tsx` to use the loading component:

```tsx
import { GameLoading } from './components/games/GameLoading';

// For each game route:
<Route path="games/orange-stack" element={
  <Suspense fallback={<GameLoading gameName="Orange Stack" />}>
    <OrangeStack />
  </Suspense>
} />

<Route path="games/memory-match" element={
  <Suspense fallback={<GameLoading gameName="Memory Match" />}>
    <MemoryMatch />
  </Suspense>
} />

// ... repeat for all games
```

3. If games have internal loading (fetching high scores, etc.), use the component there too:

```tsx
const OrangeStack: React.FC = () => {
  const { isLoading } = useHighScores();

  if (isLoading) {
    return <GameLoading gameName="Orange Stack" />;
  }

  return (
    // Game content
  );
};
```

## Files to Create/Modify
- Create: `src/components/games/GameLoading.tsx`
- Modify: `src/App.tsx` (update all game route Suspense fallbacks)

## Success Criteria
- Games show loading animation during load
- Loading state includes game name
- Smooth transition to game content
- No black screens during game load
