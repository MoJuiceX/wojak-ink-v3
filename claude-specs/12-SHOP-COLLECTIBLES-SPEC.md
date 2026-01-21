# SPEC 12: Tang Gang Shop & Collectibles System (FINAL)

> **For Claude CLI**: This specification defines the personalized spend economy for wojak.ink, deeply integrated with Tang Gang lore, BigPulp, and community culture.

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
| Collections | All types (citrus, character, achievement) |
| Celebration effects | Orange rain / citrus explosion |
| Pets | BigPulp (adult only) with hats, moods, accessories |
| Titles | All types (grove ranks, catchphrases, achievements) |
| Legacy items | 30-day founder window + $50 XCH premium |
| Shop rotation | No rotation - always available |
| Premium colors | Golden Orange (amber, gold, honey) |
| Legend items | Emoji badges honoring community builders |

---

## ACHIEVEMENT DRAWER (Collection Showcase)

Every item a user purchases appears in their **Achievement Drawer** - a dedicated profile page for flexing their collection.

### How It Works
- Visual grid/drawer layout with multiple rows organized by category
- Every purchased item displays as an icon/thumbnail
- Users can share their drawer link to show off to the community
- Acts as a status flex and collection showcase

### Drawer Structure
```
┌─────────────────────────────────────────────────────────┐
│  🍊 MoJuice's Achievement Drawer                        │
│  Total Items: 47  |  Total Spent: 125,000 🍊            │
├─────────────────────────────────────────────────────────┤
│  EMOJI BADGES                                           │
│  [👑] [🪿] [🔥] [💎] [🍊] [🌱] [🐸]                     │
├─────────────────────────────────────────────────────────┤
│  FRAMES                                                 │
│  [Burning Citrus] [Electric Tang] [Citrus Glow]        │
├─────────────────────────────────────────────────────────┤
│  TITLES                                                 │
│  ["King of the Grove"] ["Winners Win!"] ["Breadsticks"] │
├─────────────────────────────────────────────────────────┤
│  NAME EFFECTS                                           │
│  [Fire Text] [Dripping Gold]                           │
├─────────────────────────────────────────────────────────┤
│  BIGPULP                                               │
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

---

## Part 1: EMOJI BADGES (Appear Next to Username)

Users can buy multiple emojis that stack next to their username.

**Display Example:** `👑🪿🔥 MoJuice` or `🐸🎩💎 OtherUser`

### General Emojis
| Emoji | Name | Price |
|-------|------|-------|
| 🍊 | Orange | 500 🍊 |
| 🧡 | Orange Heart | 500 🍊 |
| 🌱 | Seedling | 500 🍊 |
| ⭐ | Star | 750 🍊 |
| 🎯 | Target | 750 🍊 |
| ⚡ | Lightning | 1,500 🍊 |
| 🚀 | Rocket | 1,500 🍊 |
| 💀 | Skull | 2,500 🍊 |
| 👽 | Alien | 2,500 🍊 |
| 🤖 | Robot | 2,500 🍊 |
| 🦍 | Ape | 4,000 🍊 |
| 🌟 | Glowing Star | 4,000 🍊 |
| 💎 | Diamond | 5,000 🍊 |
| 💰 | Money Bag | 7,500 🍊 |

### Legend Tribute Emojis (Premium Status Symbols)
| Emoji | Represents | Title Unlocked | Price |
|-------|------------|----------------|-------|
| 🔥 | TheStakerClass | "The Beret Stays On" | 15,000 🍊 |
| 🍪 | OrangeGooey | "Accept Cookies" | 15,000 🍊 |
| 🐸 | Tom Bepe | "Bepe Army" | 20,000 🍊 |
| 🪿 | Foods | "Breadsticks" | 20,000 🍊 |
| 🏆 | Papa Tang | "Winners Win!" | 25,000 🍊 |
| 🎩 | DegenWaffle | "Neckbeard" | 25,000 🍊 |
| 👑 | Bullish0x | "King of the Grove" | 40,000 🍊 |

**Note:** The community knows what each emoji represents. No explicit labels needed.

---

## Part 2: FRAMES (Borders Around Avatar)

### Grove Tier - **2,500 🍊**
| Name | Style |
|------|-------|
| **Seedling** | Simple solid green border |
| **Orange** | Simple solid orange border |

### Orchard Tier (8 Glow Effects) - **7,500 🍊**
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

### Harvest Tier (4 Animated Effects) - **25,000 🍊**
| Name | Effect Description |
|------|-------------------|
| **Burning Citrus** | Animated flames licking around border, orange/red fire |
| **Electric Tang** | Electric sparks and lightning crackling around edge |
| **Liquid Gold** | Molten gold flowing and dripping, metallic shimmer |
| **Frozen Juice** | Ice crystals forming and breaking, frost particles |

### Legendary Tier - **75,000 🍊**
| Name | Effect Description |
|------|-------------------|
| **Aurora Grove** | Northern lights effect - shifting colors flowing |
| **Void Citrus** | Black hole effect - dark void with orange energy |
| **Holographic Tang** | Iridescent holographic shimmer, color shifts |
| **Supernova** | Explosive star burst animation |

### Legend Emoji Frames (Emoji repeats around border) - **75,000 🍊**
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

Buying a new name effect **overrides** the old one (old one is lost).

### Basic - **2,500 🍊**
| Name | Effect |
|------|--------|
| **Citrus Text** | Solid orange colored username |
| **Bold Grove** | Bold + orange |
| **Shimmer** | Light sweeps across name |
| **Pulse** | Username gently fades in/out |
| **Gradient Flow** | Orange → gold → honey color shift |

### Animated - **15,000 🍊**
| Name | Effect |
|------|--------|
| **Rainbow Tang** | Rainbow colors cycle through |
| **Glitch** | Digital glitch/corruption effect |
| **Fire Text** | Flames animate on letters |
| **Neon Sign** | Flickering neon glow |
| **Matrix** | Green code rain effect on letters |

### Legendary - **40,000 🍊**
| Name | Effect |
|------|--------|
| **Dripping Gold** | Gold liquid drips from letters |
| **Electric Shock** | Lightning sparks around name |
| **Void Whisper** | Dark smoke rising + orange glow |
| **Supernova Text** | Explosive light particles from text |

---

## Part 4: TITLES

### Grove Ranks - **2,500 🍊**
| Title |
|-------|
| "Seedling" |
| "Grove Keeper" |
| "Orchard Master" |
| "Citrus Lord" |
| "Tang Emperor" |

### Mood Titles - **5,000 🍊**
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

### Legend Catchphrase Titles - **15,000 🍊**
| Title | Origin |
|-------|--------|
| "King of the Grove" | Bullish0x |
| "Neckbeard" | DegenWaffle |
| "Accept Cookies" | OrangeGooey |
| "Bepe Army" | Tom Bepe |
| "Breadsticks" | Foods |
| "Winners Win!" | Papa Tang |
| "The Beret Stays On" | TheStakerClass |

### Custom Title Slot - **50,000 🍊**
Write your own title (with moderation)

---

## Part 5: BIGPULP PET SYSTEM

**BigPulp is always an adult orange with glasses.** Users customize with hats, moods, and accessories.

### BigPulp Personality
- Witty commentator with attitude
- Tough love - direct and blunt
- Hypes high performers, roasts low performers (lovingly)
- Like a sergeant in the army
- Always ends positive

### Hats
| Hat | Price |
|-----|-------|
| Party Hat | 2,500 🍊 |
| Cowboy Hat | 4,000 🍊 |
| Chef Hat | 4,000 🍊 |
| Viking Helmet | 7,500 🍊 |
| Pirate Hat | 7,500 🍊 |
| Beret | 7,500 🍊 |
| Top Hat | 10,000 🍊 |
| Wizard Hat | 10,000 🍊 |
| Devil Horns | 12,500 🍊 |
| Crown | 25,000 🍊 |
| Halo | 25,000 🍊 |

### Moods
| Mood | Expression | Animation | Price |
|------|------------|-----------|-------|
| **Happy** | Big smile, sparkle eyes | Bobbing | 1,500 🍊 |
| **Chill** | Relaxed, half-closed eyes | Gentle float | 1,500 🍊 |
| **Sleepy** | Closed eyes, Z's | Slow breathing | 2,500 🍊 |
| **Hype** | Excited, wide eyes | Bouncing | 4,000 🍊 |
| **Grumpy** | Angry eyebrows, frown | Slight shake | 4,000 🍊 |
| **Sergeant** | Stern military face | Standing at attention | 7,500 🍊 |
| **Numb** | Blank stare, no expression | Still | 10,000 🍊 |
| **Rekt** | Bleeding eyes, devastated | Slow drip animation | 15,000 🍊 |

### Accessories
| Accessory | Price |
|-----------|-------|
| Bowtie | 1,500 🍊 |
| Bandana | 2,500 🍊 |
| Earring | 2,500 🍊 |
| Headphones | 4,000 🍊 |
| Cigar | 5,000 🍊 |
| Monocle | 7,500 🍊 |
| Scar | 10,000 🍊 |

---

## Part 6: PROFILE BACKGROUNDS

### Solid Colors - **2,500 🍊**
| Name | Color |
|------|-------|
| Midnight | Dark navy blue |
| Sunset | Deep orange |
| Honey | Golden yellow |
| Forest | Dark green |
| Ember | Dark red |

### Gradients - **7,500 🍊**
| Name | Style |
|------|-------|
| Orange Sunrise | Orange → yellow |
| Twilight Grove | Purple → orange → pink |
| Deep Ocean | Navy → teal |
| Cotton Candy | Pink → orange → yellow |

### Animated - **25,000 🍊**
| Name | Animation |
|------|-----------|
| Citrus Rain | Orange drops falling |
| Floating Oranges | Oranges drift across |

### Premium Animated - **40,000 🍊**
| Name | Animation |
|------|-----------|
| Orange Grove | Trees with oranges swaying |
| Starfield | Stars with orange nebula |
| Matrix Tang | Orange code falling |

---

## Part 7: WIN/CELEBRATION EFFECTS

| Name | Effect | Price |
|------|--------|-------|
| Confetti | Orange confetti | 5,000 🍊 |
| Orange Rain | Oranges fall across screen | 10,000 🍊 |
| Citrus Explosion | Oranges burst from center | 15,000 🍊 |
| Fireworks | Orange fireworks | 25,000 🍊 |

---

## Part 8: ACHIEVEMENT BADGES (Earned, Not Bought)

| Name | Icon | How to Earn |
|------|------|-------------|
| **Pioneer** | 🌱 | First 100 users to join |
| **Builder** | 🔨 | Contributed to community growth |
| **Grove Veteran** | ⭐ | 1 year membership |
| **Big Spender** | 💰 | Spent 50,000+ oranges |
| **Collector** | 📦 | Own 20+ cosmetics |
| **Whale** | 🐋 | Spent 250,000+ oranges |

---

## Part 9: FOUNDER'S COLLECTION - **$50 XCH**

30-day availability window. Includes everything:

- **Founder's Grove Frame** - Animated golden-orange premium border
- **"Grove Founder" Title** - Exclusive title forever
- **Founder's Badge** - Animated founder emblem with purchase date
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

-- User inventory (Achievement Drawer)
CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
  acquisition_type TEXT NOT NULL, -- purchase, reward, founder
  equipped BOOLEAN DEFAULT 0,
  equipped_slot TEXT, -- frame, title, name_effect, background, celebration

  UNIQUE(user_id, item_id)
);

-- User emoji badges (can have multiple)
CREATE TABLE IF NOT EXISTS user_emoji_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  acquired_at TEXT DEFAULT CURRENT_TIMESTAMP
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
```

