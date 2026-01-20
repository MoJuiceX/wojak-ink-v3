# Retention Patterns

> Patterns to keep players coming back day after day

---

## Overview

Retention is about creating compelling reasons for players to return. The best retention systems combine:
1. **External motivation** (rewards, unlocks)
2. **Internal motivation** (mastery, progress)
3. **Social motivation** (competition, community)

---

## Pattern: Daily Login Rewards

**Category:** Retention
**Impact:** High
**Effort:** Medium

### Problem
Players have no reason to return daily.

### Solution
Reward players just for showing up, with escalating rewards for consecutive days.

### Implementation

```typescript
interface DailyReward {
  day: number;
  reward: {
    type: 'coins' | 'skin' | 'power_up' | 'premium_currency';
    amount: number;
    name: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

const DAILY_REWARDS: DailyReward[] = [
  { day: 1, reward: { type: 'coins', amount: 100, name: '100 Coins' } },
  { day: 2, reward: { type: 'coins', amount: 150, name: '150 Coins' } },
  { day: 3, reward: { type: 'coins', amount: 200, name: '200 Coins' } },
  { day: 4, reward: { type: 'power_up', amount: 1, name: 'Shield', rarity: 'common' } },
  { day: 5, reward: { type: 'coins', amount: 300, name: '300 Coins' } },
  { day: 6, reward: { type: 'coins', amount: 400, name: '400 Coins' } },
  { day: 7, reward: { type: 'skin', amount: 1, name: 'Gold Wojak', rarity: 'rare' } },
];

interface PlayerDailyState {
  lastLoginDate: string;
  currentStreak: number;
  longestStreak: number;
  totalLogins: number;
}

const checkDailyReward = (state: PlayerDailyState): DailyReward | null => {
  const today = new Date().toDateString();
  const lastLogin = new Date(state.lastLoginDate).toDateString();

  if (today === lastLogin) {
    return null; // Already claimed today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isConsecutive = lastLogin === yesterday.toDateString();
  const newStreak = isConsecutive ? state.currentStreak + 1 : 1;
  const rewardDay = ((newStreak - 1) % DAILY_REWARDS.length) + 1;

  return DAILY_REWARDS.find(r => r.day === rewardDay) || DAILY_REWARDS[0];
};
```

### Best Practices
- Make Day 7 reward significantly better (creates weekly loop)
- Show upcoming rewards to create anticipation
- Allow "catch up" for premium players (miss one day, still keep streak)
- Reset at local midnight, not server time

### Metrics to Track
- Daily Active Users (DAU)
- D1/D7/D30 retention rates
- Average streak length
- Login time distribution

---

## Pattern: Streak System

**Category:** Retention
**Impact:** Very High
**Effort:** Medium

### Problem
Players don't feel invested in returning.

### Solution
Create visible streak counters that players don't want to break.

### Implementation

```typescript
interface Streak {
  current: number;
  longest: number;
  lastPlayDate: string;
  milestones: number[]; // 7, 14, 30, 100
  protectionUsed: boolean;
}

const STREAK_MILESTONES = [
  { days: 7, reward: 'Bronze Badge', multiplier: 1.1 },
  { days: 14, reward: 'Silver Badge', multiplier: 1.25 },
  { days: 30, reward: 'Gold Badge', multiplier: 1.5 },
  { days: 100, reward: 'Diamond Badge', multiplier: 2.0 },
];

const updateStreak = (streak: Streak): {
  newStreak: Streak;
  milestone?: typeof STREAK_MILESTONES[0];
  broken: boolean;
} => {
  const today = new Date().toDateString();
  const lastPlay = new Date(streak.lastPlayDate).toDateString();

  if (today === lastPlay) {
    return { newStreak: streak, broken: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = lastPlay === yesterday.toDateString();

  if (!isConsecutive && !streak.protectionUsed) {
    // Streak broken!
    return {
      newStreak: {
        ...streak,
        current: 1,
        lastPlayDate: today,
        protectionUsed: false,
      },
      broken: true,
    };
  }

  const newCurrent = streak.current + 1;
  const milestone = STREAK_MILESTONES.find(m => m.days === newCurrent);

  return {
    newStreak: {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastPlayDate: today,
      milestones: milestone
        ? [...streak.milestones, milestone.days]
        : streak.milestones,
      protectionUsed: !isConsecutive, // Used protection if not consecutive
    },
    milestone,
    broken: false,
  };
};
```

