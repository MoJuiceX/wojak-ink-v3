/**
 * Leaderboard Types
 *
 * Type definitions for the NFT-gated leaderboard system.
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
  };
  score: number;
  gameId: string;
  achievedAt: Date;
  isCurrentUser?: boolean;
}

export interface PersonalStats {
  gameId: string;
  highScore: number;
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestRank?: number;
  lastPlayedAt: Date;
}

export interface LeaderboardFilter {
  gameId: string;
  timeframe: 'all-time' | 'weekly' | 'daily';
  limit?: number;
}

export interface LeaderboardState {
  entries: LeaderboardEntry[];
  userRank: number | null;
  userEntry: LeaderboardEntry | null;
  isLoading: boolean;
  error: string | null;
  canCompete: boolean;
}

export interface SubmitScoreResult {
  success: boolean;
  isNewHighScore: boolean;
  newRank?: number;
  previousRank?: number;
  addedToLeaderboard: boolean;
  orangesEarned: number;
}

export type GameId =
  | 'orange-stack'
  | 'memory-match'
  | 'orange-pong'
  | 'wojak-runner'
  | 'orange-juggle'
  | 'knife-game'
  | 'color-reaction'
  | 'orange-2048'
  | 'block-puzzle'
  | 'flappy-orange'
  | 'citrus-drop'
  | 'orange-snake'
  | 'brick-breaker';

export const GAME_NAMES: Record<GameId, string> = {
  'orange-stack': 'Brick by Brick',
  'memory-match': 'Memory Match',
  'orange-pong': 'Orange Pong',
  'wojak-runner': 'Wojak Runner',
  'orange-juggle': 'Orange Juggle',
  'knife-game': 'The Knife Game',
  'color-reaction': 'Color Reaction',
  'orange-2048': '2048 Merge',
  'block-puzzle': 'Block Puzzle',
  'flappy-orange': 'Flappy Orange',
  'citrus-drop': 'Citrus Drop',
  'orange-snake': 'Orange Snake',
  'brick-breaker': 'Brick Breaker',
};

export const GAME_IDS = Object.keys(GAME_NAMES) as GameId[];
