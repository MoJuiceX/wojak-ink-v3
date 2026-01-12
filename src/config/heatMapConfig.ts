/**
 * Heat Map Configuration
 *
 * Configuration for the accessible heat map visualization.
 */

import type {
  RarityBin,
  PriceBin,
  HeatMapViewMode,
} from '@/types/bigpulp';

// ============ Grid Dimensions ============

export const HEATMAP_CONFIG = {
  rarityBins: 10, // 10 rows (rarity)
  priceBins: 8, // 8 columns (price)
  totalCells: 80, // 10 x 8

  // Cell dimensions
  cellMinSize: 48, // px
  cellGap: 3, // px
  cellBorderRadius: 6, // px

  // Hover
  hoverScale: 1.15,
  hoverZIndex: 10,
} as const;

// ============ Rarity Bins ============

export const RARITY_BINS: RarityBin[] = [
  { index: 0, label: 'Top 10%', minRank: 1, maxRank: 420 },
  { index: 1, label: '20%', minRank: 421, maxRank: 840 },
  { index: 2, label: '30%', minRank: 841, maxRank: 1260 },
  { index: 3, label: '40%', minRank: 1261, maxRank: 1680 },
  { index: 4, label: '50%', minRank: 1681, maxRank: 2100 },
  { index: 5, label: '60%', minRank: 2101, maxRank: 2520 },
  { index: 6, label: '70%', minRank: 2521, maxRank: 2940 },
  { index: 7, label: '80%', minRank: 2941, maxRank: 3360 },
  { index: 8, label: '90%', minRank: 3361, maxRank: 3780 },
  { index: 9, label: 'Bottom 10%', minRank: 3781, maxRank: 4200 },
];

// ============ Price Bins ============

export const PRICE_BINS: PriceBin[] = [
  { index: 0, label: '0-1', minPrice: 0, maxPrice: 1 },
  { index: 1, label: '1-2', minPrice: 1, maxPrice: 2 },
  { index: 2, label: '2-3', minPrice: 2, maxPrice: 3 },
  { index: 3, label: '3-4', minPrice: 3, maxPrice: 4 },
  { index: 4, label: '4-5', minPrice: 4, maxPrice: 5 },
  { index: 5, label: '5-6', minPrice: 5, maxPrice: 6 },
  { index: 6, label: '6-10', minPrice: 6, maxPrice: 10 },
  { index: 7, label: '10+', minPrice: 10, maxPrice: Infinity },
];

// ============ Color Palette (Color-blind safe) ============

export const HEATMAP_COLORS = {
  // Sequential orange palette (single hue)
  intensity: [
    'var(--color-bg-tertiary)', // 0
    '#3d2200', // 0.2
    '#7a4400', // 0.4
    '#b86600', // 0.6
    '#f58800', // 0.8
    '#ffaa00', // 1.0
  ],

  // View mode overlays
  viewModeOverlays: {
    'sleepy-deals': 'rgba(34, 197, 94, 0.3)', // Green
    'delusion-zones': 'rgba(239, 68, 68, 0.3)', // Red
    'floor-snipes': 'rgba(59, 130, 246, 0.3)', // Blue
    'rare-reasonable': 'rgba(168, 85, 247, 0.3)', // Purple
    'whale-territory': 'rgba(251, 191, 36, 0.3)', // Gold
  },

  // Focus/selected
  focus: 'var(--color-brand-primary)',
  selected: 'var(--color-brand-glow)',
} as const;

/**
 * Get color for intensity value (0-1)
 */
export function getColorForIntensity(intensity: number): string {
  const index = Math.min(
    Math.floor(intensity * (HEATMAP_COLORS.intensity.length - 1)),
    HEATMAP_COLORS.intensity.length - 1
  );
  return HEATMAP_COLORS.intensity[index];
}

/**
 * Get high-density pattern CSS for cells with intensity > 0.7
 */
