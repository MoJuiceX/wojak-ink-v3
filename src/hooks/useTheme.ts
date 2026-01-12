/**
 * useTheme Hook
 *
 * Custom hook for accessing the theme context from any component.
 * Provides type-safe access to theme state and actions.
 */

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import type { ThemeContextValue } from '@/types/theme';

/**
 * Hook to access theme context
 *
 * @throws Error if used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, isDark } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme('dark')}>
 *       Current: {theme.name}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
        'Wrap your app in <ThemeProvider> to use this hook.'
    );
  }

  return context;
}

export default useTheme;
