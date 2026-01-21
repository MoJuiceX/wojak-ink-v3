# Claude CLI: Unified Profile & Achievement System

## Overview

Create a unified system where users can fully customize their **Profile Page**, **Achievement Drawer**, and **Achievements Showcase**. Everything is individualizable - the user controls how their pages look and what they flex.

## The Three Pages (All Customizable)

### 1. PROFILE PAGE (`/profile/:username`)
The user's main public page - their identity on wojak.ink.

### 2. ACHIEVEMENT DRAWER (`/drawer/:username`)
Showcase of purchased cosmetics and items (from SPEC 12).

### 3. ACHIEVEMENTS PAGE (`/achievements/:username`)
Showcase of earned accomplishments and badges.

**All three should share:**
- Consistent customization options
- Same visual language
- User-controlled styling
- Premium feel

---

## UNIFIED PROFILE SYSTEM LAYOUT

When someone visits a user's profile, they see:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         PROFILE HEADER                                  │   │
│   │                     (Customizable Banner)                               │   │
│   │                                                                         │   │
│   │      [Avatar + Frame]     USERNAME                                      │   │
│   │        [BigPulp]          "Title"                                       │   │
│   │                           [Emoji Ring]                                  │   │
│   │                                                                         │   │
│   │      Bio: "Tang Gang forever! Winners win, baby! 🍊"                    │   │
│   │      🐦 @username  |  💬 Discord  |  📍 Location                        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   [🏠 Overview]  [🛍️ Collection]  [🏆 Achievements]  [📊 Stats]        │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │                        TAB CONTENT AREA                                 │   │
│   │              (Changes based on selected tab)                            │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TAB 1: OVERVIEW (Default)

The landing page - shows highlights from everything:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   STATS CARDS                                                                   │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│   │  Level   │ │  Items   │ │Achievements│ │  Streak  │ │  Rank    │            │
│   │   15     │ │   47     │ │   12/19   │ │  30 🔥   │ │   #42    │            │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│                                                                                 │
│   ⭐ FEATURED (User pins their best items here)                                │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   │ Aurora Frame│ │ 👑 Crown    │ │ Grove King  │ │ High Scorer │             │
│   │   (item)    │ │  (emoji)    │ │(achievement)│ │(achievement)│             │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                                 │
│   🎮 RECENT ACTIVITY                                                           │
│   • Unlocked "High Scorer" achievement - 2 hours ago                           │
│   • Purchased Aurora Grove Frame - 1 day ago                                   │
│   • Reached #3 on Wojak Wheel - 2 days ago                                     │
│                                                                                 │
│   🏆 GAME SCORES                                                               │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   │ Wojak Wheel │ │Memory Match │ │ Color Match │ │Slot Machine │             │
│   │   12,450    │ │   3,200     │ │   8,900     │ │   5,670     │             │
│   │    #3 🥉    │ │   #15       │ │    #8       │ │   #22       │             │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TAB 2: COLLECTION (Achievement Drawer)

Shows all purchased items from the shop:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   🛍️ COLLECTION                              47 Items  |  62,500 🍊 Spent      │
│                                                                                 │
│   [All] [Emojis] [Frames] [Titles] [Effects] [Backgrounds] [BigPulp]           │
│                                                                                 │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   │   👑        │ │   🎩        │ │   🔥        │ │   🍊        │             │
│   │ King Crown  │ │  Top Hat    │ │ Fire Emoji  │ │   Orange    │             │
│   │  LEGENDARY  │ │  LEGENDARY  │ │   LEGEND    │ │   COMMON    │             │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                                 │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│   │ [Aurora]    │ │ [Burning]   │ │ [Holograph] │ │ [Electric]  │             │
│   │Aurora Grove │ │Burning Citrus│ │ Holographic│ │Electric Tang│             │
│   │  LEGENDARY  │ │   HARVEST   │ │  LEGENDARY  │ │   HARVEST   │             │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                                                 │
│   ... more items in grid ...                                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TAB 3: ACHIEVEMENTS

