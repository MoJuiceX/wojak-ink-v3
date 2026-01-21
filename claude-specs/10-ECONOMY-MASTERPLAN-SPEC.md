# SPEC 10: Economy Masterplan - In-Game Currency System

> **For Claude CLI**: This specification defines the complete in-game economy. Crypto conversion is a FUTURE feature and not part of this implementation.

---

## Overview

This spec defines how players earn and spend oranges (🍊) and gems (💎) in wojak.ink. The economy is designed to be:

1. **Fair** - No pay-to-win, cosmetics only
2. **Engaging** - Rewards gameplay over passive login
3. **Sustainable** - Balanced earning/spending to prevent inflation
4. **Anti-abuse** - Protected against bots and farming

---

## Currency Summary

| Currency | Symbol | How to Earn | What to Buy |
|----------|--------|-------------|-------------|
| **Oranges** | 🍊 | Gameplay, challenges, leaderboards, login | Regular shop, voting, gifts, upgrades |
| **Gems** | 💎 | Login streaks (3/week), convert oranges (10/month max) | Premium exclusives (soulbound) |

---

## Part 1: Earning Oranges

### Starting & Onboarding

| Event | Reward |
|-------|--------|
| Account creation | 100 🍊 |
| Complete tutorial | +250 🍊 + 1 free cosmetic |
| Connect wallet (NFT holders only) | +500 🍊 |

### Daily Login Streak (Simple +15 progression)

| Day | Oranges | Notes |
|-----|---------|-------|
| 1 | 15 🍊 | |
| 2 | 30 🍊 | |
| 3 | 45 🍊 | |
| 4 | 60 🍊 | |
| 5 | 75 🍊 | |
| 6 | 90 🍊 | |
| 7 | 105 🍊 | Streak complete! +3💎 |
| **Weekly Total** | **420 🍊 + 3💎** | Resets to day 1 |

```typescript
// src/config/economy.ts

export const DAILY_LOGIN_REWARDS = [
  { day: 1, oranges: 15 },
  { day: 2, oranges: 30 },
  { day: 3, oranges: 45 },
  { day: 4, oranges: 60 },
  { day: 5, oranges: 75 },
  { day: 6, oranges: 90 },
  { day: 7, oranges: 105, gems: 3 },
];
```

### Game Tiers

Games are categorized into 3 difficulty tiers with different rewards:

| Tier | Base Reward | High Score Bonus | Top 10 Bonus | Example Games |
|------|-------------|------------------|--------------|---------------|
| **Easy** | 5 🍊 | +10 🍊 | +20 🍊 | Memory Match, Color Reaction, Orange Snake |
| **Medium** | 10 🍊 | +15 🍊 | +30 🍊 | Orange Pong, Merge 2048, Block Puzzle, Brick Breaker |
| **Hard** | 15 🍊 | +20 🍊 | +40 🍊 | Flappy Orange, Wojak Runner, Orange Stack, Knife Game |

**Validation Rule**: Must reach minimum score threshold per game. Instant quits/deaths earn 0.

```typescript
export type GameTier = 'easy' | 'medium' | 'hard';

export const GAME_TIERS: Record<GameTier, {
  baseReward: number;
  highScoreBonus: number;
  top10Bonus: number;
}> = {
  easy: { baseReward: 5, highScoreBonus: 10, top10Bonus: 20 },
  medium: { baseReward: 10, highScoreBonus: 15, top10Bonus: 30 },
  hard: { baseReward: 15, highScoreBonus: 20, top10Bonus: 40 },
};

// Game tier assignments
export const GAME_TIER_MAP: Record<string, GameTier> = {
  // Easy tier (5🍊 base)
  'memory-match': 'easy',
  'color-reaction': 'easy',
  'orange-snake': 'easy',
  'citrus-drop': 'easy',
  'wojak-whack': 'easy',

  // Medium tier (10🍊 base)
  'orange-pong': 'medium',
  'merge-2048': 'medium',
  'block-puzzle': 'medium',
  'brick-breaker': 'medium',
  'orange-wordle': 'medium',

  // Hard tier (15🍊 base)
  'flappy-orange': 'hard',
  'wojak-runner': 'hard',
  'orange-stack': 'hard',
  'knife-game': 'hard',
  'orange-juggle': 'hard',
};

// Per-game minimum scores
export const GAME_MIN_SCORES: Record<string, number> = {
  // Easy tier
  'memory-match': 4,       // Must match 4 pairs
  'color-reaction': 5,     // Must get 5 correct
  'orange-snake': 5,       // Must eat 5 items
  'citrus-drop': 3,        // Must catch 3 items
  'wojak-whack': 5,        // Must whack 5 wojaks

  // Medium tier
  'orange-pong': 3,        // Must score 3 points
  'merge-2048': 256,       // Must reach 256 tile
  'block-puzzle': 100,     // Must score 100 points
  'brick-breaker': 50,     // Must score 50 points
  'orange-wordle': 1,      // Must complete 1 word

  // Hard tier
  'flappy-orange': 5,      // Must pass 5 pipes
  'wojak-runner': 100,     // Must run 100 meters
  'orange-stack': 5,       // Must stack 5 blocks
  'knife-game': 10,        // Must stick 10 knives
  'orange-juggle': 10,     // Must juggle 10 times
};
```

