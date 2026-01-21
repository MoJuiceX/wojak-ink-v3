# SPEC 13: Social & Community Features (v1.0)

> **For Claude CLI**: This specification defines the social layer for wojak.ink - Activity Feed, Player Gifting, Profile Enhancement, Friend Challenges (wagering), Push Notifications, and Online Presence. These features make SPEC 12 cosmetics valuable and the friend system meaningful.

---

## Philosophy: Making Connections Matter

The cosmetics from SPEC 12 are only valuable if people can SEE them. The friend system only matters if friends can DO things together. This spec creates:

- 🔔 **Visibility** - Activity Feed shows what everyone is doing
- 🎁 **Generosity** - Gifting creates bonds between players
- 🏠 **Identity** - Profile pages become personal showcases
- ⚔️ **Competition** - Friend Challenges create rivalries
- 📱 **Re-engagement** - Push notifications bring players back
- 🟢 **Presence** - Online status makes community feel alive

---

## Part 1: ACTIVITY FEED

### Overview
A real-time feed showing what's happening across the Tang Gang community. Shows friend activity prominently, with global highlights.

### Feed Tabs
1. **Friends** - Activity from your friends only
2. **Global** - Highlights from entire community
3. **Guild** - Your guild's activity (if in guild)

### Event Types (Prioritized)

#### Tier 1 - HIGH Social Value (Always Show)
| Event | Example | Icon |
|-------|---------|------|
| Achievement Unlocked | "MoJuice unlocked **Grove Veteran** ⭐" | 🏆 |
| Rare Achievement | "DegenWaffle unlocked **Whale** (spent 125,000+ oranges)" | 💎 |
| Beat Friend's Score | "Foods beat YOUR high score on Memory Match! (2,450 → 2,890)" | ⚡ |
| Top 10 Leaderboard | "Papa Tang reached **#3** on Wojak Wheel!" | 🥉 |
| New #1 Global | "Bullish0x is the NEW #1 on Color Match!" | 👑 |
| Guild Joined/Created | "Tom Bepe created guild **Orange Crusaders**" | 🏰 |
| Legendary Item Purchased | "OrangeGooey bought **Aurora Grove Frame**" | ✨ |
| Legend Emoji Purchased | "TheStakerClass bought 👑 **King Crown**" | 👑 |
| Login Streak Milestone | "MoJuice reached a **30-day login streak!**" | 🔥 |
| Challenge Sent | "DegenWaffle challenged Foods to Memory Match for 1,000 🍊!" | ⚔️ |
| Challenge Result | "Foods won the challenge vs DegenWaffle! (+2,000 🍊)" | 🏆 |
| Gift Sent | "Papa Tang gifted MoJuice 500 🍊!" | 🎁 |
| Gift Item Sent | "Bullish0x gifted Tom Bepe the **Fire Text** name effect!" | 🎁 |

#### Tier 2 - MEDIUM Social Value (Show in Friends/Guild)
| Event | Example | Icon |
|-------|---------|------|
| New Personal Best | "MoJuice set a new personal best on Slot Machine (1,250)" | 📈 |
| New Friend Added | "DegenWaffle and Foods are now friends" | 🤝 |
| Cosmetic Purchased | "Tom Bepe bought **Burning Citrus Frame**" | 🛒 |
| Daily Challenges Complete | "OrangeGooey completed all daily challenges" | ✅ |
| Guild Member Joined | "TheStakerClass joined **Orange Crusaders**" | 📥 |
| Guild Promotion | "MoJuice was promoted to **Officer** in Orange Crusaders" | ⬆️ |
| Level Up | "Foods reached **Level 15**" | 🆙 |
| Title Equipped | "Papa Tang is now **"Winners Win!"**" | 🏷️ |
| Profile Updated | "Bullish0x updated their profile showcase" | 🖼️ |

#### Tier 3 - LOW Social Value (Optional/Filtered)
| Event | Example | Icon |
|-------|---------|------|
| Game Played | "MoJuice played Wojak Wheel" | 🎮 |
| Avatar Changed | "DegenWaffle changed their avatar" | 👤 |
| Login Reward Claimed | "Foods claimed daily login reward" | 📅 |
| Basic Item Purchased | "Tom Bepe bought 🍊 Orange emoji" | 🛒 |

### Activity Feed UI

