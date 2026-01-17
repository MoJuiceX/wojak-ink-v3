/**
 * Color Reaction - Migrated to Shared Systems
 */
// @ts-nocheck
import { IonPage, IonContent } from '@ionic/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howler } from 'howler';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { GameShell } from '@/systems/game-ui';
import { useEffects, EffectsLayer } from '@/systems/effects';
import {
  COLOR_REACTION_CONFIG,
  COLORS,
  MATCH_WINDOW_MS,
  GRACE_PERIOD_MS,
  TAP_DEBOUNCE_MS,
  getCycleSpeed,
  calculateScore,
} from './config';
import './ColorReaction.game.css';

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
  lastColorChangeTime: number;
}

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

const ColorReactionGame: React.FC = () => {
  const isMobile = useIsMobile();
  const effects = useEffects();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [screenShake, setScreenShake] = useState(false);
  const [epicCallout, setEpicCallout] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0);
  const [livesWarning, setLivesWarning] = useState<string | null>(null);

  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playClick, setMuted } = useHowlerSounds();
  const { submitScore, isSignedIn } = useLeaderboard(COLOR_REACTION_CONFIG.leaderboardId || 'color-reaction');

  const roundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const matchWindowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxStreakRef = useRef(0);
  const gameStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  const isMatchWindowRef = useRef(false);
  const targetColorRef = useRef(0);
  const playerColorRef = useRef(1);
  const roundStartTimeRef = useRef<number | null>(null);
  const gameStatusRef = useRef<'idle' | 'playing' | 'gameover'>('idle');

  const displaySize = isMobile ? 120 : 150;

  useEffect(() => {
    const unlock = () => {
      Howler.ctx?.resume();
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('touchstart', unlock);
    return () => document.removeEventListener('touchstart', unlock);
  }, []);

  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState.streak > maxStreakRef.current) {
      maxStreakRef.current = gameState.streak;
    }
  }, [gameState.streak]);

  useEffect(() => {
    isMatchWindowRef.current = gameState.isMatchWindow;
    targetColorRef.current = gameState.targetColor;
    playerColorRef.current = gameState.playerColor;
    roundStartTimeRef.current = gameState.roundStartTime;
    gameStatusRef.current = gameState.status;
  }, [gameState]);

  // Auto-start
  useEffect(() => {
    if (gameState.status === 'idle') {
      startGame();
    }
  }, []);

  const addFloatingScore = (text: string, type: 'correct' | 'wrong' | 'warning') => {
    const id = Math.random().toString(36).substr(2, 9);
    const x = 50 + (Math.random() - 0.5) * 20;
    const y = 30 + Math.random() * 20;
    setFloatingScores(prev => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 1500);
  };

  const triggerShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  };

  const triggerFlash = (type: 'correct' | 'wrong') => {
    setPlayerFlash(type);
    setTimeout(() => setPlayerFlash(null), 200);
  };

  const startGame = useCallback(() => {
    maxStreakRef.current = 0;
    gameStartTimeRef.current = Date.now();
    lastTapTimeRef.current = 0;

    setGameState({
      ...initialGameState,
      status: 'playing',
      targetColor: Math.floor(Math.random() * COLORS.length),
      playerColor: Math.floor(Math.random() * COLORS.length),
    });
    setFloatingScores([]);
    setMatchProgress(0);

    scheduleNextRound(0);
  }, []);

  const scheduleNextRound = (currentScore: number) => {
    if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
    if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    const cycleSpeed = getCycleSpeed(currentScore);
    const shouldMatch = Math.random() < 0.4;

    setGameState(prev => {
      const newTarget = Math.floor(Math.random() * COLORS.length);
      const newPlayer = shouldMatch ? newTarget : COLORS.findIndex((_, i) => i !== newTarget);

      return {
        ...prev,
        targetColor: newTarget,
        playerColor: newPlayer >= 0 ? newPlayer : (newTarget + 1) % COLORS.length,
        isMatchWindow: shouldMatch,
        roundStartTime: shouldMatch ? Date.now() : null,
        lastColorChangeTime: Date.now(),
      };
    });

    if (shouldMatch) {
      setMatchProgress(100);
      const startTime = Date.now();
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / MATCH_WINDOW_MS) * 100);
        setMatchProgress(remaining);
        if (remaining <= 0 && countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 50);

      matchWindowTimeoutRef.current = setTimeout(() => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setMatchProgress(0);

        setGameState(prev => {
          if (prev.status !== 'playing' || !prev.isMatchWindow) return prev;

          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            playGameOver();
            effects.trigger({ type: 'screenShake', intensity: 'strong' });
            return { ...prev, status: 'gameover', lives: 0 };
          }

          addFloatingScore('MISSED!', 'wrong');
          triggerShake();
          return { ...prev, lives: newLives, isMatchWindow: false, streak: 0 };
        });

        scheduleNextRound(currentScore);
      }, MATCH_WINDOW_MS);
    }

    roundTimeoutRef.current = setTimeout(() => {
      scheduleNextRound(currentScore);
    }, cycleSpeed);
  };

  const handleTap = useCallback(() => {
    const now = Date.now();

    if (gameStatusRef.current !== 'playing') return;
    if (now - gameStartTimeRef.current < GRACE_PERIOD_MS) return;
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) return;
    lastTapTimeRef.current = now;

    playClick();

    if (isMatchWindowRef.current && targetColorRef.current === playerColorRef.current) {
      if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setMatchProgress(0);

      const reactionTime = roundStartTimeRef.current ? now - roundStartTimeRef.current : MATCH_WINDOW_MS;
      const { points, rating } = calculateScore(reactionTime);

      effects.trigger({ type: 'shockwave', intensity: points >= 75 ? 'strong' : 'normal' });
      if (points >= 75) {
        effects.trigger({ type: 'sparks', intensity: 'medium' });
      }

      setGameState(prev => {
        const newScore = prev.score + points;
        const newStreak = prev.streak + 1;

        addFloatingScore(`${rating} +${points}`, 'correct');
        triggerFlash('correct');

        if (newStreak >= 5) {
          effects.trigger({ type: 'comboText', data: { combo: newStreak } });
        }

        scheduleNextRound(newScore);

        return {
          ...prev,
          score: newScore,
          streak: newStreak,
          isMatchWindow: false,
          bestReactionTime: Math.min(prev.bestReactionTime, reactionTime),
        };
      });
    } else {
      setGameState(prev => {
        const newLives = prev.lives - 1;

        addFloatingScore('WRONG!', 'wrong');
        triggerShake();
        triggerFlash('wrong');

        if (newLives <= 0) {
          playGameOver();
          effects.trigger({ type: 'screenShake', intensity: 'strong' });
          return { ...prev, status: 'gameover', lives: 0 };
        }

        return { ...prev, lives: newLives, streak: 0 };
      });
    }
  }, [effects, playClick, playGameOver]);

  useEffect(() => {
    if (gameState.status === 'gameover' && isSignedIn && gameState.score > 0) {
      submitScore(gameState.score, 1, {
        bestReactionTime: gameState.bestReactionTime === Infinity ? 0 : gameState.bestReactionTime,
        maxStreak: maxStreakRef.current,
      });
    }
  }, [gameState.status, gameState.score, isSignedIn, submitScore]);

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className={`color-reaction-container ${screenShake ? 'screen-shake' : ''}`}>
          <EffectsLayer />

          {gameState.status === 'playing' && (
            <>
              <div className="game-header">
                <div className="stat-box">
                  <span className="stat-label">Score</span>
                  <span className="stat-value">{gameState.score}</span>
                </div>
                <div className="stat-box lives-box">
                  <span className="stat-label">Lives</span>
                  <span className="stat-value">{'❤️'.repeat(gameState.lives)}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Streak</span>
                  <span className="stat-value">{gameState.streak}x</span>
                </div>
              </div>

              <div className="game-area" onClick={handleTap} onTouchEnd={(e) => { e.preventDefault(); handleTap(); }}>
                <div className="color-displays">
                  <div className="color-box target-box">
                    <span className="color-label">Target</span>
                    <div
                      className="color-circle"
                      style={{
                        backgroundColor: COLORS[gameState.targetColor].hex,
                        width: displaySize,
                        height: displaySize,
                      }}
                    >
                      <span className="color-emoji">{COLORS[gameState.targetColor].emoji}</span>
                    </div>
                  </div>

                  <div className={`color-box player-box ${playerFlash ? `flash-${playerFlash}` : ''}`}>
                    <span className="color-label">Yours</span>
                    <div
                      className={`color-circle ${gameState.isMatchWindow ? 'match-ready' : ''}`}
                      style={{
                        backgroundColor: COLORS[gameState.playerColor].hex,
                        width: displaySize,
                        height: displaySize,
                      }}
                    >
                      <span className="color-emoji">{COLORS[gameState.playerColor].emoji}</span>
                      {gameState.isMatchWindow && matchProgress > 0 && (
                        <svg className="countdown-ring" viewBox="0 0 100 100">
                          <circle
                            className="countdown-circle"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray={`${matchProgress * 2.83} 283`}
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <div className="instruction">
                  {gameState.isMatchWindow ? 'TAP NOW!' : 'Wait for match...'}
                </div>

                {floatingScores.map(score => (
                  <div
                    key={score.id}
                    className={`floating-score ${score.type}`}
                    style={{ left: `${score.x}%`, top: `${score.y}%` }}
                  >
                    {score.text}
                  </div>
                ))}
              </div>
            </>
          )}

          {gameState.status === 'gameover' && (
            <div className="game-over-screen">
              <div className="game-over-content">
                <div className="game-over-title">Game Over!</div>
                <div className="game-over-score">
                  <span className="game-over-score-value">{gameState.score}</span>
                  <span className="game-over-score-label">points</span>
                </div>
                <div className="game-over-stats">
                  <span>Best Streak: {maxStreakRef.current}x</span>
                  {gameState.bestReactionTime < Infinity && (
                    <span>Best Reaction: {gameState.bestReactionTime}ms</span>
                  )}
                </div>
                <button onClick={startGame} className="play-btn">Play Again</button>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const ColorReaction: React.FC = () => (
  <GameShell gameId={COLOR_REACTION_CONFIG.id}>
    <ColorReactionGame />
  </GameShell>
);

export default ColorReaction;