### Gameplay Rewards Summary

| Source | Easy | Medium | Hard |
|--------|------|--------|------|
| Base (reach min score) | 5 🍊 | 10 🍊 | 15 🍊 |
| High score bonus | +10 🍊 | +15 🍊 | +20 🍊 |
| Top 10 placement | +20 🍊 | +30 🍊 | +40 🍊 |
| **Max per game** | **35 🍊** | **55 🍊** | **75 🍊** |

### Daily Challenges (No bonus - simple and clean)

| Difficulty | Challenge | Reward |
|------------|-----------|--------|
| Easy | Play 5 games | 30 🍊 |
| Medium | Set a new personal best | 50 🍊 |
| Hard | Play for 10 minutes | 70 🍊 |
| **Daily Total** | | **150 🍊** |

```typescript
export const DAILY_CHALLENGES = [
  { id: 'games-played-5', reward: 30, difficulty: 'easy' },
  { id: 'personal-best-1', reward: 50, difficulty: 'medium' },
  { id: 'play-time-600', reward: 70, difficulty: 'hard' },
];

// No bonus for completing all 3 - just the straightforward rewards
```

### Leaderboard Rewards (Per Game, ELO-Based)

**Daily Rewards:**

| Rank | Reward |
|------|--------|
| #1 | 20 🍊 |
| #2 | 15 🍊 |
| #3 | 10 🍊 |
| #4-10 | 5 🍊 each |
| #11-20 | 2 🍊 each |
| #21-50 | 1 🍊 each |

**Weekly Rewards (Top 3 only):**

| Rank | Reward |
|------|--------|
| #1 | 350 🍊 |
| #2 | 210 🍊 |
| #3 | 105 🍊 |

**Monthly Rewards (Top 3 only):**

| Rank | Reward |
|------|--------|
| #1 | 1,400 🍊 |
| #2 | 700 🍊 |
| #3 | 350 🍊 |

```typescript
export const LEADERBOARD_REWARDS = {
  daily: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 20 },
      { minRank: 2, maxRank: 2, reward: 15 },
      { minRank: 3, maxRank: 3, reward: 10 },
      { minRank: 4, maxRank: 10, reward: 5 },
      { minRank: 11, maxRank: 20, reward: 2 },
      { minRank: 21, maxRank: 50, reward: 1 },
    ],
  },
  weekly: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 350 },
      { minRank: 2, maxRank: 2, reward: 210 },
      { minRank: 3, maxRank: 3, reward: 105 },
    ],
  },
  monthly: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 1400 },
      { minRank: 2, maxRank: 2, reward: 700 },
      { minRank: 3, maxRank: 3, reward: 350 },
    ],
  },
};
```

### Monthly Earning Projections

| Player Type | Daily | Weekly | Monthly |
|-------------|-------|--------|---------|
| Grinder (2+ hrs/day) | ~800 🍊 | ~5,600 🍊 | ~24,000 🍊 |
| Regular (30-60 min/day) | ~400 🍊 | ~2,800 🍊 | ~12,000 🍊 |
| Casual (10-20 min, 3x/week) | ~80 🍊 | ~240 🍊 | ~1,000 🍊 |

---

## Part 2: Earning Gems

### Login Streak Gems

| Event | Gems |
|-------|------|
| Complete 7-day streak | 3 💎 |
| Monthly max from streaks | ~12 💎 |

### Converting Oranges to Gems

| Parameter | Value |
|-----------|-------|
| Rate | 1,500 🍊 = 1 💎 |
| Monthly cap | **10 💎 max** |
| No limit | Convert anytime (within cap) |

