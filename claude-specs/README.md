# Claude CLI Implementation Specs

This folder contains detailed specification files for implementing new features in wojak.ink. Each spec is designed to give Claude CLI everything it needs to implement the feature quickly and correctly.

---

## Execution Order

Run these prompts in order. Each builds on the previous:

### Phase 1: Core Avatar & Profile System

| Order | Spec File | Feature | Dependencies |
|-------|-----------|---------|--------------|
| 1 | `01-AVATAR-SYSTEM-SPEC.md` | Avatar system refactor | None |
| 2 | `02-LEADERBOARD-API-SPEC.md` | Leaderboard API update | Spec 1 |
| 3 | `03-ACCOUNT-DASHBOARD-SPEC.md` | Account dashboard | Specs 1, 2 |
| 4 | `04-FRIENDS-SYSTEM-SPEC.md` | Friends system | Specs 1, 2, 3 |
| 5 | `05-ACHIEVEMENT-SYSTEM-SPEC.md` | Achievement system | Specs 1-4 |

### Phase 2: Engagement & Economy Features

| Order | Spec File | Feature | Dependencies |
|-------|-----------|---------|--------------|
| 6 | `06-NFT-HOLDER-BADGE-SPEC.md` | NFT holder badge | Specs 1-2 |
| 7 | `07-DAILY-CHALLENGES-SPEC.md` | Daily challenges | Specs 1-5 |
| 8 | `08-LEADERBOARD-REWARDS-SPEC.md` | Leaderboard reward payouts | Specs 1-2, 6 |

---

## How to Use with Claude CLI

### For each spec, give Claude CLI this prompt:

```
Read the spec file at /path/to/wojak-ink/claude-specs/0X-SPEC-NAME.md and implement everything described in it. The spec contains:

- All code to create/modify
- Exact file paths
- Type definitions
- Component structures
- CSS styles
- API endpoints
- Database migrations
- Testing checklist

Follow the spec exactly. Create all files and make all modifications as described.
```

### Example for Spec 6:

```
Read the spec file at claude-specs/06-NFT-HOLDER-BADGE-SPEC.md and implement everything described in it. The spec contains all the code, file paths, and implementation details you need. Follow it exactly.
```

---

## What Each Spec Contains

### 01-AVATAR-SYSTEM-SPEC.md
- New avatar type definitions
- EmojiPicker component (15 curated emojis)
- Updated NFTPicker with real MintGarden/IPFS integration
- UserProfileContext updates for avatar management
- Profile API updates for avatar storage
- Avatar component styling (emoji vs NFT tiers)
- Leaderboard gating changes (Google sign-in only, not NFT)
- Game over screen auth gates
- NFT fallback logic when sold/disconnected

### 02-LEADERBOARD-API-SPEC.md
- Updated leaderboard API to include avatar data
- SQL JOIN with profiles table
- Frontend hook updates
- LeaderboardEntry component updates

### 03-ACCOUNT-DASHBOARD-SPEC.md
- ProfileHeader component
- CurrencyStats component (oranges, gems, donuts, poops)
- GameScoresGrid component
- NftGallery component
- InventorySection with equip/unequip
- RecentActivity component
- Public profile page (/profile/:userId)
- API endpoints for profile and scores

### 04-FRIENDS-SYSTEM-SPEC.md
- FriendsContext for managing friends
- FriendsList component
- UserBrowser for discovering users
- Friends page with tabs
- Leaderboard "Friends" filter
- Users API endpoint
- Friends API endpoint

### 05-ACHIEVEMENT-SYSTEM-SPEC.md
- 19 starter achievements across 4 categories
- Achievement type definitions
- AchievementsContext with progress tracking
- AchievementCard component
- AchievementUnlockPopup component
- Achievements page with filtering
- Integration points for checking achievements

