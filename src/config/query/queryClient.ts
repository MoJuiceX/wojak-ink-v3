/**
 * QueryClient Configuration
 *
 * Global TanStack Query configuration with:
 * - Smart retry logic (don't retry 4xx errors)
 * - Exponential backoff with jitter
 * - Global error handling
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

// Custom retry logic
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry more than 3 times
  if (failureCount >= 3) return false;

  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;

    // Rate limited (429) - don't retry immediately, wait for next scheduled fetch
    if (status === 429) return false;

    // Don't retry other client errors (4xx) except rate limiting
    if (status && status >= 400 && status < 500) return false;
  }

  // Don't retry not found
  if (error instanceof Error && error.message.includes('not found')) {
    return false;
  }

  return true;
};

// Exponential backoff with jitter
const retryDelay = (attemptIndex: number): number => {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(2, attemptIndex),
    maxDelay
  );

  // Add jitter (±20%)
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
  return exponentialDelay + jitter;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Check if rate limited - silently skip, will retry on next interval
      const status = (error as Error & { status?: number }).status;
      if (status === 429) {
        // Rate limited - previous data will be kept, next fetch will try again
        return;
      }

      // Only log errors for queries that have already been cached
      // (prevents showing error on initial load)
      if (query.state.data !== undefined) {
        console.error('Background update failed:', error.message);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation failed:', error.message);
    },
  }),
});