```typescript
export const GEM_CONVERSION = {
  orangesPerGem: 1500,
  monthlyConversionCap: 10,
};

export const GEM_LOGIN_STREAK = {
  gemsPerStreak: 3,
  streakDays: 7,
};
```

### Monthly Gem Access

| Source | Max |
|--------|-----|
| Login streaks | ~12 💎 |
| Orange conversion | 10 💎 |
| **Total possible** | **22 💎/month** |

---

## Part 3: Spending Oranges

### Regular Shop Items

| Category | Price Range | Examples |
|----------|-------------|----------|
| Common cosmetics | 500-800 🍊 | Cool Shades, Confetti Burst |
| Rare cosmetics | 1,000-1,500 🍊 | Golden Frame, Champion Title |
| Epic cosmetics | 2,000-2,500 🍊 | Royal Crown, Fire Frame |
| Limited badges | 3,000 🍊 | OG Badge |
| Prestige items | 10,000-50,000 🍊 | Animated effects, Legendary titles |

### Voting System (Recurring Sink)

| Item | Price |
|------|-------|
| 10 Donuts (👍) | 50 🍊 |
| 10 Poops (💩) | 50 🍊 |

### Cosmetic Upgrade System (Evergreen Sink)

| Upgrade | Cost | Result |
|---------|------|--------|
| Frame Lv1 → Lv2 | 500 🍊 | Enhanced glow |
| Frame Lv2 → Lv3 | 1,000 🍊 | Animated effect |
| Color variant | 300 🍊 | Recolor existing item |
| Style variant | 500 🍊 | Alternative design |

```typescript
export const COSMETIC_UPGRADES = {
  frameLv1ToLv2: 500,
  frameLv2ToLv3: 1000,
  colorVariant: 300,
  styleVariant: 500,
};
```

### Gifting

| Rule | Value |
|------|-------|
| Daily send limit | 500 🍊/day |
| Items giftable | Regular (orange) items only |
| Restriction | Gifted 🍊 cannot convert to gems |

```typescript
export const GIFTING_RULES = {
  dailySendLimit: 500,
  giftedOrangesConvertible: false, // Cannot convert to gems
};
```

---

## Part 4: Spending Gems (Premium Shop)

### Premium Items (Soulbound)

| Tier | Price | Examples |
|------|-------|----------|
| Entry | 10-15 💎 | Basic animated frame, Simple title |
| Mid | 20-25 💎 | Premium frame, Profile theme |
| High | 50-75 💎 | Animated effects bundle, Rare badge |
| Ultra | 100 💎 | Legendary collection |

### Premium Rules

| Rule | Value |
|------|-------|
| Giftable | **No** - soulbound to account |
| Tradeable | No |
| Purchasable with oranges | No - gems only |

```typescript
export const PREMIUM_ITEMS = {
  soulbound: true, // Cannot be gifted or traded
  purchaseWithOranges: false,
};
```

### Time to Earn Premium Items

| Tier | Gems | Grinder | Regular | Casual |
|------|------|---------|---------|--------|
| Entry (10💎) | 10 | ~3 weeks | ~1 month | ~2 months |
| Mid (25💎) | 25 | ~1.5 months | ~2 months | ~4 months |
| High (50💎) | 50 | ~3 months | ~4 months | ~8 months |
| Ultra (100💎) | 100 | ~5 months | ~7 months | ~1 year+ |

---

## Part 5: Anti-Abuse Measures

### Bot Detection (Privacy-Respecting)

| Method | Implementation |
|--------|----------------|
| Behavioral analysis | Mouse/touch patterns, input variance |
| Device fingerprinting | Browser/hardware signatures |
| IP reputation | Known bot IP detection |
| Server anomaly detection | Inhuman patterns (perfect timing, etc.) |
| Staged trust | New accounts earn 50% for 7 days |

```typescript
export const ANTI_BOT = {
  stagedTrustDays: 7,
  stagedTrustMultiplier: 0.5, // 50% rewards for new accounts
  suspiciousGamesThreshold: 50, // Flag after 50 games/day
};
```

### Leaderboard Protection

| Feature | Implementation |
|---------|----------------|
| Ranking method | ELO/Glicko skill rating (not raw scores) |
| Payout timing | Weekly/Monthly (48hr review before finalization) |
| New player protection | Separate rookie brackets for 30 days |

### Validation Rules

| Rule | Value |
|------|-------|
| Minimum score | Per-game threshold required for rewards |
| Staged trust | New accounts earn 50% for first 7 days |

---

## Part 6: Configuration Constants

