# SPEC 08: Leaderboard Rewards System

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Implement automatic leaderboard rewards that pay out oranges to top players on a daily, weekly, and monthly basis. Each of the 15 games has its own leaderboard with separate rewards.

**Reward Structure (per game) - Reduced 30% for sustainability:**

| Period | #1 | #2 | #3 | #4-10 | #11-50 |
|--------|-----|-----|-----|-------|--------|
| Daily | 17 🍊 | 10 🍊 | 3 🍊 | 7 🍊 each | 2 🍊 each |
| Weekly | 350 🍊 | 210 🍊 | 105 🍊 | - | - |
| Monthly | 1400 🍊 | 700 🍊 | 350 🍊 | - | - |

> **Note**: Future crypto conversion: 10,000 oranges = 1 HOA token (~$0.00143)

**Leaderboard Reset**: Fresh start each period (daily/weekly/monthly boards reset completely)

**Payout Timing**:
- Daily: 00:00 UTC
- Weekly: Sunday 00:00 UTC
- Monthly: 1st of month 00:00 UTC

---

## Database Schema

### 1. Period Leaderboards Table
**Migration: `migrations/007_period_leaderboards.sql`**

```sql
-- Period-specific leaderboards (daily, weekly, monthly)
CREATE TABLE IF NOT EXISTS period_leaderboard_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_key TEXT NOT NULL, -- '2026-01-21' for daily, '2026-W03' for weekly, '2026-01' for monthly
  score INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 1,
  best_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, game_id, period_type, period_key)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_period_scores_lookup
  ON period_leaderboard_scores(game_id, period_type, period_key, score DESC);

CREATE INDEX IF NOT EXISTS idx_period_scores_user
  ON period_leaderboard_scores(user_id, period_type, period_key);

-- Reward payouts history
CREATE TABLE IF NOT EXISTS leaderboard_payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  period_type TEXT NOT NULL,
  period_key TEXT NOT NULL,
  rank INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  paid_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, game_id, period_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_payouts_user ON leaderboard_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_period ON leaderboard_payouts(period_type, period_key);
```

---

## Reward Configuration

### File: `src/types/leaderboardRewards.ts`

```typescript
/**
 * Leaderboard Rewards Configuration
 */

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface RewardTier {
  minRank: number;
  maxRank: number;
  reward: number;
}

export interface PeriodRewardConfig {
  periodType: PeriodType;
  tiers: RewardTier[];
  resetTime: string; // Description of reset time
}

// Daily rewards: Top 3, Top 10, Top 50 (reduced 30% for sustainability)
export const DAILY_REWARDS: RewardTier[] = [
  { minRank: 1, maxRank: 1, reward: 17 },  // Was 25
  { minRank: 2, maxRank: 2, reward: 10 },  // Was 15
  { minRank: 3, maxRank: 3, reward: 3 },   // Was 5
  { minRank: 4, maxRank: 10, reward: 7 },  // Was 10
  { minRank: 11, maxRank: 50, reward: 2 }, // Was 3
];

// Weekly rewards: Top 3 only (reduced 30% for sustainability)
export const WEEKLY_REWARDS: RewardTier[] = [
  { minRank: 1, maxRank: 1, reward: 350 }, // Was 500
  { minRank: 2, maxRank: 2, reward: 210 }, // Was 300
  { minRank: 3, maxRank: 3, reward: 105 }, // Was 150
];

// Monthly rewards: Top 3 only (reduced 30% for sustainability)
export const MONTHLY_REWARDS: RewardTier[] = [
  { minRank: 1, maxRank: 1, reward: 1400 }, // Was 2000
  { minRank: 2, maxRank: 2, reward: 700 },  // Was 1000
  { minRank: 3, maxRank: 3, reward: 350 },  // Was 500
];

export const PERIOD_CONFIGS: Record<PeriodType, PeriodRewardConfig> = {
  daily: {
    periodType: 'daily',
    tiers: DAILY_REWARDS,
    resetTime: '00:00 UTC',
  },
  weekly: {
    periodType: 'weekly',
    tiers: WEEKLY_REWARDS,
    resetTime: 'Sunday 00:00 UTC',
  },
  monthly: {
    periodType: 'monthly',
    tiers: MONTHLY_REWARDS,
    resetTime: '1st of month 00:00 UTC',
  },
};

// Helper to get reward for a rank
export function getRewardForRank(
  periodType: PeriodType,
  rank: number
): number {
  const config = PERIOD_CONFIGS[periodType];
  const tier = config.tiers.find(
    (t) => rank >= t.minRank && rank <= t.maxRank
  );
  return tier?.reward || 0;
}

// Helper to get current period key
export function getCurrentPeriodKey(periodType: PeriodType): string {
  const now = new Date();

  switch (periodType) {
    case 'daily':
      return now.toISOString().split('T')[0]; // 2026-01-21

    case 'weekly':
      // Get ISO week number
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`; // 2026-W03

    case 'monthly':
      return `${now.getUTCFullYear()}-${(now.getUTCMonth() + 1).toString().padStart(2, '0')}`; // 2026-01

    default:
      throw new Error(`Unknown period type: ${periodType}`);
  }
}

