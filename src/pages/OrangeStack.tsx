// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  IonContent,
  IonPage,
  IonButton,
} from '@ionic/react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ShareButton } from '@/systems/sharing';
import './OrangeStack.css';

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

const BLOCK_HEIGHT_DESKTOP = 45; // Desktop block height
const BLOCK_HEIGHT_MOBILE = 40; // Mobile block height - must match CSS!
const INITIAL_WIDTH = 220; // Wider blocks for easier start
const GAME_WIDTH = 650; // Fixed game area width (matches lightbox-wrapper)

// Sad images for game over screen (1-19)
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// Level configurations - 10 levels with gradual difficulty
const LEVEL_CONFIG: Record<number, { startSpeed: number; speedIncrease: number; blocksToComplete: number; minBlockWidth: number; theme: string }> = {
  1:  { startSpeed: 1.2, speedIncrease: 0.03, blocksToComplete: 6,  minBlockWidth: 50, theme: 'sunrise' },
  2:  { startSpeed: 1.5, speedIncrease: 0.04, blocksToComplete: 7,  minBlockWidth: 45, theme: 'morning' },
  3:  { startSpeed: 1.8, speedIncrease: 0.05, blocksToComplete: 8,  minBlockWidth: 40, theme: 'day' },
  4:  { startSpeed: 2.2, speedIncrease: 0.06, blocksToComplete: 9,  minBlockWidth: 35, theme: 'afternoon' },
  5:  { startSpeed: 2.6, speedIncrease: 0.07, blocksToComplete: 10, minBlockWidth: 30, theme: 'sunset' },
  6:  { startSpeed: 3.0, speedIncrease: 0.08, blocksToComplete: 11, minBlockWidth: 26, theme: 'dusk' },
  7:  { startSpeed: 3.4, speedIncrease: 0.09, blocksToComplete: 12, minBlockWidth: 22, theme: 'evening' },
  8:  { startSpeed: 3.8, speedIncrease: 0.10, blocksToComplete: 13, minBlockWidth: 18, theme: 'night' },
  9:  { startSpeed: 4.2, speedIncrease: 0.11, blocksToComplete: 14, minBlockWidth: 15, theme: 'storm' },
  10: { startSpeed: 4.5, speedIncrease: 0.12, blocksToComplete: 15, minBlockWidth: 12, theme: 'inferno' },
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

const OrangeStack: React.FC = () => {
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, playGameStart, playLevelUp, playWarning } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticLevelUp, hapticCollision, hapticWarning } = useGameHaptics();
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
  const { isBackgroundMusicPlaying: globalMusicPlaying, pauseBackgroundMusic: globalPause } = useAudio();

  // Local audio element for game music (more reliable on mobile)
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const lastMusicToggleRef = useRef<number>(0); // Debounce music toggle

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

    // Debounce: ignore toggles within 200ms (prevents double-fire from touch + click)
    const now = Date.now();
    if (now - lastMusicToggleRef.current < 200) return;
    lastMusicToggleRef.current = now;

    if (isMusicPlaying) {
      localAudioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      localAudioRef.current.play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {}); // Silently handle autoplay restrictions
    }
  };

  // Responsive game dimensions - full width on mobile for immersive experience
  const GAME_WIDTH_RESPONSIVE = isMobile ? window.innerWidth : 650;
  const CONTAINER_HEIGHT_RESPONSIVE = isMobile ? window.innerHeight - 105 : 500; // Full height minus header/tab bar
  const STATS_WIDTH = isMobile ? 0 : 140; // No stats panel on mobile
  // Use responsive block height - MUST match CSS values exactly!
  const BLOCK_HEIGHT = isMobile ? BLOCK_HEIGHT_MOBILE : BLOCK_HEIGHT_DESKTOP;
  const INITIAL_WIDTH_RESPONSIVE = isMobile ? Math.floor(window.innerWidth * 0.5) : 220; // 50% of screen width on mobile

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'levelComplete' | 'gameover'>('idle');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelScore, setLevelScore] = useState(0); // Blocks stacked in current level
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

  // EXTREME visual effects state
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
  const [pendingPowerUp, setPendingPowerUp] = useState<PowerUpType | null>(null); // Power-up on next block
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [hasMagnet, setHasMagnet] = useState(false);
  const [powerUpNotification, setPowerUpNotification] = useState<string | null>(null);
  const slowMoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const blockSpawnTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const blockIdRef = useRef(0);
  const currentBlockRef = useRef<Block | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const lastTapTimeRef = useRef<number>(0); // Debounce to prevent double-tap on mobile

  // Keep blocksRef in sync with blocks state
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // Auto-start game on mount (unified intro from GameModal)
  useEffect(() => {
    if (gameState === 'idle') {
      startGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = () => {
    // Play game start sound + haptic
    playGameStart();
    hapticScore(); // Light tap on game start

    // Use responsive game width for mobile
    // Center the base block exactly in the middle
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
    // Play level up sound + haptic
    playLevelUp();
    hapticLevelUp();

    const newLevel = Math.min(level + 1, MAX_LEVEL);
    const config = LEVEL_CONFIG[newLevel];

    // Add level completion bonus
    const levelBonus = SCORING.levelBonus * level;
    setScore(prev => prev + levelBonus);

    // Reset blocks but keep a wider base for the new level
    // Center the base block exactly in the middle
    const centeredX = Math.floor((GAME_WIDTH_RESPONSIVE - INITIAL_WIDTH_RESPONSIVE) / 2);
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: centeredX,
      width: INITIAL_WIDTH_RESPONSIVE,
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
    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');
  };

  // Save score to local leaderboard (for guests)
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

  // Auto-submit score to global leaderboard (for signed-in users)
  const submitScoreGlobal = useCallback(async (finalScore: number, finalLevel: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, finalLevel, {
      blocksStacked: levelScore,
    });

    if (result.success) {
      console.log('[OrangeStack] Score submitted:', result);
      // Track new personal best
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    } else {
      console.error('[OrangeStack] Failed to submit score:', result.error);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, levelScore]);

  const goToMenu = () => {
    // Stop local game music when restarting
    if (localAudioRef.current) {
      localAudioRef.current.pause();
      setIsMusicPlaying(false);
    }
    setPlayerName('');
    setShowLeaderboardPanel(false);
    // Restart the game instead of going to empty idle state
    // (The actual "close game" functionality is in the X button from GameModal)
    startGame();
  };

  // Merge global and local leaderboard for display
  // Global takes priority, fall back to local if global is empty
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
    setBounceCount(0); // Reset bounce count for new block

    // Randomly spawn power-up on the new block (15% chance, more common at higher levels)
    const powerUpChance = SCORING.powerUpChance + (level * 0.02); // Increases slightly per level
    if (Math.random() < powerUpChance && !pendingPowerUp) {
      const powerUpTypes: PowerUpType[] = ['magnet', 'slowmo', 'width', 'shield'];
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      setPendingPowerUp(randomPowerUp);
    } else if (!pendingPowerUp) {
      setPendingPowerUp(null);
    }
  }, [level, pendingPowerUp]);

  const dropBlock = useCallback(() => {
    // Use refs for accurate position (avoids stale closure)
    const block = currentBlockRef.current;
    const currentBlocks = blocksRef.current;
    if (!block || gameState !== 'playing' || currentBlocks.length === 0) return;

    const config = LEVEL_CONFIG[level];
    const lastBlock = currentBlocks[currentBlocks.length - 1];

    // Apply magnet power-up: auto-center the block
    let effectiveBlockX = block.x;
    if (hasMagnet) {
      // Center the block over the last block
      effectiveBlockX = lastBlock.x + (lastBlock.width - block.width) / 2;
      effectiveBlockX = Math.max(0, Math.min(effectiveBlockX, GAME_WIDTH_RESPONSIVE - block.width));
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
        setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('orangeStackHighScore', String(score));
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
    const isNearPerfect = trimmedAmount > 0 && trimmedAmount <= 5;
    const isGoodDrop = overlapWidth >= block.width * 0.9; // 90%+ accuracy

    // Calculate time bonus (faster = more points)
    const dropTime = Date.now() - blockSpawnTimeRef.current;
    const timeBonus = Math.max(0, Math.floor(SCORING.speedBonusMax * (1 - dropTime / SCORING.speedBonusTime)));

    // Calculate bounce penalty
    const bouncePenalty = bounceCount * SCORING.bounceMultiplier;

    // Update combo
    const newCombo = isGoodDrop ? combo + 1 : 0;
    const comboMultiplier = 1 + (newCombo * SCORING.comboMultiplier);

    // Calculate total points for this drop
    let dropPoints = SCORING.basePoints;
    let bonusText = '';

    if (isPerfect) {
      dropPoints += SCORING.perfectBonus;
      bonusText = 'PERFECT! ';
      playPerfectBonus();
      hapticHighScore(); // Strong haptic for perfect
      // Trigger screen shake on perfect
      setShowScreenShake(true);
      setTimeout(() => setShowScreenShake(false), 300);
    } else if (isNearPerfect) {
      dropPoints += SCORING.nearPerfectBonus;
      bonusText = 'Great! ';
      playBlockLand();
      hapticScore(); // Light haptic for good drops
    } else {
      playBlockLand();
      hapticScore(); // Light haptic for normal drops
    }

    // ====== EXTREME VISUAL EFFECTS ======

    // Calculate impact position for effects (center of new block)
    const impactX = overlapLeft + overlapWidth / 2;
    setImpactPosition({ x: impactX, y: currentBlocks.length * BLOCK_HEIGHT + 50 });

    // Shockwave on every drop (intensity based on accuracy)
    setShowShockwave(true);
    setTimeout(() => setShowShockwave(false), 600);

    // Impact sparks
    setShowImpactSparks(true);
    setTimeout(() => setShowImpactSparks(false), 500);

    // Block squish animation
    setBlockSquish(true);
    setTimeout(() => setBlockSquish(false), 150);

    // Vignette pulse on good drops
    if (isPerfect || isNearPerfect) {
      setShowVignette(true);
      setTimeout(() => setShowVignette(false), 400);
    }

    // Floating emoji (random chance, higher on good drops)
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
    dropPoints = Math.max(1, dropPoints); // Minimum 1 point

    if (newCombo >= 3) {
      bonusText += `${newCombo}x Combo!`;
      playCombo(newCombo);
      hapticCombo(newCombo); // Escalating haptic for combos

      // Lightning effect at high combos
      if (newCombo >= 7) {
        setShowLightning(true);
        setTimeout(() => setShowLightning(false), 400);
      }
    }

    // Check for milestone combos (5x, 10x, 15x, 20x)
    if (newCombo === 5 || newCombo === 10 || newCombo === 15 || newCombo === 20) {
      setShowMilestone(newCombo);
      setTimeout(() => setShowMilestone(null), 2000);

      // Confetti explosion on milestones
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Epic callout text
      const callouts: Record<number, string> = {
        5: 'UNSTOPPABLE!',
        10: 'LEGENDARY!',
        15: 'GODLIKE!',
        20: 'IMPOSSIBLE!'
      };
      setEpicCallout(callouts[newCombo] || null);
      setTimeout(() => setEpicCallout(null), 1500);
    }

    // ====== POWER-UP ACTIVATION ======
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
          // Restore 30px width on the new block (will apply to next spawn)
          newBlock.width = Math.min(newBlock.width + 30, INITIAL_WIDTH_RESPONSIVE);
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
    setSpeed(prev => prev + config.speedIncrease);

    // Check for level complete FIRST (before minBlockWidth check)
    if (newLevelScore >= config.blocksToComplete) {
      if (level < MAX_LEVEL) {
        playWinSound();
        hapticLevelUp(); // Level complete haptic
        setGameState('levelComplete');
      } else {
        // Won the game at level 10! - no sad image for winners
        playWinSound();
        hapticHighScore(); // Epic win haptic
        setSadImage('');
        setGameState('gameover');
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('orangeStackHighScore', String(newScore));
        }
      }
      return;
    }

    // Check if block is too small (only if level not complete)
    if (overlapWidth < config.minBlockWidth) {
      playGameOver();
      hapticGameOver();
      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
      setGameState('gameover');
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('orangeStackHighScore', String(newScore));
      }
      return;
    }

    // Spawn next block
    spawnNewBlock(overlapWidth, overlapLeft);
  }, [gameState, score, levelScore, level, highScore, spawnNewBlock, bounceCount, combo, playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver, hasMagnet, hasShield, isSlowMo, pendingPowerUp]);

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

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    // Use responsive game width for consistent block bouncing
    const areaWidth = GAME_WIDTH_RESPONSIVE;

    const animate = () => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        // Apply slow-mo effect (50% speed)
        const effectiveSpeed = isSlowMo ? speed * 0.5 : speed;
        let newX = prev.x + effectiveSpeed * direction;
        let newDirection = direction;

        // Bounce off walls - increment bounce count
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
        // Keep ref in sync for accurate collision detection
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

  // Handle tap/click with debounce to prevent double-firing on mobile
  const handleTap = () => {
    if (gameState !== 'playing') return;

    // Debounce: ignore taps within 100ms of last tap
    // This prevents both touchstart AND click from firing
    const now = Date.now();
    if (now - lastTapTimeRef.current < 100) return;
    lastTapTimeRef.current = now;

    dropBlock();
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

  // Dynamic effect positioning - effects appear near the moving block
  // Early game (small stack): effects just ABOVE the moving block
  // Late game (tall stack): effects just BELOW the moving block (in the gap above stack)

  // Calculate where the moving block is (bottom edge, in pixels from bottom)
  const movingBlockBottomPx = Math.min(
    GROUND_HEIGHT + blocks.length * BLOCK_HEIGHT + MOVING_BLOCK_MARGIN - cameraOffset,
    CONTAINER_HEIGHT - BLOCK_HEIGHT - 20
  );
  // Moving block edges as percentage from TOP of screen
  const movingBlockTopPercent = ((CONTAINER_HEIGHT - movingBlockBottomPx - BLOCK_HEIGHT) / CONTAINER_HEIGHT) * 100;
  const movingBlockBottomPercent = ((CONTAINER_HEIGHT - movingBlockBottomPx) / CONTAINER_HEIGHT) * 100;

  // Transition point: when stack reaches ~8 blocks, switch from above to below
  const stackIsHigh = blocks.length >= 8;

  const getEffectY = () => {
    if (stackIsHigh) {
      // Late game: effects just BELOW the moving block (with small gap)
      // movingBlockBottomPercent is where the bottom of moving block is (from top)
      return Math.min(movingBlockBottomPercent + 3, 65); // 3% below moving block, max 65%
    } else {
      // Early game: effects just ABOVE the moving block (with small gap)
      // movingBlockTopPercent is where the top of moving block is (from top)
      return Math.max(movingBlockTopPercent - 12, 15); // 12% above moving block, min 15%
    }
  };

  // Show last 12 blocks for rendering (anything below camera offset will be off-screen)
  const visibleBlocks = blocks.slice(-12);
  const stackOffset = Math.max(0, blocks.length - 10);

  // Parallax background offset - creates "climbing higher" effect from block 1
  // Each block contributes to the background offset for immediate visual feedback
  // Plus additional movement from camera scrolling at higher stacks
  const PARALLAX_BLOCK_RATE = 25; // Pixels of background shift per block stacked (aggressive for early game feel)
  const PARALLAX_CAMERA_RATE = 0.6; // Additional shift based on camera movement
  const MAX_BACKGROUND_OFFSET = 800; // Max pixels to shift background
  const blocksStacked = blocks.length;
  const backgroundOffset = Math.min(
    (blocksStacked * PARALLAX_BLOCK_RATE) + (cameraOffset * PARALLAX_CAMERA_RATE),
    MAX_BACKGROUND_OFFSET
  );

  return (
    <IonPage>
      <IonContent fullscreen className="stack-content" scrollY={false}>
        {/* Parallax Background - tall image that scrolls down as player climbs (creates illusion of going up) */}
        <div
          className="parallax-background"
          style={{
            transform: `translateY(${backgroundOffset}px)`,
          }}
        />

        {/* PLAYING STATE: Full-screen click capture + Game Layout */}
        {gameState === 'playing' && (
          <>
            {/* Click capture layer - starts BELOW the top button area so buttons remain clickable */}
            {createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: isMobile ? 140 : 90, // Start below buttons (close, help, mute)
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9999,
                  cursor: 'pointer',
                  touchAction: 'none', // Prevents default touch behavior (scrolling, zooming)
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

            {/* Game Layout - visual content centered in modal */}
            <div
              className="game-layout"
              style={{
                position: 'absolute',
                top: isMobile ? 56 : 0, // Account for header on mobile
                left: 0,
                right: 0,
                bottom: isMobile ? 50 : 0, // Account for tab bar on mobile
                width: '100%',
                height: isMobile ? 'auto' : '100%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                pointerEvents: 'none',
              }}
            >
            {/* Centered container for stats + lightbox (or full-screen on mobile) */}
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

              {/* Lightbox = Game Area - full screen on mobile */}
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
              {/* Music toggle button - portalled to body, positioned directly under close button */}
              {createPortal(
                <button
                  className="music-toggle-btn game-control-btn"
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 10001,
                    position: 'fixed',
                    // Close button is typically at top: 8-12px, right: 12px, size ~44px
                    // Mute button should be directly below with same gap (~8px)
                    top: isMobile ? 100 : 60, // 8px gap below close button (44px + 8px + 8px)
                    right: 15, // Centered under close button
                    width: 40,
                    height: 40,
                    touchAction: 'manipulation', // Allow taps, prevent zoom/scroll
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

              {/* Moving block - positioned just above the current stack */}
              {currentBlock && (
                <div
                  className={`stack-block moving ${isSlowMo ? 'slow-mo-active' : ''}`}
                  style={{
                    left: currentBlock.x,
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

              {/* Power-up notification - dynamically positioned */}
              {powerUpNotification && (
                <div className="power-up-notification" style={{ top: `${getEffectY()}%` }}>
                  {powerUpNotification}
                </div>
              )}

              {/* Active power-ups indicator - dynamically positioned */}
              <div className="active-powerups" style={{ top: `${getEffectY()}%` }}>
                {isSlowMo && <span className="powerup-badge slowmo">⏱️</span>}
                {hasShield && <span className="powerup-badge shield">🛡️</span>}
                {hasMagnet && <span className="powerup-badge magnet">🧲</span>}
              </div>

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

              {/* Screen Shake Container - always has effect-container class for proper positioning */}
              <div className={`effect-container ${showScreenShake ? 'screen-shake' : ''}`}>
                {/* Epic Combo Celebration - dynamically positioned based on stack height */}
                {combo >= 2 && (
                  <div
                    className={`combo-celebration combo-level-${Math.min(combo, 10)}`}
                    style={{
                      top: `${getEffectY()}%`, // Stays in safe zone above moving block
                    }}
                  >
                    <div className="combo-number">{combo}x</div>
                    <div className="combo-label">COMBO</div>
                    {combo >= 5 && <div className="combo-fire">🔥</div>}
                    {combo >= 8 && <div className="combo-stars">✨</div>}
                  </div>
                )}
              </div>

              {/* Perfect/Great Flash with Particles - dynamically positioned */}
              {lastDropBonus && (
                <div
                  className={`bonus-flash ${lastDropBonus.includes('PERFECT') ? 'perfect' : 'great'}`}
                  style={{
                    top: `${getEffectY()}%`, // Stays in safe zone above moving block
                  }}
                >
                  {lastDropBonus.includes('PERFECT') ? '⚡ PERFECT ⚡' : lastDropBonus.includes('Great') ? '✓ GREAT' : lastDropBonus}
                  {lastDropBonus.includes('PERFECT') && (
                    <div className="perfect-particles">
                      <span>✨</span><span>⭐</span><span>✨</span><span>💫</span><span>✨</span>
                    </div>
                  )}
                </div>
              )}

              {/* Flying Score Popup - dynamically positioned */}
              {lastPoints > 0 && lastDropBonus && (
                <div
                  className="score-popup"
                  key={Date.now()}
                  style={{
                    top: `${getEffectY()}%`, // Stays in safe zone above moving block
                  }}
                >
                  +{lastPoints}
                </div>
              )}

              {/* Milestone Celebration (5x, 10x, 15x, 20x) - dynamically positioned */}
              {showMilestone && (
                <div
                  className={`milestone-celebration milestone-${showMilestone}`}
                  style={{
                    top: `${getEffectY()}%`, // Stays in safe zone above moving block
                  }}
                >
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

              {/* Combo Streak Meter - Side indicator */}
              {combo >= 1 && (
                <div className="combo-meter">
                  <div className="combo-meter-fill" style={{ height: `${Math.min(combo * 10, 100)}%` }} />
                  <div className="combo-meter-glow" />
                  {combo >= 5 && <div className="combo-meter-flame">🔥</div>}
                </div>
              )}

              {/* ====== EXTREME VISUAL EFFECTS ====== */}

              {/* Shockwave ripple effect */}
              {showShockwave && (
                <div
                  className="impact-shockwave"
                  style={{
                    left: impactPosition.x,
                    bottom: impactPosition.y,
                  }}
                />
              )}

              {/* Impact sparks */}
              {showImpactSparks && (
                <div
                  className="impact-sparks"
                  style={{
                    left: impactPosition.x,
                    bottom: impactPosition.y,
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="spark" style={{ '--spark-angle': `${i * 45}deg` } as React.CSSProperties}>
                      ✦
                    </span>
                  ))}
                </div>
              )}

              {/* Vignette pulse effect */}
              {showVignette && <div className="vignette-pulse" />}

              {/* Floating emojis */}
              {floatingEmojis.map(({ id, emoji, x }) => (
                <div
                  key={id}
                  className="floating-emoji"
                  style={{ left: x }}
                >
                  {emoji}
                </div>
              ))}

              {/* Epic callout text - dynamically positioned */}
              {epicCallout && (
                <div className="epic-callout" style={{ top: `${getEffectY()}%` }}>
                  {epicCallout}
                </div>
              )}

              {/* Confetti explosion */}
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

              {/* Lightning effect */}
              {showLightning && (
                <div className="lightning-container">
                  <div className="lightning-bolt left" />
                  <div className="lightning-bolt right" />
                </div>
              )}

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
            </div>
            </div>{/* Close centered container */}
          </div>
          </>
        )}


        {/* NON-PLAYING STATES: Menu, Level Complete, Game Over */}
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
              {/* Left side - Image or Emoji */}
              <div className="game-over-left">
                {sadImage ? (
                  <img
                    src={sadImage}
                    alt="Game Over"
                    className="sad-image-large"
                  />
                ) : (
                  <div className="game-over-emoji">🏆</div>
                )}
              </div>

              {/* Full-screen Leaderboard Panel - only rendered when open */}
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

              {/* Right side - Score and form */}
              <div className="game-over-right">
                <div className="game-over-title">{level === MAX_LEVEL && levelScore >= LEVEL_CONFIG[MAX_LEVEL].blocksToComplete ? 'You Win!' : 'Game Over!'}</div>
                <div className="game-over-reason">Reached Level {level}</div>
                <div className="game-over-score">
                  <span className="game-over-score-value">{score}</span>
                  <span className="game-over-score-label">total points</span>
                </div>

                {/* New Personal Best celebration */}
                {(isNewPersonalBest || score > highScore) && score > 0 && (
                  <div className="game-over-record">🌟 New Personal Best! 🌟</div>
                )}

                {score > 0 ? (
                  isSignedIn ? (
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
                        <IonButton onClick={startGame} className="play-btn">
                          Play Again
                        </IonButton>
                        <IonButton onClick={goToMenu} className="play-btn menu-btn">
                          Menu
                        </IonButton>
                      </div>
                      {/* Leaderboard button */}
                      <button
                        className="leaderboard-toggle-btn"
                        onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                      >
                        {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                      </button>
                      {/* Share button */}
                      <ShareButton
                        scoreData={{
                          gameId: 'orange-stack',
                          gameName: 'Brick by Brick',
                          score,
                          highScore,
                          isNewHighScore: isNewPersonalBest || score > highScore,
                          rank: undefined
                        }}
                        variant="button"
                      />
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
                        <button onClick={saveScoreLocal} className="game-over-save" disabled={!playerName.trim()}>
                          Save Score
                        </button>
                        <button onClick={goToMenu} className="game-over-skip">
                          Skip
                        </button>
                      </div>
                      {/* Leaderboard button for guests too */}
                      <button
                        className="leaderboard-toggle-btn"
                        onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                      >
                        {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                      </button>
                      {/* Share button */}
                      <ShareButton
                        scoreData={{
                          gameId: 'orange-stack',
                          gameName: 'Brick by Brick',
                          score,
                          highScore,
                          isNewHighScore: isNewPersonalBest || score > highScore,
                          rank: undefined
                        }}
                        variant="button"
                      />
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
                    {/* Leaderboard button */}
                    <button
                      className="leaderboard-toggle-btn"
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                    >
                      {showLeaderboardPanel ? 'Hide Leaderboard' : 'View Leaderboard'}
                    </button>
                    {/* Share button */}
                    <ShareButton
                      scoreData={{
                        gameId: 'orange-stack',
                        gameName: 'Brick by Brick',
                        score,
                        highScore,
                        isNewHighScore: false,
                        rank: undefined
                      }}
                      variant="button"
                    />
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

export default OrangeStack;
