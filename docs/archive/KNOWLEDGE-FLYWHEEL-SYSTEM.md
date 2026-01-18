# Knowledge Flywheel System v2.0

## For Claude CLI Implementation at wojak.ink

---

## The Problem We're Solving

1. **Context Compression** - When conversations grow long, details are lost forever
2. **Knowledge Bloat** - LEARNINGS.md grows infinitely, CLAUDE.md becomes too large
3. **Stale Information** - Old fixes and patterns become irrelevant but never get removed
4. **Repeated Explanations** - Same things get explained multiple times across sessions
5. **No Consolidation** - Raw learnings never get synthesized into actionable patterns

---

## The Professional Solution: 4-Stage Flywheel

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. CAPTURE (Automatic @ 7% context)                       │
│   └── Raw learnings → LEARNINGS.md (append-only)            │
│                         │                                   │
│                         ▼                                   │
│   2. CONSOLIDATE (Weekly)                                   │
│   └── Merge related items → .claude/patterns/*.md           │
│                         │                                   │
│                         ▼                                   │
│   3. PRUNE (Monthly)                                        │
│   └── Remove stale, archive deprecated → /docs/archive/     │
│                         │                                   │
│                         ▼                                   │
│   4. PROMOTE (When proven)                                  │
│   └── Principles + pointers → CLAUDE.md                     │
│                         │                                   │
└─────────────────────────┴───────────────────────────────────┘
                          │
                          ▼
                 Future sessions benefit
```

---

## File Structure

```
wojak-ink/
├── CLAUDE.md                      # LEAN: <200 lines, commands + conventions + POINTERS
├── LEARNINGS.md                   # Raw capture, dated, append-only
│
├── .claude/
│   ├── CLAUDE.local.md           # Personal preferences (gitignored)
│   ├── patterns/                  # Tier 2: Consolidated patterns
│   │   ├── api-patterns.md       # API-related learnings
│   │   ├── ui-patterns.md        # Frontend patterns
│   │   ├── database-patterns.md  # D1/database learnings
│   │   └── deployment-patterns.md # Cloudflare deployment learnings
│   └── rules/                     # Scoped rules by file pattern
│       ├── components.md         # For **/components/**
│       ├── api-routes.md         # For **/functions/api/**
│       └── tests.md              # For **/*.test.ts
│
├── docs/
│   ├── ARCHITECTURE.md           # Full architecture details
│   ├── adr/                       # Architecture Decision Records
│   │   ├── 0001-use-cloudflare-d1.md
│   │   ├── 0002-clerk-authentication.md
│   │   └── template.md
│   └── archive/                   # Deprecated but preserved
│       └── old-learnings-2024.md
│
└── .gitignore                     # Include: .claude/CLAUDE.local.md
```

---

## CLAUDE.md Structure (Keep Under 200 Lines!)

```markdown
# Wojak.ink - Claude Context

## Quick Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Deploy: `npx wrangler pages deploy dist`
- D1 migrate: `npx wrangler d1 execute wojak-users --file=./functions/migrations/XXXX.sql`

## Architecture Overview (5 lines max)
React + Vite frontend, Cloudflare Pages hosting, D1 database, Clerk auth.
BigPulp AI uses Claude API. Games are React-based mini-games with leaderboards.

