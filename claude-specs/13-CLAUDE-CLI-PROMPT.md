# Claude CLI Implementation Prompt: SPEC 13 - Social & Community Features

## Overview

Implement the complete social layer for wojak.ink as defined in `/claude-specs/13-SOCIAL-COMMUNITY-SPEC.md`. This spec adds Activity Feed, Player Gifting, Profile Enhancement, Friend Challenges (wagering), Push Notifications, and Online Presence. These features make SPEC 12 cosmetics valuable and the friend system meaningful.

## Prerequisites

Read this file thoroughly before starting:
- `/claude-specs/13-SOCIAL-COMMUNITY-SPEC.md` - Full specification with all features, database schemas, and API endpoints

Also reference:
- `/claude-specs/12-SHOP-COLLECTIBLES-SPEC.md` - For cosmetic items context
- Existing friend system in `/src/contexts/FriendsContext.tsx`
- Existing guild system in `/src/contexts/GuildContext.tsx`
- Existing notification framework in `/src/contexts/NotificationContext.tsx`

## Implementation Phases

### Phase 1: Activity Feed

**Database Tables:**
- `activity_events` - All activity events with type, user, data
- `activity_likes` - Likes on events
- `activity_comments` - Comments on events
- `user_feed_preferences` - User's hidden types and muted users

**API Endpoints:**
- `GET /api/feed?tab=friends|global|guild` - Paginated feed
- `POST /api/feed/:eventId/like` - Like event
- `POST /api/feed/:eventId/comment` - Comment on event
- `PUT /api/feed/preferences` - Update preferences

**Event Types to Implement (Tier 1 - High Value):**
- Achievement unlocked
- Beat friend's score
- Top 10 / #1 leaderboard
- Guild joined/created
- Legendary item purchased
- Legend emoji purchased
- Login streak milestone (7/30/100 days)
- Challenge sent/result
- Gift sent

**Components:**
- `/src/pages/ActivityFeed.tsx` - Main feed page
- `/src/components/Feed/FeedEvent.tsx` - Individual event card
- `/src/components/Feed/FeedTabs.tsx` - Friends/Global/Guild tabs
- `/src/components/Feed/FeedComments.tsx` - Comments section

**Integration Points:**
- Hook into shop purchases to create events
- Hook into leaderboard submissions to create events
- Hook into achievement system to create events
- Hook into friend actions to create events

### Phase 2: Online Presence

**Database Tables:**
- `user_presence` - Current status, activity, last heartbeat
- `presence_settings` - User privacy settings

**API Endpoints:**
- `POST /api/presence/heartbeat` - Called every 30 seconds
- `GET /api/presence/friends` - Friends' online status
- `PUT /api/presence/settings` - Privacy settings

**Presence States:**
- 🟢 Online (active in last 5 min)
- 🟡 Away (idle 5-30 min)
- 🎮 In Game (currently playing)
- ⚪ Offline (shows "Last seen X ago")

**Components:**
- `/src/components/Presence/OnlineIndicator.tsx` - Status dot
- `/src/components/Presence/ActivityStatus.tsx` - Rich presence display
- `/src/hooks/usePresence.ts` - Heartbeat hook

**Integration Points:**
- Add heartbeat to App.tsx (useEffect with 30s interval)
- Show presence on friend list
- Show presence on profiles
- Show presence in challenge UI

### Phase 3: Push Notification Delivery

**Context:** The notification framework already exists. You need to implement actual delivery.

**Database Tables:**
- `notification_queue` - Pending/sent notifications
- `push_subscriptions` - User push endpoints

**Implementation:**
1. Install `web-push` package
2. Generate VAPID keys
3. Create `/api/notifications/subscribe` endpoint
4. Create notification sending worker
5. Wire up triggers for each notification type

**Notification Types to Implement:**
- Gift received
- Challenge received/result
- Score beaten by friend
- Streak warning (2 hours before break)
- Profile comment received

**Quiet Hours:**
- Store user's quiet hours preference
- Check before sending any notification
- Queue for delivery after quiet hours end

### Phase 4: Player Gifting

**Database Tables:**
- `gifts` - Gift records with status
- `gift_daily_limits` - Track daily limits per user

**API Endpoints:**
- `POST /api/gifts/send` - Send a gift
- `GET /api/gifts/pending` - Unopened gifts
- `POST /api/gifts/:giftId/open` - Open a gift
- `GET /api/gifts/limits` - Check daily limits

