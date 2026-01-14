# Session Learnings Log

> Append learnings here during sessions. Periodically merge into CLAUDE.md.

---

## Template

```markdown
### [Date] - [Topic]
**What we did:**
- ...

**What we learned:**
- ...

**Should add to CLAUDE.md:**
- [ ] New pattern/convention
- [ ] New gotcha/fix
- [ ] Updated file reference
```

---

## Recent Learnings

### 2026-01-14 - CAT Token Price Fixes
**What we did:**
- Fixed SPROUT, PIZZA, G4M token conversion rates
- Added `fixSuspiciousSales()` auto-correction
- Fixed NFT naming to use base character from metadata

**What we learned:**
- CAT tokens need manual rate lookup (Dexie doesn't provide rates)
- `fixSuspiciousSales()` must run AFTER sync, not before
- NFT names come from "Base" attribute in metadata

**Added to CLAUDE.md:** ✅ Done

---

### 2026-01-14 - Context Management System
**What we did:**
- Created automatic learnings capture system
- Added LEARNINGS.md for quick capture
- Added scripts for AI-powered CLAUDE.md updates
- Made pre-compression capture MANDATORY in CLAUDE.md

**What we learned:**
- Context compression loses detailed debugging steps
- Best time to capture learnings is BEFORE compression
- CLAUDE.md instructions need to be MANDATORY with specific triggers
- Self-referential instructions work: Claude reads CLAUDE.md and follows it

**Key insight:**
The article about "context as moat" applies directly to CLAUDE.md:
- Same model + better context = better results
- Context compounds over time
- Automated capture creates a flywheel effect

**Added to CLAUDE.md:** ✅ Done

---

### 2026-01-14 - Git Workflow: Branches Not Folders
**What happened:**
- Had two folders: `wojak-ink-mobile` and `wojak-ink-redesign`
- Both were clones of the same repo, causing confusion
- One folder was stale, the other had all the work

**What we learned:**
- NEVER create a new folder for a "redesign" or "version"
- Use git branches instead: `git checkout -b redesign`
- One folder, multiple branches = the git way
- Duplicate folders lead to stale code and confusion

**The fix:**
```bash
# For experiments/redesigns:
git checkout -b experiment-name    # Create branch
git checkout main                  # Go back to stable
git merge experiment-name          # Merge when ready
```

**Cleanup done:**
- Renamed `wojak-ink-redesign` → `wojak-ink`
- Deleted stale `wojak-ink-mobile`
- New project path: `/Users/abit_hex/wojak-ink`

**Added to CLAUDE.md:** ✅ Done

---

### 2026-01-14 - Context7 Plugin Installed
**What it does:**
- Fetches live, up-to-date documentation for any library
- Better than Claude's training data (which can be outdated)
- Works with Ionic, React, Vite, TanStack Query, etc.

**How to use:**
```
/docs ionic react          # Explicit lookup
/docs vite proxy           # Specific topic
"How do I use IonModal?"   # Natural question (auto-triggers)
```

**When it auto-triggers:**
- Questions about library APIs
- Setup questions for frameworks
- Code generation involving specific libraries
- Mentions of React, Ionic, Vite, Prisma, etc.

**Added to CLAUDE.md:** ✅ Done

---

### 2026-01-14 - Documentation Pipeline (/sync-docs)
**What we did:**
- Created `/sync-docs` skill for automated documentation
- Created expandable README.md with `<details>` sections
- Created PROJECT_DOCUMENTATION.md for LLM handoff
- Updated CLAUDE.md compression workflow to include /sync-docs

**The Pipeline:**
```
Session Work → Compression Trigger
       │
       ▼
  LEARNINGS.md → README.md + PROJECT_DOC.md → git push
```

**Files created:**
- `~/.claude/skills/sync-docs/SKILL.md` - Skill definition
- `/Users/abit_hex/wojak-ink/README.md` - Expandable GitHub readme
- `/Users/abit_hex/wojak-ink/PROJECT_DOCUMENTATION.md` - Comprehensive LLM doc

**How it works:**
1. Before compression, run `/sync-docs`
2. Skill updates README.md (Recent Updates section from LEARNINGS.md)
3. Skill updates PROJECT_DOCUMENTATION.md (full context)
4. Commits and pushes to GitHub

---

### 2026-01-14 - Full Codebase Exploration & Architecture Documentation
**What we did:**
- Deep exploration of entire codebase (59,810 lines)
- Documented API architecture, rate limits, caching strategy
- Created 2 new skills: `/status` and `/analyze`
- Updated CLAUDE.md with critical architecture knowledge

**Key discoveries:**
- 5 external APIs with different rate limits (SpaceScan is VERY strict: 1 req/20s)
- 3-tier fallback system: Dexie → localStorage → Parse.bot
- Smart rate limiter in `src/utils/rateLimiter.ts` (450 lines)
- Preload coordinator predicts user actions and preloads images

**Architecture patterns:**
- TanStack Query for volatile data (listings, prices)
- localStorage for persistent data (sales, favorites, settings)
- Zustand for global state (4 stores)
- 11 React Contexts for feature-specific state

**What NOT to add:**
- Repomix plugin (codebase is well-organized)
- PR review tools (solo developer)
- Complex sync debugging (uses localStorage, not IndexedDB)

**New skills added:**
- `/status` - Quick health check (sales count, cache status, sync time)
- `/analyze [id]` - NFT lookup (traits, sales, BigPulp commentary)

---

### 2026-01-14 - Custom Skills Created
**What we did:**
- Created 4 custom skills in `~/.claude/skills/`

**Skills:**
| Skill | Command | What it does |
|-------|---------|--------------|
| deploy | `/deploy` | Build + deploy to Cloudflare Pages |
| dev | `/dev` | Start dev server with --host for phone testing |
| sync-sales | `/sync-sales` | Debug sales data issues, run manual sync |
| add-token | `/add-token` | Add new CAT token conversion rate |

**Location:** `~/.claude/skills/[skill-name]/SKILL.md`

**Usage examples:**
```
/deploy           # Build and deploy to production
/deploy --check   # Build only (dry run)
/dev              # Start dev server
/sync-sales       # Diagnose sales issues
/add-token PIZZA  # Guide to add token rate
```

---

<!-- Add new learnings above this line -->
