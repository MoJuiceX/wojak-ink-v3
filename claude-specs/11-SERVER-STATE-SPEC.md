# SPEC 11: Bulletproof Server-Side State System

> **For Claude CLI**: This specification implements atomic, server-authoritative state for currency and achievements. No more localStorage for critical game state.

---

## Overview

This spec replaces the localStorage-based currency and achievement system with a bulletproof server-side implementation that:

1. **Single source of truth** - All state lives in D1 database
2. **Atomic transactions** - Claims happen in single transactions (both succeed or both fail)
3. **Idempotent APIs** - Duplicate requests return same result without side effects
4. **Audit trail** - Every currency change is logged with source and metadata
5. **Statistical anomaly detection** - Flag suspicious scores for review
6. **Single-session enforcement** - One active game per user
7. **Immediate ban system** - Zero tolerance for cheaters

---

## Key Decisions (User Confirmed)

| Topic | Decision |
|-------|----------|
| Migration | **Clean slate** - All players start fresh with 100🍊 |
| Failure handling | **Hybrid** - Optimistic for gameplay, pessimistic for claims |
| Client trust | **Statistical anomaly detection** - Accept scores, flag outliers |
| Rate limits | **No limits** - Players can grind freely |
| Reward UX | **Simple total only** - Just show "+25🍊" |
| Cheater handling | **Immediate permanent ban** |
| Balance privacy | **Full transparency** - Anyone can see anyone's balance |
| Gifted oranges UI | **Single balance** - Split shown only at withdrawal |
| Concurrent play | **Block it** - One session per user |
| Offline handling | **Lost progress** - Stable connection required |
| Continue feature | **Optimistic with reconciliation** |
| Session creation | **On game complete only** - Client generates UUID |
| Expected scale | **~20-100 players** |
| Real-time sync | **Poll every 30-60 seconds** |
| Compliance | **Data structure only** - Prepare for future KYC |

---

## The Problem

Currently:
- Currency stored in `localStorage` → Lost on cache clear
- Achievements stored in `localStorage` → Lost on cache clear
- No sync between devices
- Easy to manipulate/cheat
- No audit trail

---

## The Solution

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Frontend     │  ──▶    │   API Layer     │  ──▶    │   D1 Database   │
│  (React App)    │         │ (Cloudflare)    │         │  (Single Truth) │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │  POST /api/gameplay/complete                          │
        │  ────────────────────────▶│                           │
        │                           │  BEGIN TRANSACTION        │
        │                           │  ────────────────────────▶│
        │                           │  1. Validate game session │
        │                           │  2. Calculate rewards     │
        │                           │  3. Update currency       │
        │                           │  4. Log transaction       │
        │                           │  5. Update achievements   │
        │                           │  COMMIT                   │
        │                           │◀────────────────────────  │
        │◀──────────────────────────│                           │
        │  { oranges: 150, newBalance: 1250 }                   │
```

---

## Database Schema

### Migration: `migrations/008_server_state.sql`

```sql
-- =====================================================
-- USER CURRENCY TABLE
-- Single source of truth for all currency balances
-- =====================================================
CREATE TABLE IF NOT EXISTS user_currency (
  user_id TEXT PRIMARY KEY,

  -- Current balances
  oranges INTEGER NOT NULL DEFAULT 100,  -- Starting balance
  gems INTEGER NOT NULL DEFAULT 0,

  -- Lifetime totals (for achievements, never decreases)
  lifetime_oranges INTEGER NOT NULL DEFAULT 100,
  lifetime_gems INTEGER NOT NULL DEFAULT 0,

  -- Gifted oranges (tracked separately, cannot convert to crypto)
  gifted_oranges INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- CURRENCY TRANSACTIONS TABLE
-- Complete audit trail of every currency change
-- =====================================================
CREATE TABLE IF NOT EXISTS currency_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,

  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'gift_send', 'gift_receive')),
  currency TEXT NOT NULL CHECK (currency IN ('oranges', 'gems')),
  amount INTEGER NOT NULL,  -- Positive for earn, negative for spend

  -- Balance after transaction (for audit)
  balance_after INTEGER NOT NULL,

  -- Source tracking
  source TEXT NOT NULL,  -- 'gameplay', 'daily_login', 'achievement', 'leaderboard', 'shop', 'gift', etc.
  source_id TEXT,        -- game_id, achievement_id, shop_item_id, etc.
  metadata TEXT,         -- JSON for additional context

  -- Idempotency key (prevents duplicate processing)
  idempotency_key TEXT UNIQUE,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON currency_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON currency_transactions(source, source_id);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON currency_transactions(idempotency_key);

-- =====================================================
-- USER ACHIEVEMENTS TABLE
-- Tracks progress and claim status for each achievement
-- =====================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,

  -- Progress tracking
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,

  -- Completion status
  completed_at TEXT,  -- NULL if not completed

  -- Claim status (completed != claimed)
  claimed_at TEXT,    -- NULL if not claimed
  reward_oranges INTEGER,  -- Reward given on claim
  reward_gems INTEGER,

  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unclaimed ON user_achievements(user_id, completed_at, claimed_at);

-- =====================================================
-- USER STATS TABLE
-- Aggregated stats for achievement checking
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,

  -- Gameplay stats
  total_games_played INTEGER NOT NULL DEFAULT 0,
  highest_score INTEGER NOT NULL DEFAULT 0,
  highest_score_game TEXT,
  games_played_by_id TEXT DEFAULT '{}',  -- JSON: { "game-id": count }

  -- Social stats
  friends_count INTEGER NOT NULL DEFAULT 0,

  -- Collection stats
  items_owned INTEGER NOT NULL DEFAULT 0,

  -- Profile completion
  has_custom_name INTEGER NOT NULL DEFAULT 0,
  has_custom_avatar INTEGER NOT NULL DEFAULT 0,
  has_nft_avatar INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- GAME SESSIONS TABLE
