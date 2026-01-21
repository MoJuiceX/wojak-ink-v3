# SPEC 07: Daily Challenges System

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Implement a daily challenges system with 3 fixed challenges that reset at midnight UTC. Players earn oranges for completing individual challenges, plus a 50% bonus for completing ALL three.

**Challenge Set (Fixed Daily):**
1. **Easy (35 🍊)**: Play 5 games
2. **Medium (52 🍊)**: Set a new personal best in any game
3. **Hard (70 🍊)**: Play for 10 minutes total

**Completion Bonus**: Complete all 3 = +78 🍊 (50% of 157)
**Daily Maximum**: 235 oranges from challenges

> **Note**: Rewards reduced by 30% for economic sustainability. Future crypto conversion: 10,000 oranges = 1 HOA token.

---

## Challenge Types Definition

### Type 1: Play X Games
- **Target**: 5 games
- **Tracking**: Count of games completed (not started)
- **Progress**: Shows "3/5 games played"
- **Any game counts**: orange-stack, memory-match, etc.

### Type 2: Set Personal Best
- **Target**: 1 new personal best
- **Tracking**: Boolean - did they beat their best score in ANY game today?
- **Progress**: Shows "0/1 personal best" or "1/1 personal best"
- **Resets daily**: Even if they set one yesterday, need a new one today

### Type 3: Play Time
- **Target**: 10 minutes (600 seconds)
- **Tracking**: Cumulative active play time
- **Progress**: Shows "4:32 / 10:00" or "45%"
- **Pause handling**: Only count active gameplay, not pause screens

---

## Files to Create

### 1. Challenge Types
**File: `src/types/challenges.ts`**

