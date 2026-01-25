---
created: 2026-01-25T11:49
title: Move arcade frame buttons up to fit frame (desktop)
area: ui
files:
  - src/components/ArcadeFrame.tsx:83-105
  - src/components/ArcadeFrame.css:227-240
---

## Problem

On desktop, the three arcade frame buttons (?, mute, close) have been moved down and no longer fit properly within the arcade frame. These buttons are positioned on the left side of the cabinet, under the red light:

1. **Help button** (`arcade-frame-btn-help`) - currently at `top: 67%`
2. **Mute button** (`arcade-frame-btn-mute`) - currently at `top: 76%`
3. **Close button** (`arcade-frame-btn-close`) - currently at `top: 85%`

The buttons need to move up to properly align with the arcade frame PNG overlay. This is a desktop-only issue - mobile hides these buttons entirely.

## Solution

Adjust the `top` percentage values in `ArcadeFrame.css` for:
- `.arcade-frame-btn-help`
- `.arcade-frame-btn-mute`
- `.arcade-frame-btn-close`

Reduce the top percentages so buttons fit within the left side panel area of the arcade frame PNG. Test with devtools open to ensure proper positioning in all viewport scenarios.