// Helper to get previous period key (for payouts)
export function getPreviousPeriodKey(periodType: PeriodType): string {
  const now = new Date();

  switch (periodType) {
    case 'daily':
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      return yesterday.toISOString().split('T')[0];

    case 'weekly':
      const lastWeek = new Date(now);
      lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
      return getCurrentPeriodKey('weekly'); // Recursively get that week's key

    case 'monthly':
      const lastMonth = new Date(now);
      lastMonth.setUTCMonth(lastMonth.getUTCMonth() - 1);
      return `${lastMonth.getUTCFullYear()}-${(lastMonth.getUTCMonth() + 1).toString().padStart(2, '0')}`;

    default:
      throw new Error(`Unknown period type: ${periodType}`);
  }
}

// List of all game IDs
export const GAME_IDS = [
  'orange-stack',
  'memory-match',
  'orange-pong',
  'wojak-runner',
  'orange-juggle',
  'knife-game',
  'color-reaction',
  'merge-2048',
  'orange-wordle',
  'block-puzzle',
  'flappy-orange',
  'citrus-drop',
  'orange-snake',
  'brick-breaker',
  'wojak-whack',
];
```

---

## API Endpoints

### 1. Submit Score to Period Leaderboards
**File: `functions/api/leaderboard/submit.ts`** (UPDATE existing)

Add period leaderboard tracking when a score is submitted:

```typescript
import { Env } from '../types';
import { getCurrentPeriodKey } from '../../src/types/leaderboardRewards';

// After saving to main leaderboard_scores, also save to period leaderboards

async function updatePeriodLeaderboards(
  env: Env,
  userId: string,
  gameId: string,
  score: number
) {
  const periods: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

  for (const periodType of periods) {
    const periodKey = getCurrentPeriodKey(periodType);

    // Upsert: Update if exists, insert if not
    // We track best score for the period
    const query = `
      INSERT INTO period_leaderboard_scores
        (user_id, game_id, period_type, period_key, score, best_score, games_played)
      VALUES (?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(user_id, game_id, period_type, period_key)
      DO UPDATE SET
        score = score + excluded.score,
        best_score = MAX(best_score, excluded.best_score),
        games_played = games_played + 1,
        updated_at = CURRENT_TIMESTAMP
    `;

    await env.DB.prepare(query)
      .bind(userId, gameId, periodType, periodKey, score, score)
      .run();
  }
}

// Call this in the POST handler after saving main score:
await updatePeriodLeaderboards(env, userId, gameId, score);
```

### 2. Get Period Leaderboard
**File: `functions/api/leaderboard/period/[gameId].ts`** (NEW)

```typescript
import { Env } from '../../types';
import { getCurrentPeriodKey, PeriodType } from '../../../src/types/leaderboardRewards';

interface PeriodLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: 'default' | 'user' | 'wallet';
  };
  ownsNft: boolean;
  bestScore: number;
  gamesPlayed: number;
}