### 06-NFT-HOLDER-BADGE-SPEC.md (NEW)
- Hexagonal badge with 🌱 seedling design
- Gold gradient border, dark green background
- Displays for ANY user who OWNS NFT (regardless of avatar choice)
- Shows on leaderboards, profiles, friends list, game over screens
- Database column for tracking NFT ownership
- API updates to include ownsNft field

### 07-DAILY-CHALLENGES-SPEC.md (NEW)
- 3 fixed daily challenges (play 5 games, set personal best, play 10 mins)
- Rewards: Easy=50🍊, Medium=75🍊, Hard=100🍊
- 50% bonus for completing ALL 3 (112🍊 extra)
- Daily max: 337 oranges from challenges
- DailyChallengesContext for state management
- Play time tracking (active gameplay only)
- Resets at midnight UTC
- DailyChallengesCard component with progress bars

### 08-LEADERBOARD-REWARDS-SPEC.md (NEW)
- Automatic payouts: Daily, Weekly, Monthly
- Per-game leaderboards (15 games × 3 periods)
- Daily: #1=25🍊, #2=15🍊, #3=5🍊, #4-10=10🍊 each, #11-50=3🍊 each
- Weekly: #1=500🍊, #2=300🍊, #3=150🍊
- Monthly: #1=2000🍊, #2=1000🍊, #3=500🍊
- Fresh leaderboard reset each period
- Cloudflare scheduled worker for payouts
- PeriodLeaderboard component with selector

---

## Key Patterns Used

### State Management
- React Context for global state
- localStorage for persistence with API fallback
- 3-second API timeout with graceful fallback

### Styling
- CSS custom properties (--color-*)
- Mobile-first responsive design
- Framer Motion for animations

### API
- Cloudflare Pages Functions
- D1 SQLite database
- Clerk authentication
- Scheduled workers for cron jobs

### NFT Integration
- Sage Wallet for Chia blockchain
- MintGarden API for NFT metadata
- IPFS for NFT images (avoid rate limits)

---

## Key Constants

```typescript
// Collection ID
const WOJAK_COLLECTION_ID = 'col10hfq4hml2z0z0wutu3a9hvt60qy9fcq4k4dznsfncey4lu6kpt3su7u9ah';

// IPFS CID for NFT images
const NFT_IPFS_CID = 'bafybeigjkkonjzwwpopo4wn4gwrrvb7z3nwr2edj2554vx3avc5ietfjwq';

// Generate IPFS URL
function getNftImageUrl(nftId: string | number): string {
  const paddedId = String(nftId).padStart(4, '0');
  return `https://${NFT_IPFS_CID}.ipfs.w3s.link/${paddedId}.png`;
}

// 15 curated emojis (no conflicts with currencies)
const DEFAULT_EMOJIS = ['🎮', '🔥', '🚀', '🎯', '🦊', '🐸', '👾', '🤖', '🎪', '🌸', '🍕', '🎸', '⚡', '🦁', '🐙'];
```

---

## Economy Overview

### Earning Oranges

| Source | Amount |
|--------|--------|
| Starting bonus | 100 🍊 |
| Per game (base) | 10-20 🍊 |
| Per game (max) | 200-600 🍊 |
| High score bonus | 25-60 🍊 |
| Top 10 leaderboard bonus | 50-120 🍊 |
| Daily login (day 1-7) | 100-500 🍊 |
| Daily challenges (all 3) | 337 🍊 max |
| Daily leaderboard rewards | Up to ~500 🍊 (across 15 games) |
| Weekly leaderboard (top 3) | 150-500 🍊 per game |
| Monthly leaderboard (top 3) | 500-2000 🍊 per game |

### Spending Oranges

| Item | Cost |
|------|------|
| Continue game | 50 🍊 |
| Common shop items | 500-800 🍊 |
| Rare shop items | 1000-1500 🍊 |
| Epic shop items | 2000-2500 🍊 |
| Limited badges | 3000 🍊 |

---

## After Implementation

After each spec is implemented, run thorough tests using the checklist at the end of each spec file. Fix any issues before moving to the next spec.
