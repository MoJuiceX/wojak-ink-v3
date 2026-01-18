# Wojak.ink - Claude Context

> Keep this file under 200 lines. Details live in pattern files.

## Quick Commands
```bash
npm run dev -- --host           # Dev server (network accessible)
npm run build                   # Production build
npx wrangler pages deploy dist --project-name=wojak-ink  # Deploy
npx wrangler d1 execute wojak-users --file=./functions/migrations/XXX.sql
```

## Architecture Overview
React + Vite frontend, Cloudflare Pages hosting, D1 database, Clerk auth.
BigPulp AI uses Claude API. 12 canvas-based mini-games with global leaderboards.
60K+ lines of code, 6 main pages, 12 games, 70+ components, 4,200 NFTs.

**Live site**: https://wojak.ink | **13+ nested providers** in App.tsx

## Key Conventions
- Components: PascalCase, one per file
- Hooks: `use*` prefix, in `/hooks` folder
- API routes: `/functions/api/*.ts`
- State: TanStack Query for server, Zustand for client
- Use **"attributes"** not "traits"
- Always show **USD alongside XCH**

## Finding Information
| Topic | Location |
|-------|----------|
| **Game development** | `.claude/patterns/game-architecture.md` |
| API patterns, rate limits | `.claude/patterns/api-patterns.md` |
| UI/animation patterns | `.claude/patterns/ui-patterns.md` |
| Audio/haptics systems | `.claude/patterns/audio-haptics.md` |
| Database/D1 patterns | `.claude/patterns/database-patterns.md` |
| Deployment/Cloudflare | `.claude/patterns/deployment-patterns.md` |
| Architecture decisions | `docs/adr/` |

**Context Loading** - Load relevant patterns when working in:
- `src/pages/*Game*.tsx` → Read `game-architecture.md`
- `/functions/api/**` → Read `api-patterns.md`
- `/src/components/**` → Read `ui-patterns.md`
- `*.sql`, migrations → Read `database-patterns.md`

## Critical Rules (Permanent)
1. **[P0] Never trust client for currency** - all mutations through API
2. **[P0] Clear Vite cache when hooks break** - `rm -rf node_modules/.vite`
3. **[P0] D1 uses batch()** for atomic transactions (no RETURNING clause)
4. **[P0] Game navigation** - use `navigate('/games')` NOT `window.history.back()`
5. **[P1] Clerk JWT** - user_id is in `sub` claim, tokens expire 60s
6. **[P1] SpaceScan rate limit** - 1 req/20s, 30s backoff on 429

## Quick Wins (High-Impact Gotchas)
- Game CSS: Prefix classes with game initials (bp-, fo-, os-) to avoid conflicts
- `AnimatePresence mode="popLayout"` not `"wait"` for smooth transitions
- Game sounds: Check `soundEnabled` before `play*()` calls
- Score popups: `addScorePopup()` expects STRING not number - use template literal
- CSS z-index: game-over=500, leaderboard=700, modals=1000
- Leaderboard overlay: Click outside to close, use `e.stopPropagation()` on panel

## Development Workflow
**Everything stays local until explicitly told to push.**

1. Make changes locally
2. User tests on phone (http://192.168.x.x:port)
3. Iterate until satisfied
4. User says "push" → commit, push, deploy

**Do NOT**: Push/deploy without permission, auto-commit, create folders for "redesigns"

## Custom Skills
| Skill | Purpose |
|-------|---------|
| `/deploy` | Build + deploy to Cloudflare Pages |
| `/dev` | Start dev server with --host |
| `/sync-sales` | Debug sales data issues |
| `/add-token` | Add CAT token conversion rate |
| `/status` | System health check |
| `/analyze [id]` | Quick NFT lookup |
| `/sync-docs` | Update README + PROJECT_DOC |

## Knowledge Management (Flywheel v2.0)

**Health check**: `.claude/scripts/knowledge-health.sh`

### Event-Driven Triggers (Not Calendar)
- **>30 active learnings** → Consolidate before adding more
- **CLAUDE.md >180 lines** → Audit and move to patterns
- **Starting new feature** → Review relevant pattern file
- **At 7% context** → Capture learnings immediately

### Capture Protocol
```markdown
### [YYYY-MM-DD] [CATEGORY] [P0-P2] Brief Title
**Problem**: What was the issue?
**Solution**: How was it solved?
**Files**: Affected file paths
**Status**: ACTIVE
```
Categories: BUG, PATTERN, GOTCHA, API, PERF, DECISION
Priority: P0=critical, P1=important, P2=nice-to-know

### The 3-3-3 Rule
- **3 mentions** = Must document
- **3 months** = Review for staleness
- **3 related items** = Consolidate into pattern

## Project Structure
```
src/
├── pages/           # Ionic pages
├── components/      # Reusable UI
├── services/        # API integrations
├── contexts/        # React Context
└── hooks/           # Custom hooks

public/assets/
├── nft-data/        # Metadata, rarity JSON
├── BigPulp/         # Analysis data
└── wojak-layers/    # Layer images

functions/api/       # Cloudflare Workers

.claude/
├── patterns/        # Consolidated knowledge
└── rules/           # Scoped rules by file pattern

docs/
├── adr/             # Architecture Decision Records
└── archive/         # Deprecated content
```

## Key Files
| File | Purpose |
|------|---------|
| `src/hooks/useGameSounds.ts` | Game audio effects hook |
| `src/hooks/data/useLeaderboard.ts` | Leaderboard data + submission |
| `src/components/media/games/` | GameEffects, ScorePopup, Leaderboard |
| `src/systems/audio/SoundManager.ts` | Howler.js audio wrapper |
| `src/systems/haptics/` | Haptic feedback system |
| `src/services/salesDatabank.ts` | Sales history, CAT fixes |
| `vite.config.ts` | Dev proxies, React deduplication |

## Games (12 total, all in src/pages/)
FlappyOrange, BlockPuzzle, CitrusDrop, OrangeSnake, BrickBreaker, WojakWhack,
OrangeStack, MemoryMatch, OrangePong, WojakRunner, OrangeJuggle, KnifeGame

**All games use**: `@ts-nocheck`, canvas rendering, useGameSounds, useGameHaptics, useLeaderboard, useGameEffects

## Common Issues Quick Reference
| Issue | Fix |
|-------|-----|
| Hook errors after HMR | `rm -rf node_modules/.vite` |
| Sales showing wrong XCH | Add token rate to `historicalPriceService.ts` |
| "No sales available" | Wait for auto-sync or run `syncDexieSales()` |
| NFT shows "Wojak #XXXX" | Use `getNftName()` with metadata |

See `.claude/patterns/api-patterns.md` for CAT token rates and full troubleshooting.

## Links
- **Live**: https://wojak.ink
- **GitHub**: https://github.com/MoJuiceX/wojak-ink-v3
- **Twitter**: https://twitter.com/MoJuiceX
