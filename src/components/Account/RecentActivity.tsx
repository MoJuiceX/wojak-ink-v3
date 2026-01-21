/**
 * RecentActivity Component
 *
 * Shows last 5-10 user activities.
 */

import { formatDistanceToNow } from 'date-fns';
import { Gamepad2, ShoppingBag, Award, Gift } from 'lucide-react';
import './Account.css';

interface Activity {
  id: string;
  type: 'game_played' | 'item_purchased' | 'achievement_earned' | 'daily_reward';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    score?: number;
    itemName?: string;
    reward?: number;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

const ACTIVITY_ICONS = {
  game_played: Gamepad2,
  item_purchased: ShoppingBag,
  achievement_earned: Award,
  daily_reward: Gift,
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="recent-activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-empty">
          <p>No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity-section">
      <h2 className="section-title">Recent Activity</h2>

      <div className="activity-list">
        {activities.slice(0, 10).map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type];

          return (
            <div key={activity.id} className={`activity-item activity-${activity.type}`}>
              <span className="activity-icon">
                <Icon size={16} />
              </span>
              <div className="activity-content">
                <span className="activity-title">{activity.title}</span>
                <span className="activity-description">{activity.description}</span>
              </div>
              <span className="activity-time">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