Shows earned accomplishments:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   🏆 ACHIEVEMENTS                                    12/19 Completed (63%)      │
│                                                                                 │
│   ████████████████████░░░░░░░░░░  Achievement Progress                         │
│                                                                                 │
│   [All] [Gameplay] [Collection] [Social] [Milestones]     [Sort: Rarity ▼]     │
│                                                                                 │
│   ━━━ COMPLETED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                 │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                  │
│   │      👑         │ │      🔥         │ │      ⭐         │                  │
│   │                 │ │                 │ │                 │                  │
│   │   Grove King    │ │   High Scorer   │ │   First Steps   │                  │
│   │  Reach #1 on    │ │ Score 10,000 in │ │ Complete your   │                  │
│   │  any leaderboard│ │    any game     │ │   first game    │                  │
│   │                 │ │                 │ │                 │                  │
│   │ ┌────────────┐  │ │ ┌────────────┐  │ │ ┌────────────┐  │                  │
│   │ │ LEGENDARY  │  │ │ │    RARE    │  │ │ │   COMMON   │  │                  │
│   │ └────────────┘  │ │ └────────────┘  │ │ └────────────┘  │                  │
│   │  +2,000 🍊      │ │   +500 🍊       │ │    +50 🍊       │                  │
│   │ ✓ Jan 15, 2026  │ │ ✓ Jan 10, 2026  │ │ ✓ Jan 1, 2026   │                  │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘                  │
│                                                                                 │
│   ━━━ IN PROGRESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                 │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                  │
│   │      🎮         │ │      💰         │ │      🌟         │                  │
│   │ ████████░░░░░░  │ │ ██░░░░░░░░░░░░  │ │ ██████████████░ │                  │
│   │   Dedicated     │ │  Big Spender    │ │    Veteran      │                  │
│   │   Play 100      │ │  Spend 25,000   │ │  365 day streak │                  │
│   │    games        │ │    oranges      │ │                 │                  │
│   │    67/100       │ │   5,000/25,000  │ │    320/365      │                  │
│   │   +200 🍊       │ │    +500 🍊      │ │   +1,500 🍊     │                  │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘                  │
│                                                                                 │
│   ━━━ LOCKED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                                                                 │
│   ┌─────────────────┐ ┌─────────────────┐                                      │
│   │      🔒         │ │      🔒         │                                      │
│   │   (dimmed)      │ │   (dimmed)      │                                      │
│   │      ???        │ │      ???        │                                      │
│   │    Locked       │ │    Locked       │                                      │
│   └─────────────────┘ └─────────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## TAB 4: STATS

Detailed statistics:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   📊 STATISTICS                                                                 │
│                                                                                 │
│   ┌─────────────────────────────────────┐  ┌─────────────────────────────────┐ │
│   │  ACCOUNT                            │  │  ECONOMY                        │ │
│   │                                     │  │                                 │ │
│   │  Member Since: Jan 1, 2026          │  │  Total Earned: 125,000 🍊       │ │
│   │  Current Streak: 30 days 🔥         │  │  Total Spent: 62,500 🍊         │ │
│   │  Longest Streak: 45 days            │  │  Current Balance: 12,500 🍊     │ │
│   │  Profile Views: 1,247               │  │  Items Owned: 47                │ │
│   │  Level: 15                          │  │  Gems: 25 💎                    │ │
│   └─────────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                                 │
│   ┌─────────────────────────────────────┐  ┌─────────────────────────────────┐ │
│   │  GAMING                             │  │  SOCIAL                         │ │
│   │                                     │  │                                 │ │
│   │  Games Played: 342                  │  │  Friends: 24                    │ │
│   │  Total Score: 1,245,000             │  │  Guild: Orange Crusaders        │ │
│   │  Best Game: Wojak Wheel             │  │  Gifts Sent: 15                 │ │
│   │  Highest Rank: #3                   │  │  Gifts Received: 8              │ │
│   │  #1 Positions: 2                    │  │  Challenges Won: 12             │ │
│   └─────────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## CUSTOMIZATION OPTIONS (User Controls Everything)

### Profile-Wide Settings

| Setting | Options | Price |
|---------|---------|-------|
| **Page Background** | Solid, gradient, pattern, animated | 500-30,000 🍊 |
| **Page Theme** | Dark, light, orange, midnight | 1,000-5,000 🍊 |
| **Accent Color** | Any color | 500 🍊 |
| **Border Style** | None, subtle, bold, animated | 500-5,000 🍊 |
| **Entrance Animation** | Fade, slide, bounce, dramatic | 500-2,500 🍊 |
| **Background Music** | Various tracks | 5,000-10,000 🍊 |

### Header Customization

