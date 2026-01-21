# Claude CLI Implementation Prompts for wojak.ink

These prompts should be executed in order. Each builds on the previous one.

---

## PROMPT 1: Avatar System Refactor (Core)

```markdown
# Task: Refactor Avatar System with Tiered Access

## Overview
Refactor the avatar and leaderboard system with these requirements:
1. Only Google-authenticated users can submit scores to leaderboards
2. Non-logged-in users can VIEW leaderboards but cannot submit scores
3. New users get a random default emoji avatar + Google first name as display name
4. Users can change their emoji from a curated list of 15 emojis
5. Users who connect wallet and own Wojak Farmers Plot NFTs can select an NFT as avatar
6. NFT avatars get premium visual treatment (gold glow, verified badge)
7. Display name set by user ALWAYS overrides Google name (never show "Anonymous")

## 15 Curated Emojis (visually distinct, no currency/trophy conflicts)
```typescript
const DEFAULT_EMOJIS = ['🎮', '🔥', '🚀', '🎯', '🦊', '🐸', '👾', '🤖', '🎪', '🌸', '🍕', '🎸', '⚡', '🦁', '🐙'];
```

## Avatar Type Definition
**File: `src/types/avatar.ts`** (create new file)
```typescript
export interface UserAvatar {
  type: 'emoji' | 'nft';
  value: string; // emoji character OR IPFS image URL
  source: 'default' | 'user' | 'wallet';
  // Only for NFT avatars:
  nftId?: string; // e.g., "0042"
  nftLauncherId?: string; // for linking to MintGarden
}

export const DEFAULT_EMOJIS = ['🎮', '🔥', '🚀', '🎯', '🦊', '🐸', '👾', '🤖', '🎪', '🌸', '🍕', '🎸', '⚡', '🦁', '🐙'];

export function getRandomDefaultEmoji(): string {
  return DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)];
}
```

## IPFS URL Generation
Use the existing function in `src/services/constants.ts`:
```typescript
export const NFT_IPFS_CID = 'bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq';

