/**
 * AttributesTab Component
 *
 * Searchable, sortable attributes table with expandable rows.
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import type {
  AttributeStats,
  AttributeSortField,
  AttributeSortState,
} from '@/types/bigpulp';
import {
  tableRowVariants,
  tableRowExpandVariants,
  tabContentVariants,
} from '@/config/bigpulpAnimations';

interface AttributesTabProps {
  attributes: AttributeStats[];
  categories?: string[];
  onAttributeClick?: (attribute: AttributeStats) => void;
  isLoading?: boolean;
}

const SORT_FIELDS: { field: AttributeSortField; label: string }[] = [
  { field: 'category', label: 'Category' },
  { field: 'value', label: 'Attribute' },
  { field: 'totalSales', label: 'Sales' },
  { field: 'avgPrice', label: 'Avg XCH' },
  { field: 'minPrice', label: 'Min' },
  { field: 'maxPrice', label: 'Max' },
  { field: 'lastSaleDate', label: 'Last Sale' },
];

// XCH to USD conversion rate
const XCH_USD_RATE = 5.25;

// Format relative time for last sale
function formatRelativeTime(date: Date | undefined): string {
  if (!date) return '-';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

function AttributeRow({
  attribute,
  isExpanded,
  onToggle,
  index,
}: {
  attribute: AttributeStats;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <motion.tr
        className="cursor-pointer transition-colors"
        style={{
          background: isExpanded
            ? 'var(--color-glass-hover)'
            : 'transparent',
        }}
        onClick={onToggle}
        variants={prefersReducedMotion ? undefined : tableRowVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: index * 0.02 }}
        aria-expanded={isExpanded}
      >
        <td
          className="py-3 px-4 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {attribute.category}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                size={14}
                style={{ color: 'var(--color-text-muted)' }}
              />
            </motion.div>
            <span
              className="font-medium text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {attribute.value}
            </span>
          </div>
        </td>
        <td
          className="py-3 px-4 text-center text-sm font-mono"
          style={{ color: attribute.totalSales > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
        >
          {attribute.totalSales > 0 ? attribute.totalSales : '-'}
        </td>
        <td className="py-3 px-4 text-center">
          {attribute.avgPrice > 0 ? (
            <div>
              <span
                className="text-sm font-mono"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {attribute.avgPrice.toFixed(2)}
              </span>
              <span
                className="text-xs block"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ${(attribute.avgPrice * XCH_USD_RATE).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>-</span>
          )}
        </td>
        <td
          className="py-3 px-4 text-center text-sm font-mono"
          style={{ color: attribute.minPrice > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
        >
          {attribute.minPrice > 0 ? attribute.minPrice.toFixed(2) : '-'}
        </td>
        <td
          className="py-3 px-4 text-center text-sm font-mono"
          style={{ color: attribute.maxPrice > 0 ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
        >
          {attribute.maxPrice > 0 ? attribute.maxPrice.toFixed(2) : '-'}
        </td>
        <td
          className="py-3 px-4 text-center text-sm"
          style={{ color: attribute.lastSaleDate ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}
        >
          {formatRelativeTime(attribute.lastSaleDate)}
        </td>
      </motion.tr>

      {/* Expanded content with individual sales */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr>
            <td colSpan={7}>
              <motion.div
                variants={prefersReducedMotion ? undefined : tableRowExpandVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="p-4"
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <div className="flex flex-col gap-4">
                    {/* Header with calculation breakdown */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {attribute.category}: {attribute.value}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: attribute.rarity < 5 ? 'var(--color-brand-primary)' : 'var(--color-glass-bg)',
                            color: attribute.rarity < 5 ? 'white' : 'var(--color-text-muted)',
                          }}
                        >
                          {attribute.count} NFTs ({attribute.rarity.toFixed(1)}%)
                        </span>
                        {attribute.totalSales > 0 && (
                          <span
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: 'var(--color-glass-bg)',
                              color: 'var(--color-brand-primary)',
                            }}
                          >
                            {attribute.totalSales} sales → Avg: {attribute.avgPrice.toFixed(2)} XCH
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats Summary */}
                    {attribute.totalSales > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        <div
                          className="p-2 rounded-lg text-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Total Sales
                          </p>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {attribute.totalSales}
                          </p>
                        </div>
                        <div
                          className="p-2 rounded-lg text-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Average
                          </p>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-brand-primary)' }}>
                            {attribute.avgPrice.toFixed(2)} XCH
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ${(attribute.avgPrice * XCH_USD_RATE).toFixed(2)}
                          </p>
                        </div>
                        <div
                          className="p-2 rounded-lg text-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Min
                          </p>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {attribute.minPrice.toFixed(2)} XCH
                          </p>
                        </div>
                        <div
                          className="p-2 rounded-lg text-center"
                          style={{ background: 'var(--color-glass-bg)' }}
                        >
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            Max
                          </p>
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {attribute.maxPrice.toFixed(2)} XCH
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Individual Sales Grid with NFT Previews */}
                    {attribute.recentSales && attribute.recentSales.length > 0 ? (
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          Recent Sales
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {attribute.recentSales.slice(0, 16).map((sale, idx) => (
                            <div
                              key={`${sale.nftId}-${idx}`}
                              className="rounded-lg overflow-hidden"
                              style={{
                                background: 'var(--color-glass-bg)',
                                border: '1px solid var(--color-border)',
                              }}
                            >
                              <img
                                src={sale.nftImage}
                                alt={`Wojak #${sale.nftId}`}
                                className="w-full aspect-square object-cover"
                                loading="lazy"
                              />
                              <div className="p-1.5 text-center">
                                <p
                                  className="text-xs font-medium truncate"
                                  style={{ color: 'var(--color-text-primary)' }}
                                >
                                  #{sale.nftId}
                                </p>
                                <p
                                  className="text-xs font-mono"
                                  style={{ color: 'var(--color-brand-primary)' }}
                                >
                                  {sale.price.toFixed(2)} XCH
                                </p>
                                <p
                                  className="text-[10px]"
                                  style={{ color: 'var(--color-text-muted)' }}
                                >
                                  {formatRelativeTime(sale.date)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {attribute.recentSales.length > 16 && (
                          <p
                            className="text-xs text-center mt-2"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            +{attribute.recentSales.length - 16} more sales
                          </p>
                        )}
                      </div>
                    ) : (
                      <p
                        className="text-sm text-center py-4"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        No sales recorded for this trait
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4">
        <div
          className="h-4 w-16 rounded"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="h-4 w-20 rounded"
            style={{ background: 'var(--color-border)' }}
          />
        </div>
      </td>
      <td className="py-3 px-4">
        <div
          className="h-4 w-8 rounded mx-auto"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
      <td className="py-3 px-4">
        <div
          className="h-4 w-12 rounded mx-auto mb-1"
          style={{ background: 'var(--color-border)' }}
        />
        <div
          className="h-3 w-8 rounded mx-auto"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
      <td className="py-3 px-4">
        <div
          className="h-4 w-10 rounded mx-auto"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
      <td className="py-3 px-4">
        <div
          className="h-4 w-10 rounded mx-auto"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
      <td className="py-3 px-4">
        <div
          className="h-4 w-16 rounded mx-auto"
          style={{ background: 'var(--color-border)' }}
        />
      </td>
    </tr>
  );
}

export function AttributesTab({
  attributes,
  isLoading = false,
}: AttributesTabProps) {
  const prefersReducedMotion = useReducedMotion();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="flex-1 h-10 rounded-lg animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="w-40 h-10 rounded-lg animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
        </div>
        <div
          className="h-3 w-48 rounded animate-pulse"
          style={{ background: 'var(--color-border)' }}
        />
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {SORT_FIELDS.map(({ field, label }) => (
                  <th
                    key={field}
                    className={`py-3 px-4 text-xs font-medium ${field === 'value' ? 'text-left' : 'text-center'}`}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortState, setSortState] = useState<AttributeSortState>({
    field: 'avgPrice',
    direction: 'desc',
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Get unique categories from attributes
  const uniqueCategories = useMemo(() => {
    const cats = new Set(attributes.map((a) => a.category));
    return Array.from(cats).sort();
  }, [attributes]);

  // Filter and sort attributes
  const filteredAttributes = useMemo(() => {
    let result = [...attributes];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.value.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortState.field) {
        case 'value':
          comparison = a.value.localeCompare(b.value);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'rarity':
          comparison = a.rarity - b.rarity;
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'totalSales':
          comparison = a.totalSales - b.totalSales;
          break;
        case 'avgPrice':
          comparison = a.avgPrice - b.avgPrice;
          break;
        case 'minPrice':
          comparison = a.minPrice - b.minPrice;
          break;
        case 'maxPrice':
          comparison = a.maxPrice - b.maxPrice;
          break;
        case 'lastSaleDate':
          // Sort by date - items with no date go to the end
          const aTime = a.lastSaleDate?.getTime() || 0;
          const bTime = b.lastSaleDate?.getTime() || 0;
          comparison = aTime - bTime;
          break;
        default:
          comparison = 0;
      }
      return sortState.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [attributes, searchQuery, selectedCategory, sortState]);

  const handleSort = useCallback((field: AttributeSortField) => {
    setSortState((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleRowToggle = useCallback((key: string) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  }, []);

  return (
    <motion.div
      className="space-y-4 p-4"
      variants={prefersReducedMotion ? undefined : tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--color-glass-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <option value="">All Categories</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Showing {filteredAttributes.length} of {attributes.length} attributes
      </p>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {SORT_FIELDS.map(({ field, label }) => {
                  const isLeftAligned = field === 'category' || field === 'value';
                  return (
                    <th
                      key={field}
                      className={`py-3 px-4 text-xs font-medium cursor-pointer transition-colors ${isLeftAligned ? 'text-left' : 'text-center'}`}
                      style={{
                        color:
                          sortState.field === field
                            ? 'var(--color-brand-primary)'
                            : 'var(--color-text-muted)',
                      }}
                      onClick={() => handleSort(field)}
                      aria-sort={
                        sortState.field === field
                          ? sortState.direction === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <div
                        className={`flex items-center gap-1 ${isLeftAligned ? '' : 'justify-center'}`}
                      >
                        {label}
                        {sortState.field === field ? (
                          sortState.direction === 'asc' ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )
                        ) : (
                          <ArrowUpDown
                            size={12}
                            style={{ opacity: 0.3 }}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredAttributes.map((attr, index) => {
                const key = `${attr.category}-${attr.value}`;
                return (
                  <AttributeRow
                    key={key}
                    attribute={attr}
                    isExpanded={expandedRow === key}
                    onToggle={() => handleRowToggle(key)}
                    index={index}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttributes.length === 0 && (
          <div
            className="p-8 text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No attributes found matching your search
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AttributesTab;
