/**
 * Parse.bot API Service
 *
 * Fetches NFT data from MintGarden via Parse.bot scraping API.
 * Uses Vite proxy in development, Cloudflare Worker in production.
 */

const SCRAPER_ID = '3e7e6f3c-882b-4235-a9df-d1c183f09db9';
const isDev = import.meta.env.DEV;

// In development: use Vite proxy (API key injected by proxy)
// In production: use Cloudflare Worker (API key stored as secret)
const DEV_PROXY_BASE = '/parsebot-api';
const PROD_WORKER_URL = 'https://wojak-parsebot-proxy.abitsolvesthis.workers.dev';

// Collection URL for Wojak Farmers (with correct collection ID)
export const COLLECTION_URL = 'https://mintgarden.io/collections/wojak-farmers-plot-col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// ============ API Response Types (raw from Parse.bot) ============

interface ParseBotCollectionStats {
  collection_id: string;
  name: string | null;
  description: string | null;
  nft_count: number | null;
  trade_count: number | null;
  floor_price: number | null;
  volume: number | null;
  thumbnail_uri: string | null;
  banner_uri: string | null;
}

interface ParseBotOwner {
  id: string;
  encoded_id: string;
  verification_state: number;
  username: string | null;
  name: string | null;
  bio: string | null;
  website: string | null;
  twitter_handle: string | null;
  avatar_uri: string | null;
  header_uri: string | null;
  discord_user: {
    id: string;
    username: string;
    discriminator: string;
  } | null;
}

interface ParseBotAddress {
  id: string;
  encoded_id: string;
}

interface ParseBotEvent {
  nft_id: string;
  event_index: number;
  type: number; // 0 = mint, 1 = transfer, 2 = sale
  timestamp: string;
  xch_price: number | null;
  address: ParseBotAddress | null;
  owner: ParseBotOwner | null;
  previous_address: ParseBotAddress | null;
  previous_owner: ParseBotOwner | null;
}

interface ParseBotAttribute {
  trait_type: string;
  value: string;
}

interface ParseBotNFTDetails {
  id: string;
  encoded_id: string;
  data: {
    data_uris: string[];
    data_hash: string;
    data_type: number;
    thumbnail_uri: string;
    preview_uri: string;
    metadata_json: {
      name: string;
      description: string;
      attributes: ParseBotAttribute[];
      edition_number: number;
    };
    edition_number: number;
    edition_total: number;
  };
  is_blocked: boolean;
  xch_price: number | null;
  royalty_percentage: number;
  creator: ParseBotOwner | null;
  creator_address: ParseBotAddress | null;
  owner_address: ParseBotAddress | null;
  owner: ParseBotOwner | null;
  collection: {
    id: string;
    name: string;
    description: string;
    thumbnail_uri: string;
  };
  openrarity_rank: string;
  events: ParseBotEvent[];
}

interface ParseBotListedNFTsResponse {
  collection_id: string;
  page: number;
  size: number;
  next: string;
  previous: string;
  count: number;
  items: Array<{
    id: string;
    encoded_id: string;
    name: string;
    thumbnail_uri: string;
    xch_price: number | null;
  }>;
}

// ============ App Types (transformed for our app) ============

export interface CollectionStats {
  floorPrice: number;
  totalItems: number;
  totalVolume: number;
  tradeCount: number;
  name: string;
  description: string;
  thumbnailUri: string;
}

export interface NFTOwnerInfo {
  address: string;
  name: string | null;
  avatarUri: string | null;
  twitterHandle: string | null;
  profileUrl: string;
}

export interface NFTEvent {
  type: 'mint' | 'transfer' | 'sale';
  timestamp: Date;
  price: number | null;
  fromAddress: string | null;
  toAddress: string | null;
  fromName: string | null;
  toName: string | null;
}

export interface NFTDetails {
  id: string;
  encodedId: string;
  name: string;
  description: string;
  editionNumber: number;
  editionTotal: number;
  imageUrl: string;
  thumbnailUrl: string;
  rarityRank: number;
  price: number | null;
  isListed: boolean;
  owner: NFTOwnerInfo | null;
  creator: NFTOwnerInfo | null;
  collectionName: string;
  attributes: Array<{
    traitType: string;
    value: string;
  }>;
  events: NFTEvent[];
}

// ============ Helper Functions ============

function buildDevUrl(endpoint: string): string {
  return `${DEV_PROXY_BASE}/scraper/${SCRAPER_ID}/${endpoint}`;
}

function buildProdUrl(endpoint: string): string {
  // Worker uses simplified endpoints: /collection-stats, /nft-details, /nft-owner
  const endpointMap: Record<string, string> = {
    'fetch_collection_stats': '/collection-stats',
    'fetch_nft_details': '/nft-details',
  };
  return `${PROD_WORKER_URL}${endpointMap[endpoint] || `/${endpoint}`}`;
}

async function postRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const url = isDev ? buildDevUrl(endpoint) : buildProdUrl(endpoint);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Parse.bot API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

function transformOwner(owner: ParseBotOwner | null, address: ParseBotAddress | null): NFTOwnerInfo | null {
  if (!owner && !address) return null;

  const addressStr = address?.encoded_id || '';
  let profileUrl: string;

  if (owner?.name && owner.id) {
    const nameSlug = owner.name.trim().toLowerCase().replace(/\s+/g, '_');
    profileUrl = `https://mintgarden.io/profile/${nameSlug}-${owner.id}`;
  } else if (addressStr) {
    profileUrl = `https://www.spacescan.io/address/${addressStr}`;
  } else {
    profileUrl = '';
  }

  return {
    address: addressStr,
    name: owner?.name || null,
    avatarUri: owner?.avatar_uri || null,
    twitterHandle: owner?.twitter_handle || null,
    profileUrl,
  };
}

