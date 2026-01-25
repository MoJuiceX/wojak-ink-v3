/**
 * Tier Badge Component
 * 
 * Displays the user's tier badge with appropriate styling.
 * 5 tiers: Diamond, Gold, Silver, Bronze, Rookie
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TIERS, getTierByName, type TierName } from '@/lib/leaderboard/tierCalculation';
import './TierBadge.css';

interface TierBadgeProps {
  tier: TierName;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animate?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'medium',
  showLabel = false,
  animate = true,
}) => {
  const tierInfo = getTierByName(tier);

  const badgeContent = (
    <div
      className={`tier-badge tier-${tier} tier-${size}`}
      style={{
        '--tier-color': tierInfo.color,
        '--tier-glow': tierInfo.glowColor,
      } as React.CSSProperties}
    >
      <span className="tier-emoji">{tierInfo.emoji}</span>
      {showLabel && <span className="tier-label">{tierInfo.label}</span>}
    </div>
  );

  if (animate && tier === 'diamond') {
    return (
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
};

/**
 * Tier Legend Component
 * Shows all tiers with their requirements
 */
export const TierLegend: React.FC = () => {
  const tiers = [
    { ...TIERS.diamond, description: 'Top 5%' },
    { ...TIERS.gold, description: 'Top 20%' },
    { ...TIERS.silver, description: 'Top 40%' },
    { ...TIERS.bronze, description: 'Top 70%' },
    { ...TIERS.rookie, description: 'Everyone' },
  ];

  return (
    <div className="tier-legend">
      <h4 className="tier-legend-title">Weekly Tiers</h4>
      <div className="tier-legend-list">
        {tiers.map((tier) => (
          <div key={tier.name} className="tier-legend-item">
            <span className="tier-legend-emoji">{tier.emoji}</span>
            <span className="tier-legend-name">{tier.label}</span>
            <span className="tier-legend-req">{tier.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TierBadge;
