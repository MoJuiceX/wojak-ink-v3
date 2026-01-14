# CLAUDE.md - Wojak.ink Mobile

> Project memory file - always in context. Keep concise.

## Context Management (MANDATORY)

**CRITICAL: Before conversation compression, you MUST capture learnings.**

This is automatic behavior - do NOT wait for the user to ask:

### Triggers (act on ANY of these):
- Conversation has 20+ back-and-forth exchanges
- Major bug was fixed or feature completed
- New pattern/gotcha was discovered
- User says "that's working now" or similar
- You sense the conversation is getting long

### Actions (do ALL of these):
1. **Announce:** "Let me capture what we learned before this context compresses."
2. **Update LEARNINGS.md:** Add specific entry with date, what was fixed, what was learned
3. **Update CLAUDE.md:** If the learning is reusable across sessions, add it to the appropriate section
4. **Commit the updates:** `git add LEARNINGS.md CLAUDE.md && git commit -m "docs: capture session learnings"`

### Why This Matters:
After compression, detailed debugging steps and specific fixes are lost forever.
Capturing BEFORE compression preserves the full context for future sessions.

## What Is This

Mobile-first web app for Wojak Farmers Plot NFT collection (4200 NFTs on Chia blockchain). Production app for real NFT collectors.

**Live site**: https://wojak.ink

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Ionic + React 19, TanStack Query, Zustand, Framer Motion |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Workers (trade data aggregation, cron every 30 min) |
| APIs | MintGarden, Dexie, SpaceScan, CoinGecko, Parse.bot (fallback) |

### Codebase Stats
- **59,810 lines** of production code
- 6 main pages + 6 mini-games
- 70+ components, 28+ custom hooks
- 4,200 NFTs across 14 character types

### Context7 Plugin (Auto Documentation)
Use `/docs [library]` or ask naturally about any library. Context7 fetches live, up-to-date documentation.

**Common lookups for this project:**
- `/docs ionic react` - Ionic components (IonModal, IonCard, etc.)
- `/docs vite` - Build config, proxies, env variables
- `/docs tanstack query` - Data fetching hooks
- `/docs framer motion` - Animations
- `/docs cloudflare workers` - Worker APIs

---

## Project Decisions & Conventions

### Terminology
- Use **"attributes"** NOT "traits" (matches SpaceScan, Dexie, MintGarden)
- Use **"XCH"** for Chia currency

### Display Rules
- **Always show USD alongside XCH** - e.g., "0.8 XCH" with "$4" below or beside it
- Format: XCH on its own line, USD + label together (e.g., "$4 Floor Price")

### CSS Naming
- Avoid generic class names that might conflict (e.g., use `.color-orange` not `.orange`)
- Game.css has `.orange { position: absolute }` - don't reuse that class name elsewhere

### Tables
- Use `table-layout: fixed` for stable column widths (no jumping on sort/filter)
- Attribute names left-aligned, numeric columns centered

### Data Loading
- Prefetch data during boot sequence (user watches animation anyway)
- Use Vite proxy in dev mode for CORS (`/mintgarden-api`, `/dexie-api`)

---

## Development Workflow

### The Rule
**Everything stays local until explicitly told to push.**

