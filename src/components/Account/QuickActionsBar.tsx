/**
 * QuickActionsBar Component
 *
 * Compact action bar for quick access to Achievements, Customize Drawer, and View Drawer.
 */

import { useNavigate } from 'react-router-dom';
import { Trophy, Palette, ExternalLink } from 'lucide-react';
import './Account.css';

interface QuickActionsBarProps {
  onCustomize: () => void;
  drawerUrl: string;
}

export function QuickActionsBar({ onCustomize, drawerUrl }: QuickActionsBarProps) {
  const navigate = useNavigate();

  return (
    <div className="quick-actions-bar">
      <button
        className="quick-action-btn"
        onClick={() => navigate('/achievements')}
      >
        <Trophy size={16} />
        <span>Achievements</span>
      </button>
      
      <button
        className="quick-action-btn"
        onClick={onCustomize}
      >
        <Palette size={16} />
        <span>Customize</span>
      </button>
      
      <a
        href={drawerUrl}
        className="quick-action-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} />
        <span>View Drawer</span>
      </a>
    </div>
  );
}
