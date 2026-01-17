import { IonPage, IonContent } from '@ionic/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howler } from 'howler';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameEffects, GameEffects } from '@/components/media';
import './ColorReaction.css';

// Color definitions
const COLORS = [
  { name: 'orange', hex: '#FF6B00', emoji: '🍊' },
  { name: 'lime', hex: '#32CD32', emoji: '🍋' },
  { name: 'grape', hex: '#8B5CF6', emoji: '🍇' },
  { name: 'berry', hex: '#3B82F6', emoji: '🫐' },
];

// === TIMING CONSTANTS (tune for playability) ===
const MATCH_WINDOW_MS = 1500; // 1.5 seconds to react when colors match
const BASE_CYCLE_MS = 2500; // Base time between color changes (slow start)
const MIN_CYCLE_MS = 1000; // Fastest cycle speed
const GRACE_PERIOD_MS = 800; // Ignore taps after game starts
const TAP_DEBOUNCE_MS = 100; // Prevent double-tap

// Speed increases with score
const getCycleSpeed = (score: number): number => {
  const reduction = Math.floor(score / 100) * 200; // Faster every 100 points
  return Math.max(MIN_CYCLE_MS, BASE_CYCLE_MS - reduction);
};

// Game state interface
interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  targetColor: number;
  playerColor: number;
  score: number;
  streak: number;
  lives: number;
  bestReactionTime: number;
  roundStartTime: number | null;
  isMatchWindow: boolean;
  lastColorChangeTime: number; // Track when colors last changed
}

// Floating score interface
interface FloatingScore {
  id: string;
  text: string;
  type: 'correct' | 'wrong' | 'warning';
  x: number;
  y: number;
}

const initialGameState: GameState = {
  status: 'idle',
  targetColor: 0,
  playerColor: 1,
  score: 0,
  streak: 0,
  lives: 3,
  bestReactionTime: Infinity,
  roundStartTime: null,
  isMatchWindow: false,
  lastColorChangeTime: 0,
};

// Score calculation based on reaction time
const calculateScore = (reactionTimeMs: number): { points: number; rating: string } => {
  if (reactionTimeMs < 300) return { points: 100, rating: 'PERFECT' };
  if (reactionTimeMs < 500) return { points: 75, rating: 'GREAT' };
  if (reactionTimeMs < 700) return { points: 50, rating: 'GOOD' };
  if (reactionTimeMs < 1000) return { points: 25, rating: 'OK' };
  return { points: 10, rating: 'SLOW' };
};

