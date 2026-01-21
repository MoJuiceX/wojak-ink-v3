# SPEC 05: Achievement System MVP

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Create a basic achievement system that rewards players for reaching milestones. Start with 19 achievements across different categories.

---

## Achievement Categories

1. **Gameplay** - Score and game-related achievements
2. **Collection** - Shop and inventory achievements
3. **Social** - Friends and community achievements
4. **Milestone** - Overall progress achievements

---

## Starter Achievements (19 Total)

### Gameplay (8)

| ID | Name | Icon | Description | Requirement | Reward |
|----|------|------|-------------|-------------|--------|
| `first-game` | First Steps | 🎮 | Complete your first game | 1 game played | 50 🍊 |
| `score-1000` | Getting Started | 📈 | Score 1,000 points in any game | Score ≥ 1000 | 100 🍊 |
| `score-10000` | High Scorer | 🔥 | Score 10,000 points in any game | Score ≥ 10000 | 250 🍊, 5 💎 |
| `games-10` | Casual Gamer | 🕹️ | Play 10 games | Total games ≥ 10 | 100 🍊 |
| `games-100` | Dedicated Player | 🎯 | Play 100 games | Total games ≥ 100 | 500 🍊, 10 💎 |
| `games-500` | Gaming Legend | 👑 | Play 500 games | Total games ≥ 500 | 1000 🍊, 25 💎 |
| `all-games` | Explorer | 🗺️ | Play every active game at least once | All games played | 300 🍊, 10 💎 |
| `top-10` | Leaderboard Star | ⭐ | Reach top 10 on any leaderboard | Rank ≤ 10 | 500 🍊, 15 💎 |

### Collection (4)

| ID | Name | Icon | Description | Requirement | Reward |
|----|------|------|-------------|-------------|--------|
| `first-purchase` | Shopper | 🛒 | Buy your first item from the shop | 1 item purchased | 50 🍊 |
| `collect-5` | Collector | 📦 | Own 5 shop items | 5 items owned | 150 🍊 |
| `collect-20` | Hoarder | 🏠 | Own 20 shop items | 20 items owned | 500 🍊, 10 💎 |
| `nft-avatar` | NFT Flex | 🖼️ | Set an NFT as your avatar | NFT avatar equipped | 200 🍊, 5 💎 |

### Social (3)

| ID | Name | Icon | Description | Requirement | Reward |
|----|------|------|-------------|-------------|--------|
| `first-friend` | Friendly | 👋 | Add your first friend | 1 friend added | 50 🍊 |
| `friends-5` | Social Butterfly | 🦋 | Have 5 friends | 5 friends | 200 🍊 |
| `profile-complete` | Identity | 🎭 | Set a custom display name and avatar | Name + non-default avatar | 100 🍊 |

### Milestone (4)

| ID | Name | Icon | Description | Requirement | Reward |
|----|------|------|-------------|-------------|--------|
| `streak-7` | Week Warrior | 🔥 | Achieve a 7-day play streak | Streak ≥ 7 | 300 🍊, 5 💎 |
| `streak-30` | Monthly Master | 💪 | Achieve a 30-day play streak | Streak ≥ 30 | 1000 🍊, 25 💎 |
| `earn-10k` | Orange Farmer | 🍊 | Earn 10,000 lifetime oranges | Lifetime 🍊 ≥ 10000 | 500 🍊, 10 💎 |
| `earn-100k` | Orange Tycoon | 🏆 | Earn 100,000 lifetime oranges | Lifetime 🍊 ≥ 100000 | 2000 🍊, 50 💎 |

---

## Files to Create

### 1. Achievement Types
**File: `src/types/achievement.ts`**

```typescript
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
```

---

### 2. Achievement Definitions
**File: `src/config/achievements.ts`**

