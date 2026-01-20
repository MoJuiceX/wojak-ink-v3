# /juicer - Juice Research Pipeline

Capture game feel learnings and propagate across all games.

## Commands

### `/juicer add`
Add new learning to the playbook:
1. Categorize (sound, haptic, visual, screen effect, combo, death, near-miss, etc.)
2. Format with template below
3. Add to `docs/game-juice-playbook.md`
4. Add to tracker: `docs/juice-implementation-tracker.md`

**Template:**
```markdown
### [Learning Title]
**Source:** [conversation/article/game]
**Priority:** P0/P1/P2

[Description]

```typescript
// Implementation
```

**Games:** [List or "All"]
```

### `/juicer status`
Show implementation progress:
1. Read `docs/juice-implementation-tracker.md`
2. Report: patterns total, games complete, priority queue

### `/juicer propagate`
Update game-specific guides from playbook:
1. Read new pattern from playbook
2. For each game, add implementation notes
3. Update tracker status

### `/juicer review`
Quality check the playbook:
- No duplicates
- Code examples tested
- Priorities accurate
- Tracker current

## Files
- Playbook: `docs/game-juice-playbook.md`
- Tracker: `docs/juice-implementation-tracker.md`
- Full workflow: `.skills/juicer/SKILL.md`
