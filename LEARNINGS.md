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

<!-- Add new learnings above this line -->
