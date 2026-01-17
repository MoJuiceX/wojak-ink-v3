/**
 * Currency Earned Popup Component
 *
 * Animated popup showing rewards earned after a game.
 */

import React, { useEffect, useState } from 'react';
import './Currency.css';

interface CurrencyEarnedPopupProps {
  oranges: number;
  gems: number;
  breakdown?: {
    base: number;
    scoreBonus: number;
    highScoreBonus: number;
    leaderboardBonus: number;
  };
  onComplete?: () => void;
}

export const CurrencyEarnedPopup: React.FC<CurrencyEarnedPopupProps> = ({
  oranges,
  gems,
  breakdown,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    // Show breakdown after initial animation
    const breakdownTimer = setTimeout(() => setShowBreakdown(true), 500);

    // Hide and call onComplete
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(breakdownTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="currency-earned-popup">
      <div className="earned-header">
        <span className="earned-title">Rewards Earned!</span>
      </div>

      <div className="earned-main">
        {oranges > 0 && (
          <div className="earned-currency oranges">
            <span className="icon">🍊</span>
            <span className="amount">+{oranges}</span>
          </div>
        )}
        {gems > 0 && (
          <div className="earned-currency gems">
            <span className="icon">💎</span>
            <span className="amount">+{gems}</span>
          </div>
        )}
      </div>

      {showBreakdown && breakdown && (
        <div className="earned-breakdown">
          {breakdown.base > 0 && (
            <div className="breakdown-item">
              <span>Base Reward</span>
              <span>+{breakdown.base}</span>
            </div>
          )}
          {breakdown.scoreBonus > 0 && (
            <div className="breakdown-item">
              <span>Score Bonus</span>
              <span>+{breakdown.scoreBonus}</span>
            </div>
          )}
          {breakdown.highScoreBonus > 0 && (
            <div className="breakdown-item highlight">
              <span>New High Score!</span>
              <span>+{breakdown.highScoreBonus}</span>
            </div>
          )}
          {breakdown.leaderboardBonus > 0 && (
            <div className="breakdown-item highlight">
              <span>Top 10 Bonus!</span>
              <span>+{breakdown.leaderboardBonus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencyEarnedPopup;
