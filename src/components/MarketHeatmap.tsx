import { useState, useEffect, useMemo } from 'react';
import {
  IonButton,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonThumbnail,
  IonImg
} from '@ionic/react';
import { NFTListing, fetchAllListings, calculateFloorPrice, getCachedListings, getNftImageUrl } from '../services/marketApi';
import { getCachedXchPrice, getXchPrice } from '../services/treasuryApi';
import './MarketHeatmap.css';

interface MarketHeatmapProps {
  rankData?: Record<string, number>; // NFT ID -> rank (1-4200)
  onNftClick?: (nftId: string) => void;
}

interface HeatmapCell {
  rarityRange: string;
  priceRange: string;
  rarityMin: number;
  rarityMax: number;
  priceMin: number;
  priceMax: number;
  listings: NFTListing[];
  count: number;
}

type HeatmapMode = 'all' | 'sleepy' | 'delusion' | 'floor' | 'rare' | 'whale';
type ViewType = 'heatmap' | 'distribution';

const HEATMAP_MODES: { key: HeatmapMode; label: string; description: string }[] = [
  { key: 'all', label: 'All Listings', description: 'Show all listed NFTs' },
  { key: 'sleepy', label: 'Find Sleepy Deals', description: 'Rare NFTs at low prices' },
  { key: 'delusion', label: 'Spot Delusion Zones', description: 'Overpriced listings' },
  { key: 'floor', label: 'Snipe Near Floor', description: 'NFTs at floor price' },
  { key: 'rare', label: 'Rare & Reasonable', description: 'Top rarity, fair price' },
  { key: 'whale', label: 'Whale Territory', description: 'Premium rare NFTs' },
];

// Rarity ranges (percentile-based)
const RARITY_RANGES = [
  { label: '0-10% (rarest)', min: 0, max: 10 },
  { label: '10-20%', min: 10, max: 20 },
  { label: '20-30%', min: 20, max: 30 },
  { label: '30-40%', min: 30, max: 40 },
  { label: '40-50%', min: 40, max: 50 },
  { label: '50-60%', min: 50, max: 60 },
  { label: '60-70%', min: 60, max: 70 },
  { label: '70-80%', min: 70, max: 80 },
  { label: '80-90%', min: 80, max: 90 },
  { label: '90-100% (common)', min: 90, max: 100 },
];

// Price multiple ranges (relative to floor)
const PRICE_RANGES = [
  { label: '1-1.1x', min: 1, max: 1.1 },
  { label: '1.1-1.25x', min: 1.1, max: 1.25 },
  { label: '1.25-1.5x', min: 1.25, max: 1.5 },
  { label: '1.5-2x', min: 1.5, max: 2 },
  { label: '2-3x', min: 2, max: 3 },
  { label: '3-5x', min: 3, max: 5 },
  { label: '5-10x', min: 5, max: 10 },
  { label: '10x+', min: 10, max: Infinity },
];