### Process
1. Make changes locally
2. User tests on their device (http://192.168.x.x:port)
3. Iterate until user is satisfied
4. User says "push to GitHub" → commit, push, deploy

### Commands
```bash
npm run dev -- --host     # Dev server (accessible on network)
npm run build             # Production build
npx wrangler pages deploy dist --project-name=wojak-ink  # Deploy to production
```

### Do NOT
- Push to GitHub without explicit permission
- Deploy to production without explicit permission
- Auto-commit changes
- Create new folders for "redesigns" or "versions" - use git branches instead

### Git Branches (Not Folders!)
```bash
git checkout -b experiment    # Create branch for experiments
git checkout main             # Go back to stable
git merge experiment          # Merge when ready
git branch -d experiment      # Delete branch after merge
```
One folder (`~/wojak-ink`), multiple branches. Never duplicate the repo folder.

### Custom Skills (in ~/.claude/skills/)
| Skill | Command | Purpose |
|-------|---------|---------|
| deploy | `/deploy` | Build + deploy to Cloudflare Pages |
| dev | `/dev` | Start dev server with --host |
| sync-sales | `/sync-sales` | Debug sales data issues |
| add-token | `/add-token` | Add CAT token conversion rate |
| status | `/status` | System health check |
| analyze | `/analyze [id]` | Quick NFT lookup |

---

## Features

1. **Gallery** - Browse 4200 NFTs, filter by attributes, infinite scroll
2. **Treasury** - Live wallet data, token balances, crypto bubbles
3. **BigPulp Intelligence** - Collection stats, top attributes, sales, market heatmap
4. **Wojak Generator** - Layer selection, preview, favorites
5. **Media** - Music videos with floating player
6. **Games** - Mini-games (Orange Stack, Memory Match, etc.)

---

## Project Structure

```
src/
├── pages/           # Ionic pages (Gallery, Treasury, BigPulp, etc.)
├── components/      # Reusable UI (AskBigPulp, TraitValues, MarketHeatmap)
├── services/        # API integrations (marketApi, tradeValuesService, treasuryApi)
├── contexts/        # React Context (AudioContext, VideoPlayerContext)
├── data/            # Static data, constants
└── hooks/           # Custom React hooks

public/assets/
├── nft-data/        # Metadata, rarity JSON
├── BigPulp/         # Analysis data, combo database, trait insights
└── wojak-layers/    # Layer images by folder

workers/
└── fetch-sales.ts   # Cloudflare Worker for trade data (runs every 30 min)
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/AskBigPulp.tsx` | BigPulp Intelligence "Ask" tab content |
| `src/components/TraitValues.tsx` | Attributes table with sorting |
| `src/components/MarketHeatmap.tsx` | Price distribution heatmap |
| `src/services/tradeValuesService.ts` | Trade data + collection stats API |
| `src/services/marketApi.ts` | Market listings from Dexie/MintGarden |
| `src/services/bigpulpService.ts` | BigPulp data: top sales, rarest finds, NFT analysis |
| `src/services/salesDatabank.ts` | Sales history storage, CAT token fixes |
| `src/services/historicalPriceService.ts` | XCH/USD prices, CAT token rates |
| `src/services/dexieSalesService.ts` | Fetches sales from Dexie API |
| `src/providers/SalesProvider.tsx` | Initializes sales databank, auto-sync |
| `vite.config.ts` | Dev server config including API proxies |
| `public/assets/BigPulp/nft_takes_v2.json` | Big Pulp commentary for each NFT |
| `public/assets/nft-data/metadata.json` | NFT metadata (base character, attributes) |

---

## API Architecture

### Rate Limits (CRITICAL)
| API | Rate Limit | Notes |
|-----|------------|-------|
| MintGarden | 2 req/s | NFT listings |
| Dexie | 2 req/s | Sales history |
| SpaceScan | **1 req/20s** | VERY strict! 30s backoff on 429 |
| CoinGecko | 1 req/2s | XCH price |
| Parse.bot | Paid | Fallback when Dexie fails |

### 3-Tier API Fallback
1. **Primary:** Free Dexie.space API
2. **Cache:** localStorage backup (24h valid)
3. **Fallback:** Parse.bot paid API (if cache stale)

### Caching Strategy
| Data | Cache Location | TTL |
|------|---------------|-----|
| Sales history | localStorage | 6 hours (auto-sync) |
| NFT metadata | Static JSON | Immutable |
| Market listings | TanStack Query | 1-10 min |
| XCH price | TanStack Query | 6 hours |
| Treasury data | localStorage + Query | 30 min |

### Dev Proxies (vite.config.ts)
- `/mintgarden-api` → `https://api.mintgarden.io`
- `/dexie-api` → `https://api.dexie.space`
- `/spacescan-api` → `https://api.spacescan.io`
- `/coingecko-api` → `https://api.coingecko.com`

---

## Sales Data & CAT Tokens

### How Sales Work
- Sales are fetched from Dexie API and stored in localStorage (`salesDatabank`)
- `SalesProvider` auto-syncs every 6 hours
- CAT token sales need conversion to XCH equivalent using token-specific rates

### CAT Token Rates (XCH per 1 token)
These are defined in `historicalPriceService.ts`:
| Token | Rate | Example |
|-------|------|---------|
| PIZZA | 0.00000286 | 550,000 PIZZA = ~1.57 XCH |
| SPROUT | 0.00000932 | 110,000 SPROUT = ~1.02 XCH |
| G4M | 0.00000175 | 366,666 G4M = ~0.64 XCH |
| BEPE | 0.0000204 | 70,000 BEPE = ~1.43 XCH |
| HOA | 0.000318 | 6,300 HOA = ~2 XCH |
| NeckCoin | 3.006 | High-value token |

### NFT Naming
- NFTs have a "Base" attribute in metadata (Alien Wojak, Papa Tang, Soyjak, etc.)
- Use `getNftName()` helper in `bigpulpService.ts` to get proper names
- Display as "Alien Wojak #3666" not "Wojak #3666"

---

## Lessons Learned

### XCH Price
- **Never hardcode XCH price** - it changes daily
- Use `useXchPrice()` hook for real-time price from CoinGecko
- The title bar already shows current XCH price

### CAT Token Sales
- Dexie API returns raw token amounts without conversion rates
- Sales with large token amounts (>50k) and high XCH values (>2) are likely miscalculated
- `fixSuspiciousSales()` in `salesDatabank.ts` auto-corrects bad conversions
- Must run `fixSuspiciousSales()` AFTER sync completes, not before

### Top 10 Highest Sales
- Use `getRecentSales(10000)` to get ALL sales, not just recent 20
- Sort by `xchEquivalent` descending to find true highest sales

### Sales Sync Timing
- `SalesProvider` runs `fixSuspiciousSales()` on load AND after sync
- If localStorage is cleared, sync takes 10-15 seconds to fetch 750+ trades
- Manual sync: `syncDexieSales()` from `dexieSalesService.ts`

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Sales showing wrong XCH values | CAT token rate missing | Add rate to `TOKEN_RATES` in `historicalPriceService.ts` |
| "No sales data available" | localStorage cleared | Wait for auto-sync or run `syncDexieSales()` manually |
| NFT shows "Wojak #XXXX" | Not using metadata | Use `getNftName()` with loaded metadata |
| fixSuspiciousSales not working | Ran before sync | Ensure it runs AFTER `syncDexieSales()` completes |
| XCH price wrong | Hardcoded value | Use `useXchPrice()` hook |

---

## Links

- **Live App**: https://wojak.ink
- **GitHub**: https://github.com/MoJuiceX/wojak-ink-v3
- **Twitter**: https://twitter.com/MoJuiceX
- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
