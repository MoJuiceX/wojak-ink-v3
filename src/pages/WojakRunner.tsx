// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/react';
import { informationCircleOutline, close } from 'ionicons/icons';
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

const _LANES = [0, 1, 2];
const LANE_WIDTH = 80;
const PLAYER_SIZE = 50;
const OBSTACLE_SIZE = 45;
const COLLECTIBLE_SIZE = 35;

const WojakRunner: React.FC = () => {
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

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const obstacleIdRef = useRef(0);
  const collectibleIdRef = useRef(0);
  const touchStartXRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const [showInfo, setShowInfo] = useState(false);

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
    setGameState('playing');
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

      // Collision detection
      const playerY = height - 120;
      const _playerX = playerLane * LANE_WIDTH + LANE_WIDTH / 2;

      // Check obstacle collision
      obstacles.forEach(obstacle => {
        if (obstacle.lane === playerLane) {
          const obstacleY = obstacle.y;
          if (
            obstacleY + OBSTACLE_SIZE > playerY &&
            obstacleY < playerY + PLAYER_SIZE
          ) {
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowInfo(true)}>
              <IonIcon icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Wojak Runner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="runner-content" scrollY={false}>
        {gameState === 'playing' && (
          <div className="runner-hud">
            <div className="hud-item">
              <span className="hud-label">Score</span>
              <span className="hud-value">{totalScore}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Best</span>
              <span className="hud-value">{highScore}</span>
            </div>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="runner-area"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {gameState === 'idle' && (
            <div className="game-menu">
              <div className="game-title">Wojak Runner</div>
              <div className="game-emoji">🏃</div>
              <p className="game-desc">Swipe left/right to dodge!</p>
              <p className="game-desc">Collect oranges for points</p>
              {highScore > 0 && (
                <p className="high-score">High Score: {highScore}</p>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play
              </IonButton>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="game-menu">
              <div className="game-title">Game Over!</div>
              <div className="final-score">
                <span className="score-label">Score</span>
                <span className="score-value">{totalScore}</span>
              </div>
              {totalScore >= highScore && totalScore > 0 && (
                <div className="new-record">New Record!</div>
              )}
              <div className="high-score-display">
                Best: {highScore}
              </div>
              <IonButton onClick={startGame} className="play-btn">
                Play Again
              </IonButton>
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

        {/* Info Modal */}
        {showInfo && (
          <div className="info-overlay" onClick={() => setShowInfo(false)}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <button className="info-close" onClick={() => setShowInfo(false)}>
                <IonIcon icon={close} />
              </button>
              <h2>How to Play</h2>
              <div className="info-content">
                <p><strong>Goal:</strong> Run as far as you can while dodging obstacles!</p>
                <p><strong>Controls:</strong> Swipe left/right to change lanes.</p>
                <p><strong>Scoring:</strong></p>
                <ul>
                  <li>🍊 Collect oranges for +10 points</li>
                  <li>Distance traveled adds to score</li>
                  <li>🐫🐻 Avoid camels and bears!</li>
                  <li>Speed increases over time</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default WojakRunner;
