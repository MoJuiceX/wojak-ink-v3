/**
 * Mock Data Generator
 *
 * Generate mock NFT data for development and testing.
 */

import type {
  NFT,
  NFTTrait,
  NFTTransaction,
  NFTListing,
  CharacterType,
  RarityTier,
} from '@/types/nft';
import { getCharacterConfig } from '@/config/characters';

// Mock XCH to USD rate
const XCH_TO_USD = 50;

// Trait pools for random generation
const TRAIT_POOLS = {
  Background: ['Sunset', 'Night Sky', 'Farm Field', 'City', 'Ocean', 'Mountains', 'Desert', 'Forest'],
  Body: ['Standard', 'Farmer', 'Business', 'Casual', 'Punk', 'Military', 'Royal'],
  Eyes: ['Normal', 'Laser', 'Crying', 'Angry', 'Happy', 'Sunglasses', 'VR Headset'],
  Headwear: ['None', 'Tang Cap', 'Crown', 'Halo', 'Helmet', 'Bandana', 'Top Hat'],
  Accessory: ['None', 'Golden Hoe', 'Laptop', 'Phone', 'Sword', 'Shield', 'Bag of XCH'],
  Special: ['None', 'Community Edition', 'Genesis', 'Collaboration', 'Holiday Special'],
};

// Rarity tier thresholds (by rank percentage)
const RARITY_THRESHOLDS = {
  legendary: 0.02, // Top 2%
  epic: 0.10, // Top 10%
  rare: 0.25, // Top 25%
  uncommon: 0.50, // Top 50%
  common: 1.0, // Rest
};

// Price ranges by rarity tier (in XCH)
const PRICE_RANGES: Record<RarityTier, [number, number]> = {
  legendary: [10, 100],
  epic: [2, 15],
  rare: [1, 5],
  uncommon: [0.5, 2],
  common: [0.1, 1],
};

/**
 * Generate a random number in range
 */
function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Pick random item from array
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random rarity percentage
 */
function randomRarity(): number {
  // Weighted towards common rarities
  const roll = Math.random();
  if (roll < 0.5) return randomInRange(10, 50); // Common
  if (roll < 0.8) return randomInRange(5, 15); // Uncommon
  if (roll < 0.95) return randomInRange(1, 5); // Rare
  return randomInRange(0.1, 1); // Very rare
}

/**
 * Determine rarity tier from rank
 */
