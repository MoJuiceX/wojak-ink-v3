# Games UI/UX Audit & Improvements

## Current Games Inventory

The site has **14 mini-games**, all following similar patterns:
1. FlappyOrange - Flappy Bird style
2. OrangeSnake - Slither.io style
3. Orange2048 - 2048 puzzle
4. MemoryMatch - Card matching with NFTs
5. OrangeStack - Stacking game
6. CitrusDrop - Drop/catch game
7. BlockPuzzle - Block puzzle
8. WojakWhack - Whack-a-mole
9. BrickBreaker - Breakout clone
10. OrangeJuggle - Juggling game
11. OrangePong - Pong
12. WojakRunner - Endless runner
13. KnifeGame - Knife throwing
14. ColorReaction - Reaction game

---

## What's Working Well ✅

### Good Patterns Already in Place
- **Visual Effects System** - `useGameEffects` hook provides confetti, shockwaves, epic callouts
- **Haptic Feedback** - `useGameHaptics` for physical feedback
- **Sound System** - `useGameSounds` for audio cues
- **Leaderboard Integration** - Automatic score submission
- **Share Button** - Social sharing built-in
- **Milestone Celebrations** - Score milestones trigger effects
- **Sad Game Over Images** - Fun random sad Wojak images on death

### Code Quality
- Consistent hook usage across games
- Canvas-based rendering for performance
- Mobile detection with responsive sizing
- Sound toggle with localStorage persistence

---

## Issues to Fix 🔧

### 1. Games Hub Page - Needs Redesign

**Current Problems:**
- Plain grid, no visual hierarchy
- No game categories or filters
- No "Featured" or "New" badges
- No difficulty indicators
- Missing game descriptions on hover

**Improvements:**

```tsx
// Enhanced GamesHub with categories and featured games
const GamesHub = () => {
  const [filter, setFilter] = useState<'all' | 'arcade' | 'puzzle' | 'casual'>('all');

  const categories = {
    arcade: ['flappy-orange', 'orange-snake', 'wojak-runner', 'brick-breaker'],
    puzzle: ['orange-2048', 'memory-match', 'block-puzzle'],
    casual: ['orange-stack', 'citrus-drop', 'wojak-whack', 'orange-juggle', 'color-reaction'],
  };

  return (
    <PageTransition>
      {/* Featured Game Banner */}
      <motion.div
        className="featured-game"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="featured-badge">🔥 Featured</div>
        <img src="/assets/games/flappy-preview.gif" alt="Flappy Orange" />
        <div className="featured-info">
          <h3>Flappy Orange</h3>
          <p>Navigate through pipes in this addictive classic!</p>
          <button className="play-now-btn">Play Now</button>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {['all', 'arcade', 'puzzle', 'casual'].map(cat => (
          <motion.button
            key={cat}
            className={`tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {cat === 'all' && '🎮'}
            {cat === 'arcade' && '🕹️'}
            {cat === 'puzzle' && '🧩'}
            {cat === 'casual' && '☀️'}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Games Grid with Staggered Animation */}
      <motion.div
        className="games-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {filteredGames.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} />
        ))}
      </motion.div>
    </PageTransition>
  );
};
```

```css
/* Featured Game Banner */
.featured-game {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(0, 0, 0, 0.4));
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.featured-game img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  animation: pulse 2s infinite;
}

.featured-info {
  padding: 16px;
}

.featured-info h3 {
  color: white;
  margin-bottom: 4px;
}

.featured-info p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 12px;
}

.play-now-btn {
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.play-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
}

.category-tabs .tab {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 16px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-tabs .tab.active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1));
  border-color: rgba(249, 115, 22, 0.5);
  color: #F97316;
}
```

### 2. Game Cards - Add Visual Polish

```tsx
// Enhanced GameCard component
const GameCard = ({ game, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="game-card"
      variants={cardVariant}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
    >
      {/* Thumbnail with animated overlay */}
      <div className="game-thumbnail">
        <img src={game.thumbnail} alt={game.name} />

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="hover-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="play-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ▶
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badges */}
        {game.isNew && <span className="badge new">NEW</span>}
        {game.isHot && <span className="badge hot">🔥 HOT</span>}
      </div>

      {/* Info */}
      <div className="game-info">
        <h3>{game.name}</h3>
        <div className="game-meta">
          <span className="difficulty">{game.difficulty}</span>
          <span className="high-score">🏆 {game.highScore || '-'}</span>
        </div>
      </div>

      {/* Glow effect on hover */}
      <div className="card-glow" />
    </motion.div>
  );
};
```

```css
.game-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s;
}

.game-card:hover {
  border-color: rgba(249, 115, 22, 0.4);
}

.game-thumbnail {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.game-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.game-card:hover .game-thumbnail img {
  transform: scale(1.1);
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.6);
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge.new {
  background: #22C55E;
  color: white;
}

.badge.hot {
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
}

.game-info {
  padding: 12px;
}

.game-info h3 {
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Glow effect */
.card-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.2), transparent 70%);
  pointer-events: none;
  transition: opacity 0.3s;
}

