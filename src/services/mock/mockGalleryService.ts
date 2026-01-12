/**
 * Mock Gallery Service
 *
 * NFT service using existing app types.
 */

import type { NFT, CharacterType } from '@/types/nft';
import { generateMockNFTs } from '@/utils/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Cache generated NFTs to maintain consistency
const nftCache = new Map<CharacterType, NFT[]>();

export interface GalleryFilters {
  character?: CharacterType;
  sortBy?: 'id' | 'rarity' | 'price-asc' | 'price-desc';
  filterMode?: 'all' | 'listed';
  maxPrice?: number;
  searchQuery?: string;
}

export interface IGalleryService {
  fetchNFTsByCharacter(character: CharacterType): Promise<NFT[]>;
  fetchNFTById(id: string): Promise<NFT | null>;
  searchNFTs(query: string, character?: CharacterType): Promise<NFT[]>;
}

export class MockGalleryService implements IGalleryService {
  async fetchNFTsByCharacter(character: CharacterType): Promise<NFT[]> {
    await delay(300);

    // Return cached data if available
    if (nftCache.has(character)) {
      return nftCache.get(character)!;
    }

    // Generate and cache
    const nfts = generateMockNFTs(character, 20);
    nftCache.set(character, nfts);
    return nfts;
  }

  async fetchNFTById(id: string): Promise<NFT | null> {
    await delay(150);

    // Search through cached NFTs
    for (const nfts of nftCache.values()) {
      const found = nfts.find((nft) => nft.id === id);
      if (found) return found;
    }

    return null;
  }

  async searchNFTs(query: string, character?: CharacterType): Promise<NFT[]> {
    await delay(200);

    const q = query.toLowerCase();
    const results: NFT[] = [];

    if (character) {
      const nfts = await this.fetchNFTsByCharacter(character);
      return nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(q) || nft.id.toLowerCase().includes(q)
      );
    }

    // Search all cached NFTs
    for (const nfts of nftCache.values()) {
      const matches = nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(q) || nft.id.toLowerCase().includes(q)
      );
      results.push(...matches);
    }

    return results.slice(0, 20);
  }
}

// Singleton instance
export const galleryService = new MockGalleryService();