function getRarityTier(rank: number, total: number): RarityTier {
  const percentile = rank / total;
  if (percentile <= RARITY_THRESHOLDS.legendary) return 'legendary';
  if (percentile <= RARITY_THRESHOLDS.epic) return 'epic';
  if (percentile <= RARITY_THRESHOLDS.rare) return 'rare';
  if (percentile <= RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

/**
 * Generate mock traits for an NFT
 */
export function generateMockTraits(): NFTTrait[] {
  const traits: NFTTrait[] = [];

  for (const [category, values] of Object.entries(TRAIT_POOLS)) {
    const value = randomPick(values);
    if (value !== 'None') {
      traits.push({
        category,
        value,
        rarity: randomRarity(),
        count: Math.floor(randomInRange(10, 500)),
      });
    }
  }

  return traits;
}

/**
 * Generate mock transaction history
 */
export function generateMockTransactions(count: number = 5): NFTTransaction[] {
  const transactions: NFTTransaction[] = [];
  const now = Date.now();
  const types: NFTTransaction['type'][] = ['mint', 'sale', 'transfer', 'list', 'delist'];

  for (let i = 0; i < count; i++) {
    const daysAgo = i * randomInRange(1, 30);
    const type = i === count - 1 ? 'mint' : randomPick(types.filter((t) => t !== 'mint'));

    transactions.push({
      type,
      from: `xch1${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      to: `xch1${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      price: type === 'sale' ? randomInRange(0.5, 10) : undefined,
      timestamp: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      txId: `0x${Math.random().toString(16).substring(2, 18)}`,
      explorerUrl: `https://spacescan.io/tx/${Math.random().toString(16).substring(2, 18)}`,
    });
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate a mock listing
 */
function generateMockListing(rarityTier: RarityTier): NFTListing | undefined {
  // ~30% chance of being listed
  if (Math.random() > 0.3) return undefined;

  const [minPrice, maxPrice] = PRICE_RANGES[rarityTier];
  const priceXCH = randomInRange(minPrice, maxPrice);
  const marketplaces: NFTListing['marketplace'][] = ['mintgarden', 'dexie', 'spacescan'];

  return {
    price: priceXCH * 1_000_000_000_000, // Convert to mojos
    priceXCH,
    priceUSD: priceXCH * XCH_TO_USD,
    seller: `xch1${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
    listedAt: new Date(Date.now() - randomInRange(1, 30) * 24 * 60 * 60 * 1000),
    marketplace: randomPick(marketplaces),
    listingUrl: `https://mintgarden.io/nfts/${Math.random().toString(36).substring(2, 12)}`,
  };
}

/**
 * Generate mock NFTs for a character type
 */
export function generateMockNFTs(characterType: CharacterType, count: number = 20): NFT[] {
  const config = getCharacterConfig(characterType);
  if (!config) return [];

  const nfts: NFT[] = [];

  for (let i = 0; i < count; i++) {
    const nftNumber = i + 1;
    const id = `WFP-${String(nftNumber).padStart(4, '0')}`;
    const rarityRank = Math.floor(randomInRange(1, 4200));
    const rarityTier = getRarityTier(rarityRank, 4200);
    const traits = generateMockTraits();

    nfts.push({
      id,
      tokenId: `nft1${Math.random().toString(36).substring(2, 20)}`,
      name: `${config.name} Farmer #${String(nftNumber).padStart(4, '0')}`,
      characterType,
      // Use picsum.photos for mock images
      imageUrl: `https://picsum.photos/seed/${id}/800/800`,
      thumbnailUrl: `https://picsum.photos/seed/${id}/400/400`,
      blurDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAIhAAAgEDBAMBAAAAAAAAAAAAAQIDBAURAAYSIRMxQXH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8Az2OxW+3yxvJIIzKxZo0QHIB9dDXqVqONZpC8gLEMWJ9/dNGQQlwT+ib//9k=',
      rarityRank,
      rarityScore: randomInRange(50, 150),
      rarityTier,
      traits,
      traitCount: traits.length,
      listing: generateMockListing(rarityTier),
      lastSale: Math.random() > 0.5
        ? {
            price: randomInRange(0.5, 5),
            date: new Date(Date.now() - randomInRange(10, 60) * 24 * 60 * 60 * 1000),
          }
        : undefined,
      transactions: generateMockTransactions(Math.floor(randomInRange(2, 8))),
      mintedAt: new Date('2024-01-15'),
      owner: `xch1${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
      collection: 'wojak-farmers-plot',
      isSpecialEdition: Math.random() > 0.95,
      isCommunityTribute: Math.random() > 0.98,
      specialEditionName: Math.random() > 0.95 ? 'Genesis Edition' : undefined,
    });
  }

  return nfts;
}

/**
 * Format price in XCH
 */
export function formatPriceXCH(price: number): string {
  if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K XCH`;
  }
  if (price >= 100) {
    return `${price.toFixed(0)} XCH`;
  }
  if (price >= 10) {
    return `${price.toFixed(1)} XCH`;
  }
  return `${price.toFixed(2)} XCH`;
}

/**
 * Format price in USD
 */
export function formatPriceUSD(price: number): string {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`;
  }
  if (price >= 100) {
    return `$${price.toFixed(0)}`;
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Get rarity tier color
 */
export function getRarityTierColor(tier: RarityTier): string {
  const colors: Record<RarityTier, string> = {
    legendary: '#fbbf24', // Gold
    epic: '#a855f7', // Purple
    rare: '#3b82f6', // Blue
    uncommon: '#22c55e', // Green
    common: 'var(--color-text-muted)',
  };
  return colors[tier];
}

/**
 * Get rarity tier display name
 */
export function getRarityTierName(tier: RarityTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
