/**
 * MarketTab Component
 *
 * Market analysis tab with heat map and price distribution.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Flame, BarChart3 } from 'lucide-react';
import type {
  MarketStats,
  HeatMapCell,
  PriceDistribution,
  HeatMapViewMode,
} from '@/types/bigpulp';
import { HeatMap } from './HeatMap';
import {
  statsCardVariants,
  statsContainerVariants,
  tabContentVariants,
} from '@/config/bigpulpAnimations';
import type { CacheMetadata } from '@/services/heatmapCache';
import type { BadgeOption } from './HeatMap';

interface MarketTabProps {
  stats: MarketStats | null;
  heatMapData: HeatMapCell[][] | null;
  priceDistribution: PriceDistribution | null;
  viewMode: HeatMapViewMode;
  onViewModeChange: (mode: HeatMapViewMode) => void;
  isLoading?: boolean;
  // Cache state for heatmap
  heatmapCacheMetadata?: CacheMetadata | null;
  isHeatmapRefetching?: boolean;
  onHeatmapRefresh?: () => void;
  // Badge filtering
  badges?: BadgeOption[];
  selectedBadge?: string | null;
  onBadgeChange?: (badge: string | null) => void;
}

type VisualizationType = 'heatmap' | 'distribution';

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="p-3 rounded-xl text-center"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : statsCardVariants}
      whileHover="hover"
    >
      <p
        className="text-xl font-bold"
        style={{ color: 'var(--color-brand-primary)' }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      {subValue && (
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subValue}
        </p>
      )}
    </motion.div>
  );
}

function PriceDistributionChart({
  data,
}: {
  data: PriceDistribution;
}) {
  // Filter out empty bins
  const nonEmptyBins = data.bins.filter((b) => b.count > 0);
  const maxCount = Math.max(...nonEmptyBins.map((b) => b.count), 1);

  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Chart - only show non-empty bins */}
      <div className="flex items-end gap-1 mb-4" style={{ height: '180px' }}>
        {nonEmptyBins.map((bin, index) => {
          const heightPx = maxCount > 0 ? (bin.count / maxCount) * 160 : 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              {/* Bar container - fixed height for percentage to work */}
              <div className="w-full flex-1 flex items-end">
                <motion.div
                  className="w-full rounded-t-md relative group"
                  style={{
                    background:
                      'linear-gradient(to top, var(--color-brand-primary), var(--color-brand-glow))',
                    height: heightPx,
                    minHeight: bin.count > 0 ? 8 : 0,
                    transformOrigin: 'bottom',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  {/* Tooltip on hover */}
                  <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                    style={{
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {bin.count} ({bin.percentage}%)
                  </div>
                </motion.div>
              </div>

              {/* Label */}
              <p
                className="text-xs mt-2 text-center truncate w-full"
                style={{ color: 'var(--color-text-muted)' }}
                title={bin.range}
              >
                {bin.range.replace(' XCH', '')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {data.totalListed} NFTs listed
      </div>

      {/* Hidden accessible table */}
      <table className="sr-only">
        <caption>Price distribution of listed NFTs</caption>
        <thead>
          <tr>
            <th>Price Range</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.bins.map((bin, index) => (
            <tr key={index}>
              <td>{bin.range}</td>
              <td>{bin.count}</td>
              <td>{bin.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className="p-3 rounded-xl animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="h-6 w-16 rounded mx-auto mb-2"
        style={{ background: 'var(--color-border)' }}
      />
      <div
        className="h-3 w-12 rounded mx-auto"
        style={{ background: 'var(--color-border)' }}
      />
    </div>
  );
}

function HeatMapSkeleton() {
  return (
    <div
      className="p-4 rounded-xl animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="flex gap-2">
            <div
              className="w-14 h-8 rounded"
              style={{ background: 'var(--color-border)' }}
            />
            {Array.from({ length: 6 }).map((_, col) => (
              <div
                key={col}
                className="flex-1 h-8 rounded"
                style={{ background: 'var(--color-border)' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketTab({
  stats,
  heatMapData,
  priceDistribution,
  viewMode,
  onViewModeChange,
  isLoading = false,
  heatmapCacheMetadata,
  isHeatmapRefetching,
  onHeatmapRefresh,
  badges,
  selectedBadge,
  onBadgeChange,
}: MarketTabProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visualizationType, setVisualizationType] =
    useState<VisualizationType>('heatmap');

  const handleCellClick = useCallback((cell: HeatMapCell) => {
    console.log('Cell clicked:', cell);
    // TODO: Open cell detail modal
  }, []);

  // Loading skeleton
  if (isLoading || !stats) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <div
            className="h-4 w-32 rounded mb-3 animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="grid grid-cols-3 gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="flex-1 h-10 rounded-lg animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="flex-1 h-10 rounded-lg animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
        </div>
        <HeatMapSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-4"
      variants={prefersReducedMotion ? undefined : tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Market Stats */}
      <div>
        <motion.div
          className="grid grid-cols-3 gap-3"
          variants={prefersReducedMotion ? undefined : statsContainerVariants}
          initial="initial"
          animate="animate"
        >
          <StatCard
            label="Listed"
            value={stats.listedCount.toString()}
            subValue={`${((stats.listedCount / stats.totalSupply) * 100).toFixed(1)}% of supply`}
          />
          <StatCard
            label="Trades"
            value={stats.totalTrades.toLocaleString()}
            subValue="All time"
          />
          <StatCard
            label="Volume"
            value={`${Math.floor(stats.totalVolume).toLocaleString()} XCH`}
            subValue="All time"
          />
        </motion.div>
      </div>

      {/* Visualization Toggle */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background:
              visualizationType === 'heatmap'
                ? 'var(--color-brand-primary)'
                : 'var(--color-glass-bg)',
            color:
              visualizationType === 'heatmap'
                ? 'white'
                : 'var(--color-text-secondary)',
            border: `1px solid ${visualizationType === 'heatmap' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
          }}
          onClick={() => setVisualizationType('heatmap')}
        >
          <Flame size={16} />
          Heat Map
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background:
              visualizationType === 'distribution'
                ? 'var(--color-brand-primary)'
                : 'var(--color-glass-bg)',
            color:
              visualizationType === 'distribution'
                ? 'white'
                : 'var(--color-text-secondary)',
            border: `1px solid ${visualizationType === 'distribution' ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
          }}
          onClick={() => setVisualizationType('distribution')}
        >
          <BarChart3 size={16} />
          Distribution
        </button>
      </div>

      {/* Visualization */}
      <AnimatePresence mode="wait">
        {visualizationType === 'heatmap' && heatMapData && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <HeatMap
              data={heatMapData}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              onCellClick={handleCellClick}
              cacheMetadata={heatmapCacheMetadata}
              isRefetching={isHeatmapRefetching}
              onRefresh={onHeatmapRefresh}
              badges={badges}
              selectedBadge={selectedBadge}
              onBadgeChange={onBadgeChange}
            />
          </motion.div>
        )}

        {visualizationType === 'distribution' && priceDistribution && (
          <motion.div
            key="distribution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <PriceDistributionChart data={priceDistribution} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default MarketTab;