| Setting | Options | Price |
|---------|---------|-------|
| **Banner Image** | Solid, gradient, pattern, custom | 1,000-10,000 🍊 |
| **Banner Height** | Compact, normal, tall | 500-1,500 🍊 |
| **Username Font Color** | 15+ colors, gradients | 100-2,500 🍊 |
| **Username Font Style** | Bold, italic, glow, etc. | 250-1,500 🍊 |
| **Username Font Family** | 8 font options | 500-2,000 🍊 |
| **Avatar Glow** | None to rainbow | 500-5,000 🍊 |
| **Avatar Size** | Normal to massive | 1,000-5,000 🍊 |

### Tab Styling

| Setting | Options | Price |
|---------|---------|-------|
| **Tab Style** | Default, pills, underline, chips | 500-1,000 🍊 |
| **Tab Color** | Match accent or custom | 250-500 🍊 |

### Collection Tab Customization

| Setting | Options | Price |
|---------|---------|-------|
| **Layout** | Grid, list, showcase, masonry | 1,000-2,500 🍊 |
| **Card Style** | Default, minimal, neon, glass | 750-2,500 🍊 |
| **Featured Slots** | 3-9 pinned items | 1,500-6,000 🍊 |

### Achievements Tab Customization

| Setting | Options | Price |
|---------|---------|-------|
| **Card Size** | Compact, normal, large | 500-1,500 🍊 |
| **Show Locked** | Yes/No | Free |
| **Progress Style** | Bar, percentage, fraction | 500 🍊 |
| **Completion Effects** | None, glow, sparkle | 1,000-3,000 🍊 |

### Overview Tab Customization

| Setting | Options | Price |
|---------|---------|-------|
| **Featured Section** | 3-6 slots | 1,000-3,000 🍊 |
| **Show Activity Feed** | Yes/No | Free |
| **Show Game Scores** | Yes/No | Free |
| **Stats Card Style** | Default, minimal, fancy | 500-1,500 🍊 |

---

## PROFILE EDITOR UI

Users access via "Edit Profile" button:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ✏️ EDIT YOUR PROFILE                                            [Save] [X]   │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │                    LIVE PREVIEW                                         │   │
│   │            (Shows changes in real-time)                                 │   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   CATEGORY: [Header ▼]                                                          │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                         │   │
│   │   BANNER STYLE                                                          │   │
│   │   ○ Solid Color (1,000🍊)  ● Gradient (2,500🍊)  ○ Animated (7,500🍊)  │   │
│   │                                                                         │   │
│   │   USERNAME COLOR                                                        │   │
│   │   ● Orange (Free) ○ White (100🍊) ○ Gold (500🍊) ○ Rainbow (2,500🍊)   │   │
│   │                                                     [Buy 500🍊]         │   │
│   │                                                                         │   │
│   │   AVATAR GLOW                                                           │   │
│   │   ● None (Free) ○ Soft (500🍊) ○ Pulsing (2,500🍊) ○ Rainbow (5,000🍊)│   │
│   │                                                                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│   Categories: [Header] [Background] [Tabs] [Collection] [Achievements] [Stats]  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## FEATURED ITEMS SYSTEM

Users can pin ANY of these to their Featured section:
- Purchased items (emojis, frames, titles, etc.)
- Completed achievements
- Game high scores
- Badges

```tsx
// User can drag-and-drop items to Featured slots
<FeaturedSection maxSlots={user.featuredSlots}>
  <FeaturedItem type="item" id="aurora_grove_frame" />
  <FeaturedItem type="emoji" id="crown" />
  <FeaturedItem type="achievement" id="grove_king" />
  <FeaturedItem type="score" game="wojak_wheel" />
</FeaturedSection>
```

---

## DATABASE SCHEMA

```sql
-- Unified profile customization
CREATE TABLE IF NOT EXISTS user_profile_customization (
  user_id TEXT PRIMARY KEY,

  -- Page-wide
  page_background TEXT DEFAULT 'default',
  page_theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT 'orange',
  border_style TEXT DEFAULT 'none',
  entrance_animation TEXT DEFAULT 'none',
  background_music TEXT,

  -- Header
  banner_style TEXT DEFAULT 'default',
  banner_value TEXT,
  username_color TEXT DEFAULT 'orange',
  username_style TEXT DEFAULT 'normal',
  username_font TEXT DEFAULT 'default',
  avatar_glow TEXT DEFAULT 'none',
  avatar_size TEXT DEFAULT 'normal',

  -- Tabs
  tab_style TEXT DEFAULT 'default',
  tab_color TEXT DEFAULT 'accent',

  -- Overview
  overview_featured_slots INTEGER DEFAULT 3,
  overview_show_activity BOOLEAN DEFAULT 1,
  overview_show_scores BOOLEAN DEFAULT 1,
  overview_stats_style TEXT DEFAULT 'default',

  -- Collection
  collection_layout TEXT DEFAULT 'grid',
  collection_card_style TEXT DEFAULT 'default',
  collection_featured_slots INTEGER DEFAULT 0,

  -- Achievements
  achievements_card_size TEXT DEFAULT 'normal',
  achievements_show_locked BOOLEAN DEFAULT 1,
  achievements_progress_style TEXT DEFAULT 'bar',
  achievements_completion_effect TEXT DEFAULT 'none',

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Featured items (pinned to profile)
CREATE TABLE IF NOT EXISTS user_featured_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  item_type TEXT NOT NULL,  -- 'shop_item', 'emoji', 'achievement', 'score'
  item_id TEXT NOT NULL,

  UNIQUE(user_id, slot_number)
);
```

