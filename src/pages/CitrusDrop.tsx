/**
 * Citrus Drop Game
 *
 * A Suika/Watermelon-style merge game with citrus theme.
 * Drop fruits that merge into larger fruits when matching types collide.
 * Uses Matter.js for realistic physics simulation.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useGameEffects } from '@/components/media';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useGameNavigationGuard } from '@/hooks/useGameNavigationGuard';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import './CitrusDrop.css';

const { Engine, World, Bodies, Body, Events } = Matter;

// ============================================
// CONSTANTS
// ============================================

type GameState = 'ready' | 'playing' | 'gameover';

interface Fruit {
  id: number;
  name: string;
  radius: number;
  color: string;
  points: number;
  emoji: string;
}

const FRUITS: Fruit[] = [
  { id: 0, name: 'seed', radius: 15, color: '#8B4513', points: 1, emoji: '🫘' },
  { id: 1, name: 'kumquat', radius: 20, color: '#FFA500', points: 3, emoji: '🍊' },
  { id: 2, name: 'clementine', radius: 28, color: '#FF8C00', points: 6, emoji: '🍊' },
  { id: 3, name: 'orange', radius: 38, color: '#FF6B00', points: 10, emoji: '🍊' },
  { id: 4, name: 'grapefruit', radius: 50, color: '#FF6347', points: 15, emoji: '🍊' },
  { id: 5, name: 'pomelo', radius: 65, color: '#FFFF00', points: 21, emoji: '🍈' },
  { id: 6, name: 'melon', radius: 80, color: '#90EE90', points: 28, emoji: '🍈' },
];

const WALL_THICKNESS = 15;
const GAME_OVER_LINE = 100;
const DROP_Y = 60;
const DROP_COOLDOWN = 500;

// ============================================
// EXTENDED MATTER BODY TYPES
// ============================================

interface FruitBody extends Matter.Body {
  fruitType: number;
  fruitId: string;
  aboveLineTime?: number | null;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// ============================================
// MAIN COMPONENT
// ============================================

const CitrusDrop: React.FC = () => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound hooks
  const { playBlockLand, playCombo, playPerfectBonus, playWinSound, playGameOver } =
    useGameSounds();
  const { hapticScore, hapticCollision, hapticGameOver } = useGameHaptics();
  const {
    triggerScreenShake,
    triggerConfetti,
    showEpicCallout,
    addScorePopup,
    triggerVignette,
  } = useGameEffects();
  const {
    leaderboard: globalLeaderboard,
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('citrus-drop');
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);

  // Game state (moved before useGameNavigationGuard to avoid initialization order issue)
  const [gameState, setGameState] = useState<GameState>('ready');

  // Navigation guard - prevents accidental exits during gameplay
  const { showExitDialog, confirmExit, cancelExit } = useGameNavigationGuard({
    isPlaying: gameState === 'playing',
  });

  // Game dimensions
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const [score, setScore] = useState(0);
  const [highestFruit, setHighestFruit] = useState(0);
  const [combo, setCombo] = useState(0);
  const [nextFruitType, setNextFruitType] = useState(0);
  const [dropX, setDropX] = useState(200);
  const [canDrop, setCanDrop] = useState(true);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs for physics
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const animationRef = useRef<number>(0);
  const mergedPairsRef = useRef<Set<string>>(new Set());
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const gameStartTimeRef = useRef<number>(0);
  const totalMergesRef = useRef<number>(0);

  // Refs to avoid stale closures
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const highestFruitRef = useRef(highestFruit);
  const comboRef = useRef(combo);

  // Ref for game loop to check dialog state
  const showExitDialogRef = useRef(false);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    highestFruitRef.current = highestFruit;
  }, [highestFruit]);
  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);
  useEffect(() => {
    showExitDialogRef.current = showExitDialog;
  }, [showExitDialog]);

  // Calculate dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (isMobile) {
        const width = Math.min(window.innerWidth - 20, 400);
        const height = Math.min(window.innerHeight - 180, 650);
        setDimensions({ width, height });
        setDropX(width / 2);
      } else {
        setDimensions({ width: 400, height: 600 });
        setDropX(200);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // ============================================
  // FRUIT CREATION
  // ============================================

  const createFruit = useCallback(
    (fruitType: number, x: number, y: number): FruitBody => {
      const fruit = FRUITS[fruitType];

      const body = Bodies.circle(x, y, fruit.radius, {
        restitution: 0.3,
        friction: 0.5,
        frictionAir: 0.01,
        density: 0.001,
        label: `fruit_${fruitType}`,
      }) as FruitBody;

      body.fruitType = fruitType;
      body.fruitId = `fruit-${Date.now()}-${Math.random()}`;
      body.aboveLineTime = null;

      return body;
    },
    []
  );

  // ============================================
  // MERGE EFFECTS
  // ============================================

  const triggerMergeEffects = useCallback(
    (fruitType: number, x: number, y: number) => {
      const fruit = FRUITS[fruitType];
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = rect.left + x;
      const screenY = rect.top + y;

      // Score popup
      addScorePopup(`+${fruit.points}`, screenX, screenY);

      // Sound + haptics based on tier
      if (soundEnabled) playBlockLand();

      if (fruitType >= 2) {
        triggerScreenShake(fruitType * 40);
        hapticScore();
      }

      if (fruitType >= 3) {
        showEpicCallout('NICE MERGE!');
        hapticCollision();
      }

      if (fruitType >= 4) {
        showEpicCallout('CITRUS MASTER!');
        triggerConfetti();
        if (soundEnabled) playCombo(fruitType);
        hapticGameOver();
      }

      if (fruitType >= 5) {
        showEpicCallout('POMELO POWER!');
        triggerVignette();
        if (soundEnabled) playPerfectBonus();
      }
    },
    [
      addScorePopup,
      triggerScreenShake,
      showEpicCallout,
      triggerConfetti,
      triggerVignette,
      playBlockLand,
      playCombo,
      playPerfectBonus,
      hapticScore,
      hapticCollision,
      hapticGameOver,
      soundEnabled,
    ]
  );

  // ============================================
  // MERGE FRUITS
  // ============================================

  const mergeFruits = useCallback(
    (fruitA: FruitBody, fruitB: FruitBody) => {
      const world = worldRef.current;
      if (!world) return;

      const fruitType = fruitA.fruitType;
      const nextType = fruitType + 1;

      // Calculate merge position
      const mergeX = (fruitA.position.x + fruitB.position.x) / 2;
      const mergeY = (fruitA.position.y + fruitB.position.y) / 2;

      // Remove old fruits
      World.remove(world, fruitA);
      World.remove(world, fruitB);

      // Add points
      const fruit = FRUITS[fruitType];
      setScore((prev) => prev + fruit.points);
      totalMergesRef.current++;

      // Trigger effects
      triggerMergeEffects(fruitType, mergeX, mergeY);

      // Update combo
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      setCombo((prev) => {
        const newCombo = prev + 1;
        if (newCombo === 3) showEpicCallout('COMBO x3!');
        if (newCombo === 5) {
          showEpicCallout('COMBO x5!');
          triggerConfetti();
        }
        if (newCombo === 10) {
          showEpicCallout('🔥 UNSTOPPABLE! 🔥');
          triggerConfetti();
          triggerVignette();
        }
        return newCombo;
      });
      comboTimeoutRef.current = setTimeout(() => setCombo(0), 2000);

      // Create new fruit (if not max level)
      if (nextType < FRUITS.length) {
        const newFruit = createFruit(nextType, mergeX, mergeY);

        // Inherit some velocity
        const avgVelocity = {
          x: (fruitA.velocity.x + fruitB.velocity.x) / 2,
          y: (fruitA.velocity.y + fruitB.velocity.y) / 2,
        };
        Body.setVelocity(newFruit, avgVelocity);

        World.add(world, newFruit);

        // Track highest fruit
        if (nextType > highestFruitRef.current) {
          setHighestFruit(nextType);
          if (nextType >= 4) {
            showEpicCallout(`${FRUITS[nextType].emoji} ${FRUITS[nextType].name.toUpperCase()}!`);
          }
        }
      } else {
        // Max level merge - bonus!
        setScore((prev) => prev + 100);
        showEpicCallout('🎉 MELON EXPLOSION! 🎉');
        triggerConfetti();
        triggerVignette();
        if (soundEnabled) playWinSound();
      }
    },
    [
      createFruit,
      triggerMergeEffects,
      showEpicCallout,
      triggerConfetti,
      triggerVignette,
      playWinSound,
      soundEnabled,
    ]
  );

  // ============================================
  // COLLISION SETUP
  // ============================================

  const setupCollisionEvents = useCallback(
    (engine: Matter.Engine) => {
      Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
          const bodyA = pair.bodyA as FruitBody;
          const bodyB = pair.bodyB as FruitBody;

          // Check if both are fruits
          if (
            !bodyA.label?.startsWith('fruit_') ||
            !bodyB.label?.startsWith('fruit_')
          ) {
            return;
          }

          // Check if same type
          if (bodyA.fruitType !== bodyB.fruitType) return;

          // Prevent duplicate merges
          const pairKey = [bodyA.fruitId, bodyB.fruitId].sort().join('-');
          if (mergedPairsRef.current.has(pairKey)) return;
          mergedPairsRef.current.add(pairKey);

          // Schedule merge (async to avoid physics issues)
          setTimeout(() => {
            mergeFruits(bodyA, bodyB);
            mergedPairsRef.current.delete(pairKey);
          }, 10);
        });
      });
    },
    [mergeFruits]
  );

  // ============================================
  // GAME OVER
  // ============================================

  const handleGameOver = useCallback(async () => {
    setGameState('gameover');
    if (soundEnabled) playGameOver();

    // Stop physics
    if (engineRef.current) {
      engineRef.current.enabled = false;
    }

    // Submit score
    if (isSignedIn) {
      try {
        const result = await submitScore(scoreRef.current, undefined, {
          highestFruit: FRUITS[highestFruitRef.current].name,
          totalMerges: totalMergesRef.current,
          playTime: Date.now() - gameStartTimeRef.current,
        });
        if (result?.isNewHighScore) {
          setIsNewRecord(true);
        }
        setSubmitted(true);
      } catch {
        // Ignore submission errors
      }
    }
  }, [playGameOver, submitScore, isSignedIn, soundEnabled]);

  // ============================================
  // GAME OVER CHECK
  // ============================================

  const checkGameOver = useCallback(() => {
    const world = worldRef.current;
    if (!world || gameStateRef.current !== 'playing') return;

    const fruits = world.bodies.filter((b) => b.label?.startsWith('fruit_'));

    for (const fruit of fruits) {
      const fruitBody = fruit as FruitBody;
      if (fruitBody.position.y < GAME_OVER_LINE) {
        if (!fruitBody.aboveLineTime) {
          fruitBody.aboveLineTime = Date.now();
        } else if (Date.now() - fruitBody.aboveLineTime > 2000) {
          handleGameOver();
          return;
        }
      } else {
        fruitBody.aboveLineTime = null;
      }
    }
  }, [handleGameOver]);

  // ============================================
  // RENDER
  // ============================================

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const world = worldRef.current;
    if (!canvas || !ctx || !world) return;

    const { width, height } = dimensions;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background - warm cream gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#FFF8DC');
    bgGradient.addColorStop(1, '#FFE4B5');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Game over line (dashed red)
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WALL_THICKNESS, GAME_OVER_LINE);
    ctx.lineTo(width - WALL_THICKNESS, GAME_OVER_LINE);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw walls (wood texture)
    const woodGradient = ctx.createLinearGradient(0, 0, WALL_THICKNESS, 0);
    woodGradient.addColorStop(0, '#8B4513');
    woodGradient.addColorStop(0.5, '#A0522D');
    woodGradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = woodGradient;

    // Left wall
    ctx.fillRect(0, 0, WALL_THICKNESS, height);
    // Right wall
    ctx.fillRect(width - WALL_THICKNESS, 0, WALL_THICKNESS, height);
    // Floor
    ctx.fillRect(0, height - WALL_THICKNESS, width, WALL_THICKNESS);

    // Draw fruits
    const fruits = world.bodies.filter((b) => b.label?.startsWith('fruit_'));
    fruits.forEach((body) => {
      const fruitBody = body as FruitBody;
      const fruit = FRUITS[fruitBody.fruitType];

      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      // Shadow
      ctx.beginPath();
      ctx.arc(3, 3, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fill();

      // Main fruit circle with gradient
      const fruitGradient = ctx.createRadialGradient(
        -fruit.radius * 0.3,
        -fruit.radius * 0.3,
        0,
        0,
        0,
        fruit.radius
      );
      fruitGradient.addColorStop(0, lightenColor(fruit.color, 40));
      fruitGradient.addColorStop(0.7, fruit.color);
      fruitGradient.addColorStop(1, darkenColor(fruit.color, 30));

      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = fruitGradient;
      ctx.fill();
      ctx.strokeStyle = darkenColor(fruit.color, 40);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.arc(
        -fruit.radius * 0.3,
        -fruit.radius * 0.3,
        fruit.radius * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();

      // Leaf (for citrus fruits 1-4)
      if (fruitBody.fruitType >= 1 && fruitBody.fruitType <= 4) {
        ctx.beginPath();
        ctx.ellipse(
          0,
          -fruit.radius * 0.85,
          fruit.radius * 0.12,
          fruit.radius * 0.25,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = '#228B22';
        ctx.fill();
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw drop preview
    if (gameStateRef.current === 'playing') {
      const fruit = FRUITS[nextFruitType];
      const previewX = dropX;

      // Ghost fruit
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(previewX, DROP_Y, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = fruit.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Drop line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(previewX, DROP_Y + fruit.radius);
      ctx.lineTo(previewX, height - WALL_THICKNESS);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [dimensions, nextFruitType, dropX]);

  // Helper to lighten color
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + percent);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
    const b = Math.min(255, (num & 0x0000ff) + percent);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  // ============================================
  // GAME LOOP
  // ============================================

  useEffect(() => {
    if (gameState !== 'playing') return;

    const { width, height } = dimensions;

    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: 1.2 },
    });
    engineRef.current = engine;
    worldRef.current = engine.world;

    // Create walls
    const wallOptions = {
      isStatic: true,
      friction: 0.3,
      restitution: 0.2,
    };

    const leftWall = Bodies.rectangle(
      WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height,
      wallOptions
    );

    const rightWall = Bodies.rectangle(
      width - WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height,
      wallOptions
    );

    const floor = Bodies.rectangle(
      width / 2,
      height - WALL_THICKNESS / 2,
      width,
      WALL_THICKNESS,
      wallOptions
    );

    World.add(engine.world, [leftWall, rightWall, floor]);

    // Setup collision detection
    setupCollisionEvents(engine);

    // Game loop
    const gameLoop = () => {
      if (engineRef.current?.enabled !== false && !showExitDialogRef.current) {
        Engine.update(engine, 1000 / 60);
        render();
        checkGameOver();
      }
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [gameState, dimensions, setupCollisionEvents, render, checkGameOver]);

  // ============================================
  // DROP FRUIT
  // ============================================

  const dropFruit = useCallback(() => {
    if (!canDrop || gameStateRef.current !== 'playing') return;

    const world = worldRef.current;
    if (!world) return;

    const fruit = createFruit(nextFruitType, dropX, DROP_Y);
    World.add(world, fruit);

    if (soundEnabled) playBlockLand();
    hapticScore();

    // Cooldown
    setCanDrop(false);
    setTimeout(() => setCanDrop(true), DROP_COOLDOWN);

    // Generate next fruit (random from first 5 types)
    setNextFruitType(Math.floor(Math.random() * 5));
  }, [canDrop, nextFruitType, dropX, createFruit, playBlockLand, hapticScore, soundEnabled]);

  // ============================================
  // INPUT HANDLERS
  // ============================================

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (gameState !== 'playing') return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;

      // Clamp to container bounds
      const fruit = FRUITS[nextFruitType];
      const minX = WALL_THICKNESS + fruit.radius;
      const maxX = dimensions.width - WALL_THICKNESS - fruit.radius;
      const clampedX = Math.max(minX, Math.min(x, maxX));

      setDropX(clampedX);
    },
    [gameState, nextFruitType, dimensions.width]
  );

  const handlePointerDown = useCallback(() => {
    if (gameState === 'playing') {
      dropFruit();
    }
  }, [gameState, dropFruit]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'ready' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        startGame();
      } else if (gameState === 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          dropFruit();
        } else if (e.code === 'ArrowLeft') {
          setDropX((prev) => {
            const fruit = FRUITS[nextFruitType];
            return Math.max(WALL_THICKNESS + fruit.radius, prev - 10);
          });
        } else if (e.code === 'ArrowRight') {
          setDropX((prev) => {
            const fruit = FRUITS[nextFruitType];
            return Math.min(dimensions.width - WALL_THICKNESS - fruit.radius, prev + 10);
          });
        }
      } else if (gameState === 'gameover' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, dropFruit, nextFruitType, dimensions.width]);

  // ============================================
  // GAME CONTROLS
  // ============================================

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setHighestFruit(0);
    setCombo(0);
    setNextFruitType(Math.floor(Math.random() * 5));
    setCanDrop(true);
    setIsNewRecord(false);
    setSubmitted(false);
    gameStartTimeRef.current = Date.now();
    totalMergesRef.current = 0;
    mergedPairsRef.current.clear();
  }, []);

  const resetGame = useCallback(() => {
    // Clear physics
    if (engineRef.current) {
      World.clear(engineRef.current.world, false);
      Engine.clear(engineRef.current);
      engineRef.current = null;
      worldRef.current = null;
    }
    startGame();
  }, [startGame]);

  const handleBack = useCallback(() => {
    window.location.href = '/games';
  }, []);

  // ============================================
  // RENDER UI
  // ============================================

  return (
    <div
      ref={containerRef}
      className={`citrus-drop-container ${isMobile ? 'mobile' : ''}`}
    >
      {/* Control Buttons */}
      <button className="cd-back-btn" onClick={handleBack} aria-label="Back to games">
        ←
      </button>
      <button
        className="cd-sound-btn"
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Score HUD */}
      {gameState === 'playing' && (
        <div className="cd-hud">
          <div className="cd-score">
            <span className="cd-score-label">SCORE</span>
            <span className="cd-score-value">{score}</span>
          </div>
          <div className="cd-next-fruit">
            <span className="cd-next-label">NEXT</span>
            <span className="cd-next-emoji">{FRUITS[nextFruitType].emoji}</span>
          </div>
          {combo >= 3 && (
            <div className="cd-combo">
              <span>🔥 x{combo}</span>
            </div>
          )}
        </div>
      )}

      {/* Ready Screen */}
      {gameState === 'ready' && (
        <div className="cd-ready-screen">
          <div className="cd-title">🍊 CITRUS DROP 🍊</div>
          <div className="cd-subtitle">Drop & Merge Fruits!</div>

          <div className="cd-fruit-preview">
            {FRUITS.map((fruit, i) => (
              <div key={i} className="cd-fruit-item">
                <span style={{ fontSize: `${12 + i * 4}px` }}>{fruit.emoji}</span>
                <span className="cd-fruit-name">{fruit.name}</span>
              </div>
            ))}
          </div>

          <button className="cd-play-btn" onClick={startGame}>
            TAP TO PLAY
          </button>

          <div className="cd-instructions">
            Move to position • Tap to drop • Match to merge!
          </div>
        </div>
      )}

      {/* Game Canvas */}
      {gameState === 'playing' && (
        <canvas
          ref={canvasRef}
          className="cd-canvas"
          width={dimensions.width}
          height={dimensions.height}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="cd-game-over-overlay" onClick={(e) => e.stopPropagation()}>
          {/* Main Game Over Content - stays fixed */}
          <div className="cd-game-over-content">
            <div className="cd-game-over-left">
              <span className="cd-game-over-emoji">
                {FRUITS[highestFruit].emoji}
              </span>
            </div>
            <div className="cd-game-over-right">
              <h2 className="cd-game-over-title">GAME OVER</h2>
              <div className="cd-game-over-score">
                <span className="cd-score-value">{score}</span>
                <span className="cd-score-label">POINTS</span>
              </div>
              <div className="cd-game-over-stats">
                <div className="cd-stat">
                  <span className="cd-stat-value">{FRUITS[highestFruit].name}</span>
                  <span className="cd-stat-label">Best Fruit</span>
                </div>
                <div className="cd-stat">
                  <span className="cd-stat-value">{totalMergesRef.current}</span>
                  <span className="cd-stat-label">Merges</span>
                </div>
              </div>
              {isNewRecord && <div className="cd-new-record">NEW RECORD!</div>}
              {isSignedIn && (
                <div className="cd-submitted">
                  {isSubmitting ? 'Saving...' : submitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}
              {/* Buttons: Play Again + Leaderboard */}
              <div className="cd-game-over-buttons">
                <button className="cd-play-btn" onClick={resetGame}>
                  Play Again
                </button>
                <button
                  onClick={() => setShowLeaderboardPanel(!showLeaderboardPanel)}
                  className="cd-leaderboard-btn"
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Panel - overlays on top */}
          {showLeaderboardPanel && (
            <div className="cd-leaderboard-overlay" onClick={() => setShowLeaderboardPanel(false)}>
              <div className="cd-leaderboard-panel" onClick={(e) => e.stopPropagation()}>
                <div className="cd-leaderboard-header">
                  <h3>Leaderboard</h3>
                  <button className="cd-leaderboard-close" onClick={() => setShowLeaderboardPanel(false)}>×</button>
                </div>
                <div className="cd-leaderboard-list">
                  {Array.from({ length: 10 }, (_, index) => {
                    const entry = globalLeaderboard[index];
                    const isCurrentUser = entry && score === entry.score;
                    return (
                      <div key={index} className={`cd-leaderboard-entry ${isCurrentUser ? 'current-user' : ''}`}>
                        <span className="cd-leaderboard-rank">#{index + 1}</span>
                        <span className="cd-leaderboard-name">{entry?.displayName || '---'}</span>
                        <span className="cd-leaderboard-score">{entry?.score ?? '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Back to Games - positioned in safe area (bottom right) */}
          <button
            onClick={handleBack}
            className="cd-back-to-games-btn"
          >
            Back to Games
          </button>
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
  );
};

export default CitrusDrop;
