# Economy System Patterns

> Last updated: 2026-01-21
> Full spec: `claude-specs/10-ECONOMY-MASTERPLAN-SPEC.md`
> Server implementation: `claude-specs/11-SERVER-STATE-SPEC.md`

## Quick Reference

### Currencies
| Currency | Symbol | Earning | Spending |
|----------|--------|---------|----------|
| Oranges | 🍊 | Gameplay, challenges, leaderboards, login | Shop, voting, gifts |
| Gems | 💎 | Login streaks (3/week), convert oranges | Premium items (soulbound) |

### Conversion Rates (Future - Disabled Now)
```
10,000 🍊 = 1 HOA token (~$0.00143 USD)
1,500 🍊 = 1 💎 (max 10💎/month)
```

---

## Earning Oranges

### Onboarding
| Event | Reward |
|-------|--------|
| Account creation | 100 🍊 |
| Complete tutorial | 250 🍊 |
| Connect wallet (NFT holders) | 500 🍊 |

### Daily Login Streak (always +15)
```
Day 1: 15🍊 | Day 2: 30🍊 | Day 3: 45🍊 | Day 4: 60🍊
Day 5: 75🍊 | Day 6: 90🍊 | Day 7: 105🍊 + 3💎
Weekly total: 420🍊 + 3💎
```

### Game Tiers
| Tier | Base | High Score | Top 10 | Max | Games |
|------|------|------------|--------|-----|-------|
| Easy | 5🍊 | +10🍊 | +20🍊 | 35🍊 | memory-match, color-reaction, orange-snake, citrus-drop, wojak-whack |
| Medium | 10🍊 | +15🍊 | +30🍊 | 55🍊 | orange-pong, merge-2048, block-puzzle, brick-breaker, orange-wordle |
| Hard | 15🍊 | +20🍊 | +40🍊 | 75🍊 | flappy-orange, wojak-runner, orange-stack, knife-game, orange-juggle |

**Validation**: Must reach minimum score threshold per game. Instant quits earn 0.

### Daily Challenges
```
Easy:   Play 5 games        → 30🍊
Medium: Set personal best   → 50🍊
Hard:   Play 10 minutes     → 70🍊
Total:  150🍊 (no bonus for all 3)
```

### Leaderboard Rewards (Per Game)
**Daily**: #1=20, #2=15, #3=10, #4-10=5, #11-20=2, #21-50=1
**Weekly**: #1=350, #2=210, #3=105
**Monthly**: #1=1400, #2=700, #3=350

---

## Server-Side State Architecture

### Key Principles
1. **Single source of truth** - D1 database, not localStorage
2. **Atomic transactions** - Currency + log update together
3. **Idempotent APIs** - Safe to retry (uses idempotency keys)
4. **Complete audit trail** - Every change logged

### Database Tables (Migration 008)
```sql
user_currency          -- Balances (oranges, gems, gifted_oranges)
currency_transactions  -- Audit log with idempotency keys
user_achievements      -- Progress and claim status
user_stats             -- Aggregated stats for achievements
game_sessions          -- Prevents replay attacks
daily_login_claims     -- Prevents double-claiming
daily_challenge_progress
active_sessions        -- Single-session enforcement
flagged_scores         -- Anomaly detection
banned_users           -- Zero tolerance cheater bans
withdrawal_requests    -- Future crypto withdrawals
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/currency` | GET | Get balance |
| `/api/currency/init` | POST | Initialize new user |
| `/api/currency/spend` | POST | Shop purchases |
| `/api/gameplay/complete` | POST | Earn game rewards |
| `/api/daily-login/claim` | POST | Claim daily login |
| `/api/achievements/claim` | POST | Claim achievement |
| `/api/challenges/claim` | POST | Claim challenge |
| `/api/game/start` | POST | Start session (enforces single-session) |
| `/api/game/heartbeat` | POST | Keep session alive |

### Idempotency Key Patterns
```typescript
// Game completion
`game_${sessionId}`

// Daily login
`daily_${userId}_${date}_oranges`

// Achievement
`achievement_${userId}_${achievementId}`

// Challenge
`challenge_${userId}_${date}_${challengeId}`
```

---

## Anti-Cheat Systems

### Single-Session Enforcement
- Only one active game per user
- 30-second heartbeat keeps session alive
- 2-minute timeout for abandoned sessions

### Anomaly Detection (Flag, Don't Block)
Triggers after 100+ games for statistical significance:
1. Score > 99th percentile (3x avg AND beats max)
2. Completion < 10 seconds with above-average score
3. Points-per-second > 5x normal

### Ban System
- **Zero tolerance** - Immediate permanent ban for confirmed cheating
- Void all pending rewards on ban
- Appeal option available (appeal_status field)

### Staged Trust
- New accounts (<7 days) earn 50% rewards
- Full rewards after trust period

---

## Key Decisions (User Confirmed)

| Decision | Choice |
|----------|--------|
| Migration | Clean slate (all start fresh) |
| Reward display | Simple total ("+25🍊") |
| Balance privacy | Full transparency |
| Rate limits | None |
| Concurrent play | Block (one session only) |
| Cheater handling | Immediate permanent ban |
| Offline handling | Lost progress |
| Gifted oranges | Single balance (split at withdrawal) |

---

## Config File Location

Central config: `src/config/economy.ts`

```typescript
// Import these for any economy-related code
import {
  DAILY_LOGIN_REWARDS,
  GAME_TIERS,
  GAME_TIER_MAP,
  GAME_MIN_SCORES,
  LEADERBOARD_REWARDS,
  GEM_CONFIG,
  SHOP_PRICES,
} from '@/config/economy';
```

---

## Monthly Projections

| Player Type | Daily | Monthly |
|-------------|-------|---------|
| Grinder (2+ hrs) | ~800🍊 | ~24,000🍊 |
| Regular (30-60 min) | ~400🍊 | ~12,000🍊 |
| Casual (10-20 min, 3x/week) | ~80🍊 | ~1,000🍊 |

**100 active players** ≈ 1,380,000🍊/month ≈ 138 HOA ≈ **$0.20 USD**
