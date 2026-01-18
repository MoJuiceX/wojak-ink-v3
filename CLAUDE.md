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
BigPulp AI uses Claude API. Games are React-based mini-games with leaderboards.
59,810 lines of code, 6 pages, 6 mini-games, 70+ components, 4,200 NFTs.

**Live site**: https://wojak.ink

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
| API patterns, rate limits | `.claude/patterns/api-patterns.md` |
| UI/animation patterns | `.claude/patterns/ui-patterns.md` |
| Database/D1 patterns | `.claude/patterns/database-patterns.md` |
| Deployment/Cloudflare | `.claude/patterns/deployment-patterns.md` |
| Architecture decisions | `docs/adr/` |
| Raw learnings | `LEARNINGS.md` |

## Critical Rules (Permanent)
1. **Never trust client for currency** - all mutations through API
2. **Clear Vite cache when hooks break** - `rm -rf node_modules/.vite`
3. **D1 uses batch()** for atomic transactions (no RETURNING clause)
4. **Clerk JWT** - user_id is in `sub` claim, tokens expire 60s
5. **SpaceScan rate limit** - 1 req/20s, 30s backoff on 429

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

### At 7% Context
1. **Stop and capture** learnings to LEARNINGS.md
2. Format: `### [DATE] [CATEGORY] Title` with Problem/Solution/Files/Code/Status
3. Evaluate for immediate promotion to pattern files
4. Commit and push immediately

### The 3-3-3 Rule
- **3 mentions** = Must document
- **3 months** = Review for staleness
- **3 related items** = Consolidate into pattern

### Capture Protocol
```markdown
### [YYYY-MM-DD] [CATEGORY] Brief Title
**Problem**: What was the issue?
**Solution**: How was it solved?
**Files**: Affected file paths with line numbers
**Code**: Key code snippet (if applicable)
**Status**: ACTIVE
```
Categories: BUG, PATTERN, GOTCHA, API, PERF, DECISION

### Promotion Criteria
| Signal | Action |
|--------|--------|
| Used in 3+ sessions | → Pattern file |
| Applies across features | → CLAUDE.md pointer |
| Fundamental principle | → Critical Rules |
| Major decision | → ADR in /docs/adr/ |

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
| `src/services/tradeValuesService.ts` | Trade data + collection stats |
| `src/services/marketApi.ts` | Market listings |
| `src/services/bigpulpService.ts` | BigPulp intelligence |
| `src/services/salesDatabank.ts` | Sales history, CAT fixes |
| `src/services/historicalPriceService.ts` | XCH/USD, token rates |
| `vite.config.ts` | Dev proxies for CORS |

## Features
1. **Gallery** - Browse 4200 NFTs, filter by attributes
2. **Treasury** - Live wallet data, token balances
3. **BigPulp Intelligence** - Stats, top sales, heatmap
4. **Wojak Generator** - Layer selection, preview
5. **Media** - Music videos, floating player
6. **Games** - Mini-games with leaderboards

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
