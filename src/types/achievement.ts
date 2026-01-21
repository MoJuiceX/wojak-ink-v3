/**
 * Achievement Type Definitions
 */

export type AchievementCategory = 'gameplay' | 'collection' | 'social' | 'milestone';

export interface AchievementRequirement {
  type:
    | 'games_played'
    | 'high_score'
    | 'all_games_played'
    | 'leaderboard_rank'
    | 'items_owned'
    | 'nft_avatar'
    | 'friends_count'
    | 'profile_complete'
    | 'streak'
    | 'lifetime_oranges';
  target: number;
  gameId?: string; // For game-specific achievements
}

export interface AchievementReward {
  oranges: number;
  gems: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward: AchievementReward;
  isSecret?: boolean; // Hidden until unlocked
}

export interface UserAchievementProgress {
  achievementId: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  claimed: boolean;
  claimedAt?: string;
}

// Calculated stats used for achievement checking
export interface AchievementStats {
  totalGamesPlayed: number;
  highestScore: number;
  gamesPlayedByType: Record<string, number>;
  activeGameCount: number;
  bestLeaderboardRank: number | null;
  itemsOwned: number;
  hasNftAvatar: boolean;
  friendsCount: number;
  hasCustomName: boolean;
  hasCustomAvatar: boolean;
  currentStreak: number;
  longestStreak: number;
  lifetimeOranges: number;
}
