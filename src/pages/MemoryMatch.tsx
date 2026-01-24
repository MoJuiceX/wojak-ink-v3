import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEffects, GameEffects } from '@/components/media';
import { useGameMute } from '@/contexts/GameMuteContext';
import { useTimeUrgency, getUrgencyClass } from '@/hooks/useTimeUrgency';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { getAllNfts, isReady as isPreloaderReady, initGalleryPreloader } from '@/services/galleryPreloader';
import { GameSEO } from '@/components/seo/GameSEO';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { captureGameArea } from '@/systems/sharing/captureDOM';
import { generateGameScorecard } from '@/systems/sharing/GameScorecard';
import { ArcadeGameOverScreen } from '@/components/media/games/ArcadeGameOverScreen';
import { GameButton } from '@/components/ui/GameButton';
import './MemoryMatch.css';

interface NFTMetadata {
  name: string;
  image: string;
  edition: number;
  attributes?: { trait_type: string; value: string }[];
}

// Round configuration - pairs and optional base filter
// Time increases by 20% each round (calculated dynamically)
// STRATEGY: Add COLUMNS before ROWS to keep cards BIG for longer!
// 3 rows → 4 rows → 5 rows (only add rows when horizontal space is exhausted)
const ROUND_CONFIG: { pairs: number; baseFilter?: string }[] = [
  // Phase 1: 3 rows - cards stay SAME SIZE (height-constrained)
  { pairs: 6 },       // Round 1: 12 cards (4×3) - baseline card size
  { pairs: 7 },       // Round 2: 14 cards (5×3) - +1 column, 1 empty
  { pairs: 9 },       // Round 3: 18 cards (6×3) - fills grid
  // Phase 2: 4 rows - gradual increase
  { pairs: 11 },      // Round 4: 22 cards (6×4) - 2 empty
  { pairs: 12 },      // Round 5: 24 cards (6×4) - fills grid
  { pairs: 13 },      // Round 6: 26 cards (7×4) - 2 empty
  { pairs: 14 },      // Round 7: 28 cards (7×4) - fills grid
  { pairs: 15 },      // Round 8: 30 cards (8×4) - 2 empty
  { pairs: 16 },      // Round 9: 32 cards (8×4) - fills grid
  { pairs: 16 },      // Round 10: 32 cards (8×4) - same cards, less time per card
  // Similar-looking NFT filters for extra difficulty (same card count, time keeps scaling)
  { pairs: 16, baseFilter: 'Alien Baddie' },  // Round 11
  { pairs: 16, baseFilter: 'Alien Waifu' },   // Round 12
  { pairs: 16, baseFilter: 'Bepe Baddie' },   // Round 13
  { pairs: 16, baseFilter: 'Bepe Waifu' },    // Round 14
  { pairs: 16, baseFilter: 'Wojak' },         // Round 15+
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

// Background music playlist
const MUSIC_PLAYLIST = [
  { src: '/audio/music/memory-match/megaman-cutman-final.mp3', name: 'Cut Man Stage' },
  { src: '/audio/music/memory-match/megaman-elecman-final.mp3', name: 'Elec Man Stage' },
  { src: '/audio/music/memory-match/megaman-fireman-final.mp3', name: 'Fire Man Stage' },
  { src: '/audio/music/memory-match/sf2-zangief-final.mp3', name: 'Zangief Stage' },
];

// Fixed grid layouts optimized for MAXIMUM CARD SIZE
// DESKTOP (landscape): Add COLUMNS before ROWS - more horizontal space
// MOBILE (portrait): Add ROWS before COLUMNS - more vertical space
const GRID_LAYOUTS_DESKTOP: Record<number, { cols: number; rows: number }> = {
  // 3 rows - maximize card size by staying height-constrained
  12: { cols: 4, rows: 3 },   // Round 1: 4×3 (baseline)
  14: { cols: 5, rows: 3 },   // Round 2: 5×3 (1 empty)
  18: { cols: 6, rows: 3 },   // Round 3: 6×3 (fills grid)
  // 4 rows - gradual increase
  22: { cols: 6, rows: 4 },   // Round 4: 6×4 (2 empty)
  24: { cols: 6, rows: 4 },   // Round 5: 6×4 (fills grid)
  26: { cols: 7, rows: 4 },   // Round 6: 7×4 (2 empty)
  28: { cols: 7, rows: 4 },   // Round 7: 7×4 (fills grid)
  30: { cols: 8, rows: 4 },   // Round 8: 8×4 (2 empty)
  32: { cols: 8, rows: 4 },   // Round 9-15: 8×4 (fills grid)
};

// MOBILE: Optimized for portrait - fewer columns, more rows = BIGGER cards
// IMPORTANT: Cards must get smaller (or stay same) as levels increase, never bigger!
// 4 columns = ~100px cards (sweet spot for mobile)
const GRID_LAYOUTS_MOBILE: Record<number, { cols: number; rows: number }> = {
  12: { cols: 3, rows: 4 },   // Round 1: 3×4 (~130px cards)
  14: { cols: 3, rows: 5 },   // Round 2: 3×5 (~130px cards, 1 empty)
  18: { cols: 3, rows: 6 },   // Round 3: 3×6 (~130px cards)
  22: { cols: 4, rows: 6 },   // Round 4: 4×6 (~100px cards, 2 empty)
  24: { cols: 4, rows: 6 },   // Round 5: 4×6 (~100px cards)
  26: { cols: 4, rows: 7 },   // Round 6: 4×7 (~100px cards, 2 empty)
  28: { cols: 4, rows: 7 },   // Round 7: 4×7 (~100px cards)
  30: { cols: 4, rows: 8 },   // Round 8: 4×8 (~100px cards, 2 empty) - NOT 5×6!
  32: { cols: 4, rows: 8 },   // Round 9-15: 4×8 (~100px cards)
};

// Get optimal grid layout for a card count
function getGridLayout(cardCount: number, isMobile: boolean): { cols: number; rows: number } {
  const layouts = isMobile ? GRID_LAYOUTS_MOBILE : GRID_LAYOUTS_DESKTOP;

  // Direct lookup for known card counts
  if (layouts[cardCount]) {
    return layouts[cardCount];
  }
  // Fallback: calculate based on orientation
  const sqrt = Math.sqrt(cardCount);
  if (isMobile) {
    // Portrait: fewer columns, more rows
    const cols = Math.ceil(sqrt * 0.75);
    const rows = Math.ceil(cardCount / cols);
    return { cols, rows };
  } else {
    // Landscape: more columns, fewer rows
    const cols = Math.ceil(sqrt * 1.5);
    const rows = Math.ceil(cardCount / cols);
    return { cols, rows };
  }
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

const MemoryMatch: React.FC = () => {
  const { playCardHover, playCardFlip, playMatchFound, playMismatch, playNearCompletion, playFastMatchBonus, playWinSound, playGameOver, playLevelUp, playWarning } = useGameSounds();
  const { hapticCombo, hapticHighScore, hapticGameOver, hapticLevelUp, hapticMismatch, hapticHover, hapticUrgencyTick, hapticWarning, hapticButton } = useGameHaptics();
  const isMobile = useIsMobile();

  // Visual effects system
  const {
    effects,
    triggerBigMoment,
    updateCombo,
    resetCombo,
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

  // Background music controls (useAudio provides global audio state)
  useAudio();

  // Arcade frame shared mute state
  const { isMuted: arcadeMuted, musicManagedExternally } = useGameMute();

  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'roundComplete' | 'gameover'>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isChecking, setIsChecking] = useState(false);
  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);
  const [gameScreenshot, setGameScreenshot] = useState<string | null>(null);

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
  const [showDevPanel, setShowDevPanel] = useState(false); // Dev panel disabled for production

  // Keyboard shortcut to toggle dev panel (press 'D')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle dev panel with 'D' key (not in input fields)
      if (e.key.toLowerCase() === 'd' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        setShowDevPanel(prev => !prev);
      }
      // Quick level jump with number keys in dev mode
      if (showDevPanel && e.key >= '1' && e.key <= '9') {
        const level = parseInt(e.key);
        if (level <= ROUND_CONFIG.length) {
          jumpToRound(level);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDevPanel]);

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
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('memoryMatchSoundEnabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Background music refs
  const playlistIndexRef = useRef(Math.floor(Math.random() * MUSIC_PLAYLIST.length));
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const gameStateRefForMusic = useRef(gameState);
  
  // Keep refs in sync
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { gameStateRefForMusic.current = gameState; }, [gameState]);

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
      if (gameStateRefForMusic.current === 'playing' && soundEnabledRef.current) {
        playMusicTrack(playlistIndexRef.current);
      }
    }, { once: true });
    musicAudioRef.current = music;
    if (soundEnabledRef.current) {
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

  // Control music based on game state and sound enabled
  useEffect(() => {
    if (gameState === 'playing' && soundEnabled) {
      if (musicAudioRef.current) {
        musicAudioRef.current.play().catch(() => {});
      }
    } else {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
      }
    }
  }, [gameState, soundEnabled]);

  // Sync with arcade frame mute button (from GameMuteContext)
  useEffect(() => {
    if (!musicManagedExternally) {
      setSoundEnabled(!arcadeMuted);
      if (arcadeMuted) {
        if (musicAudioRef.current) {
          musicAudioRef.current.pause();
        }
      } else if (gameState === 'playing') {
        if (musicAudioRef.current) {
          musicAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [arcadeMuted, musicManagedExternally, gameState]);

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

  // Mobile fullscreen mode - hide header during gameplay
  useEffect(() => {
    if (isMobile && gameState === 'playing') {
      document.body.classList.add('game-fullscreen-mode');
    } else {
      document.body.classList.remove('game-fullscreen-mode');
    }
    return () => {
      document.body.classList.remove('game-fullscreen-mode');
    };
  }, [isMobile, gameState]);

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
  // Track anticipation mode to avoid DOM queries on every timer tick
  const anticipationModeRef = useRef<'none' | 'struggling' | 'near-win-2' | 'near-win-1'>('none');

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

    // Haptic only - music will be added via GameModal
    hapticButton(); // Light tap on game start
    // Start music on user gesture (required for mobile browsers)
    // Skip if GameModal manages the music (check both ref AND current context value for safety)
    if (!musicAudioRef.current && !musicManagedExternallyRef.current && !musicManagedExternally) {
      playNextMusicTrack();
    }

    setDevMode(false); // Disable dev mode for normal gameplay
    setRound(1);
    setTotalScore(0);
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    await startRound(1, true);
  };

  // Start a specific round
  const startRound = async (roundNum: number, _isNewGame: boolean = false) => {
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

  // Calculate round score: points for matches + time bonus + round completion bonus
  const calculateRoundScore = () => {
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

  // Share score handler - generates scorecard image and downloads it
  const handleShare = useCallback(async () => {
    try {
      // Generate the scorecard image using the new GameScorecard generator
      const blob = await generateGameScorecard({
        gameName: 'Memory Match',
        gameNameParts: ['MEMORY', 'MATCH'],
        score: totalScore,
        scoreLabel: 'points',
        bestScore: highScore,
        isNewRecord: isNewPersonalBest,
        screenshot: gameScreenshot,
        accentColor: '#10b981', // Memory Match emerald accent
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `memory-match-${totalScore}.png`;
      link.href = url;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);

      // Try to also share via Web Share API if available
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'memory-match-score.png', { type: 'image/png' });
        const shareData = {
          title: 'Memory Match Score',
          text: `🧠 I scored ${totalScore} points in Memory Match (Round ${round})! Can you beat me?`,
          files: [file],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
        }
      }
    } catch (err) {
      console.error('Failed to generate share image:', err);
      // Fallback to text share
      const shareText = `🧠 Memory Match: ${totalScore} points (Round ${round})!\n\nCan you beat my score?\n\nhttps://wojak.ink/games`;
      if (navigator.share) {
        await navigator.share({ title: 'Memory Match', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
      }
    }
  }, [totalScore, highScore, isNewPersonalBest, gameScreenshot, round]);

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
            updateCombo();

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
                score: isFastMatch ? `FAST +${10 + (newStreak * 5)}` : `+${10 + (newStreak * 5)}`,
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
          // Capture screenshot BEFORE changing game state (cards disappear after state change)
          // Temporarily remove transform from cards grid for proper capture
          const cardsGrid = document.querySelector('.mm-cards-grid') as HTMLElement;
          if (cardsGrid) {
            // Store original styles
            const originalTransform = cardsGrid.style.transform;
            const originalLeft = cardsGrid.style.left;
            const originalTop = cardsGrid.style.top;
            const originalPosition = cardsGrid.style.position;

            // Remove centering transform for capture
            cardsGrid.style.transform = 'none';
            cardsGrid.style.left = '0';
            cardsGrid.style.top = '0';
            cardsGrid.style.position = 'relative';

            captureGameArea(cardsGrid).then(screenshot => {
              // Restore original styles
              cardsGrid.style.transform = originalTransform;
              cardsGrid.style.left = originalLeft;
              cardsGrid.style.top = originalTop;
              cardsGrid.style.position = originalPosition;

              if (screenshot) setGameScreenshot(screenshot);
            });
          }
          // Stop background music immediately on death
          if (musicAudioRef.current) {
            musicAudioRef.current.pause();
            musicAudioRef.current = null;
          }
          playGameOver();
          hapticGameOver();
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
  // OPTIMIZED: Only run DOM manipulation when anticipation mode actually changes
  useEffect(() => {
    if (gameState !== 'playing') {
      anticipationModeRef.current = 'none';
      return;
    }

    // Compute config inline to avoid initialization order issues
    const config = getRoundConfig(round);
    const remainingPairs = config.pairs - matches;
    const isStruggling = timeLeft <= 10 && remainingPairs > 3;

    // Compute the current mode
    let newMode: 'none' | 'struggling' | 'near-win-2' | 'near-win-1' = 'none';
    if (remainingPairs === 1) {
      newMode = 'near-win-1';
    } else if (remainingPairs === 2) {
      newMode = 'near-win-2';
    } else if (isStruggling) {
      newMode = 'struggling';
    }

    // Skip DOM manipulation if mode hasn't changed
    if (newMode === anticipationModeRef.current) return;
    anticipationModeRef.current = newMode;

    const unmatchedCards = document.querySelectorAll('.mm-card:not(.matched)');

    // Clear all anticipation classes first
    unmatchedCards.forEach(card => {
      card.classList.remove('anticipation-1', 'anticipation-2', 'near-win-highlight', 'struggle-shimmer');
    });

    // Apply appropriate classes based on state
    if (newMode === 'near-win-1') {
      unmatchedCards.forEach(card => {
        card.classList.add('anticipation-1', 'near-win-highlight');
      });
    } else if (newMode === 'near-win-2') {
      unmatchedCards.forEach(card => {
        card.classList.add('anticipation-2');
      });
    } else if (newMode === 'struggling') {
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
    <>
      {/* Dev Panel - Rendered via Portal directly to document.body to bypass all clipping */}
      {showDevPanel && createPortal(
        <div className="mm-dev-panel">
          <div className="mm-dev-header">
            <span>🛠️ LEVEL TESTER</span>
            <button onClick={() => setShowDevPanel(false)}>×</button>
          </div>
          <div className="mm-dev-info">
            Click level to preview grid layout
          </div>
          <div className="mm-dev-levels">
            {ROUND_CONFIG.map((config, index) => {
              const pairs = config.pairs;
              const totalCards = pairs * 2;
              // Estimate grid layout
              const cols = totalCards <= 16 ? 4 : totalCards <= 24 ? 6 : 6;
              const rows = Math.ceil(totalCards / cols);
              return (
                <button
                  key={index}
                  className={`mm-dev-btn ${round === index + 1 && gameState === 'playing' ? 'active' : ''}`}
                  onClick={() => jumpToRound(index + 1)}
                  title={`Round ${index + 1}: ${pairs} pairs (${totalCards} cards, ~${cols}x${rows})${config.baseFilter ? ` [${config.baseFilter}]` : ''}`}
                >
                  <span className="mm-dev-btn-round">R{index + 1}</span>
                  <span className="mm-dev-btn-info">{totalCards}</span>
                </button>
              );
            })}
          </div>
          {devMode && (
            <div className="mm-dev-status">
              <span className="mm-dev-mode-badge">⏸️ PAUSED</span>
              <span className="mm-dev-grid-info">
                {cards.length} cards • Round {round}
              </span>
            </div>
          )}
          {/* Reveal All button */}
          <button
            className="mm-dev-reveal-btn"
            onClick={() => setCards(prev => prev.map(c => ({ ...c, isFlipped: true })))}
          >
            👁️ Reveal All Cards
          </button>
          {/* Hide All button */}
          <button
            className="mm-dev-reveal-btn"
            onClick={() => setCards(prev => prev.map(c => ({ ...c, isFlipped: c.isMatched })))}
            style={{ marginTop: '4px', background: 'rgba(100, 100, 100, 0.9)' }}
          >
            🙈 Hide Unmatched
          </button>
        </div>,
        document.body
      )}

      {/* Mobile Dev Toggle - REMOVED for production */}

      <div className={`memory-container ${gameState === 'playing' ? 'playing-mode' : ''} ${gameState === 'playing' ? getUrgencyClass(urgencyLevel) : ''}`}>
        <GameSEO
          gameName="Memory Match"
          gameSlug="memory"
          description="Test your memory with this classic card-matching game! Find all the pairs before time runs out across multiple challenging rounds."
          genre="Puzzle"
          difficulty="Easy"
        />

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
                  <GameButton onClick={nextRound} className="mm-next-round-btn" size="lg">
                    Next Round →
                  </GameButton>

                  {/* Mini Leaderboard Preview */}
                  <div className="mm-mini-leaderboard">
                    <div className="mm-mini-leaderboard-title">Leaderboard Position</div>
                    {aboveEntry && (
                      <div className="mm-mini-entry above">
                        <span className="mm-mini-rank">#{rank}</span>
                        <span className="mm-mini-name">{aboveEntry.displayName || 'Anonymous'}</span>
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
                        <span className="mm-mini-name">{belowEntry.displayName || 'Anonymous'}</span>
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

          {/* Game Over - Uses shared component */}
          {gameState === 'gameover' && (
            <ArcadeGameOverScreen
              score={totalScore}
              highScore={highScore}
              scoreLabel="total points"
              isNewPersonalBest={isNewPersonalBest}
              isSignedIn={isSignedIn}
              isSubmitting={isSubmitting}
              scoreSubmitted={scoreSubmitted}
              userDisplayName={userDisplayName ?? undefined}
              leaderboard={globalLeaderboard}
              onPlayAgain={startGame}
              onShare={handleShare}
              accentColor="#10b981"
            />
          )}

          {gameState === 'playing' && (() => {
            const totalCards = cards.length;

            // === SIMPLE GRID CALCULATION ===
            // PRIORITY: BIGGEST POSSIBLE CARDS - only shrink when absolutely necessary
            // Cards should fill the arcade screen edge-to-edge
            // Strategy: Calculate card size based on level 1 (4×3 grid), use SAME size for all levels
            // Only shrink when physically impossible to fit at level 1 size

            // Get the optimal grid layout for this card count (different for mobile vs desktop)
            const { cols, rows } = getGridLayout(totalCards, isMobile);

            // Available space - different for mobile vs desktop
            // Mobile: Use MAXIMUM space - stats overlay is position:fixed so it overlaps
            // Desktop: FIT WITHIN THE ARCADE SCREEN (no clipping!)
            const availableWidth = isMobile
              ? windowSize.width - 12      // Mobile: nearly full width (6px padding each side)
              : windowSize.width * 0.64;   // Desktop: 64% of viewport width (arcade frame)

            const availableHeight = isMobile
              ? windowSize.height - 90     // Mobile: only reserve ~90px (bottom nav 70px + small buffer)
              : windowSize.height * 0.58;  // Desktop: 58% of viewport height (room for stats/timeline)

            // Small gap between cards
            const gap = isMobile ? 6 : 5;

            // FIRST: Calculate what card size would be for Level 1 (4×3 grid)
            const level1Cols = 4;
            const level1Rows = 3;
            const level1CardByWidth = Math.floor((availableWidth - (level1Cols - 1) * gap) / level1Cols);
            const level1CardByHeight = Math.floor((availableHeight - (level1Rows - 1) * gap) / level1Rows);
            const level1CardSize = Math.min(level1CardByWidth, level1CardByHeight);

            // THEN: Check if level 1 card size fits in current grid
            const neededWidth = cols * level1CardSize + (cols - 1) * gap;
            const neededHeight = rows * level1CardSize + (rows - 1) * gap;

            // Use level 1 card size if it fits, otherwise calculate minimum needed
            let cardSize: number;
            if (neededWidth <= availableWidth && neededHeight <= availableHeight) {
              // Level 1 size fits! Use it for consistency
              cardSize = level1CardSize;
            } else {
              // Must shrink - calculate the size needed to fit
              const cardSizeByWidth = Math.floor((availableWidth - (cols - 1) * gap) / cols);
              const cardSizeByHeight = Math.floor((availableHeight - (rows - 1) * gap) / rows);
              cardSize = Math.min(cardSizeByWidth, cardSizeByHeight);
            }

            // Actual grid dimensions
            const gridWidth = cols * cardSize + (cols - 1) * gap;
            const gridHeight = rows * cardSize + (rows - 1) * gap;

            // No scrolling needed with proper sizing
            const needsScroll = false;

            return (
              <div className={`mm-game-layout ${effects.screenShake ? 'screen-shake' : ''} ${isFrozen ? 'frozen' : ''}`}>
                {/* Visual Effects Layer */}
                <GameEffects effects={effects} accentColor="#8b5cf6" />

                {/* Enhancement 16: Near-win shimmer overlay */}
                <div className={`mm-near-win-shimmer ${showNearWinShimmer ? 'active' : ''}`} />

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
                    gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`,
                    gridTemplateRows: `repeat(${rows}, ${cardSize}px)`,
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
    </>
  );
};

export default MemoryMatch;
