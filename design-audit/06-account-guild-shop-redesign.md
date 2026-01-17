# Account, Guild & Shop Pages Redesign

## Overview
These three pages share similar issues - they're functional but lack visual excitement. Let's bring them to the same premium standard as the rest of the site.

---

# ACCOUNT PAGE

## Current Issues
- Plain form layout
- Avatar display is static
- Input fields are basic
- Connect wallet button needs more emphasis
- No visual hierarchy or depth

## Target Design

### 1. Profile Card Enhancement

```css
.profile-card {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1) 0%,
    rgba(0, 0, 0, 0.4) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Decorative glow orb */
.profile-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent 70%);
  pointer-events: none;
}
```

### 2. Avatar with Glow Ring
```css
.profile-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #F97316;
  box-shadow:
    0 0 20px rgba(249, 115, 22, 0.4),
    inset 0 0 20px rgba(249, 115, 22, 0.1);
}

/* Animated ring */
.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #FFD700;
  animation: spinRing 3s linear infinite;
}

@keyframes spinRing {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 3. Premium Input Fields
```css
.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-field {
  width: 100%;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
  outline: none;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
```

### 4. Wallet Connection Section
```css
.wallet-section {
  background: rgba(249, 115, 22, 0.05);
  border: 1px dashed rgba(249, 115, 22, 0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}

.wallet-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.connect-wallet-btn {
  margin-top: 16px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* Shine effect */
.connect-wallet-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}
```

---

# GUILD PAGE

## Current Issues
- Castle emoji feels placeholder
- Very minimal content
- No sense of community or teamwork
- Buttons are basic

## Target Design

### 1. Epic Hero Section
```tsx
<motion.div
  className="guild-hero"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Animated castle with glow */}
  <motion.div
    className="castle-icon"
    animate={{
      y: [0, -10, 0],
      filter: [
        "drop-shadow(0 0 20px rgba(249, 115, 22, 0.3))",
        "drop-shadow(0 0 40px rgba(249, 115, 22, 0.5))",
        "drop-shadow(0 0 20px rgba(249, 115, 22, 0.3))"
      ]
    }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    🏰
  </motion.div>

  {/* Floating particles around castle */}
  <motion.span
    className="particle"
    animate={{ y: [-20, -60], opacity: [1, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
  >⚔️</motion.span>
  <motion.span
    className="particle"
    animate={{ y: [-20, -60], opacity: [1, 0] }}
    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
  >🛡️</motion.span>
</motion.div>
```

```css
.guild-hero {
  text-align: center;
  padding: 60px 20px;
  position: relative;
  background: radial-gradient(
    ellipse at center top,
    rgba(249, 115, 22, 0.15) 0%,
    transparent 60%
  );
}

.castle-icon {
  font-size: 100px;
  margin-bottom: 24px;
}

.guild-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
}

.guild-subtitle {
  color: rgba(255, 255, 255, 0.6);
  max-width: 400px;
  margin: 0 auto 32px;
  line-height: 1.6;
}
```

### 2. Action Buttons with Personality
```css
.guild-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.guild-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.guild-btn.primary {
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  color: white;
}

.guild-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(249, 115, 22, 0.4);
}

.guild-btn.secondary {
  background: transparent;
  border: 2px solid rgba(249, 115, 22, 0.4);
  color: #F97316;
}

.guild-btn.secondary:hover {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.6);
}
```

### 3. Benefits/Features Section (Optional Addition)
```tsx
<div className="guild-benefits">
  <h3>Why Join a Guild?</h3>
  <div className="benefits-grid">
    {[
      { icon: "🏆", title: "Compete Together", desc: "Climb the guild leaderboards" },
      { icon: "🎁", title: "Exclusive Rewards", desc: "Earn guild-only items" },
      { icon: "🤝", title: "Community", desc: "Connect with fellow collectors" },
      { icon: "⚡", title: "Bonus XP", desc: "Earn more from games" }
    ].map((benefit, i) => (
      <motion.div
        key={i}
        className="benefit-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <span className="benefit-icon">{benefit.icon}</span>
        <h4>{benefit.title}</h4>
        <p>{benefit.desc}</p>
      </motion.div>
    ))}
  </div>
</div>
```

---

# SHOP PAGE

## Current Issues
- Cards are functional but lack excitement
- Rarity badges could be more prominent
- No purchase celebration
- Currency display is basic

## Target Design

### 1. Currency Display Enhancement
```css
.currency-bar {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(249, 115, 22, 0.1);
  border-radius: 20px;
}

.currency-icon {
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
}

.currency-amount {
  font-weight: 700;
  color: white;
  font-family: 'JetBrains Mono', monospace;
}
```

### 2. Premium Shop Item Cards
```css
.shop-card {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

/* Rarity-based glow */
.shop-card.rare {
  border-color: rgba(59, 130, 246, 0.3);
}
.shop-card.rare:hover {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.shop-card.epic {
  border-color: rgba(168, 85, 247, 0.3);
}
.shop-card.epic:hover {
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.3);
}

.shop-card.legendary {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), transparent);
}
.shop-card.legendary:hover {
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.4);
}

.shop-card:hover {
  transform: translateY(-8px);
}

/* Rarity badge */
.rarity-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rarity-badge.rare {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
}

.rarity-badge.epic {
  background: linear-gradient(135deg, #A855F7, #7C3AED);
  color: white;
}

.rarity-badge.legendary {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a1a;
  animation: legendaryPulse 2s ease infinite;
}

@keyframes legendaryPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
}
```

### 3. Item Preview Animation
```css
.item-preview {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
}

.item-icon {
  font-size: 64px;
  transition: transform 0.3s;
}

.shop-card:hover .item-icon {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.5));
}
```

### 4. Purchase Button States
```css
.purchase-btn {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.purchase-btn.can-afford {
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  color: white;
}

.purchase-btn.can-afford:hover {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
}

.purchase-btn.cannot-afford {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}
```

### 5. Purchase Celebration
```tsx
const handlePurchase = async (item) => {
  await purchaseItem(item);

  // Confetti burst
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#F97316', '#FFD700', '#FF6B00']
  });

  // Toast notification
  toast.success(`${item.name} acquired!`, {
    icon: item.icon,
    style: {
      background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
      border: '1px solid rgba(249, 115, 22, 0.3)',
      color: '#fff'
    }
  });
};
```

---

## Implementation Checklist

### Account Page
- [ ] Add glassmorphism to profile card with glow orb
- [ ] Create animated avatar ring
- [ ] Style input fields with focus glow
- [ ] Add shine animation to wallet button
- [ ] Implement floating wallet icon

### Guild Page
- [ ] Create animated hero section with castle
- [ ] Add floating particle effects
- [ ] Style action buttons with hover effects
- [ ] Add benefits section with card animations

### Shop Page
- [ ] Enhance currency display with icons
- [ ] Add rarity-based card glows
- [ ] Implement legendary badge pulse animation
- [ ] Add item hover animations
- [ ] Create purchase celebration with confetti

---

## Files to Modify

1. `src/pages/Account.tsx`
2. `src/pages/Guild.tsx`
3. `src/pages/Shop.tsx`
4. `src/components/shop/ShopCard.tsx`
5. `src/components/account/ProfileCard.tsx`

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/06-account-guild-shop-redesign.md and implement the Account, Guild, and Shop page enhancements. Add glassmorphism profile cards, animated avatar rings, epic guild hero sections with floating particles, and rarity-based shop card glows with legendary pulse animations. Test all three pages on localhost:5173.
```