```
┌─────────────────────────────────────────────────────────┐
│  ACTIVITY FEED                    [Friends] [Global] [Guild]
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏆 2 min ago                                          │
│  [Avatar] MoJuice unlocked **Grove Veteran** ⭐        │
│  "1 year on the platform!"                             │
│  [👍 12] [💬 3]                                        │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ⚡ 15 min ago                                         │
│  [Avatar] Foods beat DegenWaffle's score!              │
│  Memory Match: 2,450 → 2,890 (+440)                    │
│  [👍 8] [⚔️ Challenge]                                 │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  🎁 1 hour ago                                         │
│  [Avatar] Papa Tang → [Avatar] MoJuice                 │
│  Gifted 500 🍊                                         │
│  "Winners support winners!"                            │
│  [👍 24] [💬 7]                                        │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ✨ 3 hours ago                                        │
│  [Avatar] OrangeGooey bought Aurora Grove Frame        │
│  [Preview of frame effect]                             │
│  [👍 15] [👀 View Profile]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Feed Interactions
- **👍 Like** - React to activity (counts visible)
- **💬 Comment** - Short comment (max 140 chars)
- **⚔️ Challenge** - Quick-challenge from score events
- **👀 View Profile** - Jump to user's profile
- **🎁 Send Gift** - Quick gift from any event

### Feed Settings (User Controls)
- Show/hide event types
- Notification preferences per type
- Mute specific users (still friends, just hidden from feed)

### Database Schema

```sql
-- Activity events
CREATE TABLE IF NOT EXISTS activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  target_user_id TEXT,           -- For friend-related events
  guild_id TEXT,                 -- For guild events
  data TEXT NOT NULL,            -- JSON with event details
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for efficient querying
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_event_type (event_type)
);

-- Activity likes
CREATE TABLE IF NOT EXISTS activity_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(event_id, user_id)
);

-- Activity comments
CREATE TABLE IF NOT EXISTS activity_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User feed preferences
CREATE TABLE IF NOT EXISTS user_feed_preferences (
  user_id TEXT PRIMARY KEY,
  hidden_event_types TEXT,       -- JSON array of hidden types
  muted_users TEXT,              -- JSON array of muted user IDs
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

```typescript
// GET /api/feed?tab=friends|global|guild&limit=20&before=eventId
// Returns paginated feed events

// POST /api/feed/events
// Create new activity event (internal use)

// POST /api/feed/:eventId/like
// Like an event

// DELETE /api/feed/:eventId/like
// Unlike an event

// POST /api/feed/:eventId/comment
// Add comment to event

// GET /api/feed/:eventId/comments
// Get comments for event

// PUT /api/feed/preferences
// Update feed preferences
```

---

## Part 2: PLAYER GIFTING

### Overview
Players can gift oranges and shop items to friends. Creates generosity loops and strengthens social bonds.

### Gift Types

#### 1. Orange Gifting
- Gift any amount of oranges to friends
- Daily limit: 5,000 🍊 total sent per day
- Minimum gift: 100 🍊
- Message optional (max 100 chars)

#### 2. Item Gifting
- Buy any shop item as a gift for a friend
- Purchaser pays full price
- Friend receives item in inventory
- Cannot gift items you already own (must buy new)
- Gift wrapping animation on receive

### Anti-Fraud Requirements
| Rule | Requirement |
|------|-------------|
| Friendship Duration | Must be friends for 48+ hours |
| Account Age | Recipient must have account 7+ days old |
| Daily Limit (Oranges) | 5,000 🍊 sent per day max |
| Daily Limit (Items) | 5 items sent per day max |
| Self-Gifting | Cannot gift to yourself |

### Gift Flow

```
1. SENDER initiates gift
   ├─ Select friend from list
   ├─ Choose: Oranges or Shop Item
   ├─ Enter amount / Select item
   ├─ Add optional message
   └─ Confirm (oranges deducted)

2. SYSTEM processes gift
   ├─ Validate friendship duration (48h)
   ├─ Validate recipient account age (7d)
   ├─ Validate daily limits
   ├─ Create gift record
   └─ Create activity event

3. RECIPIENT receives gift
   ├─ Push notification: "🎁 Papa Tang sent you a gift!"
   ├─ Gift appears in notifications
   ├─ Open gift (animation)
   ├─ Oranges/item added to account
   └─ Activity feed updated
```

### Gift UI

```
┌─────────────────────────────────────────────────────────┐
│  🎁 SEND A GIFT                                   [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  To: [Select Friend ▼]                                 │
│       ┌────────────────────────────┐                   │
│       │ 🟢 DegenWaffle             │                   │
│       │ 🟢 Foods                   │                   │
│       │ ⚪ Papa Tang (offline)     │                   │
│       └────────────────────────────┘                   │
│                                                         │
│  Gift Type:                                            │
│  [🍊 Oranges]  [🛒 Shop Item]                          │
│                                                         │
│  ─── If Oranges ───                                    │
│  Amount: [    500    ] 🍊                              │
│  Your balance: 12,450 🍊                               │
│  Daily limit remaining: 4,500 🍊                       │
│                                                         │
│  ─── If Shop Item ───                                  │
│  [Browse Shop Items...]                                │
│  Selected: Burning Citrus Frame (12,500 🍊)            │
│                                                         │
│  Message (optional):                                   │
│  ┌─────────────────────────────────────────────┐       │
│  │ Winners support winners! 🍊                 │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  [Cancel]                    [🎁 Send Gift]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Gift Notification (Recipient)

```
┌─────────────────────────────────────────────────────────┐
│  🎁 You received a gift!                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          [Wrapped Gift Box Animation]                  │
│                                                         │
│          From: Papa Tang                               │
│                                                         │
│              [🎁 Open Gift]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘

        ↓ After opening ↓

┌─────────────────────────────────────────────────────────┐
│  🎉 Gift Revealed!                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│          [Gift Opening Animation]                      │
│                                                         │
│          500 🍊                                        │
│                                                         │
│          "Winners support winners! 🍊"                 │
│          - Papa Tang                                   │
│                                                         │
│              [💬 Say Thanks]  [Close]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Gift records
CREATE TABLE IF NOT EXISTS gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  gift_type TEXT NOT NULL,        -- 'oranges' or 'item'
  amount INTEGER,                  -- For orange gifts
  item_id TEXT,                    -- For item gifts
  message TEXT,
  status TEXT DEFAULT 'pending',   -- pending, opened, claimed
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  opened_at TEXT,

  INDEX idx_recipient (recipient_id),
  INDEX idx_sender_date (sender_id, created_at)
);

