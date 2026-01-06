/**
 * Treasury API Service
 * Fetches wallet balances, tokens, and NFTs dynamically
 */

import { WALLET_ADDRESS, XCH_DECIMALS, CAT_DECIMALS } from './treasuryConstants';
import { TREASURY_TOKENS, TOTAL_TOKEN_VALUE_USD } from './tokenConfig';

// Use Vite proxy in development to avoid CORS
const isDev = import.meta.env.DEV;
const SPACESCAN_API = isDev ? '/spacescan-api' : 'https://api.spacescan.io';
const COINGECKO_API = isDev ? '/coingecko-api' : 'https://api.coingecko.com';

// Types
export interface TokenBalance {
  asset_id: string;
  name: string;
  symbol: string;
  balance: number; // in token units
  balance_mojos: number;
  value_usd: number;
  logo_url?: string;
  color?: string;
}

export interface NFTItem {
  nft_id: string;
  name: string;
  image_url: string;
  collection_id: string;
  collection_name: string;
}

export interface NFTCollection {
  collection_id: string;
  collection_name: string;
  preview_image: string;
  count: number;
  nfts: NFTItem[];
}

export interface WalletData {
  xch_balance: number; // in XCH units
  xch_balance_mojos: number;
  xch_price_usd: number;
  tokens: TokenBalance[];
  total_token_value_usd: number;
  nft_collections: NFTCollection[];
  last_updated: Date;
}

// LocalStorage keys
const STORAGE_KEY = 'wojak_treasury_data';
const STORAGE_TIMESTAMP_KEY = 'wojak_treasury_timestamp';
const STORAGE_XCH_PRICE_KEY = 'wojak_xch_price';
const STORAGE_XCH_BALANCE_KEY = 'wojak_xch_balance';

// Cache for API responses
let cachedData: WalletData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (Spacescan rate limits are strict)

// Rate limit tracking
let lastApiCall: number = 0;
const MIN_API_INTERVAL = 60000; // 60 seconds between API calls

// XCH price cache - never show $0
let cachedXchPrice: number = 5.0; // Default fallback price

// XCH balance cache - never show 0
let cachedXchBalance: { xch: number; mojo: number } = { xch: 0.1, mojo: 100000000000 }; // Default fallback

// Load persisted data from localStorage on module init
function loadPersistedData(): void {
  try {
    const storedPrice = localStorage.getItem(STORAGE_XCH_PRICE_KEY);
    if (storedPrice) {
      const price = parseFloat(storedPrice);
      if (price > 0) cachedXchPrice = price;
    }

    const storedBalance = localStorage.getItem(STORAGE_XCH_BALANCE_KEY);
    if (storedBalance) {
      const balance = JSON.parse(storedBalance);
      if (balance.xch > 0) cachedXchBalance = balance;
    }

    const storedData = localStorage.getItem(STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (storedData && storedTimestamp) {
      const data = JSON.parse(storedData);
      data.last_updated = new Date(data.last_updated);
      cachedData = data;
      cacheTimestamp = parseInt(storedTimestamp, 10);
    }
  } catch (e) {
    console.warn('Failed to load persisted treasury data:', e);
  }
}

// Save data to localStorage
function persistData(data: WalletData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(STORAGE_XCH_PRICE_KEY, data.xch_price_usd.toString());
    localStorage.setItem(STORAGE_XCH_BALANCE_KEY, JSON.stringify({
      xch: data.xch_balance,
      mojo: data.xch_balance_mojos
    }));
  } catch (e) {
    console.warn('Failed to persist treasury data:', e);
  }
}

// Initialize persisted data
loadPersistedData();

/**
 * Convert mojos to XCH
 */
function mojosToXch(mojos: number): number {
  return mojos / Math.pow(10, XCH_DECIMALS);
}

/**
 * Convert mojos to CAT tokens
 */
function mojosToCat(mojos: number): number {
  return mojos / Math.pow(10, CAT_DECIMALS);
}

/**
 * Fetch XCH price from CoinGecko
 * Always returns a valid price (never 0) - uses cached/default as fallback
 */