### Master Config File

**File: `src/config/economy.ts`**

```typescript
/**
 * Wojak.ink Economy Configuration
 *
 * All currency earning and spending values in one place.
 * Adjust these values to tune the economy.
 */

// ============ STARTING BALANCE ============
export const STARTING_BALANCE = {
  oranges: 100,
  gems: 0,
};

export const ONBOARDING_REWARDS = {
  tutorial: { oranges: 250, freeCosmetic: true },
  walletConnect: { oranges: 500, requiresNft: true },
};

// ============ LOGIN REWARDS ============
export const DAILY_LOGIN_REWARDS = [
  { day: 1, oranges: 15, gems: 0 },
  { day: 2, oranges: 30, gems: 0 },
  { day: 3, oranges: 45, gems: 0 },
  { day: 4, oranges: 60, gems: 0 },
  { day: 5, oranges: 75, gems: 0 },
  { day: 6, oranges: 90, gems: 0 },
  { day: 7, oranges: 105, gems: 3 }, // Gems on day 7
];

// ============ GAME TIERS & REWARDS ============
export type GameTier = 'easy' | 'medium' | 'hard';

export const GAME_TIERS: Record<GameTier, {
  baseReward: number;
  highScoreBonus: number;
  top10Bonus: number;
}> = {
  easy: { baseReward: 5, highScoreBonus: 10, top10Bonus: 20 },
  medium: { baseReward: 10, highScoreBonus: 15, top10Bonus: 30 },
  hard: { baseReward: 15, highScoreBonus: 20, top10Bonus: 40 },
};

export const GAME_TIER_MAP: Record<string, GameTier> = {
  // Easy tier (5🍊 base)
  'memory-match': 'easy',
  'color-reaction': 'easy',
  'orange-snake': 'easy',
  'citrus-drop': 'easy',
  'wojak-whack': 'easy',

  // Medium tier (10🍊 base)
  'orange-pong': 'medium',
  'merge-2048': 'medium',
  'block-puzzle': 'medium',
  'brick-breaker': 'medium',
  'orange-wordle': 'medium',

  // Hard tier (15🍊 base)
  'flappy-orange': 'hard',
  'wojak-runner': 'hard',
  'orange-stack': 'hard',
  'knife-game': 'hard',
  'orange-juggle': 'hard',
};

// ============ DAILY CHALLENGES ============
export const DAILY_CHALLENGES = {
  easy: { target: 5, reward: 30, type: 'games_played' },
  medium: { target: 1, reward: 50, type: 'personal_best' },
  hard: { target: 600, reward: 70, type: 'play_time_seconds' },
  // No bonus for completing all 3
};

// ============ LEADERBOARD REWARDS ============
export const LEADERBOARD_REWARDS = {
  daily: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 20 },
      { minRank: 2, maxRank: 2, reward: 15 },
      { minRank: 3, maxRank: 3, reward: 10 },
      { minRank: 4, maxRank: 10, reward: 5 },
      { minRank: 11, maxRank: 20, reward: 2 },
      { minRank: 21, maxRank: 50, reward: 1 },
    ],
  },
  weekly: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 350 },
      { minRank: 2, maxRank: 2, reward: 210 },
      { minRank: 3, maxRank: 3, reward: 105 },
    ],
  },
  monthly: {
    tiers: [
      { minRank: 1, maxRank: 1, reward: 1400 },
      { minRank: 2, maxRank: 2, reward: 700 },
      { minRank: 3, maxRank: 3, reward: 350 },
    ],
  },
};

// ============ GEM ECONOMY ============
export const GEM_CONFIG = {
  orangesPerGem: 1500,
  monthlyConversionCap: 10,
  loginStreakGems: 3, // Gems per 7-day streak
};

// ============ SHOP PRICES ============
export const SHOP_PRICES = {
  // Orange items
  common: { min: 500, max: 800 },
  rare: { min: 1000, max: 1500 },
  epic: { min: 2000, max: 2500 },
  limited: { min: 3000, max: 5000 },
  prestige: { min: 10000, max: 50000 },

  // Voting
  votingPack: 50, // 10 donuts OR 10 poops

  // Upgrades
  upgradeLv1ToLv2: 500,
  upgradeLv2ToLv3: 1000,
  colorVariant: 300,
  styleVariant: 500,
};

export const PREMIUM_PRICES = {
  entry: { min: 10, max: 15 },
  mid: { min: 20, max: 25 },
  high: { min: 50, max: 75 },
  ultra: { min: 100, max: 100 },
};

// ============ GIFTING ============
export const GIFTING_CONFIG = {
  dailySendLimit: 500,
  giftedOrangesConvertible: false,
  premiumItemsGiftable: false, // Soulbound
};

// ============ ANTI-ABUSE ============
export const ANTI_ABUSE = {
  stagedTrustDays: 7,
  stagedTrustMultiplier: 0.5,
  suspiciousGamesPerDay: 50,
  leaderboardReviewDelayHours: 48,
  rookieBracketDays: 30,
};
```

