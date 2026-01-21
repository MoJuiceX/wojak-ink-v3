# SPEC 12: Tang Gang Shop & Collectibles System (v2.0)

> **For Claude CLI**: This specification defines the personalized spend economy for wojak.ink, deeply integrated with Tang Gang lore, BigPulp, and community culture. This version incorporates full integration with existing systems and balanced economics.

---

## Philosophy: The Tang Gang Way

This isn't just a shop—it's an extension of **Tang Gang culture**:
- 🍊 **Orange everything** - We live in the Orange Grove
- 🏆 **Winners win, baby!** - Papa Tang's motto guides us
- 🎭 **Memes are fundamental** - We ARE meme culture
- 👑 **Honor the builders** - Bullish0x, DegenWaffle, OrangeGooey, Tom Bepe, Foods, Papa Tang, TheStakerClass
- 🪪 **Provenance matters** - Not rarity, but story and community significance

---

## Key Decisions Summary

| Decision | Choice |
|----------|--------|
| Character-locked items | No - anyone can buy anything |
| Crypto lore references | No - keep it Tang Gang focused |
| Scarcity model | First-come-first-served waves |
| NFT holder perks | Deferred - decide later |
| Badge system | **Merged** - NFT badges + emoji badges in unified ring |
| Celebration effects | Orange rain / citrus explosion |
| Pets | BigPulp (adult only) with hats, moods, accessories |
| BigPulp role | **Everywhere** - Profile + Games + Drawer with dialogue |
| Titles | All types (grove ranks, catchphrases, achievements) |
| Legacy items | 30-day founder window + $50 XCH premium |
| Shop rotation | No rotation - always available |
| Premium colors | Golden Orange (amber, gold, honey) |
| Item ownership | **Keep all purchased items**, equip one per category |
| Free defaults | **No** - earn everything |
| Existing shop items | **Replace all** with SPEC 12 items |
| Pricing | **50% reduced** from original for better accessibility |

---

## EMOJI RING SYSTEM (New!)

Instead of simple badges next to name, users have an **emoji ring** surrounding their username.

### Ring Layout (Fixed Dimensions)
```
           🍊  🌱  ⭐  🎯  ⚡  🚀        ← TOP ROW (6 slots)

      👑                            🎩
      🪿      [  USERNAME  ]        🏆    ← LEFT (3) + RIGHT (3)
      🐸                            🔥

           🦍  🌟  💎  💰  🤖  👽        ← BOTTOM ROW (6 slots)
```

### Ring Specifications
- **Total Slots:** 18 (3 left + 3 right + 6 top + 6 bottom)
- **Name Area:** Fixed width (assumes max 20 characters) for leaderboard consistency
- **Short names** are centered within the fixed-width area
- **User Arranges:** Drag-and-drop to position emojis in preferred slots
- **Empty slots** are invisible (no placeholder)

### Leaderboard Consistency
All users have the same ring dimensions regardless of name length:
```
Rank |  Player Display
-----|------------------------------------------
  1  |      🍊 🌱 ⭐
     |   👑              🎩
     |   🪿   MoJuice    🏆
     |   🐸              🔥
     |      🦍 🌟 💎
-----|------------------------------------------
  2  |      🍪 🐸
     |   🏆
     |        Bob
     |
     |      🚀
```

### Merged Badge System
Both **purchased emoji badges** AND **NFT trait badges** appear in the same ring:
- NFT badges (hexagonal seedling, etc.) cost oranges like everything else
- Owning the NFT does NOT give free badge access
- All badges compete for the same 18 ring slots

---

## ACHIEVEMENT DRAWER (Collection Showcase)

Every item a user purchases appears in their **Achievement Drawer** - a dedicated profile page for flexing their collection.

### How It Works
- Visual grid/drawer layout with multiple rows organized by category
- Every purchased item displays as an icon/thumbnail
- Users can share their drawer link to show off to the community
- BigPulp lives here and comments on your collection
- Acts as a status flex and collection showcase

