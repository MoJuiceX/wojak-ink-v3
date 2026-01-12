/**
 * Gallery Data Hooks
 *
 * TanStack Query hooks for gallery NFT data.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { galleryService } from '@/services/galleryService';
import type { CharacterType } from '@/types/nft';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';

// Query keys
export const galleryKeys = {
  all: ['gallery'] as const,
  characters: () => [...galleryKeys.all, 'characters'] as const,
  character: (type: CharacterType) => [...galleryKeys.characters(), type] as const,
  nft: (id: string) => [...galleryKeys.all, 'nft', id] as const,
  search: (query: string, character?: CharacterType) =>
    [...galleryKeys.all, 'search', query, character] as const,
} as const;

/**
 * Fetch NFTs by character type
 */
export function useGalleryNFTs(character: CharacterType | null) {
  return useQuery({
    queryKey: galleryKeys.character(character!),
    queryFn: () => galleryService.fetchNFTsByCharacter(character!),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: !!character,
  });
}

/**
 * Fetch single NFT by ID
 */
export function useGalleryNFT(id: string | null) {
  return useQuery({
    queryKey: galleryKeys.nft(id!),
    queryFn: () => galleryService.fetchNFTById(id!),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: !!id,
  });
}

/**
 * Search NFTs
 */
export function useGallerySearch(query: string, character?: CharacterType) {
  return useQuery({
    queryKey: galleryKeys.search(query, character),
    queryFn: () => galleryService.searchNFTs(query, character),
    ...DATA_CACHE_MAP.nftMetadata,
    enabled: query.length >= 2,
  });
}

/**
 * Prefetch NFTs for a character type
 */
export function usePrefetchGalleryNFTs() {
  const queryClient = useQueryClient();

  return useCallback(
    (character: CharacterType) => {
      queryClient.prefetchQuery({
        queryKey: galleryKeys.character(character),
        queryFn: () => galleryService.fetchNFTsByCharacter(character),
        ...DATA_CACHE_MAP.nftMetadata,
      });
    },
    [queryClient]
  );
}
