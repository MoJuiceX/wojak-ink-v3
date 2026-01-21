/**
 * OverviewTab Component (SPEC 15)
 *
 * Default landing tab showing stats, featured items, activity, and game scores.
 */

import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Crown, Zap, TrendingUp, Gift } from 'lucide-react';

interface OverviewStats {
  level: number;
  itemsOwned: number;
  achievementsCompleted: number;
  achievementsTotal: number;
  currentStreak: number;
  bestRank: number | null;
}

interface FeaturedItem {
  id: string;
  type: 'item' | 'emoji' | 'achievement' | 'score';
  name: string;
  icon: string;
}

interface Activity {
  id: string;
  type: 'achievement' | 'purchase' | 'leaderboard' | 'streak';
  text: string;
  icon: string;
  timestamp: string;
}

interface GameScore {
  gameId: string;
  gameName: string;
  score: number;
  rank: number | null;
}

interface OverviewTabProps {
  stats: OverviewStats;
  featured?: FeaturedItem[];
  activities?: Activity[];
  gameScores?: GameScore[];
  showActivity?: boolean;
  showScores?: boolean;
}

export function OverviewTab({
  stats,
  featured = [],
  activities = [],
  gameScores = [],
  showActivity = true,
  showScores = true,
}: OverviewTabProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="tab-content">
      {/* Stats Grid */}
      <section className="overview-section">
        <div className="section-header">
          <TrendingUp size={20} className="section-icon" />
          <h2 className="section-title">Statistics</h2>
        </div>
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-card">
            <div className="stat-card-icon">
              <Star size={22} />
            </div>
            <span className="stat-card-value">{stats.level}</span>
            <span className="stat-card-label">Level</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <Gift size={22} />
            </div>
            <span className="stat-card-value">{stats.itemsOwned}</span>
            <span className="stat-card-label">Items</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <Trophy size={22} />
            </div>
            <span className="stat-card-value">{stats.achievementsCompleted}/{stats.achievementsTotal}</span>
            <span className="stat-card-label">Achievements</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon">
              <Flame size={22} />
            </div>
            <span className="stat-card-value">{stats.currentStreak}</span>
            <span className="stat-card-label">Day Streak</span>
          </div>

          {stats.bestRank && (
            <div className="stat-card">
              <div className="stat-card-icon">
                <Crown size={22} />
              </div>
              <span className="stat-card-value">#{stats.bestRank}</span>
              <span className="stat-card-label">Best Rank</span>
            </div>
          )}
        </motion.div>
      </section>

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="overview-section">
          <div className="section-header">
            <Star size={20} className="section-icon" />
            <h2 className="section-title">Featured</h2>
          </div>
          <motion.div
            className="featured-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {featured.map((item, index) => (
              <motion.div
                key={item.id}
                className="featured-item"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <span className="featured-item-icon">{item.icon}</span>
                <span className="featured-item-name">{item.name}</span>
                <span className="featured-item-type">{item.type}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Recent Activity */}
      {showActivity && activities.length > 0 && (
        <section className="overview-section">
          <div className="section-header">
            <Zap size={20} className="section-icon" />
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <motion.div
            className="activity-feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {activities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <span className="activity-icon">{activity.icon}</span>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <p className="activity-time">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Game Scores */}
      {showScores && gameScores.length > 0 && (
        <section className="overview-section">
          <div className="section-header">
            <Trophy size={20} className="section-icon" />
            <h2 className="section-title">Game Scores</h2>
          </div>
          <motion.div
            className="scores-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {gameScores.slice(0, 8).map((score, index) => (
              <motion.div
                key={score.gameId}
                className="score-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                <span className="score-card-game">{score.gameName}</span>
                <span className="score-card-value">{score.score.toLocaleString()}</span>
                {score.rank && (
                  <span className={`score-card-rank ${score.rank <= 3 ? 'top-3' : ''}`}>
                    #{score.rank}
                    {score.rank === 1 && ' 🥇'}
                    {score.rank === 2 && ' 🥈'}
                    {score.rank === 3 && ' 🥉'}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Empty state */}
      {featured.length === 0 && activities.length === 0 && gameScores.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">📊</span>
          <h3 className="empty-state-title">No activity yet</h3>
          <p className="empty-state-text">
            Start playing games and earning achievements to see your stats here!
          </p>
        </div>
      )}
    </div>
  );
}
