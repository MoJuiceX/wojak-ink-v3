# Navigation Cleanup - Mobile Bottom Nav & "More" Menu

## Priority: HIGH
The current bottom navigation has **9 icons** which is too cluttered for mobile. Industry standard is **5 items max**.

---

## Current State (Problem)

```
┌─────────────────────────────────────────────────────────────┐
│  📷   🎨   💡   🏛️   🎵   🏆   👥   🛒   ⚙️   👤          │
│  9 icons = Too many, cluttered, unprofessional              │
└─────────────────────────────────────────────────────────────┘
```

---

## Target State (Solution)

### Bottom Nav - 5 Primary Items Only

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    🖼️        🎨        🎮        🎵        ≡              │
│  Gallery  Generator  Games    Media     More               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Position | Icon | Label | Route | Description |
|----------|------|-------|-------|-------------|
| 1 | 🖼️ | Gallery | `/gallery` | Browse NFT collections |
| 2 | 🎨 | Generator | `/generator` | Create custom Wojaks (MAIN PRODUCT) |
| 3 | 🎮 | Games | `/games` | All mini-games (NEW ROUTE) |
| 4 | 🎵 | Media | `/media` | Music videos only (no games) |
| 5 | ≡ | More | (opens sheet) | Secondary navigation |

### "More" Slide-Up Menu - Secondary Items

```
┌─────────────────────────────────────────────────────────────┐
│                      ━━━━━                                  │  ← Drag handle
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🏆  Leaderboard                                     →    │
│       View rankings and compete                            │
│                                                             │
│   🛒  Shop                                             →    │
│       Spend your oranges and gems                          │
│                                                             │
│   👥  Guild                                            →    │
│       Join or create a guild                               │
│                                                             │
│   💰  Treasury                                         →    │
│       Community wallet                                     │
│                                                             │
│   ⚙️  Settings                                         →    │
│       Preferences and options                              │
│                                                             │
│   👤  Account                                          →    │
│       Your profile                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1: Create New Games Route

Currently games are under `/media/games/*`. We need a dedicated `/games` route.

**Create new file: `src/pages/GamesHub.tsx`**

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MINI_GAMES } from '@/config/games';
import './GamesHub.css';

const GamesHub: React.FC = () => {
  const navigate = useNavigate();

  const handleGameClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="games-hub">
      <header className="games-hub__header">
        <h1>Mini Games</h1>
        <p>Play, compete, and earn rewards!</p>
      </header>

      <div className="games-hub__grid">
        {MINI_GAMES.map((game) => (
          <button
            key={game.id}
            className="game-card"
            onClick={() => handleGameClick(game.route)}
            style={{ '--accent': game.accentColor } as React.CSSProperties}
          >
            <span className="game-card__emoji">{game.emoji}</span>
            <span className="game-card__name">{game.name}</span>
            <span className="game-card__difficulty">{game.difficulty}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GamesHub;
```

**Add route in router config:**
```tsx
{ path: '/games', element: <GamesHub /> }
```

---

### Task 2: Update Media Hub (Remove Games)

The Media Hub (`/media`) should now only show music and videos, NOT games.

**File to modify: `src/pages/MediaHub.tsx` (or similar)**

Remove the "Mini Games" section entirely from this page. Keep only:
- Music Videos
- Any other media content

---

### Task 3: Create "More" Menu Component

**Create new file: `src/components/navigation/MoreMenu.tsx`**

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  trophy,
  cart,
  people,
  wallet,
  settings,
  person
} from 'ionicons/icons';
import './MoreMenu.css';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: trophy,
    label: 'Leaderboard',
    description: 'View rankings and compete',
    route: '/leaderboard'
  },
  {
    icon: cart,
    label: 'Shop',
    description: 'Spend your oranges and gems',
    route: '/shop'
  },
  {
    icon: people,
    label: 'Guild',
    description: 'Join or create a guild',
    route: '/guild'
  },
  {
    icon: wallet,
    label: 'Treasury',
    description: 'Community wallet',
    route: '/treasury'
  },
  {
    icon: settings,
    label: 'Settings',
    description: 'Preferences and options',
    route: '/settings'
  },
  {
    icon: person,
    label: 'Account',
    description: 'Your profile',
    route: '/account'
  },
];

export const MoreMenu: React.FC<MoreMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleItemClick = (route: string) => {
    navigate(route);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="more-menu-backdrop" onClick={handleBackdropClick}>
      <div className={`more-menu ${isOpen ? 'more-menu--open' : ''}`}>
        {/* Drag handle */}
        <div className="more-menu__handle">
          <div className="more-menu__handle-bar" />
        </div>

        {/* Menu items */}
        <nav className="more-menu__nav">
          {menuItems.map((item) => (
            <button
              key={item.route}
              className="more-menu__item"
              onClick={() => handleItemClick(item.route)}
            >
              <div className="more-menu__item-icon">
                <IonIcon icon={item.icon} />
              </div>
              <div className="more-menu__item-text">
                <span className="more-menu__item-label">{item.label}</span>
                <span className="more-menu__item-desc">{item.description}</span>
              </div>
              <div className="more-menu__item-arrow">→</div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MoreMenu;
```

**Create CSS file: `src/components/navigation/MoreMenu.css`**

```css
/* ============================================
   MORE MENU - Slide-up sheet
   ============================================ */

.more-menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
  opacity: 0;
  animation: fadeIn 0.2s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

.more-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg,
    rgba(30, 20, 10, 0.98) 0%,
    rgba(20, 15, 8, 0.99) 100%
  );
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  border-top: 1px solid rgba(255, 107, 0, 0.3);
  padding: 12px 16px 32px;
  z-index: 9999;
  transform: translateY(100%);
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  max-height: 70vh;
  overflow-y: auto;
}

@keyframes slideUp {
  to { transform: translateY(0); }
}

/* Drag handle */
.more-menu__handle {
  display: flex;
  justify-content: center;
  padding: 8px 0 16px;
}

.more-menu__handle-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

/* Navigation list */
.more-menu__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Menu item */
.more-menu__item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.more-menu__item:hover {
  background: rgba(255, 107, 0, 0.1);
  border-color: rgba(255, 107, 0, 0.3);
}

.more-menu__item:active {
  transform: scale(0.98);
}

.more-menu__item-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 0, 0.15);
  border-radius: 12px;
  font-size: 22px;
  color: #ff6b00;
}