.game-card:hover .card-glow {
  opacity: 1;
}
```

### 3. In-Game UI Improvements

**Problem:** Control buttons (back, sound) look basic and inconsistent across games.

**Solution:** Unified game chrome component:

```tsx
// Unified game chrome for all games
const GameChrome = ({
  onBack,
  soundEnabled,
  onToggleSound,
  score,
  highScore,
  gameName,
  showPause = true,
  onPause,
}) => {
  return (
    <>
      {/* Top bar */}
      <motion.div
        className="game-chrome-top"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Back button */}
        <motion.button
          className="chrome-btn"
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IonIcon icon={arrowBack} />
        </motion.button>

        {/* Game title */}
        <div className="chrome-title">{gameName}</div>

        {/* Right controls */}
        <div className="chrome-controls">
          {showPause && (
            <motion.button
              className="chrome-btn"
              onClick={onPause}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IonIcon icon={pause} />
            </motion.button>
          )}

          <motion.button
            className="chrome-btn"
            onClick={onToggleSound}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
          </motion.button>
        </div>
      </motion.div>

      {/* Score display */}
      {score !== undefined && (
        <motion.div
          className="game-chrome-score"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        >
          <div className="current-score">
            <span className="score-label">Score</span>
            <motion.span
              className="score-value"
              key={score}
              initial={{ scale: 1.5, color: '#F97316' }}
              animate={{ scale: 1, color: '#ffffff' }}
            >
              {score}
            </motion.span>
          </div>
          {highScore > 0 && (
            <div className="high-score">
              <span className="score-label">Best</span>
              <span className="score-value">{highScore}</span>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};
```

```css
.game-chrome-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
  z-index: 100;
}

.chrome-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.chrome-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.chrome-title {
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.chrome-controls {
  display: flex;
  gap: 8px;
}

.game-chrome-score {
  position: fixed;
  top: calc(70px + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 100;
}

.current-score, .high-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.score-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.high-score .score-value {
  color: #FFD700;
}
```

### 4. Game Over Screen - More Celebration

**Improvements:**
- Animated stats reveal
- Better layout with glass morphism
- More prominent "New High Score" celebration
- Quick restart animation

```tsx
const GameOverOverlay = ({
  score,
  highScore,
  isNewHighScore,
  stats, // e.g., { time: '2:30', moves: 42, kills: 5 }
  onPlayAgain,
  onExit,
  gameId,
  gameName,
  sadImage,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isNewHighScore) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#FFD700', '#FF6B00']
      });
    }
  }, [isNewHighScore]);

  return (
    <motion.div
      className="game-over-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="game-over-card"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Header */}
        <div className="go-header">
          {isNewHighScore ? (
            <motion.div
              className="new-record-banner"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <span className="trophy">🏆</span>
              <span>New High Score!</span>
            </motion.div>
          ) : (
            <h2>Game Over</h2>
          )}
        </div>

        {/* Sad image or emoji */}
        <motion.div
          className="go-image"
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sadImage ? (
            <img src={sadImage} alt="Game Over" />
          ) : (
            <span className="go-emoji">😵</span>
          )}
        </motion.div>

        {/* Score display */}
        <motion.div
          className="go-score"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="go-score-value">{score.toLocaleString()}</span>
          <span className="go-score-label">Final Score</span>
        </motion.div>

        {/* Stats */}
        {stats && Object.keys(stats).length > 0 && (
          <motion.div
            className="go-stats"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Object.entries(stats).map(([key, value], index) => (
              <motion.div
                key={key}
                className="go-stat"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <span className="stat-value">{value}</span>
                <span className="stat-label">{key}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Best score comparison */}
        <div className="go-best">
          <span>Best: {highScore.toLocaleString()}</span>
        </div>

        {/* Action buttons */}
        <div className="go-actions">
          <motion.button
            className="go-play-again"
            onClick={onPlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔄</span> Play Again
          </motion.button>

          <motion.button
            className="go-exit"
            onClick={onExit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Exit
          </motion.button>
        </div>

        {/* Share button */}
        <ShareButton
          scoreData={{
            gameId,
            gameName,
            score,
            highScore,
            isNewHighScore,
          }}
          variant="button"
          className="go-share"
        />
      </motion.div>
    </motion.div>
  );
};
```

```css
.game-over-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.game-over-card {
  width: 100%;
  max-width: 360px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.3));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(20px);
}

.go-header h2 {
  color: white;
  font-size: 24px;
  margin-bottom: 16px;
}

.new-record-banner {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 18px;
  animation: recordPulse 1s infinite;
}

@keyframes recordPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
}

.go-image {
  width: 120px;
  height: 120px;
  margin: 16px auto;
}

.go-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}

.go-emoji {
  font-size: 80px;
  line-height: 1;
}

.go-score {
  margin-bottom: 16px;
}

.go-score-value {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #F97316;
  text-shadow: 0 0 30px rgba(249, 115, 22, 0.5);
}

.go-score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.go-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.go-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: capitalize;
}

.go-best {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 20px;
}

.go-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.go-play-again {
  flex: 1;
  padding: 14px 20px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
}