-- Daily gift tracking
CREATE TABLE IF NOT EXISTS gift_daily_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,              -- YYYY-MM-DD
  oranges_sent INTEGER DEFAULT 0,
  items_sent INTEGER DEFAULT 0,

  UNIQUE(user_id, date)
);
```

### API Endpoints

```typescript
// POST /api/gifts/send
{
  recipientId: string;
  giftType: 'oranges' | 'item';
  amount?: number;      // For oranges
  itemId?: string;      // For items
  message?: string;
}

// GET /api/gifts/pending
// Returns unopened gifts for current user

// POST /api/gifts/:giftId/open
// Open a gift (triggers animation, adds to account)

// GET /api/gifts/history?type=sent|received
// Gift history

// GET /api/gifts/limits
// Returns current daily limits status
```

---

## Part 3: PROFILE ENHANCEMENT

### Overview
Transform profiles from basic info pages into personalized showcases. Users curate their identity with purchasable customization options.

### Profile Sections

#### 1. Header Section (Always Visible)
- **Avatar** with equipped frame
- **Username** with equipped name effect
- **Title** (equipped from SPEC 12)
- **Emoji Ring** (from SPEC 12)
- **Online Status** (green/yellow/gray dot)
- **BigPulp** companion

#### 2. Bio Section
- **About Me** - 280 character bio
- **Social Links** - X, Discord, Telegram, Wallet
- **Location** - Optional city/country
- **Member Since** - Join date

#### 3. Stats Section
- **Level & XP** with progress bar
- **Total Oranges Earned** (lifetime)
- **Current Streak** (login)
- **Longest Streak** (login)
- **Games Played** (total)
- **Profile Views** counter

#### 4. Showcase Section (NEW - Customizable)
Users choose 3-6 showcase slots to display. Options:

| Showcase Type | Description |
|---------------|-------------|
| **Achievement Showcase** | Display 3-6 favorite achievements |
| **Game Stats Showcase** | Best scores across all games |
| **Cosmetic Showcase** | Show off rarest owned items |
| **Friend Showcase** | Display closest friends |
| **Guild Showcase** | Guild info and role |
| **Trophy Case** | Earned badges and rewards |
| **Activity Highlight** | Recent notable activity |

#### 5. Game Scores Section
- Best scores for each game
- Rank in each game
- "Beat This Score" challenge button

#### 6. Collection Preview
- Quick view of Achievement Drawer
- "View Full Collection" link

### Profile Customization Options (Purchasable)

#### Profile Backgrounds (NEW - separate from card backgrounds)
| Name | Description | Price |
|------|-------------|-------|
| Default | Standard dark background | Free |
| Gradient Sunset | Orange to purple gradient | 2,500 🍊 |
| The Grove | Animated orange trees | 10,000 🍊 |
| Matrix Tang | Orange code rain | 15,000 🍊 |
| Starfield | Space with orange nebula | 15,000 🍊 |
| Holographic | Iridescent shimmer | 25,000 🍊 |

#### Profile Music (Background Audio)
| Name | Description | Price |
|------|-------------|-------|
| None | No music | Free |
| Chill Beats | Lo-fi background | 5,000 🍊 |
| Epic Vibes | Cinematic ambient | 5,000 🍊 |
| Retro Wave | Synthwave | 7,500 🍊 |
| Tang Theme | Official theme | 10,000 🍊 |

*Music auto-plays on profile visit (with mute option)*

#### Profile Layouts
| Name | Description | Price |
|------|-------------|-------|
| Classic | Standard layout | Free |
| Compact | Minimalist, stats-focused | 2,500 🍊 |
| Showcase | Large showcase area | 5,000 🍊 |
| Flex | Maximum visual elements | 10,000 🍊 |

#### Additional Showcase Slots
| Slots | Price |
|-------|-------|
| 3 slots | Free |
| 4 slots | 5,000 🍊 |
| 5 slots | 10,000 🍊 |
| 6 slots | 20,000 🍊 |

### Profile Interactions

| Action | Description |
|--------|-------------|
| **👍 Kudos** | One-click appreciation (daily limit: 10) |
| **💬 Comment** | Leave comment on profile (max 280 chars) |
| **🎁 Gift** | Quick gift from profile |
| **⚔️ Challenge** | Challenge to friend duel |
| **➕ Add Friend** | Send friend request |
| **👁️ View Count** | Increments on unique daily visits |

### Profile Comments

```
┌─────────────────────────────────────────────────────────┐
│  PROFILE COMMENTS (12)                     [Leave Comment]
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Avatar] DegenWaffle • 2 hours ago                    │
│  "That Aurora Grove frame is insane! 🔥"               │
│  [👍 5] [Reply]                                        │
│                                                         │
│  [Avatar] Foods • 1 day ago                            │
│  "GG on that #1 score, will get you next time"         │
│  [👍 3] [Reply]                                        │
│    └─ [Avatar] MoJuice • 1 day ago                     │
│       "Bring it! 😤"                                   │
│       [👍 2]                                           │
│                                                         │
│  [Avatar] Papa Tang • 3 days ago                       │
│  "Welcome to the Grove! Winners win, baby! 🍊"         │
│  [👍 15] [Reply]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Enhanced profile data
CREATE TABLE IF NOT EXISTS profile_customization (
  user_id TEXT PRIMARY KEY,
  bio TEXT,
  location TEXT,
  discord_handle TEXT,
  telegram_handle TEXT,
  profile_background TEXT DEFAULT 'default',
  profile_music TEXT,
  profile_layout TEXT DEFAULT 'classic',
  showcase_slots INTEGER DEFAULT 3,
  showcase_config TEXT,           -- JSON array of showcase types
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Profile view tracking
CREATE TABLE IF NOT EXISTS profile_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_user_id TEXT NOT NULL,
  viewer_user_id TEXT,            -- NULL for anonymous
  viewed_at TEXT DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_profile_date (profile_user_id, viewed_at)
);

