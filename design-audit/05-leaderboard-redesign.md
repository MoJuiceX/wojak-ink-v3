# Leaderboard Redesign - Competitive Glory Hall

## Current Issues
- Empty state is very plain (just trophy icon and text)
- Dropdown selector looks basic
- Time filter tabs are standard
- No sense of competition or achievement
- Missing the "hall of fame" prestige feeling
- When populated, rank display will need enhancement

---

## Target Design: Cyberpunk Arena Rankings

### 1. Page Header & Title

#### Epic Title Treatment
```css
.leaderboard-header {
  text-align: center;
  margin-bottom: 32px;
}

.leaderboard-title {
  font-size: 32px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #F97316, #FFD700, #F97316);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: goldShimmer 3s ease infinite;
  text-shadow: 0 0 40px rgba(249, 115, 22, 0.3);
}

@keyframes goldShimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Decorative lines */
.leaderboard-title::before,
.leaderboard-title::after {
  content: '◆';
  margin: 0 16px;
  color: #F97316;
  font-size: 16px;
  opacity: 0.5;
}
```

---

### 2. Game Selector Dropdown

#### Premium Dropdown
```css
.game-selector {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto 24px;
}

.game-selector-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-selector-button:hover {
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
}

.selected-game {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-emoji {
  font-size: 24px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.game-name {
  font-weight: 600;
  color: white;
}

.dropdown-arrow {
  color: #F97316;
  transition: transform 0.3s;
}

.game-selector.open .dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown menu */
.game-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 16px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.game-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.game-option:hover {
  background: rgba(249, 115, 22, 0.15);
}

.game-option.selected {
  background: rgba(249, 115, 22, 0.2);
  border-left: 3px solid #F97316;
}
```

#### Dropdown Animation
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="game-dropdown-menu"
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="game-option"
        >
          {/* Game option content */}
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

---

### 3. Time Filter Tabs

#### Glowing Segment Control
```css
.time-filters {
  display: flex;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  padding: 4px;
  position: relative;
  max-width: 400px;
  margin: 0 auto 32px;
}

.time-filter {
  flex: 1;
  padding: 12px 20px;
  text-align: center;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.3s;
}

.time-filter.active {
  color: white;
}

/* Animated background slider */
.filter-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.4), rgba(249, 115, 22, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(249, 115, 22, 0.4);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.3);
  z-index: 0;
}
```

```tsx
// Animated indicator
<motion.div
  className="filter-indicator"
  layoutId="timeFilterIndicator"
  style={{
    width: `${100 / 3}%`,
    left: `${activeIndex * (100 / 3)}%`
  }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>
```

---

### 4. Empty State - Epic Version

#### Dramatic Empty State
```tsx
<motion.div
  className="leaderboard-empty"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {/* Animated trophy */}
  <motion.div
    className="trophy-container"
    animate={{
      y: [0, -15, 0],
      rotateY: [0, 10, 0, -10, 0]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <span className="trophy-icon">🏆</span>

    {/* Sparkle effects around trophy */}
    <motion.span
      className="sparkle"
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5]
      }}
      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      style={{ top: '10%', left: '20%' }}
    >✨</motion.span>
    <motion.span
      className="sparkle"
      animate={{
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5]
      }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
      style={{ top: '30%', right: '15%' }}
    >✨</motion.span>
  </motion.div>

  <h2 className="empty-title">The Arena Awaits</h2>
  <p className="empty-subtitle">Be the first to claim glory!</p>

  <motion.button
    className="play-now-btn"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    Start Playing
  </motion.button>
</motion.div>
```

```css
.leaderboard-empty {
  text-align: center;
  padding: 60px 20px;
  background: radial-gradient(
    ellipse at center,
    rgba(249, 115, 22, 0.1) 0%,
    transparent 60%
  );
  border-radius: 24px;
}

.trophy-container {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.trophy-icon {
  font-size: 80px;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.5));
}

.sparkle {
  position: absolute;
  font-size: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
}

.empty-subtitle {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
}

.play-now-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
}
```

---

### 5. Leaderboard Table (When Populated)

#### Rank Row Design
```css
.leaderboard-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

.rank-row {
  background: rgba(30, 30, 30, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.rank-row:hover {
  background: rgba(249, 115, 22, 0.1);
  transform: translateX(4px);
}

/* Top 3 special styling */
.rank-row.rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05));
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.rank-row.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.05));
  border: 1px solid rgba(192, 192, 192, 0.3);
}

.rank-row.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.05));
  border: 1px solid rgba(205, 127, 50, 0.3);
}

.rank-cell {
  padding: 16px;
}

/* Rank number styling */
.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.rank-1 .rank-number {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a1a;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.rank-2 .rank-number {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: #1a1a1a;
}

.rank-3 .rank-number {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  color: #1a1a1a;
}

/* Player info */
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid rgba(249, 115, 22, 0.3);
}

.player-name {
  font-weight: 600;
  color: white;
}

/* Score display */
.score {
  font-weight: 700;
  font-size: 18px;
  color: #F97316;
  text-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
}
```

#### Row Entry Animation
```tsx
<motion.tr
  className={`rank-row rank-${rank}`}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
  whileHover={{ x: 4 }}
>
  {/* Row content */}
</motion.tr>
```

---

### 6. Podium Display for Top 3

#### Visual Podium (Optional Enhancement)
```tsx
<div className="podium-display">
  {/* 2nd place - left */}
  <motion.div
    className="podium-spot second"
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <div className="podium-avatar">{second.avatar}</div>
    <div className="podium-name">{second.name}</div>
    <div className="podium-score">{second.score}</div>
    <div className="podium-block silver">2</div>
  </motion.div>

  {/* 1st place - center */}
  <motion.div
    className="podium-spot first"
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.1 }}
  >
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span className="crown">👑</span>
    </motion.div>
    <div className="podium-avatar gold-border">{first.avatar}</div>
    <div className="podium-name">{first.name}</div>
    <div className="podium-score">{first.score}</div>
    <div className="podium-block gold">1</div>
  </motion.div>

  {/* 3rd place - right */}
  <motion.div
    className="podium-spot third"
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    <div className="podium-avatar">{third.avatar}</div>
    <div className="podium-name">{third.name}</div>
    <div className="podium-score">{third.score}</div>
    <div className="podium-block bronze">3</div>
  </motion.div>
</div>
```

---

## Implementation Checklist

- [ ] Add gradient shimmer to page title
- [ ] Redesign game selector dropdown with animations
- [ ] Enhance time filter tabs with animated indicator
- [ ] Create dramatic animated empty state
- [ ] Design premium rank rows with top 3 special styling
- [ ] Add row entry animations with stagger
- [ ] Implement optional podium display for top 3
- [ ] Add hover effects to all interactive elements

---

## Files to Modify

1. `src/pages/Leaderboard.tsx` or `LeaderboardPage.tsx`
2. `src/components/leaderboard/GameSelector.tsx`
3. `src/components/leaderboard/TimeFilters.tsx`
4. `src/components/leaderboard/LeaderboardTable.tsx`
5. `src/components/leaderboard/RankRow.tsx`
6. `src/components/leaderboard/EmptyState.tsx`

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/05-leaderboard-redesign.md and implement the Leaderboard enhancements. Add a gradient shimmer title, redesign the game dropdown with animations, create an animated empty state with floating trophy and sparkles, and style the time filter tabs with a sliding indicator. Test on localhost:5173/leaderboard.
```
