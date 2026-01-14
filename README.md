# Wojak.ink

> Mobile-first NFT explorer for the Wojak Farmers Plot collection on Chia blockchain

[![Live Site](https://img.shields.io/badge/Live-wojak.ink-orange?style=for-the-badge)](https://wojak.ink)
[![Chia Blockchain](https://img.shields.io/badge/Blockchain-Chia-green?style=for-the-badge)](https://www.chia.net/)
[![NFTs](https://img.shields.io/badge/NFTs-4,200-blue?style=for-the-badge)](https://wojak.ink)

---

## What is this?

A production web app serving the Wojak Farmers Plot NFT community on Chia. Browse 4,200 unique NFTs, track real-time market data, analyze traits with AI-powered insights, create custom avatars, and play mini-games. Built for collectors, traders, and community members.

**Live:** https://wojak.ink

---

## Features

### Gallery
Browse and discover 4,200 NFTs with filtering by 14 character types and infinite scroll.

<details>
<summary>Technical Details</summary>

**Purpose:** NFT discovery and browsing

**User Flow:**
1. Page loads with first 100 NFTs
2. Filter by character type (Wojak, Soyjak, Waifu, Baddie, Papa Tang, Alien Wojak, etc.)
3. Infinite scroll loads more NFTs
4. Tap NFT to view traits, rarity, sales history
5. Desktop: Enhanced preview with thumbnail strip

**Data Sources:**
- `public/assets/nft-data/metadata.json` - 4,200 NFT attributes (static)
- MintGarden API - Current listings (live)

**Caching:**
- Images preloaded via PreloadCoordinator (predicts user actions)
- TanStack Query for listings (1-10 min TTL)

**Key Files:**
- `src/pages/Gallery.tsx` - Main gallery page
- `src/services/galleryService.ts` - Filtering and sorting
- `src/components/NFTPreviewCard.tsx` - NFT display card

**Character Types (14):**
Wojak, Soyjak, Waifu, Baddie, Papa Tang, Alien Wojak, Monkey Zoo, Chad, Bepe, NPC, Doomer, Bloomer, Zoomer, Coomer

</details>

### BigPulp Intelligence
AI-powered NFT analysis with market insights, trait rankings, and price distribution.

<details>
<summary>Technical Details</summary>

**Purpose:** Deep NFT analysis and market intelligence

**Tabs:**
1. **Ask** - Interactive question tree with animated BigPulp character
2. **Attributes** - Trait rarity table with sorting, sales analysis
3. **Market** - Listings, floor price, price distribution heatmap

**Features:**
- NFT lookup with "Surprise Me" random selection
- Top 10 highest sales analysis
- Rarest finds detection
- High Provenance (HP) trait identification
- Named combo database

**Data Sources:**
- `public/assets/BigPulp/nft_takes_v2.json` - Character commentary
- `public/assets/BigPulp/combo_database.json` - Named trait combos
- Dexie API - Sales history (750+ trades)
- MintGarden API - Current listings

**Caching:**
- Sales stored in localStorage (6-hour auto-sync)
- TanStack Query for live market data (1-10 min TTL)

**Key Files:**
- `src/pages/BigPulp.tsx` - Main intelligence page
- `src/services/bigpulpService.ts` - Analysis logic
- `src/components/MarketHeatmap.tsx` - Price visualization
- `src/components/TraitValues.tsx` - Attribute table

</details>

### Treasury
Portfolio visualization with interactive crypto bubbles and token holdings.

<details>
<summary>Technical Details</summary>

**Purpose:** Display community treasury/wallet holdings

**Features:**
- Portfolio value in XCH + USD
- Interactive crypto bubbles (pop animation with sound)
- Token holdings (large + small tokens)
- NFT collections display
- Wallet address with copy button

**Data Sources:**
- SpaceScan API - Wallet balances (VERY strict: 1 req/20s!)
- CoinGecko API - XCH/USD price

**Caching:**
- localStorage fallback (30 min cache)
- TanStack Query (6 hour TTL due to rate limits)

**Key Files:**
- `src/pages/Treasury.tsx` - Treasury page
- `src/services/treasuryApi.ts` - SpaceScan integration
- `src/components/CryptoBubbles.tsx` - Bubble physics

**Rate Limit Warning:**
SpaceScan is extremely strict. Always use cached data when available. 30-second backoff on 429 errors.

</details>

### Wojak Generator
6-layer avatar composition system with live preview and favorites.

<details>
<summary>Technical Details</summary>

**Purpose:** Create custom Wojak avatars

**Layers (6):**
1. Base (head character)
2. Head accessory
3. Eyes
4. Mouth (special handling for masks)
5. Clothing
6. Background

**Features:**
- Live preview canvas (400px desktop)
- Layer-by-layer trait selection
- Save favorites to localStorage
- Export/download image
- Mobile: Sticky mini-preview

**Data Sources:**
- `public/assets/wojak-layers/` - Layer images by category
- `src/lib/wojakRules.ts` - Layer compatibility rules

**Key Files:**
- `src/pages/Generator.tsx` - Generator page
- `src/services/generatorService.ts` - Layer composition
- `src/contexts/GeneratorContext.tsx` - Selection state

</details>

### Media Hub
Entertainment center with videos, music, and game access.

<details>
<summary>Technical Details</summary>

**Sections:**
- Games grid (6 mini-games)
- Videos grid (filtered by category)
- Background music player

**Features:**
- Floating video player (draggable, resizable)
- Video queue with auto-play
- Category filtering
- Game modal lightbox

**Key Files:**
- `src/pages/Media.tsx` - Media hub page
- `src/contexts/MediaContext.tsx` - Video queue state
- `src/contexts/AudioContext.tsx` - Background audio

</details>

### Mini-Games (6)
Arcade-style games with leaderboards and sound effects.

<details>
<summary>Technical Details</summary>

**Games:**
1. **Orange Stack** - Block stacking puzzle (3 difficulties)
2. **Memory Match** - Tile-flipping memory game
3. **Orange Pong** - Classic Pong
4. **Wojak Runner** - Side-scrolling endless runner
5. **Orange Juggle** - Juggling mechanics
6. **Knife Game** - Knife throwing

**Common Features:**
- Sound effects via `useGameSounds()` hook
- Haptic feedback on mobile
- Leaderboards (localStorage)
- Score persistence

**Key Files:**
- `src/pages/OrangeStack.tsx`, `MemoryMatch.tsx`, etc.
- `src/hooks/useGameSounds.ts` - Audio management

</details>

### Settings
Theme selection, audio controls, and app configuration.

<details>
<summary>Technical Details</summary>

**Features:**
- Theme selector (CSS custom properties)
- Background music volume + toggle
- Sound effects volume + toggle
- Wallet settings (mobile)
- About/credits section

**Persistence:**
- Zustand store with localStorage (`settings-storage`)

**Key Files:**
- `src/pages/Settings.tsx` - Settings page
- `src/stores/settingsStore.ts` - Zustand store

</details>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Ionic + React 19, TypeScript |
| State | TanStack Query, Zustand |
| Animation | Framer Motion |
| Styling | Tailwind CSS v4 |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Workers (cron) |
| APIs | MintGarden, Dexie, SpaceScan, CoinGecko |

<details>
<summary>Architecture Details</summary>

### Codebase Stats
- **59,810 lines** of production code
- 6 main pages + 6 mini-games
- 70+ components, 28+ custom hooks
- 11 React Contexts, 4 Zustand stores

### API Rate Limits (Critical!)
| API | Rate Limit | Purpose |
|-----|------------|---------|
| MintGarden | 2 req/s | NFT listings |
| Dexie | 2 req/s | Sales history |
| SpaceScan | **1 req/20s** | Wallet data (very strict!) |
| CoinGecko | 1 req/2s | XCH price |
| Parse.bot | Paid tier | Fallback scraper |

### 3-Tier API Fallback
1. **Primary:** Free Dexie.space API
2. **Cache:** localStorage backup (24h valid)
3. **Fallback:** Parse.bot paid API

### Caching Strategy
| Data | Location | TTL |
|------|----------|-----|
| Sales history | localStorage | 6 hours (auto-sync) |
| NFT metadata | Static JSON | Immutable |
| Market listings | TanStack Query | 1-10 min |
| XCH price | TanStack Query | 6 hours |
| Treasury | localStorage + Query | 30 min |

### Smart Rate Limiter
`src/utils/rateLimiter.ts` (450 lines) handles:
- Per-domain request queuing
- Automatic retry with exponential backoff
- 429 error handling with cooldown
- In-flight request deduplication
- Response caching with TTL

</details>

---

## Recent Updates

<!-- AUTO-GENERATED FROM LEARNINGS.md -->
| Date | Update |
|------|--------|
| 2026-01-14 | Full codebase exploration, documented API architecture |
| 2026-01-14 | Created 6 custom Claude Code skills (/deploy, /dev, /sync-sales, /add-token, /status, /analyze) |
| 2026-01-14 | Added Context7 plugin for live documentation |
| 2026-01-14 | Git workflow: branches not folders |
| 2026-01-14 | Fixed CAT token rates (SPROUT, PIZZA, G4M) |
| 2026-01-14 | Created context management system (LEARNINGS.md) |
<!-- END AUTO-GENERATED -->

---

## Development

```bash
# Start dev server (accessible on local network for phone testing)
npm run dev -- --host

# Production build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=wojak-ink
```

<details>
<summary>Full Development Guide</summary>

### Local Testing Workflow
1. Run `npm run dev -- --host`
2. Note the Network URL (e.g., `http://192.168.1.143:5177`)
3. Open on phone (same WiFi network)
4. Test, iterate, repeat
5. When satisfied: commit, push, deploy

### Key Files
| File | Purpose |
|------|---------|
| `src/services/salesDatabank.ts` | Sales storage, CAT token fixes |
| `src/services/historicalPriceService.ts` | Token rates, XCH prices |
| `src/services/dexieSalesService.ts` | Dexie API integration |
| `src/utils/rateLimiter.ts` | API rate limiting |
| `vite.config.ts` | Dev proxies, build config |

### API Proxies (Dev Mode)
```
/mintgarden-api → https://api.mintgarden.io
/dexie-api → https://api.dexie.space
/spacescan-api → https://api.spacescan.io
/coingecko-api → https://api.coingecko.com
```

### CAT Token Rates
When adding new token rates, edit `src/services/historicalPriceService.ts`:
```typescript
const TOKEN_RATES: Record<string, number> = {
  'PIZZA': 0.00000286,
  'SPROUT': 0.00000932,
  'G4M': 0.00000175,
  // Add new tokens here
};
```

### Deployment
```bash
npm run build && npx wrangler pages deploy dist --project-name=wojak-ink
```

Or use the custom skill: `/deploy`

</details>

---

## For AI Assistants

If you're an LLM reading this to understand the project:

1. **Quick context:** See `CLAUDE.md` in the repo root
2. **Full documentation:** See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
3. **Recent learnings:** See `LEARNINGS.md` in the repo root

### Key Gotchas
- SpaceScan API is **extremely strict** (1 req/20s) - always use cache
- CAT token sales need manual rate lookup (Dexie doesn't provide rates)
- `fixSuspiciousSales()` must run AFTER sync, not before
- NFT names come from "Base" attribute in metadata

---

## Links

- **Live App:** https://wojak.ink
- **Twitter:** [@MoJuiceX](https://twitter.com/MoJuiceX)
- **Collection:** [Wojak Farmers Plot on MintGarden](https://mintgarden.io/collections/wojak-farmers-plot)

---

*Last updated: 2026-01-14 via automated docs pipeline*
