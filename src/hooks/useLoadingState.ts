/**
 * useLoadingState
 *
 * Hook for managing async data loading with loading, error, and data states.
 * Provides a cleaner alternative to manual useState management.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DependencyList } from 'react';

interface LoadingState<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

interface UseLoadingStateReturn<T> extends LoadingState<T> {
  /** Manually trigger a reload */
  reload: () => void;
  /** Reset state to initial */
  reset: () => void;
}

/**
 * Hook for async data fetching with loading/error states
 *
 * @param asyncFn - Async function that returns data
 * @param deps - Dependencies that trigger refetch when changed
 * @param options - Configuration options
 */
export function useLoadingState<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = [],
  options: {
    /** Initial data value */
    initialData?: T | null;
    /** Skip initial fetch */
    skip?: boolean;
    /** Callback on success */
    onSuccess?: (data: T) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
  } = {}
): UseLoadingStateReturn<T> {
  const { initialData = null, skip = false, onSuccess, onError } = options;

  const [state, setState] = useState<LoadingState<T>>({
    isLoading: !skip,
    error: null,
    data: initialData,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const data = await asyncFn();
      setState({ isLoading: false, error: null, data });
      onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState((s) => ({ ...s, isLoading: false, error }));
      onError?.(error);
    }
  }, [asyncFn, onSuccess, onError]);

  const reload = useCallback(() => {
    load();
  }, [load]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: initialData,
    });
  }, [initialData]);

  useEffect(() => {
    if (!skip) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    ...state,
    reload,
    reset,
  };
}

/**
 * Simpler version that just tracks loading state for an action
 */
export function useActionLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { isLoading, error, execute, reset };
}

export default useLoadingState;