**Anti-Fraud Rules:**
- 48-hour minimum friendship duration
- 7-day minimum account age for recipient
- 5,000 🍊 daily send limit
- 5 items daily send limit

**Components:**
- `/src/components/Gifts/GiftModal.tsx` - Send gift UI
- `/src/components/Gifts/GiftNotification.tsx` - Receive gift UI
- `/src/components/Gifts/GiftOpenAnimation.tsx` - Gift unwrap animation
- `/src/pages/Gifts.tsx` - Gift history page

**Flow:**
1. Sender selects friend, type (oranges/item), amount, optional message
2. System validates rules, deducts oranges, creates gift record
3. Recipient gets push notification
4. Recipient opens gift (animation), oranges/item added
5. Activity feed event created

### Phase 5: Profile Enhancement

**Database Tables:**
- `profile_customization` - Bio, links, background, music, layout, showcase config
- `profile_views` - View tracking
- `profile_view_counts` - Aggregated daily counts
- `profile_kudos` - Daily kudos
- `profile_comments` - Comments with replies
- `profile_comment_likes` - Comment likes

**API Endpoints:**
- `GET /api/profile/:userId` - Full profile with customization
- `PUT /api/profile/customization` - Update customization
- `POST /api/profile/:userId/kudos` - Give kudos (1/day)
- `GET /api/profile/:userId/comments` - Get comments
- `POST /api/profile/:userId/comments` - Add comment
- `POST /api/profile/comments/:commentId/reply` - Reply to comment

**Profile Sections:**
1. Header (avatar, frame, name effect, title, emoji ring, BigPulp)
2. Bio (about me, social links, location, member since)
3. Stats (level, oranges earned, streaks, games played, profile views)
4. Showcase (3-6 customizable slots)
5. Game Scores (best scores with "Challenge" button)
6. Collection Preview (link to drawer)
7. Comments Section

**Showcase Types:**
- Achievement Showcase (display 3-6 achievements)
- Game Stats Showcase (best scores)
- Cosmetic Showcase (rarest items)
- Friend Showcase (close friends)
- Guild Showcase (guild info)
- Trophy Case (badges)

**Purchasable Items (add to shop_items):**
- Profile Backgrounds: Gradient Sunset (2,500), The Grove (10,000), Matrix Tang (15,000), Starfield (15,000), Holographic (25,000)
- Profile Music: Chill Beats (5,000), Epic Vibes (5,000), Retro Wave (7,500), Tang Theme (10,000)
- Profile Layouts: Compact (2,500), Showcase (5,000), Flex (10,000)
- Showcase Slots: 4th (5,000), 5th (10,000), 6th (20,000)

**Components:**
- `/src/pages/Profile.tsx` - Enhanced profile page
- `/src/components/Profile/ProfileHeader.tsx` - Header section
- `/src/components/Profile/ProfileBio.tsx` - Bio section
- `/src/components/Profile/ProfileStats.tsx` - Stats section
- `/src/components/Profile/ProfileShowcase.tsx` - Customizable showcase
- `/src/components/Profile/ProfileComments.tsx` - Comments section
- `/src/components/Profile/ProfileCustomizer.tsx` - Edit profile modal
- `/src/components/Profile/ShowcaseEditor.tsx` - Showcase arrangement

### Phase 6: Friend Challenges (Wagering)

**Database Tables:**
- `friend_challenges` - Challenge records
- `challenge_escrow` - Held oranges during challenge
- `challenge_records` - Head-to-head history

