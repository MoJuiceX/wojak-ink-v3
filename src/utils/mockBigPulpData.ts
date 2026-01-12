/**
 * Mock BigPulp Data Generator
 *
 * Generates realistic mock data for development and testing.
 */

import type {
  NFTAnalysis,
  NFTBasic,
  RarityAnalysis,
  MarketPosition,
  AnalysisBadge,
  ProvenanceInfo,
  ProvenanceTrait,
  RareCombo,
  MarketStats,
  HeatMapCell,
  PriceDistribution,
  AttributeStats,
  AttributeCategory,
  NFTSale,
  CharacterType,
  RarityTier,
} from '@/types/bigpulp';
import { RARITY_BINS, PRICE_BINS } from '@/config/heatMapConfig';

// ============ Constants ============

const TOTAL_SUPPLY = 4200;
const XCH_USD_RATE = 45; // Mock exchange rate

const CHARACTER_TYPES: CharacterType[] = [
  'wojak',
  'pepe',
  'bobo',
  'chad',
  'doomer',
  'bloomer',
  'zoomer',
];

const TRAIT_CATEGORIES = [
  'Background',
  'Body',
  'Eyes',
  'Mouth',
  'Head',
  'Accessory',
  'Special',
];

const TRAIT_VALUES: Record<string, string[]> = {
  Background: [
    'Sunset',
    'Night Sky',
    'Farm',
    'City',
    'Beach',
    'Mountains',
    'Forest',
    'Abstract',
  ],
  Eyes: [
    'Normal',
    'Laser Eyes',
    'Sunglasses',
    'Crying',
    'Heart Eyes',
    'Dizzy',
    'X Eyes',
    'Star Eyes',
  ],
  Mouth: [
    'Smile',
    'Frown',
    'Open',
    'Tongue',
    'Pipe',
    'Cigarette',
    'Mask',
    'Beard',
  ],
  Head: [
    'None',
    'Tang Cap',
    'Crown',
    'Halo',
    'Chef Hat',
    'Cowboy Hat',
    'Beanie',
    'Helmet',
  ],
  Accessory: [
    'None',
    'Gold Chain',
    'Tie',
    'Scarf',
    'Headphones',
    'Earring',
    'Glasses',
  ],
  Special: ['None', 'Rainbow', 'Glowing', 'Holographic', 'Animated'],
};

const RARE_COMBOS_DATA = [
  { name: 'The Oracle', traits: ['Laser Eyes', 'Crystal Ball'], count: 3 },
  { name: 'Tang Royalty', traits: ['Tang Cap', 'Crown'], count: 5 },
  { name: 'Night Rider', traits: ['Night Sky', 'Sunglasses'], count: 8 },
  { name: 'Golden Farmer', traits: ['Gold Chain', 'Cowboy Hat'], count: 12 },
  { name: 'Zen Master', traits: ['Halo', 'Pipe'], count: 7 },
];

// ============ Helper Functions ============

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTierFromRank(rank: number): RarityTier {
  const percentile = (rank / TOTAL_SUPPLY) * 100;
  if (percentile <= 1) return 'legendary';
  if (percentile <= 5) return 'epic';
  if (percentile <= 15) return 'rare';
  if (percentile <= 50) return 'uncommon';
  return 'common';
}

function padId(num: number): string {
  return String(num).padStart(4, '0');
}

// ============ NFT Generation ============

export function generateMockNFT(id: number): NFTBasic {
  const characterType = randomFrom(CHARACTER_TYPES);
  const traits = TRAIT_CATEGORIES.map((category) => ({
    category,
    value: randomFrom(TRAIT_VALUES[category] || ['Default']),
  }));

  return {
    id: `WFP-${padId(id)}`,
    tokenId: `token_${id}`,
    name: `Wojak Farmer #${padId(id)}`,
    characterType,
    imageUrl: `/assets/nfts/${padId(id)}.png`,
    thumbnailUrl: `/assets/nfts/thumbs/${padId(id)}.png`,
    traits,
  };
}

export function generateMockRarity(rank: number): RarityAnalysis {
  const tier = getTierFromRank(rank);
  const percentile = parseFloat(((rank / TOTAL_SUPPLY) * 100).toFixed(1));

  return {
    rank,
    totalSupply: TOTAL_SUPPLY,
    percentile,
    score: 1000 - rank * 0.2 + randomFloat(-10, 10),
    tier,
    typeRank: randomInt(1, Math.ceil(rank / 5)),
    typeTotal: randomInt(500, 900),
  };
}

