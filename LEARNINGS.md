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

<!-- Add new learnings above this line -->
