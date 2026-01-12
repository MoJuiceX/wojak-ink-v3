import { useState, useEffect, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
} from '@ionic/react';
import { informationCircleOutline, close } from 'ionicons/icons';
import './MemoryMatch.css';

interface NFTMetadata {
  name: string;
  image: string;
  edition: number;
}

interface Card {
  id: number;
  nftId: number;
  name: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'gameover'>('idle');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [bestMoves, setBestMoves] = useState(() => {
    return parseInt(localStorage.getItem('memoryMatchBest') || '999', 10);
  });
  const [isChecking, setIsChecking] = useState(false);
  const [metadata, setMetadata] = useState<NFTMetadata[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  // Load metadata on mount
  useEffect(() => {
    fetch('/assets/nft-data/metadata.json')
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error('Failed to load metadata:', err));
  }, []);

  const shuffleCards = useCallback(() => {
    if (metadata.length === 0) return [];

    // Randomly select 8 unique NFTs
    const shuffledMetadata = [...metadata].sort(() => Math.random() - 0.5);
    const selectedNFTs = shuffledMetadata.slice(0, 8);

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

  const startGame = async () => {
    if (metadata.length === 0) {
      setGameState('loading');
      return;
    }

    setGameState('loading');
    const newCards = shuffleCards();

    // Preload all images before starting
    await preloadImages(newCards);

    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeLeft(90);
    setIsChecking(false);
    setGameState('playing');
  };

  // Retry start when metadata loads
  useEffect(() => {
    if (gameState === 'loading' && metadata.length > 0) {
      startGame();
    }
  }, [metadata, gameState]);

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing' || isChecking) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    // Flip the card
    setCards(prev =>
      prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.nftId === secondCard.nftId) {
        // Match found
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          );
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 800);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1200);
      }
    }
  };

  // Check win condition
  useEffect(() => {
    if (matches === 8 && gameState === 'playing') {
      setGameState('gameover');
      if (moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memoryMatchBest', String(moves));
      }
    }
  }, [matches, moves, bestMoves, gameState]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const isWin = matches === 8;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowInfo(true)}>
              <IonIcon icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Memory Match</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="memory-content" scrollY={false}>
        {gameState === 'playing' && (
          <div className="memory-hud">
            <div className="hud-item">
              <span className="hud-label">Time</span>
              <span className="hud-value">{timeLeft}s</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Moves</span>
              <span className="hud-value">{moves}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Matches</span>
              <span className="hud-value">{matches}/8</span>
            </div>
          </div>
        )}

        <div className="memory-area">
          {gameState === 'idle' && (
            <div className="game-menu">
              <div className="game-title">Memory Match</div>
              <div className="game-emoji">🧠</div>
              <p className="game-desc">Match Wojak NFTs!</p>
              <p className="game-desc">Find all 8 pairs</p>
              {bestMoves < 999 && (
                <p className="high-score">Best: {bestMoves} moves</p>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play
              </IonButton>
            </div>
          )}

          {gameState === 'loading' && (
            <div className="game-menu">
              <IonSpinner name="crescent" />
              <p className="game-desc">Loading NFTs...</p>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="game-menu">
              <div className="game-title">{isWin ? 'You Win!' : 'Time Up!'}</div>
              <div className="final-score">
                <span className="score-label">{isWin ? 'Moves' : 'Matches'}</span>
                <span className="score-value">{isWin ? moves : matches}</span>
              </div>
              {isWin && moves === bestMoves && (
                <div className="new-record">New Record!</div>
              )}
              {isWin && (
                <div className="high-score-display">
                  Best: {bestMoves} moves
                </div>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play Again
              </IonButton>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="cards-grid">
              {cards.map(card => (
                <div
                  key={card.id}
                  className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <span>&#x1F34A;</span>
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
          )}
        </div>

        {/* Info Modal */}
        {showInfo && (
          <div className="info-overlay" onClick={() => setShowInfo(false)}>
            <div className="info-modal" onClick={(e) => e.stopPropagation()}>
              <button className="info-close" onClick={() => setShowInfo(false)}>
                <IonIcon icon={close} />
              </button>
              <h2>How to Play</h2>
              <div className="info-content">
                <p><strong>Goal:</strong> Find all 8 matching pairs before time runs out!</p>
                <p><strong>Controls:</strong> Tap cards to flip them over.</p>
                <p><strong>Tips:</strong></p>
                <ul>
                  <li>Remember the position of each NFT</li>
                  <li>Match identical Wojak NFTs</li>
                  <li>Use fewer moves for a better score</li>
                  <li>You have 90 seconds to complete</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MemoryMatch;
