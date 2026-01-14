# Wojak.ink Website Redesign Brief

> Complete documentation of the current website for redesign reference

---

## What This Website Is

**Wojak.ink** is a mobile-first web app for the **Wojak Farmers Plot** NFT collection - 4,200 unique NFTs on the Chia blockchain. It serves real NFT collectors who want to browse, analyze, and interact with their collection.

**Live site**: https://wojak.ink

**Core purpose**: Help collectors explore NFTs, track market value, understand rarity, and have fun with the community.

---

## Target Users

- NFT collectors on Chia blockchain
- Community members of "Tang Gang" (the Wojak Farmers community)
- Mobile-first users (primarily iOS)
- Desktop users as secondary audience

---

## Navigation Structure

### Bottom Tab Bar (Always Visible)
Six tabs permanently fixed at bottom of screen:

| Tab | Icon | Page |
|-----|------|------|
| Gallery | Camera | Browse all 4,200 NFTs |
| Treasury | Briefcase | Wallet portfolio & tokens |
| BigPulp | Lightbulb | Collection intelligence & stats |
| Generator | Palette | Create custom Wojaks |
| Media | Music note | Games & music videos |
| Settings | Dots menu | Preferences |

The tab bar uses a glass-morphism effect (frosted glass background).

---

## Page-by-Page Documentation

---

### 1. GALLERY PAGE

**Purpose**: Browse and explore all 4,200 NFTs with filtering and navigation

#### Layout (Top to Bottom)

1. **Header Area**
   - Page title
   - Mode toggle icons (explained below)

2. **Base Character Grid**
   - 14 clickable cards showing base character types
   - Types: Wojak, Soyjak, Waifu, Baddie, Papa Tang, Monkey Zoo, Bepe variants, Alien variants
   - Each card shows a preview thumbnail
   - Tapping opens that character's explorer modal

3. **NFT Explorer Modal** (opens when base selected)
   - **Large NFT Image** (center)
     - Swipe left/right to navigate between NFTs
     - Tap left/right edges as alternative navigation
     - Shows listing price badge if for sale

   - **Navigation Mode Icons** (top right)
     - ID Mode: Browse sequentially 1-4200
     - Rarity Mode: Browse by rarity rank (crown emoji when active)
     - Price Low→High: Cheapest first (money bag down arrow)
     - Price High→Low: Expensive first (money bag up arrow)

   - **Filter Pills** (below image)
     - "All" - Show all NFTs
     - "Listed" - Only show NFTs currently for sale

   - **Price Slider** (left edge, mobile only)
     - Appears when "Listed" filter is active
     - Vertical slider with money emoji that follows finger
     - Logarithmic scale to handle price outliers
     - Drag up/down to jump to NFTs at different price points

   - **Info Card** (below filters) - 3 tabs:
     - **Main Tab**: Rarity rank (e.g., "#42/4200"), listing price in XCH + USD, action buttons
     - **Metadata Tab**: All attributes/traits for this NFT
     - **History Tab**: Transaction history (mint date, trades, prices)

   - **Action Buttons**:
     - Open on MintGarden (external marketplace)
     - Toggle metadata view
     - Toggle history view
     - Shuffle (random NFT)

#### User Experience Notes
- First-time users see animated swipe hint arrows
- Crossed-out dollar icon appears if NFT not listed
- Images load from IPFS with local preview fallbacks
- Smooth swipe animations with momentum

---

### 2. TREASURY PAGE

**Purpose**: Display wallet portfolio value and token holdings with interactive visualization

#### Layout (Top to Bottom)

1. **Total Portfolio Card**
   - Large USD value display (e.g., "$12,450")
   - XCH equivalent below (e.g., "~2,490 XCH")
   - Breakdown line: "XCH: $X + CATs: $Y"
   - Current conversion rate: "1 XCH = $X"
   - Small info button (?) in corner
     - Tap once: Shows tooltip explaining the values
     - Tap again: Plays random educational video about the collection

