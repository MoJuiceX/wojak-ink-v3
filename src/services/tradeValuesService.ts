/**
 * Trade Values Service
 * Fetches trait valuation data from the API
 */

export interface TraitStats {
  trait_name: string;
  trait_category: string;
  total_sales: number;
  outliers_excluded: number;
  average_xch: number;
  min_xch: number;
  max_xch: number;
  last_trade: string | null;
}

export interface Sale {
  edition: number;
  price_xch: number;
  timestamp: string;
  traits: Record<string, string>;
}

export interface TradeValuesData {
  trait_stats: TraitStats[];
  all_sales?: Sale[];
  total_sales_count: number;
  last_updated: string | null;
  error?: string;
}

export interface TraitSalesData {
  trait_name: string;
  sales: Sale[];
  total_sales: number;
}

// API base - uses relative path for same-origin, or full URL for cross-origin
const API_BASE = '/api/trade-values';

/**
 * Fetch all trait statistics
 */
export async function fetchTradeValues(category?: string): Promise<TradeValuesData> {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.set('category', category);
  }

  const url = `${API_BASE}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch trade values: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch sales for a specific trait
 */
export async function fetchTraitSales(traitName: string): Promise<TraitSalesData> {
  const response = await fetch(`${API_BASE}?trait=${encodeURIComponent(traitName)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trait sales: ${response.status}`);
  }

  return response.json();
}

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return '—';

  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Format XCH value
 */
export function formatXCH(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
}
