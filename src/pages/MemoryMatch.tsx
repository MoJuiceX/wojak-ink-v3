// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEffects, GameEffects } from '@/components/media';
import { useTimeUrgency, getUrgencyClass } from '@/hooks/useTimeUrgency';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { getAllNfts, isReady as isPreloaderReady, initGalleryPreloader } from '@/services/galleryPreloader';
import { GameSEO } from '@/components/seo/GameSEO';
import './MemoryMatch.css';

interface NFTMetadata {
  name: string;
  image: string;
  edition: number;
  attributes?: { trait_type: string; value: string }[];
}

// Round configuration - pairs and optional base filter
// Time increases by 20% each round (calculated dynamically)
// Only use pair counts that create FULL rectangular grids (no partial rows)
// Valid grids: 4x3, 4x4, 6x3, 5x4, 6x4, 6x5, 6x6, 6x7, 6x8, 6x9
const ROUND_CONFIG: { pairs: number; baseFilter?: string }[] = [
  // Progressive difficulty - full grids only
  { pairs: 6 },       // Round 1: 12 cards (4x3)
  { pairs: 8 },       // Round 2: 16 cards (4x4)
  { pairs: 9 },       // Round 3: 18 cards (6x3)
  { pairs: 10 },      // Round 4: 20 cards (5x4)
  { pairs: 12 },      // Round 5: 24 cards (6x4)
  { pairs: 15 },      // Round 6: 30 cards (6x5)
  { pairs: 18 },      // Round 7: 36 cards (6x6)
  { pairs: 21 },      // Round 8: 42 cards (6x7)
  { pairs: 24 },      // Round 9: 48 cards (6x8)
  { pairs: 27 },      // Round 10: 54 cards (6x9) - MAX size
  // Similar-looking NFT filters for extra difficulty
  { pairs: 27, baseFilter: 'Alien Baddie' },  // Round 11
  { pairs: 27, baseFilter: 'Alien Waifu' },   // Round 12
  { pairs: 27, baseFilter: 'Bepe Baddie' },   // Round 13
  { pairs: 27, baseFilter: 'Bepe Waifu' },    // Round 14
  { pairs: 27, baseFilter: 'Wojak' },         // Round 15+
];

// Base time for round 1, increases 20% each round
const BASE_TIME = 40; // Increased 15% from 35
const TIME_INCREASE_PER_ROUND = 1.20; // 20% more time each round