---

## Part 11: API Endpoints

```typescript
// GET /api/shop/items
// Returns all shop items with user context
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
  newBalance: number; // oranges
}

// GET /api/drawer/:userId
// Returns user's achievement drawer
{
  userId: string;
  username: string;
  totalItems: number;
  totalSpent: number;
  emojiBadges: string[];
  frames: Item[];
  titles: Item[];
  nameEffects: Item[];
  backgrounds: Item[];
  celebrations: Item[];
  bigpulp: BigPulpConfig;
  achievements: Achievement[];
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
// Returns equipped items for display
{
  emojiBadges: string[];        // Array of emojis: ["👑", "🪿", "🔥"]
  frame: string | null;         // CSS class
  title: string | null;         // Title text
  nameEffect: string | null;    // CSS class
  background: string | null;    // CSS class
  celebration: string | null;   // CSS class
}
```

---

## Part 12: Complete Price List

### Emoji Badges
| Item | Price |
|------|-------|
| General emojis (🍊🧡🌱⭐🎯) | 500-750 🍊 |
| Medium emojis (⚡🚀💀👽🤖) | 1,500-2,500 🍊 |
| Premium emojis (🦍🌟💎💰) | 4,000-7,500 🍊 |
| Legend tributes (🔥🍪🐸🪿🏆🎩👑) | 15,000-40,000 🍊 |

