// @ts-nocheck
/**
 * TraitValues Component
 * Displays trait trade statistics in a sortable table
 * Used in BigPulp Intelligence modal's "Traits" tab
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
} from '@ionic/react';
import {
  fetchTradeValues,
  fetchTraitSales,
  formatRelativeTime,
  formatXCH,
  TraitStats,
  Sale,
} from '../services/tradeValuesService';
import { getCachedXchPrice } from '../services/treasuryApi';
import './TraitValues.css';

type SortField = 'trait_name' | 'trait_category' | 'total_sales' | 'average_xch' | 'min_xch' | 'max_xch' | 'last_trade';
type SortDirection = 'asc' | 'desc';
type SalesSortMode = 'price_asc' | 'price_desc' | 'rarity_asc' | 'rarity_desc' | 'time_asc' | 'time_desc';

// IPFS gateway for NFT images
const IPFS_CID = 'bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq';
const getIpfsUrl = (edition: number) => {
  const paddedId = String(edition).padStart(4, '0');
  return `https://${IPFS_CID}.ipfs.w3s.link/${paddedId}.png`;
};

// Capitalize each word in a string
const capitalizeCategory = (str: string): string => {
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface TraitValuesProps {
  onTraitClick?: (traitName: string) => void;
}

const TraitValues: React.FC<TraitValuesProps> = ({ onTraitClick }) => {
  const [traitStats, setTraitStats] = useState<TraitStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('average_xch');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filtering
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected trait for detail
  const [selectedTrait, setSelectedTrait] = useState<TraitStats | null>(null);
  const [selectedTraitSales, setSelectedTraitSales] = useState<Sale[]>([]);
  const [loadingTraitSales, setLoadingTraitSales] = useState(false);

  // Sales sorting and rarity data
  const [salesSortMode, setSalesSortMode] = useState<SalesSortMode>('price_asc');
  const [rarityData, setRarityData] = useState<Map<number, number>>(new Map());
  const xchPriceUsd = getCachedXchPrice();

  // Fetch main data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchTradeValues();

      if (data.error && data.trait_stats.length === 0) {
        setError(data.error);
      } else {
        setTraitStats(data.trait_stats);
        setLastUpdated(data.last_updated);
        setTotalSalesCount(data.total_sales_count);
      }
    } catch (err) {
      setError('Failed to load trade data. Pull down to retry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load rarity data for sorting
  useEffect(() => {
    const loadRarityData = async () => {
      try {
        const response = await fetch('/assets/BigPulp/all_nft_analysis.json');
        const data = await response.json();
        const rarityMap = new Map<number, number>();
        for (const [id, analysis] of Object.entries(data)) {
          rarityMap.set(parseInt(id), (analysis as any).rank);
        }
        setRarityData(rarityMap);
      } catch (err) {
        console.error('Failed to load rarity data:', err);
      }
    };
    loadRarityData();
  }, []);

  // Fetch sales for selected trait
  const loadTraitSales = useCallback(async (traitName: string) => {
    try {
      setLoadingTraitSales(true);
      const data = await fetchTraitSales(traitName);
      setSelectedTraitSales(data.sales);
    } catch (err) {
      console.error('Failed to load trait sales:', err);
      setSelectedTraitSales([]);
    } finally {
      setLoadingTraitSales(false);
    }
  }, []);

  // When trait is selected, load its sales
  useEffect(() => {
    if (selectedTrait) {
      loadTraitSales(selectedTrait.trait_name);
    } else {
      setSelectedTraitSales([]);
    }
  }, [selectedTrait, loadTraitSales]);

  // Sorted sales based on current sort mode (with deduplication)
  const sortedSales = useMemo(() => {
    // Deduplicate: remove entries with same edition + price + timestamp
    const seen = new Set<string>();
    const dedupedSales = selectedTraitSales.filter(sale => {
      const key = `${sale.edition}-${sale.price_xch}-${sale.timestamp}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const sales = [...dedupedSales];
    switch (salesSortMode) {
      case 'price_asc':
        return sales.sort((a, b) => a.price_xch - b.price_xch);
      case 'price_desc':
        return sales.sort((a, b) => b.price_xch - a.price_xch);
      case 'rarity_asc':
        return sales.sort((a, b) => {
          const rankA = rarityData.get(a.edition) || 9999;
          const rankB = rarityData.get(b.edition) || 9999;
          return rankA - rankB; // Lower rank = rarer
        });
      case 'rarity_desc':
        return sales.sort((a, b) => {
          const rankA = rarityData.get(a.edition) || 0;
          const rankB = rarityData.get(b.edition) || 0;
          return rankB - rankA; // Higher rank = more common
        });
      case 'time_desc':
        return sales.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first
      case 'time_asc':
        return sales.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Oldest first
      default:
        return sales;
    }
  }, [selectedTraitSales, salesSortMode, rarityData]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(traitStats.map(t => t.trait_category));
    return ['all', ...Array.from(cats).sort()];
  }, [traitStats]);

  // Filtered & sorted data
  const filteredStats = useMemo(() => {
    let result = [...traitStats];

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(
        t => t.trait_category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.trait_name.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number | null = a[sortField];
      let bVal: string | number | null = b[sortField];

      // Handle nulls
      if (aVal === null) aVal = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bVal === null) bVal = sortDirection === 'asc' ? Infinity : -Infinity;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const comparison = (aVal as number) < (bVal as number) ? -1 : (aVal as number) > (bVal as number) ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [traitStats, categoryFilter, searchQuery, sortField, sortDirection]);

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const handleRowClick = (trait: TraitStats) => {
    if (selectedTrait?.trait_name === trait.trait_name) {
      setSelectedTrait(null); // Toggle off
    } else {
      setSelectedTrait(trait);
      onTraitClick?.(trait.trait_name);
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  if (loading) {
    return (
      <div className="trait-values-loading">
        <IonSpinner name="crescent" />
        <p>Loading trade data...</p>
      </div>
    );
  }

  if (error && traitStats.length === 0) {
    return (
      <div className="trait-values-error">
        <p>{error}</p>
        <button onClick={loadData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="trait-values-container">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      {/* Filters */}
      <div className="trait-filters">
        <IonSelect
          value={categoryFilter}
          onIonChange={e => setCategoryFilter(e.detail.value)}
          interface="popover"
          className="category-select"
          placeholder="Category"
        >
          {categories.map(cat => (
            <IonSelectOption key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : capitalizeCategory(cat)}
            </IonSelectOption>
          ))}
        </IonSelect>
        <IonSearchbar
          value={searchQuery}
          onIonInput={e => setSearchQuery(e.detail.value || '')}
          placeholder="Search attributes..."
          className="trait-search"
          debounce={300}
        />
      </div>

      {/* Stats Summary */}
      <div className="trait-summary">
        <span>{totalSalesCount} sales</span>
        <span className="divider">•</span>
        <span>{traitStats.length} attributes</span>
        <span className="divider">•</span>
        <span>Updated {formatRelativeTime(lastUpdated)}</span>
      </div>

      {/* Table */}
      <div className="trait-table-wrapper">
        <table className="trait-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('trait_name')}>
                Attribute{renderSortIndicator('trait_name')}
              </th>
              <th className="hide-mobile" onClick={() => handleSort('trait_category')}>
                Type{renderSortIndicator('trait_category')}
              </th>
              <th onClick={() => handleSort('total_sales')}>
                Sales{renderSortIndicator('total_sales')}
              </th>
              <th onClick={() => handleSort('average_xch')}>
                Avg{renderSortIndicator('average_xch')}
              </th>
              <th className="hide-mobile" onClick={() => handleSort('min_xch')}>
                Min{renderSortIndicator('min_xch')}
              </th>
              <th className="hide-mobile" onClick={() => handleSort('max_xch')}>
                Max{renderSortIndicator('max_xch')}
              </th>
              <th onClick={() => handleSort('last_trade')}>
                Last{renderSortIndicator('last_trade')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-results">
                  No attributes found matching your filters.
                </td>
              </tr>
            ) : (
              filteredStats.map((trait) => (
                <>
                  <tr
                    key={`${trait.trait_category}-${trait.trait_name}`}
                    onClick={() => handleRowClick(trait)}
                    className={selectedTrait?.trait_name === trait.trait_name ? 'selected' : ''}
                  >
                    <td className="trait-name">{trait.trait_name}</td>
                    <td className="trait-category hide-mobile">
                      {capitalizeCategory(trait.trait_category)}
                    </td>
                    <td>{trait.total_sales}</td>
                    <td className="price">{formatXCH(trait.average_xch)}</td>
                    <td className="price hide-mobile">{formatXCH(trait.min_xch)}</td>
                    <td className="price hide-mobile">{formatXCH(trait.max_xch)}</td>
                    <td className="last-trade">{formatRelativeTime(trait.last_trade)}</td>
                  </tr>
                  {/* Expanded detail row */}
                  {selectedTrait?.trait_name === trait.trait_name && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <div className="trait-detail">
                          <div className="recent-sales">
                            <div className="sales-header">
                              <h4>Sales ({selectedTraitSales.length})</h4>
                              <div className="sales-sort-toggles">
                                <button
                                  className={`sort-toggle ${salesSortMode.startsWith('price') ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (salesSortMode === 'price_asc') {
                                      setSalesSortMode('price_desc');
                                    } else {
                                      setSalesSortMode('price_asc');
                                    }
                                  }}
                                >
                                  💰{salesSortMode === 'price_desc' ? '↓' : '↑'}
                                </button>
                                <button
                                  className={`sort-toggle ${salesSortMode.startsWith('rarity') ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (salesSortMode === 'rarity_asc') {
                                      setSalesSortMode('rarity_desc');
                                    } else {
                                      setSalesSortMode('rarity_asc');
                                    }
                                  }}
                                >
                                  👑{salesSortMode === 'rarity_desc' ? '↓' : '↑'}
                                </button>
                                <button
                                  className={`sort-toggle ${salesSortMode.startsWith('time') ? 'active' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (salesSortMode === 'time_desc') {
                                      setSalesSortMode('time_asc');
                                    } else {
                                      setSalesSortMode('time_desc');
                                    }
                                  }}
                                >
                                  🕐{salesSortMode === 'time_asc' ? '↑' : '↓'}
                                </button>
                              </div>
                            </div>
                            {loadingTraitSales ? (
                              <IonSpinner name="dots" />
                            ) : selectedTraitSales.length === 0 ? (
                              <p className="no-sales">No sales data available.</p>
                            ) : (
                              <div className="sales-carousel">
                                {(() => {
                                  // Calculate highlights
                                  const minPrice = Math.min(...sortedSales.map(s => s.price_xch));
                                  const maxPrice = Math.max(...sortedSales.map(s => s.price_xch));
                                  const timestamps = sortedSales.map(s => new Date(s.timestamp).getTime());
                                  const lastTime = Math.max(...timestamps);
                                  const rarities = sortedSales.map(s => rarityData.get(s.edition) || 9999);
                                  const rarestRank = Math.min(...rarities);

                                  return sortedSales.map((sale, idx) => {
                                    const saleTime = new Date(sale.timestamp).getTime();
                                    const saleRarity = rarityData.get(sale.edition) || 9999;
                                    const isMin = sale.price_xch === minPrice;
                                    const isMax = sale.price_xch === maxPrice;
                                    const isLast = saleTime === lastTime;
                                    const isRarest = saleRarity === rarestRank;

                                    return (
                                      <div key={`${sale.edition}-${idx}`} className="sale-card">
                                        {/* Highlight badges above image */}
                                        <div className="sale-badges">
                                          {isMin && <span className="sale-badge min">MIN</span>}
                                          {isMax && <span className="sale-badge max">MAX</span>}
                                          {isLast && <span className="sale-badge last">🕐</span>}
                                          {isRarest && <span className="sale-badge rare">👑</span>}
                                        </div>
                                        <div className="sale-image-wrapper">
                                          <img
                                            src={getIpfsUrl(sale.edition)}
                                            alt={`#${sale.edition}`}
                                            className="sale-preview-image"
                                            loading="lazy"
                                          />
                                        </div>
                                        <div className="sale-info">
                                          <span className="sale-edition">#{sale.edition}</span>
                                          <span className="sale-price-xch">{formatXCH(sale.price_xch)} XCH</span>
                                          <span className="sale-price-usd">${(sale.price_xch * xchPriceUsd).toFixed(2)}</span>
                                          <span className="sale-rank">👑 {rarityData.get(sale.edition) || '—'}</span>
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            )}
                            {/* Average calculation below the carousel */}
                            {selectedTraitSales.length > 0 && !loadingTraitSales && (
                              <div className="avg-formula-row">
                                {(() => {
                                  const prices = selectedTraitSales.map(s => s.price_xch);
                                  const total = prices.reduce((sum, p) => sum + p, 0);
                                  const avg = total / prices.length;

                                  let priceStr;
                                  if (prices.length <= 4) {
                                    priceStr = prices.map(p => formatXCH(p)).join(' + ');
                                  } else {
                                    const first = prices.slice(0, 2).map(p => formatXCH(p)).join(' + ');
                                    const last = formatXCH(prices[prices.length - 1]);
                                    priceStr = `${first} + ... + ${last}`;
                                  }

                                  return (
                                    <span className="avg-formula">
                                      Avg: {priceStr} = {formatXCH(total)} ÷ {prices.length} = <strong>{formatXCH(avg)} XCH</strong>
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TraitValues;
