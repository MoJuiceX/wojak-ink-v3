/**
 * BigPulp Service
 *
 * Loads BigPulp Intelligence data from JSON files and real market APIs.
 */

import type {
  NFTAnalysis,
  MarketStats,
  HeatMapCell,
  PriceDistribution,
  AttributeStats,
  NFTSale,
  NFTBasic,
  RarityTier,
} from '@/types/bigpulp';
import { COLLECTION_SIZE, getNftImageUrl } from './constants';
import { marketService } from './marketService';
import { getRecentSales, type SaleRecord } from './salesDatabank';
import { fetchCollectionStats } from './parseBotService';

// ============ Types for JSON Data ============

interface NFTTakeEntry {
  token_id: number;
  open_rarity_rank: number;
  take: string;
  tone: string;
  flags?: {
    is_top_10?: boolean;
    has_crown?: boolean;
    [key: string]: unknown;
  };
}

// Interface kept for future use
// interface TraitInsight {
//   trait_name: string;
//   category: string;
//   rarity: number;
//   value_assessment: string;
// }

// ============ Cache ============

let nftTakesCache: Record<string, NFTTakeEntry> | null = null;
// let traitInsightsCache: TraitInsight[] | null = null; // Kept for future use
let traitStatsCache: AttributeStats[] | null = null;

// ============ Loaders ============

async function loadNftTakes(): Promise<Record<string, NFTTakeEntry>> {
  if (nftTakesCache) return nftTakesCache;

  try {
    const response = await fetch('/assets/BigPulp/nft_takes_v2.json');
    if (!response.ok) throw new Error('Failed to load NFT takes');
    nftTakesCache = await response.json();
    return nftTakesCache!;
  } catch (error) {
    console.error('Failed to load NFT takes:', error);
    return {};
  }
}

// Function kept for future use - loads trait insights JSON
// async function loadTraitInsights(): Promise<TraitInsight[]> {
//   if (traitInsightsCache) return traitInsightsCache;
//   try {
//     const response = await fetch('/assets/BigPulp/trait_insights.json');
//     if (!response.ok) throw new Error('Failed to load trait insights');
//     traitInsightsCache = await response.json();
//     return traitInsightsCache!;
//   } catch (error) {
//     console.error('Failed to load trait insights:', error);
//     return [];
//   }
// }

// Types for trait rankings data
interface TraitRankingEntry {
  rank: number;
  of: number;
  count: number;
}

interface TraitRankingsData {
  lookup: Record<string, Record<string, TraitRankingEntry>>;
}

// Cache for trait rankings
let traitRankingsCache: TraitRankingsData | null = null;

// Cache for metadata (NFT ID -> traits mapping)
interface MetadataEntry {
  edition: number;
  attributes: Array<{ trait_type: string; value: string }>;
}
let metadataCache: MetadataEntry[] | null = null;

async function loadTraitRankings(): Promise<TraitRankingsData> {
  if (traitRankingsCache) return traitRankingsCache;

  try {
    const response = await fetch('/assets/nft-data/trait_rankings.json');
    if (!response.ok) throw new Error('Failed to load trait rankings');
    traitRankingsCache = await response.json();
    return traitRankingsCache!;
  } catch (error) {
    console.error('Failed to load trait rankings:', error);
    return { lookup: {} };
  }
}

async function loadMetadata(): Promise<MetadataEntry[]> {
  if (metadataCache) return metadataCache;

  try {
    const response = await fetch('/assets/nft-data/metadata.json');
    if (!response.ok) throw new Error('Failed to load metadata');
    metadataCache = await response.json();
    return metadataCache!;
  } catch (error) {
    console.error('Failed to load metadata:', error);
    return [];
  }
}

// Types for attribute stats JSON (pre-generated from CSV)
interface AttributeStatsJSON {
  generatedAt: string;
  totalAttributes: number;
  totalSalesRecords: number;
  xchUsdRate: number;
  outlierNote: string;
  attributes: Record<string, {
    category: string;
    value: string;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    totalSales: number;
    lastSaleDate: string;
    lastSalePrice: number;
    sales: Array<{
      nftEdition: number;
      priceXCH: number;
      priceUSD: number;
      date: string;
      originalPrice: number;
      originalCurrency: string;
    }>;
  }>;
}

