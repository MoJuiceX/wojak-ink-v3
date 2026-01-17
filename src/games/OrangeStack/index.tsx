/**
 * Brick by Brick - Migrated to Shared Systems
 *
 * Uses shared effects system, game UI components, and engagement hooks.
 * Core game logic preserved from original implementation.
 */
// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IonContent, IonPage, IonButton } from '@ionic/react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { GameShell } from '@/systems/game-ui';
import { useEffects } from '@/systems/effects';
import {
  ORANGE_STACK_CONFIG,
  LEVEL_CONFIG,
  MAX_LEVEL,
  BLOCK_HEIGHT_DESKTOP,
  BLOCK_HEIGHT_MOBILE,
  INITIAL_WIDTH,
  GAME_WIDTH,
  POWER_UPS,
  COMBO_PERKS,
  SCORING,
  SAD_IMAGES,
  type PowerUpType,
} from './config';
import './OrangeStack.game.css';

interface Block {
  id: number;
  x: number;
  width: number;
  y: number;
}

interface LocalLeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

const OrangeStackGame: React.FC = () => {
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver } = useGameSounds();
  const isMobile = useIsMobile();
  const effects = useEffects();

  // Global leaderboard hook
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard(ORANGE_STACK_CONFIG.leaderboardId || 'orange-stack');

  // Background music controls
  const { isBackgroundMusicPlaying: globalMusicPlaying, pauseBackgroundMusic: globalPause } = useAudio();
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const lastMusicToggleRef = useRef<number>(0);

  // Initialize local audio on mount
  useEffect(() => {
    localAudioRef.current = new Audio('/assets/music/wojakmusic1.mp3');
    localAudioRef.current.loop = true;
    localAudioRef.current.volume = 0.5;

    return () => {
      if (localAudioRef.current) {
        localAudioRef.current.pause();
        localAudioRef.current = null;
      }
    };
  }, []);

  const toggleGameMusic = () => {
    if (!localAudioRef.current) return;
    const now = Date.now();
    if (now - lastMusicToggleRef.current < 200) return;
    lastMusicToggleRef.current = now;

    if (isMusicPlaying) {
      localAudioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      localAudioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  };

  // Responsive game dimensions
  const GAME_WIDTH_RESPONSIVE = isMobile ? window.innerWidth : 650;
  const CONTAINER_HEIGHT_RESPONSIVE = isMobile ? window.innerHeight - 105 : 500;
  const STATS_WIDTH = isMobile ? 0 : 140;
  const BLOCK_HEIGHT = isMobile ? BLOCK_HEIGHT_MOBILE : BLOCK_HEIGHT_DESKTOP;
  const INITIAL_WIDTH_RESPONSIVE = isMobile ? Math.floor(window.innerWidth * 0.5) : 220;

  // Game state
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'levelComplete' | 'gameover'>('idle');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelScore, setLevelScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('orangeStackHighScore') || '0', 10);
  });
  const [speed, setSpeed] = useState(1.5);
  const [direction, setDirection] = useState(1);
  const [playerName, setPlayerName] = useState('');
  const [localLeaderboard, setLocalLeaderboard] = useState<LocalLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('orangeStackLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  // Scoring state
  const [bounceCount, setBounceCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastDropBonus, setLastDropBonus] = useState('');
  const [lastPoints, setLastPoints] = useState(0);
  const [showScreenShake, setShowScreenShake] = useState(false);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [sadImage, setSadImage] = useState('');
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // Visual effects state
  const [showShockwave, setShowShockwave] = useState(false);
  const [showImpactSparks, setShowImpactSparks] = useState(false);
  const [impactPosition, setImpactPosition] = useState({ x: 0, y: 0 });
  const [showVignette, setShowVignette] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [epicCallout, setEpicCallout] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [blockSquish, setBlockSquish] = useState(false);
  const floatingEmojiIdRef = useRef(0);

  // Power-up state
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [pendingPowerUp, setPendingPowerUp] = useState<PowerUpType | null>(null);
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [powerUpNotification, setPowerUpNotification] = useState<string | null>(null);
  const slowMoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const blockSpawnTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const blockIdRef = useRef(0);
  const currentBlockRef = useRef<Block | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const lastTapTimeRef = useRef<number>(0);

  // Keep blocksRef in sync
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Auto-start game on mount
  useEffect(() => {
    if (gameState === 'idle') {
      startGame();
    }
  }, []);

  const startGame = () => {
    const centeredX = Math.floor((GAME_WIDTH_RESPONSIVE - INITIAL_WIDTH_RESPONSIVE) / 2);
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: centeredX,
      width: INITIAL_WIDTH_RESPONSIVE,
      y: 0,
    };

    const config = LEVEL_CONFIG[1];
    const newBlocks = [baseBlock];
    setBlocks(newBlocks);
    blocksRef.current = newBlocks;
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

    // Reset power-up state
    setActivePowerUp(null);
    setPendingPowerUp(null);
    setIsSlowMo(false);
    setHasShield(false);
    setHasMagnet(false);
    setPowerUpNotification(null);
    if (slowMoTimeoutRef.current) clearTimeout(slowMoTimeoutRef.current);

    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');
  };

  const startNextLevel = () => {
    const newLevel = Math.min(level + 1, MAX_LEVEL);
    const config = LEVEL_CONFIG[newLevel];

    const levelBonus = SCORING.levelBonus * level;
    setScore(prev => prev + levelBonus);

    const centeredX = Math.floor((GAME_WIDTH_RESPONSIVE - INITIAL_WIDTH_RESPONSIVE) / 2);
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: centeredX,
      width: INITIAL_WIDTH_RESPONSIVE,
      y: 0,
    };

    const newBlocks = [baseBlock];
    setBlocks(newBlocks);
    blocksRef.current = newBlocks;
    setLevel(newLevel);
    setLevelScore(0);
    setSpeed(config.startSpeed);
    setDirection(1);
    setBounceCount(0);
    setCombo(0);
    setLastDropBonus('');
    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');

    // Trigger celebration effect using shared system
    effects.trigger({
      type: 'confetti',
      intensity: 'medium',
      duration: 2000,
    });
  };

  // Save score to local leaderboard
  const saveScoreLocal = () => {
    if (!playerName.trim() || score === 0) return;

    const newEntry: LocalLeaderboardEntry = {
      name: playerName.trim(),
      score,
      level,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...localLeaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLocalLeaderboard(updatedLeaderboard);
    localStorage.setItem('orangeStackLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  // Auto-submit score for signed-in users
  const submitScoreGlobal = useCallback(async (finalScore: number, finalLevel: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, finalLevel, {
      blocksStacked: levelScore,
    });

    if (result.success) {
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    }
  }, [isSignedIn, scoreSubmitted, submitScore, levelScore]);

  const goToMenu = () => {
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      setIsMusicPlaying(false);
    }
    setPlayerName('');
    setShowLeaderboardPanel(false);
    startGame();
  };

  const displayLeaderboard = globalLeaderboard.length > 0
    ? globalLeaderboard.map(entry => ({
        name: entry.displayName,
        score: entry.score,
        level: entry.level ?? 0,
        date: entry.date,
      }))
    : localLeaderboard;

  const spawnNewBlock = useCallback((width: number, _lastX?: number) => {
    const newBlock: Block = {
      id: blockIdRef.current++,
      x: 0,
      width: width,
      y: 0,
    };
    setCurrentBlock(newBlock);
    currentBlockRef.current = newBlock;
    setDirection(1);
    blockSpawnTimeRef.current = Date.now();
    setBounceCount(0);

    const powerUpChance = SCORING.powerUpChance + (level * 0.02);
    if (Math.random() < powerUpChance && !pendingPowerUp) {
      const powerUpTypes: PowerUpType[] = ['magnet', 'slowmo', 'width', 'shield'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPendingPowerUp(randomPowerUp);
    } else if (!pendingPowerUp) {
      setPendingPowerUp(null);
    }
  }, [level, pendingPowerUp]);

  const dropBlock = useCallback(() => {
    const block = currentBlockRef.current;
    const currentBlocks = blocksRef.current;
    if (!block || gameState !== 'playing' || currentBlocks.length === 0) return;

    const config = LEVEL_CONFIG[level];
    const lastBlock = currentBlocks[currentBlocks.length - 1];

    // Apply magnet power-up
    let effectiveBlockX = block.x;
    if (hasMagnet) {
      effectiveBlockX = lastBlock.x + (lastBlock.width - block.width) / 2;
      effectiveBlockX = Math.max(0, Math.min(effectiveBlockX, GAME_WIDTH_RESPONSIVE - block.width));
      setHasMagnet(false);
      setPowerUpNotification('🧲 Auto-Centered!');
      setTimeout(() => setPowerUpNotification(null), 1500);
    }

    // Calculate overlap
    const currentLeft = effectiveBlockX;
    const currentRight = effectiveBlockX + block.width;
    const lastLeft = lastBlock.x;
    const lastRight = lastBlock.x + lastBlock.width;

    let overlapLeft = Math.max(currentLeft, lastLeft);
    let overlapRight = Math.min(currentRight, lastRight);
    let overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      if (hasShield) {
        setHasShield(false);
        setPowerUpNotification('🛡️ Shield Used!');
        setTimeout(() => setPowerUpNotification(null), 1500);
        overlapWidth = lastBlock.width * 0.3;
        overlapLeft = lastBlock.x;
        overlapRight = lastBlock.x + overlapWidth;
      } else {
        playGameOver();
        setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
        setGameState('gameover');

        // Trigger game over effect
        effects.trigger({
          type: 'screenShake',
          intensity: 'strong',
          duration: 500,
        });

        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('orangeStackHighScore', String(score));
        }
        return;
      }
    }

    // Create the new stacked block
    const newBlock: Block = {
      id: block.id,
      x: overlapLeft,
      width: overlapWidth,
      y: currentBlocks.length,
    };

    // Calculate alignment accuracy
    const trimmedAmount = block.width - overlapWidth;
    const isPerfect = trimmedAmount === 0;
    const isNearPerfect = trimmedAmount > 0 && trimmedAmount <= 5;
    const isGoodDrop = overlapWidth >= block.width * 0.9;

    // Calculate time bonus
    const dropTime = Date.now() - blockSpawnTimeRef.current;
    const timeBonus = Math.max(0, Math.floor(SCORING.speedBonusMax * (1 - dropTime / SCORING.speedBonusTime)));

    // Calculate bounce penalty
    const bouncePenalty = bounceCount * SCORING.bounceMultiplier;

    // Update combo
    const newCombo = isGoodDrop ? combo + 1 : 0;
    const comboMultiplier = 1 + (newCombo * SCORING.comboMultiplier);

    // Calculate total points
    let dropPoints = SCORING.basePoints;
    let bonusText = '';

    if (isPerfect) {
      dropPoints += SCORING.perfectBonus;
      bonusText = 'PERFECT! ';
      playPerfectBonus();
      setShowScreenShake(true);
      setTimeout(() => setShowScreenShake(false), 300);

      // Use shared effects for perfect drop
      effects.trigger({
        type: 'shockwave',
        intensity: 'strong',
        position: { x: overlapLeft + overlapWidth / 2, y: currentBlocks.length * BLOCK_HEIGHT + 50 },
      });
    } else if (isNearPerfect) {
      dropPoints += SCORING.nearPerfectBonus;
      bonusText = 'Great! ';
      playBlockLand();
    } else {
      playBlockLand();
    }

    // Impact position for effects
    const impactX = overlapLeft + overlapWidth / 2;
    setImpactPosition({ x: impactX, y: currentBlocks.length * BLOCK_HEIGHT + 50 });

    // Local visual effects
    setShowShockwave(true);
    setTimeout(() => setShowShockwave(false), 600);

    setShowImpactSparks(true);
    setTimeout(() => setShowImpactSparks(false), 500);

    setBlockSquish(true);
    setTimeout(() => setBlockSquish(false), 150);

    if (isPerfect || isNearPerfect) {
      setShowVignette(true);
      setTimeout(() => setShowVignette(false), 400);
    }

    // Floating emoji
    const emojiChance = isPerfect ? 0.8 : isNearPerfect ? 0.5 : 0.2;
    if (Math.random() < emojiChance) {
      const emojis = isPerfect
        ? ['🔥', '⚡', '💎', '🌟', '✨', '💥', '🚀', '👑']
        : ['😎', '👍', '💪', '🎯', '✓', '👏'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const emojiId = floatingEmojiIdRef.current++;
      setFloatingEmojis(prev => [...prev, { id: emojiId, emoji: randomEmoji, x: impactX }]);
      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== emojiId));
      }, 1500);
    }

    dropPoints += timeBonus;
    dropPoints -= bouncePenalty;
    dropPoints = Math.floor(dropPoints * comboMultiplier);
    dropPoints = Math.max(1, dropPoints);

    if (newCombo >= 3) {
      bonusText += `${newCombo}x Combo!`;
      playCombo(newCombo);

      // Use shared combo effects
      effects.trigger({
        type: 'comboText',
        intensity: newCombo >= 10 ? 'strong' : newCombo >= 5 ? 'medium' : 'normal',
        data: { combo: newCombo },
      });

      if (newCombo >= 7) {
        setShowLightning(true);
        setTimeout(() => setShowLightning(false), 400);

        effects.trigger({
          type: 'lightning',
          intensity: 'medium',
          duration: 400,
        });
      }
    }

    // Check for milestone combos
    if (newCombo === 5 || newCombo === 10 || newCombo === 15 || newCombo === 20) {
      setShowMilestone(newCombo);
      setTimeout(() => setShowMilestone(null), 2000);

      // Use shared confetti effect
      effects.trigger({
        type: 'confetti',
        intensity: newCombo >= 15 ? 'strong' : 'medium',
        duration: 3000,
      });

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      const callouts: Record<number, string> = {
        5: 'UNSTOPPABLE!',
        10: 'LEGENDARY!',
        15: 'GODLIKE!',
        20: 'IMPOSSIBLE!'
      };
      setEpicCallout(callouts[newCombo] || null);
      setTimeout(() => setEpicCallout(null), 1500);
    }

    // Power-up activation
    if (pendingPowerUp) {
      const powerUp = POWER_UPS[pendingPowerUp];
      setPowerUpNotification(`${powerUp.emoji} ${powerUp.name}!`);
      setTimeout(() => setPowerUpNotification(null), 2000);

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
          newBlock.width = Math.min(newBlock.width + 30, INITIAL_WIDTH_RESPONSIVE);
          break;
        case 'shield':
          setHasShield(true);
          break;
      }
      setPendingPowerUp(null);
    }

    // Combo perks
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
      blocksRef.current = updated;
      return updated;
    });
    setScore(newScore);
    setLevelScore(newLevelScore);
    setCombo(newCombo);
    setLastDropBonus(bonusText);
    setLastPoints(dropPoints);
    setSpeed(prev => prev + config.speedIncrease);

    // Check for level complete
    if (newLevelScore >= config.blocksToComplete) {
      if (level < MAX_LEVEL) {
        playWinSound();
        setGameState('levelComplete');
      } else {
        playWinSound();
        setSadImage('');
        setGameState('gameover');

        // Victory effects
        effects.trigger({
          type: 'confetti',
          intensity: 'strong',
          duration: 5000,
        });

        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('orangeStackHighScore', String(newScore));
        }
      }
      return;
    }

    // Check if block is too small
    if (overlapWidth < config.minBlockWidth) {
      playGameOver();
      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
      setGameState('gameover');
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('orangeStackHighScore', String(newScore));
      }
      return;
    }

    spawnNewBlock(overlapWidth, overlapLeft);
  }, [gameState, score, levelScore, level, highScore, spawnNewBlock, bounceCount, combo, playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, hasMagnet, hasShield, isSlowMo, pendingPowerUp, effects]);

  // Clear bonus text
  useEffect(() => {
    if (lastDropBonus) {
      const timer = setTimeout(() => setLastDropBonus(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastDropBonus]);

  // Auto-submit score for signed-in users
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && score > 0 && !scoreSubmitted) {
      submitScoreGlobal(score, level);
    }
  }, [gameState, isSignedIn, score, level, scoreSubmitted, submitScoreGlobal]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    const areaWidth = GAME_WIDTH_RESPONSIVE;

    const animate = () => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        const effectiveSpeed = isSlowMo ? speed * 0.5 : speed;
        let newX = prev.x + effectiveSpeed * direction;
        let newDirection = direction;

        if (newX + prev.width > areaWidth) {
          newX = areaWidth - prev.width;
          newDirection = -1;
          setDirection(-1);
          setBounceCount(b => b + 1);
        } else if (newX < 0) {
          newX = 0;
          newDirection = 1;
          setDirection(1);
          setBounceCount(b => b + 1);
        }

        const updated = { ...prev, x: newX };
        currentBlockRef.current = updated;
        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, currentBlock, speed, direction, isSlowMo]);

  // Handle tap/click
  const handleTap = () => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    if (now - lastTapTimeRef.current < 100) return;
    lastTapTimeRef.current = now;

    dropBlock();
  };

  // Debug: Perfect drop
  const debugPerfectDrop = useCallback(() => {
    if (gameState !== 'playing' || blocks.length === 0) return;

    const lastBlock = blocksRef.current[blocksRef.current.length - 1];
    if (!lastBlock) return;

    const perfectBlock: Block = {
      id: blockIdRef.current++,
      x: lastBlock.x,
      width: lastBlock.width,
      y: blocksRef.current.length,
    };

    currentBlockRef.current = perfectBlock;
    dropBlock();
  }, [gameState, blocks.length, dropBlock]);

  // Camera system
  const GROUND_HEIGHT = isMobile ? 40 : 50;
  const CONTAINER_HEIGHT = CONTAINER_HEIGHT_RESPONSIVE;
  const MAX_STACK_TOP = isMobile ? Math.floor(CONTAINER_HEIGHT * 0.75) : 300;
  const MOVING_BLOCK_MARGIN = 5;

  const totalStackHeight = blocks.length * BLOCK_HEIGHT;
  const topOfStack = GROUND_HEIGHT + totalStackHeight;
  const cameraOffset = Math.max(0, topOfStack - MAX_STACK_TOP);

  const altitude = Math.floor(cameraOffset / BLOCK_HEIGHT);
  const isAtHeight = cameraOffset > 50;

  const movingBlockBottomPx = Math.min(
    GROUND_HEIGHT + blocks.length * BLOCK_HEIGHT + MOVING_BLOCK_MARGIN - cameraOffset,
    CONTAINER_HEIGHT - BLOCK_HEIGHT - 20
  );
  const movingBlockTopPercent = ((CONTAINER_HEIGHT - movingBlockBottomPx - BLOCK_HEIGHT) / CONTAINER_HEIGHT) * 100;
  const movingBlockBottomPercent = ((CONTAINER_HEIGHT - movingBlockBottomPx) / CONTAINER_HEIGHT) * 100;

  const stackIsHigh = blocks.length >= 8;

  const getEffectY = () => {
    if (stackIsHigh) {
      return Math.min(movingBlockBottomPercent + 3, 65);
    } else {
      return Math.max(movingBlockTopPercent - 12, 15);
    }
  };

  const visibleBlocks = blocks.slice(-12);
  const stackOffset = Math.max(0, blocks.length - 10);

  return (
    <IonPage>
      <IonContent fullscreen className="stack-content" scrollY={false}>
        {/* PLAYING STATE */}
        {gameState === 'playing' && (
          <>
            {/* Click capture layer */}
            {createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: isMobile ? 140 : 90,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  cursor: 'pointer',
                  touchAction: 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTap();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleTap();
                }}
              />,
              document.body
            )}

            {/* Game Layout */}
            <div
              className="game-layout"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  flexShrink: 0,
                  flexGrow: 0,
                  width: isMobile ? '100%' : 'auto',
                  height: isMobile ? '100%' : 'auto',
                }}
              >
                {/* Stats Panel - Desktop */}
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

                {/* Game Area */}
                <div
                  ref={gameAreaRef}
                  className={`lightbox-wrapper ${isMobile ? 'mobile-fullscreen' : ''}`}
                  style={{
                    position: 'relative',
                    width: isMobile ? '100%' : GAME_WIDTH_RESPONSIVE,
                    height: isMobile ? '100%' : CONTAINER_HEIGHT_RESPONSIVE,
                    flexShrink: 0,
                    flexGrow: isMobile ? 1 : 0,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Mobile HUD */}
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

                  {/* Music toggle */}
                  {createPortal(
                    <button
                      className="music-toggle-btn game-control-btn"
                      style={{
                        pointerEvents: 'auto',
                        zIndex: 10001,
                        position: 'fixed',
                        top: isMobile ? 100 : 60,
                        right: 15,
                        width: 40,
                        height: 40,
                        touchAction: 'manipulation',
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        toggleGameMusic();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGameMusic();
                      }}
                    >
                      {isMusicPlaying ? '🔊' : '🔇'}
                    </button>,
                    document.body
                  )}

                  {/* Moving block */}
                  {currentBlock && (
                    <div
                      className={`stack-block moving ${isSlowMo ? 'slow-mo-active' : ''}`}
                      style={{
                        left: currentBlock.x,
                        width: currentBlock.width,
                        bottom: Math.min(
                          GROUND_HEIGHT + blocks.length * BLOCK_HEIGHT + MOVING_BLOCK_MARGIN - cameraOffset,
                          CONTAINER_HEIGHT - BLOCK_HEIGHT - 20
                        ),
                      }}
                    >
                      <span className="block-emoji">
                        {pendingPowerUp ? POWER_UPS[pendingPowerUp].emoji : '🍊'}
                      </span>
                    </div>
                  )}

                  {/* Power-up notification */}
                  {powerUpNotification && (
                    <div className="power-up-notification" style={{ top: `${getEffectY()}%` }}>
                      {powerUpNotification}
                    </div>
                  )}

                  {/* Active power-ups indicator */}
                  <div className="active-powerups" style={{ top: `${getEffectY()}%` }}>
                    {isSlowMo && <span className="powerup-badge slowmo">⏱️</span>}
                    {hasShield && <span className="powerup-badge shield">🛡️</span>}
                    {hasMagnet && <span className="powerup-badge magnet">🧲</span>}
                  </div>

                  {/* Stacked blocks */}
                  {visibleBlocks.map((block, index) => {
                    const actualIndex = blocks.length - visibleBlocks.length + index;
                    const blockBottom = GROUND_HEIGHT + actualIndex * BLOCK_HEIGHT - cameraOffset;
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

                  {/* Ground */}
                  <div
                    className="stack-ground"
                    style={{
                      bottom: cameraOffset > 0 ? -cameraOffset : 0,
                    }}
                  />

                  {/* Height effects */}
                  {isAtHeight && (
                    <>
                      <div className="altitude-indicator">
                        <div className="altitude-value">
                          <span className="altitude-icon">🚀</span>
                          <span className="altitude-number">{Math.floor(cameraOffset / 10)}m</span>
                        </div>
                        <div className="altitude-label">ALTITUDE</div>
                      </div>

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

                      <div
                        className="sky-gradient"
                        style={{
                          opacity: Math.min(altitude * 0.08, 0.4),
                        }}
                      />

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

                  {/* Combo background glow */}
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

                  {/* Screen shake container */}
                  <div className={`effect-container ${showScreenShake ? 'screen-shake' : ''}`}>
                    {combo >= 2 && (
                      <div
                        className={`combo-celebration combo-level-${Math.min(combo, 10)}`}
                        style={{ top: `${getEffectY()}%` }}
                      >
                        <div className="combo-number">{combo}x</div>
                        <div className="combo-label">COMBO</div>
                        {combo >= 5 && <div className="combo-fire">🔥</div>}
                        {combo >= 8 && <div className="combo-stars">✨</div>}
                      </div>
                    )}
                  </div>

                  {/* Bonus flash */}
                  {lastDropBonus && (
                    <div
                      className={`bonus-flash ${lastDropBonus.includes('PERFECT') ? 'perfect' : 'great'}`}
                      style={{ top: `${getEffectY()}%` }}
                    >
                      {lastDropBonus.includes('PERFECT') ? '⚡ PERFECT ⚡' : lastDropBonus.includes('Great') ? '✓ GREAT' : lastDropBonus}
                      {lastDropBonus.includes('PERFECT') && (
                        <div className="perfect-particles">
                          <span>✨</span><span>⭐</span><span>✨</span><span>💫</span><span>✨</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score popup */}
                  {lastPoints > 0 && lastDropBonus && (
                    <div className="score-popup" key={Date.now()} style={{ top: `${getEffectY()}%` }}>
                      +{lastPoints}
                    </div>
                  )}

                  {/* Milestone celebration */}
                  {showMilestone && (
                    <div className={`milestone-celebration milestone-${showMilestone}`} style={{ top: `${getEffectY()}%` }}>
                      <div className="milestone-number">{showMilestone}x</div>
                      <div className="milestone-text">
                        {showMilestone === 5 && '🔥 ON FIRE! 🔥'}
                        {showMilestone === 10 && '👑 LEGENDARY! 👑'}
                        {showMilestone === 15 && '⚡ GODLIKE! ⚡'}
                        {showMilestone === 20 && '🌟 IMPOSSIBLE! 🌟'}
                      </div>
                      <div className="milestone-particles">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <span key={i} className="particle" style={{ '--i': i } as React.CSSProperties}>
                            {showMilestone >= 20 ? '🌟' : showMilestone >= 15 ? '⚡' : showMilestone >= 10 ? '👑' : '🔥'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Combo meter */}
                  {combo >= 1 && (
                    <div className="combo-meter">
                      <div className="combo-meter-fill" style={{ height: `${Math.min(combo * 10, 100)}%` }} />
                      <div className="combo-meter-glow" />
                      {combo >= 5 && <div className="combo-meter-flame">🔥</div>}
                    </div>
                  )}

                  {/* Visual effects */}
                  {showShockwave && (
                    <div className="impact-shockwave" style={{ left: impactPosition.x, bottom: impactPosition.y }} />
                  )}

                  {showImpactSparks && (
                    <div className="impact-sparks" style={{ left: impactPosition.x, bottom: impactPosition.y }}>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className="spark" style={{ '--spark-angle': `${i * 45}deg` } as React.CSSProperties}>✦</span>
                      ))}
                    </div>
                  )}

                  {showVignette && <div className="vignette-pulse" />}

                  {floatingEmojis.map(({ id, emoji, x }) => (
                    <div key={id} className="floating-emoji" style={{ left: x }}>{emoji}</div>
                  ))}

                  {epicCallout && (
                    <div className="epic-callout" style={{ top: `${getEffectY()}%` }}>{epicCallout}</div>
                  )}

                  {showConfetti && (
                    <div className="confetti-container">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="confetti-piece"
                          style={{
                            '--confetti-x': `${Math.random() * 100}%`,
                            '--confetti-delay': `${Math.random() * 0.5}s`,
                            '--confetti-color': ['#ff6b00', '#ffd700', '#ff0080', '#00ff88', '#00bfff', '#a855f7'][Math.floor(Math.random() * 6)],
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  )}

                  {showLightning && (
                    <div className="lightning-container">
                      <div className="lightning-bolt left" />
                      <div className="lightning-bolt right" />
                    </div>
                  )}

                  {combo >= 3 && (
                    <div className={`speed-lines intensity-${Math.min(Math.floor(combo / 3), 5)}`}>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="speed-line" style={{ '--line-offset': `${i * 5}%` } as React.CSSProperties} />
                      ))}
                    </div>
                  )}

                  {combo >= 5 && (
                    <div
                      className="color-shift-overlay"
                      style={{
                        '--hue-rotate': `${combo * 15}deg`,
                        opacity: Math.min(combo * 0.03, 0.3),
                      } as React.CSSProperties}
                    />
                  )}

                  <div className="tap-hint">Tap to drop!</div>

                  {/* Debug button */}
                  {createPortal(
                    <button
                      className="debug-perfect-btn-small"
                      style={{
                        position: 'fixed',
                        top: isMobile ? 50 : 12,
                        right: 100,
                        zIndex: 99999,
                        pointerEvents: 'auto',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        debugPerfectDrop();
                      }}
                    >
                      ⚡
                    </button>,
                    document.body
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* NON-PLAYING STATES */}
        {gameState !== 'playing' && (
          <div
            ref={gameState !== 'playing' ? gameAreaRef : undefined}
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

            {gameState === 'gameover' && (
              <div className="game-over-screen">
                <div className="game-over-left">
                  {sadImage ? (
                    <img src={sadImage} alt="Game Over" className="sad-image-large" />
                  ) : (
                    <div className="game-over-emoji">🏆</div>
                  )}
                </div>

                {showLeaderboardPanel && (
                  <div className="leaderboard-fullscreen-panel">
                    <div className="leaderboard-panel-header">
                      <h3>{globalLeaderboard.length > 0 ? 'Global Leaderboard' : 'Leaderboard'}</h3>
                      <button className="leaderboard-close-btn" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                    </div>
                    <div className="leaderboard-panel-list">
                      {Array.from({ length: 10 }, (_, index) => {
                        const entry = displayLeaderboard[index];
                        const isCurrentUser = entry && score === entry.score;
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
                )}

                <div className="game-over-right">
                  <div className="game-over-title">{level === MAX_LEVEL && levelScore >= LEVEL_CONFIG[MAX_LEVEL].blocksToComplete ? 'You Win!' : 'Game Over!'}</div>
                  <div className="game-over-reason">Reached Level {level}</div>
                  <div className="game-over-score">
                    <span className="game-over-score-value">{score}</span>
                    <span className="game-over-score-label">total points</span>
                  </div>

                  {(isNewPersonalBest || score > highScore) && score > 0 && (
                    <div className="game-over-record">🌟 New Personal Best! 🌟</div>
                  )}

                  {score > 0 ? (
                    isSignedIn ? (
                      <div className="game-over-form">
                        <div className="game-over-submitted">
                          {isSubmitting ? (
                            <span>Saving score...</span>
                          ) : scoreSubmitted ? (
                            <span>Score saved as {userDisplayName || 'Anonymous'}!</span>
                          ) : null}
                        </div>
                        <div className="game-over-buttons">
                          <IonButton onClick={startGame} className="play-btn">
                            Play Again
                          </IonButton>
                          <IonButton onClick={goToMenu} className="play-btn menu-btn">
                            Menu
                          </IonButton>
                        </div>
                        <button
                          className="leaderboard-toggle-btn"
                          onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                        >
                          {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                        </button>
                      </div>
                    ) : (
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
                          <button onClick={saveScoreLocal} className="game-over-save" disabled={!playerName.trim()}>
                            Save Score
                          </button>
                          <button onClick={goToMenu} className="game-over-skip">
                            Skip
                          </button>
                        </div>
                        <button
                          className="leaderboard-toggle-btn"
                          onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                        >
                          {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="game-over-buttons-single">
                      <IonButton onClick={startGame} className="play-btn">
                        Try Again
                      </IonButton>
                      <button onClick={goToMenu} className="game-over-skip">
                        Menu
                      </button>
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
        )}
      </IonContent>
    </IonPage>
  );
};

// Wrap with GameShell to provide effects context
const OrangeStack: React.FC = () => (
  <GameShell gameId={ORANGE_STACK_CONFIG.id}>
    <OrangeStackGame />
  </GameShell>
);

export default OrangeStack;
