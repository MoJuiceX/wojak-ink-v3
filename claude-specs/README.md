# Claude CLI Implementation Specs

This folder contains detailed specification files for implementing new features in wojak.ink. Each spec is designed to give Claude CLI everything it needs to implement the feature quickly and correctly.

---

## Execution Order

Run these prompts in order. Each builds on the previous:

| Order | Spec File | Feature | Dependencies |
|-------|-----------|---------|--------------|
| 1 | `01-AVATAR-SYSTEM-SPEC.md` | Avatar system refactor | None |
| 2 | `02-LEADERBOARD-API-SPEC.md` | Leaderboard API update | Spec 1 |
| 3 | `03-ACCOUNT-DASHBOARD-SPEC.md` | Account dashboard | Specs 1, 2 |
| 4 | `04-FRIENDS-SYSTEM-SPEC.md` | Friends system | Specs 1, 2, 3 |
| 5 | `05-ACHIEVEMENT-SYSTEM-SPEC.md` | Achievement system | Specs 1-4 |

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

### Example for Spec 1:

```
Read the spec file at claude-specs/01-AVATAR-SYSTEM-SPEC.md and implement everything described in it. The spec contains all the code, file paths, and implementation details you need. Follow it exactly.
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

## After Implementation

After each spec is implemented, run thorough tests using the checklist at the end of each spec file. Fix any issues before moving to the next spec.