// Cache for attribute stats JSON
let attributeStatsJSONCache: AttributeStatsJSON | null = null;

async function loadAttributeStatsJSON(): Promise<AttributeStatsJSON | null> {
  if (attributeStatsJSONCache) return attributeStatsJSONCache;

  try {
    const response = await fetch('/assets/nft-data/attribute_stats.json');
    if (!response.ok) throw new Error('Failed to load attribute stats JSON');
    attributeStatsJSONCache = await response.json();
    return attributeStatsJSONCache;
  } catch (error) {
    console.warn('Failed to load attribute_stats.json, falling back to dynamic calculation:', error);
    return null;
  }
}

async function loadTraitStats(): Promise<AttributeStats[]> {
  if (traitStatsCache) return traitStatsCache;

  // Try to load from pre-generated JSON first (our fallback/baseline data)
  const jsonData = await loadAttributeStatsJSON();

  if (jsonData) {
    // Load trait rankings for NFT counts
    const traitRankings = await loadTraitRankings();

    const stats: AttributeStats[] = [];

    for (const [_key, attr] of Object.entries(jsonData.attributes)) {
      // Get NFT count from trait rankings
      const traitData = traitRankings.lookup[attr.category]?.[attr.value];
      const count = traitData?.count || 0;

      stats.push({
        category: attr.category,
        value: attr.value,
        count,
        rarity: count > 0 ? (count / COLLECTION_SIZE) * 100 : 0,
        totalSales: attr.totalSales,
        avgPrice: attr.avgPrice,
        minPrice: attr.minPrice,
        maxPrice: attr.maxPrice,
        lastSalePrice: attr.lastSalePrice,
        lastSaleDate: attr.lastSaleDate ? new Date(attr.lastSaleDate) : undefined,
        // Map individual sales for detail view
        recentSales: attr.sales.map(sale => ({
          nftId: String(sale.nftEdition),
          nftImage: getNftImageUrl(sale.nftEdition),
          price: sale.priceXCH,
          date: new Date(sale.date),
        })),
      });
    }

    // Also add attributes with no sales from trait rankings
    for (const [category, traits] of Object.entries(traitRankings.lookup)) {
      for (const [value, data] of Object.entries(traits)) {
        const key = `${category}|${value}`;
        if (!jsonData.attributes[key]) {
          stats.push({
            category,
            value,
            count: data.count,
            rarity: (data.count / COLLECTION_SIZE) * 100,
            totalSales: 0,
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            lastSaleDate: undefined,
            recentSales: [],
          });
        }
      }
    }

    // Sort by category then by average price (highest first for attributes with sales)
    stats.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      // Put attributes with sales first
      if (a.totalSales > 0 && b.totalSales === 0) return -1;
      if (a.totalSales === 0 && b.totalSales > 0) return 1;
      return b.avgPrice - a.avgPrice;
    });

    traitStatsCache = stats;
    return traitStatsCache;
  }

  // Fallback: Load from trait rankings and salesDatabank (dynamic calculation)
  const traitRankings = await loadTraitRankings();
  const metadata = await loadMetadata();

  // Build NFT ID -> traits lookup
  const nftTraitsMap = new Map<number, Record<string, string>>();
  for (const nft of metadata) {
    const traits: Record<string, string> = {};
    for (const attr of nft.attributes) {
      traits[attr.trait_type] = attr.value;
    }
    nftTraitsMap.set(nft.edition, traits);
  }

  // Get all sales from databank
  const allSales = getRecentSales(10000);

  // Build trait -> sales mapping with timestamps
  interface TraitSaleData {
    prices: number[];
    lastTimestamp: number;
  }
  const traitSalesMap = new Map<string, TraitSaleData>();

  for (const sale of allSales) {
    const nftTraits = nftTraitsMap.get(sale.nftId);
    if (!nftTraits) continue;

    for (const [category, value] of Object.entries(nftTraits)) {
      const key = `${category}:${value}`;
      if (!traitSalesMap.has(key)) {
        traitSalesMap.set(key, { prices: [], lastTimestamp: 0 });
      }
      const data = traitSalesMap.get(key)!;
      data.prices.push(sale.xchEquivalent);
      if (sale.timestamp > data.lastTimestamp) {
        data.lastTimestamp = sale.timestamp;
      }
    }
  }

  // Build AttributeStats array from trait rankings
  const stats: AttributeStats[] = [];

  for (const [category, traits] of Object.entries(traitRankings.lookup)) {
    for (const [value, data] of Object.entries(traits)) {
      const key = `${category}:${value}`;
      const salesData = traitSalesMap.get(key);
      const prices = salesData?.prices || [];

      const totalSales = prices.length;
      const avgPrice = totalSales > 0
        ? prices.reduce((sum, p) => sum + p, 0) / totalSales
        : 0;
      const minPrice = totalSales > 0 ? Math.min(...prices) : 0;
      const maxPrice = totalSales > 0 ? Math.max(...prices) : 0;
      const lastSaleDate = salesData?.lastTimestamp
        ? new Date(salesData.lastTimestamp)
        : undefined;

      stats.push({
        value,
        category,
        count: data.count,
        rarity: (data.count / COLLECTION_SIZE) * 100,
        totalSales,
        avgPrice,
        minPrice,
        maxPrice,
        lastSaleDate,
        recentSales: [],
      });
    }
  }

  // Sort by category then by rarity (rarer first)
  stats.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.rarity - b.rarity;
  });

  traitStatsCache = stats;
  return traitStatsCache;
}