```typescript
/**
 * Achievement Definitions
 *
 * All 19 starter achievements.
 */

import type { Achievement } from '@/types/achievement';

export const ACHIEVEMENTS: Achievement[] = [
  // ============ GAMEPLAY (8) ============
  {
    id: 'first-game',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    category: 'gameplay',
    requirement: { type: 'games_played', target: 1 },
    reward: { oranges: 50, gems: 0 },
  },
  {
    id: 'score-1000',
    name: 'Getting Started',
    description: 'Score 1,000 points in any game',
    icon: '📈',
    category: 'gameplay',
    requirement: { type: 'high_score', target: 1000 },
    reward: { oranges: 100, gems: 0 },
  },
  {
    id: 'score-10000',
    name: 'High Scorer',
    description: 'Score 10,000 points in any game',
    icon: '🔥',
    category: 'gameplay',
    requirement: { type: 'high_score', target: 10000 },
    reward: { oranges: 250, gems: 5 },
  },
  {
    id: 'games-10',
    name: 'Casual Gamer',
    description: 'Play 10 games',
    icon: '🕹️',
    category: 'gameplay',
    requirement: { type: 'games_played', target: 10 },
    reward: { oranges: 100, gems: 0 },
  },
  {
    id: 'games-100',
    name: 'Dedicated Player',
    description: 'Play 100 games',
    icon: '🎯',
    category: 'gameplay',
    requirement: { type: 'games_played', target: 100 },
    reward: { oranges: 500, gems: 10 },
  },
  {
    id: 'games-500',
    name: 'Gaming Legend',
    description: 'Play 500 games',
    icon: '👑',
    category: 'gameplay',
    requirement: { type: 'games_played', target: 500 },
    reward: { oranges: 1000, gems: 25 },
  },
  {
    id: 'all-games',
    name: 'Explorer',
    description: 'Play every active game at least once',
    icon: '🗺️',
    category: 'gameplay',
    requirement: { type: 'all_games_played', target: 1 },
    reward: { oranges: 300, gems: 10 },
  },
  {
    id: 'top-10',
    name: 'Leaderboard Star',
    description: 'Reach top 10 on any leaderboard',
    icon: '⭐',
    category: 'gameplay',
    requirement: { type: 'leaderboard_rank', target: 10 },
    reward: { oranges: 500, gems: 15 },
  },

  // ============ COLLECTION (4) ============
  {
    id: 'first-purchase',
    name: 'Shopper',
    description: 'Buy your first item from the shop',
    icon: '🛒',
    category: 'collection',
    requirement: { type: 'items_owned', target: 1 },
    reward: { oranges: 50, gems: 0 },
  },
  {
    id: 'collect-5',
    name: 'Collector',
    description: 'Own 5 shop items',
    icon: '📦',
    category: 'collection',
    requirement: { type: 'items_owned', target: 5 },
    reward: { oranges: 150, gems: 0 },
  },
  {
    id: 'collect-20',
    name: 'Hoarder',
    description: 'Own 20 shop items',
    icon: '🏠',
    category: 'collection',
    requirement: { type: 'items_owned', target: 20 },
    reward: { oranges: 500, gems: 10 },
  },
  {
    id: 'nft-avatar',
    name: 'NFT Flex',
    description: 'Set an NFT as your avatar',
    icon: '🖼️',
    category: 'collection',
    requirement: { type: 'nft_avatar', target: 1 },
    reward: { oranges: 200, gems: 5 },
  },

  // ============ SOCIAL (3) ============
  {
    id: 'first-friend',
    name: 'Friendly',
    description: 'Add your first friend',
    icon: '👋',
    category: 'social',
    requirement: { type: 'friends_count', target: 1 },
    reward: { oranges: 50, gems: 0 },
  },
  {
    id: 'friends-5',
    name: 'Social Butterfly',
    description: 'Have 5 friends',
    icon: '🦋',
    category: 'social',
    requirement: { type: 'friends_count', target: 5 },
    reward: { oranges: 200, gems: 0 },
  },
  {
    id: 'profile-complete',
    name: 'Identity',
    description: 'Set a custom display name and avatar',
    icon: '🎭',
    category: 'social',
    requirement: { type: 'profile_complete', target: 1 },
    reward: { oranges: 100, gems: 0 },
  },

  // ============ MILESTONE (4) ============
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Achieve a 7-day play streak',
    icon: '🔥',
    category: 'milestone',
    requirement: { type: 'streak', target: 7 },
    reward: { oranges: 300, gems: 5 },
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Achieve a 30-day play streak',
    icon: '💪',
    category: 'milestone',
    requirement: { type: 'streak', target: 30 },
    reward: { oranges: 1000, gems: 25 },
  },
  {
    id: 'earn-10k',
    name: 'Orange Farmer',
    description: 'Earn 10,000 lifetime oranges',
    icon: '🍊',
    category: 'milestone',
    requirement: { type: 'lifetime_oranges', target: 10000 },
    reward: { oranges: 500, gems: 10 },
  },
  {
    id: 'earn-100k',
    name: 'Orange Tycoon',
    description: 'Earn 100,000 lifetime oranges',
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'lifetime_oranges', target: 100000 },
    reward: { oranges: 2000, gems: 50 },
  },
];

// Helper to get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}
```

