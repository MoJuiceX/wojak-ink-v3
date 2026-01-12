# PROJECT_SPEC.md - Wojak.ink Mobile

> Production-ready mobile-first application for Wojak Farmers Plot NFT collectors

---

## Project Overview

**Product**: Wojak.ink - A mobile-first web application for the Wojak Farmers Plot NFT collection on Chia blockchain.

**Target Users**: Existing NFT holders of the minted-out Wojak Farmers Plot collection (community of collectors).

**Goal**: Deliver a production-quality mobile app that adds value to the NFT collection through:
- Collection browsing
- Treasury transparency
- Custom Wojak creation
- AI-powered NFT insights
- Community engagement through gamification

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Ionic Framework + React | Mobile-first UI components |
| **Backend** | Parse Platform (Back4App) | Auth, database, cloud functions, file storage |
| **APIs** | MintGarden, Dexie, SpaceScan, CoinGecko | NFT data, marketplace, blockchain, prices |
| **Hosting** | TBD (Vercel, Cloudflare, or Capacitor for native) | Web deployment |

---

## MVP Features (v1)

### 1. Gallery
Browse the complete Wojak Farmers Plot collection.

**Core functionality:**
- Display all 4200 NFTs in a scrollable grid
- Show NFT image, ID, and rarity rank
- Tap to view NFT details (traits, rarity tier)
- Basic search by NFT ID

**Data source:** Static NFT metadata JSON + IPFS images

---

### 2. Treasury
Display the Wojak Farmers Plot treasury holdings.

**Core functionality:**
- Show total treasury value in XCH and USD
- List tokens/coins held
- Pull live XCH price from CoinGecko

**Data source:** Treasury wallet API + CoinGecko

---

### 3. Wojak Generator
Create custom Wojak characters using collection traits.

**Core functionality (MVP):**
- Select traits from each layer category
- Live preview of combined layers
- Basic layer ordering (no complex rules for MVP)

**Deferred to v2:**
- Export/download image
- Complex layer interaction rules
- Minting on Chia blockchain
- Tangify AI transformation

**Data source:** Layer images from old project

---

### 4. BigPulp Intelligence (Ask BigPulp's Take)
AI-powered NFT insights - the signature feature.

**Core functionality:**
- Input field for NFT ID (1-4200)
- Display pre-generated analysis sentence
- Show rarity rank and tier
- Show key stats (High Provenance count, 1-of-1 pairings)

**Deferred to v2:**
- Full Q&A question tree
- Rare combos explorer
- Trait deep-dives
- Interactive filtering

**Data source:** Pre-generated analysis JSON (updated sentences from user)

---

### 5. Orange Juggle Game
Easter egg game for community engagement.

**Core functionality:**
- Tap/touch to keep orange bouncing
- Score counter
- Simple game over state

**Deferred to v2:**
- Leaderboards
- Prize system
- Wallet connection for rewards

---

## Data Architecture

### Parse Classes (Backend)

```
User {
  objectId: String (auto)
  username: String (optional)
  favorites: Array<String> (NFT IDs)
  createdAt: Date
}

WojakCreation {
  objectId: String (auto)
  userId: Pointer<User> (optional)
  layers: Object { Background, Base, Clothes, ... }
  createdAt: Date
}

GameScore {
  objectId: String (auto)
  oderId: Pointer<User> (optional)
  score: Number
  createdAt: Date
}

CachedData {
  objectId: String (auto)
  key: String (unique) - e.g., "treasury", "xch_price"
  data: Object
  expiresAt: Date
  updatedAt: Date
}
```

### Static Data Files (Frontend)

```
public/assets/
├── nft-data/
│   ├── metadata.json          # Full collection metadata
│   └── rarity.json            # Rarity rankings
├── BigPulp/
│   ├── analysis.json          # Per-NFT analysis
│   ├── sentences.json         # Generated sentences (user will update)
│   └── manifest.json          # Version info
└── wojak-layers/
    ├── BACKGROUND/
    ├── BASE/
    ├── CLOTHES/
    ├── EYE/
    ├── HEAD/
    ├── MASK/
    ├── MOUTH/
    └── ...
```

---

## External APIs

| API | Endpoint Purpose | Caching Strategy |
|-----|------------------|------------------|
| **MintGarden** | NFT collection data, trade history | Cache in Parse, refresh daily |
| **Dexie** | Marketplace listings, offers | Cache in Parse, refresh hourly |
| **SpaceScan** | Blockchain data, wallet info | Cache in Parse, refresh on demand |
| **CoinGecko** | XCH/USD price | Cache in Parse, refresh every 5 min |

---

## Milestones

### Milestone 1: Foundation
- [ ] Ionic + React project initialized
- [ ] Parse/Back4App connected
- [ ] Basic app shell with tab navigation
- [ ] Static data files copied and loading

### Milestone 2: Gallery
- [ ] NFT grid displaying all 4200 items
- [ ] NFT detail view with traits
- [ ] Search by ID
- [ ] Lazy loading / virtualization for performance

### Milestone 3: Treasury
- [ ] Treasury display component
- [ ] Parse Cloud Function for fetching/caching treasury data
- [ ] XCH price integration

### Milestone 4: BigPulp's Take
- [ ] NFT ID input component
- [ ] Analysis display component
- [ ] Load and parse sentences.json

### Milestone 5: Wojak Generator (Basic)
- [ ] Layer selection UI
- [ ] Canvas/preview component
- [ ] Basic layer stacking

### Milestone 6: Orange Game
- [ ] Game canvas component
- [ ] Touch/tap physics
- [ ] Score tracking

### Milestone 7: Production Polish
- [ ] Error handling throughout
- [ ] Loading states
- [ ] Offline support (PWA)
- [ ] Performance optimization
- [ ] Deploy to production

---

## Non-Functional Requirements

### Performance
- Initial load < 3 seconds on 4G
- Gallery scroll at 60fps
- Images lazy-loaded with placeholders

### Accessibility
- Touch targets minimum 44px
- Semantic HTML
- Screen reader compatible

### Security
- No hardcoded API keys
- Environment variables for secrets
- Parse ACLs for user data

---

## File Naming Conventions

```
src/
├── pages/
│   └── GalleryPage.tsx        # PascalCase for components
├── components/
│   └── NftCard.tsx
├── services/
│   └── mintgardenApi.ts       # camelCase for utilities
├── utils/
│   └── traitFrequencies.ts
├── hooks/
│   └── useNftData.ts          # useX for hooks
└── contexts/
    └── AppContext.tsx
```

---

## Git Workflow

- **Main branch**: `main` (protected, production)
- **Development branch**: `dev`
- **Feature branches**: `feature/gallery`, `feature/treasury`, etc.
- **Commit style**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`)

---

## Success Criteria

MVP is complete when:
1. App loads on mobile browser (iOS Safari, Android Chrome)
2. User can browse all 4200 NFTs in Gallery
3. User can see Treasury holdings and value
4. User can enter NFT ID and see BigPulp's Take
5. User can create a basic Wojak preview
6. User can play Orange Juggle game
7. No critical errors in production

---

## Future Roadmap (Post-MVP)

- **v2**: Minting custom Wojaks on Chia, Tangify AI, wallet connection
- **v2**: Full BigPulp Q&A tree, rare combos explorer
- **v2**: Game leaderboards with prizes
- **v3**: Native iOS/Android apps via Capacitor
- **v3**: Social features, sharing, community gallery