export function getHighDensityPattern(intensity: number): string | undefined {
  if (intensity > 0.7) {
    return 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)';
  }
  return undefined;
}

// ============ View Mode Configurations ============

export interface ViewModeConfig {
  id: HeatMapViewMode;
  label: string;
  description: string;
  filter: (rarityBinIndex: number, priceBinIndex: number) => boolean;
}

export const VIEW_MODES: ViewModeConfig[] = [
  {
    id: 'all',
    label: 'All',
    description: 'Show all listings',
    filter: () => true,
  },
  {
    id: 'sleepy-deals',
    label: 'Sleepy Deals',
    description: 'Good value: decent rarity, low price',
    // Top 30% rarity (bins 0-2), low price (bins 0-2)
    filter: (r, p) => r <= 2 && p <= 2,
  },
  {
    id: 'delusion-zones',
    label: 'Delusion',
    description: 'Overpriced: low rarity, high price',
    // Bottom 40% rarity (bins 6-9), high price (bins 5-7)
    filter: (r, p) => r >= 6 && p >= 5,
  },
  {
    id: 'floor-snipes',
    label: 'Floor',
    description: 'Near floor price listings',
    // First price column only (0-1 XCH)
    filter: (_, p) => p === 0,
  },
  {
    id: 'rare-reasonable',
    label: 'Rare & Reasonable',
    description: 'Rare but reasonably priced',
    // Top 20% rarity (bins 0-1), below 3 XCH (bins 0-2)
    filter: (r, p) => r <= 1 && p <= 2,
  },
  {
    id: 'whale-territory',
    label: 'Whale',
    description: 'High price listings',
    // High price (bins 6-7 = 6+ XCH)
    filter: (_, p) => p >= 6,
  },
];

// ============ Accessibility ============

/**
 * Generate accessible label for a cell
 */
export function getCellAccessibleLabel(
  rarityBin: RarityBin,
  priceBin: PriceBin,
  count: number
): string {
  const rarityText = rarityBin.label.replace('%', ' percent');
  const priceText =
    priceBin.maxPrice === Infinity
      ? `${priceBin.minPrice} XCH and above`
      : `${priceBin.minPrice} to ${priceBin.maxPrice} XCH`;

  const nftText = count === 1 ? '1 NFT' : `${count} NFTs`;

  return `Rarity ${rarityText}, price ${priceText}: ${nftText} listed`;
}

// ============ Keyboard Navigation ============

export const HEATMAP_KEYBOARD = {
  // Arrow key movements
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },

  // Jump keys
  Home: 'rowStart',
  End: 'rowEnd',
  'Ctrl+Home': 'gridStart',
  'Ctrl+End': 'gridEnd',
} as const;

/**
 * Calculate next cell position based on key press
 */
export function getNextCellPosition(
  currentRow: number,
  currentCol: number,
  key: string,
  ctrlKey: boolean
): { row: number; col: number } {
  const maxRow = HEATMAP_CONFIG.rarityBins - 1;
  const maxCol = HEATMAP_CONFIG.priceBins - 1;

  if (ctrlKey && key === 'Home') {
    return { row: 0, col: 0 };
  }
  if (ctrlKey && key === 'End') {
    return { row: maxRow, col: maxCol };
  }

  switch (key) {
    case 'ArrowUp':
      return { row: Math.max(0, currentRow - 1), col: currentCol };
    case 'ArrowDown':
      return { row: Math.min(maxRow, currentRow + 1), col: currentCol };
    case 'ArrowLeft':
      return { row: currentRow, col: Math.max(0, currentCol - 1) };
    case 'ArrowRight':
      return { row: currentRow, col: Math.min(maxCol, currentCol + 1) };
    case 'Home':
      return { row: currentRow, col: 0 };
    case 'End':
      return { row: currentRow, col: maxCol };
    default:
      return { row: currentRow, col: currentCol };
  }
}
