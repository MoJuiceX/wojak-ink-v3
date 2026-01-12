/**
 * Mock Treasury Service
 *
 * Treasury data using existing app types.
 */

import type { PortfolioSummary, WalletInfo } from '@/types/treasury';
import { generateMockPortfolio, generateMockWallet } from '@/utils/mockTreasuryData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Cache for consistent wallet address across requests
let cachedWallet: WalletInfo | null = null;

export interface ITreasuryService {
  fetchPortfolio(): Promise<PortfolioSummary>;
  fetchWallet(): Promise<WalletInfo>;
  refreshPrices(): Promise<PortfolioSummary>;
}

export class MockTreasuryService implements ITreasuryService {
  async fetchPortfolio(): Promise<PortfolioSummary> {
    await delay(800);
    return generateMockPortfolio();
  }

  async fetchWallet(): Promise<WalletInfo> {
    await delay(300);
    // Return cached wallet for consistency
    if (!cachedWallet) {
      cachedWallet = generateMockWallet();
    }
    return cachedWallet;
  }

  async refreshPrices(): Promise<PortfolioSummary> {
    await delay(500);
    return generateMockPortfolio();
  }
}

// Singleton instance
export const treasuryService = new MockTreasuryService();
