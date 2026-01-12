/**
 * Mock Market Service
 */

import type { IMarketService } from '../interfaces';
import type {
  Listing,
  ListingFilters,
  MarketStats,
  PriceHistoryPoint,
  HeatmapData,
  TimePeriod,
} from '@/types/domain';
import {
  mockListings,
  mockMarketStats,
  mockPriceHistory,
  mockHeatmapData,
} from '@/mocks/data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockMarketService implements IMarketService {
  async fetchListings(filters?: ListingFilters): Promise<Listing[]> {
    await delay(300);
    let result = [...mockListings];

    if (filters?.minPrice !== undefined) {
      result = result.filter((l) => l.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter((l) => l.price <= filters.maxPrice!);
    }

    if (filters?.character) {
      result = result.filter((l) => l.nft.character === filters.character);
    }

    // Sort
    const sortBy = filters?.sortBy ?? 'recent';
    const sortOrder = filters?.sortOrder ?? 'desc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price - b.price) * multiplier;
        case 'recent':
          return (
            (a.listedAt.getTime() - b.listedAt.getTime()) * multiplier
          );
        case 'rarity':
          return (a.nft.rarity.rank - b.nft.rarity.rank) * multiplier;
        default:
          return 0;
      }
    });

    return result;
  }

  async fetchListingsByPriceRange(min: number, max: number): Promise<Listing[]> {
    return this.fetchListings({ minPrice: min, maxPrice: max });
  }

  async fetchFloorPrice(): Promise<number> {
    await delay(100);
    return mockMarketStats.floorPrice;
  }

  async fetchMarketStats(): Promise<MarketStats> {
    await delay(200);
    return mockMarketStats;
  }

  async fetchPriceHistory(period?: TimePeriod): Promise<PriceHistoryPoint[]> {
    await delay(250);

    const days =
      period === '24h'
        ? 1
        : period === '7d'
          ? 7
          : period === '30d'
            ? 30
            : period === '90d'
              ? 90
              : 30;

    return mockPriceHistory.slice(-days);
  }

  async fetchHeatmapData(): Promise<HeatmapData> {
    await delay(200);
    return mockHeatmapData;
  }
}