// ============ Data Generators ============

async function generateHeatMapData(): Promise<HeatMapCell[][]> {
  // Load real listings and NFT takes for rarity data
  const [listingsResult, takes] = await Promise.all([
    marketService.fetchAllListings(),
    loadNftTakes(),
  ]);

  const listings = listingsResult.listings;

  // Create a map of NFT ID -> rarity rank
  const rarityMap = new Map<string, number>();
  for (const [id, entry] of Object.entries(takes)) {
    rarityMap.set(id, entry.open_rarity_rank);
  }

  // Price bin boundaries (8 bins: 0-1, 1-2, 2-3, 3-4, 4-5, 5-6, 6-10, 10+)
  const priceBins = [0, 1, 2, 3, 4, 5, 6, 10, Infinity];
  const priceLabels = ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-10', '10+'];

  // Rarity bin boundaries (10 bins: Top 10%, 20%, ..., 90%, Bottom 10%)
  const rarityBinDefs = [
    { label: 'Top 10%', minRank: 1, maxRank: 420 },
    { label: '20%', minRank: 421, maxRank: 840 },
    { label: '30%', minRank: 841, maxRank: 1260 },
    { label: '40%', minRank: 1261, maxRank: 1680 },
    { label: '50%', minRank: 1681, maxRank: 2100 },
    { label: '60%', minRank: 2101, maxRank: 2520 },
    { label: '70%', minRank: 2521, maxRank: 2940 },
    { label: '80%', minRank: 2941, maxRank: 3360 },
    { label: '90%', minRank: 3361, maxRank: 3780 },
    { label: 'Bottom 10%', minRank: 3781, maxRank: 4200 },
  ];

  // Generate 10x8 heatmap grid based on rarity/price distribution
  const grid: HeatMapCell[][] = [];

  for (let row = 0; row < 10; row++) {
    const rowCells: HeatMapCell[] = [];
    const rarityMinRank = rarityBinDefs[row].minRank;
    const rarityMaxRank = rarityBinDefs[row].maxRank;

    for (let col = 0; col < 8; col++) {
      const priceMin = priceBins[col];
      const priceMax = priceBins[col + 1];

      // Count listings that match this cell
      const matchingListings = listings.filter(listing => {
        const rank = rarityMap.get(listing.nftId) || COLLECTION_SIZE;
        const inRarityBin = rank >= rarityMinRank && rank <= rarityMaxRank;
        const inPriceBin = listing.priceXch >= priceMin && listing.priceXch < priceMax;
        return inRarityBin && inPriceBin;
      });

      const count = matchingListings.length;
      const maxCount = 50; // For normalization
      const intensity = Math.min(count / maxCount, 1);

      rowCells.push({
        rarityBin: {
          index: row,
          label: rarityBinDefs[row].label,
          minRank: rarityMinRank,
          maxRank: rarityMaxRank,
        },
        priceBin: {
          index: col,
          label: priceLabels[col],
          minPrice: priceMin,
          maxPrice: priceMax,
        },
        count,
        nfts: matchingListings.map(l => ({
          id: `WFP-${l.nftId.padStart(4, '0')}`,
          tokenId: l.launcherId || `nft1${l.nftId.padStart(4, '0')}`,
          name: l.name || `Wojak #${l.nftId.padStart(4, '0')}`,
          characterType: 'wojak' as const,
          imageUrl: getNftImageUrl(l.nftId),
          thumbnailUrl: getNftImageUrl(l.nftId),
        })),
        intensity,
        label: `${count} NFTs, ${rarityBinDefs[row].label}, price ${priceLabels[col]} XCH`,
      });
    }
    grid.push(rowCells);
  }

  return grid;
}

