/**
 * AskTab Component
 *
 * Collection stats and expandable info sections.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, BookOpen, Gem, Trophy, Sparkles } from 'lucide-react';
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
      <p
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <strong style={{ color: 'var(--color-text-primary)' }}>Provenance</strong> refers to the
        history, origin, and attributes that give an NFT its value beyond basic rarity.
      </p>
      <div className="space-y-2">
        <h4
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Key factors that affect provenance:
        </h4>
        <ul
          className="text-sm space-y-1 pl-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <li>• Rare trait combinations ("combos")</li>
          <li>• Community-recognized special editions</li>
          <li>• Historical significance (early mints, famous holders)</li>
          <li>• Trait synergies that boost visual appeal</li>
          <li>• Cultural relevance within the community</li>
        </ul>
      </div>
    </div>
  );
}

function TopAttributesContent({ attributes }: { attributes: AttributeStats[] }) {
  const topTen = attributes
    .sort((a, b) => b.avgPrice - a.avgPrice)
    .slice(0, 10);

  return (
    <div className="pt-4">
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
                  background: 'var(--color-brand-primary)',
                  color: 'white',
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
                  {attr.category} • {attr.rarity.toFixed(1)}% rarity
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
              className="w-10 h-10 rounded-lg flex-shrink-0"
              style={{ background: 'var(--color-glass-hover)' }}
            >
              {/* NFT thumbnail placeholder */}
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
            {/* Image placeholder */}
            <div
              className="w-full h-full flex items-center justify-center text-2xl"
              style={{ background: 'var(--color-glass-hover)' }}
            >
              🖼️
            </div>
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
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);

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
      {/* Collection Statistics - Collapsible */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <button
          className="w-full flex items-center justify-between p-3 text-left transition-colors"
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          aria-expanded={isStatsExpanded}
          style={{
            background: isStatsExpanded ? 'var(--color-glass-hover)' : 'transparent',
          }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Collection Statistics
          </span>
          <span
            className="text-xs px-2 py-1 rounded-md transition-colors"
            style={{
              background: isStatsExpanded ? 'var(--color-brand-primary)' : 'var(--color-glass-bg)',
              color: isStatsExpanded ? 'white' : 'var(--color-text-muted)',
              border: `1px solid ${isStatsExpanded ? 'var(--color-brand-primary)' : 'var(--color-border)'}`,
            }}
          >
            {isStatsExpanded ? 'Hide' : 'Learn'}
          </span>
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
              <div className="p-3 pt-0">
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
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
                  />
                  <StatCard
                    label="Volume"
                    value={`${Math.floor(stats.totalVolume).toLocaleString()}`}
                    subValue="XCH"
                  />
                  <StatCard
                    label="Market Cap"
                    value={`$${(stats.marketCapUSD / 1000).toFixed(0)}K`}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'var(--color-border)' }} />

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
