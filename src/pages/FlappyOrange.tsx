// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack, volumeHigh, volumeMute } from 'ionicons/icons';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useGameHaptics } from '@/systems/haptics';
import { useLeaderboard } from '@/hooks/data/useLeaderboard';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useGameEffects, GameEffects } from '@/components/media';
import { ShareButton } from '@/systems/sharing';
import './FlappyOrange.css';

// ============================================
// PHYSICS CONSTANTS - Tuned for fun, forgiving gameplay
// ============================================
const PHYSICS = {
  GRAVITY: 0.35,           // Much gentler gravity (was 0.6)
  JUMP_VELOCITY: -8,       // Smoother jump (was -11)
  MAX_FALL_SPEED: 8,       // Slower max fall (was 15)
  ROTATION_SPEED: 0.06,    // Gentler rotation
};

const BIRD_RADIUS = 16;    // Slightly smaller hitbox (was 18)
const PIPE_WIDTH = 55;     // Slightly narrower pipes (was 60)
const PIPE_GAP = 200;      // Much wider gap to fly through (was 160)
const PIPE_SPACING = 280;  // More time between pipes (was 220)

// ============================================
// TYPES
// ============================================
interface Bird {
  y: number;
  velocity: number;
  rotation: number;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

type GameState = 'idle' | 'playing' | 'gameover';

// Sad images for game over screen
const SAD_IMAGES = Array.from({ length: 19 }, (_, i) => `/assets/Games/games_media/sad_runner_${i + 1}.png`);

// ============================================
// MAIN COMPONENT
// ============================================
const FlappyOrange: React.FC = () => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { playBlockLand, playPerfectBonus, playCombo, playGameOver, playGameStart } = useGameSounds();
  const { hapticScore, hapticCombo, hapticHighScore, hapticGameOver, hapticButton } = useGameHaptics();

  // Visual effects
  const {
    effects,
    triggerBigMoment,
    triggerConfetti,
    showEpicCallout,
    resetAllEffects,
  } = useGameEffects();

  // Leaderboard
  const {
    submitScore,
    isSignedIn,
    userDisplayName,
    isSubmitting,
  } = useLeaderboard('flappy-orange');

  // Canvas dimensions
  const CANVAS_WIDTH = isMobile ? Math.min(window.innerWidth, 500) : 500;
  const CANVAS_HEIGHT = isMobile ? Math.min(window.innerHeight - 120, 700) : 600;
  const BIRD_X = CANVAS_WIDTH * 0.25;