### Drawer Structure
```
┌─────────────────────────────────────────────────────────┐
│  🍊 MoJuice's Achievement Drawer                        │
│  Total Items: 47  |  Total Spent: 62,500 🍊             │
│                                                         │
│  [BigPulp with Crown, looking impressed]                │
│  💬 "Now THAT'S a collection! Winners win, baby!"       │
├─────────────────────────────────────────────────────────┤
│  EMOJI RING BADGES                                      │
│  [👑] [🪿] [🔥] [💎] [🍊] [🌱] [🐸] [🎩] [🏆]          │
├─────────────────────────────────────────────────────────┤
│  FRAMES                                                 │
│  [Burning Citrus] [Electric Tang] [Citrus Glow]        │
├─────────────────────────────────────────────────────────┤
│  TITLES                                                 │
│  ["King of the Grove"] ["Winners Win!"] ["Breadsticks"] │
├─────────────────────────────────────────────────────────┤
│  NAME EFFECTS                                           │
│  [Fire Text] [Dripping Gold] [Shimmer]                 │
├─────────────────────────────────────────────────────────┤
│  BIGPULP ITEMS                                         │
│  [Crown Hat] [Viking Hat] [Rekt Mood] [Cigar]          │
├─────────────────────────────────────────────────────────┤
│  BACKGROUNDS                                           │
│  [Matrix Tang] [Starfield]                             │
├─────────────────────────────────────────────────────────┤
│  WIN EFFECTS                                           │
│  [Fireworks] [Citrus Explosion]                        │
└─────────────────────────────────────────────────────────┘
```

### Flex Features
- Total items owned count
- Total oranges spent
- Rarest items highlighted with glow effect
- "Collection Value" calculation
- Shareable link: `wojak.ink/drawer/username`
- Achievement badges for milestones (Pioneer, Collector, Whale)
- BigPulp commentary based on collection size/rarity

---

## Part 1: EMOJI RING BADGES

Users can buy emojis to place in their ring (max 18 displayed).

### General Emojis (50% reduced pricing)
| Emoji | Name | Price |
|-------|------|-------|
| 🍊 | Orange | 250 🍊 |
| 🧡 | Orange Heart | 250 🍊 |
| 🌱 | Seedling | 250 🍊 |
| ⭐ | Star | 375 🍊 |
| 🎯 | Target | 375 🍊 |
| ⚡ | Lightning | 750 🍊 |
| 🚀 | Rocket | 750 🍊 |
| 💀 | Skull | 1,250 🍊 |
| 👽 | Alien | 1,250 🍊 |
| 🤖 | Robot | 1,250 🍊 |
| 🦍 | Ape | 2,000 🍊 |
| 🌟 | Glowing Star | 2,000 🍊 |
| 💎 | Diamond | 2,500 🍊 |
| 💰 | Money Bag | 3,750 🍊 |

### Legend Tribute Emojis (50% reduced pricing)
| Emoji | Represents | Price |
|-------|------------|-------|
| 🔥 | TheStakerClass | 7,500 🍊 |
| 🍪 | OrangeGooey | 7,500 🍊 |
| 🐸 | Tom Bepe | 10,000 🍊 |
| 🪿 | Foods | 10,000 🍊 |
| 🏆 | Papa Tang | 12,500 🍊 |
| 🎩 | DegenWaffle | 12,500 🍊 |
| 👑 | Bullish0x | 20,000 🍊 |

**Note:** The community knows what each emoji represents. No explicit labels needed.

---

## Part 2: FRAMES (Borders Around Avatar)

Users **keep all purchased frames** in their drawer and can equip one at a time.

### Grove Tier - **1,250 🍊** (was 2,500)
| Name | Style |
|------|-------|
| **Seedling** | Simple solid green border |
| **Orange** | Simple solid orange border |

### Orchard Tier (8 Glow Effects) - **3,750 🍊** (was 7,500)
| Name | Glow Color |
|------|------------|
| **Citrus Glow** | Orange |
| **Sunset Grove** | Golden/amber |
| **Honey Drip** | Warm honey yellow |
| **Ocean Mist** | Bluish/teal |
| **Berry Blush** | Pink/magenta |
| **Mint Fresh** | Mint green |
| **Lavender Dream** | Purple/lavender |
| **Arctic Frost** | Ice blue/white |

