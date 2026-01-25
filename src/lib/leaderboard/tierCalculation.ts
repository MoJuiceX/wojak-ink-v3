/**
 * Tier Calculation System
 * 
 * 5-tier badge system based on percentile ranking.
 * Tiers reset weekly along with the weekly leaderboard.
 */

export type TierName = 'diamond' | 'gold' | 'silver' | 'bronze' | 'rookie';

export interface TierInfo {
  name: TierName;
  emoji: string;
  label: string;
  color: string;
  glowColor: string;
  minPercentile: number; // Top X%
}

export const TIERS: Record<TierName, TierInfo> = {
  diamond: {
    name: 'diamond',
    emoji: '💎',
    label: 'Diamond',
    color: '#60A5FA', // blue-400
    glowColor: 'rgba(96, 165, 250, 0.5)',
    minPercentile: 5,
  },
  gold: {
    name: 'gold',
    emoji: '🥇',
    label: 'Gold',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    minPercentile: 20,
  },
  silver: {
    name: 'silver',
    emoji: '🥈',
    label: 'Silver',
    color: '#C0C0C0',
    glowColor: 'rgba(192, 192, 192, 0.5)',
    minPercentile: 40,
  },
  bronze: {
    name: 'bronze',
    emoji: '🥉',
    label: 'Bronze',
    color: '#CD7F32',
    glowColor: 'rgba(205, 127, 50, 0.5)',
    minPercentile: 70,
  },
  rookie: {
    name: 'rookie',
    emoji: '🎮',
    label: 'Rookie',
    color: '#9CA3AF', // gray-400
    glowColor: 'rgba(156, 163, 175, 0.3)',
    minPercentile: 100,
  },
};

/**
 * Calculate user's tier based on their rank and total players
 */
export function calculateTier(rank: number, totalPlayers: number): TierInfo {
  if (totalPlayers === 0) {
    return TIERS.rookie;
  }

  const percentile = (rank / totalPlayers) * 100;

  if (percentile <= TIERS.diamond.minPercentile) {
    return TIERS.diamond;
  }
  if (percentile <= TIERS.gold.minPercentile) {
    return TIERS.gold;
  }
  if (percentile <= TIERS.silver.minPercentile) {
    return TIERS.silver;
  }
  if (percentile <= TIERS.bronze.minPercentile) {
    return TIERS.bronze;
  }
  return TIERS.rookie;
}

/**
 * Get tier by name
 */
export function getTierByName(name: TierName): TierInfo {
  return TIERS[name];
}

/**
 * Get all tiers in order (highest to lowest)
 */
export function getAllTiers(): TierInfo[] {
  return [TIERS.diamond, TIERS.gold, TIERS.silver, TIERS.bronze, TIERS.rookie];
}

/**
 * Calculate tier for backend use (returns just the name)
 */
export function calculateTierName(rank: number, totalPlayers: number): TierName {
  return calculateTier(rank, totalPlayers).name;
}
