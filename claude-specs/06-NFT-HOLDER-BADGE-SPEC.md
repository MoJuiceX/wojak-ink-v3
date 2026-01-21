# SPEC 06: NFT Holder Badge System

> **For Claude CLI**: This specification contains all the code patterns, file paths, and implementation details you need. Follow this spec exactly.

---

## Overview

Add a visible badge that appears for any user who OWNS a Wojak Farmers Plot NFT, regardless of whether they're using an NFT avatar or emoji avatar. The badge is a hexagonal patch with a 🌱 seedling emoji, styled with a modern crypto/NFT aesthetic.

**Key Rule**: The badge shows if the user OWNS any NFT from the collection, NOT just if they're using one as their avatar.

---

## Badge Design

### Visual Specification

```
┌─────────────────────────────────────┐
│                                     │
│      ⬡ (hexagon shape)             │
│     /🌱\                           │
│    ╱    ╲                          │
│   ╱      ╲                         │
│   ╲      ╱                         │
│    ╲    ╱                          │
│     ╲  ╱                           │
│      ⬡                             │
│                                     │
│  Colors:                            │
│  - Border: Gold gradient (#FFD700   │
│    to #FFA500)                      │
│  - Background: Dark green (#1a472a) │
│  - Seedling: 🌱 emoji               │
│                                     │
└─────────────────────────────────────┘
```

### Size Variants

| Context | Badge Size | Seedling Size |
|---------|------------|---------------|
| Leaderboard row | 16x16px | 10px |
| Profile header | 24x24px | 14px |
| Friends list | 16x16px | 10px |
| Game over screen | 20x20px | 12px |

---

## Files to Create

### 1. NFT Holder Badge Component
**File: `src/components/Badge/NftHolderBadge.tsx`**

```typescript
/**
 * NFT Holder Badge Component
 *
 * Displays a hexagonal badge with seedling emoji for NFT holders.
 * Shows on leaderboards, profiles, friends list, game over screens.
 */

import React from 'react';
import './NftHolderBadge.css';

export type BadgeSize = 'small' | 'medium' | 'large';

interface NftHolderBadgeProps {
  size?: BadgeSize;
  showTooltip?: boolean;
  className?: string;
}

const SIZE_MAP: Record<BadgeSize, { badge: number; emoji: number }> = {
  small: { badge: 16, emoji: 10 },
  medium: { badge: 20, emoji: 12 },
  large: { badge: 24, emoji: 14 },
};

export function NftHolderBadge({
  size = 'small',
  showTooltip = true,
  className = ''
}: NftHolderBadgeProps) {
  const dimensions = SIZE_MAP[size];

  return (
    <div
      className={`nft-holder-badge size-${size} ${className}`}
      style={{
        width: dimensions.badge,
        height: dimensions.badge
      }}
      title={showTooltip ? 'Wojak Farmers Plot NFT Holder' : undefined}
      aria-label="NFT Holder Badge"
    >
      <span
        className="badge-seedling"
        style={{ fontSize: dimensions.emoji }}
      >
        🌱
      </span>
    </div>
  );
}

export default NftHolderBadge;
```

### 2. Badge Styles
**File: `src/components/Badge/NftHolderBadge.css`**

```css
/**
 * NFT Holder Badge Styles
 * Hexagonal badge with gold border and dark green background
 */

.nft-holder-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* Hexagon shape using clip-path */
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );

  /* Gold gradient background (acts as border) */
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);

  /* Flex shrink prevention */
  flex-shrink: 0;
}

.nft-holder-badge::before {
  content: '';
  position: absolute;
  inset: 2px;

  /* Inner hexagon for background */
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );

  /* Dark green background */
  background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
}

.badge-seedling {
  position: relative;
  z-index: 1;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
}

/* Size variants */
.nft-holder-badge.size-small {
  /* 16x16 - leaderboard, friends list */
}

.nft-holder-badge.size-medium {
  /* 20x20 - game over screen */
}

.nft-holder-badge.size-large {
  /* 24x24 - profile header */
}

/* Hover effect */
.nft-holder-badge:hover {
  transform: scale(1.1);
  transition: transform 0.15s ease;
}

/* Animation on first appearance */
@keyframes badge-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.nft-holder-badge.animate-in {
  animation: badge-pop 0.3s ease-out;
}
```

### 3. Export Index
**File: `src/components/Badge/index.ts`**

```typescript
export { NftHolderBadge } from './NftHolderBadge';
export type { BadgeSize } from './NftHolderBadge';
```

---

## Files to Modify

### 1. Update UserProfileContext to Track NFT Ownership
**File: `src/contexts/UserProfileContext.tsx`**

Add new field to profile type and context:

```typescript
// Add to UserProfile interface
interface UserProfile {
  // ... existing fields ...

  // NFT ownership (separate from avatar selection)
  ownsNft: boolean;
  ownedNftCount: number;
}

// In the provider, update the wallet connection handler
const handleWalletNfts = (nfts: NFT[]) => {
  const collectionNfts = nfts.filter(
    nft => nft.collectionId === WOJAK_COLLECTION_ID
  );

  setProfile(prev => ({
    ...prev,
    ownsNft: collectionNfts.length > 0,
    ownedNftCount: collectionNfts.length,
  }));
};
```