async function fetchXchPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/api/v3/simple/price?ids=chia&vs_currencies=usd`
    );
    if (!response.ok) {
      console.warn('CoinGecko API error, using cached price:', cachedXchPrice);
      return cachedXchPrice;
    }
    const data = await response.json();
    const price = data.chia?.usd;

    // Only update cache if we got a valid price
    if (price && price > 0) {
      cachedXchPrice = price;
      return price;
    }

    // Return cached price if API returned invalid data
    console.warn('Invalid XCH price from API, using cached:', cachedXchPrice);
    return cachedXchPrice;
  } catch (error) {
    console.error('Failed to fetch XCH price, using cached:', cachedXchPrice, error);
    return cachedXchPrice;
  }
}

/**
 * Fetch XCH balance for wallet
 * Docs: https://docs.spacescan.io/api/address/xch_balance/
 * Response: { status: "success", xch: 1124.36, mojo: 1124367548806078 }
 * Always returns a valid balance (never 0) - uses cached/default as fallback
 */
async function fetchXchBalance(): Promise<{ xch: number; mojo: number }> {
  try {
    const response = await fetch(
      `${SPACESCAN_API}/address/xch-balance/${WALLET_ADDRESS}`
    );

    if (!response.ok) {
      console.warn('Spacescan XCH balance API error, using cached balance:', cachedXchBalance);
      return cachedXchBalance;
    }

    const data = await response.json();
    const xch = data.xch || 0;
    const mojo = data.mojo || 0;

    // Only update cache if we got valid data
    if (xch > 0) {
      cachedXchBalance = { xch, mojo };
      return cachedXchBalance;
    }

    // Return cached balance if API returned invalid data
    console.warn('Invalid XCH balance from API, using cached:', cachedXchBalance);
    return cachedXchBalance;
  } catch (error) {
    console.error('Failed to fetch XCH balance, using cached:', cachedXchBalance, error);
    return cachedXchBalance;
  }
}

/**
 * Get CAT token balances from config
 * Note: Spacescan doesn't have a public API for token balances per address
 * Using static config with known holdings, sorted by USD value
 */
function getCatBalances(): TokenBalance[] {
  return TREASURY_TOKENS
    .map(token => ({
      asset_id: token.asset_id,
      name: token.name,
      symbol: token.symbol,
      balance: token.balance,
      balance_mojos: token.balance * Math.pow(10, CAT_DECIMALS),
      value_usd: token.value_usd,
      logo_url: token.logo_url,
      color: token.color,
    }))
    .sort((a, b) => b.value_usd - a.value_usd); // Sort by value descending
}

/**
 * Fetch NFTs owned by the wallet
 * Docs: https://docs.spacescan.io/api/address/nft_balance/
 * Response: Array of { nft_id, name, collection_id, preview_url }
 */
async function fetchWalletNfts(): Promise<NFTCollection[]> {
  try {
    const response = await fetch(
      `${SPACESCAN_API}/address/nft-balance/${WALLET_ADDRESS}`
    );

    if (!response.ok) {
      console.warn('NFT balance endpoint error:', response.status);
      return [];
    }

    const data = await response.json();
    // Response is array of NFTs directly or nested in data/nfts
    const nfts = Array.isArray(data) ? data : (data.nfts || data.data || []);

    // Group NFTs by collection
    const collectionMap = new Map<string, NFTCollection>();

    for (const nft of nfts) {
      const collectionId = nft.collection_id || nft.collectionId || 'unknown';
      const collectionName = nft.collection_name || nft.collectionName || 'Unknown Collection';

      if (!collectionMap.has(collectionId)) {
        collectionMap.set(collectionId, {
          collection_id: collectionId,
          collection_name: collectionName,
          preview_image: nft.preview_url || nft.image_url || nft.data_url || '',
          count: 0,
          nfts: [],
        });
      }

      const collection = collectionMap.get(collectionId)!;
      collection.count++;
      collection.nfts.push({
        nft_id: nft.nft_id || nft.id || '',
        name: nft.name || `NFT #${collection.count}`,
        image_url: nft.preview_url || nft.image_url || nft.data_url || '',
        collection_id: collectionId,
        collection_name: collectionName,
      });
    }

    return Array.from(collectionMap.values());
  } catch (error) {
    console.error('Failed to fetch wallet NFTs:', error);
    return [];
  }
}

/**
 * Get cached wallet data instantly (for immediate display)
 * Returns null if no cached data exists
 */
export function getCachedWalletData(): WalletData | null {
  return cachedData;
}

/**
 * Check if cache is stale and needs refresh
 */
export function isCacheStale(): boolean {
  if (!cachedData) return true;
  return (Date.now() - cacheTimestamp) >= CACHE_DURATION;
}

/**
 * Fetch all wallet data (main entry point)
 * @param forceRefresh - Force a fresh fetch even if cache is valid
 * @param backgroundRefresh - If true, won't block on rate limits
 */
export async function fetchWalletData(forceRefresh = false, backgroundRefresh = false): Promise<WalletData> {
  // Check cache
  const now = Date.now();
  if (!forceRefresh && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedData;
  }

  // Rate limit protection
  if (now - lastApiCall < MIN_API_INTERVAL) {
    console.log('Rate limit protection: using cached data');
    if (cachedData) return cachedData;
    // If no cache and this is a background refresh, don't wait
    if (backgroundRefresh) {
      throw new Error('Rate limited and no cache available');
    }
  }
  lastApiCall = now;

  // Fetch API data in parallel, get tokens from config
  const [xchData, xchPrice, nftCollections] = await Promise.all([
    fetchXchBalance(),
    fetchXchPrice(),
    fetchWalletNfts(),
  ]);

  // Get tokens from static config (no public API available)
  const tokens = getCatBalances();

  const walletData: WalletData = {
    xch_balance: xchData.xch, // Already in XCH units from API
    xch_balance_mojos: xchData.mojo,
    xch_price_usd: xchPrice,
    tokens,
    total_token_value_usd: TOTAL_TOKEN_VALUE_USD,
    nft_collections: nftCollections,
    last_updated: new Date(),
  };

  // Update cache and persist
  cachedData = walletData;
  cacheTimestamp = now;
  persistData(walletData);

  return walletData;
}

/**
 * Prefetch wallet data in background (call on app start)
 */
export function prefetchWalletData(): void {
  if (isCacheStale()) {
    fetchWalletData(true, true).catch(err => {
      console.log('Background prefetch skipped:', err.message);
    });
  }
}

/**
 * Preload token logo images
 */
export function preloadTokenLogos(): void {
  const logos = TREASURY_TOKENS
    .filter(t => t.logo_url)
    .map(t => t.logo_url!);

  logos.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

/**
 * Get wallet explorer URL
 */
export function getWalletExplorerUrl(): string {
  return `https://www.spacescan.io/address/${WALLET_ADDRESS}`;
}