2. **Crypto Bubbles Visualization**
   - Interactive canvas (360px x 340px)
   - Floating bubbles representing each token
   - Bubble size = token value (logarithmic scale)
   - XCH is always the first/largest bubble (green)
   - CAT tokens (worth $1+) shown as additional colored bubbles

   **Bubble Interactions**:
   - Tap bubble to pop it (particle explosion + ripple effect + pop sound)
   - Bubbles drift and bounce off edges (physics simulation)
   - Pop all bubbles = celebration confetti + special sound
   - Shake device to reset all popped bubbles
   - Popped bubbles respawn after 30 seconds
   - Haptic feedback on each pop

3. **Small Tokens Section**
   - Static list of tokens worth less than $1
   - Shows token logo, name, and value

4. **Wallet Card**
   - Truncated wallet address (e.g., "xch1a2b3...xyz")
   - Copy button (copies full address, shows toast confirmation)
   - "View on Explorer" button (opens SpaceScan)

5. **NFT Collections Grid**
   - Cards showing other NFT collections in wallet
   - Each card: Preview image + count badge
   - Tap card to open modal with full NFT grid

#### User Experience Notes
- Pull-to-refresh to update data
- Shows cached data immediately, fresh data loads in background
- "Last updated" timestamp displayed
- Sound effects respect user's audio settings

---

### 3. BIGPULP INTELLIGENCE PAGE

**Purpose**: Collection analytics, NFT analysis, market heatmap, and AI-style oracle

**Who is BigPulp?**: An animated character (a Wojak variant) who provides commentary and analysis. Has different head variants based on NFT traits.

#### Layout (Top to Bottom)

1. **"Hang with BigPulp" Button**
   - Opens the main Intelligence modal with 3 tabs

2. **NFT Search Row**
   - Numeric input field for NFT ID (e.g., "1234")
   - Auto-searches when 4 digits entered
   - "Surprise Me" button for random NFT
   - Keyboard auto-dismisses on search

3. **NFT Preview Card** (after search)
   - NFT image with earned combo badges overlaid (emoji badges in corner)
   - Base character name + ID
   - Rarity rank with visual progress bar
   - Position within base type (e.g., "#1 of 300 Wojaks")

4. **BigPulp Character**
   - Two-layer animated image (base + head variant)
   - Speech bubble with typing animation (text appears letter by letter)
   - Head changes based on the NFT being analyzed (Crown, Clown, Wizard, etc.)

5. **Analysis Results** (below character)
   - **Flag Badges**: Crown Holder, Special Edition, Top 10%, Rare Combo, Floor Defender
   - **High Provenance Traits**: Gold-colored tags for S-tier attributes
   - **Rare Combos**: Trait combinations with rarity counts
   - **Did You Know**: Fun fact callout (appears for ~33% of NFTs)

#### Intelligence Modal (3 Tabs)

**Tab 1: Market Heatmap**
- Grid visualization: Rarity (vertical) vs Price (horizontal)
- 80 cells (10 rarity ranges x 8 price ranges)
- Color intensity shows listing density
- 6 view modes:
  - All Listings
  - Sleepy Deals (underpriced)
  - Delusion Zones (overpriced)
  - Floor Snipes
  - Rare & Reasonable
  - Whale Territory
- Toggle to show combo badges overlay
- Click any cell to see NFTs in that range
- Alternative bar chart view showing price distribution
- Floor price and total listings stats

**Tab 2: Ask BigPulp**
- Question/answer interface
- Ask questions about the collection
- BigPulp responds with typed animation

**Tab 3: Attributes Table**
- Sortable table of all traits
- Columns: Attribute name, Type, Sales count, Avg/Min/Max price, Last traded date
- Search bar + category filter dropdown
- Click row to expand and see recent sales carousel
- Sales carousel highlights: Cheapest, Most expensive, Rarest, Newest

---

### 4. GENERATOR PAGE

**Purpose**: Create custom Wojak combinations with 6 layers