### 2. Update Leaderboard API Response
**File: `functions/api/leaderboard/[gameId].ts`**

Add `ownsNft` to the query JOIN:

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
  COALESCE(p.avatar_source, 'default') as avatar_source,
  COALESCE(p.owns_nft, 0) as owns_nft
FROM leaderboard_scores ls
LEFT JOIN profiles p ON ls.user_id = p.user_id
WHERE ls.game_id = ?
ORDER BY ls.score DESC, ls.created_at ASC
LIMIT ? OFFSET ?
```

Update response mapping:

```typescript
const entries: LeaderboardEntry[] = (results.results || []).map((row: any) => ({
  // ... existing fields ...
  ownsNft: Boolean(row.owns_nft),
}));
```

### 3. Update LeaderboardEntry Component
**File: `src/components/Leaderboard/LeaderboardEntry.tsx`**

```typescript
import { Avatar } from '@/components/Avatar/Avatar';
import { NftHolderBadge } from '@/components/Badge';
import type { LeaderboardEntry as LeaderboardEntryType } from '@/types/leaderboard';

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType;
  highlighted?: boolean;
}

export function LeaderboardEntry({ entry, highlighted }: LeaderboardEntryProps) {
  const { rank, displayName, avatar, score, isCurrentUser, ownsNft } = entry;

  return (
    <div className={`leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
      <span className="entry-rank">#{rank}</span>

      <Avatar
        avatar={avatar}
        size="small"
        highlighted={highlighted || isCurrentUser}
      />

      <div className="entry-name-container">
        <span className="entry-name">{displayName}</span>
        {ownsNft && <NftHolderBadge size="small" />}
      </div>

      <span className="entry-score">{score.toLocaleString()}</span>
    </div>
  );
}
```

Add CSS for name container:

```css
.entry-name-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.entry-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 4. Update Profile Header (Account Dashboard)
**File: `src/components/Account/ProfileHeader.tsx`**

```typescript
import { NftHolderBadge } from '@/components/Badge';

// In the component JSX, after the display name:
<div className="profile-name-row">
  <h2 className="display-name">{profile.displayName}</h2>
  {profile.ownsNft && <NftHolderBadge size="large" />}
</div>
```

### 5. Update Friends List Entry
**File: `src/components/Friends/FriendCard.tsx`**

```typescript
import { NftHolderBadge } from '@/components/Badge';

// In the component JSX:
<div className="friend-info">
  <span className="friend-name">{friend.displayName}</span>
  {friend.ownsNft && <NftHolderBadge size="small" />}
</div>
```

### 6. Update Game Over Screen
**File: `src/components/GameOver/GameOverScreen.tsx`**

```typescript
import { NftHolderBadge } from '@/components/Badge';
import { useUserProfile } from '@/contexts/UserProfileContext';

// In the component:
const { profile } = useUserProfile();

// In the JSX where user info is displayed:
<div className="game-over-user">
  <Avatar avatar={profile.avatar} size="medium" />
  <span className="user-name">{profile.displayName}</span>
  {profile.ownsNft && <NftHolderBadge size="medium" />}
</div>
```

---

## Database Migration

**File: `migrations/006_add_owns_nft_column.sql`**

```sql
-- Add owns_nft column to profiles table
ALTER TABLE profiles ADD COLUMN owns_nft INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN owned_nft_count INTEGER DEFAULT 0;

-- Create index for filtering NFT holders
CREATE INDEX IF NOT EXISTS idx_profiles_owns_nft ON profiles(owns_nft);
```

---

## Update Profile API

**File: `functions/api/profile.ts`**

In the PUT handler, accept and store NFT ownership:

```typescript
// In the request body validation:
const { displayName, avatar, ownsNft, ownedNftCount } = await request.json();

// In the UPDATE query:
const query = `
  UPDATE profiles SET
    display_name = ?,
    avatar_type = ?,
    avatar_value = ?,
    avatar_source = ?,
    owns_nft = ?,
    owned_nft_count = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = ?
`;

await env.DB.prepare(query)
  .bind(
    displayName,
    avatar.type,
    avatar.value,
    avatar.source,
    ownsNft ? 1 : 0,
    ownedNftCount || 0,
    userId
  )
  .run();
```

---

## Update Leaderboard Types

**File: `src/types/leaderboard.ts`**

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
  ownsNft: boolean;  // NEW: Whether user owns any collection NFT
  score: number;
  level?: number;
  createdAt: string;
  isCurrentUser?: boolean;
}
```

---

## Testing Checklist

- [ ] Badge displays correctly on leaderboard for NFT holders
- [ ] Badge displays on profile header for NFT holders
- [ ] Badge displays on friends list for NFT holders
- [ ] Badge displays on game over screen for NFT holders
- [ ] Badge does NOT display for non-NFT holders
- [ ] User with emoji avatar but owns NFT still shows badge
- [ ] User with NFT avatar shows badge
- [ ] Badge tooltip shows "Wojak Farmers Plot NFT Holder"
- [ ] Badge sizes are correct for each context
- [ ] Hexagon shape renders correctly
- [ ] Gold border gradient looks good
- [ ] Dark green background is visible
- [ ] Seedling emoji is centered and sized correctly
- [ ] Badge hover effect works
- [ ] API returns ownsNft field correctly
- [ ] Database migration runs without errors
