/**
 * AchievementHeader Component
 *
 * Premium stats banner for the achievements page.
 */

import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Gem } from 'lucide-react';

interface AchievementStats {
  completed: number;
  total: number;
  totalPoints: number;
  rareCount: number;
  legendaryCount: number;
}

interface AchievementHeaderProps {
  username: string;
  title?: string;
  avatar?: string;
  stats: AchievementStats;
}

export function AchievementHeader({ username, title, avatar, stats }: AchievementHeaderProps) {
  const completionPercent = Math.round((stats.completed / stats.total) * 100);

  return (
    <motion.div
      className="achievement-header-banner"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background glow */}
      <div className="header-glow" />

      {/* User Info */}
      <div className="header-user">
        <div className="header-avatar">
          {avatar ? (
            <img src={avatar} alt={username} />
          ) : (
            <span className="avatar-emoji">🍊</span>
          )}
        </div>
        <div className="header-user-info">
          <h1 className="header-username">{username}</h1>
          {title && <span className="header-title">"{title}"</span>}
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="header-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="stat-card primary">
          <div className="stat-icon">
            <Trophy size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}/{stats.total}</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalPoints.toLocaleString()}</span>
            <span className="stat-label">Points</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rare">
            <Gem size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.rareCount}</span>
            <span className="stat-label">Rare</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon legendary">
            <Crown size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.legendaryCount}</span>
            <span className="stat-label">Legendary</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-fill"
                strokeDasharray={`${completionPercent}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="progress-percent">{completionPercent}%</span>
          </div>
          <div className="stat-content">
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
