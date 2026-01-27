/**
 * CurrencyStats Component (Premium Compact Version)
 *
 * Compact 4-column grid showing all currency stats.
 */

import './Account.css';

interface CurrencyStatsProps {
  oranges: number;
  gems: number;
  donuts: number;
  poops: number;
  lifetimeOranges?: number;
  lifetimeGems?: number;
}

export function CurrencyStats({
  oranges,
  gems,
  donuts,
  poops,
}: CurrencyStatsProps) {
  return (
    <div className="stats-card-premium">
      <div className="stats-card__grid">
        <div className="stat-item stat-item--orange">
          <span className="stat-icon">🍊</span>
          <span className="stat-value">{oranges.toLocaleString()}</span>
          <span className="stat-label">Oranges</span>
        </div>
        <div className="stat-item stat-item--gem">
          <span className="stat-icon">💎</span>
          <span className="stat-value">{gems.toLocaleString()}</span>
          <span className="stat-label">Gems</span>
        </div>
        <div className="stat-item stat-item--donut">
          <span className="stat-icon">🍩</span>
          <span className="stat-value">{donuts}</span>
          <span className="stat-label">Donuts</span>
        </div>
        <div className="stat-item stat-item--poop">
          <span className="stat-icon">💩</span>
          <span className="stat-value">{poops}</span>
          <span className="stat-label">Poops</span>
        </div>
      </div>
    </div>
  );
}
