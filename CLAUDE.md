# CLAUDE.md - Wojak.ink Mobile

> Project memory file - always in context. Keep concise.

## What Is This

Mobile-first web app for Wojak Farmers Plot NFT collection (4200 NFTs on Chia blockchain). Production app for real NFT collectors.

**Live site**: https://wojak.ink

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Ionic + React |
| Hosting | Cloudflare Pages |
| Backend | Cloudflare Workers (trade data aggregation) |
| APIs | MintGarden, Dexie, SpaceScan, CoinGecko |

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
| `vite.config.ts` | Dev server config including API proxies |
| `public/assets/BigPulp/nft_takes_v2.json` | Big Pulp commentary for each NFT |
| `public/assets/BigPulp/did_you_know.json` | Optional facts (~33% of NFTs) |

---

## API Proxies (Dev Mode)

In development, these proxies bypass CORS:
- `/mintgarden-api` → `https://api.mintgarden.io`
- `/dexie-api` → `https://api.dexie.space`

Production uses direct API calls.

---

## Links

- **Live App**: https://wojak.ink
- **GitHub**: https://github.com/MoJuiceX/wojak-ink-v3
- **Twitter**: https://twitter.com/MoJuiceX
- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
