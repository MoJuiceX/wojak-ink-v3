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

interface NFTEvent {
  type: string;
  timestamp: string;
  price_mojo?: number;
  xch_price?: number;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTData {
  encoded_id: string;
  name?: string;
  data?: {
    metadata_json?: {
      name?: string;
      attributes?: NFTAttribute[];
    };
  };
  events?: NFTEvent[];
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
  COLLECTION_ID: 'col1wfptqxfx99l8m9h5wd0xfm87hmp5h79kd6w5v33mhgmqdutmpvqsvt3w4s',
  SECONDARY_SALES_CUTOFF: '2025-12-20T00:00:00Z',
  RATE_LIMIT_DELAY_MS: 500,
  MAX_RETRIES: 3,
  PAGE_SIZE: 100,
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

// Fetch all NFTs in collection (paginated)
async function fetchAllCollectionNFTs(collectionId: string): Promise<NFTData[]> {
  const allNFTs: NFTData[] = [];
  let page = 1;
  let hasMore = true;

  console.log('Fetching collection NFTs...');

  while (hasMore) {
    const url = `https://api.mintgarden.io/collections/${collectionId}/nfts?size=${DEFAULT_CONFIG.PAGE_SIZE}&page=${page}`;
    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch NFTs page ${page}: ${response.status}`);
    }

    const data = await response.json() as { nfts?: NFTData[]; items?: NFTData[] };
    const nfts = data.nfts || data.items || [];

    allNFTs.push(...nfts);
    console.log(`Fetched page ${page}, got ${nfts.length} NFTs (total: ${allNFTs.length})`);

    if (nfts.length < DEFAULT_CONFIG.PAGE_SIZE) {
      hasMore = false;
    } else {
      page++;
    }

    // Safety limit
    if (page > 100) {
      console.warn('Hit page limit, stopping pagination');
      hasMore = false;
    }
  }

  return allNFTs;
}

// Fetch detailed history for a single NFT
async function fetchNFTHistory(launcherId: string): Promise<NFTEvent[]> {
  const url = `https://api.mintgarden.io/nfts/${launcherId}`;
  const response = await rateLimitedFetch(url);

  if (!response.ok) {
    console.warn(`Failed to fetch history for ${launcherId}: ${response.status}`);
    return [];
  }

  const data = await response.json() as NFTData;
  return data.events || [];
}

// Extract traits from NFT metadata
function extractTraits(nft: NFTData): Record<string, string> | null {
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
function extractEdition(nft: NFTData): number | null {
  const name = nft.data?.metadata_json?.name || nft.name;
  if (!name) return null;

  const match = name.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

// Convert mojo to XCH
function mojoToXCH(mojo: number): number {
  return mojo / DEFAULT_CONFIG.MOJO_TO_XCH;
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
      // Step 1: Fetch all NFTs in collection
      const nfts = await fetchAllCollectionNFTs(collectionId);
      console.log(`Found ${nfts.length} NFTs in collection`);

      // Step 2: For each NFT, check for trade events after cutoff date
      const allSales: Sale[] = [];
      let processedCount = 0;
      let salesFound = 0;

      for (const nft of nfts) {
        processedCount++;

        if (processedCount % 100 === 0) {
          console.log(`Processing NFT ${processedCount}/${nfts.length}, found ${salesFound} sales so far...`);
        }

        const edition = extractEdition(nft);
        const traits = extractTraits(nft);

        if (!edition || !traits) continue;

        // Check if we need to fetch detailed history
        let events = nft.events;
        if (!events || events.length === 0) {
          events = await fetchNFTHistory(nft.encoded_id);
        }

        // Filter for trade events after cutoff
        for (const event of events) {
          if (event.type !== 'trade') continue;

          const eventDate = new Date(event.timestamp);
          if (eventDate <= cutoffDate) continue;

          // Get price (handle both mojo and XCH formats)
          let priceXCH: number;
          if (event.xch_price !== undefined) {
            priceXCH = event.xch_price;
          } else if (event.price_mojo !== undefined) {
            priceXCH = mojoToXCH(event.price_mojo);
          } else {
            continue;
          }

          if (priceXCH <= 0) continue;

          allSales.push({
            edition,
            price_xch: priceXCH,
            timestamp: event.timestamp,
            traits,
          });
          salesFound++;
        }
      }

      console.log(`Processed ${processedCount} NFTs, found ${allSales.length} secondary sales`);

      // Step 3: Calculate trait statistics
      const traitStats = calculateTraitStats(allSales);
      console.log(`Calculated stats for ${traitStats.length} traits`);

      // Step 4: Store in KV
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