---

### 3. Achievements Context
**File: `src/contexts/AchievementsContext.tsx`**

```typescript
/**
 * AchievementsContext
 *
 * Tracks achievement progress and handles unlocking/claiming.
 */

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useUserProfile } from './UserProfileContext';
import { useCurrency } from './CurrencyContext';
import { useFriends } from './FriendsContext';
import { ACHIEVEMENTS, getAchievementById } from '@/config/achievements';
import { MINI_GAMES } from '@/config/games';
import type {
  Achievement,
  AchievementCategory,
  UserAchievementProgress,
  AchievementStats,
} from '@/types/achievement';

const PROGRESS_STORAGE_KEY = 'wojak_achievement_progress';
const STATS_STORAGE_KEY = 'wojak_achievement_stats';

interface AchievementsContextType {
  achievements: Achievement[];
  progress: UserAchievementProgress[];
  stats: AchievementStats;

  // Methods
  checkAchievements: () => void;
  claimAchievement: (achievementId: string) => Promise<boolean>;
  getProgress: (achievementId: string) => UserAchievementProgress | null;

  // Computed
  unclaimedCount: number;
  completedCount: number;

  // For recording stats
  recordGamePlayed: (gameId: string, score: number) => void;
  recordLeaderboardRank: (rank: number) => void;
}

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { profile, isSignedIn } = useUserProfile();
  const { lifetimeOranges, ownedItems, earnCurrency } = useCurrency();
  const { friends } = useFriends();

  const [progress, setProgress] = useState<UserAchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    totalGamesPlayed: 0,
    highestScore: 0,
    gamesPlayedByType: {},
    activeGameCount: 0,
    bestLeaderboardRank: null,
    itemsOwned: 0,
    hasNftAvatar: false,
    friendsCount: 0,
    hasCustomName: false,
    hasCustomAvatar: false,
    currentStreak: 0,
    longestStreak: 0,
    lifetimeOranges: 0,
  });

  const [pendingUnlocks, setPendingUnlocks] = useState<string[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    if (!isSignedIn) {
      setProgress([]);
      return;
    }

    const storedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch (e) {
        console.error('[Achievements] Failed to load progress:', e);
      }
    }

    const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (storedStats) {
      try {
        setStats(prev => ({ ...prev, ...JSON.parse(storedStats) }));
      } catch (e) {
        console.error('[Achievements] Failed to load stats:', e);
      }
    }
  }, [isSignedIn]);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: UserAchievementProgress[]) => {
    setProgress(newProgress);
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: AchievementStats) => {
    setStats(newStats);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  // Update stats from external sources
  useEffect(() => {
    const activeGames = MINI_GAMES.filter(g => g.status === 'available' && !g.disabled);

    setStats(prev => ({
      ...prev,
      activeGameCount: activeGames.length,
      itemsOwned: ownedItems.length,
      hasNftAvatar: profile?.avatar?.type === 'nft',
      friendsCount: friends.length,
      hasCustomName: !!profile?.displayName,
      hasCustomAvatar: profile?.avatar?.source === 'user' || profile?.avatar?.source === 'wallet',
      currentStreak: profile?.currentStreak || 0,
      longestStreak: profile?.longestStreak || 0,
      lifetimeOranges: lifetimeOranges,
    }));
  }, [profile, ownedItems, friends, lifetimeOranges]);

  // Record game played
  const recordGamePlayed = useCallback((gameId: string, score: number) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
        highestScore: Math.max(prev.highestScore, score),
        gamesPlayedByType: {
          ...prev.gamesPlayedByType,
          [gameId]: (prev.gamesPlayedByType[gameId] || 0) + 1,
        },
      };
      saveStats(newStats);
      return newStats;
    });
  }, [saveStats]);

  // Record leaderboard rank
  const recordLeaderboardRank = useCallback((rank: number) => {
    setStats(prev => {
      if (prev.bestLeaderboardRank === null || rank < prev.bestLeaderboardRank) {
        const newStats = { ...prev, bestLeaderboardRank: rank };
        saveStats(newStats);
        return newStats;
      }
      return prev;
    });
  }, [saveStats]);

  // Check if requirement is met
  const checkRequirement = useCallback((achievement: Achievement): { met: boolean; progress: number } => {
    const { requirement } = achievement;

    switch (requirement.type) {
      case 'games_played':
        return {
          met: stats.totalGamesPlayed >= requirement.target,
          progress: stats.totalGamesPlayed,
        };

      case 'high_score':
        return {
          met: stats.highestScore >= requirement.target,
          progress: stats.highestScore,
        };

      case 'all_games_played':
        const uniqueGamesPlayed = Object.keys(stats.gamesPlayedByType).length;
        return {
          met: uniqueGamesPlayed >= stats.activeGameCount,
          progress: uniqueGamesPlayed,
        };

      case 'leaderboard_rank':
        return {
          met: stats.bestLeaderboardRank !== null && stats.bestLeaderboardRank <= requirement.target,
          progress: stats.bestLeaderboardRank || 0,
        };

      case 'items_owned':
        return {
          met: stats.itemsOwned >= requirement.target,
          progress: stats.itemsOwned,
        };

      case 'nft_avatar':
        return {
          met: stats.hasNftAvatar,
          progress: stats.hasNftAvatar ? 1 : 0,
        };

      case 'friends_count':
        return {
          met: stats.friendsCount >= requirement.target,
          progress: stats.friendsCount,
        };

      case 'profile_complete':
        const profileComplete = stats.hasCustomName && stats.hasCustomAvatar;
        return {
          met: profileComplete,
          progress: profileComplete ? 1 : 0,
        };

      case 'streak':
        const bestStreak = Math.max(stats.currentStreak, stats.longestStreak);
        return {
          met: bestStreak >= requirement.target,
          progress: bestStreak,
        };

      case 'lifetime_oranges':
        return {
          met: stats.lifetimeOranges >= requirement.target,
          progress: stats.lifetimeOranges,
        };

      default:
        return { met: false, progress: 0 };
    }
  }, [stats]);

  // Check all achievements
  const checkAchievements = useCallback(() => {
    const newProgress: UserAchievementProgress[] = [...progress];
    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      const existing = newProgress.find(p => p.achievementId === achievement.id);
      const { met, progress: currentProgress } = checkRequirement(achievement);

      if (existing) {
        // Update progress
        existing.progress = currentProgress;
        existing.target = achievement.requirement.target;

        // Check if newly completed
        if (!existing.completed && met) {
          existing.completed = true;
          existing.completedAt = new Date().toISOString();
          newlyUnlocked.push(achievement.id);
        }
      } else {
        // Create new progress entry
        newProgress.push({
          achievementId: achievement.id,
          progress: currentProgress,
          target: achievement.requirement.target,
          completed: met,
          completedAt: met ? new Date().toISOString() : undefined,
          claimed: false,
        });

        if (met) {
          newlyUnlocked.push(achievement.id);
        }
      }
    }

    saveProgress(newProgress);

    if (newlyUnlocked.length > 0) {
      setPendingUnlocks(prev => [...prev, ...newlyUnlocked]);
    }
  }, [progress, checkRequirement, saveProgress]);

  // Claim achievement reward
  const claimAchievement = useCallback(async (achievementId: string): Promise<boolean> => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return false;

    const progressEntry = progress.find(p => p.achievementId === achievementId);
    if (!progressEntry?.completed || progressEntry.claimed) return false;

    // Award rewards
    const { oranges, gems } = achievement.reward;
    earnCurrency(oranges, gems, 'achievement');

    // Update progress
    const newProgress = progress.map(p =>
      p.achievementId === achievementId
        ? { ...p, claimed: true, claimedAt: new Date().toISOString() }
        : p
    );
    saveProgress(newProgress);

    return true;
  }, [progress, earnCurrency, saveProgress]);

  // Get progress for specific achievement
  const getProgress = useCallback((achievementId: string): UserAchievementProgress | null => {
    return progress.find(p => p.achievementId === achievementId) || null;
  }, [progress]);

  // Computed values
  const unclaimedCount = useMemo(() =>
    progress.filter(p => p.completed && !p.claimed).length
  , [progress]);

  const completedCount = useMemo(() =>
    progress.filter(p => p.completed).length
  , [progress]);

  return (
    <AchievementsContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        progress,
        stats,
        checkAchievements,
        claimAchievement,
        getProgress,
        unclaimedCount,
        completedCount,
        recordGamePlayed,
        recordLeaderboardRank,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementsProvider');
  }
  return context;
}
```

