import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IonButton } from '@ionic/react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { SoundManager } from '@/systems/audio/SoundManager';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameMute } from '@/contexts/GameMuteContext';
import { useArcadeLights } from '@/contexts/ArcadeLightsContext';
import { GAME_COMBO_TIERS } from '@/config/arcade-light-mappings';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { GameSEO } from '@/components/seo/GameSEO';
import { ArcadeGameOverScreen } from '@/components/media/games/ArcadeGameOverScreen';
import './BrickByBrick.css';

interface Block {
  id: number;
  x: number;
  width: number;
  y: number;
}

const BLOCK_HEIGHT_DESKTOP = 45; // Desktop block height
const BLOCK_HEIGHT_MOBILE = 40; // Mobile block height - must match CSS!

// Level configurations - 10 levels with gradual difficulty (HARDER: ~50% faster speeds)
const LEVEL_CONFIG: Record<number, { startSpeed: number; speedIncrease: number; blocksToComplete: number; minBlockWidth: number; theme: string }> = {
  1:  { startSpeed: 2.0, speedIncrease: 0.05, blocksToComplete: 6,  minBlockWidth: 50, theme: 'sunrise' },
  2:  { startSpeed: 2.4, speedIncrease: 0.06, blocksToComplete: 7,  minBlockWidth: 45, theme: 'morning' },
  3:  { startSpeed: 2.8, speedIncrease: 0.07, blocksToComplete: 8,  minBlockWidth: 40, theme: 'day' },
  4:  { startSpeed: 3.2, speedIncrease: 0.08, blocksToComplete: 9,  minBlockWidth: 35, theme: 'afternoon' },
  5:  { startSpeed: 3.6, speedIncrease: 0.09, blocksToComplete: 10, minBlockWidth: 30, theme: 'sunset' },
  6:  { startSpeed: 4.0, speedIncrease: 0.10, blocksToComplete: 11, minBlockWidth: 26, theme: 'dusk' },
  7:  { startSpeed: 4.4, speedIncrease: 0.11, blocksToComplete: 12, minBlockWidth: 22, theme: 'evening' },
  8:  { startSpeed: 4.8, speedIncrease: 0.12, blocksToComplete: 13, minBlockWidth: 18, theme: 'night' },
  9:  { startSpeed: 5.2, speedIncrease: 0.13, blocksToComplete: 14, minBlockWidth: 15, theme: 'storm' },
  10: { startSpeed: 5.5, speedIncrease: 0.14, blocksToComplete: 15, minBlockWidth: 12, theme: 'inferno' },
};

const MAX_LEVEL = 10;

// Power-up types
type PowerUpType = 'magnet' | 'slowmo' | 'width' | 'shield';
const POWER_UPS: Record<PowerUpType, { emoji: string; name: string; duration?: number }> = {
  magnet: { emoji: '🧲', name: 'Magnet', duration: 1 },      // Auto-centers next drop
  slowmo: { emoji: '⏱️', name: 'Slow-Mo', duration: 5000 },  // 50% speed for 5 seconds
  width:  { emoji: '📏', name: 'Width+', duration: 1 },      // Restore 30px width
  shield: { emoji: '🛡️', name: 'Shield', duration: 1 },      // Forgives one bad drop
};

// Combo perk thresholds
const COMBO_PERKS = {
  miniShield: 5,      // At 5x combo, lose less width on bad drops
  autoSlowMo: 10,     // At 10x combo, auto slow-mo for 3 seconds
  widthRestore: 15,   // At 15x combo, restore some width
};

// Scoring configuration
const SCORING = {
  basePoints: 10,           // Points per successful block
  perfectBonus: 50,         // Perfect alignment (no trimming)
  nearPerfectBonus: 20,     // Within 5px of perfect
  speedBonusMax: 30,        // Max bonus for fast drops
  speedBonusTime: 2000,     // Drop within 2 seconds for full speed bonus
  bounceMultiplier: 1,      // Points lost per bounce
  comboMultiplier: 0.1,     // Each consecutive good drop adds 10% multiplier
  levelBonus: 100,          // Bonus per level completed
  powerUpChance: 0.15,      // 15% chance for power-up on block
};

