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

<!-- Add new learnings above this line -->
