import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
} from '@ionic/react';
import { informationCircleOutline, close } from 'ionicons/icons';
import './OrangeStack.css';

interface Block {
  id: number;
  x: number;
  width: number;
  y: number;
}

const BLOCK_HEIGHT = 30;
const INITIAL_WIDTH = 140; // Wider blocks for easier start

// Level configurations - easy to hard
const LEVEL_CONFIG = {
  1: { startSpeed: 1.5, speedIncrease: 0.05, blocksToComplete: 8, minBlockWidth: 40 },
  2: { startSpeed: 2.5, speedIncrease: 0.1, blocksToComplete: 10, minBlockWidth: 25 },
  3: { startSpeed: 3.5, speedIncrease: 0.15, blocksToComplete: 15, minBlockWidth: 15 },
};

const OrangeStack: React.FC = () => {
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

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const blockIdRef = useRef(0);
  const currentBlockRef = useRef<Block | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  // Keep blocksRef in sync with blocks state
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const startGame = () => {
    const width = gameAreaRef.current?.offsetWidth || 300;
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: (width - INITIAL_WIDTH) / 2,
      width: INITIAL_WIDTH,
      y: 0,
    };

    const config = LEVEL_CONFIG[1];
    setBlocks([baseBlock]);
    setScore(0);
    setLevel(1);
    setLevelScore(0);
    setSpeed(config.startSpeed);
    setDirection(1);
    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');
  };

  const startNextLevel = () => {
    const width = gameAreaRef.current?.offsetWidth || 300;
    const newLevel = Math.min(level + 1, 3) as 1 | 2 | 3;
    const config = LEVEL_CONFIG[newLevel];

    // Reset blocks but keep a wider base for the new level
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: (width - INITIAL_WIDTH) / 2,
      width: INITIAL_WIDTH,
      y: 0,
    };

    setBlocks([baseBlock]);
    setLevel(newLevel);
    setLevelScore(0);
    setSpeed(config.startSpeed);
    setDirection(1);
    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');
  };

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
  }, []);

  const dropBlock = useCallback(() => {
    // Use refs for accurate position (avoids stale closure)
    const block = currentBlockRef.current;
    const currentBlocks = blocksRef.current;
    if (!block || gameState !== 'playing' || currentBlocks.length === 0) return;

    const config = LEVEL_CONFIG[level as 1 | 2 | 3];
    const lastBlock = currentBlocks[currentBlocks.length - 1];

    // Calculate overlap using ref for accurate current position
    const currentLeft = block.x;
    const currentRight = block.x + block.width;
    const lastLeft = lastBlock.x;
    const lastRight = lastBlock.x + lastBlock.width;

    const overlapLeft = Math.max(currentLeft, lastLeft);
    const overlapRight = Math.min(currentRight, lastRight);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      // No overlap - game over
      setGameState('gameover');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('orangeStackHighScore', String(score));
      }
      return;
    }

    // Create the new stacked block with trimmed width
    const newBlock: Block = {
      id: block.id,
      x: overlapLeft,
      width: overlapWidth,
      y: currentBlocks.length,
    };

    const newScore = score + 1;
    const newLevelScore = levelScore + 1;

    setBlocks(prev => [...prev, newBlock]);
    setScore(newScore);
    setLevelScore(newLevelScore);
    setSpeed(prev => prev + config.speedIncrease);

    // Check if block is too small
    if (overlapWidth < config.minBlockWidth) {
      setGameState('gameover');
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('orangeStackHighScore', String(newScore));
      }
      return;
    }

    // Check for level complete
    if (newLevelScore >= config.blocksToComplete) {
      if (level < 3) {
        setGameState('levelComplete');
      } else {
        // Won the game!
        setGameState('gameover');
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('orangeStackHighScore', String(newScore));
        }
      }
      return;
    }

    // Spawn next block
    spawnNewBlock(overlapWidth, overlapLeft);
  }, [gameState, score, levelScore, level, highScore, spawnNewBlock]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    const areaWidth = gameAreaRef.current?.offsetWidth || 300;

    const animate = () => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        let newX = prev.x + speed * direction;
        let newDirection = direction;

        // Bounce off walls
        if (newX + prev.width > areaWidth) {
          newX = areaWidth - prev.width;
          newDirection = -1;
          setDirection(-1);
        } else if (newX < 0) {
          newX = 0;
          newDirection = 1;
          setDirection(1);
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
  }, [gameState, currentBlock, speed, direction]);

  // Handle tap/click
  const handleTap = () => {
    if (gameState === 'playing') {
      dropBlock();
    }
  };

  // Calculate visible stack (show last ~10 blocks)
  const visibleBlocks = blocks.slice(-12);
  const stackOffset = Math.max(0, blocks.length - 10);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setShowInfo(true)}>
              <IonIcon icon={informationCircleOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Orange Stack</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="stack-content" scrollY={false}>
        {gameState === 'playing' && (
          <div className="stack-hud">
            <div className="hud-item">
              <span className="hud-label">Level</span>
              <span className="hud-value">{level}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Progress</span>
              <span className="hud-value">{levelScore}/{LEVEL_CONFIG[level as 1 | 2 | 3].blocksToComplete}</span>
            </div>
            <div className="hud-item">
              <span className="hud-label">Score</span>
              <span className="hud-value">{score}</span>
            </div>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="stack-area"
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        >
          {gameState === 'idle' && (
            <div className="game-menu">
              <div className="game-title">Orange Stack</div>
              <div className="game-emoji">&#x1F34A;</div>
              <p className="game-desc">Tap to stack oranges!</p>
              <p className="game-desc">Align perfectly for high scores</p>
              {highScore > 0 && (
                <p className="high-score">High Score: {highScore}</p>
              )}
              <IonButton onClick={startGame} className="play-btn">
                Play
              </IonButton>
            </div>
          )}

          {gameState === 'levelComplete' && (
            <div className="game-menu">
              <div className="game-title">Level {level} Complete!</div>
              <div className="final-score">
                <span className="score-label">Score</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="level-preview">
                <span className="level-next">Level {level + 1}</span>
                {level === 1 && (
                  <p className="level-hint">Blocks move faster now!</p>
                )}
                {level === 2 && (
                  <p className="level-hint">Final level - good luck!</p>
                )}
              </div>
              <IonButton onClick={startNextLevel} className="play-btn">
                Next Level
              </IonButton>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="game-menu">
              <div className="game-title">{level === 3 && levelScore >= LEVEL_CONFIG[3].blocksToComplete ? 'You Win!' : 'Game Over!'}</div>
              <div className="final-score">
                <span className="score-label">Final Score</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="level-reached">Level {level}</div>
              {score === highScore && score > 0 && (
                <div className="new-record">New Record!</div>
              )}
              <div className="high-score-display">
                Best: {highScore}
              </div>
              <IonButton onClick={startGame} className="play-btn">
                Play Again
              </IonButton>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="stack-container">
              {/* Moving block at top */}
              {currentBlock && (
                <div
                  className="stack-block moving"
                  style={{
                    left: currentBlock.x,
                    width: currentBlock.width,
                    bottom: (blocks.length - stackOffset) * BLOCK_HEIGHT + 50,
                  }}
                >
                  <span className="block-emoji">&#x1F34A;</span>
                </div>
              )}

              {/* Stacked blocks */}
              {visibleBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="stack-block stacked"
                  style={{
                    left: block.x,
                    width: block.width,
                    bottom: index * BLOCK_HEIGHT + 50,
                  }}
                />
              ))}

              {/* Ground */}
              <div className="stack-ground" />
            </div>
          )}

          {gameState === 'playing' && (
            <div className="tap-hint">Tap to drop!</div>
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
                <p><strong>Goal:</strong> Complete all 3 levels by stacking blocks!</p>
                <p><strong>Controls:</strong> Tap anywhere to drop the moving block.</p>
                <p><strong>Levels:</strong></p>
                <ul>
                  <li>Level 1: Slow speed, 8 blocks</li>
                  <li>Level 2: Medium speed, 10 blocks</li>
                  <li>Level 3: Fast speed, 15 blocks</li>
                </ul>
                <p><strong>Tips:</strong> Align precisely - overhang gets trimmed!</p>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrangeStack;
