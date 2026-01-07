/**
 * Cloudflare Worker - Trade Values Fetcher
 * Runs every 30 minutes via Cron Trigger
 * Fetches NFT sales from MintGarden, calculates trait statistics, stores in KV
 */

interface Env {
  TRADE_VALUES_KV: KVNamespace;
  COLLECTION_ID?: string;
  SECONDARY_SALES_CUTOFF?: string;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name?: string;
  attributes?: NFTAttribute[];
}

interface NFTDetail {
  id: string;
  encoded_id: string;
  name?: string;
  data?: {
    metadata_json?: NFTMetadata;
    name?: string;
  };
}

interface EventNFT {
  id: string;
  encoded_id: string;
  data?: {
    name?: string;
  };
}

interface EventCollection {
  id: string;
  name: string;
}

interface TradeEvent {
  nft_id: string;
  timestamp: string;
  xch_price: number | null;
  nft?: EventNFT;
  collection?: EventCollection;
}

interface EventsResponse {
  items: TradeEvent[];
  next?: string | null;
}

interface Sale {
  edition: number;
  price_xch: number;
  timestamp: string;
  traits: Record<string, string>;
}

interface TraitStats {
  trait_name: string;
  trait_category: string;
  total_sales: number;
  outliers_excluded: number;
  average_xch: number;
  min_xch: number;
  max_xch: number;
  last_trade: string | null;
}

interface StoredData {
  trait_stats: TraitStats[];
  all_sales: Sale[];
  total_sales_count: number;
  last_updated: string;
  fetch_duration_ms: number;
}

// Default configuration
const DEFAULT_CONFIG = {
  COLLECTION_ID: 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah',
  SECONDARY_SALES_CUTOFF: '2025-12-20T00:00:00Z',
  RATE_LIMIT_DELAY_MS: 200,
  MAX_RETRIES: 3,
  EVENTS_PAGE_SIZE: 100,
  MAX_EVENT_PAGES: 40,  // Increased for more historical data
  MOJO_TO_XCH: 1_000_000_000_000,
};

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Rate-limited fetch with retry and exponential backoff
async function rateLimitedFetch(url: string, retryCount = 0): Promise<Response> {
  if (retryCount > 0) {
    const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 30000);
    await sleep(backoffMs);
  } else {
    await sleep(DEFAULT_CONFIG.RATE_LIMIT_DELAY_MS);
  }

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'WojakFarmersPlot/1.0',
    },
  });

  if (response.status === 429 || response.status >= 500) {
    if (retryCount < DEFAULT_CONFIG.MAX_RETRIES) {
      console.log(`Rate limited or server error (${response.status}), retry ${retryCount + 1}...`);
      return rateLimitedFetch(url, retryCount + 1);
    }
    throw new Error(`Failed after ${DEFAULT_CONFIG.MAX_RETRIES} retries: ${response.status}`);
  }

  return response;
}

// Fetch trade events for our collection from global events endpoint
async function fetchCollectionTrades(collectionId: string, cutoffDate: Date): Promise<TradeEvent[]> {
  const collectionTrades: TradeEvent[] = [];
  let cursor: string | null = null;
  let pageCount = 0;

  console.log('Fetching trade events...');

  while (pageCount < DEFAULT_CONFIG.MAX_EVENT_PAGES) {
    pageCount++;
    let url = `https://api.mintgarden.io/events?type=2&size=${DEFAULT_CONFIG.EVENTS_PAGE_SIZE}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const response = await rateLimitedFetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json() as EventsResponse;
    const events = data.items || [];

    // Filter for our collection
    for (const event of events) {
      if (event.collection?.id === collectionId) {
        const eventDate = new Date(event.timestamp);
        if (eventDate > cutoffDate && event.xch_price && event.xch_price > 0) {
          collectionTrades.push(event);
        }
      }
    }

    console.log(`Events page ${pageCount}: found ${events.length} events, ${collectionTrades.length} Wojak trades so far`);

    // Check if we've gone past our cutoff date (events are sorted newest first)
    if (events.length > 0) {
      const oldestEvent = events[events.length - 1];
      const oldestDate = new Date(oldestEvent.timestamp);
      if (oldestDate < cutoffDate) {
        console.log('Reached events before cutoff date, stopping');
        break;
      }
    }

    // Check for more pages
    if (!data.next || events.length === 0) {
      break;
    }

    cursor = data.next;
  }

  return collectionTrades;
}

// Fetch NFT details to get traits
async function fetchNFTDetails(encodedId: string): Promise<NFTDetail | null> {
  const url = `https://api.mintgarden.io/nfts/${encodedId}`;
  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    console.warn(`Failed to fetch NFT ${encodedId}: ${response.status}`);
    return null;
  }

  return response.json() as Promise<NFTDetail>;
}

// Extract traits from NFT metadata
function extractTraits(nft: NFTDetail): Record<string, string> | null {
  const attributes = nft.data?.metadata_json?.attributes;
  if (!attributes || !Array.isArray(attributes)) return null;

  const traits: Record<string, string> = {};
  for (const attr of attributes) {
    if (attr.trait_type && attr.value) {
      const category = attr.trait_type.toLowerCase().replace(/\s+/g, '_');
      traits[category] = attr.value;
    }
  }

  return Object.keys(traits).length > 0 ? traits : null;
}

