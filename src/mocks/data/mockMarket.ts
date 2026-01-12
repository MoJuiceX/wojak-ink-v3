/**
 * Mock Market Data
 */

import type {
  Listing,
  MarketStats,
  PriceHistoryPoint,
  HeatmapData,
} from '@/types/domain';
import { mockNFTs } from './mockNFTs';

// Generate mock listings from NFTs with prices
export const mockListings: Listing[] = mockNFTs
  .filter((nft) => nft.lastSalePrice)
  .slice(0, 15)
  .map((nft, i) => ({
    id: `listing-${i + 1}`,
    nftId: nft.id,
    nft,
    seller: nft.owner ?? 'unknown',
    price: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
    listedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  }));

export const mockMarketStats: MarketStats = {
  floorPrice: 0.8,
  volume24h: 45.5,
  volume7d: 312.8,
  volumeTotal: 15420.5,
  sales24h: 12,
  sales7d: 89,
  salesTotal: 4521,
  uniqueOwners: 1842,
  listedCount: mockListings.length,
  averagePrice: 3.42,
};

// Generate price history for the last 30 days
export const mockPriceHistory: PriceHistoryPoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));

    return {
      timestamp: date,
      floorPrice: parseFloat((0.5 + Math.random() * 1).toFixed(2)),
      averagePrice: parseFloat((2 + Math.random() * 3).toFixed(2)),
      volume: parseFloat((10 + Math.random() * 50).toFixed(2)),
      sales: Math.floor(Math.random() * 15) + 1,
    };
  }
);

// Generate heatmap data
export const mockHeatmapData: HeatmapData = {
  points: Array.from({ length: 50 }, () => ({
    rarityScore: Math.floor(Math.random() * 100),
    price: parseFloat((Math.random() * 10).toFixed(2)),
    count: Math.floor(Math.random() * 20) + 1,
  })),
};
