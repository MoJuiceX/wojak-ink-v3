/**
 * Domain Type Definitions
 *
 * Core business types for the Wojak.ink application.
 */

// ============================================
// NFT TYPES
// ============================================

export interface NFT {
  id: string;
  name: string;
  edition: number;
  imageUrl: string;
  thumbnailUrl: string;
  character: NFTCharacter;
  traits: NFTTrait[];
  rarity: {
    rank: number;
    score: number;
    percentile: number;
  };
  owner?: string;
  mintedAt: Date;
  lastSalePrice?: number;
}

export type NFTCharacter =
  | 'wojak'
  | 'doomer'
  | 'bloomer'
  | 'zoomer'
  | 'boomer'
  | 'coomer';

export interface NFTTrait {
  traitType: string;
  value: string;
  rarity: number; // 0-1 percentage
  count: number; // How many NFTs have this trait
}

export interface NFTHistory {
  transactions: NFTTransaction[];
}

export interface NFTTransaction {
  id: string;
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'delist';
  from: string;
  to: string;
  price?: number;
  timestamp: Date;
  txHash: string;
}

// ============================================
// MARKET TYPES
// ============================================

export interface Listing {
  id: string;
  nftId: string;
  nft: NFT;
  seller: string;
  price: number;
  listedAt: Date;
  expiresAt?: Date;
}

export interface MarketStats {
  floorPrice: number;
  volume24h: number;
  volume7d: number;
  volumeTotal: number;
  sales24h: number;
  sales7d: number;
  salesTotal: number;
  uniqueOwners: number;
  listedCount: number;
  averagePrice: number;
}

export interface PriceHistoryPoint {
  timestamp: Date;
  floorPrice: number;
  averagePrice: number;
  volume: number;
  sales: number;
}

export interface HeatmapData {
  points: Array<{
    rarityScore: number;
    price: number;
    count: number;
  }>;
}

// ============================================
// WALLET TYPES
// ============================================

export interface WalletBalance {
  xch: number;
  xchUsd: number;
  tokens: TokenBalance[];
  totalUsd: number;
}

export interface TokenBalance {
  assetId: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  priceUsd?: number;
  valueUsd?: number;
}

export interface TokenPrices {
  xch: {
    usd: number;
    change24h: number;
  };
  tokens: Record<
    string,
    {
      usd: number;
      change24h: number;
    }
  >;
  updatedAt: Date;
}

// ============================================
// TRAIT TYPES
// ============================================

export interface TraitType {
  name: string;
  values: TraitValue[];
  totalCount: number;
}

export interface TraitValue {
  value: string;
  count: number;
  percentage: number;
}

export interface TraitRarity {
  traitType: string;
  value: string;
  count: number;
  percentage: number;
  nftIds: string[];
}

export interface TraitSales {
  traitType: string;
  value: string;
  sales: NFTTransaction[];
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

// ============================================
// FILTER TYPES
// ============================================

export interface NFTFilters {
  character?: NFTCharacter;
  traits?: Record<string, string[]>;
  minRank?: number;
  maxRank?: number;
  owner?: string;
  sortBy?: 'rank' | 'edition' | 'price' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingFilters {
  minPrice?: number;
  maxPrice?: number;
  character?: NFTCharacter;
  traits?: Record<string, string[]>;
  sortBy?: 'price' | 'recent' | 'rarity';
  sortOrder?: 'asc' | 'desc';
}

export type TimePeriod = '24h' | '7d' | '30d' | '90d' | 'all';

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  previousCursor?: string;
  total: number;
  hasMore: boolean;
}

export interface PageParams {
  cursor?: string;
  limit?: number;
}
