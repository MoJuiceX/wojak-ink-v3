/**
 * Wojak Whack Game
 *
 * Whack-a-Mole style game with Wojak characters.
 * Tap characters as they pop up from holes during a 60-second round.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useGameEffects } from '@/components/media';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import './WojakWhack.css';

// =============================================================================
// TYPES
// =============================================================================

interface Character {
  type: 'regular' | 'happy' | 'golden' | 'bad';
  points: number;
  emoji: string;
  color: string;
}

interface Hole {
  id: number;
  character: Character | null;
  isActive: boolean;
  showTime: number;
  hitAnimating: boolean;
}

type GameStatus = 'idle' | 'playing' | 'gameover';

// =============================================================================
// CONSTANTS
// =============================================================================

const CHARACTERS: Record<string, Character & { chance: number }> = {
  regular: {
    type: 'regular',
    points: 10,
    emoji: '😐',
    color: '#FFD700',
    chance: 0.6,
  },
  happy: {
    type: 'happy',
    points: 25,
    emoji: '😊',
    color: '#00FF88',
    chance: 0.2,
  },
  golden: {
    type: 'golden',
    points: 50,
    emoji: '🌟',
    color: '#FFD700',
    chance: 0.1,
  },
  bad: {
    type: 'bad',
    points: -30,
    emoji: '😈',
    color: '#FF4444',
    chance: 0.1,
  },
};

const GAME_DURATION = 60;

const DIFFICULTY_CONFIG = {
  1: { visibleTime: 1500, spawnMin: 800, spawnMax: 1500 },
  2: { visibleTime: 1000, spawnMin: 500, spawnMax: 1000 },
  3: { visibleTime: 600, spawnMin: 300, spawnMax: 700 },
} as const;

// =============================================================================
// COMPONENT
// =============================================================================

export default function WojakWhack() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Hooks
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver } = useGameSounds();
  const { hapticScore, hapticCollision, hapticGameOver } = useGameHaptics();
  const {
    triggerScreenShake,
    triggerConfetti,
    showEpicCallout,
    addScorePopup,
  } = useGameEffects();
  const { submitScore, isSignedIn, leaderboard: globalLeaderboard, userDisplayName, isSubmitting } = useLeaderboard('wojak-whack');
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // Game state
  const [status, setStatus] = useState<GameStatus>('idle');
  const [holes, setHoles] = useState<Hole[]>(() =>
    Array(9)
      .fill(null)
      .map((_, i) => ({
        id: i,
        character: null,
        isActive: false,
        showTime: 0,
        hitAnimating: false,
      }))
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [totalSpawns, setTotalSpawns] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Refs for intervals/timeouts
  const timerRef = useRef<number | null>(null);
  const spawnTimeoutRef = useRef<number | null>(null);
  const hideTimeoutsRef = useRef<Map<number, number>>(new Map());
  const maxComboRef = useRef(0);
  const statusRef = useRef<GameStatus>('idle');
  const holesRef = useRef<Hole[]>(holes);

  // Keep refs in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    holesRef.current = holes;
  }, [holes]);

  useEffect(() => {
    if (combo > maxComboRef.current) {
      maxComboRef.current = combo;
    }
  }, [combo]);

  // =============================================================================
  // GAME LOGIC
  // =============================================================================

  const getRandomCharacter = useCallback((): Character => {
    const rand = Math.random();
    let cumulative = 0;

    for (const char of Object.values(CHARACTERS)) {
      cumulative += char.chance;
      if (rand < cumulative) {
        return {
          type: char.type,
          points: char.points,
          emoji: char.emoji,
          color: char.color,
        };
      }
    }

    return CHARACTERS.regular;
  }, []);

  const getAvailableHole = useCallback((): number | null => {
    const availableHoles = holesRef.current
      .filter((hole) => !hole.isActive && !hole.hitAnimating)
      .map((hole) => hole.id);

    if (availableHoles.length === 0) return null;
    return availableHoles[Math.floor(Math.random() * availableHoles.length)];
  }, []);

  const hideCharacter = useCallback((holeId: number) => {
    setHoles((prev) => {
      const newHoles = [...prev];
      if (newHoles[holeId].isActive && !newHoles[holeId].hitAnimating) {
        newHoles[holeId] = {
          ...newHoles[holeId],
          character: null,
          isActive: false,
        };
        // Reset combo on miss
        setCombo(0);
      }
      return newHoles;
    });
    hideTimeoutsRef.current.delete(holeId);
  }, []);

  const spawnCharacter = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const holeId = getAvailableHole();
    if (holeId === null) return;

    const character = getRandomCharacter();

    setHoles((prev) => {
      const newHoles = [...prev];
      newHoles[holeId] = {
        ...newHoles[holeId],
        character,
        isActive: true,
        showTime: Date.now(),
      };
      return newHoles;
    });

    setTotalSpawns((prev) => prev + 1);

    // Schedule hiding
    const config = DIFFICULTY_CONFIG[difficulty as 1 | 2 | 3] || DIFFICULTY_CONFIG[1];
    const hideTimeout = window.setTimeout(() => {
      hideCharacter(holeId);
    }, config.visibleTime);

    hideTimeoutsRef.current.set(holeId, hideTimeout);
  }, [difficulty, getAvailableHole, getRandomCharacter, hideCharacter]);

  const scheduleNextSpawn = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const config = DIFFICULTY_CONFIG[difficulty as 1 | 2 | 3] || DIFFICULTY_CONFIG[1];
    const delay = config.spawnMin + Math.random() * (config.spawnMax - config.spawnMin);

    spawnTimeoutRef.current = window.setTimeout(() => {
      spawnCharacter();
      scheduleNextSpawn();
    }, delay);
  }, [difficulty, spawnCharacter]);

  const handleGameOver = useCallback(async () => {
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (spawnTimeoutRef.current) {
      clearTimeout(spawnTimeoutRef.current);
      spawnTimeoutRef.current = null;
    }
    hideTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    hideTimeoutsRef.current.clear();

    if (soundEnabled) playGameOver();
    hapticGameOver();

    // Submit score
    if (isSignedIn) {
      try {
        const accuracy = totalSpawns > 0 ? Math.round((totalHits / totalSpawns) * 100) : 0;
        const result = await submitScore(score, undefined, {
          accuracy,
          totalHits,
          maxCombo: maxComboRef.current,
        });
        if (result?.isNewHighScore) {
          setIsNewHighScore(true);
        }
        setSubmitted(true);
      } catch {
        // Ignore submission errors
      }
    }
  }, [soundEnabled, playGameOver, hapticGameOver, isSignedIn, submitScore, score, totalSpawns, totalHits]);

  const startGame = useCallback(() => {
    // Reset state
    setStatus('playing');
    setHoles(
      Array(9)
        .fill(null)
        .map((_, i) => ({
          id: i,
          character: null,
          isActive: false,
          showTime: 0,
          hitAnimating: false,
        }))
    );
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setTotalSpawns(0);
    setTotalHits(0);
    setCombo(0);
    setDifficulty(1);
    setIsNewHighScore(false);
    setSubmitted(false);
    maxComboRef.current = 0;

    // Start timer
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Update difficulty
        if (newTime <= 20) {
          setDifficulty(3);
        } else if (newTime <= 40) {
          setDifficulty(2);
        }

        if (newTime <= 0) {
          setStatus('gameover');
          return 0;
        }

        return newTime;
      });
    }, 1000);

    // Start spawning (with small delay to let state update)
    setTimeout(() => {
      scheduleNextSpawn();
    }, 100);
  }, [scheduleNextSpawn]);

  // Handle game over when status changes
  useEffect(() => {
    if (status === 'gameover') {
      handleGameOver();
    }
  }, [status, handleGameOver]);

  // Time warnings
  useEffect(() => {
    if (status !== 'playing') return;

    if (timeLeft === 10) {
      showEpicCallout('10 SECONDS!');
      triggerScreenShake(20);
    } else if (timeLeft === 5) {
      showEpicCallout('FINAL 5!');
    }
  }, [timeLeft, status, showEpicCallout, triggerScreenShake]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current);
      hideTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // =============================================================================
  // HIT HANDLING
  // =============================================================================

  const onCharacterHit = useCallback(
    (character: Character, holeId: number, newCombo: number) => {
      // Get hole element for position
      const holeElement = document.getElementById(`hole-${holeId}`);
      const rect = holeElement?.getBoundingClientRect();

      // Score popup
      const popupText = character.points > 0 ? `+${character.points}` : `${character.points}`;
      if (rect) {
        addScorePopup(popupText, rect.left + rect.width / 2, rect.top);
      }

      // Character-specific effects
      if (character.type === 'bad') {
        if (soundEnabled) playGameOver();
        triggerScreenShake(30);
        showEpicCallout('OOPS!');
        hapticGameOver();
      } else {
        if (soundEnabled) playBlockLand();
        hapticScore();

        if (character.type === 'golden') {
          showEpicCallout('GOLDEN! +50');
          triggerConfetti();
          if (soundEnabled) playPerfectBonus();
          hapticCollision();
        } else if (character.type === 'happy') {
          showEpicCallout('BONUS!');
          if (soundEnabled) playCombo(newCombo);
        }
      }

      // Combo effects
      if (newCombo >= 3 && newCombo < 5) {
        showEpicCallout(`COMBO x${newCombo}`);
      }
      if (newCombo >= 5 && newCombo < 10) {
        triggerScreenShake(20);
        showEpicCallout(`COMBO x${newCombo}`);
      }
      if (newCombo >= 10 && newCombo < 15) {
        showEpicCallout('UNSTOPPABLE!');
        triggerConfetti();
      }
      if (newCombo >= 15) {
        showEpicCallout('GOD MODE!');
        triggerConfetti();
      }
    },
    [
      soundEnabled,
      playBlockLand,
      playPerfectBonus,
      playCombo,
      playGameOver,
      hapticScore,
      hapticCollision,
      hapticGameOver,
      triggerScreenShake,
      triggerConfetti,
      showEpicCallout,
      addScorePopup,
    ]
  );

  const handleHoleClick = useCallback(
    (holeId: number) => {
      if (status !== 'playing') return;

      const hole = holes[holeId];
      if (!hole.isActive || !hole.character) return;

      const character = hole.character;
      const points = character.points;
      const newCombo = points > 0 ? combo + 1 : 0;

      // Clear the hide timeout since we're hitting it
      const hideTimeout = hideTimeoutsRef.current.get(holeId);
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeoutsRef.current.delete(holeId);
      }

      // Update state
      setHoles((prev) => {
        const newHoles = [...prev];
        newHoles[holeId] = {
          ...newHoles[holeId],
          hitAnimating: true,
          isActive: false,
        };
        return newHoles;
      });

      setScore((prev) => Math.max(0, prev + points));
      setTotalHits((prev) => prev + 1);
      setCombo(newCombo);

      // Trigger effects
      onCharacterHit(character, holeId, newCombo);

      // Clear hit animation after delay
      setTimeout(() => {
        setHoles((prev) => {
          const newHoles = [...prev];
          newHoles[holeId] = {
            ...newHoles[holeId],
            character: null,
            hitAnimating: false,
          };
          return newHoles;
        });
      }, 300);
    },
    [status, holes, combo, onCharacterHit]
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  const accuracy = totalSpawns > 0 ? Math.round((totalHits / totalSpawns) * 100) : 0;

  return (
    <div className={`wojak-whack-container ${isMobile ? 'mobile' : ''}`}>
      {/* Control buttons */}
      <button
        className="ww-back-btn"
        onClick={() => navigate('/games')}
        aria-label="Back to games"
      >
        ←
      </button>
      <button
        className="ww-sound-btn"
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-label={soundEnabled ? 'Mute' : 'Unmute'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Header */}
      <div className="ww-header">
        <div className="ww-score-display">
          <span className="ww-score-label">Score</span>
          <span className="ww-score-value">{score}</span>
        </div>
        <div className="ww-timer-display">
          <span className={`ww-timer-value ${timeLeft <= 10 ? 'urgent' : ''}`}>
            {timeLeft}
          </span>
        </div>
        <div className="ww-combo-display">
          {combo >= 3 && <span className="ww-combo-value">x{combo}</span>}
        </div>
      </div>

      {/* Game Grid */}
      {status === 'idle' ? (
        <div className="ww-start-screen">
          <div className="ww-start-emoji">🔨</div>
          <h2 className="ww-start-title">WOJAK WHACK</h2>
          <p className="ww-start-description">Tap the Wojaks as they pop up!</p>
          <button className="ww-start-btn" onClick={startGame}>
            START GAME
          </button>
        </div>
      ) : (
        <div className="ww-holes-grid">
          {holes.map((hole) => (
            <div
              key={hole.id}
              id={`hole-${hole.id}`}
              className={`ww-hole ${hole.isActive ? 'active' : ''} ${hole.hitAnimating ? 'hit' : ''}`}
              onClick={() => handleHoleClick(hole.id)}
            >
              <div className="ww-hole-bg" />
              {hole.character && (
                <div
                  className={`ww-character ${hole.character.type} ${hole.isActive ? 'popping' : 'hiding'}`}
                >
                  <span className="ww-character-emoji">{hole.character.emoji}</span>
                </div>
              )}
              {hole.hitAnimating && <div className="ww-hit-effect">💥</div>}
            </div>
          ))}
        </div>
      )}

      {/* Character Legend */}
      {status === 'playing' && (
        <div className="ww-legend">
          <div className="ww-legend-item good">😐 +10</div>
          <div className="ww-legend-item bonus">😊 +25</div>
          <div className="ww-legend-item golden">🌟 +50</div>
          <div className="ww-legend-item bad">😈 -30</div>
        </div>
      )}

      {/* Game Over Overlay */}
      {status === 'gameover' && (
        <div className="ww-game-over-overlay" onClick={(e) => e.stopPropagation()}>
          {/* Main Game Over Content */}
          <div className="ww-game-over-content">
            <div className="ww-game-over-left">
              <div className="ww-game-over-emoji">🔨</div>
            </div>
            <div className="ww-game-over-right">
              <h2 className="ww-game-over-title">TIME'S UP!</h2>

              <div className="ww-game-over-score">
                <span className="ww-final-score-value">{score}</span>
                <span className="ww-final-score-label">Final Score</span>
              </div>

              <div className="ww-game-over-stats">
                <div className="ww-stat">
                  <span className="ww-stat-value">{accuracy}%</span>
                  <span className="ww-stat-label">Accuracy</span>
                </div>
                <div className="ww-stat">
                  <span className="ww-stat-value">{totalHits}</span>
                  <span className="ww-stat-label">Hits</span>
                </div>
                <div className="ww-stat">
                  <span className="ww-stat-value">{maxComboRef.current}</span>
                  <span className="ww-stat-label">Max Combo</span>
                </div>
              </div>

              {isNewHighScore && <div className="ww-new-record">NEW HIGH SCORE!</div>}
              {isSignedIn && (
                <div className="ww-submitted">
                  {isSubmitting ? 'Saving...' : submitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}

              {/* Buttons: Play Again + Leaderboard */}
              <div className="ww-game-over-buttons">
                <button className="ww-play-btn" onClick={startGame}>
                  Play Again
                </button>
                <button
                  onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                  className="ww-leaderboard-btn"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Panel - overlays on top */}
          {showLeaderboardPanel && (
            <div className="ww-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
              <div className="ww-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                <div className="ww-leaderboard-header">
                  <h3>Leaderboard</h3>
                  <button className="ww-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>x</button>
                </div>
                <div className="ww-leaderboard-list">
                  {Array.from({ length: 10 }, (_, index) => {
                    const entry = globalLeaderboard[index];
                    const isCurrentUser = entry && score === entry.score;
                    return (
                      <div key={index} className={`ww-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                        <span className="ww-leaderboard-rank">#{index + 1}</span>
                        <span className="ww-leaderboard-name">{entry?.displayName || '---'}</span>
                        <span className="ww-leaderboard-score">{entry?.score ?? '-'}</span>
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
            className="ww-back-to-games-btn"
          >
            Back to Games
          </button>
        </div>
      )}
    </div>
  );
}
