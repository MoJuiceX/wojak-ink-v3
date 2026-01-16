/**
 * Leaderboard Data Hook
 *
 * Manages global leaderboard data for games.
 * - Fetches top scores (public)
 * - Auto-submits scores for logged-in users
 * - Falls back to local storage for guests
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { leaderboardKeys, type GameId } from '@/config/query/queryKeys';
import { DATA_CACHE_MAP } from '@/config/query/cacheConfig';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUserProfile } from '@/contexts/UserProfileContext';

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  level: number | null;
  date: string;
}

export interface SubmitResult {
  success: boolean;
  scoreId?: number;
  rank?: number;
  isNewHighScore?: boolean;
  previousHighScore?: number | null;
  currentStreak?: number;
  isNewDay?: boolean;
  error?: string;
}

interface LeaderboardResponse {
  gameId: string;
  entries: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Fetch leaderboard entries for a game
 */
async function fetchLeaderboard(
  gameId: GameId,
  limit: number = 10,
  offset: number = 0
): Promise<LeaderboardResponse> {
  const response = await fetch(
    `/api/leaderboard/${gameId}?limit=${limit}&offset=${offset}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
}

/**
 * Hook for managing game leaderboard
 */
export function useLeaderboard(gameId: GameId) {
  const queryClient = useQueryClient();
  const { authenticatedFetch, isSignedIn } = useAuthenticatedFetch();
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch top 10 leaderboard
  const leaderboardQuery = useQuery({
    queryKey: leaderboardKeys.top10(gameId),
    queryFn: () => fetchLeaderboard(gameId, 10),
    ...DATA_CACHE_MAP.leaderboard,
  });

  // Submit score to leaderboard (authenticated users only)
  const submitScore = useCallback(
    async (
      score: number,
      level?: number,
      metadata?: Record<string, unknown>
    ): Promise<SubmitResult> => {
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in' };
      }

      setIsSubmitting(true);

      try {
        const response = await authenticatedFetch('/api/leaderboard/submit', {
          method: 'POST',
          body: JSON.stringify({ gameId, score, level, metadata }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            error: errorData.error || 'Failed to submit score',
          };
        }

        const result = await response.json();

        // Invalidate leaderboard cache to show updated rankings
        queryClient.invalidateQueries({ queryKey: leaderboardKeys.game(gameId) });

        return {
          success: true,
          scoreId: result.scoreId,
          rank: result.rank,
          isNewHighScore: result.isNewHighScore,
          previousHighScore: result.previousHighScore,
          currentStreak: result.currentStreak,
          isNewDay: result.isNewDay,
        };
      } catch (error) {
        console.error('[Leaderboard] Submit error:', error);
        return { success: false, error: 'Network error' };
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, authenticatedFetch, gameId, queryClient]
  );

  // Fetch extended leaderboard (top 100)
  const fetchExtendedLeaderboard = useCallback(async (): Promise<
    LeaderboardEntry[]
  > => {
    try {
      const data = await fetchLeaderboard(gameId, 100);
      return data.entries;
    } catch (error) {
      console.error('[Leaderboard] Extended fetch error:', error);
      return [];
    }
  }, [gameId]);

  // Get user's display name for auto-submission
  const userDisplayName = profile?.displayName || null;

  return {
    // Leaderboard data
    leaderboard: leaderboardQuery.data?.entries || [],
    isLoading: leaderboardQuery.isLoading,
    isError: leaderboardQuery.isError,
    error: leaderboardQuery.error,

    // Actions
    submitScore,
    fetchExtendedLeaderboard,
    refetch: leaderboardQuery.refetch,

    // Auth state
    isSignedIn,
    userDisplayName,
    isSubmitting,
  };
}

export default useLeaderboard;