async function generatePriceDistribution(): Promise<PriceDistribution> {
  // Get real listings
  const listingsResult = await marketService.fetchAllListings();
  const listings = listingsResult.listings;
  const total = listings.length || 1; // Avoid division by zero

  // Define price bins
  const binDefs = [
    { range: '0-0.5 XCH', minPrice: 0, maxPrice: 0.5 },
    { range: '0.5-1 XCH', minPrice: 0.5, maxPrice: 1 },
    { range: '1-2 XCH', minPrice: 1, maxPrice: 2 },
    { range: '2-5 XCH', minPrice: 2, maxPrice: 5 },
    { range: '5-10 XCH', minPrice: 5, maxPrice: 10 },
    { range: '10+ XCH', minPrice: 10, maxPrice: Infinity },
  ];

  // Count listings in each bin
  const bins = binDefs.map(def => {
    const count = listings.filter(l =>
      l.priceXch >= def.minPrice && l.priceXch < def.maxPrice
    ).length;
    return {
      ...def,
      count,
      percentage: Math.round((count / total) * 100),
    };
  });

  return {
    bins,
    totalListed: total,
  };
}

// ============ Service Interface ============

export interface IBigPulpService {
  searchNFT(id: number): Promise<NFTAnalysis | null>;
  getRandomAnalysis(): Promise<NFTAnalysis>;
  getMarketStats(): Promise<MarketStats>;
  getHeatMapData(): Promise<HeatMapCell[][]>;
  getPriceDistribution(): Promise<PriceDistribution>;
  getAttributeStats(): Promise<AttributeStats[]>;
  getTopSales(): Promise<NFTSale[]>;
  getRarestFinds(): Promise<NFTBasic[]>;
}

function getRarityTier(rank: number): RarityTier {
  if (rank <= 42) return 'legendary';
  if (rank <= 200) return 'epic';
  if (rank <= 500) return 'rare';
  if (rank <= 1500) return 'uncommon';
  return 'common';
}

class BigPulpService implements IBigPulpService {
  async searchNFT(id: number): Promise<NFTAnalysis | null> {
    if (id < 1 || id > COLLECTION_SIZE) return null;

    const takes = await loadNftTakes();
    const take = takes[String(id)];
    const rank = take?.open_rarity_rank || id;

    const paddedId = String(id).padStart(4, '0');

    return {
      nft: {
        id: `WFP-${paddedId}`,
        tokenId: `nft1${paddedId}`,
        name: `Wojak #${paddedId}`,
        characterType: 'wojak',
        imageUrl: getNftImageUrl(id),
        thumbnailUrl: getNftImageUrl(id),
      },
      rarity: {
        rank,
        totalSupply: COLLECTION_SIZE,
        percentile: (rank / COLLECTION_SIZE) * 100,
        score: (COLLECTION_SIZE - rank) / COLLECTION_SIZE * 100,
        tier: getRarityTier(rank),
        typeRank: rank,
        typeTotal: COLLECTION_SIZE,
      },
      market: {
        isListed: false,
        floorPrice: 0.55,
        floorPriceUSD: 0.55 * 30, // Approximate XCH price
      },
      badges: take?.flags?.is_top_10 ? [{
        id: 'top-10',
        type: 'top-10-percent',
        label: 'Top 10%',
        description: 'This NFT is in the top 10% by rarity',
        color: 'purple',
        icon: 'star',
        priority: 1,
      }] : [],
      provenance: {
        highValueTraits: [],
        traitSynergies: [],
      },
      rareCombos: [],
    };
  }

  async getRandomAnalysis(): Promise<NFTAnalysis> {
    const randomId = Math.floor(Math.random() * COLLECTION_SIZE) + 1;
    const analysis = await this.searchNFT(randomId);
    return analysis!;
  }