const ColorReaction: React.FC = () => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [screenShake, setScreenShake] = useState(false);
  const [epicCallout, setEpicCallout] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0); // 0-100 for countdown ring
  const [livesWarning, setLivesWarning] = useState<string | null>(null);

  // Sound hooks
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playClick, setMuted } = useHowlerSounds();

  // Leaderboard hooks
  const { submitScore, isSignedIn } = useLeaderboard('color-reaction');

  // Universal visual effects system
  const {
    effects,
    triggerShockwave,
    triggerSparks,
    triggerVignette,
    addFloatingEmoji,
    triggerConfetti,
    updateCombo,
    resetCombo,
    resetAllEffects,
  } = useGameEffects();

  // Timer refs
  const roundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchWindowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxStreakRef = useRef(0);
  const gameStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  // Refs for immediate state access (avoid stale closures on mobile)
  const isMatchWindowRef = useRef(false);
  const targetColorRef = useRef(0);
  const playerColorRef = useRef(1);
  const roundStartTimeRef = useRef<number | null>(null);
  const gameStatusRef = useRef<'idle' | 'playing' | 'gameover'>('idle');

  const displaySize = isMobile ? 120 : 150;

  // iOS audio unlock
  useEffect(() => {
    const unlock = () => {
      Howler.ctx?.resume();
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('touchstart', unlock);
    return () => document.removeEventListener('touchstart', unlock);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Track max streak
  useEffect(() => {
    if (gameState.streak > maxStreakRef.current) {
      maxStreakRef.current = gameState.streak;
    }
  }, [gameState.streak]);

  // Keep refs in sync with state (for immediate access in event handlers)
  useEffect(() => {
    isMatchWindowRef.current = gameState.isMatchWindow;
    targetColorRef.current = gameState.targetColor;
    playerColorRef.current = gameState.playerColor;
    roundStartTimeRef.current = gameState.roundStartTime;
    gameStatusRef.current = gameState.status;
  }, [gameState.isMatchWindow, gameState.targetColor, gameState.playerColor, gameState.roundStartTime, gameState.status]);

  // Ref for tracking lives changes
  const prevLivesRef = useRef(gameState.lives);

  // Effect triggers
  const triggerScreenShake = useCallback((duration: number = 100) => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), duration);
  }, []);

  const showEpicCallout = useCallback((text: string) => {
    setEpicCallout(text);
    setTimeout(() => setEpicCallout(null), 1500);
  }, []);

  const triggerPlayerFlash = useCallback((type: 'correct' | 'wrong') => {
    setPlayerFlash(type);
    setTimeout(() => setPlayerFlash(null), 300);
  }, []);

  const showFloatingScore = useCallback((text: string, type: 'correct' | 'wrong' | 'warning') => {
    const id = `score-${Date.now()}`;
    const newScore: FloatingScore = {
      id,
      text,
      type,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 55,
    };
    setFloatingScores((prev) => [...prev, newScore]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((s) => s.id !== id));
    }, 1200);
  }, []);

  const showLivesWarning = useCallback((lives: number) => {
    const warnings: Record<number, string> = {
      2: '2 LIVES LEFT!',
      1: 'LAST LIFE!',
    };
    if (warnings[lives]) {
      setLivesWarning(warnings[lives]);
      setTimeout(() => setLivesWarning(null), 1500);
    }
  }, []);

  // Start countdown animation for match window
  const startMatchCountdown = useCallback(() => {
    setMatchProgress(100);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const startTime = performance.now();
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / MATCH_WINDOW_MS) * 100);
      setMatchProgress(remaining);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }, 30);
  }, []);

  // Start a new round
  const startNewRound = useCallback(() => {
    // Clear existing timers
    if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
    if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setMatchProgress(0);
    isMatchWindowRef.current = false; // Reset ref immediately

    // Get cycle speed based on current score
    const cycleSpeed = getCycleSpeed(gameState.score);
    const delay = cycleSpeed * 0.3 + Math.random() * cycleSpeed * 0.4; // 30-70% of cycle speed

    roundTimeoutRef.current = setTimeout(() => {
      const now = performance.now();

      setGameState((prev) => {
        if (prev.status !== 'playing') return prev;

        // Higher chance of match to make game more fun (60%)
        const shouldMatch = Math.random() < 0.6;
        const newTargetColor = shouldMatch
          ? prev.playerColor
          : (() => {
              let color;
              do {
                color = Math.floor(Math.random() * COLORS.length);
              } while (color === prev.playerColor);
              return color;
            })();

        const isMatch = newTargetColor === prev.playerColor;

        // Update refs IMMEDIATELY for tap handler
        targetColorRef.current = newTargetColor;
        isMatchWindowRef.current = isMatch;
        roundStartTimeRef.current = isMatch ? now : null;

        console.log('[ColorReaction] New round:', {
          target: newTargetColor,
          player: prev.playerColor,
          isMatch,
          isMatchWindow: isMatch,
        });

        if (isMatch) {
          // Start countdown animation
          startMatchCountdown();

          // End match window after duration (but don't penalize - just move on)
          matchWindowTimeoutRef.current = setTimeout(() => {
            isMatchWindowRef.current = false; // Update ref immediately
            setGameState((p) => {
              if (p.isMatchWindow) {
                // Match window expired, start next round
                console.log('[ColorReaction] Match window expired - no penalty');
                setTimeout(() => startNewRound(), 100);
                return { ...p, isMatchWindow: false };
              }
              return p;
            });
          }, MATCH_WINDOW_MS);
        } else {
          // No match, schedule next round
          setTimeout(() => startNewRound(), getCycleSpeed(prev.score) * 0.5);
        }

        return {
          ...prev,
          targetColor: newTargetColor,
          roundStartTime: isMatch ? now : null,
          isMatchWindow: isMatch,
          lastColorChangeTime: now,
        };
      });
    }, delay);
  }, [gameState.score, startMatchCountdown]);

  // Handle correct tap with all effects
  const handleCorrectTap = useCallback(
    (points: number, rating: string, reactionTime: number, newStreak: number) => {
      triggerScreenShake(100);
      triggerPlayerFlash('correct');
      showFloatingScore(`+${points}`, 'correct');
      playBlockLand();

      // Universal effects
      triggerShockwave(COLORS[gameState.playerColor]?.hex || '#FF6B00', 0.5);
      triggerSparks(COLORS[gameState.playerColor]?.hex || '#FF6B00');
      addFloatingEmoji(COLORS[gameState.playerColor]?.emoji || '🍊');
      updateCombo();

      if (rating === 'PERFECT') {
        showEpicCallout('PERFECT!');
        playPerfectBonus();
        triggerShockwave('#FFD700', 0.8); // Gold shockwave for perfect
      }

      // Streak milestones with confetti
      if (newStreak === 5) {
        showEpicCallout('NICE!');
        playCombo();
      } else if (newStreak === 10) {
        showEpicCallout('GREAT!');
        playCombo();
        triggerConfetti();
      } else if (newStreak === 15) {
        showEpicCallout('AMAZING!');
        playCombo();
        triggerConfetti();
      } else if (newStreak === 20) {
        showEpicCallout('UNSTOPPABLE!');
        playCombo();
        triggerConfetti();
      }

      if (reactionTime < 200 && rating !== 'PERFECT') {
        showEpicCallout('LIGHTNING!');
      }
    },
    [triggerScreenShake, triggerPlayerFlash, showFloatingScore, showEpicCallout, playBlockLand, playPerfectBonus, playCombo, triggerShockwave, triggerSparks, addFloatingEmoji, updateCombo, triggerConfetti, gameState.playerColor]
  );

  // Handle wrong tap with effects
  const handleWrongTap = useCallback(() => {
    triggerScreenShake(150);
    triggerPlayerFlash('wrong');
    showFloatingScore('-1 ❤️', 'wrong');
    playClick();
    // Universal effects
    triggerVignette('#ff0000');
    triggerSparks('#ff4444');
    addFloatingEmoji('💔');
    resetCombo();
  }, [triggerScreenShake, triggerPlayerFlash, showFloatingScore, playClick, triggerVignette, triggerSparks, addFloatingEmoji, resetCombo]);

  // Track lives changes for effects
  useEffect(() => {
    if (gameState.lives < prevLivesRef.current && gameState.status === 'playing') {
      handleWrongTap();
      showLivesWarning(gameState.lives);
    }
    if (gameState.status === 'gameover' && prevLivesRef.current > 0) {
      playGameOver();
    }
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives, gameState.status, handleWrongTap, playGameOver, showLivesWarning]);

  // Handle tap - uses refs for immediate state access (avoids stale closures on mobile)
  const handleTap = useCallback(() => {
    const now = performance.now();

    // Debounce
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) {
      return;
    }
    lastTapTimeRef.current = now;

    // Use refs for immediate access (avoid stale closure issues on mobile)
    const currentStatus = gameStatusRef.current;
    const currentTargetColor = targetColorRef.current;
    const currentPlayerColor = playerColorRef.current;
    const currentIsMatchWindow = isMatchWindowRef.current;
    const currentRoundStartTime = roundStartTimeRef.current;

    console.log('[ColorReaction] TAP!', {
      status: currentStatus,
      target: currentTargetColor,
      player: currentPlayerColor,
      isMatchWindow: currentIsMatchWindow,
      colorsMatch: currentTargetColor === currentPlayerColor,
    });

    if (currentStatus === 'idle') {
      gameStartTimeRef.current = now;
      const newPlayerColor = Math.floor(Math.random() * COLORS.length);
      playerColorRef.current = newPlayerColor;
      gameStatusRef.current = 'playing';
      setGameState({
        ...initialGameState,
        status: 'playing',
        playerColor: newPlayerColor,
        lastColorChangeTime: now,
      });
      maxStreakRef.current = 0;
      startNewRound();
      return;
    }

    if (currentStatus !== 'playing') return;

    // Grace period after game starts
    if (now - gameStartTimeRef.current < GRACE_PERIOD_MS) {
      console.log('[ColorReaction] Grace period - ignored');
      return;
    }

    const colorsMatch = currentTargetColor === currentPlayerColor;

    if (colorsMatch && currentIsMatchWindow) {
      // CORRECT TAP - colors match and window is open
      const reactionTime = now - currentRoundStartTime!;
      const { points, rating } = calculateScore(reactionTime);

      console.log('[ColorReaction] CORRECT TAP!', { reactionTime, points, rating });

      // Clear match window timer
      if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setMatchProgress(0);

      // Update refs immediately
      isMatchWindowRef.current = false;
      const newPlayerColor = Math.floor(Math.random() * COLORS.length);
      playerColorRef.current = newPlayerColor;

      setGameState((prev) => {
        const newStreak = prev.streak + 1;
        return {
          ...prev,
          score: prev.score + points,
          streak: newStreak,
          bestReactionTime: Math.min(prev.bestReactionTime, reactionTime),
          isMatchWindow: false,
          playerColor: newPlayerColor,
          lastColorChangeTime: now,
        };
      });

      handleCorrectTap(points, rating, reactionTime, gameState.streak + 1);

      // Clear round timer and start fresh
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      setTimeout(() => startNewRound(), 400);
    } else if (colorsMatch && !currentIsMatchWindow) {
      // LATE TAP - colors match but window expired
      // Just ignore - no penalty, no reward (they were just slow)
      console.log('[ColorReaction] Late tap - colors match but window expired, ignoring');
      return;
    } else {
      // WRONG TAP - colors DON'T match, player tapped anyway
      // This is the ONLY case where we lose a life
      console.log('[ColorReaction] WRONG TAP! Colors do not match.', {
        target: currentTargetColor,
        player: currentPlayerColor,
      });
      setGameState((prev) => {
        const newLives = prev.lives - 1;
        console.log(`[ColorReaction] Lives: ${prev.lives} -> ${newLives}`);

        if (newLives <= 0) {
          gameStatusRef.current = 'gameover';
          if (isSignedIn) {
            submitScore(prev.score, undefined, {
              bestReactionTime: prev.bestReactionTime === Infinity ? null : Math.round(prev.bestReactionTime),
              maxStreak: maxStreakRef.current,
            });
          }
          return { ...prev, status: 'gameover', lives: 0, streak: 0 };
        }
        return { ...prev, lives: newLives, streak: 0 };
      });
    }
  }, [startNewRound, handleCorrectTap, isSignedIn, submitScore, gameState.streak]);

  // Handle game restart
  const handleRestart = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = performance.now();
    gameStartTimeRef.current = now;
    lastTapTimeRef.current = now;

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setMatchProgress(0);
    setLivesWarning(null);
    resetAllEffects();

    setGameState({
      ...initialGameState,
      status: 'playing',
      playerColor: Math.floor(Math.random() * COLORS.length),
      lastColorChangeTime: now,
    });
    maxStreakRef.current = 0;
    startNewRound();
  }, [startNewRound, resetAllEffects]);

  // Render lives as hearts
  const renderLives = () => (
    <div className="lives-display">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className={`heart ${i < gameState.lives ? 'active' : 'lost'} ${
            i === gameState.lives && playerFlash === 'wrong' ? 'breaking' : ''
          }`}
        >
          {i < gameState.lives ? '❤️' : '💔'}
        </span>
      ))}
    </div>
  );

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div
          className={`color-reaction-container ${isMobile ? 'mobile' : 'desktop'} ${screenShake ? 'shaking' : ''}`}
          onClick={gameState.status !== 'gameover' ? handleTap : undefined}
          onTouchStart={
            gameState.status !== 'gameover'
              ? (e) => {
                  e.preventDefault();
                  handleTap();
                }
              : undefined
          }
        >
          {/* Universal Game Effects Layer */}
          <GameEffects effects={effects} accentColor={COLORS[gameState.playerColor]?.hex || '#FF6B00'} />

          {/* Mute Button */}
          <button
            className="mute-button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
              setMuted(!isMuted);
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Stats Panel */}
          <div className="stats-panel">
            <div className="stat">
              <span className="stat-label">Score</span>
              <span className="stat-value">{gameState.score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{gameState.streak}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Lives</span>
              {renderLives()}
            </div>
          </div>

          {/* Game Area */}
          <div className="game-area">
            {/* Target Color Display */}
            <div className="color-section">
              <span className="color-label">TARGET</span>
              <div
                className="color-display target-display"
                style={{
                  backgroundColor: COLORS[gameState.targetColor].hex,
                  width: displaySize,
                  height: displaySize,
                }}
              >
                <span className="color-emoji">{COLORS[gameState.targetColor].emoji}</span>
              </div>
            </div>

            {/* Player Color Display with countdown ring */}
            <div className="color-section">
              <span className="color-label">YOUR COLOR</span>
              <div className="player-circle-wrapper" style={{ width: displaySize + 20, height: displaySize + 20 }}>
                {/* Countdown ring */}
                {gameState.isMatchWindow && (
                  <svg className="countdown-ring" viewBox="0 0 100 100">
                    <circle
                      className="countdown-ring-bg"
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      className="countdown-ring-progress"
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="#2ecc71"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${matchProgress * 2.89} 289`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                )}
                <div
                  className={`color-display player-display ${gameState.isMatchWindow ? 'matching' : ''} ${playerFlash ? `flash-${playerFlash}` : ''}`}
                  style={{
                    backgroundColor: COLORS[gameState.playerColor].hex,
                    width: displaySize,
                    height: displaySize,
                  }}
                >
                  <span className="color-emoji">{COLORS[gameState.playerColor].emoji}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tap Instruction */}
          <div className="tap-instruction">
            {gameState.status === 'idle' && <span>TAP TO START</span>}
            {gameState.status === 'playing' && !gameState.isMatchWindow && <span>WAIT FOR MATCH...</span>}
            {gameState.status === 'playing' && gameState.isMatchWindow && (
              <span className="tap-now">TAP NOW!</span>
            )}
          </div>

          {/* Lives Warning */}
          {livesWarning && <div className="lives-warning">{livesWarning}</div>}

          {/* Epic Callout */}
          {epicCallout && <div className="epic-callout">{epicCallout}</div>}

          {/* Floating Scores */}
          {floatingScores.map((score) => (
            <div
              key={score.id}
              className={`floating-score ${score.type}`}
              style={{ left: `${score.x}%`, top: `${score.y}%` }}
            >
              {score.text}
            </div>
          ))}

          {/* Game Over Overlay */}
          {gameState.status === 'gameover' && (
            <div className="gameover-overlay">
              <h2>GAME OVER</h2>
              <div className="final-score">{gameState.score}</div>
              <div className="stats-summary">
                <div>
                  Best Time: {gameState.bestReactionTime === Infinity ? '--' : `${Math.round(gameState.bestReactionTime)}ms`}
                </div>
                <div>Max Streak: {maxStreakRef.current}</div>
              </div>
              {!isSignedIn && <p className="sign-in-prompt">Sign in to save your score!</p>}
              <button
                className="play-again-btn"
                onClick={handleRestart}
                onTouchStart={(e) => e.stopPropagation()}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ColorReaction;
