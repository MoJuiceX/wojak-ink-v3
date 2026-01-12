/**
 * Mock NFT Service
 *
 * Simulates API behavior with realistic delays.
 */

import type { INFTService } from '../interfaces';
import type {
  NFT,
  NFTFilters,
  NFTHistory,
  NFTTrait,
  PaginatedResponse,
  PageParams,
} from '@/types/domain';
import { mockNFTs, mockTransactions } from '@/mocks/data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockNFTService implements INFTService {
  private nfts: NFT[] = mockNFTs;

  async fetchNFTs(filters?: NFTFilters): Promise<NFT[]> {
    await delay(300);
    return this.applyFilters(this.nfts, filters);
  }

  async fetchNFTsPage(
    params: NFTFilters & PageParams
  ): Promise<PaginatedResponse<NFT>> {
    await delay(300);

    const filtered = this.applyFilters(this.nfts, params);
    const limit = params.limit ?? 20;
    const startIndex = params.cursor ? parseInt(params.cursor, 10) : 0;
    const items = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;

    return {
      items,
      nextCursor: hasMore ? String(startIndex + limit) : undefined,
      total: filtered.length,
      hasMore,
    };
  }

  async fetchNFTById(id: string): Promise<NFT> {
    await delay(200);
    const nft = this.nfts.find((n) => n.id === id);
    if (!nft) throw new Error(`NFT not found: ${id}`);
    return nft;
  }

  async fetchNFTTraits(id: string): Promise<NFTTrait[]> {
    await delay(150);
    const nft = this.nfts.find((n) => n.id === id);
    if (!nft) throw new Error(`NFT not found: ${id}`);
    return nft.traits;
  }

  async fetchNFTHistory(id: string): Promise<NFTHistory> {
    await delay(250);
    return {
      transactions: mockTransactions.filter((tx) => tx.id.startsWith(id)),
    };
  }

  async searchNFTs(query: string): Promise<NFT[]> {
    await delay(200);
    const q = query.toLowerCase();
    return this.nfts
      .filter(
        (nft) =>
          nft.name.toLowerCase().includes(q) ||
          nft.id.includes(q) ||
          nft.traits.some((t) => t.value.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }

  private applyFilters(nfts: NFT[], filters?: NFTFilters): NFT[] {
    if (!filters) return nfts;

    let result = [...nfts];

    if (filters.character) {
      result = result.filter((n) => n.character === filters.character);
    }

    if (filters.traits) {
      Object.entries(filters.traits).forEach(([type, values]) => {
        result = result.filter((n) =>
          n.traits.some((t) => t.traitType === type && values.includes(t.value))
        );
      });
    }

    if (filters.minRank !== undefined) {
      result = result.filter((n) => n.rarity.rank >= filters.minRank!);
    }

    if (filters.maxRank !== undefined) {
      result = result.filter((n) => n.rarity.rank <= filters.maxRank!);
    }

    if (filters.owner) {
      result = result.filter((n) => n.owner === filters.owner);
    }

    // Sort
    const sortBy = filters.sortBy ?? 'rank';
    const sortOrder = filters.sortOrder ?? 'asc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      switch (sortBy) {
        case 'rank':
          return (a.rarity.rank - b.rarity.rank) * multiplier;
        case 'edition':
          return (a.edition - b.edition) * multiplier;
        case 'price':
          return (
            ((a.lastSalePrice ?? 0) - (b.lastSalePrice ?? 0)) * multiplier
          );
        case 'recent':
          return (
            (a.mintedAt.getTime() - b.mintedAt.getTime()) * multiplier
          );
        default:
          return 0;
      }
    });

    return result;
  }
}
