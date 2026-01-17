# Wojak Generator Redesign - Master Implementation Guide

## Instructions for Claude CLI

You are redesigning the Wojak Generator page. This folder contains 3 phases of implementation.

**IMPORTANT**: Read and implement each phase file IN ORDER. Do not skip ahead.

---

## Step 1: Understand the Current Code

First, find and read the Generator component:
```
Search for files matching: *enerator*.tsx or *wojak*.tsx in src/pages/ and src/components/
```

Likely locations:
- `src/pages/Generator.tsx`
- `src/pages/WojakGenerator.tsx`
- `src/components/generator/`

---

## Step 2: Read Phase 1 - Layout Restructure

**File**: `WOJAK-GENERATOR-REDESIGN/01-PHASE1-layout-restructure.md`

This phase fixes:
- Desktop: Empty space, tiny thumbnails
- Mobile: Cramped options, poor layout

Implement all CSS and component structure changes in Phase 1.

**Test after Phase 1**:
- Desktop should have 45/55 split with 4-column grid
- Mobile should have full-width preview with 3-column grid

---

## Step 3: Read Phase 2 - Selection States

**File**: `WOJAK-GENERATOR-REDESIGN/02-PHASE2-selection-states.md`

This phase adds:
- Hover effects (scale, border)
- Selected state (orange glow, checkmark)
- Category tab active states

Implement all visual feedback in Phase 2.

**Test after Phase 2**:
- Hovering shows visual feedback
- Selected items have clear orange indicator

---

## Step 4: Read Phase 3 - Animations

**File**: `WOJAK-GENERATOR-REDESIGN/03-PHASE3-animations.md`

This phase adds:
- Selection pop animation
- Category switch stagger
- Character update bounce
- Button microinteractions

Implement animations using Framer Motion.

**Test after Phase 3**:
- Interactions feel smooth and satisfying
- No jank or performance issues

---

## Summary of Goals

| Aspect | Before | After |
|--------|--------|-------|
| Desktop layout | 35/65 split, tiny options | 45/55 split, large 4-col grid |
| Mobile layout | Cramped 3+2 grid | Clean 3-column grid |
| Option size | ~50px thumbnails | ~100px thumbnails |
| Selection | Subtle border | Orange glow + checkmark |
| Feedback | None | Hover scale, tap pop |
| Animations | Static | Smooth transitions |

---

## After All Phases Complete

Provide a summary of:
1. Files modified
2. Key changes made
3. Any issues encountered
4. Testing recommendations
