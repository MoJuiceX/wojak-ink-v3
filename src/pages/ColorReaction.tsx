// @ts-nocheck
import { IonPage, IonContent } from '@ionic/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howler } from 'howler';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useColorReactionSounds } from '@/hooks/useColorReactionSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameHaptics } from '@/systems/haptics';
import './ColorReaction.css';

// Color definitions - TASK 91: Expanded with Strawberry & Kiwi
const COLORS = [
  { name: 'orange', hex: '#FF6B00', emoji: '🍊' },
  { name: 'lime', hex: '#32CD32', emoji: '🍋' },
  { name: 'grape', hex: '#8B5CF6', emoji: '🍇' },
  { name: 'berry', hex: '#3B82F6', emoji: '🫐' },
  { name: 'strawberry', hex: '#FF4D6A', emoji: '🍓' },
  { name: 'kiwi', hex: '#7CB342', emoji: '🥝' },
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
  // TASK 93: Reduced motion mode - respect system preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [screenShake, setScreenShake] = useState(false);
  const [epicCallout, setEpicCallout] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0); // 0-100 for countdown ring
  const [livesWarning, setLivesWarning] = useState<string | null>(null);

  // Phase 3: Urgency system state
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [remainingTimeMs, setRemainingTimeMs] = useState<number | null>(null);

  // Phase 4: Perfect celebration state
  const [perfectFlash, setPerfectFlash] = useState(false);
  const [perfectPulse, setPerfectPulse] = useState(false);
  const [showReactionTime, setShowReactionTime] = useState<number | null>(null);
  const [showConnectionLine, setShowConnectionLine] = useState(false);

  // Phase 5: Visual juice state
  const [tapSquash, setTapSquash] = useState(false);
  const [impactFlash, setImpactFlash] = useState(false);
  const [matchGlow, setMatchGlow] = useState(false);
  const [speedUpCallout, setSpeedUpCallout] = useState(false);
  const [backgroundPulse, setBackgroundPulse] = useState(false);
  const [streakFire, setStreakFire] = useState(false);

  // Phase 6: Streak & Scoring Polish state
  const [scorePop, setScorePop] = useState(false);
  const [highScoreBeat, setHighScoreBeat] = useState(false);
  const [bestTimeBeat, setBestTimeBeat] = useState(false);
  const [currentRating, setCurrentRating] = useState<string | null>(null);
  const [sessionHighScore, setSessionHighScore] = useState(0);
  const [comboMeterFill, setComboMeterFill] = useState(0); // 0-100 for combo meter

  // Phase 7: Failure & Warning States
  const [lastLifeWarning, setLastLifeWarning] = useState(false);
  const [showGameOverStats, setShowGameOverStats] = useState(false);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [floatingX, setFloatingX] = useState(false);
  const [floatingClock, setFloatingClock] = useState(false);

  // Phase 8: Near-Miss & Close Call System
  const [nearMissCallout, setNearMissCallout] = useState<string | null>(null);
  const [nearMissDelay, setNearMissDelay] = useState<number | null>(null);
  const matchWindowEndTimeRef = useRef<number | null>(null);

  // Phase 10: Fever Mode & Advanced Combos
  const [feverMode, setFeverMode] = useState(false);
  const [feverIntensity, setFeverIntensity] = useState(0); // 0-3 intensity levels
  const [feverActivating, setFeverActivating] = useState(false);

  // Phase 11: Camera & Advanced Visual Effects
  const [cameraZoom, setCameraZoom] = useState(false);
  const [hitStop, setHitStop] = useState(false);

  // Phase 12: Viral & Share System
  const [showSharePanel, setShowSharePanel] = useState(false);
  const bestMomentsRef = useRef<{ type: string; value: number; timestamp: number }[]>([]);

  // Sound hooks - legacy Howler sounds
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver: playGameOverLegacy, playClick, setMuted: setMutedHowler } = useHowlerSounds();

  // Color Reaction procedural sounds (Web Audio API)
  const {
    playCorrectTap: playCRCorrectTap,
    playWrongTap: playCRWrongTap,
    playMiss: playCRMiss,
    playMatchStart: playCRMatchStart,
    playCountdownTick: playCRCountdownTick,
    playCountdownWarning: playCRCountdownWarning,
    playCountdownCritical: playCRCountdownCritical,
    playLifeLoss: playCRLifeLoss,
    playLastLifeWarning: playCRLastLifeWarning,
    playGameOver: playCRGameOver,
    playPerfect: playCRPerfect,
    playStreakMilestone: playCRStreakMilestone,
    playSpeedUp: playCRSpeedUp,
    playTimeDilation: playCRTimeDilation,
    setMuted: setMutedCR,
  } = useColorReactionSounds();

  // Combined mute function
  const setMuted = useCallback((muted: boolean) => {
    setMutedHowler(muted);
    setMutedCR(muted);
  }, [setMutedHowler, setMutedCR]);

  // Haptic hooks - Color Reaction specific patterns
  const {
    hapticScore,
    hapticCombo,
    hapticHighScore,
    hapticGameOver,
    hapticError,
    hapticWarning,
    hapticSuccess,
    hapticUrgencyTick,
    // Color Reaction specific
    hapticCRTap,
    hapticCRPerfect,
    hapticCRGreat,
    hapticCRGood,
    hapticCROk,
    hapticCRWrong,
    hapticCRMiss,
    hapticCRCountdownTick,
    hapticCRCountdownWarning,
    hapticCRCountdownCritical,
    hapticCRLoseLife,
    hapticCRLastLife,
    hapticCRStreak5,
    hapticCRStreak10,
    hapticCRStreak15,
    hapticCRStreak20,
  } = useGameHaptics();

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

  const displaySize = isMobile ? 150 : 180;

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

  // Start countdown animation for match window with urgency haptics + sounds
  const startMatchCountdown = useCallback(() => {
    setMatchProgress(100);
    setUrgencyLevel('normal');
    setRemainingTimeMs(null);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // TASK 16: Match window start sound - "Colors match! TAP!"
    playCRMatchStart();

    const startTime = performance.now();
    let lastRemainingMs = MATCH_WINDOW_MS;
    let lastTickTime = 0;
    let warningTriggered = false;
    let criticalTriggered = false;

    countdownIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remainingMs = Math.max(0, MATCH_WINDOW_MS - elapsed);
      const remaining = (remainingMs / MATCH_WINDOW_MS) * 100;
      setMatchProgress(remaining);

      // TASK 29: Define urgency phases - Normal (>750ms) / Warning (750-300ms) / Critical (<300ms)
      // TASK 30: Ring color will be set via CSS based on urgency level
      if (remainingMs <= 300) {
        setUrgencyLevel('critical');
      } else if (remainingMs <= 750) {
        setUrgencyLevel('warning');
      } else {
        setUrgencyLevel('normal');
      }

      // TASK 36: Show remaining time in final 500ms
      if (remainingMs <= 500 && remainingMs > 0) {
        setRemainingTimeMs(Math.round(remainingMs));
      } else {
        setRemainingTimeMs(null);
      }

      // TASK 8 & 18: Countdown warning haptic + sound at 750ms
      if (!warningTriggered && lastRemainingMs > 750 && remainingMs <= 750) {
        hapticCRCountdownWarning();
        playCRCountdownWarning();
        warningTriggered = true;
      }

      // TASK 9 & 19: Countdown critical haptic + sound at 300ms
      if (!criticalTriggered && lastRemainingMs > 300 && remainingMs <= 300) {
        hapticCRCountdownCritical();
        playCRCountdownCritical();
        criticalTriggered = true;
      }

      // TASK 7 & 17 & 33: Countdown tick haptic + sound every ~100ms in final 500ms
      if (remainingMs <= 500 && remainingMs > 0) {
        const now = performance.now();
        if (now - lastTickTime >= 100) {
          hapticCRCountdownTick();
          // Urgency level increases as time runs out (0-3)
          const tickUrgency = remainingMs < 200 ? 3 : remainingMs < 350 ? 2 : remainingMs < 450 ? 1 : 0;
          playCRCountdownTick(tickUrgency);
          lastTickTime = now;
        }
      }

      lastRemainingMs = remainingMs;

      if (remaining <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setUrgencyLevel('normal');
        setRemainingTimeMs(null);
      }
    }, 30);
  }, [hapticCRCountdownWarning, hapticCRCountdownCritical, hapticCRCountdownTick, playCRMatchStart, playCRCountdownWarning, playCRCountdownCritical, playCRCountdownTick]);

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
            // TASK 83: Track when window ended for near-miss detection
            matchWindowEndTimeRef.current = performance.now();
            // TASK 6: Miss haptic when match window expires without tap
            hapticCRMiss();
            // TASK 15: Miss sound - whooshing fade when window expires
            playCRMiss();
            // TASK 78: Floating clock on miss
            setFloatingClock(true);
            setTimeout(() => setFloatingClock(false), 800);
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
  }, [gameState.score, startMatchCountdown, hapticCRMiss, playCRMiss]);

  // Handle correct tap with all effects
  const handleCorrectTap = useCallback(
    (points: number, rating: string, reactionTime: number, newStreak: number) => {
      triggerScreenShake(100);
      triggerPlayerFlash('correct');

      // TASK 66: Calculate score multiplier based on streak
      const multiplier = newStreak >= 20 ? 4 : newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      const actualPoints = points * multiplier;

      // TASK 71: Show rating-colored floating score
      setCurrentRating(rating);
      setTimeout(() => setCurrentRating(null), 800);
      showFloatingScore(`+${actualPoints}${multiplier > 1 ? ` x${multiplier}` : ''}`, 'correct');

      // TASK 70: Score pop effect
      setScorePop(true);
      setTimeout(() => setScorePop(false), 200);

      // TASK 63: Update combo meter fill (max at 20 streak)
      setComboMeterFill(Math.min(100, (newStreak / 20) * 100));

      // TASK 13: Reaction-time based sound (pitch varies with speed)
      playCRCorrectTap(reactionTime);

      // TASK 4: Reaction-time based haptics
      if (rating === 'PERFECT') {
        hapticCRPerfect();
        // TASK 22: PERFECT celebration sound + TASK 27: Time dilation sound
        playCRPerfect();
        playCRTimeDilation();

        // === PHASE 4: PERFECT CELEBRATION EFFECTS ===

        // TASK 40: Gold screen flash
        setPerfectFlash(true);
        setTimeout(() => setPerfectFlash(false), 150);

        // TASK 44: Screen shake on PERFECT
        triggerScreenShake(200);

        // TASK 45: Circle pulse on PERFECT
        setPerfectPulse(true);
        setTimeout(() => setPerfectPulse(false), 400);

        // TASK 46: Confetti burst on PERFECT
        triggerConfetti();

        // TASK 47: Show reaction time with emphasis
        setShowReactionTime(reactionTime);
        setTimeout(() => setShowReactionTime(null), 1500);

        // TASK 48: Connection line between circles
        setShowConnectionLine(true);
        setTimeout(() => setShowConnectionLine(false), 500);

      } else if (rating === 'GREAT') {
        hapticCRGreat();
      } else if (rating === 'GOOD') {
        hapticCRGood();
      } else {
        hapticCROk();
      }

      // Universal effects
      triggerShockwave(COLORS[gameState.playerColor]?.hex || '#FF6B00', 0.5);
      triggerSparks(COLORS[gameState.playerColor]?.hex || '#FF6B00');
      addFloatingEmoji(COLORS[gameState.playerColor]?.emoji || '🍊');
      updateCombo();

      // TASK 51: Impact flash on correct tap
      setImpactFlash(true);
      setTimeout(() => setImpactFlash(false), 150);

      // TASK 60: Background pulse on correct
      setBackgroundPulse(true);
      setTimeout(() => setBackgroundPulse(false), 300);

      // TASK 108: Camera zoom pulse on tap
      setCameraZoom(true);
      setTimeout(() => setCameraZoom(false), 150);

      // TASK 110: Hit-stop on correct tap (scaled by rating)
      const hitStopDuration = rating === 'PERFECT' ? 80 : rating === 'GREAT' ? 50 : 30;
      setHitStop(true);
      setTimeout(() => setHitStop(false), hitStopDuration);

      // TASK 61: Streak fire effect at high streaks
      if (newStreak >= 5) {
        setStreakFire(true);
      }

      // TASK 101-107: Fever Mode activation at 15+ streak
      if (newStreak === 15 && !feverMode) {
        // TASK 102: Dramatic Fever Mode activation
        setFeverActivating(true);
        setTimeout(() => {
          setFeverActivating(false);
          setFeverMode(true);
          setFeverIntensity(1);
        }, 500);
        showEpicCallout('🔥 FEVER MODE! 🔥');
      } else if (feverMode) {
        // TASK 107: Fever intensity grows with continued success
        if (newStreak >= 25) {
          setFeverIntensity(3);
        } else if (newStreak >= 20) {
          setFeverIntensity(2);
        }
      }

      if (rating === 'PERFECT') {
        // TASK 43: PERFECT callout (enhanced)
        showEpicCallout('PERFECT!');
        // TASK 42: Major particle burst for PERFECT
        triggerShockwave('#FFD700', 1.0); // Larger gold shockwave
        triggerSparks('#FFD700'); // Gold sparks
        // TASK 117: Track best moments for sharing
        bestMomentsRef.current.push({ type: 'perfect', value: reactionTime, timestamp: Date.now() });
      }

      // TASK 11 & 23: Streak milestones with confetti, haptics, and sounds
      if (newStreak === 5) {
        showEpicCallout('NICE!');
        playCRStreakMilestone(5);
        hapticCRStreak5();
      } else if (newStreak === 10) {
        showEpicCallout('GREAT!');
        playCRStreakMilestone(10);
        triggerConfetti();
        hapticCRStreak10();
      } else if (newStreak === 15) {
        showEpicCallout('AMAZING!');
        playCRStreakMilestone(15);
        triggerConfetti();
        hapticCRStreak15();
      } else if (newStreak === 20) {
        showEpicCallout('UNSTOPPABLE!');
        playCRStreakMilestone(20);
        triggerConfetti();
        hapticCRStreak20();
      }

      if (reactionTime < 200 && rating !== 'PERFECT') {
        showEpicCallout('LIGHTNING!');
      }
    },
    [triggerScreenShake, triggerPlayerFlash, showFloatingScore, showEpicCallout, triggerShockwave, triggerSparks, addFloatingEmoji, updateCombo, triggerConfetti, gameState.playerColor, hapticCRPerfect, hapticCRGreat, hapticCRGood, hapticCROk, hapticCRStreak5, hapticCRStreak10, hapticCRStreak15, hapticCRStreak20, playCRCorrectTap, playCRPerfect, playCRTimeDilation, playCRStreakMilestone]
  );

  // Handle wrong tap with effects
  const handleWrongTap = useCallback((hadStreak: boolean = false) => {
    triggerScreenShake(150);
    triggerPlayerFlash('wrong');
    showFloatingScore('-1 ❤️', 'wrong');
    // TASK 14: Wrong tap sound (gentle)
    playCRWrongTap();
    // TASK 5: Wrong tap haptic - gentle error
    hapticCRWrong();
    // Universal effects
    triggerVignette('#ff0000');
    triggerSparks('#ff4444');
    addFloatingEmoji('💔');
    resetCombo();
    // TASK 61: Reset streak fire on wrong tap
    setStreakFire(false);
    // TASK 63: Reset combo meter
    setComboMeterFill(0);
    // TASK 65: Streak break feedback (if had a streak going)
    if (hadStreak) {
      // Show streak broken message handled via floating score
      showFloatingScore('STREAK BROKEN!', 'warning');
    }
    // TASK 106: Fever Mode deactivation on wrong tap
    if (feverMode) {
      setFeverMode(false);
      setFeverIntensity(0);
    }
  }, [triggerScreenShake, triggerPlayerFlash, showFloatingScore, playCRWrongTap, triggerVignette, triggerSparks, addFloatingEmoji, resetCombo, hapticCRWrong, feverMode]);

  // Track lives changes for effects
  useEffect(() => {
    if (gameState.lives < prevLivesRef.current && gameState.status === 'playing') {
      // TASK 65: Pass whether there was a streak for streak break feedback
      handleWrongTap(gameState.streak > 0);
      showLivesWarning(gameState.lives);
      // TASK 10: Life loss haptic
      hapticCRLoseLife();
      // TASK 20: Life loss sound
      playCRLifeLoss();
      // TASK 77: Show floating X on wrong tap
      setFloatingX(true);
      setTimeout(() => setFloatingX(false), 800);
      // Extra urgent warning if last life
      if (gameState.lives === 1) {
        setTimeout(() => hapticCRLastLife(), 200);
        // TASK 21: Last life warning sound (ominous tone)
        setTimeout(() => playCRLastLifeWarning(), 250);
        // TASK 73: Persistent last life warning state
        setLastLifeWarning(true);
      }
    }
    // Reset last life warning when lives go back up (e.g., restart)
    if (gameState.lives > 1) {
      setLastLifeWarning(false);
    }
    if (gameState.status === 'gameover' && prevLivesRef.current > 0) {
      // TASK 28: Game over sound (CR-specific descending tones)
      playCRGameOver();
      // TASK 12: Game over haptic
      hapticGameOver();
      // TASK 75 & 76 & 80 & 81: Game over sequence with delays
      setShowGameOverStats(false);
      setShowPlayAgain(false);
      // Show stats after a brief delay
      setTimeout(() => setShowGameOverStats(true), 500);
      // Show play again button after stats reveal
      setTimeout(() => setShowPlayAgain(true), 1500);
    }
    prevLivesRef.current = gameState.lives;
  }, [gameState.lives, gameState.status, handleWrongTap, playCRGameOver, playCRLifeLoss, playCRLastLifeWarning, showLivesWarning, hapticCRLoseLife, hapticCRLastLife, hapticGameOver]);

  // Handle tap - uses refs for immediate state access (avoids stale closures on mobile)
  const handleTap = useCallback(() => {
    const now = performance.now();

    // Debounce
    if (now - lastTapTimeRef.current < TAP_DEBOUNCE_MS) {
      return;
    }
    lastTapTimeRef.current = now;

    // TASK 3: Immediate ultra-light haptic on every tap (before determining result)
    hapticCRTap();

    // TASK 49: Squash effect on every tap
    setTapSquash(true);
    setTimeout(() => setTapSquash(false), 100);

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

      // Calculate multiplier
      const newStreak = gameState.streak + 1;
      const multiplier = newStreak >= 20 ? 4 : newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      const actualPoints = points * multiplier;

      setGameState((prev) => {
        const updatedStreak = prev.streak + 1;
        const newScore = prev.score + actualPoints;
        const newBestTime = Math.min(prev.bestReactionTime, reactionTime);

        // TASK 67: Check for high score beat
        if (newScore > sessionHighScore) {
          setSessionHighScore(newScore);
          if (sessionHighScore > 0 && newScore > sessionHighScore) {
            setHighScoreBeat(true);
            setTimeout(() => setHighScoreBeat(false), 1500);
          }
        }

        // TASK 69: Check for best reaction time beat
        if (reactionTime < prev.bestReactionTime && prev.bestReactionTime !== Infinity) {
          setBestTimeBeat(true);
          setTimeout(() => setBestTimeBeat(false), 1500);
        }

        return {
          ...prev,
          score: newScore,
          streak: updatedStreak,
          bestReactionTime: newBestTime,
          isMatchWindow: false,
          playerColor: newPlayerColor,
          lastColorChangeTime: now,
        };
      });

      handleCorrectTap(actualPoints, rating, reactionTime, newStreak);

      // Clear round timer and start fresh
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      setTimeout(() => startNewRound(), 400);
    } else if (colorsMatch && !currentIsMatchWindow) {
      // LATE TAP - colors match but window expired
      // TASK 83: Near-miss detection - check if tap was 0-200ms after window
      const windowEndTime = matchWindowEndTimeRef.current;
      if (windowEndTime) {
        const delayMs = now - windowEndTime;
        if (delayMs <= 200) {
          // TASK 84 & 86: Near-miss detected! Show encouraging message
          const messages = ['TOO SLOW!', 'ALMOST!', 'SO CLOSE!', 'JUST MISSED!'];
          const message = messages[Math.floor(Math.random() * messages.length)];
          setNearMissCallout(message);
          setNearMissDelay(Math.round(delayMs));
          setTimeout(() => {
            setNearMissCallout(null);
            setNearMissDelay(null);
          }, 1200);
          // TASK 89: Near-miss haptic (softer than wrong, already have gentle warning)
          hapticWarning();
          console.log(`[ColorReaction] Near-miss! Delay: ${delayMs}ms`);
          // Clear the ref so we don't trigger again
          matchWindowEndTimeRef.current = null;
        } else {
          console.log('[ColorReaction] Late tap - too late for near-miss');
        }
      }
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
  }, [startNewRound, handleCorrectTap, isSignedIn, submitScore, gameState.streak, hapticCRTap]);

  // Handle game restart - TASK 82: Retry animation (smooth transition)
  const handleRestart = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = performance.now();
    gameStartTimeRef.current = now;
    lastTapTimeRef.current = now;

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setMatchProgress(0);
    setLivesWarning(null);
    resetAllEffects();

    // Reset Phase 6, 7 & 10 states
    setComboMeterFill(0);
    setLastLifeWarning(false);
    setShowGameOverStats(false);
    setShowPlayAgain(false);
    setFloatingX(false);
    setFloatingClock(false);
    setStreakFire(false);
    setFeverMode(false);
    setFeverIntensity(0);
    setFeverActivating(false);

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
          className={`color-reaction-container ${isMobile ? 'mobile' : 'desktop'} ${screenShake && !prefersReducedMotion ? 'shaking' : ''} ${gameState.isMatchWindow ? `container-urgency-${urgencyLevel}` : ''} ${perfectFlash && !prefersReducedMotion ? 'perfect-flash' : ''} ${backgroundPulse && !prefersReducedMotion ? 'background-pulse' : ''} ${streakFire && !prefersReducedMotion ? 'streak-fire' : ''} ${lastLifeWarning ? 'last-life-danger' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''} ${feverMode ? `fever-mode fever-intensity-${feverIntensity}` : ''} ${feverActivating ? 'fever-activating' : ''} ${cameraZoom && !prefersReducedMotion ? 'camera-zoom' : ''} ${hitStop ? 'hit-stop' : ''}`}
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
              <span className={`stat-value ${scorePop ? 'score-pop' : ''}`}>{gameState.score}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{gameState.streak}</span>
              {/* TASK 66: Score multiplier display */}
              {gameState.streak >= 5 && (
                <span className={`multiplier-badge ${gameState.streak >= 20 ? 'x4' : gameState.streak >= 10 ? 'x3' : 'x2'}`}>
                  x{gameState.streak >= 20 ? 4 : gameState.streak >= 10 ? 3 : 2}
                </span>
              )}
            </div>
            <div className="stat">
              <span className="stat-label">Lives</span>
              {renderLives()}
            </div>
          </div>

          {/* TASK 63: Combo meter visual */}
          {gameState.status === 'playing' && gameState.streak > 0 && (
            <div className="combo-meter">
              <div className="combo-meter-fill" style={{ width: `${comboMeterFill}%` }} />
              <div className="combo-meter-label">{gameState.streak} combo</div>
            </div>
          )}

          {/* TASK 104: Fever Mode score display */}
          {feverMode && (
            <div className={`fever-multiplier fever-intensity-${feverIntensity}`}>
              <span className="fever-icon">🔥</span>
              <span className="fever-text">FEVER x{feverIntensity >= 3 ? 4 : feverIntensity >= 2 ? 3 : 2}</span>
              <span className="fever-icon">🔥</span>
            </div>
          )}

          {/* Game Area */}
          <div className="game-area">
            {/* TASK 48: Connection line between circles on PERFECT */}
            {showConnectionLine && (
              <div className="connection-line" />
            )}

            {/* Target Color Display */}
            <div className="color-section">
              <span className="color-label">TARGET</span>
              {/* TASK 45: Add pulse class on PERFECT */}
              <div
                className={`color-display target-display ${perfectPulse ? 'perfect-pulse' : ''}`}
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
              {/* TASK 34: Add shake class in critical state */}
              <div className={`player-circle-wrapper ${urgencyLevel === 'critical' ? 'critical-shake' : ''}`} style={{ width: displaySize + 20, height: displaySize + 20 }}>
                {/* Countdown ring - TASK 30: Color transitions based on urgency */}
                {gameState.isMatchWindow && (
                  <svg className={`countdown-ring urgency-${urgencyLevel}`} viewBox="0 0 100 100">
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
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${matchProgress * 2.89} 289`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                )}
                <div
                  className={`color-display player-display ${gameState.isMatchWindow ? 'matching match-glow' : ''} ${playerFlash ? `flash-${playerFlash}` : ''} ${perfectPulse ? 'perfect-pulse' : ''} ${tapSquash ? 'tap-squash' : ''} ${impactFlash ? 'impact-flash' : ''}`}
                  style={{
                    backgroundColor: COLORS[gameState.playerColor].hex,
                    width: displaySize,
                    height: displaySize,
                  }}
                >
                  <span className="color-emoji">{COLORS[gameState.playerColor].emoji}</span>
                </div>
                {/* TASK 36: Remaining time display in final 500ms */}
                {remainingTimeMs !== null && (
                  <div className={`remaining-time urgency-${urgencyLevel}`}>
                    {remainingTimeMs}ms
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tap Instruction - TASK 32: Text urgency with pulsing and color */}
          <div className={`tap-instruction ${gameState.isMatchWindow ? `urgency-${urgencyLevel}` : ''}`}>
            {gameState.status === 'idle' && <span>TAP TO START</span>}
            {gameState.status === 'playing' && !gameState.isMatchWindow && <span>WAIT FOR MATCH...</span>}
            {gameState.status === 'playing' && gameState.isMatchWindow && (
              <span className={`tap-now urgency-${urgencyLevel}`}>TAP NOW!</span>
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

          {/* TASK 47: Reaction time display on PERFECT */}
          {showReactionTime !== null && (
            <div className="perfect-reaction-time">
              <span className="reaction-ms">{Math.round(showReactionTime)}ms</span>
              <span className="reaction-label">PERFECT!</span>
            </div>
          )}

          {/* TASK 67: High score notification */}
          {highScoreBeat && (
            <div className="high-score-notification">NEW HIGH SCORE!</div>
          )}

          {/* TASK 69: Best reaction time notification */}
          {bestTimeBeat && (
            <div className="best-time-notification">NEW BEST TIME!</div>
          )}

          {/* TASK 71: Current rating display */}
          {currentRating && (
            <div className={`rating-display rating-${currentRating.toLowerCase()}`}>{currentRating}</div>
          )}

          {/* TASK 84 & 85: Near-miss callout with timing */}
          {nearMissCallout && (
            <div className="near-miss-callout">
              <span className="near-miss-text">{nearMissCallout}</span>
              {nearMissDelay !== null && (
                <span className="near-miss-timing">+{nearMissDelay}ms late</span>
              )}
            </div>
          )}

          {/* TASK 77: Floating X on wrong tap */}
          {floatingX && (
            <div className="floating-icon floating-x">✕</div>
          )}

          {/* TASK 78: Floating clock on miss */}
          {floatingClock && (
            <div className="floating-icon floating-clock">⏰</div>
          )}

          {/* Game Over Overlay - TASK 75: Game over sequence */}
          {gameState.status === 'gameover' && (
            <div className={`gameover-overlay ${lastLifeWarning ? 'from-danger' : ''}`}>
              <h2 className="gameover-title">GAME OVER</h2>
              <div className="final-score">{gameState.score}</div>
              {/* TASK 76: Animated stats reveal */}
              {showGameOverStats && (
                <div className="stats-summary stats-reveal">
                  <div className="stat-item">
                    <span className="stat-icon">⚡</span>
                    Best Time: {gameState.bestReactionTime === Infinity ? '--' : `${Math.round(gameState.bestReactionTime)}ms`}
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🔥</span>
                    Max Streak: {maxStreakRef.current}
                  </div>
                </div>
              )}
              {!isSignedIn && showGameOverStats && <p className="sign-in-prompt">Sign in to save your score!</p>}
              {/* TASK 113: Share button UI */}
              {showGameOverStats && (
                <button
                  className="share-btn bounce-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TASK 113: Native share API or clipboard
                    const shareText = `🍊 Color Reaction Score: ${gameState.score}\n⚡ Best Time: ${gameState.bestReactionTime === Infinity ? '--' : Math.round(gameState.bestReactionTime) + 'ms'}\n🔥 Max Streak: ${maxStreakRef.current}\n\nPlay at wojak.ink`;
                    if (navigator.share) {
                      navigator.share({ title: 'Color Reaction Score', text: shareText });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      setShowSharePanel(true);
                      setTimeout(() => setShowSharePanel(false), 2000);
                    }
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  📤 Share Score
                </button>
              )}
              {/* Share copied notification */}
              {showSharePanel && (
                <div className="share-copied">Copied to clipboard!</div>
              )}
              {/* TASK 80 & 81: Play again button with delay and animation */}
              {showPlayAgain && (
                <button
                  className="play-again-btn bounce-in"
                  onClick={handleRestart}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  Play Again
                </button>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ColorReaction;
