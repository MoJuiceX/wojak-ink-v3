# SPEC 12B: Achievement Drawer & Profile Customization

> **For Claude CLI**: This specification extends SPEC 12 with granular profile/drawer customization options. Every visual element becomes purchasable, allowing users to create unique, personalized flex spaces.

---

## Philosophy: Your Drawer, Your Identity

The Achievement Drawer isn't just a collection - it's a **personal billboard**. Every element should be customizable so users can express their unique style. Make basic customizations CHEAP (100-500 🍊) so everyone can personalize, while premium options create aspirational goals.

---

## Achievement Drawer Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [← Back]        Achievement Drawer                    [Share 🔗]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ╔═══════════════════╗                        │
│    ┌─────────┐     ║                   ║                        │
│    │         │     ║  PAGE BACKGROUND  ║    ┌─────────────┐     │
│    │ BIGPULP │     ║    (customizable) ║    │   STATS     │     │
│    │         │     ║                   ║    │   PANEL     │     │
│    └─────────┘     ╚═══════════════════╝    └─────────────┘     │
│         ↑                   ↑                      ↑            │
│    Position &          Backgrounds            Style & Colors    │
│    Dialogue Style      & Patterns                               │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │      ✨ USERNAME ✨          │                    │
│              │   Font Color / Style / Effect│                    │
│              │      "Title Goes Here"       │                    │
│              └─────────────────────────────┘                    │
│                                                                 │
│    ┌───────────────────────────────────────────────────────┐   │
│    │                  COLLECTION DISPLAY                    │   │
│    │  Layout: Grid / List / Showcase / Carousel            │   │
│    │  Card Style: Default / Minimal / Fancy / Neon         │   │
│    │  Featured Items: Pin your best items at top           │   │
│    └───────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 1: USERNAME CUSTOMIZATION

### Font Colors (CHEAP - Entry Level)

Everyone should be able to change their name color for very little cost.

| Color | Name | Price |
|-------|------|-------|
| 🟠 | Tang Orange (default) | Free |
| ⚪ | White | 100 🍊 |
| 🔴 | Red | 100 🍊 |
| 🟡 | Yellow | 100 🍊 |
| 🟢 | Green | 100 🍊 |
| 🔵 | Blue | 100 🍊 |
| 🟣 | Purple | 100 🍊 |
| 🩷 | Pink | 100 🍊 |
| 🩵 | Cyan | 100 🍊 |
| ⬛ | Black | 250 🍊 |
| 🥇 | Gold | 500 🍊 |
| 🥈 | Silver | 500 🍊 |
| 🥉 | Bronze | 500 🍊 |

### Gradient Colors (Medium Tier)

| Gradient | Colors | Price |
|----------|--------|-------|
| Sunset | Orange → Pink | 750 🍊 |
| Ocean | Blue → Cyan | 750 🍊 |
| Forest | Green → Yellow | 750 🍊 |
| Fire | Red → Orange → Yellow | 1,000 🍊 |
| Ice | White → Cyan → Blue | 1,000 🍊 |
| Royal | Purple → Gold | 1,500 🍊 |
| Rainbow | Full spectrum | 2,500 🍊 |
| Tang Gradient | Orange → Gold → Honey | 1,000 🍊 |

### Font Styles

| Style | Description | Price |
|-------|-------------|-------|
| Normal | Default weight | Free |
| Bold | Heavier weight | 250 🍊 |
| Italic | Slanted text | 250 🍊 |
| Bold Italic | Both combined | 500 🍊 |
| Outline | Outlined letters | 750 🍊 |
| Shadow | Drop shadow effect | 750 🍊 |
| Glow | Soft glow around text | 1,000 🍊 |
| 3D | Raised 3D effect | 1,500 🍊 |

### Font Families