  // Game refs (to avoid stale closures in game loop)
  const gameStateRef = useRef<{
    bird: Bird;
    pipes: Pipe[];
    score: number;
    gameState: GameState;
    frameCount: number;
    stars: Array<{ x: number; y: number; size: number; twinkle: number }>;
  }>({
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 },
    pipes: [],
    score: 0,
    gameState: 'idle',
    frameCount: 0,
    stars: [],
  });

  // React state for UI
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappyOrangeHighScore') || '0', 10);
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [sadImage, setSadImage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('flappyOrangeSoundEnabled') !== 'false';
  });
  const [floatingScores, setFloatingScores] = useState<Array<{
    id: string;
    value: string;
    x: number;
    y: number;
  }>>([]);

  const gameStartTimeRef = useRef<number>(0);

  // Generate stars for night sky
  const generateStars = useCallback(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT * 0.6,
        size: Math.random() * 2 + 1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    return stars;
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('flappyOrangeSoundEnabled', String(newState));
    hapticButton();
  }, [soundEnabled, hapticButton]);

  // Show floating score
  const showFloatingScore = useCallback((value: string, x: number, y: number) => {
    const id = `score-${Date.now()}-${Math.random()}`;
    setFloatingScores(prev => [...prev, { id, value, x, y }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(s => s.id !== id));
    }, 800);
  }, []);

  // Generate pipe
  const generatePipe = useCallback((isFirst: boolean = false): Pipe => {
    // Gap positioned more towards center for easier gameplay
    const minGapY = PIPE_GAP / 2 + 100;
    const maxGapY = CANVAS_HEIGHT - PIPE_GAP / 2 - 100;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;

    return {
      // First pipe spawns further away to give player time to orient
      x: isFirst ? CANVAS_WIDTH + PIPE_WIDTH + 150 : CANVAS_WIDTH + PIPE_WIDTH,
      gapY,
      passed: false,
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Handle score point
  const onScorePoint = useCallback((newScore: number) => {
    setScore(newScore);

    // Show floating +1
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      showFloatingScore('+1', rect.left + BIRD_X + 40, rect.top + gameStateRef.current.bird.y);
    }

    // Sound and haptic for every point
    if (soundEnabled) playBlockLand();
    hapticScore();

    // Frequent small celebrations every 3 pipes
    if (newScore % 3 === 0 && newScore > 0 && newScore % 5 !== 0) {
      triggerBigMoment({
        shockwave: true,
        score: newScore,
        x: 50,
        y: 50,
      });
    }

    // Milestone effects every 5 pipes
    if (newScore % 5 === 0 && newScore > 0) {
      const callouts = ['NICE!', 'SWEET!', 'AWESOME!', 'SMOOTH!', 'FLYING HIGH!'];
      showEpicCallout(callouts[Math.floor(Math.random() * callouts.length)]);
      if (soundEnabled) playCombo(1);
      hapticCombo(1);
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        score: newScore,
        emoji: '🍊',
        x: 50,
        y: 50,
      });
    }

    // Bigger celebration every 10 pipes
    if (newScore % 10 === 0 && newScore > 0) {
      const callouts = ['SKY HIGH!', 'ON FIRE!', 'UNSTOPPABLE!', 'SOARING!'];
      showEpicCallout(callouts[Math.floor(Math.random() * callouts.length)]);
      if (soundEnabled) playPerfectBonus();
      hapticCombo(2);
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        score: newScore,
        emoji: '🔥',
        x: 50,
        y: 50,
      });
    }

    // Environment change celebration at 10 (sunset)
    if (newScore === 10) {
      showEpicCallout('🌅 SUNSET MODE!');
    }

    // Special milestone at 25
    if (newScore === 25) {
      showEpicCallout('🌙 NIGHT FLIGHT!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        score: newScore,
        emoji: '⭐',
        x: 50,
        y: 50,
      });
    }

    // Epic milestone at 50
    if (newScore === 50) {
      showEpicCallout('⛈️ STORM CHASER!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '⚡',
        x: 50,
        y: 50,
      });
    }

    // Legendary at 75
    if (newScore === 75) {
      showEpicCallout('🏆 LEGENDARY!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '🏆',
        x: 50,
        y: 50,
      });
    }

    // God mode at 100
    if (newScore === 100) {
      showEpicCallout('👑 ORANGE GOD!');
      if (soundEnabled) playPerfectBonus();
      hapticHighScore();
      triggerConfetti();
      triggerBigMoment({
        shockwave: true,
        sparks: true,
        vignette: true,
        shake: true,
        score: newScore,
        emoji: '👑',
        x: 50,
        y: 50,
      });
    }
  }, [soundEnabled, playBlockLand, playCombo, playPerfectBonus, hapticScore, hapticCombo, hapticHighScore, showFloatingScore, showEpicCallout, triggerBigMoment, triggerConfetti, BIRD_X]);

  // Handle game over
  const handleGameOver = useCallback(async () => {
    const state = gameStateRef.current;
    state.gameState = 'gameover';
    setGameState('gameover');

    if (soundEnabled) playGameOver();
    hapticGameOver();

    setSadImage(SAD_IMAGES[Math.floor(Math.random() * SAD_IMAGES.length)]);

    // Check high score
    if (state.score > highScore) {
      setHighScore(state.score);
      localStorage.setItem('flappyOrangeHighScore', String(state.score));
      setIsNewPersonalBest(true);
    }

    // Submit score
    if (isSignedIn && state.score > 0) {
      setScoreSubmitted(true);
      await submitScore(state.score, null, {
        playTime: Date.now() - gameStartTimeRef.current,
      });
    }
  }, [soundEnabled, playGameOver, hapticGameOver, highScore, isSignedIn, submitScore]);

  // Check collision
  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Ground collision - game over
    if (bird.y + BIRD_RADIUS > CANVAS_HEIGHT - 20) return true;

    // Ceiling - no longer instant death, handled in updateBird instead

    // Pipe collision
    for (const pipe of pipes) {
      if (pipe.x > BIRD_X + BIRD_RADIUS + PIPE_WIDTH || pipe.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
        continue;
      }

      const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
      const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;

      if (BIRD_X + BIRD_RADIUS > pipe.x && BIRD_X - BIRD_RADIUS < pipe.x + PIPE_WIDTH) {
        if (bird.y - BIRD_RADIUS < topPipeBottom || bird.y + BIRD_RADIUS > bottomPipeTop) {
          return true;
        }
      }
    }

    return false;
  }, [CANVAS_HEIGHT, BIRD_X]);

  // Update bird physics
  const updateBird = useCallback((bird: Bird): Bird => {
    let newVelocity = bird.velocity + PHYSICS.GRAVITY;

    // Cap falling speed
    if (newVelocity > PHYSICS.MAX_FALL_SPEED) {
      newVelocity = PHYSICS.MAX_FALL_SPEED;
    }

    let newY = bird.y + newVelocity;

    // Ceiling clamp - bird bounces off ceiling instead of dying
    if (newY - BIRD_RADIUS < 10) {
      newY = BIRD_RADIUS + 10;
      newVelocity = 0; // Stop upward momentum
    }

    // Smooth rotation based on velocity
    let newRotation = bird.rotation + (newVelocity > 0 ? PHYSICS.ROTATION_SPEED : -PHYSICS.ROTATION_SPEED * 2);
    newRotation = Math.max(-0.4, Math.min(newRotation, Math.PI / 3)); // Less extreme rotation

    return { y: newY, velocity: newVelocity, rotation: newRotation };
  }, []);

  // Update pipes
  const updatePipes = useCallback((pipes: Pipe[], currentScore: number): { pipes: Pipe[]; newScore: number } => {
    let newScore = currentScore;
    // Slower base speed, very gradual increase (was: 3 + floor(score/20) * 0.3)
    const speed = 2 + Math.floor(currentScore / 30) * 0.2;

    pipes.forEach(pipe => {
      pipe.x -= speed;
    });

    const filteredPipes = pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

    if (filteredPipes.length === 0 || filteredPipes[filteredPipes.length - 1].x < CANVAS_WIDTH - PIPE_SPACING) {
      // First pipe gets extra distance for grace period
      filteredPipes.push(generatePipe(filteredPipes.length === 0));
    }

    filteredPipes.forEach(pipe => {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
        pipe.passed = true;
        newScore++;
        onScorePoint(newScore);
      }
    });

    return { pipes: filteredPipes, newScore };
  }, [CANVAS_WIDTH, BIRD_X, generatePipe, onScorePoint]);

  // Draw background
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, currentScore: number, frameCount: number) => {
    let gradient: CanvasGradient;

    if (currentScore < 10) {
      // Day
      gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
    } else if (currentScore < 25) {
      // Sunset
      gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#FF6B00');
      gradient.addColorStop(0.4, '#FF8C33');
      gradient.addColorStop(1, '#FFD700');
    } else if (currentScore < 50) {
      // Night
      gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0D1B2A');
      gradient.addColorStop(1, '#1B263B');
    } else {
      // Storm
      gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#2C3E50');
      gradient.addColorStop(1, '#1A252F');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars for night
    if (currentScore >= 25 && currentScore < 50) {
      const state = gameStateRef.current;
      state.stars.forEach(star => {
        const twinkle = Math.sin(frameCount * 0.05 + star.twinkle) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + twinkle * 0.5})`;
        ctx.fill();
      });
    }

    // Draw ground
    ctx.fillStyle = currentScore >= 25 ? '#1a1a2e' : '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Ground grass/detail
    ctx.fillStyle = currentScore >= 25 ? '#2a2a3e' : '#228B22';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 5);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Draw bird
  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird) => {
    ctx.save();
    ctx.translate(BIRD_X, bird.y);
    ctx.rotate(bird.rotation);

    // Trail effect
    for (let i = 3; i > 0; i--) {
      const alpha = 0.15 - i * 0.04;
      const offset = i * 6;
      ctx.beginPath();
      ctx.arc(-offset, 0, BIRD_RADIUS - i * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 0, ${alpha})`;
      ctx.fill();
    }

    // Orange body
    const gradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, BIRD_RADIUS);
    gradient.addColorStop(0, '#FF8C33');
    gradient.addColorStop(0.7, '#FF6B00');
    gradient.addColorStop(1, '#CC5500');

    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = '#CC5500';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Orange texture lines
    ctx.strokeStyle = 'rgba(200, 80, 0, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * BIRD_RADIUS * 0.9, Math.sin(angle) * BIRD_RADIUS * 0.9);
      ctx.stroke();
    }

    // Highlight
    ctx.beginPath();
    ctx.arc(-4, -4, BIRD_RADIUS * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();

    // Leaf on top
    ctx.beginPath();
    ctx.ellipse(0, -BIRD_RADIUS - 4, 3, 7, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#228B22';
    ctx.fill();

    // Stem
    ctx.beginPath();
    ctx.moveTo(0, -BIRD_RADIUS);
    ctx.lineTo(0, -BIRD_RADIUS - 3);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye white
    ctx.beginPath();
    ctx.arc(7, -2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF';
    ctx.fill();

    // Eye pupil
    ctx.beginPath();
    ctx.arc(8, -2, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Eye shine
    ctx.beginPath();
    ctx.arc(9, -3, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF';
    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(-3, 4);
    ctx.rotate(-0.2 + Math.sin(Date.now() * 0.02) * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FF8533';
    ctx.fill();
    ctx.strokeStyle = '#CC5500';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }, [BIRD_X]);

  // Draw pipes
  const drawPipes = useCallback((ctx: CanvasRenderingContext2D, pipes: Pipe[], currentScore: number) => {
    const pipeColor = currentScore >= 25 ? '#2E7D32' : '#228B22';
    const capColor = currentScore >= 25 ? '#1B5E20' : '#1B5E20';

    pipes.forEach(pipe => {
      const topPipeBottom = pipe.gapY - PIPE_GAP / 2;
      const bottomPipeTop = pipe.gapY + PIPE_GAP / 2;

      // Top pipe body
      const topGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      topGradient.addColorStop(0, pipeColor);
      topGradient.addColorStop(0.5, '#2E7D32');
      topGradient.addColorStop(1, pipeColor);
      ctx.fillStyle = topGradient;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBottom);

      // Top pipe cap
      ctx.fillStyle = capColor;
      ctx.fillRect(pipe.x - 5, topPipeBottom - 25, PIPE_WIDTH + 10, 25);
      ctx.strokeStyle = '#145214';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x - 5, topPipeBottom - 25, PIPE_WIDTH + 10, 25);

      // Bottom pipe body
      ctx.fillStyle = topGradient;
      ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, CANVAS_HEIGHT - bottomPipeTop - 20);

      // Bottom pipe cap
      ctx.fillStyle = capColor;
      ctx.fillRect(pipe.x - 5, bottomPipeTop, PIPE_WIDTH + 10, 25);
      ctx.strokeStyle = '#145214';
      ctx.strokeRect(pipe.x - 5, bottomPipeTop, PIPE_WIDTH + 10, 25);
    });
  }, [CANVAS_HEIGHT]);

  // Draw score on canvas
  const drawScore = useCallback((ctx: CanvasRenderingContext2D, currentScore: number) => {
    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(String(currentScore), CANVAS_WIDTH / 2, 60);
    ctx.fillText(String(currentScore), CANVAS_WIDTH / 2, 60);
    ctx.restore();
  }, [CANVAS_WIDTH]);

  // Draw idle screen
  const drawIdleScreen = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF6B00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('Flappy Orange', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);
    ctx.fillText('Flappy Orange', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    // Tap instruction
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText('Tap to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText('Tap to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    // Animated tap indicator
    const bounce = Math.sin(Date.now() * 0.005) * 10;
    ctx.font = '30px Arial';
    ctx.fillText('👆', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70 + bounce);

    ctx.restore();
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // Jump function
  const jump = useCallback(() => {
    const state = gameStateRef.current;

    if (state.gameState === 'gameover') return;

    if (state.gameState === 'idle') {
      state.gameState = 'playing';
      state.stars = generateStars();
      gameStartTimeRef.current = Date.now();
      setGameState('playing');
      if (soundEnabled) playGameStart();
    }

    if (state.gameState === 'playing') {
      state.bird.velocity = PHYSICS.JUMP_VELOCITY;
      state.bird.rotation = -0.4;
      if (soundEnabled) playBlockLand();
      hapticButton();
    }
  }, [soundEnabled, playGameStart, playBlockLand, hapticButton, generateStars]);

  // Reset game
  const resetGame = useCallback(() => {
    gameStateRef.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 },
      pipes: [],
      score: 0,
      gameState: 'idle',
      frameCount: 0,
      stars: [],
    };
    setScore(0);
    setGameState('idle');
    setScoreSubmitted(false);
    setIsNewPersonalBest(false);
    setFloatingScores([]);
    resetAllEffects();
  }, [CANVAS_HEIGHT, resetAllEffects]);

  // Handle tap/click
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    if (gameStateRef.current.gameState === 'gameover') {
      resetGame();
      return;
    }

    jump();
  }, [jump, resetGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;

      // Update
      if (state.gameState === 'playing') {
        state.bird = updateBird(state.bird);
        const { pipes, newScore } = updatePipes(state.pipes, state.score);
        state.pipes = pipes;
        state.score = newScore;

        if (checkCollision(state.bird, state.pipes)) {
          handleGameOver();
        }
      }

      state.frameCount++;

      // Render
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBackground(ctx, state.score, state.frameCount);
      drawPipes(ctx, state.pipes, state.score);
      drawBird(ctx, state.bird);

      if (state.gameState === 'playing') {
        drawScore(ctx, state.score);
      }

      if (state.gameState === 'idle') {
        drawIdleScreen(ctx);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationId);
  }, [CANVAS_WIDTH, CANVAS_HEIGHT, updateBird, updatePipes, checkCollision, handleGameOver, drawBackground, drawPipes, drawBird, drawScore, drawIdleScreen]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div ref={containerRef} className={`flappy-container ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Control Buttons */}
      <button
        className="fo-back-btn"
        onClick={() => window.history.back()}
        aria-label="Back to games"
      >
        <IonIcon icon={arrowBack} />
      </button>

      <button
        className="fo-sound-btn"
        onClick={toggleSound}
        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        <IonIcon icon={soundEnabled ? volumeHigh : volumeMute} />
      </button>

      {/* Visual Effects */}
      <GameEffects effects={effects} accentColor="#ff6b00" />

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleTap}
        onTouchStart={handleTap}
        className="fo-canvas"
      />

      {/* Floating Scores */}
      {floatingScores.map(fs => (
        <div
          key={fs.id}
          className="fo-floating-score"
          style={{ left: fs.x, top: fs.y }}
        >
          {fs.value}
        </div>
      ))}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="fo-game-over-overlay">
          <div className="fo-game-over-content">
            <div className="fo-game-over-left">
              {sadImage ? (
                <img src={sadImage} alt="Game Over" className="fo-sad-image" />
              ) : (
                <div className="fo-game-over-emoji">🍊</div>
              )}
            </div>
            <div className="fo-game-over-right">
              <h2 className="fo-game-over-title">Game Over!</h2>

              <div className="fo-game-over-score">
                <span className="fo-score-value">{score}</span>
                <span className="fo-score-label">pipes passed</span>
              </div>

              <div className="fo-game-over-stats">
                <div className="fo-stat">
                  <span className="fo-stat-value">{highScore}</span>
                  <span className="fo-stat-label">best</span>
                </div>
              </div>

              {(isNewPersonalBest || score > highScore) && score > 0 && (
                <div className="fo-new-record">New Personal Best!</div>
              )}

              {isSignedIn && (
                <div className="fo-submitted">
                  {isSubmitting ? 'Saving...' : scoreSubmitted ? `Saved as ${userDisplayName}!` : ''}
                </div>
              )}

              <div className="fo-game-over-buttons">
                <button onClick={resetGame} className="fo-play-btn">
                  Play Again
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="fo-back-to-games-btn"
                >
                  Back to Games
                </button>
              </div>

              <ShareButton
                scoreData={{
                  gameId: 'flappy-orange',
                  gameName: 'Flappy Orange',
                  score,
                  highScore,
                  isNewHighScore: isNewPersonalBest || score > highScore,
                }}
                variant="button"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyOrange;
