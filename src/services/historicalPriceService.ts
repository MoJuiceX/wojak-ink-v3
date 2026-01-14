/**
 * Historical Price Service
 *
 * Fetches and caches historical prices for XCH and CAT tokens.
 * Used to calculate USD values and XCH equivalents for NFT sales.
 *
 * Sources:
 * - XCH/USD: CoinGecko API
 * - CAT/XCH: Dexie API
 */

// ============ Types ============

export interface PriceCache {
  xchUsd: Record<string, number>; // date string -> USD price
  catXch: Record<string, number>; // date string -> XCH price
  lastUpdated: string;
}

export interface SalePriceInfo {
  originalAmount: number;
  currency: 'XCH' | 'CAT';
  xchEquivalent: number;
  usdValue: number;
  xchPriceAtSale: number;
  catPriceAtSale?: number;
}

// ============ Constants ============

const STORAGE_KEY = 'wojak_price_cache_v1';
const COINGECKO_API = import.meta.env.DEV ? '/coingecko-api' : 'https://api.coingecko.com';
const DEXIE_API = import.meta.env.DEV ? '/dexie-api/v1' : 'https://api.dexie.space/v1';

// CAT token asset ID (update this with the actual CAT token ID)
const CAT_ASSET_ID = 'a628c1c2c6fcb74d53746157e438e108eab5c0bb3e5c80ff9b1910b3e4832913';

// Token-specific XCH rates (amount of XCH per 1 token)
// Based on current TBitSwap/Dexie rates and historical sales data
const TOKEN_RATES: Record<string, number> = {
  // PIZZA: 550,000 PIZZA = ~1.57 XCH, so 1 PIZZA = 0.00000285 XCH
  'PIZZA': 0.00000285,
  '$PIZZA': 0.00000285,
  // G4M: 366,666 G4M = ~0.64 XCH, so 1 G4M = 0.00000175 XCH
  'G4M': 0.00000175,
  '$G4M': 0.00000175,
  // BEPE: 70,000 BEPE = ~1.428 XCH, so 1 BEPE = 0.0000204 XCH
  'BEPE': 0.0000204,
  '$BEPE': 0.0000204,
  // Love token: 11,111 ❤️ = ~1.31 XCH, so 1 ❤️ = 0.000118 XCH
  '❤️': 0.000118,
  '$LOVE': 0.000118,
  'LOVE': 0.000118,
  // HOA: 6300 HOA = ~2 XCH, so 1 HOA = 0.000318 XCH
  'HOA': 0.000318,
  '$HOA': 0.000318,
  // 🪄⚡️ token: 5555 = ~0.77 XCH, so rate = 0.000138 XCH
  '🪄⚡️': 0.000138,
  // NeckCoin: High-value token ~3 XCH per token
  'NeckCoin': 3.006,
  '$NECKCOIN': 3.006,
  // Wizard token (✨❤️‍🔥🧙‍♂️): High-value token ~2.926 XCH per token
  '✨❤️‍🔥🧙‍♂️': 2.926,
  // SPROUT: 110,000 SPROUT = ~1.025 XCH, so 1 SPROUT = 0.00000932 XCH
  'SPROUT': 0.00000932,
  '$SPROUT': 0.00000932,
};

// ============ Cache Management ============

let priceCache: PriceCache = {
  xchUsd: {},
  catXch: {},
  lastUpdated: '',
};

function loadCacheFromStorage(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      priceCache = JSON.parse(stored);
      console.log('[PriceService] Loaded cache with', Object.keys(priceCache.xchUsd).length, 'XCH prices');
    }
  } catch (error) {
    console.warn('[PriceService] Failed to load cache:', error);
  }
}

function saveCacheToStorage(): void {
  try {
    priceCache.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priceCache));
  } catch (error) {
    console.warn('[PriceService] Failed to save cache:', error);
  }
}