| Font | Style | Price |
|------|-------|-------|
| Default | Clean sans-serif | Free |
| Retro | Pixel/8-bit style | 1,000 🍊 |
| Elegant | Serif/fancy | 1,000 🍊 |
| Handwritten | Script style | 1,000 🍊 |
| Monospace | Code/terminal | 750 🍊 |
| Rounded | Soft rounded | 750 🍊 |
| Impact | Bold impact | 500 🍊 |
| Graffiti | Street art style | 2,000 🍊 |

### Name Effects (Already in SPEC 12 - Reference)
Basic: 1,250 🍊 | Animated: 7,500 🍊 | Legendary: 20,000 🍊

---

## Part 2: PAGE BACKGROUNDS

### Solid Colors

| Color | Price |
|-------|-------|
| Midnight Black (default) | Free |
| Deep Navy | 500 🍊 |
| Forest Green | 500 🍊 |
| Wine Red | 500 🍊 |
| Royal Purple | 500 🍊 |
| Charcoal | 500 🍊 |

### Gradients

| Name | Style | Price |
|------|-------|-------|
| Sunset Fade | Orange → Purple → Navy | 1,500 🍊 |
| Ocean Depths | Navy → Teal → Dark | 1,500 🍊 |
| Northern Lights | Purple → Green → Blue | 2,500 🍊 |
| Ember Glow | Black → Red → Orange edge | 2,500 🍊 |
| Golden Hour | Black → Gold → Orange | 2,500 🍊 |

### Patterns

| Name | Pattern | Price |
|------|---------|-------|
| Grid | Subtle grid lines | 1,000 🍊 |
| Dots | Polka dot pattern | 1,000 🍊 |
| Diagonal | Diagonal stripes | 1,000 🍊 |
| Hexagons | Honeycomb pattern | 1,500 🍊 |
| Circuit | Tech circuit pattern | 2,000 🍊 |
| Stars | Starfield pattern | 2,000 🍊 |

### Animated Backgrounds

| Name | Animation | Price |
|------|-----------|-------|
| Floating Oranges | Oranges drift slowly | 5,000 🍊 |
| Particle Field | Glowing particles | 5,000 🍊 |
| Matrix Rain | Orange code falling | 7,500 🍊 |
| Starfield | Moving stars | 7,500 🍊 |
| Aurora | Northern lights wave | 10,000 🍊 |
| The Grove | Animated orange trees | 15,000 🍊 |

### Legendary Backgrounds

| Name | Effect | Price |
|------|--------|-------|
| Void Portal | Black hole with orange energy | 25,000 🍊 |
| Supernova | Explosive cosmic scene | 25,000 🍊 |
| Holographic | Iridescent shifting colors | 30,000 🍊 |

---

## Part 3: AVATAR ENHANCEMENTS

### Avatar Glow

| Glow | Effect | Price |
|------|--------|-------|
| None | Default, no glow | Free |
| Soft | Subtle ambient glow | 500 🍊 |
| Medium | Noticeable glow | 1,000 🍊 |
| Strong | Bright prominent glow | 1,500 🍊 |
| Pulsing | Animated pulse | 2,500 🍊 |
| Rainbow | Color-shifting glow | 5,000 🍊 |

### Avatar Size

| Size | Scale | Price |
|------|-------|-------|
| Normal | 100% (default) | Free |
| Large | 125% | 1,000 🍊 |
| Extra Large | 150% | 2,500 🍊 |
| Massive | 175% | 5,000 🍊 |

---

## Part 4: BIGPULP CUSTOMIZATION

### Position

| Position | Description | Price |
|----------|-------------|-------|
| Right (default) | Standard right side | Free |
| Left | Mirror to left side | 500 🍊 |
| Center | Centered below avatar | 750 🍊 |
| Hidden | No BigPulp shown | Free |

### Dialogue Bubble Style

| Style | Look | Price |
|-------|------|-------|
| Default | Standard rounded bubble | Free |
| Pixel | 8-bit pixel art style | 1,000 🍊 |
| Elegant | Fancy ornate border | 1,500 🍊 |
| Comic | Comic book style | 1,000 🍊 |
| Minimal | Simple line border | 500 🍊 |
| None | No bubble, text only | Free |

