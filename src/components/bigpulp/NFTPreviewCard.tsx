/**
 * NFTPreviewCard Component
 *
 * Large NFT preview with analysis overlay and rarity progress bar.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import type { NFTAnalysis, RarityTier } from '@/types/bigpulp';
import {
  previewCardVariants,
  rarityProgressVariants,
} from '@/config/bigpulpAnimations';

interface NFTPreviewCardProps {
  analysis: NFTAnalysis | null;
  isLoading: boolean;
}

// Tier color mapping
const TIER_COLORS: Record<RarityTier, string> = {
  legendary: '#fbbf24', // Gold
  epic: '#a855f7', // Purple
  rare: '#3b82f6', // Blue
  uncommon: '#22c55e', // Green
  common: 'var(--color-text-muted)',
};

const TIER_GRADIENTS: Record<RarityTier, string> = {
  legendary:
    'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
  epic: 'linear-gradient(90deg, #a855f7, #7c3aed, #a855f7)',
  rare: 'linear-gradient(90deg, #3b82f6, #2563eb, #3b82f6)',
  uncommon: 'linear-gradient(90deg, #22c55e, #16a34a, #22c55e)',
  common:
    'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-glow))',
};

function RarityProgressBar({
  rank,
  total,
  tier,
}: {
  rank: number;
  total: number;
  tier: RarityTier;
}) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = ((total - rank) / total) * 100;
  const percentileText = `Top ${((rank / total) * 100).toFixed(1)}%`;

  return (
    <div className="space-y-1">
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--color-bg-tertiary)' }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: TIER_GRADIENTS[tier],
            transformOrigin: 'left',
          }}
          variants={prefersReducedMotion ? undefined : rarityProgressVariants}
          initial="initial"
          animate="animate"
          custom={percentage}
          layout
        >
          <motion.div
            style={{ width: `${percentage}%`, height: '100%' }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
            }
          />
        </motion.div>
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: TIER_COLORS[tier] }}>{percentileText}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      </div>
    </div>
  );
}

function BadgePill({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
      style={{
        background: `${color}20`,
        border: `1px solid ${color}50`,
        color: color,
      }}
    >
      <Icon size={12} />
      <span>{label}</span>
    </div>
  );
}

export function NFTPreviewCard({ analysis, isLoading }: NFTPreviewCardProps) {
  const prefersReducedMotion = useReducedMotion();

  // Empty state
  if (!analysis && !isLoading) {
    return (
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'var(--color-glass-bg)',
          border: '2px dashed var(--color-border)',
        }}
      >
        <div
          className="w-24 h-24 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--color-bg-tertiary)' }}
        >
          <Sparkles
            size={32}
            style={{ color: 'var(--color-text-muted)' }}
            className={prefersReducedMotion ? '' : 'animate-pulse'}
          />
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Search for an NFT to analyze
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Enter an ID or try Surprise!
        </p>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="animate-pulse"
          style={{ background: 'var(--color-bg-tertiary)', aspectRatio: '1 / 0.6' }}
        />
        <div className="p-4 space-y-3">
          <div
            className="h-6 w-48 rounded animate-pulse"
            style={{ background: 'var(--color-glass-hover)' }}
          />
          <div
            className="h-4 w-32 rounded animate-pulse"
            style={{ background: 'var(--color-glass-hover)' }}
          />
          <div
            className="h-2 w-full rounded animate-pulse"
            style={{ background: 'var(--color-glass-hover)' }}
          />
        </div>
      </div>
    );
  }

  const { nft, rarity, badges } = analysis!;

  // Get top 3 badges for display on image
  const displayBadges = badges.slice(0, 3);
  const hasMoreBadges = badges.length > 3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nft.id}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-glass-bg)',
          border: `2px solid ${TIER_COLORS[rarity.tier]}40`,
        }}
        variants={prefersReducedMotion ? undefined : previewCardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Image with badges - reduced size */}
        <div className="relative" style={{ aspectRatio: '1 / 0.6' }}>
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />

          {/* Badges overlay */}
          {displayBadges.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
              {displayBadges.map((badge) => {
                const Icon =
                  badge.type === 'crown-holder'
                    ? Trophy
                    : badge.type === 'special-edition'
                      ? Star
                      : Sparkles;
                return (
                  <BadgePill
                    key={badge.id}
                    icon={Icon}
                    label={badge.label}
                    color={badge.color}
                  />
                );
              })}
              {hasMoreBadges && (
                <div
                  className="px-2 py-1 rounded-full text-xs backdrop-blur-sm"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                  }}
                >
                  +{badges.length - 3} more
                </div>
              )}
            </div>
          )}

          {/* Legendary shimmer effect */}
          {rarity.tier === 'legendary' && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(45deg, transparent 30%, rgba(251, 191, 36, 0.1) 50%, transparent 70%)',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {nft.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Rank #{rarity.rank.toLocaleString()} of{' '}
              {rarity.totalSupply.toLocaleString()}
            </p>
          </div>

          {/* Rarity progress bar */}
          <RarityProgressBar
            rank={rarity.rank}
            total={rarity.totalSupply}
            tier={rarity.tier}
          />

          {/* Type position */}
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            #{rarity.typeRank} of {rarity.typeTotal}{' '}
            {nft.characterType.charAt(0).toUpperCase() +
              nft.characterType.slice(1)}
            s
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NFTPreviewCard;
