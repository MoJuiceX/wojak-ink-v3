# Header & Navigation Redesign - Cyberpunk Command Center

## Current Issues
- Header looks standard/flat
- Navigation icons are static
- No visual feedback on route changes
- Price ticker could be more engaging
- Connect button is basic
- Mobile bottom nav lacks personality

---

## Target Design: Premium Cyberpunk Navigation

### 1. Header Bar Enhancement

#### Glass Morphism Header
```css
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* Subtle glow line at bottom */
.app-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(249, 115, 22, 0.5) 50%,
    transparent 100%
  );
}
```

#### Animated Logo
```tsx
// Logo with subtle pulse
<motion.div
  className="logo"
  animate={{
    filter: [
      "drop-shadow(0 0 5px rgba(249, 115, 22, 0.3))",
      "drop-shadow(0 0 15px rgba(249, 115, 22, 0.5))",
      "drop-shadow(0 0 5px rgba(249, 115, 22, 0.3))"
    ]
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <img src="/logo.png" alt="Wojak.ink" />
</motion.div>
```

---

### 2. Price Ticker Enhancement

#### Animated Price Display
```css
.price-ticker {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.price-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #F97316;
  text-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
}

/* Animate on price change */
.price-value.updated {
  animation: priceFlash 0.5s ease;
}

@keyframes priceFlash {
  0%, 100% { color: #F97316; }
  50% { color: #FFD700; text-shadow: 0 0 20px #FFD700; }
}
```

#### Live Update Indicator
```tsx
// Pulsing dot to show live data
<motion.span
  className="live-indicator"
  animate={{
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity
  }}
  style={{
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#22C55E',
    boxShadow: '0 0 10px #22C55E'
  }}
/>
```

#### Scrolling Tagline
```css
/* Rotating taglines in header */
.tagline-container {
  overflow: hidden;
  width: 200px;
}

.tagline-text {
  animation: scrollText 10s linear infinite;
  white-space: nowrap;
}

@keyframes scrollText {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
```

---

### 3. Connect Wallet Button

#### Premium Button Style
```css
.connect-btn {
  padding: 10px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Shine effect */
.connect-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s;
}

.connect-btn:hover::before {
  left: 100%;
}

.connect-btn:hover {
  box-shadow:
    0 0 20px rgba(249, 115, 22, 0.5),
    0 10px 30px rgba(249, 115, 22, 0.3);
  transform: translateY(-2px);
}

/* Connected state */
.connect-btn.connected {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid rgba(249, 115, 22, 0.4);
  color: #F97316;
}

.connect-btn.connected:hover {
  background: rgba(249, 115, 22, 0.25);
}
```

---

### 4. Desktop Sidebar Navigation

#### Nav Item Design
```css
.nav-sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 80px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(249, 115, 22, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  z-index: 90;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #F97316;
}

/* Active indicator */
.nav-item.active {
  color: #F97316;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 32px;
  background: #F97316;
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 15px #F97316;
}

/* Icon glow on active */
.nav-item.active .nav-icon {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
}
```

#### Animated Route Indicator
```tsx
// Animated indicator that moves with route changes
<motion.div
  className="route-indicator"
  layoutId="navIndicator"
  transition={{
    type: "spring",
    stiffness: 500,
    damping: 30
  }}
/>
```

#### Tooltip on Hover
```tsx
<motion.div
  className="nav-tooltip"
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -10 }}
>
  {navItem.label}
</motion.div>
```

---

### 5. Mobile Bottom Navigation

#### Premium Bottom Bar
```css
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(249, 115, 22, 0.15);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
}

/* Glow line at top */
.mobile-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(249, 115, 22, 0.4),
    transparent
  );
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 10px;
  transition: all 0.2s;
}

.mobile-nav-item:active {
  transform: scale(0.9);
}

.mobile-nav-item.active {
  color: #F97316;
}

.mobile-nav-item.active .nav-icon {
  filter: drop-shadow(0 0 8px #F97316);
}
```

#### Floating Action Button (optional center item)
```css
.mobile-nav-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #EA580C);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -28px;
  box-shadow:
    0 4px 20px rgba(249, 115, 22, 0.4),
    0 0 40px rgba(249, 115, 22, 0.2);
  border: 3px solid rgba(10, 10, 10, 0.95);
}
```

---

### 6. Page Transition Animations

#### Route Change Animation
```tsx
// Wrap your router outlet
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

#### Loading Bar on Navigation
```css
.nav-loading-bar {
  position: fixed;
  top: 64px;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #F97316, #FFD700);
  z-index: 200;
  animation: loadingProgress 1s ease-in-out;
}

@keyframes loadingProgress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}
```

---

## Implementation Checklist

- [ ] Add glassmorphism to header with glow line
- [ ] Animate logo with pulse glow effect
- [ ] Enhance price ticker with flash animation on update
- [ ] Add live indicator dot
- [ ] Restyle Connect button with shine effect
- [ ] Add active indicator to sidebar nav items
- [ ] Implement animated route indicator
- [ ] Style mobile bottom nav with glow
- [ ] Add page transition animations
- [ ] Add navigation loading bar

---

## Files to Modify

1. `src/components/layout/Header.tsx`
2. `src/components/layout/Sidebar.tsx` or `Navigation.tsx`
3. `src/components/layout/MobileNav.tsx` or `TabBar.tsx`
4. `src/components/common/ConnectButton.tsx`
5. `src/components/common/PriceTicker.tsx`
6. `src/App.tsx` - for page transitions
7. Global CSS for header/nav styles

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/03-header-navbar-redesign.md and implement the navigation enhancements. Add glassmorphism to the header, animate the logo with a pulse glow, enhance the Connect button with a shine effect, add active indicators to nav items, and implement page transition animations. Test across all pages on localhost:5173.
```
