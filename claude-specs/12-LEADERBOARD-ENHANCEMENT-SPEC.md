# SPEC 12: Leaderboard Enhancement System

> **For Claude CLI**: This specification contains all decisions, research, and implementation details for the leaderboard enhancement project.

---

## Overview

Enhance the leaderboard system with three major features:
1. **Time Filtering** - Daily/Weekly/All-Time tabs with countdown timer
2. **Position Indicator** - Your rank, rival system, tier badges
3. **Personal Stats Panel** - Player statistics with progressive disclosure

---

## Research Summary

### Key Findings

| Topic | Finding | Source |
|-------|---------|--------|
| Time tabs | Weekly/Daily should be default, not All-Time (prevents elite domination) | UI Patterns, SportFitnessApps |
| Percentile vs Rank | Percentile ("Top 18%") more motivating than raw rank | Yu-kai Chou, Octalysis |
| Sticky footers | Problematic on mobile - eat screen space, keyboard issues | NN Group |
| Rival features | Competition alone improves performance (d=0.371-0.563) | Wharton Research |
| Cognitive load | Limit visible stats, use progressive disclosure | UX Magazine |
| Empty states | Poor empty states cause 40% retention drop in first week | Smashing Magazine |
| Streaks | Most powerful retention driver - loss aversion psychology | Game Analytics |

### Industry References
- **Duolingo**: 10-tier league system, weekly resets, countdown timer, 30-player groups
- **Clash Royale**: Trophy-based tiers, friend leaderboards, stat tracking platforms
- **General**: Bottom sheet pattern for mobile, percentile framing, micro-leaderboards

---

## Phase 1: Time Filtering

### Configuration

| Setting | Value |
|---------|-------|
| Tabs | Daily / Weekly / All-Time |
| Default tab | Weekly |
| Period type | Fixed (UTC-based) |
| Show countdown | Yes |

### Period Definitions

```
Daily:   00:00 UTC → 23:59 UTC (same calendar day)
Weekly:  Monday 00:00 UTC → Sunday 23:59 UTC
```

### UI Components

**Tab Bar:**
```
[ Today ] [ This Week ✓ ] [ All Time ]
```

**Countdown Timer:**
```
"Resets in 2d 14h 32m"  (for weekly)
"Resets in 14h 32m"     (for daily)
```

### Backend Changes

**File: `functions/api/leaderboard/[gameId].ts`**

Add `timeframe` query parameter:
```
GET /api/leaderboard/flappy-orange?timeframe=weekly&limit=100
```

SQL filtering:
```sql
-- Daily
WHERE game_id = ? AND created_at >= datetime('now', 'start of day')

-- Weekly (Monday start)
WHERE game_id = ? AND created_at >= datetime('now', 'weekday 0', '-7 days', 'start of day')

-- All-Time
WHERE game_id = ?
```

### Frontend Changes

**File: `src/components/Leaderboard/Leaderboard.tsx`**

1. Change tabs from 4 to 3 (remove Monthly)
2. Add countdown timer component
3. Pass timeframe to API fetch
4. Add timeframe to useEffect dependencies

**New Component: `src/components/Leaderboard/CountdownTimer.tsx`**

```tsx
interface CountdownTimerProps {
  timeframe: 'daily' | 'weekly' | 'all-time';
}
```

---

## Phase 2: Position Indicator

### Configuration

| Setting | Value |
|---------|-------|
| Desktop display | Always visible sticky footer |
| Mobile display | Collapsible peek bar |
| Info shown | Rank + Points to next + Rival name |
| Rival framing | Maximum aggression |
| Dynamic variants | Yes, based on point gap |

### 5-Tier Badge System

| Tier | Badge | Percentile | With 20 Players |
|------|-------|------------|-----------------|
| Diamond | 💎 | Top 5% | #1 |
| Gold | 🥇 | Top 20% | #1-4 |
| Silver | 🥈 | Top 40% | #1-8 |
| Bronze | 🥉 | Top 70% | #1-14 |
| Rookie | 🎮 | Everyone else | #15-20 |

**Reset:** Weekly (same as leaderboard)

### Desktop Sticky Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  💎 #12  ·  🎯 89 pts to DETHRONE CryptoKing's reign 💀        │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Peek Bar

**Collapsed (40px):**
```
┌─────────────────────────────────────────┐
│  💎 #12 · Tap to see who's next ▲       │
└─────────────────────────────────────────┘
```

**Expanded (~100px):**
```
┌─────────────────────────────────────────┐
│  💎 Your Position                    ▼  │
│                                         │
│  #12                                    │
│  🎯 89 pts to DETHRONE CryptoKing 💀    │
└─────────────────────────────────────────┘
```

### Aggressive Rival Copy (Maximum Level)

**Standard messages:**
```typescript
const RIVAL_MESSAGES = {
  standard: [
    "🎯 {gap} pts to DETHRONE {rival}'s reign 💀",
    "🎯 {gap} pts. {rival}'s spot has your name on it.",
    "🎯 {gap} pts to make {rival} a footnote.",
    "🎯 {gap} pts between you and ending {rival}.",
  ],
};
```

**Dynamic variants based on gap:**