### Psychology
- **Loss aversion:** Players fear losing their streak more than they desire rewards
- **Sunk cost fallacy:** The longer the streak, the harder to let go
- **Social proof:** Display streaks on leaderboards

### Best Practices
- Offer "streak freeze" as premium feature or rare reward
- Send push notification at 8 PM if player hasn't logged in
- Show "STREAK AT RISK" warning 2 hours before reset
- Celebrate streak milestones with confetti, sounds, achievements

---

## Pattern: Daily Challenges

**Category:** Retention
**Impact:** High
**Effort:** High

### Problem
Gameplay becomes repetitive without goals.

### Solution
Daily rotating challenges that give players specific objectives.

### Implementation

```typescript
type ChallengeType =
  | 'score_total'      // Score 1000 points total
  | 'score_single'     // Score 50 in single game
  | 'play_count'       // Play 5 games
  | 'survive_time'     // Survive 60 seconds
  | 'no_hit'           // Complete without taking damage
  | 'collect'          // Collect 20 coins
  | 'streak'           // Get 10-streak
  | 'near_miss';       // Get 5 near-misses

interface Challenge {
  id: string;
  type: ChallengeType;
  target: number;
  current: number;
  reward: { type: string; amount: number };
  expiresAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CHALLENGE_TEMPLATES: Omit<Challenge, 'id' | 'current' | 'expiresAt'>[] = [
  // Easy
  { type: 'play_count', target: 3, reward: { type: 'coins', amount: 50 }, difficulty: 'easy' },
  { type: 'score_total', target: 500, reward: { type: 'coins', amount: 75 }, difficulty: 'easy' },

  // Medium
  { type: 'score_single', target: 30, reward: { type: 'coins', amount: 100 }, difficulty: 'medium' },
  { type: 'streak', target: 5, reward: { type: 'coins', amount: 100 }, difficulty: 'medium' },

  // Hard
  { type: 'score_single', target: 50, reward: { type: 'gems', amount: 5 }, difficulty: 'hard' },
  { type: 'no_hit', target: 1, reward: { type: 'skin_token', amount: 1 }, difficulty: 'hard' },
];

const generateDailyChallenges = (count: number = 3): Challenge[] => {
  const easy = CHALLENGE_TEMPLATES.filter(c => c.difficulty === 'easy');
  const medium = CHALLENGE_TEMPLATES.filter(c => c.difficulty === 'medium');
  const hard = CHALLENGE_TEMPLATES.filter(c => c.difficulty === 'hard');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return [
    { ...easy[Math.floor(Math.random() * easy.length)], id: 'easy', current: 0, expiresAt: tomorrow },
    { ...medium[Math.floor(Math.random() * medium.length)], id: 'medium', current: 0, expiresAt: tomorrow },
    { ...hard[Math.floor(Math.random() * hard.length)], id: 'hard', current: 0, expiresAt: tomorrow },
  ];
};
```

### Best Practices
- Always include 1 easy challenge (guaranteed completion)
- Hard challenge should be achievable but require skill
- Show progress bars on challenges during gameplay
- Bonus reward for completing all daily challenges

---

## Pattern: Progression System

**Category:** Retention
**Impact:** Very High
**Effort:** High

### Problem
Players feel they've "beaten" the game.

### Solution
Always have the next goal visible and attainable.

### Implementation