  async getMarketStats(): Promise<MarketStats> {
    // Fetch real listings and collection stats in parallel
    const [listingsResult, collectionStats] = await Promise.all([
      marketService.fetchAllListings(),
      fetchCollectionStats().catch(() => ({
        floorPrice: 0,
        totalItems: COLLECTION_SIZE,
        totalVolume: 0,
        tradeCount: 0,
        name: 'Wojak Farmers Plot',
        description: '',
        thumbnailUri: '',
      })),
    ]);
    const listings = listingsResult.listings;

    // Get floor price (lowest listing)
    const floorPrice = listings.length > 0
      ? Math.min(...listings.map(l => l.priceXch))
      : 0;

    // Get ceiling price (highest listing)
    const ceilingPrice = listings.length > 0
      ? Math.max(...listings.map(l => l.priceXch))
      : 0;

    // Calculate average and median
    const sortedPrices = [...listings].map(l => l.priceXch).sort((a, b) => a - b);
    const avgPrice = listings.length > 0
      ? sortedPrices.reduce((sum, p) => sum + p, 0) / listings.length
      : 0;
    const medianPrice = listings.length > 0
      ? sortedPrices[Math.floor(sortedPrices.length / 2)]
      : 0;

    // XCH to USD conversion (approximate, could fetch from CoinGecko)
    const xchUsdPrice = 30; // TODO: Fetch real price

    return {
      listedCount: listings.length,
      totalSupply: COLLECTION_SIZE,
      floorPrice,
      floorPriceUSD: floorPrice * xchUsdPrice,
      ceilingPrice,
      averagePrice: avgPrice,
      medianPrice,
      totalVolume: collectionStats.totalVolume,
      totalVolumeUSD: collectionStats.totalVolume * xchUsdPrice,
      totalTrades: collectionStats.tradeCount,
      marketCap: COLLECTION_SIZE * floorPrice,
      marketCapUSD: COLLECTION_SIZE * floorPrice * xchUsdPrice,
      lastUpdated: listingsResult.lastUpdated,
    };
  }

  async getHeatMapData(): Promise<HeatMapCell[][]> {
    return await generateHeatMapData();
  }

  async getPriceDistribution(): Promise<PriceDistribution> {
    return await generatePriceDistribution();
  }

  async getAttributeStats(): Promise<AttributeStats[]> {
    return loadTraitStats();
  }

  async getTopSales(): Promise<NFTSale[]> {
    // Get real recent sales from the databank
    const recentSales = getRecentSales(20);

    if (recentSales.length === 0) {
      // Return empty array if no sales data available
      return [];
    }

    // Sort by price (highest first) and take top 10
    const topSales = [...recentSales]
      .sort((a, b) => b.xchEquivalent - a.xchEquivalent)
      .slice(0, 10);

    return topSales.map((sale: SaleRecord) => {
      const paddedId = String(sale.nftId).padStart(4, '0');
      return {
        nft: {
          id: `WFP-${paddedId}`,
          tokenId: `nft1${paddedId}`,
          name: `Wojak #${paddedId}`,
          characterType: 'wojak' as const,
          imageUrl: getNftImageUrl(sale.nftId),
          thumbnailUrl: getNftImageUrl(sale.nftId),
        },
        price: sale.xchEquivalent,
        priceUSD: sale.usdValue,
        date: new Date(sale.timestamp),
        buyer: '', // Not stored in databank currently
        seller: '',
      };
    });
  }

  async getRarestFinds(): Promise<NFTBasic[]> {
    // Load NFT takes to get real rarity rankings
    const takes = await loadNftTakes();

    // Convert to array and sort by rarity rank
    const rankedNfts = Object.entries(takes)
      .map(([id, entry]) => ({
        id: parseInt(id, 10),
        rank: entry.open_rarity_rank,
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);

    return rankedNfts.map(({ id }) => {
      const paddedId = String(id).padStart(4, '0');
      return {
        id: `WFP-${paddedId}`,
        tokenId: `nft1${paddedId}`,
        name: `Wojak #${paddedId}`,
        characterType: 'wojak' as const,
        imageUrl: getNftImageUrl(id),
        thumbnailUrl: getNftImageUrl(id),
      };
    });
  }
}

// Singleton instance
export const bigpulpService = new BigPulpService();