```typescript
// Small gap (<50 pts)
const SMALL_GAP_MESSAGES = [
  "🔥 {rival} is SWEATING. Just {gap} pts. END THIS.",
  "🔥 {gap} pts. One good run and {rival} is DONE.",
  "🔥 SO CLOSE. {gap} pts to destroy {rival}.",
];

// Large gap (>200 pts)
const LARGE_GAP_MESSAGES = [
  "💪 {gap} pts to topple {rival}. The climb starts now.",
  "💪 {rival} has {gap} pts on you. Time to grind.",
  "💪 {gap} pts. {rival} thinks they're safe. Prove them wrong.",
];

// Just got passed
const PASSED_MESSAGES = [
  "😤 {rival} just took YOUR spot. Take it back.",
  "😤 {rival} passed you. This is personal now.",
];
```

### Backend Response

**Updated `/api/leaderboard/[gameId]` response:**

```typescript
interface LeaderboardResponse {
  gameId: string;
  timeframe: 'daily' | 'weekly' | 'all-time';
  entries: LeaderboardEntry[];
  pagination: { ... };
  
  // New fields
  userPosition?: {
    rank: number;
    score: number;
    tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'rookie';
    totalPlayers: number;
    nextRival?: {
      userId: string;
      displayName: string;
      avatar: { type: 'emoji' | 'nft'; value: string };
      score: number;
      pointsAhead: number;
    };
  };
  
  resetTime?: string; // ISO timestamp of next reset
}
```

### New Components

- `src/components/Leaderboard/YourPositionBar.tsx` - Desktop sticky footer
- `src/components/Leaderboard/YourPositionPeek.tsx` - Mobile collapsible
- `src/components/Leaderboard/TierBadge.tsx` - Tier badge display

---

## Phase 3: Personal Stats Panel

### Configuration

| Setting | Value |
|---------|-------|
| Desktop location | Right sidebar |
| Mobile location | Below leaderboard |
| Primary stats | 3 visible |
| Secondary stats | 3 in expand |
| Compare feature | Friends only, Profile page |
| Confetti | Only on new personal best |

### Stats Hierarchy

**Primary (Always Visible):**

| Priority | Stat | Icon | Why |
|----------|------|------|-----|
| 1 | Current Streak | 🔥 | Retention driver |
| 2 | Best Rank Ever | 🏆 | Achievement/pride |
| 3 | Total Games Played | 🎮 | Engagement badge |

**Secondary (Expandable):**

| Stat | Icon |
|------|------|
| Longest Streak | 📈 |
| Oranges Earned | 🍊 |
| Favorite Game | ❤️ |

**Per-Game Breakdown (in expand):**
- Games played per game
- Best rank per game

### Desktop Layout (Right Sidebar)

```
┌─────────────────────────┐
│  📊 YOUR STATS          │
├─────────────────────────┤
│                         │
│  🔥 7-DAY STREAK        │
│     Keep it going!      │
│                         │
├─────────────────────────┤
│  🏆 BEST RANK           │
│     #12 in Flappy       │
├─────────────────────────┤
│  🎮 142 GAMES           │
│     played              │
├─────────────────────────┤
│  ▼ Show more stats      │
└─────────────────────────┘

[Expanded]
├─────────────────────────┤
│  📈 Longest: 14 days    │
│  🍊 2,450 earned        │
│  ❤️ Fave: Flappy Orange │
│                         │
│  📊 Game Breakdown →    │
├─────────────────────────┤
│  ▲ Show less            │
└─────────────────────────┘
```

### Mobile Layout (Below Leaderboard)

```
┌─────────────────────────────────────────┐
│  📊 YOUR STATS                          │
├─────────────────────────────────────────┤
│  🔥 7-day    🏆 Best #12    🎮 142      │
│  streak     in Flappy      games       │
├─────────────────────────────────────────┤
│  ▼ Show more                            │
└─────────────────────────────────────────┘
```

### Compare Feature (Profile Page Only)

**Location:** Profile → Friends tab → Click friend → Comparison view

```
┌─────────────────────────────────────────┐
│  ← Back            VS COMPARISON        │
├─────────────────────────────────────────┤
│     YOU          vs        MoJuice      │
│    [avatar]               [avatar]      │
├─────────────────────────────────────────┤
│  🔥 Streak                              │
│     7 days       vs    12 days 👑       │
├─────────────────────────────────────────┤
│  🏆 Best Rank                           │
│     #12 👑       vs    #45              │
├─────────────────────────────────────────┤
│  🎮 Games                               │
│     142 👑       vs    89               │
├─────────────────────────────────────────┤
│  🍊 Oranges                             │
│     2,450        vs    5,200 👑         │
├─────────────────────────────────────────┤
│  Score: YOU 2 - 2 MoJuice               │
│  "It's a tie! Time to break it."        │
└─────────────────────────────────────────┘
```

### Confetti Animation

**Trigger:** Only when user achieves a new personal best
- New best rank in any game
- New longest streak

**Not triggered:**
- Normal stat loading
- Viewing stats without change

### Backend Endpoint

**New: `GET /api/user/stats`**

