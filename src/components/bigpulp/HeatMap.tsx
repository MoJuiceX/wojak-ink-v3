/**
 * HeatMap Component
 *
 * Accessible heat map visualization for market analysis.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import type { HeatMapCell, HeatMapViewMode } from '@/types/bigpulp';
import {
  HEATMAP_CONFIG,
  RARITY_BINS,
  PRICE_BINS,
  getColorForIntensity,
  getHighDensityPattern,
  getNextCellPosition,
  VIEW_MODES,
} from '@/config/heatMapConfig';
import { heatMapCellVariants } from '@/config/bigpulpAnimations';

interface HeatMapProps {
  data: HeatMapCell[][];
  viewMode: HeatMapViewMode;
  onViewModeChange: (mode: HeatMapViewMode) => void;
  onCellClick: (cell: HeatMapCell) => void;
}

function ViewModeButtons({
  viewMode,
  onViewModeChange,
}: {
  viewMode: HeatMapViewMode;
  onViewModeChange: (mode: HeatMapViewMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.id}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background:
              viewMode === mode.id
                ? 'var(--color-brand-primary)'
                : 'var(--color-glass-bg)',
            color: viewMode === mode.id ? 'white' : 'var(--color-text-secondary)',
            border: `1px solid ${viewMode === mode.id ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
          }}
          onClick={() => onViewModeChange(mode.id)}
          title={mode.description}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}

// Cell Detail Modal - shows NFTs in selected cell
function CellDetailModal({
  cell,
  onClose,
}: {
  cell: HeatMapCell;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? {} : { opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          transform: 'translate(-50%, -50%)',
        }}
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <h3
              className="font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {cell.rarityBin.label} • {cell.priceBin.label} XCH
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {cell.count} NFT{cell.count !== 1 ? 's' : ''} listed
            </p>
          </div>
          <button
            className="p-2 rounded-lg transition-colors"
            style={{
              background: 'var(--color-glass-bg)',
              color: 'var(--color-text-secondary)',
            }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* NFT List */}
        <div className="flex-1 overflow-y-auto p-4">
          {cell.nfts.length === 0 ? (
            <p
              className="text-center py-8"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No NFTs in this range
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {cell.nfts.map((nft) => (
                <div
                  key={nft.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--color-glass-bg)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src={nft.thumbnailUrl}
                    alt={nft.name}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="p-2">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {nft.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {nft.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function HeatMapCell({
  cell,
  isHighlighted,
  isFocused,
  onClick,
  onFocus,
}: {
  cell: HeatMapCell;
  isHighlighted: boolean;
  isFocused: boolean;
  onClick: () => void;
  onFocus: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const backgroundColor = getColorForIntensity(cell.intensity);
  const pattern = getHighDensityPattern(cell.intensity);

  return (
    <motion.button
      role="gridcell"
      aria-label={cell.label}
      tabIndex={isFocused ? 0 : -1}
      className="relative flex-1 flex items-center justify-center text-xs font-medium transition-colors"
      style={{
        backgroundColor,
        backgroundImage: pattern,
        borderRadius: HEATMAP_CONFIG.cellBorderRadius,
        minWidth: HEATMAP_CONFIG.cellMinSize,
        minHeight: 32,
        height: 32,
        opacity: isHighlighted ? 1 : 0.4,
        outline: isFocused
          ? `2px solid var(--color-brand-primary)`
          : 'none',
        outlineOffset: '2px',
        color:
          cell.intensity > 0.5
            ? 'white'
            : 'var(--color-text-secondary)',
      }}
      variants={prefersReducedMotion ? undefined : heatMapCellVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onFocus={onFocus}
    >
      {cell.count > 0 && <span>{cell.count}</span>}
    </motion.button>
  );
}

export function HeatMap({
  data,
  viewMode,
  onViewModeChange,
  onCellClick,
}: HeatMapProps) {
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  const [selectedCell, setSelectedCell] = useState<HeatMapCell | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Get view mode filter
  const viewModeConfig = VIEW_MODES.find((m) => m.id === viewMode);
  const isHighlighted = useCallback(
    (rarityIndex: number, priceIndex: number) => {
      if (!viewModeConfig) return true;
      return viewModeConfig.filter(rarityIndex, priceIndex);
    },
    [viewModeConfig]
  );

  // Handle cell click - show modal
  const handleCellClick = useCallback((cell: HeatMapCell) => {
    setSelectedCell(cell);
    onCellClick(cell);
  }, [onCellClick]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const { row, col } = getNextCellPosition(
        focusedCell.row,
        focusedCell.col,
        e.key,
        e.ctrlKey
      );

      if (row !== focusedCell.row || col !== focusedCell.col) {
        e.preventDefault();
        setFocusedCell({ row, col });
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cell = data[row]?.[col];
        if (cell) handleCellClick(cell);
      }
    },
    [focusedCell, data, handleCellClick]
  );

  // Flatten data for accessible table
  const tableData = useMemo(() => {
    return data.flatMap((row) => row);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div
        className="p-8 text-center rounded-xl"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p style={{ color: 'var(--color-text-muted)' }}>
          No heat map data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View mode buttons */}
      <ViewModeButtons viewMode={viewMode} onViewModeChange={onViewModeChange} />

      {/* Heat map grid - flexible width */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Column headers (price bins) */}
        <div className="flex gap-1 mb-2 ml-16">
          {PRICE_BINS.map((bin) => (
            <div
              key={bin.index}
              className="flex-1 text-center text-xs"
              style={{
                color: 'var(--color-text-muted)',
                minWidth: HEATMAP_CONFIG.cellMinSize,
              }}
            >
              {bin.label}
            </div>
          ))}
        </div>

        {/* Grid - wider than tall */}
        <div
          ref={gridRef}
          role="grid"
          aria-label="Market heat map showing NFT distribution by rarity and price"
          className="flex flex-col gap-1"
          onKeyDown={handleKeyDown}
        >
          {data.map((row, rowIndex) => (
            <div key={rowIndex} role="row" className="flex gap-1 items-center">
              {/* Row header (rarity bin) */}
              <div
                className="w-16 text-right text-xs pr-2 flex-shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {RARITY_BINS[rowIndex]?.label || ''}
              </div>

              {/* Cells - flex-1 for flexible width */}
              {row.map((cell, colIndex) => (
                <HeatMapCell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  isHighlighted={isHighlighted(rowIndex, colIndex)}
                  isFocused={
                    focusedCell.row === rowIndex && focusedCell.col === colIndex
                  }
                  onClick={() => handleCellClick(cell)}
                  onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Axis labels */}
        <div className="flex justify-between mt-4 text-xs">
          <span style={{ color: 'var(--color-text-muted)' }}>Rarity ↓</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Price (XCH) →</span>
        </div>
      </div>


      {/* Hidden accessible data table */}
      <table className="sr-only">
        <caption>
          Heat map data: NFT distribution by rarity and price
        </caption>
        <thead>
          <tr>
            <th>Rarity</th>
            <th>Price Range</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((cell, index) => (
            <tr key={index}>
              <td>{cell.rarityBin.label}</td>
              <td>{cell.priceBin.label}</td>
              <td>{cell.count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cell Detail Modal */}
      <AnimatePresence>
        {selectedCell && (
          <CellDetailModal
            cell={selectedCell}
            onClose={() => setSelectedCell(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default HeatMap;
