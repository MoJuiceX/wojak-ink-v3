/**
 * Guild Activity Component
 *
 * Displays recent guild activity feed.
 */

import React from 'react';
import { useGuild } from '../../contexts/GuildContext';
import type { GuildActivity as GuildActivityType, GuildActivityType as ActivityType } from '../../types/guild';
import './Guild.css';

export const GuildActivity: React.FC = () => {
  const { guildActivity } = useGuild();

  const getActivityIcon = (type: ActivityType): string => {
    switch (type) {
      case 'member_joined':
        return '🎉';
      case 'member_left':
        return '👋';
      case 'member_promoted':
        return '⬆️';
      case 'member_demoted':
        return '⬇️';
      case 'high_score':
        return '🏆';
      case 'level_up':
        return '🎊';
      case 'rank_change':
        return '📈';
      case 'challenge_completed':
        return '✅';
      default:
        return '📝';
    }
  };

  const getActivityMessage = (activity: GuildActivityType): string => {
    const { type, username, data } = activity;

    switch (type) {
      case 'member_joined':
        if (data.isFounder) {
          return `${username} founded the guild`;
        }
        return `${username} joined the guild`;
      case 'member_left':
        if (data.kicked) {
          return `${username} was removed from the guild`;
        }
        return `${username} left the guild`;
      case 'member_promoted':
        if (data.newRole === 'leader') {
          return `${username} became the guild leader`;
        }
        return `${username} was promoted to officer`;
      case 'member_demoted':
        return `${username} was demoted to member`;
      case 'high_score':
        return `${username} set a new high score of ${(data.score as number)?.toLocaleString() || 0}`;
      case 'level_up':
        return `Guild reached level ${data.level || '?'}!`;
      case 'rank_change':
        return `Guild moved to rank #${data.newRank || '?'}`;
      case 'challenge_completed':
        return `${username} completed a challenge`;
      default:
        return `${username} did something`;
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (guildActivity.length === 0) {
    return (
      <div className="guild-activity-empty">
        <span className="empty-icon">📜</span>
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="guild-activity">
      <h3 className="activity-title">Recent Activity</h3>
      <div className="activity-feed">
        {guildActivity.slice(0, 10).map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
            <div className="activity-content">
              <span className="activity-message">{getActivityMessage(activity)}</span>
              <span className="activity-time">{formatTimeAgo(activity.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuildActivity;