#### The Layer System
Layers render bottom to top:
1. **Background** (optional) - Scene behind character
2. **Base** - Core character (Classic, Rekt, Rugged, Bleeding, Terminator)
3. **Clothes** - Outfits (Note: Astronaut blocks Head/Mouth layers)
4. **Mouth** - Complex multi-selection with rules (see below)
5. **Eyes** (optional) - Eye variants, includes Laser-Eyes
6. **Head** (optional) - Hats, hair, helmets (some have mask variants)

**Mouth Layer Special Rules**:
- Underlay traits (Neckbeard, Stache) render below main mouth
- Base traits (Numb, Smile, Teeth, Screaming) render middle
- Overlay traits (Cig, Cohiba, Joint) render on top, require a base
- Exclusive traits (Bandana-Mask, Bubble-Gum, Pipe, Pizza) can't combine

#### Layout (Top to Bottom)

1. **Preview Section**
   - Large layered preview (512px display)
   - All selected layers composited together

2. **Mini Preview** (appears when scrolling)
   - Sticky header with small preview
   - Tap to scroll back to main preview

3. **Layer Tabs**
   - 6 buttons: Base, Head, Eyes, Mouth, Clothes, Background
   - Active tab highlighted

4. **Trait Selector Grid**
   - Grid of available traits for selected layer
   - "None" option for optional layers
   - Secondary (+) badge on combinable Mouth traits
   - "Blocked" notice when Astronaut is selected
   - Hover preview on desktop

5. **Action Bar**
   - Heart button: Save to favorites
   - Badge showing saved count (tap to open Favorites)
   - Open image button (for saving/sharing)
   - Randomize button: Fill all layers randomly

#### Favorites Modal
- Grid of saved Wojak creations
- Tap to load a saved creation
- Edit name, rename, or delete

#### Export Options
- Download as PNG (1024x1024)
- Share to X/Twitter
- Long-press on mobile to save

---

### 5. MEDIA PAGE

**Purpose**: Games, music videos, and background music

#### Layout (Top to Bottom)

1. **Games Grid** (6 mini-game cards)
   | Game | Icon | Description |
   |------|------|-------------|
   | Orange Slice | Orange | Slice-based game |
   | Orange Stack | Box | Stacking game |
   | Memory Match | Brain | Card flip memory |
   | Orange Pong | Paddle | Classic pong |
   | Wojak Runner | Runner | Infinite runner |
   | 2048 Oranges | Numbers | 2048 variant |

   - Tap card to open full-screen game modal
   - Close button in top-right of modal

2. **Music Videos Grid**
   - Video thumbnails with play overlay
   - Tap to open floating video player
   - Videos can play while browsing other pages
   - Stops background music when playing

3. **Website Music Section**
   - Track list (looping background music)
   - Play/pause toggle
   - Volume slider
   - Music continues across pages when enabled

#### Floating Video Player
- Small player floats at bottom-right corner
- Play/pause, next video, close buttons
- Can drag to reposition
- Persists across page navigation

---

### 6. SETTINGS PAGE

**Purpose**: User preferences and app info

#### Sections

1. **Audio Settings**
   - Background Music toggle (on/off)
   - Sound Effects toggle (on/off)

2. **Theme Selection** (4 options)
   | Theme | Icon | Description |
   |-------|------|-------------|
   | Light | Sun | Light background, dark text |
   | Dark | Moon | Default. Dark background, light text |
   | Orange | Palette | "Tang Gang" cyberpunk orange theme |
   | Green | Palette | "Chia Native" green theme |

3. **Admin Section**
   - Generator Stats button (links to admin page)

4. **App Info**
   - Version number
   - Collection info: "4200 Wojak Farmers Plot on Chia"

---

## Visual Design System

### Current Theme: Dark Mode (Default)

**Colors**:
- Background: #0a0a0f (deep black-blue)
- Primary accent: #ff6b00 (orange) with glow effects
- Text: White with opacity variations
- Cards: Glass-morphism (5% white opacity with blur)

