# Claude CLI Implementation Prompt: SPEC 12 - Tang Gang Shop & Collectibles System

## Overview

Implement the complete shop and collectibles system for wojak.ink as defined in `/claude-specs/12-SHOP-COLLECTIBLES-SPEC.md` and `/claude-specs/12-CLAUDE-CLI-IMPLEMENTATION.md`. This is a major feature that adds purchasable cosmetics, an emoji ring system around usernames, BigPulp pet customization, and an Achievement Drawer for showcasing collections.

## Prerequisites

Read these files thoroughly before starting:
- `/claude-specs/12-SHOP-COLLECTIBLES-SPEC.md` - Full specification with all items, prices, and features
- `/claude-specs/12-CLAUDE-CLI-IMPLEMENTATION.md` - CSS code, React components, and database seed SQL

## Implementation Phases

### Phase 1: Database Schema

1. Create all new tables in Cloudflare D1:
   - `shop_items` - All purchasable items with prices, categories, CSS classes
   - `user_inventory` - Tracks ALL items a user owns (Achievement Drawer)
   - `user_equipped` - Currently equipped items (one per slot)
   - `user_emoji_ring` - Emoji positions in the 18-slot ring
   - `user_owned_emojis` - All emojis user has purchased
   - `user_bigpulp` - BigPulp customization state
   - `user_achievements` - Earned badges (not purchased)
   - `founder_purchases` - XCH founder pack purchases
   - `purchase_history` - For "Total Spent" tracking

2. Seed `shop_items` with all 100+ items from the implementation guide (full SQL provided in spec)

3. Migrate existing localStorage shop data to database

### Phase 2: API Endpoints

Create these Hono API routes:
- `GET /api/shop/items` - All shop items by category
- `POST /api/shop/purchase` - Buy item, deduct oranges, add to inventory
- `GET /api/drawer/:userId` - Full Achievement Drawer data
- `GET /api/user/:userId/ring` - Emoji ring configuration
- `POST /api/user/ring/arrange` - Save drag-drop emoji positions
- `GET /api/user/:userId/display` - All equipped cosmetics for rendering
- `GET /api/bigpulp/:userId` - BigPulp state
- `POST /api/bigpulp/equip` - Equip hat/mood/accessory
- `POST /api/inventory/equip` - Equip frame/title/name_effect/background/celebration
- `GET /api/bigpulp/comment` - Context-aware BigPulp dialogue

### Phase 3: Emoji Ring System

1. Create `EmojiRing` component with fixed dimensions:
   - 18 slots: 3 left, 3 right, 6 top, 6 bottom
   - Fixed-width name area (200px) regardless of username length
   - Sizes: 'small' (leaderboard), 'normal' (profile), 'large' (drawer)

2. Create `EmojiRingEditor` component:
   - Uses @dnd-kit for drag-and-drop
   - Shows owned emojis, lets user arrange in ring slots
   - Saves positions via API

3. Integrate EmojiRing everywhere usernames appear:
   - Leaderboards
   - Game screens
   - Profile pages
   - Chat/social features

### Phase 4: CSS Implementation

Add all CSS from the implementation guide to `/src/styles/`:
1. Frame effects (Grove → Orchard → Harvest → Legendary tiers)
2. Name effects (Basic → Animated → Legendary)
3. Background styles
4. Emoji ring layout CSS with fixed dimensions
5. BigPulp animations

Key CSS features:
- `@property` for animatable gradients
- `conic-gradient` for rotating borders
- Keyframe animations for fire, electric, glitch effects
- CSS variables for Tang Orange theme consistency

### Phase 5: Shop UI Overhaul

Replace existing `/src/components/Shop/Shop.tsx`:
1. Remove all 19 demo items
2. Load items from database via API
3. Category tabs: Emojis, Frames, Name Effects, Titles, Backgrounds, Celebrations, BigPulp
4. Preview system showing effect before purchase
5. "Owned" indicator for purchased items
6. Equip button for owned items

### Phase 6: Achievement Drawer

Create `/drawer/:userId` page:
1. Header with username, total items, total spent
2. BigPulp mascot with contextual commentary
3. Grid sections for each category showing all owned items
4. Click to equip from drawer
5. Shareable link functionality
6. Achievement badges section (earned, not bought)

### Phase 7: BigPulp Component

Create `BigPulp` component that appears:
1. On profile page with equipped hat/mood/accessory
2. In Achievement Drawer with collection-based commentary
3. During games with reactions
4. On win/loss screens with contextual dialogue

BigPulp dialogue system:
- Context-aware responses (win, loss, drawer visit, game start)
- Collection-size-based commentary
- Personality: witty, tough love, hypes winners, roasts losers (lovingly)

### Phase 8: Integration

1. Apply frames to all avatar displays site-wide
2. Apply name effects to all username displays
3. Show emoji rings on leaderboards with consistent spacing
4. Trigger celebration effects on game wins
5. Apply backgrounds to profile cards

## Key Technical Notes

- React 19 + TypeScript + Vite + Ionic framework
- Cloudflare D1 (SQLite) for database
- Zustand for state management
- Existing currency system uses `user_stats.total_oranges`
- Tang Orange theme: `#F97316` primary

## Files to Create/Modify

### New Files:
- `/src/components/EmojiRing/EmojiRing.tsx`
- `/src/components/EmojiRing/EmojiRingEditor.tsx`
- `/src/components/BigPulp/BigPulp.tsx`
- `/src/components/AchievementDrawer/AchievementDrawer.tsx`
- `/src/pages/DrawerPage.tsx`
- `/src/styles/frames.css`
- `/src/styles/name-effects.css`
- `/src/styles/emoji-ring.css`
- `/src/styles/backgrounds.css`
- `/src/styles/celebrations.css`
- `/functions/api/shop/*.ts` (API routes)

### Modify:
- `/src/components/Shop/Shop.tsx` - Complete overhaul
- `/schema.sql` - Add new tables
- `/src/App.tsx` - Add drawer route
- All components displaying usernames - Add EmojiRing integration

## Acceptance Criteria

1. Users can browse and purchase all 100+ cosmetic items
2. Emoji ring displays correctly with fixed dimensions on leaderboards
3. Users can drag-drop to arrange their emoji ring
4. All frame effects render correctly (static and animated)
5. All name effects animate properly
6. BigPulp appears with correct customizations and contextual dialogue
7. Achievement Drawer shows complete collection with stats
8. Celebration effects trigger on game wins
9. All purchases persist in database
10. Existing orange currency is properly deducted

## Do NOT

- Keep any of the 19 demo items from the existing shop
- Give any free default cosmetics (earn everything)
- Give NFT holders free badges (everyone pays same prices)
- Create evolution stages for BigPulp (adult only)

---

**Winners win, baby!** 🍊