// ============ Date Helpers ============

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDateForCoinGecko(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`; // DD-MM-YYYY
}

function findClosestDate(targetDate: string, availableDates: string[]): string | null {
  if (availableDates.length === 0) return null;
  if (availableDates.includes(targetDate)) return targetDate;

  const target = new Date(targetDate).getTime();
  let closest = availableDates[0];
  let closestDiff = Math.abs(new Date(closest).getTime() - target);

  for (const date of availableDates) {
    const diff = Math.abs(new Date(date).getTime() - target);
    if (diff < closestDiff) {
      closest = date;
      closestDiff = diff;
    }
  }

  return closest;
}

// ============ XCH Price Fetching ============

/**
 * Fetch XCH/USD price for a specific date from CoinGecko
 */
async function fetchXchPriceForDate(date: Date): Promise<number | null> {
  try {
    const dateStr = formatDateForCoinGecko(date);
    const url = `${COINGECKO_API}/api/v3/coins/chia/history?date=${dateStr}&localization=false`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[PriceService] CoinGecko error for ${dateStr}:`, response.status);
      return null;
    }

    const data = await response.json();
    const price = data.market_data?.current_price?.usd;

    if (typeof price === 'number') {
      return price;
    }

    return null;
  } catch (error) {
    console.error('[PriceService] Error fetching XCH price:', error);
    return null;
  }
}

/**
 * Fetch XCH/USD price range from CoinGecko (more efficient for multiple dates)
 */
async function fetchXchPriceRange(fromDate: Date, toDate: Date): Promise<Record<string, number>> {
  try {
    const from = Math.floor(fromDate.getTime() / 1000);
    const to = Math.floor(toDate.getTime() / 1000);
    const url = `${COINGECKO_API}/api/v3/coins/chia/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[PriceService] CoinGecko range error:', response.status);
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    // CoinGecko returns [timestamp, price] pairs
    for (const [timestamp, price] of data.prices || []) {
      const date = formatDate(new Date(timestamp));
      // Keep the last price for each day (most accurate)
      prices[date] = price;
    }

    console.log('[PriceService] Fetched', Object.keys(prices).length, 'XCH prices from range');
    return prices;
  } catch (error) {
    console.error('[PriceService] Error fetching XCH price range:', error);
    return {};
  }
}

// ============ CAT Price Fetching ============

/**
 * Fetch CAT/XCH price from Dexie
 * Dexie provides current prices; for historical, we cache what we fetch
 */
async function fetchCurrentCatPrice(): Promise<number | null> {
  try {
    const url = `${DEXIE_API}/prices/${CAT_ASSET_ID}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[PriceService] Dexie CAT price error:', response.status);
      return null;
    }

    const data = await response.json();
    // Dexie returns price in mojos, convert to XCH
    const priceInMojos = data.price_xch || data.price;
    if (typeof priceInMojos === 'number') {
      // If price is in mojos (large number), convert to XCH
      return priceInMojos > 1000 ? priceInMojos / 1e12 : priceInMojos;
    }

    return null;
  } catch (error) {
    console.error('[PriceService] Error fetching CAT price:', error);
    return null;
  }
}

/**
 * Fetch CAT trade history from Dexie to build historical prices
 */
async function fetchCatTradeHistory(): Promise<Record<string, number>> {
  try {
    const url = `${DEXIE_API}/trades?asset_id=${CAT_ASSET_ID}&page_size=100`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('[PriceService] Dexie trade history error:', response.status);
      return {};
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    // Extract daily prices from trades
    for (const trade of data.trades || []) {
      if (trade.date_completed && trade.price_xch) {
        const date = formatDate(new Date(trade.date_completed));
        // Use average if multiple trades on same day
        if (prices[date]) {
          prices[date] = (prices[date] + trade.price_xch) / 2;
        } else {
          prices[date] = trade.price_xch;
        }
      }
    }

    console.log('[PriceService] Fetched', Object.keys(prices).length, 'CAT prices from trades');
    return prices;
  } catch (error) {
    console.error('[PriceService] Error fetching CAT trade history:', error);
    return {};
  }
}

// ============ Public API ============

/**
 * Initialize the price service - load cache and fetch recent prices
 */
export async function initializePriceService(): Promise<void> {
  loadCacheFromStorage();

  // Fetch recent XCH prices (last 90 days)
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const xchPrices = await fetchXchPriceRange(threeMonthsAgo, now);
  Object.assign(priceCache.xchUsd, xchPrices);

  // Fetch CAT price history
  const catPrices = await fetchCatTradeHistory();
  Object.assign(priceCache.catXch, catPrices);

  // Also get current CAT price
  const currentCatPrice = await fetchCurrentCatPrice();
  if (currentCatPrice) {
    priceCache.catXch[formatDate(now)] = currentCatPrice;
  }

  saveCacheToStorage();
  console.log('[PriceService] Initialized with', Object.keys(priceCache.xchUsd).length, 'XCH prices and', Object.keys(priceCache.catXch).length, 'CAT prices');
}

/**
 * Get XCH/USD price for a specific date
 * Returns cached value or fetches if not available
 */