interface PeriodLeaderboardResponse {
  gameId: string;
  periodType: PeriodType;
  periodKey: string;
  entries: PeriodLeaderboardEntry[];
  userRank?: number;
  userEntry?: PeriodLeaderboardEntry;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env, request } = context;
  const gameId = params.gameId as string;

  const url = new URL(request.url);
  const periodType = (url.searchParams.get('period') || 'daily') as PeriodType;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  // Validate period type
  if (!['daily', 'weekly', 'monthly'].includes(periodType)) {
    return new Response(JSON.stringify({ error: 'Invalid period type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const periodKey = getCurrentPeriodKey(periodType);

  try {
    const query = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY ps.best_score DESC, ps.updated_at ASC) as rank,
        ps.user_id,
        ps.best_score,
        ps.games_played,
        COALESCE(p.display_name, 'Player') as display_name,
        COALESCE(p.avatar_type, 'emoji') as avatar_type,
        COALESCE(p.avatar_value, '🎮') as avatar_value,
        COALESCE(p.avatar_source, 'default') as avatar_source,
        COALESCE(p.owns_nft, 0) as owns_nft
      FROM period_leaderboard_scores ps
      LEFT JOIN profiles p ON ps.user_id = p.user_id
      WHERE ps.game_id = ? AND ps.period_type = ? AND ps.period_key = ?
      ORDER BY ps.best_score DESC, ps.updated_at ASC
      LIMIT ?
    `;

    const results = await env.DB.prepare(query)
      .bind(gameId, periodType, periodKey, limit)
      .all();

    const entries: PeriodLeaderboardEntry[] = (results.results || []).map(
      (row: any) => ({
        rank: row.rank,
        userId: row.user_id,
        displayName: row.display_name,
        avatar: {
          type: row.avatar_type,
          value: row.avatar_value,
          source: row.avatar_source,
        },
        ownsNft: Boolean(row.owns_nft),
        bestScore: row.best_score,
        gamesPlayed: row.games_played,
      })
    );

    const response: PeriodLeaderboardResponse = {
      gameId,
      periodType,
      periodKey,
      entries,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('[Period Leaderboard API] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 3. Process Payouts (Scheduled Worker)
**File: `functions/scheduled/process-leaderboard-payouts.ts`** (NEW)

This runs as a Cloudflare scheduled worker (cron trigger):

```typescript
import { Env } from '../types';
import {
  PERIOD_CONFIGS,
  getPreviousPeriodKey,
  getRewardForRank,
  GAME_IDS,
  PeriodType,
} from '../../src/types/leaderboardRewards';

interface Payout {
  userId: string;
  gameId: string;
  periodType: PeriodType;
  periodKey: string;
  rank: number;
  reward: number;
}

export async function processPayouts(
  env: Env,
  periodType: PeriodType
): Promise<Payout[]> {
  const periodKey = getPreviousPeriodKey(periodType);
  const config = PERIOD_CONFIGS[periodType];
  const maxRank = Math.max(...config.tiers.map((t) => t.maxRank));
  const payouts: Payout[] = [];

  for (const gameId of GAME_IDS) {
    // Get top players for this game/period
    const query = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY best_score DESC, updated_at ASC) as rank,
        user_id
      FROM period_leaderboard_scores
      WHERE game_id = ? AND period_type = ? AND period_key = ?
      ORDER BY best_score DESC, updated_at ASC
      LIMIT ?
    `;

    const results = await env.DB.prepare(query)
      .bind(gameId, periodType, periodKey, maxRank)
      .all();

    for (const row of results.results || []) {
      const rank = row.rank as number;
      const userId = row.user_id as string;
      const reward = getRewardForRank(periodType, rank);

      if (reward > 0) {
        // Check if already paid
        const existingPayout = await env.DB.prepare(`
          SELECT id FROM leaderboard_payouts
          WHERE user_id = ? AND game_id = ? AND period_type = ? AND period_key = ?
        `)
          .bind(userId, gameId, periodType, periodKey)
          .first();

        if (!existingPayout) {
          // Record payout
          await env.DB.prepare(`
            INSERT INTO leaderboard_payouts
              (user_id, game_id, period_type, period_key, rank, reward_amount)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
            .bind(userId, gameId, periodType, periodKey, rank, reward)
            .run();

          // Add to user's currency
          await env.DB.prepare(`
            UPDATE profiles
            SET oranges = COALESCE(oranges, 0) + ?,
                lifetime_oranges = COALESCE(lifetime_oranges, 0) + ?
            WHERE user_id = ?
          `)
            .bind(reward, reward, userId)
            .run();

          payouts.push({
            userId,
            gameId,
            periodType,
            periodKey,
            rank,
            reward,
          });
        }
      }
    }
  }

  return payouts;
}

// Scheduled handler (called by Cloudflare cron)
export async function scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
) {
  const now = new Date();
  const hour = now.getUTCHours();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const dayOfMonth = now.getUTCDate();

  // Process daily payouts at midnight UTC
  if (hour === 0) {
    console.log('[Payout] Processing daily payouts...');
    const dailyPayouts = await processPayouts(env, 'daily');
    console.log(`[Payout] Daily: ${dailyPayouts.length} payouts processed`);

    // Process weekly payouts on Sunday midnight UTC
    if (dayOfWeek === 0) {
      console.log('[Payout] Processing weekly payouts...');
      const weeklyPayouts = await processPayouts(env, 'weekly');
      console.log(`[Payout] Weekly: ${weeklyPayouts.length} payouts processed`);
    }

    // Process monthly payouts on 1st of month midnight UTC
    if (dayOfMonth === 1) {
      console.log('[Payout] Processing monthly payouts...');
      const monthlyPayouts = await processPayouts(env, 'monthly');
      console.log(`[Payout] Monthly: ${monthlyPayouts.length} payouts processed`);
    }
  }
}
```

### 4. Wrangler Configuration for Cron
**File: `wrangler.toml`** (UPDATE)

Add scheduled trigger:

```toml
# ... existing config ...

