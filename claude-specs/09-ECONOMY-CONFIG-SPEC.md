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

## Earning Rates (All values reduced 30%)

### Starting Balance
```typescript
export const STARTING_BALANCE = {
  oranges: 100,
  gems: 0,
};
```

### Daily Login Streak
```typescript
export const DAILY_LOGIN_REWARDS = [
  { day: 1, oranges: 70, gems: 0 },
  { day: 2, oranges: 105, gems: 0 },
  { day: 3, oranges: 140, gems: 0 },
  { day: 4, oranges: 175, gems: 1 },
  { day: 5, oranges: 210, gems: 0 },
  { day: 6, oranges: 280, gems: 1 },
  { day: 7, oranges: 350, gems: 3 },
];
// Weekly total: 1,330 oranges + 5 gems
```

### Daily Challenges
```typescript
export const DAILY_CHALLENGE_REWARDS = {
  easy: 35,      // Play 5 games
  medium: 52,    // Set personal best
  hard: 70,      // Play 10 minutes
  bonusPercent: 0.5, // 50% bonus for all 3
};
// Daily max: 235 oranges (157 base + 78 bonus)
```

### Leaderboard Rewards (Per Game)
```typescript
export const LEADERBOARD_REWARDS = {
  daily: {
    rank1: 17,
    rank2: 10,
    rank3: 3,
    rank4to10: 7,
    rank11to50: 2,
  },
  weekly: {
    rank1: 350,
    rank2: 210,
    rank3: 105,
  },
  monthly: {
    rank1: 1400,
    rank2: 700,
    rank3: 350,
  },
};
```

### Gameplay Rewards
```typescript
export const GAMEPLAY_REWARDS = {
  // Base rewards per game completion
  baseMin: 7,
  baseMax: 14,

  // Maximum possible per game
  maxPerGame: {
    easy: 140,
    medium: 280,
    hard: 420,
  },

  // Bonus for high scores
  highScoreBonus: {
    min: 17,
    max: 42,
  },

  // Bonus for top 10 leaderboard placement
  top10Bonus: {
    min: 35,
    max: 84,
  },
};
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
| Login streak | ~190 | 1,330 | ~5,700 |
| Daily challenges | 235 | 1,645 | ~7,050 |
| Gameplay (10 games) | ~1,050 | 7,350 | ~31,500 |
| Leaderboard (avg top 50) | ~80 | ~665 | ~2,850 |
| **TOTAL** | **~1,555** | **~10,990** | **~47,100** |

### Crypto Value (100 Players, Future)

| Currency | Monthly Total | Crypto Amount | USD Value |
|----------|---------------|---------------|-----------|
| Oranges | 4,710,000 | 471 HOA | ~$0.67 |
| Gems | ~1,500 | 1.5 $CHIA | ~$0.03 |
| **Total** | - | - | **~$0.70** |

This means if/when crypto withdrawals are enabled, 100 active players would generate ~$0.70/month in crypto payouts - extremely sustainable.

---

## Time to Earn Shop Items

| Item Type | Cost | Days to Earn (casual) | Days to Earn (dedicated) |
|-----------|------|----------------------|--------------------------|
| Common | 500 🍊 | ~1 day | <1 day |
| Rare | 1,000 🍊 | ~2 days | 1 day |
| Epic | 2,000 🍊 | ~4 days | 2 days |
| Limited | 3,000 🍊 | ~6 days | 3 days |
| Premium (10💎) | 1,000+ games | ~2 weeks | 1 week |
| Legendary (50💎) | 5,000+ games | ~2 months | 1 month |

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

- [ ] All earning rates match the 30% reduced values
- [ ] Shop prices are imported from central config
- [ ] Daily login rewards follow the 7-day streak
- [ ] Daily challenges use 35/52/70 rewards
- [ ] Leaderboard rewards use reduced values
- [ ] Gameplay rewards use reduced values
- [ ] No hardcoded economy values outside of config
