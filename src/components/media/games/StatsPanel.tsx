/**
 * Stats Panel Component
 *
 * Displays user's personal gaming statistics in the sidebar.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Gamepad2, Target, Flame, Clock } from 'lucide-react';
import { GAME_NAMES, type GameId } from '@/types/leaderboard';

interface UserStats {
  totalGamesPlayed: number;
  favoriteGame: string | null;
  highestScore: number;
  highestScoreGame: string | null;
  totalPlayTime: number; // in minutes (estimated)
  gamesWithScores: number;
}

// Storage key matching LeaderboardContext
const SCORES_KEY = 'wojak_scores';

export function StatsPanel() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = () => {
      try {
        const allScores = JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');

        if (allScores.length === 0) {
          setStats(null);
          setIsLoading(false);
          return;
        }

        // Count games per gameId
        const gameCounts = new Map<GameId, number>();
        let highestScore = 0;
        let highestScoreGameId: GameId | null = null;

        allScores.forEach((score: any) => {
          const gameId = score.gameId as GameId;
          gameCounts.set(gameId, (gameCounts.get(gameId) || 0) + 1);

          if (score.score > highestScore) {
            highestScore = score.score;
            highestScoreGameId = gameId;
          }
        });

        // Find favorite game (most played)
        let favoriteGameId: GameId | null = null;
        let maxPlays = 0;
        gameCounts.forEach((count, gameId) => {
          if (count > maxPlays) {
            maxPlays = count;
            favoriteGameId = gameId;
          }
        });

        // Estimate play time (rough: 2 min per game session)
        const estimatedPlayTime = allScores.length * 2;

        setStats({
          totalGamesPlayed: allScores.length,
          favoriteGame: favoriteGameId ? GAME_NAMES[favoriteGameId] : null,
          highestScore,
          highestScoreGame: highestScoreGameId ? GAME_NAMES[highestScoreGameId] : null,
          totalPlayTime: estimatedPlayTime,
          gamesWithScores: gameCounts.size,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPlayTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
        <BarChart3 size={18} style={{ color: 'var(--color-brand-primary)' }} />
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Your Stats
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg animate-pulse"
                style={{ background: 'var(--color-border)' }}
              />
            ))}
          </div>
        ) : !stats ? (
          <div className="text-center py-8">
            <Gamepad2
              size={32}
              className="mx-auto mb-2 opacity-30"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No stats yet
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Start playing to track your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Total Games Played */}
            <motion.div
              className="px-3 py-3 rounded-lg"
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Gamepad2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Games Played
                </span>
              </div>
              <p
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {stats.totalGamesPlayed.toLocaleString()}
              </p>
            </motion.div>

            {/* Highest Score */}
            <motion.div
              className="px-3 py-3 rounded-lg"
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Best Score
                </span>
              </div>
              <p
                className="text-xl font-bold"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {stats.highestScore.toLocaleString()}
              </p>
              {stats.highestScoreGame && (
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  in {stats.highestScoreGame}
                </p>
              )}
            </motion.div>

            {/* Favorite Game */}
            {stats.favoriteGame && (
              <motion.div
                className="px-3 py-3 rounded-lg"
                style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border)',
                }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span
                    className="text-[10px] uppercase tracking-wide"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Favorite Game
                  </span>
                </div>
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.favoriteGame}
                </p>
              </motion.div>
            )}

            {/* Play Time */}
            <motion.div
              className="px-3 py-3 rounded-lg"
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Time Played
                </span>
              </div>
              <p
                className="text-xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {formatPlayTime(stats.totalPlayTime)}
              </p>
            </motion.div>

            {/* Games Discovered */}
            <motion.div
              className="px-3 py-3 rounded-lg"
              style={{
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Games Discovered
                </span>
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {stats.gamesWithScores} / 15
              </p>
              <div
                className="mt-2 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(stats.gamesWithScores / 15) * 100}%`,
                    background: 'var(--color-brand-primary)',
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsPanel;
