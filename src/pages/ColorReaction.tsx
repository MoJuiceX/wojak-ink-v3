import { IonPage, IonContent } from '@ionic/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Howler } from 'howler';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useHowlerSounds } from '@/hooks/useHowlerSounds';
import { useColorReactionSounds } from '@/hooks/useColorReactionSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameHaptics } from '@/systems/haptics';
import { GameSEO } from '@/components/seo/GameSEO';
// ShareButton imported but reserved for future share panel feature
// import { ShareButton } from '@/systems/sharing';
import { captureGameArea } from '@/systems/sharing/captureDOM';
import { ArcadeGameOverScreen } from '@/components/media/games/ArcadeGameOverScreen';
import { generateGameScorecard } from '@/systems/sharing/GameScorecard';
import { useGameMute } from '@/contexts/GameMuteContext';
import './ColorReaction.css';

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

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
const TAP_DEBOUNCE_MS = 350; // Must be >300ms to catch click event that fires after touchstart on mobile

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

// Background music playlist
const MUSIC_PLAYLIST = [
  { src: '/audio/music/color-reaction/smb-main-theme-final.mp3', name: 'SMB Main Theme' },
  { src: '/audio/music/color-reaction/smw-overworld-final.mp3', name: 'SMW Overworld' },
  { src: '/audio/music/color-reaction/smb-underground-final.mp3', name: 'SMB Underground' },
  { src: '/audio/music/color-reaction/smw-title-theme-final.mp3', name: 'SMW Title' },
];