-- Profile view counts (aggregated daily)
CREATE TABLE IF NOT EXISTS profile_view_counts (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,             -- YYYY-MM-DD
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  PRIMARY KEY (user_id, date)
);

-- Profile kudos
CREATE TABLE IF NOT EXISTS profile_kudos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_user_id TEXT NOT NULL,
  giver_user_id TEXT NOT NULL,
  given_at TEXT DEFAULT CURRENT_TIMESTAMP,

  -- One kudos per giver per day
  UNIQUE(profile_user_id, giver_user_id, date(given_at))
);

-- Profile comments
CREATE TABLE IF NOT EXISTS profile_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_user_id TEXT NOT NULL,
  commenter_user_id TEXT NOT NULL,
  parent_comment_id INTEGER,       -- For replies
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_profile (profile_user_id)
);

-- Profile comment likes
CREATE TABLE IF NOT EXISTS profile_comment_likes (
  comment_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (comment_id, user_id)
);
```

### API Endpoints

```typescript
// GET /api/profile/:userId
// Full profile data including customization

// PUT /api/profile/customization
// Update profile customization settings

// POST /api/profile/:userId/kudos
// Give kudos to a profile

// GET /api/profile/:userId/comments
// Get profile comments

// POST /api/profile/:userId/comments
// Add comment to profile