---

### 4. Achievement Unlock Popup
**File: `src/components/Achievements/AchievementUnlockPopup.tsx`**

```typescript
/**
 * AchievementUnlockPopup Component
 *
 * Animated popup when achievement is unlocked.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Achievement } from '@/types/achievement';
import './Achievements.css';

interface AchievementUnlockPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  onClaim: () => void;
}

export function AchievementUnlockPopup({
  achievement,
  onClose,
  onClaim,
}: AchievementUnlockPopupProps) {
  if (!achievement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="achievement-popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="achievement-popup"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="popup-close" onClick={onClose}>
            <X size={20} />
          </button>

          <motion.div
            className="popup-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {achievement.icon}
          </motion.div>

          <motion.h2
            className="popup-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Achievement Unlocked!
          </motion.h2>

          <motion.h3
            className="popup-name"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {achievement.name}
          </motion.h3>

          <motion.p
            className="popup-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {achievement.description}
          </motion.p>

          <motion.div
            className="popup-reward"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="reward-label">Reward:</span>
            <span className="reward-values">
              {achievement.reward.oranges > 0 && (
                <span className="reward-oranges">
                  🍊 {achievement.reward.oranges}
                </span>
              )}
              {achievement.reward.gems > 0 && (
                <span className="reward-gems">
                  💎 {achievement.reward.gems}
                </span>
              )}
            </span>
          </motion.div>

          <motion.button
            className="popup-claim-button"
            onClick={onClaim}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Claim Reward
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

### 5. Achievement Card Component
**File: `src/components/Achievements/AchievementCard.tsx`**

```typescript
/**
 * AchievementCard Component
 *
 * Displays single achievement with progress.
 */