**All 4 Theme Palettes**:

| Element | Dark | Light | Orange | Green |
|---------|------|-------|--------|-------|
| Background | #0a0a0f | #f8f9fa | #1a0a00 | #001a0a |
| Accent | #ff6b00 | #ff6b00 | Intense orange glow | #22c55e |
| Text | White | Dark gray | Warm white/orange | Green-tinted white |
| Cards | Glass (dark) | White + shadow | Orange glass | Green glass |

**Typography**:
- Font: Inter, SF Pro Display, system fonts
- Sizes: 10px to 40px (8 standard sizes)
- Weights: 400, 500, 600, 700

**Effects**:
- Glass-morphism on cards and overlays
- Orange glow effects on buttons and accents
- Smooth transitions (150ms fast, 250ms normal, 400ms slow)
- Shadows at 4 intensities

---

## Mobile vs Desktop Experience

### Mobile-First Features
- **Touch gestures**: Swipe navigation, tap zones, long-press to save
- **Device motion**: Shake to reset bubbles
- **Haptic feedback**: Vibration on interactions
- **Floating UI**: Sticky mini preview, floating video player
- **Full-screen modals**: Immersive game experience
- **Price slider**: Thumb-friendly vertical slider

### Desktop Adaptations
- Click instead of swipe
- Hover states on trait grids
- More table columns visible
- No shake detection (obviously)

### Responsive Notes
- Mobile-first CSS approach
- Some table columns hidden on mobile (.hide-mobile)
- Grid layouts auto-flow based on screen width
- Modals full-screen on mobile, centered on desktop

---

## Data & Performance

### Data Sources
- **NFT metadata**: 4,200 NFTs with attributes, rarity, images
- **Market data**: Live listings from MintGarden/Dexie APIs
- **Wallet data**: Token balances, NFT holdings
- **Price data**: XCH/USD from CoinGecko
- **Images**: IPFS via w3s.link gateway

### Performance Strategy
- Boot animation overlays data prefetching (5 seconds)
- Aggressive image preloading
- 30-minute cache for market data
- Local storage for favorites and settings
- Lazy loading for grid images

---

## Key Interaction Patterns

| Interaction | Used In | Purpose |
|-------------|---------|---------|
| Swipe left/right | Gallery | Navigate NFTs |
| Tap to pop | Treasury bubbles | Satisfying interaction |
| Shake device | Treasury | Reset bubbles |
| Pull to refresh | Treasury, BigPulp | Reload data |
| Long press | Generator | Save image |
| Typing animation | BigPulp | Character personality |
| Haptic feedback | Throughout | Tactile confirmation |

---

## What Makes This App Unique

1. **Crypto Bubbles**: Physics-based token visualization with pop mechanics
2. **BigPulp Character**: Animated oracle with personality and typing effect
3. **Market Heatmap**: Visual price/rarity analysis tool
4. **Generator Rules**: Complex layer system with trait interactions
5. **Games Integration**: Mini-games embedded in the app
6. **Multi-Theme**: 4 distinct visual themes

---

## Redesign Considerations

### Preserve These Core Experiences
- Gallery swipe navigation feel
- Bubble popping satisfaction
- BigPulp character personality
- Generator layer flexibility
- Always showing USD alongside XCH

### Potential Improvements
- Tablet/larger screen layouts
- Accessibility (ARIA labels, keyboard nav)
- Loading states and error handling
- Onboarding for complex features
- Visual hierarchy refinement
- Information density optimization

---

## Technical Stack Reference

- **Framework**: Ionic React + React 18
- **Routing**: Ionic React Router (tab-based)
- **Styling**: CSS custom properties + modules
- **Mobile**: Capacitor (iOS native features)
- **Audio**: Web Audio API + HTML5 Audio
- **Build**: Vite + TypeScript
- **Hosting**: Cloudflare Pages + Workers

---

*Document generated for redesign reference. Last updated: January 2026*