```typescript
interface UserStatsResponse {
  currentStreak: number;
  longestStreak: number;
  bestRankEver: {
    rank: number;
    gameId: string;
    gameName: string;
    achievedAt: string;
  };
  totalGamesPlayed: number;
  totalOrangesEarned: number;
  favoriteGame: {
    gameId: string;
    gameName: string;
    gamesPlayed: number;
  };
  perGameStats: Array<{
    gameId: string;
    gameName: string;
    gamesPlayed: number;
    bestRank: number;
    bestScore: number;
  }>;
}
```

**Compare endpoint: `GET /api/user/stats/compare?friendId=xxx`**

---

## Database Changes

### New Table: `user_best_ranks`

```sql
CREATE TABLE IF NOT EXISTS user_best_ranks (
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  best_rank INTEGER NOT NULL,
  best_score INTEGER NOT NULL,
  achieved_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, game_id)
);

CREATE INDEX idx_best_ranks_user ON user_best_ranks(user_id);
```

### New Columns in `profiles`

```sql
ALTER TABLE profiles ADD COLUMN lifetime_oranges_from_games INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN total_games_played INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN favorite_game_id TEXT;
```

### Migration File

**File: `migrations/0007_leaderboard_enhancements.sql`**

---

## Implementation Order

```
1. Database Migration
   └── Create tables + add columns

2. Phase 1: Time Filtering
   ├── Backend: Add timeframe parameter
   ├── Frontend: Update tabs (3 instead of 4)
   ├── Frontend: Add CountdownTimer component
   └── Test: Verify all timeframes work

3. Phase 2: Position Indicator
   ├── Backend: Add userPosition to response
   ├── Backend: Add tier calculation
   ├── Backend: Add rival calculation
   ├── Frontend: YourPositionBar (desktop)
   ├── Frontend: YourPositionPeek (mobile)
   ├── Frontend: TierBadge component
   ├── Add aggressive rival copy
   └── Test: Verify tiers + rival display

4. Phase 3: Personal Stats
   ├── Backend: /api/user/stats endpoint
   ├── Backend: /api/user/stats/compare endpoint
   ├── Frontend: PersonalStatsPanel component
   ├── Frontend: Two-column layout integration
   ├── Frontend: Progressive disclosure
   ├── Frontend: Compare modal in Profile
   ├── Add confetti for new personal best
   └── Test: All stats accurate
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `migrations/0007_leaderboard_enhancements.sql` | Database migration |
| `src/components/Leaderboard/CountdownTimer.tsx` | Reset countdown |
| `src/components/Leaderboard/YourPositionBar.tsx` | Desktop position footer |
| `src/components/Leaderboard/YourPositionPeek.tsx` | Mobile collapsible |
| `src/components/Leaderboard/TierBadge.tsx` | Tier badge display |
| `src/components/Leaderboard/PersonalStatsPanel.tsx` | Stats sidebar |
| `src/components/Leaderboard/PersonalStatsPanel.css` | Stats styling |
| `src/components/Profile/CompareStats.tsx` | Friend comparison |
| `functions/api/user/stats.ts` | User stats endpoint |
| `functions/api/user/stats/compare.ts` | Compare endpoint |
| `src/lib/leaderboard/tierCalculation.ts` | Tier calculation logic |
| `src/lib/leaderboard/rivalMessages.ts` | Aggressive copy variants |

## Files to Modify

| File | Changes |
|------|---------|
| `functions/api/leaderboard/[gameId].ts` | Add timeframe, userPosition, tier, rival |
| `src/components/Leaderboard/Leaderboard.tsx` | 3 tabs, countdown, sidebar layout |
| `src/components/Leaderboard/Leaderboard.css` | Two-column layout, position bar styles |
| `src/hooks/data/useLeaderboard.ts` | Add timeframe parameter |

---

## Testing Checklist

### Phase 1
- [ ] "Today" shows only scores from current UTC day
- [ ] "This Week" shows scores from Monday-now
- [ ] "All Time" shows all scores
- [ ] Countdown timer shows correct time to reset
- [ ] Switching tabs triggers new fetch

### Phase 2
- [ ] Position bar shows on desktop (always visible)
- [ ] Peek bar shows on mobile (collapsible)
- [ ] Tier badge displays correctly (💎🥇🥈🥉🎮)
- [ ] Tier updates weekly
- [ ] Rival name and avatar display
- [ ] Points to next rank accurate
- [ ] Aggressive copy displays
- [ ] Dynamic variants work (small gap, large gap)

### Phase 3
- [ ] Stats sidebar shows on desktop (right side)
- [ ] Stats section shows on mobile (below leaderboard)
- [ ] Primary 3 stats visible
- [ ] Expand shows secondary stats
- [ ] Compare feature works in Profile
- [ ] Confetti triggers on new personal best
- [ ] Confetti does NOT trigger on normal load

---

## Notes

- Database can be wiped if needed (only test data)
- Mobile and desktop should have equal priority
- Animation level: Juicy (but strategic - confetti only for achievements)
- Small community (~20 people) - tier percentages will create clear distinctions

---

*Last updated: January 25, 2026*
*Status: Ready for implementation*