[triggers]
crons = ["0 0 * * *"]  # Every day at midnight UTC
```

---

## Frontend Components

### 1. Period Leaderboard Selector
**File: `src/components/Leaderboard/PeriodLeaderboard.tsx`**

```typescript
/**
 * Period Leaderboard Component
 *
 * Shows leaderboard with period selector (daily/weekly/monthly).
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LeaderboardEntry } from './LeaderboardEntry';
import { LeaderboardRowSkeleton } from '../skeletons';
import { NftHolderBadge } from '../Badge';
import {
  PERIOD_CONFIGS,
  getRewardForRank,
  PeriodType,
} from '../../types/leaderboardRewards';
import './PeriodLeaderboard.css';

interface PeriodLeaderboardProps {
  gameId: string;
  initialPeriod?: PeriodType;
}

export function PeriodLeaderboard({
  gameId,
  initialPeriod = 'daily',
}: PeriodLeaderboardProps) {
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);

  const { data, isLoading, error } = useQuery({
    queryKey: ['period-leaderboard', gameId, period],
    queryFn: async () => {
      const response = await fetch(
        `/api/leaderboard/period/${gameId}?period=${period}&limit=50`
      );
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const config = PERIOD_CONFIGS[period];

  return (
    <div className="period-leaderboard">
      <div className="period-selector">
        {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
          <button
            key={p}
            className={`period-tab ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="period-info">
        <span className="reset-info">Resets: {config.resetTime}</span>
      </div>

      <div className="reward-tiers">
        <h4>Rewards</h4>
        <div className="tiers-list">
          {config.tiers.map((tier) => (
            <span key={`${tier.minRank}-${tier.maxRank}`} className="tier">
              #{tier.minRank === tier.maxRank ? tier.minRank : `${tier.minRank}-${tier.maxRank}`}:{' '}
              {tier.reward} 🍊
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="leaderboard-loading">
          {Array.from({ length: 10 }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="leaderboard-error">Failed to load leaderboard</div>
      ) : !data?.entries.length ? (
        <div className="leaderboard-empty">
          No scores this {period} yet. Be the first!
        </div>
      ) : (
        <div className="leaderboard-entries">
          {data.entries.map((entry: any) => {
            const reward = getRewardForRank(period, entry.rank);

            return (
              <div
                key={entry.userId}
                className={`leaderboard-entry ${entry.rank <= 3 ? 'top-three' : ''}`}
              >
                <span className={`entry-rank rank-${entry.rank}`}>
                  #{entry.rank}
                </span>

                <div className="entry-avatar">
                  {entry.avatar.type === 'nft' ? (
                    <img src={entry.avatar.value} alt="" />
                  ) : (
                    <span className="emoji-avatar">{entry.avatar.value}</span>
                  )}
                </div>

                <div className="entry-name-container">
                  <span className="entry-name">{entry.displayName}</span>
                  {entry.ownsNft && <NftHolderBadge size="small" />}
                </div>

                <span className="entry-score">
                  {entry.bestScore.toLocaleString()}
                </span>

                {reward > 0 && (
                  <span className="entry-reward">+{reward} 🍊</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PeriodLeaderboard;
```

### 2. Period Leaderboard Styles
**File: `src/components/Leaderboard/PeriodLeaderboard.css`**

```css
/**
 * Period Leaderboard Styles
 */

