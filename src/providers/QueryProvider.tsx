/**
 * Query Provider
 *
 * Wraps application with TanStack Query context.
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/query/queryClient';
import type { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