.more-menu__item-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.more-menu__item-label {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.more-menu__item-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.more-menu__item-arrow {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.3);
}

/* Safe area for bottom notch */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .more-menu {
    padding-bottom: calc(32px + env(safe-area-inset-bottom));
  }
}
```

---

### Task 4: Update Bottom Navigation Component

**Find and modify the bottom navigation component** (likely in `src/components/navigation/` or `src/components/layout/`)

**Updated structure:**

```tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import {
  images,       // Gallery
  colorPalette, // Generator
  gameController, // Games
  musicalNotes, // Media
  menu          // More
} from 'ionicons/icons';
import { MoreMenu } from './MoreMenu';
import './BottomNav.css';

const navItems = [
  { icon: images, label: 'Gallery', route: '/gallery' },
  { icon: colorPalette, label: 'Generator', route: '/generator' },
  { icon: gameController, label: 'Games', route: '/games' },
  { icon: musicalNotes, label: 'Media', route: '/media' },
  { icon: menu, label: 'More', route: null }, // null = opens menu
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleNavClick = (route: string | null) => {
    if (route === null) {
      setIsMoreMenuOpen(true);
    } else {
      navigate(route);
    }
  };

  const isActive = (route: string | null) => {
    if (route === null) return false;
    return location.pathname.startsWith(route);
  };

  return (
    <>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`bottom-nav__item ${isActive(item.route) ? 'bottom-nav__item--active' : ''}`}
            onClick={() => handleNavClick(item.route)}
          >
            <IonIcon icon={item.icon} className="bottom-nav__icon" />
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>

      <MoreMenu
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
      />
    </>
  );
};

export default BottomNav;
```

**CSS for Bottom Nav: `BottomNav.css`**

```css
/* ============================================
   BOTTOM NAV - 5 items, clean and minimal
   ============================================ */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  background: linear-gradient(180deg,
    rgba(20, 15, 8, 0.95) 0%,
    rgba(15, 10, 5, 0.98) 100%
  );
  border-top: 1px solid rgba(255, 107, 0, 0.2);
  padding: 0 8px;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

/* Safe area for bottom notch */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    height: calc(64px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 64px;
}

.bottom-nav__item:active {
  transform: scale(0.92);
}

.bottom-nav__icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;
}

.bottom-nav__label {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.2s ease;
}

/* Active state */
.bottom-nav__item--active .bottom-nav__icon {
  color: #ff6b00;
}

.bottom-nav__item--active .bottom-nav__label {
  color: #ff6b00;
  font-weight: 600;
}

/* Hover state (desktop) */
@media (hover: hover) {
  .bottom-nav__item:hover .bottom-nav__icon {
    color: rgba(255, 255, 255, 0.8);
  }

  .bottom-nav__item:hover .bottom-nav__label {
    color: rgba(255, 255, 255, 0.8);
  }

  .bottom-nav__item--active:hover .bottom-nav__icon,
  .bottom-nav__item--active:hover .bottom-nav__label {
    color: #ff8533;
  }
}
```

---

### Task 5: Update Sidebar Navigation (Desktop)

The sidebar (visible on desktop) should match the same hierarchy.

**Primary items (always visible):**
- Gallery
- Generator
- Games
- Media

**Secondary items (in collapsible section or at bottom):**
- Leaderboard
- Shop
- Guild
- Treasury
- Settings
- Account

---

## Summary of Changes

| Change | Files to Create/Modify |
|--------|----------------------|
| New Games route | `src/pages/GamesHub.tsx`, `src/pages/GamesHub.css`, router config |
| Update Media Hub | Remove games section from MediaHub |
| More Menu component | `src/components/navigation/MoreMenu.tsx`, `MoreMenu.css` |
| Update Bottom Nav | `src/components/navigation/BottomNav.tsx`, `BottomNav.css` |
| Update Sidebar | `src/components/navigation/Sidebar.tsx` |
| Update routes | Router configuration file |

---

## Navigation Hierarchy Summary

```
PRIMARY (Bottom Nav & Sidebar top):
├── Gallery      /gallery       Browse NFTs
├── Generator    /generator     Create Wojaks (MAIN PRODUCT)
├── Games        /games         All mini-games (NEW)
└── Media        /media         Music & videos only

SECONDARY (More Menu & Sidebar bottom):
├── Leaderboard  /leaderboard   Rankings
├── Shop         /shop          Buy items
├── Guild        /guild         Community
├── Treasury     /treasury      Wallet
├── Settings     /settings      Preferences
└── Account      /account       Profile
```

---

## Testing Checklist

After implementation:

- [ ] Bottom nav shows exactly 5 items
- [ ] Tapping "More" opens slide-up menu
- [ ] Tapping backdrop closes menu
- [ ] All menu items navigate correctly
- [ ] `/games` route shows all games
- [ ] `/media` route shows only music/videos (no games)
- [ ] Active state highlights correctly on bottom nav
- [ ] Safe area padding works on notched devices
- [ ] Desktop sidebar reflects same hierarchy