---

## Part 7: Database Schema Updates

### Currency Tracking

```sql
-- Update profiles table
ALTER TABLE profiles ADD COLUMN oranges INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN gems INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN lifetime_oranges INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN lifetime_gems INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN gifted_oranges INTEGER DEFAULT 0; -- Non-convertible
ALTER TABLE profiles ADD COLUMN gems_converted_this_month INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN gem_conversion_reset_date TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_oranges ON profiles(oranges);
CREATE INDEX IF NOT EXISTS idx_profiles_gems ON profiles(gems);
```

### Transaction History

```sql
CREATE TABLE IF NOT EXISTS currency_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  currency_type TEXT NOT NULL CHECK (currency_type IN ('oranges', 'gems')),
  amount INTEGER NOT NULL, -- Positive = earn, negative = spend
  source TEXT NOT NULL, -- 'gameplay', 'challenge', 'login', 'shop', 'gift', 'conversion'
  source_details TEXT, -- JSON with additional context
  balance_after INTEGER NOT NULL,
  is_gifted BOOLEAN DEFAULT 0, -- Tracks if from gift (non-convertible)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON currency_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON currency_transactions(source);
```

---

## Part 8: Implementation Checklist

### Phase 1: Core Currency System
- [ ] Create `src/config/economy.ts` with all constants
- [ ] Update profiles table with currency columns
- [ ] Create CurrencyContext with earn/spend functions
- [ ] Implement transaction logging

### Phase 2: Earning
- [ ] Login streak rewards
- [ ] Gameplay rewards with score validation
- [ ] Daily challenges with tracking
- [ ] Leaderboard rewards (ELO-based)

### Phase 3: Spending
- [ ] Shop purchases
- [ ] Voting system (donuts/poops)
- [ ] Cosmetic upgrade system
- [ ] Gifting with restrictions

### Phase 4: Gems
- [ ] Orange → Gem conversion with cap
- [ ] Premium shop (soulbound items)
- [ ] Monthly reset for conversion cap

### Phase 5: Anti-Abuse
- [ ] Staged trust for new accounts
- [ ] Score validation per game
- [ ] Gift tracking (non-convertible flag)
- [ ] Behavioral analysis hooks

---

## Future: Crypto Conversion (Separate Spec)

> **Note**: Crypto conversion (🍊 → HOA) will be implemented in a future spec after the in-game economy is stable and tested. Key features planned:
> - NFT holders only
> - Monthly pool with pro-rata distribution
> - 14-day maturation window
> - Dynamic rate adjustment
> - Gifted oranges excluded

---

## Testing Checklist

- [ ] Starting balance is 100 oranges
- [ ] Tutorial gives 250 oranges + cosmetic
- [ ] Wallet connect (NFT) gives 500 oranges
- [ ] Login streak progresses correctly (15→30→45→60→75→90→105)
- [ ] Day 7 streak gives 3 gems
- [ ] Easy games give 5🍊 base, +10 high score, +20 top 10
- [ ] Medium games give 10🍊 base, +15 high score, +30 top 10
- [ ] Hard games give 15🍊 base, +20 high score, +40 top 10
- [ ] Score validation prevents instant-quit farming
- [ ] Daily challenges: 30 (play 5), 50 (personal best), 70 (10 min) = 150🍊 total
- [ ] No bonus for completing all 3 challenges
- [ ] Daily leaderboard: #1=20, #2=15, #3=10, #4-10=5, #11-20=2, #21-50=1
- [ ] Leaderboard uses ELO/skill rating
- [ ] Orange→Gem conversion at 1,500:1
- [ ] Gem conversion capped at 10/month
- [ ] Premium items are soulbound (cannot gift)
- [ ] Gifted oranges tracked separately
- [ ] Gifted oranges cannot convert to gems
- [ ] Gift sending limited to 500/day
- [ ] New accounts earn 50% for 7 days
- [ ] Transaction history logs all changes