import { Check, Lock } from 'lucide-react';
import type { Achievement, UserAchievementProgress } from '@/types/achievement';
import './Achievements.css';

interface AchievementCardProps {
  achievement: Achievement;
  progress: UserAchievementProgress | null;
  onClaim?: () => void;
}

export function AchievementCard({ achievement, progress, onClaim }: AchievementCardProps) {
  const isCompleted = progress?.completed || false;
  const isClaimed = progress?.claimed || false;
  const currentProgress = progress?.progress || 0;
  const target = achievement.requirement.target;

  // Calculate percentage (cap at 100%)
  const percentage = Math.min((currentProgress / target) * 100, 100);

  // For secret achievements that aren't unlocked
  if (achievement.isSecret && !isCompleted) {
    return (
      <div className="achievement-card secret">
        <div className="achievement-icon">
          <Lock size={24} />
        </div>
        <div className="achievement-info">
          <h3 className="achievement-name">???</h3>
          <p className="achievement-description">Secret achievement</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`achievement-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}>
      <div className="achievement-icon">
        {achievement.icon}
        {isCompleted && (
          <span className="completed-badge">
            <Check size={12} />
          </span>
        )}
      </div>

      <div className="achievement-info">
        <h3 className="achievement-name">{achievement.name}</h3>
        <p className="achievement-description">{achievement.description}</p>

        {!isCompleted && (
          <div className="achievement-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="progress-text">
              {currentProgress.toLocaleString()} / {target.toLocaleString()}
            </span>
          </div>
        )}

        {isCompleted && !isClaimed && (
          <div className="achievement-reward-preview">
            {achievement.reward.oranges > 0 && (
              <span className="reward-oranges">🍊 {achievement.reward.oranges}</span>
            )}
            {achievement.reward.gems > 0 && (
              <span className="reward-gems">💎 {achievement.reward.gems}</span>
            )}
          </div>
        )}
      </div>

      {isCompleted && !isClaimed && onClaim && (
        <button className="claim-button" onClick={onClaim}>
          Claim
        </button>
      )}

      {isClaimed && (
        <span className="claimed-label">Claimed</span>
      )}
    </div>
  );
}
```

---

### 6. Achievements Page
**File: `src/pages/Achievements.tsx`**

```typescript
/**
 * Achievements Page
 *
 * Display all achievements with progress.
 */

import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { useAchievements } from '@/contexts/AchievementsContext';
import { AchievementCard } from '@/components/Achievements/AchievementCard';
import { AchievementUnlockPopup } from '@/components/Achievements/AchievementUnlockPopup';
import { PageTransition } from '@/components/layout/PageTransition';
import { getAchievementById, getAchievementsByCategory } from '@/config/achievements';
import type { AchievementCategory, Achievement } from '@/types/achievement';
import '@/components/Achievements/Achievements.css';

type Tab = 'all' | AchievementCategory;

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gameplay', label: 'Gameplay' },
  { id: 'collection', label: 'Collection' },
  { id: 'social', label: 'Social' },
  { id: 'milestone', label: 'Milestones' },
];

export default function Achievements() {
  const { contentPadding, isDesktop } = useLayout();
  const {
    achievements,
    progress,
    getProgress,
    claimAchievement,
    checkAchievements,
    completedCount,
    unclaimedCount,
  } = useAchievements();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [unlockPopup, setUnlockPopup] = useState<Achievement | null>(null);

  // Check achievements on mount
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Filter achievements by tab
  const filteredAchievements = activeTab === 'all'
    ? achievements
    : getAchievementsByCategory(activeTab);

  // Handle claim
  const handleClaim = async (achievementId: string) => {
    const success = await claimAchievement(achievementId);
    if (success) {
      // Optionally show a toast or animation
    }
  };

  // Handle popup claim
  const handlePopupClaim = async () => {
    if (unlockPopup) {
      await claimAchievement(unlockPopup.id);
      setUnlockPopup(null);
    }
  };

  return (
    <PageTransition>
      <div
        style={{
          padding: contentPadding,
          maxWidth: isDesktop ? '700px' : undefined,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="achievements-header">
          <h1 className="page-title">
            <Award size={24} />
            Achievements
          </h1>
          <div className="achievements-stats">
            <span className="stat">
              {completedCount} / {achievements.length} completed
            </span>
            {unclaimedCount > 0 && (
              <span className="unclaimed-badge">
                {unclaimedCount} to claim
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="achievements-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={getProgress(achievement.id)}
              onClaim={() => handleClaim(achievement.id)}
            />
          ))}
        </div>

        {/* Unlock Popup */}
        <AchievementUnlockPopup
          achievement={unlockPopup}
          onClose={() => setUnlockPopup(null)}
          onClaim={handlePopupClaim}
        />
      </div>
    </PageTransition>
  );
}
```

---

### 7. Achievements Styles
**File: `src/components/Achievements/Achievements.css`**

```css
/* ============ Page Layout ============ */
.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.achievements-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.achievements-stats .stat {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.unclaimed-badge {
  background: var(--color-brand-primary);
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

/* ============ Tabs ============ */
.achievements-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 4px;
}

.achievements-tabs .tab-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.achievements-tabs .tab-button:hover {
  background: var(--color-bg-secondary);
}

.achievements-tabs .tab-button.active {
  background: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
  color: white;
}

/* ============ Achievement Grid ============ */
.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ============ Achievement Card ============ */
.achievement-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: all 0.2s;
}

.achievement-card.completed {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.achievement-card.claimed {
  opacity: 0.7;
}

.achievement-card.secret {
  opacity: 0.5;
}

.achievement-icon {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.completed-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-bg-secondary);
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 2px 0;
}

.achievement-description {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Progress bar */
.achievement-progress {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-brand-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.625rem;
  color: var(--color-text-tertiary);
  font-family: monospace;
  min-width: 60px;
  text-align: right;
}

/* Reward preview */
.achievement-reward-preview {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.reward-oranges,
.reward-gems {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Claim button */
.claim-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: var(--color-brand-primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-button:hover {
  opacity: 0.9;
}

.claimed-label {
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 500;
}

/* ============ Unlock Popup ============ */
.achievement-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.achievement-popup {
  position: relative;
  background: var(--color-bg-secondary);
  border-radius: 20px;
  padding: 2rem;
  max-width: 320px;
  width: 100%;
  text-align: center;
  border: 1px solid var(--color-border);
}

.popup-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.popup-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #22c55e;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.popup-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
}

.popup-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem 0;
}

.popup-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.reward-label {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.reward-values {
  display: flex;
  gap: 1rem;
}

.popup-reward .reward-oranges,
.popup-reward .reward-gems {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.popup-claim-button {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
```

---

### 8. Integration Points

**After Game Ends** - In game over flow:
```typescript
const { recordGamePlayed, recordLeaderboardRank, checkAchievements } = useAchievements();

// After saving score
recordGamePlayed(gameId, score);
if (rank) recordLeaderboardRank(rank);
checkAchievements();
```

**After Shop Purchase** - In Shop component:
```typescript
const { checkAchievements } = useAchievements();

// After successful purchase
checkAchievements();
```

**After Profile Update** - In account page:
```typescript
const { checkAchievements } = useAchievements();

// After updating name or avatar
checkAchievements();
```

**After Adding Friend** - In FriendsContext:
```typescript
// After addFriend succeeds
// Trigger achievement check (via event or direct call)
```

---

### 9. Add Routes and Navigation

**File: `src/App.tsx`**
```typescript
import Achievements from '@/pages/Achievements';

// In routes:
<Route path="/achievements" element={<Achievements />} />
```

**File: Navigation**
```typescript
{ icon: Award, label: 'Achievements', path: '/achievements', badge: unclaimedCount }
```

---

### 10. Add AchievementsProvider to App

**File: `src/main.tsx`** or **`src/App.tsx`**
```typescript
import { AchievementsProvider } from '@/contexts/AchievementsContext';

// In provider tree (after CurrencyProvider and FriendsProvider):
<AchievementsProvider>
  {/* ... app content */}
</AchievementsProvider>
```

---

## Testing Checklist

- [ ] All 19 achievements show on achievements page
- [ ] Achievements filtered by category tabs
- [ ] Progress bars update based on user stats
- [ ] Completing requirement marks achievement as completed
- [ ] Can claim completed achievement
- [ ] Claiming adds correct oranges/gems to balance
- [ ] Claimed achievements show "Claimed" state
- [ ] Secret achievements show "???" until unlocked
- [ ] Achievement popup shows on new unlock
- [ ] Stats persist across sessions (localStorage)
- [ ] Check triggers after: game end, shop purchase, profile update, friend add
- [ ] Navigation shows unclaimed badge count
