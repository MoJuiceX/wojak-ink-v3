/**
 * Daily Reward Modal Component
 *
 * Shows daily login rewards with streak tracking.
 */

import React, { useState, useEffect } from 'react';
import { IonModal, IonButton, IonSpinner } from '@ionic/react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { DAILY_REWARDS } from '../../types/currency';
import './Currency.css';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ isOpen, onClose }) => {
  const { getDailyRewardStatus, claimDailyReward } = useCurrency();
  const [status, setStatus] = useState(getDailyRewardStatus());
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{
    oranges: number;
    gems: number;
    bonusItem?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(getDailyRewardStatus());
      setClaimedReward(null);
      setError(null);
    }
  }, [isOpen, getDailyRewardStatus]);

  // Update timer every minute
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStatus(getDailyRewardStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen, getDailyRewardStatus]);

  const handleClaim = async () => {
    setIsClaiming(true);
    setError(null);
    try {
      const result = await claimDailyReward();
      setClaimedReward(result.reward);
      setStatus(getDailyRewardStatus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim reward');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="daily-reward-modal">
      <div className="daily-reward-content">
        <div className="daily-header">
          <h2>Daily Rewards</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Streak Display */}
        <div className="streak-display">
          <span className="streak-label">Current Streak</span>
          <span className="streak-value">{status.currentStreak} days</span>
        </div>

        {/* Weekly Rewards Grid */}
        <div className="weekly-rewards-grid">
          {DAILY_REWARDS.map((reward, index) => {
            const dayNumber = index + 1;
            const streakPosition = status.currentStreak % 7 || 7;
            const isPast = dayNumber < streakPosition;
            const isToday = dayNumber === streakPosition;
            const isClaimed = isPast || (isToday && !status.canClaim);

            return (
              <div
                key={dayNumber}
                className={`daily-reward-card ${isToday ? 'today' : ''} ${isClaimed ? 'claimed' : ''}`}
              >
                <span className="day-label">Day {dayNumber}</span>
                <div className="reward-content">
                  <span className="reward-icon">🍊</span>
                  <span className="reward-amount">{reward.oranges}</span>
                  {reward.gems > 0 && (
                    <>
                      <span className="reward-icon">💎</span>
                      <span className="reward-amount">{reward.gems}</span>
                    </>
                  )}
                  {reward.bonusItem && <span className="bonus-badge">🎁</span>}
                </div>
                {isClaimed && <div className="claimed-overlay">✓</div>}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Claimed Reward Display */}
        {claimedReward && (
          <div className="claimed-reward-display">
            <span className="claimed-title">Claimed!</span>
            <div className="claimed-amounts">
              <span>🍊 +{claimedReward.oranges}</span>
              {claimedReward.gems > 0 && <span>💎 +{claimedReward.gems}</span>}
              {claimedReward.bonusItem && <span>🎁 Mystery Box!</span>}
            </div>
          </div>
        )}

        {/* Claim Button */}
        <div className="daily-actions">
          {status.canClaim && !claimedReward ? (
            <IonButton
              onClick={handleClaim}
              disabled={isClaiming}
              expand="block"
              className="claim-button"
            >
              {isClaiming ? <IonSpinner name="crescent" /> : "Claim Today's Reward"}
            </IonButton>
          ) : (
            <div className="next-reward-timer">
              <span>Next reward in</span>
              <span className="timer">{formatTime(status.timeUntilReset)}</span>
            </div>
          )}
        </div>
      </div>
    </IonModal>
  );
};

export default DailyRewardModal;