```typescript
interface Level {
  level: number;
  xpRequired: number;
  rewards: Reward[];
  title: string;
}

interface PlayerProgression {
  level: number;
  currentXP: number;
  totalXP: number;
  unlockedRewards: string[];
}

// XP curve: each level requires 10% more XP
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.1, level - 1));
};

const LEVEL_REWARDS: Record<number, Reward[]> = {
  5: [{ type: 'skin', id: 'blue_wojak' }],
  10: [{ type: 'title', id: 'Apprentice' }],
  15: [{ type: 'skin', id: 'golden_wojak' }],
  20: [{ type: 'feature', id: 'custom_death_effect' }],
  25: [{ type: 'title', id: 'Master' }],
  50: [{ type: 'skin', id: 'diamond_wojak', rarity: 'legendary' }],
  100: [{ type: 'title', id: 'Legend' }, { type: 'badge', id: 'centurion' }],
};

const addXP = (
  progression: PlayerProgression,
  xpGained: number
): {
  newProgression: PlayerProgression;
  leveledUp: boolean;
  newLevel?: number;
  rewards?: Reward[];
} => {
  const newTotalXP = progression.totalXP + xpGained;
  let newCurrentXP = progression.currentXP + xpGained;
  let newLevel = progression.level;
  let leveledUp = false;
  const rewards: Reward[] = [];

  // Check for level ups
  while (newCurrentXP >= getXPForLevel(newLevel)) {
    newCurrentXP -= getXPForLevel(newLevel);
    newLevel++;
    leveledUp = true;

    if (LEVEL_REWARDS[newLevel]) {
      rewards.push(...LEVEL_REWARDS[newLevel]);
    }
  }

  return {
    newProgression: {
      level: newLevel,
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
      unlockedRewards: [
        ...progression.unlockedRewards,
        ...rewards.map(r => r.id),
      ],
    },
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
    rewards: rewards.length > 0 ? rewards : undefined,
  };
};
```

### XP Sources
- Game completion: 10-50 XP based on score
- Challenge completion: 25-100 XP
- Daily login: 10 XP
- Achievements: 50-500 XP
- First play of day: 2x XP bonus

---

## Pattern: Seasonal Content

**Category:** Retention
**Impact:** High
**Effort:** Very High

### Problem
Content becomes stale over time.

### Solution
Time-limited events, themes, and exclusive content.

### Event Types
1. **Seasonal themes:** Halloween, Christmas, Summer
2. **Limited-time modes:** Double XP, Special rules
3. **Exclusive unlocks:** Only available during event
4. **Leaderboard resets:** Fresh competition

### Implementation Notes
- Announce events 1 week in advance
- Create FOMO with countdown timers
- Exclusive rewards should be cosmetic (not pay-to-win)
- Bring back popular events annually (nostalgia)

---

## Metrics Dashboard

Track these metrics to measure retention:

| Metric | Target | Formula |
|--------|--------|---------|
| D1 Retention | 40%+ | Players returning day after install |
| D7 Retention | 20%+ | Players returning 7 days after install |
| D30 Retention | 10%+ | Players returning 30 days after install |
| DAU/MAU | 20%+ | Daily active / Monthly active |
| Session Length | 5+ min | Average time per session |
| Sessions per Day | 2+ | Average sessions per DAU |

---

## Anti-Patterns (What NOT to do)

1. **Punishing absence:** Don't take away progress for not playing
2. **Impossible challenges:** Challenges should feel achievable
3. **Pay-to-skip everything:** Earned rewards feel better
4. **Hidden progress:** Always show how close to next goal
5. **Boring rewards:** Coins aren't exciting—skins are

---

## Sources

- *Hooked: How to Build Habit-Forming Products* by Nir Eyal
- GDC Talk: "The Science of Habit-Forming Games"
- Deconstructor of Fun blog
- GameRefinery benchmarks

---

Last Updated: 2024
