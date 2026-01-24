# TASK: Implement Arcade Cabinet Frame Overlay for Game Lightbox

## Context

This is a **NEW FEATURE** - an arcade cabinet frame overlay that wraps around games when they open in the lightbox/modal. This is NOT related to share cards, score cards, or social sharing. This is purely a **visual enhancement for the game-playing experience**.

## What We're Building

When a user clicks to play a game on wojak.ink, the game opens in a lightbox/modal. Currently, the game just appears on a dark background. We want to **wrap the game in an arcade cabinet frame PNG** to make users feel like they're playing in a real arcade machine.

**Visual concept:**
```
┌──────────────────────────────────────────────────┐
│  [RED CABINET SIDE]  [GAME SCREEN]  [BUTTONS]    │
│                                                  │
│   The game iframe/canvas sits BEHIND the PNG     │
│   The PNG has a transparent "screen" area        │
│   where the game shows through                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Your Task

1. **Read the spec file:** `claude-specs/28-ARCADE-FRAME-OVERLAY.md`

2. **Implement Phase 1 (Standard Frame):**
   - Create the `ArcadeFrame` component
   - The arcade frame PNG already exists at `/public/img/arcade-frame.png`
   - Position the game screen area at the EXACT coordinates in the spec
   - Ensure `pointer-events: none` on the frame so users can interact with games

3. **Integrate with existing game lightbox:**
   - Find where games currently open in a modal/lightbox
   - Wrap the game content with the new `ArcadeFrame` component
   - The frame should appear around ALL games when they're opened

4. **Test:**
   - Open any game and verify the arcade frame appears around it
   - Verify you can still click/tap to play the game through the frame
   - Verify the game is positioned correctly within the "screen" area

## Important Files

- **Spec:** `claude-specs/28-ARCADE-FRAME-OVERLAY.md` (READ THIS FIRST)
- **PNG:** `/public/img/arcade-frame.png` (already exists, 1400×900px)
- **Create:** `/src/components/ArcadeFrame.tsx`
- **Create:** `/src/components/ArcadeFrame.css`
- **Modify:** The existing game lightbox/modal component

## DO NOT

- Do NOT work on share cards, score cards, or social sharing features
- Do NOT modify the arcade-frame.png image
- Do NOT change the screen area coordinates (they are precisely measured)
- Do NOT implement Phase 2 (wide frame) yet - that requires additional PNG assets

## Success Criteria

When complete, opening ANY game should show the arcade cabinet frame around it, like this:

```
User clicks "Play Game"
    ↓
Lightbox opens with dark overlay
    ↓
Game appears INSIDE the arcade cabinet frame PNG
    ↓
User can interact with the game normally
    ↓
Red cabinet side visible on left
    ↓
Colorful arcade buttons visible on right
    ↓
Metal bezel surrounds the game screen
```

## Start Here

1. First, read the full spec: `claude-specs/28-ARCADE-FRAME-OVERLAY.md`
2. Then, find the existing game lightbox component in the codebase
3. Create the ArcadeFrame component as specified
4. Integrate it with the lightbox
5. Test by opening a game
