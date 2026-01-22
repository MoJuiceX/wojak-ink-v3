# Claude CLI: Fix Leaderboards - Daily, Weekly, Monthly

## The Problem

The leaderboard tab shows empty even though users have played games and submitted scores. The scores ARE being saved to the database, but the frontend reads from localStorage instead.

## Root Cause

| Component | Currently Does | Should Do |
|-----------|---------------|-----------|
| `/api/leaderboard/submit` | ✅ Writes to D1 database | Keep as-is |
| `/api/leaderboard/[gameId]` | Returns all-time only | Add timeframe filtering |
| `LeaderboardContext.tsx` | ❌ Reads from localStorage | Read from API |
| `period_leaderboard_scores` table | ❌ Empty, unused | Populate with aggregated scores |

## What Needs to Be Fixed

### 1. Update LeaderboardContext to Use API

**File:** `/src/contexts/LeaderboardContext.tsx`

Replace localStorage calls with API calls:

```typescript
const fetchLeaderboard = async (filter: LeaderboardFilter): Promise<LeaderboardEntry[]> => {
  const { gameId, timeframe, limit = 100 } = filter;

  try {
    const response = await fetch(
      `/api/leaderboard/${gameId}?timeframe=${timeframe}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return [];
  }
};
```

### 2. Add Timeframe Parameter to API

**File:** `/functions/api/leaderboard/[gameId].ts`

Add `timeframe` query parameter support:

```typescript
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const gameId = context.params.gameId as string;
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const timeframe = url.searchParams.get('timeframe') || 'all-time'; // daily, weekly, monthly, all-time

  let query: string;
  let params: any[];

  if (timeframe === 'all-time') {
    // Existing query - all time best scores
    query = `
      SELECT
        ls.user_id,
        ls.score,
        ls.level,
        ls.created_at,
        p.display_name,
        p.avatar_emoji,
        p.avatar_nft_id,
        ROW_NUMBER() OVER (ORDER BY ls.score DESC) as rank
      FROM leaderboard_scores ls
      LEFT JOIN profiles p ON ls.user_id = p.user_id
      WHERE ls.game_id = ?
      GROUP BY ls.user_id
      HAVING ls.score = MAX(ls.score)
      ORDER BY ls.score DESC
      LIMIT ? OFFSET ?
    `;
    params = [gameId, limit, offset];
  } else {
    // Filter by time period
    const now = new Date();
    let startDate: string;

    if (timeframe === 'daily') {
      // Today (UTC)
      startDate = now.toISOString().split('T')[0] + 'T00:00:00.000Z';
    } else if (timeframe === 'weekly') {
      // Start of current week (Monday)
      const dayOfWeek = now.getUTCDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - mondayOffset);
      startDate = monday.toISOString().split('T')[0] + 'T00:00:00.000Z';
    } else if (timeframe === 'monthly') {
      // Start of current month
      startDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00.000Z`;
    }

    query = `
      SELECT
        ls.user_id,
        MAX(ls.score) as score,
        ls.level,
        MAX(ls.created_at) as created_at,
        p.display_name,
        p.avatar_emoji,
        p.avatar_nft_id,
        ROW_NUMBER() OVER (ORDER BY MAX(ls.score) DESC) as rank
      FROM leaderboard_scores ls
      LEFT JOIN profiles p ON ls.user_id = p.user_id
      WHERE ls.game_id = ? AND ls.created_at >= ?
      GROUP BY ls.user_id
      ORDER BY score DESC
      LIMIT ? OFFSET ?
    `;
    params = [gameId, startDate, limit, offset];
  }

  const results = await context.env.DB.prepare(query).bind(...params).all();

  // Format response...
};
```

### 3. Update Leaderboard Component

**File:** `/src/components/Leaderboard/Leaderboard.tsx`

Make sure the timeframe tabs map correctly:

```typescript
// Map UI tabs to API timeframe values
const timeframeMap = {
  'Today': 'daily',
  'This Week': 'weekly',
  'All Time': 'all-time'
};

// When tab changes, fetch with correct timeframe
useEffect(() => {
  const apiTimeframe = timeframeMap[activeTimeTab];
  fetchLeaderboard({
    gameId: selectedGame,
    timeframe: apiTimeframe,
    limit: 100
  });
}, [activeTimeTab, selectedGame]);
```

### 4. Ensure Scores Have Timestamps

**File:** `/functions/api/leaderboard/submit.ts`

Verify `created_at` is being set correctly when inserting scores:

```typescript
const result = await context.env.DB.prepare(`
  INSERT INTO leaderboard_scores (user_id, game_id, score, level, metadata, created_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
`).bind(userId, gameId, score, level, JSON.stringify(metadata)).run();
```

### 5. Period Reset Behavior

The leaderboards reset automatically based on query:

| Timeframe | Resets | Shows Scores From |
|-----------|--------|-------------------|
| Daily | Midnight UTC | Today only |
| Weekly | Monday midnight UTC | Current week (Mon-Sun) |
| Monthly | 1st of month midnight UTC | Current month |
| All Time | Never | All scores ever |

No cron job needed - the query filters by `created_at` timestamp.

## Games to Support

These games should appear in the leaderboard dropdown:

```typescript
const GAMES = [
  { id: 'orange-stack', name: 'Brick by Brick' },
  { id: 'memory-match', name: 'Memory Match' },
  { id: 'orange-pong', name: 'Orange Pong' },
  { id: 'wojak-runner', name: 'Wojak Runner' },
  { id: 'orange-juggle', name: 'Orange Juggle' },
  { id: 'knife-game', name: 'The Knife Game' },
  { id: 'color-reaction', name: 'Color Reaction' },
  { id: 'orange-2048', name: '2048 Merge' },
  { id: 'block-puzzle', name: 'Block Puzzle' },
  { id: 'flappy-orange', name: 'Flappy Orange' },
  { id: 'citrus-drop', name: 'Citrus Drop' },
  { id: 'orange-snake', name: 'Orange Snake' },
  { id: 'brick-breaker', name: 'Brick Breaker' },
];
```

## Files to Modify

1. `/src/contexts/LeaderboardContext.tsx` - Replace localStorage with API calls
2. `/functions/api/leaderboard/[gameId].ts` - Add timeframe query parameter
3. `/src/components/Leaderboard/Leaderboard.tsx` - Ensure correct timeframe mapping
4. `/functions/api/leaderboard/submit.ts` - Verify timestamp is saved

## Expected Result

After fix:
1. ✅ Leaderboard shows actual players and scores from database
2. ✅ "Today" tab shows only scores from today (resets at midnight UTC)
3. ✅ "This Week" tab shows scores from current week (resets Monday UTC)
4. ✅ "All Time" tab shows best scores ever
5. ✅ Each game has its own leaderboard
6. ✅ User's rank is highlighted if they're on the board

## Testing

1. Play any game and submit a score
2. Go to Leaderboard tab
3. Select the game you played
4. Your score should appear
5. Switch between Today/This Week/All Time - scores should filter correctly

---

**Make the leaderboards work so players can compete!** 🏆🍊