```typescript
/**
 * Daily Challenges System Types
 */

export type ChallengeType = 'games_played' | 'personal_best' | 'play_time';

export interface DailyChallenge {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  icon: string;
  target: number;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeProgress {
  challengeId: string;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: string;
  claimedAt?: string;
}

export interface DailyChallengesState {
  date: string; // ISO date string (YYYY-MM-DD)
  challenges: ChallengeProgress[];
  allCompletedBonusClaimed: boolean;
  totalEarnedToday: number;
}

// The 3 fixed daily challenges (rewards reduced 30% for sustainability)
export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'games-played-5',
    type: 'games_played',
    name: 'Active Player',
    description: 'Play 5 games',
    icon: '🎮',
    target: 5,
    reward: 35, // Reduced from 50
    difficulty: 'easy',
  },
  {
    id: 'personal-best-1',
    type: 'personal_best',
    name: 'Beat Yourself',
    description: 'Set a new personal best',
    icon: '🏆',
    target: 1,
    reward: 52, // Reduced from 75
    difficulty: 'medium',
  },
  {
    id: 'play-time-600',
    type: 'play_time',
    name: 'Dedicated Gamer',
    description: 'Play for 10 minutes',
    icon: '⏱️',
    target: 600, // seconds
    reward: 70, // Reduced from 100
    difficulty: 'hard',
  },
];

// Bonus for completing all challenges
export const ALL_CHALLENGES_BONUS_PERCENT = 0.5; // 50%

// Calculate total possible rewards
export const TOTAL_CHALLENGE_REWARDS = DAILY_CHALLENGES.reduce(
  (sum, c) => sum + c.reward,
  0
);
export const ALL_CHALLENGES_BONUS = Math.floor(
  TOTAL_CHALLENGE_REWARDS * ALL_CHALLENGES_BONUS_PERCENT
);
export const MAX_DAILY_CHALLENGE_EARNINGS =
  TOTAL_CHALLENGE_REWARDS + ALL_CHALLENGES_BONUS;

// Helper to format play time
export function formatPlayTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 2. Daily Challenges Context
**File: `src/contexts/DailyChallengesContext.tsx`**

```typescript
/**
 * Daily Challenges Context
 *
 * Manages daily challenge progress, completion tracking, and rewards.
 * Resets at midnight UTC.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';
import {
  DAILY_CHALLENGES,
  ALL_CHALLENGES_BONUS,
  formatPlayTime,
  type DailyChallengesState,
  type ChallengeProgress,
  type ChallengeType,
} from '../types/challenges';

const STORAGE_KEY = 'wojak_daily_challenges';

interface DailyChallengesContextType {
  // State
  challenges: ChallengeProgress[];
  isLoading: boolean;

  // Progress tracking
  recordGamePlayed: (gameId: string) => void;
  recordPersonalBest: (gameId: string, score: number) => void;
  recordPlayTime: (seconds: number) => void;

  // Rewards
  claimChallengeReward: (challengeId: string) => Promise<boolean>;
  claimAllCompletedBonus: () => Promise<boolean>;

  // Info
  getChallengeProgress: (challengeId: string) => ChallengeProgress | undefined;
  getProgressDisplay: (challengeId: string) => string;
  areAllChallengesCompleted: () => boolean;
  canClaimAllBonus: () => boolean;
  getTimeUntilReset: () => number;

  // Play time tracking
  startPlayTimeTracking: () => void;
  stopPlayTimeTracking: () => void;
  isTrackingPlayTime: boolean;
}

const DailyChallengesContext = createContext<
  DailyChallengesContextType | undefined
>(undefined);

// Get today's date in UTC (YYYY-MM-DD)
function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

// Get milliseconds until midnight UTC
function getTimeUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// Initialize empty progress for all challenges
function initializeChallengeProgress(): ChallengeProgress[] {
  return DAILY_CHALLENGES.map((challenge) => ({
    challengeId: challenge.id,
    currentProgress: 0,
    isCompleted: false,
  }));
}

export const DailyChallengesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { earnCurrency } = useCurrency();
  const [state, setState] = useState<DailyChallengesState>({
    date: getTodayUTC(),
    challenges: initializeChallengeProgress(),
    allCompletedBonusClaimed: false,
    totalEarnedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingPlayTime, setIsTrackingPlayTime] = useState(false);
  const playTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage
  useEffect(() => {
    if (user) {
      loadState(user.id);
    } else {
      setState({
        date: getTodayUTC(),
        challenges: initializeChallengeProgress(),
        allCompletedBonusClaimed: false,
        totalEarnedToday: 0,
      });
    }
    setIsLoading(false);
  }, [user]);

  // Check for day rollover
  useEffect(() => {
    const checkDayRollover = () => {
      const today = getTodayUTC();
      if (state.date !== today) {
        // New day - reset challenges
        const newState: DailyChallengesState = {
          date: today,
          challenges: initializeChallengeProgress(),
          allCompletedBonusClaimed: false,
          totalEarnedToday: 0,
        };
        setState(newState);
        if (user) {
          saveState(user.id, newState);
        }
      }
    };

    // Check immediately
    checkDayRollover();

    // Check every minute
    const interval = setInterval(checkDayRollover, 60000);

    return () => clearInterval(interval);
  }, [state.date, user]);

  const loadState = (userId: string) => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        const parsed: DailyChallengesState = JSON.parse(stored);

        // Check if it's a new day
        if (parsed.date !== getTodayUTC()) {
          // Reset for new day
          const newState: DailyChallengesState = {
            date: getTodayUTC(),
            challenges: initializeChallengeProgress(),
            allCompletedBonusClaimed: false,
            totalEarnedToday: 0,
          };
          setState(newState);
          saveState(userId, newState);
        } else {
          setState(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load daily challenges state:', error);
    }
  };

  const saveState = (userId: string, newState: DailyChallengesState) => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save daily challenges state:', error);
    }
  };

  // Update challenge progress
  const updateProgress = useCallback(
    (challengeId: string, newProgress: number) => {
      if (!user) return;

      setState((prev) => {
        const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
        if (!challenge) return prev;

        const challenges = prev.challenges.map((cp) => {
          if (cp.challengeId !== challengeId) return cp;
          if (cp.isCompleted) return cp; // Already completed

          const clampedProgress = Math.min(newProgress, challenge.target);
          const isNowCompleted = clampedProgress >= challenge.target;

          return {
            ...cp,
            currentProgress: clampedProgress,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        });

        const newState = { ...prev, challenges };
        saveState(user.id, newState);
        return newState;
      });
    },
    [user]
  );

  // Record a game played
  const recordGamePlayed = useCallback(
    (gameId: string) => {
      const progress = state.challenges.find(
        (c) => c.challengeId === 'games-played-5'
      );
      if (progress && !progress.isCompleted) {
        updateProgress('games-played-5', progress.currentProgress + 1);
      }
    },
    [state.challenges, updateProgress]
  );

  // Record a personal best
  const recordPersonalBest = useCallback(
    (gameId: string, score: number) => {
      const progress = state.challenges.find(
        (c) => c.challengeId === 'personal-best-1'
      );
      if (progress && !progress.isCompleted) {
        updateProgress('personal-best-1', 1);
      }
    },
    [state.challenges, updateProgress]
  );

  // Record play time (in seconds)
  const recordPlayTime = useCallback(
    (seconds: number) => {
      const progress = state.challenges.find(
        (c) => c.challengeId === 'play-time-600'
      );
      if (progress && !progress.isCompleted) {
        updateProgress('play-time-600', progress.currentProgress + seconds);
      }
    },
    [state.challenges, updateProgress]
  );

  // Start tracking play time
  const startPlayTimeTracking = useCallback(() => {
    if (isTrackingPlayTime) return;

    setIsTrackingPlayTime(true);
    playTimeIntervalRef.current = setInterval(() => {
      recordPlayTime(1); // Add 1 second every second
    }, 1000);
  }, [isTrackingPlayTime, recordPlayTime]);

  // Stop tracking play time
  const stopPlayTimeTracking = useCallback(() => {
    if (playTimeIntervalRef.current) {
      clearInterval(playTimeIntervalRef.current);
      playTimeIntervalRef.current = null;
    }
    setIsTrackingPlayTime(false);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playTimeIntervalRef.current) {
        clearInterval(playTimeIntervalRef.current);
      }
    };
  }, []);

  // Claim reward for a specific challenge
  const claimChallengeReward = useCallback(
    async (challengeId: string): Promise<boolean> => {
      if (!user) return false;

      const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
      const progress = state.challenges.find((c) => c.challengeId === challengeId);

      if (!challenge || !progress) return false;
      if (!progress.isCompleted || progress.claimedAt) return false;

      // Award the reward
      earnCurrency(challenge.reward, 0, 'achievement', {
        type: 'daily_challenge',
        challengeId,
      });

      // Mark as claimed
      setState((prev) => {
        const challenges = prev.challenges.map((cp) =>
          cp.challengeId === challengeId
            ? { ...cp, claimedAt: new Date().toISOString() }
            : cp
        );
        const newState = {
          ...prev,
          challenges,
          totalEarnedToday: prev.totalEarnedToday + challenge.reward,
        };
        saveState(user.id, newState);
        return newState;
      });

      return true;
    },
    [user, state.challenges, earnCurrency]
  );

  // Claim the all-completed bonus
  const claimAllCompletedBonus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (!areAllChallengesCompleted()) return false;
    if (state.allCompletedBonusClaimed) return false;

    // Check all individual rewards are claimed
    const allClaimed = state.challenges.every((c) => c.claimedAt);
    if (!allClaimed) return false;

    // Award the bonus
    earnCurrency(ALL_CHALLENGES_BONUS, 0, 'achievement', {
      type: 'daily_challenge_bonus',
    });

    // Mark bonus as claimed
    setState((prev) => {
      const newState = {
        ...prev,
        allCompletedBonusClaimed: true,
        totalEarnedToday: prev.totalEarnedToday + ALL_CHALLENGES_BONUS,
      };
      saveState(user.id, newState);
      return newState;
    });

    return true;
  }, [user, state, earnCurrency]);

  // Get progress for a specific challenge
  const getChallengeProgress = useCallback(
    (challengeId: string): ChallengeProgress | undefined => {
      return state.challenges.find((c) => c.challengeId === challengeId);
    },
    [state.challenges]
  );

  // Get display string for progress
  const getProgressDisplay = useCallback(
    (challengeId: string): string => {
      const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
      const progress = getChallengeProgress(challengeId);

      if (!challenge || !progress) return '';

      if (challenge.type === 'play_time') {
        return `${formatPlayTime(progress.currentProgress)} / ${formatPlayTime(challenge.target)}`;
      }

      return `${progress.currentProgress} / ${challenge.target}`;
    },
    [getChallengeProgress]
  );

  // Check if all challenges are completed
  const areAllChallengesCompleted = useCallback((): boolean => {
    return state.challenges.every((c) => c.isCompleted);
  }, [state.challenges]);

  // Check if can claim all-completed bonus
  const canClaimAllBonus = useCallback((): boolean => {
    if (state.allCompletedBonusClaimed) return false;
    if (!areAllChallengesCompleted()) return false;
    return state.challenges.every((c) => c.claimedAt);
  }, [state, areAllChallengesCompleted]);

  // Get time until reset
  const getTimeUntilReset = useCallback((): number => {
    return getTimeUntilMidnightUTC();
  }, []);

  return (
    <DailyChallengesContext.Provider
      value={{
        challenges: state.challenges,
        isLoading,
        recordGamePlayed,
        recordPersonalBest,
        recordPlayTime,
        claimChallengeReward,
        claimAllCompletedBonus,
        getChallengeProgress,
        getProgressDisplay,
        areAllChallengesCompleted,
        canClaimAllBonus,
        getTimeUntilReset,
        startPlayTimeTracking,
        stopPlayTimeTracking,
        isTrackingPlayTime,
      }}
    >
      {children}
    </DailyChallengesContext.Provider>
  );
};

export const useDailyChallenges = () => {
  const context = useContext(DailyChallengesContext);
  if (!context) {
    throw new Error(
      'useDailyChallenges must be used within DailyChallengesProvider'
    );
  }
  return context;
};
```

### 3. Daily Challenges Card Component
**File: `src/components/DailyChallenges/DailyChallengesCard.tsx`**

```typescript
/**
 * Daily Challenges Card Component
 *
 * Displays all 3 daily challenges with progress and claim buttons.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyChallenges } from '../../contexts/DailyChallengesContext';
import {
  DAILY_CHALLENGES,
  ALL_CHALLENGES_BONUS,
  formatPlayTime,
} from '../../types/challenges';
import './DailyChallenges.css';

interface DailyChallengesCardProps {
  compact?: boolean;
}

export function DailyChallengesCard({ compact = false }: DailyChallengesCardProps) {
  const {
    challenges,
    getChallengeProgress,
    getProgressDisplay,
    claimChallengeReward,
    claimAllCompletedBonus,
    areAllChallengesCompleted,
    canClaimAllBonus,
    getTimeUntilReset,
  } = useDailyChallenges();

  const [timeUntilReset, setTimeUntilReset] = useState(getTimeUntilReset());
  const [claiming, setClaiming] = useState<string | null>(null);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(getTimeUntilReset());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [getTimeUntilReset]);

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleClaimChallenge = async (challengeId: string) => {
    setClaiming(challengeId);
    await claimChallengeReward(challengeId);
    setClaiming(null);
  };

  const handleClaimBonus = async () => {
    setClaiming('bonus');
    await claimAllCompletedBonus();
    setClaiming(null);
  };

  const allCompleted = areAllChallengesCompleted();
  const canClaim = canClaimAllBonus();

  return (
    <div className={`daily-challenges-card ${compact ? 'compact' : ''}`}>
      <div className="challenges-header">
        <h3>Daily Challenges</h3>
        <span className="reset-timer">
          Resets in {formatTimeRemaining(timeUntilReset)}
        </span>
      </div>

      <div className="challenges-list">
        {DAILY_CHALLENGES.map((challenge) => {
          const progress = getChallengeProgress(challenge.id);
          if (!progress) return null;

          const progressPercent = Math.min(
            (progress.currentProgress / challenge.target) * 100,
            100
          );
          const canClaimThis = progress.isCompleted && !progress.claimedAt;
          const isClaimed = !!progress.claimedAt;

          return (
            <div
              key={challenge.id}
              className={`challenge-item difficulty-${challenge.difficulty} ${
                isClaimed ? 'claimed' : ''
              }`}
            >
              <div className="challenge-icon">{challenge.icon}</div>

              <div className="challenge-info">
                <div className="challenge-name">{challenge.name}</div>
                <div className="challenge-description">
                  {challenge.description}
                </div>

                <div className="challenge-progress">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="progress-text">
                    {getProgressDisplay(challenge.id)}
                  </span>
                </div>
              </div>

              <div className="challenge-reward">
                {isClaimed ? (
                  <span className="claimed-badge">✓</span>
                ) : canClaimThis ? (
                  <button
                    className="claim-button"
                    onClick={() => handleClaimChallenge(challenge.id)}
                    disabled={claiming === challenge.id}
                  >
                    {claiming === challenge.id ? '...' : `+${challenge.reward} 🍊`}
                  </button>
                ) : (
                  <span className="reward-preview">+{challenge.reward} 🍊</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Completed Bonus */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            className={`all-completed-bonus ${canClaim ? 'can-claim' : 'claimed'}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bonus-info">
              <span className="bonus-icon">🎉</span>
              <span className="bonus-text">All Challenges Complete!</span>
            </div>
            {canClaim ? (
              <button
                className="claim-bonus-button"
                onClick={handleClaimBonus}
                disabled={claiming === 'bonus'}
              >
                {claiming === 'bonus' ? '...' : `Claim +${ALL_CHALLENGES_BONUS} 🍊`}
              </button>
            ) : (
              <span className="bonus-claimed">+{ALL_CHALLENGES_BONUS} 🍊 ✓</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DailyChallengesCard;
```

### 4. Daily Challenges Styles
**File: `src/components/DailyChallenges/DailyChallenges.css`**

```css
/**
 * Daily Challenges Styles
 */

.daily-challenges-card {
  background: var(--color-surface, #1a1a2e);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--color-border, #2a2a4e);
}

.challenges-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.challenges-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text, #fff);
}

.reset-timer {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #888);
  background: var(--color-background, #0d0d1a);
  padding: 4px 8px;
  border-radius: 4px;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-background, #0d0d1a);
  border-radius: 8px;
  border-left: 3px solid var(--difficulty-color);
  transition: opacity 0.2s ease;
}

.challenge-item.claimed {
  opacity: 0.6;
}

.challenge-item.difficulty-easy {
  --difficulty-color: #4CAF50;
}

.challenge-item.difficulty-medium {
  --difficulty-color: #FFA726;
}

.challenge-item.difficulty-hard {
  --difficulty-color: #EF5350;
}

.challenge-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface, #1a1a2e);
  border-radius: 8px;
}

.challenge-info {
  flex: 1;
  min-width: 0;
}

.challenge-name {
  font-weight: 600;
  color: var(--color-text, #fff);
  font-size: 0.95rem;
}

.challenge-description {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #888);
  margin-bottom: 8px;
}

.challenge-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-surface, #1a1a2e);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFA500, #FFD700);
  border-radius: 3px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #888);
  min-width: 60px;
  text-align: right;
}

.challenge-reward {
  display: flex;
  align-items: center;
  min-width: 80px;
  justify-content: flex-end;
}

.reward-preview {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
}

.claim-button {
  background: linear-gradient(135deg, #FFA500, #FF8C00);
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.claim-button:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(255, 165, 0, 0.4);
}

.claim-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.claimed-badge {
  color: #4CAF50;
  font-size: 1.2rem;
  font-weight: bold;
}

/* All Completed Bonus */
.all-completed-bonus {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonus-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bonus-icon {
  font-size: 1.5rem;
}

.bonus-text {
  font-weight: 600;
  color: #FFD700;
}

.claim-bonus-button {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: #000;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.claim-bonus-button:hover {
  transform: scale(1.05);
}

.bonus-claimed {
  color: #4CAF50;
  font-weight: 600;
}

/* Compact mode */
.daily-challenges-card.compact .challenge-item {
  padding: 8px;
}

.daily-challenges-card.compact .challenge-icon {
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
}

.daily-challenges-card.compact .challenge-description {
  display: none;
}
```

### 5. Export Index
**File: `src/components/DailyChallenges/index.ts`**

```typescript
export { DailyChallengesCard } from './DailyChallengesCard';
```

---

## Integration Points

### 1. Add Provider to App
**File: `src/App.tsx`**

```typescript
import { DailyChallengesProvider } from './contexts/DailyChallengesContext';

// Wrap with provider (inside AuthProvider and CurrencyProvider)
<DailyChallengesProvider>
  {/* ... app content ... */}
</DailyChallengesProvider>
```

### 2. Track Game Completion
**File: `src/hooks/useGameSession.ts`** (or wherever game completion is handled)

```typescript
import { useDailyChallenges } from '../contexts/DailyChallengesContext';

// In the hook:
const { recordGamePlayed, recordPersonalBest, startPlayTimeTracking, stopPlayTimeTracking } = useDailyChallenges();

// When game starts:
startPlayTimeTracking();

// When game ends:
stopPlayTimeTracking();
recordGamePlayed(gameId);

// If it's a new personal best:
if (isNewHighScore) {
  recordPersonalBest(gameId, score);
}
```

### 3. Add to Account Dashboard
**File: `src/pages/Account.tsx`**

```typescript
import { DailyChallengesCard } from '../components/DailyChallenges';

// In the JSX:
<section className="account-section">
  <DailyChallengesCard />
</section>
```

### 4. Add Mini Widget to Header or Sidebar
**File: `src/components/layout/Header.tsx`**

```typescript
import { useDailyChallenges } from '../../contexts/DailyChallengesContext';

// Display progress indicator
const { challenges, areAllChallengesCompleted } = useDailyChallenges();
const completedCount = challenges.filter(c => c.isCompleted).length;

// In JSX:
<div className="daily-progress-mini">
  <span>Daily: {completedCount}/3</span>
  {areAllChallengesCompleted() && <span>🎉</span>}
</div>
```

---

## Testing Checklist

- [ ] Challenges reset at midnight UTC
- [ ] "Play 5 games" tracks correctly
- [ ] "Set personal best" triggers on new high score
- [ ] "Play 10 minutes" accumulates time correctly
- [ ] Play time only counts active gameplay
- [ ] Individual challenge rewards can be claimed
- [ ] All-completed bonus can only be claimed after all individual rewards
- [ ] Progress persists across page refreshes
- [ ] Progress resets on new day
- [ ] Countdown timer shows correct time until reset
- [ ] Claimed challenges show checkmark
- [ ] Progress bars animate smoothly
- [ ] Compact mode displays correctly
- [ ] Currency is awarded correctly via earnCurrency
