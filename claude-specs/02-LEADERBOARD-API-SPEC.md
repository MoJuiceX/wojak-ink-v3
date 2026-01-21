# SPEC 02: Leaderboard API - Include Avatar Data

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Update the leaderboard API to include avatar information in responses so leaderboards display user avatars correctly. Currently the API only returns basic score data - we need to JOIN with profiles table to get avatar info.

---

## Current API Response (Before)

```typescript
// GET /api/leaderboard/[gameId]
{
  gameId: string;
  entries: {
    userId: string;
    displayName: string;
    score: number;
    createdAt: string;
  }[];
}
```

## Updated API Response (After)

```typescript
// GET /api/leaderboard/[gameId]
{
  gameId: string;
  entries: {
    rank: number;
    userId: string;
    displayName: string;
    avatar: {
      type: 'emoji' | 'nft';
      value: string;
      source: 'default' | 'user' | 'wallet';
    };
    score: number;
    level?: number;
    createdAt: string;
  }[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

## Files to Modify

### 1. Update Leaderboard GET Endpoint
**File: `functions/api/leaderboard/[gameId].ts`**

**Current SQL query** (find this):
```sql
SELECT user_id, score, level, created_at
FROM leaderboard_scores
WHERE game_id = ?
ORDER BY score DESC, created_at ASC
LIMIT ? OFFSET ?
```

**Replace with this** (JOIN with profiles):
```sql
SELECT
  ROW_NUMBER() OVER (ORDER BY ls.score DESC, ls.created_at ASC) as rank,
  ls.user_id,
  ls.score,
  ls.level,
  ls.created_at,
  COALESCE(p.display_name, 'Player') as display_name,
  COALESCE(p.avatar_type, 'emoji') as avatar_type,
  COALESCE(p.avatar_value, '🎮') as avatar_value,
  COALESCE(p.avatar_source, 'default') as avatar_source
FROM leaderboard_scores ls
LEFT JOIN profiles p ON ls.user_id = p.user_id
WHERE ls.game_id = ?
ORDER BY ls.score DESC, ls.created_at ASC
LIMIT ? OFFSET ?
```

**Full updated handler:**

```typescript
import { Env } from '../types';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: 'default' | 'user' | 'wallet';
  };
  score: number;
  level?: number;
  createdAt: string;
}

