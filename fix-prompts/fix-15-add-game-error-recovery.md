# Fix: Add Game Error Recovery UI

## Problem
When games crash, users see a black screen with no way to recover. Need a friendly error UI with recovery options.

## Your Task

1. Create a game-specific error component at `src/components/games/GameError.tsx`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameErrorProps {
  gameName?: string;
  error?: Error;
  onRetry?: () => void;
}

export const GameError: React.FC<GameErrorProps> = ({
  gameName,
  error,
  onRetry
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center p-6">
      {/* Sad orange emoji */}
      <div className="text-6xl mb-6">😔🍊</div>

      <h2 className="text-2xl text-white mb-2 text-center">
        {gameName ? `${gameName} couldn't load` : 'Game Error'}
      </h2>

      <p className="text-gray-400 mb-6 text-center max-w-md">
        Something went wrong while loading the game.
        Don't worry, your progress is safe!
      </p>

      {/* Error details (collapsed by default in production) */}
      {error && process.env.NODE_ENV === 'development' && (
        <details className="mb-6 p-4 bg-red-900/20 rounded-lg max-w-md w-full">
          <summary className="text-red-400 cursor-pointer">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs text-red-300 overflow-x-auto">
            {error.message}
          </pre>
        </details>
      )}

      <div className="flex gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        )}

        <button
          onClick={() => navigate('/games')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
        >
          Back to Games
        </button>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 text-gray-500 hover:text-gray-400 text-sm underline"
      >
        Reload Page
      </button>
    </div>
  );
};
```

2. Create a GameErrorBoundary that uses this UI at `src/components/games/GameErrorBoundary.tsx`:

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GameError } from './GameError';

interface Props {
  children: ReactNode;
  gameName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game error:', error, errorInfo);
    // Could send to error tracking service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <GameError
          gameName={this.props.gameName}
          error={this.state.error || undefined}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
```

3. Wrap all game routes with GameErrorBoundary in `src/App.tsx`:

```tsx
import { GameErrorBoundary } from './components/games/GameErrorBoundary';
import { GameLoading } from './components/games/GameLoading';

<Route path="games/orange-stack" element={
  <GameErrorBoundary gameName="Orange Stack">
    <Suspense fallback={<GameLoading gameName="Orange Stack" />}>
      <OrangeStack />
    </Suspense>
  </GameErrorBoundary>
} />
```

## Files to Create
- `src/components/games/GameError.tsx`
- `src/components/games/GameErrorBoundary.tsx`

## Files to Modify
- `src/App.tsx` (wrap game routes)

## Success Criteria
- Game crashes show friendly error UI
- "Try Again" button attempts to reload game
- "Back to Games" returns to games list
- Error details visible in development mode