const ColorReaction: React.FC = () => {
  const isMobile = useIsMobile();
  // TASK 93: Reduced motion mode - respect system preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Arcade frame mute control (from GameModal)
  const { isMuted: arcadeMuted, musicManagedExternally } = useGameMute();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [screenShake, setScreenShake] = useState(false);
  const [epicCallout, setEpicCallout] = useState<string | null>(null);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'wrong' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [matchProgress, setMatchProgress] = useState(0); // 0-100 for countdown ring

  // Background music refs
  const playlistIndexRef = useRef(Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameStatusRefForMusic = useRef(gameState.status);
  const isMutedRef = useRef(isMuted);

  // Keep refs in sync
  useEffect(() => { gameStatusRefForMusic.current = gameState.status; }, [gameState.status]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Ref for musicManagedExternally (to check in startGame)
  const musicManagedExternallyRef = useRef(musicManagedExternally);
  useEffect(() => { musicManagedExternallyRef.current = musicManagedExternally; }, [musicManagedExternally]);

  // Play specific track
  const playMusicTrack = useCallback((index: number) => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
    playlistIndexRef.current = index;
    const track = MUSIC_PLAYLIST[index];
    const music = new Audio(track.src);
    music.volume = 1.0;
    music.addEventListener('ended', () => {
      playlistIndexRef.current = (playlistIndexRef.current + 1) % MUSIC_PLAYLIST.length;
      if (gameStatusRefForMusic.current === 'playing' && !isMutedRef.current) {
        playMusicTrack(playlistIndexRef.current);
      }
    }, { once: true });
    musicAudioRef.current = music;
    if (!isMutedRef.current) {
      music.play().catch(() => {});
    }
  }, []);

  // Play next song in playlist
  const playNextMusicTrack = useCallback(() => {
    playMusicTrack(playlistIndexRef.current);
  }, [playMusicTrack]);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
    };
  }, []);

  // Control music based on game state and mute
  useEffect(() => {
    if (gameState.status === 'playing' && !isMuted) {
      if (musicAudioRef.current) {
        musicAudioRef.current.play().catch(() => {});
      }
    } else {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    }
  }, [gameState.status, isMuted]);

  // Mobile fullscreen mode - hide header during gameplay
  useEffect(() => {
    if (isMobile && gameState.status === 'playing') {
      document.body.classList.add('game-fullscreen-mode');
    } else {
      document.body.classList.remove('game-fullscreen-mode');
    }
    return () => {
      document.body.classList.remove('game-fullscreen-mode');
    };
  }, [isMobile, gameState.status]);

  const [livesWarning, setLivesWarning] = useState<string | null>(null);

  // Phase 3: Urgency system state
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'warning' | 'critical'>('normal');
  // remainingTimeMs was removed - countdown ring provides sufficient visual feedback
  // const [remainingTimeMs, setRemainingTimeMs] = useState<number | null>(null);

  // Phase 4: Perfect celebration state
  const [perfectFlash, setPerfectFlash] = useState(false);
  const [perfectPulse, setPerfectPulse] = useState(false);
  const [showReactionTime, setShowReactionTime] = useState<number | null>(null);
  const [showConnectionLine, setShowConnectionLine] = useState(false);

  // Phase 5: Visual juice state
  const [tapSquash, setTapSquash] = useState(false);
  const [impactFlash, setImpactFlash] = useState(false);
  // matchGlow handled via CSS class on player-display when isMatchWindow is true
  // const [matchGlow, setMatchGlow] = useState(false);
  // speedUpCallout feature was removed - speed increases are subtle and don't need callout
  // const [speedUpCallout, setSpeedUpCallout] = useState(false);
  const [backgroundPulse, setBackgroundPulse] = useState(false);
  const [streakFire, setStreakFire] = useState(false);

  // Phase 6: Streak & Scoring Polish state
  const [scorePop, setScorePop] = useState(false);
  const [highScoreBeat, setHighScoreBeat] = useState(false);
  const [bestTimeBeat, setBestTimeBeat] = useState(false);
  const [currentRating, setCurrentRating] = useState<string | null>(null);
  // sessionHighScore tracked via highScore state instead
  // const [sessionHighScore, setSessionHighScore] = useState(0);
  const [comboMeterFill, setComboMeterFill] = useState(0); // 0-100 for combo meter

  // Phase 7: Failure & Warning States
  const [lastLifeWarning, setLastLifeWarning] = useState(false);
  // showGameOverStats and showPlayAgain now handled by ArcadeGameOverScreen component
  const [, setShowGameOverStats] = useState(false);
  const [, setShowPlayAgain] = useState(false);
  const [floatingX, setFloatingX] = useState(false);
  const [floatingClock, setFloatingClock] = useState(false);

  // Phase 8: Near-Miss & Close Call System
  const [nearMissCallout] = useState<string | null>(null);
  const [nearMissDelay] = useState<number | null>(null);
  const matchWindowEndTimeRef = useRef<number | null>(null);

  // Phase 10: Fever Mode & Advanced Combos
  const [feverMode, setFeverMode] = useState(false);
  const [feverIntensity, setFeverIntensity] = useState(0); // 0-3 intensity levels
  const [feverActivating, setFeverActivating] = useState(false);

  // Phase 11: Camera & Advanced Visual Effects
  const [cameraZoom, setCameraZoom] = useState(false);
  const [hitStop, setHitStop] = useState(false);

  // Phase 12: Viral & Share System
  // showSharePanel reserved for future share panel feature
  // const [showSharePanel, setShowSharePanel] = useState(false);
  const bestMomentsRef = useRef<{ type: string; value: number; timestamp: number }[]>([]);

  // Hide instruction after 15 seconds of gameplay
  const [showInstruction, setShowInstruction] = useState(true);
  const instructionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Game over screen states
  const [, setSadImage] = useState<string | null>(null);
  const [gameScreenshot, setGameScreenshot] = useState<string | null>(null);
  // showLeaderboardPanel now handled by ArcadeGameOverScreen component
  // const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('colorReactionHighScore') || '0', 10);
  });

  // Sound hooks - legacy Howler sounds (most replaced by Color Reaction procedural sounds)
  const { setMuted: setMutedHowler } = useHowlerSounds();

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
    // playSpeedUp reserved for speed increase notifications
    // playSpeedUp: playCRSpeedUp,
    playTimeDilation: playCRTimeDilation,
    playGameStart: playCRGameStart,
    setMuted: setMutedCR,
  } = useColorReactionSounds();

  // Combined mute function
  const setMuted = useCallback((muted: boolean) => {
    setMutedHowler(muted);
    setMutedCR(muted);
  }, [setMutedHowler, setMutedCR]);

  // Sync with arcade frame mute button (from GameMuteContext)
  useEffect(() => {
    // Only sync if NOT managed externally (meaning this game controls its own music)
    if (!musicManagedExternally) {
      // Arcade mute button changed - sync local state
      setIsMuted(arcadeMuted);
      setMuted(arcadeMuted);
      // Also directly pause/resume music for immediate feedback
      if (arcadeMuted) {
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
        }
      } else if (gameStatusRefForMusic.current === 'playing') {
        if (musicAudioRef.current) {
          musicAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [arcadeMuted, musicManagedExternally, setMuted]);

  // Haptic hooks - Color Reaction specific patterns
  const {
    // Generic haptics (most replaced by Color Reaction specific patterns)
    hapticGameOver,
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
  const { submitScore, isSignedIn, leaderboard: globalLeaderboard, userDisplayName, isSubmitting } = useLeaderboard('color-reaction');

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
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  // Refs for immediate state access (avoid stale closures on mobile)
  const isMatchWindowRef = useRef(false);
  const targetColorRef = useRef(0);
  const playerColorRef = useRef(1);
  const roundStartTimeRef = useRef<number | null>(null);
  const gameStatusRef = useRef<'idle' | 'playing' | 'gameover'>('idle');

  // Round ID to prevent stale timeouts from causing life loss
  const currentRoundIdRef = useRef(0);

  // CRITICAL: Simple flag to track if current match has been handled (by tap or timeout)
  // This prevents ALL race conditions - only one handler can process each match
  const matchHandledRef = useRef(true); // Start as true (no active match)

  // Prevent double-tap from mobile firing both touchstart and click
  const lastWrongTapTimeRef = useRef(0);
  const WRONG_TAP_COOLDOWN_MS = 400; // Prevent double wrong tap penalty

  // CRITICAL: Prevent losing more than 1 life per 500ms no matter what
  const lastLifeLostTimeRef = useRef(0);
  const LIFE_LOSS_COOLDOWN_MS = 500;

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

  // Hide instruction after 15 seconds of gameplay
  useEffect(() => {
    if (gameState.status === 'playing' && showInstruction) {
      // Start 15-second timer to hide instruction
      instructionTimerRef.current = setTimeout(() => {
        setShowInstruction(false);
      }, 15000);
    } else if (gameState.status === 'idle') {
      // Reset when game returns to idle
      setShowInstruction(true);
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current);
      }
    }
    return () => {
      if (instructionTimerRef.current) {
        clearTimeout(instructionTimerRef.current);
      }
    };
  }, [gameState.status, showInstruction]);

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

      // REMOVED: Countdown milliseconds display was confusing users
      // They thought it was reaction time. The countdown ring is enough visual feedback.
      // if (remainingMs <= 500 && remainingMs > 0) {
      //   setRemainingTimeMs(Math.round(remainingMs));
      // } else {
      //   setRemainingTimeMs(null);
      // }

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
      }
    }, 50); // Optimized: 50ms interval (20fps) is smooth enough for progress bar
  }, [hapticCRCountdownWarning, hapticCRCountdownCritical, hapticCRCountdownTick, playCRMatchStart, playCRCountdownWarning, playCRCountdownCritical, playCRCountdownTick]);

  // Start a new round
  const startNewRound = useCallback(() => {
    // CRITICAL: Increment round ID to invalidate any stale timeouts from previous round
    currentRoundIdRef.current += 1;

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

        // Update ALL refs IMMEDIATELY for tap handler
        // CRITICAL: Must sync playerColorRef with state - it changes after correct taps!
        playerColorRef.current = prev.playerColor;
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
          // CRITICAL: Reset the match handled flag - this match is now active
          matchHandledRef.current = false;

          // Increment round ID to invalidate any stale timeouts
          currentRoundIdRef.current += 1;
          const thisRoundId = currentRoundIdRef.current;

          // Start countdown animation
          startMatchCountdown();

          // End match window after duration - LOSE A LIFE for not tapping in time
          // Add 200ms buffer to ensure visual countdown reaches 0 before penalty
          matchWindowTimeoutRef.current = setTimeout(() => {
            // FIRST CHECK: Has this match already been handled by a tap?
            // This is the PRIMARY guard against race conditions
            if (matchHandledRef.current) {
              console.log('[ColorReaction] Timeout ignored - match already handled by tap');
              return;
            }

            // SECONDARY CHECK: Round ID (prevents stale timeouts from old rounds)
            if (thisRoundId !== currentRoundIdRef.current) {
              console.log('[ColorReaction] Stale timeout ignored (round ID mismatch)');
              return;
            }

            // Mark as handled IMMEDIATELY to prevent any race with tap handler
            matchHandledRef.current = true;
            isMatchWindowRef.current = false;
            matchWindowEndTimeRef.current = performance.now();

            // Match window expired - LOSE A LIFE for being too slow
            console.log('[ColorReaction] Match window expired - losing a life!');

            // CRITICAL: Prevent losing more than 1 life per 500ms
            const timeoutNow = performance.now();
            if (timeoutNow - lastLifeLostTimeRef.current < LIFE_LOSS_COOLDOWN_MS) {
              console.log('[ColorReaction] Timeout life loss blocked - cooldown active');
              return;
            }
            lastLifeLostTimeRef.current = timeoutNow;

            // Play feedback
            hapticCRMiss();
            playCRMiss();
            setFloatingClock(true);
            setTimeout(() => setFloatingClock(false), 800);

            setGameState((p) => {
              // Final safety check - should always pass since we checked matchHandledRef above
              if (!p.isMatchWindow) {
                console.log('[ColorReaction] Timeout setGameState: window already closed in state');
                return p;
              }

              const newLives = p.lives - 1;

              if (newLives <= 0) {
                gameStatusRef.current = 'gameover';
                // Stop background music immediately on death
                if (musicAudioRef.current) {
                  musicAudioRef.current.pause();
                  musicAudioRef.current = null;
                }
                return { ...p, status: 'gameover', lives: 0, streak: 0, isMatchWindow: false };
              }

              // Start next round after brief delay
              setTimeout(() => startNewRound(), 300);
              return { ...p, lives: newLives, streak: 0, isMatchWindow: false };
            });
          }, MATCH_WINDOW_MS + 200); // +200ms buffer for visual sync
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

      // TASK 71: Show rating for non-PERFECT taps (PERFECT is shown via showReactionTime)
      if (rating !== 'PERFECT') {
        setCurrentRating(rating);
        setTimeout(() => setCurrentRating(null), 800);
      }
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
        // REMOVED: epicCallout('PERFECT!') - showReactionTime already displays "XXXms PERFECT!"
        // Having both was redundant and confusing

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

      // Play game start sound
      playCRGameStart();

      setGameState({
        ...initialGameState,
        status: 'playing',
        playerColor: newPlayerColor,
        lastColorChangeTime: now,
      });
      maxStreakRef.current = 0;
      // Start music on user gesture (required for mobile browsers)
      // Skip if GameModal manages the music (check both ref AND context for timing safety)
      if (!musicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
        playNextMusicTrack();
      }
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

    // Calculate elapsed time for scoring
    // SAFEGUARD: If roundStartTime is not set, use 500ms (GOOD rating) instead of 0 (PERFECT)
    // This prevents false "PERFECT" ratings when timing data is missing
    const actualElapsed = currentRoundStartTime ? now - currentRoundStartTime : 500;

    // NEW SIMPLIFIED LOGIC using matchHandledRef:
    // - If match window is open AND not yet handled → CORRECT TAP (regardless of color check)
    // - If colors match AND match already handled → LATE TAP (ignore)
    // - If colors don't match AND window not open → WRONG TAP
    const matchNotHandled = !matchHandledRef.current;

    // SAFEGUARD: If match window is open, treat as correct tap even if refs seem mismatched
    // This prevents unfair life loss due to ref/visual desync
    const isCorrectTap = currentIsMatchWindow && matchNotHandled;

    console.log('[ColorReaction] Tap check:', {
      colorsMatch,
      isMatchWindowRef: currentIsMatchWindow,
      matchHandled: matchHandledRef.current,
      actualElapsed: Math.round(actualElapsed),
      isCorrectTap,
    });

    if (isCorrectTap) {
      // CORRECT TAP - window is open and not yet handled
      // IMMEDIATELY mark as handled to prevent timeout from also processing
      matchHandledRef.current = true;

      // Use actualElapsed for reaction time (with 500ms safeguard fallback)
      const reactionTime = actualElapsed;
      const { points, rating } = calculateScore(reactionTime);

      console.log('[ColorReaction] CORRECT TAP!', { reactionTime, points, rating });

      // Increment round ID to invalidate any pending timeout
      currentRoundIdRef.current += 1;

      // Clear match window timer
      if (matchWindowTimeoutRef.current) clearTimeout(matchWindowTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setMatchProgress(0);

      // Update refs
      isMatchWindowRef.current = false;

      // Calculate multiplier
      const newStreak = gameState.streak + 1;
      const multiplier = newStreak >= 20 ? 4 : newStreak >= 10 ? 3 : newStreak >= 5 ? 2 : 1;
      const actualPoints = points * multiplier;

      setGameState((prev) => {
        const updatedStreak = prev.streak + 1;
        const newScore = prev.score + actualPoints;
        const newBestTime = Math.min(prev.bestReactionTime, reactionTime);

        // TASK 67: Check for high score beat - only show ONCE when first beating the stored high score
        // Not on every subsequent point while already above high score
        if (newScore > highScore && prev.score <= highScore) {
          setHighScoreBeat(true);
          setTimeout(() => setHighScoreBeat(false), 1500);
        }

        // TASK 69: Check for best reaction time beat
        if (reactionTime < prev.bestReactionTime && prev.bestReactionTime !== Infinity) {
          setBestTimeBeat(true);
          setTimeout(() => setBestTimeBeat(false), 1500);
        }

        // Change player color visually to create a clear break between rounds
        // This makes it obvious when a new match starts
        let newPlayerColor = prev.playerColor;
        do {
          newPlayerColor = Math.floor(Math.random() * COLORS.length);
        } while (newPlayerColor === prev.targetColor); // Ensure visually non-matching

        // CRITICAL: Update ref to match state so wrong tap detection works correctly
        playerColorRef.current = newPlayerColor;

        return {
          ...prev,
          score: newScore,
          streak: updatedStreak,
          bestReactionTime: newBestTime,
          isMatchWindow: false,
          playerColor: newPlayerColor, // Visual break - shows non-matching colors
          lastColorChangeTime: now,
        };
      });

      handleCorrectTap(actualPoints, rating, reactionTime, newStreak);

      // Clear round timer and start fresh
      if (roundTimeoutRef.current) clearTimeout(roundTimeoutRef.current);
      setTimeout(() => startNewRound(), 400);
    } else {
      // Not a correct tap - check why

      // If match was already handled (we just scored), ignore until next round
      // This prevents double-tap from causing wrong tap after correct tap
      if (matchHandledRef.current) {
        console.log('[ColorReaction] Tap ignored - waiting for next round');
        return;
      }

      // Check if colors match using refs
      const colorsMatchRef = targetColorRef.current === playerColorRef.current;

      if (colorsMatchRef) {
        // Colors match but something else is wrong - ignore
        console.log('[ColorReaction] Tap ignored - colors match but window issue');
        return;
      }

      // WRONG TAP - colors don't match, user tapped when they shouldn't have

      // Prevent double wrong tap (mobile can fire touchstart + click)
      if (now - lastWrongTapTimeRef.current < WRONG_TAP_COOLDOWN_MS) {
        console.log('[ColorReaction] Ignoring duplicate wrong tap');
        return;
      }
      lastWrongTapTimeRef.current = now;

      console.log('[ColorReaction] WRONG TAP! Colors do not match.', {
        target: targetColorRef.current,
        player: playerColorRef.current,
      });

      // CRITICAL: Prevent losing more than 1 life per 500ms
      const now2 = performance.now();
      if (now2 - lastLifeLostTimeRef.current < LIFE_LOSS_COOLDOWN_MS) {
        console.log('[ColorReaction] Life loss blocked - cooldown active');
        return;
      }
      lastLifeLostTimeRef.current = now2;

      // Capture screenshot before game over if this is the last life
      if (gameState.lives <= 1 && gameAreaRef.current) {
        setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
        const currentHighScore = highScore;
        if (gameState.score > currentHighScore) {
          setIsNewPersonalBest(true);
          setHighScore(gameState.score);
          localStorage.setItem('colorReactionHighScore', String(gameState.score));
        } else {
          setIsNewPersonalBest(false);
        }
        captureGameArea(gameAreaRef.current).then(screenshot => {
          if (screenshot) setGameScreenshot(screenshot);
        });
      }

      setGameState((prev) => {
        const newLives = prev.lives - 1;
        console.log(`[ColorReaction] Lives: ${prev.lives} -> ${newLives}`);

        if (newLives <= 0) {
          gameStatusRef.current = 'gameover';
          if (musicAudioRef.current) {
            musicAudioRef.current.pause();
            musicAudioRef.current = null;
          }
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
  }, [startNewRound, handleCorrectTap, gameState.streak, gameState.lives, gameState.score, highScore, isSignedIn, submitScore, hapticCRTap, musicManagedExternally, playNextMusicTrack]);

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
    // Start music on user gesture (required for mobile browsers)
    // Skip if GameModal manages the music (check both ref AND context for timing safety)
    if (!musicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
      playNextMusicTrack();
    }
    startNewRound();
  }, [startNewRound, resetAllEffects, playNextMusicTrack, musicManagedExternally]);

  // Share handler for game over scorecard
  const handleShare = useCallback(async () => {
    try {
      const blob = await generateGameScorecard({
        gameName: 'Color Reaction',
        gameNameParts: ['COLOR', 'REACTION'],
        score: gameState.score,
        scoreLabel: 'points',
        bestScore: highScore,
        isNewRecord: isNewPersonalBest,
        screenshot: gameScreenshot,
        accentColor: '#ff6b00', // Orange accent
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `color-reaction-${gameState.score}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'color-reaction-score.png', { type: 'image/png' });
        const shareData = {
          title: 'Color Reaction Score',
          text: `🎨 I scored ${gameState.score} points in Color Reaction! Can you beat me?`,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
        }
      }
    } catch (err) {
      console.error('Failed to generate share image:', err);
      const shareText = `🎨 Color Reaction: ${gameState.score} points!\n\nCan you beat my score?\n\nhttps://wojak.ink/games`;
      if (navigator.share) {
        await navigator.share({ title: 'Color Reaction', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    }
  }, [gameState.score, highScore, isNewPersonalBest, gameScreenshot]);

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
      <GameSEO
        gameName="Color Reaction"
        gameSlug="color-reaction"
        description="Test your reflexes! Tap when the colors match in this fast-paced reaction game. Build combos and chase high scores."
        genre="Arcade"
        difficulty="Easy"
      />
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

          {/* Mute button removed - arcade frame handles muting via GameMuteContext */}

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
          <div className="game-area" ref={gameAreaRef}>
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
                {/* REMOVED: Countdown milliseconds display was confusing users */}
              {/* They thought it was reaction time. The countdown ring is enough visual feedback. */}
              </div>
            </div>
          </div>

          {/* Tap Instruction - TASK 32: Text urgency with pulsing and color */}
          {/* Tap Instruction - hidden after 15 seconds of gameplay */}
          {(gameState.status === 'idle' || showInstruction) && (
            <div className={`tap-instruction ${gameState.isMatchWindow ? `urgency-${urgencyLevel}` : ''}`}>
              {gameState.status === 'idle' && <span>TAP TO START</span>}
              {gameState.status === 'playing' && !gameState.isMatchWindow && <span>WAIT FOR MATCH...</span>}
              {gameState.status === 'playing' && gameState.isMatchWindow && (
                <span className={`tap-now urgency-${urgencyLevel}`}>TAP NOW!</span>
              )}
            </div>
          )}

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

          {/* Game Over - Uses shared component */}
          {gameState.status === 'gameover' && (
            <ArcadeGameOverScreen
              score={gameState.score}
              highScore={highScore}
              scoreLabel="points"
              isNewPersonalBest={isNewPersonalBest}
              isSignedIn={isSignedIn}
              isSubmitting={isSubmitting}
              userDisplayName={userDisplayName ?? undefined}
              leaderboard={globalLeaderboard}
              onPlayAgain={handleRestart}
              onShare={handleShare}
              accentColor="#ff6b00"
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ColorReaction;