// POST /api/profile/comments/:commentId/like
// Like a comment

// POST /api/profile/comments/:commentId/reply
// Reply to a comment

// GET /api/profile/:userId/stats
// Get profile view stats
```

---

## Part 4: FRIEND CHALLENGES (Wagering)

### Overview
Players challenge friends to head-to-head score competitions with orange wagers. Both players bet oranges, play the same game, highest score wins the pot.

### Challenge Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CHALLENGE FLOW                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CHALLENGER CREATES                                  │
│     ├─ Select friend                                    │
│     ├─ Select game                                      │
│     ├─ Set wager amount (100-10,000 🍊)                │
│     ├─ Set time limit (1h, 6h, 24h, 48h)               │
│     └─ Challenger's oranges go to ESCROW               │
│                                                         │
│  2. FRIEND RECEIVES CHALLENGE                           │
│     ├─ Push notification                               │
│     ├─ In-app notification                             │
│     └─ Can Accept or Decline                           │
│                                                         │
│  3A. IF ACCEPTED                                        │
│     ├─ Friend's oranges go to ESCROW                   │
│     ├─ Total pot = Challenger + Friend wagers          │
│     ├─ Timer starts                                    │
│     └─ Both can play ONE game each                     │
│                                                         │
│  3B. IF DECLINED                                        │
│     └─ Challenger's oranges returned from escrow       │
│                                                         │
│  4. PLAY PHASE                                          │
│     ├─ Each player gets ONE attempt                    │
│     ├─ Score is locked after playing                   │
│     ├─ Can see if opponent has played (not score)      │
│     └─ Timer counts down                               │
│                                                         │
│  5. RESOLUTION                                          │
│     ├─ When both played OR timer expires               │
│     ├─ Higher score wins entire pot                    │
│     ├─ Tie = pot split 50/50                          │
│     ├─ No-show = forfeit (opponent wins)               │
│     └─ Activity feed announcement                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Challenge Wager Tiers

| Tier | Min Wager | Max Wager | House Fee |
|------|-----------|-----------|-----------|
| Casual | 100 🍊 | 500 🍊 | 0% |
| Standard | 501 🍊 | 2,500 🍊 | 5% |
| High Stakes | 2,501 🍊 | 10,000 🍊 | 10% |

*House fee taken from pot before payout (funds Grove Treasury for events)*

### Challenge UI

#### Creating a Challenge

```
┌─────────────────────────────────────────────────────────┐
│  ⚔️ CREATE CHALLENGE                              [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Challenge: [Select Friend ▼]                          │
│             DegenWaffle (Online 🟢)                     │
│                                                         │
│  Game: [Select Game ▼]                                 │
│        ┌────────────────────────────┐                  │
│        │ 🎰 Wojak Wheel             │                  │
│        │ 🧠 Memory Match            │                  │
│        │ 🎨 Color Match             │                  │
│        │ 🎰 Slot Machine            │                  │
│        └────────────────────────────┘                  │
│                                                         │
│  Wager: [    1,000    ] 🍊                             │
│  Your balance: 12,450 🍊                               │
│  If you win: +2,000 🍊 (pot) - 10% fee = +1,800 🍊    │
│                                                         │
│  Time Limit: [24 hours ▼]                              │
│              1 hour | 6 hours | 24 hours | 48 hours    │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  📋 Challenge Rules:                                   │
│  • Both players wager 1,000 🍊                         │
│  • Each player plays ONE game                          │
│  • Highest score wins the pot                          │
│  • Tie = 50/50 split                                   │
│  • No-show = forfeit                                   │
│                                                         │
│  [Cancel]                    [⚔️ Send Challenge]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Challenge Notification (Recipient)

```
┌─────────────────────────────────────────────────────────┐
│  ⚔️ INCOMING CHALLENGE!                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Avatar] MoJuice challenges you!                      │
│                                                         │
│  🎮 Game: Memory Match                                 │
│  💰 Wager: 1,000 🍊 each                               │
│  🏆 Prize: 1,800 🍊 (after 10% fee)                    │
│  ⏱️ Time: 24 hours to complete                         │
│                                                         │
│  MoJuice's Record vs You:                              │
│  Won: 3 | Lost: 2 | Tied: 1                            │
│                                                         │
│  Your Balance: 8,500 🍊                                │
│                                                         │
│  [❌ Decline]              [⚔️ Accept Challenge]       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Active Challenge View

```
┌─────────────────────────────────────────────────────────┐
│  ⚔️ ACTIVE CHALLENGE                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MoJuice  vs  DegenWaffle                              │
│  [Avatar]     [Avatar]                                 │
│                                                         │
│  🎮 Memory Match                                       │
│  💰 Pot: 2,000 🍊                                      │
│  ⏱️ Time Left: 18:42:33                                │
│                                                         │
│  ┌─────────────────┬─────────────────┐                 │
│  │    MoJuice      │   DegenWaffle   │                 │
│  ├─────────────────┼─────────────────┤                 │
│  │   Score: 2,450  │   Waiting...    │                 │
│  │   ✅ Played     │   ⏳ Not played │                 │
│  └─────────────────┴─────────────────┘                 │
│                                                         │
│  [🎮 Play Now]  (DegenWaffle only)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Challenge Result

```
┌─────────────────────────────────────────────────────────┐
│  🏆 CHALLENGE COMPLETE!                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│             🎉 MOJUICE WINS! 🎉                        │
│                                                         │
│  MoJuice  vs  DegenWaffle                              │
│  [Avatar]     [Avatar]                                 │
│   2,450        2,180                                   │
│   WINNER       +270 ahead                              │
│                                                         │
│  Prize Won: +1,800 🍊                                  │
│  (2,000 pot - 10% house fee)                           │
│                                                         │
│  Head-to-Head Record: 4-2-1                            │
│                                                         │
│  [🎁 Gift Consolation]  [⚔️ Rematch]  [Close]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Challenge Rules

1. **One Attempt Per Challenge** - No retries, no practice runs counted
2. **Score Visibility** - Can't see opponent's score until both complete
3. **Time Limits** - Must complete within selected timeframe
4. **Forfeits** - If time expires and one player didn't play, they forfeit
5. **Active Limit** - Maximum 5 active challenges at once per player
6. **Minimum Balance** - Must have wager amount available
7. **No Cancellation** - Once accepted, challenge must complete

### Database Schema

```sql
-- Challenge records
CREATE TABLE IF NOT EXISTS friend_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  challenger_id TEXT NOT NULL,
  challenged_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  wager_amount INTEGER NOT NULL,
  time_limit_hours INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',   -- pending, active, completed, declined, expired
  challenger_score INTEGER,
  challenged_score INTEGER,
  winner_id TEXT,
  house_fee INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  accepted_at TEXT,
  expires_at TEXT,
  completed_at TEXT,

  INDEX idx_challenger (challenger_id),
  INDEX idx_challenged (challenged_id),
  INDEX idx_status (status)
);

