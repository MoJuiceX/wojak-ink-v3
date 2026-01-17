# Fix: Add Error Boundaries to Catch Silent Failures

## Problem
Multiple pages fail silently with black screens. There are no Error Boundaries to catch and display errors.

## Why This Matters
Without Error Boundaries, React errors cause entire component trees to unmount silently, showing nothing instead of a helpful error message.

## Your Task

1. Create an ErrorBoundary component at `src/components/ErrorBoundary.tsx`:

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'white',
          backgroundColor: '#1a1a2e'
        }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#ff6b6b' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#f97316',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. Wrap all lazy-loaded routes in `src/App.tsx` with ErrorBoundary:

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

// For each route:
<Route path="leaderboard" element={
  <ErrorBoundary>
    <Suspense fallback={<PageSkeleton type="leaderboard" />}>
      <Leaderboard />
    </Suspense>
  </ErrorBoundary>
} />
```

3. Add a top-level ErrorBoundary around the entire app in `src/main.tsx`:

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

## Files to Create/Modify
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx` (wrap routes)
- Modify: `src/main.tsx` (wrap app)

## Success Criteria
- Errors show user-friendly message instead of black screen
- Error details logged to console
- Reload button allows recovery
