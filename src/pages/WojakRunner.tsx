// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEffects, GameEffects } from '@/components/media';
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

interface LocalLeaderboardEntry {
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
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

const WojakRunner: React.FC = () => {
  const { playCollect, playGameOver, startRunning, stopRunning } = useGameSounds();

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
  } = useLeaderboard('wojak-runner');

  // Background music controls
  const { isBackgroundMusicPlaying, playBackgroundMusic, pauseBackgroundMusic } = useAudio();

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
  const [localLeaderboard, setLocalLeaderboard] = useState<LocalLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('wojakRunnerLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [sadImage, setSadImage] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const obstacleIdRef = useRef(0);
  const collectibleIdRef = useRef(0);
  const touchStartXRef = useRef(0);
  const lastSpawnRef = useRef(0);

  // Collect streak tracking
  const [collectStreak, setCollectStreak] = useState(0);
  const collectStreakRef = useRef(0);
  const lastDistanceMilestoneRef = useRef(0);

  // Sound refs for use in game loop
  const playCollectRef = useRef(playCollect);
  const playGameOverRef = useRef(playGameOver);
  const startRunningRef = useRef(startRunning);
  const stopRunningRef = useRef(stopRunning);

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
    playCollectRef.current = playCollect;
    playGameOverRef.current = playGameOver;
    startRunningRef.current = startRunning;
    stopRunningRef.current = stopRunning;
  }, [playCollect, playGameOver, startRunning, stopRunning]);

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

  // Start/stop running sound based on game state
  useEffect(() => {
    if (gameState === 'playing') {
      // Start running footsteps at 180 BPM
      startRunningRef.current(180);
    } else {
      stopRunningRef.current();
    }
  }, [gameState]);

  // Auto-start game on mount (unified intro from GameModal)
  useEffect(() => {
    if (gameState === 'idle') {
      startGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    lastDistanceMilestoneRef.current = 0;
    setPlayerName('');
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    // Reset streak and effects
    setCollectStreak(0);
    collectStreakRef.current = 0;
    resetAllEffects();
    setGameState('playing');
  };

  const goToMenu = () => {
    setGameState('idle');
    setPlayerName('');
  };

  // Save score to local leaderboard (for guests)
  const saveScoreLocal = () => {
    if (!playerName.trim()) return;

    const finalScore = score + Math.floor(distance / 10);
    const newEntry: LocalLeaderboardEntry = {
      name: playerName.trim(),
      score: finalScore,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...localLeaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLocalLeaderboard(updatedLeaderboard);
    localStorage.setItem('wojakRunnerLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  // Auto-submit score to global leaderboard (for signed-in users)
  const submitScoreGlobal = useCallback(async (finalScore: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, undefined, {
      distance: distance,
    });

    if (result.success) {
      console.log('[WojakRunner] Score submitted:', result);
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    } else {
      console.error('[WojakRunner] Failed to submit score:', result.error);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, distance]);

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

      // Update distance and speed (no sound on speed increase - silent)
      setDistance(prev => {
        const newDist = prev + 1;
        if (newDist % 500 === 0) {
          setSpeed(s => Math.min(s + 0.5, 15));
        }

        // Distance milestone callouts (every 100m)
        const distanceInMeters = Math.floor(newDist / 10);
        const lastMilestone = lastDistanceMilestoneRef.current;
        if (distanceInMeters >= 100 && distanceInMeters % 100 === 0 && distanceInMeters > lastMilestone) {
          lastDistanceMilestoneRef.current = distanceInMeters;
          if (distanceInMeters === 100) {
            showEpicCalloutRef.current('100m!');
          } else if (distanceInMeters === 250) {
            showEpicCalloutRef.current('250m!');
            triggerConfettiRef.current();
          } else if (distanceInMeters === 500) {
            showEpicCalloutRef.current('HALFWAY LEGEND!');
            triggerConfettiRef.current();
          } else if (distanceInMeters === 1000) {
            showEpicCalloutRef.current('1KM MASTER!');
            triggerConfettiRef.current();
          } else if (distanceInMeters % 500 === 0) {
            showEpicCalloutRef.current(`${distanceInMeters}m!`);
            triggerConfettiRef.current();
          }
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
            // Crash effects
            triggerVignetteRef.current('#ff0000');
            triggerScreenShakeRef.current(600);
            triggerSparksRef.current('#ff4444');
            addFloatingEmojiRef.current('💥');
            resetComboRef.current();

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

              // Update streak
              collectStreakRef.current += 1;
              setCollectStreak(collectStreakRef.current);

              // Calculate bonus based on streak
              const streakBonus = Math.min(collectStreakRef.current - 1, 5) * 2;
              const totalPoints = 10 + streakBonus;
              setScore(s => s + totalPoints);

              // Visual effects
              triggerShockwaveRef.current('#ff6b00', 0.6); // Orange shockwave
              triggerSparksRef.current('#ff6b00');
              addScorePopupRef.current(`+${totalPoints}`);
              updateComboRef.current();
              addFloatingEmojiRef.current('🍊');

              // Streak milestones
              if (collectStreakRef.current === 5) {
                showEpicCalloutRef.current('ORANGE FRENZY!');
              } else if (collectStreakRef.current === 10) {
                showEpicCalloutRef.current('UNSTOPPABLE!');
                triggerConfettiRef.current();
              } else if (collectStreakRef.current === 15) {
                showEpicCalloutRef.current('LEGENDARY!');
                triggerConfettiRef.current();
              }

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

  // Auto-submit score for signed-in users when game ends
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && totalScore > 0 && !scoreSubmitted) {
      submitScoreGlobal(totalScore);
    }
  }, [gameState, isSignedIn, totalScore, scoreSubmitted, submitScoreGlobal]);
  const width = gameAreaRef.current?.offsetWidth || 300;
  const laneOffset = (width - LANE_WIDTH * 3) / 2;

  return (
    <div className={`runner-container ${gameState === 'playing' ? 'playing-mode' : ''}`}>
      {/* PLAYING STATE: Game Layout with Stats Panel on LEFT */}
      {gameState === 'playing' && (
        <div className="game-layout">
          {/* Stats Panel - LEFT side */}
          <div className="stats-panel">
            <div className="stat-item score-stat">
              <span className="stat-label">Score</span>
              <span className="stat-value">{totalScore}</span>
            </div>
            <div className="stat-item best-stat">
              <span className="stat-label">Best</span>
              <span className="stat-value">{highScore}</span>
            </div>
            <div className="stat-item speed-stat">
              <span className="stat-label">Speed</span>
              <span className="stat-value">{speed.toFixed(1)}x</span>
            </div>
            <div className="stat-item distance-stat">
              <span className="stat-label">Distance</span>
              <span className="stat-value">{Math.floor(distance / 10)}m</span>
            </div>
          </div>

          {/* Lightbox wrapper for game area - RIGHT side */}
          <div className={`lightbox-wrapper ${effects.screenShake ? 'screen-shake' : ''}`}>
            {/* Music toggle button */}
            <button
              className="music-toggle-btn"
              onClick={() => isBackgroundMusicPlaying ? pauseBackgroundMusic() : playBackgroundMusic()}
            >
              {isBackgroundMusicPlaying ? '🔊' : '🔇'}
            </button>

            {/* Game Effects Layer */}
            <GameEffects effects={effects} accentColor="#ff6b00" />

            <div
              ref={gameAreaRef}
              className="runner-area playing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
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
            </div>
          </div>
        </div>
      )}

      {/* NON-PLAYING STATES: Menu and Game Over */}
      {gameState !== 'playing' && (
      <div className="runner-content">
        <div
          ref={gameState !== 'playing' ? gameAreaRef : undefined}
          className="runner-area"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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

                {/* Slide-in Leaderboard Panel */}
                <div className={`leaderboard-slide-panel ${showLeaderboardPanel ? 'open' : ''}`}>
                  <div className="leaderboard-panel-header">
                    <h3>{globalLeaderboard.length > 0 ? 'Global Leaderboard' : 'Leaderboard'}</h3>
                    <button className="leaderboard-close-btn" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                  </div>
                  <div className="leaderboard-panel-list">
                    {Array.from({ length: 10 }, (_, index) => {
                      const entry = displayLeaderboard[index];
                      const isCurrentUser = entry && totalScore === entry.score;
                      return (
                        <div key={index} className={`leaderboard-panel-entry ${isCurrentUser ? 'current-user' : ''}`}>
                          <span className="leaderboard-panel-rank">#{index + 1}</span>
                          <span className="leaderboard-panel-name">{entry?.name || '---'}</span>
                          <span className="leaderboard-panel-score">{entry?.score || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
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

                {/* New Personal Best celebration */}
                {(isNewPersonalBest || totalScore >= highScore) && totalScore > 0 && (
                  <div className="game-over-record">🌟 New Personal Best! 🌟</div>
                )}

                {isSignedIn ? (
                  // Signed-in user - auto-submitted
                  <div className="game-over-form">
                    <div className="game-over-submitted">
                      {isSubmitting ? (
                        <span>Saving score...</span>
                      ) : scoreSubmitted ? (
                        <span>Score saved as {userDisplayName || 'Anonymous'}!</span>
                      ) : null}
                    </div>
                    <div className="game-over-buttons">
                      <button onClick={startGame} className="play-btn">
                        Play Again
                      </button>
                      <button onClick={goToMenu} className="play-btn" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        Menu
                      </button>
                    </div>
                    {/* Leaderboard button */}
                    <button
                      className="leaderboard-toggle-btn"
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                    >
                      {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                    </button>
                  </div>
                ) : (
                  // Guest - show name input
                  <div className="game-over-form">
                    <input
                      type="text"
                      className="game-over-input"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={15}
                      onKeyDown={(e) => e.key === 'Enter' && saveScoreLocal()}
                    />
                    <div className="game-over-buttons">
                      <button
                        onClick={saveScoreLocal}
                        className="game-over-save"
                        disabled={!playerName.trim()}
                      >
                        Save Score
                      </button>
                      <button onClick={skipSaveScore} className="game-over-skip">
                        Skip
                      </button>
                    </div>
                    {/* Leaderboard button */}
                    <button
                      className="leaderboard-toggle-btn"
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                    >
                      {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default WojakRunner;