### Frames
| Tier | Price |
|------|-------|
| Grove (Seedling, Orange) | 2,500 🍊 |
| Orchard (8 glow effects) | 7,500 🍊 |
| Harvest (4 animated effects) | 25,000 🍊 |
| Legendary (4 premium effects) | 75,000 🍊 |
| Legend Emoji Frames | 75,000 🍊 |

### Name Effects
| Tier | Price |
|------|-------|
| Basic (5 options) | 2,500 🍊 |
| Animated (5 options) | 15,000 🍊 |
| Legendary (4 options) | 40,000 🍊 |

### Titles
| Tier | Price |
|------|-------|
| Grove Ranks | 2,500 🍊 |
| Mood Titles | 5,000 🍊 |
| Legend Catchphrases | 15,000 🍊 |
| Custom Title Slot | 50,000 🍊 |

### BigPulp
| Category | Price Range |
|----------|-------------|
| Hats | 2,500-25,000 🍊 |
| Moods | 1,500-15,000 🍊 |
| Accessories | 1,500-10,000 🍊 |

### Backgrounds
| Tier | Price |
|------|-------|
| Solid Colors | 2,500 🍊 |
| Gradients | 7,500 🍊 |
| Animated | 25,000 🍊 |
| Premium Animated | 40,000 🍊 |

