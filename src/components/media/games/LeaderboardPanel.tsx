/**
 * Leaderboard Panel Component
 *
 * Displays top scores across all games in the sidebar.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { GAME_NAMES, type GameId } from '@/types/leaderboard';

interface TopScore {
  gameId: GameId;
  gameName: string;
  playerName: string;
  score: number;
}

// Storage key matching LeaderboardContext
const SCORES_KEY = 'wojak_scores';

export function LeaderboardPanel() {
  const [topScores, setTopScores] = useState<TopScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch top score per game from localStorage
    const fetchTopScores = () => {
      try {
        const allScores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
        const allUsers = JSON.parse(localStorage.getItem('wojak_users') || '{}');

        // Get best score per game
        const gameTopScores = new Map<GameId, TopScore>();

        allScores.forEach((score: any) => {
          const gameId = score.gameId as GameId;
          const gameName = GAME_NAMES[gameId];
          if (!gameName) return;

          const userData = allUsers[score.googleId];
          const playerName = userData?.displayName || 'Player';

          const existing = gameTopScores.get(gameId);
          if (!existing || score.score > existing.score) {
            gameTopScores.set(gameId, {
              gameId,
              gameName,
              playerName,
              score: score.score,
            });
          }
        });

        // Sort by score descending and take top entries
        const sorted = Array.from(gameTopScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        setTopScores(sorted);
      } catch (error) {
        console.error('Failed to fetch top scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopScores();
  }, []);

  return (
    <div
      className="h-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--color-glass-bg)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <Trophy size={18} style={{ color: 'var(--color-brand-primary)' }} />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Top Scores
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg animate-pulse"
                style={{ background: 'var(--color-border)' }}
              />
            ))}
          </div>
        ) : topScores.length === 0 ? (
          <div className="text-center py-8">
            <Trophy
              size={32}
              className="mx-auto mb-2 opacity-30"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No scores yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Play games to see top scores!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topScores.map((entry, index) => (
              <motion.div
                key={entry.gameId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Rank */}
                <span
                  className="text-xs font-bold w-5 text-center"
                  style={{
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--color-text-muted)',
                  }}
                >
                  {index + 1}
                </span>

                {/* Game info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {entry.gameName}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {entry.playerName}
                  </p>
                </div>

                {/* Score */}
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--color-brand-primary)' }}
                >
                  {entry.score.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPanel;
