# IMPLEMENTATION PROMPT 04: Currency & Rewards System

## Overview
Build a dual-currency economy with Oranges (soft currency, abundant) and Gems (hard currency, scarce) that drives player engagement, provides progression, and optionally connects to the Chia blockchain via CAT tokens.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENCY SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🍊 ORANGES (Soft Currency)                                     │
│  ├── Earned: Playing games, daily login, achievements           │
│  ├── Abundant & easy to earn                                    │
│  ├── Stored: Off-chain (database)                               │
│  └── Spent on: Basic cosmetics, continues, small boosts         │
│                                                                  │
│  💎 GEMS (Hard Currency)                                         │
│  ├── Earned: Rare achievements, events, purchases               │
│  ├── Scarce & valuable                                          │
│  ├── Stored: Off-chain OR on-chain (CAT token - future)         │
│  └── Spent on: Premium cosmetics, exclusive items               │
│                                                                  │
│  EARNING MECHANICS                                               │
│  ├── Base score rewards (oranges per game)                      │
│  ├── Daily login streak bonuses                                 │
│  ├── Achievement completion rewards                             │
│  ├── Leaderboard placement rewards                              │
│  └── Seasonal event rewards                                     │
│                                                                  │
│  SPENDING MECHANICS                                              │
│  ├── Avatar accessories & frames                                │
│  ├── Game themes & backgrounds                                  │
│  ├── Celebration effects                                        │
│  ├── Profile badges & titles                                    │
│  └── Continue/retry tokens                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Types and Interfaces

### 1.1 Currency Types
Create `src/types/currency.ts`:

```typescript
export interface UserCurrency {
  oranges: number;
  gems: number;
  lifetimeOranges: number; // Total ever earned
  lifetimeGems: number;
}

export interface CurrencyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend';
  currency: 'oranges' | 'gems';
  amount: number;
  source: TransactionSource;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type TransactionSource =
  // Earning sources
  | 'game_score'
  | 'daily_login'
  | 'login_streak'
  | 'achievement'
  | 'leaderboard_reward'
  | 'guild_reward'
  | 'event_reward'
  | 'referral'
  | 'admin_grant' // For support/promotions
  // Spending sources
  | 'shop_purchase'
  | 'continue_game'
  | 'boost_purchase'
  | 'gift_sent';

// Reward configuration
export interface GameRewardConfig {
  gameId: string;
  baseOranges: number; // Base oranges per game
  scoreMultiplier: number; // Oranges per X points
  scoreThreshold: number; // Points needed for multiplier
  maxOrangesPerGame: number; // Cap per game
  bonusForHighScore: number; // Extra for new personal best
  bonusForTop10: number; // Extra for top 10 placement
}

// Daily login rewards
export interface DailyReward {
  day: number; // 1-7 for weekly cycle
  oranges: number;
  gems: number;
  bonusItem?: string; // Special item on day 7
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, oranges: 100, gems: 0 },
  { day: 2, oranges: 150, gems: 0 },
  { day: 3, oranges: 200, gems: 0 },
  { day: 4, oranges: 250, gems: 1 },
  { day: 5, oranges: 300, gems: 0 },
  { day: 6, oranges: 400, gems: 2 },
  { day: 7, oranges: 500, gems: 5, bonusItem: 'mystery_box' },
];

// Game reward configurations
export const GAME_REWARDS: Record<string, GameRewardConfig> = {
  'orange-stack': {
    gameId: 'orange-stack',
    baseOranges: 10,
    scoreMultiplier: 1, // 1 orange per 100 points
    scoreThreshold: 100,
    maxOrangesPerGame: 500,
    bonusForHighScore: 50,
    bonusForTop10: 100
  },
  'memory-match': {
    gameId: 'memory-match',
    baseOranges: 15,
    scoreMultiplier: 2,
    scoreThreshold: 50,
    maxOrangesPerGame: 300,
    bonusForHighScore: 40,
    bonusForTop10: 80
  },
  'orange-pong': {
    gameId: 'orange-pong',
    baseOranges: 10,
    scoreMultiplier: 1,
    scoreThreshold: 1, // Per point scored
    maxOrangesPerGame: 200,
    bonusForHighScore: 30,
    bonusForTop10: 60
  },
  // Add configs for all 9 games...
};

// Achievement rewards
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  reward: {
    oranges: number;
    gems: number;
    title?: string;
    badge?: string;
  };
  isSecret?: boolean;
}

export type AchievementCategory =
  | 'gameplay'
  | 'collection'
  | 'social'
  | 'milestone'
  | 'seasonal';

export interface AchievementRequirement {
  type: 'score' | 'games_played' | 'streak' | 'collection' | 'special';
  gameId?: string;
  target: number;
}

// Shop items
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: {
    oranges?: number;
    gems?: number;
  };
  preview: string; // Image URL or emoji
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isLimited?: boolean;
  availableUntil?: Date;
}

export type ShopCategory =
  | 'avatar_frame'
  | 'avatar_accessory'
  | 'game_theme'
  | 'celebration_effect'
  | 'badge'
  | 'title'
  | 'consumable';
```

