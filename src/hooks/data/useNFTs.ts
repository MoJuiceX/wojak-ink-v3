/**
 * NFT Data Hooks
 *
 * Hooks for fetching NFT data using TanStack Query.
 * Uses galleryService for NFT data.
 */

import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { nftKeys } from '@/config/query/queryKeys';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';
import { galleryService } from '@/services';
import type { NFTFilters } from '@/types/domain';
import type { CharacterType } from '@/types/nft';

// List NFTs with filters
export function useNFTs(filters?: NFTFilters) {
  return useQuery({
    queryKey: nftKeys.list(filters),
    queryFn: async () => {
      const character = filters?.character as CharacterType | undefined;
      if (!character) {
        return galleryService.fetchAllNFTs();
      }
      return galleryService.fetchNFTsByCharacter(character);
    },
    ...DATA_CACHE_MAP.nftMetadata,
  });
}

// Infinite scroll NFTs
export function useInfiniteNFTs(filters?: NFTFilters) {
  const query = useInfiniteQuery({
    queryKey: nftKeys.infinite(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const character = filters?.character as CharacterType | undefined;
      const allNfts = character
        ? await galleryService.fetchNFTsByCharacter(character)
        : await galleryService.fetchAllNFTs();

      const pageSize = 50;
      const start = pageParam * pageSize;
      const items = allNfts.slice(start, start + pageSize);
      const hasMore = start + pageSize < allNfts.length;

      return {
        items,
        nextCursor: hasMore ? pageParam + 1 : undefined,
        total: allNfts.length,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    ...DATA_CACHE_MAP.nftMetadata,
  });

  // Flatten pages for easier consumption
  const nfts = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    nfts,
    total,
  };
}

// Single NFT by ID
export function useNFT(id: string | undefined) {
  return useQuery({
    queryKey: nftKeys.detail(id!),
    queryFn: () => galleryService.fetchNFTById(id!),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: !!id,
  });
}

// NFT traits
export function useNFTTraits(id: string | undefined) {
  return useQuery({
    queryKey: nftKeys.traits(id!),
    queryFn: async () => {
      const nft = await galleryService.fetchNFTById(id!);
      return nft?.traits ?? [];
    },
    ...DATA_CACHE_MAP.nftTraits,
    enabled: !!id,
  });
}

// NFT history - stub for now
export function useNFTHistory(id: string | undefined) {
  return useQuery({
    queryKey: nftKeys.history(id!),
    queryFn: async () => [],
    ...DATA_CACHE_MAP.nftHistory,
    enabled: !!id,
  });
}

// Search NFTs with debounce
export function useNFTSearch(query: string) {
  return useQuery({
    queryKey: nftKeys.search(query),
    queryFn: () => galleryService.searchNFTs(query),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: query.length >= 2,
  });
}

// Prefetch NFT for hover preview
export function usePrefetchNFT() {
  const queryClient = useQueryClient();

  return useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: nftKeys.detail(id),
        queryFn: () => galleryService.fetchNFTById(id),
        ...DATA_CACHE_MAP.nftMetadata,
      });
    },
    [queryClient]
  );
}