### Dialogue Bubble Color

| Color | Price |
|-------|-------|
| Dark (default) | Free |
| Orange Tint | 250 🍊 |
| Blue Tint | 250 🍊 |
| Purple Tint | 250 🍊 |
| Green Tint | 250 🍊 |
| Gold Tint | 500 🍊 |
| Custom (color picker) | 1,000 🍊 |

---

## Part 5: STATS PANEL

### Stats Style

| Style | Description | Price |
|-------|-------------|-------|
| Default | Cards with icons | Free |
| Minimal | Just numbers | 500 🍊 |
| Detailed | Extra stats shown | 1,000 🍊 |
| Fancy | Decorated borders | 1,500 🍊 |
| Hidden | No stats shown | Free |

### Stats to Display (Toggleable)

| Stat | Default |
|------|---------|
| Total Items | ✓ On |
| Total Emojis | ✓ On |
| Oranges Spent | ✓ On |
| Member Since | Off |
| Login Streak | Off |
| Games Played | Off |
| Total Oranges Earned | Off |
| Profile Views | Off |

**Unlock additional stats:** 500 🍊 each

### Stats Accent Color

| Color | Price |
|-------|-------|
| Orange (default) | Free |
| Match Font Color | 250 🍊 |
| Custom Color | 500 🍊 |

---

## Part 6: COLLECTION DISPLAY

### Layout Options

| Layout | Description | Price |
|--------|-------------|-------|
| Grid (default) | Standard grid of items | Free |
| List | Vertical list with details | 1,000 🍊 |
| Showcase | Large featured + small grid | 2,000 🍊 |
| Carousel | Swipeable carousel | 2,500 🍊 |
| Masonry | Pinterest-style layout | 2,000 🍊 |

### Card Style

| Style | Description | Price |
|-------|-------------|-------|
| Default | Standard dark cards | Free |
| Minimal | Borderless, clean | 750 🍊 |
| Fancy | Ornate borders | 1,500 🍊 |
| Neon | Glowing neon borders | 2,500 🍊 |
| Glass | Glassmorphism effect | 2,000 🍊 |
| Pixel | 8-bit retro style | 1,500 🍊 |

### Featured Items Slots

Pin your best items at the top of your collection.

| Slots | Price |
|-------|-------|
| 0 (default) | Free |
| 3 slots | 1,500 🍊 |
| 6 slots | 3,500 🍊 |
| 9 slots | 6,000 🍊 |

### Category Tabs Style

| Style | Description | Price |
|-------|-------------|-------|
| Default | Standard tabs | Free |
| Pills | Rounded pill buttons | 500 🍊 |
| Underline | Minimalist underline | 500 🍊 |
| Chips | Chip/tag style | 750 🍊 |
| Hidden | Show all, no tabs | Free |

---

## Part 7: PAGE-WIDE OPTIONS

### Page Theme

| Theme | Description | Price |
|-------|-------------|-------|
| Dark (default) | Dark background | Free |
| Light | Light background | 1,000 🍊 |
| Tang | Orange-tinted dark | 1,500 🍊 |
| Midnight | Deep blue-black | 1,500 🍊 |
| Forest | Green-tinted dark | 1,500 🍊 |

### Border Style

| Style | Description | Price |
|-------|-------------|-------|
| None (default) | No page border | Free |
| Subtle | Thin border | 500 🍊 |
| Bold | Thick border | 1,000 🍊 |
| Double | Double line border | 1,500 🍊 |
| Animated | Moving/glowing border | 5,000 🍊 |
| Emoji | Emoji border (like frames) | 7,500 🍊 |

### Page Entrance Animation

When someone visits your drawer:

| Animation | Description | Price |
|-----------|-------------|-------|
| None (default) | Instant load | Free |
| Fade In | Smooth fade | 500 🍊 |
| Slide Up | Slides from bottom | 750 🍊 |
| Zoom In | Zooms into view | 750 🍊 |
| Bounce | Bouncy entrance | 1,000 🍊 |
| Dramatic | Slow reveal with glow | 2,500 🍊 |
| Glitch | Glitchy reveal | 2,500 🍊 |

### Background Music

Auto-plays when someone visits (with mute option):

| Track | Style | Price |
|-------|-------|-------|
| None (default) | Silent | Free |
| Lo-Fi Chill | Relaxing beats | 5,000 🍊 |
| Epic Vibes | Cinematic ambient | 5,000 🍊 |
| Retro Wave | Synthwave | 7,500 🍊 |
| 8-Bit | Chiptune | 5,000 🍊 |
| Tang Theme | Official theme | 10,000 🍊 |

### Visitor Counter

| Style | Description | Price |
|-------|-------------|-------|
| Hidden (default) | No counter | Free |
| Simple | Just the number | 500 🍊 |
| Styled | Decorated counter | 1,000 🍊 |
| Animated | Counting animation | 2,000 🍊 |

---

## Part 8: PROFILE PAGE CUSTOMIZATION

The main Profile Page (not drawer) can also be customized:

### Profile Header Style

| Style | Description | Price |
|-------|-------------|-------|
| Default | Standard layout | Free |
| Centered | Everything centered | 750 🍊 |
| Left Aligned | Avatar and info left | 750 🍊 |
| Banner | Large banner image area | 2,500 🍊 |

### Profile Banner (if Banner style selected)

| Banner | Price |
|--------|-------|
| Solid Color | 500 🍊 |
| Gradient | 1,500 🍊 |
| Pattern | 2,000 🍊 |
| Animated | 5,000 🍊 |
| Custom Upload | 10,000 🍊 |

### Bio Section

| Feature | Price |
|---------|-------|
| Enable Bio (280 chars) | Free |
| Extended Bio (500 chars) | 2,500 🍊 |
| Bio Background Color | 500 🍊 |
| Bio Border Style | 750 🍊 |

---

## Part 9: PRICING SUMMARY

### Budget Tier (100-500 🍊) - "Everyone Can Customize"
- Font colors (basic)
- Font styles (bold, italic)
- Solid backgrounds
- Avatar glow (soft)
- BigPulp position
- Dialogue bubble color
- Stats accent color

### Standard Tier (500-2,500 🍊) - "Express Yourself"
- Gradient font colors
- Font families
- Gradient backgrounds
- Pattern backgrounds
- Card styles
- Layout options
- Page entrance animations

### Premium Tier (2,500-10,000 🍊) - "Stand Out"
- Rainbow/animated effects
- Animated backgrounds
- Featured item slots
- Background music
- Page border animations

### Legendary Tier (10,000-30,000 🍊) - "Ultimate Flex"
- Legendary backgrounds (Void, Supernova, Holographic)
- Premium music tracks
- Full animation packages

---

## Part 10: CUSTOMIZATION UI

### Drawer Editor