---

## Part 2: Currency Context

### 2.1 Currency Context
Create `src/contexts/CurrencyContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  UserCurrency,
  CurrencyTransaction,
  TransactionSource,
  GameRewardConfig,
  GAME_REWARDS,
  DAILY_REWARDS,
  Achievement
} from '../types/currency';

interface CurrencyContextType {
  // Currency state
  currency: UserCurrency;
  isLoading: boolean;

  // Earning
  earnFromGame: (gameId: string, score: number, isHighScore: boolean, leaderboardRank?: number) => Promise<EarnResult>;
  claimDailyReward: () => Promise<DailyRewardResult>;
  claimAchievement: (achievementId: string) => Promise<Achievement | null>;

  // Spending
  purchaseItem: (itemId: string) => Promise<PurchaseResult>;
  useContinue: (gameId: string) => Promise<boolean>;

  // Info
  getDailyRewardStatus: () => DailyRewardStatus;
  canAfford: (oranges?: number, gems?: number) => boolean;

  // Transactions
  recentTransactions: CurrencyTransaction[];
  fetchTransactionHistory: () => Promise<void>;
}

interface EarnResult {
  success: boolean;
  orangesEarned: number;
  gemsEarned: number;
  breakdown: {
    base: number;
    scoreBonus: number;
    highScoreBonus: number;
    leaderboardBonus: number;
  };
  newAchievements?: Achievement[];
}

interface DailyRewardResult {
  success: boolean;
  reward: {
    oranges: number;
    gems: number;
    bonusItem?: string;
  };
  currentStreak: number;
  nextRewardIn: number; // Hours until next reward
}

interface DailyRewardStatus {
  canClaim: boolean;
  currentStreak: number;
  nextReward: {
    oranges: number;
    gems: number;
    bonusItem?: string;
  };
  timeUntilReset: number; // Milliseconds
}

interface PurchaseResult {
  success: boolean;
  error?: string;
  newBalance?: UserCurrency;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<UserCurrency>({
    oranges: 0,
    gems: 0,
    lifetimeOranges: 0,
    lifetimeGems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<CurrencyTransaction[]>([]);
  const [dailyStatus, setDailyStatus] = useState<{
    lastClaimDate: string | null;
    currentStreak: number;
  }>({ lastClaimDate: null, currentStreak: 0 });

  // Fetch user's currency on mount
  useEffect(() => {
    if (user) {
      fetchCurrency();
      fetchDailyStatus();
    } else {
      setCurrency({ oranges: 0, gems: 0, lifetimeOranges: 0, lifetimeGems: 0 });
      setIsLoading(false);
    }
  }, [user]);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('auth_token')}`
  });

  const fetchCurrency = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/currency', {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setCurrency(data);
      }
    } catch (error) {
      console.error('Failed to fetch currency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyStatus = async () => {
    try {
      const response = await fetch('/api/currency/daily-status', {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setDailyStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily status:', error);
    }
  };

  // Calculate rewards for a game
  const calculateGameRewards = (
    config: GameRewardConfig,
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ): EarnResult['breakdown'] => {
    let base = config.baseOranges;
    let scoreBonus = Math.floor(score / config.scoreThreshold) * config.scoreMultiplier;
    let highScoreBonus = isHighScore ? config.bonusForHighScore : 0;
    let leaderboardBonus = 0;

    if (leaderboardRank && leaderboardRank <= 10) {
      leaderboardBonus = config.bonusForTop10;
    }

    // Apply cap
    const total = Math.min(
      base + scoreBonus + highScoreBonus + leaderboardBonus,
      config.maxOrangesPerGame
    );

    return {
      base,
      scoreBonus: Math.min(scoreBonus, config.maxOrangesPerGame - base),
      highScoreBonus,
      leaderboardBonus
    };
  };

  // Earn currency from playing a game
  const earnFromGame = async (
    gameId: string,
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ): Promise<EarnResult> => {
    const config = GAME_REWARDS[gameId];
    if (!config) {
      return {
        success: false,
        orangesEarned: 0,
        gemsEarned: 0,
        breakdown: { base: 0, scoreBonus: 0, highScoreBonus: 0, leaderboardBonus: 0 }
      };
    }

    try {
      const response = await fetch('/api/currency/earn/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          gameId,
          score,
          isHighScore,
          leaderboardRank
        })
      });

      if (!response.ok) throw new Error('Failed to earn currency');

      const result = await response.json();

      // Update local state
      setCurrency(prev => ({
        ...prev,
        oranges: prev.oranges + result.orangesEarned,
        gems: prev.gems + result.gemsEarned,
        lifetimeOranges: prev.lifetimeOranges + result.orangesEarned,
        lifetimeGems: prev.lifetimeGems + result.gemsEarned
      }));

      return result;
    } catch (error) {
      console.error('Failed to earn from game:', error);
      // Calculate locally as fallback
      const breakdown = calculateGameRewards(config, score, isHighScore, leaderboardRank);
      const total = breakdown.base + breakdown.scoreBonus + breakdown.highScoreBonus + breakdown.leaderboardBonus;

      return {
        success: false,
        orangesEarned: total,
        gemsEarned: 0,
        breakdown
      };
    }
  };

  // Claim daily reward
  const claimDailyReward = async (): Promise<DailyRewardResult> => {
    try {
      const response = await fetch('/api/currency/daily/claim', {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim');
      }

      const result: DailyRewardResult = await response.json();

      // Update local state
      setCurrency(prev => ({
        ...prev,
        oranges: prev.oranges + result.reward.oranges,
        gems: prev.gems + result.reward.gems,
        lifetimeOranges: prev.lifetimeOranges + result.reward.oranges,
        lifetimeGems: prev.lifetimeGems + result.reward.gems
      }));

      setDailyStatus({
        lastClaimDate: new Date().toISOString().split('T')[0],
        currentStreak: result.currentStreak
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Get daily reward status
  const getDailyRewardStatus = (): DailyRewardStatus => {
    const today = new Date().toISOString().split('T')[0];
    const canClaim = dailyStatus.lastClaimDate !== today;

    // Calculate next reward based on streak
    const nextDay = ((dailyStatus.currentStreak % 7) + 1);
    const nextReward = DAILY_REWARDS[nextDay - 1];

    // Calculate time until reset (midnight UTC)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const timeUntilReset = midnight.getTime() - now.getTime();

    return {
      canClaim,
      currentStreak: dailyStatus.currentStreak,
      nextReward,
      timeUntilReset
    };
  };

  // Claim achievement reward
  const claimAchievement = async (achievementId: string): Promise<Achievement | null> => {
    try {
      const response = await fetch(`/api/achievements/${achievementId}/claim`, {
        method: 'POST',
        headers: getAuthHeader()
      });

      if (!response.ok) return null;

      const { achievement, reward } = await response.json();

      // Update local state
      setCurrency(prev => ({
        ...prev,
        oranges: prev.oranges + reward.oranges,
        gems: prev.gems + reward.gems,
        lifetimeOranges: prev.lifetimeOranges + reward.oranges,
        lifetimeGems: prev.lifetimeGems + reward.gems
      }));

      return achievement;
    } catch (error) {
      console.error('Failed to claim achievement:', error);
      return null;
    }
  };

  // Purchase item from shop
  const purchaseItem = async (itemId: string): Promise<PurchaseResult> => {
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ itemId })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.message };
      }

      // Update local state
      setCurrency(result.newBalance);

      return { success: true, newBalance: result.newBalance };
    } catch (error) {
      return { success: false, error: 'Purchase failed' };
    }
  };

  // Use a continue token
  const useContinue = async (gameId: string): Promise<boolean> => {
    // Cost: 50 oranges per continue
    const CONTINUE_COST = 50;

    if (currency.oranges < CONTINUE_COST) {
      return false;
    }

    try {
      const response = await fetch('/api/currency/spend/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ gameId, cost: CONTINUE_COST })
      });

      if (!response.ok) return false;

      setCurrency(prev => ({
        ...prev,
        oranges: prev.oranges - CONTINUE_COST
      }));

      return true;
    } catch {
      return false;
    }
  };

  // Check if user can afford something
  const canAfford = (oranges?: number, gems?: number): boolean => {
    if (oranges && currency.oranges < oranges) return false;
    if (gems && currency.gems < gems) return false;
    return true;
  };

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch('/api/currency/transactions?limit=50', {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        isLoading,
        earnFromGame,
        claimDailyReward,
        claimAchievement,
        purchaseItem,
        useContinue,
        getDailyRewardStatus,
        canAfford,
        recentTransactions,
        fetchTransactionHistory
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
```

---

## Part 3: Currency UI Components

### 3.1 Currency Display Component
Create `src/components/Currency/CurrencyDisplay.tsx`:

```typescript
import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import './Currency.css';

interface CurrencyDisplayProps {
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  showLabels = false,
  size = 'medium',
  onClick
}) => {
  const { currency, isLoading } = useCurrency();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={`currency-display currency-${size} loading`}>
        <div className="currency-skeleton" />
        <div className="currency-skeleton" />
      </div>
    );
  }

  return (
    <div
      className={`currency-display currency-${size} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <div className="currency-item oranges">
        <span className="currency-icon">🍊</span>
        <span className="currency-value">{formatNumber(currency.oranges)}</span>
        {showLabels && <span className="currency-label">Oranges</span>}
      </div>

      <div className="currency-item gems">
        <span className="currency-icon">💎</span>
        <span className="currency-value">{formatNumber(currency.gems)}</span>
        {showLabels && <span className="currency-label">Gems</span>}
      </div>
    </div>
  );
};
```

### 3.2 Currency Earned Animation
Create `src/components/Currency/CurrencyEarnedPopup.tsx`:

```typescript
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
  onComplete
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
              <span>🏆 New High Score!</span>
              <span>+{breakdown.highScoreBonus}</span>
            </div>
          )}
          {breakdown.leaderboardBonus > 0 && (
            <div className="breakdown-item highlight">
              <span>🎯 Top 10 Bonus!</span>
              <span>+{breakdown.leaderboardBonus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### 3.3 Daily Reward Component
Create `src/components/Currency/DailyReward.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { IonModal, IonButton, IonSpinner } from '@ionic/react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { DAILY_REWARDS } from '../../types/currency';
import './Currency.css';

interface DailyRewardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardProps> = ({ isOpen, onClose }) => {
  const { getDailyRewardStatus, claimDailyReward } = useCurrency();
  const [status, setStatus] = useState(getDailyRewardStatus());
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{
    oranges: number;
    gems: number;
    bonusItem?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus(getDailyRewardStatus());
      setClaimedReward(null);
    }
  }, [isOpen, getDailyRewardStatus]);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const result = await claimDailyReward();
      setClaimedReward(result.reward);
      setStatus(getDailyRewardStatus());
    } catch (error) {
      console.error('Failed to claim:', error);
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
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Streak Display */}
        <div className="streak-display">
          <span className="streak-label">Current Streak</span>
          <span className="streak-value">🔥 {status.currentStreak} days</span>
        </div>

        {/* Weekly Rewards Grid */}
        <div className="weekly-rewards-grid">
          {DAILY_REWARDS.map((reward, index) => {
            const dayNumber = index + 1;
            const isPast = dayNumber < ((status.currentStreak % 7) + 1);
            const isToday = dayNumber === ((status.currentStreak % 7) + 1);
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
                  {reward.bonusItem && (
                    <span className="bonus-badge">🎁</span>
                  )}
                </div>
                {isClaimed && <div className="claimed-overlay">✓</div>}
              </div>
            );
          })}
        </div>

        {/* Claimed Reward Display */}
        {claimedReward && (
          <div className="claimed-reward-display">
            <span className="claimed-title">🎉 Claimed!</span>
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
              {isClaiming ? <IonSpinner name="crescent" /> : 'Claim Today\'s Reward'}
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
```

### 3.4 Shop Component
Create `src/components/Shop/Shop.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonSpinner
} from '@ionic/react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CurrencyDisplay } from '../Currency/CurrencyDisplay';
import { ShopItem, ShopCategory } from '../../types/currency';
import './Shop.css';

const CATEGORIES: { value: ShopCategory; label: string }[] = [
  { value: 'avatar_frame', label: 'Frames' },
  { value: 'avatar_accessory', label: 'Accessories' },
  { value: 'game_theme', label: 'Themes' },
  { value: 'celebration_effect', label: 'Effects' },
  { value: 'badge', label: 'Badges' },
  { value: 'title', label: 'Titles' },
];

export const Shop: React.FC = () => {
  const { purchaseItem, canAfford } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('avatar_frame');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchShopItems();
    fetchOwnedItems();
  }, []);

  const fetchShopItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shop/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch shop items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOwnedItems = async () => {
    try {
      const response = await fetch('/api/user/inventory', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOwnedItems(new Set(data.ownedItems.map((i: any) => i.itemId)));
      }
    } catch (error) {
      console.error('Failed to fetch owned items:', error);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    setPurchasingId(item.id);
    const result = await purchaseItem(item.id);
    if (result.success) {
      setOwnedItems(prev => new Set([...prev, item.id]));
    } else {
      // Show error toast
      console.error('Purchase failed:', result.error);
    }
    setPurchasingId(null);
  };

  const filteredItems = items.filter(item => item.category === activeCategory);

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9B59B6';
      case 'rare': return '#3498DB';
      default: return '#95A5A6';
    }
  };

  return (
    <IonPage>
      <IonContent className="shop-page">
        {/* Header with Currency */}
        <div className="shop-header">
          <h1>Shop</h1>
          <CurrencyDisplay size="medium" />
        </div>

        {/* Category Tabs */}
        <IonSegment
          value={activeCategory}
          onIonChange={(e) => setActiveCategory(e.detail.value as ShopCategory)}
          scrollable
          className="category-tabs"
        >
          {CATEGORIES.map((cat) => (
            <IonSegmentButton key={cat.value} value={cat.value}>
              <IonLabel>{cat.label}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>

        {/* Items Grid */}
        {isLoading ? (
          <div className="loading-state">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => {
              const isOwned = ownedItems.has(item.id);
              const affordable = canAfford(item.price.oranges, item.price.gems);

              return (
                <div
                  key={item.id}
                  className={`shop-item-card ${isOwned ? 'owned' : ''}`}
                  style={{ '--rarity-color': getRarityColor(item.rarity) } as React.CSSProperties}
                >
                  {/* Rarity Badge */}
                  <span className="rarity-badge">{item.rarity}</span>

                  {/* Limited Badge */}
                  {item.isLimited && (
                    <span className="limited-badge">Limited!</span>
                  )}

                  {/* Item Preview */}
                  <div className="item-preview">
                    {item.preview.startsWith('http') ? (
                      <img src={item.preview} alt={item.name} />
                    ) : (
                      <span className="preview-emoji">{item.preview}</span>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-description">{item.description}</span>
                  </div>

                  {/* Price / Owned */}
                  <div className="item-footer">
                    {isOwned ? (
                      <span className="owned-badge">✓ Owned</span>
                    ) : (
                      <>
                        <div className="item-price">
                          {item.price.oranges && (
                            <span className="price oranges">
                              🍊 {item.price.oranges.toLocaleString()}
                            </span>
                          )}
                          {item.price.gems && (
                            <span className="price gems">
                              💎 {item.price.gems}
                            </span>
                          )}
                        </div>
                        <IonButton
                          size="small"
                          disabled={!affordable || purchasingId === item.id}
                          onClick={() => handlePurchase(item)}
                          className="buy-button"
                        >
                          {purchasingId === item.id ? (
                            <IonSpinner name="crescent" />
                          ) : affordable ? (
                            'Buy'
                          ) : (
                            'Not enough'
                          )}
                        </IonButton>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="empty-state">
                <p>No items in this category yet!</p>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};
```

---

## Part 4: Currency Styles
Create `src/components/Currency/Currency.css`:

```css
/* Currency Display */
.currency-display {
  display: flex;
  gap: 12px;
  align-items: center;
}

.currency-display.clickable {
  cursor: pointer;
}

.currency-display.loading .currency-skeleton {
  width: 80px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.currency-item.oranges {
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.2), rgba(255, 100, 50, 0.1));
  border-color: rgba(255, 140, 50, 0.3);
}

.currency-item.gems {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(142, 68, 173, 0.1));
  border-color: rgba(155, 89, 182, 0.3);
}

.currency-icon {
  font-size: 1rem;
}

.currency-value {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
}

.currency-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin-left: 4px;
}

/* Size Variants */
.currency-small .currency-item {
  padding: 4px 8px;
}

.currency-small .currency-icon {
  font-size: 0.85rem;
}

.currency-small .currency-value {
  font-size: 0.85rem;
}

.currency-large .currency-item {
  padding: 10px 20px;
}

.currency-large .currency-icon {
  font-size: 1.3rem;
}

.currency-large .currency-value {
  font-size: 1.2rem;
}

/* Currency Earned Popup */
.currency-earned-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(20, 20, 35, 0.98), rgba(30, 30, 50, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 140, 50, 0.3);
  padding: 24px 32px;
  text-align: center;
  z-index: 10000;
  animation: popupAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes popupAppear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.earned-header {
  margin-bottom: 16px;
}

.earned-title {
  color: #FFD700;
  font-size: 1.3rem;
  font-weight: 700;
}

.earned-main {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
}

.earned-currency {
  display: flex;
  align-items: center;
  gap: 8px;
}

.earned-currency .icon {
  font-size: 2rem;
  animation: iconBounce 0.5s ease-out;
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.earned-currency .amount {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
}

.earned-currency.oranges .amount {
  color: #FF8C32;
}

.earned-currency.gems .amount {
  color: #9B59B6;
}

.earned-breakdown {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.breakdown-item.highlight {
  color: #FFD700;
  font-weight: 600;
}

/* Daily Reward Modal */
.daily-reward-modal {
  --background: rgba(20, 20, 35, 0.98);
}

.daily-reward-content {
  padding: 24px;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.daily-header h2 {
  color: #fff;
  margin: 0;
}

.streak-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.streak-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.streak-value {
  color: #FF6B35;
  font-size: 1.5rem;
  font-weight: 700;
}

.weekly-rewards-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

@media (max-width: 480px) {
  .weekly-rewards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.daily-reward-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
}

.daily-reward-card.today {
  border-color: #FF8C32;
  background: linear-gradient(135deg, rgba(255, 140, 50, 0.2), rgba(255, 100, 50, 0.1));
  transform: scale(1.05);
}

.daily-reward-card.claimed {
  opacity: 0.6;
}

.day-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.7rem;
  margin-bottom: 6px;
}

.reward-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.reward-icon {
  font-size: 1rem;
}

.reward-amount {
  font-weight: 600;
  color: #fff;
  font-size: 0.85rem;
}

.bonus-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 1rem;
}

.claimed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-size: 1.5rem;
  font-weight: bold;
}

.claimed-reward-display {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(56, 142, 60, 0.1));
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  animation: celebrationPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes celebrationPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.claimed-title {
  display: block;
  color: #4CAF50;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.claimed-amounts {
  display: flex;
  justify-content: center;
  gap: 16px;
  color: #fff;
  font-weight: 600;
}

.daily-actions {
  margin-top: 20px;
}

.claim-button {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 12px;
  font-weight: 600;
}

.next-reward-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.6);
}

.next-reward-timer .timer {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 4px;
}
```

### 4.2 Shop Styles
Create `src/components/Shop/Shop.css`:

```css
.shop-page {
  --background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.shop-header h1 {
  color: #fff;
  margin: 0;
  font-size: 1.5rem;
}

.category-tabs {
  --background: transparent;
  padding: 0 20px;
}

.category-tabs ion-segment-button {
  --color: rgba(255, 255, 255, 0.6);
  --color-checked: #fff;
  --indicator-color: rgba(255, 140, 50, 0.8);
  min-width: 80px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 20px;
}

.shop-item-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  position: relative;
  transition: all 0.2s ease;
}

.shop-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border-color: var(--rarity-color, rgba(255, 255, 255, 0.2));
}

.shop-item-card.owned {
  opacity: 0.7;
}

.rarity-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  background: var(--rarity-color);
  color: #000;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
}

.limited-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: #E74C3C;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 4px;
}

.item-preview {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.item-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-emoji {
  font-size: 3rem;
}

.item-info {
  text-align: center;
  margin-bottom: 12px;
}

.item-name {
  display: block;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.item-description {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  line-height: 1.3;
}

.item-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-price {
  display: flex;
  gap: 12px;
}

.price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.price.oranges {
  color: #FF8C32;
}

.price.gems {
  color: #9B59B6;
}

.buy-button {
  --background: linear-gradient(135deg, #FF8C32, #FF6420);
  --border-radius: 8px;
  font-weight: 600;
  width: 100%;
}

.owned-badge {
  color: #4CAF50;
  font-weight: 600;
  font-size: 0.9rem;
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
}
```

---

## Part 5: Integration with Games

### 5.1 Game Over Integration Hook
Create `src/hooks/useGameRewards.ts`:

```typescript
import { useCallback, useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';

interface UseGameRewardsOptions {
  gameId: string;
}

export const useGameRewards = ({ gameId }: UseGameRewardsOptions) => {
  const { earnFromGame } = useCurrency();
  const { canUserCompete } = useLeaderboard();
  const [lastReward, setLastReward] = useState<{
    oranges: number;
    gems: number;
    breakdown: any;
  } | null>(null);

  const processGameEnd = useCallback(async (
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ) => {
    // Only pass leaderboard rank if user can compete (has NFT)
    const effectiveRank = canUserCompete() ? leaderboardRank : undefined;

    const result = await earnFromGame(gameId, score, isHighScore, effectiveRank);

    if (result.success) {
      setLastReward({
        oranges: result.orangesEarned,
        gems: result.gemsEarned,
        breakdown: result.breakdown
      });
    }

    return result;
  }, [gameId, earnFromGame, canUserCompete]);

  return {
    processGameEnd,
    lastReward,
    clearLastReward: () => setLastReward(null)
  };
};
```

### 5.2 Example Game Integration
```typescript
// In OrangeStack.tsx or any game component

import { useGameRewards } from '../hooks/useGameRewards';
import { CurrencyEarnedPopup } from '../components/Currency/CurrencyEarnedPopup';

const OrangeStack: React.FC = () => {
  const { processGameEnd, lastReward, clearLastReward } = useGameRewards({
    gameId: 'orange-stack'
  });
  const [showRewardPopup, setShowRewardPopup] = useState(false);

  const handleGameOver = async (finalScore: number, isHighScore: boolean, rank?: number) => {
    // Process rewards
    const result = await processGameEnd(finalScore, isHighScore, rank);

    // Show reward popup
    if (result.success && result.orangesEarned > 0) {
      setShowRewardPopup(true);
    }

    // ... rest of game over logic
  };

  return (
    <>
      {/* Game content */}

      {/* Reward Popup */}
      {showRewardPopup && lastReward && (
        <CurrencyEarnedPopup
          oranges={lastReward.oranges}
          gems={lastReward.gems}
          breakdown={lastReward.breakdown}
          onComplete={() => {
            setShowRewardPopup(false);
            clearLastReward();
          }}
        />
      )}
    </>
  );
};
```

---

## Part 6: Backend API Endpoints (Reference)

```typescript
// Currency endpoints
GET    /api/currency                      // Get user's current balance
GET    /api/currency/transactions         // Get transaction history
POST   /api/currency/earn/game            // Earn from game completion
GET    /api/currency/daily-status         // Get daily reward status
POST   /api/currency/daily/claim          // Claim daily reward
POST   /api/currency/spend/continue       // Spend on game continue

// Shop endpoints
GET    /api/shop/items                    // Get all shop items
POST   /api/shop/purchase                 // Purchase an item
GET    /api/user/inventory                // Get user's owned items

// Achievements endpoints
GET    /api/achievements                  // Get all achievements
GET    /api/achievements/user             // Get user's achievement progress
POST   /api/achievements/:id/claim        // Claim achievement reward
```

---

## Part 7: Database Schema (Reference)

```sql
-- User currency
CREATE TABLE user_currency (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  oranges INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  lifetime_oranges INTEGER DEFAULT 0,
  lifetime_gems INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Currency transactions
CREATE TABLE currency_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(10) NOT NULL, -- 'earn' or 'spend'
  currency VARCHAR(10) NOT NULL, -- 'oranges' or 'gems'
  amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily login tracking
CREATE TABLE daily_logins (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  last_claim_date DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0
);

-- Shop items
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price_oranges INTEGER,
  price_gems INTEGER,
  preview TEXT,
  rarity VARCHAR(20) DEFAULT 'common',
  is_limited BOOLEAN DEFAULT FALSE,
  available_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User inventory
CREATE TABLE user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_id UUID NOT NULL REFERENCES shop_items(id),
  purchased_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Achievements
CREATE TABLE achievements (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50),
  requirement_type VARCHAR(50),
  requirement_game_id VARCHAR(50),
  requirement_target INTEGER,
  reward_oranges INTEGER DEFAULT 0,
  reward_gems INTEGER DEFAULT 0,
  reward_title VARCHAR(50),
  reward_badge VARCHAR(50),
  is_secret BOOLEAN DEFAULT FALSE
);

-- User achievements
CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id),
  achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  claimed_at TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);
```

---

## Implementation Checklist

- [ ] Create all currency types and interfaces
- [ ] Implement CurrencyContext with full state management
- [ ] Build CurrencyDisplay component
- [ ] Create CurrencyEarnedPopup with animations
- [ ] Build DailyRewardModal component
- [ ] Create Shop page with item grid
- [ ] Style all components with premium theme
- [ ] Implement useGameRewards hook
- [ ] Integrate currency earning with all 9 games
- [ ] Implement backend API endpoints
- [ ] Set up database tables
- [ ] Create initial shop items
- [ ] Define achievements and rewards
- [ ] Test currency earning flow
- [ ] Test daily login streak
- [ ] Test shop purchases
- [ ] Test achievement claiming

---

## Future: CAT Token Integration (Phase 2)

When ready to add blockchain support:

1. **Create Chia CAT token** for gems
2. **Implement wallet deposit/withdraw** endpoints
3. **Add on-chain balance tracking**
4. **Create token purchase flow** (fiat → gems)
5. **Implement token withdrawal** to user's wallet

This keeps the initial implementation simple while leaving a clear path for blockchain integration later.