export function getNftImageUrl(nftId: string | number): string {
  const paddedId = String(nftId).padStart(4, '0');
  return `https://${NFT_IPFS_CID}.ipfs.w3s.link/${paddedId}.png`;
}
```
Always use IPFS URLs (via w3s.link gateway) - NOT MintGarden thumbnail URLs - to avoid rate limits.

## Changes Required

### 1. Update UserProfileContext
**File: `src/contexts/UserProfileContext.tsx`**

Add to UserProfile interface:
```typescript
export interface UserProfile {
  displayName: string | null;
  xHandle: string | null;
  walletAddress: string | null;
  updatedAt: string | null;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  // NEW: Avatar fields
  avatar: UserAvatar;
  ownedNftIds: string[]; // List of NFT IDs user owns (for fallback logic)
}
```

Add computed property for effective display name:
```typescript
// In context value - NEVER return "Anonymous"
const effectiveDisplayName = profile?.displayName || clerkUser?.firstName || clerkUser?.email?.split('@')[0] || 'Player';
```

On first sign-in (when profile is null), initialize:
```typescript
const defaultProfile: UserProfile = {
  displayName: null, // Will use Google name as fallback
  avatar: {
    type: 'emoji',
    value: getRandomDefaultEmoji(),
    source: 'default',
  },
  ownedNftIds: [],
  // ... other fields
};
```

Add methods:
```typescript
updateAvatar: (avatar: UserAvatar) => Promise<boolean>;
refreshOwnedNfts: () => Promise<void>; // Fetches NFTs from wallet, updates ownedNftIds
```

### 2. Update Profile API
**File: `functions/api/profile.ts`**

Add columns to profiles table (or store avatar as JSON):
- `avatar_type` TEXT DEFAULT 'emoji'
- `avatar_value` TEXT DEFAULT '🎮'
- `avatar_source` TEXT DEFAULT 'default'
- `avatar_nft_id` TEXT (nullable)
- `avatar_nft_launcher_id` TEXT (nullable)
- `owned_nft_ids` TEXT (JSON array, nullable)

Add validation in POST handler:
- If avatar.type is 'nft', verify wallet_address is set
- If avatar.type is 'emoji', verify value is in DEFAULT_EMOJIS list

### 3. Create EmojiPicker Component
**File: `src/components/AvatarPicker/EmojiPicker.tsx`**

Simple grid of 15 emojis:
```tsx
interface EmojiPickerProps {
  selectedEmoji?: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  return (
    <div className="emoji-grid">
      {DEFAULT_EMOJIS.map(emoji => (
        <button
          key={emoji}
          className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
```

### 4. Update NFTPicker to Use Real Data
**File: `src/components/AvatarPicker/NFTPicker.tsx`**

Replace demo data with actual wallet NFTs:
1. Use `useSageWallet()` hook to get `getNFTs` function
2. Fetch NFTs from Wojak Farmers Plot collection
3. Extract NFT ID from name (e.g., "Wojak Farmers Plot #0042" → "0042")
4. Generate IPFS URL using `getNftImageUrl(nftId)`
5. Display grid of owned NFTs for selection

```typescript
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// When user selects an NFT:
onSelect({
  type: 'nft',
  value: getNftImageUrl(nftId), // IPFS URL
  source: 'wallet',
  nftId: nftId,
  nftLauncherId: nft.encoded_id,
});
```

### 5. Update AvatarPickerModal
**File: `src/components/AvatarPicker/AvatarPickerModal.tsx`**

Two tabs:
1. **"Emoji" tab** - Always available, shows EmojiPicker
2. **"NFT" tab** - Only enabled if wallet connected AND user owns NFTs

When selecting emoji: `updateAvatar({ type: 'emoji', value: emoji, source: 'user' })`
When selecting NFT: `updateAvatar({ type: 'nft', value: ipfsUrl, source: 'wallet', nftId, nftLauncherId })`

### 6. Update Avatar Component Styling
**File: `src/components/Avatar/Avatar.tsx` and `Avatar.css`**

Two visual tiers only (emoji and NFT look the same for default vs custom):
```css
/* Emoji avatar - standard styling */
.avatar-emoji {
  border: 2px solid var(--color-brand-primary);
  background: var(--color-bg-secondary);
}

/* NFT avatar - premium styling */
.avatar-nft {
  border: 2px solid #FFD700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.4), 0 0 24px rgba(255, 215, 0, 0.2);
}

.avatar-nft .verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #FFD700;
  color: #000;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}
```

### 7. Update LeaderboardContext - Change Gating
**File: `src/contexts/LeaderboardContext.tsx`**

Change `canUserCompete()` to only require authentication (not NFT):
```typescript
// OLD: Required NFT
const canUserCompete = (): boolean => {
  return user?.avatar?.type === 'nft' && !!user?.walletAddress;
};

// NEW: Only requires authentication
const canUserCompete = (): boolean => {
  return isSignedIn; // Just needs Google sign-in
};
```

### 8. Update Game Over Screens
**Files: Game components and `src/systems/game-ui/GameOverScreen.tsx`**

Show different UI based on auth state:
```tsx
{isSignedIn ? (
  <ScoreSubmission score={score} onSubmit={handleSubmit} />
) : (
  <div className="sign-in-prompt">
    <p>Sign in to save your score and compete on leaderboards!</p>
    <SignInButton mode="modal">
      <button className="sign-in-button">Sign In with Google</button>
    </SignInButton>
  </div>
)}
```

### 9. NFT Ownership Validation & Fallback
**File: `src/contexts/UserProfileContext.tsx`**

Add logic to validate NFT ownership on login and handle fallbacks:
```typescript
// On sign-in or wallet connection:
async function refreshOwnedNfts() {
  if (!walletAddress) {
    // No wallet - if avatar is NFT, fall back to emoji
    if (profile?.avatar?.type === 'nft') {
      await updateAvatar({
        type: 'emoji',
        value: getRandomDefaultEmoji(),
        source: 'default',
      });
    }
    return;
  }

  // Fetch current NFTs from wallet
  const nfts = await getNFTs(WOJAK_COLLECTION_ID);
  const ownedIds = nfts.map(nft => extractNftId(nft.name));

  // Update owned list
  await updateProfile({ ownedNftIds: ownedIds });

  // If current avatar NFT is no longer owned, fall back
  if (profile?.avatar?.type === 'nft' && profile?.avatar?.nftId) {
    if (!ownedIds.includes(profile.avatar.nftId)) {
      // Try another owned NFT, or fall back to emoji
      if (ownedIds.length > 0) {
        const fallbackNftId = ownedIds[0];
        await updateAvatar({
          type: 'nft',
          value: getNftImageUrl(fallbackNftId),
          source: 'wallet',
          nftId: fallbackNftId,
        });
      } else {
        await updateAvatar({
          type: 'emoji',
          value: getRandomDefaultEmoji(),
          source: 'default',
        });
      }
    }
  }
}
```

### 10. Remove/Repurpose NFTGatePrompt
**Files: `src/components/Leaderboard/NFTGatePrompt.tsx`, `src/components/Avatar/LeaderboardGate.tsx`**

Either remove these components OR repurpose as promotional banner:
- Instead of blocking, show "Upgrade to NFT Avatar for premium styling!"
- Display benefits (gold glow, verified badge)
- Link to connect wallet / select NFT

## Database Migration
**File: `migrations/XXXX_avatar_fields.sql`**
```sql
-- Add avatar columns to profiles table
ALTER TABLE profiles ADD COLUMN avatar_type TEXT DEFAULT 'emoji';
ALTER TABLE profiles ADD COLUMN avatar_value TEXT;
ALTER TABLE profiles ADD COLUMN avatar_source TEXT DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN avatar_nft_id TEXT;
ALTER TABLE profiles ADD COLUMN avatar_nft_launcher_id TEXT;
ALTER TABLE profiles ADD COLUMN owned_nft_ids TEXT;

-- Set default avatar value for existing rows
UPDATE profiles SET avatar_value = '🎮' WHERE avatar_value IS NULL;
```

## Testing Checklist
- [ ] New user signs in → Gets random emoji + Google first name
- [ ] User edits display name → Custom name shows everywhere (leaderboards, account)
- [ ] Display name is never "Anonymous" - always Google name or custom name
- [ ] User picks different emoji → Avatar updates everywhere
- [ ] Non-signed-in user sees leaderboard but cannot submit scores
- [ ] Game over shows "Sign in to save score" for non-authenticated users
- [ ] User connects wallet → Can see "NFT" tab in avatar picker
- [ ] User with no NFTs → NFT tab shows empty state with link to MintGarden
- [ ] User selects NFT → Avatar changes to NFT image with gold glow + verified badge
- [ ] User disconnects wallet → Avatar falls back to random emoji
- [ ] User sells NFT that was avatar → Falls back to another owned NFT, or emoji if none
```

---

## PROMPT 2: Account Dashboard Page

```markdown
# Task: Create Comprehensive Account Dashboard

## Overview
Create a dedicated account page (redesign existing `/account` page) that shows all user data in an organized dashboard layout. This page should also be viewable by other users as a public profile.

## Page Routes
- `/account` - Current user's account (editable)
- `/profile/:userId` - Public view of any user's profile (read-only)

## Account Dashboard Sections

### 1. Profile Header
- Avatar (large, with edit button for own profile)
- Display name (editable on own profile)
- Account age ("Member since January 2024")
- X handle (if set)
- Wallet address (truncated, if connected)
- NFT holder badge (if has NFT avatar)

### 2. Currency & Voting Section
Display in a row of stat cards:
- 🍊 Oranges balance
- 💎 Gems balance
- 🍩 Donuts available (for voting)
- 💩 Poops available (for voting)

Note: Donuts and poops are voting emojis used on the games page. Users throw them at games they like (donuts) or dislike (poops). Show the count they currently have available.

### 3. Game Scores Section
Show a grid/list of all ACTIVE games with:
- Game icon/thumbnail
- Game name
- User's personal best score
- User's rank on that leaderboard (e.g., "#42")
- Last played date

Get the list of active games from `src/config/games.ts` - filter out games that are `disabled: true` or `comingSoon: true`.

### 4. NFT Collection Mini-Gallery
If user has connected wallet and owns Wojak Farmers Plot NFTs:
- Show grid of owned NFT thumbnails (use IPFS URLs)
- Highlight which one is currently set as avatar
- Click to view on MintGarden

If no wallet connected or no NFTs: Show prompt to connect wallet / link to collection.

### 5. Shop Inventory Section
Show items the user has purchased from the shop:
- Organized by category (Frames, Badges, Titles, Effects, etc.)
- Show equipped vs unequipped status
- Allow equip/unequip toggle directly from account page
- Store equipped items in user profile

Inventory data currently stored in localStorage under `wojak_owned_items`.
Add equipped state storage: `wojak_equipped_items` (object mapping category to item ID).

### 6. Recent Activity Section
Show last 5-10 activities:
- Games played with scores
- Items purchased
- Achievements earned
- Daily rewards claimed

### 7. Play Streak Section (already exists)
- Current streak
- Longest streak

## Files to Create/Modify

### Create Public Profile Page
**File: `src/pages/Profile.tsx`**
Route: `/profile/:userId`

Fetches and displays another user's public profile (read-only version of account).
Uses same components but without edit functionality.

### Create Account Dashboard Components
**Files:**
- `src/components/Account/ProfileHeader.tsx`
- `src/components/Account/CurrencyStats.tsx`
- `src/components/Account/GameScoresGrid.tsx`
- `src/components/Account/NftGallery.tsx`
- `src/components/Account/InventorySection.tsx`
- `src/components/Account/RecentActivity.tsx`
- `src/components/Account/Account.css`

### Update Account Page
**File: `src/pages/Account.tsx`**

Redesign to use new dashboard components in a scrolling single-page layout.

### Add Routes
**File: `src/App.tsx` or routes config**
Add `/profile/:userId` route.

### API: Fetch User Profile
**File: `functions/api/profile/[userId].ts`** (create)
Public endpoint to fetch any user's profile data for display.
Returns: displayName, avatar, accountAge, gameScores, ownedNfts (if wallet public), ownedItems.

### API: Fetch User Game Scores
**File: `functions/api/scores/[userId].ts`** (create)
Returns all of a user's best scores across all games with their ranks.

## Voting Emoji Balance
The donut/poop voting system appears to use an unlimited or regenerating supply currently.
For the account page, either:
- Show "∞" if unlimited
- Or implement a daily allowance system (e.g., 10 donuts + 10 poops per day)

Check `src/hooks/useFlickVoting.ts` for current implementation.

## Inventory Equip System
Create new context or extend CurrencyContext:
```typescript
interface EquippedItems {
  avatar_frame?: string;
  avatar_accessory?: string;
  game_theme?: string;
  celebration_effect?: string;
  badge?: string;
  title?: string;
}

// Methods
equipItem: (itemId: string, category: ShopCategory) => void;
unequipItem: (category: ShopCategory) => void;
getEquippedItem: (category: ShopCategory) => string | null;
```

## Responsive Design
- Mobile: Single column, sections stacked
- Desktop: Two-column layout for some sections (e.g., scores + inventory side by side)

## Testing Checklist
- [ ] Own account page shows all sections with real data
- [ ] Currency balances display correctly
- [ ] Game scores show personal best + rank for each active game
- [ ] NFT gallery shows owned NFTs with current avatar highlighted
- [ ] Inventory shows purchased items with equip/unequip toggles
- [ ] Equipping item persists and shows in relevant places
- [ ] Public profile (`/profile/:userId`) works for viewing other users
- [ ] Public profile hides edit buttons and sensitive data
- [ ] Account age calculates correctly from createdAt
```

---

## PROMPT 3: Friends System

```markdown
# Task: Implement Friends System

## Overview
Allow users to add friends and see their friends' scores on leaderboards. Users can browse all registered users and add them as friends.

## Features
1. View list of all users who have signed in and set a username
2. Search/filter users by display name
3. Send friend request (or direct add for simplicity)
4. View friends list
5. See "Friends" tab on leaderboards showing only friends' scores
6. Compare your score vs friends on each game

## Data Model

### Friend relationship
```typescript
interface Friendship {
  id: string;
  userId: string; // The user who added the friend
  friendId: string; // The friend's user ID
  createdAt: Date;
}
```

For MVP, use direct add (no request/accept flow) - if User A adds User B, they're friends.
Friendship is NOT automatically mutual - User B would need to add User A back to see A in their friends list.

### Storage
- localStorage key: `wojak_friends` (array of friend user IDs)
- Later: Backend API for persistence

## Files to Create

### Friends Context
**File: `src/contexts/FriendsContext.tsx`**

```typescript
interface FriendsContextType {
  friends: string[]; // Array of friend user IDs
  isLoading: boolean;

  addFriend: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  isFriend: (userId: string) => boolean;

  // For user discovery
  searchUsers: (query: string) => Promise<UserSummary[]>;
  getAllUsers: () => Promise<UserSummary[]>;
}

interface UserSummary {
  id: string;
  displayName: string;
  avatar: UserAvatar;
  // Optional stats
  gamesPlayed?: number;
  topGame?: string;
}
```

### Friends List Component
**File: `src/components/Friends/FriendsList.tsx`**

Shows current friends with:
- Avatar
- Display name
- Quick stats (optional)
- Remove friend button
- Click to view profile

### User Browser Component
**File: `src/components/Friends/UserBrowser.tsx`**

Browse all registered users:
- Search box to filter by name
- Grid/list of users
- "Add Friend" button for each (or "Added ✓" if already friend)
- Click to view profile

### Friends Page
**File: `src/pages/Friends.tsx`**

Route: `/friends`

Tabs:
1. **My Friends** - FriendsList component
2. **Find Users** - UserBrowser component

### Update Leaderboard Component
**File: `src/components/Leaderboard/Leaderboard.tsx`**

Add "Friends" filter tab alongside existing filters:
- All Players
- **Friends** (new)
- NFT Holders (if still relevant)

When "Friends" selected, filter leaderboard entries to only show friends.
Highlight friends with a subtle indicator (e.g., small star or friend icon).

### API: Get All Users
**File: `functions/api/users.ts`** (create)

Returns paginated list of users who have set a display name:
```typescript
GET /api/users?search=query&limit=50&offset=0

Response: {
  users: UserSummary[],
  pagination: { total, hasMore }
}
```

Only return users who have `display_name` set (opted into being discoverable).

## Navigation
Add "Friends" to the sidebar/navigation menu.

## UI/UX Notes
- Show friend count badge in navigation
- Empty state for no friends: "Add friends to compare scores!"
- Make it easy to add friends from leaderboard entries (click → view profile → add friend)

## Testing Checklist
- [ ] Can browse all registered users
- [ ] Can search users by name
- [ ] Can add a user as friend
- [ ] Friend appears in friends list
- [ ] Can remove friend
- [ ] Leaderboard "Friends" tab shows only friends' scores
- [ ] Friends highlighted on main leaderboard
- [ ] Friend data persists across sessions
```

---

## PROMPT 4: Achievement System MVP

```markdown
# Task: Implement Achievement System MVP

## Overview
Create a basic achievement system that rewards players for reaching milestones. Start with 15-20 achievements across different categories.

## Achievement Categories
1. **Gameplay** - Score and game-related achievements
2. **Collection** - Shop and inventory achievements
3. **Social** - Friends and community achievements
4. **Milestone** - Overall progress achievements

## Starter Achievements

### Gameplay (8)
| ID | Name | Description | Requirement | Reward |
|----|------|-------------|-------------|--------|
| first-win | First Victory | Win your first game | Complete 1 game | 50 🍊 |
| score-1000 | Getting Started | Score 1,000 points in any game | Any game score ≥1000 | 100 🍊 |
| score-10000 | High Scorer | Score 10,000 points in any game | Any game score ≥10000 | 250 🍊, 5 💎 |
| games-10 | Casual Gamer | Play 10 games | Total games ≥10 | 100 🍊 |
| games-100 | Dedicated Player | Play 100 games | Total games ≥100 | 500 🍊, 10 💎 |
| games-500 | Gaming Addict | Play 500 games | Total games ≥500 | 1000 🍊, 25 💎 |
| all-games | Explorer | Play every active game at least once | All games played | 300 🍊, 10 💎 |
| top-10 | Leaderboard Legend | Reach top 10 on any leaderboard | Rank ≤10 on any game | 500 🍊, 15 💎 |

### Collection (4)
| ID | Name | Description | Requirement | Reward |
|----|------|-------------|-------------|--------|
| first-purchase | Shopper | Buy your first item from the shop | 1 item purchased | 50 🍊 |
| collect-5 | Collector | Own 5 shop items | 5 items owned | 150 🍊 |
| collect-20 | Hoarder | Own 20 shop items | 20 items owned | 500 🍊, 10 💎 |
| nft-avatar | NFT Flex | Set an NFT as your avatar | NFT avatar equipped | 200 🍊, 5 💎 |

### Social (3)
| ID | Name | Description | Requirement | Reward |
|----|------|-------------|-------------|--------|
| first-friend | Friendly | Add your first friend | 1 friend added | 50 🍊 |
| friends-5 | Social Butterfly | Have 5 friends | 5 friends | 200 🍊 |
| profile-complete | Identity | Set a custom display name and emoji | Name + emoji set | 100 🍊 |

### Milestone (4)
| ID | Name | Description | Requirement | Reward |
|----|------|-------------|-------------|--------|
| streak-7 | Week Warrior | Achieve a 7-day play streak | Streak ≥7 | 300 🍊, 5 💎 |
| streak-30 | Monthly Master | Achieve a 30-day play streak | Streak ≥30 | 1000 🍊, 25 💎 |
| earn-10k | Orange Farmer | Earn 10,000 lifetime oranges | Lifetime 🍊 ≥10000 | 500 🍊, 10 💎 |
| earn-100k | Orange Tycoon | Earn 100,000 lifetime oranges | Lifetime 🍊 ≥100000 | 2000 🍊, 50 💎 |

## Implementation

### Achievement Types
**File: `src/types/achievement.ts`** (update existing in currency.ts or create new)

```typescript
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  category: 'gameplay' | 'collection' | 'social' | 'milestone';
  requirement: {
    type: 'score' | 'games_played' | 'streak' | 'items_owned' | 'friends' | 'special';
    target: number;
    gameId?: string; // For game-specific achievements
  };
  reward: {
    oranges: number;
    gems: number;
  };
  isSecret?: boolean; // Hidden until unlocked
}

export interface UserAchievementProgress {
  achievementId: string;
  progress: number; // Current progress toward target
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
  claimedAt?: Date;
}
```

### Achievements Context
**File: `src/contexts/AchievementsContext.tsx`**

```typescript
interface AchievementsContextType {
  achievements: Achievement[]; // All defined achievements
  userProgress: UserAchievementProgress[]; // User's progress

  // Stats for progress tracking
  stats: {
    totalGamesPlayed: number;
    totalScoreAllGames: number;
    highestScore: number;
    currentStreak: number;
    longestStreak: number;
    lifetimeOranges: number;
    itemsOwned: number;
    friendsCount: number;
  };

  // Methods
  checkAchievements: () => void; // Check all achievements for completion
  claimAchievement: (achievementId: string) => Promise<void>;
  getProgress: (achievementId: string) => UserAchievementProgress | null;
}
```

### Achievement Unlock Popup
**File: `src/components/Achievements/AchievementUnlockPopup.tsx`**

Animated popup that shows when achievement is unlocked:
- Achievement icon and name
- "Achievement Unlocked!" header
- Reward display
- "Claim" button

### Achievements Page
**File: `src/pages/Achievements.tsx`**

Route: `/achievements`

Display all achievements in a grid:
- Grouped by category (tabs or sections)
- Show progress bars for incomplete achievements
- Completed achievements have "Claim" button if unclaimed
- Claimed achievements show completion date
- Secret achievements show "???" until unlocked

### Achievement Checking Hooks
Trigger achievement checks at key moments:
- After game ends → check gameplay achievements
- After shop purchase → check collection achievements
- After adding friend → check social achievements
- After daily login → check milestone achievements

### Storage
- localStorage: `wojak_achievement_progress` (array of UserAchievementProgress)
- Backend (later): Add achievements table

## Integration Points

### Game End
In game over flow, after score submission:
```typescript
const { checkAchievements } = useAchievements();
// After saving score
checkAchievements();
```

### Shop Purchase
In Shop component, after successful purchase:
```typescript
checkAchievements();
```

### Profile Updates
When user updates profile (name, avatar):
```typescript
checkAchievements();
```

## Testing Checklist
- [ ] All 19 achievements defined and showing in achievements page
- [ ] Progress bars update correctly based on user stats
- [ ] Achievement unlocks when requirement met
- [ ] Popup shows when achievement unlocked
- [ ] Can claim achievement and receive rewards
- [ ] Claimed achievements marked as complete
- [ ] Secret achievements hidden until unlocked
- [ ] Stats tracked correctly (games played, scores, etc.)
```

---

## PROMPT 5: Leaderboard API - Include Avatar Data

```markdown
# Task: Update Leaderboard API to Include Avatar and Profile Data

## Overview
Currently, the leaderboard API only returns basic score data. Update it to also return avatar information so leaderboards display correctly with user avatars.

## Current API Response
```typescript
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

## Updated API Response
```typescript
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

## File to Modify
**File: `functions/api/leaderboard/[gameId].ts`**

Update SQL query to JOIN with profiles table:
```sql
SELECT
  ROW_NUMBER() OVER (ORDER BY ls.score DESC, ls.created_at ASC) as rank,
  ls.user_id,
  ls.score,
  ls.level,
  ls.created_at,
  p.display_name,
  p.avatar_type,
  p.avatar_value,
  p.avatar_source
FROM leaderboard_scores ls
LEFT JOIN profiles p ON ls.user_id = p.user_id
WHERE ls.game_id = ?
ORDER BY ls.score DESC, ls.created_at ASC
LIMIT ? OFFSET ?
```

Map to response format:
```typescript
entries: rows.map(row => ({
  rank: row.rank,
  userId: row.user_id,
  displayName: row.display_name || 'Player',
  avatar: {
    type: row.avatar_type || 'emoji',
    value: row.avatar_value || '🎮',
    source: row.avatar_source || 'default',
  },
  score: row.score,
  level: row.level,
  createdAt: row.created_at,
}))
```

## Also Update Submit Endpoint
**File: `functions/api/leaderboard/submit.ts`**

Ensure score submission still works correctly and returns updated rank info.

## Frontend Update
**File: `src/hooks/data/useLeaderboard.ts`**

Update types to expect avatar data in API response.
Remove any client-side avatar fetching/joining since API now provides it.

## Testing Checklist
- [ ] Leaderboard API returns avatar data for each entry
- [ ] Avatar displays correctly on leaderboard (emoji or NFT image)
- [ ] NFT avatars show premium styling
- [ ] Pagination still works correctly
- [ ] Score submission still works
```

---

## Execution Order

Run these prompts in order:

1. **PROMPT 1** - Avatar System Refactor (foundation)
2. **PROMPT 5** - Leaderboard API (needed for avatars to display)
3. **PROMPT 2** - Account Dashboard (builds on avatar system)
4. **PROMPT 3** - Friends System (builds on user profiles)
5. **PROMPT 4** - Achievement System (builds on everything)

Each prompt can be run independently in Claude CLI. After each, test thoroughly before moving to the next.
