# SPEC 09: Economy Configuration & Future Crypto Conversion

> **For Claude CLI**: This specification contains economy constants and configuration. These values are referenced by other systems.

---

## Overview

This spec defines the central economy configuration for wojak.ink, including earning rates, spending costs, and future crypto conversion ratios.

**Key Design Decisions:**
- All earning rates reduced 30% from initial estimates for sustainability
- Crypto conversion is a FUTURE feature (no withdrawals yet)
- Conversion rates: 10,000 🍊 = 1 HOA, 1,000 💎 = 1 $CHIA

---

## Token Price Reference (January 2026)

| Token | Rate | USD Value |
|-------|------|-----------|
| XCH (Chia) | - | ~$4.50 |
| $CHIA (CAT) | 1 XCH = 245.73 $CHIA | ~$0.018 |
| HOA (CAT) | 1 XCH = 3,138.70 HOA | ~$0.00143 |

---

## Conversion Rates (Future Feature)

```typescript
// src/config/economy.ts

/**
 * Economy Configuration
 *
 * Central configuration for all currency-related values.
 * Crypto conversion is a future feature - currently disabled.
 */

// Conversion rates (when withdrawals are enabled)
export const CRYPTO_CONVERSION = {
  // 10,000 oranges = 1 HOA token
  ORANGES_PER_HOA: 10_000,

  // 1,000 gems = 1 $CHIA token
  GEMS_PER_CHIA: 1_000,

  // Withdrawals currently disabled
  WITHDRAWALS_ENABLED: false,

  // Minimum withdrawal amounts (when enabled)
  MIN_ORANGE_WITHDRAWAL: 100_000, // 10 HOA minimum
  MIN_GEM_WITHDRAWAL: 1_000,      // 1 $CHIA minimum
};

// Estimated USD values (for display only, not guaranteed)
export const ESTIMATED_VALUES = {
  HOA_USD: 0.00143,
  CHIA_USD: 0.018,
  XCH_USD: 4.50,
};
```

---

## Earning Rates (Simplified for clarity)

### Starting Balance
```typescript
export const STARTING_BALANCE = {
  oranges: 100,
  gems: 0,
};

export const ONBOARDING_REWARDS = {
  tutorial: { oranges: 250, freeCosmetic: true },
  walletConnect: { oranges: 500, requiresNft: true },
};
```

### Daily Login Streak (Simple +15 progression)
```typescript
export const DAILY_LOGIN_REWARDS = [
  { day: 1, oranges: 15, gems: 0 },
  { day: 2, oranges: 30, gems: 0 },
  { day: 3, oranges: 45, gems: 0 },
  { day: 4, oranges: 60, gems: 0 },
  { day: 5, oranges: 75, gems: 0 },
  { day: 6, oranges: 90, gems: 0 },
  { day: 7, oranges: 105, gems: 3 },
];
// Weekly total: 420 oranges + 3 gems
```

### Daily Challenges (No bonus - simple)
```typescript
export const DAILY_CHALLENGE_REWARDS = {
  easy: 30,      // Play 5 games
  medium: 50,    // Set personal best
  hard: 70,      // Play 10 minutes
  // No bonus for completing all 3
};
// Daily max: 150 oranges (30 + 50 + 70)
```

### Leaderboard Rewards (Per Game)
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

### Gameplay Rewards (Tier-Based)
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

// Max per game: Easy=35, Medium=55, Hard=75
```

---

## Spending Costs (Shop Items)

```typescript
export const SHOP_PRICES = {
  // Orange items (soft currency)
  common: { min: 500, max: 800 },
  rare: { min: 1000, max: 1500 },
  epic: { min: 2000, max: 2500 },
  limited: { min: 3000, max: 5000 },

  // Gem items (hard currency)
  premiumCommon: { min: 5, max: 10 },
  premiumRare: { min: 10, max: 20 },
  premiumEpic: { min: 20, max: 50 },
  premiumLegendary: { min: 50, max: 100 },

  // Gameplay
  continueGame: 50,
};
```

---

## Economy Projections

### Per Player (Active Daily)

| Source | Daily | Weekly | Monthly |
|--------|-------|--------|---------|
| Login streak | ~60 | 420 | ~1,800 |
| Daily challenges | 150 | 1,050 | ~4,500 |
| Gameplay (10 games, avg medium) | ~200 | 1,400 | ~6,000 |
| Leaderboard (avg top 50) | ~50 | ~350 | ~1,500 |
| **TOTAL** | **~460** | **~3,220** | **~13,800** |

### Crypto Value (100 Players, Future)

| Currency | Monthly Total | Crypto Amount | USD Value |
|----------|---------------|---------------|-----------|
| Oranges | 1,380,000 | 138 HOA | ~$0.20 |
| Gems | ~1,200 | 1.2 $CHIA | ~$0.02 |
| **Total** | - | - | **~$0.22** |

This means if/when crypto withdrawals are enabled, 100 active players would generate ~$0.22/month in crypto payouts - extremely sustainable.

---

## Time to Earn Shop Items

| Item Type | Cost | Days to Earn (casual ~150/day) | Days to Earn (dedicated ~460/day) |
|-----------|------|--------------------------------|-----------------------------------|
| Common | 500 🍊 | ~3 days | ~1 day |
| Rare | 1,000 🍊 | ~7 days | ~2 days |
| Epic | 2,000 🍊 | ~2 weeks | ~4 days |
| Limited | 3,000 🍊 | ~3 weeks | ~1 week |
| Premium (10💎) | 15,000 🍊 conversion | ~3 months | ~1 month |
| Legendary (50💎) | 75,000 🍊 conversion | ~1.5 years | ~5 months |

---

## Implementation Notes

### Files to Update

1. **`src/config/economy.ts`** - Create with all constants above
2. **`src/contexts/CurrencyContext.tsx`** - Import from economy config
3. **Shop components** - Import prices from economy config
4. **Leaderboard rewards** - Import from economy config
5. **Daily challenges** - Import from economy config

### Centralization Benefits

- Single source of truth for all economy values
- Easy to adjust for balancing
- Clear documentation of conversion rates
- Future-proofing for crypto integration

---

## Testing Checklist

- [ ] Starting balance is 100🍊
- [ ] Tutorial reward is 250🍊
- [ ] Wallet connect (NFT) reward is 500🍊
- [ ] Daily login rewards: 15→30→45→60→75→90→105 (+3💎 on day 7)
- [ ] Daily challenges: 30 (easy) + 50 (medium) + 70 (hard) = 150🍊 total
- [ ] No bonus for completing all 3 challenges
- [ ] Game tiers: Easy=5🍊, Medium=10🍊, Hard=15🍊
- [ ] High score bonuses: Easy=+10, Medium=+15, Hard=+20
- [ ] Top 10 bonuses: Easy=+20, Medium=+30, Hard=+40
- [ ] Daily leaderboard: #1=20, #2=15, #3=10, #4-10=5, #11-20=2, #21-50=1
- [ ] Shop prices are imported from central config
- [ ] No hardcoded economy values outside of config