-- Challenge escrow (oranges held during challenge)
CREATE TABLE IF NOT EXISTS challenge_escrow (
  challenge_id INTEGER PRIMARY KEY,
  total_pot INTEGER NOT NULL,
  challenger_amount INTEGER NOT NULL,
  challenged_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'held',      -- held, released
  released_at TEXT
);

-- Challenge history for head-to-head records
CREATE TABLE IF NOT EXISTS challenge_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  opponent_id TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  ties INTEGER DEFAULT 0,
  total_won INTEGER DEFAULT 0,     -- Oranges won
  total_lost INTEGER DEFAULT 0,    -- Oranges lost

  UNIQUE(user_id, opponent_id)
);
```

### API Endpoints

```typescript
// POST /api/challenges/create
{
  challengedId: string;
  gameId: string;
  wagerAmount: number;
  timeLimitHours: 1 | 6 | 24 | 48;
}

// GET /api/challenges/pending
// Challenges waiting for response

// GET /api/challenges/active
// Currently active challenges

// POST /api/challenges/:challengeId/accept
// Accept a challenge

// POST /api/challenges/:challengeId/decline
// Decline a challenge

// POST /api/challenges/:challengeId/submit-score
{
  score: number;
}

// GET /api/challenges/history
// Past challenges

// GET /api/challenges/record/:opponentId
// Head-to-head record with specific opponent
```

---

## Part 5: PUSH NOTIFICATIONS

### Overview
Send real-time notifications to users' devices even when not on the site. Brings users back for important events.

### Notification Types

| Category | Event | Message Example |
|----------|-------|-----------------|
| **Social** | Gift Received | "🎁 Papa Tang sent you a gift!" |
| **Social** | Friend Request | "👋 DegenWaffle wants to be friends" |
| **Social** | Challenge Received | "⚔️ MoJuice challenged you to Memory Match for 1,000 🍊!" |
| **Social** | Challenge Result | "🏆 You won the challenge vs DegenWaffle! +1,800 🍊" |
| **Social** | Profile Comment | "💬 Foods commented on your profile" |
| **Competition** | Score Beaten | "⚡ DegenWaffle just beat your Memory Match score!" |
| **Competition** | Leaderboard Drop | "📉 You dropped to #5 on Wojak Wheel" |
| **Engagement** | Streak Warning | "🔥 Your 15-day streak will break in 2 hours!" |
| **Engagement** | Daily Challenges | "✅ New daily challenges available!" |
| **Engagement** | Daily Reward | "🎁 Your daily reward is ready!" |
| **Guild** | Guild Invite | "🏰 Orange Crusaders invited you to join!" |
| **Guild** | Member Joined | "📥 TheStakerClass joined your guild" |
| **Shop** | Wishlist Sale | "💰 An item on your wishlist is on sale!" |

### Notification Preferences (User Controls)

```
┌─────────────────────────────────────────────────────────┐
│  🔔 NOTIFICATION SETTINGS                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Push Notifications: [ON 🔔]                           │
│                                                         │
│  ─── Social ───                                        │
│  Gifts received          [✓]                           │
│  Friend requests         [✓]                           │
│  Challenges              [✓]                           │
│  Profile interactions    [✓]                           │
│                                                         │
│  ─── Competition ───                                   │
│  Score beaten            [✓]                           │
│  Leaderboard changes     [ ]                           │
│                                                         │
│  ─── Engagement ───                                    │
│  Streak warnings         [✓]                           │
│  Daily rewards           [✓]                           │
│  Daily challenges        [ ]                           │
│                                                         │
│  ─── Guild ───                                         │
│  Guild invites           [✓]                           │
│  Member activity         [ ]                           │
│                                                         │
│  Quiet Hours: [10:00 PM] to [8:00 AM]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation Notes

