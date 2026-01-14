/**
 * AskTab Component
 *
 * Collection stats and expandable info sections.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, BookOpen, Gem, Trophy, Sparkles, BarChart3 } from 'lucide-react';
import { useXchPrice } from '@/hooks/data/useTreasuryData';
import type {
  MarketStats,
  AttributeStats,
  NFTSale,
  NFTBasic,
} from '@/types/bigpulp';
import {
  statsCardVariants,
  statsContainerVariants,
  accordionVariants,
  accordionTransition,
  accordionArrowVariants,
  tabContentVariants,
} from '@/config/bigpulpAnimations';

interface AskTabProps {
  stats: MarketStats | null;
  topAttributes: AttributeStats[];
  topSales: NFTSale[];
  rarestFinds: NFTBasic[];
  isLoading?: boolean;
}

type SectionId = 'provenance' | 'attributes' | 'sales' | 'rarest';

interface SectionConfig {
  id: SectionId;
  icon: React.ElementType;
  title: string;
}

const SECTIONS: SectionConfig[] = [
  { id: 'provenance', icon: BookOpen, title: 'Learn Provenance' },
  { id: 'attributes', icon: Gem, title: 'Top 10 Valuable Attributes' },
  { id: 'sales', icon: Trophy, title: 'Top 10 Highest Sales' },
  { id: 'rarest', icon: Sparkles, title: 'Rarest Finds' },
];

function StatCard({
  label,
  value,
  subValue,
  usdValue,
}: {
  label: string;
  value: string;
  subValue?: string;
  usdValue?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="p-3 rounded-xl text-center flex flex-col items-center justify-center"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
      variants={prefersReducedMotion ? undefined : statsCardVariants}
      whileHover="hover"
    >
      <p
        className="text-base font-bold whitespace-nowrap"
        style={{ color: 'var(--color-brand-primary)' }}
      >
        {value}
        {subValue && (
          <span
            className="text-xs font-medium ml-0.5"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subValue}
          </span>
        )}
        {usdValue && (
          <span
            className="text-xs font-medium ml-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ({usdValue})
          </span>
        )}
      </p>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
    </motion.div>
  );
}

function ExpandableSection({
  section,
  isExpanded,
  onToggle,
  children,
}: {
  section: SectionConfig;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = section.icon;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left transition-colors"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`section-${section.id}`}
        style={{
          background: isExpanded ? 'var(--color-glass-hover)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon
            size={18}
            style={{ color: 'var(--color-brand-primary)' }}
          />
          <span
            className="font-medium text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {section.title}
          </span>
        </div>
        <motion.div
          variants={prefersReducedMotion ? undefined : accordionArrowVariants}
          animate={isExpanded ? 'expanded' : 'collapsed'}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            size={18}
            style={{ color: 'var(--color-text-muted)' }}
          />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`section-${section.id}`}
            role="region"
            aria-labelledby={`section-${section.id}-header`}
            variants={prefersReducedMotion ? undefined : accordionVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={accordionTransition}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="p-4 pt-0"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProvenanceContent() {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          className="p-3 rounded-lg"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            High Provenance
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            These aren't necessarily the rarest attributes, but they're the most valuable. The community has spoken — Crown, Military Beret, Wizard Hat, Fedora, and Neckbeard command premium prices because of their cultural significance and meme status.
          </p>
        </div>

        <div
          className="p-3 rounded-lg"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            Rarest Attributes
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            The scarcest attributes in the collection. Piccolo Turban, Piccolo Uniform, Fake It Mask, El Presidente, and Goose Suit are among the rarest pieces you can find. These dominate the top rankings.
          </p>
        </div>

        <div
          className="p-3 rounded-lg"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            Bases
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Monkey Zoo represents the OG ape heritage from the early grove — primal energy meets Wojak culture. Papa Tang is the founder energy, the king of the grove himself, inspired by Tales of the Grove and WMC creator lore.
          </p>
        </div>

        <div
          className="p-3 rounded-lg"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <h4
            className="text-sm font-bold mb-2"
            style={{ color: 'var(--color-brand-primary)' }}
          >
            Named Combos
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            The artist crafted these matching sets with intention. Ronin Helmet pairs with Ronin clothes and Ronin Dojo background. Wizard Hat matches Wizard Drip and Wizard Glasses. These aren't random — they're designed to work together as complete transformations.
          </p>
        </div>
      </div>
    </div>
  );
}

function TopAttributesContent({ attributes }: { attributes: AttributeStats[] }) {
  // Only include attributes with actual sales, sorted by average price
  const topTen = attributes
    .filter(a => a.totalSales > 0 && a.avgPrice > 0)
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 10);

  if (topTen.length === 0) {
    return (
      <div className="pt-4 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No trade data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Attributes with highest average sale prices
      </p>
      <div className="space-y-2">
        {topTen.map((attr, index) => (
          <div
            key={`${attr.category}-${attr.value}`}
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: index < 3 ? '#fbbf24' : 'var(--color-brand-primary)',
                  color: index < 3 ? '#1a1a1a' : 'white',
                }}
              >
                {index + 1}
              </span>
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {attr.value}
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {attr.category} • {attr.totalSales} sales
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {attr.avgPrice.toFixed(2)} XCH
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                avg price
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopSalesContent({ sales }: { sales: NFTSale[] }) {
  const formatDate = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (sales.length === 0) {
    return (
      <div className="pt-4 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          No sales data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="space-y-2">
        {sales.slice(0, 10).map((sale, index) => (
          <div
            key={`${sale.nft.id}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: index < 3 ? '#fbbf24' : 'var(--color-glass-hover)',
                color: index < 3 ? '#1a1a1a' : 'var(--color-text-secondary)',
              }}
            >
              {index + 1}
            </span>
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
              style={{ background: 'var(--color-glass-hover)' }}
            >
              <img
                src={sale.nft.imageUrl}
                alt={sale.nft.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {sale.nft.name}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {formatDate(sale.date)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p
                className="text-sm font-bold"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {sale.price.toFixed(1)} XCH
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                ${sale.priceUSD.toFixed(0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RarestFindsContent({ nfts }: { nfts: NFTBasic[] }) {
  if (nfts.length === 0) {
    return (
      <div className="pt-4 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading rarest NFTs...
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="grid grid-cols-5 gap-2">
        {nfts.slice(0, 10).map((nft, index) => (
          <div
            key={nft.id}
            className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
            style={{ background: 'var(--color-bg-tertiary)' }}
          >
            {/* Rank badge */}
            <div
              className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold z-10"
              style={{
                background: index < 3 ? '#fbbf24' : 'var(--color-glass-bg)',
                color: index < 3 ? '#1a1a1a' : 'var(--color-text-secondary)',
              }}
            >
              {index + 1}
            </div>
            {/* NFT Image */}
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              <span className="text-xs text-white font-medium">
                {nft.id.replace('WFP-', '#')}
              </span>
            </div>
          </div>
        ))}
      </div>
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

function SectionSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded"
            style={{ background: 'var(--color-border)' }}
          />
          <div
            className="h-4 w-40 rounded"
            style={{ background: 'var(--color-border)' }}
          />
        </div>
        <div
          className="w-5 h-5 rounded"
          style={{ background: 'var(--color-border)' }}
        />
      </div>
    </div>
  );
}

export function AskTab({
  stats,
  topAttributes,
  topSales,
  rarestFinds,
  isLoading = false,
}: AskTabProps) {
  const prefersReducedMotion = useReducedMotion();
  const [expandedSection, setExpandedSection] = useState<SectionId | null>(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const { data: xchPrice } = useXchPrice();

  // Use real XCH price for USD calculations
  const realXchPrice = xchPrice ?? 5.32;

  const handleToggle = useCallback((sectionId: SectionId) => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  // Loading skeleton
  if (isLoading || !stats) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <div
            className="h-4 w-40 rounded mb-3 animate-pulse"
            style={{ background: 'var(--color-border)' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        </div>
        <div
          className="h-px"
          style={{ background: 'var(--color-border)' }}
        />
        <div className="space-y-3">
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
          <SectionSkeleton />
        </div>
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
      {/* Collection Statistics - Collapsible like other sections */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <button
          className="w-full flex items-center justify-between p-4 text-left transition-colors"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          aria-expanded={isStatsExpanded}
          style={{
            background: isStatsExpanded ? 'var(--color-glass-hover)' : 'transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <BarChart3
              size={18}
              style={{ color: 'var(--color-brand-primary)' }}
            />
            <span
              className="font-medium text-sm"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Collection Statistics
            </span>
          </div>
          <motion.div
            variants={prefersReducedMotion ? undefined : accordionArrowVariants}
            animate={isStatsExpanded ? 'expanded' : 'collapsed'}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={18}
              style={{ color: 'var(--color-text-muted)' }}
            />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {isStatsExpanded && (
            <motion.div
              variants={prefersReducedMotion ? undefined : accordionVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={accordionTransition}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="p-4 pt-0"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <motion.div
                  className="grid grid-cols-5 gap-2 pt-4"
                  variants={prefersReducedMotion ? undefined : statsContainerVariants}
                  initial="initial"
                  animate="animate"
                >
                  <StatCard
                    label="Supply"
                    value={stats.totalSupply.toLocaleString()}
                  />
                  <StatCard
                    label="Trades"
                    value={stats.totalTrades.toLocaleString()}
                  />
                  <StatCard
                    label="Floor"
                    value={`${stats.floorPrice.toFixed(2)}`}
                    subValue="XCH"
                    usdValue={`$${(stats.floorPrice * realXchPrice).toFixed(2)}`}
                  />
                  <StatCard
                    label="Volume"
                    value={`${Math.floor(stats.totalVolume).toLocaleString()}`}
                    subValue="XCH"
                    usdValue={`$${Math.floor(stats.totalVolume * realXchPrice).toLocaleString()}`}
                  />
                  <StatCard
                    label="Market Cap"
                    value={`${Math.floor(stats.floorPrice * stats.totalSupply).toLocaleString()}`}
                    subValue="XCH"
                    usdValue={`$${Math.floor(stats.floorPrice * stats.totalSupply * realXchPrice).toLocaleString()}`}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        <ExpandableSection
          section={SECTIONS[0]}
          isExpanded={expandedSection === 'provenance'}
          onToggle={() => handleToggle('provenance')}
        >
          <ProvenanceContent />
        </ExpandableSection>

        <ExpandableSection
          section={SECTIONS[1]}
          isExpanded={expandedSection === 'attributes'}
          onToggle={() => handleToggle('attributes')}
        >
          <TopAttributesContent attributes={topAttributes} />
        </ExpandableSection>

        <ExpandableSection
          section={SECTIONS[2]}
          isExpanded={expandedSection === 'sales'}
          onToggle={() => handleToggle('sales')}
        >
          <TopSalesContent sales={topSales} />
        </ExpandableSection>

        <ExpandableSection
          section={SECTIONS[3]}
          isExpanded={expandedSection === 'rarest'}
          onToggle={() => handleToggle('rarest')}
        >
          <RarestFindsContent nfts={rarestFinds} />
        </ExpandableSection>
      </div>
    </motion.div>
  );
}

export default AskTab;
