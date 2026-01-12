/**
 * Mock NFT Data
 *
 * Sample NFT data for development.
 */

import type { NFT, NFTCharacter, NFTTrait, NFTTransaction } from '@/types/domain';

const CHARACTERS: NFTCharacter[] = [
  'wojak',
  'doomer',
  'bloomer',
  'zoomer',
  'boomer',
  'coomer',
];

const TRAIT_DATA: Record<string, { values: string[]; weights: number[] }> = {
  Background: {
    values: ['Blue', 'Orange', 'Green', 'Purple', 'Red', 'Gold', 'Cyber Grid'],
    weights: [0.2, 0.2, 0.2, 0.15, 0.1, 0.1, 0.05],
  },
  Headwear: {
    values: ['None', 'Cap', 'Fedora', 'Crown', 'Halo', 'Laser Eyes'],
    weights: [0.3, 0.25, 0.2, 0.1, 0.1, 0.05],
  },
  Accessory: {
    values: ['None', 'Cigarette', 'Joint', 'Coffee', 'Phone', 'Diamond Hands'],
    weights: [0.3, 0.2, 0.15, 0.15, 0.1, 0.1],
  },
  Expression: {
    values: ['Sad', 'Happy', 'Neutral', 'Angry', 'Surprised', 'Smug'],
    weights: [0.2, 0.2, 0.2, 0.15, 0.15, 0.1],
  },
  Clothing: {
    values: ['Hoodie', 'Suit', 'Tank Top', 'None', 'Cyberpunk Jacket'],
    weights: [0.3, 0.25, 0.2, 0.15, 0.1],
  },
};

function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }

  return items[items.length - 1];
}

function createMockTraits(): NFTTrait[] {
  return Object.entries(TRAIT_DATA).map(([traitType, { values, weights }]) => {
    const value = weightedRandom(values, weights);
    const valueIndex = values.indexOf(value);
    const rarity = weights[valueIndex];
    const count = Math.floor(4200 * rarity);

    return {
      traitType,
      value,
      rarity,
      count,
    };
  });
}

function calculateRarityScore(traits: NFTTrait[]): number {
  return traits.reduce((score, trait) => score + 1 / trait.rarity, 0);
}

function createMockNFT(edition: number): NFT {
  const character = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const traits = createMockTraits();
  const rarityScore = calculateRarityScore(traits);

  return {
    id: `wfp-${edition}`,
    name: `Wojak Farmer #${edition}`,
    edition,
    imageUrl: `https://nft.wojak.ink/images/${edition}.png`,
    thumbnailUrl: `https://nft.wojak.ink/thumbnails/${edition}.png`,
    character,
    traits,
    rarity: {
      rank: 0, // Calculated after all NFTs generated
      score: rarityScore,
      percentile: 0,
    },
    owner: `xch1${Math.random().toString(36).substring(2, 10)}...`,
    mintedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastSalePrice:
      Math.random() > 0.7
        ? parseFloat((Math.random() * 10 + 0.1).toFixed(2))
        : undefined,
  };
}

function generateMockNFTs(count: number = 50): NFT[] {
  const nfts = Array.from({ length: count }, (_, i) => createMockNFT(i + 1));

  // Calculate ranks based on rarity score
  nfts.sort((a, b) => b.rarity.score - a.rarity.score);
  nfts.forEach((nft, index) => {
    nft.rarity.rank = index + 1;
    nft.rarity.percentile = ((count - index) / count) * 100;
  });

  return nfts;
}

// Generate mock data
export const mockNFTs = generateMockNFTs(50);

// Generate mock transactions
export const mockTransactions: NFTTransaction[] = mockNFTs
  .slice(0, 20)
  .flatMap((nft) => [
    {
      id: `${nft.id}-mint`,
      type: 'mint' as const,
      from: '0x0',
      to: nft.owner ?? 'unknown',
      timestamp: nft.mintedAt,
      txHash: `0x${Math.random().toString(16).substring(2, 34)}`,
    },
    ...(nft.lastSalePrice
      ? [
          {
            id: `${nft.id}-sale`,
            type: 'sale' as const,
            from: `xch1${Math.random().toString(36).substring(2, 10)}...`,
            to: nft.owner ?? 'unknown',
            price: nft.lastSalePrice,
            timestamp: new Date(
              nft.mintedAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
            ),
            txHash: `0x${Math.random().toString(16).substring(2, 34)}`,
          },
        ]
      : []),
  ]);

// Extract trait types from NFTs
export const mockTraitTypes = Object.entries(TRAIT_DATA).map(
  ([name, { values, weights }]) => ({
    name,
    values: values.map((value, i) => ({
      value,
      count: Math.floor(4200 * weights[i]),
      percentage: weights[i] * 100,
    })),
    totalCount: 4200,
  })
);