export function generateMockMarket(rank: number): MarketPosition {
  const isListed = Math.random() > 0.7;
  const floorPrice = randomFloat(0.3, 0.8);

  // Rarer NFTs tend to have higher prices
  const rarityMultiplier = 1 + (TOTAL_SUPPLY - rank) / TOTAL_SUPPLY;
  let listingPrice: number | undefined;
  let priceVsFloor: number | undefined;

  if (isListed) {
    listingPrice = parseFloat(
      (floorPrice * rarityMultiplier * randomFloat(0.8, 2.5)).toFixed(2)
    );
    priceVsFloor = parseFloat(
      (((listingPrice - floorPrice) / floorPrice) * 100).toFixed(1)
    );
  }

  const hasLastSale = Math.random() > 0.5;

  return {
    isListed,
    listingPrice,
    listingPriceUSD: listingPrice ? listingPrice * XCH_USD_RATE : undefined,
    floorPrice,
    floorPriceUSD: floorPrice * XCH_USD_RATE,
    estimatedValue: parseFloat(
      (floorPrice * rarityMultiplier * randomFloat(0.9, 1.3)).toFixed(2)
    ),
    priceVsFloor,
    lastSale: hasLastSale
      ? {
          price: randomFloat(0.2, listingPrice || floorPrice * 2),
          date: new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000),
        }
      : undefined,
  };
}

export function generateMockBadges(
  rank: number,
  hasRareCombo: boolean
): AnalysisBadge[] {
  const badges: AnalysisBadge[] = [];
  let priority = 0;

  // Crown holder (top 100)
  if (rank <= 100) {
    badges.push({
      id: 'crown',
      type: 'crown-holder',
      label: 'Crown Holder',
      description: 'Top 100 rarest in the collection',
      color: '#fbbf24',
      icon: 'crown',
      priority: priority++,
    });
  }

  // Special edition (random ~5%)
  if (Math.random() < 0.05) {
    badges.push({
      id: 'special',
      type: 'special-edition',
      label: 'Special Edition',
      description: 'Community tribute piece',
      color: '#a855f7',
      icon: 'star',
      priority: priority++,
    });
  }

  // Top 10%
  if (rank <= 420) {
    badges.push({
      id: 'top10',
      type: 'top-10-percent',
      label: 'Top 10%',
      description: 'Top 10% rarity',
      color: '#ff6b00',
      icon: 'trophy',
      priority: priority++,
    });
  }

  // Rare combo
  if (hasRareCombo) {
    badges.push({
      id: 'combo',
      type: 'rare-combo',
      label: 'Rare Combo',
      description: 'Has a rare trait combination',
      color: '#ec4899',
      icon: 'sparkles',
      priority: priority++,
    });
  }

  return badges;
}

export function generateMockProvenance(
  nft: NFTBasic
): ProvenanceInfo {
  const highValueTraits: ProvenanceTrait[] = [];

  // Pick 1-3 traits as "high value"
  const numHighValue = randomInt(1, 3);
  const shuffledTraits = [...(nft.traits || [])].sort(
    () => Math.random() - 0.5
  );

  for (let i = 0; i < numHighValue && i < shuffledTraits.length; i++) {
    const trait = shuffledTraits[i];
    if (trait.value !== 'None' && trait.value !== 'Normal') {
      highValueTraits.push({
        category: trait.category,
        value: trait.value,
        rarity: randomFloat(0.5, 15),
        valueImpact: randomFrom(['high', 'medium', 'low']),
        reason: `${trait.value} is a ${randomFrom(['fan favorite', 'rare', 'sought-after', 'iconic'])} ${trait.category.toLowerCase()} trait`,
      });
    }
  }

  return {
    highValueTraits,
    traitSynergies:
      highValueTraits.length >= 2
        ? [`${highValueTraits[0].value} + ${highValueTraits[1]?.value || 'combo'}`]
        : [],
    historicalSignificance:
      Math.random() > 0.8 ? 'Early mint from genesis collection' : undefined,
  };
}

export function generateMockRareCombos(nft: NFTBasic): RareCombo[] {
  const combos: RareCombo[] = [];

  // Check if NFT has any known rare combos
  const nftTraitValues = (nft.traits || []).map((t) => t.value);

  for (const combo of RARE_COMBOS_DATA) {
    const hasAll = combo.traits.every((t) => nftTraitValues.includes(t));
    if (hasAll) {
      combos.push({
        traits: combo.traits,
        comboName: combo.name,
        occurrences: combo.count,
        valueMultiplier: randomFloat(1.5, 3),
      });
    }
  }

  // Random chance of having an unnamed combo
  if (combos.length === 0 && Math.random() < 0.1) {
    const randomTraits = nftTraitValues
      .filter((t) => t !== 'None' && t !== 'Normal')
      .slice(0, 2);
    if (randomTraits.length === 2) {
      combos.push({
        traits: randomTraits,
        occurrences: randomInt(5, 20),
        valueMultiplier: randomFloat(1.2, 1.8),
      });
    }
  }

  return combos;
}

// ============ Full Analysis Generation ============

