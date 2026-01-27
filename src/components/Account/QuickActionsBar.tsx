/**
 * QuickActionsBar Component
 *
 * Premium action bar for quick access to Achievements, Customize, and Profile Card.
 * Styled to match game score cards.
 */

import { Trophy, Palette, User } from 'lucide-react';
import './Account.css';

interface QuickActionsBarProps {
  onAchievements: () => void;
  onCustomize: () => void;
  onViewProfileCard: () => void;
}

export function QuickActionsBar({
  onAchievements,
  onCustomize,
  onViewProfileCard,
}: QuickActionsBarProps) {
  return (
    <div className="quick-actions-bar">
      <button
        type="button"
        className="quick-action-btn"
        onClick={onAchievements}
      >
        <Trophy size={20} />
        <span>Achievements</span>
      </button>

      <button
        type="button"
        className="quick-action-btn"
        onClick={onCustomize}
      >
        <Palette size={20} />
        <span>Customize</span>
      </button>

      <button
        type="button"
        className="quick-action-btn"
        onClick={onViewProfileCard}
      >
        <User size={20} />
        <span>Profile Card</span>
      </button>
    </div>
  );
}
