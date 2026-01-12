// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
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
import './OrangePong.css';

const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 30;
const AI_SPEED = 4;

const OrangePong: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [aiY, setAiY] = useState(0);
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [ballVX, setBallVX] = useState(5);
  const [ballVY, setBallVY] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('orangePongHighScore') || '0', 10);
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const touchStartYRef = useRef(0);
  const playerYRef = useRef(0);
  const [showInfo, setShowInfo] = useState(false);

  const resetBall = useCallback((direction: number) => {
    const width = gameAreaRef.current?.offsetWidth || 300;
    const height = gameAreaRef.current?.offsetHeight || 500;

    setBallX(width / 2 - BALL_SIZE / 2);
    setBallY(height / 2 - BALL_SIZE / 2);
    setBallVX(5 * direction);
    setBallVY((Math.random() - 0.5) * 6);
  }, []);

  const startGame = () => {
    const height = gameAreaRef.current?.offsetHeight || 500;
    const centerY = (height - PADDLE_HEIGHT) / 2;

    setPlayerScore(0);
    setAiScore(0);
    setPlayerY(centerY);
    setAiY(centerY);
    playerYRef.current = centerY;
    resetBall(1);
    setGameState('playing');
  };

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    e.preventDefault();

    const height = gameAreaRef.current?.offsetHeight || 500;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchY = e.touches[0].clientY - rect.top;
    const newY = Math.max(0, Math.min(height - PADDLE_HEIGHT, touchY - PADDLE_HEIGHT / 2));

    setPlayerY(newY);
    playerYRef.current = newY;
  };

  // Mouse controls for desktop
  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;

    const height = gameAreaRef.current?.offsetHeight || 500;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseY = e.clientY - rect.top;
    const newY = Math.max(0, Math.min(height - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));

    setPlayerY(newY);
    playerYRef.current = newY;
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const width = gameAreaRef.current?.offsetWidth || 300;
      const height = gameAreaRef.current?.offsetHeight || 500;

      setBallX(prevX => {
        setBallY(prevY => {
          let newX = prevX + ballVX;
          let newY = prevY + ballVY;
          let newVX = ballVX;
          let newVY = ballVY;

          // Top/bottom bounce
          if (newY <= 0 || newY >= height - BALL_SIZE) {
            newVY = -ballVY;
            newY = newY <= 0 ? 0 : height - BALL_SIZE;
            setBallVY(newVY);
          }

          // Player paddle collision (right side)
          const playerPaddleX = width - PADDLE_WIDTH - 20;
          if (
            newX + BALL_SIZE >= playerPaddleX &&
            newX <= playerPaddleX + PADDLE_WIDTH &&
            newY + BALL_SIZE >= playerYRef.current &&
            newY <= playerYRef.current + PADDLE_HEIGHT
          ) {
            newVX = -Math.abs(ballVX) * 1.05; // Speed up slightly
            newX = playerPaddleX - BALL_SIZE;
            // Add spin based on where ball hits paddle
            const hitPos = (newY + BALL_SIZE / 2 - playerYRef.current) / PADDLE_HEIGHT;
            newVY = (hitPos - 0.5) * 10;
            setBallVX(newVX);
            setBallVY(newVY);
          }

          // AI paddle collision (left side)
          setAiY(prevAiY => {
            const aiPaddleX = 20;
            if (
              newX <= aiPaddleX + PADDLE_WIDTH &&
              newX + BALL_SIZE >= aiPaddleX &&
              newY + BALL_SIZE >= prevAiY &&
              newY <= prevAiY + PADDLE_HEIGHT
            ) {
              newVX = Math.abs(ballVX) * 1.05;
              newX = aiPaddleX + PADDLE_WIDTH;
              const hitPos = (newY + BALL_SIZE / 2 - prevAiY) / PADDLE_HEIGHT;
              newVY = (hitPos - 0.5) * 10;
              setBallVX(newVX);
              setBallVY(newVY);
            }

            // AI movement
            const aiCenter = prevAiY + PADDLE_HEIGHT / 2;
            const ballCenter = newY + BALL_SIZE / 2;
            let newAiY = prevAiY;

            if (ballCenter < aiCenter - 10) {
              newAiY = Math.max(0, prevAiY - AI_SPEED);
            } else if (ballCenter > aiCenter + 10) {
              newAiY = Math.min(height - PADDLE_HEIGHT, prevAiY + AI_SPEED);
            }

            return newAiY;
          });

          // Scoring
          if (newX <= 0) {
            // Player scores
            setPlayerScore(prev => {
              const newScore = prev + 1;
              if (newScore >= 5) {
                setGameState('gameover');
                if (newScore > highScore) {
                  setHighScore(newScore);
                  localStorage.setItem('orangePongHighScore', String(newScore));
                }
              } else {
                setTimeout(() => resetBall(-1), 500);
              }
              return newScore;
            });
            return prevY;
          }

          if (newX >= width - BALL_SIZE) {
            // AI scores
            setAiScore(prev => {
              const newScore = prev + 1;
              if (newScore >= 5) {
                setGameState('gameover');
              } else {
                setTimeout(() => resetBall(1), 500);
              }
              return newScore;
            });
            return prevY;
          }

          return newY;
        });

        return prevX + ballVX;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, ballVX, ballVY, resetBall, highScore]);

  const playerWon = playerScore >= 5;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowInfo(true)}>
              <IonIcon icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Orange Pong</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="pong-content" scrollY={false}>
        {gameState === 'playing' && (
          <div className="pong-score">
            <span className="score ai-score">{aiScore}</span>
            <span className="score-divider">-</span>
            <span className="score player-score">{playerScore}</span>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="pong-area"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseMove={handleMouseMove}
        >
          {gameState === 'idle' && (
            <div className="game-menu">
              <div className="game-title">Orange Pong</div>
              <div className="game-emoji">🏓</div>
              <p className="game-desc">Drag to move your paddle!</p>
              <p className="game-desc">First to 5 wins</p>
              {highScore > 0 && (
                <p className="high-score">Best Score: {highScore}</p>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play
              </IonButton>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="game-menu">
              <div className="game-title">{playerWon ? 'You Win!' : 'You Lose!'}</div>
              <div className="final-score">
                <span className="score-label">Final Score</span>
                <span className="score-value">{playerScore} - {aiScore}</span>
              </div>
              {playerWon && playerScore > highScore && (
                <div className="new-record">New Record!</div>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play Again
              </IonButton>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {/* Center line */}
              <div className="center-line" />

              {/* AI Paddle (left) */}
              <div
                className="paddle ai-paddle"
                style={{ top: aiY }}
              />

              {/* Player Paddle (right) */}
              <div
                className="paddle player-paddle"
                style={{ top: playerY }}
              />

              {/* Ball */}
              <div
                className="pong-ball"
                style={{ left: ballX, top: ballY }}
              >
                &#x1F34A;
              </div>
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
                <p><strong>Goal:</strong> Score 5 points to win!</p>
                <p><strong>Controls:</strong> Drag your finger to move your paddle (right side).</p>
                <p><strong>Tips:</strong></p>
                <ul>
                  <li>Hit the ball at different angles to trick the AI</li>
                  <li>The ball speeds up after each hit</li>
                  <li>Aim for the corners to score</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrangePong;
