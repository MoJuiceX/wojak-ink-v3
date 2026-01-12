/**
 * useGallery Hook
 *
 * Access gallery context from any component.
 */

import { useContext } from 'react';
import { GalleryContext, type GalleryContextValue } from '@/contexts/GalleryContext';

/**
 * Hook to access gallery context
 *
 * @throws Error if used outside of GalleryProvider
 */
export function useGallery(): GalleryContextValue {
  const context = useContext(GalleryContext);

  if (context === undefined) {
    throw new Error(
      'useGallery must be used within a GalleryProvider. ' +
        'Wrap your Gallery page in <GalleryProvider> to use this hook.'
    );
  }

  return context;
}

/**
 * Optional hook that returns null if used outside GalleryProvider
 * Useful for components that may render outside gallery context
 */
export function useGalleryOptional(): GalleryContextValue | null {
  const context = useContext(GalleryContext);
  return context ?? null;
}

export default useGallery;
