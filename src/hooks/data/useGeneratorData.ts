/**
 * Generator Data Hooks
 *
 * TanStack Query hooks for generator layer data.
 */

import { useQuery } from '@tanstack/react-query';
import { generatorService } from '@/services/generatorService';
import { CACHE_CONFIG } from '@/config/query/cacheConfig';
import type { UILayerName } from '@/lib/wojakRules';

// Query keys
export const generatorKeys = {
  all: ['generator'] as const,
  layers: () => [...generatorKeys.all, 'layers'] as const,
  allTraits: () => [...generatorKeys.layers(), 'all'] as const,
  layerImages: (layer: UILayerName) => [...generatorKeys.layers(), 'images', layer] as const,
} as const;

/**
 * Fetch all traits (all layers)
 */
export function useAllTraits() {
  return useQuery({
    queryKey: generatorKeys.allTraits(),
    queryFn: () => generatorService.getAllTraits(),
    ...CACHE_CONFIG.static, // Trait data doesn't change
  });
}

/**
 * Fetch images for a specific layer
 */
export function useLayerImages(layer: UILayerName) {
  return useQuery({
    queryKey: generatorKeys.layerImages(layer),
    queryFn: () => generatorService.getLayerImages(layer),
    ...CACHE_CONFIG.static,
  });
}

/**
 * Fetch image counts per layer
 */
export function useTraitCounts() {
  const allTraits = useAllTraits();

  // Derive counts from all traits
  const counts: Record<UILayerName, number> = {
    Background: 0,
    Base: 0,
    Clothes: 0,
    FacialHair: 0,
    MouthBase: 0,
    MouthItem: 0,
    Mask: 0,
    Eyes: 0,
    Head: 0,
  };

  if (allTraits.data) {
    for (const trait of allTraits.data) {
      // Convert lowercase layer type to UILayerName
      const layerMap: Record<string, UILayerName> = {
        background: 'Background',
        base: 'Base',
        clothes: 'Clothes',
        facialhair: 'FacialHair',
        mouthbase: 'MouthBase',
        mouthitem: 'MouthItem',
        mask: 'Mask',
        eyes: 'Eyes',
        head: 'Head',
      };
      const layerName = layerMap[trait.layer];
      if (layerName && layerName in counts) {
        counts[layerName]++;
      }
    }
  }

  return {
    data: counts,
    isLoading: allTraits.isLoading,
    error: allTraits.error,
  };
}

/**
 * Hook to prefetch layer data
 */
export function usePrefetchLayers() {
  return useQuery({
    queryKey: ['generator', 'prefetch'],
    queryFn: () => generatorService.prefetchLayers(),
    ...CACHE_CONFIG.static,
  });
}
