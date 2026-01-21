/**
 * Currency & Rewards System Types
 *
 * Dual-currency economy with Oranges (soft) and Gems (hard currency).
 * Uses server-side state for bulletproof persistence.
 *
 * @see src/config/economy.ts for all economy constants
 */

export interface UserCurrency {
  oranges: number;
  gems: number;
  lifetimeOranges: number;
  lifetimeGems: number;
  giftedOranges?: number;
  gemsConvertedThisMonth?: number;
}

export interface CurrencyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  currency: 'oranges' | 'gems';
  amount: number;
  source: TransactionSource;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export type TransactionSource =
  // Earning sources
  | 'game_score'
  | 'daily_login'
  | 'login_streak'
  | 'achievement'
  | 'leaderboard_reward'
  | 'guild_reward'
  | 'event_reward'
  | 'referral'
  | 'admin_grant'
  // Spending sources
  | 'shop_purchase'
  | 'continue_game'
  | 'boost_purchase'
  | 'gift_sent';

// Reward configuration per game
export interface GameRewardConfig {
  gameId: string;
  baseOranges: number;
  scoreMultiplier: number;
  scoreThreshold: number;
  maxOrangesPerGame: number;
  bonusForHighScore: number;
  bonusForTop10: number;
}

// Daily login rewards
export interface DailyReward {
  day: number;
  oranges: number;
  gems: number;
  bonusItem?: string;
}

// Re-export from economy config for backwards compatibility
import { DAILY_LOGIN_REWARDS as ECONOMY_DAILY_REWARDS } from '../config/economy';

export const DAILY_REWARDS: DailyReward[] = ECONOMY_DAILY_REWARDS.map((r) => ({
  day: r.day,
  oranges: r.oranges,
  gems: r.gems,
}));

// Game reward configurations - generated from economy config tier system
import { GAME_TIER_MAP, GAME_TIERS, GAME_MIN_SCORES } from '../config/economy';

// Build GAME_REWARDS from tier-based config
export const GAME_REWARDS: Record<string, GameRewardConfig> = Object.entries(GAME_TIER_MAP).reduce(
  (acc, [gameId, tier]) => {
    const tierConfig = GAME_TIERS[tier];
    acc[gameId] = {
      gameId,
      baseOranges: tierConfig.baseReward,
      scoreMultiplier: 0, // Not used in new system - rewards are fixed per tier
      scoreThreshold: GAME_MIN_SCORES[gameId] || 1,
      maxOrangesPerGame: tierConfig.baseReward + tierConfig.highScoreBonus + tierConfig.top10Bonus,
      bonusForHighScore: tierConfig.highScoreBonus,
      bonusForTop10: tierConfig.top10Bonus,
    };
    return acc;
  },
  {} as Record<string, GameRewardConfig>
);

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward: {
    oranges: number;
    gems: number;
    title?: string;
    badge?: string;
  };
  isSecret?: boolean;
}

export type AchievementCategory =
  | 'gameplay'
  | 'collection'
  | 'social'
  | 'milestone'
  | 'seasonal';

export interface AchievementRequirement {
  type: 'score' | 'games_played' | 'streak' | 'collection' | 'special';
  gameId?: string;
  target: number;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  completedAt?: Date;
  claimedAt?: Date;
}

// Shop items
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: {
    oranges?: number;
    gems?: number;
  };
  preview: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited?: boolean;
  availableUntil?: Date;
}

export type ShopCategory =
  | 'avatar_frame'
  | 'avatar_accessory'
  | 'game_theme'
  | 'celebration_effect'
  | 'badge'
  | 'title'
  | 'consumable';

// Earn result from games
export interface EarnResult {
  success: boolean;
  orangesEarned: number;
  gemsEarned: number;
  breakdown: {
    base: number;
    scoreBonus: number;
    highScoreBonus: number;
    leaderboardBonus: number;
  };
  newAchievements?: Achievement[];
}

// Daily reward claim result
export interface DailyRewardResult {
  success: boolean;
  reward: {
    oranges: number;
    gems: number;
    bonusItem?: string;
  };
  currentStreak: number;
  nextRewardIn: number;
}

// Daily reward status
export interface DailyRewardStatus {
  canClaim: boolean;
  currentStreak: number;
  nextReward: DailyReward;
  timeUntilReset: number;
}

// Purchase result
export interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: UserCurrency;
}

// Continue cost - from economy config
import { SHOP_PRICES } from '../config/economy';
export const CONTINUE_COST = SHOP_PRICES.continueGame;