.period-leaderboard {
  background: var(--color-surface, #1a1a2e);
  border-radius: 12px;
  padding: 16px;
}

.period-selector {
  display: flex;
  gap: 4px;
  background: var(--color-background, #0d0d1a);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 12px;
}

.period-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #888);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.period-tab:hover {
  color: var(--color-text, #fff);
}

.period-tab.active {
  background: linear-gradient(135deg, #FFA500, #FF8C00);
  color: #fff;
}

.period-info {
  text-align: center;
  margin-bottom: 12px;
}

.reset-info {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #888);
}

.reward-tiers {
  background: var(--color-background, #0d0d1a);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.reward-tiers h4 {
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
}

.tiers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tier {
  font-size: 0.8rem;
  padding: 4px 8px;
  background: var(--color-surface, #1a1a2e);
  border-radius: 4px;
  color: var(--color-text, #fff);
}

.leaderboard-entries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-background, #0d0d1a);
  border-radius: 8px;
}

.leaderboard-entry.top-three {
  border-left: 3px solid;
}

.leaderboard-entry.top-three:nth-child(1) {
  border-left-color: #FFD700; /* Gold */
}

.leaderboard-entry.top-three:nth-child(2) {
  border-left-color: #C0C0C0; /* Silver */
}

.leaderboard-entry.top-three:nth-child(3) {
  border-left-color: #CD7F32; /* Bronze */
}

.entry-rank {
  min-width: 32px;
  font-weight: 600;
  color: var(--color-text-secondary, #888);
}

.entry-rank.rank-1 {
  color: #FFD700;
}

.entry-rank.rank-2 {
  color: #C0C0C0;
}

.entry-rank.rank-3 {
  color: #CD7F32;
}

.entry-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface, #1a1a2e);
}

.entry-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.emoji-avatar {
  font-size: 1.2rem;
}

.entry-name-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.entry-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-score {
  font-weight: 600;
  color: var(--color-text, #fff);
}

.entry-reward {
  font-size: 0.8rem;
  color: #FFA500;
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}
```

---

## Reward Notification System

### File: `src/components/Notifications/RewardNotification.tsx`

```typescript
/**
 * Reward Notification Component
 *
 * Shows when user receives leaderboard rewards.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RewardNotification.css';

interface RewardNotificationProps {
  show: boolean;
  rewards: {
    gameId: string;
    gameName: string;
    periodType: string;
    rank: number;
    amount: number;
  }[];
  onClose: () => void;
}

export function RewardNotification({
  show,
  rewards,
  onClose,
}: RewardNotificationProps) {
  const totalReward = rewards.reduce((sum, r) => sum + r.amount, 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="reward-notification-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="reward-notification-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reward-header">
              <span className="reward-icon">🎉</span>
              <h3>Leaderboard Rewards!</h3>
            </div>

            <div className="reward-list">
              {rewards.map((reward, i) => (
                <div key={i} className="reward-item">
                  <div className="reward-game">
                    <span className="game-name">{reward.gameName}</span>
                    <span className="period-type">{reward.periodType}</span>
                  </div>
                  <span className="reward-rank">#{reward.rank}</span>
                  <span className="reward-amount">+{reward.amount} 🍊</span>
                </div>
              ))}
            </div>

            <div className="reward-total">
              <span>Total Earned</span>
              <span className="total-amount">+{totalReward} 🍊</span>
            </div>

            <button className="close-button" onClick={onClose}>
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Check for Unclaimed Rewards API

**File: `functions/api/rewards/unclaimed.ts`**

```typescript
import { Env } from '../types';

// Get unclaimed rewards for a user (to show notification on login)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  // Get user from auth
  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // Get recent payouts that user hasn't seen
    const query = `
      SELECT
        lp.game_id,
        lp.period_type,
        lp.period_key,
        lp.rank,
        lp.reward_amount,
        lp.paid_at
      FROM leaderboard_payouts lp
      LEFT JOIN reward_notifications rn
        ON lp.id = rn.payout_id AND rn.user_id = ?
      WHERE lp.user_id = ? AND rn.id IS NULL
      ORDER BY lp.paid_at DESC
      LIMIT 50
    `;

    const results = await env.DB.prepare(query)
      .bind(auth.userId, auth.userId)
      .all();

    return new Response(JSON.stringify({
      unclaimed: results.results || [],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch rewards' }), {
      status: 500,
    });
  }
};
```

---

## Testing Checklist

- [ ] Period leaderboards track best scores correctly
- [ ] Daily leaderboard resets at midnight UTC
- [ ] Weekly leaderboard resets Sunday midnight UTC
- [ ] Monthly leaderboard resets 1st of month midnight UTC
- [ ] Payouts process correctly for each period
- [ ] Payouts are not duplicated (idempotent)
- [ ] Top 3 daily rewards: 25, 15, 5 oranges
- [ ] Top 4-10 daily rewards: 10 oranges each
- [ ] Top 11-50 daily rewards: 3 oranges each
- [ ] Weekly top 3 rewards: 500, 300, 150 oranges
- [ ] Monthly top 3 rewards: 2000, 1000, 500 oranges
- [ ] Period selector UI works correctly
- [ ] Reward amounts display next to ranks
- [ ] NFT holder badge displays on period leaderboards
- [ ] User's currency updates after payouts
- [ ] Reward notification shows for new payouts
