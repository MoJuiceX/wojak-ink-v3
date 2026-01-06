import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';
import './Game.css';

interface Orange {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 800; // ms
const FALL_SPEED = 2; // pixels per frame

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('orangeHighScore') || '0', 10);
  });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [oranges, setOranges] = useState<Orange[]>([]);
  const [combo, setCombo] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const orangeIdRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setOranges([]);
    setCombo(0);
    orangeIdRef.current = 0;
  };

  // Spawn new orange
  const spawnOrange = useCallback(() => {
    if (!gameAreaRef.current) return;

    const width = gameAreaRef.current.offsetWidth;
    const size = 50 + Math.random() * 30; // 50-80px
    const x = Math.random() * (width - size);

    const newOrange: Orange = {
      id: orangeIdRef.current++,
      x,
      y: -size,
      size,
      speed: FALL_SPEED + Math.random() * 2,
    };

    setOranges(prev => [...prev, newOrange]);
  }, []);

  // Handle tap on orange
  const handleTap = (orangeId: number) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    // Combo system - tap within 500ms to build combo
    let newCombo = 1;
    if (timeSinceLastTap < 500) {
      newCombo = Math.min(combo + 1, 10);
    }

    setCombo(newCombo);
    setLastTapTime(now);

    // Score based on combo
    const points = 10 * newCombo;
    setScore(prev => prev + points);

    // Remove the orange
    setOranges(prev => prev.filter(o => o.id !== orangeId));
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setOranges(prev => {
        const height = gameAreaRef.current?.offsetHeight || 500;
        const updated = prev
          .map(o => ({ ...o, y: o.y + o.speed }))
          .filter(o => o.y < height + o.size);

        return updated;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Spawn oranges
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawner = setInterval(() => {
      spawnOrange();
    }, SPAWN_INTERVAL);

    return () => clearInterval(spawner);
  }, [gameState, spawnOrange]);

  // Update high score
  useEffect(() => {
    if (gameState === 'gameover' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('orangeHighScore', String(score));
    }
  }, [gameState, score, highScore]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orange Tap</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="game-content" scrollY={false}>
        {/* Score HUD */}
        {gameState === 'playing' && (
          <div className="game-hud">
            <div className="hud-item">
              <span className="hud-label">Time</span>
              <span className="hud-value">{timeLeft}s</span>
            </div>
            <div className="hud-item combo">
              {combo > 1 && <span className="combo-text">x{combo}</span>}
            </div>
            <div className="hud-item">
              <span className="hud-label">Score</span>
              <span className="hud-value">{score}</span>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div ref={gameAreaRef} className="game-area">
          {gameState === 'idle' && (
            <div className="game-menu">
              <div className="game-title">Orange Tap</div>
              <div className="game-emoji">&#x1F34A;</div>
              <p className="game-desc">Tap oranges to score points!</p>
              <p className="game-desc">Build combos for bonus!</p>
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
                <span className="score-value">{score}</span>
              </div>
              {score === highScore && score > 0 && (
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
              {oranges.map(orange => (
                <div
                  key={orange.id}
                  className="orange"
                  style={{
                    left: orange.x,
                    top: orange.y,
                    width: orange.size,
                    height: orange.size,
                  }}
                  onClick={() => handleTap(orange.id)}
                >
                  &#x1F34A;
                </div>
              ))}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Game;
