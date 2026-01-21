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
| **Economy system** | `.claude/patterns/economy-patterns.md` |
| **Implementation specs** | `claude-specs/README.md` (11 specs) |
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
- Currency, rewards, economy → Read `economy-patterns.md` + `claude-specs/11-SERVER-STATE-SPEC.md`

## Critical Rules (Permanent)
1. **[P0] Never trust client for currency** - all mutations through API with idempotency keys
2. **[P0] Clear Vite cache when hooks break** - `rm -rf node_modules/.vite`
3. **[P0] D1 uses batch()** for atomic transactions (no RETURNING clause)
4. **[P0] Game navigation** - use `navigate('/games')` NOT `window.history.back()`
5. **[P0] Economy is server-authoritative** - see `claude-specs/11-SERVER-STATE-SPEC.md`
6. **[P1] Clerk JWT** - user_id is in `sub` claim, tokens expire 60s
7. **[P1] SpaceScan rate limit** - 1 req/20s, 30s backoff on 429
8. **[P1] Cheaters get immediate permanent ban** - zero tolerance policy

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
| `/juice` | Add game juice (particles, shake, audio) |
| `/new-game` | Create new game from template |
| `/juicer` | Juice research pipeline (add→playbook→games) |
| `/performance [GameName]` | Optimize game for mobile 60 FPS |

## Game Juice Libraries
Reusable code for game feel effects. Import from:
```typescript
import { spawnBurstParticles, createScreenShake, playTone } from '@/lib/juice';
import { clamp, randomInRange, lerpColor } from '@/lib/utils';
import { roundRect, createParallaxSystem } from '@/lib/canvas';
```

| Resource | Location |
|----------|----------|
| Juice libraries | `src/lib/juice/`, `src/lib/utils/`, `src/lib/canvas/` |
| Master playbook | `docs/game-juice-playbook.md` |
| Flappy guide | `docs/FLAPPY-ORANGE-JUICE-IMPLEMENTATION.md` |
| Testing checklist | `docs/testing/juice-testing-checklist.md` |
| Research patterns | `docs/research/retention-patterns.md`, `viral-patterns.md` |
| Game template | `templates/canvas-game-starter/` |
| Implementation tracker | `docs/juice-implementation-tracker.md` |
| Juicer workflow | `.skills/juicer/SKILL.md` |
| Performance optimizer | `skills/performance/SKILL.md` |
| Performance patterns | `skills/performance/references/patterns.md` |
| Full audit prompt | `docs/MOBILE-PERFORMANCE-AUDIT-PROMPT.md` |

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

## Games (15 total, all in src/pages/)
FlappyOrange, BlockPuzzle, CitrusDrop, OrangeSnake, BrickBreaker, WojakWhack,
OrangeStack, MemoryMatch, OrangePong, WojakRunner, OrangeJuggle, KnifeGame,
ColorReaction, Merge2048, OrangeWordle

**All games use**: `@ts-nocheck`, canvas rendering, useGameSounds, useGameHaptics, useLeaderboard, useGameEffects

**Game Tiers** (for rewards):
- **Easy** (5🍊): memory-match, color-reaction, orange-snake, citrus-drop, wojak-whack
- **Medium** (10🍊): orange-pong, merge-2048, block-puzzle, brick-breaker, orange-wordle
- **Hard** (15🍊): flappy-orange, wojak-runner, orange-stack, knife-game, orange-juggle

## Common Issues Quick Reference
| Issue | Fix |
|-------|-----|
| Hook errors after HMR | `rm -rf node_modules/.vite` |
| Sales showing wrong XCH | Add token rate to `historicalPriceService.ts` |
| "No sales available" | Wait for auto-sync or run `syncDexieSales()` |
| NFT shows "Wojak #XXXX" | Use `getNftName()` with metadata |

See `.claude/patterns/api-patterns.md` for CAT token rates and full troubleshooting.

## Economy System (Quick Reference)
**Currencies**: Oranges (🍊 soft) and Gems (💎 hard)
**Future crypto**: 10,000🍊 = 1 HOA (~$0.00143) | 1,500🍊 = 1💎

| Earning Source | Amount |
|----------------|--------|
| Starting balance | 100🍊 |
| Tutorial | 250🍊 |
| Wallet connect (NFT) | 500🍊 |
| Daily login (1-7) | 15→30→45→60→75→90→105🍊 (+3💎 on day 7) |
| Daily challenges | 30+50+70 = 150🍊 |
| Game rewards | Easy 5🍊, Medium 10🍊, Hard 15🍊 (+ bonuses) |

**Full spec**: `claude-specs/10-ECONOMY-MASTERPLAN-SPEC.md`
**Server implementation**: `claude-specs/11-SERVER-STATE-SPEC.md`

## Links
- **Live**: https://wojak.ink
- **GitHub**: https://github.com/MoJuiceX/wojak-ink-v3
- **Twitter**: https://twitter.com/MoJuiceX