The notification framework already exists in wojak.ink:
- Service worker registered
- Push subscription handling ready
- Notification types defined

**What needs to be built:**
1. Backend push delivery via Web Push API
2. Notification queue for batching
3. Quiet hours enforcement
4. Click-through tracking (which notifications bring users back)

### Database Schema

```sql
-- Notification queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT,                      -- JSON for click handling
  priority TEXT DEFAULT 'normal', -- low, normal, high
  scheduled_for TEXT,             -- For delayed notifications
  sent_at TEXT,
  clicked_at TEXT,
  status TEXT DEFAULT 'pending',  -- pending, sent, clicked, failed

  INDEX idx_user_pending (user_id, status)
);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys TEXT NOT NULL,             -- JSON: {p256dh, auth}
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_used TEXT,

  INDEX idx_user (user_id)
);
```

---

## Part 6: ONLINE PRESENCE

### Overview
Show who's online, what they're doing, and when they were last active.

### Presence States

| State | Icon | Meaning |
|-------|------|---------|
| **Online** | 🟢 | Active in last 5 minutes |
| **Away** | 🟡 | Idle 5-30 minutes |
| **In Game** | 🎮 | Currently playing a game |
| **Offline** | ⚪ | Not active, shows "Last seen X ago" |
| **Invisible** | ⚪ | Appears offline but actually online |

### Where Presence Shows

1. **Friend List** - Online friends at top, sorted by status
2. **Profile Page** - Status dot + "Currently playing X"
3. **Activity Feed** - Online indicator on avatars
4. **Challenge UI** - See if friend is available
5. **Guild Member List** - Who's online in guild

### Activity Status (Rich Presence)

