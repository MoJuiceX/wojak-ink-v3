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
import './TraitValues.css';

type SortField = 'trait_name' | 'trait_category' | 'total_sales' | 'average_xch' | 'min_xch' | 'max_xch' | 'last_trade';
type SortDirection = 'asc' | 'desc';

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
                          <div className="detail-stats">
                            <div className="stat">
                              <span className="stat-label">Category</span>
                              <span className="stat-value">{capitalizeCategory(trait.trait_category)}</span>
                            </div>
                            <div className="stat">
                              <span className="stat-label">Price Range</span>
                              <span className="stat-value">{formatXCH(trait.min_xch)} - {formatXCH(trait.max_xch)} XCH</span>
                            </div>
                            {trait.outliers_excluded > 0 && (
                              <div className="stat">
                                <span className="stat-label">Outliers Excluded</span>
                                <span className="stat-value">{trait.outliers_excluded}</span>
                              </div>
                            )}
                          </div>
                          <div className="recent-sales">
                            <h4>Recent Sales</h4>
                            {loadingTraitSales ? (
                              <IonSpinner name="dots" />
                            ) : selectedTraitSales.length === 0 ? (
                              <p className="no-sales">No recent sales data.</p>
                            ) : (
                              <div className="sales-list">
                                {selectedTraitSales.slice(0, 5).map((sale, idx) => (
                                  <div key={`${sale.edition}-${idx}`} className="sale-item">
                                    <span className="sale-edition">#{sale.edition}</span>
                                    <span className="sale-price">{formatXCH(sale.price_xch)} XCH</span>
                                    <span className="sale-time">{formatRelativeTime(sale.timestamp)}</span>
                                  </div>
                                ))}
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
