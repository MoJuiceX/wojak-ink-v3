// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import './OrangePong.css';

const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 30;
const AI_SPEED = 4;
const WIN_SCORE = 5;

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/games/sad_runner_${i + 1}.png`);

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

const OrangePong: React.FC = () => {
  const { playPaddleHit, playWallBounce, playScorePoint, playWinSound, playGameOver } = useGameSounds();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [aiY, setAiY] = useState(0);
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [ballVX, setBallVX] = useState(5);
  const [ballVY, setBallVY] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [sadImage, setSadImage] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('orangePongLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const playerYRef = useRef(0);

  // Sound refs for use in game loop
  const playPaddleHitRef = useRef(playPaddleHit);
  const playWallBounceRef = useRef(playWallBounce);
  const playScorePointRef = useRef(playScorePoint);
  const playWinSoundRef = useRef(playWinSound);
  const playGameOverRef = useRef(playGameOver);

  // Keep refs updated
  useEffect(() => {
    playPaddleHitRef.current = playPaddleHit;
    playWallBounceRef.current = playWallBounce;
    playScorePointRef.current = playScorePoint;
    playWinSoundRef.current = playWinSound;
    playGameOverRef.current = playGameOver;
  }, [playPaddleHit, playWallBounce, playScorePoint, playWinSound, playGameOver]);

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
    setTotalPoints(0);
    setWinStreak(0);
    setPlayerY(centerY);
    setAiY(centerY);
    playerYRef.current = centerY;
    setPlayerName('');
    resetBall(1);
    setGameState('playing');
  };

  const goToMenu = () => {
    setGameState('idle');
    setPlayerName('');
  };

  const saveScore = () => {
    if (!playerName.trim()) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: totalPoints,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('orangePongLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  const skipSaveScore = () => {
    setPlayerName('');
    goToMenu();
  };

  // Global mouse move handler - works outside the game area
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const height = gameAreaRef.current?.offsetHeight || 500;
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseY = e.clientY - rect.top;
      const newY = Math.max(0, Math.min(height - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));

      setPlayerY(newY);
      playerYRef.current = newY;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [gameState]);

  // Touch controls
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
            playWallBounceRef.current();
          }

          // Player paddle collision (right side)
          const playerPaddleX = width - PADDLE_WIDTH - 20;
          if (
            newX + BALL_SIZE >= playerPaddleX &&
            newX <= playerPaddleX + PADDLE_WIDTH &&
            newY + BALL_SIZE >= playerYRef.current &&
            newY <= playerYRef.current + PADDLE_HEIGHT
          ) {
            newVX = -Math.abs(ballVX) * 1.05;
            newX = playerPaddleX - BALL_SIZE;
            const hitPos = (newY + BALL_SIZE / 2 - playerYRef.current) / PADDLE_HEIGHT;
            newVY = (hitPos - 0.5) * 10;
            setBallVX(newVX);
            setBallVY(newVY);
            playPaddleHitRef.current();
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
              playPaddleHitRef.current();
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

          // Scoring - Player scores (ball goes past AI on left)
          if (newX <= 0) {
            playScorePointRef.current();

            setWinStreak(prev => {
              const newStreak = prev + 1;
              // Calculate points based on streak: 1, 2, 4 for 1, 2, 3+ wins
              const points = newStreak === 1 ? 1 : newStreak === 2 ? 2 : 4;
              setTotalPoints(tp => tp + points);
              return newStreak;
            });

            setPlayerScore(prev => {
              const newScore = prev + 1;
              if (newScore >= WIN_SCORE) {
                playWinSoundRef.current();
                setGameState('gameover');
              } else {
                setTimeout(() => resetBall(-1), 500);
              }
              return newScore;
            });
            return prevY;
          }

          // AI scores (ball goes past player on right)
          if (newX >= width - BALL_SIZE) {
            setWinStreak(0); // Reset streak when AI scores

            setAiScore(prev => {
              const newScore = prev + 1;
              if (newScore >= WIN_SCORE) {
                playGameOverRef.current();
                setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
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
  }, [gameState, ballVX, ballVY, resetBall]);

  const playerWon = playerScore >= WIN_SCORE;

  return (
    <div ref={containerRef} className="pong-container">
      {/* Animated background elements - only show on menu and game over */}
      {gameState !== 'playing' && (
        <div className="pong-bg-elements">
          <div className="floating-orange fo-1">🍊</div>
          <div className="floating-orange fo-2">🍊</div>
          <div className="floating-orange fo-3">🍊</div>
          <div className="floating-orange fo-4">🍊</div>
          <div className="floating-orange fo-5">🍊</div>
          <div className="floating-orange fo-6">🍊</div>
          <div className="floating-orange fo-7">🍊</div>
          <div className="floating-orange fo-8">🍊</div>
          <div className="floating-orange fo-9">🍊</div>
          <div className="floating-orange fo-10">🍊</div>
          <div className="floating-orange fo-11">🍊</div>
          <div className="floating-orange fo-12">🍊</div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="pong-score">
          <span className="score ai-score">{aiScore}</span>
          <span className="score-divider">-</span>
          <span className="score player-score">{playerScore}</span>
        </div>
      )}

      {/* Points display during gameplay */}
      {gameState === 'playing' && (
        <div className="pong-points">
          <span className="points-value">{totalPoints} pts</span>
          {winStreak > 0 && <span className="streak-indicator">🔥 {winStreak}x streak</span>}
        </div>
      )}

      <div
        ref={gameAreaRef}
        className="pong-area"
        onTouchMove={handleTouchMove}
      >
        {/* Main Menu - Split layout */}
        {gameState === 'idle' && (
          <div className="game-menu-split">
            {/* Left side - Title and Play */}
            <div className="menu-left">
              <div className="game-title">Orange Pong</div>
              <div className="game-emoji">🏓</div>
              <p className="game-desc">Move your paddle to hit the orange!</p>
              <p className="game-desc">First to 5 wins</p>
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

        {/* Game Over - Split Screen */}
        {gameState === 'gameover' && (
          <div className="game-over-screen">
            {/* Left side - Image */}
            <div className="game-over-left">
              {playerWon ? (
                <div className="game-over-emoji">🏆</div>
              ) : sadImage ? (
                <img
                  src={sadImage}
                  alt="Game Over"
                  className="sad-image-large"
                />
              ) : (
                <div className="game-over-emoji">😢</div>
              )}
            </div>

            {/* Right side - Content */}
            <div className="game-over-right">
              <div className="game-over-title">{playerWon ? 'You Win!' : 'Game Over!'}</div>

              <div className="game-over-reason">
                {playerWon ? 'You beat the AI!' : 'The AI beat you!'}
              </div>

              <div className="game-over-score">
                <span className="game-over-score-value">{totalPoints}</span>
                <span className="game-over-score-label">points</span>
              </div>

              <div className="game-over-match-score">
                Match: {playerScore} - {aiScore}
              </div>

              {totalPoints > 0 ? (
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
              ) : (
                <div className="game-over-buttons-single">
                  <button onClick={startGame} className="play-btn">
                    Try Again
                  </button>
                  <button onClick={goToMenu} className="game-over-skip">
                    Menu
                  </button>
                </div>
              )}
            </div>
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
    </div>
  );
};

export default OrangePong;
