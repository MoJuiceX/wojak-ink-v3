/**
 * Mock Trait Service
 */

import type { ITraitService } from '../interfaces';
import type { TraitType, TraitRarity, TraitSales } from '@/types/domain';
import { mockTraitTypes, mockNFTs, mockTransactions } from '@/mocks/data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockTraitService implements ITraitService {
  async fetchAllTraits(): Promise<TraitType[]> {
    await delay(200);
    return mockTraitTypes;
  }

  async fetchTraitRarity(
    traitType: string,
    value: string
  ): Promise<TraitRarity> {
    await delay(150);

    const nftsWithTrait = mockNFTs.filter((nft) =>
      nft.traits.some((t) => t.traitType === traitType && t.value === value)
    );

    return {
      traitType,
      value,
      count: nftsWithTrait.length,
      percentage: (nftsWithTrait.length / mockNFTs.length) * 100,
      nftIds: nftsWithTrait.map((n) => n.id),
    };
  }

  async fetchTraitSales(
    traitType: string,
    value: string
  ): Promise<TraitSales> {
    await delay(200);

    const nftsWithTrait = mockNFTs.filter((nft) =>
      nft.traits.some((t) => t.traitType === traitType && t.value === value)
    );

    const sales = mockTransactions.filter(
      (tx) => tx.type === 'sale' && nftsWithTrait.some((n) => tx.id.startsWith(n.id))
    );

    const prices = sales.map((s) => s.price ?? 0).filter((p) => p > 0);

    return {
      traitType,
      value,
      sales,
      averagePrice:
        prices.length > 0
          ? prices.reduce((a, b) => a + b, 0) / prices.length
          : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    };
  }
}
