/**
 * Trait Data Hooks
 *
 * Hooks for fetching trait data using TanStack Query.
 * Uses generatorService for trait data.
 */

import { useQuery } from '@tanstack/react-query';
import { traitKeys } from '@/config/query/queryKeys';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';
import { generatorService } from '@/services';

// All traits
export function useTraits() {
  return useQuery({
    queryKey: traitKeys.list(),
    queryFn: () => generatorService.getAllTraits(),
    ...DATA_CACHE_MAP.traitRarity,
  });
}

// Trait rarity - stub for now
export function useTraitRarity(
  traitType: string | undefined,
  traitValue: string | undefined
) {
  return useQuery({
    queryKey: traitKeys.rarity(traitType!, traitValue!),
    queryFn: async () => {
      // Would need rarity data from metadata
      return { rarity: 0, count: 0 };
    },
    ...DATA_CACHE_MAP.traitRarity,
    enabled: !!traitType && !!traitValue,
  });
}

// Trait sales - stub for now
export function useTraitSales(
  traitType: string | undefined,
  traitValue: string | undefined
) {
  return useQuery({
    queryKey: traitKeys.sales(traitType!, traitValue!),
    queryFn: async () => [],
    ...DATA_CACHE_MAP.traitSales,
    enabled: !!traitType && !!traitValue,
  });
}