interface Card {
  id: number;
  nftId: number;
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// Dynamic grid calculation - adapts to screen orientation and size
interface GridConfig {
  cols: number;
  rows: number;
  cardSize: number;
}

function calculateOptimalGrid(
  cardCount: number,
  containerWidth: number,
  containerHeight: number,
  gap: number = 8,
  minCardSize: number = 60,
  maxCardSize: number = 140
): GridConfig {
  const isLandscape = containerWidth > containerHeight;

  let bestConfig: GridConfig = { cols: 4, rows: 3, cardSize: minCardSize };
  let bestCardSize = 0;

  // Try all possible grid configurations
  for (let cols = 2; cols <= 10; cols++) {
    const rows = Math.ceil(cardCount / cols);

    // Skip if grid has too many empty cells (more than 1 row worth)
    if (cols * rows - cardCount >= cols) continue;

    // Calculate card size for this configuration
    const cardWidth = Math.floor((containerWidth - (cols - 1) * gap) / cols);
    const cardHeight = Math.floor((containerHeight - (rows - 1) * gap) / rows);
    const cardSize = Math.min(cardWidth, cardHeight, maxCardSize);

    // Skip if cards would be too small
    if (cardSize < minCardSize) continue;

    // Prefer this config if:
    // 1. Cards are larger, OR
    // 2. Cards are same size but orientation preference is better
    const orientationMatch = isLandscape ? (cols >= rows) : (rows >= cols);
    const currentOrientationMatch = isLandscape
      ? (bestConfig.cols >= bestConfig.rows)
      : (bestConfig.rows >= bestConfig.cols);

    if (cardSize > bestCardSize || (cardSize === bestCardSize && orientationMatch && !currentOrientationMatch)) {
      bestConfig = { cols, rows, cardSize };
      bestCardSize = cardSize;
    }
  }

  return bestConfig;
}

// Enhancement 23: Theme-specific callouts based on NFT Base attribute
const THEME_CALLOUTS: Record<string, string[]> = {
  'Alien Baddie': ['👽 Aliens Unite!', '🛸 Cosmic Match!', '✨ Out of This World!'],
  'Alien Waifu': ['💫 Stellar Memory!', '🌟 Space Brain!', '🚀 Galactic!'],
  'Bepe Baddie': ['🐸 Bepe Power!', '💎 Rare Find!', '👑 Legendary Bepe!'],
  'Bepe Waifu': ['🐸 Kawaii Bepe!', '✨ Bepe-tastic!', '💖 UwU Match!'],
  'Wojak': ['😏 Wojak Approved!', '🧠 Big Brain!', '💪 Based Match!'],
  'default': ['🎯 Nice Match!', '🔥 Keep Going!', '⭐ Memory Master!'],
};

// Get a random themed callout based on NFT's Base attribute
const getThemedCallout = (attributes?: { trait_type: string; value: string }[]): string => {
  const baseAttr = attributes?.find(attr => attr.trait_type === 'Base');
  const baseName = baseAttr?.value || 'default';
  const phrases = THEME_CALLOUTS[baseName] || THEME_CALLOUTS.default;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

// Enhancement 26: Generate "revenge" message showing how close to milestone
const getRevengeMessage = (matchedPairs: number, totalPairs: number, roundNum: number): string => {
  const remainingPairs = totalPairs - matchedPairs;

  if (remainingPairs === 1) {
    return `So close! Just 1 pair away from completing Round ${roundNum}!`;
  } else if (remainingPairs === 2) {
    return `Almost had it! Only 2 pairs from finishing Round ${roundNum}!`;
  } else if (remainingPairs <= 4) {
    return `You were ${remainingPairs} pairs away from Round ${roundNum + 1}!`;
  } else {
    return `Round ${roundNum} put up a fight! ${matchedPairs}/${totalPairs} pairs matched.`;
  }
};

const MemoryMatch: React.FC = () => {
  const { playCardHover, playCardFlip, playMatchFound, playMismatch, playNearCompletion, playFastMatchBonus, playWinSound, playGameOver, playGameStart, playLevelUp, playWarning } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticLevelUp, hapticSuccess, hapticMismatch, hapticHover, hapticUrgencyTick, hapticWarning, hapticButton } = useGameHaptics();

  // Visual effects system
  const {
    effects,
    triggerBigMoment,
    updateCombo,
    resetCombo,
    addScorePopup,
    triggerConfetti,
    showEpicCallout,
    resetAllEffects,
  } = useGameEffects();

  // Global leaderboard hook
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('memory-match');

  // Background music controls
  const { isBackgroundMusicPlaying, playBackgroundMusic, pauseBackgroundMusic } = useAudio();

  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'roundComplete' | 'gameover'>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isChecking, setIsChecking] = useState(false);
  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);
  const [sadImage, setSadImage] = useState('');

  // Progressive rounds
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  // Streak tracking for combo effects
  const [streak, setStreak] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState<number | null>(null);

  // Visual juice states
  const [isFrozen, setIsFrozen] = useState(false);
  const [showNearWinShimmer, setShowNearWinShimmer] = useState(false);
  const [timelineCelebrating, setTimelineCelebrating] = useState(false);

  // Dev mode - pauses timer and game logic for layout testing
  const [devMode, setDevMode] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false); // Dev panel for testing levels (hidden by default)

  // Jump to a specific round for layout testing
  const jumpToRound = async (targetRound: number) => {
    setDevMode(true); // Enable dev mode to pause timer
    setRound(targetRound);
    const config = getRoundConfig(targetRound);
    const newCards = shuffleCards(config.pairs, config.baseFilter);
    await preloadImages(newCards);
    setCards(newCards);
    setFlippedCards([]);
    flippedCardsRef.current = [];
    setMoves(0);
    setMatches(0);
    setTimeLeft(config.time);
    setRoundTotalTime(config.time);
    setIsChecking(false);
    setGameState('playing');
  };

  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('memoryMatchHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('memoryMatchSoundEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Track total time for current round (for urgency system)
  const [roundTotalTime, setRoundTotalTime] = useState(40);

  // Window size for responsive grid calculation
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Time urgency system - plays escalating warning sounds
  const { urgencyLevel } = useTimeUrgency({
    timeLeft,
    totalTime: roundTotalTime,
    isPlaying: gameState === 'playing' && !devMode,
    soundEnabled,
  });

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing' && !devMode,
  });

  // Get current round config (cycle back if beyond defined rounds)
  // Time increases by 20% each round
  const getRoundConfig = (r: number): { pairs: number; time: number; baseFilter?: string } => {
    const index = Math.min(r - 1, ROUND_CONFIG.length - 1);
    const config = ROUND_CONFIG[index];
    // Calculate time: base * 1.2^(round-1)
    const time = Math.floor(BASE_TIME * Math.pow(TIME_INCREASE_PER_ROUND, r - 1));
    return { ...config, time };
  };

  // Preloaded cards for instant next game
  const preloadedCardsRef = useRef<Card[] | null>(null);
  const isPreloadingRef = useRef(false);

  // Track flipped cards with ref to avoid race conditions with rapid clicks
  const flippedCardsRef = useRef<number[]>([]);
  // Debounce rapid clicks - track last click time
  const lastClickTimeRef = useRef<number>(0);
  const CLICK_DEBOUNCE_MS = 200; // Minimum ms between flips - prevents rushing through cards
  // Ref to track current cards state (avoids stale closures in timeouts)
  const cardsRef = useRef<Card[]>([]);

  // Load metadata on mount - use preloader cache if available (instant load)
  useEffect(() => {
    const loadMetadata = async () => {
      // Check if preloader already has the data (loaded during app startup)
      if (isPreloaderReady()) {
        const cachedNfts = getAllNfts();
        if (cachedNfts.length > 0) {
          console.log('[MemoryMatch] Using cached metadata from preloader');
          setMetadata(cachedNfts);
          return;
        }
      }

      // Preloader not ready - initialize it (also caches for future)
      try {
        await initGalleryPreloader();
        const nfts = getAllNfts();
        if (nfts.length > 0) {
          console.log('[MemoryMatch] Loaded metadata via preloader init');
          setMetadata(nfts);
        } else {
          // Fallback to direct fetch if preloader failed
          console.log('[MemoryMatch] Preloader empty, fetching directly');
          const res = await fetch('/assets/nft-data/metadata.json');
          const data = await res.json();
          setMetadata(data);
        }
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    };

    loadMetadata();
  }, []);

  const shuffleCards = useCallback((pairsCount: number, baseFilter?: string, excludeNftIds: number[] = []) => {
    if (metadata.length === 0) return [];

    // Filter by base type if specified (for harder rounds with similar-looking NFTs)
    let availableMetadata = metadata.filter(nft => !excludeNftIds.includes(nft.edition));

    if (baseFilter) {
      availableMetadata = availableMetadata.filter(nft => {
        const baseAttr = nft.attributes?.find(attr => attr.trait_type === 'Base');
        return baseAttr?.value === baseFilter;
      });
    }

    // If not enough NFTs with filter, fall back to all
    if (availableMetadata.length < pairsCount) {
      availableMetadata = metadata.filter(nft => !excludeNftIds.includes(nft.edition));
    }

    // Fisher-Yates shuffle for proper randomization
    const shuffledMetadata = [...availableMetadata];
    for (let i = shuffledMetadata.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledMetadata[i], shuffledMetadata[j]] = [shuffledMetadata[j], shuffledMetadata[i]];
    }
    const selectedNFTs = shuffledMetadata.slice(0, pairsCount);

    const cardPairs: Card[] = [];

    selectedNFTs.forEach((nft, index) => {
      // Create pair
      cardPairs.push({
        id: index * 2,
        nftId: nft.edition,
        name: nft.name,
        image: nft.image,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: index * 2 + 1,
        nftId: nft.edition,
        name: nft.name,
        image: nft.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    return cardPairs;
  }, [metadata]);

  const preloadImages = (cards: Card[]): Promise<void[]> => {
    // Get unique images (each NFT appears twice)
    const uniqueImages = [...new Set(cards.map(c => c.image))];

    return Promise.all(
      uniqueImages.map(src => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve anyway to not block
          img.src = src;
        });
      })
    );
  };

  // Preload next round's cards in the background
  const preloadNextRound = useCallback(async (nextRound: number, currentNftIds: number[] = []) => {
    if (isPreloadingRef.current || metadata.length === 0) return;

    isPreloadingRef.current = true;

    const config = getRoundConfig(nextRound);
    const nextCards = shuffleCards(config.pairs, config.baseFilter, currentNftIds);

    if (nextCards.length > 0) {
      await preloadImages(nextCards);
      preloadedCardsRef.current = nextCards;
    }

    isPreloadingRef.current = false;
  }, [metadata, shuffleCards]);

  // Preload first round when metadata is ready and we're on idle screen
  useEffect(() => {
    if (metadata.length > 0 && gameState === 'idle' && !preloadedCardsRef.current) {
      preloadNextRound(1);
    }
  }, [metadata, gameState, preloadNextRound]);

  // Auto-start game when metadata is loaded (unified intro from GameModal)
  useEffect(() => {
    if (metadata.length > 0 && gameState === 'idle') {
      startGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata]);

  // Start a new game from round 1
  const startGame = async () => {
    if (metadata.length === 0) {
      setGameState('loading');
      return;
    }

    // Play game start sound + haptic
    playGameStart();
    hapticButton(); // Light tap on game start

    setDevMode(false); // Disable dev mode for normal gameplay
    setRound(1);
    setTotalScore(0);
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    await startRound(1, true);
  };

  // Start a specific round
  const startRound = async (roundNum: number, isNewGame: boolean = false) => {
    setGameState('loading');

    const config = getRoundConfig(roundNum);
    let newCards: Card[];

    // Use preloaded cards if available and it's the right round
    if (preloadedCardsRef.current && preloadedCardsRef.current.length === config.pairs * 2) {
      newCards = preloadedCardsRef.current;
      preloadedCardsRef.current = null;
    } else {
      newCards = shuffleCards(config.pairs, config.baseFilter);
      await preloadImages(newCards);
    }

    setCards(newCards);
    setFlippedCards([]);
    flippedCardsRef.current = []; // Reset ref too
    lastClickTimeRef.current = 0; // Reset debounce timer
    setMoves(0);
    setMatches(0);
    setTimeLeft(config.time);
    setRoundTotalTime(config.time); // Track total time for urgency system
    setIsChecking(false);
    // Reset streak and effects for new round
    setStreak(0);
    setLastMatchTime(null);
    resetAllEffects();
    setGameState('playing');

    // Preload next round in background
    const currentNftIds = [...new Set(newCards.map(c => c.nftId))];
    preloadNextRound(roundNum + 1, currentNftIds);
  };

  // Continue to next round after completing current one
  const nextRound = async () => {
    // Play level up sound + haptic
    playLevelUp();
    hapticLevelUp();

    const newRound = round + 1;
    setRound(newRound);
    await startRound(newRound);
  };

  const goToMenu = () => {
    setGameState('idle');
    setRound(1);
    setTotalScore(0);
  };

  // Calculate round score: points for matches + time bonus + round completion bonus
  const calculateRoundScore = () => {
    const config = getRoundConfig(round);
    const matchPoints = matches * 10;
    const timeBonus = timeLeft * 5;
    const roundBonus = round * 100; // Bonus for completing higher rounds
    return matchPoints + timeBonus + roundBonus;
  };

  // Add round score to total when round is completed
  const completeRound = () => {
    playWinSound();
    hapticHighScore(); // Strong haptic for round completion
    triggerConfetti();
    showEpicCallout('🧠 PERFECT MEMORY!');
    const roundScore = calculateRoundScore();
    setTotalScore(prev => prev + roundScore);
    setGameState('roundComplete');
  };

  // Auto-submit score to global leaderboard (for signed-in users)
  const submitScoreGlobal = useCallback(async (finalScore: number, finalRound: number) => {
    if (!isSignedIn || scoreSubmitted || finalScore === 0) return;

    // Update local high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('memoryMatchHighScore', String(finalScore));
    }

    setScoreSubmitted(true);
    const result = await submitScore(finalScore, finalRound, {
      roundsCompleted: finalRound - 1,
    });

    if (result.success) {
      console.log('[MemoryMatch] Score submitted:', result);
      if (result.isNewHighScore) {
        setIsNewPersonalBest(true);
      }
    } else {
      console.error('[MemoryMatch] Failed to submit score:', result.error);
    }
  }, [isSignedIn, scoreSubmitted, submitScore, highScore]);

  // Map global leaderboard for display
  const displayLeaderboard = globalLeaderboard.map(entry => ({
    name: entry.displayName,
    score: entry.score,
    date: entry.date,
  }));

  // Retry start when metadata loads (only for initial load, not dev mode)
  useEffect(() => {
    if (gameState === 'loading' && metadata.length > 0 && !devMode && cards.length === 0) {
      startGame();
    }
  }, [metadata, gameState, devMode, cards.length]);

  // Keep flippedCardsRef in sync with state
  useEffect(() => {
    flippedCardsRef.current = flippedCards;
  }, [flippedCards]);

  // Keep cardsRef in sync with state (prevents stale closures in timeouts)
  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  // Visual juice helper: Add temporary CSS class to card element
  const addCardAnimation = useCallback((cardId: number, className: string, duration: number) => {
    const cardEl = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardEl) {
      cardEl.classList.add(className);
      setTimeout(() => cardEl.classList.remove(className), duration);
    }
  }, []);

  // Visual juice helper: Trigger timeline celebration pulse
  const triggerTimelineCelebration = useCallback(() => {
    setTimelineCelebrating(true);
    setTimeout(() => setTimelineCelebrating(false), 400);
  }, []);

  // Visual juice helper: Trigger freeze frame (brief pause for impact)
  const triggerFreezeFrame = useCallback((duration: number = 60) => {
    setIsFrozen(true);
    setTimeout(() => setIsFrozen(false), duration);
  }, []);

  // Visual juice helper: Screen shake with variable intensity
  const triggerScreenShake = useCallback((streak: number) => {
    if (streak < 2) return;
    const container = document.querySelector('.mm-game-layout');
    if (!container) return;

    const shakeClass = streak >= 3 ? 'screen-shake-strong' : 'screen-shake-mild';
    container.classList.add(shakeClass);
    setTimeout(() => container.classList.remove(shakeClass), 200);
  }, []);

  // Helper to flip a card (used by handleCardClick and queue processing)
  const flipCard = (cardId: number) => {
    const currentFlipped = flippedCardsRef.current;

    // Safety check: prevent flipping if already in flipped array or already 2 cards flipped
    if (currentFlipped.includes(cardId) || currentFlipped.length >= 2) {
      return currentFlipped;
    }

    // Safety check: prevent flipping if card is already flipped in state
    const card = cardsRef.current.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) {
      return currentFlipped;
    }

    // Play flip sound + haptic
    playCardFlip();
    hapticButton();

    // Update ref IMMEDIATELY (synchronous)
    const newFlipped = [...currentFlipped, cardId];
    flippedCardsRef.current = newFlipped;

    // Flip the card in state
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(newFlipped);

    // Enhancement 11: Squash animation when flip lands (after flip transition)
    setTimeout(() => addCardAnimation(cardId, 'flip-landed', 120), 250);

    return newFlipped;
  };

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing') return;

    // Block clicks while checking - no queueing to prevent rushing
    if (isChecking) return;

    // Debounce rapid clicks - enforces pacing between flips
    const now = Date.now();
    if (now - lastClickTimeRef.current < CLICK_DEBOUNCE_MS) return;
    lastClickTimeRef.current = now;

    // Use ref for immediate, synchronous checks to prevent race conditions
    const currentFlipped = flippedCardsRef.current;

    // Prevent clicking same card twice or more than 2 cards
    if (currentFlipped.includes(cardId)) return;
    if (currentFlipped.length >= 2) return;

    // Check card state from cardsRef (not state) to avoid stale closure issues
    const currentCards = cardsRef.current;
    const card = currentCards.find(c => c.id === cardId);
    if (!card || card.isMatched) return;

    // Additional safety: if card shows as flipped but not in our tracking, skip it
    // Also skip if already flipped (even if in our tracking - prevents double-flip race condition)
    if (card.isFlipped) return;

    // Flip the card
    const newFlipped = flipCard(cardId);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;

      // Find cards using cardsRef to ensure we have latest state (avoids stale closure)
      const currentCardsForMatch = cardsRef.current;
      const firstCard = currentCardsForMatch.find(c => c.id === firstId);
      const secondCard = currentCardsForMatch.find(c => c.id === secondId);

      // Safety check: both cards must exist and have different IDs (not same card clicked twice)
      if (!firstCard || !secondCard || firstId === secondId) {
        // Invalid state - reset
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          flippedCardsRef.current = [];
          setFlippedCards([]);
          setIsChecking(false);
        }, 300);
        return;
      }

      if (firstCard.nftId === secondCard.nftId) {
        // Match found!
        // Capture config values BEFORE setTimeout to avoid closure issues
        const config = getRoundConfig(round);
        const totalPairs = config.pairs;
        const pairsForMilestone = Math.floor(totalPairs * 0.75);
        // Calculate new streak before setTimeout to use in sound
        const newStreak = streak + 1;

        setTimeout(() => {
          try {
            playMatchFound(newStreak); // Pass streak for escalating sounds
            hapticCombo(newStreak); // Streak-based escalating haptic
          } catch (e) {
            // Sound/haptic errors shouldn't break the game
          }

          try {
            // Enhancement 17: Freeze frame for impact
            triggerFreezeFrame(60);

            // Enhancement 12: Match pop animation with glow - faster
            addCardAnimation(firstId, 'match-pop', 280);
            addCardAnimation(secondId, 'match-pop', 280);

            // Enhancement 15: Timeline celebration pulse
            triggerTimelineCelebration();

            // Enhancement 21-22: Variable intensity screen shake
            triggerScreenShake(newStreak);

            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            );

            // Update streak and combo
            setStreak(newStreak);
            updateCombo(newStreak);

            // Calculate time bonus for fast matches
            const now = Date.now();
            const timeSinceLastMatch = lastMatchTime ? now - lastMatchTime : 999999;
            const isFastMatch = timeSinceLastMatch < 2500;
            setLastMatchTime(now);

            // Trigger visual effects
            try {
              triggerBigMoment({
                shockwave: true,
                sparks: newStreak >= 2,
                shake: newStreak >= 4,
                vignette: newStreak >= 5,
                emoji: newStreak >= 3 ? '🔥' : '✨',
                score: 10 + (newStreak * 5),
                scorePrefix: isFastMatch ? 'FAST' : undefined,
                x: 50,
                y: 50,
              });

              // Fast match bonus callout and sound
              if (isFastMatch) {
                playFastMatchBonus(); // Extra "zing" sound layer
                if (newStreak >= 2) {
                  setTimeout(() => showEpicCallout('⚡ SPEED BONUS!'), 400);
                }
              }
            } catch (e) {
              // Visual effects errors shouldn't break the game
            }

            // Update match count - CRITICAL for game completion
            setMatches(prev => {
              const newMatches = prev + 1;
              const remainingPairs = totalPairs - newMatches;

              // Enhancement 24: Contextual progress milestones
              try {
                const halfwayPoint = Math.floor(totalPairs / 2);
                if (newMatches === halfwayPoint) {
                  // Halfway milestone with progress numbers
                  setTimeout(() => showEpicCallout(`🎯 ${newMatches}/${totalPairs} - Halfway!`), 500);
                } else if (newMatches === pairsForMilestone) {
                  // 75% milestone with progress numbers
                  setTimeout(() => showEpicCallout(`🔥 ${newMatches}/${totalPairs} - Almost There!`), 500);
                }

                // Enhancement 23: Theme-specific callouts for streaks
                if (newStreak === 2) {
                  // Show themed callout on 2-streak (use firstCard's attributes)
                  const nftData = metadata.find(m => m.edition === firstCard.nftId);
                  const themedCallout = getThemedCallout(nftData?.attributes);
                  setTimeout(() => showEpicCallout(themedCallout), 400);
                } else if (newStreak >= 3) {
                  // Extra celebration for 3+ streak
                  setTimeout(() => showEpicCallout(`🔥 ${newMatches}/${totalPairs} - On Fire!`), 400);
                }

                // Near-completion anticipation sound (2 or 1 pairs remaining)
                if (remainingPairs === 2 || remainingPairs === 1) {
                  playNearCompletion(remainingPairs);
                }

                // Enhancement 16: Near-win shimmer for 1 pair remaining
                if (remainingPairs === 1) {
                  setShowNearWinShimmer(true);
                }
              } catch (e) {
                // Callout errors shouldn't break match counting
              }
              return newMatches;
            });
          } catch (e) {
            console.error('Error in match handler:', e);
          } finally {
            // ALWAYS reset state to allow more clicks
            flippedCardsRef.current = [];
            setFlippedCards([]);
            setIsChecking(false);
          }
        }, 280); // Reduced from 500ms for instant-feeling matches
      } else {
        // No match - play mismatch sound/haptic immediately, then flip back
        playMismatch();
        hapticMismatch(); // Double-pulse error pattern

        // Enhancement 14: Wobble animation before flip back (faster for snappy feel)
        addCardAnimation(firstId, 'mismatch-wobble', 200);
        addCardAnimation(secondId, 'mismatch-wobble', 200);

        // Reset streak on mismatch immediately
        setStreak(0);
        resetCombo();

        // Cards flip back after animation (600ms)
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          // Unlock input after cards flip back - prevents rushing
          flippedCardsRef.current = [];
          setFlippedCards([]);
          setIsChecking(false);
        }, 600);
      }
    }
  };

  // Check round completion - all pairs matched (skip in dev mode)
  useEffect(() => {
    if (devMode) return; // Skip in dev mode
    const config = getRoundConfig(round);
    if (matches === config.pairs && gameState === 'playing') {
      completeRound();
    }
  }, [matches, gameState, round, devMode]);

  // Timer - time out = game over (skip in dev mode, pause when exit dialog shown)
  useEffect(() => {
    if (gameState !== 'playing' || devMode || showExitDialog) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          playGameOver();
          hapticGameOver();
          setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
          setGameState('gameover');
          return 0;
        }
        // Play warning sound at 10, 5, 3, 2, 1 seconds
        if (prev === 10 || prev <= 5) {
          playWarning();
          hapticWarning();
        }
        // Subtle urgency tick haptic in final 5 seconds
        if (prev <= 5) {
          hapticUrgencyTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, devMode, showExitDialog, playGameOver, playWarning, hapticGameOver, hapticWarning]);

  // Auto-submit score for signed-in users when game ends
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && totalScore > 0 && !scoreSubmitted) {
      submitScoreGlobal(totalScore, round);
    }
  }, [gameState, isSignedIn, totalScore, round, scoreSubmitted, submitScoreGlobal]);

  // Enhancement 18-20: Anticipation states for remaining unmatched cards
  useEffect(() => {
    if (gameState !== 'playing') return;

    // Compute config inline to avoid initialization order issues
    const config = getRoundConfig(round);
    const remainingPairs = config.pairs - matches;
    const isStruggling = timeLeft <= 10 && remainingPairs > 3;

    const unmatchedCards = document.querySelectorAll('.mm-card:not(.matched)');

    // Clear all anticipation classes first
    unmatchedCards.forEach(card => {
      card.classList.remove('anticipation-1', 'anticipation-2', 'near-win-highlight', 'struggle-shimmer');
    });

    // Apply appropriate classes based on state
    if (remainingPairs === 1) {
      unmatchedCards.forEach(card => {
        card.classList.add('anticipation-1', 'near-win-highlight');
      });
    } else if (remainingPairs === 2) {
      unmatchedCards.forEach(card => {
        card.classList.add('anticipation-2');
      });
    } else if (isStruggling) {
      unmatchedCards.forEach(card => {
        card.classList.add('struggle-shimmer');
      });
    }

    return () => {
      // Cleanup on unmount
      document.querySelectorAll('.mm-card').forEach(card => {
        card.classList.remove('anticipation-1', 'anticipation-2', 'near-win-highlight', 'struggle-shimmer');
      });
    };
  }, [gameState, round, matches, timeLeft]);

  // Reset near-win shimmer on round start
  useEffect(() => {
    if (gameState === 'playing') {
      setShowNearWinShimmer(false);
    }
  }, [round, gameState]);

  // Handle window resize and orientation changes for responsive grid
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 150); // debounce
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const currentConfig = getRoundConfig(round);
  const requiredPairs = currentConfig.pairs;

  return (
    <div className={`memory-container ${gameState === 'playing' ? 'playing-mode' : ''} ${gameState === 'playing' ? getUrgencyClass(urgencyLevel) : ''}`}>
      <GameSEO
        gameName="Memory Match"
        gameSlug="memory"
        description="Test your memory with this classic card-matching game! Find all the pairs before time runs out across multiple challenging rounds."
        genre="Puzzle"
        difficulty="Easy"
      />
      {/* Dev Panel - Top Left, small buttons for testing levels */}
      {showDevPanel && (
        <div className="mm-dev-panel">
          <div className="mm-dev-header">
            <span>DEV</span>
            <button onClick={() => setShowDevPanel(false)}>×</button>
          </div>
          <div className="mm-dev-levels">
            {ROUND_CONFIG.map((_, index) => (
              <button
                key={index}
                className={`mm-dev-btn ${round === index + 1 && gameState === 'playing' ? 'active' : ''}`}
                onClick={() => jumpToRound(index + 1)}
                title={`Round ${index + 1}: ${ROUND_CONFIG[index].pairs} pairs${ROUND_CONFIG[index].baseFilter ? ` (${ROUND_CONFIG[index].baseFilter})` : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {devMode && <div className="mm-dev-mode-badge">PAUSED</div>}
        </div>
      )}

      {/* Animated background elements - only show on menu and game over */}
      {gameState !== 'playing' && gameState !== 'loading' && (
        <div className="memory-bg-elements">
          <div className="floating-brain fb-1">🧠</div>
          <div className="floating-brain fb-2">🧠</div>
          <div className="floating-brain fb-3">🧠</div>
          <div className="floating-brain fb-4">🧠</div>
          <div className="floating-brain fb-5">🧠</div>
          <div className="floating-brain fb-6">🧠</div>
          <div className="floating-brain fb-7">🧠</div>
          <div className="floating-brain fb-8">🧠</div>
          <div className="floating-brain fb-9">🧠</div>
          <div className="floating-brain fb-10">🧠</div>
          <div className="floating-brain fb-11">🧠</div>
          <div className="floating-brain fb-12">🧠</div>
        </div>
      )}

      <div className="memory-content">
        <div className="memory-area">
          {/* Main Menu removed - now handled by unified GameModal intro screen */}

          {gameState === 'loading' && (
            <div className="game-menu">
              <div className="loading-spinner" />
              <p className="game-desc">Loading NFTs...</p>
            </div>
          )}

          {/* Round Complete Screen */}
          {gameState === 'roundComplete' && (() => {
            const currentScore = totalScore + calculateRoundScore();
            // Find where current score would rank
            const sortedLeaderboard = [...(globalLeaderboard || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
            let rank = sortedLeaderboard.findIndex(entry => currentScore > (entry.score || 0));
            if (rank === -1) rank = sortedLeaderboard.length;
            const aboveEntry = rank > 0 ? sortedLeaderboard[rank - 1] : null;
            const belowEntry = sortedLeaderboard[rank] || null;

            return (
              <div className="mm-round-complete">
                <div className="mm-round-complete-content">
                  <div className="mm-round-complete-emoji">🎉</div>
                  <div className="mm-round-complete-title">Round {round} Complete!</div>
                  <div className="mm-round-complete-points">+{calculateRoundScore()} points</div>
                  <div className="mm-round-complete-score">
                    <span className="mm-score-value">{currentScore}</span>
                    <span className="mm-score-label">total score</span>
                  </div>
                  <button onClick={nextRound} className="mm-next-round-btn">
                    Next Round →
                  </button>

                  {/* Mini Leaderboard Preview */}
                  <div className="mm-mini-leaderboard">
                    <div className="mm-mini-leaderboard-title">Leaderboard Position</div>
                    {aboveEntry && (
                      <div className="mm-mini-entry above">
                        <span className="mm-mini-rank">#{rank}</span>
                        <span className="mm-mini-name">{aboveEntry.name || 'Anonymous'}</span>
                        <span className="mm-mini-score">{aboveEntry.score || 0}</span>
                      </div>
                    )}
                    <div className="mm-mini-entry current">
                      <span className="mm-mini-rank">#{rank + 1}</span>
                      <span className="mm-mini-name">You</span>
                      <span className="mm-mini-score">{currentScore}</span>
                    </div>
                    {belowEntry && (
                      <div className="mm-mini-entry below">
                        <span className="mm-mini-rank">#{rank + 2}</span>
                        <span className="mm-mini-name">{belowEntry.name || 'Anonymous'}</span>
                        <span className="mm-mini-score">{belowEntry.score || 0}</span>
                      </div>
                    )}
                    {!aboveEntry && !belowEntry && (
                      <div className="mm-mini-entry empty">
                        <span className="mm-mini-name">Be the first on the leaderboard!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Game Over - Time's Up */}
          {gameState === 'gameover' && (
            <div className="mm-game-over-overlay" onClick={(e) => e.stopPropagation()}>
              {/* Main Game Over Content - stays fixed */}
              <div className="mm-game-over-content">
                <div className="mm-game-over-left">
                  {sadImage ? (
                    <img src={sadImage} alt="Game Over" className="mm-sad-image" />
                  ) : (
                    <div className="mm-game-over-emoji">⏰</div>
                  )}
                </div>
                <div className="mm-game-over-right">
                  <h2 className="mm-game-over-title">Time's Up!</h2>

                  {/* Enhancement 26: Revenge message */}
                  <div className="mm-game-over-reason mm-revenge-message">
                    {getRevengeMessage(matches, currentConfig.pairs, round)}
                  </div>

                  <div className="mm-game-over-score">
                    <span className="mm-score-value">{totalScore}</span>
                    <span className="mm-score-label">total points</span>
                  </div>

                  <div className="mm-game-over-stats">
                    <div className="mm-stat">
                      <span className="mm-stat-value">{highScore}</span>
                      <span className="mm-stat-label">best</span>
                    </div>
                  </div>

                  {(isNewPersonalBest || totalScore > highScore) && totalScore > 0 && (
                    <div className="mm-new-record">New Personal Best!</div>
                  )}

                  {isSignedIn && (
                    <div className="mm-submitted">
                      {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                    </div>
                  )}

                  {/* Buttons: Play Again + Leaderboard */}
                  <div className="mm-game-over-buttons">
                    <button onClick={startGame} className="mm-play-btn">
                      Play Again
                    </button>
                    <button
                      onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                      className="mm-leaderboard-btn"
                    >
                      Leaderboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Leaderboard Panel - overlays on top */}
              {showLeaderboardPanel && (
                <div className="mm-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
                  <div className="mm-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                    <div className="mm-leaderboard-header">
                      <h3>Leaderboard</h3>
                      <button className="mm-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                    </div>
                    <div className="mm-leaderboard-list">
                      {Array.from({ length: 10 }, (_, index) => {
                        const entry = displayLeaderboard[index];
                        const isCurrentUser = entry && totalScore === entry.score;
                        return (
                          <div key={index} className={`mm-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                            <span className="mm-leaderboard-rank">#{index + 1}</span>
                            <span className="mm-leaderboard-name">{entry?.name || '---'}</span>
                            <span className="mm-leaderboard-score">{entry?.score ?? '-'}</span>
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
                className="mm-back-to-games-btn"
              >
                Back to Games
              </button>
            </div>
          )}

          {gameState === 'playing' && (() => {
            const totalCards = cards.length;

            // === DYNAMIC GRID CALCULATION ===
            // Adapts to screen orientation: more columns in landscape, more rows in portrait
            // Uses windowSize state for responsive updates on resize/orientation change

            // Lightbox size: min(95vw, 1200px) x min(85vh, 800px) - matches CSS
            const lightboxWidth = Math.min(windowSize.width * 0.95, 1200);
            const lightboxHeight = Math.min(windowSize.height * 0.85, 800);
            const edgePadding = 25; // Padding from lightbox edges
            const headerFooterSpace = 80; // Space for stats overlay and timeline

            // Available space for cards
            const availableWidth = lightboxWidth - edgePadding * 2;
            const availableHeight = lightboxHeight - edgePadding * 2 - headerFooterSpace;

            // Base gap (will be refined based on card size)
            const baseGap = 8;

            // Calculate optimal grid using dynamic algorithm
            const gridConfig = calculateOptimalGrid(
              totalCards,
              availableWidth,
              availableHeight,
              baseGap,
              60, // minCardSize - touch-friendly minimum
              140 // maxCardSize
            );

            const { cols, rows, cardSize: calculatedCardSize } = gridConfig;

            // Refine gap based on calculated card size (8% of card size, clamped)
            const gap = Math.max(6, Math.min(Math.floor(calculatedCardSize * 0.08), 14));

            // Recalculate card size with refined gap
            const cardSizeByWidth = Math.floor((availableWidth - (cols - 1) * gap) / cols);
            const cardSizeByHeight = Math.floor((availableHeight - (rows - 1) * gap) / rows);
            const optimalCardSize = Math.max(40, Math.min(cardSizeByWidth, cardSizeByHeight, 140));

            // Check if we need scrolling (cards too small even at minimum)
            const needsScroll = optimalCardSize < 50 && totalCards > 36;

            // Actual grid dimensions
            const gridWidth = cols * optimalCardSize + (cols - 1) * gap;
            const gridHeight = rows * optimalCardSize + (rows - 1) * gap;

            return (
              <div className={`mm-game-layout ${effects.showScreenShake ? 'screen-shake' : ''} ${isFrozen ? 'frozen' : ''}`}>
                {/* Visual Effects Layer */}
                <GameEffects effects={effects} accentColor="#8b5cf6" />

                {/* Enhancement 16: Near-win shimmer overlay */}
                <div className={`mm-near-win-shimmer ${showNearWinShimmer ? 'active' : ''}`} />

                {/* Music toggle button - fixed under close button */}
                <button
                  className="music-toggle-btn-fixed"
                  onClick={() => isBackgroundMusicPlaying ? pauseBackgroundMusic() : playBackgroundMusic()}
                >
                  {isBackgroundMusicPlaying ? '🔊' : '🔇'}
                </button>

                {/* Stats Panel - floating overlay at top-left */}
                <div className="mm-stats-overlay">
                  <div className={`mm-stat round-stat`}>
                    <span className="mm-stat-label">Round</span>
                    <span className="mm-stat-value">{round}</span>
                  </div>
                  <div className={`mm-stat score-stat`}>
                    <span className="mm-stat-label">Score</span>
                    <span className="mm-stat-value">{totalScore}</span>
                  </div>
                  <div className={`mm-stat ${getUrgencyClass(urgencyLevel)}`}>
                    <span className="mm-stat-label">Time</span>
                    <span className="mm-stat-value">{timeLeft}s</span>
                  </div>
                  <div className="mm-stat">
                    <span className="mm-stat-label">Pairs</span>
                    <span className="mm-stat-value">{matches}/{requiredPairs}</span>
                  </div>
                </div>

                {/* Card Grid - centered in lightbox, adapts to orientation */}
                <div
                  className="mm-cards-grid"
                  style={{
                    width: needsScroll ? `${availableWidth}px` : `${gridWidth}px`,
                    height: needsScroll ? `${availableHeight}px` : `${gridHeight}px`,
                    gridTemplateColumns: `repeat(${cols}, ${optimalCardSize}px)`,
                    gridTemplateRows: `repeat(${rows}, ${optimalCardSize}px)`,
                    gap: `${gap}px`,
                    overflowY: needsScroll ? 'auto' : 'hidden',
                    overflowX: 'hidden',
                  } as React.CSSProperties}
                >
                  {cards.map(card => (
                    <div
                      key={card.id}
                      data-card-id={card.id}
                      className={`mm-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                      onClick={() => handleCardClick(card.id)}
                      onMouseEnter={() => {
                        // Only play hover sound/haptic for unflipped, unmatched cards
                        if (!card.isFlipped && !card.isMatched) {
                          playCardHover();
                          hapticHover(); // Ultra-light 5ms tap
                        }
                      }}
                    >
                      <div className="mm-card-inner">
                        <div className="mm-card-front">
                          <img
                            src="/assets/Games/games_media/Memory_card.png"
                            alt=""
                            className="mm-card-img"
                          />
                        </div>
                        <div className="mm-card-back">
                          <img
                            src={card.image}
                            alt={card.name}
                            className="mm-card-img"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline Bar - fills left to right as time passes */}
                <div className={`mm-timeline ${getUrgencyClass(urgencyLevel)} ${timelineCelebrating ? 'pulse-celebration' : ''}`}>
                  <div
                    className="mm-timeline-progress"
                    style={{
                      width: `${((roundTotalTime - timeLeft) / roundTotalTime) * 100}%`,
                      transition: `width 1s linear`
                    }}
                  />
                  <div className="mm-timeline-glow" />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

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
  );
};

export default MemoryMatch;
