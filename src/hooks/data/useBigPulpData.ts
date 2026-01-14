/**
 * BigPulp Data Hooks
 *
 * TanStack Query hooks for BigPulp intelligence data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bigpulpService } from '@/services/bigpulpService';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';

// Query keys
export const bigPulpKeys = {
  all: ['bigpulp'] as const,
  market: () => [...bigPulpKeys.all, 'market'] as const,
  marketStats: () => [...bigPulpKeys.market(), 'stats'] as const,
  heatMap: () => [...bigPulpKeys.market(), 'heatmap'] as const,
  priceDistribution: () => [...bigPulpKeys.market(), 'distribution'] as const,
  attributes: () => [...bigPulpKeys.all, 'attributes'] as const,
  topSales: () => [...bigPulpKeys.all, 'topSales'] as const,
  rarestFinds: () => [...bigPulpKeys.all, 'rarestFinds'] as const,
  analysis: (id: number) => [...bigPulpKeys.all, 'analysis', id] as const,
} as const;

/**
 * Fetch market stats
 */
export function useBigPulpMarketStats() {
  return useQuery({
    queryKey: bigPulpKeys.marketStats(),
    queryFn: () => bigpulpService.getMarketStats(),
    ...DATA_CACHE_MAP.marketStats,
  });
}

/**
 * Fetch heat map data
 */
export function useBigPulpHeatMap() {
  return useQuery({
    queryKey: bigPulpKeys.heatMap(),
    queryFn: () => bigpulpService.getHeatMapData(),
    ...DATA_CACHE_MAP.priceHistory, // Semi-static
  });
}

/**
 * Fetch price distribution
 */
export function useBigPulpPriceDistribution() {
  return useQuery({
    queryKey: bigPulpKeys.priceDistribution(),
    queryFn: () => bigpulpService.getPriceDistribution(),
    ...DATA_CACHE_MAP.marketStats,
  });
}

/**
 * Fetch attribute stats (merges live sales with static data)
 */
export function useBigPulpAttributes() {
  return useQuery({
    queryKey: bigPulpKeys.attributes(),
    queryFn: () => bigpulpService.getAttributeStats(),
    ...DATA_CACHE_MAP.traitSales, // Volatile - refresh often for live sales
  });
}

/**
 * Fetch top sales
 */
export function useBigPulpTopSales() {
  return useQuery({
    queryKey: bigPulpKeys.topSales(),
    queryFn: () => bigpulpService.getTopSales(),
    ...DATA_CACHE_MAP.listings, // Volatile
  });
}

/**
 * Fetch rarest finds
 */
export function useBigPulpRarestFinds() {
  return useQuery({
    queryKey: bigPulpKeys.rarestFinds(),
    queryFn: () => bigpulpService.getRarestFinds(),
    ...DATA_CACHE_MAP.nftMetadata, // Static
  });
}

/**
 * Search for NFT analysis
 */
export function useBigPulpAnalysis(id: number | null) {
  return useQuery({
    queryKey: bigPulpKeys.analysis(id!),
    queryFn: () => bigpulpService.searchNFT(id!),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: id !== null && id >= 1 && id <= 4200,
  });
}

/**
 * Mutation for searching NFT (imperative)
 */
export function useSearchNFTMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bigpulpService.searchNFT(id),
    onSuccess: (data, id) => {
      // Cache the result
      if (data) {
        queryClient.setQueryData(bigPulpKeys.analysis(id), data);
      }
    },
  });
}

/**
 * Mutation for random analysis
 */
export function useRandomAnalysisMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bigpulpService.getRandomAnalysis(),
    onSuccess: (data) => {
      // Extract ID and cache
      const id = parseInt(data.nft.id.replace('WFP-', ''), 10);
      queryClient.setQueryData(bigPulpKeys.analysis(id), data);
    },
  });
}

/**
 * Combined market data hook
 */
export function useBigPulpMarketData() {
  const stats = useBigPulpMarketStats();
  const heatMap = useBigPulpHeatMap();
  const distribution = useBigPulpPriceDistribution();

  return {
    stats: stats.data ?? null,
    heatMapData: heatMap.data ?? null,
    priceDistribution: distribution.data ?? null,
    isLoading: stats.isLoading || heatMap.isLoading || distribution.isLoading,
    error: stats.error || heatMap.error || distribution.error,
  };
}

/**
 * Combined ask tab data hook
 */
export function useBigPulpAskData() {
  const topSales = useBigPulpTopSales();
  const rarestFinds = useBigPulpRarestFinds();

  return {
    topSales: topSales.data ?? [],
    rarestFinds: rarestFinds.data ?? [],
    isLoading: topSales.isLoading || rarestFinds.isLoading,
    error: topSales.error || rarestFinds.error,
  };
}
