/**
 * Mock Treasury Data Generator
 *
 * Generates realistic portfolio data for development and testing.
 */

import type { WalletToken, PortfolioSummary, WalletInfo } from '@/types/treasury';

// Token color palette
const TOKEN_COLORS = {
  xch: '#22c55e', // Chia green
  dbx: '#3b82f6', // Blue
  sbx: '#8b5cf6', // Purple
  hoa: '#f97316', // Orange
  warp: '#06b6d4', // Cyan
  mojo: '#eab308', // Yellow
  ach: '#ec4899', // Pink
  tang: '#ff6b00', // Tang orange
};

// Mock token data
const MOCK_TOKENS: Array<{
  id: string;
  symbol: string;
  name: string;
  logoFallback: string;
  color: string;
  priceRange: [number, number];
  balanceRange: [number, number];
  decimals: number;
}> = [
  {
    id: 'dbx',
    symbol: 'DBX',
    name: 'dexie bucks',
    logoFallback: '💎',
    color: TOKEN_COLORS.dbx,
    priceRange: [0.05, 0.15],
    balanceRange: [500, 3000],
    decimals: 3,
  },
  {
    id: 'sbx',
    symbol: 'SBX',
    name: 'Spacebucks',
    logoFallback: '🚀',
    color: TOKEN_COLORS.sbx,
    priceRange: [0.005, 0.02],
    balanceRange: [1000, 10000],
    decimals: 3,
  },
  {
    id: 'hoa',
    symbol: 'HOA',
    name: 'Hash Orange Ale',
    logoFallback: '🍺',
    color: TOKEN_COLORS.hoa,
    priceRange: [0.02, 0.08],
    balanceRange: [100, 1000],
    decimals: 3,
  },
  {
    id: 'warp',
    symbol: 'WARP',
    name: 'Warp Token',
    logoFallback: '⚡',
    color: TOKEN_COLORS.warp,
    priceRange: [0.1, 0.5],
    balanceRange: [50, 500],
    decimals: 3,
  },
  {
    id: 'mojo',
    symbol: 'MOJO',
    name: 'Mojo Token',
    logoFallback: '✨',
    color: TOKEN_COLORS.mojo,
    priceRange: [0.001, 0.01],
    balanceRange: [5000, 50000],
    decimals: 3,
  },
  {
    id: 'ach',
    symbol: 'ACH',
    name: 'Achi Token',
    logoFallback: '🌸',
    color: TOKEN_COLORS.ach,
    priceRange: [0.01, 0.05],
    balanceRange: [200, 2000],
    decimals: 3,
  },
  {
    id: 'tang',
    symbol: 'TANG',
    name: 'Tang Token',
    logoFallback: '🍊',
    color: TOKEN_COLORS.tang,
    priceRange: [0.05, 0.2],
    balanceRange: [100, 800],
    decimals: 3,
  },
];

// Small tokens (< $1 value)
const SMALL_TOKENS: Array<{
  id: string;
  symbol: string;
  name: string;
  logoFallback: string;
  color: string;
  valueRange: [number, number];
}> = [
  { id: 'dust1', symbol: 'DUST', name: 'Dust Token', logoFallback: '🌫️', color: '#6b7280', valueRange: [0.01, 0.5] },
  { id: 'tiny1', symbol: 'TINY', name: 'Tiny CAT', logoFallback: '🔷', color: '#94a3b8', valueRange: [0.05, 0.3] },
  { id: 'micro1', symbol: 'MCR', name: 'Micro Token', logoFallback: '⭐', color: '#a1a1aa', valueRange: [0.01, 0.2] },
  { id: 'nano1', symbol: 'NANO', name: 'Nano CAT', logoFallback: '🔹', color: '#71717a', valueRange: [0.001, 0.1] },
];

/**
 * Generate a random number in range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random 24h price change
 */
function randomChange24h(): number {
  // -15% to +20% with bias toward smaller changes
  const change = (Math.random() - 0.4) * 35;
  return Math.round(change * 100) / 100;
}

/**
 * Generate mock portfolio data
 */