const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ rankData, onNftClick }) => {
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [mode, setMode] = useState<HeatmapMode>('all');
  const [viewType, setViewType] = useState<ViewType>('heatmap');
  const [internalRankData, setInternalRankData] = useState<Record<string, number>>({});
  const [xchPriceUsd, setXchPriceUsd] = useState<number>(getCachedXchPrice());
  const [selectedBar, setSelectedBar] = useState<{ priceRange: string; listings: NFTListing[] } | null>(null);

  // Load listings and rank data
  useEffect(() => {
    const loadData = async () => {
      // Try cached data first for instant display
      const cached = getCachedListings();
      if (cached && cached.length > 0) {
        setListings(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        // Load rank data if not provided (from static file - fast)
        if (!rankData) {
          const analysisRes = await fetch('/assets/BigPulp/all_nft_analysis.json');
          const analysisData = await analysisRes.json();
          const ranks: Record<string, number> = {};
          for (const [id, data] of Object.entries(analysisData)) {
            ranks[id] = (data as any).rank;
          }
          setInternalRankData(ranks);
        }

        // Fetch fresh listings (will use cache if available)
        const result = await fetchAllListings();
        setListings(result.listings);

        // Fetch XCH price for USD conversion
        const price = await getXchPrice();
        setXchPriceUsd(price);
      } catch (err) {
        console.error('Heatmap load error:', err);
        // Only show error if we have no data at all
        if (listings.length === 0) {
          setError('Failed to load market data');
        }
      }

      setLoading(false);
    };

    loadData();
  }, [rankData]);

  const ranks = rankData || internalRankData;

  // Calculate floor price
  const floorPrice = useMemo(() => {
    return calculateFloorPrice(listings);
  }, [listings]);

  // Build heatmap grid
  const heatmapGrid = useMemo(() => {
    if (!floorPrice || floorPrice === 0) return [];

    const grid: HeatmapCell[][] = [];

    for (const rarityRange of RARITY_RANGES) {
      const row: HeatmapCell[] = [];

      for (const priceRange of PRICE_RANGES) {
        const cellListings = listings.filter(listing => {
          const rank = ranks[listing.nftId];
          if (!rank) return false;

          const percentile = (rank / 4200) * 100;
          const priceMultiple = listing.priceXch / floorPrice;

          const inRarityRange = percentile >= rarityRange.min && percentile < rarityRange.max;
          const inPriceRange = priceMultiple >= priceRange.min &&
            (priceRange.max === Infinity ? true : priceMultiple < priceRange.max);

          return inRarityRange && inPriceRange;
        });

        row.push({
          rarityRange: rarityRange.label,
          priceRange: priceRange.label,
          rarityMin: rarityRange.min,
          rarityMax: rarityRange.max,
          priceMin: priceRange.min,
          priceMax: priceRange.max,
          listings: cellListings,
          count: cellListings.length
        });
      }

      grid.push(row);
    }

    return grid;
  }, [listings, ranks, floorPrice]);

  // Apply mode filtering
  const filteredGrid = useMemo(() => {
    if (mode === 'all') return heatmapGrid;

    return heatmapGrid.map(row =>
      row.map(cell => {
        let highlight = false;

        switch (mode) {
          case 'sleepy':
            // Rare (top 30%) + cheap (< 2x floor)
            highlight = cell.rarityMax <= 30 && cell.priceMax <= 2;
            break;
          case 'delusion':
            // Any rarity + expensive (> 5x floor)
            highlight = cell.priceMin >= 5;
            break;
          case 'floor':
            // Any rarity + near floor (< 1.25x)
            highlight = cell.priceMax <= 1.25;
            break;
          case 'rare':
            // Rare (top 20%) + reasonable (1.5-3x)
            highlight = cell.rarityMax <= 20 && cell.priceMin >= 1.5 && cell.priceMax <= 3;
            break;
          case 'whale':
            // Very rare (top 10%) + premium (> 3x)
            highlight = cell.rarityMax <= 10 && cell.priceMin >= 3;
            break;
        }

        return { ...cell, highlight };
      })
    );
  }, [heatmapGrid, mode]);

  // Get max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...heatmapGrid.flatMap(row => row.map(cell => cell.count)), 1);
  }, [heatmapGrid]);

  // Price distribution for bar chart (aggregates all rarity levels)
  const priceDistribution = useMemo(() => {
    if (!floorPrice || floorPrice === 0) return [];

    return PRICE_RANGES.map(priceRange => {
      const matchingListings = listings.filter(listing => {
        const priceMultiple = listing.priceXch / floorPrice;
        return priceMultiple >= priceRange.min &&
          (priceRange.max === Infinity ? true : priceMultiple < priceRange.max);
      });

      return {
        label: priceRange.label,
        count: matchingListings.length,
        listings: matchingListings
      };
    });
  }, [listings, floorPrice]);

  // Max count for bar chart scaling
  const maxBarCount = useMemo(() => {
    return Math.max(...priceDistribution.map(d => d.count), 1);
  }, [priceDistribution]);

  // Get cell background color based on count (theme-aware)
  const getCellColor = (count: number, highlight?: boolean) => {
    if (count === 0) return 'transparent';

    const intensity = Math.min(count / maxCount, 1);
    const alpha = 0.2 + intensity * 0.6;

    // Read CSS variables for theme-aware colors
    const rootStyles = getComputedStyle(document.documentElement);
    const cellRgb = rootStyles.getPropertyValue('--heatmap-cell-rgb').trim() || '99, 102, 241';
    const highlightRgb = rootStyles.getPropertyValue('--heatmap-highlight-rgb').trim() || '255, 140, 0';

    if (highlight) {
      return `rgba(${highlightRgb}, ${alpha})`;
    }

    return `rgba(${cellRgb}, ${alpha})`;
  };

  // Preload images for all listings so they show instantly when clicking cells
  useEffect(() => {
    if (listings.length > 0) {
      // Use requestIdleCallback to preload images without blocking UI
      const preloadImages = () => {
        listings.forEach(listing => {
          const img = new Image();
          img.src = getNftImageUrl(listing.nftId);
        });
      };

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preloadImages);
      } else {
        setTimeout(preloadImages, 100);
      }
    }
  }, [listings]);

  if (loading) {
    return (
      <div className="heatmap-loading">
        <IonSpinner name="crescent" />
        <p>Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="heatmap-error">
        <p>{error}</p>
        <IonButton onClick={() => window.location.reload()}>Retry</IonButton>
      </div>
    );
  }

  return (
    <div className="market-heatmap">
      <div className="heatmap-card">
        {/* Stats Bar */}
        <div className="heatmap-stats">
          <div className="stat">
            <span className="stat-label">Listed</span>
            <span className="stat-value">{listings.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Floor</span>
            <span className="stat-value">{floorPrice.toFixed(2)} XCH</span>
          </div>
        </div>

        {/* View Type Toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${viewType === 'heatmap' ? 'active' : ''}`}
            onClick={() => setViewType('heatmap')}
          >
            Heat Map
          </button>
          <button
            className={`view-toggle-btn ${viewType === 'distribution' ? 'active' : ''}`}
            onClick={() => setViewType('distribution')}
          >
            Price Distribution
          </button>
        </div>

        {/* Mode Selector - only show for heatmap */}
        {viewType === 'heatmap' && <div className="heatmap-modes">
          {HEATMAP_MODES.map(m => (
            <button
              key={m.key}
              className={`mode-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>}

        {/* Heatmap View */}
        {viewType === 'heatmap' && (
          <>
            <div className="heatmap-container">
              {/* Price headers */}
              <div className="heatmap-header">
                <div className="header-spacer" />
                {PRICE_RANGES.map(p => (
                  <div key={p.label} className="header-cell">
                    {p.label}
                  </div>
                ))}
              </div>

              {/* Grid rows */}
              {filteredGrid.map((row, rowIdx) => (
                <div key={rowIdx} className="heatmap-row">
                  <div className="row-label">
                    {RARITY_RANGES[rowIdx].label}
                  </div>
                  {row.map((cell, colIdx) => (
                    <div
                      key={colIdx}
                      className={`heatmap-cell ${cell.count > 0 ? 'clickable' : ''} ${(cell as any).highlight ? 'highlighted' : ''}`}
                      style={{ backgroundColor: getCellColor(cell.count, (cell as any).highlight) }}
                      onClick={() => cell.count > 0 && setSelectedCell(cell)}
                    >
                      {cell.count > 0 && <span>{cell.count}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="heatmap-legend">
              <span className="legend-label">Density:</span>
              <div className="legend-scale">
                <div className="legend-item low" />
                <div className="legend-item mid" />
                <div className="legend-item high" />
              </div>
              <span className="legend-labels">
                <span>Low</span>
                <span>High</span>
              </span>
            </div>
          </>
        )}

        {/* Price Distribution View (Bar Chart) */}
        {viewType === 'distribution' && (
          <div className="distribution-container">
            <div className="distribution-chart">
              {priceDistribution.map((bar, idx) => {
                const heightPercent = maxBarCount > 0 ? (bar.count / maxBarCount) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className={`distribution-bar-wrapper ${bar.count > 0 ? 'clickable' : ''}`}
                    onClick={() => bar.count > 0 && setSelectedBar({ priceRange: bar.label, listings: bar.listings })}
                  >
                    <div className="bar-count">{bar.count > 0 ? bar.count : ''}</div>
                    <div
                      className="distribution-bar"
                      style={{ height: `${Math.max(heightPercent, bar.count > 0 ? 5 : 0)}%` }}
                    />
                    <div className="bar-label">{bar.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="distribution-axis">
              <span>Floor</span>
              <span>→</span>
              <span>10x+ Floor</span>
            </div>
          </div>
        )}
      </div>

      {/* Cell Detail Modal */}
      <IonModal isOpen={!!selectedCell} onDidDismiss={() => setSelectedCell(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {selectedCell?.count} NFT{selectedCell?.count !== 1 ? 's' : ''}
            </IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setSelectedCell(null)}>
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="cell-detail-header">
            <span>Rarity: {selectedCell?.rarityRange}</span>
            <span>Price: {selectedCell?.priceRange}</span>
          </div>
          <IonList>
            {selectedCell?.listings
              .sort((a, b) => a.priceXch - b.priceXch)
              .map(listing => (
                <IonItem
                  key={listing.nftId}
                  button
                  onClick={() => {
                    onNftClick?.(listing.nftId);
                    setSelectedCell(null);
                  }}
                >
                  <IonThumbnail slot="start">
                    <IonImg src={getNftImageUrl(listing.nftId)} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>Wojak #{listing.nftId}</h2>
                    <p className="nft-rank">👑{ranks[listing.nftId] || '?'}</p>
                  </IonLabel>
                  <IonLabel slot="end" className="price-label">
                    <span className="price-xch">{listing.priceXch.toFixed(2)} XCH</span>
                    <span className="price-usd">${(listing.priceXch * xchPriceUsd).toFixed(2)}</span>
                    <span className="price-multiple">
                      {(listing.priceXch / floorPrice).toFixed(1)}x floor
                    </span>
                  </IonLabel>
                </IonItem>
              ))}
          </IonList>
        </IonContent>
      </IonModal>

      {/* Bar Detail Modal (for Price Distribution) */}
      <IonModal isOpen={!!selectedBar} onDidDismiss={() => setSelectedBar(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {selectedBar?.listings.length} NFT{selectedBar?.listings.length !== 1 ? 's' : ''} at {selectedBar?.priceRange}
            </IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setSelectedBar(null)}>
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {selectedBar?.listings
              .sort((a, b) => a.priceXch - b.priceXch)
              .map(listing => (
                <IonItem
                  key={listing.nftId}
                  button
                  onClick={() => {
                    onNftClick?.(listing.nftId);
                    setSelectedBar(null);
                  }}
                >
                  <IonThumbnail slot="start">
                    <IonImg src={getNftImageUrl(listing.nftId)} />
                  </IonThumbnail>
                  <IonLabel>
                    <h2>Wojak #{listing.nftId}</h2>
                    <p className="nft-rank">👑{ranks[listing.nftId] || '?'}</p>
                  </IonLabel>
                  <IonLabel slot="end" className="price-label">
                    <span className="price-xch">{listing.priceXch.toFixed(2)} XCH</span>
                    <span className="price-usd">${(listing.priceXch * xchPriceUsd).toFixed(2)}</span>
                    <span className="price-multiple">
                      {(listing.priceXch / floorPrice).toFixed(1)}x floor
                    </span>
                  </IonLabel>
                </IonItem>
              ))}
          </IonList>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default MarketHeatmap;