.go-exit {
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  cursor: pointer;
}

.go-share {
  width: 100%;
}
```

### 5. Idle/Start Screen Improvements

**Current:** Basic text on canvas with "Tap to Start"
**Improved:** Animated, engaging start screen

```tsx
const GameIdleScreen = ({
  gameName,
  description,
  controls, // e.g., "Tap to jump" or "Swipe to move"
  highScore,
  onStart,
}) => {
  return (
    <motion.div
      className="idle-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Animated background */}
      <div className="idle-bg">
        <div className="floating-emoji e1">🍊</div>
        <div className="floating-emoji e2">🎮</div>
        <div className="floating-emoji e3">🏆</div>
      </div>

      <motion.div
        className="idle-content"
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Game title with glow */}
        <motion.h1
          className="idle-title"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          {gameName}
        </motion.h1>

        <p className="idle-desc">{description}</p>

        {/* Controls hint */}
        <div className="idle-controls">
          <span className="control-icon">👆</span>
          <span>{controls}</span>
        </div>

        {/* High score display */}
        {highScore > 0 && (
          <div className="idle-high-score">
            <span>🏆</span> Best: {highScore.toLocaleString()}
          </div>
        )}

        {/* Start button */}
        <motion.button
          className="start-btn"
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(249, 115, 22, 0.4)',
              '0 0 40px rgba(249, 115, 22, 0.6)',
              '0 0 20px rgba(249, 115, 22, 0.4)',
            ],
          }}
          transition={{
            boxShadow: { duration: 1.5, repeat: Infinity },
          }}
        >
          TAP TO START
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
```

```css
.idle-screen {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(249, 115, 22, 0.2), transparent 60%),
              #0D0D0D;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.idle-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-emoji {
  position: absolute;
  font-size: 40px;
  opacity: 0.2;
  animation: float 6s ease-in-out infinite;
}

.e1 { top: 10%; left: 10%; animation-delay: 0s; }
.e2 { top: 20%; right: 15%; animation-delay: 1s; }
.e3 { bottom: 20%; left: 20%; animation-delay: 2s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.idle-content {
  text-align: center;
  padding: 20px;
}

.idle-title {
  font-size: 36px;
  font-weight: 800;
  color: #F97316;
  text-shadow: 0 0 30px rgba(249, 115, 22, 0.5);
  margin-bottom: 8px;
}

.idle-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 24px;
}

.idle-controls {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 16px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 16px;
}

.control-icon {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.idle-high-score {
  color: #FFD700;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.start-btn {
  padding: 16px 48px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
}
```

### 6. Pause Menu

**Add pause functionality to all games:**

```tsx
const PauseMenu = ({ onResume, onRestart, onExit }) => {
  return (
    <motion.div
      className="pause-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="pause-menu"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <h2>Paused</h2>

        <div className="pause-buttons">
          <motion.button
            className="pause-btn resume"
            onClick={onResume}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>▶</span> Resume
          </motion.button>

          <motion.button
            className="pause-btn restart"
            onClick={onRestart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🔄</span> Restart
          </motion.button>

          <motion.button
            className="pause-btn exit"
            onClick={onExit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🚪</span> Exit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
```

---

## Specific Game Fixes

### FlappyOrange
- ✅ Already polished
- Add: Animated pipe previews on idle screen
- Add: Particle trail on jump

### OrangeSnake
- ✅ Already polished
- Add: Grid glow pulse effect
- Add: Player snake name label

### Orange2048
- Uses Ionic components (IonPage, IonHeader) - consider migrating to custom UI
- Add: Tile spawn animation
- Add: Merge particle burst

### MemoryMatch
- Add: Card flip sound variation
- Add: Match line connection animation between matched pairs
- Add: Timer warning glow when < 10 seconds

### BrickBreaker, OrangePong
- Need paddle glow effects
- Ball trail particles

---

## Performance Considerations

1. **Canvas Optimization**
   - Use `requestAnimationFrame` (already doing this ✅)
   - Implement object pooling for particles
   - Use `will-change: transform` on animated elements

2. **Mobile Performance**
   - Reduce particle counts on mobile
   - Lower canvas resolution on slower devices
   - Use CSS transforms instead of canvas for UI elements

3. **Memory**
   - Clean up event listeners on unmount
   - Clear intervals/timeouts
   - Dispose confetti instances

---

## Implementation Priority

1. **High Priority**
   - [ ] GameChrome component (unified top bar)
   - [ ] Enhanced GameOverOverlay
   - [ ] Games Hub featured section + categories

2. **Medium Priority**
   - [ ] Game cards hover effects
   - [ ] Idle screen improvements
   - [ ] Pause menu

3. **Lower Priority**
   - [ ] Individual game-specific polish
   - [ ] Additional particle effects
   - [ ] Sound variation

---

## One-Liner for Claude CLI

```
Read /wojak-ink/design-audit/16-games-ui-audit.md and implement the Games UI improvements. Start with creating a unified GameChrome component for the top bar controls, then create an enhanced GameOverOverlay component, and finally update the GamesHub page with the featured game banner and category tabs.
```
