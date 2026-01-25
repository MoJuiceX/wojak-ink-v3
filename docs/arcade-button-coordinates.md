# Arcade Button Light Coordinates

Reference document for arcade cabinet button positions in `arcade-frame_fin.png`.

**Last Updated:** 2026-01-25  
**Source:** Photoshop measurements from `arcade-frame_fin.psd`  
**Frame Size:** 3840 × 2160 pixels

---

## Button Layout Overview

```
                                TWO GROVE GAMING
                    ┌─────────────────────────────────┐
                    │                                 │
     ┌───┐          │                                 │    ┌───┐ right1 (red)
     │25¢│          │                                 │    │ 🔴│ Y:562
     └───┘          │                                 │    └───┘
                    │                                 │    ┌───┐ right2 (orange)
     ┌───┐          │          GAME SCREEN            │    │ 🟠│ Y:887
     │ ⚫ │          │          (transparent)          │    └───┘
     └───┘          │                                 │    ┌───┐ right3 (orange)
                    │                                 │    │ 🟠│ Y:1188
  ┌───┐ left1       │                                 │    └───┘
  │ 🔴│ (red)       │                                 │    ┌───┐ right4 (blue)
  └───┘ Y:1154      │                                 │    │ 🔵│ Y:1508
                    │                                 │    └───┘
                    │                                 │    ┌───┐ right5 (green)
                    └─────────────────────────────────┘    │ 🟢│ Y:1753
                                                           └───┘
    ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
    │ 🔵│ │ 🟠│ │ 🔵│ │ 🩷│ │ 🔵│ │ 🩷│ │ 🟢│
    └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
    b1    b2    b3    b4    b5    b6    b7
    X:1107 1381  1660  1931  2199  2467  2747
                    (all at Y ≈ 1745)
```

---

## Complete Coordinate Table

### Left Panel (1 button)

| Button | Color | Hex Code | X (px) | Y (px) | Left % | Top % |
|--------|-------|----------|--------|--------|--------|-------|
| left1 | Red | `#ef4444` | 685 | 1154 | 17.84% | 53.43% |

### Bottom Row (7 buttons, left to right)

| Button | Color | Hex Code | X (px) | Y (px) | Left % | Top % |
|--------|-------|----------|--------|--------|--------|-------|
| bottom1 | Blue | `#3b82f6` | 1107 | 1748 | 28.83% | 80.93% |
| bottom2 | Orange | `#f97316` | 1381 | 1748 | 35.96% | 80.93% |
| bottom3 | Blue | `#3b82f6` | 1660 | 1745 | 43.23% | 80.79% |
| bottom4 | Pink | `#ec4899` | 1931 | 1746 | 50.29% | 80.83% |
| bottom5 | Blue | `#3b82f6` | 2199 | 1743 | 57.27% | 80.69% |
| bottom6 | Pink | `#ec4899` | 2467 | 1744 | 64.24% | 80.74% |
| bottom7 | Green | `#22c55e` | 2747 | 1742 | 71.54% | 80.65% |

### Right Panel (5 buttons, top to bottom)

| Button | Color | Hex Code | X (px) | Y (px) | Left % | Top % |
|--------|-------|----------|--------|--------|--------|-------|
| right1 | Red | `#ef4444` | 3148 | 562 | 81.98% | 26.02% |
| right2 | Orange | `#f97316` | 3144 | 887 | 81.88% | 41.06% |
| right3 | Orange | `#f97316` | 3154 | 1188 | 82.14% | 55.00% |
| right4 | Blue | `#3b82f6` | 3150 | 1508 | 82.03% | 69.81% |
| right5 | Green | `#22c55e` | 3145 | 1753 | 81.90% | 81.16% |

---

## Color Reference

| Color | Hex Code | Tailwind | Buttons |
|-------|----------|----------|---------|
| Blue | `#3b82f6` | blue-500 | bottom1, bottom3, bottom5, right4 |
| Orange | `#f97316` | orange-500 | bottom2, right2, right3 |
| Pink | `#ec4899` | pink-500 | bottom4, bottom6 |
| Green | `#22c55e` | green-500 | bottom7, right5 |
| Red | `#ef4444` | red-500 | left1, right1 |

---

## Implementation

These coordinates are used in:
- `src/components/ArcadeButtonLights.tsx` - `BUTTON_POSITIONS` constant

### Percentage Calculation

```
left% = (X pixels / 3840) × 100
top%  = (Y pixels / 2160) × 100
```

### CSS Usage

The component uses CSS custom properties:
```css
.arcade-glow {
  left: var(--glow-left);
  top: var(--glow-top);
  --glow-color: [button color];
}
```

---

## Frame Reference Points

| Element | X (px) | Y (px) | Left % | Top % |
|---------|--------|--------|--------|-------|
| Screen top-left | 960 | 540 | 25% | 25% |
| Screen bottom-right | 2880 | 1620 | 75% | 75% |
| Screen center | 1920 | 1080 | 50% | 50% |

---

## Notes

1. **Zoom Factor:** The arcade frame is displayed at 1.35x zoom (`--arcade-zoom: 1.35` in ArcadeFrame.css), which crops outer edges
2. **Glow Effect:** Each button has a radial glow effect that extends beyond the button center
3. **Animation:** Buttons animate via CSS classes applied by pattern names (e.g., `.pattern-breathe`, `.pattern-flash`)
4. **Mobile:** Arcade lights are hidden on mobile devices (arcade frame not shown)
