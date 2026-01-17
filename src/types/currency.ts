/**
 * Currency & Rewards System Types
 *
 * Dual-currency economy with Oranges (soft) and Gems (hard currency).
 */

export interface UserCurrency {
  oranges: number;
  gems: number;
  lifetimeOranges: number;
  lifetimeGems: number;
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

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, oranges: 100, gems: 0 },
  { day: 2, oranges: 150, gems: 0 },
  { day: 3, oranges: 200, gems: 0 },
  { day: 4, oranges: 250, gems: 1 },
  { day: 5, oranges: 300, gems: 0 },
  { day: 6, oranges: 400, gems: 2 },
  { day: 7, oranges: 500, gems: 5, bonusItem: 'mystery_box' },
];

// Game reward configurations for all games
export const GAME_REWARDS: Record<string, GameRewardConfig> = {
  'orange-stack': {
    gameId: 'orange-stack',
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 100,
    maxOrangesPerGame: 500,
    bonusForHighScore: 50,
    bonusForTop10: 100,
  },
  'memory-match': {
    gameId: 'memory-match',
    baseOranges: 15,
    scoreMultiplier: 2,
    scoreThreshold: 50,
    maxOrangesPerGame: 300,
    bonusForHighScore: 40,
    bonusForTop10: 80,
  },
  'orange-pong': {
    gameId: 'orange-pong',
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 1,
    maxOrangesPerGame: 200,
    bonusForHighScore: 30,
    bonusForTop10: 60,
  },
  'wojak-runner': {
    gameId: 'wojak-runner',
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 50,
    maxOrangesPerGame: 400,
    bonusForHighScore: 45,
    bonusForTop10: 90,
  },
  'orange-juggle': {
    gameId: 'orange-juggle',
    baseOranges: 10,
    scoreMultiplier: 2,
    scoreThreshold: 10,
    maxOrangesPerGame: 350,
    bonusForHighScore: 35,
    bonusForTop10: 70,
  },
  'knife-game': {
    gameId: 'knife-game',
    baseOranges: 15,
    scoreMultiplier: 3,
    scoreThreshold: 5,
    maxOrangesPerGame: 400,
    bonusForHighScore: 50,
    bonusForTop10: 100,
  },
  'color-reaction': {
    gameId: 'color-reaction',
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 100,
    maxOrangesPerGame: 250,
    bonusForHighScore: 25,
    bonusForTop10: 50,
  },
  'orange-2048': {
    gameId: 'orange-2048',
    baseOranges: 20,
    scoreMultiplier: 1,
    scoreThreshold: 500,
    maxOrangesPerGame: 600,
    bonusForHighScore: 60,
    bonusForTop10: 120,
  },
};

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

// Continue cost
export const CONTINUE_COST = 50;
