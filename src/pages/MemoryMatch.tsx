// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useAudio } from '@/contexts/AudioContext';
import { useGameEffects, GameEffects } from '@/components/media';
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

interface LocalLeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

const MemoryMatch: React.FC = () => {
  const { playCardFlip, playMatchFound, playWinSound, playGameOver, playGameStart, playLevelUp, playWarning } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticLevelUp, hapticSuccess, hapticWarning, hapticButton } = useGameHaptics();

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
  const [playerName, setPlayerName] = useState('');
  const [sadImage, setSadImage] = useState('');

  // Progressive rounds
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  // Streak tracking for combo effects
  const [streak, setStreak] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState<number | null>(null);

  // Dev mode - pauses timer and game logic for layout testing
  const [devMode, setDevMode] = useState(false);

  const [localLeaderboard, setLocalLeaderboard] = useState<LocalLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('memoryMatchLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('memoryMatchHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

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
  const CLICK_DEBOUNCE_MS = 100; // Minimum ms between clicks

  // Load metadata on mount
  useEffect(() => {
    fetch('/assets/nft-data/metadata.json')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error('Failed to load metadata:', err));
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

    const shuffledMetadata = [...availableMetadata].sort(() => Math.random() - 0.5);
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
    setIsChecking(false);
    // Reset streak and effects for new round
    setStreak(0);
    setLastMatchTime(null);
    resetAllEffects();
    if (isNewGame) {
      setPlayerName('');
    }
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
    setPlayerName('');
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

  // Save score to local leaderboard (for guests)
  const saveScoreLocal = () => {
    if (!playerName.trim()) return;

    const newEntry: LocalLeaderboardEntry = {
      name: playerName.trim(),
      score: totalScore,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...localLeaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLocalLeaderboard(updatedLeaderboard);
    localStorage.setItem('memoryMatchLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
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

  const skipSaveScore = () => {
    setPlayerName('');
    goToMenu();
  };

  // Merge global and local leaderboard for display
  const displayLeaderboard = globalLeaderboard.length > 0
    ? globalLeaderboard.map(entry => ({
        name: entry.displayName,
        score: entry.score,
        date: entry.date,
      }))
    : localLeaderboard;

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

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing' || isChecking) return;

    // Debounce rapid clicks to prevent race conditions
    const now = Date.now();
    if (now - lastClickTimeRef.current < CLICK_DEBOUNCE_MS) return;
    lastClickTimeRef.current = now;

    // Use ref for immediate, synchronous checks to prevent race conditions
    const currentFlipped = flippedCardsRef.current;

    // Prevent clicking same card twice or more than 2 cards
    if (currentFlipped.includes(cardId)) return;
    if (currentFlipped.length >= 2) return;

    // Check card state from current cards array
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isMatched) return;

    // Additional safety: if card shows as flipped but not in our tracking, skip it
    // (This handles edge case where state got out of sync)
    if (card.isFlipped && !currentFlipped.includes(cardId)) return;

    // Play flip sound + haptic
    playCardFlip();
    hapticButton(); // Light tap on card flip

    // Update ref IMMEDIATELY (synchronous) to prevent race conditions
    const newFlipped = [...currentFlipped, cardId];
    flippedCardsRef.current = newFlipped;

    // Flip the card in state
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;

      // Find cards using functional approach to ensure we have latest state
      // We need to compare nftIds, which don't change, so we can use current cards
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

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
        }, 500);
        return;
      }

      if (firstCard.nftId === secondCard.nftId) {
        // Match found!
        // Capture config values BEFORE setTimeout to avoid closure issues
        const pairsForMilestone = Math.floor(currentConfig.pairs * 0.75);

        setTimeout(() => {
          try {
            playMatchFound();
            hapticSuccess(); // Success haptic on match
          } catch (e) {
            // Sound/haptic errors shouldn't break the game
          }

          try {
            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              )
            );

            // Update streak and combo
            const newStreak = streak + 1;
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

              // Fast match bonus callout
              if (isFastMatch && newStreak >= 2) {
                setTimeout(() => showEpicCallout('⚡ SPEED BONUS!'), 400);
              }
            } catch (e) {
              // Visual effects errors shouldn't break the game
            }

            // Update match count - CRITICAL for game completion
            setMatches(prev => {
              const newMatches = prev + 1;
              // Milestone celebrations
              try {
                if (newMatches === 5) {
                  setTimeout(() => showEpicCallout('🎯 HALFWAY!'), 500);
                } else if (newMatches === pairsForMilestone) {
                  setTimeout(() => showEpicCallout('🔥 ALMOST THERE!'), 500);
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
        }, 800);
      } else {
        // No match - flip back and reset streak
        setTimeout(() => {
          try {
            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            // Reset streak on mismatch
            setStreak(0);
            resetCombo();
          } catch (e) {
            console.error('Error in mismatch handler:', e);
          } finally {
            // ALWAYS reset state to allow more clicks
            flippedCardsRef.current = [];
            setFlippedCards([]);
            setIsChecking(false);
          }
        }, 1200);
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

  // Timer - time out = game over (skip in dev mode)
  useEffect(() => {
    if (gameState !== 'playing' || devMode) return; // Skip in dev mode

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
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, devMode, playGameOver, playWarning, hapticGameOver, hapticWarning]);

  // Auto-submit score for signed-in users when game ends
  useEffect(() => {
    if (gameState === 'gameover' && isSignedIn && totalScore > 0 && !scoreSubmitted) {
      submitScoreGlobal(totalScore, round);
    }
  }, [gameState, isSignedIn, totalScore, round, scoreSubmitted, submitScoreGlobal]);

  const currentConfig = getRoundConfig(round);
  const requiredPairs = currentConfig.pairs;

  return (
    <div className={`memory-container ${gameState === 'playing' ? 'playing-mode' : ''}`}>
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
          {gameState === 'roundComplete' && (
            <div className="game-over-screen">
              <div className="game-over-left">
                <div className="game-over-emoji">🎉</div>
              </div>
              <div className="game-over-right">
                <div className="game-over-title">Round {round} Complete!</div>
                <div className="game-over-reason">
                  +{calculateRoundScore()} points
                </div>
                <div className="game-over-score">
                  <span className="game-over-score-value">{totalScore + calculateRoundScore()}</span>
                  <span className="game-over-score-label">total score</span>
                </div>
                <div className="game-over-buttons-single">
                  <button onClick={nextRound} className="play-btn">
                    Next Round →
                  </button>
                </div>
              </div>
            </div>
          )}

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

                  <div className="mm-game-over-reason">
                    You reached Round {round}
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

                  {/* Guest name input */}
                  {!isSignedIn && totalScore > 0 && (
                    <div className="mm-guest-form">
                      <input
                        type="text"
                        className="mm-name-input"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={15}
                        onKeyDown={(e) => e.key === 'Enter' && saveScoreLocal()}
                      />
                    </div>
                  )}

                  {/* Buttons: Play Again + Leaderboard */}
                  <div className="mm-game-over-buttons">
                    <button onClick={!isSignedIn && playerName.trim() ? saveScoreLocal : startGame} className="mm-play-btn">
                      {!isSignedIn && playerName.trim() ? 'Save & Play' : 'Play Again'}
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
            // Exact grid dimensions - WIDER than tall to fit horizontal lightbox
            const gridMap: Record<number, { cols: number; rows: number }> = {
              12: { cols: 4, rows: 3 },  // 6 pairs
              16: { cols: 4, rows: 4 },  // 8 pairs
              18: { cols: 6, rows: 3 },  // 9 pairs
              20: { cols: 5, rows: 4 },  // 10 pairs
              24: { cols: 6, rows: 4 },  // 12 pairs
              30: { cols: 6, rows: 5 },  // 15 pairs
              36: { cols: 6, rows: 6 },  // 18 pairs
              42: { cols: 7, rows: 6 },  // 21 pairs - wider!
              48: { cols: 8, rows: 6 },  // 24 pairs - wider!
              54: { cols: 9, rows: 6 },  // 27 pairs - MAX (9 cols x 6 rows)
            };
            const grid = gridMap[totalCards] || { cols: Math.ceil(totalCards / 6), rows: 6 };
            const { cols, rows } = grid;
            return (
              <div className="game-layout">
                {/* Stats Panel - LEFT side */}
                <div className="stats-panel">
                  <div className={`stat-item round-stat`}>
                    <span className="stat-label">Round</span>
                    <span className="stat-value">{round}</span>
                  </div>
                  <div className={`stat-item score-stat`}>
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{totalScore}</span>
                  </div>
                  <div className={`stat-item ${timeLeft <= 10 ? 'time-warning' : ''}`}>
                    <span className="stat-label">Time</span>
                    <span className="stat-value">{timeLeft}s</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Pairs</span>
                    <span className="stat-value">{matches}/{requiredPairs}</span>
                  </div>
                </div>

                {/* Fixed-size Lightbox */}
                <div className={`lightbox-wrapper ${effects.showScreenShake ? 'screen-shake' : ''}`}>
                  {/* Visual Effects Layer */}
                  <GameEffects effects={effects} accentColor="#8b5cf6" />

                  {/* Music toggle button */}
                  <button
                    className="music-toggle-btn"
                    onClick={() => isBackgroundMusicPlaying ? pauseBackgroundMusic() : playBackgroundMusic()}
                  >
                    {isBackgroundMusicPlaying ? '🔊' : '🔇'}
                  </button>

                  <div
                    className="cards-grid"
                    style={{
                      '--cols': cols,
                      '--rows': rows,
                    } as React.CSSProperties}
                  >
                    {cards.map(card => (
                      <div
                        key={card.id}
                        className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                        onClick={() => handleCardClick(card.id)}
                      >
                        <div className="card-inner">
                          <div className="card-front">
                            <img
                              src="/assets/Games/games_media/Memory_card.png"
                              alt=""
                              className="card-back-image"
                            />
                          </div>
                          <div className="card-back">
                            <img
                              src={card.image}
                              alt={card.name}
                              className="nft-image"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default MemoryMatch;
