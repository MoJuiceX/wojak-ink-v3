/**
 * Service Interfaces
 *
 * Define contracts for data access.
 * Implementations can be:
 * - MockService (development)
 * - APIService (production)
 */

import type {
  NFT,
  NFTFilters,
  NFTHistory,
  NFTTrait,
  Listing,
  ListingFilters,
  MarketStats,
  PriceHistoryPoint,
  HeatmapData,
  WalletBalance,
  TokenPrices,
  TraitType,
  TraitRarity,
  TraitSales,
  PaginatedResponse,
  PageParams,
  TimePeriod,
} from '@/types/domain';

export interface INFTService {
  fetchNFTs(filters?: NFTFilters): Promise<NFT[]>;
  fetchNFTsPage(
    params: NFTFilters & PageParams
  ): Promise<PaginatedResponse<NFT>>;
  fetchNFTById(id: string): Promise<NFT>;
  fetchNFTTraits(id: string): Promise<NFTTrait[]>;
  fetchNFTHistory(id: string): Promise<NFTHistory>;
  searchNFTs(query: string): Promise<NFT[]>;
}

export interface IMarketService {
  fetchListings(filters?: ListingFilters): Promise<Listing[]>;
  fetchListingsByPriceRange(min: number, max: number): Promise<Listing[]>;
  fetchFloorPrice(): Promise<number>;
  fetchMarketStats(): Promise<MarketStats>;
  fetchPriceHistory(period?: TimePeriod): Promise<PriceHistoryPoint[]>;
  fetchHeatmapData(): Promise<HeatmapData>;
}

export interface IWalletService {
  fetchWalletBalance(address: string): Promise<WalletBalance>;
  fetchWalletNFTs(address: string): Promise<NFT[]>;
  fetchTokenPrices(): Promise<TokenPrices>;
}

export interface ITraitService {
  fetchAllTraits(): Promise<TraitType[]>;
  fetchTraitRarity(traitType: string, value: string): Promise<TraitRarity>;
  fetchTraitSales(traitType: string, value: string): Promise<TraitSales>;
}
