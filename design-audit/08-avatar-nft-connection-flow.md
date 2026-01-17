# Avatar & NFT Connection Flow - Game Theory Implementation

## The Strategy
Users start with a generic emoji avatar → They WANT to upgrade → Connect wallet → Use their NFT as avatar → Unlock leaderboard eligibility

This creates a natural incentive loop that drives wallet connections and NFT engagement.

---

## User Journey

### Stage 1: New User (Generic Avatar)
- User signs up/visits
- Randomly assigned an emoji avatar (🙂 😊 🤔 😎 etc.)
- Avatar appears generic and "placeholder-ish"
- Subtle visual cues that this is temporary

### Stage 2: Discovery
- User sees other profiles with cool NFT avatars
- Leaderboard shows NFT avatars with special styling
- Prompts appear encouraging upgrade
- Benefits are clearly communicated

### Stage 3: Connection
- User connects wallet
- System detects owned Wojak NFTs
- User selects NFT to use as avatar
- Celebration moment!

### Stage 4: Unlocked
- NFT avatar displays with premium styling
- Leaderboard eligibility unlocked
- Full site features available
- User feels "part of the club"

---

## UI Implementation

### 1. Generic Emoji Avatar Display

```css
/* Generic avatar - intentionally "meh" */
.avatar.generic {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(100, 100, 100, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
}

/* Subtle "upgrade me" indicator */
.avatar.generic::after {
  content: '↑';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #F97316;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### 2. NFT Avatar Display (Premium)

```css
/* NFT avatar - premium treatment */
.avatar.nft {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #F97316;
  box-shadow:
    0 0 15px rgba(249, 115, 22, 0.4),
    inset 0 0 10px rgba(249, 115, 22, 0.1);
  position: relative;
  overflow: hidden;
}

.avatar.nft img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Verified badge */
.avatar.nft::after {
  content: '✓';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #22C55E, #16A34A);
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid #0d0d0d;
}

/* Animated glow ring for special occasions */
.avatar.nft.highlighted::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #F97316, #FFD700, #F97316);
  animation: spin 3s linear infinite;
  z-index: -1;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 3. Upgrade Prompt Banner

```tsx
// Show this when user has generic avatar
const AvatarUpgradeBanner = () => (
  <motion.div
    className="upgrade-banner"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 2 }} // Show after 2 seconds
  >
    <div className="banner-content">
      <span className="banner-icon">🍊</span>
      <div className="banner-text">
        <strong>Upgrade your avatar!</strong>
        <p>Connect your wallet to use your Wojak NFT and unlock the leaderboard</p>
      </div>
      <motion.button
        className="upgrade-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Connect Wallet
      </motion.button>
    </div>
  </motion.div>
);
```

```css
.upgrade-banner {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(0, 0, 0, 0.4));
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 16px;
  padding: 16px 20px;
  margin: 16px;
  display: flex;
  align-items: center;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.banner-icon {
  font-size: 32px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.banner-text strong {
  color: #F97316;
  display: block;
}

.banner-text p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 0;
}

.upgrade-btn {
  margin-left: auto;
  padding: 10px 20px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}
```

### 4. Leaderboard Access Gate

```tsx
// On Leaderboard page for users without NFT avatar
const LeaderboardGate = () => (
  <motion.div
    className="leaderboard-gate"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="gate-content">
      <motion.div
        className="lock-icon"
        animate={{
          rotateY: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔒
      </motion.div>

      <h2>Leaderboard Access Required</h2>

      <p>To compete on the leaderboard and earn rewards, you need to:</p>

      <div className="requirements">
        <div className="requirement">
          <span className="req-icon">💼</span>
          <span>Connect your Chia wallet</span>
        </div>
        <div className="requirement">
          <span className="req-icon">🖼️</span>
          <span>Own a Wojak Farmers Plot NFT</span>
        </div>
        <div className="requirement">
          <span className="req-icon">👤</span>
          <span>Set your NFT as your avatar</span>
        </div>
      </div>

      <div className="benefits">
        <h3>What you'll unlock:</h3>
        <ul>
          <li>🏆 Compete on game leaderboards</li>
          <li>🎁 Earn exclusive rewards</li>
          <li>⚔️ Join guilds with other holders</li>
          <li>💎 Access holder-only features</li>
        </ul>
      </div>

      <div className="cta-buttons">
        <motion.button
          className="primary-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect Wallet
        </motion.button>
        <a href="/gallery" className="secondary-link">
          View the Collection →
        </a>
      </div>
    </div>
  </motion.div>
);
```

