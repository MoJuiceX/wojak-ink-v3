// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import './OrangePong.css';

const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 30;
const WIN_SCORE = 5; // First to 5 points wins the match

// AI difficulty - moderate so players can have long rallies
const AI_SPEED = 3.0;
const AI_REACTION_ZONE = 20;

// Scoring:
// - Time points: +1 point every second of play (rewards long rallies)
// - Win point against AI: +50 points (big reward for scoring)
// - Lose a point to AI: no penalty to total, but AI gets closer to winning
// - Match ends when someone reaches WIN_SCORE (5)

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

interface LocalLeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

const OrangePong: React.FC = () => {
  const { playPaddleHit, playWallBounce, playScorePoint, playWinSound, playGameOver } = useGameSounds();

  // Visual effects system
  const {
    effects,
    triggerShockwave,
    triggerSparks,
    triggerVignette,
    triggerScreenShake,
    addFloatingEmoji,
    showEpicCallout,
    triggerConfetti,
    updateCombo,
    resetCombo,
    addScorePopup,
    resetAllEffects,
  } = useGameEffects();

  // Global leaderboard hook
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('orange-pong');

  // Background music controls
  const { isBackgroundMusicPlaying, playBackgroundMusic, pauseBackgroundMusic } = useAudio();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing',
  });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [playTime, setPlayTime] = useState(0); // Seconds played
  const [playerY, setPlayerY] = useState(0);
  const [aiY, setAiY] = useState(0);
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(0);
  const [ballVX, setBallVX] = useState(5);
  const [ballVY, setBallVY] = useState(3);
  const [playerName, setPlayerName] = useState('');
  const [sadImage, setSadImage] = useState('');
  const [localLeaderboard, setLocalLeaderboard] = useState<LocalLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('orangePongLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('orangePongHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const playerYRef = useRef(0);

  // Ref for game loop to check dialog state
  const showExitDialogRef = useRef(false);
  useEffect(() => {
    showExitDialogRef.current = showExitDialog;
  }, [showExitDialog]);

  // Rally tracking for combo effects
  const [rally, setRally] = useState(0);
  const rallyRef = useRef(0);

  // Subtle hit ripples at paddle contact points
  const [hitRipples, setHitRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const hitRippleIdRef = useRef(0);

  // Sound refs for use in game loop
  const playPaddleHitRef = useRef(playPaddleHit);
  const playWallBounceRef = useRef(playWallBounce);
  const playScorePointRef = useRef(playScorePoint);
  const playWinSoundRef = useRef(playWinSound);
  const playGameOverRef = useRef(playGameOver);

  // Effect refs for use in game loop
  const triggerShockwaveRef = useRef(triggerShockwave);
  const triggerSparksRef = useRef(triggerSparks);
  const triggerVignetteRef = useRef(triggerVignette);
  const triggerScreenShakeRef = useRef(triggerScreenShake);
  const addFloatingEmojiRef = useRef(addFloatingEmoji);
  const showEpicCalloutRef = useRef(showEpicCallout);
  const triggerConfettiRef = useRef(triggerConfetti);
  const updateComboRef = useRef(updateCombo);
  const resetComboRef = useRef(resetCombo);
  const addScorePopupRef = useRef(addScorePopup);

  // Keep refs updated
  useEffect(() => {
    playPaddleHitRef.current = playPaddleHit;
    playWallBounceRef.current = playWallBounce;
    playScorePointRef.current = playScorePoint;
    playWinSoundRef.current = playWinSound;
    playGameOverRef.current = playGameOver;
  }, [playPaddleHit, playWallBounce, playScorePoint, playWinSound, playGameOver]);

  // Keep effect refs updated
  useEffect(() => {
    triggerShockwaveRef.current = triggerShockwave;
    triggerSparksRef.current = triggerSparks;
    triggerVignetteRef.current = triggerVignette;
    triggerScreenShakeRef.current = triggerScreenShake;
    addFloatingEmojiRef.current = addFloatingEmoji;
    showEpicCalloutRef.current = showEpicCallout;
    triggerConfettiRef.current = triggerConfetti;
    updateComboRef.current = updateCombo;
    resetComboRef.current = resetCombo;
    addScorePopupRef.current = addScorePopup;
  }, [triggerShockwave, triggerSparks, triggerVignette, triggerScreenShake, addFloatingEmoji, showEpicCallout, triggerConfetti, updateCombo, resetCombo, addScorePopup]);

  const resetBall = useCallback((direction: number) => {
    const width = gameAreaRef.current?.offsetWidth || 300;
    const height = gameAreaRef.current?.offsetHeight || 500;

    setBallX(width / 2 - BALL_SIZE / 2);
    setBallY(height / 2 - BALL_SIZE / 2);
    setBallVX(5 * direction);
    setBallVY((Math.random() - 0.5) * 6);
  }, []);

  // Add a subtle hit ripple at the paddle contact point
  const addHitRipple = useCallback((x: number, y: number) => {
    const id = hitRippleIdRef.current++;
    setHitRipples(prev => [...prev, { id, x, y }]);
    // Remove after animation completes
    setTimeout(() => {
      setHitRipples(prev => prev.filter(r => r.id !== id));
    }, 400);
  }, []);

  const startGame = () => {
    const height = gameAreaRef.current?.offsetHeight || 500;
    const centerY = (height - PADDLE_HEIGHT) / 2;

    setPlayerScore(0);
    setAiScore(0);
    setTotalPoints(0);
    setPlayTime(0);
    setPlayerY(centerY);
    setAiY(centerY);
    playerYRef.current = centerY;
    setPlayerName('');
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    // Reset rally and effects
    setRally(0);
    rallyRef.current = 0;
    resetAllEffects();
    // Ball starts going to AI first
    resetBall(-1);
    setGameState('playing');
  };

  const goToMenu = () => {
    setGameState('idle');
    setPlayerName('');
  };

  // Auto-start game on mount (unified intro from GameModal)
  useEffect(() => {
    // Small delay to ensure refs are ready
    const timer = setTimeout(() => {
      if (gameState === 'idle') {
        startGame();
      }
    }, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save score to local leaderboard (for guests)
  const saveScoreLocal = () => {
    if (!playerName.trim()) return;

    const newEntry: LocalLeaderboardEntry = {
      name: playerName.trim(),
      score: totalPoints,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...localLeaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLocalLeaderboard(updatedLeaderboard);
    localStorage.setItem('orangePongLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  // Auto-submit score to global leaderboard (for signed-in users)
  const submitScoreGlobal = useCallback(async (finalScore: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    // Update local high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('orangePongHighScore', String(finalScore));
    }

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, undefined, {
      matchResult: playerScore >= WIN_SCORE ? 'won' : 'lost',
    });

    if (result.success) {
      console.log('[OrangePong] Score submitted:', result);
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    } else {
      console.error('[OrangePong] Failed to submit score:', result.error);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, playerScore, highScore]);

  const skipSaveScore = () => {
    setPlayerName('');
    goToMenu();
  };

  // Merge global and local leaderboard for display
  const displayLeaderboard = globalLeaderboard.length > 0
    ? globalLeaderboard.map(entry => ({
        name: entry.displayName,
        score: entry.score,
        date: entry.date,
      }))
    : localLeaderboard;

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

  // Touch controls - use native event listener for non-passive touch handling
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      e.stopPropagation();

      const height = gameArea.offsetHeight || 500;
      const rect = gameArea.getBoundingClientRect();

      const touchY = e.touches[0].clientY - rect.top;
      const newY = Math.max(0, Math.min(height - PADDLE_HEIGHT, touchY - PADDLE_HEIGHT / 2));

      setPlayerY(newY);
      playerYRef.current = newY;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent any default touch behavior
    };

    // Add non-passive listeners for touch control
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameArea.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      gameArea.removeEventListener('touchmove', handleTouchMove);
      gameArea.removeEventListener('touchstart', handleTouchStart);
    };
  }, [gameState]);

  // Time-based scoring: +1 point every second while playing
  useEffect(() => {
    if (gameState !== 'playing' || showExitDialog) return;

    const timer = setInterval(() => {
      setPlayTime(prev => prev + 1);
      setTotalPoints(prev => prev + 1); // +1 point per second
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showExitDialog]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // Pause game loop when exit dialog is shown
      if (showExitDialogRef.current) {
        animationRef.current = requestAnimationFrame(gameLoop);
        return;
      }

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

            // Visual effects on player hit
            rallyRef.current += 1;
            setRally(rallyRef.current);
            updateComboRef.current(rallyRef.current);

            // Subtle hit ripple at paddle contact point
            addHitRipple(playerPaddleX, newY + BALL_SIZE / 2);

            if (rallyRef.current >= 5) {
              addFloatingEmojiRef.current('🔥');
            }
            // Rally milestone callouts
            if (rallyRef.current === 5) {
              showEpicCalloutRef.current('🏓 RALLY 5!');
            } else if (rallyRef.current === 10) {
              showEpicCalloutRef.current('⚡ RALLY 10!');
            } else if (rallyRef.current === 15) {
              showEpicCalloutRef.current('🔥 RALLY 15!');
            } else if (rallyRef.current === 20) {
              showEpicCalloutRef.current('👑 LEGENDARY RALLY!');
            }
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

              // Visual effects on AI hit
              rallyRef.current += 1;
              setRally(rallyRef.current);

              // Subtle hit ripple at AI paddle contact point
              addHitRipple(aiPaddleX + PADDLE_WIDTH, newY + BALL_SIZE / 2);
            }

            // AI movement - fixed difficulty
            const aiCenter = prevAiY + PADDLE_HEIGHT / 2;
            const ballCenter = newY + BALL_SIZE / 2;
            let newAiY = prevAiY;

            // AI only moves if ball is far enough from center (reaction zone)
            if (ballCenter < aiCenter - AI_REACTION_ZONE) {
              newAiY = Math.max(0, prevAiY - AI_SPEED);
            } else if (ballCenter > aiCenter + AI_REACTION_ZONE) {
              newAiY = Math.min(height - PADDLE_HEIGHT, prevAiY + AI_SPEED);
            }

            return newAiY;
          });

          // Scoring - Player scores (ball goes past AI on left)
          if (newX <= 0) {
            playScorePointRef.current();

            // Visual celebration for scoring
            triggerShockwaveRef.current(10, 50);
            triggerSparksRef.current(10, 50);
            triggerScreenShakeRef.current();
            addFloatingEmojiRef.current('🎯');

            // Rally bonus - extra points for long rallies
            const rallyBonus = Math.min(rallyRef.current * 5, 100);
            const scoreAmount = 50 + rallyBonus;
            const popupText = rallyRef.current >= 5 ? `+${scoreAmount} RALLY BONUS` : `+${scoreAmount}`;
            addScorePopupRef.current(popupText, 30, 50, '#00ff88');

            // +50 points for scoring against AI + rally bonus
            setTotalPoints(prev => prev + scoreAmount);

            // Reset rally after scoring
            rallyRef.current = 0;
            setRally(0);
            resetComboRef.current();

            setPlayerScore(prev => {
              const newScore = prev + 1;
              if (newScore >= WIN_SCORE) {
                // Player wins the match! Game over with victory
                playWinSoundRef.current();
                triggerConfettiRef.current();
                showEpicCalloutRef.current('🏆 VICTORY!');
                setGameState('gameover');
              } else {
                showEpicCalloutRef.current('🎯 SCORE!');
                setTimeout(() => resetBall(-1), 500);
              }
              return newScore;
            });
            return prevY;
          }

          // AI scores (ball goes past player on right)
          if (newX >= width - BALL_SIZE) {
            // Negative feedback - vignette and shake
            triggerVignetteRef.current();
            triggerScreenShakeRef.current();

            // Reset rally
            rallyRef.current = 0;
            setRally(0);
            resetComboRef.current();

            setAiScore(prev => {
              const newScore = prev + 1;
              if (newScore >= WIN_SCORE) {
                // AI wins - game over, keep accumulated points
                playGameOverRef.current();
                showEpicCalloutRef.current('💀 GAME OVER');
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

  // Auto-submit score for signed-in users when game ends
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && totalPoints > 0 && !scoreSubmitted) {
      submitScoreGlobal(totalPoints);
    }
  }, [gameState, isSignedIn, totalPoints, scoreSubmitted, submitScoreGlobal]);

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

      {/* PLAYING STATE: Game Layout with Stats Panel on LEFT */}
      {gameState === 'playing' && (
        <div className="game-layout">
          {/* Stats Panel - LEFT side (FIXED 4 items) */}
          <div className="stats-panel">
            <div className="stat-item points-stat">
              <span className="stat-label">Points</span>
              <span className="stat-value">{totalPoints}</span>
            </div>
            <div className="stat-item match-stat">
              <span className="stat-label">Score</span>
              <span className="stat-value match-score">
                <span className="ai-score-val">{aiScore}</span>
                <span className="score-divider">-</span>
                <span className="player-score-val">{playerScore}</span>
              </span>
            </div>
            <div className="stat-item time-stat">
              <span className="stat-label">Time</span>
              <span className="stat-value">{playTime}s</span>
            </div>
            <div className="stat-item goal-stat">
              <span className="stat-label">First to</span>
              <span className="stat-value">{WIN_SCORE}</span>
            </div>
          </div>

          {/* Lightbox wrapper for game area - RIGHT side */}
          <div className={`lightbox-wrapper ${effects.showScreenShake ? 'screen-shake' : ''}`}>
            {/* Visual Effects Layer */}
            <GameEffects effects={effects} accentColor="#ff6b00" />

            {/* Music toggle button */}
            <button
              className="music-toggle-btn"
              onClick={() => isBackgroundMusicPlaying ? pauseBackgroundMusic() : playBackgroundMusic()}
            >
              {isBackgroundMusicPlaying ? '🔊' : '🔇'}
            </button>

            <div
              ref={gameAreaRef}
              className="pong-area"
            >
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

              {/* Subtle hit ripples at paddle contact points */}
              {hitRipples.map(ripple => (
                <div
                  key={ripple.id}
                  className="pong-hit-ripple"
                  style={{ left: ripple.x, top: ripple.y }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NON-PLAYING STATES: Menu and Game Over */}
      {gameState !== 'playing' && (
      <div
        ref={gameState !== 'playing' ? gameAreaRef : undefined}
        className="pong-area"
      >
        {/* Main Menu removed - now handled by unified GameModal intro screen */}

        {/* Game Over */}
        {gameState === 'gameover' && (
          <div className="pong-game-over-overlay" onClick={(e) => e.stopPropagation()}>
            {/* Main Game Over Content - stays fixed */}
            <div className="pong-game-over-content">
              <div className="pong-game-over-left">
                {playerScore >= WIN_SCORE ? (
                  <div className="pong-game-over-emoji">🏆</div>
                ) : sadImage ? (
                  <img src={sadImage} alt="Game Over" className="pong-sad-image" />
                ) : (
                  <div className="pong-game-over-emoji">😢</div>
                )}
              </div>
              <div className="pong-game-over-right">
                <h2 className="pong-game-over-title">
                  {playerScore >= WIN_SCORE ? 'You Won!' : 'Game Over!'}
                </h2>

                <div className="pong-game-over-reason">
                  {playerScore >= WIN_SCORE
                    ? `You beat the AI ${playerScore} - ${aiScore}!`
                    : `AI beat you ${aiScore} - ${playerScore}`}
                </div>

                <div className="pong-game-over-score">
                  <span className="pong-score-value">{totalPoints}</span>
                  <span className="pong-score-label">total points</span>
                </div>

                <div className="pong-game-over-stats">
                  <div className="pong-stat">
                    <span className="pong-stat-value">{playTime}s</span>
                    <span className="pong-stat-label">time</span>
                  </div>
                  <div className="pong-stat">
                    <span className="pong-stat-value">{highScore}</span>
                    <span className="pong-stat-label">best</span>
                  </div>
                </div>

                {(isNewPersonalBest || totalPoints > highScore) && totalPoints > 0 && (
                  <div className="pong-new-record">New Personal Best!</div>
                )}

                {isSignedIn && (
                  <div className="pong-submitted">
                    {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                  </div>
                )}

                {/* Guest name input */}
                {!isSignedIn && totalPoints > 0 && (
                  <div className="pong-guest-form">
                    <input
                      type="text"
                      className="pong-name-input"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={15}
                      onKeyDown={(e) => e.key === 'Enter' && saveScoreLocal()}
                    />
                  </div>
                )}

                {/* Buttons: Play Again + Leaderboard */}
                <div className="pong-game-over-buttons">
                  <button onClick={!isSignedIn && playerName.trim() ? saveScoreLocal : startGame} className="pong-play-btn">
                    {!isSignedIn && playerName.trim() ? 'Save & Play' : 'Play Again'}
                  </button>
                  <button
                    onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                    className="pong-leaderboard-btn"
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard Panel - overlays on top */}
            {showLeaderboardPanel && (
              <div className="pong-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
                <div className="pong-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="pong-leaderboard-header">
                    <h3>{globalLeaderboard.length > 0 ? 'Leaderboard' : 'Leaderboard'}</h3>
                    <button className="pong-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                  </div>
                  <div className="pong-leaderboard-list">
                    {Array.from({ length: 10 }, (_, index) => {
                      const entry = displayLeaderboard[index];
                      const isCurrentUser = entry && totalPoints === entry.score;
                      return (
                        <div key={index} className={`pong-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                          <span className="pong-leaderboard-rank">#{index + 1}</span>
                          <span className="pong-leaderboard-name">{entry?.name || '---'}</span>
                          <span className="pong-leaderboard-score">{entry?.score ?? '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Back to Games - positioned in safe area (bottom right) */}
            <button
              onClick={() => { window.location.href = '/games'; }}
              className="pong-back-to-games-btn"
            >
              Back to Games
            </button>
          </div>
        )}
      </div>
      )}

      {/* Exit Game Confirmation Dialog */}
      <ConfirmModal
        isOpen={showExitDialog}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="Leave Game?"
        message="Your progress will be lost. Are you sure you want to leave?"
        confirmText="Leave"
        cancelText="Stay"
        variant="warning"
        icon="🎮"
      />
    </div>
  );
};

export default OrangePong;
