# Wojak Generator Redesign - Implementation Guide

## Overview
This folder contains a series of prompts to redesign the Wojak Generator page for better UX on both desktop and mobile. Each phase builds on the previous one.

## Current Problems
- **Desktop**: Massive empty space, tiny option thumbnails, poor visual hierarchy
- **Mobile**: Options too small to tap easily, cramped category tabs, poor layout

## Implementation Order

Execute these files **in order**, waiting for each to complete before moving to the next:

### Phase 1: Layout Foundation
```
01-PHASE1-layout-restructure.md
```
- Restructures the desktop and mobile layouts
- Creates proper grid systems for options
- Fixes the preview/options split

### Phase 2: Visual Feedback
```
02-PHASE2-selection-states.md
```
- Adds proper hover states
- Implements selected/active indicators
- Improves category tab styling

### Phase 3: Microinteractions
```
03-PHASE3-animations.md
```
- Adds smooth transitions
- Character preview feedback
- Delightful polish effects

---

## How to Use

1. Read this README first
2. Open `01-PHASE1-layout-restructure.md` and implement those changes
3. Test the layout on both desktop and mobile
4. Proceed to `02-PHASE2-selection-states.md`
5. Test visual feedback
6. Proceed to `03-PHASE3-animations.md`
7. Final testing

## Files to Modify
- `src/pages/Generator.tsx` (or similar - main generator page)
- `src/components/generator/*` (generator components)
- Related CSS/Tailwind styles

## Design Goals
- **Desktop**: 50/50 split with large 4-column option grid
- **Mobile**: Full-width preview + 3-column scrollable options
- **Selection**: Clear orange glow/border on selected items
- **Feedback**: Smooth, satisfying interactions

## Reference
Design based on industry best practices from:
- Bitmoji avatar customization
- Game UI Database character creators
- Modern NFT avatar builders