### Harvest Tier (4 Animated Effects) - **12,500 🍊** (was 25,000)
| Name | Effect Description |
|------|-------------------|
| **Burning Citrus** | Animated flames licking around border, orange/red fire |
| **Electric Tang** | Electric sparks and lightning crackling around edge |
| **Liquid Gold** | Molten gold flowing and dripping, metallic shimmer |
| **Frozen Juice** | Ice crystals forming and breaking, frost particles |

### Legendary Tier - **37,500 🍊** (was 75,000)
| Name | Effect Description |
|------|-------------------|
| **Aurora Grove** | Northern lights effect - shifting colors flowing |
| **Void Citrus** | Black hole effect - dark void with orange energy |
| **Holographic Tang** | Iridescent holographic shimmer, color shifts |
| **Supernova** | Explosive star burst animation |

### Legend Emoji Frames - **37,500 🍊** (was 75,000)
| Frame | Appearance |
|-------|------------|
| 👑👑👑👑 | Crowns forming border |
| 🎩🎩🎩🎩 | Top hats forming border |
| 🍪🍪🍪🍪 | Cookies forming border |
| 🐸🐸🐸🐸 | Frogs forming border |
| 🪿🪿🪿🪿 | Geese forming border |
| 🏆🏆🏆🏆 | Trophies forming border |
| 🔥🔥🔥🔥 | Fires forming border |

---

## Part 3: NAME EFFECTS

Users **keep all purchased name effects** and can switch between them.

### Basic - **1,250 🍊** (was 2,500)
| Name | Effect |
|------|--------|
| **Citrus Text** | Solid orange colored username |
| **Bold Grove** | Bold + orange |
| **Shimmer** | Light sweeps across name |
| **Pulse** | Username gently fades in/out |
| **Gradient Flow** | Orange → gold → honey color shift |

### Animated - **7,500 🍊** (was 15,000)
| Name | Effect |
|------|--------|
| **Rainbow Tang** | Rainbow colors cycle through |
| **Glitch** | Digital glitch/corruption effect |
| **Fire Text** | Flames animate on letters |
| **Neon Sign** | Flickering neon glow |
| **Matrix** | Green code rain effect on letters |

### Legendary - **20,000 🍊** (was 40,000)
| Name | Effect |
|------|--------|
| **Dripping Gold** | Gold liquid drips from letters |
| **Electric Shock** | Lightning sparks around name |
| **Void Whisper** | Dark smoke rising + orange glow |
| **Supernova Text** | Explosive light particles from text |

---

## Part 4: TITLES

Users **keep all purchased titles** and can switch between them.

### Grove Ranks - **1,250 🍊** (was 2,500)
| Title |
|-------|
| "Seedling" |
| "Grove Keeper" |
| "Orchard Master" |
| "Citrus Lord" |
| "Tang Emperor" |

### Mood Titles - **2,500 🍊** (was 5,000)
| Title |
|-------|
| "Vibing" |
| "WAGMI" |
| "NGMI" |
| "Diamond Hands" |
| "Smooth Brain" |
| "Galaxy Brain" |
| "Absolute Unit" |
| "Touch Grass" |

### Legend Catchphrase Titles - **7,500 🍊** (was 15,000)
| Title | Origin |
|-------|--------|
| "King of the Grove" | Bullish0x |
| "Neckbeard" | DegenWaffle |
| "Accept Cookies" | OrangeGooey |
| "Bepe Army" | Tom Bepe |
| "Breadsticks" | Foods |
| "Winners Win!" | Papa Tang |
| "The Beret Stays On" | TheStakerClass |

### Custom Title Slot - **25,000 🍊** (was 50,000)
Write your own title (with moderation)

---

## Part 5: BIGPULP PET SYSTEM

**BigPulp is always an adult orange with glasses.** Users customize with hats, moods, and accessories.

### BigPulp Appears EVERYWHERE

1. **Profile Page** - Sits on your profile with equipped customizations
2. **During Games** - Reacts to gameplay with animations and dialogue
3. **Achievement Drawer** - Lives in your drawer, comments on collection
4. **Win Screens** - Celebrates (or roasts) based on performance

