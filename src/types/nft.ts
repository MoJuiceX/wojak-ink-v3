/**
 * NFT Type Definitions
 *
 * Core data models for the Wojak Farmers Plot NFT collection.
 */

export interface NFTTrait {
  category: string;
  value: string;
  rarity: number; // Percentage (0-100)
  count: number;
}

export interface NFTListing {
  price: number; // In mojos
  priceXCH: number;
  priceUSD: number;
  seller: string;
  listedAt: Date;
  marketplace: 'mintgarden' | 'dexie' | 'spacescan';
  listingUrl: string;
}

export interface NFTTransaction {
  type: 'mint' | 'sale' | 'transfer' | 'list' | 'delist';
  from: string;
  to: string;
  price?: number; // In XCH
  timestamp: Date;
  txId: string;
  explorerUrl: string;
}

export type RarityTier = 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  characterType: CharacterType;
  imageUrl: string;
  thumbnailUrl: string;
  blurDataUrl: string;

  // Rarity
  rarityRank: number;
  rarityScore: number;
  rarityTier: RarityTier;

  // Traits
  traits: NFTTrait[];
  traitCount: number;

  // Market
  listing?: NFTListing;
  lastSale?: {
    price: number;
    date: Date;
  };

  // History
  transactions: NFTTransaction[];

  // Metadata
  mintedAt: Date;
  owner: string;
  collection: 'wojak-farmers-plot';

  // Flags
  isSpecialEdition: boolean;
  isCommunityTribute: boolean;
  specialEditionName?: string;
}

export type CharacterType =
  | 'wojak'
  | 'soyjak'
  | 'waifu'
  | 'baddie'
  | 'papa-tang'
  | 'monkey-zoo'
  | 'bepe-wojak'
  | 'bepe-soyjak'
  | 'bepe-waifu'
  | 'bepe-baddie'
  | 'alien-wojak'
  | 'alien-soyjak'
  | 'alien-waifu'
  | 'alien-baddie';

export interface CharacterTypeConfig {
  id: CharacterType;
  name: string;
  shortName: string;
  description: string;
  count: number;
  previewImage: string;
  accentColor?: string;
}

// Gallery state types
export type SortMode = 'id-asc' | 'id-desc' | 'rarity-asc' | 'rarity-desc' | 'price-asc' | 'price-desc';
export type FilterMode = 'all' | 'listed';

export interface GalleryFilters {
  sortMode: SortMode;
  filterMode: FilterMode;
  maxPriceFilter: number | null;
  searchQuery: string;
}
