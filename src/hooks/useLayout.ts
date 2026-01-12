/**
 * useLayout Hook
 *
 * Access layout context from any component.
 */

import { useContext } from 'react';
import { LayoutContext, type LayoutContextValue } from '@/contexts/LayoutContext';

/**
 * Hook to access layout context
 *
 * @throws Error if used outside of LayoutProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, sidebarExpanded, contentPadding } = useLayout();
 *
 *   return (
 *     <div style={{ paddingLeft: isMobile ? 0 : contentPadding }}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useLayout(): LayoutContextValue {
  const context = useContext(LayoutContext);

  if (context === undefined) {
    throw new Error(
      'useLayout must be used within a LayoutProvider. ' +
        'Wrap your app in <LayoutProvider> to use this hook.'
    );
  }

  return context;
}

export default useLayout;
