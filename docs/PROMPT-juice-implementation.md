# Prompt: Memory Match Juice Implementation

Copy and paste this prompt to Claude CLI:

---

## Implementation Prompt

```
I need you to implement juice enhancements for my Memory Match game step by step.

**Reference Documents:**
- Implementation guide: `docs/MEMORY-MATCH-JUICE-IMPLEMENTATION.md`
- Progress checklist: `docs/MEMORY-MATCH-JUICE-CHECKLIST.md`

**Instructions:**

1. Read the full implementation guide first to understand all 27 enhancements
2. Implement ONE enhancement at a time, in order (1 through 27)
3. After completing each enhancement:
   - Test that it works
   - Update the checklist by changing `[ ]` to `[x]`
   - Fill in the "File(s) Modified" and "Notes" columns in the table
   - Update the "Completed" count and "Progress" percentage at the bottom
4. Do NOT skip ahead or implement multiple at once
5. If an enhancement requires new audio files that don't exist, note it in the checklist and move on

**Start with Enhancement #1: Mismatch sound**

Show me your plan for implementing it, then implement it.
```

---

## Audit Prompt

Use this prompt to have Claude CLI audit what's been implemented:

```
Audit the Memory Match juice implementation progress.

1. Read `docs/MEMORY-MATCH-JUICE-CHECKLIST.md` to see what's marked as complete
2. For each item marked `[x]`, verify the implementation actually exists in the codebase
3. Report:
   - Which enhancements are truly implemented and working
   - Which are marked complete but missing or broken
   - Which are not yet implemented
4. Update the checklist to reflect actual status
```

---

## Resume Prompt

Use this if Claude CLI stopped partway through:

```
Continue implementing Memory Match juice enhancements.

1. Read `docs/MEMORY-MATCH-JUICE-CHECKLIST.md` to see current progress
2. Find the first unchecked item `[ ]`
3. Implement that enhancement following `docs/MEMORY-MATCH-JUICE-IMPLEMENTATION.md`
4. Update the checklist when done
5. Continue to the next unchecked item
```

---

## Single Enhancement Prompt

Use this to implement a specific enhancement:

```
Implement Memory Match juice enhancement #[NUMBER]: [TITLE]

Follow the implementation details in `docs/MEMORY-MATCH-JUICE-IMPLEMENTATION.md` section for this enhancement.

After implementing:
1. Test it works
2. Update `docs/MEMORY-MATCH-JUICE-CHECKLIST.md` to mark it complete
3. Fill in the notes table with files modified
```

---