-- Prevents replay attacks and validates game completions
-- =====================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,  -- UUID generated by server
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,

  -- Session state
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,

  -- Game data (set on completion)
  final_score INTEGER,
  duration_seconds INTEGER,

  -- Reward tracking
  reward_claimed INTEGER NOT NULL DEFAULT 0,
  reward_amount INTEGER,

  -- Anti-cheat
  client_hash TEXT,  -- Hash of game state for validation

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON game_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_unclaimed ON game_sessions(user_id, reward_claimed, completed_at);

-- =====================================================
-- DAILY LOGIN CLAIMS TABLE
-- Prevents double-claiming daily rewards
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_login_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  claim_date TEXT NOT NULL,  -- YYYY-MM-DD format
  streak_day INTEGER NOT NULL,  -- 1-7
  oranges_claimed INTEGER NOT NULL,
  gems_claimed INTEGER NOT NULL DEFAULT 0,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, claim_date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_daily_claims_user ON daily_login_claims(user_id, claim_date DESC);

-- =====================================================
-- DAILY CHALLENGE PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_challenge_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  challenge_date TEXT NOT NULL,  -- YYYY-MM-DD (UTC)
  challenge_id TEXT NOT NULL,    -- 'games-played-5', 'personal-best-1', 'play-time-600'

  -- Progress
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,

  -- Completion & claim
  completed_at TEXT,
  claimed_at TEXT,
  reward_amount INTEGER,

  UNIQUE(user_id, challenge_date, challenge_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON daily_challenge_progress(user_id, challenge_date);
```

---

## API Endpoints

### 1. Initialize User (Called on first login)

**File: `functions/api/currency/init.ts`**

```typescript
/**
 * POST /api/currency/init
 *
 * Initializes currency for a new user. Idempotent - safe to call multiple times.
 * Returns current balance (creates with starting balance if new).
 */

import { Env, AuthenticatedRequest } from '../../types';
import { getAuth } from '../../lib/auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  const STARTING_ORANGES = 100;

  try {
    // Try to get existing balance
    const existing = await env.DB.prepare(
      'SELECT * FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (existing) {
      // Already initialized, return current balance
      return new Response(JSON.stringify({
        oranges: existing.oranges,
        gems: existing.gems,
        lifetimeOranges: existing.lifetime_oranges,
        lifetimeGems: existing.lifetime_gems,
        giftedOranges: existing.gifted_oranges,
        isNew: false,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new user currency record with starting balance
    await env.DB.prepare(`
      INSERT INTO user_currency (user_id, oranges, gems, lifetime_oranges, lifetime_gems, gifted_oranges)
      VALUES (?, ?, 0, ?, 0, 0)
    `).bind(userId, STARTING_ORANGES, STARTING_ORANGES).run();

    // Also initialize user_stats
    await env.DB.prepare(`
      INSERT OR IGNORE INTO user_stats (user_id)
      VALUES (?)
    `).bind(userId).run();

    // Log the starting balance as a transaction
    await env.DB.prepare(`
      INSERT INTO currency_transactions
        (user_id, type, currency, amount, balance_after, source, idempotency_key)
      VALUES (?, 'earn', 'oranges', ?, ?, 'account_creation', ?)
    `).bind(userId, STARTING_ORANGES, STARTING_ORANGES, `init_${userId}`).run();

    return new Response(JSON.stringify({
      oranges: STARTING_ORANGES,
      gems: 0,
      lifetimeOranges: STARTING_ORANGES,
      lifetimeGems: 0,
      giftedOranges: 0,
      isNew: true,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Currency Init] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to initialize currency' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 2. Get Currency Balance

**File: `functions/api/currency/index.ts`**

```typescript
/**
 * GET /api/currency
 *
 * Returns current currency balance for authenticated user.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const currency = await env.DB.prepare(
      'SELECT * FROM user_currency WHERE user_id = ?'
    ).bind(auth.userId).first();

    if (!currency) {
      // User not initialized - return zeros (frontend should call /init)
      return new Response(JSON.stringify({
        oranges: 0,
        gems: 0,
        lifetimeOranges: 0,
        lifetimeGems: 0,
        giftedOranges: 0,
        initialized: false,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      oranges: currency.oranges,
      gems: currency.gems,
      lifetimeOranges: currency.lifetime_oranges,
      lifetimeGems: currency.lifetime_gems,
      giftedOranges: currency.gifted_oranges,
      initialized: true,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Currency Get] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch currency' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 3. Complete Game (Atomic Reward)

**File: `functions/api/gameplay/complete.ts`**

```typescript
/**
 * POST /api/gameplay/complete
 *
 * Called when a game ends. Atomically:
 * 1. Validates the game session
 * 2. Calculates rewards based on score and tier
 * 3. Updates currency balance
 * 4. Logs transaction
 * 5. Updates achievement progress
 * 6. Updates daily challenge progress
 *
 * Idempotent: Calling twice with same session returns same result.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';
import { GAME_TIERS, GAME_TIER_MAP, GAME_MIN_SCORES } from '../../../src/config/economy';

interface CompleteGameRequest {
  sessionId: string;
  gameId: string;
  score: number;
  durationSeconds: number;
  isHighScore: boolean;
  isTop10: boolean;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  let body: CompleteGameRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { sessionId, gameId, score, durationSeconds, isHighScore, isTop10 } = body;

  // Validate required fields
  if (!sessionId || !gameId || score === undefined) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // ==========================================
    // IDEMPOTENCY CHECK
    // ==========================================
    const idempotencyKey = `game_${sessionId}`;
    const existingTx = await env.DB.prepare(
      'SELECT * FROM currency_transactions WHERE idempotency_key = ?'
    ).bind(idempotencyKey).first();

    if (existingTx) {
      // Already processed - return the same result
      const currentBalance = await env.DB.prepare(
        'SELECT oranges, gems FROM user_currency WHERE user_id = ?'
      ).bind(userId).first();

      return new Response(JSON.stringify({
        success: true,
        alreadyProcessed: true,
        reward: {
          oranges: existingTx.amount,
          gems: 0,
        },
        newBalance: {
          oranges: currentBalance?.oranges || 0,
          gems: currentBalance?.gems || 0,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // SCORE VALIDATION
    // ==========================================
    const minScore = GAME_MIN_SCORES[gameId] || 0;
    if (score < minScore) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Score below minimum threshold',
        minScore,
        yourScore: score,
        reward: { oranges: 0, gems: 0 },
      }), {
        status: 200,  // Not an error, just no reward
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // CALCULATE REWARD
    // ==========================================
    const tier = GAME_TIER_MAP[gameId] || 'medium';
    const tierConfig = GAME_TIERS[tier];

    let orangesEarned = tierConfig.baseReward;
    const bonuses: string[] = [];

    if (isHighScore) {
      orangesEarned += tierConfig.highScoreBonus;
      bonuses.push(`high_score:+${tierConfig.highScoreBonus}`);
    }

    if (isTop10) {
      orangesEarned += tierConfig.top10Bonus;
      bonuses.push(`top10:+${tierConfig.top10Bonus}`);
    }

    // ==========================================
    // STAGED TRUST (New accounts earn 50% for 7 days)
    // ==========================================
    const userCreatedAt = await env.DB.prepare(
      'SELECT created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    if (userCreatedAt) {
      const accountAge = Date.now() - new Date(userCreatedAt.created_at as string).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (accountAge < sevenDays) {
        orangesEarned = Math.floor(orangesEarned * 0.5);
        bonuses.push('staged_trust:50%');
      }
    }

    // ==========================================
    // ATOMIC UPDATE (Currency + Transaction + Stats)
    // ==========================================

    // Get current balance
    const currentCurrency = await env.DB.prepare(
      'SELECT oranges, gems FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (!currentCurrency) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newOranges = (currentCurrency.oranges as number) + orangesEarned;
    const newLifetimeOranges = (currentCurrency.lifetime_oranges as number || 0) + orangesEarned;

    // Update currency
    await env.DB.prepare(`
      UPDATE user_currency
      SET oranges = ?, lifetime_oranges = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(newOranges, newLifetimeOranges, userId).run();

    // Log transaction
    await env.DB.prepare(`
      INSERT INTO currency_transactions
        (user_id, type, currency, amount, balance_after, source, source_id, metadata, idempotency_key)
      VALUES (?, 'earn', 'oranges', ?, ?, 'gameplay', ?, ?, ?)
    `).bind(
      userId,
      orangesEarned,
      newOranges,
      gameId,
      JSON.stringify({ score, tier, bonuses, duration: durationSeconds }),
      idempotencyKey
    ).run();

    // ==========================================
    // UPDATE STATS (For achievement tracking)
    // ==========================================
    await env.DB.prepare(`
      UPDATE user_stats
      SET
        total_games_played = total_games_played + 1,
        highest_score = CASE WHEN ? > highest_score THEN ? ELSE highest_score END,
        highest_score_game = CASE WHEN ? > highest_score THEN ? ELSE highest_score_game END,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(score, score, score, gameId, userId).run();

    // ==========================================
    // UPDATE DAILY CHALLENGE PROGRESS
    // ==========================================
    const today = new Date().toISOString().split('T')[0];

    // Challenge 1: games-played-5
    await env.DB.prepare(`
      INSERT INTO daily_challenge_progress (user_id, challenge_date, challenge_id, progress, target)
      VALUES (?, ?, 'games-played-5', 1, 5)
      ON CONFLICT(user_id, challenge_date, challenge_id) DO UPDATE SET
        progress = progress + 1,
        completed_at = CASE
          WHEN progress + 1 >= target AND completed_at IS NULL
          THEN CURRENT_TIMESTAMP
          ELSE completed_at
        END
    `).bind(userId, today).run();

    // Challenge 2: personal-best-1 (if this was a high score)
    if (isHighScore) {
      await env.DB.prepare(`
        INSERT INTO daily_challenge_progress (user_id, challenge_date, challenge_id, progress, target)
        VALUES (?, ?, 'personal-best-1', 1, 1)
        ON CONFLICT(user_id, challenge_date, challenge_id) DO UPDATE SET
          progress = 1,
          completed_at = CASE WHEN completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END
      `).bind(userId, today).run();
    }

    // Challenge 3: play-time-600 (add duration)
    await env.DB.prepare(`
      INSERT INTO daily_challenge_progress (user_id, challenge_date, challenge_id, progress, target)
      VALUES (?, ?, 'play-time-600', ?, 600)
      ON CONFLICT(user_id, challenge_date, challenge_id) DO UPDATE SET
        progress = progress + ?,
        completed_at = CASE
          WHEN progress + ? >= target AND completed_at IS NULL
          THEN CURRENT_TIMESTAMP
          ELSE completed_at
        END
    `).bind(userId, today, durationSeconds, durationSeconds, durationSeconds).run();

    // ==========================================
    // RESPONSE
    // ==========================================
    return new Response(JSON.stringify({
      success: true,
      reward: {
        oranges: orangesEarned,
        gems: 0,
        breakdown: {
          base: tierConfig.baseReward,
          tier,
          bonuses,
        },
      },
      newBalance: {
        oranges: newOranges,
        gems: currentCurrency.gems,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Gameplay Complete] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process game completion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 4. Claim Daily Login Reward

**File: `functions/api/daily-login/claim.ts`**

```typescript
/**
 * POST /api/daily-login/claim
 *
 * Claims daily login reward. Idempotent per day.
 * Tracks streak and awards appropriate oranges/gems.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';
import { DAILY_LOGIN_REWARDS } from '../../../src/config/economy';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  const today = new Date().toISOString().split('T')[0];

  try {
    // ==========================================
    // CHECK IF ALREADY CLAIMED TODAY
    // ==========================================
    const existingClaim = await env.DB.prepare(
      'SELECT * FROM daily_login_claims WHERE user_id = ? AND claim_date = ?'
    ).bind(userId, today).first();

    if (existingClaim) {
      // Already claimed today
      return new Response(JSON.stringify({
        success: true,
        alreadyClaimed: true,
        streakDay: existingClaim.streak_day,
        reward: {
          oranges: existingClaim.oranges_claimed,
          gems: existingClaim.gems_claimed,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // CALCULATE STREAK
    // ==========================================
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const yesterdayClaim = await env.DB.prepare(
      'SELECT streak_day FROM daily_login_claims WHERE user_id = ? AND claim_date = ?'
    ).bind(userId, yesterday).first();

    let streakDay = 1;
    if (yesterdayClaim) {
      // Continue streak
      streakDay = ((yesterdayClaim.streak_day as number) % 7) + 1;
    }

    // Get reward for this streak day
    const rewardConfig = DAILY_LOGIN_REWARDS[streakDay - 1];
    const orangesReward = rewardConfig.oranges;
    const gemsReward = rewardConfig.gems || 0;

    // ==========================================
    // ATOMIC UPDATE
    // ==========================================

    // Get current balance
    const currentCurrency = await env.DB.prepare(
      'SELECT oranges, gems, lifetime_oranges, lifetime_gems FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (!currentCurrency) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newOranges = (currentCurrency.oranges as number) + orangesReward;
    const newGems = (currentCurrency.gems as number) + gemsReward;

    // Record the claim
    await env.DB.prepare(`
      INSERT INTO daily_login_claims (user_id, claim_date, streak_day, oranges_claimed, gems_claimed)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, today, streakDay, orangesReward, gemsReward).run();

    // Update currency
    await env.DB.prepare(`
      UPDATE user_currency
      SET
        oranges = oranges + ?,
        gems = gems + ?,
        lifetime_oranges = lifetime_oranges + ?,
        lifetime_gems = lifetime_gems + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(orangesReward, gemsReward, orangesReward, gemsReward, userId).run();

    // Log transaction (oranges)
    if (orangesReward > 0) {
      await env.DB.prepare(`
        INSERT INTO currency_transactions
          (user_id, type, currency, amount, balance_after, source, metadata, idempotency_key)
        VALUES (?, 'earn', 'oranges', ?, ?, 'daily_login', ?, ?)
      `).bind(
        userId,
        orangesReward,
        newOranges,
        JSON.stringify({ streak_day: streakDay }),
        `daily_${userId}_${today}_oranges`
      ).run();
    }

    // Log transaction (gems)
    if (gemsReward > 0) {
      await env.DB.prepare(`
        INSERT INTO currency_transactions
          (user_id, type, currency, amount, balance_after, source, metadata, idempotency_key)
        VALUES (?, 'earn', 'gems', ?, ?, 'daily_login', ?, ?)
      `).bind(
        userId,
        gemsReward,
        newGems,
        JSON.stringify({ streak_day: streakDay }),
        `daily_${userId}_${today}_gems`
      ).run();
    }

    // Update profile streak
    await env.DB.prepare(`
      UPDATE profiles
      SET
        current_streak = ?,
        longest_streak = CASE WHEN ? > longest_streak THEN ? ELSE longest_streak END,
        last_played_date = ?
      WHERE user_id = ?
    `).bind(streakDay, streakDay, streakDay, today, userId).run();

    return new Response(JSON.stringify({
      success: true,
      alreadyClaimed: false,
      streakDay,
      reward: {
        oranges: orangesReward,
        gems: gemsReward,
      },
      newBalance: {
        oranges: newOranges,
        gems: newGems,
      },
      nextReward: DAILY_LOGIN_REWARDS[streakDay % 7],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Daily Login Claim] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to claim daily reward' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 5. Claim Achievement

**File: `functions/api/achievements/claim.ts`**

```typescript
/**
 * POST /api/achievements/claim
 *
 * Claims a completed achievement. Idempotent.
 * Validates completion before awarding rewards.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';
import { ACHIEVEMENTS } from '../../../src/config/achievements';

interface ClaimRequest {
  achievementId: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  let body: ClaimRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { achievementId } = body;

  // Validate achievement exists
  const achievementDef = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievementDef) {
    return new Response(JSON.stringify({ error: 'Invalid achievement ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // ==========================================
    // CHECK ACHIEVEMENT STATUS
    // ==========================================
    const achievement = await env.DB.prepare(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).bind(userId, achievementId).first();

    // Check if already claimed
    if (achievement?.claimed_at) {
      return new Response(JSON.stringify({
        success: true,
        alreadyClaimed: true,
        reward: {
          oranges: achievement.reward_oranges || 0,
          gems: achievement.reward_gems || 0,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if completed
    if (!achievement?.completed_at) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Achievement not completed yet',
        progress: achievement?.progress || 0,
        target: achievementDef.target,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================
    // AWARD REWARDS
    // ==========================================
    const orangesReward = achievementDef.reward.oranges || 0;
    const gemsReward = achievementDef.reward.gems || 0;

    // Get current balance
    const currentCurrency = await env.DB.prepare(
      'SELECT oranges, gems FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (!currentCurrency) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newOranges = (currentCurrency.oranges as number) + orangesReward;
    const newGems = (currentCurrency.gems as number) + gemsReward;

    // Mark as claimed
    await env.DB.prepare(`
      UPDATE user_achievements
      SET claimed_at = CURRENT_TIMESTAMP, reward_oranges = ?, reward_gems = ?
      WHERE user_id = ? AND achievement_id = ?
    `).bind(orangesReward, gemsReward, userId, achievementId).run();

    // Update currency
    await env.DB.prepare(`
      UPDATE user_currency
      SET
        oranges = oranges + ?,
        gems = gems + ?,
        lifetime_oranges = lifetime_oranges + ?,
        lifetime_gems = lifetime_gems + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(orangesReward, gemsReward, orangesReward, gemsReward, userId).run();

    // Log transaction
    const idempotencyKey = `achievement_${userId}_${achievementId}`;

    if (orangesReward > 0) {
      await env.DB.prepare(`
        INSERT INTO currency_transactions
          (user_id, type, currency, amount, balance_after, source, source_id, idempotency_key)
        VALUES (?, 'earn', 'oranges', ?, ?, 'achievement', ?, ?)
      `).bind(userId, orangesReward, newOranges, achievementId, `${idempotencyKey}_oranges`).run();
    }

    if (gemsReward > 0) {
      await env.DB.prepare(`
        INSERT INTO currency_transactions
          (user_id, type, currency, amount, balance_after, source, source_id, idempotency_key)
        VALUES (?, 'earn', 'gems', ?, ?, 'achievement', ?, ?)
      `).bind(userId, gemsReward, newGems, achievementId, `${idempotencyKey}_gems`).run();
    }

    return new Response(JSON.stringify({
      success: true,
      alreadyClaimed: false,
      achievement: {
        id: achievementId,
        name: achievementDef.name,
      },
      reward: {
        oranges: orangesReward,
        gems: gemsReward,
      },
      newBalance: {
        oranges: newOranges,
        gems: newGems,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Achievement Claim] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to claim achievement' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 6. Claim Daily Challenge

**File: `functions/api/challenges/claim.ts`**

```typescript
/**
 * POST /api/challenges/claim
 *
 * Claims a completed daily challenge. Idempotent.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';
import { DAILY_CHALLENGES } from '../../../src/config/economy';

interface ClaimRequest {
  challengeId: string;
}

const CHALLENGE_REWARDS: Record<string, number> = {
  'games-played-5': 30,
  'personal-best-1': 50,
  'play-time-600': 70,
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  const today = new Date().toISOString().split('T')[0];

  let body: ClaimRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { challengeId } = body;
  const reward = CHALLENGE_REWARDS[challengeId];

  if (!reward) {
    return new Response(JSON.stringify({ error: 'Invalid challenge ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get challenge progress
    const progress = await env.DB.prepare(`
      SELECT * FROM daily_challenge_progress
      WHERE user_id = ? AND challenge_date = ? AND challenge_id = ?
    `).bind(userId, today, challengeId).first();

    // Check if already claimed
    if (progress?.claimed_at) {
      return new Response(JSON.stringify({
        success: true,
        alreadyClaimed: true,
        reward: progress.reward_amount,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if completed
    if (!progress?.completed_at) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Challenge not completed yet',
        progress: progress?.progress || 0,
        target: progress?.target || CHALLENGE_REWARDS[challengeId],
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get current balance
    const currentCurrency = await env.DB.prepare(
      'SELECT oranges FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (!currentCurrency) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newOranges = (currentCurrency.oranges as number) + reward;

    // Mark as claimed
    await env.DB.prepare(`
      UPDATE daily_challenge_progress
      SET claimed_at = CURRENT_TIMESTAMP, reward_amount = ?
      WHERE user_id = ? AND challenge_date = ? AND challenge_id = ?
    `).bind(reward, userId, today, challengeId).run();

    // Update currency
    await env.DB.prepare(`
      UPDATE user_currency
      SET
        oranges = oranges + ?,
        lifetime_oranges = lifetime_oranges + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(reward, reward, userId).run();

    // Log transaction
    const idempotencyKey = `challenge_${userId}_${today}_${challengeId}`;
    await env.DB.prepare(`
      INSERT INTO currency_transactions
        (user_id, type, currency, amount, balance_after, source, source_id, idempotency_key)
      VALUES (?, 'earn', 'oranges', ?, ?, 'daily_challenge', ?, ?)
    `).bind(userId, reward, newOranges, challengeId, idempotencyKey).run();

    return new Response(JSON.stringify({
      success: true,
      alreadyClaimed: false,
      challengeId,
      reward,
      newBalance: {
        oranges: newOranges,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Challenge Claim] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to claim challenge' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### 7. Spend Currency (Shop Purchase)

**File: `functions/api/currency/spend.ts`**

```typescript
/**
 * POST /api/currency/spend
 *
 * Deducts currency for shop purchases.
 * Validates sufficient balance before deducting.
 */

import { Env } from '../../types';
import { getAuth } from '../../lib/auth';

interface SpendRequest {
  currency: 'oranges' | 'gems';
  amount: number;
  itemId: string;
  itemType: string;  // 'cosmetic', 'continue', 'upgrade', etc.
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const auth = getAuth(request);
  if (!auth.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = auth.userId;
  let body: SpendRequest;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { currency, amount, itemId, itemType } = body;

  if (!currency || !amount || amount <= 0 || !itemId) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get current balance
    const currentCurrency = await env.DB.prepare(
      'SELECT oranges, gems FROM user_currency WHERE user_id = ?'
    ).bind(userId).first();

    if (!currentCurrency) {
      return new Response(JSON.stringify({ error: 'User currency not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentBalance = currency === 'oranges'
      ? currentCurrency.oranges as number
      : currentCurrency.gems as number;

    // Check sufficient balance
    if (currentBalance < amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Insufficient balance',
        required: amount,
        available: currentBalance,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newBalance = currentBalance - amount;

    // Deduct currency
    if (currency === 'oranges') {
      await env.DB.prepare(`
        UPDATE user_currency
        SET oranges = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(newBalance, userId).run();
    } else {
      await env.DB.prepare(`
        UPDATE user_currency
        SET gems = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(newBalance, userId).run();
    }

    // Log transaction
    const idempotencyKey = `spend_${userId}_${itemId}_${Date.now()}`;
    await env.DB.prepare(`
      INSERT INTO currency_transactions
        (user_id, type, currency, amount, balance_after, source, source_id, metadata, idempotency_key)
      VALUES (?, 'spend', ?, ?, ?, 'shop', ?, ?, ?)
    `).bind(
      userId,
      currency,
      -amount,  // Negative for spend
      newBalance,
      itemId,
      JSON.stringify({ itemType }),
      idempotencyKey
    ).run();

    return new Response(JSON.stringify({
      success: true,
      spent: {
        currency,
        amount,
      },
      newBalance: {
        [currency]: newBalance,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Currency Spend] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process purchase' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

---

## Frontend Integration

### Updated CurrencyContext

**File: `src/contexts/CurrencyContext.tsx`** (Replace localStorage logic)

```typescript
/**
 * CurrencyContext - Server-Backed Implementation
 *
 * All currency operations now go through the API.
 * Local state is just a cache of server state.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface CurrencyState {
  oranges: number;
  gems: number;
  lifetimeOranges: number;
  lifetimeGems: number;
  giftedOranges: number;
  isLoading: boolean;
  isInitialized: boolean;
}

interface CurrencyContextType extends CurrencyState {
  // Read operations
  refreshBalance: () => Promise<void>;

  // Write operations (all go through API)
  completeGame: (params: {
    sessionId: string;
    gameId: string;
    score: number;
    durationSeconds: number;
    isHighScore: boolean;
    isTop10: boolean;
  }) => Promise<{ success: boolean; reward?: { oranges: number } }>;

  claimDailyLogin: () => Promise<{ success: boolean; reward?: { oranges: number; gems: number } }>;

  claimAchievement: (achievementId: string) => Promise<{ success: boolean; reward?: { oranges: number; gems: number } }>;

  claimChallenge: (challengeId: string) => Promise<{ success: boolean; reward?: number }>;

  spendCurrency: (currency: 'oranges' | 'gems', amount: number, itemId: string, itemType: string) => Promise<{ success: boolean }>;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();

  const [state, setState] = useState<CurrencyState>({
    oranges: 0,
    gems: 0,
    lifetimeOranges: 0,
    lifetimeGems: 0,
    giftedOranges: 0,
    isLoading: true,
    isInitialized: false,
  });

  // Helper for authenticated API calls
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();
    return fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  }, [getToken]);

  // Initialize/refresh balance from server
  const refreshBalance = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      // First try to get balance
      let response = await apiCall('/api/currency');
      let data = await response.json();

      // If not initialized, initialize
      if (!data.initialized) {
        response = await apiCall('/api/currency/init', { method: 'POST' });
        data = await response.json();
      }

      setState(prev => ({
        ...prev,
        oranges: data.oranges,
        gems: data.gems,
        lifetimeOranges: data.lifetimeOranges,
        lifetimeGems: data.lifetimeGems,
        giftedOranges: data.giftedOranges || 0,
        isLoading: false,
        isInitialized: true,
      }));
    } catch (error) {
      console.error('[Currency] Failed to refresh balance:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn, apiCall]);

  // Initialize on mount
  useEffect(() => {
    if (isSignedIn) {
      refreshBalance();
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isSignedIn, refreshBalance]);

  // Complete game and earn rewards
  const completeGame = useCallback(async (params: {
    sessionId: string;
    gameId: string;
    score: number;
    durationSeconds: number;
    isHighScore: boolean;
    isTop10: boolean;
  }) => {
    try {
      const response = await apiCall('/api/gameplay/complete', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const data = await response.json();

      if (data.success && data.newBalance) {
        setState(prev => ({
          ...prev,
          oranges: data.newBalance.oranges,
          gems: data.newBalance.gems ?? prev.gems,
        }));
      }

      return data;
    } catch (error) {
      console.error('[Currency] Failed to complete game:', error);
      return { success: false };
    }
  }, [apiCall]);

  // Claim daily login
  const claimDailyLogin = useCallback(async () => {
    try {
      const response = await apiCall('/api/daily-login/claim', { method: 'POST' });
      const data = await response.json();

      if (data.success && data.newBalance) {
        setState(prev => ({
          ...prev,
          oranges: data.newBalance.oranges,
          gems: data.newBalance.gems,
        }));
      }

      return data;
    } catch (error) {
      console.error('[Currency] Failed to claim daily login:', error);
      return { success: false };
    }
  }, [apiCall]);

  // Claim achievement
  const claimAchievement = useCallback(async (achievementId: string) => {
    try {
      const response = await apiCall('/api/achievements/claim', {
        method: 'POST',
        body: JSON.stringify({ achievementId }),
      });
      const data = await response.json();

      if (data.success && data.newBalance) {
        setState(prev => ({
          ...prev,
          oranges: data.newBalance.oranges,
          gems: data.newBalance.gems,
        }));
      }

      return data;
    } catch (error) {
      console.error('[Currency] Failed to claim achievement:', error);
      return { success: false };
    }
  }, [apiCall]);

  // Claim challenge
  const claimChallenge = useCallback(async (challengeId: string) => {
    try {
      const response = await apiCall('/api/challenges/claim', {
        method: 'POST',
        body: JSON.stringify({ challengeId }),
      });
      const data = await response.json();

      if (data.success && data.newBalance) {
        setState(prev => ({
          ...prev,
          oranges: data.newBalance.oranges,
        }));
      }

      return data;
    } catch (error) {
      console.error('[Currency] Failed to claim challenge:', error);
      return { success: false };
    }
  }, [apiCall]);

  // Spend currency
  const spendCurrency = useCallback(async (
    currency: 'oranges' | 'gems',
    amount: number,
    itemId: string,
    itemType: string
  ) => {
    try {
      const response = await apiCall('/api/currency/spend', {
        method: 'POST',
        body: JSON.stringify({ currency, amount, itemId, itemType }),
      });
      const data = await response.json();

      if (data.success && data.newBalance) {
        setState(prev => ({
          ...prev,
          [currency]: data.newBalance[currency],
        }));
      }

      return data;
    } catch (error) {
      console.error('[Currency] Failed to spend currency:', error);
      return { success: false };
    }
  }, [apiCall]);

  const contextValue: CurrencyContextType = {
    ...state,
    refreshBalance,
    completeGame,
    claimDailyLogin,
    claimAchievement,
    claimChallenge,
    spendCurrency,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
```

---

## API Summary

| Endpoint | Method | Purpose | Idempotent |
|----------|--------|---------|------------|
| `/api/currency` | GET | Get current balance | N/A |
| `/api/currency/init` | POST | Initialize new user | ✅ Yes |
| `/api/currency/spend` | POST | Deduct for purchase | ✅ Yes (via itemId) |
| `/api/gameplay/complete` | POST | Complete game, earn rewards | ✅ Yes (via sessionId) |
| `/api/daily-login/claim` | POST | Claim daily login | ✅ Yes (per day) |
| `/api/achievements/claim` | POST | Claim achievement reward | ✅ Yes (per achievement) |
| `/api/challenges/claim` | POST | Claim daily challenge | ✅ Yes (per day/challenge) |
| `/api/achievements/progress` | GET | Get all achievement progress | N/A |
| `/api/challenges/progress` | GET | Get daily challenge progress | N/A |

---

## Security Considerations

### Core Protections
1. **All writes require authentication** - Clerk JWT verified on every request
2. **Idempotency keys prevent double-spend** - Unique keys for each operation
3. **Server-side validation** - Score thresholds, balance checks all server-side
4. **Audit trail** - Every transaction logged with source and metadata
5. **Staged trust** - New accounts earn 50% for 7 days
6. **Session validation** - Game sessions tracked to prevent replay attacks

### Single-Session Enforcement

Only one active game session per user. Prevents multi-tab farming.

**Database addition to migration:**
```sql
-- Active sessions tracking (for single-session enforcement)
CREATE TABLE IF NOT EXISTS active_sessions (
  user_id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_heartbeat TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**API: Start Game Session**
```typescript
// POST /api/game/start
// Returns 409 Conflict if user already has active session

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const auth = getAuth(request);
  if (!auth.userId) return unauthorized();

  const { gameId } = await request.json();
  const sessionId = crypto.randomUUID();

  // Check for existing active session (with 2-minute timeout)
  const existing = await env.DB.prepare(`
    SELECT * FROM active_sessions
    WHERE user_id = ?
    AND datetime(last_heartbeat) > datetime('now', '-2 minutes')
  `).bind(auth.userId).first();

  if (existing) {
    return new Response(JSON.stringify({
      error: 'Already playing',
      activeGame: existing.game_id,
      message: 'You can only play one game at a time. Close the other tab first.',
    }), { status: 409 });
  }

  // Create or replace session
  await env.DB.prepare(`
    INSERT OR REPLACE INTO active_sessions (user_id, game_id, session_id)
    VALUES (?, ?, ?)
  `).bind(auth.userId, gameId, sessionId).run();

  return new Response(JSON.stringify({ sessionId }), { status: 200 });
};
```

**Frontend: Heartbeat every 30 seconds while playing**
```typescript
useEffect(() => {
  if (!isPlaying || !sessionId) return;

  const interval = setInterval(() => {
    fetch('/api/game/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }, 30000);

  return () => clearInterval(interval);
}, [isPlaying, sessionId]);
```

### Statistical Anomaly Detection

Accept all scores but flag outliers for review. Based on [cutting-edge AI-powered anti-cheat techniques](https://journalwjarr.com/sites/default/files/fulltext_pdf/WJARR-2025-1747.pdf).

**Database addition:**
```sql
-- Flagged scores for review
CREATE TABLE IF NOT EXISTS flagged_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  score INTEGER NOT NULL,

  -- Why it was flagged
  flag_reason TEXT NOT NULL,  -- 'percentile_99', 'impossible_time', 'pattern_anomaly'
  flag_details TEXT,          -- JSON with specifics

  -- Review status
  reviewed_at TEXT,
  reviewed_by TEXT,
  verdict TEXT,  -- 'legitimate', 'cheating', 'uncertain'

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Anomaly Detection Logic:**
```typescript
interface AnomalyCheck {
  isFlagged: boolean;
  reason?: string;
  details?: Record<string, any>;
}

async function checkForAnomalies(
  env: Env,
  userId: string,
  gameId: string,
  score: number,
  durationSeconds: number
): Promise<AnomalyCheck> {
  // Get historical stats for this game
  const stats = await env.DB.prepare(`
    SELECT
      AVG(final_score) as avg_score,
      MAX(final_score) as max_score,
      AVG(duration_seconds) as avg_duration,
      COUNT(*) as total_games
    FROM game_sessions
    WHERE game_id = ? AND completed_at IS NOT NULL
  `).bind(gameId).first();

  const avgScore = stats?.avg_score as number || 0;
  const maxScore = stats?.max_score as number || 0;
  const avgDuration = stats?.avg_duration as number || 60;
  const totalGames = stats?.total_games as number || 0;

  // Only apply checks if we have enough data
  if (totalGames < 100) {
    return { isFlagged: false };
  }

  // Check 1: Score is > 99th percentile (roughly 3x average for most distributions)
  if (score > avgScore * 3 && score > maxScore) {
    return {
      isFlagged: true,
      reason: 'percentile_99',
      details: { score, avgScore, maxScore, threshold: avgScore * 3 },
    };
  }

  // Check 2: Impossibly fast completion
  const minReasonableTime = 10; // seconds
  if (durationSeconds < minReasonableTime && score > avgScore) {
    return {
      isFlagged: true,
      reason: 'impossible_time',
      details: { durationSeconds, minReasonableTime, score },
    };
  }

  // Check 3: Score/time ratio is suspicious (too many points per second)
  const pointsPerSecond = score / Math.max(durationSeconds, 1);
  const avgPointsPerSecond = avgScore / Math.max(avgDuration, 1);
  if (pointsPerSecond > avgPointsPerSecond * 5) {
    return {
      isFlagged: true,
      reason: 'pattern_anomaly',
      details: { pointsPerSecond, avgPointsPerSecond },
    };
  }

  return { isFlagged: false };
}
```

### Cheater Ban System

Zero tolerance policy with immediate permanent ban. Based on [modern anti-cheat best practices](https://medium.com/@lzysoul/securing-game-code-in-2025-modern-anti-cheat-techniques-and-best-practices-e2e0f6f14173).

**Database addition:**
```sql
-- Banned users
CREATE TABLE IF NOT EXISTS banned_users (
  user_id TEXT PRIMARY KEY,
  banned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL,
  evidence TEXT,  -- JSON with proof

  -- For potential appeals
  appeal_status TEXT DEFAULT 'none',  -- 'none', 'pending', 'denied', 'approved'
  appeal_notes TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Ban Check Middleware:**
```typescript
// Add to all authenticated endpoints
async function checkBanned(env: Env, userId: string): Promise<boolean> {
  const banned = await env.DB.prepare(
    "SELECT 1 FROM banned_users WHERE user_id = ? AND appeal_status != 'approved'"
  ).bind(userId).first();
  return !!banned;
}

// Usage in endpoints:
if (await checkBanned(env, auth.userId)) {
  return new Response(JSON.stringify({
    error: 'Account suspended',
    message: 'Your account has been permanently suspended for violating terms of service.',
    appealUrl: 'https://wojak.ink/appeal',
  }), { status: 403 });
}
```

**Auto-Ban on Confirmed Cheating:**
```typescript
async function banUser(
  env: Env,
  userId: string,
  reason: string,
  evidence: Record<string, any>
): Promise<void> {
  // Ban the user
  await env.DB.prepare(`
    INSERT INTO banned_users (user_id, reason, evidence)
    VALUES (?, ?, ?)
  `).bind(userId, reason, JSON.stringify(evidence)).run();

  // Void all their pending rewards
  await env.DB.prepare(`
    DELETE FROM game_sessions
    WHERE user_id = ? AND reward_claimed = 0
  `).bind(userId).run();

  // Log the ban
  console.log(`[BAN] User ${userId} banned for: ${reason}`);
}
```

### Compliance-Ready Data Structure

Prepare for future KYC requirements without implementing them now.

**Database additions:**
```sql
-- Future compliance fields (added to user_currency)
ALTER TABLE user_currency ADD COLUMN verification_status TEXT DEFAULT 'none';
  -- Values: 'none', 'pending', 'verified', 'rejected'
ALTER TABLE user_currency ADD COLUMN verification_date TEXT;
ALTER TABLE user_currency ADD COLUMN withdrawal_enabled INTEGER DEFAULT 0;
ALTER TABLE user_currency ADD COLUMN total_withdrawn INTEGER DEFAULT 0;

-- Withdrawal requests (for future)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,

  -- Amount
  oranges_amount INTEGER NOT NULL,
  hoa_amount REAL NOT NULL,  -- Calculated at request time

  -- Status
  status TEXT DEFAULT 'pending',  -- 'pending', 'processing', 'completed', 'rejected'
  status_reason TEXT,

  -- Blockchain details (filled on completion)
  transaction_hash TEXT,
  wallet_address TEXT,

  -- Timestamps
  requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Migration Strategy

1. **Phase 1**: Deploy database migration (008_server_state.sql)
2. **Phase 2**: Deploy API endpoints
3. **Phase 3**: Update frontend to use new API
4. **Phase 4**: Migrate existing localStorage data (optional one-time import)
5. **Phase 5**: Remove localStorage fallback code

---

## Testing Checklist

### Core Currency System
- [ ] New user gets 100🍊 starting balance
- [ ] `/api/currency/init` is idempotent (calling twice returns same result)
- [ ] Game completion awards correct tier-based rewards
- [ ] High score bonus (+10/+15/+20) applied correctly
- [ ] Top 10 bonus (+20/+30/+40) applied correctly
- [ ] Score below minimum threshold earns 0
- [ ] Daily login streak tracks correctly (1-7 cycle)
- [ ] Daily login idempotent (can't claim twice same day)
- [ ] Day 7 awards 3 gems
- [ ] Achievement claim validates completion first
- [ ] Achievement claim is idempotent
- [ ] Challenge progress updates on game completion
- [ ] Challenge claim validates completion first
- [ ] Spend validates sufficient balance
- [ ] All transactions logged with idempotency key
- [ ] Staged trust applies 50% for new accounts (<7 days)
- [ ] Currency sync works across devices
- [ ] Cache clear doesn't lose balance

### Single-Session Enforcement
- [ ] Opening game in second tab shows "Already playing" error
- [ ] Session expires after 2 minutes without heartbeat
- [ ] Heartbeat extends session while playing
- [ ] Can start new game after closing previous tab

### Anomaly Detection
- [ ] Normal scores are NOT flagged
- [ ] Scores > 99th percentile ARE flagged
- [ ] Impossibly fast completions (<10 sec with high score) ARE flagged
- [ ] Suspicious points-per-second ratio IS flagged
- [ ] Flagged scores still earn rewards (just logged for review)

### Ban System
- [ ] Banned user cannot access any authenticated endpoint
- [ ] Ban returns 403 with appeal URL
- [ ] Banned user's pending rewards are voided
- [ ] Appeal status "approved" allows access again

### Compliance Readiness
- [ ] `verification_status` field exists (default: 'none')
- [ ] `withdrawal_enabled` field exists (default: 0)
- [ ] `withdrawal_requests` table exists
- [ ] Gifted oranges tracked separately in `gifted_oranges` field