**API Endpoints:**
- `POST /api/challenges/create` - Create challenge
- `GET /api/challenges/pending` - Waiting for response
- `GET /api/challenges/active` - Active challenges
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/decline` - Decline challenge
- `POST /api/challenges/:id/submit-score` - Submit game score
- `GET /api/challenges/record/:opponentId` - Head-to-head record

**Challenge Flow:**
1. Challenger creates: select friend, game, wager (100-10,000), time limit (1h/6h/24h/48h)
2. Challenger's oranges go to escrow
3. Friend receives notification, can accept or decline
4. If accepted: friend's oranges go to escrow, timer starts
5. Both players get ONE attempt at the game
6. Scores hidden until both complete (or time expires)
7. Higher score wins pot minus house fee
8. Tie = 50/50 split
9. No-show = forfeit

**House Fees:**
- Casual (100-500 🍊): 0%
- Standard (501-2,500 🍊): 5%
- High Stakes (2,501-10,000 🍊): 10%

**Rules:**
- One attempt per challenge
- Can't see opponent's score until both complete
- Maximum 5 active challenges per player
- Must have wager amount available
- Once accepted, can't cancel

**Components:**
- `/src/components/Challenges/CreateChallengeModal.tsx`
- `/src/components/Challenges/ChallengeNotification.tsx`
- `/src/components/Challenges/ActiveChallengeCard.tsx`
- `/src/components/Challenges/ChallengeResultModal.tsx`
- `/src/pages/Challenges.tsx` - Challenge history/active

**Game Integration:**
- When playing a game during active challenge, score is recorded
- Lock the game to ONE play only for that challenge
- Show challenge indicator during game

### Phase 7: Guild Database Migration

**Context:** Guild system exists in GuildContext.tsx but uses localStorage. Migrate to D1.

**Database Tables:**
- `guilds` - Guild info, banner, level, scores
- `guild_members` - Members with roles, contributions
- `guild_invites` - Pending invites
- `guild_requests` - Join requests
- `guild_activity` - Activity log

**API Endpoints:**
- `GET /api/guilds` - List/search guilds
- `POST /api/guilds` - Create guild
- `GET /api/guilds/:id` - Get guild details
- `PUT /api/guilds/:id` - Update guild (leader/officers only)
- `DELETE /api/guilds/:id` - Disband guild (leader only)
- `POST /api/guilds/:id/join` - Request to join
- `POST /api/guilds/:id/leave` - Leave guild
- `POST /api/guilds/:id/invite` - Invite user
- `POST /api/guilds/:id/kick` - Kick member
- `POST /api/guilds/:id/promote` - Promote member
- `POST /api/guilds/:id/demote` - Demote member
- `POST /api/guilds/:id/transfer` - Transfer leadership
- `GET /api/guilds/:id/invites` - Pending invites (for user)
- `POST /api/guilds/invites/:id/accept` - Accept invite
- `POST /api/guilds/invites/:id/decline` - Decline invite

**Migration:**
1. Create all tables
2. Update GuildContext to use API calls instead of localStorage
3. Create migration utility that reads localStorage and POSTs to API
4. Show migration prompt for users with existing localStorage data

## Files to Create

**New Pages:**
- `/src/pages/ActivityFeed.tsx`
- `/src/pages/Gifts.tsx`
- `/src/pages/Challenges.tsx`

**New Components:**
- `/src/components/Feed/*` - Activity feed components
- `/src/components/Gifts/*` - Gifting components
- `/src/components/Challenges/*` - Challenge components
- `/src/components/Profile/*` - Profile enhancement components
- `/src/components/Presence/*` - Online presence components

**New Hooks:**
- `/src/hooks/usePresence.ts` - Heartbeat and presence
- `/src/hooks/useFeed.ts` - Activity feed queries
- `/src/hooks/useGifts.ts` - Gift operations
- `/src/hooks/useChallenges.ts` - Challenge operations

**API Routes:**
- `/functions/api/feed/*.ts`
- `/functions/api/presence/*.ts`
- `/functions/api/gifts/*.ts`
- `/functions/api/challenges/*.ts`
- `/functions/api/profile/*.ts` (enhance existing)
- `/functions/api/guilds/*.ts`
- `/functions/api/notifications/*.ts` (enhance existing)

**Database:**
- Add all new tables to `/schema.sql`
- Create seed data for profile backgrounds, music, layouts

## Key Technical Notes

- React 19 + TypeScript + Vite + Ionic framework
- Cloudflare D1 (SQLite) for database
- Cloudflare Pages Functions for API
- Web Push API for notifications (need VAPID keys)
- Zustand for state management
- Tang Orange theme: `#F97316` primary

## Acceptance Criteria

1. Activity feed shows friend, global, and guild events
2. Users can like and comment on feed events
3. Online presence shows correctly on friends list and profiles
4. Heartbeat updates every 30 seconds
5. Push notifications deliver to subscribed devices
6. Users can gift oranges and items to friends
7. Anti-fraud rules enforced on gifting
8. Profile pages show all customization options
9. Users can add bio, social links, and configure showcases
10. Profile comments work with replies and likes
11. Friend challenges work end-to-end with escrow
12. House fees deducted correctly from challenge pots
13. Guilds persist in database, not localStorage

## Do NOT

- Remove existing friend system - enhance it
- Remove existing notification types - add to them
- Allow gifting without friendship duration check
- Allow challenges without sufficient balance
- Skip house fee on high-stakes challenges
- Show opponent's challenge score before both complete

---

**Winners win, baby!** 🍊
