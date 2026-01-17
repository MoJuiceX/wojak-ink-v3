# BigPulp Navigation Prominence Fix

## The Problem
BigPulp is the **main character and flagship feature** of Wojak.ink, but it's currently buried as the 9th item in the navigation sidebar. Users may not even discover it!

## Current Navigation Order
1. Gallery
2. Generator
3. Games
4. Media
5. Leaderboard
6. Shop
7. Guild
8. Treasury
9. **BigPulp** ← Too far down!
10. Settings

---

## Solution: Elevate BigPulp

### New Navigation Order
1. Gallery
2. **BigPulp** ⬆️ (moved to #2!)
3. Generator
4. Games
5. Media
6. Leaderboard
7. Shop
8. Guild
9. Treasury
10. Settings

### Why This Order?
- **Gallery** = First, users explore the collection
- **BigPulp** = Second, they meet the main character/AI analyst
- **Generator** = Third, they create their own Wojak
- Rest follows logically

---

## Visual Enhancement for BigPulp Nav Item

BigPulp should stand out visually from other nav items:

### Desktop Sidebar
```css
/* Special styling for BigPulp nav item */
.nav-item.bigpulp {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.15) 0%,
    rgba(249, 115, 22, 0.05) 100%
  );
  border-radius: 12px;
  margin: 8px 12px;
}

/* Pulsing glow effect */
.nav-item.bigpulp::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, #F97316, #FFD700);
  opacity: 0;
  z-index: -1;
  animation: bigpulpGlow 3s ease-in-out infinite;
}

@keyframes bigpulpGlow {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.3; }
}

/* Icon animation */
.nav-item.bigpulp .nav-icon {
  animation: bigpulpBounce 2s ease-in-out infinite;
}

@keyframes bigpulpBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* "NEW" or "AI" badge */
.nav-item.bigpulp .nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  padding: 2px 6px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border-radius: 8px;
  font-size: 9px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Mobile Bottom Navigation
```css
/* BigPulp in mobile nav - center position with emphasis */
.mobile-nav-item.bigpulp {
  position: relative;
}

/* Elevated FAB-style on mobile */
.mobile-nav-item.bigpulp .nav-icon-wrapper {
  width: 56px;
  height: 56px;
  margin-top: -20px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 20px rgba(249, 115, 22, 0.4),
    0 0 30px rgba(249, 115, 22, 0.2);
  border: 3px solid var(--bg-primary);
}

.mobile-nav-item.bigpulp .nav-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* Pulse animation ring */
.mobile-nav-item.bigpulp .nav-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(249, 115, 22, 0.5);
  animation: pulseRing 2s ease-out infinite;
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
```

---

## Implementation

### 1. Update Navigation Config

```typescript
// src/config/navigation.ts
export const navItems = [
  { id: 'gallery', label: 'Gallery', icon: '🖼️', path: '/gallery' },
  { id: 'bigpulp', label: 'BigPulp', icon: '🍊', path: '/bigpulp', featured: true },
  { id: 'generator', label: 'Generator', icon: '🎨', path: '/generator' },
  { id: 'games', label: 'Games', icon: '🎮', path: '/games' },
  { id: 'media', label: 'Media', icon: '🎵', path: '/media' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
  { id: 'shop', label: 'Shop', icon: '🛒', path: '/shop' },
  { id: 'guild', label: 'Guild', icon: '⚔️', path: '/guild' },
  { id: 'treasury', label: 'Treasury', icon: '💰', path: '/treasury' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
];
```

### 2. Update Sidebar Component

```tsx
// In Sidebar.tsx or Navigation.tsx
{navItems.map((item) => (
  <NavLink
    key={item.id}
    to={item.path}
    className={({ isActive }) =>
      `nav-item ${item.featured ? 'bigpulp' : ''} ${isActive ? 'active' : ''}`
    }
  >
    <span className="nav-icon">{item.icon}</span>
    <span className="nav-label">{item.label}</span>
    {item.featured && <span className="nav-badge">AI</span>}
  </NavLink>
))}
```

### 3. Update Mobile Navigation

```tsx
// In MobileNav.tsx or TabBar.tsx
// Reorder to put BigPulp in center position
const mobileNavItems = [
  navItems.find(i => i.id === 'gallery'),
  navItems.find(i => i.id === 'games'),
  navItems.find(i => i.id === 'bigpulp'), // Center - featured
  navItems.find(i => i.id === 'media'),
  // Menu icon for more options
];

{mobileNavItems.map((item) => (
  <NavLink
    key={item.id}
    to={item.path}
    className={`mobile-nav-item ${item.featured ? 'bigpulp' : ''}`}
  >
    <div className={item.featured ? 'nav-icon-wrapper' : ''}>
      <span className="nav-icon">{item.icon}</span>
    </div>
    <span className="nav-label">{item.label}</span>
  </NavLink>
))}
```

---

## BigPulp Icon Options

Current icon might be a lightbulb 💡. Consider these alternatives:

| Icon | Meaning | Recommendation |
|------|---------|----------------|
| 🍊 | Orange (matches character) | ⭐ Best choice |
| 💡 | Intelligence/Ideas | Current |
| 🧠 | AI/Brain | Too generic |
| 🔮 | Magic/Prediction | Mystical feel |

**Recommendation:** Use 🍊 for BigPulp to match the character design.

---

## First-Time User Tooltip

Show a tooltip for new users highlighting BigPulp:

```tsx
const BigPulpTooltip = () => {
  const [hasSeenTooltip, setHasSeenTooltip] = useLocalStorage('bigpulp-tooltip', false);

  if (hasSeenTooltip) return null;

  return (
    <motion.div
      className="bigpulp-tooltip"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="tooltip-content">
        <span className="tooltip-icon">🍊</span>
        <div>
          <strong>Meet BigPulp!</strong>
          <p>Your AI-powered NFT analyst</p>
        </div>
      </div>
      <button onClick={() => setHasSeenTooltip(true)}>Got it</button>
    </motion.div>
  );
};
```

```css
.bigpulp-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 12px;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border: 1px solid rgba(249, 115, 22, 0.4);
  border-radius: 12px;
  padding: 12px 16px;
  white-space: nowrap;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.bigpulp-tooltip::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: #1a1a1a;
  border-left: 1px solid rgba(249, 115, 22, 0.4);
  border-bottom: 1px solid rgba(249, 115, 22, 0.4);
}
```

---

## Implementation Checklist

- [ ] Reorder navigation items (BigPulp to position 2)
- [ ] Add `featured: true` flag to BigPulp nav item
- [ ] Add special CSS styling for BigPulp nav item
- [ ] Add pulsing glow animation
- [ ] Add bouncing icon animation
- [ ] Add "AI" badge
- [ ] Update mobile nav with center BigPulp FAB
- [ ] Add first-time tooltip (optional)
- [ ] Change icon from 💡 to 🍊

---

## Files to Modify

1. `src/config/navigation.ts` - Reorder items, add featured flag
2. `src/components/layout/Sidebar.tsx` - Add special BigPulp styling
3. `src/components/layout/MobileNav.tsx` - Center FAB treatment
4. `src/styles/navigation.css` - All new styles

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/12-bigpulp-navigation-prominence.md and implement the BigPulp navigation prominence fix. Move BigPulp to position 2 in the navigation order, add special styling with pulsing glow and bouncing icon animation, add an "AI" badge, and on mobile make it a centered FAB-style button. Change the icon to 🍊 to match the character.
```