### BigPulp Personality
- Witty commentator with attitude
- Tough love - direct and blunt
- Hypes high performers, roasts low performers (lovingly)
- Like a sergeant in the army
- Always ends positive

### BigPulp Dialogue Examples
**On Win:**
- "WINNERS WIN, BABY! 🍊"
- "That's what I'm talking about!"
- "The Grove is proud of you!"

**On Loss:**
- "Paper hands detected... Try again!"
- "Even legends have bad days. Run it back!"
- "The beret stays on. So do you. Again."

**On Drawer Visit (based on collection):**
- Small collection: "Nice start! Keep grinding, seedling."
- Medium collection: "Now we're talking! The Grove recognizes you."
- Large collection: "ABSOLUTE UNIT. This drawer is STACKED!"
- Full legend set: "You madlad. You actually got them all. 👑"

### Hats (50% reduced)
| Hat | Price |
|-----|-------|
| Party Hat | 1,250 🍊 |
| Cowboy Hat | 2,000 🍊 |
| Chef Hat | 2,000 🍊 |
| Viking Helmet | 3,750 🍊 |
| Pirate Hat | 3,750 🍊 |
| Beret | 3,750 🍊 |
| Top Hat | 5,000 🍊 |
| Wizard Hat | 5,000 🍊 |
| Devil Horns | 6,250 🍊 |
| Crown | 12,500 🍊 |
| Halo | 12,500 🍊 |

### Moods (50% reduced)
| Mood | Expression | Animation | Price |
|------|------------|-----------|-------|
| **Happy** | Big smile, sparkle eyes | Bobbing | 750 🍊 |
| **Chill** | Relaxed, half-closed eyes | Gentle float | 750 🍊 |
| **Sleepy** | Closed eyes, Z's | Slow breathing | 1,250 🍊 |
| **Hype** | Excited, wide eyes | Bouncing | 2,000 🍊 |
| **Grumpy** | Angry eyebrows, frown | Slight shake | 2,000 🍊 |
| **Sergeant** | Stern military face | Standing at attention | 3,750 🍊 |
| **Numb** | Blank stare, no expression | Still | 5,000 🍊 |
| **Rekt** | Bleeding eyes, devastated | Slow drip animation | 7,500 🍊 |

### Accessories (50% reduced)
| Accessory | Price |
|-----------|-------|
| Bowtie | 750 🍊 |
| Bandana | 1,250 🍊 |
| Earring | 1,250 🍊 |
| Headphones | 2,000 🍊 |
| Cigar | 2,500 🍊 |
| Monocle | 3,750 🍊 |
| Scar | 5,000 🍊 |

---

## Part 6: PROFILE BACKGROUNDS

Users **keep all purchased backgrounds** and can switch between them.

### Solid Colors - **1,250 🍊** (was 2,500)
| Name | Color |
|------|-------|
| Midnight | Dark navy blue |
| Sunset | Deep orange |
| Honey | Golden yellow |
| Forest | Dark green |
| Ember | Dark red |

### Gradients - **3,750 🍊** (was 7,500)
| Name | Style |
|------|-------|
| Orange Sunrise | Orange → yellow |
| Twilight Grove | Purple → orange → pink |
| Deep Ocean | Navy → teal |
| Cotton Candy | Pink → orange → yellow |

### Animated - **12,500 🍊** (was 25,000)
| Name | Animation |
|------|-----------|
| Citrus Rain | Orange drops falling |
| Floating Oranges | Oranges drift across |

### Premium Animated - **20,000 🍊** (was 40,000)
| Name | Animation |
|------|-----------|
| Orange Grove | Trees with oranges swaying |
| Starfield | Stars with orange nebula |
| Matrix Tang | Orange code falling |

---

## Part 7: WIN/CELEBRATION EFFECTS

| Name | Effect | Price (50% reduced) |
|------|--------|---------------------|
| Confetti | Orange confetti | 2,500 🍊 |
| Orange Rain | Oranges fall across screen | 5,000 🍊 |
| Citrus Explosion | Oranges burst from center | 7,500 🍊 |
| Fireworks | Orange fireworks | 12,500 🍊 |

