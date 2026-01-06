# CLAUDE.md - Wojak.ink Mobile

> Project memory file - always in context. Keep concise.

## What Is This

Mobile-first web app for Wojak Farmers Plot NFT collection (4200 NFTs on Chia blockchain). Production app for real NFT collectors.

**Full spec**: See `PROJECT_SPEC.md`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Ionic + React |
| Backend | Parse (Back4App free tier) |
| APIs | MintGarden, Dexie, SpaceScan, CoinGecko |

---

## MVP Features Only

1. **Gallery** - Browse 4200 NFTs
2. **Treasury** - Show wallet holdings + value
3. **Wojak Generator** - Basic layer preview (no export)
4. **BigPulp's Take** - NFT ID input → analysis sentence
5. **Orange Game** - Tap to juggle, score counter

**Everything else is v2.**

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
```

---

## Project Structure

```
src/
├── pages/           # Ionic pages (Gallery, Treasury, etc.)
├── components/      # Reusable UI components
├── services/        # API integrations
├── utils/           # Helpers, trait logic
├── data/            # Static data, constants
├── hooks/           # Custom React hooks
└── contexts/        # React Context providers

public/assets/
├── nft-data/        # Metadata, rarity JSON
├── BigPulp/         # Analysis, sentences JSON
└── wojak-layers/    # Layer images by folder
```

---

## Constraints

### Do NOT:
- Add features beyond MVP scope
- Over-engineer Parse schema
- Implement complex layer rules (v2)
- Add wallet connection (v2)
- Skip loading/error states

### Always:
- Mobile-first (test at 375px)
- Use environment variables for secrets
- Cache external API calls in Parse
- Keep components focused and small

---

## Data Sources

| Data | Source |
|------|--------|
| NFT metadata | `public/assets/nft-data/metadata.json` |
| Rarity ranks | `public/assets/nft-data/rarity.json` |
| BigPulp sentences | `public/assets/BigPulp/sentences.json` (user will update) |
| Layer images | `public/assets/wojak-layers/` |
| Live prices | CoinGecko API (cached in Parse) |
| Treasury | SpaceScan API (cached in Parse) |

---

## Current Status

**Phase**: Project setup
**Next**: Initialize Ionic project, connect Parse

---

## Links

- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Parse JS SDK](https://parseplatform.org/Parse-SDK-JS/api/)
- [Back4App Dashboard](https://www.back4app.com/)
