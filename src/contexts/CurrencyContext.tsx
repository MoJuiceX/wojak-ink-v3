/**
 * Currency Context
 *
 * Manages dual-currency economy with Oranges (soft) and Gems (hard currency).
 * Demo mode uses localStorage; production will use backend API.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type {
  UserCurrency,
  CurrencyTransaction,
  TransactionSource,
  GameRewardConfig,
  // DailyReward, // Unused - reserved for future daily rewards feature
  Achievement,
  EarnResult,
  DailyRewardResult,
  DailyRewardStatus,
  PurchaseResult,
} from '../types/currency';
import {
  GAME_REWARDS,
  DAILY_REWARDS,
  CONTINUE_COST,
} from '../types/currency';

// Storage keys
const CURRENCY_KEY = 'wojak_currency';
const DAILY_STATUS_KEY = 'wojak_daily_status';
const TRANSACTIONS_KEY = 'wojak_transactions';

interface CurrencyContextType {
  // Currency state
  currency: UserCurrency;
  isLoading: boolean;

  // Earning
  earnFromGame: (
    gameId: string,
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ) => Promise<EarnResult>;
  claimDailyReward: () => Promise<DailyRewardResult>;
  claimAchievement: (achievementId: string) => Promise<Achievement | null>;
  earnCurrency: (
    oranges: number,
    gems: number,
    source: TransactionSource,
    metadata?: Record<string, unknown>
  ) => void;

  // Spending
  purchaseItem: (itemId: string, orangesCost?: number, gemsCost?: number) => Promise<PurchaseResult>;
  useContinue: (gameId: string) => Promise<boolean>;
  spendCurrency: (oranges: number, gems: number, source: TransactionSource) => boolean;

  // Info
  getDailyRewardStatus: () => DailyRewardStatus;
  canAfford: (oranges?: number, gems?: number) => boolean;

  // Transactions
  recentTransactions: CurrencyTransaction[];
  fetchTransactionHistory: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default currency values for new users
const DEFAULT_CURRENCY: UserCurrency = {
  oranges: 100, // Starting bonus
  gems: 0,
  lifetimeOranges: 100,
  lifetimeGems: 0,
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<UserCurrency>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<CurrencyTransaction[]>([]);
  const [dailyStatus, setDailyStatus] = useState<{
    lastClaimDate: string | null;
    currentStreak: number;
  }>({ lastClaimDate: null, currentStreak: 0 });

  // Load currency data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadCurrencyData(user.id);
      loadDailyStatus(user.id);
      loadTransactions(user.id);
    } else {
      setCurrency(DEFAULT_CURRENCY);
      setDailyStatus({ lastClaimDate: null, currentStreak: 0 });
      setRecentTransactions([]);
    }
    setIsLoading(false);
  }, [user]);

  // Load currency from localStorage
  const loadCurrencyData = (userId: string) => {
    try {
      const stored = localStorage.getItem(`${CURRENCY_KEY}_${userId}`);
      if (stored) {
        setCurrency(JSON.parse(stored));
      } else {
        // New user - give starting bonus
        saveCurrencyData(userId, DEFAULT_CURRENCY);
        setCurrency(DEFAULT_CURRENCY);
      }
    } catch (error) {
      console.error('Failed to load currency data:', error);
      setCurrency(DEFAULT_CURRENCY);
    }
  };

  // Save currency to localStorage
  const saveCurrencyData = (userId: string, data: UserCurrency) => {
    try {
      localStorage.setItem(`${CURRENCY_KEY}_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save currency data:', error);
    }
  };

  // Load daily status from localStorage
  const loadDailyStatus = (userId: string) => {
    try {
      const stored = localStorage.getItem(`${DAILY_STATUS_KEY}_${userId}`);
      if (stored) {
        setDailyStatus(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load daily status:', error);
    }
  };

  // Save daily status to localStorage
  const saveDailyStatus = (userId: string, status: { lastClaimDate: string | null; currentStreak: number }) => {
    try {
      localStorage.setItem(`${DAILY_STATUS_KEY}_${userId}`, JSON.stringify(status));
    } catch (error) {
      console.error('Failed to save daily status:', error);
    }
  };

  // Load transactions from localStorage
  const loadTransactions = (userId: string) => {
    try {
      const stored = localStorage.getItem(`${TRANSACTIONS_KEY}_${userId}`);
      if (stored) {
        const transactions = JSON.parse(stored) as CurrencyTransaction[];
        setRecentTransactions(transactions.slice(0, 50)); // Keep last 50
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  // Save transaction to localStorage
  const saveTransaction = useCallback((transaction: CurrencyTransaction) => {
    if (!user) return;

    try {
      const stored = localStorage.getItem(`${TRANSACTIONS_KEY}_${user.id}`) || '[]';
      const transactions = JSON.parse(stored) as CurrencyTransaction[];
      transactions.unshift(transaction);
      const limited = transactions.slice(0, 100); // Keep last 100
      localStorage.setItem(`${TRANSACTIONS_KEY}_${user.id}`, JSON.stringify(limited));
      setRecentTransactions(limited.slice(0, 50));
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  }, [user]);

  // Calculate rewards for a game
  const calculateGameRewards = (
    config: GameRewardConfig,
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ): EarnResult['breakdown'] => {
    const base = config.baseOranges;
    let scoreBonus = Math.floor(score / config.scoreThreshold) * config.scoreMultiplier;
    const highScoreBonus = isHighScore ? config.bonusForHighScore : 0;
    let leaderboardBonus = 0;

    if (leaderboardRank && leaderboardRank <= 10) {
      leaderboardBonus = config.bonusForTop10;
    }

    // Apply cap to score bonus
    const maxScoreBonus = config.maxOrangesPerGame - base;
    scoreBonus = Math.min(scoreBonus, maxScoreBonus);

    return {
      base,
      scoreBonus,
      highScoreBonus,
      leaderboardBonus,
    };
  };

  // Earn currency from playing a game
  const earnFromGame = useCallback(async (
    gameId: string,
    score: number,
    isHighScore: boolean,
    leaderboardRank?: number
  ): Promise<EarnResult> => {
    const config = GAME_REWARDS[gameId];
    if (!config || !user) {
      return {
        success: false,
        orangesEarned: 0,
        gemsEarned: 0,
        breakdown: { base: 0, scoreBonus: 0, highScoreBonus: 0, leaderboardBonus: 0 },
      };
    }

    const breakdown = calculateGameRewards(config, score, isHighScore, leaderboardRank);
    const total = Math.min(
      breakdown.base + breakdown.scoreBonus + breakdown.highScoreBonus + breakdown.leaderboardBonus,
      config.maxOrangesPerGame
    );

    // Update currency
    const newCurrency: UserCurrency = {
      oranges: currency.oranges + total,
      gems: currency.gems,
      lifetimeOranges: currency.lifetimeOranges + total,
      lifetimeGems: currency.lifetimeGems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    // Record transaction
    const transaction: CurrencyTransaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'earn',
      currency: 'oranges',
      amount: total,
      source: 'game_score',
      metadata: { gameId, score, isHighScore, leaderboardRank },
      createdAt: new Date(),
    };
    saveTransaction(transaction);

    return {
      success: true,
      orangesEarned: total,
      gemsEarned: 0,
      breakdown,
    };
  }, [user, currency, saveTransaction]);

  // Claim daily reward
  const claimDailyReward = useCallback(async (): Promise<DailyRewardResult> => {
    if (!user) {
      throw new Error('Must be logged in to claim daily reward');
    }

    const today = new Date().toISOString().split('T')[0];

    if (dailyStatus.lastClaimDate === today) {
      throw new Error('Already claimed today');
    }

    // Check if streak continues
    let newStreak = 1;
    if (dailyStatus.lastClaimDate) {
      const lastDate = new Date(dailyStatus.lastClaimDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak = (dailyStatus.currentStreak % 7) + 1;
      }
      // If more than 1 day, streak resets to 1
    }

    // Get reward for this day
    const reward = DAILY_REWARDS[newStreak - 1];

    // Update currency
    const newCurrency: UserCurrency = {
      oranges: currency.oranges + reward.oranges,
      gems: currency.gems + reward.gems,
      lifetimeOranges: currency.lifetimeOranges + reward.oranges,
      lifetimeGems: currency.lifetimeGems + reward.gems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    // Update daily status
    const newStatus = {
      lastClaimDate: today,
      currentStreak: newStreak,
    };
    setDailyStatus(newStatus);
    saveDailyStatus(user.id, newStatus);

    // Record transactions
    if (reward.oranges > 0) {
      const orangeTransaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'earn',
        currency: 'oranges',
        amount: reward.oranges,
        source: 'daily_login',
        metadata: { day: newStreak },
        createdAt: new Date(),
      };
      saveTransaction(orangeTransaction);
    }

    if (reward.gems > 0) {
      const gemTransaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'earn',
        currency: 'gems',
        amount: reward.gems,
        source: 'daily_login',
        metadata: { day: newStreak },
        createdAt: new Date(),
      };
      saveTransaction(gemTransaction);
    }

    // Calculate time until midnight UTC
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const hoursUntilReset = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));

    return {
      success: true,
      reward: {
        oranges: reward.oranges,
        gems: reward.gems,
        bonusItem: reward.bonusItem,
      },
      currentStreak: newStreak,
      nextRewardIn: hoursUntilReset,
    };
  }, [user, currency, dailyStatus, saveTransaction]);

  // Get daily reward status
  const getDailyRewardStatus = useCallback((): DailyRewardStatus => {
    const today = new Date().toISOString().split('T')[0];
    const canClaim = dailyStatus.lastClaimDate !== today;

    // Calculate next reward based on streak
    const nextDay = canClaim
      ? ((dailyStatus.currentStreak % 7) + 1)
      : (((dailyStatus.currentStreak % 7) + 1) % 7) + 1;
    const nextReward = DAILY_REWARDS[nextDay - 1] || DAILY_REWARDS[0];

    // Calculate time until reset (midnight UTC)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);
    const timeUntilReset = midnight.getTime() - now.getTime();

    return {
      canClaim,
      currentStreak: dailyStatus.currentStreak,
      nextReward,
      timeUntilReset,
    };
  }, [dailyStatus]);

  // Claim achievement reward (placeholder)
  const claimAchievement = useCallback(async (_achievementId: string): Promise<Achievement | null> => {
    // TODO: Implement achievement system
    console.log('Achievement claiming not yet implemented');
    return null;
  }, []);

  // Generic earn currency
  const earnCurrency = useCallback((
    oranges: number,
    gems: number,
    source: TransactionSource,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    const newCurrency: UserCurrency = {
      oranges: currency.oranges + oranges,
      gems: currency.gems + gems,
      lifetimeOranges: currency.lifetimeOranges + oranges,
      lifetimeGems: currency.lifetimeGems + gems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    if (oranges > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'earn',
        currency: 'oranges',
        amount: oranges,
        source,
        metadata,
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }

    if (gems > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'earn',
        currency: 'gems',
        amount: gems,
        source,
        metadata,
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }
  }, [user, currency, saveTransaction]);

  // Purchase item from shop
  const purchaseItem = useCallback(async (
    itemId: string,
    orangesCost?: number,
    gemsCost?: number
  ): Promise<PurchaseResult> => {
    if (!user) {
      return { success: false, error: 'Must be logged in' };
    }

    if (!canAfford(orangesCost, gemsCost)) {
      return { success: false, error: 'Insufficient funds' };
    }

    const newCurrency: UserCurrency = {
      oranges: currency.oranges - (orangesCost || 0),
      gems: currency.gems - (gemsCost || 0),
      lifetimeOranges: currency.lifetimeOranges,
      lifetimeGems: currency.lifetimeGems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    // Record transactions
    if (orangesCost && orangesCost > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'spend',
        currency: 'oranges',
        amount: orangesCost,
        source: 'shop_purchase',
        metadata: { itemId },
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }

    if (gemsCost && gemsCost > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'spend',
        currency: 'gems',
        amount: gemsCost,
        source: 'shop_purchase',
        metadata: { itemId },
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }

    return { success: true, newBalance: newCurrency };
  }, [user, currency, saveTransaction]);

  // Use a continue token
  const useContinue = useCallback(async (gameId: string): Promise<boolean> => {
    if (!user || currency.oranges < CONTINUE_COST) {
      return false;
    }

    const newCurrency: UserCurrency = {
      oranges: currency.oranges - CONTINUE_COST,
      gems: currency.gems,
      lifetimeOranges: currency.lifetimeOranges,
      lifetimeGems: currency.lifetimeGems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    const transaction: CurrencyTransaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      type: 'spend',
      currency: 'oranges',
      amount: CONTINUE_COST,
      source: 'continue_game',
      metadata: { gameId },
      createdAt: new Date(),
    };
    saveTransaction(transaction);

    return true;
  }, [user, currency, saveTransaction]);

  // Generic spend currency
  const spendCurrency = useCallback((
    oranges: number,
    gems: number,
    source: TransactionSource
  ): boolean => {
    if (!user || !canAfford(oranges, gems)) {
      return false;
    }

    const newCurrency: UserCurrency = {
      oranges: currency.oranges - oranges,
      gems: currency.gems - gems,
      lifetimeOranges: currency.lifetimeOranges,
      lifetimeGems: currency.lifetimeGems,
    };

    setCurrency(newCurrency);
    saveCurrencyData(user.id, newCurrency);

    if (oranges > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'spend',
        currency: 'oranges',
        amount: oranges,
        source,
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }

    if (gems > 0) {
      const transaction: CurrencyTransaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        type: 'spend',
        currency: 'gems',
        amount: gems,
        source,
        createdAt: new Date(),
      };
      saveTransaction(transaction);
    }

    return true;
  }, [user, currency, saveTransaction]);

  // Check if user can afford something
  const canAfford = useCallback((oranges?: number, gems?: number): boolean => {
    if (oranges && currency.oranges < oranges) return false;
    if (gems && currency.gems < gems) return false;
    return true;
  }, [currency]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(() => {
    if (user) {
      loadTransactions(user.id);
    }
  }, [user]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        isLoading,
        earnFromGame,
        claimDailyReward,
        claimAchievement,
        earnCurrency,
        purchaseItem,
        useContinue,
        spendCurrency,
        getDailyRewardStatus,
        canAfford,
        recentTransactions,
        fetchTransactionHistory,
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

// Safe version that returns null instead of throwing
export const useCurrencySafe = () => {
  return useContext(CurrencyContext);
};

// Export the context for direct access
export { CurrencyContext };

// Hook to format currency for display
export const useFormatCurrency = () => {
  return useCallback((num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  }, []);
};
