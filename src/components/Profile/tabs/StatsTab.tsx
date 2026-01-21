/**
 * StatsTab Component (SPEC 15)
 *
 * Detailed statistics about the user's account.
 */

import { motion } from 'framer-motion';
import { User, Coins, Gamepad2, Users } from 'lucide-react';

interface ProfileStats {
  // Account
  memberSince: string;
  currentStreak: number;
  longestStreak: number;
  profileViews?: number;
  level: number;

  // Economy
  lifetimeOranges: number;
  totalSpent: number;
  currentBalance: number;
  itemsOwned: number;
  gems: number;

  // Gaming
  gamesPlayed: number;
  totalScore: number;
  bestGame?: string;
  highestRank?: number;
  firstPlaceCount: number;

  // Social
  friendsCount: number;
  guildName?: string;
  giftsSent: number;
  giftsReceived: number;
  challengesWon: number;
}

interface StatsTabProps {
  stats: ProfileStats;
}

export function StatsTab({ stats }: StatsTabProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="tab-content">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}
      >
        {/* Account Stats */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="stats-section-title">
            <User size={18} style={{ color: '#f97316' }} />
            Account
          </h3>
          <div className="stats-list">
            <div className="stats-row">
              <span className="stats-row-label">Member Since</span>
              <span className="stats-row-value">{formatDate(stats.memberSince)}</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Current Streak</span>
              <span className="stats-row-value highlight">
                {stats.currentStreak} days {stats.currentStreak >= 7 && '🔥'}
              </span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Longest Streak</span>
              <span className="stats-row-value">{stats.longestStreak} days</span>
            </div>
            {stats.profileViews !== undefined && (
              <div className="stats-row">
                <span className="stats-row-label">Profile Views</span>
                <span className="stats-row-value">{stats.profileViews.toLocaleString()}</span>
              </div>
            )}
            <div className="stats-row">
              <span className="stats-row-label">Level</span>
              <span className="stats-row-value highlight">{stats.level}</span>
            </div>
          </div>
        </motion.section>

        {/* Economy Stats */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="stats-section-title">
            <Coins size={18} style={{ color: '#f97316' }} />
            Economy
          </h3>
          <div className="stats-list">
            <div className="stats-row">
              <span className="stats-row-label">Total Earned</span>
              <span className="stats-row-value highlight">
                {stats.lifetimeOranges.toLocaleString()} 🍊
              </span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Total Spent</span>
              <span className="stats-row-value">{stats.totalSpent.toLocaleString()} 🍊</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Current Balance</span>
              <span className="stats-row-value">{stats.currentBalance.toLocaleString()} 🍊</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Items Owned</span>
              <span className="stats-row-value">{stats.itemsOwned}</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Gems</span>
              <span className="stats-row-value">{stats.gems} 💎</span>
            </div>
          </div>
        </motion.section>

        {/* Gaming Stats */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="stats-section-title">
            <Gamepad2 size={18} style={{ color: '#f97316' }} />
            Gaming
          </h3>
          <div className="stats-list">
            <div className="stats-row">
              <span className="stats-row-label">Games Played</span>
              <span className="stats-row-value">{stats.gamesPlayed.toLocaleString()}</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Total Score</span>
              <span className="stats-row-value">{stats.totalScore.toLocaleString()}</span>
            </div>
            {stats.bestGame && (
              <div className="stats-row">
                <span className="stats-row-label">Best Game</span>
                <span className="stats-row-value highlight">{stats.bestGame}</span>
              </div>
            )}
            {stats.highestRank && (
              <div className="stats-row">
                <span className="stats-row-label">Highest Rank</span>
                <span className="stats-row-value highlight">#{stats.highestRank}</span>
              </div>
            )}
            <div className="stats-row">
              <span className="stats-row-label">#1 Positions</span>
              <span className="stats-row-value">
                {stats.firstPlaceCount} {stats.firstPlaceCount > 0 && '🏆'}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Social Stats */}
        <motion.section
          className="stats-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="stats-section-title">
            <Users size={18} style={{ color: '#f97316' }} />
            Social
          </h3>
          <div className="stats-list">
            <div className="stats-row">
              <span className="stats-row-label">Friends</span>
              <span className="stats-row-value">{stats.friendsCount}</span>
            </div>
            {stats.guildName && (
              <div className="stats-row">
                <span className="stats-row-label">Guild</span>
                <span className="stats-row-value highlight">{stats.guildName}</span>
              </div>
            )}
            <div className="stats-row">
              <span className="stats-row-label">Gifts Sent</span>
              <span className="stats-row-value">{stats.giftsSent}</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Gifts Received</span>
              <span className="stats-row-value">{stats.giftsReceived}</span>
            </div>
            <div className="stats-row">
              <span className="stats-row-label">Challenges Won</span>
              <span className="stats-row-value">{stats.challengesWon}</span>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