interface LeaderboardResponse {
  gameId: string;
  entries: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Valid game IDs
const VALID_GAME_IDS = [
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { params, env } = context;
  const gameId = params.gameId as string;

  // Validate game ID
  if (!VALID_GAME_IDS.includes(gameId)) {
    return new Response(JSON.stringify({ error: 'Invalid game ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse pagination params
  const url = new URL(context.request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    // Get total count
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM leaderboard_scores WHERE game_id = ?'
    ).bind(gameId).first<{ total: number }>();

    const total = countResult?.total || 0;

    // Get leaderboard entries with avatar data
    const query = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY ls.score DESC, ls.created_at ASC) as rank,
        ls.user_id,
        ls.score,
        ls.level,
        ls.created_at,
        COALESCE(p.display_name, 'Player') as display_name,
        COALESCE(p.avatar_type, 'emoji') as avatar_type,
        COALESCE(p.avatar_value, '🎮') as avatar_value,
        COALESCE(p.avatar_source, 'default') as avatar_source
      FROM leaderboard_scores ls
      LEFT JOIN profiles p ON ls.user_id = p.user_id
      WHERE ls.game_id = ?
      ORDER BY ls.score DESC, ls.created_at ASC
      LIMIT ? OFFSET ?
    `;

    const results = await env.DB.prepare(query)
      .bind(gameId, limit, offset)
      .all();

    // Map to response format
    const entries: LeaderboardEntry[] = (results.results || []).map((row: any) => ({
      rank: row.rank,
      userId: row.user_id,
      displayName: row.display_name,
      avatar: {
        type: row.avatar_type as 'emoji' | 'nft',
        value: row.avatar_value,
        source: row.avatar_source as 'default' | 'user' | 'wallet',
      },
      score: row.score,
      level: row.level || undefined,
      createdAt: row.created_at,
    }));

    const response: LeaderboardResponse = {
      gameId,
      entries,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + entries.length < total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error) {
    console.error('[Leaderboard API] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

---

### 2. Update Frontend Leaderboard Types
**File: `src/types/leaderboard.ts`**

Update or verify the LeaderboardEntry interface matches:

```typescript
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar: {
    type: 'emoji' | 'nft';
    value: string;
    source: 'default' | 'user' | 'wallet';
  };
  score: number;
  level?: number;
  createdAt: string;
  isCurrentUser?: boolean; // Added client-side
}

export interface LeaderboardResponse {
  gameId: string;
  entries: LeaderboardEntry[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
```

---

### 3. Update useLeaderboard Hook
**File: `src/hooks/data/useLeaderboard.ts`**

Update the hook to use new response format and remove any client-side avatar fetching:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useUserProfile } from '@/contexts/UserProfileContext';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

interface UseLeaderboardOptions {
  gameId: string;
  limit?: number;
  enabled?: boolean;
}

export function useLeaderboard({ gameId, limit = 10, enabled = true }: UseLeaderboardOptions) {
  const { profile } = useUserProfile();
  const currentUserId = profile?.userId; // Get from auth context

  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', gameId, limit],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard/${gameId}?limit=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data: LeaderboardResponse = await response.json();

      // Mark current user's entry
      if (currentUserId) {
        data.entries = data.entries.map(entry => ({
          ...entry,
          isCurrentUser: entry.userId === currentUserId,
        }));
      }

      return data;
    },
    enabled: enabled && !!gameId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
  });
}
```

---

### 4. Update LeaderboardEntry Component
**File: `src/components/Leaderboard/LeaderboardEntry.tsx`**

Update to use avatar data from API:

```typescript
import { Avatar } from '@/components/Avatar/Avatar';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/types/leaderboard';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  highlighted?: boolean;
}

export function LeaderboardEntry({ entry, highlighted }: LeaderboardEntryProps) {
  const { rank, displayName, avatar, score, isCurrentUser } = entry;

  return (
    <div className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
      <span className="entry-rank">#{rank}</span>

      <Avatar
        avatar={avatar}
        size="small"
        highlighted={highlighted || isCurrentUser}
      />

      <span className="entry-name">{displayName}</span>

      <span className="entry-score">{score.toLocaleString()}</span>
    </div>
  );
}
```

---

### 5. Update Leaderboard Component
**File: `src/components/Leaderboard/Leaderboard.tsx`**

Ensure it uses the updated hook and passes avatar data correctly:

```typescript
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { LeaderboardEntry } from './LeaderboardEntry';
import { LeaderboardRowSkeleton } from '@/components/skeletons';

interface LeaderboardProps {
  gameId: string;
  limit?: number;
}

export function Leaderboard({ gameId, limit = 10 }: LeaderboardProps) {
  const { data, isLoading, error } = useLeaderboard({ gameId, limit });

  if (isLoading) {
    return (
      <div className="leaderboard-loading">
        {Array.from({ length: limit }).map((_, i) => (
          <LeaderboardRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-error">
        Failed to load leaderboard
      </div>
    );
  }

  if (!data?.entries.length) {
    return (
      <div className="leaderboard-empty">
        No scores yet. Be the first!
      </div>
    );
  }

  return (
    <div className="leaderboard">
      {data.entries.map((entry) => (
        <LeaderboardEntry
          key={entry.userId}
          entry={entry}
          highlighted={entry.rank <= 3}
        />
      ))}

      {data.pagination.hasMore && (
        <button className="load-more">
          Show more
        </button>
      )}
    </div>
  );
}
```

---

### 6. Update LeaderboardContext (Remove Client-Side Avatar Fetching)
**File: `src/contexts/LeaderboardContext.tsx`**

Remove any code that fetches avatars client-side since API now provides them:

```typescript
// REMOVE code like this:
const enrichWithAvatars = async (entries) => {
  // ... fetch avatars separately
};

// The API now returns avatar data directly, so just use it as-is
```

---

## Score Submission Endpoint (No Changes Needed)

**File: `functions/api/leaderboard/submit.ts`**

The submit endpoint doesn't need changes for avatar data since it only receives and stores scores. Avatar data is stored in the profiles table and JOINed at query time.

However, ensure it still validates authentication:

```typescript
// Existing auth check should remain:
const auth = getAuth(context.request);
if (!auth.userId) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  });
}
```

---

## Testing Checklist

- [ ] GET `/api/leaderboard/[gameId]` returns avatar data for each entry
- [ ] Avatar includes type, value, and source fields
- [ ] Emoji avatars display correctly on leaderboard
- [ ] NFT avatars display with IPFS URL images
- [ ] NFT avatars show premium styling (gold border, verified badge)
- [ ] Pagination still works (limit, offset, hasMore)
- [ ] Current user's entry is highlighted
- [ ] Leaderboard loads without additional avatar fetching requests
- [ ] Score submission still works correctly
- [ ] Cache headers set correctly (30 seconds)