---

## Part 8: ACHIEVEMENT BADGES (Earned, Not Bought)

| Name | Icon | How to Earn |
|------|------|-------------|
| **Pioneer** | 🌱 | First 100 users to join |
| **Builder** | 🔨 | Contributed to community growth |
| **Grove Veteran** | ⭐ | 1 year membership |
| **Big Spender** | 💰 | Spent 25,000+ oranges |
| **Collector** | 📦 | Own 20+ cosmetics |
| **Whale** | 🐋 | Spent 125,000+ oranges |

---

## Part 9: FOUNDER'S COLLECTION - **$50 XCH**

30-day availability window. Includes everything:

- **Founder's Grove Frame** - Animated golden-orange premium border
- **"Grove Founder" Title** - Exclusive title forever
- **Founder's Badge** - Animated founder emblem with purchase date (appears in ring)
- **Legendary BigPulp** - All hats unlocked
- **Founder's Name Glow** - Special golden shimmer effect
- **Founder's Background** - Exclusive animated grove scene
- **Future NFT Airdrop** - Founders receive NFT when collection launches

---

## Part 10: Database Schema

```sql
-- Shop items configuration
CREATE TABLE IF NOT EXISTS shop_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- emoji_badge, frame, title, name_effect, background, celebration, bigpulp_hat, bigpulp_mood, bigpulp_accessory
  rarity TEXT NOT NULL,   -- common, uncommon, rare, legendary, founder
  price_oranges INTEGER DEFAULT 0,
  price_xch REAL DEFAULT 0,
  legend_tribute TEXT,    -- Which legend this honors (if any)
  css_class TEXT,
  emoji TEXT,             -- For emoji badges
  is_active BOOLEAN DEFAULT 1
);

-- User inventory (Achievement Drawer) - KEEPS ALL PURCHASED ITEMS
CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
  acquisition_type TEXT NOT NULL, -- purchase, reward, founder

  UNIQUE(user_id, item_id)
);

-- User equipped items (one per slot)
CREATE TABLE IF NOT EXISTS user_equipped (
  user_id TEXT PRIMARY KEY,
  frame_id TEXT,
  title_id TEXT,
  name_effect_id TEXT,
  background_id TEXT,
  celebration_id TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- User emoji ring (max 18 positions)
CREATE TABLE IF NOT EXISTS user_emoji_ring (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  position TEXT NOT NULL, -- 'left_1', 'left_2', 'left_3', 'right_1', 'right_2', 'right_3', 'top_1'...'top_6', 'bottom_1'...'bottom_6'
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, position)
);

-- User owned emojis (separate from ring positions)
CREATE TABLE IF NOT EXISTS user_owned_emojis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, emoji)
);

-- BigPulp pets (always adult, customize with items)
CREATE TABLE IF NOT EXISTS user_bigpulp (
  user_id TEXT PRIMARY KEY,
  current_hat TEXT,
  current_mood TEXT DEFAULT 'happy',
  current_accessory TEXT,
  unlocked_hats TEXT,        -- JSON array
  unlocked_moods TEXT,       -- JSON array
  unlocked_accessories TEXT  -- JSON array
);

-- Achievement badges (earned, not bought)
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, badge_id)
);

-- Founder purchases
CREATE TABLE IF NOT EXISTS founder_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  transaction_hash TEXT NOT NULL,
  amount_xch REAL NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
  nft_airdrop_claimed BOOLEAN DEFAULT 0
);

-- Purchase history for "Total Spent" tracking
CREATE TABLE IF NOT EXISTS purchase_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  price_paid INTEGER NOT NULL,
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## Part 11: API Endpoints

```typescript
// GET /api/shop/items
// Returns all shop items
{
  items: ShopItem[];
  categories: string[];
}

// POST /api/shop/purchase
{
  itemId: string;
}
// Response
{
  success: boolean;
  item: InventoryItem;
  newBalance: number;
}

