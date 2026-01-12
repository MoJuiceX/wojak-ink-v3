/**
 * Generate Attribute Sales CSV
 *
 * Creates a CSV file with all attribute sales:
 * - Category
 * - Attribute
 * - Sale Price (original currency)
 * - XCH Equivalent (converted using TibetSwap rates)
 *
 * Each NFT sale contributes 7 rows (one per attribute)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TibetSwap exchange rates (XCH per token) - fetched from api.v2.tibetswap.io
const CAT_TO_XCH_RATES: Record<string, number> = {
  '🪄⚡️': 0.1379,
  'BEPE': 0.0204,
  'HOA': 0.3176,
  'NeckCoin': 3.0068,
  '$CHIA': 0.0039,
  'PP': 0.0025,
  '✨❤️‍🔥🧙‍♂️': 2.9238,
  'JOCK': 0.0173,
  '🍕': 0.0030,
  'G4M': 0.0018,
  'COOKIES': 0.0723,
  '🍪': 0.0723,
  'CHAD': 0.0299,
  '🌱': 0.0095,
  'HERB': 0.0095,
  '❤️': 0.1178,
  'LOVE': 0.1178,
};

function convertToXCH(amount: number, currency: string): number {
  if (currency === 'XCH') return amount;
  const rate = CAT_TO_XCH_RATES[currency];
  if (rate) return amount * rate;
  console.warn(`Unknown CAT token: ${currency}, cannot convert to XCH`);
  return 0;
}

// Load metadata
const metadataPath = path.join(__dirname, '../public/assets/nft-data/metadata.json');
const metadata: Array<{
  edition: number;
  attributes: Array<{ trait_type: string; value: string }>;
}> = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

// Build NFT ID -> traits lookup
const nftTraitsMap = new Map<number, Array<{ category: string; value: string }>>();
for (const nft of metadata) {
  const traits = nft.attributes.map(attr => ({
    category: attr.trait_type,
    value: attr.value,
  }));
  nftTraitsMap.set(nft.edition, traits);
}

console.log(`Loaded ${metadata.length} NFTs from metadata`);

// We need to get sales data from localStorage export or Dexie API
// Since this is a Node script, we'll need to fetch from Dexie directly

const DEXIE_API = 'https://dexie.space/v1';
const COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

interface DexieOffer {
  id: string;
  date_completed: string;
  price: number;
  status: number;
  trade_id: string;
  offered: Array<{
    id: string;
    name: string;
    is_nft: boolean;
  }>;
  requested: Array<{
    id: string;
    code: string;
    name: string;
    amount: number;
  }>;
}

interface DexieResponse {
  success: boolean;
  count: number;
  page: number;
  page_size: number;
  offers: DexieOffer[];
}

function extractEditionFromName(name: string): number | null {
  const match = name.match(/#(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

async function fetchAllTrades(): Promise<DexieOffer[]> {
  const allOffers: DexieOffer[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const params = new URLSearchParams({
      offered: COLLECTION_ID,
      status: '4', // Completed trades
      page: page.toString(),
      page_size: '50',
    });

    console.log(`Fetching page ${page}...`);

    const response = await fetch(`${DEXIE_API}/offers?${params}`);
    if (!response.ok) {
      console.error('Failed to fetch from Dexie:', response.status);
      break;
    }

    const data: DexieResponse = await response.json();

    if (!data.offers || data.offers.length === 0) break;

    allOffers.push(...data.offers);

    if (page === 1) {
      totalPages = Math.ceil(data.count / data.page_size);
      console.log(`Total trades: ${data.count}, pages: ${totalPages}`);
    }

    if (allOffers.length >= data.count) break;

    page++;

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allOffers;
}

async function main() {
  console.log('Fetching all trades from Dexie...');
  const trades = await fetchAllTrades();
  console.log(`Fetched ${trades.length} trades`);

  // Generate CSV rows
  const csvRows: string[] = [];
  csvRows.push('Category,Attribute,Price,Currency,XCH_Equivalent,NFT_Edition,Trade_Date');

  let processedSales = 0;
  let attributeRows = 0;
  let skippedUnknownCAT = 0;

  for (const trade of trades) {
    // Skip if no NFT or no payment
    if (!trade.offered?.[0]?.is_nft || !trade.requested?.[0]) continue;

    const nft = trade.offered[0];
    const payment = trade.requested[0];
    const edition = extractEditionFromName(nft.name);

    if (!edition) {
      console.warn(`Could not extract edition from: ${nft.name}`);
      continue;
    }

    const traits = nftTraitsMap.get(edition);
    if (!traits) {
      console.warn(`No traits found for edition: ${edition}`);
      continue;
    }

    const currency = payment.id === 'xch' ? 'XCH' : payment.code || 'CAT';
    const price = payment.amount;
    const tradeDate = trade.date_completed?.split('T')[0] || '';

    // Convert to XCH equivalent
    const xchEquivalent = convertToXCH(price, currency);

    // Skip trades with unknown CAT tokens (cannot be converted)
    if (xchEquivalent === 0 && currency !== 'XCH') {
      skippedUnknownCAT++;
      continue;
    }

    processedSales++;

    // Add one row per attribute (7 per NFT)
    for (const trait of traits) {
      // Escape CSV fields
      const category = trait.category.replace(/"/g, '""');
      const value = trait.value.replace(/"/g, '""');

      csvRows.push(`"${category}","${value}",${price},"${currency}",${xchEquivalent.toFixed(4)},${edition},"${tradeDate}"`);
      attributeRows++;
    }
  }

  if (skippedUnknownCAT > 0) {
    console.log(`Skipped ${skippedUnknownCAT} trades with unknown CAT tokens`);
  }

  console.log(`Processed ${processedSales} sales`);
  console.log(`Generated ${attributeRows} attribute rows (${processedSales} × 7 = ${processedSales * 7})`);

  // Write CSV file
  const outputPath = path.join(__dirname, '../attribute_sales.csv');
  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf-8');
  console.log(`CSV written to: ${outputPath}`);

  // Also print some stats
  const xchSales = trades.filter(t => t.requested?.[0]?.id === 'xch').length;
  const catSales = trades.filter(t => t.requested?.[0]?.id !== 'xch').length;
  console.log(`\nSales breakdown:`);
  console.log(`  XCH sales: ${xchSales}`);
  console.log(`  CAT sales: ${catSales}`);
}

main().catch(console.error);
