# ColorReaction.tsx - Full Source Code

This file contains the complete source code for the Color Reaction game component.

## Issues Reported:
1. **First cycle is immediately a FULL_MATCH** (should be prevented)
2. **Clicking the first FULL_MATCH does nothing**
3. **After that, clicking causes immediate life loss even when wrong**

## File: src/pages/ColorReaction.tsx

```typescript
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
import {
  FRUITS,
  COLORS,
  GRACE_PERIOD_MS,
  TAP_DEBOUNCE_MS,
  getCycleMs,
  getMatchWindowMs,
  getFullMatchChancePct,
  getPartialChancePct,
  calculateBasePoints,
  getStreakBonus,
  randomFruit,
  randomColor,
  randomFruitExcept,
  randomColorExcept,
} from './color-reaction-arcade-config';
import type { MatchType } from './color-reaction-arcade-config';
import './ColorReaction.css';

// Debug mode - set to true to enable debug HUD and logging
const DEBUG = true;

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);


// Game state interface — Arcade: dual attribute (fruit + color)
interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  targetFruit: number;
  targetColor: number;
  yourFruit: number;
  yourColor: number;
  score: number;
  streak: number;
  lives: number;
  bestReactionTime: number;
  matchType: MatchType;
  isMatchWindow: boolean;
  lastColorChangeTime: number;
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
  targetFruit: 0,
  targetColor: 1,
  yourFruit: 0,
  yourColor: 1,
  score: 0,
  streak: 0,
  lives: 3,
  bestReactionTime: Infinity,
  matchType: 'NO_MATCH',
  isMatchWindow: false,
  lastColorChangeTime: 0,
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

  // Phase 8: Near-Miss & Close Call System (simplified for Arcade)
  const [nearMissCallout] = useState<string | null>(null);
  const [nearMissDelay] = useState<number | null>(null);
  const [tooLateFeedback, setTooLateFeedback] = useState(false);
  const [mismatchFruit, setMismatchFruit] = useState(false);
  const [mismatchColor, setMismatchColor] = useState(false);

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
  const mismatchHighlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxStreakRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameStartTimeRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);

  // Refs for immediate state access (avoid stale closures on mobile)
  const isMatchWindowRef = useRef(false);
  const gameStatusRef = useRef<'idle' | 'playing' | 'gameover'>('idle');
  const targetFruitRef = useRef(0);
  const targetColorRef = useRef(0);
  const yourFruitRef = useRef(0);
  const yourColorRef = useRef(1);

  // Match timing — source of truth (use performance.now())
  const matchActiveRef = useRef(false);
  const matchStartTsRef = useRef<number | null>(null);
  const matchWindowMsRef = useRef(1000);

  // Match ID: increment only on FULL_MATCH start; prevents stale timeout processing
  const currentRoundIdRef = useRef(0);
  const matchHandledRef = useRef(true);

  // Cycle / target-update
  const cycleCountRef = useRef(0);
  const prevYourFruitRef = useRef(-1);
  const prevYourColorRef = useRef(-1);
  const lastFullMatchTimeRef = useRef<number>(0); // Track time since last FULL_MATCH for guarantee
  const processingCycleRef = useRef(false); // Prevent concurrent scheduleNextCycle calls
  const isFirstCycleRef = useRef(true); // Prevent FULL_MATCH on first cycle (ease-in)

  // Debug counters
  const debugCountsRef = useRef({
    cycles: 0,
    targetUpdates: 0,
    fullPlanned: 0,
    partialPlanned: 0,
    noPlanned: 0,
    fullSpawned: 0,        // when you actually set matchActive true
    misses: 0,
    wrongTaps: 0,
    successes: 0,
  });

  // Debug state for HUD
  const [debugState, setDebugState] = useState({
    cycleCount: 0,
    targetJustUpdated: false,
    fullMatchChancePct: 0,
    partialChancePct: 0,
    lastRoll1: 0,
    lastRoll2: 0,
    plannedMatchType: 'NO' as MatchType | 'NO',
    targetFruit: 0,
    targetColor: 0,
    yourFruit: 0,
    yourColor: 0,
    isVisualFullMatch: false,
    matchActive: false,
    matchHandled: true,
    matchId: 0,
  });

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

  const cleanupAllTimers = useCallback(() => {
    if (roundTimeoutRef.current) {
      clearTimeout(roundTimeoutRef.current);
      roundTimeoutRef.current = null;
    }
    if (matchWindowTimeoutRef.current) {
      clearTimeout(matchWindowTimeoutRef.current);
      matchWindowTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (mismatchHighlightTimeoutRef.current) {
      clearTimeout(mismatchHighlightTimeoutRef.current);
      mismatchHighlightTimeoutRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => cleanupAllTimers();
  }, [cleanupAllTimers]);

  // Cleanup all timers on game over (prevents phantom misses)
  useEffect(() => {
    if (gameState.status === 'gameover') {
      cleanupAllTimers();
    }
  }, [gameState.status, cleanupAllTimers]);

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

  // Keep refs in sync with state (for tap handler). matchActiveRef is source of truth, set in scheduleNextCycle/tap/miss.
  useEffect(() => {
    isMatchWindowRef.current = gameState.isMatchWindow;
    targetFruitRef.current = gameState.targetFruit;
    targetColorRef.current = gameState.targetColor;
    yourFruitRef.current = gameState.yourFruit;
    yourColorRef.current = gameState.yourColor;
    gameStatusRef.current = gameState.status;
    
    // Update debug state when game state changes
    if (DEBUG && gameState.status === 'playing') {
      const isVisualFullMatch = gameState.targetFruit === gameState.yourFruit && gameState.targetColor === gameState.yourColor;
      setDebugState(prev => ({
        ...prev,
        targetFruit: gameState.targetFruit,
        targetColor: gameState.targetColor,
        yourFruit: gameState.yourFruit,
        yourColor: gameState.yourColor,
        isVisualFullMatch,
        matchActive: matchActiveRef.current,
        matchHandled: matchHandledRef.current,
        matchId: currentRoundIdRef.current,
      }));
    }
  }, [gameState.isMatchWindow, gameState.targetFruit, gameState.targetColor, gameState.yourFruit, gameState.yourColor, gameState.status]);

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
    const id = `score-${performance.now()}`;
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

  const scheduleNextCycle = useCallback((currentScore: number, caller?: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:502',message:'scheduleNextCycle called',data:{currentScore,caller:caller||'unknown',cycleCount:cycleCountRef.current,matchActive:matchActiveRef.current,processing:processingCycleRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
    // #endregion
    // Prevent concurrent calls
    if (processingCycleRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:505',message:'scheduleNextCycle blocked: already processing',data:{caller:caller||'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
      // Note: Don't clear processingCycleRef here - the other call is still processing
      return;
    }
    // CRITICAL: Never allow scheduleNextCycle if a match window is still active
    // This prevents creating a new match before the previous one is fully resolved
    if (matchActiveRef.current || isMatchWindowRef.current) {
      if (caller !== 'miss-handler' && caller !== 'handleTap-success') {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:505',message:'scheduleNextCycle blocked: match window active',data:{caller:caller||'unknown',matchActive:matchActiveRef.current,isMatchWindow:isMatchWindowRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        processingCycleRef.current = false;
        return;
      }
      // Even for success/miss handlers, if match window is still active, wait a bit
      // This prevents race conditions where cleanup hasn't finished
      if (isMatchWindowRef.current) {
        processingCycleRef.current = false;
        setTimeout(() => {
          scheduleNextCycle(currentScore, caller || 'retry-after-match-window');
        }, 100);
        return;
      }
    }
    processingCycleRef.current = true;
    cleanupAllTimers();
    const now = performance.now();

    // CRITICAL FIX: Increment cycleCount OUTSIDE setGameState to prevent double-increment in React Strict Mode
    debugCountsRef.current.cycles++;
    const cycleCount = cycleCountRef.current + 1;
    cycleCountRef.current = cycleCount;

    setGameState((prev) => {
      if (prev.status !== 'playing') {
        processingCycleRef.current = false;
        return prev;
      }

      const fullMatchChancePct = getFullMatchChancePct(currentScore);
      const partialChancePct = getPartialChancePct(currentScore);
      const cycleMs = getCycleMs(currentScore);

      let targetFruit = prev.targetFruit;
      let targetColor = prev.targetColor;
      // CRITICAL FIX: Don't use cycleCount % 2 === 0 - it causes targetJustUpdated to always be true if cycleCount is always even
      // Reduced frequency: 25% chance to update target, OR every 4th cycle (less frequent = more FULL_MATCH opportunities)
      const targetJustUpdated = (cycleCount % 4 === 0) || Math.random() < 0.25;
      if (targetJustUpdated) {
        debugCountsRef.current.targetUpdates++;
        targetFruit = randomFruit();
        targetColor = randomColor();
      }

      // Guarantee FULL_MATCH every 3-5 seconds
      const timeSinceLastFullMatch = now - lastFullMatchTimeRef.current;
      const mustForceFullMatch = timeSinceLastFullMatch >= 5000; // Force after 5 seconds
      const shouldForceFullMatch = timeSinceLastFullMatch >= 3000 && Math.random() < 0.4; // 40% chance after 3s

      let matchType: MatchType;
      let lastRoll1 = 0;
      let lastRoll2 = 0;
      
      // CRITICAL FIX: Allow FULL_MATCH even when targetJustUpdated is true, but reduce probability slightly
      // This makes the game more engaging - FULL_MATCH should be frequent, not rare
      // If target just updated, reduce FULL_MATCH chance by 20% (but still allow it)
      const effectiveFullMatchChance = targetJustUpdated 
        ? Math.max(10, fullMatchChancePct * 0.8) // 80% of normal chance, minimum 10%
        : fullMatchChancePct;
      
      const rand1 = Math.random() * 100;
      lastRoll1 = rand1;
      
      // CRITICAL: Prevent FULL_MATCH on first cycle - ease the player in
      const isFirstCycle = isFirstCycleRef.current;
      if (isFirstCycle) {
        isFirstCycleRef.current = false; // Clear flag after first cycle
      }
      
      if ((mustForceFullMatch || shouldForceFullMatch || rand1 < effectiveFullMatchChance) && !isFirstCycle) {
        matchType = 'FULL_MATCH';
      } else {
        const rand2 = Math.random() * 100;
        lastRoll2 = rand2;
        matchType = rand2 < partialChancePct ? 'PARTIAL_MATCH' : 'NO_MATCH';
      }

      // Update debug counters
      if (matchType === 'FULL_MATCH') {
        debugCountsRef.current.fullPlanned++;
      } else if (matchType === 'PARTIAL_MATCH') {
        debugCountsRef.current.partialPlanned++;
      } else {
        debugCountsRef.current.noPlanned++;
      }

      // Log probability units check (every 20 cycles)
      if (DEBUG && debugCountsRef.current.cycles % 20 === 0) {
        console.log('[DEBUG] Probability check:', { fullMatchChancePct, partialChancePct });
      }

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:536',message:'scheduleNextCycle: match type determined',data:{matchType,targetJustUpdated,fullMatchChancePct,partialChancePct,cycleCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F,G,H,I,J'})}).catch(()=>{});
      // #endregion

      // Set matchActiveRef IMMEDIATELY when FULL_MATCH is determined (SYNCHRONOUSLY, before any other logic) to prevent overwrites
      if (matchType === 'FULL_MATCH') {
        matchActiveRef.current = true;
        lastFullMatchTimeRef.current = now;
        // CRITICAL FIX: Increment fullSpawned here, not later, to ensure it counts when matchActive is actually set
        debugCountsRef.current.fullSpawned++;
      } else {
        matchActiveRef.current = false;
      }

      let yourFruit: number;
      let yourColor: number;
      if (matchType === 'FULL_MATCH') {
        yourFruit = targetFruit;
        yourColor = targetColor;
      } else if (matchType === 'PARTIAL_MATCH') {
        const fruitMatch = Math.random() < 0.5;
        if (fruitMatch) {
          yourFruit = targetFruit;
          yourColor = randomColorExcept(targetColor);
        } else {
          yourColor = targetColor;
          yourFruit = randomFruitExcept(targetFruit);
        }
      } else {
        yourFruit = randomFruitExcept(targetFruit);
        yourColor = randomColorExcept(targetColor);
      }

      // CRITICAL FIX: Don't overwrite FULL_MATCH values even if they're duplicates
      // For FULL_MATCH, we MUST keep the matching values (yourFruit === targetFruit, yourColor === targetColor)
      // Only check for duplicates for PARTIAL and NO_MATCH
      if (matchType !== 'FULL_MATCH' && yourFruit === prevYourFruitRef.current && yourColor === prevYourColorRef.current) {
        if (matchType === 'PARTIAL_MATCH') {
          const fruitMatch = Math.random() < 0.5;
          if (fruitMatch) {
            yourFruit = targetFruit;
            yourColor = randomColorExcept(targetColor);
          } else {
            yourColor = targetColor;
            yourFruit = randomFruitExcept(targetFruit);
          }
        } else {
          yourFruit = randomFruitExcept(targetFruit);
          yourColor = randomColorExcept(targetColor);
        }
      }

      prevYourFruitRef.current = yourFruit;
      prevYourColorRef.current = yourColor;
      targetFruitRef.current = targetFruit;
      targetColorRef.current = targetColor;
      yourFruitRef.current = yourFruit;
      yourColorRef.current = yourColor;
      isMatchWindowRef.current = matchType === 'FULL_MATCH';

      if (matchType === 'FULL_MATCH') {
        // CRITICAL: Verify that FULL_MATCH values actually match (sanity check)
        if (yourFruit !== targetFruit || yourColor !== targetColor) {
          console.error('[ColorReaction] BUG: FULL_MATCH created but values do not match!', {
            targetFruit,
            targetColor,
            yourFruit,
            yourColor,
          });
          // Force them to match
          yourFruitRef.current = targetFruit;
          yourColorRef.current = targetColor;
          yourFruit = targetFruit;
          yourColor = targetColor;
        }
        // fullSpawned already incremented above when matchActive was set
        
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:590',message:'FULL_MATCH: refs set',data:{targetFruit,targetColor,yourFruit,yourColor,refsMatch:targetFruit===yourFruit&&targetColor===yourColor},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
        // #endregion
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:580',message:'FULL_MATCH: setting up match window',data:{matchType,localMatchId:currentRoundIdRef.current+1,windowMs:getMatchWindowMs(currentScore,prev.streak),currentScore,streak:prev.streak},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F,G,H,J'})}).catch(()=>{});
        // #endregion
        currentRoundIdRef.current += 1;
        const localMatchId = currentRoundIdRef.current;
        matchHandledRef.current = false;
        matchStartTsRef.current = now;
        const windowMs = getMatchWindowMs(currentScore, prev.streak);
        matchWindowMsRef.current = windowMs;
        
        // CRITICAL: Ensure match window is valid (sanity check)
        if (windowMs < 500 || windowMs > 1000) {
          console.error('[ColorReaction] Invalid match window duration:', windowMs, { currentScore, streak: prev.streak });
        }
        
        // DEBUG: Log when FULL_MATCH window is created
        if (DEBUG) {
          console.log('[DEBUG] FULL_MATCH window created:', {
            matchId: localMatchId,
            windowMs,
            currentScore,
            streak: prev.streak,
            targetFruit,
            targetColor,
            yourFruit,
            yourColor,
          });
        }

        setMatchProgress(100);
        setUrgencyLevel('normal');
        playCRMatchStart();

        const startTime = now;
        countdownIntervalRef.current = setInterval(() => {
          const elapsed = performance.now() - startTime;
          const progress = Math.max(0, 100 * (1 - elapsed / windowMs));
          setMatchProgress(progress);
          if (progress <= 0 && countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
        }, 50);

        matchWindowTimeoutRef.current = setTimeout(() => {
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:604',message:'Miss handler: timeout fired',data:{localMatchId,currentMatchId:currentRoundIdRef.current,matchHandled:matchHandledRef.current,matchActive:matchActiveRef.current,tf:targetFruitRef.current,tc:targetColorRef.current,yf:yourFruitRef.current,yc:yourColorRef.current,visualsMatch:targetFruitRef.current===yourFruitRef.current&&targetColorRef.current===yourColorRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F,G,H,I'})}).catch(()=>{});
          // #endregion
          
          // CRITICAL: Check match ID FIRST (fastest check) - if match was handled, ID will be different
          // This prevents the miss handler from firing after a successful tap
          if (localMatchId !== currentRoundIdRef.current) {
            // Match was already handled (success handler incremented the ID)
            return;
          }
          
          // CRITICAL: Check all other guards BEFORE processing to prevent multiple life losses
          if (
            matchHandledRef.current ||
            !matchActiveRef.current
          ) {
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:609',message:'Miss handler: blocked',data:{reason:localMatchId!==currentRoundIdRef.current?'stale':matchHandledRef.current?'handled':!matchActiveRef.current?'notActive':'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
            // #endregion
            return;
          }
          
          const visualsMatch = targetFruitRef.current === yourFruitRef.current && targetColorRef.current === yourColorRef.current;
          if (!visualsMatch) {
            // #region agent log
            fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:620',message:'Miss handler: blocked - visuals do not match',data:{tf:targetFruitRef.current,tc:targetColorRef.current,yf:yourFruitRef.current,yc:yourColorRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F,G'})}).catch(()=>{});
            // #endregion
            matchHandledRef.current = true;
            matchActiveRef.current = false;
            return;
          }
          
          // CRITICAL: Mark as handled IMMEDIATELY to prevent duplicate processing
          matchHandledRef.current = true;
          matchActiveRef.current = false;
          debugCountsRef.current.misses++;
          
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:630',message:'Miss handler: processing miss (life loss)',data:{localMatchId,willLoseLife:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setMatchProgress(0);
          isMatchWindowRef.current = false;
          hapticCRMiss();
          playCRMiss();
          setFloatingClock(true);
          setTimeout(() => setFloatingClock(false), 800);

          // CRITICAL FIX: Use functional update to get current lives, not stale closure value
          // This prevents multiple life losses from stale state
          setGameState((currentState) => {
            // Double-check we haven't already processed this (safety guard)
            if (currentState.status !== 'playing') {
              return currentState;
            }
            
            const currentLives = currentState.lives;
            const newLives = currentLives - 1;
            
            if (newLives <= 0) {
              gameStatusRef.current = 'gameover';
              if (musicAudioRef.current) {
                musicAudioRef.current.pause();
                musicAudioRef.current = null;
              }
              return { ...currentState, status: 'gameover', lives: 0, streak: 0, isMatchWindow: false };
            } else {
              // Schedule next cycle after state update completes
              setTimeout(() => {
                scheduleNextCycle(currentScore, 'miss-handler');
              }, 0);
              return { ...currentState, lives: newLives, streak: 0, isMatchWindow: false };
            }
          });
        }, windowMs);
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:638',message:'PARTIAL/NO_MATCH: scheduling next cycle',data:{matchType,cycleMs,willNotCreateMatchWindow:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        matchHandledRef.current = true;
        matchActiveRef.current = false;
        roundTimeoutRef.current = setTimeout(() => {
          scheduleNextCycle(currentScore, 'cycle-timeout');
        }, cycleMs);
      }

      processingCycleRef.current = false; // Clear processing flag after state update
      
      // Update debug HUD state (use cycleCount from outer scope, not from inside setGameState)
      if (DEBUG) {
        const isVisualFullMatch = targetFruit === yourFruit && targetColor === yourColor;
        setDebugState({
          cycleCount: cycleCountRef.current, // Use the ref value, not the local variable
          targetJustUpdated,
          fullMatchChancePct,
          partialChancePct,
          lastRoll1,
          lastRoll2,
          plannedMatchType: matchType,
          targetFruit,
          targetColor,
          yourFruit,
          yourColor,
          isVisualFullMatch,
          matchActive: matchActiveRef.current,
          matchHandled: matchHandledRef.current,
          matchId: currentRoundIdRef.current,
        });
      }
      
      return {
        ...prev,
        targetFruit,
        targetColor,
        yourFruit,
        yourColor,
        matchType,
        isMatchWindow: matchType === 'FULL_MATCH',
        lastColorChangeTime: now,
      };
    });
  }, [cleanupAllTimers, playCRMatchStart, hapticCRMiss, playCRMiss]);

  // Handle correct tap with all effects (Arcade: points = basePoints + streakBonus, no multiplier)
  const handleCorrectTap = useCallback(
    (actualPoints: number, rating: string, reactionMs: number, newStreak: number) => {
      triggerScreenShake(100);
      triggerPlayerFlash('correct');

      if (rating !== 'PERFECT') {
        setCurrentRating(rating);
        setTimeout(() => setCurrentRating(null), 800);
      }
      showFloatingScore(`+${actualPoints}`, 'correct');

      // TASK 70: Score pop effect
      setScorePop(true);
      setTimeout(() => setScorePop(false), 200);

      // TASK 63: Update combo meter fill (max at 20 streak)
      setComboMeterFill(Math.min(100, (newStreak / 20) * 100));

      playCRCorrectTap(reactionMs);

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

        setShowReactionTime(reactionMs);
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

      const colorIdx = yourColorRef.current;
      const hex = COLORS[colorIdx]?.hex ?? '#FF6B00';
      const emoji = FRUITS[yourFruitRef.current]?.emoji ?? '🍊';
      triggerShockwave(hex, 0.5);
      triggerSparks(hex);
      addFloatingEmoji(emoji);
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
        bestMomentsRef.current.push({ type: 'perfect', value: reactionMs, timestamp: performance.now() });
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

      if (reactionMs < 200 && rating !== 'PERFECT') {
        showEpicCallout('LIGHTNING!');
      }
    },
    [triggerScreenShake, triggerPlayerFlash, showFloatingScore, showEpicCallout, triggerShockwave, triggerSparks, addFloatingEmoji, updateCombo, triggerConfetti, hapticCRPerfect, hapticCRGreat, hapticCRGood, hapticCROk, hapticCRStreak5, hapticCRStreak10, hapticCRStreak15, hapticCRStreak20, playCRCorrectTap, playCRPerfect, playCRTimeDilation, playCRStreakMilestone]
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

    const currentStatus = gameStatusRef.current;
    // CRITICAL FIX: Refs are updated SYNCHRONOUSLY when FULL_MATCH is created, but gameState updates ASYNCHRONOUSLY
    // For match detection, refs are the source of truth because they're set immediately before the match window
    // Check refs FIRST (they're always up-to-date), then fall back to state
    const tfRef = targetFruitRef.current;
    const tcRef = targetColorRef.current;
    const yfRef = yourFruitRef.current;
    const ycRef = yourColorRef.current;
    const isVisualFullMatchRef = tfRef === yfRef && tcRef === ycRef;
    
    // Also check state (what's rendered) as fallback
    const tf = gameState.targetFruit;
    const tc = gameState.targetColor;
    const yf = gameState.yourFruit;
    const yc = gameState.yourColor;
    const isVisualFullMatch = tf === yf && tc === yc;
    
    // CRITICAL: Prefer refs (synchronous, always current) over state (async, might be stale)
    // For FULL_MATCH, refs are set synchronously before match window, so they're authoritative
    const visualMatch = isVisualFullMatchRef || isVisualFullMatch;
    const matchActive = matchActiveRef.current;
    const matchStartTs = matchStartTsRef.current;
    const matchWindowMs = matchWindowMsRef.current;
    const withinWindow =
      matchStartTs !== null && matchWindowMs > 0 && now - matchStartTs <= matchWindowMs;

    if (currentStatus === 'idle') {
      gameStartTimeRef.current = now;
      const tF = randomFruit();
      const tC = randomColor();
      const yF = randomFruit();
      const yC = randomColor();
      targetFruitRef.current = tF;
      targetColorRef.current = tC;
      yourFruitRef.current = yF;
      yourColorRef.current = yC;
      gameStatusRef.current = 'playing';

      playCRGameStart();

      setGameState({
        ...initialGameState,
        status: 'playing',
        targetFruit: tF,
        targetColor: tC,
        yourFruit: yF,
        yourColor: yC,
        lastColorChangeTime: now,
      });
      maxStreakRef.current = 0;
      isFirstCycleRef.current = true; // Reset first cycle flag when starting game
      // Start music on user gesture (required for mobile browsers)
      // Skip if GameModal manages the music (check both ref AND context for timing safety)
      if (!musicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
        playNextMusicTrack();
      }
      scheduleNextCycle(0, 'handleTap-idle');
      return;
    }

    if (currentStatus !== 'playing') return;

    // Grace period after game starts
    if (now - gameStartTimeRef.current < GRACE_PERIOD_MS) {
      console.log('[ColorReaction] Grace period - ignored');
      return;
    }

    const actualElapsed = matchStartTs !== null ? now - matchStartTs : 500;
    const isSuccess = matchActive && withinWindow && visualMatch;

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:947',message:'Tap handler entry',data:{matchActive,withinWindow,visualMatch,isVisualFullMatchRef,isVisualFullMatch,tfRef,tcRef,yfRef,ycRef,tf,tc,yf,yc,matchStartTs,matchWindowMs,isSuccess,gameStateLives:gameState.lives,matchHandled:matchHandledRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
    // #endregion
    
    // DEBUG: Log match check details when matchActive is true
    if (DEBUG && matchActive) {
      console.log('[DEBUG] Match check:', {
        matchActive,
        withinWindow,
        visualMatch,
        refsMatch: isVisualFullMatchRef,
        stateMatch: isVisualFullMatch,
        refs: { tf: tfRef, tc: tcRef, yf: yfRef, yc: ycRef },
        state: { tf, tc, yf, yc },
        isSuccess,
      });
    }

    if (isSuccess) {
      // CRITICAL: Set all guards FIRST before clearing timeout to prevent race condition
      // If timeout fires between setting matchHandled and clearing, it will see matchHandled=true
      matchHandledRef.current = true;
      matchActiveRef.current = false;
      isMatchWindowRef.current = false;
      
      // CRITICAL: Increment match ID to invalidate any pending timeout
      // This ensures the miss handler sees a stale matchId and returns early
      currentRoundIdRef.current += 1;
      
      // Now clear timers (they're safe to clear now that guards are set)
      if (matchWindowTimeoutRef.current) {
        clearTimeout(matchWindowTimeoutRef.current);
        matchWindowTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setMatchProgress(0);

      const reactionMs = actualElapsed;
      const basePoints = calculateBasePoints(reactionMs);
      const nextStreak = gameState.streak + 1;
      const streakBonus = getStreakBonus(nextStreak);
      const actualPoints = basePoints + streakBonus;
      const rating =
        reactionMs < 300 ? 'PERFECT' : reactionMs < 500 ? 'GREAT' : reactionMs < 700 ? 'GOOD' : reactionMs < 1000 ? 'OK' : 'SLOW';

      setGameState((prev) => {
        const newScore = prev.score + actualPoints;
        const newBestTime = Math.min(prev.bestReactionTime, reactionMs);
        if (newScore > highScore && prev.score <= highScore) {
          setHighScoreBeat(true);
          setTimeout(() => setHighScoreBeat(false), 1500);
        }
        if (reactionMs < prev.bestReactionTime && prev.bestReactionTime !== Infinity) {
          setBestTimeBeat(true);
          setTimeout(() => setBestTimeBeat(false), 1500);
        }
        return {
          ...prev,
          score: newScore,
          streak: nextStreak,
          bestReactionTime: newBestTime,
          isMatchWindow: false,
          lastColorChangeTime: now,
        };
      });

      debugCountsRef.current.successes++;
      handleCorrectTap(actualPoints, rating, reactionMs, nextStreak);
      
      // CRITICAL FIX: Add a small delay after success to give user time to see their success
      // Also ensures previous match is fully cleaned up before starting next cycle
      setTimeout(() => {
        // Double-check match is fully cleared before scheduling next cycle
        if (!matchActiveRef.current && !isMatchWindowRef.current) {
          scheduleNextCycle(gameState.score + actualPoints, 'handleTap-success');
        }
      }, 300); // 300ms delay - enough to see success feedback, not too long to feel sluggish
    } else if (visualMatch && !matchActive) {
      // CRITICAL FIX: "Too late" - clear the match window and continue the game
      // The match window expired, so clear it and schedule next cycle
      matchActiveRef.current = false;
      isMatchWindowRef.current = false;
      setMatchProgress(0);
      if (matchWindowTimeoutRef.current) {
        clearTimeout(matchWindowTimeoutRef.current);
        matchWindowTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      
      setTooLateFeedback(true);
      setTimeout(() => setTooLateFeedback(false), 600);
      triggerScreenShake(80);
      triggerPlayerFlash('wrong');
      showFloatingScore('TOO LATE', 'warning');
      
      // CRITICAL: Schedule next cycle so game continues
      setGameState((prev) => ({
        ...prev,
        isMatchWindow: false,
      }));
      scheduleNextCycle(gameState.score, 'handleTap-too-late');
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1001',message:'Wrong-tap branch entered',data:{matchActive,withinWindow,isVisualFullMatch,tf,tc,yf,yc,matchHandled:matchHandledRef.current,gameStateLives:gameState.lives},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
      // #endregion
      if (matchActive && matchHandledRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1038',message:'Wrong-tap blocked: match already handled',data:{matchActive,matchHandled:matchHandledRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return;
      }
      if (now - lastWrongTapTimeRef.current < WRONG_TAP_COOLDOWN_MS) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1003',message:'Wrong-tap blocked: cooldown',data:{timeSinceLastTap:now-lastWrongTapTimeRef.current,cooldown:WRONG_TAP_COOLDOWN_MS},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
      }
      lastWrongTapTimeRef.current = now;
      debugCountsRef.current.wrongTaps++;
      const now2 = performance.now();
      if (now2 - lastLifeLostTimeRef.current < LIFE_LOSS_COOLDOWN_MS) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1006',message:'Wrong-tap blocked: life loss cooldown',data:{timeSinceLastLifeLoss:now2-lastLifeLostTimeRef.current,cooldown:LIFE_LOSS_COOLDOWN_MS},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
      }
      lastLifeLostTimeRef.current = now2;

      if (mismatchHighlightTimeoutRef.current) {
        clearTimeout(mismatchHighlightTimeoutRef.current);
      }
      setMismatchFruit(yf !== tf);
      setMismatchColor(yc !== tc);
      mismatchHighlightTimeoutRef.current = setTimeout(() => {
        setMismatchFruit(false);
        setMismatchColor(false);
        mismatchHighlightTimeoutRef.current = null;
      }, 500);

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

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1036',message:'Wrong-tap: about to lose life',data:{currentLives:gameState.lives,willLose:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      setGameState((prev) => {
        const newLives = prev.lives - 1;
        console.log(`[ColorReaction] Lives: ${prev.lives} -> ${newLives}`);
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b3daef8d-3549-41da-8818-1d4a9aa28ef9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ColorReaction.tsx:1037',message:'Wrong-tap: life loss state update',data:{oldLives:prev.lives,newLives,willGameOver:newLives<=0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

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
  }, [scheduleNextCycle, handleCorrectTap, gameState.streak, gameState.lives, gameState.score, highScore, isSignedIn, submitScore, hapticCRTap, musicManagedExternally, playNextMusicTrack]);

  // Simulation function to test spawn logic without UI
  const simulateSpawns = useCallback((iter: number = 10000) => {
    let score = 0;
    let cycleCount = 0;
    let full = 0;
    let partial = 0;
    let no = 0;
    let forcedNonFull = 0;

    for (let i = 0; i < iter; i++) {
      cycleCount++;
      const targetJustUpdated = (cycleCount % 2 === 0) || (Math.random() < 0.35);
      if (targetJustUpdated) forcedNonFull++;

      const fullPct = getFullMatchChancePct(score);
      const partialPct = getPartialChancePct(score);

      let type: MatchType;
      if (targetJustUpdated) {
        const rand = Math.random() * 100;
        type = (rand < partialPct) ? 'PARTIAL_MATCH' : 'NO_MATCH';
      } else {
        const rand1 = Math.random() * 100;
        if (rand1 < fullPct) {
          type = 'FULL_MATCH';
        } else {
          const rand2 = Math.random() * 100;
          type = (rand2 < partialPct) ? 'PARTIAL_MATCH' : 'NO_MATCH';
        }
      }

      if (type === 'FULL_MATCH') full++;
      else if (type === 'PARTIAL_MATCH') partial++;
      else no++;
    }

    return { full, partial, no, forcedNonFull, total: iter };
  }, []);

  // Run simulation on mount when DEBUG is true
  useEffect(() => {
    if (DEBUG) {
      const result = simulateSpawns(10000);
      console.log('[DEBUG] Simulation results (10k cycles):', result);
      console.log('[DEBUG] FULL percentage:', ((result.full / result.total) * 100).toFixed(2) + '%');
    }
  }, [simulateSpawns]);

  // Handle game restart - TASK 82: Retry animation (smooth transition)
  const handleRestart = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const now = performance.now();
    gameStartTimeRef.current = now;
    lastTapTimeRef.current = now;

    cleanupAllTimers();
    setMatchProgress(0);
    setLivesWarning(null);
    resetAllEffects();

    // Reset debug counters
    debugCountsRef.current = {
      cycles: 0,
      targetUpdates: 0,
      fullPlanned: 0,
      partialPlanned: 0,
      noPlanned: 0,
      fullSpawned: 0,
      misses: 0,
      wrongTaps: 0,
      successes: 0,
    };

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
    setTooLateFeedback(false);
    setMismatchFruit(false);
    setMismatchColor(false);

    setGameState({
      ...initialGameState,
      status: 'playing',
      targetFruit: randomFruit(),
      targetColor: randomColor(),
      yourFruit: randomFruit(),
      yourColor: randomColor(),
      lastColorChangeTime: now,
    });
    maxStreakRef.current = 0;
    cycleCountRef.current = 0;
    prevYourFruitRef.current = -1;
    prevYourColorRef.current = -1;
    isFirstCycleRef.current = true; // Reset first cycle flag on restart
    if (!musicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
      playNextMusicTrack();
    }
    lastFullMatchTimeRef.current = 0;
    scheduleNextCycle(0, 'handleRestart');
  }, [cleanupAllTimers, scheduleNextCycle, resetAllEffects, playNextMusicTrack, musicManagedExternally]);

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
          <GameEffects effects={effects} accentColor={COLORS[gameState.yourColor]?.hex ?? '#FF6B00'} />

          {/* Debug HUD */}
          {DEBUG && gameState.status === 'playing' && (
            <div className="debug-hud">
              <div className="debug-section">
                <div className="debug-label">Cycle: {debugState.cycleCount}</div>
                <div className="debug-label">Target Updated: {debugState.targetJustUpdated ? 'YES' : 'NO'}</div>
                <div className="debug-label">Full %: {debugState.fullMatchChancePct.toFixed(1)}</div>
                <div className="debug-label">Partial %: {debugState.partialChancePct.toFixed(1)}</div>
                <div className="debug-label">Roll1: {debugState.lastRoll1.toFixed(1)}</div>
                <div className="debug-label">Roll2: {debugState.lastRoll2.toFixed(1)}</div>
                <div className="debug-label">Planned: {debugState.plannedMatchType}</div>
              </div>
              <div className="debug-section">
                <div className="debug-label">Target (state): {FRUITS[gameState.targetFruit]?.emoji} {COLORS[gameState.targetColor]?.name}</div>
                <div className="debug-label">Your (state): {FRUITS[gameState.yourFruit]?.emoji} {COLORS[gameState.yourColor]?.name}</div>
                <div className="debug-label">Target (refs): {FRUITS[targetFruitRef.current]?.emoji} {COLORS[targetColorRef.current]?.name}</div>
                <div className="debug-label">Your (refs): {FRUITS[yourFruitRef.current]?.emoji} {COLORS[yourColorRef.current]?.name}</div>
                <div className="debug-label">Visual Match (state): {gameState.targetFruit === gameState.yourFruit && gameState.targetColor === gameState.yourColor ? 'YES' : 'NO'}</div>
                <div className="debug-label">Visual Match (refs): {targetFruitRef.current === yourFruitRef.current && targetColorRef.current === yourColorRef.current ? 'YES' : 'NO'}</div>
                <div className="debug-label">Match Active: {debugState.matchActive ? 'YES' : 'NO'}</div>
                <div className="debug-label">Match Handled: {debugState.matchHandled ? 'YES' : 'NO'}</div>
                <div className="debug-label">Match ID: {debugState.matchId}</div>
              </div>
              <div className="debug-section">
                <div className="debug-label">Counters:</div>
                <div className="debug-label">Cycles: {debugCountsRef.current.cycles}</div>
                <div className="debug-label">Target Updates: {debugCountsRef.current.targetUpdates}</div>
                <div className="debug-label">Full Planned: {debugCountsRef.current.fullPlanned}</div>
                <div className="debug-label">Full Spawned: {debugCountsRef.current.fullSpawned}</div>
                <div className="debug-label">Successes: {debugCountsRef.current.successes}</div>
                <div className="debug-label">Misses: {debugCountsRef.current.misses}</div>
                <div className="debug-label">Wrong Taps: {debugCountsRef.current.wrongTaps}</div>
              </div>
            </div>
          )}

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

            {/* Target: fruit + color */}
            <div className="color-section">
              <span className="color-label">TARGET</span>
              <div
                className={`color-display target-display ${perfectPulse ? 'perfect-pulse' : ''}`}
                style={{
                  backgroundColor: COLORS[gameState.targetColor].hex,
                  width: displaySize,
                  height: displaySize,
                }}
              >
                <span className="color-emoji">{FRUITS[gameState.targetFruit].emoji}</span>
              </div>
            </div>

            {/* Player Color Display with countdown ring */}
            <div className="color-section">
              <span className="color-label">YOUR</span>
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
                  className={`color-display player-display ${gameState.isMatchWindow ? 'matching match-glow' : ''} ${playerFlash ? `flash-${playerFlash}` : ''} ${perfectPulse ? 'perfect-pulse' : ''} ${tapSquash ? 'tap-squash' : ''} ${impactFlash ? 'impact-flash' : ''} ${tooLateFeedback ? 'too-late-flash' : ''} ${mismatchColor ? 'mismatch-color' : ''}`}
                  style={{
                    backgroundColor: COLORS[gameState.yourColor].hex,
                    width: displaySize,
                    height: displaySize,
                  }}
                >
                  <span className={`color-emoji ${mismatchFruit ? 'mismatch-fruit' : ''}`}>{FRUITS[gameState.yourFruit].emoji}</span>
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
```

## Key Areas to Review:

1. **`scheduleNextCycle` (line 556)** - Match creation logic
2. **`handleTap` (line 1138)** - Tap handling and success detection  
3. **First cycle prevention (lines 637-641, 1204, 1516)** - `isFirstCycleRef` flag
4. **Grace period handling (lines 1216-1220)** - 800ms grace period after game starts
5. **Match window timeout (line 789)** - Miss handler that deducts lives
6. **Success handler (line 1243)** - Handles successful taps on FULL_MATCH