function transformEventType(type: number): 'mint' | 'transfer' | 'sale' {
  switch (type) {
    case 0: return 'mint';
    case 2: return 'sale';
    default: return 'transfer';
  }
}

function transformEvents(events: ParseBotEvent[]): NFTEvent[] {
  return events.map(event => ({
    type: transformEventType(event.type),
    timestamp: new Date(event.timestamp),
    price: event.xch_price,
    fromAddress: event.previous_address?.encoded_id || null,
    toAddress: event.address?.encoded_id || null,
    fromName: event.previous_owner?.name || null,
    toName: event.owner?.name || null,
  }));
}

// ============ API Functions ============

/**
 * Fetch collection statistics (floor price, volume, etc.)
 */
export async function fetchCollectionStats(): Promise<CollectionStats> {
  // In dev, pass collection_url; in prod, worker has it hardcoded
  const body = isDev ? { collection_url: COLLECTION_URL } : {};
  const raw = await postRequest<ParseBotCollectionStats>('fetch_collection_stats', body);

  return {
    floorPrice: raw.floor_price || 0,
    totalItems: raw.nft_count || 0,
    totalVolume: raw.volume || 0,
    tradeCount: raw.trade_count || 0,
    name: raw.name || 'Wojak Farmers Plot',
    description: raw.description || '',
    thumbnailUri: raw.thumbnail_uri || '',
  };
}

/**
 * Fetch full NFT details by NFT URL
 */
export async function fetchNFTDetails(nftUrl: string): Promise<NFTDetails> {
  const raw = await postRequest<ParseBotNFTDetails>('fetch_nft_details', {
    nft_url: nftUrl,
  });

  return {
    id: raw.id,
    encodedId: raw.encoded_id,
    name: raw.data.metadata_json.name,
    description: raw.data.metadata_json.description,
    editionNumber: raw.data.edition_number,
    editionTotal: raw.data.edition_total,
    imageUrl: raw.data.data_uris[0] || raw.data.preview_uri,
    thumbnailUrl: raw.data.thumbnail_uri,
    rarityRank: parseInt(raw.openrarity_rank, 10) || 0,
    price: raw.xch_price,
    isListed: raw.xch_price !== null,
    owner: transformOwner(raw.owner, raw.owner_address),
    creator: transformOwner(raw.creator, raw.creator_address),
    collectionName: raw.collection.name,
    attributes: raw.data.metadata_json.attributes.map(attr => ({
      traitType: attr.trait_type,
      value: attr.value,
    })),
    events: transformEvents(raw.events),
  };
}

/**
 * Fetch NFT owner info only (lighter request via fetch_nft_details)
 */
export async function fetchNFTOwner(nftUrl: string): Promise<NFTOwnerInfo | null> {
  const details = await fetchNFTDetails(nftUrl);
  return details.owner;
}

/**
 * Build MintGarden NFT URL from encoded NFT ID
 */
export function buildNFTUrl(encodedId: string): string {
  return `https://mintgarden.io/nfts/${encodedId}`;
}

/**
 * Fetch NFT owner by encoded NFT ID (convenience wrapper)
 */
export async function fetchNFTOwnerById(encodedId: string): Promise<NFTOwnerInfo | null> {
  const nftUrl = buildNFTUrl(encodedId);
  return fetchNFTOwner(nftUrl);
}

/**
 * Fetch NFT details by encoded NFT ID (convenience wrapper)
 */
export async function fetchNFTDetailsById(encodedId: string): Promise<NFTDetails> {
  const nftUrl = buildNFTUrl(encodedId);
  return fetchNFTDetails(nftUrl);
}

// ============ Edition Number Lookup ============

const MINTGARDEN_API = import.meta.env.DEV ? '/mintgarden-api' : 'https://api.mintgarden.io';
const COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// Cache for edition -> encoded ID mapping
const encodedIdCache = new Map<string, string>();

/**
 * Look up the encoded NFT ID from an edition number (1-4200)
 * Uses MintGarden API search to find the NFT
 */
async function getEncodedIdFromEdition(edition: string | number): Promise<string | null> {
  const editionStr = String(edition);

  // Check cache first
  const cached = encodedIdCache.get(editionStr);
  if (cached) return cached;

  try {
    // Search MintGarden by edition number
    const url = `${MINTGARDEN_API}/collections/${COLLECTION_ID}/nfts?size=1&search=${editionStr}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data = await response.json();
    const items = data.items || [];

    if (items.length > 0) {
      const encodedId = items[0].encoded_id;
      if (encodedId) {
        encodedIdCache.set(editionStr, encodedId);
        return encodedId;
      }
    }

    return null;
  } catch (error) {
    console.error('[ParseBot] Error looking up encoded ID:', error);
    return null;
  }
}

/**
 * Fetch NFT owner by edition number (1-4200)
 * First looks up the encoded ID, then fetches via Parse.bot
 */
export async function fetchNFTOwnerByEdition(edition: string | number): Promise<NFTOwnerInfo | null> {
  const encodedId = await getEncodedIdFromEdition(edition);
  if (!encodedId) {
    console.warn(`[ParseBot] Could not find encoded ID for edition ${edition}`);
    return null;
  }

  return fetchNFTOwnerById(encodedId);
}

/**
 * Fetch NFT details by edition number (1-4200)
 * First looks up the encoded ID, then fetches via Parse.bot
 */
export async function fetchNFTDetailsByEdition(edition: string | number): Promise<NFTDetails | null> {
  const encodedId = await getEncodedIdFromEdition(edition);
  if (!encodedId) {
    console.warn(`[ParseBot] Could not find encoded ID for edition ${edition}`);
    return null;
  }

  return fetchNFTDetailsById(encodedId);
}
