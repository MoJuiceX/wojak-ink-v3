/**
 * Leaderboard Entry Component
 *
 * Displays a single leaderboard entry with rank, avatar, username, and score.
 * Features premium styling for top 3 and staggered entry animations.
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Avatar } from '../Avatar/Avatar';
import type { LeaderboardEntry as LeaderboardEntryType } from '../../types/leaderboard';
import './Leaderboard.css';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  isPodium?: boolean;
  podiumPosition?: 1 | 2 | 3;
  isHighlighted?: boolean;
  index?: number;
}

export const LeaderboardEntry: React.FC<LeaderboardEntryProps> = ({
  entry,
  isPodium = false,
  podiumPosition,
  isHighlighted = false,
  index = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const getRankDisplay = () => {
    if (podiumPosition === 1) return '🥇';
    if (podiumPosition === 2) return '🥈';
    if (podiumPosition === 3) return '🥉';
    return `#${entry.rank}`;
  };

  const formatScore = (score: number): string => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toLocaleString();
  };

  const getTimeAgo = (dateStr: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isPodium) {
    return (
      <motion.div
        className={`podium-card position-${podiumPosition} ${entry.isCurrentUser ? 'is-current-user' : ''}`}
        whileHover={prefersReducedMotion ? {} : { y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Crown for 1st place */}
        {podiumPosition === 1 && (
          <motion.div
            className="podium-crown"
            animate={prefersReducedMotion ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👑
          </motion.div>
        )}
        <div className="podium-rank">{getRankDisplay()}</div>
        <Avatar
          avatar={entry.avatar}
          size="large"
          isNftHolder={entry.avatar.type === 'nft'}
        />
        <div className="podium-info">
          <span className="podium-username">{entry.displayName}</span>
          <span className="podium-score">{formatScore(entry.score)}</span>
        </div>
      </motion.div>
    );
  }

  // Get rank-specific class for top 3 styling in list view
  const rankClass = entry.rank <= 3 ? `rank-${entry.rank}` : '';

  return (
    <motion.div
      className={`leaderboard-row ${rankClass} ${entry.isCurrentUser ? 'is-current-user' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={prefersReducedMotion ? {} : { x: 4, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
    >
      <div className={`row-rank ${rankClass}`}>
        {entry.rank <= 3 ? (
          <div className="rank-badge">{getRankDisplay()}</div>
        ) : (
          <span className="rank-number">{getRankDisplay()}</span>
        )}
      </div>

      <Avatar
        avatar={entry.avatar}
        size="small"
        isNftHolder={entry.avatar.type === 'nft'}
      />

      <div className="row-info">
        <span className="row-username">{entry.displayName}</span>
        <span className="row-time">{getTimeAgo(entry.createdAt)}</span>
      </div>

      <div className="row-score">
        {formatScore(entry.score)}
      </div>
    </motion.div>
  );
};

export default LeaderboardEntry;
