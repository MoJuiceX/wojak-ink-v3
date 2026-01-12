/**
 * Mock Wallet Data
 */

import type { WalletBalance, TokenPrices } from '@/types/domain';

export const mockWalletBalance: WalletBalance = {
  xch: 12.5,
  xchUsd: 62.5,
  tokens: [
    {
      assetId: 'dbw-token',
      symbol: 'DBW',
      name: 'Dexie Blue Whale',
      balance: 1000,
      decimals: 3,
      priceUsd: 0.05,
      valueUsd: 50,
    },
    {
      assetId: 'sbt-token',
      symbol: 'SBT',
      name: 'Spacebucks',
      balance: 5000,
      decimals: 3,
      priceUsd: 0.02,
      valueUsd: 100,
    },
  ],
  totalUsd: 212.5,
};

export const mockTokenPrices: TokenPrices = {
  xch: {
    usd: 5.0,
    change24h: 2.5,
  },
  tokens: {
    'dbw-token': {
      usd: 0.05,
      change24h: -1.2,
    },
    'sbt-token': {
      usd: 0.02,
      change24h: 5.8,
    },
  },
  updatedAt: new Date(),
};