## Key Conventions
- Components: PascalCase, one per file
- Hooks: use* prefix, in /hooks folder
- API routes: /functions/api/*.ts
- State: TanStack Query for server, Zustand for client

## Current Focus
[Update this section with active work]

## Finding More Information
- Full architecture: `/docs/ARCHITECTURE.md`
- API patterns: `/.claude/patterns/api-patterns.md`
- UI patterns: `/.claude/patterns/ui-patterns.md`
- Database patterns: `/.claude/patterns/database-patterns.md`
- Decision history: `/docs/adr/`
- Raw learnings: `/LEARNINGS.md`

## Critical Rules (Permanent)
1. Never trust client for currency - all mutations through API
2. Always clear Vite cache when hooks break
3. D1 uses batch() for atomic transactions
4. Clerk JWT: user_id is in `sub` claim

## Context Management
When context reaches ~7%, capture learnings to LEARNINGS.md before compression.
Format: Date, Category, Specific details (error messages, file paths, code).
```

---

## LEARNINGS.md Structure

```markdown
# Learnings Log

<!-- Last consolidated: YYYY-MM-DD -->
<!-- Next review: YYYY-MM-DD -->

## Format Guide
Each entry: `### [DATE] [CATEGORY] Title`
Categories: BUG, PATTERN, GOTCHA, API, PERF, DECISION

---

## Active Learnings (Review Weekly)

### [2024-01-18] [BUG] Framer Motion AnimatePresence mode
**Problem**: NFTs jumping/scaling repeatedly on hero section
**Solution**: Use `mode="popLayout"` instead of `mode="wait"` for smoother transitions
**Files**: `src/components/landing/FloatingNFTs.tsx:91`
**Code**:
```tsx
<AnimatePresence mode="popLayout">
  <motion.img initial={{ opacity: 0, scale: 0.95 }} ... />
</AnimatePresence>
```
**Status**: ACTIVE

### [2024-01-18] [PATTERN] Separate animations for parent/child
**Problem**: Speech bubble moves with BigPulp (looks rigid)
**Solution**: Animate containers separately with different durations/delays
**Status**: ACTIVE

---

## Archived (Consolidated or Obsolete)

### [2024-01-10] [BUG] Old localStorage currency issue
**Status**: ARCHIVED - Replaced by server-side currency (FIX-20)
```

---

## Pattern File Structure (.claude/patterns/*.md)

```markdown
# API Patterns

<!-- Last updated: YYYY-MM-DD -->
<!-- Entries: X | Promoted from: X learnings -->

## Authentication
- All API routes require JWT verification via Clerk
- Extract user_id from `payload.sub`
- Use `verifyClerkJWT(token, env)` helper

## Database (D1)
- Use `env.DB.batch([...])` for atomic operations
- Always log transactions for audit trail
- Cache collection stats for 2 minutes

## Error Handling
- Return `{ error: string }` with appropriate status code
- Log errors with `console.error('Context:', error)`
- Never expose internal error details to client

## Common Gotchas
- D1 doesn't support `RETURNING *` - use separate SELECT
- MintGarden API rate limits at 60 req/min
- Clerk tokens expire after 60 seconds
```

---

## The 3-3-3 Rule

### 3 Mentions = Document
If you explain something 3 times across sessions, it MUST become a pattern.

### 3 Months = Review
Every learning gets a 90-day review. If not referenced, archive it.

### 3 Related = Consolidate
If you have 3+ learnings about the same topic, merge into a pattern file.

---

## Promotion Criteria

| Signal | Action |
|--------|--------|
| Used in 3+ sessions | Promote from LEARNINGS → Pattern file |
| Applies across features | Promote from Pattern → CLAUDE.md pointer |
| Fundamental principle | Add to CLAUDE.md "Critical Rules" |
| Major decision | Create ADR in /docs/adr/ |

---

## Demotion/Removal Criteria

| Signal | Action |
|--------|--------|
| Not referenced in 90 days | Flag with `[STALE]` |
| Contradicts newer learning | Archive immediately |
| Feature removed | Archive after cleanup |
| Only applies to one file | Move to inline comment |

---

## Scheduled Maintenance

### Weekly (5 minutes)
```
□ Review new LEARNINGS.md entries
□ Look for patterns (3+ related items)
□ Consolidate to pattern files if needed
□ Update "Last consolidated" date
```

### Monthly (30 minutes)
```
□ Audit LEARNINGS.md for [STALE] items
□ Archive entries older than 90 days if unused
□ Review pattern files for relevance
□ Check CLAUDE.md line count (< 200 target)
□ Update "Next review" date
```

### Quarterly (2 hours)
```
□ Full knowledge audit
□ ADR status review
□ Consolidate pattern files if too large
□ Remove deprecated patterns
□ Update ARCHITECTURE.md if needed
```

---

## Capture Protocol (At 7% Context)

When context reaches ~7%, Claude should:

1. **Stop current work** (acknowledge reaching limit)

2. **Capture to LEARNINGS.md**:
   ```markdown
   ### [YYYY-MM-DD] [CATEGORY] Brief Title
   **Problem**: What was the issue?
   **Solution**: How was it solved?
   **Files**: Affected file paths with line numbers
   **Code**: Key code snippet (if applicable)
   **Status**: ACTIVE
   ```

3. **Evaluate for immediate promotion**:
   - Is this a universal rule? → Add to CLAUDE.md
   - Is this a pattern? → Add to pattern file
   - Is this specific? → Keep in LEARNINGS.md

4. **Commit immediately**:
   ```bash
   git add LEARNINGS.md .claude/
   git commit -m "📚 Knowledge capture: [brief description]"
   git push
   ```

---

## ADR Template

```markdown
# ADR-XXXX: [Title]

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
**Date**: YYYY-MM-DD
**Author**: [Name]

## Context
[2-3 sentences: What prompted this decision?]

## Decision
[1-2 sentences: What did we decide?]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## References
- Related ADRs: [Links]
- Discussion: [Link to conversation/issue]
```

---

## Metrics to Track

| Metric | Target | Check |
|--------|--------|-------|
| CLAUDE.md lines | < 200 | `wc -l CLAUDE.md` |
| LEARNINGS.md entries (active) | < 50 | Review monthly |
| Pattern files | < 10 | Don't over-categorize |
| Stale entries (90+ days) | < 10% | Archive aggressively |
| Repeated explanations/week | < 3 | Indicates missing docs |

---

## Emergency Bloat Protocol

If CLAUDE.md exceeds 200 lines:

1. **Audit each line**: Does Claude NEED this, or can it FIND it?
2. **Move details to pattern files**: Keep only pointers in CLAUDE.md
3. **Archive old critical rules**: If not used in 6 months, archive
4. **Split if necessary**: Create CLAUDE-extended.md for reference

If LEARNINGS.md exceeds 100 active entries:

1. **Force consolidation**: Group into pattern files
2. **Archive aggressively**: Anything older than 60 days
3. **Review patterns**: Are we capturing too granularly?

---

## Implementation Checklist

- [ ] Create `.claude/patterns/` directory
- [ ] Create `.claude/rules/` directory
- [ ] Create `docs/adr/` directory
- [ ] Create `docs/archive/` directory
- [ ] Update CLAUDE.md to new lean format
- [ ] Add consolidation dates to LEARNINGS.md
- [ ] Set calendar reminder for weekly review
- [ ] Set calendar reminder for monthly audit
- [ ] Add `.claude/CLAUDE.local.md` to .gitignore

---

## Summary

**The Philosophy**: Tell Claude HOW to find information, not ALL the information.

**The Structure**:
- CLAUDE.md = Quick reference + pointers (< 200 lines)
- Pattern files = Consolidated knowledge by domain
- LEARNINGS.md = Raw capture with lifecycle
- ADRs = Major decisions with context

**The Rhythm**:
- Capture: Automatic at 7%
- Consolidate: Weekly
- Prune: Monthly
- Promote: When proven (3+ uses)

**The Result**: A self-improving knowledge base that gets more valuable over time while staying lean enough to fit in context windows.
