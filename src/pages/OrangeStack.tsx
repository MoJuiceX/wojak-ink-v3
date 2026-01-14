// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
} from '@ionic/react';
import { useGameSounds } from '@/hooks/useGameSounds';
import './OrangeStack.css';

interface Block {
  id: number;
  x: number;
  width: number;
  y: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}

const BLOCK_HEIGHT = 40;
const INITIAL_WIDTH = 160; // Wider blocks for easier start

// Sad images for game over screen (1-19)
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/games/sad_runner_${i + 1}.png`);

// Level configurations - easy to hard
const LEVEL_CONFIG = {
  1: { startSpeed: 1.5, speedIncrease: 0.05, blocksToComplete: 8, minBlockWidth: 40 },
  2: { startSpeed: 2.5, speedIncrease: 0.1, blocksToComplete: 10, minBlockWidth: 25 },
  3: { startSpeed: 3.5, speedIncrease: 0.15, blocksToComplete: 15, minBlockWidth: 15 },
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
};

const OrangeStack: React.FC = () => {
  const { playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver } = useGameSounds();

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('orangeStackLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });

  // Scoring state
  const [bounceCount, setBounceCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastDropBonus, setLastDropBonus] = useState('');
  const [sadImage, setSadImage] = useState('');

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const blockSpawnTimeRef = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);
  const blockIdRef = useRef(0);
  const currentBlockRef = useRef<Block | null>(null);
  const blocksRef = useRef<Block[]>([]);

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
    spawnNewBlock(baseBlock.width, baseBlock.x);
    setGameState('playing');
  };

  const startNextLevel = () => {
    const width = gameAreaRef.current?.offsetWidth || 300;
    const newLevel = Math.min(level + 1, 3) as 1 | 2 | 3;
    const config = LEVEL_CONFIG[newLevel];

    // Add level completion bonus
    const levelBonus = SCORING.levelBonus * level;
    setScore(prev => prev + levelBonus);

    // Reset blocks but keep a wider base for the new level
    const baseBlock: Block = {
      id: blockIdRef.current++,
      x: (width - INITIAL_WIDTH) / 2,
      width: INITIAL_WIDTH,
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

  const saveScore = () => {
    if (!playerName.trim() || score === 0) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score,
      level,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('orangeStackLeaderboard', JSON.stringify(updatedLeaderboard));
    setPlayerName('');
    goToMenu();
  };

  const goToMenu = () => {
    setGameState('idle');
    setPlayerName('');
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
    blockSpawnTimeRef.current = Date.now();
    setBounceCount(0); // Reset bounce count for new block
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
      playGameOver();
      setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);
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
    } else if (isNearPerfect) {
      dropPoints += SCORING.nearPerfectBonus;
      bonusText = 'Great! ';
      playBlockLand();
    } else {
      playBlockLand();
    }

    dropPoints += timeBonus;
    dropPoints -= bouncePenalty;
    dropPoints = Math.floor(dropPoints * comboMultiplier);
    dropPoints = Math.max(1, dropPoints); // Minimum 1 point

    if (newCombo >= 3) {
      bonusText += `${newCombo}x Combo!`;
      playCombo(newCombo);
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
    setSpeed(prev => prev + config.speedIncrease);

    // Check for level complete FIRST (before minBlockWidth check)
    if (newLevelScore >= config.blocksToComplete) {
      if (level < 3) {
        playWinSound();
        setGameState('levelComplete');
      } else {
        // Won the game! - no sad image for winners
        playWinSound();
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
  }, [gameState, score, levelScore, level, highScore, spawnNewBlock, bounceCount, combo, playBlockLand, playPerfectBonus, playCombo, playWinSound, playGameOver]);

  // Clear bonus text after a short time
  useEffect(() => {
    if (lastDropBonus) {
      const timer = setTimeout(() => setLastDropBonus(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastDropBonus]);

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentBlock) return;

    const areaWidth = gameAreaRef.current?.offsetWidth || 300;

    const animate = () => {
      setCurrentBlock(prev => {
        if (!prev) return prev;

        let newX = prev.x + speed * direction;
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
      <IonContent fullscreen className="stack-content" scrollY={false}>
        {gameState === 'playing' && (
          <>
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
              {combo >= 2 && (
                <div className="hud-item combo">
                  <span className="hud-label">Combo</span>
                  <span className="hud-value">{combo}x</span>
                </div>
              )}
            </div>
            {lastDropBonus && (
              <div className="drop-bonus">{lastDropBonus}</div>
            )}
          </>
        )}

        <div
          ref={gameAreaRef}
          className="stack-area"
          onClick={handleTap}
          onTouchStart={(e) => { e.preventDefault(); handleTap(); }}
        >
          {gameState === 'idle' && (
            <div className="game-menu-split">
              {/* Left side - Title and Play */}
              <div className="menu-left">
                <div className="game-title">Orange Stack</div>
                <img src="/assets/games/stack.png" alt="Orange Stack" className="game-image" />
                <p className="game-desc">Tap to stack oranges!</p>
                <p className="game-desc">Complete 3 levels to win!</p>
                <IonButton onClick={startGame} className="play-btn">
                  Play
                </IonButton>
              </div>

              {/* Right side - Leaderboard */}
              <div className="menu-right">
                <div className="leaderboard">
                  <h3 className="leaderboard-title">Leaderboard</h3>
                  <div className="leaderboard-list">
                    {Array.from({ length: 10 }, (_, index) => {
                      const entry = leaderboard[index];
                      return (
                        <div key={index} className="leaderboard-entry">
                          <span className="leaderboard-rank">#{index + 1}</span>
                          <span className="leaderboard-name">{entry?.name || '---'}</span>
                          <span className="leaderboard-score">{entry?.score || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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

              {/* Right side - Score and form */}
              <div className="game-over-right">
                <div className="game-over-title">{level === 3 && levelScore >= LEVEL_CONFIG[3].blocksToComplete ? 'You Win!' : 'Game Over!'}</div>
                <div className="game-over-reason">Reached Level {level}</div>
                <div className="game-over-score">
                  <span className="game-over-score-value">{score}</span>
                  <span className="game-over-score-label">total points</span>
                </div>

                {score > 0 ? (
                  <div className="game-over-form">
                    <input
                      type="text"
                      className="game-over-input"
                      placeholder="Enter your name"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      maxLength={15}
                      onKeyDown={(e) => e.key === 'Enter' && saveScore()}
                    />
                    <div className="game-over-buttons">
                      <button onClick={saveScore} className="game-over-save" disabled={!playerName.trim()}>
                        Save Score
                      </button>
                      <button onClick={goToMenu} className="game-over-skip">
                        Skip
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="game-over-buttons-single">
                    <IonButton onClick={startGame} className="play-btn">
                      Try Again
                    </IonButton>
                    <button onClick={goToMenu} className="game-over-skip">
                      Menu
                    </button>
                  </div>
                )}
              </div>
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

      </IonContent>
    </IonPage>
  );
};

export default OrangeStack;