// Extract edition number from NFT name (e.g., "Wojak #0042" -> 42)
function extractEdition(name: string | undefined): number | null {
  if (!name) return null;
  const match = name.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Filter outliers using IQR method
function filterOutliers(prices: number[]): { filtered: number[]; outliersRemoved: number } {
  if (prices.length < 4) {
    return { filtered: prices, outliersRemoved: 0 };
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const filtered = prices.filter(p => p >= lowerBound && p <= upperBound);

  return {
    filtered,
    outliersRemoved: prices.length - filtered.length,
  };
}

// Calculate trait statistics from sales
function calculateTraitStats(sales: Sale[]): TraitStats[] {
  const traitSalesMap = new Map<string, { prices: number[]; timestamps: string[] }>();

  // Group sales by trait
  for (const sale of sales) {
    for (const [category, traitName] of Object.entries(sale.traits)) {
      const key = `${category}:::${traitName}`;
      if (!traitSalesMap.has(key)) {
        traitSalesMap.set(key, { prices: [], timestamps: [] });
      }
      const data = traitSalesMap.get(key)!;
      data.prices.push(sale.price_xch);
      data.timestamps.push(sale.timestamp);
    }
  }

  // Calculate stats for each trait
  const stats: TraitStats[] = [];

  for (const [key, data] of traitSalesMap) {
    const [category, traitName] = key.split(':::');
    const { filtered, outliersRemoved } = filterOutliers(data.prices);

    if (filtered.length === 0) continue;

    const sortedTimestamps = [...data.timestamps].sort().reverse();

    stats.push({
      trait_name: traitName,
      trait_category: category,
      total_sales: filtered.length,
      outliers_excluded: outliersRemoved,
      average_xch: filtered.reduce((a, b) => a + b, 0) / filtered.length,
      min_xch: Math.min(...filtered),
      max_xch: Math.max(...filtered),
      last_trade: sortedTimestamps[0] || null,
    });
  }

  // Sort by average price descending
  stats.sort((a, b) => b.average_xch - a.average_xch);

  return stats;
}

// Main scheduled handler
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] Starting scheduled sales fetch...`);

    const collectionId = env.COLLECTION_ID || DEFAULT_CONFIG.COLLECTION_ID;
    const cutoffDate = new Date(env.SECONDARY_SALES_CUTOFF || DEFAULT_CONFIG.SECONDARY_SALES_CUTOFF);

    try {
      // Step 1: Fetch all trade events for our collection
      const trades = await fetchCollectionTrades(collectionId, cutoffDate);
      console.log(`Found ${trades.length} trades for collection`);

      if (trades.length === 0) {
        console.log('No trades found, storing empty data');
        const emptyData: StoredData = {
          trait_stats: [],
          all_sales: [],
          total_sales_count: 0,
          last_updated: new Date().toISOString(),
          fetch_duration_ms: Date.now() - startTime,
        };
        await env.TRADE_VALUES_KV.put('trade_values_data', JSON.stringify(emptyData));
        return;
      }

      // Step 2: Fetch NFT details for each traded NFT (deduplicated)
      const uniqueNftIds = [...new Set(trades.map(t => t.nft?.encoded_id).filter(Boolean))] as string[];
      console.log(`Fetching details for ${uniqueNftIds.length} unique NFTs...`);

      const nftDetailsMap = new Map<string, NFTDetail>();
      let fetchedCount = 0;

      for (const encodedId of uniqueNftIds) {
        const details = await fetchNFTDetails(encodedId);
        if (details) {
          nftDetailsMap.set(encodedId, details);
        }
        fetchedCount++;
        if (fetchedCount % 20 === 0) {
          console.log(`Fetched ${fetchedCount}/${uniqueNftIds.length} NFT details`);
        }
      }

      // Step 3: Build sales data with traits
      const allSales: Sale[] = [];

      for (const trade of trades) {
        const nftId = trade.nft?.encoded_id;
        if (!nftId) continue;

        const details = nftDetailsMap.get(nftId);
        if (!details) continue;

        const traits = extractTraits(details);
        if (!traits) continue;

        const name = details.data?.metadata_json?.name || details.data?.name || details.name;
        const edition = extractEdition(name);
        if (!edition) continue;

        allSales.push({
          edition,
          price_xch: trade.xch_price!,
          timestamp: trade.timestamp,
          traits,
        });
      }

      console.log(`Processed ${allSales.length} sales with trait data`);

      // Step 4: Calculate trait statistics
      const traitStats = calculateTraitStats(allSales);
      console.log(`Calculated stats for ${traitStats.length} traits`);

      // Step 5: Store in KV
      const storedData: StoredData = {
        trait_stats: traitStats,
        all_sales: allSales,
        total_sales_count: allSales.length,
        last_updated: new Date().toISOString(),
        fetch_duration_ms: Date.now() - startTime,
      };

      await env.TRADE_VALUES_KV.put(
        'trade_values_data',
        JSON.stringify(storedData),
        {
          metadata: {
            total_sales: allSales.length,
            total_traits: traitStats.length,
            last_updated: storedData.last_updated,
          },
        }
      );

      console.log(`Successfully stored data in KV (took ${storedData.fetch_duration_ms}ms)`);

    } catch (error) {
      console.error('Error in scheduled fetch:', error);
      throw error;
    }
  },

  // HTTP handler for manual trigger and status check
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Manual trigger endpoint
    if (url.pathname === '/trigger-fetch') {
      ctx.waitUntil(this.scheduled({} as ScheduledController, env, ctx));
      return new Response(JSON.stringify({ message: 'Fetch triggered', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Status endpoint
    if (url.pathname === '/status') {
      try {
        const data = await env.TRADE_VALUES_KV.get('trade_values_data', 'json') as StoredData | null;
        if (data) {
          return new Response(JSON.stringify({
            status: 'ok',
            last_updated: data.last_updated,
            total_sales: data.total_sales_count,
            total_traits: data.trait_stats.length,
            fetch_duration_ms: data.fetch_duration_ms,
          }), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ status: 'no_data', message: 'No data in KV yet' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ status: 'error', error: String(error) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Not found. Available: /trigger-fetch, /status', { status: 404 });
  },
};