// GET /api/drawer/:userId
// Returns user's achievement drawer
{
  userId: string;
  username: string;
  totalItems: number;
  totalSpent: number;
  emojiRing: EmojiRingConfig;
  frames: Item[];
  titles: Item[];
  nameEffects: Item[];
  backgrounds: Item[];
  celebrations: Item[];
  bigpulp: BigPulpConfig;
  achievements: Achievement[];
  bigpulpComment: string; // Dynamic based on collection
}

// GET /api/user/:userId/ring
// Returns emoji ring configuration
{
  positions: {
    left_1?: string;
    left_2?: string;
    left_3?: string;
    right_1?: string;
    right_2?: string;
    right_3?: string;
    top_1?: string;
    top_2?: string;
    top_3?: string;
    top_4?: string;
    top_5?: string;
    top_6?: string;
    bottom_1?: string;
    bottom_2?: string;
    bottom_3?: string;
    bottom_4?: string;
    bottom_5?: string;
    bottom_6?: string;
  };
  ownedEmojis: string[];
}

// POST /api/user/ring/arrange
// User arranges emojis in ring via drag-drop
{
  positions: Record<string, string | null>;
}

// GET /api/bigpulp/:userId
{
  hat: string | null;
  mood: string;
  accessory: string | null;
  unlockedHats: string[];
  unlockedMoods: string[];
  unlockedAccessories: string[];
}

// POST /api/bigpulp/equip
{
  slot: 'hat' | 'mood' | 'accessory';
  itemId: string | null; // null to unequip
}

// POST /api/inventory/equip
{
  slot: 'frame' | 'title' | 'name_effect' | 'background' | 'celebration';
  itemId: string | null;
}

// GET /api/user/:userId/display
// Returns all equipped items for display (used everywhere)
{
  emojiRing: EmojiRingConfig;
  frame: string | null;
  title: string | null;
  nameEffect: string | null;
  background: string | null;
  celebration: string | null;
  bigpulp: BigPulpConfig;
}