const BrickByBrick: React.FC = () => {
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, playLevelUp, playWarning } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticLevelUp, hapticWarning } = useGameHaptics();
  const isMobile = useIsMobile();

  // Global leaderboard hook
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('orange-stack');

  // Background music controls - use local audio element for reliable mobile playback
  useAudio();

  // Arcade frame mute control (from GameModal)
  const { isMuted: arcadeMuted, musicManagedExternally } = useGameMute();

  // Arcade lights control
  const { triggerEvent, setGameId } = useArcadeLights();

  // Ref for triggerEvent to use in animation loop (avoids stale closure)
  const triggerEventRef = useRef(triggerEvent);
  useEffect(() => {
    triggerEventRef.current = triggerEvent;
  }, [triggerEvent]);

  // Register this game for per-game light overrides
  useEffect(() => {
    setGameId('orange-stack');
  }, [setGameId]);

  // Music playlist - quieter songs that don't overpower sound effects
  const MUSIC_PLAYLIST = [
    { src: '/audio/music/brick-by-brick/yoshis-island-final.mp3', name: "Yoshi's Island" },
    { src: '/audio/music/brick-by-brick/wandering-the-plains-final.mp3', name: 'Wandering the Plains' },
    { src: '/audio/music/brick-by-brick/valley-of-bowser-final.mp3', name: 'Valley of Bowser' },
    { src: '/audio/music/brick-by-brick/forest-of-illusion-final.mp3', name: 'Forest of Illusion' },
  ];

  // Local audio element for game music (more reliable on mobile)
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true); // Sound on by default
  const isMusicPlayingRef = useRef(false); // Ref to avoid stale closure in ended handler
  const playlistIndexRef = useRef(Math.floor(Math.random() * MUSIC_PLAYLIST.length)); // Start with random track

  // Keep ref in sync with state
  useEffect(() => {
    isMusicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  // Track if music has started this session (start on first tap, not on mount)
  const musicStartedRef = useRef(false);

  // Play a specific track from the playlist
  const playTrack = useCallback((index: number) => {
    // Stop current music
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      localAudioRef.current = null;
    }

    const track = MUSIC_PLAYLIST[index];
    const audio = new Audio(track.src);
    audio.volume = 1.0; // Tracks are already normalized quiet

    // When song ends, play next track (use ref to get current state)
    audio.addEventListener('ended', () => {
      playlistIndexRef.current = (playlistIndexRef.current + 1) % MUSIC_PLAYLIST.length;
      if (isMusicPlayingRef.current) {
        playTrack(playlistIndexRef.current);
      }
    }, { once: true });

    localAudioRef.current = audio;
    audio.play().catch(() => {}); // Silently handle autoplay restrictions
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current = null;
      }
    };
  }, []);

  // Sync arcade frame mute button with sound effects (music handled by GameModal when external)
  useEffect(() => {
    // Mute/unmute sound effects via SoundManager
    SoundManager.setMuted(arcadeMuted);

    // Only control local music if NOT managed externally
    if (!musicManagedExternally) {
      if (arcadeMuted && isMusicPlaying) {
        // Mute: pause music
        if (localAudioRef.current) {
          localAudioRef.current.pause();
        }
        setIsMusicPlaying(false);
      } else if (!arcadeMuted && !isMusicPlaying && musicStartedRef.current) {
        // Unmute: resume music if it was playing before
        setIsMusicPlaying(true);
        if (localAudioRef.current) {
          localAudioRef.current.play().catch(() => {});
        } else {
          playTrack(playlistIndexRef.current);
        }
      }
    }

    // Reset mute state when component unmounts
    return () => {
      SoundManager.setMuted(false);
    };
  }, [arcadeMuted, playTrack, musicManagedExternally, isMusicPlaying]);

  // Responsive game dimensions - adapts to viewport size
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update viewport size on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive dimensions based on available space
  const STATS_WIDTH = isMobile ? 0 : 140; // No stats panel on mobile
  const HEADER_HEIGHT = 56; // Top header
  const PADDING = 40; // Some padding around the game

  // Available space calculation
  const availableWidth = viewportSize.width - PADDING;
  const availableHeight = viewportSize.height - HEADER_HEIGHT - PADDING;

  // Desktop: fit game + stats within available space, with max limits
  const MAX_GAME_WIDTH = 650;
  const MAX_GAME_HEIGHT = 600;

  const GAME_WIDTH_RESPONSIVE = isMobile
    ? viewportSize.width
    : Math.min(MAX_GAME_WIDTH, availableWidth - STATS_WIDTH - 20);

  // Container height: subtract header (56px) + bottom nav (60px) + safe area (~34px) + buttons (50px) + buffer (20px)
  const CONTAINER_HEIGHT_RESPONSIVE = isMobile
    ? viewportSize.height - 220
    : Math.min(MAX_GAME_HEIGHT, availableHeight);

  // Use responsive block height - MUST match CSS values exactly!
  const BLOCK_HEIGHT = isMobile ? BLOCK_HEIGHT_MOBILE : BLOCK_HEIGHT_DESKTOP;
  const INITIAL_WIDTH_RESPONSIVE = isMobile ? Math.floor(viewportSize.width * 0.5) : Math.min(220, GAME_WIDTH_RESPONSIVE * 0.35);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'levelComplete' | 'gameover'>('idle');

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing',
  });

  // Ref for game loop to check dialog state
  const showExitDialogRef = useRef(false);
  useEffect(() => {
    showExitDialogRef.current = showExitDialog;
  }, [showExitDialog]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelScore, setLevelScore] = useState(0); // Blocks stacked in current level
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('brickByBrickHighScore') || '0', 10);
  });
  const [speed, setSpeed] = useState(1.5);
  const [direction, setDirection] = useState(1);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  // Scoring state
  const [bounceCount, setBounceCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastDropBonus, setLastDropBonus] = useState('');
  const [lastPoints, setLastPoints] = useState(0);
  const [dropId, setDropId] = useState(0); // Stable ID for effect animations
  const [showScreenShake, setShowScreenShake] = useState(false);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);

  // Visual effects state (reduced for performance)
  const [showShockwave, setShowShockwave] = useState(false);
  const [impactPosition, setImpactPosition] = useState({ x: 0, y: 0 });

  // Power-up state
  const [, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [pendingPowerUp, setPendingPowerUp] = useState<PowerUpType | null>(null); // Power-up on next block
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [powerUpNotification, setPowerUpNotification] = useState<string | null>(null);
  const slowMoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Danger zone feedback - when block width is critically small
  const dangerZoneThreshold = INITIAL_WIDTH_RESPONSIVE * 0.3; // 30% of initial width
  const isDangerZone = currentBlock && currentBlock.width < dangerZoneThreshold;
  const dangerZoneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Danger zone haptic/audio feedback
  useEffect(() => {
    if (isDangerZone && gameState === 'playing' && !dangerZoneIntervalRef.current) {
      // Start pulsing warning feedback
      // Arcade lights: Danger zone warning
      triggerEvent('damage:light');
      dangerZoneIntervalRef.current = setInterval(() => {
        hapticWarning();
        playWarning();
      }, 800);
    } else if ((!isDangerZone || gameState !== 'playing') && dangerZoneIntervalRef.current) {
      clearInterval(dangerZoneIntervalRef.current);
      dangerZoneIntervalRef.current = null;
    }

    return () => {
      if (dangerZoneIntervalRef.current) {
        clearInterval(dangerZoneIntervalRef.current);
        dangerZoneIntervalRef.current = null;
      }
    };
  }, [isDangerZone, gameState, hapticWarning, playWarning]);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameAreaRect, setGameAreaRect] = useState<DOMRect | null>(null);
  // Measured width of the actual game area (for physics calculations)
  const [measuredGameWidth, setMeasuredGameWidth] = useState<number>(0);
  const measuredGameWidthRef = useRef<number>(0);

  // Track game area position and size for physics and portalled effects
  // Only update on resize/scroll, NOT during gameplay (prevents glitchy repositioning)
  useEffect(() => {
    const updateRect = () => {
      if (gameAreaRef.current) {
        setGameAreaRect(gameAreaRef.current.getBoundingClientRect());
        // Measure actual width for physics - this handles arcade frame container
        const actualWidth = gameAreaRef.current.clientWidth;
        if (actualWidth > 0) {
          setMeasuredGameWidth(actualWidth);
          measuredGameWidthRef.current = actualWidth;
        }
      }
    };
    // Set initial position
    updateRect();
    // Also check after a short delay (for arcade frame to finish rendering)
    const delayedCheck = setTimeout(updateRect, 100);
    // Only update on window resize, not constantly
    window.addEventListener('resize', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(delayedCheck);
    };
  }, [gameState]);

  // Fix base block position after playing state renders
  // (gameAreaRef points to different elements in idle vs playing state)
  useEffect(() => {
    if (gameState === 'playing' && gameAreaRef.current && blocks.length === 1) {
      // Small delay to ensure DOM is fully rendered
      const fixTimer = setTimeout(() => {
        if (!gameAreaRef.current) return;
        const actualWidth = gameAreaRef.current.clientWidth;
        if (actualWidth > 0) {
          measuredGameWidthRef.current = actualWidth;
          setMeasuredGameWidth(actualWidth);

          // Recalculate base block position for desktop
          if (!isMobile) {
            const marginPx = Math.floor(actualWidth * 0.15);
            const playableWidth = actualWidth - (marginPx * 2);
            const blockWidth = blocks[0].width;
            const centeredX = marginPx + Math.floor((playableWidth - blockWidth) / 2);

            // Only update if position is different (avoid infinite loop)
            if (blocks[0].x !== centeredX) {
              setBlocks(prev => {
                if (prev.length === 1) {
                  const updated = [{ ...prev[0], x: centeredX }];
                  blocksRef.current = updated;
                  return updated;
                }
                return prev;
              });
            }
          }
        }
      }, 50);
      return () => clearTimeout(fixTimer);
    }
  }, [gameState, blocks.length, isMobile]);

  const blockSpawnTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const blockIdRef = useRef(0);
  const dropCountRef = useRef(0); // Stable counter for effect keys (prevents animation glitches)
  const currentBlockRef = useRef<Block | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const movingBlockRef = useRef<HTMLDivElement>(null); // Direct DOM ref for GPU-accelerated animation
  const lastTapTimeRef = useRef<number>(0); // Debounce to prevent double-tap on mobile
  const isDropping = useRef(false); // Prevent multiple drops while one is processing

  // Performance: Game loop state in refs (avoid re-renders during animation)
  const directionRef = useRef(1);
  const speedRef = useRef(1.5);
  const bounceCountRef = useRef(0);
  const isSlowMoRef = useRef(false);

  // Fixed timestep game loop refs
  const lastFrameTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const FIXED_DT = 1000 / 60; // 60 FPS physics
  const MAX_FRAME_TIME = 250; // Prevent spiral of death

  // Freeze frame support (for perfect drops)
  const freezeUntilRef = useRef(0);

  // Page visibility tracking
  const [isPaused, setIsPaused] = useState(false);

  // Keep blocksRef in sync with blocks state
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Sync refs with state (for values that need both React state and animation access)
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isSlowMoRef.current = isSlowMo;
  }, [isSlowMo]);

  // Auto-start game on mount (unified intro from GameModal)
  useEffect(() => {
    if (gameState === 'idle') {
      startGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Page Visibility API - pause game when tab is backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // Pause the game
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        if (localAudioRef.current) {
          localAudioRef.current.pause();
        }
        if (gameState === 'playing') {
          setIsPaused(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [gameState]);

  // Resume handler
  const resumeGame = useCallback(() => {
    setIsPaused(false);
    lastFrameTimeRef.current = performance.now();
    accumulatorRef.current = 0;
    if (isMusicPlaying && localAudioRef.current) {
      localAudioRef.current.play().catch(() => {});
    }
  }, [isMusicPlaying]);

  const startGame = () => {
    // Light haptic on game start (no sound - music already playing from intro)
    hapticScore();

    // Start music immediately (only if not managed by GameModal)
    if (!musicManagedExternally && isMusicPlaying && !musicStartedRef.current) {
      musicStartedRef.current = true;
      playTrack(playlistIndexRef.current);
    }

    // Re-measure game area width before starting (handles arcade frame)
    if (gameAreaRef.current) {
      const actualWidth = gameAreaRef.current.clientWidth;
      if (actualWidth > 0) {
        measuredGameWidthRef.current = actualWidth;
        setMeasuredGameWidth(actualWidth);
      }
    }

    // Use measured game width (falls back to responsive if not measured)
    const effectiveGameWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;

    // Calculate playable area (between dotted lines on desktop)
    const marginPx = isMobile ? 0 : Math.floor(effectiveGameWidth * 0.15);
    const playableWidth = effectiveGameWidth - (marginPx * 2);
    const effectiveInitialWidth = isMobile ? Math.floor(effectiveGameWidth * 0.5) : Math.min(220, playableWidth * 0.4);

    // Center the base block exactly between the two dotted lines
    const centeredX = marginPx + Math.floor((playableWidth - effectiveInitialWidth) / 2);
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: centeredX,
      width: effectiveInitialWidth,
      y: 0,
    };

    const config = LEVEL_CONFIG[1];
    const newBlocks = [baseBlock];
    setBlocks(newBlocks);
    blocksRef.current = newBlocks; // Sync ref immediately for accurate collision detection
    setScore(0);
    setLevel(1);
    setLevelScore(0);
    setSpeed(config.startSpeed);
    setDirection(1);
    setBounceCount(0);
    setCombo(0);
    setLastDropBonus('');
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);

    // Reset animation refs for fixed timestep loop
    directionRef.current = 1;
    speedRef.current = config.startSpeed;
    bounceCountRef.current = 0;
    isSlowMoRef.current = false;
    freezeUntilRef.current = 0;
    lastFrameTimeRef.current = 0;
    accumulatorRef.current = 0;

    // Reset power-up state
    setActivePowerUp(null);
    setPendingPowerUp(null);
    setIsSlowMo(false);
    setHasShield(false);
    setHasMagnet(false);
    setPowerUpNotification(null);
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);

    // Reset pause state and drop lock
    setIsPaused(false);
    lastTapTimeRef.current = 0;
    isDropping.current = false;

    spawnNewBlock(baseBlock.width);
    setGameState('playing');
    // Arcade lights: Game started
    triggerEvent('play:active');
  };

  const startNextLevel = () => {
    // Play level up sound + haptic
    playLevelUp();
    hapticLevelUp();

    const newLevel = Math.min(level + 1, MAX_LEVEL);
    const config = LEVEL_CONFIG[newLevel];

    // Add level completion bonus
    const levelBonus = SCORING.levelBonus * level;
    setScore(prev => prev + levelBonus);

    // Use measured game width (falls back to responsive if not measured)
    const effectiveGameWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;

    // Calculate playable area - mobile: full width, desktop: with margins
    const marginPx = isMobile ? 0 : Math.floor(effectiveGameWidth * 0.15);
    const playableWidth = effectiveGameWidth - (marginPx * 2);
    const effectiveInitialWidth = isMobile ? Math.floor(effectiveGameWidth * 0.5) : Math.min(220, playableWidth * 0.4);

    // Reset blocks but keep a wider base for the new level
    // Center the base block in the playable area
    const centeredX = marginPx + Math.floor((playableWidth - effectiveInitialWidth) / 2);
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: centeredX,
      width: effectiveInitialWidth,
      y: 0,
    };

    const newBlocks = [baseBlock];
    setBlocks(newBlocks);
    blocksRef.current = newBlocks; // Sync ref immediately
    setLevel(newLevel);
    setLevelScore(0);
    setSpeed(config.startSpeed);
    setDirection(1);
    setBounceCount(0);
    setCombo(0);
    setLastDropBonus('');
    spawnNewBlock(baseBlock.width);
    setGameState('playing');
    // Arcade lights: Next level started
    triggerEvent('play:active');
  };

  // Auto-submit score to global leaderboard (for signed-in users)
  const submitScoreGlobal = useCallback(async (finalScore: number, finalLevel: number) => {
    // Check minimum actions: 3 blocks dropped for leaderboard
    if (!isSignedIn || scoreSubmitted || finalScore === 0 || dropCountRef.current < 3) return;

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, finalLevel, {
      blocksStacked: levelScore,
      blocksDropped: dropCountRef.current,
    });

    if (result.success) {
      console.log('[BrickByBrick] Score submitted:', result);
      // Track new personal best
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    } else {
      console.error('[BrickByBrick] Failed to submit score:', result.error);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, levelScore]);

  const spawnNewBlock = useCallback((width: number) => {
    // Start block at left boundary - mobile: edge of screen, desktop: at margin
    const effectiveGameWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;
    const marginPx = isMobile ? 0 : Math.floor(effectiveGameWidth * 0.15);

    const newBlock: Block = {
      id: blockIdRef.current++,
      x: marginPx, // Start at left boundary
      width: width,
      y: 0,
    };
    setCurrentBlock(newBlock);
    currentBlockRef.current = newBlock;
    setDirection(1);
    blockSpawnTimeRef.current = Date.now();
    setBounceCount(0); // Reset bounce count for new block
    bounceCountRef.current = 0; // Also reset ref for animation loop

    // Randomly spawn power-up on the new block (15% chance, more common at higher levels)
    const powerUpChance = SCORING.powerUpChance + (level * 0.02); // Increases slightly per level
    if (Math.random() < powerUpChance && !pendingPowerUp) {
      const powerUpTypes: PowerUpType[] = ['magnet', 'slowmo', 'width', 'shield'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPendingPowerUp(randomPowerUp);
    } else if (!pendingPowerUp) {
      setPendingPowerUp(null);
    }
  }, [level, pendingPowerUp, isMobile]);

  const dropBlock = useCallback(() => {
    // Use refs for accurate position (avoids stale closure)
    const block = currentBlockRef.current;
    const currentBlocks = blocksRef.current;
    if (!block || gameState !== 'playing' || currentBlocks.length === 0) return;

    // Increment drop counter for stable effect keys
    dropCountRef.current += 1;

    const config = LEVEL_CONFIG[level];
    const lastBlock = currentBlocks[currentBlocks.length - 1];

    // Apply magnet power-up: auto-center the block
    let effectiveBlockX = block.x;
    if (hasMagnet) {
      // Center the block over the last block
      const effectiveGameWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;
      effectiveBlockX = lastBlock.x + (lastBlock.width - block.width) / 2;
      effectiveBlockX = Math.max(0, Math.min(effectiveBlockX, effectiveGameWidth - block.width));
      setHasMagnet(false); // Use up the magnet
      setPowerUpNotification('🧲 Auto-Centered!');
      setTimeout(() => setPowerUpNotification(null), 1500);
    }

    // Calculate overlap using ref for accurate current position
    const currentLeft = effectiveBlockX;
    const currentRight = effectiveBlockX + block.width;
    const lastLeft = lastBlock.x;
    const lastRight = lastBlock.x + lastBlock.width;

    let overlapLeft = Math.max(currentLeft, lastLeft);
    let overlapRight = Math.min(currentRight, lastRight);
    let overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      // No overlap - check for shield
      if (hasShield) {
        // Shield saves the player! Place block at edge with minimum overlap
        setHasShield(false);
        setPowerUpNotification('🛡️ Shield Used!');
        setTimeout(() => setPowerUpNotification(null), 1500);
        // Give them a small overlap to continue (30% of last block width)
        overlapWidth = lastBlock.width * 0.3;
        overlapLeft = lastBlock.x;
        overlapRight = lastBlock.x + overlapWidth;
      } else {
        // No shield - game over
        playGameOver();
        hapticGameOver();
        // Arcade lights: Game over (missed block)
        if (score > highScore) {
          triggerEvent('game:highScore');
        } else {
          triggerEvent('game:over');
        }
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('brickByBrickHighScore', String(score));
        }
        return;
      }
    }

    // Create the new stacked block with trimmed width
    const newBlock: Block = {
      id: block.id,
      x: overlapLeft,
      width: overlapWidth,
      y: currentBlocks.length,
    };

    // Calculate alignment accuracy
    const trimmedAmount = block.width - overlapWidth;
    const isPerfect = trimmedAmount === 0;
    const isNearPerfect = trimmedAmount > 0 && trimmedAmount <= 3; // Reduced from 5px to 3px for harder gameplay
    const isGoodDrop = overlapWidth >= block.width * 0.9; // 90%+ accuracy

    // Calculate time bonus (faster = more points)
    const dropTime = Date.now() - blockSpawnTimeRef.current;
    const timeBonus = Math.max(0, Math.floor(SCORING.speedBonusMax * (1 - dropTime / SCORING.speedBonusTime)));

    // Calculate bounce penalty (use ref for accurate count during animation)
    const bouncePenalty = bounceCountRef.current * SCORING.bounceMultiplier;
    
    // NEW: Wall bounces also break combo (in addition to penalty)
    const hadBounces = bounceCountRef.current > 0;

    // Update combo - bounces now break combo along with bad drops
    const newCombo = (isGoodDrop && !hadBounces) ? combo + 1 : 0;
    const comboMultiplier = 1 + (newCombo * SCORING.comboMultiplier);

    // Calculate total points for this drop
    let dropPoints = SCORING.basePoints;
    let bonusText = '';

    // Freeze frame on perfect/near-perfect drops (adds impact feel) - skip on mobile for smooth performance
    if (!isMobile) {
      if (isPerfect) {
        freezeUntilRef.current = performance.now() + 60; // 60ms freeze for perfect
      } else if (isNearPerfect) {
        freezeUntilRef.current = performance.now() + 40; // 40ms freeze for near-perfect
      }
    }

    if (isPerfect) {
      dropPoints += SCORING.perfectBonus;
      bonusText = 'PERFECT! ';
      playPerfectBonus();
      hapticHighScore(); // Strong haptic for perfect
      // Arcade lights: Perfect placement
      triggerEvent('perfect:hit');
      // Trigger screen shake on perfect (desktop only)
      if (!isMobile) {
        setShowScreenShake(true);
        setTimeout(() => setShowScreenShake(false), 300);
      }
    } else if (isNearPerfect) {
      dropPoints += SCORING.nearPerfectBonus;
      bonusText = 'Great! ';
      playBlockLand();
      hapticScore(); // Light haptic for good drops
      // Arcade lights: Near-perfect placement
      triggerEvent('score:large');
    } else if (isGoodDrop) {
      playBlockLand();
      hapticScore(); // Light haptic for normal drops
      // Arcade lights: Good drop (debounced by pattern system)
      triggerEvent('score:small');
    } else {
      playBlockLand();
      hapticScore(); // Light haptic for normal drops
    }

    // ====== VISUAL EFFECTS (reduced for performance) ======
    // Only show effects on PERFECT drops to reduce overhead
    const impactX = overlapLeft + overlapWidth / 2;
    setImpactPosition({ x: impactX, y: currentBlocks.length * BLOCK_HEIGHT + 50 });

    // Desktop: minimal effects only on perfect drops
    if (!isMobile && isPerfect) {
      // Single consolidated effect timeout
      setShowShockwave(true);
      setTimeout(() => setShowShockwave(false), 400);
    }

    dropPoints += timeBonus;
    dropPoints -= bouncePenalty;
    dropPoints = Math.floor(dropPoints * comboMultiplier);
    dropPoints = Math.max(1, dropPoints); // Minimum 1 point

    if (newCombo >= 3) {
      bonusText += `${newCombo}x Combo!`;
      playCombo(newCombo);
      hapticCombo(newCombo); // Escalating haptic for combos
      // Removed lightning effect for performance
    }

    // Check for milestone combos (5x, 10x, 15x, 20x) - simplified for performance
    if (newCombo === 5 || newCombo === 10 || newCombo === 15 || newCombo === 20) {
      // Milestone text only - no confetti or epic callout
      setShowMilestone(newCombo);
      setTimeout(() => setShowMilestone(null), 1500);

      // Arcade lights: Combo milestone using native thresholds
      const comboTier = GAME_COMBO_TIERS['orange-stack'](newCombo);
      triggerEvent(`combo:${comboTier}` as any);
    }

    // ====== POWER-UP ACTIVATION ======
    if (pendingPowerUp) {
      const powerUp = POWER_UPS[pendingPowerUp];
      setPowerUpNotification(`${powerUp.emoji} ${powerUp.name}!`);
      setTimeout(() => setPowerUpNotification(null), 2000);
      // Arcade lights: Power-up collected
      triggerEvent('collect:powerup');

      switch (pendingPowerUp) {
        case 'magnet':
          setHasMagnet(true);
          break;
        case 'slowmo':
          setIsSlowMo(true);
          if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
          slowMoTimeoutRef.current = setTimeout(() => setIsSlowMo(false), 5000);
          break;
        case 'width':
          // Restore 30px width on the new block (will apply to next spawn)
          const effectiveGameWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;
          const maxWidth = isMobile ? Math.floor(effectiveGameWidth * 0.5) : Math.min(220, effectiveGameWidth * 0.35);
          newBlock.width = Math.min(newBlock.width + 30, maxWidth);
          break;
        case 'shield':
          setHasShield(true);
          break;
      }
      setPendingPowerUp(null);
    }

    // ====== COMBO PERKS ======
    // Auto slow-mo at 10x combo
    if (newCombo === COMBO_PERKS.autoSlowMo && !isSlowMo) {
      setIsSlowMo(true);
      setPowerUpNotification('⏱️ Combo Slow-Mo!');
      setTimeout(() => setPowerUpNotification(null), 2000);
      if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);
      slowMoTimeoutRef.current = setTimeout(() => setIsSlowMo(false), 3000);
    }

    const newScore = score + dropPoints;
    const newLevelScore = levelScore + 1;

    setBlocks(prev => {
      const updated = [...prev, newBlock];
      blocksRef.current = updated; // Sync ref immediately
      return updated;
    });
    setScore(newScore);
    setLevelScore(newLevelScore);
    setCombo(newCombo);
    setLastDropBonus(bonusText);
    setLastPoints(dropPoints);
    setDropId(dropCountRef.current); // Update drop ID for stable effect keys
    setSpeed(prev => prev + config.speedIncrease);

    // Check for level complete FIRST (before minBlockWidth check)
    if (newLevelScore >= config.blocksToComplete) {
      if (level < MAX_LEVEL) {
        playWinSound();
        hapticLevelUp(); // Level complete haptic
        // Arcade lights: Escalating level complete celebration
        if (level <= 3) {
          // Early levels (1-3): quick flash
          triggerEvent('level:up');
        } else if (level <= 7) {
          // Mid levels (4-7): bigger blaze
          triggerEvent('progress:complete');
        } else {
          // Late levels (8-9): full fireworks (level 10 is game:win)
          triggerEvent('game:win');
        }
        setGameState('levelComplete');
      } else {
        // Won the game at level 10!
        playWinSound();
        hapticHighScore(); // Epic win haptic
        // Arcade lights: Game won (final level)
        triggerEvent('game:win');
        setGameState('gameover');
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('brickByBrickHighScore', String(newScore));
        }
      }
      return;
    }

    // Check if block is too small (only if level not complete)
    if (overlapWidth < config.minBlockWidth) {
      playGameOver();
      hapticGameOver();
      // Arcade lights: Game over (block too small)
      if (newScore > highScore) {
        triggerEvent('game:highScore');
      } else {
        triggerEvent('game:over');
      }
      setGameState('gameover');
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('brickByBrickHighScore', String(newScore));
      }
      return;
    }

    // Spawn next block
    spawnNewBlock(overlapWidth);
  }, [gameState, score, levelScore, level, highScore, spawnNewBlock, bounceCount, combo, playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, hasMagnet, hasShield, isSlowMo, pendingPowerUp, triggerEvent]);

  // Clear bonus text after a short time
  useEffect(() => {
    if (lastDropBonus) {
      const timer = setTimeout(() => setLastDropBonus(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastDropBonus]);

  // Auto-submit score for signed-in users when game ends
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && score > 0 && !scoreSubmitted) {
      submitScoreGlobal(score, level);
    }
  }, [gameState, isSignedIn, score, level, scoreSubmitted, submitScoreGlobal]);

  // Game play area margins - narrower movement range for faster gameplay (desktop only)
  // Margin as percentage of game width (15% on each side = 70% playable area)
  const GAME_MARGIN_PERCENT = 0.15;

  // Animation loop - Fixed timestep for consistent physics across devices
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock || showExitDialog || isPaused) return;

    // Use measured game width for consistent block bouncing (handles arcade frame)
    // Fall back to responsive width if not measured yet
    const areaWidth = measuredGameWidthRef.current > 0 ? measuredGameWidthRef.current : GAME_WIDTH_RESPONSIVE;

    // Calculate bounce boundaries
    // Mobile: full width (no margins) | Desktop: with margins for narrower playable area
    const marginPx = isMobile ? 0 : Math.floor(areaWidth * GAME_MARGIN_PERCENT);
    const bounceLeft = marginPx;
    const bounceRight = areaWidth - marginPx;

    // Initialize timing on first frame
    lastFrameTimeRef.current = performance.now();
    accumulatorRef.current = 0;

    const updatePhysics = () => {
      const block = currentBlockRef.current;
      if (!block) return;

      // Apply slow-mo effect (50% speed)
      const effectiveSpeed = isSlowMoRef.current ? speedRef.current * 0.5 : speedRef.current;
      let newX = block.x + effectiveSpeed * directionRef.current;

      // Bounce off boundaries
      if (newX + block.width > bounceRight) {
        newX = bounceRight - block.width;
        directionRef.current = -1;
        bounceCountRef.current += 1;
        // Arcade lights: Wall bounce left (block hit right wall)
        triggerEventRef.current('progress:backward');
      } else if (newX < bounceLeft) {
        newX = bounceLeft;
        directionRef.current = 1;
        bounceCountRef.current += 1;
        // Arcade lights: Wall bounce right (block hit left wall)
        triggerEventRef.current('progress:forward');
      }

      // Update ref directly (no setState = no re-render)
      currentBlockRef.current = { ...block, x: newX };
    };

    const animate = (currentTime: number) => {
      // Pause animation when exit dialog is shown or game is paused
      if (showExitDialogRef.current || isPaused) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Freeze frame support (for perfect drops)
      if (currentTime < freezeUntilRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calculate frame time with cap to prevent spiral of death
      let frameTime = currentTime - lastFrameTimeRef.current;
      if (frameTime > MAX_FRAME_TIME) frameTime = MAX_FRAME_TIME;
      lastFrameTimeRef.current = currentTime;

      // Accumulate time for fixed timestep
      accumulatorRef.current += frameTime;

      // Run physics at fixed timestep (60 FPS)
      while (accumulatorRef.current >= FIXED_DT) {
        updatePhysics();
        accumulatorRef.current -= FIXED_DT;
      }

      // Update DOM directly via ref for GPU-accelerated transform (no React re-render)
      // Only update transform - width is set by React when block spawns
      if (currentBlockRef.current && movingBlockRef.current) {
        movingBlockRef.current.style.transform = `translateX(${currentBlockRef.current.x}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBlock?.id, showExitDialog, isPaused, GAME_WIDTH_RESPONSIVE, isMobile]);

  // Handle tap/click with debounce to prevent double-firing on mobile
  const handleTap = () => {
    if (gameState !== 'playing') return;
    if (isPaused) return;

    // Prevent multiple drops while one is processing
    if (isDropping.current) return;

    // Debounce: ignore taps within 300ms of last tap
    const now = Date.now();
    if (now - lastTapTimeRef.current < 300) return;
    lastTapTimeRef.current = now;

    // Lock drops while processing
    isDropping.current = true;
    dropBlock();

    // Unlock after a short delay (allows new block to spawn)
    setTimeout(() => {
      isDropping.current = false;
    }, 200);
  };

  // Camera system for tall stacks - responsive for mobile
  const GROUND_HEIGHT = isMobile ? 40 : 50;
  const CONTAINER_HEIGHT = CONTAINER_HEIGHT_RESPONSIVE;
  // MAX_STACK_TOP: How high the stack can grow before camera scrolls
  // Higher value = tower grows taller on screen before scrolling
  // Mobile: Allow tower to reach 75% of screen height before camera kicks in
  const MAX_STACK_TOP = isMobile ? Math.floor(CONTAINER_HEIGHT * 0.75) : 300;
  const MOVING_BLOCK_MARGIN = 5; // Minimal gap above stack for moving block (reduced from 15)

  // Calculate camera offset - when stack exceeds visible area, shift view up
  const totalStackHeight = blocks.length * BLOCK_HEIGHT;
  const topOfStack = GROUND_HEIGHT + totalStackHeight;
  const cameraOffset = Math.max(0, topOfStack - MAX_STACK_TOP);

  // Calculate "altitude" for visual effects - how high has the camera scrolled?
  const altitude = Math.floor(cameraOffset / BLOCK_HEIGHT);
  const isAtHeight = cameraOffset > 50; // Show height effects when camera starts scrolling

  // ============================================================================
  // EFFECT POSITIONING - Dynamic zones that move as tower grows
  // ============================================================================
  // COMBOS: Start at 35% on mobile, move higher (lower %) as tower grows
  // This ensures combo never covers the dropping block
  const baseComboY = isMobile ? 35 : 8;
  const towerHeight = blocks.length;
  // Move combo up by 1.5% per block stacked (max 20% reduction to stay visible)
  const comboReduction = Math.min(towerHeight * 1.5, 20);
  const comboEffectY = Math.max(baseComboY - comboReduction, isMobile ? 15 : 5);

  // Show last 12 blocks for rendering (anything below camera offset will be off-screen)
  const visibleBlocks = blocks.slice(-12);

  // Parallax with acceleration - reaches sky faster as tower grows
  // Higher base rate + exponential acceleration creates smooth "climbing into sky" effect
  const PARALLAX_BASE_RATE = 25; // Base pixels per block (was 15)
  const PARALLAX_ACCELERATION = 0.8; // Extra pixels per block^1.3 (accelerates climb)
  const PARALLAX_CAMERA_RATE = 0.4; // Additional shift based on camera movement
  const MAX_BACKGROUND_OFFSET = 450; // Increased travel to reach sky (was 350)
  const blocksStacked = blocks.length;

  // Accelerating formula: starts at base rate, speeds up with height
  const blockContribution = (blocksStacked * PARALLAX_BASE_RATE) + 
    (Math.pow(blocksStacked, 1.3) * PARALLAX_ACCELERATION);
  const backgroundOffset = Math.min(
    blockContribution + (cameraOffset * PARALLAX_CAMERA_RATE),
    MAX_BACKGROUND_OFFSET
  );

  return (
    <div className="stack-container">
      <GameSEO
        gameName="Brick-by-Brick"
        gameSlug="brick-by-brick"
        description="Stack falling blocks as high as you can! Test your timing and precision in this addictive tower-building arcade game."
        genre="Puzzle"
        difficulty="Hard"
      />
      {/* Mute button moved to arcade frame - see ArcadeFrame.tsx */}
      <div className="stack-content">
        {/* Background - parallax effect as tower grows (positive = scenery moves down as we climb) */}
        <div
          className="parallax-background"
          style={{ transform: `translateY(${backgroundOffset}px)` }}
        />

        {/* PLAYING STATE: Full-screen click capture + Game Layout */}
        {gameState === 'playing' && (
          <>
            {/* Game Layout - visual content in modal */}
            <div
              className="game-layout"
              style={{
                position: 'absolute',
                top: 0, // Container already has padding-top on mobile
                left: 0,
                right: 0,
                bottom: isMobile ? 0 : 0, // Nav hidden during gameplay, modal handles safe areas via 100dvh
                width: '100%',
                height: isMobile ? 'auto' : '100%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start', // Align to left edge (not center) for arcade frame
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
            {/* Container for stats + lightbox - fills entire arcade screen width */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                flexShrink: 0,
                flexGrow: 1,
                width: '100%', // Fill entire arcade screen width
                height: '100%', // Fill entire height for proper block positioning
              }}
            >
              {/* Stats Panel - LEFT side (hidden on mobile) */}
              {!isMobile && (
                <div
                  className="stats-panel"
                  style={{
                    width: STATS_WIDTH,
                    height: CONTAINER_HEIGHT_RESPONSIVE,
                    flexShrink: 0,
                    flexGrow: 0,
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="stat-item level-stat">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">{level}</span>
                  </div>
                  <div className="stat-item progress-stat">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{levelScore}/{LEVEL_CONFIG[level].blocksToComplete}</span>
                  </div>
                  <div className="stat-item score-stat">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{score}</span>
                  </div>
                </div>
              )}

              {/* Lightbox = Game Area - fills remaining width after stats panel */}
              <div
                ref={gameAreaRef}
                className={`lightbox-wrapper ${isMobile ? 'mobile-fullscreen' : ''}`}
                style={{
                  position: 'relative',
                  width: isMobile ? '100%' : 'auto',
                  height: isMobile ? '100%' : '100%',
                  flexShrink: 0,
                  flexGrow: 1, // Fill remaining space after stats panel
                  boxSizing: 'border-box',
                  pointerEvents: 'auto', // Enable clicks on game area (CSS overrides when inactive)
                  cursor: 'pointer',
                  touchAction: 'none',
                }}
                onTouchStart={(e) => {
                  // Ignore touches in the mute button zone (top-right corner)
                  // Button is at top: ~60px (1rem + 36px + 8px), right: 1rem, size: 36x36
                  const touch = e.touches[0];
                  const viewportWidth = window.innerWidth;
                  if (touch && touch.clientX > viewportWidth - 60 && touch.clientY < 110) {
                    return; // Let the button handle it
                  }
                  e.preventDefault();
                  if (isPaused) {
                    resumeGame();
                  } else {
                    handleTap();
                  }
                }}
                onClick={(e) => {
                  // Ignore clicks in the mute button zone (top-right corner)
                  const viewportWidth = window.innerWidth;
                  if (e.clientX > viewportWidth - 60 && e.clientY < 110) {
                    return; // Let the button handle it
                  }
                  e.preventDefault();
                  // Only handle click on desktop
                  if (!('ontouchstart' in window)) {
                    if (isPaused) {
                      resumeGame();
                    } else {
                      handleTap();
                    }
                  }
                }}
              >
              {/* Mobile HUD - minimal stats overlay at top */}
              {isMobile && (
                <div className="mobile-hud">
                  <div className="hud-item">
                    <span className="hud-label">LVL</span>
                    <span className="hud-value">{level}</span>
                  </div>
                  <div className="hud-item">
                    <span className="hud-label">{levelScore}/{LEVEL_CONFIG[level].blocksToComplete}</span>
                  </div>
                  <div className="hud-item">
                    <span className="hud-label">SCORE</span>
                    <span className="hud-value">{score}</span>
                  </div>
                </div>
              )}

              {/* Boundary lines - dotted vertical lines showing bounce limits (desktop only) */}
              {!isMobile && gameState === 'playing' && measuredGameWidth > 0 && (
                <>
                  {/* Left boundary line */}
                  <div
                    className="boundary-line left"
                    style={{
                      position: 'absolute',
                      left: `${GAME_MARGIN_PERCENT * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      borderLeft: '2px dashed rgba(255, 255, 255, 0.3)',
                      pointerEvents: 'none',
                      zIndex: 5,
                    }}
                  />
                  {/* Right boundary line */}
                  <div
                    className="boundary-line right"
                    style={{
                      position: 'absolute',
                      right: `${GAME_MARGIN_PERCENT * 100}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      borderRight: '2px dashed rgba(255, 255, 255, 0.3)',
                      pointerEvents: 'none',
                      zIndex: 5,
                    }}
                  />
                </>
              )}

              {/* Moving block - positioned just above the current stack */}
              {/* Uses transform for GPU-accelerated horizontal animation (no layout thrash) */}
              {currentBlock && (
                <div
                  ref={movingBlockRef}
                  className={`stack-block moving ${isSlowMo ? 'slow-mo-active' : ''}`}
                  style={{
                    transform: `translateX(${currentBlock.x}px)`,
                    width: currentBlock.width,
                    // Position above the stack, accounting for camera offset
                    // The moving block should be one BLOCK_HEIGHT above the top stacked block
                    bottom: Math.min(
                      GROUND_HEIGHT + blocks.length * BLOCK_HEIGHT + MOVING_BLOCK_MARGIN - cameraOffset,
                      CONTAINER_HEIGHT - BLOCK_HEIGHT - 20 // Never go above container
                    ),
                  }}
                >
                  <span className="block-emoji">
                    {pendingPowerUp ? POWER_UPS[pendingPowerUp].emoji : '🍊'}
                  </span>
                </div>
              )}

              {/* Power-up notification - always at bottom above ground */}
              {powerUpNotification && (
                <div className="power-up-notification">
                  {powerUpNotification}
                </div>
              )}

              {/* Active power-ups indicator - always at bottom above ground */}
              {/* Active power-ups - horizontal bar at bottom, with duration rings */}
              {(isSlowMo || hasShield || hasMagnet) && (
                <div className="active-powerups">
                  {isSlowMo && (
                    <span className="powerup-badge slowmo">
                      ⏱️
                      {/* Duration ring - SVG countdown */}
                      <svg className="duration-ring" viewBox="0 0 52 52">
                        <circle className="ring-bg" cx="26" cy="26" r="24" />
                        <circle className="ring-progress" cx="26" cy="26" r="24" />
                      </svg>
                    </span>
                  )}
                  {hasShield && <span className="powerup-badge shield">🛡️</span>}
                  {hasMagnet && <span className="powerup-badge magnet">🧲</span>}
                </div>
              )}

              {/* Stacked blocks - adjusted for camera offset */}
              {visibleBlocks.map((block, index) => {
                // Calculate actual block index in the full stack
                const actualIndex = blocks.length - visibleBlocks.length + index;
                // Position from bottom, accounting for camera scroll
                const blockBottom = GROUND_HEIGHT + actualIndex * BLOCK_HEIGHT - cameraOffset;
                // Render all blocks - overflow:hidden on container will clip off-screen ones
                return (
                  <div
                    key={block.id}
                    className="stack-block stacked"
                    style={{
                      left: block.x,
                      width: block.width,
                      bottom: blockBottom,
                    }}
                  />
                );
              })}

              {/* Ground - scrolls off-screen as stack grows */}
              <div
                className="stack-ground"
                style={{
                  bottom: cameraOffset > 0 ? -cameraOffset : 0,
                }}
              />

              {/* HEIGHT EFFECTS - Show when camera starts scrolling */}
              {isAtHeight && (
                <>
                  {/* Altitude indicator */}
                  <div className="altitude-indicator">
                    <div className="altitude-value">
                      <span className="altitude-icon">🚀</span>
                      <span className="altitude-number">{Math.floor(cameraOffset / 10)}m</span>
                    </div>
                    <div className="altitude-label">ALTITUDE</div>
                  </div>

                  {/* Floating clouds passing by - more clouds at higher altitudes */}
                  <div className="height-clouds">
                    {Array.from({ length: Math.min(2 + Math.floor(altitude * 0.7), 12) }).map((_, i) => (
                      <div
                        key={i}
                        className="floating-cloud"
                        style={{
                          '--cloud-delay': `${(i * 0.6) + (i % 3) * 0.3}s`,
                          '--cloud-y': `${10 + ((i * 17) % 70)}%`,
                          '--cloud-size': `${30 + (i % 4) * 8}px`,
                          '--cloud-speed': `${3 + (i % 3)}s`,
                          opacity: Math.min(0.4 + altitude * 0.04, 0.8),
                        } as React.CSSProperties}
                      >
                        ☁️
                      </div>
                    ))}
                  </div>

                  {/* Sky gradient overlay - gets more "sky-like" as you go higher */}
                  <div
                    className="sky-gradient"
                    style={{
                      opacity: Math.min(altitude * 0.08, 0.4),
                    }}
                  />

                  {/* Wind/speed lines showing upward movement */}
                  <div className="height-wind-lines">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="wind-line"
                        style={{
                          '--wind-x': `${10 + i * 10}%`,
                          '--wind-delay': `${i * 0.15}s`,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Background Glow Effect - intensifies with combo */}
              {combo >= 3 && (
                <div
                  className="combo-bg-glow"
                  style={{
                    opacity: Math.min(0.15 + combo * 0.03, 0.4),
                    background: combo >= 8 ? 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)' :
                               combo >= 5 ? 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)' :
                                           'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)'
                  }}
                />
              )}

              {/* Screen Shake Container - for contained effects only */}
              <div className={`effect-container ${showScreenShake ? 'screen-shake' : ''}`}>
                {/* Effects that stay inside lightbox (shockwave, sparks, vignette) rendered below */}
              </div>

              {/* ====== PORTALLED EFFECTS - Rendered outside lightbox to avoid clipping ====== */}
              {gameAreaRect && createPortal(
                <div
                  className="os-effects-portal"
                  style={{
                    position: 'fixed',
                    left: gameAreaRect.left,
                    top: gameAreaRect.top,
                    width: gameAreaRect.width,
                    height: gameAreaRect.height,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    overflow: 'visible', // Key: allows effects to extend outside
                  }}
                >
                  {/* Epic Combo Celebration - always centered on top of blocks */}
                  {combo >= 2 && (
                    <div
                      className={`combo-celebration combo-level-${Math.min(combo, 10)}`}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: `${comboEffectY}%`,
                      }}
                    >
                      <div className="combo-number">{combo}x</div>
                      <div className="combo-label">COMBO</div>
                      {combo >= 5 && <div className="combo-fire">🔥</div>}
                      {combo >= 8 && <div className="combo-stars">✨</div>}
                    </div>
                  )}

                  {/* Perfect/Great Flash - simplified for performance */}
                  {lastDropBonus && (
                    <div
                      key={`bonus-${dropId}`}
                      className={`bonus-flash ${lastDropBonus.includes('PERFECT') ? 'perfect' : 'great'}`}
                      style={{
                        position: 'absolute',
                        ...(isMobile ? {
                          left: '50%',
                          transform: 'translateX(-50%)',
                        } : {
                          right: '8%',
                        }),
                        top: `${comboEffectY}%`,
                      }}
                    >
                      {lastDropBonus.includes('PERFECT') ? '⚡ PERFECT' : lastDropBonus.includes('Great') ? '✓ GREAT' : lastDropBonus}
                    </div>
                  )}

                  {/* Flying Score Popup - follows combo position */}
                  {lastPoints > 0 && lastDropBonus && (
                    <div
                      className="score-popup"
                      key={`score-${dropId}`}
                      style={{
                        position: 'absolute',
                        ...(isMobile ? {
                          left: '50%',
                          transform: 'translateX(-50%)',
                        } : {
                          right: '8%',
                        }),
                        top: `${comboEffectY}%`,
                      }}
                    >
                      +{lastPoints}
                    </div>
                  )}

                  {/* Milestone Celebration (5x, 10x, 15x, 20x) - simplified for performance */}
                  {showMilestone && (
                    <div
                      className={`milestone-celebration milestone-${showMilestone}`}
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: `${comboEffectY + 12}%`,
                      }}
                    >
                      <div className="milestone-text">
                        {showMilestone === 5 && '🔥 ON FIRE! 🔥'}
                        {showMilestone === 10 && '👑 LEGENDARY! 👑'}
                        {showMilestone === 15 && '⚡ GODLIKE! ⚡'}
                        {showMilestone === 20 && '🌟 IMPOSSIBLE! 🌟'}
                      </div>
                    </div>
                  )}
                </div>,
                document.body
              )}

              {/* Combo Streak Meter - Side indicator */}
              {combo >= 1 && (
                <div className="combo-meter">
                  <div className="combo-meter-fill" style={{ height: `${Math.min(combo * 10, 100)}%` }} />
                  <div className="combo-meter-glow" />
                  {combo >= 5 && <div className="combo-meter-flame">🔥</div>}
                </div>
              )}

              {/* Shockwave effect on perfect drops only */}
              {showShockwave && (
                <div
                  className="impact-shockwave"
                  style={{
                    left: impactPosition.x,
                    bottom: impactPosition.y,
                  }}
                />
              )}

              {/* Danger zone feedback - block width critically small */}
              {isDangerZone && (
                <>
                  {/* Pulsing red vignette */}
                  <div
                    className="danger-vignette"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(ellipse at center, transparent 50%, rgba(255,0,0,0.25) 100%)',
                      animation: 'danger-pulse 0.5s ease-in-out infinite alternate',
                      pointerEvents: 'none',
                      zIndex: 50,
                    }}
                  />
                  {/* Warning indicator */}
                  <div
                    className="danger-indicator"
                    style={{
                      position: 'absolute',
                      top: '15%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 0, 0, 0.9)',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      animation: 'danger-pulse 0.5s ease-in-out infinite alternate',
                      zIndex: 51,
                    }}
                  >
                    ⚠️ CAREFUL!
                  </div>
                </>
              )}

              {/* NOTE: Floating emojis and epic callout are now rendered via portal above */}

              {/* Speed lines background (intensity based on combo) */}
              {combo >= 3 && (
                <div className={`speed-lines intensity-${Math.min(Math.floor(combo / 3), 5)}`}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="speed-line" style={{ '--line-offset': `${i * 5}%` } as React.CSSProperties} />
                  ))}
                </div>
              )}

              {/* Color shift overlay at high combos */}
              {combo >= 5 && (
                <div
                  className="color-shift-overlay"
                  style={{
                    '--hue-rotate': `${combo * 15}deg`,
                    opacity: Math.min(combo * 0.03, 0.3),
                  } as React.CSSProperties}
                />
              )}

              {/* Tap hint */}
              <div className="tap-hint">Tap to drop!</div>

              {/* Pause overlay - shown when tab was backgrounded */}
              {isPaused && (
                <div
                  className="pause-overlay"
                  onClick={(e) => {
                    e.stopPropagation();
                    resumeGame();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    resumeGame();
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏸️</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>
                    PAUSED
                  </div>
                  <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                    Tap to resume
                  </div>
                </div>
              )}
            </div>
            </div>{/* Close centered container */}
          </div>
          </>
        )}


        {/* NON-PLAYING STATES: Menu, Level Complete, Game Over */}
        {gameState !== 'playing' && (
        <div
          ref={gameAreaRef}
          className="stack-area"
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        >
          {gameState === 'levelComplete' && (
            <div className="game-menu">
              <div className="game-title">Level {level} Complete!</div>
              <div className="final-score">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="level-preview">
                <span className="level-next">Level {level + 1}</span>
                <p className="level-hint">
                  {level === 1 && 'Blocks move faster now!'}
                  {level === 2 && 'Blocks shrink quicker!'}
                  {level === 3 && 'Watch for power-ups!'}
                  {level === 4 && 'Halfway there!'}
                  {level === 5 && 'Getting intense!'}
                  {level === 6 && 'Almost legendary!'}
                  {level === 7 && 'Two more to go!'}
                  {level === 8 && 'Final stretch!'}
                  {level === 9 && 'Last level - you got this!'}
                </p>
              </div>
              <IonButton onClick={startNextLevel} className="play-btn">
                Next Level
              </IonButton>
            </div>
          )}

          {/* Game Over Overlay - Uses shared component */}
          {gameState === 'gameover' && (
            <ArcadeGameOverScreen
              score={score}
              highScore={highScore}
              scoreLabel="total points"
              isNewPersonalBest={isNewPersonalBest}
              isSignedIn={isSignedIn}
              isSubmitting={isSubmitting}
              scoreSubmitted={scoreSubmitted}
              userDisplayName={userDisplayName ?? undefined}
              leaderboard={globalLeaderboard}
              onPlayAgain={startGame}
              accentColor="#ff6b00"
              meetsMinimumActions={dropCountRef.current >= 3}
              minimumActionsMessage="Drop at least 3 blocks to be on the leaderboard"
            />
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
    </div>
  );
};

export default BrickByBrick;