```
🟢 MoJuice
   Playing Wojak Wheel (Score: 1,240)

🟢 DegenWaffle
   Browsing Shop

🟡 Foods
   Away (15 min)

🎮 Papa Tang
   In Challenge vs TheStakerClass

⚪ Tom Bepe
   Last seen 2 hours ago
```

### Database Schema

```sql
-- User presence (updated frequently)
CREATE TABLE IF NOT EXISTS user_presence (
  user_id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'offline',   -- online, away, in_game, offline, invisible
  activity TEXT,                   -- Current activity description
  game_id TEXT,                    -- If playing a game
  last_heartbeat TEXT,             -- Last ping time
  last_seen TEXT,                  -- Last activity time

  INDEX idx_status (status)
);

-- Presence settings
CREATE TABLE IF NOT EXISTS presence_settings (
  user_id TEXT PRIMARY KEY,
  show_online_status BOOLEAN DEFAULT 1,
  show_activity BOOLEAN DEFAULT 1,
  invisible_mode BOOLEAN DEFAULT 0
);
```

### API Endpoints

```typescript
// POST /api/presence/heartbeat
// Called every 30 seconds when user is active
{
  activity?: string;
  gameId?: string;
}

// GET /api/presence/friends
// Returns online status of all friends

// PUT /api/presence/settings
// Update presence settings (invisible mode, etc.)

// GET /api/presence/:userId
// Get specific user's presence (respects privacy)
```

---

## Part 7: GUILD DATABASE MIGRATION

### Overview
Migrate guild system from localStorage to Cloudflare D1 database for persistence and cross-device sync.

### Current State
- Full guild implementation in `GuildContext.tsx`
- All data in localStorage
- Risk of data loss

### Migration Tasks

1. Create guild tables in D1
2. Create API endpoints for all guild operations
3. Update GuildContext to use API instead of localStorage
4. Data migration utility for existing localStorage data

### Database Schema

```sql
-- Guilds
CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  leader_id TEXT NOT NULL,
  banner_pattern TEXT,
  banner_primary_color TEXT,
  banner_secondary_color TEXT,
  banner_emblem TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  weekly_score INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT 1,
  min_level INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_name (name),
  INDEX idx_leader (leader_id)
);

-- Guild members
CREATE TABLE IF NOT EXISTS guild_members (
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',     -- leader, officer, member
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  weekly_contribution INTEGER DEFAULT 0,
  total_contribution INTEGER DEFAULT 0,

  PRIMARY KEY (guild_id, user_id)
);

-- Guild invites
CREATE TABLE IF NOT EXISTS guild_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending',   -- pending, accepted, declined, expired
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  responded_at TEXT,

  INDEX idx_user_pending (user_id, status)
);

-- Guild join requests
CREATE TABLE IF NOT EXISTS guild_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  responded_at TEXT,
  responded_by TEXT,

  INDEX idx_guild_pending (guild_id, status)
);

-- Guild activity log
CREATE TABLE IF NOT EXISTS guild_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_id TEXT,
  data TEXT,                      -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_guild_recent (guild_id, created_at)
);
```

---

## Implementation Priority

### Phase 1: Foundation
1. Activity Feed (database + API + basic UI)
2. Online Presence (heartbeat system)
3. Push Notification delivery

### Phase 2: Core Social
4. Player Gifting (full system)
5. Profile Enhancement (customization + comments)

### Phase 3: Competition
6. Friend Challenges (wagering system)

### Phase 4: Infrastructure
7. Guild Database Migration

---

## Price Summary (New Items)

| Item | Price |
|------|-------|
| **Profile Backgrounds** | |
| Gradient Sunset | 2,500 🍊 |
| The Grove (animated) | 10,000 🍊 |
| Matrix Tang | 15,000 🍊 |
| Starfield | 15,000 🍊 |
| Holographic | 25,000 🍊 |
| **Profile Music** | |
| Chill Beats | 5,000 🍊 |
| Epic Vibes | 5,000 🍊 |
| Retro Wave | 7,500 🍊 |
| Tang Theme | 10,000 🍊 |
| **Profile Layouts** | |
| Compact | 2,500 🍊 |
| Showcase | 5,000 🍊 |
| Flex | 10,000 🍊 |
| **Showcase Slots** | |
| 4th slot | 5,000 🍊 |
| 5th slot | 10,000 🍊 |
| 6th slot | 20,000 🍊 |

---

**Winners win, baby!** 🍊
