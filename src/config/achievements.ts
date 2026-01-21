/**
 * Achievement Definitions
 *
 * All 19 starter achievements.
 */

import type { Achievement, AchievementCategory } from '@/types/achievement';

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