```css
.leaderboard-gate {
  max-width: 500px;
  margin: 40px auto;
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(0, 0, 0, 0.3));
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 24px;
}

.lock-icon {
  font-size: 64px;
  margin-bottom: 20px;
  display: inline-block;
}

.leaderboard-gate h2 {
  color: white;
  margin-bottom: 12px;
}

.leaderboard-gate p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.requirements {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  text-align: left;
}

.req-icon {
  font-size: 20px;
}

.benefits {
  background: rgba(249, 115, 22, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.benefits h3 {
  color: #F97316;
  font-size: 14px;
  margin-bottom: 12px;
}

.benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefits li {
  padding: 6px 0;
  color: rgba(255, 255, 255, 0.8);
}

.cta-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.secondary-link {
  color: #F97316;
  text-decoration: none;
}
```

### 5. NFT Selection Modal (After Wallet Connect)

```tsx
const NFTSelectionModal = ({ nfts, onSelect }) => (
  <motion.div
    className="nft-selection-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="modal-content"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
    >
      <h2>Choose Your Avatar</h2>
      <p>Select a Wojak NFT from your collection</p>

      <div className="nft-grid">
        {nfts.map((nft, index) => (
          <motion.div
            key={nft.id}
            className="nft-option"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(nft)}
          >
            <img src={nft.image} alt={nft.name} />
            <span className="nft-id">#{nft.id}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);
```

### 6. Success Celebration

```tsx
const AvatarSetSuccess = ({ nft }) => {
  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F97316', '#FFD700', '#FF6B00']
    });
  }, []);

  return (
    <motion.div
      className="success-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="success-avatar">
          <img src={nft.image} alt="Your new avatar" />
        </div>
        <h2>Looking Good! 🔥</h2>
        <p>Your Wojak #{nft.id} is now your avatar</p>
        <ul className="unlocked-features">
          <li>✅ Leaderboard access unlocked</li>
          <li>✅ Guild membership available</li>
          <li>✅ Holder rewards activated</li>
        </ul>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={closeModal}
        >
          Let's Go!
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
```

---

## Where to Show Upgrade Prompts

1. **Account Page** - Main CTA to connect and set avatar
2. **Leaderboard Page** - Gate with explanation (if no NFT)
3. **Games Page** - Small banner "Compete on leaderboards!"
4. **Profile Dropdown** - "Upgrade Avatar" option
5. **After Game Over** - "Want to save your score? Connect wallet!"

---

## Messaging Suggestions

### Why Connect?
- "Join the Wojak community"
- "Compete with fellow collectors"
- "Your NFT, your identity"

### Benefits Copy
- "🏆 Compete on leaderboards and prove you're the best"
- "🎁 Earn exclusive rewards for holders only"
- "⚔️ Join guilds and team up with friends"
- "👤 Stand out with your unique Wojak avatar"

### Urgency/FOMO (Use Sparingly)
- "X players are competing right now"
- "This week's top scorer wins..."

---

## Implementation Checklist

- [ ] Create generic emoji avatar component with "upgrade" indicator
- [ ] Create premium NFT avatar component with glow effects
- [ ] Build upgrade prompt banner component
- [ ] Build leaderboard access gate page/modal
- [ ] Build NFT selection modal (post wallet connect)
- [ ] Build avatar set success celebration
- [ ] Add upgrade prompts to strategic locations
- [ ] Write compelling copy for all prompts

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/08-avatar-nft-connection-flow.md and implement the avatar upgrade flow. Create the generic emoji avatar with upgrade indicator, the premium NFT avatar with glow effects, the upgrade prompt banner, and the leaderboard access gate. Focus on making the generic avatar look "meh" while the NFT avatar looks premium to incentivize wallet connection.
```
