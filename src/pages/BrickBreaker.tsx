/**
 * Brick Breaker Game
 *
 * Classic breakout-style game with powerups, level progression, and satisfying physics.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useGameEffects } from '@/components/media';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { LEVELS, generateRandomLevel } from './brickLevels';
import './BrickBreaker.css';

// =============================================================================
// TYPES
// =============================================================================

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  isFireball: boolean;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  baseWidth: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'strong' | 'unbreakable';
  hits: number;
}

type PowerupType = 'expand' | 'multiball' | 'fireball' | 'slow' | 'extralife';

interface Powerup {
  x: number;
  y: number;
  type: PowerupType;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
}

type GameStatus = 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameover';

// =============================================================================
// CONSTANTS
// =============================================================================

const DESKTOP_WIDTH = 650;
const DESKTOP_HEIGHT = 500;
const INITIAL_BALL_SPEED = 5;
const PADDLE_HEIGHT = 15;
const PADDLE_BASE_WIDTH = 100;
const BALL_RADIUS = 8;
const BRICK_HEIGHT = 25;
const BRICK_PADDING = 2;
const BRICK_TOP_OFFSET = 50;
const POWERUP_CHANCE = 0.15;
const POWERUP_SPEED = 2;
const POWERUP_RADIUS = 12;

const POWERUP_COLORS: Record<PowerupType, string> = {
  expand: '#00FF00',
  multiball: '#FF00FF',
  fireball: '#FF4400',
  slow: '#00FFFF',
  extralife: '#FF0000',
};

const POWERUP_ICONS: Record<PowerupType, string> = {
  expand: 'E',
  multiball: 'M',
  fireball: 'F',
  slow: 'S',
  extralife: '+',
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function BrickBreaker() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playWinSound } = useGameSounds();
  const { hapticScore, hapticGameOver, hapticCollision } = useGameHaptics();
  const {
    triggerScreenShake,
    triggerConfetti,
    showEpicCallout,
    addScorePopup,
  } = useGameEffects();
  const { submitScore, isSignedIn } = useLeaderboard('brick-breaker');

  // Game dimensions
  const [gameWidth, setGameWidth] = useState(DESKTOP_WIDTH);
  const [gameHeight, setGameHeight] = useState(DESKTOP_HEIGHT);

  // Game state refs (using refs to avoid re-renders in game loop)
  const ballsRef = useRef<Ball[]>([]);
  const paddleRef = useRef<Paddle>({
    x: 0,
    y: 0,
    width: PADDLE_BASE_WIDTH,
    height: PADDLE_HEIGHT,
    baseWidth: PADDLE_BASE_WIDTH,
  });
  const bricksRef = useRef<Brick[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const statusRef = useRef<GameStatus>('idle');
  const comboCountRef = useRef(0);
  const comboTimeoutRef = useRef<number | null>(null);
  const totalBricksDestroyedRef = useRef(0);
  const animationFrameRef = useRef<number>(0);

  // UI state (needs re-renders)
  const [score, setScore] = useState(0);
  const [, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // =============================================================================
  // GAME SETUP
  // =============================================================================

  const initializeBall = useCallback((width: number, height: number): Ball => {
    const angle = Math.PI / 4 + (Math.random() * Math.PI / 4); // 45-90 degrees
    const speed = INITIAL_BALL_SPEED * (1 + (levelRef.current - 1) * 0.05);
    return {
      x: width / 2,
      y: height - 80,
      vx: speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1),
      vy: -speed * Math.sin(angle),
      radius: BALL_RADIUS,
      speed,
      isFireball: false,
    };
  }, []);

  const loadLevel = useCallback((levelNum: number, width: number, height: number) => {
    levelRef.current = levelNum;
    setLevel(levelNum);

    // Get level data
    const levelData = levelNum <= LEVELS.length
      ? LEVELS[levelNum - 1]
      : generateRandomLevel(levelNum);

    // Calculate brick dimensions
    const brickWidth = (width - BRICK_PADDING * 2) / 10;

    // Create bricks
    const bricks: Brick[] = [];
    levelData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === 0) return;

        const brick: Brick = {
          x: BRICK_PADDING + colIndex * brickWidth,
          y: BRICK_TOP_OFFSET + rowIndex * (BRICK_HEIGHT + BRICK_PADDING),
          width: brickWidth - BRICK_PADDING,
          height: BRICK_HEIGHT - BRICK_PADDING,
          type: cell === 9 ? 'unbreakable' : cell === 2 ? 'strong' : 'normal',
          hits: cell === 9 ? 999 : cell === 2 ? 2 : 1,
        };
        bricks.push(brick);
      });
    });

    bricksRef.current = bricks;
    powerupsRef.current = [];
    particlesRef.current = [];

    // Reset paddle
    paddleRef.current = {
      x: width / 2 - PADDLE_BASE_WIDTH / 2,
      y: height - 30,
      width: PADDLE_BASE_WIDTH,
      height: PADDLE_HEIGHT,
      baseWidth: PADDLE_BASE_WIDTH,
    };

    // Create initial ball
    ballsRef.current = [initializeBall(width, height)];
  }, [initializeBall]);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    totalBricksDestroyedRef.current = 0;
    comboCountRef.current = 0;
    setScore(0);
    setLives(3);
    setIsNewHighScore(false);
    setSubmitted(false);

    loadLevel(1, gameWidth, gameHeight);
    statusRef.current = 'playing';
    setStatus('playing');
  }, [gameWidth, gameHeight, loadLevel]);

  // =============================================================================
  // COLLISION DETECTION
  // =============================================================================

  const checkWallCollision = useCallback((ball: Ball) => {
    // Left wall
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx = -ball.vx;
      if (soundEnabled) playBlockLand();
    }

    // Right wall
    if (ball.x + ball.radius > gameWidth) {
      ball.x = gameWidth - ball.radius;
      ball.vx = -ball.vx;
      if (soundEnabled) playBlockLand();
    }

    // Top wall
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy = -ball.vy;
      if (soundEnabled) playBlockLand();
    }
  }, [gameWidth, soundEnabled, playBlockLand]);

  const checkPaddleCollision = useCallback((ball: Ball) => {
    const paddle = paddleRef.current;

    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.width &&
      ball.vy > 0 // Only when moving downward
    ) {
      // Calculate hit position (0 = left, 1 = right)
      const hitPosition = (ball.x - paddle.x) / paddle.width;

      // Convert to angle: left = 150deg, center = 90deg, right = 30deg
      const minAngle = Math.PI / 6;
      const maxAngle = (Math.PI * 5) / 6;
      const angle = maxAngle - hitPosition * (maxAngle - minAngle);

      // Set new velocity
      ball.vx = ball.speed * Math.cos(angle);
      ball.vy = -ball.speed * Math.sin(angle);

      // Ensure ball is above paddle
      ball.y = paddle.y - ball.radius;

      if (soundEnabled) playBlockLand();
      hapticScore();
      triggerScreenShake(15);
    }
  }, [soundEnabled, playBlockLand, hapticScore, triggerScreenShake]);

  const checkBrickCollision = useCallback((ball: Ball): { hit: boolean; destroyed: boolean; brick: Brick | null } => {
    for (const brick of bricksRef.current) {
      if (brick.hits <= 0) continue;

      // AABB collision
      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        // Fireball goes through bricks
        if (!ball.isFireball) {
          // Determine collision side
          const overlapLeft = ball.x + ball.radius - brick.x;
          const overlapRight = brick.x + brick.width - (ball.x - ball.radius);
          const overlapTop = ball.y + ball.radius - brick.y;
          const overlapBottom = brick.y + brick.height - (ball.y - ball.radius);

          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);

          if (minOverlapX < minOverlapY) {
            ball.vx = -ball.vx;
          } else {
            ball.vy = -ball.vy;
          }
        }

        // Damage brick (unless unbreakable)
        if (brick.type !== 'unbreakable') {
          brick.hits--;

          if (brick.hits <= 0) {
            return { hit: true, destroyed: true, brick };
          }
          return { hit: true, destroyed: false, brick };
        }

        if (soundEnabled) playBlockLand();
        return { hit: true, destroyed: false, brick: null };
      }
    }

    return { hit: false, destroyed: false, brick: null };
  }, [soundEnabled, playBlockLand]);

  // =============================================================================
  // POWERUPS
  // =============================================================================

  const maybeSpawnPowerup = useCallback((brick: Brick) => {
    if (Math.random() < POWERUP_CHANCE) {
      const types: PowerupType[] = ['expand', 'multiball', 'fireball', 'slow', 'extralife'];
      const type = types[Math.floor(Math.random() * types.length)];

      powerupsRef.current.push({
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        type,
        vy: POWERUP_SPEED,
      });
    }
  }, []);

  const applyPowerup = useCallback((type: PowerupType) => {
    if (soundEnabled) playPerfectBonus();
    hapticCollision();
    showEpicCallout(type.toUpperCase() + '!');

    switch (type) {
      case 'expand':
        paddleRef.current.width = Math.min(200, paddleRef.current.width * 1.5);
        setTimeout(() => {
          paddleRef.current.width = paddleRef.current.baseWidth;
        }, 10000);
        break;

      case 'multiball':
        if (ballsRef.current.length > 0) {
          const ball = ballsRef.current[0];
          ballsRef.current.push({
            ...ball,
            vx: -ball.vx,
          });
          ballsRef.current.push({
            ...ball,
            vx: ball.vx * 0.5,
            vy: -ball.vy,
          });
        }
        break;

      case 'fireball':
        ballsRef.current.forEach((ball) => {
          ball.isFireball = true;
        });
        setTimeout(() => {
          ballsRef.current.forEach((ball) => {
            ball.isFireball = false;
          });
        }, 8000);
        break;

      case 'slow':
        ballsRef.current.forEach((ball) => {
          ball.speed *= 0.7;
          ball.vx *= 0.7;
          ball.vy *= 0.7;
        });
        setTimeout(() => {
          ballsRef.current.forEach((ball) => {
            ball.speed /= 0.7;
          });
        }, 8000);
        break;

      case 'extralife':
        livesRef.current++;
        setLives(livesRef.current);
        break;
    }
  }, [soundEnabled, playPerfectBonus, hapticCollision, showEpicCallout]);

  // =============================================================================
  // BRICK HIT HANDLING
  // =============================================================================

  const onBrickHit = useCallback((brick: Brick, destroyed: boolean) => {
    if (soundEnabled) playBlockLand();
    hapticScore();

    if (destroyed) {
      totalBricksDestroyedRef.current++;

      // Add points
      const points = brick.type === 'strong' ? 25 : 10;
      scoreRef.current += points;
      setScore(scoreRef.current);

      // Score popup
      scorePopupsRef.current.push({
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        text: `+${points}`,
        life: 1,
      });

      // Spawn particles
      const particleCount = 8;
      const color = brick.type === 'strong' ? '#FF4444' : '#FF6B00';
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        particlesRef.current.push({
          x: brick.x + brick.width / 2,
          y: brick.y + brick.height / 2,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          color,
          life: 1,
        });
      }

      // Maybe spawn powerup
      maybeSpawnPowerup(brick);

      // Combo tracking
      comboCountRef.current++;

      if (comboCountRef.current >= 3) {
        showEpicCallout(`COMBO x${comboCountRef.current}`);
        if (soundEnabled) playCombo(comboCountRef.current);
      }
      if (comboCountRef.current >= 5) {
        triggerScreenShake(25);
      }
      if (comboCountRef.current >= 10) {
        showEpicCallout('UNSTOPPABLE!');
        triggerConfetti();
      }

      // Reset combo after delay
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
      }
      comboTimeoutRef.current = window.setTimeout(() => {
        comboCountRef.current = 0;
      }, 500);
    }
  }, [soundEnabled, playBlockLand, playCombo, hapticScore, maybeSpawnPowerup, showEpicCallout, triggerScreenShake, triggerConfetti]);

  // =============================================================================
  // GAME STATE HANDLERS
  // =============================================================================

  const handleBallLost = useCallback(() => {
    livesRef.current--;
    setLives(livesRef.current);
    hapticGameOver();
    triggerScreenShake(30);

    if (livesRef.current <= 0) {
      handleGameOver();
    } else {
      // Respawn ball
      ballsRef.current = [initializeBall(gameWidth, gameHeight)];
    }
  }, [gameWidth, gameHeight, initializeBall, hapticGameOver, triggerScreenShake]);

  const handleLevelComplete = useCallback(() => {
    statusRef.current = 'levelComplete';
    setStatus('levelComplete');

    if (soundEnabled) playWinSound();
    hapticGameOver();
    showEpicCallout(`LEVEL ${levelRef.current} COMPLETE!`);
    triggerConfetti();

    // Life bonus
    const lifeBonus = livesRef.current * 100;
    scoreRef.current += lifeBonus;
    setScore(scoreRef.current);

    addScorePopup(`+${lifeBonus} LIFE BONUS`, gameWidth / 2, gameHeight / 2);

    setTimeout(() => {
      loadLevel(levelRef.current + 1, gameWidth, gameHeight);
      statusRef.current = 'playing';
      setStatus('playing');
    }, 2000);
  }, [gameWidth, gameHeight, soundEnabled, playWinSound, hapticGameOver, showEpicCallout, triggerConfetti, addScorePopup, loadLevel]);

  const handleGameOver = useCallback(async () => {
    statusRef.current = 'gameover';
    setStatus('gameover');

    if (soundEnabled) playGameOver();
    hapticGameOver();
    triggerScreenShake(40);

    // Submit score
    if (isSignedIn) {
      try {
        const result = await submitScore(scoreRef.current, levelRef.current, {
          highestLevel: levelRef.current,
          bricksDestroyed: totalBricksDestroyedRef.current,
        });
        if (result?.isNewHighScore) {
          setIsNewHighScore(true);
        }
        setSubmitted(true);
      } catch {
        // Ignore submission errors
      }
    }
  }, [soundEnabled, playGameOver, hapticGameOver, triggerScreenShake, isSignedIn, submitScore]);

  // =============================================================================
  // RENDERING
  // =============================================================================

  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Draw bricks
    bricksRef.current.forEach((brick) => {
      if (brick.hits <= 0) return;

      // Brick gradient
      const gradient = ctx.createLinearGradient(
        brick.x,
        brick.y,
        brick.x,
        brick.y + brick.height
      );

      if (brick.type === 'normal') {
        gradient.addColorStop(0, '#FF8533');
        gradient.addColorStop(1, '#FF6B00');
      } else if (brick.type === 'strong') {
        gradient.addColorStop(0, brick.hits === 2 ? '#FF6666' : '#FF3333');
        gradient.addColorStop(1, brick.hits === 2 ? '#FF4444' : '#CC0000');
      } else {
        gradient.addColorStop(0, '#666666');
        gradient.addColorStop(1, '#444444');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4);
      ctx.fill();

      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 3);

      // Crack effect for damaged strong bricks
      if (brick.type === 'strong' && brick.hits === 1) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(brick.x + brick.width * 0.3, brick.y);
        ctx.lineTo(brick.x + brick.width * 0.5, brick.y + brick.height * 0.5);
        ctx.lineTo(brick.x + brick.width * 0.7, brick.y + brick.height);
        ctx.stroke();
      }
    });

    // Draw paddle
    const paddle = paddleRef.current;
    const paddleGradient = ctx.createLinearGradient(
      paddle.x,
      paddle.y,
      paddle.x,
      paddle.y + paddle.height
    );
    paddleGradient.addColorStop(0, '#FF8533');
    paddleGradient.addColorStop(1, '#FF6B00');

    ctx.fillStyle = paddleGradient;
    ctx.shadowColor = '#FF6B00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw balls
    ballsRef.current.forEach((ball) => {
      // Trail effect
      const trailLength = 5;
      for (let i = trailLength; i > 0; i--) {
        const alpha = 0.15 * (1 - i / trailLength);
        ctx.beginPath();
        ctx.arc(
          ball.x - ball.vx * i * 0.5,
          ball.y - ball.vy * i * 0.5,
          Math.max(1, ball.radius - i),
          0,
          Math.PI * 2
        );
        ctx.fillStyle = ball.isFireball
          ? `rgba(255, 100, 0, ${alpha})`
          : `rgba(255, 107, 0, ${alpha})`;
        ctx.fill();
      }

      // Main ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

      if (ball.isFireball) {
        ctx.fillStyle = '#FF4400';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
      } else {
        ctx.fillStyle = '#FF6B00';
        ctx.shadowColor = '#FF6B00';
        ctx.shadowBlur = 10;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw powerups
    powerupsRef.current.forEach((powerup) => {
      ctx.beginPath();
      ctx.arc(powerup.x, powerup.y, POWERUP_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = POWERUP_COLORS[powerup.type];
      ctx.shadowColor = POWERUP_COLORS[powerup.type];
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWERUP_ICONS[powerup.type], powerup.x, powerup.y);
    });

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3 * particle.life, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw score popups
    scorePopupsRef.current.forEach((popup) => {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.globalAlpha = popup.life;
      ctx.fillText(popup.text, popup.x, popup.y - (1 - popup.life) * 30);
      ctx.globalAlpha = 1;
    });

    // Draw UI
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';

    // Score
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

    // Level
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${levelRef.current}`, gameWidth / 2, 30);

    // Lives
    ctx.textAlign = 'right';
    ctx.fillText(`${'❤️'.repeat(livesRef.current)}`, gameWidth - 10, 30);
  }, [gameWidth, gameHeight]);

  // =============================================================================
  // GAME LOOP
  // =============================================================================

  const gameLoop = useCallback(() => {
    if (statusRef.current !== 'playing') return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Update balls
    ballsRef.current.forEach((ball) => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      checkWallCollision(ball);
      checkPaddleCollision(ball);

      const { destroyed, brick } = checkBrickCollision(ball);
      if (brick) {
        onBrickHit(brick, destroyed);
      }
    });

    // Check for lost balls
    ballsRef.current = ballsRef.current.filter((ball) => ball.y - ball.radius <= gameHeight);

    if (ballsRef.current.length === 0) {
      handleBallLost();
    }

    // Update powerups
    powerupsRef.current.forEach((powerup) => {
      powerup.y += powerup.vy;
    });

    // Check powerup collision with paddle
    const paddle = paddleRef.current;
    powerupsRef.current = powerupsRef.current.filter((powerup) => {
      if (
        powerup.y + POWERUP_RADIUS >= paddle.y &&
        powerup.x >= paddle.x &&
        powerup.x <= paddle.x + paddle.width
      ) {
        applyPowerup(powerup.type);
        return false;
      }
      return powerup.y < gameHeight;
    });

    // Update particles
    particlesRef.current.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // Update score popups
    scorePopupsRef.current.forEach((popup) => {
      popup.life -= 0.02;
    });
    scorePopupsRef.current = scorePopupsRef.current.filter((p) => p.life > 0);

    // Check level complete
    const breakableBricks = bricksRef.current.filter(
      (b) => b.type !== 'unbreakable' && b.hits > 0
    );
    if (breakableBricks.length === 0) {
      handleLevelComplete();
      return;
    }

    // Render
    render(ctx);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameHeight,
    checkWallCollision,
    checkPaddleCollision,
    checkBrickCollision,
    onBrickHit,
    handleBallLost,
    handleLevelComplete,
    applyPowerup,
    render,
  ]);

  // =============================================================================
  // INPUT HANDLERS
  // =============================================================================

  const updatePaddlePosition = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const paddle = paddleRef.current;

    paddle.x = Math.max(
      0,
      Math.min(mouseX - paddle.width / 2, gameWidth - paddle.width)
    );
  }, [gameWidth]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePaddlePosition(e.clientX);
  }, [updatePaddlePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    updatePaddlePosition(e.touches[0].clientX);
  }, [updatePaddlePosition]);

  const handleCanvasClick = useCallback(() => {
    if (statusRef.current === 'idle') {
      startGame();
    }
  }, [startGame]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Set up game dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (isMobile && containerRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight - 105;
        setGameWidth(width);
        setGameHeight(height);
      } else {
        setGameWidth(DESKTOP_WIDTH);
        setGameHeight(DESKTOP_HEIGHT);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // Start game loop when playing
  useEffect(() => {
    if (status === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, gameLoop]);

  // Render idle screen
  useEffect(() => {
    if (status === 'idle') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, gameWidth, gameHeight);

      ctx.fillStyle = '#FF6B00';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('BRICK BREAKER', gameWidth / 2, gameHeight / 2 - 40);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '20px Arial';
      ctx.fillText('Tap or Click to Start', gameWidth / 2, gameHeight / 2 + 20);
    }
  }, [status, gameWidth, gameHeight]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div
      ref={containerRef}
      className={`brick-breaker-container ${isMobile ? 'mobile' : ''}`}
    >
      {/* Control buttons */}
      <button
        className="bb-back-btn"
        onClick={() => navigate('/games')}
        aria-label="Back to games"
      >
        ←
      </button>
      <button
        className="bb-sound-btn"
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-label={soundEnabled ? 'Mute' : 'Unmute'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>

      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        className="bb-canvas"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={handleCanvasClick}
      />

      {/* Game over overlay */}
      {status === 'gameover' && (
        <div className="bb-game-over-overlay">
          <div className="bb-game-over-content">
            <div className="bb-game-over-emoji">💥</div>
            <h2 className="bb-game-over-title">GAME OVER</h2>

            <div className="bb-game-over-score">
              <span className="bb-score-value">{score}</span>
              <span className="bb-score-label">Final Score</span>
            </div>

            <div className="bb-game-over-stats">
              <div className="bb-stat">
                <span className="bb-stat-value">{level}</span>
                <span className="bb-stat-label">Level</span>
              </div>
              <div className="bb-stat">
                <span className="bb-stat-value">{totalBricksDestroyedRef.current}</span>
                <span className="bb-stat-label">Bricks</span>
              </div>
            </div>

            {isNewHighScore && <div className="bb-new-record">NEW HIGH SCORE!</div>}
            {submitted && (
              <div className="bb-submitted">
                {isSignedIn ? 'Score submitted!' : 'Sign in to save scores'}
              </div>
            )}

            <div className="bb-game-over-buttons">
              <button className="bb-play-btn" onClick={startGame}>
                PLAY AGAIN
              </button>
              <button
                className="bb-back-to-games-btn"
                onClick={() => navigate('/games')}
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
