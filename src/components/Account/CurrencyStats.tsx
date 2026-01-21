/**
 * CurrencyStats Component
 *
 * Displays oranges, gems, and voting emoji counts.
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
  lifetimeOranges,
  lifetimeGems,
}: CurrencyStatsProps) {
  return (
    <div className="currency-stats">
      <h2 className="section-title">Currency & Voting</h2>

      <div className="stats-grid">
        <div className="stat-card stat-oranges">
          <span className="stat-icon">🍊</span>
          <div className="stat-content">
            <span className="stat-value">{oranges.toLocaleString()}</span>
            <span className="stat-label">Oranges</span>
            {lifetimeOranges !== undefined && (
              <span className="stat-lifetime">
                {lifetimeOranges.toLocaleString()} lifetime
              </span>
            )}
          </div>
        </div>

        <div className="stat-card stat-gems">
          <span className="stat-icon">💎</span>
          <div className="stat-content">
            <span className="stat-value">{gems.toLocaleString()}</span>
            <span className="stat-label">Gems</span>
            {lifetimeGems !== undefined && (
              <span className="stat-lifetime">
                {lifetimeGems.toLocaleString()} lifetime
              </span>
            )}
          </div>
        </div>

        <div className="stat-card stat-donuts">
          <span className="stat-icon">🍩</span>
          <div className="stat-content">
            <span className="stat-value">{donuts}</span>
            <span className="stat-label">Donuts</span>
            <span className="stat-hint">For game voting</span>
          </div>
        </div>

        <div className="stat-card stat-poops">
          <span className="stat-icon">💩</span>
          <div className="stat-content">
            <span className="stat-value">{poops}</span>
            <span className="stat-label">Poops</span>
            <span className="stat-hint">For game voting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
