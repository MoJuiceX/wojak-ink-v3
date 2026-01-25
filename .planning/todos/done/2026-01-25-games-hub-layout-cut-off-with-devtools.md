---
created: 2026-01-25T11:28
title: Fix GamesHub game cards cut off when DevTools open
area: ui
files:
  - src/pages/GamesHub.tsx
---

## Problem

On desktop, when the browser DevTools console is open, the top row of game cards (Brick by Brick, Memory Match, Flappy Orange) gets cut off under the title bar / header area. When DevTools is closed, everything aligns properly with the cards visible below the header.

This is likely a viewport height calculation issue - the layout uses `vh` or similar units that recalculate when the visible viewport shrinks (due to DevTools taking space), causing content to shift up or get clipped.

Screenshots provided show:
- **With console open**: Top game cards partially hidden under header
- **Without console**: Proper alignment, all cards visible

## Solution

TBD - Investigate the GamesHub layout CSS:
- Check for `vh` based calculations that might be affected by DevTools
- Consider using `dvh` (dynamic viewport height) or fixed pixel values
- Ensure the game grid has proper `padding-top` or `margin-top` that doesn't depend on viewport calculations
- May need to check if the header/title bar has `position: fixed` affecting the grid offset
