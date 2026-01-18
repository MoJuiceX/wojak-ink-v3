# Consolidation Template

Use this when merging 3+ related learnings into a pattern.

---

## Pattern: [Name]

**Derived from**: LEARN-XX, LEARN-YY, LEARN-ZZ
**Priority**: P0 | P1 | P2
**Last validated**: YYYY-MM-DD

### Core Insight
[One sentence that captures the essence]

### When It Applies
- [Trigger condition 1]
- [Trigger condition 2]

### The Pattern
```
[Actual code/approach/guidance]
```

### Anti-Patterns (What NOT to Do)
- [Common mistake 1]
- [Common mistake 2]

### Related
- Pattern: [link to related pattern]
- ADR: [link if architectural decision]

---

## Example Consolidation

### Pattern: Animation Separation

**Derived from**: LEARN-2024-01-15-001, LEARN-2024-01-16-003, LEARN-2024-01-18-002
**Priority**: P2
**Last validated**: 2024-01-18

### Core Insight
Parent and child elements should have independent animations with different timings for natural movement.

### When It Applies
- Floating elements with attached content (BigPulp + speech bubble)
- Container with decorative elements
- Any "object carrying another object" UI

### The Pattern
```tsx
// Parent floats slowly
<motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4 }}>
  <Character />

  {/* Child animates independently */}
  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, delay: 0.5 }}>
    <SpeechBubble />
  </motion.div>
</motion.div>
```

### Anti-Patterns
- Animating only the parent (child looks rigid)
- Same duration/timing for both (looks mechanical)
- Synchronized animations (uncanny valley)

### Related
- Pattern: AnimatePresence modes (ui-patterns.md)
