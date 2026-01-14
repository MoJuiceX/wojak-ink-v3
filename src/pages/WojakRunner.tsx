// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import './WojakRunner.css';

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: 'camel' | 'bear';
}

interface Collectible {
  id: number;
  lane: number;
  y: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

const _LANES = [0, 1, 2];
const LANE_WIDTH = 80;
const PLAYER_SIZE = 50;
const OBSTACLE_SIZE = 45;
const COLLECTIBLE_SIZE = 35;

// Sad images for game over screen (1-19)
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/games/sad_runner_${i + 1}.png`);

const WojakRunner: React.FC = () => {
  const { playCollect, playSpeedUp, playGameOver } = useGameSounds();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('wojakRunnerHighScore') || '0', 10);
  });
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('wojakRunnerLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [sadImage, setSadImage] = useState('');

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const obstacleIdRef = useRef(0);
  const collectibleIdRef = useRef(0);
  const touchStartXRef = useRef(0);
  const lastSpawnRef = useRef(0);

  // Sound refs for use in game loop
  const playCollectRef = useRef(playCollect);
  const playSpeedUpRef = useRef(playSpeedUp);
  const playGameOverRef = useRef(playGameOver);

  // Keep refs updated
  useEffect(() => {
    playCollectRef.current = playCollect;
    playSpeedUpRef.current = playSpeedUp;
    playGameOverRef.current = playGameOver;
  }, [playCollect, playSpeedUp, playGameOver]);

  const startGame = () => {
    setPlayerLane(1);
    setObstacles([]);
    setCollectibles([]);
    setScore(0);
    setDistance(0);
    setSpeed(5);
    obstacleIdRef.current = 0;
    collectibleIdRef.current = 0;
    lastSpawnRef.current = 0;
    setPlayerName('');
    setGameState('playing');
  };

  const goToMenu = () => {
    setGameState('idle');
    setPlayerName('');
  };

  const saveScore = () => {
    if (!playerName.trim()) return;

    const finalScore = score + Math.floor(distance / 10);
    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: finalScore,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('wojakRunnerLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  const skipSaveScore = () => {
    setPlayerName('');
    goToMenu();
  };

  // Swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;

    if (Math.abs(diff) > 30) {
      if (diff > 0 && playerLane < 2) {
        setPlayerLane(prev => prev + 1);
      } else if (diff < 0 && playerLane > 0) {
        setPlayerLane(prev => prev - 1);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      if (e.key === 'ArrowLeft' && playerLane > 0) {
        setPlayerLane(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && playerLane < 2) {
        setPlayerLane(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerLane]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const height = gameAreaRef.current?.offsetHeight || 600;

      // Update distance and speed
      setDistance(prev => {
        const newDist = prev + 1;
        if (newDist % 500 === 0) {
          setSpeed(s => Math.min(s + 0.5, 15));
          playSpeedUpRef.current();
        }
        return newDist;
      });

      // Spawn obstacles and collectibles
      lastSpawnRef.current += 1;
      if (lastSpawnRef.current >= 60) {
        lastSpawnRef.current = 0;

        // Spawn obstacle
        if (Math.random() < 0.7) {
          const lane = Math.floor(Math.random() * 3);
          setObstacles(prev => [
            ...prev,
            {
              id: obstacleIdRef.current++,
              lane,
              y: -OBSTACLE_SIZE,
              type: Math.random() < 0.5 ? 'camel' : 'bear',
            },
          ]);
        }

        // Spawn collectible
        if (Math.random() < 0.4) {
          const lane = Math.floor(Math.random() * 3);
          setCollectibles(prev => [
            ...prev,
            {
              id: collectibleIdRef.current++,
              lane,
              y: -COLLECTIBLE_SIZE,
            },
          ]);
        }
      }

      // Move obstacles
      setObstacles(prev =>
        prev
          .map(o => ({ ...o, y: o.y + speed }))
          .filter(o => o.y < height + OBSTACLE_SIZE)
      );

      // Move collectibles
      setCollectibles(prev =>
        prev
          .map(c => ({ ...c, y: c.y + speed }))
          .filter(c => c.y < height + COLLECTIBLE_SIZE)
      );

      // Collision detection - player is now at bottom: 60px
      const playerY = height - 60 - PLAYER_SIZE;
      const _playerX = playerLane * LANE_WIDTH + LANE_WIDTH / 2;

      // Check obstacle collision
      obstacles.forEach(obstacle => {
        if (obstacle.lane === playerLane) {
          const obstacleY = obstacle.y;
          if (
            obstacleY + OBSTACLE_SIZE > playerY &&
            obstacleY < playerY + PLAYER_SIZE
          ) {
            // Select random sad image
            playGameOverRef.current();
            setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
            setGameState('gameover');
            const finalScore = score + Math.floor(distance / 10);
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('wojakRunnerHighScore', String(finalScore));
            }
          }
        }
      });

      // Check collectible collision
      setCollectibles(prev => {
        const remaining: Collectible[] = [];
        prev.forEach(collectible => {
          if (collectible.lane === playerLane) {
            const collectibleY = collectible.y;
            if (
              collectibleY + COLLECTIBLE_SIZE > playerY &&
              collectibleY < playerY + PLAYER_SIZE
            ) {
              playCollectRef.current();
              setScore(s => s + 10);
              return; // Don't add to remaining
            }
          }
          remaining.push(collectible);
        });
        return remaining;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, speed, playerLane, obstacles, score, distance, highScore]);

  const totalScore = score + Math.floor(distance / 10);
  const width = gameAreaRef.current?.offsetWidth || 300;
  const laneOffset = (width - LANE_WIDTH * 3) / 2;

  return (
    <div className={`runner-container ${gameState === 'playing' ? 'playing-mode' : ''}`}>
      {/* Title Bar HUD - shown during gameplay */}
      {gameState === 'playing' && (
        <div className="runner-titlebar">
          <div className="titlebar-item">
            <span className="hud-label">Score</span>
            <span className="hud-value">{totalScore}</span>
          </div>
          <div className="titlebar-item">
            <span className="hud-label">Best</span>
            <span className="hud-value">{highScore}</span>
          </div>
          <div className="titlebar-item">
            <span className="hud-label">Speed</span>
            <span className="hud-value">{speed.toFixed(1)}x</span>
          </div>
        </div>
      )}

      <div className="runner-content">
        <div
          ref={gameAreaRef}
          className={`runner-area ${gameState === 'playing' ? 'playing' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Menu - Horizontal split layout */}
          {gameState === 'idle' && (
            <div className="game-menu-split">
              {/* Left side - Title and Play */}
              <div className="menu-left">
                <div className="game-title">Wojak Runner</div>
                <div className="game-emoji">🏃</div>
                <p className="game-desc">Swipe left/right to dodge!</p>
                <p className="game-desc">🐫 Camels and 🐻 bears will kill you!</p>
                <p className="game-desc">Collect 🍊 oranges for points</p>
                <button onClick={startGame} className="play-btn">
                  Play
                </button>
              </div>

              {/* Right side - Leaderboard */}
              <div className="menu-right">
                <div className="leaderboard">
                  <h3 className="leaderboard-title">Leaderboard</h3>
                  <div className="leaderboard-list">
                    {Array.from({ length: 10 }, (_, index) => {
                      const entry = leaderboard[index];
                      return (
                        <div key={index} className="leaderboard-entry">
                          <span className="leaderboard-rank">#{index + 1}</span>
                          <span className="leaderboard-name">{entry?.name || '---'}</span>
                          <span className="leaderboard-score">{entry?.score || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game Over - Save Score Screen */}
          {gameState === 'gameover' && (
            <div className="game-over-screen">
              {/* Left side - Sad Image */}
              <div className="game-over-left">
                {sadImage ? (
                  <img
                    src={sadImage}
                    alt="Game Over"
                    className="sad-image-large"
                  />
                ) : (
                  <div className="game-over-emoji">💀</div>
                )}
              </div>

              {/* Right side - Content */}
              <div className="game-over-right">
                <div className="game-over-title">Game Over!</div>

                <div className="game-over-reason">
                  You crashed into an obstacle!
                </div>

                <div className="game-over-score">
                  <span className="game-over-score-value">{totalScore}</span>
                  <span className="game-over-score-label">points</span>
                </div>

                {totalScore > highScore && (
                  <div className="game-over-record">🌟 New High Score! 🌟</div>
                )}

                <div className="game-over-form">
                  <input
                    type="text"
                    className="game-over-input"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={15}
                    onKeyDown={(e) => e.key === 'Enter' && saveScore()}
                  />
                  <div className="game-over-buttons">
                    <button
                      onClick={saveScore}
                      className="game-over-save"
                      disabled={!playerName.trim()}
                    >
                      Save Score
                    </button>
                    <button onClick={skipSaveScore} className="game-over-skip">
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {/* Road lanes */}
              <div className="road" style={{ left: laneOffset }}>
                <div className="lane-line" style={{ left: LANE_WIDTH }} />
                <div className="lane-line" style={{ left: LANE_WIDTH * 2 }} />
              </div>

              {/* Player */}
              <div
                className="runner-player"
                style={{
                  left: laneOffset + playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_SIZE) / 2,
                }}
              />

              {/* Obstacles */}
              {obstacles.map(obstacle => (
                <div
                  key={obstacle.id}
                  className={`runner-obstacle ${obstacle.type}`}
                  style={{
                    left: laneOffset + obstacle.lane * LANE_WIDTH + (LANE_WIDTH - OBSTACLE_SIZE) / 2,
                    top: obstacle.y,
                  }}
                >
                  {obstacle.type === 'camel' ? '🐫' : '🐻'}
                </div>
              ))}

              {/* Collectibles */}
              {collectibles.map(collectible => (
                <div
                  key={collectible.id}
                  className="runner-collectible"
                  style={{
                    left: laneOffset + collectible.lane * LANE_WIDTH + (LANE_WIDTH - COLLECTIBLE_SIZE) / 2,
                    top: collectible.y,
                  }}
                >
                  &#x1F34A;
                </div>
              ))}

              {/* Swipe hint */}
              <div className="swipe-hint">← Swipe →</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WojakRunner;