// GET /api/bigpulp/comment
// Returns contextual BigPulp dialogue
{
  context: 'win' | 'loss' | 'drawer' | 'game_start';
  collectionSize?: number;
  score?: number;
}
// Response
{
  dialogue: string;
  mood: string; // BigPulp's mood for this comment
}
```

---

## Part 12: Complete Price List (50% Reduced)

### Emoji Ring Badges
| Tier | Items | Price |
|------|-------|-------|
| Basic | 🍊🧡🌱 | 250 🍊 |
| Common | ⭐🎯 | 375 🍊 |
| Uncommon | ⚡🚀 | 750 🍊 |
| Rare | 💀👽🤖 | 1,250 🍊 |
| Epic | 🦍🌟 | 2,000 🍊 |
| Premium | 💎 | 2,500 🍊 |
| Elite | 💰 | 3,750 🍊 |
| Legend | 🔥🍪 | 7,500 🍊 |
| Legend+ | 🐸🪿 | 10,000 🍊 |
| Legend++ | 🏆🎩 | 12,500 🍊 |
| Ultimate | 👑 | 20,000 🍊 |

### Frames
| Tier | Price |
|------|-------|
| Grove (Seedling, Orange) | 1,250 🍊 |
| Orchard (8 glow effects) | 3,750 🍊 |
| Harvest (4 animated effects) | 12,500 🍊 |
| Legendary (4 premium effects) | 37,500 🍊 |
| Legend Emoji Frames | 37,500 🍊 |

### Name Effects
| Tier | Price |
|------|-------|
| Basic (5 options) | 1,250 🍊 |
| Animated (5 options) | 7,500 🍊 |
| Legendary (4 options) | 20,000 🍊 |

### Titles
| Tier | Price |
|------|-------|
| Grove Ranks (5 options) | 1,250 🍊 |
| Mood Titles (8 options) | 2,500 🍊 |
| Legend Catchphrases (7 options) | 7,500 🍊 |
| Custom Title Slot | 25,000 🍊 |

### BigPulp
| Category | Price Range |
|----------|-------------|
| Hats | 1,250-12,500 🍊 |
| Moods | 750-7,500 🍊 |
| Accessories | 750-5,000 🍊 |

### Backgrounds
| Tier | Price |
|------|-------|
| Solid Colors (5 options) | 1,250 🍊 |
| Gradients (4 options) | 3,750 🍊 |
| Animated (2 options) | 12,500 🍊 |
| Premium Animated (3 options) | 20,000 🍊 |

### Win Effects
| Effect | Price |
|--------|-------|
| Confetti | 2,500 🍊 |
| Orange Rain | 5,000 🍊 |
| Citrus Explosion | 7,500 🍊 |
| Fireworks | 12,500 🍊 |

### Founder's Collection
| Item | Price |
|------|-------|
| Full Collection | $50 XCH |

---

## Part 13: Economy Balance Check

### Player Earnings (from SPEC 09-10)
- **Daily (active):** ~250-300 🍊
- **Weekly:** ~2,000 🍊
- **Monthly:** ~8,000 🍊

### Time to Earn (with 50% price reduction)
| Item | Price | Days to Earn |
|------|-------|--------------|
| Basic emoji | 250 🍊 | 1 day |
| Basic frame | 1,250 🍊 | 5 days |
| Glow frame | 3,750 🍊 | 2 weeks |
| Legend emoji | 10,000-20,000 🍊 | 1-2.5 months |
| Animated frame | 12,500 🍊 | 1.5 months |
| Legendary frame | 37,500 🍊 | 4.5 months |

**This feels much more achievable** while still making legendary items aspirational.

---

## Part 14: Integration Notes

### Replacing Existing Shop
The existing `/src/components/Shop/Shop.tsx` with 19 demo items should be **completely replaced** with SPEC 12 items. Categories map as:

| Old Category | New Category |
|--------------|--------------|
| avatar_frame | frame |
| avatar_accessory | (removed - use BigPulp accessories instead) |
| game_theme | background |
| celebration_effect | celebration |
| badge | emoji_badge (in ring) |
| title | title |
| consumable | (keep for continues/boosts - not in SPEC 12) |

### Consumables
Consumables (continue tokens, boosts) are NOT part of SPEC 12 cosmetics. They should remain as a separate system.

---

## Implementation Checklist

### Phase 1: Database & Backend
- [ ] Create all new tables (shop_items, user_inventory, user_equipped, user_emoji_ring, etc.)
- [ ] Migrate from localStorage to database
- [ ] Seed shop_items with all SPEC 12 items
- [ ] Implement purchase API with price validation
- [ ] Implement equip/unequip APIs

### Phase 2: Emoji Ring System
- [ ] Create EmojiRing component with fixed dimensions
- [ ] Implement drag-and-drop arrangement UI
- [ ] Display ring on leaderboards, profiles, and game screens
- [ ] Ensure consistent width regardless of name length

### Phase 3: Shop UI Overhaul
- [ ] Replace existing shop items with SPEC 12 catalog
- [ ] Add preview system for frames/effects
- [ ] Show owned items in drawer section
- [ ] Category filtering and sorting

### Phase 4: Achievement Drawer
- [ ] Create `/drawer/:userId` page
- [ ] Grid layout for all owned items
- [ ] Total items/spent statistics
- [ ] BigPulp with contextual commentary
- [ ] Shareable links

### Phase 5: Frames & Name Effects
- [ ] Create all frame CSS classes
- [ ] Create all name effect CSS classes
- [ ] Implement emoji frame rendering (SVG circular text)
- [ ] Apply across all username displays site-wide

### Phase 6: BigPulp Everywhere
- [ ] BigPulp component with all customizations
- [ ] Profile page integration
- [ ] Game companion integration (reactions during play)
- [ ] Achievement drawer mascot
- [ ] Win/loss commentary system
- [ ] Dialogue database with context-aware selection

### Phase 7: Backgrounds & Win Effects
- [ ] Background CSS classes
- [ ] Apply to profile cards
- [ ] Celebration animation system
- [ ] Trigger on game wins

### Phase 8: Founder's Collection
- [ ] XCH payment flow
- [ ] Founder item unlocks
- [ ] 30-day availability window
- [ ] NFT airdrop tracking

---

**Winners win, baby!** 🍊
