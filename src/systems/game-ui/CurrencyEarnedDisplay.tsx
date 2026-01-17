import React from 'react';

interface CurrencyEarnedDisplayProps {
  oranges: number;
  gems: number;
  breakdown?: Record<string, number>;
  showBreakdown?: boolean;
}

export const CurrencyEarnedDisplay: React.FC<CurrencyEarnedDisplayProps> = ({
  oranges,
  gems,
  breakdown,
  showBreakdown = false
}) => {
  return (
    <div className="currency-earned-display">
      {oranges > 0 && (
        <div className="currency-earned-item oranges">
          <span className="currency-icon">🍊</span>
          <span className="currency-amount">+{oranges.toLocaleString()}</span>
        </div>
      )}
      {gems > 0 && (
        <div className="currency-earned-item gems">
          <span className="currency-icon">💎</span>
          <span className="currency-amount">+{gems.toLocaleString()}</span>
        </div>
      )}
      {showBreakdown && breakdown && Object.keys(breakdown).length > 0 && (
        <div className="currency-breakdown">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key} className="breakdown-item">
              <span className="breakdown-label">{key}</span>
              <span className="breakdown-value">+{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