export function generateMockPortfolio(): PortfolioSummary {
  const xchPrice = randomInRange(45, 55); // $45-55 per XCH
  const xchBalance = randomInRange(50, 150); // 50-150 XCH

  const tokens: WalletToken[] = [];

  // Add XCH first
  const xchValue = xchBalance * xchPrice;
  tokens.push({
    id: 'xch',
    symbol: 'XCH',
    name: 'Chia',
    type: 'native',
    balance: BigInt(Math.floor(xchBalance * 1e12)),
    balanceFormatted: Math.round(xchBalance * 100) / 100,
    decimals: 12,
    priceUSD: xchPrice,
    valueUSD: xchValue,
    change24h: randomChange24h(),
    logoUrl: '/tokens/xch.png',
    logoFallback: '🌱',
    color: TOKEN_COLORS.xch,
    isVisible: true,
  });

  // Add 4-6 random CAT tokens
  const numCats = Math.floor(randomInRange(4, 7));
  const shuffledTokens = [...MOCK_TOKENS].sort(() => Math.random() - 0.5).slice(0, numCats);

  for (const tokenDef of shuffledTokens) {
    const price = randomInRange(tokenDef.priceRange[0], tokenDef.priceRange[1]);
    const balance = randomInRange(tokenDef.balanceRange[0], tokenDef.balanceRange[1]);
    const valueUSD = price * balance;
    const valueXCH = valueUSD / xchPrice;

    tokens.push({
      id: tokenDef.id,
      symbol: tokenDef.symbol,
      name: tokenDef.name,
      type: 'cat',
      balance: BigInt(Math.floor(balance * Math.pow(10, tokenDef.decimals))),
      balanceFormatted: Math.round(balance * 100) / 100,
      decimals: tokenDef.decimals,
      priceUSD: price,
      valueUSD: Math.round(valueUSD * 100) / 100,
      priceXCH: price / xchPrice,
      valueXCH: Math.round(valueXCH * 1000) / 1000,
      change24h: randomChange24h(),
      logoUrl: `/tokens/${tokenDef.id}.png`,
      logoFallback: tokenDef.logoFallback,
      color: tokenDef.color,
      isVisible: valueUSD >= 1,
    });
  }

  // Add 2-4 small tokens
  const numSmall = Math.floor(randomInRange(2, 5));
  const shuffledSmall = [...SMALL_TOKENS].sort(() => Math.random() - 0.5).slice(0, numSmall);

  for (const tokenDef of shuffledSmall) {
    const valueUSD = randomInRange(tokenDef.valueRange[0], tokenDef.valueRange[1]);
    const fakePrice = 0.0001;
    const balance = valueUSD / fakePrice;

    tokens.push({
      id: tokenDef.id,
      symbol: tokenDef.symbol,
      name: tokenDef.name,
      type: 'cat',
      balance: BigInt(Math.floor(balance * 1000)),
      balanceFormatted: Math.round(balance),
      decimals: 3,
      priceUSD: fakePrice,
      valueUSD: Math.round(valueUSD * 100) / 100,
      priceXCH: fakePrice / xchPrice,
      valueXCH: valueUSD / xchPrice,
      logoUrl: `/tokens/${tokenDef.id}.png`,
      logoFallback: tokenDef.logoFallback,
      color: tokenDef.color,
      isVisible: false,
    });
  }

  // Calculate totals
  const totalValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0);
  const catsValueUSD = tokens.filter((t) => t.type === 'cat').reduce((sum, t) => sum + t.valueUSD, 0);
  const visibleTokens = tokens.filter((t) => t.valueUSD >= 1);
  const smallTokens = tokens.filter((t) => t.valueUSD < 1);

  return {
    totalValueUSD: Math.round(totalValueUSD * 100) / 100,
    totalValueXCH: Math.round((totalValueUSD / xchPrice) * 100) / 100,
    xchValueUSD: xchValue,
    catsValueUSD: Math.round(catsValueUSD * 100) / 100,
    xchPriceUSD: xchPrice,
    lastUpdated: new Date(),
    tokens,
    visibleTokens,
    smallTokens,
    tokenCount: tokens.length,
    visibleTokenCount: visibleTokens.length,
  };
}

/**
 * Generate mock wallet info
 */
export function generateMockWallet(): WalletInfo {
  // Generate a fake but realistic-looking address
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let address = 'xch1';
  for (let i = 0; i < 58; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }

  return {
    address,
    addressTruncated: `${address.slice(0, 12)}...${address.slice(-6)}`,
    fingerprint: Math.floor(Math.random() * 1000000000),
    explorerUrl: `https://spacescan.io/address/${address}`,
    isConnected: true,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format compact currency (e.g., $1.2K, $4.5M)
 */
export function formatCompactCurrency(value: number): string {
  if (value < 1) return `$${value.toFixed(2)}`;
  if (value < 1000) return `$${Math.round(value)}`;
  if (value < 10000) return `$${(value / 1000).toFixed(1)}K`;
  if (value < 1000000) return `$${Math.round(value / 1000)}K`;
  return `$${(value / 1000000).toFixed(1)}M`;
}

/**
 * Format XCH amount
 */
export function formatXCH(value: number): string {
  if (value < 0.01) return `${(value * 1000).toFixed(2)} mXCH`;
  return `${value.toFixed(2)} XCH`;
}