export function generateMockAnalysis(id: number): NFTAnalysis {
  const rank = id <= 100 ? id : randomInt(id, Math.min(id + 500, TOTAL_SUPPLY));
  const nft = generateMockNFT(id);
  const rareCombos = generateMockRareCombos(nft);

  return {
    nft,
    rarity: generateMockRarity(rank),
    market: generateMockMarket(rank),
    badges: generateMockBadges(rank, rareCombos.length > 0),
    provenance: generateMockProvenance(nft),
    rareCombos,
  };
}

export function generateRandomAnalysis(): NFTAnalysis {
  const id = randomInt(1, TOTAL_SUPPLY);
  return generateMockAnalysis(id);
}

// ============ Market Stats ============

export function generateMockMarketStats(): MarketStats {
  const floorPrice = randomFloat(0.3, 0.6);
  const listedCount = randomInt(100, 200);

  return {
    listedCount,
    totalSupply: TOTAL_SUPPLY,
    floorPrice,
    floorPriceUSD: floorPrice * XCH_USD_RATE,
    ceilingPrice: randomFloat(50, 150),
    averagePrice: randomFloat(1, 3),
    medianPrice: randomFloat(0.6, 1.2),
    totalVolume: randomFloat(500, 2000),
    totalVolumeUSD: randomFloat(500 * XCH_USD_RATE, 2000 * XCH_USD_RATE),
    totalTrades: randomInt(500, 1500),
    marketCap: floorPrice * TOTAL_SUPPLY,
    marketCapUSD: floorPrice * TOTAL_SUPPLY * XCH_USD_RATE,
    lastUpdated: new Date(),
  };
}

// ============ Heat Map Data ============

export function generateMockHeatMapData(): HeatMapCell[][] {
  const data: HeatMapCell[][] = [];

  for (let r = 0; r < RARITY_BINS.length; r++) {
    const row: HeatMapCell[] = [];
    for (let p = 0; p < PRICE_BINS.length; p++) {
      // More NFTs in common rarity + low price cells
      const baseCount = Math.max(0, 20 - r * 1.5 - p * 2);
      const count = Math.max(0, Math.floor(baseCount + randomInt(-5, 5)));

      const intensity = Math.min(1, count / 15);

      const nfts: NFTBasic[] = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        nfts.push(generateMockNFT(randomInt(1, TOTAL_SUPPLY)));
      }

      row.push({
        rarityBin: RARITY_BINS[r],
        priceBin: PRICE_BINS[p],
        count,
        nfts,
        intensity,
        label: `Rarity ${RARITY_BINS[r].label}, price ${PRICE_BINS[p].label}: ${count} NFTs`,
      });
    }
    data.push(row);
  }

  return data;
}

// ============ Price Distribution ============

export function generateMockPriceDistribution(): PriceDistribution {
  const bins = PRICE_BINS.map((bin) => {
    const count = Math.max(
      0,
      Math.floor(50 - bin.index * 8 + randomInt(-10, 10))
    );
    return {
      range: bin.label,
      minPrice: bin.minPrice,
      maxPrice: bin.maxPrice,
      count,
      percentage: 0, // Calculate after
    };
  });

  const total = bins.reduce((sum, b) => sum + b.count, 0);
  bins.forEach((b) => {
    b.percentage = parseFloat(((b.count / total) * 100).toFixed(1));
  });

  return {
    bins,
    totalListed: total,
  };
}

// ============ Attributes ============

export function generateMockAttributeStats(): AttributeStats[] {
  const attributes: AttributeStats[] = [];

  for (const [category, values] of Object.entries(TRAIT_VALUES)) {
    for (const value of values) {
      if (value === 'None' || value === 'Normal') continue;

      const count = randomInt(10, 500);
      const rarity = parseFloat(((count / TOTAL_SUPPLY) * 100).toFixed(2));
      const totalSales = randomInt(5, count);

      attributes.push({
        category,
        value,
        count,
        rarity,
        totalSales,
        avgPrice: randomFloat(0.5, 5),
        minPrice: randomFloat(0.2, 0.8),
        maxPrice: randomFloat(3, 20),
        lastSalePrice: randomFloat(0.5, 3),
        lastSaleDate: new Date(
          Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000
        ),
      });
    }
  }

  return attributes;
}

export function generateMockAttributeCategories(): AttributeCategory[] {
  return Object.entries(TRAIT_VALUES).map(([name, values]) => ({
    name,
    count: values.filter((v) => v !== 'None' && v !== 'Normal').length,
    attributes: generateMockAttributeStats().filter((a) => a.category === name),
  }));
}

// ============ Top Sales ============

export function generateMockTopSales(count = 10): NFTSale[] {
  return Array.from({ length: count }, () => {
    const price = randomFloat(5, 50);
    return {
      nft: generateMockNFT(randomInt(1, 500)),
      price,
      priceUSD: price * XCH_USD_RATE,
      date: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000),
    };
  }).sort((a, b) => b.price - a.price);
}

// ============ Rarest NFTs ============

export function generateMockRarestFinds(count = 10): NFTBasic[] {
  return Array.from({ length: count }, (_, i) => generateMockNFT(i + 1));
}
