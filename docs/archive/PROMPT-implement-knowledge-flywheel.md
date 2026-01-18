# PROMPT: Implement Knowledge Flywheel System v2.0

## Your Task

Read `KNOWLEDGE-FLYWHEEL-SYSTEM.md` and implement the professional knowledge management system for this project. This upgrades our current flywheel to prevent bloat and ensure valuable learnings are properly consolidated.

---

## Step 1: Create Directory Structure

```bash
mkdir -p .claude/patterns
mkdir -p .claude/rules
mkdir -p docs/adr
mkdir -p docs/archive
```

---

## Step 2: Update .gitignore

Add this line to `.gitignore`:
```
.claude/CLAUDE.local.md
```

---

## Step 3: Create Initial Pattern Files

Create these files with headers only (we'll populate as we consolidate):

### `.claude/patterns/api-patterns.md`
```markdown
# API Patterns

<!-- Last updated: [TODAY'S DATE] -->
<!-- Source: Consolidated from LEARNINGS.md -->

## Authentication
[To be consolidated from learnings]

## Database (D1)
[To be consolidated from learnings]

## Error Handling
[To be consolidated from learnings]

## Common Gotchas
[To be consolidated from learnings]
```

### `.claude/patterns/ui-patterns.md`
```markdown
# UI Patterns

<!-- Last updated: [TODAY'S DATE] -->

## Animation Patterns
[To be consolidated from learnings]

## Component Patterns
[To be consolidated from learnings]

## State Management
[To be consolidated from learnings]
```

### `.claude/patterns/database-patterns.md`
```markdown
# Database Patterns (Cloudflare D1)

<!-- Last updated: [TODAY'S DATE] -->

## Schema Conventions
[To be consolidated from learnings]

## Query Patterns
[To be consolidated from learnings]

## Migration Patterns
[To be consolidated from learnings]
```

### `.claude/patterns/deployment-patterns.md`
```markdown
# Deployment Patterns (Cloudflare)

<!-- Last updated: [TODAY'S DATE] -->

## Build & Deploy
[To be consolidated from learnings]

## Environment Configuration
[To be consolidated from learnings]

## Troubleshooting
[To be consolidated from learnings]
```

---

## Step 4: Create ADR Template

### `docs/adr/template.md`
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
- [Benefit]

### Negative
- [Trade-off]

## References
- [Links to related docs/discussions]
```

---

## Step 5: Create First ADRs from Existing Decisions

Based on the project, create these ADRs:

### `docs/adr/0001-cloudflare-d1-database.md`
Document the decision to use Cloudflare D1 for user data.

### `docs/adr/0002-clerk-authentication.md`
Document the decision to use Clerk for authentication.

### `docs/adr/0003-server-side-currency.md`
Document the decision to move currency from localStorage to server (FIX-20).

---

## Step 6: Refactor CLAUDE.md to Lean Format

**CRITICAL**: CLAUDE.md must be under 200 lines. It should contain:
1. Quick commands (build, dev, deploy, migrate)
2. 5-line architecture overview
3. Key conventions (naming, file organization)
4. Pointers to detailed docs
5. Critical rules only (permanent, universal)
6. Context management instructions

**Remove** from CLAUDE.md:
- Detailed explanations (move to pattern files)
- Specific bug fixes (keep in LEARNINGS.md)
- Implementation details (move to ARCHITECTURE.md)

Use the structure in `KNOWLEDGE-FLYWHEEL-SYSTEM.md` as your template.

---

## Step 7: Update LEARNINGS.md Format

Add these headers to the top of LEARNINGS.md:
```markdown
# Learnings Log

<!-- Last consolidated: [TODAY'S DATE] -->
<!-- Next review: [DATE + 7 DAYS] -->

## Format Guide
Each entry: `### [DATE] [CATEGORY] Title`
Categories: BUG, PATTERN, GOTCHA, API, PERF, DECISION
Status: ACTIVE | STALE | ARCHIVED

---

## Active Learnings
```

Then categorize existing entries and add `**Status**: ACTIVE` to each.

---

## Step 8: Initial Consolidation

Review existing LEARNINGS.md entries and:

1. **Group related learnings** into appropriate pattern files
2. **Archive old entries** that are no longer relevant
3. **Promote universal rules** to CLAUDE.md "Critical Rules" section

For each consolidation:
- Add the pattern to the appropriate `.claude/patterns/*.md` file
- Mark the original learning as `**Status**: ARCHIVED - Consolidated to [pattern file]`

---

## Step 9: Add Knowledge Management Section to CLAUDE.md

Add this section to CLAUDE.md:

```markdown
## Knowledge Management (Flywheel v2.0)

### At 7% Context
1. Stop and capture learnings to LEARNINGS.md
2. Format: `### [DATE] [CATEGORY] Title` with Problem/Solution/Files/Code/Status
3. Evaluate for immediate promotion to pattern files
4. Commit and push immediately

### Finding Information
- Quick reference: This file (CLAUDE.md)
- Patterns by domain: `.claude/patterns/`
- Raw learnings: `LEARNINGS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Decisions: `docs/adr/`

### The 3-3-3 Rule
- 3 mentions = Must document
- 3 months = Review for staleness
- 3 related items = Consolidate into pattern
```

---

## Step 10: Commit Everything

```bash
git add .
git commit -m "📚 Implement Knowledge Flywheel System v2.0

- Add .claude/patterns/ for consolidated knowledge
- Add .claude/rules/ for scoped context
- Add docs/adr/ for architecture decisions
- Add docs/archive/ for deprecated content
- Refactor CLAUDE.md to lean format (<200 lines)
- Update LEARNINGS.md with lifecycle tracking
- Create initial ADRs for existing decisions

This implements a professional knowledge management system that:
- Prevents bloat through 3-3-3 rule
- Consolidates learnings into searchable patterns
- Keeps CLAUDE.md lean with pointers to details
- Archives stale content automatically"

git push
```

---

## Verification Checklist

After implementation, verify:

- [ ] `.claude/patterns/` directory exists with 4 pattern files
- [ ] `.claude/rules/` directory exists
- [ ] `docs/adr/` directory exists with template + 3 initial ADRs
- [ ] `docs/archive/` directory exists
- [ ] `.gitignore` includes `.claude/CLAUDE.local.md`
- [ ] CLAUDE.md is under 200 lines (`wc -l CLAUDE.md`)
- [ ] CLAUDE.md has "Finding Information" section with pointers
- [ ] LEARNINGS.md has consolidation date headers
- [ ] All existing learnings have Status field

---

## Ongoing Maintenance (Document This)

Add a reminder to capture these maintenance tasks:

**Weekly (5 min)**:
- Review new LEARNINGS.md entries
- Consolidate if 3+ related items exist
- Update "Last consolidated" date

**Monthly (30 min)**:
- Archive stale entries (90+ days unused)
- Audit CLAUDE.md line count
- Review pattern files for relevance

**At 7% Context**:
- Capture learnings before compression
- Commit and push immediately
- Note: This happens automatically per CLAUDE.md instructions