```
┌─────────────────────────────────────────────────────────────────┐
│  ✏️ CUSTOMIZE YOUR DRAWER                              [Save]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Preview Window - Live Preview of Changes]                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Category: [Username ▼]                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FONT COLOR                                               │   │
│  │ ○ Orange (Free) ● White (100🍊) ○ Red (100🍊)           │   │
│  │ ○ Gold (500🍊) ○ Rainbow (2,500🍊)                       │   │
│  │                                              [Buy 100🍊] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FONT STYLE                                               │   │
│  │ ● Normal (Free) ○ Bold (250🍊) ○ Glow (1,000🍊)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FONT FAMILY                                              │   │
│  │ ● Default ○ Retro (1,000🍊) ○ Elegant (1,000🍊)         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Categories: [Username] [Background] [BigPulp] [Stats]          │
│              [Collection] [Page Options]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Buy Flow

1. User opens Drawer Editor
2. Selects category (Username, Background, etc.)
3. Sees all options with prices
4. Owned items show checkmark ✓
5. Unowned items show price and [Buy] button
6. Click [Buy] → Confirm purchase → Item unlocked
7. Select item to apply
8. Live preview updates instantly
9. Click [Save] to keep changes

---

## Part 11: DATABASE SCHEMA

```sql
-- Drawer customization settings
CREATE TABLE IF NOT EXISTS drawer_customization (
  user_id TEXT PRIMARY KEY,

  -- Username
  font_color TEXT DEFAULT 'orange',
  font_style TEXT DEFAULT 'normal',
  font_family TEXT DEFAULT 'default',

  -- Background
  page_background TEXT DEFAULT 'midnight_black',

  -- Avatar
  avatar_glow TEXT DEFAULT 'none',
  avatar_size TEXT DEFAULT 'normal',

  -- BigPulp
  bigpulp_position TEXT DEFAULT 'right',
  dialogue_style TEXT DEFAULT 'default',
  dialogue_color TEXT DEFAULT 'dark',

  -- Stats
  stats_style TEXT DEFAULT 'default',
  stats_color TEXT DEFAULT 'orange',
  stats_visible TEXT DEFAULT '["items","emojis","spent"]', -- JSON array

  -- Collection
  collection_layout TEXT DEFAULT 'grid',
  card_style TEXT DEFAULT 'default',
  featured_slots INTEGER DEFAULT 0,
  featured_items TEXT, -- JSON array of item IDs
  category_tabs_style TEXT DEFAULT 'default',

  -- Page Options
  page_theme TEXT DEFAULT 'dark',
  page_border TEXT DEFAULT 'none',
  entrance_animation TEXT DEFAULT 'none',
  background_music TEXT,
  visitor_counter_style TEXT DEFAULT 'hidden',

  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Profile customization (separate from drawer)
CREATE TABLE IF NOT EXISTS profile_customization (
  user_id TEXT PRIMARY KEY,
  header_style TEXT DEFAULT 'default',
  banner_type TEXT,
  banner_value TEXT,
  bio TEXT,
  bio_extended BOOLEAN DEFAULT 0,
  bio_background TEXT,
  bio_border TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Purchased customization items
CREATE TABLE IF NOT EXISTS user_customization_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,  -- font_color, font_style, background, etc.
  item_id TEXT NOT NULL,   -- white, bold, sunset_fade, etc.
  purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, category, item_id)
);

-- Visitor tracking
CREATE TABLE IF NOT EXISTS drawer_visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drawer_user_id TEXT NOT NULL,
  visitor_user_id TEXT,
  visited_at TEXT DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_drawer_date (drawer_user_id, visited_at)
);
```

---

## Part 12: API ENDPOINTS

```typescript
// GET /api/drawer/:userId/customization
// Returns all customization settings

// PUT /api/drawer/customization
// Update customization settings (owned items only)

// POST /api/drawer/customization/purchase
{
  category: string;  // 'font_color', 'background', etc.
  itemId: string;    // 'white', 'sunset_fade', etc.
}

// GET /api/drawer/:userId/visitors
// Get visitor count and recent visitors

// GET /api/customization/catalog
// Returns all purchasable customization items with prices
```

---

## Implementation Priority

### Phase 1: Core Customization (Must Have)
1. Font colors (cheap entry point!)
2. Font styles
3. Page backgrounds (solid + gradients)
4. Collection layout options

### Phase 2: Visual Enhancements
5. Avatar glow
6. BigPulp position/style
7. Stats customization
8. Card styles

### Phase 3: Premium Features
9. Animated backgrounds
10. Featured items
11. Entrance animations
12. Background music

### Phase 4: Advanced
13. Custom color pickers
14. Profile page customization
15. Visitor counters

---

**Winners win, baby!** 🍊
