/**
 * useGameScore Hook
 *
 * Handles score submission and personal stats for games.
 * Provides callbacks for high scores and leaderboard updates.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import type { GameId, PersonalStats, SubmitScoreResult } from '../types/leaderboard';

interface GameScoreOptions {
  gameId: GameId;
  onHighScore?: (score: number, rank?: number) => void;
  onLeaderboardUpdate?: (addedToLeaderboard: boolean, rank?: number) => void;
}

interface UseGameScoreReturn {
  loadStats: () => Promise<PersonalStats | null>;
  handleGameEnd: (finalScore: number) => Promise<SubmitScoreResult>;
  getHighScore: () => number;
  isNftHolder: boolean;
  personalStats: PersonalStats | null;
}

export const useGameScore = (options: GameScoreOptions): UseGameScoreReturn => {
  const { gameId, onHighScore, onLeaderboardUpdate } = options;
  const { user } = useAuth();
  const { submitScore, canUserCompete, fetchPersonalStats, personalStats } = useLeaderboard();
  const personalStatsRef = useRef<PersonalStats | null>(null);

  // Get current stats from context
  const currentStats = personalStats.get(gameId) || null;

  // Keep ref in sync
  useEffect(() => {
    personalStatsRef.current = currentStats;
  }, [currentStats]);

  // Load personal stats on mount
  const loadStats = useCallback(async () => {
    const stats = await fetchPersonalStats(gameId);
    personalStatsRef.current = stats;
    return stats;
  }, [gameId, fetchPersonalStats]);

  // Submit score when game ends
  const handleGameEnd = useCallback(async (finalScore: number): Promise<SubmitScoreResult> => {
    if (!user) {
      return {
        success: false,
        isNewHighScore: false,
        addedToLeaderboard: false,
        orangesEarned: 0,
      };
    }

    const result = await submitScore(gameId, finalScore);

    if (result.success) {
      // Check if it's a new high score
      if (result.isNewHighScore) {
        onHighScore?.(finalScore, result.newRank);
      }

      // Notify about leaderboard status
      if (canUserCompete()) {
        onLeaderboardUpdate?.(result.addedToLeaderboard, result.newRank);
      } else {
        // User is not NFT holder - show prompt
        onLeaderboardUpdate?.(false);
      }
    }

    return result;
  }, [user, gameId, submitScore, canUserCompete, onHighScore, onLeaderboardUpdate]);

  // Get current high score
  const getHighScore = useCallback((): number => {
    return personalStatsRef.current?.highScore || 0;
  }, []);

  return {
    loadStats,
    handleGameEnd,
    getHighScore,
    isNftHolder: canUserCompete(),
    personalStats: currentStats,
  };
};

export default useGameScore;