---

## API ENDPOINTS

```typescript
// GET /api/profile/:userId
// Returns full profile data including customization

// PUT /api/profile/customization
// Update profile customization

// POST /api/profile/customization/purchase
// Purchase a customization option

// GET /api/profile/:userId/featured
// Get featured items

// PUT /api/profile/featured
// Update featured items (drag-drop reorder)

// POST /api/profile/featured/add
// Add item to featured

// DELETE /api/profile/featured/:slot
// Remove item from featured
```

---

## COMPONENT STRUCTURE

```
/src/pages/
  Profile.tsx              <- Main profile page with tabs

/src/components/Profile/
  ProfileHeader.tsx        <- Banner + avatar + username + bio
  ProfileTabs.tsx          <- Tab navigation
  ProfileEditor.tsx        <- Edit profile modal

  tabs/
    OverviewTab.tsx        <- Stats + featured + activity
    CollectionTab.tsx      <- Achievement drawer content
    AchievementsTab.tsx    <- Earned achievements
    StatsTab.tsx           <- Detailed statistics

  FeaturedSection.tsx      <- Pinnable featured items
  FeaturedItem.tsx         <- Single featured item card

/src/components/Achievements/
  AchievementCard.tsx      <- Individual achievement card
  AchievementGrid.tsx      <- Responsive grid layout
  AchievementProgress.tsx  <- Progress bar component
  RarityBadge.tsx          <- Rarity indicator
```

---

## FILES TO CREATE/MODIFY

**New Files:**
- `/src/pages/Profile.tsx` (major redesign)
- `/src/components/Profile/ProfileHeader.tsx`
- `/src/components/Profile/ProfileTabs.tsx`
- `/src/components/Profile/ProfileEditor.tsx`
- `/src/components/Profile/tabs/OverviewTab.tsx`
- `/src/components/Profile/tabs/CollectionTab.tsx`
- `/src/components/Profile/tabs/AchievementsTab.tsx`
- `/src/components/Profile/tabs/StatsTab.tsx`
- `/src/components/Profile/FeaturedSection.tsx`
- `/src/components/Achievements/AchievementCard.tsx`
- `/src/components/Achievements/AchievementGrid.tsx`
- `/src/styles/profile.css`
- `/src/styles/achievements.css`
- `/functions/api/profile/customization.ts`
- `/functions/api/profile/featured.ts`

**Modify:**
- `/schema.sql` - Add new tables
- `/src/App.tsx` - Update routing

---

## ACCEPTANCE CRITERIA

1. ✅ Unified profile page with 4 tabs (Overview, Collection, Achievements, Stats)
2. ✅ All tabs use full desktop width - no empty space
3. ✅ User can customize every visual element
4. ✅ Profile Editor with live preview
5. ✅ Featured section where user pins best items/achievements
6. ✅ Achievement cards are large, visual, premium-feeling
7. ✅ Clear visual states: Completed, In Progress, Locked
8. ✅ Rarity badges with appropriate styling
9. ✅ Hover effects and micro-interactions
10. ✅ Responsive on all screen sizes
11. ✅ All customization items purchasable
12. ✅ Settings persist in database

---

## PREMIUM FEEL CHECKLIST

- [ ] Gradient backgrounds with subtle glow
- [ ] Cards lift and glow on hover
- [ ] Smooth animations throughout
- [ ] Legendary items have particle effects
- [ ] Progress bars animate with shimmer
- [ ] Entrance animations when page loads
- [ ] Sound effects on interactions (optional)
- [ ] Everything feels polished and intentional

---

**Make users PROUD to share their profile.** 🏆🍊
