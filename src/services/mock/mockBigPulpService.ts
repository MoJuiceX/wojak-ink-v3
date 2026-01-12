/**
 * Mock BigPulp Service
 *
 * BigPulp intelligence data using existing app types.
 */

import type {
  NFTAnalysis,
  MarketStats,
  HeatMapCell,
  PriceDistribution,
  AttributeStats,
  NFTSale,
  NFTBasic,
} from '@/types/bigpulp';
import {
  generateMockAnalysis,
  generateRandomAnalysis,
  generateMockMarketStats,
  generateMockHeatMapData,
  generateMockPriceDistribution,
  generateMockAttributeStats,
  generateMockTopSales,
  generateMockRarestFinds,
} from '@/utils/mockBigPulpData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface IBigPulpService {
  fetchMarketStats(): Promise<MarketStats>;
  fetchHeatMapData(): Promise<HeatMapCell[][]>;
  fetchPriceDistribution(): Promise<PriceDistribution>;
  fetchAttributeStats(): Promise<AttributeStats[]>;
  fetchTopSales(): Promise<NFTSale[]>;
  fetchRarestFinds(): Promise<NFTBasic[]>;
  searchNFT(id: number): Promise<NFTAnalysis>;
  getRandomAnalysis(): Promise<NFTAnalysis>;
}

export class MockBigPulpService implements IBigPulpService {
  async fetchMarketStats(): Promise<MarketStats> {
    await delay(400);
    return generateMockMarketStats();
  }

  async fetchHeatMapData(): Promise<HeatMapCell[][]> {
    await delay(500);
    return generateMockHeatMapData();
  }

  async fetchPriceDistribution(): Promise<PriceDistribution> {
    await delay(300);
    return generateMockPriceDistribution();
  }

  async fetchAttributeStats(): Promise<AttributeStats[]> {
    await delay(400);
    return generateMockAttributeStats();
  }

  async fetchTopSales(): Promise<NFTSale[]> {
    await delay(350);
    return generateMockTopSales();
  }

  async fetchRarestFinds(): Promise<NFTBasic[]> {
    await delay(350);
    return generateMockRarestFinds();
  }

  async searchNFT(id: number): Promise<NFTAnalysis> {
    await delay(800);

    if (id < 1 || id > 4200) {
      throw new Error('NFT not found');
    }

    return generateMockAnalysis(id);
  }

  async getRandomAnalysis(): Promise<NFTAnalysis> {
    await delay(600);
    return generateRandomAnalysis();
  }
}

// Singleton instance
export const bigPulpService = new MockBigPulpService();
