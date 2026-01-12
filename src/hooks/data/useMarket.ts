/**
 * Market Data Hooks
 *
 * Hooks for fetching market data using TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import { marketKeys } from '@/config/query/queryKeys';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';
import { marketService } from '@/services';

// Active listings
export function useListings() {
  return useQuery({
    queryKey: marketKeys.listingsList(),
    queryFn: async () => {
      const result = await marketService.fetchAllListings();
      return result.listings;
    },
    ...DATA_CACHE_MAP.listings,
  });
}

// Floor price (with polling)
export function useFloorPrice() {
  return useQuery({
    queryKey: marketKeys.floorPrice(),
    queryFn: async () => {
      const cached = marketService.getCachedListings();
      if (cached) {
        return marketService.getFloorPrice(cached);
      }
      const result = await marketService.fetchAllListings();
      return marketService.getFloorPrice(result.listings);
    },
    ...DATA_CACHE_MAP.floorPrice,
    refetchInterval: 60 * 1000, // Poll every minute
  });
}

// Market stats
export function useMarketStats() {
  return useQuery({
    queryKey: marketKeys.stats(),
    queryFn: async () => {
      const result = await marketService.fetchAllListings();
      return marketService.getMarketStats(result.listings);
    },
    ...DATA_CACHE_MAP.marketStats,
  });
}

// Price history - stub for now
export function usePriceHistory() {
  return useQuery({
    queryKey: marketKeys.priceHistory(),
    queryFn: async () => [],
    ...DATA_CACHE_MAP.priceHistory,
  });
}

// Heatmap data - stub for now
export function useHeatmap() {
  return useQuery({
    queryKey: marketKeys.heatmap(),
    queryFn: async () => [],
    ...DATA_CACHE_MAP.priceHistory,
  });
}

// Combined market overview
export function useMarketOverview() {
  const stats = useMarketStats();
  const floor = useFloorPrice();

  return {
    stats: stats.data,
    floorPrice: floor.data,
    isLoading: stats.isLoading || floor.isLoading,
    isError: stats.isError || floor.isError,
    error: stats.error || floor.error,
  };
}