export async function getXchPrice(date: Date): Promise<number> {
  const dateStr = formatDate(date);

  // Check cache
  if (priceCache.xchUsd[dateStr]) {
    return priceCache.xchUsd[dateStr];
  }

  // Find closest cached date
  const closest = findClosestDate(dateStr, Object.keys(priceCache.xchUsd));
  if (closest) {
    // Use closest if within 7 days
    const daysDiff = Math.abs(new Date(dateStr).getTime() - new Date(closest).getTime()) / (24 * 60 * 60 * 1000);
    if (daysDiff <= 7) {
      return priceCache.xchUsd[closest];
    }
  }

  // Fetch from API
  const price = await fetchXchPriceForDate(date);
  if (price) {
    priceCache.xchUsd[dateStr] = price;
    saveCacheToStorage();
    return price;
  }

  // Fallback to closest or default
  if (closest) {
    return priceCache.xchUsd[closest];
  }

  console.warn('[PriceService] No XCH price found for', dateStr, '- using default');
  return 25; // Fallback default
}

/**
 * Get CAT/XCH price for a specific date
 */
export function getCatPrice(date: Date): number {
  const dateStr = formatDate(date);

  // Check cache
  if (priceCache.catXch[dateStr]) {
    return priceCache.catXch[dateStr];
  }

  // Find closest cached date
  const closest = findClosestDate(dateStr, Object.keys(priceCache.catXch));
  if (closest) {
    return priceCache.catXch[closest];
  }

  console.warn('[PriceService] No CAT price found for', dateStr, '- using default');
  return 0.00005; // Fallback default
}

/**
 * Get the XCH rate for a specific token
 */
export function getTokenRate(tokenType?: string): number {
  if (tokenType && TOKEN_RATES[tokenType]) {
    return TOKEN_RATES[tokenType];
  }
  // Return a more conservative default rate for unknown CAT tokens
  return 0.000001; // Very low default - better to undercount than overcount
}

/**
 * Convert a sale to XCH equivalent and USD value
 */
export async function convertSalePrice(
  amount: number,
  currency: 'XCH' | 'CAT',
  saleDate: Date,
  tokenType?: string // Optional: specific token type for accurate conversion
): Promise<SalePriceInfo> {
  const xchPrice = await getXchPrice(saleDate);

  if (currency === 'XCH') {
    return {
      originalAmount: amount,
      currency: 'XCH',
      xchEquivalent: amount,
      usdValue: amount * xchPrice,
      xchPriceAtSale: xchPrice,
    };
  }

  // CAT sale - use token-specific rate if available, otherwise use generic CAT price
  const tokenRate = tokenType ? getTokenRate(tokenType) : getCatPrice(saleDate);
  const xchEquivalent = amount * tokenRate;

  return {
    originalAmount: amount,
    currency: 'CAT',
    xchEquivalent,
    usdValue: xchEquivalent * xchPrice,
    xchPriceAtSale: xchPrice,
    catPriceAtSale: tokenRate,
  };
}

/**
 * Batch convert multiple sales (more efficient)
 */
export async function convertSalePrices(
  sales: Array<{ amount: number; currency: 'XCH' | 'CAT'; date: Date }>
): Promise<SalePriceInfo[]> {
  // Pre-fetch all needed XCH prices
  const uniqueDates = [...new Set(sales.map(s => formatDate(s.date)))];
  for (const dateStr of uniqueDates) {
    if (!priceCache.xchUsd[dateStr]) {
      await getXchPrice(new Date(dateStr));
    }
  }

  // Convert all sales
  return Promise.all(
    sales.map(sale => convertSalePrice(sale.amount, sale.currency, sale.date))
  );
}

/**
 * Get current XCH price (for display purposes)
 */
export async function getCurrentXchPrice(): Promise<number> {
  return getXchPrice(new Date());
}

/**
 * Add a price to the cache manually (useful when importing sale data with known prices)
 */
export function addPriceToCache(date: Date, xchUsd?: number, catXch?: number): void {
  const dateStr = formatDate(date);
  if (xchUsd !== undefined) {
    priceCache.xchUsd[dateStr] = xchUsd;
  }
  if (catXch !== undefined) {
    priceCache.catXch[dateStr] = catXch;
  }
  saveCacheToStorage();
}

/**
 * Get the entire price cache (for debugging/export)
 */
export function getPriceCache(): PriceCache {
  return { ...priceCache };
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  priceCache = {
    xchUsd: {},
    catXch: {},
    lastUpdated: '',
  };
  localStorage.removeItem(STORAGE_KEY);
}