### Win Effects
| Tier | Price |
|------|-------|
| Confetti | 5,000 🍊 |
| Orange Rain | 10,000 🍊 |
| Citrus Explosion | 15,000 🍊 |
| Fireworks | 25,000 🍊 |

### Founder's Collection
| Item | Price |
|------|-------|
| Full Collection | $50 XCH |

---

## Implementation Checklist

### Phase 1: Core Shop & Drawer
- [ ] Create shop_items table with all items
- [ ] Implement purchase API
- [ ] Build Achievement Drawer page
- [ ] Create shareable drawer links
- [ ] Build shop UI with categories

### Phase 2: Emoji Badges
- [ ] Implement emoji badge purchase
- [ ] Display stacked emojis next to username
- [ ] Create emoji badge management UI

### Phase 3: Frames
- [ ] Create all frame CSS classes
- [ ] Implement emoji frame rendering (repeat emojis around border)
- [ ] Add frame preview in shop
- [ ] Apply frames to avatars across site

### Phase 4: Name Effects
- [ ] Create all name effect CSS classes
- [ ] Implement name effect equip/override system
- [ ] Apply name effects to usernames across site

### Phase 5: BigPulp
- [ ] Create BigPulp component (adult only)
- [ ] Implement hat/mood/accessory equip
- [ ] Build BigPulp customization UI
- [ ] Display BigPulp on profile

### Phase 6: Titles & Backgrounds
- [ ] Implement title equip system
- [ ] Create background CSS classes
- [ ] Apply backgrounds to profile cards

### Phase 7: Win Effects
- [ ] Create celebration animation system
- [ ] Trigger effects on game wins
- [ ] Allow effect preview in shop

### Phase 8: Founder's Collection
- [ ] Set up XCH payment flow
- [ ] Create founder item unlocks
- [ ] Track for future NFT airdrop

---

**Winners win, baby!** 🍊
